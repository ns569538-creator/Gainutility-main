/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Scales tool.
 * The 50–950 tonal scale for the active color, built in OKLCH. Step 500 is
 * the active color itself; any swatch can be copied or promoted to the new
 * active color (which becomes the new 500).
 */
import React, { useMemo } from "react";
import { Target } from "lucide-react";
import {
  SCALE_STEPS,
  generateScale,
  normalizeHex,
  hexToOklch,
  hexToRgb,
  hexToHsl,
  textColorOn,
} from "../color";
import { nearestNamedColor } from "../colorData";
import { useActiveColor } from "../ActiveColorContext";
import { SectionProps } from "./types";
import {
  SectionHeading,
  ColorSwatch,
  ColorPickerField,
  ColorScale,
  ColorValueField,
  SelectedColorState,
  CopyValueButton,
  ExportBar,
} from "../colorUI";

const okl = (hex: string) => hexToOklch(hex) ?? { l: 0, c: 0, h: 0 };

export const ScaleSection: React.FC<SectionProps> = ({ onCopy }) => {
  const { activeColor, setActiveColor } = useActiveColor();

  const root = normalizeHex(activeColor) ?? "#4F6F2F";
  const named = nearestNamedColor(root);
  const scale = useMemo(() => generateScale(root), [root]);
  const oklch = hexToOklch(root);
  const rgb = hexToRgb(root);
  const hsl = hexToHsl(root);

  const apply = (hex: string, announce = true) => {
    const n = normalizeHex(hex);
    if (!n) return;
    setActiveColor(n, { announce });
  };

  const scaleColors = useMemo(() => SCALE_STEPS.map((s) => scale[s]), [scale]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Color Studio • Scales"
        title="50–950 Perceptual Tonal Scale"
        subtitle="Step 500 is your active color. Every other step is mathematically derived in OKLCH for perceptual evenness — lighter steps go up, darker steps go down, and any step can become the new root."
        right={<SelectedColorState label={`Anchor: ${named?.name ?? root}`} />}
      />

      <div className="grid lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] gap-6">
        {/* Left Column: Anchor Color & Color Control */}
        <div className="flex flex-col gap-5">
          {/* 1. ANCHOR COLOR DISPLAY */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Step 500 • Scale Anchor
              </span>
              <span className="text-xs font-mono font-bold text-brand-primary">{root}</span>
            </div>

            <ColorSwatch
              color={root}
              name={named?.name}
              role="Anchor (Step 500)"
              size="lg"
              isSelected={true}
              onCopy={onCopy}
              className="shadow-premium-md"
            />
          </div>

          {/* 2. CHANGE ANCHOR COLOR (The Universal Color Control) */}
          <div className="p-4 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-3">
            <ColorPickerField
              value={root}
              onChange={(hex) => apply(hex, true)}
              label="Change Anchor Color"
              roleBadge="Step 500"
              helperText="Pick or type any color to regenerate all 11 OKLCH tonal steps instantly."
              onCopy={onCopy}
              showRgbHslSliders={false}
            />
          </div>

          {/* 3. ANCHOR VALUES */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted px-1">
              Anchor Formats
            </span>
            <div className="grid grid-cols-1 gap-2">
              <ColorValueField label="HEX" value={root} onCopy={onCopy} />
              {rgb && (
                <ColorValueField
                  label="RGB"
                  value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                  onCopy={onCopy}
                />
              )}
              {hsl && (
                <ColorValueField
                  label="HSL"
                  value={`hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`}
                  onCopy={onCopy}
                />
              )}
              {oklch && (
                <ColorValueField
                  label="OKLCH"
                  value={`oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${Math.round(oklch.h)})`}
                  onCopy={onCopy}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 11 Steps Interactive List & Scale Grid */}
        <div className="flex flex-col gap-6">
          {/* Quick Panoramic Scale Bar */}
          <div className="p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-bold text-text-main">Panoramic Scale Overview</span>
              <span className="text-[10px] font-mono font-bold text-text-muted">Click any step to set as Anchor</span>
            </div>
            <ColorScale
              hex={root}
              onCopy={onCopy}
              onSelectStep={(stepHex) => apply(stepHex, true)}
            />
          </div>

          {/* Detailed 11 Steps Table */}
          <div className="p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-light/60">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                11 Steps • OKLCH Values & Actions
              </span>
              <CopyValueButton
                value={SCALE_STEPS.map((s) => `${s}: ${scale[s]}`).join(", ")}
                onCopy={onCopy}
                label="Copy all steps"
                size="sm"
                variant="ghost"
              />
            </div>

            <div className="flex flex-col gap-2">
              {SCALE_STEPS.map((step) => {
                const color = scale[step];
                const ink = textColorOn(color);
                const isRoot = step === 500;
                const isActive = color.toUpperCase() === root.toUpperCase();
                const stepOkl = okl(color);

                return (
                  <div
                    key={step}
                    className={`grid grid-cols-[48px_1fr_auto] sm:grid-cols-[56px_1fr_auto_auto] items-center gap-3 rounded-2xl border p-2.5 transition-all ${
                      isActive
                        ? "border-brand-primary bg-brand-primary-light/40 ring-2 ring-brand-primary/30 shadow-xs"
                        : "border-border-light bg-surface-base hover:border-border-medium hover:bg-surface-muted/30"
                    }`}
                  >
                    {/* Step Swatch Box */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl border border-black/10 shrink-0 shadow-inner"
                      style={{ backgroundColor: color, color: ink }}
                    >
                      <span className="text-xs sm:text-sm font-mono font-bold">{step}</span>
                      {isRoot && (
                        <span className="text-[8px] font-mono uppercase font-bold tracking-wider opacity-85">
                          Base
                        </span>
                      )}
                    </div>

                    {/* Value & Channels */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-text-main truncate">
                          {color}
                        </span>
                        {isRoot && (
                          <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded-md border border-brand-primary/20">
                            Current Anchor
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-text-muted truncate mt-0.5">
                        L: {stepOkl.l.toFixed(3)} • C: {stepOkl.c.toFixed(3)} • H: {Math.round(stepOkl.h)}°
                      </span>
                    </div>

                    {/* Copy Button */}
                    <CopyValueButton value={color} onCopy={onCopy} size="sm" variant="chip" />

                    {/* Set Active / Anchor Button */}
                    <button
                      type="button"
                      onClick={() => apply(color)}
                      disabled={isActive}
                      className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer disabled:cursor-default ${
                        isActive
                          ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-xs"
                          : "border-border-light bg-surface-base text-text-sub hover:text-brand-primary hover:border-brand-primary/40"
                      }`}
                      aria-label={`Set step ${step} as active anchor`}
                      title="Make this step the scale anchor"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>{isActive ? "Active" : "Make anchor"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Suite */}
          <ExportBar
            colors={scaleColors}
            name={`${named?.name ?? "Custom"} Scale`}
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>
  );
};