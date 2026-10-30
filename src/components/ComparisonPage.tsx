import React, { Suspense, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronRight, CheckCircle, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { ToolId, ViewState } from "../types";
import { ComparisonPageEntry } from "../seo/comparisonPages";
import { absoluteUrl } from "../site";
import { publicPathForView, pathToView } from "../router";
import { useLocale } from "../i18n/LocaleContext";
import { RelatedToolCard, internalLinkProps } from "./RelatedToolsSection";
import { buildSelfBreadcrumbJsonLd, buildFAQJsonLd } from "../seo/shared";

interface ComparisonPageProps {
  entry: ComparisonPageEntry;
  toolAComponent: React.ReactNode;
  toolBComponent: React.ReactNode;
  onChangeView: (view: ViewState) => void;
}

const ToolLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-full border-[3px] border-border-subtle border-t-brand-primary animate-spin" />
    <p className="text-sm font-medium text-text-muted">Loading tool...</p>
  </div>
);

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ entry, toolAComponent, toolBComponent, onChangeView }) => {
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

  const [activeTab, setActiveTab] = React.useState<"a" | "b">("a");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
        {entry.breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.url}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-disabled shrink-0" />}
            {i < entry.breadcrumbs.length - 1 ? (
              <a
                {...internalLinkProps(
                  pathToView(crumb.url).view.type === "notFound"
                    ? { type: "home" }
                    : pathToView(crumb.url).view,
                  locale,
                  onChangeView
                )}
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

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight leading-tight mb-4">
          {entry.toolA.name} vs {entry.toolB.name}
        </h1>
        <p className="text-lg text-text-sub max-w-3xl leading-relaxed">
          {entry.intro}
        </p>
      </motion.div>

      {/* Quick Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-surface-muted/40 rounded-xl p-5 hover:bg-surface-muted/60 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <h3 className="font-sans font-semibold text-text-main">Use {entry.toolA.name} when...</h3>
          </div>
          <p className="text-sm text-text-sub leading-relaxed">{entry.decisionA}</p>
        </div>
        <div className="bg-surface-muted/40 rounded-xl p-5 hover:bg-surface-muted/60 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <h3 className="font-sans font-semibold text-text-main">Use {entry.toolB.name} when...</h3>
          </div>
          <p className="text-sm text-text-sub leading-relaxed">{entry.decisionB}</p>
        </div>
      </div>

      {/* Comparison Table */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-border-subtle rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-surface-muted/50">
                <th className="text-left p-3 font-sans font-semibold text-text-main text-sm border-b border-border-subtle">Feature</th>
                <th className="text-left p-3 font-sans font-semibold text-text-main text-sm border-b border-border-subtle">{entry.toolA.name}</th>
                <th className="text-left p-3 font-sans font-semibold text-text-main text-sm border-b border-border-subtle">{entry.toolB.name}</th>
              </tr>
            </thead>
            <tbody>
              {entry.comparisonTable.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-surface-base" : "bg-surface-muted/20"}>
                  <td className="p-3 text-sm font-medium text-text-main border-b border-border-subtle/50">{row.label}</td>
                  <td className="p-3 text-sm text-text-sub border-b border-border-subtle/50">{row.toolA}</td>
                  <td className="p-3 text-sm text-text-sub border-b border-border-subtle/50">{row.toolB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tool Pros */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Key Advantages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-muted/30 rounded-xl p-5">
            <h3 className="font-sans font-semibold text-text-main mb-3">{entry.toolA.name}</h3>
            <ul className="space-y-2">
              {entry.toolA.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-sub">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-muted/30 rounded-xl p-5">
            <h3 className="font-sans font-semibold text-text-main mb-3">{entry.toolB.name}</h3>
            <ul className="space-y-2">
              {entry.toolB.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-sub">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Embedded Tools */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Try Both Tools</h2>
        <div className="bg-surface-base rounded-2xl overflow-hidden shadow-premium-sm">
          {/* Tabs */}
          <div className="flex bg-surface-muted/50">
            <button
              onClick={() => setActiveTab("a")}
              className={`flex-1 p-3 text-sm font-sans font-semibold transition-colors cursor-pointer ${
                activeTab === "a"
                  ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary-light/5"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {entry.toolA.name}
            </button>
            <button
              onClick={() => setActiveTab("b")}
              className={`flex-1 p-3 text-sm font-sans font-semibold transition-colors cursor-pointer ${
                activeTab === "b"
                  ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary-light/5"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {entry.toolB.name}
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <Suspense fallback={<ToolLoader />}>
              {activeTab === "a" ? toolAComponent : toolBComponent}
            </Suspense>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {entry.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl text-text-main mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {entry.faq.map((item, i) => (
              <details key={i} className="group bg-surface-muted/30 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-sans font-semibold text-text-main hover:text-brand-primary transition-colors list-none">
                  <span>{item.question}</span>
                  <HelpCircle className="w-4 h-4 text-text-muted group-open:text-brand-primary transition-colors shrink-0 ml-2" />
                </summary>
                <div className="px-4 pb-4 text-sm text-text-sub leading-relaxed pt-3">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related Tool Links — crawlable <a> cards (RelatedToolsSection) */}
      <section className="mb-10">
        <h2 className="font-sans font-bold text-xl text-text-main mb-4">Try Each Tool</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[entry.toolA, entry.toolB].map((tool) => (
            <RelatedToolCard
              key={tool.id}
              item={{
                key: tool.id,
                path: publicPathForView({ type: "tool", id: tool.id }, locale),
                view: { type: "tool", id: tool.id },
                id: `compare-tool-${tool.id}`,
                title: tool.name,
                desc: tool.description,
              }}
              onChangeView={onChangeView}
              className="group p-4 bg-surface-muted/30 rounded-xl hover:bg-brand-primary-light/5 transition-all text-left cursor-pointer"
            />
          ))}
        </div>
      </section>

      {/* Back link */}
      <div className="mt-10 pt-6">
        <a
          href={absoluteUrl("/tools")}
          onClick={(e) => {
            e.preventDefault();
            onChangeView({ type: "tools-directory" });
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
