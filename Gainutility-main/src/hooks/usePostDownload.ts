import { useCallback, useState } from "react";
import { markToolCompleted } from "../toolCompletion";

/**
 * Lightweight post-download success experience ("Done! 🎉 / your file is ready").
 *
 * Triggered only after a genuine, successful download/export of a real output.
 * It is intentionally infrequent and anti-spam:
 *   - once per browser session (memory + sessionStorage guard),
 *   - then only after a cooldown in the same browser:
 *       24h base cooldown, extended to 7 days after two consecutive dismissals.
 *   - a short dedupe window prevents duplicate events for the same download.
 *
 * No ratings, no reviews, no forms. Everything is client-side.
 */

export interface PostDownloadInfo {
  /** Tool name shown in the "Thanks for using GAINUTILITY" line. */
  toolName: string;
  /** Unique id so a repeated show() for the same output doesn't re-trigger. */
  id: number;
}

interface StoredState {
  lastShownAt: number;
  shownCount: number;
  dismissedStreak: number;
}

const STORAGE_KEY = "gainutility:post-download";
const SESSION_KEY = "gainutility:post-download-session";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
/** Re-shows within this window trigger no duplicate panel. */
const DEDUPE_MS = 5000;

// SPA navigation guard: only one trigger per JS session, regardless of storage.
let memoryLock = false;
let lastShownAt = 0;

function readState(): StoredState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      lastShownAt: Number(parsed.lastShownAt) || 0,
      shownCount: Number(parsed.shownCount) || 0,
      dismissedStreak: Number(parsed.dismissedStreak) || 0,
    };
  } catch {
    return null;
  }
}

function writeState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — the feature stays silent; no failure to surface.
  }
}

function isSessionLocked(): boolean {
  try {
    return memoryLock || window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return memoryLock;
  }
}

function lockSession() {
  memoryLock = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // noop
  }
}

function shouldShow(): boolean {
  if (isSessionLocked()) return false;
  const state = readState();
  if (!state) return true; // first completed download in this browser
  const cooldownMs = state.dismissedStreak >= 2 ? WEEK_MS : DAY_MS;
  return Date.now() - state.lastShownAt >= cooldownMs;
}

function markShown() {
  const prev = readState() ?? { lastShownAt: 0, shownCount: 0, dismissedStreak: 0 };
  writeState({ lastShownAt: Date.now(), shownCount: prev.shownCount + 1, dismissedStreak: 0 });
  lockSession();
}

function markDismissed() {
  const prev = readState() ?? { lastShownAt: 0, shownCount: 0, dismissedStreak: 0 };
  writeState({ ...prev, dismissedStreak: prev.dismissedStreak + 1 });
}

export function usePostDownload() {
  const [info, setInfo] = useState<PostDownloadInfo | null>(null);

  /** Surface the success panel for a completed download. No-op if suppressed.
   *  `id` may be passed to tie the panel to one output so a duplicate event for
   *  the same output never re-triggers it. */
  const show = useCallback((toolName: string, id?: number) => {
    if (!shouldShow()) return;
    const now = Date.now();
    if (now - lastShownAt < DEDUPE_MS) return;
    lastShownAt = now;
    markShown();
    setInfo({ toolName, id: id ?? now });
    // A genuine, successful export almost always means the task is done. Mark
    // the current tool completed so the bottom-of-page rating may be revealed.
    const slug = typeof window !== "undefined"
      ? window.location.pathname.match(/\/tools\/([^/]+)/)?.[1]
      : undefined;
    if (slug) markToolCompleted(slug);
  }, []);

  const close = useCallback(() => setInfo(null), []);

  const dismiss = useCallback(() => {
    markDismissed();
    setInfo(null);
  }, []);

  return { info, show, close, dismiss };
}
