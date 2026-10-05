/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Routing helpers for the international SEO layer. DOM-free (safe to import
 * into the Node prerender and the React app).
 *
 * URL scheme:
 *   default `en`   -> /path                  (existing English URLs preserved)
 *   other locales  -> /<code>/path           (e.g. /pt-br/jpg-para-pdf)
 */

import { DEFAULT_LOCALE, localeByCode, localePrefix } from "./locales";
import { localizedToolSlug, LocaleCode } from "./slugs";
import { ToolId, ViewState } from "../types";
import { toolsRegistry } from "../toolsRegistry";
import { isLocalizedView } from "./pages";

/** Split a pathname into a locale code + the rest of the path. */
export interface ParsedPath {
  locale: string;
  /** Path without the locale prefix (starts with "/"). */
  path: string;
  /** Root-relative, localized path with locale prefix applied. */
  localizedPath: string;
}

export const parsePath = (pathname: string): ParsedPath => {
  let p = pathname || "/";
  // Strip trailing slash except root
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  const segments = p.split("/").filter(Boolean);
  if (segments.length > 0) {
    const first = segments[0].toLowerCase();
    const cfg = localeByCode(first);
    if (cfg && !cfg.isDefault) {
      const rest = "/" + segments.slice(1).join("/");
      return {
        locale: cfg.code,
        path: rest || "/",
        localizedPath: p,
      };
    }
  }
  return {
    locale: DEFAULT_LOCALE,
    path: p,
    localizedPath: p,
  };
};

/** Apply a locale prefix to a default-language path ("" prefix for en). */
export const applyLocale = (path: string, locale: string): string => {
  const prefix = localePrefix(locale);
  if (path === "/") return prefix || "/";
  return `${prefix}${path}`;
};

/** Localized home path for a locale. */
export const localizedHomePath = (locale: string): string => (locale === DEFAULT_LOCALE ? "/" : `/${locale}`);

/**
 * Build reciprocal hreflang alternates for a "content key" (e.g. a tool id).
 * Returns absolute URLs for every locale plus x-default (the English URL).
 */
export const buildHreflang = (
  toolId: string,
  siteUrl: string,
  contentPathForLocale: (locale: string) => string
): Array<{ hreflang: string; href: string }> => {
  // es-co is intentionally excluded: its pages are exact es-mx duplicates
  // (sitemap-excluded + noindex), so they must not join the hreflang cluster.
  const locales = ["en", "pt-br", "id", "es-mx", "de", "fr", "it"];
  const entries = locales.map((code) => {
    const cfg = localeByCode(code)!;
    const href = `${siteUrl}${contentPathForLocale(code)}`;
    return { hreflang: cfg.htmlLang, href };
  });
  const defaultEntry = entries.find((e) => e.hreflang === "en")!;
  entries.push({ hreflang: "x-default", href: defaultEntry.href });
  return entries;
};

/**
 * Reciprocal hreflang alternates for a specific view. Only genuinely
 * localized variants are announced: non-localized views (English-only legal
 * pages, non-translated blog articles, etc.) emit `en` + `x-default` only, so
 * their routed-but-English URLs are never presented to crawlers as alternates.
 */
export const buildHreflangForView = (
  view: ViewState,
  siteUrl: string,
  contentPathForLocale: (locale: string) => string
): Array<{ hreflang: string; href: string }> => {
  // The 404 shell exists only at the root path: localized /404 URLs are not
  // emitted, so announcing them as alternates would point crawlers at pages
  // that do not exist. A noindex error page needs no hreflang cluster at all.
  if (view.type === "notFound") return [];
  // es-co excluded from hreflang — duplicate of es-mx, noindexed + sitemap-excluded.
  const locales = ["en", "pt-br", "id", "es-mx", "de", "fr", "it"];
  const entries: Array<{ hreflang: string; href: string }> = [];
  for (const code of locales) {
    if (!isLocalizedView(view, code)) continue;
    const cfg = localeByCode(code)!;
    entries.push({ hreflang: cfg.htmlLang, href: `${siteUrl}${contentPathForLocale(code)}` });
  }
  const enEntry = entries.find((e) => e.hreflang === "en");
  if (enEntry) entries.push({ hreflang: "x-default", href: enEntry.href });
  return entries;
};

/** Localized slug for a tool (re-exported for convenience). */
export { localizedToolSlug };

/* ------------------------------------------------------------------ */
/* Slug -> tool id reverse resolution (for localized URLs)             */
/* ------------------------------------------------------------------ */

let reverseMapCache: Map<string, Map<string, string>> | null = null;

const buildReverseMap = (): Map<string, Map<string, string>> => {
  if (reverseMapCache) return reverseMapCache;
  const byLocale = new Map<string, Map<string, string>>();
  const toolIds = Object.keys(toolsRegistry) as ToolId[];
  const codes = ALL_LOCALES;
  for (const code of codes) {
    const map = new Map<string, string>();
    for (const id of toolIds) {
      const slug = localizedToolSlug(id, code, id);
      // Prefer the earliest registration in case of collisions.
      if (!map.has(slug)) map.set(slug, id);
    }
    byLocale.set(code, map);
  }
  reverseMapCache = byLocale;
  return reverseMapCache;
};

/**
 * Resolve a (possibly localized) tool slug to its canonical English tool id
 * for the given locale. For the default locale a slug is the English id.
 * Returns undefined when the slug is unknown.
 */
export const resolveToolSlug = (locale: string, slug: string): ToolId | undefined => {
  if (locale === DEFAULT_LOCALE) {
    const id = slug.toLowerCase();
    return (toolsRegistry as Record<string, unknown>)[id] ? (id as ToolId) : undefined;
  }
  const map = buildReverseMap();
  const id = map.get(locale)?.get(slug);
  if (id) return id as ToolId;
  // Fall back to the English id lookup (some locales keep English slugs).
  const fallback = slug.toLowerCase();
  return (toolsRegistry as Record<string, unknown>)[fallback] ? (fallback as ToolId) : undefined;
};

/** All supported locale codes (non-default ones are URL-prefixed). */
export const ALL_LOCALES: LocaleCode[] = ["en", "pt-br", "id", "es-mx", "es-co", "de", "fr", "it"];
