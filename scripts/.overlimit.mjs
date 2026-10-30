import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("scripts/url-inventory.json", "utf8"));
const a = Array.isArray(r) ? r : r.rows ?? r.urls;
const bad = a.filter(
  (x) => x.inSitemap && x.indexable && x.locale === "en" && (x.titleLen > 60 || x.descLen > 160)
);
const byType = {};
for (const x of bad) (byType[x.type] ??= []).push(x);
console.log("TOTAL", bad.length);
for (const [t, list] of Object.entries(byType).sort((p, q) => q[1].length - p[1].length)) {
  console.log(`\n### ${t} (${list.length})`);
  for (const x of list.sort((p, q) => q.titleLen - p.titleLen)) {
    console.log(`${x.titleLen}\t${x.descLen}\t${x.url}`);
    console.log(`  T ${x.title}`);
    console.log(`  D ${x.description}`);
  }
}
