import fs from "node:fs";

/* Repairs the self-closing tag damage from wire-labels: `/ id="x">` -> ` id="x"/>` */
const files = process.argv.slice(2);
let total = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const out = src.replace(/ \/ id="([^"]*)">/g, ' id="$1"/>');
  const n = (src.match(/ \/ id="/g) || []).length;
  if (n) {
    fs.writeFileSync(f, out);
    total += n;
    console.log(`${f}: fixed ${n}`);
  }
}
console.log(`total ${total}`);
