/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared analysis engine: RawSignals → Finding[]. Both Check My Website
 * and Launch Checklist consume this exact output — one engine, two
 * presentations.
 *
 * DOM parsing happens here (client-side after the fetch proxy returns).
 * The module never touches `window`/`DOMParser` at import time so the
 * static prerender can import it safely.
 */

import type { AnalysisResult, Finding, FindingCategory, FindingStatus, RawSignals } from "./types";
import { runSeoChecks } from "./checks/seo";
import { runTechnicalChecks } from "./checks/technical";
import { runSocialChecks } from "./checks/social";
import { runImageChecks } from "./checks/images";
import { runAccessibilityChecks } from "./checks/accessibility";
import { runPerformanceChecks } from "./checks/performance";
import { runSecurityChecks } from "./checks/security";

/** Parse HTML into a Document; returns null when DOMParser is unavailable. */
function parseHtml(html: string): Document | null {
  if (typeof DOMParser === "undefined") return null;
  try {
    return new DOMParser().parseFromString(html, "text/html");
  } catch {
    return null;
  }
}

const CATEGORY_ORDER: FindingCategory[] = [
  "seo",
  "technical",
  "social",
  "images",
  "accessibility",
  "performance",
  "security",
];

const STATUS_ORDER: Record<FindingStatus, number> = {
  ERROR: 0,
  WARNING: 1,
  PASS: 2,
  "NOT DETECTABLE": 3,
};

/** Run every check category and return a sorted, deduplicated finding list. */
export function runAnalysis(raw: RawSignals): AnalysisResult {
  const findings: Finding[] = [];

  if (!raw.page || raw.page.status >= 400 || !raw.page.html) {
    // Page did not return usable HTML — surface a single honest error and
    // still report robots/sitemap signals we managed to collect.
    findings.push({
      id: "tech-page-unreachable",
      category: "technical",
      status: "ERROR",
      title: raw.page
        ? `Page returned HTTP ${raw.page.status}`
        : "Page could not be fetched",
      what: raw.page
        ? `The main document returned status ${raw.page.status}${raw.page.contentType ? ` (${raw.page.contentType})` : ""}.`
        : "The fetch proxy did not return a page body for this URL.",
      why: "On-page checks need a successful HTML response; without one there is nothing to inspect.",
      how: "Fix the URL, DNS, TLS or server error, then run the scan again. Errors from the fetch are listed under Details.",
      evidence: raw.page
        ? `status ${raw.page.status}, ${raw.page.bytes} bytes`
        : "no page body",
    });
    findings.push(...runTechnicalChecks(raw));
    // robots/sitemap signals are reported by runTechnicalChecks above; no
    // DOM checks can run without page HTML.
  } else {
    const doc = parseHtml(raw.page.html);
    if (!doc) {
      findings.push({
        id: "tech-parse",
        category: "technical",
        status: "ERROR",
        title: "HTML could not be parsed in this environment",
        what: "DOMParser is unavailable, so on-page checks were skipped.",
        why: "The engine needs a DOM to inspect tags, headings and attributes.",
        how: "Re-run this scan in a modern browser.",
      });
    } else {
      findings.push(...runSeoChecks(raw, doc));
      findings.push(...runSocialChecks(raw, doc));
      findings.push(...runImageChecks(raw, doc));
      findings.push(...runAccessibilityChecks(raw, doc));
      findings.push(...runPerformanceChecks(raw, doc));
      findings.push(...runSecurityChecks(raw, doc));
    }
    findings.push(...runTechnicalChecks(raw));
  }

  // Deduplicate by id (first occurrence wins — checks are authoritative).
  const seen = new Set<string>();
  const deduped: Finding[] = [];
  for (const f of findings) {
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    deduped.push(f);
  }

  deduped.sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 9;
    const sb = STATUS_ORDER[b.status] ?? 9;
    if (sa !== sb) return sa - sb;
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.id.localeCompare(b.id);
  });

  return {
    raw,
    findings: deduped,
    fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
  };
}

export interface FindingSummary {
  total: number;
  pass: number;
  warning: number;
  error: number;
  notDetectable: number;
}

export function summarize(findings: Finding[]): FindingSummary {
  const s: FindingSummary = { total: findings.length, pass: 0, warning: 0, error: 0, notDetectable: 0 };
  for (const f of findings) {
    if (f.status === "PASS") s.pass++;
    else if (f.status === "WARNING") s.warning++;
    else if (f.status === "ERROR") s.error++;
    else s.notDetectable++;
  }
  return s;
}
