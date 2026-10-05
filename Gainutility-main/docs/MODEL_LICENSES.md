# Background Remover — Model License & Asset Documentation

## Models in use

### Primary: `onnx-community/BEN2-ONNX` (fp16, ~219 MB)
- **File served**: `onnx/model_fp16.onnx`
- **License**: **MIT** — commercial use, modification, distribution allowed.
  - Confirmed via model card `cardData` on https://huggingface.co/onnx-community/BEN2-ONNX (`license: mit`),
    verified 2026-09-12.
  - ONNX export created by onnx-community; no additional restrictions.
- **Base model**: `PramaLLC/BEN2` (Background Erase Network), **MIT** — confirmed via
  https://huggingface.co/PramaLLC/BEN2 (`license: mit`). The ONNX export inherits this.
- **Copyright notice**: PEP-BE2 is protected by US Patent No. 11,876,963. Patent rights are
  **not** transferred — this does not grant a patent license. Distribute this model at your own
  discretion with the understanding that the patent owner is not liable for use.
- See the model's cached LICENSE + README in `scripts/../.cache/br-meta/BEN2-ONNX/` after running
  `npm run br-assets:fetch`, or: https://huggingface.co/onnx-community/BEN2-ONNX/blob/main/README.md

### Fallback: `Pezhgorski/BEN2-FP32-ONNX` (fp32, ~422 MB)
- **File served**: `onnx/model.onnx`
- **License**: **Apache-2.0** — commercial use allowed; Apache-2.0 applies to program output only
  (no additional restrictions); redistribution requires retaining attribution notices.
  - Confirmed via the model card on https://huggingface.co/Pezhgorski/BEN2-FP32-ONNX (`license: apache-2.0`),
    verified 2026-09-12.
  - Acknowledgment: converted from onnx-community/BEN2-ONNX (fp16, MIT) by ListingGems.
- Only downloaded on devices where the fp16 session cannot be created and fp16 is unsupported
  (e.g. WASM-only environments without WebGPU).
- Source: https://huggingface.co/Pezhgorski/BEN2-FP32-ONNX

### License summary (required attestation)

| Model | License | Commercial use | Redistribution | Attribution required | Source |
| --- | --- | --- | --- | --- | --- |
| `onnx-community/BEN2-ONNX` (fp16, primary) | MIT | Allowed | Allowed (retain MIT notice) | Retain copyright/permission notice | https://huggingface.co/onnx-community/BEN2-ONNX |
| `Pezhgorski/BEN2-FP32-ONNX` (fp32, WASM fallback) | Apache-2.0 | Allowed | Allowed (retain attribution notices) | Retain attribution notices | https://huggingface.co/Pezhgorski/BEN2-FP32-ONNX |

Both models originate from `PramaLLC/BEN2` (MIT). Note the US Patent No. 11,876,963 caveat above —
a patent license is not granted.

## Preprocessing contract (must match transformers.js reference)

The BEN2 image processor (`preprocessor_config.json`) resizes input to **exact 1024×1024**
(no crop, no letterbox padding — the image is squashed to a square), rescales pixels by 1/255,
then normalizes with ImageNet mean/std:

```
MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]
normalized = (pixel / 255 - MEAN) / STD
NCHW float32 [1, 3, 1024, 1024]
```

### Inverse mapping for the output mask
- The model outputs a 1024×1024 `alphas` map. **The head already applies sigmoid** —
  values are probabilities in `[0, 1]`, NOT raw logits. Do not apply a second sigmoid
  (this washed every mask toward 0.5 and uniformly broke output quality).
- To stay correct for any model variant, `src/lib/brembg.ts` mirrors the
  transformers.js reference (`image-segmentation.js`, PR ORT#23943): if any output
  value falls outside `[0 ± 1e-5, 1 ± 1e-5]`, treat it as logits and sigmoid once;
  otherwise use the values as-is (clamped to `[0, 1]`).
- Because the input is squashed and unpadded, the mask maps back to the source by a
  plain bilinear resize of the full 1024×1024 mask to the **original image dimensions**.
- No letterboxing, so no crop/pad reversal is required. This is implemented in
  `src/lib/brembg.ts` (`preprocessImage` / `postprocessOutput`).

## Verification

Running `npm run verify:brembg` executes `scripts/verify-brembg.mjs` locally with
`onnxruntime-node` (download the fp32 model first via
`npm run br-assets:fetch -- --with-fp32`; onnxruntime-node's CPU EP cannot run the
fp16 model). It builds a synthetic non-square 16:9 image (bright disk on dark),
preprocesses it exactly like the browser engine, runs inference, and asserts:
- input name `pixel_values`, output name `alphas`
- output mask shape is `[1, 1, 1024, 1024]` (full frame → no crop/pad mapping)
- post-processed values are probabilities in `[0, 1]` with decisive separation
  (background corners ≈ 0, foreground center ≈ 1 — proves the sigmoid is applied
  at most once)
- result is not inverted
- inverse-squash alignment: the original disk center scores ≈ 1 and points far
  outside the disk score ≈ 0, and the detected foreground area ≈ synthetic disk area

All checks PASS as of the last run (fp32 ONNX, onnxruntime-node on CPU).