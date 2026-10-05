// Temporary: nearest-neighbor (Jaccard 5-gram on <main>) for the 11 EN B2 tools.
import { readFileSync, existsSync } from "node:fs";
const ROOT = "dist/client";
const SITE = "https://gainutility.com";
const sm = readFileSync("public/sitemap.xml", "utf8");
const smPaths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ""));
function htmlFile(route) {
  const r = route === "/" ? "index.html" : route.replace(/^\//, "") + ".html";
  const p = `${ROOT}/${r}`;
  return existsSync(p) ? p : null;
}
function stripTags(s) {
  return s.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
}
function contentText(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (m) {
    const t = stripTags(m[1]);
    if (t.split(" ").filter(Boolean).length >= 30) return t.toLowerCase();
  }
  const i = html.indexOf('<div id="root"');
  const root = i >= 0 ? html.slice(i) : html;
  return stripTags(root.replace(/<header[\s\S]*?<\/header>/g, " ").replace(/<footer[\s\S]*?<\/footer>/g, " ")).toLowerCase();
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
const targets = ["/tools/base64-tool","/tools/box-shadow-generator","/tools/contrast-checker","/tools/extract-even-pages-pdf","/tools/extract-odd-pages-pdf","/tools/image-converter","/tools/json-beautifier","/tools/merge-pdf","/tools/slug-generator","/tools/youtube-keyword-explorer","/tools/youtube-thumbnail-preview"];
const cache = new Map();
const get = (u) => {
  if (!cache.has(u)) {
    const f = htmlFile(u);
    cache.set(u, f ? grams(contentText(readFileSync(f, "utf8"))) : null);
  }
  return cache.get(u);
};
for (const t of targets) {
  const a = get(t);
  if (!a || !a.size) { console.log(`${t}: NO CONTENT`); continue; }
  const others = smPaths.filter((p) => p !== t);
  const scored = others.map((p) => ({ p, s: jaccard(a, get(p) || new Set()) })).sort((x, y) => y.s - x.s);
  const top = scored.slice(0, 3).map((x) => `${Math.round((1 - x.s) * 100)}% [${x.s >= 0.5 ? "High" : x.s >= 0.25 ? "Med" : "Low"}] ${x.p}`);
  console.log(`${t} (${a.size} grams) -> ${top.join(" | ")}`);
}
