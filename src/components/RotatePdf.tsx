import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  RotateCw, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { PDFDocument, degrees } from "@cantoo/pdf-lib";
import { Button, Card, Breadcrumbs, ToolActionPanel } from "./Common";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { PdfPreview } from "./pdf/PdfPreview";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface RotatePdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const RotatePdf: React.FC<RotatePdfProps> = ({
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
  
  // States
  const [rotateScope, setRotateScope] = useState<"all" | "selected">("all");
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});
  const [lastResult, setLastResult] = useState<{ name: string; size: number; url: string; blob: Blob } | null>(null);

  const lastResultRef = useRef<{ name: string; size: number; url: string; blob: Blob } | null>(null);

  useEffect(() => {
    return () => {
      if (lastResultRef.current) URL.revokeObjectURL(lastResultRef.current.url);
    };
  }, []);

  const storeLastResult = (result: { name: string; size: number; url: string; blob: Blob } | null) => {
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
      setProgressMsg("Reading PDF structure...");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(count);
      setSelectedPages([]);
      setThumbnails({});

      onAddToast(`Loaded "${file.name}" successfully.`, "success");
    } catch (err: any) {
      onAddToast(`Failed to parse PDF: ${err?.message || "Invalid PDF"}`, "error");
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

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleRotatePdf = async () => {
    if (!buffer) return;
    setIsProcessing(true);
    setProgressMsg("Applying page rotations...");

    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pageCount; i++) {
        const pageNum = i + 1;
        const shouldRotate = rotateScope === "all" || selectedPages.includes(pageNum);

        if (shouldRotate) {
          const page = pages[i];
          const currentRotation = page.getRotation().angle;
          // Apply added rotation clockwise
          const newRotation = (currentRotation + rotateAngle) % 360;
          page.setRotation(degrees(newRotation));
        }
      }

      setProgressMsg("Rebuilding PDF stream...");
      const rotatedBytes = await pdfDoc.save();

      const blob = new Blob([rotatedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = `rotated_${pdfFile?.name}`;
      storeLastResult({ name: fileName, size: blob.size, url, blob });

      onAddToast("PDF rotation completed successfully! Inspect your rotated pages below.", "success");
    } catch (err: any) {
      onAddToast(`Rotation failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownloadRotated = () => {
    if (!lastResult) return;
    const link = document.createElement("a");
    link.href = lastResult.url;
    link.download = lastResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Rotate PDF");
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
                Rotation Complete ✅
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                Your Rotated PDF is Ready!
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                Applied {rotateAngle}° clockwise rotation to {rotateScope === "all" ? `all ${pageCount} pages` : `${selectedPages.length} selected pages`} ({(lastResult.size / 1024).toFixed(1)} KB).
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
                id="download-rotated-pdf-btn"
                variant="primary"
                size="lg"
                onClick={handleDownloadRotated}
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                DOWNLOAD ROTATED PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => storeLastResult(null)}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCw className="w-4 h-4" />}
              >
                Adjust Rotation Angles
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => { storeLastResult(null); setPdfFile(null); setBuffer(null); setThumbnails({}); setSelectedPages([]); }}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Rotate Different File
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
            <Card title="Upload PDF to Rotate" subtitle="Support all standard orientations and angles.">
              <div
                onClick={() => document.getElementById("rotate-file-input")?.click()}
                className="border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center gap-4 text-center hover:border-brand-primary hover:bg-surface-muted/30 cursor-pointer min-h-[220px]"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="rotate-file-input"
                />
                <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary">
                  <RotateCw className="w-10 h-10 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-lg font-bold text-brand-primary font-sans block">Upload PDF File</span>
                  <span className="text-sm text-text-muted mt-2 block">or drag & drop here</span>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Document Preview (Left on desktop ~67%, Top on mobile) */}
              <div className="order-1 lg:order-1 lg:col-span-2">
                <Card title="Page Quality Auditor" subtitle="Live rotation preview before applying changes.">
                  {isProcessing && progressMsg && (
                    <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-center gap-3 mb-4">
                      <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-main">Local Compilation</p>
                        <p className="text-xs text-text-muted mt-0.5">{progressMsg}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                      const isChecked = selectedPages.includes(pageNum) || rotateScope === "all";
                      const isAvailable = !!thumbnails[pageNum];
                      return (
                        <div
                          key={pageNum}
                          onClick={() => rotateScope === "selected" && togglePageSelection(pageNum)}
                          className={`relative aspect-[3/4] rounded-xl border flex flex-col justify-between overflow-hidden bg-surface-muted/30 cursor-pointer group transition-all p-1.5 select-none ${
                            rotateScope === "selected" && selectedPages.includes(pageNum)
                              ? "border-brand-primary ring-2 ring-brand-primary/10 bg-brand-primary/5"
                              : "border-border-medium hover:border-border-focus"
                          }`}
                        >
                          <div className="flex justify-between items-center z-10">
                            <span className="px-2 py-0.5 bg-black/65 text-white rounded-full text-[10px] font-bold font-mono">
                              Page {pageNum}
                            </span>
                            {rotateScope === "selected" && (
                              <div className="text-brand-primary">
                                {selectedPages.includes(pageNum) ? (
                                  <CheckSquare className="w-5 h-5 bg-white rounded-md" />
                                ) : (
                                  <Square className="w-5 h-5 bg-white text-text-disabled rounded-md" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Display thumbnail with dynamically previewed CSS rotation */}
                          <div className="flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden">
                            {isAvailable ? (
                              <div
                                className="transition-transform duration-200"
                                style={{
                                  transform: isChecked ? `rotate(${rotateAngle}deg)` : "none"
                                }}
                              >
                                <img
                                  src={thumbnails[pageNum]}
                                  alt={`Page ${pageNum}`}
                                  className="max-h-[100px] object-contain shadow-sm border border-border-light rounded-sm"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="text-[10px] font-mono text-text-disabled text-center">
                                Loading...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Controls (Right on desktop ~33%, Below preview on mobile) */}
              <div className="order-2 lg:order-2 lg:col-span-1 space-y-6">
                <Card title="Rotation Angles" subtitle="Choose parameters." collapsible>
                  <div className="p-4 bg-surface-muted/40 rounded-xl border border-border-light space-y-1">
                    <span className="text-[10px] font-mono uppercase text-text-muted block">Active File</span>
                    <p className="text-sm font-semibold text-text-main truncate font-sans">{pdfFile.name}</p>
                    <p className="text-xs font-mono text-brand-primary">{pageCount} pages detected</p>
                  </div>

                  {/* Angles Selectors */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono uppercase text-text-muted block">Rotation Angle</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[90, 180, 270].map(angle => (
                        <button
                          key={angle}
                          type="button"
                          onClick={() => setRotateAngle(angle as any)}
                          className={`py-3 text-sm font-bold font-mono rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                            rotateAngle === angle
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                          }`}
                        >
                          {angle}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selection scope */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono uppercase text-text-muted block">Apply To</span>
                    
                    <label className="flex items-center gap-3 p-3 bg-surface-base border border-border-light rounded-xl cursor-pointer hover:border-brand-primary/40 min-h-[44px]">
                      <input
                        type="radio"
                        name="rotate-scope"
                        checked={rotateScope === "all"}
                        onChange={() => setRotateScope("all")}
                        className="accent-brand-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-text-main font-sans block">All pages</span>
                        <span className="text-xs text-text-muted">Rotate every sheet in the document</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-surface-base border border-border-light rounded-xl cursor-pointer hover:border-brand-primary/40 min-h-[44px]">
                      <input
                        type="radio"
                        name="rotate-scope"
                        checked={rotateScope === "selected"}
                        onChange={() => setRotateScope("selected")}
                        className="accent-brand-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-text-main font-sans block">Selected pages only</span>
                        <span className="text-xs text-text-muted">Choose pages using the auditor checkboxes</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-6">
                    <Button
                      variant="primary"
                      onClick={handleRotatePdf}
                      loading={isProcessing}
                      className="w-full cursor-pointer py-3.5 min-h-[48px]"
                      leftIcon={<RotateCw className="w-5 h-5" />}
                    >
                      Apply Rotation
                    </Button>
                    <button
                      onClick={() => { setPdfFile(null); setBuffer(null); }}
                      className="w-full text-center text-xs font-mono text-text-muted hover:text-text-main mt-4 block hover:underline cursor-pointer min-h-[44px] flex items-center justify-center"
                    >
                      Upload Different File
                    </button>
                  </div>
                </Card>
              </div>
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
