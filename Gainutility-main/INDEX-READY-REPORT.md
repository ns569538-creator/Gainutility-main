# INDEX-READY Report — Phases A–M (read-only; awaiting sign-off)

Date: 2026-09-22 · Data: `public/sitemap.xml` (504 URLs), `dist/client` (519 HTML), GSC export summary (480 Discovered-not-indexed, 4 Crawled-not-indexed, ~24 Indexed, 8 Redirects, 2 × 404, 1 Alternate-canonical).
Scripts (all read-only against the existing build): `scripts/index-audit.mjs` → `INDEX-READY.csv` (519 rows, 15 columns incl. **Unique content score** + **Duplicate risk**), `scripts/diff-audit.mjs`, `scripts/.es-co-diff.mjs`, `scripts/forensics2.mjs`, `scripts/inspect-page.mjs`, `scripts/audit-seo.mjs`.
**No site, sitemap, redirect, or content changes have been made. Nothing is submitted to GSC. Awaiting approval before Batch 0+.**

---

## Executive summary

Google's ~24/480 verdict is a **value verdict, not a technical block** (Phase L: 0 canonical/noindex/missing-HTML problems). Three dilution sources explain it: (1) 194 tool pages ship their best content (steps/limits/troubleshooting) in **closed accordions that never enter prerendered HTML** — median `<main>` is only 295 words; (2) the sitemap pads with **151 thin color pages** (median 89 words) and **20 es-co pages that are near-byte-identical duplicates of es-mx**; (3) **5 alias tool URLs duplicate existing components**. Fix the pages and the sitemap first; request indexing gradually afterwards — never mass-submit.

**Proposed indexable inventory: 329 URLs** = A (90, index now) + B (239, index after the improvements below). Current sitemap 504 → 329: remove 176 C-in-sitemap (151 color + 20 es-co + 5 alias), add `/creator`.

---

## Phase A — Classification & canonical inventory

519 rows = 504 sitemap + `/creator` + 10 `/studios/color/*` + 3 json classics + `/404`.

| Class | Count | Meaning | Decision |
|---|---|---|---|
| **A** | 90 | Strong index candidate as-is | INDEX, keep in sitemap |
| **B** | 239 | Real page, must improve first | INDEX AFTER IMPROVEMENT |
| **C** | 189 | Duplicate/overlap/thin-programmatic | EXCLUDE/CONSOLIDATE |
| **D** | 1 | `/404` error shell | NOINDEX/EXCLUDE (already) |

**C inventory:** 151 color pages + 20 es-co (19 subpaths + root) + 5 alias tools (webp/png-jpg/heic/svg-converter, merge-selected-page-ranges) + 10 studio sections (not in sitemap) + 3 json classics (already 301 via `SITEMAP_EXCLUDES`).
**B breakdown:** 194 tool pages · 19 EN hub/SEO subpages · 10 translator pairs · 9 compare · 6 best · 1 `/creator`.
**Sitemap math:** 504 − 176 C-in-sitemap + 1 (`/creator`, renders fine, 479 words) = **329**.
**es-CO hreflang:** pages stay live; recommendation is drop the 20 URLs from the sitemap now, and remove the `es-CO` hreflang annotation unless/until that locale gets genuinely localized content (it currently only differs from es-MX by locale-path self-links, og:locale, one heading's casing, and a few meta-description words — verified pair-by-pair). Alternative (your call): true localization later, or 301 es-co → es-mx.

## Phase B — Tool page quality

- EN tool `<main>`: n=141 · min 237 · median 295 · max 651 · **78 < 300 words** · 14 ≥ 400.
- **0/144 tool pages contain steps, limitations, or troubleshooting in prerendered HTML** — all behind `accordionOpen` defaults (faq is the only open accordion). 249/519 pages have **no `<main>` at all** in prerender (static shells hydrate client-side: `/tools`, `/privacy`, `/cookies`, `/site-audit`, all color pages…).
- Root fix is one change: render accordion bodies into the DOM (CSS-collapsed) in `Layout.tsx`/`PdfToolShell` → instantly fixes all 144 tool pages (**Batch 1**).

## Phase C — Unique intent

- **Duplicate risk (5-gram Jaccard vs nearest neighbor): High 55 · Medium 130 · Low 334.** High is dominated by the 20 es-co↔es-mx pairs, thin color twins (`/colors/fuchsia~magenta` 18% unique, `blue-steel~steel-blue` 23%), and translator-pair shells (33% unique — tiny H1-only mains).
- EN tool pages themselves are **not** near-duplicates of each other (typically 70–95% unique) — the problem is template thinness (Phase B), not cross-tool duplication.
- Hub subpages (19 EN, e.g. `/json/formatter` vs `/tools/json-beautifier`): keep as navigational/SEO landings, but their B action is to differentiate body copy from the tool page.

## Phase D — How-to content

124 `steps:` arrays and 32 `faq:` arrays exist in source; **0 render into prerendered HTML** (closed accordions). FAQ answers DO render (`accordionOpen.faq: true`). Batch 1 surfaces steps/limitations/troubleshooting without writing new content.

## Phase E — FAQ quality

632 rendered questions across 141 EN tool pages, **631 unique** — only one repeat ("What image formats are supported?" 2×) and 64 distinct privacy-question phrasings. FAQs are genuinely per-tool, not templated. Google removed FAQ rich-result docs → keep FAQ as a user aid; **do not chase FAQPage schema as a ranking lever**, and do not mass-produce more FAQs.

## Phase F — Related Tools architecture

Render sites: `Layout.tsx` §6 h2 (~line 1416, every tool view, from SEO metadata.related — **keep as the one canonical block**) · `Layout.tsx` §6b "More `<category>` tools" (~1456, siblingTools) · `PdfToolShell.tsx` §10 (~348, ~20 PDF tools via pdfSecurityA/B, pdfOrganizeA/B, pdfConverters*, pdfAnnotate) · `PdfTranslator.tsx` own section · `ContinueEditing.tsx` h3 (post-process, state-gated — OK if relabeled "Next step") · `ToolPageLayout.tsx` **dead `relatedTools`/`faq` props** (9 YouTube tools pass them into the void) · `prerender-entry.ts` legacy tool case.
Post-hydration PDF tools show **2× "Related Tools" + a 3rd "More PDF tools" block**. **Batch 2:** keep Layout §6 only; remove PdfToolShell §10 + §6b (or merge into §6); delete ToolPageLayout dead props; relabel ContinueEditing.

## Phase G — Color pages

151 sitemap URLs, 56–95 rendered words (median 89), **151/151 distinct openings** — unique hex data behind a thin uniform template; pairs like fuchsia/magenta are 82% shared. Verdict: **exclude from sitemap, keep live** (no redirects — they serve the Color Studio UX and internal linking).

## Phase H — Language duplication (es-co)

20 es-co sitemap URLs (19 subpaths + root). Pair-diff (`scripts/.es-co-diff.mjs`): bodies effectively identical to es-mx — residual full-HTML diffs are only nav self-locale links (`/es-co?cat=` vs `/es-mx?cat=`), og:locale/canonical/hreflang, one heading casing (`frecuentes`/`Frecuentes`), and a few meta-description words. Localized slugs differ only for `combinar-pdf ↔ unir-pdf`. Verdict: **C — remove all 20 from sitemap**; hreflang per Phase A.

## Phase I — Tool aliases (15 groups, 4-question verdict)

**Consolidate (C, 5):**
| URL | Verdict |
|---|---|
| webp/png-jpg/heic/svg-converter | Same `<ImageConverter>` component, **no format-preset prop** → identical experience. Decide: 301 into `/tools/image-converter` **or** add a preset prop and keep as B. |
| merge-selected-page-ranges | Page-range sub-feature of `/tools/merge-pdf` → 301. |

**Keep — distinct tools (B, 13 members across 10 groups), differentiate intent in copy:** split-by-file-size / split-every-n / extract-odd / extract-even (own algorithms) · delete-pdf (inverse of extract-pdf) · **remove-pdf-password** (verified in `pdfSecurityA.tsx`: requires the *known* password for open-password files, while unlock-pdf decrypts with an *empty* password for owner-restrictions-only files — complementary flows, not duplicates) · og-meta + twitter-card vs seo-meta (distinct outputs) · color-visualizer vs contrast-checker · color-palette-generator vs gradient-generator · youtube-keyword-explorer vs title-analyzer · url-parser vs slug-generator · password-strength vs password-generator · jwt-decoder vs hash-generator.
**Already correct:** json-formatter/viewer/compare are classics 301 → json-beautifier / json-tree-viewer / json-compare-diff (modern successors = canonical B).

## Phase J — Internal linking

Hubs link their tools: `/pdf` 7 · `/json` 6 · `/image` 8 · `/dev` 6 · `/css` 4 · `/seo` 6. Home: 62 internal hrefs (13 to tools). `/tools/merge-pdf`: 37 distinct internal hrefs (mostly hreflang). Hierarchy is sound; no orphaned tool pages found. Optional after Batch 2: §6 grid remains the single related-links spine.

## Phase K — Content quality

- **4 overclaim hits** to reword: `/tools/base64-tool` "100% secure" · `/tools/image-blur-pixelate` "100% private" · `/tools/image-metadata-remover` "100% private" · `/tools/font-detector` "guaranteed". Placeholder text: **0**.
- **New finding:** `UnlockPdf` desc ("Remove a document-open password") and its FAQ ("This one handles files that demand a password just to open… owner restrictions are removed by the other tool") **state the opposite of the code** — empty-password decrypt can't open user-password files (its own error message says so) and its related-tools label calls remove-pdf-password "Remove Owner Restrictions". Fix desc/FAQ/labels so the two tools' intents read distinctly.

## Phase L — Technical SEO (all 504 sitemap URLs)

missingHtml 0 · noCanonical 0 · wrongCanonical 1 (`/` → `https://gainutility.com` without trailing slash — false positive of the non-slash strategy) · noindex 0 · noTitle 0 · noDesc 0 · noH1 0 · noOg 0 · multiH1 0 · robots.txt OK (`User-agent: *` + Sitemap line). Only outstanding: 9 duplicate H1s inside `/studios/color/*` ("Color Studio") — fix in Batch 4.

## Phase M — Indexing strategy & INDEX-READY definition

**Batch sequence (each build-verified; destructive steps only after your sign-off):**
- **Batch 0 — sitemap hygiene:** add `/creator`; exclude 151 color + 20 es-co; confirm 3 classic excludes; regenerate → build → `audit-seo.mjs`.
- **Batch 1 — accordion content into DOM** (single Layout/PdfToolShell change; unlocks 194 B tool pages).
- **Batch 2 — Related Tools de-dup** (Phase F plan; verify exactly 1 `<h2>Related Tools</h2>` post-hydration).
- **Batch 3 — converter family decision** (preset-prop keep vs 301 consolidate) + 301 merge-selected-page-ranges → merge-pdf.
- **Batch 4 — translator-pair SSR or fold into hub; studio H1s; es-CO hreflang decision.**
- **Batch 5 — human depth pass:** 9 compare + 6 best + 19 hub subpages + the 4 overclaims + UnlockPdf copy fix.
- **Then** regenerate `INDEX-READY.csv`, and only after B pages land their improvements: re-submit the sitemap **once** in GSC and let Google recrawl naturally. No URL-inspection spam, no per-URL force-indexing.

**INDEX-READY = a page that is:** in the final canonical inventory · self-canonical · ≥1 useful intent (not a duplicate) · has its steps/limits/FAQ in the served HTML · exactly one Related Tools block · no overclaims · linked from its hub. All 15 columns in `INDEX-READY.csv` map to that checklist; "Final index decision" is the sign-off column.

**Open items needing you:**
1. Sign-off on Batch 0 exclusion list (151 color + 20 es-co; add `/creator`).
2. Converter family: **301 consolidate** or **add format preset and keep**?
3. es-CO: drop from sitemap only (recommended now), later true localization, or 301 to es-mx?
4. merge-selected-page-ranges → 301 into merge-pdf (recommended) — confirm.
5. GSC export of the 2 × 404 and 8 Redirect URLs (not derivable from the build).
