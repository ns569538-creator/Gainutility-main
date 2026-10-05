/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lightweight React context that exposes the currently active locale to any
 * component in the tree (homepage, tool shells, cards, search, etc.).
 *
 * This is NOT a competing translation system — it simply makes the active
 * `locale` available so components can look up strings via the existing
 * `t()` / `tf()` dictionaries in `./ui` and `localizedToolName` in `./slugs`.
 */

import React, { createContext, useContext } from "react";
import { DEFAULT_LOCALE } from "./locales";

const LocaleContext = createContext<string>(DEFAULT_LOCALE);

/** Provide the active locale to the subtree. */
export const LocaleProvider: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/** Read the active locale. Expects a LocaleProvider ancestor (defaults to en). */
export const useLocale = (): string => useContext(LocaleContext);
