# NAMING-BEFORE-AFTER — Phase 6 tool naming + UX pass

Scope: names a user actually reads — tool registry `name` (H1 + card title + JSON-LD
name), SEO `title` (browser tab / SERP), and the in-page selector label. URLs and
slugs are unchanged.

## Audit

Command (run against the built site):

```
node scripts/url-inventory.mjs   # H1 + title per route
```

| Check | Result |
|---|---|
| Routes audited (EN, in sitemap, indexable) | 241 |
| Duplicate H1s | **0** |
| Tool pages with < 2 slug words in the H1 | 2 of 148 |
| Titles < 30 chars | 3 (kept — see below) |
| Keyword cannibalisation between two tool pages | none found |

## Changed (before → after)

| URL | Field | Before | After |
|---|---|---|---|
| `/tools/exam-signature-fixer` | H1 + card name (`src/toolsRegistry.tsx:856`, `src/components/exams/ExamSelector.tsx:37`) | Signature Resizer | Exam Signature Resizer |
| `/tools/exam-signature-fixer` | title (`src/seo/extraExams.ts:114`) | Signature Resizer — Clean, Resize & Compress Your Signature (59) | Exam Signature Resizer — Clean, Resize & Compress (49) |
| `/tools/json-compare-diff` | title (`src/data.ts:782`) | Compare JSON Tool (17) | Compare JSON — Side-by-Side Diff Tool (37) |

Rationale:

- **Exam Signature Resizer** — the tool sits in a family (`Exam Photo Resizer`,
  `Thumb Impression Resizer`, `exam-file-requirements`) and the slug says *exam*.
  "Signature Resizer" was the only member with no qualifier, so it neither matched
  its URL nor its siblings. The H1, the card label and the selector chip now agree.
- **Compare JSON — Side-by-Side Diff Tool** — 17 characters was the shortest title
  on the site and named no benefit. The new title keeps the exact keyword pair and
  states what the page does.

## Reviewed and deliberately left alone

| URL | H1 | Why no change |
|---|---|---|
| `/tools/reduce-pdf-image-quality` | Compress PDF | Strongest head term for the page, and no other tool on the site targets "Compress PDF" (verified: no `/tools/compress-pdf` exists). The slug wording is carried by the description. |
| `/tools/gradient-generator` | CSS Gradients | "Zero slug-word overlap" is a false positive of the overlap metric — the tool generates CSS gradients, and the H1 says exactly that. |
| `/tools/og-meta-generator` | Open Graph Generator | *og* = *Open Graph*. The H1 spells out the acronym the slug abbreviates. |
| `/tools/json-to-csv` | JSON to CSV Converter Online (28) | Short but complete and accurate; no benefit statement was invented to pad it. |
| `/changelog` | Changelog — GainUtility | Internal page, no search intent to target. |

33 tool pages have two-word H1s (e.g. "Merge PDF"); all of them are noun-phrase
tool names that read correctly, so they were not touched.

## Verification

```
npm run lint                         # tsc --noEmit, clean
npm run build                        # 808 HTML files
node scripts/url-inventory.mjs       # EN titles>60: 0, descs>160: 0
node scripts/verify-seo-signals.mjs  # 11/11 — includes "exactly one H1" on 581 pages
node scripts/audit-seo.mjs           # AUDIT PASS: no issues found
```

Duplicate H1s after the change: **0**.
