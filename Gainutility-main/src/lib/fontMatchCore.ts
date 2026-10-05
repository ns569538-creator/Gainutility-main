/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure matching core for the Font Finder: signal scoring, bitmap similarity
 * and honest tier calibration. All scores here are internal; the UI only
 * ever shows the calibrated tier labels from fontDetectorTypes.
 */

import type {
  InkBitmap,
  MatchCandidate,
  MatchableFont,
  MatchTier,
  RankedBySignals,
  SampleSignals,
  Verdict,
} from "./fontDetectorTypes";

/**
 * Agreement score (0..100) between the measured sample signals and one
 * font's classification. This is a ranking heuristic, not a probability —
 * it is never displayed directly.
 */
export function signalScoreFor(
  font: MatchableFont,
  signals: SampleSignals,
): { score: number; reasons: string[] } {
  let score = 32;
  const reasons: string[] = [];
  const cl = font.classification;
  const hint = cl.weightHint ?? 4;

  // Stroke weight from ink density.
  if (signals.inkRatio > 0.32) {
    if (hint >= 6) {
      score += 12;
      reasons.push("Heavy / bold letterforms");
    }
  } else if (signals.inkRatio > 0.18) {
    if (hint >= 4 && hint <= 6) {
      score += 8;
      reasons.push("Balanced stroke weight");
    }
  } else if (signals.inkRatio < 0.16) {
    if (hint <= 3) {
      score += 10;
      reasons.push("Light hairline strokes");
    }
  }

  // Width class.
  if (signals.isCondensed && cl.condensed) {
    score += 12;
    reasons.push("Condensed proportions");
  }
  if (signals.isWide && (cl.wide || font.expanded)) {
    score += 11;
    reasons.push("Wide / expanded proportions");
  }

  // Serif vs sans construction.
  if (signals.serifLikely) {
    if (cl.serif) {
      score += 14;
      reasons.push("Serif terminals");
    } else if (cl.sans) {
      score -= 8;
    }
  } else if (signals.charCount >= 4 || signals.handwritingLikely) {
    if (cl.sans) {
      score += 9;
      reasons.push("Sans-serif construction");
    } else if (cl.serif) {
      score -= 6;
    }
  }

  // Connected script / display lettering.
  if (signals.handwritingLikely && (cl.script || cl.connected)) {
    score += 16;
    reasons.push("Connected script forms");
  }
  if (signals.allCaps && cl.display) {
    score += 12;
    reasons.push("Display / all-caps letterforms");
  }
  if (signals.allCaps && cl.script) score -= 10;

  // Geometric/rounded signals from official style tags when measured.
  if (cl.geometric && signals.allCaps && cl.display) score += 4;

  if (cl.monospace && !signals.charCount) score -= 5;

  score = Math.max(0, Math.min(98, score));
  return { score, reasons };
}

/** Rank the full library by signal agreement; keeps the top `limit`. */
export function rankBySignals(
  fonts: readonly MatchableFont[],
  signals: SampleSignals,
  limit: number,
): RankedBySignals[] {
  const scored = fonts.map((font) => {
    const { score, reasons } = signalScoreFor(font, signals);
    return { font, signal: score, reasons };
  });
  scored.sort(
    (a, b) =>
      b.signal - a.signal ||
      a.font.family.localeCompare(b.font.family),
  );
  return scored.slice(0, Math.max(0, limit));
}

/**
 * Shape similarity between two ink bitmaps (0..1). Each bitmap is bbox
 * cropped, resized to a fixed grid (shape proportions preserved inside the
 * grid) and compared with Dice overlap + centered cross-correlation; a
 * separate aspect-ratio term penalizes mismatched width/height balance.
 */
export function bitmapSimilarity(
  a: InkBitmap,
  b: InkBitmap,
): { dice: number; ncc: number; aspect: number; score: number } {
  const GRID_W = 128;
  const GRID_H = 96;
  const ca = cropToBBox(a);
  const cb = cropToBBox(b);
  if (!ca || !cb) {
    return { dice: 0, ncc: 0, aspect: 0, score: 0 };
  }

  const ra = ca.w / Math.max(1, ca.h);
  const rb = cb.w / Math.max(1, cb.h);
  // log-ratio penalty: a 2× aspect difference scores 0, 1.2× still ~0.7.
  const aspect = Math.max(
    0,
    1 - Math.abs(Math.log(ra / rb)) / Math.LN2,
  );

  const ga = resizeNearest(ca, GRID_W, GRID_H);
  const gb = resizeNearest(cb, GRID_W, GRID_H);

  let inter = 0;
  let countA = 0;
  let countB = 0;
  let sumA = 0;
  let sumB = 0;
  const n = GRID_W * GRID_H;
  for (let i = 0; i < n; i++) {
    const va = ga[i];
    const vb = gb[i];
    if (va) countA++;
    if (vb) countB++;
    if (va && vb) inter++;
    sumA += va;
    sumB += vb;
  }
  const dice = countA + countB > 0 ? (2 * inter) / (countA + countB) : 0;

  // Centered normalized cross-correlation on {0,1} grids.
  const meanA = sumA / n;
  const meanB = sumB / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = ga[i] - meanA;
    const db = gb[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const nccRaw =
    denA > 0 && denB > 0 ? num / Math.sqrt(denA * denB) : 0;
  const ncc = Math.max(0, nccRaw);

  const score = aspect * (0.55 * dice + 0.45 * ncc);
  return { dice, ncc, aspect, score };
}

function cropToBBox(bm: InkBitmap): InkBitmap | null {
  let minX = bm.w;
  let minY = bm.h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < bm.h; y++) {
    const row = y * bm.w;
    for (let x = 0; x < bm.w; x++) {
      if (bm.data[row + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const src = (y + minY) * bm.w + minX;
    data.set(bm.data.subarray(src, src + w), y * w);
  }
  return { w, h, data };
}

function resizeNearest(
  bm: InkBitmap,
  tw: number,
  th: number,
): Uint8Array {
  const out = new Uint8Array(tw * th);
  for (let y = 0; y < th; y++) {
    const sy = Math.min(bm.h - 1, Math.floor((y * bm.h) / th));
    const sRow = sy * bm.w;
    const dRow = y * tw;
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(bm.w - 1, Math.floor((x * bm.w) / tw));
      out[dRow + x] = bm.data[sRow + sx] ? 1 : 0;
    }
  }
  return out;
}

/** Blend glyph similarity and signal agreement into a ranking score. */
export function combineScores(glyph: number | null, signal: number): number {
  return glyph != null
    ? glyph * 100 * 0.6 + signal * 0.4
    : signal * 0.62;
}

export interface CalibrationContext {
  hasText: boolean;
  charCount: number;
}

/**
 * Calibrate honest tiers for candidates already sorted by `combined` desc.
 *
 * - LIKELY requires actual glyph comparison: similarity ≥ 0.62, a ≥0.05
 *   lead over the runner-up's similarity, enough OCR characters and a clear
 *   combined lead.
 * - POSSIBLE requires glyph ≥ 0.47, or (signal-only entries) very strong
 *   metadata agreement with a clear margin. Signal-only entries can never
 *   reach LIKELY.
 * - Everything else is SIMILAR (or the verdict drops to NO RELIABLE MATCH).
 */
export function calibrateTiers(
  candidates: readonly MatchCandidate[],
  ctx: CalibrationContext,
): void {
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const next = candidates[i + 1];
    const combinedLead = next ? c.combined - next.combined : Infinity;

    if (c.glyph != null) {
      const nextGlyph = next && next.glyph != null ? next.glyph : null;
      const glyphMargin =
        nextGlyph == null ? c.glyph : c.glyph - nextGlyph;
      if (
        ctx.hasText &&
        ctx.charCount >= 4 &&
        c.glyph >= 0.62 &&
        glyphMargin >= 0.05 &&
        c.combined >= 68 &&
        combinedLead >= 6
      ) {
        c.tier = "likely";
      } else if (c.glyph >= 0.47) {
        c.tier = "possible";
      } else {
        c.tier = "similar";
      }
    } else {
      const nextSignal = next ? next.signal : null;
      const signalMargin =
        nextSignal == null ? c.signal : c.signal - nextSignal;
      if (
        ctx.hasText &&
        ctx.charCount >= 4 &&
        c.signal >= 86 &&
        signalMargin >= 14
      ) {
        c.tier = "possible";
      } else {
        c.tier = "similar";
      }
    }
  }
}

const NO_MATCH: Verdict = {
  tier: "none",
  reason: "We couldn't find a close enough match for this sample.",
};

/** Headline verdict from the ranked, tier-calibrated candidate list. */
export function overallVerdict(
  candidates: readonly MatchCandidate[],
  ctx: CalibrationContext,
): Verdict {
  if (candidates.length === 0) return NO_MATCH;
  const top = candidates[0];

  if (top.tier === "likely") {
    return {
      tier: "likely",
      reason:
        "Strong agreement between the letterform comparison and the measured text signals.",
    };
  }
  if (top.tier === "possible") {
    return {
      tier: "possible",
      reason:
        "The candidate fits several measured characteristics, but the evidence isn't conclusive.",
    };
  }

  // SIMILAR: only if there is *some* positive evidence — a reasonably close
  // glyph comparison or decent signal agreement — otherwise report none.
  const glyphEvidence = top.glyph != null && top.glyph >= 0.4;
  const signalEvidence = top.signal >= 62;
  if (glyphEvidence || (ctx.hasText && signalEvidence)) {
    return {
      tier: "similar",
      reason:
        "No candidate matched closely — these fonts share some characteristics with your sample.",
    };
  }
  return NO_MATCH;
}

/** Pick the catalog weight closest to the measured ink density. */
export function pickWeight(
  weights: readonly number[],
  inkRatio: number,
): number {
  if (!weights.length) return 400;
  const target =
    inkRatio > 0.32 ? 700 : inkRatio > 0.18 ? 500 : inkRatio < 0.1 ? 300 : 400;
  let best = weights[0];
  let bestDist = Math.abs(best - target);
  for (const w of weights) {
    const d = Math.abs(w - target);
    if (d < bestDist) {
      best = w;
      bestDist = d;
    }
  }
  return best;
}
