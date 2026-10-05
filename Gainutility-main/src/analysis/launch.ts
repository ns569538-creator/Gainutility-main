/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Launch Checklist gate mapping: the same findings from the shared engine,
 * regrouped as CRITICAL / IMPORTANT / OPTIONAL so a pre-launch reviewer can
 * clear blockers first. PASS and NOT DETECTABLE findings are never treated
 * as blockers.
 */

import type { Finding, FindingStatus, LaunchPriority } from "./types";

/**
 * Explicit id → priority overrides. Anything not listed falls back to the
 * status-based default below.
 *
 * CRITICAL  — hard launch blockers (page unreachable, non-200, noindex,
 *             robots blocking crawlers, mixed active content, HTTPS off,
 *             nameless interactive controls / unlabelled fields that break
 *             basic usability).
 * IMPORTANT  — should fix before or immediately after launch (missing
 *             metadata, broken sampled links, missing social tags, short
 *             HSTS, compression/cache gaps…).
 * OPTIONAL   — polish and hardening that rarely blocks a launch.
 */
const PRIORITY_OVERRIDES: Record<string, LaunchPriority> = {
  "tech-page-unreachable": "CRITICAL",
  "tech-http-status": "CRITICAL",
  "tech-https": "CRITICAL",
  "tech-robots-txt": "CRITICAL",
  "seo-robots-noindex": "CRITICAL",
  "sec-https": "CRITICAL",
  "sec-mixed-content": "CRITICAL", // ERROR when active; downgraded below if only WARNING
  "a11y-links": "CRITICAL",
  "a11y-buttons": "CRITICAL",
  "a11y-form-labels": "CRITICAL",

  "tech-broken-links": "IMPORTANT",
  "seo-title": "IMPORTANT",
  "seo-description": "IMPORTANT",
  "seo-h1": "IMPORTANT",
  "seo-canonical": "IMPORTANT",
  "seo-sitemap": "IMPORTANT",
  "seo-robots-sitemap-directive": "IMPORTANT",
  "tech-redirect-chain": "IMPORTANT",
  "tech-duplicate-urls": "IMPORTANT",
  "social-og": "IMPORTANT",
  "social-og-image": "IMPORTANT",
  "social-twitter-card": "IMPORTANT",
  "images-alt": "IMPORTANT",
  "images-size": "IMPORTANT",
  "a11y-main-landmark": "IMPORTANT",
  "a11y-headings": "IMPORTANT",
  "a11y-iframe-title": "IMPORTANT",
  "perf-doc-size": "IMPORTANT",
  "perf-render-blocking": "IMPORTANT",
  "perf-compression": "IMPORTANT",
  "sec-hsts": "IMPORTANT",
  "sec-csp": "IMPORTANT",
  "sec-nosniff": "IMPORTANT",
  "sec-referrer": "IMPORTANT",
  "sec-cookies": "IMPORTANT",
  "tech-parse": "IMPORTANT",

  "images-dimensions": "OPTIONAL",
  "images-format": "OPTIONAL",
  "images-lazy": "OPTIONAL",
  "social-og-url": "OPTIONAL",
  "perf-resource-count": "OPTIONAL",
  "perf-resource-weight": "OPTIONAL",
  "perf-cache": "OPTIONAL",
  "sec-permissions": "OPTIONAL",
  "seo-hreflang": "OPTIONAL",
  "seo-structured-data": "OPTIONAL",
};

/** Fallback when a finding id has no explicit override. */
const DEFAULT_PRIORITY: Record<FindingStatus, LaunchPriority> = {
  ERROR: "CRITICAL",
  WARNING: "IMPORTANT",
  PASS: "OPTIONAL", // informational only — never counted as a blocker
  "NOT DETECTABLE": "OPTIONAL",
};

export function launchPriorityOf(finding: Finding): LaunchPriority {
  const override = PRIORITY_OVERRIDES[finding.id];
  if (override) {
    // Passive mixed content (WARNING) is important, not critical; active
    // mixed content (ERROR) stays critical. Same id, different severity.
    if (finding.id === "sec-mixed-content" && finding.status !== "ERROR") {
      return "IMPORTANT";
    }
    return override;
  }
  return DEFAULT_PRIORITY[finding.status];
}

export interface LaunchGateItem extends Finding {
  priority: LaunchPriority;
}

export interface LaunchGate {
  critical: LaunchGateItem[];
  important: LaunchGateItem[];
  optional: LaunchGateItem[];
  ready: Finding[]; // PASS findings — shown as "cleared"
  notDetectable: Finding[];
}

/**
 * Split findings into the three-tier launch gate plus the cleared and
 * not-detectable lists (which are displayed separately and never block).
 */
export function buildLaunchGate(findings: Finding[]): LaunchGate {
  const gate: LaunchGate = { critical: [], important: [], optional: [], ready: [], notDetectable: [] };
  for (const f of findings) {
    if (f.status === "PASS") {
      gate.ready.push(f);
      continue;
    }
    if (f.status === "NOT DETECTABLE") {
      gate.notDetectable.push(f);
      continue;
    }
    const item: LaunchGateItem = { ...f, priority: launchPriorityOf(f) };
    if (item.priority === "CRITICAL") gate.critical.push(item);
    else if (item.priority === "IMPORTANT") gate.important.push(item);
    else gate.optional.push(item);
  }
  return gate;
}

/** True when the gate has at least one open CRITICAL item (not ready to launch). */
export function hasLaunchBlockers(gate: LaunchGate): boolean {
  return gate.critical.length > 0;
}
