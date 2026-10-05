/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Accessible Custom Select Component.
 * Supports dark mode, light mode, keyboard navigation, focus management,
 * and seamless GainUtility styling.
 */

import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

export interface CustomSelectProps<T extends string | number = string | number> {
  id?: string;
  label?: string;
  value: T;
  options: CustomSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function CustomSelect<T extends string | number = string | number>({
  id,
  label,
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  disabled = false,
  size = "md",
}: CustomSelectProps<T>) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const [highlightedIndex, setHighlightedIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keep highlighted index in sync when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const selectOption = useCallback(
    (optValue: T) => {
      onChange(optValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (options[highlightedIndex]) {
          selectOption(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={`${selectId}-trigger`}
          className="text-[13px] font-medium text-text-sub"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={`${selectId}-trigger`}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? `${selectId}-label ${selectId}-trigger` : undefined}
          aria-label={!label ? ariaLabel || "Select option" : undefined}
          aria-activedescendant={
            isOpen && options[highlightedIndex]
              ? `${selectId}-opt-${highlightedIndex}`
              : undefined
          }
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`gu-focus w-full flex items-center justify-between gap-2.5 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted hover:border-border-default px-3 py-2 text-left text-text-main transition-colors cursor-pointer select-none ${
            size === "sm" ? "min-h-[40px] text-[13px]" : "min-h-[44px] text-[14px]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${
            isOpen ? "border-brand-primary ring-2 ring-brand-primary/20" : ""
          }`}
        >
          <span className="truncate font-medium">{selectedOption?.label ?? ""}</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-200 ${
              isOpen ? "rotate-180 text-brand-primary" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={label ? `${selectId}-label` : undefined}
            aria-label={!label ? ariaLabel || "Options" : undefined}
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border-default bg-surface-elevated py-1 shadow-premium-lg outline-none"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={String(opt.value)}
                  id={`${selectId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(opt.value)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-[13px] sm:text-[14px] cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-brand-primary-light/20 text-brand-primary font-semibold"
                      : isHighlighted
                        ? "bg-surface-hover text-text-main"
                        : "text-text-sub hover:text-text-main"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0 text-brand-primary" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
