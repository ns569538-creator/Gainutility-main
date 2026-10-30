/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Carousel template registry.
 *
 * Templates are EMPTY EDITABLE FRAMES — a curated starting point for the
 * background/accent of a slide, not finished posts. Selecting a template
 * changes the real slide background configuration (and, for new slides,
 * injects a couple of starter objects). Everything remains editable.
 *
 * The same registry drives:
 *   - the template picker UI (real previews rendered from actual config)
 *   - the on-canvas slide background (see SlideCanvasStage)
 *   - the export rasterizer (see canvasUtils)
 * so there is a single source of truth and no fake previews.
 */

import { CarouselSlide, SlidePattern } from "./types";

export type { SlidePatternKind } from "./types";
export type { SlidePattern };

/** Pattern kinds rendered both in the editor (CSS) and on export (canvas). */
export type BackgroundPattern = SlidePattern["type"];

export interface PatternConfig extends SlidePattern {}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Minimal",
  "Gradient",
  "Dots",
  "Grid",
  "Shapes",
  "Lines",
  "Waves",
  "Light",
  "Dark",
  "Pastel",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export interface TemplateDef {
  id: string;
  name: string;
  /** Categories this template belongs to (a template can appear in several). */
  categories: TemplateCategory[];
  /** Short one-line description shown in the picker. */
  blurb: string;
  /** Base background color (hex). */
  backgroundColor: string;
  /** Optional vertical gradient endpoint (hex). */
  backgroundGradient?: string;
  /** Optional pattern overlay. */
  pattern?: PatternConfig;
  /** Accent color used by starter shapes / highlighted text. */
  accent: string;
  /** Recommended text color for a slide using this template. */
  textColor: string;
  /** Whether the background is light (drives default text behaviour). */
  isLight: boolean;
  /** Starter objects added when creating a NEW slide from this template. */
  starter?: {
    headline?: string;
    tagline?: string;
    accentBar?: boolean;
  };
}

const GRID = (color: string, scale: number, opacity: number): PatternConfig => ({
  type: "grid",
  color,
  scale,
  opacity,
});

const DOTS = (color: string, scale: number, opacity: number): PatternConfig => ({
  type: "dots",
  color,
  scale,
  opacity,
});

const WAVES = (color: string, scale: number, opacity: number): PatternConfig => ({
  type: "waves",
  color,
  scale,
  opacity,
});

const LINES = (color: string, scale: number, opacity: number): PatternConfig => ({
  type: "lines",
  color,
  scale,
  opacity,
});

const CIRCLES = (color: string, scale: number, opacity: number): PatternConfig => ({
  type: "circles",
  color,
  scale,
  opacity,
});

/** Light stand-alone palette group (not a pattern family). */
const LIGHT = "Light" as TemplateCategory;
const DARK = "Dark" as TemplateCategory;

export const TEMPLATES: TemplateDef[] = [
  {
    id: "minimal-light",
    name: "Minimal Light",
    categories: ["Minimal", LIGHT],
    blurb: "Warm white with clean spacing",
    backgroundColor: "#F7F5EF",
    accent: "#75AB52",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "dark-grid",
    name: "Dark Grid",
    categories: ["Grid", DARK],
    blurb: "Dark and structured",
    backgroundColor: "#141A12",
    pattern: GRID("rgba(117, 171, 82, 0.22)", 90, 0.9),
    accent: "#8BCE62",
    textColor: "#F4F7F2",
    isLight: false,
  },
  {
    id: "soft-dots",
    name: "Soft Dots",
    categories: ["Dots", LIGHT],
    blurb: "Light with a dotted texture",
    backgroundColor: "#FAF8F1",
    pattern: DOTS("rgba(65, 84, 55, 0.18)", 38, 0.9),
    accent: "#4A6327",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "light-grid",
    name: "Light Grid",
    categories: ["Grid", LIGHT],
    blurb: "Very subtle technical grid",
    backgroundColor: "#F2F4EE",
    pattern: GRID("rgba(74, 99, 39, 0.16)", 84, 0.9),
    accent: "#4A6327",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "dark-waves",
    name: "Dark Waves",
    categories: ["Waves", DARK],
    blurb: "Dark with a flowing wave",
    backgroundColor: "#111827",
    pattern: WAVES("rgba(90, 130, 90, 0.35)", 120, 0.8),
    accent: "#8BCE62",
    textColor: "#F9FAFB",
    isLight: false,
  },
  {
    id: "pastel-gradient",
    name: "Pastel Gradient",
    categories: ["Gradient", LIGHT, "Pastel"],
    blurb: "Soft modern gradient",
    backgroundColor: "#EAF2E3",
    backgroundGradient: "#DCE8E9",
    accent: "#4A6327",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "modern-shapes",
    name: "Modern Shapes",
    categories: ["Shapes", LIGHT],
    blurb: "Soft geometric shapes",
    backgroundColor: "#F7F5EF",
    pattern: CIRCLES("rgba(117, 171, 82, 0.28)", 210, 0.9),
    accent: "#75AB52",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "bold-gradient",
    name: "Bold Gradient",
    categories: ["Gradient", DARK],
    blurb: "Stronger attention gradient",
    backgroundColor: "#1B2B1E",
    backgroundGradient: "#0F1A24",
    accent: "#8BCE62",
    textColor: "#F4F7F2",
    isLight: false,
  },
  {
    id: "clean-lines",
    name: "Clean Lines",
    categories: ["Lines", LIGHT],
    blurb: "Diagonal linear structure",
    backgroundColor: "#ECEFF0",
    pattern: LINES("rgba(74, 99, 39, 0.2)", 110, 0.9),
    accent: "#4A6327",
    textColor: "#1F281E",
    isLight: true,
  },
  {
    id: "dark-dots",
    name: "Dark Dots",
    categories: ["Dots", DARK],
    blurb: "Premium dark dotted pattern",
    backgroundColor: "#0A0D09",
    pattern: DOTS("rgba(117, 171, 82, 0.22)", 46, 0.95),
    accent: "#75AB52",
    textColor: "#F4F7F2",
    isLight: false,
  },
];

/** Shared "use blank canvas" pseudo-template. */
export const BLANK_TEMPLATE: TemplateDef = {
  id: "blank",
  name: "Blank Canvas",
  categories: ["Minimal"],
  blurb: "Start from a clean empty frame",
  backgroundColor: "#141A12",
  accent: "#75AB52",
  textColor: "#F4F7F2",
  isLight: false,
};

/** Templates filterable under a given category (relies on multi-category tags). */
export function templatesForCategory(category: TemplateCategory): TemplateDef[] {
  if (category === "All") return [...TEMPLATES];
  return TEMPLATES.filter((t) => t.categories.includes(category));
}

export function getTemplate(id: string): TemplateDef | undefined {
  if (id === BLANK_TEMPLATE.id) return BLANK_TEMPLATE;
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Relative luminance of a hex color (0 = pure black, 1 = pure white).
 * Handles "#RRGGBB" and "#RGB" with optional leading "#".
 */
export function hexLuminance(hex: string): number {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** True when a hex color should be treated as a light background. */
export function hexIsLight(hex: string): boolean {
  return hexLuminance(hex) > 0.5;
}

/** Recommended text tone (dark solid vs. light) for a slide's background. */
export function getRecommendedTextTone(
  slide: Pick<CarouselSlide, "backgroundColor" | "backgroundGradient">
): "dark" | "light" {
  if (slide.backgroundGradient) {
    // Gradients blend two colors; use the midpoint luminance to pick tone.
    const a = hexLuminance(slide.backgroundColor);
    const b = hexLuminance(slide.backgroundGradient);
    return (a + b) / 2 > 0.5 ? "dark" : "light";
  }
  return hexIsLight(slide.backgroundColor) ? "dark" : "light";
}

/**
 * CSS background for the live editor preview of a slide. Mirrors exactly what
 * the export rasterizer paints (base color + optional vertical gradient).
 */
export function getSlideBackgroundCss(
  slide: Pick<CarouselSlide, "backgroundColor" | "backgroundGradient">
): string {
  if (slide.backgroundGradient) {
    return `linear-gradient(180deg, ${slide.backgroundColor} 0%, ${slide.backgroundGradient} 100%)`;
  }
  return slide.backgroundColor || "#141A12";
}

/**
 * Apply a template's background/accent to an existing slide. Only touches the
 * background configuration — never the slide's objects/content.
 */
export function applyTemplateToSlide(slide: CarouselSlide, template: TemplateDef): CarouselSlide {
  return {
    ...slide,
    backgroundColor: template.backgroundColor,
    backgroundGradient: template.backgroundGradient,
    pattern: template.pattern ? { ...template.pattern } : undefined,
    accent: template.accent,
    templateId: template.id,
  };
}

/**
 * Build a brand-new slide from a template. Just the background config plus a
 * couple of lightweight starter objects (never finished posts) so the canvas
 * feels alive but stays fully editable.
 */
export function createSlideFromTemplate(
  template: TemplateDef,
  presetConfig: { width: number; height: number },
  index: number,
  total: number
): CarouselSlide {
  const cw = presetConfig.width;
  const ch = presetConfig.height;
  const id = "slide_" + Math.random().toString(36).substring(2, 10);
  const solid = template.textColor;
  const muted = template.isLight ? "#4B5563" : "#9AA99A";

  const newId = () => "obj_" + Math.random().toString(36).substring(2, 10);

  const objects: CarouselSlide["objects"] = [];

  if (template.starter?.accentBar !== false) {
    objects.push({
      id: newId(),
      type: "shape",
      shapeKind: "rounded-rect",
      x: Math.round(cw * 0.5 - 130),
      y: Math.round(ch * 0.46),
      width: 260,
      height: 6,
      rotation: 0,
      fillColor: template.accent,
      strokeColor: "transparent",
      strokeWidth: 0,
      borderRadius: 50,
      opacity: 1,
      zIndex: 5,
    });
  }

  if (template.starter?.tagline) {
    objects.push({
      id: newId(),
      type: "text",
      text: template.starter.tagline,
      fontSize: 28,
      fontWeight: 600,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontColor: template.accent,
      textAlign: "center",
      lineHeight: 1,
      letterSpacing: 2,
      textPreset: "caption",
      textTransform: "uppercase",
      x: Math.round(cw * 0.5 - 200),
      y: Math.round(ch * 0.34),
      width: 400,
      height: 40,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
    });
  }

  objects.push({
    id: newId(),
    type: "text",
    text: template.starter?.headline ?? "Make it bold. Make it memorable.",
    fontSize: 56,
    fontWeight: 800,
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontColor: solid,
    textAlign: "center",
    lineHeight: 1.25,
    letterSpacing: -1,
    textPreset: "heading",
    x: Math.round(cw * 0.1),
    y: Math.round(ch * 0.5),
    width: Math.round(cw * 0.8),
    height: 180,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
  });

  objects.push({
    id: newId(),
    type: "text",
    text: index === 0 ? "Tap to rewrite this headline" : `Slide ${index + 1} of ${total}`,
    fontSize: 24,
    fontWeight: 500,
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontColor: muted,
    textAlign: "center",
    lineHeight: 1,
    letterSpacing: 0,
    textPreset: "caption",
    x: Math.round(cw * 0.5 - 160),
    y: Math.round(ch * 0.82),
    width: 320,
    height: 40,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
  });

  return {
    id,
    name: template.name,
    backgroundColor: template.backgroundColor,
    backgroundGradient: template.backgroundGradient,
    pattern: template.pattern ? { ...template.pattern } : undefined,
    accent: template.accent,
    templateId: template.id,
    objects,
    counterEnabled: true,
    swipeCueEnabled: index === 0,
    authorHandle: "@gainutilitysuite",
  };
}