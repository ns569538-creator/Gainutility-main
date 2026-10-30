/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sample preprocessing for the Font Finder: crop, rotation, tonal controls,
 * auto-enhance, threshold and polarity handling. The heavy math lives in
 * the pure pixelOps module; this file adds async canvas decode.
 */

import type { Region } from "./fontDetectorTypes";
import {
  autoContrastStretch,
  computeSampleSignals,
  grayFromRgba,
  inferPolarityInk,
} from "./pixelOps.ts";
import type { SampleSignals } from "./fontDetectorTypes";

export interface PrepOptions {
  region: Region;
  rotation: number;
  brightness: number;
  contrast: number;
  autoEnhance: boolean;
  grayscale: boolean;
  /** Explicit binarization threshold (0..255) or null to skip. */
  threshold: number | null;
  invert: boolean;
  /** Unsharp amount 0..100. */
  sharpen: number;
}

export interface PreparedSample {
  dataUrl: string;
  width: number;
  height: number;
  /** Actionable advice when the sample looks hard to read, else null. */
  advice: string | null;
}

export function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

/** Crop/rotate/adjust the source image into the analysis sample data URL. */
export async function prepareSample(
  src: string,
  opts: PrepOptions,
): Promise<PreparedSample> {
  const img = await decodeImage(src);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const region = opts.region;

  const scale = Math.min(1, 1400 / Math.max(1, iw));
  const cropW = Math.max(48, Math.round(iw * region.w * scale));
  const cropH = Math.max(48, Math.round(ih * region.h * scale));
  const swap = opts.rotation % 180 !== 0;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? cropH : cropW;
  canvas.height = swap ? cropW : cropH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas ctx");

  const filters: string[] = [];
  if (opts.brightness !== 100) filters.push(`brightness(${opts.brightness / 100})`);
  if (opts.contrast !== 100) filters.push(`contrast(${opts.contrast / 100})`);
  if (opts.grayscale) filters.push("grayscale(1)");
  ctx.filter = filters.join(" ") || "none";

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((opts.rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  ctx.drawImage(
    img,
    iw * region.x,
    ih * region.y,
    iw * region.w,
    ih * region.h,
    0,
    0,
    cropW,
    cropH,
  );
  ctx.restore();
  ctx.filter = "none";

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = imageData.data;

  if (opts.autoEnhance) {
    const gray = grayFromRgba(px);
    autoContrastStretch(gray);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const v = gray[j];
      px[i] = px[i + 1] = px[i + 2] = v;
    }
  }
  if (opts.sharpen > 0) applySharpen(px, canvas.width, canvas.height, opts.sharpen / 100);
  if (opts.threshold != null) {
    const t = opts.threshold;
    for (let i = 0; i < px.length; i += 4) {
      const lum = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
      const v = lum < t ? 0 : 255;
      px[i] = px[i + 1] = px[i + 2] = v;
    }
  }
  if (opts.invert) {
    for (let i = 0; i < px.length; i += 4) {
      px[i] = 255 - px[i];
      px[i + 1] = 255 - px[i + 1];
      px[i + 2] = 255 - px[i + 2];
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const metrics = await sampleAdviceFromCanvas(canvas);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
    advice: metrics,
  };
}

/**
 * Decode a sample data URL (cap ~1100px) and build the measurement record
 * the matcher and signals panel share.
 */
export async function analyzeSample(
  src: string,
  ocrText: string,
): Promise<{ signals: SampleSignals; ink: Uint8Array; w: number; h: number }> {
  const img = await decodeImage(src);
  const scale = Math.min(1, 1100 / Math.max(1, img.naturalWidth));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas ctx");
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const gray = grayFromRgba(px);
  const ink = inferPolarityInk(gray);
  const signals = computeSampleSignals(ink, gray, w, h, ocrText);
  return { signals, ink, w, h };
}

async function sampleAdviceFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const gray = grayFromRgba(px);
    return computeAdvice(gray, canvas.width, canvas.height);
  } catch {
    return null;
  }
}

/** Honest, actionable hints shown before the user presses Identify. */
export function computeAdvice(
  gray: Uint8Array,
  w: number,
  h: number,
): string | null {
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / Math.max(1, gray.length);
  let acc = 0;
  for (let i = 0; i < gray.length; i++) {
    const d = gray[i] - mean;
    acc += d * d;
  }
  const std = Math.sqrt(acc / Math.max(1, gray.length));

  if (h < 40) {
    return "This crop is under ~40px tall — letters are probably too small to read reliably. Crop a larger text area.";
  }
  if (mean > 215) {
    return "The crop is almost entirely light — make sure the selection actually contains the letters.";
  }
  if (mean < 40) {
    return "The crop is almost entirely dark — if the text is light-on-dark, keep it as-is; polarity is detected automatically.";
  }
  if (std < 26) {
    return "The crop has very low contrast. Try raising Contrast, toggle Auto enhance, or pick a different text region.";
  }
  return null;
}

function applySharpen(
  px: Uint8ClampedArray,
  w: number,
  h: number,
  amount: number,
): void {
  if (w < 3 || h < 3 || amount <= 0) return;
  const src = new Uint8ClampedArray(px);
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let v = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            v += src[((y + dy) * w + (x + dx)) * 4 + c] * kernel[k++];
          }
        }
        px[idx + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  }
}
