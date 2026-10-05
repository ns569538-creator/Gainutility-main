import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Percent, 
  FileDown, 
  Lock, 
  Unlock,
  Layers, 
  Zap, 
  ShieldCheck, 
  Maximize2,
  Trash2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  Maximize,
  Download,
  Target
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

interface ImageResizerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ImageResizer: React.FC<ImageResizerProps> = ({
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
  
  // Settings
  const [resizeType, setResizeType] = useState<"pixels" | "percentage" | "target-size">("pixels");
  const [percentageValue, setPercentageValue] = useState(50); // 10-200
  const [customWidth, setCustomWidth] = useState<number | "">("");
  const [customHeight, setCustomHeight] = useState<number | "">("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [targetSizeKB, setTargetSizeKB] = useState<number | "">(100); // Target size in KB

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState("");
  const [remainingFiles, setRemainingFiles] = useState(0);

  // Progressive disclosure: collapse settings after completion
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // Sync dimensions when a different file is selected or aspect ratio changes
  useEffect(() => {
    const item = files[selectedIndex];
    if (item) {
      if (customWidth === "" || customWidth === 0) {
        setCustomWidth(item.originalWidth);
      }
      if (customHeight === "" || customHeight === 0) {
        setCustomHeight(item.originalHeight);
      }
    }
  }, [selectedIndex, files]);

  const handleWidthChange = (val: number | "") => {
    setCustomWidth(val);
    const item = files[selectedIndex];
    if (lockAspectRatio && item && val !== "" && val > 0) {
      const scale = val / item.originalWidth;
      setCustomHeight(Math.round(item.originalHeight * scale));
    }
  };

  const handleHeightChange = (val: number | "") => {
    setCustomHeight(val);
    const item = files[selectedIndex];
    if (lockAspectRatio && item && val !== "" && val > 0) {
      const scale = val / item.originalHeight;
      setCustomWidth(Math.round(item.originalWidth * scale));
    }
  };

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
      onAddToast(`Loaded ${loadedItems.length} image(s).`, "success");
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

        // Update item to processing
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isProcessing: true } : f));

        try {
          const processed = await resizeSingleImage(item);
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
            error: err.message || "Failed to resize"
          } : f));
        }

        setProcessingPercentage(Math.round(((i + 1) / files.length) * 100));
      }

      setRemainingFiles(0);
      onAddToast("Batch resizing completed successfully!", "success");
    } finally {
      // Always release the processing state so downloads become available.
      setIsProcessing(false);
      setCurrentProcessingName("");
    }
  };

  const resizeSingleImage = (item: ImageFileItem): Promise<{ size: number; width: number; height: number; dataUrl: string; qualityUsed?: number; targetStatus?: "Target Achieved" | "Closest Possible" }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize 2D canvas context"));
          return;
        }

        // Calculate targets
        let targetW = item.originalWidth;
        let targetH = item.originalHeight;

        if (resizeType === "percentage") {
          const factor = percentageValue / 100;
          targetW = Math.round(item.originalWidth * factor);
          targetH = Math.round(item.originalHeight * factor);
        } else if (resizeType === "target-size") {
          // Target size mode: keep original dimensions, adjust quality
          targetW = item.originalWidth;
          targetH = item.originalHeight;
        } else {
          // Pixels mode
          targetW = customWidth === "" ? item.originalWidth : Number(customWidth);
          targetH = customHeight === "" ? item.originalHeight : Number(customHeight);
          
          if (lockAspectRatio) {
            if (customWidth !== "" && customWidth > 0) {
              const scale = Number(customWidth) / item.originalWidth;
              targetH = Math.round(item.originalHeight * scale);
            } else if (customHeight !== "" && customHeight > 0) {
              const scale = Number(customHeight) / item.originalHeight;
              targetW = Math.round(item.originalWidth * scale);
            }
          }
        }

        // Prevent zero sizing
        canvas.width = Math.max(1, targetW);
        canvas.height = Math.max(1, targetH);

        // Render to canvas (uses high fidelity image scaling)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const targetBytes = resizeType === "target-size" && targetSizeKB !== "" ? Number(targetSizeKB) * 1024 : null;
        
        const compressToTarget = (quality: number): Promise<{ size: number; width: number; height: number; dataUrl: string; qualityUsed: number; targetStatus?: "Target Achieved" | "Closest Possible" }> => {
          return new Promise((res, rej) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  rej(new Error("Resizer canvas blob failed"));
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  res({
                    size: blob.size,
                    width: canvas.width,
                    height: canvas.height,
                    dataUrl: reader.result as string,
                    qualityUsed: quality
                  });
                };
                reader.readAsDataURL(blob);
              },
              outputFormat,
              quality
            );
          });
        };

        if (targetBytes && outputFormat === "image/jpeg") {
          // Binary search for quality to hit target size
          let low = 0.05;
          let high = 0.95;
          let bestQuality = 0.90;
          let bestBlob: { size: number; width: number; height: number; dataUrl: string; qualityUsed: number } | null = null;
          let iterations = 0;
          
          const attempt = async (q: number) => {
            const result = await compressToTarget(q);
            return result;
          };

          const search = async () => {
            while (high - low > 0.01 && iterations < 15) {
              const mid = (low + high) / 2;
              const result = await attempt(mid);
              iterations++;
              
              if (result.size <= targetBytes) {
                bestQuality = mid;
                bestBlob = result;
                low = mid;
              } else {
                high = mid;
              }
            }
            
            if (bestBlob) {
              // Check if we achieved target or got closest possible
              const status = bestBlob.size <= targetBytes ? "Target Achieved" : "Closest Possible";
              resolve({ ...bestBlob, targetStatus: status });
            } else {
              // Fallback to minimum quality
              const result = await attempt(0.05);
              resolve({ ...result, targetStatus: "Closest Possible" });
            }
          };
          
          search();
        } else {
          // Standard single-pass for non-target modes or non-JPEG
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Resizer canvas blob failed"));
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  size: blob.size,
                  width: canvas.width,
                  height: canvas.height,
                  dataUrl: reader.result as string,
                  qualityUsed: 0.90
                });
              };
              reader.readAsDataURL(blob);
            },
            outputFormat,
            0.90
          );
        }
      };
      img.onerror = () => reject(new Error("Failed to load source image onto resizer canvas"));
      img.src = item.originalDataUrl;
    });
  };

  const handleDownloadSingle = () => {
    const item = files[selectedIndex];
    if (!item || !item.processedDataUrl) return;

    const link = document.createElement("a");
    const ext = outputFormat.split("/")[1];
    link.href = item.processedDataUrl;
    link.download = item.name.replace(/\.[^/.]+$/, "") + `_resized.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    postDownload.show("Image Resizer");
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
        zip.file(item.name.replace(/\.[^/.]+$/, "") + `_resized.${ext}`, base64Data, { base64: true });
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "gainutility_resized_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      onAddToast("Batch resized ZIP package compiled!", "success");
      postDownload.show("Image Resizer");
    } catch (err) {
      onAddToast("Failed to compile ZIP package.", "error");
    }
  };

  // Structured Information Section content
  const features = [
    {
      title: "Aspect Lock Mode",
      desc: "Maintain correct mathematical proportions with one-click aspect ratio constraining.",
      icon: <Maximize className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Batch Scale Queue",
      desc: "Set unified sizes for large photo albums or folders, completely locally.",
      icon: <Layers className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Percentage Scaling",
      desc: "Fast scale by standard factors (25%, 50%, 75%, 200%) using comfortable sliding controls.",
      icon: <Percent className="w-5 h-5 text-brand-primary" />
    }
  ];

  const howItWorks = [
    "Drop, drag, or select your target image assets inside the upload sandbox.",
    "Toggle between resizing by raw Pixels or relative Percentage multiplier.",
    "Select output formats and optional Aspect Locking configurations.",
    "Click the Resize Images trigger to instantly download outputs or compile a ZIP."
  ];

  const faqs = [
    {
      question: "How does aspect ratio locking work?",
      answer: "When enabled, modifying either the Width or the Height field automatically recalculates the opposite dimension to match the original proportions. This prevents your photos from stretching or distorting."
    },
    {
      question: "Can I upscale images to higher dimensions?",
      answer: "Yes, you can scale images up to 200%. However, upscaling a raster image beyond its native resolution can cause some visible blurriness."
    },
    {
      question: "Which formats are supported for output?",
      answer: "You can convert your resized outputs directly into standard JPG, lossless PNG, or highly-optimized WEBP files."
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
              toolId="image-resizer"
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
                outputType={outputFormat.split("/")[1].toUpperCase()}
                zipLabel="Download Batch ZIP"
                clearLabel="Resize another"
              />
            )}
          </div>
          <div className="xl:col-span-4 space-y-6">
            <UniversalSettingsPanel
              title="Resize Configurations"
              subtitle="Maintain pixel or percentage dimensions"
              collapsible={hasProcessedFiles && !isProcessing}
              collapsed={!settingsExpanded && hasProcessedFiles && !isProcessing}
              onToggleCollapse={() => setSettingsExpanded(prev => !prev)}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Resize Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pixels", label: "By Pixels", icon: <Maximize className="w-4 h-4" /> },
                      { id: "percentage", label: "By Percentage", icon: <Percent className="w-4 h-4" /> },
                      { id: "target-size", label: "Target Size (KB)", icon: <Target className="w-4 h-4" /> }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setResizeType(t.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          resizeType === t.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-base hover:bg-surface-muted border-border-light text-text-main"
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {resizeType === "percentage" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-muted">Scale multiplier ({percentageValue}%)</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={percentageValue}
                      onChange={e => setPercentageValue(parseInt(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                  </div>
                ) : resizeType === "target-size" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-sub">Target Size (KB)</label>
                      <input
                        type="number"
                        value={targetSizeKB}
                        onChange={e => setTargetSizeKB(e.target.value === "" ? "" : parseInt(e.target.value))}
                        min="1"
                        max="100000"
                        className="w-full px-3 py-2 bg-surface-muted border border-border-light text-text-main rounded-xl outline-none focus:border-brand-primary font-mono text-sm"
                        placeholder="e.g. 100"
                      />
                      <p className="text-[11px] text-text-muted">JPEG only. The tool will adjust quality to hit the target. Result may be slightly above/below target.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-text-sub">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={e => handleWidthChange(e.target.value === "" ? "" : parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-surface-muted border border-border-light text-text-main rounded-xl outline-none focus:border-brand-primary font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-text-sub">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={e => handleHeightChange(e.target.value === "" ? "" : parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-surface-muted border border-border-light text-text-main rounded-xl outline-none focus:border-brand-primary font-mono text-sm"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-text-sub cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={e => setLockAspectRatio(e.target.checked)}
                        className="accent-brand-primary rounded"
                      />
                      Lock Aspect Ratio
                    </label>
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
                  variant="primary"
                  size="lg"
                  onClick={processImages}
                  disabled={isProcessing}
                  loading={isProcessing}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                  className="w-full justify-center"
                >
                  Resize Images Now
                </Button>
              </div>
            </UniversalSettingsPanel>
          </div>
        </div>
      )}

      {/* Related tools — strictly after the download action, never before it. */}
      {hasProcessedFiles && !isProcessing && (
        <ContinueEditing
          currentToolId="image-resizer"
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
                ? (() => {
                    const orig = files[selectedIndex].originalSize;
                    const proc = files[selectedIndex].processedSize;
                    const diff = orig - proc;
                    const pct = diff !== 0 ? Math.round((diff / orig) * 100) : 0;
                    const delta = pct > 0
                      ? `${pct}% saved`
                      : pct < 0
                        ? `${Math.abs(pct)}% larger`
                        : "no size change";
                    return `${formatBytes(orig)} → ${formatBytes(proc)} (${delta})`;
                  })()
                : "Ready to download"}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadSingle}
            leftIcon={<Download className="w-5 h-5" />}
            className="shrink-0 whitespace-nowrap min-h-[44px]"
          >
            Download
          </Button>
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
