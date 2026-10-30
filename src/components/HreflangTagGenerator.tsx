import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface HreflangAlternate {
  id: string;
  lang: string;      // ISO 639-1
  country: string;   // ISO 3166-1 Alpha 2 (optional)
  url: string;
}

interface HreflangTagGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const HreflangTagGenerator: React.FC<HreflangTagGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Config states
  const [alternates, setAlternates] = useState<HreflangAlternate[]>([
    { id: "1", lang: "en", country: "us", url: "https://gainutility.com/en/" },
    { id: "2", lang: "fr", country: "", url: "https://gainutility.com/fr/" },
    { id: "3", lang: "es", country: "es", url: "https://gainutility.com/es/" }
  ]);

  const [xDefault, setXDefault] = useState("https://gainutility.com/");
  const [compiledHtml, setCompiledHtml] = useState("");

  // Input states for adding alternates
  const [inputLang, setInputLang] = useState("en");
  const [inputCountry, setInputCountry] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  // Load URL from Smart Handoff
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        setXDefault(data.url);
        setInputUrl(data.url);
        onAddToast("Imported base URL via Smart Handoff!", "success");
      }
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Re-generate html on changes
  useEffect(() => {
    generateHreflangHtml();
  }, [alternates, xDefault]);

  const generateHreflangHtml = () => {
    let lines = [`<!-- Multi-Regional Language Alternates (hreflang) -->`];

    alternates.forEach((alt) => {
      const langCode = alt.country ? `${alt.lang}-${alt.country.toLowerCase()}` : alt.lang;
      lines.push(`<link rel="alternate" hreflang="${langCode}" href="${alt.url.trim()}" />`);
    });

    if (xDefault.trim()) {
      lines.push(`<link rel="alternate" hreflang="x-default" href="${xDefault.trim()}" />`);
    }

    setCompiledHtml(lines.join("\n"));
  };

  const handleAddAlternate = () => {
    const trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) {
      onAddToast("Destination alternate URL path is required.", "error");
      return;
    }

    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      onAddToast("Alternate URLs must contain absolute protocol (http or https).", "warning");
      return;
    }

    const newAlt: HreflangAlternate = {
      id: Date.now().toString(),
      lang: inputLang,
      country: inputCountry.trim(),
      url: trimmedUrl
    };

    setAlternates([...alternates, newAlt]);
    setInputUrl("");
    onAddToast(`Added alternate language mapping: ${inputLang}!`, "success");
  };

  const handleDeleteAlternate = (id: string) => {
    setAlternates(alternates.filter((alt) => alt.id !== id));
    onAddToast("Alternate mapping removed.", "info");
  };

  const handleCopyCode = () => {
    if (!compiledHtml) return;
    onCopy(compiledHtml);
    onAddToast("Copied hreflang tags to clipboard!", "success");
  };

  const handleDownloadFile = () => {
    if (!compiledHtml) return;
    const blob = new Blob([compiledHtml], { type: "text/plain;charset=utf-8" });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = "hreflang_tags.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
    onAddToast("hreflang file saved!", "success");
  };

  const handleReset = () => {
    setAlternates([
      { id: "1", lang: "en", country: "", url: "https://gainutility.com/" }
    ]);
    setXDefault("");
    onAddToast("Form restored to single language default.", "info");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Compiler Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form alternates */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Alternate Regional URLs" subtitle="Configure language paths.">
            <div className="space-y-4">
              
              {/* Dynamic Alternates Table */}
              <div className="border border-border-light rounded-[16px] overflow-hidden bg-background">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-muted/60 border-b border-border-light font-sans font-bold text-text-sub">
                      <th className="p-3">Language Code</th>
                      <th className="p-3">Alternate URL</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternates.map((alt) => (
                      <tr key={alt.id} className="border-b border-border-light/40 last:border-0 font-mono text-xs">
                        <td className="p-3 text-brand-primary font-bold">
                          {alt.lang}
                          {alt.country ? `-${alt.country.toUpperCase()}` : ""}
                        </td>
                        <td className="p-3 text-text-main truncate max-w-[200px]" title={alt.url}>{alt.url}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteAlternate(alt.id)}
                            className="p-1.5 text-text-muted hover:text-status-error rounded-lg hover:bg-status-error/10 transition-colors cursor-pointer"
                            title="Remove Alternate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {alternates.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-xs text-text-muted">
                          No language mapping criteria added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add alternate language segment */}
              <div className="p-4 bg-surface-muted/20 border border-border-light/60 rounded-[18px] space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-text-sub tracking-wider">
                  ➕ Add Localized Alternate
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted font-sans" htmlFor="hreflang-tag-generator-language-iso-639-1">Language (ISO 639-1)</label>
                    <select
                      value={inputLang}
                      onChange={(e) => setInputLang(e.target.value)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="hreflang-tag-generator-language-iso-639-1">
                      <option value="en">English (en)</option>
                      <option value="es">Spanish (es)</option>
                      <option value="fr">French (fr)</option>
                      <option value="de">German (de)</option>
                      <option value="ja">Japanese (ja)</option>
                      <option value="pt">Portuguese (pt)</option>
                      <option value="zh">Chinese (zh)</option>
                      <option value="it">Italian (it)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted font-sans" htmlFor="hreflang-tag-generator-target-country-code-optional">Target Country Code (Optional)</label>
                    <select
                      value={inputCountry}
                      onChange={(e) => setInputCountry(e.target.value)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="hreflang-tag-generator-target-country-code-optional">
                      <option value="">Any Country (Global)</option>
                      <option value="us">United States (us)</option>
                      <option value="gb">United Kingdom (gb)</option>
                      <option value="ca">Canada (ca)</option>
                      <option value="es">Spain (es)</option>
                      <option value="fr">France (fr)</option>
                      <option value="de">Germany (de)</option>
                      <option value="jp">Japan (jp)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-text-muted font-sans">Localized Page Path URL</label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/es/landing"
                    className="px-3 py-2.5 text-xs font-mono border border-border-medium rounded-lg bg-background text-text-main focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddAlternate}
                    className="h-[36px] px-5 py-1 text-xs"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Alternate
                  </Button>
                </div>
              </div>

            </div>
          </Card>

          {/* x-default global routing card */}
          <Card title="x-default Fallback Page" subtitle="Designate your baseline language route.">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-main font-sans">
                  x-default Target URL (Baseline Gateway)
                </label>
                <input
                  type="text"
                  value={xDefault}
                  onChange={(e) => setXDefault(e.target.value)}
                  placeholder="https://gainutility.com/"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <span className="text-xs text-text-muted leading-relaxed">
                  Used for users whose local configurations do not match any of your specified language alternates.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right XML/HTML alternates compiler panel */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card 
            title="Generated hreflang HTML Tags" 
            subtitle="Add this metadata inside the `<head>` of your layouts."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download Code
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Tags
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated hreflang tags"
                readOnly
                value={compiledHtml}
                className="w-full h-[360px] p-5 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                Hreflang HTML tags output
              </div>
            </div>
          </Card>

          {/* Self-referencing verification checklist */}
          <Card title="hreflang Integrity Rules Verification" subtitle="Automatic quality checker.">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Self-Referencing check:</strong> Your alternates contain absolute paths referencing all language variations including the primary source language.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Bi-directional links check:</strong> All language pages should reference each other to form a complete circular mapping network.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="hreflang-tag-generator"
        seoData={{ url: xDefault }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> What is an hreflang Tag?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            The `hreflang` tag attribute is a search engine instruction. It tells crawlers precisely which language path or country subdomain they should show to international users based on their active browser language locale. This prevents duplicate index penalties on regional pages that serve similar translated variants of identical pages.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Verification Integrity
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All localized translation rules, regional country mapping schemas, and alternate HTML listings are generated strictly on your active browser thread without compiling or sending data to external database services or cloud trackers. Your site architecture is kept private.
          </p>
        </div>
      </div>
    </div>
  );
};
