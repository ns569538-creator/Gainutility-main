/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Empty state component for GainUtility Blog search.
 * Rendered when zero articles match active query or filter.
 */

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { pageText } from "../../i18n/pages";

interface EmptyBlogSearchProps {
  query: string;
  onReset: () => void;
  locale: string;
}

export const EmptyBlogSearch: React.FC<EmptyBlogSearchProps> = ({
  query,
  onReset,
  locale,
}) => {
  return (
    <div className="w-full py-12 sm:py-16 px-4 rounded-2xl border border-dashed border-border-light bg-surface-muted/30 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-base border border-border-light flex items-center justify-center text-text-muted shadow-xs">
        <Search className="w-7 h-7 text-brand-primary/80" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-sans font-bold text-lg sm:text-xl text-text-main">
          {pageText("blog.noResults", locale) || "No articles found"}
        </h3>
        <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
          {query
            ? `No articles match "${query}". Try searching with different keywords or reset your filters.`
            : pageText("blog.noResultsDesc", locale) ||
              "No articles found in this category. Try selecting another topic."}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 min-h-[44px] px-5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-xs sm:text-sm font-sans font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs gu-focus"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{pageText("blog.clearSearch", locale) || "Reset Search & Filters"}</span>
      </button>
    </div>
  );
};
