/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Card } from "./Common";
import { 
  Palette, 
  Type, 
  Grid, 
  Layers, 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  Code, 
  Sliders, 
  CheckCircle,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

export const DesignSystemExplorer: React.FC<{
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}> = ({ onCopy, onAddToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<"foundations" | "tokens" | "components" | "principles">("foundations");
  const [copiedKey, setCopiedKey] = useState<string>("");

  const notify = (key: string, label: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1200);
    onAddToast?.(`${label} copied`, "success");
  };

  const copy = (key: string, text: string, label: string) => {
    if (onCopy) {
      onCopy(text);
      notify(key, label);
    } else {
      navigator.clipboard.writeText(text).then(() => notify(key, label));
    }
  };

  const brandColors = [
    { name: "Primary", hex: "#556B2F", use: "Brand signatures, focal headers, main CTAs", class: "bg-[#556B2F]" },
    { name: "Primary Dark", hex: "#263124", use: "Deep slate background dark headers, main high contrast body text", class: "bg-[#263124]" },
    { name: "Background", hex: "#FAF8F1", use: "Main page content wrapper canvas, warm light background theme", class: "bg-[#FAF8F1]" },
    { name: "Secondary", hex: "#D9B95B", use: "Highlight panels, secondary action badges, warning alerts", class: "bg-[#D9B95B]" },
    { name: "Accent", hex: "#D9B95B", use: "Interactive tags, focal icons, highlights, decorative triggers", class: "bg-[#D9B95B]" }
  ];

  const typographySpecs = [
    { name: "Display XL", size: "3.0rem (48px)", weight: "Bold", height: "1.15", usage: "Focal marketing headers and display statements" },
    { name: "Display L", size: "2.25rem (36px)", weight: "Bold", height: "1.2", usage: "Section introduction headers" },
    { name: "Heading 1", size: "1.875rem (30px)", weight: "Semibold", height: "1.25", usage: "Standard card tool titles" },
    { name: "Heading 2", size: "1.5rem (24px)", weight: "Semibold", height: "1.3", usage: "Secondary layout dividers" },
    { name: "Body Large", size: "1.0rem (16px)", weight: "Regular", height: "1.5", usage: "Paragraph prose, standard form values" },
    { name: "Body Small", size: "0.875rem (14px)", weight: "Regular", height: "1.5", usage: "Helper hints, captions" },
    { name: "Code Block", size: "0.875rem (14px)", weight: "Medium (Monospace)", height: "1.4", usage: "Syntax viewers, JSON structures" }
  ];

  const spacingTokens = [
    { token: "4pt", value: "4px", usage: "Micro gaps, dot offsets, border paddings" },
    { token: "8pt", value: "8px", usage: "Inside button spacing, list gap structures" },
    { token: "12pt", value: "12px", usage: "Inner card margins, input box labels" },
    { token: "16pt", value: "16px", usage: "Standard grid spacing, section buffers" },
    { token: "24pt", value: "24px", usage: "Large layout margins, header padding sizes" },
    { token: "32pt", value: "32px", usage: "Section dividers, bento spacing" }
  ];

  return (
    <div className="flex flex-col gap-6" id="design-system-spec-sheet">
      
      {/* Intro Header */}
      <div className="p-6 rounded-lg bg-surface-base border border-border-light shadow-premium-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="display-lg text-text-main flex items-center gap-2">
            <Palette className="w-8 h-8 text-brand-primary" /> Multi-lingual Living Tokens
          </h2>
          <p className="text-sm text-text-sub mt-1 max-w-xl leading-relaxed">
            The unified Apple / Figma scale designed to bind the core architecture of 500+ utility modules securely.
          </p>
        </div>
        
        {/* Toggle subtabs */}
        <div className="flex gap-1 bg-background p-1 border border-border-light rounded flex-wrap">
          {(["foundations", "tokens", "components", "principles"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-1.5 px-3.5 rounded font-sans font-bold text-xs capitalize transition-colors cursor-pointer ${
                activeSubTab === tab 
                  ? "bg-brand-primary text-[#FAF8F1]" 
                  : "text-text-sub hover:bg-surface-hover"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-PANEL CONTENT */}
      {activeSubTab === "foundations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Brand Palette */}
          <Card title="Semantic Color Palette System" subtitle="Rooted on earthy, calming tones representing trust and absolute precision.">
            <div className="flex flex-col gap-4">
              {brandColors.map((color, index) => (
                <div key={index} className="flex gap-4 items-center p-2 rounded hover:bg-surface-muted/50 border border-transparent hover:border-border-light transition-all">
                  <div className={`w-12 h-12 rounded shadow-sm border border-border-light ${color.class}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-sm text-text-main">{color.name}</span>
                      <span className="font-mono text-xs text-text-muted bg-background px-1.5 py-0.5 rounded border border-border-light">{color.hex}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{color.use}</p>
                  </div>
                  <button
                    onClick={() => copy(`brand-${index}`, color.hex, color.hex)}
                    className="shrink-0 p-2 rounded-lg border border-border-light bg-background hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                    title={`Copy ${color.hex}`}
                    aria-label={`Copy ${color.hex}`}
                  >
                    {copiedKey === `brand-${index}` ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Typography */}
          <Card title="Scale-Free Responsive Typography" subtitle="Built on standard Lato and Space Grotesk display faces with generous lead lines.">
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-light text-text-muted">
                      <th className="pb-2 font-mono font-bold uppercase tracking-wider">Style Name</th>
                      <th className="pb-2 font-mono font-bold uppercase tracking-wider">Size (Line-H)</th>
                      <th className="pb-2 font-mono font-bold uppercase tracking-wider">Optimal Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/40">
                    {typographySpecs.map((spec, index) => (
                      <tr key={index}>
                        <td className="py-2.5 font-sans font-bold text-text-main text-sm">{spec.name}</td>
                        <td className="py-2.5 font-mono text-text-sub">{spec.size}</td>
                        <td className="py-2.5 text-text-muted leading-relaxed">{spec.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

        </div>
      )}

      {activeSubTab === "tokens" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Spacing tokens */}
          <Card title="8pt Spacing grid tokens" subtitle="Controls layout pacing.">
            <div className="flex flex-col gap-3">
              {spacingTokens.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-background border border-border-light">
                  <span className="font-mono text-xs font-bold text-brand-primary">{st.token}</span>
                  <span className="text-xs text-text-sub font-semibold flex-1">{st.usage}</span>
                  <button
                    onClick={() => copy(`spacing-${idx}`, st.value, `${st.token} spacing`)}
                    className="shrink-0 p-1.5 rounded-md border border-border-light bg-surface-base hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                    title={`Copy ${st.value}`}
                    aria-label={`Copy ${st.value}`}
                  >
                    {copiedKey === `spacing-${idx}` ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Border Radii */}
          <Card title="Radius tokens (Figma UI)" subtitle="Consistency for buttons & containers.">
            <div className="flex flex-col gap-3">
              {[
                { r: "XS", v: "2px", u: "Labels, status micro-indicators" },
                { r: "SM", v: "4px", u: "Buttons, code editor blocks, toggles" },
                { r: "MD", v: "8px", u: "Standard inputs, inner list groups" },
                { r: "LG", v: "12px", u: "Bento cards, main grid containers" },
                { r: "XL", v: "16px", u: "Large display dialog modules, overlays" },
                { r: "Full", v: "9999px", u: "Pill shape badges, switch sliders" },
              ].map((radius, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-background border border-border-light">
                  <span className="font-mono text-xs font-bold text-brand-primary">{radius.r} ({radius.v})</span>
                  <span className="text-xs text-text-sub font-semibold flex-1">{radius.u}</span>
                  <button
                    onClick={() => copy(`radius-${idx}`, radius.v, `${radius.r} radius`)}
                    className="shrink-0 p-1.5 rounded-md border border-border-light bg-surface-base hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                    title={`Copy ${radius.v}`}
                    aria-label={`Copy ${radius.v}`}
                  >
                    {copiedKey === `radius-${idx}` ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Elevation levels */}
          <Card title="Elevation & Shadows" subtitle="Layering for overlays.">
            <div className="flex flex-col gap-3">
              {[
                { el: "XS", s: "0 1px 2px", u: "Resting states, buttons, microcards" },
                { el: "MD", s: "0 4px 12px", u: "Dropdown drawers, search toolbars" },
                { el: "LG", s: "0 12px 24px", u: "Flyout dialog panels, notification toasts" },
              ].map((elev, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-background border border-border-light hover:shadow-premium-md transition-shadow">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-mono text-xs font-bold text-brand-primary">Elevation {elev.el}</span>
                    <span className="text-[10px] text-text-muted font-mono">{elev.s}</span>
                    <span className="text-xs text-text-sub mt-0.5">{elev.u}</span>
                  </div>
                  <button
                    onClick={() => copy(`elev-${idx}`, `box-shadow: ${elev.s} rgba(0,0,0,0.08);`, `Elevation ${elev.el}`)}
                    className="shrink-0 p-1.5 rounded-md border border-border-light bg-surface-base hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                    title={`Copy ${elev.s}`}
                    aria-label={`Copy ${elev.s}`}
                  >
                    {copiedKey === `elev-${idx}` ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const css = [
                    "--color-primary: #556B2F;",
                    "--color-primary-dark: #263124;",
                    "--color-background: #FAF8F1;",
                    "--color-secondary: #D9B95B;",
                    "--space-4pt: 4px;",
                    "--space-8pt: 8px;",
                    "--space-12pt: 12px;",
                    "--space-16pt: 16px;",
                    "--space-24pt: 24px;",
                    "--space-32pt: 32px;",
                    "--radius-xs: 2px;",
                    "--radius-sm: 4px;",
                    "--radius-md: 8px;",
                    "--radius-lg: 12px;",
                    "--radius-xl: 16px;",
                    "--radius-full: 9999px;",
                    "--elevation-xs: 0 1px 2px rgba(0,0,0,0.08);",
                    "--elevation-md: 0 4px 12px rgba(0,0,0,0.08);",
                    "--elevation-lg: 0 12px 24px rgba(0,0,0,0.08);"
                  ].join("\n");
                  copy("all-tokens", css, "All design tokens");
                }}
                className="mt-1 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-brand-primary-light hover:bg-brand-primary hover:text-[#FAF8F1] text-brand-primary text-xs font-bold font-mono rounded-xl transition-all border border-brand-primary/10 cursor-pointer"
              >
                {copiedKey === "all-tokens" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy all tokens as CSS variables
              </button>
            </div>
          </Card>

        </div>
      )}

      {activeSubTab === "components" && (
        <div className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card title="Atomic Buttons Demo Matrix" subtitle="Ensuring standard 44px responsive touch actions.">
              <div className="flex flex-wrap gap-3">
                <button className="bg-brand-primary text-white text-xs font-sans font-bold py-2 px-4 rounded shadow-premium-sm hover:opacity-90 cursor-pointer">
                  Primary Brand
                </button>
                <button className="bg-brand-secondary text-[#283618] text-xs font-sans font-bold py-2 px-4 rounded shadow-premium-sm hover:opacity-90 cursor-pointer">
                  Secondary Action
                </button>
                <button className="border border-border-medium text-text-main text-xs font-sans font-bold py-2 px-4 rounded hover:bg-surface-muted cursor-pointer">
                  Outline Neutral
                </button>
                <button className="bg-status-success text-white text-xs font-sans font-bold py-2 px-4 rounded shadow-premium-sm cursor-pointer">
                  Success Green
                </button>
                <button className="bg-status-error text-white text-xs font-sans font-bold py-2 px-4 rounded shadow-premium-sm cursor-pointer">
                  Danger Warning
                </button>
              </div>
            </Card>

            <Card title="Platform Navigation Spec" subtitle="Scales dynamically from sidebar panels to mobile tabs.">
              <div className="p-4 bg-background rounded border border-border-light flex gap-4 text-xs font-semibold">
                <span className="text-brand-primary border-b-2 border-brand-primary pb-1">JSON Editor</span>
                <span className="text-text-muted">Word Analysis</span>
                <span className="text-text-muted">Color Palette</span>
              </div>
            </Card>

          </div>

        </div>
      )}

      {activeSubTab === "principles" && (
        <Card title="Design System core principles" subtitle="Every single component adheres strictly to Vercel/Apple aesthetic foundations.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <h4 className="font-sans font-bold text-sm text-text-main">1. Minimal visual decorations</h4>
              <p className="text-xs text-text-sub leading-relaxed">
                We strictly ban complex, heavy 3D buttons, neon glow borders, and decorative outer margins. Premium crafts come from spacing rhythms, typographic line balance, and eye-safe palettes.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-sans font-bold text-sm text-text-main">2. Multi-lingual scale-neutral density</h4>
              <p className="text-xs text-text-sub leading-relaxed">
                Buttons remain strictly min-height 44px to easily fit mobile touch bounds, and font sizing supports clean translations to Hindi, German, Mandarin or English without overlap.
              </p>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};
