import fs from "node:fs";
const qa = JSON.parse(fs.readFileSync(".cache/qa-tools2.json", "utf8"));
const fails = qa.results.filter(
  (x) => !x.ok && x.level === "FAIL" && (x.check.includes("form fields") || x.check.includes("accessible names"))
);
const bySlug = {};
for (const f of fails) {
  const slug = f.check.split(":")[1].split(" @")[0].trim().replace("/tools/", "");
  (bySlug[slug] ||= []).push(f);
}
const app = fs.readFileSync("src/App.tsx", "utf8");
const grouped = {};
for (const slug of Object.keys(bySlug)) {
  let comp = "(no match)";
  const i = app.indexOf('case "' + slug + '"');
  if (i >= 0) {
    const seg = app.slice(i, i + 400);
    const mm = seg.match(/<([A-Za-z0-9_.]+)/);
    if (mm) comp = mm[1];
  }
  (grouped[comp] ||= []).push(slug);
}
for (const [c, slugs] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
  console.log(String(slugs.length).padStart(3), c.padEnd(32), slugs.join(", "));
}
