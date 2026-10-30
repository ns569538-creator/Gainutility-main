/**
 * Builds FINAL-INDEXATION-CLASSIFICATION.csv (+ prints summary) from
 * INDEX-READY.csv using the Phase 1 B1–B4 review decisions.
 * Run: node scripts/build-final-classification.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("INDEX-READY.csv", "utf8").replace(/^﻿/, "");

/** Minimal CSV parser (quotes + embedded commas/newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const parsed = parseCsv(src).filter((r) => r.length > 1);
const header = parsed[0];
const data = parsed.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));

const LOC_RE = /^\/(pt-br|de|fr|it|id|es-mx)\//;
const STUDIO_COLOR_RE = /^\/studios\/color\//;
const CLASSIC_REDIRECTS = new Set(["/tools/json-compare", "/tools/json-formatter", "/tools/json-viewer"]);

const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

/**
 * Phase 1 decisions:
 *  B1 keep indexable          → INDEX
 *  B2 needs improvement       → IMPROVE THEN INDEX
 *  B3 consolidate             → CONSOLIDATE
 *  B4 weak / exclude          → EXCLUDE
 */
function classify(r) {
  const url = r.URL;
  const cls = r.Classification;
  const type = r["Page type"];
  const dup = r["Duplicate risk"];

  if (cls === "A") {
    return { sub: "A", decision: "INDEX", status: "READY", quality: "Strong", seo: "Pass", reason: "Prior A-class: unique content, in sitemap, technical clean", action: "Keep" };
  }
  if (cls === "D" || url === "/404") {
    return { sub: "D", decision: "EXCLUDE", status: "EXCLUDED", quality: "N/A", seo: "Noindex intentional", reason: "Error shell", action: "Keep noindex, out of sitemap" };
  }
  if (cls === "C") {
    if (STUDIO_COLOR_RE.test(url)) {
      return { sub: "C", decision: "EXCLUDE", status: "EXCLUDED", quality: "Thin programmatic", seo: "Duplicate H1 studio section", reason: "Studio color section — duplicate H1, not in sitemap", action: "Stay out of sitemap; optional H1 fix" };
    }
    if (CLASSIC_REDIRECTS.has(url)) {
      return { sub: "C", decision: "REDIRECT", status: "REDIRECTED", quality: "N/A", seo: "301 to successor", reason: "Classic JSON tool — single-hop 301 already deployed", action: "No change (redirect live)" };
    }
    return { sub: "C", decision: "CONSOLIDATE", status: "NEEDS WORK", quality: "Overlap", seo: "Duplicate intent", reason: r.Reason || "Overlap", action: "Canonical/merge into primary" };
  }
  // B
  if (type === "translator-pair") {
    return { sub: "B2", decision: "IMPROVE THEN INDEX", status: "NEEDS IMPROVEMENT", quality: "Thin SSR (H1-only main)", seo: "Indexable, thin prerender", reason: "Translator pair: prerendered <main> is H1-only (Suspense body)", action: "SSR pair body (useCases/FAQ) or fold into /tools/pdf-translator" };
  }
  if (LOC_RE.test(url)) {
    return { sub: "B2", decision: "IMPROVE THEN INDEX", status: "NEEDS IMPROVEMENT", quality: "Partial locale (H1/UI localized, long-form body English)", seo: "Indexable; unique score avg 62", reason: "Localized tool page: page chrome localized but tool SEO body remains English — human-review localization blocker", action: "Localize body copy (or noindex until done) — human review required" };
  }
  if (type === "tool" && dup && dup !== "Low") {
    return { sub: "B2", decision: "IMPROVE THEN INDEX", status: "NEEDS IMPROVEMENT", quality: `Adequate (uniq ${r["Unique content score"]})`, seo: "Pass", reason: `EN tool with Medium duplicate risk — needs intent differentiation vs hub/alias siblings (uniq ${r["Unique content score"]})`, action: "Differentiate intro/examples vs hub + siblings; re-check after" };
  }
  if (type === "tool") {
    return { sub: "B1", decision: "INDEX", status: "READY", quality: `Good (uniq ${r["Unique content score"]}, mainWords ${r["Main words"]})`, seo: "Pass", reason: "EN tool: steps/limitations in DOM, How-to/Limitations present, low duplicate risk", action: "Keep in sitemap" };
  }
  if (type === "hub-or-subpage" || type === "best" || type === "compare" || type === "other" || type === "landing") {
    // EN hub/compare/best/creator sub-review (localized others already handled above)
    if (type === "compare") {
      return { sub: "B1", decision: "INDEX", status: "READY", quality: `Good (uniq ${r["Unique content score"]})`, seo: "Pass", reason: "Comparison page: unique title/intent, low overlap", action: "Keep in sitemap" };
    }
    if (type === "best") {
      return { sub: "B1", decision: "INDEX", status: "READY", quality: `Acceptable (uniq ${r["Unique content score"]})`, seo: "Pass", reason: "Category best list: distinct commercial-implant intent", action: "Keep in sitemap; optional depth pass" };
    }
    if (type === "landing" || url === "/creator") {
      return { sub: "B1", decision: "INDEX", status: "READY", quality: `Good (uniq ${r["Unique content score"]})`, seo: "Pass", reason: "Creator landing: unique hub, in sitemap", action: "Keep in sitemap" };
    }
    return { sub: "B1", decision: "INDEX", status: "READY", quality: `Good (uniq ${r["Unique content score"]})`, seo: "Pass", reason: "Hub/SEO subpage: unique hub intent vs tool pages, low duplicate risk", action: "Keep in sitemap" };
  }
  return { sub: "B2", decision: "IMPROVE THEN INDEX", status: "NEEDS IMPROVEMENT", quality: "Unclassified B", seo: "Review", reason: r.Reason || "B default", action: "Manual review" };
}

const outHeader = [
  "URL", "STATUS", "INDEXATION DECISION", "CONTENT QUALITY", "DUPLICATE RISK",
  "UX STATUS", "SEO STATUS", "REASON", "ACTION",
  "Prior class", "B subclass", "Page type", "In sitemap",
];

const outRows = [];
const tally = { decision: {}, sub: {}, status: {} };

for (const r of data) {
  const c = classify(r);
  tally.decision[c.decision] = (tally.decision[c.decision] || 0) + 1;
  tally.sub[c.sub] = (tally.sub[c.sub] || 0) + 1;
  tally.status[c.status] = (tally.status[c.status] || 0) + 1;
  outRows.push([
    r.URL,
    c.status,
    c.decision,
    c.quality,
    r["Duplicate risk"] || "n/a",
    "Functional (prior QA); no browser re-test this pass",
    c.seo,
    c.reason,
    c.action,
    r.Classification,
    c.sub,
    r["Page type"],
    r["In sitemap"],
  ]);
}

const csv = [outHeader, ...outRows].map((row) => row.map(esc).join(",")).join("\r\n") + "\r\n";
writeFileSync("FINAL-INDEXATION-CLASSIFICATION.csv", csv, "utf8");

console.log(`Wrote FINAL-INDEXATION-CLASSIFICATION.csv — ${outRows.length} rows`);
console.log("Decision:", tally.decision);
console.log("B subclass:", tally.sub);
console.log("Status:", tally.status);
