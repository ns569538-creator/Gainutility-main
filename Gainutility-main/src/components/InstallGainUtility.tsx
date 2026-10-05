/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * "Install GainUtility" — a subtle, real PWA install action for the footer.
 *
 * It only renders when the browser can genuinely install the site:
 *  - Chromium: triggers the native beforeinstallprompt flow.
 *  - iOS Safari: shows one line of "Add to Home Screen" guidance.
 * It hides entirely when the app is already installed (standalone) and does
 * not re-prompt users who have dismissed the install within a cooldown window.
 */

import React from "react";
import { Download } from "lucide-react";
import { useInstallable } from "../hooks/useInstallable";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";

export const InstallGainUtility: React.FC = () => {
  const locale = useLocale();
  const { state, guideOpen, requestInstall } = useInstallable();

  if (state === "installed" || state === "hidden") return null;

  return (
    <div className="border-t border-border-light/60 pt-4">
      <button
        type="button"
        onClick={requestInstall}
        aria-expanded={state === "ios" ? guideOpen : undefined}
        className="gu-tap inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer gu-focus rounded-sm"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        {t("installGu", locale)}
      </button>
      <p className="mt-1.5 text-[11px] sm:text-xs text-text-muted leading-relaxed">
        {t("installValue", locale)}
      </p>
      {state === "ios" && guideOpen && (
        <p className="mt-1.5 text-[11px] sm:text-xs text-text-muted leading-relaxed max-w-[30ch]">
          {t("installIosHint", locale)}
        </p>
      )}
    </div>
  );
};