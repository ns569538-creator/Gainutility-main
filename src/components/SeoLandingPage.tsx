import React, { Suspense, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, CheckCircle, HelpCircle, ExternalLink, Search, Copy, Check, ArrowRight } from "lucide-react";
import { ToolId, ViewState } from "../types";
import { SeoPageEntry, SeoPageSection } from "../seo/seoPageContent";
import { absoluteUrl } from "../site";
import { Breadcrumbs, Card } from "./Common";
import { buildSelfBreadcrumbJsonLd, buildFAQJsonLd } from "../seo/shared";
import { applyLocale } from "../i18n";
import { isLocalizedView, pageText } from "../i18n/pages";
import { DEFAULT_LOCALE } from "../i18n/locales";
import { publicPathForView, pathToView } from "../router";
import { articleBySlug, hasLocalizedArticle } from "../blog/blogData";
import { copyText } from "../lib/clipboard";

interface SeoLandingPageProps {
  entry: SeoPageEntry;
  locale?: string;
  toolComponent: React.ReactNode;
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
}

const ToolLoader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-full border-[3px] border-border-light border-t-brand-primary animate-spin" />
    <p className="text-sm font-medium text-text-muted">{label}</p>
  </div>
);

/** Copy button for section code/shadow blocks — reports success only after a real write. */
const SectionCopyButton: React.FC<{ text: string; storageKey: string }> = ({ text, storageKey }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const onCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedKey(storageKey);
      window.setTimeout(() => setCopiedKey((k) => (k === storageKey ? null : k)), 1600);
    }
  };
  const isCopied = copiedKey === storageKey;
  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={`gu-focus inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
        isCopied
          ? "bg-status-success text-white"
          : "border border-border-medium bg-surface-base text-text-main hover:bg-surface-muted"
      }`}
    >
      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {isCopied ? "Copied" : "Copy"}
    </button>
  );
};

/** Live shadow demo — preview applies exactly the declaration the copy button writes. */
const ShadowDemoCard: React.FC<{ section: Extract<SeoPageSection, { type: "shadowDemo" }> }> = ({ section }) => {
  const css = `${section.property}: ${section.value};`;
  const isText = section.property === "text-shadow";
  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-border-light bg-surface-base p-4">
      <div
        className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border-light"
        style={{ background: section.stageBg ?? "#F4F6F2" }}
      >
        {isText ? (
          <span
            className="text-3xl font-bold"
            style={{
              color: section.stageBg ? "#F2F4EF" : "#20262E",
              textShadow: section.value,
            }}
            aria-hidden="true"
          >
            {section.text ?? "Shadow"}
          </span>
        ) : (
          <div
            className="h-20 w-40 bg-white"
            style={{ borderRadius: `${section.radius ?? 16}px`, boxShadow: section.value }}
            aria-hidden="true"
          />
        )}
      </div>
      <figcaption className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-semibold text-text-main pt-1.5">{section.label}</span>
        <SectionCopyButton text={css} storageKey={`demo-${section.label}`} />
      </figcaption>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11.5px] leading-relaxed text-text-main select-all">
        <code>{css}</code>
      </pre>
    </figure>
  );
};

/** Renders one rich-content section (plain data → crawlable HTML + interactive copy). */
const SectionBlock: React.FC<{
  section: SeoPageSection;
  onChangeView: (view: ViewState) => void;
  locale: string;
}> = ({ section, onChangeView, locale }) => {
  switch (section.type) {
    case "heading":
      return (
        <h2 className="mt-10 mb-3 text-lg md:text-xl font-semibold text-text-main tracking-tight leading-snug">
          {section.text}
        </h2>
      );
    case "paragraphs":
      return (
        <>
          {section.items.map((p, i) => (
            <p key={i} className="text-text-sub leading-relaxed mb-4 last:mb-0 max-w-3xl">
              {p}
            </p>
          ))}
        </>
      );
    case "list":
      return (
        <ul className="my-4 space-y-2.5 max-w-3xl">
          {section.items.map((li, i) => (
            <li key={i} className="flex gap-3 text-text-sub leading-relaxed">
              <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" aria-hidden="true" />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <div className="my-4 flex flex-col gap-2 rounded-2xl border border-border-light bg-surface-base p-4 max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            {section.label ? (
              <span className="text-[13px] font-semibold text-text-main">{section.label}</span>
            ) : (
              <span />
            )}
            <SectionCopyButton text={section.content} storageKey={`code-${section.label ?? "block"}`} />
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11.5px] leading-relaxed text-text-main select-all">
            <code>{section.content}</code>
          </pre>
        </div>
      );
    case "shadowDemo":
      return (
        <div className="my-4">
          <ShadowDemoCard section={section} />
        </div>
      );
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-border-light max-w-3xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-muted">
                {section.columns.map((col, ci) => (
                  <th key={ci} scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border-light last:border-b-0">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={
                        ci === 0
                          ? "px-4 py-2 font-medium text-text-main align-top"
                          : "px-4 py-2 text-[0.8125rem] text-text-sub align-top"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {section.caption && (
            <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted bg-surface-muted border-t border-border-light">
              {section.caption}
            </p>
          )}
        </div>
      );
    case "comparison": {
      // Facts the vendor publishes about itself, nothing else: no scores, no
      // quality verdicts, and a source link for every row.
      return (
        <section className="my-6 max-w-3xl">
          {section.heading && (
            <h2 className="text-lg md:text-xl font-semibold text-text-main tracking-tight mb-1">{section.heading}</h2>
          )}
          {section.note && <p className="text-sm text-text-muted mb-3 leading-relaxed">{section.note}</p>}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse text-sm min-w-[36rem]">
              <thead>
                <tr className="border-b border-border-light">
                  {section.columns.map((col) => (
                    <th key={col} scope="col" className="text-left font-semibold text-text-main py-2 pr-4 align-bottom">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.name} className="border-b border-border-light/60 align-top">
                    <th scope="row" className="text-left font-semibold text-text-main py-2.5 pr-4 align-top">
                      {row.name}
                      <span className="block font-normal text-xs text-text-muted mt-0.5">
                        {row.sources.map((s, i) => (
                          <React.Fragment key={s.href}>
                            {i > 0 && <span aria-hidden="true"> · </span>}
                            <a
                              href={s.href}
                              {...(s.href.startsWith("http")
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {
                                    onClick: (e) => {
                                      e.preventDefault();
                                      onChangeView(pathToView(s.href).view);
                                    },
                                  })}
                              className="underline decoration-border-light underline-offset-2 hover:text-brand-primary transition-colors gu-focus"
                            >
                              {s.label}
                            </a>
                          </React.Fragment>
                        ))}
                      </span>
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={i} className="py-2.5 pr-4 text-text-muted leading-relaxed">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            Checked {section.verified} against each service's own published pages. Limits change: follow a source
            before relying on a figure.
          </p>
        </section>
      );
    }
    case "chooser": {
      // No card grid and no extra whitespace: a compact two-column list of
      // jobs, each row pointing at the one destination for that job.
      const items = section.items.filter((item) => {
        const target = pathToView(item.path).view;
        if (target.type !== "blog-article") return true;
        const article = articleBySlug(target.slug);
        return Boolean(article && hasLocalizedArticle(article, locale));
      });
      if (items.length === 0) return null;
      return (
        <section className="my-6 max-w-3xl">
          {section.heading && (
            <h2 className="text-lg md:text-xl font-semibold text-text-main tracking-tight mb-1">{section.heading}</h2>
          )}
          {section.note && <p className="text-sm text-text-muted mb-3 leading-relaxed">{section.note}</p>}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {items.map((item) => {
              const target = pathToView(item.path).view;
              const href = absoluteUrl(publicPathForView(target, locale));
              return (
                <li key={item.path}>
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      onChangeView(target);
                    }}
                    className="group flex items-start justify-between gap-3 py-2.5 border-t border-border-light/70 hover:border-brand-primary/40 transition-colors cursor-pointer gu-focus"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="block text-xs text-text-muted leading-relaxed">{item.hint}</span>
                      )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 text-text-disabled group-hover:text-brand-primary group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      );
    }
    case "links": {
      // Blog targets are dropped when the article does not exist in this
      // locale, so a hub never links at an untranslated URL.
      const items = section.items.filter((item) => {
        const target = pathToView(item.path).view;
        if (target.type !== "blog-article") return true;
        const article = articleBySlug(target.slug);
        return Boolean(article && hasLocalizedArticle(article, locale));
      });
      if (items.length === 0) return null;
      return (
        <section className="my-6 max-w-3xl">
          {section.heading && (
            <h2 className="text-lg md:text-xl font-semibold text-text-main tracking-tight mb-3">{section.heading}</h2>
          )}
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
    }
    default:
      return null;
  }
};

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ entry, locale = DEFAULT_LOCALE, toolComponent, onChangeView }) => {
  const t = (key: string): string => pageText(key, locale);
  const view: ViewState = { type: "seo-page", id: entry.slug ?? entry.path };
  useEffect(() => {
    document.title = entry.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", entry.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    // Self-reference this page's public URL: the localized URL when this hub is
    // genuinely localized for the current locale, otherwise the English one.
    const canonicalUrl = absoluteUrl(isLocalizedView(view, locale) ? applyLocale(entry.path, locale) : entry.path);
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
  }, [entry, locale]);

  const currentPath = typeof window !== "undefined" ? window.location.pathname : entry.path;
  const categoryPath = `/${entry.categorySlug === "developer" ? "dev" : entry.categorySlug}`;
  const h1 =
    entry.h1 ??
    (entry.primaryTool
      ? t("hub.h1Primary").replace("{name}", entry.breadcrumbs[entry.breadcrumbs.length - 1]?.name ?? "Tool")
      : t("hub.h1Hub").replace("{category}", entry.category));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
        {entry.breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.url}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-disabled shrink-0" />}
            {i < entry.breadcrumbs.length - 1 ? (
              <a
                href={publicPathForView({ type: "home" }, locale)}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView({ type: "home" });
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer"
              >
                {crumb.name}
              </a>
            ) : (
              <span className="text-text-main font-medium">{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight leading-tight mb-4">
          {h1}
        </h1>
        <p className="text-lg text-text-sub max-w-3xl leading-relaxed">
          {entry.intro}
        </p>
      </motion.div>

      {/* Rich guide content (syntax, demos, tables, cluster links) */}
      {entry.sections && entry.sections.length > 0 && (
        <section className="mb-10">
          {entry.sections.map((section, i) => (
            <SectionBlock key={i} section={section} onChangeView={onChangeView} locale={locale} />
          ))}
        </section>
      )}

      {/* Use Cases */}
      {entry.useCases.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">{t("hub.sectionWhat")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entry.useCases.map((uc) => (
              <div key={uc.title} className="bg-surface-muted/40 border border-border-light rounded-xl p-5 hover:border-brand-primary/20 transition-colors">
                <h3 className="font-sans font-semibold text-text-main mb-1.5">{uc.title}</h3>
                <p className="text-sm text-text-sub leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Embedded Tool */}
      <section className="mb-10">
        <div className="bg-surface-base border border-border-light rounded-2xl overflow-hidden shadow-premium-sm">
          <div className="p-4 sm:p-6">
            <Suspense fallback={<ToolLoader label={t("hub.loadingTool")} />}>
              {toolComponent}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Steps */}
      {entry.steps.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">{t("hub.sectionHow")}</h2>
          <ol className="space-y-3">
            {entry.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary font-sans font-bold text-sm shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-text-sub leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Limitations */}
      {entry.limitations && entry.limitations.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">{t("hub.sectionLimitations")}</h2>
          <ul className="space-y-2">
            {entry.limitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-2" />
                <p className="text-text-sub leading-relaxed">{lim}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {entry.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">{t("hub.sectionFaq")}</h2>
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

      {/* Related Tools */}
      {entry.relatedTools.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">{t("hub.sectionRelated")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entry.relatedTools.map((tool) => (
              <a
                key={tool.id}
                id={`seo-related-${tool.id}`}
                href={absoluteUrl(publicPathForView({ type: "tool", id: tool.id as ToolId }, locale))}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView({ type: "tool", id: tool.id as ToolId }, { clickedElementId: `seo-related-${tool.id}` });
                }}
                className="group p-4 bg-surface-muted/30 border border-border-light rounded-xl hover:border-brand-primary/20 hover:bg-brand-primary-light/5 transition-all cursor-pointer block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans font-semibold text-sm text-text-main group-hover:text-brand-primary transition-colors">
                    {tool.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-text-disabled group-hover:text-brand-primary transition-colors" />
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{tool.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Internal Category Link */}
      <div className="mt-8 pt-6 border-t border-border-light/50">
        <a
          href={publicPathForView({ type: "home" }, locale)}
          onClick={(e) => {
            e.preventDefault();
            onChangeView({ type: "home" });
          }}
          className="gu-tap inline-flex items-center gap-2 text-sm font-sans font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("hub.browseAll").replace("{category}", entry.category)}
        </a>
      </div>
    </div>
  );
};
