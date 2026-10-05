/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared Website Studio UI: status chips, expandable finding rows and the
 * results panel used by both Check My Website and Launch Checklist.
 * Status is never communicated by colour alone — every chip pairs an icon
 * with text. Scans announce progress via aria-live.
 */

import React, { useId, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  CircleHelp,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";
import type { Finding, FindingStatus, RawSignals } from "../../analysis/types";
import type { FindingSummary } from "../../analysis/engine";
import { Button, Card } from "../Common";

/* ── Status chip ─────────────────────────────────────────────────────── */

const STATUS_META: Record<FindingStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  PASS: {
    label: "Pass",
    icon: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
    cls: "bg-status-success/10 text-status-success border-status-success/30",
  },
  WARNING: {
    label: "Warning",
    icon: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
    cls: "bg-status-warning/10 text-status-warning border-status-warning/30",
  },
  ERROR: {
    label: "Error",
    icon: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
    cls: "bg-status-error/10 text-status-error border-status-error/30",
  },
  "NOT DETECTABLE": {
    label: "Not detectable",
    icon: <CircleHelp className="w-4 h-4" aria-hidden="true" />,
    cls: "bg-surface-muted text-text-muted border-border-light",
  },
};

export const StatusChip: React.FC<{ status: FindingStatus; className?: string }> = ({
  status,
  className = "",
}) => {
  const meta = STATUS_META[status] ?? STATUS_META["NOT DETECTABLE"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${meta.cls} ${className}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
};

/* ── Expandable finding row ──────────────────────────────────────────── */

interface FindingRowProps {
  finding: Finding;
  onOpenTool?: (id: string) => void;
  onCopy?: (text: string) => void;
}

export const FindingRow: React.FC<FindingRowProps> = ({ finding, onOpenTool, onCopy }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const copyEvidence = async () => {
    if (!finding.copyText && !finding.evidence) return;
    const text = finding.copyText ?? finding.evidence ?? "";
    try {
      await navigator.clipboard.writeText(text);
      onCopy?.("Copied to clipboard");
    } catch {
      onCopy?.("Could not copy — select the text manually");
    }
  };

  return (
    <li className="border border-border-light rounded-[14px] bg-surface-base overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-muted/40 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-[14px]"
      >
        <span className="mt-0.5 shrink-0">
          <StatusChip status={finding.status} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-sans font-semibold text-sm text-text-main leading-snug">
            {finding.title}
          </span>
          <span className="block text-xs text-text-muted mt-0.5 uppercase tracking-wide font-mono">
            {finding.category}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 mt-1.5 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={panelId} className="px-4 pb-4 pt-1 border-t border-border-light/60 space-y-3">
          <div className="space-y-1.5 text-sm leading-relaxed">
            <p className="text-text-main">
              <span className="font-semibold">What:</span> {finding.what}
            </p>
            <p className="text-text-sub">
              <span className="font-semibold text-text-main">Why it matters:</span> {finding.why}
            </p>
            <p className="text-text-sub">
              <span className="font-semibold text-text-main">How to fix:</span> {finding.how}
            </p>
          </div>
          {(finding.evidence || finding.copyText) && (
            <div className="rounded-lg bg-surface-muted border border-border-light/60 p-3">
              <p className="text-[11px] uppercase tracking-wide text-text-muted font-semibold mb-1">
                Evidence
              </p>
              <pre className="whitespace-pre-wrap break-all font-mono text-xs text-text-main max-h-40 overflow-y-auto">
                {finding.copyText ?? finding.evidence}
              </pre>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={copyEvidence}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy
                </button>
                {finding.fixTool && onOpenTool && (
                  <button
                    type="button"
                    onClick={() => onOpenTool(finding.fixTool!)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Open related tool
                  </button>
                )}
              </div>
            </div>
          )}
          {!finding.copyText && finding.fixTool && onOpenTool && (
            <button
              type="button"
              onClick={() => onOpenTool(finding.fixTool!)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              Open related tool
            </button>
          )}
        </div>
      )}
    </li>
  );
};

/* ── Summary bar ─────────────────────────────────────────────────────── */

export const SummaryBar: React.FC<{
  summary: FindingSummary;
  finalUrl: string;
  durationMs?: number;
}> = ({ summary, finalUrl, durationMs }) => (
  <div className="rounded-[16px] border border-border-light bg-surface-muted/30 p-4 md:p-5 space-y-3">
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-text-muted font-semibold">Scanned URL</p>
      <p className="font-mono text-sm text-text-main break-all select-all">{finalUrl}</p>
      {typeof durationMs === "number" && (
        <p className="text-xs text-text-muted mt-1">
          Completed in {(durationMs / 1000).toFixed(1)}s · {new Date().toLocaleString()}
        </p>
      )}
    </div>
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[
        { label: "Checks", value: summary.total, cls: "text-text-main" },
        { label: "Passed", value: summary.pass, cls: "text-status-success" },
        { label: "Warnings", value: summary.warning, cls: "text-status-warning" },
        { label: "Errors", value: summary.error, cls: "text-status-error" },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-lg bg-surface-base border border-border-light px-3 py-2"
        >
          <dt className="text-[11px] uppercase tracking-wide text-text-muted font-semibold">
            {item.label}
          </dt>
          <dd className={`font-mono font-bold text-lg ${item.cls}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
    {summary.notDetectable > 0 && (
      <p className="text-xs text-text-muted flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        {summary.notDetectable} check{summary.notDetectable === 1 ? "" : "s"} could not be detected from
        a static fetch (no scores are invented for them).
      </p>
    )}
  </div>
);

/* ── Findings group ──────────────────────────────────────────────────── */

export const FindingGroup: React.FC<{
  title: string;
  hint?: string;
  findings: Finding[];
  onOpenTool?: (id: string) => void;
  onCopy?: (text: string) => void;
  defaultOpen?: boolean;
}> = ({ title, hint, findings, onOpenTool, onCopy, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (findings.length === 0) return null;
  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-sans font-bold text-base md:text-lg text-text-main">
            {title}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-muted border border-border-light text-text-muted">
            {findings.length}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {hint && open && <p className="text-xs text-text-muted -mt-1">{hint}</p>}
      {open && (
        <ul className="space-y-2">
          {findings.map((f) => (
            <FindingRow key={f.id} finding={f} onOpenTool={onOpenTool} onCopy={onCopy} />
          ))}
        </ul>
      )}
    </section>
  );
};

/* ── Scan details (redirect chain, robots, sitemap, samples) ─────────── */

export const ScanDetails: React.FC<{ raw: RawSignals }> = ({ raw }) => (
  <Card title="Scan details" subtitle="Raw evidence from the bounded fetch.">
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">
          Redirect chain
        </p>
        {raw.hops.length === 0 ? (
          <p className="text-text-sub font-mono text-xs">No redirects — resolved directly.</p>
        ) : (
          <ol className="space-y-1 font-mono text-xs text-text-main break-all">
            {raw.hops.map((hop, i) => (
              <li key={`${hop.url}-${i}`}>
                {hop.url} → <span className="text-status-warning">{hop.status}</span>
              </li>
            ))}
            <li className="text-status-success">{raw.finalUrl} → {raw.page.status}</li>
          </ol>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">
            robots.txt
          </p>
          <p className="font-mono text-xs text-text-main break-all">
            {raw.robots.url} → {raw.robots.status ?? raw.robots.error ?? "unknown"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">
            Sitemap
          </p>
          <p className="font-mono text-xs text-text-main break-all">
            {raw.sitemap.url ?? "(default /sitemap.xml)"} →{" "}
            {raw.sitemap.status ?? raw.sitemap.error ?? "unknown"}
            {raw.sitemap.urlCount !== null ? ` · ${raw.sitemap.urlCount} URLs` : ""}
          </p>
        </div>
      </div>
      {raw.samples.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">
            Sampled URLs ({raw.samples.length})
          </p>
          <ul className="space-y-1 font-mono text-xs">
            {raw.samples.map((s) => (
              <li key={s.url} className="break-all text-text-main">
                [{s.kind}] {s.url} →{" "}
                <span
                  className={
                    s.error === "robots-disallowed"
                      ? "text-text-muted"
                      : s.status !== null && s.status >= 400
                        ? "text-status-error"
                        : s.status !== null
                          ? "text-status-success"
                          : "text-status-warning"
                  }
                >
                  {s.status ?? s.error ?? "unknown"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-text-muted">
        Bounds: 1 page · ≤ 8 links · ≤ 6 assets · 15s timeout · private/loopback hosts blocked.
      </p>
    </div>
  </Card>
);

/* ── Primary scan form ───────────────────────────────────────────────── */

export const ScanUrlForm: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  scanning: boolean;
  submitLabel: string;
  placeholder?: string;
}> = ({ value, onChange, onSubmit, scanning, submitLabel, placeholder }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    className="flex flex-col sm:flex-row gap-3"
    id="website-studio-scan-form"
  >
    <label htmlFor="website-studio-url" className="sr-only">
      Website URL to scan
    </label>
    <input
      id="website-studio-url"
      type="url"
      inputMode="url"
      autoComplete="url"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "https://example.com"}
      disabled={scanning}
      className="flex-1 min-w-0 px-4 sm:px-5 text-base rounded-[14px] bg-surface-base border border-border-light text-text-main placeholder-text-muted/60 outline-none h-[48px] md:h-[52px] focus:border-border-focus focus:ring-1 focus:ring-border-focus disabled:opacity-60 font-mono"
    />
    <Button
      type="submit"
      variant="primary"
      loading={scanning}
      disabled={scanning}
      className="sm:w-auto w-full"
    >
      {scanning ? "Scanning…" : submitLabel}
    </Button>
  </form>
);
