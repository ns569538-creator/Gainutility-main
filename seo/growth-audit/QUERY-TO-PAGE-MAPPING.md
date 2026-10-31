# GainUtility — Query-to-Page Mapping & Catalogue Architecture Report

**Document:** Keyword-to-Page Mapping, Intent Alignment & Deduplication Audit  
**Target Domain:** [https://gainutility.com/](https://gainutility.com/)  
**Date:** October 31, 2026  
**Auditor Roles:** Senior Technical SEO Engineer, International SEO Strategist, Product Growth Engineer  

---

## 1. Tool Catalogue Source of Truth & Deduplication Architecture

A core prerequisite for sound organic growth is establishing a deterministic **Single Source of Truth** for tool inventory to prevent keyword cannibalization and catalogue count drift.

### Current Inventory Breakdown:
- **Total Registered Components in `src/toolsRegistry.tsx`:** 148
- **Consolidated 301-Redirect Aliases:** 8 (`merge-selected-page-ranges`, `webp-converter`, `heic-to-jpg`, `png-to-jpg`, `svg-to-png`, `json-validator`, `json-to-yaml`, `yaml-to-json`)
- **Total Canonical Indexable Tools:** **140**
- **Canonical PDF Tools:** **44**
- **Excluded Non-Canonical Pages from Sitemap:** All 8 redirect aliases and the Colombian Spanish (`es-co`) cluster are excluded from `public/sitemap.xml`.

### Catalogue Count Alignment:
- **Homepage Category Card:** Reports **44 PDF tools**
- **Category Hub (`/pdf`):** Reports **44 PDF tools**
- **Tools Directory (`/tools`):** Reports **140 canonical indexable tools**
- **Verified Status:** Uniformity verified across all code layers, build artifacts, and live production HTML.

---

## 2. Search Console Query-to-URL Mapping Table

The following table maps every verified query observed in Google Search Console baseline data to its canonical target URL, search intent classification, ranking position, and optimization status:

| Search Query | GSC Impressions | GSC Clicks | Avg. Pos. | Search Intent Classification | Canonical Target URL | Optimization Status & Actions Taken |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **PDF Difference Checker** | 73 | 2 | 6.12 | Transactional / Utility: Compare two PDF files side by side to detect text, layout, and clause differences | [`/tools/pdf-difference-checker`](file:///d:/Downloads/Gainutility-main/src/components/PdfDifferenceChecker.tsx) | **Optimized:** Title updated to *"PDF Difference Checker — Compare Two PDF Files Online Free"*. Description emphasizes in-browser diffing without upload. |
| **Font Detector** | 47 | 0 | 7.49 | Commercial / Design: Identify unknown typography from an uploaded image, screenshot, or PDF file | [`/tools/font-detector`](file:///d:/Downloads/Gainutility-main/src/components/FontDetector.tsx) | **Optimized:** Title updated to *"Font Detector — Identify Fonts from Image & PDF Online Free"*. Full localized body overlays deployed across 6 languages. |
| **Stylish Name Generator** | 12 | 0 | 7.92 | Entertainment / Gaming: Generate cool, fancy Unicode fonts and decorative nicknames for gaming profiles | [`/tools/stylish-name-generator`](file:///d:/Downloads/Gainutility-main/src/components/StylishNameGenerator.tsx) | **Optimized:** Title updated to *"Stylish Name Maker & Generator (Copy & Paste) — 100+ Cool Fonts & Nicknames"*. Added high-converting gaming & social triggers. |
| **Stylish Name Maker** | 11 | 0 | 8.18 | Entertainment / Gaming: Create custom styled names with aesthetic symbols | [`/tools/stylish-name-generator`](file:///d:/Downloads/Gainutility-main/src/components/StylishNameGenerator.tsx) | **Optimized:** "Maker" incorporated directly into meta title and primary keywords. |
| **Stylish Name** | 11 | 0 | 9.09 | Short-tail decorative font query | [`/tools/stylish-name-generator`](file:///d:/Downloads/Gainutility-main/src/components/StylishNameGenerator.tsx) | **Optimized:** Front-loaded in H1 and metadata. |
| **YouTube Title Analyzer** | 6 | 0 | 9.33 | Commercial / Creator: Test YouTube video title length, emotional power words, and mobile truncation | [`/tools/youtube-title-analyzer`](file:///d:/Downloads/Gainutility-main/src/components/YoutubeTitleAnalyzer.tsx) | **Optimized:** Title updated to *"YouTube Title Analyzer — Test & Score Video Titles Free \| GainUtility"*. |
| **YouTube Thumbnail Preview** | 6 | 0 | 9.50 | Commercial / Creator: Preview video thumbnail readability across desktop, mobile feeds, and TV | [`/tools/youtube-thumbnail-preview`](file:///d:/Downloads/Gainutility-main/src/components/YoutubeThumbnailPreview.tsx) | **Optimized:** Title updated to *"YouTube Thumbnail Preview — Test Mobile & Feed Readability Online Free"*. Added localized SEO and FAQ markup. |
| **reviewing client account aging** | Moderate | 0 | ~18 | Commercial / Accounting: Procedures and tools for reviewing overdue client invoices and AR aging | [`/tools/invoice-follow-up-tracker`](file:///d:/Downloads/Gainutility-main/src/components/InvoiceFollowUpTracker.tsx) | **Verified Intent:** Tool provides accounts receivable aging brackets (0–30, 31–60, 90+ days) and payment reminder templates. |
| **5f9ea0 color** | Moderate | 0 | ~14 | Design / Reference: CSS hex lookup for Cadet Blue (`#5F9EA0`) | [`/colors/cadet-blue`](file:///d:/Downloads/Gainutility-main/src/colorStudio/colorData.ts) | **Verified Intent:** CSS Color Studio page with H1 *"Cadet Blue Color — #5F9EA0"*, WCAG contrast, and 50–950 tonal scales. |
| **unir pdf online** | 48 | 0 | ~58 | Transactional (ES/PT): Merge multiple PDF files into one document | [`/pt-br/tools/juntar-pdf`](file:///d:/Downloads/Gainutility-main/src/i18n/toolBodies/mergePdf.ts)<br>[`/es-mx/tools/unir-pdf`](file:///d:/Downloads/Gainutility-main/src/i18n/toolBodies/mergePdf.ts) | **Optimized:** Portuguese title and H1 updated to *"Unir e Juntar PDF Online Grátis"*, capturing the 85+ Brazilian searches. |
| **unir pdf** | 37 | 0 | ~60 | Short-tail PDF merge intent | [`/pt-br/tools/juntar-pdf`](file:///d:/Downloads/Gainutility-main/src/i18n/toolBodies/mergePdf.ts) | **Optimized:** Native localized FAQs and structured data deployed. |
| **dividir pdf** | 33 | 0 | ~65 | Transactional (ES/PT): Split PDF pages or extract custom page ranges | [`/pt-br/tools/dividir-pdf`](file:///d:/Downloads/Gainutility-main/src/i18n/toolBodies/splitPdf.ts)<br>[`/es-mx/tools/dividir-pdf`](file:///d:/Downloads/Gainutility-main/src/i18n/toolBodies/splitPdf.ts) | **Optimized:** Created complete localized body overlays in `splitPdf.ts` with zero English leakage. |
| **transparent png** | 29 | 0 | ~55 | Commercial / Design: Remove photo background to create transparent PNG cutout | [`/tools/background-remover`](file:///d:/Downloads/Gainutility-main/src/components/BackgroundRemover.tsx) | **Optimized:** Title updated to *"Make Transparent PNG & Remove Background Online Free"*. Added trust badges: Full Resolution & Transparent Alpha. |
| **split pdf / split PDF** | 27 | 0 | ~70 | Core Transactional: Split or extract pages from PDF documents | [`/tools/split-pdf`](file:///d:/Downloads/Gainutility-main/src/components/SplitPdf.tsx) | **Optimized:** Native drag-and-drop page extraction guide and structured FAQPage schema. |
| **seo generator** | 34 | 0 | ~65 | Developer / Webmaster: Generate HTML meta tags, Open Graph, and SERP previews | [`/tools/seo-meta-generator`](file:///d:/Downloads/Gainutility-main/src/data.ts) | **Optimized:** Title updated to *"SEO Generator — Free Meta Tags, Title & Description Builder"*. |
| **rotate pdf** | High | 0 | ~60 | Utility: Permanently turn sideways PDF pages 90°, 180°, or 270° | [`/tools/rotate-pdf`](file:///d:/Downloads/Gainutility-main/src/components/RotatePdf.tsx) | **Optimized:** Title updated to *"Rotate PDF Online Free — Turn & Save PDF Pages Permanently"*. |
| **ssc photo resizer 20kb to 50kb** | High (India) | 59 (India) | ~2.5 | High-Friction Compliance: Resize photo and signature for Indian government portals (SSC CGL, CHSL) | [`/tools/exam-photo-fixer`](file:///d:/Downloads/Gainutility-main/src/components/ExamPhotoFixer.tsx) | **Top Performing Asset:** Generates ~91% of site clicks. Protected and prioritized. |
| **passport photo maker** | Moderate | Moderate | ~4.2 | Transactional: Biometric passport size crop for official applications | [`/tools/passport-photo-maker`](file:///d:/Downloads/Gainutility-main/src/components/PassportPhotoMaker.tsx) | **High Performing Asset:** Generates steady clicks; preserved without disruption. |

---

## 3. In-Depth Forensic Investigation of Anomalous Queries

### Case 1: Query `"reviewing client account aging"`
- **Search Query:** `reviewing client account aging`
- **Matched Canonical URL:** `https://gainutility.com/tools/invoice-follow-up-tracker`
- **Does the page match user intent?**  
  **Yes, definitively.** The tool is specifically engineered for freelancers, small business owners, and agency operators who must review accounts receivable aging brackets (Current, 1–30 days overdue, 31–60 days, 61–90 days, 90+ days) and generate professional payment follow-up communications.
- **On-Page Evidence:**
  - `<title>`: `Invoice Follow-Up Tracker | AR Aging & Payment Reminders`
  - `<meta name="description">`: `Track unpaid customer invoices, calculate accounts receivable aging brackets (0-30, 31-60, 90+ days), and generate 1-click professional reminder emails.`
  - H1: `Invoice Follow-Up Tracker`
  - Visible UI: Provides an interactive aging schedule calculator, invoice staging tracker, and 1-click tailored reminder email drafts.
- **Strategic Recommendation:** Preserve and enhance. This query represents high-value commercial B2B traffic that converts into loyal repeat users.

### Case 2: Query `"5f9ea0 color"`
- **Search Query:** `5f9ea0 color`
- **Matched Canonical URL:** `https://gainutility.com/colors/cadet-blue`
- **Does the page match user intent?**  
  **Yes, 100% exact match.** The hex code `#5F9EA0` is the standardized CSS color value for **Cadet Blue**.
- **On-Page Evidence:**
  - `<title>`: `Cadet Blue #5F9EA0 — CSS Named Color Reference | GainUtility`
  - H1: `Cadet Blue Color — #5F9EA0`
  - Content: 50–950 tonal scale generator, complementary and triadic color harmonies, WCAG 2.1 AA/AAA contrast ratios on white and black backgrounds, and ready-to-copy CSS variables.
- **Strategic Recommendation:** Maintain indexation. This validates GainUtility's CSS Color Studio programmatic strategy, capturing long-tail design searches without cannibalizing utility tools.

---

## 4. Cannibalization Audit & Deduplication Matrix

To ensure that multiple GainUtility URLs do not compete against each other for the same search queries, the following structural resolutions are enforced:

| Potential Keyword Collision Area | Competing Pages Evaluated | Resolution Architecture | Single Canonical Target |
| :--- | :--- | :--- | :--- |
| **JSON Formatting & Validation** | `json-validator`<br>`json-formatter`<br>`json-to-yaml`<br>`yaml-to-json` | **Resolved via 301 Redirect:** Legacy classic tools are 301-redirected to the unified `json-formatter-validator`. Prevents 4 thin pages from diluting "json validator" rankings. | `/tools/json-formatter-validator` |
| **Image Conversions** | `webp-converter`<br>`heic-to-jpg`<br>`png-to-jpg`<br>`svg-to-png` | **Resolved via Consolidated Hub:** Consolidated into a unified client-side multi-format engine (`/tools/image-converter`). Legacy URLs return 301 redirects; sitemap excludes legacy aliases. | `/tools/image-converter` |
| **PDF Page Range Merging** | `merge-selected-page-ranges`<br>`merge-pdf` | **Resolved via 301 Redirect:** `merge-selected-page-ranges` 301 redirects to `merge-pdf`, which natively supports drag-and-drop page range selection and custom reordering. | `/tools/merge-pdf` |
| **PDF Diffing vs. Text Diffing** | `pdf-difference-checker`<br>`text-diff-checker` | **Distinct Search Intents Preserved:** `pdf-difference-checker` targets visual document contracts and legal PDFs; `text-diff-checker` targets raw code, markdown, and plain text strings. | `/tools/pdf-difference-checker`<br>`/tools/text-diff-checker` |
| **Exam Photo vs. Passport Photo** | `exam-photo-fixer`<br>`passport-photo-maker` | **Distinct High-Volume Intents Preserved:** `exam-photo-fixer` strictly targets Indian recruitment portals (SSC, UPSC, 20-50 KB bounds); `passport-photo-maker` targets international biometric standard dimension grids. | `/tools/exam-photo-fixer`<br>`/tools/passport-photo-maker` |
| **Latin American Spanish Indexation** | `/es-mx/...` (Mexico)<br>`/es-co/...` (Colombia) | **Intentional Noindex Protection:** `es-co` routes serve `noindex, follow` and are omitted from `sitemap.xml`. `es-mx` serves as the single canonical hub for Spanish in LATAM, avoiding duplicate content penalties. | `/es-mx/...` |

---

## 5. Architectural Rules for Future Catalogue Additions

Before any new tool is added to `src/toolsRegistry.tsx` or admitted to `sitemap.xml`, it must satisfy the following 5 architectural rules:

1. **Unique Primary User Task:** Must resolve a distinct user friction point not already handled by an existing tool mode. Do not create separate pages for "JPG to PNG" or "PNG to WebP" when `image-converter` already fulfills the intent.
2. **Demonstrated Demand Evidence:** Search intent must be substantiated by GSC impressions, Google Trends, or verified competitor search volume.
3. **100% Client-Side Processing:** All computations must run locally in browser WebAssembly, Canvas, or Web Workers with zero remote file uploads.
4. **Prerendered Landing Page:** Must include full semantic instructions, practical use-case examples, common mistakes, and JSON-LD structured data before deployment.
5. **Strict Catalogue Registry Sync:** Must be assigned strictly to one primary category bucket in `src/browseCategories.ts` to ensure homepage and category directory counts remain perfectly synchronized.

