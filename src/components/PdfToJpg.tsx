import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Image, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  CheckSquare,
  Square,
  Grid,
  FileDown
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { loadPdfJs } from "../lib/pdfJsLoader";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface PdfToJpgProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const PdfToJpg: React.FC<PdfToJpgProps> = ({
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
  
  // Settings
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [exportScope, setExportScope] = useState<"all" | "selected">("all");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Previews
  const [thumbnails, setThumbnails] = useState<{ [pageNum: number]: string }>({});
  const [convertedImages, setConvertedImages] = useState<{ [pageNum: number]: string }>({});

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      onAddToast("That file is not a PDF. Choose a file that ends in .pdf.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      setProgressMsg("Reading PDF document streams...");
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjs = await loadPdfJs();
      if (!pdfjs) {
        throw new Error("PDF renderer library not loaded yet.");
      }

      // pdf.js detaches buffers it receives; always hand it a private copy so
      // the original ArrayBuffer stays valid for later conversions.
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
      const pdf = await loadingTask.promise;
      
      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(pdf.numPages);
      setSelectedPages([]);
      setThumbnails({});
      setConvertedImages({});

      onAddToast(`Loaded "${file.name}" with ${pdf.numPages} pages.`, "success");
    } catch (err: any) {
      onAddToast(`Failed to parse PDF: ${err?.message || "Verify file is not corrupted"}`, "error");
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
            console.error(`Page ${i} rendering failed:`, e);
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

  const handleConvertPdfToJpg = async () => {
    if (!buffer) return;
    setIsProcessing(true);
    setProgressMsg("Converting PDF layers to high-res JPG raster graphics...");

    try {
      const pdfjs = await loadPdfJs();
      // pdf.js detaches buffers it receives; hand it a private copy.
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
      const pdf = await loadingTask.promise;

      // Viewport scale relative to the PDF's 72pt/inch base grid.
      const SCALE_FACTORS = {
        low: 1.0,    // ≈72 DPI — standard web preview
        medium: 1.5, // ≈108 DPI — balanced
        high: 2.5    // ≈180 DPI — high resolution
      };
      const scale = SCALE_FACTORS[quality];

      const targets = Array.from({ length: pageCount }, (_, i) => i + 1).filter(pageNum => 
        exportScope === "all" || selectedPages.includes(pageNum)
      );

      if (targets.length === 0) {
        throw new Error("Please select at least 1 page to convert.");
      }

      const outputs: { [pageNum: number]: string } = {};

      for (const pageNum of targets) {
        setProgressMsg(`Converting page ${pageNum} of ${pageCount}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");

        if (context) {
          // Fill white first: JPEG has no alpha, so transparent PDF pages
          // would otherwise export with black backgrounds.
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          outputs[pageNum] = dataUrl;
        }
      }

      setConvertedImages(outputs);
      onAddToast(`Successfully rasterized ${targets.length} pages to JPG! Inspect previews below.`, "success");
    } catch (err: any) {
      onAddToast(`Conversion failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const downloadSinglePage = (pageNum: number, dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${pdfFile?.name.replace(".pdf", "")}_page_${pageNum}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast(`Downloaded page ${pageNum} as JPG.`, "success");
    postDownload.show("PDF to JPG");
  };

  const downloadAllConverted = async () => {
    const pages = Object.entries(convertedImages);
    if (pages.length <= 1) {
      pages.forEach(([pageNum, dataUrl]) => downloadSinglePage(parseInt(pageNum), dataUrl as string));
      return;
    }
    // Multi-page output: bundle into a single ZIP so the browser only
    // triggers one download instead of one per page.
    try {
      setProgressMsg("Packaging pages into ZIP...");
      setIsProcessing(true);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const baseName = pdfFile?.name.replace(/\.pdf$/i, "") || "document";
      for (const [pageNum, dataUrl] of pages) {
        const res = await fetch(dataUrl as string);
        const blob = await res.blob();
        zip.file(`${baseName}_page_${pageNum}.jpg`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_pages_jpg.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onAddToast(`Downloaded ${pages.length} pages as a ZIP archive.`, "success");
      postDownload.show("PDF to JPG");
    } catch (err: any) {
      onAddToast(`ZIP packaging failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      
      

      {!pdfFile ? (
        <Card title="Upload PDF to Convert" subtitle="Support all standard documents.">
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
            onClick={() => document.getElementById("pdf-to-jpg-input")?.click()}
            className={`border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer min-h-[220px] ${isDragOver ? "border-brand-primary bg-surface-muted/30" : "border-border-medium hover:border-brand-primary hover:bg-surface-muted/30"}`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="pdf-to-jpg-input"
            />
            <div className="p-4 bg-brand-primary/10 rounded-full text-brand-primary">
              <Image className="w-10 h-10" />
            </div>
            <div>
              <span className="text-lg font-bold text-brand-primary font-sans block">Upload PDF File</span>
              <span className="text-sm text-text-muted mt-2 block">or drag & drop here</span>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Visual Grid Selector & Converted List (Left on desktop ~67%, Top on mobile) */}
          <div className="order-1 lg:order-1 lg:col-span-2 space-y-6">
            {Object.keys(convertedImages).length > 0 && (
              <Card title="Converted JPG Outputs" subtitle="Download individual raster frames.">
                <div className="flex justify-between items-center border-b border-border-light pb-2">
                  <span className="text-xs font-mono uppercase text-text-muted">Generated JPG Frames ({Object.keys(convertedImages).length})</span>
                  <button onClick={downloadAllConverted} className="text-xs font-mono text-brand-primary flex items-center gap-1 hover:underline cursor-pointer min-h-[36px]">
                    <FileDown className="w-4 h-4" /> Download All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {Object.entries(convertedImages).map(([pageNum, dataUrl]) => (
                    <div key={pageNum} className="p-2 border border-border-medium rounded-xl flex flex-col justify-between bg-surface-muted/20 gap-3">
                      <div className="aspect-[3/4] border border-border-light rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img src={dataUrl} alt={`page-${pageNum}`} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono font-bold text-text-muted">Page {pageNum}</span>
                        <button
                          onClick={() => downloadSinglePage(parseInt(pageNum), dataUrl as string)}
                          className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title={`Download Page ${pageNum}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Interactive Page Auditor" subtitle="View PDF pages and select extraction layouts.">
              {isProcessing && progressMsg && (
                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-center gap-3 mb-4">
                  <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-main">Local Converter Active</p>
                    <p className="text-xs text-text-muted mt-0.5">{progressMsg}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                  const isChecked = selectedPages.includes(pageNum) || exportScope === "all";
                  const isAvailable = !!thumbnails[pageNum];
                  return (
                    <div
                      key={pageNum}
                      onClick={() => exportScope === "selected" && togglePageSelection(pageNum)}
                      className={`relative aspect-[3/4] rounded-xl border flex flex-col justify-between overflow-hidden bg-surface-muted/30 cursor-pointer group transition-all p-1.5 select-none ${
                        exportScope === "selected" && selectedPages.includes(pageNum)
                          ? "border-brand-primary ring-2 ring-brand-primary/10 bg-brand-primary/5"
                          : "border-border-medium hover:border-border-focus"
                      }`}
                    >
                      <div className="flex justify-between items-center z-10">
                        <span className="px-2 py-0.5 bg-black/65 text-white rounded-full text-[10px] font-bold font-mono">
                          Page {pageNum}
                        </span>
                        {exportScope === "selected" && (
                          <div className="text-brand-primary">
                            {selectedPages.includes(pageNum) ? (
                              <CheckSquare className="w-5 h-5 bg-white rounded-md" />
                            ) : (
                              <Square className="w-5 h-5 bg-white text-text-disabled rounded-md" />
                            )}
                          </div>
                        )}
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
            <Card title="Extraction Quality" subtitle="Choose image settings." collapsible>
              <div className="p-4 bg-surface-muted/40 rounded-xl border border-border-light space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-muted block">Active PDF</span>
                <p className="text-sm font-semibold text-text-main truncate font-sans">{pdfFile.name}</p>
                <p className="text-xs font-mono text-brand-primary">{pageCount} pages detected</p>
              </div>

              {/* Quality Preset */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase text-text-muted block font-bold">Image Resolution</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "low", label: "Low", desc: "≈72 DPI" },
                    { id: "medium", label: "Medium", desc: "≈108 DPI" },
                    { id: "high", label: "High", desc: "≈180 DPI" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuality(opt.id as any)}
                      className={`py-3 flex flex-col items-center rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                        quality === opt.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">{opt.label}</span>
                      <span className="text-[9px] font-mono opacity-80 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase text-text-muted block">Pages Scope</span>
                
                <label className="flex items-center gap-3 p-3 bg-surface-base border border-border-light rounded-xl cursor-pointer hover:border-brand-primary/40 min-h-[44px]">
                  <input
                    type="radio"
                    name="jpg-scope"
                    checked={exportScope === "all"}
                    onChange={() => setExportScope("all")}
                    className="accent-brand-primary"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-main font-sans block">Convert all pages</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-surface-base border border-border-light rounded-xl cursor-pointer hover:border-brand-primary/40 min-h-[44px]">
                  <input
                    type="radio"
                    name="jpg-scope"
                    checked={exportScope === "selected"}
                    onChange={() => setExportScope("selected")}
                    className="accent-brand-primary"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-main font-sans block">Convert selected pages</span>
                  </div>
                </label>
              </div>

              <div className="pt-6">
                <Button
                  variant="primary"
                  onClick={handleConvertPdfToJpg}
                  loading={isProcessing}
                  className="w-full min-h-[48px] cursor-pointer"
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  Rasterize Pages to JPG
                </Button>
                <button
                  onClick={() => { setPdfFile(null); setBuffer(null); setConvertedImages({}); }}
                  className="w-full text-center text-xs font-mono text-text-muted hover:text-text-main mt-4 block hover:underline cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Upload Different File
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />

      </div>
  );
};
