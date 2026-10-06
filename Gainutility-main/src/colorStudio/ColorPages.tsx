/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Crawlable detail pages.
 * Renders:
 *   /colors/<token>         a named color's full profile
 *   /color-palettes/<slug>  a curated or encoded palette
 *   /ui-colors/<id>         a reference color system
 * These map 1:1 to the SPA view { type: "color-page" }.
 */
import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Wand2, Copy, MonitorSmartphone, SlidersHorizontal, Check } from "lucide-react";
import { ViewState, ColorStudioSectionId } from "../types";
import {
  resolveColorToken,
  resolvePaletteToken,
  resolveUiColorSystem,
  HERO_COLORS,
  CURATED_PALETTES,
  UI_COLOR_SYSTEMS,
  ROLE_LABELS,
  UIColorSystem,
} from "./colorData";
import { generatePalette, getHarmonies, contrastRatio, paletteSlug, textColorOn, normalizeHex } from "./color";
import {
  SectionHeading,
  ColorSwatch,
  ColorPickerField,
  ColorScale,
  ColorPalette,
  ContrastBadge,
  ColorToken,
  ExportBar,
  CopyValueButton,
} from "./colorUI";
import { Breadcrumbs } from "../components/Common";

type ResolvedPalette = NonNullable<ReturnType<typeof resolvePaletteToken>>;

const openInGenerator = (hexes: string[], onChangeView: (v: ViewState) => void) => {
  const list = Array.isArray(hexes) && hexes.length >= 2 ? hexes : generatePalette(5, "analogous", String(7), hexes[0]);
  onChangeView({ type: "color-studio", section: "generator" });
  window.setTimeout(() => {
    window.history.replaceState(null, "", window.location.pathname + "#" + paletteSlug(list));
  }, 0);
};

const goStudio = (section: ColorStudioSectionId, onChangeView: (v: ViewState) => void) =>
  onChangeView({ type: "color-studio", section });

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export const ColorPages: React.FC<ColorPagesProps> = (props) => {
  const { kind, id, onChangeView } = props;
  if (kind === "color") return <ColorPage {...props} token={id} />;
  if (kind === "palette") {
    const resolved = resolvePaletteToken(id);
    if (!resolved) return <MissingPage kind="palette" id={id} onChangeView={onChangeView} />;
    return <PalettePage {...props} palette={resolved} />;
  }
  if (kind === "ui-color") {
    const system = resolveUiColorSystem(id);
    if (!system) return <MissingPage kind="ui-color" id={id} onChangeView={onChangeView} />;
    return <UiColorPage {...props} system={system} />;
  }
  return <MissingPage kind={kind} id={id} onChangeView={onChangeView} />;
};

/* ------------------------------------------------------------------ */
/* Color page                                                          */
/* ------------------------------------------------------------------ */

const ColorPage: React.FC<ColorPagesProps & { token: string }> = ({ token, onChangeView, onCopy }) => {
  const info = useMemo(() => resolveColorToken(token), [token]);
  const [currentColor, setCurrentColor] = useState<string>(info?.hex ?? "#7C3AED");
  const [activeHarmonyIndex, setActiveHarmonyIndex] = useState(0);

  // Sync if token changes
  React.useEffect(() => {
    if (info?.hex) setCurrentColor(info.hex);
  }, [info?.hex]);

  if (!info) return <MissingPage kind="color" id={token} onChangeView={onChangeView} />;
  const { name, family } = info;

  const hex = currentColor;
  const harmonies = useMemo(() => getHarmonies(hex), [hex]);
  const harmonyNames = Object.keys(harmonies) as (keyof typeof harmonies)[];
  const activeHarmony = harmonies[harmonyNames[activeHarmonyIndex]] ?? [];
  const whiteRatio = contrastRatio(hex, "#FFFFFF");
  const blackRatio = contrastRatio(hex, "#000000");

  const rgb = (() => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return isNaN(r) ? "—" : `${r}, ${g}, ${b}`;
  })();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Breadcrumbs
        paths={[
          { name: "Home", active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: "Color Studio", active: false, view: { type: "color-studio", section: "home" }, onClick: () => goStudio("home", onChangeView) },
          { name: "Colors", active: false, view: { type: "color-studio", section: "colors" }, onClick: () => goStudio("colors", onChangeView) },
          { name, active: true },
        ]}
      />

      {/* Main Color Workspace: Preview on left, controls & profile on right */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Visual Swatch Display */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
              Display Preview
            </span>
            <ColorSwatch
              hex={hex}
              label={name}
              sublabel={`${family} family`}
              variant="hero"
              showCopyOverlay
              onCopy={onCopy}
            />
          </div>

          {/* Quick value cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-surface-base border border-border-light flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">HEX Value</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-text-main">{hex}</span>
                <CopyValueButton value={hex} onCopy={onCopy} />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-surface-base border border-border-light flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">RGB Channels</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-text-main truncate max-w-[100px]">{rgb}</span>
                <CopyValueButton value={`rgb(${rgb})`} onCopy={onCopy} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Contrast & Actions */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SectionHeading
              eyebrow={`${name} · ${family} family`}
              title={`${name} in the real world`}
              subtitle="Interactive control: adjust this color, inspect contrast against dark/light surfaces, and explore tonal scales."
            />

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => openInGenerator([hex], onChangeView)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold transition-colors cursor-pointer"
              >
                <Wand2 className="w-4 h-4" /> Build Palette with {name}
              </button>
              <button
                type="button"
                onClick={() => goStudio("visualizer", onChangeView)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary hover:border-brand-primary/50 transition-colors cursor-pointer"
              >
                <MonitorSmartphone className="w-4 h-4" /> Preview on UI
              </button>
              <button
                type="button"
                onClick={() => goStudio("colors", onChangeView)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-sub hover:text-text-main transition-colors cursor-pointer ml-auto"
              >
                All Colors <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Color Adjustment Control (ColorDisplay ≠ ColorControl) */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border-light shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Interactive Color Control
              </span>
              <span className="text-[11px] text-text-muted">Adjust channels or pick custom hue</span>
            </div>
            <ColorPickerField
              value={hex}
              onChange={(next) => setCurrentColor(next)}
              label="Selected Color"
              showSliders
              showFormat
            />
          </div>

          {/* Contrast Scorecard */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-base border border-border-light p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-muted">Contrast on White Canvas</span>
                <span className="text-sm font-mono font-bold text-text-main mt-0.5">{whiteRatio.toFixed(2)}:1</span>
              </div>
              <ContrastBadge ratio={whiteRatio} />
            </div>
            <div className="rounded-2xl bg-surface-base border border-border-light p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-muted">Contrast on Dark Surface</span>
                <span className="text-sm font-mono font-bold text-text-main mt-0.5">{blackRatio.toFixed(2)}:1</span>
              </div>
              <ContrastBadge ratio={blackRatio} />
            </div>
          </div>

          {/* Harmonies */}
          <div className="flex flex-col gap-3">
            <SectionHeading eyebrow="Harmonies" title="Harmonic Palettes" subtitle="Mathematically balanced palettes built around this color." />
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Harmonies">
              {harmonyNames.map((hn, i) => (
                <button
                  key={hn}
                  type="button"
                  role="tab"
                  aria-selected={activeHarmonyIndex === i}
                  onClick={() => setActiveHarmonyIndex(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer capitalize ${
                    activeHarmonyIndex === i
                      ? "bg-brand-primary text-[#FAF8F1] border-brand-primary"
                      : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
                  }`}
                >
                  {hn.replace("-", " ")}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <ColorPalette
                colors={activeHarmony}
                onSelect={(selected) => setCurrentColor(selected)}
                onCopy={onCopy}
                height="h-16 sm:h-20"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-2 items-center">
                  {activeHarmony.map((c) => (
                    <ColorToken key={c} color={c} onCopy={onCopy} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openInGenerator(activeHarmony, onChangeView)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  Open harmony in generator <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full 50–950 Tonal Scale */}
      <div className="flex flex-col gap-3">
        <SectionHeading
          eyebrow="Tonal Range"
          title={`${name} — OKLCH 50–950 Scale`}
          subtitle="Precision lightness distribution. Step 500 is your base color. Click any step to set it as current."
        />
        <ColorScale
          baseHex={hex}
          onSelectStep={(stepHex) => setCurrentColor(stepHex)}
          onCopy={onCopy}
        />
      </div>

      {/* Export Bar */}
      <ExportBar
        colors={[hex]}
        paletteName={`${name} Color System`}
        onCopy={onCopy}
      />

      {/* Related Colors in Same Family */}
      <div className="flex flex-col gap-3">
        <SectionHeading eyebrow="Family" title={`More colors in ${family}`} subtitle="Explore sibling hues with identical perceptual tone." />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {HERO_COLORS.filter((h) => h.family === family)
            .concat(HERO_COLORS.filter((h) => h.family !== family))
            .slice(0, 8)
            .map((h) => (
              <div
                key={h.slug}
                role="button"
                tabIndex={0}
                onClick={() => onChangeView({ type: "color-page", kind: "color", id: h.slug })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChangeView({ type: "color-page", kind: "color", id: h.slug });
                  }
                }}
                className="group p-2.5 rounded-2xl bg-surface-base border border-border-light hover:border-brand-primary/50 hover:shadow-premium-sm transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30 flex flex-col gap-2"
              >
                <div
                  className="w-full h-12 rounded-xl border border-black/10 transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: h.hex }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-sans font-bold text-text-main group-hover:text-brand-primary truncate">
                    {h.name}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">{h.hex}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Palette page                                                        */
/* ------------------------------------------------------------------ */

const PalettePage: React.FC<ColorPagesProps & { palette: ResolvedPalette }> = ({ palette, onChangeView, onCopy }) => {
  const [selectedHex, setSelectedHex] = useState<string>(palette.colors[0] ?? "#4F6F2F");
  const [activeHarmonyIndex, setActiveHarmonyIndex] = useState(0);

  const harmonies = useMemo(() => getHarmonies(selectedHex), [selectedHex]);
  const harmonyNames = Object.keys(harmonies) as (keyof typeof harmonies)[];
  const activeHarmony = harmonies[harmonyNames[activeHarmonyIndex]] ?? [];
  const contrast = contrastRatio(selectedHex, "#FFFFFF");
  const related = CURATED_PALETTES.filter((p) => p.slug !== palette.slug).slice(0, 3);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Breadcrumbs
        paths={[
          { name: "Home", active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: "Color Studio", active: false, view: { type: "color-studio", section: "home" }, onClick: () => goStudio("home", onChangeView) },
          { name: "Palettes", active: false, view: { type: "color-studio", section: "explore" }, onClick: () => goStudio("explore", onChangeView) },
          { name: palette.name, active: true },
        ]}
      />

      {/* Palette Hero Card */}
      <div className="rounded-3xl border border-border-light bg-surface-base overflow-hidden shadow-sm">
        <ColorPalette
          colors={palette.colors}
          selectedColor={selectedHex}
          onSelect={(c) => setSelectedHex(c)}
          onCopy={onCopy}
          height="h-28 sm:h-36"
        />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="heading-h1 text-text-main font-sans font-bold text-xl sm:text-2xl">{palette.name}</h2>
              {palette.style && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5">
                  {palette.style}
                </span>
              )}
            </div>
            {palette.use && <p className="text-sm text-text-muted">{palette.use}</p>}
            {palette.desc && <p className="text-xs text-text-muted/80 max-w-[62ch] leading-relaxed">{palette.desc}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-start sm:items-center">
            <button
              type="button"
              onClick={() => openInGenerator(palette.colors, onChangeView)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Wand2 className="w-4 h-4" /> Open in Generator
            </button>
            <button
              type="button"
              onClick={() => goStudio("visualizer", onChangeView)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer w-full sm:w-auto"
            >
              <MonitorSmartphone className="w-4 h-4" /> UI Visualizer
            </button>
          </div>
        </div>
      </div>

      {/* Palette Color Swatches with Roles & Individual Details */}
      <div className="flex flex-col gap-3">
        <SectionHeading
          eyebrow="Swatches"
          title="Individual Palette Tokens"
          subtitle="Click any swatch to select it as the active inspection color."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {palette.colors.map((c, i) => {
            const roleName = ["Primary", "Accent", "Background", "Surface", "Text"][i] ?? `Token ${i + 1}`;
            const isSelected = selectedHex.toLowerCase() === c.toLowerCase();
            return (
              <div
                key={c}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedHex(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedHex(c);
                  }
                }}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
                  isSelected
                    ? "border-brand-primary ring-2 ring-brand-primary/20 bg-surface-base shadow-sm"
                    : "border-border-light bg-surface-base hover:border-border-medium"
                }`}
              >
                <div
                  className="w-full h-16 rounded-xl border border-black/10 relative overflow-hidden"
                  style={{ backgroundColor: c }}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white text-black shadow-sm">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase font-bold text-text-muted">{roleName}</span>
                    <span className="text-xs font-mono font-bold text-text-main">{c}</span>
                  </div>
                  <CopyValueButton value={c} onCopy={onCopy} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Color Deep Dive */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-surface-base border border-border-light p-5 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
            Active Selection: {selectedHex}
          </span>
          <ColorPickerField
            value={selectedHex}
            onChange={(next) => setSelectedHex(next)}
            label="Tune Selection"
            showSliders
          />
        </div>

        <div className="rounded-2xl bg-surface-base border border-border-light p-5 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              WCAG Contrast on White Canvas
            </span>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-mono font-bold text-text-main">{contrast.toFixed(2)}:1</span>
              <ContrastBadge ratio={contrast} />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {contrast >= 4.5
              ? "Safe for regular body text and critical UI elements under WCAG AA requirements."
              : "Below WCAG AA minimum for normal text (4.5:1). Recommended for decorative accents or large text only."}
          </p>
        </div>
      </div>

      {/* Harmonies from Selected Color */}
      <div className="flex flex-col gap-3">
        <SectionHeading
          eyebrow="Harmonies"
          title={`Harmonies from ${selectedHex}`}
          subtitle="Generate companion palettes anchored by the selected token."
        />
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Harmonies">
          {harmonyNames.map((hn, i) => (
            <button
              key={hn}
              type="button"
              role="tab"
              aria-selected={activeHarmonyIndex === i}
              onClick={() => setActiveHarmonyIndex(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer capitalize ${
                activeHarmonyIndex === i
                  ? "bg-brand-primary text-[#FAF8F1] border-brand-primary"
                  : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
              }`}
            >
              {hn.replace("-", " ")}
            </button>
          ))}
        </div>
        <ColorPalette
          colors={activeHarmony}
          onSelect={(c) => setSelectedHex(c)}
          onCopy={onCopy}
          height="h-14 sm:h-16"
        />
      </div>

      {/* Multi-Format Export Bar */}
      <ExportBar
        colors={palette.colors}
        paletteName={palette.name}
        onCopy={onCopy}
      />

      {/* Related Palettes */}
      {related.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeading eyebrow="Explore" title="More curated palettes" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <div
                key={p.slug}
                role="button"
                tabIndex={0}
                onClick={() => onChangeView({ type: "color-page", kind: "palette", id: p.slug })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChangeView({ type: "color-page", kind: "palette", id: p.slug });
                  }
                }}
                className="text-left rounded-2xl overflow-hidden border border-border-light bg-surface-base hover:shadow-premium-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <ColorPalette colors={p.colors} onCopy={onCopy} height="h-16" />
                <div className="p-3">
                  <h3 className="text-sm font-sans font-bold text-text-main">{p.name}</h3>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{p.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* UI color system page                                                */
/* ------------------------------------------------------------------ */

const UiColorPage: React.FC<ColorPagesProps & { system: UIColorSystem }> = ({ system, onChangeView, onCopy }) => {
  const hexes = system.colors.map((c) => c.color);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Breadcrumbs
        paths={[
          { name: "Home", active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: "Color Studio", active: false, view: { type: "color-studio", section: "home" }, onClick: () => goStudio("home", onChangeView) },
          { name: "UI Colors", active: false, view: { type: "color-studio", section: "ui-colors" }, onClick: () => goStudio("ui-colors", onChangeView) },
          { name: system.name, active: true },
        ]}
      />

      <div className="rounded-3xl border border-border-light bg-surface-base overflow-hidden shadow-sm">
        <ColorPalette colors={hexes} onCopy={onCopy} height="h-24 sm:h-32" />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="self-start text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5">
              {system.type}
            </span>
            <h2 className="heading-h1 text-text-main font-sans font-bold text-xl sm:text-2xl">{system.name}</h2>
            <p className="text-sm text-text-muted max-w-[62ch]">{system.desc}</p>
            <p className="text-xs text-text-muted/80 max-w-[62ch]">{system.usage}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-start sm:items-center">
            <button
              type="button"
              onClick={() => openInGenerator(hexes, onChangeView)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold transition-colors cursor-pointer"
            >
              <Wand2 className="w-4 h-4" /> Open in Generator
            </button>
            <button
              type="button"
              onClick={() => goStudio("visualizer", onChangeView)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer"
            >
              <MonitorSmartphone className="w-4 h-4" /> Preview in UI
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-brand-primary/25 bg-brand-primary-light/50 p-3.5 text-xs sm:text-[13px] text-text-sub leading-relaxed">
        <span className="font-bold">Reference values.</span>
        Colors below are approximate reconstructions from public documentation and design systems. GAINUTILITY is not
        affiliated with {system.name}.
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeading
          eyebrow="Roles"
          title="How the system assigns color"
          subtitle={`${system.colors.length} roles with representative values and contextual notes.`}
        />
        <div className="flex flex-col gap-2">
          {system.colors.map((role) => {
            const ink = textColorOn(role.color);
            return (
              <div
                key={role.role}
                className="rounded-2xl border border-border-light bg-surface-base overflow-hidden p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-black/10 shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{ backgroundColor: role.color, color: ink }}
                  >
                    ●
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold font-sans text-text-main">{ROLE_LABELS[role.role]}</span>
                    <span className="text-xs text-text-muted">{role.note}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="font-mono text-xs font-bold text-text-main px-2 py-1 rounded-lg bg-surface-muted">
                    {role.color}
                  </span>
                  <CopyValueButton value={role.color} onCopy={onCopy} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Format Export Bar */}
      <ExportBar
        colors={hexes}
        paletteName={`${system.name} System`}
        onCopy={onCopy}
      />

      <div className="flex flex-col gap-3">
        <SectionHeading eyebrow="Explore" title="Compare with other reference systems" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {UI_COLOR_SYSTEMS.filter((s) => s.id !== system.id)
            .slice(0, 8)
            .map((s) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => onChangeView({ type: "color-page", kind: "ui-color", id: s.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChangeView({ type: "color-page", kind: "ui-color", id: s.id });
                  }
                }}
                className="rounded-2xl overflow-hidden border border-border-light bg-surface-base hover:shadow-premium-sm transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <ColorPalette colors={s.colors.map((c) => c.color)} onCopy={onCopy} height="h-8" />
                <div className="p-2.5 text-xs font-sans font-bold text-text-main">{s.name}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Missing                                                             */
/* ------------------------------------------------------------------ */

const MissingPage: React.FC<{ kind: string; id: string; onChangeView: (v: ViewState) => void }> = ({ kind, onChangeView }) => {
  return (
    <div className="flex flex-col items-start gap-4 p-10 rounded-3xl border border-border-light bg-surface-base">
      <h2 className="text-xl font-sans font-bold text-text-main">That {kind} page doesn't exist</h2>
      <p className="text-sm text-text-muted">The color, palette or system you're looking for may have moved.</p>
      <button
        onClick={() => goStudio("home", onChangeView)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-[#FAF8F1] text-sm font-bold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Color Studio
      </button>
    </div>
  );
};

interface ColorPagesProps {
  kind: "color" | "palette" | "ui-color";
  id: string;
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onCopy: (text: string) => void;
}