/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ViewState } from "../types";
import { SEARCH_INDEX, searchTools } from "../searchIndex";
import { Compass, Search, ArrowRight } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { getLocalizedSeo } from "../i18n/seo";

interface NotFoundPageProps {
  onChangeView: (view: ViewState) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onChangeView }) => {
  const locale = useLocale();
  const [query, setQuery] = React.useState("");

  const suggestions = React.useMemo(
    () => (query.trim() ? searchTools(query).slice(0, 6) : SEARCH_INDEX.slice(0, 6)),
    [query]
  );

  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col items-center text-center py-12 sm:py-20 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary-light border border-brand-primary/15 flex items-center justify-center" aria-hidden="true">
        <Compass className="w-8 h-8 text-brand-primary" />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted">
          {pageText("notFound.badge", locale) || "Error 404"}
        </p>
        <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-text-main tracking-tight">
          {pageText("notFound.heading", locale) || "Page Not Found"}
        </h1>
        <p className="text-sm sm:text-base text-text-sub max-w-xl leading-relaxed">
          {pageText("notFound.description", locale) ||
            "The page you are looking for doesn't exist or may have moved. Try searching for a tool instead."}
        </p>
      </div>

      <div className="w-full max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" aria-hidden="true" />
        <label htmlFor="notfound-search" className="sr-only">
          {pageText("notFound.searchLabel", locale) || "Search tools"}
        </label>
        <input
          id="notfound-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={pageText("notFound.searchPlaceholder", locale) || "Search tools… e.g. PDF to JPG"}
          autoComplete="off"
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-border-light bg-surface-base text-sm text-text-main placeholder:text-text-muted focus:border-border-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        />
      </div>

      <div className="w-full max-w-xl">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted text-left mb-3">
          {pageText("notFound.suggestionsTitle", locale) || "Popular Tools"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestions.map((entry) => {
            const locSeo = locale === "en" ? null : getLocalizedSeo(entry.id, locale, entry.name);
            const toolName = locSeo?.h1 || entry.name;
            return (
              <button
                key={entry.id}
                onClick={() => onChangeView({ type: "tool", id: entry.id })}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border-light bg-surface-base hover:border-brand-primary/40 hover:bg-brand-primary-light/10 text-left transition-colors cursor-pointer group"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-sans font-semibold text-text-main truncate group-hover:text-brand-primary transition-colors">
                    {toolName}
                  </span>
                  <span className="block text-[11px] text-text-muted truncate">{entry.category}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onChangeView({ type: "home" })}
        className="h-11 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
      >
        {pageText("notFound.returnHome", locale) || "Return to Homepage"}
      </button>
    </section>
  );
};
