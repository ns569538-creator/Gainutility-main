import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, PartyPopper, X } from "lucide-react";
import { Button } from "../components/Common";
import type { PostDownloadInfo } from "../hooks/usePostDownload";
import { BRAND_NAME } from "../site";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

/**
 * Lightweight post-download success panel. Shows only after a genuine
 * successful download. Compact, dismissible, never a survey:
 *   "Done! 🎉" · "Your file is ready." · optional "Share <BRAND>"
 * No ratings, no reviews, no forms.
 */

interface PostDownloadPanelProps {
  info: PostDownloadInfo;
  onClose: () => void;
  onDismiss: () => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const PostDownloadPanel: React.FC<PostDownloadPanelProps> = ({ info, onClose, onDismiss, onAddToast }) => {
  const locale = useLocale();
  const headlineId = useId();
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  const open = info !== null;

  // Focus the panel while open and restore focus to the trigger on close.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current =
        document.activeElement && "focus" in document.activeElement
          ? (document.activeElement as HTMLElement)
          : null;
      requestAnimationFrame(() => cardRef.current?.focus());
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current.focus?.();
    }
  }, [open]);

  // Escape dismisses (counts toward cooldown).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : BRAND_NAME;

  const canWebShare = typeof navigator !== "undefined" && !!navigator.share;
  const canClipboard =
    typeof navigator !== "undefined" && !!navigator.clipboard?.writeText;

  const handleShare = useCallback(async () => {
    const text = tf("shareTextFallback", locale, { brand: BRAND_NAME });
    try {
      if (canWebShare) {
        await navigator.share({ title: BRAND_NAME, text, url: shareUrl });
        return;
      }
    } catch {
      // User cancelled the native share sheet — fall through quietly.
      return;
    }
    // Web Share unavailable → simple copy-link fallback, only if supported.
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onAddToast?.(tf("pdLinkCopied", locale, { brand: BRAND_NAME }), "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onAddToast?.(t("pdShareFailed", locale), "warning");
    }
  }, [canWebShare, shareUrl, onAddToast, locale]);

  const showShare = canWebShare || canClipboard;

  const initial = prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={info.id}
          initial={initial}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={initial}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 28, mass: 0.9 }
          }
          className="pointer-events-none fixed inset-x-0 bottom-[calc(0.6rem+env(safe-area-inset-bottom))] z-[80] flex justify-center px-3 sm:bottom-5 sm:px-0"
        >
          <div
            ref={cardRef}
            role="status"
            aria-live="polite"
            aria-labelledby={headlineId}
            tabIndex={-1}
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border-medium bg-surface-elevated p-4 text-text-main shadow-premium-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-primary/12 text-brand-primary motion-reduce:animate-none">
                <PartyPopper className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id={headlineId} className="text-[15px] font-bold leading-snug text-text-main">
                  {t("pdDone", locale)}
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-text-sub">
                  {t("pdFileReady", locale)}
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  {tf("pdThanks", locale, { brand: BRAND_NAME })}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {showShare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      leftIcon={
                        copied ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )
                      }
                      className="h-9 rounded-xl"
                    >
                      {copied ? t("linkCopied", locale) : t("share", locale)}
                    </Button>
                  )}
                  <Button size="sm" onClick={onClose} className="h-9 rounded-xl">
                    {t("done", locale)}
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                aria-label={t("dismiss", locale)}
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-disabled transition-colors hover:bg-surface-muted hover:text-text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
