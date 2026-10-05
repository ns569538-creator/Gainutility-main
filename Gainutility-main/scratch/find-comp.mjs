import fs from "node:fs";
import path from "node:path";
const comps = fs.readFileSync(0, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) files.push(p);
  }
})("src");
const out = {};
for (const c of comps) {
  const hit = files.find((f) => {
    const s = fs.readFileSync(f, "utf8");
    return new RegExp("(export )?const " + c + "[^a-zA-Z0-9]").test(s) || new RegExp("function " + c + "[^a-zA-Z0-9]").test(s);
  });
  out[c] = hit || "(not found)";
}
for (const [c, f] of Object.entries(out)) console.log(c.padEnd(30), f);
