/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Featured Article hero card for GainUtility Blog.
 * Editorial horizontal side-by-side layout on desktop, stacked on mobile.
 * High readability, crawlable anchor, touch-friendly.
 */

import React from "react";
import { BlogArticle } from "../../blog/blogData";
import { ViewState } from "../../types";
import { blogArticleView, formatDate } from "../../blog/blogUi";
import { blogCategoryLabel, pageText } from "../../i18n/pages";
import { publicPathForView } from "../../router";
import { ArticleThumbnail } from "./ArticleThumbnail";
import { ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";

interface FeaturedArticleCardProps {
  article: BlogArticle;
  onChangeView: (view: ViewState) => void;
  locale: string;
}

export const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({
  article,
  onChangeView,
  locale,
}) => {
  const href = publicPathForView(blogArticleView(article.slug), locale);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onChangeView(blogArticleView(article.slug));
  };

  return (
    <article aria-labelledby="featured-article-title" className="w-full">
      <a
        href={href}
        onClick={handleClick}
        className="group relative block w-full rounded-2xl sm:rounded-3xl border border-border-light bg-surface-base hover:border-brand-primary/40 hover:shadow-premium-md transition-all duration-300 overflow-hidden no-underline cursor-pointer gu-focus"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Visual Editorial Preview (5 cols on desktop, full width on mobile) */}
          <div className="lg:col-span-5 p-3 sm:p-4.5 flex flex-col justify-center">
            <ArticleThumbnail
              category={article.category}
              slug={article.slug}
              featured={true}
              className="h-full min-h-[200px] sm:min-h-[240px] lg:min-h-[300px]"
            />
          </div>

          {/* Content side (7 cols on desktop) */}
          <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3.5">
              {/* Top metadata pill row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{pageText("blog.featuredBadge", locale) || "FEATURED GUIDE"}</span>
                </span>
                <span className="text-xs font-mono text-text-muted font-medium">
                  {blogCategoryLabel(article.category, locale)}
                </span>
              </div>

              {/* Title */}
              <h2
                id="featured-article-title"
                className="font-sans font-black text-2xl sm:text-3xl lg:text-[32px] text-text-main group-hover:text-brand-primary transition-colors leading-tight tracking-tight"
              >
                {article.title}
              </h2>

              {/* Excerpt / description */}
              <p className="font-sans text-sm sm:text-base text-text-sub leading-relaxed line-clamp-3">
                {article.description}
              </p>
            </div>

            {/* Bottom info row & CTA */}
            <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readingTime}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(article.date, locale)}</span>
                </span>
              </div>

              {/* Interactive CTA */}
              <span className="inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-primary group-hover:text-brand-primary-hover transition-colors">
                <span>{pageText("blog.readArticle", locale) || "Read Complete Guide"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};
