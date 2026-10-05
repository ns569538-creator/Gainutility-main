import { build } from "esbuild";
import { pathToFileURL } from "url";
import { writeFileSync } from "fs";

const entry = `
import { toolsRegistry } from "C:/Users/nav/Downloads/premium-utility-suite (2)/src/toolsRegistry";
import { browseToolsForCategory, BROWSE_CATEGORIES, TOTAL_TOOL_COUNT } from "C:/Users/nav/Downloads/premium-utility-suite (2)/src/browseCategories";

const ids = Object.keys(toolsRegistry);
console.log("UNIQUE_REGISTRY_TOOLS", ids.length);
console.log("TOTAL_TOOL_COUNT", TOTAL_TOOL_COUNT);

for (const c of BROWSE_CATEGORIES) {
  const list = browseToolsForCategory(c);
  console.log("CAT", c, list.length, JSON.stringify(list));
}

// category membership of each registry tool by its fine category
const byFine = {};
for (const id of ids) {
  const meta = toolsRegistry[id];
  if (!meta) continue;
  (byFine[meta.category] ??= []).push(id);
}
console.log("FINE_CATEGORIES");
for (const [k,v] of Object.entries(byFine)) {
  console.log("FINE", k, v.length);
}
`;

writeFileSync("C:/Users/nav/AppData/Local/Temp/opencode/count-browse-entry.ts", entry);

const result = await build({
  entryPoints: ["C:/Users/nav/AppData/Local/Temp/opencode/count-browse-entry.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "C:/Users/nav/AppData/Local/Temp/opencode/count-browse-out.mjs",
  jsx: "automatic",
  logLevel: "error",
});

const { execSync } = await import("child_process");
const out = execSync("node C:/Users/nav/AppData/Local/Temp/opencode/count-browse-out.mjs", { encoding: "utf-8" });
console.log(out);
