import { readFileSync } from "node:fs";

function parseLine(l) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (q) {
      if (c === '"') {
        if (l[i + 1] === '"') { cur += '"'; i++; }
        else q = false;
      } else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

const lines = readFileSync("INDEX-READY.csv", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
const hdr = parseLine(lines[0]);
const rows = lines.slice(1).map(parseLine).map((r) => Object.fromEntries(hdr.map((h, i) => [h, r[i]])));
console.log("rows", rows.length);
const cls = {};
for (const r of rows) cls[r.Classification] = (cls[r.Classification] || 0) + 1;
console.log(cls);
const sin = rows.filter((r) => r["In sitemap"] === "yes");
console.log("in sitemap", sin.length);
const cSin = sin.filter((r) => r.Classification === "C");
console.log("C in sitemap", cSin.length);
const groups = {};
for (const r of cSin) {
  const u = r.URL || "";
  let g = "other";
  if (/^https:\/\/gainutility\.com\/(colors|color-palettes|ui-colors)\//.test(u)) g = "color";
  else if (u.includes("/es-co")) g = "es-co";
  else g = "alias-or-other";
  groups[g] = (groups[g] || 0) + 1;
}
console.log(groups);
console.log("alias/other C-in-sitemap:");
for (const r of cSin) {
  const u = r.URL || "";
  if (!/^https:\/\/gainutility\.com\/(colors|color-palettes|ui-colors)\//.test(u) && !u.includes("/es-co"))
    console.log(" ", u, "|", r.Reason, "|", r["Recommended action"]);
}
console.log("/creator rows:");
for (const r of rows) {
  if (r.URL.endsWith("/creator")) console.log(r.URL, r.Classification, r["In sitemap"], r["Final index decision"], r["Main words"]);
}
// All C rows not in sitemap (for reference)
const cOut = rows.filter((r) => r.Classification === "C" && r["In sitemap"] !== "yes");
console.log("C not in sitemap:", cOut.length);
for (const r of cOut) console.log(" ", r.URL, "|", r.Reason);
