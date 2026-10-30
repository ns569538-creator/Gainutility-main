/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Public changelog — renders src/changelogData.ts newest-first. Every entry
 * is a real, shipped change. There are no invented dates or placeholder rows.
 */

import React from "react";
import { ToolId, ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { internalLinkProps } from "./RelatedToolsSection";
import { t } from "../i18n/ui";
import { useLocale } from "../i18n/LocaleContext";
import { CHANGELOG } from "../changelogData";
import { GitCommitHorizontal, Tags, ExternalLink, ArrowLeft } from "lucide-react";

interface ChangelogPageProps {
  onChangeView: (view: ViewState) => void;
}

/** Area names that map directly to a tool page, so rows link somewhere useful. */
const AREA_TOOL_MAP: Record<string, ToolId> = {
  "LinkedIn Carousel Maker": "linkedin-carousel-maker",
  "Media tools": "video-compressor",
  "Image tools": "image-resizer",
  "Background Remover": "background-remover",
};

const toTool = (area: string) => (AREA_TOOL_MAP[area] ? `/tools/${AREA_TOOL_MAP[area]}` : null);

export const ChangelogPage: React.FC<ChangelogPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto">
      {/* 1. BREADCRUMBS */}
      <Breadcrumbs paths={[
        { name: t("crumbsHome", locale), active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
        { name: "Changelog", active: true }
      ]} />

      {/* 2. HEADER */}
      <section className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/10 px-4 py-1 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <GitCommitHorizontal className="w-3.5 h-3.5" /> Product changes
        </div>
        <h1 className="heading-h1 text-2xl sm:text-3xl lg:text-4xl tracking-tight text-text-main font-bold leading-tight">
          Changelog
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed max-w-2xl mx-auto">
          Every entry below is a real change that shipped to the product. If a fix is listed, it
          actually shipped. That is the whole point of keeping a changelog.
        </p>
      </section>

      {/* 3. ENTRIES */}
      {CHANGELOG.map((entry) => (
        <section
          key={entry.date}
          className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-6 shadow-premium-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
              <Tags className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-sans font-semibold text-text-main">{entry.label}</h2>
          </div>

          <div className="space-y-6">
            {entry.items.map((item, i) => {
              const href = toTool(item.area);
              return (
                <div key={i} className="space-y-2">
                  <h3 className="text-sm font-sans font-bold text-text-main flex items-center gap-1.5">
                    {item.area}
                    {href && (
                      <a
                        {...internalLinkProps(
                          { type: "tool", id: AREA_TOOL_MAP[item.area] },
                          locale,
                          onChangeView
                        )}
                        className="inline-flex items-center gap-1 text-brand-primary hover:underline cursor-pointer gu-focus rounded-sm"
                        aria-label={`Open the ${item.area} tool`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-text-sub leading-relaxed ml-1">
                    {item.changes.map((c, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-brand-primary font-bold select-none">·</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* 4. HOW TO READ THIS */}
      <section className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-3 shadow-premium-sm">
        <h2 className="text-base font-sans font-semibold text-text-main">What belongs here</h2>
        <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
          Only real work is listed: fixes, launches, and meaningful product changes. The date on a
          tool page's <em>Last updated</em> line always matches an entry on this page. If you ever
          see a date here that does not check out, that is a bug — and you can report it on the{" "}
          <a
            {...internalLinkProps({ type: "contact" }, locale, onChangeView)}
            className="text-brand-primary font-semibold hover:underline cursor-pointer gu-focus rounded-sm"
          >
            contact page
          </a>
          .
        </p>
      </section>

      {/* 5. RETURN */}
      <div className="flex items-center justify-center pt-4">
        <a
          {...internalLinkProps({ type: "home" }, locale, onChangeView)}
          className="flex items-center gap-2 px-6 h-12 bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] rounded-xl font-sans font-bold text-base transition-all shadow-premium-sm cursor-pointer whitespace-nowrap no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to all tools</span>
        </a>
      </div>
    </div>
  );
};