/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared types for the Font Finder / Identifier pipeline. This module is
 * import-safe under plain Node type stripping (no runtime imports) so the
 * pure matching core can be unit-tested without a browser.
 */

export type MatchTier = "likely" | "possible" | "similar" | "none";

/** Rectangle in normalized 0..1 image coordinates. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Measured characteristics of a cropped sample. */
export interface SampleSignals {
  /** OCR produced at least one letter. */
  hasText: boolean;
  charCount: number;
  uppercaseRatio: number;
  /** Share of ink pixels — proxy for stroke weight. */
  inkRatio: number;
  isCondensed: boolean;
  isWide: boolean;
  serifLikely: boolean;
  handwritingLikely: boolean;
  allCaps: boolean;
  /** Ink bounding-box size in sample px (0 when no ink). */
  inkWidthPx: number;
  inkHeightPx: number;
  /** Estimated text line count from horizontal projection (min 1). */
  lineCount: number;
  /** Standard deviation of sample luminance — low means flat contrast. */
  contrastStd: number;
}

/** Binary bitmap: data[y*w+x] is 1 for ink, 0 for background. */
export interface InkBitmap {
  w: number;
  h: number;
  data: Uint8Array;
}

/** Design classification used by the signal ranker. */
export interface FontClassification {
  serif?: boolean;
  sans?: boolean;
  display?: boolean;
  script?: boolean;
  monospace?: boolean;
  geometric?: boolean;
  humanist?: boolean;
  condensed?: boolean;
  wide?: boolean;
  highContrast?: boolean;
  lowContrast?: boolean;
  tallXHeight?: boolean;
  rounded?: boolean;
  angular?: boolean;
  connected?: boolean;
  /** 0=thin .. 9=black. Approximate default optical weight. */
  weightHint?: number;
}

/**
 * The subset of library-font fields the matcher needs. Structural (not an
 * import) so pure modules stay independent of the catalog module.
 */
export interface MatchableFont {
  id: string;
  family: string;
  category: string;
  free: boolean;
  /** Commercial/paid entries can only be glyph-compared when installed. */
  kind: "google" | "commercial";
  weights: number[];
  variable: boolean;
  condensed: boolean;
  expanded: boolean;
  tagPaths: string[];
  classification: FontClassification;
}

export interface RankedBySignals {
  font: MatchableFont;
  /** Signal-agreement score, 0..100 (internal — never shown to users). */
  signal: number;
  reasons: string[];
}

export interface MatchCandidate extends RankedBySignals {
  /** Glyph similarity 0..1 when compared, null for signal-only entries. */
  glyph: number | null;
  /** Blended ranking score, 0..100 (internal). */
  combined: number;
  tier: MatchTier;
}

export interface Verdict {
  tier: MatchTier;
  /** One honest sentence shown under the verdict badge. */
  reason: string;
}

/** Honest, calibrated user-facing tier labels (never percentages). */
export const TIER_LABELS: Record<MatchTier, string> = {
  likely: "LIKELY MATCH",
  possible: "POSSIBLE MATCH",
  similar: "SIMILAR FONT",
  none: "NO RELIABLE MATCH",
};
