/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — pure color science.
 * DOM-free so it can be imported from the SEO/prerender pipeline.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/* ------------------------------------------------------------------ */
/* Parsing / formatting                                                */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;

export const isHex = (value: string): boolean => HEX_RE.test(value.trim());

/** Normalize any accepted hex to `#RRGGBB` (uppercase) or null. */
export const normalizeHex = (value: string): string | null => {
  let v = value.trim().replace(/^#/, "");
  if (!/^[a-f\d]+$/i.test(v)) return null;
  if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
  if (v.length !== 6) return null;
  return `#${v.toUpperCase()}`;
};

export const hexToRgb = (hex: string): Rgb | null => {
  const n = normalizeHex(hex);
  if (!n) return null;
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  "#" +
  [r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

/* ------------------------------------------------------------------ */
/* RGB <-> HSL                                                         */
/* ------------------------------------------------------------------ */

export const rgbToHsl = (r: number, g: number, b: number): Hsl => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
};

export const hexToHsl = (hex: string): Hsl | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

/* ------------------------------------------------------------------ */
/* RGB <-> OKLCH                                                       */
/* ------------------------------------------------------------------ */

const linearToSrgb = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

export const rgbToOklch = (r: number, g: number, b: number): Oklch => {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  // linear sRGB -> LMS (Ottosson's OKLab matrix; D65 white maps to 1,1,1)
  const x = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const y = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const z = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(x);
  const m_ = Math.cbrt(y);
  const s_ = Math.cbrt(z);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bv * bv);
  let H = (Math.atan2(bv, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
};

export const oklchToRgb = (oklch: Oklch): Rgb => {
  const { l, c, h } = oklch;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bv = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * bv;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bv;
  const s_ = l - 0.0894841775 * a - 1.291485548 * bv;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  // LMS -> linear sRGB
  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const sr = linearToSrgb(clamp(lr, 0, 1));
  const sg = linearToSrgb(clamp(lg, 0, 1));
  const sb = linearToSrgb(clamp(lb, 0, 1));

  return {
    r: clamp(Math.round(sr * 255), 0, 255),
    g: clamp(Math.round(sg * 255), 0, 255),
    b: clamp(Math.round(sb * 255), 0, 255),
  };
};

export const oklchToHex = (oklch: Oklch): string => {
  const { r, g, b } = oklchToRgb(oklch);
  return rgbToHex(r, g, b);
};

export const hexToOklch = (hex: string): Oklch | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToOklch(rgb.r, rgb.g, rgb.b) : null;
};

/* ------------------------------------------------------------------ */
/* WCAG contrast                                                       */
/* ------------------------------------------------------------------ */

export const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const contrastRatio = (hexA: string, hexB: string): number => {
  const r1 = hexToRgb(hexA);
  const r2 = hexToRgb(hexB);
  if (!r1 || !r2) return 0;
  const l1 = getLuminance(r1.r, r1.g, r1.b);
  const l2 = getLuminance(r2.r, r2.g, r2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export interface WcagResult {
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  uiGraphic: boolean;
}

export const WCAG_LARGE_TEXT_MIN = 3;
export const WCAG_AA_TEXT_MIN = 4.5;
export const WCAG_AAA_TEXT_MIN = 7;

export const checkWCAG = (ratio: number): WcagResult => ({
  aaNormal: ratio >= WCAG_AA_TEXT_MIN,
  aaLarge: ratio >= WCAG_LARGE_TEXT_MIN,
  aaaNormal: ratio >= WCAG_AAA_TEXT_MIN,
  aaaLarge: ratio >= WCAG_AA_TEXT_MIN,
  uiGraphic: ratio >= WCAG_LARGE_TEXT_MIN,
});

/** Relative luminance for an RGB triple (WCAG 2.x formula). */
export const luminanceForRgb = (r: number, g: number, b: number): number =>
  getLuminance(r, g, b);

/** Relative luminance for a hex color, or null when the hex is invalid. */
export const luminanceOf = (hex: string): number | null => {
  const rgb = hexToRgb(hex);
  return rgb ? getLuminance(rgb.r, rgb.g, rgb.b) : null;
};

export interface ContrastReport {
  ratio: number;
  text: {
    aa: boolean;
    aaa: boolean;
  };
  largeText: {
    aa: boolean;
    aaa: boolean;
  };
  uiComponent: boolean;
  grade: "AAA" | "AA" | "Fail";
}

/** Structured WCAG contrast evaluation between two hex colors. */
export const contrastReport = (hexA: string, hexB: string): ContrastReport | null => {
  if (!hexToRgb(hexA) || !hexToRgb(hexB)) return null;
  const ratio = contrastRatio(hexA, hexB);
  return {
    ratio,
    text: {
      aa: ratio >= WCAG_AA_TEXT_MIN,
      aaa: ratio >= WCAG_AAA_TEXT_MIN,
    },
    largeText: {
      aa: ratio >= WCAG_LARGE_TEXT_MIN,
      aaa: ratio >= WCAG_AA_TEXT_MIN,
    },
    uiComponent: ratio >= WCAG_LARGE_TEXT_MIN,
    grade:
      ratio >= WCAG_AAA_TEXT_MIN
        ? "AAA"
        : ratio >= WCAG_AA_TEXT_MIN
        ? "AA"
        : "Fail",
  };
};

/** Ink (dark) or paper (light) text color for a given background. */
export const textColorOn = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#172015";
  return getLuminance(rgb.r, rgb.g, rgb.b) > 0.4 ? "#172015" : "#FAF8F1";
};

/* ------------------------------------------------------------------ */
/* Blending / scaling                                                  */
/* ------------------------------------------------------------------ */

export const mix = (a: string, b: string, t: number): string => {
  const r1 = hexToRgb(a);
  const r2 = hexToRgb(b);
  if (!r1 || !r2) return a;
  const k = clamp(t, 0, 1);
  return rgbToHex(
    r1.r + (r2.r - r1.r) * k,
    r1.g + (r2.g - r1.g) * k,
    r1.b + (r2.b - r1.b) * k
  );
};

export const tint = (hex: string, amount: number): string =>
  mix(hex, "#FFFFFF", amount);

export const shade = (hex: string, amount: number): string =>
  mix(hex, "#000000", amount);

export const tone = (hex: string, amount: number): string =>
  mix(hex, "#808080", amount);

/* ------------------------------------------------------------------ */
/* Color blindness simulation                                           */
/* ------------------------------------------------------------------ */

export type ColorBlindnessMode = "normal" | "protan" | "deutan" | "tritan" | "achroma";

/** Approximate a color as perceived under common color vision deficiencies. */
export const simulateColorBlindness = (
  hex: string,
  mode: ColorBlindnessMode
): string => {
  const rgb = hexToRgb(hex);
  if (!rgb || mode === "normal") return hex;
  const { r, g, b } = rgb;

  let sr: number;
  let sg: number;
  let sb: number;
  switch (mode) {
    case "protan":
      sr = 0.567 * r + 0.433 * g;
      sg = 0.558 * r + 0.442 * g;
      sb = 0.242 * g + 0.758 * b;
      break;
    case "deutan":
      sr = 0.625 * r + 0.375 * g;
      sg = 0.7 * r + 0.3 * g;
      sb = 0.3 * g + 0.7 * b;
      break;
    case "tritan":
      sr = 0.95 * r + 0.05 * g;
      sg = 0.433 * g + 0.567 * b;
      sb = 0.475 * g + 0.525 * b;
      break;
    case "achroma":
    default: {
      const grey = 0.299 * r + 0.587 * g + 0.114 * b;
      sr = grey;
      sg = grey;
      sb = grey;
      break;
    }
  }

  return rgbToHex(sr, sg, sb);
};

/**
 * Perceptually uniform design-system scale (50–950) in OKLCH.
 * Step 500 is the source color itself.
 */
export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type ColorScale = Record<number, string>;

export const generateScale = (sourceHex: string): ColorScale => {
  const base = hexToOklch(sourceHex);
  if (!base) return {};
  const lightnessTargets: Record<number, number> = {
    50: 0.975,
    100: 0.93,
    200: 0.87,
    300: 0.78,
    400: 0.68,
    500: base.l,
    600: clamp(base.l - 0.08, 0.05, 1),
    700: clamp(base.l - 0.16, 0.04, 1),
    800: clamp(base.l - 0.24, 0.035, 1),
    900: clamp(base.l - 0.32, 0.03, 1),
    950: clamp(base.l - 0.38, 0.025, 1),
  };
  const scale: ColorScale = {};
  for (const step of SCALE_STEPS) {
    const L = clamp(lightnessTargets[step], 0, 1);
    const dist = Math.abs(step - 500) / 500;
    const extreme = step <= 100 || step >= 950 ? 0.5 : 1;
    const C = clamp(base.c * (1 - dist * 0.4 * extreme), 0, 0.4);
    let H = base.h;
    if (step < 500) H += (500 - step) * 0.3;
    else if (step > 500) H -= (step - 500) * 0.3;
    scale[step] = oklchToHex({ l: L, c: C, h: H });
  }
  return scale;
};

/* ------------------------------------------------------------------ */
/* Harmonies                                                           */
/* ------------------------------------------------------------------ */

export type HarmonyType =
  | "random"
  | "analogous"
  | "complementary"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic"
  | "shades";

export interface Harmonies {
  complementary: string[];
  analogous: string[];
  triadic: string[];
  tetradic: string[];
  split: string[];
  monochromatic: string[];
  shades: string[];
}

/** All harmony palettes for a single source color (5 colors each). */
export const getHarmonies = (hex: string): Harmonies => {
  const hsl = hexToHsl(hex);
  const empty: Harmonies = {
    complementary: [],
    analogous: [],
    triadic: [],
    tetradic: [],
    split: [],
    monochromatic: [],
    shades: [],
  };
  if (!hsl) return empty;

  const rot = (offset: number, sMul: number, lShift: number): string =>
    hslToHex(
      hsl.h + offset,
      clamp(hsl.s * sMul, 0, 100),
      clamp(hsl.l + lShift, 0, 100)
    );

  return {
    complementary: [hex, rot(180, 1, 0), rot(180, 1, -14), rot(0, 1, 18), rot(180, 0.8, 14)],
    analogous: [hex, rot(30, 1, 0), rot(-30, 1, 0), rot(60, 0.92, 6), rot(-60, 0.92, 6)],
    triadic: [hex, rot(120, 1, -4), rot(240, 1, -4), rot(120, 0.9, 12), rot(240, 0.9, 12)],
    tetradic: [hex, rot(90, 1, 0), rot(180, 1, 0), rot(270, 1, 0), rot(90, 0.9, 14)],
    split: [hex, rot(150, 1, -4), rot(210, 1, -4), rot(150, 0.9, 12), rot(210, 0.9, 12)],
    monochromatic: [hex, shade(hex, 0.16), tint(hex, 0.3), shade(hex, 0.3), tint(hex, 0.55)],
    shades: [tone(hex, 0.85), tone(hex, 0.62), hex, shade(hex, 0.3), shade(hex, 0.6)],
  };
};

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashSeed = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const randomHex = (rand: () => number = Math.random, lMin = 45, lMax = 88): string => {
  const h = Math.floor(rand() * 360);
  const s = 45 + Math.floor(rand() * 55);
  const l = lMin + Math.floor(rand() * (lMax - lMin));
  return hslToHex(h, s, l);
};

/**
 * Generate a palette of `count` colors from a harmony using a seed.
 * Base seed may be any string (hue anchor + deterministic randomness).
 */
export const generatePalette = (
  count: number,
  harmony: HarmonyType = "random",
  baseSeed = "gainutility",
  anchorHex?: string
): string[] => {
  const rand = mulberry32(hashSeed(baseSeed));
  const n = clamp(Math.round(count), 2, 10);
  const anchor = anchorHex || randomHex(rand, 40, 90);

  const hsl = hexToHsl(anchor);
  const room = 360 / n;

  const variant = (base: string, i: number): string => {
    const h = hexToHsl(base);
    if (!h) return base;
    const jitter = Math.floor(rand() * 24) - 12;
    const sJitter = Math.floor(rand() * 18) - 8;
    const lJitter = Math.floor(rand() * 14) - 4;
    return hslToHex(
      h.h + jitter,
      clamp(h.s + sJitter, 18, 100),
      clamp(h.l + lJitter, 20, 92)
    );
  };

  const base: string[] = [];
  const set: string[] = [];

  if (harmony === "random") {
    for (let i = 0; i < n; i++) base.push(randomHex(rand, 38, 90));
  } else if (harmony === "shades") {
    const scale = generateScale(anchor);
    base.length = 0;
    for (let i = 0; i < n; i++) {
      const step = SCALE_STEPS[Math.floor(rand() * SCALE_STEPS.length)];
      base.push(scale[step] || anchor);
    }
  } else if (harmony === "monochromatic") {
    for (let i = 0; i < n; i++) base.push(variant(anchor, i));
    base[0] = anchor;
  } else {
    const h0 = hsl ? hsl.h : 0;
    for (let i = 0; i < n; i++) {
      let hue: number;
      switch (harmony) {
        case "analogous":
          hue = h0 + (i % 5) * 30 - 60;
          break;
        case "complementary":
          hue = i % 2 === 0 ? h0 : h0 + 180;
          break;
        case "triadic":
          hue = h0 + (i % 3) * 120;
          break;
        case "split-complementary":
          hue = i % 3 === 0 ? h0 : i % 3 === 1 ? h0 + 150 : h0 + 210;
          break;
        case "tetradic":
          hue = h0 + (i % 4) * 90;
          break;
        default:
          hue = h0 + i * room;
      }
      base.push(
        hslToHex(hue, hsl ? clamp(hsl.s + (rand() < 0.5 ? -8 : 8), 25, 100) : 70, hsl ? clamp(hsl.l + (rand() < 0.5 ? -6 : 6), 30, 85) : 60)
      );
    }
    base[0] = anchor;
  }

  for (let i = 0; i < n; i++) set.push(i === 0 || harmony === "shades" || harmony === "complementary" ? base[i] : variant(base[i], i));
  return set;
};

/* ------------------------------------------------------------------ */
/* Palettes in URLs (share / deep-link)                                */
/* ------------------------------------------------------------------ */

/** Encode a palette as a URL-safe slug: `264653-2A9D8F-…` */
export const paletteSlug = (hexes: string[]): string =>
  hexes
    .map((h) => normalizeHex(h)?.slice(1) ?? "")
    .filter(Boolean)
    .join("-");

const ENCODED_RE = /^([0-9a-f]{6})(-([0-9a-f]{6}))+$/i;

/** Decode a `264653-2A9D8F-…` slug back into an array of # hex colors. */
export const paletteFromSlug = (slug: string): string[] | null => {
  if (!ENCODED_RE.test(slug)) return null;
  return slug.split("-").map((c) => normalizeHex(c)!).filter(Boolean);
};

/** Humanized palette name from hex colors (e.g. "Coastal Teal"). */
export const paletteName = (hexes: string[]): string => {
  const first = hexes[0];
  const hsl = first ? hexToHsl(first) : null;
  if (!hsl) return "Custom Palette";
  const hueName =
    hsl.h < 15 || hsl.h >= 345
      ? "Crimson"
      : hsl.h < 45
      ? "Amber"
      : hsl.h < 75
      ? "Olive"
      : hsl.h < 160
      ? "Pine"
      : hsl.h < 200
      ? "Seafoam"
      : hsl.h < 250
      ? "Azure"
      : hsl.h < 290
      ? "Indigo"
      : hsl.h < 330
      ? "Violet"
      : "Rose";
  const tone = hsl.l > 75 ? "Mist" : hsl.l < 40 ? "Deep" : "Coast";
  return `${tone} ${hueName}`;
};

export type { HarmonyType as PaletteHarmony };

/* ------------------------------------------------------------------ */
/* Hex alpha + CSS color string parsing                                */
/* ------------------------------------------------------------------ */

const HEXA_RE = /^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i;

/** Normalize any hex form (3/4/6/8, optional `#`) to `#RRGGBB` or `#RRGGBBAA`. */
export const normalizeHexWithAlpha = (value: string): string | null => {
  const v = value.trim().replace(/^#/, "");
  if (!HEXA_RE.test(v)) return null;
  const expanded = v.length === 3 || v.length === 4 ? v.split("").map((c) => c + c).join("") : v;
  return `#${expanded.toUpperCase()}`;
};

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parse a hex string (3/4/6/8 digit) into RGB channels plus alpha (0–1). */
export const hexToRgba = (hex: string): Rgba | null => {
  const n = normalizeHexWithAlpha(hex);
  if (!n) return null;
  const digits = n.slice(1);
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
    a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
  };
};

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface ParsedColor {
  format: ColorFormat;
  source: string;
  rgb: Rgb;
  alpha: number;
  hex: string;
}

const parseChannel = (token: string, scale: number, max: number): number => {
  const raw = parseFloat(token.replace("deg", ""));
  if (Number.isNaN(raw)) return NaN;
  return clamp(token.includes("%") ? (raw / 100) * scale : raw, 0, max);
};

/** Split an `rgb()/hsl()/oklch()` argument list, handling `/,` and space syntax. */
const splitColorArgs = (inner: string): string[] =>
  inner
    .split("/")
    .flatMap((part, i) => (i === 0 ? part.split(/[\s,]+/) : [part.trim()]))
    .filter((t) => t.length > 0);

/** Parse hex, `rgb()/rgba()`, `hsl()/hsla()` and `oklch()` strings. */
export const parseColor = (value: string): ParsedColor | null => {
  const source = value.trim();
  if (!source) return null;

  const hexified = normalizeHexWithAlpha(source);
  if (hexified) {
    const { r, g, b, a } = hexToRgba(hexified)!;
    return {
      format: "hex",
      source,
      rgb: { r, g, b },
      alpha: a,
      hex: a < 1 ? hexified : hexified.slice(0, 7),
    };
  }

  const rgbMatch = source.match(/^rgba?\(\s*([^)]+)\)$/i);
  if (rgbMatch) {
    const [c1, c2, c3, c4] = splitColorArgs(rgbMatch[1]);
    if (c1 === undefined || c2 === undefined || c3 === undefined) return null;
    const r = parseChannel(c1, 255, 255);
    const g = parseChannel(c2, 255, 255);
    const b = parseChannel(c3, 255, 255);
    const alpha = c4 === undefined ? 1 : clamp(parseFloat(c4.replace("%", "")) / (c4.includes("%") ? 100 : 1), 0, 1);
    if ([r, g, b].some((x) => Number.isNaN(x)) || Number.isNaN(alpha)) return null;
    const rgb = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    return {
      format: "rgb",
      source,
      rgb,
      alpha,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
  }

  const hslMatch = source.match(/^hsla?\(\s*([^)]+)\)$/i);
  if (hslMatch) {
    const [h, s, l, a] = splitColorArgs(hslMatch[1]);
    if (h === undefined || s === undefined || l === undefined) return null;
    const hue = parseFloat(h.replace("deg", ""));
    const sat = parseChannel(s, 100, 100);
    const light = parseChannel(l, 100, 100);
    const alpha = a === undefined ? 1 : clamp(parseFloat(a.replace("%", "")) / (a.includes("%") ? 100 : 1), 0, 1);
    if (Number.isNaN(hue) || Number.isNaN(sat) || Number.isNaN(light) || Number.isNaN(alpha)) return null;
    const rgb = hslToRgb(hue, sat, light);
    return { format: "hsl", source, rgb, alpha, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
  }

  const oklchMatch = source.match(/^oklch\(\s*([^)]+)\)$/i);
  if (oklchMatch) {
    const [l, c, h, a] = splitColorArgs(oklchMatch[1]);
    if (l === undefined || c === undefined || h === undefined) return null;
    const lightness = parseChannel(l, 1, 1);
    const chroma = parseChannel(c, 0.4, 0.4);
    const hue = parseFloat(h.replace("deg", ""));
    const alpha = a === undefined ? 1 : clamp(parseFloat(a.replace("%", "")) / (a.includes("%") ? 100 : 1), 0, 1);
    if (Number.isNaN(lightness) || Number.isNaN(chroma) || Number.isNaN(hue) || Number.isNaN(alpha)) return null;
    const rgb = oklchToRgb({ l: clamp(lightness, 0, 1), c: clamp(chroma, 0, 0.4), h: hue });
    return { format: "oklch", source, rgb, alpha, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
  }

  return null;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Serialize parsed channel values into the requested CSS color format. */
export const formatColor = (
  color: { rgb: Rgb; alpha: number },
  format: ColorFormat
): string => {
  const { rgb, alpha } = color;
  switch (format) {
    case "hex": {
      const base = rgbToHex(rgb.r, rgb.g, rgb.b);
      if (alpha >= 1) return base;
      const aHex = Math.round(clamp(alpha, 0, 1) * 255).toString(16).padStart(2, "0").toUpperCase();
      return `${base}${aHex}`;
    }
    case "rgb": {
      const channels = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
      return alpha >= 1 ? `rgb(${channels})` : `rgba(${channels}, ${round2(alpha)})`;
    }
    case "hsl": {
      const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const base = `hsl(${Math.round(h)} ${round2(s)}% ${round2(l)}%`;
      return alpha >= 1 ? `${base})` : `${base} / ${round2(alpha)})`;
    }
    case "oklch": {
      const o = rgbToOklch(rgb.r, rgb.g, rgb.b);
      const base = `oklch(${round2(o.l)} ${round2(o.c)} ${Math.round(o.h)}`;
      return alpha >= 1 ? `${base})` : `${base} / ${round2(alpha)})`;
    }
  }
};