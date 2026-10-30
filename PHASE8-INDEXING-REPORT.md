# Phase 8 — Indexing Forensics Report (read-only)

Date: 2026-09-22 · Data: `public/sitemap.xml` (504 URLs), `dist/client` (519 HTML), GSC export summary (480 Discovered-not-indexed, 4 Crawled-not-indexed, ~24 Indexed, 8 Redirects, 2 × 404, 1 Alternate-canonical), redirect sources (182 unique).
Scripts: `scripts/forensics-indexing.mjs`, `scripts/forensics2.mjs`, `scripts/audit-seo.mjs`, `scripts/inspect-page.mjs` — all read-only against existing build. **No mass changes made.**

## Executive summary — why Google indexes ~24 of ~480

Not a technical-blocking problem (robots, canonicals, noindex, 404s, and internal links are all clean — see numbers 10/11/4/8). The problem is **indexability value**: 141 tool pages render as near-identical templates whose richest content (how-to steps, examples, limitations, troubleshooting, privacy details) is behind **closed accordions that never enter the DOM unless clicked — 0/144 tool pages contain steps/limitations/troubleshooting in prerendered HTML**. Median indexable content per tool page is only ~295 words in `<main>`. On top of that the sitemap dilutes with 151 thin color pages, 19 exact es-co/es-mx duplicates, and 22 overlapping-alias tool URLs. Google's "Discovered — currently not indexed" is the expected verdict on that profile from a low-authority site.

---

## The 15 required numbers

1. **Routes discovered (HTML ∪ sitemap ∪ redirect sources): 698** — 519 prerendered HTML files (incl. `/404`), 504 sitemap URLs (366 EN + 138 localized), 363 deduped redirect source rules (182 unique source→target pairs after pair-dedup across `vercel.json` + `public/_redirects`).
2. **Canonical tool pages (EN `/tools/<id>`, excl. `SITEMAP_EXCLUDES`): 141** — plus 10 translator-pair sub-pages, 64 SEO hub/sub pages, 18 comparison, 6 best, 18 blog articles, ~20 static/home, 151 color pages.
3. **Duplicate/overlapping page inventory:** 15 alias groups ≈ **37 tool URLs** (shared component/near-identical intent); **es-co ↔ es-mx full duplicates: 19 URLs** (es-co copies es-mx by design); **SEO hub sub-pages overlapping tool intent: 56** (e.g. `/json/formatter` vs `/tools/json-beautifier`); **localized tool variants: 68** (localized slugs, e.g. `/pt-br/tools/juntar-pdf`, `/de/tools/pdf-zusammenfuegen`).
4. **Broken pages: 0** sitemap URLs without HTML; **0 tools unwired** in `App.tsx`; 0 broken internal links (audit's only link "error" is `/research/box-shadow-values.csv` — false positive, file exists and `.csv` isn't in the auditor's extension whitelist). **HTML missing from sitemap: 1 — `/creator`** (renders fine, 479 words).
5. **Redirect source pages: 182 unique** — deployed via `vercel.json` + `public/_redirects`. GSC shows 8 actual redirected URLs in coverage (legacy/unknown sources; not identifiable from build alone).
6. **404 route: 1 shell (`/404`)**. GSC's 2 reported 404 URLs are **not derivable from the build** — no GSC export file in repo; need the export list from GSC.
7. **Duplicate titles (same locale): 0.** Cross-locale identical titles: **38 instances = the 19 es-co/es-mx pairs**.
8. **Duplicate H1 (same locale): 9** — all `/studios/color/*` sections sharing `H1 "Color Studio"` (`contrast, explore, generator, gradients, image, picker, scales, ui-colors, visualizer == colors`). None of these are in the sitemap.
9. **Duplicate meta descriptions (same locale): 0.**
10. **Canonical problems: 0** — 0 missing/mismatched/duplicate canonicals; every canonical is self-referencing and matches the sitemap URL; non-slash strategy (flat `.html`, non-slash canonicals) is consistent.
11. **Noindex problems: 0** — no accidental `noindex` anywhere except the intentional `/404` shell.
12. **Weak/thin/unfinished content:**
    - Tool pages with weak signals (<700 total words or fallback SEO / <3 FAQ / <3 steps / <2 related): **143/144** (only `/tools/box-shadow-generator` clears every bar).
    - **`<main>`-only indexable words per tool page: min 237 / median 295 / max 651; 143/222 SSR pages < 300 words**; 16 pages ≥ 400 words; 78 EN tool pages < 300 words in `<main>`.
    - **Accordion content never in HTML: steps 0/144, limitations 0/144, troubleshooting 0/144** (FAQ answers ARE in HTML — `accordionOpen.faq: true`).
    - Color pages: **151/151 < 400 words** (≈89 words rendered).
    - Translator pairs: prerendered `<main>` = **5 words** (H1 only; body is a lazy Suspense child) — 73 words total root text.
    - Legal/static pages prerender thin (`/privacy` = 28 root words), hydrate client-side afterward.
    - Localized pages < 500 words: 123 of 138.
13. **Recommended indexable URL set (proposal — do not apply yet):**
    - **Keep/fix:** 141 EN tools, 64 hubs/subpages, 18 compare, 6 best, 18 blog, ~20 static/home, 68 localized tools + 84 localized non-tool pages (minus es-co), 10 translator pairs (evaluate merge into hub).
    - **Exclude from sitemap:** ~173 URLs = 3 classics (`json-formatter/viewer/compare`, already in `SITEMAP_EXCLUDES` logic for sitemap but confirm), **151 color pages**, **19 es-co duplicates**, `/studios/color/*` (already unsitemapped; fix their H1s anyway), plus decide on `/creator` → **add** it (and any other orphan HTML).
    - Do **not** submit/pressure a sitemap until batches below land.
14. **Files rendering a Related Tools section besides `Layout.tsx`:** `PdfToolShell.tsx` §10 (h2, gated on `relatedTools` prop — passed by ~20 PDF tools via `pdfSecurityA/B`, `pdfOrganizeA/B`, `pdfConvertersOffice/Excel/Docs`, `pdfAnnotate`), `PdfTranslator.tsx` (own related section), `ContinueEditing.tsx` (h3, `aria-label=relatedTools` — used by image/collage/favicon/social/PDF/image post-process flows, only rendered **after** files are processed), post-download related strips in `CollageMaker`, `FaviconGenerator`, `ImageConverter`, `ImageResizer`, `ImageBlurPixelate`, `SocialResizer`; plus `prerender-entry.ts` bodyContent `tool` case (legacy duplicate path).
15. **Root cause of duplicate Related Tools:** `Layout.tsx` §6 (~line 1416) renders an "Related Tools" H2 for **every** tool view from `SEO metadata.related`, while tool bodies render their own related links (PdfToolShell §10, PdfTranslator, ContinueEditing) → **2–3 "Related Tools" blocks after hydration** (PDF tools show 2 immediately: Layout + PdfToolShell). `Layout.tsx` §6b adds a **4th** related-links block ("More `<category>` tools"). `ToolPageLayout.tsx` accepts `relatedTools`/`faq` props but **never renders them** (dead props — 9 YouTube tools pass `relatedTools={...}` into the void; harmless but confusing). Prerendered HTML shows only Layout's block (bodies are Suspense fallbacks during SSR).

---

## Phase 2 — A–F URL classification

### Tool URLs (144): A=1 · B=118 · C=22 · D=0 · E=3 · F=0

**A — strong index candidate (1):** `/tools/box-shadow-generator` (651 `<main>` words, complete FAQ/steps content).

**B — needs improvement before indexing (118):** all reason `thin rendered HTML` (<700 total words / steps+limitations+troubleshooting absent from DOM). `<main>` words in parentheses:
json-validator 465, json-minifier, json-to-csv, gradient-generator, contrast-checker, base64-tool, border-radius-generator, slug-generator, seo-meta-generator, robots-txt-generator, xml-sitemap-generator, schema-markup-generator, utm-builder, canonical-url-generator, hreflang-tag-generator, google-serp-preview, qr-code-generator, url-encoder-decoder, html-entity-encoder, youtube-thumbnail-preview, youtube-title-analyzer, youtube-timestamp-formatter, youtube-chapter-generator, youtube-embed-generator, youtube-url-toolkit, thumbnail-safe-zone, youtube-description-formatter, protect-pdf, unlock-pdf, add-pdf-watermark, flatten-pdf, merge-pdf, split-pdf, rotate-pdf, extract-pdf, rearrange-pdf, add-pdf-page-numbers, add-pdf-header-footer, crop-pdf, duplicate-page-finder-pdf, remove-blank-pages-pdf, reverse-page-order-pdf, jpg-to-pdf, pdf-to-jpg, word-to-pdf, pdf-to-word, excel-to-pdf, pdf-to-excel, powerpoint-to-pdf, pdf-to-powerpoint, html-to-pdf, pdf-to-text, text-to-pdf, pdf-to-html, pdf-translator, remove-pdf-metadata, repair-pdf, validate-pdf, optimize-pdf-web, reduce-pdf-image-quality, compress-images-inside-pdf, ocr-pdf, compare-two-pdfs, image-resizer, image-cropper, image-converter, image-watermark, image-blur-pixelate, social-resizer, favicon-generator, collage-maker, uuid-generator, password-generator, hash-generator, regex-tester, unix-timestamp-converter, cron-expression-builder, text-diff-checker, json-schema-validator, jsonpath-tester, csv-json-converter, xml-json-converter, sql-formatter, yaml-formatter, http-status-code-lookup, mime-type-lookup, url-parser, image-metadata-remover, passport-photo-maker, image-upscaler, signature-maker, csv-reconciliation, excel-formula-generator, billable-hours-calculator, pdf-difference-checker, business-pdf-extractor, invoice-follow-up-tracker, font-detector 564, linkedin-carousel-maker, color-picker, color-explorer, image-to-palette, application-file-checker, exam-photo-fixer, exam-signature-fixer, exam-thumb-fixer, declaration-fixer, pdf-exact-size, exam-selector, exam-seo, video-audio-extractor, video-compressor, video-resizer, video-trimmer, video-converter, video-to-gif, photos-to-video, video-downloader 438, add-music-to-photo 562.
(Full per-URL reason list: `node scripts/forensics-indexing.mjs` § Phase 2.)

**C — overlapping intent; consolidate/canonicalize before indexing (22):** json-beautifier, json-tree-viewer, json-compare-diff, og-meta-generator, twitter-card-generator, youtube-keyword-explorer, remove-pdf-password (alias of unlock-pdf), delete-pdf (alias of extract), extract-odd-pages-pdf, extract-even-pages-pdf, merge-selected-page-ranges (alias of merge), split-by-file-size, split-every-n-pages, webp-converter, png-jpg-converter, heic-jpg-converter, svg-converter (4 converters ↔ image-converter), jwt-decoder (alias of base64/url tools), password-strength-checker (alias of password-generator), url-parser, color-palette-generator, color-visualizer.

**D — broken/misleading/malfunctioning (0).** **F — exclude (0).**

**E — already excluded from sitemap (3):** `/tools/json-formatter`, `/tools/json-viewer`, `/tools/json-compare` (`SITEMAP_EXCLUDES` → 301 to modern successors; verify redirect targets still exist).

### Non-tool sitemap URLs (353): A=168 · B=15 · F=170

- **A (168):** 64 SEO hubs/subpages (EN+localized minus overlap), 18 blog articles + blog index, static/home/changelog/security pages, localized about/blog/hub pages — unique titles, unique content, real links in.
- **B (15):** 9 `/compare/*` pages + 6 `*/best` pages — verify usefulness/depth before indexing (compare pages rendered via static shells, content present but template-similar).
- **F (170):** **151 `/colors/*` + `/color-palettes/*` + `/ui-colors/*`** (≈89 rendered words each, programmatic, low intent) **+ 19 es-co exact duplicates of es-mx** (identical titles verified).

### Translator pairs (10, all under `/tools/pdf-translator/*`): treat as **B/merge candidates**
Prerendered `<main>` contains only the H1 (5 words); body hydrates client-side. Either SSR the pair body or fold into `/tools/pdf-translator` + hub.

---

## Phase 3 — Related Tools duplication (fix plan, one section per page only)

Canonical structure today (after hydration, typical PDF tool):
1. `Layout.tsx` §6 "Related Tools" ← **keep**
2. `PdfToolShell.tsx` §10 "Related Tools" ← **remove** (PDF tools)
3. `Layout.tsx` §6b "More `<category>` tools" ← **merge into §6 or remove** (decide: chips vs grid, one only)
4. State-gated duplicates (ContinueEditing / post-download strips) ← OK to keep **only if** they replace §6 while visible, or relabel as "Next step" to avoid a second "Related Tools" heading
5. `ToolPageLayout.tsx` dead `relatedTools`/`faq` props ← remove the props (or finally render them — but that would re-create duplication; remove)

---

## Phase 4/5 spot checks done

- **External calls vs privacy claims:** only `YoutubeKeywordExplorer` (`/api/youtube-autocomplete`), `PdfTranslator` (translate endpoint), `RatingSection` — all disclosed via `getToolExternalNotice` (`src/studioIcons.tsx`). No hidden third-party calls found.
- **Works/functionality:** prior QA reports (`FINAL-QA-REPORT-2026-08-30.md`, `TOOL-AUDIT.md`) confirm tools functional, responsive, real SSR + hydrate fixes landed. Tool-by-tool re-verification not repeated (build-level checks pass: 519 HTML, audit clean).

---

## Recommended fix batches (small, build-verified after each)

**Batch 0 — sitemap hygiene (no content changes):** add `/creator`; exclude 151 color pages; exclude 19 es-co URLs; confirm 3 classic excludes; regenerate sitemap (`node scripts/generate-sitemap.mjs`) → `npm run build` → `node scripts/audit-seo.mjs`.
**Batch 1 — accordion content to static DOM:** render How-to steps / Limitations / Troubleshooting / Privacy in the prerendered HTML (e.g. server-render collapsed content in DOM, hide with CSS) — single change in `Layout.tsx` fixes all 144 tool pages.
**Batch 2 — Related Tools de-duplication:** as Phase 3 plan; verify one `<h2>Related Tools</h2>` per tool page post-hydration.
**Batch 3 — C-group overlaps:** canonical or merge the 22 alias URLs (prefer canonical to the surviving tool; do not delete functionality).
**Batch 4 — translator pairs:** SSR pair body or consolidate; fix the 9 `/studios/color/*` duplicate H1s.
**Batch 5 — compare/best depth review** (15 B pages) before any indexing push.

**Do not:** mass-edit/regenerate pages, bulk-submit sitemap to GSC, or pad content with AI filler.

## Open items needing your input/export
1. The 2 GSC-reported 404 URLs (need GSC coverage export).
2. The 8 GSC "Redirect" URLs (need same export).
3. Sign-off on Batch 0 exclusion list (color pages + es-co) before I apply anything.
