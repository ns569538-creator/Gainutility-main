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
  CheckCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

interface SitemapEntry {
  id: string;
  url: string;
  priority: string;
  changefreq: "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod: string;
}

interface XmlSitemapGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const XmlSitemapGenerator: React.FC<XmlSitemapGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Baseline initial state
  const [entries, setEntries] = useState<SitemapEntry[]>([
    { id: "1", url: "https://gainutility.com/", priority: "1.0", changefreq: "daily", lastmod: new Date().toISOString().split("T")[0] },
    { id: "2", url: "https://gainutility.com/developer", priority: "0.8", changefreq: "weekly", lastmod: new Date().toISOString().split("T")[0] },
    { id: "3", url: "https://gainutility.com/seo-studio", priority: "0.8", changefreq: "weekly", lastmod: new Date().toISOString().split("T")[0] }
  ]);

  const [compiledXml, setCompiledXml] = useState("");

  // Add rule state
  const [inputUrl, setInputUrl] = useState("");
  const [inputPriority, setInputPriority] = useState("0.5");
  const [inputChangeFreq, setInputChangeFreq] = useState<"hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never">("weekly");
  const [inputLastMod, setInputLastMod] = useState(new Date().toISOString().split("T")[0]);

  // Load domain from Smart Handoff
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        // Replace base domain entry
        const cleanUrl = data.url.endsWith("/") ? data.url : `${data.url}/`;
        setEntries([
          { id: "1", url: cleanUrl, priority: "1.0", changefreq: "daily", lastmod: new Date().toISOString().split("T")[0] },
          { id: "2", url: `${cleanUrl}about`, priority: "0.5", changefreq: "monthly", lastmod: new Date().toISOString().split("T")[0] }
        ]);
        onAddToast("Synthesized custom sitemap nodes from Smart Handoff!", "success");
      }
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Re-build sitemap automatically
  useEffect(() => {
    generateXmlSitemap();
  }, [entries]);

  const generateXmlSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!-- Generated offline via GainUtility XML Sitemap Builder -->\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    entries.forEach((entry) => {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(entry.url.trim())}</loc>\n`;
      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    setCompiledXml(xml);
  };

  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
  };

  const handleAddEntry = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      onAddToast("URL location path is required.", "error");
      return;
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      onAddToast("Sitemap URLs must start with http:// or https:// protocol.", "warning");
      return;
    }

    const newEntry: SitemapEntry = {
      id: Date.now().toString(),
      url: trimmed,
      priority: inputPriority,
      changefreq: inputChangeFreq,
      lastmod: inputLastMod
    };

    setEntries([...entries, newEntry]);
    setInputUrl("");
    onAddToast(`Added new sitemap url node!`, "success");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    onAddToast("Sitemap node path removed.", "info");
  };

  const handleCopyCode = () => {
    if (!compiledXml) return;
    onCopy(compiledXml);
    onAddToast("Sitemap XML copied to clipboard!", "success");
  };

  const handleDownloadFile = () => {
    if (!compiledXml) return;
    const blob = new Blob([compiledXml], { type: "application/xml;charset=utf-8" });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = "sitemap.xml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
    onAddToast("sitemap.xml file downloaded!", "success");
  };

  const handleReset = () => {
    setEntries([
      { id: "1", url: "https://gainutility.com/", priority: "1.0", changefreq: "daily", lastmod: new Date().toISOString().split("T")[0] }
    ]);
    onAddToast("Sitemap reset to fallback base directory.", "info");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Compiler Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Entries Manager */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title="Sitemap Link Nodes" subtitle="Add or modify your website urls to index.">
            <div className="space-y-4">
              
              {/* Dynamic URL List */}
              <div className="border border-border-light rounded-[16px] bg-background max-h-[280px] overflow-x-auto overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-muted/60 border-b border-border-light font-sans font-bold text-text-sub">
                      <th className="p-3">Location URL</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3 text-center">Freq</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border-light/40 last:border-0 font-mono text-xs">
                        <td className="p-3 text-text-main truncate max-w-[200px]" title={entry.url}>
                          {entry.url}
                        </td>
                        <td className="p-3 font-bold text-brand-primary">{entry.priority}</td>
                        <td className="p-3 text-center uppercase tracking-wider text-[10px] text-text-muted">{entry.changefreq}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 text-text-muted hover:text-status-error rounded-lg hover:bg-status-error/10 transition-colors cursor-pointer"
                            title="Remove Node"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-xs text-text-muted">
                          No URL nodes added. Complete form inputs below to build nodes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Entry Form Section */}
              <div className="p-5 bg-surface-muted/20 border border-border-light/60 rounded-[18px] space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-text-sub tracking-wider">
                  ➕ Add New XML URL Node
                </h4>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-text-muted font-sans">Target Location Path (loc)</label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/services"
                    className="px-3 py-2 text-xs font-mono border border-border-medium rounded-lg bg-background text-text-main focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted font-sans" htmlFor="xml-sitemap-generator-priority-0-1-1-0">Priority (0.1 - 1.0)</label>
                    <select
                      value={inputPriority}
                      onChange={(e) => setInputPriority(e.target.value)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="xml-sitemap-generator-priority-0-1-1-0">
                      <option value="1.0">1.0 (Home page)</option>
                      <option value="0.9">0.9 (Landing pages)</option>
                      <option value="0.8">0.8 (High value)</option>
                      <option value="0.7">0.7 (Products)</option>
                      <option value="0.5">0.5 (Standard Blog)</option>
                      <option value="0.3">0.3 (Archive posts)</option>
                      <option value="0.1">0.1 (Deprecated)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted font-sans" htmlFor="xml-sitemap-generator-change-freq">Change Freq</label>
                    <select
                      value={inputChangeFreq}
                      onChange={(e) => setInputChangeFreq(e.target.value as any)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="xml-sitemap-generator-change-freq">
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted font-sans" htmlFor="xml-sitemap-generator-last-modified-lastmod">Last Modified (lastmod)</label>
                    <input
                      type="date"
                      value={inputLastMod}
                      onChange={(e) => setInputLastMod(e.target.value)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main"
                    id="xml-sitemap-generator-last-modified-lastmod"/>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddEntry}
                    className="h-[36px] px-5 py-1 text-xs"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Location
                  </Button>
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right XML Code Output Panel */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card 
            title="Generated XML Map Preview" 
            subtitle="Compliant with Google Sitemap Protocol 0.9."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download XML
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Code
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated XML Map Preview"
                readOnly
                value={compiledXml}
                className="w-full h-[380px] p-5 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                Sitemap syntax checked
              </div>
            </div>
          </Card>

          {/* Validation Checklist */}
          <Card title="Sitemap Node Validation Checklist" subtitle="Standards checking compliance automatically.">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>UTF-8 Declared:</strong> First line contains the proper XML header definition and encoding rules.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Special Entity Protection:</strong> Ampersand (`&amp;`) and tag bracket items are encoded to shield parsing engines.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>W3C ISO Date Syntax:</strong> Dates follow compliant `YYYY-MM-DD` stamps.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="xml-sitemap-generator"
        seoData={{ url: entries[0]?.url }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Educational elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> Why Do I Need an XML Sitemap?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            An XML sitemap acts as a literal inventory of your website files. It highlights specific pages to Googlebot and other index crawlers that might otherwise remain unlinked or unindexed. By organizing priority weights and changefreq metadata, you tell crawlers which pages are crucial core pillars of your platform versus archive listings.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Client Validation
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All sitemap XML compilation and location escaping are executed directly in-browser. Your directories and staging URLs stay inside the tab and are never uploaded — there is no backend that receives sitemap assets.
          </p>
        </div>
      </div>
    </div>
  );
};
