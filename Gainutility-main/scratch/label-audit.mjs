import fs from "node:fs";

/* Flags form controls that have no accessible name the way qa-cdp does:
   label[for], wrapping <label>, aria-label, aria-labelledby, placeholder, title. */

const readTag = (src, i) => {
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

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, "utf8");
  const labelFor = new Set([...src.matchAll(/<label[^>]*\bhtmlFor=\{?"([^"}]+)"/g)].map((m) => m[1]));
  const tagRe = /<(input|select|textarea)\b/g;
  let m;
  while ((m = tagRe.exec(src))) {
    const start = m.index;
    const stop = readTag(src, start);
    if (stop < 0) continue;
    const attr = src.slice(start, stop);
    if (/\btype=\{?"hidden/.test(attr)) continue;
    const line = src.slice(0, start).split(/\r?\n/).length;
    const cls = (attr.match(/className=\{?"([^"]{0,70})/) || [])[1] || "";
    const type = (attr.match(/\btype=\{?"([^"}]+)/) || [])[1] || "";
    const id = (attr.match(/\bid=\{?"([^"}]+)/) || [])[1] || "";
    const has =
      /\baria-label=/.test(attr) ||
      /\baria-labelledby=/.test(attr) ||
      /\bplaceholder=/.test(attr) ||
      /\btitle=/.test(attr);
    const wrapping = /<label[^>]*>[\s\S]{0,6000}?$/.test(src.slice(0, start).split(/<\/label>/).pop());
    const byFor = id && labelFor.has(id);
    if (has || wrapping || byFor) continue;
    if (/className="[^"]*\bhidden\b/.test(attr)) continue;
    console.log(`${file}:${line}  <${m[1]}${type ? " type=" + type : ""}>  ${cls}`);
  }
}
