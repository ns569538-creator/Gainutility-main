import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Copy, 
  Download, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileCode,
  ShieldCheck,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface CanonicalUrlGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const CanonicalUrlGenerator: React.FC<CanonicalUrlGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const [urlInput, setUrlInput] = useState("https://gainutility.com/blog/seo-meta-tips");
  const [canonicalTag, setCanonicalTag] = useState("");
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    hasProtocol: boolean;
    hasQueryParams: boolean;
    hasTrailingSlash: boolean;
    isAbsolute: boolean;
    isLowercase: boolean;
  }>({
    isValid: true,
    hasProtocol: true,
    hasQueryParams: false,
    hasTrailingSlash: false,
    isAbsolute: true,
    isLowercase: true
  });

  // Load from Smart Handoff on mount
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        setUrlInput(data.url);
        onAddToast("Imported domain URL via Smart Handoff!", "success");
      }
      // Clear handoff once consumed
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  useEffect(() => {
    validateAndGenerate();
  }, [urlInput]);

  const validateAndGenerate = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setCanonicalTag("");
      return;
    }

    let hasProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://");
    let hasQueryParams = trimmed.includes("?") || trimmed.includes("&");
    let hasTrailingSlash = trimmed.endsWith("/");
    let isAbsolute = false;
    let isLowercase = true;

    try {
      if (hasProtocol) {
        const parsed = new URL(trimmed);
        isAbsolute = parsed.protocol === "http:" || parsed.protocol === "https:";
        // Check if path contains uppercase
        isLowercase = parsed.pathname === parsed.pathname.toLowerCase() && parsed.hostname === parsed.hostname.toLowerCase();
      }
    } catch (e) {
      isAbsolute = false;
    }

    setValidationResults({
      isValid: hasProtocol && isAbsolute && !hasQueryParams,
      hasProtocol,
      hasQueryParams,
      hasTrailingSlash,
      isAbsolute,
      isLowercase
    });

    setCanonicalTag(`<link rel="canonical" href="${trimmed}" />`);
  };

  const handleCopyTag = () => {
    if (!canonicalTag) return;
    onCopy(canonicalTag);
    onAddToast("Canonical tag copied!", "success");
  };

  const handleDownloadTag = () => {
    if (!canonicalTag) return;
    const blob = new Blob([canonicalTag], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "canonical.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast("Canonical tag downloaded as HTML!", "success");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Card title="Configure Canonical URL" subtitle="Input your primary source of truth URL page.">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-main font-sans">
                  Target Page URL (Absolute Path Required)
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://gainutility.com/blog/sample-slug"
                  className="w-full px-5 py-3.5 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Live URL Audit/Validation checklist */}
              <div className="border border-border-light/60 rounded-[16px] p-5 bg-surface-muted/10 space-y-3.5">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-primary" /> URL Integrity Validation Checklist
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-sm">
                    {validationResults.hasProtocol ? (
                      <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                    )}
                    <span className={validationResults.hasProtocol ? "text-text-main" : "text-status-warning font-semibold"}>
                      HTTPS Protocol Scheme
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    {!validationResults.hasQueryParams ? (
                      <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                    )}
                    <span className={!validationResults.hasQueryParams ? "text-text-main" : "text-status-warning font-semibold"}>
                      No Tracking Parameters (?utm, ?id)
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    {validationResults.isAbsolute ? (
                      <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                    )}
                    <span className={validationResults.isAbsolute ? "text-text-main" : "text-status-warning font-semibold"}>
                      Fully Absolute Domain URL
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    {validationResults.isLowercase ? (
                      <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                    )}
                    <span className={validationResults.isLowercase ? "text-text-main" : "text-status-warning font-semibold"}>
                      Clean Lowercase Path Syntax
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Best Practices Tips */}
          <Card title="Best Practice Tips" subtitle="Guidelines to avoid indexing hazards.">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-brand-primary/10 rounded text-brand-primary font-mono text-xs font-bold shrink-0 mt-0.5">
                  01
                </div>
                <p className="text-text-sub leading-relaxed">
                  <strong>Self-Referencing Links:</strong> Always generate a canonical tag referencing the page itself unless it is a literal duplicate of a primary resource.
                </p>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-brand-primary/10 rounded text-brand-primary font-mono text-xs font-bold shrink-0 mt-0.5">
                  02
                </div>
                <p className="text-text-sub leading-relaxed">
                  <strong>Consistent Slashing:</strong> Standardize whether your URLs end with a trailing slash (`/`) or not, and stick to it across your sitemap and links.
                </p>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-brand-primary/10 rounded text-brand-primary font-mono text-xs font-bold shrink-0 mt-0.5">
                  03
                </div>
                <p className="text-text-sub leading-relaxed">
                  <strong>Lowercase Pathing:</strong> Avoid camelCased URLs. Search engine crawlers treat `blog/seo` and `blog/Seo` as different pages.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Card 
            title="Generated Canonical HTML Tag" 
            subtitle="Add this inside the `<head>` of your website code."
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTag} leftIcon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyTag} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy HTML
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <textarea aria-label="Generated canonical tag"
                  readOnly
                  value={canonicalTag}
                  className="w-full h-[120px] p-4 text-base sm:text-sm font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                  Canonical tag format
                </div>
              </div>

              <div className="border-t border-border-light/60 pt-4 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Head Layout Placement Mockup
                </h4>
                <div className="p-4 bg-surface-muted/20 border border-border-light rounded-[14px] font-mono text-xs text-text-sub leading-relaxed overflow-x-auto whitespace-pre">
                  {`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Title</title>
  ${canonicalTag || "<!-- Canonical link tag goes here -->"}
</head>
<body>
...`}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Smart Continue Editing */}
      <ContinueEditing 
        currentToolId="canonical-url-generator"
        seoData={{ url: urlInput }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* How It Works & Educational */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> How Does Canonical URL Help?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            A canonical link prevents duplicate content issues by specifying the single preferred version of a webpage to search engines. If your site serves identical blog posts or product listings over different paths (e.g. mobile variants, tracking params), setting a canonical tag guides PageRank scores directly to your primary URL asset.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Confidential & Secure
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All audits, syntax checking, and code compiler routines run completely in-browser utilizing client-side script routines. Your paths, domains, and internal directory configurations are never uploaded to our servers or processed on any third-party clouds.
          </p>
        </div>
      </div>
    </div>
  );
};
