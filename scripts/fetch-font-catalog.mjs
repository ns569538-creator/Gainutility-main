#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "googleFontCatalog.json",
);

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const GIT_TREES_URL = "https://api.github.com/repos/google/fonts/git/trees";
const TAGS_CSV_URL =
  "https://raw.githubusercontent.com/google/fonts/main/tags/all/families.csv";
const LICENSE_ROOTS = ["ofl", "apache", "ufl", "cc-by-sa"];

const CATEGORY_MAP = {
  "Sans Serif": "sans",
  Serif: "serif",
  Display: "display",
  Handwriting: "handwriting",
  Monospace: "monospace",
};

/** Keep human-assessed tags at/above this score, strongest first. */
const TAG_SCORE_MIN = 50;
const TAGS_PER_FAMILY_MAX = 10;

/**
 * Condensed-looking families whose names don't include a width keyword
 * (Oswald etc.). Curated so the library's "Condensed" filter stays useful
 * without flagging every font that merely offers a narrow width instance.
 */
const CURATED_CONDENSED = new Set(
  [
    "Oswald",
    "Bebas Neue",
    "Fjalla One",
    "Anton",
    "Teko",
    "Khand",
    "Pathway Gothic One",
    "Six Caps",
    "League Gothic",
  ].map(normalizeName),
);

function nameHasWord(family, wordRe) {
  const spaced = String(family)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return new RegExp(`\\b(?:${wordRe.source})\\b`).test(spaced);
}

function normalizeName(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { Accept: "*/*", "User-Agent": "fetch-font-catalog/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "fetch-font-catalog/1.0",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildFolderLicenseMap() {
  const root = await fetchJson(`${GIT_TREES_URL}/main`);
  const shas = {};
  for (const entry of root.tree ?? []) {
    if (entry.type === "tree" && LICENSE_ROOTS.includes(entry.path)) {
      shas[entry.path] = entry.sha;
    }
  }

  const folderLicense = new Map();
  let truncatedAny = false;

  for (const folderName of LICENSE_ROOTS) {
    const sha = shas[folderName];
    if (!sha) {
      console.warn(`WARNING: license root "${folderName}" not found in tree`);
      continue;
    }
    const tree = await fetchJson(`${GIT_TREES_URL}/${sha}?recursive=1`);
    if (tree.truncated) {
      truncatedAny = true;
      console.warn(
        `WARNING: recursive git trees response for "${folderName}" has truncated:true — some folders may be missing`,
      );
    }
    for (const entry of tree.tree ?? []) {
      const segments = entry.path.split("/");
      const familyFolder = segments[0] === folderName ? segments[1] : segments[0];
      if (!familyFolder) continue;
      const key = normalizeName(familyFolder);
      if (key && !folderLicense.has(key)) folderLicense.set(key, folderName);
    }
  }

  if (truncatedAny) {
    console.warn(
      "WARNING: at least one recursive git trees response had truncated:true",
    );
  } else {
    console.log("git trees: no truncation (truncated:false for all roots)");
  }
  return folderLicense;
}

async function main() {
  const raw = await fetchText(METADATA_URL);
  const meta = JSON.parse(raw.slice(raw.indexOf("{")));
  const list = meta.familyMetadataList ?? [];
  console.log(`metadata families: ${list.length}`);

  const allSubsets = new Set();
  for (const f of list) for (const s of f.subsets ?? []) allSubsets.add(s);
  const sortedSubsets = [...allSubsets].sort();
  const subsetIndex = new Map(sortedSubsets.map((s, i) => [s, i]));
  console.log(`unique subsets: ${sortedSubsets.length}`);

  const folderLicense = await buildFolderLicenseMap();

  const fonts = list.map((m) => {
    const fontKeys = Object.keys(m.fonts ?? {});
    const weights = [
      ...new Set(
        fontKeys
          .map((k) => (k.endsWith("i") ? k.slice(0, -1) : k))
          .map((k) => parseInt(k, 10))
          .filter((n) => Number.isFinite(n)),
      ),
    ].sort((a, b) => a - b);
    if (weights.length === 0) weights.push(400);
    const italic = fontKeys.some((k) => k.endsWith("i"));

    const normFamily = normalizeName(m.family);
    const matchedFolder = folderLicense.get(normFamily);
    const license = matchedFolder ?? "unknown";

    const axes = m.axes ?? [];
    const wdth = axes.find((a) => a.tag === "wdth");
    // Width flags come from the family name (with camelCase split so
    // "SemiCondensed" matches) or from a default width axis value. A font that
    // merely *offers* a narrower/wider instance (variable Roboto: wdth
    // 75–100, default 100) is not a condensed face by default — no Google
    // Fonts family defaults to wdth !== 100, so the name rules do the work.
    const condensed =
      nameHasWord(m.family, /condensed|narrow/) ||
      CURATED_CONDENSED.has(normalizeName(m.family)) ||
      (!!wdth && wdth.defaultValue < 100);
    const expanded =
      !condensed &&
      (nameHasWord(m.family, /expanded|extended|wide|broad/) ||
        (!!wdth && wdth.defaultValue > 100));

    const subsetIdx = [];
    for (const s of m.subsets ?? []) {
      const i = subsetIndex.get(s);
      if (i !== undefined) subsetIdx.push(i);
    }
    subsetIdx.sort((a, b) => a - b);

    return {
      family: m.displayName || m.family,
      category: CATEGORY_MAP[m.category] ?? "sans",
      weights,
      italic,
      subsets: subsetIdx,
      designers: m.designers ?? [],
      license,
      variable: axes.length > 0,
      popularity: m.popularity,
      condensed,
      expanded,
      tags: [],
    };
  });

  // ---- Human-assessed style tags from google/fonts (tags/all/families.csv) ----
  const tagRows = (await fetchText(TAGS_CSV_URL)).trim().split(/\r?\n/);
  const tagList = [];
  const tagIndex = new Map();
  const fontsByNorm = new Map(fonts.map((f) => [normalizeName(f.family), f]));
  let tagRowsApplied = 0;
  let tagRowsSkipped = 0;
  for (const row of tagRows) {
    const cols = row.split(",");
    const familyRaw = cols[0];
    const tagPath = cols[2];
    const score = Number(cols[3]);
    if (!familyRaw || !tagPath || !tagPath.startsWith("/") || !(score >= TAG_SCORE_MIN)) {
      tagRowsSkipped++;
      continue;
    }
    if (tagPath.startsWith("/quant/") || tagPath.startsWith("/Skip/")) {
      tagRowsSkipped++;
      continue;
    }
    const idx = fontsByNorm.get(normalizeName(familyRaw));
    if (!idx) {
      tagRowsSkipped++;
      continue;
    }
    let ti = tagIndex.get(tagPath);
    if (ti === undefined) {
      ti = tagList.length;
      tagList.push(tagPath);
      tagIndex.set(tagPath, ti);
    }
    // The CSV can repeat the same family+tag path (per-script rows); keep the
    // best score per tag so the per-family cap isn't spent on duplicates.
    const existing = idx.tags.find((t) => t.ti === ti);
    if (existing) {
      existing.score = Math.max(existing.score, score);
    } else if (idx.tags.length < TAGS_PER_FAMILY_MAX) {
      idx.tags.push({ ti, score });
    }
    tagRowsApplied++;
  }
  for (const f of fonts) {
    f.tags = f.tags
      .sort((a, b) => b.score - a.score)
      .slice(0, TAGS_PER_FAMILY_MAX)
      .map((t) => t.ti);
  }
  console.log(
    `tags: ${tagList.length} unique, ${tagRowsApplied} applied, ${tagRowsSkipped} skipped`,
  );
  const taggedFamilies = fonts.filter((f) => f.tags.length > 0).length;
  console.log(`families with tags: ${taggedFamilies}/${fonts.length}`);

  fonts.sort((a, b) => a.popularity - b.popularity);

  const out = {
    generatedAt: "2026-09-23",
    source:
      "Google Fonts metadata (fonts.google.com/metadata/fonts), google/fonts repository license roots, google/fonts human-assessed tags (tags/all/families.csv)",
    subsets: sortedSubsets,
    tags: tagList,
    fonts,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  // Compact JSON: this file ships inside the tool's lazy-loaded bundle, so
  // pretty-printing would cost ~300KB of parse-free bytes for no benefit.
  writeFileSync(OUT_PATH, `${JSON.stringify(out)}\n`, "utf8");
  console.log(
    `wrote ${OUT_PATH}: ${fonts.length} fonts, ${sortedSubsets.length} subsets`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
