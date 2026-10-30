# Phase 7 — Category Quality Gate + GSC Open Items

Date: 2026-09-22 · Gate criteria: technical SEO clean · content honest (no AI filler) · UX functional per static analysis · indexation decision explicit per URL.

## 1. Quality gate by category

| Category | URLs (sitemap) | Technical SEO | Content quality | UX | Verdict |
|---|---:|---|---|---|---|
| Static/home | 12 | PASS (audit-seo) | PASS | PASS (prior QA) | **GATE PASS** |
| EN tool pages | 136 | PASS; How-to+Limitations 136/136; Related Tools = 1 section | PASS for 125 (B1); 11 Medium-dup → B2 differentiation | Functional (prior QA); static CSS only this pass | **GATE PASS w/ 11 B2** |
| Translator pairs | 10 | PASS head/canonical; **thin prerender** | FAIL thin SSR | Hydrates client-side | **GATE FAIL → B2 SSR** |
| Hub/subpages | 19 | PASS | PASS (unique 84–93) | Embedded tool works | **GATE PASS** |
| Compare | 9 | PASS | PASS (unique 95–100) | Links + copy | **GATE PASS** |
| Best | 6 | PASS | PASS (slightly light on `/css/best`) | List UX fine | **GATE PASS** |
| Localized tools | 58 in-sitemap | PASS head/canonical/hreflang | **Body English** (human localization blocker) | Chrome localized | **GATE FAIL → B2** |
| Localized hubs/static/blog | 60 | PASS | PASS (A-class) | PASS | **GATE PASS** |
| Blog | 19 | PASS | PASS | PASS | **GATE PASS** |
| Color pages | 0 in sitemap | Live, no noindex; sitemap-excluded by decision | Thin (~89w) | N/A | **OUT OF GATE** (excluded) |
| es-CO | 0 in sitemap | **Now noindexed** + hreflang removed | Exact es-mx dup (4% unique) | N/A | **OUT OF GATE** (noindex) |

## 2. Improvements landed this continuation

- es-CO: `buildPageMeta` forces `noindex`; both hreflang builders drop `es-co`; audit-seo treats es-CO noindex as intentional (required, not accidental).
- `SeoPageEntry.limitations` now rendered on hub pages + `hub.sectionLimitations` i18n ×8.
- `seoEntryToMetadata` wires `troubleshooting`/`mistakes` into tool accordions (prior edit, this session).
- Font detector: bbox scale-invariant width, baseline-run serif, inverted handwriting, commercial fonts in match pool, Likely-gating (hasText + ≥4 chars + ≥8 margin), no-text capped to Similar, Free/Paid labels, honesty copy (typo, x-height, percentage, “Fonts on page”). Sim: `scripts/font-detector-sim.mjs` → **19/19 PASS**.
- `传输` corruption cleared from `src/seo` (0 matches).

## 3. GSC issues — OPEN ITEMS (cannot close without owner export)

| # | GSC signal | Count | Status |
|---|---|---:|---|
| 1 | Discovered — currently not indexed | ~480 | Expected on prior thin profile; re-request **after** B2 work + build deploy — not before |
| 2 | Crawled — currently not indexed | 4 | **OPEN:** need export to map URLs |
| 3 | Indexed | ~24 | Baseline; expect growth post B1 deploy |
| 4 | Redirect | 8 | **OPEN:** 8 URLs not derivable from build — need GSC coverage export |
| 5 | Not found (404) | 2 | **OPEN:** same export required |
| 6 | Alternate page with proper canonical | 1 | **OPEN:** same export required |

**Hard open item:** `GSC export required from site owner` (Coverage / Pages CSV). No GSC export file exists in the repo.

## 4. Do-not-do (confirmed)

- No bulk sitemap submit until B2 blockers clear (translator SSR + localized bodies or explicit owner sign-off to ship as-is).
- No AI-filler page regeneration.
- No sitemap/redirect changes beyond evidence already applied (es-CO noindex was evidence-based: exact duplicate).

## 5. Gate summary

| Axis | Status |
|---|---|
| Technical SEO | **PASS** (pending post-build audit re-run — Phase 9) |
| Content quality | **PASS for INDEX set; FAIL for 79 B2 URLs** |
| UX | **PASS (static analysis only)** — no browser automation available; honesty note required in final report |
| Indexation readiness | **READY for 250 INDEX URLs (90 A + 160 B1); 79 B2 blocked** |
| GSC issues | **3–4 OPEN ITEMs await owner export** |
| Human review required | Localized body translation (58); EN Medium-dup differentiation (11); translator SSR choice (10) |
