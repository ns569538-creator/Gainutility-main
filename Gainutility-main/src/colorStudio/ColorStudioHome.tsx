/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — home landing inside the workspace.
 */
import React, { useEffect, useState } from "react";
import { Wand2, Contrast, MonitorSmartphone, ImageUp, Layers, Compass, ArrowRight, Clock3, Droplet, Ruler } from "lucide-react";
import { CURATED_PALETTES, HERO_COLORS } from "./colorData";
import { ViewState, ColorStudioSectionId } from "../types";
import { SectionProps } from "./sections/types";
import { PaletteStrip, SectionHeading } from "./colorUI";
import { normalizeHex } from "./color";

interface HomeProps {
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onCopy: (text: string) => void;
}

const QUICK_ACTIONS: { id: ColorStudioSectionId; title: string; desc: string; icon: React.ReactNode }[] = [
  { id: "generator", title: "Palette Generator", desc: "Shuffle, lock, edit and export palettes with smart harmonies.", icon: <Wand2 className="w-5 h-5" /> },
  { id: "picker", title: "Color Picker", desc: "Pick, format and inspect any color — it becomes the active color.", icon: <Droplet className="w-5 h-5" /> },
  { id: "scales", title: "Tonal Scale", desc: "A 50–950 scale built from your active color in OKLCH.", icon: <Ruler className="w-5 h-5" /> },
  { id: "contrast", title: "Contrast Checker", desc: "WCAG AA/AAA checks for real pairs.", icon: <Contrast className="w-5 h-5" /> },
  { id: "visualizer", title: "UI Visualizer", desc: "See a palette on buttons, cards and dashboards.", icon: <MonitorSmartphone className="w-5 h-5" /> },
  { id: "image", title: "Image → Palette", desc: "Extract colors from a photo, on-device.", icon: <ImageUp className="w-5 h-5" /> },
  { id: "ui-colors", title: "UI Color Systems", desc: "Study how leading products structure color.", icon: <Layers className="w-5 h-5" /> },
];

export const ColorStudioHome: React.FC<HomeProps> = ({ onChangeView, onCopy }) => {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const list = JSON.parse(window.localStorage.getItem("gainutility:colorstudio:recent") ?? "[]") as string[];
      if (Array.isArray(list)) setRecent(list.filter((x): x is string => typeof x === "string" && !!normalizeHex(x)).slice(0, 12));
    } catch {
      /* noop */
    }
  }, []);

  const go = (id: ColorStudioSectionId) => onChangeView({ type: "color-studio", section: id });

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* Hero */}
      <section className="rounded-3xl border border-border-light bg-surface-base overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          <div className="p-6 sm:p-10 flex flex-col gap-5 justify-center">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary">Colors, not mockups</p>
            <h2 className="heading-h1 text-text-main font-sans font-bold text-2xl sm:text-3xl md:text-4xl leading-[1.15] max-w-[16ch]">
              Pick a palette once. <span className="text-brand-primary">Ship it everywhere.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-[52ch]">
              Generate palettes with real harmonies, verify contrast, preview on actual UI and export clean CSS — all in
              your browser, no accounts, no uploads.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => go("generator")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold transition-colors cursor-pointer"
              >
                <Wand2 className="w-4 h-4" /> Open the generator
              </button>
              <button
                onClick={() => onChangeView({ type: "color-studio", section: "explore" })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" /> Explore palettes
              </button>
            </div>
          </div>
          <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full">
            {/* colors as the hero graphic */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
              {CURATED_PALETTES.slice(0, 6).map((p) => (
                <div key={p.slug} className="flex flex-col">
                  {p.colors.map((c, j) => (
                    <div key={j} className="flex-1 transition-all hover:flex-[1.6] cursor-pointer" style={{ backgroundColor: c }} title={`${p.name} · ${c}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <Clock3 className="w-3.5 h-3.5" /> Copied earlier
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCopy(c)}
                className="w-10 h-10 rounded-xl border border-black/10 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c }}
                title={`Copy ${c} again`}
                aria-label={`Copy ${c}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick tools */}
      <section className="flex flex-col gap-4">
        <SectionHeading eyebrow="Workflows" title="Start from a tool" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => go(a.id)}
              className="p-5 rounded-2xl bg-surface-base border border-border-light hover:border-brand-primary/50 hover:shadow-premium-sm transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30 flex flex-col gap-2.5 group"
            >
              <span className="w-10 h-10 rounded-xl bg-brand-primary-light border border-brand-primary/15 flex items-center justify-center text-brand-primary">{a.icon}</span>
              <span className="text-sm font-sans font-bold text-text-main group-hover:text-brand-primary">{a.title}</span>
              <span className="text-xs text-text-muted leading-relaxed">{a.desc}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChangeView({ type: "color-studio", section: "gradients" })}
            className="p-5 rounded-2xl bg-surface-base border border-border-light hover:border-brand-primary/50 hover:shadow-premium-sm transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30 flex flex-col gap-2.5 group"
            style={{ backgroundImage: "linear-gradient(120deg, #F7F8F4, #EDEFE6)" }}
          >
            <span className="text-sm font-sans font-bold text-text-main group-hover:text-brand-primary">All sections</span>
            <span className="text-xs text-text-muted leading-relaxed">
              Gradients, named colors, reference systems — explore everything in the studio.
            </span>
          </button>
        </div>
      </section>

      {/* Hero color families */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          eyebrow="Color Explorer"
          title="Start from a color family"
          subtitle="Every named CSS color, organized by family. Click to open its dedicated page."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {HERO_COLORS.map((h) => (
            <button
              key={h.slug}
              type="button"
              onClick={() => onChangeView({ type: "color-page", kind: "color", id: h.slug })}
              className="rounded-2xl overflow-hidden border border-black/10 cursor-pointer hover:scale-[1.02] hover:shadow-premium-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              style={{ backgroundColor: h.hex }}
            >
              <div className="flex flex-col items-center py-4 sm:py-5">
                <span className="text-sm font-sans font-bold" style={{ color: textOn(h.hex) }}>
                  {h.name}
                </span>
                <span className="text-[10px] font-mono mt-0.5" style={{ color: textOn(h.hex), opacity: 0.8 }}>
                  {h.hex}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured curated palettes */}
      <section className="flex flex-col gap-4">
        <SectionHeading
          eyebrow="Explore"
          title="Featured palettes"
          right={
            <button
              onClick={() => go("explore")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CURATED_PALETTES.slice(0, 4).map((p) => (
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
              className="text-left rounded-2xl overflow-hidden border border-border-light bg-surface-base hover:shadow-premium-md hover:border-brand-primary/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <PaletteStrip colors={p.colors} onCopy={onCopy} height="h-20 sm:h-24" rounded="rounded-none" />
              <div className="p-4 flex flex-col gap-1.5">
                <h3 className="text-sm font-sans font-bold text-text-main">{p.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{p.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-text-muted leading-relaxed max-w-[70ch]">
        All processing is client-side. Palette pages like{" "}
        <button onClick={() => onChangeView({ type: "color-page", kind: "palette", id: "ocean-depths" })} className="text-brand-primary hover:underline cursor-pointer font-medium">
          /color-palettes/ocean-depths
        </button>{" "}
        are public and crawlable, so your palettes are linkable, citable and shareable.
      </p>
    </div>
  );
};

const textOn = (hex: string): string => {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111827" : "#FFFFFF";
};