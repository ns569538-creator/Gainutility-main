/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Signature Resizer — crop excess whitespace, clean the background, sharpen
 * contrast, resize and compress a handwritten signature to the exact target.
 * Guards against destroying faint signatures and offers before/after preview.
 */

import React, { useState, useRef } from "react";
import { Wand2, Download, RefreshCw, PenTool, AlertTriangle } from "lucide-react";
import { Button, Card } from "../Common";
import {
  loadImage,
  cleanBackground,
  adjustContrast,
  detectContentRect,
  cropRect,
  compressToMaxBytes,
  estimateSharpness,
  formatBytes,
  formatKB,
  triggerDownload,
  ProcessedImage,
  FormatTarget,
} from "../../exams/imageEngine";
import { ExamPreset, DocumentRequirement } from "../../exams/examTypes";
import { searchExams, EXAMS } from "../../exams/requirements";
import { validateFacts, targetSummary } from "../../exams/validate";
import {
  PrivacyBanner,
  ExamRequirementsSection,
  IssueList,
  CameraUploadButtons,
  StatusBadge,
  StatChip,
} from "../../exams/examUi";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";
import { UniversalImageUpload } from "./UniversalImageUpload";

interface SigState {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  format: string;
  processing: boolean;
  processed?: ProcessedImage;
  processedWidth?: number;
  processedHeight?: number;
  issues: any[];
  faint: boolean;
}

export default function SignatureFixer({ onAddToast }: { onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void }) {
  const [query, setQuery] = useState("");
  const [exam, setExam] = useState<ExamPreset | null>(null);
  const [sig, setSig] = useState<SigState | null>(null);
  const [cropContent, setCropContent] = useState(true);
  const [cleanBg, setCleanBg] = useState(true);
  const [contrast, setContrast] = useState(18);
  const [brightness, setBrightness] = useState(0);
  const [kbTarget, setKbTarget] = useState<number | null>(null);
  const [customKb, setCustomKb] = useState("20");
  const postDownload = usePostDownload();

  const uploadImgRef = useRef<HTMLImageElement | null>(null);

  const results = searchExams(query);
  const activeReq: DocumentRequirement | undefined = exam?.requirements.find((r) => r.document === "signature" || r.document === "photo");

  const targetMaxKb = kbTarget !== null ? kbTarget : (activeReq?.maxKb ?? 20);

  const pickExam = (id: string) => {
    const found = EXAMS.find((e) => e.id === id);
    if (found) {
      setExam(found);
      setSig(null);
    }
  };

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      onAddToast("Please choose an image of your signature.", "error");
      return;
    }
    try {
      const info = await loadImage(f);
      const img = new Image();
      img.src = info.dataUrl;
      uploadImgRef.current = img;
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); });
      const canv = document.createElement("canvas");
      canv.width = info.width;
      canv.height = info.height;
      const ctx = canv.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
      const sharpness = estimateSharpness(canv);
      setSig({
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        size: f.size,
        format: info.format,
        processing: false,
        issues: [],
        faint: sharpness < 0.4,
      });
    } catch (e: any) {
      onAddToast(e.message || "Could not open that image.", "error");
    }
  };

  const runFix = async () => {
    if (!sig || !activeReq) return;
    setSig((prev) => (prev ? { ...prev, processing: true } : prev));
    try {
      const img = uploadImgRef.current || (Object.assign(new Image(), { src: sig.dataUrl }) as HTMLImageElement);
      if (!img.complete) await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); });

      const targetW = activeReq.widthPx;
      const targetH = activeReq.heightPx;

      let canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);

      // 1) Crop excess whitespace around the ink.
      if (cropContent) {
        const rect = detectContentRect(canvas);
        if (rect) canvas = cropRect(canvas, rect);
      }

      // 2) Clean background.
      if (cleanBg) {
        canvas = cleanBackground(canvas, 0.55);
      }

      // 3) Adjust contrast / brightness (sharpening faint strokes).
      if (contrast !== 0 || brightness !== 0) {
        canvas = adjustContrast(canvas, contrast, brightness);
      }

      // 4) Resize to target dimensions if the preset specifies pixels;
      //    otherwise just cap at a sensible max dimension to keep OCR-legible.
      let working = canvas;
      if (targetW && targetH) {
        working = containCanvas(canvas, targetW, targetH);
      } else {
        const maxDim = 1400;
        const longest = Math.max(canvas.width, canvas.height);
        if (longest > maxDim) {
          const scale = maxDim / longest;
          working = containCanvas(
            canvas,
            Math.max(1, Math.round(canvas.width * scale)),
            Math.max(1, Math.round(canvas.height * scale))
          );
        }
      }

      // 5) Choose format.
      const allowed = (activeReq.formats || ["JPG"]).map((x) => x.toLowerCase());
      const format: FormatTarget = allowed.includes("png") ? "png" : allowed.includes("webp") ? "webp" : "jpeg";

      // 6) Compress iteratively to fit max (honoring min if specified).
      const maxKb = targetMaxKb;
      const minBytes = activeReq.minKb ? activeReq.minKb * 1024 : undefined;
      const processed = await compressToMaxBytes(working, format, maxKb * 1024, minBytes);

      // 7) Validate.
      const sharp = estimateSharpness(working);
      const validationReq = kbTarget !== null ? { ...activeReq, maxKb: kbTarget } : activeReq;
      const issues = validateFacts(validationReq, {
        size: processed.size,
        width: processed.width,
        height: processed.height,
        format: processed.format,
        sharpness: sharp,
      }).issues;

      setSig((prev) => (prev ? { ...prev, processing: false, processed, processedWidth: processed.width, processedHeight: processed.height, issues } : prev));
      onAddToast("Signature fixed on your device.", "success");
    } catch (e: any) {
      setSig((prev) => (prev ? { ...prev, processing: false } : prev));
      onAddToast(e.message || "Processing failed.", "error");
    }
  };

  /** Contain a canvas into target dimensions on a white background. */
  const containCanvas = (canvas: HTMLCanvasElement, w: number, h: number) => {
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      const scale = Math.min(w / canvas.width, h / canvas.height);
      const dw = Math.max(1, Math.round(canvas.width * scale));
      const dh = Math.max(1, Math.round(canvas.height * scale));
      ctx.drawImage(canvas, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    return out;
  };

  const handleDownload = () => {
    if (!sig?.processed) return;
    const ext = sig.processed.format.split("/")[1].replace("jpeg", "jpg");
    const filename = `${exam?.slug || "custom"}-signature.${ext}`;
    triggerDownload(sig.processed.blob, filename);
    postDownload.show("Signature Resizer");
    onAddToast("Signature downloaded.", "success");
  };

  const reset = () => {
    setSig(null);
  };

  const adjustSettings = () => {
    setSig((prev) =>
      prev
        ? { ...prev, processed: undefined, processedWidth: undefined, processedHeight: undefined, issues: [] }
        : prev
    );
  };

  const reduction = sig?.processed ? Math.round(((sig.size - sig.processed.size) / sig.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card title="1. Choose your exam or application" subtitle="Your signature requirement loads automatically.">
        <div className="flex flex-wrap gap-2">
          {EXAMS.slice(0, 6).map((e) => (
            <button
              key={e.id}
              onClick={() => pickExam(e.id)}
              className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                exam?.id === e.id ? "bg-brand-primary text-white border-brand-primary" : "bg-surface-base border-border-light hover:border-brand-primary text-text-main"
              }`}
            >
              {e.examName}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exam or application… (e.g. UPPSC)"
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-base focus:border-brand-primary outline-none text-sm"
            aria-label="Search exams"
          />
          {query && results.length === 0 && (
            <p className="text-xs text-text-muted">No verified preset found. Use Custom in the Photo tool, or confirm the requirement manually.</p>
          )}
        </div>
      </Card>

      {exam && activeReq && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-text-main">{exam.examName} {exam.year} — signature</span>
              <StatusBadge status={activeReq.status} />
            </div>
            <p className="text-xs text-text-muted">
              Target: <span className="font-mono font-bold text-brand-primary">{targetSummary(activeReq)}</span> · Source: {exam.officialSource}
            </p>
          </div>

          <Card title="2. Upload your signature" subtitle="A clear photo of your handwritten signature in black ink.">
            {!sig ? (
              <UniversalImageUpload
                onFileSelected={(f) => handleFiles([f])}
                title="Upload your signature"
                subtitle="A clear photo or scan of your handwritten signature in black ink."
              />
            ) : (
              <div className="space-y-4">
                {sig.faint && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-brand-secondary/30 bg-brand-secondary-light/20 px-4 py-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-brand-secondary-hover shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-brand-secondary-hover">Your signature is faint</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Automatic enhancement may alter thin strokes. Adjust the contrast manually below and review the preview before downloading.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatChip label="File size" value={formatBytes(sig.size)} accent />
                  <StatChip label="Dimensions" value={`${sig.width} × ${sig.height}`} />
                  <StatChip label="Format" value={sig.format.toUpperCase()} />
                  <StatChip label="Target" value={`≤ ${targetMaxKb} KB`} />
                </div>

                {/* KB target quick picks */}
                <div className="rounded-xl border border-brand-primary/20 bg-brand-primary-light/30 px-4 py-3 text-sm">
                  <p className="font-bold text-text-main">Max file size</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {[20, 50, 100].map((kb) => (
                      <button
                        key={kb}
                        type="button"
                        onClick={() => { setKbTarget(kb); setCustomKb(String(kb)); }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          kbTarget === kb ? "bg-brand-primary text-white border-brand-primary" : "bg-surface-base border-border-light hover:border-brand-primary text-text-main"
                        }`}
                      >
                        {kb} KB
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setKbTarget(null)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        kbTarget === null ? "bg-brand-primary text-white border-brand-primary" : "bg-surface-base border-border-light hover:border-brand-primary text-text-main"
                      }`}
                    >
                      Preset ({activeReq.maxKb ?? 20} KB)
                    </button>
                    <input
                      value={customKb}
                      onChange={(e) => setCustomKb(e.target.value.replace(/\D/g, ""))}
                      onBlur={() => { const v = Number(customKb); if (v > 0) setKbTarget(v); }}
                      inputMode="numeric"
                      aria-label="Custom max KB"
                      placeholder="Custom KB"
                      className="w-28 px-3 py-1.5 rounded-lg border border-border-light bg-surface-base focus:border-brand-primary outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 border border-border-light rounded-2xl bg-surface-muted/40 p-3 flex items-center justify-center min-h-[150px]">
                    <img src={sig.dataUrl} alt="Original signature" className="max-h-[160px] object-contain rounded bg-white" referrerPolicy="no-referrer" />
                    <span className="absolute sr-only">Original</span>
                  </div>
                  {sig.processed && (
                    <div className="flex-1 border-2 border-status-success/30 rounded-2xl bg-white p-3 flex items-center justify-center min-h-[150px]">
                      <img src={sig.processed.dataUrl} alt="Processed signature" className="max-h-[160px] object-contain rounded" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* Manual settings */}
                <div className="border border-border-light rounded-2xl p-4 space-y-4">
                  <label className="flex items-center gap-2.5 text-sm text-text-main cursor-pointer">
                    <input type="checkbox" checked={cropContent} onChange={(e) => setCropContent(e.target.checked)} className="accent-brand-primary w-4 h-4" />
                    Crop excess whitespace around the signature
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-text-main cursor-pointer">
                    <input type="checkbox" checked={cleanBg} onChange={(e) => setCleanBg(e.target.checked)} className="accent-brand-primary w-4 h-4" />
                    Clean background to white
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-text-muted">Contrast</span>
                      <span className="text-brand-primary">{contrast}</span>
                    </div>
                    <input type="range" min="-40" max="60" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-brand-primary cursor-pointer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-text-muted">Brightness</span>
                      <span className="text-brand-primary">{brightness}</span>
                    </div>
                    <input type="range" min="-30" max="30" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-brand-primary cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button variant="primary" onClick={runFix} loading={sig.processing} leftIcon={<Wand2 className="w-4 h-4" />}>
                    {sig.processed ? "Fix again" : "Fix automatically"}
                  </Button>
                  <Button variant="outline" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Choose another signature
                  </Button>
                </div>

                {sig.processed && sig.issues.length > 0 && <IssueList issues={sig.issues} />}

                {sig.processed && (
                  <div className="rounded-2xl border border-status-success/30 bg-status-success/[0.04] p-4 space-y-3">
                    <p className="font-bold text-status-success flex items-center gap-2"><span>✓</span> READY TO UPLOAD</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <StatChip label="New size" value={formatKB(sig.processed.size)} accent />
                      <StatChip label="Dimensions" value={`${sig.processedWidth} × ${sig.processedHeight}`} />
                      <StatChip label="Format" value={sig.processed.format.split("/")[1].toUpperCase()} />
                      <StatChip label="Reduction" value={`${reduction}%`} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <Button variant="success" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                        Download signature
                      </Button>
                      <Button variant="outline" onClick={adjustSettings} leftIcon={<RefreshCw className="w-4 h-4" />}>
                        Adjust settings
                      </Button>
                      <Button variant="ghost" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                        Process another
                      </Button>
                    </div>
                    <PostDownloadPanel
                      info={postDownload.info}
                      onClose={postDownload.close}
                      onDismiss={postDownload.dismiss}
                      onAddToast={onAddToast}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          <ExamRequirementsSection exam={exam} />
        </>
      )}
    </div>
  );
}
