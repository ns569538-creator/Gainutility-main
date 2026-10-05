/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { 
  CanvasObject, 
  ImageObject, 
  TextObject, 
  ShapeObject, 
  ArrowObject, 
  CarouselSlide, 
  AspectPreset, 
  CAROUSEL_PRESETS,
  BG_PRESET_COLORS,
  TEXT_PALETTE_COLORS,
  FONT_FAMILIES
} from "./types";
import { 
  Image as ImageIcon, 
  Type, 
  Square, 
  ArrowUpRight, 
  Sliders, 
  Trash2, 
  RotateCw, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  Maximize2, 
  Eye, 
  Sparkles, 
  Palette, 
  Check, 
  Smartphone,
  Layers,
  HelpCircle,
  Copy,
  LayoutTemplate,
  X
} from "lucide-react";
import { getTemplate } from "./templates";

/** Normalize any rgba/hex to a comparable hex (best-effort for color inputs). */
function normalizeHexInput(color: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgba) {
    const [r, g, b] = rgba.slice(1).map((n) => Number(n).toString(16).padStart(2, "0"));
    return `#${r}${g}${b}`;
  }
  return "#75AB52";
}

/** Convert a hex color to an rgba() string (pattern colors render translucent). */
function hexToRgba(hex: string, alpha = 0.25): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length !== 6) return `rgba(117,171,82,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface ContextualPropertiesPanelProps {
  selectedObject: CanvasObject | null;
  slide: CarouselSlide;
  slideIndex: number;
  totalSlides: number;
  preset: AspectPreset;
  onSetPreset: (preset: AspectPreset) => void;
  onUpdateSlide: (updates: Partial<CarouselSlide>) => void;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  showMarginGuides: boolean;
  onToggleMarginGuides: () => void;
  onCopy?: (text: string) => void;
  className?: string;
}

export const ContextualPropertiesPanel: React.FC<ContextualPropertiesPanelProps> = ({
  selectedObject,
  slide,
  slideIndex,
  totalSlides,
  preset,
  onSetPreset,
  onUpdateSlide,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  showMarginGuides,
  onToggleMarginGuides,
  onCopy,
  className = ""
}) => {
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const presetConfig = CAROUSEL_PRESETS[preset] || CAROUSEL_PRESETS.portrait;

  const PATTERN_TYPES: { value: NonNullable<CarouselSlide["pattern"]>["type"]; label: string }[] = [
    { value: "none", label: "None" },
    { value: "grid", label: "Grid" },
    { value: "dots", label: "Dots" },
    { value: "waves", label: "Waves" },
    { value: "lines", label: "Lines" },
    { value: "circles", label: "Circles" },
    { value: "shapes", label: "Shapes" },
  ];

  /** Plain-text summary of a slide's current text content (for LinkedIn captions). */
  const buildSlideTextSummary = (): string => {
    const lines = slide.objects
      .filter((o): o is TextObject => o.type === "text")
      .map((t) => t.text)
      .filter((t) => t && t.trim());
    const head = lines[0] || slide.name || `Slide ${slideIndex + 1}`;
    const body = lines.slice(1).join("");
    const handle = slide.authorHandle ? `  ${slide.authorHandle}` : "";
    return `${head}${body ? ` — ${body}` : ""}${handle}`;
  };

  const handleCopySlideSummary = () => {
    if (!onCopy) return;
    onCopy(buildSlideTextSummary());
  };

  const handleCopyBackgroundColor = () => {
    if (!onCopy) return;
    onCopy(slide.backgroundColor || "#141A12");
  };

  const appliedTemplate = slide.templateId ? getTemplate(slide.templateId) : undefined;

  // Helper to handle image replacement
  const handleReplaceImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedObject || selectedObject.type !== "image") return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        onUpdateObject(selectedObject.id, {
          imgSrc: src,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          naturalAspectRatio: aspect
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Quick Image Sizing presets
  const handleFitWidth = () => {
    if (!selectedObject || selectedObject.type !== "image") return;
    const imgObj = selectedObject as ImageObject;
    const targetW = presetConfig.width - 120; // with 60px margin
    const targetH = targetW / imgObj.naturalAspectRatio;
    onUpdateObject(imgObj.id, {
      x: 60,
      width: Math.round(targetW),
      height: Math.round(targetH)
    });
  };

  const handleFitHeight = () => {
    if (!selectedObject || selectedObject.type !== "image") return;
    const imgObj = selectedObject as ImageObject;
    const targetH = presetConfig.height - 240; // leaving top/bottom room
    const targetW = targetH * imgObj.naturalAspectRatio;
    onUpdateObject(imgObj.id, {
      x: Math.round((presetConfig.width - targetW) / 2),
      y: 120,
      width: Math.round(targetW),
      height: Math.round(targetH)
    });
  };

  const handleCenterImage = () => {
    if (!selectedObject) return;
    onUpdateObject(selectedObject.id, {
      x: Math.round((presetConfig.width - selectedObject.width) / 2),
      y: Math.round((presetConfig.height - selectedObject.height) / 2)
    });
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between p-2 sm:p-3 select-none overflow-hidden text-text-main ${className}`}>
      
      {/* Hidden Replace File Input */}
      <input 
        type="file" 
        ref={replaceFileInputRef} 
        onChange={handleReplaceImageFile} 
        accept="image/png,image/jpeg,image/webp,image/svg+xml" 
        className="hidden" 
      />

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 sm:space-y-3.5 custom-scrollbar min-h-0">

        {/* =================================================================== */}
        {/* CASE 1: IMAGE SELECTED                                             */}
        {/* =================================================================== */}
        {selectedObject && selectedObject.type === "image" && (() => {
          const imgObj = selectedObject as ImageObject;
          return (
            <div className="space-y-2.5 sm:space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light/80 pb-1.5 sm:pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary">
                      Image Object
                    </h4>
                    <p className="text-[10px] text-text-muted">
                      {imgObj.originalWidth} × {imgObj.originalHeight}px • Contained
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteObject(imgObj.id)}
                  className="text-[11px] text-status-error hover:bg-status-error/10 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Remove image from slide"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="font-sans font-medium">Remove</span>
                </button>
              </div>

              {/* Quick Sizing Actions */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Quick Fit Actions
                </label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <button
                    onClick={handleFitWidth}
                    className="py-1 px-1.5 rounded-lg bg-surface-muted hover:bg-surface-hover text-text-main border border-border-light text-[10px] font-medium transition-colors cursor-pointer text-center"
                  >
                    Fit Width
                  </button>
                  <button
                    onClick={handleFitHeight}
                    className="py-1 px-1.5 rounded-lg bg-surface-muted hover:bg-surface-hover text-text-main border border-border-light text-[10px] font-medium transition-colors cursor-pointer text-center"
                  >
                    Fit Height
                  </button>
                  <button
                    onClick={handleCenterImage}
                    className="py-1 px-1.5 rounded-lg bg-surface-muted hover:bg-surface-hover text-text-main border border-border-light text-[10px] font-medium transition-colors cursor-pointer text-center"
                  >
                    Center
                  </button>
                </div>
              </div>

              {/* Size & Position */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted">Width (px)</span>
                  <input
                    type="number"
                    value={imgObj.width}
                    onChange={(e) => {
                      const w = Math.max(20, parseInt(e.target.value) || 20);
                      const h = Math.round(w / imgObj.naturalAspectRatio);
                      onUpdateObject(imgObj.id, { width: w, height: h });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-surface-muted border border-border-light text-xs font-mono outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted">Height (px)</span>
                  <input
                    type="number"
                    value={imgObj.height}
                    onChange={(e) => {
                      const h = Math.max(20, parseInt(e.target.value) || 20);
                      const w = Math.round(h * imgObj.naturalAspectRatio);
                      onUpdateObject(imgObj.id, { width: w, height: h });
                    }}
                    className="w-full px-2 py-1 rounded-lg bg-surface-muted border border-border-light text-xs font-mono outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Corner Radius (Phone Screenshot Framing) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted">Corner Radius</span>
                  <span className="font-bold text-brand-primary">{imgObj.borderRadius || 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={48}
                  value={imgObj.borderRadius || 0}
                  onChange={(e) => onUpdateObject(imgObj.id, { borderRadius: parseInt(e.target.value) })}
                  className="w-full accent-brand-primary cursor-pointer h-1.5"
                />
              </div>

              {/* Shadow Styling Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Frame Shadow
                </label>
                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  {(["none", "phone", "lg", "glow"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdateObject(imgObj.id, { shadow: s })}
                      className={`p-1 rounded-lg border text-center font-medium capitalize transition-all cursor-pointer ${
                        imgObj.shadow === s 
                          ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold" 
                          : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                      }`}
                    >
                      {s === "phone" ? "Mobile" : s === "lg" ? "Soft" : s === "glow" ? "Glow" : "None"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation & Opacity */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Rotate</span>
                    <span>{imgObj.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={imgObj.rotation || 0}
                    onChange={(e) => onUpdateObject(imgObj.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-brand-primary cursor-pointer h-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Opacity</span>
                    <span>{Math.round((imgObj.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={imgObj.opacity ?? 1}
                    onChange={(e) => onUpdateObject(imgObj.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-brand-primary cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Action: Replace Image */}
              <div className="pt-2 border-t border-border-light/80 flex items-center gap-2">
                <button
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="w-full py-1.5 px-2 rounded-lg bg-surface-muted hover:bg-surface-hover border border-border-light text-xs font-sans font-semibold text-text-main flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Replace Image</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* CASE 2: TEXT SELECTED                                              */}
        {/* =================================================================== */}
        {selectedObject && selectedObject.type === "text" && (() => {
          const txtObj = selectedObject as TextObject;
          return (
            <div className="space-y-2.5 sm:space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light/80 pb-1.5 sm:pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <Type className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary">
                      Text Box
                    </h4>
                    <p className="text-[10px] text-text-muted">
                      Double-click on canvas to edit inline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteObject(txtObj.id)}
                  className="text-[11px] text-status-error hover:bg-status-error/10 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="font-sans font-medium">Delete</span>
                </button>
              </div>

              {/* Direct Content Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Content
                </label>
                <textarea
                  value={txtObj.text}
                  onChange={(e) => onUpdateObject(txtObj.id, { text: e.target.value })}
                  rows={2}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-light text-xs font-sans text-text-main outline-none focus:border-brand-primary resize-y"
                  placeholder="Type text here..."
                />
              </div>

              {/* Typography Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Typography Preset
                </label>
                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  {[
                    { label: "Heading", size: 54, weight: 800 },
                    { label: "Subhead", size: 34, weight: 600 },
                    { label: "Body", size: 26, weight: 400 },
                    { label: "Pill", size: 20, weight: 700 }
                  ].map((presetItem) => {
                    const isPill = presetItem.label === "Pill";
                    const isActive = isPill
                      ? (txtObj.textTransform || "").toLowerCase() === "uppercase" &&
                        Boolean(txtObj.textBgColor) &&
                        txtObj.textBgColor !== "transparent"
                      : txtObj.fontSize === presetItem.size &&
                        txtObj.fontWeight === presetItem.weight &&
                        txtObj.textBgColor === "transparent";
                    return (
                      <button
                        key={presetItem.label}
                        onClick={() => {
                          if (isPill) {
                            onUpdateObject(txtObj.id, {
                              fontSize: presetItem.size,
                              fontWeight: presetItem.weight,
                              textTransform: "uppercase",
                              textBgColor: "rgba(117, 171, 82, 0.2)",
                              textBgPadding: 10,
                              textBgRadius: 18,
                              fontColor: "#8BCE62"
                            });
                          } else {
                            onUpdateObject(txtObj.id, {
                              fontSize: presetItem.size,
                              fontWeight: presetItem.weight,
                              textBgColor: "transparent"
                            });
                          }
                        }}
                        title={`${presetItem.label}: ${presetItem.size}px · weight ${presetItem.weight}`}
                        className={`p-1 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center ${
                          isActive
                            ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold shadow-sm"
                            : "bg-surface-muted hover:bg-surface-hover border-border-light text-text-sub"
                        }`}
                      >
                        <span>{presetItem.label}</span>
                        <span className="text-[8px] font-mono opacity-70 leading-tight">{presetItem.size}px</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family & Alignment */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted">Font Family</span>
                  <select
                    value={txtObj.fontFamily || FONT_FAMILIES[0].value}
                    onChange={(e) => onUpdateObject(txtObj.id, { fontFamily: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg bg-surface-muted border border-border-light text-xs outline-none cursor-pointer"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.label} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted">Align</span>
                  <div className="flex rounded-lg bg-surface-muted border border-border-light overflow-hidden">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => onUpdateObject(txtObj.id, { textAlign: a })}
                        className={`flex-1 py-1 flex items-center justify-center cursor-pointer ${
                          txtObj.textAlign === a ? "bg-brand-primary text-white" : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        {a === "left" && <AlignLeft className="w-3 h-3" />}
                        {a === "center" && <AlignCenter className="w-3 h-3" />}
                        {a === "right" && <AlignRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Size</span>
                    <span>{txtObj.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={84}
                    value={txtObj.fontSize || 32}
                    onChange={(e) => onUpdateObject(txtObj.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-brand-primary cursor-pointer h-1.5"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted">Weight</span>
                  <select
                    value={String(txtObj.fontWeight || 600)}
                    onChange={(e) => onUpdateObject(txtObj.id, { fontWeight: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 rounded-lg bg-surface-muted border border-border-light text-xs outline-none cursor-pointer"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Black (800)</option>
                  </select>
                </div>
              </div>

              {/* Text Color Palette */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Text Color
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEXT_PALETTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateObject(txtObj.id, { fontColor: c })}
                      className={`w-5 h-5 rounded-full border border-black/20 flex items-center justify-center transition-transform cursor-pointer ${
                        txtObj.fontColor === c ? "scale-110 ring-2 ring-brand-primary" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {txtObj.fontColor === c && (
                        <Check className={`w-3 h-3 ${c === "#FFFFFF" || c === "#F4F7F2" ? "text-black" : "text-white"}`} />
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={txtObj.fontColor || "#FFFFFF"}
                    onChange={(e) => onUpdateObject(txtObj.id, { fontColor: e.target.value })}
                    className="w-6 h-6 rounded-lg border border-border-light cursor-pointer bg-transparent"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Text Background Pill */}
              <div className="space-y-1 pt-1 border-t border-border-light/60">
                <span className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Text Background
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => onUpdateObject(txtObj.id, { textBgColor: "transparent", textBgPadding: 0 })}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      !txtObj.textBgColor || txtObj.textBgColor === "transparent"
                        ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold"
                        : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                    }`}
                  >
                    None
                  </button>
                  <button
                    onClick={() => onUpdateObject(txtObj.id, { 
                      textBgColor: "rgba(117, 171, 82, 0.25)", 
                      textBgPadding: 8, 
                      textBgRadius: 16 
                    })}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      txtObj.textBgColor && txtObj.textBgColor.replace(/\s+/g, "").includes("117,171,82")
                        ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold"
                        : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                    }`}
                  >
                    Olive Pill
                  </button>
                  <button
                    onClick={() => onUpdateObject(txtObj.id, { 
                      textBgColor: "rgba(0, 0, 0, 0.65)", 
                      textBgPadding: 8, 
                      textBgRadius: 10 
                    })}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      txtObj.textBgColor && txtObj.textBgColor.replace(/\s+/g, "").includes("0,0,0")
                        ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold"
                        : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                    }`}
                  >
                    Dark Box
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* CASE 3: SHAPE SELECTED                                             */}
        {/* =================================================================== */}
        {selectedObject && selectedObject.type === "shape" && (() => {
          const shpObj = selectedObject as ShapeObject;
          return (
            <div className="space-y-2.5 sm:space-y-3.5">
              <div className="flex items-center justify-between border-b border-border-light/80 pb-1.5 sm:pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <Square className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary">
                      Shape
                    </h4>
                    <p className="text-[10px] text-text-muted capitalize">{shpObj.shapeKind}</p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteObject(shpObj.id)}
                  className="text-[11px] text-status-error hover:bg-status-error/10 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="font-sans font-medium">Delete</span>
                </button>
              </div>

              {/* Fill Color */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Fill Color
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEXT_PALETTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateObject(shpObj.id, { fillColor: c })}
                      className={`w-5 h-5 rounded-full border border-black/20 flex items-center justify-center transition-transform cursor-pointer ${
                        shpObj.fillColor === c ? "scale-110 ring-2 ring-brand-primary" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={shpObj.fillColor || "#75AB52"}
                    onChange={(e) => onUpdateObject(shpObj.id, { fillColor: e.target.value })}
                    className="w-6 h-6 rounded-lg border border-border-light cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Border Radius (for rounded rect) */}
              {shpObj.shapeKind === "rounded-rect" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-text-muted">Corner Radius</span>
                    <span className="font-bold text-brand-primary">{shpObj.borderRadius || 20}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={shpObj.borderRadius || 20}
                    onChange={(e) => onUpdateObject(shpObj.id, { borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-brand-primary cursor-pointer h-1.5"
                  />
                </div>
              )}

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-text-muted">
                  <span>Opacity</span>
                  <span>{Math.round((shpObj.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={shpObj.opacity ?? 1}
                  onChange={(e) => onUpdateObject(shpObj.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full accent-brand-primary cursor-pointer h-1.5"
                />
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* CASE 4: ARROW SELECTED                                             */}
        {/* =================================================================== */}
        {selectedObject && selectedObject.type === "arrow" && (() => {
          const arrObj = selectedObject as ArrowObject;
          return (
            <div className="space-y-2.5 sm:space-y-3.5">
              <div className="flex items-center justify-between border-b border-border-light/80 pb-1.5 sm:pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary">
                      Annotation Arrow
                    </h4>
                    <p className="text-[10px] text-text-muted">Pointer Graphic</p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteObject(arrObj.id)}
                  className="text-[11px] text-status-error hover:bg-status-error/10 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="font-sans font-medium">Delete</span>
                </button>
              </div>

              {/* Arrow Style */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Curve Style
                </label>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {[
                    { label: "Straight", val: "right" },
                    { label: "Curve R", val: "curved-right" },
                    { label: "Curve L", val: "curved-left" }
                  ].map((styleItem) => (
                    <button
                      key={styleItem.val}
                      onClick={() => onUpdateObject(arrObj.id, { arrowDirection: styleItem.val as any })}
                      className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                        arrObj.arrowDirection === styleItem.val
                          ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold"
                          : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                      }`}
                    >
                      {styleItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                  Arrow Color
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEXT_PALETTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateObject(arrObj.id, { color: c })}
                      className={`w-5 h-5 rounded-full border border-black/20 flex items-center justify-center transition-transform cursor-pointer ${
                        arrObj.color === c ? "scale-110 ring-2 ring-brand-primary" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* CASE 5: NO OBJECT SELECTED (DEFAULT SLIDE & CANVAS STYLING)        */}
        {/* =================================================================== */}
        {!selectedObject && (
          <div className="space-y-2.5 sm:space-y-3.5">
            {/* Header */}
            <div className="border-b border-border-light/80 pb-2">
              <div className="flex items-center gap-1.5 text-brand-primary font-mono text-[11px] font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Slide Canvas Settings</span>
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">
                Slide {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </p>
            </div>

            {/* Slide Background Color Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                Background Theme
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BG_PRESET_COLORS.map((bg) => {
                  const isCurrent = slide.backgroundColor === bg.value;
                  return (
                    <button
                      key={bg.name}
                      onClick={() => onUpdateSlide({ backgroundColor: bg.value, backgroundGradient: undefined })}
                      className={`p-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isCurrent 
                          ? "border-brand-primary ring-2 ring-brand-primary/40 shadow-sm" 
                          : "border-border-light hover:border-border-medium"
                      }`}
                      style={{ backgroundColor: bg.value }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10 flex items-center justify-center">
                        {isCurrent && (
                          <Check className={`w-2.5 h-2.5 ${bg.isLight ? "text-black" : "text-white"}`} />
                        )}
                      </div>
                      <span className={`text-[8px] font-mono leading-tight ${bg.isLight ? "text-neutral-800" : "text-neutral-200"}`}>
                        {bg.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applied Template Banner + Clear */}
            {appliedTemplate && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-brand-primary-light border border-brand-primary/25">
                <div className="flex items-center gap-1.5 min-w-0">
                  <LayoutTemplate className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span className="text-[11px] font-sans font-semibold text-brand-primary truncate">
                    {appliedTemplate.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSlide({
                      pattern: undefined,
                      backgroundGradient: undefined,
                      templateId: undefined,
                      accent: undefined
                    })
                  }
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-sans font-semibold text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
            )}

            {/* Slide Background Pattern (template-aware, WYSIWYG with export) */}
            <div className="space-y-1.5 pt-1 border-t border-border-light/80">
              <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                Background Pattern
              </label>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {PATTERN_TYPES.map((pt) => {
                  const isCurrent = (slide.pattern?.type ?? "none") === pt.value;
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => {
                        if (pt.value === "none") {
                          onUpdateSlide({ pattern: undefined });
                        } else {
                          onUpdateSlide({
                            pattern: slide.pattern?.type === pt.value
                              ? slide.pattern
                              : { type: pt.value, color: slide.pattern?.color || "rgba(117,171,82,0.2)", opacity: slide.pattern?.opacity ?? 0.9, scale: slide.pattern?.scale ?? 80 }
                          });
                        }
                      }}
                      className={`px-1 py-1 rounded-lg border text-center font-sans font-semibold cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-surface-muted border-border-light hover:border-brand-primary/50 text-text-sub"
                      }`}
                    >
                      {pt.label}
                    </button>
                  );
                })}
              </div>

              {slide.pattern && slide.pattern.type !== "none" && (
                <div className="space-y-2 pt-1">
                  {/* Accent / line color + live swatch */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono text-text-muted flex-1">
                      Pattern Color
                    </label>
                    <input
                      type="color"
                      value={normalizeHexInput(slide.pattern.color)}
                      onChange={(e) =>
                        onUpdateSlide({ pattern: { ...(slide.pattern as NonNullable<CarouselSlide["pattern"]>), color: hexToRgba(e.target.value, 0.25) } })
                      }
                      className="w-7 h-7 rounded-lg border border-border-light cursor-pointer bg-transparent p-0.5"
                      aria-label="Pattern color"
                    />
                    <input
                      type="text"
                      value={slide.pattern.color}
                      onChange={(e) => onUpdateSlide({ pattern: { ...(slide.pattern as NonNullable<CarouselSlide["pattern"]>), color: e.target.value } })}
                      className="w-24 px-1.5 py-1 rounded-lg bg-surface-muted border border-border-light text-[10px] font-mono outline-none focus:border-brand-primary"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono text-text-muted w-16">
                      Opacity
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={slide.pattern.opacity}
                      onChange={(e) => onUpdateSlide({ pattern: { ...(slide.pattern as NonNullable<CarouselSlide["pattern"]>), opacity: Number(e.target.value) } })}
                      className="flex-1 accent-brand-primary"
                    />
                    <span className="text-[10px] font-mono text-text-muted w-8 text-right">
                      {Math.round(slide.pattern.opacity * 100)}%
                    </span>
                  </div>

                  {/* Scale / density */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono text-text-muted w-16">
                      Scale
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      value={slide.pattern.scale}
                      onChange={(e) => onUpdateSlide({ pattern: { ...(slide.pattern as NonNullable<CarouselSlide["pattern"]>), scale: Number(e.target.value) } })}
                      className="flex-1 accent-brand-primary"
                    />
                    <span className="text-[10px] font-mono text-text-muted w-8 text-right">
                      {slide.pattern.scale}px
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5 pt-1.5 border-t border-border-light/80">
              <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                Carousel Ratio
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(Object.keys(CAROUSEL_PRESETS) as AspectPreset[]).map((key) => {
                  const p = CAROUSEL_PRESETS[key];
                  const isCurrent = preset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onSetPreset(key)}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent 
                          ? "bg-brand-primary-light border-brand-primary text-brand-primary font-bold shadow-sm" 
                          : "bg-surface-muted border-border-light hover:bg-surface-hover text-text-sub"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-semibold text-xs">{p.ratio}</span>
                        {p.badge && (
                          <span className="text-[8px] bg-brand-primary text-white px-1 py-0.2 rounded font-mono">
                            Best
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-text-muted block">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slide Overlays & Customization */}
            <div className="space-y-1.5 pt-1.5 border-t border-border-light/80">
              <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                Slide Overlays
              </label>

              {/* Slide Counter */}
              <div className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-surface-muted border border-border-light">
                <span className="font-sans font-medium text-[11px] text-text-main">Slide Number ({String(slideIndex + 1).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")})</span>
                <input
                  type="checkbox"
                  checked={slide.counterEnabled !== false}
                  onChange={(e) => onUpdateSlide({ counterEnabled: e.target.checked })}
                  className="rounded accent-brand-primary cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {/* Swipe Cue */}
              <div className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-surface-muted border border-border-light">
                <span className="font-sans font-medium text-[11px] text-text-main">Swipe Cue (&quot;Swipe →&quot;)</span>
                <input
                  type="checkbox"
                  checked={Boolean(slide.swipeCueEnabled)}
                  onChange={(e) => onUpdateSlide({ swipeCueEnabled: e.target.checked })}
                  className="rounded accent-brand-primary cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {/* Author Handle */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-text-muted">Author Watermark</span>
                <input
                  type="text"
                  value={slide.authorHandle || ""}
                  onChange={(e) => onUpdateSlide({ authorHandle: e.target.value })}
                  placeholder="@yourhandle"
                  className="w-full px-2 py-1 rounded-lg bg-surface-muted border border-border-light text-xs font-mono outline-none focus:border-brand-primary"
                />
              </div>

              {/* Safe Margins */}
              <div className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-surface-muted border border-border-light">
                <span className="font-sans font-medium text-[11px] text-text-main">Safe Margin Guides</span>
                <input
                  type="checkbox"
                  checked={showMarginGuides}
                  onChange={onToggleMarginGuides}
                  className="rounded accent-brand-primary cursor-pointer w-3.5 h-3.5"
                />
              </div>
            </div>

            {/* Copy & Publish (clipboard controls, individual post support) */}
            <div className="space-y-1.5 pt-1.5 border-t border-border-light/80">
              <label className="text-[10px] font-mono font-semibold uppercase text-text-muted">
                Copy &amp; Publish
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={handleCopySlideSummary}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border-light text-[11px] font-sans font-semibold text-text-main transition-all cursor-pointer"
                  title="Copy this slide's text as a LinkedIn caption snippet"
                >
                  <Copy className="w-3.5 h-3.5 text-brand-primary" />
                  Copy Slide Summary
                </button>
                <button
                  type="button"
                  onClick={handleCopyBackgroundColor}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border-light text-[11px] font-sans font-semibold text-text-main transition-all cursor-pointer"
                  title="Copy this slide's background hex color"
                >
                  <Palette className="w-3.5 h-3.5 text-brand-primary" />
                  Copy Background Color
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    {slide.backgroundColor}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
