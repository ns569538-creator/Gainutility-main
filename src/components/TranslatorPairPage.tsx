/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Data-driven page for one PDF Translator language pair (e.g.
 * /tools/pdf-translator/english-to-french). Own layout + breadcrumbs because
 * Layout routes pair pages through its full-layout children branch.
 */
import React, { useState } from "react";
import { ChevronDown, Languages, ArrowLeftRight } from "lucide-react";
import { ViewState } from "../types";
import { Breadcrumbs, Card } from "./Common";
import { PdfTranslator } from "./PdfTranslator";
import {
  TRANSLATOR_LANGUAGES,
  TranslatorPairEntry,
  pairLabel,
  getTranslatorPair,
  translatorPairPath,
} from "../seo/translatorPairs";
import { absoluteUrl } from "../site";
import { RelatedToolCard } from "./RelatedToolsSection";

interface TranslatorPairPageProps {
  entry: TranslatorPairEntry;
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const TranslatorPairPage: React.FC<TranslatorPairPageProps> = ({
  entry,
  onChangeView,
  onAddToast,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const source = TRANSLATOR_LANGUAGES[entry.source];
  const target = TRANSLATOR_LANGUAGES[entry.target];

  const relatedPairs = (entry.related ?? [])
    .map((slug) => getTranslatorPair(slug))
    .filter(Boolean) as TranslatorPairEntry[];

  return (
    <div className="w-full max-w-4xl">
      <Breadcrumbs
        paths={[
          { name: "Home", active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
              {
                name: "PDF Tools",
                active: false,
                view: { type: "seo-page", id: "pdf" },
                onClick: () => onChangeView({ type: "seo-page", id: "pdf" }),
              },
              {
                name: "PDF Translator",
                active: false,
                view: { type: "tool", id: "pdf-translator" },
                onClick: () => onChangeView({ type: "tool", id: "pdf-translator" }),
              },
          { name: pairLabel(entry), active: true },
        ]}
      />

      <header className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Languages className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            {entry.h1}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <span>{source.native}</span>
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
            <span>{target.native}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            {entry.intro}
          </p>
        </div>
      </header>

      {/* Embedded tool workspace, pre-selected for this language pair */}
      <section className="mt-6" aria-label={`Translate ${source.label} to ${target.label}`}>
        <PdfTranslator
          initialSource={entry.source}
          initialTarget={entry.target}
          onAddToast={onAddToast}
        />
      </section>

      {/* How it works */}
      <Card className="mt-8 sm:mt-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
          How {source.label}-to-{target.label} PDF translation works
        </h2>
        <ol className="mt-4 space-y-3">
          {entry.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Use cases */}
      {entry.useCases.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Common uses for {pairLabel(entry).toLowerCase()}
          </h2>
          <ul className="mt-4 space-y-2">
            {entry.useCases.map((use, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                {use}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* FAQ — rendered visibly so it matches the FAQPage structured data */}
      {entry.faqs.length > 0 && (
        <Card className="mt-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {source.label} to {target.label} — common questions
          </h2>
          <div className="mt-4 space-y-2">
            {entry.faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <details
                  key={i}
                  open={open}
                  className="group rounded-lg border border-slate-200 dark:border-slate-700"
                  onToggle={(e) => setOpenFaq((e.target as HTMLDetailsElement).open ? i : null)}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </details>
              );
            })}
          </div>
        </Card>
      )}

      {/* Other pairs — crawlable <a> cards (RelatedToolsSection) */}
      {relatedPairs.length > 0 && (
        <section className="mt-8 sm:mt-10" aria-label="Other PDF translations">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-50">
            Other PDF translations
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPairs.map((p) => (
              <RelatedToolCard
                key={p.slug}
                item={{
                  key: p.slug,
                  path: translatorPairPath(p.slug),
                  view: { type: "translator-pair", pair: p.slug },
                  id: `related-pair-${p.slug}`,
                  title: pairLabel(p),
                }}
                onChangeView={onChangeView}
                className="rounded-lg border border-slate-200 p-3 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-emerald-900/20"
              />
            ))}
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <a
              href={absoluteUrl("/tools/pdf-translator")}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "tool", id: "pdf-translator" });
              }}
              className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Translate any PDF in the PDF Translator →
            </a>
            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
            <a
              href={absoluteUrl("/pdf")}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "seo-page", id: "pdf" });
              }}
              className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Browse all PDF tools →
            </a>
          </p>
        </section>
      )}
    </div>
  );
};

export default TranslatorPairPage;