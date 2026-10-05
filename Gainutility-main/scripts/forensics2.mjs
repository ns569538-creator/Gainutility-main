/**
 * Content-depth forensics pass 2 — measures <main>-only word counts, checks
 * whether accordion-gated content (how-to steps / limitations / troubleshooting)
 * is present in the prerendered HTML, cross-locale title duplication, and hub
 * page depth. Read-only. Run: node scripts/forensics2.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist", "client");
const SITE = "https://gainutility.com";
const LOCALE_RE = /^\/((?:pt-br|es-mx|es-co|de|fr|it|id))(?=\/|$)/;
const localeOf = (r) => (r.match(LOCALE_RE) ? r.match(LOCALE_RE)[1] : "en");

const htmlFiles = [];
const walk = (d) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
};
walk(dist);
const routeOf = (f) => {
  const rel = relative => relative;
  const r = f.slice(dist.length + 1).replace(/\\/g, "/");
  if (r === "index.html") return "/";
  if (r === "404.html") return "/404";
  return "/" + r.replace(/\.html$/, "");
};

const strip = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
const wordsOf = (s) => (s ? s.split(" ").length : 0);

/* probe for metadata */
const esbuild = await import("esbuild");
const tmp = resolve(root, "scripts", ".forensics2-probe.mjs");
await esbuild.build({
  stdin: {
    contents: `
      export { toolsRegistry } from "./src/toolsRegistry";
      export { getMergedSEO, buildPageMeta } from "./src/seo/shared";
      export { SEO_PAGE_MAP } from "./src/seo/seoPageContent";
      export { COMPARISON_PAGE_MAP } from "./src/seo/comparisonPages";
    `,
    resolveDir: root,
  },
  bundle: true, platform: "node", format: "esm", target: "node18", jsx: "automatic",
  outfile: tmp, logLevel: "silent",
  define: { "process.env.NODE_ENV": '"production"', "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE) },
});
const probe = await import(pathToFileURL(tmp).href);
const { toolsRegistry, getMergedSEO, SEO_PAGE_MAP, COMPARISON_PAGE_MAP } = probe;

const out = [];
const P = (s = "") => out.push(s);

const mainWords = new Map(); // route -> words inside <main>
const meta = new Map(); // route -> {title, desc, h1, canonical, robots}
for (const f of htmlFiles) {
  const route = routeOf(f);
  const html = readFileSync(f, "utf8");
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const mainWordsVal = m ? wordsOf(strip(m[1])) : 0;
  mainWords.set(route, mainWordsVal);
  meta.set(route, {
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
    desc: html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? null,
    h1: (() => { const h = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return h ? strip(h[1]) : null; })(),
    html,
    route,
  });
}

/* --- tool pages: is accordion-gated content in the HTML? --- */
let toolsWithSteps = 0, toolsWithLimitations = 0, toolsWithTrouble = 0, total = 0;
const toolRows = [];
for (const id of Object.keys(toolsRegistry)) {
  const route = `/tools/${id}`;
  const pg = meta.get(route);
  if (!pg) continue;
  total++;
  const seo = getMergedSEO(id);
  const steps = seo.detailedContent?.steps ?? [];
  const lims = seo.limitations ?? [];
  const trouble = seo.troubleshooting ?? [];
  const hasSteps = steps.length > 0 && steps.every((s) => pg.html.includes(escapeHtmlLite(s)));
  const hasLim = lims.length > 0 && lims.some((l) => pg.html.includes(escapeHtmlLite(l)));
  const hasTr = trouble.length > 0 && trouble.some((t) => pg.html.includes(escapeHtmlLite(t.problem)));
  if (hasSteps) toolsWithSteps++;
  if (hasLim) toolsWithLimitations++;
  if (hasTr) toolsWithTrouble++;
  toolRows.push({ id, main: mainWords.get(route), hasSteps, hasLim, hasTr, faqs: (seo.faqs ?? []).length, related: (seo.related ?? []).length });
}
function escapeHtmlLite(s) {
  return s.replace(/&/g, "&#x27;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

P("=== CONTENT DEPTH (pass 2) ===");
const mains = toolRows.map((r) => r.main).sort((a, b) => a - b);
P(`Tool pages: ${total}`);
P(`<main>-only words: min ${mains[0]}, median ${mains[Math.floor(mains.length / 2)]}, max ${mains[mains.length - 1]}`);
P(`Tool pages with how-to steps present in HTML: ${toolsWithSteps} / ${total}`);
P(`Tool pages with limitations present in HTML: ${toolsWithLimitations} / ${total}`);
P(`Tool pages with troubleshooting present in HTML: ${toolsWithTrouble} / ${total}`);
const under300 = toolRows.filter((r) => r.main < 300);
P(`Tool pages with <300 words in <main>: ${under300.length} (${under300.slice(0, 20).map((r) => r.id).join(", ")}${under300.length > 20 ? ", …" : ""})`);
P();

/* --- hub / comparison / best / blog depth --- */
const fams = [
  ["SEO hubs+subpages", (r) => /^\/(pdf|json|image|css|dev|seo|media|creator)(\/|$)/.test(r) && !r.includes("/best") && !r.startsWith("/tools/")],
  ["compare", (r) => r.startsWith("/compare/")],
  ["best", (r) => /\/best$/.test(r)],
  ["blog index", (r) => r === "/blog"],
  ["blog articles", (r) => r.startsWith("/blog/")],
  ["translator pairs", (r) => r.startsWith("/tools/pdf-translator/")],
  ["static", (r) => ["/", "/about", "/privacy", "/terms", "/security", "/cookies", "/contact", "/changelog", "/site-audit", "/tools"].includes(r)],
  ["color pages", (r) => /^\/(colors|color-palettes|ui-colors)\//.test(r)],
  ["studio sections", (r) => r.startsWith("/studios/color")],
];
for (const [label, fn] of fams) {
  const rows = [...mainWords.entries()].filter(([r]) => fn(r));
  if (!rows.length) continue;
  const ws = rows.map(([, w]) => w).sort((a, b) => a - b);
  P(`${label}: n=${rows.length} mainWords min ${ws[0]} median ${ws[Math.floor(ws.length / 2)]} max ${ws[ws.length - 1]}`);
}
P();

/* --- cross-locale title duplication (es-mx vs es-co and beyond) --- */
const byTitle = new Map();
for (const [route, m] of meta) {
  if (!m.title || route === "/404") continue;
  if (!byTitle.has(m.title)) byTitle.set(m.title, []);
  byTitle.get(m.title).push(route);
}
let crossDupPairs = 0, sameLocaleDup = 0;
const crossSamples = [];
for (const [t, routes] of byTitle) {
  if (routes.length < 2) continue;
  const locales = new Set(routes.map(localeOf));
  if (locales.size > 1) {
    crossDupPairs += routes.length;
    if (crossSamples.length < 15) crossSamples.push(`${routes.join(" | ")} :: ${t.slice(0, 80)}`);
  } else sameLocaleDup += routes.length;
}
P(`Cross-locale identical titles: ${crossDupPairs} page instances across titles`);
for (const s of crossSamples) P("   " + s);
P(`Same-locale identical titles: ${sameLocaleDup}`);
P();

/* --- H1 / title dup within sitemap set --- */
const smXml = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
const smPaths = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(SITE.length) || "/");
const smSet = new Set(smPaths);
const dupH1Sm = [];
const seen = new Map();
for (const r of smPaths) {
  const m = meta.get(r);
  if (!m) continue;
  const k = `${localeOf(r)}|${(m.h1 || "").toLowerCase()}`;
  if (seen.has(k)) dupH1Sm.push([r, seen.get(k)]);
  else seen.set(k, r);
}
P(`Duplicate H1 within sitemap URLs (same locale): ${dupH1Sm.length}`);
for (const [a, b] of dupH1Sm.slice(0, 10)) P(`   ${a} == ${b}`);

console.log(out.join("\n"));
try { (await import("node:fs")).rmSync(tmp, { force: true }); } catch {}
