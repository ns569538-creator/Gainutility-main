/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import type { ViewState } from "../types";
import { homeFaqs } from "../i18n/pages";
import { BrowseStudio } from "./BrowseStudio";
import { HeroToolSearch } from "./HeroToolSearch";
import { AddToChrome } from "./AddToChrome";

import { browseCategoryCount } from "../browseCategories";
import { useLocale } from "../i18n/LocaleContext";
import { t, browseCategoryLabel } from "../i18n/ui";
import { localizedToolName } from "../i18n/slugs";
import { COMPARISON_PAGES, CATEGORY_BEST_PAGES } from "../seo/comparisonPages";
import { BLOG_ARTICLES, articleLocalized } from "../blog/blogData";
import { blogArticleView, blogView, byDateDesc, formatDate } from "../blog/blogUi";
import { publicPathForView } from "../router";
import {
  Lock,
  ArrowRight,
  Plus,
  FileText,
  BookOpen,
} from "lucide-react";

/** Example files shown in the hero product mockup (screenshot-style content). */
const EXAMPLE_FILES = [
  { name: "Invoice_2024_annual.pdf", size: "812 KB" },
  { name: "Invoice_2025_Q1_Q2.pdf", size: "1.2 MB" },
  { name: "Sales_report_Q3.pdf", size: "936 KB" },
];

// Set to true after the FIRST home-render (hydration). On that first render the
// prerendered static hero is ALREADY visible, so the entrance animation is
// skipped; later visits back to home still animate.
let homeEntered = false;

interface HomePageProps {
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onChangeView, onAddToast }) => {
  const locale = useLocale();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // On the very first client render (hydration) the prerendered static shell is
  // ALREADY visible and identical, so the opacity-hiding hero entrance animation
  // must NOT run — it would blank the hero and fade it back in. We only play the
  // entrance animation on LATER visits to home (SPA navigation back).
  const [entranceAnim] = useState<boolean>(() => {
    const firstVisit = !homeEntered;
    homeEntered = true;
    return !firstVisit;
  });

  const hero0 = entranceAnim ? " animate-hero-fade-in" : "";
  const hero1 = entranceAnim ? " animate-hero-fade-in-delay-1" : "";
  const hero2 = entranceAnim ? " animate-hero-fade-in-delay-2" : "";
  const hero3 = entranceAnim ? " animate-hero-fade-in-delay-3" : "";


  const faqs = homeFaqs(locale).map((f) => ({ q: f.question, a: f.answer }));
  const toolCountWord = (count: number) =>
    count === 1 ? t("singleTool", locale) : t("toolWord", locale);
  const latestArticles = [...BLOG_ARTICLES].sort(byDateDesc).slice(0, 3);

  return (
    <div className="flex flex-col gap-10 sm:gap-12 md:gap-14 animate-fade-in w-full text-left">

      {/* ═══ 1. HERO ════════════════════════════════════════════════════════ */}
      <header className="relative z-10 w-full max-w-6xl mx-auto pt-5 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-start">

          {/* LEFT — Copy */}
          <div className={`relative z-20 flex flex-col gap-6 sm:gap-7${hero0}`}>
            <div className="flex items-center gap-2">
              <span className="hero-eyebrow">{t("heroEyebrow", locale)}</span>
            </div>

            <h1 className="display-hero max-w-[520px]">
              <span className="block">{t("heroTitleLine1", locale)}</span>
              <span className="block text-brand-primary hero-amber-line">{t("heroTitleAccent", locale)}</span>
            </h1>

            <p className={`text-base sm:text-lg text-text-muted max-w-[460px] leading-relaxed${hero1}`}>
              {t("heroSubtitle", locale)}
            </p>

            <div className={`relative z-20 max-w-[460px]${hero2}`}>
              <HeroToolSearch onChangeView={onChangeView} locale={locale} />
            </div>

            {/* Trust message — lock icon + meaningful statement */}
            <div className={`flex items-start gap-2.5 max-w-[460px]${hero3}`}>
              <Lock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[13px] sm:text-sm text-text-muted leading-relaxed">
                {t("heroPrivacyStrip", locale)}
              </p>
            </div>
          </div>

{/* RIGHT — Product preview: Merge PDF workflow snapshot.
              Clean card, no browser chrome — looks like the real tool. */}
            <div className={`${hero2} lg:mt-2`}>
              <div className="rounded-xl border border-border-subtle bg-surface-base p-4 sm:p-5 shadow-premium-lg">

              {/* Product header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="gu-icon-tile w-10 h-10 shrink-0 rounded-xl bg-brand-primary-light text-brand-primary border border-brand-primary/15">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-main leading-tight truncate">
                    {localizedToolName("merge-pdf", locale, "Merge PDF")}
                  </p>
                  <p className="text-[11px] font-mono text-text-muted leading-tight">
                    pdf · merge · combine
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted">
                  Example
                </span>
              </div>

              {/* Example files (labeled as example) */}
              <ul className="flex flex-col gap-1.5">
                <li className="px-2 py-1 text-[11px] font-mono uppercase text-text-disabled">Example files</li>
                {EXAMPLE_FILES.map((f) => (
                  <li
                    key={f.name}
                    className="gu-row flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2.5"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-surface-base border border-border-subtle/60 flex items-center justify-center text-status-error">
                      <FileText className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-text-main truncate">{f.name}</span>
                      <span className="block text-[11px] font-mono text-text-muted">{f.size}</span>
                    </span>
                    <span className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
                  </li>
                ))}
              </ul>

              {/* Primary action — opens the real tool */}
              <a
                href="/tools/merge-pdf"
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView({ type: "tool", id: "merge-pdf" });
                }}
                className="gu-press gu-focus mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary h-11 px-4 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors cursor-pointer"
              >
                {localizedToolName("merge-pdf", locale, "Merge PDF")}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              {/* Card footer */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider truncate">
                  {(() => {
                    const count = browseCategoryCount("PDF");
                    return `${browseCategoryLabel("PDF", locale)} · ${count} ${toolCountWord(count)}`;
                  })()}
                </span>
                <a
                  href="#browse-tools"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("browse-tools")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="gu-tap gu-press inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-brand-primary hover:underline decoration-brand-primary/40 underline-offset-4 cursor-pointer gu-focus"
                >
                  {t("browseAllShort", locale)}
                  <ArrowRight className="gu-arrow w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ 2. BROWSE TOOLS — THE DIRECTORY (product first with Popular as default) ═══ */}
      <BrowseStudio onChangeView={onChangeView} locale={locale} />

      {/* ═══ 4. EXTENSION CTA (supporting, not primary) ═══════════════════ */}
      <AddToChrome className="w-full max-w-6xl mx-auto" />

      {/* ═══ 4. GUIDES & COMPARISONS ══════════════════════════════════════ */}
      <section
        className="w-full max-w-6xl mx-auto pt-12"
        aria-labelledby="home-guides-title"
      >
        {/* Header — eyebrow → dominant H2 → supporting description */}
        <div className="max-w-[650px]">
          <p className="section-eyebrow">{t("homeGuidesTitle", locale)}</p>
          <h2 id="home-guides-title" className="display-lg mt-3">
            {t("homeGuidesHeading", locale)}
          </h2>
          <p className="mt-4 text-body-lg max-w-[620px]">
            {t("homeGuidesSubtitle", locale)}
          </p>
        </div>

        {/* Comparison grid — each row is a decision shortcut: tool links in
            the title, the rest of the card opens the comparison. */}
        <ul className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPARISON_PAGES.map((c) => (
            <li key={c.slug} className="min-w-0">
              <div className="group relative flex h-full items-center gap-3 min-h-[72px] rounded-xl border border-border-subtle bg-surface-base px-4 py-3.5 transition-all duration-200 hover:border-border-hover hover:shadow-premium-sm">
                <p className="pointer-events-none relative z-10 min-w-0 flex-1 text-base sm:text-[17px] font-semibold leading-snug break-words text-text-main transition-colors group-hover:text-brand-primary">
                  <a
                    href={publicPathForView({ type: "tool", id: c.toolA.id }, locale)}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView({ type: "tool", id: c.toolA.id });
                    }}
                    className="pointer-events-auto rounded-sm no-underline hover:underline hover:text-brand-primary decoration-brand-primary/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-primary transition-colors"
                  >
                    {c.toolA.name}
                  </a>
                  <span className="font-medium text-text-muted"> vs </span>
                  <a
                    href={publicPathForView({ type: "tool", id: c.toolB.id }, locale)}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView({ type: "tool", id: c.toolB.id });
                    }}
                    className="pointer-events-auto rounded-sm no-underline hover:underline hover:text-brand-primary decoration-brand-primary/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-primary transition-colors"
                  >
                    {c.toolB.name}
                  </a>
                </p>
                <a
                  href={publicPathForView({ type: "comparison-page", id: c.slug }, locale)}
                  onClick={(e) => {
                    e.preventDefault();
                    onChangeView({ type: "comparison-page", id: c.slug });
                  }}
                  className="gu-focus absolute inset-0 z-0 rounded-xl"
                >
                  <span className="sr-only">
                    Compare {c.toolA.name} and {c.toolB.name}
                  </span>
                </a>
                <ArrowRight
                  className="gu-arrow relative z-10 w-4 h-4 shrink-0 text-text-muted transition-all duration-200 group-hover:text-brand-primary group-hover:translate-x-0.5 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Best tools by category — collection navigation */}
        <nav
          aria-labelledby="home-best-tools-label"
          className="mt-12 sm:mt-14 pt-6"
        >
          <p id="home-best-tools-label" className="text-[13px] sm:text-sm leading-relaxed">
            <span className="font-semibold text-text-main">{t("homeGuidesBestTitle", locale)}</span>
            <span className="text-text-muted font-normal"> · {t("homeGuidesBestHint", locale)}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {CATEGORY_BEST_PAGES.map((b) => (
              <a
                key={b.slug}
                href={publicPathForView({ type: "category-best", id: b.slug }, locale)}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView({ type: "category-best", id: b.slug });
                }}
                className="group inline-flex items-center gap-1.5 min-h-[44px] rounded-xl border border-border-subtle bg-surface-base px-4 text-[13px] sm:text-sm font-medium text-text-sub transition-colors hover:border-border-hover hover:text-brand-primary gu-focus"
              >
                Best {b.category}
                <ArrowRight
                  className="gu-arrow w-3.5 h-3.5 text-text-muted group-hover:text-brand-primary"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </nav>
      </section>

      {/* ═══ 5. FROM THE BLOG ═════════════════════════════════════════════ */}
      <section
        className="w-full max-w-6xl mx-auto pt-12"
        aria-labelledby="home-blog-title"
      >
        {/* Header — same hierarchy as Guides, different rhythm: rule after the
            eyebrow, view-all aligned to the right on wide screens. */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-[650px]">
            <div className="flex items-center gap-3">
              <p className="section-eyebrow">{t("homeBlogTitle", locale)}</p>
            </div>
            <h2 id="home-blog-title" className="display-lg mt-3">
              {t("homeBlogHeading", locale)}
            </h2>
            <p className="mt-4 text-body-lg max-w-[620px]">
              {t("homeBlogSubtitle", locale)}
            </p>
          </div>
          <a
            href={publicPathForView(blogView(), locale)}
            onClick={(e) => {
              e.preventDefault();
              onChangeView(blogView());
            }}
            className="gu-tap gu-focus inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-primary transition-colors hover:text-brand-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-sm"
          >
            {t("homeBlogViewAll", locale)}
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {/* Featured article + supporting pair — rule-separated editorial
            layout, no card boxes: deliberately unlike the comparison grid. */}
        {latestArticles[0] && (() => {
          const featured = articleLocalized(latestArticles[0], locale);
          return (
            <article className="mt-10 sm:mt-12 pt-6 max-w-[820px]">
              <h3 className="blog-featured-title">
                <a
                  href={publicPathForView(blogArticleView(featured.slug), locale)}
                  onClick={(e) => {
                    e.preventDefault();
                    onChangeView(blogArticleView(featured.slug));
                  }}
                  className="gu-focus hover:text-brand-primary transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                >
                  {featured.title}
                </a>
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
                {formatDate(featured.date, locale)} · {featured.readingTime}
              </p>
              <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-text-sub line-clamp-4 max-w-[720px]">
                {featured.description}
              </p>
            </article>
          );
        })()}

        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {latestArticles.slice(1).map((a) => {
            const localized = articleLocalized(a, locale);
            return (
              <article key={a.slug} className="pt-6 flex flex-col min-w-0">
                <h3 className="blog-article-title">
                  <a
                    href={publicPathForView(blogArticleView(a.slug), locale)}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView(blogArticleView(a.slug));
                    }}
                    className="gu-focus hover:text-brand-primary transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                  >
                    {localized.title}
                  </a>
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                  {formatDate(localized.date, locale)} · {localized.readingTime}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-text-sub line-clamp-3">
                  {localized.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ═══ 6. FAQ ═══════════════════════════════════════════════════════ */}
      <section
        className="w-full max-w-6xl mx-auto pt-12"
        aria-labelledby="home-faq-title"
      >
        <div className="max-w-[720px]">
          <p className="section-eyebrow">{t("faqHomeTitle", locale)}</p>
          <h2 id="home-faq-title" className="display-lg mt-3">
            {t("faqHomeSubtitle", locale)}
          </h2>

          <div className="mt-8 space-y-6">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    id={`faq-btn-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 py-3.5 sm:py-4 text-left font-sans font-semibold text-[15px] sm:text-base text-text-main min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:rounded-sm rounded-sm cursor-pointer gu-focus"
                  >
                    <span className="min-w-0">{faq.q}</span>
                    <span
                      className={`grid place-items-center w-6 h-6 shrink-0 rounded-full text-text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-2 pb-4 sm:pb-5 pr-8 sm:pr-10 text-[14px] text-text-muted leading-relaxed max-w-[62ch]">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};