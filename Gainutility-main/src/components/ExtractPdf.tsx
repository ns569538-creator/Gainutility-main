import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Button, Card, Breadcrumbs, ToolActionPanel } from "./Common";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { PdfPreview } from "./pdf/PdfPreview";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface ExtractPdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ExtractPdf: React.FC<ExtractPdfProps> = ({
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
  
  // Selection
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});
  const [lastResult, setLastResult] = useState<{ name: string; size: number; url: string; blob: Blob; pageCount: number } | null>(null);

  const lastResultRef = useRef<{ name: string; size: number; url: string; blob: Blob; pageCount: number } | null>(null);

  useEffect(() => {
    return () => {
      if (lastResultRef.current) URL.revokeObjectURL(lastResultRef.current.url);
    };
  }, []);

  const storeLastResult = (result: { name: string; size: number; url: string; blob: Blob; pageCount: number } | null) => {
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
      setProgressMsg("Analyzing PDF structure...");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(count);
      setSelectedPages([]);
      setRangeInput("");
      setThumbnails({});

      onAddToast(`Loaded "${file.name}" with ${count} pages.`, "success");
    } catch (err: any) {
      onAddToast(`Failed to parse PDF: ${err?.message || "Invalid PDF file"}`, "error");
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
        // pdf.js transfers (detaches) any buffer handed to it; always pass a
        // private copy so the original stays usable for pdf-lib below.
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

  // Update selected pages when range input changes
  const handleRangeInputChange = (input: string) => {
    setRangeInput(input);
    if (!input.trim()) {
      setSelectedPages([]);
      return;
    }

    const pages = new Set<number>();
    const parts = input.split(",").map(p => p.trim());
    
    parts.forEach(part => {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= pageCount) {
          const s = Math.min(start, end);
          const e = Math.max(start, end);
          for (let i = s; i <= e; i++) pages.add(i);
        }
      } else {
        const pNum = parseInt(part);
        if (!isNaN(pNum) && pNum > 0 && pNum <= pageCount) {
          pages.add(pNum);
        }
      }
    });

    setSelectedPages(Array.from(pages).sort((a, b) => a - b));
  };

  const togglePageSelection = (pageNum: number) => {
    let next: number[];
    if (selectedPages.includes(pageNum)) {
      next = selectedPages.filter(p => p !== pageNum);
    } else {
      next = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(next);
    
    // Generate text range input string matching next selection
    if (next.length === 0) {
      setRangeInput("");
      return;
    }
    
    // Simple compression to ranges (e.g., 1, 2, 3 -> 1-3)
    const ranges: string[] = [];
    let start = next[0];
    let end = next[0];
    
    for (let i = 1; i < next.length; i++) {
      if (next[i] === end + 1) {
        end = next[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = next[i];
        end = next[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    setRangeInput(ranges.join(", "));
  };

  const handleExtractPages = async () => {
    if (selectedPages.length === 0) {
      onAddToast("Please select at least 1 page to extract!", "warning");
      return;
    }

    setIsProcessing(true);
    setProgressMsg(`Extracting ${selectedPages.length} selected pages...`);

    try {
      const srcDoc = await PDFDocument.load(buffer!);
      const subDoc = await PDFDocument.create();
      
      const indices = selectedPages.map(p => p - 1);
      const copied = await subDoc.copyPages(srcDoc, indices);
      copied.forEach(p => subDoc.addPage(p));

      const bytes = await subDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = `extracted_${pdfFile?.name}`;
      storeLastResult({ name: fileName, size: blob.size, url, blob, pageCount: selectedPages.length });

      onAddToast("Selected pages extracted successfully! Inspect your document below.", "success");
    } catch (err: any) {
      onAddToast(`Extraction failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownloadExtracted = () => {
    if (!lastResult) return;
    const link = document.createElement("a");
    link.href = lastResult.url;
    link.download = lastResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Extract PDF Pages");
  };

  const selectAll = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(`1-${pageCount}`);
  };

  const selectNone = () => {
    setSelectedPages([]);
    setRangeInput("");
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
                Pages Extracted Successfully ✅
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                Your Extracted PDF is Ready!
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                Extracted {lastResult.pageCount} page(s) into 1 document ({(lastResult.size / 1024).toFixed(1)} KB).
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
                id="download-extracted-pdf-btn"
                variant="primary"
                size="lg"
                onClick={handleDownloadExtracted}
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                DOWNLOAD EXTRACTED PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => storeLastResult(null)}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                Adjust Selected Pages
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => { storeLastResult(null); setPdfFile(null); setBuffer(null); setThumbnails({}); setSelectedPages([]); }}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Extract Different File
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
            <Card title="Upload PDF to Extract Pages" subtitle="Choose sheets visually or input text scopes.">
              <div
                onClick={() => document.getElementById("extract-file-input")?.click()}
                className="border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center gap-4 text-center hover:border-brand-primary hover:bg-surface-muted/30 cursor-pointer min-h-[220px]"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="extract-file-input"
                />
                <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary">
                  <ExternalLink className="w-10 h-10" />
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
                <Card title="Visual Layout Selector" subtitle="Click pages directly to select or deselect.">
                  {isProcessing && progressMsg && (
                    <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-center gap-3 mb-4">
                      <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-main">Extraction Processor</p>
                        <p className="text-xs text-text-muted mt-0.5">{progressMsg}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                      const isChecked = selectedPages.includes(pageNum);
                      const isAvailable = !!thumbnails[pageNum];
                      return (
                        <div
                          key={pageNum}
                          onClick={() => togglePageSelection(pageNum)}
                          className={`relative aspect-[3/4] rounded-xl border flex flex-col justify-between overflow-hidden bg-surface-muted/30 cursor-pointer group transition-all p-1.5 select-none ${
                            isChecked
                              ? "border-brand-primary ring-2 ring-brand-primary/10 bg-brand-primary/5"
                              : "border-border-medium hover:border-border-focus"
                          }`}
                        >
                          <div className="flex justify-between items-center z-10">
                            <span className="px-2 py-0.5 bg-black/65 text-white rounded-full text-[10px] font-bold font-mono">
                              Page {pageNum}
                            </span>
                            <div className="text-brand-primary">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 bg-white rounded-md" />
                              ) : (
                                <Square className="w-5 h-5 bg-white text-text-disabled rounded-md" />
                              )}
                            </div>
                          </div>

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
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Controls (Right on desktop ~33%, Below preview on mobile) */}
              <div className="order-2 lg:order-2 lg:col-span-1 space-y-6">
                <Card title="Extraction Targets" subtitle="Define pages to isolate." collapsible>
                  <div className="p-4 bg-surface-muted/40 rounded-xl border border-border-light space-y-1">
                    <span className="text-[10px] font-mono uppercase text-text-muted block">Active PDF</span>
                    <p className="text-sm font-semibold text-text-main truncate font-sans">{pdfFile.name}</p>
                    <p className="text-xs font-mono text-brand-primary">{pageCount} total pages</p>
                  </div>

                  {/* Summary of selection */}
                  <div className="p-3 bg-surface-base border border-border-light rounded-xl space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-text-muted">
                      <span>Pages selected:</span>
                      <span className="text-brand-primary font-bold">{selectedPages.length} of {pageCount}</span>
                    </div>
                  </div>

                  {/* Text Range Input */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="uppercase text-text-muted">Page Ranges</span>
                      <div className="space-x-2">
                        <button onClick={selectAll} className="text-brand-primary hover:underline cursor-pointer min-h-[36px] inline-flex items-center">All</button>
                        <span className="text-text-disabled">|</span>
                        <button onClick={selectNone} className="text-status-error hover:underline cursor-pointer min-h-[36px] inline-flex items-center">Clear</button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={rangeInput}
                      onChange={(e) => handleRangeInputChange(e.target.value)}
                      placeholder="e.g., 1, 3, 5-8"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-medium bg-surface-base text-text-main font-mono text-sm focus:border-brand-primary outline-none"
                    />
                    <span className="text-[10px] text-text-muted block font-mono">Separate pages with commas, use hyphens for ranges.</span>
                  </div>

                  <div className="pt-4 border-t border-border-light">
                    <Button
                      id="extract-pages-submit-btn"
                      variant="primary"
                      onClick={handleExtractPages}
                      loading={isProcessing}
                      disabled={selectedPages.length === 0}
                      className="w-full cursor-pointer py-3.5 min-h-[48px]"
                      leftIcon={<Download className="w-5 h-5" />}
                    >
                      Extract {selectedPages.length} Pages
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
