/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The homepage's global search. Searches the entire tool registry via the
 * shared search index (single source of truth) and opens the matching tool
 * route. This is one of exactly two homepage search inputs — the other is the
 * category-scoped "Filter …" input inside BrowseStudio. The two are
 * deliberately worded differently so they never read as the same control:
 * this one says "Search all tools" and navigates; the Browse one says
 * "Filter" and only narrows the grid already on screen.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ToolId, ViewState } from "../types";
import { searchTools } from "../searchIndex";
import { ToolIcon } from "../studioIcons";
import { Search, ChevronRight, X, Clock } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";
import { localizedToolName } from "../i18n/slugs";

interface HeroToolSearchProps {
  onChangeView: (view: ViewState) => void;
  locale?: string;
}

const MAX_RESULTS = 8;
const RECENT_SEARCHES_KEY = "gainutility-recent-searches";
const MAX_RECENT_STORED = 8;
const MAX_RECENT_SHOWN = 5;

export const HeroToolSearch: React.FC<HeroToolSearchProps> = ({ onChangeView, locale: localeProp }) => {
  const ctxLocale = useLocale();
  const locale = localeProp || ctxLocale;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listMaxHeight, setListMaxHeight] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT_STORED)
        : [];
    } catch {
      return [];
    }
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchTools(query).slice(0, MAX_RESULTS), [query]);
  const trimmed = query.trim();
  const showResults = open && trimmed.length > 0;
  const showRecents = open && trimmed.length === 0;

  const persistRecentSearches = (next: string[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable — keep the in-memory recent searches.
    }
  };

  const rememberSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecentSearches((prev) => {
      const next = [t, ...prev.filter((v) => v.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT_STORED);
      persistRecentSearches(next);
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    persistRecentSearches([]);
  };

  const select = (id: ToolId) => {
    rememberSearch(trimmed);
    onChangeView({ type: "tool", id });
    setQuery("");
    setOpen(false);
  };

  const applyRecent = (term: string) => {
    setQuery(term);
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  // Close when clicking outside the widget.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Keep the active row within range when results change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted row in view when navigating with the keyboard.
  useEffect(() => {
    if (!showResults && !showRecents) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, showResults, showRecents]);

  // Cap the dropdown height to the space actually left below the input, so it
  // never runs under the mobile keyboard or off the bottom of a short screen.
  // The list itself scrolls internally when capped.
  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (!input) return;
    const measure = () => {
      const vv = window.visualViewport;
      const vh = vv ? vv.height : window.innerHeight;
      const available = vh - input.getBoundingClientRect().bottom - 12;
      setListMaxHeight(Math.max(120, Math.min(360, Math.round(available))));
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    const showingResults = showResults && results.length > 0;
    const showingRecents = showRecents && recentSearches.length > 0;
    if (!showingResults && !showingRecents) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = showingResults ? results.length : MAX_RECENT_SHOWN;
      setActiveIndex((i) => Math.min(i + 1, max - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showingResults) {
        const hit = results[activeIndex];
        if (hit) select(hit.id);
      } else {
        const recent = recentSearches[activeIndex];
        if (recent) applyRecent(recent);
      }
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-search-results"
          aria-autocomplete="list"
          aria-label={t("searchAllTools", locale)}
          placeholder={t("searchAllTools", locale)}
          className="w-full h-[56px] pl-11 pr-10 rounded-lg border border-border-input hover:border-border-default bg-surface-base focus:border-brand-primary text-base text-text-main placeholder:text-text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 transition-colors font-sans"
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 -m-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label={t("clearSearch", locale)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {(showResults || showRecents) && (
        <div
          id="hero-search-results"
          role="listbox"
          aria-label={t("toolResults", locale)}
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 bg-surface-base border border-border-default rounded-xl shadow-premium-lg z-50 max-h-[360px] overflow-y-auto"
          style={listMaxHeight ? { maxHeight: listMaxHeight } : undefined}
        >
          {showResults &&
            (results.length === 0 ? (
              <div className="p-4 text-sm text-text-muted">
                {tf("noToolsMatch", locale, { query: trimmed })}
              </div>
            ) : (
              results.map((r, i) => {
                const selected = i === activeIndex;
                return (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => select(r.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                      selected ? "bg-brand-primary-light/50" : "bg-surface-base"
                    } ${i > 0 ? "border-t border-divider" : ""}`}
                  >
                    <span className="gu-icon-tile w-8 h-8 rounded-md shrink-0">
                      <ToolIcon slug={r.id} size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-text-main truncate">{localizedToolName(r.id, locale, r.name)}</span>
                      <span className="block text-[11px] font-mono text-text-muted truncate">
                        {r.category}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                  </button>
                );
              })
            ))}

          {showRecents &&
            (recentSearches.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">{t("noRecentSearches", locale)}</div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {t("recentSearchesTitle", locale)}
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer"
                  >
                    {t("clearRecentSearches", locale)}
                  </button>
                </div>
                {recentSearches.slice(0, MAX_RECENT_SHOWN).map((term, i) => {
                  const selected = i === activeIndex;
                  return (
                    <button
                      key={`${term}-${i}`}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyRecent(term)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                        selected ? "bg-brand-primary-light/50" : "bg-surface-base"
                      } ${i > 0 ? "border-t border-divider" : ""}`}
                    >
                      <Clock className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-text-main truncate">{term}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                    </button>
                  );
                })}
              </>
            ))}
        </div>
      )}
    </div>
  );
};