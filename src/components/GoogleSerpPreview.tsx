import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Eye, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Smartphone,
  Monitor,
  ShieldCheck,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface GoogleSerpPreviewProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const GoogleSerpPreview: React.FC<GoogleSerpPreviewProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Input states
  const [title, setTitle] = useState("Aesthetic Developer Utilities & Offline Formatter Studio");
  const [description, setDescription] = useState("Format nested JSON configuration trees, compress images locally, audit WCAG hex contrast standards, and generate clean SEO header tags completely inside your browser sandbox.");
  const [url, setUrl] = useState("https://gainutility.com/developer-studio");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const [pixelMetrics, setPixelMetrics] = useState({
    titlePx: 0,
    descPx: 0
  });

  // Load from Smart Handoff on mount
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.url) setUrl(data.url);
      onAddToast("Imported page properties via Smart Handoff!", "success");
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Calculate pixel widths using HTML5 Canvas measureText
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Standard Google Arial styling ratios
      ctx.font = device === "desktop" ? "20px Arial" : "18px Arial";
      const titlePx = Math.round(ctx.measureText(title).width);
      
      ctx.font = "14px Arial";
      const descPx = Math.round(ctx.measureText(description).width);

      setPixelMetrics({ titlePx, descPx });
    }
  }, [title, description, device]);

  // Character lengths
  const titleChars = title.length;
  const descChars = description.length;

  // Limits guidelines
  const titleCharMax = 60;
  const titlePxMax = device === "desktop" ? 580 : 360;
  
  const descCharMax = 160;
  const descPxMax = device === "desktop" ? 960 : 600;

  // Recommendations checklist
  const recommendations = useMemo(() => {
    const list = [];
    
    // Title Checks
    if (titleChars === 0) {
      list.push({ text: "Add a page title", status: "error" });
    } else if (titleChars > titleCharMax || pixelMetrics.titlePx > titlePxMax) {
      list.push({ text: `Title is too long (${titleChars} chars, ${pixelMetrics.titlePx}px). It will be truncated.`, status: "warning" });
    } else if (titleChars < 30) {
      list.push({ text: "Title is quite short. Expand to maximize click-through real estate.", status: "info" });
    } else {
      list.push({ text: "Title length and pixel boundaries are ideal.", status: "success" });
    }

    // Description Checks
    if (descChars === 0) {
      list.push({ text: "Add a meta description summary.", status: "error" });
    } else if (descChars > descCharMax || pixelMetrics.descPx > descPxMax) {
      list.push({ text: `Description is too long (${descChars} chars, ${pixelMetrics.descPx}px). It will be truncated.`, status: "warning" });
    } else if (descChars < 110) {
      list.push({ text: "Description is quite short. Use up to 160 characters for context.", status: "info" });
    } else {
      list.push({ text: "Description character & pixel weights are perfect.", status: "success" });
    }

    // URL Check
    if (!url.startsWith("https://")) {
      list.push({ text: "Ensure URL path has SSL active (https://).", status: "warning" });
    } else {
      list.push({ text: "Secure HTTPS schema detected.", status: "success" });
    }

    return list;
  }, [titleChars, descChars, pixelMetrics, device, url]);

  const handleCopyTag = (type: "title" | "desc" | "all") => {
    let copyText = "";
    if (type === "title") {
      copyText = `<title>${title}</title>`;
    } else if (type === "desc") {
      copyText = `<meta name="description" content="${description}" />`;
    } else {
      copyText = `<title>${title}</title>\n<meta name="description" content="${description}" />`;
    }
    onCopy(copyText);
    onAddToast(`Copied requested HTML metadata tags!`, "success");
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    onAddToast("Snippet form cleared.", "info");
  };

  const loadPreset = () => {
    setTitle("Responsive CSS Grid Layout Builder — Offline Web Suite");
    setDescription("Assemble responsive flex containers, custom pixel grid matrices, and download pure CSS token classes entirely offline.");
    setUrl("https://gainutility.com/css-studio");
    onAddToast("Loaded sample CSS snippet configurations!", "success");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Main Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left configurations form */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Snippet Configurations" subtitle="Review pixel parameters dynamically.">
            <div className="space-y-4">
              
              {/* Page Title */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  <label>SEO Title Tag (`&lt;title&gt;`)</label>
                  <span className={titleChars > titleCharMax ? "text-status-error" : "text-status-success"}>
                    {titleChars} / {titleCharMax} chars ({pixelMetrics.titlePx}px)
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The primary SEO page title tag..."
                  className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {/* Visual bar graph */}
                <div className="w-full h-1 bg-border-medium rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 ${
                      titleChars <= titleCharMax ? "bg-status-success" : "bg-status-error"
                    }`}
                    style={{ width: `${Math.min(100, (titleChars / titleCharMax) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  <label>Meta Description Tag</label>
                  <span className={descChars > descCharMax ? "text-status-error" : "text-status-success"}>
                    {descChars} / {descCharMax} chars ({pixelMetrics.descPx}px)
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of webpage content..."
                  className="w-full h-[100px] p-4 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none leading-relaxed"
                />
                {/* Visual bar graph */}
                <div className="w-full h-1 bg-border-medium rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 ${
                      descChars <= descCharMax ? "bg-status-success" : "bg-status-error"
                    }`}
                    style={{ width: `${Math.min(100, (descChars / descCharMax) * 100)}%` }}
                  />
                </div>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Target Page URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://gainutility.com/blog-slug"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

            </div>
          </Card>

          {/* Action buttons */}
          <Card title="Metadata Code Exports" subtitle="Generate primary page tags instantly.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" size="sm" onClick={() => handleCopyTag("title")}>
                Copy Title Tag
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCopyTag("desc")}>
                Copy Desc Tag
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleCopyTag("all")}>
                Copy Both Tags
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Preview column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Simulated search engine listing snippet card */}
          <Card 
            title="Google Search Engine Snippet" 
            subtitle="Calculated live with authentic layout bounds."
            actions={
              <div className="flex border border-border-light rounded-xl overflow-hidden text-xs shrink-0 font-sans font-semibold">
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${
                    device === "desktop" ? "bg-brand-primary text-white font-bold" : "bg-surface-muted text-text-sub hover:bg-surface-hover"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${
                    device === "mobile" ? "bg-brand-primary text-white font-bold" : "bg-surface-muted text-text-sub hover:bg-surface-hover"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            }
          >
            <div className="p-6 bg-white dark:bg-[#1a1c1e] border border-border-medium rounded-2xl flex items-center justify-center min-h-[160px]">
              
              {device === "desktop" ? (
                // Google Desktop View Card
                <div className="w-full max-w-[580px] font-sans space-y-1">
                  <div className="text-[14px] text-[#202124] dark:text-[#bdc1c6] truncate flex items-center gap-1.5">
                    <span>{url || "https://yourwebsite.com/slug"}</span>
                    <span className="text-xs text-text-muted">▼</span>
                  </div>
                  <h3 className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] font-medium leading-tight hover:underline cursor-pointer truncate max-w-[580px]">
                    {title || "Untitled Search Listing"}
                  </h3>
                  <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2 max-w-[580px]">
                    {description || "Provide page parameters on the left to preview animated Google snippet layouts..."}
                  </p>
                </div>
              ) : (
                // Google Mobile View Card
                <div className="w-full max-w-[360px] font-sans space-y-1 bg-white dark:bg-[#1a1c1e] p-3 border border-slate-200 dark:border-slate-850 rounded-xl shadow-premium-sm">
                  <div className="text-xs text-[#202124] dark:text-[#bdc1c6] truncate flex items-center gap-1">
                    <span>{url || "yourwebsite.com/slug"}</span>
                  </div>
                  <h3 className="text-[18px] text-[#15c] dark:text-[#8ab4f8] font-semibold leading-snug hover:underline cursor-pointer line-clamp-2">
                    {title || "Untitled Mobile Listing"}
                  </h3>
                  <p className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                    {description || "Provide page meta description criteria..."}
                  </p>
                </div>
              )}

            </div>
          </Card>

          {/* Recommendations list */}
          <Card title="SEO Optimization Suggestions" subtitle="Live checks performed on your snippet metadata.">
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm">
                  {rec.status === "success" && <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />}
                  {rec.status === "warning" && <AlertTriangle className="w-4.5 h-4.5 text-status-warning shrink-0 mt-0.5" />}
                  {rec.status === "error" && <AlertTriangle className="w-4.5 h-4.5 text-status-error shrink-0 mt-0.5" />}
                  {rec.status === "info" && <Info className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />}
                  <span className={`leading-relaxed ${
                    rec.status === "success" ? "text-text-main" :
                    rec.status === "warning" ? "text-status-warning font-semibold" :
                    rec.status === "error" ? "text-status-error font-bold" : "text-text-sub"
                  }`}>
                    {rec.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="google-serp-preview"
        seoData={{ title, description, url }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* FAQ / Learn More section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> Google SERP Snippet FAQ
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-text-muted leading-relaxed">
              <strong>Why does pixel width matter more than character count?</strong>
              <br />
              Google uses Arial font for display headings. Since Arial contains proportional characters (e.g., 'W' is significantly wider than 'i'), Google measures the actual pixel bounding box. A title with 55 wide characters may truncate, while one with 65 narrow characters may fit perfectly.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Browser Calculations
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All snippet renders, HTML measurement checks, and pixel calculations are executed directly in your browser. We never capture or upload your staging paths, descriptions, or directories, guaranteeing 100% data secrecy.
          </p>
        </div>
      </div>
    </div>
  );
};
