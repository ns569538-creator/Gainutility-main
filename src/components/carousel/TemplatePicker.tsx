/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Template picker for the LinkedIn Carousel Maker.
 *
 * Renders REAL previews from the actual template background configuration
 * (same helpers the canvas stage and the export rasterizer use), so what the
 * user picks is exactly what ends up on the finished slide. Available in two
 * modes:
 *   - inline grid (embedded empty-state picker)
 *   - modal picker (openable from the workspace header)
 */

import React, { useEffect, useMemo, useState } from "react";
import { X, LayoutTemplate, Check, Sparkles } from "lucide-react";
import {
  TEMPLATE_CATEGORIES,
  templatesForCategory,
  BLANK_TEMPLATE,
  getSlideBackgroundCss,
  TemplateDef,
  TemplateCategory,
} from "./templates";
import { slidePatternDataURI } from "./patternUtil";
import { CAROUSEL_PRESETS, AspectPreset } from "./types";

/** Shared mini slide preview used by both inline grid and modal. */
export const TemplateCard: React.FC<{
  template: TemplateDef;
  selected?: boolean;
  onSelect: (template: TemplateDef) => void;
  aspect?: AspectPreset;
}> = ({ template, selected, onSelect, aspect = "portrait" }) => {
  const preset = CAROUSEL_PRESETS[aspect];
  const ratio = preset.height / preset.width; // >1 for portrait
  const cssBg = getSlideBackgroundCss(template);
  const patternUri = template.pattern
    ? slidePatternDataURI(template, 360, Math.round(360 * ratio))
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={`group text-left rounded-2xl border transition-all overflow-hidden bg-surface-elevated cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
        selected
          ? "border-brand-primary ring-2 ring-brand-primary/40 shadow-premium-md"
          : "border-border-light dark:border-border-medium hover:border-brand-primary/50 hover:shadow-premium-sm"
      }`}
    >
      {/* Mini slide preview (real template config) */}
      <div
        className="relative w-full"
        style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
      >
        <div className="absolute inset-0" style={{ background: cssBg }} />
        {patternUri && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${patternUri}")`,
              backgroundSize: "100% 100%",
              opacity: template.pattern?.opacity ?? 0.9,
            }}
          />
        )}
        {/* Accent bar & headline placeholders */}
        <div
          className="absolute rounded-full"
          style={{
            width: "22%",
            height: "1.2%",
            left: "39%",
            top: "44%",
            background: template.accent,
          }}
        />
        <div
          className="absolute rounded-sm left-1/2 -translate-x-1/2"
          style={{
            width: "70%",
            height: "7%",
            top: "50%",
            background: template.textColor,
            opacity: 0.85,
          }}
        />
        <div
          className="absolute right-2 top-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: template.accent }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        {selected && (
          <div
            className="absolute right-1.5 bottom-1.5 w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md"
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Template info */}
      <div className="px-3 py-2 space-y-0.5 border-t border-border-light dark:border-border-medium">
        <span className="block font-sans font-bold text-xs text-text-main">
          {template.name}
        </span>
        <span className="block text-[10px] font-mono text-text-muted truncate">
          {template.blurb}
        </span>
      </div>
    </button>
  );
};

/** Category chip row. */
export const TemplateCategoryChips: React.FC<{
  value: TemplateCategory;
  onChange: (c: TemplateCategory) => void;
}> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {TEMPLATE_CATEGORIES.map((cat) => (
      <button
        key={cat}
        type="button"
        onClick={() => onChange(cat)}
        className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold transition-all cursor-pointer border ${
          value === cat
            ? "bg-brand-primary text-white border-brand-primary shadow-premium-sm"
            : "bg-surface-elevated text-text-muted border-border-light dark:border-border-medium hover:border-brand-primary/50 hover:text-text-main"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

/** Slide count stepper (used when creating fresh slides from a template). */
export const SlideCountStepper: React.FC<{
  value: number;
  onChange: (n: number) => void;
  max?: number;
}> = ({ value, onChange, max = 6 }) => {
  const clamp = (n: number) => Math.max(1, Math.min(max, n));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono text-text-muted whitespace-nowrap">
        Slides:
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface-hover border border-border-light flex items-center justify-center text-text-main font-bold cursor-pointer"
          aria-label="Fewer slides"
        >
          −
        </button>
        <span className="w-8 text-center font-sans font-bold text-sm text-text-main tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface-hover border border-border-light flex items-center justify-center text-text-main font-bold cursor-pointer"
          aria-label="More slides"
        >
          +
        </button>
      </div>
    </div>
  );
};

interface TemplatePickerCoreProps {
  onApply: (template: TemplateDef, slideCount: number) => void;
  onUseBlank: () => void;
  initialCount?: number;
  aspect?: AspectPreset;
  selectedId?: string | null;
  /** "create" (default): apply makes fresh slides, count stepper shown. */
  showCount?: boolean;
  applyLabel?: string;
  blankLabel?: string;
}

/**
 * Shared picker body (category chips + grid + apply bar).
 * Uses real template config for every preview.
 */
export const TemplatePickerCore: React.FC<TemplatePickerCoreProps> = ({
  onApply,
  onUseBlank,
  initialCount = 3,
  aspect = "portrait",
  selectedId,
  showCount = true,
  applyLabel = "Apply Template",
  blankLabel = "Use Blank Canvas",
}) => {
  const [category, setCategory] = useState<TemplateCategory>("All");
  const [selected, setSelected] = useState<TemplateDef | null>(
    () => (selectedId ? [...templatesForCategory("All")].find((t) => t.id === selectedId) ?? null : null)
  );
  const [count, setCount] = useState(Math.min(6, Math.max(1, initialCount)));

  const list = useMemo(() => templatesForCategory(category), [category]);

  useEffect(() => {
    // Keep the selection visible when switching category.
    if (selected && !list.some((t) => t.id === selected.id)) {
      setSelected(null);
    }
  }, [list, selected]);

  const effective = selected ?? BLANK_TEMPLATE;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Category chips */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
        <LayoutTemplate className="w-4 h-4 text-brand-primary shrink-0" />
        <TemplateCategoryChips value={category} onChange={setCategory} />
      </div>

      {/* Template grid (scrollable on mobile / modal) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 grid gap-3 items-start pb-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            aspect={aspect}
            selected={selected?.id === t.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* Sticky apply bar */}
      <div className="sticky bottom-0 z-10 px-4 py-3 bg-surface-base/95 dark:bg-surface-elevated/95 backdrop-blur-md border-t border-border-light dark:border-border-medium flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {showCount && <SlideCountStepper value={count} onChange={setCount} />}
          <span className="hidden md:inline text-[11px] font-mono text-text-muted">
            {effective.id === BLANK_TEMPLATE.id
              ? "Clean empty frames"
              : `“${effective.name}” background template`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUseBlank}
            className="px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border-light text-text-main text-xs font-sans font-semibold transition-all cursor-pointer"
          >
            {blankLabel}
          </button>
          <button
            type="button"
            onClick={() => onApply(effective, count)}
            className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-sans font-bold shadow-premium-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{applyLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface TemplatePickerModalProps extends TemplatePickerCoreProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

/** Full-screen modal template picker for the workspace view. */
export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  open,
  onClose,
  onApply,
  onUseBlank,
  initialCount,
  aspect = "portrait",
  title = "Choose a starter template",
  showCount,
  applyLabel,
  blankLabel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-all"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal window (scrollable body area) */}
      <div className="relative z-10 w-full max-w-5xl h-[90vh] max-h-[780px] bg-surface-elevated dark:bg-surface-elevated border border-border-medium/80 dark:border-border-medium rounded-3xl shadow-premium-lg shadow-[0_0_60px_-10px_rgba(117,171,82,0.2)] flex flex-col overflow-hidden text-text-main select-none">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-border-light dark:border-border-medium flex items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <LayoutTemplate className="w-4 h-4 text-brand-primary" />
              <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wider">
                Templates
              </span>
            </div>
            <h2 className="font-sans font-black text-lg sm:text-xl text-text-main tracking-tight">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
              Editable frames, not finished posts — swap backgrounds or clear
              them freely.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close template picker"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body with sticky bottom bar */}
        <div className="flex-1 min-h-0 flex flex-col">
          <TemplatePickerCore
            onApply={onApply}
            onUseBlank={onUseBlank}
            initialCount={initialCount}
            aspect={aspect}
            showCount={showCount}
            applyLabel={applyLabel}
            blankLabel={blankLabel}
          />
        </div>
      </div>
    </div>
  );
};

/** Inline grid variant for the empty state (no modal chrome). */
export const InlineTemplatePicker: React.FC<TemplatePickerCoreProps> = (props) => {
  return (
    <div className="w-full rounded-2xl border border-border-light dark:border-border-medium bg-surface-elevated overflow-hidden">
      <TemplatePickerCore {...props} />
    </div>
  );
};