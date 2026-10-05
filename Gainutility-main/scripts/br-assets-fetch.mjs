/**
 * Downloads the BEN2 model + ONNX Runtime WASM kernels needed for browser-side
 * background removal into `.cache/br-assets/` (git-ignored). Safe to re-run —
 * files that already exist are skipped so builds stay fast.
 *
 *   node scripts/br-assets-fetch.mjs [--with-fp32]
 *
 * Run this before `br-assets-upload` to populate the R2 bucket.
 */

import { createWriteStream, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(ROOT, "..", ".cache", "br-assets");

const ASSETS = [
  {
    key: "ben2/onnx/model_fp16.onnx",
    url: "https://huggingface.co/onnx-community/BEN2-ONNX/resolve/main/onnx/model_fp16.onnx",
    description: "BEN2 fp16 segmentation model (WebGPU + WASM)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.wasm",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.wasm",
    description: "ONNX Runtime WASM kernels (CPU execution provider)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.mjs",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.mjs",
    description: "ONNX Runtime WASM glue (module)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.jsep.wasm",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.jsep.wasm",
    description: "ONNX Runtime WASM kernels (WebGPU JSEP)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.jsep.mjs",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.jsep.mjs",
    description: "ONNX Runtime JSEP glue (module)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.jspi.wasm",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.jspi.wasm",
    description: "ONNX Runtime WASM kernels (JSPI variant)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.jspi.mjs",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.jspi.mjs",
    description: "ONNX Runtime JSPI glue (module)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.asyncify.wasm",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.asyncify.wasm",
    description: "ONNX Runtime WASM kernels (asyncify variant)",
  },
  {
    key: "ort-wasm/ort-wasm-simd-threaded.asyncify.mjs",
    url: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/ort-wasm-simd-threaded.asyncify.mjs",
    description: "ONNX Runtime asyncify glue (module)",
  },
];

const includeFp32 = process.argv.includes("--with-fp32");

if (includeFp32) {
  ASSETS.push({
    key: "ben2-fp32/onnx/model.onnx",
    url: "https://huggingface.co/Pezhgorski/BEN2-FP32-ONNX/resolve/main/onnx/model.onnx",
    description: "BEN2 fp32 segmentation model (WASM-only devices)",
  });
}

async function download(url, outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Download failed for ${url}: HTTP ${response.status}`);
  }
  if (!response.body) throw new Error(`No body for ${url}`);

  const file = createWriteStream(outputPath);
  const reader = response.body.getReader();
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    file.write(Buffer.from(value));
    bytes += value.length;
    process.stdout.write(`\r  ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  }
  file.end();
  await new Promise((resolve, reject) => {
    file.on("finish", resolve);
    file.on("error", reject);
  });
  process.stdout.write("\n");
}

let totalFetched = 0;
let totalSkipped = 0;

for (const asset of ASSETS) {
  const outputPath = join(CACHE_DIR, asset.key);
  console.log(`\n[${asset.description}]`);
  if (existsSync(outputPath) && (await statSize(outputPath)) > 0) {
    console.log(`  exists — skipping (${formatSize(await statSize(outputPath))})`);
    totalSkipped++;
    continue;
  }
  try {
    await download(asset.url, outputPath);
    console.log(`  saved ${asset.key}`);
    totalFetched++;
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    process.exitCode = 1;
  }
}

async function statSize(p) {
  const { stat } = await import("node:fs/promises");
  return (await stat(p)).size;
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

console.log(`\nDone. Fetched ${totalFetched}, skipped ${totalSkipped}.`);
if (totalFetched > 0) {
  console.log(`\nNext: node scripts/br-assets-upload.mjs${includeFp32 ? " --with-fp32" : ""}`);
}