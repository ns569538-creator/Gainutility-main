/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ToolId } from "../types";

export interface PopularToolConfig {
  id: ToolId;
  name?: string;
  categoryLabel: string;
  desc: string;
  badge?: string;
}

/**
 * Curated list of high-intent, broad-demand utilities for the homepage Popular section.
 * The product team can easily modify this collection without rewriting UI components.
 * Curated to 16 genuinely useful, high-intent tools with zero duplicates.
 */
export const POPULAR_TOOLS_CONFIG: PopularToolConfig[] = [
  {
    id: "image-converter",
    name: "Image Compressor & Converter",
    categoryLabel: "Images",
    desc: "Compress image file size and convert photos between WebP, PNG, JPG, and AVIF formats.",
    badge: "Lossless & Lossy",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    categoryLabel: "Images",
    desc: "Resize photos to exact pixel dimensions or target percentages while locking aspect ratios.",
    badge: "Exact Dimensions",
  },
  {
    id: "youtube-keyword-explorer",
    name: "YouTube Keyword Explorer",
    categoryLabel: "Creator",
    desc: "Find YouTube search suggestions and high-volume topic ideas from your seed keyword.",
    badge: "Search Suggestions",
  },
  {
    id: "color-picker",
    name: "Color Picker",
    categoryLabel: "Design",
    desc: "Inspect colors and copy HEX, RGB, or HSL values with harmony palettes and shade scales.",
    badge: "HEX · RGB · HSL",
  },
  {
    id: "color-palette-generator",
    name: "Color Palette Builder",
    categoryLabel: "Design",
    desc: "Build harmonious color schemes, lock colors you love, and export ready-to-use CSS tokens.",
    badge: "Palette Export",
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    categoryLabel: "Converters",
    desc: "Generate custom QR codes for website URLs, contact cards, Wi-Fi networks, and text.",
    badge: "SVG & PNG Export",
  },
  {
    id: "json-beautifier",
    name: "JSON Formatter",
    categoryLabel: "Developer",
    desc: "Reformat compacted or messy JSON strings with clean indentation and syntax highlighting.",
    badge: "Clean Indentation",
  },
  {
    id: "json-validator",
    name: "JSON Validator",
    categoryLabel: "Developer",
    desc: "Validate JSON syntax to catch parsing errors and pinpoint the exact error line.",
    badge: "Syntax Checker",
  },
  {
    id: "compress-images-inside-pdf",
    name: "PDF Compressor",
    categoryLabel: "PDF",
    desc: "Reduce oversized PDF files by re-compressing embedded photos without affecting text.",
    badge: "File Shrink",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    categoryLabel: "PDF",
    desc: "Combine multiple PDF documents into a single organized file in any page order you choose.",
    badge: "Combine Files",
  },
  {
    id: "background-remover",
    name: "AI Background Remover",
    categoryLabel: "Images",
    desc: "Isolate subjects and erase photo backgrounds automatically using local browser AI.",
    badge: "Automatic Cutout",
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    categoryLabel: "Design",
    desc: "Generate complete multi-size favicon packages and touch icons from images or emoji.",
    badge: "ICO & PNG Package",
  },
  {
    id: "gradient-generator",
    name: "CSS Gradient Generator",
    categoryLabel: "Design",
    desc: "Create linear, radial, and conic CSS gradients visually with exportable code.",
    badge: "CSS & PNG",
  },
  {
    id: "base64-tool",
    name: "Base64 Encoder & Decoder",
    categoryLabel: "Developer",
    desc: "Encode raw text, images, or payloads to Base64 strings and decode data URIs back to text.",
    badge: "Encode & Decode",
  },
  {
    id: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    categoryLabel: "Developer",
    desc: "Percent-encode text for safe query strings or decode encoded URLs back to readable text.",
    badge: "URI Safe",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    categoryLabel: "PDF",
    desc: "Extract chosen page ranges or split large documents into individual PDF files.",
    badge: "Extract Pages",
  },
];

export const getPopularToolIds = (): ToolId[] => POPULAR_TOOLS_CONFIG.map((tool) => tool.id);
