import fs from "node:fs";
const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");
const labelFor = new Set([...src.matchAll(/<label[^>]*\bhtmlFor=\{?"([^"}]+)"/g)].map((m) => m[1]));
console.log("labelFor sample:", [...labelFor].slice(0, 5));
const tagRe = /<(input|select|textarea)\b/g;
let m;
let n = 0;
while ((m = tagRe.exec(src))) {
  const start = m.index;
  const end = src.indexOf("/>", start);
  const endGt = src.indexOf(">", start);
  const stop = end >= 0 && (endGt < 0 || end < endGt) ? end : endGt;
  const attr = src.slice(start, stop < 0 ? start + 600 : stop + 2);
  const line = src.slice(0, start).split(/\r?\n/).length;
  const id = (attr.match(/\bid=\{?"([^"}]+)/) || [])[1] || "";
  if (n++ > 6 && line > 330) break;
  console.log(line, "id=", id, "byFor=", !!(id && labelFor.has(id)), "has=", /\b(aria-label|aria-labelledby|placeholder|title)\s*=/.test(attr));
}
