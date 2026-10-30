import fs from "node:fs";

/**
 * Inserts aria-label="..." into the form control that starts on a given line.
 *   node scratch/apply-aria.mjs scratch/aria-map.json
 */
const map = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
let total = 0;
for (const [file, entries] of Object.entries(map)) {
  const src = fs.readFileSync(file, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);
  const offsets = [];
  let acc = 0;
  for (const l of lines) {
    offsets.push(acc);
    acc += l.length + eol.length;
  }
  const edits = [];
  for (const [line, label] of entries) {
    const text = lines[line - 1];
    const m = text && text.match(/<(input|select|textarea)\b/);
    if (!m) {
      console.log(`!! ${file}:${line} no control tag -> ${JSON.stringify(text).slice(0, 80)}`);
      continue;
    }
    if (/\baria-label=/.test(text)) {
      console.log(`.. ${file}:${line} already labelled`);
      continue;
    }
    const at = offsets[line - 1] + m.index + m[0].length;
    edits.push({ at, ins: ` aria-label="${label}"` });
  }
  if (!edits.length) continue;
  let out = src;
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.ins + out.slice(e.at);
  fs.writeFileSync(file, out);
  total += edits.length;
  console.log(`${file}: +${edits.length}`);
}
console.log(`total ${total}`);
