/**
 * Sitemap route helper — bundled with esbuild by scripts/generate-sitemap.mjs
 * so the sitemap shares the SAME canonical routing as the app and prerender.
 *
 * Given the set of default-language (English) public paths, returns every
 * localized variant (default `en` has no prefix; other locales get the locale
 * prefix + localized tool slugs) using viewToPath — the single canonical
 * routing function across the whole project.
 */
import { pathToView, viewToPath } from "../src/router";
import { ALL_LOCALES } from "../src/i18n";
import { LocaleCode } from "../src/i18n/slugs";
import { isLocalizedView } from "../src/i18n/pages";

export interface LocalizedPath {
  locale: LocaleCode;
  /** Root-relative, localized pathname (e.g. "/pt-br/tools/jpg-para-pdf"). */
  path: string;
  /**
   * The original English canonical path used to derive this localized variant.
   * The sitemap generator uses this to look up per-tool and per-article
   * lastmod dates, which are keyed by the English slug.
   */
  base: string;
}

export const localizedVariants = (paths: string[]): LocalizedPath[] => {
  const seen = new Set<string>();
  const out: LocalizedPath[] = [];
  for (const p of paths) {
    const route = pathToView(p);
    if (route.view.type === "notFound") continue;
    for (const locale of ALL_LOCALES) {
      // Only genuinely localized variants are listed in the sitemap (English
      // is always emitted as each view's default-language URL). English-only
      // views keep just their `en` entry.
      if (!isLocalizedView(route.view, locale)) continue;
      const path = viewToPath(route.view, locale);
      const key = `${locale}:${path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ locale, path, base: p });
    }
  }
  return out;
};
