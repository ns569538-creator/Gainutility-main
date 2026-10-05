import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  Sparkles,
  Move,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Button, Card, Breadcrumbs } from "./Common";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { PdfPreview } from "./pdf/PdfPreview";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface RearrangePdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const RearrangePdf: React.FC<RearrangePdfProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const postDownload = usePostDownload();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  
  // Array of 1-based page indices representing the current order, e.g., [1, 2, 3, 4]
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});
  const [lastResult, setLastResult] = useState<{ name: string; size: number; url: string; blob: Blob; pageOrder: number[] } | null>(null);

  const lastResultRef = useRef<{ name: string; size: number; url: string; blob: Blob; pageOrder: number[] } | null>(null);

  useEffect(() => {
    return () => {
      if (lastResultRef.current) URL.revokeObjectURL(lastResultRef.current.url);
    };
  }, []);

  const storeLastResult = (result: { name: string; size: number; url: string; blob: Blob; pageOrder: number[] } | null) => {
    if (lastResultRef.current) URL.revokeObjectURL(lastResultRef.current.url);
    lastResultRef.current = result;
    setLastResult(result);
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      onAddToast("That file is not a PDF. Choose a file that ends in .pdf.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      setProgressMsg("Analyzing PDF page indices...");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(count);
      setPageOrder(Array.from({ length: count }, (_, i) => i + 1));
      setThumbnails({});

      onAddToast(`Loaded "${file.name}" with ${count} pages.`, "success");
    } catch (err: any) {
      onAddToast(`Failed to parse PDF: ${err?.message || "Verify file is valid"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  // Render thumbnails
  useEffect(() => {
    if (!buffer || pageCount === 0) return;

    let active = true;
    const loadThumbnails = async () => {
      try {
        const pdfjs = await loadPdfJs();
        // pdf.js detaches buffers it receives; hand it a private copy.
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdf = await loadingTask.promise;

        const limit = Math.min(pageCount, 24);
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
            console.error(`Page ${i} render failed:`, e);
          }
        }
      } catch (err) {
        console.error("PDFJS render thumbnail failed:", err);
      }
    };

    loadThumbnails();
    return () => {
      active = false;
    };
  }, [buffer, pageCount]);

  const movePage = (index: number, direction: "left" | "right") => {
    const nextIndex = direction === "left" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= pageOrder.length) return;

    const updated = [...pageOrder];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setPageOrder(updated);
  };

  const resetOrder = () => {
    setPageOrder(Array.from({ length: pageCount }, (_, i) => i + 1));
    onAddToast("Reset to original page sequence.", "info");
  };

  const handleSaveOrder = async () => {
    if (pageOrder.length === 0) return;
    setIsProcessing(true);
    setProgressMsg("Compiling new page indexes...");

    try {
      const srcDoc = await PDFDocument.load(buffer!);
      const newDoc = await PDFDocument.create();

      // Convert 1-based page order to 0-based index copy map
      const indices = pageOrder.map(p => p - 1);

      setProgressMsg(`Sequencing ${indices.length} pages...`);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(p => newDoc.addPage(p));

      const bytes = await newDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = `rearranged_${pdfFile?.name}`;
      storeLastResult({ name: fileName, size: blob.size, url, blob, pageOrder: [...pageOrder] });

      onAddToast("Page sequence reordered successfully! Inspect your updated document below.", "success");
    } catch (err: any) {
      onAddToast(`Reordering failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownloadReordered = () => {
    if (!lastResult) return;
    const link = document.createElement("a");
    link.href = lastResult.url;
    link.download = lastResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Rearrange PDF Pages");
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* RESULT STATE: Visual verification before download */}
      {lastResult && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface-base border-2 border-brand-primary/20 rounded-[24px] p-6 sm:p-8 md:p-10 shadow-premium-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-success/10 text-status-success mx-auto">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-status-success/15 text-status-success">
                Sequence Saved Successfully ✅
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                Your Reordered PDF is Ready!
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                Reordered {pageCount} pages into new sequence: {lastResult.pageOrder.join(" → ")} ({(lastResult.size / 1024).toFixed(1)} KB).
              </p>
            </div>

            {/* Visual Result Preview */}
            <div className="max-w-3xl mx-auto w-full space-y-3 pt-2 text-left">
              <div className="flex items-center justify-between border-b border-border-light pb-2.5">
                <span className="font-sans font-bold text-sm sm:text-base text-text-main">
                  Visual Result Preview
                </span>
                <span className="text-xs font-mono text-text-muted truncate max-w-[60%]">
                  📄 {lastResult.name}
                </span>
              </div>
              <div className="bg-surface-muted/20 border border-border-light rounded-2xl p-3 sm:p-4">
                <PdfPreview file={lastResult.blob} maxHeight={460} />
              </div>
            </div>

            {/* Download and actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                id="download-reordered-pdf-btn"
                variant="primary"
                size="lg"
                onClick={handleDownloadReordered}
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                DOWNLOAD REORDERED PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => storeLastResult(null)}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<Move className="w-4 h-4" />}
              >
                Adjust Order Further
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => { storeLastResult(null); setPdfFile(null); setBuffer(null); setThumbnails({}); setPageOrder([]); }}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Rearrange Different File
              </Button>
            </div>

            <div className="pt-2 text-xs text-text-muted flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>100% Client-side. No files were uploaded to external servers.</span>
            </div>
          </div>
        </div>
      )}

      {/* EDITOR / UPLOAD STATE (when not showing result) */}
      {!lastResult && (
        <>
          {!pdfFile ? (
            <Card title="Upload PDF to Rearrange" subtitle="Import file to shuffle pages and order.">
              <div
                onClick={() => document.getElementById("rearrange-file-input")?.click()}
                className="border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center gap-4 text-center hover:border-brand-primary hover:bg-surface-muted/30 cursor-pointer min-h-[220px]"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="rearrange-file-input"
                />
                <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary">
                  <Move className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <span className="text-lg font-bold text-brand-primary font-sans block">Upload PDF File</span>
                  <span className="text-sm text-text-muted mt-2 block">or drag & drop here</span>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Action Row */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-surface-base border border-border-light rounded-[20px] shadow-premium-sm">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-main truncate font-sans">{pdfFile.name}</p>
                  <p className="text-xs text-text-muted font-mono">Sequence: {pageOrder.join(" → ")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={resetOrder}
                    className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main hover:underline cursor-pointer"
                  >
                    Reset Order
                  </button>
                  <Button
                    variant="primary"
                    onClick={handleSaveOrder}
                    loading={isProcessing}
                    className="cursor-pointer min-h-[44px]"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Save Page Sequence
                  </Button>
                </div>
              </div>

              {/* Grid visual selector */}
              <Card title="Interactive Page Sequencer" subtitle="Click arrows to move pages left or right." collapsible>
                {isProcessing && progressMsg && (
                  <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-center gap-3 mb-4">
                    <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-main">Local Sequencing</p>
                      <p className="text-xs text-text-muted mt-0.5">{progressMsg}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[550px] overflow-y-auto pr-2">
                  {pageOrder.map((pageNum, index) => {
                    const isAvailable = !!thumbnails[pageNum];
                    return (
                      <div
                        key={`${pageNum}-${index}`}
                        className="relative aspect-[3/4] rounded-xl border border-border-medium bg-surface-muted/30 p-1.5 flex flex-col justify-between transition-all hover:border-border-focus group select-none"
                      >
                        {/* Header: showing current slot vs original index */}
                        <div className="flex justify-between items-center z-10">
                          <span className="px-2 py-0.5 bg-black/65 text-white rounded-full text-[10px] font-bold font-mono">
                            Slot {index + 1}
                          </span>
                          <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md text-[9px] font-mono font-bold">
                            Orig: #{pageNum}
                          </span>
                        </div>

                        {/* Thumbnail preview */}
                        <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                          {isAvailable ? (
                            <img
                              src={thumbnails[pageNum]}
                              alt={`Page ${pageNum}`}
                              className="max-h-full max-w-full object-contain shadow-sm border border-border-light rounded-sm"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-[10px] font-mono text-text-disabled">Loading...</div>
                          )}
                        </div>

                        {/* Bottom slot move layout actions */}
                        <div className="flex items-center justify-between border-t border-border-light pt-1.5 mt-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => movePage(index, "left")}
                            disabled={index === 0}
                            className="flex-1 p-1 flex justify-center bg-surface-base hover:bg-brand-primary hover:text-white rounded-md border border-border-light disabled:opacity-20 cursor-pointer"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePage(index, "right")}
                            disabled={index === pageOrder.length - 1}
                            className="flex-1 p-1 flex justify-center bg-surface-base hover:bg-brand-primary hover:text-white rounded-md border border-border-light disabled:opacity-20 cursor-pointer"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Post Download Feedback Panel */}
      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};
