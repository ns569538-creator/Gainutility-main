import { readFileSync } from "node:fs";

const raw = readFileSync("FINAL-INDEXATION-CLASSIFICATION.csv", "utf8").trim().split(/\r?\n/);
const parse = (line) => {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
};
const header = parse(raw[0]);
const rows = raw.slice(1).map((l) => Object.fromEntries(parse(l).map((v, i) => [header[i], v])));

const count = (key) =>
  Object.entries(rows.reduce((a, r) => ((a[r[key]] = (a[r[key]] || 0) + 1), a), {})).sort(
    (a, b) => b[1] - a[1]
  );

console.log("DECISION:", count("INDEXATION DECISION"));
console.log("STATUS:", count("STATUS"));
console.log("PRIOR CLASS:", count("Prior class"));
console.log("B SUBCLASS:", count("B subclass"));
console.log("PAGE TYPE:", count("Page type"));
console.log("IN SITEMAP:", count("In sitemap"));

const b2 = rows.filter((r) => r["B subclass"] === "B2");
console.log(`\nB2 total: ${b2.length}`);
console.log("B2 by REASON:");
for (const [k, v] of Object.entries(
  b2.reduce((a, r) => ((a[r.REASON] = (a[r.REASON] || 0) + 1), a), {})
).sort((a, b) => b[1] - a[1]))
  console.log(`  ${v}\t${k}`);
console.log("B2 by PAGE TYPE:");
for (const [k, v] of Object.entries(
  b2.reduce((a, r) => ((a[r["Page type"]] = (a[r["Page type"]] || 0) + 1), a), {})
).sort((a, b) => b[1] - a[1]))
  console.log(`  ${v}\t${k}`);

const ex = rows.filter((r) => r["INDEXATION DECISION"] === "EXCLUDE");
console.log("\nEXCLUDE:", ex.map((r) => r.URL).join(", "));
const rd = rows.filter((r) => r["INDEXATION DECISION"] === "REDIRECT");
console.log("REDIRECT:", rd.map((r) => r.URL).join(", "));

const noSitemap = rows.filter((r) => r["In sitemap"] !== "yes");
console.log(`\nnot in sitemap: ${noSitemap.length}`);
