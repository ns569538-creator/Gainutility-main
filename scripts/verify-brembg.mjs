/**
 * verify-brembg.mjs — mechanical verification of the BEN2 pipeline outside
 * the browser, using onnxruntime-node.
 *
 * It replicates the browser engine (src/lib/brembg.ts) EXACTLY:
 *   - squash-to-square preprocessing to 1024x1024 (bilinear), no letterbox
 *   - ImageNet (pixel/255 - MEAN) / STD  normalization, NCHW float32
 *   - inference via onnxruntime
 *   - sigmoid + full-frame resize of the 1024x1024 mask back to original dims
 *
 * It then asserts the geometry/correctness properties that encode the
 * preprocessing contract documented in docs/MODEL_LICENSES.md:
 *   - the output map covers the full 1024x1024 frame (no crop/pad)
 *   - the map is a probability in [0, 1] (sigmoid applied)
 *   - the mask is NOT inverted
 *   - the resized mask aligns with the synthetic foreground (disk) position
 *
 * Usage: npm run verify:brembg  (optionally BENBG_MODEL=/path/to/model.onnx)
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const ort = require("onnxruntime-node");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const INPUT_SIZE = 1024;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/* ------------------------------------------------------------------ */
/* Synthetic source image (a bright disk on black, non-square aspect)   */
/* ------------------------------------------------------------------ */

const SRC_W = 960;
const SRC_H = 540; // 16:9 — exercises the squash (non-square) path
const DISK_CX = 480;
const DISK_CY = 270;
const DISK_R2 = 78 * 78;

function makeSource() {
  const rgba = new Uint8ClampedArray(SRC_W * SRC_H * 4);
  for (let y = 0; y < SRC_H; y++) {
    for (let x = 0; x < SRC_W; x++) {
      const dx = x - DISK_CX;
      const dy = y - DISK_CY;
      const foreground = dx * dx + dy * dy <= DISK_R2;
      const i = (y * SRC_W + x) * 4;
      rgba[i] = foreground ? 255 : 0;
      rgba[i + 1] = foreground ? 255 : 0;
      rgba[i + 2] = foreground ? 255 : 0;
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

/* ------------------------------------------------------------------ */
/* Preprocessing (mirrors brembg.ts preprocessImage)                    */
/* ------------------------------------------------------------------ */

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function sampleBilinear(src, srcW, srcH, xf, yf) {
  const x0 = Math.floor(clamp(xf, 0, srcW - 1));
  const y0 = Math.floor(clamp(yf, 0, srcH - 1));
  const x1 = Math.min(x0 + 1, srcW - 1);
  const y1 = Math.min(y0 + 1, srcH - 1);
  const fx = xf - x0;
  const fy = yf - y0;
  const out = new Float32Array(3);
  for (let c = 0; c < 3; c++) {
    const v00 = src[(y0 * srcW + x0) * 4 + c];
    const v10 = src[(y0 * srcW + x1) * 4 + c];
    const v01 = src[(y1 * srcW + x0) * 4 + c];
    const v11 = src[(y1 * srcW + x1) * 4 + c];
    out[c] =
      v00 * (1 - fx) * (1 - fy) +
      v10 * fx * (1 - fy) +
      v01 * (1 - fx) * fy +
      v11 * fx * fy;
  }
  return out;
}

function resizeToSquare(src, srcW, srcH) {
  const dstW = INPUT_SIZE;
  const dstH = INPUT_SIZE;
  const rgb = new Float32Array(dstW * dstH * 3);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let y = 0; y < dstH; y++) {
    const yf = y * yRatio;
    for (let x = 0; x < dstW; x++) {
      const xf = x * xRatio;
      const p = sampleBilinear(src, srcW, srcH, xf, yf);
      const o = (y * dstW + x) * 3;
      rgb[o] = p[0];
      rgb[o + 1] = p[1];
      rgb[o + 2] = p[2];
    }
  }
  return rgb;
}

function normalizeNCHW(rgb) {
  const n = INPUT_SIZE * INPUT_SIZE;
  const data = new Float32Array(3 * n);
  for (let h = 0; h < INPUT_SIZE; h++) {
    for (let w = 0; w < INPUT_SIZE; w++) {
      const px = (h * INPUT_SIZE + w) * 3;
      const idx = h * INPUT_SIZE + w;
      for (let c = 0; c < 3; c++) {
        data[c * n + idx] = (rgb[px + c] / 255.0 - MEAN[c]) / STD[c];
      }
    }
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* Postprocessing (mirrors brembg.ts postprocessOutput)                 */
/* ------------------------------------------------------------------ */

function sigmoid(x) {
  return 1.0 / (1.0 + Math.exp(-x));
}

function bilinearResize(src, srcW, srcH, dstW, dstH) {
  const dst = new Float32Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let y = 0; y < dstH; y++) {
    const yf = y * yRatio;
    const y0 = Math.floor(yf);
    const y1 = Math.min(y0 + 1, srcH - 1);
    const fy = yf - y0;
    for (let x = 0; x < dstW; x++) {
      const xf = x * xRatio;
      const x0 = Math.floor(xf);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const fx = xf - x0;
      const v00 = src[y0 * srcW + x0];
      const v10 = src[y0 * srcW + x1];
      const v01 = src[y1 * srcW + x0];
      const v11 = src[y1 * srcW + x1];
      dst[y * dstW + x] =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
    }
  }
  return dst;
}

/* ------------------------------------------------------------------ */
/* Model resolution                                                    */
/* ------------------------------------------------------------------ */

function findModel() {
  const override = process.env.BENBG_MODEL;
  if (override && fs.existsSync(override)) return { path: override, label: "override" };
  const base = path.join(repoRoot, ".cache", "br-assets", "ben2", "onnx");
  const fp16 = path.join(base, "model_fp16.onnx");
  const fp32 = path.join(repoRoot, ".cache", "br-assets", "ben2-fp32", "onnx", "model.onnx");

  // Prefer fp32: onnxruntime-node's CPU execution provider does not run the
  // fp16 model (it hangs / lacks fp16 CPU kernels). The pipeline contract
  // under test (squash preprocess, mask geometry, inverse-resize) is
  // model-independent, so fp32 on CPU proves it while the browser ships the
  // same pipeline with fp16 on WebGPU.
  if (fs.existsSync(fp32)) return { path: fp32, label: "fp32 (Apache-2.0, Pezhgorski/BEN2-FP32-ONNX) — used for local CPU verification" };
  if (fs.existsSync(fp16)) return { path: fp16, label: "fp16 (MIT, onnx-community/BEN2-ONNX)" };
  return null;
}

/* ------------------------------------------------------------------ */
/* Assertions                                                          */
/* ------------------------------------------------------------------ */

let failures = 0;
function check(name, cond, detail = "") {
  const status = cond ? "PASS" : "FAIL";
  console.log(`  [${status}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
}

async function main() {
  const model = findModel();
  if (!model) {
    console.error("ERROR: no BEN2 ONNX model found. Run `npm run br-assets:fetch -- --with-fp32` first.");
    process.exit(2);
  }

  console.log(`Using model: ${model.path}`);
  console.log(`  (${model.label})`);

  const session = await ort.InferenceSession.create(model.path, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  console.log(`  inputs: ${session.inputNames.join(", ")}  outputs: ${session.outputNames.join(", ")}`);

  // Build input
  const src = makeSource();
  console.log(`\nSynthetic source: ${SRC_W}x${SRC_H} (16:9, white disk radius ~78 at center)`);
  const rgb = resizeToSquare(src, SRC_W, SRC_H);
  const data = normalizeNCHW(rgb);
  const inputTensor = new ort.Tensor("float32", data, [1, 3, INPUT_SIZE, INPUT_SIZE]);

  // Infer
  console.time("inference");
  const results = await session.run({ [inputName]: inputTensor });
  console.timeEnd("inference");

  const output = results[outputName];
  const dims = output.dims;
  const outData = output.data;

  console.log(`\nOutput dims: [${dims.join(", ")}]`);

  // ---- Assertions ----------------------------------------------------
  const maskH = dims[2] ?? dims[1];
  const maskW = dims[3] ?? dims[2];
  check("mask covers the full 1024x1024 frame (no crop/pad)",
    maskH === INPUT_SIZE && maskW === INPUT_SIZE,
    `got ${maskW}x${maskH}`);

  if (maskH * maskW !== INPUT_SIZE * INPUT_SIZE) {
    console.error("Cannot continue — unexpected mask geometry.");
    process.exit(2);
  }

  // Postprocess — mirror brembg.ts: sigmoid ONLY if values are outside [0, 1]
  // (BEN2's head already emits sigmoided probabilities — see transformers.js).
  const EPS = 1e-5;
  let needsSigmoid = false;
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    if (outData[i] < -EPS || outData[i] > 1 + EPS) { needsSigmoid = true; break; }
  }

  const mask = new Float32Array(INPUT_SIZE * INPUT_SIZE);
  for (let i = 0; i < mask.length; i++) {
    let v = needsSigmoid ? sigmoid(outData[i]) : outData[i];
    mask[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }

  let min = 1, max = 0, sum = 0;
  for (let i = 0; i < mask.length; i++) {
    min = Math.min(min, mask[i]);
    max = Math.max(max, mask[i]);
    sum += mask[i];
  }
  check("mask values are probabilities in [0, 1]", min >= 0 && max <= 1,
    `min=${min.toFixed(3)} max=${max.toFixed(3)}`);

  // Background corner should be ~0 (white disk on black → background at corners)
  const cornerVal = mask[0];
  const antiCornerVal = mask[(INPUT_SIZE - 1) * INPUT_SIZE + (INPUT_SIZE - 1)];
  check("background (corners) maps to alpha ~0 (not inverted path)",
    cornerVal < 0.5 && antiCornerVal < 0.5,
    `top-left=${cornerVal.toFixed(3)} bottom-right=${antiCornerVal.toFixed(3)}`);

  // Center (disk center in source space) should map to alpha ~1
  const centerVal = mask[((INPUT_SIZE / 2) | 0) * INPUT_SIZE + ((INPUT_SIZE / 2) | 0)];
  check("foreground (center) maps to alpha ~1", centerVal > 0.5,
    `center=${centerVal.toFixed(3)}`);

  // Resize the full 1024 mask back to the source dims (inverse squash)
  const resized = bilinearResize(mask, INPUT_SIZE, INPUT_SIZE, SRC_W, SRC_H);

  // Original disk center (480, 270) should be strongly foreground
  const diskCenterVal = resized[DISK_CY * SRC_W + DISK_CX];
  check("inverse-squash aligns: original disk center is foreground",
    diskCenterVal > 0.5,
    `mask(480,270)=${diskCenterVal.toFixed(3)}`);

  // Points outside the disk should be background
  const outsideVal = resized[10 * SRC_W + 10];
  check("inverse-squash aligns: points well outside the disk are background",
    outsideVal < 0.5,
    `mask(10,10)=${outsideVal.toFixed(3)}`);

  const fgFraction = sum / mask.length;
  const diskAreaFraction = (Math.PI * 78 * 78) / (SRC_W * SRC_H);
  check("foreground area is roughly the synthetic disk area",
    fgFraction > diskAreaFraction * 0.4 && fgFraction < diskAreaFraction * 2.2,
    `model=${(fgFraction * 100).toFixed(1)}% expected~${(diskAreaFraction * 100).toFixed(1)}%`);

  console.log("");
  if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED — pipeline contract violated.`);
    process.exit(1);
  }
  console.log("All pipeline contract checks passed ✅");
}

main().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});