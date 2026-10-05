import fs from "node:fs";
const app = fs.readFileSync("src/App.tsx", "utf8");
const slugs = process.argv.slice(2);
for (const slug of slugs) {
  const i = app.indexOf('case "' + slug + '"');
  if (i < 0) { console.log(slug.padEnd(34), "(no case)"); continue; }
  const seg = app.slice(i, i + 500);
  const m = seg.match(/<([A-Za-z0-9_.]+)/);
  const comp = m ? m[1] : "?";
  const re = new RegExp("const " + comp + " = React\\.lazy\\([\\s\\S]{0,120}?import\\(\"([^\"]+)\"\\)");
  const lm = app.match(re);
  console.log(slug.padEnd(34), comp.padEnd(28), lm ? lm[1] : "(not lazy)");
}
