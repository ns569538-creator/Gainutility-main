/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlays for the nine localized tool pages.
 *
 * toolBodyOverlay(toolId, locale) returns the translated body for a tool
 * page, or undefined for the English default locale (English keeps reading
 * the data.ts / extra*.ts source entries directly). "es-co" falls back to
 * the "es-mx" text, matching localizedHubOverlay's resolver convention.
 *
 * Wired into:
 *   - src/components/Layout.tsx  → visible body sections + card desc
 *   - src/i18n/seo.ts getLocalizedSeo → faqs (visible accordion + JSON-LD)
 */

import { DEFAULT_LOCALE } from "../locales";
import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";
import { overlay as contrastChecker } from "./contrastChecker";
import { overlay as base64Tool } from "./base64Tool";
import { overlay as jsonBeautifier } from "./jsonBeautifier";
import { overlay as boxShadowGenerator } from "./boxShadowGenerator";
import { overlay as slugGenerator } from "./slugGenerator";
import { overlay as imageConverter } from "./imageConverter";
import { overlay as mergePdf } from "./mergePdf";
import { overlay as youtubeThumbnailPreview } from "./youtubeThumbnailPreview";
import { overlay as youtubeKeywordExplorer } from "./youtubeKeywordExplorer";

const OVERLAYS: Record<string, Partial<Record<LocaleCode, ToolBodyOverlay>>> = {
  "contrast-checker": contrastChecker,
  "base64-tool": base64Tool,
  "json-beautifier": jsonBeautifier,
  "box-shadow-generator": boxShadowGenerator,
  "slug-generator": slugGenerator,
  "image-converter": imageConverter,
  "merge-pdf": mergePdf,
  "youtube-thumbnail-preview": youtubeThumbnailPreview,
  "youtube-keyword-explorer": youtubeKeywordExplorer,
};

export const toolBodyOverlay = (
  toolId: string,
  locale: string | undefined
): ToolBodyOverlay | undefined => {
  const code = (locale ?? DEFAULT_LOCALE).toLowerCase();
  if (code === DEFAULT_LOCALE) return undefined;
  const forTool = OVERLAYS[toolId];
  if (!forTool) return undefined;
  const key = (code === "es-co" ? "es-mx" : code) as LocaleCode;
  return forTool[key];
};
