/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The /tools directory page — category buckets derived from the registry.
 *
 * toolsRegistry.tsx is the single source of truth for every tool's identity.
 * This module groups registry categories into the top-level sections shown on
 * /tools. It never restates tool names, descriptions, icons or routes. Tool
 * counts and lists are derived live from the registry, so the page cannot
 * drift. Every one of the registry categories belongs to exactly one
 * section, so every indexable tool appears once on the directory page
 * (redirect-only consolidated ids are omitted — see EXCLUDED_TOOL_IDS).
 */

import type { ToolId } from "./types";
import { toolsRegistry } from "./toolsRegistry";
import { EXCLUDED_TOOL_IDS } from "../scripts/sitemap-excludes.mjs";

export interface ToolsDirectorySection {
  /** Anchor id used for in-page jump links (#<id>-tools). */
  id: string;
  label: string;
  blurb: string;
  /** SEO hub route (English) when this section has one, e.g. "/pdf". */
  hubPath?: string;
  /** Registry `category` values that belong in this section. */
  categories: string[];
}

export const TOOLS_DIRECTORY_SECTIONS: ToolsDirectorySection[] = [
  {
    id: "pdf",
    label: "PDF Tools",
    blurb:
      "Merge, split, compress, convert, organize, repair and secure PDF documents — every job is processed in your browser.",
    hubPath: "/pdf",
    categories: ["Organize PDF", "Convert PDF", "Optimize", "Advanced", "Document Security", "PDF Studio"],
  },
  {
    id: "json",
    label: "JSON Tools",
    blurb:
      "Format, validate, minify, compare and transform JSON, and move data between JSON, CSV, XML and YAML.",
    hubPath: "/json",
    categories: ["JSON Utilities"],
  },
  {
    id: "image",
    label: "Image Tools",
    blurb:
      "Compress, resize, convert, crop, watermark and edit images locally, plus passport and exam-photo helpers.",
    hubPath: "/image",
    categories: ["Image Studio", "Exam & Application"],
  },
  {
    id: "developer",
    label: "Developer Tools",
    blurb:
      "Regex, SQL, YAML, hashes, JWTs, timestamps, cron expressions and everyday coding utilities.",
    hubPath: "/dev",
    categories: ["Developer Studio", "Developer Utilities"],
  },
  {
    id: "seo",
    label: "SEO Tools",
    blurb:
      "Meta tags, schema markup, sitemaps, robots.txt, UTM links, canonicals, hreflang, SERP previews, and full-site health checks.",
    hubPath: "/seo",
    categories: ["SEO Utilities"],
  },
  {
    id: "website-studio",
    label: "Website Studio",
    blurb:
      "Scan any public URL for SEO, technical, accessibility, performance and security findings — then gate your launch with a checklist.",
    hubPath: "/seo",
    categories: ["Website Studio"],
  },
  {
    id: "design",
    label: "CSS & Design Tools",
    blurb:
      "Gradients, shadows, border radius, contrast checking, palettes and typography helpers for designers.",
    hubPath: "/css",
    categories: ["Design Utilities"],
  },
  {
    id: "media",
    label: "Media Tools",
    blurb:
      "Extract audio, compress, resize, trim, convert and turn video and audio clips into the formats you need.",
    hubPath: "/media",
    categories: ["Media Studio"],
  },
  {
    id: "creator",
    label: "Creator Tools",
    blurb:
      "Signatures, watermarks, collages, carousels, favicons and social-content tools for creators.",
    categories: ["Creator Studio"],
  },
  {
    id: "exam-application",
    label: "Exam Application Tools",
    blurb:
      "Check requirements and prepare your photo, signature, thumb impression and other application files.",
    categories: ["Exam & Application"],
  },
];

const sectionToolCache = new Map<string, ToolId[]>();

/** Tools belonging to a section, in registry order. Consolidated/redirecting
    tool ids (aliases + classic JSON tools) are omitted — their URLs 301, so
    the crawlable directory must only list canonical, indexable destinations. */
export const toolsInSection = (section: ToolsDirectorySection): ToolId[] => {
  let list = sectionToolCache.get(section.id);
  if (!list) {
    const set = new Set(section.categories);
    list = (Object.keys(toolsRegistry) as ToolId[]).filter((id) => {
      const meta = toolsRegistry[id];
      return meta ? set.has(meta.category) && !EXCLUDED_TOOL_IDS.has(id) : false;
    });
    sectionToolCache.set(section.id, list);
  }
  return list;
};

/** Total number of indexable tools listed on the platform (registry minus the
    consolidated redirect-only ids). */
export const TOTAL_TOOL_COUNT = Object.keys(toolsRegistry).filter(
  (id) => !EXCLUDED_TOOL_IDS.has(id)
).length;

/**
 * Other tools in the same registry category as `toolId`, in registry order.
 * Used for the "More tools in this category" section on tool pages. When no
 * sibling exists, chooses the parent section's sibling list instead so the
 * section never renders empty on a small category.
 */
export const siblingTools = (
  toolId: ToolId,
  limit = 6
): ToolId[] => {
  const current = toolsRegistry[toolId];
  if (!current) return [];
  const all = (Object.keys(toolsRegistry) as ToolId[]).filter(
    (id) =>
      id !== toolId &&
      !EXCLUDED_TOOL_IDS.has(id) &&
      toolsRegistry[id]?.category === current.category
  );
  if (all.length > 0) return all.slice(0, limit);
  const section = TOOLS_DIRECTORY_SECTIONS.find((s) => s.categories.includes(current.category));
  if (section) {
    return toolsInSection(section)
      .filter((id) => id !== toolId)
      .slice(0, limit);
  }
  return [];
};