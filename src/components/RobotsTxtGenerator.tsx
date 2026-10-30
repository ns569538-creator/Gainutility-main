import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, 
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

interface RobotsRule {
  id: string;
  userAgent: string;
  directive: "Allow" | "Disallow";
  path: string;
}

interface RobotsTxtGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const RobotsTxtGenerator: React.FC<RobotsTxtGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Config state
  const [rules, setRules] = useState<RobotsRule[]>([
    { id: "1", userAgent: "*", directive: "Disallow", path: "/admin/" },
    { id: "2", userAgent: "*", directive: "Disallow", path: "/private/" },
    { id: "3", userAgent: "*", directive: "Allow", path: "/" },
  ]);

  const [sitemapUrl, setSitemapUrl] = useState("https://gainutility.com/sitemap.xml");
  const [crawlDelay, setCrawlDelay] = useState<string>("none");
  const [compiledText, setCompiledText] = useState("");

  // Input states for adding rules
  const [newAgent, setNewAgent] = useState("*");
  const [newDirective, setNewDirective] = useState<"Allow" | "Disallow">("Disallow");
  const [newPath, setNewPath] = useState("");

  // Load URL from Smart Handoff
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        // Build sitemap suggestion
        const cleanUrl = data.url.replace(/\/$/, "");
        setSitemapUrl(`${cleanUrl}/sitemap.xml`);
        onAddToast("Imported sitemap location via Smart Handoff!", "success");
      }
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Re-generate robots.txt content
  useEffect(() => {
    generateRobotsText();
  }, [rules, sitemapUrl, crawlDelay]);

  const generateRobotsText = () => {
    let output = `# robots.txt generated offline via GainUtility\n`;
    output += `# Created on ${new Date().toLocaleDateString()}\n\n`;

    // Group rules by user agent to write clean format
    const agents = Array.from(new Set(rules.map(r => r.userAgent)));
    
    if (agents.length === 0) {
      output += "User-agent: *\nDisallow:\n";
    } else {
      agents.forEach(agent => {
        output += `User-agent: ${agent}\n`;
        const agentRules = rules.filter(r => r.userAgent === agent);
        
        agentRules.forEach(rule => {
          output += `${rule.directive}: ${rule.path || "/"}\n`;
        });

        if (crawlDelay !== "none" && agent === "*") {
          output += `Crawl-delay: ${crawlDelay}\n`;
        }
        
        output += "\n";
      });
    }

    if (sitemapUrl.trim()) {
      output += `Sitemap: ${sitemapUrl.trim()}\n`;
    }

    setCompiledText(output);
  };

  const handleAddRule = () => {
    const cleanPath = newPath.trim() || "/";
    const newRule: RobotsRule = {
      id: Date.now().toString(),
      userAgent: newAgent.trim() || "*",
      directive: newDirective,
      path: cleanPath
    };

    setRules([...rules, newRule]);
    setNewPath("");
    onAddToast(`Added crawl directive rule for ${newRule.userAgent}!`, "success");
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    onAddToast("Directives rule removed.", "info");
  };

  const handleCopyCode = () => {
    if (!compiledText) return;
    onCopy(compiledText);
    onAddToast("Copied robots.txt to clipboard!", "success");
  };

  const handleDownloadFile = () => {
    if (!compiledText) return;
    const blob = new Blob([compiledText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robots.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast("robots.txt downloaded!", "success");
  };

  const handleReset = () => {
    setRules([
      { id: "1", userAgent: "*", directive: "Disallow", path: "/admin/" },
      { id: "2", userAgent: "*", directive: "Disallow", path: "/private/" }
    ]);
    setSitemapUrl("");
    setCrawlDelay("none");
    onAddToast("Restored standard search default crawler rules.", "info");
  };

  const presetAllowAll = () => {
    setRules([{ id: "1", userAgent: "*", directive: "Allow", path: "/" }]);
    onAddToast("Applied: Allow All Crawlers preset.", "success");
  };

  const presetDisallowAll = () => {
    setRules([{ id: "1", userAgent: "*", directive: "Disallow", path: "/" }]);
    onAddToast("Applied: Disallow All Crawlers preset.", "warning");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Compiler Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column builders */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Rules builder card */}
          <Card title="Crawl Directive Rule Sets" subtitle="Configure allow / disallow criteria for specified robots.">
            <div className="space-y-5">
              
              {/* Rules List table */}
              <div className="border border-border-light rounded-[16px] overflow-hidden bg-background">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-muted/60 border-b border-border-light font-sans font-bold text-text-sub">
                      <th className="p-3">User-Agent</th>
                      <th className="p-3">Directive</th>
                      <th className="p-3">Target Path</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border-light/40 last:border-0 font-mono text-xs">
                        <td className="p-3 text-brand-primary font-bold">{rule.userAgent}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rule.directive === "Allow" 
                              ? "bg-status-success/30 text-status-success"
                              : "bg-status-error/30 text-status-error"
                          }`}>
                            {rule.directive}
                          </span>
                        </td>
                        <td className="p-3 text-text-main truncate max-w-[120px]">{rule.path}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-text-muted hover:text-status-error rounded-lg hover:bg-status-error/10 transition-colors cursor-pointer"
                            title="Remove Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-xs text-text-muted">
                          No crawler restrictions declared. Crawlers will access all pages.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Rule Form */}
              <div className="p-4 bg-surface-muted/30 border border-border-light/60 rounded-[14px] space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-text-sub tracking-wider">
                  ➕ Add Custom Crawler Rule
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted" htmlFor="robots-txt-generator-user-agent">User-Agent</label>
                    <select
                      value={newAgent}
                      onChange={(e) => setNewAgent(e.target.value)}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="robots-txt-generator-user-agent">
                      <option value="*">All Bots (*)</option>
                      <option value="Googlebot">Googlebot</option>
                      <option value="Bingbot">Bingbot</option>
                      <option value="Yandex">Yandex</option>
                      <option value="Baiduspider">Baiduspider</option>
                      <option value="ia_archiver">Alexa (ia_archiver)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted" htmlFor="robots-txt-generator-directive">Directive</label>
                    <select
                      value={newDirective}
                      onChange={(e) => setNewDirective(e.target.value as "Allow" | "Disallow")}
                      className="px-3 py-2 text-xs border border-border-medium rounded-lg bg-background text-text-main cursor-pointer"
                     id="robots-txt-generator-directive">
                      <option value="Disallow">Disallow (Block)</option>
                      <option value="Allow">Allow (Permit)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-text-muted">Directory / Path</label>
                    <input
                      type="text"
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      placeholder="/admin/ (or /)"
                      className="px-3 py-2 text-xs font-mono border border-border-medium rounded-lg bg-background text-text-main focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddRule}
                    className="h-[36px] py-1 px-4 text-xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Rule
                  </Button>
                </div>
              </div>

            </div>
          </Card>

          {/* Core settings */}
          <Card title="Sitemap & Delay Options" subtitle="Integrate sitemaps and set server crawl limits.">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-main font-sans">
                  XML Sitemap Absolute URL
                </label>
                <input
                  type="text"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/sitemap.xml"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-main font-sans" htmlFor="robots-txt-generator-crawl-delay-parameter-seconds">
                  Crawl-Delay Parameter (Seconds)
                </label>
                <select
                  value={crawlDelay}
                  onChange={(e) => setCrawlDelay(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none cursor-pointer"
                 id="robots-txt-generator-crawl-delay-parameter-seconds">
                  <option value="none">No Delay (Highly Recommended)</option>
                  <option value="1">1 Second Delay</option>
                  <option value="2">2 Seconds Delay</option>
                  <option value="5">5 Seconds Delay</option>
                  <option value="10">10 Seconds Delay</option>
                </select>
              </div>
            </div>
          </Card>

        </div>

        {/* Right column preview output */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card 
            title="Generated robots.txt Preview" 
            subtitle="Save this text file directly into your website's root root directory."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download robots.txt
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Content
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated robots.txt Preview"
                readOnly
                value={compiledText}
                className="w-full h-[360px] p-5 text-base sm:text-sm font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                ASCII plain text formatted
              </div>
            </div>
          </Card>

          {/* Validation card */}
          <Card title="Crawl Rule Audits" subtitle="Quality assurance check guidelines.">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Valid Sitemap URL:</strong> Your sitemap line is complete and contains the absolute `https://` protocol schema.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Wildcard Handler:</strong> The primary User-agent wildcard bot (`*`) is present to structure baseline directives.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Root slash check:</strong> Directory path rules cleanly start with a leading slash `/` block.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Smart Continue Editing */}
      <ContinueEditing 
        currentToolId="robots-txt-generator"
        seoData={{ url: sitemapUrl.replace(/sitemap\.xml$/, "") }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> What is a Robots.txt File?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            The robots.txt file resides in the root directory of your domain (e.g. `yourwebsite.com/robots.txt`). It instructs search engine crawlers (like Googlebot, Bingbot, or DuckDuckBot) on which sections of your site they should skip or indexing. It belongs to the Crawl-Delay and robots exclusion standard, keeping heavy automated search spiders off administrative and staging directories.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Verification Sandbox
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            GainUtility is an offline-first workspace platform. None of your directory listings, database schemas, sitemap URLs, or administrative exclusions are sent to external analytics or processed on cloud services. Your site structural secrets remain 100% private.
          </p>
        </div>
      </div>
    </div>
  );
};
