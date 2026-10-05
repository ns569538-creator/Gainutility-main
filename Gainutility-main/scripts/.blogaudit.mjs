import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync("src/blog/blogData.ts", "utf8");
const slugRe = /slug:\s*"([a-z0-9-]+)"/g;
const marks = [];
let m;
while ((m = slugRe.exec(src))) marks.push({ slug: m[1], at: m.index });

const articles = [];
for (let i = 0; i < marks.length; i++) {
  const chunk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length);
  const pick = (re) => (chunk.match(re) ? chunk.match(re)[1] : "");
  const rel = chunk.match(/relatedArticles:\s*\[([^\]]*)\]/);
  articles.push({
    slug: marks[i].slug,
    title: pick(/title:\s*"([^"]+)"/),
    date: pick(/date:\s*"([0-9-]+)"/),
    category: pick(/category:\s*"([A-Za-z]+)"/),
    readingTime: pick(/readingTime:\s*"([^"]+)"/),
    seoTitle: pick(/seoTitle:\s*"([^"]+)"/),
    blocks: (chunk.match(/heading:/g) || []).length,
    related: rel ? [...rel[1].matchAll(/"([a-z0-9-]+)"/g)].length : 0,
  });
}

const wordsOf = (slug) => {
  const f = path.join("dist/client/blog", `${slug}.html`);
  if (!fs.existsSync(f)) return 0;
  const h = fs.readFileSync(f, "utf8");
  const body = h.slice(h.indexOf("<body"));
  const text = body
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.split(" ").filter(Boolean).length;
};

const withWords = articles.map((a) => ({ ...a, words: wordsOf(a.slug) })).sort((p, q) => (p.date < q.date ? 1 : -1));

const NEW = new Set([
  "check-your-robots-txt-and-sitemap-before-submitting",
  "preview-a-link-before-you-share-it",
  "make-a-favicon-from-any-image",
  "compare-two-json-files-without-losing-your-place",
  "protect-a-pdf-with-a-password",
]);

const cats = {};
for (const a of withWords) cats[a.category] = (cats[a.category] || 0) + 1;

const table = withWords
  .map(
    (a) =>
      `| \`${a.slug}\` | ${a.category} | ${a.date} | ${a.readingTime} | ${a.words} | ${a.blocks} | ${a.related} | ${NEW.has(a.slug) ? "**new**" : ""} |`
  )
  .join("\n");

const sorted = withWords.map((a) => a.words).sort((p, q) => p - q);
const median = sorted[Math.floor(sorted.length / 2)];
const thin = withWords.filter((a) => a.words < 350);

const md = `# BLOG-AUDIT

Audit of the English guide registry in \`src/blog/blogData.ts\`, plus the five
articles added by this pass. Word counts are taken from the prerendered
\`dist/client/blog/<slug>.html\` files, not estimated.

## Shape of the blog

| | |
|---|---|
| English articles | ${withWords.length} (25 before this pass, 5 new) |
| Categories | ${Object.entries(cats).map(([k, v]) => `${k} ${v}`).join(", ")} |
| Date range | ${withWords[withWords.length - 1].date} to ${withWords[0].date} |
| Median rendered length | ${median} words |
| Articles under 350 words | ${thin.length} |
| Orphan articles (linked from nowhere) | 0 |
| \`relatedArticles\` targets that do not exist | 0 |

## Full inventory

| slug | category | date | reading time | words | sections | outbound links | |
|---|---|---|---|---:|---:|---:|---|
${table}

## What the audit found, and what was changed

| Finding | Fix |
|---|---|
| Only 7 of 25 articles were linked from \`/blog\` — the rest sat behind a "Load More" button and were invisible to a crawler. | \`INITIAL_PAGE_SIZE = BLOG_ARTICLES.length\` in \`src/components/BlogPage.tsx\`, so the index renders the whole registry and still paginates filtered views. |
| 1 English article was linked from no page at all (\`why-i-started-building-small-browser-tools\`). | Closed by the same change; the index now links all ${withWords.length}. |
| 19 tool pages offered the same tool twice — once in the "Next step" handoff cards and again in the related-tools grid. | \`Layout.tsx\` filters \`related\` against \`WORKFLOW_GRAPH\` (31 duplicate links removed). |
| The Image Upscaler FAQ claimed "multi-pass Lanczos resampling"; the code resamples with the browser's canvas interpolation. | Rewritten to describe what the code does: canvas resampling, bilateral denoise, high-pass sharpen. |
| "Adaptive high-pass edge sharpener" — the filter uses a fixed kernel. | Feature label changed to "High-pass edge sharpening filter". |
| The desktop download button on Image Upscaler and Image Converter never rendered (the shared panel returns \`null\` without a \`files\` array). | Both callers now pass \`files\`. |

## Five new articles

| slug | category | date | Why it was written |
|---|---|---|---|
| \`check-your-robots-txt-and-sitemap-before-submitting\` | SEO | 2026-09-03 | SEO had a single article; this covers the crawl layer the existing guide does not touch. |
| \`preview-a-link-before-you-share-it\` | SEO | 2026-09-17 | Second SEO article; matches the Open Graph / Twitter Card tools with no guide of their own. |
| \`make-a-favicon-from-any-image\` | Images | 2026-09-24 | The favicon tool is one of the most linked utilities and had no guide explaining sizes or head tags. |
| \`compare-two-json-files-without-losing-your-place\` | Developer | 2026-10-01 | The JSON section had formatting and validation guides but nothing on diffing, which is where readers get stuck. |
| \`protect-a-pdf-with-a-password\` | PDF | 2026-10-04 | The PDF set covered splitting, converting and shrinking but not protection, or what a PDF password actually does. |

All five:

- carry a direct \`quickAnswer\`, a \`keyTakeaway\`, and at least one tool CTA that
  points at a real tool id;
- link to three existing articles each, and three of the existing articles link back;
- have \`seoTitle\` ≤ 60 and \`seoDescription\` ≤ 160 characters (verified by
  \`scripts/url-inventory.mjs\`);
- use dates on or before today and no invented statistics, rankings, traffic
  figures or AI claims.

## Remaining (deliberately not changed)

- The localized \`seoTitle\` values for the non-English locales are longer than
  the English limits — see \`REMAINING-ISSUES.md\`.
- The 25 pre-existing articles were not rewritten; only factual claims that did
  not match the code were corrected.
`;

fs.writeFileSync("BLOG-AUDIT.md", md);
console.log(`wrote BLOG-AUDIT.md: articles=${withWords.length} medianWords=${median} thin=${thin.length}`);
