/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Check My Website — the first Website Studio tool. One URL in, shared
 * analysis engine out, presented as an explorer-style findings report.
 */

import React, { useState } from "react";
import { Globe, RefreshCw } from "lucide-react";
import { useWebsiteScan } from "../analysis/useWebsiteScan";
import { summarize } from "../analysis/engine";
import type { ViewState } from "../types";
import { Button, Card, EmptyState, ErrorState, ProcessingState } from "./Common";
import {
  FindingGroup,
  ScanDetails,
  ScanUrlForm,
  SummaryBar,
} from "./websiteStudio/shared";

interface CheckMyWebsiteProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const CheckMyWebsite: React.FC<CheckMyWebsiteProps> = ({
  onCopy,
  onAddToast,
  onChangeView,
}) => {
  const { state, findings, scan, reset } = useWebsiteScan();
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

  const summary = state.phase === "done" ? summarize(state.result.findings) : null;
  const errors = findings.filter((f) => f.status === "ERROR");
  const warnings = findings.filter((f) => f.status === "WARNING");
  const passes = findings.filter((f) => f.status === "PASS");
  const notDetectable = findings.filter((f) => f.status === "NOT DETECTABLE");

  return (
    <div className="space-y-5" id="tool-panel-check-my-website">
      <Card
        title="Scan a URL"
        subtitle="Fetches the page, robots.txt and sitemap, then samples up to 8 same-origin links and 6 assets. Private and loopback addresses are blocked."
      >
        <ScanUrlForm
          value={url}
          onChange={setUrl}
          onSubmit={handleSubmit}
          scanning={scanning}
          submitLabel="Check my website"
        />
        <div
          aria-live="polite"
          role="status"
          className="min-h-[24px] text-sm text-text-muted"
        >
          {state.phase === "scanning" &&
            "Fetching page, robots.txt, sitemap and a bounded link sample…"}
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

      {scanning && (
        <ProcessingState message="Scanning website — this usually takes a few seconds." />
      )}

      {state.phase === "done" && summary && (
        <>
          <SummaryBar
            summary={summary}
            finalUrl={state.result.raw.finalUrl}
            durationMs={state.result.raw.durationMs}
          />

          <div className="space-y-5">
            <FindingGroup
              title="Critical errors"
              hint="Fix these first — they block indexing, security or basic usability."
              findings={errors}
              onOpenTool={handleOpenTool}
              onCopy={handleCopy}
            />
            <FindingGroup
              title="Warnings"
              hint="Should be addressed for a healthy launch."
              findings={warnings}
              onOpenTool={handleOpenTool}
              onCopy={handleCopy}
            />
            <FindingGroup
              title="Passed checks"
              findings={passes}
              onOpenTool={handleOpenTool}
              onCopy={handleCopy}
              defaultOpen={false}
            />
            <FindingGroup
              title="Not detectable"
              hint="These cannot be measured from a static HTML fetch — no scores are invented."
              findings={notDetectable}
              onOpenTool={handleOpenTool}
              onCopy={handleCopy}
              defaultOpen={false}
            />
          </div>

          <ScanDetails raw={state.result.raw} />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Re-scan
            </Button>
            <Button variant="ghost" onClick={reset}>
              New scan
            </Button>
            {onChangeView && (
              <Button
                variant="outline"
                onClick={() => onChangeView({ type: "tool", id: "launch-checklist" })}
              >
                Open launch checklist
              </Button>
            )}
          </div>
        </>
      )}

      {state.phase === "idle" && (
        <EmptyState
          icon={<Globe className="w-8 h-8" />}
          title="Enter a URL to get started"
          description="Run a scan to see SEO, technical, social, image, accessibility, performance and security findings with plain-English fixes."
        />
      )}

      {state.phase === "error" && state.error.code !== "invalid-url" && (
        <ErrorState
          title="Scan could not complete"
          message={state.error.message}
          suggestion="Verify the URL is publicly reachable, then try again."
          action={
            <Button variant="primary" onClick={handleSubmit} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry scan
            </Button>
          }
        />
      )}
    </div>
  );
};

export default CheckMyWebsite;
