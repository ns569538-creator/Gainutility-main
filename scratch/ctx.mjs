import fs from "node:fs";
const file = process.argv[2];
const lines = process.argv.slice(3).map(Number);
const L = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (const n of lines) {
  console.log(`\n===== ${n} =====`);
  for (let i = Math.max(0, n - 12); i <= Math.min(L.length - 1, n + 6); i++)
    console.log(`${i + 1 === n ? ">>" : "  "} ${i + 1}: ${L[i]}`);
}
