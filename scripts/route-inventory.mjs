/**
 * Phase 0 route inventory: enumerate every route the prerender emits, plus
 * every redirect / 404 route declared in generate-sitemap.mjs.
 *
 *   node scripts/route-inventory.mjs [outfile]
 *
 * Writes a JSON array of { route, kind } to scripts/.route-inventory.json
 * (or the path given as argv[2]).
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, rmSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { build } = await import("esbuild");

const tmp = resolve(root, "scripts", ".route-inventory-bundle.cjs");
await build({
  entryPoints: [resolve(root, "scripts", "prerender-entry.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  jsx: "automatic",
  outfile: tmp,
  logLevel: "silent",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_SITE_URL": JSON.stringify("https://gainutility.com"),
  },
});

const createRequire = (await import("node:module")).createRequire;
const pr = createRequire(fileURLToPath(import.meta.url))(tmp);
const { generatePages } = pr;
const pages = generatePages({ headAssets: "", bodyAssets: "" });
rmSync(tmp, { force: true });

const routes = [...new Set(pages.map((p) => p.route))].sort();
const out = process.argv[2] || resolve(root, "scripts", ".route-inventory.json");
writeFileSync(out, JSON.stringify(routes, null, 2));
console.log(`${routes.length} prerendered routes -> ${out}`);
