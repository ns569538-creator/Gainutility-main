/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared, quiet tool-page primitives.
 *
 * Design intent: tool pages should be functional workspaces, not landing
 * pages. These primitives keep secondary information quiet so the actual
 * input → result → action flow visually dominates.
 */

import React from "react";
import { Check } from "lucide-react";
import { Button } from "./Common";

/// --- SECTION HEADER ------------------------------------------------
/**
 * A quiet section heading + optional one-line description. Used to label a
 * step in the workflow ("Choose a format", "Content", "Preview"). Not a card.
 */
interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className = "",
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <h2 className="font-sans font-semibold text-text-main text-base md:text-lg tracking-tight">
      {title}
    </h2>
    {description && (
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    )}
  </div>
);

/// --- FIELD ----------------------------------------------------------
/**
 * A labeled form control wrapper with a compact label. Use instead of the
 * heavier marketing `Input`/`TextArea` when the tool needs tighter rhythm.
 */
interface FieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  children,
  className = "",
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-semibold text-text-sub"
    >
      {label}
    </label>
    {children}
  </div>
);

/// --- SEGMENTED SELECTOR ---------------------------------------------
/**
 * A compact grid of mutually exclusive options (e.g. QR payload type).
 * Reads as a selection control, not a row of CTAs. Each option shows an
 * icon + name and a clear selected state.
 */
interface SegmentedOption<T extends string> {
  id: T;
  name: string;
  icon?: React.ReactNode;
}

interface SegmentedSelectorProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  columns?: 2 | 4;
  className?: string;
}

export function SegmentedSelector<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
  className = "",
}: SegmentedSelectorProps<T>) {
  return (
    <div
      role="radiogroup"
      className={`grid gap-1.5 sm:gap-2 ${
        columns === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-2"
      } ${className}`}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
className={`relative min-h-[44px] sm:min-h-[40px] px-3 py-2 rounded-[10px] border text-left font-sans font-medium text-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
              selected
                ? "bg-brand-primary text-[#FAF8F1] border-brand-primary"
                : "bg-surface-base text-text-sub border-border-subtle hover:border-border-hover hover:bg-surface-muted/40"
          }`}
          >
            <span className="flex items-center gap-1.5">
              {opt.icon && (
                <span className="flex-shrink-0 [&_svg]:w-4 [&_svg]:h-4">
                  {opt.icon}
                </span>
              )}
              <span className="truncate">{opt.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/// --- OPTION SELECTOR --------------------------------------------------
/**
 * Compact selectable option with a short truthful explanation. Used for
 * optional style/preset choices. Quiet — no CTA styling, clear checkmark.
 */
interface Option {
  id: string;
  name: string;
  desc: string;
}

interface OptionSelectorProps {
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  value,
  onChange,
  columns = 3,
  className = "",
}) => (
  <div
    role="radiogroup"
    className={`grid gap-2 ${
      columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1"
    } ${className}`}
  >
    {options.map((opt) => {
      const selected = opt.id === value;
      return (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(opt.id)}
          className={`flex items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
            selected
              ? "border-brand-primary bg-brand-primary-light/20"
              : "border-border-subtle bg-surface-base hover:border-border-hover hover:bg-surface-muted/40"
          }`}
        >
          <span
            className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
              selected
                ? "border-brand-primary bg-brand-primary text-[#FAF8F1]"
                : "border-border-default"
            }`}
          >
            {selected && <Check className="w-3 h-3" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-text-main leading-snug">
              {opt.name}
            </span>
            <span className="block text-xs text-text-muted mt-0.5 leading-snug">
              {opt.desc}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

/// --- INFO STRIP -------------------------------------------------------
/**
 * A quiet, non-interactive metadata table. Renders like an information strip,
 * never like a button. No pointer cursor, no hover lift, no shadows.
 */
interface InfoRow {
  label: string;
  value: string;
  mono?: boolean;
}

interface InfoStripProps {
  title?: string;
  rows: InfoRow[];
  className?: string;
}

export const InfoStrip: React.FC<InfoStripProps> = ({
  title,
  rows,
  className = "",
}) => (
  <div
    className={`rounded-xl border border-border-subtle bg-surface-muted/20 overflow-hidden ${className}`}
    aria-label={title}
  >
    {title && (
      <div className="px-4 py-2 bg-surface-muted/30">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </span>
      </div>
    )}
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-0">
      {rows.map((row, i) => (
        <div key={i} className="px-4 py-2.5">
          <dt className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            {row.label}
          </dt>
          <dd
            className={`text-sm font-medium text-text-main mt-0.5 ${
              row.mono ? "font-mono" : ""
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

/// --- ACTION GROUP ------------------------------------------------------
/**
 * Explicit export/action controls. Primary action first, then secondary
 * actions, then quiet tertiary actions. On mobile they collapse to a full
 * width stacked group so buttons stay tappable.
 * 
 * Uses the unified Button component for consistent styling.
 */
interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  variant?: "primary" | "outline" | "secondary" | "ghost";
}

interface ActionGroupProps {
  items: ActionItem[];
  tertiary?: ActionItem[];
  className?: string;
  stackedMobile?: boolean;
}

export const ActionGroup: React.FC<ActionGroupProps> = ({
  items,
  tertiary,
  className = "",
  stackedMobile = true,
}) => (
  <div className={`flex flex-col gap-2.5 ${className}`}>
    <div className={`grid grid-cols-1 ${stackedMobile ? "sm:grid-cols-2" : ""} gap-2.5`}>
      {items.map((item, i) => (
        <Button
          key={i}
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          variant={item.primary ? "primary" : (item.variant ?? "outline")}
          size="md"
          leftIcon={item.icon}
          className="min-h-[46px] justify-center"
        >
          {item.label}
        </Button>
      ))}
    </div>
    {tertiary && tertiary.length > 0 && (
      <div className="flex flex-wrap items-center gap-1.5">
        {tertiary.map((item, i) => (
          <Button
            key={i}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            variant={item.variant ?? "ghost"}
            size="sm"
            leftIcon={item.icon}
            className="min-h-[40px]"
          >
            {item.label}
          </Button>
        ))}
      </div>
    )}
  </div>
);
