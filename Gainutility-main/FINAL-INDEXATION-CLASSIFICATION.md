# Final Indexation Classification — 343 URLs

Date: 2026-09-22 · Machine-readable: `FINAL-INDEXATION-CLASSIFICATION.csv` · B-depth: `B-CLASS-DEPTH-REVIEW.md` · Gate: `PHASE7-QUALITY-GATE.md`

Decisions use only: **INDEX · IMPROVE THEN INDEX · CONSOLIDATE · REDIRECT · EXCLUDE**.

## Summary

| Decision | Count | Status |
|---|---:|---|
| **INDEX** | **250** | READY (90 A + 160 B1) |
| **IMPROVE THEN INDEX** | **79** | NEEDS IMPROVEMENT (all B2) |
| **EXCLUDE** | **11** | 10 `/studios/color/*` (dup H1, already unsitemapped) + `/404` |
| **REDIRECT** | **3** | Classic JSON tools (301 already live) |
| **CONSOLIDATE** | **0** | — |
| Total | 343 | Prior classes: A=90 B=239 C=13 D=1 |

### B subclass (239)

| Subclass | n | Decision |
|---|---:|---|
| B1 keep indexable | 160 | INDEX |
| B2 needs improvement | 79 | IMPROVE THEN INDEX |
| B3 consolidate | 0 | — |
| B4 weak-exclude | 0 | — |

### B2 breakdown (79)

| Slice | n | Blocker |
|---|---:|---|
| Localized tool bodies still English | 58 | Human translation required |
| Translator pairs thin SSR | 10 | SSR pair body or fold into hub |
| EN tools Medium duplicate risk | 11 | Intent differentiation vs hub/alias |

## CSV columns

`URL, STATUS, INDEXATION DECISION, CONTENT QUALITY, DUPLICATE RISK, UX STATUS, SEO STATUS, REASON, ACTION, Prior class, B subclass, Page type, In sitemap`

STATUS values: `READY` · `NEEDS IMPROVEMENT` · `NEEDS WORK` · `EXCLUDED` · `REDIRECTED`.

## Out of CSV scope (by prior decision)

- 151 color pages — live, sitemap-excluded, no noindex (thin programmatic).
- 20 es-CO pages — live, sitemap-excluded, **noindexed** (exact es-mx duplicate; hreflang removed).
- 5 image aliases + `merge-selected-page-ranges` — 301 to canonical (both URL forms).

## Sitemap impact

- Sitemap stays **329 URLs** — unchanged by this review (no adds/removes from B decisions alone).
- B2 URLs remain in sitemap until improved **or** owner opts to ship as-is; bulk GSC submit still blocked on B2 + GSC export open items.
