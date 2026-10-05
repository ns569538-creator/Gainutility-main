/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, 
  Sparkles, 
  Check, 
  Share2, 
  Download, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Send,
  MessageCircle,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface PostTaskSuccessProps {
  isOpen?: boolean;
  onClose: () => void;
  toolName: string;
  taskType?: string; // e.g. "carousel-ready", "pdf-compressed", "json-formatted", "qr-generated", "image-converted"
  resultDescription?: string; // e.g. "2 slides · Ready to publish"
  resultDetails?: string; // e.g. "photo.jpg · 420 KB" or "invoice.pdf · 1.8 MB → 420 KB"
  previewImage?: string; // direct image url / data url
  previewThumbnailList?: string[]; // array of thumbnail images (e.g. for multi-slide carousel)
  previewNode?: React.ReactNode; // custom preview node
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  shareTitle?: string;
  shareSubtitle?: string;
  customShareText?: string;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  className?: string;
}

// Natural, short, human celebration messages
const LITTLE_WIN_HEADLINES = [
  "You did it. 🎉",
  "Nice. You got it done. ✨",
  "One less thing on your list. 🎉",
  "Done. That feels good. ✨",
  "Ready to go. 🚀",
  "Small win. Keep going. ✨"
];

const LITTLE_WIN_SUBTEXTS = [
  "Nice work. One less thing on your list.",
  "That’s one more task cleared from your day.",
  "Quick, clean, and no account required.",
  "Take pride in the craft. Ready whenever you are."
];

export const PostTaskSuccess: React.FC<PostTaskSuccessProps> = ({
  isOpen = true,
  onClose,
  toolName,
  taskType,
  resultDescription,
  resultDetails,
  previewImage,
  previewThumbnailList,
  previewNode,
  primaryAction,
  secondaryActions = [],
  shareTitle,
  shareSubtitle,
  customShareText,
  onAddToast,
  className = ""
}) => {
  const [viewState, setViewState] = useState<"modal" | "share">("modal");
  const [shareCardDataUrl, setShareCardDataUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Consistent message pick per tool execution
  const headline = useMemo(() => {
    const hash = (toolName + (resultDescription || "")).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return LITTLE_WIN_HEADLINES[hash % LITTLE_WIN_HEADLINES.length];
  }, [toolName, resultDescription]);

  const subtext = useMemo(() => {
    const hash = (toolName + "sub").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return LITTLE_WIN_SUBTEXTS[hash % LITTLE_WIN_SUBTEXTS.length];
  }, [toolName]);

  const displayResult = resultDescription || resultDetails || "Task completed successfully";
  const resolvedShareTitle = shareTitle || "TODAY I GOT THIS DONE. ✨";
  const resolvedShareSubtitle = shareSubtitle || `${toolName} · ${displayResult}`;

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewState === "share") {
          setViewState("modal");
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, viewState, onClose]);

  // Generate 100% Client-Side Privacy Milestone Social Card (1200x630px)
  const generateShareCard = () => {
    setIsGeneratingCard(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark GainUtility Canvas Background (#121711)
      ctx.fillStyle = "#121711";
      ctx.fillRect(0, 0, 1200, 630);

      // Subtle atmospheric grid
      ctx.strokeStyle = "rgba(117, 171, 82, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 60; x < 1200; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 60; y < 630; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Inner Elevated Container (#1B231A)
      const cardX = 80;
      const cardY = 60;
      const cardW = 1040;
      const cardH = 510;
      const radius = 24;

      ctx.fillStyle = "#1B231A";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();

      ctx.strokeStyle = "rgba(117, 171, 82, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Tag: ✨ LITTLE WIN
      ctx.fillStyle = "rgba(117, 171, 82, 0.2)";
      ctx.beginPath();
      ctx.roundRect(cardX + 44, cardY + 44, 170, 36, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(117, 171, 82, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 15px monospace";
      ctx.fillStyle = "#8BCE62";
      ctx.fillText("✨ LITTLE WIN", cardX + 68, cardY + 68);

      // Main Accomplishment Header
      ctx.font = "900 48px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#F4F7F2";
      ctx.fillText(resolvedShareTitle, cardX + 44, cardY + 145);

      // Subtle Divider
      ctx.strokeStyle = "rgba(117, 171, 82, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cardX + 44, cardY + 180);
      ctx.lineTo(cardX + cardW - 44, cardY + 180);
      ctx.stroke();

      // Tool Name
      ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#D6EBBF";
      ctx.fillText(toolName, cardX + 44, cardY + 245);

      // Result details
      ctx.font = "500 24px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#A8BAA4";
      const cleanDesc = displayResult.length > 55 ? displayResult.substring(0, 52) + "..." : displayResult;
      ctx.fillText(cleanDesc, cardX + 44, cardY + 295);

      // Browser Privacy Statement
      ctx.font = "16px monospace";
      ctx.fillStyle = "#758872";
      ctx.fillText("🔒 Made in Your Browser • No Account Needed", cardX + 44, cardY + 385);

      // Footer: GainUtility Brand
      ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#CBD6C8";
      ctx.fillText("Made with GainUtility", cardX + 44, cardY + 455);

      ctx.font = "bold 15px monospace";
      ctx.fillStyle = "#75AB52";
      ctx.fillText("gainutility.com", cardX + cardW - 220, cardY + 455);

      const url = canvas.toDataURL("image/png");
      setShareCardDataUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleOpenShareView = () => {
    generateShareCard();
    setViewState("share");
  };

  const handleDownloadCard = () => {
    if (!shareCardDataUrl) return;
    const a = document.createElement("a");
    a.href = shareCardDataUrl;
    a.download = `gainutility-win-${toolName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onAddToast) onAddToast("Little Win card downloaded!", "success");
  };

  const handleCopyCardImage = async () => {
    if (!shareCardDataUrl) return;
    try {
      const res = await fetch(shareCardDataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        if (onAddToast) onAddToast("Card image copied to clipboard!", "success");
      } else {
        handleDownloadCard();
      }
    } catch (err) {
      console.error(err);
      handleDownloadCard();
    }
  };

  const handleCopyText = () => {
    const text = customShareText || `Today I solved a task with GainUtility: ${toolName} (${displayResult}). Clean, private, in-browser. ✨\nhttps://gainutility.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
      if (onAddToast) onAddToast("Share text copied to clipboard!", "success");
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Little Win: ${toolName}`,
          text: customShareText || `Just solved a task with GainUtility: ${toolName} (${displayResult})!`,
          url: window.location.href
        });
      } catch {
        // user closed native sheet
      }
    } else {
      handleCopyText();
    }
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(`Small win today: finished ${displayResult} using ${toolName} on GainUtility! #productivity #buildinpublic`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Just finished ${displayResult} using ${toolName} on GainUtility! ✨\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  // Respect user preference to hide task completion modal
  const hideModal = typeof window !== "undefined" && localStorage.getItem("gainutility-hide-task-modal") === "1";
  if (!isOpen || hideModal) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        id="little-win-modal-root"
      >
        {/* Subtle Dark/Blur Backdrop (rgba(0,0,0,0.55), blur(6px)) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-all cursor-pointer"
          aria-hidden="true"
        />

        {/* Centered Little Win Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className={`relative z-10 w-full max-w-[540px] sm:max-w-[560px] max-h-[90vh] bg-surface-elevated border border-border-medium/80 dark:border-border-medium rounded-3xl p-6 sm:p-8 shadow-premium-lg shadow-[0_0_50px_-10px_rgba(117,171,82,0.18)] dark:shadow-[0_0_50px_-10px_rgba(117,171,82,0.14)] overflow-y-auto flex flex-col text-text-main select-none ${className}`}
        >
          {/* Top-Right Close Button (X) */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {viewState === "modal" ? (
            /* ================================================================= */
            /* 1. MAIN "LITTLE WIN" MODAL CONTENT                                */
            /* ================================================================= */
            <div className="space-y-5 text-center flex flex-col items-center">
              
              {/* ✨ LITTLE WIN Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-light border border-brand-primary/30 text-brand-primary text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>LITTLE WIN</span>
              </div>

              {/* Encouraging Headline */}
              <div className="space-y-1">
                <h2 className="font-sans font-black text-2xl sm:text-3xl text-text-main tracking-tight">
                  {headline}
                </h2>
                <div className="pt-1">
                  <h3 className="font-sans font-bold text-lg sm:text-xl text-text-main">
                    {toolName}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-brand-primary mt-0.5">
                    {displayResult}
                  </p>
                </div>
              </div>

              {/* ACTUAL RESULT PREVIEW CONTAINER */}
              <div className="w-full max-w-[420px] mx-auto rounded-2xl bg-surface-muted/80 border border-border-light p-3 sm:p-4 shadow-inner flex flex-col items-center justify-center min-h-[120px] max-h-[220px] overflow-hidden relative">
                {previewNode ? (
                  previewNode
                ) : previewThumbnailList && previewThumbnailList.length > 0 ? (
                  // Multi-thumbnail Strip (e.g. Carousel Slides)
                  <div className="w-full flex items-center justify-center gap-2 overflow-x-auto py-1">
                    {previewThumbnailList.slice(0, 4).map((src, idx) => (
                      <div 
                        key={idx} 
                        className="w-16 h-20 rounded-xl overflow-hidden border border-border-medium bg-black/20 shrink-0 shadow-sm relative group"
                      >
                        <img 
                          src={src} 
                          alt={`Slide ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono font-bold text-white">
                          0{idx + 1}
                        </span>
                      </div>
                    ))}
                    {previewThumbnailList.length > 4 && (
                      <div className="w-14 h-20 rounded-xl border border-dashed border-border-medium flex flex-col items-center justify-center text-text-muted text-xs font-mono font-bold shrink-0 bg-surface-base/50">
                        <span>+{previewThumbnailList.length - 4}</span>
                        <span className="text-[9px] font-sans">more</span>
                      </div>
                    )}
                  </div>
                ) : previewImage ? (
                  // Single Image Preview
                  <div className="max-h-[160px] rounded-xl overflow-hidden border border-border-medium shadow-sm">
                    <img 
                      src={previewImage} 
                      alt="Result Preview" 
                      className="max-h-[160px] w-auto object-contain rounded-xl" 
                    />
                  </div>
                ) : (
                  // Standard Tool Metric Icon Accomplishment
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-sm">
                      <FileCheck className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-mono font-medium text-text-sub">
                      {displayResult}
                    </span>
                  </div>
                )}
              </div>

              {/* Warm Human Subtext */}
              <p className="text-xs sm:text-sm text-text-sub max-w-sm leading-relaxed">
                {subtext}
              </p>

              {/* Browser Privacy Notice */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-text-muted bg-surface-muted/50 px-3 py-1.5 rounded-xl border border-border-light/60">
                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>No account needed • nothing stored by us</span>
              </div>

              {/* Don't show again toggle */}
              <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem("gainutility-hide-task-modal", "1");
                    } else {
                      localStorage.removeItem("gainutility-hide-task-modal");
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-border-medium accent-brand-primary cursor-pointer"
                />
                <span>Don't show this after tasks</span>
              </label>

              {/* Action Buttons: [ Share your win ] [ Done ] */}
              <div className="w-full pt-3 border-t border-border-light/60 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleOpenShareView}
                  className="w-full sm:flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-main border border-border-medium hover:border-brand-primary text-xs sm:text-sm font-sans font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span>Share your win</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:flex-1 min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs sm:text-sm font-sans font-bold shadow-premium-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Done</span>
                </button>
              </div>

              {/* Optional Secondary Action (e.g. Download Again) */}
              {primaryAction && (
                <div className="pt-1">
                  <button
                    onClick={primaryAction.onClick}
                    className="text-xs font-sans font-medium text-text-muted hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    {primaryAction.icon || <Download className="w-3.5 h-3.5" />}
                    <span>{primaryAction.label}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================================================================= */
            /* 2. "SHARE YOUR WIN" SOCIAL CARD GENERATOR VIEW                    */
            /* ================================================================= */
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setViewState("modal")}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
                  title="Back to Little Win"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-text-main">
                    Share your accomplishment
                  </h3>
                  <p className="text-xs text-text-muted">
                    Take pride in finishing. Zero source files are shared.
                  </p>
                </div>
              </div>

              {/* Generated Privacy Milestone Card Preview */}
              {shareCardDataUrl && (
                <div className="rounded-2xl overflow-hidden border border-border-medium shadow-md bg-black/40 relative">
                  <img
                    src={shareCardDataUrl}
                    alt="Little Win Milestone Card"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Primary Card Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCopyCardImage}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-main border border-border-light text-xs font-sans font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-brand-primary" />
                      <span className="text-brand-primary font-bold">Image Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-brand-primary" />
                      <span>Copy Card Image</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadCard}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-main border border-border-light text-xs font-sans font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-brand-primary" />
                  <span>Download PNG</span>
                </button>
              </div>

              {/* Share To Channels Grid */}
              <div className="pt-2 border-t border-border-light/60 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                  Quick Share
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleShareLinkedIn}
                    className="min-h-[44px] p-2 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-main border border-border-light text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-brand-primary" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="min-h-[44px] p-2 rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-text-main border border-border-light text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-brand-primary" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="min-h-[44px] p-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share...</span>
                  </button>
                </div>
              </div>

              {/* Footer Back/Done */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleCopyText}
                  className="text-xs font-sans font-medium text-text-muted hover:text-text-main flex items-center gap-1 cursor-pointer py-1"
                >
                  {copiedText ? (
                    <span className="text-brand-primary font-bold">✓ Text Copied</span>
                  ) : (
                    <span>Copy Text Only</span>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-sans font-bold hover:bg-brand-primary-dark cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
