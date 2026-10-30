/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Color Explorer.
 * Named colors from the CSS named palette, grouped by family.
 */
import React, { useMemo, useState } from "react";
import { Search, X, ExternalLink, Target } from "lucide-react";
import { NAMED_COLORS, COLOR_FAMILIES, familyLabel, ColorFamily, colorSlug } from "../colorData";
import { SectionProps } from "./types";
import { SectionHeading, CopyValueButton, SelectedColorState } from "../colorUI";
import { textColorOn, normalizeHex } from "../color";
import { useActiveColor } from "../ActiveColorContext";

export const ColorsSection: React.FC<SectionProps & { showHeading?: boolean }> = ({
  onCopy,
  onChangeView,
  showHeading = true,
}) => {
  const { activeColor, setActiveColor } = useActiveColor();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<"all" | ColorFamily>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAMED_COLORS.filter((c) => {
      if (family !== "all" && c.family !== family) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.hex.toLowerCase().includes(q) ||
        c.hex.replace("#", "").toLowerCase().includes(q)
      );
    });
  }, [query, family]);

  const byFamily = useMemo(() => {
    const map = new Map<ColorFamily, typeof NAMED_COLORS>();
    for (const c of results) {
      const arr = map.get(c.family) ?? [];
      arr.push(c);
      map.set(c.family, arr);
    }
    return map;
  }, [results]);

  return (
    <div className="flex flex-col gap-8">
      {showHeading && (
        <SectionHeading
          eyebrow="Color Studio • Library"
          title="Curated CSS Named Color Catalog"
          subtitle="Explore 140+ CSS named colors organized by chromatic family. Click any swatch to copy its HEX, send it to the studio workspace, or inspect its full perceptual profile."
          right={<SelectedColorState label={`Active: ${activeColor}`} />}
        />
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colors by name or hex… e.g. seafoam, #00fff0, coral"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-light bg-surface-muted/30 text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              aria-label="Search colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-main hover:bg-surface-hover cursor-pointer"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFamily("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                family === "all"
                  ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-xs"
                  : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
              }`}
            >
              All Families
            </button>
            {COLOR_FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFamily(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  family === f
                    ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-xs"
                    : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary"
                }`}
              >
                {familyLabel(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{results.length} color{results.length === 1 ? "" : "s"} found</span>
          <span>Click any card to inspect full profile</span>
        </div>
      </div>

      {/* Colors Grid Grouped by Family */}
      <div className="flex flex-col gap-10">
        {[...byFamily.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([f, colors]) => (
            <section key={f} className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-light/60 pb-2">
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                  <span>{familyLabel(f)} Family</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-muted text-text-sub font-semibold">
                    {colors.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {colors.map((c) => {
                  const norm = normalizeHex(c.hex) ?? c.hex;
                  const ink = textColorOn(norm);
                  const isCurrentActive = activeColor.toUpperCase() === norm.toUpperCase();

                  return (
                    <div
                      key={c.name}
                      className={`group rounded-2xl border bg-surface-base overflow-hidden transition-all shadow-premium-sm hover:shadow-premium-md flex flex-col ${
                        isCurrentActive
                          ? "ring-2 ring-brand-primary border-brand-primary shadow-premium-md"
                          : "border-border-light hover:border-brand-primary/50"
                      }`}
                    >
                      {/* Swatch Display */}
                      <div
                        onClick={() => onChangeView({ type: "color-page", kind: "color", id: colorSlug(c.name) })}
                        className="h-28 sm:h-32 p-3 flex flex-col justify-between cursor-pointer relative transition-transform group-hover:scale-[1.01]"
                        style={{ backgroundColor: norm }}
                        title={`Open details for ${c.name}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-xs"
                            style={{
                              color: ink,
                              backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.45)",
                            }}
                          >
                            {c.family}
                          </span>

                          {isCurrentActive && (
                            <span
                              className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shadow-xs"
                              style={{
                                color: ink,
                                backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-sans font-bold text-sm sm:text-base leading-tight" style={{ color: ink }}>
                            {c.name}
                          </p>
                          <p className="font-mono font-bold text-xs opacity-90" style={{ color: ink }}>
                            {norm}
                          </p>
                        </div>
                      </div>

                      {/* Explicit Interactive Actions Footer */}
                      <div className="p-2.5 flex items-center justify-between gap-1.5 bg-surface-base border-t border-border-light/60">
                        <CopyValueButton
                          value={norm}
                          onCopy={onCopy}
                          size="sm"
                          variant="ghost"
                          label="Copy"
                          copiedLabel="Copied"
                        />

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveColor(norm, { announce: true })}
                            className="p-1.5 rounded-lg border border-border-light hover:border-brand-primary/40 hover:bg-surface-muted text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                            title="Set as studio active color"
                            aria-label={`Set ${c.name} as active color`}
                          >
                            <Target className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onChangeView({ type: "color-page", kind: "color", id: colorSlug(c.name) })}
                            className="p-1.5 rounded-lg border border-border-light hover:border-brand-primary/40 hover:bg-surface-muted text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                            title="Inspect full color profile"
                            aria-label={`Open ${c.name} page`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
};