/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PDF font extraction built on @cantoo/pdf-lib: walks each page's /Font
 * resource dictionary, resolves descendant/Type0 fonts and embedded font
 * programs, and aggregates honest per-family rows with page lists. Pure
 * Node-compatible logic (no DOM) so the verification script can exercise it
 * against generated PDFs.
 */

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRef,
  PDFStream,
} from "@cantoo/pdf-lib";
import { isStandardFamily, parseBaseFont } from "./pdfFontNames.ts";

export interface PdfFontRow {
  /** Prettified family as shown in the report ("Open Sans"). */
  family: string;
  /** Raw family token from the PDF ("ABCDEF+OpenSans-Bold"). */
  familyRaw: string;
  style: string;
  weight: number;
  italic: boolean;
  /** 1-based page numbers using this font. */
  pages: number[];
  /** True only when every occurrence points at an embedded font program. */
  embedded: boolean;
  /** True for the PDF core-14 families (supplied by the viewer). */
  standard: boolean;
  /** All raw names seen for this family/style. */
  rawNames: string[];
}

export interface PdfFontReport {
  totalPages: number;
  /** Pages whose resources declared at least one font. */
  pagesWithFonts: number;
  rows: PdfFontRow[];
  /** pageRows[i] → indices into rows for page i+1 (empty when none). */
  pageRows: number[][];
  embeddedCount: number;
  /** True when the document could not be parsed as a normal PDF. */
  failed?: boolean;
}

interface RowKey {
  familyKey: string;
  weight: number;
  italic: boolean;
}

const nameToString = (n: PDFName | undefined): string =>
  n ? n.asString() : "";

function lookupDict(
  dict: PDFDict,
  ...keys: string[]
): PDFDict | undefined {
  for (const key of keys) {
    const v = dict.lookupMaybe(PDFName.of(key), PDFDict);
    if (v) return v;
  }
  return undefined;
}

function hasEmbeddedProgram(font: PDFDict): boolean {
  if (font.lookupMaybe(PDFName.of("FontFile"), PDFStream)) return true;
  if (font.lookupMaybe(PDFName.of("FontFile2"), PDFStream)) return true;
  if (font.lookupMaybe(PDFName.of("FontFile3"), PDFStream)) return true;
  const descriptor = lookupDict(font, "FontDescriptor");
  if (descriptor && hasEmbeddedProgram(descriptor)) return true;
  return false;
}

function resolveFontObject(
  doc: PDFDocument,
  obj: ReturnType<PDFDict["get"]>,
): PDFDict | undefined {
  if (obj instanceof PDFRef) {
    const resolved = doc.context.lookup(obj);
    if (resolved instanceof PDFDict) return resolved;
    return undefined;
  }
  if (obj instanceof PDFDict) return obj;
  if (obj instanceof PDFStream) return obj.dict;
  return undefined;
}

/** BaseFont for a font dict, descending into Type0 descendant fonts. */
function baseFontOf(font: PDFDict): { raw: string; embedded: boolean } {
  let embedded = hasEmbeddedProgram(font);
  let raw = nameToString(font.lookupMaybe(PDFName.of("BaseFont"), PDFName));

  const subtype = nameToString(font.lookupMaybe(PDFName.of("Subtype"), PDFName));
  if (subtype === "Type3") {
    // Type3 glyph procedures live in the file itself.
    embedded = true;
    if (!raw) raw = "Type3Glyphs";
  }

  if (subtype === "Type0" && !raw) {
    raw = nameToString(font.lookupMaybe(PDFName.of("BaseFont"), PDFName));
  }

  const descendants = font.lookupMaybe(PDFName.of("DescendantFonts"), PDFArray);
  if (descendants && descendants.size() > 0) {
    const first = descendants.lookupMaybe(0, PDFDict);
    if (first) {
      const descRaw = nameToString(
        first.lookupMaybe(PDFName.of("BaseFont"), PDFName),
      );
      if (descRaw) raw = descRaw;
      if (hasEmbeddedProgram(first)) embedded = true;
    }
  }

  return { raw, embedded };
}

/**
 * Extract the font report from raw PDF bytes. Tolerates encrypted/partial
 * files by loading with `ignoreEncryption` and skipping unresolvable refs.
 */
export async function extractPdfFontReport(
  bytes: ArrayBuffer | Uint8Array,
): Promise<PdfFontReport> {
  const empty: PdfFontReport = {
    totalPages: 0,
    pagesWithFonts: 0,
    rows: [],
    pageRows: [],
    embeddedCount: 0,
  };

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
      warnOnInvalidObjects: false,
    });
  } catch {
    return { ...empty, failed: true };
  }

  const totalPages = doc.getPageCount();
  const pageKeys: string[][] = Array.from({ length: totalPages }, () => []);
  const map = new Map<string, PdfFontRow & RowKey>();
  let pagesWithFonts = 0;

  for (let i = 0; i < totalPages; i++) {
    let resources: PDFDict | undefined;
    try {
      const page = doc.getPage(i);
      resources = page.node.Resources();
    } catch {
      continue;
    }
    if (!resources) continue;
    const fontDict = resources.lookupMaybe(PDFName.of("Font"), PDFDict);
    if (!fontDict) continue;

    let pageUsed = false;
    for (const [, entry] of fontDict.entries()) {
      const font = resolveFontObject(doc, entry);
      if (!font) continue;
      const { raw, embedded } = baseFontOf(font);
      if (!raw) continue;

      const parsed = parseBaseFont(raw);
      const familyKey =
        parsed.familyPretty.toLowerCase().replace(/[^a-z0-9]/g, "") || raw;
      const key = `${familyKey}#${parsed.weight}#${parsed.italic ? "i" : "n"}`;

      let row = map.get(key);
      if (!row) {
        const standard = isStandardFamily(parsed.familyPretty);
        row = {
          familyKey,
          family: parsed.familyPretty,
          familyRaw: parsed.family,
          style: parsed.style,
          weight: parsed.weight,
          italic: parsed.italic,
          pages: [],
          embedded: embedded,
          standard,
          rawNames: [],
        };
        map.set(key, row);
      } else {
        row.embedded = row.embedded && embedded;
      }
      if (!row.pages.includes(i + 1)) row.pages.push(i + 1);
      if (!row.rawNames.includes(raw)) row.rawNames.push(raw);
      pageKeys[i].push(key);
      pageUsed = true;
    }
    if (pageUsed) pagesWithFonts++;
  }

  const rows = [...map.values()].sort(
    (a, b) =>
      a.family.localeCompare(b.family) || a.weight - b.weight,
  );
  const finalIndexByKey = new Map<string, number>();
  rows.forEach((r, idx) => {
    finalIndexByKey.set(
      `${r.familyKey}#${r.weight}#${r.italic ? "i" : "n"}`,
      idx,
    );
  });
  const pageRows = pageKeys.map((keys) =>
    [...new Set(keys)]
      .map((k) => finalIndexByKey.get(k) ?? -1)
      .filter((i) => i >= 0)
      .sort((a, b) => a - b),
  );

  return {
    totalPages,
    pagesWithFonts,
    rows: rows.map(({ familyKey: _fk, ...rest }) => rest),
    pageRows,
    embeddedCount: rows.filter((r) => r.embedded).length,
  };
}
