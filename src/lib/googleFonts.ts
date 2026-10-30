/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Google Fonts access layer for the Font Finder / Font Extractor tool.
 *
 * The font catalog is served entirely from the bundled local index in
 * `./fontCatalog`. There is no remote font-fetch Worker and no network
 * dependency for font metadata; the tool always works offline.
 */

import { FONTS, FontEntry, FontCategory } from "./fontCatalog";

export interface RemoteFontResponse {
  ok: boolean;
  error?: string;
  source: "local";
  count: number;
  fonts?: Array<{
    id: string;
    family: string;
    category: string;
    designers?: string;
    weights: number[];
    subsets: string[];
    license?: string;
    version?: string;
    source?: string;
  }>;
}

/**
 * Resolve fonts from the bundled local catalog. Never throws, never touches
 * the network.
 */
export async function fetchGoogleFonts(): Promise<RemoteFontResponse> {
  return {
    ok: true,
    source: "local",
    count: FONTS.length,
    fonts: FONTS.map((f) => ({
      id: f.id,
      family: f.family,
      category: f.category,
      designers: f.designers,
      weights: f.weights,
      subsets: f.subsets,
      license: f.license,
      source: f.source,
    })),
  };
}

/** Enriched font list (same shape as FontEntry, matching local details). */
export interface EnrichedFont extends FontEntry {
  /** Set when a commercial font was recognised and given free alternatives. */
  commercial?: boolean;
}

export async function getFonts(
  opts: {
    query?: string;
    categories?: FontCategory[];
    freeOnly?: boolean;
    commercialOnly?: boolean;
  } = {}
): Promise<EnrichedFont[]> {
  const q = (opts.query || "").trim().toLowerCase();
  const cats = opts.categories && opts.categories.length ? new Set(opts.categories) : null;

  return FONTS.filter((f) => {
    if (opts.freeOnly && !f.free) return false;
    if (opts.commercialOnly && f.free) return false;
    if (cats && !cats.has(f.category)) return false;
    if (!q) return true;
    return (
      f.family.toLowerCase().includes(q) ||
      f.designers.toLowerCase().includes(q) ||
      f.bestFor.toLowerCase().includes(q) ||
      f.traits.some((t) => t.toLowerCase().includes(q)) ||
      f.category.toLowerCase().includes(q)
    );
  });
}

/** Whether a remote font source is ready (informational). Always local now. */
export async function workerStatus(): Promise<{ ready: boolean; source: "worker" | "local" }> {
  return { ready: false, source: "local" };
}