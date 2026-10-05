# BLOG-AUDIT

Audit of the English guide registry in `src/blog/blogData.ts`, plus the five
articles added by this pass. Word counts are taken from the prerendered
`dist/client/blog/<slug>.html` files, not estimated.

## Shape of the blog

| | |
|---|---|
| English articles | 30 (25 before this pass, 5 new) |
| Categories | PDF 12, Developer 8, Images 6, SEO 3, Productivity 1 |
| Date range | 2026-04-22 to 2026-10-04 |
| Median rendered length | 563 words |
| Articles under 350 words | 0 |
| Orphan articles (linked from nowhere) | 0 |
| `relatedArticles` targets that do not exist | 0 |

## Full inventory

| slug | category | date | reading time | words | sections | outbound links | |
|---|---|---|---|---:|---:|---:|---|
| `protect-a-pdf-with-a-password` | PDF | 2026-10-04 | 5 min read | 568 | 4 | 3 | **new** |
| `compare-two-json-files-without-losing-your-place` | Developer | 2026-10-01 | 6 min read | 541 | 4 | 3 | **new** |
| `pdf-file-size-limits` | PDF | 2026-10-01 | 6 min read | 1607 | 8 | 4 |  |
| `are-online-pdf-tools-safe` | PDF | 2026-10-01 | 6 min read | 1145 | 7 | 4 |  |
| `how-to-convert-word-to-pdf` | PDF | 2026-10-01 | 4 min read | 625 | 4 | 3 |  |
| `how-to-convert-pdf-to-word` | PDF | 2026-10-01 | 5 min read | 859 | 5 | 3 |  |
| `make-a-favicon-from-any-image` | Images | 2026-09-24 | 5 min read | 576 | 4 | 3 | **new** |
| `box-shadow-vs-drop-shadow-filter` | Developer | 2026-09-24 | 6 min read | 1030 | 6 | 4 |  |
| `soft-shadow-css-recipes` | Developer | 2026-09-22 | 7 min read | 956 | 6 | 3 |  |
| `neumorphism-box-shadow-guide` | Developer | 2026-09-19 | 6 min read | 929 | 5 | 3 |  |
| `preview-a-link-before-you-share-it` | SEO | 2026-09-17 | 4 min read | 579 | 4 | 3 | **new** |
| `box-shadow-values-real-websites` | Developer | 2026-09-16 | 9 min read | 2542 | 12 | 4 |  |
| `how-to-make-a-qr-code` | Developer | 2026-09-13 | 5 min read | 543 | 4 | 3 |  |
| `fix-pdf-too-big-to-upload` | PDF | 2026-09-13 | 5 min read | 535 | 4 | 4 |  |
| `how-to-add-a-watermark-to-a-pdf` | PDF | 2026-09-13 | 4 min read | 463 | 3 | 3 |  |
| `how-to-convert-jpg-to-pdf` | PDF | 2026-09-12 | 4 min read | 492 | 3 | 3 |  |
| `how-to-convert-pdf-to-jpg` | PDF | 2026-09-12 | 4 min read | 478 | 3 | 3 |  |
| `how-to-split-a-pdf` | PDF | 2026-09-12 | 4 min read | 479 | 3 | 3 |  |
| `how-to-merge-pdf-files` | PDF | 2026-09-12 | 5 min read | 522 | 3 | 4 |  |
| `how-to-resize-an-image` | Images | 2026-09-12 | 5 min read | 563 | 4 | 3 |  |
| `how-to-compress-an-image` | Images | 2026-09-12 | 4 min read | 560 | 4 | 3 |  |
| `background-remover-for-product-photos` | Images | 2026-09-11 | 4 min read | 553 | 3 | 3 |  |
| `how-to-make-a-transparent-png` | Images | 2026-09-11 | 4 min read | 599 | 4 | 4 |  |
| `how-to-remove-background-from-an-image` | Images | 2026-09-11 | 5 min read | 670 | 4 | 3 |  |
| `check-your-robots-txt-and-sitemap-before-submitting` | SEO | 2026-09-03 | 5 min read | 698 | 4 | 3 | **new** |
| `how-to-compress-a-pdf` | PDF | 2026-06-15 | 4 min read | 544 | 4 | 5 |  |
| `why-i-started-building-small-browser-tools` | Productivity | 2026-05-30 | 3 min read | 415 | 32 | 3 |  |
| `format-and-debug-json-when-api-responses-are-unreadable` | Developer | 2026-05-18 | 4 min read | 515 | 4 | 4 |  |
| `clean-up-css-gradients-and-borders-in-design-work` | Developer | 2026-05-04 | 4 min read | 478 | 4 | 3 |  |
| `write-seo-title-and-meta-description-in-twenty-minutes` | SEO | 2026-04-22 | 5 min read | 505 | 5 | 5 |  |

## What the audit found, and what was changed

| Finding | Fix |
|---|---|
| Only 7 of 25 articles were linked from `/blog` — the rest sat behind a "Load More" button and were invisible to a crawler. | `INITIAL_PAGE_SIZE = BLOG_ARTICLES.length` in `src/components/BlogPage.tsx`, so the index renders the whole registry and still paginates filtered views. |
| 1 English article was linked from no page at all (`why-i-started-building-small-browser-tools`). | Closed by the same change; the index now links all 30. |
| 19 tool pages offered the same tool twice — once in the "Next step" handoff cards and again in the related-tools grid. | `Layout.tsx` filters `related` against `WORKFLOW_GRAPH` (31 duplicate links removed). |
| The Image Upscaler FAQ claimed "multi-pass Lanczos resampling"; the code resamples with the browser's canvas interpolation. | Rewritten to describe what the code does: canvas resampling, bilateral denoise, high-pass sharpen. |
| "Adaptive high-pass edge sharpener" — the filter uses a fixed kernel. | Feature label changed to "High-pass edge sharpening filter". |
| The desktop download button on Image Upscaler and Image Converter never rendered (the shared panel returns `null` without a `files` array). | Both callers now pass `files`. |

## Five new articles

| slug | category | date | Why it was written |
|---|---|---|---|
| `check-your-robots-txt-and-sitemap-before-submitting` | SEO | 2026-09-03 | SEO had a single article; this covers the crawl layer the existing guide does not touch. |
| `preview-a-link-before-you-share-it` | SEO | 2026-09-17 | Second SEO article; matches the Open Graph / Twitter Card tools with no guide of their own. |
| `make-a-favicon-from-any-image` | Images | 2026-09-24 | The favicon tool is one of the most linked utilities and had no guide explaining sizes or head tags. |
| `compare-two-json-files-without-losing-your-place` | Developer | 2026-10-01 | The JSON section had formatting and validation guides but nothing on diffing, which is where readers get stuck. |
| `protect-a-pdf-with-a-password` | PDF | 2026-10-04 | The PDF set covered splitting, converting and shrinking but not protection, or what a PDF password actually does. |

All five:

- carry a direct `quickAnswer`, a `keyTakeaway`, and at least one tool CTA that
  points at a real tool id;
- link to three existing articles each, and three of the existing articles link back;
- have `seoTitle` ≤ 60 and `seoDescription` ≤ 160 characters (verified by
  `scripts/url-inventory.mjs`);
- use dates on or before today and no invented statistics, rankings, traffic
  figures or AI claims.

## Remaining (deliberately not changed)

- The localized `seoTitle` values for the non-English locales are longer than
  the English limits — see `REMAINING-ISSUES.md`.
- The 25 pre-existing articles were not rewritten; only factual claims that did
  not match the code were corrected.
