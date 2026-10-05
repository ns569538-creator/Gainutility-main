import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Link2, 
  Copy, 
  Download, 
  QrCode as QrIcon, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ExternalLink,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";
import QRCode from "qrcode";

interface UtmBuilderProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const UtmBuilder: React.FC<UtmBuilderProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  // Input states
  const [baseUrl, setBaseUrl] = useState("https://gainutility.com");
  const [source, setSource] = useState("newsletter");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("summer_sale_2026");
  const [term, setTerm] = useState("visual_design");
  const [content, setContent] = useState("hero_banner_blue");
  
  const [autoEncode, setAutoEncode] = useState(true);
  const [compiledUrl, setCompiledUrl] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load URL from Smart Handoff
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        setBaseUrl(data.url);
        onAddToast("Imported base URL via Smart Handoff!", "success");
      }
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Re-generate URL & QR code on change
  useEffect(() => {
    buildUrl();
  }, [baseUrl, source, medium, campaign, term, content, autoEncode]);

  const buildUrl = () => {
    const trimmedBase = baseUrl.trim();
    if (!trimmedBase) {
      setCompiledUrl("");
      return;
    }

    try {
      // Build the UTM query string manually so each value is percent-encoded
      // exactly once (URLSearchParams.toString() would re-encode already
      // encoded values like %20 -> %2520).
      const parts: string[] = [];
      const push = (key: string, val: string) => {
        const v = val.trim();
        if (!v) return;
        parts.push(`${key}=${autoEncode ? encodeURIComponent(v) : v}`);
      };

      push("utm_source", source);
      push("utm_medium", medium);
      push("utm_campaign", campaign);
      push("utm_term", term);
      push("utm_content", content);

      const queryStr = parts.join("&");
      
      let finalUrl = trimmedBase;
      if (queryStr) {
        finalUrl += trimmedBase.includes("?") ? `&${queryStr}` : `?${queryStr}`;
      }

      setCompiledUrl(finalUrl);

      // Render QR code offline
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          finalUrl,
          {
            width: 220,
            margin: 1.5,
            color: {
              dark: "#2b2d42",
              light: "#FAF8F1"
            }
          },
          (error) => {
            if (error) console.error("Error drawing campaign QR Code", error);
          }
        );
      }
    } catch (e) {
      setCompiledUrl("");
    }
  };

  const handleCopyUrl = () => {
    if (!compiledUrl) return;
    onCopy(compiledUrl);
    onAddToast("Campaign UTM URL copied!", "success");
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const urlBlob = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `utm_campaign_qr_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Campaign QR Code image saved!", "success");
  };

  const handleReset = () => {
    setBaseUrl("https://gainutility.com");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    onAddToast("Campaign parameters cleared.", "info");
  };

  const loadPreset = (type: "social" | "search" | "newsletter") => {
    if (type === "social") {
      setSource("facebook");
      setMedium("social_post");
      setCampaign("launch_campaign");
      setTerm("audience_developers");
      setContent("bento_grid_visual");
    } else if (type === "search") {
      setSource("google");
      setMedium("cpc");
      setCampaign("brand_awareness");
      setTerm("best_json_formatter");
      setContent("text_ad_v1");
    } else {
      setSource("newsletter");
      setMedium("email");
      setCampaign("weekly_digest_32");
      setTerm("subscribers");
      setContent("bottom_cta_button");
    }
    onAddToast(`Applied campaign preset: ${type}!`, "success");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Compiler split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form configurations */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title="Campaign Tracking Parameters" subtitle="All parameters are compiled live.">
            <div className="space-y-4">
              
              {/* Base website */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Base Destination URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/landing-page"
                  className="w-full px-4 py-3 text-sm font-mono border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Source & Medium */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Campaign Source (utm_source)
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. google, newsletter, facebook"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <span className="text-[10px] text-text-muted">The referrer system (e.g. twitter, blog)</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Campaign Medium (utm_medium)
                  </label>
                  <input
                    type="text"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="e.g. cpc, email, social, banner"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <span className="text-[10px] text-text-muted">Marketing medium format (e.g. cpc, affiliate)</span>
                </div>
              </div>

              {/* Campaign Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                  Campaign Name (utm_campaign)
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. black_friday_2026"
                  className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <span className="text-[10px] text-text-muted">Overall marketing campaign or promo context</span>
              </div>

              {/* Term & Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Campaign Term (utm_term)
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="e.g. keyword_bento"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <span className="text-[10px] text-text-muted">Identify paid search terms or keywords</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted">
                    Campaign Content (utm_content)
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="e.g. video_ad_v2"
                    className="w-full px-4 py-3 text-sm border border-border-medium rounded-[14px] bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <span className="text-[10px] text-text-muted">Differentiate split creative designs or CTA options</span>
                </div>
              </div>

              {/* URL encode switch */}
              <div className="flex items-center gap-3 pt-3 border-t border-border-light">
                <input
                  id="encode_toggle"
                  type="checkbox"
                  checked={autoEncode}
                  onChange={(e) => setAutoEncode(e.target.checked)}
                  className="w-4 h-4 text-brand-primary border-border-medium rounded cursor-pointer"
                />
                <label htmlFor="encode_toggle" className="text-xs font-mono uppercase font-bold text-text-sub cursor-pointer">
                  Auto percent-encode parameters (Recommended)
                </label>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Output panels with QR code */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* UTM output */}
          <Card 
            title="Generated UTM Campaign Link" 
            subtitle="Ready to paste into your campaign ads."
            actions={
              <Button variant="primary" size="sm" onClick={handleCopyUrl} leftIcon={<Copy className="w-4 h-4" />}>
                Copy Link
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  aria-label="Generated UTM campaign link"
                  readOnly
                  value={compiledUrl}
                  className="w-full h-[100px] p-4 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed break-all"
                />
              </div>

              {/* Visual offline generated QR Code canvas box */}
              <div className="p-4 bg-surface-muted/30 border border-border-light rounded-[16px] flex flex-col items-center justify-center space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-text-muted flex items-center gap-1.5">
                  <QrIcon className="w-4 h-4 text-brand-primary" /> Offline Campaign QR Code
                </h4>
                
                <div className="p-2 bg-white rounded-xl shadow-premium-sm border border-border-light">
                  <canvas ref={canvasRef} className="max-w-[200px]" />
                </div>
                
                <Button variant="outline" size="sm" onClick={handleDownloadQr} className="text-xs h-[36px]" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download PNG QR Image
                </Button>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Smart Continue Editing Component */}
      <ContinueEditing 
        currentToolId="utm-builder"
        seoData={{ url: baseUrl }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Educational info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> UTM Campaign FAQ
          </h3>
          <div className="space-y-3.5">
            <p className="text-sm text-text-muted leading-relaxed">
              <strong>What is a UTM Parameter?</strong>
              <br />
              UTM (Urchin Tracking Module) tags are standard text snippets appended to domain links to help analytics programs (like Google Analytics, Mixpanel, or Plausible) monitor precisely where users came from, which links they pressed, and which campaign brought them to your platform.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Safe & Telemetry Free
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All campaign string assemblies and high-performance QR code matrix drawings are executed in your active local sandbox using web standard processes. No advertising pixel logs or user domain structures are sent to any remote servers. Your campaign security is fully preserved.
          </p>
        </div>
      </div>
    </div>
  );
};
