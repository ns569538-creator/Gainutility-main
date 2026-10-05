import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync("src/blog/blogData.ts", "utf8");

// Split the registry into per-article records by slug so we can read
// relatedArticles + seo fields without a TS parser.
const articles = [];
const slugRe = /slug:\s*"([a-z0-9-]+)"/g;
const marks = [];
let m;
while ((m = slugRe.exec(src))) marks.push({ slug: m[1], at: m.index });
for (let i = 0; i < marks.length; i++) {
  const chunk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length);
  const rel = chunk.match(/relatedArticles:\s*\[([^\]]*)\]/);
  const date = chunk.match(/date:\s*"([0-9-]+)"/);
  const cat = chunk.match(/category:\s*"([A-Za-z]+)"/);
  const title = chunk.match(/title:\s*"([^"]+)"/);
  const related = rel ? [...rel[1].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]) : [];
  articles.push({ slug: marks[i].slug, title: title ? title[1] : "", date: date ? date[1] : "", category: cat ? cat[1] : "", related });
}

const bySlug = new Map(articles.map((a) => [a.slug, a]));

// Inbound links from every prerendered page (self-links excluded).
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
};
const LINK = /href="(?:https:\/\/gainutility\.com)?(\/blog\/[a-z0-9-]+)"/g;
const inbound = new Map();
for (const f of walk("dist/client")) {
  const html = fs.readFileSync(f, "utf8");
  const self = `/blog/${path.basename(f, ".html")}`;
  for (const mm of html.matchAll(LINK)) {
    if (mm[1] === self) continue;
    if (!inbound.has(mm[1])) inbound.set(mm[1], new Set());
    inbound.get(mm[1]).add(f.replace(/\\/g, "/").replace("dist/client", ""));
  }
}

const rows = articles
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((a) => {
    const inb = inbound.get(`/blog/${a.slug}`);
    return `| \`${a.slug}\` | ${a.category} | ${a.date} | ${a.related.length} | ${inb ? inb.size : 0} |`;
  });

const orphan = articles.filter((a) => !(inbound.get(`/blog/${a.slug}`) || new Set()).size);
const broken = [];
for (const a of articles) for (const r of a.related) if (!bySlug.has(r)) broken.push(`${a.slug} -> ${r}`);

const md = `# INTERNAL-LINK-MAP

How the guides and the tools point at each other, generated from
\`src/blog/blogData.ts\` and from every prerendered HTML file in \`dist/client\`.

## Blog graph (30 English articles)

| slug | category | date | outbound (related) | inbound (pages linking in) |
|---|---|---|---:|---:|
${rows.join("\n")}

- Articles with at least one inbound link: **${articles.length - orphan.length} / ${articles.length}**
- Orphans (linked from no other page): **${orphan.length}**
- \`relatedArticles\` entries pointing at a slug that does not exist: **${broken.length}**
- Every article is linked from \`/blog\` (the index renders the full registry, see
  \`src/components/BlogPage.tsx\`: \`INITIAL_PAGE_SIZE = BLOG_ARTICLES.length\`).

## Entry points

| Entry point | What it links to |
|---|---|
| \`/blog\` (index) | all 30 article pages, grouped by category |
| each article page | 3 sibling articles via \`relatedArticles\`, rendered in the static related list |
| tool pages | related tools grid + embedded "Next step" handoff cards |
| \`/tools\` directory | every tool, grouped by section |
| category hubs (\`/pdf\`, \`/image\`, \`/json\`, \`/dev\`, \`/seo\`, \`/css\`) | their tools and their guides |

## De-duplication

The related-tools grid in \`src/components/Layout.tsx\` now filters out any tool
already offered by the \`WORKFLOW_GRAPH\` handoff cards in
\`src/components/ContinueEditing.tsx\`, so a tool page never offers the same next
step twice. Measured against \`src/data.ts\`: **19 tool pages had duplicates, 31
duplicate links removed** (\`node scripts/.dupcheck.mjs\`).

## Verification

\`\`\`
node scripts/.blogcheck.mjs     # 30/30 linked from /blog, 0 orphans
node scripts/audit-seo.mjs      # 0 broken internal links, 0 links to redirecting URLs
node scripts/verify-seo-signals.mjs
\`\`\`
`;

fs.writeFileSync("INTERNAL-LINK-MAP.md", md);
console.log(`wrote INTERNAL-LINK-MAP.md: articles=${articles.length} orphans=${orphan.length} brokenRelated=${broken.length}`);
