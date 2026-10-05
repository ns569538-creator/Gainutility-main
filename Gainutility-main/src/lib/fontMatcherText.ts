/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure text preparation for glyph comparison — split out from
 * fontMatcher.ts so unit tests can import it without pulling the JSON
 * catalog (Node JSON imports need import attributes Vite doesn't share).
 */

const MAX_RENDER_CHARS = 48;
const MAX_RENDER_LINES = 4;

/**
 * Trim OCR noise down to the lines worth rendering for glyph comparison.
 * Returns [] when there aren't at least two real letters.
 */
export function prepareMatchText(text: string, allCaps: boolean): string[] {
  const joined = String(text ?? "")
    .replace(/[^\S\r\n]+/g, " ")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
  if (!joined.trim()) return [];
  const lines = joined
    .split("\n")
    .slice(0, MAX_RENDER_LINES)
    .map((l) => (l.length > MAX_RENDER_CHARS ? l.slice(0, MAX_RENDER_CHARS) : l));
  const letters = lines.join("").replace(/[^a-zA-Z]/g, "");
  if (letters.length < 2) return [];
  return allCaps ? [lines.join("\n").toUpperCase()] : [lines.join("\n")];
}
