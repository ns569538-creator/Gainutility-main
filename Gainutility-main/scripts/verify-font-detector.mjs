#!/usr/bin/env node
/**
 * Pure-logic verification for the Font Finder / Identifier.
 *
 * Runs under plain Node (type stripping) against the browser-free modules:
 *   node scripts/verify-font-detector.mjs
 *
 * Covers: bitmap similarity, signal ranking, honest tier calibration,
 * BaseFont name parsing, sample signal computation, region detection,
 * sample advice, and a real PDF font report generated via pdf-lib.
 */

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  bitmapSimilarity,
  calibrateTiers,
  combineScores,
  overallVerdict,
  pickWeight,
  rankBySignals,
  signalScoreFor,
} from "../src/lib/fontMatchCore.ts";
import {
  bandsFromRowProjection,
  computeSampleSignals,
  inferPolarityInk,
  inkBBox,
} from "../src/lib/pixelOps.ts";
import { findRegionsInInk } from "../src/lib/textRegions.ts";
import { parseBaseFont, prettifyFamily, isStandardFamily } from "../src/lib/pdfFontNames.ts";
import { prepareMatchText } from "../src/lib/fontMatcherText.ts";import { computeAdvice } from "../src/lib/imagePrep.ts";
import { extractPdfFontReport } from "../src/lib/pdfFontExtract.ts";

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
};

const testAsync = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function makeInk(w, h, paint) {
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (paint(x, y)) data[y * w + x] = 1;
    }
  }
  return { w, h, data };
}

const baseSignals = (over = {}) => ({
  hasText: true,
  charCount: 12,
  uppercaseRatio: 0.2,
  inkRatio: 0.2,
  isCondensed: false,
  isWide: false,
  serifLikely: false,
  handwritingLikely: false,
  allCaps: false,
  inkWidthPx: 400,
  inkHeightPx: 80,
  lineCount: 1,
  contrastStd: 60,
  ...over,
});

const mkFont = (over = {}) => ({
  id: "x",
  family: "X",
  category: "Sans-Serif",
  free: true,
  kind: "google",
  weights: [400, 700],
  variable: false,
  condensed: false,
  expanded: false,
  tagPaths: [],
  classification: { sans: true, weightHint: 4 },
  ...over,
});

/* ------------------------------------------------------------------ */
console.log("fontMatchCore");
/* ------------------------------------------------------------------ */

test("bitmapSimilarity: identical bitmaps score ~1", () => {
  const a = makeInk(120, 60, (x, y) => (x % 17 < 6) && y % 13 < 9);
  const { score, dice, ncc, aspect } = bitmapSimilarity(a, a);
  assert.ok(Math.abs(score - 1) < 1e-9, `score=${score}`);
  assert.equal(dice, 1);
  assert.equal(ncc, 1);
  assert.equal(aspect, 1);
});

test("bitmapSimilarity: different shapes score clearly lower", () => {
  // Letter-like bars vs a centered circle.
  const bars = makeInk(120, 60, (x, y) => (x % 24 < 7) && y > 6 && y < 54);
  const circle = makeInk(120, 60, (x, y) => {
    const dx = x - 60;
    const dy = y - 30;
    return dx * dx + dy * dy < 22 * 22;
  });
  const { score } = bitmapSimilarity(bars, circle);
  assert.ok(score < 0.5, `expected <0.5, got ${score}`);
  const same = bitmapSimilarity(bars, makeInk(120, 60, (x, y) => (x % 24 < 7) && y > 6 && y < 54));
  assert.ok(same.score > 0.99);
});

test("bitmapSimilarity: empty bitmap → 0", () => {
  const empty = { w: 10, h: 10, data: new Uint8Array(100) };
  const real = makeInk(40, 40, (x, y) => x > 5 && x < 35 && y > 5 && y < 35);
  assert.equal(bitmapSimilarity(empty, real).score, 0);
  assert.equal(bitmapSimilarity(empty, empty).score, 0);
});

test("signalScoreFor: serif sample favors serif over monospace", () => {
  const signals = baseSignals({ serifLikely: true, inkRatio: 0.22 });
  const serif = mkFont({ id: "s", family: "S", classification: { serif: true, weightHint: 4 } });
  const mono = mkFont({ id: "m", family: "M", category: "Monospace", classification: { monospace: true, weightHint: 4 } });
  const a = signalScoreFor(serif, signals);
  const b = signalScoreFor(mono, signals);
  assert.ok(a.score > b.score, `${a.score} vs ${b.score}`);
  assert.ok(a.reasons.includes("Serif terminals"));
});

test("rankBySignals: returns limited, best-first ranking", () => {
  const pool = [
    mkFont({ id: "a", classification: { sans: true, condensed: true, weightHint: 4 } }),
    mkFont({ id: "b", classification: { display: true, weightHint: 8 } }),
    mkFont({ id: "c", classification: { serif: true, weightHint: 4 } }),
  ];
  const signals = baseSignals({ isCondensed: true, inkRatio: 0.2 });
  const ranked = rankBySignals(pool, signals, 2);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].font.id, "a");
  assert.ok(ranked[0].signal >= ranked[1].signal);
});

test("combineScores: glyph candidates outrank equal-signal signal-only", () => {
  assert.ok(combineScores(0.5, 80) > combineScores(null, 80));
  assert.equal(combineScores(null, 80), 49.6);
});

test("calibrateTiers: strong glyph evidence → likely", () => {
  const cands = [
    { glyph: 0.72, signal: 84, combined: 77, tier: "similar", reasons: [], font: mkFont() },
    { glyph: 0.5, signal: 80, combined: 64, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: true, charCount: 14 });
  assert.equal(cands[0].tier, "likely");
  assert.equal(cands[1].tier, "possible");
  const v = overallVerdict(cands, { hasText: true, charCount: 14 });
  assert.equal(v.tier, "likely");
});

test("calibrateTiers: margin too tight demotes likely → possible", () => {
  const cands = [
    { glyph: 0.7, signal: 85, combined: 78, tier: "similar", reasons: [], font: mkFont() },
    { glyph: 0.68, signal: 84, combined: 76, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: true, charCount: 14 });
  assert.equal(cands[0].tier, "possible");
});

test("calibrateTiers: not enough characters caps at possible", () => {
  const cands = [
    { glyph: 0.8, signal: 90, combined: 84, tier: "similar", reasons: [], font: mkFont() },
    { glyph: 0.4, signal: 70, combined: 60, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: true, charCount: 3 });
  assert.equal(cands[0].tier, "possible");
  assert.equal(cands[1].tier, "similar");
});

test("calibrateTiers: no OCR text never leaves similar", () => {
  const cands = [
    { glyph: null, signal: 95, combined: 59, tier: "similar", reasons: [], font: mkFont() },
    { glyph: null, signal: 50, combined: 31, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: false, charCount: 0 });
  assert.equal(cands[0].tier, "similar");
  const v = overallVerdict(cands, { hasText: false, charCount: 0 });
  assert.equal(v.tier, "none");
});

test("calibrateTiers: signal-only strong agreement → possible, never likely", () => {
  const cands = [
    { glyph: null, signal: 94, combined: 58, tier: "similar", reasons: [], font: mkFont() },
    { glyph: null, signal: 70, combined: 43, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: true, charCount: 20 });
  assert.equal(cands[0].tier, "possible");
  assert.equal(cands[1].tier, "similar");
});

test("overallVerdict: weak evidence → none with honest copy", () => {
  const cands = [
    { glyph: 0.2, signal: 45, combined: 34, tier: "similar", reasons: [], font: mkFont() },
  ];
  calibrateTiers(cands, { hasText: true, charCount: 10 });
  const v = overallVerdict(cands, { hasText: true, charCount: 10 });
  assert.equal(v.tier, "none");
  assert.match(v.reason, /couldn't find a close enough match/);
  const empty = overallVerdict([], { hasText: false, charCount: 0 });
  assert.equal(empty.tier, "none");
});

await testAsync("TIER_LABELS never expose percentages or 'exact'", async () => {
  const m = await import("../src/lib/fontDetectorTypes.ts");
  for (const label of Object.values(m.TIER_LABELS)) {
    assert.ok(!/\d/.test(label), label);
    assert.ok(!/exact/i.test(label), label);
  }
  assert.equal(m.TIER_LABELS.none, "NO RELIABLE MATCH");
});

test("pickWeight: tracks measured ink density", () => {
  const ws = [300, 400, 700, 900];
  assert.equal(pickWeight(ws, 0.4), 700);
  assert.equal(pickWeight(ws, 0.1), 300);
  assert.equal(pickWeight([400], 0.9), 400);
});

/* ------------------------------------------------------------------ */
console.log("pixelOps / signals");
/* ------------------------------------------------------------------ */

test("computeSampleSignals: 3 text bands + caps detection", () => {
  const w = 300;
  const h = 180;
  const ink = new Uint8Array(w * h);
  for (const [y0, y1] of [[20, 55], [75, 110], [130, 165]]) {
    for (let y = y0; y <= y1; y++) {
      for (let x = 30; x < 270; x += 4) {
        if ((x + y) % 7 !== 0) ink[y * w + x] = 1;
      }
    }
  }
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < gray.length; i++) gray[i] = ink[i] ? 10 : 240;
  const s = computeSampleSignals(ink, gray, w, h, "HELLO WORLD 2026");
  assert.equal(s.lineCount, 3, `lineCount=${s.lineCount}`);
  assert.equal(s.charCount, "HELLOWORLD".length);
  assert.ok(s.allCaps);
  assert.ok(s.inkWidthPx > 0 && s.inkHeightPx > 0);
  const bbox = inkBBox(ink, w, h);
  assert.ok(bbox && bbox.h > 100);
});

test("computeSampleSignals: no letters → hasText false", () => {
  const w = 40;
  const h = 40;
  const ink = new Uint8Array(w * h);
  ink[10 * w + 10] = 1;
  const gray = new Uint8Array(w * h).fill(200);
  const s = computeSampleSignals(ink, gray, w, h, "1234 !!!");
  assert.equal(s.hasText, false);
  assert.equal(s.charCount, 0);
});

test("inferPolarityInk: light-on-dark text becomes ink", () => {
  const w = 60;
  const h = 30;
  const gray = new Uint8Array(w * h).fill(20); // dark background
  for (let y = 8; y < 22; y++) for (let x = 5; x < 55; x++) gray[y * w + x] = 230; // light letters
  const ink = inferPolarityInk(gray);
  assert.equal(ink[15 * w + 30], 1, "letter pixels are ink");
  assert.equal(ink[2 * w + 2], 0, "background is not ink");
});

test("bandsFromRowProjection: three separated bands", () => {
  const w = 80;
  const h = 100;
  const ink = new Uint8Array(w * h);
  for (const [y0, y1] of [[5, 25], [40, 60], [75, 95]]) {
    for (let y = y0; y <= y1; y++) for (let x = 0; x < w; x++) ink[y * w + x] = 1;
  }
  const bands = bandsFromRowProjection(ink, w, h);
  assert.equal(bands.length, 3);
});

test("findRegionsInInk: two stacked lines → regions with valid fractions", () => {
  const w = 400;
  const h = 200;
  const ink = new Uint8Array(w * h);
  for (const y0 of [30, 120]) {
    for (let y = y0; y < y0 + 40; y++) {
      for (let x = 40; x < 360; x += 3) ink[y * w + x] = 1;
    }
  }
  const regions = findRegionsInInk(ink, w, h, 6);
  assert.ok(regions.length >= 1, `regions=${regions.length}`);
  for (const r of regions) {
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 1.0001 && r.y + r.h <= 1.0001);
    assert.ok(r.score > 0);
  }
});

test("computeAdvice: flags tiny and low-contrast crops", () => {
  const flatLow = new Uint8Array(100 * 100).fill(128);
  assert.match(computeAdvice(flatLow, 100, 100), /low contrast/i);
  const flatHigh = new Uint8Array(100 * 100).fill(250);
  assert.match(computeAdvice(flatHigh, 100, 100), /light/);
  const shortGray = new Uint8Array(100 * 20).fill(128);
  assert.match(computeAdvice(shortGray, 100, 20), /40px/);
  const good = new Uint8Array(200 * 80);
  for (let i = 0; i < good.length; i++) good[i] = i % 251;
  assert.equal(computeAdvice(good, 200, 80), null);
});

/* ------------------------------------------------------------------ */
console.log("pdfFontNames");
/* ------------------------------------------------------------------ */

test("parseBaseFont: subset + dashed style", () => {
  const p = parseBaseFont("ABCDEF+Inter-Bold");
  assert.equal(p.subset, "ABCDEF+");
  assert.equal(p.familyPretty, "Inter");
  assert.equal(p.weight, 700);
  assert.equal(p.italic, false);
  assert.equal(p.style, "Bold");
});

test("parseBaseFont: TimesNewRomanPS-BoldItalic", () => {
  const p = parseBaseFont("ABCDEF+TimesNewRomanPS-BoldItalic");
  assert.equal(p.familyPretty, "Times New Roman");
  assert.equal(p.weight, 700);
  assert.equal(p.italic, true);
  assert.equal(p.style, "Bold Italic");
});

test("parseBaseFont: glued HelveticaNeuePSMT noise stripping", () => {
  const p = parseBaseFont("HelveticaNeuePSMT");
  assert.equal(p.family, "HelveticaNeue");
  assert.equal(p.familyPretty, "Helvetica Neue");
  assert.equal(p.weight, 400);
  assert.equal(p.italic, false);
});

test("parseBaseFont: OpenSans-SemiBold compound weight", () => {
  const p = parseBaseFont("ABCDEF+OpenSans-SemiBold");
  assert.equal(p.familyPretty, "Open Sans");
  assert.equal(p.weight, 600);
});

test("parseBaseFont: Oswald-Medium + LightItalic cases", () => {
  const m = parseBaseFont("Oswald-Medium");
  assert.equal(m.familyPretty, "Oswald");
  assert.equal(m.weight, 500);
  const li = parseBaseFont("Lato-LightItalic");
  assert.equal(li.familyPretty, "Lato");
  assert.equal(li.weight, 300);
  assert.equal(li.italic, true);
});

test("prettifyFamily camel splitting", () => {
  assert.equal(prettifyFamily("IBMPlexSans"), "IBM Plex Sans");
  assert.equal(prettifyFamily("JetBrainsMono"), "JetBrains Mono");
});

test("isStandardFamily core-14 detection", () => {
  assert.ok(isStandardFamily("Helvetica"));
  assert.ok(isStandardFamily("Helvetica Neue"));
  assert.ok(isStandardFamily("Times New Roman"));
  assert.ok(!isStandardFamily("Open Sans"));
  assert.ok(!isStandardFamily("Playfair Display"));
});

/* ------------------------------------------------------------------ */
console.log("fontMatcher text prep");
/* ------------------------------------------------------------------ */

test("prepareMatchText: caps transform + line trimming + rejection", () => {
  assert.deepEqual(prepareMatchText("Abc Def", false), ["Abc Def"]);
  assert.deepEqual(prepareMatchText("abc def", true), ["ABC DEF"]);
  assert.deepEqual(prepareMatchText("a", false), []);
  assert.deepEqual(prepareMatchText("   ", false), []);
  const long = prepareMatchText("x".repeat(120), false);
  assert.ok(long[0].length <= 48);
});

/* ------------------------------------------------------------------ */
console.log("pdfFontExtract (generated PDFs)");
/* ------------------------------------------------------------------ */

const SYSTEM_FONT_CANDIDATES = [
  "C:\\Windows\\Fonts\\arial.ttf",
  "C:\\Windows\\Fonts\\trebuc.ttf",
  "C:\\Windows\\Fonts\\calibri.ttf",
  "C:\\Windows\\Fonts\\times.ttf",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
];

await testAsync("extractPdfFontReport: standard + embedded fonts with pages", async () => {
  const { PDFDocument, StandardFonts, rgb } = await import("@cantoo/pdf-lib");
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.HelveticaBold);

  const p1 = doc.addPage([400, 300]);
  p1.drawText("Hello page one", { x: 40, y: 200, size: 18, font: helv });

  let custom = null;
  const fontPath = SYSTEM_FONT_CANDIDATES.find((p) => existsSync(p));
  if (fontPath) {
    const { readFileSync } = await import("node:fs");
    const bytes = readFileSync(fontPath);
    custom = await doc.embedFont(bytes);
    const p2 = doc.addPage([400, 300]);
    p2.drawText("Page two body", { x: 40, y: 200, size: 14, font: custom, color: rgb(0, 0, 0) });
  }

  const saved = await doc.save();
  const report = await extractPdfFontReport(saved);

  assert.equal(report.failed ?? false, false);
  assert.equal(report.totalPages, custom ? 2 : 1);
  assert.ok(report.rows.length >= 1, "expected at least Helvetica row");

  const helveticaRow = report.rows.find((r) => /helvetica/i.test(r.family));
  assert.ok(helveticaRow, `rows: ${report.rows.map((r) => r.family).join(", ")}`);
  assert.equal(helveticaRow.weight, 700);
  assert.equal(helveticaRow.standard, true);
  assert.equal(helveticaRow.embedded, false, "core-14 fonts are not embedded");
  assert.deepEqual(helveticaRow.pages, [1]);
  assert.equal(report.pagesWithFonts, custom ? 2 : 1);

  if (custom) {
    const embeddedRow = report.rows.find((r) => r.embedded === true);
    assert.ok(embeddedRow, "custom font should be flagged embedded");
    assert.ok(!embeddedRow.family.includes("+"), "subset tag stripped");
    assert.deepEqual(embeddedRow.pages, [2]);
    assert.equal(report.embeddedCount >= 1, true);
  }
});

await testAsync("extractPdfFontReport: garbage bytes → failed flag, no throw", async () => {
  const report = await extractPdfFontReport(new Uint8Array([1, 2, 3, 4, 5]));
  assert.equal(report.failed, true);
  assert.equal(report.rows.length, 0);
});

/* ------------------------------------------------------------------ */

if (process.exitCode) {
  console.error(`\n${passed} passed before failures.`);
} else {
  console.log(`\nAll ${passed} checks passed.`);
}
