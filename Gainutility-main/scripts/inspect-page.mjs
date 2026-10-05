import { readFileSync } from "node:fs";
const routes = process.argv.slice(2);
for (const r of routes) {
  try {
    const h = readFileSync(`dist/client/${r}.html`, "utf8");
    const i = h.indexOf('<div id="root"');
    const full = h.slice(i).replace(/<script[\s\S]*?<\/script>/g, "");
    const t = full.replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
    const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const mt = m ? m[1].replace(/<[^>]+>/g, " ").replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim() : "(no main)";
    console.log(`--- ${r} | ssr=${/data-gu-ssr/.test(h)} | h1s=${(h.match(/<h1[^>]*>/g) || []).length} | rootWords=${t.split(" ").length} | mainWords=${mt === "(no main)" ? mt : mt.split(" ").length}`);
    console.log("MAIN:", mt.slice(0, 400));
    console.log("ROOT:", t.slice(0, 300));
  } catch (e) {
    console.log(`--- ${r} MISSING`);
  }
}
