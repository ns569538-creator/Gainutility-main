/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Declaration Photo Compressor — prepare a handwritten / signed declaration
 * (photo or PDF) so it fits your application's size limit. Since declaration
 * size limits are set per portal, you enter your own target here (there is no
 * verified universal figure — we never invent one). 100% client-side.
 */

import React, { useState } from "react";
import { Wand2, Download, RefreshCw, FileSignature, AlertTriangle } from "lucide-react";
import { Button, Card, Input } from "../Common";
import {
  loadImage,
  resizeCanvas,
  compressToMaxBytes,
  formatBytes,
  formatKB,
  triggerDownload,
  ProcessedImage,
  FormatTarget,
} from "../../exams/imageEngine";
import { PrivacyBanner, CameraUploadButtons, StatChip } from "../../exams/examUi";
import { EXAM_DISCLAIMER } from "../../exams/examTypes";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";

interface DeclarationState {
  dataUrl?: string;
  width?: number;
  height?: number;
  size: number;
  format: string;
  fileName?: string;
  processing: boolean;
  processed?: ProcessedImage;
}

export default function DeclarationFixer({ onAddToast }: { onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void }) {
  const [maxKb, setMaxKb] = useState("100");
  const [format, setFormat] = useState<"jpg" | "png" | "pdf">("jpg");
  const [decl, setDecl] = useState<DeclarationState | null>(null);
  const postDownload = usePostDownload();

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !f.type.startsWith("image/")) {
      onAddToast("Please choose an image or PDF of your declaration.", "error");
      return;
    }
    try {
      if (isPdf) {
        setDecl({ size: f.size, format: "pdf", fileName: f.name, processing: false });
      } else {
        const info = await loadImage(f);
        setDecl({
          dataUrl: info.dataUrl,
          width: info.width,
          height: info.height,
          size: f.size,
          format: info.format,
          fileName: f.name,
          processing: false,
        });
      }
    } catch (e: any) {
      onAddToast(e.message || "Could not open that file.", "error");
    }
  };

  const runFix = async () => {
    if (!decl) return;
    setDecl((prev) => (prev ? { ...prev, processing: true } : prev));
    try {
      const targetBytes = (Number(maxKb) || 100) * 1024;
      if (!decl.dataUrl) {
        onAddToast("For now, please upload the declaration as an image (a photo or scan).", "warning");
        setDecl((prev) => (prev ? { ...prev, processing: false } : prev));
        return;
      }
      const img = new Image();
      img.src = decl.dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error("load")); });

      const maxW = 1600;
      const maxH = 2200;
      let canvas = resizeCanvas(img, maxW, maxH, "contain");
      canvas = resizeToFit(canvas, maxW, maxH);

      const fmt: FormatTarget = format === "png" ? "png" : "jpeg";
      const processed = await compressToMaxBytes(canvas, fmt, targetBytes);
      setDecl((prev) => (prev ? { ...prev, processing: false, processed } : prev));
      onAddToast("Declaration processed on your device.", "success");
    } catch (e: any) {
      setDecl((prev) => (prev ? { ...prev, processing: false } : prev));
      onAddToast(e.message || "Processing failed.", "error");
    }
  };

  const resizeToFit = (canvas: HTMLCanvasElement, maxW: number, maxH: number) => {
    const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
    if (scale >= 1) return canvas;
    const out = document.createElement("canvas");
    out.width = Math.round(canvas.width * scale);
    out.height = Math.round(canvas.height * scale);
    const ctx = out.getContext("2d");
    if (ctx) ctx.drawImage(canvas, 0, 0, out.width, out.height);
    return out;
  };

  const handleDownload = () => {
    if (!decl?.processed) return;
    const ext = format === "png" ? "png" : "jpg";
    const filename = `${decl.fileName?.replace(/\.[^/.]+$/, "") || "declaration"}-fixed.${ext}`;
    triggerDownload(decl.processed.blob, filename);
    postDownload.show("Declaration Photo Compressor");
    onAddToast("Declaration downloaded.", "success");
  };

  const reset = () => {
    setDecl(null);
  };

  const adjustSettings = () => {
    setDecl((prev) => (prev ? { ...prev, processing: false, processed: undefined } : prev));
  };

  const reduction = decl?.processed ? Math.round(((decl.size - decl.processed.size) / decl.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card title="Your target" subtitle="Declaration size limits are set by each portal, so enter yours here.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1.5">Max size (KB)</label>
            <Input value={maxKb} onChange={(e) => setMaxKb(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Max size KB" />
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1.5" htmlFor="declaration-fixer-output">Output</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="px-3 py-2.5 w-full rounded-xl border border-border-light bg-surface-base focus:border-brand-primary outline-none text-sm h-[46px]" id="declaration-fixer-output">
              <option value="jpg">JPG (photo)</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <p className="text-[11px] text-text-muted sm:col-span-2">
            The size limit comes from your own official instructions — the portal usually states a max KB for the declaration/photo. If it's a PDF, use the PDF compressor.
          </p>
        </div>
      </Card>

      <Card title="Upload your declaration" subtitle="Clear photo or scan of your handwritten declaration.">
        {!decl ? (
          <div className="space-y-3">
            <CameraUploadButtons onFiles={handleFiles} accept="image/*,application/pdf" label="Your file is processed locally and never uploaded." />
            <PrivacyBanner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatChip label="File size" value={formatBytes(decl.size)} accent />
              <StatChip label="Format" value={decl.format.toUpperCase()} />
              <StatChip label="Dimensions" value={decl.width && decl.height ? `${decl.width} × ${decl.height}` : decl.format.toUpperCase() === "PDF" ? "PDF" : "—"} />
              <StatChip label="Target" value={`≤ ${maxKb} KB`} />
            </div>

            {decl.dataUrl && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 border border-border-light rounded-2xl bg-surface-muted/40 p-3 flex items-center justify-center min-h-[160px]">
                  <img src={decl.dataUrl} alt="Original declaration" className="max-h-[240px] object-contain rounded" referrerPolicy="no-referrer" />
                </div>
                {decl.processed && (
                  <div className="flex-1 border-2 border-status-success/30 rounded-2xl bg-surface-base p-3 flex items-center justify-center min-h-[160px]">
                    <img src={decl.processed.dataUrl} alt="Processed declaration" className="max-h-[240px] object-contain rounded" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            )}

            {decl.format.toUpperCase() === "PDF" && (
              <div className="flex items-start gap-2.5 rounded-xl border border-brand-secondary/30 bg-brand-secondary-light/20 px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-brand-secondary-hover shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                  You uploaded a PDF. For PDF size reduction, use the <span className="font-semibold">PDF Size Reducer for Applications</span> tool. This tool compresses an image-based declaration.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary" onClick={runFix} loading={decl.processing} leftIcon={<Wand2 className="w-4 h-4" />} disabled={!decl.dataUrl}>
                {decl.processed ? "Fix again" : "Fix automatically"}
              </Button>
              <Button variant="outline" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Choose another file
              </Button>
            </div>

            {decl.processed && (
              <div className="rounded-2xl border border-status-success/30 bg-status-success/[0.04] p-4 space-y-3">
                <p className="font-bold text-status-success flex items-center gap-2"><span>✓</span> READY TO UPLOAD</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatChip label="New size" value={formatKB(decl.processed.size)} accent />
                  <StatChip label="Dimensions" value={`${decl.processed.width} × ${decl.processed.height}`} />
                  <StatChip label="Format" value={decl.processed.format.split("/")[1].toUpperCase()} />
                  <StatChip label="Reduction" value={`${reduction}%`} />
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button variant="success" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                    Download declaration
                  </Button>
                  <Button variant="outline" onClick={adjustSettings} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Adjust settings
                  </Button>
                  <Button variant="ghost" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Process another file
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
