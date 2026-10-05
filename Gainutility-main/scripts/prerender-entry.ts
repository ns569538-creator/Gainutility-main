/**
 * Prerender entry — executed by scripts/prerender.mjs after `vite build`.
 * Produces a fully-formed HTML document per route using the SAME metadata +
 * JSON-LD builders the live app uses (src/seo/shared.ts), so the static
 * markup always matches what React renders into <head> after hydration.
 */
import { ViewState, ColorStudioSectionId } from "../src/types";
import { STATIC_PATHS } from "../src/router";
import {
  buildPageMeta,
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
  buildAboutPageJsonLd,
  buildPageBreadcrumbJsonLd,
  buildFAQJsonLd,
  buildImageHubJsonLd,
  buildToolJsonLd,
  buildStudioJsonLd,
  buildBlogPostingJsonLd,
  buildHowToJsonLd,
  buildBlogCollectionJsonLd,
} from "../src/seo/shared";
import { BRAND_NAME, SITE_URL } from "../src/site";
import { toolsRegistry } from "../src/toolsRegistry";
import { TOOLS_DIRECTORY_SECTIONS, toolsInSection, TOTAL_TOOL_COUNT } from "../src/toolsDirectory";
import { STUDIOS } from "../src/studiosData";
import { BLOG_ARTICLES, articleBySlug, articlesByCategory, hasLocalizedArticle } from "../src/blog/blogData";
import { formatDate } from "../src/blog/blogUi";
import { SEO_PAGES, SEO_PAGE_MAP, localizedSeoEntry } from "../src/seo/seoPageContent";
import { COMPARISON_PAGES, COMPARISON_PAGE_MAP, CATEGORY_BEST_PAGES, CATEGORY_BEST_MAP } from "../src/seo/comparisonPages";
import { LIBRARY_PAGE_MAP, ALL_LIBRARY_PATHS } from "../src/seo/libraryPages";
import { NAME_LIST_BY_ID } from "../src/stylishNames/names";
import { SYMBOL_COLLECTION_BY_ID } from "../src/stylishNames/symbols";
import {
  TRANSLATOR_PAIR_SLUGS,
  TRANSLATOR_LANGUAGES,
  getTranslatorPair,
  pairLabel,
} from "../src/seo/translatorPairs";
import {
  NAMED_COLORS,
  HERO_COLORS,
  CURATED_PALETTES,
  UI_COLOR_SYSTEMS,
  colorSlug,
  resolveColorToken,
  resolvePaletteToken,
  resolveUiColorSystem,
} from "../src/colorStudio/colorData";
import { generateScale, paletteSlug } from "../src/colorStudio/color";
import { ALL_LOCALES, buildHreflangForView } from "../src/i18n";
import { DEFAULT_LOCALE, localeByCode } from "../src/i18n/locales";
import { pageText, isLocalizedView } from "../src/i18n/pages";
import { t } from "../src/i18n/ui";
import { localizedToolName, localizedStudioName, LocaleCode } from "../src/i18n/slugs";
import { viewToPath, publicPathForView, pathToView } from "../src/router";
import { renderToString } from "react-dom/server";
import * as React from "react";
import App from "../src/App";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const escAttr = escapeHtml;

/* Color science helpers for static rendering (no DOM) */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = hex.replace(/^#/, "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};

const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  let hh = ((h % 360) + 360) % 360;
  let ss = Math.max(0, Math.min(100, s)) / 100;
  let ll = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (hh < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (hh < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (hh < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (hh < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (hh < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
};

const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { r, g, b } = rgb;
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
      case g1: h = (b1 - r1) / d + 2; break;
      case b1: h = (r1 - g1) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const getHarmonyColors = (hex: string, type: string): string[] => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex, hex, hex, hex, hex];
  const { h, s, l } = hsl;
  const rot = (offset: number, sMul: number, lShift: number): string => {
    const { r, g, b } = hslToRgb(h + offset, Math.max(0, Math.min(100, s * sMul)), Math.max(0, Math.min(100, l + lShift)));
    return rgbToHex(r, g, b);
  };
  const mix = (a: string, b: string, t: number): string => {
    const r1 = hexToRgb(a), r2 = hexToRgb(b);
    if (!r1 || !r2) return a;
    return rgbToHex(r1.r + (r2.r - r1.r) * t, r1.g + (r2.g - r1.g) * t, r1.b + (r2.b - r1.b) * t);
  };
  const tint = (h: string, a: number) => mix(h, "#FFFFFF", a);
  const shade = (h: string, a: number) => mix(h, "#000000", a);
  switch (type) {
    case "complementary": return [hex, rot(180, 1, 0), rot(180, 1, -14), rot(0, 1, 18), rot(180, 0.8, 14)];
    case "analogous": return [hex, rot(30, 1, 0), rot(-30, 1, 0), rot(60, 0.92, 6), rot(-60, 0.92, 6)];
    case "triadic": return [hex, rot(120, 1, -4), rot(240, 1, -4), rot(120, 0.9, 12), rot(240, 0.9, 12)];
    case "split-complementary": return [hex, rot(150, 1, -4), rot(210, 1, -4), rot(150, 0.9, 12), rot(210, 0.9, 12)];
    case "tetradic": return [hex, rot(90, 1, 0), rot(180, 1, 0), rot(270, 1, 0), rot(90, 0.9, 14)];
    case "monochromatic": return [hex, shade(hex, 0.16), tint(hex, 0.3), shade(hex, 0.3), tint(hex, 0.55)];
    default: return [hex, hex, hex, hex, hex];
  }
};

const simulateColorBlindness = (hex: string, mode: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb || mode === "normal") return hex;
  const { r, g, b } = rgb;
  let sr: number, sg: number, sb: number;
  switch (mode) {
    case "protan":
      sr = 0.567 * r + 0.433 * g; sg = 0.558 * r + 0.442 * g; sb = 0.242 * g + 0.758 * b; break;
    case "deutan":
      sr = 0.625 * r + 0.375 * g; sg = 0.7 * r + 0.3 * g; sb = 0.3 * g + 0.7 * b; break;
    case "tritan":
      sr = 0.95 * r + 0.05 * g; sg = 0.433 * g + 0.567 * b; sb = 0.475 * g + 0.525 * b; break;
    case "achroma":
      const grey = 0.299 * r + 0.587 * g + 0.114 * b; sr = sg = sb = grey; break;
    default: return hex;
  }
  return rgbToHex(sr, sg, sb);
};

const hslToRgbString = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
};

/* ------------------------------------------------------------------ */
/* One source of truth — the REAL React home tree (server-side render) */
/* ------------------------------------------------------------------ */

/**
 * Explicit, build-generated marker placed on the mount element (#root) only
 * when the document carries the fully-rendered React tree (not a hand-written
 * static shell). src/main.tsx checks this attribute to decide between
 * `hydrateRoot` (real tree present → attach to existing DOM, zero repaint) and
 * `createRoot().render()` (static preview shell → rebuild the tree).
 */
export const SSR_ROOT_ATTR = ' data-gu-ssr="1"';

/**
 * View types we server-render as the REAL React tree via <App initialView
 * initialLocale>. <App/> seeds view/locale from `window.location` and falls
 * back to these props when there is no window, so a server render produces
 * EXACTLY the tree the browser hydrates when served that (route, locale) —
 * one coherent UI from first paint through hydration, no DOM tear-down.
 *
 * Lazy-bodied routes (tool, studio, seo, color...) render their eager Layout
 * chrome for real while the code-split body stays behind its Suspense
 * fallback. Eager static content pages (home, about, blog,
 * blog-article) render their full tree deterministically.
 *
 * The component wrapper (<ErrorBoundary><App/></ErrorBoundary>) mirrors what
 * src/main.tsx mounts on the client, so the hydrated DOM equals this markup.
 * <Layout>'s `firstClientRender` flag (true during SSR and on hydration) and
 * <HomePage>'s `homeEntered` flag (false during SSR and on hydration) both make
 * the first render skip entrance animations on BOTH sides, so the markup
 * matches.
 */

/**
 * View types we server-render as the REAL React tree.
 *
 * Lazy-bodied types (tool, translator-pair) — the eager Layout chrome
 * (header/footer/breadcrumb) is emitted as the real markup while the code-split
 * body renders only its Suspense fallback (no browser-only component code runs
 * during SSR). The client hydrates these in place, matching exactly, so there
 * is no DOM tear-down and no wrong/partial text shell at first paint.
 *
 * Eager static content pages (home, about, blog, blog-article) render
 * their full tree for every locale, giving genuinely localized first paint.
 * Category hub pages, SEO sub-pages, comparison/best pages and the Color Studio
 * follow the same localized static-shell model: their full localized body is
 * emitted via `bodyContent` and the client rebuilds with createRoot (see
 * bodyContent's seo-page/color-page/comparison-page cases), so the generated
 * HTML always contains the real, crawlable content — never a JS-only skeleton.
 *
 * Remaining static pages (privacy/terms/security/cookies/contact/audit/
 * notFound) keep the lightweight preview shell + createRoot instead.
 */
const SSR_VIEW_TYPES = new Set<ViewState["type"]>([
  "home",
  "about",
  "blog",
  "blog-article",
  "tool",
  "changelog",
  "faq",
  "contact",
  "privacy",
  "terms",
  "security",
  "cookies",
]);

/**
 * Server-renders the REAL React tree for a specific (view, locale), seeding
 * <App> so its initial state resolves to that route exactly as the client will
 * derive from window.location during hydration. Mirrors the mount wrapper used
 * by src/main.tsx (ErrorBoundary + App; see renderHomeSSR for the same pattern).
 */
const renderRouteSSR = (view: ViewState, locale: LocaleCode = DEFAULT_LOCALE): string =>
  renderToString(
    React.createElement(
      ErrorBoundary,
      {
        label: "app",
        children: React.createElement(App, { initialView: view, initialLocale: locale }),
      }
    )
  );

/* ------------------------------------------------------------------ */
/* Static body content (replaced when React mounts)                    */
/* ------------------------------------------------------------------ */

/** The site's fixed top navbar, rendered for EVERY prerendered route so the
    full GainUtility navbar (logo, wordmark, nav, language, theme, mobile
    hamburger) is visible from the very first paint — before React hydrates.

    This mirrors the React `Layout` header exactly in its VISIBLE state
    (translate-y-0, not scrolled) so that when React mounts and re-renders the
    same header, the swap is invisible. The initial CSS/HTML state is visible:
    it never depends on hydration, useEffect, or scroll position. */
const siteHeader = (): string =>
  `<header class="fixed top-0 left-0 right-0 z-40 w-full box-border bg-bg-base/95 backdrop-blur-sm border-b border-divider translate-y-0 transition-[transform,background-color,border-color] duration-200 ease-out">
  <div class="site-container h-[72px] flex items-center justify-between gap-4">
    <div class="flex items-center shrink-0 min-w-0">
      <a class="flex items-center gap-2.5 cursor-pointer group select-none no-underline py-1 outline-none" href="/" aria-label="GainUtility home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" fill="none" role="img" aria-label="GainUtility" class="w-8 h-8 sm:w-8.5 sm:h-8.5 shrink-0 transition-opacity group-hover:opacity-90">
          <defs>
            <linearGradient id="bg-grad" x1="110" y1="110" x2="1135" y2="1140" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#082B70"/>
              <stop offset="0.55" stop-color="#06245F"/>
              <stop offset="1" stop-color="#041C4D"/>
            </linearGradient>
            <linearGradient id="yellow-grad" x1="620" y1="450" x2="1040" y2="900" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#FFC400"/>
              <stop offset="1" stop-color="#FFB300"/>
            </linearGradient>
          </defs>
          <rect x="86" y="99" width="1081" height="1042" rx="210" fill="url(#bg-grad)"/>
          <g fill="#FFFFFF">
            <path d="M 633.0,407.0 L 579.0,385.0 L 532.0,375.0 L 470.0,373.0 L 428.0,379.0 L 376.0,395.0 L 344.0,410.0 L 317.0,426.0 L 275.0,459.0 L 243.0,493.0 L 213.0,538.0 L 192.0,589.0 L 182.0,638.0 L 181.0,688.0 L 189.0,736.0 L 208.0,784.0 L 235.0,824.0 L 270.0,858.0 L 295.0,875.0 L 319.0,887.0 L 353.0,899.0 L 403.0,907.0 L 448.0,906.0 L 489.0,898.0 L 519.0,887.0 L 565.0,860.0 L 600.0,830.0 L 598.0,816.0 L 599.0,713.0 L 539.0,761.0 L 485.0,792.0 L 465.0,799.0 L 437.0,804.0 L 399.0,802.0 L 373.0,794.0 L 351.0,782.0 L 338.0,772.0 L 315.0,746.0 L 305.0,727.0 L 298.0,706.0 L 294.0,675.0 L 295.0,649.0 L 300.0,623.0 L 308.0,600.0 L 332.0,559.0 L 368.0,522.0 L 393.0,505.0 L 415.0,494.0 L 444.0,485.0 L 470.0,481.0 L 527.0,483.0 L 570.0,496.0 L 590.0,507.0 L 615.0,527.0 L 695.0,454.0 L 674.0,434.0 Z"/>
            <path d="M 385.0,685.0 L 388.0,691.0 L 617.0,691.0 L 621.0,695.0 L 633.0,734.0 L 656.0,769.0 L 685.0,794.0 L 705.0,804.0 L 722.0,809.0 L 722.0,616.0 L 719.0,610.0 L 712.0,605.0 L 462.0,605.0 L 450.0,615.0 Z"/>
          </g>
          <g fill="url(#yellow-grad)">
            <path d="M 945.0,434.0 L 934.0,432.0 L 926.0,436.0 L 818.0,543.0 L 819.0,553.0 L 826.0,558.0 L 874.0,559.0 L 874.0,714.0 L 871.0,743.0 L 865.0,764.0 L 856.0,781.0 L 833.0,806.0 L 804.0,822.0 L 769.0,830.0 L 727.0,829.0 L 689.0,818.0 L 660.0,801.0 L 639.0,782.0 L 618.0,753.0 L 606.0,727.0 L 602.0,712.0 L 600.0,712.0 L 599.0,806.0 L 603.0,837.0 L 610.0,854.0 L 622.0,871.0 L 653.0,896.0 L 690.0,912.0 L 730.0,920.0 L 777.0,921.0 L 829.0,914.0 L 869.0,901.0 L 910.0,878.0 L 943.0,849.0 L 964.0,821.0 L 983.0,780.0 L 991.0,738.0 L 992.0,559.0 L 1043.0,558.0 L 1050.0,553.0 L 1051.0,543.0 Z"/>
          </g>
        </svg>
        <span class="font-sans font-bold text-[17px] sm:text-[18px] tracking-tight text-text-primary group-hover:text-primary transition-colors leading-none whitespace-nowrap">GainUtility</span>
      </a>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
      <nav class="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0" aria-label="Primary">
        <a href="/tools" class="h-10 px-3.5 flex items-center justify-center rounded-lg text-[13.5px] lg:text-[14.5px] font-medium text-text-muted hover:text-text-primary no-underline">All Tools</a>
        <a href="/blog" class="h-10 px-3.5 flex items-center justify-center rounded-lg text-[13.5px] lg:text-[14.5px] font-medium text-text-muted hover:text-text-primary no-underline">Blog</a>
        <a href="/faq" class="h-10 px-3.5 flex items-center justify-center rounded-lg text-[13.5px] lg:text-[14.5px] font-medium text-text-muted hover:text-text-primary no-underline">FAQ</a>
        <a href="/about" class="h-10 px-3.5 flex items-center justify-center rounded-lg text-[13.5px] lg:text-[14.5px] font-medium text-text-muted hover:text-text-primary no-underline">About</a>
      </nav>
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div class="relative">
          <button class="h-10 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-text-muted border border-border-subtle/70" aria-label="Switch language" title="Switch language" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
            <span class="font-mono text-[11px] font-semibold">EN</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
          </button>
        </div>
        <button class="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted border border-border-subtle/70" aria-label="Switch to dark theme" title="Switch to dark theme" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
        </button>
        <button class="w-10 h-10 rounded-lg flex items-center justify-center text-text-primary border border-border-subtle/70 md:hidden shrink-0" aria-label="Open menu" aria-expanded="false" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>
        </button>
      </div>
    </div>
  </div>
</header>`;

const bodyContent = (view: ViewState, locale: LocaleCode = DEFAULT_LOCALE): string => {
  const crumbsLink = (crumbs: Array<{ name: string; url: string }>) =>
    `<nav aria-label="Breadcrumb"><ol style="list-style:none;display:flex;gap:.5em;padding:0;margin:0 0 1rem;font-size:.9rem">` +
    crumbs
      .map((c) => `<li><a href="${escAttr(c.url)}">${escapeHtml(c.name)}</a></li>`)
      .join(`<li aria-hidden="true">/</li>`) +
    `</ol></nav>`;

  const pageBody = (() => {
  switch (view.type) {
    case "home": {
      // Static pre-hydration shell for the CURRENT GainUtility homepage.
      // The live homepage is fully client-rendered by HomePage.tsx, but the
      // browser paints this HTML (which mirrors the real hero copy, navbar,
      // search, Merge PDF preview, and trust strip) before JS loads — so the
      // VERY FIRST PAINT is already the current homepage with the navbar and
      // mobile hamburger visible.
      //
      // React's createRoot().render() replaces the entire #root subtree on
      // mount, so there is no hydration mismatch: this shell only needs to
      // render the exact same visual homepage so the swap is invisible.
      //
      // This shell intentionally mirrors the FIRST React render of HomePage.tsx
      // above the fold — the same Layout <main> wrapper classes (site-container, py-6..10)
      // and the same hero grid (1.15fr/1fr, pt-5), 3 mock files, search input
      // height (h-[56px]), card (rounded-xl) and trust strip placement — so the
      // prerendered first paint is pixel-identical to the mounted homepage and
      // createRoot's DOM replacement causes no visible swap.
      //
      // Sections BELOW the fold (BrowseStudio tools directory, Add to Chrome,
      // FAQ) are intentionally omitted: they are off-screen on a fresh load,
      // appear immediately on mount, and do not participate in the visible swap.
      const topPadding = "pt-[72px]";
      const searchSvg = '<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>';
      const fileSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>';
      const checkSvg = '<svg class="w-4 h-4 text-brand-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>';
      const mockFiles = [
        { name: "Invoice_2024_annual.pdf", size: "812 KB" },
        { name: "Invoice_2025_Q1_Q2.pdf", size: "1.2 MB" },
        { name: "Sales_report_Q3.pdf", size: "936 KB" },
      ]
        .map(
          (f) => `
                  <li class="gu-row flex items-center gap-3 rounded-lg border border-border-light/70 bg-background/50 px-3 py-2.5">
                    <span class="w-8 h-8 shrink-0 rounded-lg bg-surface-base border border-border-light/60 flex items-center justify-center text-status-error">${fileSvg}</span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-[13px] font-medium text-text-main truncate">${f.name}</span>
                      <span class="block text-[11px] font-mono text-text-muted">${f.size}</span>
                    </span>
                    ${checkSvg}
                  </li>`
        )
        .join("");
      return `
<div class="min-h-screen bg-bg-base text-text-main flex flex-col transition-colors duration-200">
  <div class="flex flex-1 relative items-stretch ${topPadding}">
    <main id="main-content" tabindex="-1" class="site-container flex-1 py-6 sm:py-8 md:py-10 flex flex-col gap-6 sm:gap-8 md:gap-10 overflow-x-hidden focus:outline-none">
      <div class="w-full flex flex-col gap-6 sm:gap-8 md:gap-10">
        <div class="flex flex-col gap-10 sm:gap-12 md:gap-14 w-full text-left">
          <header class="relative z-10 w-full max-w-6xl mx-auto pt-5 pb-0">
            <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-start">
              <div class="flex flex-col gap-6 sm:gap-7">
                <div class="flex items-center gap-2">
                  <span class="hero-eyebrow">Everyday browser utilities</span>
                  <span class="w-6 h-px bg-border-medium" aria-hidden="true"></span>
                </div>
                <h1 class="display-hero max-w-[520px]">
                  <span class="block">Get stuff done.</span>
                  <span class="block text-brand-primary hero-amber-line">Minus the fuss.</span>
                </h1>
                <p class="text-base sm:text-lg text-text-muted max-w-[460px] leading-relaxed">
                  Small tools for everyday work, right in your browser.
                </p>
                <div class="max-w-[460px]">
                  <div class="relative w-full">
                    ${searchSvg}
                    <input type="text" placeholder="Search tools" class="w-full h-[56px] pl-11 pr-10 rounded-lg border border-border-light bg-surface-base focus:border-brand-primary text-base text-text-main placeholder:text-text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors font-sans" aria-label="Search tools" />
                  </div>
                </div>
                <div class="flex items-start gap-2.5 max-w-[460px]">
                  <svg class="w-4 h-4 text-brand-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <p class="text-[13px] sm:text-sm text-text-muted leading-relaxed">Most tools run right in your browser. Any tool that calls an external service says so on its page.</p>
                </div>
              </div>
              <div class="lg:mt-2">
                <div class="rounded-xl border border-border-light bg-surface-base p-4 sm:p-5 shadow-premium-lg">
                  <div class="flex items-center gap-3 mb-4">
                    <span class="gu-icon-tile w-10 h-10 shrink-0 rounded-xl bg-brand-primary-light text-brand-primary border border-brand-primary/15">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                    </span>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-text-main leading-tight truncate">Merge PDF</p>
                      <p class="text-[11px] font-mono text-text-muted leading-tight">pdf &middot; merge &middot; combine</p>
                    </div>
                    <span class="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-status-success">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                      ready
                    </span>
                  </div>
                  <ul class="flex flex-col gap-2">${mockFiles}
                  </ul>
                  <a href="/tools/merge-pdf" class="gu-press gu-focus mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary h-11 px-4 text-sm font-semibold text-white hover:bg-brand-primary-hover transition-colors cursor-pointer">Merge PDF<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
                  <div class="mt-3 pt-3 border-t border-border-light/60 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-mono text-text-muted uppercase tracking-wider truncate">PDF &middot; 2 tools</span>
                    <a href="#browse-tools" class="gu-press inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-brand-primary hover:underline decoration-brand-primary/40 underline-offset-4 cursor-pointer gu-focus">Browse all<svg class="gu-arrow w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <noscript>
            <div class="w-full max-w-6xl mx-auto text-sm text-text-muted">
              Most tools run entirely in your browser and require JavaScript. Some tools that call an external service disclose it on their page. Without JavaScript, only this static preview is shown.
            </div>
          </noscript>
        </div>
      </div>
    </main>
  </div>
</div>`;
    }
    case "studio": {
      const s = STUDIOS.find((x) => x.id === view.id)!;
      const items = s.tools
        .map((id) => {
          const name = toolsRegistry[id]?.name ?? id;
          return `<li><a href="${escAttr(SITE_URL)}${escAttr(publicPathForView({ type: "tool", id }, locale))}">${escapeHtml(localizedToolName(id, locale, name))}</a></li>`;
        })
        .join("");
      const meta = buildPageMeta(view, locale);
      return crumbsLink(meta.breadcrumb) +
        `<h1>${escapeHtml(localizedStudioName(view.id, locale, s.name))}</h1><p>${escapeHtml(meta.description)}</p>` +
        `<h2>Tools in this collection</h2><ul>${items}</ul>`;
    }
    case "seo-page": {
      const entry = SEO_PAGE_MAP[view.id];
      if (!entry) return `<h1>Page Not Found</h1>`;
      const loc = localizedSeoEntry(entry, locale);
      const t = (key: string): string => pageText(key, locale);
      const h1 = loc.h1 ??
        (loc.primaryTool
          ? t("hub.h1Primary").replace("{name}", loc.breadcrumbs[loc.breadcrumbs.length - 1]?.name ?? "Tool")
          : t("hub.h1Hub").replace("{category}", loc.category));
      // Rich guide sections — same plain data SeoLandingPage hydrates into,
      // emitted here as crawlable HTML before React mounts.
      const sectionsHtml = (loc.sections ?? [])
        .map((s) => {
          switch (s.type) {
            case "heading":
              return `<h2>${escapeHtml(s.text)}</h2>`;
            case "paragraphs":
              return s.items.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
            case "list":
              return `<ul>${s.items.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>`;
            case "code":
              return `${s.label ? `<p><strong>${escapeHtml(s.label)}</strong></p>` : ""}<pre><code>${escapeHtml(s.content)}</code></pre>`;
            case "shadowDemo": {
              const css = `${s.property}: ${s.value};`;
              const stage = s.stageBg ?? "#F4F6F2";
              const visual = s.property === "text-shadow"
                ? `<span style="font-size:30px;font-weight:700;color:${s.stageBg ? "#F2F4EF" : "#20262E"};text-shadow:${escAttr(s.value)}">${escapeHtml(s.text ?? "Shadow")}</span>`
                : `<span style="display:inline-block;width:160px;height:80px;background:#fff;border-radius:${s.radius ?? 16}px;box-shadow:${escAttr(s.value)}"></span>`;
              return `<figure><figcaption>${escapeHtml(s.label)}</figcaption><div style="display:flex;height:128px;align-items:center;justify-content:center;background:${escAttr(stage)};border:1px solid #E4E7E0;border-radius:12px;overflow:hidden">${visual}</div><pre><code>${escapeHtml(css)}</code></pre></figure>`;
            }
            case "table": {
              const head = `<tr>${s.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
              const body = s.rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
              return `<table><thead>${head}</thead><tbody>${body}</tbody></table>${s.caption ? `<p>${escapeHtml(s.caption)}</p>` : ""}`;
            }
            case "comparison": {
              const head = `<tr>${s.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
              const body = s.rows
                .map(
                  (r) =>
                    `<tr><th>${escapeHtml(r.name)} <small>${r.sources
                      .map(
                        (src) =>
                          `<a href="${escAttr(src.href.startsWith("http") ? src.href : SITE_URL + src.href)}"${
                            src.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""
                          }>${escapeHtml(src.label)}</a>`
                      )
                      .join(" ")}</small></th>${r.cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`
                )
                .join("");
              return `${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ""}${s.note ? `<p>${escapeHtml(s.note)}</p>` : ""}<table><thead>${head}</thead><tbody>${body}</tbody></table><p>Checked ${escapeHtml(s.verified)} against each service's own published pages.</p>`;
            }
            case "chooser": {
              // Same locale gating as "links": a blog target that has no
              // translation in this locale is dropped instead of emitted.
              const items = s.items.filter((item) => {
                const target = pathToView(item.path).view;
                if (target.type !== "blog-article") return true;
                const article = articleBySlug(target.slug);
                return Boolean(article && hasLocalizedArticle(article, locale));
              });
              if (items.length === 0) return "";
              return `${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ""}${s.note ? `<p>${escapeHtml(s.note)}</p>` : ""}<ul>${items
                .map(
                  (item) =>
                    `<li><a href="${escAttr(SITE_URL)}${escAttr(publicPathForView(pathToView(item.path).view, locale))}">${escapeHtml(item.label)}</a>${item.hint ? ` — ${escapeHtml(item.hint)}` : ""}</li>`
                )
                .join("")}</ul>`;
            }
            case "links": {
              // Blog targets are dropped when the article does not exist in this
              // locale, and the surviving href is localized. Keeps every emitted
              // link on a URL that was actually prerendered.
              const items = s.items.filter((item) => {
                const target = pathToView(item.path).view;
                if (target.type !== "blog-article") return true;
                const article = articleBySlug(target.slug);
                return Boolean(article && hasLocalizedArticle(article, locale));
              });
              if (items.length === 0) return "";
              return `${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ""}<ul>${items
                .map(
                  (item) =>
                    `<li><a href="${escAttr(SITE_URL)}${escAttr(publicPathForView(pathToView(item.path).view, locale))}">${escapeHtml(item.title)}</a> — ${escapeHtml(item.desc)}</li>`
                )
                .join("")}</ul>`;
            }
            default:
              return "";
          }
        })
        .join("");
      const useCasesHtml = loc.useCases.length
        ? `<h2>${escapeHtml(t("hub.sectionWhat"))}</h2><ul>${loc.useCases.map(uc => `<li><strong>${escapeHtml(uc.title)}</strong> — ${escapeHtml(uc.desc)}</li>`).join("")}</ul>`
        : "";
      const stepsHtml = loc.steps.length
        ? `<h2>${escapeHtml(t("hub.sectionHow"))}</h2><ol>${loc.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
        : "";
      const faqHtml = loc.faq.length
        ? `<h2>${escapeHtml(t("hub.sectionFaq"))}</h2>${loc.faq.map(f => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("")}`
        : "";
      const relatedHtml = loc.relatedTools.length
        ? `<h2>${escapeHtml(t("hub.sectionRelated"))}</h2><ul>${loc.relatedTools.map(tool => `<li><a href="${escAttr(SITE_URL)}${escAttr(publicPathForView({ type: "tool", id: tool.id }, locale))}">${escapeHtml(tool.name)}</a> — ${escapeHtml(tool.description)}</li>`).join("")}</ul>`
        : "";
      return crumbsLink(loc.breadcrumbs) +
        `<h1>${escapeHtml(h1)}</h1>` +
        `<p>${escapeHtml(loc.intro)}</p>` +
        sectionsHtml +
        useCasesHtml + stepsHtml + faqHtml + relatedHtml +
        `<noscript><p>Each tool on this page requires JavaScript. Local tools run in your browser, and a tool that calls an external service discloses it on its page.</p></noscript>`;
    }
    case "translator-pair": {
      const entry = getTranslatorPair(view.pair);
      if (!entry) return `<h1>Page Not Found</h1>`;
      const source = TRANSLATOR_LANGUAGES[entry.source];
      const target = TRANSLATOR_LANGUAGES[entry.target];
      const meta = buildPageMeta(view);
      const stepsHtml = `<h2>How ${source ? escapeHtml(source.label) : ""}-to-${target ? escapeHtml(target.label) : ""} PDF translation works</h2><ol>${entry.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`;
      const usesHtml = entry.useCases.length
        ? `<h2>Common uses</h2><ul>${entry.useCases.map(u => `<li>${escapeHtml(u)}</li>`).join("")}</ul>`
        : "";
      const faqHtml = entry.faqs.length
        ? `<h2>Frequently Asked Questions</h2>${entry.faqs.map(f => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("")}`
        : "";
      const relatedHtml = `<h2>Other PDF translations</h2><ul>${(entry.related ?? []).filter(slug => getTranslatorPair(slug)).map(slug => `<li><a href="${escAttr(SITE_URL)}/tools/pdf-translator/${escAttr(slug)}">${escapeHtml(pairLabel(getTranslatorPair(slug)!))}</a></li>`).join("")}</ul>`;
      return crumbsLink(meta.breadcrumb) +
        `<h1>${escapeHtml(entry.h1)}</h1>` +
        `<p>${escapeHtml(source ? source.native : "")} ⇄ ${escapeHtml(target ? target.native : "")}</p>` +
        `<p>${escapeHtml(entry.intro)}</p>` +
        stepsHtml + usesHtml + faqHtml + relatedHtml +
        `<p><a href="${escAttr(SITE_URL)}/tools/pdf-translator">Translate any PDF in the PDF Translator</a></p>` +
        `<noscript><p>This translator requires JavaScript. It sends the text extracted from your PDF to a translation service, then rebuilds the translated PDF locally.</p></noscript>`;
    }
    case "comparison-page": {
      const entry = COMPARISON_PAGE_MAP[view.id];
      if (!entry) return `<h1>Page Not Found</h1>`;
      const tableRows = entry.comparisonTable.length
        ? `<h2>Feature Comparison</h2><table border="1" cellpadding="6"><tr><th>Feature</th><th>${escapeHtml(entry.toolA.name)}</th><th>${escapeHtml(entry.toolB.name)}</th></tr>${entry.comparisonTable.map(r => `<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.toolA)}</td><td>${escapeHtml(r.toolB)}</td></tr>`).join("")}</table>`
        : "";
      const decisionHtml = `<h2>Use ${escapeHtml(entry.toolA.name)} when...</h2><p>${escapeHtml(entry.decisionA)}</p><h2>Use ${escapeHtml(entry.toolB.name)} when...</h2><p>${escapeHtml(entry.decisionB)}</p>`;
      const prosHtml = `<h2>Key Advantages</h2><h3>${escapeHtml(entry.toolA.name)}</h3><ul>${entry.toolA.pros.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul><h3>${escapeHtml(entry.toolB.name)}</h3><ul>${entry.toolB.pros.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`;
      const faqHtml = entry.faq.length
        ? `<h2>Frequently Asked Questions</h2>${entry.faq.map(f => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("")}`
        : "";
      const linksHtml = `<h2>Try Each Tool</h2><ul><li><a href="${escAttr(SITE_URL)}${escAttr(entry.toolA.toolPath)}">${escapeHtml(entry.toolA.name)}</a></li><li><a href="${escAttr(SITE_URL)}${escAttr(entry.toolB.toolPath)}">${escapeHtml(entry.toolB.name)}</a></li></ul>`;
      return crumbsLink(entry.breadcrumbs) +
        `<h1>${escapeHtml(entry.toolA.name)} vs ${escapeHtml(entry.toolB.name)}</h1>` +
        `<p>${escapeHtml(entry.intro)}</p>` +
        tableRows + decisionHtml + prosHtml + faqHtml + linksHtml;
    }
    case "category-best": {
      const entry = CATEGORY_BEST_MAP[view.id];
      if (!entry) return `<h1>Page Not Found</h1>`;
      const toolsHtml = `<h2>Top ${entry.tools.length} ${escapeHtml(entry.category)}</h2><ol>${entry.tools.map(t => `<li><a href="${escAttr(SITE_URL)}/tools/${escAttr(t.id)}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)} (Best for: ${escapeHtml(t.bestFor)})</li>`).join("")}</ol>`;
      const faqHtml = entry.faq.length
        ? `<h2>Frequently Asked Questions</h2>${entry.faq.map(f => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("")}`
        : "";
      const guidesHtml = (() => {
        const items = (entry.guides?.items ?? []).filter((item) => {
          const target = pathToView(item.path).view;
          if (target.type !== "blog-article") return true;
          const article = articleBySlug(target.slug);
          return Boolean(article && hasLocalizedArticle(article, locale));
        });
        if (items.length === 0) return "";
        const links = items
          .map(
            (item) =>
              `<a href="${escAttr(SITE_URL)}${escAttr(publicPathForView(pathToView(item.path).view, locale))}"><strong>${escapeHtml(item.title)}</strong></a><span>${escapeHtml(item.desc)}</span>`
          )
          .join("");
        return `<h2>${escapeHtml(entry.guides?.heading ?? "Guides for these tools")}</h2>${links}`;
      })();
      return crumbsLink(entry.breadcrumbs) +
        `<h1>${escapeHtml(entry.title.replace(" | GainUtility", ""))}</h1>` +
        `<p>${escapeHtml(entry.intro)}</p>` +
        toolsHtml + guidesHtml + faqHtml;
    }
    case "notFound":
      return `<h1>404 — Page Not Found</h1><p>The page you requested does not exist.</p><p><a href="${escAttr(SITE_URL)}/">Go to the homepage</a>.</p>`;
    case "color-studio": {
      const sections: Array<[string, string, string]> = [
        ["generator", "Palette Generator", "Shuffle, lock, and edit harmonious color palettes. Generate with Space, lock colors you love, check WCAG contrast, and export CSS variables."],
        ["picker", "Color Picker", "Pick any color and get instant HEX, RGB, HSL values plus a full tonal scale and harmonies. The picked color becomes your studio-wide active color."],
        ["explore", "Explore Palettes", "Browse curated palettes by style (minimal, vibrant, muted, pastel, dark, neon) or every named CSS color organized by family."],
        ["scales", "Tonal Scale", "Generate a professional 50–950 OKLCH scale from any color. Step 500 is your color; every step is perceptually even and copyable."],
        ["colors", "Color Explorer", "Search 140+ named CSS colors by name, hex, or family. Each color opens a full profile with scale, harmonies, and contrast data."],
        ["ui-colors", "UI Color Systems", "Reference color systems from leading products (Spotify, Stripe, GitHub, Figma, etc.) showing how they assign semantic roles."],
        ["visualizer", "UI Visualizer", "Preview any palette on real interface components — buttons, sign-in cards, data tables, dashboards — with live contrast checks."],
        ["contrast", "Contrast Checker", "Verify foreground/background pairs against WCAG AA/AAA. Shared with the site-wide checker for consistent results."],
        ["image", "Image to Palette", "Extract dominant colors from any photo entirely in your browser. Nothing uploaded. Edit and export the result."],
        ["gradients", "Gradient Generator", "Build CSS gradients with multiple stops, angles, and easing. Export ready-to-use CSS."],
      ];
      const sectionHtml = sections
        .map(([id, name, desc]) => `
          <article class="bg-surface-base border border-border-light rounded-2xl p-5 sm:p-6 hover:border-brand-primary/40 hover:shadow-premium-sm transition-all">
            <header class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 class="text-lg sm:text-xl font-sans font-bold text-text-main">${escapeHtml(name)}</h2>
                <p class="text-sm text-text-muted mt-1">${escapeHtml(desc)}</p>
              </div>
              <a href="${escAttr(SITE_URL)}/studios/color/${escAttr(id)}" class="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline cursor-pointer">
                Open <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </header>
          </article>
        `)
        .join("");

      // Featured hero colors
      const heroColorsHtml = HERO_COLORS
        .map((c) => {
          const ink = (() => {
            const r = parseInt(c.hex.slice(1, 3), 16);
            const g = parseInt(c.hex.slice(3, 5), 16);
            const b = parseInt(c.hex.slice(5, 7), 16);
            return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111827" : "#FFFFFF";
          })();
          return `
            <a href="${escAttr(SITE_URL)}/colors/${escAttr(c.slug)}" class="block rounded-2xl overflow-hidden border border-black/10 hover:scale-[1.02] hover:shadow-premium-sm transition-all" style="background-color: ${escapeHtml(c.hex)}">
              <div class="p-4 sm:p-5 flex flex-col items-center">
                <span class="text-sm font-sans font-bold" style="color: ${ink}">${escapeHtml(c.name)}</span>
                <span class="text-[10px] font-mono mt-0.5" style="color: ${ink}; opacity: 0.8">${escapeHtml(c.hex)}</span>
              </div>
            </a>
          `;
        })
        .join("");

      // Featured curated palettes
      const featuredPalettes = CURATED_PALETTES.slice(0, 6);
      const paletteHtml = featuredPalettes
        .map((p) => `
          <a href="${escAttr(SITE_URL)}/color-palettes/${escAttr(p.slug)}" class="text-left rounded-2xl overflow-hidden border border-border-light bg-surface-base hover:shadow-premium-md hover:border-brand-primary/50 transition-all">
            <div class="flex h-20 sm:h-24" style="background: linear-gradient(90deg, ${p.colors.map(c => escapeHtml(c)).join(", ")})"></div>
            <div class="p-4 flex flex-col gap-1.5">
              <h3 class="text-sm font-sans font-bold text-text-main">${escapeHtml(p.name)}</h3>
              <p class="text-xs text-text-muted leading-relaxed line-clamp-2">${escapeHtml(p.use)}</p>
              <span class="self-start mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5">${escapeHtml(p.style)}</span>
            </div>
          </a>
        `)
        .join("");

      const meta = buildPageMeta(view);
      return crumbsLink(meta.breadcrumb) +
        `<section class="rounded-3xl border border-border-light bg-surface-base overflow-hidden mb-8">
          <div class="grid lg:grid-cols-[1.15fr_1fr]">
            <div class="p-6 sm:p-10 flex flex-col gap-5 justify-center">
              <p class="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary">Colors, not mockups</p>
              <h1 class="heading-h1 text-text-main font-sans font-bold text-2xl sm:text-3xl md:text-4xl leading-[1.15] max-w-[16ch]">
                Pick a palette once. <span class="text-brand-primary">Ship it everywhere.</span>
              </h1>
              <p class="text-sm sm:text-base text-text-muted leading-relaxed max-w-[52ch]">
                Generate palettes with real harmonies, verify contrast, preview on actual UI and export clean CSS — all in
                your browser, no accounts, no uploads.
              </p>
              <div class="flex flex-wrap items-center gap-3 pt-1">
                <a href="${escAttr(SITE_URL)}/studios/color/generator" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg> Open the generator
                </a>
                <a href="${escAttr(SITE_URL)}/studios/color/explore" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg> Explore palettes
                </a>
              </div>
            </div>
            <div class="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full">
              <div class="absolute inset-0 grid grid-cols-4 grid-rows-3">
                ${CURATED_PALETTES.slice(0, 6).map((p) => `
                  <div class="flex flex-col">
                    ${p.colors.map((c) => `
                      <div class="flex-1 transition-all hover:flex-[1.6] cursor-pointer" style="background-color: ${escapeHtml(c)}" title="${escapeHtml(p.name)} · ${escapeHtml(c)}" />
                    `).join("")}
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </section>` +
        `<section class="flex flex-col gap-4 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Quick tools
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            ${sections.map(([id, name, desc]) => `
              <a href="${escAttr(SITE_URL)}/studios/color/${escAttr(id)}" class="p-5 rounded-2xl bg-surface-base border border-border-light hover:border-brand-primary/50 hover:shadow-premium-sm transition-all text-left">
                <span class="text-sm font-sans font-bold text-text-main">${escapeHtml(name)}</span>
                <span class="text-xs text-text-muted leading-relaxed block mt-1">${escapeHtml(desc)}</span>
              </a>
            `).join("")}
          </div>
        </section>` +
        `<section class="flex flex-col gap-4 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Color families
            </div>
            <a href="${escAttr(SITE_URL)}/studios/color/colors" class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer">View all <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">${heroColorsHtml}</div>
        </section>` +
        `<section class="flex flex-col gap-4 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg> Featured palettes
            </div>
            <a href="${escAttr(SITE_URL)}/studios/color/explore" class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer">View all <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${paletteHtml}</div>
        </section>` +
        `<section class="bg-surface-base border border-border-light rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 class="text-lg font-sans font-bold text-text-main">Frequently Asked Questions</h2>
          <dl class="space-y-4">
            <div>
              <dt class="font-sans font-bold text-text-main">What is Color Studio?</dt>
              <dd class="text-text-muted leading-relaxed mt-1">A complete browser-based color workspace. Explore named CSS colors, generate harmonious palettes, build tonal scales, check WCAG contrast, preview colors on real UI components, extract palettes from images, and export production-ready tokens — all free, no account required.</dd>
            </div>
            <div>
              <dt class="font-sans font-bold text-text-main">Do I need to create an account?</dt>
              <dd class="text-text-muted leading-relaxed mt-1">No. Everything runs locally in your browser. Your colors and palettes are never uploaded to a server.</dd>
            </div>
            <div>
              <dt class="font-sans font-bold text-text-main">Can I share a palette?</dt>
              <dd class="text-text-muted leading-relaxed mt-1">Yes. Every palette gets a permanent, shareable URL like <code class="text-text-main bg-surface-base px-1 rounded">/color-palettes/2A9D8F-E9C46A...</code> that reconstructs the exact colors, order, and locks.</dd>
            </div>
            <div>
              <dt class="font-sans font-bold text-text-main">What export formats are supported?</dt>
              <dd class="text-text-muted leading-relaxed mt-1">HEX list, CSS variables, SCSS/LESS variables, JSON, Tailwind config, Figma tokens, Design Tokens JSON, and shareable URLs.</dd>
            </div>
            <div>
              <dt class="font-sans font-bold text-text-main">Is Color Studio accessible?</dt>
              <dd class="text-text-muted leading-relaxed mt-1">Yes — built-in WCAG AA/AAA contrast checking, color-blindness simulation (protanopia, deuteranopia, tritanopia, achromatopsia), keyboard navigation, and screen reader support.</dd>
            </div>
          </dl>
        </section>` +
        `<section class="flex flex-col gap-3">
          <h2 class="text-lg font-sans font-bold text-text-main">Related tools</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li><a href="${escAttr(SITE_URL)}/tools/gradient-generator" class="p-4 bg-surface-base border border-border-light rounded-xl hover:border-brand-primary/50 transition-colors"><strong class="text-text-main">Gradient Generator</strong> <span class="text-xs text-text-muted block mt-1">Build CSS gradients with multiple stops</span></a></li>
            <li><a href="${escAttr(SITE_URL)}/tools/contrast-checker" class="p-4 bg-surface-base border border-border-light rounded-xl hover:border-brand-primary/50 transition-colors"><strong class="text-text-main">Contrast Checker</strong> <span class="text-xs text-text-muted block mt-1">Standalone WCAG contrast verification</span></a></li>
            <li><a href="${escAttr(SITE_URL)}/tools/color-picker" class="p-4 bg-surface-base border border-border-light rounded-xl hover:border-brand-primary/50 transition-colors"><strong class="text-text-main">Color Picker</strong> <span class="text-xs text-text-muted block mt-1">Standalone color picker with scales</span></a></li>
            <li><a href="${escAttr(SITE_URL)}/tools/image-to-palette" class="p-4 bg-surface-base border border-border-light rounded-xl hover:border-brand-primary/50 transition-colors"><strong class="text-text-main">Image to Palette</strong> <span class="text-xs text-text-muted block mt-1">Extract colors from photos</span></a></li>
          </ul>
        </section>` +
        `<p class="text-xs text-text-muted leading-relaxed max-w-[70ch]">
          All processing is client-side. Palette pages like
          <a href="${escAttr(SITE_URL)}/color-palettes/ocean-depths" class="text-brand-primary hover:underline cursor-pointer font-medium">
            /color-palettes/ocean-depths
          </a>
          are public and crawlable, so your palettes are linkable, citable and shareable.
        </p>`;
    }
    case "color-page": {
      const meta = buildPageMeta(view);
      const inkFor = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111827" : "#FFFFFF";
      };
      const contrastRatio = (hexA: string, hexB: string): number => {
        const luminance = (hex: string): number => {
          const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          if (!rgb) return 0;
          const [r, g, b] = [1, 2, 3].map((i) => parseInt(rgb[i], 16) / 255);
          const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };
        const l1 = luminance(hexA);
        const l2 = luminance(hexB);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };
      const formatRatio = (ratio: number): string => ratio.toFixed(2);
      const wcagGrade = (ratio: number): string => ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail";

      if (view.kind === "color") {
        const info = resolveColorToken(view.id);
        if (info) {
          const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
          const scale = generateScale(info.hex) as Record<number, string>;
          const scaleHtml = scaleSteps
            .map((s) => {
              const hex = scale[s];
              return hex
                ? `<li class="flex items-center gap-2"><span class="w-6 h-6 rounded-md border border-black/10" style="background-color:${escapeHtml(hex)}"></span><code class="font-mono text-sm">${s}: ${escapeHtml(hex)}</code></li>`
                : "";
            })
            .join("");

          // Harmonies
          const hsl = (() => {
            const rgb = hexToRgb ? hexToRgb(info.hex) : null;
            if (!rgb) return null;
            let { r, g, b } = rgb;
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            const d = max - min;
            if (d !== 0) {
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
              }
              h *= 60;
            }
            return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
          })();

          const harmonyNames = ["complementary", "analogous", "triadic", "split-complementary", "tetradic", "monochromatic"];
          const harmonyHtml = harmonyNames.map((name) => {
            const colors = getHarmonyColors(info.hex, name);
            return `
              <div class="bg-surface-base border border-border-light rounded-xl p-3">
                <h4 class="text-sm font-bold text-text-main mb-2 capitalize">${name.replace("-", " ")}</h4>
                <div class="flex flex-wrap gap-1.5">${colors.map((c, i) => `
                  <button class="w-8 h-8 rounded-lg border border-black/10 hover:scale-110 transition-transform" style="background-color:${escapeHtml(c)}" title="${escapeHtml(c)}" aria-label="Copy ${escapeHtml(c)}"></button>
                `).join("")}</div>
              </div>
            `;
          }).join("");

          // Contrast
          const whiteRatio = contrastRatio(info.hex, "#FFFFFF");
          const blackRatio = contrastRatio(info.hex, "#000000");
          const contrastHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-xl bg-surface-base border border-border-light p-4">
                <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">On white</p>
                <p class="text-2xl font-mono font-extrabold text-text-main">${formatRatio(whiteRatio)}:1</p>
                <span class="inline-block mt-1 text-[11px] font-bold ${whiteRatio >= 7 ? "text-status-success" : whiteRatio >= 4.5 ? "text-brand-primary" : "text-status-error"}">${wcagGrade(whiteRatio)} ${whiteRatio >= 4.5 ? "Pass" : "Fail"}</span>
              </div>
              <div class="rounded-xl bg-surface-base border border-border-light p-4">
                <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">On black</p>
                <p class="text-2xl font-mono font-extrabold text-text-main">${formatRatio(blackRatio)}:1</p>
                <span class="inline-block mt-1 text-[11px] font-bold ${blackRatio >= 7 ? "text-status-success" : blackRatio >= 4.5 ? "text-brand-primary" : "text-status-error"}">${wcagGrade(blackRatio)} ${blackRatio >= 4.5 ? "Pass" : "Fail"}</span>
              </div>
            </div>
          `;

          // Color blindness simulation
          const cbModes = ["protan", "deutan", "tritan", "achroma"];
          const cbLabels = { protan: "Protanopia (red-blind)", deutan: "Deuteranopia (green-blind)", tritan: "Tritanopia (blue-blind)", achroma: "Achromatopsia (monochrome)" };
          const cbHtml = cbModes.map((mode) => {
            const simulated = simulateColorBlindness(info.hex, mode);
            return `
              <div class="rounded-xl bg-surface-base border border-border-light p-3 text-center">
                <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">${escapeHtml(cbLabels[mode as keyof typeof cbLabels])}</p>
                <div class="w-16 h-16 mx-auto rounded-lg border border-black/10" style="background-color:${escapeHtml(simulated)}"></div>
                <p class="text-[10px] font-mono mt-1 text-text-sub">${escapeHtml(simulated)}</p>
              </div>
            `;
          }).join("");

          // Related colors (same family)
          const relatedColors = HERO_COLORS.filter((h) => h.family === info.family).slice(0, 6);
          const relatedHtml = relatedColors.length > 0
            ? `<h3 class="text-lg font-bold text-text-main mb-3">Related ${info.family} colors</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">${relatedColors.map((c) => `
                <a href="${escAttr(SITE_URL)}/colors/${escAttr(c.slug)}" class="rounded-xl overflow-hidden border border-black/10 hover:scale-[1.02] transition-all" style="background-color:${escapeHtml(c.hex)}">
                  <div class="p-3 text-center">
                    <span class="text-sm font-bold" style="color:${inkFor(c.hex)}">${escapeHtml(c.name)}</span>
                    <span class="text-[10px] font-mono block mt-0.5" style="color:${inkFor(c.hex)};opacity:0.8">${escapeHtml(c.hex)}</span>
                  </div>
                </a>
              `).join("")}</div>`
            : "";

          const namedMatch = NAMED_COLORS.find((c) => c.hex.toUpperCase() === info.hex.toUpperCase());
          const cssName = namedMatch ? namedMatch.name : "Custom";

          return crumbsLink(meta.breadcrumb) +
            `<div class="grid lg:grid-cols-[300px_1fr] gap-6 mb-8">
              <!-- Hero swatch -->
              <div>
                <a href="${escAttr(SITE_URL)}/studios/color/generator#${escAttr(info.hex.slice(1))}" class="block rounded-3xl overflow-hidden border border-black/10 hover:opacity-95 transition-opacity" style="height: 260px; background-color: ${escapeHtml(info.hex)}" aria-label="Open ${escapeHtml(info.name)} in palette generator">
                  <span class="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                    <span class="text-left">
                      <span class="block text-[11px] font-mono font-bold uppercase" style="color: ${inkFor(info.hex)}; opacity: 0.85">${escapeHtml(info.family)} family</span>
                      <span class="block text-2xl font-sans font-bold" style="color: ${inkFor(info.hex)}">${escapeHtml(info.name)}</span>
                    </span>
                    <span class="text-sm font-mono font-bold" style="color: ${inkFor(info.hex)}">${escapeHtml(info.hex)}</span>
                  </span>
                </a>
                <div class="mt-3 space-y-1.5 rounded-2xl border border-border-light bg-surface-base">
                  <div class="p-3 border-b border-border-light flex items-center justify-between gap-2"><span class="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">HEX</span><code class="text-sm font-mono text-text-main">${escapeHtml(info.hex)}</code><button class="text-brand-primary text-sm font-bold hover:underline" aria-label="Copy HEX">Copy</button></div>
                  ${hsl ? `<div class="p-3 border-b border-border-light flex items-center justify-between gap-2"><span class="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">RGB</span><code class="text-sm font-mono text-text-main">${hslToRgbString(info.hex)}</code><button class="text-brand-primary text-sm font-bold hover:underline" aria-label="Copy RGB">Copy</button></div>` : ""}
                  ${hsl ? `<div class="p-3 flex items-center justify-between gap-2"><span class="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">HSL</span><code class="text-sm font-mono text-text-main">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</code><button class="text-brand-primary text-sm font-bold hover:underline" aria-label="Copy HSL">Copy</button></div>` : ""}
                  <div class="p-3 flex items-center justify-between gap-2"><span class="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">CSS Name</span><code class="text-sm font-mono text-text-main">${escapeHtml(cssName)}</code></div>
                </div>
              </div>

              <!-- Details -->
              <div class="flex flex-col gap-6">
                <div>
                  <p class="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary mb-1">${escapeHtml(info.name)} · ${escapeHtml(info.hex)}</p>
                  <h1 class="heading-h1 text-text-main font-sans font-bold text-2xl sm:text-3xl">${escapeHtml(info.name)} Color — #${escapeHtml(info.hex.slice(1).toUpperCase())}</h1>
                  <p class="text-text-muted mt-1">The full profile: tonal scale, harmonies, contrast against black and white, and ready-to-use CSS.</p>
                  <div class="flex flex-wrap gap-2 mt-4">
                    <a href="${escAttr(SITE_URL)}/studios/color/generator#${escAttr(info.hex.slice(1))}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold">Build a palette from ${escapeHtml(info.name)}</a>
                    <a href="${escAttr(SITE_URL)}/studios/color/colors" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary">All colors</a>
                  </div>
                </div>

                ${contrastHtml}

                <!-- Harmonies -->
                <div>
                  <p class="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-2">Harmonies</p>
                  <p class="text-text-muted text-sm mb-3">Palettes built around this color</p>
                  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${harmonyHtml}</div>
                </div>

                <!-- Color Blindness -->
                <div>
                  <p class="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-2">Color blindness simulation</p>
                  <p class="text-text-muted text-sm mb-3">How this color appears under common color vision deficiencies</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${cbHtml}</div>
                </div>
              </div>
            </div>

            <!-- Tonal Scale -->
            <section class="mb-8">
              <p class="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-2">Scale</p>
              <h2 class="text-xl font-bold text-text-main mb-3">${escapeHtml(info.name)} — full tonal scale</h2>
              <p class="text-text-muted text-sm mb-4">50 to 950 in OKLCH; step 500 is the source color.</p>
              <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">${scaleHtml}</ul>
            </section>

            ${relatedHtml}

            <!-- FAQ -->
            <section class="bg-surface-base border border-border-light rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 class="text-lg font-sans font-bold text-text-main">Frequently Asked Questions</h2>
              <dl class="space-y-4">
                <div><dt class="font-sans font-bold text-text-main">What is ${escapeHtml(info.name)}?</dt><dd class="text-text-muted leading-relaxed mt-1">${escapeHtml(info.name)} (${escapeHtml(info.hex)}) is a ${info.family} family color. Use it for ${escapeHtml(info.family)} accents, backgrounds, or UI elements.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">What are good color pairings?</dt><dd class="text-text-muted leading-relaxed mt-1">Try complementary (${escapeHtml(getHarmonyColors(info.hex, "complementary")[1])}), analogous, or triadic harmonies. For UI, pair with white or black based on the contrast ratios shown above.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">Is it accessible for text?</dt><dd class="text-text-muted leading-relaxed mt-1">On white: ${formatRatio(whiteRatio)}:1 (${wcagGrade(whiteRatio)}). On black: ${formatRatio(blackRatio)}:1 (${wcagGrade(blackRatio)}). Use the passing combination for body text.</dd></div>
              </dl>
            </section>`;
        }
      }
      if (view.kind === "palette") {
        const p = resolvePaletteToken(view.id);
        if (p) {
          const paletteHtml = p.colors.map((c, i) => `
            <li class="rounded-xl overflow-hidden border border-black/10" style="background-color: ${escapeHtml(c)}">
              <div class="p-4 flex flex-col items-center">
                <span class="text-sm font-bold" style="color:${inkFor(c)}">Color ${i + 1}</span>
                <span class="text-[11px] font-mono mt-0.5" style="color:${inkFor(c)};opacity:0.8">${escapeHtml(c.toUpperCase())}</span>
              </div>
            </li>
          `).join("");

          const roleHtml = ["Primary", "Accent", "Background", "Surface", "Text"].map((role, i) => {
            const color = p.colors[i] ?? p.colors[0];
            return `<div class="rounded-xl bg-surface-base border border-border-light p-3"><span class="text-xs font-bold text-text-muted uppercase tracking-wider">${role}</span><div class="flex items-center gap-2 mt-1"><span class="w-6 h-6 rounded border border-black/10" style="background-color:${escapeHtml(color)}"></span><code class="font-mono text-sm">${escapeHtml(color.toUpperCase())}</code></div></div>`;
          }).join("");

          const whiteContrast = contrastRatio(p.colors[0], "#FFFFFF");
          const blackContrast = contrastRatio(p.colors[0], "#000000");

          return crumbsLink(meta.breadcrumb) +
            `<div class="rounded-3xl border border-border-light bg-surface-base overflow-hidden mb-6">
              <div class="flex h-28 sm:h-36" style="background: linear-gradient(90deg, ${p.colors.map(c => escapeHtml(c)).join(", ")})"></div>
              <div class="p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div class="flex flex-col gap-1.5">
                  <h1 class="heading-h1 text-text-main font-sans font-bold text-xl sm:text-2xl">${escapeHtml(p.name)}</h1>
                  ${p.use ? `<p class="text-sm text-text-muted">${escapeHtml(p.use)}</p>` : ""}
                  ${p.desc ? `<p class="text-xs text-text-muted/80 max-w-[62ch] leading-relaxed">${escapeHtml(p.desc)}</p>` : ""}
                  ${p.style ? `<span class="self-start mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5">${escapeHtml(p.style)}</span>` : ""}
                </div>
                <div class="flex flex-col gap-2 shrink-0">
                  <a href="${escAttr(SITE_URL)}/studios/color/generator#${escAttr(paletteSlug(p.colors))}" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] text-sm font-bold">Open in generator</a>
                  <button class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-sm font-bold text-text-main hover:text-brand-primary">Copy all hexes</button>
                </div>
              </div>
            </div>

            <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">${paletteHtml}</ul>

            <div class="grid sm:grid-cols-2 gap-3 mb-6">
              <div class="rounded-2xl bg-surface-base border border-border-light p-4">
                <p class="font-sans font-bold text-text-muted mb-1.5 uppercase tracking-wider text-[10px]">Suggested roles</p>
                <div class="space-y-2">${roleHtml}</div>
              </div>
              <div class="rounded-2xl bg-surface-base border border-border-light p-4">
                <p class="font-sans font-bold text-text-muted mb-1.5 uppercase tracking-wider text-[10px]">First color contrast</p>
                <p class="text-sm font-mono font-bold text-text-main">${formatRatio(whiteContrast)}:1 <span class="ml-2 text-[11px] ${whiteContrast >= 7 ? "text-status-success" : whiteContrast >= 4.5 ? "text-brand-primary" : "text-status-error"}">${wcagGrade(whiteContrast)} ${whiteContrast >= 4.5 ? "Pass" : "Fail"}</span></p>
              </div>
            </div>

            <section class="bg-surface-base border border-border-light rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 class="text-lg font-sans font-bold text-text-main">Frequently Asked Questions</h2>
              <dl class="space-y-4">
                <div><dt class="font-sans font-bold text-text-main">How do I use this palette?</dt><dd class="text-text-muted leading-relaxed mt-1">Open it in the <a href="${escAttr(SITE_URL)}/studios/color/generator#${escAttr(paletteSlug(p.colors))}" class="text-brand-primary hover:underline">generator</a> to lock colors, generate variations, check contrast, and export CSS variables.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">Can I share this palette?</dt><dd class="text-text-muted leading-relaxed mt-1">Yes — this page has a permanent URL. The palette is also encoded in the generator URL for instant loading.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">Is this palette accessible?</dt><dd class="text-text-muted leading-relaxed mt-1">Check the contrast of your specific pairings. The first color on white is ${formatRatio(whiteContrast)}:1 (${wcagGrade(whiteContrast)}). Test all text/background combinations in the Contrast Checker.</dd></div>
              </dl>
            </section>`;
        }
      }
      if (view.kind === "ui-color") {
        const s = resolveUiColorSystem(view.id);
        if (s) {
          const rolesHtml = s.colors.map((r) => `
            <div class="rounded-xl border border-border-light bg-surface-base p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <span class="shrink-0 w-28 text-xs font-bold font-sans text-text-main">${escapeHtml(r.role)}</span>
              <div class="flex-1 rounded-lg px-3 py-2 text-[10px] font-mono border border-black/10" style="background-color: ${escapeHtml(r.color)}; color: ${inkFor(r.color)}">
                ${escapeHtml(r.color)} — ${escapeHtml(r.note)}
              </div>
              <button class="shrink-0 text-[10px] font-bold text-brand-primary hover:underline" aria-label="Copy ${escapeHtml(r.color)}">Copy</button>
            </div>
          `).join("");

          return crumbsLink(meta.breadcrumb) +
            `<div class="rounded-3xl border border-border-light bg-surface-base overflow-hidden mb-6">
              <div class="flex h-20 sm:h-28" style="background: linear-gradient(90deg, ${s.colors.map(c => escapeHtml(c.color)).join(", ")})"></div>
              <div class="p-5 sm:p-6 flex flex-col gap-2">
                <span class="self-start text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5">${escapeHtml(s.type)}</span>
                <h1 class="heading-h1 text-text-main font-sans font-bold text-xl sm:text-2xl">${escapeHtml(s.name)}</h1>
                <p class="text-sm text-text-muted max-w-[62ch]">${escapeHtml(s.desc)}</p>
                <p class="text-xs text-text-muted/80 max-w-[62ch]">${escapeHtml(s.usage)}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-brand-primary/25 bg-brand-primary-light/50 p-3.5 text-xs sm:text-[13px] text-text-sub leading-relaxed mb-6">
              <strong>Reference values.</strong> Colors below are approximate reconstructions from public screenshots and documentation. GAINUTILITY is not affiliated with ${escapeHtml(s.name)}. Do not reuse another brand's colors verbatim in your own product.
            </div>

            <div class="flex flex-col gap-2 mb-6">
              <p class="text-xs font-mono font-bold uppercase tracking-wider text-text-muted mb-2">Color roles</p>
              <p class="text-text-muted text-sm">${s.colors.length} roles with representative values.</p>
              <div class="space-y-1.5">${rolesHtml}</div>
            </div>

            <section class="bg-surface-base border border-border-light rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 class="text-lg font-sans font-bold text-text-main">Frequently Asked Questions</h2>
              <dl class="space-y-4">
                <div><dt class="font-sans font-bold text-text-main">Is this the official ${escapeHtml(s.name)} color system?</dt><dd class="text-text-muted leading-relaxed mt-1">No — these are approximate reference values reconstructed from public sources. They are not official brand assets.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">Can I use these colors in my product?</dt><dd class="text-text-muted leading-relaxed mt-1">Please do not reuse another brand's colors verbatim. Use this as inspiration to build your own semantic color system.</dd></div>
                <div><dt class="font-sans font-bold text-text-main">How do I build a similar system?</dt><dd class="text-text-muted leading-relaxed mt-1">Start with a primary color, generate a tonal scale, then assign semantic roles (primary, surface, text, border, success, warning, error). The Color Studio generator and scale tools can help.</dd></div>
              </dl>
            </section>`;
        }
      }
      return `<h1>Color — Page Not Found</h1><p><a href="${escAttr(SITE_URL)}/">Go to the homepage</a>.</p>`;
    }
    case "blog-article": {
      const a = articleBySlug(view.slug);
      if (!a) return `<h1>Page Not Found</h1>`;
      // Transparent star for drop-shadow vs box-shadow demos (alpha shape).
      const starImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='%23D97A3F' d='M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z'/></svg>";
      const body = a.content
        .map((b) => {
          const head = b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : "";
          const paras = (b.paragraphs ?? []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
          const list = b.list ? `<ul>${b.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>` : "";
          const steps = b.steps ? `<ol>${b.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` : "";
          const tool = b.tool
            ? `<p>${escapeHtml(b.tool.label)} <a href="${escAttr(SITE_URL)}${escAttr(publicPathForView({ type: "tool", id: b.tool.toolId as never }, locale))}">${escapeHtml(localizedToolName(b.tool.toolId as never, locale, toolsRegistry[b.tool.toolId as keyof typeof toolsRegistry]?.name ?? b.tool.toolId))}</a></p>`
            : "";
          const pageLink = b.pageLink
            ? (() => {
                const target = pathToView(b.pageLink!.path).view;
                return `<p>${escapeHtml(b.pageLink!.label)} <a href="${escAttr(SITE_URL)}${escAttr(publicPathForView(target, locale))}">${escapeHtml(b.pageLink!.text ?? b.pageLink!.path)}</a></p>`;
              })()
            : "";
          const externalLinks = (b.externalLinks ?? [])
            .map(
              (l) =>
                `<p><a href="${escAttr(l.href)}" rel="noopener noreferrer" target="_blank">${escapeHtml(l.text ?? l.href)}</a></p>`
            )
            .join("");
          const code = b.code
            ? `${b.code.label ? `<p><strong>${escapeHtml(b.code.label)}</strong></p>` : ""}<pre><code>${escapeHtml(b.code.content)}</code></pre>`
            : "";
          const demo = b.shadowDemo
            ? (() => {
                const d = b.shadowDemo!;
                const css = `${d.property}: ${d.value};`;
                const stage = d.stageBg ?? "#F4F6F2";
                const visual = d.star
                  ? `<img src="${escAttr(starImg)}" alt="" width="64" height="64" style="${d.property === "filter" ? `filter:${escAttr(d.value)}` : `box-shadow:${escAttr(d.value)}`}">`
                  : d.property === "text-shadow"
                    ? `<span style="font-size:30px;font-weight:700;color:${d.stageBg ? "#F2F4EF" : "#20262E"};text-shadow:${escAttr(d.value)}">${escapeHtml(d.text ?? "Shadow")}</span>`
                    : `<span style="display:inline-block;width:160px;height:80px;background:${escAttr(d.boxBg ?? "#ffffff")};border-radius:${d.radius ?? 16}px;box-shadow:${escAttr(d.value)}"></span>`;
                return `<figure><figcaption>${escapeHtml(d.label)}</figcaption><div style="display:flex;height:128px;align-items:center;justify-content:center;background:${escAttr(stage)};border:1px solid #E4E7E0;border-radius:12px;overflow:hidden">${visual}</div><pre><code>${escapeHtml(css)}</code></pre></figure>`;
              })()
            : "";
          const table = b.table
            ? (() => {
                const head = `<tr>${b.table!.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
                const rows = b.table!.rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
                return `<table><thead>${head}</thead><tbody>${rows}</tbody></table>${b.table!.caption ? `<p>${escapeHtml(b.table!.caption)}</p>` : ""}`;
              })()
            : "";
          // `figure` blocks are React-rendered charts; they hydrate after mount.
          return `<div>${head}${paras}${list}${steps}${code}${demo}${table}${tool}${pageLink}${externalLinks}</div>`;
        })
        .join("");
      const related = a.relatedArticles
        .map((slug) => articleBySlug(slug))
        .filter((r): r is NonNullable<typeof r> => Boolean(r))
        .map((r) => `<li><a href="${escAttr(SITE_URL)}/blog/${escAttr(r.slug)}">${escapeHtml(r.title)}</a></li>`)
        .join("");
      return `<h1>${escapeHtml(a.title)}</h1>` +
        `<p>${escapeHtml(a.seoDescription)}</p>` +
        body +
        `<p><a href="${escAttr(SITE_URL)}/blog">Back to all articles</a></p>` +
        (related ? `<h2>Related articles</h2><ul>${related}</ul>` : "");
    }
    case "about": {
      // Static pre-hydration copy of the live AboutPage (src/components/AboutPage.tsx).
      const bulletKeys = [
        "about.bullet1",
        "about.bullet2",
        "about.bullet3",
        "about.bullet4",
        "about.bullet5",
        "about.bullet6",
      ] as const;
      const valKeys = ["value1", "value2", "value3", "value4"] as const;
      const bulletItems = bulletKeys
        .map((k) => `<li class="about-feature-item"><span class="about-feature-bullet" aria-hidden="true"></span><span>${escapeHtml(pageText(k, locale))}</span></li>`)
        .join("");
      const valCards = valKeys
        .map((k) => `
          <div class="about-value-card">
            <h3 class="about-value-title">${escapeHtml(pageText(`about.${k}.title`, locale))}</h3>
            <p class="about-value-body">${escapeHtml(pageText(`about.${k}.body`, locale))}</p>
          </div>
        `)
        .join("");
      return `
<article class="about-page" itemscope itemtype="https://schema.org/AboutPage">
  <header class="about-topbar">
    ${crumbsLink([
      { name: t("crumbsHome", locale), url: `${SITE_URL}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}` },
      { name: pageText("about.crumbTitle", locale), url: `${SITE_URL}${locale === DEFAULT_LOCALE ? "/about" : `/${locale}/about`}` }
    ])}
    <div class="about-meta">
      <time datetime="2026-09">${escapeHtml(pageText("about.updated", locale))}</time>
    </div>
  </header>
  <section class="about-hero" aria-labelledby="about-hero-title">
    <p class="about-eyebrow">${escapeHtml(pageText("about.eyebrow", locale))}</p>
    <h1 id="about-hero-title" class="about-display" itemprop="name">${escapeHtml(pageText("about.heroHeading", locale))}</h1>
    <div class="about-lead-measure">
      <p class="about-lead-p">${escapeHtml(pageText("about.heroP1", locale))}</p>
      <p class="about-body">${escapeHtml(pageText("about.heroP2", locale))}</p>
    </div>
  </section>
  <section class="about-editorial-section" aria-labelledby="about-reason-heading">
    <h2 id="about-reason-heading" class="about-h2">${escapeHtml(pageText("about.reasonHeading", locale))}</h2>
    <div class="about-measure">
      <p class="about-body">${escapeHtml(pageText("about.reasonP1", locale))}</p>
      <p class="about-body">${escapeHtml(pageText("about.reasonP2", locale))}</p>
    </div>
  </section>
  <section class="about-editorial-section" aria-labelledby="about-what-heading">
    <h2 id="about-what-heading" class="about-h2">${escapeHtml(pageText("about.whatHeading", locale))}</h2>
    <div class="about-measure">
      <p class="about-body">${escapeHtml(pageText("about.whatP1", locale))}</p>
      <ul class="about-feature-list" role="list">${bulletItems}</ul>
    </div>
  </section>
  <section class="about-builder-section" aria-labelledby="about-person-heading">
    <div class="about-builder-marker" aria-hidden="true"><span class="about-builder-dot"></span></div>
    <div class="about-builder-content">
      <h2 id="about-person-heading" class="about-builder-title">${escapeHtml(pageText("about.personHeading", locale))}</h2>
      <p class="about-builder-body">${escapeHtml(pageText("about.personP1", locale))}</p>
    </div>
  </section>
  <section class="about-editorial-section" aria-labelledby="about-values-heading">
    <h2 id="about-values-heading" class="about-h2">${escapeHtml(pageText("about.valuesHeading", locale))}</h2>
    <div class="about-values-grid">${valCards}</div>
  </section>
  <section class="about-editorial-section" aria-labelledby="about-not-heading">
    <h2 id="about-not-heading" class="about-h2">${escapeHtml(pageText("about.notHeading", locale))}</h2>
    <div class="about-measure">
      <p class="about-body">${escapeHtml(pageText("about.notP1", locale))}</p>
    </div>
  </section>
  <section class="about-closing-section" aria-labelledby="about-closing-heading">
    <div class="about-closing-rule" aria-hidden="true"></div>
    <h2 id="about-closing-heading" class="about-closing-title">${escapeHtml(pageText("about.closingHeading", locale))}</h2>
    <p class="about-closing-body">${escapeHtml(pageText("about.closingBody", locale))}</p>
    <div class="about-cta-container">
      <a href="${escAttr(SITE_URL)}/tools" class="about-cta-btn">
        <span>${escapeHtml(pageText("about.cta", locale))}</span>
      </a>
    </div>
  </section>
</article>`;
    }
    case "blog": {
      // Static pre-hydration copy of the live BlogPage (src/components/BlogPage.tsx),
      // derived from the SAME registry (src/blog/blogData.ts). Real titles, excerpts,
      // dates and reading times; article discovery uses plain <a href> links so the
      // index is crawlable even before React mounts (which then re-renders the page).
      const section = (title: string, arts: Array<(typeof BLOG_ARTICLES)[number]>) => {
        if (!arts.length) return "";
        const rows = arts.map((a) =>
          `<article class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-x-10 gap-y-3 py-7 border-t border-border-light first:border-t-0">
              <div class="min-w-0">
                <h3 class="blog-article-title">
                  <a class="text-left hover:text-brand-primary transition-colors" href="${escAttr(SITE_URL)}/blog/${escAttr(a.slug)}">${escapeHtml(a.title)}</a>
                </h3>
                <p class="mt-2 blog-body text-text-muted blog-measure leading-relaxed">${escapeHtml(a.description)}</p>
              </div>
              <div class="md:w-52 md:text-right flex md:flex-col md:items-end gap-3 md:gap-4 items-center justify-between flex-wrap min-w-0">
                <p class="blog-meta">${escapeHtml(a.readingTime)}<span class="mx-1.5 text-text-disabled" aria-hidden="true">&middot;</span>${escapeHtml(formatDate(a.date))}</p>
                <a class="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-brand-primary hover:text-brand-primary-hover" href="${escAttr(SITE_URL)}/blog/${escAttr(a.slug)}">Read post &rarr;</a>
              </div>
            </article>`
        ).join("");
        return `<section class="border-b border-border-light">
          <div class="mb-2 flex items-end justify-between gap-4"><h2 class="blog-section-title">${escapeHtml(title)}</h2></div>
          <div>${rows}</div>
        </section>`;
      };
      return `
<div class="blog-type blog-container blog-flow">
  <div class="mt-1">
    ${crumbsLink([{ name: "Home", url: `${SITE_URL}/` }, { name: "Blog", url: `${SITE_URL}/blog` }])}
  </div>
  <header class="border-b border-border-light pb-10">
    <h1 class="blog-display">Practical guides for getting things done.</h1>
    <p class="mt-5 blog-body text-text-muted blog-measure">
      How to use our tools, fix common file problems, and get better results from everyday browser utilities.
    </p>
  </header>
  ${section("PDF", articlesByCategory("PDF"))}
  ${section("Images", articlesByCategory("Images"))}
  ${section("SEO", articlesByCategory("SEO"))}
  ${section("Developer", articlesByCategory("Developer"))}
  ${section("Productivity", articlesByCategory("Productivity"))}
  <section class="pb-8">
    <p class="blog-body text-text-muted">
      Prefer to jump straight in? <a class="blog-link" href="${escAttr(SITE_URL)}/">Browse all GainUtility tools</a>.
    </p>
  </section>
</div>`;
    }
    case "tools-directory": {
      const sections = TOOLS_DIRECTORY_SECTIONS.filter((s) => toolsInSection(s).length > 0);
      const chips = sections
        .map((s) => `<a href="#${s.id}-tools">${escapeHtml(s.label)}</a>`)
        .join("");
      const bodies = sections
        .map((s) => {
          const tools = toolsInSection(s);
          const hub = s.hubPath
            ? `<a href="${escAttr(SITE_URL)}${escAttr(s.hubPath)}">${escapeHtml(s.label)} guide</a> &middot; `
            : "";
          const list = tools
            .map(
              (id) =>
                `<li><a href="${escAttr(SITE_URL)}${escAttr(publicPathForView({ type: "tool", id }, locale))}">${escapeHtml(localizedToolName(id, locale, toolsRegistry[id]?.name ?? id))}</a></li>`
            )
            .join("");
          return (
            `<section id="${s.id}-tools">` +
            `<h2>${escapeHtml(s.label)}</h2>` +
            `<p><strong>${tools.length} ${tools.length === 1 ? "tool" : "tools"}</strong> &middot; ${hub}<a href="${escAttr(SITE_URL)}/tools#${s.id}-tools">Jump to section</a></p>` +
            `<p>${escapeHtml(s.blurb)}</p>` +
            `<ul>${list}</ul>` +
            `</section>`
          );
        })
        .join("");
      return (
        crumbsLink([
          { name: "Home", url: `${SITE_URL}/` },
          { name: "All Tools", url: `${SITE_URL}/tools` },
        ]) +
        `<h1>All free online tools</h1>` +
        `<p>Browse all ${TOTAL_TOOL_COUNT} free, browser-based utilities on ${BRAND_NAME}, grouped by category. No sign-up, nothing to install — every tool processes your work on your device.</p>` +
        `<nav aria-label="Tool categories"><ul>${chips}</ul></nav>` +
        bodies +
        `<noscript><p>Each tool on this page requires JavaScript. Local tools run in your browser, and a tool that calls an external service discloses it on its page.</p></noscript>`
      );
    }
    case "library-page": {
      // Static pre-hydration shell for /names and /symbols library pages —
      // real crawlable content (h1, intro, items, child/related links, FAQ)
      // before React mounts; createRoot rebuilds the same page on mount.
      const entry = LIBRARY_PAGE_MAP[view.id];
      if (!entry) return "";
      const items: string[] =
        entry.kind === "hub"
          ? []
          : entry.sourceType === "names"
          ? (entry.sourceId && NAME_LIST_BY_ID[entry.sourceId]?.items) || []
          : (entry.sourceId && SYMBOL_COLLECTION_BY_ID[entry.sourceId]?.items) || [];
      const children = (entry.children ?? [])
        .map(
          (c) =>
            `<li><a href="${escAttr(SITE_URL)}${escAttr(c.path)}">${escapeHtml(c.label)}</a> — ${escapeHtml(c.desc)}</li>`
        )
        .join("");
      const itemHtml = items.length
        ? `<p>Click any ${entry.sourceType === "symbols" ? "symbol" : "name"} in the live page to copy it:</p><ul>${items
            .map((it) => `<li>${escapeHtml(it)}</li>`)
            .join("")}</ul>`
        : "";
      const related = entry.related
        .map(
          (r) =>
            `<li><a href="${escAttr(SITE_URL)}${escAttr(r.path)}">${escapeHtml(r.label)}</a> — ${escapeHtml(r.desc)}</li>`
        )
        .join("");
      const faq = entry.faq
        .map(
          (f) =>
            `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`
        )
        .join("");
      return (
        crumbsLink(
          entry.breadcrumbs.map((c) => ({
            name: c.name,
            url: c.url.startsWith("/") ? `${SITE_URL}${c.url}` : c.url,
          }))
        ) +
        `<h1>${escapeHtml(entry.h1)}</h1>` +
        `<p>${escapeHtml(entry.intro)}</p>` +
        itemHtml +
        (children ? `<h2>Browse the lists</h2><ul>${children}</ul>` : "") +
        `<h2>Related pages</h2><ul>${related}</ul>` +
        `<h2>Frequently Asked Questions</h2>` +
        faq +
        `<p><a href="${escAttr(SITE_URL)}/tools/stylish-name-generator">Open the free Stylish Name Generator</a></p>`
      );
    }
    case "audit": {
      const meta = buildPageMeta(view);
      return (
        crumbsLink(meta.breadcrumb) +
        `<h1>${escapeHtml(meta.title.replace(` — ${BRAND_NAME}`, ""))}</h1>` +
        `<p>${escapeHtml(meta.description)}</p>` +
        `<h2>What each row records</h2>` +
        `<p>Every tool on the site gets one row. The table is generated from the same registry the pages are rendered from, so it reflects what is live rather than a list someone maintains by hand.</p>` +
        `<ul>` +
        `<li><strong>Indexability</strong> — INDEX when the page is meant to be discoverable, NOINDEX when it is deliberately kept out of the index.</li>` +
        `<li><strong>Content depth</strong> — how much explanatory copy sits on the page alongside the controls.</li>` +
        `<li><strong>Privacy model</strong> — Client-Side when a file is processed in your browser; where a tool calls an outside service, that service is named on the tool page itself.</li>` +
        `<li><strong>Category and studio</strong> — which section of the site the tool belongs to, so a whole category can be read at once.</li>` +
        `</ul>` +
        `<h2>How to use the table</h2>` +
        `<p>Filter by category or by indexability, search for a tool by name, and export the filtered rows as a CSV if you want to keep a copy or work through them offline.</p>` +
        `<h2>What this audit does not claim</h2>` +
        `<p>It records structure and settings: what is published, what is excluded, and how each tool handles a file. It does not measure rankings, traffic, click-through rates or a third-party score, and no row should be read as a grade.</p>` +
        `<p><a href="${escAttr(SITE_URL)}${escAttr("/tools")}">Browse all tools</a> &middot; <a href="${escAttr(SITE_URL)}${escAttr("/blog")}">Read the guides</a></p>`
      );
    }
    default: {
      const meta = buildPageMeta(view);
      return crumbsLink(meta.breadcrumb) +
        `<h1>${escapeHtml(meta.title.replace(` — ${BRAND_NAME}`, ""))}</h1><p>${escapeHtml(meta.description)}</p>`;
    }
  }
  })();
  return siteHeader() + pageBody;
};

/* ------------------------------------------------------------------ */
/* Head assembly — mirrors Layout's SEO effect exactly                 */
/* ------------------------------------------------------------------ */

const jsonLdFor = (view: ViewState, locale: LocaleCode = DEFAULT_LOCALE): Record<string, unknown>[] | null => {
  const meta = buildPageMeta(view, locale);
  if (view.type === "home") {
    return [
      buildWebSiteJsonLd(),
      buildOrganizationJsonLd(),
      buildFAQJsonLd(meta.faqs),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (view.type === "studio") {
    return [
      buildStudioJsonLd(view.id, locale),
      buildPageBreadcrumbJsonLd(meta),
      buildFAQJsonLd(meta.faqs),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (view.type === "tool") {
    return [
      buildToolJsonLd(view.id, locale),
      buildPageBreadcrumbJsonLd(meta),
      buildFAQJsonLd(meta.faqs),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (view.type === "seo-page") {
    const entry = SEO_PAGE_MAP[view.id];
    if (entry) {
      const loc = localizedSeoEntry(entry, locale);
      return [
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(loc.faq),
        // Matches the extra schema Layout emits for the image hub.
        view.id === "image" ? buildImageHubJsonLd(meta) : null,
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "translator-pair") {
    const entry = getTranslatorPair(view.pair);
    if (entry) {
      return [
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(entry.faqs),
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "comparison-page") {
    const entry = COMPARISON_PAGE_MAP[view.id];
    if (entry) {
      return [
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(entry.faq),
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "category-best") {
    const entry = CATEGORY_BEST_MAP[view.id];
    if (entry) {
      return [
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(entry.faq),
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "library-page") {
    const entry = LIBRARY_PAGE_MAP[view.id];
    if (entry) {
      return [
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(entry.faq),
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "blog-article") {
    if (articleBySlug(view.slug)) {
      return [
        buildBlogPostingJsonLd(view.slug, locale),
        buildHowToJsonLd(view.slug, locale),
        buildPageBreadcrumbJsonLd(meta),
      ].filter(Boolean) as Record<string, unknown>[];
    }
  }
  if (view.type === "blog") {
    return [
      buildBlogCollectionJsonLd(locale),
      buildPageBreadcrumbJsonLd(meta),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (view.type === "about") {
    return [
      buildAboutPageJsonLd(meta),
      buildPageBreadcrumbJsonLd(meta),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (view.type === "faq") {
    return [
      buildPageBreadcrumbJsonLd(meta),
      buildFAQJsonLd(meta.faqs),
    ].filter(Boolean) as Record<string, unknown>[];
  }
  if (!meta.noindex && meta.breadcrumb.length > 1) {
    return [buildPageBreadcrumbJsonLd(meta)];
  }
  return null;
};

export interface AssetTags {
  /** stylesheet / modulepreload / font links emitted by vite */
  headAssets: string;
  /** the bundled module script tag emitted by vite */
  bodyAssets: string;
}

export const generatePages = (
  assets: AssetTags
): Array<{ route: string; html: string }> => {
  const routes: string[] = [
    "/",
    ...Object.keys(STATIC_PATHS).filter((p) => p !== "/"),
    ...Object.keys(toolsRegistry).map((id) => `/tools/${id}`),
    ...TRANSLATOR_PAIR_SLUGS.map((slug) => `/tools/pdf-translator/${slug}`),
    ...SEO_PAGES.map((p) => p.path),
    ...COMPARISON_PAGES.map((p) => p.path),
    ...CATEGORY_BEST_PAGES.map((p) => p.path),
    // Library hubs (/names, /symbols) come from STATIC_PATHS; add children only
    ...ALL_LIBRARY_PATHS.filter((p) => !(p in STATIC_PATHS)),
    // Color Studio: workspace sections + deep links
    ...["generator", "picker", "explore", "scales", "colors", "ui-colors", "visualizer", "contrast", "image", "gradients"].map(
      (s) => `/studios/color/${s}`
    ),
    // Named + hero colors (slugified; deduped in case two names share a slug)
    ...[...new Set([...NAMED_COLORS, ...HERO_COLORS].map((c) => colorSlug(c.name)))]
      .map((slug) => `/colors/${slug}`),
    // Curated palettes (slug = cur-<index>) + two shareable encoded chains
    ...CURATED_PALETTES.map((p) => `/color-palettes/${p.slug}`),
    "/color-palettes/2A9D8F-E9C46A-283618-FEFAE0-DDA15E",
    "/color-palettes/8338EC-FF006E-3A86FF-FB5607-FFBE0B",
    // UI color system references
    ...UI_COLOR_SYSTEMS.map((s) => `/ui-colors/${s.id}`),
    // Blog: index + every published article (all derived from the registry)
    "/blog",
    ...BLOG_ARTICLES.map((a) => `/blog/${a.slug}`),
  ];

  const pages: Array<{ route: string; html: string }> = [];

  const document = (view: ViewState, locale: LocaleCode = DEFAULT_LOCALE): string => {
    const meta = buildPageMeta(view, locale);
    const jsonld = jsonLdFor(view, locale);
    const jsonldTag = jsonld
      ? `<script id="seo-jsonld" type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>`
      : "";
    const loc = localeByCode(locale) ?? localeByCode(DEFAULT_LOCALE)!;
    // A noindex document must not advertise a hreflang cluster. es-CO is the
    // only noindex locale today; without this guard it emits a full cluster
    // that omits its own language and makes the whole cluster ineligible.
    const hreflangTag = meta.noindex
      ? ""
      : buildHreflangForView(
          view,
          SITE_URL,
          (code: string): string => viewToPath(view, code as LocaleCode)
        )
          .map(
            (h) => `<link rel="alternate" hreflang="${escAttr(h.hreflang)}" href="${escAttr(h.href)}" />`
          )
          .join("\n");
    // One source of truth: every SSR_VIEW_TYPES route (home, about, services,
    // blog, blog-article and the lazy-bodied tool/studio/color routes) is
    // server-rendered from the REAL React tree and marked `data-gu-ssr="1"`,
    // so main.tsx hydrates it in place (real localized chrome/content at first
    // paint, no DOM tear-down). Static content routes (category hub pages,
    // legal/utility pages) emit their full localized static shell via
    // `bodyContent`, which createRoot rebuilds on mount.
    const useRealTree = SSR_VIEW_TYPES.has(view.type);
    const rootOpen = useRealTree
      ? `<div id="root"${SSR_ROOT_ATTR}>`
      : `<div id="root">`;
    const rootBody = useRealTree
      ? renderRouteSSR(view, locale)
      : bodyContent(view, locale);
    const themeScript = `<script>
(function() {
  try {
    var theme = localStorage.getItem('premium-suite-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || (!theme && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-[#F7F8F4]', 'text-[#172015]');
      document.body.classList.add('bg-[#0D110D]', 'text-[#F4F7F2]');
    }
  } catch (e) {}
})();
</script>`;

    const fontPreloads = `
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600&display=swap">`;

    return `<!doctype html>
<html lang="${escAttr(loc.htmlLang)}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(meta.title)}</title>
<meta name="description" content="${escAttr(meta.description)}" />
<meta name="robots" content="${meta.noindex ? "noindex, follow" : "index, follow"}" />
<link rel="canonical" href="${escAttr(meta.canonical)}" />
${hreflangTag}
<meta name="theme-color" content="#D97A3F" />
<meta property="og:site_name" content="${escAttr(BRAND_NAME)}" />
<meta property="og:type" content="${meta.ogType}" />
<meta property="og:locale" content="${escAttr(loc.ogLocale)}" />
<meta property="og:title" content="${escAttr(meta.title)}" />
<meta property="og:description" content="${escAttr(meta.description)}" />
<meta property="og:url" content="${escAttr(meta.canonical)}" />
<meta property="og:image" content="${escAttr(SITE_URL)}/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(meta.title)}" />
<meta name="twitter:description" content="${escAttr(meta.description)}" />
<meta name="twitter:image" content="${escAttr(SITE_URL)}/og-image.png" />
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="application-name" content="GainUtility" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="GainUtility" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="application/rss+xml" title="GainUtility Blog" href="${SITE_URL}/feed.xml" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
${assets.headAssets}
${jsonldTag}
${fontPreloads}
${themeScript}
</head>
<body class="bg-[#F7F8F4] text-[#172015] selection:bg-[#D97A3F] selection:text-white antialiased min-h-screen">
${rootOpen}${rootBody}</div>
${assets.bodyAssets}
</body>
</html>`;
  };

  // Resolve a base view once per base route; reuse across locales.
  const viewsByBase = new Map<string, ViewState>();
  const addView = (base: string, view: ViewState | null) => {
    if (view) viewsByBase.set(base, view);
  };

  for (const route of routes) {
    let view: ViewState;
    if (route === "/") view = { type: "home" };
    else if (route === "/studios/color" || route.startsWith("/studios/color/")) {
      const section = route.slice("/studios/color/".length) || "home";
      const known = ["generator", "picker", "explore", "scales", "colors", "ui-colors", "visualizer", "contrast", "image", "gradients"];
      if (section === "home") view = { type: "color-studio", section: "home" };
      else if (known.includes(section)) {
        view = { type: "color-studio", section: section as ColorStudioSectionId };
      } else continue;
    } else if (route.startsWith("/colors/")) {
      const token = route.slice("/colors/".length);
      if (resolveColorToken(token)) view = { type: "color-page", kind: "color", id: token };
      else continue;
    } else if (route.startsWith("/color-palettes/")) {
      const token = route.slice("/color-palettes/".length);
      if (resolvePaletteToken(token)) view = { type: "color-page", kind: "palette", id: token };
      else continue;
    } else if (route.startsWith("/ui-colors/")) {
      const token = route.slice("/ui-colors/".length);
      if (resolveUiColorSystem(token)) view = { type: "color-page", kind: "ui-color", id: token };
      else continue;
    } else if (route.startsWith("/tools/pdf-translator/")) {
      const slug = route.slice("/tools/pdf-translator/".length);
      if (getTranslatorPair(slug)) view = { type: "translator-pair", pair: slug };
      else continue;
    } else if (route.startsWith("/tools/")) view = { type: "tool", id: route.slice(7) } as ViewState;
    else if (route.startsWith("/studios/")) view = { type: "studio", id: route.slice(9) };
    else if (route.startsWith("/compare/")) {
      const slug = route.slice("/compare/".length);
      if (COMPARISON_PAGE_MAP[slug]) view = { type: "comparison-page", id: slug };
      else continue;
    } else if (route.startsWith("/blog/")) {
      const slug = route.slice("/blog/".length);
      if (articleBySlug(slug)) view = { type: "blog-article", slug };
      else continue;
    } else if (CATEGORY_BEST_MAP[route]) {
      view = { type: "category-best", id: CATEGORY_BEST_MAP[route].slug };
    } else if (LIBRARY_PAGE_MAP[route]) {
      view = { type: "library-page", id: LIBRARY_PAGE_MAP[route].slug };
    } else {
      const staticEntry = STATIC_PATHS[route];
      if (staticEntry) {
        view = staticEntry as unknown as ViewState;
      } else {
        const seoEntry = SEO_PAGE_MAP[route];
        if (seoEntry) {
          view = { type: "seo-page", id: seoEntry.slug };
        } else {
          continue;
        }
      }
    }
    addView(route, view);
  }

  // Emit every base route. Non-genuine views (English-authored tool pages,
  // sub-pages, studio/color workspace pages, translator pairs, comparisons,
  // category-best, legal/contact) are emitted ONCE for the default locale only;
  // genuinely localized views (home/about/blog + localized articles,
  // wired tools, localized hubs) additionally emit one file per locale. The
  // output route (and every localized internal link) is derived via the same
  // routing helpers the sitemap uses, so the generated file matches its own
  // canonical and no fake localized URL is ever produced.
  for (const base of viewsByBase.keys()) {
    const view = viewsByBase.get(base)!;
    for (const locale of ALL_LOCALES) {
      if (!isLocalizedView(view, locale)) continue;
      const outputRoute = viewToPath(view, locale);
      pages.push({ route: outputRoute, html: document(view, locale) });
    }
  }

  // 404 shell
  pages.push({ route: "/404", html: document({ type: "notFound" }, DEFAULT_LOCALE) });
  return pages;
};
