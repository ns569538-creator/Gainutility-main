/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool state persistence for browser Back/Forward navigation.
 * Uses sessionStorage so state survives page reloads within the session
 * but doesn't persist across browser sessions.
 */

import React from "react";

export interface ToolStateSnapshot {
  toolId: string;
  state: unknown;
  timestamp: number;
  url: string;
}

const STORAGE_KEY = "gainutility:tool-states";
const MAX_ENTRIES = 50;
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

function readStore(): ToolStateSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ToolStateSnapshot[];
    const now = Date.now();
    return parsed.filter((entry) => now - entry.timestamp < MAX_AGE_MS);
  } catch {
    return [];
  }
}

function writeStore(entries: ToolStateSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

/**
 * Save the current state for a tool. Call before navigating away from the tool.
 */
export function saveToolState(toolId: string, state: unknown, url: string): void {
  if (typeof window === "undefined") return;
  const entries = readStore();
  const filtered = entries.filter((e) => e.toolId !== toolId || e.url !== url);
  filtered.push({ toolId, state, timestamp: Date.now(), url });
  writeStore(filtered);
}

/**
 * Retrieve the saved state for a tool at a specific URL.
 * Returns null if no state found or state is stale.
 */
export function getToolState(toolId: string, url: string): unknown | null {
  if (typeof window === "undefined") return null;
  const entries = readStore();
  const entry = entries.find((e) => e.toolId === toolId && e.url === url);
  return entry?.state ?? null;
}

/**
 * Clear saved state for a tool (e.g., when user explicitly resets).
 */
export function clearToolState(toolId: string, url?: string): void {
  if (typeof window === "undefined") return;
  const entries = readStore();
  const filtered = url
    ? entries.filter((e) => !(e.toolId === toolId && e.url === url))
    : entries.filter((e) => e.toolId !== toolId);
  writeStore(filtered);
}

/**
 * Serialize tool state for URL sharing (compact, shareable).
 * Returns a base64url-encoded string suitable for URL fragments.
 */
export function serializeForUrl(state: unknown): string {
  try {
    const json = JSON.stringify(state);
    // Simple base64url encoding
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

/**
 * Deserialize tool state from URL fragment.
 */
export function deserializeFromUrl<T>(encoded: string): T | null {
  try {
    // Restore base64 padding
    const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Hook for tools to automatically persist their state.
 * Call this in the tool component with the current state object.
 */
export function useToolStatePersistence(
  toolId: string,
  state: unknown,
  options?: {
    /** Custom URL key (defaults to current pathname) */
    urlKey?: string;
    /** Debounce ms (default 300) */
    debounceMs?: number;
    /** Called when state is restored */
    onRestore?: (restored: unknown) => void;
  }
): void {
  const { urlKey = typeof window !== "undefined" ? window.location.pathname + window.location.search : "", debounceMs = 300, onRestore } = options ?? {};

  // Save state on change (debounced)
  const timeoutRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      saveToolState(toolId, state, urlKey);
    }, debounceMs);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [toolId, state, urlKey, debounceMs]);

  // Restore on mount
  React.useEffect(() => {
    const saved = getToolState(toolId, urlKey);
    if (saved !== null && onRestore) {
      onRestore(saved);
    }
  }, [toolId, urlKey, onRestore]);
}

/**
 * Hook for tools to register their state serializer and handle restoration.
 * Call this in the tool component.
 * 
 * @param toolId - The tool's ID (e.g., "box-shadow-generator")
 * @param getState - Function that returns the current serializable state
 * @param setState - Function to restore state (called on Back navigation)
 */
export function useToolStateRestoration(
  toolId: string,
  getState: () => unknown,
  setState: (state: unknown) => void
): void {
  // Register serializer with App
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // We'll use a global registry on window for cross-component communication
    const registry = (window as any).__gainutility_tool_serializers__ ??= new Map();
    registry.set(toolId, getState);
    
    // Listen for restore events
    const handleRestore = (event: CustomEvent) => {
      const { toolId: targetId, url } = event.detail;
      if (targetId === toolId) {
        const saved = getToolState(toolId, url);
        if (saved !== null) {
          setState(saved);
        }
      }
    };
    
    window.addEventListener("gainutility:restore-tool-state", handleRestore as EventListener);
    
    return () => {
      registry.delete(toolId);
      window.removeEventListener("gainutility:restore-tool-state", handleRestore as EventListener);
    };
  }, [toolId, getState, setState]);
  
  // Also restore on initial mount (for deep links / refresh)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.pathname + window.location.search;
    const saved = getToolState(toolId, url);
    if (saved !== null) {
      setState(saved);
    }
  }, [toolId, setState]);
}