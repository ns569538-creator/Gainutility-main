/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared types for the Website Studio analysis engine. One engine, two
 * presentations (Check My Website + Launch Checklist).
 */

import type { ToolId } from "../types";

export type FindingStatus = "PASS" | "WARNING" | "ERROR" | "NOT DETECTABLE";

export type FindingCategory =
  | "seo"
  | "technical"
  | "social"
  | "images"
  | "accessibility"
  | "performance"
  | "security";

export type LaunchPriority = "CRITICAL" | "IMPORTANT" | "OPTIONAL";

export interface Finding {
  /** Stable machine id (also used for launch-priority mapping). */
  id: string;
  category: FindingCategory;
  status: FindingStatus;
  /** Short human title. */
  title: string;
  /** What was checked / what was found. */
  what: string;
  /** Why it matters. */
  why: string;
  /** Concrete how-to-fix guidance. */
  how: string;
  /** Technical evidence (header values, URLs, counts). */
  evidence?: string;
  /** Text offered for one-click copy (e.g. a starter CSP snippet). */
  copyText?: string;
  /** Optional related existing GainUtility tool (never a placeholder). */
  fixTool?: ToolId;
}

export type ScanErrorCode =
  | "invalid-url"
  | "blocked"
  | "timeout"
  | "dns"
  | "tls"
  | "unreachable"
  | "rate-limited"
  | "server-error"
  | "invalid-request"
  | "cross-origin"
  | "network";

export interface RedirectHop {
  url: string;
  status: number;
}

export interface PageSignals {
  status: number;
  headers: Record<string, string>;
  html: string;
  bytes: number;
  contentType: string;
}

export interface RobotsSignals {
  url: string;
  status: number | null;
  text: string | null;
  error?: string;
}

export interface SitemapSignals {
  url: string | null;
  status: number | null;
  urlCount: number | null;
  declaredBy: "robots" | "default" | null;
  error?: string;
}

export interface SampleSignal {
  url: string;
  kind: "link" | "asset";
  status: number | null;
  bytes: number | null;
  error?: string;
}

/** Raw, interpretation-free signals returned by /api/analyze. */
export interface RawSignals {
  requestedUrl: string;
  finalUrl: string;
  hops: RedirectHop[];
  page: PageSignals;
  robots: RobotsSignals;
  sitemap: SitemapSignals;
  samples: SampleSignal[];
  durationMs: number;
  fetchedAt: string;
}

export interface AnalysisResult {
  raw: RawSignals;
  findings: Finding[];
  fetchedAt: string;
}
