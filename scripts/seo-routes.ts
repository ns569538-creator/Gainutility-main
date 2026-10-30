/**
 * Router bridge bundled by scripts/seo-core.mjs with esbuild so the Node-side
 * SEO verifiers use the SAME routing as the app, the prerender and the sitemap.
 * Never imported directly by the verifiers - always via seo-core's loadRoutes().
 */
import { pathToView, viewToPath, STATIC_PATHS } from "../src/router";
import { ALL_LOCALES } from "../src/i18n";
import { isLocalizedView } from "../src/i18n/pages";
import { DEFAULT_LOCALE } from "../src/i18n/locales";

/** English canonical path for any routed path (localized slug -> English id). */
export const englishPath = (path: string): string | null => {
  const r = pathToView(path);
  if (r.view.type === "notFound") return null;
  return viewToPath(r.view, DEFAULT_LOCALE);
};

/** Whether the router recognizes the path at all. */
export const knownRoute = (path: string): boolean => pathToView(path).view.type !== "notFound";

/** Client-side redirect target declared by the router (SPA-level), if any. */
export const routerRedirect = (path: string): string | undefined => pathToView(path).redirectTo;

/** Whether a view genuinely exists in the given locale. */
export const localized = (path: string, locale: string): boolean => {
  const r = pathToView(path);
  if (r.view.type === "notFound") return false;
  return isLocalizedView(r.view, locale);
};

/** Every locale in which a path genuinely exists. */
export const localesFor = (path: string): string[] => ALL_LOCALES.filter((l) => localized(path, l));

export { pathToView, viewToPath, isLocalizedView, ALL_LOCALES, STATIC_PATHS, DEFAULT_LOCALE };
