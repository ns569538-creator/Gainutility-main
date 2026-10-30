import fs from "node:fs";
const file = process.argv[2];
const needle = process.argv[3];
const src = fs.readFileSync(file, "utf8");
const i = src.indexOf(needle);
console.log(JSON.stringify(src.slice(i, i + 600)));
