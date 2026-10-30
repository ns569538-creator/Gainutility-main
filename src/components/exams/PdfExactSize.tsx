/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PDF Size Reducer for Applications — reduce a PDF so it sits safely under
 * your application's maximum file size. Tries a light structural cleanup first,
 * then re-encodes pages at progressively tighter JPEG quality to find the
 * largest result that still fits. Never downloads a file bigger than the
 * original. 100% client-side.
 */

import React, { useState } from "react";
import { Wand2, Download, RefreshCw, FileText, AlertTriangle } from "lucide-react";
import { Button, Card, Input } from "../Common";
import { formatBytes, formatKB, triggerDownload } from "../../exams/imageEngine";
import { PrivacyBanner, CameraUploadButtons, StatChip } from "../../exams/examUi";
import {
  rasterizeToPdf,
  getPdfJs,
} from "../pdf/helpers";
import { EXAM_DISCLAIMER } from "../../exams/examTypes";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";

interface PdfState {
  file: File;
  size: number;
  processing: boolean;
  message?: string;
  result?: {
    blob: Blob;
    size: number;
    pages: number;
    method: "structural" | "reencoded";
  };
  failed?: boolean;
}

export default function PdfExactSize({ onAddToast }: { onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void }) {
  const [maxKb, setMaxKb] = useState("200");
  const [pdf, setPdf] = useState<PdfState | null>(null);
  const postDownload = usePostDownload();

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      onAddToast("Please choose a PDF file.", "error");
      return;
    }
    setPdf({ file: f, size: f.size, processing: false });
  };

  const runFix = async () => {
    if (!pdf) return;
    const target = (Number(maxKb) || 200) * 1024;
    setPdf((prev) => (prev ? { ...prev, processing: true, message: "Reading your PDF…", failed: false } : prev));
    try {
      await getPdfJs();
      const raw = await pdf.file.arrayBuffer();

      // 1) Structural cleanup (lossless-ish).
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      let cleaned: Uint8Array | null = null;
      let pages = 0;
      try {
        const doc = await PDFDocument.load(raw.slice(0), { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
        const saved = await doc.save({ useObjectStreams: true });
        cleaned = saved instanceof Uint8Array ? saved : new Uint8Array(saved);
        pages = doc.getPageCount();
      } catch {
        cleaned = null;
      }

      if (cleaned && cleaned.byteLength <= target) {
        const blob = new Blob([cleaned as unknown as BlobPart], { type: "application/pdf" });
        setPdf((prev) => (prev ? { ...prev, processing: false, message: undefined, result: { blob, size: cleaned.byteLength, pages, method: "structural" } } : prev));
        onAddToast("PDF fits the target size.", "success");
        return;
      }

      // 2) Re-encode pages at iteratively lower quality to find the largest fit.
      setPdf((prev) => (prev ? { ...prev, message: "Re-encoding pages to fit…" } : prev));
      const maxExisting = Math.floor(raw.byteLength * 0.99);

      let best: { size: number; blob: Blob; pages: number } | null = null;
      const qualities = [0.72, 0.6, 0.5, 0.4, 0.3, 0.22];
      for (const q of qualities) {
        const attempt = await rasterizeToPdf(
          raw.slice(0),
          { password: undefined, scale: 1.4, jpegQuality: q },
          (m) => setPdf((prev) => (prev ? { ...prev, message: m } : prev))
        );
        const size = attempt.pdfBytes.byteLength;
        if (size <= target) {
          best = { size, blob: new Blob([attempt.pdfBytes as unknown as BlobPart], { type: "application/pdf" }), pages: attempt.pages };
          break;
        }
        if (!best && size < maxExisting) {
          best = { size, blob: new Blob([attempt.pdfBytes as unknown as BlobPart], { type: "application/pdf" }), pages: attempt.pages };
        }
      }

      if (best) {
        setPdf((prev) => (prev ? { ...prev, processing: false, message: undefined, result: { ...best, method: "reencoded" } } : prev));
        onAddToast(best.size <= target ? "PDF reduced to fit the target size." : "Reduced as much as possible; still over the target.", best.size <= target ? "success" : "warning");
      } else {
        setPdf((prev) => (prev ? { ...prev, processing: false, message: undefined, failed: true } : prev));
        onAddToast("Could not reduce this PDF enough. It may be encrypted or already very small.", "error");
      }
    } catch (e: any) {
      setPdf((prev) => (prev ? { ...prev, processing: false, message: undefined, failed: true } : prev));
      onAddToast(e.message || "Could not process this PDF.", "error");
    }
  };

  const handleDownload = () => {
    if (!pdf?.result) return;
    const filename = `${pdf.file.name.replace(/\.[^/.]+$/, "")}-fixed.pdf`;
    triggerDownload(pdf.result.blob, filename);
    postDownload.show("PDF Size Reducer for Applications");
    onAddToast("PDF downloaded.", "success");
  };

  const reset = () => {
    setPdf(null);
  };

  const adjustSettings = () => {
    setPdf((prev) => (prev ? { ...prev, processing: false, message: undefined, result: undefined, failed: false } : prev));
  };

  const reduction = pdf?.result ? Math.round(((pdf.size - pdf.result.size) / pdf.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card title="Your target" subtitle="The maximum size (KB) allowed by your application.">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-56">
            <label className="text-xs font-bold text-text-muted block mb-1.5">Max size (KB)</label>
            <Input value={maxKb} onChange={(e) => setMaxKb(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Max size KB" />
          </div>
          <p className="text-[11px] text-text-muted sm:flex-1">
            Use the limit stated in your official instructions. The tool keeps the best quality that fits — it will not ship a file you didn't already have unless it's smaller.
          </p>
        </div>
      </Card>

      <Card title="Upload your PDF" subtitle="The PDF is compressed locally in your browser.">
        {!pdf ? (
          <div className="space-y-3">
            <CameraUploadButtons onFiles={handleFile} accept="application/pdf,.pdf" label="Your PDF is processed locally and never uploaded." />
            <PrivacyBanner />
          </div>
        ) : (
          <div className="space-y-4">
            {pdf.failed && (
              <div className="flex items-start gap-2.5 rounded-xl border border-brand-secondary/30 bg-brand-secondary-light/20 px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-brand-secondary-hover shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                  This PDF could not be reduced enough to fit. It may be encrypted, or it may already be near-optimal. Try Unlock/Repair first, or confirm the portal's actual limit.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatChip label="File name" value={pdf.file.name} />
              <StatChip label="File size" value={formatBytes(pdf.size)} accent />
              <StatChip label="Target" value={`≤ ${maxKb} KB`} />
              <StatChip label="Status" value={pdf.result ? "Done" : pdf.processing ? "Working…" : "Ready"} />
            </div>

            {pdf.processing && <p className="text-xs text-text-muted font-mono animate-pulse">{pdf.message}</p>}

            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary" onClick={runFix} loading={pdf.processing} leftIcon={<Wand2 className="w-4 h-4" />}>
                {pdf.result ? "Fix again" : "Reduce PDF"}
              </Button>
              <Button variant="outline" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Choose another PDF
              </Button>
            </div>

            {pdf.result && (
              <div className="rounded-2xl border border-status-success/30 bg-status-success/[0.04] p-4 space-y-3">
                <p className={`font-bold flex items-center gap-2 ${pdf.result.size <= (Number(maxKb) || 200) * 1024 ? "text-status-success" : "text-brand-secondary-hover"}`}>
                  {pdf.result.size <= (Number(maxKb) || 200) * 1024 ? "✓" : "!"} {pdf.result.size <= (Number(maxKb) || 200) * 1024 ? "FITS YOUR LIMIT" : "BEST POSSIBLE REDUCTION"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatChip label="New size" value={formatKB(pdf.result.size)} accent />
                  <StatChip label="Original" value={formatKB(pdf.size)} />
                  <StatChip label="Reduction" value={`${reduction}%`} />
                  <StatChip label="Method" value={pdf.result.method === "structural" ? "Cleanup" : "Re-encode"} />
                </div>
                <p className="text-[11px] text-text-muted">Pages: {pdf.result.pages}</p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button variant="success" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={adjustSettings} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Adjust settings
                  </Button>
                  <Button variant="ghost" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Process another PDF
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

      <p className="text-[11px] text-text-muted leading-relaxed">{EXAM_DISCLAIMER}</p>
    </div>
  );
}
