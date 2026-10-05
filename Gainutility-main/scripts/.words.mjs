import { readFileSync } from "node:fs";
const files = process.argv.slice(2);
for (const f of files) {
  const h = readFileSync(f, "utf8");
  const i = h.indexOf('<div id="root"');
  const t = h
    .slice(i)
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  console.log("===", f, "words:", t.split(" ").filter(Boolean).length);
  console.log(t.slice(0, 1500));
  console.log();
}
