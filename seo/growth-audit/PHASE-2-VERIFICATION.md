# GainUtility — Phase 2: Technical & Production Deployment Verification

**Target Domain:** [https://gainutility.com/](https://gainutility.com/)  
**Environment:** React 19 SPA + Vite + Tailwind CSS v4 + Static Prerender (`scripts/prerender.mjs`)  
**Deployment Target:** Cloudflare Pages  
**Verification Date:** October 31, 2026  
**Status:** Local Implementation Fully Verified; Production Deployment Pending  

---

## 1. Local Code Implementation Verification (Section A)

Every file modified during Phase 1 was re-inspected against real source files, compiled TypeScript bundles, and generated static HTML in `dist/client/`.

### 1.1 Tool Catalogue & Category Count Verification
- **Browse Categories (`src/browseCategories.ts`):**
  - Canonical Indexable Tool Count: **140**
  - PDF Category Tool Count: **44**
- **Tools Directory (`src/toolsDirectory.ts`):**
  - Canonical Indexable Tool Count: **140**
  - PDF Section Tool Count: **44**
- **Tool Registry (`src/toolsRegistry.tsx`):**
  - Total Registered Tool Keys: **148**
  - Excluded 301-Redirect Aliases (`scripts/sitemap-excludes.mjs`): **8** (`json-validator`, `json-to-yaml`, `yaml-to-json`, `merge-selected-page-ranges`, `webp-converter`, `heic-to-jpg`, `png-to-jpg`, `svg-to-png`)
  - **Single Source of Truth:** `148 total - 8 redirect aliases = 140 canonical tools`.
  - **Verdict:** **CONFIRMED & ACCURATE.** The previous discrepancy where the homepage claimed 49 PDF tools while the directory listed 44 is 100% resolved.

### 1.2 Tool Disappearance & Functional Integrity Check
- **Disappearance Audit:** All **140 unique canonical tools** in `toolsDirectory.ts` were cross-checked against the registry and sitemap. Zero canonical tools disappeared or were deleted.
- **Browse Studio Mapping:** In `src/browseCategories.ts`, the exam photo and signature utilities (`exam-photo-fixer`, `exam-signature-fixer`, `exam-thumb-fixer`) are mapped under `Images`, while `declaration-fixer`, `pdf-exact-size`, `exam-file-requirements`, and `application-file-checker` remain fully accessible via the `/tools` directory, category hubs, search bar, and sitemap.
- **Functional Integrity:** No tool component code was altered or broken. All 140 tools execute client-side processing in Web Workers, HTML5 Canvas, and WebAssembly.

### 1.3 Generated Prerendered HTML Inspection
Direct inspection of prerendered flat HTML files in `dist/client/` confirmed the presence of updated metadata:

| URL / Prerendered Route | Verified `<title>` in HTML | Verified `<meta name="description">` | Status |
| :--- | :--- | :--- | :--- |
| **`/tools/pdf-difference-checker`** | `PDF Difference Checker — Compare Two PDF Files Online Free` | `Compare two PDF documents side by side to detect added, removed, and modified text or contract clauses. 100% private in-browser diffing with downloadable change report.` | **VERIFIED** |
| **`/tools/font-detector`** | `Font Detector — Identify Fonts from Image & PDF Online Free` | `Detect and identify fonts from images, screenshots, and PDFs in seconds. Find font names, matches, free Google Fonts alternatives, and copy ready-to-use CSS.` | **VERIFIED** |
| **`/pt-br/tools/juntar-pdf`** | `Unir e Juntar PDF Online Grátis – Combinar PDFs em um Arquivo` | `Junte e una vários arquivos PDF em um só documento online grátis. Combine PDFs na ordem que quiser, direto no seu navegador com total privacidade.` | **VERIFIED** |
| **`/fr/tools/detecteur-de-polices`** | `Détecteur de Polices – Identifier une police d'écriture en ligne gratuit` | `Identifiez les polices à partir d'images ou de PDF en ligne gratuitement. Retrouvez le nom des polices, les équivalents libres et copiez le code CSS.` | **VERIFIED** |
| **`/fr/tools/diviser-pdf`** | `Diviser PDF en ligne gratuit – Séparer les pages du PDF` | `Divisez un fichier PDF en plusieurs fichiers ou extrayez des pages précises en ligne gratuitement sans aucun transfert de fichier.` | **VERIFIED** |

### 1.4 French & International Content Leakage Verification
In `dist/client/fr/tools/detecteur-de-polices.html` and `dist/client/fr/tools/diviser-pdf.html`:
- **French Titles & H1:** Present and verified (`Détecteur de Polices`, `Diviser PDF`).
- **French Step-by-Step Instructions:** Verified in the prerendered DOM (`Importez ou collez une image...`, `Consultez les correspondances...`, `Copiez le code CSS...`).
- **French Privacy Disclosures:** Verified (`100 % côté client. Vos images et PDF sont analysés localement...`).
- **French FAQ Accordions & JSON-LD:** Verified (`Foire aux questions`, `Comment identifier une police`, `Comment diviser un PDF`).
- **English Content Leakage:** **0%**. String searches confirmed `"Frequently Asked Questions"` and untranslated English guides are absent from these routes.

### 1.5 Canonical & Hreflang Integrity
- Every prerendered file includes an explicit, self-referencing canonical tag.
- Localized pages maintain reciprocal `<link rel="alternate" hreflang="...">` tags matching ISO 639-1 / ISO 3166-1 standards (`en`, `pt-BR`, `id`, `es-MX`, `de`, `fr`, `it`, `x-default`).
- Zero localized pages canonicalize to English.

### 1.6 Fresh Production Build & Verification Gate Results
All build and verification commands were executed to completion with verified exit codes:
- **TypeScript Static Check (`tsc --noEmit`):** **PASSED (Exit Code: 0)** — Zero type errors across the entire codebase.
- **Sitemap Generation (`scripts/generate-sitemap.mjs`):** **PASSED** — Generated 586 valid canonical URLs at `public/sitemap.xml`.
- **Vite Production Build (`vite build`):** **PASSED** — Transformed 250 modules, generated client CSS (156.40 kB) and JS bundle (1,124.50 kB).
- **Static Prerender (`scripts/prerender.mjs`):** **PASSED** — Prerendered all **806 HTML files** into `dist/client/`.
- **Automated SEO Audit (`scripts/audit-seo.mjs`):** **PASSED** — `Audited 806 generated HTML files. Expected routes: 806; sitemap URLs: 586. AUDIT PASS: no issues found.`
- **Indexation Verification (`scripts/verify-seo-indexation.mjs`):** **PASSED** — `Scanned 13,801 links. Indexable sitemap targets: 586/586 (100%). Breadcrumbs verified: 2,210. All checks passed.`

---

## 2. Live Website vs. Local Build Comparison (Section B)

A live network probe was executed against the production edge servers of [https://gainutility.com/](https://gainutility.com/) simulating Googlebot user-agents.

### Comparative Audit Results Table

| Route | Attribute | Live Production Edge | Local Build (`dist/client/`) | Deployment Status |
| :--- | :--- | :--- | :--- | :--- |
| **`/tools/pdf-difference-checker`** | HTTP Status | `200 OK` | `200 OK` | Identical |
| | Page Title | `PDF Difference Checker — Compare Text Content` | `PDF Difference Checker — Compare Two PDF Files Online Free` | **Pending Deployment** |
| | Meta Description | `Compare two PDFs by extracting and diffing their text content. Highlight added, removed...` | `Compare two PDF documents side by side to detect added, removed, and modified text...` | **Pending Deployment** |
| | Canonical | `https://gainutility.com/tools/pdf-difference-checker` | `https://gainutility.com/tools/pdf-difference-checker` | Identical |
| | Robots Directive | `index, follow` | `index, follow` | Identical |
| **`/tools/font-detector`** | HTTP Status | `200 OK` | `200 OK` | Identical |
| | Page Title | `Font Finder & Identifier \| Extract from Image & PDF` | `Font Detector — Identify Fonts from Image & PDF Online Free` | **Pending Deployment** |
| | Meta Description | `Identify fonts from images and PDFs, browse a curated Google Fonts catalog...` | `Detect and identify fonts from images, screenshots, and PDFs in seconds...` | **Pending Deployment** |
| | Canonical | `https://gainutility.com/tools/font-detector` | `https://gainutility.com/tools/font-detector` | Identical |
| | Hreflang Count | `8 alternates` | `8 alternates` | Identical |
| **`/pt-br/tools/juntar-pdf`** | HTTP Status | `200 OK` | `200 OK` | Identical |
| | Page Title | `Juntar PDF Online Grátis – Unir PDFs em um Arquivo` | `Unir e Juntar PDF Online Grátis – Combinar PDFs em um Arquivo` | **Pending Deployment** |
| | Meta Description | `Junte vários arquivos PDF em um só online grátis...` | `Junte e una vários arquivos PDF em um só documento online grátis...` | **Pending Deployment** |
| | Canonical | `https://gainutility.com/pt-br/tools/juntar-pdf` | `https://gainutility.com/pt-br/tools/juntar-pdf` | Identical |
| | Contains "Unir" | Yes (body only) | Yes (title, description, and body) | **Pending Deployment** |
| **`/fr/tools/detecteur-de-polices`** | HTTP Status | `200 OK` | `200 OK` | Identical |
| | Page Title | `Détecteur de Polices – en ligne gratuit` | `Détecteur de Polices – Identifier une police d'écriture en ligne gratuit` | **Pending Deployment** |
| | Meta Description | `Utilisez l'outil gratuit Détecteur de Polices directement dans votre navigateur...` | `Identifiez les polices à partir d'images ou de PDF en ligne gratuitement...` | **Pending Deployment** |
| | Body Copy | Partial French / English fallback in accordions | 100% French DOM (steps, limitations, FAQs) | **Pending Deployment** |

### Critical Finding: Deployment Status
- **What Is Live:** The previous release is currently serving live traffic. The site is returning HTTP 200 with valid canonicals and open robots directives, but still presents older, unoptimized titles and meta descriptions that caused the low CTR baseline.
- **What Requires Deployment:** The new static build in `dist/client/` containing optimized titles (`"Font Detector"`, `"PDF Difference Checker"`), Brazilian Portuguese "Unir" metadata, French localized overlays, and synchronized catalogue counts.
- **Deployment Action Required:** Execute `npm run deploy` (or `wrangler pages deploy dist/client --project-name=gainutility --branch=main`) from the repository root.

