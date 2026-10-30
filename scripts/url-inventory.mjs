/**
 * Phase 0 - full URL inventory over the prerendered dist/client output.
 * Emits scripts/url-inventory.json + .csv with the fields required by the
 * indexing audit (type, canonical, robots, noindex, hreflang, title,
 * description, H1, word depth, internal/outgoing links, sitemap membership).
 *
 *   node scripts/url-inventory.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist", "client");
if (!existsSync(dist)) throw new Error("dist/client missing - run npm run build first");

const SITE = "https://gainutility.com";
const LOCALES = ["pt-br", "id", "es-mx", "es-co", "de", "fr", "it"];

const sm = existsSync(join(root, "public", "sitemap.xml"))
  ? readFileSync(join(root, "public", "sitemap.xml"), "utf8")
  : "";
const sitemapPaths = new Set(
  [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const p = m[1].replace(SITE, "");
    return p === "" ? "/" : p;
  })
);

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith(".html")) files.push(p);
  }
};
walk(dist);

const routeOf = (file) => {
  const rel = relative(dist, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  return "/" + rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
};

const grab = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : "";
};
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const localeOf = (route) => {
  for (const l of LOCALES) if (route === "/" + l || route.startsWith("/" + l + "/")) return l;
  return "en";
};
const basePath = (route) => {
  const l = localeOf(route);
  if (l === "en") return route;
  return route.slice(l.length + 1) || "/";
};

const classify = (route) => {
  const p = basePath(route);
  if (route === "/404") return "404";
  if (p === "/") return "Homepage";
  if (p.startsWith("/tools/pdf-translator/")) return "Tool";
  if (p.startsWith("/tools/")) return "Tool";
  if (p.startsWith("/blog/")) return "Blog article";
  if (p === "/blog") return "Blog index";
  if (p.startsWith("/compare/")) return "Comparison";
  if (p.startsWith("/names") || p.startsWith("/symbols")) return "Library";
  if (p.startsWith("/studios/color")) return "Color studio";
  if (p.startsWith("/colors/") || p.startsWith("/color-palettes/") || p.startsWith("/ui-colors/"))
    return "Color page";
  if (p.endsWith("/best")) return "Collection";
  if (["/about", "/privacy", "/terms", "/security", "/cookies", "/contact", "/site-audit"].includes(p))
    return "Utility page";
  if (p === "/faq") return "FAQ";
  if (p === "/changelog") return "Changelog";
  if (p === "/tools") return "Tool hub";
  if (["/pdf", "/json", "/image", "/css", "/dev", "/seo", "/media", "/creator"].includes(p))
    return "Hub";
  return "Hub sub-page";
};

const rows = [];
for (const f of files) {
  const route = routeOf(f);
  const html = readFileSync(f, "utf8");
  const title = decode(grab(html, /<title>([\s\S]*?)<\/title>/));
  const desc = decode(grab(html, /<meta name="description" content="([^"]*)"/));
  const robots = grab(html, /<meta name="robots" content="([^"]*)"/);
  const canonical = grab(html, /<link rel="canonical" href="([^"]*)"/);
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => m[1] + "=" + m[2].replace(SITE, "")
  );
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => stripTags(m[1]));
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const mainText = mainMatch ? stripTags(mainMatch[0]) : "";
  const bodyText = stripTags(html.slice(html.indexOf('<div id="root"')));
  const mainWords = mainText ? mainText.split(/\s+/).filter(Boolean).length : null;
  const words = (mainText || bodyText).split(/\s+/).filter(Boolean).length;
  const anchors = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  let internal = 0;
  let outgoing = 0;
  const internalSet = new Set();
  const norm = (p) => {
    let x = p.split("#")[0].split("?")[0];
    if (x.length > 1 && x.endsWith("/")) x = x.slice(0, -1);
    return x || "/";
  };
  for (const a of anchors) {
    if (a.startsWith("#") || a.startsWith("mailto:") || a.startsWith("tel:")) continue;
    if (a.startsWith("http://") || a.startsWith("https://")) {
      if (a.startsWith(SITE)) {
        internal++;
        internalSet.add(norm(a.slice(SITE.length) || "/"));
      } else outgoing++;
    } else if (!/\.(js|css|png|jpg|svg|ico|webp|woff2?|xml|txt|json|webmanifest)$/i.test(a)) {
      internal++;
      internalSet.add(norm(a));
    }
  }
  const noindex = /noindex/.test(robots);
  const loc = localeOf(route);
  const base = basePath(route);
  rows.push({
    url: route,
    locale: loc,
    base,
    type: classify(route),
    status: 200,
    indexable: !noindex && route !== "/404",
    canonical: canonical.replace(SITE, "") || route,
    canonicalSelf: (canonical.replace(SITE, "") || route) === route,
    hreflang: hreflangs,
    hreflangCount: hreflangs.length,
    title,
    titleLen: title.length,
    description: desc,
    descLen: desc.length,
    h1: h1s[0] || "",
    h1Count: h1s.length,
    words,
    mainWords,
    internalLinks: internal,
    uniqueInternal: internalSet.size,
    outgoingLinks: outgoing,
    inSitemap: sitemapPaths.has(route),
    robots,
    noindex,
    internalTargets: [...internalSet],
  });
}

rows.sort((a, b) => a.url.localeCompare(b.url));

const jsonPath = resolve(root, "scripts", "url-inventory.json");
writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

const cols = [
  "url","locale","type","status","indexable","inSitemap","canonicalSelf","hreflangCount",
  "titleLen","descLen","h1Count","words","mainWords","internalLinks","uniqueInternal","outgoingLinks","title","description","h1","canonical",
];
const esc = (v) => {
  const s = Array.isArray(v) ? v.join(" ") : String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const csv = [cols.join(",")]
  .concat(rows.map((r) => cols.map((c) => esc(r[c])).join(",")))
  .join("\n");
writeFileSync(resolve(root, "scripts", "url-inventory.csv"), csv);

const byType = {};
for (const r of rows) {
  byType[r.type] = byType[r.type] || { count: 0, sitemap: 0, noindex: 0, words: [] };
  byType[r.type].count++;
  if (r.inSitemap) byType[r.type].sitemap++;
  if (r.noindex) byType[r.type].noindex++;
  byType[r.type].words.push(r.words);
}
console.log(`total routes: ${rows.length}`);
for (const [k, v] of Object.entries(byType)) {
  v.words.sort((a, b) => a - b);
  const med = v.words[Math.floor(v.words.length / 2)];
  console.log(
    `  ${k.padEnd(14)} n=${String(v.count).padStart(4)} in-sitemap=${String(v.sitemap).padStart(4)} noindex=${v.noindex} median-words=${med}`
  );
}
console.log(`written: ${jsonPath}`);
