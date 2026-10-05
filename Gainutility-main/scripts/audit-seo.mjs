/**
 * Production SEO + integrity auditor for the generated dist/client/ output.
 * Run after `npm run build`:
 *   node scripts/audit-seo.mjs
 *
 * Verifies, against the ACTUAL generated HTML (not source):
 *   - unique titles / descriptions / canonicals across every page
 *   - canonical domain + trailing-slash normalization
 *   - robots meta (noindex only where intended)
 *   - exactly one H1 per prerendered body shell
 *   - JSON-LD parses; no undefined/null values; correct schema types;
 *     URLs inside JSON-LD resolve to real routes; BreadcrumbList hierarchy
 *     ends at the page canonical; FAQPage matches the metadata source
 *   - og and twitter meta completeness
 *   - sitemap.xml ↔ generated pages exact match, no duplicates
 *   - internal links in static HTML resolve to existing routes
 *   - placeholder junk scan (TODO/FIXME/localhost/example.com/lorem…)
 *   - registry-level SEO uniqueness (titles/descriptions) and FAQ counts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXCLUDED_TOOL_IDS } from "./sitemap-excludes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The Cloudflare/Vite plugin emits the build under dist/client/, including a
// copy of the generated sitemap.xml and _redirects from public/.
const dist = resolve(root, "dist", "client");

/* ---------------- collect HTML files ---------------- */
const htmlFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith(".html")) htmlFiles.push(p);
  }
};
walk(dist);

const SITE = "https://gainutility.com";
const routeOf = (file) => {
  const rel = relative(dist, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  return (
    "/" +
    rel
      .replace(/\/index\.html$/, "")
      .replace(/\.html$/, "")
  );
};

/* The routing locale of a route (the extensionless path). Localized routes are
 * prefixed with one of: /pt-br /es-mx /es-co /de /fr /it /id; English routes
 * are un-prefixed. Duplicate detection is scoped to this exact locale: es-co
 * and es-mx are intentionally sibling markets that share content overlays
 * (src/i18n/hubs.ts aliases es-co → es-mx), so identical Spanish copy across
 * the two is not a defect, and coincidentally identical "Online Gratis"-style
 * titles in DIFFERENT languages (es/id/it/pt) are not duplicates either. */
const LOCALE_RE = /^\/((?:pt-br|es-mx|es-co|de|fr|it|id))(?=\/|$)/;
const localeOf = (route) => {
  const m = route.match(LOCALE_RE);
  return m ? m[1] : "en";
};

/* ---------------- extract head/body bits ---------------- */
const parsePage = (html) => {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1] : null;
  };
  const title = pick(/<title>([^<]*)<\/title>/);
  const description = pick(/<meta\s+name="description"\s+content="([^"]*)"/);
  const canonical = pick(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  const robots = pick(/<meta\s+name="robots"\s+content="([^"]*)"/);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, "").trim()
  );
  const jsonldBlocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
    ),
  ].map((m) => m[1]);
  const links = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const ogTags = Object.fromEntries(
    [...html.matchAll(/<meta\s+property="(og:[^"]+)"\s+content="([^"]*)"/g)].map(
      (m) => [m[1], m[2]]
    )
  );
  const twTags = Object.fromEntries(
    [...html.matchAll(/<meta\s+name="(twitter:[^"]+)"\s+content="([^"]*)"/g)].map(
      (m) => [m[1], m[2]]
    )
  );
  return {
    title,
    description,
    canonical,
    robots,
    h1s,
    jsonldBlocks,
    links,
    ogTags,
    twTags,
    html,
  };
};

const deepScanBadValues = (node, path = "$") => {
  const problems = [];
  if (typeof node === "string") {
    if (/^\s*undefined\s*$/.test(node))
      problems.push(`${path}: string "undefined"`);
    if (/^\s*null\s*$/.test(node)) problems.push(`${path}: string "null"`);
    if (/object Object/.test(node)) problems.push(`${path}: "[object Object]"`);
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => problems.push(...deepScanBadValues(v, `${path}[${i}]`)));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (v === undefined) problems.push(`${path}.${k}: undefined value`);
      else if (v === null) problems.push(`${path}.${k}: null value`);
      else problems.push(...deepScanBadValues(v, `${path}.${k}`));
    }
  }
  return problems;
};

const collectUrls = (node, out = []) => {
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node)) out.push(node);
  } else if (Array.isArray(node)) node.forEach((v) => collectUrls(v, out));
  else if (node && typeof node === "object")
    for (const v of Object.values(node)) collectUrls(v, out);
  return out;
};

/* ---------------- registry-level data via esbuild bundle ---------------- */
const esbuild = await import("esbuild");
const tmpProbe = resolve(root, "scripts", ".audit-probe.mjs");
await esbuild.build({
  stdin: {
    contents: `
      import { toolsRegistry } from "./src/toolsRegistry";
      import { getSEOMetadata } from "./src/data";
      import { buildPageMeta } from "./src/seo/shared";
      import { STATIC_PATHS, pathToView } from "./src/router";
      import { TRANSLATOR_PAIR_SLUGS, translatorPairPath } from "./src/seo/translatorPairs";
      export { toolsRegistry, getSEOMetadata, buildPageMeta, STATIC_PATHS, pathToView, TRANSLATOR_PAIR_SLUGS, translatorPairPath };
    `,
    resolveDir: root,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  jsx: "automatic",
  outfile: tmpProbe,
  logLevel: "silent",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE),
  },
});
const probe = await import(pathToFileURL(tmpProbe).href);
const { toolsRegistry, getSEOMetadata, STATIC_PATHS, pathToView, TRANSLATOR_PAIR_SLUGS, translatorPairPath } = probe;

/* ---------------- expected routes ---------------- */
// Ground truth = the ACTUAL generated HTML files (extensionless routes), so
// localized pages, SEO landing pages, comparisons, category-best, blog
// articles, color pages, and /studios/color/* are all known routes. Unlike a
// hand-maintained list, this can never drift from what the build emitted.
const expectedRoutes = new Set(htmlFiles.map(routeOf));

const issues = [];
const warn = (msg) => issues.push(msg);

/* ---------------- per-page checks ---------------- */
const seenTitles = new Map();
const seenDescs = new Map();
const seenCanonicals = new Map();
const pages = [];

for (const file of htmlFiles) {
  const route = routeOf(file);
  const html = readFileSync(file, "utf8");
  const p = parsePage(html);
  pages.push({ route, ...p });

  // titles / descriptions / canonical uniqueness (titles/descriptions bucketed
  // per routing locale — see localeOf above)
  if (!p.title || !p.title.trim()) warn(`[${route}] missing <title>`);
  else if (seenTitles.has(`${localeOf(route)}|${p.title}`))
    warn(`[${route}] DUPLICATE title with [${seenTitles.get(`${localeOf(route)}|${p.title}`)}]: "${p.title}"`);
  else seenTitles.set(`${localeOf(route)}|${p.title}`, route);

  if (!p.description || p.description.trim().length < 50)
    warn(`[${route}] description missing or too short (${(p.description || "").length})`);
  else if (seenDescs.has(`${localeOf(route)}|${p.description}`))
    warn(`[${route}] DUPLICATE description with [${seenDescs.get(`${localeOf(route)}|${p.description}`)}]`);
  else seenDescs.set(`${localeOf(route)}|${p.description}`, route);

  if (!p.canonical) warn(`[${route}] missing canonical`);
  else {
    if (!p.canonical.startsWith(SITE + "/") && p.canonical !== SITE)
      warn(`[${route}] canonical off-domain: ${p.canonical}`);
    // Root is the single URL that carries a trailing slash; it has to, because
    // the sitemap <loc>, hreflang="en"/x-default, JSON-LD url and every
    // internal href="/" already do. Only inner routes must avoid one.
    if (route !== "/" && p.canonical.endsWith("/"))
      warn(`[${route}] canonical has trailing slash: ${p.canonical}`);
    const expectedCanon = route === "/" ? SITE + "/" : SITE + route;
    if (p.canonical !== expectedCanon)
      warn(`[${route}] canonical mismatch: got ${p.canonical}, expected ${expectedCanon}`);
    if (seenCanonicals.has(p.canonical))
      warn(`[${route}] DUPLICATE canonical with [${seenCanonicals.get(p.canonical)}]`);
    else seenCanonicals.set(p.canonical, route);
  }

  // robots
  const is404 = route === "/404";
  const isEsCo = route === "/es-co" || route.startsWith("/es-co/");
  if (is404) {
    if (p.robots && !/noindex/.test(p.robots)) warn(`[/404] should be noindex`);
  } else if (isEsCo) {
    // es-CO is a near-exact es-MX duplicate (4% unique) — intentionally
    // noindexed (excluded from sitemap + hreflang too). Must be noindex.
    if (!p.robots || !/noindex/i.test(p.robots))
      warn(`[${route}] es-CO page should be noindex`);
  } else if (p.robots && /noindex/i.test(p.robots)) {
    warn(`[${route}] accidental noindex`);
  }

  // H1
  if (!is404 && p.h1s.length === 0) warn(`[${route}] no H1 in prerendered body`);
  if (p.h1s.length > 1) warn(`[${route}] multiple H1 (${p.h1s.length})`);

  // og / twitter completeness
  const needOg = ["og:title", "og:description", "og:url", "og:type", "og:site_name", "og:image"];
  for (const k of needOg) if (!p.ogTags[k]) warn(`[${route}] missing ${k}`);
  for (const k of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"])
    if (!p.twTags[k]) warn(`[${route}] missing ${k}`);
  if (p.ogTags["og:url"] && p.canonical && p.ogTags["og:url"] !== p.canonical)
    warn(`[${route}] og:url != canonical`);
  if (p.title && p.ogTags["og:title"] !== p.title)
    warn(`[${route}] og:title != title`);

  // JSON-LD validation
  if (p.jsonldBlocks.length > 1) warn(`[${route}] multiple ld+json blocks`);
  for (const block of p.jsonldBlocks) {
    let data;
    try {
      data = JSON.parse(block);
    } catch (e) {
      warn(`[${route}] MALFORMED JSON-LD: ${e.message}`);
      continue;
    }
    const nodes = Array.isArray(data) ? data : [data];
    for (const node of nodes) {
      if (!node["@context"]) warn(`[${route}] JSON-LD node missing @context`);
      if (!node["@type"]) warn(`[${route}] JSON-LD node missing @type`);
      issues.push(...deepScanBadValues(node).map((m) => `[${route}] JSON-LD ${m}`));
      for (const u of collectUrls(node, []).filter((u) => !u.startsWith("https://schema.org"))) {
        if (!u.startsWith(SITE)) warn(`[${route}] JSON-LD off-site URL: ${u}`);
        if (u.endsWith("/") && u !== SITE + "/")
          warn(`[${route}] JSON-LD trailing-slash URL: ${u}`);
      }
      if (node["@type"] === "BreadcrumbList") {
        const items = node.itemListElement || [];
        items.forEach((it, i) => {
          if (it.position !== i + 1)
            warn(`[${route}] breadcrumb position gap at index ${i}`);
        });
        const last = items[items.length - 1];
        if (last?.item && p.canonical && last.item !== p.canonical)
          warn(`[${route}] breadcrumb last item ${last.item} != canonical ${p.canonical}`);
      }
      if (node["@type"] === "FAQPage") {
        const qs = (node.mainEntity || []).map((q) => q.name);
        if (new Set(qs).size !== qs.length)
          warn(`[${route}] duplicate questions inside FAQPage`);
        if (qs.length < 2) warn(`[${route}] FAQPage with <2 questions`);
      }
    }
    // FAQPage must match metadata source (locale-aware for localized pages —
    // the metadata FAQs differ per locale, so the probe must receive the
    // route's locale to produce the same questions the page actually emits).
    if (!is404) {
      const r = pathToView(route) ?? null;
      const view = r?.view ?? null;
      if (view && view.type !== "home") {
        const meta = probe.buildPageMeta(view, r?.locale);
        const faqNode = nodes.find((n) => n["@type"] === "FAQPage");
        if (faqNode) {
          const qs = faqNode.mainEntity.map((q) => q.name);
          const srcQs = meta.faqs.map((f) => f.question);
          if (JSON.stringify(qs) !== JSON.stringify(srcQs))
            warn(`[${route}] FAQPage JSON-LD != visible FAQ list`);
        } else if (meta.faqs.length >= 2) {
          warn(`[${route}] has visible FAQs but no FAQPage JSON-LD`);
        }
      }
    }
  }

  // placeholder junk scan (title/description/head only to avoid bundle noise).
  // Reserved example domains inside documentation copy are legitimate.
  // TODO/FIXME are matched case-sensitively: the uppercase token is junk, but
  // the lowercase word appears legitimately in Spanish/Portuguese copy ("Todo" = "All").
  const headOnly = html
    .slice(0, html.indexOf("</head>"))
    .replace(/https:\/\/example\.com[^\s"<>]*/g, "");
  for (const bad of ["TODO", "FIXME", "localhost:", "lorem ipsum"]) {
    const found =
      bad === "TODO" || bad === "FIXME"
        ? new RegExp(`\\b${bad}\\b`).test(headOnly)
        : headOnly.toLowerCase().includes(bad.toLowerCase());
    if (found) warn(`[${route}] placeholder junk in head: "${bad}"`);
  }

  // internal links resolve
  for (const href of p.links) {
    let path = null;
    if (href.startsWith("/")) path = href.split("#")[0].split("?")[0];
    else if (href.startsWith(SITE)) {
      path = href.slice(SITE.length).split("#")[0].split("?")[0] || "/";
    }
    if (path == null) continue;
    if (/\.(png|svg|ico|webmanifest|xml|txt|css|js|csv)$/.test(path)) continue;
    if (path === "/404.html") continue;
    const normalized = path.length > 1 ? path.replace(/\/$/, "") : "/";
    // /studios/color (the Color Studio home) has no prerendered index.html —
    // it is a valid routed view served via the _redirects SPA rewrite to
    // /index.html (see scripts/generate-sitemap.mjs), so links to it are fine.
    if (normalized === "/studios/color") continue;
    // Consolidated URLs (tool aliases + legacy classics) now 301 straight to
    // their canonical destination — internal links must never target them
    // (self-references on the redirect pages' own shell HTML are exempt).
    const bare = normalized.replace(LOCALE_RE, "");
    const firstSeg = (
      bare.startsWith("/tools/") ? bare.slice("/tools/".length) : bare.slice(1)
    ).split("/")[0];
    if (EXCLUDED_TOOL_IDS.has(firstSeg) && normalized !== route) {
      warn(`[${route}] internal link to redirecting URL: ${href}`);
      continue;
    }
    if (!expectedRoutes.has(normalized) && normalized !== "/404")
      warn(`[${route}] internal link to non-existent route: ${href}`);
  }
}

/* ---------------- sitemap ↔ pages ---------------- */
const sitemapXml = readFileSync(join(dist, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapPaths = sitemapUrls.map((u) => u.slice(SITE.length) || "/");
const sitemapSet = new Set(sitemapPaths);
if (sitemapSet.size !== sitemapPaths.length)
  warn("sitemap.xml contains duplicate URLs");
for (const sp of sitemapPaths)
  if (!expectedRoutes.has(sp)) warn(`sitemap URL not a generated page: ${SITE}${sp}`);
for (const er of expectedRoutes) {
  // The 404 shell is an error page, deliberately absent from the sitemap.
  // /studios/color/* are prerendered app surfaces (not content landing pages)
  // and are deliberately excluded from the sitemap (generate-sitemap.mjs).
  // EXCLUDED_TOOL_IDS = legacy classics + consolidated aliases: they 301 to
  // their modern successors (consolidatedRedirects in generate-sitemap.mjs),
  // so their prerendered HTML is a redirect target, not a sitemapped page.
  // Color Studio pages (named colors, curated palettes, UI color systems) and
  // es-CO locale pages stay live but are noindexed and sitemap-excluded by
  // the INDEX-READY consolidation decision.
  const isExcludedTool = [...EXCLUDED_TOOL_IDS].some(
    (id) =>
      er === `/tools/${id}` ||
      er.startsWith(`/tools/${id}/`) ||
      er === `/${id}`
  );
  const isColorPage = ["/colors/", "/color-palettes/", "/ui-colors/"].some(
    (p) => er.includes(p)
  );
  const isEsCo = er === "/es-co" || er.startsWith("/es-co/");
  if (
    er !== "/404" &&
    !er.startsWith("/studios/color/") &&
    !isExcludedTool &&
    !isColorPage &&
    !isEsCo &&
    !sitemapSet.has(er)
  )
    warn(`generated page missing from sitemap: ${SITE}${er}`);
}

/* ---------------- registry SEO uniqueness & completeness ---------------- */
let toolsWithoutSeoEntry = 0;
const regTitles = new Map();
const regDescs = new Map();
for (const id of Object.keys(toolsRegistry)) {
  const seo = getSEOMetadata(id, SITE);
  if (!seo) {
    toolsWithoutSeoEntry++;
    warn(`/tools/${id} falls back to generic SEO entry`);
    continue;
  }
  if (regTitles.has(seo.title))
    warn(`DUPLICATE SEO title between ${regTitles.get(seo.title)} and ${id}: "${seo.title}"`);
  else regTitles.set(seo.title, id);
  if (regDescs.has(seo.description))
    warn(`DUPLICATE SEO description between ${regDescs.get(seo.description)} and ${id}`);
  else regDescs.set(seo.description, id);

  const faqCount = (seo.faqs || []).length;
  if (faqCount < 3) warn(`/tools/${id} has only ${faqCount} FAQs`);
  if ((seo.detailedContent?.steps || []).length < 3)
    warn(`/tools/${id} how-to steps incomplete`);
  const related = seo.related || [];
  for (const r of related) {
    if (!toolsRegistry[r.id]) warn(`/tools/${id} related tool does not exist: ${r.id}`);
    if (r.id === id) warn(`/tools/${id} related includes itself`);
  }
}

/* ---------------- report ---------------- */
rmProbe: try {
  const { rmSync } = await import("node:fs");
  rmSync(tmpProbe, { force: true });
} catch {}

const errors = issues;
console.log(`Audited ${pages.length} generated HTML files.`);
console.log(`Expected routes: ${expectedRoutes.size}; sitemap URLs: ${sitemapUrls.length}`);
if (errors.length === 0) {
  console.log("AUDIT PASS: no issues found.");
  process.exit(0);
}
console.log(`AUDIT FOUND ${errors.length} ISSUE(S):`);
for (const e of errors) console.log(" - " + e);
process.exit(1);
