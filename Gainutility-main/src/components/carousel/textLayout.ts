/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared text-box layout used by every renderer so the on-canvas preview, the
 * PNG/ZIP export, the vector PDF export and the PDF "unsafe glyph" raster
 * fallback all agree with the editor:
 *
 *   - background "pill" hugs the text like the editor: the styled div is
 *     `w-full` with auto height, so the pill spans the full box width but only
 *     `text block + 2×padding` of height, vertically centered (overflow spills
 *     equally on both edges, exactly like the flex `justify-center`)
 *   - text is vertically centered inside the padded content region
 *   - `letterSpacing` is folded into wrap measurement and glyph placement so
 *     every renderer lays out identically
 */
import { TextObject } from "./types";

/** Text transform parity with the editor's CSS `text-transform`. */
export function applyTextTransform(text: string, transform: TextObject["textTransform"] | string | undefined): string {
  if (!transform || transform === "none") return text;
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "capitalize") return text.replace(/\b[a-z]/g, (m) => m.toUpperCase());
  return text;
}

/**
 * Greedy word-wrapping helper (paragraph-aware). Accepts a width-measuring
 * function so it works with both `CanvasRenderingContext2D` and a PDF font.
 */
export function wrapWords(
  measure: (text: string) => number,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (measure(currentLine + " " + word) <= maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

/** Measured, scaled layout for a text object (values in scaled px). */
export interface TextLayout {
  fontSize: number;
  lineHeightPx: number;
  lines: string[];
  blockHeight: number;
  /** Local (object-top-relative) top of the text block; can be negative. */
  contentTop: number;
  /** Scaled content padding inside the pill (matches `textBgPadding`). */
  pad: number;
  /** Scaled pill width (full object width, like the editor's w-full div). */
  pillWidth: number;
  /** Local top of the pill (content box + padding); can be negative. */
  pillTop: number;
  /** Pill height (text block + 2×padding), the editor's content box. */
  pillHeight: number;
}

/**
 * Compute a text object's wrapped lines and vertical geometry. `ctx` is only
 * used for width measurement at the caller-provided font.
 *
 * Content region mimics the editor's padded flex box: `pad` insets the text on
 * every side, wrapped line width is bounded by `width - 2*pad`, and lines are
 * vertically centered so overflow spills equally above and below.
 */
export function layoutTextBlock(
  ctx: CanvasRenderingContext2D,
  obj: TextObject,
  scale: number
): TextLayout {
  const fontSize = (obj.fontSize || 32) * scale;
  const lineHeightPx = fontSize * (obj.lineHeight || 1.3);
  const text = applyTextTransform(obj.text || "", obj.textTransform);
  const pad = (obj.textBgPadding || 0) * scale;
  const spacing = ((obj.letterSpacing || 0) * scale);
  const maxWidth = Math.max(8, (obj.width - pad * 2) * scale);
  const lines = wrapWords(
    (s) => ctx.measureText(s).width + Math.max(0, s.length - 1) * spacing,
    text,
    maxWidth
  );
  const pillWidth = obj.width * scale;
  const blockHeight = lines.length * lineHeightPx;
  const usableHeight = Math.max(0, obj.height * scale - pad * 2);
  const contentTop = pad + (usableHeight - blockHeight) / 2;
  const pillTop = contentTop - pad;
  const pillHeight = blockHeight + pad * 2;
  return { fontSize, lineHeightPx, lines, blockHeight, contentTop, pad, pillWidth, pillTop, pillHeight };
}

/**
 * Draw a text object in LOCAL coordinates — the origin is the object's top-left
 * in scaled space. The caller must set `ctx.font`, `ctx.fillStyle`,
 * `ctx.textAlign` and `ctx.textBaseline="top"`.
 */
export function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  obj: TextObject,
  scale: number,
  layout: TextLayout
): void {
  // Letter-spacing parity across renderers (Chrome 99+ / Firefox 126+).
  const ctxWithSpacing = ctx as CanvasRenderingContext2D & { letterSpacing: string };
  try {
    ctxWithSpacing.letterSpacing = `${(obj.letterSpacing || 0) * scale}px`;
  } catch {
    // Older browsers: ignore; only the wrap measurement accounts for spacing.
  }

  if (obj.textBgColor && obj.textBgColor !== "transparent") {
    const pillRadius = Math.max(0, Math.min(obj.textBgRadius || 12, layout.pillWidth / 2, layout.pillHeight / 2));
    ctx.fillStyle = obj.textBgColor;
    ctx.beginPath();
    ctx.roundRect(0, layout.pillTop, layout.pillWidth, layout.pillHeight, pillRadius);
    ctx.fill();
  }

  const aligned = obj.textAlign || "center";
  let textStartX = 0;
  if (aligned === "center") textStartX = (obj.width * scale) / 2;
  else if (aligned === "right") textStartX = obj.width * scale;

  let curY = layout.contentTop;
  for (const line of layout.lines) {
    ctx.fillText(line, textStartX, curY);
    curY += layout.lineHeightPx;
  }
}