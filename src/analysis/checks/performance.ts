/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Performance checks using only self-measured signals: document size,
 * sampled resource weight/count, compression and cache headers, and
 * render-blocking patterns visible in the HTML. Core Web Vitals and
 * real-world font metrics are honestly reported as NOT DETECTABLE —
 * no PageSpeed API, no fake scores.
 */

import type { Finding, RawSignals } from "../types";

const DOC_SIZE_WARN = 100 * 1024; // 100 KB
const DOC_SIZE_ERROR = 300 * 1024; // 300 KB
const SAMPLED_WEIGHT_WARN = 1_500_000; // 1.5 MB across sampled assets

export function runPerformanceChecks(raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];
  const headers = raw.page.headers;
  const bytes = raw.page.bytes;

  // Document size
  if (bytes >= DOC_SIZE_ERROR) {
    out.push({
      id: "perf-doc-size",
      category: "performance",
      status: "ERROR",
      title: `HTML document is large (${Math.round(bytes / 1024)} KB)`,
      what: `The fetched HTML body is ${bytes} bytes (≥ 300 KB).`,
      why: "Large HTML delays First Byte→render, especially on mobile, and is often a sign of inlined data or unminified markup.",
      how: "Split long pages, move bulky JSON out of the document (fetch on demand), and minify server-rendered markup.",
      evidence: `${bytes} bytes`,
      fixTool: "image-converter",
    });
  } else if (bytes >= DOC_SIZE_WARN) {
    out.push({
      id: "perf-doc-size",
      category: "performance",
      status: "WARNING",
      title: `HTML document is moderately large (${Math.round(bytes / 1024)} KB)`,
      what: `The fetched HTML body is ${bytes} bytes.`,
      why: "Every KB of HTML must download before first paint of its content.",
      how: "Review inlined styles/scripts and consider code-splitting or pagination for very long pages.",
      evidence: `${bytes} bytes`,
    });
  } else {
    out.push({
      id: "perf-doc-size",
      category: "performance",
      status: "PASS",
      title: `HTML document is lean (${Math.round(bytes / 1024)} KB)`,
      what: `The fetched HTML body is ${bytes} bytes (< 100 KB).`,
      why: "A small document gets out of the way quickly so real content can paint sooner.",
      how: "Watch this metric as pages grow — inline data is the usual culprit.",
      evidence: `${bytes} bytes`,
    });
  }

  // Sampled resource weight
  const assets = raw.samples.filter((s) => s.kind === "asset" && s.bytes !== null);
  const totalWeight = assets.reduce((sum, s) => sum + (s.bytes ?? 0), 0);
  if (assets.length === 0) {
    out.push({
      id: "perf-resource-weight",
      category: "performance",
      status: "NOT DETECTABLE",
      title: "Sampled resource weight unavailable",
      what: "No sampled assets returned a Content-Length header.",
      why: "Weight is judged from sampled asset responses (bounded to 6 resources) — without sizes the check has no data.",
      how: "Ensure static assets are served with Content-Length, or scan a page that loads more resources.",
    });
  } else if (totalWeight >= SAMPLED_WEIGHT_WARN) {
    out.push({
      id: "perf-resource-weight",
      category: "performance",
      status: "WARNING",
      title: `Sampled resources weigh ${Math.round(totalWeight / 1024)} KB`,
      what: `${assets.length} sampled asset(s) total ${totalWeight} bytes.`,
      why: "Heavy assets (fonts, images, bundles) compete with LCP and interactivity on mid-tier devices.",
      how: "Compress images, subset fonts, and defer non-critical scripts below the fold.",
      evidence: assets.slice(0, 5).map((s) => `${s.url.split("/").pop()}=${s.bytes}B`).join(", "),
    });
  } else {
    out.push({
      id: "perf-resource-weight",
      category: "performance",
      status: "PASS",
      title: `Sampled resources are light (${Math.round(totalWeight / 1024)} KB)`,
      what: `${assets.length} sampled asset(s) total ${totalWeight} bytes (< 1.5 MB).`,
      why: "Keeping the sampled payload small leaves headroom for actual content.",
      how: "This is a bounded sample (≤ 6 assets) — a full audit would cover every request.",
      evidence: assets.slice(0, 5).map((s) => `${s.url.split("/").pop()}=${s.bytes}B`).join(", "),
    });
  }

  // Resource count from HTML references
  const scriptCount = doc.querySelectorAll("script[src]").length;
  const styleCount = doc.querySelectorAll('link[rel="stylesheet"]').length;
  const imgCount = doc.querySelectorAll("img").length;
  const fontCount = doc.querySelectorAll('link[rel="preload"][as="font"], link[rel="preload"][href*=".woff"]').length;
  const totalRefs = scriptCount + styleCount + imgCount;
  if (totalRefs > 80) {
    out.push({
      id: "perf-resource-count",
      category: "performance",
      status: "WARNING",
      title: `High resource reference count (${totalRefs})`,
      what: `HTML references ${scriptCount} script(s), ${styleCount} stylesheet(s) and ${imgCount} image(s)${fontCount ? `, plus ${fontCount} font preload(s)` : ""}.`,
      why: "Many parallel requests saturate connection limits (esp. HTTP/1.1 and mobile) and increase queueing delay.",
      how: "Bundle scripts, remove unused dependencies, and lazy-load offscreen images.",
      evidence: `scripts=${scriptCount}, styles=${styleCount}, imgs=${imgCount}, fonts=${fontCount}`,
    });
  } else if (totalRefs > 0) {
    out.push({
      id: "perf-resource-count",
      category: "performance",
      status: "PASS",
      title: `Moderate resource reference count (${totalRefs})`,
      what: `${scriptCount} script(s), ${styleCount} stylesheet(s), ${imgCount} image(s).`,
      why: "A restrained request count keeps connection slots free for critical resources.",
      how: "Re-check when adding third-party widgets — they often multiply script tags.",
      evidence: `scripts=${scriptCount}, styles=${styleCount}, imgs=${imgCount}`,
    });
  }

  // Compression
  const encoding = (headers["content-encoding"] ?? "").toLowerCase();
  if (encoding && encoding !== "identity") {
    out.push({
      id: "perf-compression",
      category: "performance",
      status: "PASS",
      title: `Response compressed (${encoding})`,
      what: `content-encoding: ${encoding}.`,
      why: "Compression (gzip/brotli/deflate) shrinks transfer size with negligible CPU cost.",
      how: "Keep compression enabled at the CDN/origin for all text assets.",
      evidence: `content-encoding: ${encoding}`,
    });
  } else if (bytes < 1024) {
    out.push({
      id: "perf-compression",
      category: "performance",
      status: "NOT DETECTABLE",
      title: "Compression not verifiable for this tiny response",
      what: `content-encoding is absent on a ${bytes}-byte response — may be legitimately uncompressed or a HEAD-like short body.`,
      why: "Compression matters for larger text payloads; tiny responses often skip it.",
      how: "Verify compression on a full page response (enable gzip/br at the server or CDN).",
      evidence: `content-encoding: ${encoding || "(absent)"}`,
    });
  } else {
    out.push({
      id: "perf-compression",
      category: "performance",
      status: "WARNING",
      title: "No content-encoding header (uncompressed text?)",
      what: `The ${bytes}-byte HTML response has no content-encoding (gzip/brotli/deflate).`,
      why: "Uncompressed text transfers 3–5× more bytes than compressed equivalents.",
      how: "Enable gzip or brotli for HTML/CSS/JS at your server or CDN (e.g. Cloudflare Brotli).",
      evidence: `content-encoding: (absent), bytes: ${bytes}`,
    });
  }

  // Caching
  const cacheControl = headers["cache-control"] ?? "";
  if (!cacheControl) {
    out.push({
      id: "perf-cache",
      category: "performance",
      status: "WARNING",
      title: "No Cache-Control header on the document",
      what: "The HTML response omits Cache-Control.",
      why: "Without cache directives, browsers and CDNs guess — often revalidating every visit or, worse, caching too aggressively.",
      how: "Set an explicit policy: short max-age (or no-cache) for HTML, long max-age + immutable for fingerprinted assets.",
      evidence: "cache-control: (absent)",
    });
  } else if (/\bno-store\b/i.test(cacheControl) && !/max-age=/i.test(cacheControl)) {
    out.push({
      id: "perf-cache",
      category: "performance",
      status: "WARNING",
      title: "Document marked no-store",
      what: `cache-control: ${cacheControl}.`,
      why: "no-store forces a full re-download on every navigation — safe for sensitive pages, costly for public content.",
      how: "For public pages prefer `no-cache` (revalidate) or a short max-age; reserve no-store for private data.",
      evidence: `cache-control: ${cacheControl}`,
    });
  } else {
    out.push({
      id: "perf-cache",
      category: "performance",
      status: "PASS",
      title: "Cache-Control policy present",
      what: `cache-control: ${cacheControl}.`,
      why: "An explicit cache policy lets browsers and CDNs reuse resources correctly.",
      how: "Keep HTML short-cached and static assets long-cached with content hashes in filenames.",
      evidence: `cache-control: ${cacheControl}`,
    });
  }

  // Render-blocking (scripts in <head> without defer/async/module)
  const head = doc.head;
  let blocking = 0;
  let totalHeadScripts = 0;
  if (head) {
    for (const s of Array.from(head.querySelectorAll("script[src]"))) {
      totalHeadScripts++;
      const isAsync = s.hasAttribute("async");
      const isDefer = s.hasAttribute("defer");
      const isModule = s.getAttribute("type") === "module";
      if (!isAsync && !isDefer && !isModule) blocking++;
    }
  }
  if (totalHeadScripts > 0 && blocking > 0) {
    out.push({
      id: "perf-render-blocking",
      category: "performance",
      status: "WARNING",
      title: `${blocking} render-blocking script${blocking === 1 ? "" : "s"} in <head>`,
      what: `${blocking} of ${totalHeadScripts} head scripts lack defer/async/type="module".`,
      why: "Parser-blocking scripts halt HTML parsing and delay first paint until they download and run.",
      how: 'Add defer (order-preserving) or async (independent) to head scripts, or move them to the end of <body>.',
      evidence: `${blocking}/${totalHeadScripts} blocking`,
    });
  } else if (totalHeadScripts > 0) {
    out.push({
      id: "perf-render-blocking",
      category: "performance",
      status: "PASS",
      title: "Head scripts are deferred or async",
      what: `All ${totalHeadScripts} head script(s) use defer, async or type="module".`,
      why: "Non-blocking scripts let the parser keep building the render tree.",
      how: "Keep new third-party snippets deferred unless they must run before first paint.",
      evidence: `${totalHeadScripts} head scripts, 0 blocking`,
    });
  }

  // Fonts — NOT DETECTABLE (requires rendered timing data)
  out.push({
    id: "perf-fonts",
    category: "performance",
    status: "NOT DETECTABLE",
    title: "Font loading performance not measured",
    what: "font-display, swap behaviour and FOIT/FOUT flashes need a rendered page with timing data; this scan only reads HTML.",
    why: "Font loading directly affects layout stability and LCP but cannot be timed from static markup.",
    how: "Inspect font files manually (prefer font-display: swap, subset to used glyphs) or run a rendered-page performance audit.",
  });

  // Core Web Vitals — NOT DETECTABLE
  out.push({
    id: "perf-core-web-vitals",
    category: "performance",
    status: "NOT DETECTABLE",
    title: "Core Web Vitals (LCP / INP / CLS) not measured",
    what: "LCP, INP and CLS are field/lab metrics collected from rendered, interacting page loads — not from a single HTML fetch.",
    why: "Inventing CWV numbers without measurement would be misleading; this tool reports only what it observes.",
    how: "Measure real-user CWV (e.g. CrUX or a lab run in your browser's DevTools) and revisit after fixes.",
  });

  return out;
}
