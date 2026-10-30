/**
 * Uploads `.cache/br-assets/**` to an R2 bucket so the background remover can
 * be fully self-hosted (no third-party CDNs).
 *
 * Usage:
 *   npm run br-assets:sync            # min: fp16 model + WASM kernels
 *   npm run br-assets:sync -- --with-fp32
 *
 * One-time setup:
 *   1. wrangler r2 bucket create gainutility-models
 *   2. In your Pages project settings: Settings > Bindings > R2, add a binding
 *      named `MODEL_ASSETS` → bucket `gainutility-models` (Production + Preview).
 *   3. Authenticate wrangler (`wrangler login`) and upload with this script.
 */

import { promises as fs } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(ROOT, "..", ".cache", "br-assets");
const BUCKET = "gainutility-models";

async function listFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full, base)));
    } else if (entry.isFile()) {
      files.push({ full, rel: relative(base, full).replaceAll("\\", "/") });
    }
  }
  return files;
}

function contentTypeFor(key) {
  if (key.endsWith(".wasm")) return "application/wasm";
  if (key.endsWith(".onnx")) return "application/octet-stream";
  if (key.endsWith(".mjs") || key.endsWith(".js")) return "text/javascript";
  return "application/octet-stream";
}

let failed = false;

for (const { full, rel } of await listFiles(CACHE_DIR)) {
  const contentType = contentTypeFor(rel);
  const args = [
    "wrangler",
    "r2",
    "object",
    "put",
    `${BUCKET}/${rel}`,
    `--file=${full}`,
    `--content-type=${contentType}`,
  ];

  console.log(`\nUploading ${rel} (${contentType})...`);
  const res = spawnSync("npx", args, { stdio: ["inherit", "inherit", "inherit"], shell: process.platform === "win32" });
  if (res.status !== 0) failed = true;
}

if (failed) {
  console.error("\nOne or more uploads failed. Check wrangler auth and the bucket name.");
  process.exit(1);
}

console.log(`\nDone. Files uploaded to r2://${BUCKET}.`);
console.log("\nVerify reachability at:");
console.log("  /api/br-assets/ben2/onnx/model_fp16.onnx");
console.log("  /api/br-assets/ort-wasm/ort-wasm-simd-threaded.wasm");
console.log("\nThe client falls back to public CDNs automatically if these 404.");