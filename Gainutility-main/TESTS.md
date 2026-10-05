# TESTS — verification run for the 21-phase SEO / indexing pass

Every check below was run against the freshly built site (`dist/client`, 813 HTML
files). Re-run them after any further change.

## Build and type checks

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | pass — no type errors |
| `npm run build` | pass — prerendered **813 HTML files (812 routes + 404)** |

## SEO gates

| Command | Result |
|---|---|
| `node scripts/verify-seo-signals.mjs` | **11/11** — sitemap/HTML parity 586, self-canonical 586, no noindex in sitemap, no hreflang on 58 noindex pages, hreflang self-reference + 0 broken targets, unique title+description per locale, exactly one H1 per page, es-CO excluded, sitemap `<loc>` matches the homepage canonical (`https://gainutility.com/`), only the homepage carries a trailing slash |
| `node scripts/audit-seo.mjs` | **AUDIT PASS: no issues found** across 813 files (0 broken internal links, 0 links to redirecting URLs, 0 duplicate titles, 0 missing descriptions) |
| `node scripts/index-audit.mjs` | Phase L (canonical consistency) all zeros; remaining groups: 16 `default — review`, 10 `translator pair — thin prerender` |
| `node scripts/url-inventory.mjs` | 586 sitemap URLs; EN slice 246 → **titles > 60: 0, descriptions > 160: 0** |

## Content-specific checks

| Command | Result |
|---|---|
| `node scripts/.blogcheck.mjs` | 30/30 English articles linked from `/blog`; **0 orphans**; 0 missing |
| `node scripts/.linkmap.mjs` | `relatedArticles` → 0 broken targets, 0 orphans (writes `INTERNAL-LINK-MAP.md`) |
| `node scripts/.blogaudit.mjs` | 30 articles, median 563 rendered words, **0 articles under 350 words** (writes `BLOG-AUDIT.md`) |
| `node scripts/.dupcheck.mjs` | 19 tool pages had a duplicate related-tool link → **31 duplicate links removed** by the Layout filter |
| `node scripts/.meta-table.mjs` | writes `META-TABLE.md`; max EN title 60, max EN description 159 |

## Spot checks on generated HTML

```
dist/client/site-audit.html      visible copy 29 words  ->  242 words after the new prerender branch
dist/client/blog.html            7 article links        ->  30 article links
dist/client/tools/image-resizer  related grid now filtered against WORKFLOW_GRAPH
```

## Not covered by automation

- **Search Console verification.** Nothing here claims an indexing gain; the
  sitemap and canonical fixes only make the existing pages discoverable and
  consistent. Submitting and monitoring is a manual step.
- **Browser-level download of the upscaler/converter output.** The cause (the
  shared download panel returned `null` without a `files` array, so desktop had
  no button) is fixed at the source, but the click itself needs a human with a
  browser.
- **Non-English meta lengths** — counted and documented, not rewritten
  (`REMAINING-ISSUES.md`).
