import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Twitter, 
  Sparkles,
  RefreshCw,
  Crop,
  Layers,
  Sliders,
  Move,
  Maximize2,
  Trash2,
  Plus,
  RotateCw,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Download
} from "lucide-react";
import { Button, StickyMobileAction } from "./Common";
import { 
  ImageFileItem, 
  UniversalUploadComponent, 
  UniversalProcessingPanel, 
  UniversalSettingsPanel,
  UniversalDownloadPanel 
} from "./ImageToolFramework";
import { ContinueEditing } from "./ContinueEditing";
import JSZip from "jszip";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface PresetItem {
  id: string;
  platform: "Instagram" | "Facebook" | "Twitter" | "LinkedIn" | "YouTube" | "TikTok" | "Pinterest";
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  icon: React.ReactNode;
}

const SOCIAL_PRESETS: PresetItem[] = [
  { id: "ig_square", platform: "Instagram", name: "Square Post", width: 1080, height: 1080, aspectRatio: "1:1", icon: <Instagram className="w-4 h-4" /> },
  { id: "ig_portrait", platform: "Instagram", name: "Portrait Post", width: 1080, height: 1350, aspectRatio: "4:5", icon: <Instagram className="w-4 h-4" /> },
  { id: "ig_story", platform: "Instagram", name: "Story / Reel", width: 1080, height: 1920, aspectRatio: "9:16", icon: <Instagram className="w-4 h-4" /> },
  { id: "fb_shared", platform: "Facebook", name: "Shared Post", width: 1200, height: 630, aspectRatio: "1.91:1", icon: <Facebook className="w-4 h-4" /> },
  { id: "fb_cover", platform: "Facebook", name: "Cover Photo", width: 820, height: 312, aspectRatio: "2.63:1", icon: <Facebook className="w-4 h-4" /> },
  { id: "fb_story", platform: "Facebook", name: "Story", width: 1080, height: 1920, aspectRatio: "9:16", icon: <Facebook className="w-4 h-4" /> },
  { id: "tw_post", platform: "Twitter", name: "Timeline Post", width: 1200, height: 675, aspectRatio: "16:9", icon: <Twitter className="w-4 h-4" /> },
  { id: "tw_header", platform: "Twitter", name: "Header Banner", width: 1500, height: 500, aspectRatio: "3:1", icon: <Twitter className="w-4 h-4" /> },
  { id: "li_post", platform: "LinkedIn", name: "Shared Image", width: 1200, height: 627, aspectRatio: "1.91:1", icon: <Linkedin className="w-4 h-4" /> },
  { id: "li_cover", platform: "LinkedIn", name: "Profile Cover", width: 1584, height: 396, aspectRatio: "4:1", icon: <Linkedin className="w-4 h-4" /> },
  { id: "yt_thumb", platform: "YouTube", name: "Video Thumbnail", width: 1280, height: 720, aspectRatio: "16:9", icon: <Youtube className="w-4 h-4" /> },
  { id: "tt_video", platform: "TikTok", name: "Video Cover", width: 1080, height: 1920, aspectRatio: "9:16", icon: <Sparkles className="w-4 h-4" /> },
  { id: "pin_standard", platform: "Pinterest", name: "Standard Pin", width: 1000, height: 1500, aspectRatio: "2:3", icon: <Sparkles className="w-4 h-4" /> },
];

const clampNum = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const formatBytes = (bytes?: number) => {
  if (!bytes) return "0 Bytes";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ---------------------------------------------------------------------------
// Interactive WYSIWYG artboard. Renders the exact target canvas ratio, draws a
// scaled version of the source using the SAME math as the final renderer, and
// exposes corner resize handles + drag-to-pan so adjustments are visible live.
// ---------------------------------------------------------------------------
type DragMode = "none" | "pan" | "tl" | "tr" | "bl" | "br";

interface SocialCanvasProps {
  imageUrl: string;
  preset: PresetItem;
  cropFit: "cover" | "fit";
  zoom: number;
  offsetX: number;
  offsetY: number;
  bgColor: string;
  onZoomChange: (z: number) => void;
  onOffsetChange: (x: number, y: number) => void;
}

const SocialCanvas: React.FC<SocialCanvasProps> = ({
  imageUrl,
  preset,
  cropFit,
  zoom,
  offsetX,
  offsetY,
  bgColor,
  onZoomChange,
  onOffsetChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const dragRef = useRef<{ mode: DragMode; x: number; y: number; z: number; ox: number; oy: number; w: number; h: number }>({
    mode: "none", x: 0, y: 0, z: 100, ox: 0, oy: 0, w: 0, h: 0
  });

  useEffect(() => {
    if (!imageUrl) {
      imgRef.current = null;
      setImgReady(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgReady(true);
    };
    img.src = imageUrl;
    return () => {
      img.onload = null;
      imgRef.current = null;
    };
  }, [imageUrl]);

  // Draw a scaled WYSIWYG version of the final render into the preview canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgReady) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BOX = 760;
    const scale = Math.min(BOX / preset.width, BOX / preset.height);
    const cw = Math.max(1, Math.round(preset.width * scale));
    const ch = Math.max(1, Math.round(preset.height * scale));
    canvas.width = cw;
    canvas.height = ch;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);

    const zf = zoom / 100;
    const rt = cw / ch;
    const rn = img.naturalWidth / img.naturalHeight;
    let rw = cw;
    let rh = ch;
    if (cropFit === "cover") {
      if (rn > rt) { rh = ch; rw = ch * rn; } else { rw = cw; rh = cw / rn; }
    } else {
      if (rn > rt) { rw = cw; rh = cw / rn; } else { rh = ch; rw = ch * rn; }
    }
    rw *= zf;
    rh *= zf;
    const cx = (cw - rw) / 2 + (offsetX / 100) * cw;
    const cy = (ch - rh) / 2 + (offsetY / 100) * ch;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, cx, cy, rw, rh);
  }, [imageUrl, imgReady, preset, cropFit, zoom, offsetX, offsetY, bgColor]);

  const begin = (e: React.PointerEvent<HTMLElement>, mode: DragMode) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { mode, x: e.clientX, y: e.clientY, z: zoom, ox: offsetX, oy: offsetY, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const move = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (d.mode === "none") return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.mode === "pan") {
      onOffsetChange(
        clampNum(d.ox + (dx / d.w) * 100, -100, 100),
        clampNum(d.oy + (dy / d.h) * 100, -100, 100)
      );
      return;
    }
    const dist = Math.sqrt(dx * dx + dy * dy);
    const diag = Math.sqrt(d.w * d.w + d.h * d.h) || 1;
    let sign = 1;
    if (d.mode === "br") sign = dx > 0 || dy > 0 ? 1 : -1;
    else if (d.mode === "bl") sign = dx < 0 || dy > 0 ? 1 : -1;
    else if (d.mode === "tr") sign = dx > 0 || dy < 0 ? 1 : -1;
    else if (d.mode === "tl") sign = dx < 0 || dy < 0 ? 1 : -1;
    const next = clampNum(Math.round(d.z + sign * (dist / diag) * 200), 50, 200);
    if (next !== zoom) onZoomChange(next);
  };

  const end = () => {
    dragRef.current.mode = "none";
  };

  const ratio = preset.width / preset.height;
  const frameW = ratio >= 1 ? 760 : Math.round(560 * ratio);

  const corners: { mode: DragMode; cls: string }[] = [
    { mode: "tl", cls: "left-0 top-0 cursor-nwse-resize" },
    { mode: "tr", cls: "right-0 top-0 cursor-nesw-resize" },
    { mode: "bl", cls: "left-0 bottom-0 cursor-nesw-resize" },
    { mode: "br", cls: "right-0 bottom-0 cursor-nwse-resize" }
  ];

  return (
    <div className="bg-surface-base border border-border-light rounded-[24px] p-4 sm:p-6 shadow-premium-sm space-y-4">
      {/* Header: platform, exact dimensions, aspect ratio */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary-light/70 text-brand-primary text-xs font-bold border border-brand-primary/15">
          {preset.icon}
          <span>{preset.platform} · {preset.name}</span>
        </span>
        <span className="text-xs font-mono font-bold text-text-sub px-3 py-1.5 rounded-full bg-surface-muted border border-border-light">
          {preset.width} × {preset.height} px
        </span>
        <span className="text-xs font-mono text-text-muted px-3 py-1.5 rounded-full bg-surface-muted/60 border border-border-light">
          {preset.aspectRatio}
        </span>
      </div>

      {/* Dimension guides + artboard */}
      <div className="pt-5 pb-4 relative">
        {/* Width ruler (top) */}
        <div className="pointer-events-none absolute top-0 left-6 right-6 flex items-center gap-2" aria-hidden="true">
          <div className="h-px flex-1 bg-border-medium" />
          <span className="text-[10px] font-mono text-text-muted shrink-0 bg-surface-base px-1">{preset.width}px</span>
          <div className="h-px flex-1 bg-border-medium" />
        </div>
        {/* Height ruler (left) */}
        <div className="pointer-events-none absolute left-0 top-6 bottom-6 flex flex-col items-center gap-2" aria-hidden="true">
          <div className="w-px flex-1 bg-border-medium" />
          <span className="text-[10px] font-mono text-text-muted leading-none" style={{ writingMode: "vertical-rl" }}>{preset.height}px</span>
          <div className="w-px flex-1 bg-border-medium" />
        </div>

        <div className="flex justify-center px-5">
          <div
            ref={frameRef}
            className="relative rounded-lg overflow-hidden shadow-premium-lg ring-1 ring-border-light touch-none select-none"
            style={{ aspectRatio: `${preset.width} / ${preset.height}`, width: `min(100%, ${frameW}px)` }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-move"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => begin(e, "pan")}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />

            {/* Safe-zone guide overlay */}
            <div className="pointer-events-none absolute inset-[5%] border border-dashed border-white/70 z-10" aria-hidden="true" />
            <span className="pointer-events-none absolute top-1.5 left-1.5 z-10 bg-black/60 text-[#FAF8F1] text-[9px] font-mono px-1.5 py-0.5 rounded-md">
              LIVE ARTBOARD · {preset.aspectRatio}
            </span>

            {/* Corner resize handles */}
            {corners.map((c) => (
              <div
                key={c.mode}
                role="button"
                aria-label="Resize image"
                className={`absolute z-20 h-4 w-4 rounded-[4px] bg-white border-2 border-brand-primary shadow-premium-sm ${c.cls}`}
                style={{ touchAction: "none" }}
                title="Drag to resize image"
                onPointerDown={(e) => begin(e, c.mode)}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interaction hints */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-text-muted px-1">
        <span className="inline-flex items-center gap-1"><Move className="w-3 h-3" /> Drag inside the artboard to reposition</span>
        <span className="inline-flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Pull a corner handle to scale</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Horizontal file strip (thumbnails + remove + add)
// ---------------------------------------------------------------------------
interface FileStripProps {
  files: ImageFileItem[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  onRemoveFile: (idx: number) => void;
  onAddClick: () => void;
}

const FileStrip: React.FC<FileStripProps> = ({
  files,
  selectedIndex,
  onSelectIndex,
  onRemoveFile,
  onAddClick
}) => {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
      {files.map((item, idx) => (
        <div
          key={item.id}
          onClick={() => onSelectIndex(idx)}
          className={`relative flex items-center gap-2 p-2 rounded-[14px] border cursor-pointer transition-all shrink-0 w-[164px] ${
            selectedIndex === idx
              ? "border-brand-primary bg-brand-primary-light/40 ring-1 ring-brand-primary/30"
              : "border-border-light bg-surface-base hover:bg-surface-muted/40"
          }`}
        >
          <div className="w-10 h-10 rounded-[8px] bg-surface-muted border border-border-light overflow-hidden shrink-0 flex items-center justify-center">
            <img src={item.originalDataUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-main truncate">{item.name}</p>
            <p className="text-[9px] font-mono text-text-muted mt-0.5">{formatBytes(item.originalSize)}</p>
            {item.processedDataUrl && !item.isProcessing ? (
              <p className="text-[9px] font-mono text-brand-primary font-bold mt-0.5">Revision ready</p>
            ) : item.isProcessing ? (
              <p className="text-[9px] font-mono text-brand-primary mt-0.5 animate-pulse">Rendering…</p>
            ) : (
              <p className="text-[9px] font-mono text-text-disabled mt-0.5">
                {item.originalWidth}x{item.originalHeight}
              </p>
            )}
          </div>
          <span
            role="button"
            aria-label="Remove file"
            onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
            className="p-1 rounded-md text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </span>
        </div>
      ))}
      <label
        htmlFor="social-add-input"
        className="shrink-0 w-[132px] border-2 border-dashed border-border-medium rounded-[14px] flex flex-col items-center justify-center gap-1 text-brand-primary hover:border-brand-primary hover:bg-brand-primary-light/20 transition-all cursor-pointer min-w-0"
      >
        <Plus className="w-4 h-4 pointer-events-none" />
        <span className="text-[11px] font-semibold pointer-events-none">Add files</span>
      </label>
    </div>
  );
};

interface SocialResizerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const SocialResizer: React.FC<SocialResizerProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const postDownload = usePostDownload();
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  // Resizing state
  const [activePreset, setActivePreset] = useState<PresetItem>(SOCIAL_PRESETS[0]);
  const [cropFit, setCropFit] = useState<"cover" | "fit">("cover");
  const [zoom, setZoom] = useState<number>(100); // 50-200%
  const [offsetX, setOffsetX] = useState<number>(0); // -100 to 100
  const [offsetY, setOffsetY] = useState<number>(0); // -100 to 100
  const [bgColor, setBgColor] = useState<string>("#121410"); // background margin fill
  
  // Processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState("");
  const [remainingFiles, setRemainingFiles] = useState(0);

  // Progressive disclosure: collapse settings after completion
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // Invalidate stale revisions whenever the user changes any placement control,
  // so downloads always match the current artboard.
  const invalidateOutput = () => {
    setFiles(prev => prev.map(f => ({
      ...f,
      processedDataUrl: undefined,
      processedSize: undefined,
      processedWidth: undefined,
      processedHeight: undefined,
      error: undefined
    })));
  };

  const handlePresetChange = (preset: PresetItem) => {
    setActivePreset(preset);
    invalidateOutput();
  };

  const handleFitChange = (fit: "cover" | "fit") => {
    setCropFit(fit);
    invalidateOutput();
  };

  const handleZoomChange = (z: number) => {
    setZoom(z);
    invalidateOutput();
  };

  const handleOffsetChange = (x: number, y: number) => {
    setOffsetX(x);
    setOffsetY(y);
    invalidateOutput();
  };

  const resetAdjustments = () => {
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
    invalidateOutput();
  };

  // Smart handoff check on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.__gainutility_handoff_files && window.__gainutility_handoff_files.length > 0) {
      const handoffList = window.__gainutility_handoff_files;
      window.__gainutility_handoff_files = undefined; // consume immediately

      const loadedItems: ImageFileItem[] = [];
      let loadedCount = 0;

      handoffList.forEach(item => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            loadedItems.push({
              id: Math.random().toString(36).substring(2, 9),
              file: item.file,
              name: item.name,
              originalSize: item.file.size,
              originalWidth: img.naturalWidth,
              originalHeight: img.naturalHeight,
              originalDataUrl: dataUrl,
              isProcessing: false
            });

            loadedCount++;
            if (loadedCount === handoffList.length) {
              setFiles(loadedItems);
              setSelectedIndex(0);
              onAddToast(`Smart Handoff: Loaded ${handoffList.length} image(s) successfully!`, "success");
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(item.file);
      });
    }
  }, [onAddToast]);

  const handleFilesAdded = (rawFiles: File[]) => {
    const validFiles = rawFiles.filter(file => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      onAddToast("Please upload valid images!", "error");
      return;
    }

    const newItems: ImageFileItem[] = [];
    let loadedCount = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            originalSize: file.size,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            originalDataUrl: dataUrl,
            isProcessing: false
          });

          loadedCount++;
          if (loadedCount === validFiles.length) {
            setFiles(prev => {
              const updated = [...prev, ...newItems];
              if (prev.length === 0) {
                setSelectedIndex(0);
              }
              return updated;
            });
            onAddToast(`Added ${validFiles.length} social image(s) to queue.`, "success");
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddFilesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) fileList.push(e.target.files[i]);
      handleFilesAdded(fileList);
    }
    e.target.value = "";
  };

  const handleReplaceSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setFiles(prev => prev.map((f, idx) => idx === selectedIndex ? {
          ...f,
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalDataUrl: dataUrl,
          isProcessing: false,
          processedDataUrl: undefined,
          processedSize: undefined,
          processedWidth: undefined,
          processedHeight: undefined,
          error: undefined
        } : f));
        onAddToast("Replaced selected image.", "success");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

  const renderSocialSingleImage = (item: ImageFileItem): Promise<{ size: number; width: number; height: number; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize 2D canvas context"));
          return;
        }

        // Set high-res target bounds
        canvas.width = activePreset.width;
        canvas.height = activePreset.height;

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Compute positioning factors
        const zoomFactor = zoom / 100;
        const targetW = activePreset.width;
        const targetH = activePreset.height;
        const nativeW = img.naturalWidth;
        const nativeH = img.naturalHeight;

        let renderW = targetW;
        let renderH = targetH;

        if (cropFit === "cover") {
          const ratioTarget = targetW / targetH;
          const ratioNative = nativeW / nativeH;
          if (ratioNative > ratioTarget) {
            // Native is wider than target
            renderH = targetH;
            renderW = targetH * ratioNative;
          } else {
            // Native is taller than target
            renderW = targetW;
            renderH = targetW / ratioNative;
          }
        } else {
          // Fit mode
          const ratioTarget = targetW / targetH;
          const ratioNative = nativeW / nativeH;
          if (ratioNative > ratioTarget) {
            renderW = targetW;
            renderH = targetW / ratioNative;
          } else {
            renderH = targetH;
            renderW = targetH * ratioNative;
          }
        }

        // Apply scale zoom
        renderW *= zoomFactor;
        renderH *= zoomFactor;

        // Alignment coordinates
        const cX = (targetW - renderW) / 2 + (offsetX / 100) * targetW;
        const cY = (targetH - renderH) / 2 + (offsetY / 100) * targetH;

        ctx.drawImage(img, cX, cY, renderW, renderH);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Social render blob failed"));
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
          "image/jpeg",
          0.92
        );
      };
      img.onerror = () => reject(new Error("Failed to load source image onto social processor"));
      img.src = item.originalDataUrl;
    });
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
          const processed = await renderSocialSingleImage(item);
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
            error: err.message || "Failed to render social crop"
          } : f));
        }

        setProcessingPercentage(Math.round(((i + 1) / files.length) * 100));
      }

      setRemainingFiles(0);
      onAddToast("Batch social resizing completed successfully!", "success");
    } finally {
      // Always release the processing state so downloads become available.
      setIsProcessing(false);
      setCurrentProcessingName("");
    }
  };

  const handleDownloadSingle = () => {
    const item = files[selectedIndex];
    if (!item || !item.processedDataUrl) return;

    const link = document.createElement("a");
    link.href = item.processedDataUrl;
    link.download = item.name.replace(/\.[^/.]+$/, "") + `_${activePreset.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Social Resizer");
  };

  const handleDownloadZip = async () => {
    const processedFiles = files.filter(f => f.processedDataUrl);
    if (processedFiles.length === 0) return;

    const zip = new JSZip();

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      if (item.processedDataUrl) {
        const base64Data = item.processedDataUrl.split(",")[1];
        zip.file(item.name.replace(/\.[^/.]+$/, "") + `_${activePreset.id}.jpg`, base64Data, { base64: true });
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `gainutility_${activePreset.id}_pack.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      onAddToast("Compiled batch package ZIP!", "success");
    } catch (err) {
      onAddToast("Failed to compile ZIP pack.", "error");
    }
  };

  const faqs = [
    {
      question: "What is Social Safe Zone protection?",
      answer: "Platforms like YouTube or TikTok place UI buttons (like comments, likes, or subtitles) on top of your visuals. Our tools scale and align your files inside the native bounding limits, preventing essential graphical text from being cut off."
    },
    {
      question: "Which formats and platforms are pre-loaded?",
      answer: "We support pre-configured presets for Instagram, Facebook, LinkedIn, YouTube, TikTok, Pinterest, and Twitter (X) with standard ratios. Outputs are compressed with highly-optimized 92% JPEG ratios."
    },
    {
      question: "What does BG Margin Fill do?",
      answer: "If you select Fit Mode, empty margins occur on the sides or top. You can choose any custom hex color or slate color to fill these margins with no visible gaps."
    }
  ];

  const features = [
    {
      title: "Dual Alignment Options",
      desc: "Toggle Cover mode (fills target frame) vs Fit mode (preserves original dimensions with custom filled backdrops).",
      icon: <Crop className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Live Placement Controls",
      desc: "Perfect your alignment with a click-and-drag artboard, corner resize handles, zoom and X/Y shifting variables.",
      icon: <Sliders className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Unified Platform Presets",
      desc: "13+ standard resolutions across major social properties updated for high density screens.",
      icon: <Layers className="w-5 h-5 text-brand-primary" />
    }
  ];

  const howItWorks = [
    "Upload image files or paste clips into our 100% offline uploader.",
    "Choose a social preset target like YouTube Video Thumbnail or Instagram Story.",
    "Adjust alignment factors (Zoom, Position offsets, and Background margins).",
    "Run processing to render your high fidelity post templates, download instantly, or handoff to compression."
  ];

  const hasProcessedFiles = files.some(f => f.processedDataUrl);
  const selectedItem = files[selectedIndex];

  // Collapse settings when processing completes
  useEffect(() => {
    if (hasProcessedFiles && !isProcessing) {
      setSettingsExpanded(false);
    }
  }, [hasProcessedFiles, isProcessing]);

  // Presets grouped by platform for the picker
  const presetGroups = SOCIAL_PRESETS.reduce<Record<string, PresetItem[]>>((acc, p) => {
    (acc[p.platform] = acc[p.platform] || []).push(p);
    return acc;
  }, {});

  let targetStatus = { pass: true, label: "Full resolution match" };
  let finalDims = "—";
  let finalSize = "Hit Generate";
  if (selectedItem) {
    const fullRes = selectedItem.originalWidth >= activePreset.width && selectedItem.originalHeight >= activePreset.height;
    targetStatus = fullRes
      ? { pass: true, label: "Full resolution match" }
      : { pass: false, label: `Upscaled from ${selectedItem.originalWidth}×${selectedItem.originalHeight}` };
    if (selectedItem.processedDataUrl) {
      finalDims = `${selectedItem.processedWidth} × ${selectedItem.processedHeight}`;
      finalSize = formatBytes(selectedItem.processedSize);
    }
  }
  const originalFormat = selectedItem?.file?.type?.split("/")[1]?.toUpperCase() || "IMAGE";

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
      ) : selectedItem ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 space-y-5 min-w-0">
            {/* File strip header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
                Loaded Files ({files.length})
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-border-light bg-surface-base hover:bg-surface-muted text-text-main transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Replace selected</span>
                  <input id="social-replace-input" type="file" accept="image/*" className="sr-only" onChange={handleReplaceSelected} />
                </label>
              </div>
            </div>

            <FileStrip
              files={files}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              onRemoveFile={handleRemoveFile}
              onAddClick={() => document.getElementById("social-add-input")?.click()}
            />
            <input id="social-add-input" type="file" multiple accept="image/*" className="sr-only" onChange={handleAddFilesInput} />

            {/* Interactive artboard preview */}
            <SocialCanvas
              imageUrl={selectedItem.originalDataUrl}
              preset={activePreset}
              cropFit={cropFit}
              zoom={zoom}
              offsetX={offsetX}
              offsetY={offsetY}
              bgColor={bgColor}
              onZoomChange={handleZoomChange}
              onOffsetChange={handleOffsetChange}
            />

            {/* Before / after summary */}
            <div className="bg-surface-base border border-border-light rounded-[18px] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">Output Details</h4>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  targetStatus.pass ? "bg-status-success/10 text-status-success" : "bg-status-warning/10 text-status-warning"
                }`}>
                  {targetStatus.pass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {targetStatus.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl bg-surface-muted/60 border border-border-light/60 px-3 py-2.5 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-mono font-semibold">Original</p>
                  <p className="text-sm font-bold text-text-main mt-0.5 break-words">{selectedItem.originalWidth} × {selectedItem.originalHeight}</p>
                  <p className="text-[10px] text-brand-primary font-semibold mt-0.5">{formatBytes(selectedItem.originalSize)}</p>
                </div>
                <div className="rounded-xl bg-surface-muted/60 border border-border-light/60 px-3 py-2.5 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-mono font-semibold">Target</p>
                  <p className="text-sm font-bold text-text-main mt-0.5 break-words">{activePreset.width} × {activePreset.height}</p>
                  <p className="text-[10px] text-brand-primary font-semibold mt-0.5">{activePreset.aspectRatio} ratio</p>
                </div>
                <div className="rounded-xl bg-surface-muted/60 border border-border-light/60 px-3 py-2.5 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-mono font-semibold">Final output</p>
                  <p className="text-sm font-bold text-text-main mt-0.5 break-words">{finalDims}</p>
                  <p className="text-[10px] text-brand-primary font-semibold mt-0.5">{finalSize}</p>
                </div>
                <div className="rounded-xl bg-surface-muted/60 border border-border-light/60 px-3 py-2.5 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted font-mono font-semibold">Format</p>
                  <p className="text-sm font-bold text-text-main mt-0.5 break-words">{selectedItem.processedDataUrl ? "JPEG" : originalFormat}</p>
                  <p className="text-[10px] text-brand-primary font-semibold mt-0.5">{selectedItem.processedDataUrl ? "92% quality" : "Will export as JPEG"}</p>
                </div>
              </div>
            </div>

            {isProcessing && (
              <UniversalProcessingPanel
                isProcessing={isProcessing}
                percentage={processingPercentage}
                currentFileName={currentProcessingName}
                remainingCount={remainingFiles}
                totalCount={files.length}
              />
            )}

            {hasProcessedFiles && !isProcessing && (
              <UniversalDownloadPanel
                files={files}
                onDownloadSingle={handleDownloadSingle}
                onDownloadZip={handleDownloadZip}
                onClearAll={() => setFiles([])}
                onAddToast={onAddToast}
                outputType={`${activePreset.platform} Post (${activePreset.width}×${activePreset.height})`}
                zipLabel="Download Batch ZIP"
                clearLabel="Resize another"
              />
            )}
          </div>

          <div className="xl:col-span-4 space-y-6 min-w-0">
            <UniversalSettingsPanel
              title="Social Post Options"
              subtitle="Pick a platform preset, then fine-tune the fit"
              collapsible={hasProcessedFiles && !isProcessing}
              collapsed={!settingsExpanded && hasProcessedFiles && !isProcessing}
              onToggleCollapse={() => setSettingsExpanded(prev => !prev)}
            >
              <div className="space-y-5">
                {/* Preset picker grouped by platform */}
                <div className="space-y-4">
                  {Object.entries(presetGroups).map(([platform, presets]) => (
                    <div key={platform}>
                      <p className="text-[11px] font-bold text-text-sub mb-1.5 flex items-center gap-1.5">
                        <span className="text-brand-primary">{presets[0].icon}</span>
                        {platform}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {presets.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handlePresetChange(p)}
                            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer min-w-0 ${
                              activePreset.id === p.id
                                ? "border-brand-primary bg-brand-primary-light/30 ring-1 ring-brand-primary/30"
                                : "border-border-light bg-surface-base hover:bg-surface-muted hover:border-border-medium"
                            }`}
                          >
                            <span className="block text-[11px] font-bold text-text-main leading-tight break-words">{p.name}</span>
                            <span className="block text-[10px] font-mono text-text-muted mt-0.5 break-words">{p.width} × {p.height} px</span>
                            <span className="block text-[9px] font-mono text-brand-primary/80 mt-0.5">{p.aspectRatio}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fitting rule */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Fitting Rule</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "cover", label: "Crop & Fill Frame" },
                      { id: "fit", label: "Fit within Box" }
                    ].map(rule => (
                      <button
                        key={rule.id}
                        onClick={() => handleFitChange(rule.id as "cover" | "fit")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-w-0 ${
                          cropFit === rule.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-surface-base hover:bg-surface-muted border-border-light text-text-main"
                        }`}
                      >
                        {rule.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-muted">Zoom Control</span>
                    <span className="text-brand-primary font-mono font-bold">{zoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={e => handleZoomChange(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-text-disabled">
                    <span>50%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Position</label>
                    <button
                      onClick={resetAdjustments}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      <Crosshair className="w-3 h-3" />
                      Center
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-muted w-3 shrink-0">X</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={offsetX}
                        onChange={e => handleOffsetChange(parseInt(e.target.value), offsetY)}
                        className="w-full accent-brand-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-muted w-3 shrink-0">Y</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={offsetY}
                        onChange={e => handleOffsetChange(offsetX, parseInt(e.target.value))}
                        className="w-full accent-brand-primary"
                      />
                    </div>
                  </div>
                </div>

                {cropFit === "fit" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-sub">Background Margin Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={e => {
                          setBgColor(e.target.value);
                          invalidateOutput();
                        }}
                        className="w-10 h-9 cursor-pointer rounded border border-border-light shrink-0"
                      />
                      <span className="text-xs font-mono text-text-muted">{bgColor}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={processImages}
                  disabled={isProcessing}
                  className="w-full justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  {isProcessing ? "Rendering..." : "Generate Social Presets"}
                </Button>
              </div>
            </UniversalSettingsPanel>
          </div>
        </div>
      ) : null}

      {/* Related tools — strictly after the download action, never before it. */}
      {hasProcessedFiles && !isProcessing && (
        <ContinueEditing
          currentToolId="social-resizer"
          files={files}
          onAddToast={onAddToast}
          onChangeView={onChangeView}
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