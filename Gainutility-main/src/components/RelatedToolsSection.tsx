/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ONE related-destination component for the whole site.
 *
 * Every internal "next step" / "related tool" / "related page" card renders
 * through this file so the crawlable contract is enforced in exactly one place:
 *
 *   - a semantic <a href="…"> with an absolute, same-host, trailing-slash-free
 *     URL (never a <button>, never an onClick-only div)
 *   - the href is a REAL route: callers pass a path produced by the router or
 *     the registry, and scripts/verify-seo-indexation.mjs asserts every emitted
 *     href resolves to HTTP 200 with a self-canonical indexable target
 *   - no rel="nofollow", no rel="noopener" stripping, crawlable follow link
 *   - SPA navigation is an optimisation on top of the href (preventDefault),
 *     never a replacement for it, so no-JS crawlers still see the destination
 *   - the icon only ever translates on hover/focus — it is never faded out or
 *     hidden, so the card keeps a visible affordance for pointer and keyboard
 *   - the link text always contains the destination's real name
 */
import React from "react";
import { ChevronRight } from "lucide-react";
import type { ViewState } from "../types";
import { absoluteUrl } from "../site";
import { pathToView, publicPathForView } from "../router";

export interface RelatedToolItem {
  /** Root-relative destination path, already localized for the page's locale. */
  path: string;
  /** Destination label — becomes the accessible link text. */
  title: string;
  /** One supporting line. */
  desc?: string;
  /** Stable identity used for de-duplication (tool id, slug or path). */
  key?: string;
  /** Optional anchor id, preserving existing deep-link targets. */
  id?: string;
  /** Optional rank badge (used by "best of" lists). */
  rank?: number;
  /** Trailing content rendered under the description. */
  footer?: React.ReactNode;
  /** SPA navigation target; defaults to the view resolved from `path`. */
  view?: ViewState;
}

interface RelatedToolCardProps {
  item: RelatedToolItem;
  onChangeView?: (view: ViewState) => void;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_CARD_CLASS =
  "group flex flex-col justify-between gap-2 min-h-[96px] w-full text-left p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-base hover:border-brand-primary/40 hover:shadow-premium-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-primary";

/** The single crawlable card/link used by every related-tools surface. */
export const RelatedToolCard: React.FC<RelatedToolCardProps> = ({
  item,
  onChangeView,
  className = DEFAULT_CARD_CLASS,
  children,
}) => {
  const href = absoluteUrl(item.path);
  const view = item.view ?? pathToView(item.path).view;

  return (
    <a
      href={href}
      id={item.id}
      data-related-path={item.path}
      aria-label={item.title}
      onClick={(e) => {
        if (!onChangeView) return;
        e.preventDefault();
        onChangeView(view);
      }}
      className={className}
    >
      {children ?? (
        <>
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {typeof item.rank === "number" && (
                <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary font-sans font-bold text-sm">
                  {item.rank}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-sans font-bold text-text-main group-hover:text-brand-primary transition-colors leading-snug">
                {item.title}
              </h3>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="w-5 h-5 shrink-0 mt-0.5 text-text-muted group-hover:translate-x-1 group-focus-visible:translate-x-1 transition-transform"
            />
          </div>
          {item.desc && (
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{item.desc}</p>
          )}
          {item.footer}
        </>
      )}
    </a>
  );
};

interface RelatedToolsSectionProps {
  /** Section heading (rendered as the section's h2). */
  heading: string;
  hint?: string;
  items: RelatedToolItem[];
  onChangeView?: (view: ViewState) => void;
  /** Keys already rendered elsewhere on this page — never repeated. */
  excludeKeys?: string[];
  columns?: 2 | 3 | 4;
  idPrefix?: string;
  className?: string;
  cardClassName?: string;
  icon?: React.ReactNode;
}

/**
 * The ONE related-tools grid: heading + de-duplicated crawlable cards.
 * De-duplication is centralised here so two sections on the same page can
 * never advertise the same destination twice.
 */
export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  heading,
  hint,
  items,
  onChangeView,
  excludeKeys = [],
  columns = 3,
  idPrefix = "related-tool-",
  className = "bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 md:p-8 shadow-premium-sm flex flex-col gap-4",
  cardClassName,
  icon,
}) => {
  const excluded = new Set(excludeKeys);
  const seen = new Set<string>();
  const visible: RelatedToolItem[] = [];
  for (const item of items) {
    const key = item.key ?? item.path;
    if (excluded.has(key) || seen.has(key)) continue;
    seen.add(key);
    visible.push(item);
  }
  if (visible.length === 0) return null;

  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <section className={className}>
      <div className="flex items-center gap-3 text-text-main border-b border-divider pb-3">
        {icon}
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-sans font-bold text-text-main tracking-tight">
            {heading}
          </h2>
          {hint && <p className="text-xs sm:text-sm text-text-muted mt-1">{hint}</p>}
        </div>
      </div>
      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {visible.map((item) => (
          <RelatedToolCard
            key={item.key ?? item.path}
            item={{
              ...item,
              id: item.id ?? `${idPrefix}${(item.key ?? item.path).replace(/^\//, "")}`,
            }}
            onChangeView={onChangeView}
            className={cardClassName ?? DEFAULT_CARD_CLASS}
          />
        ))}
      </div>
    </section>
  );
};

/**
 * Spread these onto an `<a>` to turn any internal navigation handler into a
 * crawlable link: a real, absolute, localized href, with the SPA navigation
 * layered on top of it instead of replacing it.
 *
 *   <a {...internalLinkProps({ type: "contact" }, locale, onChangeView)} ...>
 */
export const internalLinkProps = (
  view: ViewState,
  locale?: string,
  onNavigate?: (view: ViewState) => void,
) => ({
  href: absoluteUrl(publicPathForView(view, locale)),
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(view);
  },
});

export default RelatedToolsSection;
