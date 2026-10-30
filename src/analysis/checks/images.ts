/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Image checks: missing alt (also surfaced under accessibility), oversized
 * files (from sampled asset sizes), declared dimensions, modern formats
 * and lazy-loading hints.
 */

import type { Finding, RawSignals } from "../types";

const IMG_EXT = /\.(png|jpe?g|gif|bmp)(?:[?#]|$)/i;
const MODERN_EXT = /\.(webp|avif|svg)(?:[?#]|$)/i;
const OVERSIZE_WARN = 300 * 1024; // 300 KB
const OVERSIZE_ERROR = 1024 * 1024; // 1 MB

export function runImageChecks(raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];
  const imgs = Array.from(doc.querySelectorAll("img"));

  // Alt text → assigned to accessibility category (single source of truth).
  const missingAlt = imgs.filter((img) => !img.hasAttribute("alt"));
  const emptyAlt = imgs.filter((img) => img.hasAttribute("alt") && (img.getAttribute("alt") ?? "").trim() === "");
  if (imgs.length === 0) {
    // no images — nothing to report here (accessibility check still covers it)
  } else if (missingAlt.length > 0) {
    out.push({
      id: "images-alt",
      category: "accessibility",
      status: missingAlt.length === imgs.length ? "ERROR" : "WARNING",
      title: `${missingAlt.length} image${missingAlt.length === 1 ? "" : "s"} missing alt text`,
      what: `${missingAlt.length} of ${imgs.length} <img> elements have no alt attribute.`,
      why: "Alt text is announced by screen readers when the image cannot be seen, and it is used when images fail to load.",
      how: "Add a concise alt describing the image's purpose; use alt=\"\" only for purely decorative images.",
      evidence: missingAlt
        .slice(0, 4)
        .map((i) => (i.getAttribute("src") || "(no src)").slice(0, 80))
        .join(" | "),
      fixTool: "contrast-checker",
    });
  } else {
    out.push({
      id: "images-alt",
      category: "accessibility",
      status: "PASS",
      title: `All ${imgs.length} image${imgs.length === 1 ? "" : "s"} have alt attributes`,
      what: `${imgs.length} <img> element(s) checked; ${emptyAlt.length} marked decorative (empty alt).`,
      why: "Every image declaring alt (including intentionally empty) keeps screen-reader output predictable.",
      how: "Periodically review that alt text still matches the image content after content updates.",
      evidence: `${imgs.length} images, ${emptyAlt.length} with empty alt`,
      fixTool: "contrast-checker",
    });
  }

  // Declared dimensions (CLS prevention)
  const noDims = imgs.filter(
    (img) => !img.hasAttribute("width") && !img.hasAttribute("height") && !img.style.width && !img.style.height
  );
  if (imgs.length > 0) {
    if (noDims.length > 0) {
      out.push({
        id: "images-dimensions",
        category: "images",
        status: "WARNING",
        title: `${noDims.length} image${noDims.length === 1 ? "" : "s"} without declared dimensions`,
        what: `${noDims.length} of ${imgs.length} images lack width/height attributes (and inline size).`,
        why: "Browsers cannot reserve space for dimension-less images, which causes layout shift while the page loads.",
        how: "Add width and height attributes matching the intrinsic size (CSS can still control the rendered size).",
        evidence: noDims.slice(0, 4).map((i) => (i.getAttribute("src") || "").slice(0, 80)).join(" | "),
      });
    } else {
      out.push({
        id: "images-dimensions",
        category: "images",
        status: "PASS",
        title: "Images declare their dimensions",
        what: `All ${imgs.length} images expose width/height (attribute or inline style).`,
        why: "Declared dimensions let the browser reserve space and avoid layout shifts.",
        how: "Keep attributes in sync if you replace an asset at a different resolution.",
      });
    }
  }

  // Sampled asset sizes
  const assetSamples = raw.samples.filter((s) => s.kind === "asset" && s.bytes !== null && s.bytes > 0);
  const imageAssets = assetSamples.filter((s) => IMG_EXT.test(s.url) || MODERN_EXT.test(s.url));
  const oversize = imageAssets.filter((s) => (s.bytes ?? 0) >= OVERSIZE_ERROR);
  const warnSize = imageAssets.filter((s) => (s.bytes ?? 0) >= OVERSIZE_WARN && (s.bytes ?? 0) < OVERSIZE_ERROR);
  if (imageAssets.length === 0) {
    out.push({
      id: "images-size",
      category: "images",
      status: "NOT DETECTABLE",
      title: "No image sizes sampled",
      what: "The bounded sample did not include image assets with a Content-Length header.",
      why: "Image weight is judged from sampled asset responses; without sizes there is nothing to weigh.",
      how: "Ensure images are served with Content-Length, or run the scan on a page that loads images.",
    });
  } else if (oversize.length > 0 || warnSize.length > 0) {
    out.push({
      id: "images-size",
      category: "images",
      status: oversize.length > 0 ? "ERROR" : "WARNING",
      title:
        oversize.length > 0
          ? `${oversize.length} sampled image${oversize.length === 1 ? "" : "s"} ≥ 1 MB`
          : `${warnSize.length} sampled image${warnSize.length === 1 ? "" : "s"} ≥ 300 KB`,
      what: `Sampled image sizes: ${imageAssets.map((s) => `${s.url.split("/").pop()}=${s.bytes}B`).slice(0, 5).join(", ")}.`,
      why: "Heavy images dominate page weight on mobile connections and slow the Largest Contentful Paint.",
      how: "Compress and resize images to their display size; prefer WebP/AVIF for photographs.",
      evidence: [...oversize, ...warnSize].slice(0, 4).map((s) => `${s.url} (${s.bytes} bytes)`).join(" | "),
      fixTool: "image-converter",
    });
  } else {
    out.push({
      id: "images-size",
      category: "images",
      status: "PASS",
      title: "Sampled images are within size budgets",
      what: `${imageAssets.length} sampled image(s), largest below 300 KB.`,
      why: "Keeping individual images lean protects load performance.",
      how: "Re-check after adding new hero or gallery images.",
      evidence: imageAssets.slice(0, 4).map((s) => `${s.url.split("/").pop()}=${s.bytes}B`).join(", "),
    });
  }

  // Modern formats among legacy <img> sources in HTML
  const srcs = imgs.map((i) => i.getAttribute("src") ?? "");
  const legacy = srcs.filter((s) => IMG_EXT.test(s) && !/\.webp|\.avif/i.test(s));
  const hasPictureWebp = doc.querySelectorAll("picture source[type='image/webp'], picture source[type='image/avif']").length > 0;
  if (legacy.length > 0 && !hasPictureWebp) {
    out.push({
      id: "images-format",
      category: "images",
      status: "WARNING",
      title: `${legacy.length} legacy-format image${legacy.length === 1 ? "" : "s"} with no modern fallback`,
      what: `Direct <img src> values use PNG/JPEG/GIF and no <picture> WebP/AVIF source was found.`,
      why: "WebP/AVIF typically cut 25–50% of image bytes at equivalent quality.",
      how: "Convert photos to WebP or AVIF (keep PNG for transparency-critical assets) and serve via <picture>.",
      evidence: legacy.slice(0, 4).join(" | "),
      fixTool: "image-converter",
    });
  } else if (srcs.length > 0) {
    out.push({
      id: "images-format",
      category: "images",
      status: "PASS",
      title: "Images use modern formats or have <picture> fallbacks",
      what: hasPictureWebp
        ? "A <picture> element provides WebP/AVIF sources."
        : "No legacy-only image sources were detected among sampled <img> tags.",
      why: "Modern formats reduce bytes without visible quality loss.",
      how: "Keep converting new uploads to WebP/AVIF.",
    });
  }

  // Lazy loading
  const lazyEl = doc.querySelectorAll("img[loading='lazy']").length;
  const eagerCritical = imgs.filter((i) => i.getAttribute("loading") !== "lazy");
  if (imgs.length >= 5 && lazyEl === 0) {
    out.push({
      id: "images-lazy",
      category: "images",
      status: "WARNING",
      title: "No images use native lazy loading",
      what: `${imgs.length} images found; none uses loading="lazy".`,
      why: "Below-the-fold images load eagerly and compete with above-the-fold content for bandwidth.",
      how: 'Add loading="lazy" to below-the-fold images; keep the LCP/hero image eager.',
      evidence: `${imgs.length} images, 0 lazy`,
    });
  } else if (imgs.length > 0) {
    out.push({
      id: "images-lazy",
      category: "images",
      status: "PASS",
      title: "Native lazy loading in use",
      what: `${lazyEl} of ${imgs.length} images use loading="lazy".`,
      why: "Lazy loading defers offscreen images so the initial viewport paints faster.",
      how: "Double-check the hero/LCP image stays eager (loading=\"eager\" or omitted).",
      evidence: `${lazyEl}/${imgs.length} lazy`,
    });
  }

  // Suppress unused-var lint for eagerCritical if tree-shaken differently
  void eagerCritical;

  return out;
}
