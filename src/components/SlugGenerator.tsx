/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Copy, 
  RotateCcw, 
  Globe, 
  Download, 
  Check, 
  Type, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button, Card, Switch, Breadcrumbs } from "./Common";
import { tt, ttf } from "../i18n/toolUi";
import { t } from "../i18n/ui";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/slugGenerator";

interface SlugGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const SlugGenerator: React.FC<SlugGeneratorProps> = ({
  onCopy,
  onAddToast
}) => {
  const locale = useLocale();
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  
  // Customization configs
  const [customDomain, setCustomDomain] = useState("https://example.com");
  const [enforceLowercase, setEnforceLowercase] = useState(true);
  const [separator, setSeparator] = useState("-");
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true);
  const [transliterateUnicode, setTransliterateUnicode] = useState(true);
  const [trimRepeated, setTrimRepeated] = useState(true);

  // Trigger slugification automatically on state adjustments
  useEffect(() => {
    generateSlug();
  }, [inputText, enforceLowercase, separator, removeSpecialChars, transliterateUnicode, trimRepeated]);

  const generateSlug = () => {
    if (!inputText.trim()) {
      setSlug("");
      return;
    }

    let text = inputText;

    // 1. Transliterate unicode / Accents if toggled
    if (transliterateUnicode) {
      // Decompose accented chars (e.g., é -> e + ́)
      text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // 2. Case transformation
    if (enforceLowercase) {
      text = text.toLowerCase();
    }

    // 3. Remove non-safe special characters
    if (removeSpecialChars) {
      // Remove symbols like !@#$%^&*()_+={}[]|\\:;"'<>,.?/`~
      // Keeps alphanumeric and spaces/tabs/newlines
      text = text.replace(/[^a-zA-Z0-9\s-_]/g, "");
    }

    // 4. Convert spacing / separators
    // Replace consecutive whitespaces, tabs, underscores, or hyphens with the separator
    const sepRegex = new RegExp(`[\\s\\-_\\.\\/]+`, "g");
    text = text.replace(sepRegex, separator);

    // 5. Trim repeated separators
    if (trimRepeated && separator) {
      const escapeSeparator = separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const repeatRegex = new RegExp(`${escapeSeparator}{2,}`, "g");
      text = text.replace(repeatRegex, separator);
    }

    // 6. Strip leading and trailing separators
    if (separator) {
      const escapeSeparator = separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const leadingRegex = new RegExp(`^${escapeSeparator}+|${escapeSeparator}+$`, "g");
      text = text.replace(leadingRegex, "");
    }

    setSlug(text);
  };

  const handleCopySlug = () => {
    if (!slug) {
      onAddToast(tt("slug-generator", "emptySlug", locale, "Slug is empty, type something first!"), "warning");
      return;
    }
    onCopy(slug);
    onAddToast(tt("slug-generator", "copiedSlug", locale, "Copied slug to clipboard!"), "success");
  };

  const handleCopyFullUrl = () => {
    if (!slug) {
      onAddToast(tt("slug-generator", "emptySlug", locale, "Slug is empty, type something first!"), "warning");
      return;
    }
    const cleanDomain = customDomain.endsWith("/") ? customDomain : `${customDomain}/`;
    const fullUrl = `${cleanDomain}${slug}`;
    onCopy(fullUrl);
    onAddToast(tt("slug-generator", "copiedUrl", locale, "Copied full simulated URL to clipboard!"), "success");
  };

  const handleDownloadSlugTxt = () => {
    if (!slug) {
      onAddToast(tt("slug-generator", "nothingToDownload", locale, "Nothing to download!"), "warning");
      return;
    }
    const blob = new Blob([slug], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `slug_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast(tt("slug-generator", "downloadedTxt", locale, "Slug export downloaded as .txt!"), "success");
  };

  const handleReset = () => {
    setInputText("");
    setSlug("");
    setCustomDomain("https://example.com");
    setEnforceLowercase(true);
    setSeparator("-");
    setRemoveSpecialChars(true);
    setTransliterateUnicode(true);
    setTrimRepeated(true);
    onAddToast(tt("slug-generator", "resetParams", locale, "Slug parameters reset to baseline configuration."), "info");
  };

  // Pre-configured text templates for easy loading
  const loadTemplate = (text: string) => {
    setInputText(text);
    onAddToast(tt("slug-generator", "templateLoaded", locale, "Headline template loaded!"), "success");
  };

  const cleanDomainDisplay = customDomain.endsWith("/") ? customDomain : `${customDomain}/`;

  // Map separator values to their localizable dict key.
  const separatorKeyFor = (val: string): string => {
    const map: Record<string, string> = { "-": "sepHyphen", "_": "sepUnderscore", "/": "sepSlash", ".": "sepDot", "": "sepCollapsed" };
    return map[val] || "sepCollapsed";
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Navigation & Header */}
      

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Form controls and inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title={tt("slug-generator", "sourceTitle", locale, "Source Headline Input")} subtitle={tt("slug-generator", "sourceSubtitle", locale, "Type or paste your headline to convert instantly in real-time.")}>
            <div className="flex flex-col gap-5">
              
              {/* Quick Template Loading Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase text-text-muted font-bold">{tt("slug-generator", "trySamples", locale, "Try Sample Headlines:")}</span>
                <button 
                  onClick={() => loadTemplate("The Ultimate Guide to React & Tailwind CSS in 2026!")}
                  className="text-xs px-3 py-1.5 rounded-[8px] bg-surface-muted hover:bg-brand-primary-light/40 text-text-main hover:text-brand-primary transition-colors border border-border-light cursor-pointer"
                >
                  {tt("slug-generator", "sampleTech", locale, "Tech Guide")}
                </button>
                <button 
                  onClick={() => loadTemplate("¡Cómo Programar Páginas Web Rápidas con WebAssembly!")}
                  className="text-xs px-3 py-1.5 rounded-[8px] bg-surface-muted hover:bg-brand-primary-light/40 text-text-main hover:text-brand-primary transition-colors border border-border-light cursor-pointer"
                >
                  {tt("slug-generator", "sampleSpanish", locale, "Spanish Accent Trimming")}
                </button>
                <button 
                  onClick={() => loadTemplate("Node.js, Express, C# & Python: Which Backend is Best? (Full-Review)")}
                  className="text-xs px-3 py-1.5 rounded-[8px] bg-surface-muted hover:bg-brand-primary-light/40 text-text-main hover:text-brand-primary transition-colors border border-border-light cursor-pointer"
                >
                  {tt("slug-generator", "sampleCode", locale, "Code Review")}
                </button>
              </div>

              {/* Headline Input box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted flex justify-between">
                  <span>{tt("slug-generator", "draftLabel", locale, "Draft Title / Phrase")}</span>
                  <span className="font-bold text-text-main">{ttf("slug-generator", "charWordCount", locale, { characters: String(inputText.length), words: String(inputText.split(/\s+/).filter(Boolean).length) }, `${inputText.length} characters • ${inputText.split(/\s+/).filter(Boolean).length} words`)}</span>
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={tt("slug-generator", "headlinePlaceholder", locale, "Enter headline here... (e.g. 10 Tips for Writing Better Code & Designing Beautiful Interfaces!)")}
                  className="w-full h-[120px] p-4 text-sm font-sans border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* Custom Domain Simulator input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted">
                  {tt("slug-generator", "domainPrefixLabel", locale, "Simulated Web Domain Prefix")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="border-t border-border-light pt-5 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-text-main mb-1.5">
                  {tt("slug-generator", "compileParams", locale, "Compilation Parameters")}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-muted/30 border border-border-light rounded-[14px] space-y-3">
                    <Switch 
                      checked={enforceLowercase} 
                      onChange={setEnforceLowercase} 
                      label={tt("slug-generator", "switchLowercase", locale, "Enforce Lowercase")} 
                    />
                    <Switch 
                      checked={removeSpecialChars} 
                      onChange={setRemoveSpecialChars} 
                      label={tt("slug-generator", "switchStrip", locale, "Strip Special Symbols")} 
                    />
                  </div>

                  <div className="p-4 bg-surface-muted/30 border border-border-light rounded-[14px] space-y-3">
                    <Switch 
                      checked={transliterateUnicode} 
                      onChange={setTransliterateUnicode} 
                      label={tt("slug-generator", "switchAccents", locale, "Map Accents (NFD Trans)")} 
                    />
                    <Switch 
                      checked={trimRepeated} 
                      onChange={setTrimRepeated} 
                      label={tt("slug-generator", "switchCollapse", locale, "Collapse Consecutive Sep")} 
                    />
                  </div>
                </div>

                {/* Separator Chooser */}
                <div className="flex flex-col gap-2 bg-surface-muted/30 p-4 rounded-[14px] border border-border-light">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted">
                    {tt("slug-generator", "separatorLabel", locale, "Separator Character")}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { label: "Hyphen (-)", value: "-" },
                      { label: "Underscore (_)", value: "_" },
                      { label: "Slash (/)", value: "/" },
                      { label: "Dot (.)", value: "." },
                      { label: "Collapsed", value: "" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSeparator(opt.value)}
                        className={`px-3 py-1.5 rounded-[8px] text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                          separator === opt.value
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-background hover:bg-surface-muted text-text-main border-border-medium"
                        }`}
                      >
                        {tt("slug-generator", separatorKeyFor(opt.value), locale, opt.label || "[None]")}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </Card>
        </div>

        {/* Right Column - Live Preview & Copy Output */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title={tt("slug-generator", "urlPreviewTitle", locale, "Simulated SEO URL Preview")} subtitle={tt("slug-generator", "urlPreviewSubtitle", locale, "See how search scrapers render your link on index results.")}>
            {slug ? (
              <div className="space-y-4">
                
                {/* Google Search Result Preview Card */}
                <div className="p-4 bg-background border border-border-medium rounded-[16px] shadow-sm space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-[12px] text-emerald-800 dark:text-emerald-400 truncate">
                    <span>{customDomain.replace(/^https?:\/\//i, "")}</span>
                    <span>›</span>
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 truncate">{slug}</span>
                  </div>
                  <h3 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] font-medium leading-tight hover:underline cursor-pointer line-clamp-1">
                    {inputText || tt("slug-generator", "draftPreview", locale, "Draft Headline Preview")}
                  </h3>
                  <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {tt("slug-generator", "previewBody", locale, "Discover how to build high-performance search-optimized page slugs using local in-browser script tools. View this simulated web preview card...")}
                  </p>
                </div>

                {/* Character Counter metrics */}
                <div className="grid grid-cols-2 gap-3 bg-surface-muted/30 p-3.5 rounded-[14px] border border-border-light text-center">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-text-muted block">{tt("slug-generator", "slugLength", locale, "Slug Length")}</span>
                    <span className="text-xl font-sans font-black text-text-main">{ttf("slug-generator", "charsCount", locale, { count: String(slug.length) }, `${slug.length} ch`)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-text-muted block">{tt("slug-generator", "seoGrade", locale, "SEO Grade")}</span>
                    <span className={`text-xl font-sans font-black ${
                      slug.length === 0 ? "text-text-disabled" :
                      slug.length <= 45 ? "text-status-success" :
                      slug.length <= 75 ? "text-status-warning" : "text-status-error"
                    }`}>
                      {slug.length === 0 ? tt("slug-generator", "gradeEmpty", locale, "Empty") :
                       slug.length <= 45 ? tt("slug-generator", "gradeOptimal", locale, "Optimal") :
                       slug.length <= 75 ? tt("slug-generator", "gradeAcceptable", locale, "Acceptable") : tt("slug-generator", "gradeTooLong", locale, "Too Long")}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-text-muted font-sans border-2 border-dashed border-border-medium rounded-[16px] bg-background">
                {tt("slug-generator", "previewAuto", locale, "Slug and URL preview will generate automatically.")}
              </div>
            )}
          </Card>

          {/* Compiled Output Card */}
          <Card 
            title={tt("slug-generator", "generatedTitle", locale, "Generated URL Slug")} 
            subtitle={tt("slug-generator", "generatedSubtitle", locale, "The resulting SEO string is updated live.")}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadSlugTxt} leftIcon={<Download className="w-4 h-4" />}>
                  {t("export", locale)}
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopySlug} leftIcon={<Copy className="w-4 h-4" />}>
                  {tt("slug-generator", "copySlug", locale, "Copy Slug")}
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              
              {/* Output Slug text block */}
              <div className="p-4 bg-surface-muted/40 rounded-[14px] border border-border-light font-mono text-sm text-text-main select-all break-all relative">
                {slug || <span className="text-text-disabled italic">{tt("slug-generator", "awaitingInput", locale, "Awaiting your headline input...")}</span>}
              </div>

              {/* Complete simulated URL section */}
              {slug && (
                <div className="flex flex-col gap-2 border-t border-border-light pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono uppercase text-text-muted">{tt("slug-generator", "urlPathLabel", locale, "Simulated URL Path:")}</span>
                    <button 
                      onClick={handleCopyFullUrl}
                      className="text-xs text-brand-primary hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" /> {tt("slug-generator", "copyCompleteLink", locale, "Copy Complete Link")}
                    </button>
                  </div>
                  <div className="p-3 bg-brand-primary-light/10 border border-brand-primary-light/30 rounded-[10px] font-mono text-[11px] text-brand-primary break-all select-all">
                    {cleanDomainDisplay}{slug}
                  </div>
                </div>
              )}

            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
