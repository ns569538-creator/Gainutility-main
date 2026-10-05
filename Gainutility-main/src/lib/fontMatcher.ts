/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * End-to-end sample matching: decode the prepared crop → OCR text signals →
 * rank the full library → glyph-compare the top candidates against the
 * recognized text → calibrate honest tiers. DOM-dependent (canvas), so it is
 * exercised through the browser e2e run rather than the pure unit tests.
 */

import type {
  MatchCandidate,
  MatchTier,
  SampleSignals,
  Verdict,
} from "./fontDetectorTypes";
import type { LibraryFont } from "./fontCatalog";
import { analyzeSample } from "./imagePrep";
import {
  bitmapSimilarity,
  calibrateTiers,
  combineScores,
  overallVerdict,
  pickWeight,
  rankBySignals,
} from "./fontMatchCore";
import { darkInk, grayFromRgba } from "./pixelOps";
import { ensureFontReady } from "./fontLoader";
import { prepareMatchText } from "./fontMatcherText";
import type { InkBitmap } from "./fontDetectorTypes";

export { prepareMatchText } from "./fontMatcherText";

export interface MatchOutcome {
  verdict: Verdict;
  /** Top candidates, best first — includes tiers and honest reason chips. */
  candidates: MatchCandidate[];
  signals: SampleSignals;
  /** The OCR text the glyph comparison used ("" when unavailable). */
  ocrText: string;
  /** How many candidates were actually glyph-compared. */
  glyphCompared: number;
}

export interface MatchOptions {
  /** Full pool to search (the library + commercial entries). */
  pool: readonly LibraryFont[];
  onStage?: (stage: string, progress: number) => void;
  /** How many signal-ranked candidates enter the glyph stage. */
  glyphLimit?: number;
}

const GLYPH_CONCURRENCY = 3;

/**
 * Render one line-list candidate in a font to an ink bitmap at a fixed
 * height so line breaks mirror the sample's line count when possible.
 */
export function renderCandidateInk(
  lines: string[],
  font: LibraryFont,
  weight: number,
): InkBitmap | null {
  if (typeof document === "undefined") return null;
  const fontSize = 96;
  const lineHeight = Math.round(fontSize * 1.25);
  const canvas = document.createElement("canvas");
  const probe = canvas.getContext("2d");
  if (!probe) return null;

  const familyCss = `'${font.family}', ${font.category === "Serif" ? "serif" : font.category === "Monospace" ? "monospace" : font.category === "Script" || font.category === "Display" ? "cursive" : "sans-serif"}`;
  probe.font = `${weight} ${fontSize}px ${familyCss}`;

  let maxW = 1;
  for (const line of lines) {
    maxW = Math.max(maxW, Math.ceil(probe.measureText(line || " ").width));
  }
  canvas.width = Math.min(4096, maxW + 48);
  canvas.height = Math.min(4096, lines.length * lineHeight + 48);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.font = `${weight} ${fontSize}px ${familyCss}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  lines.forEach((line, i) => {
    ctx.fillText(line || " ", 24, 24 + lineHeight * i + lineHeight / 2);
  });

  const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const gray = grayFromRgba(px);
  const ink = darkInk(gray, 170);
  return { w: canvas.width, h: canvas.height, data: ink };
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    });
  await Promise.all(workers);
  return out;
}

/**
 * Full identification pipeline for one prepared sample data URL.
 * Never throws for weak input — returns an honest "none" verdict instead.
 */
export async function matchSample(
  sampleSrc: string,
  ocrText: string,
  opts: MatchOptions,
): Promise<MatchOutcome> {
  const { onStage, pool } = opts;
  const glyphLimit = opts.glyphLimit ?? 16;

  onStage?.("Analyzing letter shapes…", 50);
  const { signals } = await analyzeSample(sampleSrc, ocrText);

  onStage?.("Ranking font candidates…", 60);
  const ranked = rankBySignals(pool, signals, glyphLimit);

  const lines = prepareMatchText(ocrText, signals.allCaps);
  const glyphScores: Array<number | null> = new Array(ranked.length).fill(null);

  if (lines.length > 0) {
    onStage?.("Comparing glyph shapes…", 68);
    await mapLimit(ranked, GLYPH_CONCURRENCY, async (entry, i) => {
      const font = entry.font as LibraryFont;
      const weight = pickWeight(font.weights, signals.inkRatio);
      try {
        const ready = await ensureFontReady(font.family, font.weights);
        if (!ready) return; // stays signal-only
        const ink = renderCandidateInk(lines, font, weight);
        if (!ink) return;
        const sampleInk = (await inkFromSample(sampleSrc)) ?? null;
        if (!sampleInk) return;
        glyphScores[i] = bitmapSimilarity(sampleInk, ink).score;
      } catch {
        // Rendering/load failure → signal-only candidate.
      }
    });
    onStage?.("Calibrating results…", 90);
  }

  const candidates: MatchCandidate[] = ranked.map((r, i) => {
    const glyph = glyphScores[i];
    return {
      ...r,
      glyph,
      combined: combineScores(glyph, r.signal),
      tier: "similar" as MatchTier,
    };
  });
  candidates.sort((a, b) => b.combined - a.combined);

  const ctx = {
    hasText: signals.hasText && signals.charCount > 0,
    charCount: signals.charCount,
  };
  calibrateTiers(candidates, ctx);
  const verdict = overallVerdict(candidates, ctx);
  const top = candidates.slice(0, 8);
  const glyphCompared = candidates.filter((c) => c.glyph != null).length;

  return {
    verdict,
    candidates: top,
    signals,
    ocrText,
    glyphCompared,
  };
}

let sampleInkCache: { src: string; ink: InkBitmap | null } | null = null;

async function inkFromSample(src: string): Promise<InkBitmap | null> {
  if (sampleInkCache && sampleInkCache.src === src) return sampleInkCache.ink;
  try {
    const { ink, w, h } = await analyzeSample(src, "");
    const result: InkBitmap = { w, h, data: ink };
    sampleInkCache = { src, ink: result };
    return result;
  } catch {
    sampleInkCache = { src, ink: null };
    return null;
  }
}
