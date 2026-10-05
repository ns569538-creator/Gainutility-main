/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Central locale configuration for the GainUtility international SEO layer.
 *
 * `en` is the DEFAULT locale and is served at the root (no prefix), which
 * preserves every existing English URL. All other locales are served under a
 * locale prefix (`/<code>/...`).
 *
 * This module is DOM-free so it can be consumed by both the live app and the
 * Node prerender script.
 */

export interface LocaleConfig {
  /** Canonical locale code used in URLs (lowercase, e.g. "pt-br"). */
  code: string;
  /** HTML lang attribute (correct per BCP-47, e.g. "pt-BR", "es-MX"). */
  htmlLang: string;
  /** Open Graph locale attribute (e.g. "pt_BR", "es_MX"). */
  ogLocale: string;
  /** Human-facing label shown in the language selector. */
  label: string;
  /** Native label (used as a heading / <html> lang is separate). */
  nativeLabel: string;
  /** The default locale is served at the root with no prefix. */
  isDefault?: boolean;
}

export const LOCALES: LocaleConfig[] = [
  { code: "en", htmlLang: "en", ogLocale: "en_US", label: "English", nativeLabel: "English", isDefault: true },
  { code: "pt-br", htmlLang: "pt-BR", ogLocale: "pt_BR", label: "Português (Brasil)", nativeLabel: "Português (Brasil)" },
  { code: "id", htmlLang: "id", ogLocale: "id_ID", label: "Bahasa Indonesia", nativeLabel: "Bahasa Indonesia" },
  { code: "es-mx", htmlLang: "es-MX", ogLocale: "es_MX", label: "Español (México)", nativeLabel: "Español (México)" },
  { code: "es-co", htmlLang: "es-CO", ogLocale: "es_CO", label: "Español (Colombia)", nativeLabel: "Español (Colombia)" },
  { code: "de", htmlLang: "de", ogLocale: "de_DE", label: "Deutsch", nativeLabel: "Deutsch" },
  { code: "fr", htmlLang: "fr", ogLocale: "fr_FR", label: "Français", nativeLabel: "Français" },
  { code: "it", htmlLang: "it", ogLocale: "it_IT", label: "Italiano", nativeLabel: "Italiano" },
];

export const DEFAULT_LOCALE = "en";

export const localeByCode = (code?: string | null): LocaleConfig | undefined =>
  LOCALES.find((l) => l.code === (code ?? "").toLowerCase());

export const isSupportedLocale = (code?: string | null): boolean =>
  Boolean(localeByCode(code));

/** Locale prefix ("" for default so existing English URLs are untouched). */
export const localePrefix = (code: string): string =>
  code === DEFAULT_LOCALE ? "" : `/${code}`;

/** Sitemap / canonical locale codes for hreflang (htmlLang is used in hreflang). */
export const hreflangLocale = (code: string): string =>
  localeByCode(code)?.htmlLang ?? code;
