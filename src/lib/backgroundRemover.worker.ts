/**
 * Background Remover Web Worker
 *
 * Runs the BEN2 segmentation + PNG encoding pipeline off the main thread so
 * the UI never janks during model download, inference, or mask encoding.
 *
 * Protocol (main thread -> worker):
 *   { type: "segment", id: number, bitmap: ImageBitmap }   (bitmap transferred)
 *   { type: "warmup", id: number }                         (preload the model)
 * Protocol (worker -> main thread):
 *   { type: "progress", stage: string, progress: number }
 *   { type: "ok", id, dataUrl, width, height, inferenceMs }
 *   { type: "warm", id }
 *   { type: "error", id, message }
 */

import {
  segmentForeground,
  applyMaskToImage,
  preloadModel,
} from "./brembg";

interface SegmentRequest {
  type: "segment";
  id: number;
  bitmap: ImageBitmap;
}

interface WarmupRequest {
  type: "warmup";
  id: number;
}

interface ResultPayload {
  type: "ok";
  id: number;
  dataUrl: string;
  width: number;
  height: number;
  inferenceMs: number;
}

interface ErrorPayload {
  type: "error";
  id: number;
  message: string;
}

interface WarmPayload {
  type: "warm";
  id: number;
}

type ProgressPayload = { type: "progress"; stage: string; progress: number };

const scope = self as typeof globalThis & {
  onmessage: ((ev: MessageEvent) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

let busy = false;

const postProgress = (stage: string, progress: number) => {
  const payload: ProgressPayload = { type: "progress", stage, progress };
  scope.postMessage(payload);
};

scope.onmessage = async (event: MessageEvent<SegmentRequest | WarmupRequest>) => {
  const req = event.data;
  const id = req.id;

  // Warm-up: bring the model into memory without touching the busy guard, so
  // the model download overlaps the time the user spends on the upload screen.
  // Progress is emitted but the client ignores it while nothing is in flight.
  if (req.type === "warmup") {
    try {
      await preloadModel();
      const payload: WarmPayload = { type: "warm", id };
      scope.postMessage(payload);
    } catch (err) {
      const payload: ErrorPayload = {
        type: "error",
        id,
        message: err instanceof Error ? err.message : String(err),
      };
      scope.postMessage(payload);
    }
    return;
  }

  const bitmap = req.bitmap;

  try {
    if (busy) throw new Error("A segmentation is already running");
    busy = true;

    const report = (stage: string, progress: number) => postProgress(stage, progress);
    const { mask, width, height, inferenceMs } = await segmentForeground(bitmap, report);

    report("Refining edges…", 96);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const dataUrl = await applyMaskToImage(bitmap, mask, width, height);

    const payload: ResultPayload = { type: "ok", id, dataUrl, width, height, inferenceMs };
    scope.postMessage(payload);
  } catch (err) {
    const payload: ErrorPayload = {
      type: "error",
      id,
      message: err instanceof Error ? err.message : String(err),
    };
    scope.postMessage(payload);
  } finally {
    busy = false;
    if (typeof bitmap?.close === "function") bitmap.close();
  }
};