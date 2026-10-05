/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Representative tool slug for each Browse category, used to surface a real
 * tool's icon on the homepage category mosaic. Each slot is a tool that
 * actually exists in the registry under that category, so the mosaic always
 * reflects the real library — never invented mockups.
 */
import type { BrowseCategoryId } from "../browseCategories";

export const CATEGORY_TOOL_SLOT: Partial<Record<BrowseCategoryId, string>> = {
  PDF: "merge-pdf",
  Images: "image-resizer",
  Media: "video-compressor",
  Developer: "json-beautifier",
  Design: "contrast-checker",
  SEO: "seo-meta-generator",
  Security: "password-generator",
  Creator: "linkedin-carousel-maker",
  Converters: "json-to-csv",
};

export const MOSAIC_CATEGORIES: BrowseCategoryId[] = [
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
