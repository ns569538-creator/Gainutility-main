import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  RefreshCw,
  Plus,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  FileUp,
  ArrowUpDown,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Eye
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Button, Card } from "./Common";
import { 
  PDFErrorAlert, 
  PDFPrivacyNotice, 
  PDFProcessingState, 
  PDFUploadDropzone, 
  PDFRelatedTools 
} from "./pdf/PdfComponents";
import { PdfPreview } from "./pdf/PdfPreview";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import "../i18n/tools/mergePdf";
import { useLocale } from "../i18n/LocaleContext";
import { tt, ttf } from "../i18n/toolUi";
import { useToolStateRestoration } from "../lib/toolStateStore";

interface MergePdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

interface PdfFileItem {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

export const MergePdf: React.FC<MergePdfProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const locale = useLocale();
  const postDownload = usePostDownload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [processedPdf, setProcessedPdf] = useState<{ 
    url: string; 
    blob?: Blob;
    name: string; 
    size: number; 
    pageCount: number; 
    fileCount: number 
  } | null>(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [fileThumbnails, setFileThumbnails] = useState<{ [id: string]: string }>({});

  // Lazy thumbnail generator for queue items
  useEffect(() => {
    let active = true;
    const generateThumbs = async () => {
      try {
        const pdfjs = await loadPdfJs();
        for (const fileItem of pdfFiles) {
          if (!active) break;
          if (fileThumbnails[fileItem.id]) continue;
          try {
            const task = pdfjs.getDocument({ data: new Uint8Array(fileItem.buffer.slice(0)) });
            const doc = await task.promise;
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 0.25 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              await page.render({ canvasContext: ctx, viewport }).promise;
              const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
              if (active) {
                setFileThumbnails(prev => ({ ...prev, [fileItem.id]: dataUrl }));
              }
            }
          } catch (e) {
            // Ignore preview failure for individual file
          }
        }
      } catch (err) {
        // PDF.js unavailable
      }
    };
    if (pdfFiles.length > 0) generateThumbs();
    return () => { active = false; };
  }, [pdfFiles]);

  // Memory cleanup
  useEffect(() => {
    return () => {
      if (processedPdf?.url) {
        URL.revokeObjectURL(processedPdf.url);
      }
    };
  }, [processedPdf]);

  // Back/Forward history restoration
  const getSerializableState = useCallback(() => ({
    pdfFiles: pdfFiles.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      pageCount: f.pageCount,
      buffer: f.buffer,
    })),
  }), [pdfFiles]);

  const restoreState = useCallback((saved: unknown) => {
    const s = saved as Partial<{
      pdfFiles: PdfFileItem[];
    }>;
    if (!s) return;
    if (s.pdfFiles && Array.isArray(s.pdfFiles)) {
      setPdfFiles(s.pdfFiles);
    }
  }, []);

  useToolStateRestoration("merge-pdf", getSerializableState, restoreState);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Parse files and extract metadata
  const handleFilesUpload = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of fileArray) {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      const msg = `Skipped ${invalidFiles.length} non-PDF file(s): ${invalidFiles.slice(0, 3).join(", ")}${invalidFiles.length > 3 ? "..." : ""}. Only PDF files (.pdf) are supported.`;
      setErrorMessage(msg);
      onAddToast(msg, "warning");
    }

    if (validFiles.length === 0) {
      if (invalidFiles.length === 0) {
        const msg = tt("merge-pdf", "toastInvalidFiles", locale, "Please upload valid PDF files!");
        setErrorMessage(msg);
        onAddToast(msg, "error");
      }
      return;
    }

    const newItems: PdfFileItem[] = [];
    const passwordProtected: string[] = [];
    const corrupted: string[] = [];

    for (const file of validFiles) {
      try {
        const buffer = await file.arrayBuffer();
        if (buffer.byteLength === 0) {
          corrupted.push(`${file.name} (empty file)`);
          continue;
        }

        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        
        // Verify page accessibility
        let pageCount = 0;
        try {
          const indices = pdfDoc.getPageIndices();
          pageCount = indices.length;
        } catch (pageErr) {
          passwordProtected.push(file.name);
          continue;
        }

        newItems.push({
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: file.size,
          pageCount,
          buffer
        });
      } catch (err: any) {
        const errMsg = err?.message || "";
        if (errMsg.toLowerCase().includes("password") || errMsg.toLowerCase().includes("encrypt")) {
          passwordProtected.push(file.name);
        } else {
          corrupted.push(file.name);
        }
      }
    }

    if (passwordProtected.length > 0) {
      const msg = `${passwordProtected.length} file(s) are password-protected: ${passwordProtected.join(", ")}. Please unlock them before merging.`;
      setErrorMessage(msg);
      onAddToast(msg, "error");
    }

    if (corrupted.length > 0) {
      const msg = `${corrupted.length} file(s) could not be parsed: ${corrupted.join(", ")}. Ensure they are valid PDF documents.`;
      setErrorMessage(msg);
      onAddToast(msg, "error");
    }

    if (newItems.length > 0) {
      setPdfFiles(prev => [...prev, ...newItems]);
      onAddToast(ttf("merge-pdf", "selectedFiles", locale, { count: String(newItems.length) }, `Added ${newItems.length} PDF(s) to queue.`), "success");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
      // Reset input value so same files can be re-uploaded if desired
      e.target.value = "";
    }
  };

  // Reordering helpers
  const moveItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= pdfFiles.length) return;

    const updated = [...pdfFiles];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setPdfFiles(updated);
  };

  const handleSortAlphabetical = () => {
    const sorted = [...pdfFiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    setPdfFiles(sorted);
    onAddToast("Sorted PDFs alphabetically (A–Z).", "info");
  };

  const handleReverseOrder = () => {
    const reversed = [...pdfFiles].reverse();
    setPdfFiles(reversed);
    onAddToast("Reversed document order.", "info");
  };

  const removeItem = (id: string) => {
    setPdfFiles(prev => prev.filter(item => item.id !== id));
    onAddToast(tt("merge-pdf", "toastRemoved", locale, "File removed from merge list."), "info");
  };

  const clearAll = () => {
    setPdfFiles([]);
    setErrorMessage(null);
    if (processedPdf) {
      URL.revokeObjectURL(processedPdf.url);
      setProcessedPdf(null);
    }
    onAddToast(tt("merge-pdf", "toastCleared", locale, "Cleared all files."), "info");
  };

  const handleResetForNew = () => {
    if (processedPdf) {
      URL.revokeObjectURL(processedPdf.url);
      setProcessedPdf(null);
    }
    setPdfFiles([]);
    setErrorMessage(null);
    setProgressPercent(0);
  };

  // Drag and drop reordering inside the queue
  const handleItemDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...pdfFiles];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setPdfFiles(updated);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  // Merge logic
  const handleMergePdf = async () => {
    if (pdfFiles.length < 2) {
      const msg = tt("merge-pdf", "toastNeedTwo", locale, "Please add at least 2 PDF files to merge!");
      setErrorMessage(msg);
      onAddToast(msg, "warning");
      return;
    }

    if (processedPdf) {
      URL.revokeObjectURL(processedPdf.url);
      setProcessedPdf(null);
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMsg(tt("merge-pdf", "progressInit", locale, "Initializing PDF merger..."));

    try {
      const mergedPdf = await PDFDocument.create();
      const totalDocs = pdfFiles.length;

      for (let i = 0; i < totalDocs; i++) {
        const item = pdfFiles[i];
        const percent = Math.round(15 + ((i + 1) / totalDocs) * 65);
        setProgressPercent(percent);
        setProgressMsg(`Loading document ${i + 1} of ${totalDocs}: "${item.name}"...`);

        let doc: PDFDocument;
        try {
          doc = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
        } catch (loadErr: any) {
          throw new Error(`Failed to load "${item.name}". The file may be password protected or corrupted.`);
        }

        const pageIndices = doc.getPageIndices();
        setProgressMsg(`Appending ${pageIndices.length} page(s) from "${item.name}"...`);

        const pages = await mergedPdf.copyPages(doc, pageIndices);
        pages.forEach(page => mergedPdf.addPage(page));
      }

      setProgressPercent(85);
      setProgressMsg(tt("merge-pdf", "progressEncoding", locale, "Encoding and finalizing merged PDF..."));

      const mergedBytes = await mergedPdf.save();
      setProgressPercent(95);
      setProgressMsg(tt("merge-pdf", "progressDownload", locale, "Creating local download file..."));

      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const defaultName = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
      setOutputFileName(defaultName);

      const totalPages = mergedPdf.getPageCount();

      setProcessedPdf({
        url,
        blob,
        name: defaultName,
        size: blob.size,
        pageCount: totalPages,
        fileCount: totalDocs
      });

      setProgressPercent(100);
      onAddToast(tt("merge-pdf", "toastSuccess", locale, "PDF documents merged successfully!"), "success");
    } catch (err: any) {
      console.error("PDF Merge error:", err);
      const errorMsg = `Error merging PDFs: ${err?.message || tt("merge-pdf", "unknownError", locale, "An unexpected error occurred.")}`;
      setErrorMessage(errorMsg);
      onAddToast(errorMsg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownload = () => {
    if (!processedPdf) return;
    const finalName = outputFileName.trim().length > 0 
      ? (outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`)
      : processedPdf.name;

    const link = document.createElement("a");
    link.href = processedPdf.url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Merge PDF");
  };

  const totalInputPages = pdfFiles.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalInputSize = pdfFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* ERROR BANNER */}
      {errorMessage && (
        <PDFErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* STATE 1: RESULT SCREEN (When PDF is ready) */}
      {processedPdf && !isProcessing && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Success Download Card */}
          <div className="bg-surface-base border-2 border-brand-primary/20 rounded-[24px] p-6 sm:p-8 md:p-10 shadow-premium-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-success/10 text-status-success mx-auto">
              <FileCheck2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-status-success/15 text-status-success">
                {tt("merge-pdf", "completeStatus", locale, "Ready to Download ✅")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                {tt("merge-pdf", "toastSuccess", locale, "PDF Documents Merged Successfully!")}
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                Combined {processedPdf.fileCount} PDF files into 1 document ({processedPdf.pageCount} total pages • {formatBytes(processedPdf.size)}).
              </p>
            </div>

            {/* Editable Output Filename */}
            <div className="max-w-md mx-auto flex flex-col gap-1.5 text-left">
              <label htmlFor="output-filename" className="text-xs font-mono text-text-muted">
                Save filename:
              </label>
              <div className="flex items-center rounded-xl border border-border-default bg-surface-muted px-3.5 py-2.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20">
                <input
                  id="output-filename"
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full bg-transparent text-sm font-sans font-medium text-text-main focus:outline-none"
                  placeholder="merged_document.pdf"
                />
              </div>
            </div>

            {/* Live Result PDF Preview (Inspect All Merged Pages Before Download) */}
            {processedPdf.blob && (
              <div className="max-w-2xl mx-auto space-y-2 text-left pt-2">
                <div className="flex items-center justify-between text-xs text-text-muted px-1">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-brand-primary" />
                    Preview Merged Result ({processedPdf.pageCount} Pages Total)
                  </span>
                  <span className="font-mono text-[11px]">Inspect pages before download</span>
                </div>
                <PdfPreview file={processedPdf.blob} className="shadow-premium-md border border-brand-primary/30" />
              </div>
            )}

            {/* Primary Download CTA Button (High Visibility, min 48px target) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                id="download-merged-pdf-btn"
                variant="primary"
                size="lg"
                onClick={handleDownload}
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                {tt("merge-pdf", "downloadMerged", locale, "DOWNLOAD MERGED PDF")}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleResetForNew}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Merge More Files
              </Button>
            </div>

            <div className="pt-2 text-xs text-text-muted flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>100% Client-side. Your merged PDF was generated in your browser and was never uploaded.</span>
            </div>
          </div>

          {/* Contextual Next Actions (Genuinely Relevant Internal Linking) */}
          <PDFRelatedTools
            currentToolId="merge-pdf"
            onChangeView={onChangeView}
            title="Next Actions for Your Merged PDF"
            subtitle="Need to optimize, protect, or split your new combined document? Try these next:"
          />
        </div>
      )}

      {/* STATE 2: ACTIVE PROCESSING SCREEN */}
      {isProcessing && (
        <PDFProcessingState
          title={tt("merge-pdf", "mergingTitle", locale, "Merging Your PDF Documents...")}
          message={progressMsg}
          percentage={progressPercent}
          subtext="All document assembly occurs locally in your device memory."
        />
      )}

      {/* STATE 3: MAIN WORKSPACE (Upload & Document Queue) */}
      {!processedPdf && !isProcessing && (
        <div className="space-y-6">
          {/* Hidden Accessible File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,.pdf"
            onChange={handleFileInputChange}
            className="sr-only"
            id="pdf-upload-input"
            aria-label="Upload PDF files to merge"
          />

          {/* EMPTY QUEUE: PROMINENT ABOVE-THE-FOLD UPLOAD DROPZONE */}
          {pdfFiles.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Click or drop PDF files here to upload"
              className={`border-2 border-dashed rounded-[24px] p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center gap-5 text-center transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isDragOver 
                  ? "border-brand-primary bg-brand-primary-light/40 scale-[1.01]" 
                  : "border-border-default hover:border-brand-primary hover:bg-surface-muted/40 bg-surface-base"
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-sm">
                <FileUp className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-2 max-w-lg">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="text-base sm:text-lg px-8 py-3.5 min-h-[50px] shadow-premium-md pointer-events-none"
                  leftIcon={<FileUp className="w-5 h-5" />}
                >
                  Upload PDF Files
                </Button>
                <p className="text-sm sm:text-base text-text-sub font-medium pt-1">
                  {tt("merge-pdf", "dragDropHint", locale, "or drag & drop your PDF documents here")}
                </p>
              </div>

              {/* Capability badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-mono text-text-muted">
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle">
                  Supports multiple .pdf files
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle">
                  No size limits
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle flex items-center gap-1 text-brand-primary font-sans font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Private
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE QUEUE: RESPONSIVE TWO-COLUMN / SINGLE-COLUMN BALANCED WORKSPACE */}
          {pdfFiles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Span 7/8 on desktop): Document Queue & Reordering */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                <div className="bg-surface-base border border-border-light rounded-[20px] p-4 sm:p-6 shadow-premium-sm space-y-4">
                  {/* Queue Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-primary" />
                      <span className="font-sans font-bold text-sm sm:text-base text-text-main">
                        Queue ({pdfFiles.length} {pdfFiles.length === 1 ? "document" : "documents"})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary-light text-brand-primary hover:bg-brand-primary hover:text-white transition-colors text-xs font-semibold cursor-pointer min-h-[36px]"
                        title="Add more PDF files to this list"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add More</span>
                      </button>

                      {pdfFiles.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handleSortAlphabetical}
                            className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-muted text-xs font-mono text-text-sub hover:text-text-main transition-colors cursor-pointer min-h-[36px]"
                            title="Sort alphabetically (A-Z)"
                          >
                            Sort A–Z
                          </button>
                          <button
                            type="button"
                            onClick={handleReverseOrder}
                            className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-muted text-xs font-mono text-text-sub hover:text-text-main transition-colors cursor-pointer min-h-[36px]"
                            title="Reverse current sequence"
                          >
                            Reverse
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={clearAll}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-status-error hover:bg-status-error/10 transition-colors cursor-pointer min-h-[36px]"
                        title="Clear all documents"
                      >
                        {tt("merge-pdf", "clearAll", locale, "Clear All")}
                      </button>
                    </div>
                  </div>

                  {/* Drag and Drop instructions hint + Sequence Summary */}
                  <div className="space-y-2">
                    <p className="text-xs text-text-muted">
                      Drag items or use the up/down arrows to adjust the sequence. Documents will be merged in the order below:
                    </p>
                    <div className="p-2.5 rounded-xl bg-surface-muted/60 border border-border-subtle text-xs text-text-sub flex items-center justify-between gap-2 flex-wrap font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-text-main font-sans shrink-0">Sequence:</span>
                        <span className="text-text-muted truncate">
                          {pdfFiles.map((f, i) => `[${i + 1}] ${f.name}`).join(" ➔ ")}
                        </span>
                      </div>
                      <span className="font-bold text-brand-primary shrink-0">
                        = {totalInputPages} Total Pages
                      </span>
                    </div>
                  </div>

                  {/* Reorderable Document List */}
                  <div id="pdf-queue-list" className="divide-y divide-border-light/70 max-h-[500px] overflow-y-auto pr-1">
                    {pdfFiles.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleItemDragStart(index)}
                        onDragOver={(e) => handleItemDragOver(e, index)}
                        onDragEnd={handleItemDragEnd}
                        className={`py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                          draggedIndex === index ? "opacity-40 bg-surface-muted" : "hover:bg-surface-muted/30"
                        }`}
                      >
                        {/* Left: Index badge + Thumbnail Preview + Name & metadata */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-xl text-xs sm:text-sm font-bold font-mono shrink-0">
                            {index + 1}
                          </span>

                          {/* Page 1 Thumbnail */}
                          {fileThumbnails[item.id] ? (
                            <img
                              src={fileThumbnails[item.id]}
                              alt={`${item.name} page 1 preview`}
                              className="w-8 h-11 object-cover rounded-md border border-border-subtle shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded-md bg-brand-primary/5 text-brand-primary flex items-center justify-center shrink-0 border border-border-subtle">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-main truncate font-sans" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-xs text-text-muted font-mono mt-0.5">
                              {item.pageCount} {item.pageCount === 1 ? tt("merge-pdf", "page", locale, "page") : tt("merge-pdf", "pages", locale, "pages")} • {formatBytes(item.size)}
                            </p>
                          </div>
                        </div>

                        {/* Right: Reorder Actions (With min 44px touch targets on mobile) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                            aria-label={`Move ${item.name} up`}
                            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-25 disabled:pointer-events-none cursor-pointer transition-colors"
                            title={tt("merge-pdf", "moveUp", locale, "Move Up")}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === pdfFiles.length - 1}
                            aria-label={`Move ${item.name} down`}
                            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-25 disabled:pointer-events-none cursor-pointer transition-colors"
                            title={tt("merge-pdf", "moveDown", locale, "Move Down")}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name} from queue`}
                            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error cursor-pointer transition-colors"
                            title={tt("merge-pdf", "remove", locale, "Remove")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Span 5/4 on desktop): Sticky Summary & Merge Primary CTA */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-4">
                <div className="bg-surface-base border border-border-light rounded-[20px] p-5 sm:p-6 shadow-premium-sm space-y-5">
                  <h3 className="font-sans font-bold text-base sm:text-lg text-text-main border-b border-border-light pb-3">
                    Merge Summary
                  </h3>

                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between items-center text-text-sub">
                      <span>Total Documents:</span>
                      <span className="font-mono font-bold text-text-main">{pdfFiles.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-sub">
                      <span>Total Output Pages:</span>
                      <span className="font-mono font-bold text-text-main">{totalInputPages}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-sub">
                      <span>Combined Size:</span>
                      <span className="font-mono font-bold text-text-main">{formatBytes(totalInputSize)}</span>
                    </div>
                  </div>

                  {pdfFiles.length < 2 && (
                    <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/25 text-xs text-status-warning font-medium">
                      ⚠️ Add at least 2 PDF files to enable merging.
                    </div>
                  )}

                  {/* Primary Merge CTA Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleMergePdf}
                    disabled={pdfFiles.length < 2}
                    className="w-full text-base sm:text-lg py-4 min-h-[50px] shadow-premium-md cursor-pointer"
                    leftIcon={<FileCheck2 className="w-5 h-5" />}
                  >
                    {ttf("merge-pdf", "mergeButton", locale, { count: String(pdfFiles.length) }, `Merge ${pdfFiles.length} PDFs`)}
                  </Button>

                  <div className="pt-2 border-t border-border-light/70 text-xs text-text-muted flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <span>Processing runs 100% locally in your browser. No files are uploaded to external servers.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Download Feedback / Review Modal */}
      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};
