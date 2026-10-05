#!/usr/bin/env node
/**
 * generate-icons.mjs
 *
 * Renders the official GainUtility brand mark (blue rounded-square tile with
 * the white "G" and yellow upward arrow — same geometry as the site header)
 * as PNG icons at the sizes the Chrome Web Store and toolbar require
 * (16 / 32 / 48 / 128), written to extension/public/icons/.
 *
 * Pure-Node implementation (zlib for PNG compression) — no canvas or native
 * rasterizer dependency, so it builds on any machine, including Windows.
 *
 * Run: `npm run icons` (or `node scripts/generate-icons.mjs`)
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public", "icons");

// ── Minimal PNG encoder (truecolor + alpha) ─────────────────────────────
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  // filter 0 per scanline
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Geometry: verbatim from the site header logo (viewBox 0 0 1254 1254) ──
const VB = 1254;
const RECT = { x: 86, y: 99, w: 1081, h: 1042, r: 210 };
const BG_P0 = [110, 110], BG_P1 = [1135, 1140];
const BG_STOPS = [[0, [8, 43, 112]], [0.55, [6, 36, 95]], [1, [4, 28, 77]]];
const YEL_P0 = [620, 450], YEL_P1 = [1040, 900];
const YEL_STOPS = [[0, [255, 196, 0]], [1, [255, 179, 0]]];

const G_PATH_D = [
  "M 633.0,407.0 L 579.0,385.0 L 532.0,375.0 L 470.0,373.0 L 428.0,379.0 L 376.0,395.0 L 344.0,410.0 L 317.0,426.0 L 275.0,459.0 L 243.0,493.0 L 213.0,538.0 L 192.0,589.0 L 182.0,638.0 L 181.0,688.0 L 189.0,736.0 L 208.0,784.0 L 235.0,824.0 L 270.0,858.0 L 295.0,875.0 L 319.0,887.0 L 353.0,899.0 L 403.0,907.0 L 448.0,906.0 L 489.0,898.0 L 519.0,887.0 L 565.0,860.0 L 600.0,830.0 L 598.0,816.0 L 599.0,713.0 L 539.0,761.0 L 485.0,792.0 L 465.0,799.0 L 437.0,804.0 L 399.0,802.0 L 373.0,794.0 L 351.0,782.0 L 338.0,772.0 L 315.0,746.0 L 305.0,727.0 L 298.0,706.0 L 294.0,675.0 L 295.0,649.0 L 300.0,623.0 L 308.0,600.0 L 332.0,559.0 L 368.0,522.0 L 393.0,505.0 L 415.0,494.0 L 444.0,485.0 L 470.0,481.0 L 527.0,483.0 L 570.0,496.0 L 590.0,507.0 L 615.0,527.0 L 695.0,454.0 L 674.0,434.0 Z",
  "M 385.0,685.0 L 388.0,691.0 L 617.0,691.0 L 621.0,695.0 L 633.0,734.0 L 656.0,769.0 L 685.0,794.0 L 705.0,804.0 L 722.0,809.0 L 722.0,616.0 L 719.0,610.0 L 712.0,605.0 L 462.0,605.0 L 450.0,615.0 Z",
];
const ARROW_PATH_D =
  "M 945.0,434.0 L 934.0,432.0 L 926.0,436.0 L 818.0,543.0 L 819.0,553.0 L 826.0,558.0 L 874.0,559.0 L 874.0,714.0 L 871.0,743.0 L 865.0,764.0 L 856.0,781.0 L 833.0,806.0 L 804.0,822.0 L 769.0,830.0 L 727.0,829.0 L 689.0,818.0 L 660.0,801.0 L 639.0,782.0 L 618.0,753.0 L 606.0,727.0 L 602.0,712.0 L 600.0,712.0 L 599.0,806.0 L 603.0,837.0 L 610.0,854.0 L 622.0,871.0 L 653.0,896.0 L 690.0,912.0 L 730.0,920.0 L 777.0,921.0 L 829.0,914.0 L 869.0,901.0 L 910.0,878.0 L 943.0,849.0 L 964.0,821.0 L 983.0,780.0 L 991.0,738.0 L 992.0,559.0 L 1043.0,558.0 L 1050.0,553.0 L 1051.0,543.0 Z";

/** Parse absolute M/L path data into a polygon point list. */
function parsePath(d) {
  const tokens = d.trim().split(/[\s,]+/);
  const pts = [];
  let i = 0, cmd = null;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === "M" || t === "L") { cmd = t; i++; continue; }
    if (t === "Z" || t === "z") { i++; continue; }
    const x = parseFloat(t), y = parseFloat(tokens[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    i += 2;
  }
  return pts;
}

/** Nonzero-winding point-in-polygon (matches the SVG default fill rule). */
function inPoly(x, y, pts) {
  let w = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    const cross = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
    if (y1 <= y) {
      if (y2 > y && cross > 0) w++;
    } else if (y2 <= y && cross < 0) w--;
  }
  return w !== 0;
}

function inRoundRect(u, v) {
  const { x, y, w, h, r } = RECT;
  const x1 = x + w, y1 = y + h;
  if (u < x || u > x1 || v < y || v > y1) return false;
  const qx = Math.max(x + r - u, u - (x1 - r), 0);
  const qy = Math.max(y + r - v, v - (y1 - r), 0);
  return qx * qx + qy * qy <= r * r;
}

function grad(u, v, p0, p1, stops) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
  let t = ((u - p0[0]) * dx + (v - p0[1]) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [pa, ca] = stops[i - 1];
      const [pb, cb] = stops[i];
      const f = (t - pa) / (pb - pa);
      return [
        ca[0] + (cb[0] - ca[0]) * f,
        ca[1] + (cb[1] - ca[1]) * f,
        ca[2] + (cb[2] - ca[2]) * f,
      ];
    }
  }
  return stops[stops.length - 1][1];
}

const G_POLYS = G_PATH_D.map(parsePath);
const ARROW_POLY = parsePath(ARROW_PATH_D);
if (G_POLYS.some((p) => p.length < 3) || ARROW_POLY.length < 3) {
  console.error("FAIL: path parse produced degenerate polygon");
  process.exit(1);
}

/** Sample in userSpace (0..1254), y down — same coordinate system as SVG. */
function sample(u, v) {
  if (!inRoundRect(u, v)) return [0, 0, 0, 0];
  if (inPoly(u, v, ARROW_POLY)) {
    const c = grad(u, v, YEL_P0, YEL_P1, YEL_STOPS);
    return [c[0], c[1], c[2], 255];
  }
  for (const poly of G_POLYS) {
    if (inPoly(u, v, poly)) return [255, 255, 255, 255];
  }
  const c = grad(u, v, BG_P0, BG_P1, BG_STOPS);
  return [c[0], c[1], c[2], 255];
}

// ── Supersample + emit ───────────────────────────────────────────────────
const SIZES = [16, 32, 48, 128];
const SS = 4; // supersampling per axis for smooth edges
mkdirSync(outDir, { recursive: true });

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let sa = 0, sr = 0, sg = 0, sb = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = ((px + (sx + 0.5) / SS) / size) * VB;
          const v = ((py + (sy + 0.5) / SS) / size) * VB;
          const [r, g, b, a] = sample(u, v);
          sa += a;
          sr += r * a;
          sg += g * a;
          sb += b * a;
        }
      }
      const n = SS * SS;
      const outA = Math.round(sa / n);
      let r = 0, g = 0, b = 0;
      if (sa > 0) {
        r = Math.round(sr / sa);
        g = Math.round(sg / sa);
        b = Math.round(sb / sa);
      }
      const o = (py * size + px) * 4;
      buf[o] = r;
      buf[o + 1] = g;
      buf[o + 2] = b;
      buf[o + 3] = outA;
    }
  }
  return buf;
}

// content assertions on the 48px render (ground-truth counts from
// favicon-96x96.png scaled to 48: blue>500, white>50, yellow>20)
{
  const buf = render(48);
  if (buf[3] !== 0) { console.error("FAIL: corner not transparent"); process.exit(1); }
  let y = 0, w = 0, bl = 0;
  for (let i = 0; i < 48 * 48; i++) {
    const o = i * 4;
    if (buf[o + 3] < 200) continue;
    const r = buf[o], g = buf[o + 1], b = buf[o + 2];
    if (r > 200 && g > 130 && b < 100) y++;
    else if (r > 230 && g > 230 && b > 230) w++;
    else if (b > 60 && r < 60 && g < 80) bl++;
  }
  if (bl < 500 || w < 50 || y < 20) {
    console.error(`FAIL: content counts blue=${bl} white=${w} yellow=${y}`);
    process.exit(1);
  }
  console.log(`content check ok @48: blue=${bl} white=${w} yellow=${y}`);
}

for (const size of SIZES) {
  const png = encodePNG(size, size, render(size));
  writeFileSync(resolve(outDir, `icon${size}.png`), png);
  console.log(`Wrote icon${size}.png (${size}×${size})`);
}

console.log(`Icons written to ${outDir.replace(resolve(__dirname, ".."), ".")}`);
