/**
 * Indexing forensics — reads the generated dist/client output + sitemap +
 * redirects + registries and prints the numbers required by the indexing
 * report (routes, duplicates, canonical/noindex problems, thin content,
 * A–F classification of every tool URL). Read-only. Run: node scripts/forensics-indexing.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { SITEMAP_EXCLUDES } from "./sitemap-excludes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist", "client");
const SITE = "https://gainutility.com";
const LOCALE_RE = /^\/((?:pt-br|es-mx|es-co|de|fr|it|id))(?=\/|$)/;
const localeOf = (r) => (r.match(LOCALE_RE) ? r.match(LOCALE_RE)[1] : "en");

/* ---------- HTML pages ---------- */
const htmlFiles = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
};
walk(dist);

const routeOf = (f) => {
  const rel = relative(dist, f).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  return "/" + rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
};

const pages = [];
for (const f of htmlFiles) {
  const route = routeOf(f);
  const html = readFileSync(f, "utf8");
  const pick = (re) => html.match(re)?.[1] ?? null;
  const title = pick(/<title>([^<]*)<\/title>/);
  const desc = pick(/<meta\s+name="description"\s+content="([^"]*)"/);
  const canonical = pick(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  const robots = pick(/<meta\s+name="robots"\s+content="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, "").trim()
  );
  const rootIdx = html.indexOf('<div id="root"');
  const body = rootIdx >= 0 ? html.slice(rootIdx) : html;
  const text = (body
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim());
  const words = text ? text.split(" ").length : 0;
  const links = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  pages.push({ route, title, desc, canonical, robots, h1s, words, links, body });
}

const pageByRoute = new Map(pages.map((p) => [p.route, p]));

/* ---------- sitemap ---------- */
const smXml = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
const smLocs = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smPaths = smLocs.map((u) => u.slice(SITE.length) || "/");

/* ---------- redirects ---------- */
const redirects = [];
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
for (const r of vercel.redirects ?? []) redirects.push(r);
for (const line of readFileSync(join(root, "public", "_redirects"), "utf8").split("\n")) {
  const m = line.trim().match(/^(\S+)\s+(\S+)\s+(30\d|200)$/);
  if (m) redirects.push({ source: m[1], destination: m[2], code: m[3] });
}
const redirectSources = new Set(redirects.map((r) => r.source));

/* ---------- App wiring ---------- */
const appSrc = readFileSync(join(root, "src", "App.tsx"), "utf8");
const ratBlock = appSrc.match(/const renderActiveTool[\s\S]*?const renderSeoPageTool/)?.[0] ?? "";
const wired = new Set([...ratBlock.matchAll(/case "([a-z0-9-]+)"/g)].map((m) => m[1]));

/* ---------- components that render their own Related Tools section ---------- */
const compDir = resolve(root, "src", "components");
const relatedRenderers = [];
const scanRelated = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { scanRelated(p); continue; }
    if (!/\.(tsx|ts)$/.test(e)) continue;
    const src = readFileSync(p, "utf8");
    const selfHeading = /t\("relatedTools"|Related tools — strictly|aria-label=\{t\("relatedTools"/.test(src);
    if (selfHeading && e !== "Layout.tsx") relatedRenderers.push(p.slice(root.length + 1).replace(/\\/g, "/"));
  }
};
scanRelated(compDir);

/* ---------- esbuild probe for registries ---------- */
const esbuild = await import("esbuild");
const tmp = resolve(root, "scripts", ".forensics-probe.mjs");
await esbuild.build({
  stdin: {
    contents: `
      export { toolsRegistry } from "./src/toolsRegistry";
      export { getSEOMetadata } from "./src/data";
      export { buildPageMeta, getMergedSEO } from "./src/seo/shared";
      export { STATIC_PATHS, pathToView, viewToPath } from "./src/router";
      export { TRANSLATOR_PAIR_SLUGS } from "./src/seo/translatorPairs";
      export { SEO_PAGE_MAP } from "./src/seo/seoPageContent";
      export { COMPARISON_PAGE_MAP, CATEGORY_BEST_PAGES } from "./src/seo/comparisonPages";
      export { CURATED_PALETTES, UI_COLOR_SYSTEMS, NAMED_COLORS, HERO_COLORS } from "./src/colorStudio/colorData";
      export { BLOG_ARTICLES } from "./src/blog/blogData";
      export { TOTAL_TOOL_COUNT } from "./src/toolsDirectory";
    `,
    resolveDir: root,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  jsx: "automatic",
  outfile: tmp,
  logLevel: "silent",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE),
  },
});
const probe = await import(pathToFileURL(tmp).href);
const {
  toolsRegistry, getSEOMetadata, getMergedSEO, STATIC_PATHS, TRANSLATOR_PAIR_SLUGS,
  SEO_PAGE_MAP, COMPARISON_PAGE_MAP, CURATED_PALETTES, UI_COLOR_SYSTEMS,
  NAMED_COLORS, HERO_COLORS, BLOG_ARTICLES, TOTAL_TOOL_COUNT,
} = probe;

/* ================= REPORT ================= */
const toolIds = Object.keys(toolsRegistry);
const enToolRoutes = toolIds.map((id) => `/tools/${id}`);
const excluded = [...SITEMAP_EXCLUDES];

const lines = [];
const P = (s = "") => lines.push(s);

P("=========== PHASE 8 REPORT NUMBERS ===========");
P();

/* 1. routes discovered */
const htmlRoutes = new Set(pages.map((p) => p.route));
const routeUnion = new Set([...htmlRoutes, ...smPaths, ...redirects.map((r) => r.source)]);
P(`1. Routes discovered (HTML ∪ sitemap ∪ redirect sources): ${routeUnion.size}`);
P(`   - prerendered HTML routes: ${htmlRoutes.size} (incl /404)`);
P(`   - sitemap URLs: ${smPaths.length} (en ${smPaths.filter((p) => localeOf(p) === "en").length}, localized ${smPaths.filter((p) => localeOf(p) !== "en").length})`);
P(`   - redirect source rules (vercel+_redirects, dedup pairs): ${redirects.length}`);
P();

/* 2. canonical tool pages */
const canonicalTools = enToolRoutes.filter((r) => !excluded.some((id) => r === `/tools/${id}`));
P(`2. Canonical tool pages (English /tools/<id>, excl SITEMAP_EXCLUDES): ${canonicalTools.length}`);
P(`   + ${TRANSLATOR_PAIR_SLUGS.length} translator pair sub-pages, ${Object.keys(SEO_PAGE_MAP).length} SEO hub/sub pages, ${Object.keys(COMPARISON_PAGE_MAP).length} comparison, ${probe.CATEGORY_BEST_PAGES?.length ?? 6} best, ${BLOG_ARTICLES.length} blog articles`);
P();

/* 3. duplicate/overlapping */
const ALIAS_GROUPS = [
  ["image-converter", "webp-converter", "png-jpg-converter", "heic-jpg-converter", "svg-converter"],
  ["json-formatter", "json-beautifier"],
  ["json-viewer", "json-tree-viewer"],
  ["json-compare", "json-compare-diff"],
  ["unlock-pdf", "remove-pdf-password"],
  ["extract-pdf", "delete-pdf"],
  ["split-pdf", "split-by-file-size", "split-every-n-pages", "extract-odd-pages-pdf", "extract-even-pages-pdf"],
  ["merge-pdf", "merge-selected-page-ranges"],
  ["contrast-checker", "color-visualizer"],
  ["gradient-generator", "color-palette-generator"],
  ["youtube-title-analyzer", "youtube-keyword-explorer"],
  ["slug-generator", "url-parser"],
  ["seo-meta-generator", "og-meta-generator", "twitter-card-generator"],
  ["password-generator", "password-strength-checker"],
  ["hash-generator", "jwt-decoder"],
];
let aliasToolCount = 0;
for (const g of ALIAS_GROUPS) aliasToolCount += g.filter((id) => toolIds.includes(id)).length;
const esCo = smPaths.filter((p) => p.startsWith("/es-co/")).length;
const esMx = smPaths.filter((p) => p.startsWith("/es-mx/")).length;
P(`3. Duplicate/overlapping pages:`);
P(`   - tools sharing one component / near-identical intent (alias groups): ${ALIAS_GROUPS.length} groups ≈ ${aliasToolCount} tool URLs`);
P(`   - es-co ↔ es-mx full-locale duplicates: ${esCo} URLs (es-co aliases es-mx copy by design)`);
P(`   - SEO hub sub-pages overlapping tool pages (e.g. /json/formatter vs /tools/json-beautifier): ${Object.keys(SEO_PAGE_MAP).length - 8} sub-pages`);
P(`   - localized tool variants: ${smPaths.filter((p) => localeOf(p) !== "en" && p.includes("/tools/")).length}`);
P();

/* 4-6. broken / redirects / 404 */
const inSmMissingHtml = smPaths.filter((p) => !htmlRoutes.has(p) && !redirectSources.has(p));
const htmlMissingSm = [...htmlRoutes].filter(
  (r) =>
    r !== "/404" &&
    !smPaths.includes(r) &&
    !r.startsWith("/studios/color/") &&
    !excluded.some((id) => r === `/tools/${id}`)
);
const notWired = toolIds.filter((id) => !wired.has(id));
P(`4. Broken pages: ${inSmMissingHtml.length} sitemap URLs without HTML; ${notWired.length} tools not wired in App (unroutable bodies)`);
if (inSmMissingHtml.length) P("   sitemap w/o HTML: " + inSmMissingHtml.join(", "));
if (htmlMissingSm.length) P("   HTML missing from sitemap: " + htmlMissingSm.join(", "));
P(`5. Redirect pages: ${new Set(redirects.map((r) => r.source)).size} unique redirect sources`);
P(`6. 404 route: /404 (1 shell). GSC reported 2 soft/hard 404 URLs — unknown from build; check GSC list.`);
P();

/* 7-9. duplicates per locale */
const dupCheck = (keyFn, label) => {
  const seen = new Map();
  const dups = [];
  for (const p of pages) {
    if (p.route === "/404") continue;
    const v = keyFn(p);
    if (!v) continue;
    const k = `${localeOf(p.route)}|${v}`;
    if (seen.has(k)) dups.push([p.route, seen.get(k)]);
    else seen.set(k, p.route);
  }
  P(`${label}: ${dups.length}`);
  for (const [a, b] of dups.slice(0, 25)) P(`   ${a} == ${b}`);
  if (dups.length > 25) P(`   ... +${dups.length - 25} more`);
  return dups;
};
const dupTitles = dupCheck((p) => p.title, "7. Duplicate titles (same locale)");
const dupH1 = dupCheck((p) => (p.h1s[0] || "").toLowerCase(), "8. Duplicate H1 (same locale)");
const dupDesc = dupCheck((p) => p.desc, "9. Duplicate meta descriptions (same locale)");
P();

/* 10-11. canonical / noindex */
const canonProblems = pages.filter((p) => {
  if (p.route === "/404") return false;
  const expected = p.route === "/" ? SITE + "/" : SITE + p.route;
  return !p.canonical || p.canonical !== expected;
});
const canonDups = (() => {
  const seen = new Map();
  let n = 0;
  for (const p of pages) {
    if (seen.has(p.canonical)) n++;
    else seen.set(p.canonical, p.route);
  }
  return n;
})();
const noindexPages = pages.filter((p) => /noindex/i.test(p.robots ?? "") && p.route !== "/404");
P(`10. Canonical problems: ${canonProblems.length} mismatch/missing, ${canonDups} duplicate canonicals`);
for (const p of canonProblems.slice(0, 10)) P(`   ${p.route} → ${p.canonical}`);
P(`11. Noindex problems (accidental noindex, excl /404): ${noindexPages.length}`);
for (const p of noindexPages.slice(0, 10)) P(`   ${p.route}`);
P();

/* 12. weak/thin/unfinished */
const thinToolPages = [];
const registryWeak = [];
for (const id of toolIds) {
  const route = `/tools/${id}`;
  const pg = pageByRoute.get(route);
  const seo = getSEOMetadata(id, SITE);
  const merged = getMergedSEO(id);
  const faqs = (merged.faqs ?? []).length;
  const steps = (merged.detailedContent?.steps ?? []).length;
  const rel = (merged.related ?? []).length;
  const words = pg?.words ?? 0;
  const reasons = [];
  if (!seo) reasons.push("fallback SEO");
  if (faqs < 3) reasons.push(`faqs=${faqs}`);
  if (steps < 3) reasons.push(`steps=${steps}`);
  if (rel < 2) reasons.push(`related=${rel}`);
  if (words < 700) reasons.push(`words=${words}`);
  if (reasons.length) registryWeak.push({ id, reasons, words, faqs, steps, rel });
}
const colorPages = pages.filter((p) => /^\/(colors|color-palettes|ui-colors)\//.test(p.route));
const colorThin = colorPages.filter((p) => p.words < 400);
const localizedThin = pages.filter((p) => localeOf(p.route) !== "en" && p.words < 500);
P(`12. Weak/thin/unfinished content:`);
P(`   - tool pages with weak signals (fallback SEO / <3 FAQ / <3 steps / <2 related / <700 words): ${registryWeak.length} / ${toolIds.length}`);
for (const w of registryWeak) P(`     /tools/${w.id}: ${w.reasons.join(", ")}`);
P(`   - color pages: ${colorPages.length} total, ${colorThin.length} with <400 words`);
P(`   - localized pages with <500 words: ${localizedThin.length}`);
P();

/* word-count distribution of tool pages */
const toolWords = enToolRoutes.map((r) => pageByRoute.get(r)?.words ?? 0).sort((a, b) => a - b);
P(`   tool page visible-word stats: min ${toolWords[0]}, p25 ${toolWords[Math.floor(toolWords.length * 0.25)]}, median ${toolWords[Math.floor(toolWords.length / 0.5)]}, p75 ${toolWords[Math.floor(toolWords.length * 0.75)]}, max ${toolWords[toolWords.length - 1]}`);
P();

/* 13. recommended indexable set (rule-based) */
const F_ROUTES = [
  ...excluded.map((id) => `/tools/${id}`),
  ...colorPages.map((p) => p.route),
  ...smPaths.filter((p) => p.startsWith("/es-co/")),
];
P(`13. Recommended indexable URL set (proposal):`);
P(`   - ${canonicalTools.filter((id) => !F_ROUTES.includes(`/tools/${id}`)).length} English tool pages`);
P(`   - ${TRANSLATOR_PAIR_SLUGS.length} translator pairs (evaluate merge later)`);
P(`   - ${Object.keys(SEO_PAGE_MAP).length} SEO hubs+subpages, ${Object.keys(COMPARISON_PAGE_MAP).length} comparisons, 6 best pages`);
P(`   - ${BLOG_ARTICLES.length} blog articles + 11 static + home`);
P(`   - localized: en minus es-co (${esCo} dup) minus color pages (${colorPages.filter((p) => localeOf(p.route) !== "en").length})`);
P(`   - EXCLUDE: ${F_ROUTES.length} URLs (3 classics, ${colorPages.length} color pages, ${esCo} es-co dups, /studios/color/*)`);
P();

/* 14-15. related tools */
P(`14. Files rendering a Related Tools section (besides Layout):`);
for (const f of relatedRenderers) P(`   - ${f}`);
P(`   + scripts/prerender-entry.ts bodyContent "tool" case (Related tools + More <cat> tools, only used for non-SSR shells)`);
P(`15. Root cause: Layout.tsx §6 "Related Tools" grid renders for EVERY tool view from SEO metadata.related,`);
P(`    while tool bodies ALSO render their own related links (PdfToolShell §10, PdfTranslator, ContinueEditing h3,`);
P(`    image tools' post-download related strip) → 2 (sometimes 3) "Related Tools" blocks per tool page after hydration,`);
P(`    plus Layout §6b "More <category> tools" as a fourth related-links block.`);
P();

/* ============ PHASE 2: A–F classification =========== */
P("=========== PHASE 2: TOOL URL CLASSIFICATION (A–F) ===========");
const classify = (id) => {
  const route = `/tools/${id}`;
  if (SITEMAP_EXCLUDES.has(id)) return ["E", "301-redirected classic (SITEMAP_EXCLUDES)"];
  if (!wired.has(id)) return ["D", "not wired in App — 'tool isn't wired up yet'"];
  if (ALIAS_GROUPS.some((g) => g.includes(id) && g[0] !== id)) {
    // alias member (not the canonical representative)
    return ["C", `overlapping intent with ${ALIAS_GROUPS.find((g) => g.includes(id)).filter((x) => x !== id).join("/")}`];
  }
  const seo = getSEOMetadata(id, SITE);
  const merged = getMergedSEO(id);
  const pg = pageByRoute.get(route);
  const faqs = (merged.faqs ?? []).length;
  const steps = (merged.detailedContent?.steps ?? []).length;
  const rel = (merged.related ?? []).length;
  const reasons = [];
  if (!seo) reasons.push("fallback SEO entry");
  if (faqs < 3) reasons.push(`only ${faqs} FAQs`);
  if (steps < 3) reasons.push(`only ${steps} how-to steps`);
  if (rel < 2) reasons.push(`only ${rel} related links`);
  if ((pg?.words ?? 0) < 700) reasons.push(`thin rendered HTML (${pg?.words} words)`);
  if (reasons.length) return ["B", reasons.join("; ")];
  return ["A", "wired, full SEO metadata, unique meta, adequate rendered content"];
};
const buckets = { A: [], B: [], C: [], D: [], E: [], F: [] };
for (const id of toolIds) buckets[classify(id)[0]].push(id);
// non-tool URL families
const classifyOther = () => {
  const rows = [];
  for (const p of smPaths) {
    if (p.startsWith("/tools/")) continue;
    let cls = "A", why = "static/hub content page";
    if (/^\/(colors|color-palettes|ui-colors)\//.test(p)) { cls = "F"; why = "programmatic color reference page, thin & low intent"; }
    else if (p.startsWith("/es-co/")) { cls = "F"; why = "duplicate of es-mx locale"; }
    else if (p.startsWith("/compare/")) { cls = "B"; why = "comparison page — verify usefulness before indexing"; }
    else if (p.includes("/best")) { cls = "B"; why = "category best page — verify usefulness"; }
    else if (p.startsWith("/tools/pdf-translator/")) { cls = "B"; why = "translator pair page — template similarity across pairs"; }
    rows.push([p, cls, why]);
  }
  return rows;
};
const others = classifyOther();
P(`Tool pages: A=${buckets.A.length} B=${buckets.B.length} C=${buckets.C.length} D=${buckets.D.length} E=${buckets.E.length} F=${buckets.F.length}`);
P();
for (const k of ["A", "B", "C", "D", "E", "F"]) {
  P(`[${k}] (${buckets[k].length})`);
  if (k === "B") {
    for (const id of buckets[k]) P(`   /tools/${id} — ${classify(id)[1]}`);
  } else {
    for (const id of buckets[k]) P(`   /tools/${id}`);
  }
  P();
}
P(`[non-tool sitemap URLs] (${others.length})`);
const otherBuckets = {};
for (const [p, c, w] of others) {
  otherBuckets[c] = otherBuckets[c] ?? [];
  otherBuckets[c].push([p, w]);
}
for (const [c, rows] of Object.entries(otherBuckets)) {
  P(`  ${c}: ${rows.length}`);
  if (c !== "A") for (const [p, w] of rows.slice(0, 40)) P(`     ${p} — ${w}`);
}

console.log(lines.join("\n"));
try { (await import("node:fs")).rmSync(tmp, { force: true }); } catch {}
