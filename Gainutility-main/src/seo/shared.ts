/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for per-route metadata and JSON-LD. Used both by
 * the live app (Layout SEO effect) and the Node prerender script, so this
 * module must stay free of DOM/browser APIs.
 */

import { SEOMetadata, ToolId, ViewState } from "../types";
import { toolsRegistry } from "../toolsRegistry";
import { STUDIOS, StudioInfo } from "../studiosData";
import {
  BRAND_NAME,
  SITE_URL,
  OG_IMAGE_PATH,
  absoluteUrl,
  toolPath,
  studioPath,
} from "../site";
import { getSEOMetadata } from "../data";
import { IMAGE_HUB_TOOLS } from "../imageHubData";
import { pathToView, viewToPath } from "../router";
import { applyLocale, localizedHomePath } from "../i18n";
import { DEFAULT_LOCALE } from "../i18n/locales";
import { localizedToolSlug, localizedToolName, localizedStudioName, localizedHome } from "../i18n/slugs";
import { getLocalizedSeo } from "../i18n/seo";
import { pageText, homeFaqs } from "../i18n/pages";
import { isLocalizedView } from "../i18n/pages";
import { getAllFaqEntries } from "../i18n/faqData";

/**
 * Localized canonical path for a (view, locale): the genuine localized URL
 * when the view is genuinely localized for that locale, otherwise the English
 * URL. Guarantees a page never canonicals to a fake localized URL (a route
 * that is routed but not emitted/translated for that locale).
 */
const publicPathForLocale = (view: ViewState, locale: string, enPath: string): string =>
  isLocalizedView(view, locale) ? applyLocale(enPath, locale) : enPath;

/**
 * Localized URL for a breadcrumb path: the localized URL only when the view
 * that specific path routes to is genuinely localized for that locale. A crumb
 * must never point at a localized URL the build does not emit — e.g. the /media
 * hub is English-only, so the localized /id/video-downloader page links to the
 * English /media hub, never a non-existent /id/media.
 */
export const localizedCrumbPath = (locale: string, enUrl: string): string => {
  if (enUrl.startsWith("//") || !enUrl.startsWith("/")) return enUrl;
  const r = pathToView(enUrl);
  if (!r || r.view.type === "notFound") return enUrl;
  return publicPathForLocale(r.view, locale, enUrl);
};
import { articleLocalized } from "../blog/blogData";
import { SEO_PAGE_MAP, localizedSeoEntry } from "./seoPageContent";
import { COMPARISON_PAGE_MAP, CATEGORY_BEST_MAP } from "./comparisonPages";
import { LIBRARY_PAGE_MAP } from "./libraryPages";
import { BLOG_SLUG_TO_ARTICLE, BLOG_ARTICLES } from "../blog/blogData";
import {
  resolveColorToken,
  resolvePaletteToken,
  resolveUiColorSystem,
} from "../colorStudio/colorData";
import {
  getTranslatorPair,
  pairLabel,
  translatorPairPath,
  TRANSLATOR_PAIR_SLUGS,
} from "./translatorPairs";

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  noindex: boolean;
  /** Breadcrumb trail derived from the route (never stored metadata). */
  breadcrumb: Array<{ name: string; url: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const ogImageUrl = (): string => absoluteUrl(OG_IMAGE_PATH);

/** Homepage FAQ — single source of truth moved to the page-content model. */
export { HOME_FAQS } from "../i18n/pages";

/* ------------------------------------------------------------------ */
/* Static page metadata                                                */
/* ------------------------------------------------------------------ */

const STATIC_PAGES: Record<
  string,
  { title: string; description: string }
> = {
  "/tools": {
    title: `All Free Online Tools — Browse 140+ Utilities | ${BRAND_NAME}`,
    description:
      "Browse every free GainUtility tool by category: PDF, image, developer, JSON, SEO, design and media. No sign-up, nothing to install, all in your browser.",
  },
  "/about": {
    title: `About ${BRAND_NAME} — Our Mission & Privacy-First Approach`,
    description:
      "Learn why GainUtility builds fast, private, browser-based utilities. Processing happens on your device, and tools that call an external service say so on their page.",
  },
  "/privacy": {
    title: `Privacy Policy — ${BRAND_NAME}`,
    description:
      "How GainUtility handles (and mostly never touches) your data: local processing, no accounts, no file uploads, minimal analytics.",
  },
  "/terms": {
    title: `Terms of Service — ${BRAND_NAME}`,
    description:
      "The terms governing your use of GainUtility's free online tools and content.",
  },
  "/security": {
    title: `Security Overview — ${BRAND_NAME}`,
    description:
      "How GainUtility protects visitors: HTTPS-only delivery, client-side processing, no file storage, and transparent practices.",
  },
  "/cookies": {
    title: `Cookie Policy — ${BRAND_NAME}`,
    description:
      "Which cookies GainUtility sets, why, and how to control them in your browser.",
  },
  "/contact": {
    title: `Contact Us — ${BRAND_NAME}`,
    description:
      "Get in touch with the GainUtility team for feedback, bug reports, or partnership questions.",
  },
  "/changelog": {
    title: `Changelog — ${BRAND_NAME}`,
    description:
      "A public, honest record of every change shipped to GainUtility: fixes, launches, and product improvements, with real dates.",
  },
  "/site-audit": {
    title: `SEO & Accessibility Audit Report — ${BRAND_NAME}`,
    description:
      "A transparent technical audit of gainutility.com covering performance, accessibility, structured data, and crawlability.",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const trimDesc = (text: string, max = 158): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:-]+$/, "")}…`;
};

/** The studio whose tools list contains the given id, if any. */
export const owningStudio = (toolId: ToolId): StudioInfo | undefined =>
  STUDIOS.find((s) => s.tools.includes(toolId));

const registryFallbackSEO = (toolId: ToolId): SEOMetadata => {
  const meta = toolsRegistry[toolId];
  const name = meta?.name ?? toolId;
  const base = meta?.desc ?? `Free ${name.toLowerCase()} tool you can use in your browser.`;
  return {
    title: `${name} — Free Online Tool`,
    description: trimDesc(`${base} No sign-up required.`),
    canonicalUrl: absoluteUrl(toolPath(toolId)),
    ogType: "website",
    breadcrumb: [
      { name: "Home", url: absoluteUrl("/") },
      { name, url: absoluteUrl(toolPath(toolId)) },
    ],
    faqs: [],
    related: [],
    detailedContent: {
      whatText: "",
      whyText: "",
      features: [],
      steps: [],
      examples: [],
      mistakes: [],
    },
  };
};

/* ------------------------------------------------------------------ */
/* Merged tool SEO                                                     */
/* ------------------------------------------------------------------ */

/**
 * Full SEO metadata for a tool page. Combines the rich hand-written
 * registry (src/data.ts), the supplemental entries (src/seo/*.ts merged
 * inside data.ts), and finally a unique safety-net built from the tool
 * registry so every one of the 140 tools has distinct meta.
 */
export const getMergedSEO = (toolId: ToolId): SEOMetadata =>
  getSEOMetadata(toolId, SITE_URL) ?? registryFallbackSEO(toolId);

/* ------------------------------------------------------------------ */
/* Route-level metadata                                                */
/* ------------------------------------------------------------------ */

const computePageMeta = (view: ViewState, L: string): PageMeta => {
  switch (view.type) {
    case "home": {
      return {
        title: pageText("home.seoTitle", L),
        description: trimDesc(pageText("home.seoDescription", L)),
        canonical: absoluteUrl(localizedHomePath(L)),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: homeFaqs(L),
      };
    }

    case "tool": {
      const seo = getMergedSEO(view.id);
      const meta = toolsRegistry[view.id];
      const englishName = meta?.name ?? view.id;
      const studio = owningStudio(view.id);
      // Resolve a fully localized SEO record for non-default locales.
      const locSeo = L === DEFAULT_LOCALE ? null : getLocalizedSeo(view.id, L, englishName);
      const slug = localizedToolSlug(view.id, L, view.id);
      const subPath = `/tools/${slug}`;
      const path = publicPathForLocale(view, L, subPath);
      const displayName = locSeo?.h1 || englishName;
      const crumb: Array<{ name: string; url: string }> = [
        { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
      ];
      // Breadcrumb to the studio's SEO hub page when one exists (the legacy
      // /studios/* routes redirect to home, so point at the crawlable hub
      // instead, e.g. /image for image tools). Studios without a hub keep a
      // clean Home → tool trail.
      const hubPath = studio ? studioToHubPath(studio.id) : null;
      if (studio && hubPath) {
        // Keep the JSON-LD crumb identical to the visible breadcrumb the page
        // renders: both lead to the same crawlable hub (e.g. /image), and both
        // use the same label ("Image Tools") so crawlers and users see one trail.
        const hub = seoHubForTool(view.id);
        crumb.push({
          name: hub?.label ?? localizedStudioName(studio.id, L, studio.name),
          url: absoluteUrl(
            publicPathForLocale(
              { type: "studio", id: studio.id } as ViewState,
              L,
              hubPath
            )
          ),
        });
      } else {
        // Studios without a hub (creator, security, converter) still get a
        // crawlable middle crumb when a direct hub mapping exists (e.g.
        // /creator for the stylish name generator), matching the visible
        // breadcrumb which always resolves via seoHubForTool.
        const hub = seoHubForTool(view.id);
        if (hub) {
          crumb.push({ name: hub.label, url: absoluteUrl(hub.path) });
        }
      }
      crumb.push({
        name: displayName,
        url: absoluteUrl(path),
      });
      return {
        title: locSeo ? locSeo.title : seo.title,
        description: locSeo ? locSeo.metaDescription : seo.description,
        canonical: absoluteUrl(path),
        ogType: "website",
        noindex: false,
        breadcrumb: crumb,
        faqs: locSeo ? locSeo.faqs : (seo.faqs ?? []),
      };
    }

    case "studio": {
      const s = STUDIOS.find((x) => x.id === view.id);
      const name = localizedStudioName(view.id, L, s?.name ?? "Studio");
      const count = s?.tools.length ?? 0;
      const path = publicPathForLocale(view, L, studioPath(view.id));
      return {
        title: `${name} — ${count} Free Online Tools`,
        description: trimDesc(
          s?.longDesc ??
            s?.desc ??
            `Explore the ${name} collection of free browser-based tools on ${BRAND_NAME}.`
        ),
        canonical: absoluteUrl(path),
        ogType: "website",
        noindex: false,
        breadcrumb: [
          { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
          { name, url: absoluteUrl(path) },
        ],
        faqs: s?.faqs ?? [],
      };
    }

    case "seo-page": {
      const entry = SEO_PAGE_MAP[view.id];
      if (entry) {
        const loc = localizedSeoEntry(entry, L);
        return {
          title: loc.title,
          description: loc.description,
          canonical: absoluteUrl(publicPathForLocale(view, L, entry.path)),
          ogType: "website",
          noindex: false,
          breadcrumb: loc.breadcrumbs.map((c) => ({
            name: c.name,
            url: absoluteUrl(c.url),
          })),
          faqs: loc.faq,
        };
      }
      return {
        title: `${view.id} — ${BRAND_NAME}`,
        description: `Free online ${view.id} tools on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, `/${view.id}`)),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    case "translator-pair": {
      const entry = getTranslatorPair(view.pair);
      if (entry) {
        const path = publicPathForLocale(view, L, translatorPairPath(entry.slug));
        return {
          title: entry.title,
          description: entry.description,
          canonical: absoluteUrl(path),
          ogType: "website",
          noindex: false,
          breadcrumb: [
            { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
            { name: "PDF Translator", url: absoluteUrl(publicPathForLocale({ type: "tool", id: "pdf-translator" } as ViewState, L, toolPath("pdf-translator"))) },
            { name: pairLabel(entry), url: absoluteUrl(path) },
          ],
          faqs: entry.faqs,
        };
      }
      return {
        title: `PDF Translator — ${BRAND_NAME}`,
        description: `Translate PDFs between languages on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, toolPath("pdf-translator"))),
        ogType: "website",
        noindex: true,
        breadcrumb: [
          { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
          { name: "PDF Translator", url: absoluteUrl(publicPathForLocale(view, L, toolPath("pdf-translator"))) },
        ],
        faqs: [],
      };
    }

    case "comparison-page": {
      const entry = COMPARISON_PAGE_MAP[view.id];
      if (entry) {
        return {
          title: entry.title,
          description: entry.description,
          canonical: absoluteUrl(publicPathForLocale(view, L, entry.path)),
          ogType: "website",
          noindex: false,
          breadcrumb: entry.breadcrumbs.map((c) => ({
            name: c.name,
            url: absoluteUrl(localizedCrumbPath(L, c.url)),
          })),
          faqs: entry.faq,
        };
      }
      return {
        title: `Comparison — ${BRAND_NAME}`,
        description: `Tool comparison on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, "/compare")),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    case "category-best": {
      const entry = CATEGORY_BEST_MAP[view.id];
      if (entry) {
        return {
          title: entry.title,
          description: entry.description,
          canonical: absoluteUrl(publicPathForLocale(view, L, entry.path)),
          ogType: "website",
          noindex: false,
          breadcrumb: entry.breadcrumbs.map((c) => ({
            name: c.name,
            url: absoluteUrl(localizedCrumbPath(L, c.url)),
          })),
          faqs: entry.faq,
        };
      }
      return {
        title: `Best Tools — ${BRAND_NAME}`,
        description: `Best tools on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, "/best")),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    case "library-page": {
      const entry = LIBRARY_PAGE_MAP[view.id];
      if (entry) {
        return {
          title: entry.title,
          description: entry.description,
          canonical: absoluteUrl(publicPathForLocale(view, L, entry.path)),
          ogType: "website",
          noindex: false,
          breadcrumb: entry.breadcrumbs.map((c) => ({
            name: c.name,
            url: absoluteUrl(localizedCrumbPath(L, c.url)),
          })),
          faqs: entry.faq,
        };
      }
      return {
        title: `Library — ${BRAND_NAME}`,
        description: `Curated name and symbol lists on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, `/${view.id}`)),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    case "notFound": {
      return {
        title: pageText("notFound.seoTitle", L),
        description: trimDesc(pageText("notFound.seoDescription", L)),
        canonical: absoluteUrl(publicPathForLocale(view, L, "/404")),
        ogType: "website",
        noindex: true,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    case "blog": {
      return {
        title: pageText("blog.seoTitle", L),
        description: trimDesc(pageText("blog.seoDescription", L)),
        canonical: absoluteUrl(publicPathForLocale(view, L, "/blog")),
        ogType: "website",
        noindex: false,
        breadcrumb: [
          { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
          { name: pageText("blog.crumbTitle", L), url: absoluteUrl(publicPathForLocale(view, L, "/blog")) },
        ],
        faqs: [],
      };
    }

    case "blog-article": {
      const article = BLOG_SLUG_TO_ARTICLE[view.slug];
      if (article) {
        const loc = articleLocalized(article, L);
        const path = publicPathForLocale(view, L, `/blog/${article.slug}`);
        return {
          title: loc.seoTitle,
          description: trimDesc(loc.seoDescription),
          canonical: absoluteUrl(path),
          ogType: "article",
          noindex: false,
          breadcrumb: [
            { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
            { name: pageText("blog.crumbTitle", L), url: absoluteUrl(publicPathForLocale(view, L, "/blog")) },
            { name: loc.title, url: absoluteUrl(path) },
          ],
          faqs: [],
        };
      }
      return {
        title: `Article — ${BRAND_NAME}`,
        description: `An article on ${BRAND_NAME}.`,
        canonical: absoluteUrl(publicPathForLocale(view, L, `/blog/${view.slug}`)),
        ogType: "article",
        noindex: false,
        breadcrumb: [
          { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
          { name: "Blog", url: absoluteUrl(publicPathForLocale(view, L, "/blog")) },
        ],
        faqs: [],
      };
    }

    case "color-studio": {
      const path = viewToPath(view);
      const labels: Record<string, { title: string; desc: string }> = {
        home: {
          title: `Color Studio — Generate, Explore & Preview Palettes | ${BRAND_NAME}`,
          desc: trimDesc(
            "Generate color palettes with smart harmonies, explore curated palettes and named CSS colors, check WCAG contrast, preview colors on real UI and extract palettes from photos — all in your browser."
          ),
        },
        generator: {
          title: `Color Palette Builder — Free Online | ${BRAND_NAME}`,
          desc: trimDesc(
            "Build harmonious color palettes in your browser: shuffle, lock what you love, edit by HEX or HSL, check WCAG contrast and export CSS variables."
          ),
        },
        picker: {
          title: `Color Picker — Free Online | ${BRAND_NAME}`,
          desc: trimDesc(
            "Pick, format and inspect any color in your browser. The picked color becomes the studio's active color and flows through scales, harmonies and the visualizer."
          ),
        },
        explore: {
          title: `Explore Curated Color Palettes | ${BRAND_NAME}`,
          desc: trimDesc(
            "Browse curated color palettes by style — minimal, vibrant, muted, pastel, dark and neon. Each palette has a public, crawlable page with UI previews."
          ),
        },
        scales: {
          title: `Tonal Scale — 50 to 950 Color Scale | ${BRAND_NAME}`,
          desc: trimDesc(
            "Build an OKLCH tonal scale from 50 to 950 for any color, with step 500 as the anchor. Copy hex values, CSS variables and OKLCH channels for any step."
          ),
        },
        colors: {
          title: `Color Explorer — Every Named CSS Color | ${BRAND_NAME}`,
          desc: trimDesc(
            "Find any named CSS color, organized by family, with search. Click a swatch to copy its hex or open its full profile: scale, harmonies and contrast."
          ),
        },
        "ui-colors": {
          title: `UI Color Systems — Reference Palettes | ${BRAND_NAME}`,
          desc: trimDesc(
            "Reference color systems reconstructed from public screenshots — how leading products assign primary, accent, surface and text colors."
          ),
        },
        visualizer: {
          title: `UI Visualizer — Preview Palettes on Real Interfaces | ${BRAND_NAME}`,
          desc: trimDesc(
            "Role-map any palette onto buttons, a sign-in card, a data table and a dashboard, with literal CSS previews and WCAG contrast checks."
          ),
        },
        contrast: {
          title: `WCAG Contrast Checker | ${BRAND_NAME}`,
          desc: trimDesc(
            "Check foreground/background pairs against WCAG AA and AAA contrast ratios, directly inside the Color Studio workflow."
          ),
        },
        image: {
          title: `Image to Palette — Extract Colors from Photos | ${BRAND_NAME}`,
          desc: trimDesc(
            "Drop a photo and extract its dominant colors into a palette. Processing happens entirely on your device; nothing is uploaded."
          ),
        },
        gradients: {
          title: `CSS Gradient Generator | ${BRAND_NAME}`,
          desc: trimDesc(
            "Tune angle, stops and blending for production CSS gradients, and copy the generated styles for buttons, headers and backgrounds."
          ),
        },
      };
      const meta = labels[view.section] ?? labels.home;
      const crumb: Array<{ name: string; url: string }> = [
        { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
        { name: "Color Studio", url: absoluteUrl(publicPathForLocale(view, L, "/studios/color")) },
      ];
      if (view.section !== "home") {
        crumb.push({ name: meta.title.split(" — ")[0], url: absoluteUrl(publicPathForLocale(view, L, path)) });
      }
      return {
        title: meta.title,
        description: meta.desc,
        canonical: absoluteUrl(publicPathForLocale(view, L, path)),
        ogType: "website",
        noindex: false,
        breadcrumb: crumb,
        faqs: [],
      };
    }

    case "color-page": {
      const path = publicPathForLocale(view, L, viewToPath(view));
      if (view.kind === "color") {
        const info = resolveColorToken(view.id);
        if (info) {
          return {
            title: `${info.name} #${info.hex.slice(1)} — CSS Named Color Reference | ${BRAND_NAME}`,
            description: trimDesc(
              `${info.name} (#${info.hex.slice(1)}) — a ${info.family} family color. See its 50–950 tonal scale, harmonies, WCAG contrast on black and white, and related colors.`
            ),
            canonical: absoluteUrl(path),
            ogType: "website",
            noindex: false,
            breadcrumb: [
              { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
              { name: "Color Studio", url: absoluteUrl(publicPathForLocale(view, L, "/studios/color")) },
              { name: info.name, url: absoluteUrl(path) },
            ],
            faqs: [],
          };
        }
      }
      if (view.kind === "palette") {
        const p = resolvePaletteToken(view.id);
        if (p) {
          return {
            title: `${p.name} — ${p.colors.length}-Color Palette | ${BRAND_NAME}`,
            description: trimDesc(
              `${p.name}: ${p.colors.join(", ")}. A ${p.use ? p.use.toLowerCase() : "curated"} palette with UI preview, harmony extensions and one-click copy.`
            ),
            canonical: absoluteUrl(path),
            ogType: "website",
            noindex: false,
            breadcrumb: [
              { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
              { name: "Color Studio", url: absoluteUrl(publicPathForLocale(view, L, "/studios/color")) },
              { name: p.name, url: absoluteUrl(path) },
            ],
            faqs: [],
          };
        }
      }
      if (view.kind === "ui-color") {
        const s = resolveUiColorSystem(view.id);
        if (s) {
          return {
            title: `${s.name} Color System — Reference Palette | ${BRAND_NAME}`,
            description: trimDesc(
              `How ${s.name} structures color: ${s.colors.length} roles with representative values. Approximate reference values from public screenshots — not an official brand asset.`
            ),
            canonical: absoluteUrl(path),
            ogType: "website",
            noindex: false,
            breadcrumb: [
              { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
              { name: "Color Studio", url: absoluteUrl(publicPathForLocale(view, L, "/studios/color")) },
              { name: s.name, url: absoluteUrl(path) },
            ],
            faqs: [],
          };
        }
      }
      return {
        title: `Color — ${BRAND_NAME}`,
        description: `A color page on ${BRAND_NAME}.`,
        canonical: absoluteUrl(path),
        ogType: "website",
        noindex: false,
        breadcrumb: [{ name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) }],
        faqs: [],
      };
    }

    default: {
      // Static pages keyed by their route path.
      const path = publicPathForLocale(view, L, viewToPath(view));
      const statik =
        STATIC_PAGES[viewToPath(view)] ?? STATIC_PAGES[`/${view.type}`] ?? null;
      const label = viewToPath(view) === "/" ? "Home" : viewToPath(view).slice(1).replace(/-/g, " ");
      const pageMeta =
        view.type === "about"
          ? { title: pageText("about.seoTitle", L), description: pageText("about.seoDescription", L) }
          : view.type === "faq"
          ? { title: pageText("faq.seoTitle", L), description: pageText("faq.seoDescription", L) }
          : view.type === "contact"
          ? { title: pageText("contact.seoTitle", L), description: pageText("contact.seoDescription", L) }
          : view.type === "privacy"
          ? { title: pageText("privacy.seoTitle", L), description: pageText("privacy.seoDescription", L) }
          : view.type === "terms"
          ? { title: pageText("terms.seoTitle", L), description: pageText("terms.seoDescription", L) }
          : view.type === "security"
          ? { title: pageText("security.seoTitle", L), description: pageText("security.seoDescription", L) }
          : view.type === "cookies"
          ? { title: pageText("cookies.seoTitle", L), description: pageText("cookies.seoDescription", L) }
          : null;

      const crumbName =
        view.type === "about"
          ? pageText("about.crumbTitle", L)
          : view.type === "faq"
          ? pageText("faq.crumbTitle", L)
          : view.type === "contact"
          ? pageText("contact.crumbTitle", L)
          : view.type === "privacy"
          ? pageText("privacy.crumbTitle", L)
          : view.type === "terms"
          ? pageText("terms.crumbTitle", L)
          : view.type === "security"
          ? pageText("security.crumbTitle", L)
          : view.type === "cookies"
          ? pageText("cookies.crumbTitle", L)
          : label.replace(/^\w/, (c) => c.toUpperCase());

      const faqs = view.type === "faq" ? getAllFaqEntries(L) : [];

      return {
        title: pageMeta?.title ?? statik?.title ?? `${label.replace(/^\w/, (c) => c.toUpperCase())} — ${BRAND_NAME}`,
        description:
          pageMeta?.description ??
          statik?.description ??
          `${label.replace(/^\w/, (c) => c.toUpperCase())} page on ${BRAND_NAME}.`,
        canonical: absoluteUrl(path),
        ogType: "website",
        noindex: false,
        breadcrumb: [
          { name: localizedHome(L), url: absoluteUrl(localizedHomePath(L)) },
          { name: crumbName, url: absoluteUrl(path) },
        ],
        faqs,
      };
    }
  }
};

/**
 * Route-level metadata with locale policy applied.
 * es-CO is a near-exact es-MX duplicate (4% unique), excluded from the
 * sitemap and hreflang — noindex so it never competes for indexing.
 */
export const buildPageMeta = (view: ViewState, locale: string = DEFAULT_LOCALE): PageMeta => {
  const meta = computePageMeta(view, locale);
  if (locale === "es-co") return { ...meta, noindex: true };
  return meta;
};

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                    */
/* ------------------------------------------------------------------ */

export type JsonLdObject = Record<string, unknown>;

/** Site-wide identity node. Intentionally NO SearchAction (the SPA search box is client-side only). */
export const buildWebSiteJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: absoluteUrl("/"),
  description:
    "Free browser-based tools for developers, designers, marketers, and creators. Processing happens locally in your browser, and any tool that calls an external service says so on its page.",
});

export const buildOrganizationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/logo.svg"),
});

export const buildAboutPageJsonLd = (meta: PageMeta): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: meta.title,
  description: meta.description,
  url: meta.canonical,
  isPartOf: {
    "@type": "WebSite",
    name: BRAND_NAME,
    url: absoluteUrl("/"),
  },
});

/** Absolute URL for a crumb URL, which may be a relative on-site path. */
export const crumbToUrl = (url: string): string =>
  url.startsWith("http") ? url : absoluteUrl(url);

export const buildBreadcrumbJsonLd = (
  crumbs: Array<{ name: string; url: string }>
): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: crumbToUrl(c.url),
  })),
});

/**
 * Breadcrumb JSON-LD derived from a PageMeta trail, guaranteed to end at the
 * page's own canonical URL (the trail may otherwise end at a hub/parent). The
 * first/home crumb is included only when the trail has at least two items.
 */
export const buildPageBreadcrumbJsonLd = (meta: PageMeta): JsonLdObject | null => {
  if (meta.breadcrumb.length < 2) return null;
  const crumbs = meta.breadcrumb.map((c) => ({ name: c.name, url: crumbToUrl(c.url) }));
  const last = crumbs[crumbs.length - 1];
  if (last.url !== meta.canonical) crumbs.push({ name: last.name, url: meta.canonical });
  return buildBreadcrumbJsonLd(crumbs);
};

/**
 * Breadcrumb JSON-LD for a self-authored page: absolutizes the trail and is
 * guaranteed to end at the page's own URL. selfName overrides the appended
 * self-referential item's label (defaults to the trail's last name).
 */
export const buildSelfBreadcrumbJsonLd = (
  crumbs: Array<{ name: string; url: string }>,
  selfUrl: string,
  selfName?: string
): JsonLdObject | null => {
  if (!crumbs.length) return null;
  const clean = crumbs.map((c) => ({ name: c.name, url: crumbToUrl(c.url) }));
  const last = clean[clean.length - 1];
  if (last.url !== selfUrl) clean.push({ name: selfName ?? last.name, url: selfUrl });
  return buildBreadcrumbJsonLd(clean);
};

export const buildFAQJsonLd = (
  faqs: Array<{ question: string; answer: string }>
): JsonLdObject | null => {
  if (!faqs || faqs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
};

/**
 * CollectionPage/ItemList JSON-LD for the /image category hub, built from the
 * shared hub inventory. Layout's SEO effect and the prerender script both call
 * this, so the prerendered HTML and the hydrated page publish identical schema.
 */
export const buildImageHubJsonLd = (meta: PageMeta): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Online Image Tools",
  description: meta.description,
  url: meta.canonical,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: IMAGE_HUB_TOOLS.length,
    itemListElement: IMAGE_HUB_TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      description: tool.desktopDesc,
      url: absoluteUrl(toolPath(tool.id)),
    })),
  },
});

export const buildToolJsonLd = (toolId: ToolId, locale: string = DEFAULT_LOCALE): JsonLdObject => {
  const seo = getMergedSEO(toolId);
  const meta = toolsRegistry[toolId];
  const englishName = meta?.name ?? toolId;
  const locSeo = locale === DEFAULT_LOCALE ? null : getLocalizedSeo(toolId, locale, englishName);
  const name = locSeo?.h1 || seo.title.split(" – ")[0].split(" — ")[0].split(" | ")[0];
  // Localized canonical URL (localized slug for non-default locales) so the
  // WebApplication structured data self-references the page's own URL.
  const slug = localizedToolSlug(toolId, locale, toolId);
  // Gate the JSON-LD self-link like the canonical: a tool that is not genuinely
  // localized must self-reference its English page, not a non-emitted URL.
  const url = absoluteUrl(
    isLocalizedView({ type: "tool", id: toolId } as ViewState, locale)
      ? applyLocale(`/tools/${slug}`, locale)
      : `/tools/${toolId}`
  );
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description: locSeo ? locSeo.metaDescription : seo.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(meta?.category ? { keywords: meta.category } : {}),
  };
};

export const buildStudioJsonLd = (studioId: string, locale: string = DEFAULT_LOCALE): JsonLdObject => {
  const s = STUDIOS.find((x) => x.id === studioId);
  const name = localizedStudioName(studioId, locale, s?.name ?? studioId);
  const studioUrl = absoluteUrl(
    isLocalizedView({ type: "studio", id: studioId } as ViewState, locale)
      ? applyLocale(studioPath(studioId), locale)
      : studioPath(studioId)
  );
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: s?.longDesc ?? s?.desc ?? "",
    url: studioUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: s?.tools.length ?? 0,
      itemListElement: (s?.tools ?? []).map((id, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: localizedToolName(id, locale, toolsRegistry[id]?.name ?? id),
        url: absoluteUrl(
          isLocalizedView({ type: "tool", id: id as ToolId } as ViewState, locale)
            ? applyLocale(`/tools/${localizedToolSlug(id, locale, id)}`, locale)
            : `/tools/${id}`
        ),
      })),
    },
  };
};

/** Blog index structured data: CollectionPage + Blog with blogPost entries */
export const buildBlogCollectionJsonLd = (
  locale: string = DEFAULT_LOCALE
): JsonLdObject => {
  const path = isLocalizedView({ type: "blog" }, locale)
    ? applyLocale("/blog", locale)
    : "/blog";
  const url = absoluteUrl(path);
  const title = pageText("blog.seoTitle", locale);
  const description = pageText("blog.seoDescription", locale);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    mainEntity: {
      "@type": "Blog",
      name: "GainUtility Blog",
      url,
      description,
      publisher: {
        "@type": "Organization",
        name: BRAND_NAME,
        url: absoluteUrl(applyLocale("/", locale)),
      },
      blogPost: BLOG_ARTICLES.map((raw) => {
        const a = articleLocalized(raw, locale);
        const articlePath = isLocalizedView({ type: "blog-article", slug: a.slug }, locale)
          ? applyLocale(`/blog/${a.slug}`, locale)
          : `/blog/${a.slug}`;
        return {
          "@type": "BlogPosting",
          headline: a.title,
          description: a.seoDescription,
          datePublished: a.date,
          dateModified: a.date,
          url: absoluteUrl(articlePath),
        };
      }),
    },
  };
};

/** Article structured data — derived from the real registry, never fabricated. */
export const buildBlogPostingJsonLd = (
  slug: string,
  locale: string = DEFAULT_LOCALE
): JsonLdObject | null => {
  const raw = BLOG_SLUG_TO_ARTICLE[slug];
  if (!raw) return null;
  const a = articleLocalized(raw, locale);
  const path = isLocalizedView({ type: "blog-article", slug: a.slug }, locale)
    ? applyLocale(`/blog/${a.slug}`, locale)
    : `/blog/${a.slug}`;
  const url = absoluteUrl(path);
  const wordCount = (a.content ?? []).reduce(
    (sum, block) =>
      sum +
      (block.paragraphs ?? []).reduce((s, p) => s + p.trim().split(/\s+/).filter(Boolean).length, 0) +
      (block.list ?? []).reduce((s, li) => s + li.trim().split(/\s+/).filter(Boolean).length, 0),
    0
  );
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.seoDescription,
    datePublished: a.date,
    dateModified: a.date,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale,
    ...(wordCount > 0 ? { wordCount } : {}),
    author: { "@type": "Organization", name: a.author === "GainUtility" ? BRAND_NAME : a.author },
    publisher: { "@type": "Organization", name: BRAND_NAME, url: absoluteUrl(applyLocale("/", locale)) },
    articleSection: a.categoryLabel ?? a.category,
    keywords: a.tags.slice(0, 6).join(", "),
  };
};

/**
 * HowTo JSON-LD derived from the article's own ordered `steps` blocks - never
 * authored separately from the copy. Emits nothing when an article has no
 * sequential list of at least three steps, so the schema always mirrors what
 * the reader actually sees.
 */
export const buildHowToJsonLd = (
  slug: string,
  locale: string = DEFAULT_LOCALE
): JsonLdObject | null => {
  const raw = BLOG_SLUG_TO_ARTICLE[slug];
  if (!raw) return null;
  const a = articleLocalized(raw, locale);
  const steps = (a.content ?? []).flatMap((block) => block.steps ?? []);
  if (steps.length < 3) return null;
  const path = isLocalizedView({ type: "blog-article", slug: a.slug }, locale)
    ? applyLocale(`/blog/${a.slug}`, locale)
    : `/blog/${a.slug}`;
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: a.title,
    description: a.seoDescription,
    url,
    inLanguage: locale,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text.split(/(?<=[.!?])\s/)[0] || `Step ${index + 1}`,
      text,
    })),
  };
};

/* ------------------------------------------------------------------ */
/* Sitemap helpers (shared with the generator script via regex-free    */
/* route enumeration at build time)                                    */
/* ------------------------------------------------------------------ */

export const allToolPaths = (): string[] =>
  (Object.keys(toolsRegistry) as ToolId[]).map(toolPath);

export const allStudioPaths = (): string[] => STUDIOS.map((s) => studioPath(s.id));

/** Language-pair sub-pages of the PDF Translator (e.g. english-to-french). */
export const allTranslatorPairPaths = (): string[] =>
  TRANSLATOR_PAIR_SLUGS.map(translatorPairPath);

/* ------------------------------------------------------------------ */
/* SEO page hub lookup for a tool — used for contextual internal links */
/* ------------------------------------------------------------------ */

const TOOL_TO_HUB: Record<string, { label: string; path: string }> = {
  // Developer tools
  "qr-code-generator": { label: "Developer Tools", path: "/dev" },
  "base64-tool": { label: "Developer Tools", path: "/dev" },
  "url-encoder-decoder": { label: "Developer Tools", path: "/dev" },
  "password-generator": { label: "Developer Tools", path: "/dev" },
  "hash-generator": { label: "Developer Tools", path: "/dev" },
  "uuid-generator": { label: "Developer Tools", path: "/dev" },
  "jwt-decoder": { label: "Developer Tools", path: "/dev" },
  "regex-tester": { label: "Developer Tools", path: "/dev" },
  // JSON tools
  "json-formatter": { label: "JSON Tools", path: "/json" },
  "json-validator": { label: "JSON Tools", path: "/json" },
  "json-viewer": { label: "JSON Tools", path: "/json" },
  "json-minifier": { label: "JSON Tools", path: "/json" },
  // Image tools
  "image-resizer": { label: "Image Tools", path: "/image" },
  "image-cropper": { label: "Image Tools", path: "/image" },
  "image-converter": { label: "Image Tools", path: "/image" },
  // CSS tools
  "gradient-generator": { label: "CSS Tools", path: "/css" },
  "box-shadow-generator": { label: "CSS Tools", path: "/css" },
  "border-radius-generator": { label: "CSS Tools", path: "/css" },
  "contrast-checker": { label: "CSS Tools", path: "/css" },
  // Creator tools
  "stylish-name-generator": { label: "Creator Tools", path: "/creator" },
};

/**
 * Crawlable hub path per studio. The legacy /studios/* route redirects to
 * home, so tool pages point at the indexed SEO hub instead (e.g. /image).
 */
const STUDIO_HUB_PATHS: Record<string, string> = {
  pdf: "/pdf",
  json: "/json",
  image: "/image",
  css: "/css",
  developer: "/dev",
  seo: "/seo",
  // The creator (and color/security/converter) studios have no standalone
  // hub page, so their tools fall back to a clean Home → tool trail below
  // instead of pointing at the legacy /studios/* routes, which 301-redirect
  // to the homepage.
};

/** Hub path for a studio id, or null when the studio has no SEO hub. */
const studioToHubPath = (studioId: string): string | null => STUDIO_HUB_PATHS[studioId] ?? null;

/**
 * Returns the SEO hub page link (label + path) for a given tool, so tool
 * pages can point crawlers/user to the indexed category landing page.
 * Falls back to null when a tool has no standalone SEO hub.
 */
export const seoHubForTool = (toolId: ToolId): { label: string; path: string } | null => {
  const owning = owningStudio(toolId);
  if (!owning) {
    const direct = TOOL_TO_HUB[toolId];
    return direct ?? null;
  }
  const hubPath = studioToHubPath(owning.id);
  if (!hubPath) return TOOL_TO_HUB[toolId] ?? null;
  const labels: Record<string, string> = {
    pdf: "PDF Tools",
    json: "JSON Tools",
    image: "Image Tools",
    css: "CSS Tools",
    developer: "Developer Tools",
    seo: "SEO Tools",
    creator: "Creator Studio",
  };
  return { label: labels[owning.id] ?? owning.name, path: hubPath };
};

/** Parse helper re-exported for the prerender script convenience. */
export { pathToView, viewToPath };
