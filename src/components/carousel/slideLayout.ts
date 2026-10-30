/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared slide-metadata geometry + footer palette.
 *
 * The slide footer overlays (slide counter, "Swipe →" cue and author handle)
 * are rendered in three places that must agree at every viewport:
 *   1. the editor preview           (SlideCanvasStage)
 *   2. the PNG / ZIP export layer   (canvasUtils.renderSlideToCanvas)
 *   3. the vector PDF export        (pdfExport)
 *
 * All three consume these constants and the palette helpers so a footer that
 * looks right on screen also looks right in the exported file (and vice
 * versa). Values are in slide-design coordinates (CSS px on the 1080 x 1350
 * reference canvas) — they scale with the canvas, never with the viewport.
 */

import { CarouselSlide } from "./types";

/** Constant on-canvas (design-unit) footer geometry. */
export const SLIDE_FOOTER = {
  /** Baseline offset from the bottom edge of the canvas. */
  bottomInset: 44,
  /** Horizontal inset from the left / right edges of the canvas. */
  sideInset: 44,
  /** Font size (design units) for the slide counter. */
  counterSize: 26,
  /** Font weight for the slide counter. */
  counterWeight: 700,
  /** Font size (design units) for the "Swipe →" cue. */
  swipeSize: 26,
  /** Font size (design units) for the author handle. */
  authorSize: 23,
  /** Font size for the arrow's optional text label. */
  arrowLabelSize: 16
} as const;

/** Parsed RGBA-ish colour with 0..1 components. */
interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Best-effort parse of hex / rgb() / rgba() → {r,g,b,a} (0..1). */
export function parseColor(color: string): ParsedColor | null {
  const c = (color || "").trim();
  if (!c) return null;

  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split("").map((h) => h + h).join("");
    if (hex.length === 6) {
      const int = parseInt(hex, 16);
      if (Number.isFinite(int)) {
        return {
          r: ((int >> 16) & 255) / 255,
          g: ((int >> 8) & 255) / 255,
          b: (int & 255) / 255,
          a: 1
        };
      }
    }
    return null;
  }

  const m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i);
  if (m) {
    let a = m[4] ? parseFloat(m[4]) : 1;
    if (m[4] && m[4].endsWith("%")) a = a / 100;
    if (!Number.isFinite(a)) a = 1;
    return {
      r: Math.min(1, parseFloat(m[1]) / 255),
      g: Math.min(1, parseFloat(m[2]) / 255),
      b: Math.min(1, parseFloat(m[3]) / 255),
      a: Math.min(1, Math.max(0, a))
    };
  }
  return null;
}

/** Perceived luminance of a colour (0 = black, 1 = white). */
export function luminanceOf(color: string | undefined): number {
  const p = color ? parseColor(color) : null;
  if (!p) return 0.1; // default to a dark background
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const r = lin(p.r);
  const g = lin(p.g);
  const b = lin(p.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Whether a slide background (solid or gradient base) reads as light.
 * Used to pick footer / pattern tints that stay legible on both light and
 * dark canvases.
 */
export function isLightBackground(slide: Pick<CarouselSlide, "backgroundColor">): boolean {
  return luminanceOf(slide.backgroundColor) > 0.5;
}

export interface FooterPalette {
  /** Muted neutral for counter / author (contrast-adaptive). */
  muted: string;
  /** Accent for the swipe cue (contrast-adaptive olive / mint green). */
  accent: string;
}

/** Footer overlay colors, chosen for legibility on the slide background. */
export function footerPalette(slide: Pick<CarouselSlide, "backgroundColor">): FooterPalette {
  const light = isLightBackground(slide);
  return {
    muted: light ? "rgba(32, 46, 29, 0.72)" : "rgba(238, 247, 233, 0.78)",
    accent: light ? "#4A6327" : "#8BCE62"
  };
}

/** Localized-friendly "01 / 05" counter label. */
export function footerCounterText(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}