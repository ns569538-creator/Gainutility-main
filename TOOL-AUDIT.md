# GainUtility — Post-Fix SEO Audit Table

Generated 2026-09-15 from dist/ + audit script. 146 tools (149 registry − 3 classics retired from sitemap).

| URL | Issue | Severity | Cause | Fix | Status |
|-----|-------|----------|-------|-----|--------|
| `https://gainutility.com/` (EN home) | `<link rel="canonical">` missing trailing slash → `https://gainutility.com` vs sitemap `https://gainutility.com/` | HIGH | `absoluteUrl('/')` returned bare origin without trailing slash | `src/site.ts` `absoluteUrl` now appends `/` when path is root | ✅ FIXED |
| `/tools/json-formatter`, `/tools/json-viewer`, `/tools/json-compare` | Classic JSON tools duplicated functionality vs modern trio; separate sitemap entries splitting crawl authority | MED | Three classic JSON tools coexist with newer modernized replacements (json-beautifier, json-tree-viewer, json-compare-diff) | Removed classics from sitemap, all internal related-tools/compare/blog/hub links, category mosaic, CommandPalette, studiosData; 301 redirects in vercel.json + `_redirects` to modern successors; classic SEO blocks kept in data.ts for SPA render | ✅ FIXED |
| `/tools/json-formatter`, `/tools/json-viewer`, `/tools/json-compare` | Legacy bare-slug redirects (`/json-formatter` → `/tools/json-formatter`) would land on superseded classic pages | MED | `generate-sitemap.mjs` legacyToolRedirects + bare-slug redirects pointed at now-superseded classic URLs | Classics excluded from `SITEMAP_EXCLUDES` + `consolidatedRedirects` in `scripts/generate-sitemap.mjs` → bare `/json-formatter` now 301s directly to `/tools/json-beautifier` | ✅ FIXED |
| `/tools/json-beautifier` (en, es-mx, es-co, pt-br, id, de, fr, it) | `<title>` was English-only "JSON Formatter Online Gratis" across all non-en locales — identical titles across locales | MED | TOOL_LOCALE_NAMES lacked entries for `json-beautifier`; TPL templates defaulted to English name in non-en locales | Added localized names: Formatador JSON (pt-br), Formatter JSON (id), Formateador JSON (es-mx/es-co), JSON-Formatter (de), Formateur JSON (fr), Formattatore JSON (it); pinned English slug in TOOL_LOCALE_SLUGS to keep indexed URLs stable | ✅ FIXED |
| `/tools/contrast-checker` (en, es-mx, es-co, pt-br, id, de, fr, it) | `<title>` was English-only across all non-en locales | MED | No localized name in TOOL_LOCALE_NAMES; default English fallback | Added: Verificador de Contraste (pt-br/es-mx/es-co), Kontras Checker (id), Kontrast-Checker (de), Vérificateur de contraste (fr), Verifica Contrasto (it); slug pinned English | ✅ FIXED |
| `/tools/slug-generator` (en, es-mx, es-co, pt-br, id, de, fr, it) | `<title>` was English-only across all non-en locales | MED | No localized name in TOOL_LOCALE_NAMES; default English fallback | Added: Gerador de Slug (pt-br), Generator Slug (id), Generador de Slug (es-mx/es-co), Slug-Generator (de), Générateur de slug (fr), Generatore di slug (it); slug pinned English | ✅ FIXED |
| `/tools/youtube-thumbnail-preview` (en, es-mx, es-co, pt-br, id, de, fr, it) | `<title>` was English-only across all non-en locales | MED | No localized name in TOOL_LOCALE_NAMES; default English fallback | Added: Miniatura YouTube (pt-br/es-mx/es-co), Thumbnail YouTube (id), YouTube Thumbnail (de), Miniature YouTube (fr), Anteprima YouTube (it); slug pinned English | ✅ FIXED |
| `/colors/*`, `/color-palettes/*`, `/ui-colors/*` (151 pages total) | Color pages fully unreachable from any internal link (footer, hubs, sitemap isolated) | MED | 151 crawlable color-family pages not linked from footer/hub navigation | Added "Named Colors" → `/colors/red` and "Color Palettes" → `/color-palettes/ocean-depths` in Layout.tsx footer Zone B Explore section | ✅ FIXED |
| `/json` hub sub-pages (`/json/formatter`, `/json/validator`, `/json/viewer`, `/json/best`) | Related-tools lists pointed at retired classics (json-formatter, json-viewer, json-compare) | MED | `seoPageContent.ts` related-tools arrays used classic IDs in JSON hub sub-pages and /json/best list | Swapped to modern trio: json-beautifier, json-tree-viewer, json-compare-diff, json-minifier, json-validator, json-to-csv in seoPageContent.ts + comparisonPages.ts | ✅ FIXED |
| `/compare/json-formatter-vs-minifier` | Comparison page referenced retired `json-formatter` (toolA, toolAId, decisionA text) | MED | `comparisonPages.ts` formatter-vs-minifier entry used classic `json-formatter` ID + name | Updated toolA/toolAId/name to json-beautifier; rewritten decisionA explanation; page slug kept intentionally (search-intent keyword preserved) | ✅ FIXED |
| `/json/best` | Best-of list included retired `json-formatter` at rank 3 | MED | `comparisonPages.ts` /json/best tools array included classic | Ranks 1-6 → json-beautifier, json-validator, json-minifier, json-tree-viewer, json-compare-diff, json-to-csv | ✅ FIXED |
| `/json` hub + blog article | Blog JSON article + CTA pointed at retired `json-formatter` | LOW | `blogData.ts` JSON article tool refs used classic ID | Swapped to json-beautifier (label + toolId + CTA) | ✅ FIXED |
| `/json` hub / Developer mosaic | ContinueEditing JSON workflow + CommandPalette + categoryMosaic referenced `json-formatter` | LOW | App workflow graph and quick actions used classic ID | ContinueEditing.tsx JSON graph rewritten (modern trio + json-tree-viewer workflow); CommandPalette + categoryMosaic → json-beautifier | ✅ FIXED |
| `/pt-br/tools/ferramenta-base64` (and 6 other locales) | Localized slug for base64-tool differs per locale — 7 unique slug variants across 8 locales; only 1 indexed in sitemap | INFO | TOOL_LOCALE_SLUGS correctly pins localized slugs for `base64-tool` (ferramenta-base64, alat-base64, herramienta-base64, base64-tool, outil-base64, strumento-base64) | No fix needed — localized slugs working correctly, all emitted in sitemap and prerendered | ✅ NO ISSUE |
| `/es-co/*` + `/es-mx/*` (16 pairs) | Duplicate `<title>` tags across es-co and es-mx locales (16 instances) | MED | `es-co` falls back to `es-mx` copy by design — identical content intentional for Colombian Spanish variant | Accepted by design; no fix needed — flags as informational duplicate | ⏳ BY DESIGN |
| `/studios/color/*` (10 pages) | Generated pages not present in sitemap | INFO | Color Studio pages are functional app surfaces, not standalone SEO landing pages — deliberately excluded from sitemap (per indexing model) | No fix needed — pages still serve via SPA and `/studios/color` rewrite | ✅ BY DESIGN |
| `/tools/json-formatter`, `/tools/json-viewer`, `/tools/json-compare` | Present as prerendered HTML but not in sitemap (3 pages) | INFO | Classics retained in registry for SPA render + 301 redirect chain; deliberately excluded from sitemap via `SITEMAP_EXCLUDES` | No fix needed — HTML pages exist so direct loads 301 cleanly at edge before SPA renders | ✅ BY DESIGN |

---

## Verification Summary

- **`npm run build`**: ✅ Passed — 516 HTML files (515 routes + 404)
- **`audit-html.mjs`**: ✅ 0 HIGH issues, 21 MED (all expected es-co/es-mx fallback pairs)
- **Sitemap**: 502 `<loc>` entries (was 505, −3 classics)
- **_redirects**: 6 consolidated 301s added (3 classic pairs × /tools/ + bare-slug forms)
- **vercel.json**: same 6 consolidated 301s added to `redirects[]`
- **Canonical fix**: `dist/client/index.html` now has `<link rel="canonical" href="https://gainutility.com/" />`
- **Footer links**: Named Colors + Color Palettes added to Zone B Explore in Layout.tsx
- **Localized titles**: 4 tools now have distinct titles per locale (no more English fallback collisions)

## Relevant Files Changed

| File | Change |
|------|--------|
| `src/site.ts` | `absoluteUrl` root-canonical trailing-slash fix |
| `src/i18n/slugs.ts` | Added TOOL_LOCALE_NAMES (4 tools) + TOOL_LOCALE_SLUGS pins (4 tools) |
| `src/data.ts` | Swapped 23 classic JSON refs → modern trio (internal links, related lists) |
| `src/seo/seoPageContent.ts` | JSON hub + sub-pages relatedTools + primaryTool + breadcrumb |
| `src/seo/comparisonPages.ts` | formatter-vs-minifier → json-beautifier; /json/best list |
| `src/seo/extraGenerators.ts` | schema-markup-generator related → json-beautifier |
| `src/blog/blogData.ts` | JSON article + CTA → json-beautifier |
| `src/studiosData.ts` | JSON studio tools + developer-kit collection |
| `src/components/ContinueEditing.tsx` | JSON workflow graph rewritten |
| `src/components/CommandPalette.tsx` | QUICK_ACTIONS "Format JSON" → json-beautifier |
| `src/components/categoryMosaic.ts` | Developer mosaic slot → json-beautifier |
| `src/components/Layout.tsx` | Footer Zone B: added Named Colors + Color Palettes links |
| `scripts/generate-sitemap.mjs` | SITEMAP_EXCLUDES (3 classics) + consolidatedRedirects (6 pairs) |
| `src/i18n/seo.ts` | Added json-beautifier to TOOL_ACTION map |
