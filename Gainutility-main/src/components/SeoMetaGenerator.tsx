import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Tags, 
  Copy, 
  RotateCcw, 
  Globe, 
  Download, 
  Check, 
  Eye, 
  Code,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface SeoMetaGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const SeoMetaGenerator: React.FC<SeoMetaGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Page properties state
  const [title, setTitle] = useState("Aesthetic Developer Utilities & Offline Formatter Studio");
  const [description, setDescription] = useState("Format nested JSON configuration trees, compress images locally, audit WCAG hex contrast standards, and generate clean SEO header tags completely inside your browser sandbox.");
  const [keywords, setKeywords] = useState("json-formatter, design-system, contrast-checker, free-seo-tools");
  const [canonical, setCanonical] = useState("https://gainutility.com/developer-studio");
  const [robots, setRobots] = useState("index, follow");
  const [author, setAuthor] = useState("GainUtility Studio Team");
  const [language, setLanguage] = useState("en");
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1.0");
  const [charset, setCharset] = useState("utf-8");
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [favicon, setFavicon] = useState("/favicon.ico");

  const [compiledHtml, setCompiledHtml] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [titlePx, setTitlePx] = useState(0);
  const [descPx, setDescPx] = useState(0);

  // Load from Smart Handoff on mount
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.url) setCanonical(data.url);
      onAddToast("Imported page properties via Smart Handoff!", "success");
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Calculate pixel widths using HTML5 Canvas measureText
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = previewDevice === "desktop" ? "20px Arial" : "18px Arial";
      setTitlePx(Math.round(ctx.measureText(title).width));

      ctx.font = "14px Arial";
      setDescPx(Math.round(ctx.measureText(description).width));
    }
  }, [title, description, previewDevice]);

  // Re-generate HTML block automatically
  useEffect(() => {
    generateHtml();
  }, [title, description, keywords, canonical, robots, author, language, viewport, charset, themeColor, favicon]);

  const generateHtml = () => {
    const lines = [
      `<!-- SEO Primary Meta Tags -->`,
      `<meta charset="${charset.trim()}">`,
      language ? `<meta http-equiv="content-language" content="${language}">` : null,
      `<title>${title.trim()}</title>`,
      `<meta name="title" content="${title.trim()}">`,
      `<meta name="description" content="${description.trim()}">`,
      keywords.trim() ? `<meta name="keywords" content="${keywords.trim()}">` : null,
      author.trim() ? `<meta name="author" content="${author.trim()}">` : null,
      `<meta name="viewport" content="${viewport.trim()}">`,
      themeColor ? `<meta name="theme-color" content="${themeColor}">` : null,
      favicon ? `<link rel="icon" type="image/x-icon" href="${favicon}">` : null,
      canonical.trim() ? `<link rel="canonical" href="${canonical.trim()}">` : null,
      `<meta name="robots" content="${robots}">`
    ].filter(Boolean);

    setCompiledHtml(lines.join("\n"));
  };

  const handleCopyCode = () => {
    if (!compiledHtml) return;
    onCopy(compiledHtml);
    onAddToast("Copied HTML meta tags to clipboard!", "success");
  };

  const handleDownloadHtml = () => {
    if (!compiledHtml) return;
    const blob = new Blob([compiledHtml], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seo_meta_tags_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast("SEO metadata file downloaded!", "success");
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setKeywords("");
    setCanonical("");
    setRobots("index, follow");
    setAuthor("");
    setLanguage("en");
    setViewport("width=device-width, initial-scale=1.0");
    setCharset("utf-8");
    setThemeColor("#4f46e5");
    setFavicon("/favicon.ico");
    onAddToast("SEO generator form wiped clean.", "info");
  };

  const loadSample = () => {
    setTitle("Aesthetic Developer Utilities & Offline Formatter Studio");
    setDescription("Explore free browser-side JSON formatters, word counters, color contrast audits, and SEO card engines without cloud telemetry.");
    setKeywords("json-formatter, design-system, contrast-checker, free-seo-tools");
    setCanonical("https://gainutility.com/developer-studio");
    setRobots("index, follow");
    setAuthor("Aesthetic Team");
    setLanguage("en");
    setViewport("width=device-width, initial-scale=1.0");
    setCharset("utf-8");
    setThemeColor("#6366f1");
    setFavicon("/favicon.ico");
    onAddToast("Loaded developer studio sample settings!", "success");
  };

  // Length helper metrics
  const titleLength = title.length;
  const descLength = description.length;

  // Recommendations checklist
  const suggestions = useMemo(() => {
    const list = [];
    if (titleLength === 0) {
      list.push({ text: "Add a title tag to prevent Google from auto-generating one.", type: "error" });
    } else if (titleLength > 60 || titlePx > (previewDevice === "desktop" ? 580 : 360)) {
      list.push({ text: "Title exceeds recommended limits. It will truncate in search listings.", type: "warning" });
    } else if (titleLength < 30) {
      list.push({ text: "Title is very short. Expand to maximize descriptive click real estate.", type: "info" });
    } else {
      list.push({ text: "Title width and length conform perfectly to search guidelines.", type: "success" });
    }

    if (descLength === 0) {
      list.push({ text: "Add a meta description to summarize page contents.", type: "error" });
    } else if (descLength > 160 || descPx > (previewDevice === "desktop" ? 960 : 600)) {
      list.push({ text: "Meta description exceeds pixel limits. Google will truncate the overflow.", type: "warning" });
    } else if (descLength < 110) {
      list.push({ text: "Meta description is a bit short. Add details to raise click conversions.", type: "info" });
    } else {
      list.push({ text: "Meta description character and pixel limits are optimal.", type: "success" });
    }

    if (!canonical.startsWith("https://")) {
      list.push({ text: "Ensure canonical URL holds an SSL schema prefix (https://).", type: "warning" });
    }

    return list;
  }, [titleLength, descLength, titlePx, descPx, canonical, previewDevice]);

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Page Meta Configurations" subtitle="Compile standard search headers.">
            <div className="space-y-4">
              
              {/* Document Title Tag */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  <label>Page Title Tag (`&lt;title&gt;`)</label>
                  <span className={titleLength > 60 ? "text-status-error" : "text-status-success"}>
                    {titleLength} / 60 chars ({titlePx}px)
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Master React Hooks & Visual Animation Curves"
                  className="w-full px-4 py-3 text-sm font-sans border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Document Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  <label>Meta Description (`&lt;meta name="description"&gt;`)</label>
                  <span className={descLength > 160 ? "text-status-error" : "text-status-success"}>
                    {descLength} / 160 chars ({descPx}px)
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a descriptive summary of your website page..."
                  className="w-full h-[90px] p-4 text-sm font-sans border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none leading-relaxed"
                />
              </div>

              {/* Keywords & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="tutorials, react, software"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Author / Publisher
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none"
                  />
                </div>
              </div>

              {/* Canonical URL & Theme Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Canonical Page URL
                  </label>
                  <input
                    type="text"
                    value={canonical}
                    onChange={(e) => setCanonical(e.target.value)}
                    placeholder="https://mywebsite.com/page-slug"
                    className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Theme Color Meta Hex
                  </label>
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    placeholder="#4f46e5"
                    className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none"
                  />
                </div>
              </div>

              {/* Viewport, Charset, Favicon, Language */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted" htmlFor="seo-meta-generator-charset">Charset</label>
                  <input
                    type="text"
                    value={charset}
                    onChange={(e) => setCharset(e.target.value)}
                    className="px-3 py-2 text-xs font-mono border border-border-medium rounded-lg"
                  id="seo-meta-generator-charset"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted" htmlFor="seo-meta-generator-language">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 text-xs font-mono border border-border-medium rounded-lg"
                  id="seo-meta-generator-language"/>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted" htmlFor="seo-meta-generator-favicon-link-path">Favicon Link Path</label>
                  <input
                    type="text"
                    value={favicon}
                    onChange={(e) => setFavicon(e.target.value)}
                    className="px-3 py-2 text-xs font-mono border border-border-medium rounded-lg"
                  id="seo-meta-generator-favicon-link-path"/>
                </div>
              </div>

              {/* Robots & Viewport */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-light pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted" htmlFor="seo-meta-generator-robots-directive">
                    Robots Directive
                  </label>
                  <select
                    value={robots}
                    onChange={(e) => setRobots(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none cursor-pointer"
                   id="seo-meta-generator-robots-directive">
                    <option value="index, follow">index, follow (Standard)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted" htmlFor="seo-meta-generator-viewport-value">
                    Viewport Value
                  </label>
                  <input
                    type="text"
                    value={viewport}
                    onChange={(e) => setViewport(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px]"
                  id="seo-meta-generator-viewport-value"/>
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Column previews & suggestions */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Simulated Google Listing Card */}
          <Card 
            title="Search Engine Listing Simulator" 
            subtitle="Google simulated visual layout preview."
            actions={
              <div className="flex border border-border-light rounded-xl overflow-hidden text-xs shrink-0 font-sans font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${
                    previewDevice === "desktop" ? "bg-brand-primary text-white font-bold" : "bg-surface-muted text-text-sub hover:bg-surface-hover"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${
                    previewDevice === "mobile" ? "bg-brand-primary text-white font-bold" : "bg-surface-muted text-text-sub hover:bg-surface-hover"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            }
          >
            <div className="p-6 bg-white dark:bg-[#1a1c1e] border border-border-medium rounded-2xl flex items-center justify-center min-h-[160px]">
              {previewDevice === "desktop" ? (
                <div className="w-full max-w-[580px] font-sans space-y-1">
                  <div className="text-[14px] text-[#202124] dark:text-[#bdc1c6] truncate flex items-center gap-1.5">
                    <span>{canonical || "https://yourwebsite.com/slug"}</span>
                    <span className="text-xs text-text-muted">▼</span>
                  </div>
                  <h3 className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] font-medium leading-tight hover:underline cursor-pointer truncate max-w-[580px]">
                    {title || "Untitled Search Listing"}
                  </h3>
                  <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2 max-w-[580px]">
                    {description || "Provide page details inside the configurations on the left side to preview Google desktop snippet layouts..."}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-[360px] font-sans space-y-1 bg-white dark:bg-[#1a1c1e] p-3 border border-slate-200 dark:border-slate-850 rounded-xl shadow-premium-sm">
                  <div className="text-xs text-[#202124] dark:text-[#bdc1c6] truncate">
                    <span>{canonical || "yourwebsite.com/slug"}</span>
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

          {/* SEO Checker list */}
          <Card title="Live Tag Optimization Audits" subtitle="Instant checklists based on content limits.">
            <div className="space-y-3">
              {suggestions.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm">
                  {rec.type === "success" && <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />}
                  {rec.type === "warning" && <AlertTriangle className="w-4.5 h-4.5 text-status-warning shrink-0 mt-0.5" />}
                  {rec.type === "error" && <AlertTriangle className="w-4.5 h-4.5 text-status-error shrink-0 mt-0.5" />}
                  {rec.type === "info" && <Info className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />}
                  <span className={`leading-relaxed ${
                    rec.type === "success" ? "text-text-main" :
                    rec.type === "warning" ? "text-status-warning font-semibold" :
                    rec.type === "error" ? "text-status-error font-bold" : "text-text-sub"
                  }`}>
                    {rec.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Code output HTML */}
          <Card 
            title="Generated HTML `<head>` Block" 
            subtitle="Add this markup inside the header of your layouts."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadHtml} leftIcon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Code
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated HTML `<head>` Block"
                readOnly
                value={compiledHtml}
                className="w-full h-[280px] p-4 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                HTML header formatted
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="seo-meta-generator"
        seoData={{ title, description, url: canonical }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Educational content blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> What are SEO Meta Tags?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Meta tags are hidden snippets of text placed inside a webpage's head code structure. While invisible to human visitors, they are read by search engine crawler algorithms to interpret the core topic of a document, index relevant terms, and display previews on Search Engine Results Pages (SERPs).
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Execution Privacy
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            GainUtility is fully client-side. None of your keywords, staging urls, descriptions, or administrative settings are sent to remote services. All character analytics and canvas pixel measures are performed within your browser session.
          </p>
        </div>
      </div>
    </div>
  );
};
