import fs from "node:fs";

const lines = fs.readFileSync("src/blog/blogData.ts", "utf8").split(/\r?\n/);
const targets = [
  "how-to-make-a-transparent-png",
  "how-to-compress-an-image",
  "format-and-debug-json-when-api-responses-are-unreadable",
  "are-online-pdf-tools-safe",
  "write-seo-title-and-meta-description-in-twenty-minutes",
];
let cur = null;
for (let i = 0; i < lines.length; i++) {
  const sl = lines[i].match(/slug:\s*"([a-z0-9-]+)"/);
  if (sl) cur = sl[1];
  if (/relatedArticles:/.test(lines[i]) && targets.includes(cur)) {
    console.log(`--- ${cur} @${i + 1}`);
    for (let j = i; j < Math.min(i + 8, lines.length); j++) console.log(`${j + 1}: ${lines[j]}`);
  }
}
