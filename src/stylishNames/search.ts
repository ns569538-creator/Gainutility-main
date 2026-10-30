/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Search across the curated name/symbol library (used by the generator's
 * quick-insert library and the /names + /symbols hubs).
 */

import { NAME_LISTS, NAME_LIST_BY_ID } from "./names";
import { SYMBOL_COLLECTIONS, SYMBOL_COLLECTION_BY_ID } from "./symbols";
import { STYLES, STYLE_BY_ID } from "./styles";

export type SearchKind = "name" | "symbol" | "style";

export interface SearchHit {
  kind: SearchKind;
  /** Display value (the name / symbol / style name). */
  value: string;
  /** Owning list or style id. */
  ownerId: string;
  /** Owning list or style display name. */
  ownerName: string;
}

const match = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query);

/** Search names, symbols and styles for a query (min 1 char). */
export const searchLibrary = (query: string, limit = 40): SearchHit[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];

  for (const list of NAME_LISTS) {
    for (const item of list.items) {
      if (match(item, q)) {
        hits.push({ kind: "name", value: item, ownerId: list.id, ownerName: list.name });
        if (hits.length >= limit) return hits;
      }
    }
  }
  for (const coll of SYMBOL_COLLECTIONS) {
    for (const item of coll.items) {
      if (match(item, q)) {
        hits.push({ kind: "symbol", value: item, ownerId: coll.id, ownerName: coll.name });
        if (hits.length >= limit) return hits;
      }
    }
  }
  for (const style of STYLES) {
    if (match(style.name, q) || match(style.id, q)) {
      hits.push({ kind: "style", value: style.name, ownerId: style.id, ownerName: style.group });
      if (hits.length >= limit) return hits;
    }
  }
  return hits;
};

export { NAME_LIST_BY_ID, SYMBOL_COLLECTION_BY_ID, STYLE_BY_ID };
