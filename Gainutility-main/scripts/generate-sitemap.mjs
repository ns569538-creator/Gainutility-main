/**
 * Generates crawl/deploy artifacts from the live registry:
 *   public/sitemap.xml  - every canonical route
 *   public/robots.txt   - allows crawling of all public pages
 *   vercel.json         - legacy URL 301s (no SPA rewrite; prerendered HTML is served)
 *   public/_redirects   - same legacy 301s for Netlify-style hosts
 * Run: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITEMAP_EXCLUDES, CONSOLIDATED_TOOL_ALIASES, EXCLUDED_TOOL_IDS } from "./sitemap-excludes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registrySrc = readFileSync(resolve(root, "src/toolsRegistry.tsx"), "utf8");
const colorDataSrc = readFileSync(resolve(root, "src/colorStudio/colorData.ts"), "utf8");
const translatorSrc = readFileSync(resolve(root, "src/seo/translatorPairs.ts"), "utf8");
const blogSrc = readFileSync(resolve(root, "src/blog/blogData.ts"), "utf8");

const SITE_URL = (process.env.VITE_SITE_URL || "https://gainutility.com").replace(/\/+$/, "");

// Tool ids are the quoted keys of toolsRegistry
const toolIds = [...registrySrc.matchAll(/"([\w-]+)":\s*\{/g)].map(m => m[1]);

// Legacy "Classic" JSON variants superseded by the modern beautifier / tree
// viewer / compare-diff tools, plus the tool aliases consolidated into their
// canonical tool (webp/png-jpg/heic/svg-converter -> image-converter,
// merge-selected-page-ranges -> merge-pdf). All of them stay in the registry
// (SPA can still render them) but are dropped from the sitemap and 301 to their
// successor so search and users converge on one canonical URL per function.
// (EXCLUDED_TOOL_IDS is defined in sitemap-excludes.mjs — shared with
// audit-seo.mjs.)

// Color Studio data — regex-based parse of the curated palette slugs, hero color
// names and UI color system ids (keeps the sitemap generator dependency-free).
const block = (name) => {
  const from = colorDataSrc.indexOf(`export const ${name}`);
  const to = colorDataSrc.indexOf("export const ", from + 1);
  return from === -1 ? "" : to === -1 ? colorDataSrc.slice(from) : colorDataSrc.slice(from, to);
};
const curatedPaletteSlugs = [...block("CURATED_PALETTES").matchAll(/^\s*slug:\s*"([\w-]+)",\s*$/gm)].map(m => m[1]);
const uiSystemIds = [...block("UI_COLOR_SYSTEMS").matchAll(/^\s*id:\s*"([\w-]+)",\s*$/gm)].map(m => m[1]);
const heroColorNames = [...block("HERO_COLORS").matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
// Every named CSS color the Color Studio renders gets a public /colors/<slug>
// page (matching colorSlug in src/colorStudio/colorData.ts). Parsed from the
// registry — NOT a hand-maintained list — so sitemap and prerender can't drift.
const namedColorNames = [...block("NAMED_COLORS").matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
const colorSlugs = [...new Set([...heroColorNames, ...namedColorNames])];

if (toolIds.length < 100) throw new Error(`Registry parse failed: only ${toolIds.length} tool ids found`);

// PDF Translator language-pair sub-pages (slugs of TRANSLATOR_PAIRS)
const pairsBlock = translatorSrc.slice(
  translatorSrc.indexOf("export const TRANSLATOR_PAIRS"),
  translatorSrc.indexOf("export const TRANSLATOR_PAIR_SLUGS")
);
const pairSlugs = [...pairsBlock.matchAll(/^\s*"([\w-]+)":\s*\{\s*$/gm)].map(m => m[1]);
const hasTranslatorTool = toolIds.includes("pdf-translator");

// Blog article slugs — parse the BLOG_ARTICLES array for `slug:` fields.
const blogBlock = blogSrc.indexOf("BLOG_ARTICLES") === -1 ? "" : blogSrc.slice(blogSrc.indexOf("export const BLOG_ARTICLES"));
const blogSlugs = [...blogBlock.matchAll(/^\s*slug:\s*"([\w-]+)",\s*$/gm)].map(m => m[1]);

// Library pages (/names, /symbols + children). libraryPages.ts is
// import-free, so Node's native type-stripping can load it directly.
const { ALL_LIBRARY_PAGES } = await import(pathToFileURL(resolve(root, "src/seo/libraryPages.ts")).href);
const libraryHubPaths = ALL_LIBRARY_PAGES.filter(p => p.kind === "hub").map(p => p.path);
const libraryChildPaths = ALL_LIBRARY_PAGES.filter(p => p.kind !== "hub").map(p => p.path);

const staticPaths = ["", "tools", "about", "faq", "privacy", "terms", "security", "cookies", "contact", "changelog", "site-audit", "blog"];

// Collect every canonical English path with a changefreq + priority.
const urls = new Map(); // path -> { changefreq, priority }

const addUrl = (path, priority, changefreq = "monthly") => {
  if (!urls.has(path)) urls.set(path, { priority, changefreq });
};

for (const p of staticPaths) addUrl(`/${p}`, p ? "0.7" : "1.0", "monthly");
for (const t of toolIds) if (!EXCLUDED_TOOL_IDS.has(t)) addUrl(`/tools/${t}`, "0.9", "monthly");
if (hasTranslatorTool) {
  for (const slug of pairSlugs) addUrl(`/tools/pdf-translator/${slug}`, "0.8", "monthly");
}
// The Color Studio is a functional in-app workspace (its pages are prerendered,
// but they are app surfaces, not standalone content landing pages). Per the
// indexing model we do NOT add /studios/color or /studios/color/* to the
// sitemap. The studio home is a real prerendered document (it used to be a
// _redirects rewrite to the SPA shell, which served the homepage canonical on
// a non-homepage URL), so links to it resolve like any other route.
//
// INDEX-READY audit (Phase G): the 151 programmatic color landing pages
// (/colors/*, /color-palettes/*, /ui-colors/*) are thin template pages
// (median ~89 rendered words) whose sitemap presence diluted the indexable
// inventory. They stay LIVE and indexable for Color Studio UX and internal
// linking — they are intentionally NOT added to the sitemap (no noindex, no
// redirect). Inclusion below is deliberate omission, not an oversight.
// SEO landing pages (hub + sub-pages). /creator is a real canonical hub
// landing page (INDEX-READY audit: renders fine, ~479 words) — added per the
// approved inventory (504 − 176 + 1 = 329).
const seoPages = [
  { path: "/pdf", priority: "0.9" },
  { path: "/creator", priority: "0.9" },
  { path: "/pdf/merge", priority: "0.8" },
  { path: "/pdf/compress", priority: "0.8" },
  { path: "/pdf/split", priority: "0.8" },
  { path: "/pdf/pdf-to-word", priority: "0.8" },
  { path: "/pdf/rotate", priority: "0.8" },
  { path: "/pdf/jpg-to-pdf", priority: "0.8" },
  { path: "/json", priority: "0.9" },
  { path: "/json/formatter", priority: "0.8" },
  { path: "/json/validator", priority: "0.8" },
  { path: "/json/viewer", priority: "0.8" },
  { path: "/image", priority: "0.9" },
  { path: "/image/resize", priority: "0.8" },
  { path: "/css", priority: "0.9" },
  { path: "/css/box-shadow", priority: "0.8" },
  { path: "/css/box-shadow/examples", priority: "0.8" },
  { path: "/css/box-shadow/multiple-shadows", priority: "0.8" },
  { path: "/dev", priority: "0.9" },
  { path: "/dev/qr-code", priority: "0.8" },
  { path: "/dev/base64", priority: "0.8" },
  { path: "/dev/password", priority: "0.8" },
  { path: "/seo", priority: "0.9" },
  { path: "/media", priority: "0.8" },
];
// Comparison pages (tool-vs-tool) targeting high-intent "vs" queries
const comparisonPages = [
  "/compare/merge-vs-split-pdf",
  "/compare/compress-vs-optimize-pdf",
  "/compare/json-formatter-vs-minifier",
  "/compare/word-to-pdf-vs-pdf-to-word",
  "/compare/jpg-to-pdf-vs-pdf-to-jpg",
  "/compare/image-crop-vs-resize",
  "/compare/json-validator-vs-schema-validator",
  "/compare/password-vs-hash-generator",
  "/compare/qr-code-vs-url-encoder",
];
// Category "best" pages
const bestPages = ["/pdf/best", "/json/best", "/image/best", "/dev/best", "/css/best", "/seo/best"];
// Color page families (/colors/*, /color-palettes/*, /ui-colors/*) are still
// parsed above so the build summary stays accurate — they are deliberately
// NOT added to the sitemap (see the INDEX-READY Phase G note). The pages
// remain live, indexable and internally linked.
for (const sp of seoPages) addUrl(sp.path, sp.priority, "weekly");
for (const cp of comparisonPages) addUrl(cp, "0.7", "monthly");
for (const bp of bestPages) addUrl(bp, "0.8", "monthly");
for (const slug of blogSlugs) addUrl(`/blog/${slug}`, "0.7", "monthly");
// Library hubs (/names, /symbols) and their curated children
for (const p of libraryHubPaths) addUrl(p, "0.8", "monthly");
for (const p of libraryChildPaths) addUrl(p, "0.7", "monthly");

// Localize every canonical path via the project's own router (viewToPath),
// so the sitemap's localized URLs always match the prerendered routes.
const helperTmp = resolve(root, "scripts", ".sitemap-routes-bundle.mjs");
const { build } = await import("esbuild");
await build({
  entryPoints: [resolve(root, "scripts", "sitemap-routes.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile: helperTmp,
  logLevel: "silent",
});
const { localizedVariants } = await import(pathToFileURL(helperTmp).href);
const localized = localizedVariants([...urls.keys()]);
rmSync(helperTmp, { force: true });

// Real lastmod dates: bundled from src/changelogData.ts (per-tool git history)
// and src/blog/blogData.ts (article publish dates). Paths without a documented
// date simply omit <lastmod> — build date is never used.
const datesTmp = resolve(root, "scripts", ".sitemap-dates-bundle.mjs");
await build({
  entryPoints: [resolve(root, "scripts", "sitemap-dates.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile: datesTmp,
  logLevel: "silent",
});
const { getLastmod } = await import(pathToFileURL(datesTmp).href);
rmSync(datesTmp, { force: true });

const lastmodTag = (path) => {
  const lastmod = getLastmod(path);
  return lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
};

// Generate public/feed.xml — an RSS 2.0 feed built from the SAME blog registry
// the /blog pages render (src/blog/blogData.ts). Items use the real article
// title/description/date/author; nothing is invented or back-dated.
const rssTmp = resolve(root, "scripts", ".rss-data-bundle.mjs");
await build({
  entryPoints: [resolve(root, "scripts", "rss-data.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile: rssTmp,
  logLevel: "silent",
});
const { buildRssData } = await import(pathToFileURL(rssTmp).href);
const rssArticles = buildRssData();
rmSync(rssTmp, { force: true });

const toRfc822 = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
};
const escXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

let feed = `<?xml version="1.0" encoding="UTF-8"?>\n`;
feed += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
feed += `  <channel>\n`;
feed += `    <title>GainUtility Blog</title>\n`;
feed += `    <link>${SITE_URL}/blog</link>\n`;
feed += `    <description>Practical, problem-first guides from GainUtility — a collection of fast browser-based tools for PDF, image, JSON, developer, and SEO work.</description>\n`;
feed += `    <language>en</language>\n`;
feed += `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n`;
for (const a of rssArticles) {
  feed += `    <item>\n`;
  feed += `      <title>${escXml(a.title)}</title>\n`;
  feed += `      <link>${SITE_URL}/blog/${escXml(a.slug)}</link>\n`;
  feed += `      <guid isPermaLink="true">${SITE_URL}/blog/${escXml(a.slug)}</guid>\n`;
  feed += `      <description>${escXml(a.description)}</description>\n`;
  feed += `      <pubDate>${toRfc822(a.date)}</pubDate>\n`;
  feed += `      <category>${escXml(a.category)}</category>\n`;
  feed += `      <author>${escXml(a.author)}</author>\n`;
  feed += `    </item>\n`;
}
feed += `  </channel>\n`;
feed += `</rss>\n`;
writeFileSync(resolve(root, "public", "feed.xml"), feed);

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// The homepage canonical is emitted without a trailing slash
// (`<link rel="canonical" href="https://gainutility.com">`), so the sitemap
// must advertise the same form — otherwise the two signals disagree on the
// site's most important URL.
// The root keeps its trailing slash so <loc> matches the homepage canonical,
// hreflang="en"/x-default, JSON-LD url and internal href="/" exactly.
const locFor = (path) => `${SITE_URL}${path}`;

for (const [path, meta] of urls) {
  xml += `  <url><loc>${locFor(path)}</loc>${lastmodTag(path)}<changefreq>${meta.changefreq}</changefreq><priority>${meta.priority}</priority></url>\n`;
}
for (const v of localized) {
  // Skip the default locale (already emitted above) and any path that could
  // not be localized by the router.
  if (v.locale === "en") continue;
  // INDEX-READY audit (Phase H): the 20 es-CO URLs are near-byte-identical
  // duplicates of es-MX (differing only in nav self-locale links, og:locale/
  // canonical/hreflang, one heading's casing and a few meta-description
  // words). es-CO pages stay LIVE and prerendered, but are intentionally
  // excluded from the sitemap until that locale gets genuinely localized
  // content. (Hreflang annotations are now suppressed on those noindex pages
  // — see INDEXING-REPORT.md, finding C1.)
  if (v.locale === "es-co") continue;
  xml += `  <url><loc>${locFor(v.path)}</loc>${lastmodTag(v.base)}<changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;
}

xml += `</urlset>\n`;

writeFileSync(resolve(root, "public", "sitemap.xml"), xml);

writeFileSync(
  resolve(root, "public", "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

// Legacy single-segment URLs -> canonical /tools/<id>, /site-audit.
// Consolidated aliases are skipped here: they get a SINGLE direct hop to the
// canonical tool below (no /alias -> /tools/alias -> /tools/canonical chain).
const legacyToolRedirects = toolIds
  .filter(id => !SITEMAP_EXCLUDES.has(id) && !CONSOLIDATED_TOOL_ALIASES.has(id))
  .map(id => ({
    source: `/${id}`,
    destination: `/tools/${id}`,
    permanent: true,
  }));

// Consolidated "Classic" JSON tools + tool aliases -> their modern successor.
// Both the old /tools/<id> URLs and the legacy single-segment forms redirect
// straight to the FINAL canonical URL in one hop, so no stale bookmark, index
// link, or direct URL lands on a superseded page or chains through an intermediate.
const consolidatedRedirects = [
  // formatter -> beautifier
  { source: "/tools/json-formatter", destination: "/tools/json-beautifier", permanent: true },
  { source: "/json-formatter", destination: "/tools/json-beautifier", permanent: true },
  // viewer -> tree view
  { source: "/tools/json-viewer", destination: "/tools/json-tree-viewer", permanent: true },
  { source: "/json-viewer", destination: "/tools/json-tree-viewer", permanent: true },
  // compare -> compare & diff
  { source: "/tools/json-compare", destination: "/tools/json-compare-diff", permanent: true },
  { source: "/json-compare", destination: "/tools/json-compare-diff", permanent: true },
  // Tool aliases consolidated per INDEX-READY Phase I/II/III:
  // image-converter aliases (same <ImageConverter>, no format preset)
  ...[...CONSOLIDATED_TOOL_ALIASES].flatMap(([alias, target]) => [
    { source: `/tools/${alias}`, destination: `/tools/${target}`, permanent: true },
    { source: `/${alias}`, destination: `/tools/${target}`, permanent: true },
  ]),
];

// Removed tools that formerly had public /tools/ URLs now live inside Color
// Studio, so every old public path redirects to the studio section instead,
// or (for the retired PDF Compressor and Image Compressor)
// to the tool that replaced them or the matching hub page.
const removedToolRedirects = [
  { source: "/color-scale-generator", destination: "/studios/color/generator", permanent: true },
  { source: "/image-color-palette-extractor", destination: "/studios/color/image", permanent: true },
  { source: "/tools/color-scale-generator", destination: "/studios/color/generator", permanent: true },
  { source: "/tools/image-color-palette-extractor", destination: "/studios/color/image", permanent: true },
  // PDF Compressor retired — "Compress Images Inside PDF" is its surviving successor.
  { source: "/compress-pdf", destination: "/tools/compress-images-inside-pdf", permanent: true },
  { source: "/tools/compress-pdf", destination: "/tools/compress-images-inside-pdf", permanent: true },
  // Image Compressor retired — the /image hub (and its localized copies) replaces it.
  { source: "/image-compressor", destination: "/image", permanent: true },
  { source: "/tools/image-compressor", destination: "/image", permanent: true },
  { source: "/pt-br/tools/comprimir-imagem", destination: "/pt-br/image", permanent: true },
  { source: "/id/tools/kompres-gambar", destination: "/id/image", permanent: true },
  { source: "/es-mx/tools/comprimir-imagen", destination: "/es-mx/image", permanent: true },
  { source: "/es-co/tools/comprimir-imagen", destination: "/es-co/image", permanent: true },
  { source: "/de/tools/bild-komprimieren", destination: "/de/image", permanent: true },
  { source: "/fr/tools/compresser-image", destination: "/fr/image", permanent: true },
  { source: "/it/tools/comprimere-immagine", destination: "/it/image", permanent: true },
  // Retired /image/compress hub sub-page → the surviving /image hub.
  { source: "/image/compress", destination: "/image", permanent: true },
  // Retired "image compress vs resize" comparison → the existing image-resizer page.
  { source: "/compare/image-compress-vs-resize", destination: "/tools/image-resizer", permanent: true },
];

// The former agency "/services" page (and its localized copies) is retired —
// GainUtility is one product: a collection of free online tools. Every legacy
// services URL 301s to the tools hub in the matching locale.
const servicesRedirects = [
  { source: "/services", destination: "/" },
  { source: "/pt-br/services", destination: "/pt-br" },
  { source: "/id/services", destination: "/id" },
  { source: "/es-mx/services", destination: "/es-mx" },
  { source: "/es-co/services", destination: "/es-co" },
  { source: "/de/services", destination: "/de" },
  { source: "/fr/services", destination: "/fr" },
  { source: "/it/services", destination: "/it" },
].map((r) => ({ ...r, permanent: true }));

// Retired/renamed blog articles — old bookmarks and index links keep working
// by 301-ing to the article that replaced them in the consolidated registry.
const blogLegacyRedirects = [
  { source: "/blog/download-exam-images-one-by-one-built-a-tool", destination: "/blog/how-to-convert-jpg-to-pdf", permanent: true },
  { source: "/blog/exam-photo-size-frustrations-fixer", destination: "/blog/how-to-resize-an-image", permanent: true },
  { source: "/blog/download-government-exam-documents-shouldnt-be-tedious", destination: "/blog/fix-pdf-too-big-to-upload", permanent: true },
  { source: "/blog/split-merge-pdf-workflow", destination: "/blog/how-to-merge-pdf-files", permanent: true },
  { source: "/blog/compress-pdf-size-vs-quality", destination: "/blog/how-to-compress-a-pdf", permanent: true },
  // Suggested slug for the box-shadow research article — the published canonical
  // is box-shadow-values-real-websites; 301 rather than shipping a duplicate.
  { source: "/blog/real-world-box-shadow-values", destination: "/blog/box-shadow-values-real-websites", permanent: true },
];

const vercelConfig = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  trailingSlash: false,
  redirects: [
    ...legacyToolRedirects,
    ...consolidatedRedirects,
    ...removedToolRedirects,
    ...servicesRedirects,
    ...blogLegacyRedirects,
    { source: "/audit", destination: "/site-audit", permanent: true },
    // /video previously half-aliased the Media tools page; the public media
    // page lives at /media, so the old path 301s there instead of 404ing.
    { source: "/video", destination: "/media", permanent: true },
    // Image category aliases -> canonical /image hub
    { source: "/images", destination: "/image", permanent: true },
    { source: "/tools/images", destination: "/image", permanent: true },
  ],
};
writeFileSync(resolve(root, "vercel.json"), JSON.stringify(vercelConfig, null, 2) + "\n");

let netlify = "";
for (const id of toolIds) {
  if (SITEMAP_EXCLUDES.has(id)) continue;
  // Aliases redirect straight to the canonical tool (one hop) further below.
  if (CONSOLIDATED_TOOL_ALIASES.has(id)) continue;
  netlify += `/${id}              /tools/${id}              301\n`;
}
netlify += `/audit             /site-audit               301\n`;
netlify += `/video             /media                    301\n`;
netlify += `/images            /image                    301\n`;
netlify += `/tools/images      /image                    301\n`;
for (const r of consolidatedRedirects) netlify += `${r.source.padEnd(18)} ${r.destination.padEnd(25)} 301\n`;
for (const r of removedToolRedirects) netlify += `${r.source.padEnd(18)} ${r.destination.padEnd(25)} 301\n`;
for (const r of servicesRedirects) netlify += `${r.source.padEnd(18)} ${r.destination.padEnd(25)} 301\n`;
for (const r of blogLegacyRedirects) netlify += `${r.source.padEnd(36)} ${r.destination.padEnd(36)} 301\n`;
// 410 Gone for permanently removed tools
netlify += `/image-to-code                    410\n`;
netlify += `/tools/image-to-code              410\n`;
writeFileSync(resolve(root, "public", "_redirects"), netlify);

console.log(
  `sitemap.xml: ${staticPaths.length} static + ${toolIds.length} tools` +
  `${hasTranslatorTool ? ` + ${pairSlugs.length} translator pairs` : ""} | ` +
  `${urls.size} canonical English URLs (${colorSlugs.length} colors + ${curatedPaletteSlugs.length} curated palettes + ${uiSystemIds.length} ui-color systems) | ` +
  `${toolIds.length + 1} legacy redirects written`
);
