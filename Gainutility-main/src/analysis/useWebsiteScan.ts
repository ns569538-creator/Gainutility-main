/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client hook that drives a website scan: POST /api/analyze → run the
 * shared engine → expose findings (and the launch-gate view derived from
 * them). One hook, two tools.
 */

import { useCallback, useRef, useState } from "react";
import type { AnalysisResult, Finding, ScanErrorCode } from "./types";
import { runAnalysis } from "./engine";
import { buildLaunchGate, type LaunchGate } from "./launch";

export interface ScanError {
  code: ScanErrorCode | string;
  message: string;
}

export type ScanState =
  | { phase: "idle" }
  | { phase: "scanning" }
  | { phase: "done"; result: AnalysisResult }
  | { phase: "error"; error: ScanError };

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-url": "Enter a full URL including https://",
  blocked: "That address cannot be scanned (private, loopback or non-standard target).",
  timeout: "The site took too long to respond. Try again in a moment.",
  dns: "The hostname could not be resolved. Check the spelling.",
  tls: "The site's TLS certificate could not be verified.",
  unreachable: "The site could not be reached from our servers.",
  "rate-limited": "Too many scans from this network. Please wait a minute.",
  "server-error": "The scan failed unexpectedly. Please try again.",
  "invalid-request": "The request was malformed. Please try again.",
  "cross-origin": "Cross-origin scans are not allowed.",
  network: "Network error — check your connection and try again.",
};

const messageFor = (code: string, fallback?: string): string =>
  ERROR_MESSAGES[code] ?? fallback ?? "The scan failed. Please try again.";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export interface WebsiteScan {
  state: ScanState;
  /** Analysis findings when done, else empty. */
  findings: Finding[];
  /** Launch-gate view of the same findings (for the checklist tool). */
  gate: LaunchGate | null;
  /** Start a scan. Returns true when the request was dispatched. */
  scan: (url: string) => Promise<boolean>;
  /** Reset to idle. */
  reset: () => void;
}

export function useWebsiteScan(): WebsiteScan {
  const [state, setState] = useState<ScanState>({ phase: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const scan = useCallback(async (rawUrl: string): Promise<boolean> => {
    const url = normalizeUrl(rawUrl);
    if (!url) {
      setState({
        phase: "error",
        error: { code: "invalid-url", message: ERROR_MESSAGES["invalid-url"] },
      });
      return false;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setState({
          phase: "error",
          error: { code: "invalid-url", message: ERROR_MESSAGES["invalid-url"] },
        });
        return false;
      }
    } catch {
      setState({
        phase: "error",
        error: { code: "invalid-url", message: ERROR_MESSAGES["invalid-url"] },
      });
      return false;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ phase: "scanning" });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      let payload: unknown = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (!res.ok) {
        const err = (payload as { error?: { code?: string; message?: string } } | null)?.error;
        const code = err?.code ?? (res.status === 429 ? "rate-limited" : "server-error");
        setState({
          phase: "error",
          error: { code, message: messageFor(code, err?.message) },
        });
        return false;
      }
      if (!payload || typeof payload !== "object") {
        setState({
          phase: "error",
          error: { code: "server-error", message: messageFor("server-error") },
        });
        return false;
      }
      const result = runAnalysis(payload as never);
      setState({ phase: "done", result });
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return false;
      }
      setState({
        phase: "error",
        error: { code: "network", message: ERROR_MESSAGES["network"] },
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ phase: "idle" });
  }, []);

  const findings = state.phase === "done" ? state.result.findings : [];
  const gate = state.phase === "done" ? buildLaunchGate(state.result.findings) : null;

  return { state, findings, gate, scan, reset };
}
