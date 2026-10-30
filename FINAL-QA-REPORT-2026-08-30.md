# GainUtility — Full Runtime QA Report (Browser-Based)

**Date:** 2026-08-30
**Method:** Real headless Chrome (Playwright) against the Vite dev server plus a production `vite preview` pass. Supersedes `FINAL-QA-REPORT-2026-08-29.md`, which was static/code inspection only.

---

## A. Coverage & Scope

- Route matrix: **251 routes** (250 sitemap URIs + color-studio subsection URLs from internal navigation, de-duplicated), each loaded headlessly at **3 viewports** (1280px desktop, 768px tablet, 375px mobile) → **753 page loads**.
- Interaction E2E on a representative sample of tool types (sample below).
- Production build: `npm run lint` → `npm run build` (sitemap + vite + prerender) → 31-route smoke against `vite preview`.
- Harness in `C:\Users\nav\AppData\Local\Temp\opencode` (playwright-core + system Chrome); scripts: `qa-run3.js`, `overflow-focus.js`, `overflow-tablet.js`, `target-verify.js`, `interact-e2e.js`, `exam-e2e.js`, `counts-audit2.js`, `names-audit.js`, `prerender-audit.js`, `preview-smoke.js`, `polish-verify.js`, `studio-smoke.js`.

## B. Route Coverage Result

- **0 real crash boundaries** across all 251 routes. (Three "ERROR BOUNDARY" flags in the first scan were false positives — the 404 page's "Back to home" text matched a broad regex.)
- All 140 registry tools, 11 studios, studio sections, SEO hubs, color pages, compare pages, best-pages, and static pages render content.
- Unknown URLs (`/404`, `/definitely-not-a-route`, `/seo/meta-tag-generator`) correctly render the NotFound page (production and dev identical).

## C. Issues Found & Root Cause (all fixed)

| Route | Symptom | Root cause | Fix |
|---|---|---|---|
| `/seo` | **Blank screen** | `SEO_PAGE_MAP["seo"]` missing → `App.tsx` returned `null` | Added full SEO hub entry (`slug: "seo"`, `path: "/seo"`) + `seoRelated()` helper in `src/seo/seoPageContent.ts` |
| `/image/resize` | NotFound page | sub-slug fallback matched `resize` ≠ slug `resize-image` | Router now resolves `SEO_PAGE_MAP[path]` first |
| `/dev/password` | NotFound page | sub-slug `password` ≠ slug `password-generator` | Same |
| `/image/compress` | **Wrong page** (rendered PDF compressor) | slug collision: `compress` resolved to the PDF tool | Same |
| Home SVG | `rx="0 0 4 4"` malformed | — | `rx="4"` (`src/components/HomePage.tsx`) |
| FontDetector / ColorStudioHome / UiColorsSection / ColorPages | `<button>` nested inside `<button>` → invalid HTML, possible a11y issues | — | Outer card → `div[role=button]` + keyboard handler; `scan-nested.js` now reports 0 |
| Exam file names | Custom mode saved as `photo-photo.jpg` | `customPreset()` had no `slug` | Default slug `"custom"` (+ `-thumb`, `-signature`) in the three exam fixers |

**Blank-screen causes (summary):** one real (missing hub map entry) plus zero runtime errors anywhere. All other routes hydrate fully.

## D. Tools Tested Interactively (representative sample)

- Base64 encode/decode, copy — OK
- QR Code generator: canvas render + **Download PNG** works — OK
- Password generator: crypto `getRandomValues` rejection sampling, entropy meter (Weak→Excellent), length/charset range controls, copy icon-button (`title` attr, no text label — probe miss, not a bug) — OK
- UUID generator: generate + copy-to-clipboard + download-txt icon buttons — OK
- JSON formatter/validator: paste/format/minify + invalid-input toast — OK
- CSV reconciliation: paste-based (not file upload) flow — correct by design
- Font detector: renders all 15 catalog font name chips; non-matching sample → "no exact match" path — OK; Google Fonts unavailability degrades gracefully
- YouTube title analyzer: fills scoring output — OK
- Color contrast calculator: WCAG ratio labels present — OK
- Exam photo fixer E2E (see E) — OK

Console errors across all tests: only `ERR_NAME_NOT_RESOLVED` for `fonts.googleapis.com` (blocked in this environment) → graceful fallback ("Font render files still loading." + bundled index), **non-issue**.

**Download & post-download flow** (PDF/image/exam paths): Download CTA present on every tested tool; Post-download panel copy `"Done! 🎉"` / "Your file is ready." is correct and gated **once per session** (sessionStorage lock), as designed.

## E. Data Correctness & Validation

- Counts audit: `src/toolsRegistry.tsx` = `src/types.ts` `ToolId` = `src/router.ts` `TOOL_IDS` = **140**, zero diffs; search index derives from registry so tool count can never drift.
- Studio assignments: pdf 45, json 9, css 3, color 7, developer 30, image 17, seo 11, security 6, creator 11, converter 6, exam 8 (153 assignments / 140 unique — 13 intentional cross-listings); no orphan IDs anywhere.
- Naming audit: no duplicate tool names; UI labels are "Resizer", not "Fixer"; Passport Photo Maker distinct from passport photo tools.
- Exam engine: `imageEngine.ts` uses a real binary-search quality loop on JPEG; E2E custom preset (20–50 KB, 200×230): uploaded 79.3 KB JPEG → output **12 KB, 200×230, JPEG, "READY TO UPLOAD"**, with the min-size shortfall **honestly flagged** (not silently claimed). PNG lossless case can't always hit an exact KB target and reports the residual difference. `validate.ts` and `requirements.ts` presets are solid.

## F. Responsive / Layout

- 251 routes at 375px and 768px with a precise overflow classifier (flags only elements whose overflow is *not* inside a scrollable ancestor) → **0 genuine issues**.
- Every earlier overflow flag was inside an intended `overflow-x-auto` container (tab rows, tables) or a fixed-position/icon false positive.

## G. SEO & Metadata

- Prerender audit over all **354 generated HTML files**: every file has `<title>` and canonical; **0 "Page Not Found" titles on real pages**; correct titles on all fixed routes:
  - `/seo` → "Free Online SEO Tools — Meta Tags, Schema, Sitemaps & more | GainUtility"
  - `/image/resize` → Image Resizer; `/image/compress` → Image Compressor; `/dev/password` → Password Generator
- Sitemap regenerated: **250 URLs**, includes `/seo`, `/image/resize`, `/dev/password`; no placeholder/`undefined` URLs; one cosmetic duplicate `<loc>` for `/studios/color` (tolerated by crawlers; flagged as minor nit).
- Static info pages (`/about`, `/privacy`, …) prerender thin (~22–37 words) because content hydrates client-side after layout/chunks — expected SPA prerender behavior, not a defect.

## H. Performance / Bundle

- `vite build` success in 1m15s; code-split per tool (lazy). Largest chunk `PDFButton` 633 KB (264 KB gzip) and `shared` 397 KB — advisory only (Vite 500 KB warning), no functional impact.

## I. Verification Steps

1. `npm run lint` (tsc --noEmit) — **0 errors**.
2. `npm run build` — sitemap (250 URLs) + vite build + prerender (361 HTML files) — success.
3. Production smoke on `vite preview`: 31 routes (hubs, tools, studios, compare, best, static, 404) — **31/31 OK**; unknown routes 404 correctly, known routes hydrate with content.
4. Dev-server matrix (251×3) + interaction E2E — all green.

## J. External Dependencies

- `fonts.googleapis.com` unreachable in this sandbox → verified graceful degradation only.
- OCR (Tesseract) and pdf.js flows are isolated external loads; OCR isn't exercised in headless prod smoke.

## K. Files Changed / Validated

- `src/router.ts` — path-first SEO resolution (`SEO_PAGE_MAP[path]` → sub-slug fallback)
- `src/seo/seoPageContent.ts` — added `/seo` hub entry + `seoRelated()`
- `src/components/HomePage.tsx` — SVG `rx` fix
- `src/components/FontDetector.tsx`, `src/components/ColorStudioHome.tsx`, `src/components/UiColorsSection.tsx`, `src/components/ColorPages.tsx` — de-nested buttons
- `src/components/exams/ExamPhotoFixer.tsx`, `ThumbImpressionFixer.tsx`, `SignatureFixer.tsx` — default custom filename slug
- No architectural changes; registry remains the single source of truth.

## L. Residual Notes (not defects)

- One tolerated sitemap duplicate (`/studios/color`).
- Chunk-size advisory on 2 bundles (code-split boundaries can be tuned later if desired).
- External font network blocked in sandbox (graceful fallback verified).

## M. Polish Pass — Honest Trust Copy, Brand-Accent Navigation, Badge Restriction, Star-Rating Feedback (follow-up)

**Goal:** fix overstated product claims and unify chrome styling already implemented in the codebase; no new features, no redesign of tool workspaces.

### M1. Trust / privacy copy — now per-tool truth (claim audit)

`/tools/pdf-translator` is the one tool whose flow leaves the browser (PDF read with pdf.js + OCR locally; extracted text sent to `translate.googleapis.com`). Platform-wide blanket claims were rewritten; the PDF translator already disclosed its external call in SEO/FAQ/privacy data and still does.

| Surface | Before | After |
|---|---|---|
| Home hero H1 | "Small tools. **Zero uploads.** No nonsense." | "Small tools. **No account needed.** No nonsense." |
| Home trust strip | "Nothing leaves your browser" + pills "Runs locally / Zero uploads / Browser-based" | "Files stay on your device" + pills "Runs in your browser / No sign-up / No installs" |
| Trust popover | "Your files are processed in your browser. They don't need to be uploaded to a server." | "…never stored on our servers. A few tools call external services — e.g., PDF Translator sends just the extracted text to a translation service — and each tool page states exactly what happens to your data." |
| Tool-header trust pill (`hidden lg:flex`) | "Processed locally in your browser" (blanket, wrong for PDF Translator) | `getToolTrust(toolId)` e.g. PDF Translator → "Text sent to a translation service", JSON Validator → "Validated in your browser" |
| Privacy accordion fallback (only when a tool has no `privacyExplanation`) | "…No files or keystrokes are transmitted to any server." | "…This tool does not send your files to GainUtility's servers; any external processing is disclosed in the tool itself." (per-tool overrides still win; pdf-translator shows its honest third-parity explanation) |
| Footer Zone A | "Your files and inputs don't need to leave your device." | "Every tool runs inside your browser, and nothing you process is stored on GainUtility servers. Tools that call an external service — like PDF Translator — say so on their page." |
| Footer Zone C | "100% Client-Side / No Data Collection / Zero Server Calls" | "Runs in your browser / No account needed / External calls disclosed" |
| PostTaskSuccess share card | "🔒 100% In-Browser Private Canvas • Zero Server Uploads" | "🔒 Made in Your Browser • No Account Needed" |
| PostTaskSuccess modal notice | "Processed privately in your browser" | "No account needed • nothing stored by us" |
| PostTaskSuccess subtexts | "…processed completely in your browser." | "Quick, clean, and no account required." |

### M2. Category navigation — single brand accent (was per-category rainbow)

`getStudioStyles` in `Layout.tsx` (shared by the header Categories dropdown and mobile drawer) now returns one `--brand-primary` accent for every category; per-category icons (`Braces`, `Palette`, `Terminal`, etc.) are preserved as identifiers.

Verified at 1280 / 390 px: header dropdown tiles 6/6 and drawer tiles 6/6 are all `brand-primary` (icon `rgb(79,111,47)`, tinted translucent tile), zero pastel tiles.

### M3. Tool card badges — only real, substantiated statuses

New `isStatusBadge()` in `studioIcons.tsx` (true iff `NEW`, `BETA`, or `COMING SOON`). Applied to:
- `ToolCard.tsx` (Browse directory)
- `StudioPage.tsx` featured + grid cards

Marketing/popularity labels — `POPULAR`, `ESSENTIAL`, `FEATURED`, `FLAGSHIP`, `HIGHLY OPTIMIZED`, `SECURITY`, `LOCAL`, `SEO`, `CREATOR`, `PRODUCTIVITY`, etc. — are no longer rendered anywhere; `NEW`/`BETA`/`COMING SOON` still render on cards that genuinely carry those statuses (~26 of 140 tools).

### M4. Feedback module — compact 5-star rating after "Yes, helpful"

Required flow implemented in `Layout.tsx`: "Yes, helpful" → 5-star prompt ("How helpful was it?") → pick 1–5 → "Thank you for voting!" chip + toast. "Has issues" → "Thank you for the feedback!" + keeps the report input (unchanged). Star buttons are `aria-label`d and focus-ring accessible.

### M5. Lazy-failure UX / a11y

- `ErrorBoundary` already wraps lazy tool chunks (`resetKey={viewToPath(view)}`, Reload + Back to Home actions); label tightened "tool workspace" → "tool".
- Focus visibility already present via `.gu-focus` (2px brand outline) and `.gu-utility-card:focus-visible` (2px solid); measured computed outline `solid 2px` on focused browse cards. Reduced-motion block already in `index.css`.

### M6. Polish-pass verification results

- `npm run lint` (tsc --noEmit) — **0 errors**.
- `npm run build` — sitemap (141 tools) + vite build (43.9s) + prerender (**372 HTML files**) — success.
- `polish-verify.js` at 1280/768/390 px: hero, trust strip, popover, card pill restriction, focus ring, category dropdown accent, pdf-translator + json-validator header trust pills, privacy accordion content, footer zones, feedback flow, console/page errors → **48/54 line checks pass**, and the 6 misses were confirmed harness artifacts (over-broad selectors / `lg:` gating / body-text timing), each re-verified directly:
  - Header dropdown + drawer tiles: **single brand accent, 0 pastel** (computed-style dump).
  - Star flow: prompt shown, 5 star buttons, thank-you chip after rating (module-scoped re-verify).
  - JSON Validator trust pill `"Validated in your browser"` (badge was custom, not the generic fallback).
- `studio-smoke.js`: `/studios/{pdf,json,css,creator}` × 3 viewports → **12/12 pass**, 0 bad pills, 0 console errors.
- Editor note: `PostTaskSuccess` share-card/modal strings verified by source change (panel requires a completed task + session lock; not force-triggered headlessly).