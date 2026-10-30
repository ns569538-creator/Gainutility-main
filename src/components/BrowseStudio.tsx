/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ToolId, ViewState } from "../types";
import { toolsRegistry } from "../toolsRegistry";
import { BROWSE_CATEGORIES, BrowseCategoryId, browseToolsForCategory } from "../browseCategories";
import { pathToView } from "../router";
import { ToolCard } from "./ToolCard";
import { Search, X, ChevronRight } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf, browseCategoryLabel } from "../i18n/ui";
import {
  getCurrentEntryId,
  saveCurrentNavigationState,
  isScrollRestoring,
  getSnapshot,
} from "../lib/navigationHistory";

interface BrowseStudioProps {
  onChangeView: (view: ViewState) => void;
  locale?: string;
}

/** Read the category + query from the URL (?cat= / ?q=), validating each. */
const readUrlState = (): { cat: BrowseCategoryId; q: string } => {
  if (typeof window === "undefined") return { cat: "Popular", q: "" };
  const sp = new URLSearchParams(window.location.search);
  const rawCat = sp.get("cat");
  let cat: BrowseCategoryId = "Popular";
  if (rawCat && (BROWSE_CATEGORIES as readonly string[]).includes(rawCat)) {
    cat = rawCat as BrowseCategoryId;
  } else {
    // Check saved history state snapshot as fallback
    const entryId = (window.history.state as { guEntryId?: string } | null)?.guEntryId;
    if (entryId) {
      const snap = getSnapshot(entryId);
      if (snap?.activeCategory && (BROWSE_CATEGORIES as readonly string[]).includes(snap.activeCategory)) {
        cat = snap.activeCategory as BrowseCategoryId;
      }
    }
  }

  const rawQ = sp.get("q");
  let q = rawQ ?? "";
  if (!q) {
    const entryId = (window.history.state as { guEntryId?: string } | null)?.guEntryId;
    if (entryId) {
      const snap = getSnapshot(entryId);
      if (snap?.searchQuery) q = snap.searchQuery;
    }
  }

  return { cat, q };
};

/** Case-insensitive substring match against name, description and category. */
const matchesQuery = (id: ToolId, q: string): boolean => {
  const meta = toolsRegistry[id];
  if (!meta) return false;
  const haystack = `${meta.name} ${meta.desc} ${meta.category}`.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
};

/**
 * The homepage's complete tool directory: category tabs, a category-scoped
 * "Filter …" input, and one registry-derived grid. Filters are local only.
 * Deliberately not a global search — the hero already owns that, and the two
 * inputs are worded so they never look interchangeable.
 */
export const BrowseStudio: React.FC<BrowseStudioProps> = ({ onChangeView, locale: localeProp }) => {
  const ctxLocale = useLocale();
  const locale = localeProp || ctxLocale;
  const [category, setCategory] = useState<BrowseCategoryId>(() => readUrlState().cat);
  const [query, setQuery] = useState(() => readUrlState().q);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  // Restore scroll position when landing on a fresh deep-linked filtered home.
  // Never scroll into view if history scroll restoration is already active!
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isScrollRestoring()) return;
    const entryId = (window.history.state as { guEntryId?: string } | null)?.guEntryId;
    const snap = entryId ? getSnapshot(entryId) : null;
    if (snap && snap.scrollY > 0) return; // Dedicated scroll restoration will handle exact offset

    const sp = new URLSearchParams(window.location.search);
    if (!sp.get("cat") && !sp.get("q")) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const raf = requestAnimationFrame(() =>
      document.getElementById("browse-tools")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep ?cat= / ?q= in sync so back/forward restores the exact filter state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (category === "Popular") {
      params.delete("cat");
    } else {
      params.set("cat", category);
    }
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const search = params.toString();
    const target = search ? `?${search}` : "";
    if (window.location.search !== target) {
      const nextUrl = window.location.pathname + target;
      const entryId = getCurrentEntryId();
      window.history.replaceState({ view: { type: "home" }, guEntryId: entryId }, "", nextUrl);
    }
    saveCurrentNavigationState({ activeCategory: category, searchQuery: trimmed });
  }, [category, query]);

  // Back/forward within the home view: adopt the URL filters again without scroll jumping.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const view = pathToView(window.location.pathname).view;
      if (view.type !== "home") return;
      const { cat, q } = readUrlState();
      setCategory((prev) => (prev === cat ? prev : cat));
      setQuery((prev) => (prev === q ? prev : q));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Show a "more categories" affordance only when the tab row actually overflows
  // horizontally (e.g. small screens), so users know the row scrolls.
  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;
    const update = () =>
      setCanScrollRight(el.scrollWidth > el.clientWidth + 4 && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    update();
    window.addEventListener("resize", update);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      el.removeEventListener("scroll", update);
    };
  }, []);

  const scrollRightOne = () =>
    tabListRef.current?.scrollBy({ left: 180, behavior: "smooth" });

  const categoryTools = useMemo(() => browseToolsForCategory(category), [category]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categoryTools;
    return categoryTools.filter((id) => matchesQuery(id, q));
  }, [categoryTools, query]);

  const selectCategory = (c: BrowseCategoryId) => {
    if (c === category) return;
    setCategory(c);
    setQuery("");
  };

  // Let the hero category mosaic drive this panel: clicking a mosaic tile
  // selects the matching browse category from anywhere on the homepage.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BrowseCategoryId>).detail;
      if (detail && (BROWSE_CATEGORIES as readonly string[]).includes(detail)) {
        setCategory(detail);
        setQuery("");
      }
    };
    window.addEventListener("gainutility:browse-category", handler);
    return () => window.removeEventListener("gainutility:browse-category", handler);
  }, []);

  // When the active tab is off-screen (mobile horizontal scroller), bring it
  // into view. Deliberately skipped on the first (mount) render: on initial
  // load this would call scrollIntoView({ block: "nearest" }) on the window and
  // jump the whole page down toward the hero/browse area, and it would also
  // trigger the header hide-on-scroll listener. We only scroll after an actual
  // category change.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const btn = tabRefs.current[category];
    if (!btn) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    btn.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "nearest", block: "nearest" });
  }, [category]);

  const handleTablistKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = BROWSE_CATEGORIES.indexOf(category);
    let next: number;
    if (e.key === "ArrowRight") next = idx + 1;
    else if (e.key === "ArrowLeft") next = idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = BROWSE_CATEGORIES.length - 1;
    else return;

    e.preventDefault();
    if (next < 0) next = BROWSE_CATEGORIES.length - 1;
    if (next >= BROWSE_CATEGORIES.length) next = 0;
    selectCategory(BROWSE_CATEGORIES[next]);
    tabRefs.current[BROWSE_CATEGORIES[next]]?.focus();
  };

  const q = query.trim();
  const searching = q.length > 0;
  const emptyState = searching && results.length === 0;
  const activeTabId = `browse-tab-${category.toLowerCase()}`;
  // Wording stays "Filter", never "Search": this box only narrows the grid on
  // screen. The hero's global search above says "Search all tools".
  const filterPlaceholder =
    category === "Images"
      ? t("filterImagesTools", locale)
      : tf("filterCategoryTools", locale, { category: browseCategoryLabel(category, locale) });

  return (
    <section id="browse-tools" aria-labelledby="browse-tools-title" className="w-full max-w-6xl mx-auto pt-10 scroll-mt-24">
      <div className="mb-6">
        <h2 id="browse-tools-title" className="display-lg">
          {t("browseTools", locale)}
        </h2>
        <p className="text-sm sm:text-base text-text-muted mt-2">
          {t("browseToolsSubtitle", locale)}
        </p>
      </div>

      {/* Category tabs — filters, not routes */}
      <div className="relative">
        <div
          role="tablist"
          aria-label={t("browseCategoriesAria", locale)}
          onKeyDown={handleTablistKeyDown}
          ref={tabListRef}
          className="browse-tabs-scroller flex items-stretch gap-2 overflow-x-auto scroll-p-4 sm:scroll-p-5 pb-1 pr-10 sm:pr-12"
        >
          {BROWSE_CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <button
                key={c}
                ref={(el) => {
                  tabRefs.current[c] = el;
                }}
                role="tab"
                id={`browse-tab-${c.toLowerCase()}`}
                aria-selected={selected}
                aria-controls="browse-tools-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectCategory(c)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] sm:text-sm font-sans font-semibold border cursor-pointer transition-colors whitespace-nowrap h-10 ${
                  selected
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                    : "bg-surface-base text-text-muted border-border-subtle hover:border-border-hover hover:text-text-main"
                }`}
              >
                {browseCategoryLabel(c, locale)}
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <div className="browse-tabs-fade pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-10" aria-hidden="true" />
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRightOne}
            aria-label={t("scrollMoreCategories", locale)}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-r-lg bg-transparent text-text-muted hover:text-brand-primary transition-colors cursor-pointer h-10 w-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter the visible grid — category-scoped, not a global search */}
      <div className="relative mt-4 max-w-xl">
        <label htmlFor="browse-find-tool" className="sr-only">
          {filterPlaceholder}
        </label>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" aria-hidden="true" />
        <input
          id="browse-find-tool"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={filterPlaceholder}
          aria-label={filterPlaceholder}
          className="w-full h-11 pl-10 pr-9 rounded-lg bg-surface-base border border-border-input hover:border-border-default focus:border-brand-primary text-base text-text-main placeholder:text-text-disabled transition-colors font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20"
        />
        {query.length > 0 && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 -m-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label={t("clearSearch", locale)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div
        role="tabpanel"
        id="browse-tools-panel"
        aria-labelledby={activeTabId}
        className="mt-6"
      >
        {category === "Images" && !searching && (
          <div className="mb-4 p-3 sm:p-4 rounded-xl bg-surface-base border border-brand-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-xs sm:text-sm text-text-main">
                Viewing <strong>{categoryTools.length} Image Tools</strong>. Processed locally in your browser.
              </p>
            </div>
            <a
              href="/image"
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "seo-page", id: "image" });
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline cursor-pointer shrink-0"
            >
              Open dedicated Image Tools Hub
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        {searching && (
          <p className="text-xs sm:text-[13px] text-text-muted mb-3" aria-live="polite">
            {results.length === 1
              ? tf("oneMatch", locale, { q, cat: browseCategoryLabel(category, locale) })
              : tf("manyMatch", locale, { count: String(results.length), q, cat: browseCategoryLabel(category, locale) })}
          </p>
        )}

        {emptyState ? (
          <div className="p-6 text-center bg-surface-base border border-border-subtle rounded-xl flex items-center justify-center gap-3 flex-wrap">
            <span className="text-sm text-text-muted">
              {tf("noMatchInCategory", locale, { q, cat: browseCategoryLabel(category, locale) })}
            </span>
            <button
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {t("clearFilter", locale)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch" data-browse-grid>
            {results.map((toolId) => (
              <ToolCard
                key={toolId}
                toolId={toolId}
                onChangeView={onChangeView}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};