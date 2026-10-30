/**
 * SEO signal verification over the prerendered build (dist/client).
 *
 * Run after `npm run build`. Exits non-zero if any check fails.
 *
 *   node scripts/verify-seo-signals.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = resolve(ROOT, "dist/client");

const failures = [];
const pass = (name, detail = "") => console.log(`  ok   ${name}${detail ? ` — ${detail}` : ""}`);
const fail = (name, detail) => {
  failures.push(`${name}: ${detail}`);
  console.log(`  FAIL ${name} — ${detail}`);
};

const sitemap = readFileSync(join(CLIENT, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const SITE = "https://gainutility.com";

const htmlPathFor = (url) => {
  const p = url.startsWith(SITE) ? url.slice(SITE.length) : url;
  const clean = !p || p === "/" ? "/index" : p.endsWith("/") ? p.slice(0, -1) : p;
  return join(CLIENT, `${clean}.html`);
};

const robotsOf = (h) => h.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
const canonicalOf = (h) => h.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
const hreflangsOf = (h) =>
  [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({
    lang: m[1],
    href: m[2],
  }));
const titleOf = (h) => h.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
const descOf = (h) => h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";

console.log(`\nseo-signal verification — ${locs.length} sitemap URLs`);

/* 1. every sitemap URL has a prerendered HTML file */
const missing = locs.filter((u) => !existsSync(htmlPathFor(u)));
if (missing.length) fail("sitemap has HTML", `${missing.length} missing: ${missing.slice(0, 5).join(", ")}`);
else pass("sitemap has HTML", `${locs.length}/${locs.length}`);

/* 2. self-canonical on every sitemap URL */
const pages = locs.map((u) => ({ u, html: readFileSync(htmlPathFor(u), "utf8") }));
const notSelf = pages.filter(({ u, html }) => {
  const c = canonicalOf(html).replace(/\/$/, "");
  const l = u.replace(/\/$/, "");
  return c !== l;
});
if (notSelf.length) fail("self-canonical", notSelf.slice(0, 5).map((p) => `${p.u} -> ${canonicalOf(p.html)}`).join(" | "));
else pass("self-canonical", `${pages.length}/${pages.length}`);

/* 3. every sitemap URL is indexable */
const noindex = pages.filter(({ u, html }) => /noindex/.test(robotsOf(html)));
if (noindex.length) fail("sitemap indexable", noindex.slice(0, 5).map((p) => p.u).join(", "));
else pass("sitemap indexable", "no noindex entries");

/* 4. noindex pages must not emit hreflang; indexable localized pages must */
const noindexPaths = [];
const walkNoindex = (rel = "") => {
  const abs = join(CLIENT, rel);
  if (!existsSync(abs)) return;
  let entries;
  try {
    entries = readdirSync(abs, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name !== "assets") walkNoindex(childRel);
    } else if (e.name.endsWith(".html")) {
      const html = readFileSync(join(CLIENT, childRel), "utf8");
      if (/noindex/.test(robotsOf(html))) noindexPaths.push(childRel);
    }
  }
};
walkNoindex();
const emitted = noindexPaths.filter((p) => {
  const html = readFileSync(join(CLIENT, p), "utf8");
  return hreflangsOf(html).length > 0;
});
if (emitted.length) fail("noindex emits no hreflang", `${emitted.length} pages: ${emitted.slice(0, 5).join(", ")}`);
else pass("noindex emits no hreflang", `${noindexPaths.length} noindex pages checked`);

/* 5. every indexable sitemap URL in a locale cluster has a self-referencing hreflang */
const clusters = pages.filter(({ html }) => hreflangsOf(html).length > 0);
const noSelfRef = clusters.filter(({ u, html }) => {
  const path = u.slice(SITE.length) || "/";
  return !hreflangsOf(html).some((h) => h.href.replace(/\/$/, "") === u.replace(/\/$/, "") || h.href === path);
});
if (noSelfRef.length) fail("hreflang self-reference", noSelfRef.slice(0, 5).map((p) => p.u).join(", "));
else pass("hreflang self-reference", `${clusters.length} clusters`);

/* 6. hreflang targets resolve to prerendered HTML */
const badTargets = [];
for (const { u, html } of clusters) {
  for (const h of hreflangsOf(html)) {
    if (!h.href.startsWith(SITE)) continue;
    if (!existsSync(htmlPathFor(h.href))) badTargets.push(`${u} -> ${h.href}`);
  }
}
if (badTargets.length) fail("hreflang targets exist", badTargets.slice(0, 5).join(" | "));
else pass("hreflang targets exist", "0 broken");

/* 7. no duplicate titles or descriptions within a locale */
const byLocale = new Map();
for (const { u, html } of pages) {
  const path = u.slice(SITE.length);
  const locale = (path.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/|$)/)?.[1] ?? "en").toLowerCase();
  if (!byLocale.has(locale)) byLocale.set(locale, []);
  byLocale.get(locale).push({ u, title: titleOf(html), desc: descOf(html) });
}
let dupCount = 0;
for (const [locale, list] of byLocale) {
  for (const key of ["title", "desc"]) {
    const seen = new Map();
    for (const p of list) {
      if (!p[key]) continue;
      if (seen.has(p[key])) dupCount++;
      else seen.set(p[key], p.u);
    }
  }
}
if (dupCount) fail("unique title+description per locale", `${dupCount} duplicates`);
else pass("unique title+description per locale", `${byLocale.size} locales`);

/* 8. exactly one H1 on every sitemap URL */
const h1Issues = pages.filter(({ u, html }) => (html.match(/<h1[\s>]/g) ?? []).length !== 1);
if (h1Issues.length) fail("exactly one H1", h1Issues.slice(0, 5).map((p) => p.u).join(", "));
else pass("exactly one H1", `${pages.length}/${pages.length}`);

/* 9. es-CO must not appear in the sitemap */
const escoInSitemap = locs.filter((u) => u.includes("/es-co"));
if (escoInSitemap.length) fail("es-CO excluded from sitemap", escoInSitemap.slice(0, 5).join(", "));
else pass("es-CO excluded from sitemap", "0 entries");

/* 10. sitemap homepage <loc> must match the homepage canonical exactly */
const homeLoc = locs.find((u) => u === SITE || u === `${SITE}/`);
const homeCanonical = canonicalOf(readFileSync(htmlPathFor(SITE), "utf8"));
if (homeLoc !== homeCanonical)
  fail("sitemap loc matches homepage canonical", `sitemap=${homeLoc} canonical=${homeCanonical}`);
else pass("sitemap loc matches homepage canonical", homeCanonical);

// The homepage is the one URL allowed to carry a trailing slash; every other
// entry must not, so /path and /path/ never compete as two sitemap URLs.
const slashed = locs.filter((u) => u.endsWith("/") && u !== `${SITE}/`);
if (slashed.length) fail("only the homepage has a trailing slash", slashed.slice(0, 5).join(", "));
else pass("only the homepage has a trailing slash", `${locs.length - 1} inner URLs`);

console.log("");
if (failures.length) {
  console.log(`${failures.length} check(s) FAILED`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("all SEO signal checks passed");
