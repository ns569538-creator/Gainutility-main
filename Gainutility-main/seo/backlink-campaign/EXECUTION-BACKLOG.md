# GainUtility — Execution Backlog (Backlink Campaign)

**Status: PLANNING DOCUMENT — no production site code has been modified.**
Cross-reference date: 2026-10-01. Sources: `backlink-prospects.csv` (78 rows), `TOP-20-TARGETS.md`, `LINKABLE-ASSETS.md`, `OUTREACH-TEMPLATES.md`, `CAMPAIGN-PLAN.md` — all cross-checked against the live codebase (routes, sitemap, i18n, internal-link implementation).

**Principle:** GainUtility's authority is built by publishing genuinely useful resources and earning relevant mentions. This backlog does not manufacture backlinks. No entry claims a link will be obtained. No DR, traffic, contact, publication relationship, or conversion figure is fabricated — DR/Traffic stays `n/a — verify in Ahrefs` until real data is exported. No paid or bulk link packages. No generic SEO pages created purely to attract links.

**Field definitions (used on every action below):**
- **Priority:** P0 = blocks the campaign or unblocks the most targets · P1 = high-value, week 2–3 · P2 = opportunistic/long-cycle.
- **Status:** `READY` (nothing blocks it) · `CONTENT REQUIRED` (site content must be written first) · `SITE CHANGE REQUIRED` (code/config change first) · `OWNER ACTION REQUIRED` (only the site owner can perform it) · `NEEDS VERIFICATION` (must be re-checked live before acting).
- **Purpose:** `backlink acquisition` · `organic traffic` · `topical authority` · `internal authority flow` · `referral traffic` · `international growth`.

---

## §0 Cross-reference findings (the five deliverables vs. the live site)

| # | Finding | Evidence | Correction applied here |
|---|---------|----------|--------------------------|
| 1 | `/tools/compress-pdf` does not exist — it is a 301 redirect to `/tools/compress-images-inside-pdf` | Router `TOOL_IDS`; `generate-sitemap.mjs` `removedToolRedirects`; the `/pdf/compress` hub exists | Every compression target uses `/pdf/compress` (hub) or `/tools/compress-images-inside-pdf`. Matches CSV row 23 and TOP-20 #10, which already flagged it. |
| 2 | Brief paths `/guides/pdf-compression` and `/guides/pdf-file-size` do not match the site | Site uses the `/blog/` prefix for all 21 articles | Mapped to `/blog/how-to-compress-a-pdf` (exists) and `/blog/pdf-file-size-limits` (proposed, new). |
| 3 | Three pitch-critical assets do not exist | Not in `src/blog/blogData.ts`, not in sitemap, no prerendered HTML: `/blog/pdf-file-size-limits`, `/blog/are-online-pdf-tools-safe`, any PDF↔Word blog guide | Marked `CONTENT REQUIRED` (A-02, A-04, A-05). `CAMPAIGN-PLAN.md` §1 rule: never promise a non-existent asset in an email. |
| 4 | Tool pages do not link to guides. No tool page links any `/blog/` article; the PDF hub family has no guide-link blocks (only CSS/DEV hub entries have them) | Codebase grep: `/blog/` appears only in blogData, i18n articles, seoPageContent, shared, router | Internal-link build B-01/B-02 is P0. `LINKABLE-ASSETS.md` §9: a pitch target that isn't internally linked converts its new backlink poorly. |
| 5 | HowTo schema is implemented nowhere (FAQ/Breadcrumb/WebSite/BlogPosting exist) | Zero `HowTo`/`HowToStep` matches in `src/` | Optional B-06 — only where steps are genuinely sequential. |
| 6 | `/pdf-compression-benchmark` is not a routable path family | Router has no generic root-page family | A-07 also needs a route (SITE CHANGE) in addition to content. |
| 7 | `es-co` is live but `noindex`, sitemap-excluded, hreflang-excluded | `src/i18n/index.ts` hreflang builder; prerendered `es-co/about.html` robots tag | Never pitch an `es-co` URL. Spanish-market pitches use `es-mx`. |
| 8 | TOP-20 #4 and #5 evidence quotes were not retained ("re-pull before outreach") | CSV rows 9 and 8 Notes | E-04, E-05 marked `NEEDS VERIFICATION`. |
| 9 | `OUTREACH-TEMPLATES.md` row citations drift from current CSV ordering — Template 2 cites CSV row 15 (linuxlinks: monitor-only, D); Template 3 cites "rows 6–10, 11" (row 6 is MakeUseOf editorial, not a libguide) | Line-by-line mapping | Map templates by situation and TOP-20 number, never by CSV row number. Tracked in G-02. |
| 10 | `LINKABLE-ASSETS.md` §4 cites "Quora #63" as a privacy-guide target, but CSV row 63 is the file-size question | CSV row 63 = "resize a PDF to a specific file size" | Privacy guide (A-04) targets rows 55, 59, 61, 62, 65; file-size guide (A-02) targets row 63. |
| 11 | CSV data quality: row 78 (fynepdf) has shifted columns; row 60 note truncated mid-sentence ("If locked") | Direct read of CSV | Fix in G-02 before using those rows. |
| 12 | DR/Traffic = `n/a — verify in Ahrefs` for all 78 rows; several rows are RESEARCHED or NOT YET VERIFIED (pdf.net, pdnob, trulyfreetools, toolisthub, fynepdf, Capterra, SourceForge) | CSV columns 3–4 and Status column | G-01 (Ahrefs import) and G-07 (re-verify) before those rows are used. |
| 13 | Regional B-group contacts absent or unverified (CNN Indonesia: no editorial contact; IONOS: imprint only; Softlookup: no visible contact) | CSV Notes | D-09 `NEEDS VERIFICATION` — find real editorial channels before any send. |

---

## §1 PHASE 1 — Linkable assets

Each asset carries the build-spec fields required by the brief (URL, intent, topics, audience, structure, supporting links, external prospects, differentiation) plus the ten backlog fields.

### A-01 — PDF Tools Hub upgrade

- **Action:** Upgrade `/pdf` into the citable directory: group all 44 PDF tools by job (Organize / Convert / Compress / Secure / Edit), each with a one-line "when to use this"; add a comparison strip on three verifiable axes only (*account required?*, *file uploaded to a server?*, *free-tier limits*); add a schema-marked FAQ block.
- **Why it matters:** Four Top-20 targets (#3, #4, #5, #8) point at `/pdf`. One URL that answers "which tool, and does it need an account" is what editors and librarians actually paste into a list.
- **Source evidence:** `LINKABLE-ASSETS.md` §1; CSV rows 14, 9, 8, 16 — competitor presence quoted live 2026-10-01.
- **GainUtility page/URL:** `https://gainutility.com/pdf` (exists; localized hubs exist at `/pt-br/pdf`, `/id/pdf`, `/es-mx/pdf`, `/de/pdf`, `/fr/pdf`, `/it/pdf`).
- **Asset/content required:** tool descriptions, FAQ copy, verified free-tier limit data (C-01). No quality/traffic/DR claims — three verifiable axes only.
- **Internal links required:** B-01 (tools → guides), B-02 (hub → guides), breadcrumb back to hub.
- **Target backlink opportunities:** TOP-20 #3 Techshali, #4 The Business Dive, #5 OutrightCRM, #8 URV, #16 Kumparan; CSV rows 11 (AddictiveTips), 20 (TechSupportAlert, targets `/tools`), 21 (student-tools hub — vet site quality first), 75–77 (rival-vendor pages, pending G-07).
- **Priority:** P0
- **Status:** SITE CHANGE REQUIRED
- **Expected purpose:** backlink acquisition, internal authority flow, organic traffic

**Asset spec — A-01**
- **Exact URL:** `https://gainutility.com/pdf`
- **Search intent:** informational/transactional — "free pdf tools", "pdf tools without sign up", "alternative to Smallpdf without an account"
- **Primary topic:** a free, no-account suite of browser-based PDF tools
- **Secondary topics:** merge, compress, OCR, convert, split, metadata/privacy, per-tool when-to-use guidance
- **Target audience:** students and librarians curating free tool lists; office users who cannot upload client documents; privacy-conscious users
- **Recommended page structure:** short intro → tools grouped by job with one-line use cases → comparison strip (account/upload/free limits) → FAQ (schema) → links to the how-to guides
- **Supporting tools to link:** `/tools/merge-pdf`, `/tools/split-pdf`, `/tools/compress-images-inside-pdf`, `/tools/pdf-to-word`, `/tools/jpg-to-pdf`, `/tools/ocr-pdf`, `/tools/remove-pdf-metadata`
- **Supporting guides:** `/blog/how-to-compress-a-pdf`, `/blog/how-to-merge-pdf-files`, `/blog/how-to-split-a-pdf`, plus A-02 and A-04 when published
- **External sites that could legitimately reference it:** TOP-20 #3, #4, #5, #8, #16; CSV rows 11 (AddictiveTips), 13 (Softlookup — find contact first), 20 (TechSupportAlert), 21 (student hub — vet first), 75–77 (verified first)
- **What makes it genuinely better:** it is a directory that states its own limits plainly — account requirement, upload behavior, free-tier caps — on one stable URL. Competitor hubs sell; this one answers.

### A-02 — File Size Guide (new)

- **Action:** Publish a neutral reference: "how big can my PDF be for X" — a sourced limits table (Moodle/Canvas, email attachments, government portals, job boards, WhatsApp) plus a tier chart (what 100 KB / 500 KB / 2 MB / 10 MB actually looks like, derived from our own test runs), each tier linking to `/pdf/compress`.
- **Why it matters:** Every institutional prospect teaches compression in the context of upload limits; no competitor owns a neutral limit reference (`CAMPAIGN-PLAN.md` content gaps #1). Unblocks the strongest angles for Penn State, ASU, TechRadar, r/pdf and Quora.
- **Source evidence:** `LINKABLE-ASSETS.md` §2; CSV rows 23, 26, 1, 56, 57, 63 — quotes live 2026-10-01.
- **GainUtility page/URL:** `https://gainutility.com/blog/pdf-file-size-limits` (proposed — does not exist yet; slug must be added to `src/blog/blogData.ts` and regenerated into the sitemap).
- **Asset/content required:** full article; every published limit carries a source link or is marked "verify before publishing"; tier chart from our own tests, not vendor claims.
- **Internal links required:** hub `/pdf`, `/pdf/compress`, `/tools/pdf-exact-size`, `/tools/split-pdf`, `/blog/fix-pdf-too-big-to-upload`, `/blog/how-to-compress-a-pdf`; linked from the hub at launch (B-05).
- **Target backlink opportunities:** TOP-20 #7 Penn State, #10 ASU Print Lab, #1 TechRadar (free-tier-limits angle); CSV row 63 (Quora), rows 56/57 (r/pdf size threads), rows 66/67 (Super User size questions).
- **Priority:** P0
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, organic traffic, topical authority

**Asset spec — A-02**
- **Exact URL:** `https://gainutility.com/blog/pdf-file-size-limits`
- **Search intent:** informational — "pdf file size limit", "how big can a pdf be for email", "moodle pdf upload limit"
- **Primary topic:** PDF file size limits by destination
- **Secondary topics:** what makes PDFs large (scans vs text), compression tiers, splitting vs compressing, target-size compression
- **Target audience:** students submitting to LMS portals, job applicants hitting portal caps, government-portal applicants, office admins
- **Recommended page structure:** intro → limits table (sourced) → tier chart (our test data) → "how to get under the limit" ranked by effort → tool CTA → FAQ
- **Supporting tools to link:** `/pdf/compress`, `/tools/pdf-exact-size`, `/tools/compress-images-inside-pdf`, `/tools/split-pdf`
- **Supporting guides:** `/blog/how-to-compress-a-pdf`, `/blog/fix-pdf-too-big-to-upload`
- **External sites that could legitimately reference it:** TOP-20 #7, #10, #1; CSV rows 56, 57, 63, 66, 67
- **What makes it genuinely better:** neutral and sourced. Every existing answer sells a compressor or cites one; this states the number, the source, and what it takes to get under it — and links the tool only after the answer.

### A-03 — Compression Guide upgrade (existing)

- **Action:** Add a "compression levels explained" section — what is actually discarded at each level (image downsampling vs font subsetting vs object-stream dedup), with before/after examples produced by our own tool.
- **Why it matters:** This guide is the primary destination for seven prospects across five languages. Depth is what makes it citable rather than interchangeable with the dozens of shallow how-tos already out there.
- **Source evidence:** `LINKABLE-ASSETS.md` §3; TOP-20 #7, #10, #14, #15, #17, #18; CSV rows 23, 26, 31, 34, 37, 41.
- **GainUtility page/URL:** `https://gainutility.com/blog/how-to-compress-a-pdf` (exists; localized versions exist at `/pt-br/`, `/de/`, `/fr/`, `/it/`, `/id/`, `/es-mx/blog/how-to-compress-a-pdf`).
- **Asset/content required:** new section with original before/after examples; localized versions updated through the existing localized-article pipeline.
- **Internal links required:** primary tool link (`/pdf/compress`), hub breadcrumb, links to A-02 once published.
- **Target backlink opportunities:** TOP-20 #7, #10, #14 Giz, #15 MRW, #16 Kumparan, #17 CHIP, #18 wecomm.
- **Priority:** P1
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, organic traffic, international growth

**Asset spec — A-03**
- **Exact URL:** `https://gainutility.com/blog/how-to-compress-a-pdf`
- **Search intent:** how-to — "how to compress a pdf"
- **Primary topic:** compressing a PDF step by step, and understanding what compression removes
- **Secondary topics:** scan DPI, image-heavy PDFs, when size barely moves (fonts/vector), upload limits (→ A-02)
- **Target audience:** students, print-lab users, anyone facing an upload cap
- **Recommended page structure:** existing steps → compression levels explained with our own before/after examples → when to split instead → FAQ
- **Supporting tools to link:** `/pdf/compress`, `/tools/compress-images-inside-pdf`, `/tools/pdf-exact-size`
- **Supporting guides:** A-02 (file size), `/blog/fix-pdf-too-big-to-upload`
- **External sites that could legitimately reference it:** TOP-20 #7, #10, #14–#18; CSV row 23 (ASU step-list replacement), row 26 (Penn State — two insertion points)
- **What makes it genuinely better:** it shows what each level actually destroys, demonstrated with reproducible examples from our own tool — most competing guides stop at "click compress."

### A-04 — Privacy Guide (new)

- **Action:** Publish a neutral, non-fearmongering explainer: what happens to files on upload-based tools; a retention audit table with quoted and linked ToS plus verification dates; a checklist for evaluating any tool; and an honest disclosure of how GainUtility itself processes files — including OCR's external processing, without over-claiming "everything is local."
- **Why it matters:** Communities literally ask "I uploaded confidential docs — damage control." Incumbents cannot answer this credibly; a neutral explainer is the only asset citable in those threads without looking like an ad (`CAMPAIGN-PLAN.md` content gaps #2).
- **Source evidence:** `LINKABLE-ASSETS.md` §4; CSV rows 55, 59, 61, 62, 65, and row 5 (HowToGeek op-ed against free converters — quote live 2026-10-01).
- **GainUtility page/URL:** `https://gainutility.com/blog/are-online-pdf-tools-safe` (proposed — does not exist yet).
- **Asset/content required:** full article + ToS audit table with dates + honest self-disclosure (OCR).
- **Internal links required:** `/tools/remove-pdf-metadata`, `/tools/merge-pdf`, `/tools/optimize-pdf-web`, hub `/pdf`; linked from the hub at launch (B-05).
- **Target backlink opportunities:** CSV rows 55, 59, 61, 62 (r/pdf, r/smallbusiness), row 65 (Quora offline question), row 5 (HowToGeek), TOP-20 #6 USC Gould (sensitive-doc angle), CSV rows 18 and 25 (law-library libguides).
- **Priority:** P0
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, topical authority, organic traffic

**Asset spec — A-04**
- **Exact URL:** `https://gainutility.com/blog/are-online-pdf-tools-safe`
- **Search intent:** informational — "are online pdf tools safe", "what happens to uploaded pdf files"
- **Primary topic:** how upload-based PDF tools handle files, and how to evaluate any tool
- **Secondary topics:** retention policies, metadata exposure, confidential/client documents, browser-local processing
- **Target audience:** users handling legal, HR and financial documents; r/pdf and r/smallbusiness communities
- **Recommended page structure:** what happens on upload → third-party retention audit table (quoted, linked, dated) → evaluation checklist → honest GainUtility disclosure (incl. OCR) → related tools
- **Supporting tools to link:** `/tools/remove-pdf-metadata`, `/tools/merge-pdf`, `/tools/optimize-pdf-web`, `/tools/protect-pdf`
- **Supporting guides:** A-03, A-02 (once published), existing `/blog/fix-pdf-too-big-to-upload`
- **External sites that could legitimately reference it:** CSV rows 5, 55, 59, 61, 62, 65, 18, 25; TOP-20 #6
- **What makes it genuinely better:** it audits competitors' own terms with quotes and dates, then applies the same scrutiny to ourselves — including where our processing is not local. No incumbent can publish that section.

### A-05 — PDF↔Word conversion guides (new, two articles)

- **Action:** Publish `/blog/how-to-convert-pdf-to-word` and `/blog/how-to-convert-word-to-pdf` using the established template: 3 steps → quality/size trade-off table → common failure modes → tool link. Localized versions follow the six non-EN locales already in the repo.
- **Why it matters:** JPG↔PDF guides already exist and earn internal links; PDF↔Word does not, yet PDF-to-Word is the pitch target for FreewareGenius (#12) and a natural companion to the OCR pitches (#13).
- **Source evidence:** `LINKABLE-ASSETS.md` §5; CSV rows 27, 28, 29 (FreewareGenius broken-link targets) and 30 (Globinch) — link statuses verified 2026-10-01.
- **GainUtility page/URL:** `https://gainutility.com/blog/how-to-convert-pdf-to-word`, `https://gainutility.com/blog/how-to-convert-word-to-pdf` (proposed — neither exists yet; the existing tool pages `/tools/pdf-to-word` and `/tools/word-to-pdf` are the pitch URLs meanwhile).
- **Asset/content required:** two articles + localized variants (new slugs added to the localized-article list).
- **Internal links required:** tool pages → guide (B-01); guide → hub `/pdf`; related articles to `/blog/how-to-convert-pdf-to-jpg` (exists).
- **Target backlink opportunities:** TOP-20 #12 FreewareGenius (broken-link replacement); CSV row 30 (Globinch-adjacent OCR), row 2 (TechRadar free PDF editor list), row 10 (DigitalTrends how-to).
- **Priority:** P1
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, organic traffic, topical authority

**Asset spec — A-05**
- **Exact URLs:** `https://gainutility.com/blog/how-to-convert-pdf-to-word`, `https://gainutility.com/blog/how-to-convert-word-to-pdf`
- **Search intent:** how-to — "convert pdf to word", "word to pdf"
- **Primary topic:** converting between PDF and Word while managing quality loss
- **Secondary topics:** scanned PDFs and OCR, formatting fidelity, file size, when to edit the source instead
- **Target audience:** office users, students, job applicants editing resumes
- **Recommended page structure:** 3 steps → quality/size trade-off table → common failure modes (scanned docs, garbled OCR, lost formatting) → tool link → related guides
- **Supporting tools to link:** `/tools/pdf-to-word`, `/tools/word-to-pdf`, `/tools/ocr-pdf`
- **Supporting guides:** `/blog/how-to-convert-pdf-to-jpg`, `/blog/how-to-convert-jpg-to-pdf` (both exist), A-06 troubleshooting articles
- **External sites that could legitimately reference it:** CSV rows 27–29 (FreewareGenius), 30 (Globinch), 2 (TechRadar), 10 (DigitalTrends)
- **What makes it genuinely better:** honest failure-mode coverage — scans need OCR, formatting will shift — with the trade-off stated up front, where competing guides promise lossless conversion and disappoint.

### A-06 — Troubleshooting library expansion (new section)

- **Action:** Expand from the single existing article to the recurring asks observed in communities: PDF won't open / corrupted after scan, OCR produced garbage text, merged output is blurred, password-protected PDF can't be compressed, image-heavy PDF still huge after compression. Each: cause → 3 fixes ranked by effort → tool link where applicable.
- **Why it matters:** Super User and r/pdf answers get cited for years; troubleshooting is the only content type those communities accept without downvoting (`CAMPAIGN-PLAN.md` content gaps #4).
- **Source evidence:** `LINKABLE-ASSETS.md` §6; CSV rows 66, 67 (Super User), 57, 58 (r/pdf), 63–65 (Quora).
- **GainUtility page/URL:** `/blog/fix-pdf-wont-open`, `/blog/fix-ocr-garbled-text`, `/blog/fix-blurry-merged-pdf`, `/blog/fix-password-protected-pdf-wont-compress`, `/blog/fix-image-heavy-pdf-still-large` (proposed; only `/blog/fix-pdf-too-big-to-upload` exists today).
- **Asset/content required:** five articles — start with the two most-asked; publish no placeholders.
- **Internal links required:** each article links its applicable tool + `/blog/fix-pdf-too-big-to-upload` + hub; tool pages link back (B-01).
- **Target backlink opportunities:** CSV rows 66, 67 (Super User), 63–65 (Quora), 57, 58 (r/pdf), 20 (TechSupportAlert).
- **Priority:** P2
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, organic traffic, topical authority

**Asset spec — A-06**
- **Exact URLs:** `/blog/fix-*` (new set; `/blog/fix-pdf-too-big-to-upload` exists)
- **Search intent:** troubleshooting — "pdf won't open", "ocr output garbled", "merged pdf blurry", "can't compress password protected pdf"
- **Primary topic:** cause → fixes ranked by effort for each failure mode
- **Secondary topics:** scans vs born-digital PDFs, image DPI, encryption, tool limits
- **Target audience:** users mid-task with a broken file; community answerers on Super User, Reddit, Quora
- **Recommended page structure:** symptom → most likely cause → 3 fixes ranked by effort → when a tool helps → related fixes
- **Supporting tools to link:** `/tools/repair-pdf`, `/tools/ocr-pdf`, `/tools/merge-pdf`, `/tools/remove-pdf-password`, `/pdf/compress`
- **Supporting guides:** A-03, A-02, the existing fix guide
- **External sites that could legitimately reference it:** CSV rows 66, 67, 63–65, 57, 58, 20
- **What makes it genuinely better:** ranked-by-effort fixes with honest caveats about what browser tools cannot do (huge encrypted files, corrupted structures) — community-tested usefulness, not a funnel.

### A-07 — Compression benchmark study (flagship PR asset)

- **Action:** Run a reproducible benchmark — published test corpus, same files across GainUtility/Smallpdf/iLovePDF/PDF24/Adobe online, metrics: output size, blind visual quality, time, account/upload required — publish methodology alongside results with a prominent run date, re-run quarterly, and publish results even where we lose. No numbers ship until tests run.
- **Why it matters:** Every listicle is editorial opinion; one honest, reproducible study is the only thing that gets cited by all of them (`CAMPAIGN-PLAN.md` content gaps #3).
- **Source evidence:** `LINKABLE-ASSETS.md` §7; TOP-20 #1, #2, #3; CSV rows 1, 6, 14, 69 (HARO/featured-style journalist platforms, row 69 = HARO).
- **GainUtility page/URL:** `https://gainutility.com/pdf-compression-benchmark` (proposed — route does not exist; routing + sitemap + prerender needed).
- **Asset/content required:** test corpus (or published generation scripts), test runs, methodology write-up, results table. Corpus/scripts public so results are reproducible.
- **Internal links required:** hub `/pdf`, A-03 guide, A-02; hub links to it at launch (B-05).
- **Target backlink opportunities:** TOP-20 #1 TechRadar, #2 MakeUseOf, #3 Techshali; digital-PR platforms (CSV rows 69, 70).
- **Priority:** P2
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, referral traffic, organic traffic

**Asset spec — A-07**
- **Exact URL:** `https://gainutility.com/pdf-compression-benchmark` (after the route is added)
- **Search intent:** informational — "pdf compression comparison", "which pdf compressor is best"
- **Primary topic:** measured, reproducible compression results across major tools
- **Secondary topics:** free-tier limits, account/upload requirements, visual quality vs size
- **Target audience:** journalists and editors writing tool roundups; technical evaluators
- **Recommended page structure:** methodology (corpus, settings, run date, versions) → results table → what each tool discards → limitations → re-run schedule
- **Supporting tools to link:** `/pdf/compress`, `/tools/compress-images-inside-pdf`
- **Supporting guides:** A-03, A-02
- **External sites that could legitimately reference it:** TOP-20 #1, #2, #3; CSV rows 69, 70 (journalist platforms)
- **What makes it genuinely better:** it publishes its method and its losses. A study showing competitors winning a column is the only kind editors trust.

### A-08 — OSS feasibility decision gate (before any GitHub strategy)

- **Action:** Owner answers the five gate questions from `LINKABLE-ASSETS.md` §8 (any legitimate OSS code? license conflict? repo ready with README/tests/no secrets? maintenance owner?). A "no" anywhere means skipping `py-pdf/awesome-pdf` and awesome-selfhosted entirely.
- **Why it matters:** GitHub awesome-lists require a hosted open-source product, not a website; an abandoned repo hurts more than none.
- **Source evidence:** `LINKABLE-ASSETS.md` §8; CSV rows 53, 54 (rules quotes fetched 2026-10-01).
- **GainUtility page/URL:** n/a (affects only a future repo and root positioning).
- **Asset/content required:** none until the gate passes.
- **Internal links required:** none.
- **Target backlink opportunities:** CSV row 53 (py-pdf/awesome-pdf PR route), row 54 (awesome-selfhosted — likely skip regardless).
- **Priority:** P2
- **Status:** OWNER ACTION REQUIRED
- **Expected purpose:** backlink acquisition

---

## §2 PHASE 2 — Internal link architecture

### Architecture (corrected to real routes)

Generic pattern → GainUtility mapping:

```
Homepage (/)
  → Hub (/pdf  ·  /tools  ·  /studios/color/*)
    → Tool (/tools/merge-pdf …)
      → Guide (/blog/how-to-merge-pdf-files …)
        → Related Tool (/tools/split-pdf …)
          → Supporting Article (/blog/fix-* …)
            ↺ back to Hub (breadcrumb)
```

PDF chain as requested, corrected to live URLs:

```
/pdf
  → /tools/merge-pdf
  → /tools/compress-images-inside-pdf     ← NOT /tools/compress-pdf (that is a 301 redirect)
  → /tools/split-pdf
  → /tools/pdf-to-word
  → /tools/jpg-to-pdf
  → /blog/how-to-compress-a-pdf           ← NOT /guides/pdf-compression
  → /blog/pdf-file-size-limits            ← NOT /guides/pdf-file-size (A-02, new)
  → /blog/are-online-pdf-tools-safe       ← (A-04, new)
  → /blog/fix-pdf-too-big-to-upload → /blog/fix-* (A-06)
  → related /blog/… (each locale links only its own copies)
```

**Rules enforced here (from `LINKABLE-ASSETS.md` §9):** every guide links exactly one primary tool plus the hub; every tool page links its how-to guide; localized pages link only to their own locale equivalents (hreflang handles cross-locale); new assets enter `sitemap.xml` at launch and are linked from the hub; never send an external backlink to the homepage when a deeper page is the true destination.

### B-01 — Tool → guide links

- **Action:** On every tool page, add a contextual link to its how-to guide and, where one exists, to the related troubleshooting article.
- **Why it matters:** Today no tool page links any blog article — a mention landing on `/tools/merge-pdf` dead-ends instead of flowing to guides and the hub, wasting every hard-won placement.
- **Source evidence:** Codebase grep (`/blog/` appears only in blogData, i18n articles, seoPageContent, shared, router); `LINKABLE-ASSETS.md` §9.
- **GainUtility page/URL:** all 140 tool pages, PDF tools first: `/tools/merge-pdf`, `/tools/split-pdf`, `/tools/compress-images-inside-pdf`, `/tools/pdf-to-word`, `/tools/ocr-pdf`, `/tools/jpg-to-pdf`, `/tools/pdf-exact-size`, `/tools/remove-pdf-metadata`, `/tools/optimize-pdf-web`.
- **Asset/content required:** none — a tool→guide mapping table; anchor copy in natural language.
- **Internal links required:** this is the internal-linking work; pairs with the existing `relatedTools` grid and breadcrumbs.
- **Target backlink opportunities:** amplifies every prospect targeting a tool page — TOP-20 #6, #7, #9, #10, #12, #13 and all community rows (CSV 55–68).
- **Priority:** P0
- **Status:** SITE CHANGE REQUIRED
- **Expected purpose:** internal authority flow, organic traffic

### B-02 — PDF hub family → guide link blocks

- **Action:** Add link-cluster sections (`SeoPageSection {type:"links"}`) to the PDF hub entries — `/pdf`, `/pdf/compress`, `/pdf/merge`, `/pdf/split`, `/pdf/pdf-to-word`, `/pdf/jpg-to-pdf`, `/pdf/best`. The mechanism already exists and is currently wired only to CSS/DEV hub entries.
- **Why it matters:** The hubs are the pitch destination for #3, #4, #5, #8 — they must surface the guides, or new guide backlinks have no entry point from the strongest page.
- **Source evidence:** `src/seo/seoPageContent.ts` (link blocks present only on CSS/box-shadow + dev entries); `SeoLandingPage.tsx` renderer exists.
- **GainUtility page/URL:** `/pdf`, `/pdf/compress`, `/pdf/merge`, `/pdf/split`, `/pdf/pdf-to-word`, `/pdf/jpg-to-pdf`, `/pdf/best` (plus their related-tool grids).
- **Asset/content required:** anchor text/copy for each link cluster — natural language, no keyword stuffing.
- **Internal links required:** hub → A-02/A-03/A-04 guides → back to hub via breadcrumb.
- **Target backlink opportunities:** TOP-20 #3, #4, #5, #8, #16 — converts their mentions into site-wide flow.
- **Priority:** P0
- **Status:** SITE CHANGE REQUIRED
- **Expected purpose:** internal authority flow, backlink acquisition

### B-03 — Guide → tool + hub verification

- **Action:** Verify each PDF blog article's tool/CTA blocks point to the correct primary tool, and that its hub breadcrumb resolves; fix any block still referencing retired URLs (`/tools/compress-pdf`, `/tools/pdf-compressor` — both now redirects).
- **Why it matters:** The outbound half of the chain exists but must be checked article-by-article before any guide is pitched as a destination.
- **Source evidence:** `blogData.ts` tool/toolCta blocks; `BlogArticlePage.tsx` renderers.
- **GainUtility page/URL:** all 21 `/blog/*` articles, starting with `/blog/how-to-compress-a-pdf`, `/blog/how-to-merge-pdf-files`, `/blog/how-to-split-a-pdf`.
- **Asset/content required:** none unless a stale URL is found.
- **Internal links required:** guide → primary tool → hub (breadcrumb exists).
- **Target backlink opportunities:** TOP-20 #7, #10, #14–#18 (all guide-destination prospects).
- **Priority:** P0
- **Status:** NEEDS VERIFICATION
- **Expected purpose:** internal authority flow

### B-04 — Related-article chains among PDF content

- **Action:** Verify related-article coverage links the PDF guides to each other (compress ↔ merge ↔ split ↔ fix-too-big ↔ new file-size/privacy guides) and extend where gaps exist.
- **Why it matters:** Keeps a link-arriving reader inside the topic cluster and distributes authority across it.
- **Source evidence:** `relatedArticlesFor` in `blogData.ts`; new assets (A-02, A-04, A-05, A-06) have no related entries yet.
- **GainUtility page/URL:** the PDF blog cluster.
- **Asset/content required:** none; new articles need their related entries when published.
- **Internal links required:** article ↔ article, same locale only.
- **Target backlink opportunities:** supports all guide-targeting prospects.
- **Priority:** P1
- **Status:** NEEDS VERIFICATION
- **Expected purpose:** internal authority flow, organic traffic

### B-05 — New-asset launch protocol

- **Action:** Every new asset (A-02, A-04, A-05, A-06, A-07) ships with: sitemap regeneration, hub link (B-02), breadcrumb + FAQ schema, related-article entries, and locale gating for localized variants.
- **Why it matters:** `LINKABLE-ASSETS.md` §9 — a pitch target that isn't internally linked converts its new backlink poorly, and an unindexed new URL cannot be linked at all.
- **Source evidence:** `LINKABLE-ASSETS.md` §9; `scripts/generate-sitemap.mjs`; `src/i18n/pages.ts` slug gating.
- **GainUtility page/URL:** all new assets.
- **Asset/content required:** none (release procedure).
- **Internal links required:** all of the above.
- **Target backlink opportunities:** gates outreach to TOP-20 #1, #2, #12 and every community row depending on new guides.
- **Priority:** P0
- **Status:** SITE CHANGE REQUIRED
- **Expected purpose:** internal authority flow, backlink acquisition

### B-06 — HowTo schema on genuinely sequential guides (optional)

- **Action:** Implement HowTo JSON-LD only where steps are genuinely followed in order (compression and conversion guides), using builders alongside the existing FAQ/Breadcrumb builders.
- **Why it matters:** Rich-result eligibility for how-to queries; currently zero HowTo schema exists on the site.
- **Source evidence:** no `HowTo`/`HowToStep` matches in `src/`; schema builder family in `src/seo/shared.ts`; rule from `LINKABLE-ASSETS.md` §9.
- **GainUtility page/URL:** `/blog/how-to-compress-a-pdf` and the conversion guides.
- **Asset/content required:** none beyond article content.
- **Internal links required:** none additional.
- **Target backlink opportunities:** indirect (SERP presentation for #7/#10-class queries).
- **Priority:** P2
- **Status:** SITE CHANGE REQUIRED
- **Expected purpose:** organic traffic

### Strongest destination URL per prospect

Never default to the homepage. Recommended deepest relevant destination:

| Prospect | Strongest destination | Why this URL |
|---|---|---|
| #1 TechRadar (compressor) | `/pdf/compress` | readers mid-choice on a compressor; hub sub-page matches intent |
| #2 MakeUseOf | `/pdf/compress` | same; browser-local angle demonstrated on the tool hub |
| #3 Techshali | `/pdf` | alternatives list needs one URL covering the whole suite |
| #4 The Business Dive | `/pdf/best` | their page has an alternatives table — `/pdf/best` mirrors it |
| #5 OutrightCRM | `/pdf/best` | same; business-framed comparison page |
| #6 USC Gould | `/tools/merge-pdf` | their libguide entry point is merging scanned docs |
| #7 Penn State | `/blog/how-to-compress-a-pdf` + `/tools/merge-pdf` | two insertion points: compress step and merge step |
| #8 URV | `/pdf` (Spanish-context pitch may reference `/es-mx/pdf`) | library catalog entry for a tool suite |
| #9 King's College | `/tools/ocr-pdf` | their page is specifically about OCR |
| #10 ASU Print Lab | `/blog/how-to-compress-a-pdf` | their page is a step list — a guide matches the format; never `/tools/compress-pdf` |
| #11 TechSupportAlert | `/tools` | freeware directory lists toolkits, not single tools |
| #12 FreewareGenius | `/tools/pdf-to-word` | replacement for a PDF-to-Word review link |
| #13 Globinch | `/tools/ocr-pdf` | replacement for dead OCR links |
| #14 Giz Brasil | `/pt-br/blog/how-to-compress-a-pdf` | PT-BR audience; localized guide exists |
| #15 MRW.it | `/it/blog/how-to-compress-a-pdf` | IT audience; "Vai al sito" entry format |
| #16 Kumparan | `/id/blog/how-to-compress-a-pdf` | ID audience; contributor article links it |
| #17 CHIP.de | `/de/blog/how-to-compress-a-pdf` | DE audience; Web-App section entry |
| #18 wecomm.fr | `/fr/blog/how-to-compress-a-pdf` | FR audience; second slot `/fusionner-pdf/` → merge guide |
| #19 SaaSHub | `/` | directory listings take the product root |
| #20 Product Hunt | `/` | launch page root |
| CSV 55, 59, 61, 62 (Reddit sensitive docs) | `/tools/merge-pdf` (+ `/tools/compress-images-inside-pdf`) | matches the asked task |
| CSV 56, 57, 58, 63, 66, 67 (size questions) | `/tools/pdf-exact-size` (A-02 guide when live) | matches exact-size intent |
| CSV 64 (Quora compression to a smaller target) | `/tools/compress-images-inside-pdf` | matches the asked task |
| CSV 65 (Quora: compress on laptop / offline) | `/tools/optimize-pdf-web` + A-04 privacy guide | matches offline/no-install intent |
| CSV 68 (HN) | `/pdf` | technical hub as a discussion reference |
| CSV 69–73 (digital PR) | `/about` | founder/platform credibility anchor |

---

## §3 PHASE 3 — Content gap opportunities

Where competitors earn links by being useful — and whether a genuinely better equivalent is possible without copying them. Mapping rows reference backlog entries defined above (fields stated there).

| Competitor pattern | Evidence in our set | Genuinely better equivalent? | Asset | Backlog | Status |
|---|---|---|---|---|---|
| Useful explanations | iLovePDF/Smallpdf help content cited by libguides; HowToGeek op-ed against converters | Yes — a neutral privacy explainer incumbents cannot publish | A-04 | CONTENT REQUIRED |
| Calculators/tools | Exact-size tool and 140+ tools already exist (CSV rows 56, 63, 67) | Yes — the tools exist; the reference data around them (limits table) is missing | A-02 | CONTENT REQUIRED |
| Tutorials | Smallpdf step lists embedded by ASU and Penn State ("Go to smallpdf.com…") | Yes — deeper guide with compression levels explained, localized ×6 | A-03 | CONTENT REQUIRED |
| Benchmarks | Every listicle in our set is unverified opinion | Yes — reproducible study with published method and published losses | A-07 | CONTENT REQUIRED + test runs |
| Comparison resources | Techshali/Softlookup tables; rival-vendor alternatives pages (CSV 75–78); our existing `/compare/*` (9 pages) | Yes — hub comparison strip on three verifiable axes | A-01 + existing `/compare/*` | SITE CHANGE REQUIRED |
| Downloadable resources | No legitimate pattern in our prospect set | Not pursuing — GainUtility is browser tooling; a download pack built only to be linked would be a manufactured asset | — | explicit skip |
| Troubleshooting information | Super User/Reddit/Quora threads with thin existing answers | Yes — ranked-by-effort fix articles with honest limits | A-06 | CONTENT REQUIRED |
| Educational content | Conversion guides exist for JPG pairs, missing for Word pairs | Yes — PDF↔Word guides using the established template | A-05 | CONTENT REQUIRED |
| Localized resources | iLovePDF's `/es` `/fr` `/pt` subpaths earn regional placements; we already ship 6 indexable locales | Yes — localized guides exist; pitch them in-language (Phase 4) | existing | OWNER ACTION REQUIRED |

### C-01 — Free-tier limit research (feeds A-01, TOP-20 #1, #2)

- **Action:** Collect and source current free-tier limits for Smallpdf, iLovePDF, PDF2Go, PDF24, Sejda (tasks/day, file caps, account requirement), each with a verification date — data only, no quality judgments.
- **Why it matters:** The hub comparison strip and the TechRadar/MakeUseOf pitches both promise "exact free-tier limits"; the claim must be backed before it is sent.
- **Source evidence:** TOP-20 #1 draft ("Happy to send exact free-tier limits for Smallpdf/iLovePDF/PDF2Go"); `LINKABLE-ASSETS.md` §1.
- **GainUtility page/URL:** `/pdf` (comparison strip).
- **Asset/content required:** sourced data table with per-limit verification dates.
- **Internal links required:** none (feeds A-01).
- **Target backlink opportunities:** TOP-20 #1 TechRadar, #2 MakeUseOf; CSV row 76 (trulyfreetools already publishes competitor caps — verify via G-07 first).
- **Priority:** P1
- **Status:** CONTENT REQUIRED
- **Expected purpose:** backlink acquisition, organic traffic

---

## §4 PHASE 4 — International

### Locale verification (does the site actually serve the language?)

Verified against `src/i18n/locales.ts`, the hreflang builder, and the generated sitemap (2026-10-01):

| Language/market | Prefix | In sitemap | Hreflang | Verdict |
|---|---|---|---|---|
| English | (root) | yes | yes + x-default | served |
| French | `/fr` | yes (incl. `/fr/blog/how-to-compress-a-pdf`) | yes | served — wecomm.fr pitchable |
| Spanish (Mexico) | `/es-mx` | yes | yes | served — URV pitch may reference; ES A-group target still missing (D-08) |
| Spanish (Colombia) | `/es-co` | no — `noindex`, sitemap- and hreflang-excluded | no | never pitch `es-co` URLs |
| Brazilian Portuguese | `/pt-br` | yes | yes | served — Giz pitchable |
| German | `/de` | yes | yes | served — CHIP pitchable |
| Indonesian | `/id` | yes | yes | served — Kumparan pitchable |
| Italian | `/it` | yes | yes | served — MRW pitchable |

**Constraints:** localized hub sub-paths (e.g. `/fr/pdf/compress`) are not in the sitemap — regional pitches use localized blog/tool URLs only. Never create a translated page solely because a locale exists; the referring page must show a real local use case.

### D-01 — Pre-pitch locale URL gate

- **Action:** Manually load every localized destination once (`/pt-br/blog/how-to-compress-a-pdf`, `/de/…`, `/fr/…`, `/it/…`, `/id/…`, `/es-mx/…`) and confirm: loads, self-canonical, correct `lang`, indexed, and the translation reads naturally for that market.
- **Why it matters:** A pitch in French that lands on a broken or awkwardly translated page ends the conversation and the relationship.
- **Source evidence:** prerendered output shows correct canonical/hreflang for localized blogs; manual load not yet done for all six.
- **GainUtility page/URL:** all localized pitch destinations.
- **Asset/content required:** none.
- **Internal links required:** confirm same-locale internal links only (no EN→DE links).
- **Target backlink opportunities:** TOP-20 #8, #14, #15, #16, #17, #18.
- **Priority:** P0
- **Status:** NEEDS VERIFICATION
- **Expected purpose:** international growth, backlink acquisition

### Regional actions (each pitches only an existing, verified local page with a demonstrated local use case)

- **D-02 — wecomm.fr (FR).** Action: send the localized pitch in French referencing `/fr/blog/how-to-compress-a-pdf`, offering French screenshots; list inclusion at `/compresser-pdf/` first, guest route (`proposer-article-invite`) second. Why: the page links iLovePDF/PDF24/Smallpdf directly and the site accepts guest articles. Evidence: CSV row 31, quote live 2026-10-01. URL: `https://gainutility.com/fr/blog/how-to-compress-a-pdf`. Asset: French tool screenshots required. Internal links: B-01/B-02 first. Opportunity: TOP-20 #18. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **D-03 — CHIP.de (DE).** Action: German-language contact-form pitch for `/de/blog/how-to-compress-a-pdf`, kostenlos/keine Anmeldung framing; second slot in the sibling merge article. Why: the explicit "Web-App" section is the exact slot; PDF24's presence there comes from download integrations, not editorial love. Evidence: CSV row 34, quote live 2026-10-01. URL: `https://gainutility.com/de/blog/how-to-compress-a-pdf`. Asset: localized DE guide (exists); German screenshots if requested. Internal links: B-01/B-02. Opportunity: TOP-20 #17. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **D-04 — MRW.it (IT).** Action: pitch in Italian through `mrw.it/contatti/` or `collabora/`, matching their "Vai al sito" entry format exactly; offer Italian screenshots and a guest contribution. Why: established tech blog (est. 2003) with repeatable outbound CTA format = repeat placement potential. Evidence: CSV row 41, quote live 2026-10-01. URL: `https://gainutility.com/it/blog/how-to-compress-a-pdf`. Asset: localized IT guide (exists). Internal links: B-01/B-02. Opportunity: TOP-20 #15. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **D-05 — Giz Brasil (PT-BR).** Action: short PT-BR tip through their working "mande sua dica" line referencing `/pt-br/blog/how-to-compress-a-pdf`. Why: curated free-tool list with live competitor hyperlinks; tip line verified working. Evidence: CSV row 37, quote live 2026-10-01. URL: `https://gainutility.com/pt-br/blog/how-to-compress-a-pdf`. Asset: localized PT-BR guide (exists). Internal links: B-01/B-02. Opportunity: TOP-20 #14. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **D-06 — Kumparan (ID).** Action: write and submit a complete Bahasa Indonesia how-to through the open contributor program ("Cara Menulis di kumparan") that naturally includes the ID guide alongside iLovePDF/Smallpdf, framed as the no-upload choice. Why: contributor-run column with no gatekeeper — lowest-friction regional placement; full editorial control. Evidence: CSV row 40, quote live 2026-10-01. URL: `https://gainutility.com/id/blog/how-to-compress-a-pdf`. Asset: complete ID column article (content work). Internal links: the column links the ID guide; guide keeps its own internal links. Opportunity: TOP-20 #16. Priority: P1. Status: OWNER ACTION REQUIRED (account + submission; article writing). Purpose: international growth, backlink acquisition, referral traffic.
- **D-07 — URV libguide (ES/CA).** Action: contact URV library staff in Spanish/Catalan context, positioning `/pdf` as one more free catalog entry (no registration for students); may reference `/es-mx/pdf` as the Spanish version. Why: library curates free student tools; our free/no-account fit is exact. Evidence: CSV row 16, quote live 2026-10-01. URL: `https://gainutility.com/pdf`. Asset: none new. Internal links: B-01/B-02. Opportunity: TOP-20 #8. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **D-08 — Spanish-market A-group target research.** Action: research and add one Spanish-language publication with a real PDF-tools use case and a working editorial channel (the CSV has no ES A-group editorial target; es-mx/es-co guides exist but nothing to pitch in Spain/LatAm yet). Why: closes the documented locale coverage gap honestly — do not improvise a target mid-send. Evidence: `CAMPAIGN-PLAN.md` §3 locale coverage note. URL: will map to `/es-mx/blog/how-to-compress-a-pdf` or `/es-mx/pdf`. Asset: none. Internal links: n/a until target exists. Opportunity: future ES target (none claimed). Priority: P2. Status: NEEDS VERIFICATION. Purpose: international growth.
- **D-09 — B-group contact verification.** Action: before any B-group pitch (CNN Indonesia row 39, CeoTech row 42, anymp4.fr row 32, IONOS row 33, ONLYOFFICE row 36, Wondershare ES row 35 — monitor only), find a real editorial channel; several pages have no public contact. Why: pitching blind or through generic forms burns the domain. Evidence: CSV Notes column (no contact found / imprint only). URL: respective localized guides where they exist. Asset: none. Internal links: n/a. Opportunity: B-group list only, no link claimed. Priority: P2. Status: NEEDS VERIFICATION. Purpose: international growth, backlink acquisition.

---

## §5 PHASE 5 — Top-20 owner-action checklist

Every send is an owner action: the drafts exist in `TOP-20-TARGETS.md` and `OUTREACH-TEMPLATES.md`, but only the site owner can email, submit, or post. Prerequisites (B-01/B-02 internal links, F-01 sanity gate) must pass first. No entry claims a link will result.

### Tier A — Editorial (EN)

**E-01 — TechRadar, best PDF compressor (CSV row 1)**
- Action: send the Template 2 suggestion email to the page's own suggestion mailto (ecommerce-b2b@futurenet.com), contact-form fallback.
- Why: the page invites product suggestions; readers are actively choosing a free compressor; no affiliate program on that page, so merit is the angle.
- Source evidence: TOP-20 #1; CSV row 1 quote live 2026-10-01.
- GainUtility URL: `/pdf/compress`.
- Asset required: none to send; A-02 + C-01 strengthen it later (never promise unpublished assets).
- Internal links: B-01, B-02 first.
- Target opportunity: TechRadar compressor listicle — editorial mention.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-02 — MakeUseOf, best online PDF compression tools (CSV row 6)**
- Action: send Template 2 to makeuseof.com/contact/ answering the reader's "what about Offline compressors?" comment thread.
- Why: a reader gap is already on the page; browser-local processing fits it honestly. Do not pitch target-size novelty — PDF2Go already offers it (CSV honesty note).
- Source evidence: TOP-20 #2; CSV row 6 quote live 2026-10-01.
- GainUtility URL: `/pdf/compress`.
- Asset required: none to send; C-01 free-tier data strengthens.
- Internal links: B-01, B-02 first.
- Target opportunity: MakeUseOf compression roundup — editorial mention.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-03 — Techshali, 20+ iLovePDF alternatives (CSV row 14)**
- Action: send the personalized Template 2 email to the public editor email on the page (fastest realistic outreach in the editorial set).
- Why: alternatives listicles exist to add entries; 140+ tools fits the "all-in-one free alternative" slot.
- Source evidence: TOP-20 #3; CSV row 14 quote live 2026-10-01.
- GainUtility URL: `/pdf`.
- Asset required: A-01 hub upgrade strengthens (send possible before it ships).
- Internal links: B-01, B-02 first.
- Target opportunity: Techshali alternatives listicle — editorial mention.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition.

**E-04 — The Business Dive, Sejda review + alternatives table (CSV row 9)**
- Action: re-pull the evidence quote, then submit through their official submit-your-tool form.
- Why: dedicated submission page = clearest editorial path in the Top 20; SMB audience matches our positioning.
- Source evidence: TOP-20 #4; CSV row 9 — quote not retained, must re-pull before send.
- GainUtility URL: `/pdf/best`.
- Asset required: A-01 strengthens.
- Internal links: B-01, B-02 first.
- Target opportunity: The Business Dive alternatives table — tool submission/editorial mention.
- Priority: P0 · Status: NEEDS VERIFICATION (re-pull quote; then OWNER ACTION REQUIRED) · Purpose: backlink acquisition.

**E-05 — OutrightCRM Store, PDF tools for business (CSV row 8)**
- Action: re-pull the evidence quote, then send Template 2 for list inclusion; Template 4 guest idea second (they have an explicit write-for-us route).
- Why: SMB document-workflow audience; guest-post culture is rare and valuable — two paths in one domain.
- Source evidence: TOP-20 #5; CSV row 8 — quote not retained, must re-pull before send.
- GainUtility URL: `/pdf/best`.
- Asset required: A-01 hub upgrade + business workflows content for the guest piece.
- Internal links: B-01, B-02 first.
- Target opportunity: OutrightCRM list + guest contribution.
- Priority: P1 · Status: NEEDS VERIFICATION (re-pull quote; then OWNER ACTION REQUIRED) · Purpose: backlink acquisition, topical authority.

### Tier A — Institutional / resource pages

**E-06 — USC Gould Law Library libguide (CSV row 25)**
- Action: send Template 3 to USC Gould library staff (no in-page contact) offering the merger as a no-upload alternative for scanned legal documents, with a paste-ready description in their format.
- Why: law students combine scanned, sensitive documents — the no-upload design fits the exact context.
- Source evidence: TOP-20 #6; CSV row 25 quote live 2026-10-01.
- GainUtility URL: `/tools/merge-pdf`.
- Asset required: none (tool exists); A-04 privacy guide strengthens the sensitive-doc angle if shipped first.
- Internal links: B-01 first (tool → merge guide).
- Target opportunity: USC libguide resource-list inclusion.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-07 — Penn State STAT tutorial (CSV row 26)**
- Action: send Template 3 to the STAT department — two insertion points on one page (compress step + merge step), offered as free/no-install for managed lab machines.
- Why: course content teaching compression and merging; free/no-install fits lab machines where installs are blocked.
- Source evidence: TOP-20 #7; CSV row 26 quote live 2026-10-01 (two insertion points).
- GainUtility URL: `/blog/how-to-compress-a-pdf` + `/tools/merge-pdf`.
- Asset required: none to send; A-02 file-size guide strengthens later.
- Internal links: B-01, B-03 first.
- Target opportunity: Penn State course tutorial — resource-list inclusion (×2).
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-08 — URV library libguide (CSV row 16)**
- Action: contact URV library staff via the URV contact directory in Spanish/Catalan context (detail in D-07), offering `/pdf` as one more free catalog entry; run the D-01 locale check first.
- Why: library curates free student tools; no-registration fit for students.
- Source evidence: TOP-20 #8; CSV row 16 quote live 2026-10-01.
- GainUtility URL: `/pdf`.
- Asset required: none.
- Internal links: B-01, B-02 first.
- Target opportunity: URV free-tools catalog inclusion.
- Priority: P1 · Status: OWNER ACTION REQUIRED (D-01 gate applies) · Purpose: international growth, backlink acquisition.

**E-09 — King's College (Canada) accessibility/OCR libguide (CSV row 17)**
- Action: email library@ukings.ca with Template 3, including the required transparency line: our OCR page documents exactly how files are processed.
- Why: accessibility guidance recommending free OCR — free/no-sign-up fits, and this audience values honesty over claims.
- Source evidence: TOP-20 #9; CSV row 17 quote live 2026-10-01; honesty requirement in TOP-20 notes.
- GainUtility URL: `/tools/ocr-pdf`.
- Asset required: none (tool exists).
- Internal links: B-01 first.
- Target opportunity: King's accessibility libguide inclusion.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-10 — ASU Print Lab tools & resources (CSV row 23)**
- Action: send Template 3 with a parallel step list in their exact format ("Go to gainutility.com/pdf/compress…") plus the guide link.
- Why: their page teaches compression via Smallpdf's step list — an add/replace pitch in the same format is concrete. Never reference `/tools/compress-pdf` (it redirects).
- Source evidence: TOP-20 #10; CSV row 23 quote live 2026-10-01.
- GainUtility URL: `/blog/how-to-compress-a-pdf`.
- Asset required: none (guide exists).
- Internal links: B-03 first (guide → tool block verified).
- Target opportunity: ASU print-lab page — resource-list/tutorial replacement.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

### Tier A — Broken-link / resource replacements

**E-11 — TechSupportAlert (Gizmo's Freeware) (CSV row 20)**
- Action: send Template 1 with the verified link-status list (three dead/redirected links), offering working replacements; one email covers list inclusion too.
- Why: leads with a gift (their bug); curated free-tool directory whose editorial core is free/no-account tools.
- Source evidence: TOP-20 #11; CSV row 20 — broken links verified 2026-10-01 (DNS failure + two redirects).
- GainUtility URL: `/tools`.
- Asset required: none.
- Internal links: B-01 first.
- Target opportunity: TechSupportAlert list inclusion + broken-link replacement.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**E-12 — FreewareGenius, Pdfburger review (CSV rows 27, 28, 29)**
- Action: send Template 1 covering all three sibling pages in one email (dead 301 + two redirected links).
- Why: their review now points at a stranger's domain; editors act on fix-the-page framing; editor is reachable.
- Source evidence: TOP-20 #12; CSV rows 27–29 — link statuses verified 2026-10-01.
- GainUtility URL: `/tools/pdf-to-word`.
- Asset required: none to send; A-05 PDF↔Word guide strengthens.
- Internal links: B-01 first (tool → guide once A-05 ships).
- Target opportunity: FreewareGenius broken-link replacement (×3 pages).
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition.

**E-13 — Globinch, PDF OCR roundup (CSV row 30)**
- Action: send Template 1 with the two compromised links (dead DNS + hijacked affiliate redirect); offer the full link-status list.
- Why: a hijacked link is a security problem the editor will want to fix fast.
- Source evidence: TOP-20 #13; CSV row 30 — statuses verified 2026-10-01, quote retained.
- GainUtility URL: `/tools/ocr-pdf`.
- Asset required: none.
- Internal links: B-01 first.
- Target opportunity: Globinch broken-link replacement.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition.

### Tier A — Regional (see §4 for D-series detail)

- **E-14 — Giz Brasil (PT-BR) · CSV row 37:** Action: PT-BR tip via their working "mande sua dica" line. Why: free-tool list with live competitor links. Evidence: quote live 2026-10-01. URL: `/pt-br/blog/how-to-compress-a-pdf`. Asset: localized guide (exists). Internal links: D-01 gate. Opportunity: list inclusion. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **E-15 — MRW.it (IT) · CSV row 41:** Action: Italian pitch via `contatti/`/`collabora/` matching the "Vai al sito" entry format. Why: established blog with repeatable outbound CTA. Evidence: quote live 2026-10-01. URL: `/it/blog/how-to-compress-a-pdf`. Asset: localized guide (exists); Italian screenshots. Internal links: D-01 gate. Opportunity: list inclusion/guest. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **E-16 — Kumparan (ID) · CSV row 40:** Action: write and submit a complete Bahasa how-to through the open contributor program. Why: no gatekeeper, full editorial control, exact local use case. Evidence: quote live 2026-10-01. URL: `/id/blog/how-to-compress-a-pdf`. Asset: complete ID column article (content work). Internal links: n/a (off-site article). Opportunity: UGC contribution. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition, referral traffic.
- **E-17 — CHIP.de (DE) · CSV row 34:** Action: German contact-form pitch for the explicit "Web-App" section, kostenlos/keine Anmeldung framing. Why: exact slot; sibling merge article = second placement. Evidence: quote live 2026-10-01. URL: `/de/blog/how-to-compress-a-pdf`. Asset: localized guide (exists). Internal links: D-01 gate. Opportunity: Web-App list inclusion. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.
- **E-18 — wecomm.fr (FR) · CSV row 31:** Action: French pitch for `/compresser-pdf/` list inclusion; guest route second. Why: direct competitor links on page; second slot at `/fusionner-pdf/`. Evidence: quote live 2026-10-01. URL: `/fr/blog/how-to-compress-a-pdf`. Asset: French screenshots required. Internal links: D-01 gate. Opportunity: list inclusion/guest. Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: international growth, backlink acquisition.

### Tier A — Directories (owner action)

- **E-19 — SaaSHub · CSV row 44:** Action: create an account (email on the gainutility.com domain = priority queue) and submit with the prepared copy; must list competitors (Smallpdf, iLovePDF, PDF24, Sejda) or the queue stalls. Why: rules explicitly accept most software; free. Evidence: rules quote fetched 2026-10-01. URL: `/`. Asset: submission copy ready in TOP-20 #19. Internal links: n/a. Opportunity: directory listing (rel type unknown until live — verify). Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: backlink acquisition, referral traffic.
- **E-20 — Product Hunt · CSV row 45:** Action: create a personal maker account, wait ~1 week for account maturity, then schedule the launch (up to 1 month ahead) using the prepared tagline/description framed as a privacy-first suite, not "another PDF tool." Why: free, anyone can launch; privacy-first positioning differentiates on that platform. Evidence: rules quote fetched 2026-10-01. URL: `/`. Asset: PH tagline + gallery screenshots (owner produces). Internal links: n/a. Opportunity: product launch listing (nofollow expected — record Link Type honestly). Priority: P1. Status: OWNER ACTION REQUIRED. Purpose: backlink acquisition, referral traffic.

### Supporting owner actions (outside the Top 20)

**G-01 — Ahrefs data import**
- Action: export real DR/Traffic for all 78 CSV rows and fill columns 3–4; never estimate.
- Why: priority ordering and reporting depend on measured data, not guesses; every file currently says "n/a — verify in Ahrefs."
- Source evidence: CSV columns 3–4 all rows; `CAMPAIGN-PLAN.md` §6 quality gate.
- GainUtility URL: n/a (tracking sheet).
- Asset required: Ahrefs (or equivalent) account access.
- Internal links: n/a.
- Target opportunities: all 78 rows.
- Priority: P0 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition (campaign quality).

**G-02 — Evidence re-pull and CSV repair**
- Action: re-pull live quotes for TOP-20 #4/#5; repair CSV row 78 (shifted columns) and row 60 (truncated note); re-align `OUTREACH-TEMPLATES.md` row citations to the current CSV (Template 2's row 15 reference points at a monitor-only target; Template 3's rows 6–10 are not libguides).
- Why: an email quoting a page from memory reads as mail-merge; wrong row references send the wrong template to the wrong target.
- Source evidence: §0 findings 8, 9, 11.
- GainUtility URL: n/a (working files).
- Asset required: none.
- Internal links: n/a.
- Target opportunities: TOP-20 #4, #5; template selection accuracy across all sends.
- Priority: P0 · Status: NEEDS VERIFICATION · Purpose: backlink acquisition (quality).

**G-03 — DEV.to technical article**
- Action: create the org account (<10 min per their docs), then publish a genuinely technical article (e.g. how browser-side PDF compression works, or verifying local processing in the network tab) — profile CTA only, no link-drop posts.
- Why: on-topic technical content with contextual links is allowed; promotional posts are removable.
- Source evidence: CSV row 46 rules quote fetched 2026-10-01.
- GainUtility URL: `/pdf` (profile/contextual).
- Asset required: technical article (content work).
- Internal links: article may link hub naturally.
- Target opportunities: DEV.to community/referral.
- Priority: P1 · Status: OWNER ACTION REQUIRED · Purpose: referral traffic, topical authority, backlink acquisition.

**G-04 — Alternative.me + Uneed (free tiers only)**
- Action: submit through alternative.me dashboard and Uneed's free queue (Uneed free wait is 30 days–5 months — enter early). No paid placement anywhere.
- Why: free, open directories with real curation; paid tiers would be purchased links and are excluded.
- Source evidence: CSV rows 50, 52 rules quotes fetched 2026-10-01.
- GainUtility URL: `/`.
- Asset required: submission copy.
- Internal links: n/a.
- Target opportunities: two directory listings (verify rel type when live).
- Priority: P2 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition.

**G-05 — Community answers (value-first, disclosed)**
- Action: from established accounts only, post the prepared drafts (A–D) on verified threads — r/pdf rows 55, 56, 57, 58, 59, 60; r/smallbusiness row 61 (read the live rules first — promotion reportedly confined to a weekly thread); row 62 (only if genuinely warm/helpful); Quora rows 63, 64, 65; Super User rows 66, 67 (lead with the actual command/script — tool mention incidental); HN row 68 (D priority: established non-promotional account only). Disclose affiliation every time; never repeat text; never post before the account is established; check thread lock status first (r/pdf auto-locks old threads).
- Why: these communities accept only complete, non-promotional answers with a disclosed tool mention; that is the only survivable format.
- Source evidence: CSV rows 55–68 (RESEARCHED + OWNER ACTION REQUIRED; fetches hit login walls — open in a browser before posting); `OUTREACH-TEMPLATES.md` Drafts A–D; Quora and Stack Exchange self-promotion policies verified by fetch 2026-10-01.
- GainUtility URL: task-matched destinations per §2 table (`/tools/merge-pdf`, `/tools/pdf-exact-size`, `/tools/split-pdf`, `/tools/optimize-pdf-web`, `/tools/remove-pdf-metadata`).
- Asset required: A-02 file-size guide unlocks Draft B's link (until then: advice only, no link — per the draft's own instruction).
- Internal links: n/a (off-site).
- Target opportunities: community threads — nofollow expected; record Link Type honestly.
- Priority: P1 · Status: OWNER ACTION REQUIRED (plus NEEDS VERIFICATION: live rules + thread state before posting) · Purpose: backlink acquisition, referral traffic.

**G-06 — Digital PR source subscriptions**
- Action: create free expert/source profiles on HARO (A), Connectively (B — verify free tier first), Featured (free start — earned-media features only, never the paid-backlink product), Qwoted (B — check response caps), SourceBottle (C). Harvest 2–3 real query alerts before paying anything; respond only where GainUtility genuinely informs the story.
- Why: journalist queries about remote-work privacy, file sharing, and small-business docs are legitimate expert-source opportunities.
- Source evidence: CSV rows 69–73 rules quotes fetched 2026-10-01.
- GainUtility URL: `/about` (credibility anchor).
- Asset required: founder bio/credibility points; none new.
- Internal links: n/a.
- Target opportunities: earned-media placements (none claimed; response-dependent).
- Priority: P1 · Status: OWNER ACTION REQUIRED · Purpose: backlink acquisition, referral traffic.

**G-07 — Rival-vendor listicle verification, then pitch**
- Action: fetch and verify rows 74–78 (pdf.net, pdnob.com, trulyfreetools.com, toolisthub.com, fynepdf.com) before any contact; pitch only those that are live, relevant and reachable (fynepdf: monitor — competitor-owned comparison hub).
- Why: these rows are RESEARCHED only (search-index evidence); acting on an unfetched page risks quoting content that changed. Rival vendors may only add tools benefiting their comparison — still legitimate editorial targets.
- Source evidence: CSV rows 74–78 Status/Notes.
- GainUtility URL: `/pdf` (A-01 hub when upgraded).
- Asset required: A-01 strengthens.
- Internal links: B-02 first.
- Target opportunities: up to 4 alternatives pages (after verification).
- Priority: P2 · Status: NEEDS VERIFICATION · Purpose: backlink acquisition.

**G-08 — Skip / monitor list (explicit decision, no outreach)**
- Action: do not pitch: AlternativeTo (PDF tools explicitly declined by their FAQ), G2 (B2C excluded), Capterra (403 to bots, B2C likely excluded), SourceForge (522 + OSS requirement), toolfinder.co (paid placement = purchased link), awesome-selfhosted (self-hosted free-license required), linuxlinks and MakeUseOf open-source list (FOSS-only eligibility), Wondershare ES (competitor-owned, low odds), TechTudo (advertising-only channel), Alternative.me paid tiers and Uneed paid tiers (paid = excluded).
- Why: recording the decision prevents wasted effort and accidental rule-breaking; a directory whose only route is payment leaves the plan.
- Source evidence: CSV rows 7 (MakeUseOf open-source list), 15 (linuxlinks), 35 (Wondershare ES), 38 (TechTudo), 43 (AlternativeTo), 47 (G2), 48 (Capterra), 49 (SourceForge), 51 (toolfinder), 54 (awesome-selfhosted) — rules quotes fetched 2026-10-01; row 53 (py-pdf) gated on A-08; free tiers of rows 50/52 stay in plan via G-04, their paid tiers do not; `CAMPAIGN-PLAN.md` §2.
- GainUtility URL: n/a.
- Asset required: none (A-08 OSS gate governs GitHub rows).
- Internal links: n/a.
- Target opportunities: none — monitor only.
- Priority: P2 · Status: READY (decision recorded) · Purpose: backlink acquisition (risk control).

---

## §6 PHASE 6 — 30-day execution checklist

Cadence rules: **max 5 meaningful outreach actions per day · one contact per domain per week · max 3 emails per thread (Day 0 / +7 bump / +14 close), never a 4th · no send before F-01 passes · build track runs in parallel.** Day 1 starts on the first working day after this backlog is approved. Follow-ups count toward the daily cap.

### Week 1 — Foundations + highest-probability sends

- [ ] Day 1: G-01 Ahrefs import → fill DR/Traffic columns (no estimates)
- [ ] Day 1: G-02 re-pull TOP-20 #4/#5 quotes; repair CSV rows 60/78; re-align template row references
- [ ] Day 1: D-01 locale URL gate — load all six localized destinations once
- [ ] Day 1: F-01 sanity spot-check of all 20 Top-20 target URLs (200s + live quotes)
- [ ] Day 1: CSV imported to the send log (Date Contacted / Follow Up / Response / Link Acquired)
- [ ] Day 2: E-19 SaaSHub submission (owner account, gainutility.com email)
- [ ] Day 2: E-20 Product Hunt account creation (post no earlier than ~Day 8)
- [ ] Day 2: B-01 + B-02 internal-link implementation starts (dev track)
- [ ] Day 2: broken-link batch — E-11 TechSupportAlert, E-12 FreewareGenius, E-13 Globinch (Template 1, 3 sends)
- [ ] Day 3: E-06 USC (Template 3) — 1 send
- [ ] Day 4: E-07 Penn State, E-09 King's (Template 3) — 2 sends
- [ ] Day 5: E-08 URV, E-10 ASU Print Lab (Template 3) — 2 sends
- [ ] Day 6: E-03 Techshali (public editor email), E-04 The Business Dive (submit form, after quote re-pull) — 2 sends
- [ ] Day 7: follow-ups begin on Day-0 sends (7-day bump rule)
- [ ] Week 1 build track: A-04 privacy guide + A-05 PDF↔Word guides outline drafted for review; C-01 free-tier data collected

### Week 2 — Editorial EN + assets

- [ ] Day 8: E-01 TechRadar (after C-01 data ready)
- [ ] Day 9: E-02 MakeUseOf
- [ ] Day 10: E-05 OutrightCRM list pitch (after quote re-pull); guest idea only as second thread later
- [ ] Day 8: E-20 Product Hunt launch (if account mature)
- [ ] Days 8–12: A-04 privacy guide built and published (B-05 launch protocol)
- [ ] Days 9–13: A-05 PDF↔Word guides built and published (B-05)
- [ ] Day 11: G-03 DEV.to technical article drafted (owner publishes)
- [ ] Days 12–14: A-07 benchmark corpus prep begins — results stay private until methodology + runs complete
- [ ] Day 14: day-14 closing emails on all non-responders; B-01/B-02 merged and verified (B-03 done)

### Week 3 — Regional + community

- [ ] Day 15: E-14 Giz (PT-BR tip line)
- [ ] Day 16: E-15 MRW.it (IT)
- [ ] Day 17: E-17 CHIP.de (DE) — D-01 re-check that day's locale URL first
- [ ] Day 18: E-18 wecomm.fr (FR, with French screenshots)
- [ ] Days 15–19: E-16 Kumparan ID contributor article written and submitted
- [ ] Days 18–21: G-05 community answers — Draft A/B on the two hottest r/pdf threads, Draft D on Super User (owner posts, disclosed, live rules re-checked first)
- [ ] Day 19: A-02 file-size guide published (B-05) — unlocks Draft B's link
- [ ] Day 21: mid-campaign audit — replies, live links, dead ends; nothing claimed without a live URL check

### Week 4 — PR + directories + consolidation

- [ ] Days 22–24: G-06 digital-PR responses — only where GainUtility genuinely informs the story
- [ ] Days 22–26: G-04 Alternative.me + Uneed free-queue submissions; G-03 DEV.to article live
- [ ] Days 25–28: day-14 final closing emails on remaining non-responders (never a 4th)
- [ ] Day 26: A-03 compression-guide upgrade published (B-05, includes localized updates)
- [ ] Days 28–30: full CSV audit — every row has a status; every claimed link re-verified live; DR/Traffic still only from real exports
- [ ] Days 28–30: month-1 report written from the measurement framework (§10); non-responders and B/C-tier rows roll into month 2; G-07 rival-vendor verification completed for month 2 planning

**Outreach volume guardrail:** CAMPAIGN-PLAN projects 30–40 sends in month 1 — a ceiling, not a target. The campaign is not successful because emails went out; it is successful when §10 shows responses, verified links, referral visits, and index/traffic movement.

---

## §7 PHASE 7 — Pre-outreach sanity check (F-01)

- **Action:** For every target URL, run the full checklist below and record pass/fail before any email, submission, or community post references it. A backlink is never sent to an unfinished or weak page.
- **Why it matters:** one 404, placeholder page, or wrong canonical in a first-contact email ends the thread and the relationship.
- **Source evidence:** TOP-20 header (all 20 target URLs confirmed in `sitemap.xml` 2026-10-01); this backlog's §0 findings; `LINKABLE-ASSETS.md` §9.
- **GainUtility page/URL:** all URLs in the destination table (§2) plus all community destinations.
- **Asset/content required:** none (verification only).
- **Internal links required:** items 8–9 below are part of the check.
- **Target backlink opportunities:** gates all E-, D-, G-series actions.
- **Priority:** P0
- **Status:** NEEDS VERIFICATION
- **Expected purpose:** backlink acquisition, internal authority flow

### Per-URL checklist (all 14 points)

1. [ ] Page exists (loads without 404/redirect)
2. [ ] Page is indexable where appropriate (no accidental `noindex`)
3. [ ] Canonical is correct (self-referencing on the pitched URL)
4. [ ] Hreflang correct where localized (and never an `es-co` URL)
5. [ ] Title is natural (no stuffing, matches the page)
6. [ ] H1 is clear and singular
7. [ ] Content actually satisfies the intended query (read it as the visitor would)
8. [ ] Internal links work (tool → guide → hub chain resolves)
9. [ ] Related tools work (process a real file end-to-end)
10. [ ] Mobile layout works
11. [ ] Page loads correctly (no console errors, no blank sections)
12. [ ] No placeholder or unfinished content
13. [ ] No broken links on the page
14. [ ] Evidence quote for that prospect still appears live (re-pull the same day as the send)

### Destination URL readiness (as verified so far)

| Destination | State (2026-10-01) | Remaining check |
|---|---|---|
| `/` , `/about` | in sitemap; prerendered | points 1–14 spot-check |
| `/pdf`, `/pdf/best`, `/pdf/compress`, `/tools` | in sitemap; prerendered | B-02 link blocks pending (SITE CHANGE) |
| `/tools/merge-pdf`, `/tools/ocr-pdf`, `/tools/pdf-to-word`, `/tools/split-pdf`, `/tools/jpg-to-pdf`, `/tools/compress-images-inside-pdf`, `/tools/pdf-exact-size`, `/tools/remove-pdf-metadata`, `/tools/optimize-pdf-web` | in sitemap; prerendered | B-01 tool→guide links pending (SITE CHANGE) |
| `/blog/how-to-compress-a-pdf` (+ 20 other articles) | in sitemap; prerendered | B-03 verification pending |
| `/pt-br/`, `/de/`, `/fr/`, `/it/`, `/id/`, `/es-mx/` + `/blog/how-to-compress-a-pdf` | in sitemap (336 localized URLs); correct hreflang confirmed on prerendered output | D-01 manual load of each pitched locale |
| New assets (A-02, A-04, A-05, A-06, A-07) | do not exist | not pitchable until B-05 launch protocol completes |

**Rule:** `Link Acquired` in the CSV stays empty until a live, fetched URL confirms it; `Link Type` records rel attributes honestly (nofollow editorial links reported separately, never hidden).

---

## §8 Prioritized asset-building sequence

| Order | Asset | Backlog | Depends on | Unblocks |
|---|---|---|---|---|
| 1 | Privacy Guide (`/blog/are-online-pdf-tools-safe`) | A-04 | nothing — content only | Reddit/Quora privacy answers, USC angle, HowToGeek thread |
| 2 | PDF↔Word guides (2 articles) | A-05 | nothing — content only | FreewareGenius #12, OCR-adjacent pitches, TechRadar editor list |
| 3 | Free-tier limit research | C-01 | source checking | hub comparison strip, TechRadar #1, MakeUseOf #2 |
| 4 | File Size Guide (`/blog/pdf-file-size-limits`) | A-02 | own test data (tier chart) | Penn State #7, ASU #10, Quora/Reddit size threads, Draft B link |
| 5 | PDF Tools Hub upgrade | A-01 | C-01 data | Techshali #3, Business Dive #4, OutrightCRM #5, URV #8, rival-vendor rows |
| 6 | Compression Guide upgrade (+ localized) | A-03 | own before/after examples | regional pitches #14–#18 credibility, Penn State/ASU depth |
| 7 | Troubleshooting expansion (start with 2 articles) | A-06 | community-answer tracking | Super User/Quora answer targets |
| 8 | Benchmark study | A-07 | test corpus + runs + new route | flagship PR asset for #1/#2/#3 and digital PR |
| 9 | OSS feasibility decision | A-08 | owner decision | GitHub list placements — or their permanent removal from the plan |

Every publication follows the **B-05 launch protocol** (sitemap + hub link + breadcrumb/FAQ schema + related-article entries + locale gating). Nothing in this sequence exists to attract a link by itself — each item must stand alone as useful to a reader who arrived with no link behind them.

## §9 Prioritized internal-linking sequence

| Order | Change | Backlog | Status | Why this order |
|---|---|---|---|---|
| 1 | Tool → guide links on PDF tool pages, then all 140 tools | B-01 | SITE CHANGE REQUIRED | cheapest change; every existing pitch target lands on a tool page |
| 2 | PDF hub family → guide link blocks (`/pdf`, `/pdf/compress`, …) | B-02 | SITE CHANGE REQUIRED | hubs are the pitch destination for #3/#4/#5/#8; mechanism already exists |
| 3 | Guide → tool + hub audit (stale/redirected CTA URLs) | B-03 | NEEDS VERIFICATION | must confirm before any guide is pitched as a destination |
| 4 | Related-article chain coverage across the PDF cluster | B-04 | NEEDS VERIFICATION | keeps link-arriving readers in-cluster |
| 5 | Breadcrumb + FAQ schema confirmation on guides | B-03/B-05 | NEEDS VERIFICATION | already present on guides; verify per page |
| 6 | Launch wiring for each new asset | B-05 | SITE CHANGE REQUIRED | runs with each §8 publication, not before (nothing to wire yet) |
| 7 | HowTo schema on genuinely sequential guides | B-06 | SITE CHANGE REQUIRED | optional; after content settles |

Sequence rule: **1 → 2 must complete before any E-series send** (they are the campaign's conversion layer); 3–5 run during Week 1; 6 ships with each asset; 7 is post-campaign polish.

## §10 Measurement framework

**Principle:** success is not emails sent. Every number below comes from a real source; nothing is estimated, and no target is invented for metrics where no benchmark exists.

### Tracking table (measured only from real sources)

| Metric | Source | Collection method | Cadence | Month-1 target |
|---|---|---|---|---|
| Opportunities contacted | CSV `Date Contacted` | send log | daily | 30–40 (ceiling from CAMPAIGN-PLAN, not a goal) |
| Responses | CSV `Response` | reply log | weekly | report actual % — no invented benchmark |
| Positive responses | CSV `Response` (classified yes/interested/neutral/no) | manual classification | weekly | report actual count |
| Links acquired | CSV `Link Acquired` + **live fetch check** (page live, outbound 200, rel type known) | manual verification | weekly | report actual count only |
| Live dofollow links | CSV `Link Type` verified | manual verification | monthly (re-verify — links die) | report actual |
| Referring domains | Ahrefs export + Search Console Links | tool export | monthly | report actual |
| Referral visits | site analytics referrer report | weekly export | weekly | report actual |
| Indexed pages (new assets) | Search Console Pages-indexed | coverage check after each publish | weekly post-launch | all published assets indexed |
| Impressions | Search Console Performance | export | weekly | report actual |
| Clicks | Search Console Performance | export | weekly | report actual |
| Rankings | Search Console queries / rank tracker for target queries | export | biweekly | report actual |
| Conversions / tool usage | site analytics events | confirm event tracking exists first | weekly | report actual; if no event source exists, record `NEEDS VERIFICATION` rather than a number |
| Community answers posted | owner post log | manual | weekly | 3–5 disclosed, value-first |
| Assets shipped | build log (§8) | manual | weekly | sequence 1–4 |

### What produced actual responses (qualitative log)

At each weekly review, tag every contact in the CSV Notes column with: angle used (broken-link / editorial suggestion / resource inclusion / regional / community / directory), asset referenced (existing vs A-series), and personalization level. The Week-4 report answers three questions with evidence: which angle produced replies, which produced verified links, which produced referral visits — and which produced neither, so month 2 drops it.

### Quality gates (never waived)

- A link counts only if: page is live, our outbound URL returns 200, and the rel type is known.
- Nofollow editorial links are reported separately, never hidden and never dressed up as "authority."
- DR/Traffic figures come only from real tool exports.
- No metric in any report is estimated, rounded up, or projected forward as fact.
- Directory/PH listings are reported as "live" only after a manual browser check.

---

## STOP

This document is the review deliverable. **No production site code has been modified** — no routes, no content, no internal links, no schema. The next step is your review of this backlog; implementation of any `SITE CHANGE REQUIRED` or `CONTENT REQUIRED` entry begins only after sign-off, in the sequences in §8 and §9.

Reminder of the operating constraint: we are building GainUtility's authority by creating genuinely useful resources and earning relevant mentions — not by manufacturing backlinks.
