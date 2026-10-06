/**
 * Indexation verifier - "does every link we ship lead somewhere indexable?"
 *
 * Built on scripts/seo-core.mjs so the facts come from BUILD OUTPUT only:
 *   dist/client/**.html  -> the documents that exist
 *   public/sitemap.xml   -> the declared indexable set
 *   public/_redirects +
 *   vercel.json          -> host-level 301/410 rules
 *   scripts/seo-routes.ts-> the app's own router (bundled via esbuild)
 *
 * Contract verified here (the one RelatedToolsSection.tsx documents):
 *   - every internal <a href> in every prerendered document resolves to a real
 *     200 document (not a 404, not a 410, not a host redirect, not an SPA
 *     rewrite that would serve another page's canonical)
 *   - the target is indexable: no noindex, and its canonical is itself
 *   - internal links are never nofollowed
 *   - RelatedToolCard output (`data-related-path`) is an absolute, trailing-
 *     slash-free, same-host URL with a real accessible name
 *   - sitemap URLs all resolve to indexable, self-canonical documents
 *   - JSON-LD BreadcrumbList items resolve to a real, indexable document
 *     (so structured data never advertises a URL that 404s or is noindex)
 *   - every sitemap URL is reachable by at least one internal link (the
 *     discovery/orphan check; reported as a note, not a failure)
 *
 * Exit code 1 when any check fails.
 */
import {
  loadPages,
  loadSitemap,
  loadRedirectRules,
  resolveUrl,
  loadRoutes,
  toInternalPath,
  SITE_URL,
} from "./seo-core.mjs";
import { EXCLUDED_TOOL_IDS } from "./sitemap-excludes.mjs";

const issues = [];
const notes = [];
const fail = (msg) => issues.push(msg);
const note = (msg) => notes.push(msg);

const stripHashQuery = (p) => {
  const h = p.indexOf("#");
  const q = p.indexOf("?");
  let end = p.length;
  if (h >= 0) end = Math.min(end, h);
  if (q >= 0) end = Math.min(end, q);
  const out = p.slice(0, end);
  return out === "" ? "/" : out;
};

const main = async () => {
  const pages = loadPages();
  const rules = loadRedirectRules();
  const sitemap = loadSitemap();
  const routes = await loadRoutes();
  const known = routes.knownRoute;

  const sitemapPaths = new Set(sitemap.map((u) => u.path));
  const docs = [...pages.values()];

  console.log(
    `\nindexation verification - ${docs.length} documents, ${sitemap.length} sitemap URLs, ${rules.length} host rules`
  );

  /* ---------------------------------------------------------------- */
  /* 1. every internal link resolves to a real, indexable document      */
  /* ---------------------------------------------------------------- */
  let linkCount = 0;
  let noindexToNoindex = 0;
  const inLinks = new Map(); // target path -> Set(source routes)
  const badTargets = new Map(); // target -> why (deduped)

  for (const doc of docs) {
    for (const link of doc.links) {
      linkCount++;
      const target = stripHashQuery(link.path);
      if (target === doc.route) continue; // self links are fine

      inLinks.set(target, (inLinks.get(target) ?? new Set()).add(doc.route));

      const res = resolveUrl(target, pages, rules);
      const push = (why) => {
        const key = `${target}|${why}`;
        if (badTargets.has(key)) return;
        badTargets.set(key, why);
        fail(`link target ${why}: ${target} (linked from ${doc.route})`);
      };

      if (res.status === 404) push("is a 404");
      else if (res.status === 410) push("is 410 Gone");
      else if (res.status !== 200) push(`resolves with HTTP ${res.status}`);
      else if (res.rewritten)
        push("is served by a rewrite/SPA shell (its canonical would not be its own URL)");
      else if (res.asset) continue;
      else {
        const targetDoc = pages.get(target);
        if (!targetDoc) continue;
        const targetNoindex = /\bnoindex\b/i.test(targetDoc.robots || "");
        if (targetNoindex) {
          // noindex -> noindex is fine: the es-CO cluster is deliberately
          // de-indexed as a whole but stays browsable. An INDEXABLE page
          // linking into that cluster is the case worth flagging.
          if (/\bnoindex\b/i.test(doc.robots || "")) noindexToNoindex++;
          else push(`is noindex (robots: "${targetDoc.robots}") but is linked from an indexable page`);
        }
        const expectedCanonical = target === "/" ? `${SITE_URL}/` : `${SITE_URL}${target}`;
        if (targetDoc.canonical && targetDoc.canonical !== expectedCanonical)
          push(`has canonical ${targetDoc.canonical}, expected ${expectedCanonical}`);
        if (doc.nofollow.includes(target)) push("is linked with rel=nofollow");
        if (target.length > 1 && target.endsWith("/"))
          push("is linked with a trailing slash");
        const bare = target.replace(/^\/(pt-br|id|es-mx|es-co|de|fr|it)(?=\/|$)/, "");
        const firstSeg = (bare.startsWith("/tools/") ? bare.slice(7) : bare.slice(1)).split("/")[0];
        if (EXCLUDED_TOOL_IDS.has(firstSeg))
          push("is a consolidated/retired alias URL");
        if (!known(target)) push("is not a route the app's router knows");
      }
    }
  }
  void badTargets;
  console.log(
    `  ok   internal links checked - ${linkCount} across ${docs.length} documents (${noindexToNoindex} inside the noindex es-CO cluster)`
  );

  /* ---------------------------------------------------------------- */
  /* 2. RelatedToolCard contract (data-related-path)                    */
  /* ---------------------------------------------------------------- */
  let relatedCards = 0;
  let relatedPages = 0;
  for (const doc of docs) {
    const cards = [...doc.html.matchAll(/<a\b[^>]*data-related-path="([^"]*)"[^>]*>/gi)];
    if (cards.length === 0) continue;
    relatedPages++;
    relatedCards += cards.length;
    for (const m of cards) {
      const tag = m[0];
      const path = m[1];
      const hrefM = tag.match(/href\s*=\s*"([^"]*)"/i);
      const href = hrefM ? hrefM[1] : "";
      if (!href) fail(`[${doc.route}] data-related-path card has no href (${path})`);
      else if (!href.startsWith(`${SITE_URL}/`) && href !== SITE_URL)
        fail(`[${doc.route}] related card href is not absolute+same-host: ${href}`);
      else if (href.length > SITE_URL.length && href.endsWith("/"))
        fail(`[${doc.route}] related card href has a trailing slash: ${href}`);
      // RelatedToolCard always renders aria-label={item.title}; that is the
      // accessible name contract (plus the visible <h3> text under it).
      if (!/aria-label\s*=\s*"[^"]+"/i.test(tag))
        fail(`[${doc.route}] related card ${path} has no accessible name`);
      const res = resolveUrl(stripHashQuery(path), pages, rules);
      if (res.status !== 200)
        fail(`[${doc.route}] related card ${path} resolves with HTTP ${res.status}`);
    }
  }
  console.log(
    `  ok   RelatedToolCard contract - ${relatedCards} cards on ${relatedPages} pages`
  );

  /* ---------------------------------------------------------------- */
  /* 3. every sitemap URL is a live, indexable, self-canonical doc      */
  /* ---------------------------------------------------------------- */
  let sitemapOk = 0;
  for (const { path, loc } of sitemap) {
    const doc = pages.get(path);
    if (!doc) {
      fail(`sitemap URL has no document: ${loc}`);
      continue;
    }
    const res = resolveUrl(path, pages, rules);
    if (res.status !== 200) fail(`sitemap URL resolves with HTTP ${res.status}: ${loc}`);
    if (/\bnoindex\b/i.test(doc.robots || "")) fail(`sitemap URL is noindex: ${loc}`);
    const expectedCanonical = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    if (doc.canonical !== expectedCanonical)
      fail(`sitemap URL canonical is ${doc.canonical}, expected ${expectedCanonical}: ${loc}`);
    if (!known(path)) fail(`sitemap URL is unknown to the router: ${loc}`);
    sitemapOk++;
  }
  console.log(`  ok   sitemap targets - ${sitemapOk}/${sitemap.length} indexable documents`);

  /* ---------------------------------------------------------------- */
  /* 4. JSON-LD breadcrumb items point at real, indexable documents     */
  /* ---------------------------------------------------------------- */
  let crumbTargets = 0;
  let crumbNodes = 0;
  for (const doc of docs) {
    const scripts = [...doc.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of scripts) {
      let data;
      try {
        data = JSON.parse(m[1]);
      } catch {
        fail(`[${doc.route}] has unparseable JSON-LD`);
        continue;
      }
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (!node || typeof node !== "object" || node["@type"] !== "BreadcrumbList") continue;
        crumbNodes++;
        const items = Array.isArray(node.itemListElement) ? node.itemListElement : [];
        for (const el of items) {
          const path = toInternalPath(el && typeof el.item === "string" ? el.item : "");
          if (!path) continue; // external or non-navigable item
          crumbTargets++;
          const target = stripHashQuery(path);
          const res = resolveUrl(target, pages, rules);
          if (res.status !== 200)
            fail(`[${doc.route}] JSON-LD breadcrumb points at HTTP ${res.status}: ${target}`);
          else if (res.rewritten)
            fail(`[${doc.route}] JSON-LD breadcrumb points at a rewrite/SPA shell: ${target}`);
          else {
            const targetDoc = pages.get(target);
            // noindex -> noindex is fine: the es-CO mirror is de-indexed as a
            // whole cluster but stays browsable, crumbs included.
            const sourceNoindex = /\bnoindex\b/i.test(doc.robots || "");
            if (targetDoc && !sourceNoindex && /\bnoindex\b/i.test(targetDoc.robots || ""))
              fail(`[${doc.route}] JSON-LD breadcrumb points at a noindex page: ${target}`);
          }
        }
      }
    }
  }
  console.log(`  ok   JSON-LD breadcrumbs - ${crumbTargets} targets across ${crumbNodes} BreadcrumbList nodes`);

  /* ---------------------------------------------------------------- */
  /* 5. indexable documents nobody links to (discovery)                 */
  /* ---------------------------------------------------------------- */
  const orphans = [];
  for (const path of sitemapPaths) {
    const refs = inLinks.get(path);
    if (!refs || refs.size === 0) orphans.push(path);
  }
  if (orphans.length > 0) {
    note(`${orphans.length} sitemap URL(s) have zero internal in-links:`);
    for (const o of orphans.slice(0, 60)) note(`    ${o}`);
    if (orphans.length > 60) note(`    ... and ${orphans.length - 60} more`);
  }

  /* ---------------------------------------------------------------- */
  /* report                                                             */
  /* ---------------------------------------------------------------- */
  if (notes.length > 0) {
    console.log("");
    for (const n of notes) console.log(`  note ${n}`);
  }
  if (issues.length > 0) {
    console.log(`\n${issues.length} indexation issue(s):`);
    for (const i of issues.slice(0, 60)) console.log(`  - ${i}`);
    if (issues.length > 60) console.log(`  ... and ${issues.length - 60} more`);
    process.exitCode = 1;
    return;
  }
  console.log("\nall indexation checks passed");
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
