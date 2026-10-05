/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Merge module for supplemental tool SEO entries. Combines the per-studio
 * entry files into one lookup keyed by ToolId, resolving `related` ids into
 * full tool metadata at query time (see getMergedSEO in ./shared).
 */

import { ToolId } from "../types";
import { PDF_SEO } from "./extraPdf";
import { PDF_CONVERTER_SEO } from "./extraPdfConverters";
import { PDF_UTILITY_SEO } from "./extraPdfUtilities";
import { GENERATOR_SEO } from "./extraGenerators";
import { CREATOR_SEO } from "./extraCreator";
import { EXAM_SEO } from "./extraExams";
import { COLOR_TOOLS_SEO } from "./extraColorTools";
import { MEDIA_SEO } from "./extraMedia";
import { IMAGE_TOOLS_SEO } from "./extraImageTools";
import { WEBSITE_STUDIO_SEO } from "./extraWebsiteStudio";
import { STYLISH_NAME_SEO } from "./extraStylishNames";

export interface ToolSeoEntry {
  /** Unique <title> tag text (without brand suffix). */
  title: string;
  /** Unique meta description (~150-160 chars). */
  description: string;
  /** Short lead paragraph shown under the H1. */
  intro?: string;
  /** "What is this tool" paragraph for the about section. */
  whatText?: string;
  /** "Why use this tool" paragraph for the about section. */
  whyText?: string;
  /** Feature bullets for the about section. */
  features?: string[];
  /** Ordered usage steps. */
  steps?: string[];
  /** Typical use cases. */
  useCases?: string[];
  /** Known limitations stated honestly. */
  limitations?: string[];
  /** Privacy statement matching actual behavior. */
  privacyExplanation?: string;
  /** Common mistakes to avoid. */
  mistakes?: string[];
  /** Troubleshooting hints. */
  troubleshooting?: string[];
  /** FAQ items rendered visibly and mirrored into FAQPage JSON-LD. */
  faqs: Array<{ question: string; answer: string }>;
  /** Related tool ids, resolved against the registry at render time. */
  related: ToolId[];
}

const MERGED: Partial<Record<ToolId, ToolSeoEntry>> = Object.freeze({
  ...PDF_SEO,
  ...PDF_CONVERTER_SEO,
  ...PDF_UTILITY_SEO,
  ...GENERATOR_SEO,
  ...CREATOR_SEO,
  ...EXAM_SEO,
  ...COLOR_TOOLS_SEO,
  ...MEDIA_SEO,
  ...IMAGE_TOOLS_SEO,
  ...WEBSITE_STUDIO_SEO,
  ...STYLISH_NAME_SEO,
});

/** Look up a supplemental SEO entry by tool id (undefined when covered by data.ts). */
export function getToolSeoExtra(id: ToolId): ToolSeoEntry | undefined {
  return MERGED[id];
}
