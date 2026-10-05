/**
 * Lightweight history-based router.
 * Maps clean, crawlable URLs to app views so every tool has its own URL:
 *   /                        → home
 *   /tools/<tool-id>         → tool workspace
 *   /about /privacy /terms /security /cookies /contact /site-audit
 *
 * Legacy single-segment tool URLs (e.g. /json-formatter) are redirected to
 * the canonical /tools/<tool-id> form.
 * Old /studios/* URLs redirect to home (Color Studio is the sole exception,
 * kept as the "color-studio" view type because it powers live tool workspaces).
 */
import { ToolId, ViewState, ColorStudioSectionId } from "./types";
import { SEO_PAGE_MAP } from "./seo/seoPageContent";
import { COMPARISON_PAGE_MAP, CATEGORY_BEST_MAP } from "./seo/comparisonPages";
import { LIBRARY_PAGE_MAP } from "./seo/libraryPages";
import { resolveColorToken, resolvePaletteToken, resolveUiColorSystem } from "./colorStudio/colorData";
import { getTranslatorPair, translatorPairPath } from "./seo/translatorPairs";
import { articleBySlug } from "./blog/blogData";
import { parsePath, applyLocale, resolveToolSlug } from "./i18n";
import { DEFAULT_LOCALE } from "./i18n/locales";
import { localizedToolSlug } from "./i18n/slugs";
import { isLocalizedView } from "./i18n/pages";

export const STATIC_PATHS: Record<string, { type: ViewState["type"]; id?: string }> = {
  "/": { type: "home" },
  "/about": { type: "about" },
  "/privacy": { type: "privacy" },
  "/terms": { type: "terms" },
  "/security": { type: "security" },
  "/cookies": { type: "cookies" },
  "/contact": { type: "contact" },
  "/faq": { type: "faq" },
  "/changelog": { type: "changelog" },
  "/site-audit": { type: "audit" },
  "/blog": { type: "blog" },
  "/tools": { type: "tools-directory" },
  "/pdf": { type: "seo-page", id: "pdf" },
  "/json": { type: "seo-page", id: "json" },
  "/image": { type: "seo-page", id: "image" },
  "/css": { type: "seo-page", id: "css" },
  "/dev": { type: "seo-page", id: "dev" },
  "/seo": { type: "seo-page", id: "seo" },
  "/media": { type: "seo-page", id: "media" },
  "/creator": { type: "seo-page", id: "creator" },
  "/names": { type: "library-page", id: "names" },
  "/symbols": { type: "library-page", id: "symbols" },
};

/** All valid tool ids (any key of the registry union). */
const TOOL_IDS = new Set<string>([
  "json-formatter", "json-viewer", "json-compare", "json-validator", "json-minifier",
  "json-beautifier", "json-tree-viewer", "json-compare-diff", "json-to-csv",
  "gradient-generator", "contrast-checker", "base64-tool", "box-shadow-generator",
  "border-radius-generator", "qr-code-generator", "url-encoder-decoder",
  "html-entity-encoder", "youtube-thumbnail-preview",
  "youtube-title-analyzer", "youtube-timestamp-formatter", "youtube-chapter-generator",
  "youtube-embed-generator", "youtube-url-toolkit", "thumbnail-safe-zone",
  "youtube-description-formatter", "youtube-keyword-explorer", "slug-generator",
  "image-resizer", "image-cropper", "image-converter",
  "webp-converter", "png-jpg-converter", "heic-jpg-converter", "svg-converter",
  "image-watermark", "image-blur-pixelate", "social-resizer", "favicon-generator", "logo-maker",
  "collage-maker", "seo-meta-generator", "og-meta-generator", "twitter-card-generator",
  "robots-txt-generator", "xml-sitemap-generator", "schema-markup-generator",
  "utm-builder", "canonical-url-generator", "hreflang-tag-generator",
  "google-serp-preview", "check-my-website", "launch-checklist",
  "merge-pdf", "split-pdf", "rotate-pdf",
  "jpg-to-pdf", "pdf-to-jpg", "extract-pdf", "delete-pdf", "rearrange-pdf",
  "protect-pdf", "unlock-pdf", "remove-pdf-password", "add-pdf-watermark",
  "flatten-pdf", "add-pdf-page-numbers", "add-pdf-header-footer", "crop-pdf",
  "duplicate-page-finder-pdf", "remove-blank-pages-pdf", "reverse-page-order-pdf",
  "extract-odd-pages-pdf", "extract-even-pages-pdf", "word-to-pdf", "pdf-to-word",
  "excel-to-pdf", "pdf-to-excel", "powerpoint-to-pdf", "pdf-to-powerpoint",
  "html-to-pdf", "pdf-to-text", "text-to-pdf", "remove-pdf-metadata", "repair-pdf",
  "validate-pdf", "optimize-pdf-web", "reduce-pdf-image-quality",
  "compress-images-inside-pdf", "ocr-pdf", "compare-two-pdfs",
  "merge-selected-page-ranges", "split-by-file-size", "split-every-n-pages",
  "pdf-to-html", "pdf-translator", "uuid-generator", "jwt-decoder", "password-generator",
  "password-strength-checker", "hash-generator", "regex-tester",
  "unix-timestamp-converter", "cron-expression-builder", "text-diff-checker",
  "json-schema-validator", "jsonpath-tester", "csv-json-converter",
  "xml-json-converter", "sql-formatter", "yaml-formatter", "http-status-code-lookup",
  "mime-type-lookup", "url-parser", "image-metadata-remover",
  "background-remover", "passport-photo-maker",
  "image-upscaler", "signature-maker", "csv-reconciliation",
  "application-file-checker", "exam-photo-fixer", "exam-signature-fixer",
  "exam-thumb-fixer", "declaration-fixer", "pdf-exact-size",
  "exam-file-requirements",
  "excel-formula-generator", "billable-hours-calculator", "pdf-difference-checker",
  "business-pdf-extractor", "invoice-follow-up-tracker",   "font-detector",
  "linkedin-carousel-maker",
  "color-palette-generator",
  "color-picker",
  "color-explorer",
  "color-visualizer",
  "image-to-palette",
  "video-audio-extractor",
  "video-compressor",
  "video-resizer",
  "video-trimmer",
  "video-converter",
  "video-to-gif",
  "photos-to-video",
  "video-downloader",
  "add-music-to-photo",
  "stylish-name-generator",
]);

const DEPRECATED_TOOL_REDIRECTS: Record<string, { view: ViewState; redirectTo: string }> = {
  "/tools/color-scale-generator": { view: { type: "color-studio", section: "generator" }, redirectTo: "/studios/color/generator" },
  "/tools/image-color-palette-extractor": { view: { type: "color-studio", section: "image" }, redirectTo: "/studios/color/image" },
  "/color-scale-generator": { view: { type: "color-studio", section: "generator" }, redirectTo: "/studios/color/generator" },
  "/image-color-palette-extractor": { view: { type: "color-studio", section: "image" }, redirectTo: "/studios/color/image" },
  // Compressor aliases
  "/tools/image-compressor": { view: { type: "tool", id: "image-converter" }, redirectTo: "/tools/image-converter" },
  "/tool/image-compressor": { view: { type: "tool", id: "image-converter" }, redirectTo: "/tools/image-converter" },
  "/tools/pdf-compressor": { view: { type: "tool", id: "compress-images-inside-pdf" }, redirectTo: "/tools/compress-images-inside-pdf" },
  "/tool/pdf-compressor": { view: { type: "tool", id: "compress-images-inside-pdf" }, redirectTo: "/tools/compress-images-inside-pdf" },
  // Image category aliases -> canonical /image hub
  "/images": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
  "/tools/images": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
  "/tool/images": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
  "/tools/image": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
  "/tool/image": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
  // Retired /image/compress hub sub-page → the surviving /image hub.
  "/image/compress": { view: { type: "seo-page", id: "image" }, redirectTo: "/image" },
};

const COLOR_STUDIO_SECTIONS = new Set<string>([
  "generator",
  "picker",
  "explore",
  "scales",
  "colors",
  "ui-colors",
  "visualizer",
  "contrast",
  "image",
  "gradients",
]);

export interface RouteResult {
  view: ViewState;
  /** Locale resolved from the URL (defaults to the root `en` locale). */
  locale: string;
  /** When true the URL should be replaceState'd to the canonical form. */
  redirectTo?: string;
}

/** Parse a location.pathname into a ViewState. Never throws. */
export const pathToView = (pathname: string): RouteResult => {
  // Strip the locale prefix (if any) and route the remaining English-path
  // equivalent. Non-default locales use localized tool slugs, resolved below.
  const { locale, path: localizedPath } = parsePath(pathname);
  const normalized = (p: string): string => {
    let path = p || "/";
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path;
  };
  const path = normalized(localizedPath);

  // Resolver for the leading tool slug segment. In locales that localize the
  // /tools/ path, the slug must be translated back to the English tool id.
  const resolveSlug = (slug: string): string | undefined => {
    const id = resolveToolSlug(locale, slug);
    return id ?? slug;
  };

  if (DEPRECATED_TOOL_REDIRECTS[path]) {
    return { ...DEPRECATED_TOOL_REDIRECTS[path], locale };
  }

  const staticRoute = STATIC_PATHS[path];
  if (staticRoute) {
    return { view: { type: staticRoute.type, id: staticRoute.id } as ViewState, locale };
  }

  if (path.startsWith("/tools/") || path.startsWith("/tool/")) {
    const isSingleToolPrefix = path.startsWith("/tool/");
    const effectivePath = isSingleToolPrefix ? `/tools/${path.slice("/tool/".length)}` : path;

    if (DEPRECATED_TOOL_REDIRECTS[path]) return { ...DEPRECATED_TOOL_REDIRECTS[path], locale };
    if (DEPRECATED_TOOL_REDIRECTS[effectivePath]) return { ...DEPRECATED_TOOL_REDIRECTS[effectivePath], locale };

    // PDF Translator language-pair sub-routes, e.g.
    // /tools/pdf-translator/english-to-french — checked before the generic
    // tool lookup so the extra slug segment isn't treated as a tool id.
    const pairPrefix = "/tools/pdf-translator/";
    if (effectivePath.startsWith(pairPrefix)) {
      const slug = effectivePath.slice(pairPrefix.length);
      if (getTranslatorPair(slug)) return { view: { type: "translator-pair", pair: slug }, locale };
      return { view: { type: "notFound" }, locale };
    }
    const id = resolveSlug(effectivePath.slice("/tools/".length));
    if (TOOL_IDS.has(id)) {
      const result: RouteResult = { view: { type: "tool", id: id as ToolId }, locale };
      if (isSingleToolPrefix) {
        result.redirectTo = applyLocale(effectivePath, locale);
      }
      return result;
    }
    return { view: { type: "notFound" }, locale };
  }

  // SEO landing page sub-routes: /pdf/compress, /json/formatter, etc.
  const SEO_HUBS = ["pdf", "json", "image", "css", "dev", "seo", "creator"];
  for (const hub of SEO_HUBS) {
    if (path.startsWith(`/${hub}/`)) {
      const byPath = SEO_PAGE_MAP[path];
      if (byPath) {
        return { view: { type: "seo-page", id: byPath.slug }, locale };
      }
      const sub = path.slice(`/${hub}/`.length);
      if (SEO_PAGE_MAP[sub]) {
        return { view: { type: "seo-page", id: sub }, locale };
      }
    }
  }

  // Library pages: /names/<slug> and /symbols/<slug> (the /names and
  // /symbols hubs themselves are static routes above).
  if (path.startsWith("/names/") || path.startsWith("/symbols/")) {
    const entry = LIBRARY_PAGE_MAP[path];
    if (entry) return { view: { type: "library-page", id: entry.slug }, locale };
    return { view: { type: "notFound" }, locale };
  }

  // Comparison pages: /compare/<slug>
  if (path.startsWith("/compare/")) {
    const slug = path.slice("/compare/".length);
    if (COMPARISON_PAGE_MAP[slug]) {
      return { view: { type: "comparison-page", id: slug }, locale };
    }
  }

  // Category best pages: /<category>/best
  for (const hub of SEO_HUBS) {
    if (path === `/${hub}/best`) {
      if (CATEGORY_BEST_MAP[hub]) {
        return { view: { type: "category-best", id: hub }, locale };
      }
    }
  }

  if (path.startsWith("/studios/")) {
    const rest = path.slice("/studios/".length);
    // Keep Color Studio routes (they power the live tool workspaces).
    if (rest === "color" || rest.startsWith("color/")) {
      const section = rest === "color" ? "home" : rest.slice("color/".length);
      if (section === "" || section === "home") return { view: { type: "color-studio", section: "home" }, locale };
      if (COLOR_STUDIO_SECTIONS.has(section)) {
        return { view: { type: "color-studio", section: section as ColorStudioSectionId }, locale };
      }
      return { view: { type: "notFound" }, locale };
    }
    // All other studio routes redirect to home.
    return { view: { type: "home" }, locale, redirectTo: applyLocale("/", locale) };
  }

  // Blog index and individual articles: /blog and /blog/<slug>.
  if (path === "/blog") return { view: { type: "blog" }, locale };
  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    if (articleBySlug(slug)) return { view: { type: "blog-article", slug }, locale };
    return { view: { type: "notFound" }, locale };
  }

  // Crawlable color pages.
  if (path.startsWith("/colors/")) {
    const token = path.slice("/colors/".length);
    if (resolveColorToken(token)) return { view: { type: "color-page", kind: "color", id: token }, locale };
    return { view: { type: "notFound" }, locale };
  }
  if (path.startsWith("/color-palettes/")) {
    const token = path.slice("/color-palettes/".length);
    if (resolvePaletteToken(token)) return { view: { type: "color-page", kind: "palette", id: token }, locale };
    return { view: { type: "notFound" }, locale };
  }
  if (path.startsWith("/ui-colors/")) {
    const token = path.slice("/ui-colors/".length);
    if (resolveUiColorSystem(token)) return { view: { type: "color-page", kind: "ui-color", id: token }, locale };
    return { view: { type: "notFound" }, locale };
  }

  // Legacy pattern: a bare first segment that names a known tool
  // (old canonicals were built as https://host/<tool-id>).
  if (DEPRECATED_TOOL_REDIRECTS[path]) return { ...DEPRECATED_TOOL_REDIRECTS[path], locale };
  if (/^[a-z0-9-]+$/i.test(path.slice(1)) && TOOL_IDS.has(path.slice(1).toLowerCase())) {
    return {
      view: { type: "tool", id: path.slice(1).toLowerCase() as ToolId },
      locale,
      redirectTo: applyLocale(`/tools/${path.slice(1).toLowerCase()}`, locale),
    };
  }
  // Legacy audit alias.
  if (path === "/audit") return { view: { type: "audit" }, locale, redirectTo: "/site-audit" };
  // The former agency "/services" page (and its localized copies) redirect to
  // the tools hub — GainUtility no longer offers design services.
  if (path === "/services") return { view: { type: "home" }, locale, redirectTo: applyLocale("/", locale) };

  return { view: { type: "notFound" }, locale };
};

/**
 * Map a ViewState to its canonical pathname. When a non-default `locale` is
 * supplied, the path is localized (locale prefix + localized tool slugs).
 */
export const viewToPath = (view: ViewState, locale: string = DEFAULT_LOCALE): string => {
  let path: string;
  switch (view.type) {
    case "home":
      path = "/";
      break;
    case "studio":
      // Legacy: studio view type now redirects to home.
      path = "/";
      break;
    case "tool":
      // Localize the tool slug for non-default locales (English keeps the id).
      path = `/tools/${localizedToolSlug(view.id, locale, view.id)}`;
      break;
    case "seo-page": {
      const entry = SEO_PAGE_MAP[view.id];
      path = entry ? entry.path : `/${view.id}`;
      break;
    }
    case "translator-pair":
      path = translatorPairPath(view.pair);
      break;
    case "comparison-page": {
      const entry = COMPARISON_PAGE_MAP[view.id];
      path = entry ? entry.path : `/compare/${view.id}`;
      break;
    }
    case "category-best": {
      const entry = CATEGORY_BEST_MAP[view.id];
      path = entry ? entry.path : `/${view.id}/best`;
      break;
    }
    case "library-page": {
      const entry = LIBRARY_PAGE_MAP[view.id];
      path = entry ? entry.path : `/${view.id}`;
      break;
    }
    case "about":
      path = "/about";
      break;
    case "privacy":
      path = "/privacy";
      break;
    case "terms":
      path = "/terms";
      break;
    case "security":
      path = "/security";
      break;
    case "cookies":
      path = "/cookies";
      break;
    case "contact":
      path = "/contact";
      break;
    case "faq":
      path = "/faq";
      break;
    case "audit":
      path = "/site-audit";
      break;
    case "color-studio":
      path = view.section === "home" ? "/studios/color" : `/studios/color/${view.section}`;
      break;
    case "color-page":
      path =
        view.kind === "color"
          ? `/colors/${view.id}`
          : view.kind === "palette"
          ? `/color-palettes/${view.id}`
          : `/ui-colors/${view.id}`;
      break;
    case "blog": {
      path = "/blog";
      break;
    }
    case "blog-article":
      path = `/blog/${view.slug}`;
      break;
    case "changelog":
      path = "/changelog";
      break;
    case "tools-directory":
      path = "/tools";
      break;
    case "notFound":
      path = "/404";
      break;
    default:
      path = "/";
  }
  return applyLocale(path, locale);
};

/**
 * The PUBLIC path for a (view, locale): the genuine localized URL when the
 * view has real localized content for that locale, otherwise the English
 * canonical URL. Link builders, the prerender and the sitemap use this so
 * non-genuine views never point at (or emit) fake localized URLs that would
 * otherwise 404 after emission is gated.
 */
export const publicPathForView = (view: ViewState, locale: string = DEFAULT_LOCALE): string =>
  isLocalizedView(view, locale) ? viewToPath(view, locale) : viewToPath(view);
