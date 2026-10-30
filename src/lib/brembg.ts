/**
 * BEN2 Background Removal Engine
 *
 * Uses BEN2 (Background Erase Network) for AI-powered foreground segmentation.
 * Primary model:  onnx-community/BEN2-ONNX fp16   (MIT license)
 * Fallback model: Pezhgorski/BEN2-FP32-ONNX       (Apache-2.0, WASM-only devices)
 * Inference:      ONNX Runtime Web (WebGPU preferred, WASM fallback)
 *
 * All processing happens in the browser. No images are uploaded.
 * Model + WASM kernels are self-hosted via /api/br-assets/* (R2) with a
 * public-CDN fallback when the self-hosted assets are not configured.
 *
 * The module is Web Worker-safe: it never touches `document` directly and
 * prefers OffscreenCanvas so the whole pipeline can run off the main thread.
 *
 * @license SPDX-License-Identifier: MIT
 */

import * as ort from "onnxruntime-web";
import { detectBackend } from "./backgroundRemoverSupport";

/* ------------------------------------------------------------------ */
/* Configuration                                                        */
/* ------------------------------------------------------------------ */

const INPUT_SIZE = 1024;

/** ImageNet channel-wise normalization */
const MEAN: [number, number, number] = [0.485, 0.456, 0.406];
const STD: [number, number, number] = [0.229, 0.224, 0.225];

/** Self-hosted assets (R2-backed Pages Function). 404s fall back to CDNs. */
const BR_ASSETS_BASE = "/api/br-assets/";

const FP16_MODEL_URLS = [
  `${BR_ASSETS_BASE}ben2/onnx/model_fp16.onnx`,
  "https://huggingface.co/onnx-community/BEN2-ONNX/resolve/main/onnx/model_fp16.onnx",
];

/** fp32 fallback — used when the fp16 session cannot be created (no WebGPU). */
const FP32_MODEL_URLS = [
  `${BR_ASSETS_BASE}ben2-fp32/onnx/model.onnx`,
  "https://huggingface.co/Pezhgorski/BEN2-FP32-ONNX/resolve/main/onnx/model.onnx",
];

const WASM_SELF_PREFIX = `${BR_ASSETS_BASE}ort-wasm/`;

/** onnxruntime-web loads its WASM kernels from `env.wasm.wasmPaths`. */
const WASM_CDN_PREFIX = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/";

let wasmBackend = "";
let modelBackend = "fp16";

/** Cache Storage bucket holding the raw model bytes between page loads. */
const MODEL_CACHE_NAME = "gainutility-br-model-v1";

/* ------------------------------------------------------------------ */
/* Session cache                                                        */
/* ------------------------------------------------------------------ */

let cachedSession: ort.InferenceSession | null = null;
let loadingPromise: Promise<ort.InferenceSession> | null = null;

export type ProgressCallback = (stage: string, progress: number) => void;

/* ------------------------------------------------------------------ */
/* User-facing stage copy (no technical detail reaches the UI)          */
/* ------------------------------------------------------------------ */

const STAGE_READY = "Getting things ready…";
const STAGE_ANALYZE = "Removing background…";
const STAGE_REFINE = "Refining edges…";

/* ------------------------------------------------------------------ */
/* Canvas helpers (Web Worker-safe)                                     */
/* ------------------------------------------------------------------ */

interface CanvasLike {
  width: number;
  height: number;
}

function makeContext(
  width: number,
  height: number,
): { canvas: CanvasLike; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");
  return { canvas, context };
}

function createCanvas(width: number, height: number): any {
  if (typeof OffscreenCanvas !== "undefined") {
    const c = new OffscreenCanvas(width, height);
    return c;
  }
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }
  throw new Error("No canvas implementation available");
}

function sourceDims(source: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  if ("naturalWidth" in source && typeof (source as HTMLImageElement).naturalWidth === "number") {
    const img = source as HTMLImageElement;
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  const bmp = source as ImageBitmap;
  return { width: bmp.width, height: bmp.height };
}

function canvasToBlob(canvas: CanvasLike, type: string): Promise<Blob> {
  const anyCanvas = canvas as { convertToBlob?: (opts?: { type?: string; quality?: number }) => Promise<Blob>; toBlob?: (cb: (b: Blob | null) => void, type?: string, quality?: number) => void };
  if (typeof anyCanvas.convertToBlob === "function") {
    return anyCanvas.convertToBlob({ type });
  }
  return new Promise<Blob>((resolve, reject) => {
    anyCanvas.toBlob?.((b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))), type, 1);
  });
}

/* ------------------------------------------------------------------ */
/* WASM backend location (self-hosted preferred)                        */
/* ------------------------------------------------------------------ */

async function configureWasmPaths(): Promise<void> {
  if (wasmBackend) return;

  ort.env.wasm.wasmPaths = WASM_SELF_PREFIX;
  try {
    const res = await fetch(`${WASM_SELF_PREFIX}ort-wasm-simd-threaded.wasm`, { method: "HEAD", cache: "no-store" });
    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && !contentType.includes("text/html")) {
      wasmBackend = "self";
      return;
    }
  } catch {
    /* network error — fall through to CDN */
  }

  ort.env.wasm.wasmPaths = WASM_CDN_PREFIX;
  wasmBackend = "cdn";
}

export function getBackendInfo(): { wasm: string; model: string } {
  return { wasm: wasmBackend, model: modelBackend };
}

/* ------------------------------------------------------------------ */
/* Model loading (fp16 first, fp32 fallback)                            */
/* ------------------------------------------------------------------ */

async function fetchBlobWithProgress(url: string, onProgress?: ProgressCallback): Promise<ArrayBuffer> {
  const cached = await readModelFromCache(url);
  if (cached) {
    onProgress?.(STAGE_READY, 100);
    return cached;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download model (${response.status})`);

  // Guard against an SPA fallback returning index.html with HTTP 200.
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(`Model source unavailable (${url})`);
  }

  writeModelToCache(url, response);

  const contentLength = response.headers.get("Content-Length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    const buf = await response.arrayBuffer();
    onProgress?.(STAGE_READY, 100);
    return buf;
  }

  const reader = response.body.getReader();
  let receivedBytes = 0;
  const chunks: Uint8Array[] = [];

  // Allocate the destination once when the length is known instead of
  // accumulating chunks and merging them afterwards. Avoiding the second copy
  // roughly halves peak memory during a ~200 MB model download — significant
  // on low-memory phones where the download is most likely to stall or crash.
  let merged = totalBytes > 0 ? new Uint8Array(totalBytes) : null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (merged) {
      merged.set(value, receivedBytes);
    } else {
      chunks.push(value);
    }
    receivedBytes += value.length;
    if (totalBytes > 0) {
      const pct = Math.round((receivedBytes / totalBytes) * 100);
      onProgress?.(STAGE_READY, pct);
    } else {
      onProgress?.(STAGE_READY, -1);
    }
  }

  let buffer: ArrayBuffer;
  if (merged) {
    buffer = merged.buffer;
  } else {
    const joined = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.length;
    }
    buffer = joined.buffer;
  }

  onProgress?.(STAGE_READY, 100);
  return buffer;
}

/**
 * Read previously-downloaded model bytes from Cache Storage so first-time
 * downloads don't repeat on every page load. The browser HTTP cache is used
 * as well (R2 responses are `immutable`); this gives a second, explicit
 * persistence layer for large assets that HTTP caches are prone to evict.
 */
async function readModelFromCache(url: string): Promise<ArrayBuffer | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(MODEL_CACHE_NAME);
    const hit = await cache.match(url);
    if (hit && hit.ok) return await hit.arrayBuffer();
  } catch {
    /* cache unavailable — fall through to the network */
  }
  return null;
}

async function writeModelToCache(url: string, response: Response): Promise<void> {
  if (typeof caches === "undefined" || !response.ok) return;
  try {
    const cache = await caches.open(MODEL_CACHE_NAME);
    await cache.put(url, response.clone());
  } catch {
    /* store best-effort; the HTTP cache remains */
  }
}

async function fetchFirstAvailable(urls: string[], onProgress?: ProgressCallback): Promise<ArrayBuffer> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      return await fetchBlobWithProgress(url, onProgress);
    } catch (err) {
      lastError = err;
      onProgress?.(STAGE_READY, 0);
    }
  }
  throw lastError ?? new Error("No model source available");
}

async function createSession(buffer: ArrayBuffer): Promise<ort.InferenceSession> {
  return ort.InferenceSession.create(buffer, {
    executionProviders: ["webgpu", "wasm"],
    graphOptimizationLevel: "all",
  });
}

async function loadModel(onProgress?: ProgressCallback): Promise<ort.InferenceSession> {
  if (cachedSession) return cachedSession;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    onProgress?.(STAGE_READY, 0);
    await configureWasmPaths();

    // WebGPU required for fp16 inference — WASM backend does not reliably
    // support fp16, so skip the smaller fp16 model entirely when WebGPU is
    // unavailable.  This avoids downloading 219 MB only to fail session
    // creation and re-download a 422 MB fp32 fallback.
    const backend = await detectBackend();
    const hasWebGPU = backend === "webgpu";

    const fps = hasWebGPU ? FP16_MODEL_URLS : FP32_MODEL_URLS;
    const labels = hasWebGPU ? "fp16" : "fp32";
    const buffer = await fetchFirstAvailable(fps, onProgress);

    onProgress?.(STAGE_READY, 94);

    try {
      cachedSession = await createSession(buffer);
      modelBackend = labels;
    } catch (sessionErr) {
      // If the chosen variant fails (e.g. WASM finally rejects fp16
      // despite having WebGPU declared), try the other variant once.
      if (hasWebGPU) {
        console.warn(`[brembg] ${labels} session failed, retrying with fp32:`, sessionErr);
        onProgress?.(STAGE_READY, 1);
        const fallbackBuffer = await fetchFirstAvailable(FP32_MODEL_URLS, onProgress);
        cachedSession = await createSession(fallbackBuffer);
        modelBackend = "fp32";
      } else {
        throw sessionErr;
      }
    }

    onProgress?.("Done", 100);
    return cachedSession!;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Preprocessing                                                        */
/* ------------------------------------------------------------------ */

interface PreprocessedImage {
  tensor: ort.Tensor;
  originalWidth: number;
  originalHeight: number;
}

function preprocessImage(source: ImageBitmap | HTMLImageElement): PreprocessedImage {
  const { width: originalWidth, height: originalHeight } = sourceDims(source);

  const { canvas, context } = makeContext(INPUT_SIZE, INPUT_SIZE);

  context.fillStyle = "rgb(0, 0, 0)";
  context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);

  context.drawImage(source as any, 0, 0, INPUT_SIZE, INPUT_SIZE);

  const imageData = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const pixels = imageData.data;

  const channels = 3;
  const height = INPUT_SIZE;
  const width = INPUT_SIZE;
  const tensorData = new Float32Array(channels * height * width);

  for (let c = 0; c < channels; c++) {
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const pixelIdx = (h * width + w) * 4 + c;
        const normalized = (pixels[pixelIdx] / 255.0 - MEAN[c]) / STD[c];
        tensorData[c * height * width + h * width + w] = normalized;
      }
    }
  }

  const tensor = new ort.Tensor("float32", tensorData, [1, channels, height, width]);
  return { tensor, originalWidth, originalHeight };
}

/* ------------------------------------------------------------------ */
/* Postprocessing                                                       */
/* ------------------------------------------------------------------ */

function sigmoid(x: number): number {
  return 1.0 / (1.0 + Math.exp(-x));
}

function bilinearResize(
  src: Float32Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): Float32Array {
  const dst = new Float32Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    const srcYf = y * yRatio;
    const y0 = Math.floor(srcYf);
    const y1 = Math.min(y0 + 1, srcH - 1);
    const fy = srcYf - y0;

    for (let x = 0; x < dstW; x++) {
      const srcXf = x * xRatio;
      const x0 = Math.floor(srcXf);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const fx = srcXf - x0;

      const v00 = src[y0 * srcW + x0];
      const v10 = src[y0 * srcW + x1];
      const v01 = src[y1 * srcW + x0];
      const v11 = src[y1 * srcW + x1];

      dst[y * dstW + x] =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
    }
  }

  return dst;
}

/**
 * Convert the model's `alphas` output to a [0, 1] alpha mask.
 *
 * BEN2's ONNX head already produces sigmoided probabilities in [0, 1], so we
 * must NOT apply a second sigmoid (the transformers.js reference applies one
 * only if values fall outside [0, 1]; see image-segmentation.js, ORT#23943).
 * We mirror that adaptive check to stay correct if a model variant ever emits
 * raw logits instead.
 */
function postprocessOutput(
  output: ort.Tensor,
  originalWidth: number,
  originalHeight: number,
): Float32Array {
  const dims = output.dims;
  const data = output.data as Float32Array;

  const maskH = dims[2] ?? dims[1];
  const maskW = dims[3] ?? dims[2];
  const maskSize = maskH * maskW;

  // Values outside [0, 1] mean the output is raw logits → sigmoid required.
  const epsilon = 1e-5;
  let needsSigmoid = false;
  for (let i = 0; i < maskSize; i++) {
    if (data[i] < -epsilon || data[i] > 1 + epsilon) {
      needsSigmoid = true;
      break;
    }
  }

  const mask = new Float32Array(maskSize);
  for (let i = 0; i < maskSize; i++) {
    let v = needsSigmoid ? sigmoid(data[i]) : data[i];
    if (v < 0) v = 0;
    else if (v > 1) v = 1;
    mask[i] = v;
  }

  if (maskH === originalHeight && maskW === originalWidth) {
    return mask;
  }

  return bilinearResize(mask, maskW, maskH, originalWidth, originalHeight);
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export interface SegmentationResult {
  mask: Float32Array;
  width: number;
  height: number;
  inferenceMs: number;
}

/**
 * Run BEN2 foreground segmentation on an image source (ImageBitmap anywhere,
 * HTMLImageElement on the main thread).
 * Returns a per-pixel alpha mask (0 = background, 1 = foreground).
 */
export async function segmentForeground(
  source: ImageBitmap | HTMLImageElement,
  onProgress?: ProgressCallback,
): Promise<SegmentationResult> {
  const totalStart = performance.now();

  onProgress?.(STAGE_READY, 5);
  const session = await loadModel(onProgress);

  onProgress?.(STAGE_ANALYZE, 35);
  const { tensor, originalWidth, originalHeight } = preprocessImage(source);

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  onProgress?.(STAGE_ANALYZE, 50);
  const inferenceStart = performance.now();

  const feeds: Record<string, ort.Tensor> = {};
  feeds[inputName] = tensor;
  const results = await session.run(feeds);
  const output = results[outputName];

  const inferenceMs = performance.now() - inferenceStart;

  onProgress?.(STAGE_REFINE, 88);
  const mask = postprocessOutput(output, originalWidth, originalHeight);

  const totalMs = performance.now() - totalStart;
  console.log(`[brembg] backend=${modelBackend} total=${totalMs.toFixed(0)}ms inference=${inferenceMs.toFixed(0)}ms`);

  onProgress?.("Done", 100);

  return { mask, width: originalWidth, height: originalHeight, inferenceMs };
}

/**
 * Start loading the segmentation model without an image so subsequent
 * `segmentForeground` calls reuse the warm session. Safe to call repeatedly
 * (the in-flight / completed session is shared). Ran on the main thread this
 * performs the same work as a segment, minus bitmap handling.
 */
export async function preloadModel(onProgress?: ProgressCallback): Promise<ort.InferenceSession> {
  return loadModel(onProgress);
}

/**
 * Apply an alpha mask to an image source and resolve a transparent PNG data URL.
 * Runs off the main thread when used inside the background-remover worker.
 */
export async function applyMaskToImage(
  source: ImageBitmap | HTMLImageElement,
  mask: Float32Array,
  width: number,
  height: number,
): Promise<string> {
  const { canvas, context } = makeContext(width, height);

  context.drawImage(source as any, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < mask.length; i++) {
    data[i * 4 + 3] = Math.round(mask[i] * 255);
  }

  context.putImageData(imageData, 0, 0);

  const blob = await canvasToBlob(canvas, "image/png");
  return await blobToDataURL(blob);
}

async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to encode PNG"));
    reader.readAsDataURL(blob);
  });
}