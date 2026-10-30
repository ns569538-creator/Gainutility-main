import { readFileSync, existsSync } from "node:fs";

const SITE = "https://gainutility.com";
const sm = readFileSync("public/sitemap.xml", "utf8");
const smPaths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ""));

function htmlFile(route) {
  const r = route === "/" ? "index.html" : route.replace(/^\//, "") + ".html";
  const p = `dist/client/${r}`;
  return existsSync(p) ? p : null;
}

/* 1. es-co vs es-mx real diff */
console.log("=== es-CO vs es-MX deep diff ===");
const pairs = [
  ["/es-co/about", "/es-mx/about"],
  ["/es-co/tools/contrast-checker", "/es-mx/tools/contrast-checker"],
  ["/es-co/pdf", "/es-mx/pdf"],
];
for (const [aP, bP] of pairs) {
  const fa = htmlFile(aP), fb = htmlFile(bP);
  if (!fa || !fb) { console.log(`${aP} vs ${bP}: missing`, fa ? "" : aP, fb ? "" : bP); continue; }
  const a = readFileSync(fa, "utf8"), b = readFileSync(fb, "utf8");
  // strip canonical + hreflang + lang attr + script assets hash
  const strip = (s) => s
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, "<CANON/>")
    .replace(/<link[^>]*hreflang[^>]*\/?>/g, "<HL/>")
    .replace(/<html lang="[^"]*"/, "<html lang=X")
    .replace(/assets\/[^"]+\.(css|js)/g, "assets/HASH.$1");
  const sa = strip(a), sb = strip(b);
  console.log(`${aP}: identical=${sa === sb}`);
  if (sa !== sb) {
    // find first diff
    let i = 0; while (i < Math.min(sa.length, sb.length) && sa[i] === sb[i]) i++;
    console.log(`  first diff @${i}: A:"${sa.slice(i, i + 120)}"`);
    console.log(`                B:"${sb.slice(i, i + 120)}"`);
  }
}
// es-mx combinar/unir slug check
console.log("\nes-co/tools/combinar-pdf html:", htmlFile("/es-co/tools/combinar-pdf") ? "exists" : "MISSING");
console.log("es-mx/tools/unir-pdf html:", htmlFile("/es-mx/tools/unir-pdf") ? "exists" : "MISSING");
const coSlug = smPaths.filter((p) => p.startsWith("/es-co/") && p.includes("/tools/")).map((p) => p);
const mxSlug = smPaths.filter((p) => p.startsWith("/es-mx/") && p.includes("/tools/")).map((p) => p);
console.log("es-co tool slugs:", coSlug.join(", "));
console.log("es-mx tool slugs:", mxSlug.join(", "));

/* 2. default-review pages */
console.log("\n=== classification 'default' pages ===");
// reproduce classify default quickly: pages not matching known patterns
function classifyDefault(p) {
  if (p === "/404") return false;
  if (/^\/(colors|color-palettes|ui-colors)\//.test(p)) return false;
  if (/^\/es-co\//.test(p)) return false;
  if (/^\/studios\/color\//.test(p)) return false;
  const toolId = p.match(/^\/tools\/([^/]+)$/)?.[1];
  if (toolId) return false;
  if (/^\/tools\/pdf-translator\//.test(p)) return false;
  if (p === "/creator") return false;
  if (/^\/compare\//.test(p)) return false;
  if (/\/best$/.test(p)) return false;
  if (/^\/([^/]+\/)?tools\//.test(p)) return false;
  if (/^\/(pdf|json|image|dev|css|seo)(\/|$)/.test(p)) return false;
  if (/^\/[^/]+\/(formatter|beautifier|validator|minifier|viewer|generator|checker|preview|encoder|decoder|builder|converter|compressor)$/.test(p)) return false;
  if (p === "/" || /^\/(about|blog|privacy|terms|security|changelog|contact|tools|404)$/.test(p)) return false;
  if (/^\/blog\//.test(p)) return false;
  if (/^\/(pt-br|de|fr|it|id|es-mx)\/(about|blog|css|dev|image|json|pdf|seo)(\/|$)/.test(p)) return false;
  if (/^\/(pt-br|de|fr|it|id|es-mx)\/tools\//.test(p)) return false;
  return true;
}
const defaults = smPaths.filter(classifyDefault);
console.log("count:", defaults.length);
defaults.forEach((p) => console.log("  ", p));

/* 3. unique content score (5-gram Jaccard vs all other pages, same text extraction) */
console.log("\n=== unique content score sample ===");
function textOf(html) {
  const i = html.indexOf('<div id="root"');
  const root = i >= 0 ? html.slice(i) : html;
  return root.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();
}
function grams(t, n = 5) {
  const w = t.split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(" "));
  return s;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const g of small) if (large.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}
// build set: EN tool pages + a few other types
const samplePaths = [
  ...smPaths.filter((p) => /^\/tools\/[^/]+$/.test(p) && !p.includes("pdf-translator")),
  "/pdf", "/json", "/image", "/dev", "/css", "/seo",
  "/compare/merge-vs-split-pdf", "/pdf/best",
  "/colors/red", "/color-palettes/rosewater",
  "/blog/how-to-merge-pdf-files", "/creator", "/tools",
];
const docs = [];
for (const p of samplePaths) {
  const f = htmlFile(p);
  if (!f) continue;
  docs.push({ p, g: grams(textOf(readFileSync(f, "utf8"))) });
}
const scores = [];
for (let i = 0; i < docs.length; i++) {
  let max = 0, maxWith = "";
  for (let j = 0; j < docs.length; j++) {
    if (i === j) continue;
    const s = jaccard(docs[i].g, docs[j].g);
    if (s > max) { max = s; maxWith = docs[j].p; }
  }
  scores.push({ p: docs[i].p, sim: max, with: maxWith });
}
scores.sort((a, b) => b.sim - a.sim);
console.log("most similar pairs (max Jaccard vs any other):");
scores.slice(0, 12).forEach((s) => console.log(`  ${(s.sim * 100).toFixed(1)}% ${s.p} ~ ${s.with}`));
const avg = scores.reduce((n, s) => n + s.sim, 0) / scores.length;
console.log(`avg max-similarity: ${(avg * 100).toFixed(1)}% across ${scores.length} docs`);
