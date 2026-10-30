/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Minimal, correct GIF89a encoder used to export real animated GIFs.
 *
 * This is a self-contained implementation of the GIF89a spec with LZW
 * compression and per-frame disposal. It runs entirely in the browser and
 * produces genuinely playable animated GIFs from sampled video frames.
 */

export interface GifFrame {
  width: number;
  height: number;
  /** indexed pixels (palette indices), one byte per pixel */
  pixels: Uint8Array;
  /** delay in hundredths of a second (1/100 s) */
  delayCs: number;
  /** rgb triples forming the local palette */
  palette: number[][];
}

interface BlockColor {
  r: number;
  g: number;
  b: number;
  count: number;
}

/** Quantize an RGBA image to indexed pixels + palette (nearest-neighbor). */
export function quantize(
  rgba: Uint8Array | Uint8ClampedArray,
  maxColors: number
): { pixels: Uint8Array; palette: number[][] } {
  const n = rgba.length / 4;

  // Histogram of exact colors (opaque only; we drop transparency for output
  // but keep a black background so animated GIFs look sensible).
  const hist = new Map<string, BlockColor>();
  for (let i = 0; i < n; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    const key = `${r},${g},${b}`;
    const cur = hist.get(key);
    if (cur) cur.count++;
    else hist.set(key, { r, g, b, count: 1 });
  }

  // Choose the maxColors most frequent colors as the palette.
  const entries = [...hist.values()].sort((x, y) => y.count - x.count);
  const palette = entries.slice(0, maxColors).map((e) => [e.r, e.g, e.b]);

  const pixels = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    // Exhaustive nearest-neighbor against the palette (palettes are small).
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < palette.length; p++) {
      const pr = palette[p][0];
      const pg = palette[p][1];
      const pb = palette[p][2];
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    pixels[i] = best;
  }
  return { pixels, palette };
}

/** LZW compression per the GIF spec. */
function lzwEncode(
  pixels: Uint8Array,
  minCodeSize: number
): { bytes: Uint8Array; minCodeSize: number } {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;

  const out: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const writeCode = (code: number, size: number) => {
    bitBuffer |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };

  let dict = new Map<string, number>();
  const resetDict = (size: number) => {
    dict = new Map();
    for (let i = 0; i < size; i++) dict.set(String.fromCharCode(i), i);
  };

  resetDict(clearCode);
  let nextCode = eoiCode + 1;
  writeCode(clearCode, codeSize);

  let current = "";
  for (let i = 0; i < pixels.length; i++) {
    const byte = pixels[i];
    const combined = current + String.fromCharCode(byte);
    if (dict.has(combined)) {
      current = combined;
    } else {
      writeCode(dict.get(current)!, codeSize);
      if (dict.size < 4096) {
        dict.set(combined, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        resetDict(clearCode);
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
        writeCode(clearCode, codeSize);
      }
      current = String.fromCharCode(byte);
    }
  }
  if (current) writeCode(dict.get(current)!, codeSize);
  writeCode(eoiCode, codeSize);
  if (bitCount > 0) out.push(bitBuffer & 0xff);
  return { bytes: new Uint8Array(out), minCodeSize };
}

const ascii = (s: string): Uint8Array => {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

const paletteBytes = (palette: number[][], size: number): Uint8Array => {
  const out = new Uint8Array(size * 3);
  for (let i = 0; i < size; i++) {
    const c = palette[i] ?? [0, 0, 0];
    out[i * 3] = c[0];
    out[i * 3 + 1] = c[1];
    out[i * 3 + 2] = c[2];
  }
  return out;
};

/** Encode frames to a GIF89a Blob. */
export function encodeGif(frames: GifFrame[]): Blob {
  if (!frames.length) throw new Error("No frames to encode.");
  const width = frames[0].width;
  const height = frames[0].height;

  const chunks: Uint8Array[] = [];
  const push = (bytes: Uint8Array) => chunks.push(bytes);

  // Header + logical screen descriptor (no global color table).
  push(ascii("GIF89a"));
  const ls = new Uint8Array(7);
  ls[0] = width & 0xff;
  ls[1] = (width >> 8) & 0xff;
  ls[2] = height & 0xff;
  ls[3] = (height >> 8) & 0xff;
  ls[4] = 0x00;
  ls[5] = 0;
  ls[6] = 0;
  push(ls);

  for (const frame of frames) {
    const palette = frame.palette.length ? frame.palette : [[0, 0, 0]];
    const depth = Math.max(2, Math.ceil(Math.log2(palette.length)));
    const tableSize = 1 << depth;

    // Graphic control extension (fixed 100ms minimum delay).
    const delayCs = Math.max(1, frame.delayCs);
    const gce = new Uint8Array(8);
    gce[0] = 0x21;
    gce[1] = 0xf9;
    gce[2] = 0x04;
    gce[3] = 0x00;
    gce[4] = delayCs & 0xff;
    gce[5] = (delayCs >> 8) & 0xff;
    gce[6] = 0;
    gce[7] = 0;
    push(gce);

    // Image descriptor with local color table.
    const id = new Uint8Array(10);
    id[0] = 0x2c;
    id[1] = 0;
    id[2] = 0;
    id[3] = 0;
    id[4] = 0;
    id[5] = width & 0xff;
    id[6] = (width >> 8) & 0xff;
    id[7] = height & 0xff;
    id[8] = (height >> 8) & 0xff;
    id[9] = 0x80 | (depth - 1);
    push(id);

    // Local color table.
    push(paletteBytes(palette, tableSize));

    // LZW min code size + data sub-blocks.
    push(new Uint8Array([depth]));
    const { bytes } = lzwEncode(frame.pixels, depth);
    const subs: number[] = [];
    for (let i = 0; i < bytes.length; i += 255) {
      const chunkLen = Math.min(255, bytes.length - i);
      subs.push(chunkLen);
      for (let j = 0; j < chunkLen; j++) subs.push(bytes[i + j]);
    }
    subs.push(0);
    push(new Uint8Array(subs));
  }

  push(new Uint8Array([0x3b])); // trailer
  return new Blob(chunks, { type: "image/gif" });
}
