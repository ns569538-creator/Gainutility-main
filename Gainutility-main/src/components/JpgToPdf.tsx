import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FileImage, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  Plus, 
  RefreshCw,
  ShieldCheck,
  FileCheck2,
  Sliders,
  Settings
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";
import { Button, Card, Breadcrumbs, ToolActionPanel } from "./Common";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import { PdfPreview } from "./pdf/PdfPreview";

interface JpgToPdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

interface ImageItem {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export const JpgToPdf: React.FC<JpgToPdfProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const postDownload = usePostDownload();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
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

  // Settings
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "auto">("auto");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<"none" | "small" | "medium">("none");

  const handleFilesUpload = (files: FileList | File[]) => {
    const validImages = Array.from(files).filter(file => {
      const type = file.type.toLowerCase();
      return type === "image/jpeg" || type === "image/png" || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".png");
    });

    if (validImages.length === 0) {
      onAddToast("Those files are not JPEG or PNG images. Choose files that end in .jpg, .jpeg or .png.", "error");
      return;
    }

    onAddToast(`Reading ${validImages.length} image(s)...`, "info");

    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: e.target!.result as string
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    onAddToast("Images uploaded to queue.", "success");
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setImages(updated);
  };

  const removeItem = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    onAddToast("Image removed from conversion list.", "info");
  };

  const clearAll = () => {
    setImages([]);
    onAddToast("Cleared all images.", "info");
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      onAddToast("Please add at least 1 image to convert!", "warning");
      return;
    }

    setIsProcessing(true);
    setProgressMsg("Creating high-resolution PDF document...");

    try {
      const pdfDoc = await PDFDocument.create();

      // Page dimensions in PDF points (1/72 inch)
      const SIZES = {
        a4: { width: 595.27, height: 841.89 },
        letter: { width: 612, height: 792 }
      };

      const MARGINS = {
        none: 0,
        small: 18,  // 0.25 inch
        medium: 36  // 0.5 inch
      };

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setProgressMsg(`Embedding image ${i + 1} of ${images.length}: "${item.name}"...`);

        // Load image bytes
        const response = await fetch(item.dataUrl);
        const imageBytes = await response.arrayBuffer();

        // Embed based on mime-type
        let pdfImage;
        if (item.type.includes("png") || item.name.toLowerCase().endsWith(".png")) {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;

        // Custom page size config
        if (pageSize !== "auto") {
          const baseSize = SIZES[pageSize];
          if (orientation === "portrait") {
            pageWidth = baseSize.width;
            pageHeight = baseSize.height;
          } else {
            pageWidth = baseSize.height;
            pageHeight = baseSize.width;
          }
        }

        const pageMargin = MARGINS[margin];
        const contentWidth = pageWidth - pageMargin * 2;
        const contentHeight = pageHeight - pageMargin * 2;

        // Scale image to fit inside available bounds keeping aspect ratio
        const scale = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
        const finalWidth = imgWidth * scale;
        const finalHeight = imgHeight * scale;

        // Center inside coordinates
        const x = pageMargin + (contentWidth - finalWidth) / 2;
        const y = pageMargin + (contentHeight - finalHeight) / 2;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(pdfImage, {
          x,
          y,
          width: finalWidth,
          height: finalHeight
        });
      }

      setProgressMsg("Optimizing PDF structure...");
      const pdfBytes = await pdfDoc.save();

      setProgressMsg("Finalizing PDF document...");
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = `converted_images_${new Date().toISOString().slice(0, 10)}.pdf`;
      storeLastResult({ name: fileName, size: blob.size, url, blob, pageCount: images.length });
      onAddToast("PDF generated successfully! Inspect the result below before downloading.", "success");
    } catch (err: any) {
      console.error(err);
      onAddToast(`Conversion failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleDownload = () => {
    if (!lastResult) return;
    const link = document.createElement("a");
    link.href = lastResult.url;
    link.download = lastResult.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Image to PDF");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* STATE 1: RESULT SCREEN (When PDF is generated) */}
      {lastResult && !isProcessing && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-surface-base border-2 border-brand-primary/20 rounded-[24px] p-6 sm:p-8 md:p-10 shadow-premium-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-success/10 text-status-success mx-auto">
              <FileCheck2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-status-success/15 text-status-success">
                PDF Ready ✅
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
                Your PDF Document is Ready!
              </h2>
              <p className="text-sm sm:text-base text-text-sub">
                Compiled {lastResult.pageCount} images into 1 PDF document ({formatBytes(lastResult.size)}).
              </p>
            </div>

            {/* Live Result PDF Preview */}
            <div className="max-w-2xl mx-auto space-y-2 text-left pt-2">
              <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <span className="font-semibold text-text-main">
                  Inspect All Converted Pages ({lastResult.pageCount} Pages)
                </span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">{lastResult.name}</span>
              </div>
              <div className="bg-surface-muted/20 border border-border-light rounded-2xl p-2 sm:p-3">
                <PdfPreview file={lastResult.blob} maxHeight={460} />
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                id="download-jpg-to-pdf-btn"
                variant="primary"
                size="lg"
                onClick={handleDownload}
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                leftIcon={<Download className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                DOWNLOAD PDF
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => storeLastResult(null)}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<Sliders className="w-4 h-4" />}
              >
                Modify Layout Settings
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => { storeLastResult(null); setImages([]); }}
                className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[52px] cursor-pointer"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Convert More Images
              </Button>
            </div>

            <div className="pt-2 text-xs text-text-muted flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>100% Client-side. Your PDF was compiled in your browser and was never uploaded.</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: UPLOAD & WORKSPACE STATE */}
      {!lastResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Workspace List Column (Left on desktop ~67%, Top on mobile) */}
          <div className="order-1 lg:order-1 lg:col-span-2 space-y-6">
            <Card title="Image Workspace" subtitle="Drag and drop or select images to arrange.">
              {/* Input Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => document.getElementById("img-picker")?.click()}
                className={`border-2 border-dashed rounded-[20px] p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[160px] ${
                  isDragOver 
                    ? "border-brand-primary bg-brand-primary-light/40" 
                    : "border-border-medium hover:border-brand-primary hover:bg-surface-muted/30"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
                  className="hidden"
                  id="img-picker"
                />
                <FileImage className="w-8 h-8 text-brand-primary animate-pulse" />
                <div>
                  <span className="text-base font-bold text-brand-primary font-sans block">Select Images</span>
                  <span className="text-xs text-text-muted mt-1 block">JPG, JPEG or PNG</span>
                </div>
              </div>

              {/* List */}
              {images.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center border-b border-border-light pb-2">
                    <span className="text-xs font-mono uppercase text-text-muted">Images Queue ({images.length})</span>
                    <button onClick={clearAll} className="text-xs font-mono text-status-error hover:underline cursor-pointer min-h-[36px] flex items-center">
                      Clear Workspace
                    </button>
                  </div>

                  <div className="divide-y divide-border-light max-h-[350px] overflow-y-auto pr-1">
                    {images.map((img, index) => (
                      <div key={img.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail preview */}
                          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border-medium bg-surface-muted flex items-center justify-center">
                            <img
                              src={img.dataUrl}
                              alt="preview"
                              className="max-w-full max-h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-main truncate font-sans">{img.name}</p>
                            <p className="text-xs text-text-muted font-mono">{formatBytes(img.size)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                            className="p-2 rounded-md hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveItem(index, "down")}
                            disabled={index === images.length - 1}
                            className="p-2 rounded-md hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(img.id)}
                            className="p-2 rounded-md hover:bg-status-error/10 text-text-muted hover:text-status-error cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && progressMsg && (
                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-center gap-3 mt-4">
                  <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-main">Converting Layouts</p>
                    <p className="text-xs text-text-muted mt-0.5">{progressMsg}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Settings Column (Right on desktop ~33%, Below preview on mobile) */}
          <div className="order-2 lg:order-2 lg:col-span-1 space-y-6">
            <Card title="Page Layout" subtitle="Configure page styles." collapsible>
              {/* Page Size */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-text-muted block">Page Dimensions</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "auto", label: "Auto Size" },
                    { id: "a4", label: "A4 Size" },
                    { id: "letter", label: "Letter" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPageSize(opt.id as any)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[44px] ${
                        pageSize === opt.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              {pageSize !== "auto" && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono uppercase text-text-muted block">Orientation</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "portrait", label: "Portrait" },
                      { id: "landscape", label: "Landscape" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setOrientation(opt.id as any)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[44px] ${
                          orientation === opt.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Margins */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase text-text-muted block">Page Margins</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "none", label: "None" },
                    { id: "small", label: "Small" },
                    { id: "medium", label: "Medium" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setMargin(opt.id as any)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[44px] ${
                        margin === opt.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border-light">
                <Button
                  variant="primary"
                  onClick={handleConvert}
                  loading={isProcessing}
                  disabled={images.length === 0}
                  className="w-full min-h-[48px] cursor-pointer"
                  leftIcon={<FileCheck2 className="w-5 h-5" />}
                >
                  Generate PDF ({images.length} {images.length === 1 ? "Image" : "Images"})
                </Button>
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
