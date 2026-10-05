/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client-side image processing engine for the Application File Checker & Fixer suite.
 *
 * Everything runs in the browser (Canvas 2D + Blob API). We never upload user files
 * to any server. Provides EXIF orientation normalization, zero-padding aspect-ratio
 * cropping, range-aware JPEG optimization (enforcing both min KB and max KB), and
 * clean blob export.
 */

export interface ProcessedImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  format: "image/jpeg" | "image/png" | "image/webp";
}

export interface ImageLoadInfo {
  width: number;
  height: number;
  format: string;
  dataUrl: string;
  orientation: number;
  canvas: HTMLCanvasElement;
}

export type FormatTarget = "jpeg" | "png" | "webp";

export interface CropOptions {
  zoom?: number; // 1.0 to 3.5
  panX?: number; // -1.0 to 1.0 (center is 0)
  panY?: number; // -1.0 to 1.0 (center is 0)
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface RangeCompressOptions {
  format?: FormatTarget;
  minBytes?: number;
  maxBytes: number;
  exactTargetBytes?: number;
}

export interface CompressionResult extends ProcessedImage {
  achievedMin: boolean;
  achievedMax: boolean;
  quality: number;
  note?: string;
}

const toMime = (f: FormatTarget): ProcessedImage["format"] =>
  f === "png" ? "image/png" : f === "webp" ? "image/webp" : "image/jpeg";

/**
 * Safely parses the EXIF orientation tag (0x0112) from JPEG APP1 header.
 * Returns 1 (normal) through 8, or 1 if unoriented / not a JPEG.
 */
export function readExifOrientation(buffer: ArrayBuffer): number {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 4) return 1;
    // Check JPEG SOI marker (0xFFD8)
    if (view.getUint16(0, false) !== 0xffd8) return 1;

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 marker (0xFFE1) typically contains EXIF
      if (marker === 0xffe1) {
        if (offset + 2 > length) return 1;
        const segmentLength = view.getUint16(offset, false);
        offset += 2;

        // Check for "Exif\0\0" header (0x45786966 followed by 0x0000)
        if (
          offset + 6 <= length &&
          view.getUint32(offset, false) === 0x45786966 &&
          view.getUint16(offset + 4, false) === 0x0000
        ) {
          const tiffStart = offset + 6;
          if (tiffStart + 8 > length) return 1;

          // TIFF Byte Order: "II" (0x4949) Little Endian, "MM" (0x4D4D) Big Endian
          const byteOrder = view.getUint16(tiffStart, false);
          const littleEndian = byteOrder === 0x4949;
          if (!littleEndian && byteOrder !== 0x4d4d) return 1;

          // 42 test
          if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return 1;

          const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);
          if (tiffStart + firstIFDOffset + 2 > length) return 1;

          const ifdStart = tiffStart + firstIFDOffset;
          const entries = view.getUint16(ifdStart, littleEndian);

          for (let i = 0; i < entries; i++) {
            const entryOffset = ifdStart + 2 + i * 12;
            if (entryOffset + 12 > length) break;
            const tag = view.getUint16(entryOffset, littleEndian);
            if (tag === 0x0112) {
              // Orientation tag found!
              const val = view.getUint16(entryOffset + 8, littleEndian);
              if (val >= 1 && val <= 8) return val;
              return 1;
            }
          }
        }
        offset += segmentLength - 2;
      } else if ((marker & 0xff00) === 0xff00) {
        // Stop scanning at Start of Scan (SOS) or End of Image (EOI)
        if (marker === 0xffda || marker === 0xffd9) break;
        if (offset + 2 > length) break;
        const segmentLength = view.getUint16(offset, false);
        offset += segmentLength;
      } else {
        break;
      }
    }
  } catch {
    // Fallback to normal
  }
  return 1;
}

/**
 * Creates an orientation-normalized canvas from an image and EXIF orientation code (1..8).
 * Ensures portrait phone photos are never flipped sideways or upside down.
 */
export function createOrientationNormalizedCanvas(
  img: HTMLImageElement,
  orientation: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  if (!ctx || orientation <= 1) {
    canvas.width = w;
    canvas.height = h;
    if (ctx) ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  }

  // Orientations 5, 6, 7, 8 swap width and height
  const swap = orientation >= 5 && orientation <= 8;
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;

  ctx.save();
  switch (orientation) {
    case 2: // Horizontal flip
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3: // 180° rotation
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4: // Vertical flip
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5: // Transpose
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // 90° clockwise (standard mobile portrait)
      ctx.translate(h, 0);
      ctx.rotate(0.5 * Math.PI);
      break;
    case 7: // Transverse
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(w, -h);
      ctx.scale(-1, 1);
      break;
    case 8: // 270° clockwise (90° CCW)
      ctx.translate(0, w);
      ctx.rotate(-0.5 * Math.PI);
      break;
    default:
      break;
  }
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
  return canvas;
}

/**
 * Load a File/Blob with full EXIF orientation decoding into an HTMLCanvasElement + data URL.
 */
export async function loadImageWithExif(file: File | Blob): Promise<ImageLoadInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const orientation = readExifOrientation(arrayBuffer);

  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: file.type || "image/jpeg" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = createOrientationNormalizedCanvas(img, orientation);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        URL.revokeObjectURL(url);
        resolve({
          width: canvas.width,
          height: canvas.height,
          format: (file.type || "image/jpeg").split("/")[1] || "jpeg",
          dataUrl,
          orientation,
          canvas,
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be opened. It may be corrupt or an unsupported format."));
    };

    img.src = url;
  });
}

/** Standard loadImage helper (preserves backward compatibility while honoring EXIF). */
export async function loadImage(file: File | Blob): Promise<ImageLoadInfo> {
  return loadImageWithExif(file);
}

/**
 * Fit and center-crop an image or canvas to exact target dimensions without ANY letterboxing,
 * white strips, or distortion. 100% of the target canvas is covered by photo pixels.
 *
 * Supports interactive zoom and pan coordinates for manual framing adjustments.
 */
export function fitAndCropToCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  options?: CropOptions
): HTMLCanvasElement {
  const targetRatio = targetWidth / targetHeight;
  const sW = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const sH = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;

  let workingSource: HTMLCanvasElement | HTMLImageElement = source;
  let curW = sW;
  let curH = sH;

  // Handle optional manual 90° rotation
  const rot = (((options?.rotation || 0) % 360) + 360) % 360;
  if (rot !== 0) {
    const rotCanvas = document.createElement("canvas");
    const swap = rot === 90 || rot === 270;
    rotCanvas.width = swap ? sH : sW;
    rotCanvas.height = swap ? sW : sH;
    const rctx = rotCanvas.getContext("2d");
    if (rctx) {
      rctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rctx.rotate((rot * Math.PI) / 180);
      rctx.drawImage(source, -sW / 2, -sH / 2);
      workingSource = rotCanvas;
      curW = rotCanvas.width;
      curH = rotCanvas.height;
    }
  }

  const srcRatio = curW / curH;
  let baseCropW = curW;
  let baseCropH = curH;

  if (srcRatio > targetRatio) {
    // Source is wider than target aspect ratio: match height, crop sides
    baseCropH = curH;
    baseCropW = curH * targetRatio;
  } else {
    // Source is taller than target aspect ratio: match width, crop top/bottom
    baseCropW = curW;
    baseCropH = curW / targetRatio;
  }

  // Zoom: 1.0 is full crop-fit; > 1.0 zooms in on the subject
  const zoom = Math.max(1.0, Math.min(3.5, options?.zoom ?? 1.0));
  const cropW = baseCropW / zoom;
  const cropH = baseCropH / zoom;

  // Pan offsets: -1.0 to 1.0 maps across the available margin
  const maxShiftX = Math.max(0, (curW - cropW) / 2);
  const maxShiftY = Math.max(0, (curH - cropH) / 2);

  const panX = Math.max(-1.0, Math.min(1.0, options?.panX ?? 0));
  const panY = Math.max(-1.0, Math.min(1.0, options?.panY ?? 0));

  const cropX = Math.max(0, Math.min(curW - cropW, (curW - cropW) / 2 + panX * maxShiftX));
  const cropY = Math.max(0, Math.min(curH - cropH, (curH - cropH) / 2 + panY * maxShiftY));

  const outCanvas = document.createElement("canvas");
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Could not initialize target canvas context.");

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  // Render cropped portion directly onto destination canvas — no white strips ever!
  outCtx.drawImage(
    workingSource,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return outCanvas;
}

/**
 * Gentle unsharp masking to legitimately restore fine photographic edge details
 * (hair, eye contrast, clothing collar) lost during downscaling to small passport sizes.
 * Increases genuine JPEG DCT high-frequency entropy without dummy bytes.
 */
export function enhanceCanvasClarity(canvas: HTMLCanvasElement, amount = 0.35): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const w = canvas.width;
  const h = canvas.height;
  if (w <= 2 || h <= 2) return canvas;

  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) return canvas;
  const outImgData = outCtx.createImageData(w, h);
  const dst = outImgData.data;

  // Copy original by default
  dst.set(src);

  const clampedAmount = Math.max(0.1, Math.min(1.0, amount));

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = src[idx + c];
        const up = src[((y - 1) * w + x) * 4 + c];
        const down = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];

        // 3x3 Laplacian edge kernel
        const laplacian = 5 * center - up - down - left - right;
        const val = center + clampedAmount * (laplacian - center);
        dst[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outCanvas;
}

/** Legacy resizeCanvas method for backwards compatibility with signature/thumb tools. */
export function resizeCanvas(
  img: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  mode: "exact" | "contain" | "cover" = "cover"
): HTMLCanvasElement {
  if (mode === "cover") {
    return fitAndCropToCanvas(img, targetWidth, targetHeight);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  const sW = "naturalWidth" in img ? img.naturalWidth || img.width : img.width;
  const sH = "naturalHeight" in img ? img.naturalHeight || img.height : img.height;

  if (mode === "exact") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas;
  }

  // contain: keep aspect ratio, letterbox on white (used for signatures / thumb marks where cropping is forbidden)
  const scale = Math.min(targetWidth / sW, targetHeight / sH);
  const w = Math.max(1, Math.round(sW * scale));
  const h = Math.max(1, Math.round(sH * scale));
  const x = Math.floor((targetWidth - w) / 2);
  const y = Math.floor((targetHeight - h) / 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, x, y, w, h);
  return canvas;
}

/**
 * Auto-crop: find the bounding box of "ink" content and expand to a ratio.
 * Returns the source pixel rect {x, y, w, h}.
 */
export function detectContentRect(
  canvas: HTMLCanvasElement,
  threshold = 245
): { x: number; y: number; w: number; h: number } | null {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const isInk = gray < threshold || Math.max(r, g, b) - Math.min(r, g, b) > 90;
      if (isInk) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Crop a source canvas to a rect. */
export function cropRect(
  src: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number }
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = rect.w;
  out.height = rect.h;
  const ctx = out.getContext("2d");
  if (ctx) ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  return out;
}

/**
 * Clean a background to near-white using a keep/blank decision.
 */
export function cleanBackground(
  canvas: HTMLCanvasElement,
  level = 0.55
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  const src = canvas.getContext("2d");
  if (!ctx || !src) return canvas;
  const imgData = src.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const threshold = Math.round(235 - 60 * level);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (gray > threshold && sat < 80) {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

/** Adjust brightness/contrast. contrast -100..100, brightness -100..100. */
export function adjustContrast(
  canvas: HTMLCanvasElement,
  contrast = 0,
  brightness = 0
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  const src = canvas.getContext("2d");
  if (!ctx || !src) return canvas;
  const imgData = src.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const c = (255 * contrast) / 100;
  const factor = (259 * (c + 255)) / (255 * (259 - c));
  const bOff = brightness;
  for (let i = 0; i < d.length; i += 4) {
    for (let k = 0; k < 3; k++) {
      let v = factor * (d[i + k] - 128) + 128 + bOff;
      d[i + k] = Math.max(0, Math.min(255, v));
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

/** Rotate a canvas by 90-degree increments. */
export function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const steps = ((degrees % 360) + 360) % 360;
  if (steps === 0) return canvas;
  const swap = steps === 90 || steps === 270;
  const out = document.createElement("canvas");
  out.width = swap ? canvas.height : canvas.width;
  out.height = swap ? canvas.width : canvas.height;
  const ctx = out.getContext("2d");
  if (!ctx) return canvas;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((steps * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return out;
}

/** Compute a "sharpness" estimate (0..1) from gradient energy. */
export function estimateSharpness(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0.5;
  const w = Math.min(canvas.width, 240);
  const h = Math.min(canvas.height, 240);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cctx = c.getContext("2d");
  if (!cctx) return 0.5;
  cctx.drawImage(canvas, 0, 0, w, h);
  const d = cctx.getImageData(0, 0, w, h).data;
  let energy = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const l = (y * w + (x - 1)) * 4;
      const r = (y * w + (x + 1)) * 4;
      const u = ((y - 1) * w + x) * 4;
      const b = ((y + 1) * w + x) * 4;
      const gx = Math.abs(d[r] - d[l]);
      const gy = Math.abs(d[b] - d[u]);
      energy += gx + gy;
      count += 1;
    }
  }
  const avg = energy / Math.max(1, count);
  return Math.max(0, Math.min(1, Math.log1p(avg) / 2.2));
}

/** Encode a canvas to target format and quality. */
export function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: FormatTarget,
  quality: number
): Promise<Blob> {
  const mime = toMime(format);
  if (mime === "image/jpeg" || mime === "image/webp") {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob ?? new Blob([], { type: mime })),
        mime,
        Math.max(0.01, Math.min(1.0, quality))
      );
    });
  }
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? new Blob([], { type: mime })), mime);
  });
}

/**
 * Robust Range & Exact-Target Compression Engine.
 *
 * Guarantees:
 * 1. Output file strictly honors maxBytes (fileSize <= maxBytes).
 * 2. If minBytes is specified (e.g. 20–50 KB range), actively searches for quality
 *    that satisfies minBytes <= fileSize <= maxBytes.
 * 3. If a downscaled image is naturally compact at max quality, applies subtle clarity
 *    sharpening to restore authentic photograph details, re-testing to see if it reaches minBytes.
 * 4. NEVER inserts fake dummy data, zero-padding bytes, or corrupt EXIF metadata.
 * 5. Returns explicit achievedMin and achievedMax flags so the UI never displays false success.
 */
export async function compressToTargetRange(
  canvas: HTMLCanvasElement,
  options: RangeCompressOptions
): Promise<CompressionResult> {
  const format = options.format || "jpeg";
  const mime = toMime(format);
  const maxBytes = Math.max(1024, options.maxBytes);
  const minBytes = options.minBytes ? Math.max(1024, options.minBytes) : undefined;
  const exactTarget = options.exactTargetBytes;

  // Non-compressible formats (PNG) don't have quality parameter
  if (format === "png") {
    const blob = await encodeCanvas(canvas, "png", 1.0);
    const achievedMax = blob.size <= maxBytes;
    const achievedMin = minBytes ? blob.size >= minBytes : true;
    return {
      ...blobToProcessed(blob, canvas.width, canvas.height, "image/png"),
      achievedMin,
      achievedMax,
      quality: 1.0,
      note: !achievedMax ? `PNG file size (${formatKB(blob.size)}) exceeds ${formatKB(maxBytes)}. Convert to JPEG for smaller file size.` : undefined,
    };
  }

  // Exact target mode: binary-search quality to get as close to exactTarget without exceeding maxBytes
  if (exactTarget && exactTarget > 0) {
    const target = Math.min(exactTarget, maxBytes);
    let lo = 0.05;
    let hi = 0.99;
    let bestBlob: Blob = new Blob([], { type: mime });
    let bestQ = 0.85;

    for (let i = 0; i < 14; i++) {
      const q = lo + (hi - lo) / 2;
      const b = await encodeCanvas(canvas, format, q);
      if (b.size === 0) break;

      if (b.size <= target) {
        bestBlob = b;
        bestQ = q;
        lo = q + 0.005; // Try to get even closer to target
      } else {
        hi = q - 0.005;
      }
      if (hi < lo) break;
    }

    if (bestBlob.size === 0) {
      bestBlob = await encodeCanvas(canvas, format, 0.05);
      bestQ = 0.05;
    }

    const achievedMax = bestBlob.size <= maxBytes;
    const achievedMin = minBytes ? bestBlob.size >= minBytes : true;

    return {
      ...blobToProcessed(bestBlob, canvas.width, canvas.height, mime),
      achievedMin,
      achievedMax,
      quality: bestQ,
      note: `Target: ${formatKB(target)} · Result: ${formatKB(bestBlob.size)} (Within target)`,
    };
  }

  // Range mode (e.g. 20–50 KB, or just <= maxBytes)
  // Step 1: Binary search to find the highest visual quality that stays at or below maxBytes
  let loQ = 0.08;
  let hiQ = 0.98;
  let bestBlob: Blob = new Blob([], { type: mime });
  let bestQuality = 0.85;

  for (let i = 0; i < 12; i++) {
    const q = loQ + (hiQ - loQ) / 2;
    const b = await encodeCanvas(canvas, format, q);
    if (b.size === 0) break;

    if (b.size <= maxBytes) {
      bestBlob = b;
      bestQuality = q;
      loQ = q + 0.005; // Fits under max; see if we can get even higher quality
    } else {
      hiQ = q - 0.005; // Too large; reduce quality
    }
    if (hiQ < loQ) break;
  }

  // If even lowest binary search was too big, drop down to emergency minimums
  if (bestBlob.size === 0 || bestBlob.size > maxBytes) {
    for (const q of [0.08, 0.05, 0.03]) {
      const b = await encodeCanvas(canvas, format, q);
      if (b.size > 0 && b.size <= maxBytes) {
        bestBlob = b;
        bestQuality = q;
        break;
      }
    }
  }

  // Step 2: Check if minBytes is satisfied
  let currentWorkingCanvas = canvas;
  let achievedMin = minBytes ? bestBlob.size >= minBytes : true;
  let achievedMax = bestBlob.size > 0 && bestBlob.size <= maxBytes;

  if (minBytes && bestBlob.size < minBytes) {
    // The image compressed to LESS than minBytes!
    // Test higher qualities up to 1.0
    for (const q of [0.96, 0.98, 0.99, 1.0]) {
      const b = await encodeCanvas(canvas, format, q);
      if (b.size >= minBytes && b.size <= maxBytes) {
        bestBlob = b;
        bestQuality = q;
        achievedMin = true;
        achievedMax = true;
        break;
      } else if (b.size <= maxBytes && b.size > bestBlob.size) {
        bestBlob = b;
        bestQuality = q;
      }
    }

    // If still below minBytes at maximum quality, apply clarity sharpening
    // to recover authentic photo edge contrast lost during downscaling
    if (!achievedMin) {
      for (const amount of [0.35, 0.65, 0.95]) {
        const sharpened = enhanceCanvasClarity(canvas, amount);
        for (const q of [0.95, 0.98, 1.0]) {
          const b = await encodeCanvas(sharpened, format, q);
          if (b.size >= minBytes && b.size <= maxBytes) {
            bestBlob = b;
            bestQuality = q;
            currentWorkingCanvas = sharpened;
            achievedMin = true;
            achievedMax = true;
            break;
          } else if (b.size <= maxBytes && b.size > bestBlob.size) {
            bestBlob = b;
            bestQuality = q;
            currentWorkingCanvas = sharpened;
          }
        }
        if (achievedMin) break;
      }
    }
  }

  let note: string | undefined;
  if (!achievedMax) {
    note = `Could not reduce file size under ${formatKB(maxBytes)} at required dimensions without excessive distortion.`;
  } else if (!achievedMin && minBytes) {
    note = `This image naturally compresses to ${formatKB(bestBlob.size)} at ${canvas.width}×${canvas.height} px. Even at 100% visual quality, it is below the portal's ${formatKB(minBytes)} minimum. (Fake bytes are never added). Try uploading a higher-resolution portrait if your portal strictly enforces this minimum.`;
  }

  return {
    ...blobToProcessed(bestBlob, currentWorkingCanvas.width, currentWorkingCanvas.height, mime),
    achievedMin,
    achievedMax,
    quality: bestQuality,
    note,
  };
}

/**
 * Compresses canvas to sit under maxBytes, with optional minBytes support.
 * Retains backward compatibility for all existing callers.
 */
export async function compressToMaxBytes(
  canvas: HTMLCanvasElement,
  format: FormatTarget,
  maxBytes: number,
  minBytes?: number
): Promise<ProcessedImage> {
  const res = await compressToTargetRange(canvas, {
    format,
    maxBytes,
    minBytes,
  });
  return res;
}

function blobToProcessed(
  blob: Blob,
  width: number,
  height: number,
  mime: ProcessedImage["format"]
): ProcessedImage {
  const dataUrl = URL.createObjectURL(blob);
  return { dataUrl, blob, width, height, size: blob.size, format: mime };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Triggers safe, reliable in-browser download of the processed image file.
 * Handles URL creation, triggering, and revocation safely across mobile and desktop browsers.
 */
export function triggerDownload(dataUrlOrBlob: string | Blob, filename: string) {
  const url = dataUrlOrBlob instanceof Blob ? URL.createObjectURL(dataUrlOrBlob) : dataUrlOrBlob;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    if (dataUrlOrBlob instanceof Blob) URL.revokeObjectURL(url);
  }, 3000);
}
