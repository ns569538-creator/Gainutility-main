import fs from "node:fs";
const file = process.argv[2];
const pat = process.argv[3];
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes(pat)) console.log(i + 1 + ": " + l.trim());
});
