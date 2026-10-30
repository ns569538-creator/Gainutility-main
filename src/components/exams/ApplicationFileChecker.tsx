/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Application File Checker — the flagship "check your files, fix what's wrong,
 * download them ready to upload" tool. Presents the full document checklist for
 * a selected exam, validates each uploaded file, applies an automatic fix, and
 * lets the user download all fixed files as a ZIP. 100% client-side.
 */

import React, { useState } from "react";
import JSZip from "jszip";
import {
  Wand2,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { Button, Card } from "../Common";
import {
  loadImage,
  resizeCanvas,
  fitAndCropToCanvas,
  compressToMaxBytes,
  cleanBackground,
  estimateSharpness,
  formatBytes,
  triggerDownload,
  FormatTarget,
} from "../../exams/imageEngine";
import { ExamPreset, DocumentRequirement, ValidationResult, DocumentType } from "../../exams/examTypes";
import { EXAMS, DOCUMENT_LABELS } from "../../exams/requirements";
import { validateFacts, targetSummary } from "../../exams/validate";
import { PrivacyBanner, StatusBadge, CameraUploadButtons, StatChip, Disclaimer } from "../../exams/examUi";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";

interface CheckItem {
  id: string;
  docType: DocumentType;
  req: DocumentRequirement;
  fileName?: string;
  dataUrl?: string;
  width?: number;
  height?: number;
  originalSize?: number;
  checking: boolean;
  done: boolean;
  result: ValidationResult;
  processed?: {
    dataUrl: string;
    size: number;
    format: string;
    blob: Blob;
    width: number;
    height: number;
  };
  skipped?: boolean;
}

const confirmableDocs: DocumentType[] = ["declaration", "certificate", "document", "pdf", "thumb"];

export default function ApplicationFileChecker({ onAddToast }: { onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void }) {
  const [exam, setExam] = useState<ExamPreset | null>(null);
  const [items, setItems] = useState<CheckItem[]>([]);
  const [busy, setBusy] = useState(false);
  const postDownload = usePostDownload();

  const pickExam = (id: string) => {
    const found = EXAMS.find((e) => e.id === id);
    if (!found) return;
    setExam(found);
    setItems(
      found.requirements.map((req, i) => ({
        id: `${found.id}-${req.document}-${i}`,
        docType: req.document,
        req,
        checking: false,
        done: false,
        result: { status: "idle", issues: [] },
      }))
    );
  };

  const assignFile = (id: string, files: File[]) => {
    const f = files[0];
    if (!f) return;
    const item = items.find((it) => it.id === id);
    if (!item) return;
    if (isImageDoc(item.docType) && !isImageFile(f)) {
      onAddToast("That file doesn't look like an image.", "error");
      return;
    }
    try {
      const isImg = isImageDoc(item.docType) && f.type.startsWith("image/");
      if (isImg) {
        void loadImage(f).then((info) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? { ...it, fileName: f.name, dataUrl: info.dataUrl, width: info.width, height: info.height, originalSize: f.size, checking: false, done: true, result: { status: "ready", issues: [] } }
                : it
            )
          );
        });
      } else {
        // Non-image document (declaration photo, thumb, signature may be image;
        // PDF / declaration handled generically) — record the file for manual/fix.
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, fileName: f.name, originalSize: f.size, checking: false, done: true, result: { status: "ready", issues: [] } }
              : it
          )
        );
      }
    } catch (e: any) {
      onAddToast(e.message || "Could not open that file.", "error");
    }
  };

  const isImageFile = (f: File) => f.type.startsWith("image/");

  const isImageDoc = (t: DocumentType) => ["photo", "signature", "thumb"].includes(t);

  const removeFile = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { id: it.id, docType: it.docType, req: it.req, checking: false, done: false, result: { status: "idle", issues: [] } }
          : it
      )
    );
  };

  const fixItem = async (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item || !item.dataUrl) return;
    if (!item.width || !item.height) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checking: true } : it)));
    try {
      const img = new Image();
      img.src = item.dataUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error("Could not load the image."));
      });
      const req = item.req;
      const tw = req.widthPx || item.width;
      const th = req.heightPx || item.height;
      let canvas = req.document === "photo"
        ? fitAndCropToCanvas(img, tw, th)
        : resizeCanvas(img, tw, th, "contain");
      if (["signature", "thumb"].includes(req.document)) {
        canvas = cleanBackground(canvas, 0.5);
      }
      const allowed = (req.formats || ["JPG"]).map((x) => x.toLowerCase());
      const format: FormatTarget = allowed.includes("png") ? "png" : allowed.includes("webp") ? "webp" : "jpeg";
      const maxKb = req.maxKb ?? 100;
      const minBytes = req.minKb ? req.minKb * 1024 : undefined;
      const processed = await compressToMaxBytes(canvas, format, maxKb * 1024, minBytes);
      const sharpness = estimateSharpness(canvas);
      const resVal = validateFacts(req, {
        size: processed.size,
        width: processed.width,
        height: processed.height,
        format: processed.format,
        sharpness,
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                checking: false,
                done: true,
                result: { ...resVal, status: resVal.issues.length === 0 ? "ready" : "needs_fixing" },
                processed: {
                  dataUrl: processed.dataUrl,
                  size: processed.size,
                  format: processed.format,
                  blob: processed.blob,
                  width: processed.width,
                  height: processed.height,
                },
              }
            : it
        )
      );
      onAddToast(`Fixed ${DOCUMENT_LABELS[item.docType] || "file"}.`, "success");
    } catch (e: any) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checking: false } : it)));
      onAddToast(e.message || "Fixing failed.", "error");
    }
  };

  const downloadAll = async () => {
    const fixed = items.filter((it) => it.processed);
    if (fixed.length === 0) {
      onAddToast("Fix at least one file first.", "warning");
      return;
    }
    setBusy(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(exam ? exam.examName.replace(/\s+/g, "_").toLowerCase() : "application_files") ?? zip;
      for (const it of fixed) {
        if (!it.processed) continue;
        const ext = it.processed.format.split("/")[1].replace("jpeg", "jpg");
        const name = `${it.docType}-${it.fileName?.replace(/\.[^/.]+$/, "") || "file"}.${ext}`;
        folder.file(name, it.processed.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const filename = `${exam?.examName.replace(/\s+/g, "_").toLowerCase() || "application"}-fixed-files.zip`;
      triggerDownload(blob, filename);
      postDownload.show("Application File Checker");
      onAddToast("ZIP downloaded with your fixed files.", "success");
    } catch (e: any) {
      onAddToast(e.message || "Could not create the ZIP.", "error");
    } finally {
      setBusy(false);
    }
  };

  const fixedCount = items.filter((it) => it.processed).length;
  const uploadedCount = items.filter((it) => it.done).length;
  const total = items.length;

  return (
    <div className="space-y-6">
      {/* Step 1: choose exam */}
      <Card title="1. Choose your exam or application" subtitle="The full checklist for that exam loads automatically.">
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

      {exam && (
        <>
          {/* Step 2: checklist */}
          <Card
            title="2. Your document checklist"
            subtitle={`${uploadedCount} of ${total} uploaded · ${fixedCount} fixed`}
            extra={fixedCount > 0 ? (
              <Button variant="success" onClick={downloadAll} loading={busy} leftIcon={<Download className="w-4 h-4" />}>
                Download fixed files (ZIP)
              </Button>
            ) : undefined}
          >
            {/* progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs font-mono text-text-muted mb-1.5">
                <span>Progress</span>
                <span>{Math.round((uploadedCount / Math.max(1, total)) * 100)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-hover transition-all duration-300"
                  style={{ width: `${(uploadedCount / Math.max(1, total)) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {items.map((item) => (
                <div key={item.id} className="border border-border-light rounded-2xl bg-surface-base p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-text-main text-sm flex items-center gap-2">
                        {DOCUMENT_LABELS[item.docType] || item.docType}
                        <StatusBadge status={item.req.status} />
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Target: <span className="font-mono font-bold text-brand-primary">{targetSummary(item.req)}</span>
                      </p>
                    </div>
                    {item.done && item.result.issues.length === 0 && <CheckCircle2 className="w-5 h-5 text-status-success" />}
                    {item.done && item.result.issues.length > 0 && <AlertTriangle className="w-5 h-5 text-brand-secondary-hover" />}
                  </div>

                  {item.done && item.dataUrl && (
                    <div className="rounded-xl border border-border-light bg-surface-muted/40 p-2 flex items-center justify-center">
                      {item.processed ? (
                        <div className="flex items-center gap-3">
                          <img src={item.processed.dataUrl} alt={`Fixed ${DOCUMENT_LABELS[item.docType]}`} className="max-h-[110px] object-contain rounded" referrerPolicy="no-referrer" />
                          <div className="space-y-1.5">
                            <StatChip label="New size" value={formatBytes(item.processed.size)} accent />
                            <p className="text-[10px] font-mono font-bold text-status-success">✓ FIXED</p>
                          </div>
                        </div>
                      ) : (
                        <img src={item.dataUrl} alt={`Uploaded ${DOCUMENT_LABELS[item.docType]}`} className="max-h-[110px] object-contain rounded" referrerPolicy="no-referrer" />
                      )}
                    </div>
                  )}

                  {item.done && item.result.issues.length > 0 && (
                    <div className="space-y-1.5">
                      {item.result.issues.map((iss, i) => (
                        <p key={i} className="text-[11px] text-status-error leading-relaxed">
                          {iss.level === "official" ? "•" : "◦"} {iss.message}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {!item.done ? (
                      <CameraUploadButtons
                        onFiles={(files) => assignFile(item.id, files)}
                        accept={isImageDoc(item.docType) ? "image/*" : "*/*"}
                        label={item.docType === "photo" ? "Photo" : DOCUMENT_LABELS[item.docType]}
                      />
                    ) : (
                      <>
                        {item.dataUrl && (
                          <Button variant="primary" onClick={() => fixItem(item.id)} loading={item.checking} leftIcon={<Wand2 className="w-4 h-4" />}>
                            Fix
                          </Button>
                        )}
                        {!item.dataUrl && confirmableDocs.includes(item.docType) && (
                          <Button variant="primary" onClick={() => onAddToast("Please upload an image for this item to auto-fix it.", "info")} leftIcon={<Wand2 className="w-4 h-4" />}>
                            Auto-fix
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => removeFile(item.id)} leftIcon={<RefreshCw className="w-4 h-4" />}>
                          Replace
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <PostDownloadPanel
            info={postDownload.info}
            onClose={postDownload.close}
            onDismiss={postDownload.dismiss}
            onAddToast={onAddToast}
          />

          <PrivacyBanner />
        </>
      )}

      <div className="max-w-3xl">
        <Disclaimer />
      </div>
    </div>
  );
}
