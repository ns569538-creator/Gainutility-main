import { PDFDocument } from "@cantoo/pdf-lib";
import { loadPdfJs } from "../../lib/pdfJsLoader";

export const PDFJS_VERSION = "3.11.174";
export const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
export const OFFICE_LIMITATIONS = [
  "Text, paragraphs and reading order are preserved; exact fonts, columns, headers/footers and page layout are not reproduced.",
  "Scanned pages contain no embedded text — run OCR (PDF → Text with OCR) first if you need their content.",
];
export const NETWORK_NOTE =
  "This tool loads an open-source engine from a CDN on first use; your file never leaves this browser tab.";

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Strip control characters that break XML/PDF text but keep \n \r \t. */
export const sanitizeText = (s: string): string =>
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const unescapeXmlEntities = (s: string): string =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&amp;/g, "&");

export const baseName = (name: string): string => name.replace(/\.[^.]+$/, "");

/**
 * Parse a human page-range expression ("1-3, 5, 8-") into zero-based indices.
 * Throws Error with a user-actionable message on invalid input.
 */
export const parsePageRanges = (input: string, pageCount: number): number[] => {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter at least one page or range, e.g. 1-3, 5.");
  const out: number[] = [];
  for (const partRaw of trimmed.split(",")) {
    const part = partRaw.trim();
    if (!part) continue;
    const m = part.match(/^(\d+)?\s*(-)?\s*(\d+)?$/);
    if (!m || (!m[1] && !m[3])) {
      throw new Error(`"${part}" is not a valid page or range. Use forms like 3 or 2-6.`);
    }
    let start = m[1] ? parseInt(m[1], 10) : 1;
    let end = m[3] ? parseInt(m[3], 10) : pageCount;
    if (m[2] && !m[3]) end = pageCount;
    if (!m[2]) end = start;
    start = Math.max(1, Math.min(start, pageCount));
    end = Math.max(1, Math.min(end, pageCount));
    if (start > end) [start, end] = [end, start];
    for (let p = start; p <= end; p++) out.push(p - 1);
  }
  if (out.length === 0) throw new Error("The selected range is empty — check the document has those pages.");
  return [...new Set(out)].sort((a, b) => a - b);
};

/* ------------------------------ pdf.js access ----------------------------- */

declare global {
  interface Window {
    pdfjsLib?: any;
    Tesseract?: any;
  }
}

export const getPdfJs = async (): Promise<any> => {
  // Lazy-loads the engine on first use (see src/lib/pdfJsLoader.ts).
  const lib = await loadPdfJs();
  if (!lib.GlobalWorkerOptions.workerSrc) {
    lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
  }
  return lib;
};

export const isPasswordError = (err: any): boolean => {
  const msg = String(err?.message || err || "");
  return /password|encrypt/i.test(msg);
};

export const openWithPdfJs = async (
  data: ArrayBuffer | Uint8Array,
  password?: string
): Promise<any> => {
  const pdfjsLib = await getPdfJs();
  // pdf.js transfers/detaches buffers; always hand it its own copy.
  const copy = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
  const task = pdfjsLib.getDocument({ data: copy, password: password || undefined });
  try {
    return await task.promise;
  } catch (err: any) {
    if (err?.name === "PasswordException" || isPasswordError(err)) {
      throw new Error(
        err?.code === 2 || /incorrect/i.test(String(err?.message))
          ? "That password is incorrect. Check the password and try again."
          : "This PDF is password protected. Enter its current password in the field above to continue."
      );
    }
    throw err;
  }
};

export interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

export const getPageTextItems = async (page: any): Promise<TextItemLike[]> => {
  const content = await page.getTextContent();
  return (content.items as any[])
    .filter((it) => typeof it.str === "string")
    .map((it) => ({
      str: it.str as string,
      transform: it.transform as number[],
      width: Number(it.width) || 0,
      height: Number(it.height) || 10,
    }));
};

const groupItemsIntoLines = (items: TextItemLike[], yToleranceFactor = 0.5): { y: number; text: string }[] => {
  const usable = items.filter((it) => it.str.trim().length > 0);
  if (usable.length === 0) return [];
  const heights = usable.map((it) => Math.abs(it.transform[3]) || it.height).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length / 2)] || 10;
  const tol = medianH * yToleranceFactor;
  const sorted = [...usable].sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
  const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const item of sorted) {
    const y = item.transform[5];
    const line = lines.find((l) => Math.abs(l.y - y) <= tol);
    if (line) line.parts.push({ x: item.transform[4], str: item.str });
    else lines.push({ y, parts: [{ x: item.transform[4], str: item.str }] });
  }
  return lines
    .map((l) => {
      l.parts.sort((a, b) => a.x - b.x);
      let text = "";
      let prevEnd = NaN;
      for (const p of l.parts) {
        if (!Number.isNaN(prevEnd) && p.x - prevEnd > 1.2) text += " ";
        text += p.str;
        prevEnd = p.x + p.str.length * 2; // approximate advance
      }
      return { y: l.y, text: text.replace(/\s+/g, " ").trim() };
    })
    .filter((l) => l.text.length > 0)
    .sort((a, b) => b.y - a.y);
};

/** Extract visual lines of text (top-to-bottom) for one zero-based page index. */
export const extractPageLines = async (doc: any, pageIndex: number): Promise<string[]> => {
  const page = await doc.getPage(pageIndex + 1);
  const items = await getPageTextItems(page);
  return groupItemsIntoLines(items).map((l) => l.text);
};

/* --------------------------- rasterization core --------------------------- */

export interface RasterOptions {
  scale?: number;
  jpegQuality?: number;
  password?: string;
}

export const renderPageToCanvas = async (page: any, scale: number): Promise<HTMLCanvasElement> => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
};

export const canvasToJpegBytes = (canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) return reject(new Error("Could not encode the rendered page image."));
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality
    );
  });

/** Render every page via pdf.js and rebuild as an image-based PDF (true flatten/compress). */
export const rasterizeToPdf = async (
  bytes: ArrayBuffer | Uint8Array,
  opts: RasterOptions,
  setProgress: (msg: string) => void
): Promise<{ pdfBytes: Uint8Array; pages: number }> => {
  const doc = await openWithPdfJs(bytes, opts.password);
  const { PDFDocument: PDFLib } = await import("@cantoo/pdf-lib");
  const out = await PDFLib.create();
  const scale = opts.scale ?? 1.5;
  for (let i = 0; i < doc.numPages; i++) {
    setProgress(`Rendering page ${i + 1} of ${doc.numPages}…`);
    const page = await doc.getPage(i + 1);
    const canvas = await renderPageToCanvas(page, scale);
    const jpeg = await canvasToJpegBytes(canvas, opts.jpegQuality ?? 0.72);
    const img = await out.embedJpg(jpeg);
    const p = out.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    page.cleanup?.();
    canvas.width = 0;
    canvas.height = 0;
  }
  setProgress("Encoding final document…");
  const saved = await out.save({ useObjectStreams: true });
  return { pdfBytes: saved instanceof Uint8Array ? saved : new Uint8Array(saved), pages: doc.numPages };
};

/* -------------------------------- OCR load -------------------------------- */

let tesseractLoading: Promise<any> | null = null;

export const loadTesseract = (): Promise<any> => {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser required"));
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractLoading) return tesseractLoading;
  tesseractLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TESSERACT_URL;
    script.async = true;
    script.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error("OCR engine loaded but unavailable.")));
    script.onerror = () => {
      tesseractLoading = null;
      reject(new Error(`Could not download the OCR engine. This tool needs one-time internet access to fetch it.`));
    };
    document.head.appendChild(script);
  });
  return tesseractLoading;
};

/* ------------------------------- text diffing ------------------------------ */

export type DiffOp = { type: "same" | "removed" | "added"; word: string };

/** Word-level LCS diff used by Compare Two PDFs. */
export const diffWordLists = (aWords: string[], bWords: string[]): DiffOp[] => {
  const n = aWords.length;
  const m = bWords.length;
  // Guard memory: cap very large inputs to avoid O(n*m) blowups.
  const MAX = 2500;
  const a = n > MAX ? aWords.slice(0, MAX) : aWords;
  const b = m > MAX ? bWords.slice(0, MAX) : bWords;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: Uint32Array[] = Array.from({ length: rows }, () => new Uint32Array(cols));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: "same", word: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "removed", word: a[i] });
      i++;
    } else {
      ops.push({ type: "added", word: b[j] });
      j++;
    }
  }
  while (i < a.length) ops.push({ type: "removed", word: a[i++] });
  while (j < b.length) ops.push({ type: "added", word: b[j++] });
  return ops;
};

export const tokenize = (text: string): string[] => text.split(/\s+/).filter(Boolean);

/* ------------------------- decryption (@cantoo fork) ----------------------- */

/**
 * Load a possibly-encrypted PDF with @cantoo/pdf-lib (real standard-security
 * decryption) and re-save WITHOUT encryption. Dynamic import keeps the crypto
 * code out of the main bundle.
 */
export const decryptPdfBytes = async (bytes: ArrayBuffer, password?: string): Promise<Uint8Array> => {
  const { PDFDocument: SecureDoc } = await import("@cantoo/pdf-lib");
  let doc;
  try {
    doc = await SecureDoc.load(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), {
      password: password || "",
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch (err: any) {
    if (isPasswordError(err)) {
      throw new Error(
        password
          ? "That password did not unlock the file. Verify it and try again."
          : "This PDF is encrypted. Enter the password it opens with, then process again."
      );
    }
    throw new Error("This file could not be parsed as a PDF — it may be corrupted.");
  }
  return new Uint8Array(await doc.save());
};

export const encryptPdfBytes = async (
  bytes: ArrayBuffer,
  userPassword: string,
  ownerPassword: string,
  permissions?: Record<string, boolean>
): Promise<Uint8Array> => {
  const { PDFDocument: SecureDoc } = await import("@cantoo/pdf-lib");
  const doc = await SecureDoc.load(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  doc.encrypt({
    userPassword,
    ownerPassword: ownerPassword || userPassword,
    permissions: permissions as any,
  });
  return new Uint8Array(await doc.save());
};

/* ------------------------------ misc helpers ------------------------------ */

export const readAsArrayBuffer = (file: File | Blob): Promise<ArrayBuffer> =>
  file.arrayBuffer();

/** Robust CSV line parser handling quotes, escaped quotes and CRLF. */
export const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
};

/** Full CSV parser supporting multi-line quoted cells. */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cur.trim());
      cur = "";
    } else if (ch === "\n") {
      row.push(cur.trim());
      rows.push(row);
      row = [];
      cur = "";
    } else cur += ch;
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c !== ""));
};

/** Wrap text into lines that fit a given width using real font metrics. */
export const wrapWithMetrics = (
  text: string,
  font: any,
  size: number,
  maxWidth: number
): string[] => {
  const paragraphs = sanitizeText(text).split(/\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (para.trim() === "") {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          // hard-break very long words
          let chunk = "";
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
              lines.push(chunk);
              chunk = ch;
            } else chunk += ch;
          }
          line = chunk;
        } else line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

/** Quick perceptual hash of a canvas for duplicate-page detection. */
export const canvasFingerprint = (canvas: HTMLCanvasElement): string => {
  const size = 16;
  const small = document.createElement("canvas");
  small.width = size;
  small.height = size;
  const sctx = small.getContext("2d", { alpha: false })!;
  sctx.fillStyle = "#fff";
  sctx.fillRect(0, 0, size, size);
  sctx.drawImage(canvas, 0, 0, size, size);
  const data = sctx.getImageData(0, 0, size, size).data;
  const grays: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    grays.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  const avg = grays.reduce((a, b) => a + b, 0) / grays.length;
  let hex = "";
  for (let i = 0; i < grays.length; i += 2) hex += grays[i] >= avg ? "1" : "0";
  let out = "";
  for (let i = 0; i < hex.length; i += 4) out += parseInt(hex.slice(i, i + 4), 2).toString(16);
  return out;
};

export const canvasPixelVariance = (canvas: HTMLCanvasElement): number => {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  const stride = Math.max(4, Math.floor(sample.length / 4 / 20000)) * 4;
  for (let i = 0; i < sample.length; i += stride) {
    const g = 0.299 * sample[i] + 0.587 * sample[i + 1] + 0.114 * sample[i + 2];
    sum += g;
    sumSq += g * g;
    count++;
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
};
