# INTERNAL-LINK-MAP

How the guides and the tools point at each other, generated from
`src/blog/blogData.ts` and from every prerendered HTML file in `dist/client`.

## Blog graph (30 English articles)

| slug | category | date | outbound (related) | inbound (pages linking in) |
|---|---|---|---:|---:|
| `protect-a-pdf-with-a-password` | PDF | 2026-10-04 | 3 | 17 |
| `compare-two-json-files-without-losing-your-place` | Developer | 2026-10-01 | 3 | 16 |
| `pdf-file-size-limits` | PDF | 2026-10-01 | 4 | 26 |
| `are-online-pdf-tools-safe` | PDF | 2026-10-01 | 4 | 26 |
| `how-to-convert-word-to-pdf` | PDF | 2026-10-01 | 3 | 29 |
| `how-to-convert-pdf-to-word` | PDF | 2026-10-01 | 3 | 23 |
| `make-a-favicon-from-any-image` | Images | 2026-09-24 | 3 | 16 |
| `box-shadow-vs-drop-shadow-filter` | Developer | 2026-09-24 | 4 | 7 |
| `soft-shadow-css-recipes` | Developer | 2026-09-22 | 3 | 7 |
| `neumorphism-box-shadow-guide` | Developer | 2026-09-19 | 3 | 6 |
| `preview-a-link-before-you-share-it` | SEO | 2026-09-17 | 3 | 18 |
| `box-shadow-values-real-websites` | Developer | 2026-09-16 | 4 | 9 |
| `how-to-make-a-qr-code` | Developer | 2026-09-13 | 3 | 8 |
| `fix-pdf-too-big-to-upload` | PDF | 2026-09-13 | 4 | 14 |
| `how-to-add-a-watermark-to-a-pdf` | PDF | 2026-09-13 | 3 | 4 |
| `how-to-convert-jpg-to-pdf` | PDF | 2026-09-12 | 3 | 10 |
| `how-to-convert-pdf-to-jpg` | PDF | 2026-09-12 | 3 | 5 |
| `how-to-split-a-pdf` | PDF | 2026-09-12 | 3 | 10 |
| `how-to-merge-pdf-files` | PDF | 2026-09-12 | 4 | 15 |
| `how-to-resize-an-image` | Images | 2026-09-12 | 3 | 7 |
| `how-to-compress-an-image` | Images | 2026-09-12 | 3 | 8 |
| `background-remover-for-product-photos` | Images | 2026-09-11 | 3 | 7 |
| `how-to-make-a-transparent-png` | Images | 2026-09-11 | 4 | 6 |
| `how-to-remove-background-from-an-image` | Images | 2026-09-11 | 3 | 4 |
| `check-your-robots-txt-and-sitemap-before-submitting` | SEO | 2026-09-03 | 3 | 17 |
| `how-to-compress-a-pdf` | PDF | 2026-06-15 | 5 | 11 |
| `why-i-started-building-small-browser-tools` | Productivity | 2026-05-30 | 3 | 1 |
| `format-and-debug-json-when-api-responses-are-unreadable` | Developer | 2026-05-18 | 4 | 7 |
| `clean-up-css-gradients-and-borders-in-design-work` | Developer | 2026-05-04 | 3 | 7 |
| `write-seo-title-and-meta-description-in-twenty-minutes` | SEO | 2026-04-22 | 5 | 7 |

- Articles with at least one inbound link: **30 / 30**
- Orphans (linked from no other page): **0**
- `relatedArticles` entries pointing at a slug that does not exist: **0**
- Every article is linked from `/blog` (the index renders the full registry, see
  `src/components/BlogPage.tsx`: `INITIAL_PAGE_SIZE = BLOG_ARTICLES.length`).

## Entry points

| Entry point | What it links to |
|---|---|
| `/blog` (index) | all 30 article pages, grouped by category |
| each article page | 3 sibling articles via `relatedArticles`, rendered in the static related list |
| tool pages | related tools grid + embedded "Next step" handoff cards |
| `/tools` directory | every tool, grouped by section |
| category hubs (`/pdf`, `/image`, `/json`, `/dev`, `/seo`, `/css`) | their tools and their guides |

## De-duplication

The related-tools grid in `src/components/Layout.tsx` now filters out any tool
already offered by the `WORKFLOW_GRAPH` handoff cards in
`src/components/ContinueEditing.tsx`, so a tool page never offers the same next
step twice. Measured against `src/data.ts`: **19 tool pages had duplicates, 31
duplicate links removed** (`node scripts/.dupcheck.mjs`).

## Verification

```
node scripts/.blogcheck.mjs     # 30/30 linked from /blog, 0 orphans
node scripts/audit-seo.mjs      # 0 broken internal links, 0 links to redirecting URLs
node scripts/verify-seo-signals.mjs
```
