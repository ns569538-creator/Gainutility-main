/**
 * Lightweight capability probes for the Background Remover.
 *
 * Deliberately free of any onnxruntime-web import: the segmentation engine
 * lives in src/lib/brembg.ts and is only ever loaded on demand (main-thread
 * fallback path) or inside the Web Worker bundle. Importing ORT's JS bundle
 * statically on the main thread would evaluate it (and add it to the tool
 * chunk) the moment the page loads, even though real work happens in a
 * worker. Keeping these probes here means the main-thread chunk never loads
 * onnxruntime-web unless the worker-based path is actually unavailable.
 */

/**
 * Check if segmentation can potentially run in this environment.
 */
export function isSupported(): boolean {
  return (typeof window !== "undefined" && typeof document !== "undefined") || typeof self !== "undefined";
}

/**
 * Quick capability probe used before any large download: reports whether the
 * device can run the smaller fp16 model via WebGPU or must fall back to the
 * larger fp32 WASM variant. Never downloads anything.
 */
export async function detectBackend(): Promise<"webgpu" | "wasm"> {
  let hasWebGPU = false;
  try {
    const navigatorWithGpu = navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<{ label?: string } | null> };
    };
    if (typeof navigator !== "undefined" && navigatorWithGpu.gpu) {
      const adapter = await navigatorWithGpu.gpu.requestAdapter();
      hasWebGPU = !!adapter;
    }
  } catch {
    /* requestAdapter not supported — treat as no WebGPU */
  }
  return hasWebGPU ? "webgpu" : "wasm";
}