/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CarouselSlide, CanvasObject, ImageObject, TextObject, ShapeObject, ArrowObject, LineObject, AspectPreset, CAROUSEL_PRESETS } from "./types";
import { slidePatternSVG } from "./patternUtil";
import { arrowSVG } from "./arrowGraphic";
import { layoutTextBlock, drawTextBlock } from "./textLayout";
import { SLIDE_FOOTER, footerPalette, footerCounterText } from "./slideLayout";
import JSZip from "jszip";
import { exportSlidesToPdf } from "./pdfExport";

/**
 * Creates an ImageObject with proportional contain sizing that preserves the full image
 * and leaves space for titles/annotations.
 */
export function createImageObject(
  imgSrc: string,
  naturalWidth: number,
  naturalHeight: number,
  canvasWidth: number = 1080,
  canvasHeight: number = 1350,
  zIndex: number = 1
): ImageObject {
  const naturalAspectRatio = naturalWidth / Math.max(1, naturalHeight);

  // Available canvas bounding box for comfortable framing
  const maxWidth = canvasWidth * 0.78;
  const maxHeight = canvasHeight * 0.68;

  let targetWidth = maxWidth;
  let targetHeight = targetWidth / naturalAspectRatio;

  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * naturalAspectRatio;
  }

  // Center horizontally, position slightly lower to allow top title room
  const x = Math.round((canvasWidth - targetWidth) / 2);
  const y = Math.round((canvasHeight - targetHeight) / 2 + 30);

  return {
    id: "obj_" + Math.random().toString(36).substring(2, 9),
    type: "image",
    imgSrc,
    originalWidth: naturalWidth,
    originalHeight: naturalHeight,
    naturalAspectRatio,
    x,
    y,
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
    rotation: 0,
    zIndex,
    opacity: 1,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#000000",
    shadow: naturalHeight > naturalWidth * 1.5 ? "phone" : "md"
  };
}

/**
 * Creates default Text Object
 */
export function createTextObject(
  preset: "heading" | "subheading" | "body" | "caption" | "pill" | "badge" | "label" = "heading",
  canvasWidth: number = 1080,
  canvasHeight: number = 1350,
  zIndex: number = 10,
  isDarkBg: boolean = true
): TextObject {
  const id = "obj_" + Math.random().toString(36).substring(2, 9);
  const baseColor = isDarkBg ? "#F4F7F2" : "#111827";

  switch (preset) {
    case "heading":
      return {
        id,
        type: "text",
        text: "How we simplified this flow",
        fontSize: 54,
        fontWeight: 800,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontColor: baseColor,
        textAlign: "center",
        lineHeight: 1.2,
        letterSpacing: -1,
        textPreset: "heading",
        x: Math.round(canvasWidth * 0.1),
        y: 80,
        width: Math.round(canvasWidth * 0.8),
        height: 120,
        rotation: 0,
        zIndex,
        opacity: 1
      };
    case "subheading":
      return {
        id,
        type: "text",
        text: "Key takeaway & explanation here",
        fontSize: 34,
        fontWeight: 600,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontColor: isDarkBg ? "#CBD6C8" : "#4B5563",
        textAlign: "center",
        lineHeight: 1.3,
        letterSpacing: 0,
        textPreset: "subheading",
        x: Math.round(canvasWidth * 0.15),
        y: canvasHeight - 160,
        width: Math.round(canvasWidth * 0.7),
        height: 80,
        rotation: 0,
        zIndex,
        opacity: 1
      };
    case "body":
      return {
        id,
        type: "text",
        text: "Double-click to type your explanation. Keep it concise, actionable, and focused on value.",
        fontSize: 26,
        fontWeight: 400,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontColor: isDarkBg ? "#94A490" : "#6B7280",
        textAlign: "left",
        lineHeight: 1.5,
        letterSpacing: 0,
        textPreset: "body",
        x: Math.round(canvasWidth * 0.1),
        y: canvasHeight - 220,
        width: Math.round(canvasWidth * 0.8),
        height: 100,
        rotation: 0,
        zIndex,
        opacity: 1
      };
    case "pill":
    case "badge":
      return {
        id,
        type: "text",
        text: "✨ STEP 01",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "ui-monospace, monospace",
        fontColor: "#8BCE62",
        textAlign: "center",
        lineHeight: 1,
        letterSpacing: 1,
        textPreset: "pill",
        textTransform: "uppercase",
        textBgColor: "rgba(117, 171, 82, 0.2)",
        textBgPadding: 12,
        textBgRadius: 20,
        x: Math.round((canvasWidth - 200) / 2),
        y: 40,
        width: 200,
        height: 44,
        rotation: 0,
        zIndex,
        opacity: 1
      };
    case "caption":
    case "label":
    default:
      return {
        id,
        type: "text",
        text: "Tap to inspect details",
        fontSize: 22,
        fontWeight: 500,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontColor: isDarkBg ? "#CBD6C8" : "#4B5563",
        textAlign: "center",
        lineHeight: 1.2,
        letterSpacing: 0,
        textPreset: "caption",
        x: Math.round((canvasWidth - 260) / 2),
        y: canvasHeight - 80,
        width: 260,
        height: 40,
        rotation: 0,
        zIndex,
        opacity: 1
      };
  }
}

/**
 * Creates Shape Object
 */
export function createShapeObject(
  shapeKind: "rectangle" | "rounded-rect" | "circle" | "highlight-bar" = "rounded-rect",
  canvasWidth: number = 1080,
  canvasHeight: number = 1350,
  zIndex: number = 2
): ShapeObject {
  const id = "obj_" + Math.random().toString(36).substring(2, 9);
  if (shapeKind === "highlight-bar") {
    return {
      id,
      type: "shape",
      shapeKind: "highlight-bar",
      fillColor: "rgba(117, 171, 82, 0.25)",
      strokeColor: "#75AB52",
      strokeWidth: 2,
      borderRadius: 8,
      x: Math.round(canvasWidth * 0.1),
      y: 160,
      width: Math.round(canvasWidth * 0.8),
      height: 12,
      rotation: 0,
      zIndex,
      opacity: 1
    };
  }
  return {
    id,
    type: "shape",
    shapeKind,
    fillColor: shapeKind === "circle" ? "rgba(117, 171, 82, 0.15)" : "rgba(255, 255, 255, 0.08)",
    strokeColor: "rgba(117, 171, 82, 0.5)",
    strokeWidth: 2,
    borderRadius: shapeKind === "rounded-rect" ? 20 : 0,
    x: Math.round((canvasWidth - 320) / 2),
    y: Math.round((canvasHeight - 200) / 2),
    width: shapeKind === "circle" ? 220 : 320,
    height: shapeKind === "circle" ? 220 : 200,
    rotation: 0,
    zIndex,
    opacity: 1
  };
}

/**
 * Creates Arrow Object
 */
export function createArrowObject(
  direction: "right" | "left" | "up" | "down" | "curved-right" | "curved-left" = "curved-right",
  canvasWidth: number = 1080,
  canvasHeight: number = 1350,
  zIndex: number = 15
): ArrowObject {
  const id = "obj_" + Math.random().toString(36).substring(2, 9);
  return {
    id,
    type: "arrow",
    arrowDirection: direction,
    color: "#8BCE62",
    strokeWidth: 4,
    label: "Look here",
    x: Math.round(canvasWidth * 0.65),
    y: Math.round(canvasHeight * 0.4),
    width: 180,
    height: 120,
    rotation: 0,
    zIndex,
    opacity: 1
  };
}

/**
 * Loads an HTMLImageElement asynchronously
 */
export function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Renders a full slide to an HTML5 Canvas at target export resolution
 */
export async function renderSlideToCanvas(
  slide: CarouselSlide,
  slideIndex: number,
  totalSlides: number,
  preset: AspectPreset = "portrait",
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const presetConfig = CAROUSEL_PRESETS[preset];
  const width = Math.round(presetConfig.width * scale);
  const height = Math.round(presetConfig.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw Background
  if (slide.backgroundGradient) {
    // Render linear gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, slide.backgroundColor || "#141A12");
    grad.addColorStop(1, slide.backgroundGradient);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = slide.backgroundColor || "#141A12";
  }
  ctx.fillRect(0, 0, width, height);

  // Render slide background pattern (template-aware) or ambient default grid.
  const patternSvg = slidePatternSVG(slide, width, height);
  if (patternSvg) {
    // Template pattern: draw from the same SVG used by the editor preview
    // so the exported image is WYSIWYG-identical to the on-canvas preview.
    const patternUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}`;
    const patternImg = await loadImg(patternUri);
    ctx.save();
    ctx.globalAlpha = (slide.pattern?.opacity ?? 1);
    ctx.drawImage(patternImg, 0, 0, width, height);
    ctx.restore();
  } else {
    // Subtle ambient dot grid — identical art to the editor's no-pattern
    // preview (40px tiling, 1px dots, rgba(117,171,82,0.4) @ 15% opacity).
    ctx.save();
    ctx.fillStyle = "rgba(117, 171, 82, 0.06)";
    const step = 40 * scale;
    const r = 1 * scale;
    for (let x = 1 * scale; x < width; x += step) {
      for (let y = 1 * scale; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 2. Sort Objects by zIndex
  const sortedObjects = [...slide.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // 3. Render Objects — every object is drawn in LOCAL coordinates (its own
  //    top-left origin, like the editor's absolutely-positioned div) with
  //    rotation about its centre, so the exported art matches the preview.
  for (const obj of sortedObjects) {
    ctx.save();
    ctx.globalAlpha = obj.opacity ?? 1;

    const ow = obj.width * scale;
    const oh = obj.height * scale;
    ctx.translate(obj.x * scale, obj.y * scale);
    if (obj.rotation) {
      ctx.translate(ow / 2, oh / 2);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-ow / 2, -oh / 2);
    }

    if (obj.type === "image") {
      const imgObj = obj as ImageObject;
      if (imgObj.imgSrc) {
        try {
          const img = await loadImg(imgObj.imgSrc);

          // Shadow rendering (approximated with a soft blur behind the box)
          if (imgObj.shadow && imgObj.shadow !== "none") {
            ctx.save();
            if (imgObj.shadow === "phone") {
              ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
              ctx.shadowBlur = 32 * scale;
              ctx.shadowOffsetY = 16 * scale;
            } else if (imgObj.shadow === "glow") {
              ctx.shadowColor = "rgba(117, 171, 82, 0.4)";
              ctx.shadowBlur = 24 * scale;
              ctx.shadowOffsetY = 0;
            } else if (imgObj.shadow === "lg") {
              ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
              ctx.shadowBlur = 20 * scale;
              ctx.shadowOffsetY = 10 * scale;
            } else {
              ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
              ctx.shadowBlur = 10 * scale;
              ctx.shadowOffsetY = 4 * scale;
            }
            const radius = (imgObj.borderRadius || 0) * scale;
            ctx.fillStyle = "rgba(0,0,0,0.9)";
            ctx.beginPath();
            ctx.roundRect(0, 0, ow, oh, radius);
            ctx.fill();
            ctx.restore();
          }

          // Clip to the rounded box (the editor clips the object's container)
          const radius = Math.min((imgObj.borderRadius || 0) * scale, ow / 2, oh / 2);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(0, 0, ow, oh, radius);
          ctx.clip();

          // object-contain layout (matches the editor's `object-contain`)
          const aspect = imgObj.naturalAspectRatio || img.naturalWidth / Math.max(1, img.naturalHeight);
          let w = ow;
          let h = oh;
          if (w / h > aspect) w = h * aspect;
          else h = w / aspect;
          const dx = (ow - w) / 2;
          const dy = (oh - h) / 2;
          ctx.drawImage(img, dx, dy, w, h);
          ctx.restore();

          // Border
          if (imgObj.borderWidth && imgObj.borderWidth > 0 && imgObj.borderColor) {
            ctx.save();
            ctx.lineWidth = imgObj.borderWidth * scale;
            ctx.strokeStyle = imgObj.borderColor;
            ctx.beginPath();
            ctx.roundRect(0, 0, ow, oh, radius);
            ctx.stroke();
            ctx.restore();
          }
        } catch (err) {
          console.warn("Could not draw image object:", err);
        }
      }
    } else if (obj.type === "shape") {
      const shapeObj = obj as ShapeObject;
      ctx.save();
      ctx.fillStyle = shapeObj.fillColor || "transparent";
      ctx.strokeStyle = shapeObj.strokeColor || "transparent";
      ctx.lineWidth = (shapeObj.strokeWidth || 0) * scale;

      ctx.beginPath();
      if (shapeObj.shapeKind === "circle" || shapeObj.shapeKind === "highlight-bar") {
        // The editor applies border-radius 9999px → a full pill (sausage) shape.
        ctx.roundRect(0, 0, ow, oh, Math.min(ow, oh) / 2);
      } else if (shapeObj.shapeKind === "rounded-rect") {
        ctx.roundRect(0, 0, ow, oh, (shapeObj.borderRadius || 0) * scale);
      } else {
        ctx.roundRect(0, 0, ow, oh, 0);
      }

      if (shapeObj.fillColor && shapeObj.fillColor !== "transparent") ctx.fill();
      if (shapeObj.strokeWidth && shapeObj.strokeWidth > 0 && shapeObj.strokeColor && shapeObj.strokeColor !== "transparent") {
        ctx.stroke();
      }
      ctx.restore();
    } else if (obj.type === "arrow") {
      // Render the exact editor arrow SVG so export matches the preview.
      const arrowObj = obj as ArrowObject;
      try {
        const arrowUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(arrowSVG(arrowObj))}`;
        const arrowImg = await loadImg(arrowUri);
        ctx.drawImage(arrowImg, 0, 0, ow, oh);
      } catch (err) {
        console.warn("Could not draw arrow object:", err);
      }
    } else if (obj.type === "text") {
      const txtObj = obj as TextObject;
      ctx.save();
      const fontWeight = txtObj.fontWeight || 600;
      const fontFamily = txtObj.fontFamily || "system-ui, -apple-system, sans-serif";
      ctx.font = `${fontWeight} ${(txtObj.fontSize || 32) * scale}px ${fontFamily}`;
      ctx.fillStyle = txtObj.fontColor || "#FFFFFF";
      ctx.textAlign = txtObj.textAlign || "center";
      ctx.textBaseline = "top";

      const layout = layoutTextBlock(ctx, txtObj, scale);
      drawTextBlock(ctx, txtObj, scale, layout);
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. Render Slide Counter / Overlay ("01 / 05") via shared footer geometry
  const fal = footerPalette(slide);
  if (slide.counterEnabled !== false) {
    ctx.save();
    ctx.font = `${SLIDE_FOOTER.counterWeight} ${SLIDE_FOOTER.counterSize * scale}px ui-monospace, monospace`;
    ctx.fillStyle = fal.muted;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(footerCounterText(slideIndex, totalSlides), width - SLIDE_FOOTER.sideInset * scale, height - SLIDE_FOOTER.bottomInset * scale);
    ctx.restore();
  }

  // 5. Render Swipe Cue ("Swipe →")
  if (slide.swipeCueEnabled && slideIndex < totalSlides - 1) {
    ctx.save();
    ctx.font = `600 ${SLIDE_FOOTER.swipeSize * scale}px system-ui, sans-serif`;
    ctx.fillStyle = fal.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Swipe →", width / 2, height - SLIDE_FOOTER.bottomInset * scale);
    ctx.restore();
  }

  // 6. Render Author Handle / Watermark ("@handle")
  if (slide.authorHandle) {
    ctx.save();
    ctx.font = `500 ${SLIDE_FOOTER.authorSize * scale}px system-ui, sans-serif`;
    ctx.fillStyle = fal.muted;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(slide.authorHandle, SLIDE_FOOTER.sideInset * scale, height - SLIDE_FOOTER.bottomInset * scale);
    ctx.restore();
  }

  return canvas;
}

/**
 * Generates thumbnail data URL for a slide
 */
export async function generateSlideThumbnail(
  slide: CarouselSlide,
  slideIndex: number,
  totalSlides: number,
  preset: AspectPreset = "portrait"
): Promise<string> {
  try {
    const canvas = await renderSlideToCanvas(slide, slideIndex, totalSlides, preset, 0.25);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.error("Thumbnail generation error:", err);
    return "";
  }
}

/**
 * Export all slides as high-res ZIP package
 */
export async function exportSlidesToZip(
  slides: CarouselSlide[],
  preset: AspectPreset = "portrait",
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress(i + 1, slides.length);
    const canvas = await renderSlideToCanvas(slides[i], i, slides.length, preset, 1);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
    
    const prefix = String(i + 1).padStart(2, "0");
    const name = i === 0 ? `${prefix}-cover.jpg` : `${prefix}-slide.jpg`;
    zip.file(name, base64Data, { base64: true });
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Export all slides as a multi-page vector PDF Document.
 *
 * The real implementation lives in ./pdfExport — re-exported here so existing
 * callers (`LinkedInCarouselMaker`) keep their import path.
 */
export { exportSlidesToPdf } from "./pdfExport";
