/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Unified Color UI Design System Primitives.
 * Provides consistent, accessible, and unmistakable visual affordances
 * for color display, selection, picking, editing, and exporting.
 */
import React, { useState, useRef, useId, useMemo } from "react";
import {
  Copy,
  Check,
  Pipette,
  Palette,
  Download,
  Code,
  CheckCircle2,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  ChevronDown,
  Sparkles,
  Sliders,
  RotateCcw,
} from "lucide-react";
import {
  normalizeHex,
  textColorOn,
  SCALE_STEPS,
  generateScale,
  ColorScale as ColorScaleType,
  contrastRatio,
  hexToRgb,
  hexToHsl,
  hexToOklch,
  rgbToHex,
  hslToHex,
  oklchToHex,
  formatColor,
  ColorFormat,
  parseColor,
  Rgb,
  Hsl,
  Oklch,
} from "./color";
import { nearestNamedColor } from "./colorData";

/* ------------------------------------------------------------------ */
/* 1. Micro Copy Button with Instant Inline Feedback                  */
/* ------------------------------------------------------------------ */

export interface CopyValueButtonProps {
  value: string;
  onCopy?: (text: string) => void;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md";
  className?: string;
  title?: string;
  variant?: "ghost" | "solid" | "chip";
}

export const CopyValueButton: React.FC<CopyValueButtonProps> = ({
  value,
  onCopy,
  label = "Copy",
  copiedLabel = "Copied",
  size = "md",
  className = "",
  title,
  variant = "ghost",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    if (onCopy) onCopy(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const baseCls =
    size === "sm"
      ? "text-[11px] px-2 py-1 gap-1 rounded-md"
      : "text-xs px-2.5 py-1.5 gap-1.5 rounded-lg";

  const variantCls =
    variant === "solid"
      ? copied
        ? "bg-status-success text-white font-bold"
        : "bg-surface-muted hover:bg-surface-hover text-text-main font-semibold"
      : variant === "chip"
      ? copied
        ? "bg-status-success/15 text-status-success border border-status-success/30 font-bold"
        : "bg-surface-base hover:bg-surface-muted border border-border-light text-text-sub font-semibold"
      : copied
      ? "text-status-success font-bold"
      : "text-brand-primary hover:text-brand-primary-hover font-semibold hover:bg-brand-primary-light/40";

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title ?? `Copy ${value}`}
      aria-label={`Copy ${value}`}
      className={`shrink-0 inline-flex items-center justify-center transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${baseCls} ${variantCls} ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-status-success shrink-0" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* 2. WCAG Contrast Badge with AA / AAA Compliance                    */
/* ------------------------------------------------------------------ */

export interface ContrastBadgeProps {
  color?: string;
  background?: string;
  ratio?: number;
  size?: "sm" | "md";
  className?: string;
  showDetails?: boolean;
}

export const ContrastBadge: React.FC<ContrastBadgeProps> = ({
  color = "#000000",
  background = "#FFFFFF",
  ratio: manualRatio,
  size = "md",
  className = "",
  showDetails = true,
}) => {
  const normColor = normalizeHex(color) ?? color;
  const normBg = normalizeHex(background) ?? background;
  const ratio = manualRatio ?? contrastRatio(normColor, normBg);
  const formattedRatio = ratio.toFixed(2);

  const isAAA = ratio >= 7.0;
  const isAA = ratio >= 4.5;
  const isAALarge = ratio >= 3.0;

  const statusCls = isAAA
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    : isAA
    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30"
    : isAALarge
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";

  const sizeCls = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg border ${statusCls} ${sizeCls} ${className}`}
      title={`Contrast ratio ${formattedRatio}:1 on ${normBg}`}
      role="status"
    >
      {isAA ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      ) : isAALarge ? (
        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{formattedRatio}:1</span>
      {showDetails && (
        <span className="font-sans font-semibold text-[10px] uppercase tracking-wider opacity-90">
          {isAAA ? "AAA" : isAA ? "AA" : isAALarge ? "AA Large" : "Fail"}
        </span>
      )}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Color Format Tabs (Segmented Control)                           */
/* ------------------------------------------------------------------ */

export interface ColorFormatTabsProps {
  activeFormat: ColorFormat;
  onChangeFormat: (format: ColorFormat) => void;
  className?: string;
  formats?: ColorFormat[];
}

export const ColorFormatTabs: React.FC<ColorFormatTabsProps> = ({
  activeFormat,
  onChangeFormat,
  className = "",
  formats = ["hex", "rgb", "hsl", "oklch"],
}) => {
  return (
    <div
      role="tablist"
      aria-label="Color representation format"
      className={`inline-flex items-center p-1 rounded-xl bg-surface-muted/60 border border-border-light/80 ${className}`}
    >
      {formats.map((fmt) => {
        const isActive = activeFormat === fmt;
        return (
          <button
            key={fmt}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChangeFormat(fmt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isActive
                ? "bg-surface-base text-brand-primary shadow-sm border border-black/5"
                : "text-text-muted hover:text-text-main hover:bg-surface-base/50"
            }`}
          >
            {fmt}
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Color Token (Semantic Role Chip)                                */
/* ------------------------------------------------------------------ */

export interface ColorTokenProps {
  color: string;
  role?: string;
  label?: string;
  sublabel?: string;
  onCopy?: (hex: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const ColorToken: React.FC<ColorTokenProps> = ({
  color,
  role,
  label,
  sublabel,
  onCopy,
  onClick,
  isSelected = false,
  className = "",
}) => {
  const norm = normalizeHex(color) ?? color;
  const ink = textColorOn(norm);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (onCopy) {
      onCopy(norm);
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
        isSelected
          ? "border-brand-primary bg-brand-primary-light/40 ring-2 ring-brand-primary/30 shadow-sm"
          : "border-border-light bg-surface-base hover:border-border-medium hover:bg-surface-muted/40"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <span
        className="w-4 h-4 rounded-full border border-black/15 shadow-inner shrink-0"
        style={{ backgroundColor: norm }}
        aria-hidden="true"
      />
      <div className="flex items-baseline gap-1.5 min-w-0">
        {role && (
          <span className="text-xs font-sans font-bold text-text-main truncate">{role}</span>
        )}
        <span className="text-[11px] font-mono font-semibold text-text-muted truncate">
          {label ?? norm}
        </span>
        {sublabel && (
          <span className="text-[10px] text-text-muted/70 truncate">({sublabel})</span>
        )}
      </div>
      {onCopy && (
        <CopyValueButton
          value={norm}
          onCopy={onCopy}
          size="sm"
          variant="ghost"
          label=""
          copiedLabel=""
          className="ml-auto p-1"
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Color Swatch (Pure Display Component)                           */
/* ------------------------------------------------------------------ */

export interface ColorSwatchProps {
  color?: string;
  hex?: string;
  name?: string;
  label?: string;
  sublabel?: string;
  role?: string;
  size?: "sm" | "md" | "lg" | "hero";
  variant?: "hero" | "card" | "compact";
  isSelected?: boolean;
  isInteractive?: boolean;
  showCopyOverlay?: boolean;
  onSelect?: () => void;
  onCopy?: (hex: string) => void;
  className?: string;
  showValues?: boolean;
  children?: React.ReactNode;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  hex,
  name,
  label,
  sublabel,
  role,
  size,
  variant,
  isSelected = false,
  isInteractive = false,
  showCopyOverlay = true,
  onSelect,
  onCopy,
  className = "",
  showValues = true,
  children,
}) => {
  const resolvedColor = hex ?? color ?? "#7C3AED";
  const norm = normalizeHex(resolvedColor) ?? resolvedColor;
  const resolvedName = label ?? name;
  const resolvedRole = sublabel ?? role;
  const resolvedSize = size ?? (variant === "hero" ? "hero" : "md");
  const ink = textColorOn(norm);
  const rgb = hexToRgb(norm);
  const hsl = hexToHsl(norm);

  const heightCls =
    resolvedSize === "sm"
      ? "h-14 sm:h-16"
      : resolvedSize === "lg"
      ? "h-28 sm:h-36"
      : resolvedSize === "hero"
      ? "h-48 sm:h-56 lg:h-64"
      : "h-20 sm:h-24";

  return (
    <div
      role={isInteractive || onSelect ? "button" : undefined}
      tabIndex={isInteractive || onSelect ? 0 : undefined}
      onClick={() => onSelect && onSelect()}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative w-full ${heightCls} rounded-2xl overflow-hidden border border-black/10 transition-all ${
        isSelected
          ? "ring-4 ring-brand-primary ring-offset-2 ring-offset-surface-base shadow-premium-md scale-[1.01]"
          : isInteractive
          ? "cursor-pointer hover:shadow-premium-md hover:scale-[1.01] active:scale-[0.99]"
          : ""
      } ${className}`}
      style={{ backgroundColor: norm }}
    >
      {/* Subtle checkerboard backing for alpha translucency */}
      <div
        className="absolute inset-0 -z-10 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      />

      {/* Selected Indicator Badge */}
      {isSelected && (
        <span
          className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm"
          style={{
            backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)",
            color: ink,
          }}
        >
          <Check className="w-3 h-3" /> Selected
        </span>
      )}

      {/* Quick Copy Button on Top Right */}
      {onCopy && (
        <div className="absolute top-2.5 right-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(norm);
            }}
            title={`Copy ${norm}`}
            aria-label={`Copy ${norm}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.65)",
              color: ink,
            }}
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
        </div>
      )}

      {/* Bottom Swatch Information Overlay */}
      {showValues && (
        <div
          className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end gap-0.5 pointer-events-none"
          style={{
            background:
              ink === "#FFFFFF"
                ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)"
                : "linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)",
          }}
        >
          {role && (
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-85 truncate"
              style={{ color: ink }}
            >
              {role}
            </span>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono font-bold text-base sm:text-lg tracking-tight" style={{ color: ink }}>
              {norm}
            </span>
            {name && (
              <span className="font-sans font-bold text-xs sm:text-sm truncate opacity-95" style={{ color: ink }}>
                {name}
              </span>
            )}
          </div>
          {size === "hero" && rgb && hsl && (
            <div className="flex items-center gap-3 text-[11px] font-mono opacity-80 mt-1" style={{ color: ink }}>
              <span>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
              <span>•</span>
              <span>hsl({Math.round(hsl.h)}°, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%)</span>
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Universal ColorPickerField (The Primary Color Control)          */
/* ------------------------------------------------------------------ */

export interface ColorPickerFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  helperText?: string;
  roleBadge?: string;
  onCopy?: (text: string) => void;
  allowFormats?: boolean;
  showFormat?: boolean;
  className?: string;
  showRgbHslSliders?: boolean;
  showSliders?: boolean;
  id?: string;
}

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  onChange,
  label = "Change color",
  helperText,
  roleBadge,
  onCopy,
  allowFormats = true,
  showFormat,
  className = "",
  showRgbHslSliders = false,
  showSliders,
  id,
}) => {
  const effectiveShowSliders = showSliders ?? showRgbHslSliders;
  const effectiveAllowFormats = showFormat ?? allowFormats;
  const norm = normalizeHex(value) ?? "#4F6F2F";
  const [inputText, setInputText] = useState(norm);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [expanded, setExpanded] = useState(effectiveShowSliders);
  const nativePickerRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // Sync internal text state with parent prop updates
  React.useEffect(() => {
    setInputText(norm);
  }, [norm]);

  const rgb = hexToRgb(norm) ?? { r: 79, g: 111, b: 47 };
  const hsl = hexToHsl(norm) ?? { h: 90, s: 40, l: 31 };
  const oklch = hexToOklch(norm) ?? { l: 0.5, c: 0.1, h: 130 };

  const handleTextCommit = (str: string) => {
    const parsed = parseColor(str);
    if (parsed) {
      onChange(parsed.hex);
      setInputText(parsed.hex);
    } else {
      const direct = normalizeHex(str);
      if (direct) {
        onChange(direct);
        setInputText(direct);
      }
    }
  };

  const handleRgbChannel = (channel: keyof Rgb, val: number) => {
    const nextRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, val)) };
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    onChange(nextHex);
    setInputText(nextHex);
  };

  const handleHslChannel = (channel: keyof Hsl, val: number) => {
    const maxVal = channel === "h" ? 360 : 100;
    const nextHsl = { ...hsl, [channel]: Math.max(0, Math.min(maxVal, val)) };
    const nextHex = hslToHex(nextHsl.h, nextHsl.s, nextHsl.l);
    onChange(nextHex);
    setInputText(nextHex);
  };

  const formattedDisplay = useMemo(() => {
    switch (format) {
      case "rgb":
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case "hsl":
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      case "oklch":
        return `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(2)} ${Math.round(oklch.h)})`;
      default:
        return norm;
    }
  }, [format, norm, rgb, hsl, oklch]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header Label & Role Badge */}
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-xs font-sans font-bold text-text-main flex items-center gap-2">
          <span>{label}</span>
          {roleBadge && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
              {roleBadge}
            </span>
          )}
        </label>
        {allowFormats && (
          <ColorFormatTabs
            activeFormat={format}
            onChangeFormat={setFormat}
            formats={["hex", "rgb", "hsl"]}
          />
        )}
      </div>

      {/* Main Interactive Row */}
      <div className="group relative flex flex-wrap items-center gap-2 p-2 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all">
        {/* Visual Swatch & Native Color Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => nativePickerRef.current?.click()}
            title="Open native color picker"
            aria-label="Open color picker dialog"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-black/15 shadow-inner cursor-pointer relative overflow-hidden flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            style={{ backgroundColor: norm }}
          >
            <Pipette
              className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: textColorOn(norm) }}
              aria-hidden="true"
            />
          </button>
          {/* Visually hidden native color input */}
          <input aria-label="Native color picker"
            ref={nativePickerRef}
            type="color"
            value={norm}
            onChange={(e) => {
              onChange(e.target.value.toUpperCase());
              setInputText(e.target.value.toUpperCase());
            }}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none cursor-pointer"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Editable Value Field */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <input
            id={inputId}
            value={format === "hex" ? inputText : formattedDisplay}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTextCommit(e.target.value);
            }}
            onBlur={() => handleTextCommit(inputText)}
            placeholder="#3B82F6"
            spellCheck={false}
            style={{ minWidth: "140px" }}
            className="w-full bg-transparent font-mono text-sm sm:text-base font-bold text-text-main focus:outline-none placeholder:text-text-muted/60"
            aria-label={`Color value in ${format.toUpperCase()}`}
          />
          <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted truncate">
            <span>{nearestNamedColor(norm)?.name ?? "Custom"}</span>
            <span>•</span>
            <span>{format.toUpperCase()}</span>
          </div>
        </div>

        {/* Action Controls: Change Button & Copy Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => nativePickerRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
            title="Open color picker"
          >
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Change</span>
          </button>

          <CopyValueButton
            value={formattedDisplay}
            onCopy={onCopy}
            variant="chip"
            label="Copy"
            copiedLabel="Copied"
          />

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="Toggle fine-tuning sliders"
            title="Sliders fine tuning"
            className={`p-2 rounded-xl border border-border-light text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer ${
              expanded ? "bg-surface-muted text-brand-primary border-brand-primary/30" : "bg-surface-base"
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {helperText && <p className="text-xs text-text-muted px-1">{helperText}</p>}

      {/* Expanded Slider Controls for Channel Fine-Tuning */}
      {expanded && (
        <div className="p-4 rounded-2xl border border-border-light bg-surface-muted/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-text-main">
            <span className="uppercase tracking-wider font-mono text-[10px] text-text-muted">Channel Sliders</span>
            <span className="font-mono text-xs">{norm}</span>
          </div>

          {/* RGB Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["r", "g", "b"] as const).map((ch) => (
              <div key={ch} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono font-bold uppercase text-text-muted">
                  <span>{ch.toUpperCase()}</span>
                  <span>{rgb[ch]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={(e) => handleRgbChannel(ch, parseInt(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer min-h-[32px]"
                  aria-label={`${ch.toUpperCase()} channel`}
                />
              </div>
            ))}
          </div>

          {/* HSL Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-light/60">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono font-bold uppercase text-text-muted">
                <span>Hue</span>
                <span>{Math.round(hsl.h)}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={Math.round(hsl.h)}
                onChange={(e) => handleHslChannel("h", parseInt(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer min-h-[32px]"
                aria-label="Hue angle"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono font-bold uppercase text-text-muted">
                <span>Sat</span>
                <span>{Math.round(hsl.s)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(hsl.s)}
                onChange={(e) => handleHslChannel("s", parseInt(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer min-h-[32px]"
                aria-label="Saturation percentage"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono font-bold uppercase text-text-muted">
                <span>Light</span>
                <span>{Math.round(hsl.l)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(hsl.l)}
                onChange={(e) => handleHslChannel("l", parseInt(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer min-h-[32px]"
                aria-label="Lightness percentage"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Color Value Field (Read-only / Copy-rich Value Row)             */
/* ------------------------------------------------------------------ */

export interface ColorValueFieldProps {
  label: string;
  value: string;
  onCopy?: (text: string) => void;
  subtext?: string;
  className?: string;
}

export const ColorValueField: React.FC<ColorValueFieldProps> = ({
  label,
  value,
  onCopy,
  subtext,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-xl border border-border-light bg-surface-base hover:bg-surface-muted/30 transition-colors ${className}`}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
          {label}
        </span>
        <code className="text-sm font-mono font-bold text-text-main block truncate mt-0.5">{value}</code>
        {subtext && <span className="text-[11px] text-text-muted/80 block mt-0.5">{subtext}</span>}
      </div>
      <CopyValueButton value={value} onCopy={onCopy} size="sm" variant="chip" />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Reusable Tonal Color Scale (50–950 in OKLCH)                    */
/* ------------------------------------------------------------------ */

export interface ColorScaleComponentProps {
  hex?: string;
  baseHex?: string;
  onCopy?: (hex: string) => void;
  onSelectStep?: (hex: string, step?: number) => void;
  className?: string;
}

export const ColorScale: React.FC<ColorScaleComponentProps> = ({
  hex,
  baseHex,
  onCopy,
  onSelectStep,
  className = "",
}) => {
  const rawHex = baseHex ?? hex ?? "#4F6F2F";
  const norm = normalizeHex(rawHex) ?? "#4F6F2F";
  const activeScale = useMemo(() => generateScale(norm), [norm]);
  const steps = SCALE_STEPS;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-1.5">
        {steps.map((step) => {
          const stepHex = activeScale[step];
          if (!stepHex) return null;
          const ink = textColorOn(stepHex);
          const isBase = step === 500;

          return (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (onSelectStep) onSelectStep(stepHex, step);
                else if (onCopy) onCopy(stepHex);
              }}
              title={`Step ${step}: ${stepHex}${isBase ? " (Base)" : ""}`}
              aria-label={`Step ${step} ${stepHex}`}
              className={`group relative rounded-xl p-2.5 flex flex-col justify-between h-20 sm:h-24 border border-black/10 transition-all cursor-pointer hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                isBase ? "ring-2 ring-brand-primary shadow-premium-sm" : ""
              }`}
              style={{ backgroundColor: stepHex }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold" style={{ color: ink }}>
                  {step}
                </span>
                {isBase && (
                  <span
                    className="text-[9px] font-mono font-extrabold px-1 rounded uppercase tracking-wider shadow-xs"
                    style={{
                      backgroundColor: ink === "#FFFFFF" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
                      color: ink,
                    }}
                  >
                    Base
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-mono truncate w-full" style={{ color: ink }}>
                  {stepHex}
                </span>
                <span
                  className="text-[9px] font-mono font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: ink }}
                >
                  Copy
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 9. Interactive Color Palette Bar                                   */
/* ------------------------------------------------------------------ */

export interface ColorPaletteProps {
  colors: string[];
  onCopy?: (text: string) => void;
  onSelectColor?: (color: string, index: number) => void;
  onSelect?: (color: string, index?: number) => void;
  selectedIndex?: number | null;
  selectedColor?: string | null;
  className?: string;
  height?: string;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  onCopy,
  onSelectColor,
  onSelect,
  selectedIndex = null,
  selectedColor = null,
  className = "",
  height = "h-16 sm:h-20",
}) => {
  return (
    <div className={`flex w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm ${height} ${className}`}>
      {colors.map((c, i) => {
        const hex = normalizeHex(c) ?? c;
        const ink = textColorOn(hex);
        const isSelected =
          selectedIndex === i ||
          (selectedColor && (normalizeHex(selectedColor) ?? selectedColor).toLowerCase() === hex.toLowerCase());

        return (
          <button
            key={`${hex}-${i}`}
            type="button"
            onClick={() => {
              if (onSelect) onSelect(hex, i);
              if (onSelectColor) onSelectColor(hex, i);
              if (!onSelect && !onSelectColor && onCopy) onCopy(hex);
            }}
            title={`Color ${i + 1}: ${hex}`}
            aria-label={`Color ${i + 1} ${hex}`}
            className={`relative flex-1 min-w-0 cursor-pointer hover:flex-[1.3] transition-all group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary ${
              isSelected ? "flex-[1.4] ring-2 ring-inset ring-white shadow-inner" : ""
            }`}
            style={{ backgroundColor: hex }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-between p-2 opacity-90 group-hover:opacity-100">
              <span className="text-[10px] font-mono font-bold" style={{ color: ink }}>
                {i + 1}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold truncate" style={{ color: ink }}>
                {hex}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 10. Selected Color State Helper Badge                              */
/* ------------------------------------------------------------------ */

export const SelectedColorState: React.FC<{ label?: string; className?: string }> = ({
  label = "Active Color",
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-brand-primary bg-brand-primary-light border border-brand-primary/30 shadow-xs ${className}`}
  >
    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
    <span>{label}</span>
  </span>
);

/* ------------------------------------------------------------------ */
/* 11. Comprehensive Export Bar                                       */
/* ------------------------------------------------------------------ */

export interface ExportBarProps {
  colors: string[];
  name?: string;
  paletteName?: string;
  onCopy?: (text: string) => void;
  className?: string;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  colors,
  name,
  paletteName,
  onCopy,
  className = "",
}) => {
  const actualName = paletteName ?? name ?? "GainUtility Palette";
  const normColors = useMemo(() => colors.map((c) => normalizeHex(c) ?? c), [colors]);

  const cssVariables = useMemo(() => {
    return `:root {\n` +
      normColors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n") +
      `\n}`;
  }, [normColors]);

  const tailwindConfig = useMemo(() => {
    return `@theme {\n` +
      normColors.map((c, i) => `  --color-palette-${i + 1}: ${c};`).join("\n") +
      `\n}`;
  }, [normColors]);

  const scssVariables = useMemo(() => {
    return normColors.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
  }, [normColors]);

  const jsonExport = useMemo(() => {
    const obj = {
      palette: name,
      count: normColors.length,
      colors: normColors.map((hex, i) => {
        const rgb = hexToRgb(hex);
        const hsl = hexToHsl(hex);
        return {
          index: i + 1,
          hex,
          rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex,
          hsl: hsl ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)` : hex,
        };
      }),
    };
    return JSON.stringify(obj, null, 2);
  }, [normColors, name]);

  const handleDownloadSvg = () => {
    const width = normColors.length * 120;
    const height = 180;
    const rects = normColors
      .map(
        (c, i) => `
      <g transform="translate(${i * 120}, 0)">
        <rect width="120" height="120" fill="${c}" />
        <rect y="120" width="120" height="60" fill="#FFFFFF" />
        <text x="60" y="145" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#111827">${c}</text>
        <text x="60" y="165" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B7280">Color ${i + 1}</text>
      </g>`
      )
      .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }</style>
  ${rects}
</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-palette.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement("canvas");
    const swatchWidth = 140;
    const swatchHeight = 140;
    const labelHeight = 60;
    canvas.width = normColors.length * swatchWidth;
    canvas.height = swatchHeight + labelHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    normColors.forEach((hex, i) => {
      const x = i * swatchWidth;
      ctx.fillStyle = hex;
      ctx.fillRect(x, 0, swatchWidth, swatchHeight);

      ctx.fillStyle = "#FAF8F1";
      ctx.fillRect(x, swatchHeight, swatchWidth, labelHeight);

      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(hex, x + swatchWidth / 2, swatchHeight + 26);

      ctx.fillStyle = "#64748B";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Color ${i + 1}`, x + swatchWidth / 2, swatchHeight + 46);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-palette.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-base flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-sans font-bold text-text-main flex items-center gap-2">
            <Download className="w-4 h-4 text-brand-primary" />
            <span>Export Palette & Code</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Export ready-to-deploy color codes for CSS, Tailwind, SCSS, JSON, SVG, or PNG swatch sheet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light bg-surface-base hover:bg-surface-muted text-xs font-bold text-text-main cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" /> SVG
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light bg-surface-base hover:bg-surface-muted text-xs font-bold text-text-main cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" /> PNG
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CSS Variables */}
        <div className="p-3 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">CSS Variables</span>
            <code className="text-xs font-mono text-text-main block mt-1 truncate">--color-1: {normColors[0]};</code>
          </div>
          <CopyValueButton value={cssVariables} onCopy={onCopy} label="Copy CSS" size="sm" variant="chip" />
        </div>

        {/* Tailwind v4 */}
        <div className="p-3 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Tailwind Theme</span>
            <code className="text-xs font-mono text-text-main block mt-1 truncate">@theme &#123; ... &#125;</code>
          </div>
          <CopyValueButton value={tailwindConfig} onCopy={onCopy} label="Copy Tailwind" size="sm" variant="chip" />
        </div>

        {/* SCSS */}
        <div className="p-3 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">SCSS</span>
            <code className="text-xs font-mono text-text-main block mt-1 truncate">$color-1: {normColors[0]};</code>
          </div>
          <CopyValueButton value={scssVariables} onCopy={onCopy} label="Copy SCSS" size="sm" variant="chip" />
        </div>

        {/* JSON */}
        <div className="p-3 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">JSON</span>
            <code className="text-xs font-mono text-text-main block mt-1 truncate">&#123; "colors": [...] &#125;</code>
          </div>
          <CopyValueButton value={jsonExport} onCopy={onCopy} label="Copy JSON" size="sm" variant="chip" />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Backward Compatibility Exports (preserves existing imports)        */
/* ------------------------------------------------------------------ */

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, right }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-6">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-[11px] sm:text-xs font-mono font-bold text-brand-primary uppercase tracking-wider mb-1.5">
          {eyebrow}
        </p>
      )}
      <h2 className="heading-h3 text-text-main font-sans font-bold text-xl sm:text-2xl leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-text-muted max-w-[68ch]">{subtitle}</p>}
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

export const SwatchButton: React.FC<{
  color: string;
  onCopy: (text: string) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  showHex?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
}> = ({ color, onCopy, label, size = "md", showHex = false, className = "", onClick, title }) => {
  return (
    <ColorSwatch
      color={color}
      name={label}
      size={size}
      showValues={showHex}
      isInteractive={true}
      onSelect={onClick}
      onCopy={onCopy}
      className={className}
    />
  );
};

export const PaletteStrip: React.FC<{
  colors: string[];
  onCopy: (text: string) => void;
  className?: string;
  height?: string;
  rounded?: string;
}> = ({ colors, onCopy, className = "", height = "h-16 sm:h-20", rounded = "rounded-xl" }) => {
  return (
    <ColorPalette
      colors={colors}
      onCopy={onCopy}
      height={height}
      className={`${rounded} ${className}`}
    />
  );
};

export const PaletteCard: React.FC<{
  name: string;
  colors: string[];
  use: string;
  slug?: string;
  onClick?: () => void;
  onCopy: (text: string) => void;
}> = ({ name, colors, use, slug, onClick, onCopy }) => {
  const ink = textColorOn(colors[0] ?? "#000000");
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group bg-surface-base border border-border-light rounded-2xl overflow-hidden shadow-premium-sm hover:shadow-premium-md transition-all ${
        onClick ? "cursor-pointer hover:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" : ""
      }`}
    >
      <PaletteStrip colors={colors} onCopy={onCopy} height="h-20 sm:h-24" rounded="rounded-none" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-[15px] font-sans font-bold text-text-main leading-snug">{name}</h3>
          <span
            className="shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: colors[0] ?? "#eee", color: ink }}
          >
            {slug ?? `${colors.length} colors`}
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{use}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {colors.slice(0, 5).map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(normalizeHex(c) ?? c);
              }}
              title={`Copy ${c}`}
              aria-label={`Copy ${c}`}
              className="w-4 h-4 rounded-md border border-black/10 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SwatchScale: React.FC<{ hex: string; onCopy: (text: string) => void }> = ({ hex, onCopy }) => {
  return <ColorScale hex={hex} onCopy={onCopy} />;
};

export const CopyRow: React.FC<{ label: string; value: string; onCopy: (text: string) => void }> = ({
  label,
  value,
  onCopy,
}) => {
  return <ColorValueField label={label} value={value} onCopy={onCopy} />;
};

export const NamedHint: React.FC<{ hex: string }> = ({ hex }) => {
  const named = nearestNamedColor(hex);
  if (!named) return null;
  return (
    <span className="text-[11px] font-mono font-semibold text-text-muted truncate">
      ≈ {named.name}
    </span>
  );
};