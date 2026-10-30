/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Browse Tools category buckets.
 *
 * toolsRegistry.tsx is the single source of truth for every tool's identity.
 * This module maps each registry entry to one of the fixed top-level Browse
 * filters using deterministic rules (registry category + keyword patterns).
 * It never restates tool names, descriptions, icons or routes, so it cannot
 * drift from the registry. Tool counts are derived live from the registry.
 */

import type { ToolId } from "./types";
import { toolsRegistry } from "./toolsRegistry";
import { getPopularToolIds } from "./data/popularTools";

export type BrowseCategoryId =
  | "Popular"
  | "PDF"
  | "Images"
  | "Media"
  | "Developer"
  | "Design"
  | "SEO"
  | "Security"
  | "Creator"
  | "Converters";

export const BROWSE_CATEGORIES: BrowseCategoryId[] = [
  "Popular",
  "PDF",
  "Images",
  "Media",
  "Developer",
  "Design",
  "SEO",
  "Security",
  "Creator",
  "Converters",
];

/**
 * Curated popular tools — derived from the centralized popularTools configuration.
 * Order there is the display order.
 */
const POPULAR_TOOLS: ToolId[] = getPopularToolIds();

/** Primary bucket for each fine-grained registry category. */
const PRIMARY_BUCKET: Record<string, Exclude<BrowseCategoryId, "Popular">> = {
  "JSON Utilities": "Developer",
  "Developer Utilities": "Developer",
  "Developer Studio": "Developer",
  "Design Utilities": "Design",
  "SEO Utilities": "SEO",
  "Website Studio": "SEO",
  "Image Studio": "Images",
  "Media Studio": "Media",
  "Creator Studio": "Creator",
  "Organize PDF": "PDF",
  "Convert PDF": "PDF",
  "Optimize": "PDF",
  "Advanced": "PDF",
  "PDF Studio": "PDF",
  "Document Security": "PDF",
  "Exam & Application": "PDF",
};

/** Deterministic keyword rules for cross-cutting Security membership. */
const SECURITY_TERMS =
  /\b(?:password|hash|jwt|uuid|exif|gps|encrypt|decrypt|entropy|escape|watermark)\b/i;

/** Deterministic keyword rules for the Converters membership. */
const CONVERTER_TERMS =
  /\b(?:convert(?:er|ers|ing|s)?|encode(?:r|rs|ing)?|decode(?:r|rs|ing)?|translat(?:e|or|ing)|base64)\b|\bto\s+(?:csv|json|xml|pdf|word|excel|webp|png|jpg|jpeg|text|html|powerpoint)\b/i;

/** Cross-cutting tools that genuinely belong in the Images category. */
const CROSS_CATEGORY_IMAGE_TOOLS = new Set<ToolId>([
  "image-metadata-remover",
  "exam-photo-fixer",
  "exam-signature-fixer",
  "exam-thumb-fixer",
  "jpg-to-pdf",
  "pdf-to-jpg",
]);

/** Tools that must NEVER appear under Images category. */
const STRICT_NON_IMAGE_TOOLS = new Set<ToolId>([
  "declaration-fixer",
  "pdf-exact-size",
  "exam-file-requirements",
  "application-file-checker",
  "reduce-pdf-image-quality",
  "compress-images-inside-pdf",
]);

const matchesTerms = (id: ToolId, re: RegExp): boolean => {
  const meta = toolsRegistry[id];
  if (!meta) return false;
  return re.test(`${meta.name} ${meta.desc}`);
};

/**
 * The complete, ordered list of tools that belong to a Browse category,
 * preserving registry order. Computed once per category and cached.
 */
const categoryCache = new Map<BrowseCategoryId, ToolId[]>();

const buildCategoryList = (category: BrowseCategoryId): ToolId[] => {
  if (category === "Popular") {
    return POPULAR_TOOLS.filter((id) => Boolean(toolsRegistry[id]));
  }
  return (Object.keys(toolsRegistry) as ToolId[]).filter((id) => {
    const meta = toolsRegistry[id];
    if (!meta) return false;

    // Strict image filtering: only genuine image-processing tools
    if (category === "Images") {
      if (STRICT_NON_IMAGE_TOOLS.has(id)) return false;
      return meta.category === "Image Studio" || CROSS_CATEGORY_IMAGE_TOOLS.has(id);
    }

    // Exclude exam photo/signature/thumb fixers from PDF bucket
    if (category === "PDF") {
      if (id === "exam-photo-fixer" || id === "exam-signature-fixer" || id === "exam-thumb-fixer") {
        return false;
      }
    }

    const primary = PRIMARY_BUCKET[meta.category];
    if (!primary) return false;

    if (primary === category) return true;

    if (category === "Security") {
      return meta.category === "Document Security" || matchesTerms(id, SECURITY_TERMS);
    }

    if (category === "Converters") {
      return meta.category === "Convert PDF" || matchesTerms(id, CONVERTER_TERMS);
    }

    return false;
  });
};

export const browseToolsForCategory = (category: BrowseCategoryId): ToolId[] => {
  let list = categoryCache.get(category);
  if (!list) {
    list = buildCategoryList(category);
    categoryCache.set(category, list);
  }
  return list;
};

/** Live tool count for a category, always derived from the registry. */
export const browseCategoryCount = (category: BrowseCategoryId): number =>
  browseToolsForCategory(category).length;

/** Total number of tools registered on the platform. */
export const TOTAL_TOOL_COUNT = Object.keys(toolsRegistry).length;