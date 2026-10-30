/**
 * Memory-safety budget for canvas-based image tools.
 *
 * A hard cap protects every tab from decodes that would OOM the process,
 * while phones and clearly constrained devices get a stricter budget so
 * full-size canvases don't crash.
 */

export const MAX_PIXELS = 50_000_000; // 50 megapixels — hard reject above this
export const MAX_PIXELS_CONSTRAINED = 16_000_000; // 16 megapixels on weak devices

/** True when the device is a phone or has clearly constrained memory/cores. */
export function isConstrainedDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof mem === "number" && mem > 0 && mem < 4;
  const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
  const lowCores = cores > 0 && cores < 4;
  const mobile = /android|iphone|ipad|ipod|x11/i.test(navigator.userAgent);
  return mobile || lowMemory || lowCores;
}

/** Largest pixel budget this device can safely rasterize into a canvas. */
export function effectiveMaxPixels(): number {
  return isConstrainedDevice() ? MAX_PIXELS_CONSTRAINED : MAX_PIXELS;
}

/**
 * Clamp a target dimension pair to the device pixel budget. Returns the
 * original size unchanged when it already fits.
 */
export function safeCanvasSize(
  width: number,
  height: number
): { width: number; height: number; downscaled: boolean } {
  const safeW = Math.max(1, Math.round(width || 1));
  const safeH = Math.max(1, Math.round(height || 1));
  const cap = effectiveMaxPixels();
  const total = safeW * safeH;
  if (total <= cap) return { width: safeW, height: safeH, downscaled: false };
  const scale = Math.sqrt(cap / total);
  return {
    width: Math.max(1, Math.round(safeW * scale)),
    height: Math.max(1, Math.round(safeH * scale)),
    downscaled: true,
  };
}

/** Hard ceiling; throw a friendly error when the source exceeds it. */
export function assertWithinHardLimit(
  width: number,
  height: number,
  maxPixels: number = MAX_PIXELS
): void {
  if (width * height > maxPixels) {
    throw new Error(
      `This image is ${(width * height / 1_000_000).toFixed(1)} megapixels — too large to process here. Please use an image under ${Math.floor(maxPixels / 1_000_000)} MP.`
    );
  }
}