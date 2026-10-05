import fs from "node:fs";
import path from "node:path";

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
};

const src = fs.readFileSync("src/blog/blogData.ts", "utf8");
const enSlugs = [...src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
const uniq = [...new Set(enSlugs)];

const files = walk("dist/client");
const blogIndex = fs.readFileSync("dist/client/blog.html", "utf8");
const LINK = /href="(?:https:\/\/gainutility\.com)?(\/blog\/[a-z0-9-]+)"/g;
const indexLinks = new Set([...blogIndex.matchAll(LINK)].map((m) => m[1]));

const linkedFrom = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(LINK)) {
    const url = m[1];
    const self = `/blog/${path.basename(f, ".html")}`;
    if (url === self) continue; // an article linking to itself is not inbound
    if (!linkedFrom.has(url)) linkedFrom.set(url, new Set());
    linkedFrom.get(url).add(f.replace(/\\/g, "/"));
  }
}

const missingFromIndex = uniq.filter((s) => !indexLinks.has(`/blog/${s}`));
const orphans = uniq.filter((s) => !linkedFrom.has(`/blog/${s}`));

console.log(`EN article slugs in blogData: ${uniq.length}`);
console.log(`articles linked from /blog.html: ${indexLinks.size}`);
console.log(`missing from /blog.html: ${missingFromIndex.length}`);
if (missingFromIndex.length) console.log("  " + missingFromIndex.join("\n  "));
console.log(`orphan articles (linked from no page): ${orphans.length}`);
if (orphans.length) console.log("  " + orphans.join("\n  "));
console.log(`\nHTML files scanned: ${files.length}`);
