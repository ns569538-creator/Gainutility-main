import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  FileText, 
  Scissors, 
  Sliders, 
  Download, 
  RefreshCw, 
  Layers,
  ShieldCheck,
  CheckSquare,
  Square,
  ChevronDown,
  FileUp,
  AlertCircle,
  FolderArchive,
  ExternalLink,
  Sparkles,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import JSZip from "jszip";
import { Button, Card } from "./Common";
import { 
  PDFErrorAlert, 
  PDFPrivacyNotice, 
  PDFProcessingState, 
  PDFRelatedTools 
} from "./pdf/PdfComponents";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { useToolStateRestoration } from "../lib/toolStateStore";
import { PdfPreview } from "./pdf/PdfPreview";
import "../i18n/tools/splitPdf";
import { useLocale } from "../i18n/LocaleContext";
import { tt, ttf } from "../i18n/toolUi";

interface SplitPdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

interface SplitOutputItem {
  id: string;
  name: string;
  size: number;
  url: string;
  pageRange: string;
  pageCount: number;
  blob: Blob;
}

export const SplitPdf: React.FC<SplitPdfProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const locale = useLocale();
  const postDownload = usePostDownload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Split strategy settings
  const [splitMode, setSplitMode] = useState<"range" | "every" | "extract">("extract");
  const [rangeInput, setRangeInput] = useState("1");
  const [splitEveryPages, setSplitEveryPages] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // 1-based page indices

  // Render thumbnails
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});

  // Result state
  const [splitOutputs, setSplitOutputs] = useState<SplitOutputItem[]>([]);
  const [zipResult, setZipResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [previewOutputIndex, setPreviewOutputIndex] = useState(0);

  // Memory cleanup
  useEffect(() => {
    return () => {
      splitOutputs.forEach(item => URL.revokeObjectURL(item.url));
      if (zipResult?.url) URL.revokeObjectURL(zipResult.url);
    };
  }, [splitOutputs, zipResult]);

  // Back/Forward history restoration
  const getSerializableState = useCallback(() => ({
    pageCount,
    splitMode,
    rangeInput,
    splitEveryPages,
    selectedPages,
    fileName: pdfFile?.name ?? null,
  }), [pageCount, splitMode, rangeInput, splitEveryPages, selectedPages, pdfFile]);

  const restoreState = useCallback((saved: unknown) => {
    const s = saved as Partial<{
      pageCount: number;
      splitMode: "range" | "every" | "extract";
      rangeInput: string;
      splitEveryPages: number;
      selectedPages: number[];
    }>;
    if (!s) return;
    if (typeof s.pageCount === "number") setPageCount(s.pageCount);
    if (s.splitMode) setSplitMode(s.splitMode);
    if (s.rangeInput) setRangeInput(s.rangeInput);
    if (typeof s.splitEveryPages === "number") setSplitEveryPages(s.splitEveryPages);
    if (s.selectedPages && Array.isArray(s.selectedPages)) setSelectedPages(s.selectedPages);
  }, []);

  useToolStateRestoration("split-pdf", getSerializableState, restoreState);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      const msg = "Invalid file type: Please upload a PDF document (.pdf).";
      setErrorMessage(msg);
      onAddToast(msg, "error");
      return;
    }

    try {
      setIsProcessing(true);
      setProgressMsg("Reading PDF file...");
      setProgressPercent(20);

      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error("This PDF file is empty (0 bytes).");
      }

      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch (loadErr: any) {
        throw new Error("Failed to load PDF. The file may be password-protected or corrupted.");
      }

      // Check if password protected
      let count = 0;
      try {
        count = pdfDoc.getPageCount();
        pdfDoc.getPageIndices();
      } catch (encErr) {
        throw new Error("This document is password-protected. Please unlock or decrypt it before splitting.");
      }

      if (count === 0) {
        throw new Error("This PDF document contains 0 pages.");
      }

      // Clean up previous results if any
      splitOutputs.forEach(item => URL.revokeObjectURL(item.url));
      if (zipResult?.url) URL.revokeObjectURL(zipResult.url);
      setSplitOutputs([]);
      setZipResult(null);

      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(count);
      // Default: select first page or all pages
      setSelectedPages([1]);
      setRangeInput(count > 1 ? `1-${Math.min(3, count)}` : "1");
      setSplitEveryPages(1);
      setThumbnails({});

      onAddToast(`Loaded "${file.name}" with ${count} page${count === 1 ? "" : "s"}.`, "success");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Failed to parse PDF document.";
      setErrorMessage(msg);
      onAddToast(msg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
      setProgressPercent(0);
    }
  };

  // Render thumbnails lazily using PDF.js
  useEffect(() => {
    if (!buffer || pageCount === 0) return;

    let active = true;
    const loadThumbnails = async () => {
      try {
        const pdfjs = await loadPdfJs();
        // Pass a sliced copy so pdf.js doesn't detach the original array buffer
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;

        const limit = Math.min(pageCount, 30);
        for (let i = 1; i <= limit; i++) {
          if (!active) break;
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.25 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext("2d");
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
              if (active) {
                setThumbnails(prev => ({ ...prev, [i]: dataUrl }));
              }
            }
          } catch (e) {
            // Ignore preview render failures for individual pages
          }
        }
      } catch (err) {
        console.warn("Thumbnail preview unavailable:", err);
      }
    };

    loadThumbnails();
    return () => {
      active = false;
    };
  }, [buffer, pageCount]);

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNum) 
        ? prev.filter(p => p !== pageNum) 
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  };

  const selectNone = () => {
    setSelectedPages([]);
  };

  // Split execution
  const handleSplitPdf = async () => {
    if (!buffer || !pdfFile) return;
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMsg("Preparing document splitting...");

    try {
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const baseName = pdfFile.name.replace(/\.[^/.]+$/, "");
      const newOutputs: SplitOutputItem[] = [];

      if (splitMode === "extract") {
        // Mode 1: Extract selected pages into a single document
        if (selectedPages.length === 0) {
          throw new Error("No pages selected. Please select at least one page to extract.");
        }

        setProgressPercent(40);
        setProgressMsg(`Extracting ${selectedPages.length} selected pages...`);

        const subDoc = await PDFDocument.create();
        const indices = selectedPages.map(p => p - 1);
        const copiedPages = await subDoc.copyPages(srcDoc, indices);
        copiedPages.forEach(p => subDoc.addPage(p));

        setProgressPercent(80);
        setProgressMsg("Finalizing extracted PDF...");
        const bytes = await subDoc.save();

        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const fileName = `${baseName}_extracted_${selectedPages.length}pages.pdf`;

        newOutputs.push({
          id: Math.random().toString(36).substring(2, 9),
          name: fileName,
          size: blob.size,
          url,
          pageRange: selectedPages.join(", "),
          pageCount: selectedPages.length,
          blob
        });

      } else if (splitMode === "range") {
        // Mode 2: Split by custom ranges, e.g. "1-2, 3-5"
        const rawRanges = rangeInput.split(",").map(r => r.trim()).filter(Boolean);
        if (rawRanges.length === 0) {
          throw new Error("Please specify at least one page range (e.g., 1-2, 3-5).");
        }

        const parsedRanges: { start: number; end: number }[] = [];
        for (const rangeStr of rawRanges) {
          const parts = rangeStr.split("-").map(p => parseInt(p.trim(), 10));
          const start = parts[0];
          const end = parts.length > 1 ? parts[1] : start;

          if (isNaN(start) || isNaN(end) || start < 1 || end > pageCount || start > end) {
            throw new Error(`Invalid range "${rangeStr}". Values must be between 1 and ${pageCount}, with start <= end.`);
          }
          parsedRanges.push({ start, end });
        }

        for (let i = 0; i < parsedRanges.length; i++) {
          const { start, end } = parsedRanges[i];
          const percent = Math.round(20 + ((i + 1) / parsedRanges.length) * 60);
          setProgressPercent(percent);
          setProgressMsg(`Extracting range ${start}–${end} (${i + 1} of ${parsedRanges.length})...`);

          const subDoc = await PDFDocument.create();
          const indices = Array.from({ length: end - start + 1 }, (_, idx) => start - 1 + idx);
          const copiedPages = await subDoc.copyPages(srcDoc, indices);
          copiedPages.forEach(p => subDoc.addPage(p));

          const bytes = await subDoc.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const fileName = `${baseName}_pages_${start}-${end}.pdf`;

          newOutputs.push({
            id: Math.random().toString(36).substring(2, 9),
            name: fileName,
            size: blob.size,
            url,
            pageRange: `${start}-${end}`,
            pageCount: end - start + 1,
            blob
          });
        }

      } else if (splitMode === "every") {
        // Mode 3: Split every N pages
        const interval = Math.max(1, splitEveryPages);
        const totalParts = Math.ceil(pageCount / interval);
        let partNum = 1;

        for (let start = 0; start < pageCount; start += interval) {
          const end = Math.min(start + interval, pageCount);
          const percent = Math.round(20 + (partNum / totalParts) * 60);
          setProgressPercent(percent);
          setProgressMsg(`Building part ${partNum} of ${totalParts} (Pages ${start + 1}–${end})...`);

          const subDoc = await PDFDocument.create();
          const indices = Array.from({ length: end - start }, (_, idx) => start + idx);
          const copiedPages = await subDoc.copyPages(srcDoc, indices);
          copiedPages.forEach(p => subDoc.addPage(p));

          const bytes = await subDoc.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const fileName = `${baseName}_part_${partNum}.pdf`;

          newOutputs.push({
            id: Math.random().toString(36).substring(2, 9),
            name: fileName,
            size: blob.size,
            url,
            pageRange: `${start + 1}-${end}`,
            pageCount: end - start,
            blob
          });
          partNum++;
        }
      }

      // If multiple files produced, create a client-side ZIP bundle!
      if (newOutputs.length > 1) {
        setProgressPercent(85);
        setProgressMsg(`Packaging ${newOutputs.length} PDF documents into ZIP...`);

        const zip = new JSZip();
        for (const out of newOutputs) {
          const response = await fetch(out.url);
          const fileData = await response.arrayBuffer();
          zip.file(out.name, fileData);
        }

        const zipBytes = await zip.generateAsync({ type: "uint8array" });
        const zipBlob = new Blob([zipBytes], { type: "application/zip" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const zipName = `${baseName}_split_package.zip`;

        setZipResult({
          url: zipUrl,
          name: zipName,
          size: zipBlob.size
        });
      } else {
        setZipResult(null);
      }

      setProgressPercent(100);
      setPreviewOutputIndex(0);
      setSplitOutputs(newOutputs);
      onAddToast(tt("split-pdf", "toastSuccess", locale, "PDF split completed successfully!"), "success");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Failed to split PDF.";
      setErrorMessage(msg);
      onAddToast(msg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownloadSingle = (item: SplitOutputItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Split PDF");
  };

  const handleDownloadZip = () => {
    if (!zipResult) return;
    const link = document.createElement("a");
    link.href = zipResult.url;
    link.download = zipResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Split PDF");
  };

  const handleResetForNew = () => {
    splitOutputs.forEach(item => URL.revokeObjectURL(item.url));
    if (zipResult?.url) URL.revokeObjectURL(zipResult.url);
    setSplitOutputs([]);
    setZipResult(null);
    setPdfFile(null);
    setBuffer(null);
    setPageCount(0);
    setSelectedPages([]);
    setThumbnails({});
    setPreviewOutputIndex(0);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <PDFErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* STATE 1: RESULT SCREEN (When split files are ready) */}
      {splitOutputs.length > 0 && !isProcessing && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface-base border-2 border-brand-primary/20 rounded-[24px] p-6 sm:p-8 md:p-10 shadow-premium-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-success/10 text-status-success mx-auto">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-status-success/15 text-status-success">
                {tt("split-pdf", "readyStatus", locale, "Pages Split Successfully! ✅")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                {splitOutputs.length === 1 
                  ? "Your Extracted PDF is Ready!" 
                  : `Generated ${splitOutputs.length} Split Documents`}
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                {splitOutputs.length === 1 
                  ? `Extracted ${splitOutputs[0].pageCount} page(s) into 1 document (${formatBytes(splitOutputs[0].size)}).`
                  : `All ${splitOutputs.length} documents compiled locally. Download individual files or the complete ZIP package.`}
              </p>
            </div>

            {/* Visual Result Preview: Inspect Before Downloading */}
            <div className="max-w-3xl mx-auto w-full space-y-3 pt-2 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm sm:text-base text-text-main">
                    {splitOutputs.length === 1 ? "Visual Document Preview" : "Inspect Split Result Parts"}
                  </span>
                  {splitOutputs[previewOutputIndex] && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-primary-light/40 text-brand-primary font-semibold">
                      {splitOutputs[previewOutputIndex].pageCount} {splitOutputs[previewOutputIndex].pageCount === 1 ? "page" : "pages"}
                    </span>
                  )}
                </div>

                {splitOutputs.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                    {splitOutputs.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreviewOutputIndex(idx)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                          previewOutputIndex === idx
                            ? "bg-brand-primary text-white border-brand-primary shadow-sm font-bold"
                            : "bg-surface-muted/40 border-border-light text-text-muted hover:text-text-main hover:border-brand-primary/40"
                        }`}
                      >
                        Part {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {splitOutputs[previewOutputIndex] && (
                <div className="bg-surface-muted/20 border border-border-light rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-text-muted mb-2">
                    <span className="truncate max-w-[70%]" title={splitOutputs[previewOutputIndex].name}>
                      📄 {splitOutputs[previewOutputIndex].name}
                    </span>
                    <span>Pages: {splitOutputs[previewOutputIndex].pageRange}</span>
                  </div>
                  <PdfPreview
                    file={splitOutputs[previewOutputIndex].blob}
                    maxHeight={440}
                  />
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {splitOutputs.length === 1 ? (
                <Button
                  id="download-split-pdf-btn"
                  variant="primary"
                  size="lg"
                  onClick={() => handleDownloadSingle(splitOutputs[0])}
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                  leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
                >
                  {tt("split-pdf", "downloadSingle", locale, "DOWNLOAD EXTRACTED PDF")}
                </Button>
              ) : (
                <Button
                  id="download-all-zip-btn"
                  variant="primary"
                  size="lg"
                  onClick={handleDownloadZip}
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                  leftIcon={<FolderArchive className="w-5 h-5 sm:w-6 sm:h-6" />}
                >
                  {ttf("split-pdf", "downloadZip", locale, { count: String(splitOutputs.length) }, `DOWNLOAD ALL (${splitOutputs.length} FILES .ZIP)`)}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleResetForNew}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Split Another Document
              </Button>
            </div>

            {/* Multi-file individual download cards */}
            {splitOutputs.length > 1 && (
              <div className="max-w-2xl mx-auto pt-4 text-left border-t border-border-light space-y-3">
                <span className="text-xs font-mono uppercase text-text-muted block">
                  Individual Part Downloads:
                </span>
                <div className="divide-y divide-border-light rounded-xl border border-border-light overflow-hidden bg-surface-muted/30 max-h-[300px] overflow-y-auto">
                  {splitOutputs.map((item, idx) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-base transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-text-main truncate font-sans">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-text-muted font-mono">
                          Pages: {item.pageRange} • {formatBytes(item.size)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadSingle(item)}
                        className="text-xs min-h-[36px] shrink-0"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-xs text-text-muted flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>100% Client-side. No files were uploaded to external servers.</span>
            </div>
          </div>

          {/* Contextual Next Actions (Genuinely Relevant Internal Linking) */}
          <PDFRelatedTools
            currentToolId="split-pdf"
            onChangeView={onChangeView}
            title="Next Actions for Your Split Pages"
            subtitle="Ready for the next step? Combine, compress, or convert your pages:"
          />
        </div>
      )}

      {/* STATE 2: ACTIVE PROCESSING SCREEN */}
      {isProcessing && (
        <PDFProcessingState
          title="Extracting & Splitting Pages..."
          message={progressMsg}
          percentage={progressPercent}
          subtext="All operations run in local memory without transmitting files over the internet."
        />
      )}

      {/* STATE 3: MAIN WORKSPACE (Upload & Configure View) */}
      {splitOutputs.length === 0 && !isProcessing && (
        <div className="space-y-6">
          {/* Accessible Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
                e.target.value = "";
              }
            }}
            className="sr-only"
            id="split-file-input"
            aria-label="Upload PDF file to split"
          />

          {/* EMPTY STATE: PROMINENT DROPZONE */}
          {!pdfFile && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Click or drop PDF file here to upload"
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
                  {tt("split-pdf", "uploadButton", locale, "Upload PDF to Split")}
                </Button>
                <p className="text-sm sm:text-base text-text-sub font-medium pt-1">
                  {tt("split-pdf", "dragDropHint", locale, "or drag & drop your PDF document here")}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-mono text-text-muted">
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle">
                  Accepts .pdf files
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle">
                  Zero upload limits
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border-subtle flex items-center gap-1 text-brand-primary font-sans font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Private
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE STATE: SPLIT PARAMETERS + VISUAL PAGE GRID */}
          {pdfFile && pageCount > 0 && (
            <div className="space-y-6">
              {/* Active Document Header Bar */}
              <div className="p-4 sm:p-5 bg-surface-base rounded-2xl border border-border-light shadow-premium-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-text-main truncate font-sans" title={pdfFile.name}>
                      {pdfFile.name}
                    </p>
                    <p className="text-xs text-text-muted font-mono">
                      {pageCount} total pages • {formatBytes(pdfFile.size)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="cursor-pointer text-xs"
                >
                  Choose Different PDF
                </Button>
              </div>

              {/* 2-Column Responsive Workspace on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (Span 5 on Desktop): Strategy Selection & Execution */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
                  <div className="bg-surface-base border border-border-light rounded-[20px] p-5 sm:p-6 shadow-premium-sm space-y-5">
                    <h3 className="font-sans font-bold text-base sm:text-lg text-text-main border-b border-border-light pb-3">
                      {tt("split-pdf", "splitStrategy", locale, "Split Strategy")}
                    </h3>

                    {/* Radio Options with large touch areas (>=44px) */}
                    <div className="space-y-2.5">
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          splitMode === "extract" 
                            ? "border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary/30" 
                            : "border-border-subtle hover:border-brand-primary/40 bg-surface-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="split-mode"
                          value="extract"
                          checked={splitMode === "extract"}
                          onChange={() => setSplitMode("extract")}
                          className="mt-1 accent-brand-primary w-4 h-4 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-text-main font-sans block">
                            {tt("split-pdf", "modeExtract", locale, "Extract Selected Pages")}
                          </span>
                          <span className="text-xs text-text-muted leading-relaxed block">
                            {tt("split-pdf", "modeExtractDesc", locale, "Export visually checked sheets into one combined PDF")}
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          splitMode === "range" 
                            ? "border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary/30" 
                            : "border-border-subtle hover:border-brand-primary/40 bg-surface-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="split-mode"
                          value="range"
                          checked={splitMode === "range"}
                          onChange={() => setSplitMode("range")}
                          className="mt-1 accent-brand-primary w-4 h-4 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-text-main font-sans block">
                            {tt("split-pdf", "modeRange", locale, "Split by Page Ranges")}
                          </span>
                          <span className="text-xs text-text-muted leading-relaxed block">
                            {tt("split-pdf", "modeRangeDesc", locale, "Separate custom blocks (e.g. 1-3, 5, 8-10)")}
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          splitMode === "every" 
                            ? "border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary/30" 
                            : "border-border-subtle hover:border-brand-primary/40 bg-surface-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="split-mode"
                          value="every"
                          checked={splitMode === "every"}
                          onChange={() => setSplitMode("every")}
                          className="mt-1 accent-brand-primary w-4 h-4 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-text-main font-sans block">
                            {tt("split-pdf", "modeEvery", locale, "Split Every N Pages")}
                          </span>
                          <span className="text-xs text-text-muted leading-relaxed block">
                            {tt("split-pdf", "modeEveryDesc", locale, "Divide document into recurring chunks of N pages")}
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Contextual Input Fields */}
                    <div className="pt-2 border-t border-border-light space-y-3">
                      {splitMode === "extract" && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-text-muted">Pages: {selectedPages.length} of {pageCount} selected</span>
                            <div className="space-x-2">
                              <button type="button" onClick={selectAll} className="text-brand-primary hover:underline cursor-pointer">
                                All
                              </button>
                              <span className="text-text-disabled">|</span>
                              <button type="button" onClick={selectNone} className="text-status-error hover:underline cursor-pointer">
                                None
                              </button>
                            </div>
                          </div>
                          {selectedPages.length === 0 && (
                            <p className="text-xs text-status-warning font-medium">
                              ⚠️ Click pages in the preview grid on the right to select them.
                            </p>
                          )}
                        </div>
                      )}

                      {splitMode === "range" && (
                        <div className="space-y-2">
                          <label htmlFor="range-input" className="text-xs font-mono text-text-muted block">
                            Page Ranges (e.g. 1-2, 3-5):
                          </label>
                          <input
                            id="range-input"
                            type="text"
                            value={rangeInput}
                            onChange={(e) => setRangeInput(e.target.value)}
                            placeholder="1-2, 3-5"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-muted text-text-main font-mono text-sm focus:border-brand-primary focus:outline-none"
                          />
                          <p className="text-[11px] text-text-muted">
                            Total document has {pageCount} pages. Comma-separate multiple ranges.
                          </p>
                        </div>
                      )}

                      {splitMode === "every" && (
                        <div className="space-y-2">
                          <label htmlFor="interval-input" className="text-xs font-mono text-text-muted block">
                            Split every X pages:
                          </label>
                          <input
                            id="interval-input"
                            type="number"
                            min={1}
                            max={pageCount}
                            value={splitEveryPages}
                            onChange={(e) => setSplitEveryPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-muted text-text-main font-mono text-sm focus:border-brand-primary focus:outline-none"
                          />
                          <p className="text-[11px] text-text-muted">
                            Will create approximately {Math.ceil(pageCount / Math.max(1, splitEveryPages))} separate files.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Primary Process CTA Button */}
                    <div className="pt-2">
                      <Button
                        id="process-split-btn"
                        variant="primary"
                        size="lg"
                        onClick={handleSplitPdf}
                        loading={isProcessing}
                        disabled={splitMode === "extract" && selectedPages.length === 0}
                        className="w-full text-base py-4 min-h-[50px] shadow-premium-md cursor-pointer"
                        leftIcon={<Scissors className="w-5 h-5" />}
                      >
                        {splitMode === "extract" 
                          ? `Extract ${selectedPages.length} Pages` 
                          : tt("split-pdf", "splitButton", locale, "Process Split PDF")}
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-border-light text-xs text-text-muted flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>Processing runs 100% locally in your browser memory.</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (Span 7 on Desktop): Visual Page Inspection & Grid */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-surface-base border border-border-light rounded-[20px] p-4 sm:p-6 shadow-premium-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light pb-3">
                      <span className="font-sans font-bold text-sm sm:text-base text-text-main">
                        Page Preview &amp; Selection ({pageCount} pages)
                      </span>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <button type="button" onClick={selectAll} className="text-brand-primary hover:underline cursor-pointer">
                          Select All
                        </button>
                        <span className="text-text-disabled">|</span>
                        <button type="button" onClick={selectNone} className="text-text-muted hover:underline cursor-pointer">
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Responsive Grid with min 44px touch targets */}
                    <div 
                      id="pdf-pages-grid"
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1"
                    >
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                        const isSelected = selectedPages.includes(pageNum);
                        const thumbUrl = thumbnails[pageNum];

                        return (
                          <div
                            key={pageNum}
                            onClick={() => togglePageSelection(pageNum)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Page ${pageNum}, ${isSelected ? "selected" : "unselected"}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                togglePageSelection(pageNum);
                              }
                            }}
                            className={`group relative rounded-xl border p-2 flex flex-col items-center gap-2 cursor-pointer transition-all select-none min-h-[140px] justify-between ${
                              isSelected
                                ? "border-brand-primary bg-brand-primary-light/20 shadow-sm"
                                : "border-border-light hover:border-brand-primary/40 bg-surface-muted/20"
                            }`}
                          >
                            {/* Checkbox badge top right (>=44px clickable area handled by parent card) */}
                            <div className="w-full flex items-center justify-between text-xs font-mono">
                              <span className="font-bold text-text-main">
                                Page {pageNum}
                              </span>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isSelected ? "bg-brand-primary text-white" : "border border-border-default bg-surface-base"
                              }`}>
                                {isSelected ? (
                                  <CheckSquare className="w-3.5 h-3.5" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 opacity-20" />
                                )}
                              </div>
                            </div>

                            {/* Page Thumbnail or Placeholder */}
                            <div className="w-full h-24 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center overflow-hidden">
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt={`Page ${pageNum} preview`}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <FileText className="w-6 h-6 text-text-muted/40 mx-auto" />
                                  <span className="text-[10px] text-text-muted font-mono block mt-1">
                                    Page {pageNum}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
