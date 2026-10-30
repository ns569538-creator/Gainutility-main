/**
 * Shared, dependency-free fact extractor for every SEO verification script.
 *
 * It derives the URL inventory from BUILD OUTPUT only (never from guesses):
 *   - dist/client/**\/*.html  -> every route the site actually serves with HTTP 200
 *   - public/sitemap.xml     -> the declared indexable set
 *   - public/_redirects      -> Cloudflare/Netlify host redirects + 410s
 *   - vercel.json            -> Vercel host redirects
 *
 * Status model used by every verifier:
 *   200  a prerendered HTML document exists for the exact path
 *   301  a host redirect rule matches the path (chained until it resolves)
 *   410  a host "gone" rule matches the path
 *   404  nothing matches
 */
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CLIENT_DIR = resolve(ROOT, "dist", "client");
export const SITE_URL = (process.env.VITE_SITE_URL || "https://gainutility.com").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).host;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

export const decodeEntities = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ");

export const escXml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Normalize any internal href to a root-relative path ("" -> "/", strip query/hash). */
export const toInternalPath = (href) => {
  if (!href) return null;
  let h = href.trim();
  if (h.startsWith("#")) return null;
  if (/^(mailto:|tel:|javascript:|data:|https?:\/\/(www\.)?google\.com|https?:\/\/(twitter|x)\.com|https?:\/\/(www\.)?facebook\.com|https?:\/\/(www\.)?linkedin\.com|https?:\/\/(www\.)?github\.com)/i.test(h)) return null;
  let abs = null;
  if (/^https?:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      if (u.host !== SITE_HOST && u.host !== `www.${SITE_HOST}` && u.host !== SITE_HOST.replace(/^www\./, "")) return null;
      abs = u;
      h = u.pathname;
    } catch {
      return null;
    }
  }
  const hashIdx = h.indexOf("#");
  if (hashIdx === 0) return null;
  if (hashIdx > 0) h = h.slice(0, hashIdx);
  const q = h.indexOf("?");
  if (q >= 0) h = h.slice(0, q);
  if (!h) h = "/";
  if (!h.startsWith("/")) return null;
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h === "" ? "/" : h;
};

/* ------------------------------------------------------------------ */
/* host redirect rules                                                 */
/* ------------------------------------------------------------------ */

const parseRedirectsFile = (text) => {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    // "<from> <status>" (no destination) e.g. "/image-to-code 410"
    if (parts.length === 2 && /^\d{3}$/.test(parts[1])) {
      rules.push({ source: parts[0], destination: "", status: Number(parts[1]) });
      continue;
    }
    const [source, destination, status] = parts;
    rules.push({ source, destination, status: status ? Number(status) : 301 });
  }
  return rules;
};

/** Load every host-level redirect rule (public/_redirects + vercel.json). */
export const loadRedirectRules = () => {
  const rules = [];
  const redirectsPath = resolve(ROOT, "public", "_redirects");
  if (existsSync(redirectsPath)) {
    for (const r of parseRedirectsFile(readFileSync(redirectsPath, "utf8"))) {
      rules.push({ ...r, host: "pages" });
    }
  }
  const vercelPath = resolve(ROOT, "vercel.json");
  if (existsSync(vercelPath)) {
    const cfg = JSON.parse(readFileSync(vercelPath, "utf8"));
    for (const r of cfg.redirects || []) {
      rules.push({ source: r.source, destination: r.destination, status: r.permanent ? 301 : 302, host: "vercel" });
    }
  }
  return rules;
};

const ruleMatches = (rule, path) => {
  const src = rule.source;
  if (src.includes("*")) {
    const re = new RegExp("^" + src.split("*").map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
    return re.test(path);
  }
  return src === path;
};

/* ------------------------------------------------------------------ */
/* prerendered pages                                                   */
/* ------------------------------------------------------------------ */

const walkHtml = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
};

const routeFromHtmlFile = (file) => {
  const rel = file.slice(CLIENT_DIR.length).replace(/\\/g, "/");
  if (rel === "/index.html") return "/";
  if (rel === "/404.html") return "/404";
  return rel.replace(/\.html$/, "");
};

const metaCache = new Map();

/** Parse the SEO-relevant facts out of one prerendered document. */
export const parseDocument = (html) => {
  const cached = metaCache.get(html);
  if (cached) return cached;

  const grab = (re) => {
    const m = html.match(re);
    return m ? decodeEntities(m[1]) : "";
  };
  const canonical = grab(/<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/i);
  const robots = grab(/<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/i);
  const title = grab(/<title>([\s\S]*?)<\/title>/i);
  const description = grab(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i);

  const hreflang = [];
  for (const m of html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"\s*\/?>/gi)) {
    hreflang.push({ hreflang: m[1], href: decodeEntities(m[2]) });
  }

  const h1s = [];
  for (const m of html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)) {
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) h1s.push(decodeEntities(text));
  }

  const links = [];
  const nofollow = [];
  const seen = new Set();
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    const hrefM = attrs.match(/href\s*=\s*"([^"]*)"/i);
    if (!hrefM) continue;
    const href = decodeEntities(hrefM[1]);
    const path = toInternalPath(href);
    if (path === null) continue;
    if (/\brel\s*=\s*"[^"]*nofollow/i.test(attrs)) nofollow.push(path);
    const key = path;
    if (!seen.has(key)) {
      seen.add(key);
      links.push({ href, path });
    }
  }

  const parsed = { canonical, robots, title, description, hreflang, h1s, links, nofollow };
  metaCache.set(html, parsed);
  return parsed;
};

let pageCache = null;

/** Every prerendered route -> { route, status: 200, ...parsed } */
export const loadPages = () => {
  if (pageCache) return pageCache;
  const map = new Map();
  if (!existsSync(CLIENT_DIR)) {
    throw new Error("dist/client not found - run `npm run build` first");
  }
  for (const file of walkHtml(CLIENT_DIR)) {
    const route = routeFromHtmlFile(file);
    const html = readFileSync(file, "utf8");
    map.set(route, { route, status: 200, html, ...parseDocument(html) });
  }
  pageCache = map;
  return map;
};

/* ------------------------------------------------------------------ */
/* router bridge (same routing as app / prerender / sitemap)           */
/* ------------------------------------------------------------------ */

let routesPromise = null;

/**
 * Bundle scripts/seo-routes.ts once and return the router helpers, so every
 * verifier resolves paths with the project's own routing code instead of a
 * re-implementation that can drift.
 */
export const loadRoutes = () => {
  if (!routesPromise) {
    routesPromise = (async () => {
      const { build } = await import("esbuild");
      const tmp = resolve(ROOT, "scripts", ".seo-routes-bundle.mjs");
      await build({
        entryPoints: [resolve(ROOT, "scripts", "seo-routes.ts")],
        bundle: true,
        platform: "node",
        format: "esm",
        target: "node18",
        outfile: tmp,
        logLevel: "silent",
        define: { "process.env.NODE_ENV": '"production"' },
      });
      const mod = await import(`${pathToFileURL(tmp).href}?t=${Date.now()}`);
      try {
        rmSync(tmp, { force: true });
      } catch {
        /* keep going - the bundle is disposable */
      }
      return mod;
    })();
  }
  return routesPromise;
};

/* ------------------------------------------------------------------ */
/* URL resolution                                                      */
/* ------------------------------------------------------------------ */

/** True when a non-HTML static asset (csv, xml, image, ...) is shipped. */
const staticAssetExists = (path) => {
  const rel = path.replace(/^\//, "");
  if (!rel) return false;
  const full = join(CLIENT_DIR, rel);
  try {
    return statSync(full).isFile();
  } catch {
    return false;
  }
};

/**
 * Resolve a path the way the production host would (Cloudflare Pages model:
 * prerendered .html, then host redirect/rewrite rules, then static assets,
 * then the 404 document).
 * @returns {{status:number, redirectTo?:string, hops:string[]}}
 */
export const resolveUrl = (path, pages = loadPages(), rules = resolveUrl._rules ?? (resolveUrl._rules = loadRedirectRules())) => {
  const hops = [];
  let current = path;
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    if (seen.has(current)) return { status: 301, redirectTo: current, hops, loop: true };
    seen.add(current);
    if (pages.has(current)) return { status: 200, hops };
    const rule = rules.find((r) => ruleMatches(r, current));
    if (rule) {
      hops.push(current);
      if (rule.status === 410) return { status: 410, hops };
      const dest = rule.destination.replace(/:\*$/, "");
      current = dest.startsWith("/") ? dest : `/${dest}`;
      if (rule.status === 200) {
        if (pages.has(current)) return { status: 200, hops, rewritten: true };
        if (staticAssetExists(current)) return { status: 200, hops, rewritten: true };
        if (current === "/index.html") return { status: 200, hops, rewritten: true, shell: true };
      }
      continue;
    }
    if (staticAssetExists(current)) return { status: 200, hops, asset: true };
    return { status: 404, hops };
  }
  return { status: 301, redirectTo: current, hops, loop: true };
};

/** Reset memoized state (used between runs in the same process). */
export const resetCore = () => {
  pageCache = null;
  resolveUrl._rules = undefined;
};

/* ------------------------------------------------------------------ */
/* sitemap                                                             */
/* ------------------------------------------------------------------ */

export const loadSitemap = () => {
  const file = resolve(ROOT, "public", "sitemap.xml");
  const xml = readFileSync(file, "utf8");
  const urls = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = m[1];
    const loc = (block.match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || "";
    const lastmod = (block.match(/<lastmod>([\s\S]*?)<\/lastmod>/) || [])[1] || "";
    urls.push({ loc: decodeEntities(loc), lastmod, path: new URL(loc).pathname.replace(/(. )+$/, "") });
  }
  for (const u of urls) {
    let p = u.loc;
    try {
      p = new URL(u.loc).pathname;
    } catch {
      p = u.loc;
    }
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    u.path = p === "" ? "/" : p;
  }
  return urls;
};

/* ------------------------------------------------------------------ */
/* page typing                                                         */
/* ------------------------------------------------------------------ */

export const LOCALE_CODES = ["en", "pt-br", "id", "es-mx", "es-co", "de", "fr", "it"];

export const localeOf = (path) => {
  const seg = path.split("/")[1] || "";
  return LOCALE_CODES.includes(seg) && seg !== "en" ? seg : "en";
};

export const stripLocale = (path) => {
  const loc = localeOf(path);
  if (loc === "en") return path;
  const rest = path.slice(`/${loc}`.length);
  return rest === "" ? "/" : rest;
};

/**
 * Classify a route into one of the audit's page types.
 * Falls back to the derived facts rather than hard-coded lists.
 */
export const pageTypeOf = (path) => {
  const p = stripLocale(path);
  if (p === "/" || p === "") return "homepage";
  if (p === "/404") return "404";
  if (p === "/blog") return "blog index";
  if (p.startsWith("/blog/")) return "blog article";
  if (p === "/tools") return "tool hub/category";
  if (p.startsWith("/tools/pdf-translator/")) return "tool";
  if (p.startsWith("/tools/")) return "tool";
  if (p === "/about") return "about";
  if (p === "/faq") return "FAQ";
  if (p === "/changelog") return "changelog";
  if (p === "/contact") return "contact";
  if (p === "/site-audit") return "site audit";
  if (p === "/privacy" || p === "/terms" || p === "/security" || p === "/cookies") return "utility/system page";
  if (p === "/tools") return "tool hub/category";
  if (p.startsWith("/compare/")) return "collection";
  if (p === "/names" || p === "/symbols") return "PDF hub";
  if (p.startsWith("/names/") || p.startsWith("/symbols/")) return "collection";
  if (p === "/studios/color" || p.startsWith("/studios/color/")) return "utility/system page";
  if (p.startsWith("/colors/") || p.startsWith("/color-palettes/") || p.startsWith("/ui-colors/")) return "utility/system page";
  const hubs = ["pdf", "json", "image", "css", "dev", "seo", "media", "creator"];
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 1 && hubs.includes(segs[0])) return "PDF hub";
  if (segs.length >= 2 && hubs.includes(segs[0])) return "tool hub/category";
  return "utility/system page";
};

/** Stable English key for a localized path (used to compare across locales). */
export const contentKey = (path) => stripLocale(path);
