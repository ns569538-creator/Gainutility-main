/**
 * Single source of truth for GainUtility site identity & production URLs.
 */

export const BRAND_NAME = "GainUtility";
export const SITE_NAME = BRAND_NAME;
export const SITE_URL: string =
  (import.meta.env?.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://gainutility.com";

/**
 * Chrome Web Store listing for the GainUtility browser extension. This is the
 * single place the "Add to Chrome" / "Get the extension" call-to-action links
 * to. It stays empty until the extension is published — while unset, the
 * website hides the CTA rather than linking to a dead URL.
 *
 * Override at build time with VITE_CHROME_EXTENSION_STORE_URL.
 */
export const CHROME_EXTENSION_STORE_URL: string =
  (import.meta.env?.VITE_CHROME_EXTENSION_STORE_URL as string | undefined)
    ?.replace(/\/$/, "") || "";

export const SITE_TAGLINE = "Free Browser-Based Tools";
export const DEFAULT_TITLE = `${BRAND_NAME} — ${SITE_TAGLINE}`;
export const DEFAULT_DESC =
  "GainUtility brings fast, practical browser-based tools for developers, designers, creators, marketers, and everyday work.";

export const DEFAULT_OG_TITLE = DEFAULT_TITLE;
export const DEFAULT_OG_DESC = DEFAULT_DESC;

/** Absolute OG/share image (1200x630 PNG served from /public). */
export const OG_IMAGE_PATH = "/og-image.png";

/** Build an absolute URL from a root-relative path ("/", "/tools/pdf-to-jpg", …). */
export const absoluteUrl = (path = "/"): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === "/" ? "/" : cleanPath}`;
};

/**
 * Canonical URL helpers. Every tool lives at /tools/<tool-id> so each tool
 * has its own crawlable URL (e.g. https://gainutility.com/tools/pdf-to-jpg).
 * This matches the canonical pattern emitted by src/data.ts.
 */
export const toolPath = (toolId: string): string => `/tools/${toolId}`;
export const studioPath = (studioId: string): string => `/studios/${studioId}`;

export const toolCanonicalUrl = (toolId: string): string =>
  absoluteUrl(toolPath(toolId));

export const studioCanonicalUrl = (studioId: string): string =>
  absoluteUrl(studioPath(studioId));
