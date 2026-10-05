/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Internal linking strip for GainUtility Blog.
 * Connects readers directly to the client-side tools discussed throughout the guides.
 */

import React from "react";
import { ToolId, ViewState } from "../../types";
import { toolsRegistry } from "../../toolsRegistry";
import { localizedToolName } from "../../i18n/slugs";
import { publicPathForView } from "../../router";
import { getLocalizedSeo } from "../../i18n/seo";
import { Wrench, ArrowRight, ShieldCheck } from "lucide-react";

interface BlogToolsStripProps {
  onChangeView: (view: ViewState) => void;
  locale: string;
}

const FEATURED_GUIDE_TOOLS: Array<{ id: ToolId; tag: string }> = [
  { id: "merge-pdf", tag: "PDF Tools" },
  { id: "background-remover", tag: "Image Tools" },
  { id: "json-beautifier", tag: "Developer" },
  { id: "xml-sitemap-generator", tag: "SEO Tools" },
];

export const BlogToolsStrip: React.FC<BlogToolsStripProps> = ({
  onChangeView,
  locale,
}) => {
  return (
    <section aria-labelledby="tools-strip-heading" className="w-full pt-8 mt-10 border-t border-border-light">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Browser-Based Utilities</span>
          </div>
          <h2 id="tools-strip-heading" className="font-sans font-bold text-xl sm:text-2xl text-text-main tracking-tight">
            Try the Tools Mentioned in Our Guides
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onChangeView({ type: "tools-directory" })}
          className="gu-tap text-xs sm:text-sm font-sans font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto gu-focus"
        >
          <span>Explore All 140+ Tools</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {FEATURED_GUIDE_TOOLS.map(({ id, tag }) => {
          const meta = toolsRegistry[id];
          if (!meta) return null;
          const locSeo = locale === "en" ? null : getLocalizedSeo(id, locale, meta.name);
          const toolName = locSeo?.h1 || localizedToolName(id, locale, meta.name);
          const href = publicPathForView({ type: "tool", id }, locale);

          return (
            <a
              key={id}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "tool", id });
              }}
              className="group p-4 rounded-xl border border-border-subtle bg-surface-base hover:border-brand-primary/40 hover:shadow-premium-sm transition-all duration-200 no-underline cursor-pointer flex flex-col justify-between gap-3 gu-focus"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-primary">
                  {tag}
                </span>
                <h3 className="font-sans font-bold text-sm sm:text-base text-text-main group-hover:text-brand-primary transition-colors leading-snug line-clamp-1">
                  {toolName}
                </h3>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {meta.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-2 border-t border-divider">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Client-side</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
