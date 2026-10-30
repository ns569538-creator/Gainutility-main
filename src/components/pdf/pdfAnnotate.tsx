import React from "react";
import {
  Crop,
  Hash,
  Stamp,
  Eraser,
  Layers,
  PanelTop,
  RotateCcw
} from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import { baseName, rasterizeToPdf, sanitizeText, parsePageRanges } from "./helpers";
import { PDFDocument, StandardFonts, rgb, degrees } from "@cantoo/pdf-lib";

const POSITIONS = [
  ["bottom-center", "Bottom Center"],
  ["bottom-right", "Bottom Right"],
  ["bottom-left", "Bottom Left"],
  ["top-center", "Top Center"],
  ["top-right", "Top Right"],
  ["top-left", "Top Left"],
] as const;

/* ================================= CROP PDF ================================ */

export const CropPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="crop-pdf"
    title="Crop PDF"
    desc="Trim margins from every page by setting a precise crop box — content is preserved, only the visible area changes."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<Crop className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ top: 5, right: 5, bottom: 5, left: 5 }}
    getOverlay={(options) => {
      return (ctx, page) => {
        const topPx = (options.top / 100) * page.height;
        const bottomPx = (options.bottom / 100) * page.height;
        const leftPx = (options.left / 100) * page.width;
        const rightPx = (options.right / 100) * page.width;

        ctx.save();
        // Dim the cropped-out areas
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        // Top rect
        ctx.fillRect(0, 0, page.width, topPx);
        // Bottom rect
        ctx.fillRect(0, page.height - bottomPx, page.width, bottomPx);
        // Left rect
        ctx.fillRect(0, topPx, leftPx, page.height - topPx - bottomPx);
        // Right rect
        ctx.fillRect(page.width - rightPx, topPx, rightPx, page.height - topPx - bottomPx);

        // Crop bounding box outline
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(leftPx, topPx, page.width - leftPx - rightPx, page.height - topPx - bottomPx);
        ctx.restore();
      };
    }}
    optionsPanel={({ options, setOptions }) => (
      <div className="space-y-4">
        <p className="text-xs text-text-muted">
          Adjust margins below. The amber dashed outline in the live preview shows the active crop boundary:
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <label key={side} className="text-xs font-semibold capitalize text-text-main space-y-1 block">
              <span>{side} ({options[side]}%)</span>
              <input
                type="range"
                min={0}
                max={40}
                value={options[side]}
                onChange={(e) =>
                  setOptions((o: any) => ({ ...o, [side]: Number(e.target.value) || 0 }))
                }
                className="w-full accent-brand-primary cursor-pointer"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOptions({ top: 5, right: 5, bottom: 5, left: 5 })}
          className="text-xs font-mono text-brand-primary hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset Margins
        </button>
      </div>
    )}
    processFiles={async ([file]: File[], options) => {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const pages = doc.getPages();
      let anyChange = false;
      for (const p of pages) {
        const { width, height } = p.getSize();
        const dx = (options.left / 100) * width;
        const dTop = (options.top / 100) * height;
        const newW = width - dx - (options.right / 100) * width;
        const newH = height - dTop - (options.bottom / 100) * height;
        if (newW <= 10 || newH <= 10) throw new Error("Those margins would remove nearly everything. Reduce them.");
        if (dx > 0 || dTop > 0 || newW < width || newH < height) anyChange = true;
        p.setCropBox(dx, options.bottom ? (options.bottom / 100) * height : 0, newW, newH);
      }
      if (!anyChange) throw new Error("All margins are 0 — nothing to crop.");
      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-cropped.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Does cropping reduce file size?",
        acceptedAnswer:
          "Not noticeably. PDF cropping hides content outside the crop box rather than deleting the underlying streams. To drop weight, combine with Compress PDF.",
      },
    ]}
  />
);

/* ============================ ADD PAGE NUMBERS ============================= */

export const AddPdfPageNumbers: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="add-pdf-page-numbers"
    title="Add Page Numbers"
    desc="Burn sequential numbers onto every page — configure position, style ('Page 1 of N' vs '1'), and optionally skip the cover page."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<Hash className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ position: "bottom-center", style: "page-n", size: 12, startAt: 1, skipFirst: false }}
    getOverlay={(options) => {
      return (ctx, page, scale, index) => {
        if (options.skipFirst && index === 0) return;
        const pageNum = (Number(options.startAt) || 1) + (index - (options.skipFirst ? 1 : 0));
        const label =
          options.style === "n-of-total"
            ? `${pageNum}`
            : options.style === "page-n"
            ? `Page ${pageNum}`
            : `${pageNum}`;

        ctx.save();
        ctx.fillStyle = "#1E293B";
        const scaledSize = Math.max(11, (options.size || 12) * (page.width / 595));
        ctx.font = `600 ${scaledSize}px sans-serif`;
        const tw = ctx.measureText(label).width;
        const margin = 32 * (page.width / 595);

        let x = (page.width - tw) / 2;
        let y = page.height - margin;
        if (options.position === "bottom-left") x = margin;
        else if (options.position === "bottom-right") x = page.width - tw - margin;
        else if (options.position === "top-center") { x = (page.width - tw) / 2; y = margin + scaledSize; }
        else if (options.position === "top-left") { x = margin; y = margin + scaledSize; }
        else if (options.position === "top-right") { x = page.width - tw - margin; y = margin + scaledSize; }

        ctx.fillText(label, x, y);
        ctx.restore();
      };
    }}
    optionsPanel={({ options, setOptions }) => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-text-main space-y-1 block">
            <span>Position</span>
            <select
              value={options.position}
              onChange={(e) => setOptions((o: any) => ({ ...o, position: e.target.value }))}
              className="w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-xs font-sans text-text-main focus:border-brand-primary"
            >
              {POSITIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-text-main space-y-1 block">
            <span>Number Format</span>
            <select
              value={options.style}
              onChange={(e) => setOptions((o: any) => ({ ...o, style: e.target.value }))}
              className="w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-xs font-sans text-text-main focus:border-brand-primary"
            >
              <option value="page-n">Page 1</option>
              <option value="n-of-total">1 (Simple Digit)</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 items-center pt-1">
          <label className="text-xs font-semibold text-text-main space-y-1 block">
            <span>Start Number</span>
            <input
              type="number"
              min={1}
              value={options.startAt}
              onChange={(e) => setOptions((o: any) => ({ ...o, startAt: Math.max(1, Number(e.target.value) || 1) }))}
              className="w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-xs font-mono text-text-main focus:border-brand-primary"
            >
            </input>
          </label>
          <label className="flex items-center gap-2 pt-4 text-xs font-semibold text-text-main cursor-pointer">
            <input
              type="checkbox"
              checked={!!options.skipFirst}
              onChange={(e) => setOptions((o: any) => ({ ...o, skipFirst: e.target.checked }))}
              className="h-4 w-4 rounded accent-brand-primary"
            />
            <span>Skip Cover Page (Page 1)</span>
          </label>
        </div>
      </div>
    )}
    processFiles={async ([file]: File[], options) => {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length - (options.skipFirst ? 1 : 0);
      let counter = Number(options.startAt) || 1;
      const margin = 28;
      for (let i = 0; i < pages.length; i++) {
        if (options.skipFirst && i === 0) continue;
        const { width, height } = pages[i].getSize();
        const nStr = counter++;
        const label =
          options.style === "n-of-total"
            ? `${nStr}`
            : options.style === "page-n"
            ? `Page ${nStr}`
            : `${nStr}`;
        const tw = font.widthOfTextAtSize(label, options.size);
        const [vx, vy] =
          options.position === "bottom-center"
            ? [(width - tw) / 2, margin]
            : options.position === "bottom-left"
            ? [margin, margin]
            : options.position === "bottom-right"
            ? [width - tw - margin, margin]
            : options.position === "top-center"
            ? [(width - tw) / 2, height - margin]
            : options.position === "top-left"
            ? [margin, height - margin]
            : [width - tw - margin, height - margin];
        pages[i].drawText(label, { x: vx, y: vy, size: options.size, font, color: rgb(0.25, 0.28, 0.32) });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-numbered.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Can I number only certain pages?",
        acceptedAnswer: "Yes — combine this tool with Extract Pages or Delete Pages to isolate the range you want numbered.",
      },
    ]}
  />
);

/* ============================== ADD WATERMARK ============================== */

const WATERMARK_COLORS: Record<string, { label: string; rgbCanvas: string; rgbPdf: [number, number, number]; hex: string }> = {
  gray: { label: "Slate Gray", rgbCanvas: "100, 116, 139", rgbPdf: [0.39, 0.45, 0.55], hex: "bg-slate-500" },
  red: { label: "Crimson Red", rgbCanvas: "220, 38, 38", rgbPdf: [0.86, 0.15, 0.15], hex: "bg-red-600" },
  blue: { label: "Classic Blue", rgbCanvas: "37, 99, 235", rgbPdf: [0.15, 0.39, 0.92], hex: "bg-blue-600" },
  green: { label: "Emerald Green", rgbCanvas: "22, 163, 74", rgbPdf: [0.09, 0.64, 0.29], hex: "bg-emerald-600" },
  black: { label: "Pitch Black", rgbCanvas: "15, 23, 42", rgbPdf: [0.06, 0.09, 0.16], hex: "bg-slate-900" },
  amber: { label: "Amber Gold", rgbCanvas: "217, 119, 6", rgbPdf: [0.85, 0.47, 0.02], hex: "bg-amber-600" },
  purple: { label: "Royal Purple", rgbCanvas: "147, 51, 234", rgbPdf: [0.58, 0.2, 0.92], hex: "bg-purple-600" },
};

const isPageSelectedForWatermark = (pageIdx: number, pageCount: number, selection: string, customRange?: string): boolean => {
  if (selection === "all") return true;
  if (selection === "first") return pageIdx === 0;
  if (selection === "odd") return pageIdx % 2 === 0;
  if (selection === "even") return pageIdx % 2 === 1;
  if (selection === "custom" && customRange) {
    try {
      const indices = parsePageRanges(customRange, pageCount);
      return indices.includes(pageIdx);
    } catch (_) {
      return true;
    }
  }
  return true;
};

export const AddPdfWatermark: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="add-pdf-watermark"
    title="Add PDF Watermark"
    desc="Burn a clean, high-precision watermark directly into every page with live visual preview — instant opacity feedback, font selection, rotation, presets, and placement."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<Stamp className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ 
      text: "CONFIDENTIAL", 
      size: 48, 
      opacity: 0.25, 
      rotate: 45, 
      tiled: false, 
      color: "gray",
      position: "center",
      font: "Helvetica",
      spacing: 1.5,
      pageSelection: "all",
      customPages: ""
    }}
    getOverlay={(options, pageIndex, pageCount) => {
      return (ctx, page, scale, pageIdx = pageIndex, totalPages = pageCount) => {
        const text = String(options.text || "").trim();
        if (!text) return;

        // Check if current page is selected for watermarking
        if (!isPageSelectedForWatermark(pageIdx, totalPages, options.pageSelection, options.customPages)) {
          return;
        }

        const colorEntry = WATERMARK_COLORS[options.color] || WATERMARK_COLORS.gray;
        const rgbStr = colorEntry.rgbCanvas;

        ctx.save();
        ctx.globalAlpha = Math.min(1.0, Math.max(0.04, Number(options.opacity ?? 0.25)));
        ctx.fillStyle = `rgb(${rgbStr})`;

        const baseSize = options.size || 48;
        // Scale font to match page coordinate system
        const scaledSize = Math.max(12, baseSize * (page.width / 595));

        const fontFamily = 
          options.font === "Times" 
            ? `"Times New Roman", Times, Georgia, serif`
            : options.font === "Courier" 
            ? `"Courier New", Courier, monospace`
            : `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

        ctx.font = `bold ${scaledSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const rotRad = ((options.rotate ?? 45) * Math.PI) / 180;
        const textWidth = ctx.measureText(text).width;

        if (options.tiled) {
          const spacingFactor = Math.max(1.0, Math.min(3.0, Number(options.spacing || 1.5)));
          const stepX = Math.max(100, textWidth * spacingFactor);
          const stepY = Math.max(80, scaledSize * 3.8 * spacingFactor);

          for (let y = -scaledSize; y < page.height + stepY; y += stepY) {
            for (let x = -textWidth; x < page.width + stepX; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(rotRad);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else {
          let targetX = page.width / 2;
          let targetY = page.height / 2;
          const margin = 50 * (page.width / 595);

          if (options.position === "top-left") {
            targetX = margin + textWidth / 2;
            targetY = margin + scaledSize / 2;
          } else if (options.position === "top-center") {
            targetX = page.width / 2;
            targetY = margin + scaledSize / 2;
          } else if (options.position === "top-right") {
            targetX = page.width - margin - textWidth / 2;
            targetY = margin + scaledSize / 2;
          } else if (options.position === "bottom-left") {
            targetX = margin + textWidth / 2;
            targetY = page.height - margin - scaledSize / 2;
          } else if (options.position === "bottom-center") {
            targetX = page.width / 2;
            targetY = page.height - margin - scaledSize / 2;
          } else if (options.position === "bottom-right") {
            targetX = page.width - margin - textWidth / 2;
            targetY = page.height - margin - scaledSize / 2;
          }

          ctx.translate(targetX, targetY);
          ctx.rotate(rotRad);
          ctx.fillText(text, 0, 0);
        }
        ctx.restore();
      };
    }}
    optionsPanel={({ options, setOptions }) => (
      <div className="space-y-4">
        {/* Text Input & Quick Preset Buttons */}
        <div className="space-y-2">
          <label htmlFor="watermark-text-input" className="text-xs font-semibold text-text-main flex items-center justify-between">
            <span>Watermark Text</span>
            <span className="text-[11px] font-mono text-text-muted">{options.text?.length || 0}/60</span>
          </label>
          <input
            id="watermark-text-input"
            type="text"
            value={options.text}
            maxLength={60}
            onChange={(e) => setOptions((o: any) => ({ ...o, text: e.target.value }))}
            className="w-full rounded-xl border border-border-default bg-surface-base px-3.5 py-2.5 text-sm font-sans font-medium text-text-main focus:border-brand-primary shadow-premium-xs"
            placeholder="e.g. CONFIDENTIAL"
            aria-label="Watermark text"
          />
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["CONFIDENTIAL", "DRAFT", "SAMPLE", "DO NOT COPY", "COPY", "ORIGINAL", "APPROVED", "URGENT"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOptions((o: any) => ({ ...o, text: preset }))}
                className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer min-h-[32px] ${
                  options.text === preset
                    ? "bg-brand-primary text-white border-brand-primary font-bold"
                    : "bg-surface-muted text-text-sub border-border-subtle hover:border-brand-primary/40"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Selection */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-text-main block">Font Style</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "Helvetica", label: "Sans-Serif", sub: "Helvetica" },
              { id: "Times", label: "Serif", sub: "Times" },
              { id: "Courier", label: "Monospace", sub: "Courier" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOptions((o: any) => ({ ...o, font: f.id }))}
                className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer min-h-[44px] flex flex-col justify-center items-center ${
                  options.font === f.id
                    ? "bg-brand-primary text-white border-brand-primary font-bold shadow-sm"
                    : "bg-surface-base text-text-sub border-border-subtle hover:border-brand-primary/40"
                }`}
              >
                <span className="text-xs">{f.label}</span>
                <span className="text-[10px] opacity-75 font-mono">{f.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Control with Live Percentage Display */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="watermark-opacity" className="font-semibold text-text-main">Watermark Opacity</label>
            <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs">
              {Math.round(options.opacity * 100)}%
            </span>
          </div>
          <input
            id="watermark-opacity"
            type="range"
            min={5}
            max={100}
            value={Math.round(options.opacity * 100)}
            onChange={(e) => setOptions((o: any) => ({ ...o, opacity: Number(e.target.value) / 100 }))}
            className="w-full accent-brand-primary cursor-pointer h-2.5 bg-surface-muted rounded-lg"
            aria-label={`Watermark opacity ${Math.round(options.opacity * 100)} percent`}
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>Subtle (5%)</span>
            <span>Balanced (25%)</span>
            <span>Opaque (100%)</span>
          </div>
        </div>

        {/* Text Size & Rotation */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-text-main">
              <label htmlFor="watermark-size">Font Size</label>
              <span className="font-mono text-brand-primary font-bold">{options.size}px</span>
            </div>
            <input
              id="watermark-size"
              type="range"
              min={14}
              max={96}
              value={options.size}
              onChange={(e) => setOptions((o: any) => ({ ...o, size: Number(e.target.value) }))}
              className="w-full accent-brand-primary cursor-pointer h-2 bg-surface-muted rounded-lg"
              aria-label={`Watermark size ${options.size} pixels`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-text-main">
              <label htmlFor="watermark-rotation">Rotation Angle</label>
              <span className="font-mono text-brand-primary font-bold">{options.rotate}°</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {[0, 30, 45, 90, -45].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setOptions((o: any) => ({ ...o, rotate: d }))}
                  className={`py-1 px-2.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer min-h-[34px] ${
                    options.rotate === d
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-surface-base text-text-sub border-border-subtle hover:border-brand-primary/40"
                  }`}
                >
                  {d}°
                </button>
              ))}
            </div>
            <input
              id="watermark-rotation"
              type="range"
              min={-90}
              max={90}
              value={options.rotate}
              onChange={(e) => setOptions((o: any) => ({ ...o, rotate: Number(e.target.value) }))}
              className="w-full accent-brand-primary cursor-pointer h-2 bg-surface-muted rounded-lg"
              aria-label={`Watermark rotation angle ${options.rotate} degrees`}
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-text-main block">Stamp Color</span>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(WATERMARK_COLORS).map(([id, item]) => (
              <button
                key={id}
                type="button"
                onClick={() => setOptions((o: any) => ({ ...o, color: id }))}
                className={`w-8 h-8 rounded-full ${item.hex} transition-all cursor-pointer flex items-center justify-center ${
                  options.color === id ? "ring-2 ring-brand-primary ring-offset-2 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
                }`}
                title={item.label}
                aria-label={`Select ${item.label} color`}
              />
            ))}
          </div>
        </div>

        {/* Position Grid & Tiling */}
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <span className="text-xs font-semibold text-text-main block">Placement</span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: "center", label: "Center" },
              { id: "top-left", label: "Top-Left" },
              { id: "top-center", label: "Top-Center" },
              { id: "top-right", label: "Top-Right" },
              { id: "bottom-left", label: "Bottom-Left" },
              { id: "bottom-center", label: "Bottom-Center" },
              { id: "bottom-right", label: "Bottom-Right" },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                disabled={!!options.tiled}
                onClick={() => setOptions((o: any) => ({ ...o, position: pos.id }))}
                className={`py-2 px-2 rounded-lg border font-mono text-[11px] transition-all cursor-pointer min-h-[38px] disabled:opacity-30 ${
                  options.position === pos.id && !options.tiled
                    ? "bg-brand-primary text-white border-brand-primary font-bold shadow-xs"
                    : "bg-surface-base text-text-sub border-border-subtle hover:border-brand-primary/40"
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2.5 pt-2 text-xs font-semibold text-text-main cursor-pointer min-h-[40px]">
            <input
              type="checkbox"
              checked={!!options.tiled}
              onChange={(e) => setOptions((o: any) => ({ ...o, tiled: e.target.checked }))}
              className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
            />
            <span>Repeat Watermark Pattern Across Entire Page</span>
          </label>

          {options.tiled && (
            <div className="p-3 rounded-xl bg-surface-muted/40 border border-border-subtle space-y-1.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text-main">Pattern Spacing</span>
                <span className="font-mono text-brand-primary font-bold">{options.spacing || 1.5}x</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={2.5}
                step={0.1}
                value={options.spacing || 1.5}
                onChange={(e) => setOptions((o: any) => ({ ...o, spacing: Number(e.target.value) }))}
                className="w-full accent-brand-primary cursor-pointer h-2 bg-surface-muted rounded-lg"
                aria-label="Watermark grid spacing"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>Dense (1.0x)</span>
                <span>Normal (1.5x)</span>
                <span>Spacious (2.5x)</span>
              </div>
            </div>
          )}
        </div>

        {/* Page Selection Scope */}
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <span className="text-xs font-semibold text-text-main block">Apply To Pages</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: "all", label: "All Pages" },
              { id: "first", label: "First Page Only" },
              { id: "odd", label: "Odd Pages (1, 3, 5...)" },
              { id: "even", label: "Even Pages (2, 4, 6...)" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOptions((o: any) => ({ ...o, pageSelection: p.id }))}
                className={`py-2 px-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer min-h-[40px] ${
                  options.pageSelection === p.id
                    ? "bg-brand-primary text-white border-brand-primary font-bold shadow-xs"
                    : "bg-surface-base text-text-sub border-border-subtle hover:border-brand-primary/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs font-medium text-text-sub cursor-pointer">
            <input
              type="radio"
              name="watermark-page-scope"
              checked={options.pageSelection === "custom"}
              onChange={() => setOptions((o: any) => ({ ...o, pageSelection: "custom" }))}
              className="accent-brand-primary"
            />
            <span>Custom page range</span>
          </label>

          {options.pageSelection === "custom" && (
            <input
              type="text"
              value={options.customPages || ""}
              onChange={(e) => setOptions((o: any) => ({ ...o, customPages: e.target.value }))}
              placeholder="e.g. 1-3, 5"
              className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-xs font-mono text-text-main focus:border-brand-primary shadow-xs"
              aria-label="Custom page numbers range"
            />
          )}
        </div>

        {/* Reset */}
        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={() => setOptions({ 
              text: "CONFIDENTIAL", 
              size: 48, 
              opacity: 0.25, 
              rotate: 45, 
              tiled: false, 
              color: "gray",
              position: "center",
              font: "Helvetica",
              spacing: 1.5,
              pageSelection: "all",
              customPages: ""
            })}
            className="text-xs font-mono text-text-muted hover:text-text-main inline-flex items-center gap-1 cursor-pointer min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
        </div>
      </div>
    )}
    processFiles={async ([file]: File[], options) => {
      const text = sanitizeText(String(options.text || "")).trim();
      if (!text) throw new Error("Type the watermark text you want stamped on the document.");
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });

      // Embed selected standard font
      const font = 
        options.font === "Times" 
          ? await doc.embedFont(StandardFonts.TimesRomanBold)
          : options.font === "Courier" 
          ? await doc.embedFont(StandardFonts.CourierBold)
          : await doc.embedFont(StandardFonts.HelveticaBold);

      const colorEntry = WATERMARK_COLORS[options.color] || WATERMARK_COLORS.gray;
      const [r, g, b] = colorEntry.rgbPdf;
      const pages = doc.getPages();
      const totalPages = pages.length;
      const rotDeg = Number(options.rotate ?? 45);
      const rotRad = (rotDeg * Math.PI) / 180;
      const opacity = Math.min(1.0, Math.max(0.04, Number(options.opacity ?? 0.25)));
      const baseSize = options.size || 48;

      for (let i = 0; i < totalPages; i++) {
        // Skip pages that are not selected
        if (!isPageSelectedForWatermark(i, totalPages, options.pageSelection, options.customPages)) {
          continue;
        }

        const page = pages[i];
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, baseSize);
        const th = font.heightAtSize(baseSize);

        // Helper to draw text centered at (cx, cy) in PDF coordinates with rotation
        const drawCenteredText = (cx: number, cy: number) => {
          // When rotating by rotDeg in PDF (counter-clockwise), the offset from the rotation pivot (bottom-left) to the center is:
          const rx = (tw / 2) * Math.cos(rotRad) - (th / 2) * Math.sin(rotRad);
          const ry = (tw / 2) * Math.sin(rotRad) + (th / 2) * Math.cos(rotRad);

          page.drawText(text, {
            x: cx - rx,
            y: cy - ry,
            size: baseSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotDeg),
          });
        };

        if (options.tiled) {
          const spacingFactor = Math.max(1.0, Math.min(3.0, Number(options.spacing || 1.5)));
          const stepX = Math.max(100, tw * spacingFactor);
          const stepY = Math.max(80, baseSize * 3.8 * spacingFactor);

          for (let y = -baseSize; y < height + stepY; y += stepY) {
            for (let x = -tw; x < width + stepX; x += stepX) {
              drawCenteredText(x, y);
            }
          }
        } else {
          let cx = width / 2;
          let cy = height / 2;
          const margin = 50;

          if (options.position === "top-left") {
            cx = margin + tw / 2;
            cy = height - margin - th / 2;
          } else if (options.position === "top-center") {
            cx = width / 2;
            cy = height - margin - th / 2;
          } else if (options.position === "top-right") {
            cx = width - margin - tw / 2;
            cy = height - margin - th / 2;
          } else if (options.position === "bottom-left") {
            cx = margin + tw / 2;
            cy = margin + th / 2;
          } else if (options.position === "bottom-center") {
            cx = width / 2;
            cy = margin + th / 2;
          } else if (options.position === "bottom-right") {
            cx = width - margin - tw / 2;
            cy = margin + th / 2;
          }

          drawCenteredText(cx, cy);
        }
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-watermarked.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Can someone remove this watermark?",
        acceptedAnswer:
          "The watermark becomes permanent page content, embedded directly into the PDF streams. For confidentiality controls, use Protect PDF encryption instead.",
      },
      {
        question: "Does the watermark quality match what I preview on screen?",
        acceptedAnswer:
          "Yes. GainUtility's interactive renderer directly calculates font geometry, angle, opacity, and coordinates identically in both the on-screen preview and the final exported PDF vector layer.",
      },
    ]}
  />
);

/* =========================== REMOVE METADATA =============================== */

export const RemovePdfMetadata: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="remove-pdf-metadata"
    title="Remove PDF Metadata"
    desc="Strip author, title, keywords, producer, creation dates and more from your PDF — optionally rebuild the file pixel-by-pixel so nothing survives in hidden structures."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<Eraser className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ deepClean: false }}
    optionsPanel={({ options, setOptions }) => (
      <label className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-muted/30 p-3 text-xs text-text-main cursor-pointer hover:border-brand-primary/40">
        <input
          type="checkbox"
          checked={!!options.deepClean}
          onChange={(e) => setOptions((o: any) => ({ ...o, deepClean: e.target.checked }))}
          className="mt-0.5 h-4 w-4 rounded accent-brand-primary"
        />
        <div>
          <p className="font-semibold text-text-main">Deep Sanitization (Rasterize Rebuild)</p>
          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
            Renders pages to images and rebuilds the PDF from scratch. Eliminates hidden objects and version revisions.
          </p>
        </div>
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const raw = await file.arrayBuffer();
      if (options.deepClean) {
        setProgress("Deep clean: rasterizing and rebuilding document…");
        const res = await rasterizeToPdf(raw, { scale: 1.5, jpegQuality: 0.85 }, setProgress);
        const blob = new Blob([res.pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        return { blob, name: `${baseName(file.name)}-sanitized.pdf`, beforeSize: file.size, afterSize: blob.size };
      }
      setProgress("Stripping metadata headers…");
      const doc = await PDFDocument.load(raw, { ignoreEncryption: true, updateMetadata: false });
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("GainUtility");
      doc.setCreator("GainUtility Client Sanitizer");
      const bytes = await doc.save({ useObjectStreams: false });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-clean.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Does regular metadata removal strip hidden XML?",
        acceptedAnswer:
          "Regular cleanup blanks the standard document info dictionary and XMP metadata packet. Deep sanitization rebuilds every page as fresh imagery.",
      },
    ]}
  />
);

/* =============================== FLATTEN PDF =============================== */

export const FlattenPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="flatten-pdf"
    title="Flatten PDF Forms"
    desc="Lock form fields, checkboxes and annotations into static page content so they can no longer be edited."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<Layers className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ rasterize: false }}
    optionsPanel={({ options, setOptions }) => (
      <label className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-muted/30 p-3 text-xs text-text-main cursor-pointer hover:border-brand-primary/40">
        <input
          type="checkbox"
          checked={!!options.rasterize}
          onChange={(e) => setOptions((o: any) => ({ ...o, rasterize: e.target.checked }))}
          className="mt-0.5 h-4 w-4 rounded accent-brand-primary"
        />
        <div>
          <p className="font-semibold text-text-main">Visual rasterization lock</p>
          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
            Re-encodes pages visually. Recommended if your PDF uses complex signature annotations.
          </p>
        </div>
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const raw = await file.arrayBuffer();
      if (options.rasterize) {
        setProgress("Visual flatten: rasterizing pages…");
        const res = await rasterizeToPdf(raw, { scale: 1.5, jpegQuality: 0.9 }, setProgress);
        const blob = new Blob([res.pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        return { blob, name: `${baseName(file.name)}-flattened.pdf`, beforeSize: file.size, afterSize: blob.size };
      }
      setProgress("Flattening form fields…");
      const doc = await PDFDocument.load(raw, { ignoreEncryption: true });
      const form = doc.getForm();
      try {
        form.flatten();
      } catch (err) {
        throw new Error("This PDF does not contain interactive form fields, or its fields could not be flattened.");
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-flattened.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Can flattened forms ever be un-flattened?",
        acceptedAnswer:
          "No — form fields become raw vector and text shapes on the page canvas. They cannot be edited as fields again.",
      },
    ]}
  />
);

/* ============================ ADD HEADER/FOOTER ============================ */

export const AddPdfHeaderFooter: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="add-pdf-header-footer"
    title="Add Header & Footer"
    desc="Place custom text at the top and bottom of every page — supports automatic date and page-number placeholders."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<PanelTop className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{
      headerText: "{filename}",
      footerText: "Page {n} of {total} · {date}",
      size: 10,
      skipFirst: true,
    }}
    getOverlay={(options) => {
      return (ctx, page, scale, index) => {
        if (options.skipFirst && index === 0) return;
        const total = 5;
        const today = new Date().toLocaleDateString();
        const header = (options.headerText || "")
          .replace(/\{filename\}/g, "Document")
          .replace(/\{date\}/g, today)
          .replace(/\{n\}/g, String(index + 1))
          .replace(/\{total\}/g, String(total));
        const footer = (options.footerText || "")
          .replace(/\{filename\}/g, "Document")
          .replace(/\{date\}/g, today)
          .replace(/\{n\}/g, String(index + 1))
          .replace(/\{total\}/g, String(total));

        ctx.save();
        ctx.fillStyle = "#334155";
        const scaledSize = Math.max(9, (options.size || 10) * (page.width / 595));
        ctx.font = `${scaledSize}px sans-serif`;

        if (header.trim()) {
          const hw = ctx.measureText(header).width;
          ctx.fillText(header, (page.width - hw) / 2, 24 * (page.width / 595));
        }

        if (footer.trim()) {
          const fw = ctx.measureText(footer).width;
          ctx.fillText(footer, (page.width - fw) / 2, page.height - 16 * (page.width / 595));
        }
        ctx.restore();
      };
    }}
    optionsPanel={({ options, setOptions }) => (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-text-main space-y-1 block">
          <span>Header Text</span>
          <input
            type="text"
            value={options.headerText}
            onChange={(e) => setOptions((o: any) => ({ ...o, headerText: e.target.value }))}
            className="w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-xs font-sans text-text-main focus:border-brand-primary"
            placeholder="Header text"
          />
        </label>
        <label className="text-xs font-semibold text-text-main space-y-1 block">
          <span>Footer Text</span>
          <input
            type="text"
            value={options.footerText}
            onChange={(e) => setOptions((o: any) => ({ ...o, footerText: e.target.value }))}
            className="w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-xs font-sans text-text-main focus:border-brand-primary"
            placeholder="Footer text"
          />
        </label>
        <p className="text-[11px] text-text-muted font-mono">
          Placeholders: {"{filename}"}, {"{date}"}, {"{n}"}, {"{total}"}
        </p>
        <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-text-main cursor-pointer">
          <input
            type="checkbox"
            checked={!!options.skipFirst}
            onChange={(e) => setOptions((o: any) => ({ ...o, skipFirst: e.target.checked }))}
            className="h-4 w-4 rounded accent-brand-primary"
          />
          <span>Skip First Page (Cover)</span>
        </label>
      </div>
    )}
    processFiles={async ([file]: File[], options) => {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;
      const today = new Date().toLocaleDateString();
      const fill = (tpl: string, n: number) =>
        tpl
          .replace(/\{filename\}/g, baseName(file.name))
          .replace(/\{date\}/g, today)
          .replace(/\{n\}/g, String(n))
          .replace(/\{total\}/g, String(total));
      pages.forEach((page, i) => {
        if (options.skipFirst && i === 0) return;
        const { width, height } = page.getSize();
        const header = fill(options.headerText ?? "", i + 1);
        const footer = fill(options.footerText ?? "", i + 1);
        if (header.trim()) {
          const hw = font.widthOfTextAtSize(header, options.size);
          page.drawText(header, { x: (width - hw) / 2, y: height - 24, size: options.size, font, color: rgb(0.35, 0.38, 0.42) });
        }
        if (footer.trim()) {
          const fw = font.widthOfTextAtSize(footer, options.size);
          page.drawText(footer, { x: (width - fw) / 2, y: 16, size: options.size, font, color: rgb(0.35, 0.38, 0.42) });
        }
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-header-footer.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Which placeholders are available?",
        acceptedAnswer: "{filename}, {date}, {n} (current page) and {total}. They work in both header and footer.",
      },
    ]}
  />
);
