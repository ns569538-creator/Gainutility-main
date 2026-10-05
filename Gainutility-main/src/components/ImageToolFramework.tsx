/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FileUp, 
  FileImage, 
  Trash2, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  FolderArchive, 
  FileText, 
  Sparkles,
  Info,
  Check,
  Sliders,
  ChevronDown
} from "lucide-react";
import { Button, Card } from "./Common";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

// --- FILE METADATA TYPE ---
export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  
  // Processing outcomes
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  processedDataUrl?: string;
  isProcessing: boolean;
  error?: string;
  
  // Target Size mode outcomes
  qualityUsed?: number;
  targetSizeText?: string;
  targetStatus?: "Target Achieved" | "Closest Possible";
}

// ----------------------------------------------------
// HELPER: ROBUST IMAGE INGESTION WITH HEIC & ERROR HANDLING
// ----------------------------------------------------
export async function processRawImageFiles(
  rawFiles: File[],
  onToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void
): Promise<ImageFileItem[]> {
  const isImageFile = (file: File) => {
    if (file.type && file.type.startsWith("image/")) return true;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "webp", "avif", "gif", "bmp", "svg", "heic", "heif", "tiff", "tif", "ico"].includes(ext);
  };

  const validFiles = rawFiles.filter(isImageFile);
  if (validFiles.length === 0) {
    if (onToast) {
      onToast("Please upload valid image files (JPG, PNG, WEBP, AVIF, or HEIC)!", "error");
    }
    return [];
  }

  const items: ImageFileItem[] = [];
  let heicNoticeGiven = false;

  for (const file of validFiles) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isHeic = ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif";

    let workingBlob: Blob = file;
    if (isHeic && typeof window !== "undefined") {
      if ((window as any).heic2any) {
        try {
          const converted = await (window as any).heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
          workingBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch (e) {
          console.warn("heic2any direct decode failed:", e);
        }
      } else if (!heicNoticeGiven && onToast) {
        onToast("Tip: For best HEIC compatibility, you can also use our HEIC to JPG Converter.", "info");
        heicNoticeGiven = true;
      }
    }

    try {
      const item = await new Promise<ImageFileItem>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onerror = () => {
            if (isHeic) {
              reject(new Error(`HEIC image "${file.name}" requires conversion first. Please use our HEIC to JPG Converter.`));
            } else {
              reject(new Error(`Could not decode "${file.name}". Please ensure it is a valid image.`));
            }
          };
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              file,
              name: file.name,
              originalSize: file.size,
              originalWidth: img.naturalWidth || 800,
              originalHeight: img.naturalHeight || 600,
              originalDataUrl: dataUrl,
              isProcessing: false
            });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(workingBlob);
      });
      items.push(item);
    } catch (err: any) {
      console.error("Image loading error:", err);
      if (onToast) {
        onToast(err.message || `Failed to load "${file.name}".`, "error");
      }
    }
  }

  return items;
}

// ----------------------------------------------------
// 1. UNIVERSAL UPLOAD COMPONENT
// ----------------------------------------------------
interface UniversalUploadProps {
  onFilesAdded: (files: File[]) => void;
  accept: string;
  supportedFormats: string;
  maxSizeText?: string;
  filesCount: number;
  onClearAll: () => void;
}

export const UniversalUploadComponent: React.FC<UniversalUploadProps> = ({
  onFilesAdded,
  accept,
  supportedFormats,
  maxSizeText = "50MB",
  filesCount,
  onClearAll
}) => {
  const locale = useLocale();
  const inputId = React.useId();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isWindowDragActive, setIsWindowDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste handling
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        onFilesAdded(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onFilesAdded]);

  // Window-wide drag overlay detection
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsWindowDragActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsWindowDragActive(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragActive(false);
      dragCounter = 0;
      
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const fileList: File[] = [];
        for (let i = 0; i < droppedFiles.length; i++) {
          fileList.push(droppedFiles[i]);
        }
        onFilesAdded(fileList);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onFilesAdded]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDropLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileList: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        fileList.push(e.dataTransfer.files[i]);
      }
      onFilesAdded(fileList);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        fileList.push(e.target.files[i]);
      }
      onFilesAdded(fileList);
    }
    // Crucial for iOS Safari same-file re-selection and retry
    e.target.value = "";
  };

  return (
    <div className="relative w-full">
      {/* 1. Global drag overlay */}
      <AnimatePresence>
        {isWindowDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-primary/95 dark:bg-[#151A0D]/95 z-50 flex flex-col items-center justify-center p-6 border-4 border-dashed border-[#FAF8F1]"
          >
            <div className="p-8 bg-[#FAF8F1] dark:bg-surface-base text-brand-primary rounded-full animate-bounce shadow-premium-lg">
              <FileUp className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-sans font-bold text-[#FAF8F1] mt-8 text-center">
              {t("dropAnywhereTitle", locale)}
            </h2>
            <p className="text-lg text-[#FAF8F1]/80 mt-2 text-center max-w-md">
              {t("dropAnywhereBody", locale)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive upload block - Accessible Label avoids iOS Safari duplicate click events */}
      <label
        htmlFor={inputId}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDropLocal}
        className={`relative block border-2 border-dashed rounded-[24px] p-4 sm:p-8 md:p-10 flex flex-col items-center justify-center gap-3 sm:gap-6 text-center transition-all cursor-pointer min-h-[150px] sm:min-h-[200px] md:min-h-[230px] bg-surface-base shadow-premium-sm focus-within:ring-2 focus-within:ring-brand-primary ${
          isDragActive 
            ? "border-brand-primary bg-brand-primary-light/30" 
            : "border-border-input hover:border-brand-primary hover:bg-surface-muted/15"
        }`}
      >
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInputChange}
          className="sr-only"
          tabIndex={0}
          aria-label={t("uploadFiles", locale)}
        />

        <div className="p-3 sm:p-5 bg-brand-primary/10 rounded-full text-brand-primary pointer-events-none">
          <FileUp className="w-6 h-6 sm:w-9 sm:h-9" />
        </div>

        <div className="pointer-events-none">
          <h3 className="text-[15px] sm:text-xl font-sans font-bold text-text-main">
            Drag & Drop or <span className="text-brand-primary underline">{t("clickToBrowse", locale)}</span>
          </h3>
          <p className="text-[13px] sm:text-[15px] text-text-muted mt-1 sm:mt-1.5 max-w-md leading-relaxed mx-auto">
            {tf("supportedFormatsPaste", locale, { formats: supportedFormats })}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pointer-events-none">
          <span className="text-xs px-4 py-2 rounded-full bg-surface-muted text-text-muted border border-border-subtle font-mono">
            {tf("maxFileSize", locale, { size: maxSizeText })}
          </span>
          <span className="text-xs px-4 py-2 rounded-full bg-brand-secondary-light text-brand-secondary-hover border border-brand-secondary/20 font-bold font-mono">
            {t("clientSideProcessing100", locale)}
          </span>
        </div>

        {filesCount > 0 && (
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-brand-primary-light text-brand-primary font-mono text-xs font-bold border border-brand-primary/10" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <span>{tf("filesLoaded", locale, { count: String(filesCount) })}</span>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClearAll();
              }} 
              className="p-1 hover:bg-brand-primary/10 rounded-full text-brand-primary/80 hover:text-brand-primary transition-colors cursor-pointer"
              title={t("clearUploaded", locale)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </label>
    </div>
  );
};


// ----------------------------------------------------
// 2. UNIVERSAL PREVIEW COMPONENT
// ----------------------------------------------------
interface UniversalPreviewProps {
  files: ImageFileItem[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  onRemoveFile: (idx: number) => void;
  onFileReplaced?: (index: number, item: ImageFileItem) => void;
  onAddFiles?: (files: File[]) => void;
  onClearAll?: () => void;
  toolId?: string;
  accept?: string;
}

export const UniversalPreviewComponent: React.FC<UniversalPreviewProps> = ({
  files,
  selectedIndex,
  onSelectIndex,
  onRemoveFile,
  onFileReplaced,
  onAddFiles,
  onClearAll,
  toolId,
  accept
}) => {
  const locale = useLocale();
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50); // 0-100 percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplitRef = useRef(false);

  const selectedItem = files[selectedIndex];
  if (!selectedItem) return null;

  const showComparison = selectedItem.processedDataUrl && !selectedItem.isProcessing;

  // Visual difference tools use the slider. All conversion/format/dimension tools use side-by-side cards.
  const isVisualTool = !toolId || 
    toolId === "image-blur-pixelate" || 
    toolId === "image-watermark";

  const handleMouseDownSplit = () => {
    isDraggingSplitRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setCompareSplit(percentage);
    };

    const handleMouseUp = () => {
      isDraggingSplitRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getPercentageSavings = () => {
    if (!selectedItem.processedSize) return 0;
    const diff = selectedItem.originalSize - selectedItem.processedSize;
    return Math.round((diff / selectedItem.originalSize) * 100);
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileReplaced) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onerror = () => {
        console.error("Failed to read replacement file");
      };
      reader.onload = (readerEvent) => {
        const dataUrl = readerEvent.target?.result as string;
        const img = new Image();
        img.onerror = () => {
          console.error("Failed to decode replacement image");
        };
        img.onload = () => {
          const newItem: ImageFileItem = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            originalSize: file.size,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            originalDataUrl: dataUrl,
            isProcessing: false
          };
          onFileReplaced(selectedIndex, newItem);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAddFiles) {
      const fileList: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        fileList.push(e.target.files[i]);
      }
      onAddFiles(fileList);
    }
    e.target.value = "";
  };

  // Clipboard paste inside UniversalPreviewComponent
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0 && onAddFiles) {
        onAddFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onAddFiles]);

  return (
    <div className="space-y-4">
      {/* Visual Workspace Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sub-item Grid / Thumbnail Sidebar */}
        {files.length > 1 && (
          <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[100px] sm:max-h-[140px] lg:max-h-[420px] p-1 bg-surface-base rounded-[16px]">
            {files.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative flex items-center gap-3 p-2.5 rounded-[12px] border text-left cursor-pointer transition-all shrink-0 lg:shrink w-[180px] lg:w-full ${
                  selectedIndex === idx 
                    ? "border-brand-primary bg-brand-primary-light/50" 
                    : "border-border-card bg-surface-base hover:bg-surface-muted/30"
                }`}
              >
                <div className="w-10 h-10 rounded-[8px] bg-surface-muted border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={item.originalDataUrl} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-main truncate">{item.name}</p>
                  <p className="text-[10px] font-mono text-text-muted mt-0.5">{formatBytes(item.originalSize)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(idx);
                  }}
                  className="p-1.5 hover:bg-status-error/10 text-text-muted hover:text-status-error rounded-md transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title={t("removeFileTitle", locale)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            ))}
          </div>
        )}

{/* Primary Auditor Window */}
          <div className={`col-span-1 ${files.length > 1 ? "lg:col-span-9" : "lg:col-span-12"} flex flex-col gap-3`}>
            {/* File Info Bar - Desktop: info left, actions right */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-base px-3 py-2.5 sm:px-4 rounded-[16px]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                <FileImage className="w-4 h-4" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-text-main max-w-[180px] sm:max-w-[280px] truncate" title={selectedItem.name}>{selectedItem.name}</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {selectedItem.originalWidth} × {selectedItem.originalHeight} px • {formatBytes(selectedItem.originalSize)}
                </span>
              </div>
            </div>

            {/* File Management Actions - grouped together */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onFileReplaced && (
                <label
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors min-h-[44px] min-w-[44px] sm:min-w-auto"
                  title={t("replaceCurrent", locale)}
                >
                  <RefreshCw className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("replace", locale)}</span>
                  <input
                    type="file"
                    accept={accept || "image/*"}
                    onChange={handleReplaceFile}
                    className="sr-only"
                  />
                </label>
              )}

              {onAddFiles && (
                <label
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488]/20 rounded-lg cursor-pointer transition-colors min-h-[44px] min-w-[44px] sm:min-w-auto"
                  title={t("addBatch", locale)}
                >
                  <FileUp className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("addFile", locale)}</span>
                  <input
                    type="file"
                    multiple
                    accept={accept || "image/*"}
                    onChange={handleAddFiles}
                    className="sr-only"
                  />
                </label>
              )}

              <button
                onClick={() => onRemoveFile(selectedIndex)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-lg cursor-pointer transition-colors min-h-[44px] min-w-[44px] sm:min-w-auto"
                title={t("removeCurrent", locale)}
              >
                <Trash2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{t("remove", locale)}</span>
              </button>

              {files.length > 1 && onClearAll && (
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-muted hover:text-status-error bg-surface-muted hover:bg-status-error/10 rounded-lg cursor-pointer transition-colors min-h-[44px] min-w-[44px] sm:min-w-auto"
                  title={t("clearAllFiles", locale)}
                >
                  <X className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("clearAll", locale)}</span>
                </button>
              )}
            </div>
          </div>

{/* Zoom Controls - now with the preview, not the file bar */}
            <div className="flex items-center justify-end gap-1 bg-surface-base px-3 py-2 rounded-[16px]">
              <div className="flex items-center gap-1 bg-surface-muted/50 p-1 rounded-xl" role="group" aria-label={t("zoomControls", locale)}>
              <button 
                onClick={() => setZoom(Math.max(25, zoom - 25))} 
                className="p-1.5 hover:bg-surface-muted text-text-sub rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" 
                title={t("zoomOut", locale)}
                aria-label={t("zoomOut", locale)}
              >
                <ZoomOut className="w-4.5 h-4.5" />
              </button>
              <span className="text-xs font-mono font-bold text-text-muted min-w-[36px] text-center px-1">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(300, zoom + 25))} 
                className="p-1.5 hover:bg-surface-muted text-text-sub rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" 
                title={t("zoomIn", locale)}
                aria-label={t("zoomIn", locale)}
              >
                <ZoomIn className="w-4.5 h-4.5" />
              </button>
              <div className="w-[1px] h-6 bg-border-light mx-1" />
              <button 
                onClick={() => setIsFullscreen(true)} 
                className="p-1.5 hover:bg-surface-muted text-text-sub rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center" 
                title={t("fullscreenModal", locale)}
                aria-label={t("fullscreenModal", locale)}
              >
                <Maximize2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Interactive Frame */}
          <div 
            ref={containerRef}
            className="relative border border-border-card rounded-[24px] overflow-hidden bg-[#121410] flex items-center justify-center min-h-[200px] sm:min-h-[260px] md:min-h-[320px] max-h-[44dvh] md:max-h-[480px]"
          >
            {selectedItem.isProcessing ? (
              <div className="flex flex-col items-center gap-3 text-white">
                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                <span className="text-xs font-mono">{t("renderingAsset", locale)}</span>
              </div>
            ) : showComparison ? (
              isVisualTool ? (
                /* BEFORE/AFTER SLIDER INTERFACE */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ width: '100%', height: 'clamp(200px, 48vw, 420px)' }}>
                  {/* Original (Underlay) */}
                  <img 
                    src={selectedItem.originalDataUrl} 
                    alt="Original" 
className="absolute max-w-full max-h-full object-contain select-none pointer-events-none gu-checkerboard-dark"
                  style={{ transform: `scale(${zoom / 100})` }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Optimized (Overlay Clip) */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{ 
                      clipPath: `inset(0 ${100 - compareSplit}% 0 0)` 
                    }}
                  >
                    <img 
                      src={selectedItem.processedDataUrl} 
                      alt="Processed" 
                      className="absolute max-w-full max-h-full object-contain select-none pointer-events-none gu-checkerboard-dark"
                      style={{ transform: `scale(${zoom / 100})`, maxWidth: '100%' }}
                      referrerPolicy="no-referrer"
                    />
                    {/* Left tag */}
                    <span className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-mono tracking-wide uppercase px-2 py-1 rounded-[6px] shadow-premium-sm">
                      {t("optimized", locale)}
                    </span>
                  </div>

                  {/* Right tag (outside clip area visually, underneath) */}
                  <span className="absolute top-4 right-4 bg-surface-muted/90 dark:bg-surface-base/90 text-text-main text-[10px] font-mono tracking-wide uppercase px-2 py-1 rounded-[6px] shadow-premium-sm">
                    {t("original", locale)}
                  </span>

                  {/* Interactive slider divider handle */}
                  <div 
                    className="absolute inset-y-0 w-1 bg-brand-primary/80 cursor-ew-resize z-20 flex items-center justify-center"
                    style={{ left: `${compareSplit}%` }}
                    onMouseDown={handleMouseDownSplit}
                    onTouchStart={handleMouseDownSplit}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white border-2 border-white shadow-premium-lg flex items-center justify-center text-xs pointer-events-none">
                      ↔
                    </div>
                  </div>
                </div>
              ) : (
                /* SIDE-BY-SIDE CARDS PREVIEW FOR CONVERSION/DIMENSION TOOLS */
                <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto" style={{ minHeight: 'clamp(240px, 50vw, 420px)' }}>
                  {/* Original Card */}
                  <div className="bg-surface-base border border-border-card rounded-[20px] p-4 flex flex-col justify-between gap-3 h-full">
                    <div className="text-xs font-mono font-black text-text-muted uppercase tracking-wider flex items-center justify-between border-b border-border-subtle/40 pb-2">
                      <span>{t("originalSource", locale)}</span>
                      <span className="px-2 py-0.5 rounded bg-surface-muted text-text-muted font-bold text-[10px]">
                        {selectedItem.name.split('.').pop()?.toUpperCase() || "IMG"}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-surface-muted/50 rounded-[16px] overflow-hidden min-h-[160px] p-2">
                      <img 
                        src={selectedItem.originalDataUrl} 
                        alt="Original Thumbnail" 
                        className="max-w-full max-h-[150px] object-contain rounded gu-checkerboard"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-left pt-1">
                      <p className="font-semibold text-text-main truncate" title={selectedItem.name}>
                        {selectedItem.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-muted font-mono">
                        <span>{t("size", locale)} <strong>{formatBytes(selectedItem.originalSize)}</strong></span>
                        <span>•</span>
                        <span>{t("dimensions", locale)} <strong>{selectedItem.originalWidth} × {selectedItem.originalHeight} px</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Converted Card */}
                  <div className="bg-surface-base border-2 border-brand-primary/20 rounded-[20px] p-4 flex flex-col justify-between gap-3 h-full shadow-premium-sm">
                    <div className="text-xs font-mono font-black text-brand-primary uppercase tracking-wider flex items-center justify-between border-b border-brand-primary/10 pb-2">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                        {t("convertedOutput", locale)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary font-bold text-[10px]">
                        {(() => {
                          if (selectedItem.processedDataUrl) {
                            const match = selectedItem.processedDataUrl.match(/^data:image\/([a-zA-Z+]+);base64/);
                            if (match && match[1]) return match[1].toUpperCase();
                          }
                          return selectedItem.name.split('.').pop()?.toUpperCase() || "IMG";
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center bg-brand-primary-light/10 rounded-[16px] overflow-hidden min-h-[160px] p-2">
                      <img 
                        src={selectedItem.processedDataUrl} 
                        alt="Converted Thumbnail" 
                        className="max-w-full max-h-[150px] object-contain rounded gu-checkerboard"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-left pt-1">
                      <p className="font-semibold text-text-main truncate" title={selectedItem.name}>
                        {selectedItem.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-muted font-mono">
                        <span>{t("size", locale)} <strong className="text-brand-primary">{formatBytes(selectedItem.processedSize)}</strong></span>
                        <span>•</span>
                        <span>{t("dimensions", locale)} <strong>{selectedItem.processedWidth || selectedItem.originalWidth} × {selectedItem.processedHeight || selectedItem.originalHeight} px</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* SINGLE FILE PREVIEW (Original only) */
              <div className="relative h-full w-full flex items-center justify-center p-4">
                <img 
                  src={selectedItem.originalDataUrl} 
                  alt="Original single preview" 
                  className="max-w-full max-h-full object-contain rounded-md gu-checkerboard-dark"
                  style={{ transform: `scale(${zoom / 100})` }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Quick Info Summary */}
          {showComparison && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-surface-base border border-border-card p-3 sm:p-4 rounded-[16px]">
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">{t("originalSizeLabel", locale)}</span>
                <p className="text-base font-bold text-text-main">{formatBytes(selectedItem.originalSize)}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">{t("optimizedSizeLabel", locale)}</span>
                <p className="text-base font-bold text-brand-primary">{formatBytes(selectedItem.processedSize)}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">{t("compression", locale)}</span>
                <p className="text-base font-bold text-brand-secondary-hover">{tf("savedPct", locale, { pct: String(getPercentageSavings()) })}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block">{t("newDimensions", locale)}</span>
                <p className="text-base font-bold text-text-main">{selectedItem.processedWidth}x{selectedItem.processedHeight}px</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col p-4"
          >
            <div className="flex justify-between items-center text-white pb-3 border-b border-white/10">
              <span className="font-sans font-bold">{selectedItem.name} ({t("fullscreenViewer", locale)})</span>
              <button 
                onClick={() => setIsFullscreen(false)} 
                className="p-1 hover:bg-white/15 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto p-4">
              <img 
                src={selectedItem.processedDataUrl || selectedItem.originalDataUrl} 
                alt="Fullscreen Preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-md gu-checkerboard-dark"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ----------------------------------------------------
// 3. UNIVERSAL SETTINGS PANEL
// ----------------------------------------------------
interface UniversalSettingsProps {
  title: string;
  subtitle?: string;
  onReset?: () => void;
  children: React.ReactNode;
  /** Enable collapse/expand toggle in the settings header. */
  collapsible?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Callback when the collapse toggle is clicked. */
  onToggleCollapse?: () => void;
}

export const UniversalSettingsPanel: React.FC<UniversalSettingsProps> = ({
  title,
  subtitle,
  onReset,
  children,
  collapsible = false,
  collapsed,
  onToggleCollapse
}) => {
  const locale = useLocale();
  const isCollapsed = collapsible && collapsed === true;

  // Collapsed disclosure state: show a quiet "Adjust settings" secondary action
  // instead of a full settings dashboard, so the completed result stays dominant.
  if (isCollapsed && onToggleCollapse) {
    return (
      <div className="bg-surface-base border border-border-card rounded-[var(--tool-panel-radius,18px)] shadow-premium-sm overflow-hidden">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 hover:bg-surface-muted/40 transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Sliders className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors">Adjust settings</span>
          </span>
          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <Card 
      title={title} 
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2">
          {collapsible && onToggleCollapse && (
            <Button variant="outline" size="sm" onClick={onToggleCollapse} leftIcon={<ChevronDown className="w-3.5 h-3.5" />}>
              Hide settings
            </Button>
          )}
          {onReset ? (
            <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              {t("resetSettings", locale)}
            </Button>
          ) : undefined}
        </div>
      }
    >
      <div className="space-y-6">
        {children}
      </div>
    </Card>
  );
};


// ----------------------------------------------------
// 4. UNIVERSAL PROCESSING PANEL
// ----------------------------------------------------
interface UniversalProcessingProps {
  /** True while the tool is actively compiling results. When false and no
      error is present the panel renders nothing, so idle tools never show a
      stale "Uploading…" state. */
  isProcessing?: boolean;
  percentage: number;
  currentFileName?: string;
  remainingCount?: number;
  remainingFiles?: number;
  totalCount?: number;
  totalFiles?: number;
  onCancel?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
  error?: string;
  successMessage?: string;
  /** Optional override for the status line (e.g. "Rendering favicon sizes…"). */
  statusLabel?: string;
}

export const UniversalProcessingPanel: React.FC<UniversalProcessingProps> = ({
  isProcessing = false,
  percentage,
  currentFileName,
  remainingCount,
  remainingFiles,
  totalCount,
  totalFiles,
  onCancel,
  onRetry,
  onReset,
  error,
  successMessage,
  statusLabel
}) => {
  const locale = useLocale();
  const remaining = remainingFiles ?? remainingCount ?? 0;
  const total = totalFiles ?? totalCount ?? 0;
  const currentNum = total - remaining + 1;

  // Nothing is happening — the idle/ready/completed states are handled by the
  // upload + download surfaces, so never fabricate a progress UI here.
  if (!isProcessing && !error) {
    return null;
  }

  // Automated status message derived from the real phase of local processing.
  // These tools never upload anything, so the copy never says "Uploading".
  let statusText = statusLabel || t("preparingFiles", locale);
  if (isProcessing) {
    if (percentage <= 0) {
      statusText = statusLabel || t("readingFiles", locale);
    } else if (percentage < 30) {
      statusText = statusLabel || t("loadingImages", locale);
    } else if (percentage < 50) {
      statusText = statusLabel || t("processing", locale);
    } else if (percentage < 70) {
      statusText = statusLabel || t("optimizing", locale);
    } else if (percentage < 95) {
      statusText = statusLabel || t("generatingOutput", locale);
    } else if (percentage < 100) {
      statusText = statusLabel || t("finalizing", locale);
    } else {
      statusText = statusLabel || t("allDone", locale);
    }
  }

  // Failed State Layout
  if (error) {
    return (
      <div className="border border-status-error/20 rounded-[24px] p-6 bg-surface-base shadow-premium-sm space-y-4">
        <div className="flex items-center gap-3 text-status-error">
          <AlertTriangle className="w-8 h-8 shrink-0 animate-pulse" />
          <div>
            <h4 className="font-sans font-bold text-text-main text-lg">{t("processingFailedTitle", locale)}</h4>
            <p className="text-xs text-text-muted mt-0.5">{t("processingFailedBody", locale)}</p>
          </div>
        </div>
        
        <p className="p-4 bg-status-error/5 border border-status-error/10 rounded-xl text-sm font-mono text-status-error/90 leading-relaxed">
          {error}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onRetry && (
            <Button variant="primary" size="sm" onClick={onRetry} className="bg-status-error hover:bg-status-error/95">
              {t("retry", locale)}
            </Button>
          )}
          {(onReset || onCancel) && (
            <Button variant="outline" size="sm" onClick={onReset || onCancel}>
              {t("uploadAnother", locale)}
            </Button>
          )}
          {onCancel && onReset && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              {t("reset", locale)}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-base border border-border-card rounded-[24px] p-6 shadow-premium-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-sans font-bold text-text-main flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shrink-0" />
            {statusText}
          </h4>
          {currentFileName && remaining > 0 && (
            <p className="text-xs text-text-muted mt-1 font-mono">
              {tf("workingOn", locale, { name: currentFileName, current: String(currentNum), total: String(total) })}
            </p>
          )}
        </div>
        <span className="text-lg font-mono font-black text-brand-primary">{percentage}%</span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-surface-muted rounded-full overflow-hidden border border-border-subtle relative">
        <motion.div 
          className="h-full bg-brand-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {remaining > 0 && onCancel && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            {t("cancelProcessing", locale)}
          </Button>
        </div>
      )}

      {successMessage && !error && remaining === 0 && (
        <div className="p-3.5 bg-status-success/5 border border-status-success/15 rounded-[12px] flex items-start gap-2.5 text-xs text-text-sub">
          <CheckCircle className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
          <span className="text-status-success font-semibold">{successMessage}</span>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 5. UNIVERSAL DOWNLOAD PANEL (Compact Sidebar-Friendly)
// ----------------------------------------------------
interface UniversalDownloadProps {
  onDownloadSingle: () => void;
  onDownloadZip?: () => void;
  onClearAll: () => void;
  hasMultiple?: boolean;
  zipLabel?: string;
  singleLabel?: string;
  clearLabel?: string;
  
  files?: any[];
  originalSize?: number;
  processedSize?: number;
  compressionPercent?: number;
  outputFormat?: string;
  timeTaken?: number | string;
  dimensions?: string;
  status?: string;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  /** Output type for standardized "Download [Type]" label */
  outputType?: string;
}

export const UniversalDownloadPanel: React.FC<UniversalDownloadProps> = ({
  onDownloadSingle,
  onDownloadZip,
  onClearAll,
  hasMultiple,
  zipLabel,
  singleLabel,
  clearLabel,
  files,
  originalSize,
  processedSize,
  compressionPercent,
  outputFormat,
  timeTaken,
  dimensions,
  status,
  onAddToast,
  outputType
}) => {
  const locale = useLocale();
  const resolvedZipLabel = zipLabel ?? t("downloadBatchZip", locale);
  const resolvedSingleLabel = singleLabel ?? (outputType ? tf("downloadOutputType", locale, { type: outputType }) : t("downloadOptimized", locale));
  const resolvedClearLabel = clearLabel ?? t("changeImage", locale);
  const resolvedStatus = status ?? t("complete", locale);
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-calculation of sizes if files are provided
  let totalOriginalSize = originalSize;
  let totalProcessedSize = processedSize;
  let computedDimensions = dimensions;
  let computedFormat = outputFormat;

  if (files && files.length > 0) {
    const processedList = files.filter(f => f.processedDataUrl || f.processedSize || f.size);
    if (processedList.length > 0) {
      if (totalOriginalSize === undefined) {
        totalOriginalSize = processedList.reduce((acc, f) => acc + (f.originalSize || f.size || 0), 0);
      }
      if (totalProcessedSize === undefined) {
        totalProcessedSize = processedList.reduce((acc, f) => acc + (f.processedSize || f.size || 0), 0);
      }
      if (!computedDimensions) {
        const first = processedList[0];
        const w = first.processedWidth || first.originalWidth || first.width;
        const h = first.processedHeight || first.originalHeight || first.height;
        if (w && h) computedDimensions = `${w} × ${h}`;
      }
      if (!computedFormat) {
        const first = processedList[0];
        if (first.processedDataUrl) {
          const match = first.processedDataUrl.match(/^data:image\/([a-zA-Z+]+);base64/);
          if (match && match[1]) computedFormat = match[1].toUpperCase();
        }
        if (!computedFormat && first.file) {
          computedFormat = first.file.type.split("/")[1]?.toUpperCase() || first.name.split(".").pop()?.toUpperCase();
        }
      }
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  let pct = compressionPercent;
  if (pct === undefined && totalOriginalSize && totalProcessedSize) {
    const diff = totalOriginalSize - totalProcessedSize;
    pct = diff !== 0 ? Math.round((diff / totalOriginalSize) * 100) : 0;
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "GainUtility", url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        if (onAddToast) onAddToast(t("linkCopied", locale), "success");
      }
    } catch { /* ignore */ }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      if (onAddToast) onAddToast(t("linkCopied", locale), "success");
      setTimeout(() => setHasCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // `files` is optional: callers like MergePdf render this panel purely from
  // size/dimension metadata without passing a files array.
  if (!files || files.length === 0) return null;

  return (
    <div className="bg-surface-base border border-border-card rounded-[18px] shadow-premium-sm overflow-hidden lg:sticky lg:top-24">
      <div className="p-3.5 sm:p-4 md:p-5 flex flex-col gap-3">
        {/* Success status */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-success" />
          <span className="text-sm font-sans font-bold text-status-success">
            {resolvedStatus}
          </span>
        </div>

        {/* Compact metadata chips */}
        <div className="flex flex-wrap gap-2">
          {totalOriginalSize && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-subtle/50">
              <span className="text-text-muted">{t("original", locale)}</span>
              <span className="font-bold text-text-main">{formatSize(totalOriginalSize)}</span>
            </span>
          )}
          {totalProcessedSize && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-subtle/50">
              <span className="text-text-muted">{t("new", locale)}</span>
              <span className="font-bold text-brand-primary">{formatSize(totalProcessedSize)}</span>
            </span>
          )}
          {pct !== undefined && pct > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-status-success/10 border border-status-success/20">
              <span className="font-bold text-status-success">{tf("savedPct", locale, { pct: String(pct) })}</span>
            </span>
          )}
          {pct !== undefined && pct < 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-subtle/50">
              <span className="font-bold text-text-muted">{tf("largerPct", locale, { pct: String(Math.abs(pct)) })}</span>
            </span>
          )}
          {computedFormat && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-subtle/50">
              <span className="font-bold text-text-main uppercase">{computedFormat}</span>
            </span>
          )}
          {computedDimensions && (
            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border-subtle/50">
              <span className="font-bold text-text-main">{computedDimensions}</span>
            </span>
          )}
        </div>

        {/* Primary action */}
        <Button
          variant="primary"
          size="lg"
          onClick={onDownloadSingle}
          leftIcon={<Download className="w-5 h-5" />}
          className="w-full justify-center"
        >
          {resolvedSingleLabel}
        </Button>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-2">
          {hasMultiple && onDownloadZip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadZip}
              leftIcon={<FolderArchive className="w-4 h-4" />}
              className="min-h-[44px]"
            >
              {resolvedZipLabel}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            {resolvedClearLabel}
          </Button>
        </div>

        {/* Tertiary actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="min-h-[40px]"
          >
            {t("share", locale)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="min-h-[40px]"
          >
            {hasCopied ? t("copied", locale) : t("copyLink", locale)}
          </Button>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// 6. UNIVERSAL STATUS COMPONENTS
// ----------------------------------------------------
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-8 bg-surface-muted rounded-md w-1/4" />
      <div className="h-4 bg-surface-muted rounded-md w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-32 bg-surface-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
};



