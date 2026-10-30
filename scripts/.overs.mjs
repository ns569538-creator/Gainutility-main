import { readFileSync } from "node:fs";

const files = process.argv.slice(2);
const LIMITS = { title: 60, description: 160, seoTitle: 60, seoDescription: 160 };
const re = /^\s*(title|description|seoTitle|seoDescription|shortDesc|h1):\s*(["'`])((?:\\.|(?!\2).)*)\2/;

for (const f of files) {
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  const hits = [];
  lines.forEach((l, i) => {
    const m = l.match(re);
    if (!m) return;
    const key = m[1];
    const lim = LIMITS[key];
    if (!lim) return;
    const raw = m[3];
    const v = raw.replace(/\$\{BRAND_NAME\}/g, "GainUtility");
    if ([...v].length > lim) hits.push(`${i + 1}\t${key}\t${[...v].length}\t${l.trim()}`);
  });
  if (hits.length) {
    console.log(`\n===== ${f} (${hits.length})`);
    for (const h of hits) console.log(h);
  }
}
