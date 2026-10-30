/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Small shared helpers for the Blog UI (date formatting, tool lookup,
 * link navigation). Kept free of routing logic so it's reusable by both
 * the index page and article pages.
 */

import { ViewState } from "../types";
import { toolsRegistry } from "../toolsRegistry";

import { localeByCode, DEFAULT_LOCALE } from "../i18n/locales";

/** Format an ISO date into a localized readable label, e.g. "Aug 14, 2026". */
export const formatDate = (iso: string, locale: string = DEFAULT_LOCALE): string => {
  try {
    const d = new Date(`${iso}T00:00:00`);
    const lang = localeByCode(locale)?.htmlLang || (locale === "pt-br" ? "pt-BR" : locale === "es-mx" ? "es-MX" : locale === "es-co" ? "es-CO" : locale);
    return d.toLocaleDateString(lang, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

/** Look up a tool's display name from the registry. */
export const toolName = (toolId: string): string =>
  toolsRegistry[toolId as keyof typeof toolsRegistry]?.name ?? "the related tool";

/** Sort comparator: newest first (ISO date strings compare lexically). */
export const byDateDesc = (a: { date: string }, b: { date: string }): number =>
  b.date.localeCompare(a.date);

/** Build a ViewState that navigates to a tool page. */
export const toolView = (toolId: string): ViewState => ({
  type: "tool",
  id: toolId as never,
});

export const blogView = (): ViewState => ({ type: "blog" });

export const blogArticleView = (slug: string): ViewState => ({
  type: "blog-article",
  slug,
});

/**
 * Map a blog category to the matching tools hub (as a seo-page id), or null
 * when there is no hub. Used to hand the reader off to the relevant tools.
 */
export const blogCategoryHub = (category: string): string | null => {
  switch (category) {
    case "PDF":
      return "pdf";
    case "Images":
      return "image";
    case "Developer":
      return "dev";
    case "SEO":
      return "seo";
    default:
      return null;
  }
};
