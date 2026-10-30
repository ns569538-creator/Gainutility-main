/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Thumb Impression Resizer — clean the fingerprint background, sharpen ridges,
 * resize and compress a thumb impression scan to the recorded requirement.
 */

import React, { useState } from "react";
import { Wand2, Download, RefreshCw, Fingerprint, AlertTriangle } from "lucide-react";
import { Button, Card } from "../Common";
import {
  loadImage,
  resizeCanvas,
  cleanBackground,
  adjustContrast,
  detectContentRect,
  cropRect,
  compressToMaxBytes,
  estimateSharpness,
  formatBytes,
  formatKB,
  triggerDownload,
  FormatTarget,
} from "../../exams/imageEngine";
import { ExamPreset, DocumentRequirement } from "../../exams/examTypes";
import { EXAMS } from "../../exams/requirements";
import { validateFacts, targetSummary } from "../../exams/validate";
import { PrivacyBanner, ExamRequirementsSection, IssueList, CameraUploadButtons, StatusBadge, StatChip, Disclaimer } from "../../exams/examUi";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";
import { UniversalImageUpload } from "./UniversalImageUpload";

interface ThumbState {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  format: string;
  processing: boolean;
  processedDataUrl?: string;
  processedWidth?: number;
  processedHeight?: number;
  processedSize?: number;
  processedFormat?: string;
  processedBlob?: Blob;
  issues: any[];
  lowQuality: boolean;
}

export default function ThumbImpressionFixer({ onAddToast }: { onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void }) {
  const [exam, setExam] = useState<ExamPreset | null>(null);
  const [thumb, setThumb] = useState<ThumbState | null>(null);
  const [kbTarget, setKbTarget] = useState<number | null>(null);
  const [customKb, setCustomKb] = useState("20");
  const postDownload = usePostDownload();

  const activeReq: DocumentRequirement | undefined = exam?.requirements.find((r) => r.document === "thumb");

  const targetMaxKb = kbTarget !== null ? kbTarget : (activeReq?.maxKb ?? 20);

  const pickExam = (id: string) => {
    const found = EXAMS.find((e) => e.id === id);
    if (found) {
      setExam(found);
      setThumb(null);
    }
  };

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      onAddToast("Please choose a scan of your thumb impression.", "error");
      return;
    }
    try {
      const info = await loadImage(f);
      const img = new Image();
      img.src = info.dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); });
      const c = document.createElement("canvas");
      c.width = info.width;
      c.height = info.height;
      const ctx = c.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
      const sharp = estimateSharpness(c);
      setThumb({
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        size: f.size,
        format: info.format,
        processing: false,
        issues: [],
        lowQuality: sharp < 0.4,
      });
    } catch (e: any) {
      onAddToast(e.message || "Could not open that scan.", "error");
    }
  };

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

  const runFix = async () => {
    if (!thumb || !activeReq) return;
    setThumb((prev) => (prev ? { ...prev, processing: true } : prev));
    try {
      const img = new Image();
      img.src = thumb.dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); });

      let canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);

      // Crop whitespace, clean ridges, sharpen.
      const rect = detectContentRect(canvas);
      if (rect) canvas = cropRect(canvas, rect);
      canvas = cleanBackground(canvas, 0.45);
      canvas = adjustContrast(canvas, 12, 0);

      // Resize to pixel target if present.
      let working = canvas;
      if (activeReq.widthPx && activeReq.heightPx) {
        working = containCanvas(canvas, activeReq.widthPx, activeReq.heightPx);
      }

      const allowed = (activeReq.formats || ["JPG"]).map((x) => x.toLowerCase());
      const format: FormatTarget = allowed.includes("png") ? "png" : allowed.includes("webp") ? "webp" : "jpeg";
      const maxKb = targetMaxKb;
      const minBytes = activeReq.minKb ? activeReq.minKb * 1024 : undefined;
      const processed = await compressToMaxBytes(working, format, maxKb * 1024, minBytes);
      const sharp = estimateSharpness(working);
      const validationReq = kbTarget !== null ? { ...activeReq, maxKb: kbTarget } : activeReq;
      const issues = validateFacts(validationReq, {
        size: processed.size,
        width: processed.width,
        height: processed.height,
        format: processed.format,
        sharpness: sharp,
      }).issues;

      setThumb((prev) =>
        prev
          ? {
              ...prev,
              processing: false,
              processedDataUrl: processed.dataUrl,
              processedWidth: processed.width,
              processedHeight: processed.height,
              processedSize: processed.size,
              processedFormat: processed.format,
              processedBlob: processed.blob,
              issues,
            }
          : prev
      );
      onAddToast("Thumb impression fixed on your device.", "success");
    } catch (e: any) {
      setThumb((prev) => (prev ? { ...prev, processing: false } : prev));
      onAddToast(e.message || "Processing failed.", "error");
    }
  };

  const handleDownload = () => {
    if (!thumb?.processedBlob) return;
    const ext = thumb.processedFormat?.split("/")[1].replace("jpeg", "jpg") || "jpg";
    const filename = `${exam?.slug || "custom"}-thumb.${ext}`;
    triggerDownload(thumb.processedBlob, filename);
    postDownload.show("Thumb Impression Resizer");
    onAddToast("Thumb impression downloaded.", "success");
  };

  const reset = () => {
    setThumb(null);
  };

  const adjustSettings = () => {
    setThumb((prev) =>
      prev
        ? {
            ...prev,
            processedDataUrl: undefined,
            processedWidth: undefined,
            processedHeight: undefined,
            processedSize: undefined,
            processedFormat: undefined,
            processedBlob: undefined,
            issues: [],
          }
        : prev
    );
  };

  const reduction = thumb?.processedSize ? Math.round(((thumb.size - thumb.processedSize) / thumb.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card title="1. Choose your exam or application" subtitle="The thumb impression requirement loads automatically.">
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
      </Card>

      {exam && activeReq && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-text-main">{exam.examName} {exam.year} — thumb impression</span>
              <StatusBadge status={activeReq.status} />
            </div>
            <p className="text-xs text-text-muted">
              Target: <span className="font-mono font-bold text-brand-primary">{targetSummary(activeReq)}</span> · Source: {exam.officialSource}
            </p>
          </div>

          <Card title="2. Upload your thumb impression" subtitle="A clear scan of your thumb impression, usually on white paper.">
            {!thumb ? (
              <UniversalImageUpload
                onFileSelected={(f) => handleFiles([f])}
                title="Upload your thumb impression"
                subtitle="A clear scan of your thumb impression on plain white paper."
              />
            ) : (
              <div className="space-y-4">
                {thumb.lowQuality && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-brand-secondary/30 bg-brand-secondary-light/20 px-4 py-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-brand-secondary-hover shrink-0 mt-0.5" />
                    <p className="text-xs text-text-muted">
                      <span className="font-semibold text-brand-secondary-hover block">Low-quality scan</span>
                      For a reliable thumb impression, use a clean scan with strong, even ink pressure.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatChip label="File size" value={formatBytes(thumb.size)} accent />
                  <StatChip label="Dimensions" value={`${thumb.width} × ${thumb.height}`} />
                  <StatChip label="Format" value={thumb.format.toUpperCase()} />
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
                    <img src={thumb.dataUrl} alt="Original thumb impression" className="max-h-[160px] object-contain rounded bg-white" referrerPolicy="no-referrer" />
                  </div>
                  {thumb.processedDataUrl && (
                    <div className="flex-1 border-2 border-status-success/30 rounded-2xl bg-white p-3 flex items-center justify-center min-h-[150px]">
                      <img src={thumb.processedDataUrl} alt="Processed thumb impression" className="max-h-[160px] object-contain rounded" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button variant="primary" onClick={runFix} loading={thumb.processing} leftIcon={<Wand2 className="w-4 h-4" />}>
                    {thumb.processedDataUrl ? "Fix again" : "Fix automatically"}
                  </Button>
                  <Button variant="outline" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Choose another scan
                  </Button>
                </div>

                {thumb.processedDataUrl && thumb.issues.length > 0 && <IssueList issues={thumb.issues} />}

                {thumb.processedDataUrl && (
                  <div className="rounded-2xl border border-status-success/30 bg-status-success/[0.04] p-4 space-y-3">
                    <p className="font-bold text-status-success flex items-center gap-2"><span>✓</span> READY TO UPLOAD</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <StatChip label="New size" value={formatKB(thumb.processedSize ?? 0)} accent />
                      <StatChip label="Dimensions" value={`${thumb.processedWidth} × ${thumb.processedHeight}`} />
                      <StatChip label="Format" value={thumb.processedFormat?.split("/")[1].toUpperCase() || "JPG"} />
                      <StatChip label="Reduction" value={`${reduction}%`} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <Button variant="success" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                        Download thumb impression
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
