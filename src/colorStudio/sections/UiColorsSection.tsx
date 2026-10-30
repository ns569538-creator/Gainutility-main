/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — UI Color Systems.
 * Approximate, reference-only reconstructions of how well-known products
 * use color. Clearly labeled as "reference" — not affiliated or endorsed.
 */
import React from "react";
import { Info } from "lucide-react";
import { UI_COLOR_SYSTEMS, ROLE_LABELS } from "../colorData";
import { SectionProps } from "./types";
import { SectionHeading, PaletteStrip } from "../colorUI";

export const UiColorsSection: React.FC<SectionProps> = ({ onCopy, onChangeView }) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="UI Colors"
        title="Reference color systems"
        subtitle="How well-known products structure their colors, reconstructed from public docs and screenshots. Use them as a starting point — not as official brand assets."
      />

      <div className="flex items-start gap-2.5 rounded-2xl border border-brand-primary/25 bg-brand-primary-light/50 p-3.5 text-xs sm:text-[13px] text-text-sub leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" />
        <p>
          These systems are <strong>approximate reference values</strong>, labeled so you understand the role each
          color plays. GAINUTILITY is not affiliated with the respective brands. Please do not reuse third-party brand
          colors verbatim in your own products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {UI_COLOR_SYSTEMS.map((sys) => {
          const hexes = sys.colors.map((c) => c.color);
          return (
            <div
              key={sys.id}
              role="button"
              tabIndex={0}
              onClick={() => onChangeView({ type: "color-page", kind: "ui-color", id: sys.id })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChangeView({ type: "color-page", kind: "ui-color", id: sys.id });
                }
              }}
              className="group text-left bg-surface-base border border-border-light rounded-3xl overflow-hidden transition-all hover:shadow-premium-md hover:border-brand-primary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
            >
              <PaletteStrip colors={hexes} onCopy={onCopy} height="h-10 sm:h-14" rounded="rounded-none" />
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-[15px] font-sans font-bold text-text-main">{sys.name}</h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5 shrink-0">
                    {sys.type}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{sys.usage}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sys.colors.slice(0, 6).map((c) => (
                    <span key={c.role} className="inline-flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                      <span className="w-3 h-3 rounded-md border border-black/10" style={{ backgroundColor: c.color }} />
                      {ROLE_LABELS[c.role]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};