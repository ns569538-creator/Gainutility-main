import { readFileSync, writeFileSync } from "node:fs";
const get = (x) =>
  [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const before = get(readFileSync("scripts/sitemap-before.xml", "utf8"));
const after = get(readFileSync("public/sitemap.xml", "utf8"));
const live = readFileSync("scripts/sitemap-live-before.xml", "utf8");
const B = new Set(before), A = new Set(after), L = new Set(get(live));
const cmp = (label, from, to) => {
  const added = [...to].filter((u) => !from.has(u));
  const removed = [...from].filter((u) => !to.has(u));
  console.log(`\n== ${label}: ${from.size} -> ${to.size}`);
  console.log(`   added (${added.length}):`);
  for (const u of added) console.log("     +", u);
  console.log(`   removed (${removed.length}):`);
  for (const u of removed) console.log("     -", u);
};
cmp("live (deployed) -> baseline snapshot", L, B);
cmp("baseline -> current", B, A);
console.log("\norder changed:", JSON.stringify(before) !== JSON.stringify(after.slice(0, before.length)));
