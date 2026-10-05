import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const rows = JSON.parse(readFileSync("scripts/url-inventory.json", "utf8"));
const a = Array.isArray(rows) ? rows : rows.rows ?? rows.urls;
const bad = a.filter(
  (x) => x.inSitemap && x.indexable && x.locale === "en" && (x.titleLen > 60 || x.descLen > 160)
);

const files = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(n)) files.push(p);
  }
};
walk("src");
const src = files.map((p) => ({ p, t: readFileSync(p, "utf8") }));

const locate = (needle) => {
  const n = needle
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  // try progressively shorter distinctive chunks
  const chunks = [n, n.replace(/\s*[|—–-]\s*\|?\s*GainUtility$/, ""), n.split(" ")[0] + " " + n.split(" ")[1]];
  for (const c of chunks) {
    if (!c || c.length < 8) continue;
    const hits = src.filter((f) => f.t.includes(c));
    if (hits.length) return hits.map((h) => h.p.replace(/\\/g, "/")).join(", ");
  }
  return "NOT-FOUND";
};

const byFile = {};
for (const x of bad) {
  const f = locate(x.title);
  (byFile[f] ??= []).push(x);
}
for (const [f, list] of Object.entries(byFile).sort((p, q) => q[1].length - p[1].length)) {
  console.log(`\n== ${f} (${list.length})`);
  for (const x of list) console.log(`   T${x.titleLen} D${x.descLen} ${x.url}`);
}
