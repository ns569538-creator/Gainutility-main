/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Real PWA installation plumbing for GainUtility.
 *
 * Captures the browser's `beforeinstallprompt` (Chromium) so the install
 * control can call the REAL native prompt from a user gesture. Falls back to
 * guidance-only for iOS Safari ("Add to Home Screen"), which is a real install
 * path but has no programmatic API. Standalone/installed mode is detected so
 * the control never shows on the already-installed app.
 *
 * Hydration note: every state starts "hidden" and only flips inside effects on
 * the client, so the server-rendered shell and the first client render always
 * match (no React hydration mismatch in the eagerly-rendered footer).
 */

import { useCallback, useEffect, useRef, useState } from "react";

const DISMISS_KEY = "gainutility-install-dismissed";
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/** 'installed' → running standalone; 'ready' → native prompt available; */
/** 'ios' → Add-to-Home-Screen guidance; 'hidden' → nothing to show. */
export type InstallState = "installed" | "ready" | "ios" | "hidden";

const isStandalone = (): boolean =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
};

let dismissedAt = 0;

const recentlyDismissed = (): boolean => {
  if (!dismissedAt) {
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    } catch {
      dismissedAt = 0;
    }
  }
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
};

const rememberDismissed = (): void => {
  dismissedAt = Date.now();
  try {
    localStorage.setItem(DISMISS_KEY, String(dismissedAt));
  } catch {
    /* ignore */
  }
};

export interface UseInstallableResult {
  state: InstallState;
  guideOpen: boolean;
  /** Call from a user gesture. Triggers the native prompt, or reveals iOS guidance. */
  requestInstall: () => void;
  closeGuide: () => void;
}

export const useInstallable = (): UseInstallableResult => {
  const [state, setState] = useState<InstallState>("hidden");
  const [guideOpen, setGuideOpen] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const stateRef = useRef<InstallState>("hidden");
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalone()) {
      setState("installed");
      return;
    }

    // Non-Chromium mobile Safari: real installs exist, just no programmatic
    // prompt — offer useful guidance instead.
    if (isIOS() && !recentlyDismissed()) {
      setState("ios");
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
      if (!recentlyDismissed()) {
        setState("ready");
      }
    };

    const onAppInstalled = () => {
      deferred.current = null;
      setState("installed");
      setGuideOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const requestInstall = useCallback(() => {
    const event = deferred.current;
    if (event) {
      event
        .prompt()
        .then(() => event.userChoice)
        .then((choice) => {
          deferred.current = null;
          if (choice.outcome === "accepted") {
            setState("installed");
          } else {
            // Dismissed the browser prompt — don't re-offer this session.
            rememberDismissed();
            setState("hidden");
          }
        })
        .catch(() => {
          rememberDismissed();
          setState("hidden");
        });
      return;
    }
    if (stateRef.current === "ios") {
      setGuideOpen(true);
    }
  }, []);

  const closeGuide = useCallback(() => setGuideOpen(false), []);

  return { state, guideOpen, requestInstall, closeGuide };
};