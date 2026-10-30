/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dedicated FAQ page component.
 * Localized across all 8 supported locales with category filtering,
 * instant live search, expand/collapse toggles, and mobile-first design.
 */

import React, { useState, useMemo } from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { internalLinkProps } from "./RelatedToolsSection";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "../i18n/faqData";
import { LocaleCode } from "../i18n/slugs";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  X, 
  MessageSquare,
  ChevronsUpDown
} from "lucide-react";

interface FaqPageProps {
  onChangeView: (view: ViewState) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onChangeView }) => {
  const locale = useLocale();
  const loc = (locale as LocaleCode) || "en";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([FAQ_ITEMS[0].id]));

  const localizedCategories = useMemo(() => {
    return [
      { id: "all", label: pageText("faq.categoryAll", locale) },
      ...FAQ_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label[loc] ?? c.label.en,
      })),
    ];
  }, [loc, locale]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const question = (item.question[loc] ?? item.question.en).toLowerCase();
      const answer = (item.answer[loc] ?? item.answer.en).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [selectedCategory, searchQuery, loc]);

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const allExpanded = filteredItems.length > 0 && filteredItems.every((i) => expandedIds.has(i.id));

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs
          paths={[
            { name: t("crumbsHome", locale), active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
            { name: pageText("faq.crumbTitle", locale), active: true },
          ]}
        />
      </div>

      {/* 2. Header */}
      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/15 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <HelpCircle className="w-4 h-4" /> {pageText("faq.eyebrow", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-text-main tracking-tight">
          {pageText("faq.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed max-w-3xl">
          {pageText("faq.description", locale)}
        </p>
      </header>

      {/* 3. Search Bar */}
      <div className="w-full relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={pageText("faq.searchPlaceholder", locale)}
          aria-label={pageText("faq.searchPlaceholder", locale)}
          className="w-full h-13 pl-12 pr-10 rounded-2xl border border-border-light bg-surface-base text-base text-text-main placeholder:text-text-muted shadow-premium-sm focus:border-border-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. Category Pills & Expand All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {localizedCategories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center cursor-pointer ${
                  active
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-surface-base border border-border-light text-text-sub hover:text-text-main hover:bg-surface-muted"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {filteredItems.length > 0 && (
          <button
            onClick={allExpanded ? handleCollapseAll : handleExpandAll}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors self-end sm:self-auto min-h-[44px] px-2 cursor-pointer"
          >
            <ChevronsUpDown className="w-4 h-4" />
            {allExpanded ? pageText("faq.collapseAll", locale) : pageText("faq.expandAll", locale)}
          </button>
        )}
      </div>

      {/* 5. Accordion List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-surface-base border border-border-light space-y-3 shadow-premium-sm">
            <HelpCircle className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-text-main">{pageText("faq.emptyTitle", locale)}</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              {pageText("faq.emptyDesc", locale)}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-brand-primary-light text-brand-primary text-sm font-semibold hover:bg-brand-primary/20 transition-colors min-h-[44px] cursor-pointer"
              >
                {pageText("faq.resetSearch", locale)}
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            const question = item.question[loc] ?? item.question.en;
            const answer = item.answer[loc] ?? item.answer.en;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border-light bg-surface-base overflow-hidden shadow-premium-sm transition-all hover:border-brand-primary/30"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  className="w-full py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                >
                  <span className="font-sans font-bold text-text-main text-base sm:text-lg leading-snug">
                    {question}
                  </span>
                  <span
                    className={`p-1.5 rounded-lg transition-transform duration-200 text-text-muted flex-shrink-0 ${
                      isExpanded ? "bg-brand-primary-light text-brand-primary rotate-180" : "bg-surface-muted"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-text-sub leading-relaxed border-t border-border-light/60 animate-fade-in">
                    <p>{answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Contact CTA Footer */}
      <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-surface-base border border-border-light shadow-premium-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-text-main flex items-center justify-center sm:justify-start gap-2">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            {pageText("faq.supportTitle", locale)}
          </h3>
          <p className="text-sm text-text-muted">
            {pageText("faq.supportSubtitle", locale)}
          </p>
        </div>
        <a
          {...internalLinkProps({ type: "contact" }, locale, onChangeView)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold shadow-premium-sm transition-all min-h-[44px] flex items-center justify-center cursor-pointer no-underline"
        >
          {pageText("faq.supportButton", locale)}
        </a>
      </div>
    </div>
  );
};
