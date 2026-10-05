/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Color Picker tool.
 * Native color input with full copy + scale output. The picked color becomes
 * the studio-wide active color.
 */
import React, { useEffect, useState, useMemo } from "react";
import {
  normalizeHex,
  generateScale,
  textColorOn,
  hexToRgb,
  hexToHsl,
  hexToOklch,
  getHarmonies,
  contrastRatio,
} from "../color";
import { NAMED_COLORS, nearestNamedColor } from "../colorData";
import { useActiveColor } from "../ActiveColorContext";
import { SectionProps } from "./types";
import {
  SectionHeading,
  ColorSwatch,
  ColorPickerField,
  ColorScale,
  ContrastBadge,
  ColorValueField,
  ExportBar,
  SelectedColorState,
  CopyValueButton,
} from "../colorUI";

const HISTORY_KEY = "gainutility:colorstudio:picker-history";

export const ColorPickerSection: React.FC<SectionProps> = ({ onCopy }) => {
  const { activeColor, setActiveColor } = useActiveColor();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 10));
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleColorChange = (hex: string) => {
    const norm = normalizeHex(hex);
    if (!norm) return;
    setActiveColor(norm, { announce: true });

    setHistory((prev) => {
      const next = [norm, ...prev.filter((x) => x !== norm)].slice(0, 10);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const normalized = normalizeHex(activeColor) ?? "#4F6F2F";
  const named = nearestNamedColor(normalized);
  const rgb = hexToRgb(normalized) ?? { r: 79, g: 111, b: 47 };
  const hsl = hexToHsl(normalized) ?? { h: 90, s: 40, l: 31 };
  const oklch = hexToOklch(normalized) ?? { l: 0.5, c: 0.1, h: 130 };

  const whiteRatio = contrastRatio(normalized, "#FFFFFF");
  const blackRatio = contrastRatio(normalized, "#000000");
  const bestText = textColorOn(normalized);

  const harmonies = useMemo(() => getHarmonies(normalized), [normalized]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Color Studio • Picker"
        title="Inspect, Pick & Fine-Tune"
        subtitle="Choose or edit any color in real-time. The active color synchronizes across your scales, harmonies, and UI preview."
        right={<SelectedColorState label={named?.name ?? normalized} />}
      />

      {/* Main Workspace: Left Column (Color Showcase & Picker Control) vs Right Column (Scales & Harmonies) */}
      <div className="grid lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] gap-6">
        {/* Left Column: Visual Hierarchy — 1. Current Color Display -> 2. Change Color Control -> 3. Values -> 4. Accessibility */}
        <div className="flex flex-col gap-5">
          {/* 1. CURRENT COLOR (Pure Display Swatch) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Current Color Preview
              </span>
              <span className="text-xs font-mono font-bold text-brand-primary">{normalized}</span>
            </div>

            <ColorSwatch
              color={normalized}
              name={named?.name}
              role={named?.family ? `${named.family} family` : "Custom Color"}
              size="lg"
              isSelected={true}
              onCopy={onCopy}
              className="shadow-premium-md"
            />
          </div>

          {/* 2. CHANGE COLOR CONTROL (The Obvious Interactive Control) */}
          <div className="p-4 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-3">
            <ColorPickerField
              value={normalized}
              onChange={handleColorChange}
              label="Select or Change Color"
              roleBadge="Active Input"
              helperText="Click the swatch icon or 'Change' to open the picker, or type any HEX, RGB, or HSL value."
              onCopy={onCopy}
              showRgbHslSliders={false}
            />
          </div>

          {/* 3. RECENT PICK HISTORY */}
          {history.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-border-light bg-surface-base flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Recently Picked
                </span>
                <span className="text-[10px] text-text-muted">{history.length} colors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className={`group relative w-8 h-8 rounded-xl border border-black/15 shadow-xs transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer ${
                      c === normalized ? "ring-2 ring-brand-primary scale-105" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    title={`Select ${c}`}
                    aria-label={`Select ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. EXACT VALUES & FORMATS */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted px-1">
              Exact Formats
            </span>
            <div className="grid grid-cols-1 gap-2">
              <ColorValueField label="HEX" value={normalized} onCopy={onCopy} />
              <ColorValueField
                label="RGB"
                value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                onCopy={onCopy}
              />
              <ColorValueField
                label="HSL"
                value={`hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`}
                onCopy={onCopy}
              />
              <ColorValueField
                label="OKLCH"
                value={`oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(2)} ${Math.round(oklch.h)})`}
                onCopy={onCopy}
              />
            </div>
          </div>

          {/* 5. CONTRAST & ACCESSIBILITY AUDIT */}
          <div className="p-4 rounded-2xl border border-border-light bg-surface-base flex flex-col gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
              WCAG Accessibility Checks
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Against White */}
              <div className="p-3 rounded-xl border border-border-light bg-white text-gray-900 flex flex-col justify-between gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-500">On White</span>
                  <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: normalized }} />
                </div>
                <div className="font-sans font-bold text-sm" style={{ color: normalized }}>
                  Sample Text
                </div>
                <ContrastBadge color={normalized} background="#FFFFFF" ratio={whiteRatio} size="sm" />
              </div>

              {/* Against Black */}
              <div className="p-3 rounded-xl border border-gray-800 bg-gray-950 text-white flex flex-col justify-between gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">On Black</span>
                  <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: normalized }} />
                </div>
                <div className="font-sans font-bold text-sm" style={{ color: normalized }}>
                  Sample Text
                </div>
                <ContrastBadge color={normalized} background="#000000" ratio={blackRatio} size="sm" />
              </div>
            </div>

            <div className="pt-2 border-t border-border-light/80 flex items-center justify-between text-xs text-text-muted">
              <span>Recommended ink color:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-md border border-black/20"
                  style={{ backgroundColor: bestText }}
                />
                <code className="font-mono font-bold text-text-main">{bestText}</code>
                <CopyValueButton value={bestText} onCopy={onCopy} size="sm" variant="ghost" label="" copiedLabel="" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tonal Scales, Harmonic Palettes, and Export Suite */}
        <div className="flex flex-col gap-6">
          {/* TONAL SCALE (50–950 in OKLCH) */}
          <div className="p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-sans font-bold text-text-main flex items-center gap-2">
                  <span>Perceptual Tonal Scale</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                    OKLCH
                  </span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  11 even lightness steps derived mathematically from your active color. Step 500 is your base.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-text-muted">50 → 950</span>
            </div>

            <ColorScale
              hex={normalized}
              onCopy={onCopy}
              onSelectStep={(stepHex) => handleColorChange(stepHex)}
            />
          </div>

          {/* HARMONIC PALETTES */}
          <div className="p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-sans font-bold text-text-main">Color Harmonies & Pairings</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Calculated on the color wheel from {normalized}. Click any harmony swatch to make it the active color.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(harmonies).map(([harmonyName, colorList]) => (
                <div
                  key={harmonyName}
                  className="p-3.5 rounded-xl border border-border-light/80 bg-surface-muted/20 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-bold text-text-main capitalize">
                      {harmonyName.replace("-", " ")}
                    </span>
                    <CopyValueButton
                      value={colorList.join(", ")}
                      onCopy={onCopy}
                      label="Copy all"
                      size="sm"
                      variant="ghost"
                    />
                  </div>

                  <div className="flex rounded-xl overflow-hidden border border-black/10 h-12 shadow-inner">
                    {colorList.map((c, idx) => {
                      const hex = normalizeHex(c) ?? c;
                      const ink = textColorOn(hex);
                      return (
                        <button
                          key={`${harmonyName}-${hex}-${idx}`}
                          type="button"
                          onClick={() => handleColorChange(hex)}
                          className="flex-1 h-full relative group cursor-pointer transition-transform hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                          style={{ backgroundColor: hex }}
                          title={`Click to set ${hex} as active`}
                          aria-label={`Select ${hex}`}
                        >
                          <span
                            className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                            style={{ color: ink, backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)" }}
                          >
                            {hex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPORT SUITE */}
          <ExportBar
            colors={[normalized, ...Object.values(harmonies).flat().slice(0, 5)]}
            name={`${named?.name ?? "Custom"} Theme`}
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>
  );
};