/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — shared "active color" state.
 * One color thread runs through the whole studio: pick → generate → scale →
 * harmony → contrast → visualize → export. Sections read and write it through
 * this context instead of each section keeping its own private selection.
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import { normalizeHex } from "./color";

const STORAGE_KEY = "gainutility:colorstudio:active";
const DEFAULT_COLOR = "#4F6F2F";

const loadInitial = (): string => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const normalized = saved ? normalizeHex(saved) : null;
    if (normalized) return normalized;
  } catch {
    /* noop */
  }
  return DEFAULT_COLOR;
};

export interface SetActiveColorOptions {
  announce?: boolean;
}

export interface ActiveColorContextValue {
  activeColor: string;
  setActiveColor: (hex: string, options?: SetActiveColorOptions) => void;
}

const ActiveColorContext = createContext<ActiveColorContextValue>({
  activeColor: DEFAULT_COLOR,
  setActiveColor: () => undefined,
});

export const useActiveColor = (): ActiveColorContextValue =>
  useContext(ActiveColorContext);

export const ActiveColorProvider: React.FC<{
  children: React.ReactNode;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}> = ({ children, onAddToast }) => {
  const [activeColor, setActive] = useState<string>(loadInitial);

  const setActiveColor = useCallback(
    (hex: string, options?: SetActiveColorOptions) => {
      const normalized = normalizeHex(hex);
      if (!normalized) return;
      setActive(normalized);
      try {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        /* storage unavailable */
      }
      if (options?.announce) {
        onAddToast?.(`Active color: ${normalized}`, "info");
      }
    },
    [onAddToast]
  );

  return (
    <ActiveColorContext.Provider value={{ activeColor, setActiveColor }}>
      {children}
    </ActiveColorContext.Provider>
  );
};