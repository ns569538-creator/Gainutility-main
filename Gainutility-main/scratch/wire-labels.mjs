import fs from "node:fs";

/**
 * Wires visible <label> text to the form control that follows it:
 *   label  -> htmlFor / control -> id
 * Controls with no preceding label are reported so they can be given an
 * explicit aria-label instead.
 *
 *   node scratch/wire-labels.mjs [--apply] <files...>
 */
const APPLY = process.argv.includes("--apply");
const files = process.argv.slice(process.argv.indexOf("--apply") + 1).filter((f) => !f.startsWith("--"));
const startIdx = process.argv[2] === "--apply" ? 3 : 2;
const targets = process.argv.slice(startIdx).filter((f) => !f.startsWith("--"));

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

const cleanText = (raw) => {
  let t = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/<[^>]+>/g, " ");
  // keep a single quoted string if the label is an expression like {t("x")}
  const exprs = [...t.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);
  t = t.replace(/\{[^{}]*\}/g, (m) => {
    const lit = m.match(/"([^"]{2,60})"|'([^']{2,60})'/);
    return lit ? " " + (lit[1] || lit[2]) + " " : " ";
  });
  void exprs;
  return t.replace(/\s+/g, " ").trim();
};

const readTag = (src, i) => {
  // i points at '<'; returns index just past the closing '>' (quote/brace aware)
  let inQ = null,
    depth = 0;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (inQ) {
      if (c === inQ) inQ = null;
      continue;
    }
    if (c === '"' || c === "'") inQ = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return k + 1;
  }
  return -1;
};

const controlRe = /<(input|select|textarea)\b/g;
const NAMED = /\b(aria-label|aria-labelledby|placeholder|title)\s*=/;

const files0 = targets;
const filePrefix = (f) =>
  f
    .replace(/^src\//, "")
    .replace(/\.tsx$/, "")
    .split("/")
    .pop()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

for (const file of files0) {
  const src = fs.readFileSync(file, "utf8");
  const edits = [];
  const usedIds = new Set([...src.matchAll(/\bid=\{?"([^"}]+)"/g)].map((m) => m[1]));
  const takenControls = new Set();
  let cursor = 0;
  let label;
  const labelRe = /<label\b/g;
  const pending = [];

  while ((label = labelRe.exec(src))) {
    const lStart = label.index;
    const lAttrEnd = readTag(src, lStart);
    if (lAttrEnd < 0) continue;
    const lClose = src.indexOf("</label>", lAttrEnd);
    if (lClose < 0) continue;
    const attr = src.slice(lStart, lAttrEnd);
    if (/\bhtmlFor\s*=/.test(attr)) continue;
    const text = cleanText(src.slice(lAttrEnd, lClose));
    if (!text || text.length > 70) continue;

    const searchFrom = lClose + 8;
    controlRe.lastIndex = searchFrom;
    const c = controlRe.exec(src);
    if (!c) continue;
    if (/<label\b/.test(src.slice(searchFrom, c.index))) continue;
    if (src.slice(searchFrom, c.index).indexOf("</form>") >= 0) continue;
    if (c.index - searchFrom > 700) continue;
    const cStart = c.index;
    const cEnd = readTag(src, cStart);
    if (cEnd < 0) continue;
    const cAttr = src.slice(cStart, cEnd);
    if (NAMED.test(cAttr)) continue;
    if (/\btype=\{?"hidden/.test(cAttr)) continue;
    if (/\bhidden\b/.test(cAttr) && /className="hidden/.test(cAttr)) continue;
    if (/\bid\s*=/.test(cAttr)) continue; // id exists but no label points at it
    pending.push({ lStart, lAttrEnd, lClose, text, cStart, cEnd, tag: c[1] });
  }

  for (const p of pending) {
    if (takenControls.has(p.cStart)) continue;
    takenControls.add(p.cStart);
    const prefix = filePrefix(file);
    let id = `${prefix}-${slugify(p.text)}` || `${prefix}-${p.tag}-${p.cStart}`;
    let n = 2;
    while (usedIds.has(id)) id = `${prefix}-${slugify(p.text) || p.tag}-${n++}`;
    usedIds.add(id);
    edits.push({ at: p.lAttrEnd - 1, ins: ` htmlFor="${id}"`, kind: "label" });
    edits.push({ at: p.cEnd - 1, ins: ` id="${id}"`, kind: "control", p, id });
  }

  // controls with no label at all -> report
  const orphan = [];
  controlRe.lastIndex = 0;
  let m;
  const claimed = new Set(edits.filter((e) => e.kind === "control").map((e) => e.at));
  while ((m = controlRe.exec(src))) {
    const cEnd = readTag(src, m.index);
    if (cEnd < 0) continue;
    if (claimed.has(cEnd - 1)) continue;
    const attr = src.slice(m.index, cEnd);
    if (NAMED.test(attr)) continue;
    if (/\btype=\{?"(hidden|range)/.test(attr)) continue;
    if (/\bid\s*=/.test(attr)) continue;
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    const cls = (attr.match(/className=\{?"([^"]{0,60})/) || [])[1] || "";
    orphan.push(`${file}:${line} <${m[1]}> ${cls}`);
  }

  if (APPLY && edits.length) {
    edits.sort((a, b) => b.at - a.at);
    let out = src;
    for (const e of edits) out = out.slice(0, e.at) + e.ins + out.slice(e.at);
    fs.writeFileSync(file, out);
    console.log(`${file}: wired ${edits.length / 2} labels`);
  } else {
    console.log(`${file}: ${edits.filter((e) => e.kind === "label").length} labels wireable`);
    for (const e of edits.filter((x) => x.kind === "control"))
      console.log(`    ${e.id}  <- ${e.p.text.slice(0, 50)}  [${e.p.tag}]`);
  }
  if (orphan.length) {
    console.log(`  orphan controls (${orphan.length}):`);
    for (const o of orphan) console.log(`    ${o}`);
  }
  void cursor;
}
