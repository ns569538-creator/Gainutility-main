import type { Tool } from "./types";
import tools from "./generated/tools.json";

const CATEGORIES = [
  "PDF",
  "Images",
  "Developer",
  "SEO",
  "Helpers",
  "Text",
  "Optimize",
  "Convert",
];

const ROOT_URL = "https://gainutility.com";

export type { Tool } from "./types";

export const ALL_TOOLS = (tools as Tool[]).filter((t) => t.category);

export const QUICK_TOOLS = (() => {
  const prioritized = ["jpg-to-pdf", "compress-images-inside-pdf", "merge-pdf", "image-resizer", "pdf-to-jpg", "png-jpg-converter"];
  const ids = new Set(prioritized);
  const matches = ALL_TOOLS.filter((t) => ids.has(t.id));
  const rest = ALL_TOOLS.filter((t) => !ids.has(t.id)).slice(0, 4);
  return [...matches, ...rest];
})();

export const CATEGORY_LIST = CATEGORIES.filter((c) =>
  ALL_TOOLS.some((t) => t.category === c)
);

export function toolUrl(id: string): string {
  return `${ROOT_URL}/tools/${id}`;
}

/** Lightweight substring + token search over generated keywords/name. */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return ALL_TOOLS.filter((t) => {
    const haystack = `${t.name} ${t.keywords.join(" ")} ${t.category}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, 8);
}
