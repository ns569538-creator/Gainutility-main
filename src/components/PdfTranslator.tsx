/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PDF Translator — upload a PDF, get a page-by-page translated version.
 *
 * How it actually works:
 *   - Native-text pages are read with pdf.js and translated through a
 *     third-party translation service (Google's free public gtx endpoint).
 *   - Image-only pages are OCR'd locally with Tesseract first.
 *   - Each page is redrawn with the translated text and rebuilt into a new
 *     PDF, so layout/images are reconstructed rather than preserved exactly.
 * The UI below states exactly that — no "perfect" or "local-only" claims.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Languages,
  Loader2,
  RotateCcw,
  ScanText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button, Card } from "./Common";
import {
  NETWORK_NOTE,
  baseName,
  formatBytes,
  loadTesseract,
  openWithPdfJs,
  sanitizeText,
} from "./pdf/helpers";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import {
  TRANSLATOR_LANGUAGES,
  TranslatorLangCode,
} from "../seo/translatorPairs";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_PAGES = 60;
const TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";

type FileKind = "native" | "scanned" | "mixed" | null;

type Stage = "read" | "detect" | "ocr" | "translate" | "rebuild" | "preview";

const STAGE_ORDER: Stage[] = ["read", "detect", "ocr", "translate", "rebuild", "preview"];

const STAGE_LABELS: Record<Stage, string> = {
  read: "Reading PDF",
  detect: "Detecting document structure",
  ocr: "Running OCR on scanned pages",
  translate: "Translating text",
  rebuild: "Rebuilding document",
  preview: "Preparing preview",
};

interface PageThumb {
  page: number;
  dataUrl: string;
}

interface PdfTranslatorProps {
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  initialSource?: TranslatorLangCode;
  initialTarget?: TranslatorLangCode;
}

/** Tesseract language pack for a Google language code. */
const OCR_LANG: Record<string, string> = {
  fr: "fra",
  es: "spa",
  de: "deu",
  hi: "hin",
  ar: "ara",
};

/** Google Translate language for a detected code (falls back to English). */
const detectToCode = (code: string | undefined): TranslatorLangCode =>
  code && TRANSLATOR_LANGUAGES[code] ? (code as TranslatorLangCode) : "en";

/** Detect the dominant language of a text sample via the gtx endpoint. */
async function detectLanguage(text: string): Promise<TranslatorLangCode> {
  try {
    const params = new URLSearchParams();
    params.set("sl", "auto");
    params.set("tl", "en");
    params.set("dt", "t");
    params.set("q", text.slice(0, 1200));
    const res = await fetch(`${TRANSLATE_ENDPOINT}?${params.toString()}`);
    if (!res.ok) return "en";
    const json = await res.json();
    return detectToCode(json?.[2] as string | undefined);
  } catch {
    return "en";
  }
}

/** Translate a block of text. Chunks are kept under ~2000 chars per request. */
async function translateText(text: string, sl: string, tl: string): Promise<string> {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest.length > 0) {
    let cut = 2000;
    if (rest.length > 2000) {
      const space = rest.lastIndexOf(" ", 2000);
      if (space > 300) cut = space;
    }
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (chunks.length === 0) return "";

  const out: string[] = [];
  for (const chunk of chunks) {
    const params = new URLSearchParams();
    params.set("sl", sl);
    params.set("tl", tl);
    params.set("dt", "t");
    params.set("q", chunk);
    const res = await fetch(`${TRANSLATE_ENDPOINT}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`The translation service returned HTTP ${res.status}. Please try again.`);
    }
    const json = await res.json();
    const parts = (json?.[0] as unknown[]) ?? [];
    const joined = parts.map((seg: any) => typeof seg?.[0] === "string" ? (seg[0] as string) : "").join("");
    out.push(joined);
    await new Promise((r) => setTimeout(r, 250));
  }
  return out.join(" ").trim();
}

/** Extract visual-order text from a pdf.js page, line by line. */
async function extractPageText(page: any): Promise<string> {
  const content = await page.getTextContent();
  const items = (content.items as any[])
    .filter((it: any) => it && typeof it.str === "string" && it.str.trim().length > 0)
    .map((it: any) => ({
      str: it.str,
      x: it.transform?.[4] ?? 0,
      y: it.transform?.[5] ?? 0,
      h: Math.abs(it.transform?.[3] ?? 12),
    }));
  if (items.length === 0) return "";

  items.sort((a, b) => {
    const dy = b.y - a.y;
    if (Math.abs(dy) > 4) return dy;
    return a.x - b.x;
  });

  const lines: string[] = [];
  let current: { str: string; x: number; h: number }[] = [];
  let currentY: number | null = null;
  const flush = () => {
    if (current.length > 0) {
      current.sort((a, b) => a.x - b.x);
      lines.push(current.map((c) => c.str).join(" ").trim());
      current = [];
    }
  };
  for (const item of items) {
    if (currentY === null || Math.abs(item.y - currentY) <= Math.max(4, item.h * 0.6)) {
      current.push(item);
      if (currentY === null) currentY = item.y;
    } else {
      flush();
      current = [item];
      currentY = item.y;
    }
  }
  flush();
  return lines.join("\n");
}

/** Draw wrapped text onto a white canvas and export a JPEG blob. */
function drawTranslatedPage(
  widthPx: number,
  heightPx: number,
  text: string,
  direction: "ltr" | "rtl"
): { jpeg: Uint8Array; thumb: string } {
  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, widthPx, heightPx);

  if (text.trim()) {
    const marginX = Math.round(widthPx * 0.06);
    const marginY = Math.round(heightPx * 0.06);
    let fontPx = Math.max(11, Math.min(30, Math.round(16 * (widthPx / 1200))));

    const wrap = (size: number) => {
      ctx.font = `${size}px sans-serif`;
      const words = sanitizeText(text).replace(/\s+/g, " ").split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= widthPx - marginX * 2) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    let lines = wrap(fontPx);
    const lineH = fontPx * 1.45;
    const maxLines = Math.floor((heightPx - marginY * 2) / lineH);
    if (lines.length > maxLines && fontPx > 12) {
      fontPx = Math.max(12, Math.round(fontPx * (maxLines / lines.length)));
      lines = wrap(fontPx);
    }

    ctx.fillStyle = "#111827";
    ctx.textBaseline = "alphabetic";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).direction = direction;
    ctx.textAlign = direction === "rtl" ? "right" : "left";
    let y = marginY + fontPx;
    for (const line of lines.slice(0, maxLines)) {
      const x = direction === "rtl" ? widthPx - marginX : marginX;
      ctx.fillText(line, x, y);
      y += lineH;
    }
  }

  const jpeg = canvas.toDataURL("image/jpeg", 0.82);

  // Reusable low-res preview thumbnail.
  const thumbScale = Math.min(1, 168 / widthPx);
  const tw = Math.max(1, Math.round(widthPx * thumbScale));
  const th = Math.max(1, Math.round(heightPx * thumbScale));
  const t = document.createElement("canvas");
  t.width = tw;
  t.height = th;
  const tc = t.getContext("2d")!;
  tc.drawImage(canvas, 0, 0, tw, th);
  const thumb = t.toDataURL("image/jpeg", 0.7);

  const bin = atob(jpeg.split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  canvas.width = 0;
  canvas.height = 0;
  t.width = 0;
  t.height = 0;
  return { jpeg: bytes, thumb };
}

export const PdfTranslator: React.FC<PdfTranslatorProps> = ({
  onAddToast,
  initialSource,
  initialTarget = "fr",
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    pages: number | null;
  } | null>(null);
  const [kind, setKind] = useState<FileKind>(null);
  const [kindNote, setKindNote] = useState("");
  const [target, setTarget] = useState<TranslatorLangCode>(initialTarget);
  const [phase, setPhase] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasIssues, setHasIssues] = useState(false);
  const [resultName, setResultName] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const busyRef = useRef(false);
  const inputId = "pdf-translator-file-input";

  const setProgressLabel = (msg: string) => {
    setProgressMsg(msg);
  };

  const postDownload = usePostDownload();
  const sourceFixed = initialSource ?? null;

  const resetTool = useCallback(() => {
    setFiles([]);
    setFileInfo(null);
    setKind(null);
    setKindNote("");
    setPhase("idle");
    setStageIndex(-1);
    setErrorMsg("");
    setHasIssues(false);
    setResultName("");
    setResultSize(0);
    setThumbs([]);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesUpload = (uploaded: FileList | File[]) => {
    const incoming = Array.from(uploaded).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (incoming.length === 0) {
      onAddToast("Unsupported file type. Please choose a .pdf file.", "error");
      return;
    }
    const file = incoming[0];
    setFiles([file]);
    if (file.size > MAX_SIZE_BYTES) {
      onAddToast(`This file is ${formatBytes(file.size)} — above the 20 MB limit.`, "warning");
    }
    setFileInfo({ name: file.name, size: file.size, pages: null });
    setPhase("idle");
    setKind(null);
    setKindNote("");
    // Read the page count up front so the uploaded card can show it.
    (async () => {
      try {
        const doc = await openWithPdfJs(await file.arrayBuffer());
        setFileInfo((prev) => (prev ? { ...prev, pages: doc.numPages } : prev));
      } catch {
        setFileInfo((prev) => (prev ? { ...prev } : prev));
      }
    })();
  };

  const runProcess = async () => {
    const file = files[0];
    if (!file) {
      onAddToast("Choose a PDF first.", "warning");
      return;
    }
    if (busyRef.current) return;
    if (file.size > MAX_SIZE_BYTES) {
      setPhase("error");
      setErrorMsg(`This file is ${formatBytes(file.size)}, which is above the 20 MB limit.`);
      return;
    }

    busyRef.current = true;
    setPhase("busy");
    setStageIndex(0);
    setErrorMsg("");
    setHasIssues(false);
    setThumbs([]);
    setResultName("");
    setResultSize(0);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");

    try {
      /* 1 — Reading PDF */
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const totalPages = doc.numPages;
      if (totalPages > MAX_PAGES) {
        throw new Error(`This PDF has ${totalPages} pages — above the 60-page limit.`);
      }
      setFileInfo((prev) => (prev ? { ...prev, pages: totalPages } : prev));

      /* 2 — Detecting document structure */
      setStageIndex(1);
      const perPage = {
        textLen: [] as number[],
        scanned: [] as boolean[],
      };
      for (let i = 0; i < totalPages; i++) {
        const page = await doc.getPage(i + 1);
        const text = await extractPageText(page);
        const len = text.replace(/\s+/g, "").length;
        perPage.textLen.push(len);
        perPage.scanned.push(len < 20);
      }
      const scannedCount = perPage.scanned.filter(Boolean).length;
      const detectedKind: FileKind =
        scannedCount === 0 ? "native" : scannedCount === totalPages ? "scanned" : "mixed";
      setKind(detectedKind);
      setKindNote(
        detectedKind === "scanned"
          ? "This PDF looks scanned. We'll run OCR before translating it. Formatting will be reconstructed and may not match the original exactly."
          : detectedKind === "mixed"
          ? "Some pages appear to be scanned. Those pages will use OCR."
          : "This PDF contains selectable text, so we can translate the text directly."
      );

      /* Working text per page (native text or OCR result). */
      const pageTexts: string[] = new Array(totalPages).fill("");

      /* Native pages — extract text directly. */
      for (let i = 0; i < totalPages; i++) {
        if (!perPage.scanned[i]) {
          const page = await doc.getPage(i + 1);
          pageTexts[i] = sanitizeText(await extractPageText(page));
        }
      }

      const sampleText = pageTexts.find((t) => t.length > 40) ?? "";
      let sourceCode: TranslatorLangCode = sourceFixed ?? "en";
      if (!sourceFixed) {
        const detected = await detectLanguage(sampleText || (detectedKind === "scanned" ? "sample" : "English sample text for language detection"));
        sourceCode = detected;
      }

      /* 3 — Running OCR only on scanned pages. */
      let worker: any = null;
      if (scannedCount > 0) {
        setStageIndex(2);
        setProgressLabel("Loading OCR engine (one-time download)…");
        const Tesseract = await loadTesseract();
        worker = await Tesseract.createWorker(OCR_LANG[sourceCode] ?? "eng");
        for (let i = 0; i < totalPages; i++) {
          if (perPage.scanned[i]) {
            setProgressLabel(`OCRing page ${i + 1} of ${totalPages}…`);
            const page = await doc.getPage(i + 1);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d");
            await page.render({ canvasContext: ctx, viewport }).promise;
            const { data } = await worker.recognize(canvas);
            pageTexts[i] = sanitizeText(String(data?.text ?? ""));
            canvas.width = 0;
            canvas.height = 0;
          }
        }
      }

      /* 4 — Translating each page. */
      setStageIndex(3);
      const translated: string[] = new Array(totalPages).fill("");
      let issues = 0;
      for (let i = 0; i < totalPages; i++) {
        setProgressLabel(`Translating page ${i + 1} of ${totalPages}…`);
        if (!pageTexts[i].trim()) {
          translated[i] = "";
          continue;
        }
        try {
          const out = await translateText(pageTexts[i], sourceCode, target);
          translated[i] = out;
          if (!out.trim()) issues += 1;
        } catch (err: any) {
          translated[i] = "";
          issues += 1;
          if (worker) { try { await worker.terminate?.(); } catch { /* ignore */ } }
          throw err;
        }
      }
      if (worker) {
        try { await worker.terminate?.(); } catch { /* ignore */ }
      }

      if (translated.every((t) => !t.trim())) {
        throw new Error(
          "No page could be translated. The text layer may be missing or the translation service may be unavailable."
        );
      }

      /* 5 — Rebuilding the document page by page. */
      setStageIndex(4);
      const PDFDocument = (await import("@cantoo/pdf-lib")).PDFDocument;
      const outDoc = await PDFDocument.create();
      const thumbs: PageThumb[] = [];
      for (let i = 0; i < totalPages; i++) {
        setProgressLabel(`Rebuilding page ${i + 1} of ${totalPages}…`);
        const page = await doc.getPage(i + 1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const lang = TRANSLATOR_LANGUAGES[target];
        const { jpeg, thumb } = drawTranslatedPage(
          Math.floor(viewport.width),
          Math.floor(viewport.height),
          translated[i],
          lang.direction
        );
        const img = await outDoc.embedJpg(jpeg);
        const p = outDoc.addPage([viewport.width / scale, viewport.height / scale]);
        p.drawImage(img, { x: 0, y: 0, width: viewport.width / scale, height: viewport.height / scale });
        thumbs.push({ page: i + 1, dataUrl: thumb });
      }

      /* 6 — Preparing preview + download. */
      setStageIndex(5);
      const bytes = await outDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setThumbs(thumbs);
      setHasIssues(issues > 0);
      setResultName(`${baseName(file.name)}-${target}.pdf`);
      setResultSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      setPhase("done");
      if (issues > 0) {
        onAddToast(`Translation completed with issues on ${issues} page(s).`, "warning");
      } else {
        onAddToast("Translated successfully. Your download is ready.", "success");
      }
    } catch (err: any) {
      setPhase("error");
      setErrorMsg(
        err?.message || "Your PDF couldn't be translated. Check the file and try again."
      );
      if (err?.message && !/translation service/.test(String(err.message))) {
        onAddToast(err.message, "error");
      }
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      {/* Upload */}
      <Card className="p-0">
        <div
          role="button"
          tabIndex={0}
          aria-labelledby={inputId}
          onClick={() => document.getElementById(inputId)?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById(inputId)?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.length) handleFilesUpload(e.dataTransfer.files);
          }}
          className={`m-2 sm:m-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 sm:px-4 py-8 sm:py-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 ${
            isDragOver
              ? "border-brand-primary bg-brand-primary-light/40"
              : "border-border-medium hover:border-brand-primary hover:bg-surface-muted/30"
          }`}
        >
          <input
            id={inputId}
            type="file"
            accept=".pdf"
            className="sr-only"
            aria-label="Choose a PDF to translate"
            onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
          />
          <Languages className="mb-2 h-8 w-8 text-brand-primary" aria-hidden />
          <p className="font-medium text-text-main">
            Drop a PDF here, or click to browse
          </p>
          <p className="mt-1 text-xs text-text-muted">
            .pdf · up to 20 MB · up to 60 pages
          </p>
        </div>

        {fileInfo && (
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-2 text-sm">
              <span className="min-w-0 truncate font-medium text-text-main">
                {fileInfo.name}
              </span>
              <span className="shrink-0 text-xs text-text-muted">
                {formatBytes(fileInfo.size)}
                {fileInfo.pages ? ` · ${fileInfo.pages} ${fileInfo.pages === 1 ? "page" : "pages"}` : " · reading…"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetTool();
                }}
                className="shrink-0 rounded p-1 text-text-muted hover:bg-surface-muted hover:text-status-error focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                aria-label={`Remove ${fileInfo.name}`}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Language settings */}
      <Card className="mt-4" aria-label="Translation language settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tr-source" className="block text-sm text-text-main">
              Source language
            </label>
            <input
              id="tr-source"
              type="text"
              readOnly
              value={
                sourceFixed
                  ? `${TRANSLATOR_LANGUAGES[sourceFixed].label} (${TRANSLATOR_LANGUAGES[sourceFixed].native})`
                  : "Detected automatically"
              }
              className="mt-1 w-full rounded-md border border-border-medium bg-surface-muted px-3 py-2 text-base sm:text-sm text-text-muted"
            />
          </div>
          <div>
            <label htmlFor="tr-target" className="block text-sm text-text-main">
              Translate into
            </label>
            <select
              id="tr-target"
              value={target}
              onChange={(e) => setTarget(e.target.value as TranslatorLangCode)}
              disabled={phase === "busy"}
              className="mt-1 w-full rounded-md border border-border-medium bg-surface-base px-3 py-2 text-sm text-text-main"
            >
              {Object.values(TRANSLATOR_LANGUAGES).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-md bg-status-warning/5 border border-status-warning/30 p-3 text-xs leading-relaxed text-text-main">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" aria-hidden />
          {sourceFixed
            ? `Translated text is sent to a third-party translation service for conversion to ${TRANSLATOR_LANGUAGES[target].label}. The PDF file itself stays on your device.`
            : "Extracted text is sent to a third-party translation service. The PDF file itself stays on your device."}
        </p>
      </Card>

      {/* Detection + kind note */}
      {kindNote && phase !== "idle" && phase !== "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-primary/10 bg-brand-primary/5 p-3 text-sm text-text-main">
          <ScanText className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
          {kindNote}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          onClick={runProcess}
          disabled={phase === "busy" || !fileInfo || (fileInfo.size > MAX_SIZE_BYTES)}
          size="lg"
        >
          {phase === "busy" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Translating…
            </>
          ) : (
            <>
              <Languages className="mr-2 h-4 w-4" aria-hidden /> Translate PDF
            </>
          )}
        </Button>
        {fileInfo && (
          <Button variant="outline" onClick={resetTool} disabled={phase === "busy"}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Reset
          </Button>
        )}
      </div>

      {/* Stages + progress */}
      {phase === "busy" && (
        <div aria-live="polite" className="mt-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {STAGE_ORDER.map((s, i) => {
              const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "todo";
              const skip = s === "ocr" && kind !== "scanned" && kind !== "mixed";
              if (skip) return null;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${
                    state === "done"
                      ? "border-status-success/25 bg-status-success/10 text-status-success"
                      : state === "active"
                      ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
                      : "border-border-light bg-surface-muted text-text-muted"
                  }`}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : state === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                  ) : null}
                  <span className="truncate">{STAGE_LABELS[s]}</span>
                </div>
              );
            })}
          </div>
          {progressMsg && (
            <p className="mt-3 text-sm text-text-main">{progressMsg}</p>
          )}
        </div>
      )}

      {/* Error state */}
      {phase === "error" && (
        <Card className="mt-6 border-status-error/30">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-status-error">
                <XCircle className="h-4 w-4" aria-hidden /> Your PDF couldn't be translated.
              </p>
              <p className="mt-1 text-sm text-text-main">{errorMsg}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" onClick={runProcess}>
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden /> Try again
              </Button>
              <Button size="sm" variant="outline" onClick={resetTool}>
                Choose another PDF
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Result */}
      {phase === "done" && resultUrl && (
        <>
          <Card className="mt-6 border-status-success/30" aria-label="Translated result">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-status-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {hasIssues ? "Translation completed with issues" : "Ready to download"}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-text-main">
                  {resultName}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {formatBytes(resultSize)} · {thumbs.length} {thumbs.length === 1 ? "page" : "pages"}
                  {fileInfo ? ` · source ${formatBytes(fileInfo.size)}` : ""}
                </p>
                {hasIssues && (
                  <p className="mt-1 text-xs text-status-warning">
                    Some pages couldn't be translated or read cleanly. Review the preview before using
                    the file.
                  </p>
                )}
                <p className="mt-1 text-xs text-text-muted">
                  Formatting may change during reconstruction — text is translated and the page is
                  rebuilt.
                </p>
              </div>
              <a
                href={resultUrl}
                download={resultName}
                onClick={() => postDownload.show("PDF Translator")}
                className="inline-flex shrink-0 items-center rounded-[14px] bg-brand-primary px-5 py-3 text-sm font-semibold text-[#FAF8F1] shadow-premium-sm transition hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden /> Download
              </a>
            </div>
          </Card>

          <section className="mt-6 sm:mt-8" aria-label="Translated page preview">
            <h2 className="mb-3 text-base font-bold text-text-main">Preview</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {thumbs.map((t) => (
                <figure
                  key={t.page}
                  className="overflow-hidden rounded-lg border border-border-light bg-surface-base"
                >
                  <img
                    src={t.dataUrl}
                    alt={`Translated page ${t.page}`}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="px-2 py-1.5 text-center text-[11px] font-medium text-text-muted">
                    Page {t.page}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Privacy + honest limits */}
      <Card className="mt-6 sm:mt-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold text-text-main">Privacy</p>
            <p className="mt-1 text-text-sub">
              The PDF is opened and rebuilt locally in your browser and is never uploaded. However,
              the extracted text is sent to a third-party translation service (Google) for
              conversion, then returned to your device. Don't translate confidential documents if
              that matters to you.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-status-warning/5 border border-status-warning/30 p-3 text-text-main">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  What this tool can and cannot do
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed">
                  <li>
                    Layout, images, and styling are rebuilt from the translated text — they will not
                    match the original exactly.
                  </li>
                  <li>
                    Scanned pages rely on OCR, which works well for clean print but poorly for
                    handwriting and noisy scans.
                  </li>
                  <li>
                    Up to {MAX_PAGES} pages and {MAX_SIZE_BYTES / 1024 / 1024} MB, because OCR,
                    translation, and rebuilding all run in your browser{NETWORK_NOTE.toLowerCase().replace(/\.$/, "")}.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};

export default PdfTranslator;