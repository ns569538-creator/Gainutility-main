/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import type { ViewState } from "../types";
import {
  TOOLS_DIRECTORY_SECTIONS,
  toolsInSection,
  TOTAL_TOOL_COUNT,
} from "../toolsDirectory";
import { ToolCard } from "./ToolCard";
import { useLocale } from "../i18n/LocaleContext";

interface ToolsDirectoryProps {
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
  locale?: string;
}

/**
 * The /tools directory — the crawlable index of every tool on the platform.
 * Tools are grouped by the registry-derived top-level sections. Each tool card
 * is a real link to its canonical /tools/<slug> URL, so crawlers can reach
 * every indexable tool from a single entry point.
 */
export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({ onChangeView, locale: localeProp }) => {
  const ctxLocale = useLocale();
  const locale = localeProp || ctxLocale;

  return (
    <section className="w-full max-w-6xl mx-auto" id="tools-directory">
      <header className="mb-8">
        <h1 className="display-lg">All free online tools</h1>
        <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl">
          Browse all {TOTAL_TOOL_COUNT} free, browser-based utilities on GainUtility, grouped by category.
          No sign-up, nothing to install — every tool processes your work on your device.
        </p>
      </header>

      {/* Jump links */}
      <nav aria-label="Tool categories" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {TOOLS_DIRECTORY_SECTIONS.filter((s) => toolsInSection(s).length > 0).map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}-tools`}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-border-light bg-surface-base text-[13px] font-semibold text-text-sub hover:text-brand-primary hover:border-brand-primary/40 transition-colors cursor-pointer gu-focus"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {TOOLS_DIRECTORY_SECTIONS.map((section) => {
        const tools = toolsInSection(section);
        if (tools.length === 0) return null;
        return (
          <section key={section.id} id={`${section.id}-tools`} className="mb-12 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-sans font-bold text-text-main tracking-tight">
                  {section.label}
                </h2>
                {section.blurb && (
                  <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">{section.blurb}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  {tools.length} {tools.length === 1 ? "tool" : "tools"}
                </span>
                {section.hubPath && (
                  <a
                    href={section.hubPath}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView({ type: "seo-page", id: section.hubPath!.slice(1) });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer gu-focus rounded-sm"
                  >
                    {section.label} guide
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 items-stretch" data-browse-grid>
              {tools.map((toolId) => (
                <ToolCard key={toolId} toolId={toolId} onChangeView={onChangeView} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
};