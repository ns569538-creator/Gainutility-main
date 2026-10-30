import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Check, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { ViewState } from "../types";
import { LibraryPageEntry } from "../seo/libraryPages";
import { NAME_LIST_BY_ID } from "../stylishNames/names";
import { SYMBOL_COLLECTION_BY_ID } from "../stylishNames/symbols";
import { absoluteUrl } from "../site";
import { buildSelfBreadcrumbJsonLd, buildFAQJsonLd } from "../seo/shared";
import { pathToView } from "../router";
import { RelatedToolCard } from "./RelatedToolsSection";
import { copyText } from "../lib/clipboard";

interface LibraryPageProps {
  entry: LibraryPageEntry;
  onChangeView: (view: ViewState) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ entry, onChangeView }) => {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    document.title = entry.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", entry.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = absoluteUrl(entry.path);
    if (canonical) canonical.setAttribute("href", canonicalUrl);

    const schemaJson = [
      buildSelfBreadcrumbJsonLd(entry.breadcrumbs, canonicalUrl),
      buildFAQJsonLd(entry.faq),
    ].filter(Boolean);
    if (schemaJson.length) {
      let script = document.getElementById("seo-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("id", "seo-jsonld");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaJson, null, 2);
    }
  }, [entry]);

  const navigate = (path: string) => {
    const r = pathToView(path);
    if (r.view.type !== "notFound") onChangeView(r.view);
  };

  const handleCopy = async (text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(text);
      window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600);
    }
  };

  const items: string[] =
    entry.kind === "hub"
      ? []
      : entry.sourceType === "names"
      ? (entry.sourceId && NAME_LIST_BY_ID[entry.sourceId]?.items) || []
      : (entry.sourceId && SYMBOL_COLLECTION_BY_ID[entry.sourceId]?.items) || [];

  const isSymbols = entry.sourceType === "symbols";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
        {entry.breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.url}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-disabled shrink-0" />}
            {i < entry.breadcrumbs.length - 1 ? (
              <a
                href={absoluteUrl(crumb.url)}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(crumb.url);
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer"
              >
                {crumb.name}
              </a>
            ) : (
              <span className="text-text-main font-medium" aria-current="page">
                {crumb.name}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight leading-tight mb-4">
          {entry.h1}
        </h1>
        <p className="text-lg text-text-sub max-w-3xl leading-relaxed">{entry.intro}</p>
      </motion.div>

      {/* Live region for copy feedback */}
      <div aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </div>

      {/* Hub: child cards */}
      {entry.kind === "hub" && entry.children && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">Browse the lists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entry.children.map((child) => (
              <button
                key={child.path}
                onClick={() => navigate(child.path)}
                className="group p-4 bg-surface-muted/30 border border-border-light rounded-xl hover:border-brand-primary/20 hover:bg-brand-primary-light/5 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-sans font-semibold text-sm text-text-main group-hover:text-brand-primary transition-colors">
                    {child.label}
                  </span>
                  <ExternalLink className="w-3 h-3 text-text-disabled group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{child.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* List / symbols: copy chips */}
      {entry.kind !== "hub" && items.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-1">
            {isSymbols ? "Symbols to copy" : "Names to copy"}
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Click any {isSymbols ? "symbol" : "name"} to copy it.
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => {
              const isCopied = copied === item;
              return (
                <button
                  key={`${item}-${i}`}
                  onClick={() => handleCopy(item)}
                  aria-label={`Copy ${item}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all duration-150 cursor-pointer min-h-[40px] ${
                    isSymbols ? "text-base" : ""
                  } ${
                    isCopied
                      ? "border-status-success/40 bg-status-success/10 text-status-success"
                      : "border-border-light bg-surface-base text-text-main hover:border-brand-primary/40 hover:bg-brand-primary-light/5"
                  }`}
                >
                  <span>{item}</span>
                  {isCopied && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      {entry.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {entry.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-surface-muted/30 border border-border-light rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer font-sans font-semibold text-text-main hover:text-brand-primary transition-colors list-none">
                  <span>{item.question}</span>
                  <HelpCircle className="w-4 h-4 text-text-muted group-open:text-brand-primary transition-colors shrink-0 ml-2" />
                </summary>
                <div className="px-4 pb-4 text-sm text-text-sub leading-relaxed border-t border-border-light/50 pt-3">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related pages — crawlable <a> cards (RelatedToolsSection) */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Related pages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {entry.related.map((rel) => (
            <RelatedToolCard
              key={rel.path}
              item={{
                key: rel.path,
                path: rel.path,
                id: `library-related-${rel.path.replace(/^\//, "")}`,
                title: rel.label,
                desc: rel.desc,
              }}
              onChangeView={onChangeView}
              className="group p-4 bg-surface-muted/30 border border-border-light rounded-xl hover:border-brand-primary/20 hover:bg-brand-primary-light/5 transition-all text-left cursor-pointer"
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-10 p-6 bg-brand-primary-light/10 border border-brand-primary/20 rounded-2xl">
        <h2 className="font-sans font-bold text-xl text-text-main mb-2">Make any name your own</h2>
        <p className="text-sm text-text-sub leading-relaxed mb-4 max-w-2xl">
          Pick a {isSymbols ? "symbol" : "name"} from this page, then restyle it with bold, script,
          bubble and other Unicode fonts — plus hearts, sparkles and emojis. Everything runs in your
          browser.
        </p>
        <a
          href={absoluteUrl("/tools/stylish-name-generator")}
          onClick={(e) => {
            e.preventDefault();
            navigate("/tools/stylish-name-generator");
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-sm transition-all duration-200 cursor-pointer shadow-premium-sm hover:shadow-premium-md active:scale-[0.98] min-h-[44px]"
        >
          Open the Stylish Name Generator
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-border-light/50">
        <a
          href={absoluteUrl("/tools")}
          onClick={(e) => {
            e.preventDefault();
            navigate("/tools");
          }}
          className="gu-tap inline-flex items-center gap-2 text-sm font-sans font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Browse all tools on GainUtility
        </a>
      </div>
    </div>
  );
};
