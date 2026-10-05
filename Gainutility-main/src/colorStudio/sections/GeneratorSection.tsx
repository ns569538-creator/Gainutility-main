/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Color Palette Builder.
 * Palette-first generator: big swatch cards that copy, lock and edit,
 * real WCAG contrast checks and a live UI preview built from the palette.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Copy,
  Dices,
  GripVertical,
  Lock,
  Minus,
  PenLine,
  Plus,
  Redo2,
  Shuffle,
  Target,
  Trash2,
  TriangleAlert,
  Undo2,
  Unlock,
} from "lucide-react";
import {
  HarmonyType,
  Rgb,
  Hsl,
  contrastReport,
  generatePalette,
  hslToHex,
  hexToHsl,
  hexToRgb,
  luminanceOf,
  mix,
  normalizeHex,
  paletteFromSlug,
  paletteSlug,
  rgbToHex,
  rgbToHsl,
  textColorOn,
} from "../color";
import { useActiveColor } from "../ActiveColorContext";
import { SectionProps } from "./types";
import { SectionHeading, PaletteStrip, ColorPickerField, ExportBar } from "../colorUI";
import { absoluteUrl } from "../../site";

const DEFAULT_PALETTE: string[] = ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"];
const STORAGE_KEY = "gainutility:colorstudio:palette";
const MIN_COLORS = 2;
const MAX_COLORS = 6;

const GRID_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-6",
};

const MAIN_MODES: { id: HarmonyType; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "complementary", label: "Complementary" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
];

const ADVANCED_MODES: { id: HarmonyType; label: string }[] = [
  { id: "split-complementary", label: "Split complementary" },
  { id: "tetradic", label: "Tetradic" },
  { id: "shades", label: "Shades" },
];

const loadSaved = (): string[] => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const list = JSON.parse(saved) as string[];
      if (
        Array.isArray(list) &&
        list.length >= MIN_COLORS &&
        list.length <= MAX_COLORS &&
        list.every((c) => typeof c === "string" && normalizeHex(c))
      ) {
        return list;
      }
    }
  } catch {
    /* noop */
  }
  return DEFAULT_PALETTE;
};

/* ------------------------------------------------------------------ */
/* Role assignment for contrast + UI preview                           */
/* ------------------------------------------------------------------ */

interface PaletteRoles {
  bg: string;
  surface: string;
  body: string;
  primary: string;
  accent: string;
  border: string;
}

const chromaOf = (hex: string): number => {
  const h = hexToHsl(hex);
  if (!h) return 0;
  return (h.s / 100) * (1 - Math.abs((2 * h.l) / 100 - 1));
};

const paletteRoles = (colors: string[]): PaletteRoles | null => {
  const valid = colors.map((c) => normalizeHex(c) ?? c);
  if (valid.length < 2) return null;
  const withLum = valid.map((c, i) => ({ c, i, lum: luminanceOf(c) ?? 0 }));
  const sorted = [...withLum].sort((a, b) => a.lum - b.lum);
  const body = sorted[0].c;
  const bg = sorted[sorted.length - 1].c;
  const surface = sorted.length > 2 ? sorted[sorted.length - 2].c : mix(bg, body, 0.08);
  let primary = valid[1] ?? bg;
  let best = -1;
  for (const { c } of withLum) {
    const ch = chromaOf(c);
    if (ch > best) {
      best = ch;
      primary = c;
    }
  }
  const accent = valid[valid.length - 1];
  const border = mix(body, bg, 0.6);
  return { bg, surface, body, primary, accent, border };
};

/* ------------------------------------------------------------------ */
/* Color editor (HEX / RGB / HSL)                                      */
/* ------------------------------------------------------------------ */

interface Draft {
  hex: string;
  rgb: Rgb;
  hsl: Hsl;
}

const initDraft = (hex: string): Draft => {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const hsl = hexToHsl(hex) ?? { h: 0, s: 0, l: 0 };
  return { hex: normalizeHex(hex) ?? hex, rgb, hsl };
};

const EditorPanel: React.FC<{
  hex: string;
  onCommit: (hex: string) => void;
  onSetBase: (hex: string) => void;
  onRemove: () => void;
  onDone: () => void;
  canRemove: boolean;
}> = ({ hex, onCommit, onSetBase, onRemove, onDone, canRemove }) => {
  const [draft, setDraft] = useState<Draft>(() => initDraft(hex));
  const [hexText, setHexText] = useState<string>(() => normalizeHex(hex) ?? hex);
  const ink = textColorOn(draft.hex);

  const commitHex = (next: string) => {
    const norm = normalizeHex(next);
    if (!norm) return;
    const rgb = hexToRgb(norm) ?? { r: 0, g: 0, b: 0 };
    const hsl = hexToHsl(norm) ?? { h: 0, s: 0, l: 0 };
    setDraft({ hex: norm, rgb, hsl });
    setHexText(norm);
    onCommit(norm);
  };

  const commitRgb = (key: "r" | "g" | "b", raw: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v)) return;
    const rgb = { ...draft.rgb, [key]: v };
    const next = rgbToHex(rgb.r, rgb.g, rgb.b);
    setDraft({ hex: next, rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b) });
    onCommit(next);
  };

  const commitHsl = (key: "h" | "s" | "l", raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const hsl = { ...draft.hsl, [key]: v };
    const next = hslToHex(hsl.h, hsl.s, hsl.l);
    const rgb = hexToRgb(next) ?? { r: 0, g: 0, b: 0 };
    setDraft({ hex: next, rgb, hsl });
    onCommit(next);
  };

  return (
    <div className="rounded-2xl border border-border-light bg-surface-base p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl border border-black/10"
            style={{ backgroundColor: draft.hex }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-main">Edit color</p>
            <p className="text-xs font-mono text-text-muted truncate">{draft.hex}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          <Check className="w-4 h-4" /> Done
        </button>
      </div>

      <ColorPickerField
        value={draft.hex}
        onChange={(h) => commitHex(h)}
        label="Adjust Swatch Color"
        roleBadge="Palette Swatch"
        showRgbHslSliders={true}
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-border-light pt-3">
        <button
          type="button"
          onClick={() => onSetBase(draft.hex)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light bg-background hover:bg-surface-hover text-xs font-bold text-text-main cursor-pointer"
        >
          <Target className="w-3.5 h-3.5 text-brand-primary" /> Set as base color
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light bg-background hover:bg-red-50 text-xs font-bold text-red-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove color
        </button>
        <span className="ml-auto hidden lg:block text-[11px] font-mono" style={{ color: ink }}>
          Live preview
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export const PaletteGeneratorSection: React.FC<SectionProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const { activeColor, setActiveColor } = useActiveColor();
  const [colors, setColors] = useState<string[]>(loadSaved);
  const [harmony, setHarmony] = useState<HarmonyType>("random");
  const [locked, setLocked] = useState<boolean[]>(() => Array(loadSaved().length).fill(false));
  const [past, setPast] = useState<string[][]>([]);
  const [future, setFuture] = useState<string[][]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const commit = useCallback((next: string[]) => {
    setPast((p) => [...p, colorsRef.current]);
    setFuture([]);
    setColors(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  /* Live edits (color editor) write without polluting undo history. */
  const commitDirect = useCallback((next: string[]) => {
    setColors(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  /* Read an initial palette from the URL hash (#264653-2A9D8F-...) once. */
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, "").trim();
      if (!h || h === "color-studio") return;
      const list = paletteFromSlug(h);
      if (list && list.length >= MIN_COLORS && list.length <= MAX_COLORS) {
        setColors(list);
        setLocked(Array(list.length).fill(false));
        setPast([]);
        setFuture([]);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
          /* noop */
        }
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const generate = useCallback(() => {
    const cur = colorsRef.current;
    const anchor = activeColor;
    const next = generatePalette(cur.length, harmony, String(Math.floor(Math.random() * 1e9)), anchor).map((h, i) =>
      locked[i] ? cur[i] : h
    );
    commit(next);
    const keptLocked = locked.filter(Boolean).length;
    if (keptLocked > 0) {
      onAddToast(`${keptLocked} color${keptLocked === 1 ? "" : "s"} kept locked`, "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harmony, locked, activeColor]);

  /* Space to regenerate (unless typing in an input). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      e.preventDefault();
      generate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const undo = () => {
    if (past.length === 0) return;
    setFuture((f) => [...f, colors]);
    setColors(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  };
  const redo = () => {
    if (future.length === 0) return;
    setPast((p) => [...p, colors]);
    setColors(future[future.length - 1]);
    setFuture((f) => f.slice(0, -1));
  };

  const setCount = (n: number) => {
    n = Math.max(MIN_COLORS, Math.min(MAX_COLORS, Math.round(n)));
    if (n === colors.length) return;
    const filled = generatePalette(n, harmony, String(Math.floor(Math.random() * 1e9)), activeColor);
    const next = Array.from({ length: n }, (_, i) => (i < colors.length ? colors[i] : filled[i]));
    setLocked((l) => Array.from({ length: n }, (_, i) => l[i] ?? false));
    commit(next);
  };

  const toggleLock = (i: number) => setLocked((l) => l.map((v, idx) => (idx === i ? !v : v)));

  const openEditor = (i: number) => {
    setPast((p) => [...p, colorsRef.current]);
    setFuture([]);
    setEditing(i);
  };

  const removeColor = (i: number) => {
    if (colors.length <= MIN_COLORS) return;
    const next = colors.filter((_, idx) => idx !== i);
    setLocked((l) => l.filter((_, idx) => idx !== i));
    setEditing(null);
    commit(next);
  };

  const swap = (a: number, b: number) => {
    if (a === b) return;
    const next = [...colors];
    [next[a], next[b]] = [next[b], next[a]];
    commit(next);
  };

  const dropColor = (over: number) => {
    if (dragIndex === null || dragIndex === over) {
      setDragIndex(null);
      return;
    }
    swap(dragIndex, over);
    setDragIndex(null);
  };

  const slug = paletteSlug(colors);
  const roles = React.useMemo(() => paletteRoles(colors), [colors]);

  const copyAll = (fmt: "hex" | "css" | "json") => {
    const text =
      fmt === "css"
        ? `:root {\n  ${colors.map((c, i) => `--color-${i + 1}: ${normalizeHex(c)};`).join("\n  ")}\n}`
        : fmt === "json"
        ? JSON.stringify(colors.map((c) => normalizeHex(c)))
        : colors.map((c) => normalizeHex(c) ?? c).join("\n");
    onCopy(text);
    setShowExport(false);
  };

  const copyLink = () => {
    onCopy(absoluteUrl(`/color-palettes/${slug}`));
    setShowExport(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Palette builder"
        title="Your palette, your rules"
        subtitle="Generate with Space, lock colors you love, and check real contrast below. Roles for contrast and the UI preview are picked automatically from your palette."
      />

      {/* Palette — the visual focus */}
      <div className="bg-surface-base border border-border-light rounded-3xl p-3 sm:p-4">
        <div className={`grid ${GRID_CLASS[colors.length] ?? "grid-cols-5"} gap-2 sm:gap-2.5`} role="list" aria-label="Palette colors">
          {colors.map((hex, i) => {
            const lk = locked[i];
            const rgb = hexToRgb(hex);
            const hsl = hexToHsl(hex);
            const ink = textColorOn(hex);
            return (
              <div
                key={i}
                role="listitem"
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropColor(i)}
                className={`relative rounded-2xl overflow-hidden border transition-opacity ${i === dragIndex ? "opacity-40 border-brand-primary/60" : "border-black/10"}`}
                style={{ backgroundColor: hex }}
              >
                <button
                  type="button"
                  onClick={() => openEditor(i)}
                  className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/60"
                  aria-label={`Edit color ${i + 1} (${normalizeHex(hex)})`}
                  title="Click to edit color"
                />
                <div className="relative pointer-events-none flex flex-col justify-between p-2.5 sm:p-3 min-h-[156px] sm:min-h-[200px]">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      aria-hidden="true"
                      title="Drag to reorder"
                      className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-black/10"
                    >
                      <GripVertical className="w-4 h-4" style={{ color: ink }} />
                    </span>
                    <div className="pointer-events-auto flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => toggleLock(i)}
                        className="w-11 h-11 sm:w-10 sm:h-10 grid place-items-center rounded-lg hover:bg-black/10 cursor-pointer"
                        aria-label={lk ? `Unlock color ${i + 1}` : `Lock color ${i + 1}`}
                        title={lk ? "Locked — kept on generate" : "Lock color"}
                      >
                        {lk ? <Lock className="w-4 h-4" style={{ color: ink }} /> : <Unlock className="w-4 h-4" style={{ color: ink }} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditor(i)}
                        className="w-11 h-11 sm:w-10 sm:h-10 grid place-items-center rounded-lg hover:bg-black/10 cursor-pointer"
                        aria-label={`Edit color ${i + 1}`}
                        title="Edit HEX / RGB / HSL"
                      >
                        <PenLine className="w-4 h-4" style={{ color: ink }} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="font-mono font-extrabold text-lg sm:text-xl tracking-tight" style={{ color: ink }}>
                      {normalizeHex(hex)}
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-mono opacity-85" style={{ color: ink }}>
                      {rgb ? `R${rgb.r} G${rgb.g} B${rgb.b}` : ""}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-mono opacity-60" style={{ color: ink }}>
                      {hsl ? `H${hsl.h}° S${hsl.s}% L${hsl.l}%` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCopy(normalizeHex(hex) ?? hex)}
                    className="pointer-events-auto w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-bold cursor-pointer transition-colors"
                    style={{ color: ink }}
                    title="Copy HEX"
                    aria-label={`Copy HEX ${normalizeHex(hex)}`}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <PaletteStrip colors={colors} onCopy={onCopy} height="h-10 sm:h-12" rounded="rounded-xl" className="flex-1 min-w-0" />
          <button
            type="button"
            onClick={() => copyAll("hex")}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 rounded-xl border border-border-light bg-background text-xs font-bold text-text-main hover:bg-surface-hover cursor-pointer"
            title="Copy every HEX value"
          >
            <Copy className="w-3.5 h-3.5" /> All HEX
          </button>
        </div>
      </div>

      {/* Color editor */}
      {editing !== null && colors[editing] && (
        <EditorPanel
          key={editing}
          hex={colors[editing]}
          onCommit={(h) => commitDirect(colors.map((c, idx) => (idx === editing ? h : c)))}
          onSetBase={(h) => {
            setActiveColor(h, { announce: true });
            onAddToast(`Base color: ${h}`, "info");
          }}
          onRemove={() => removeColor(editing)}
          onDone={() => setEditing(null)}
          canRemove={colors.length > MIN_COLORS}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {MAIN_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setHarmony(m.id)}
                aria-pressed={harmony === m.id}
                className={`rounded-full px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
                  harmony === m.id ? "bg-brand-primary text-[#FAF8F1]" : "bg-surface-base border border-border-light text-text-main hover:bg-surface-hover"
                }`}
              >
                {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              aria-expanded={showAdvanced}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-text-sub hover:bg-surface-base hover:border hover:border-border-light cursor-pointer bg-transparent border border-transparent transition-colors"
            >
              Advanced
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light bg-surface-base text-sm font-bold text-text-main hover:bg-surface-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              title="Quick re-roll"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              title="Generate with the selected harmony — or press Space"
            >
              <Dices className="w-4 h-4" /> Generate palette
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Advanced harmonies">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mr-1">More harmonies</span>
            {ADVANCED_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setHarmony(m.id)}
                aria-pressed={harmony === m.id}
                className={`rounded-full px-4 py-2 text-xs font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
                  harmony === m.id ? "bg-brand-primary text-[#FAF8F1]" : "bg-surface-base border border-border-light text-text-main hover:bg-surface-hover"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-base border border-border-light rounded-xl px-1.5 py-1">
            <button
              type="button"
              onClick={() => setCount(colors.length - 1)}
              disabled={colors.length <= MIN_COLORS}
              className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
              aria-label="Fewer colors"
              title="Fewer colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center text-sm font-mono font-bold" aria-live="polite">
              {colors.length}
            </span>
            <button
              type="button"
              onClick={() => setCount(colors.length + 1)}
              disabled={colors.length >= MAX_COLORS}
              className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
              aria-label="More colors"
              title="More colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            className="p-2 rounded-xl border border-border-light bg-surface-base hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="p-2 rounded-xl border border-border-light bg-surface-base hover:bg-surface-hover disabled:opacity-30 cursor-pointer"
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {locked.filter(Boolean).length > 0 && (
            <span className="text-xs text-text-muted">
              <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              {locked.filter(Boolean).length} locked — kept on generate
            </span>
          )}
        </div>
      </div>

      {/* Contrast + UI preview */}
      {roles && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-surface-base border border-border-light rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">WCAG contrast</p>
            <ContrastRow bg={roles.bg} fg={roles.body} label="Body text on background" />
            <ContrastRow bg={roles.primary} fg={textColorOn(roles.primary)} label="Button label on accent" />
          </div>
          <UiPreview roles={roles} onCopy={onCopy} />
        </div>
      )}

      {/* Export */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExport((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light bg-surface-base text-sm font-bold text-text-main hover:bg-surface-hover cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={showExport}
          >
            <Copy className="w-4 h-4" /> Export
            <ChevronDown className={`w-4 h-4 transition-transform ${showExport ? "rotate-180" : ""}`} />
          </button>
          {showExport && (
            <div className="absolute right-0 top-11 w-60 rounded-2xl bg-surface-base border border-border-light shadow-premium-md p-1.5 z-20">
              {[
                { label: "Copy all HEX values", fn: () => copyAll("hex") },
                { label: "Copy CSS variables", fn: () => copyAll("css") },
                { label: "Copy JSON", fn: () => copyAll("json") },
                { label: "Copy share link", fn: copyLink },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.fn}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-text-main hover:bg-surface-hover cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border-light my-1" />
              <button
                type="button"
                onClick={() => {
                  setShowExport(false);
                  onChangeView({ type: "color-page", kind: "palette", id: slug });
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-brand-primary hover:bg-surface-hover cursor-pointer"
              >
                Open palette page →
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted">
          Share it anywhere:{" "}
          <button onClick={copyLink} className="text-brand-primary hover:underline cursor-pointer font-medium">
            copy share link
          </button>
          — resolves to a public, crawlable page at /color-palettes/{slug}.
        </p>
      </div>

      <ExportBar colors={colors} name="Generator Palette" onCopy={onCopy} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Contrast row                                                        */
/* ------------------------------------------------------------------ */

const ContrastRow: React.FC<{ bg: string; fg: string; label: string }> = ({ bg, fg, label }) => {
  const report = contrastReport(fg, bg);
  if (!report) return null;
  const ok = report.grade !== "Fail";
  const ratio = report.ratio.toFixed(2);
  const sampleSize = "Aa";
  return (
    <div className="rounded-xl border border-border-light bg-background p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-text-main">{label}</p>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            ok ? "bg-status-success/15 text-status-success" : "bg-status-error/15 text-status-error"
          }`}
        >
          {report.grade}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-[4.5rem] shrink-0 rounded-lg border border-black/10 grid place-items-center overflow-hidden"
          style={{ backgroundColor: bg }}
        >
          <span className="text-base font-bold" style={{ color: fg }}>
            {sampleSize}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-mono font-bold text-text-main">
            <span className="inline-block w-3 h-3 rounded-[4px] border border-black/20 align-[-2px] mr-1.5" style={{ backgroundColor: fg }} />
            {fg}
          </p>
          <p className="text-[11px] font-mono font-bold text-text-main">
            <span className="inline-block w-3 h-3 rounded-[4px] border border-black/20 align-[-2px] mr-1.5" style={{ backgroundColor: bg }} />
            {bg}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-base font-extrabold text-text-main">{ratio}:1</p>
          <p className={`text-[11px] font-bold ${ok ? "text-status-success" : "text-status-error"}`}>{ok ? "Good contrast" : "Needs improvement"}</p>
        </div>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">
        {ok ? (
          <CircleCheck className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-status-success" />
        ) : (
          <TriangleAlert className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-status-error" />
        )}
        {ok
          ? report.grade === "AAA"
            ? "Passes AAA (7:1+) — great for long-form reading."
            : "Passes AA (4.5:1) — fine for most body text."
          : `Fails AA — try a darker text or a lighter background. Ratio ${ratio}:1.`}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* UI preview — real materials from the palette                        */
/* ------------------------------------------------------------------ */

const UiPreview: React.FC<{ roles: PaletteRoles; onCopy: (text: string) => void }> = ({ roles, onCopy }) => {
  const { bg, surface, body, primary, accent, border } = roles;
  const primaryInk = textColorOn(primary);
  const accentInk = textColorOn(accent);
  const legend: { label: string; color: string }[] = [
    { label: "Background", color: bg },
    { label: "Card surface", color: surface },
    { label: "Heading / body", color: body },
    { label: "Buttons", color: primary },
    { label: "Accent", color: accent },
    { label: "Borders", color: border },
  ];
  return (
    <div className="bg-surface-base border border-border-light rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="rounded-2xl overflow-hidden border border-black/10 shadow-premium-sm">
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: primary }}>
            <span className="text-sm font-bold" style={{ color: primaryInk }}>
              GainKit UI
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryInk, opacity: 0.5 }} />
              ))}
            </span>
          </div>
          <div className="p-4" style={{ backgroundColor: bg }}>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider" style={{ color: primary }}>
              Palette preview
            </p>
            <p className="text-lg sm:text-xl font-bold leading-tight mt-1" style={{ color: body }}>
              A heading in your darkest color
            </p>
            <p className="text-sm leading-relaxed mt-1.5" style={{ color: body, opacity: 0.92 }}>
              Body text sits on your lightest color so it stays readable at any size.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => onCopy(primary)}
                className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                style={{ backgroundColor: primary, color: primaryInk }}
                title={`Copy ${primary}`}
              >
                Continue
              </button>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: accent, color: accentInk }}
              >
                {accent} accent
              </span>
            </div>
            <div className="mt-4 rounded-2xl border p-4" style={{ backgroundColor: surface, borderColor: border }}>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: accent }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: body }}>
                    Notification card
                  </p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: body, opacity: 0.85 }}>
                    Card surface {surface} framed by a {border} border.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border-light px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {legend.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => onCopy(l.color)}
            className="flex items-center gap-2 text-left cursor-pointer group min-w-0"
            title={`Copy ${l.color}`}
          >
            <span className="w-5 h-5 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors">{l.label}</span>
            <span className="text-[11px] font-mono text-text-muted truncate">{l.color}</span>
          </button>
        ))}
      </div>
    </div>
  );
};