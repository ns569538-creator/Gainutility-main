/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure pixel/ink operations for the font detector. No DOM access — safe to
 * import from Node for unit tests.
 */

import type { SampleSignals } from "./fontDetectorTypes";

export interface GrayImage {
  w: number;
  h: number;
  data: Uint8Array;
}

export interface InkBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  w: number;
  h: number;
}

/** Luminance (0..255) from RGBA bytes; ignores alpha (treated as opaque). */
export function grayFromRgba(
  px: Uint8ClampedArray | Uint8Array,
  out?: Uint8Array,
): Uint8Array {
  const n = (px.length / 4) | 0;
  const gray = out && out.length === n ? out : new Uint8Array(n);
  for (let i = 0, j = 0; j < n; i += 4, j++) {
    gray[j] = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
  }
  return gray;
}

/** In-place percentile contrast stretch (1.5th..98.5th). */
export function autoContrastStretch(gray: Uint8Array): void {
  if (gray.length === 0) return;
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  const loTarget = total * 0.015;
  const hiTarget = total * 0.985;
  let acc = 0;
  let lo = 0;
  let hi = 255;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= loTarget) {
      lo = v;
      break;
    }
  }
  acc = 0;
  for (let v = 255; v >= 0; v--) {
    acc += hist[v];
    if (acc >= total - hiTarget) {
      hi = v;
      break;
    }
  }
  if (hi - lo < 8) return;
  const scale = 255 / (hi - lo);
  for (let i = 0; i < gray.length; i++) {
    const v = (gray[i] - lo) * scale;
    gray[i] = v < 0 ? 0 : v > 255 ? 255 : v;
  }
}

export function contrastStd(gray: Uint8Array): number {
  if (gray.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / gray.length;
  let acc = 0;
  for (let i = 0; i < gray.length; i++) {
    const d = gray[i] - mean;
    acc += d * d;
  }
  return Math.sqrt(acc / gray.length);
}

/** Otsu's threshold over a 0..255 histogram of the gray image. */
export function otsuThreshold(gray: Uint8Array): number {
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let bestVar = -1;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > bestVar) {
      bestVar = between;
      best = t;
    }
  }
  return best || 128;
}

/**
 * Text-polarity binarization: text is assumed to cover the minority of the
 * sample, so whichever side (dark/light) has fewer pixels becomes ink. This
 * handles white-on-dark screenshots without an explicit invert control.
 */
export function inferPolarityInk(gray: Uint8Array): Uint8Array {
  const thr = otsuThreshold(gray);
  let dark = 0;
  // Otsu's classes are [0..thr] and [thr+1..255] — include the threshold
  // itself so a flat background value sitting exactly on thr counts.
  for (let i = 0; i < gray.length; i++) if (gray[i] <= thr) dark++;
  const darkIsInk = dark <= gray.length - dark;
  const ink = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    const isDark = gray[i] <= thr;
    if (isDark === darkIsInk) ink[i] = 1;
  }
  return ink;
}

/** Binarization for known dark-on-light renders (candidate glyph bitmaps). */
export function darkInk(gray: Uint8Array, threshold = 170): Uint8Array {
  const ink = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) if (gray[i] < threshold) ink[i] = 1;
  return ink;
}

export function inkBBox(ink: Uint8Array, w: number, h: number): InkBBox | null {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (ink[row + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function inkRatioOf(ink: Uint8Array): number {
  if (ink.length === 0) return 0;
  let count = 0;
  for (let i = 0; i < ink.length; i++) if (ink[i]) count++;
  return count / ink.length;
}

/** Filled rows inside the ink bbox → text line count (min 1). */
export function lineCountFromProjection(
  ink: Uint8Array,
  w: number,
  bbox: InkBBox,
): number {
  const rowNoise = Math.max(2, Math.floor(bbox.w * 0.01));
  let lines = 0;
  let inLine = false;
  for (let y = bbox.minY; y <= bbox.maxY; y++) {
    let filled = 0;
    const row = y * w;
    for (let x = bbox.minX; x <= bbox.maxX; x++) if (ink[row + x]) filled++;
    const isFilled = filled > rowNoise;
    if (isFilled && !inLine) {
      inLine = true;
      lines++;
    } else if (!isFilled) {
      inLine = false;
    }
  }
  return Math.max(1, lines);
}

/** Average horizontal ink runs per row over [y0..y1] inside the bbox. */
export function avgHorizontalRuns(
  ink: Uint8Array,
  w: number,
  bbox: InkBBox,
  y0: number,
  y1: number,
): number {
  if (y1 < y0) return 0;
  let runsSum = 0;
  let rows = 0;
  for (let y = y0; y <= y1; y++) {
    rows++;
    let inRun = false;
    let runs = 0;
    const row = y * w;
    for (let x = bbox.minX; x <= bbox.maxX; x++) {
      const on = ink[row + x] === 1;
      if (on && !inRun) {
        inRun = true;
        runs++;
      } else if (!on) {
        inRun = false;
      }
    }
    runsSum += runs;
  }
  return rows ? runsSum / rows : 0;
}

/**
 * Serif heuristic: serifs add short horizontal strokes near the baseline, so
 * the baseline band has more runs/row than the mid x-height band.
 */
export function serifFromBands(
  ink: Uint8Array,
  w: number,
  bbox: InkBBox,
  inkRatio: number,
): boolean {
  if (inkRatio <= 0.06 || inkRatio >= 0.55) return false;
  const midRuns = avgHorizontalRuns(
    ink,
    w,
    bbox,
    bbox.minY + Math.floor(bbox.h * 0.35),
    bbox.minY + Math.floor(bbox.h * 0.6),
  );
  const botRuns = avgHorizontalRuns(
    ink,
    w,
    bbox,
    bbox.minY + Math.floor(bbox.h * 0.72),
    bbox.minY + Math.floor(bbox.h * 0.92),
  );
  return midRuns > 0 && botRuns / midRuns > 1.45;
}

/**
 * Connected-script heuristic: long unbroken horizontal runs keep the
 * average runs/row low compared with sparse detached text.
 */
export function connectedFromRuns(
  ink: Uint8Array,
  w: number,
  bbox: InkBBox,
  inkRatio: number,
): boolean {
  if (inkRatio <= 0.02 || inkRatio >= 0.35) return false;
  const avg = avgHorizontalRuns(ink, w, bbox, bbox.minY, bbox.maxY);
  return avg > 0 && avg < 2.2;
}

/**
 * Build the full signal record from a binarized sample plus (optional) OCR
 * text. Width class uses advance-per-char relative to line height so it is
 * scale invariant.
 */
export function computeSampleSignals(
  ink: Uint8Array,
  gray: Uint8Array,
  w: number,
  h: number,
  ocrText: string,
): SampleSignals {
  const bbox = inkBBox(ink, w, h);
  const inkRatio = inkRatioOf(ink);
  const hasInk = bbox != null;
  const lineCount = hasInk ? lineCountFromProjection(ink, w, bbox) : 1;

  const letters = ocrText.replace(/[^a-zA-Z]/g, "");
  const capsMatch = ocrText.match(/[A-Z]/g);
  const caps = capsMatch ? capsMatch.length : 0;
  const uppercaseRatio = letters.length ? caps / letters.length : 0;
  const allCaps = letters.length > 2 && uppercaseRatio > 0.75;
  const charCount = letters.length;

  let isCondensed = false;
  let isWide = false;
  if (hasInk && charCount >= 4 && ocrText.length > 0) {
    const lineH = bbox.h / lineCount;
    const chars = Math.max(1, ocrText.length);
    const estW = (bbox.w * lineCount) / (chars * lineH);
    isCondensed = estW < 0.45;
    isWide = estW > 0.72;
  }

  return {
    hasText: charCount > 0,
    charCount,
    uppercaseRatio,
    inkRatio,
    isCondensed,
    isWide,
    serifLikely: hasInk && serifFromBands(ink, w, bbox, inkRatio),
    handwritingLikely: hasInk && connectedFromRuns(ink, w, bbox, inkRatio),
    allCaps,
    inkWidthPx: hasInk ? bbox.w : 0,
    inkHeightPx: hasInk ? bbox.h : 0,
    lineCount,
    contrastStd: contrastStd(gray),
  };
}

/**
 * Row projection → candidate text bands (fractions of full height).
 * Exported for unit tests; the DOM wrapper lives in textRegions.ts.
 */
export function bandsFromRowProjection(
  ink: Uint8Array,
  w: number,
  h: number,
): Array<{ y0: number; y1: number; density: number }> {
  const rowCounts = new Uint32Array(h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let c = 0;
    for (let x = 0; x < w; x++) if (ink[row + x]) c++;
    rowCounts[y] = c;
  }
  const thr = Math.max(2, Math.floor(w * 0.012));
  const bands: Array<{ y0: number; y1: number; density: number }> = [];
  let start = -1;
  let acc = 0;
  for (let y = 0; y <= h; y++) {
    const on = y < h && rowCounts[y] > thr;
    if (on) {
      if (start < 0) start = y;
      acc += rowCounts[y];
    } else if (start >= 0) {
      const height = y - start;
      if (height >= Math.max(8, Math.floor(h * 0.02))) {
        bands.push({
          y0: start,
          y1: y - 1,
          density: acc / (height * w || 1),
        });
      }
      start = -1;
      acc = 0;
    }
  }
  return bands;
}
