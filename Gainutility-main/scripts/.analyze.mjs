import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync("scripts/url-inventory.json", "utf8"));

const noMain = rows.filter((r) => r.mainWords == null);
console.log("pages WITHOUT <main>:", noMain.length);
const byType = {};
for (const r of noMain) byType[r.type] = (byType[r.type] || 0) + 1;
console.log(byType);
console.log("sample:", noMain.slice(0, 8).map((r) => r.url).join(", "));

const med = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const stats = {};
for (const r of rows) {
  const w = r.mainWords ?? r.words;
  (stats[r.type] = stats[r.type] || []).push(w);
}
console.log("\nmedian MAIN words by type (en only shown separately)");
for (const [k, v] of Object.entries(stats)) console.log("  ", k, "median", med(v), "min", Math.min(...v));

// inbound
const inbound = new Map();
for (const r of rows) for (const t of r.internalTargets || []) inbound.set(t, (inbound.get(t) || 0) + 1);
const orphans = rows.filter((r) => r.url !== "/" && !r.inSitemap === false && (inbound.get(r.url) || 0) === 0);
const orphanAll = rows.filter((r) => (inbound.get(r.url) || 0) === 0);
console.log("\nzero inbound links:", orphanAll.length);
const ot = {};
for (const r of orphanAll) ot[r.type] = (ot[r.type] || 0) + 1;
console.log(ot);
console.log(orphanAll.slice(0, 40).map((r) => `${r.url} (${r.type}${r.inSitemap ? ", IN-SITEMAP" : ""})`).join("\n"));
