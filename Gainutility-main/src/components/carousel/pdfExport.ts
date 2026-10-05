/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * True-vector PDF export for Carousel Studio.
 *
 * Every slide is drawn onto a native PDF page (1:1 design units) so the output
 * is sharp at any zoom and independent of device DPI:
 *
 *   - solid backgrounds          -> single vector rect
 *   - gradient backgrounds       -> 32 banded vector rects (banded colour
 *                                    interpolation, visually identical to the
 *                                    browser's linear-gradient)
 *   - template patterns          -> high-res (2x) PNG raster from the exact
 *                                    SVG the editor preview uses (WYSIWYG)
 *   - ambient (no-pattern) grid  -> vector dot grid, same art as the editor
 *   - text objects               -> TRUE vector text (standard-14 fonts, exact
 *                                    canvas-derived line wraps); falls back to a
 *                                    2.5x PNG only when a glyph isn't in the
 *                                    font's WinAnsi set (emoji / "→" / exotic
 *                                    punctuation) or a line would overflow
 *   - shapes                     -> vector paths (fill + stroke passes keep the
 *                                    exact fill/stroke alphas independent)
 *   - arrows                     -> 2x PNG raster of the exact editor SVG
 *                                    (preserves marker / round-linecap fidelity)
 *   - images                     -> vector-rounded clip + embedded JPEG/PNG
 *                                    (lossless) + layered vector-drop shadow
 *   - footer overlays            -> vector text + vector chevron, driven by the
 *                                    shared SLIDE_FOOTER constants / palette
 *
 * All object geometry uses the editor's coordinate space (y-down, origin
 * top-left); drawing maths converts to the PDF's y-up, bottom-left space.
 */

import {
  PDFDocument,
  PDFImage,
  PDFFont,
  PDFPage,
  StandardFonts,
  Color,
  rgb,
  colorString,
  LineCapStyle,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  clip
} from "@cantoo/pdf-lib";
import {
  CarouselSlide,
  CanvasObject,
  ImageObject,
  TextObject,
  ShapeObject,
  ArrowObject,
  AspectPreset,
  CAROUSEL_PRESETS
} from "./types";
import { slidePatternSVG } from "./patternUtil";
import { SLIDE_FOOTER, footerPalette, footerCounterText } from "./slideLayout";
import { applyTextTransform, layoutTextBlock, drawTextBlock } from "./textLayout";
import { arrowSVG } from "./arrowGraphic";
import { safeCanvasSize } from "../../utils/imageLimits";

type PDFOperator = ReturnType<typeof pushGraphicsState>;

const KAPPA = 0.5522847498307936;
const DEFAULT_FONT_FAMILY = "system-ui, -apple-system, sans-serif";

/* ------------------------------------------------------------------------- */
/* Colour helpers                                                             */
/* ------------------------------------------------------------------------- */

interface ParsedPdfColor {
  color?: Color;
  /** 0..1 alpha from the CSS colour (undefined when fully opaque). */
  alpha?: number;
}

/** Parse CSS → pdf-lib Color + alpha; invalid / transparent → empty. */
function parsePdfColor(css: string | undefined): ParsedPdfColor {
  if (!css || css === "transparent") return {};
  try {
    const { rgb: color, alpha } = colorString(css);
    return { color, alpha: alpha !== undefined && alpha < 0.999 ? alpha : undefined };
  } catch {
    return {};
  }
}

/** Combine a colour's own alpha with the object opacity into a draw opacity. */
function effectiveOpacity(parsed: ParsedPdfColor, objOpacity: number | undefined): number | undefined {
  const combined = (parsed.alpha ?? 1) * (objOpacity ?? 1);
  return combined >= 0.999 ? undefined : combined;
}

/* ------------------------------------------------------------------------- */
/* SVG-path builders (drawSvgPath places (0,0) at x/y with +y running "down", */
/* matching canvas documents directly).                                      */
/* ------------------------------------------------------------------------- */

function roundedRectPath(x: number, y: number, w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius || 0, w / 2, h / 2));
  return [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `C ${x + w - r * (1 - KAPPA)} ${y} ${x + w} ${y + r * (1 - KAPPA)} ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `C ${x + w} ${y + h - r * (1 - KAPPA)} ${x + w - r * (1 - KAPPA)} ${y + h} ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `C ${x + r * (1 - KAPPA)} ${y + h} ${x} ${y + h - r * (1 - KAPPA)} ${x} ${y + h - r}`,
    `V ${y + r}`,
    `C ${x} ${y + r * (1 - KAPPA)} ${x + r * (1 - KAPPA)} ${y} ${x + r} ${y}`,
    "Z"
  ].join(" ");
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const ox = rx * KAPPA;
  const oy = ry * KAPPA;
  return [
    `M ${cx} ${cy - ry}`,
    `C ${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy}`,
    `C ${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry}`,
    `C ${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy}`,
    `C ${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry}`,
    "Z"
  ].join(" ");
}

/** One big path containing every ambient dot (single operator stream). */
function ambientDotGridPath(pageW: number, pageH: number): string {
  const step = 40;
  const r = 1;
  const parts: string[] = [];
  for (let x = 1; x < pageW; x += step) {
    for (let y = 1; y < pageH; y += step) {
      parts.push(ellipsePath(x, y, r, r));
    }
  }
  return parts.join(" ");
}

/* ------------------------------------------------------------------------- */
/* PDF low-level operators                                                    */
/* ------------------------------------------------------------------------- */

/** Clip to a rounded rect in PDF (y-up) coordinates. */
function roundedRectClipOperators(x0: number, y0: number, x1: number, y1: number, radius: number): PDFOperator[] {
  const r = Math.max(0, Math.min(radius || 0, (x1 - x0) / 2, (y1 - y0) / 2));
  return [
    moveTo(x0 + r, y0),
    lineTo(x1 - r, y0),
    appendBezierCurve(x1 - r * (1 - KAPPA), y0, x1, y0 + r * (1 - KAPPA), x1, y0 + r),
    lineTo(x1, y1 - r),
    appendBezierCurve(x1, y1 - r * (1 - KAPPA), x1 - r * (1 - KAPPA), y1, x1 - r, y1),
    lineTo(x0 + r, y1),
    appendBezierCurve(x0 + r * (1 - KAPPA), y1, x0, y1 - r * (1 - KAPPA), x0, y1 - r),
    lineTo(x0, y0 + r),
    appendBezierCurve(x0, y0 + r * (1 - KAPPA), x0 + r * (1 - KAPPA), y0, x0 + r, y0),
    closePath(),
    clip()
  ];
}

/**
 * Push the object's rotation transform. Objects rotate about their centre with
 * the editor's screen-clockwise degrees; the PDF CTM is composed as
 * T(c) * R * T(-c) (pdf-lib ops are applied left-to-right to the CTM).
 */
function beginObjectTransform(page: PDFPage, obj: CanvasObject, pageH: number): void {
  if (!obj.rotation) return;
  const rad = -((obj.rotation % 360) * Math.PI) / 180;
  const cx = obj.x + obj.width / 2;
  const cy = pageH - (obj.y + obj.height / 2);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  page.pushOperators(
    pushGraphicsState(),
    concatTransformationMatrix(1, 0, 0, 1, -cx, -cy),
    concatTransformationMatrix(cos, sin, -sin, cos, 0, 0),
    concatTransformationMatrix(1, 0, 0, 1, cx, cy)
  );
}

function endObjectTransform(page: PDFPage, obj: CanvasObject): void {
  if (obj.rotation) page.pushOperators(popGraphicsState());
}

/* ------------------------------------------------------------------------- */
/* Fonts (standard-14, embedded once per document)                            */
/* ------------------------------------------------------------------------- */

interface PdfBatch {
  doc: PDFDocument;
  fonts: Map<string, PDFFont>;
  rasters: Map<string, Promise<PDFImage | null>>;
  scratch: CanvasRenderingContext2D;
}

async function createBatch(doc: PDFDocument): Promise<PdfBatch> {
  const scratchCanvas = document.createElement("canvas");
  const scratch = scratchCanvas.getContext("2d");
  if (!scratch) throw new Error("Could not create measurement canvas");

  const fonts = new Map<string, PDFFont>();
  const wanted = [
    StandardFonts.Helvetica,
    StandardFonts.HelveticaBold,
    StandardFonts.Courier,
    StandardFonts.CourierBold,
    StandardFonts.TimesRoman,
    StandardFonts.TimesRomanBold
  ];
  await Promise.all(wanted.map(async (key) => fonts.set(key, await doc.embedFont(key))));

  return { doc, fonts, rasters: new Map(), scratch };
}

/** Map an editor font-family / weight onto the matching standard-14 font. */
function resolvePdfFont(batch: PdfBatch, fontFamily: string, fontWeight: number | string): PDFFont {
  const family = (fontFamily || DEFAULT_FONT_FAMILY).toLowerCase();
  const bold = Number(fontWeight || 600) >= 600;
  let key: StandardFonts;
  if (family.includes("mono")) {
    key = bold ? StandardFonts.CourierBold : StandardFonts.Courier;
  } else if (family.includes("serif")) {
    key = bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  } else {
    key = bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
  }
  const font = batch.fonts.get(key);
  if (!font) throw new Error(`Unsupported PDF font: ${key}`);
  return font;
}

/* ------------------------------------------------------------------------- */
/* Raster helpers (patterns, arrows, glyph-unsafe text, non-JPEG/PNG images)  */
/* ------------------------------------------------------------------------- */

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Render a loaded image into a (safe-)sized canvas and embed it as PNG. */
async function drawCanvasToPdfImage(batch: PdfBatch, cacheKey: string, targetW: number, targetH: number, drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): Promise<PDFImage | null> {
  const existing = batch.rasters.get(cacheKey);
  if (existing) return await existing;

  const promise = (async () => {
    if (targetW <= 0 || targetH <= 0) return null;
    const safe = safeCanvasSize(targetW, targetH);
    const canvas = document.createElement("canvas");
    canvas.width = safe.width;
    canvas.height = safe.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawFn(ctx, safe.width, safe.height);
    try {
      return await batch.doc.embedPng(canvas.toDataURL("image/png"));
    } catch {
      return null;
    }
  })();

  batch.rasters.set(cacheKey, promise);
  return await promise;
}

/** 2x PNG of the template pattern (same SVG the editor preview uses). */
function rasterizePattern(batch: PdfBatch, slide: CarouselSlide, pageW: number, pageH: number): Promise<PDFImage | null> {
  const svg = slidePatternSVG(slide, pageW, pageH);
  if (!svg) return Promise.resolve(null);
  const pattern = slide.pattern;
  const cacheKey = "pattern:" + (pattern?.type || "none") + ":" + (pattern?.color || "") + ":" + (pattern?.scale || 0);
  return drawCanvasToPdfImage(batch, cacheKey, pageW * 2, pageH * 2, (ctx, w, h) => {
    loadImage(svgDataUri(svg)).then((img) => ctx.drawImage(img, 0, 0, w, h)).catch(() => {});
  });
}

/** 2x PNG of the exact editor arrow SVG (marker + round linecaps). */
function rasterizeArrow(batch: PdfBatch, obj: ArrowObject): Promise<PDFImage | null> {
  const svg = arrowSVG(obj);
  const cacheKey = "arrow:" + obj.id + ":" + (obj.arrowDirection || "right") + ":" + (obj.color || "#75AB52") + ":" + (obj.strokeWidth || 4);
  return drawCanvasToPdfImage(batch, cacheKey, obj.width * 2, obj.height * 2, (ctx, w, h) => {
    loadImage(svgDataUri(svg)).then((img) => ctx.drawImage(img, 0, 0, w, h)).catch(() => {});
  });
}

/**
 * High-res PNG fallback for text whose glyphs can't be represented by the
 * standard-14 fonts, or whose wrapped lines would overflow in the substituted
 * metrics. Layout is computed at 2.5x and tightly cropped around the text so
 * the embedded image is small but razor-sharp.
 */
function rasterizeTextObject(batch: PdfBatch, obj: TextObject, res: number): Promise<PDFImage | null> {
  const probe = batch.scratch;
  probe.font = `${obj.fontWeight || 600} ${Math.max(1, obj.fontSize || 32)}px ${obj.fontFamily || DEFAULT_FONT_FAMILY}`;
  const layout = layoutTextBlock(probe, obj, res);
  const regionTop = Math.min(0, layout.pillTop);
  const regionBottom = Math.max(obj.height * res, layout.pillTop + layout.pillHeight);
  const cacheKey =
    "text:" + obj.id + ":" + layout.lines.join("\u0000") + ":" + obj.fontSize + ":" + obj.fontWeight +
    ":" + obj.fontFamily + ":" + obj.fontColor + ":" + obj.textAlign + ":" + obj.lineHeight +
    ":" + obj.letterSpacing + ":" + obj.textTransform + ":" + obj.textBgColor + ":" +
    obj.textBgPadding + ":" + obj.textBgRadius + ":" + obj.width + ":" + obj.height;

  const canvasW = Math.max(4, Math.ceil(obj.width * res));
  const canvasH = Math.max(4, Math.ceil(regionBottom - regionTop));
  return drawCanvasToPdfImage(batch, cacheKey, canvasW, canvasH, (ctx) => {
    ctx.translate(0, -regionTop);
    ctx.font = probe.font;
    ctx.fillStyle = obj.fontColor || "#FFFFFF";
    ctx.textAlign = obj.textAlign || "center";
    ctx.textBaseline = "top";
    drawTextBlock(ctx, obj, res, layout);
  });
}

/** Embed a user image (JPEG/PNG losslessly, everything else via canvas). */
function embedSourceImage(batch: PdfBatch, src: string): Promise<PDFImage | null> {
  if (!src) return Promise.resolve(null);
  const cacheKey = "src:" + src;
  const existing = batch.rasters.get(cacheKey);
  if (existing) return existing;

  const promise = (async (): Promise<PDFImage | null> => {
    try {
      const res = await fetch(src);
      if (!res.ok) return null;
      const blob = await res.blob();
      const bytes = await blob.arrayBuffer();
      if (blob.type.includes("jpeg")) return await batch.doc.embedJpg(bytes);
      if (blob.type.includes("png")) return await batch.doc.embedPng(bytes);
      // webp / svg / unknown: decode through an image element → PNG.
      const img = await loadImage(src);
      return await drawCanvasToPdfImage(batch, cacheKey, img.naturalWidth || 1, img.naturalHeight || 1, (ctx, w, h) => {
        ctx.drawImage(img, 0, 0, w, h);
      });
    } catch {
      return null;
    }
  })();

  batch.rasters.set(cacheKey, promise);
  return promise;
}

/* ------------------------------------------------------------------------- */
/* Per-object rendering                                                       */
/* ------------------------------------------------------------------------- */

async function drawTextObject(batch: PdfBatch, page: PDFPage, pageH: number, obj: TextObject, pageW: number): Promise<void> {
  const raw = obj.text || "";
  if (!raw.trim()) return;

  // Measure with the BROWSER font so line breaks match the editor exactly.
  const probe = batch.scratch;
  probe.font = `${obj.fontWeight || 600} ${Math.max(1, obj.fontSize || 32)}px ${obj.fontFamily || DEFAULT_FONT_FAMILY}`;
  const layout = layoutTextBlock(probe, obj, 1);
  if (layout.lines.length === 0) return;

  const fontSize = obj.fontSize || 32;
  const spacing = obj.letterSpacing || 0;
  const font = resolvePdfFont(batch, obj.fontFamily || "", obj.fontWeight || 600);
  const transformed = applyTextTransform(raw, obj.textTransform);

  // Glyph-unsafe (emoji, "→", exotic punctuation) or metric-overflow → raster.
  const fits = (line: string) =>
    font.widthOfTextAtSize(line, fontSize) + Math.max(0, line.length - 1) * spacing <=
    Math.max(8, obj.width - layout.pad * 2) + 0.5;
  const needsRaster = !(await glyphsSafe(font, transformed)) || !layout.lines.every(fits);

  if (needsRaster) {
    const res = 2.5;
    const img = await rasterizeTextObject(batch, obj, res);
    if (!img) return;
    const regionTopDoc = Math.min(0, layout.pillTop); // scale-1 layout
    const regionBottomDoc = Math.max(obj.height, layout.pillTop + layout.pillHeight);
    const top = obj.y + regionTopDoc;
    const rasterH = regionBottomDoc - regionTopDoc;
    page.drawImage(img, {
      x: obj.x,
      y: pageH - (top + rasterH),
      width: obj.width,
      height: rasterH,
      opacity: obj.opacity ?? 1
    });
    return;
  }

  // Text pill: content-height rounded rect (matches the editor's styled div —
  // full box width, text + 2×padding tall, vertically centered).
  const pill = parsePdfColor(obj.textBgColor);
  if (pill.color && obj.textBgColor !== "transparent") {
    const pillRadius = Math.max(0, Math.min(obj.textBgRadius || 12, obj.width / 2, layout.pillHeight / 2));
    page.drawSvgPath(roundedRectPath(0, layout.pillTop, obj.width, layout.pillHeight, pillRadius), {
      x: obj.x,
      y: pageH - obj.y,
      color: pill.color,
      opacity: effectiveOpacity(pill, obj.opacity)
    });
  }

  const parsedColor = parsePdfColor(obj.fontColor || "#FFFFFF");
  const fillColor = parsedColor.color || rgb(1, 1, 1);
  const opacity = effectiveOpacity(parsedColor, obj.opacity);
  const ascent = font.heightAtSize(fontSize, { descender: false });
  const lineHeightPx = fontSize * (obj.lineHeight || 1.3);

  for (let i = 0; i < layout.lines.length; i++) {
    const line = layout.lines[i];
    const lineWidth = font.widthOfTextAtSize(line, fontSize) + Math.max(0, line.length - 1) * spacing;
    const lineTopCanvas = obj.y + layout.contentTop + i * lineHeightPx;
    const baselineY = pageH - (lineTopCanvas + ascent);

    let x = obj.x + layout.pad;
    if (obj.textAlign === "center") x = obj.x + obj.width / 2 - lineWidth / 2;
    else if (obj.textAlign === "right") x = obj.x + obj.width - layout.pad - lineWidth;

    page.drawText(line, {
      x: Math.min(Math.max(x, 0), Math.max(0, pageW - lineWidth)),
      y: baselineY,
      font,
      size: fontSize,
      color: fillColor,
      opacity,
      characterSpacing: spacing
    });
  }
}

function drawShapeObject(page: PDFPage, pageH: number, obj: ShapeObject): void {
  const w = obj.width;
  const h = obj.height;
  let path: string;
  if (obj.shapeKind === "circle" || obj.shapeKind === "highlight-bar") {
    // The editor applies border-radius 9999px → a full pill (sausage) shape.
    path = roundedRectPath(0, 0, w, h, Math.min(w, h) / 2);
  } else if (obj.shapeKind === "rounded-rect") {
    path = roundedRectPath(0, 0, w, h, obj.borderRadius || 0);
  } else {
    path = roundedRectPath(0, 0, w, h, 0);
  }

  const fill = parsePdfColor(obj.fillColor);
  const stroke = parsePdfColor(obj.strokeColor);
  const objAlpha = obj.opacity ?? 1;

  // Fill and stroke use independent alphas → draw as two passes.
  if (fill.color) {
    page.drawSvgPath(path, {
      x: obj.x,
      y: pageH - obj.y,
      color: fill.color,
      opacity: effectiveOpacity(fill, objAlpha)
    });
  }
  if (stroke.color && obj.strokeWidth) {
    page.drawSvgPath(path, {
      x: obj.x,
      y: pageH - obj.y,
      borderColor: stroke.color,
      borderWidth: obj.strokeWidth,
      borderLineCap: LineCapStyle.Round,
      borderOpacity: effectiveOpacity(stroke, objAlpha)
    });
  }
}

/** Layered rounded-rect fills approximate the soft CSS drop shadows. */
function drawImageShadow(page: PDFPage, pageH: number, obj: ImageObject, radius: number): void {
  const shadow = obj.shadow || "none";
  const rect = roundedRectPath(0, 0, obj.width, obj.height, radius);

  let layers: ReadonlyArray<{ dy: number; alpha: number; color: string }>;
  switch (shadow) {
    case "sm":
      layers = [{ dy: 4, alpha: 0.26, color: "#000000" }, { dy: 8, alpha: 0.1, color: "#000000" }];
      break;
    case "md":
      layers = [
        { dy: 6, alpha: 0.3, color: "#000000" },
        { dy: 12, alpha: 0.16, color: "#000000" },
        { dy: 18, alpha: 0.06, color: "#000000" }
      ];
      break;
    case "lg":
      layers = [
        { dy: 8, alpha: 0.34, color: "#000000" },
        { dy: 16, alpha: 0.22, color: "#000000" },
        { dy: 26, alpha: 0.08, color: "#000000" }
      ];
      break;
    case "glow":
      layers = [
        { dy: 0, alpha: 0.18, color: "#75AB52" },
        { dy: 0, alpha: 0.12, color: "#75AB52" },
        { dy: 0, alpha: 0.06, color: "#75AB52" }
      ];
      break;
    case "phone":
      layers = [
        { dy: 8, alpha: 0.4, color: "#000000" },
        { dy: 18, alpha: 0.24, color: "#000000" },
        { dy: 28, alpha: 0.1, color: "#000000" }
      ];
      break;
    default:
      return;
  }

  for (const layer of layers) {
    const parsed = parsePdfColor(layer.color);
    if (!parsed.color) continue;
    const alpha = layer.alpha * (obj.opacity ?? 1);
    page.drawSvgPath(rect, {
      x: obj.x,
      y: pageH - obj.y - layer.dy,
      color: parsed.color,
      opacity: alpha >= 0.999 ? undefined : alpha
    });
  }
}

async function drawImageObject(batch: PdfBatch, page: PDFPage, pageH: number, obj: ImageObject): Promise<void> {
  const png = await embedSourceImage(batch, obj.imgSrc);
  if (!png) return;

  const radius = Math.max(0, Math.min(obj.borderRadius || 0, obj.width / 2, obj.height / 2));

  // Shadow first (under the clipped area).
  drawImageShadow(page, pageH, obj, radius);

  // Clip to the rounded box (the editor clips the object's container).
  const x0 = obj.x;
  const y0 = pageH - (obj.y + obj.height);
  const x1 = obj.x + obj.width;
  const y1 = pageH - obj.y;
  page.pushOperators(pushGraphicsState(), ...roundedRectClipOperators(x0, y0, x1, y1, radius));

  // object-contain layout (matches the editor's `object-contain`).
  const aspect = obj.naturalAspectRatio || png.width / png.height;
  let w = obj.width;
  let h = obj.height;
  if (w / h > aspect) {
    w = h * aspect;
  } else {
    h = w / aspect;
  }
  const dx = obj.x + (obj.width - w) / 2;
  const dy = obj.y + (obj.height - h) / 2; // canvas (top-left) coordinates

  page.drawImage(png, {
    x: dx,
    y: pageH - (dy + h),
    width: w,
    height: h,
    opacity: obj.opacity ?? 1
  });
  page.pushOperators(popGraphicsState());

  // Border stroke on top of the (clipped) image, matching the container ring.
  if (obj.borderWidth && obj.borderColor) {
    const parsed = parsePdfColor(obj.borderColor);
    if (parsed.color) {
      page.drawSvgPath(roundedRectPath(0, 0, obj.width, obj.height, radius), {
        x: obj.x,
        y: pageH - obj.y,
        borderColor: parsed.color,
        borderWidth: obj.borderWidth,
        borderLineCap: LineCapStyle.Round,
        borderOpacity: effectiveOpacity(parsed, obj.opacity)
      });
    }
  }
}

async function drawArrowObject(batch: PdfBatch, page: PDFPage, pageH: number, obj: ArrowObject): Promise<void> {
  const img = await rasterizeArrow(batch, obj);
  if (!img) return;
  page.drawImage(img, {
    x: obj.x,
    y: pageH - (obj.y + obj.height),
    width: obj.width,
    height: obj.height,
    opacity: obj.opacity ?? 1
  });
}

/* ------------------------------------------------------------------------- */
/* Background + footer                                                        */
/* ------------------------------------------------------------------------- */

function lerpChannel(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function drawBackground(page: PDFPage, pageW: number, pageH: number, slide: CarouselSlide): void {
  if (slide.backgroundGradient && slide.backgroundColor) {
    const start = parsePdfColor(slide.backgroundColor || "#141A12");
    const end = parsePdfColor(slide.backgroundGradient);
    if (start.color && end.color) {
      const s = start.color as { red: number; green: number; blue: number };
      const e = end.color as { red: number; green: number; blue: number };
      const bands = 32;
      const bandH = pageH / bands;
      for (let i = 0; i < bands; i++) {
        const t = (i + 0.5) / bands;
        page.drawSvgPath(`M 0 0 H ${pageW} V ${bandH} H 0 Z`, {
          x: 0,
          y: pageH - (i + 1) * bandH,
          color: rgb(lerpChannel(s.red, e.red, t), lerpChannel(s.green, e.green, t), lerpChannel(s.blue, e.blue, t))
        });
      }
      return;
    }
  }
  const solid = parsePdfColor(slide.backgroundColor || "#141A12");
  if (solid.color) {
    page.drawSvgPath(`M 0 0 H ${pageW} V ${pageH} H 0 Z`, { x: 0, y: pageH, color: solid.color });
  }
}

async function drawPatternOrAmbient(batch: PdfBatch, page: PDFPage, pageW: number, pageH: number, slide: CarouselSlide): Promise<void> {
  const pattern = await rasterizePattern(batch, slide, pageW, pageH);
  if (pattern) {
    page.drawImage(pattern, {
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      opacity: slide.pattern?.opacity ?? 1
    });
    return;
  }
  // Ambient dot grid — same art as the editor's no-pattern preview.
  const dots = ambientDotGridPath(pageW, pageH);
  if (dots) {
    const dot = parsePdfColor("rgba(117, 171, 82, 0.4)");
    page.drawSvgPath(dots, { x: 0, y: pageH, color: dot.color || rgb(117 / 255, 171 / 255, 82 / 255), opacity: 0.06 });
  }
}

function drawFooter(batch: PdfBatch, page: PDFPage, pageW: number, pageH: number, slide: CarouselSlide, slideIndex: number, totalSlides: number): void {
  const pal = footerPalette(slide);
  const muted = parsePdfColor(pal.muted);
  const accent = parsePdfColor(pal.accent);
  const baseline = pageH - SLIDE_FOOTER.bottomInset;

  const counterFont = batch.fonts.get(StandardFonts.CourierBold);
  if (slide.counterEnabled !== false && muted.color && counterFont) {
    const counterText = footerCounterText(slideIndex, totalSlides);
    const size = SLIDE_FOOTER.counterSize;
    const width = counterFont.widthOfTextAtSize(counterText, size);
    page.drawText(counterText, {
      x: pageW - SLIDE_FOOTER.sideInset - width,
      y: baseline,
      font: counterFont,
      size,
      color: muted.color,
      opacity: muted.alpha
    });
  }

  const authorFont = batch.fonts.get(StandardFonts.Helvetica);
  if (slide.authorHandle && muted.color && authorFont) {
    page.drawText(slide.authorHandle, {
      x: SLIDE_FOOTER.sideInset,
      y: baseline,
      font: authorFont,
      size: SLIDE_FOOTER.authorSize,
      color: muted.color,
      opacity: muted.alpha
    });
  }

  const swipeFont = batch.fonts.get(StandardFonts.HelveticaBold);
  if (slide.swipeCueEnabled && slideIndex < totalSlides - 1 && accent.color && swipeFont) {
    const size = SLIDE_FOOTER.swipeSize;
    const ascent = swipeFont.heightAtSize(size, { descender: false });
    const label = "Swipe";
    const textW = swipeFont.widthOfTextAtSize(label, size);
    const gap = 10;
    const chevW = 13;
    const chevH = 20;
    const totalW = textW + gap + chevW;
    const x0 = (pageW - totalW) / 2;
    const midBottom = baseline - ascent + size / 2; // pdf (y-up) midline
    page.drawText(label, { x: x0, y: baseline, font: swipeFont, size, color: accent.color, opacity: accent.alpha });
    if (muted.color) {
      // Vector chevron (avoids the non-WinAnsi "→" glyph). Drawn in canvas
      // (y-down) local coordinates with origin at the page top.
      const chevLeft = x0 + textW + gap;
      const mid = pageH - midBottom;
      const path = `M ${chevLeft} ${mid - chevH / 2} L ${chevLeft + chevW} ${mid} L ${chevLeft} ${mid + chevH / 2}`;
      page.drawSvgPath(path, {
        x: 0,
        y: pageH,
        borderColor: accent.color,
        borderWidth: 2.4,
        borderLineCap: LineCapStyle.Round,
        borderOpacity: accent.alpha
      });
    }
  }
}

/* ------------------------------------------------------------------------- */
/* Glyph-safety (WinAnsi coverage of the standard-14 fonts)                   */
/* ------------------------------------------------------------------------- */

const paintGlyphCache = new Map<string, Set<number>>();

async function glyphsSafe(font: PDFFont, text: string): Promise<boolean> {
  const key = (font as unknown as { key?: string }).key || "std";
  let set = paintGlyphCache.get(key);
  if (!set) {
    set = new Set(font.getCharacterSet());
    paintGlyphCache.set(key, set);
  }
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c > 31 && !set.has(c)) return false;
  }
  return true;
}

/* ------------------------------------------------------------------------- */
/* Main export                                                                */
/* ------------------------------------------------------------------------- */

export async function exportSlidesToPdf(
  slides: CarouselSlide[],
  preset: AspectPreset = "portrait",
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const presetConfig = CAROUSEL_PRESETS[preset];
  const pageW = presetConfig.width;
  const pageH = presetConfig.height;

  const doc = await PDFDocument.create();
  const batch = await createBatch(doc);

  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress(i + 1, slides.length);

    const page = doc.addPage([pageW, pageH]);
    const slide = slides[i];

    drawBackground(page, pageW, pageH, slide);
    await drawPatternOrAmbient(batch, page, pageW, pageH, slide);

    const sortedObjects = [...slide.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const obj of sortedObjects) {
      beginObjectTransform(page, obj, pageH);
      try {
        if (obj.type === "image") {
          await drawImageObject(batch, page, pageH, obj as ImageObject);
        } else if (obj.type === "shape") {
          drawShapeObject(page, pageH, obj as ShapeObject);
        } else if (obj.type === "arrow") {
          await drawArrowObject(batch, page, pageH, obj as ArrowObject);
        } else if (obj.type === "text") {
          await drawTextObject(batch, page, pageH, obj as TextObject, pageW);
        }
        // line objects are a dormant legacy type → intentionally skipped.
      } finally {
        endObjectTransform(page, obj);
      }
    }

    drawFooter(batch, page, pageW, pageH, slide, i, slides.length);
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}