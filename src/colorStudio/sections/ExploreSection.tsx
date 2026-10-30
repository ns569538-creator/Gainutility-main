/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Explore (discovery hub).
 * Curated product palettes plus the full named CSS color palette, with tabs
 * switching between the two.
 */
import React, { useMemo, useState } from "react";
import { CURATED_PALETTES, PaletteStyle } from "../colorData";
import { SectionProps } from "./types";
import { SectionHeading, PaletteCard } from "../colorUI";
import { ColorsSection } from "./ColorsSection";

const STYLE_LABEL: Record<PaletteStyle, string> = {
  minimal: "Minimal",
  vibrant: "Vibrant",
  muted: "Muted",
  pastel: "Pastel",
  dark: "Dark",
  neon: "Neon",
};

export const ExploreSection: React.FC<SectionProps> = (props) => {
  const [mode, setMode] = useState<"curated" | "named">("curated");
  const [style, setStyle] = useState<"all" | PaletteStyle>("all");

  const { onCopy, onChangeView } = props;

  const list = useMemo(
    () => (style === "all" ? CURATED_PALETTES : CURATED_PALETTES.filter((p) => p.style === style)),
    [style]
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Explore"
        title="Explore colors and palettes"
        subtitle="Start from curated product palettes or every named CSS color, organized by family."
      />

      <div className="flex items-center gap-1.5" role="tablist" aria-label="Explore view">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "curated"}
          onClick={() => setMode("curated")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            mode === "curated" ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
          }`}
        >
          Curated palettes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "named"}
          onClick={() => setMode("named")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            mode === "named" ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
          }`}
        >
          Named colors
        </button>
      </div>

      {mode === "named" ? (
        <ColorsSection {...props} showHeading={false} />
      ) : (
        <>
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setStyle("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                style === "all" ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
              }`}
            >
              All
            </button>
            {Object.entries(STYLE_LABEL).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStyle(key as PaletteStyle)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  style === key ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {list.map((p) => (
              <PaletteCard
                key={p.slug}
                name={p.name}
                colors={p.colors}
                use={p.use}
                slug={p.slug}
                onCopy={onCopy}
                onClick={() => onChangeView({ type: "color-page", kind: "palette", id: p.slug })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};