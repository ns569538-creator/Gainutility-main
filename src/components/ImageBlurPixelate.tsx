import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Trash2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  EyeOff,
  Sparkles,
  Download
} from "lucide-react";
import { Button, Card, Breadcrumbs, StickyMobileAction } from "./Common";
import { 
  ImageFileItem, 
  UniversalUploadComponent, 
  UniversalPreviewComponent, 
  UniversalSettingsPanel, 
  UniversalProcessingPanel, 
  UniversalDownloadPanel,
  processRawImageFiles
} from "./ImageToolFramework";
import { ContinueEditing } from "./ContinueEditing";
import JSZip from "jszip";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface ImageBlurPixelateProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ImageBlurPixelate: React.FC<ImageBlurPixelateProps> = ({
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
      window.__gainutility_handoff_files = undefined; // consume immediately

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
  
  // Treatment options
  const [effectType, setEffectType] = useState<"blur" | "pixelate">("blur");
  const [blurRadius, setBlurRadius] = useState(15); // 1-40
  const [pixelSize, setPixelSize] = useState(12); // 2-30
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState("");
  const [remainingFiles, setRemainingFiles] = useState(0);

  // Progressive disclosure: collapse settings after completion
  const [settingsExpanded, setSettingsExpanded] = useState(true);

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
      onAddToast(`Loaded ${loadedItems.length} file(s) into queue.`, "success");
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
  };

  const processImages = async () => {
    if (files.length === 0) return;
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
          const processed = await renderEffect(item);
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
            error: err.message || "Failed to render effect"
          } : f));
        }

        setProcessingPercentage(Math.round(((i + 1) / files.length) * 100));
      }

      setRemainingFiles(0);
      onAddToast("Batch rendering completed successfully!", "success");
    } finally {
      // Always release the processing state so downloads become available.
      setIsProcessing(false);
      setCurrentProcessingName("");
    }
  };

  const renderEffect = (item: ImageFileItem): Promise<{ size: number; width: number; height: number; dataUrl: string }> => {
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

        if (effectType === "blur") {
          // Render HTML5 GPU Gaussian filter blur
          ctx.filter = `blur(${blurRadius}px)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else if (effectType === "pixelate") {
          // Pixelation requires drawing small, disabling filtering, and stretching back!
          // Disable smooth rendering filters
          ctx.imageSmoothingEnabled = false;
          (ctx as any).mozImageSmoothingEnabled = false;
          (ctx as any).webkitImageSmoothingEnabled = false;
          (ctx as any).msImageSmoothingEnabled = false;

          const scale = 1 / pixelSize;
          const tempW = Math.max(1, Math.round(canvas.width * scale));
          const tempH = Math.max(1, Math.round(canvas.height * scale));

          // Step 1: Draw downscaled
          ctx.drawImage(img, 0, 0, tempW, tempH);
          
          // Step 2: Draw upscaled over
          ctx.drawImage(canvas, 0, 0, tempW, tempH, 0, 0, canvas.width, canvas.height);
        }

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
          0.90
        );
      };
      img.onerror = () => reject(new Error("Loading parent photo file failed."));
      img.src = item.originalDataUrl;
    });
  };

  const handleDownloadSingle = () => {
    const item = files[selectedIndex];
    if (!item || !item.processedDataUrl) return;

    const link = document.createElement("a");
    const ext = outputFormat.split("/")[1];
    link.href = item.processedDataUrl;
    link.download = item.name.replace(/\.[^/.]+$/, "") + `_censored.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    postDownload.show("Image Blur & Pixelate");
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
        zip.file(item.name.replace(/\.[^/.]+$/, "") + `_censored.${ext}`, base64Data, { base64: true });
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "gainutility_censored_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      onAddToast("Batch processed ZIP archive compiled!", "success");
    } catch (err) {
      onAddToast("Failed to compile ZIP archive.", "error");
    }
  };

  const features = [
    {
      title: "Secure Redaction Blur",
      desc: "Safeguard user privacy by applying thick Gaussian Blur filters to face cards or licenses.",
      icon: <EyeOff className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Batch Treatment",
      desc: "Apply redaction pixels uniformly to large datasets in one click. Fully local.",
      icon: <Layers className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Focal Custom Presets",
      desc: "Sliders give you exact coordinates to adjust blur radiuses or pixel blocks precisely.",
      icon: <Sliders className="w-5 h-5 text-brand-primary" />
    }
  ];

  const howItWorks = [
    "Select, drag, or drop your target image assets inside the safe upload sandbox.",
    "Toggle between Gaussian Blur (smooth) or Pixelation (mosaic block patterns).",
    "Slide factor radiuses and choose export target format properties.",
    "Click Render Effects, inspect before/after comparisons, and download your file or ZIP."
  ];

  const faqs = [
    {
      question: "Can blurred or pixelated images be reversed?",
      answer: "No. Unlike text blackouts, rendering low-scale pixel grids or heavy Gaussian filters structurally destroys high-frequency details. There are no algorithms to recover the original faces or numbers once saved."
    },
    {
      question: "Are my files private during pixelation?",
      answer: "Yes. Every render matrix computes strictly on your hardware inside your browser sandbox container. No data is sent to external servers."
    }
  ];

  const hasProcessedFiles = files.some(f => f.processedDataUrl);

  // Collapse settings when processing completes
  useEffect(() => {
    if (hasProcessedFiles && !isProcessing) {
      setSettingsExpanded(false);
    }
  }, [hasProcessedFiles, isProcessing]);

    return (
    <div className="py-6 md:py-10 space-y-10">
      {files.length === 0 ? (
        <UniversalUploadComponent
          accept="image/*"
          supportedFormats="JPG, PNG, WEBP"
          onFilesAdded={handleFilesAdded}
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 space-y-6">
            <UniversalPreviewComponent
              files={files}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              onRemoveFile={handleRemoveFile}
              onFileReplaced={(idx, newItem) => {
                setFiles(prev => {
                  const next = [...prev];
                  next[idx] = newItem;
                  return next;
                });
              }}
              onAddFiles={handleFilesAdded}
              onClearAll={handleClearAll}
              toolId="image-blur-pixelate"
            />
            <UniversalProcessingPanel
              isProcessing={isProcessing}
              percentage={processingPercentage}
              currentFileName={currentProcessingName}
              remainingCount={remainingFiles}
              totalCount={files.length}
            />
            {hasProcessedFiles && !isProcessing && (
              <UniversalDownloadPanel
                files={files}
                onDownloadSingle={handleDownloadSingle}
                onDownloadZip={handleDownloadZip}
                onClearAll={handleClearAll}
                onAddToast={onAddToast}
                outputType={`Redacted ${outputFormat.split("/")[1].toUpperCase()}`}
                zipLabel="Download Batch ZIP"
                clearLabel="Process another"
              />
            )}
          </div>
          <div className="xl:col-span-4 space-y-6">
            <UniversalSettingsPanel
              title="Redaction Options"
              subtitle="Configure privacy mask effects"
              collapsible={hasProcessedFiles && !isProcessing}
              collapsed={!settingsExpanded && hasProcessedFiles && !isProcessing}
              onToggleCollapse={() => setSettingsExpanded(prev => !prev)}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Effect Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "blur", label: "Gaussian Blur" },
                      { id: "pixelate", label: "Mosaic Pixel" }
                    ].map(eff => (
                      <button
                        key={eff.id}
                        onClick={() => setEffectType(eff.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          effectType === eff.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-base hover:bg-surface-muted border-border-light text-text-main"
                        }`}
                      >
                        {eff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {effectType === "blur" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-muted">Blur Radius ({blurRadius}px)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={blurRadius}
                      onChange={e => setBlurRadius(parseInt(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-muted">Pixel Dimensions ({pixelSize}px)</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={pixelSize}
                      onChange={e => setPixelSize(parseInt(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">Output Format</label>
                  <select
                    value={outputFormat}
                    onChange={e => setOutputFormat(e.target.value as any)}
                    className="w-full bg-surface-muted border border-border-light text-text-main font-semibold text-xs px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </div>

                <Button
                  onClick={processImages}
                  disabled={isProcessing}
                  className="w-full justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  {isProcessing ? "Rendering..." : "Apply Redaction Effects"}
                </Button>
              </div>
            </UniversalSettingsPanel>
          </div>
        </div>
      )}

      {/* Related tools — strictly after the download action, never before it. */}
      {hasProcessedFiles && !isProcessing && (
        <ContinueEditing
          currentToolId="image-blur-pixelate"
          files={files}
          onChangeView={onChangeView}
          onAddToast={onAddToast}
        />
      )}

      {/* Mobile sticky download bar */}
      <StickyMobileAction visible={hasProcessedFiles && !isProcessing}>
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
            onClick={handleDownloadSingle}
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
