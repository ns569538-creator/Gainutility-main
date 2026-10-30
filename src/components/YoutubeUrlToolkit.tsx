import React, { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import { 
  Copy, 
  QrCode, 
  Youtube, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Info, 
  Share2,
  Eye,
  EyeOff,
  Shield,
  Link as LinkIcon,
  Trash2,
  Layers,
  Play,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";

interface YoutubeUrlToolkitProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

interface DetectedParam {
  key: string;
  value: string;
  type: "tracking" | "functional" | "unknown";
  description: string;
}

const PARAM_INFO: Record<string, { type: DetectedParam["type"]; description: string }> = {
  si: { type: "tracking", description: "Share tracking token — identifies where you copied the link from" },
  feature: { type: "tracking", description: "Feature referral parameter — tracks which YouTube feature led to the share" },
  utm_source: { type: "tracking", description: "UTM campaign source parameter" },
  utm_medium: { type: "tracking", description: "UTM campaign medium parameter" },
  utm_campaign: { type: "tracking", description: "UTM campaign name parameter" },
  utm_term: { type: "tracking", description: "UTM campaign term parameter" },
  utm_content: { type: "tracking", description: "UTM campaign content parameter" },
  t: { type: "functional", description: "Timestamp parameter — starts video at specific time" },
  list: { type: "functional", description: "Playlist ID — groups video in a playlist context" },
  index: { type: "functional", description: "Playlist index — which video in the playlist" },
  v: { type: "functional", description: "Video ID parameter (standard watch URL)" },
  start: { type: "functional", description: "Start time in seconds (alternative to t=)" },
  end: { type: "functional", description: "End time in seconds" },
  rel: { type: "functional", description: "Related videos setting (0 = hide, 1 = show)" },
  autoplay: { type: "functional", description: "Autoplay setting (0 = off, 1 = on)" },
  mute: { type: "functional", description: "Mute setting (0 = off, 1 = on)" },
  controls: { type: "functional", description: "Player controls visibility (0 = hide, 1 = show)" },
  cc_load_policy: { type: "functional", description: "Closed captions policy (0 = off, 1 = on)" },
  hl: { type: "functional", description: "Interface language code" },
  gl: { type: "functional", description: "Geographic location code" },
};

export const YoutubeUrlToolkit: React.FC<YoutubeUrlToolkitProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [urlInput, setUrlInput] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showParamDetails, setShowParamDetails] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse URL and extract all parameters
  const parsedMeta = useMemo(() => {
    const trimmed = urlInput.trim();
    let videoId = "";
    let playlistId = "";
    let channelId = "";
    let isShorts = false;
    let isEmbed = false;
    let timestamp = "";
    const detectedParams: DetectedParam[] = [];

    if (!trimmed) {
      return { videoId: "", playlistId: "", channelId: "", isShorts: false, isEmbed: false, timestamp: "", detectedParams: [] };
    }

    // Extract all query parameters
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      url.searchParams.forEach((value, key) => {
        const info = PARAM_INFO[key.toLowerCase()];
        detectedParams.push({
          key,
          value,
          type: info?.type || "unknown",
          description: info?.description || "Unknown parameter",
        });
      });
    } catch {
      // Invalid URL, skip param parsing
    }

    // Extract video ID
    if (trimmed.includes("v=")) {
      const match = trimmed.match(/[&?]v=([a-zA-Z0-9_-]{11})/);
      if (match) videoId = match[1];
    }
    else if (trimmed.includes("youtu.be/")) {
      const parts = trimmed.split("youtu.be/");
      const idPart = parts[1]?.split(/[?#&]/)[0];
      if (idPart && idPart.length === 11) videoId = idPart;
    }
    else if (trimmed.includes("/shorts/")) {
      isShorts = true;
      const parts = trimmed.split("/shorts/");
      const idPart = parts[1]?.split(/[?#&]/)[0];
      if (idPart && idPart.length === 11) videoId = idPart;
    }
    else if (trimmed.includes("/embed/")) {
      isEmbed = true;
      const parts = trimmed.split("/embed/");
      const idPart = parts[1]?.split(/[?#&]/)[0];
      if (idPart && idPart.length === 11) videoId = idPart;
    }
    else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      videoId = trimmed;
    }

    // Extract playlist ID
    if (trimmed.includes("list=")) {
      const match = trimmed.match(/[&?]list=([a-zA-Z0-9_-]+)/);
      if (match) playlistId = match[1];
    }

    // Extract channel ID
    if (trimmed.includes("/channel/")) {
      const parts = trimmed.split("/channel/");
      const idPart = parts[1]?.split(/[?#&/]/)[0];
      if (idPart && idPart.startsWith("UC") && idPart.length === 24) channelId = idPart;
    }
    else if (trimmed.includes("/c/") || trimmed.includes("/user/") || trimmed.includes("/@")) {
      // Custom URL or handle - not a standard channel ID
    }

    // Extract timestamp
    const timeMatch = trimmed.match(/[&?]t=([0-9hms]+)/);
    if (timeMatch) timestamp = timeMatch[1];
    else {
      const startMatch = trimmed.match(/[&?]start=([0-9]+)/);
      if (startMatch) timestamp = `${startMatch[1]}s`;
    }

    return { videoId, playlistId, channelId, isShorts, isEmbed, timestamp, detectedParams };
  }, [urlInput]);

  const convertedUrls = useMemo(() => {
    const { videoId, playlistId, channelId, isShorts, timestamp } = parsedMeta;
    
    const cleanVideoUrl = videoId 
      ? `https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ""}${timestamp ? `&t=${timestamp}` : ""}`
      : "";
    
    const results = {
      videoId: videoId || "None detected",
      playlistId: playlistId || "None detected",
      channelId: channelId || "None detected",
      shortsUrl: videoId ? `https://www.youtube.com/shorts/${videoId}` : "",
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}${timestamp ? `?start=${timestamp.replace('s', '')}` : ""}` : "",
      shareUrl: videoId ? `https://youtu.be/${videoId}${timestamp ? `?t=${timestamp}` : ""}` : "",
      canonicalUrl: cleanVideoUrl,
      playlistUrl: playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : "",
      channelUrl: channelId ? `https://www.youtube.com/channel/${channelId}` : "",
    };

    return results;
  }, [parsedMeta]);

  // Generate QR code for canonical URL
  useEffect(() => {
    const targetLink = convertedUrls.canonicalUrl || convertedUrls.playlistUrl || convertedUrls.channelUrl || urlInput;
    if (!targetLink) {
      setQrCodeDataUrl("");
      return;
    }

    QRCode.toDataURL(
      targetLink,
      {
        width: 240,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      },
      (err, url) => {
        if (err) {
          console.error("QR Code rendering failed", err);
          return;
        }
        setQrCodeDataUrl(url);
      }
    );
  }, [convertedUrls, urlInput]);

  const handleCopyLink = (text: string, label: string) => {
    if (!text || text === "None detected") {
      onAddToast("Nothing to copy for this item.", "warning");
      return;
    }
    onCopy(text);
  };

  const handleReset = () => {
    setUrlInput("");
    setShowParamDetails(false);
    onAddToast("URL inputs cleared.", "info");
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = "youtube_share_qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Share QR Code saved successfully!", "success");
  };

  const trackingParams = parsedMeta.detectedParams.filter(p => p.type === "tracking");
  const functionalParams = parsedMeta.detectedParams.filter(p => p.type === "functional");
  const unknownParams = parsedMeta.detectedParams.filter(p => p.type === "unknown");

  const hasVideoId = convertedUrls.videoId !== "None detected";

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: URL Input & Converted URLs */}
      <div className="lg:col-span-7 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="input-heading">
          <h3 id="input-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            Paste YouTube Link
          </h3>

          <div className="space-y-2">
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              rows={3}
              className="w-full text-xs md:text-sm font-mono p-4 rounded-xl border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary leading-relaxed resize-none"
              placeholder="Paste any YouTube URL — watch, youtu.be, shorts, embed, playlist, channel..."
            />
            <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono text-text-disabled">
              <span>Supports watch URLs, playlists, shorts, embed, channels, & bare IDs</span>
              <button
                onClick={handleReset}
                className="text-red-500 hover:underline flex items-center gap-0.5 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Analysis Section - Detected Parameters */}
        {parsedMeta.detectedParams.length > 0 && (
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="analysis-heading">
            <div className="flex items-center justify-between">
              <h3 id="analysis-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
                URL Analysis
              </h3>
              <button
                onClick={() => setShowParamDetails(!showParamDetails)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer"
              >
                {showParamDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showParamDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showParamDetails && (
              <div className="space-y-3">
                {trackingParams.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-status-error uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Tracking Parameters Removed ({trackingParams.length})
                    </h4>
                    <div className="space-y-1.5">
                      {trackingParams.map((param, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-status-error/5 border border-status-error/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-status-error bg-status-error/10 px-2 py-0.5 rounded">{param.key}</code>
                              <span className="text-xs font-mono text-text-sub">=</span>
                              <code className="text-xs font-mono text-text-main bg-surface-muted px-2 py-0.5 rounded">{param.value}</code>
                            </div>
                            <span className="text-[10px] text-status-error font-bold">REMOVED</span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {functionalParams.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> Functional Parameters Preserved ({functionalParams.length})
                    </h4>
                    <div className="space-y-1.5">
                      {functionalParams.map((param, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">{param.key}</code>
                              <span className="text-xs font-mono text-text-sub">=</span>
                              <code className="text-xs font-mono text-text-main bg-surface-muted px-2 py-0.5 rounded">{param.value}</code>
                            </div>
                            <span className="text-[10px] text-brand-primary font-bold">KEPT</span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unknownParams.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Other Parameters ({unknownParams.length})
                    </h4>
                    <div className="space-y-1.5">
                      {unknownParams.map((param, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-surface-muted/30 border border-border-light">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-text-muted bg-surface-base px-2 py-0.5 rounded">{param.key}</code>
                              <span className="text-xs font-mono text-text-sub">=</span>
                              <code className="text-xs font-mono text-text-main bg-surface-muted px-2 py-0.5 rounded">{param.value}</code>
                            </div>
                            <span className="text-[10px] text-text-muted font-bold">PASSED THROUGH</span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!showParamDetails && (
              <div className="p-3 rounded-lg bg-surface-muted/30 border border-border-light text-center">
                <p className="text-xs text-text-muted">
                  {trackingParams.length > 0 
                    ? `${trackingParams.length} tracking parameter${trackingParams.length === 1 ? "" : "s"} detected and removed. Click "Show Details" to see what was stripped.`
                    : "No tracking parameters detected."
                  }
                </p>
              </div>
            )}
          </section>
        )}

        {/* Clean URL Output - Primary Result */}
        {hasVideoId && (
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="output-heading">
            <h3 id="output-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              Clean URL (Primary Result)
            </h3>
            
            <div className="p-4 rounded-xl border border-border-light bg-surface-muted/30">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[10px] font-mono font-bold text-text-disabled uppercase tracking-wider">Canonical Watch Link</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyLink(convertedUrls.canonicalUrl, "Canonical Watch Link")}
                    className="p-1.5 rounded-lg border border-border-light/60 bg-surface-base hover:bg-brand-primary hover:text-white hover:border-brand-primary text-text-sub transition-all cursor-pointer"
                    title="Copy Clean URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={convertedUrls.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border-light/60 bg-surface-base text-text-sub hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer"
                    title="Open Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <p className="text-xs font-mono font-semibold break-all text-text-main bg-background px-3 py-2 rounded-lg border border-border-light">
                {convertedUrls.canonicalUrl}
              </p>
              <p className="text-[11px] text-text-muted">
                This is the clean, privacy-friendly URL. Tracking parameters removed; functional parameters (playlist, timestamp) preserved.
              </p>
            </div>
          </section>
        )}

        {/* All Converted URL Formats */}
        {hasVideoId && (
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="all-formats-heading">
            <h3 id="all-formats-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              All URL Formats
            </h3>

            <div className="space-y-3">
              {[
                { label: "Video ID", val: convertedUrls.videoId, isId: true, icon: <Youtube className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Playlist ID", val: convertedUrls.playlistId, isId: true, icon: <Layers className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Channel ID", val: convertedUrls.channelId, isId: true, icon: <Youtube className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Compact Share Link (youtu.be)", val: convertedUrls.shareUrl, icon: <Share2 className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "YouTube Shorts Link", val: convertedUrls.shortsUrl, icon: <Play className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Iframe Embed Link", val: convertedUrls.embedUrl, icon: <LinkIcon className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Playlist Link", val: convertedUrls.playlistUrl, icon: <Layers className="w-3.5 h-3.5 text-brand-primary" /> },
                { label: "Channel Link", val: convertedUrls.channelUrl, icon: <Youtube className="w-3.5 h-3.5 text-brand-primary" /> },
              ].map((item, idx) => {
                const isValid = item.val && item.val !== "None detected";
                return (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border ${isValid ? "border-border-light bg-surface-muted/30" : "border-border-light/50 bg-surface-muted/20"}`}>
                    <div className="space-y-0.5 flex items-center gap-2">
                      {item.icon}
                      <span className="text-[10px] font-mono font-bold text-text-disabled uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className={`text-xs font-mono font-semibold break-all ${isValid ? "text-text-main" : "text-text-disabled italic"}`}>
                      {item.val || "Unavailable"}
                    </p>

                    {isValid && (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleCopyLink(item.val, item.label)}
                          className="p-1.5 rounded-lg border border-border-light/60 bg-surface-base hover:bg-brand-primary hover:text-white hover:border-brand-primary text-text-sub transition-all cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {!item.isId && (
                          <a
                            href={item.val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-border-light/60 bg-surface-base text-text-sub hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!hasVideoId && urlInput && (
          <div className="bg-status-error/5 border border-status-error/20 p-4 rounded-xl text-center">
            <p className="text-xs text-status-error">Could not extract a valid video ID from this URL.</p>
          </div>
        )}
      </div>

      {/* Right: QR Code Generator */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm text-center space-y-5" aria-labelledby="qr-heading">
          <div className="space-y-1">
            <h3 id="qr-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center justify-center gap-1.5">
              <QrCode className="w-4.5 h-4.5 text-brand-primary" />
              Share QR Code
            </h3>
            <p className="text-xs text-text-muted">Encodes the clean canonical URL. Scan to share without tracking.</p>
          </div>

          <div className="p-4 bg-white rounded-xl inline-block border border-border-light/60 shadow-inner">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="YouTube Share QR Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-surface-muted border border-dashed border-border-light text-text-disabled text-xs font-mono">
                Waiting for input...
              </div>
            )}
          </div>

          {qrCodeDataUrl && (
            <button
              onClick={handleDownloadQr}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-2.5 px-4 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Download Shareable QR Code
            </button>
          )}
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="schemas-heading">
          <h3 id="schemas-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-primary" />
            Supported URL Formats
          </h3>
          <ul className="text-xs text-text-sub space-y-2 font-mono leading-relaxed list-disc list-inside">
            <li>watch?v=11_CHAR_ID</li>
            <li>youtu.be/11_CHAR_ID</li>
            <li>youtube.com/shorts/11_CHAR_ID</li>
            <li>youtube.com/embed/11_CHAR_ID</li>
            <li>youtube.com/channel/UC... (24 chars)</li>
            <li>youtube.com/@handle</li>
            <li>list=PLAYLIST_ID</li>
            <li>t=TIMESTAMP / start=SECONDS</li>
          </ul>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="why-heading">
          <h3 id="why-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-primary" />
            Why Clean YouTube URLs?
          </h3>
          <ul className="text-xs text-text-sub space-y-2 leading-relaxed list-disc list-inside">
            <li><strong>Privacy:</strong> Tracking params (<code className="font-mono">si</code>, <code className="font-mono">feature</code>, UTM) leak where you shared from</li>
            <li><strong>Clarity:</strong> Clean URLs are shorter, readable, and professional in messages</li>
            <li><strong>Reliability:</strong> Functional params (playlist, timestamp) preserved so links still work correctly</li>
            <li><strong>SEO:</strong> Canonical URLs help search engines understand the true video page</li>
          </ul>
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Paste any YouTube URL — watch links, youtu.be short links, Shorts, embed URLs, playlist URLs, channel URLs, or bare 11-character IDs.</li>
      <li>The tool automatically parses and extracts the video ID, playlist ID, channel ID, and timestamp.</li>
      <li>All query parameters are analyzed: tracking parameters (si, feature, UTM) are flagged for removal; functional parameters (list, t, start) are preserved.</li>
      <li>The clean canonical URL is displayed prominently — copy it with one click.</li>
      <li>All converted URL formats are shown: share link, Shorts link, embed link, playlist link, channel link.</li>
      <li>A QR code is generated for the canonical URL — download it for offline sharing.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Video ID extraction from all common YouTube URL formats</li>
      <li>Playlist ID and Channel ID extraction when present</li>
      <li>Timestamp extraction (t=, start=)</li>
      <li>Tracking parameter detection and explanation (si, feature, UTM, etc.)</li>
      <li>Clean canonical watch URL with tracking removed, functional params preserved</li>
      <li>Compact youtu.be share link</li>
      <li>YouTube Shorts format URL</li>
      <li>Iframe embed URL with timestamp support</li>
      <li>Playlist and channel URLs when detected</li>
      <li>QR code for the canonical link (PNG download)</li>
      <li>One-click copy for each link type</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Only extracts IDs from URL strings — does not validate if the video actually exists or is accessible.</li>
      <li>QR code encodes the canonical URL; if the video is private/deleted, the QR code will still scan but lead to an error page.</li>
      <li>Some complex YouTube URL variants (live streams with special parameters, music.youtube.com links) may not be fully parsed.</li>
      <li>Custom channel URLs (/@handle, /c/name, /user/name) return the handle but not the underlying channel ID.</li>
      <li>No connection to YouTube API — all parsing is client-side string manipulation.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-url-toolkit"
      toolName="YouTube URL Cleaner & Toolkit"
      toolDescription="Strip tracking parameters from YouTube links, extract video/playlist/channel IDs, and generate clean shareable URLs with QR codes. All parsing done locally."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No URLs are sent to any server."
      trustNote="Parsing is client-side string manipulation. No validation of video existence or accessibility is performed."
    >
      {toolContent}
    </ToolPageLayout>
  );
};