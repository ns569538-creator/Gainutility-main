/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Blog Header component for GainUtility.
 * Compact, premium, editorial typography designed to give immediate context
 * without pushing actionable content below the fold.
 */

import React from "react";
import { Breadcrumbs } from "../Common";
import { publicPathForView } from "../../router";
import { pageText } from "../../i18n/pages";
import { t } from "../../i18n/ui";
import { Sparkles, BookOpen } from "lucide-react";

interface BlogHeaderProps {
  locale: string;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ locale }) => {
  return (
    <header className="w-full flex flex-col gap-4 sm:gap-5 pb-6 border-b border-border-light/70">
      {/* Breadcrumb */}
      <div>
        <Breadcrumbs
          paths={[
            {
              name: t("crumbsHome", locale),
              active: false,
              href: publicPathForView({ type: "home" }, locale),
            },
            {
              name: pageText("blog.crumbTitle", locale) || "Blog",
              active: true,
            },
          ]}
        />
      </div>

      <div className="space-y-3 max-w-4xl">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-light/60 border border-brand-primary/20 text-brand-primary text-xs font-mono font-bold tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{pageText("blog.eyebrow", locale) || "PRACTICAL GUIDES & INSIGHTS"}</span>
        </div>

        {/* H1 Heading */}
        <h1 className="font-sans font-black tracking-tight text-text-main text-3xl sm:text-4xl md:text-5xl lg:text-[44px] leading-[1.15]">
          {pageText("blog.h1", locale) || "Practical guides for everyday digital work."}
        </h1>

        {/* Supporting description */}
        <p className="font-sans text-base sm:text-lg text-text-sub max-w-2xl leading-relaxed">
          {pageText("blog.subtitle", locale) ||
            "Step-by-step guides for PDFs, images, developer tools, SEO, and everyday digital work. No fluff, no paywalls."}
        </p>
      </div>
    </header>
  );
};
