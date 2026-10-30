/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Article Card for GainUtility blog feed.
 * Clear editorial hierarchy, responsive thumbnail, WCAG contrast, touch-friendly.
 */

import React from "react";
import { BlogArticle } from "../../blog/blogData";
import { ViewState } from "../../types";
import { blogArticleView, formatDate } from "../../blog/blogUi";
import { blogCategoryLabel, pageText } from "../../i18n/pages";
import { publicPathForView } from "../../router";
import { ArticleThumbnail } from "./ArticleThumbnail";
import { ArrowRight, Clock, Calendar } from "lucide-react";

interface ArticleCardProps {
  article: BlogArticle;
  onChangeView: (view: ViewState) => void;
  locale: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
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
    <article className="h-full flex flex-col">
      <a
        href={href}
        onClick={handleClick}
        className="group relative flex flex-col justify-between h-full rounded-2xl border border-border-light bg-surface-base hover:border-brand-primary/40 hover:shadow-premium-md transition-all duration-200 overflow-hidden no-underline cursor-pointer gu-focus p-3.5 sm:p-4.5"
      >
        <div className="space-y-3.5">
          {/* Visual vector thumbnail */}
          <ArticleThumbnail
            category={article.category}
            slug={article.slug}
            className="w-full aspect-[16/10] rounded-xl"
          />

          {/* Category & reading time */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-mono font-semibold text-brand-primary">
              {blogCategoryLabel(article.category, locale)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-sans font-bold text-lg sm:text-xl text-text-main group-hover:text-brand-primary transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="font-sans text-xs sm:text-sm text-text-sub leading-relaxed line-clamp-2">
            {article.description}
          </p>
        </div>

        {/* Card Footer: Date & Arrow CTA */}
        <div className="pt-3.5 mt-4 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-muted">
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(article.date, locale)}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-sans font-semibold text-brand-primary group-hover:text-brand-primary-hover transition-colors">
            <span>{pageText("blog.readArticle", locale) || "Read Guide"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </article>
  );
};
