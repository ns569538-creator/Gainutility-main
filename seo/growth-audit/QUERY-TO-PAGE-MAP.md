# GainUtility — Phase D: Keyword-to-Page Mapping & Catalogue Architecture

**Catalogue Source of Truth:** `src/toolsRegistry.tsx` & `src/toolsDirectory.ts`  
**Total Registered Components:** 148  
**301-Redirect Consolidated Aliases:** 8  
**Total Canonical Indexable Tools:** 140  
**Audit Status:** Fully mapped, deduplicated, and validated against cannibalization.

---

## 1. Tool Catalogue Audit & Single Source of Truth

A critical finding in Phase D was an inconsistency in catalogue counts across the site:
- **Previous State:** The homepage category card displayed "49 PDF tools", while the `/tools` directory listed 44 PDF tools.
- **Root Cause Analysis:** `src/browseCategories.ts` was including `merge-selected-page-ranges` (a 301-redirect alias) and 4 Indian exam application utilities under the PDF category.
- **Single Source of Truth Established:**
  - `EXCLUDED_TOOL_IDS` was updated in [`src/browseCategories.ts`](file:///d:/Downloads/Gainutility-main/src/browseCategories.ts) to filter out all redirect-only tool IDs.
  - Exam photo and signature tools were consolidated under the **Images** category.
  - **Verified Result:** Exactly **140 canonical indexable tools** and **44 PDF tools** are now reported uniformly across the Homepage, Category Hubs, Tools Directory, and `sitemap.xml`.

---

## 2. Cannibalization Audit & Overlap Resolution

| Potential Overlap Area | Tools Evaluated | Resolution / Architecture | Canonical Target |
| :--- | :--- | :--- | :--- |
| **JSON Tools** | `json-validator`<br>`json-formatter`<br>`json-to-yaml`<br>`yaml-to-json` | **Resolved via 301 Redirect:** Legacy classic tools are 301-redirected to the unified `json-formatter-validator`. Avoids 4 thin pages competing for "json validate online". | `/tools/json-formatter-validator` |
| **Image Conversions** | `webp-converter`<br>`heic-to-jpg`<br>`png-to-jpg`<br>`svg-to-png` | **Resolved via Consolidated Hub:** Consolidated into a multi-format client-side engine supporting batch conversion between PNG, JPG, WebP, HEIC, and SVG. Legacy URLs 301 redirect. | `/tools/image-converter` |
| **PDF Page Range Merge** | `merge-selected-page-ranges`<br>`merge-pdf` | **Resolved via 301 Redirect:** `merge-selected-page-ranges` 301 redirects to `merge-pdf`, which natively supports drag-and-drop page selection and custom range merging. | `/tools/merge-pdf` |
| **PDF Diffing vs Text Diffing** | `pdf-difference-checker`<br>`text-diff-checker` | **Distinct Search Intents:** Preserved as two distinct tools. `pdf-difference-checker` targets visual document contracts; `text-diff-checker` targets raw code and markdown diffs. | `/tools/pdf-difference-checker`<br>`/tools/text-diff-checker` |
| **Exam Photo vs Passport Photo** | `exam-photo-fixer`<br>`passport-photo-maker` | **Distinct High-Volume Intents:** Preserved as separate tools. `exam-photo-fixer` targets Indian exam portals (SSC, UPSC, 20-50 KB limits); `passport-photo-maker` targets international biometric standard passport sizes. | `/tools/exam-photo-fixer`<br>`/tools/passport-photo-maker` |

---

## 3. Search Console Keyword-to-URL Mapping

Mapping verified queries from Google Search Console baseline data to their canonical URLs, search intents, and optimization actions:

| Search Query | GSC Impressions | GSC Clicks | Avg. Pos. | Search Intent | Canonical Target URL | Keyword Optimization Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PDF Difference Checker** | 73 | 2 | 6.12 | Compare two PDF documents side-by-side to highlight text and layout changes | `/tools/pdf-difference-checker` | **Optimized:** Title updated to *"PDF Difference Checker — Compare Two PDF Files Online Free"*. |
| **Font Detector** | 47 | 0 | 7.49 | Identify unknown font from an uploaded image, screenshot, or PDF document | `/tools/font-detector` | **Optimized:** Title updated to *"Font Detector — Identify Fonts from Image & PDF Online Free"*. |
| **unir pdf online** | 48 | 0 | ~60 | Merge multiple PDF files online into a single document (ES / PT) | `/pt-br/tools/juntar-pdf`<br>`/es-mx/tools/unir-pdf` | **Optimized:** Added *"Unir e Juntar PDF"* to Portuguese title and metadata. |
| **unir pdf** | 37 | 0 | ~60 | Short-tail PDF combine intent | `/es-mx/tools/unir-pdf`<br>`/pt-br/tools/juntar-pdf` | **Optimized:** Localized H1 and FAQ markup aligned. |
| **dividir pdf** | 33 | 0 | ~65 | Split PDF pages or extract specific pages into separate files | `/es-mx/tools/dividir-pdf`<br>`/pt-br/tools/dividir-pdf` | **Optimized:** Created complete localized body overlays in `splitPdf.ts`. |
| **transparent png** | 29 | 0 | ~55 | Remove background from image to create transparent PNG asset | `/tools/background-remover` | **Optimized:** Title updated to *"Make Transparent PNG & Remove Background Online Free"*. |
| **split pdf** | 27 | 0 | ~70 | Extract or split PDF pages | `/tools/split-pdf` | **Optimized:** Step-by-step extraction guide and visual range selection. |
| **seo generator** | 34 | 0 | ~65 | Generate HTML meta tags, OpenGraph, and title descriptions for web pages | `/tools/seo-meta-generator` | **Optimized:** Title updated to *"SEO Generator — Free Meta Tags, Title & Description Builder"*. |
| **ssc photo resizer 20kb to 50kb** | High (India) | High | ~2.5 | Specific Indian portal compliance (SSC CGL, CHSL) | `/tools/exam-photo-fixer` | **High Performing:** Core driver of 59 clicks; preserved and protected. |
| **passport photo maker** | Moderate | Moderate | ~4.2 | International biometric passport crop | `/tools/passport-photo-maker` | **High Performing:** Top intent match. |

---

## 4. Architectural Rules for Future Catalogue Expansion

To prevent future keyword dilution or index bloat, every new tool must satisfy the following checklist before being admitted to `src/toolsRegistry.tsx`:

1. **Unique Primary User Task:** Must solve a distinct problem not already handled by an existing tool mode (e.g. do not create a separate "JPG to PNG" tool when `image-converter` already handles it).
2. **Clear Intent & Demand Evidence:** Search demand must be verified with Google Trends, GSC impressions, or competitor SERP volume.
3. **100% Client-Side Functionality:** Must execute locally in the browser with zero server latency or data privacy risk.
4. **Prerendered Landing Page:** Must include full semantic instructions, FAQs, privacy notice, and JSON-LD schema before production deployment.
5. **No Duplicate Category Cards:** New tools must be registered strictly in one primary category in `src/browseCategories.ts` to keep homepage and category counts synchronized.

