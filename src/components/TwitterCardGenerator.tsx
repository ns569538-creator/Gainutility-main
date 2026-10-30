import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  Download, 
  Check, 
  Twitter, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface TwitterCardGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const TwitterCardGenerator: React.FC<TwitterCardGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Input fields state
  const [cardType, setCardType] = useState<"summary" | "summary_large_image">("summary_large_image");
  const [title, setTitle] = useState("Local Offline Web Utilities & Formatter Studio");
  const [description, setDescription] = useState("Format nested JSON configurations, optimize media compression, validate rich structured schemas, and inspect open-graph tokens securely in-browser.");
  const [url, setUrl] = useState("https://gainutility.com");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80");
  const [creator, setCreator] = useState("@gainutility_suite");
  const [site, setSite] = useState("@gainutility_suite");

  const getHostname = (urlStr: string) => {
    try {
      if (!urlStr) return "domain.com";
      const withProtocol = urlStr.match(/^https?:\/\//i) ? urlStr : `https://${urlStr}`;
      return new URL(withProtocol).hostname;
    } catch {
      return "domain.com";
    }
  };

  const [compiledHtml, setCompiledHtml] = useState("");

  // Load from Smart Handoff on mount
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.url) setUrl(data.url);
      if (data.image) setImage(data.image);
      onAddToast("Imported page properties via Smart Handoff!", "success");
      // Clear handoff once consumed
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Generate HTML block automatically
  useEffect(() => {
    generateTwitterHtml();
  }, [cardType, title, description, url, image, creator, site]);

  const generateTwitterHtml = () => {
    const lines = [
      `<!-- Twitter Social Card Metadata -->`,
      `<meta name="twitter:card" content="${cardType}">`,
      site.trim() ? `<meta name="twitter:site" content="${site.trim()}">` : null,
      creator.trim() ? `<meta name="twitter:creator" content="${creator.trim()}">` : null,
      url.trim() ? `<meta name="twitter:url" content="${url.trim()}">` : null,
      title.trim() ? `<meta name="twitter:title" content="${title.trim()}">` : null,
      description.trim() ? `<meta name="twitter:description" content="${description.trim()}">` : null,
      image.trim() ? `<meta name="twitter:image" content="${image.trim()}">` : null,
    ].filter(Boolean);

    setCompiledHtml(lines.join("\n"));
  };

  const handleCopyCode = () => {
    if (!compiledHtml) return;
    onCopy(compiledHtml);
    onAddToast("Copied Twitter card HTML meta tags!", "success");
  };

  const handleDownloadFile = () => {
    if (!compiledHtml) return;
    const blob = new Blob([compiledHtml], { type: "text/plain;charset=utf-8" });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `twitter_card_meta_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
    onAddToast("Twitter card tags saved as .html!", "success");
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setCreator("");
    setSite("");
    onAddToast("Twitter card form wiped clean.", "info");
  };

  const loadSample = () => {
    setTitle("Premium Offline Web Utilities — GainUtility");
    setDescription("Evaluate designs with our native WCAG checkers, reorder PDFs, compress images, and generate metadata trees completely offline.");
    setUrl("https://gainutility.com/developer");
    setImage("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80");
    setCreator("@gainutility_dev");
    setSite("@gainutility_suite");
    onAddToast("Loaded sample card configurations!", "success");
  };

  // Limits calculations
  const isTitleOver = title.length > 70;
  const isDescOver = description.length > 200;

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Configuration & Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Twitter Card Metadata" subtitle="Fill out properties to update card previews.">
            <div className="space-y-4">
              
              {/* Card Type Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Twitter Card Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType("summary")}
                    className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all duration-200 text-center cursor-pointer ${
                      cardType === "summary" 
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold" 
                        : "border-border-medium hover:bg-surface-muted text-text-sub"
                    }`}
                  >
                    Summary Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType("summary_large_image")}
                    className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all duration-200 text-center cursor-pointer ${
                      cardType === "summary_large_image" 
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold" 
                        : "border-border-medium hover:bg-surface-muted text-text-sub"
                    }`}
                  >
                    Large Image Card
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Card Title
                  </label>
                  <span className={`text-xs font-mono font-bold ${isTitleOver ? "text-status-error" : "text-status-success"}`}>
                    {title.length} / 70 max
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarized page header..."
                  className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Description input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Card Description
                  </label>
                  <span className={`text-xs font-mono font-bold ${isDescOver ? "text-status-error" : "text-status-success"}`}>
                    {description.length} / 200 max
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a short overview of the linked content..."
                  className="w-full h-[90px] p-4 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* Image URL input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/assets/banner.jpg"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Website URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://gainutility.com"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Handles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Creator Account Handle
                  </label>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="e.g. @your_account"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Site Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    placeholder="e.g. @suite_brand"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Column previews */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Live Mock Social Card */}
          <Card title="Live Feed Preview" subtitle="Simulated X/Twitter dark feed rendering.">
            <div className="p-4 bg-[#15202B] text-white rounded-2xl border border-slate-800 space-y-3 font-sans">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0 flex items-center justify-center font-bold text-sm text-white">
                  X
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white hover:underline cursor-pointer">GainUtility Bot</span>
                    <span className="text-xs text-slate-400">@gainutility_bot · Just now</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">
                    Sharing an updated article on performance optimization. Check out this link! 👇
                  </p>
                  
                  {/* Twitter card box */}
                  <div className="mt-3 border border-slate-700/80 rounded-2xl overflow-hidden hover:bg-slate-800/40 transition-colors duration-200 cursor-pointer">
                    
                    {cardType === "summary_large_image" ? (
                      // Large Image Layout
                      <div>
                        <div className="h-44 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                          {image ? (
                            <img src={image} alt="Twitter card asset" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-slate-600" />
                          )}
                        </div>
                        <div className="p-3 border-t border-slate-700/80 space-y-1 bg-transparent">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                            {getHostname(url)}
                          </span>
                          <h4 className="font-bold text-sm text-white line-clamp-1">{title || "Untitled Social Card"}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{description || "Enter a card overview..."}</p>
                        </div>
                      </div>
                    ) : (
                      // Small Summary Layout
                      <div className="flex h-28">
                        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                              {getHostname(url)}
                            </span>
                            <h4 className="font-bold text-sm text-white line-clamp-1 mt-0.5">{title || "Untitled Card"}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-snug">{description || "Provide an overview tag..."}</p>
                          </div>
                        </div>
                        <div className="w-28 bg-slate-800 border-l border-slate-700 shrink-0 relative flex items-center justify-center overflow-hidden">
                          {image ? (
                            <img src={image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Compiled HTML head code output */}
          <Card 
            title="Generated Twitter Card Tags" 
            subtitle="Add this markup directly to your webpage header code."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Code
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated Twitter Card Tags"
                readOnly
                value={compiledHtml}
                className="w-full h-[180px] p-4 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                Twitter meta formatted
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="twitter-card-generator"
        seoData={{ title, description, url, image }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* FAQ, features section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> Twitter Card FAQ
          </h3>
          <div className="space-y-3.5">
            <p className="text-sm text-text-muted leading-relaxed">
              <strong>What is a Twitter Card?</strong>
              <br />
              Twitter Cards allow you to attach rich media (photos, videos, or detailed text) to tweets linking to your content, turning standard boring link paths into beautiful interactive preview blocks.
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              <strong>Does Twitter fallback to Open Graph?</strong>
              <br />
              Yes, if Twitter-specific tags (`twitter:title`, `twitter:image`) are missing, the Twitter crawler will fallback to standard Open Graph protocol headers (`og:title`, `og:image`) automatically.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Safe Browser Sandbox
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All code rendering and asset preview rendering run strictly in-browser. No cookie logs, telemetry tracking parameters, or personal URLs are sent to any remote servers. Your workflows remain 100% private and protected.
          </p>
        </div>
      </div>
    </div>
  );
};
