import { build } from "esbuild";
import { writeFileSync, readFileSync, existsSync } from "fs";

const entry = `
import { toolsRegistry } from "C:/Users/nav/Downloads/premium-utility-suite (2)/src/toolsRegistry";
import { browseToolsForCategory, BROWSE_CATEGORIES, TOTAL_TOOL_COUNT } from "C:/Users/nav/Downloads/premium-utility-suite (2)/src/browseCategories";

const ids = Object.keys(toolsRegistry);
const nonAll = BROWSE_CATEGORIES.filter(c => c !== "All");

// 1. duplicate ID check
const uniq = new Set(ids);
console.log("DUPLICATE_IDS", ids.length === uniq.size ? 0 : ids.length - uniq.size);

// 2. missing category check
const missingCat = ids.filter(id => !toolsRegistry[id].category);
console.log("MISSING_CATEGORY", missingCat.length, JSON.stringify(missingCat));

// 3. fine categories not mapped to a primary bucket
import { toolsRegistry as t2 } from "C:/Users/nav/Downloads/premium-utility-suite (2)/src/toolsRegistry";

// replicate PRIMARY_BUCKET from module by importing? it's not exported. Recompute membership:
const membership = {};
for (const c of nonAll) {
  for (const id of browseToolsForCategory(c)) {
    (membership[id] ??= []).push(c);
  }
}
const multi = Object.entries(membership).filter(([,cs]) => cs.length > 1);
console.log("MULTI_CATEGORY_TOOLS", multi.length);
for (const [id, cs] of multi) console.log("MULTI", id, cs.join(","));

// any tool with zero category membership (should be only if fine category unmapped)
const zero = ids.filter(id => !membership[id]);
console.log("ZERO_CATEGORY_MEMBERSHIP", zero.length, JSON.stringify(zero));

// sum of categories vs all
const sum = nonAll.reduce((a,c)=>a+browseToolsForCategory(c).length,0);
console.log("SUM_NON_ALL", sum);
console.log("ALL_UNIQUE", TOTAL_TOOL_COUNT);
`;

writeFileSync("C:/Users/nav/AppData/Local/Temp/opencode/val-browse-entry.ts", entry);

await build({
  entryPoints: ["C:/Users/nav/AppData/Local/Temp/opencode/val-browse-entry.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "C:/Users/nav/AppData/Local/Temp/opencode/val-browse-out.mjs",
  jsx: "automatic",
  logLevel: "error",
});

const { execSync } = await import("child_process");
console.log(execSync("node C:/Users/nav/AppData/Local/Temp/opencode/val-browse-out.mjs", { encoding: "utf-8" }));
