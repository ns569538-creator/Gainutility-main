# FILES-CHANGED

Everything touched by this pass. The repo is **not a git repository**, so this
list is the record — no `git diff` exists. Verified from file modification times
plus the run log.

## Source files (31)

| File | What changed | Phase |
|---|---|---|
| `src/colorStudio/color.ts` | OKLCH round-trip: colour → OKLCH → colour now returns the input exactly (dropped the extra matrix stage that drifted `#3B82F6` → `#00E4CC`) | 1 |
| `src/seo/shared.ts` | home canonical now `SITE_URL + "/"` for every locale (matches sitemap, hreflang, JSON-LD, internal links); `/tools` hub description shortened | 2, 6 |
| `src/i18n/ui.ts` | three new search placeholder keys (`searchAllTools`, `filterCategoryTools`, `filterImagesTools`) across 8 locales | 4 |
| `src/components/HeroToolSearch.tsx` | homepage search placeholder → "Search all tools" | 4 |
| `src/components/BrowseStudio.tsx` | browse filter placeholder → "Filter {category} tools" | 4 |
| `src/components/ToolCard.tsx` | card title reserves two lines (`min-h-[2.75em]`) so cards no longer jump on hover | 5 |
| `src/toolsRegistry.tsx` | `exam-signature-fixer` name → "Exam Signature Resizer" | 6 |
| `src/components/exams/ExamSelector.tsx` | matching selector chip label | 6 |
| `src/seo/extraExams.ts` | title aligned with the new H1; description to 141 chars | 6 |
| `src/seo/comparisonPages.ts` | 16 comparison titles/descriptions to ≤ 60 / ≤ 160 | 6 |
| `src/seo/libraryPages.ts` | 4 library titles/descriptions | 6 |
| `src/seo/seoPageContent.ts` | 18 hub and hub-sub-page titles/descriptions | 6 |
| `src/seo/translatorPairs.ts` | translator-pair descriptions | 6 |
| `src/seo/extraPdf.ts` | `unlock-pdf` description | 6 |
| `src/seo/extraPdfUtilities.ts` | descriptions | 6 |
| `src/seo/extraPdfConverters.ts` | descriptions | 6 |
| `src/seo/extraMedia.ts` | descriptions | 6 |
| `src/seo/extraGenerators.ts` | `favicon-generator` description | 6 |
| `src/seo/extraCreator.ts` | `youtube-url-toolkit` description (230 → 154 chars) | 6 |
| `src/seo/extraStylishNames.ts` | `stylish-name-generator` description (187 → 154) | 6 |
| `src/seo/extraColorTools.ts` | description | 6 |
| `src/seo/extraWebsiteStudio.ts` | description | 6 |
| `src/i18n/pages.ts` | homepage, about and blog index titles | 6 |
| `src/i18n/sitePagesData.ts` | privacy + cookie descriptions | 6 |
| `src/data.ts` | 22 tool titles/descriptions; upscaler FAQ no longer claims Lanczos; "Adaptive high-pass" → "High-pass edge sharpening filter"; `json-compare-diff` title | 6 |
| `src/blog/blogData.ts` | 11 EN `seoTitle`s; **5 new articles**; back-links added to 4 existing `relatedArticles` lists | 6, 13, 14 |
| `src/components/ImageUpscaler.tsx` | download panel now receives `files` (desktop had no download button) | 8 |
| `src/components/ImageConverter.tsx` | same fix | 8 |
| `src/components/ContinueEditing.tsx` | `WORKFLOW_GRAPH` exported; related-card hover no longer hides the icon | 10, 11 |
| `src/components/Layout.tsx` | hreflang suppressed on noindex (Phase 3); related-tools grid filtered against `WORKFLOW_GRAPH` | 3, 11 |
| `src/components/BlogPage.tsx` | `INITIAL_PAGE_SIZE = BLOG_ARTICLES.length` so `/blog` renders every guide | 12 |

## Build / prerender scripts (8)

| File | What changed |
|---|---|
| `scripts/prerender-entry.ts` | hreflang suppressed on `noindex`; **new `case "audit"`** so `/site-audit` prerenders 242 words instead of 29 |
| `scripts/generate-sitemap.mjs` | `locFor()` keeps the trailing slash on the homepage only |
| `scripts/verify-seo-signals.mjs` | trailing-slash assertion scoped to the homepage (580 inner URLs) |
| `scripts/audit-seo.mjs` | root canonical expected with the trailing slash |
| `scripts/index-audit.mjs` | same |
| `scripts/forensics-indexing.mjs` | same |
| `scripts/url-inventory.mjs` | generates `scripts/url-inventory.json` / `.csv` |
| `scripts/route-inventory.mjs` | generates `scripts/.route-inventory.json` |

## Generated outputs (rebuilt by `npm run build`)

`public/sitemap.xml` (581 → **586** URLs), `public/robots.txt`, `public/feed.xml`,
`public/_redirects`, and all 813 files under `dist/client`.

## Measurement helpers (inert, safe to delete)

`scripts/.meta-table.mjs`, `.linkmap.mjs`, `.blogaudit.mjs`, `.blogcheck.mjs`,
`.dupcheck.mjs`, `.blogindex.mjs`, `.findrel.mjs`, `.overs.mjs`, `.locate.mjs`,
`.overlimit.mjs`, `.diff.mjs`, `.probe-live.mjs`, `.sitemapdiff.mjs`,
`.route-inventory.json`, `.probe-www.mjs`, `.tool-names.mjs`, `.orphans.mjs`,
`.analyze.mjs`, `.words.mjs`.

## Routes changed

| | before | after |
|---|---:|---:|
| Prerendered HTML files | 808 (807 + 404) | **813 (812 + 404)** |
| URLs in `public/sitemap.xml` | 581 (repo) / 582 (live) | **586** |
| English articles | 25 | **30** |
| EN pages over the title/description limits | 104 | **0** |
| Orphan English articles | 1 | **0** |

No existing URL, slug or canonical was changed. The only routing-visible change
is **five new article URLs**:

```
/blog/check-your-robots-txt-and-sitemap-before-submitting
/blog/preview-a-link-before-you-share-it
/blog/make-a-favicon-from-any-image
/blog/compare-two-json-files-without-losing-your-place
/blog/protect-a-pdf-with-a-password
```

## Documents produced

`INDEXING-REPORT.md`, `SITEMAP-DIFF.md`, `META-TABLE.md`,
`NAMING-BEFORE-AFTER.md`, `BLOG-AUDIT.md`, `INTERNAL-LINK-MAP.md`, `TESTS.md`,
`REMAINING-ISSUES.md`, `FILES-CHANGED.md` (this file), plus
`scripts/url-inventory.json` / `.csv`.

## Not done

`npm run deploy` has **not** been run. Non-English meta rewrites, the colour-page
title template, and the live-host/redirect findings are listed in
`REMAINING-ISSUES.md`.
