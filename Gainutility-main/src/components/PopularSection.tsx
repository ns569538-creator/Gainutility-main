/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import type { ToolId, ViewState } from "../types";
import { POPULAR_TOOLS_CONFIG } from "../data/popularTools";
import { toolsRegistry } from "../toolsRegistry";
import { ToolVisual } from "../studioIcons";
import { toolCanonicalUrl } from "../site";
import { useLocale } from "../i18n/LocaleContext";
import { localizedToolName } from "../i18n/slugs";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { browseCategoryLabel } from "../i18n/ui";
import {
  getCurrentEntryId,
  saveCurrentNavigationState,
  getSnapshot,
} from "../lib/navigationHistory";

type PopularCategory = "Popular" | "PDF" | "Images" | "Creator" | "Design" | "Developer" | "Converters";

const POPULAR_CATEGORIES: PopularCategory[] = [
  "Popular",
  "PDF",
  "Images",
  "Creator",
  "Design",
  "Developer",
  "Converters",
];

interface PopularSectionProps {
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
  locale?: string;
}

const readPopularUrlState = (): { cat: PopularCategory } => {
  if (typeof window === "undefined") return { cat: "Popular" };
  const sp = new URLSearchParams(window.location.search);
  const rawCat = sp.get("cat");
  let cat: PopularCategory = "Popular";
  if (rawCat && (POPULAR_CATEGORIES as readonly string[]).includes(rawCat)) {
    cat = rawCat as PopularCategory;
  } else {
    const entryId = (window.history.state as { guEntryId?: string } | null)?.guEntryId;
    if (entryId) {
      const snap = getSnapshot(entryId);
      if (snap?.popularCategory && (POPULAR_CATEGORIES as readonly string[]).includes(snap.popularCategory)) {
        cat = snap.popularCategory as PopularCategory;
      }
    }
  }
  return { cat };
};

export const PopularSection: React.FC<PopularSectionProps> = ({ onChangeView, locale: localeProp }) => {
  const ctxLocale = useLocale();
  const locale = localeProp || ctxLocale;
  const [category, setCategory] = useState<PopularCategory>(() => readPopularUrlState().cat);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const handleToolClick = (toolId: ToolId, e: React.MouseEvent) => {
    e.preventDefault();
    onChangeView({ type: "tool", id: toolId }, { clickedElementId: `popular-card-${toolId}` });
  };

  const handleBrowseAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const browseEl = document.getElementById("browse-tools");
    if (browseEl) {
      browseEl.scrollIntoView({ behavior: "smooth" });
    } else {
      onChangeView({ type: "tools-directory" });
    }
  };

  const selectCategory = (c: PopularCategory) => {
    if (c === category) return;
    setCategory(c);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (category !== "Popular") {
      params.set("cat", category);
    } else {
      params.delete("cat");
    }
    const search = params.toString();
    const target = search ? `?${search}` : "";
    if (window.location.search !== target) {
      const nextUrl = window.location.pathname + target;
      const entryId = getCurrentEntryId();
      window.history.replaceState({ view: { type: "home" }, guEntryId: entryId }, "", nextUrl);
    }
    saveCurrentNavigationState({ popularCategory: category });
  }, [category]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const view = (window as any).__gainutility_pathToView?.(window.location.pathname)?.view;
      if (view?.type !== "home") return;
      const { cat } = readPopularUrlState();
      setCategory((prev) => (prev === cat ? prev : cat));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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

  const filteredTools = POPULAR_TOOLS_CONFIG.filter((tool) => {
    if (category === "Popular") return true;
    return tool.categoryLabel === category;
  });

  const activeTabId = `popular-tab-${category.toLowerCase()}`;

  return (
    <section
      id="popular-tools"
      className="w-full max-w-6xl mx-auto pt-6 pb-2 scroll-mt-20"
      aria-labelledby="popular-tools-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Start with these</span>
          </div>
          <h2
            id="popular-tools-title"
            className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-text-main"
          >
            Popular tools
          </h2>
          <p className="text-sm sm:text-base text-text-muted mt-1.5 max-w-2xl leading-relaxed">
            Fast, high-intent utilities you can use immediately. Every tool processes your files locally on your device with no uploads or account required.
          </p>
        </div>

        <a
          href="#browse-tools"
          onClick={handleBrowseAllClick}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline underline-offset-4 shrink-0 transition-colors cursor-pointer gu-focus"
        >
          <span>View all tools</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>

      {/* Category filter tabs */}
      <div className="relative mb-6">
        <div
          role="tablist"
          aria-label="Popular tool categories"
          ref={tabListRef}
          className="browse-tabs-scroller flex items-stretch gap-2 overflow-x-auto scroll-p-4 sm:scroll-p-5 pb-1 pr-10 sm:pr-12"
        >
          {POPULAR_CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <button
                key={c}
                ref={(el) => {
                  tabRefs.current[c] = el;
                }}
                role="tab"
                id={`popular-tab-${c.toLowerCase()}`}
                aria-selected={selected}
                aria-controls="popular-tools-panel"
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
            aria-label="Scroll to more categories"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-r-lg bg-transparent text-text-muted hover:text-brand-primary transition-colors cursor-pointer h-10 w-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div
        role="tabpanel"
        id="popular-tools-panel"
        aria-labelledby={activeTabId}
        className="mt-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          {filteredTools.map((item) => {
            const registryItem = toolsRegistry[item.id];
            if (!registryItem) return null;

            const displayName = localizedToolName(item.id, locale, item.name || registryItem.name);
            const displayDesc = item.desc || registryItem.desc;

            return (
              <a
                key={item.id}
                id={`popular-card-${item.id}`}
                data-tool-id={item.id}
                href={toolCanonicalUrl(item.id)}
                onClick={(e) => handleToolClick(item.id, e)}
                className="popular-tool-card group gu-utility-card relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-surface-base border border-border-subtle hover:border-brand-primary/60 hover:shadow-premium-md transition-all duration-200 cursor-pointer text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <span className="gu-visual-tile relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-border-subtle/80 bg-background/80 transition-colors duration-200 group-hover:border-brand-primary/40 group-hover:bg-brand-primary-light/30">
                      <ToolVisual slug={item.id} size={48} />
                    </span>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium font-mono uppercase tracking-wider bg-surface-muted text-text-sub border border-border-subtle/60 shrink-0">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-[15px] sm:text-base font-sans font-bold text-text-main group-hover:text-brand-primary transition-colors leading-snug mb-1.5">
                    {displayName}
                  </h3>

                  <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2">
                    {displayDesc}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-border-subtle/60">
                  <span className="text-[11px] font-mono text-text-muted/80 truncate">
                    {item.badge || "Local processing"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Open tool</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};