/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The allowlist of tools that accept anonymous 1–5 ratings.
 *
 * Deliberately small: only the 11 flagship "Popular" tools are eligible for the
 * emoji rating launch. Every other tool must not render the rating UI.
 *
 * KEEP IN SYNC with the server-side allowlist in
 * functions/api/ratings.ts — that file is the authoritative gate and rejects
 * any slug that is not listed here.
 */

export const RATABLE_TOOL_SLUGS = [
  "background-remover",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "qr-code-generator",
  "image-converter",
  "json-validator",
  "json-beautifier",
  "merge-pdf",
  "split-pdf",
] as const;

/** True only for the 11 flagship tools that may display the rating widget. */
export const isRatableTool = (slug: string): boolean =>
  (RATABLE_TOOL_SLUGS as readonly string[]).includes(slug);