/**
 * Static prerender runner. Run AFTER `vite build`:
 *   node scripts/prerender.mjs
 * Bundles scripts/prerender-entry.ts with esbuild, then writes one flat
 * dist/<route>.html file per route plus dist/index.html and dist/404.html.
 *
 * Flat .html files (instead of dist/<route>/index.html directories) make every
 * public URL serve HTTP 200 directly on classic Cloudflare Pages (which serves
 * `foo.html` at the extensionless `/foo` path), so the sitemap's non-slash
 * canonical URLs never hit a 308 redirect chain.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
// The @cloudflare/vite-plugin places client assets in dist/client/.
// Prerendered HTML must live alongside those assets so Workers Assets
// can serve them directly (the generated wrangler.json sets
// assets.directory to "../client" relative to dist/gainutility/).
const clientDir = resolve(dist, "client");
const tmpOut = resolve(root, "scripts", ".prerender-bundle.cjs");

// Vite (with the Cloudflare plugin) emits the client build under
// dist/client/index.html. That file holds the production asset tags the
// prerendered documents must include, so we read it from there.
const builtIndex = resolve(clientDir, "index.html");
if (!readFileSync(builtIndex, "utf8")) {
  throw new Error("dist/client/index.html missing — run `vite build` first");
}
const builtHtml = readFileSync(builtIndex, "utf8");

// Pull vite's emitted asset tags out of the built index.html
const headAssets = [
  ...builtHtml.matchAll(/<link\s+rel="(stylesheet|modulepreload)"[^>]*>/g),
].map((m) => m[0]);
const bodyAssets = [
  ...builtHtml.matchAll(/<script\s+type="module"[^>]*><\/script>/g),
].map((m) => m[0]);

if (headAssets.length === 0 || bodyAssets.length === 0) {
  throw new Error("Could not extract vite asset tags from dist/index.html");
}

const esbuild = await import("esbuild");

// NOTE: the bundle is CJS (not ESM) so that react-dom/server's Node
// `require` of builtins (util, etc.) resolves natively at runtime. The SSR
// home route is rendered from the REAL React tree inside prerender-entry.ts.
await esbuild.build({
  entryPoints: [resolve(root, "scripts", "prerender-entry.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  jsx: "automatic",
  outfile: tmpOut,
  logLevel: "silent",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_SITE_URL": JSON.stringify(process.env.VITE_SITE_URL || ""),
  },
});

const pr = createRequire(fileURLToPath(import.meta.url))(tmpOut);
const { generatePages } = pr;
const pages = generatePages({
  headAssets: headAssets.join("\n"),
  bodyAssets: bodyAssets.join("\n"),
});

let written = 0;
for (const { route, html } of pages) {
  // Root and 404 keep conventional index/404 names; every other route is a
  // flat "<route>.html" file whose extensionless path classic Cloudflare Pages
  // serves with HTTP 200 — matching the sitemap/canonical non-slash URLs.
  let filePath;
  if (route === "/") filePath = resolve(clientDir, "index.html");
  else if (route === "/404") filePath = resolve(clientDir, "404.html");
  else filePath = resolve(clientDir, `${route.slice(1)}.html`);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
  written++;
}

rmSync(tmpOut, { force: true });
console.log(`prerender: wrote ${written} HTML files (${pages.length - 1} routes + 404)`);
