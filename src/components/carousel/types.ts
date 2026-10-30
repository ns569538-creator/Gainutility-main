/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AspectPreset = "portrait" | "square" | "landscape" | "story";

export interface PresetConfig {
  id: AspectPreset;
  name: string;
  ratio: string;
  width: number;
  height: number;
  desc: string;
  badge?: string;
}

export const CAROUSEL_PRESETS: Record<AspectPreset, PresetConfig> = {
  portrait: {
    id: "portrait",
    name: "LinkedIn Portrait",
    ratio: "4:5",
    width: 1080,
    height: 1350,
    desc: "Recommended for maximum LinkedIn feed real estate",
    badge: "Recommended"
  },
  square: {
    id: "square",
    name: "Square",
    ratio: "1:1",
    width: 1080,
    height: 1080,
    desc: "Universal standard for LinkedIn & Instagram"
  },
  landscape: {
    id: "landscape",
    name: "Landscape",
    ratio: "16:9",
    width: 1280,
    height: 720,
    desc: "Wide slide presentation format"
  },
  story: {
    id: "story",
    name: "Story / Vertical",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    desc: "Full vertical mobile format"
  }
};

export type ObjectType = "image" | "text" | "shape" | "arrow" | "line";

export interface BaseCanvasObject {
  id: string;
  type: ObjectType;
  x: number; // canvas pixel coordinate (e.g. 0 to 1080)
  y: number; // canvas pixel coordinate (e.g. 0 to 1350)
  width: number;
  height: number;
  rotation: number; // in degrees
  zIndex: number;
  opacity: number; // 0 to 1
  locked?: boolean;
}

export interface ImageObject extends BaseCanvasObject {
  type: "image";
  imgSrc: string;
  originalWidth: number;
  originalHeight: number;
  naturalAspectRatio: number; // width / height
  borderRadius?: number; // 0 to 60px
  borderColor?: string;
  borderWidth?: number;
  shadow?: "none" | "sm" | "md" | "lg" | "glow" | "phone";
  alt?: string;
}

export type TextPreset = "heading" | "subheading" | "body" | "caption" | "pill" | "badge" | "label";

export interface TextObject extends BaseCanvasObject {
  type: "text";
  text: string;
  fontSize: number; // e.g. 48 for headings, 28 for body at 1080 scale
  fontWeight: number | string; // '400', '600', '700', '800', '900'
  fontFamily: string; // 'Inter', 'Outfit', 'Playfair Display', 'monospace', 'serif', 'sans-serif'
  fontColor: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number; // 1.1 to 1.8
  letterSpacing: number; // -2 to 6
  textTransform?: "none" | "uppercase" | "capitalize";
  textBgColor?: string; // background fill for pill / highlight
  textBgPadding?: number;
  textBgRadius?: number;
  textPreset?: TextPreset;
}

export type ShapeKind = "rectangle" | "rounded-rect" | "circle" | "highlight-bar";

export interface ShapeObject extends BaseCanvasObject {
  type: "shape";
  shapeKind: ShapeKind;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export type ArrowDirection = "right" | "left" | "up" | "down" | "curved-right" | "curved-left";

export interface ArrowObject extends BaseCanvasObject {
  type: "arrow";
  arrowDirection: ArrowDirection;
  color: string;
  strokeWidth: number;
  label?: string;
}

export interface LineObject extends BaseCanvasObject {
  type: "line";
  color: string;
  strokeWidth: number;
  style?: "solid" | "dashed" | "dotted";
}

export type CanvasObject = ImageObject | TextObject | ShapeObject | ArrowObject | LineObject;

/** Pattern kinds rendered both in the editor (CSS) and on export (canvas). */
export type SlidePatternKind =
  | "none"
  | "grid"
  | "dots"
  | "waves"
  | "lines"
  | "circles"
  | "shapes";

export interface SlidePattern {
  type: SlidePatternKind;
  /** pattern line/dot color (rgba or hex; exported translucent). */
  color: string;
  /** opacity of the pattern overlay. */
  opacity: number;
  /** spacing / scale of the repeating unit. */
  scale: number;
}

export interface CarouselSlide {
  id: string;
  name: string;
  backgroundColor: string; // hex or gradient
  backgroundGradient?: string;
  /** Optional template-derived background pattern overlay. */
  pattern?: SlidePattern;
  /** Accent colour used by template starters (editable). */
  accent?: string;
  /** Template id this slide was started from (informational only). */
  templateId?: string;
  objects: CanvasObject[];
  // Slide metadata & overlay options
  counterEnabled?: boolean;
  counterPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  swipeCueEnabled?: boolean;
  authorHandle?: string;
}

export interface SnapGuide {
  orientation: "horizontal" | "vertical";
  position: number; // pixel in canvas space
  label?: string;
}

export const BG_PRESET_COLORS = [
  { name: "Clean White", value: "#FFFFFF", text: "#111827", isLight: true },
  { name: "Soft Ivory", value: "#FAF8F1", text: "#1F281E", isLight: true },
  { name: "Warm Linen", value: "#F4EFE6", text: "#1F281E", isLight: true },
  { name: "Olive Deep", value: "#141A12", text: "#F4F7F2", isLight: false },
  { name: "Dark Forest", value: "#1B241A", text: "#F4F7F2", isLight: false },
  { name: "Slate Charcoal", value: "#111827", text: "#F9FAFB", isLight: false },
  { name: "Obsidian Black", value: "#0A0D09", text: "#F4F7F2", isLight: false },
  { name: "Deep Navy", value: "#0F172A", text: "#F8FAFC", isLight: false }
];

export const TEXT_PALETTE_COLORS = [
  "#111827",
  "#F4F7F2",
  "#4A6327",
  "#75AB52",
  "#D4A845",
  "#E55C5C",
  "#2563EB",
  "#6B7280"
];

export const FONT_FAMILIES = [
  { label: "Modern Sans (System)", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { label: "Display Serif", value: "Georgia, Cambria, 'Times New Roman', serif" },
  { label: "Clean Monospace", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }
];
