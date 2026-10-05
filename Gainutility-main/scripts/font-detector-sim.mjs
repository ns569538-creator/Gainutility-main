// Font-detector old-vs-new behavior simulation (no OCR/canvas — pure signals).
// Run: node scripts/font-detector-sim.mjs

/* ---------- OLD logic (pre-fix) ---------- */
const oldEstW = (chars) => Math.max(3, Math.min(30, 60 / Math.max(chars, 1)));
const oldWidthFlags = (chars) => {
  const estW = oldEstW(chars);
  return { estW, isCondensed: estW < 11, isWide: estW > 20 };
};
const oldSerif = (avgRuns, inkRatio) => avgRuns > 2.2 && inkRatio > 0.08 && inkRatio < 0.5;
const oldHandwriting = (avgRuns, inkRatio) => inkRatio > 0.02 && inkRatio < 0.18 && avgRuns > 3.5;

/* ---------- NEW logic (post-fix) ---------- */
const newWidthFlags = ({ inkWidthPx, inkHeightPx, lineCount, chars }) => {
  if (chars < 4 || inkWidthPx <= 0 || inkHeightPx <= 0) return { estW: null, isCondensed: false, isWide: false };
  const lines = Math.max(1, lineCount);
  const lineH = inkHeightPx / lines;
  const estW = (inkWidthPx * lines) / (chars * lineH);
  return { estW, isCondensed: estW < 0.45, isWide: estW > 0.72 };
};
const newSerif = ({ inkRatio, botRuns, midRuns }) =>
  inkRatio > 0.06 && inkRatio < 0.55 && midRuns > 0 && botRuns / midRuns > 1.45;
const newHandwriting = ({ inkRatio, avgRuns }) =>
  inkRatio > 0.02 && inkRatio < 0.35 && avgRuns > 0 && avgRuns < 2.2;

/* ---------- Shared mock catalog ---------- */
const POOL = [
  { id: "inter", family: "Inter", free: true, cl: { sans: true, wide: true, weightHint: 4 } },
  { id: "roboto", family: "Roboto", free: true, cl: { sans: true, condensed: false, weightHint: 4 } },
  { id: "oswald", family: "Oswald", free: true, cl: { sans: true, condensed: true, weightHint: 5 } },
  { id: "playfair", family: "Playfair Display", free: true, cl: { serif: true, weightHint: 4 } },
  { id: "bitter", family: "Bitter", free: true, cl: { serif: true, condensed: true, weightHint: 6 } },
  { id: "great-vibes", family: "Great Vibes", free: true, cl: { script: true, weightHint: 3 } },
  { id: "helvetica", family: "Helvetica Neue", free: false, cl: { sans: true, weightHint: 4 } },
  { id: "arial", family: "Arial", free: false, cl: { sans: true, weightHint: 4 } },
  { id: "georgia", family: "Georgia", free: false, cl: { serif: true, weightHint: 4 } },
];

const oldPool = () => POOL.filter((f) => f.free); // commercial excluded pre-fix
const newPool = () => POOL; // commercial included post-fix

function oldRank(signals) {
  const scored = oldPool().map((font) => {
    let score = 40;
    const cl = font.cl;
    if (signals.inkRatio > 0.32) { if ((cl.weightHint ?? 4) >= 6) score += 12; }
    else if (signals.inkRatio > 0.18) { if ((cl.weightHint ?? 4) >= 4 && (cl.weightHint ?? 4) <= 6) score += 8; }
    else if (signals.inkRatio < 0.16) { if ((cl.weightHint ?? 4) <= 3) score += 10; }
    if (signals.isCondensed && cl.condensed) score += 14;
    if (signals.isWide && cl.wide) score += 12;
    if (signals.serifLikely) { if (cl.serif) score += 16; else if (cl.sans) score -= 8; }
    else { if (cl.sans) score += 10; else if (cl.serif) score -= 6; }
    if (signals.handwritingLikely && cl.script) score += 16;
    if (signals.allCaps && cl.display) score += 12;
    score = Math.max(0, Math.min(98, score));
    const confidence = score >= 80 && signals.hasText ? "strong" : score >= 62 ? "good" : "similar";
    return { family: font.family, free: font.free, confidence, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const kept = scored.slice(0, 8);
  if (kept[0] && kept[0].score < 55) kept[0] = { ...kept[0], confidence: "similar" };
  return kept;
}

function newRank(signals) {
  const scored = newPool().map((font) => {
    let score = 32;
    const cl = font.cl;
    if (signals.inkRatio > 0.32) { if ((cl.weightHint ?? 4) >= 6) score += 12; }
    else if (signals.inkRatio > 0.18) { if ((cl.weightHint ?? 4) >= 4 && (cl.weightHint ?? 4) <= 6) score += 8; }
    else if (signals.inkRatio < 0.16) { if ((cl.weightHint ?? 4) <= 3) score += 10; }
    if (signals.isCondensed && cl.condensed) score += 12;
    if (signals.isWide && cl.wide) score += 11;
    if (signals.serifLikely) { if (cl.serif) score += 14; else if (cl.sans) score -= 8; }
    else { if (cl.sans) score += 9; else if (cl.serif) score -= 6; }
    if (signals.handwritingLikely && cl.script) score += 16;
    if (signals.allCaps && cl.display) score += 12;
    if (signals.allCaps && cl.script) score -= 10;
    score = Math.max(0, Math.min(98, score));
    const confidence = score >= 80 && signals.hasText ? "strong" : score >= 62 ? "good" : "similar";
    return { family: font.family, free: font.free, confidence, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const kept = scored.slice(0, 8);
  const top = kept[0]?.score ?? 0;
  const second = kept[1]?.score ?? 0;
  if (kept.length) {
    const strongOk = signals.hasText && signals.charCount >= 4 && top >= 80 && top - second >= 8;
    if (!strongOk) for (let i = 0; i < kept.length; i++) if (kept[i].confidence === "strong") kept[i] = { ...kept[i], confidence: "good" };
    if (!signals.hasText || signals.charCount === 0) {
      for (let i = 0; i < kept.length; i++) if (kept[i].confidence !== "similar") kept[i] = { ...kept[i], confidence: "similar" };
    } else if (top < 55) kept[0] = { ...kept[0], confidence: "similar" };
  }
  return kept;
}

/* ---------- Scenarios ---------- */
let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} — ${detail}`); }
};

console.log("== 1) Width estimation (old always condensed for >=6 chars) ==");
for (const chars of [4, 6, 8, 12, 20, 40]) {
  const o = oldWidthFlags(chars);
  console.log(`  chars=${chars}: old estW=${o.estW.toFixed(1)} condensed=${o.isCondensed}`);
}
check("old flags condensed at 6 chars", oldWidthFlags(6).isCondensed, "expected true");
check("old flags condensed at 40 chars", oldWidthFlags(40).isCondensed, "expected true");

// Normal UI text ~0.5 advance/lineH; condensed poster ~0.36; wide ~0.78
const normal = newWidthFlags({ inkWidthPx: 440, inkHeightPx: 40, lineCount: 1, chars: 20 });
const condensed = newWidthFlags({ inkWidthPx: 280, inkHeightPx: 40, lineCount: 1, chars: 20 });
const wide = newWidthFlags({ inkWidthPx: 620, inkHeightPx: 40, lineCount: 1, chars: 20 });
const multiline = newWidthFlags({ inkWidthPx: 400, inkHeightPx: 80, lineCount: 2, chars: 40 });
console.log(`  new normal estW=${normal.estW.toFixed(2)} c=${normal.isCondensed} w=${normal.isWide}`);
console.log(`  new condensed estW=${condensed.estW.toFixed(2)} c=${condensed.isCondensed}`);
console.log(`  new wide estW=${wide.estW.toFixed(2)} w=${wide.isWide}`);
console.log(`  new 2-line estW=${multiline.estW.toFixed(2)} c=${multiline.isCondensed} w=${multiline.isWide}`);
check("new: normal not condensed", !normal.isCondensed && !normal.isWide, JSON.stringify(normal));
check("new: condensed detected", condensed.isCondensed, JSON.stringify(condensed));
check("new: wide detected", wide.isWide, JSON.stringify(wide));
check("new: multiline normal not condensed", !multiline.isCondensed, JSON.stringify(multiline));

console.log("\n== 2) Serif / handwriting heuristics ==");
// Typical multi-letter sans body: avgRuns≈3.2, inkRatio≈0.12 (old serif fires wrongly)
check("old serif false-positive on normal sans", oldSerif(3.2, 0.12), "expected true (the bug)");
const normalSans = newSerif({ inkRatio: 0.12, botRuns: 2.4, midRuns: 2.6 });
check("new serif no false-positive on normal sans", !normalSans, JSON.stringify({ normalSans }));
const serifBody = newSerif({ inkRatio: 0.14, botRuns: 4.2, midRuns: 2.1 });
check("new serif detects serif baseline", serifBody, JSON.stringify({ serifBody }));

// Sparse normal text: inkRatio 0.10, avgRuns 4 (old handwriting fires)
check("old handwriting false-positive on sparse print", oldHandwriting(4.0, 0.10), "expected true (the bug)");
check("new handwriting no false-positive on sparse print", !newHandwriting({ inkRatio: 0.10, avgRuns: 4.0 }), "");
check("new handwriting detects cursive (low runs)", newHandwriting({ inkRatio: 0.08, avgRuns: 1.5 }), "");

console.log("\n== 3) Ranking + confidence gating ==");
// A) Weak/no OCR text — must never be "Likely"; old still showed "Possible"/strong-tier scores
const noTextInflated = {
  hasText: false, charCount: 0, inkRatio: 0.35, isCondensed: true, isWide: false,
  serifLikely: true, handwritingLikely: false, allCaps: false,
};
const noTextOld = oldRank(noTextInflated);
const noTextNew = newRank({ ...noTextInflated, isCondensed: false, serifLikely: false });
console.log(`  no-text top: old=${noTextOld[0].confidence}(${noTextOld[0].score}) new=${noTextNew[0].confidence}(${noTextNew[0].score})`);
check("old no-text still scores 'good' or higher", noTextOld[0].confidence === "good" || noTextOld[0].confidence === "strong", JSON.stringify(noTextOld[0]));
check("new no-text capped to similar", noTextNew.every((r) => r.confidence === "similar"), JSON.stringify(noTextNew.map((r) => r.confidence)));

// B) Sans body text with false condensed + false serif (old heuristics) → false "Likely" on a SERIF face
const sansSignalsOld = {
  hasText: true, charCount: 18, inkRatio: 0.35,
  isCondensed: oldWidthFlags(18).isCondensed, // true (the bug)
  isWide: false, serifLikely: oldSerif(3.2, 0.12), handwritingLikely: false, allCaps: false,
};
const sansSignalsNew = {
  hasText: true, charCount: 18, inkRatio: 0.35,
  isCondensed: false, isWide: false, serifLikely: normalSans, handwritingLikely: false, allCaps: false,
};
const sansOld = oldRank(sansSignalsOld);
const sansNew = newRank(sansSignalsNew);
console.log(`  sans top-3 old: ${sansOld.slice(0, 3).map((r) => `${r.family}:${r.confidence}:${r.score}`).join(", ")}`);
console.log(`  sans top-3 new: ${sansNew.slice(0, 3).map((r) => `${r.family}:${r.confidence}:${r.score}`).join(", ")}`);
check(
  "old falsely marks a face 'Likely' from wrong condensed+serif",
  sansOld.some((r) => r.confidence === "strong"),
  JSON.stringify(sansOld.slice(0, 3))
);
check(
  "new does not mark wrong-category face 'Likely' on sans body",
  !sansNew.some((r) => r.confidence === "strong"),
  JSON.stringify(sansNew.slice(0, 3))
);

// C) Commercial fonts must be rankable
const hasCommercial = sansNew.some((r) => r.family === "Helvetica Neue" || r.family === "Arial" || r.family === "Georgia");
const oldHasCommercial = sansOld.some((r) => !r.free);
check("old pool excludes commercial", !oldHasCommercial, JSON.stringify(sansOld.map((r) => r.family)));
check("new pool includes commercial", hasCommercial, JSON.stringify(sansNew.map((r) => r.family)));

// D) Clear multi-signal evidence still allowed (serif baseline + bold + condensed + all-caps)
const strongPoolSignals = {
  hasText: true, charCount: 30, inkRatio: 0.35, isCondensed: true, isWide: false,
  serifLikely: true, handwritingLikely: false, allCaps: true,
};
// Use a pool where one font matches all signals (condensed bold serif display)
const strongPool = [
  { id: "cond-bold-serif", family: "CondSerif Display", free: true, cl: { serif: true, condensed: true, display: true, weightHint: 7 } },
  { id: "inter", family: "Inter", free: true, cl: { sans: true, wide: true, weightHint: 4 } },
  { id: "roboto", family: "Roboto", free: true, cl: { sans: true, weightHint: 4 } },
];
function rankWithPool(pool, signals, { base, bonuses, gate }) {
  const scored = pool.map((font) => {
    let score = base;
    const cl = font.cl;
    if (signals.inkRatio > 0.32) { if ((cl.weightHint ?? 4) >= 6) score += bonuses.weight; }
    else if (signals.inkRatio > 0.18) { if ((cl.weightHint ?? 4) >= 4 && (cl.weightHint ?? 4) <= 6) score += bonuses.weightMid; }
    else if (signals.inkRatio < 0.16) { if ((cl.weightHint ?? 4) <= 3) score += bonuses.light; }
    if (signals.isCondensed && cl.condensed) score += bonuses.condensed;
    if (signals.isWide && cl.wide) score += bonuses.wide;
    if (signals.serifLikely) { if (cl.serif) score += bonuses.serif; else if (cl.sans) score -= 8; }
    else { if (cl.sans) score += bonuses.sans; else if (cl.serif) score -= 6; }
    if (signals.handwritingLikely && cl.script) score += bonuses.script;
    if (signals.allCaps && cl.display) score += bonuses.display;
    score = Math.max(0, Math.min(98, score));
    const confidence = score >= gate.strong && signals.hasText ? "strong" : score >= gate.good ? "good" : "similar";
    return { family: font.family, free: font.free, confidence, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const kept = scored.slice(0, 8);
  if (gate.newStyle) {
    const top = kept[0]?.score ?? 0;
    const second = kept[1]?.score ?? 0;
    if (kept.length) {
      const strongOk = signals.hasText && signals.charCount >= 4 && top >= gate.strong && top - second >= 8;
      if (!strongOk) for (let i = 0; i < kept.length; i++) if (kept[i].confidence === "strong") kept[i] = { ...kept[i], confidence: "good" };
      if (!signals.hasText || signals.charCount === 0) {
        for (let i = 0; i < kept.length; i++) if (kept[i].confidence !== "similar") kept[i] = { ...kept[i], confidence: "similar" };
      } else if (top < 55) kept[0] = { ...kept[0], confidence: "similar" };
    }
  } else if (kept[0] && kept[0].score < 55) kept[0] = { ...kept[0], confidence: "similar" };
  return kept;
}
const strongNew = rankWithPool(strongPool, strongPoolSignals, {
  base: 32,
  bonuses: { weight: 12, weightMid: 8, light: 10, condensed: 12, wide: 11, serif: 14, sans: 9, script: 16, display: 12 },
  gate: { strong: 80, good: 62, newStyle: true },
});
const strongOld = rankWithPool(strongPool, { ...strongPoolSignals, isCondensed: true, serifLikely: true }, {
  base: 40,
  bonuses: { weight: 12, weightMid: 8, light: 10, condensed: 14, wide: 12, serif: 16, sans: 10, script: 16, display: 12 },
  gate: { strong: 80, good: 62, newStyle: false },
});
console.log(`  multi-signal top-3 old: ${strongOld.slice(0, 3).map((r) => `${r.family}:${r.confidence}:${r.score}`).join(", ")}`);
console.log(`  multi-signal top-3 new: ${strongNew.slice(0, 3).map((r) => `${r.family}:${r.confidence}:${r.score}`).join(", ")}`);
const strongTop = strongNew[0];
const margin = strongTop.score - (strongNew[1]?.score ?? 0);
check(
  "new still allows 'Likely' on clear multi-signal match",
  strongTop.confidence === "strong" && strongTop.score >= 80 && margin >= 8,
  JSON.stringify({ strongTop, margin })
);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
