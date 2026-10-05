/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scalable per-tool UI dictionaries.
 *
 * The shared `UI` dictionary in `./ui` is right for generic chrome used
 * across the whole site (headers, cards, upload panels, toasts). Individual
 * tools ship large amounts of tool-specific copy, and pouring all of it into
 * one flat global dictionary would create thousands of keys with a high
 * chance of collisions.
 *
 * Instead each tool owns its own namespaced dictionary keyed by tool id:
 *
 *   registerToolUI("base64-tool", {
 *     encodingLabel: { en: "Encode", "pt-br": "Codificar", ... },
 *     ...
 *   });
 *
 * Components resolve strings through `tt(toolId, key, locale)`. The tool id
 * namespace guarantees no cross-tool key collisions, keeps any one tool's
 * copy in a single place, and works alongside (never inside) the shared
 * `UI` dictionary.
 */

import { LocaleCode } from "./slugs";

/** Per-key translations; any omitted locale falls back to `en` then to the caller-provided fallback. */
export type LocaleRecord = Partial<Record<LocaleCode, string>>;
/** A tool's namespaced dictionary: key -> localized values. */
export type ToolUIDict = Record<string, LocaleRecord>;

const TOOL_UI: Record<string, ToolUIDict> = {};

/**
 * Register (or extend) the UI dictionary for a tool id. Merge semantics make
 * it safe for feature-specific modules to contribute a few keys without
 * re-declaring the whole tool dict.
 */
export const registerToolUI = (toolId: string, dict: ToolUIDict): void => {
  const existing = TOOL_UI[toolId] ?? {};
  TOOL_UI[toolId] = { ...existing, ...dict };
};

/** True when a tool dict has a translation record for the key (for audits). */
export const hasToolKey = (toolId: string, key: string): boolean =>
  Boolean(TOOL_UI[toolId]?.[key]);

const localeOf = (rec: LocaleRecord, locale: string): string | undefined => {
  const code = (locale || "en").toLowerCase();
  return (rec[code as LocaleCode] ?? (code === "es-co" ? rec["es-mx"] : undefined)) as string | undefined;
};

const wiredCache = new Map<string, boolean>();

/**
 * Whether a tool's wired per-tool dictionary actually carries this locale.
 *
 * - `null`  — the tool ships no per-tool dictionary at all (its copy comes
 *             from the shared site dictionary), so callers keep their own
 *             default behaviour.
 * - `false` — a dictionary exists but this locale falls back to English. This
 *             is what keeps `/de/tools/css-schatten-generator` and
 *             `/de/tools/youtube-keyword-explorer` (both documented as
 *             intentionally English in German) out of the localized sitemap
 *             and hreflang set.
 *
 * `es-co` mirrors the `es-mx` text, matching `toolBodyOverlay`.
 */
export const toolUiLocaleWired = (toolId: string, locale: string): boolean | null => {
  const dict = TOOL_UI[toolId];
  if (!dict) return null;
  const code = (locale || "en").toLowerCase();
  const cacheKey = `${toolId}|${code}`;
  const cached = wiredCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const wired = Object.values(dict).some((rec) => Boolean(localeOf(rec, code)));
  wiredCache.set(cacheKey, wired);
  return wired;
};

const warned = new Set<string>();

/**
 * Missing keys surface in development rather than silently pretending a
 * locale is complete. Warnings are emitted once per tool/key so an audit
 * pass can grep the console for gaps.
 */
const warnMissing = (toolId: string, key: string, locale: string): void => {
  if (typeof console === "undefined") return;
  const id = `${toolId}.${key}`;
  if (warned.has(id)) return;
  warned.add(id);
  const env = (import.meta as any)?.env?.DEV;
  const message = `[i18n] missing per-tool key "${id}" for "${locale}"`;
  if (env) console.warn(message);
  else console.log(message);
};

/**
 * Look up a per-tool UI string for the current locale. Resolution order:
 * locale -> English -> caller-provided `fallback`. A missing key logs once
 * in development so incomplete localizations are easy to audit.
 */
export const tt = (
  toolId: string,
  key: string,
  locale: string,
  fallback: string = ""
): string => {
  const rec = TOOL_UI[toolId]?.[key];
  if (!rec) {
    warnMissing(toolId, key, locale);
    return fallback;
  }
  const val = rec[locale as LocaleCode];
  if (val) return val;
  const en = rec.en;
  return en ?? fallback;
};

/** Like `tt`, but replaces every `{token}` occurrence in the result. */
export const ttf = (
  toolId: string,
  key: string,
  locale: string,
  tokens: Record<string, string>,
  fallback: string = ""
): string => {
  let out = tt(toolId, key, locale, fallback);
  for (const [k, v] of Object.entries(tokens)) out = out.split(`{${k}}`).join(v);
  return out;
};