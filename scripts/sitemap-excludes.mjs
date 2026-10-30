/**
 * Tools that stay in the registry/SPA but are deliberately dropped from the
 * generated sitemap: they 301 to their modern successor (see generate-sitemap.mjs
 * "consolidatedRedirects"), so their prerendered HTML is a redirect target, not
 * an indexable landing page. Single source of truth shared by generate-sitemap.mjs
 * and audit-seo.mjs so the intentional omission never reads as a defect.
 */
export const SITEMAP_EXCLUDES = new Set(["json-formatter", "json-viewer", "json-compare"]);

/**
 * Tool aliases consolidated into a single canonical tool (INDEX-READY audit,
 * Phase I): each alias rendered the exact same component/experience as its
 * canonical target, so the alias URL 301s (both `/tools/<alias>` and the legacy
 * `/<alias>` form) straight to the canonical tool — one hop, no chain — and is
 * dropped from the sitemap. The alias stays in the registry so old in-app state
 * and bookmarks still resolve; search equity flows to the canonical URL.
 *
 *   webp/png-jpg/heic/svg-converter -> /tools/image-converter (same
 *   <ImageConverter>, no format preset) · merge-selected-page-ranges is a
 *   page-range sub-feature of /tools/merge-pdf.
 */
export const CONSOLIDATED_TOOL_ALIASES = new Map([
  ["webp-converter", "image-converter"],
  ["png-jpg-converter", "image-converter"],
  ["heic-jpg-converter", "image-converter"],
  ["svg-converter", "image-converter"],
  ["merge-selected-page-ranges", "merge-pdf"],
]);

/** Every tool id intentionally absent from the sitemap (classics + aliases). */
export const EXCLUDED_TOOL_IDS = new Set([
  ...SITEMAP_EXCLUDES,
  ...CONSOLIDATED_TOOL_ALIASES.keys(),
]);
