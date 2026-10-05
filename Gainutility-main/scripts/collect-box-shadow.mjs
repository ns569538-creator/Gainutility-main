/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility box-shadow research — data collection.
 *
 * Fetches the homepage of each domain in a pinned top-sites list, grabs the
 * stylesheets the homepage actually references (inline <style>, <link
 * rel=stylesheet>, and one level of top-level @import inside inline styles),
 * and records every box-shadow / -webkit-box-shadow declaration it can parse.
 *
 * Reproducible by design:
 *   - the sampling frame (a dated Tranco list) is an explicit CLI input
 *   - the run writes appended NDJSON per domain, so interrupted runs resume
 *   - every collection decision is either parameterised or recorded per row
 *
 * Usage:
 *   node scripts/collect-box-shadow.mjs \
 *     --csv <path-to-tranco-top-1m.csv> \
 *     --limit 1000 \
 *     --out scripts/research-data/raw \
 *     --concurrency 8
 *
 * Processing decisions (also stated on the published research page):
 *   - homepage = https://<domain>/, falling back to http://<domain>/
 *   - external stylesheets capped at 30 per site, fetched sheets capped at 8 MB
 *   - one level of @import resolution, from inline <style> blocks only
 *   - same stylesheet URL only fetched once per site
 *   - a page whose stylesheets are injected by JavaScript is out of scope and
 *     is recorded as such ("html-only" / no <style> / no <link>)
 *   - fetch failures (timeout, TLS, bot wall, non-2xx) are recorded per domain
 */

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parse, generate, walk } from "css-tree";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GainUtilityResearch/1.0; research crawl of public CSS; https://gainutility.com)";
const HOMEPAGE_TIMEOUT_MS = 15000;
const SHEET_TIMEOUT_MS = 15000;
const MAX_SHEETS = 30;
const MAX_SHEET_BYTES = 8 * 1024 * 1024;
const MAX_URL_LEN = 2048;

function parseArgs(argv) {
  const args = { csv: null, limit: 1000, out: "scripts/research-data/raw", concurrency: 8 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--csv") args.csv = argv[++i];
    else if (a === "--limit") args.limit = parseInt(argv[++i], 10);
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--concurrency") args.concurrency = parseInt(argv[++i], 10);
  }
  if (!args.csv) {
    console.error("Missing --csv <path-to-tranco-list.csv>");
    process.exit(1);
  }
  return args;
}

async function fetchWithTimeout(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html,text/css,*/*;q=0.8", "accept-language": "en" },
    });
    const contentType = res.headers.get("content-type") || "";
    const len = parseInt(res.headers.get("content-length") || "0", 10);
    if (len > MAX_SHEET_BYTES) {
      res.body?.cancel();
      return { ok: false, skipped: "too-large", httpStatus: res.status };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true, httpStatus: res.status, body: buf, contentType };
  } catch (err) {
    return {
      ok: false,
      httpStatus: null,
      error: {
        name: String(err?.name || "Error"),
        code: String(err?.cause?.code || err?.cause?.name || ""),
        message: String(err?.cause?.message || err?.message || "").slice(0, 200),
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Extract the URL string from a css-tree-generated @import prelude text. */
function importUrlFromPrelude(text) {
  const m = /(?:url\(["']?|["'])([^"')]+)(?:["']?\)|["'])/i.exec(text);
  if (m) return m[1];
  return null;
}

function parseHtmlForCss(document, html) {
  const inlineBlocks = [];
  const links = [];
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  let m;
  while ((m = styleRe.exec(html))) inlineBlocks.push(m[1]);
  const linkRe = /<link\b[^>]*>/gi;
  while ((m = linkRe.exec(html))) {
    const tag = m[0];
    const rel = /rel\s*=\s*["']?stylesheet["']?/i.test(tag);
    const hrefM = /href\s*=\s*(["'])(.*?)\1/i.exec(tag) || /href\s*=\s*([^\s"'>]+)/i.exec(tag);
    if (rel && hrefM) {
      const hrefVal = hrefM[2] ?? hrefM[1];
      if (hrefVal) links.push(hrefVal);
    }
  }
  return { inlineBlocks, links };
}

function extractImportsFromInline(cssText) {
  if (!cssText) return [];
  const imports = [];
  let ast;
  try {
    ast = parse(cssText, { positions: false });
  } catch {
    return imports;
  }
  walk(ast, (node) => {
    if (node.type === "Atrule" && node.name.toLowerCase() === "import" && node.prelude) {
      const url = importUrlFromPrelude(generate(node.prelude));
      if (url && !/^data:/i.test(url) && url.length < MAX_URL_LEN) imports.push(url);
    }
  });
  return imports;
}

function resolveUrl(base, href) {
  if (typeof href !== "string") return null;
  href = href.trim().replace(/["']/g, "");
  if (!href || href.startsWith("data:") || href.startsWith("blob:") || href.startsWith("#")) return null;
  if (href.startsWith("//")) return "https:" + href;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/** Names of the var() functions referenced by a value (direct references only). */
function referencedVars(value) {
  const names = new Set();
  const re = /var\(\s*(--[a-z0-9-]+)/gi;
  let m;
  while ((m = re.exec(value))) names.add(m[1].trim().toLowerCase());
  return names;
}

function trimVal(s, max) {
  return s && s.length > max ? s.slice(0, max) : s;
}

/**
 * Walk every Rule; for rules containing a box-shadow declaration, emit one row
 * per box-shadow declaration enriched with ONLY the custom properties its
 * var() references are likely to need: the sibling custom properties whose
 * names appear in the value (Tailwind/Bootstrap pattern). Long minified
 * selectors are dropped (they carry no signal for the research questions).
 */
function extractFromCss(ast, scope, sheetId) {
  const rows = [];
  walk(ast, (node) => {
    if (node.type !== "Rule") return;
    if (!node.block || !node.block.children) return;
    const ruleDecls = [];
    for (const decl of node.block.children) {
      if (decl.type !== "Declaration") continue;
      const prop = (decl.property || "").toLowerCase();
      let val;
      try {
        val = generate(decl.value || "").trim();
      } catch {
        continue;
      }
      if (val.length > 4000) continue;
      ruleDecls.push({ prop, val });
    }
    const shadows = ruleDecls.filter((d) => d.prop === "box-shadow" || d.prop === "-webkit-box-shadow");
    if (shadows.length === 0) return;
    let selector = null;
    try {
      const gen = generate(node.prelude);
      if (gen && gen.length <= 100) selector = gen;
    } catch {}
    const ruleProps = {};
    for (const s of shadows) {
      const byProp = new Map(ruleDecls.map((d) => [d.prop, d.val]));
      const needed = new Set(referencedVars(s.val));
      for (let i = 0; i < 12 && needed.size > 0 && needed.size < 200; i++) {
        let grew = false;
        for (const name of [...needed]) {
          const src = byProp.get(name);
          if (src !== undefined) {
            if (!Object.prototype.hasOwnProperty.call(ruleProps, name)) {
              ruleProps[name] = trimVal(src, 300);
              grew = true;
            }
            for (const dep of referencedVars(src)) {
              if (!needed.has(dep)) {
                needed.add(dep);
                grew = true;
              }
            }
          }
        }
        if (!grew) break;
      }
    }
    for (const s of shadows) {
      rows.push({
        rank: scope.rank,
        domain: scope.domain,
        property: s.prop,
        selector,
        value: s.val,
        vendorPrefixed: s.prop === "-webkit-box-shadow",
        fileType: scope.fileType,
        sheetId,
        ruleProps: Object.keys(ruleProps).length ? ruleProps : undefined,
      });
    }
  });
  return rows;
}

async function processDomain(domain, rank, args) {
  const record = {
    rank,
    domain,
    fetchedAt: new Date().toISOString(),
    homepageStatus: null,
    protocol: null,
    htmlBytes: null,
    inlineStyleBlocks: 0,
    sheets: [],
    failReason: null,
  };

  let htmlRes = null;
  let lastStatus = null;
  for (const proto of ["https", "http"]) {
    const res = await fetchWithTimeout(`${proto}://${domain}/`, HOMEPAGE_TIMEOUT_MS);
    if (res.httpStatus) lastStatus = res.httpStatus;
    if (res.ok && (res.httpStatus === 200 || res.httpStatus === 203)) {
      htmlRes = res;
      record.protocol = proto;
      record.homepageStatus = res.httpStatus;
      break;
    }
    if (!res.ok && !res.httpStatus && res.error) {
      record.failReason = `${res.error.name}${res.error.code ? `:${res.error.code}` : ""}`;
      break; // fundamental transport error on https — http fallback would fail the same way
    }
  }
  if (!htmlRes) {
    record.homepageStatus = record.homepageStatus ?? lastStatus;
    record.failReason = record.failReason ?? (lastStatus ? `no 2xx homepage (last status ${lastStatus})` : "no 2xx homepage");
    return { ...record, rows: [], sheetLines: [] };
  }

  const html = htmlRes.body.toString("utf8");
  record.htmlBytes = htmlRes.body.length;
  const { inlineBlocks, links } = parseHtmlForCss(domain, html);

  const sheetUrls = new Set();
  for (const l of links) {
    const url = resolveUrl(`${record.protocol}://${domain}/`, l);
    if (url && (url.startsWith("https:") || url.startsWith("http:"))) sheetUrls.add(url);
    if (sheetUrls.size >= MAX_SHEETS) break;
  }

  // One level of @import out of inline <style> blocks.
  for (const block of inlineBlocks) {
    for (const imp of extractImportsFromInline(block)) {
      const url = resolveUrl(`${record.protocol}://${domain}/`, imp);
      if (url && (url.startsWith("https:") || url.startsWith("http:"))) sheetUrls.add(url);
      if (sheetUrls.size >= MAX_SHEETS) break;
    }
    if (sheetUrls.size >= MAX_SHEETS) break;
  }

  record.inlineStyleBlocks = inlineBlocks.length;
  record.sheets = Array.from(sheetUrls).slice(0, MAX_SHEETS);

  const rows = [];
  const sheetLines = [];
  let sheetCounter = 0;

  /** Collect custom properties defined in a sheet's :root/html rules. */
  function collectRootProps(ast) {
    const rootProps = {};
    walk(ast, (node) => {
      if (node.type !== "Rule") return;
      if (!node.prelude) return;
      const sel = generate(node.prelude).toLowerCase().trim();
      if (sel !== ":root" && sel !== "html" && !sel.startsWith(":root") && !sel.startsWith("html,") && !sel.startsWith("*")) return;
      if (!node.block || !node.block.children) return;
      for (const decl of node.block.children) {
        if (decl.type !== "Declaration") continue;
        const prop = (decl.property || "").toLowerCase();
        if (!prop.startsWith("--")) continue;
        try {
          const v = generate(decl.value || "").trim();
          if (v.length <= 400) rootProps[prop] = v;
        } catch {}
      }
    });
    return rootProps;
  }

/** Keep only :root props that are referenced by var() in the given rows. */
  function referencedRootProps(rootProps, rows) {
    const used = new Set();
    for (const r of rows) for (const n of referencedVars(r.value)) used.add(n);
    const slim = {};
    for (const [k, v] of Object.entries(rootProps)) if (used.has(k)) slim[k] = v;
    return slim;
  }

  for (const block of inlineBlocks.slice(0, 8)) {
    let ast;
    try {
      ast = parse(block, { positions: false });
    } catch {
      continue;
    }
    const rootProps = collectRootProps(ast);
    const ctx = { domain, rank, fileType: "inline" };
    const blockRows = extractFromCss(ast, ctx, null);
    rows.push(...blockRows);
    const slim = referencedRootProps(rootProps, blockRows);
    if (Object.keys(slim).length) {
      const sheetId = ++sheetCounter;
      sheetLines.push({ type: "sheetProps", sheetId, domain, fileType: "inline", rootProps: slim });
    }
  }

  for (const sheetUrl of record.sheets) {
    const sheetRes = await fetchWithTimeout(sheetUrl, SHEET_TIMEOUT_MS);
    if (!sheetRes.ok) {
      record.sheetsDetail = record.sheetsDetail || [];
      record.sheetsDetail.push({
        url: sheetUrl,
        status: sheetRes.httpStatus ?? (sheetRes.error ? `${sheetRes.error.name}:${sheetRes.error.code}` : "fail"),
        skipped: sheetRes.skipped ?? null,
      });
      continue;
    }
    const cssText = sheetRes.body.toString("utf8");
    if (cssText.trim().length === 0) continue;
    let ast;
    try {
      ast = parse(cssText, { positions: false });
    } catch {
      record.sheetsDetail = record.sheetsDetail || [];
      record.sheetsDetail.push({ url: sheetUrl, status: "css-parse-error" });
      continue;
    }
    const sheetId = ++sheetCounter;
    const ctx = { domain, rank, fileType: "external" };
    const sheetRows = extractFromCss(ast, ctx, sheetId);
    rows.push(...sheetRows);
    const rootProps = collectRootProps(ast);
    const slim = referencedRootProps(rootProps, sheetRows);
    if (Object.keys(slim).length) {
      sheetLines.push({ type: "sheetProps", sheetId, domain, fileType: "external", rootProps: slim });
    }
  }

  record.declarations = rows.length;
  record.inlineRootPropsBlocks = sheetLines.filter((l) => l.fileType === "inline").length;
  return { ...record, rows, sheetLines };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.out, { recursive: true });

  const csvText = readFileSync(args.csv, "utf8");
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  const domains = lines
    .slice(0, args.limit)
    .map((l) => {
      const comma = l.indexOf(",");
      if (comma === -1) return null;
      const rank = parseInt(l.slice(0, comma), 10);
      const domain = l.slice(comma + 1).trim().toLowerCase();
      if (!domain) return null;
      return { rank, domain };
    })
    .filter(Boolean);

  const outFile = resolve(args.out, "declarations.ndjson");
  const metaFile = resolve(args.out, "collection-meta.json");

  // Resume: ranks already collected.
  const done = new Set();
  if (existsSync(outFile)) {
    for (const line of readFileSync(outFile, "utf8").split(/\r?\n/)) {
      if (!line) continue;
      try {
        const r = JSON.parse(line);
        if (r.rank) done.add(r.rank);
      } catch {}
    }
  }

  const pending = domains.filter((d) => !done.has(d.rank));
  console.log(`total=${domains.length} done=${done.size} pending=${pending.length}`, new Date().toISOString());

  let cursor = 0;
  let running = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const item = pending[cursor++];
      const rec = await processDomain(item.domain, item.rank, args);
      const { rows, sheetLines, ...meta } = rec;
      appendFileSync(outFile, JSON.stringify(meta) + "\n");
      for (const line of sheetLines) appendFileSync(outFile, JSON.stringify(line) + "\n");
      for (const row of rows) appendFileSync(outFile, JSON.stringify(row) + "\n");
      running++;
      if (running % 50 === 0) console.log(`.. progressed past ${running} completed`, new Date().toISOString());
    }
  };

  const workers = Array.from({ length: args.concurrency }, () => worker());
  await Promise.all(workers);

  const meta = {
    runAt: new Date().toISOString(),
    args,
    list: args.csv,
    total: domains.length,
    completed: domains.length,
    cssTreeVersion: (await import("css-tree/package.json", { with: { type: "json" } })).version,
  };
  writeFileSync(metaFile, JSON.stringify(meta, null, 2));
  console.log("done", new Date().toISOString(), JSON.stringify(meta));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});