/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Prominent article search bar for GainUtility Blog.
 * Accessible, keyboard-interactive, full-width on mobile, with instant clear action.
 */

import React, { useRef, useEffect } from "react";
import { Search, X, Command } from "lucide-react";
import { pageText } from "../../i18n/pages";

interface BlogSearchProps {
  query: string;
  onChangeQuery: (q: string) => void;
  locale: string;
  totalMatches?: number;
  isFiltered?: boolean;
}

export const BlogSearch: React.FC<BlogSearchProps> = ({
  query,
  onChangeQuery,
  locale,
  totalMatches,
  isFiltered = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener to focus the blog search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        // Prevent default browser URL search bar behavior if focused on page
        if (inputRef.current && document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current.focus();
          inputRef.current.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-2xl relative">
      <label htmlFor="blog-search-input" className="sr-only">
        {pageText("blog.searchLabel", locale) || "Search articles"}
      </label>
      <div className="relative flex items-center group">
        <Search
          className="absolute left-4 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="blog-search-input"
          type="search"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={
            pageText("blog.searchPlaceholder", locale) ||
            "Search articles… e.g. PDF, compress, webp, sitemap"
          }
          autoComplete="off"
          className="w-full h-12 sm:h-13 pl-12 pr-24 rounded-2xl border border-border-subtle bg-surface-base text-sm sm:text-base text-text-main placeholder:text-text-muted focus:border-border-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all shadow-xs"
        />
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {query.trim().length > 0 ? (
            <button
              type="button"
              onClick={() => {
                onChangeQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label={pageText("blog.clearSearch", locale) || "Clear search"}
              title={pageText("blog.clearSearch", locale) || "Clear search"}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted border border-border-subtle text-[11px] font-mono text-text-muted font-medium select-none pointer-events-none shadow-2xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>
      {query.trim().length > 0 && typeof totalMatches === "number" && (
        <p className="mt-2 text-xs font-mono text-text-muted pl-1">
          {totalMatches === 1
            ? `1 article matches "${query}"`
            : `${totalMatches} articles match "${query}"`}
        </p>
      )}
    </div>
  );
};
