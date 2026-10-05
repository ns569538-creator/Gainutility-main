import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync("scripts/url-inventory.json", "utf8"));

// 1. inbound links (orphans)
const inbound = {};
for (const r of rows) {
  for (const a of r._anchors || []) inbound[a] = (inbound[a] || 0) + 1;
}
console.log("no anchors field (re-run url-inventory)");
