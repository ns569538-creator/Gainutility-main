import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { SITEMAP_EXCLUDES } from "./sitemap-excludes.mjs";

const ROOT = "dist/client";
const SITE = "https://gainutility.com";

const sm = readFileSync("public/sitemap.xml", "utf8");
const smPaths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ""));

function htmlFile(route) {
  const r = route === "/" ? "index.html" : route.replace(/^\//, "") + ".html";
  const p = `${ROOT}/${r}`;
  return existsSync(p) ? p : null;
}
function textOf(html) {
  const i = html.indexOf('<div id="root"');
  const root = i >= 0 ? html.slice(i) : html;
  return root
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function mainWords(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) return null;
  const t = m[1].replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
  return t.split(" ").filter(Boolean).length;
}
function metaOf(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}
const esc = (s) => String(s).replace(/"/g, '""').replace(/\r?\n/g, " ");

/* ================= PHASE H: es-co vs es-mx ================= */
console.log("=== PHASE H: es-CO vs es-MX ===");
let identical = 0, differing = [];
const esCoPaths = smPaths.filter((p) => p.startsWith("/es-co/"));
// es-co localizes a few tool slugs (combinar-pdf) that es-mx names differently
// (unir-pdf) — map them so the pair check doesn't false-fail on the slug.
const ESCO_SLUG_TO_ESMX = { "combinar-pdf": "unir-pdf" };
for (const p of esCoPaths) {
  const mxPath = p.replace("/es-co/", "/es-mx/");
  let a = htmlFile(mxPath);
  if (!a) {
    const slug = p.split("/").pop();
    const mapped = ESCO_SLUG_TO_ESMX[slug];
    if (mapped) a = htmlFile(mxPath.replace(`/tools/${slug}`, `/tools/${mapped}`));
  }
  const b = htmlFile(p);
  if (!a || !b) { differing.push(p + " (missing html)"); continue; }
  const strip = (s) => s
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, "")
    .replace(/<link[^>]*hreflang[^>]*>/g, "")
    .replace(/<meta[^>]+property="og:locale"[^>]+>/g, "")
    .replace(/<html lang="[^"]*"/, "<html lang=X");
  if (strip(readFileSync(a, "utf8")) === strip(readFileSync(b, "utf8"))) identical++;
  else differing.push(p);
}
console.log(`es-co URLs in sitemap: ${esCoPaths.length}; identical to es-mx (excl canonical/hreflang): ${identical}; differing: ${differing.length}`);
if (differing.length) console.log("differing:", differing.slice(0, 20).join(", "));
// hreflang samples
const sample = htmlFile("/es-co/tools/contrast-checker");
if (sample) {
  const h = readFileSync(sample, "utf8");
  const hl = [...h.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map((m) => `${m[1]}:${m[2].replace(SITE, "")}`);
  console.log("hreflang on es-co sample:", hl.join(" | ") || "(none found via this regex)");
}
console.log();

/* ================= PHASE G: color pages sample ================= */
console.log("=== PHASE G: color pages ===");
const colorPaths = smPaths.filter((p) => /\/(colors|color-palettes|ui-colors)\//.test(p));
console.log(`color-family URLs in sitemap: ${colorPaths.length}`);
let colorWords = [];
for (const p of colorPaths) {
  const f = htmlFile(p);
  if (!f) continue;
  colorWords.push({ p, w: textOf(readFileSync(f, "utf8")).split(" ").filter(Boolean).length });
}
colorWords.sort((a, b) => a.w - b.w);
console.log(`measured: n=${colorWords.length} min=${colorWords[0]?.w} median=${colorWords[Math.floor(colorWords.length / 2)]?.w} max=${colorWords[colorWords.length - 1]?.w}`);
console.log("sample thin:", colorWords.slice(0, 3).map((x) => `${x.p}:${x.w}`).join(" "), "| richest:", colorWords.slice(-3).map((x) => `${x.p}:${x.w}`).join(" "));
// unique-ish? check first 120 chars of body text variation
const sigs = new Set();
for (const { p } of colorWords) {
  const t = textOf(readFileSync(htmlFile(p), "utf8"));
  sigs.add(t.slice(0, 150));
}
console.log(`distinct 150-char openings: ${sigs.size}/${colorWords.length}`);
console.log();

/* ================= PHASE E: FAQ repetition ================= */
console.log("=== PHASE E: FAQ audit ===");
const faqByQ = new Map(); // question -> [tool routes]
const toolRoutes = smPaths.filter((p) => /^\/tools\/[^/]+$/.test(p) && !p.includes("/pdf-translator/"));
for (const p of toolRoutes) {
  const f = htmlFile(p);
  if (!f) continue;
  const h = readFileSync(f, "utf8");
  const qs = [...h.matchAll(/<summary[^>]*>\s*<span>([^<]+)<\/span>/g)].map((m) => m[1].trim());
  for (const q of qs) {
    if (!faqByQ.has(q)) faqByQ.set(q, []);
    faqByQ.get(q).push(p);
  }
}
const totalQ = [...faqByQ.values()].reduce((n, a) => n + a.length, 0);
const shared = [...faqByQ.entries()].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);
console.log(`tool pages checked: ${toolRoutes.length}; total FAQ questions rendered: ${totalQ}; unique questions: ${faqByQ.size}`);
console.log(`questions appearing on >1 tool page: ${shared.length}`);
console.log("top repeated questions:");
for (const [q, v] of shared.slice(0, 15)) console.log(`  [${v.length}×] ${q}`);
// privacy-question phrasing variants
const privacyish = [...faqByQ.keys()].filter((q) => /upload|stored|private|privacy|leave (my|the) (device|browser)|server/i.test(q));
console.log(`privacy-related question variants: ${privacyish.length}`);
privacyish.slice(0, 10).forEach((q) => console.log("  *", q));
console.log();

/* ================= PHASE D: steps presence & genericity ================= */
console.log("=== PHASE D: HOW TO USE steps (source-level) ===");
// steps live in src/seo/*.ts behind accordions; check how many tools have steps in data
const seoFiles = ["src/data.ts", "src/seo/shared.ts", "src/seo/extraExams.ts", "src/seo/extraCreator.ts", "src/seo/extraColorTools.ts", "src/seo/translatorPairs.ts", "src/seo/seoPageContent.ts"];
let stepBlocks = 0, faqBlocks = 0;
for (const file of seoFiles) {
  if (!existsSync(file)) continue;
  const src = readFileSync(file, "utf8");
  stepBlocks += (src.match(/steps:\s*\[/g) || []).length;
  faqBlocks += (src.match(/faq:\s*\[/g) || []).length;
}
console.log(`source files: steps arrays=${stepBlocks}, faq arrays=${faqBlocks}`);
{
  let stepsInHtml = 0, limInHtml = 0, tsInHtml = 0;
  for (const p of toolRoutes) {
    const f = htmlFile(p);
    if (!f) continue;
    const h = readFileSync(f, "utf8");
    if (/How to use/i.test(h)) stepsInHtml++;
    if (/Limitations/i.test(h)) limInHtml++;
    if (/Troubleshooting/i.test(h)) tsInHtml++;
  }
  console.log(`rendered in HTML: How-to ${stepsInHtml}/${toolRoutes.length}, limitations ${limInHtml}/${toolRoutes.length}, troubleshooting ${tsInHtml}/${toolRoutes.length} (accordions CSS-hidden but present in DOM)`);
}
console.log();

/* ================= PHASE F: related tools render sites ================= */
console.log("=== PHASE F: Related Tools render sites ===");
const rgxFiles = {
  "Layout.tsx §6 (h2 relatedTools)": "src/components/Layout.tsx",
  "PdfToolShell §10 (h2)": "src/components/pdf/PdfToolShell.tsx",
  "PdfTranslator (own section)": "src/components/PdfTranslator.tsx",
  "ContinueEditing (h3, post-process)": "src/components/ContinueEditing.tsx",
  "ToolPageLayout (dead props)": "src/components/ToolPageLayout.tsx",
  "SeoLandingPage relatedTools (hub page — OK)": "src/components/SeoLandingPage.tsx",
  "prerender-entry bodyContent tool case": "scripts/prerender-entry.ts",
};
for (const [label, file] of Object.entries(rgxFiles)) {
  const src = existsSync(file) ? readFileSync(file, "utf8") : "";
  const hits = (src.match(/relatedTools|Related [Tt]ools|related tools/g) || []).length;
  console.log(`  ${label}: ${hits} reference(s)`);
}
// §6b More-tools block
const layout = readFileSync("src/components/Layout.tsx", "utf8");
const moreIdx = layout.indexOf("moreTools");
console.log(`  Layout "moreTools" (§6b More <cat> tools): ${moreIdx >= 0 ? "present" : "absent"}`);
console.log();

/* ================= PHASE I: alias pairs — component & intent diff ================= */
console.log("=== PHASE I: alias groups ===");
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
// which component does each tool render? read App.tsx case bodies
const app = readFileSync("src/App.tsx", "utf8");
function caseBody(id) {
  const re = new RegExp(`case "${id}":\\s*return\\s*\\(?([^;]{0,200})`, "m");
  const m = app.match(re);
  if (m) return m[1].replace(/\s+/g, " ").trim().slice(0, 120);
  // try without return (fallthrough to component)
  const re2 = new RegExp(`case "${id}":`, "g");
  if (re2.test(app)) return "(see switch)";
  return "(not in App switch?)";
}
for (const g of ALIAS_GROUPS) {
  console.log(` group: ${g.join(" ↔ ")}`);
  for (const id of g) console.log(`   ${id} -> ${caseBody(id)}`);
}
console.log();

/* ================= PHASE J: internal linking hierarchy ================= */
console.log("=== PHASE J: internal linking ===");
// hub pages link their tools? check a hub html for /tools/ links
for (const hub of ["/pdf", "/json", "/image", "/dev", "/css", "/seo"]) {
  const f = htmlFile(hub);
  if (!f) { console.log(` ${hub}: MISSING`); continue; }
  const h = readFileSync(f, "utf8");
  const toolLinks = new Set([...h.matchAll(/href="[^"]*(\/[^"]*\/tools\/[^"#?]+|\/tools\/[^"#?]+)"/g)].map((m) => m[1]));
  const localized = [...toolLinks].filter((l) => l.startsWith(`/${hub.slice(1)}`) || l.includes("/tools/")).length;
  console.log(` ${hub}: ${toolLinks.size} distinct tool links`);
}
// tool page -> hub breadcrumb link (seoHubForTool) + related grid
{
  const h = readFileSync(htmlFile("/tools/merge-pdf"), "utf8");
  const links = [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith(SITE) || l.startsWith("/"));
  const uniq = new Set(internal.map((l) => l.replace(SITE, "").split("#")[0]));
  console.log(` /tools/merge-pdf: ${uniq.size} distinct internal hrefs`);
  console.log("   sample:", [...uniq].slice(0, 15).join(" | "));
}
// homepage -> studio/tool hierarchy
{
  const h = readFileSync(htmlFile("/"), "utf8");
  const uniq = new Set([...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(SITE, "").split("#")[0]));
  const toolLinks = [...uniq].filter((l) => l.includes("/tools/"));
  console.log(` / (home): ${uniq.size} distinct internal hrefs, ${toolLinks.length} to tools`);
}
console.log();

/* ================= PHASE K: content-quality spot checks ================= */
console.log("=== PHASE K: spot checks ===");
const claims = /100%\s*(secure|private|free)|military-grade|guaranteed|unlimited\s*(files|size)|no\s*limits?\s*at\s*all|always works|works every time/i;
let claimHits = [];
for (const p of toolRoutes) {
  const f = htmlFile(p);
  if (!f) continue;
  const t = textOf(readFileSync(f, "utf8"));
  const m = t.match(claims);
  if (m) claimHits.push(`${p}: "${m[0]}"`);
}
console.log(`overclaim/absolute-language hits: ${claimHits.length}`);
claimHits.slice(0, 10).forEach((c) => console.log("  *", c));
// placeholder text
const ph = /lorem ipsum|coming soon|TODO|placeholder text|your (text|content) here/i;
let phHits = [];
for (const p of [...toolRoutes, "/creator", "/about"]) {
  const f = htmlFile(p);
  if (!f) continue;
  const t = textOf(readFileSync(f, "utf8"));
  if (ph.test(t)) phHits.push(p);
}
console.log(`placeholder-text hits: ${phHits.length}${phHits.length ? " -> " + phHits.join(", ") : ""}`);
console.log();

/* ================= PHASE L: technical SEO sweep (all sitemap URLs) ================= */
console.log("=== PHASE L: technical SEO (all sitemap URLs) ===");
let techFail = { missingHtml: [], noCanonical: [], wrongCanonical: [], noindex: [], noTitle: [], noDesc: [], noH1: [], noOg: [], multiH1: [] };
for (const p of smPaths) {
  const f = htmlFile(p);
  if (!f) { techFail.missingHtml.push(p); continue; }
  const h = readFileSync(f, "utf8");
  const can = metaOf(h, /<link rel="canonical" href="([^"]+)"/);
  if (!can) techFail.noCanonical.push(p);
  // Root is the one route allowed (and expected) to carry a trailing slash —
  // it matches the sitemap <loc>, hreflang en/x-default and JSON-LD url.
  else if (can !== (p === "/" ? SITE + "/" : SITE + p)) techFail.wrongCanonical.push(p + " -> " + can);
  if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(h)) techFail.noindex.push(p);
  const title = metaOf(h, /<title>([^<]*)<\/title>/);
  if (!title) techFail.noTitle.push(p);
  const desc = metaOf(h, /<meta name="description" content="([^"]*)"/);
  if (!desc) techFail.noDesc.push(p);
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s === 0) techFail.noH1.push(p);
  if (h1s > 1) techFail.multiH1.push(p);
  if (!/<meta[^>]+property="og:title"/.test(h)) techFail.noOg.push(p);
}
for (const [k, v] of Object.entries(techFail)) console.log(` ${k}: ${v.length}${v.length && v.length <= 8 ? " -> " + v.join(", ") : v.length > 8 ? " (sample: " + v.slice(0, 5).join(", ") + ")" : ""}`);
// robots.txt + www redirect + trailing slash
const robots = readFileSync("public/robots.txt", "utf8");
console.log(` robots.txt sitemap line: ${/sitemap:/i.test(robots) ? "yes" : "NO"}; user-agent: ${robots.split("\n")[0].trim()}`);
console.log();

/* ================= PHASE A + INDEX-READY REPORT ================= */
console.log("=== PHASE A: classification ===");
// classification rules (classics = the shared SITEMAP_EXCLUDES redirect set)
const CLASSIC_EXCLUDES = SITEMAP_EXCLUDES;
const COLOR_RE = /^\/(colors|color-palettes|ui-colors)\//;
const ESCO_RE = /^\/es-co(\/|$)/; // root /es-co too — exact es-mx duplicate (4% unique)
const STUDIO_RE = /^\/studios\/color\//;

// alias C-set per Phase I verdicts (component + intent analysis): only
// same-task overlaps consolidate. Every other alias-group member is a distinct
// tool (own component/algorithm/output) → stays B with intent-differentiation.
// json-beautifier / json-tree-viewer / json-compare-diff are the MODERN
// successors of the classics — they are canonical (B), never C.
const ALIAS_C_REASON = {
  "webp-converter": "same <ImageConverter> component as image-converter, no format preset",
  "png-jpg-converter": "same <ImageConverter> component as image-converter, no format preset",
  "heic-jpg-converter": "same <ImageConverter> component as image-converter, no format preset",
  "svg-converter": "same <ImageConverter> component as image-converter, no format preset",
  "merge-selected-page-ranges": "page-range sub-feature of merge-pdf",
};
const ALIAS_C_ACTION = {
  "/tools/merge-selected-page-ranges": "301 -> /tools/merge-pdf (implemented)",
  "/tools/webp-converter": "301 -> /tools/image-converter (implemented)",
  "/tools/png-jpg-converter": "301 -> /tools/image-converter (implemented)",
  "/tools/heic-jpg-converter": "301 -> /tools/image-converter (implemented)",
  "/tools/svg-converter": "301 -> /tools/image-converter (implemented)",
};
const ALIAS_C = new Set(Object.keys(ALIAS_C_REASON));
// json-formatter/viewer/compare are classics → C (excluded/redirect)
for (const id of CLASSIC_EXCLUDES) ALIAS_C.add(id);

function classify(p) {
  // D: utility/system/non-search
  if (p === "/404") return ["D", "error shell"];
  // C buckets
  if (COLOR_RE.test(p)) return ["C", "thin programmatic color page"];
  if (ESCO_RE.test(p)) return ["C", "exact duplicate of es-mx"];
  if (STUDIO_RE.test(p)) return ["C", "studio section, duplicate H1, not in sitemap"];
  const toolId = p.match(/^\/tools\/([^/]+)$/)?.[1];
  if (toolId && ALIAS_C.has(toolId)) return ["C", ALIAS_C_REASON[toolId] ?? "classic excluded; 301 to successor"];
  // B: hubs subpages overlapping tool intent, compare, best, translator pairs, localized tools
  if (/^\/tools\/pdf-translator\//.test(p)) return ["B", "translator pair — thin prerender, consolidate"];
  if (p === "/creator") return ["B", "landing page — added to sitemap in Phase 1; keep"];
  if (/^\/compare\//.test(p)) return ["B", "comparison page — verify depth"];
  if (/\/best$/.test(p)) return ["B", "category best — verify depth"];
  const toolMatch = p.match(/^\/([^/]+\/)?tools\//);
  if (toolMatch && !COLOR_RE.test(p)) return ["B", "tool page — steps/limitations/troubleshooting now in prerendered DOM; intent differentiation + depth review pending"];
  // hubs
  if (/^\/(pdf|json|image|dev|css|seo)(\/|$)/.test(p) || /^\/[a-z-]+\/(formatter|beautifier|validator|minifier|viewer|generator|checker|preview|encoder|decoder|builder|converter|compressor)$/.test(p)) {
    return ["B", "hub/SEO subpage — check overlap with tool pages"];
  }
  // blog, static, home, localized about/blog/hub
  if (p === "/" || /^\/(about|blog|privacy|terms|security|changelog|contact|tools|404|cookies|site-audit|media)$/.test(p) || /^\/blog\//.test(p) || /^\/(about|blog)$/.test(p) || /^\/(pdf|json|image|dev|css|seo|about|blog)$/.test(p)) return ["A", ""];
  if (/^\/(pt-br|de|fr|it|id|es-mx)\/tools\//.test(p)) return ["B", "localized tool variant — verify truly localized body"];
  if (/^\/(pt-br|de|fr|it|id|es-mx)\//.test(p)) return ["A", "localized unique page"];
  if (/^\/(pt-br|de|fr|it|id|es-mx)$/.test(p)) return ["A", "localized home"];
  return ["B", "default — review"];
}

const rows = [];
for (const p of smPaths) {
  const f = htmlFile(p);
  const h = f ? readFileSync(f, "utf8") : "";
  const [cls, reason] = classify(p);
  const words = h ? textOf(h).split(" ").filter(Boolean).length : 0;
  const mw = h ? mainWords(h) : null;
  const type = COLOR_RE.test(p) ? "color"
    : /^\/tools\/pdf-translator\//.test(p) ? "translator-pair"
    : p.match(/^\/tools\/([^/]+)$/)?.[1] ? "tool"
    : /^\/compare\//.test(p) ? "compare"
    : /\/best$/.test(p) ? "best"
    : /^\/blog\//.test(p) ? "blog-article"
    : p === "/blog" ? "blog-index"
    : /^(\/|\/about|\/privacy|\/terms|\/security|\/changelog|\/contact|\/tools)$/.test(p) ? "static"
    : /^\/[a-z/]+$/.test(p) && !/\/tools\//.test(p) ? "hub-or-subpage"
    : "other";
  rows.push({
    url: p,
    type,
    cls,
    reason,
    canonical: f ? metaOf(h, /<link rel="canonical" href="([^"]+)"/) : "",
    noindex: f ? /name="robots"[^>]*noindex/i.test(h) : false,
    inSitemap: true,
    words,
    mainWords: mw,
    toolStatus: type === "tool" ? "wired (App switch)" : "n/a",
  });
}
// /creator — only add a row if Phase 1's sitemap addition did not already
// produce one from smPaths (it is now a sitemap URL).
if (!rows.some((r) => r.url === "/creator")) {
  const p = "/creator";
  const f = htmlFile(p);
  const h = f ? readFileSync(f, "utf8") : "";
  const [cls, reason] = classify(p);
  rows.push({ url: p, type: "landing", cls, reason, canonical: metaOf(h, /<link rel="canonical" href="([^"]+)"/), noindex: /name="robots"[^>]*noindex/i.test(h), inSitemap: false, words: textOf(h).split(" ").filter(Boolean).length, mainWords: mainWords(h), toolStatus: "n/a" });
}
// studio sections (in HTML, not sitemap)
const studioDir = `${ROOT}/studios/color`;
if (existsSync(studioDir)) {
  for (const name of readdirSync(studioDir)) {
    if (!name.endsWith(".html")) continue;
    const p = `/studios/color/${name.replace(/\.html$/, "")}`;
    if (rows.some((r) => r.url === p)) continue;
    const h = readFileSync(`${studioDir}/${name}`, "utf8");
    rows.push({ url: p, type: "studio", cls: "C", reason: "studio section, duplicate H1", canonical: metaOf(h, /<link rel="canonical" href="([^"]+)"/), noindex: false, inSitemap: false, words: textOf(h).split(" ").filter(Boolean).length, mainWords: mainWords(h), toolStatus: "n/a" });
  }
}
// classics redirects
for (const id of CLASSIC_EXCLUDES) {
  rows.push({ url: `/tools/${id}`, type: "tool", cls: "C", reason: "classic excluded; 301 to successor", canonical: "(redirect)", noindex: false, inSitemap: false, words: 0, mainWords: null, toolStatus: "redirect" });
}
// /404
{
  const f = htmlFile("/404");
  const h = f ? readFileSync(f, "utf8") : "";
  rows.push({ url: "/404", type: "system", cls: "D", reason: "error shell", canonical: metaOf(h, /<link rel="canonical" href="([^"]+)"/), noindex: /name="robots"[^>]*noindex/i.test(h), inSitemap: false, words: textOf(h).split(" ").filter(Boolean).length, mainWords: mainWords(h), toolStatus: "n/a" });
}

/* ============ Unique content score + duplicate risk (5-gram Jaccard) ============ */
function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function contentText(html) {
  // Prefer <main> (the real page body). If missing or near-empty (<30 words),
  // fall back to #root text minus header/footer chrome.
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (m) {
    const t = stripTags(m[1]);
    if (t.split(" ").filter(Boolean).length >= 30) return t.toLowerCase();
  }
  const i = html.indexOf('<div id="root"');
  const root = i >= 0 ? html.slice(i) : html;
  return stripTags(
    root
      .replace(/<header[\s\S]*?<\/header>/g, " ")
      .replace(/<footer[\s\S]*?<\/footer>/g, " ")
  ).toLowerCase();
}
function grams(t, n = 5) {
  const w = t.split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(" "));
  return s;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let inter = 0;
  for (const g of small) if (large.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}
const gramsByUrl = new Map();
for (const r of rows) {
  const f = htmlFile(r.url);
  if (f) gramsByUrl.set(r.url, grams(contentText(readFileSync(f, "utf8"))));
}
const urls = rows.map((r) => r.url);
for (let i = 0; i < urls.length; i++) {
  const r = rows[i];
  const a = gramsByUrl.get(urls[i]);
  if (!a || !a.size) {
    r.uniqueScore = "";
    r.dupRisk = "n/a";
    r.simWith = "";
    continue;
  }
  let max = 0;
  let withUrl = "";
  for (let j = 0; j < urls.length; j++) {
    if (i === j) continue;
    const b = gramsByUrl.get(urls[j]);
    if (!b || !b.size) continue;
    const s = jaccard(a, b);
    if (s > max) {
      max = s;
      withUrl = urls[j];
    }
  }
  r.uniqueScore = Math.round((1 - max) * 100);
  r.dupRisk = max >= 0.5 ? "High" : max >= 0.25 ? "Medium" : "Low";
  r.simWith = withUrl;
}

const counts = { A: 0, B: 0, C: 0, D: 0 };
for (const r of rows) counts[r.cls]++;
console.log(`total rows: ${rows.length}`);
console.log(`A=${counts.A} B=${counts.B} C=${counts.C} D=${counts.D}`);

console.log("\n=== Unique content / duplicate risk ===");
const riskCounts = {};
for (const r of rows) riskCounts[r.dupRisk] = (riskCounts[r.dupRisk] || 0) + 1;
console.log("dup risk distribution:", JSON.stringify(riskCounts));
const topPairs = rows
  .filter((r) => r.simWith && r.url < r.simWith)
  .sort((a, b) => a.uniqueScore - b.uniqueScore)
  .slice(0, 25);
console.log("most similar URL pairs (unique score asc):");
for (const r of topPairs)
  console.log(`  ${r.uniqueScore}% unique [${r.dupRisk}] ${r.url} ~ ${r.simWith}`);

console.log("\n=== Phase B: tool page quality (from rows) ===");
const toolRows = rows.filter((r) => r.type === "tool" && r.mainWords != null);
const mws = toolRows.map((r) => r.mainWords).sort((a, b) => a - b);
if (mws.length) {
  console.log(
    `tool mainWords: n=${mws.length} min=${mws[0]} median=${mws[Math.floor(mws.length / 2)]} max=${mws[mws.length - 1]}; ` +
      `<300: ${mws.filter((w) => w < 300).length}; >=400: ${mws.filter((w) => w >= 400).length}`
  );
}
const noMain = rows.filter((r) => r.type !== "system" && r.mainWords === null).map((r) => r.url);
console.log(`pages with NO <main> in prerender: ${noMain.length} -> ${noMain.slice(0, 12).join(", ")}`);

// proposed sitemap: A + B(hub/compare/best/creator) minus C and minus es-co and minus color
const proposed = rows.filter((r) => {
  if (r.cls === "C" || r.cls === "D") return false;
  return true;
});
console.log(`proposed indexable inventory (A+B): ${proposed.length} URLs`);
console.log(` of which B (improve before requesting indexing): ${proposed.filter((r) => r.cls === "B").length}`);

// CSV
const header = ["URL", "Page type", "Current status", "Classification", "Reason", "Canonical", "Noindex", "In sitemap", "Word count", "Main words", "Tool functionality", "Recommended action", "Final index decision", "Unique content score", "Duplicate risk"];
const lines = [header.join(",")];
for (const r of rows.sort((a, b) => a.cls.localeCompare(b.cls) || a.url.localeCompare(b.url))) {
  const action =
    r.cls === "D" ? "Keep out of sitemap (already)" :
    r.cls === "C" && COLOR_RE.test(r.url) ? "Exclude from sitemap; keep live for studio UX; no redirect" :
    r.cls === "C" && ESCO_RE.test(r.url) ? "Remove from sitemap; hreflang stays only if truly localized else drop" :
    r.cls === "C" && ALIAS_C_ACTION[r.url] ? ALIAS_C_ACTION[r.url] :
    r.cls === "C" && /^\/tools\//.test(r.url) ? "Consolidate: canonical/redirect to primary tool" :
    r.cls === "C" ? "Exclude from sitemap" :
    r.cls === "A" ? "Keep in sitemap" :
    r.url === "/creator" ? "Keep in sitemap (added in Phase 1)" :
    r.type === "tool" ? "DOM content landed (Batch 1); differentiate intent, then keep" :
    r.type === "translator-pair" ? "SSR body or consolidate into /tools/pdf-translator; decide per pair" :
    r.type === "compare" || r.type === "best" ? "Human depth review; keep only if genuinely useful" :
    "Review then keep in sitemap";
  const decision =
    r.cls === "A" ? "INDEX" :
    r.cls === "B" ? "INDEX AFTER IMPROVEMENT" :
    r.cls === "C" ? "EXCLUDE/CONSOLIDATE" : "NOINDEX/EXCLUDE";
  lines.push([r.url, r.type, "200", r.cls, r.reason, r.canonical, r.noindex ? "yes" : "no", r.inSitemap ? "yes" : "no", r.words, r.mainWords ?? "", r.toolStatus, action, decision, r.uniqueScore, r.dupRisk].map((x) => `"${esc(x)}"`).join(","));
}
writeFileSync("INDEX-READY.csv", "﻿" + lines.join("\r\n"));
console.log("wrote INDEX-READY.csv");

// summary of B reasons
const bReasons = {};
for (const r of rows.filter((x) => x.cls === "B")) bReasons[r.reason] = (bReasons[r.reason] || 0) + 1;
console.log("B reason breakdown:", JSON.stringify(bReasons, null, 2));
const aList = rows.filter((r) => r.cls === "A").map((r) => r.url);
console.log("A pages:", aList.join(", "));
