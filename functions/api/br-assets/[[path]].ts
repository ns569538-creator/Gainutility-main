/**
 * Serves the BEN2 segmentation model and ONNX Runtime WASM kernels from an R2
 * bucket so no third-party CDN is required.
 *
 * Object layout:
 *   ben2/onnx/model_fp16.onnx          (fp16, WebGPU + WebAssembly)
 *   ben2-fp32/onnx/model.onnx           (fp32 fallback, WASM-only devices)
 *   ort-wasm/ort-wasm-simd-threaded.wasm (+ .mjs glue, jsep/jspi variants)
 *
 * Requires an R2 binding named `MODEL_ASSETS` in the Pages project settings.
 * Until the binding + bucket exist, requests 404 and the client silently
 * falls back to the public HuggingFace / jsDelivr CDNs.
 */

interface R2ObjectBody {
  size: number;
  httpMetadata?: { contentType?: string };
  body: ReadableStream | null;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}

interface Env {
  MODEL_ASSETS?: R2Bucket;
}

interface FunctionContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

const EXTENSION_MIME: Record<string, string> = {
  wasm: "application/wasm",
  onnx: "application/octet-stream",
  js: "text/javascript",
  mjs: "text/javascript",
  module: "text/javascript",
  map: "application/json",
};

export async function onRequest(ctx: FunctionContext): Promise<Response> {
  const bucket = ctx.env.MODEL_ASSETS;
  if (!bucket) {
    return new Response("MODEL_ASSETS bucket not configured", { status: 404 });
  }

  const path = ctx.params.path;
  const key = Array.isArray(path) ? path.join("/") : String(path ?? "");
  if (!key) return new Response("Not found", { status: 404 });

  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    EXTENSION_MIME[extension] ??
    object.httpMetadata?.contentType ??
    "application/octet-stream";

  return new Response(object.body, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "content-length": String(object.size),
    },
  });
}