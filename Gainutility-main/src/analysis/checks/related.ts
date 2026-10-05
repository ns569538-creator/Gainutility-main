/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Related-tool id mapping used by findings. Only ids that exist in
 * toolsRegistry may appear here — no placeholder links.
 */

import type { ToolId } from "../../types";

export const CHECK_RELATED: Record<string, ToolId | undefined> = {
  "seo-title": "seo-meta-generator",
  "seo-description": "seo-meta-generator",
  "seo-canonical": "canonical-url-generator",
  "seo-sitemap": "xml-sitemap-generator",
  "seo-robots-sitemap-directive": "robots-txt-generator",
  "seo-hreflang": "hreflang-tag-generator",
  "seo-structured-data": "schema-markup-generator",
  "tech-robots-txt": "robots-txt-generator",
  "social-og": "og-meta-generator",
  "social-og-image": "og-meta-generator",
  "social-twitter-card": "twitter-card-generator",
  "social-og-url": "og-meta-generator",
  "images-alt": "contrast-checker",
  "a11y-contrast": "contrast-checker",
  "security-mixed-content": "canonical-url-generator",
  "perf-doc-size": "image-converter",
};
