/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Name generation for the Stylish Name Generator. Deterministic per
 * (input, mode, seed) so re-renders are stable and the "Generate" button
 * can advance a seed for a fresh batch.
 */

import type { NameStyle } from "./styles.ts";
import { STYLES, STYLE_BY_ID, applyStyle } from "./styles.ts";
import { EMOJI_FLAT } from "./emojis.ts";

export type Mode = "stylish" | "nickname" | "emoji" | "aesthetic" | "gaming" | "cute" | "bio";

export interface ModeMeta {
  id: Mode;
  label: string;
}

export const MODES: ModeMeta[] = [
  { id: "stylish", label: "Stylish" },
  { id: "nickname", label: "Nickname" },
  { id: "emoji", label: "Emoji" },
  { id: "aesthetic", label: "Aesthetic" },
  { id: "gaming", label: "Gaming" },
  { id: "cute", label: "Cute" },
  { id: "bio", label: "Bio" },
];

export interface GeneratedName {
  text: string;
  styleId: string;
  styleName: string;
}

export interface GenerateOptions {
  /** Advance for a fresh batch; defaults to 0 (first render). */
  seed?: number;
  limit?: number;
}

const NICKNAME_FONT_IDS = new Set([
  "small-caps", "script", "circled", "fullwidth", "parenthesized",
  "bold", "sans-bold", "monospace", "double-struck",
]);

const NICKNAME_TRANSFORM_IDS = new Set(["spaced", "lowercase", "alt-caps"]);

const EMOJI_BASE_FONT_IDS = [
  "bold", "script", "small-caps", "circled", "fullwidth", "double-struck",
  "monospace", "sans-bold", "parenthesized", "fraktur",
];

const BIO_FONT_IDS = new Set([
  "bold", "sans", "sans-bold", "monospace", "small-caps", "spaced",
  "lowercase", "uppercase", "dotted",
]);

const BIO_WRAPPER_IDS = new Set([
  "square", "parens", "angle", "lenticular", "star-outline", "wave",
]);

/** Styles eligible for a mode (order preserved; generation shuffles within). */
export const stylesForMode = (mode: Mode): NameStyle[] => {
  switch (mode) {
    case "stylish":
      return STYLES;
    case "nickname":
      return STYLES.filter(
        (s) =>
          s.group === "wrapper" ||
          (s.group === "font" && NICKNAME_FONT_IDS.has(s.id)) ||
          (s.group === "spacing" && NICKNAME_TRANSFORM_IDS.has(s.id)) ||
          s.group === "preset"
      );
    case "emoji":
      return STYLES.filter(
        (s) => (s.group === "font" && EMOJI_BASE_FONT_IDS.includes(s.id)) || NICKNAME_TRANSFORM_IDS.has(s.id)
      );
    case "aesthetic":
      return STYLES.filter((s) => s.vibes.includes("aesthetic"));
    case "gaming":
      return STYLES.filter((s) => s.vibes.includes("gaming"));
    case "cute":
      return STYLES.filter((s) => s.vibes.includes("cute"));
    case "bio":
      return STYLES.filter(
        (s) =>
          s.compat === "good" &&
          ((s.group === "font" && BIO_FONT_IDS.has(s.id)) ||
            (s.group === "wrapper" && BIO_WRAPPER_IDS.has(s.id)) ||
            (s.group === "spacing" && s.id !== "reversed" && s.id !== "strikethrough"))
      );
  }
};

const fnv1a = (str: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => (): number => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const shuffle = <T>(items: T[], rng: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const decorateWithEmoji = (text: string, rng: () => number): string => {
  const emoji = EMOJI_FLAT[Math.floor(rng() * EMOJI_FLAT.length)];
  const pattern = Math.floor(rng() * 4);
  switch (pattern) {
    case 0:
      return `${emoji} ${text} ${emoji}`;
    case 1:
      return `${text} ${emoji}`;
    case 2:
      return `${emoji} ${text}`;
    default:
      return `${text}·${emoji}`;
  }
};

/**
 * Generate up to `limit` styled variations of `input` for `mode`.
 * Deterministic for (input, mode, seed).
 */
export const generateNames = (
  input: string,
  mode: Mode,
  opts: GenerateOptions = {}
): GeneratedName[] => {
  const base = input.trim();
  if (!base) return [];
  const limit = opts.limit ?? 24;
  const rng = mulberry32(fnv1a(`${base}|${mode}`) ^ (opts.seed ?? 0));
  const pool = stylesForMode(mode);
  const picked = shuffle(pool, rng).slice(0, limit);
  const out: GeneratedName[] = [];
  for (const style of picked) {
    let text = applyStyle(style, base);
    if (mode === "emoji") text = decorateWithEmoji(text, rng);
    out.push({ text, styleId: style.id, styleName: style.name });
  }
  return out;
};

/** Resolve a style id through presets (used by library pages/preview chips). */
export const previewWithStyle = (styleId: string, input: string): string => {
  const style = STYLE_BY_ID[styleId];
  return style ? applyStyle(style, input) : input;
};
