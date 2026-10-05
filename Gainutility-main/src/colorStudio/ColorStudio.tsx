/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — workspace shell + section navigation.
 */
import React from "react";
import { ViewState, ColorStudioSectionId } from "../types";
import { Breadcrumbs } from "../components/Common";
import {
  Wand2,
  Compass,
  SwatchBook,
  Layers,
  MonitorSmartphone,
  Contrast,
  ImageUp,
  PaintbrushVertical,
  Sparkles,
  ArrowRight,
  Droplet,
  Ruler,
} from "lucide-react";
import { ColorStudioHome } from "./ColorStudioHome";
import { PaletteGeneratorSection } from "./sections/GeneratorSection";
import { ColorPickerSection } from "./sections/PickerSection";
import { ExploreSection } from "./sections/ExploreSection";
import { ScaleSection } from "./sections/ScaleSection";
import { ColorsSection } from "./sections/ColorsSection";
import { UiColorsSection } from "./sections/UiColorsSection";
import { VisualizerSection } from "./sections/VisualizerSection";
import { ContrastSection } from "./sections/ContrastSection";
import { ImagePaletteSection } from "./sections/ImagePaletteSection";
import { GradientSection } from "./sections/GradientSection";

export const COLOR_STUDIO_NAV: {
  id: ColorStudioSectionId;
  label: string;
  desc: string;
}[] = [
  { id: "generator", label: "Generator", desc: "Generate palettes" },
  { id: "picker", label: "Color Picker", desc: "Pick any color" },
  { id: "explore", label: "Explore", desc: "Curated + named colors" },
  { id: "scales", label: "Scales", desc: "50–950 tonal scale" },
  { id: "ui-colors", label: "UI Colors", desc: "Reference systems" },
  { id: "visualizer", label: "Visualizer", desc: "Preview on real UI" },
  { id: "contrast", label: "Contrast", desc: "WCAG contrast checks" },
  { id: "image", label: "Image → Palette", desc: "Extract from photos" },
  { id: "gradients", label: "Gradients", desc: "CSS gradient builder" },
];

export const SECTION_ICONS: Record<ColorStudioSectionId, React.ReactNode> = {
  home: <Sparkles className="w-4 h-4" />,
  generator: <Wand2 className="w-4 h-4" />,
  picker: <Droplet className="w-4 h-4" />,
  explore: <Compass className="w-4 h-4" />,
  scales: <Ruler className="w-4 h-4" />,
  colors: <SwatchBook className="w-4 h-4" />,
  "ui-colors": <Layers className="w-4 h-4" />,
  visualizer: <MonitorSmartphone className="w-4 h-4" />,
  contrast: <Contrast className="w-4 h-4" />,
  image: <ImageUp className="w-4 h-4" />,
  gradients: <PaintbrushVertical className="w-4 h-4" />,
};

export interface ColorStudioWorkspaceProps {
  section: ColorStudioSectionId;
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onCopy: (text: string) => void;
}

export const STUDIO_ROOT = "/studios/color";

const SECTION_TITLES: Record<ColorStudioSectionId, string> = {
  home: "Color Studio",
  generator: "Palette Generator",
  picker: "Color Picker",
  explore: "Explore Palettes",
  scales: "Tonal Scale",
  colors: "Color Explorer",
  "ui-colors": "UI Color Systems",
  visualizer: "UI Visualizer",
  contrast: "Contrast Checker",
  image: "Image to Palette",
  gradients: "Gradient Generator",
};

export const ColorStudioWorkspace: React.FC<ColorStudioWorkspaceProps> = ({
  section,
  onChangeView,
  onAddToast,
  onCopy,
}) => {
  const navTo = (id: ColorStudioSectionId) => onChangeView({ type: "color-studio", section: id });

  const content = (() => {
    switch (section) {
      case "home":
        return <ColorStudioHome onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "generator":
        return <PaletteGeneratorSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "picker":
        return <ColorPickerSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "explore":
        return <ExploreSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "scales":
        return <ScaleSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "colors":
        return <ColorsSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "ui-colors":
        return <UiColorsSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "visualizer":
        return <VisualizerSection onChangeView={onChangeView} onAddToast={onAddToast} onCopy={onCopy} />;
      case "contrast":
        return <ContrastSection onChangeView={onChangeView} onCopy={onCopy} onAddToast={onAddToast} />;
      case "image":
        return <ImagePaletteSection onChangeView={onChangeView} onCopy={onCopy} onAddToast={onAddToast} />;
      case "gradients":
        return <GradientSection onChangeView={onChangeView} onCopy={onCopy} onAddToast={onAddToast} />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex flex-col gap-6 sm:gap-8" id="color-studio-workspace">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 text-xs sm:text-sm text-text-muted font-medium">
        <Breadcrumbs
          paths={[
            { name: "Home", active: false, onClick: () => onChangeView({ type: "home" }) },
            { name: "Color Studio", active: section === "home", onClick: () => navTo("home") },
            ...(section !== "home"
              ? [{ name: SECTION_TITLES[section], active: true as const, onClick: undefined as undefined }]
              : []),
          ]}
        />
        <span className="text-[10px] sm:text-[11px] font-mono text-text-disabled uppercase">100% in-browser</span>
      </div>

      {/* Studio bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-primary-light border border-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0">
            <SwatchBook className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="heading-h1 text-text-main font-sans font-bold text-xl sm:text-2xl md:text-[26px] leading-tight">
              Color Studio
            </h1>
            <p className="text-xs sm:text-sm text-text-muted truncate">
              {section === "home"
                ? "Colors for real interfaces — generate, explore and ship palettes that work."
                : SECTION_TITLES[section]}
            </p>
          </div>
        </div>
        {section !== "generator" && (
          <button
            onClick={() => navTo("generator")}
            className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[42px] px-4 sm:px-5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-xs sm:text-sm font-sans font-bold transition-colors cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            Generate palette
          </button>
        )}
      </div>

      {/* Section nav */}
      <nav
        aria-label="Color Studio sections"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
      >
        {COLOR_STUDIO_NAV.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navTo(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold whitespace-nowrap transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
                active
                  ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm"
                  : "bg-surface-base border-border-light text-text-sub hover:text-brand-primary hover:border-brand-primary/40"
              }`}
            >
              {SECTION_ICONS[item.id]}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active section */}
      <div className="flex flex-col gap-8">{content}</div>

      {/* Jump helpers */}
      {section === "home" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navTo("generator")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
          >
            Open the generator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};