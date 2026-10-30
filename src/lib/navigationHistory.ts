/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ViewState } from "../types";

export interface NavigationSnapshot {
  entryId: string;
  pathname: string;
  search: string;
  scrollY: number;
  scrollX: number;
  timestamp: number;
  activeCategory?: string;
  popularCategory?: string;
  searchQuery?: string;
  activeTab?: string;
  clickedElementId?: string;
}

const STORAGE_PREFIX = "gainutility:scroll:";
const ENTRIES_INDEX_KEY = "gainutility:scroll_entries";
const MAX_STORED_ENTRIES = 50;

let currentEntryId = "";
let isRestoring = false;
let pendingRestoreCleanup: (() => void) | null = null;
let lastScrollUpdate = 0;
let scrollThrottleTimer: number | null = null;

/**
 * Generate a unique, deterministic ID for history entries.
 */
export const generateEntryId = (): string => {
  return `gu_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get or initialize the entry ID for the current history state.
 */
export const getCurrentEntryId = (): string => {
  if (currentEntryId) return currentEntryId;

  if (typeof window !== "undefined") {
    const stateId = (window.history.state as { guEntryId?: string } | null)?.guEntryId;
    if (stateId) {
      currentEntryId = stateId;
      return currentEntryId;
    }
    const newId = generateEntryId();
    currentEntryId = newId;
    try {
      window.history.replaceState(
        { ...window.history.state, guEntryId: newId },
        "",
        window.location.href
      );
    } catch {
      /* ignore */
    }
    return currentEntryId;
  }
  return "";
};

/**
 * Read a snapshot from sessionStorage for a given entry ID.
 */
export const getSnapshot = (entryId: string): NavigationSnapshot | null => {
  if (!entryId || typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${entryId}`);
    if (!raw) return null;
    return JSON.parse(raw) as NavigationSnapshot;
  } catch {
    return null;
  }
};

/**
 * Prune oldest sessionStorage entries to prevent memory / storage bloat.
 */
const pruneOldEntries = (newEntryId: string) => {
  if (typeof window === "undefined") return;
  try {
    const rawIndex = window.sessionStorage.getItem(ENTRIES_INDEX_KEY);
    let entries: string[] = rawIndex ? JSON.parse(rawIndex) : [];

    entries = entries.filter((id) => id !== newEntryId);
    entries.push(newEntryId);

    if (entries.length > MAX_STORED_ENTRIES) {
      const toRemove = entries.slice(0, entries.length - MAX_STORED_ENTRIES);
      entries = entries.slice(entries.length - MAX_STORED_ENTRIES);
      for (const id of toRemove) {
        window.sessionStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      }
    }

    window.sessionStorage.setItem(ENTRIES_INDEX_KEY, JSON.stringify(entries));
  } catch {
    /* ignore storage quota errors */
  }
};

/**
 * Save the navigation snapshot for the current history entry.
 */
export const saveCurrentNavigationState = (extra?: {
  activeCategory?: string;
  popularCategory?: string;
  searchQuery?: string;
  activeTab?: string;
  clickedElementId?: string;
}): void => {
  if (typeof window === "undefined") return;
  const entryId = getCurrentEntryId();
  if (!entryId) return;

  const pathname = window.location.pathname;
  const search = window.location.search;
  const currentY = Math.round(window.scrollY || window.pageYOffset || 0);
  const currentX = Math.round(window.scrollX || window.pageXOffset || 0);

  // Preserve previous extra data if not passed in this call
  const prev = getSnapshot(entryId);

  // CRITICAL: When isRestoring is active and current scroll is at 0 (e.g. component just mounted),
  // do NOT wipe out the stored scrollY / scrollX!
  const scrollY = (isRestoring && prev && prev.scrollY > 0 && currentY === 0) ? prev.scrollY : currentY;
  const scrollX = (isRestoring && prev && prev.scrollX > 0 && currentX === 0) ? prev.scrollX : currentX;

  const snapshot: NavigationSnapshot = {
    entryId,
    pathname,
    search,
    scrollY,
    scrollX,
    timestamp: Date.now(),
    activeCategory: extra?.activeCategory ?? prev?.activeCategory,
    popularCategory: extra?.popularCategory ?? prev?.popularCategory,
    searchQuery: extra?.searchQuery ?? prev?.searchQuery,
    activeTab: extra?.activeTab ?? prev?.activeTab,
    clickedElementId: extra?.clickedElementId ?? prev?.clickedElementId,
  };

  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${entryId}`,
      JSON.stringify(snapshot)
    );
    pruneOldEntries(entryId);
  } catch {
    /* ignore storage quota errors */
  }
};

/**
 * Strategic saving on scroll events — throttled to prevent performance hits on mobile.
 */
const handleThrottledScroll = () => {
  if (isRestoring) return; // Don't overwrite during active restoration
  const now = Date.now();
  if (now - lastScrollUpdate < 150) {
    if (scrollThrottleTimer === null) {
      scrollThrottleTimer = window.setTimeout(() => {
        scrollThrottleTimer = null;
        lastScrollUpdate = Date.now();
        saveCurrentNavigationState();
      }, 150);
    }
    return;
  }
  lastScrollUpdate = now;
  saveCurrentNavigationState();
};

/**
 * Prepare a new forward navigation (pushState).
 * Saves the current entry snapshot and generates a new entry ID for the next view.
 */
export const preparePushNavigation = (extra?: {
  clickedElementId?: string;
}): string => {
  saveCurrentNavigationState(extra);
  const nextId = generateEntryId();
  currentEntryId = nextId;
  return nextId;
};

/**
 * Check if the browser is currently restoring scroll.
 */
export const isScrollRestoring = (): boolean => isRestoring;

/**
 * Schedule precise, jump-free scroll restoration after content and layout settle.
 * Uses ResizeObserver and MutationObserver to detect DOM growth and element presence
 * without visible animation or jarring intermediate jumps.
 */
export const scheduleScrollRestoration = (
  targetY: number,
  targetX: number = 0,
  targetElementId?: string
): void => {
  if (typeof window === "undefined") return;

  // Clean up any ongoing restoration attempt
  if (pendingRestoreCleanup) {
    pendingRestoreCleanup();
    pendingRestoreCleanup = null;
  }

  // Small scroll threshold can be restored immediately
  if (targetY <= 10) {
    window.scrollTo({ top: 0, left: targetX, behavior: "instant" as ScrollBehavior });
    return;
  }

  isRestoring = true;
  let attempts = 0;
  const maxAttempts = 120; // 120 frames ≈ 2000ms
  let rafId: number | null = null;
  let timeoutId: number | null = null;
  let observer: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const cleanup = () => {
    isRestoring = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    pendingRestoreCleanup = null;
  };

  pendingRestoreCleanup = cleanup;

  const tryApply = (): boolean => {
    attempts++;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    // Check if target element exists in DOM
    const targetEl = targetElementId ? document.getElementById(targetElementId) : null;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const elAbsoluteY = Math.round(rect.top + currentScrollY);
      if (elAbsoluteY > 0 && maxScroll >= elAbsoluteY - clientHeight) {
        targetEl.scrollIntoView({ behavior: "instant", block: "center" });
        cleanup();
        return true;
      }
    }

    // The document layout is ready for targetY when the maximum possible scroll offset
    // can accommodate targetY (or target element is mounted and page is tall enough)
    const isHeightReady = maxScroll >= targetY - 15;

    if (isHeightReady || attempts >= maxAttempts) {
      const scrollPos = Math.min(targetY, maxScroll);
      window.scrollTo({
        top: scrollPos,
        left: targetX,
        behavior: "instant" as ScrollBehavior,
      });

      // Verify if we achieved the target position within tolerance
      const currentY = Math.round(window.scrollY || window.pageYOffset || 0);
      if (Math.abs(currentY - targetY) < 30 || attempts >= maxAttempts) {
        cleanup();
        return true;
      }
    }
    return false;
  };

  // Immediate attempt
  if (tryApply()) return;

  // Next-frame attempt loop
  const step = () => {
    if (tryApply()) return;
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);

  // Observer for DOM mutations (e.g. tool card rendering)
  try {
    observer = new MutationObserver(() => {
      tryApply();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch {
    /* ignore */
  }

  // Observer for document resize (e.g. images / layouts settling)
  if (typeof ResizeObserver !== "undefined") {
    try {
      resizeObserver = new ResizeObserver(() => {
        tryApply();
      });
      resizeObserver.observe(document.documentElement);
    } catch {
      /* ignore */
    }
  }

  // Fallback safety timeout (1200ms max)
  timeoutId = window.setTimeout(() => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: Math.min(targetY, maxScroll),
      left: targetX,
      behavior: "instant" as ScrollBehavior,
    });
    cleanup();
  }, 1200);
};

/**
 * Initialize site-wide history tracking and manual scroll restoration.
 */
export const initNavigationHistory = (): (() => void) => {
  if (typeof window === "undefined") return () => {};

  // 1. Enable manual scroll restoration to prevent native browser jumping
  if ("scrollRestoration" in window.history) {
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
  }

  // 2. Establish current entry ID
  getCurrentEntryId();

  // 3. Attach throttled scroll listener
  window.addEventListener("scroll", handleThrottledScroll, { passive: true });

  // 4. Attach lifecycle listeners to save state before leaving/unloading
  const handleSaveState = () => saveCurrentNavigationState();
  window.addEventListener("beforeunload", handleSaveState);
  window.addEventListener("pagehide", handleSaveState);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveCurrentNavigationState();
    }
  });

  return () => {
    window.removeEventListener("scroll", handleThrottledScroll);
    window.removeEventListener("beforeunload", handleSaveState);
    window.removeEventListener("pagehide", handleSaveState);
    if (pendingRestoreCleanup) {
      pendingRestoreCleanup();
    }
  };
};

/**
 * Update the entry ID tracking when popstate event fires.
 */
export const handlePopStateEntry = (state: { guEntryId?: string } | null): {
  entryId: string;
  snapshot: NavigationSnapshot | null;
} => {
  let entryId = state?.guEntryId;
  if (!entryId) {
    entryId = getCurrentEntryId();
  } else {
    currentEntryId = entryId;
  }
  const snapshot = getSnapshot(entryId);
  return { entryId, snapshot };
};
