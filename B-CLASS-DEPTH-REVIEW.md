# B-Class Depth Review — Phases 1–6 (B1–B4)

Date: 2026-09-22 · Source: `INDEX-READY.csv` (343 rows; B=239) + measured `<main>`/body words from `dist/client` · No mass regeneration.

## Decision framework

| Code | Meaning | Indexation decision |
|---|---|---|
| **B1** | Keep indexable — depth adequate after Batch 1 (accordions in DOM) | INDEX |
| **B2** | Needs improvement before indexing | IMPROVE THEN INDEX |
| **B3** | Consolidate into another URL | CONSOLIDATE |
| **B4** | Weak — exclude | EXCLUDE |

Classification used evidence (structure, uniqueness, duplicate risk, measured words), not word count alone.

---

## Results: B1=160 · B2=79 · B3=0 · B4=0 (239 total)

### B1 — keep indexable (160)

| Slice | n | Evidence |
|---|---:|---|
| EN tool pages (Low duplicate risk) | 125 | mainWords median ~364 (min 266); steps/limitations in prerendered DOM 136/136; unique score mostly 80–98; How-to + Limitations present |
| Hub / SEO subpages (`/pdf`, `/json/formatter`, `/dev/base64`, …) | 19 | 195–412 body words; unique 84–93; Low dup; titles distinct from tool pages (hub = category landing, tool = specific utility); embedded tool = real functionality |
| Comparison (`/compare/*`) | 9 | 265–375 words; unique 95–100; Low dup; distinct A-vs-B intent |
| Category best (`*/best`) | 6 | 175–330 words; unique 84–94; Low dup; list intent distinct from tool pages |
| `/creator` | 1 | 479 words; unique 93 |

**Action:** stay in sitemap as-is. Optional later depth polish on `/css/best` (175w) — not a blocker.

### B2 — needs improvement (79)

| Slice | n | Blocker | Action |
|---|---:|---|---|
| EN tools with Medium duplicate risk | 11 | Intent overlap vs hub/alias siblings (e.g. `base64-tool` vs `/dev/base64`, `merge-pdf` vs `/pdf/merge`, `extract-even/odd-pages-pdf`) | Differentiate intro/examples; re-score after |
| Localized tool pages (de/es-mx/fr/id/it/pt-br) | 58 | **Human-review blocker:** H1/UI/breadcrumbs localized, **long-form SEO body still English** (verified in `de/es-mx/fr` samples); unique avg 62 (50–76); dup Medium 55/58 | Localize body copy, or noindex until localized — requires human translation pass (no AI filler) |
| Translator pairs (`/tools/pdf-translator/*`) | 10 | Prerendered `<main>` = H1 only (5 words); body is Suspense skeleton (73 root words total) | **Preferred:** SSR pair body (breadcrumbs/H1/useCases/FAQ already in `TranslatorPairPage`) · **Fallback:** CONSOLIDATE into `/tools/pdf-translator` |

### B3 — consolidate (0)

No B page recommended for merge. Prior C-set aliases already 301 (`json-formatter/viewer/compare`, image aliases, `merge-selected-page-ranges`).

### B4 — weak / exclude (0)

No B page recommended for exclusion. Color pages (151) and es-CO (20) are outside the B set (already sitemap-excluded; es-CO now also noindexed).

---

## Localized body-English detail (largest B2 slice)

Sampled prerendered bodies:

- `/de/tools/base64-tool` — H1 "Base64-Tool" + German chrome; **"A binary-safe converter supporting dual-mode…"** English body.
- `/es-mx/tools/unir-pdf` — Spanish H1/chrome; **"Combine several PDFs into one file…"** English body.
- `/fr/tools/fusionner-pdf` — French H1/chrome; same English body.

Counts: de=8, es-mx=10, fr=10, id=10, it=10, pt-br=10 (58). This is a content-quality blocker for non-EN users and a thin-dup risk vs EN sources — **not fixable without human localization.**

## Translator-pair detail

`english-to-french.html` (and all 10 pairs): `<main>` ≈ 5 words (H1), no H2/H3 in SSR HTML; hydrates client-side. index-audit reason: `thin prerender, consolidate`. Decision: B2 with SSR fix preferred; fold-in only if SSR is rejected.

## EN Medium-dup tools (11)

`base64-tool`, `box-shadow-generator`, `contrast-checker`, `extract-even-pages-pdf`, `extract-odd-pages-pdf`, `image-converter`, `json-beautifier`, `merge-pdf`, `slug-generator`, `youtube-keyword-explorer`, `youtube-thumbnail-preview`.

Each still has unique FAQ/steps; B2 is about **intent differentiation vs hub/alias siblings**, not deletion.

## Deliverable

Per-URL decisions (all 343 rows): `FINAL-INDEXATION-CLASSIFICATION.csv` (columns: URL, STATUS, INDEXATION DECISION, CONTENT QUALITY, DUPLICATE RISK, UX STATUS, SEO STATUS, REASON, ACTION, Prior class, B subclass, …).
