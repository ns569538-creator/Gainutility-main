import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2,
  RefreshCw,
  Type,
  Image as ImageIcon,
  Grid,
  Download,
  Eye
} from "lucide-react";
import { Button, Card, StickyMobileAction } from "./Common";
import {
  ImageFileItem,
  UniversalUploadComponent,
  UniversalSettingsPanel,
  UniversalDownloadPanel,
  processRawImageFiles
} from "./ImageToolFramework";
import { ContinueEditing } from "./ContinueEditing";
import JSZip from "jszip";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface ImageWatermarkProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ImageWatermark: React.FC<ImageWatermarkProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const postDownload = usePostDownload();
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Smart Handoff mount effect
  useEffect(() => {
    if (typeof window !== "undefined" && window.__gainutility_handoff_files && window.__gainutility_handoff_files.length > 0) {
      const handoffList = window.__gainutility_handoff_files;
      window.__gainutility_handoff_files = undefined;

      const rawFileList = handoffList.map(item => item.file);
      processRawImageFiles(rawFileList, onAddToast).then(loadedItems => {
        if (loadedItems.length > 0) {
          setFiles(loadedItems);
          setSelectedIndex(0);
          onAddToast(`Smart Handoff: Loaded ${loadedItems.length} image(s) successfully!`, "success");
        }
      });
    }
  }, [onAddToast]);

  // Watermark Settings
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // Text Mode Options
  const [text, setText] = useState("© GainUtility");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontFamily, setFontFamily] = useState<"sans-serif" | "serif" | "monospace">("sans-serif");
  const [fontSizeRatio, setFontSizeRatio] = useState(4);

  // Image Mode Options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState("");

  // Common Options
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile">("bottom-right");
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState("");
  const [remainingFiles, setRemainingFiles] = useState(0);

  // Progressive disclosure: collapse settings after completion
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // Live preview canvas
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);

  const handleFilesAdded = async (rawFiles: File[]) => {
    const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
    if (loadedItems.length > 0) {
      setFiles(prev => {
        const updated = [...prev, ...loadedItems];
        if (prev.length === 0) {
          setSelectedIndex(0);
        }
        return updated;
      });
      onAddToast(`Loaded ${loadedItems.length} file(s).`, "success");
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (selectedIndex >= filtered.length) {
        setSelectedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    setSelectedIndex(0);
    setIsProcessing(false);
    setProcessingPercentage(0);
    setRemainingFiles(0);
    previewImageRef.current = null;
  };

  // ── Live Preview Rendering ──────────────────────────────────────────
  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const item = files[selectedIndex];
    if (!canvas || !item) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Scale to max 600px wide for preview
      const maxW = 600;
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Apply watermark preview
      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (watermarkType === "text") {
        const pFontSize = Math.max(8, Math.round(w * (fontSizeRatio / 100)));
        ctx.font = `${pFontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";

        const textMetrics = ctx.measureText(text);
        const textW = textMetrics.width;
        const textH = pFontSize;
        const padding = w * 0.03;

        let x = 0;
        let y = 0;

        if (position === "center") {
          x = w / 2 - textW / 2;
          y = h / 2;
        } else if (position === "top-left") {
          x = padding;
          y = padding + textH / 2;
        } else if (position === "top-right") {
          x = w - textW - padding;
          y = padding + textH / 2;
        } else if (position === "bottom-left") {
          x = padding;
          y = h - padding - textH / 2;
        } else if (position === "bottom-right") {
          x = w - textW - padding;
          y = h - padding - textH / 2;
        }

        if (position === "tile") {
          const stepX = textW * 2.5;
          const stepY = textH * 4;
          for (let tx = 0; tx < w; tx += stepX) {
            for (let ty = 0; ty < h; ty += stepY) {
              ctx.save();
              ctx.translate(tx, ty);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else {
          ctx.translate(x + textW / 2, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, -textW / 2, 0);
        }
      } else if (watermarkType === "image" && logoDataUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoW = Math.round(w * 0.15);
          const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
          const padding = w * 0.03;

          let x = 0;
          let y = 0;

          if (position === "center") {
            x = w / 2 - logoW / 2;
            y = h / 2 - logoH / 2;
          } else if (position === "top-left") {
            x = padding;
            y = padding;
          } else if (position === "top-right") {
            x = w - logoW - padding;
            y = padding;
          } else if (position === "bottom-left") {
            x = padding;
            y = h - logoH - padding;
          } else if (position === "bottom-right") {
            x = w - logoW - padding;
            y = h - logoH - padding;
          }

          if (position === "tile") {
            const stepX = logoW * 2.5;
            const stepY = logoH * 2.5;
            for (let tx = 0; tx < w; tx += stepX) {
              for (let ty = 0; ty < h; ty += stepY) {
                ctx.save();
                ctx.translate(tx + logoW / 2, ty + logoH / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
                ctx.restore();
              }
            }
          } else {
            ctx.translate(x + logoW / 2, y + logoH / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
          }
          ctx.restore();
        };
        logoImg.src = logoDataUrl;
        return;
      }

      ctx.restore();
    };
    img.src = item.originalDataUrl;
  }, [files, selectedIndex, watermarkType, text, textColor, fontFamily, fontSizeRatio, opacity, rotation, position, logoDataUrl]);

  // Re-render preview whenever settings change
  useEffect(() => {
    if (files.length > 0) {
      renderPreview();
    }
  }, [renderPreview, files.length]);

  const processImages = async () => {
    if (files.length === 0) return;
    if (watermarkType === "image" && !logoDataUrl) {
      onAddToast("Please upload a watermark logo image first!", "warning");
      return;
    }

    setIsProcessing(true);
    setProcessingPercentage(0);
    setRemainingFiles(files.length);

    try {
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        setCurrentProcessingName(item.name);
        setRemainingFiles(files.length - i);

        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isProcessing: true } : f));

        try {
          const processed = await renderWatermark(item);
          setFiles(prev => prev.map(f => f.id === item.id ? {
            ...f,
            processedSize: processed.size,
            processedWidth: processed.width,
            processedHeight: processed.height,
            processedDataUrl: processed.dataUrl,
            isProcessing: false
          } : f));
        } catch (err: any) {
          setFiles(prev => prev.map(f => f.id === item.id ? {
            ...f,
            isProcessing: false,
            error: err.message || "Failed to render watermark"
          } : f));
        }

        setProcessingPercentage(Math.round(((i + 1) / files.length) * 100));
      }

      setRemainingFiles(0);
      onAddToast("Batch watermarking completed successfully!", "success");
    } finally {
      setIsProcessing(false);
      setCurrentProcessingName("");
    }
  };

  const renderWatermark = (item: ImageFileItem): Promise<{ size: number; width: number; height: number; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize 2D context"));
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        ctx.save();
        ctx.globalAlpha = opacity / 100;

        if (watermarkType === "text") {
          const pFontSize = Math.max(12, Math.round(canvas.width * (fontSizeRatio / 100)));
          ctx.font = `${pFontSize}px ${fontFamily}`;
          ctx.fillStyle = textColor;
          ctx.textBaseline = "middle";

          const textMetrics = ctx.measureText(text);
          const textW = textMetrics.width;
          const textH = pFontSize;
          const padding = canvas.width * 0.03;

          let x = 0;
          let y = 0;

          if (position === "center") {
            x = canvas.width / 2 - textW / 2;
            y = canvas.height / 2;
          } else if (position === "top-left") {
            x = padding;
            y = padding + textH / 2;
          } else if (position === "top-right") {
            x = canvas.width - textW - padding;
            y = padding + textH / 2;
          } else if (position === "bottom-left") {
            x = padding;
            y = canvas.height - padding - textH / 2;
          } else if (position === "bottom-right") {
            x = canvas.width - textW - padding;
            y = canvas.height - padding - textH / 2;
          }

          if (position === "tile") {
            const stepX = textW * 2.5;
            const stepY = textH * 4;
            for (let tx = 0; tx < canvas.width; tx += stepX) {
              for (let ty = 0; ty < canvas.height; ty += stepY) {
                ctx.save();
                ctx.translate(tx, ty);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.fillText(text, 0, 0);
                ctx.restore();
              }
            }
          } else {
            ctx.translate(x + textW / 2, y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.fillText(text, -textW / 2, 0);
          }

        } else if (watermarkType === "image" && logoDataUrl) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoW = Math.round(canvas.width * 0.15);
            const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
            const padding = canvas.width * 0.03;

            let x = 0;
            let y = 0;

            if (position === "center") {
              x = canvas.width / 2 - logoW / 2;
              y = canvas.height / 2 - logoH / 2;
            } else if (position === "top-left") {
              x = padding;
              y = padding;
            } else if (position === "top-right") {
              x = canvas.width - logoW - padding;
              y = padding;
            } else if (position === "bottom-left") {
              x = padding;
              y = canvas.height - logoH - padding;
            } else if (position === "bottom-right") {
              x = canvas.width - logoW - padding;
              y = canvas.height - logoH - padding;
            }

            if (position === "tile") {
              const stepX = logoW * 2.5;
              const stepY = logoH * 2.5;
              for (let tx = 0; tx < canvas.width; tx += stepX) {
                for (let ty = 0; ty < canvas.height; ty += stepY) {
                  ctx.save();
                  ctx.translate(tx + logoW / 2, ty + logoH / 2);
                  ctx.rotate((rotation * Math.PI) / 180);
                  ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
                  ctx.restore();
                }
              }
            } else {
              ctx.translate(x + logoW / 2, y + logoH / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
            }

            ctx.restore();
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve({
                    size: blob.size,
                    width: canvas.width,
                    height: canvas.height,
                    dataUrl: reader.result as string
                  });
                };
                reader.readAsDataURL(blob);
              } else {
                reject(new Error("Watermark rendering failed"));
              }
            }, outputFormat, 0.9);
          };
          logoImg.onerror = () => reject(new Error("Could not load the watermark logo image"));
          logoImg.src = logoDataUrl;
          return;
        }

        ctx.restore();
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas blob extraction failure"));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                size: blob.size,
                width: canvas.width,
                height: canvas.height,
                dataUrl: reader.result as string
              });
            };
            reader.readAsDataURL(blob);
          },
          outputFormat,
          0.9
        );
      };
      img.onerror = () => reject(new Error("Loading parent image file failed."));
      img.src = item.originalDataUrl;
    });
  };

  const handleDownloadSingle = () => {
    const item = files[selectedIndex];
    if (!item || !item.processedDataUrl) return;

    const link = document.createElement("a");
    const ext = outputFormat.split("/")[1];
    link.href = item.processedDataUrl;
    link.download = item.name.replace(/\.[^/.]+$/, "") + `_watermarked.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    onAddToast("Watermarked image downloaded!", "success");
    postDownload.show("Image Watermark");
  };

  const handleDownloadZip = async () => {
    const processedFiles = files.filter(f => f.processedDataUrl);
    if (processedFiles.length === 0) return;

    const zip = new JSZip();
    const ext = outputFormat.split("/")[1];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      if (item.processedDataUrl) {
        const base64Data = item.processedDataUrl.split(",")[1];
        zip.file(item.name.replace(/\.[^/.]+$/, "") + `_watermarked.${ext}`, base64Data, { base64: true });
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "gainutility_watermarked_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      onAddToast("Batch watermarked ZIP compiled!", "success");
    } catch (err) {
      onAddToast("ZIP compiler failure.", "error");
    }
  };

  const selectedItem = files[selectedIndex];
  const hasProcessedFiles = files.some(f => f.processedDataUrl);
  const isEditing = files.length > 0 && !hasProcessedFiles;

  // Collapse settings when processing completes
  useEffect(() => {
    if (hasProcessedFiles && !isProcessing) {
      setSettingsExpanded(false);
    }
  }, [hasProcessedFiles, isProcessing]);

  return (
    <div className="py-6 md:py-10 space-y-6">
      {files.length === 0 ? (
        <UniversalUploadComponent
          accept="image/*"
          supportedFormats="JPG, PNG, WEBP"
          onFilesAdded={handleFilesAdded}
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Left: Live Preview */}
          <div className="xl:col-span-8 space-y-4">
            <Card
              title="Add Watermark"
              subtitle="Preview updates as you adjust settings"
              actions={
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => document.getElementById("wm-replace-input")?.click()}
                    className="px-2.5 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Replace
                  </button>
                  <input
                    id="wm-replace-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFilesAdded([e.target.files[0]]);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                </div>
              }
            >
              {/* File list */}
              {files.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                  {files.map((f, idx) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                        idx === selectedIndex
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-muted border-border-light text-text-sub hover:border-brand-primary/50"
                      }`}
                    >
                      {f.name}
                      {f.processedDataUrl && <span className="text-[10px] opacity-70">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Preview Canvas */}
              <div className="relative border border-border-light rounded-2xl overflow-hidden bg-[#121410] flex items-center justify-center min-h-[300px] md:min-h-[400px] max-h-[520px]">
                {isEditing ? (
                  <div className="p-4 flex items-center justify-center max-w-full">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full max-h-[440px] rounded-md block"
                      style={{ imageRendering: "auto" }}
                    />
                  </div>
                ) : hasProcessedFiles && selectedItem?.processedDataUrl ? (
                  <div className="p-4 flex items-center justify-center max-w-full">
                    <img
                      src={selectedItem.processedDataUrl}
                      alt="Watermarked result"
                      className="max-w-full max-h-[440px] object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white p-8">
                    <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                    <span className="text-xs font-mono">Processing watermark...</span>
                  </div>
                )}

                {/* Preview label */}
                {isEditing && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded-md">
                    <Eye className="w-3 h-3" />
                    Live Preview
                  </div>
                )}
              </div>
            </Card>

            {/* Download panel */}
            {hasProcessedFiles && !isProcessing && (
              <UniversalDownloadPanel
                files={files}
                onDownloadSingle={handleDownloadSingle}
                onDownloadZip={handleDownloadZip}
                onClearAll={() => setFiles([])}
                onAddToast={onAddToast}
                outputType={`Watermarked ${outputFormat.split("/")[1].toUpperCase()}`}
                zipLabel="Download Batch ZIP"
                clearLabel="Watermark another"
              />
            )}

            {hasProcessedFiles && (
              <ContinueEditing
                currentToolId="image-watermark"
                files={files}
                onAddToast={onAddToast}
                onChangeView={onChangeView}
              />
            )}
          </div>

          {/* Right: Controls */}
          <div className="xl:col-span-4">
            <UniversalSettingsPanel
              title="Watermark Settings"
              subtitle="Configure your watermark"
              collapsible={hasProcessedFiles && !isProcessing}
              collapsed={!settingsExpanded && hasProcessedFiles && !isProcessing}
              onToggleCollapse={() => setSettingsExpanded(prev => !prev)}
            >
              <div className="space-y-4">
                {/* Watermark type toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
                      { id: "image", label: "Logo", icon: <ImageIcon className="w-4 h-4" /> }
                    ].map(wt => (
                      <button
                        key={wt.id}
                        onClick={() => setWatermarkType(wt.id as any)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          watermarkType === wt.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-base hover:bg-surface-muted border-border-light text-text-main"
                        }`}
                      >
                        {wt.icon}
                        {wt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text options */}
                {watermarkType === "text" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-sub">Watermark Text</label>
                      <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-muted border border-border-light text-text-main rounded-xl outline-none focus:border-brand-primary text-sm font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-text-sub">Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                          className="w-full h-9 cursor-pointer rounded-lg border border-border-light"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-text-sub">Font</label>
                        <select
                          value={fontFamily}
                          onChange={e => setFontFamily(e.target.value as any)}
                          className="w-full h-9 bg-surface-muted text-xs border border-border-light rounded-lg px-2 outline-none focus:border-brand-primary"
                        >
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-text-sub">
                        <span>Font Size</span>
                        <span>{fontSizeRatio}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={fontSizeRatio}
                        onChange={e => setFontSizeRatio(parseInt(e.target.value))}
                        className="w-full accent-brand-primary h-1.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Logo File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onload = (e) => setLogoDataUrl(e.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-text-muted font-mono file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-primary-light file:text-brand-primary hover:file:bg-brand-primary/20 file:cursor-pointer"
                    />
                    {logoDataUrl && (
                      <div className="mt-2 p-2 bg-surface-muted rounded-lg border border-border-light">
                        <img src={logoDataUrl} alt="Logo preview" className="max-h-16 mx-auto opacity-80" />
                      </div>
                    )}
                  </div>
                )}

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-text-sub">
                    <span>Opacity</span>
                    <span>{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={e => setOpacity(parseInt(e.target.value))}
                    className="w-full accent-brand-primary h-1.5"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-text-sub">
                    <span>Rotation</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value))}
                    className="w-full accent-brand-primary h-1.5"
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Position</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "top-left", label: "TL" },
                      { id: "top-right", label: "TR" },
                      { id: "center", label: "C" },
                      { id: "bottom-left", label: "BL" },
                      { id: "bottom-right", label: "BR" },
                      { id: "tile", label: "Tile" },
                    ].map(pos => (
                      <button
                        key={pos.id}
                        onClick={() => setPosition(pos.id as any)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg border text-center transition-all ${
                          position === pos.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-muted border-border-light text-text-sub hover:border-brand-primary/50"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output format */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-sub uppercase">Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e: any) => setOutputFormat(e.target.value)}
                    className="w-full bg-surface-muted border border-border-light text-text-main font-semibold text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-primary"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>

                <Button
                  onClick={processImages}
                  disabled={isProcessing}
                  className="w-full justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  {isProcessing ? "Watermarking..." : "Apply Watermark"}
                </Button>
              </div>
            </UniversalSettingsPanel>
          </div>

        </div>
      )}

      {/* Mobile sticky download bar */}
      <StickyMobileAction visible={hasProcessedFiles}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">
              {files[selectedIndex] &&
              files[selectedIndex].originalSize &&
              files[selectedIndex].processedSize
                ? `${formatBytes(files[selectedIndex].originalSize)} → ${formatBytes(files[selectedIndex].processedSize)}`
                : "Ready to download"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              handleDownloadSingle();
            }}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-sm transition-all duration-200 shadow-premium-sm active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </StickyMobileAction>

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};
