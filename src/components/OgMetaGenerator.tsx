/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ViewState } from "../types";
import { 
  Share2, 
  Copy, 
  RotateCcw, 
  Globe, 
  Download, 
  Check, 
  Eye, 
  Facebook, 
  Twitter,
  Image as ImageIcon,
  Sparkles,
  Info,
  Code,
} from "lucide-react";
import { Button, Card } from "./Common";

interface OgMetaGeneratorProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const OgMetaGenerator: React.FC<OgMetaGeneratorProps> = ({
  onCopy,
  onAddToast
}) => {
  // Input fields state
  const [ogTitle, setOgTitle] = useState("Local Web Developer Toolkit Platform");
  const [ogDescription, setOgDescription] = useState("Format nested JSON trees, optimize images, generate clean slugs, and inspect Open Graph meta tags securely and offline.");
  const [ogUrl, setOgUrl] = useState("https://gainutility.com");
  const [ogImage, setOgImage] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80");
  const [ogType, setOgType] = useState("website");
  
  // X (Twitter) options
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("@gainutility_suite");
  const [twitterCreator, setTwitterCreator] = useState("");

  // Visual & output state
  const [compiledHtml, setCompiledHtml] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState<"facebook" | "x">("facebook");

  // Re-generate code markup
  useEffect(() => {
    generateOgHtml();
  }, [ogTitle, ogDescription, ogUrl, ogImage, ogType, twitterCard, twitterSite, twitterCreator]);

  const generateOgHtml = () => {
    const lines = [
      `<!-- Open Graph / Facebook Protocol tags -->`,
      `<meta property="og:type" content="${ogType}">`,
      `<meta property="og:url" content="${ogUrl.trim()}">`,
      `<meta property="og:title" content="${ogTitle.trim()}">`,
      `<meta property="og:description" content="${ogDescription.trim()}">`,
      ogImage.trim() ? `<meta property="og:image" content="${ogImage.trim()}">` : null,
      ``,
      `<!-- X (Twitter) Card metadata -->`,
      `<meta name="twitter:card" content="${twitterCard}">`,
      ogUrl.trim() ? `<meta name="twitter:url" content="${ogUrl.trim()}">` : null,
      `<meta name="twitter:title" content="${ogTitle.trim()}">`,
      `<meta name="twitter:description" content="${ogDescription.trim()}">`,
      ogImage.trim() ? `<meta name="twitter:image" content="${ogImage.trim()}">` : null,
      twitterSite.trim() ? `<meta name="twitter:site" content="${twitterSite.trim()}">` : null,
      twitterCreator.trim() ? `<meta name="twitter:creator" content="${twitterCreator.trim()}">` : null,
    ].filter((val) => val !== null);

    setCompiledHtml(lines.join("\n"));
  };

  const handleCopyCode = () => {
    if (!compiledHtml) return;
    onCopy(compiledHtml);
    onAddToast("Copied meta tags to clipboard!", "success");
  };

  const handleDownloadFile = () => {
    if (!compiledHtml) return;
    const blob = new Blob([compiledHtml], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `og_meta_tags_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast("Meta tags saved as .txt file!", "success");
  };

  const handleReset = () => {
    setOgTitle("");
    setOgDescription("");
    setOgUrl("");
    setOgImage("");
    setOgType("website");
    setTwitterCard("summary_large_image");
    setTwitterSite("@gainutility_suite");
    setTwitterCreator("");
    onAddToast("Form details cleared.", "info");
  };

  const loadSample = () => {
    setOgTitle("Aesthetic CSS Linear & Radial Gradient Designer");
    setOgDescription("Craft beautiful multi-stop linear gradients, radial organic backdrops, and asymmetrical design system shadows.");
    setOgUrl("https://gainutility.com/css-studio");
    setOgImage("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80");
    setOgType("article");
    setTwitterCard("summary_large_image");
    setTwitterSite("@css_designer_app");
    setTwitterCreator("@css_designer_app");
    onAddToast("Loaded CSS studio sample settings!", "success");
  };

  // Helper to extract clean domain host
  const getDomainHost = (urlStr: string) => {
    try {
      if (!urlStr) return "example.com";
      const u = new URL(urlStr);
      return u.hostname;
    } catch {
      return urlStr.replace(/^https?:\/\//i, "").split("/")[0] || "example.com";
    }
  };

  const domainDisplay = getDomainHost(ogUrl);

  return (
    <div className="w-full py-6 space-y-6">
      {/* Main Grid Work area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - OG Parameter Fields */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Open Graph Inputs" subtitle="Fill in the properties below. All fields update the preview and generated code in real time.">
            <div className="space-y-5">
              
              {/* OG:Title */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Card Title (`og:title`)
                  </label>
                  <span className={`text-xs font-mono font-bold ${
                    ogTitle.length <= 60 ? "text-status-success" : "text-status-warning"
                  }`}>
                    {ogTitle.length} / 60 optimal characters
                  </span>
                </div>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="e.g. 10 Critical Tools for Aesthetic Web Styling"
                  className="w-full px-4 py-3 text-sm font-sans border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* OG:Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Card Description (`og:description`)
                  </label>
                  <span className={`text-xs font-mono font-bold ${
                    ogDescription.length <= 110 ? "text-status-success" : "text-status-warning"
                  }`}>
                    {ogDescription.length} / 110 optimal characters
                  </span>
                </div>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Draft an engaging, click-friendly description for social feeds..."
                  className="w-full h-[85px] p-4 text-sm font-sans border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* OG:URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Canonical URL (`og:url`)
                </label>
                <input
                  type="url"
                  value={ogUrl}
                  onChange={(e) => setOgUrl(e.target.value)}
                  placeholder="https://example.com/blog/aesthetic-design"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <span className="text-[10px] text-text-muted font-mono leading-relaxed px-1">
                  * Must be an absolute HTTPS URL. This is the canonical URL for the shared page.
                </span>
              </div>

              {/* OG:Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Card Banner Image (`og:image`)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://example.com/assets/banner_card.jpg"
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <span className="text-[10px] text-text-muted font-mono leading-relaxed px-1">
                  * Recommended: 1200×630px (1.91:1), HTTPS absolute URL, under 8MB.
                </span>
              </div>

              {/* Advanced social mapping toggles */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-border-light pt-4">
                
                {/* Object Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted" htmlFor="og-meta-generator-page-type-og-type">
                    Page Type (`og:type`)
                  </label>
                  <select
                    value={ogType}
                    onChange={(e) => setOgType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-border-medium rounded-[12px] bg-background text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                   id="og-meta-generator-page-type-og-type">
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="book">Book</option>
                    <option value="profile">Profile</option>
                    <option value="music.song">Song Track</option>
                    <option value="video.movie">Video Movie</option>
                  </select>
                </div>

                {/* X Card style */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted" htmlFor="og-meta-generator-x-card-mode">
                    X Card Mode
                  </label>
                  <select
                    value={twitterCard}
                    onChange={(e) => setTwitterCard(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-border-medium rounded-[12px] bg-background text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                   id="og-meta-generator-x-card-mode">
                    <option value="summary_large_image">Large Banner (Default)</option>
                    <option value="summary">Small Square Summary</option>
                    <option value="app">Mobile App Install</option>
                    <option value="player">Video/Audio Player</option>
                  </select>
                </div>

                {/* X Site Handle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted">
                    X Site Handle (`twitter:site`)
                  </label>
                  <input
                    type="text"
                    value={twitterSite}
                    onChange={(e) => setTwitterSite(e.target.value)}
                    placeholder="@your_site"
                    className="w-full px-3 py-2 text-xs border border-border-medium rounded-[12px] bg-background text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                {/* X Creator Handle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted">
                    X Creator Handle (`twitter:creator`)
                  </label>
                  <input
                    type="text"
                    value={twitterCreator}
                    onChange={(e) => setTwitterCreator(e.target.value)}
                    placeholder="@author_name"
                    className="w-full px-3 py-2 text-xs border border-border-medium rounded-[12px] bg-background text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

              </div>

            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />} className="min-h-[44px]">
              <Code className="w-4 h-4" /> Copy Meta Tags
            </Button>
            <Button variant="secondary" size="md" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />} className="min-h-[44px]">
              Download .txt
            </Button>
            <Button variant="outline" size="md" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} className="min-h-[44px]">
              Load Sample
            </Button>
            <Button variant="ghost" size="md" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />} className="min-h-[44px]">
              Reset
            </Button>
          </div>

          {/* Usage Hint */}
          <div className="bg-brand-primary-light/10 border border-brand-primary/20 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-main">
              <span className="font-bold">How to use:</span> Copy the generated meta tags above and paste them inside the <code className="font-mono bg-background px-1.5 py-0.5 rounded">{'<head>'}</code> of your HTML document. Social platforms will read these tags when your URL is shared.
            </div>
          </div>
        </div>

        {/* Right Column - Visual Mock Previews & Code Output */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Social Platform Card Simulator */}
          <Card 
            title="Social Card Preview" 
            subtitle="Preview how your link will appear when shared on each platform."
            actions={
              <div className="flex bg-surface-muted p-1 rounded-[10px] border border-border-light">
                <button
                  onClick={() => setPreviewPlatform("facebook")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
                    previewPlatform === "facebook" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" /> Facebook / LinkedIn
                </button>
                <button
                  onClick={() => setPreviewPlatform("x")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
                    previewPlatform === "x" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  <Twitter className="w-3.5 h-3.5" /> X (Twitter)
                </button>
              </div>
            }
          >
            <div className="bg-surface-muted/20 p-4 border border-border-light rounded-[16px]">
              
              {/* 1. Facebook/LinkedIn Mock Card Rendering */}
              {previewPlatform === "facebook" && (
                <div className="w-full max-w-md mx-auto bg-white dark:bg-[#18191a] border border-[#dadde1] dark:border-[#3e4042] rounded-[12px] overflow-hidden font-sans shadow-sm">
                  
                  {/* Image banner */}
                  <div className="aspect-[1.91/1] relative bg-[#f2f3f5] dark:bg-[#242526] overflow-hidden flex items-center justify-center border-b border-[#dadde1] dark:border-[#3e4042]">
                    {ogImage ? (
                      <img src={ogImage} alt="Facebook/LinkedIn card preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-text-disabled italic">Awaiting og:image absolute URL...</span>
                    )}
                  </div>

                  {/* Body text meta info */}
                  <div className="p-3 bg-[#f2f3f5] dark:bg-[#242526] text-left">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[#606770] dark:text-[#b0b3b8] block">
                      {domainDisplay}
                    </span>
                    <h4 className="text-sm font-bold text-[#1c1e21] dark:text-[#e4e6eb] mt-1 line-clamp-1">
                      {ogTitle || "Page Title"}
                    </h4>
                    <p className="text-xs text-[#606770] dark:text-[#b0b3b8] mt-1 leading-snug line-clamp-2">
                      {ogDescription || "Description will appear here..."}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. X (Twitter) Large Card Mock Rendering */}
              {previewPlatform === "x" && (
                <div className="w-full max-w-md mx-auto bg-white dark:bg-black border border-[#e1e8ed] dark:border-[#2f3336] rounded-[16px] overflow-hidden font-sans shadow-sm text-left">
                  
                  {/* Card Image */}
                  <div className="aspect-[1.91/1] relative bg-[#f5f8fa] dark:bg-[#15181c] overflow-hidden flex items-center justify-center border-b border-[#e1e8ed] dark:border-[#2f3336]">
                    {ogImage ? (
                      <img src={ogImage} alt="X card preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-text-disabled italic">Awaiting og:image absolute URL...</span>
                    )}
                  </div>

                  {/* Body text info */}
                  <div className="p-3 bg-white dark:bg-black">
                    <span className="text-[12px] text-[#536471] dark:text-[#71767b] font-mono block">
                      {domainDisplay}
                    </span>
                    <h4 className="text-[14px] font-bold text-[#0f1419] dark:text-[#e7e9ea] mt-0.5 line-clamp-1">
                      {ogTitle || "Page Title"}
                    </h4>
                    <p className="text-[13px] text-[#536471] dark:text-[#71767b] mt-0.5 leading-snug line-clamp-2">
                      {ogDescription || "Description will appear here..."}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* Compiled code block */}
          <Card 
            title="Generated Meta Tags" 
            subtitle="Copy and paste this into your page's <head> section."
            actions={
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy to Clipboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download .txt
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated meta tags"
                readOnly
                value={compiledHtml}
                className="w-full h-[320px] p-4 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                Open Graph + X Card formatted
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};