import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const clientDir = resolve(process.cwd(), "dist", "client");

function walk(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name === "index.html") acc.push(p);
    else if (ent.name === "404.html") acc.push(p);
  }
  return acc;
}

const files = walk(clientDir);

function classify(html) {
  // marker detection
  const hasMarker = /data-gu-ssr="1"/.test(html);
  // identify root content
  const rootMatch = html.match(/<div id="root"([^>]*)>/);
  const rootAttrs = rootMatch ? rootMatch[1] : "";
  // Does root contain a real SSR tree (min-h-screen) OR static shell (header first)?
  // Real SSR home: root immediate child is <div class="min-h-screen...">
  const afterRoot = rootMatch ? html.slice(rootMatch.index) : "";
  const ssrTree = /<div id="root"[^>]*>\s*(<!--\s*-->)?\s*<div class="min-h-screen/.test(afterRoot);
  const headerShell = /<div id="root"[^>]*>\s*<header/.test(afterRoot);

  let kind;
  if (hasMarker && ssrTree) kind = "ssr-home";
  else if (headerShell) kind = "static-header-shell"; // header + bodyContent
  else if (/<div id="root"[^>]*>\s*(<h1|<!--)/.test(afterRoot)) kind = "plain-default";
  else kind = "unknown";

  return { hasMarker, kind };
}

const counts = {};
const byKind = {};
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const c = classify(html);
  counts[c.kind] = (counts[c.kind] || 0) + 1;
  if (!byKind[c.kind]) byKind[c.kind] = [];
  byKind[c.kind].push(relative(clientDir, f).replace(/\\/g, "/"));
}

console.log("TOTAL FILES:", files.length);
console.log("CLASSIFICATION COUNTS:");
console.log(JSON.stringify(counts, null, 2));

console.log("\n--- samples per kind ---");
for (const k of Object.keys(byKind)) {
  console.log(`\n[${k}] (${byKind[k].length}):`);
  console.log("  " + byKind[k].slice(0, 8).join("\n  "));
}
