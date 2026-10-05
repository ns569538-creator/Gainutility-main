import { readFileSync } from "node:fs";
const src = readFileSync("src/toolsRegistry.tsx", "utf8");
const re = /"([\w-]+)":\s*\{\s*name:\s*"([^"]+)",\s*desc:\s*"([^"]*)"/g;
let m;
const out = [];
while ((m = re.exec(src))) out.push([m[1], m[2], m[3]]);
console.log("parsed", out.length);
const mode = process.argv[2] || "names";
for (const [id, name, desc] of out) {
  if (mode === "names") console.log(`${id} || ${name} || ${desc}`);
  else console.log(id);
}
