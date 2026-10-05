import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ChevronRight, HelpCircle, ExternalLink, ArrowRight, Trophy } from "lucide-react";
import { ToolId, ViewState } from "../types";
import { CategoryBestEntry } from "../seo/comparisonPages";
import { absoluteUrl } from "../site";
import { buildSelfBreadcrumbJsonLd, buildFAQJsonLd } from "../seo/shared";
import { articleBySlug, hasLocalizedArticle } from "../blog/blogData";
import { pathToView, publicPathForView } from "../router";
import { useLocale } from "../i18n/LocaleContext";

interface CategoryBestPageProps {
  entry: CategoryBestEntry;
  onChangeView: (view: ViewState) => void;
}

export const CategoryBestPage: React.FC<CategoryBestPageProps> = ({ entry, onChangeView }) => {
  const locale = useLocale();
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
        {entry.breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.url}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-disabled shrink-0" />}
            {i < entry.breadcrumbs.length - 1 ? (
              <button
                onClick={() => onChangeView({ type: "home" })}
                className="hover:text-brand-primary transition-colors cursor-pointer"
              >
                {crumb.name}
              </button>
            ) : (
              <span className="text-text-main font-medium">{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-brand-primary" />
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight leading-tight">
            {entry.title.replace(" | GainUtility", "")}
          </h1>
        </div>
        <p className="text-lg text-text-sub max-w-3xl leading-relaxed">
          {entry.intro}
        </p>
      </motion.div>

      {/* Ranked Tool List */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Top {entry.tools.length} {entry.category}</h2>
        <div className="space-y-3">
          {entry.tools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: tool.rank * 0.05 }}
              className="group bg-surface-muted/30 border border-border-light rounded-xl p-5 hover:border-brand-primary/20 hover:bg-brand-primary-light/5 transition-all cursor-pointer"
              onClick={() => onChangeView({ type: "tool", id: tool.id })}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-sans font-bold text-lg shrink-0">
                  {tool.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                      {tool.name}
                    </h3>
                    <ExternalLink className="w-3 h-3 text-text-disabled group-hover:text-brand-primary transition-colors" />
                  </div>
                  <p className="text-sm text-text-sub leading-relaxed mb-1">{tool.description}</p>
                  <p className="text-xs text-text-muted">Best for: {tool.bestFor}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guides — locale-gated so a link never lands on an untranslated URL */}
      {(() => {
        const items = (entry.guides?.items ?? []).filter((item) => {
          const target = pathToView(item.path).view;
          if (target.type !== "blog-article") return true;
          const article = articleBySlug(target.slug);
          return Boolean(article && hasLocalizedArticle(article, locale));
        });
        if (items.length === 0) return null;
        return (
          <section className="mb-10">
            <h2 className="font-sans font-bold text-xl text-text-main mb-4">
              {entry.guides?.heading ?? "Guides for these tools"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const target = pathToView(item.path).view;
                const href = absoluteUrl(publicPathForView(target, locale));
                return (
                  <a
                    key={item.path}
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView(target);
                    }}
                    className="group p-4 bg-surface-muted/30 border border-border-light rounded-xl hover:border-brand-primary/20 hover:bg-brand-primary-light/5 transition-all cursor-pointer block"
                  >
                    <span className="flex items-center gap-2 mb-1 font-sans font-semibold text-sm text-text-main group-hover:text-brand-primary transition-colors">
                      {item.title}
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="block text-xs text-text-muted leading-relaxed">{item.desc}</span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* FAQ */}
      {entry.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {entry.faq.map((item, i) => (
              <details key={i} className="group bg-surface-muted/30 border border-border-light rounded-xl overflow-hidden">
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

      {/* Back to the category hub this page belongs to (not the homepage) */}
      <div className="mt-8 pt-6 border-t border-border-light/50">
        <a
          href={absoluteUrl(entry.categoryPath)}
          onClick={(e) => {
            e.preventDefault();
            onChangeView(pathToView(entry.categoryPath).view);
          }}
          className="gu-tap inline-flex items-center gap-2 text-sm font-sans font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Browse all {entry.category} on GainUtility
        </a>
      </div>
    </div>
  );
};
