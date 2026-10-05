/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * "Add to Chrome" call-to-action for the GainUtility browser extension.
 *
 * Renders a small dismissal-aware banner pointing to the Chrome Web Store
 * listing. It is intentionally dormant until the extension is actually
 * published: it renders nothing unless CHROME_EXTENSION_STORE_URL is set, so
 * it can never link to a dead placeholder URL in production.
 */

import React, { useEffect, useState } from "react";
import { Chrome } from "lucide-react";
import { CHROME_EXTENSION_STORE_URL } from "../site";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";

interface AddToChromeProps {
  /** Accent color class applied to the primary link (e.g. brand green). */
  accent?: string;
  /** i18n-ready labels. Defaults to English. */
  label?: string;
  sublabel?: string;
  dismissLabel?: string;
  className?: string;
}

const DISMISS_KEY = "add-to-chrome-dismissed-v1";

/** True while the browser is Chromium/Chrome (the store link targets it). */
function isChromium(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(ua);
}

export const AddToChrome: React.FC<AddToChromeProps> = ({
  label,
  sublabel,
  dismissLabel,
  className = "",
}) => {
  const locale = useLocale();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const resolvedLabel = label || t("extLabel", locale);
  const resolvedSublabel = sublabel || t("extSub", locale);
  const resolvedDismiss = dismissLabel || t("dismiss", locale);

  useEffect(() => {
    // Only show once the store URL is configured and we're actually on a
    // Chromium browser (no point advertising a Chrome store link to Safari).
    if (!CHROME_EXTENSION_STORE_URL || !isChromium()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* localStorage unavailable — still show */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="complementary"
      aria-label={resolvedLabel}
      className={`flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3 rounded-xl border border-brand-primary/15 bg-brand-primary/[0.04] dark:bg-brand-primary/[0.08] ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-9 h-9 shrink-0 rounded-lg bg-brand-primary text-white flex items-center justify-center">
          <Chrome className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main leading-snug">{resolvedLabel}</p>
          <p className="text-[13px] text-text-muted leading-snug mt-0.5">{resolvedSublabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={CHROME_EXTENSION_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gu-press inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-dark transition-colors cursor-pointer gu-focus"
        >
          <Chrome className="w-4 h-4" aria-hidden="true" /> {t("addToChrome", locale)}
        </a>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setVisible(false);
            try {
              localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
          aria-label={resolvedDismiss}
          className="min-h-[40px] px-3 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer gu-focus"
        >
          {resolvedDismiss}
        </button>
      </div>
    </div>
  );
};
