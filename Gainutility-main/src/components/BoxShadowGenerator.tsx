/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility — CSS Shadow Studio (box-shadow + text-shadow generator).
 *
 * Task-first workspace ordered the same on every viewport: shadow type →
 * live preview → presets → controls → output. The single panel stack runs in
 * two modes — box-shadow and text-shadow — with independent layer stacks, so
 * both properties live in one tool without splitting the workflow. Text mode
 * adds preview-only typography controls inside the preview panel (font, size,
 * weight, line height, color, alignment) that never leak into the CSS.
 *
 * Output supports a CSS declaration, a bare value, a CSS variable, and a
 * Tailwind arbitrary value, plus one-click share links (configuration encoded
 * in the URL fragment, never uploaded), a .css download, randomize, and a
 * mode-aware importer that parses existing box-shadow / text-shadow CSS back
 * into editable controls.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Layers,
  MousePointerClick,
  ClipboardPaste,
  Shuffle,
  Share2,
  Download,
  Files,
  Box,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Info,
} from "lucide-react";
import { tt, ttf } from "../i18n/toolUi";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/boxShadowGenerator";
import type { ViewState } from "../types";
import { Button } from "./Common";
import { CustomSelect } from "./CustomSelect";
import {
  type ShadowMode,
  type ShadowLayer,
  type ShadowPreset,
  type PreviewShape,
  type TextSettings,
  type StudioConfig,
  type ApplyRequest,
  DEFAULT_BOX_LAYER,
  DEFAULT_TEXT_LAYER,
  DEFAULT_TEXT_SETTINGS,
  DEFAULT_PREVIEW,
  presetsForMode,
  FONT_OPTIONS,
  TEXT_SAMPLE_KEYS,
  layerToBoxCss,
  layerToTextCss,
  layerToCss,
  shadowValueSingleLine,
  shadowValueMultiline,
  shadowDeclaration,
  shadowVariableDeclaration,
  shadowTailwindClass,
  shadowCssFileBody,
  encodeStudioConfig,
  decodeStudioConfig,
  randomLayersFor,
} from "../lib/shadowStudio";
import { trackToolEvent } from "../lib/analytics";
import { ShadowStudioContent } from "./ShadowStudioContent";
import { useToolStateRestoration } from "../lib/toolStateStore";

interface BoxShadowGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

type OutputFormat = "css" | "variable" | "tailwind";

const MAX_LAYERS = 8;

const EMPTY_SHADOW: ShadowLayer = {
  id: "s-empty",
  x: 0,
  y: 0,
  blur: 0,
  spread: 0,
  color: "#000000",
  opacity: 0,
  inset: false,
};

const BACKGROUND_SWATCHES = [
  { labelKey: "bgLight", value: "#F4F6F2" },
  { labelKey: "bgWhite", value: "#FFFFFF" },
  { labelKey: "bgWarm", value: "#FAF8F1" },
  { labelKey: "bgGray", value: "#E8EAE6" },
  { labelKey: "bgDark", value: "#191D18" },
];

const PREVIEW_SHAPES: { id: PreviewShape; labelKey: string; sizeClass: string }[] = [
  { id: "card", labelKey: "shapeCard", sizeClass: "w-44 h-44 sm:w-52 sm:h-52" },
  { id: "button", labelKey: "shapeButton", sizeClass: "w-44 h-14 sm:w-56 sm:h-16" },
  { id: "panel", labelKey: "shapePanel", sizeClass: "w-64 h-40 sm:w-80 sm:h-48" },
  { id: "input", labelKey: "shapeInput", sizeClass: "w-64 h-14 sm:w-80 sm:h-16" },
  { id: "floating", labelKey: "shapeFloating", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
];

const FORMATS: { id: OutputFormat; labelKey: string }[] = [
  { id: "css", labelKey: "formatCss" },
  { id: "variable", labelKey: "formatCssVariable" },
  { id: "tailwind", labelKey: "formatTailwind" },
];

const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800, 900];

/* ------------------------------------------------------------------ */
/* Color + import parsing helpers                                      */
/* ------------------------------------------------------------------ */

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  silver: "#c0c0c0",
  maroon: "#800000",
  navy: "#000080",
  teal: "#008080",
  lime: "#00ff00",
  transparent: "#000000",
};

const clampNum = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));
const clamp255 = (n: number): number => Math.min(255, Math.max(0, Math.round(n)));

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[clamp255(r), clamp255(g), clamp255(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/** Split a shadow value into its top-level comma-separated shadows. */
const splitTopLevel = (input: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "," && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
};

/** Tokenize one shadow while keeping parenthesized color functions intact. */
const tokenizeLayer = (s: string): string[] => {
  const tokens: string[] = [];
  const re = /(?:[a-zA-Z]+\([^)]*\))|(?:\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) tokens.push(m[0]);
  return tokens;
};

const parseChannel = (t: string): number | null => {
  const trimmed = t.trim();
  if (!trimmed) return null;
  const v = parseFloat(trimmed);
  if (!Number.isFinite(v)) return null;
  return trimmed.endsWith("%") ? (v / 100) * 255 : v;
};

const parseAlpha = (t: string): number | null => {
  const trimmed = t.trim();
  if (!trimmed) return null;
  const v = parseFloat(trimmed);
  if (!Number.isFinite(v)) return null;
  const a = trimmed.endsWith("%") ? v / 100 : v;
  return a < 0 ? 0 : a > 1 ? 1 : a;
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number] = [0, 0, 0];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
};

interface ParsedColor {
  hex: string;
  alpha: number;
}

const parseFunctionChannels = (inner: string): string[] => {
  const cleaned = inner.replace(/\s*,\s*/g, ",").trim();
  if (cleaned.includes(",")) return cleaned.split(",").map((s) => s.trim());
  return cleaned.split(/\s+/).filter(Boolean);
};

const parseColorToken = (token: string): ParsedColor | null => {
  const t = token.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) {
    const hex = t.slice(1);
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const aHex = expanded.length === 8 ? expanded.slice(6) : "";
    const alpha = aHex ? parseInt(aHex, 16) / 255 : 1;
    return { hex: `#${expanded.slice(0, 6).toUpperCase()}`, alpha };
  }
  const func = /^(rgba?|hsla?)\(\s*(.+?)\s*\)$/i.exec(t);
  if (func) {
    const kind = func[1].toLowerCase();
    const channels = parseFunctionChannels(func[2]);
    const alphaIdx = kind === "rgba" || kind === "hsla" ? 3 : -1;
    if (channels.length < 3) return null;
    const base = channels.slice(0, 3);
    let alpha = 1;
    if (alphaIdx !== -1 && channels[alphaIdx]) {
      const a = parseAlpha(channels[alphaIdx]);
      if (a === null) return null;
      alpha = a;
    }
    if (kind.startsWith("hsl")) {
      const h = parseFloat(base[0]);
      const s = parseChannel(base[1]);
      const l = parseChannel(base[2]);
      if (!Number.isFinite(h) || s === null || l === null) return null;
      const [r, g, b] = hslToRgb(h, clampNum(s, 0, 100) / 100, clampNum(l, 0, 100) / 100);
      return { hex: rgbToHex(r, g, b), alpha };
    }
    const r = parseChannel(base[0]);
    const g = parseChannel(base[1]);
    const b = parseChannel(base[2]);
    if (r === null || g === null || b === null) return null;
    return { hex: rgbToHex(r, g, b), alpha };
  }
  const named = NAMED_COLORS[t.toLowerCase()];
  if (named) return { hex: named.toUpperCase(), alpha: 1 };
  return null;
};

const isLength = (t: string): boolean => /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px)?$/i.test(t);

/**
 * Parse one shadow layer for the given target property.
 * box-shadow accepts 2–4 lengths plus inset; text-shadow accepts 2–3
 * lengths and rejects inset (it has no spread radius).
 */
const parseLayer = (raw: string, target: ShadowMode): Omit<ShadowLayer, "id"> | null => {
  let inset = false;
  const lengths: number[] = [];
  let colorHex: string | null = null;
  let alpha = 1;
  for (const tok of tokenizeLayer(raw)) {
    const t = tok.trim();
    if (!t) continue;
    if (/^inset$/i.test(t)) {
      inset = true;
      continue;
    }
    if (isLength(t)) {
      lengths.push(parseFloat(t));
      continue;
    }
    const c = parseColorToken(t);
    if (c) {
      colorHex = c.hex;
      alpha = c.alpha;
      continue;
    }
    return null;
  }
  if (target === "text") {
    if (inset || lengths.length < 2 || lengths.length > 3) return null;
    const [x, y, blur = 0] = lengths;
    if (blur < 0) return null;
    return {
      x: clampNum(x, -100, 100),
      y: clampNum(y, -100, 100),
      blur: clampNum(blur, 0, 150),
      spread: 0,
      color: colorHex ?? "#000000",
      opacity: clampNum(alpha, 0, 1),
      inset: false,
    };
  }
  if (lengths.length < 2 || lengths.length > 4) return null;
  const [x, y, blur = 0, spread = 0] = lengths;
  if (blur < 0) return null;
  return {
    x: clampNum(x, -100, 100),
    y: clampNum(y, -100, 100),
    blur: clampNum(blur, 0, 150),
    spread: clampNum(spread, -50, 50),
    color: colorHex ?? "#000000",
    opacity: clampNum(alpha, 0, 1),
    inset,
  };
};

const newId = (): string => `s${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

/** Labeled range slider with a directly editable numeric value. */
const SliderField: React.FC<{
  label: string;
  locale: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, locale, value, min, max, step = 1, unit = "", onChange }) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));
  const [draft, setDraft] = useState<string>(String(value));
  const [editing, setEditing] = useState(false);
  const sliderAria = ttf("box-shadow-generator", "sliderAria", locale, { label });
  const valueAria = ttf("box-shadow-generator", "valueAria", locale, { label });
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const commitDraft = (raw: string, moveOn = false) => {
    setDraft(raw);
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(clamp(n));
    if (moveOn) setEditing(false);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[13px] sm:text-[14px] font-medium text-text-sub select-none">{label}</label>
        <span className="font-mono text-[16px] sm:text-[17px] font-bold text-text-main tabular-nums tracking-tight">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={sliderAria}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="gu-slider-input"
        />
        <input
          type="number"
          aria-label={valueAria}
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(e) => commitDraft(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            const n = Number(draft);
            commitDraft(Number.isFinite(n) ? String(clamp(n)) : String(value), true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          inputMode="decimal"
          className="gu-focus h-[42px] w-[74px] shrink-0 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 text-center font-mono text-[15px] sm:text-[16px] font-bold text-text-main outline-none tabular-nums transition-colors"
        />
      </div>
    </div>
  );
};

const Panel: React.FC<{
  title?: string;
  hint?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, hint, actions, className = "", children }) => (
  <section
    className={`flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-base p-5 sm:p-6 shadow-premium-sm ${className}`}
  >
    {(title || actions) && (
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && (
            <h2 className="text-[16px] sm:text-[17px] font-bold text-text-main tracking-tight">{title}</h2>
          )}
          {hint && <p className="mt-0.5 text-[13px] leading-relaxed text-text-muted">{hint}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

/* ------------------------------------------------------------------ */
/* The tool                                                             */
/* ------------------------------------------------------------------ */

export const BoxShadowGenerator: React.FC<BoxShadowGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView,
}) => {
  const locale = useLocale();
  const [mode, setMode] = useState<ShadowMode>("box");
  const [stacks, setStacks] = useState<{ box: ShadowLayer[]; text: ShadowLayer[] }>(() => ({
    box: [{ ...DEFAULT_BOX_LAYER, id: newId() }],
    text: [{ ...DEFAULT_TEXT_LAYER, id: newId() }],
  }));
  const [activeIds, setActiveIds] = useState<{ box: string; text: string }>(() => {
    const box = newId();
    const text = newId();
    return { box, text };
  });
  const [text, setText] = useState<TextSettings>(DEFAULT_TEXT_SETTINGS);
  const [previewBg, setPreviewBg] = useState<string>(DEFAULT_PREVIEW.previewBg);
  const [boxBg, setBoxBg] = useState<string>(DEFAULT_PREVIEW.boxBg);
  const [boxRadius, setBoxRadius] = useState<number>(DEFAULT_PREVIEW.boxRadius);
  const [previewShape, setPreviewShape] = useState<PreviewShape>(DEFAULT_PREVIEW.previewShape);
  const [showStack, setShowStack] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [format, setFormat] = useState<OutputFormat>("css");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("presetSubtle");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const copiedTimer = useRef<number | null>(null);

  // Persist tool state for Back/Forward navigation
  const getSerializableState = useCallback(() => ({
    mode,
    stacks,
    activeIds,
    text,
    previewBg,
    boxBg,
    boxRadius,
    previewShape,
    showStack,
    showAdvanced,
    format,
  }), [mode, stacks, activeIds, text, previewBg, boxBg, boxRadius, previewShape, showStack, showAdvanced, format]);

  const restoreState = useCallback((saved: unknown) => {
    const s = saved as Partial<{
      mode: ShadowMode;
      stacks: { box: ShadowLayer[]; text: ShadowLayer[] };
      activeIds: { box: string; text: string };
      text: TextSettings;
      previewBg: string;
      boxBg: string;
      boxRadius: number;
      previewShape: PreviewShape;
      showStack: boolean;
      showAdvanced: boolean;
      format: OutputFormat;
    }>;
    if (!s) return;
    if (s.mode) setMode(s.mode);
    if (s.stacks) setStacks(s.stacks);
    if (s.activeIds) setActiveIds(s.activeIds);
    if (s.text) setText(s.text);
    if (s.previewBg) setPreviewBg(s.previewBg);
    if (s.boxBg) setBoxBg(s.boxBg);
    if (typeof s.boxRadius === "number") setBoxRadius(s.boxRadius);
    if (s.previewShape) setPreviewShape(s.previewShape);
    if (typeof s.showStack === "boolean") setShowStack(s.showStack);
    if (typeof s.showAdvanced === "boolean") setShowAdvanced(s.showAdvanced);
    if (s.format) setFormat(s.format);
  }, []);

  useToolStateRestoration("box-shadow-generator", getSerializableState, restoreState);

  const layers = stacks[mode];
  const activeId = activeIds[mode];

  const activeLayer = useMemo(
    () => layers.find((l) => l.id === activeId) ?? layers[0] ?? EMPTY_SHADOW,
    [layers, activeId]
  );

  const fontSelectOptions = useMemo(
    () =>
      FONT_OPTIONS.map((f) => ({
        value: f.value,
        label: tt("box-shadow-generator", f.labelKey, locale),
      })),
    [locale]
  );

  const weightSelectOptions = useMemo(
    () =>
      FONT_WEIGHTS.map((w) => ({
        value: w,
        label: String(w),
      })),
    []
  );

  /* Auto-open Advanced when the advanced controls actually matter: multiple
     layers, or an inset box-shadow. */
  useEffect(() => {
    if (layers.length > 1 || (mode === "box" && activeLayer.inset)) setShowAdvanced(true);
  }, [layers.length, mode, activeLayer.inset]);

  const visibleLayers = useMemo(() => layers.filter((l) => l.visible !== false), [layers]);
  /* Never emit an empty declaration: if every layer is muted, export the stack. */
  const outputLayers = visibleLayers.length > 0 ? visibleLayers : layers;

  const cssDeclaration = shadowDeclaration(outputLayers, mode);
  const cssVariable = shadowVariableDeclaration(outputLayers, mode);
  const singleLineValue = shadowValueSingleLine(outputLayers, mode);
  const tailwindOutput = shadowTailwindClass(outputLayers, mode);
  const previewShadow = shadowValueSingleLine(visibleLayers, mode);

  const outputFor = (fmt: OutputFormat): string => {
    if (fmt === "css") return cssDeclaration;
    if (fmt === "variable") return cssVariable;
    return tailwindOutput;
  };

  const updateField = useCallback(
    (field: keyof Omit<ShadowLayer, "id">, value: number | string | boolean) => {
      setStacks((prev) => ({
        ...prev,
        [mode]: prev[mode].map((l) => (l.id === activeId ? { ...l, [field]: value } : l)),
      }));
      setSelectedPreset(null);
    },
    [mode, activeId]
  );

  const setTextField = useCallback((patch: Partial<TextSettings>) => {
    setText((prev) => ({ ...prev, ...patch }));
  }, []);

  /* Local clipboard with inline button feedback; falls back to the app-level
     copy helper (which toasts) when the Clipboard API is unavailable. */
  const copyLocal = useCallback(
    async (value: string, key: string) => {
      let ok = false;
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(value);
          ok = true;
        }
      } catch {
        ok = false;
      }
      if (!ok) {
        onCopy(value);
        return;
      }
      setCopiedKey(key);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopiedKey(null), 2200);
    },
    [onCopy]
  );

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  /* Load a shared configuration from the URL fragment (#s=…). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.location.hash.match(/^#s=(.+)$/);
    if (!m) return;
    const cfg = decodeStudioConfig(m[1]);
    if (!cfg) {
      onAddToast(
        tt("box-shadow-generator", "shareInvalidToast", locale, "Couldn't load these share settings"),
        "warning"
      );
      return;
    }
    setStacks({ box: cfg.boxLayers, text: cfg.textLayers });
    setActiveIds({ box: cfg.boxLayers[0].id, text: cfg.textLayers[0].id });
    setMode(cfg.mode);
    setPreviewBg(cfg.previewBg);
    setBoxBg(cfg.boxBg);
    setBoxRadius(cfg.boxRadius);
    setPreviewShape(cfg.previewShape);
    setText(cfg.text);
    const stack = cfg.mode === "box" ? cfg.boxLayers : cfg.textLayers;
    setShowStack(stack.length > 1);
    setSelectedPreset(null);
    onAddToast(
      tt("box-shadow-generator", "shareLoadedToast", locale, "Shared shadow settings loaded"),
      "success"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (next: ShadowMode) => {
    if (next === mode) return;
    setMode(next);
    setSelectedPreset(next === "box" ? "presetSubtle" : "presetSoft");
    trackToolEvent("box-shadow-generator", "shadow_type_selected", next);
  };

  const applyPreset = (preset: ShadowPreset) => {
    const next = preset.layers.map((l) => ({ ...l, id: newId() }));
    setStacks((prev) => ({ ...prev, [mode]: next }));
    setActiveIds((prev) => ({ ...prev, [mode]: next[0].id }));
    setShowStack(next.length > 1);
    setSelectedPreset(preset.nameKey);
    trackToolEvent("box-shadow-generator", "preset_selected", mode);
  };

  const reset = () => {
    const base = mode === "box" ? DEFAULT_BOX_LAYER : DEFAULT_TEXT_LAYER;
    const next = [{ ...base, id: newId() }];
    setStacks((prev) => ({ ...prev, [mode]: next }));
    setActiveIds((prev) => ({ ...prev, [mode]: next[0].id }));
    setPreviewBg(DEFAULT_PREVIEW.previewBg);
    setBoxBg(DEFAULT_PREVIEW.boxBg);
    setBoxRadius(DEFAULT_PREVIEW.boxRadius);
    setPreviewShape(DEFAULT_PREVIEW.previewShape);
    setText(DEFAULT_TEXT_SETTINGS);
    setSelectedPreset(mode === "box" ? "presetSubtle" : "presetSoft");
    onAddToast(tt("box-shadow-generator", "resetToast", locale, "Shadow reset to default"), "info");
  };

  const randomize = () => {
    const next = randomLayersFor(mode).map((l) => ({ ...l, id: newId() }));
    setStacks((prev) => ({ ...prev, [mode]: next }));
    setActiveIds((prev) => ({ ...prev, [mode]: next[0].id }));
    setShowStack(next.length > 1);
    setSelectedPreset(null);
    trackToolEvent("box-shadow-generator", "randomized", mode);
  };

  const addShadow = () => {
    if (layers.length >= MAX_LAYERS) {
      onAddToast(
        tt("box-shadow-generator", "layerLimitToast", locale, "Up to 8 layers per shadow"),
        "warning"
      );
      return;
    }
    const base = mode === "box" ? DEFAULT_BOX_LAYER : DEFAULT_TEXT_LAYER;
    const next: ShadowLayer = { ...base, id: newId() };
    setStacks((prev) => ({ ...prev, [mode]: [...prev[mode], next] }));
    setActiveIds((prev) => ({ ...prev, [mode]: next.id }));
    setShowStack(true);
    trackToolEvent("box-shadow-generator", "layer_added", mode);
  };

  const duplicateShadow = (id: string) => {
    if (layers.length >= MAX_LAYERS) {
      onAddToast(
        tt("box-shadow-generator", "layerLimitToast", locale, "Up to 8 layers per shadow"),
        "warning"
      );
      return;
    }
    const index = layers.findIndex((l) => l.id === id);
    if (index < 0) return;
    const copy: ShadowLayer = { ...layers[index], id: newId() };
    const next = [...layers];
    next.splice(index + 1, 0, copy);
    setStacks((prev) => ({ ...prev, [mode]: next }));
    setActiveIds((prev) => ({ ...prev, [mode]: copy.id }));
    setShowStack(true);
    trackToolEvent("box-shadow-generator", "layer_duplicated", mode);
  };

  const removeShadow = (id: string) => {
    if (layers.length <= 1) {
      onAddToast(
        tt("box-shadow-generator", "keepOneShadowToast", locale, "Keep at least one shadow"),
        "warning"
      );
      return;
    }
    const next = layers.filter((l) => l.id !== id);
    setStacks((prev) => ({ ...prev, [mode]: next }));
    if (activeId === id) setActiveIds((prev) => ({ ...prev, [mode]: next[next.length - 1].id }));
    trackToolEvent("box-shadow-generator", "layer_deleted", mode);
  };

  const moveShadow = (index: number, dir: "up" | "down") => {
    setStacks((prev) => {
      const next = [...prev[mode]];
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, [mode]: next };
    });
    trackToolEvent("box-shadow-generator", "layer_reordered", mode);
  };

  const toggleVisible = (id: string) => {
    setStacks((prev) => ({
      ...prev,
      [mode]: prev[mode].map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }));
  };

  const importShadow = () => {
    setImportError(false);
    setImportedCount(null);
    const raw = (importText ?? "").trim();
    if (!raw) {
      setImportError(true);
      trackToolEvent("box-shadow-generator", "import_failed", mode);
      return;
    }
    /* The property prefix picks the target mode; bare values import into the
       mode that is currently open. */
    const target: ShadowMode = /^text-shadow\s*:/i.test(raw)
      ? "text"
      : /^box-shadow\s*:/i.test(raw)
        ? "box"
        : mode;
    const body = raw
      .replace(/^(?:box-shadow|text-shadow)\s*:/i, "")
      .replace(/;\s*$/, "")
      .trim();
    const parts = splitTopLevel(body);
    const parsed = parts.map((p) => parseLayer(p, target));
    if (parts.length === 0 || parsed.some((l) => l === null)) {
      setImportError(true);
      trackToolEvent("box-shadow-generator", "import_failed", target);
      return;
    }
    const next = (parsed as Omit<ShadowLayer, "id">[]).map((l) => ({ ...l, id: newId() }));
    setStacks((prev) => ({ ...prev, [target]: next }));
    setActiveIds((prev) => ({ ...prev, [target]: next[0].id }));
    setMode(target);
    setShowStack(next.length > 1);
    setImportedCount(next.length);
    setFormat("css");
    trackToolEvent("box-shadow-generator", "import_used", target);
  };

  const createShare = () => {
    try {
      const cfg: StudioConfig = {
        mode,
        boxLayers: stacks.box,
        textLayers: stacks.text,
        previewBg,
        boxBg,
        boxRadius,
        previewShape,
        text,
      };
      const token = encodeStudioConfig(cfg);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#s=${token}`);
        const shareUrl = `${window.location.origin}${window.location.pathname}#s=${token}`;
        void copyLocal(shareUrl, "share");
      }
      trackToolEvent("box-shadow-generator", "share_created", mode);
    } catch {
      onAddToast(
        tt("box-shadow-generator", "shareErrorToast", locale, "Couldn't create a share link"),
        "warning"
      );
    }
  };

  const downloadCss = () => {
    try {
      const body = shadowCssFileBody(outputLayers, mode);
      const blob = new Blob([body], { type: "text/css;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mode === "box" ? "shadow.css" : "shadow-text.css";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackToolEvent("box-shadow-generator", "download_used", mode);
    } catch {
      onAddToast(
        tt("box-shadow-generator", "downloadErrorToast", locale, "Couldn't download the file"),
        "warning"
      );
    }
  };

  /* Below-the-tool sections load presets/examples into this workspace. */
  const applyStudioConfig = useCallback((req: ApplyRequest) => {
    if (req.layers.length > 0) {
      const next = req.layers.map((l) => ({ ...l, id: newId() }));
      setStacks((prev) => ({ ...prev, [req.mode]: next }));
      setActiveIds((prev) => ({ ...prev, [req.mode]: next[0].id }));
      setShowStack(next.length > 1);
    }
    setMode(req.mode);
    const p = req.preview;
    if (p) {
      if (p.previewBg) setPreviewBg(p.previewBg);
      if (p.boxBg) setBoxBg(p.boxBg);
      if (typeof p.boxRadius === "number") setBoxRadius(p.boxRadius);
      if (p.previewShape) setPreviewShape(p.previewShape);
      if (p.text) setText((prev) => ({ ...prev, ...p.text }));
    }
    requestAnimationFrame(() => {
      document
        .getElementById("box-shadow-generator-tool")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const presets = presetsForMode(mode);
  const isBox = mode === "box";

  const copyOutputButton = (
    key: OutputFormat | "value",
    labelKey: string,
    value: string,
    eventName: "copy_css" | "copy_variable" | "copy_tailwind",
    primary = false
  ) => {
    const isCopied = copiedKey === key;
    return (
      <Button
        type="button"
        onClick={() => {
          void copyLocal(value, key);
          trackToolEvent("box-shadow-generator", eventName, mode);
        }}
        variant={isCopied ? "success" : (primary ? "primary" : "outline")}
        size="sm"
        leftIcon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        className="min-h-[44px]"
      >
        {isCopied ? tt("box-shadow-generator", "copied", locale, "Copied") : tt("box-shadow-generator", labelKey, locale)}
      </Button>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 w-full" id="box-shadow-generator-tool">
        {/* 1 — TOP BAR: SHADOW TYPE & WORKSPACE ACTIONS */}
        <section
          className="order-1 lg:col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-base px-4 py-3 shadow-premium-sm"
          aria-label={tt("box-shadow-generator", "shadowTypeAria", locale, "Shadow type: box or text")}
        >
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-text-muted">
              {tt("box-shadow-generator", "shadowType", locale, "Shadow type")}
            </span>
            <div
              className="flex gap-1 rounded-xl bg-surface-muted/50 p-1 border border-border-subtle/60"
              role="radiogroup"
              aria-label={tt("box-shadow-generator", "shadowTypeAria", locale, "Shadow type: box or text")}
            >
              {(
                [
                  { id: "box" as const, icon: <Box className="w-4 h-4" />, labelKey: "modeBox" },
                  { id: "text" as const, icon: <Type className="w-4 h-4" />, labelKey: "modeText" },
                ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === opt.id}
                  onClick={() => switchMode(opt.id)}
                  className={`gu-focus inline-flex items-center gap-2 min-h-[38px] rounded-lg px-3.5 text-[13px] font-semibold transition-all cursor-pointer ${
                    mode === opt.id
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-text-sub hover:text-text-main hover:bg-surface-muted/60"
                  }`}
                >
                  {opt.icon}
                  {tt("box-shadow-generator", opt.labelKey, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={randomize}
              aria-label={tt("box-shadow-generator", "randomizeAria", locale, "Create a random shadow for this type")}
              variant="outline"
              size="sm"
              leftIcon={<Shuffle className="w-4 h-4" />}
              className="min-h-[38px] rounded-xl"
            >
              {tt("box-shadow-generator", "randomize", locale, "Randomize")}
            </Button>
            <Button
              type="button"
              onClick={reset}
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="min-h-[38px] rounded-xl text-text-muted hover:text-text-main"
            >
              {tt("box-shadow-generator", "resetLabel", locale, "Reset")}
            </Button>
          </div>
        </section>

        {/* 2 — LIVE PREVIEW (THE VISUAL ANCHOR: LEFT COLUMN ON DESKTOP, ORDER 2 ON MOBILE) */}
        <section className="order-2 lg:col-span-7">
          <Panel
            title={tt("box-shadow-generator", "livePreviewTitle", locale, "Live preview")}
            hint={tt("box-shadow-generator", "livePreviewHint", locale, "The shadow updates instantly as you adjust.")}
            className="h-full"
          >
            {/* The Canvas */}
            {isBox ? (
              <div
                className="relative flex min-h-[280px] sm:min-h-[360px] lg:min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-border-subtle/80 transition-colors duration-200"
                style={{ backgroundColor: previewBg }}
              >
                <div
                  className={`transition-all duration-150 ${PREVIEW_SHAPES.find((s) => s.id === previewShape)?.sizeClass ?? PREVIEW_SHAPES[0].sizeClass}`}
                  style={{
                    backgroundColor: boxBg,
                    borderRadius: `${boxRadius}px`,
                    boxShadow: previewShadow,
                  }}
                  role="img"
                  aria-label={tt("box-shadow-generator", "previewElementAria", locale, "Preview element")}
                />
              </div>
            ) : (
              <div
                className="relative flex min-h-[280px] sm:min-h-[360px] lg:min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-border-subtle/80 px-6 transition-colors duration-200"
                style={{ backgroundColor: previewBg }}
              >
                <p
                  className="max-w-full break-words whitespace-pre-wrap select-none"
                  style={{
                    fontFamily: text.fontFamily,
                    fontSize: `${text.fontSize}px`,
                    fontWeight: text.fontWeight,
                    lineHeight: text.lineHeight,
                    color: text.textColor,
                    textAlign: text.align,
                    textShadow: previewShadow || undefined,
                  }}
                  role="img"
                  aria-label={tt("box-shadow-generator", "previewElementAria", locale, "Preview element")}
                >
                  {text.text || "Aa"}
                </p>
              </div>
            )}

            {/* In text mode: typography controls with CustomSelect */}
            {!isBox && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="shadow-preview-text"
                    className="text-[13px] font-medium text-text-sub"
                  >
                    {tt("box-shadow-generator", "previewTextLabel", locale, "Preview text")}
                  </label>
                  <input
                    id="shadow-preview-text"
                    type="text"
                    value={text.text}
                    maxLength={80}
                    spellCheck={false}
                    aria-label={tt("box-shadow-generator", "previewTextAria", locale, "Preview text")}
                    onChange={(e) => setTextField({ text: e.target.value })}
                    className="gu-focus h-[42px] rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default px-3 py-2 text-sm text-text-main outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {TEXT_SAMPLE_KEYS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        aria-label={ttf("box-shadow-generator", "sampleAria", locale, { label: tt("box-shadow-generator", k, locale) }, `Use preview text: ${tt("box-shadow-generator", k, locale)}`)}
                        onClick={() => setTextField({ text: tt("box-shadow-generator", k, locale) })}
                        className="gu-focus min-h-[30px] rounded-lg border border-border-subtle/80 bg-surface-muted/40 px-2.5 text-[12px] font-semibold text-text-sub transition-colors hover:border-brand-primary/50 hover:text-brand-primary hover:bg-surface-muted cursor-pointer"
                      >
                        {tt("box-shadow-generator", k, locale)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <CustomSelect
                    id="shadow-font-family"
                    label={tt("box-shadow-generator", "fontFamily", locale, "Font")}
                    value={text.fontFamily}
                    options={fontSelectOptions}
                    onChange={(val) => setTextField({ fontFamily: String(val) })}
                    ariaLabel={tt("box-shadow-generator", "fontFamilyAria", locale, "Preview font")}
                  />
                  <CustomSelect
                    id="shadow-font-weight"
                    label={tt("box-shadow-generator", "fontWeight", locale, "Weight")}
                    value={text.fontWeight}
                    options={weightSelectOptions}
                    onChange={(val) => setTextField({ fontWeight: Number(val) })}
                    ariaLabel={tt("box-shadow-generator", "fontWeightAria", locale, "Font weight")}
                  />
                  <SliderField
                    label={tt("box-shadow-generator", "fontSize", locale, "Font size")}
                    locale={locale}
                    value={text.fontSize}
                    min={12}
                    max={120}
                    unit="px"
                    onChange={(v) => setTextField({ fontSize: v })}
                  />
                  <SliderField
                    label={tt("box-shadow-generator", "lineHeight", locale, "Line height")}
                    locale={locale}
                    value={text.lineHeight}
                    min={0.6}
                    max={2.5}
                    step={0.05}
                    onChange={(v) => setTextField({ lineHeight: Math.round(v * 100) / 100 })}
                  />

                  {/* Text color */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[13px] font-medium text-text-sub">
                        {tt("box-shadow-generator", "textColor", locale, "Text color")}
                      </label>
                      <span className="font-mono text-[15px] font-bold text-text-main tabular-nums">
                        {text.textColor.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        className="relative h-[42px] w-[50px] shrink-0 rounded-xl border border-border-subtle hover:border-border-default cursor-pointer overflow-hidden shadow-xs flex items-center justify-center p-0.5 bg-surface-muted/50"
                        title={tt("box-shadow-generator", "textColorPickerAria", locale, "Text color picker")}
                      >
                        <input
                          type="color"
                          aria-label={tt("box-shadow-generator", "textColorPickerAria", locale, "Text color picker")}
                          value={text.textColor}
                          onChange={(e) => setTextField({ textColor: e.target.value })}
                          className="h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                      </label>
                      <input
                        type="text"
                        aria-label={tt("box-shadow-generator", "textColorHexAria", locale, "Text color hex")}
                        value={text.textColor.toUpperCase()}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                            setTextField({ textColor: v.startsWith("#") ? v : `#${v}` });
                          }
                        }}
                        maxLength={7}
                        spellCheck={false}
                        className="gu-focus h-[42px] min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 px-3 text-center text-[15px] font-mono font-bold text-text-main outline-none uppercase tracking-wider tabular-nums transition-colors"
                      />
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-text-sub">
                      {tt("box-shadow-generator", "textAlign", locale, "Alignment")}
                    </span>
                    <div
                      className="grid grid-cols-3 gap-1 rounded-xl bg-surface-muted/40 p-1 border border-border-subtle/60"
                      role="radiogroup"
                      aria-label={tt("box-shadow-generator", "textAlignAria", locale, "Text alignment")}
                    >
                      {(
                        [
                          { id: "left" as const, icon: <AlignLeft className="w-4 h-4" />, labelKey: "alignLeft" },
                          { id: "center" as const, icon: <AlignCenter className="w-4 h-4" />, labelKey: "alignCenter" },
                          { id: "right" as const, icon: <AlignRight className="w-4 h-4" />, labelKey: "alignRight" },
                        ]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={text.align === opt.id}
                          aria-label={tt("box-shadow-generator", opt.labelKey, locale)}
                          onClick={() => setTextField({ align: opt.id })}
                          className={`gu-focus inline-flex min-h-[38px] items-center justify-center rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                            text.align === opt.id
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "text-text-sub hover:text-text-main hover:bg-surface-muted/60"
                          }`}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview background & Box surface controls */}
            <div className="flex flex-col gap-3.5 pt-2 border-t border-divider">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-[13px] font-medium text-text-sub">
                  {tt("box-shadow-generator", "previewBg", locale, "Preview background")}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {BACKGROUND_SWATCHES.map((b) => {
                    const isSelected = previewBg.toLowerCase() === b.value.toLowerCase();
                    return (
                      <button
                        key={b.value}
                        type="button"
                        title={tt("box-shadow-generator", b.labelKey, locale)}
                        aria-label={ttf("box-shadow-generator", "previewBgAria", locale, { label: tt("box-shadow-generator", b.labelKey, locale) })}
                        onClick={() => setPreviewBg(b.value)}
                        className={`gu-focus h-8 w-8 rounded-full transition-all cursor-pointer relative ${
                          isSelected
                            ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-base scale-105 shadow-xs"
                            : "border border-border-default/60 hover:scale-105"
                        }`}
                        style={{ backgroundColor: b.value }}
                      />
                    );
                  })}
                  <label
                    title={tt("box-shadow-generator", "customPreviewBgAria", locale, "Custom preview background")}
                    className="relative h-8 w-8 rounded-full border border-border-default/60 hover:scale-105 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-amber-500 transition-all shadow-xs"
                  >
                    <input
                      type="color"
                      aria-label={tt("box-shadow-generator", "customPreviewBgAria", locale, "Custom preview background")}
                      value={previewBg}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Box mode surface controls */}
              {isBox && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-text-sub">
                        {tt("box-shadow-generator", "boxColor", locale, "Box color")}
                      </span>
                      <span className="font-mono text-[15px] font-bold text-text-main tabular-nums">
                        {boxBg.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        className="relative h-[42px] w-[50px] shrink-0 rounded-xl border border-border-subtle hover:border-border-default cursor-pointer overflow-hidden shadow-xs flex items-center justify-center p-0.5 bg-surface-muted/50"
                        title={tt("box-shadow-generator", "boxColorPickerAria", locale, "Preview element color picker")}
                      >
                        <input
                          type="color"
                          aria-label={tt("box-shadow-generator", "boxColorPickerAria", locale, "Preview element color picker")}
                          value={boxBg}
                          onChange={(e) => setBoxBg(e.target.value)}
                          className="h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                      </label>
                      <input
                        type="text"
                        aria-label={tt("box-shadow-generator", "boxColorHexAria", locale, "Preview element color hex")}
                        value={boxBg.toUpperCase()}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                            setBoxBg(v.startsWith("#") ? v : `#${v}`);
                          }
                        }}
                        maxLength={7}
                        spellCheck={false}
                        className="gu-focus h-[42px] min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 px-3 text-center text-[15px] font-mono font-bold text-text-main outline-none uppercase tracking-wider tabular-nums transition-colors"
                      />
                    </div>
                  </div>
                  <SliderField
                    label={tt("box-shadow-generator", "boxRadius", locale, "Box radius")}
                    locale={locale}
                    value={boxRadius}
                    min={0}
                    max={48}
                    unit="px"
                    onChange={setBoxRadius}
                  />

                  {/* Preview style (shape) */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-[13px] font-medium text-text-sub">
                      {tt("box-shadow-generator", "previewShapeLabel", locale, "Preview style")}
                    </span>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 rounded-xl bg-surface-muted/40 p-1 border border-border-subtle/60"
                      role="radiogroup"
                      aria-label={tt("box-shadow-generator", "previewShapeAria", locale, "Preview shape")}
                    >
                      {PREVIEW_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="radio"
                          aria-checked={previewShape === s.id}
                          onClick={() => setPreviewShape(s.id)}
                          className={`gu-focus min-h-[38px] rounded-lg px-2 text-[13px] font-medium transition-all cursor-pointer ${
                            previewShape === s.id
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "text-text-sub hover:text-text-main hover:bg-surface-muted/60"
                          }`}
                        >
                          {tt("box-shadow-generator", s.labelKey, locale)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Clean inline note without ugly nested borders */}
              <p className="flex items-center gap-1.5 text-[12px] leading-relaxed text-text-muted pt-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-text-muted/80" aria-hidden="true" />
                {tt(
                  "box-shadow-generator",
                  "previewOnlyNote",
                  locale,
                  "Preview only — these settings change what you see here, not the copied CSS."
                )}
              </p>
            </div>
          </Panel>
        </section>

        {/* 3 — SHADOW CONTROLS (RIGHT COLUMN ON DESKTOP, ORDER 3 ON MOBILE) */}
        <section className="order-3 lg:col-span-5">
          <Panel
            title={tt("box-shadow-generator", "adjustTitle", locale, "Adjust the shadow")}
            hint={
              isBox
                ? tt("box-shadow-generator", "adjustHint", locale, "Drag sliders or type exact values.")
                : tt("box-shadow-generator", "adjustHintText", locale, "text-shadow uses X, Y, blur and color.")
            }
            actions={
              layers.length > 1 && (
                <span className="rounded-full bg-brand-primary-light/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-primary-dark">
                  {ttf("box-shadow-generator", "layerBadgeOther", locale, {
                    n: String(layers.length),
                  })}
                </span>
              )
            }
            className="h-full"
          >
            <div className="flex flex-col gap-4">
              <SliderField
                label={tt("box-shadow-generator", "xOffset", locale, "X offset")}
                locale={locale}
                value={activeLayer.x}
                min={-100}
                max={100}
                unit="px"
                onChange={(v) => {
                  updateField("x", v);
                  setSelectedPreset(null);
                }}
              />
              <SliderField
                label={tt("box-shadow-generator", "yOffset", locale, "Y offset")}
                locale={locale}
                value={activeLayer.y}
                min={-100}
                max={100}
                unit="px"
                onChange={(v) => {
                  updateField("y", v);
                  setSelectedPreset(null);
                }}
              />
              <SliderField
                label={tt("box-shadow-generator", "blur", locale, "Blur")}
                locale={locale}
                value={activeLayer.blur}
                min={0}
                max={150}
                unit="px"
                onChange={(v) => {
                  updateField("blur", v);
                  setSelectedPreset(null);
                }}
              />
              {isBox && (
                <SliderField
                  label={tt("box-shadow-generator", "spread", locale, "Spread")}
                  locale={locale}
                  value={activeLayer.spread}
                  min={-50}
                  max={50}
                  unit="px"
                  onChange={(v) => {
                    updateField("spread", v);
                    setSelectedPreset(null);
                  }}
                />
              )}
              <SliderField
                label={tt("box-shadow-generator", "opacity", locale, "Opacity")}
                locale={locale}
                value={Math.round(activeLayer.opacity * 100)}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => {
                  updateField("opacity", v / 100);
                  setSelectedPreset(null);
                }}
              />

              {/* Shadow Color */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[13px] sm:text-[14px] font-medium text-text-sub select-none">
                    {tt("box-shadow-generator", "shadowColor", locale, "Shadow color")}
                  </label>
                  <span className="font-mono text-[16px] sm:text-[17px] font-bold text-text-main tabular-nums tracking-tight">
                    {activeLayer.color.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <label
                    className="relative h-[42px] w-[52px] shrink-0 rounded-xl border border-border-subtle hover:border-border-default cursor-pointer overflow-hidden shadow-xs flex items-center justify-center p-0.5 bg-surface-muted/50"
                    title={tt("box-shadow-generator", "shadowColorPickerAria", locale, "Shadow color picker")}
                  >
                    <input
                      type="color"
                      aria-label={tt("box-shadow-generator", "shadowColorPickerAria", locale, "Shadow color picker")}
                      value={activeLayer.color}
                      onChange={(e) => {
                        updateField("color", e.target.value);
                        setSelectedPreset(null);
                      }}
                      className="h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                  </label>
                  <input
                    type="text"
                    aria-label={tt("box-shadow-generator", "shadowColorHexAria", locale, "Shadow color hex")}
                    value={activeLayer.color.toUpperCase()}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                        updateField("color", v.startsWith("#") ? v : `#${v}`);
                        setSelectedPreset(null);
                      }
                    }}
                    maxLength={7}
                    spellCheck={false}
                    className="gu-focus h-[42px] min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 px-3.5 text-center text-[15px] sm:text-[16px] font-mono font-bold text-text-main outline-none uppercase tracking-wider tabular-nums transition-colors"
                  />
                </div>
              </div>

              {!isBox && (
                <p className="flex items-center gap-1.5 text-[12px] leading-relaxed text-text-muted pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-text-muted/80" aria-hidden="true" />
                  {tt(
                    "box-shadow-generator",
                    "textModeNote",
                    locale,
                    "Spread and inset belong to box-shadow; text shadow uses offsets, blur, color and opacity."
                  )}
                </p>
              )}
            </div>
          </Panel>
        </section>

        {/* 4 — PRESETS (RESPONSIVE COMPACT ROW/GRID) */}
        <section
          className="order-4 lg:col-span-12 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-base p-4 sm:p-5 shadow-premium-sm"
          aria-label={tt("box-shadow-generator", "presetAria", locale, "Shadow presets")}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" aria-hidden="true" />
              <h2 className="text-[14px] sm:text-[15px] font-bold text-text-main tracking-tight uppercase tracking-wider">
                {tt("box-shadow-generator", "presetsLabel", locale, "Presets")}
              </h2>
            </div>
            <span className="text-[12px] text-text-muted font-medium">
              {ttf("box-shadow-generator", "presetCount", locale, { count: String(presets.length) }, `${presets.length} presets`)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {presets.map((p) => {
              const isSelected = selectedPreset === p.nameKey;
              return (
                <button
                  key={p.nameKey}
                  type="button"
                  onClick={() => {
                    applyPreset(p);
                    setSelectedPreset(p.nameKey);
                  }}
                  className={`gu-focus min-h-[42px] px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer text-center truncate select-none ${
                    isSelected
                      ? "bg-brand-primary text-white font-semibold shadow-xs ring-2 ring-brand-primary/30"
                      : "bg-surface-muted/50 hover:bg-surface-muted text-text-sub hover:text-text-main border border-transparent hover:border-border-subtle"
                  }`}
                >
                  {tt("box-shadow-generator", p.nameKey, locale)}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5 — ADVANCED SETTINGS & LAYER STACK */}
        <section className="order-5 lg:col-span-12 rounded-2xl border border-border-subtle bg-surface-base p-4 sm:p-5 shadow-premium-sm transition-all">
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            aria-expanded={showAdvanced}
            className="gu-focus w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-brand-primary" aria-hidden="true" />
              <div>
                <h2 className="text-[15px] font-bold text-text-main group-hover:text-brand-primary transition-colors">
                  {showAdvanced
                    ? tt("box-shadow-generator", "advancedHide", locale, "Hide advanced")
                    : tt("box-shadow-generator", "advancedShow", locale, "Show advanced")}
                </h2>
                <p className="text-[12px] text-text-muted">
                  {isBox
                    ? "Position (inset/outer), layer stack management, multi-shadow effects."
                    : "Layer stack management and multi-shadow effects."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {layers.length > 1 && (
                <span className="rounded-full bg-brand-primary-light/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-primary-dark">
                  {ttf("box-shadow-generator", "layerBadgeOther", locale, { n: String(layers.length) }, `${layers.length} layers`)}
                </span>
              )}
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted/50 text-text-sub group-hover:text-brand-primary transition-colors">
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </div>
          </button>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-divider flex flex-col gap-4">
              {isBox && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-muted/30">
                  <div>
                    <span className="text-[14px] font-semibold text-text-main">
                      {tt("box-shadow-generator", "position", locale, "Position")}
                    </span>
                    <p className="text-[12px] text-text-muted">
                      Choose whether the shadow falls outside or inside the box frame.
                    </p>
                  </div>
                  <div
                    className="flex gap-1 rounded-xl bg-surface-base p-1 border border-border-subtle shrink-0"
                    role="radiogroup"
                    aria-label={tt("box-shadow-generator", "positionAria", locale, "Shadow position")}
                  >
                    {(
                      [
                        { id: false, labelKey: "outer" },
                        { id: true, labelKey: "inset" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={String(opt.id)}
                        type="button"
                        role="radio"
                        aria-checked={activeLayer.inset === opt.id}
                        onClick={() => {
                          updateField("inset", opt.id);
                          setSelectedPreset(null);
                        }}
                        className={`gu-focus min-h-[38px] px-4 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                          activeLayer.inset === opt.id
                            ? "bg-brand-primary text-white font-semibold shadow-xs"
                            : "text-text-sub hover:text-text-main"
                        }`}
                      >
                        {tt("box-shadow-generator", opt.labelKey, locale, opt.id ? "Inset" : "Outer")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer management */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-text-main">
                    {ttf("box-shadow-generator", "layerTitle", locale, { count: String(layers.length) }, `Shadow Layers (${layers.length}/${MAX_LAYERS})`)}
                  </span>
                  <Button
                    type="button"
                    onClick={addShadow}
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="min-h-[38px]"
                    disabled={layers.length >= MAX_LAYERS}
                  >
                    {tt("box-shadow-generator", "addAnotherShadow", locale, "Add layer")}
                  </Button>
                </div>

                {layers.length > 1 && (
                  <ul className="flex flex-col gap-2" aria-label={tt("box-shadow-generator", "shadowLayersAria", locale, "Shadow layers")}>
                    {layers.map((layer, index) => {
                      const isActive = layer.id === activeId;
                      return (
                        <li
                          key={layer.id}
                          className={`flex items-center gap-3 rounded-xl p-2.5 sm:p-3 transition-all ${
                            isActive
                              ? "border border-brand-primary/50 bg-brand-primary-light/10 shadow-xs"
                              : "border border-border-subtle bg-surface-muted/30 hover:bg-surface-muted/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveIds((prev) => ({ ...prev, [mode]: layer.id }))}
                            className="gu-focus min-w-0 flex-1 flex items-center gap-3 text-left cursor-pointer"
                            aria-label={ttf("box-shadow-generator", "editShadowAria", locale, { n: String(index + 1) }, `Edit shadow ${index + 1}`)}
                          >
                            <span
                              className="h-10 w-10 shrink-0 rounded-lg border border-border-subtle flex items-center justify-center text-[11px] font-bold text-text-main shadow-xs"
                              style={
                                isBox
                                  ? { boxShadow: layerToBoxCss(layer), background: "#FFFFFF" }
                                  : { textShadow: layerToTextCss(layer), background: "#F4F6F2" }
                              }
                              aria-hidden="true"
                            >
                              {isBox ? "" : "Aa"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[13px] sm:text-[14px] font-bold ${isActive ? "text-brand-primary" : "text-text-main"}`}>
                                  {ttf("box-shadow-generator", "shadowLabel", locale, { n: String(index + 1) }, `Layer ${index + 1}`)}
                                </span>
                                {isBox && layer.inset && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-muted font-mono font-medium text-text-muted">
                                    inset
                                  </span>
                                )}
                                {layer.visible === false && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-muted font-mono text-text-muted">
                                    hidden
                                  </span>
                                )}
                              </div>
                              <span className="block truncate font-mono text-[12px] text-text-muted mt-0.5">
                                {isBox
                                  ? `${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${layer.color}`
                                  : `${layer.x}px ${layer.y}px ${layer.blur}px ${layer.color}`}
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleVisible(layer.id)}
                              className="gu-focus h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-base transition-colors cursor-pointer"
                              title={layer.visible !== false ? "Mute layer" : "Show layer"}
                            >
                              {layer.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-text-disabled" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateShadow(layer.id)}
                              className="gu-focus h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-base transition-colors cursor-pointer"
                              title="Duplicate layer"
                            >
                              <Files className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveShadow(index, "up")}
                              disabled={index === 0}
                              className="gu-focus h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-base disabled:opacity-25 transition-colors cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveShadow(index, "down")}
                              disabled={index === layers.length - 1}
                              className="gu-focus h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-base disabled:opacity-25 transition-colors cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeShadow(layer.id)}
                              className="gu-focus h-9 w-9 inline-flex items-center justify-center rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
                              title="Delete layer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 6 — GENERATED CSS (OUTPUT) */}
        <section className="order-6 lg:col-span-12 rounded-2xl border border-border-subtle bg-surface-base p-5 sm:p-6 shadow-premium-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] sm:text-[17px] font-bold text-text-main tracking-tight">
                {tt("box-shadow-generator", "generatedCssTitle", locale, "Generated CSS")}
              </h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                {tt("box-shadow-generator", "generatedCssHint", locale, "Copy the declaration, a CSS variable, or a Tailwind class.")}
              </p>
            </div>

            {/* Format switcher tabs */}
            <div
              className="flex gap-1 rounded-xl bg-surface-muted/50 p-1 border border-border-subtle/60 self-start sm:self-auto"
              role="radiogroup"
              aria-label={tt("box-shadow-generator", "formatAria", locale, "Output format")}
            >
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={format === f.id}
                  onClick={() => setFormat(f.id)}
                  className={`gu-focus min-h-[38px] px-3.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                    format === f.id
                      ? "bg-brand-primary text-white font-semibold shadow-xs"
                      : "text-text-sub hover:text-text-main hover:bg-surface-muted/60"
                  }`}
                >
                  {tt("box-shadow-generator", f.labelKey, locale)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-subtle bg-background p-4 font-mono text-[13px] sm:text-[14px] leading-relaxed text-text-main select-all min-h-[96px] flex items-center">
                <code>{outputFor(format)}</code>
              </pre>
            </div>

            <div className="flex flex-col gap-2.5 lg:w-64 shrink-0">
              {/* Primary COPY button */}
              <Button
                type="button"
                onClick={() => {
                  void copyLocal(outputFor(format), format);
                  trackToolEvent(
                    "box-shadow-generator",
                    format === "css" ? "copy_css" : format === "variable" ? "copy_variable" : "copy_tailwind",
                    mode
                  );
                }}
                variant={copiedKey === format ? "success" : "primary"}
                size="md"
                leftIcon={copiedKey === format ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                className="w-full min-h-[48px] text-[15px] font-bold shadow-md"
              >
                {copiedKey === format
                  ? tt("box-shadow-generator", "copied", locale, "Copied!")
                  : tt(
                      "box-shadow-generator",
                      format === "css" ? "copyCss" : format === "variable" ? "copyVariable" : "copyTailwind",
                      locale,
                      "Copy CSS"
                    )}
              </Button>

              {/* Secondary Copy Value */}
              <Button
                type="button"
                onClick={() => {
                  void copyLocal(singleLineValue, "value");
                  trackToolEvent("box-shadow-generator", "copy_css", mode);
                }}
                variant={copiedKey === "value" ? "success" : "outline"}
                size="sm"
                leftIcon={copiedKey === "value" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                className="w-full min-h-[42px]"
              >
                {copiedKey === "value"
                  ? tt("box-shadow-generator", "copied", locale, "Copied!")
                  : tt("box-shadow-generator", "copyValue", locale, "Copy value only")}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={createShare}
                  aria-label={tt("box-shadow-generator", "shareAria", locale, "Copy a share link with these settings")}
                  variant={copiedKey === "share" ? "success" : "outline"}
                  size="sm"
                  leftIcon={copiedKey === "share" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  className="min-h-[42px]"
                >
                  {copiedKey === "share"
                    ? tt("box-shadow-generator", "copied", locale, "Copied!")
                    : tt("box-shadow-generator", "shareLabel", locale, "Share")}
                </Button>
                <Button
                  type="button"
                  onClick={downloadCss}
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  className="min-h-[42px]"
                >
                  {tt("box-shadow-generator", "downloadCss", locale, "Download .css")}
                </Button>
              </div>
            </div>
          </div>

          {/* Mode-aware import of existing CSS */}
          <div className="mt-5 pt-4 border-t border-divider flex flex-col gap-2.5">
            <label htmlFor="box-shadow-import" className="flex items-center gap-2 text-[13px] font-semibold text-text-sub">
              <ClipboardPaste className="w-4 h-4 text-brand-primary" aria-hidden="true" />
              {isBox
                ? tt("box-shadow-generator", "importHint", locale, "Import existing box-shadow CSS")
                : tt("box-shadow-generator", "importHintText", locale, "Import existing text-shadow CSS")}
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <textarea
                id="box-shadow-import"
                rows={2}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(false);
                  setImportedCount(null);
                }}
                placeholder={
                  isBox
                    ? tt("box-shadow-generator", "importPlaceholder", locale, "0 8px 24px -4px rgba(0,0,0,0.15)")
                    : tt("box-shadow-generator", "importPlaceholderText", locale, "0 2px 8px rgba(0,0,0,0.35)")
                }
                spellCheck={false}
                aria-invalid={importError || undefined}
                aria-describedby={importError ? "box-shadow-import-error" : undefined}
                className="gu-focus flex-1 resize-y rounded-xl border border-border-subtle bg-surface-muted/30 px-3.5 py-2.5 font-mono text-[13px] text-text-main outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20"
              />
              <Button
                type="button"
                onClick={importShadow}
                variant="outline"
                className="shrink-0 min-h-[44px] self-end sm:self-auto font-semibold px-5"
              >
                {tt("box-shadow-generator", "importButton", locale, "Import CSS")}
              </Button>
            </div>
            {importError && (
              <div id="box-shadow-import-error" role="status" className="flex flex-col gap-0.5 mt-1">
                <p className="text-[12px] font-semibold text-status-error">
                  {tt("box-shadow-generator", "importErrorShort", locale, "Couldn't fully parse this value.")}
                </p>
                <p className="text-[12px] text-text-muted">
                  {tt(
                    "box-shadow-generator",
                    "importHelp",
                    locale,
                    "Supported: box-shadow (2–4 lengths, optional inset) and text-shadow (2–3 lengths), comma-separated layers, hex, rgb() and hsl() colors."
                  )}
                </p>
              </div>
            )}
            {!importError && importedCount !== null && (
              <p role="status" className="text-[12px] font-semibold text-status-success mt-1">
                {ttf(
                  "box-shadow-generator",
                  importedCount === 1 ? "importSuccessOne" : "importSuccessOther",
                  locale,
                  { n: String(importedCount) },
                  `Imported ${importedCount} shadow${importedCount === 1 ? "" : "s"}`
                )}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Below-the-tool content: examples, recipes, docs, comparison, troubleshooting */}
      <ShadowStudioContent
        onApplyConfig={applyStudioConfig}
        copyText={copyLocal}
        copiedKey={copiedKey}
        onChangeView={onChangeView}
      />
    </>
  );
};
