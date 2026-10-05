/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Category filter pills for GainUtility Blog.
 * Fully responsive: horizontal scroll on mobile, flex wrap on tablet/desktop.
 * Touch-friendly (>=44px touch targets), accessible, with dynamic article counts.
 */

import React from "react";
import { BlogCategory, ACTIVE_BLOG_CATEGORIES } from "../../blog/blogData";
import { blogCategoryLabel, pageText } from "../../i18n/pages";

export type BlogFilter = "All" | BlogCategory;

interface CategoryFilterProps {
  activeFilter: BlogFilter;
  onSelectFilter: (filter: BlogFilter) => void;
  categoryCounts: Record<BlogFilter, number>;
  locale: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeFilter,
  onSelectFilter,
  categoryCounts,
  locale,
}) => {
  const allLabel = pageText("blog.allLabel", locale) || "All Articles";

  return (
    <div className="w-full">
      <nav
        aria-label={pageText("blog.topicsTitle", locale) || "Browse by topic"}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
      >
        {/* All Articles Pill */}
        <button
          type="button"
          onClick={() => onSelectFilter("All")}
          aria-pressed={activeFilter === "All"}
          className={`min-h-[44px] px-4 sm:px-4.5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 border gu-focus ${
            activeFilter === "All"
              ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm"
              : "bg-surface-base text-text-sub border-border-subtle hover:border-border-hover hover:text-text-main hover:bg-surface-muted/50"
          }`}
        >
          <span>{allLabel}</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              activeFilter === "All"
                ? "bg-white/20 text-[#FAF8F1]"
                : "bg-surface-muted text-text-muted"
            }`}
          >
            {categoryCounts.All}
          </span>
        </button>

        {/* Category Pills */}
        {ACTIVE_BLOG_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectFilter(cat)}
              aria-pressed={isActive}
              className={`min-h-[44px] px-4 sm:px-4.5 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 border gu-focus ${
                isActive
                  ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm"
                  : "bg-surface-base text-text-sub border-border-subtle hover:border-border-hover hover:text-text-main hover:bg-surface-muted/50"
              }`}
            >
              <span>{blogCategoryLabel(cat, locale)}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive
                    ? "bg-white/20 text-[#FAF8F1]"
                    : "bg-surface-muted text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
