import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(".cache/qa-tools2.json", "utf8"));
const fails = data.results.filter((r) => r.level === "FAIL" && r.check.startsWith("touch targets"));
const agg = {};
for (const f of fails) {
  const route = f.check.match(/: (\/\S+) @/)[1];
  const [failPart] = String(f.detail).split("|");
  const items = failPart.replace(/^AA\(<24px\):\s*/, "").split(",").map((s) => s.trim()).filter(Boolean);
  const seen = {};
  for (const it of items) {
    const cls = it.replace(/\s+\d+x\d+$/, "");
    seen[cls] = (seen[cls] || 0) + 1;
  }
  agg[route] = seen;
}
for (const [route, items] of Object.entries(agg)) {
  console.log("\n" + route);
  for (const [cls, n] of Object.entries(items)) console.log("   " + n + "x  " + cls);
}
