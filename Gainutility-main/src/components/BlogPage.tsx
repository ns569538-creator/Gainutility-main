/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Redesigned GainUtility Blog Index Page.
 *
 * Production-ready, editorial SaaS publication design:
 *   1. Compact, high-readability header with breadcrumbs.
 *   2. Prominent, accessible article search (Ctrl/Cmd+K support).
 *   3. Category filter pills with dynamic counts & mobile horizontal scroll.
 *   4. Single dominant editorial Featured Article hero card.
 *   5. Responsive article grid (1 col mobile, 2 col tablet, 3 col desktop).
 *   6. Clean "Load More" pagination with progress counter.
 *   7. Zero-results empty state with instant reset.
 *   8. Internal linking strip to the tools referenced in the guides.
 *
 * Fully integrated with GainUtility's existing i18n architecture and dark mode.
 */

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { ViewState } from "../types";
import { BlogArticle, BlogCategory, ACTIVE_BLOG_CATEGORIES, BLOG_ARTICLES, articleLocalized } from "../blog/blogData";
import { byDateDesc } from "../blog/blogUi";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { BlogHeader } from "./blog/BlogHeader";
import { BlogSearch } from "./blog/BlogSearch";
import { CategoryFilter, BlogFilter } from "./blog/CategoryFilter";
import { FeaturedArticleCard } from "./blog/FeaturedArticleCard";
import { ArticleCard } from "./blog/ArticleCard";
import { EmptyBlogSearch } from "./blog/EmptyBlogSearch";
import { BlogToolsStrip } from "./blog/BlogToolsStrip";
import { Layers, ChevronDown } from "lucide-react";

interface BlogPageProps {
  onChangeView: (view: ViewState) => void;
}

// Every published article is rendered up front: the index is the only crawlable
// entry point for the guides, so nothing may sit behind the Load More button.
// Filtered/search views still reset to this full list.
const INITIAL_PAGE_SIZE = BLOG_ARTICLES.length;
const PAGE_INCREMENT = 6;

export const BlogPage: React.FC<BlogPageProps> = ({ onChangeView }) => {
  const locale = useLocale();
  const [filter, setFilter] = useState<BlogFilter>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // Reset pagination when category filter or query changes
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [filter, query]);

  // Localize every article using the current active locale
  const resolve = useCallback(
    (a: BlogArticle) => articleLocalized(a, locale),
    [locale]
  );

  // Every article in the registry, localized, ordered newest first
  const allArticles = useMemo(() => {
    return BLOG_ARTICLES.map(resolve).sort(byDateDesc);
  }, [resolve]);

  // Article count breakdown per category
  const categoryCounts = useMemo(() => {
    const counts: Record<BlogFilter, number> = {
      All: allArticles.length,
      PDF: 0,
      Images: 0,
      Developer: 0,
      SEO: 0,
      Productivity: 0,
    };
    allArticles.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });
    return counts;
  }, [allArticles]);

  // Search & Filter pipeline
  const filteredArticles = useMemo(() => {
    let result = allArticles;

    // Apply category filter
    if (filter !== "All") {
      result = result.filter((a) => a.category === filter);
    }

    // Apply query search (matches title, description, category, and tags)
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(q);
        const descMatch = a.description.toLowerCase().includes(q);
        const catMatch = a.category.toLowerCase().includes(q);
        const tagsMatch = a.tags.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || catMatch || tagsMatch;
      });
    }

    return result;
  }, [allArticles, filter, query]);

  // Single featured guide: top article in current filtered/search view
  const featuredArticle = useMemo(() => {
    return filteredArticles.length > 0 ? filteredArticles[0] : null;
  }, [filteredArticles]);

  // The rest of the articles go to the standard feed grid
  const feedArticles = useMemo(() => {
    return filteredArticles.length > 1 ? filteredArticles.slice(1) : [];
  }, [filteredArticles]);

  // Currently displayed slice for pagination
  const displayedFeed = useMemo(() => {
    return feedArticles.slice(0, visibleCount);
  }, [feedArticles, visibleCount]);

  const hasMore = visibleCount < feedArticles.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_INCREMENT);
  };

  const handleResetSearchAndFilters = () => {
    setQuery("");
    setFilter("All");
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 sm:gap-10 pb-16">
      {/* 1. COMPACT EDITORIAL HEADER */}
      <BlogHeader locale={locale} />

      {/* 2. SEARCH & DISCOVERY BAR */}
      <div className="w-full flex flex-col gap-5 sm:gap-6">
        <BlogSearch
          query={query}
          onChangeQuery={setQuery}
          locale={locale}
          totalMatches={filteredArticles.length}
          isFiltered={filter !== "All" || query.trim().length > 0}
        />

        {/* 3. CATEGORY FILTER PILLS */}
        <CategoryFilter
          activeFilter={filter}
          onSelectFilter={setFilter}
          categoryCounts={categoryCounts}
          locale={locale}
        />
      </div>

      {/* 4. FEATURED ARTICLE HERO */}
      {featuredArticle && (
        <section aria-labelledby="featured-heading" className="w-full">
          <h2 id="featured-heading" className="sr-only">
            {pageText("blog.featuredBadge", locale) || "Featured Guide"}
          </h2>
          <FeaturedArticleCard
            article={featuredArticle}
            onChangeView={onChangeView}
            locale={locale}
          />
        </section>
      )}

      {/* 5. ARTICLE FEED */}
      {displayedFeed.length > 0 && (
        <section aria-labelledby="feed-heading" className="w-full space-y-6 sm:space-y-7">
          <div className="flex items-center justify-between border-b border-border-light/80 pb-3">
            <h2 id="feed-heading" className="font-sans font-bold text-xl sm:text-2xl text-text-main tracking-tight">
              {filter === "All"
                ? pageText("blog.feedTitle", locale) || "Latest Practical Guides"
                : `${filter} Guides`}
            </h2>
            <span className="text-xs font-mono text-text-muted">
              {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* Grid layout: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {displayedFeed.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onChangeView={onChangeView}
                locale={locale}
              />
            ))}
          </div>

          {/* 6. LOAD MORE / PAGINATION */}
          {hasMore && (
            <div className="pt-6 sm:pt-8 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-mono text-text-muted">
                Showing {displayedFeed.length + 1} of {filteredArticles.length} guides
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="min-h-[44px] px-7 rounded-xl border border-border-light bg-surface-base hover:bg-surface-muted hover:border-brand-primary/40 text-text-main font-sans font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-2 gu-focus"
              >
                <span>{pageText("blog.loadMore", locale) || "Load More Guides"}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ZERO RESULTS EMPTY STATE */}
      {filteredArticles.length === 0 && (
        <EmptyBlogSearch
          query={query}
          onReset={handleResetSearchAndFilters}
          locale={locale}
        />
      )}

      {/* 7. INTERNAL LINKING STRIP */}
      <BlogToolsStrip onChangeView={onChangeView} locale={locale} />
    </div>
  );
};