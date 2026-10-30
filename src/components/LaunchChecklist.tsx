/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Launch Checklist — the second Website Studio tool. Same engine and same
 * findings as Check My Website, regrouped as a pre-launch gate:
 * 🔴 CRITICAL → 🟡 IMPORTANT → ⚪ OPTIONAL, with cleared items and
 * not-detectable checks shown separately (never as fake passes).
 */

import React, { useState } from "react";
import { ClipboardCheck, RefreshCw, Rocket } from "lucide-react";
import { useWebsiteScan } from "../analysis/useWebsiteScan";
import type { Finding } from "../analysis/types";
import type { LaunchGateItem } from "../analysis/launch";
import type { ViewState } from "../types";
import { Button, Card, EmptyState, ErrorState, ProcessingState } from "./Common";
import { FindingRow, ScanUrlForm, ScanDetails, SummaryBar } from "./websiteStudio/shared";
import { summarize } from "../analysis/engine";

interface LaunchChecklistProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

const GateSection: React.FC<{
  emoji: string;
  title: string;
  hint: string;
  count: number;
  tone: string;
  children: React.ReactNode;
}> = ({ emoji, title, hint, count, tone, children }) => {
  const [open, setOpen] = useState(true);
  if (count === 0) return null;
  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true">{emoji}</span>
          <span className={`font-sans font-bold text-base md:text-lg ${tone}`}>{title}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-muted border border-border-light text-text-muted">
            {count}
          </span>
        </span>
        <span className="text-xs text-text-muted">{open ? "Hide" : "Show"}</span>
      </button>
      <p className="text-xs text-text-muted -mt-1">{hint}</p>
      {open && <ul className="space-y-2">{children}</ul>}
    </section>
  );
};

export const LaunchChecklist: React.FC<LaunchChecklistProps> = ({
  onCopy,
  onAddToast,
  onChangeView,
}) => {
  const { state, findings, gate, scan, reset } = useWebsiteScan();
  const [url, setUrl] = useState("");
  const scanning = state.phase === "scanning";

  const handleOpenTool = (id: string) => {
    if (!onChangeView) return;
    onChangeView({ type: "tool", id: id as never });
  };

  const handleCopy = (text: string) => {
    onCopy?.(text);
    onAddToast?.(text, "success");
  };

  const handleSubmit = () => {
    void scan(url);
  };

  const summary = state.phase === "done" ? summarize(findings) : null;
  const blocked = gate ? gate.critical.length > 0 : false;

  const renderGateItem = (item: LaunchGateItem | Finding) => (
    <FindingRow key={item.id} finding={item} onOpenTool={handleOpenTool} onCopy={handleCopy} />
  );

  return (
    <div className="space-y-5" id="tool-panel-launch-checklist">
      <Card
        title="Run the pre-launch gate"
        subtitle="Enter your live (or staging) URL. The same website scan is regrouped into critical, important and optional launch items — no scores, only observed signals."
      >
        <ScanUrlForm
          value={url}
          onChange={setUrl}
          onSubmit={handleSubmit}
          scanning={scanning}
          submitLabel="Run checklist"
        />
        <div aria-live="polite" role="status" className="min-h-[24px] text-sm text-text-muted">
          {state.phase === "scanning" && "Gathering launch signals…"}
          {state.phase === "error" && (
            <span className="text-status-error">{state.error.message}</span>
          )}
        </div>
        {state.phase === "error" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSubmit} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Try again
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear
            </Button>
          </div>
        )}
      </Card>

      {scanning && <ProcessingState message="Building your launch checklist…" />}

      {state.phase === "done" && summary && gate && (
        <>
          <div
            className={`rounded-[16px] border p-4 md:p-5 flex items-start gap-3 ${
              blocked
                ? "border-status-error/40 bg-status-error/[0.04]"
                : "border-status-success/40 bg-status-success/[0.04]"
            }`}
            role="status"
          >
            <span aria-hidden="true" className="text-xl mt-0.5">
              {blocked ? "🔴" : "🟢"}
            </span>
            <div className="min-w-0">
              <p className="font-sans font-bold text-text-main">
                {blocked
                  ? `Not ready to launch — ${gate.critical.length} critical item${gate.critical.length === 1 ? "" : "s"} open`
                  : "No critical blockers detected"}
              </p>
              <p className="text-sm text-text-sub mt-1">
                {blocked
                  ? "Clear every critical item below before going live."
                  : gate.important.length > 0
                    ? `${gate.important.length} important item${gate.important.length === 1 ? "" : "s"} remain — review them before or right after launch.`
                    : "Important and optional items are clear too. Re-scan after your next deploy."}
              </p>
            </div>
          </div>

          <SummaryBar
            summary={summary}
            finalUrl={state.result.raw.finalUrl}
            durationMs={state.result.raw.durationMs}
          />

          <div className="space-y-5">
            <GateSection
              emoji="🔴"
              title="Critical"
              hint="Launch blockers — page unreachable, non-200, noindex, robots blocking, missing HTTPS, mixed active content, broken interactive labels."
              count={gate.critical.length}
              tone="text-status-error"
            >
              {gate.critical.map(renderGateItem)}
            </GateSection>

            <GateSection
              emoji="🟡"
              title="Important"
              hint="Should be fixed before or immediately after launch: metadata, social cards, broken sampled links, headers, performance basics."
              count={gate.important.length}
              tone="text-status-warning"
            >
              {gate.important.map(renderGateItem)}
            </GateSection>

            <GateSection
              emoji="⚪"
              title="Optional"
              hint="Polish and hardening — rarely a launch blocker."
              count={gate.optional.length}
              tone="text-text-main"
            >
              {gate.optional.map(renderGateItem)}
            </GateSection>

            <GateSection
              emoji="✅"
              title="Cleared"
              hint="Checks that passed on this scan."
              count={gate.ready.length}
              tone="text-status-success"
            >
              {gate.ready.map(renderGateItem)}
            </GateSection>

            <GateSection
              emoji="❔"
              title="Not detectable"
              hint="Cannot be measured from a static HTML fetch — never counted as passed or failed."
              count={gate.notDetectable.length}
              tone="text-text-muted"
            >
              {gate.notDetectable.map(renderGateItem)}
            </GateSection>
          </div>

          <ScanDetails raw={state.result.raw} />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Re-run checklist
            </Button>
            <Button variant="ghost" onClick={reset}>
              New checklist
            </Button>
            {onChangeView && (
              <Button
                variant="outline"
                onClick={() => onChangeView({ type: "tool", id: "check-my-website" })}
                leftIcon={<GlobeIcon />}
              >
                Open full health check
              </Button>
            )}
          </div>
        </>
      )}

      {state.phase === "idle" && (
        <EmptyState
          icon={<Rocket className="w-8 h-8" />}
          title="Gate your launch"
          description="Run the scan to turn real signals into a critical / important / optional checklist before you ship."
          action={
            <Button
              variant="secondary"
              onClick={() => setUrl("https://example.com")}
              leftIcon={<ClipboardCheck className="w-4 h-4" />}
            >
              Prefill example.com
            </Button>
          }
        />
      )}

      {state.phase === "error" && state.error.code !== "invalid-url" && (
        <ErrorState
          title="Checklist could not complete"
          message={state.error.message}
          suggestion="Verify the URL is publicly reachable, then try again."
          action={
            <Button variant="primary" onClick={handleSubmit} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry
            </Button>
          }
        />
      )}
    </div>
  );
};

const GlobeIcon: React.FC = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default LaunchChecklist;
