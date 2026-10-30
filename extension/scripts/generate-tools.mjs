#!/usr/bin/env node
/**
 * generate-tools.mjs
 *
 * Derives the Chrome extension's tool catalogue from the website's SINGLE
 * source of truth (src/toolsRegistry.tsx) so the extension never maintains a
 * separate, manually duplicated tool list.
 *
 * It reads the registry source file, extracts the plain-data fields the
 * extension needs (id, name, desc, category, badge), builds a lightweight
 * search keyword index (from name + desc, mirroring src/searchIndex.ts), and
 * writes a JSON file that the popup consumes.
 *
 * The JSX `<ToolIcon />` icon is intentionally ignored here — the extension
 * renders its own compact icons from the tool id. Nothing React-specific
 * leaks into the extension.
 *
 * Run: `node extension/scripts/generate-tools.mjs`
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");

const registryPath = resolve(repoRoot, "src", "toolsRegistry.tsx");
const outDir = resolve(__dirname, "..", "src", "generated");
const outPath = resolve(outDir, "tools.json");

const source = readFileSync(registryPath, "utf8");

// ── Parse the registry ────────────────────────────────────────────────────
// The registry is `toolsRegistry: Record<ToolId, { name, desc, category, icon, badge? }> = { "id": {...}, ... }`.
// Each entry has the shape:
//   "id": {
//     name: "...",
//     desc: "...",
//     category: "...",
//     icon: <ToolIcon ... />,
//     badge: "..."
//   }
// We extract only the JSON-safe string fields by matching each block.
const toolRe =
  /"([a-z0-9-]+)"\s*:\s*\{([\s\S]*?)\n\s*\}/g;

const tools = [];
let match;
while ((match = toolRe.exec(source)) !== null) {
  const id = match[1];
  const block = match[2];

  const field = (key) => {
    const re = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
    const m = block.match(re);
    return m ? m[1].replace(/\\(["\\])/g, "$1") : undefined;
  };

  const name = field("name");
  const desc = field("desc");
  const category = field("category");
  const badge = field("badge");

  // Skip malformed entries with no name/desc.
  if (!name || !desc) continue;

  tools.push({ id, name, desc, category: category ?? "Tools", badge });
}

if (tools.length === 0) {
  throw new Error("No tools parsed from toolsRegistry.tsx — check the regex.");
}

// ── Build keyword/alias index (mirrors src/searchIndex.ts tokenize logic) ──
const tokenize = (s) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1);

const aliases = {
  jpg: ["jpg", "jpeg", "jfif"],
  pdf: ["pdf"],
  jpeg: ["jpg", "jpeg", "jfif"],
  png: ["png"],
  webp: ["webp"],
  resize: ["resize", "resizer", "scale", "dimensions"],
  compress: ["compress", "compression", "shrink", "reduce", "reduce-size", "smaller"],
  convert: ["convert", "converter", "conversion", "transform", "change"],
  merge: ["merge", "combine", "join", "concatenate"],
  split: ["split", "divide", "separate", "extract"],
};

for (const tool of tools) {
  const words = new Set();
  tokenize(tool.name).forEach((w) => words.add(w));
  tokenize(tool.desc).forEach((w) => words.add(w));
  tokenize(tool.category).forEach((w) => words.add(w));
  tool.id.split("-").forEach((w) => {
    if (w.length > 1) words.add(w);
    const expanded = aliases[w];
    if (expanded) expanded.forEach((e) => words.add(e));
  });
  tool.keywords = [...words];
}

// Sort alphabetically by name for deterministic output and stable list.
tools.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(tools, null, 2), "utf8");

console.log(
  `Generated ${tools.length} tools → ${outPath.replace(repoRoot, ".")}`
);
