import fs from "node:fs";

/**
 * Proposes aria-label for unlabelled form controls from the nearest preceding
 * sibling heading (<span>/<label>/<h4>/<strong>) or a wrapping Card title.
 * Report by default; --apply inserts.
 *
 *   node scratch/wire-aria.mjs [--apply] <files...>
 */
const APPLY = process.argv.includes("--apply");
const startIdx = process.argv[2] === "--apply" ? 3 : 2;
const files = process.argv.slice(startIdx).filter((f) => !f.startsWith("--"));

const readTag = (src, i) => {
  let quote = null;
  let depth = 0;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return k + 1;
  }
  return -1;
};

const clean = (raw) => {
  let t = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/<[^>]+>/g, " ");
  t = t.replace(/\{[^{}]*\}/g, (m) => {
    const lit = m.match(/"([^"]{2,60})"/);
    return lit ? " " + lit[1] + " " : " ";
  });
  return t.replace(/\s+/g, " ").trim();
};

const HEAD = /<\/(span|label|h1|h2|h3|h4|h5|strong|b)>/g;
const CTRL = /<(input|select|textarea)\b/;
const NAMED = /(\baria-label|\baria-labelledby|\bplaceholder|\btitle)\s*=/;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const labelFor = new Set(
    [...src.matchAll(/<label[^>]*htmlFor=\{?"([^"}]+)"/g)].map((m) => m[1])
  );
  const proposals = [];
  const tagRe = /<(input|select|textarea)\b/g;
  let m;
  while ((m = tagRe.exec(src))) {
    const start = m.index;
    const stop = readTag(src, start);
    if (stop < 0) continue;
    const attr = src.slice(start, stop);
    if (NAMED.test(attr)) continue;
    if (attr.includes('type="hidden')) continue;
    if (/className="[^"]*\bhidden\b/.test(attr)) continue;
    const id = (attr.match(/\bid=\{?"([^"}]+)/) || [])[1] || "";
    if (id && labelFor.has(id)) continue;
    const wrapping = /<label[^>]*>[\s\S]{0,6000}?$/.test(
      src.slice(0, start).split(/<\/label>/).pop()
    );
    if (wrapping) continue;

    const before = src.slice(Math.max(0, start - 1400), start);
    if (CTRL.test(before)) continue;

    let text = "";
    let how = "";
    HEAD.lastIndex = 0;
    let h;
    let best = null;
    while ((h = HEAD.exec(before))) best = h;
    if (best) {
      const openIdx = before.lastIndexOf("<" + best[1], best.index);
      if (openIdx >= 0) {
        const openEnd = readTag(before, openIdx);
        const raw = before.slice(openEnd, best.index);
        if (raw.indexOf("<") < 0) {
          text = clean(raw);
          how = "<" + best[1] + ">";
        }
      }
    }
    if (!text) {
      const t = [...before.matchAll(/\btitle="([^"]{2,60})"/g)].pop();
      if (t) {
        text = t[1];
        how = "title=";
      }
    }
    if (!text || text.length > 60) continue;
    const line = src.slice(0, start).split(/\r?\n/).length;
    proposals.push({ start, tag: m[1], line, text, how });
  }

  if (!proposals.length) continue;
  console.log("\n" + file);
  for (const p of proposals)
    console.log("  " + p.line + "  <" + p.tag + '>  "' + p.text + '"   (' + p.how + ")");
  if (APPLY) {
    let out = src;
    for (const p of [...proposals].sort((a, b) => b.start - a.start)) {
      const ins = "<" + p.tag + ' aria-label="' + p.text.replace(/"/g, "'") + '"';
      out = out.slice(0, p.start) + ins + out.slice(p.start + p.tag.length + 1);
    }
    fs.writeFileSync(file, out);
    console.log("  -> applied " + proposals.length);
  }
}
