/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility box-shadow research — analysis.
 *
 * Reads the NDJSON produced by collect-box-shadow.mjs and writes:
 *   - scripts/research-data/summary.json         (every number the article cites)
 *   - src/blog/boxShadowData.ts     (typed chart data for the site)
 *   - public/research/box-shadow-values.csv      (downloadable dataset)
 *
 * var() resolution: a value that references custom properties is resolved in
 * the same order a browser would look for it, using ONLY the site's own CSS:
 *   1. a custom property declared in the SAME rule (Tailwind utility pattern)
 *   2. a custom property declared in the sheet's :root / html rules (design
 *      tokens, Bootstrap) — no cross-sheet resolution
 *   3. the var() fallback inside the token itself
 * Any var() that cannot be resolved this way is excluded from px-space stats
 * and counted separately ("unresolved"), never guessed. resolvedBy records the
 * mechanism that produced each layer.
 *
 * Unit-of-analysis decisions:
 *   - a "declaration" = one box-shadow value on one rule; the parallel
 *     -webkit-box-shadow with an identical value in the same rule collapses
 *   - a "distinct value" = normalized value string (whitespace collapsed,
 *     lowercased); per-site presence = number of distinct crawled domains that
 *     ship it at least once
 *   - px-space layer stats use values whose four numbers are all px, whether
 *     literal or resolved; rem values convert at a 16px root (labelled rem@16);
 *     every other unit is counted but never guessed
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parseShadowValue } from "./box-shadow-parse.mjs";

const RAW = resolve("scripts/research-data/raw/declarations.ndjson");
const OUT = resolve("scripts/research-data");
const REM_ROOT = 16;

const pretty = (n, digits = 1) => Number(n.toFixed(digits));
const pct = (n, d) => (d === 0 ? 0 : (n / d) * 100);

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function quantiles(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return {
    min: s.length ? s[0] : null,
    p05: percentile(s, 0.05),
    p10: percentile(s, 0.1),
    p25: percentile(s, 0.25),
    p50: percentile(s, 0.5),
    p75: percentile(s, 0.75),
    p90: percentile(s, 0.9),
    p95: percentile(s, 0.95),
    p99: percentile(s, 0.99),
    max: s.length ? s[s.length - 1] : null,
    mean: s.length ? s.reduce((a, b) => a + b, 0) / s.length : null,
  };
}

function hist(bins, arr, fn) {
  for (const v of arr) {
    const idx = Math.min(bins.length - 1, Math.max(0, Math.floor(fn(v) / 2)));
    bins[idx]++;
  }
  return bins;
}

function isAchromatic(hex) {
  if (!hex || hex.length !== 7) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) <= 2;
}

const norm = (v) => v.replace(/\s+/g, " ").trim().toLowerCase();
const hasVar = (s) => /var\(/i.test(s);

/** Split a value into var(--name, fallback) spans. */
function varSpans(value) {
  const spans = [];
  const re = /var\(/gi;
  let m;
  while ((m = re.exec(value))) {
    const start = m.index;
    let depth = 1;
    let i = m.index + 4;
    for (; i < value.length; i++) {
      if (value[i] === "(") depth++;
      else if (value[i] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth === 0) {
      const inner = value.slice(m.index + 4, i);
      const comma = inner.indexOf(",");
      const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
      const fallback = comma === -1 ? null : inner.slice(comma + 1).trim();
      spans.push({ start, end: i + 1, name, fallback });
      re.lastIndex = i + 1;
    }
  }
  return spans;
}

/** Resolve var() against the site's own declarations. Returns {value, resolved, via}. */
function resolveVars(value, ruleProps, rootProps) {
  let current = value;
  const via = new Set();
  for (let round = 0; round < 6; round++) {
    const spans = varSpans(current);
    if (spans.length === 0) return { value: current.trim(), resolved: true, via };
    let changed = false;
    for (let i = spans.length - 1; i >= 0; i--) {
      const sp = spans[i];
      const table = ruleProps && Object.prototype.hasOwnProperty.call(ruleProps, sp.name)
        ? { src: ruleProps[sp.name], via: "ruleProp" }
        : rootProps && Object.prototype.hasOwnProperty.call(rootProps, sp.name)
          ? { src: rootProps[sp.name], via: "rootProp" }
          : sp.fallback !== null
            ? { src: sp.fallback, via: "fallback" }
            : null;
      if (!table) continue;
      via.add(table.via);
      const before = current.slice(0, sp.start) + table.src + current.slice(sp.end);
      if (before !== current) {
        current = before;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return { value: current.trim(), resolved: varSpans(current).length === 0, via };
}

async function main() {
  const lines = readFileSync(RAW, "utf8").split(/\r?\n/).filter(Boolean);
  const metas = [];
  const decls = [];
  const sheetPropsByDomain = new Map();
  for (const l of lines) {
    const o = JSON.parse(l);
    if (o.type === "sheetProps") {
      let m = sheetPropsByDomain.get(o.domain);
      if (!m) {
        m = new Map();
        sheetPropsByDomain.set(o.domain, m);
      }
      m.set(o.sheetId, o.rootProps || {});
    } else if (o.property) decls.push(o);
    else metas.push(o);
  }
  const rootPropsFor = (sheetId, domain) => {
    if (sheetId === null || sheetId === undefined) return {};
    const m = sheetPropsByDomain.get(domain);
    return (m && m.get(sheetId)) || {};
  };

  const successful = metas.filter((m) => m.homepageStatus === 200 || m.homepageStatus === 203);
  const failed = metas.filter((m) => !(m.homepageStatus === 200 || m.homepageStatus === 203));
  const failBy = {};
  for (const m of failed) {
    const key = m.failReason || `status ${m.homepageStatus}`;
    failBy[key] = (failBy[key] || 0) + 1;
  }

  // --- rule-level vendor de-duplication (identical value on same rule) ---
  const seenRule = new Set();
  const declsDeduped = [];
  for (const d of decls) {
    const valKey = norm(d.value);
    if (d.selector !== null && !d.selector.includes(",")) {
      const k = `${d.domain}|${d.fileType}|${d.sheetId ?? ""}|${d.selector}|${valKey}`;
      if (seenRule.has(k)) continue;
      seenRule.add(k);
    }
    declsDeduped.push(d);
  }
  const vendorPairs = decls.length - declsDeduped.length;

  // --- per-value parse & classification, then resolution ---
  const kinds = new Map();
  const values = new Map();
  let allLayers = []; // literal + resolved px layers
  let remLayers = [];
  let otherUnitDecls = 0;
  let stats = { ok: 0, none: 0, global: 0, varOnly: 0, varPartial: 0, malformed: 0, varResolved: 0, varPartiallyResolved: 0 };
  const resolvedVia = new Map();

  for (const d of declsDeduped) {
    let parsed = parseShadowValue(d.value, { remRoot: REM_ROOT });
    let resolvedRecord = null;
    if (hasVar(d.value)) {
      const r = resolveVars(d.value, d.ruleProps || {}, rootPropsFor(d.sheetId, d.domain));
      if (r.resolved) {
        const rp = parseShadowValue(r.value, { remRoot: REM_ROOT });
        if (rp.kind === "ok" && rp.pxLayers.length) {
          parsed = { ...rp, resolved: true, resolvedVia: r.via };
          stats.varResolved++;
        } else if (rp.kind === "none") {
          parsed = { ...rp, resolved: true };
        } else {
          resolvedRecord = { value: r.value, px: rp.pxLayers.length };
          stats.varPartiallyResolved++;
        }
      } else if (resolvedRecord === null) {
        // unresolved var()s — classification stays as-is
      }
    }

    kinds.set(parsed.kind, (kinds.get(parsed.kind) || 0) + 1);
    if (parsed.resolved) {
      for (const via of parsed.resolvedVia || []) resolvedVia.set(via, (resolvedVia.get(via) || 0) + 1);
    }
    if (parsed.kind === "ok") stats.ok++;
    else if (parsed.kind === "none") stats.none++;
    else if (parsed.kind === "global") stats.global++;
    else if (parsed.kind === "varOnly") stats.varOnly++;
    else if (parsed.kind === "varPartial") stats.varPartial++;
    else if (parsed.kind === "malformed") stats.malformed++;
    if (!parsed.resolved && parsed.kind === "ok") parsed.resolvedVia = new Set(["literal"]);

    const key = norm(d.value);
    let v = values.get(key);
    if (!v) {
      v = { raw: d.value, domains: new Set(), decls: 0, kind: parsed.kind, px: false };
      values.set(key, v);
    }
    v.domains.add(d.domain);
    v.decls++;
    if (parsed.kind === "ok") {
      if (parsed.pxLayers.length) v.px = true;
      for (const pl of parsed.pxLayers) {
        if (pl.unitSpace === "px") allLayers.push(pl);
        else if (pl.unitSpace === "rem@16") remLayers.push({ ...pl, unitSpace: "rem@16" });
      }
      if (parsed.pxLayers.length === 0 && parsed.layers.length > 0) otherUnitDecls++;
    }
  }

  resolvedVia.set("literal", stats.ok - stats.varResolved);

  // --- px-space distributions (literal + resolved) ---
  const xArr = allLayers.map((l) => l.x);
  const yArr = allLayers.map((l) => l.y);
  const blurArr = allLayers.map((l) => l.blur);
  const spreadArr = allLayers.map((l) => l.spread);

  const layerCounts = {};
  let countedDecls = 0;
  for (const d of declsDeduped) {
    if (!hasVar(d.value)) {
      const p = parseShadowValue(d.value, { remRoot: REM_ROOT });
      if (p.kind === "ok" && p.pxLayers.length) {
        countedDecls++;
        const n = p.pxLayers.length;
        layerCounts[n] = (layerCounts[n] || 0) + 1;
      }
      continue;
    }
    const r = resolveVars(d.value, d.ruleProps || {}, rootPropsFor(d.sheetId, d.domain));
    if (!r.resolved) continue;
    const rp = parseShadowValue(r.value, { remRoot: REM_ROOT });
    if (rp.kind === "ok" && rp.pxLayers.length) {
      countedDecls++;
      const n = rp.pxLayers.length;
      layerCounts[n] = (layerCounts[n] || 0) + 1;
    }
  }

  // --- color & alpha ---
  const colorSyntax = new Map();
  let colorOmitted = 0;
  let alphaBucketCount = 0;
  let achromatic = 0;
  let chromatic = 0;
  const alphaBuckets = {
    ">0..0.05": 0, "0.05..0.1": 0, "0.1..0.15": 0, "0.15..0.2": 0, "0.2..0.25": 0,
    "0.25..0.3": 0, "0.3..0.4": 0, "0.4..0.5": 0, "0.5..0.7": 0, "0.7..1": 0, exact1: 0,
  };
  for (const l of allLayers) {
    const c = l.color;
    if (!c) { colorOmitted++; continue; }
    colorSyntax.set(c.syntax, (colorSyntax.get(c.syntax) || 0) + 1);
    if (c.alpha !== null) {
      alphaBucketCount++;
      if (c.alpha === 1) alphaBuckets.exact1++;
      else if (c.alpha <= 0.05) alphaBuckets[">0..0.05"]++;
      else if (c.alpha <= 0.1) alphaBuckets["0.05..0.1"]++;
      else if (c.alpha <= 0.15) alphaBuckets["0.1..0.15"]++;
      else if (c.alpha <= 0.2) alphaBuckets["0.15..0.2"]++;
      else if (c.alpha <= 0.25) alphaBuckets["0.2..0.25"]++;
      else if (c.alpha <= 0.3) alphaBuckets["0.25..0.3"]++;
      else if (c.alpha <= 0.4) alphaBuckets["0.3..0.4"]++;
      else if (c.alpha <= 0.5) alphaBuckets["0.4..0.5"]++;
      else if (c.alpha <= 0.7) alphaBuckets["0.5..0.7"]++;
      else alphaBuckets["0.7..1"]++;
    }
    if (isAchromatic(c.hex)) achromatic++;
    else if (c.hex) chromatic++;
  }

  const sitesUsing = new Set();
  for (const d of declsDeduped) {
    if (norm(d.value) === "none" || norm(d.value) === "unset") continue;
    if (hasVar(d.value)) {
      const r = resolveVars(d.value, d.ruleProps || {}, rootPropsFor(d.sheetId, d.domain));
      if (!r.resolved) continue;
      sitesUsing.add(d.domain);
      continue;
    }
    const p = parseShadowValue(d.value, { remRoot: REM_ROOT });
    if (p.kind !== "none" && p.kind !== "global") sitesUsing.add(d.domain);
  }

  const sheetStats = successful.map((m) => m.sheets.length);
  const sheetFetchFailures = [];
  for (const m of successful) {
    for (const s of m.sheetsDetail || []) if (s.status !== 200) sheetFetchFailures.push(s.status);
  }

  const topByPresence = [...values.entries()]
    .map(([k, v]) => ({ value: v.raw, sites: v.domains.size, decls: v.decls, kind: v.kind, px: v.px, resolved: v.px }))
    .sort((a, b) => b.sites - a.sites);

  const perDomain = new Map();
  for (const d of declsDeduped) {
    const ent = perDomain.get(d.domain) || { total: 0, ok: 0, none: 0, varOnly: 0, layers: 0, px: 0 };
    ent.total++;
    if (hasVar(d.value)) {
      const r = resolveVars(d.value, d.ruleProps || {}, rootPropsFor(d.sheetId, d.domain));
      if (r.resolved) {
        const p = parseShadowValue(r.value, { remRoot: REM_ROOT });
        if (p.kind === "ok" && p.pxLayers.length) { ent.ok++; ent.layers += p.pxLayers.length; ent.px += p.pxLayers.length; }
      } else ent.varOnly++;
      continue;
    }
    const p = parseShadowValue(d.value, { remRoot: REM_ROOT });
    if (p.kind === "ok" && p.pxLayers.length) { ent.ok++; ent.layers += p.pxLayers.length; ent.px += p.pxLayers.length; }
    else if (p.kind === "none") ent.none++;
    else if (p.kind === "varOnly" || p.kind === "varPartial") ent.varOnly++;
    perDomain.set(d.domain, ent);
  }
  const exampleTable = [...perDomain.entries()].map(([domain, e]) => ({ domain, ...e })).sort((a, b) => b.total - a.total);

  const summary = {
    generatedAt: new Date().toISOString().slice(0, 19) + "Z",
    methodology: {
      sampled: 1000,
      successful: successful.length,
      successRatePct: pretty(pct(successful.length, 1000)),
      remRootPx: REM_ROOT,
      failureBreakdown: failBy,
      sheetsPerSite: { ...quantiles(sheetStats), sitesWithNoStyleOrLink: successful.filter((m) => m.inlineStyleBlocks === 0 && m.sheets.length === 0).length },
      sheetFetchNon200: sheetFetchFailures.length,
    },
    declarations: {
      rawRows: decls.length,
      deduped: declsDeduped.length,
      vendorPairsCollapsed: vendorPairs,
      distinctValues: values.size,
      distinctPxValues: [...values.values()].filter((v) => v.px).length,
      kinds: Object.fromEntries([...kinds.entries()].sort((a, b) => b[1] - a[1])),
      stats,
      resolvedVia: Object.fromEntries([...resolvedVia.entries()].sort((a, b) => b[1] - a[1])),
      otherUnitDecls,
    },
    layers: {
      pxLayers: allLayers.length,
      remAt16Layers: remLayers.length,
      offsetX: quantiles(xArr),
      offsetY: quantiles(yArr),
      blur: quantiles(blurArr),
      spread: quantiles(spreadArr),
      details: {
        xZeroPct: pretty(pct(xArr.filter((v) => v === 0).length, xArr.length)),
        yPositivePct: pretty(pct(yArr.filter((v) => v > 0).length, yArr.length)),
        yZeroPct: pretty(pct(yArr.filter((v) => v === 0).length, yArr.length)),
        yNegativePct: pretty(pct(yArr.filter((v) => v < 0).length, yArr.length)),
        blurZeroPct: pretty(pct(blurArr.filter((v) => v === 0).length, blurArr.length)),
        spreadNegativePct: pretty(pct(spreadArr.filter((v) => v < 0).length, spreadArr.length)),
        spreadZeroPct: pretty(pct(spreadArr.filter((v) => v === 0).length, spreadArr.length)),
        spreadPositivePct: pretty(pct(spreadArr.filter((v) => v > 0).length, spreadArr.length)),
        insetLayersPct: pretty(pct(allLayers.filter((l) => l.inset).length, allLayers.length)),
      },
      color: {
        syntax: Object.fromEntries([...colorSyntax.entries()].sort((a, b) => b[1] - a[1])),
        omittedColorsPct: pretty(pct(colorOmitted, allLayers.length)),
        achromaticPct: pretty(pct(achromatic, achromatic + chromatic || 1)),
        alphaExact1Pct: pretty(pct(alphaBuckets.exact1, alphaBucketCount)),
        alphaLe30Pct: pretty(pct(Object.entries(alphaBuckets).slice(0, 8).reduce((a, [, n]) => a + n, 0), alphaBucketCount)),
        alphaBuckets,
      },
      perDecl: {
        countedDecls,
        counts: Object.fromEntries(Object.entries(layerCounts).sort((a, b) => Number(a[0]) - Number(b[0]))),
        single: layerCounts[1] || 0,
        two: layerCounts[2] || 0,
        threePlus: Object.entries(layerCounts).reduce((a, [k, n]) => (Number(k) >= 3 ? a + n : a), 0),
        maxLayers: Math.max(0, ...Object.keys(layerCounts).map(Number)),
      },
    },
    sites: {
      withShadowPct: pretty(pct(sitesUsing.size, successful.length)),
      withShadowCount: sitesUsing.size,
    },
    topValuesBySitePresence: topByPresence.slice(0, 80),
    exampleTable: exampleTable.slice(0, 40),
  };

  mkdirSync(OUT, { recursive: true });
  writeFileSync(resolve(OUT, "summary.json"), JSON.stringify(summary, null, 2));

  const outCsv = resolve("public/research/box-shadow-values.csv");
  mkdirSync(dirname(outCsv), { recursive: true });
  const csvRows = ['"domain","value","declarations","kind"'];
  for (const [k, v] of values) {
    csvRows.push(`"${[...v.domains].join(" ")}","${v.raw.replace(/"/g, '""')}","${v.decls}","${v.kind}"`);
  }
  writeFileSync(outCsv, csvRows.join("\n"));

  const tsData = `// @generated by scripts/analyze-box-shadow.mjs -- do not edit by hand
export interface LayerQuantiles { min: number | null; p05: number | null; p10: number | null; p25: number | null; p50: number | null; p75: number | null; p90: number | null; p95: number | null; p99: number | null; max: number | null; mean: number | null; }
export interface BoxShadowChartData {
  sampled: number; successful: number; successRatePct: number;
  pxLayers: number; remAt16Layers: number; distinctPxValues: number;
  offsetX: LayerQuantiles; offsetY: LayerQuantiles; blur: LayerQuantiles; spread: LayerQuantiles;
  details: Record<string, number>; color: Record<string, unknown>;
  alphaBuckets: { label: string; value: number }[];
  layerOverview: { label: string; value: number; pct: number }[];
  sitesWithShadowPct: number;
  topValues: { value: string; sites: number; decls: number; kind: string }[];
  xHistogram: number[]; yHistogram: number[]; blurHistogram: number[]; spreadHistogram: number[];
}
export const boxShadowData: BoxShadowChartData = ${JSON.stringify(
    {
      sampled: summary.methodology.sampled,
      successful: summary.methodology.successful,
      successRatePct: summary.methodology.successRatePct,
      pxLayers: summary.layers.pxLayers,
      remAt16Layers: summary.layers.remAt16Layers,
      distinctPxValues: summary.declarations.distinctPxValues,
      offsetX: summary.layers.offsetX,
      offsetY: summary.layers.offsetY,
      blur: summary.layers.blur,
      spread: summary.layers.spread,
      details: summary.layers.details,
      color: summary.layers.color,
      alphaBuckets: Object.entries(summary.layers.color.alphaBuckets || {}).map(([label, value]) => ({ label, value })),
      layerOverview: [
        { label: "1 layer", value: summary.layers.perDecl.single, pct: Math.round((summary.layers.perDecl.single / summary.layers.perDecl.countedDecls) * 1000) / 10 },
        { label: "2 layers", value: summary.layers.perDecl.two, pct: Math.round((summary.layers.perDecl.two / summary.layers.perDecl.countedDecls) * 1000) / 10 },
        { label: "3+ layers", value: summary.layers.perDecl.threePlus, pct: Math.round((summary.layers.perDecl.threePlus / summary.layers.perDecl.countedDecls) * 1000) / 10 },
      ],
      sitesWithShadowPct: summary.sites.withShadowPct,
      topValues: summary.topValuesBySitePresence
        .slice(0, 25)
        .map(({ value, sites, decls, kind }) => ({ value, sites, decls, kind })),
      xHistogram: hist(new Array(40).fill(0), xArr, (v) => v + 2),
      yHistogram: hist(new Array(60).fill(0), yArr, (v) => v),
      blurHistogram: hist(new Array(50).fill(0), blurArr, (v) => v),
      spreadHistogram: hist(new Array(40).fill(0), spreadArr, (v) => v + 2),
    },
    null,
    2
  )};
`;

  writeFileSync(resolve("src/blog/boxShadowData.ts"), tsData);

  console.log("== digest ==");
  console.log("crawled", successful.length, "/ 1000, successRate", summary.methodology.successRatePct, "%");
  console.log("rows", decls.length, "deduped", declsDeduped.length, "distinct", values.size, "pxDistinct", summary.declarations.distinctPxValues);
  console.log("kinds", JSON.stringify(summary.declarations.kinds));
  console.log("stats", JSON.stringify(summary.declarations.stats));
  console.log("via", JSON.stringify(summary.layers.via));
  console.log("pxLayers", allLayers.length, "rem", remLayers.length);
  console.log("offsetY", JSON.stringify(summary.layers.offsetY));
  console.log("blur", JSON.stringify(summary.layers.blur));
  console.log("spread", JSON.stringify(summary.layers.spread));
  console.log("xZero", summary.layers.details.xZeroPct, "% yZero", summary.layers.details.yZeroPct, "% y-", summary.layers.details.yNegativePct, "% spread-", summary.layers.details.spreadNegativePct, "% inset", summary.layers.details.insetLayersPct, "%");
  console.log("achromatic", summary.layers.color.achromaticPct, "% alpha=1", summary.layers.color.alphaExact1Pct, "% alpha<=.3", summary.layers.color.alphaLe30Pct, "%");
  console.log("perDecl counts:", JSON.stringify(summary.layers.perDecl.counts));
  console.log("sites with shadow", sitesUsing.size, "of", successful.length, "=", summary.sites.withShadowPct, "%");
  console.log("top values:");
  for (const t of topByPresence.slice(0, 14)) console.log("  ", String(t.sites).padStart(3), String(t.decls).padStart(5), t.kind.padEnd(6), t.value.slice(0, 110));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});