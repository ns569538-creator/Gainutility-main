/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CSS Shadow Studio — shared model for the box-shadow generator tool.
 *
 * Everything here is pure: layer types, CSS builders, presets, the curated
 * example/recipe catalog, URL-share encoding, and the constrained randomizer.
 * The React workspace and the below-the-tool content sections both consume
 * this module so a preset, a shared link, and an "edit this shadow" button
 * all resolve to the exact same configuration.
 */

export type ShadowMode = "box" | "text";
export type PreviewShape = "card" | "button" | "panel" | "input" | "floating";
export type TextAlign = "left" | "center" | "right";

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  /** Box-shadow only. Ignored by the text-shadow builder. */
  spread: number;
  color: string;
  /** 0..1 */
  opacity: number;
  /** Box-shadow only. Ignored by the text-shadow builder. */
  inset: boolean;
  visible?: boolean;
}

/** Preview-only typography for text-shadow mode (never part of the CSS). */
export interface TextSettings {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  textColor: string;
  align: TextAlign;
}

export interface StudioConfig {
  mode: ShadowMode;
  boxLayers: ShadowLayer[];
  textLayers: ShadowLayer[];
  previewBg: string;
  boxBg: string;
  boxRadius: number;
  previewShape: PreviewShape;
  text: TextSettings;
}

/** Partial config used by presets/examples/recipes/share loads. */
export interface ApplyRequest {
  mode: ShadowMode;
  layers: Omit<ShadowLayer, "id">[];
  preview?: {
    previewBg?: string;
    boxBg?: string;
    boxRadius?: number;
    previewShape?: PreviewShape;
    text?: Partial<TextSettings>;
  };
}

type LayerDraft = Omit<ShadowLayer, "id">;

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

const clamp255 = (n: number): number => Math.min(255, Math.max(0, Math.round(n)));

export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[clamp255(r), clamp255(g), clamp255(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;

export const hexToRGBA = (hex: string, alpha: number): string => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0");
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const a = Math.round(clamp(alpha, 0, 1) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
};

export const isHexColor = (s: unknown): s is string =>
  typeof s === "string" && /^#?[0-9a-fA-F]{6}$/.test(s);

/* ------------------------------------------------------------------ */
/* CSS builders                                                        */
/* ------------------------------------------------------------------ */

export const layerToBoxCss = (l: ShadowLayer | LayerDraft): string => {
  const color = hexToRGBA(l.color, l.opacity);
  return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${color}`;
};

export const layerToTextCss = (l: ShadowLayer | LayerDraft): string => {
  const color = hexToRGBA(l.color, l.opacity);
  return `${l.x}px ${l.y}px ${l.blur}px ${color}`;
};

export const layerToCss = (l: ShadowLayer | LayerDraft, mode: ShadowMode): string =>
  mode === "box" ? layerToBoxCss(l) : layerToTextCss(l);

/** Visible layers only, joined for a single-line value (preview / Tailwind). */
export const shadowValueSingleLine = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string =>
  layers
    .filter((l) => l.visible !== false)
    .map((l) => layerToCss(l, mode))
    .join(", ");

/** Visible layers joined across lines for readable declaration output. */
export const shadowValueMultiline = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string =>
  layers
    .filter((l) => l.visible !== false)
    .map((l) => layerToCss(l, mode))
    .join(",\n  ");

export const shadowProperty = (mode: ShadowMode): string =>
  mode === "box" ? "box-shadow" : "text-shadow";

export const shadowVariableName = (mode: ShadowMode): string =>
  mode === "box" ? "--shadow" : "--text-shadow";

export const shadowDeclaration = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string => `${shadowProperty(mode)}: ${shadowValueMultiline(layers, mode)};`;

export const shadowVariableDeclaration = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string =>
  `${shadowVariableName(mode)}: ${shadowValueMultiline(layers, mode)};`;

export const shadowTailwindClass = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string => {
  const value = shadowValueSingleLine(layers, mode).replace(/ /g, "_");
  return mode === "box" ? `shadow-[${value}]` : `[text-shadow:${value}]`;
};

export const shadowCssFileBody = (
  layers: (ShadowLayer | LayerDraft)[],
  mode: ShadowMode
): string => {
  const selector = mode === "box" ? ".shadow" : ".shadow-text";
  const value = shadowValueMultiline(layers, mode);
  return `${selector} {\n  ${shadowProperty(mode)}: ${value};\n}\n`;
};

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_BOX_LAYER: LayerDraft = {
  x: 0,
  y: 8,
  blur: 20,
  spread: -4,
  color: "#000000",
  opacity: 0.12,
  inset: false,
};

export const DEFAULT_TEXT_LAYER: LayerDraft = {
  x: 0,
  y: 2,
  blur: 8,
  spread: 0,
  color: "#000000",
  opacity: 0.35,
  inset: false,
};

export const DEFAULT_TEXT_SETTINGS: TextSettings = {
  text: "Shadow Studio",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 56,
  fontWeight: 700,
  lineHeight: 1.15,
  textColor: "#20262E",
  align: "center",
};

export const DEFAULT_PREVIEW = {
  previewBg: "#F4F6F2",
  boxBg: "#FFFFFF",
  boxRadius: 16,
  previewShape: "card" as PreviewShape,
};

/* ------------------------------------------------------------------ */
/* Layer helpers                                                       */
/* ------------------------------------------------------------------ */

export const blayer = (
  x: number,
  y: number,
  blur: number,
  spread: number,
  color: string,
  opacity: number,
  inset = false
): LayerDraft => ({ x, y, blur, spread, color, opacity, inset });

export const tlayer = (
  x: number,
  y: number,
  blur: number,
  color: string,
  opacity: number
): LayerDraft => ({ x, y, blur, spread: 0, color, opacity, inset: false });

/* ------------------------------------------------------------------ */
/* Presets                                                             */
/* ------------------------------------------------------------------ */

export interface ShadowPreset {
  nameKey: string;
  noteKey: string;
  layers: LayerDraft[];
}

export const BOX_PRESETS: ShadowPreset[] = [
  {
    nameKey: "presetSubtle",
    noteKey: "presetSubtleNote",
    layers: [
      blayer(0, 1, 3, 0, "#000000", 0.1),
      blayer(0, 1, 2, -1, "#000000", 0.1),
    ],
  },
  {
    nameKey: "presetCard",
    noteKey: "presetCardNote",
    layers: [
      blayer(0, 2, 6, -1, "#000000", 0.08),
      blayer(0, 8, 20, -4, "#000000", 0.12),
    ],
  },
  {
    nameKey: "presetElevated",
    noteKey: "presetElevatedNote",
    layers: [
      blayer(0, 8, 16, -4, "#000000", 0.12),
      blayer(0, 20, 40, -8, "#000000", 0.18),
    ],
  },
  {
    nameKey: "presetFloating",
    noteKey: "presetFloatingNote",
    layers: [
      blayer(0, 24, 48, -12, "#000000", 0.16),
      blayer(0, 8, 16, -6, "#000000", 0.1),
    ],
  },
  {
    nameKey: "presetModal",
    noteKey: "presetModalNote",
    layers: [
      blayer(0, 12, 32, -8, "#000000", 0.22),
      blayer(0, 28, 56, -12, "#000000", 0.26),
    ],
  },
  {
    nameKey: "presetButton",
    noteKey: "presetButtonNote",
    layers: [
      blayer(0, 1, 2, 0, "#000000", 0.18),
      blayer(0, 2, 6, -1, "#000000", 0.12),
    ],
  },
  {
    nameKey: "presetStrong",
    noteKey: "presetStrongNote",
    layers: [
      blayer(0, 6, 12, 0, "#000000", 0.32),
      blayer(0, 2, 4, 0, "#000000", 0.2),
    ],
  },
  {
    nameKey: "presetInset",
    noteKey: "presetInsetNote",
    layers: [blayer(0, 2, 8, 0, "#000000", 0.14, true)],
  },
  {
    nameKey: "presetGlow",
    noteKey: "presetGlowNote",
    layers: [
      blayer(0, 0, 24, 0, "#D97A3F", 0.45),
      blayer(0, 0, 8, 0, "#D97A3F", 0.3),
    ],
  },
  {
    nameKey: "presetNeumorphism",
    noteKey: "presetNeumorphismNote",
    layers: [
      blayer(-6, -6, 12, 0, "#FFFFFF", 0.9),
      blayer(6, 6, 12, 0, "#000000", 0.14),
    ],
  },
];

/** Tapering strip: nearest offset paints first (on top), fade runs outward. */
const LONG_SHADOW: LayerDraft[] = Array.from({ length: 6 }, (_, i) =>
  tlayer(
    (i + 1) * 3,
    (i + 1) * 3,
    i === 5 ? 6 : 0,
    "#000000",
    Math.round((0.45 - i * 0.07) * 100) / 100
  )
);

/** True outline without spread: eight 1px directional offsets, full alpha. */
const OUTLINE: LayerDraft[] = [
  tlayer(1, 0, 0, "#000000", 1),
  tlayer(0, 1, 0, "#000000", 1),
  tlayer(-1, 0, 0, "#000000", 1),
  tlayer(0, -1, 0, "#000000", 1),
  tlayer(1, 1, 0, "#000000", 1),
  tlayer(1, -1, 0, "#000000", 1),
  tlayer(-1, 1, 0, "#000000", 1),
  tlayer(-1, -1, 0, "#000000", 1),
];

export const TEXT_PRESETS: ShadowPreset[] = [
  {
    nameKey: "presetSoft",
    noteKey: "presetSoftNote",
    layers: [tlayer(0, 2, 10, "#000000", 0.4)],
  },
  {
    nameKey: "presetCrisp",
    noteKey: "presetCrispNote",
    layers: [tlayer(2, 2, 0, "#000000", 0.35)],
  },
  {
    nameKey: "presetGlow",
    noteKey: "presetGlowNote",
    layers: [
      tlayer(0, 0, 16, "#D97A3F", 0.8),
      tlayer(0, 0, 4, "#D97A3F", 0.6),
    ],
  },
  {
    nameKey: "presetNeon",
    noteKey: "presetNeonNote",
    layers: [
      tlayer(0, 0, 2, "#FFFFFF", 0.9),
      tlayer(0, 0, 10, "#FF5C8A", 0.9),
      tlayer(0, 0, 24, "#FF5C8A", 0.55),
    ],
  },
  {
    nameKey: "presetEmboss",
    noteKey: "presetEmbossNote",
    layers: [
      tlayer(-1, -1, 1, "#FFFFFF", 0.75),
      tlayer(1, 1, 1, "#000000", 0.45),
    ],
  },
  {
    nameKey: "presetRetro",
    noteKey: "presetRetroNote",
    layers: [
      tlayer(3, 3, 0, "#D97A3F", 1),
      tlayer(6, 6, 0, "#000000", 0.25),
    ],
  },
  {
    nameKey: "preset3d",
    noteKey: "preset3dNote",
    layers: [
      tlayer(1, 1, 0, "#000000", 0.35),
      tlayer(2, 2, 0, "#000000", 0.3),
      tlayer(3, 3, 0, "#000000", 0.25),
      tlayer(4, 5, 6, "#000000", 0.35),
    ],
  },
  {
    nameKey: "presetLongShadow",
    noteKey: "presetLongShadowNote",
    layers: LONG_SHADOW,
  },
  {
    nameKey: "presetOutline",
    noteKey: "presetOutlineNote",
    layers: OUTLINE,
  },
];

export const presetsForMode = (mode: ShadowMode): ShadowPreset[] =>
  mode === "box" ? BOX_PRESETS : TEXT_PRESETS;

/* ------------------------------------------------------------------ */
/* Curated font stacks — already-resolvable families only.             */
/* No remote font request is made for the preview.                     */
/* ------------------------------------------------------------------ */

export const FONT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "'Inter', system-ui, sans-serif", labelKey: "fontInter" },
  { value: "system-ui, -apple-system, sans-serif", labelKey: "fontSystem" },
  { value: "Arial, Helvetica, sans-serif", labelKey: "fontArial" },
  { value: "Verdana, Geneva, sans-serif", labelKey: "fontVerdana" },
  { value: "'Trebuchet MS', sans-serif", labelKey: "fontTrebuchet" },
  { value: "Georgia, 'Times New Roman', serif", labelKey: "fontGeorgia" },
  { value: "'Times New Roman', Times, serif", labelKey: "fontTimes" },
  { value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", labelKey: "fontPalatino" },
  { value: "'Roboto Mono', ui-monospace, monospace", labelKey: "fontRobotoMono" },
  { value: "'Courier New', Courier, monospace", labelKey: "fontCourier" },
];

/** i18n keys for the quick preview-text chips, in display order. */
export const TEXT_SAMPLE_KEYS = [
  "sampleAa",
  "sampleShadow",
  "sampleBrand",
  "sampleCreate",
  "sampleHello",
] as const;

/* ------------------------------------------------------------------ */
/* Ready-to-use examples (rendered below the tool)                     */
/* ------------------------------------------------------------------ */

export interface ShadowExample {
  id: string;
  name: string;
  desc: string;
  mode: ShadowMode;
  layers: LayerDraft[];
  preview?: {
    previewBg?: string;
    boxBg?: string;
    boxRadius?: number;
    previewShape?: PreviewShape;
    text?: Partial<TextSettings>;
  };
}

export const SHADOW_EXAMPLES: ShadowExample[] = [
  {
    id: "soft-card",
    name: "Soft Card",
    desc: "A tight contact shadow under a wide, faint ambient layer — the default lift for cards on a light page.",
    mode: "box",
    layers: [
      blayer(0, 2, 6, -1, "#000000", 0.08),
      blayer(0, 12, 28, -8, "#000000", 0.12),
    ],
  },
  {
    id: "floating-card",
    name: "Floating Card",
    desc: "Large offsets with negative spread, for a surface that clearly sits above the page.",
    mode: "box",
    layers: [
      blayer(0, 24, 48, -12, "#000000", 0.18),
      blayer(0, 8, 16, -6, "#000000", 0.1),
    ],
    preview: { previewShape: "card" },
  },
  {
    id: "button",
    name: "Button",
    desc: "Two tight layers keep the button pressed-looking without adding visual weight.",
    mode: "box",
    layers: [
      blayer(0, 1, 2, 0, "#000000", 0.16),
      blayer(0, 4, 10, -2, "#000000", 0.12),
    ],
    preview: { previewShape: "button", boxRadius: 999 },
  },
  {
    id: "modal",
    name: "Modal",
    desc: "Deep paired layers separate a dialog from the page behind it, including its backdrop.",
    mode: "box",
    layers: [
      blayer(0, 16, 40, -8, "#000000", 0.24),
      blayer(0, 40, 80, -20, "#000000", 0.28),
    ],
    preview: { previewShape: "panel" },
  },
  {
    id: "input",
    name: "Input",
    desc: "A barely-there outline shadow for fields sitting on a card — enough separation, no distraction.",
    mode: "box",
    layers: [
      blayer(0, 1, 3, 0, "#000000", 0.08),
      blayer(0, 0, 0, 1, "#000000", 0.05),
    ],
    preview: { previewShape: "input", boxRadius: 10 },
  },
  {
    id: "inset-field",
    name: "Inset Field",
    desc: "Two inset layers carve the field into its surface, for recessed wells and pressed states.",
    mode: "box",
    layers: [
      blayer(0, 2, 6, 0, "#000000", 0.1, true),
      blayer(0, 1, 2, 0, "#000000", 0.06, true),
    ],
    preview: { previewShape: "input", boxRadius: 10 },
  },
  {
    id: "subtle-border",
    name: "Subtle Border Shadow",
    desc: "Zero blur and a 1px spread reads as a hairline ring — a shadow doing a border's job.",
    mode: "box",
    layers: [blayer(0, 0, 0, 1, "#000000", 0.08)],
    preview: { boxRadius: 12 },
  },
  {
    id: "dark-ui",
    name: "Dark UI",
    desc: "Higher alpha keeps depth visible against dark surfaces — black-on-black needs more contrast.",
    mode: "box",
    layers: [
      blayer(0, 8, 24, -6, "#000000", 0.45),
      blayer(0, 2, 8, -2, "#000000", 0.35),
    ],
    preview: { previewBg: "#191D18", boxBg: "#232924", boxRadius: 16 },
  },
  {
    id: "glow",
    name: "Glow",
    desc: "A colored outer glow with a hot inner core — pair it with a dark background so the color reads.",
    mode: "box",
    layers: [
      blayer(0, 0, 32, 0, "#D97A3F", 0.55),
      blayer(0, 0, 10, 0, "#D97A3F", 0.4),
    ],
    preview: { previewBg: "#191D18", boxBg: "#1F241E", boxRadius: 20 },
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    desc: "Light and dark layers on a matching background — the element grows out of the surface instead of floating.",
    mode: "box",
    layers: [
      blayer(-8, -8, 16, 0, "#FFFFFF", 0.9),
      blayer(8, 8, 16, 0, "#000000", 0.16),
    ],
    preview: { previewBg: "#E4E8E2", boxBg: "#E4E8E2", boxRadius: 24 },
  },
  {
    id: "soft-text",
    name: "Soft Text",
    desc: "One diffuse layer keeps headline copy readable over busy backgrounds without looking smudged.",
    mode: "text",
    layers: [tlayer(0, 2, 8, "#000000", 0.45)],
    preview: { text: { fontSize: 52, fontWeight: 700 } },
  },
  {
    id: "neon-text",
    name: "Neon Text",
    desc: "A white core with a colored halo — needs a dark background and a heavy weight to work.",
    mode: "text",
    layers: [
      tlayer(0, 0, 2, "#FFFFFF", 0.9),
      tlayer(0, 0, 12, "#FF5C8A", 0.9),
      tlayer(0, 0, 28, "#FF5C8A", 0.5),
    ],
    preview: {
      previewBg: "#14161A",
      text: { textColor: "#FFFFFF", fontWeight: 800, fontSize: 56 },
    },
  },
  {
    id: "long-shadow-text",
    name: "Long Shadow Text",
    desc: "Zero-blur layers stepped outward taper into the classic long-shadow strip.",
    mode: "text",
    layers: LONG_SHADOW,
    preview: { text: { fontWeight: 800, fontSize: 52, textColor: "#20262E" } },
  },
];

/* ------------------------------------------------------------------ */
/* Recipes — grouped quick loads for recurring UI jobs                 */
/* ------------------------------------------------------------------ */

export interface ShadowRecipe {
  id: string;
  name: string;
  mode: ShadowMode;
  layers: LayerDraft[];
}

export interface ShadowRecipeGroup {
  title: string;
  items: ShadowRecipe[];
}

export const SHADOW_RECIPE_GROUPS: ShadowRecipeGroup[] = [
  {
    title: "UI Design",
    items: [
      {
        id: "recipe-card",
        name: "Card shadow",
        mode: "box",
        layers: [
          blayer(0, 1, 2, -1, "#000000", 0.06),
          blayer(0, 8, 24, -8, "#000000", 0.12),
        ],
      },
      {
        id: "recipe-modal",
        name: "Modal shadow",
        mode: "box",
        layers: [
          blayer(0, 12, 32, -8, "#000000", 0.2),
          blayer(0, 32, 64, -16, "#000000", 0.25),
        ],
      },
      {
        id: "recipe-dropdown",
        name: "Dropdown shadow",
        mode: "box",
        layers: [
          blayer(0, 4, 8, -2, "#000000", 0.1),
          blayer(0, 12, 24, -6, "#000000", 0.14),
        ],
      },
      {
        id: "recipe-button",
        name: "Button shadow",
        mode: "box",
        layers: [
          blayer(0, 1, 2, 0, "#000000", 0.15),
          blayer(0, 2, 4, -1, "#000000", 0.1),
        ],
      },
      {
        id: "recipe-input",
        name: "Input shadow",
        mode: "box",
        layers: [blayer(0, 1, 3, 0, "#000000", 0.08, true)],
      },
    ],
  },
  {
    title: "Modern Web Design",
    items: [
      {
        id: "recipe-soft-elevation",
        name: "Soft elevation",
        mode: "box",
        layers: [
          blayer(0, 2, 4, -1, "#000000", 0.06),
          blayer(0, 6, 16, -4, "#000000", 0.1),
        ],
      },
      {
        id: "recipe-floating",
        name: "Floating card",
        mode: "box",
        layers: [
          blayer(0, 16, 32, -8, "#000000", 0.14),
          blayer(0, 4, 10, -4, "#000000", 0.08),
        ],
      },
      {
        id: "recipe-subtle-surface",
        name: "Subtle surface",
        mode: "box",
        layers: [blayer(0, 1, 3, 0, "#000000", 0.05)],
      },
      {
        id: "recipe-layered-depth",
        name: "Layered depth",
        mode: "box",
        layers: [
          blayer(0, 1, 2, 0, "#000000", 0.05),
          blayer(0, 4, 8, -2, "#000000", 0.08),
          blayer(0, 12, 32, -8, "#000000", 0.12),
        ],
      },
    ],
  },
  {
    title: "Effects",
    items: [
      {
        id: "recipe-glow",
        name: "Glow",
        mode: "box",
        layers: [
          blayer(0, 0, 28, 0, "#2DD4BF", 0.5),
          blayer(0, 0, 8, 0, "#2DD4BF", 0.35),
        ],
      },
      {
        id: "recipe-neon",
        name: "Neon",
        mode: "text",
        layers: [
          tlayer(0, 0, 2, "#FFFFFF", 0.9),
          tlayer(0, 0, 10, "#FF5C8A", 0.9),
          tlayer(0, 0, 24, "#FF5C8A", 0.55),
        ],
      },
      {
        id: "recipe-inset",
        name: "Inset",
        mode: "box",
        layers: [blayer(0, 3, 10, 0, "#000000", 0.15, true)],
      },
      {
        id: "recipe-emboss",
        name: "Emboss",
        mode: "text",
        layers: [
          tlayer(-1, -1, 1, "#FFFFFF", 0.75),
          tlayer(1, 1, 1, "#000000", 0.45),
        ],
      },
      {
        id: "recipe-retro",
        name: "Retro",
        mode: "text",
        layers: [
          tlayer(3, 3, 0, "#D97A3F", 1),
          tlayer(6, 6, 0, "#000000", 0.25),
        ],
      },
      {
        id: "recipe-3d",
        name: "3D",
        mode: "text",
        layers: [
          tlayer(1, 1, 0, "#000000", 0.35),
          tlayer(2, 2, 0, "#000000", 0.3),
          tlayer(3, 3, 0, "#000000", 0.25),
          tlayer(4, 5, 6, "#000000", 0.35),
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Randomizer — constrained archetypes, never unusable extremes        */
/* ------------------------------------------------------------------ */

const rnd = (min: number, max: number): number => min + Math.random() * (max - min);
const rint = (min: number, max: number): number => Math.round(rnd(min, max));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const GLOW_COLORS = ["#D97A3F", "#4FA3D9", "#2DD4BF", "#E05A8A", "#A78BFA"] as const;
const NEON_COLORS = ["#FF5C8A", "#4FA3D9", "#2DD4BF", "#FBBF24"] as const;

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const randomBoxLayers = (): LayerDraft[] => {
  switch (rint(0, 4)) {
    case 0: {
      // subtle UI
      const layers: LayerDraft[] = [
        blayer(0, rint(1, 3), rint(4, 10), rint(-2, 0), "#000000", round2(rnd(0.06, 0.12))),
      ];
      if (Math.random() > 0.5) {
        layers.push(blayer(0, rint(4, 8), rint(12, 20), rint(-6, -2), "#000000", round2(rnd(0.06, 0.1))));
      }
      return layers;
    }
    case 1: {
      // elevated card
      return [
        blayer(rint(-2, 2), rint(4, 8), rint(10, 16), rint(-4, -1), "#000000", round2(rnd(0.08, 0.12))),
        blayer(rint(-2, 2), rint(14, 24), rint(28, 44), rint(-10, -6), "#000000", round2(rnd(0.1, 0.16))),
      ];
    }
    case 2: {
      // soft floating
      return [
        blayer(rint(-4, 4), rint(18, 30), rint(40, 56), rint(-14, -8), "#000000", round2(rnd(0.1, 0.15))),
        blayer(rint(-2, 2), rint(6, 12), rint(14, 22), rint(-6, -2), "#000000", round2(rnd(0.06, 0.1))),
      ];
    }
    case 3: {
      // glow
      const c = pick(GLOW_COLORS);
      return [
        blayer(0, 0, rint(20, 36), 0, c, round2(rnd(0.35, 0.55))),
        blayer(0, 0, rint(6, 12), 0, c, round2(rnd(0.25, 0.4))),
      ];
    }
    default: {
      // dark UI — needs higher alpha to read
      return [
        blayer(rint(-2, 2), rint(6, 12), rint(20, 32), rint(-8, -4), "#000000", round2(rnd(0.35, 0.5))),
        blayer(rint(-1, 1), rint(2, 4), rint(6, 12), rint(-4, -1), "#000000", round2(rnd(0.25, 0.4))),
      ];
    }
  }
};

export const randomTextLayers = (): LayerDraft[] => {
  switch (rint(0, 3)) {
    case 0:
      // soft
      return [tlayer(rint(-1, 1), rint(1, 3), rint(6, 14), "#000000", round2(rnd(0.3, 0.5)))];
    case 1:
      // crisp
      return [tlayer(rint(1, 3), rint(1, 3), 0, "#000000", round2(rnd(0.3, 0.5)))];
    case 2: {
      // neon text
      const c = pick(NEON_COLORS);
      return [
        tlayer(0, 0, 2, "#FFFFFF", 0.9),
        tlayer(0, 0, rint(8, 14), c, 0.9),
        tlayer(0, 0, rint(20, 30), c, round2(rnd(0.45, 0.6))),
      ];
    }
    default: {
      // retro text
      const c = pick(GLOW_COLORS);
      const step = rint(2, 5);
      return [
        tlayer(step, step, 0, c, 1),
        tlayer(step * 2, step * 2, 0, "#000000", round2(rnd(0.2, 0.3))),
      ];
    }
  }
};

export const randomLayersFor = (mode: ShadowMode): LayerDraft[] =>
  mode === "box" ? randomBoxLayers() : randomTextLayers();

/* ------------------------------------------------------------------ */
/* Share URLs — configuration only, encoded client-side, never uploaded */
/* ------------------------------------------------------------------ */

const b64urlEncode = (s: string): string =>
  btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64urlDecode = (s: string): string =>
  atob(s.replace(/-/g, "+").replace(/_/g, "/"));

const stripLayer = (l: ShadowLayer): unknown[] => [
  l.x,
  l.y,
  l.blur,
  l.spread,
  l.color,
  l.opacity,
  l.inset ? 1 : 0,
  l.visible === false ? 1 : 0,
];

export const encodeStudioConfig = (cfg: StudioConfig): string => {
  const payload = {
    v: 1,
    m: cfg.mode,
    b: cfg.boxLayers.map(stripLayer),
    t: cfg.textLayers.map(stripLayer),
    p: [cfg.previewBg, cfg.boxBg, cfg.boxRadius, cfg.previewShape],
    s: [
      cfg.text.text,
      cfg.text.fontFamily,
      cfg.text.fontSize,
      cfg.text.fontWeight,
      cfg.text.lineHeight,
      cfg.text.textColor,
      cfg.text.align,
    ],
  };
  return b64urlEncode(JSON.stringify(payload));
};

const sanitizeLayerList = (raw: unknown): ShadowLayer[] | null => {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 8) return null;
  const out: ShadowLayer[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as unknown[];
    if (!Array.isArray(item) || item.length < 7) return null;
    const [x, y, blur, spread, color, opacity, inset, hidden] = item;
    if (
      typeof x !== "number" || !Number.isFinite(x) ||
      typeof y !== "number" || !Number.isFinite(y) ||
      typeof blur !== "number" || !Number.isFinite(blur) ||
      typeof spread !== "number" || !Number.isFinite(spread) ||
      !isHexColor(color) ||
      typeof opacity !== "number" || !Number.isFinite(opacity)
    ) {
      return null;
    }
    out.push({
      id: `s${Date.now().toString(36)}${i}${Math.floor(Math.random() * 1e4).toString(36)}`,
      x: clamp(Math.round(x), -200, 200),
      y: clamp(Math.round(y), -200, 200),
      blur: clamp(Math.round(blur), 0, 300),
      spread: clamp(Math.round(spread), -100, 100),
      color: (color.startsWith("#") ? color : `#${color}`).toUpperCase(),
      opacity: clamp(opacity, 0, 1),
      inset: inset === 1 || inset === true,
      ...(hidden === 1 || hidden === true ? { visible: false } : {}),
    });
  }
  return out;
};

const SHAPES: PreviewShape[] = ["card", "button", "panel", "input", "floating"];
const ALIGNS: TextAlign[] = ["left", "center", "right"];

/** Decode a `#s=…` share token. Returns null for anything malformed. */
export const decodeStudioConfig = (token: string): StudioConfig | null => {
  try {
    const raw = JSON.parse(b64urlDecode(token)) as Record<string, unknown>;
    if (!raw || raw.v !== 1) return null;
    const boxLayers = sanitizeLayerList(raw.b);
    const textLayers = sanitizeLayerList(raw.t);
    if (!boxLayers || !textLayers) return null;
    const mode: ShadowMode = raw.m === "text" ? "text" : "box";
    const p = Array.isArray(raw.p) ? raw.p : [];
    const previewBg = isHexColor(p[0]) ? (p[0] as string).toUpperCase() : DEFAULT_PREVIEW.previewBg;
    const boxBg = isHexColor(p[1]) ? (p[1] as string).toUpperCase() : DEFAULT_PREVIEW.boxBg;
    const boxRadius = typeof p[2] === "number" ? clamp(Math.round(p[2]), 0, 96) : DEFAULT_PREVIEW.boxRadius;
    const previewShape = (SHAPES as string[]).includes(String(p[3]))
      ? (p[3] as PreviewShape)
      : DEFAULT_PREVIEW.previewShape;
    const s = Array.isArray(raw.s) ? raw.s : [];
    const text: TextSettings = {
      text: typeof s[0] === "string" ? s[0].slice(0, 120) : DEFAULT_TEXT_SETTINGS.text,
      fontFamily: typeof s[1] === "string" ? s[1].slice(0, 160) : DEFAULT_TEXT_SETTINGS.fontFamily,
      fontSize: typeof s[2] === "number" ? clamp(Math.round(s[2]), 8, 160) : DEFAULT_TEXT_SETTINGS.fontSize,
      fontWeight: typeof s[3] === "number" ? clamp(Math.round(s[3]), 100, 900) : DEFAULT_TEXT_SETTINGS.fontWeight,
      lineHeight:
        typeof s[4] === "number" ? clamp(Math.round(s[4] * 100) / 100, 0.6, 3) : DEFAULT_TEXT_SETTINGS.lineHeight,
      textColor: isHexColor(s[5]) ? (s[5] as string).toUpperCase() : DEFAULT_TEXT_SETTINGS.textColor,
      align: (ALIGNS as string[]).includes(String(s[6])) ? (s[6] as TextAlign) : DEFAULT_TEXT_SETTINGS.align,
    };
    return {
      mode,
      boxLayers,
      textLayers,
      previewBg,
      boxBg,
      boxRadius,
      previewShape,
      text,
    };
  } catch {
    return null;
  }
};
