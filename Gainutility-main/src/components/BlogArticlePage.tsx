/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility article reading page.
 *
 * Quieter than the index. Category eyebrow, human headline, intro, meta, a
 * direct "quick answer" at the top, then the steps and examples in a single
 * readable column, the related tool, and quiet related-article rows. Figures
 * are real artifacts only — no illustration, nothing invented. Everything
 * derives from the article registry.
 */

import React, { useState } from "react";
import { ViewState } from "../types";
import { BlogArticle, relatedArticlesFor, articleLocalized } from "../blog/blogData";
import { formatDate, blogArticleView, toolName, toolView, blogView } from "../blog/blogUi";
import { blogCategoryLabel, pageText } from "../i18n/pages";
import { publicPathForView, pathToView } from "../router";
import { copyText } from "../lib/clipboard";
import { ArticleFigure, InlineFigure } from "../blog/blogFigures";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";

interface BlogArticlePageProps {
  article: BlogArticle;
  onChangeView: (view: ViewState) => void;
}

/** Transparent star used by filter: drop-shadow demos (alpha shape, not a box). */
const STAR_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='%23D97A3F' d='M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z'/></svg>";

/** Copy button that only reports success after a real clipboard write. */
const BlockCopyButton: React.FC<{ text: string; blockKey: string }> = ({ text, blockKey }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const onCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedKey(blockKey);
      window.setTimeout(() => setCopiedKey((k) => (k === blockKey ? null : k)), 1600);
    }
  };
  const isCopied = copiedKey === blockKey;
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

const BackLink: React.FC<{ onChangeView: (v: ViewState) => void; label: string }> = ({ onChangeView, label }) => {
  const locale = useLocale();
  return (
    <a
      href={publicPathForView(blogView(), locale)}
      onClick={(e) => {
        e.preventDefault();
        onChangeView(blogView());
      }}
      className="inline-flex items-center gap-1.5 blog-meta text-text-muted hover:text-brand-primary cursor-pointer transition-colors gu-focus"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      {label}
    </a>
  );
};

/** An inline tool reference rendered as a quiet footnote-style block. */
const ToolRef: React.FC<{ label: string; toolId: string; onChangeView: (v: ViewState) => void }> = ({
  label,
  toolId,
  onChangeView,
}) => {
  const locale = useLocale();
  return (
    <aside className="border-l-2 border-brand-primary pl-4 my-6">
      <p className="blog-body text-text-muted">
        {label}&nbsp;
        <a
          href={publicPathForView(toolView(toolId), locale)}
          onClick={(e) => {
            e.preventDefault();
            onChangeView(toolView(toolId));
          }}
          className="blog-link cursor-pointer gu-focus"
        >
          {toolName(toolId)}
        </a>
      </p>
    </aside>
  );
};

/** An inline reference to another on-site page (guide or article), quiet footnote style. */
const PageRef: React.FC<{
  label: string;
  path: string;
  text?: string;
  onChangeView: (v: ViewState) => void;
}> = ({ label, path, text, onChangeView }) => {
  const locale = useLocale();
  const view = pathToView(path).view;
  return (
    <aside className="border-l-2 border-brand-primary pl-4 my-6">
      <p className="blog-body text-text-muted">
        {label}&nbsp;
        <a
          href={publicPathForView(view, locale)}
          onClick={(e) => {
            e.preventDefault();
            onChangeView(view);
          }}
          className="blog-link cursor-pointer gu-focus"
        >
          {text ?? path}
        </a>
      </p>
    </aside>
  );
};

/** Outbound citation links for claims made in the same block. */
const SourceLinks: React.FC<{ links: { href: string; text?: string }[] }> = ({ links }) => (
  <aside className="border-l-2 border-border-light pl-4 my-6">
    <ul className="flex flex-col gap-1.5">
      {links.map((l, i) => (
        <li key={i} className="blog-body text-text-muted break-words">
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-link gu-focus hover:underline"
          >
            {l.text ?? l.href}
          </a>
        </li>
      ))}
    </ul>
  </aside>
);

/** A quiet related-article row (category + title + meta). */
const RelatedRow: React.FC<{
  article: BlogArticle;
  onChangeView: (v: ViewState) => void;
  locale: string;
}> = ({ article, onChangeView, locale }) => {
  const open = () => onChangeView(blogArticleView(article.slug));
  return (
    <li className="border-t border-border-light last:border-b">
      <a
        href={publicPathForView(blogArticleView(article.slug), locale)}
        onClick={(e) => {
          e.preventDefault();
          open();
        }}
        className="group w-full py-4 text-left grid grid-cols-1 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-baseline md:gap-x-5 gu-focus"
      >
        <span className="blog-label text-text-muted md:text-right hidden md:block">
          {blogCategoryLabel(article.category, locale)}
        </span>
        <span className="min-w-0 pr-4">
          <span className="blog-label text-text-muted md:hidden">{blogCategoryLabel(article.category, locale)}</span>
          <span className="blog-article-title block md:inline group-hover:text-brand-primary transition-colors">
            {article.title}
          </span>
          <span className="mt-1.5 blog-meta text-text-muted block md:hidden">
            {article.readingTime}
            <span className="mx-1.5 text-text-disabled" aria-hidden="true">·</span>
            {formatDate(article.date, locale)}
          </span>
        </span>
        <span
          className="hidden md:flex items-center gap-2 blog-meta text-text-muted transition-colors group-hover:text-brand-primary"
          aria-hidden="true"
        >
          <ArrowRight className="w-4 h-4" />
        </span>
      </a>
    </li>
  );
};

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({ article, onChangeView }) => {
  const locale = useLocale();
  const localized = articleLocalized(article, locale);
  const related = relatedArticlesFor(article).map((r) => articleLocalized(r, locale));
  const categoryLabel = localized.categoryLabel ?? blogCategoryLabel(localized.category, locale);
  const quickAnswer = localized.quickAnswer ?? localized.keyTakeaway;

  return (
    <div className="blog-type blog-container blog-flow animate-fade-in">
      {/* Breadcrumbs */}
      <div className="mt-1">
        <Breadcrumbs
          paths={[
            { name: t("crumbsHome", locale), active: false, href: publicPathForView({ type: "home" }, locale) },
            { name: pageText("blog.crumbTitle", locale), active: false, href: publicPathForView(blogView(), locale) },
            { name: categoryLabel, active: true },
          ]}
        />
      </div>

      {/* Header — eyebrow, human headline */}
      <header className="border-b border-border-light pb-10">
        <BackLink onChangeView={onChangeView} label={pageText("blogArticle.backToAll", locale)} />
        <p className="mt-8 blog-label text-brand-primary">
          {categoryLabel}
        </p>
        <h1 className="mt-4 blog-featured-title text-balance blog-measure">
          {localized.title}
        </h1>
      </header>

      {/* Readable article column */}
      <div className="blog-container--article w-full mx-auto flex flex-col">
        <article className="flex flex-col">
          {/* Intro + meta */}
          <p className="blog-body text-text-sub leading-relaxed blog-measure">
            {localized.description}
          </p>
          <p className="mt-4 blog-meta text-text-muted">
            {localized.readingTime}
            <span className="mx-1.5 text-text-disabled" aria-hidden="true">·</span>
            {formatDate(localized.date, locale)}
            {localized.author ? (
              <>
                <span className="mx-1.5 text-text-disabled" aria-hidden="true">·</span>
                {localized.author}
              </>
            ) : null}
          </p>

          {/* Quick answer — the honest TL;DR, right at the top */}
          {quickAnswer && (
            <aside className="mt-8 rounded-xl border-l-4 border-brand-primary bg-surface-muted/60 px-6 py-5">
              <p className="blog-label text-brand-primary">{pageText("blogArticle.quickAnswer", locale)}</p>
              <p className="mt-2 blog-body text-text-main font-medium leading-relaxed">
                {quickAnswer}
              </p>
            </aside>
          )}

          {/* Figure — a real, verifiable artifact or nothing */}
          <ArticleFigure slug={article.slug} />

          {/* Body */}
          <div className="flex flex-col gap-0">
            {localized.content.map((block, i) => (
              <section key={i}>
                {block.heading && (
                  <h2 className="mt-10 mb-3 text-lg md:text-xl font-semibold text-text-main tracking-tight leading-snug first:mt-0">
                    {block.heading}
                  </h2>
                )}
                {block.paragraphs?.map((p, j) => (
                  <p key={j} className="blog-body text-text-sub leading-relaxed mb-4 last:mb-0 blog-measure">
                    {p}
                  </p>
                ))}
                {block.list && (
                  <ul className="mt-3 mb-4 space-y-2.5">
                    {block.list.map((li, k) => (
                      <li key={k} className="flex gap-3 blog-body text-text-sub leading-relaxed blog-measure">
                        <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" aria-hidden="true" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {block.steps && (
                  <ol className="mt-3 mb-4 space-y-2.5">
                    {block.steps.map((s, k) => (
                      <li key={k} className="flex gap-3.5 blog-body text-text-sub leading-relaxed blog-measure">
                        <span
                          className="mt-0.5 font-mono text-sm font-semibold text-brand-primary shrink-0 select-none"
                          aria-hidden="true"
                        >
                          {String(k + 1).padStart(2, "0")}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {block.tool && (
                  <ToolRef label={block.tool.label} toolId={block.tool.toolId} onChangeView={onChangeView} />
                )}
                {block.pageLink && (
                  <PageRef
                    label={block.pageLink.label}
                    path={block.pageLink.path}
                    text={block.pageLink.text}
                    onChangeView={onChangeView}
                  />
                )}
                {block.externalLinks && <SourceLinks links={block.externalLinks} />}
                {block.code && (
                  <div className="my-6 rounded-lg border border-border-light bg-surface-muted/70 overflow-hidden">
                    {block.code.label && (
                      <p className="px-4 py-2 blog-label text-text-muted border-b border-border-light bg-surface-muted">
                        {block.code.label}
                      </p>
                    )}
                    <div className="overflow-x-auto">
                      <pre className="px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-text-main whitespace-pre">
                        <code>{block.code.content}</code>
                      </pre>
                    </div>
                    <div className="flex justify-end px-3 pb-3">
                      <BlockCopyButton text={block.code.content} blockKey={`code-${i}`} />
                    </div>
                  </div>
                )}
                {block.shadowDemo && (
                  <figure className="my-6 rounded-lg border border-border-light overflow-hidden">
                    <figcaption className="px-4 py-2 blog-label text-text-muted border-b border-border-light bg-surface-muted">
                      {block.shadowDemo.label}
                    </figcaption>
                    <div
                      className="flex h-32 items-center justify-center overflow-hidden"
                      style={{ background: block.shadowDemo.stageBg ?? "#F4F6F2" }}
                    >
                      {block.shadowDemo.star ? (
                        <img
                          src={STAR_IMG}
                          alt=""
                          className="h-16 w-16"
                          style={
                            block.shadowDemo.property === "filter"
                              ? { filter: block.shadowDemo.value }
                              : { boxShadow: block.shadowDemo.value }
                          }
                        />
                      ) : block.shadowDemo.property === "text-shadow" ? (
                        <span
                          className="text-3xl font-bold"
                          style={{
                            color: block.shadowDemo.stageBg ? "#F2F4EF" : "#20262E",
                            textShadow: block.shadowDemo.value,
                          }}
                        >
                          {block.shadowDemo.text ?? "Shadow"}
                        </span>
                      ) : (
                        <span
                          className="h-20 w-40"
                          style={{
                            background: block.shadowDemo.boxBg ?? "#ffffff",
                            borderRadius: block.shadowDemo.radius ?? 16,
                            boxShadow: block.shadowDemo.value,
                          }}
                        />
                      )}
                    </div>
                    <div className="overflow-x-auto border-t border-border-light bg-surface-muted/70">
                      <pre className="px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-text-main whitespace-pre">
                        <code>{`${block.shadowDemo.property}: ${block.shadowDemo.value};`}</code>
                      </pre>
                    </div>
                    <div className="flex justify-end px-3 pb-3 pt-2 bg-surface-muted/70">
                      <BlockCopyButton
                        text={`${block.shadowDemo.property}: ${block.shadowDemo.value};`}
                        blockKey={`demo-${i}`}
                      />
                    </div>
                  </figure>
                )}
                {block.figure && <InlineFigure key={block.figure} figureKey={block.figure} />}
                {block.table && (
                  <div className="my-6 overflow-x-auto rounded-lg border border-border-light">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border-light bg-surface-muted">
                          {block.table.columns.map((col, ci) => (
                            <th
                              key={ci}
                              scope="col"
                              className="px-4 py-2.5 blog-label text-text-muted whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-border-light last:border-b-0">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={
                                  ci === 0
                                    ? "px-4 py-2 font-medium text-text-primary align-top"
                                    : "px-4 py-2 font-mono text-[0.8125rem] text-text-muted align-top break-words"
                                }
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {block.table.caption && (
                      <p className="px-4 py-2 blog-label text-text-muted bg-surface-muted border-t border-border-light">
                        {block.table.caption}
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>

        {/* Contextual tool CTA — framed quietly, not a thick card */}
        {localized.toolCta && (
          <aside className="mt-10 rounded-2xl border border-border-light bg-surface-base px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <p className="blog-body text-text-main font-medium blog-measure">
              {localized.toolCta.label}
            </p>
            <a
              href={publicPathForView(toolView(localized.toolCta.toolId), locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView(toolView(localized.toolCta.toolId));
              }}
              className="shrink-0 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-brand-primary hover:text-brand-primary-hover cursor-pointer gu-focus transition-colors"
            >
              {toolName(localized.toolCta.toolId)}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </aside>
        )}
      </div>

      {/* Related articles — quiet rows, never duplicating self */}
      {related.length > 0 && (
        <nav aria-label={pageText("blogArticle.related", locale)}>
          <h2 className="blog-section-title mb-5">{pageText("blogArticle.related", locale)}</h2>
          <ul>
            {related.map((r) => (
              <RelatedRow key={r.id} article={r} onChangeView={onChangeView} locale={locale} />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};