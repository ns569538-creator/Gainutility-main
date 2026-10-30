/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure parsing of PDF BaseFont names (e.g. "ABCDEF+Inter-Bold",
 * "HelveticaNeuePSMT", "TimesNewRomanPS-BoldItalic") into family + style.
 * No DOM — unit-testable under plain Node.
 */

export interface ParsedBaseFont {
  /** Original name as stored in the PDF. */
  raw: string;
  /** Subset tag such as "ABCDEF+" when present. */
  subset?: string;
  /** Family token(s) joined without spaces (e.g. "OpenSans"). */
  family: string;
  /** Humanized family (e.g. "Open Sans"). */
  familyPretty: string;
  /** Weight parsed from trailing style tokens (400 when absent). */
  weight: number;
  italic: boolean;
  /** Display label such as "Bold Italic" or "Regular". */
  style: string;
}

const WEIGHT_TOKENS: Record<string, number> = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  extrabold: 800,
  ultrabold: 800,
  semibold: 600,
  demibold: 600,
  light: 300,
  book: 400,
  regular: 400,
  normal: 400,
  roman: 400,
  medium: 500,
  bold: 700,
  black: 900,
  heavy: 900,
};

/** Compound weight prefixes: last-two-word lookups ("semi"+"bold"). */
const COMPOUND_PREFIXES = new Set([
  "semi",
  "demi",
  "extra",
  "ultra",
  "super",
  "half",
]);

const ITALIC_TOKENS = new Set(["italic", "it", "oblique", "i"]);

/** Trailing tokens that are producer noise, never family words. */
const NOISE_TOKENS = new Set([
  "psmt",
  "ps",
  "mt",
  "ttf",
  "otf",
  "type",
  "font",
  "std",
  "pro",
]);

/** Core-14 families (never embedded — supplied by the viewer). */
export const STANDARD_14 = new Set([
  "helvetica",
  "courier",
  "times",
  "symbol",
  "zapfdingbats",
  "couriernew",
  "timesnewroman",
  "helveticaneue",
]);

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

/** Split CamelCase / PascalCase runs into words ("IBMPlexSans" → 3 words). */
export function prettifyFamily(raw: string): string {
  return raw
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function parseBaseFont(rawName: string): ParsedBaseFont {
  const raw = String(rawName ?? "").trim();
  const subsetMatch = /^([A-Z]{2,8})\+/.exec(raw);
  const subset = subsetMatch ? `${subsetMatch[1]}+` : undefined;
  const body = subsetMatch ? raw.slice(subsetMatch[0].length) : raw;

  // Turn every producer's separator style into a flat word list:
  // "Inter-BoldItalic" → [Inter, Bold, Italic], "HelveticaNeuePSMT" → words.
  const words = prettifyFamily(body.replace(/[-\s_/]+/g, " "))
    .split(" ")
    .filter(Boolean);

  let weight = 400;
  let italic = false;

  // Peel trailing style/noise words; stop at the first word that looks like
  // a real family word so names such as "Blackwell" survive intact.
  for (;;) {
    if (words.length < 2) break;
    const last = norm(words[words.length - 1]);

    if (ITALIC_TOKENS.has(last)) {
      italic = true;
      words.pop();
      continue;
    }

    if (words.length >= 2) {
      const two = norm(words[words.length - 2]) + norm(words[words.length - 1]);
      const prefix = norm(words[words.length - 2]);
      if (COMPOUND_PREFIXES.has(prefix) && WEIGHT_TOKENS[two] !== undefined) {
        weight = WEIGHT_TOKENS[two];
        words.pop();
        words.pop();
        continue;
      }
    }

    if (WEIGHT_TOKENS[last] !== undefined) {
      weight = WEIGHT_TOKENS[last];
      words.pop();
      continue;
    }

    if (NOISE_TOKENS.has(last)) {
      words.pop();
      continue;
    }

    break;
  }

  // Single glued word that survived (no separators at all in the source):
  // peel a trailing style suffix from the CamelCase form.
  if (words.length === 1 && words[0] === prettifyFamily(body.replace(/[-\s_/]+/g, " "))) {
    const glued =
      /^(.*?)((?:semi|extra|ultra|deemi)?bold)?(italic)?$/i.exec(words[0]);
    if (glued && glued[1].length >= 3 && (glued[2] || glued[3])) {
      const wKey = (glued[2] ?? "").toLowerCase();
      if (wKey) weight = WEIGHT_TOKENS[wKey.replace(/italic$/, "") ?? wKey] ?? weight;
      if (glued[3]) italic = true;
      words[0] = glued[1];
    }
  }

  const family = words.join("") || "Unnamed";
  const familyPretty = words.join(" ") || "Unnamed";

  return {
    raw,
    subset,
    family,
    familyPretty,
    weight,
    italic,
    style: styleLabel(weight, italic),
  };
}

export function styleLabel(weight: number, italic: boolean): string {
  const base =
    WEIGHT_NAMES[weight] ?? (weight === 400 ? "Regular" : `${weight}`);
  if (italic) return weight === 400 ? "Italic" : `${base} Italic`;
  return base;
}

/** True when the name refers to one of the PDF core-14 families. */
export function isStandardFamily(familyPretty: string): boolean {
  const n = norm(familyPretty);
  for (const std of STANDARD_14) {
    if (n === std || n.startsWith(std)) return true;
  }
  return false;
}
