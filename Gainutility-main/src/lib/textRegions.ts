/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Automatic text-region detection for the Font Finder: horizontal band
 * projection + vertical segmentation, returning normalized rectangles the
 * crop UI can adopt directly. Pure math lives here; the DOM wrapper decodes.
 */

import type { Region } from "./fontDetectorTypes";
import { autoContrastStretch, bandsFromRowProjection, grayFromRgba, inferPolarityInk } from "./pixelOps.ts";

export interface DetectedRegion extends Region {
  /** Relative quality hint (ink density × log area); higher is better. */
  score: number;
}

/**
 * Find text-heavy rectangles inside a binary ink map. Pure — unit tested
 * without a browser.
 */
export function findRegionsInInk(
  ink: Uint8Array,
  w: number,
  h: number,
  max: number,
): DetectedRegion[] {
  const bands = bandsFromRowProjection(ink, w, h);
  const regions: DetectedRegion[] = [];

  for (const band of bands) {
    const bandH = band.y1 - band.y0 + 1;
    // Column projection inside the band.
    const colCounts = new Uint32Array(w);
    for (let y = band.y0; y <= band.y1; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) if (ink[row + x]) colCounts[x]++;
    }
    const colThr = Math.max(1, Math.floor(bandH * 0.04));
    const gapMax = Math.max(6, Math.floor(w * 0.06));

    let segStart = -1;
    let gap = 0;
    const flush = (segEndExclusive: number) => {
      if (segStart < 0) return;
      const segW = segEndExclusive - segStart;
      if (segW >= Math.max(24, Math.floor(w * 0.06))) {
        let inkCount = 0;
        for (let y = band.y0; y <= band.y1; y++) {
          const row = y * w;
          for (let x = segStart; x < segEndExclusive; x++) if (ink[row + x]) inkCount++;
        }
        const density = inkCount / Math.max(1, segW * bandH);
        if (density > 0.02) {
          regions.push({
            x: segStart / w,
            y: band.y0 / h,
            w: segW / w,
            h: bandH / h,
            score: density * Math.log2(1 + segW * bandH),
          });
        }
      }
      segStart = -1;
    };

    for (let x = 0; x <= w; x++) {
      const on = x < w && colCounts[x] > colThr;
      if (on) {
        if (segStart < 0) segStart = x;
        gap = 0;
      } else if (segStart >= 0) {
        gap++;
        if (gap > gapMax) {
          flush(x - gap + 1);
          gap = 0;
        }
      }
    }
    flush(w);
  }

  // Merge vertically adjacent regions with heavy overlap (same line split).
  regions.sort((a, b) => a.y - b.y || a.x - b.x);
  const merged: DetectedRegion[] = [];
  for (const r of regions) {
    const prev = merged[merged.length - 1];
    if (prev) {
      const overlapY =
        Math.min(prev.y + prev.h, r.y + r.h) - Math.max(prev.y, r.y);
      const overlapX =
        Math.min(prev.x + prev.w, r.x + r.w) - Math.max(prev.x, r.x);
      if (overlapY > 0.6 * Math.min(prev.h, r.h) && overlapX > 0.5 * Math.min(prev.w, r.w)) {
        const x0 = Math.min(prev.x, r.x);
        const y0 = Math.min(prev.y, r.y);
        const x1 = Math.max(prev.x + prev.w, r.x + r.w);
        const y1 = Math.max(prev.y + prev.h, r.y + r.h);
        prev.x = x0;
        prev.y = y0;
        prev.w = x1 - x0;
        prev.h = y1 - y0;
        prev.score = Math.max(prev.score, r.score);
        continue;
      }
    }
    merged.push(r);
  }

  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, max);
}

/** Decode an image (capped) and detect text regions as 0..1 rectangles. */
export async function detectTextRegions(
  src: string,
  max = 6,
): Promise<DetectedRegion[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("image decode failed"));
    i.src = src;
  });
  const scale = Math.min(1, 900 / Math.max(1, img.naturalWidth));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas ctx");
  ctx.drawImage(img, 0, 0, w, h);
  const gray = grayFromRgba(ctx.getImageData(0, 0, w, h).data);
  autoContrastStretch(gray);
  const ink = inferPolarityInk(gray);
  return findRegionsInInk(ink, w, h, max);
}
