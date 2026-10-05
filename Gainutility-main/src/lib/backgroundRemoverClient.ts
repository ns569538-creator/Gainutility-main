/**
 * Background Remover client — runs segmentation off the main thread in a
 * Web Worker, falling back to direct (main-thread) execution if a Worker
 * cannot be created or errors out. All image data stays in the browser.
 *
 * The heavy segmentation engine (onnxruntime-web) is imported dynamically
 * only in the main-thread fallback paths (segmentImageDirect, warmUpModel
 * when no Worker exists). This keeps the main-thread chunk free of ORT's
 * JS bundle so the page never evaluates it unless the Worker path is
 * genuinely unavailable.
 */

import {
  isSupported,
  detectBackend,
} from "./backgroundRemoverSupport";
import type { ProgressCallback } from "./brembg";

export interface SegmentationOutcome {
  dataUrl: string;
  width: number;
  height: number;
  inferenceMs: number;
}

interface WorkerMalformedMessage {
  type?: string;
  id?: number;
  stage?: string;
  progress?: number;
  dataUrl?: string;
  width?: number;
  height?: number;
  inferenceMs?: number;
  message?: string;
}

let worker: Worker | null = null;
let nextRequestId = 1;
let inFlight: { id: number; onProgress: ProgressCallback; resolve: (v: SegmentationOutcome) => void; reject: (e: Error) => void } | null = null;

/**
 * Progress events from the worker are coalesced and delivered at most every
 * ~125 ms. The model download alone can emit thousands of events (one per
 * streamed chunk of a ~200 MB file); forwarding every one to React would
 * trigger a re-render storm on the main thread while the worker is busy.
 * Coalescing keeps the UI fluid without losing any stage information.
 */
const PROGRESS_INTERVAL_MS = 125;
let progressTimer: ReturnType<typeof setTimeout> | null = null;
let latestProgress: { stage: string; progress: number } | null = null;

function deliverLatestProgress(): void {
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
  }
  if (!latestProgress || !inFlight) return;
  const { stage, progress } = latestProgress;
  latestProgress = null;
  inFlight.onProgress(stage, progress);
}

function pushProgress(stage: string, progress: number): void {
  latestProgress = { stage, progress };
  if (progressTimer) return;
  progressTimer = setTimeout(deliverLatestProgress, PROGRESS_INTERVAL_MS);
}

function stopProgress(): void {
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
  }
  latestProgress = null;
}

function getWorker(): Worker | null {
  if (worker !== null) return worker;
  if (typeof Worker === "undefined") return null;
  try {
    worker = new Worker(new URL("./backgroundRemover.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<WorkerMalformedMessage>) => {
      const msg = event.data;
      if (!inFlight) return;
      if (msg.type === "progress" && typeof msg.stage === "string") {
        pushProgress(msg.stage, typeof msg.progress === "number" ? msg.progress : -1);
        return;
      }
      if (msg.type === "ok") {
        stopProgress();
        const current = inFlight;
        inFlight = null;
        current.resolve({
          dataUrl: String(msg.dataUrl),
          width: Number(msg.width) || 0,
          height: Number(msg.height) || 0,
          inferenceMs: Number(msg.inferenceMs) || 0,
        });
        return;
      }
      if (msg.type === "error") {
        stopProgress();
        const current = inFlight;
        inFlight = null;
        current.reject(new Error(String(msg.message || "Worker error")));
      }
    };
    worker.onerror = (err) => {
      stopProgress();
      const current = inFlight;
      inFlight = null;
      if (current) current.reject(new Error(err.message || "Worker crashed"));
      terminateWorker();
    };
    return worker;
  } catch {
    worker = null;
    return null;
  }
}

function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  inFlight = null;
}

/**
 * Abort the segmentation currently running in the worker, if any. The worker
 * is terminated outright because an in-flight ONNX session cannot be cancelled
 * cooperatively; terminating it releases the ~200 MB model session and the
 * in-progress mask immediately. The in-flight promise is rejected so the UI
 * can react (e.g. return to the ready state instead of showing an error).
 * Safe to call when nothing is running.
 */
export function cancelSegmentation(): void {
  if (!worker || !inFlight) return;
  const current = inFlight;
  inFlight = null;
  stopProgress();
  const err = new Error("Cancelled");
  err.name = "CancelError";
  current.reject(err);
  terminateWorker();
}

/**
 * Release all Background Remover resources: stop progress delivery, reject any
 * in-flight request and terminate the worker (freeing the loaded model session
 * and worker memory). Called when the tool unmounts so leaving the page never
 * leaves a multi-hundred-MB model pinned in memory.
 */
export function disposeBackgroundRemover(): void {
  stopProgress();
  if (inFlight) {
    const current = inFlight;
    inFlight = null;
    current.reject(new Error("Disposed"));
  }
  terminateWorker();
}

function segmentImageInWorker(
  bitmap: ImageBitmap,
  onProgress: ProgressCallback,
): Promise<SegmentationOutcome> {
  const w = getWorker();
  if (!w) return Promise.reject(new Error("Web Worker unavailable"));
  if (inFlight) return Promise.reject(new Error("Segmentation already running"));

  return new Promise<SegmentationOutcome>((resolve, reject) => {
    const id = nextRequestId++;
    inFlight = { id, onProgress, resolve, reject };
    w.postMessage({ type: "segment", id, bitmap }, [bitmap]);
  });
}

async function segmentImageDirect(
  bitmap: ImageBitmap,
  onProgress: ProgressCallback,
): Promise<SegmentationOutcome> {
  const totalStart = performance.now();
  const { segmentForeground, applyMaskToImage } = await import("./brembg");
  const { mask, width, height, inferenceMs } = await segmentForeground(bitmap, onProgress);
  onProgress("Refining edges…", 96);
  const dataUrl = await applyMaskToImage(bitmap, mask, width, height);
  onProgress("Done", 100);
  return { dataUrl, width, height, inferenceMs, };
}

/**
 * Start loading the segmentation model so the first "Remove Background" click
 * is fast. Safe to call any number of times — the worker and the model session
 * are singletons, so warm-up work is shared with the next real segmentation.
 */
export async function warmUpModel(): Promise<void> {
  if (typeof Worker !== "undefined") {
    const w = getWorker();
    if (w) {
      w.postMessage({ type: "warmup", id: nextRequestId++ });
      return;
    }
  }
  const { preloadModel } = await import("./brembg");
  await preloadModel();
}

/**
 * Segment the subject of an image and return a transparent PNG data URL.
 * Prefers off-thread (Web Worker) execution; falls back to the main thread
 * only when the Worker cannot be created or crashes (which destroys the
 * cached model session). Engine errors during processing do NOT fall back
 * to the main thread because that would re-download the model from scratch.
 */
export async function segmentImage(
  bitmap: ImageBitmap,
  onProgress: ProgressCallback,
): Promise<SegmentationOutcome> {
  if (typeof Worker !== "undefined") {
    const w = getWorker();
    if (w) {
      return segmentImageInWorker(bitmap, onProgress);
    }
  }
  return segmentImageDirect(bitmap, onProgress);
}

export { isSupported, detectBackend };
export type { ProgressCallback };