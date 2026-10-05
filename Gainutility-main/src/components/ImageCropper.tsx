import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2,
  RefreshCw,
  Grid,
  Move,
  Download
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
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface ImageCropperProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

type DragHandle =
  | "move"
  | "nw" | "n" | "ne"
  | "e"
  | "se" | "s" | "sw"
  | "w"
  | null;

export const ImageCropper: React.FC<ImageCropperProps> = ({
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

  // Crop parameters
  const [aspectRatio, setAspectRatio] = useState<"free" | "1:1" | "16:9" | "4:3" | "2:3">("free");
  const [rotation, setRotation] = useState(0);

  // Crop region percentage coordinates
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/png");

  // Interactive drag state
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    startY: number;
    startCropX: number;
    startCropY: number;
    startCropW: number;
    startCropH: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Keep crop aspect ratio synced if preset is clicked.
  useEffect(() => {
    const item = files[selectedIndex];
    const imgW = item?.originalWidth || 0;
    const imgH = item?.originalHeight || 0;
    if (!imgW || !imgH) return;

    const ratios: Record<string, number> = { "1:1": 1, "16:9": 16 / 9, "4:3": 4 / 3, "2:3": 2 / 3 };
    const r = ratios[aspectRatio];
    if (!r) return;

    let wFrac = cropW / 100;
    let hFrac = (wFrac * imgW / r) / imgH;
    if (hFrac > 1) {
      hFrac = 1;
      wFrac = (hFrac * imgH * r) / imgW;
      setCropX(prev => Math.min(prev, 100 - Math.round(wFrac * 100)));
    }
    setCropH(Math.max(5, Math.round(hFrac * 100)));
    setCropW(Math.max(5, Math.round(wFrac * 100)));
  }, [aspectRatio]);

  const handleFilesAdded = async (rawFiles: File[]) => {
    const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
    if (loadedItems.length > 0) {
      setFiles([loadedItems[0]]);
      setSelectedIndex(0);
      onAddToast(`Loaded image "${loadedItems[0].name}"!`, "success");
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setSelectedIndex(0);
    setRotation(0);
    setCropX(10);
    setCropY(10);
    setCropW(80);
    setCropH(80);
    setAspectRatio("free");
  };

  // ── Interactive Drag Handlers ──────────────────────────────────────
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const handleDragStart = useCallback((handle: DragHandle, e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : "clientX" in e ? e.clientX : 0;
    const clientY = "touches" in e ? e.touches[0].clientY : "clientY" in e ? e.clientY : 0;
    dragRef.current = {
      handle,
      startX: clientX,
      startY: clientY,
      startCropX: cropX,
      startCropY: cropY,
      startCropW: cropW,
      startCropH: cropH,
    };
    setIsDragging(true);

    // Capture pointer on the target element for reliable drag tracking
    if ("pointerId" in e && typeof e.currentTarget?.setPointerCapture === "function") {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, [cropX, cropY, cropW, cropH]);

  useEffect(() => {
    if (!isDragging || !dragRef.current) return;

    const handleMove = (e: PointerEvent) => {
      if (!dragRef.current || !wrapperRef.current) return;
      const d = dragRef.current;
      const clientX = e.clientX;
      const clientY = e.clientY;

      const rect = wrapperRef.current.getBoundingClientRect();
      const dxPct = ((clientX - d.startX) / rect.width) * 100;
      const dyPct = ((clientY - d.startY) / rect.height) * 100;

      const minSize = 5;
      const arLocked = aspectRatio !== "free";
      const ratios: Record<string, number> = { "1:1": 1, "16:9": 16 / 9, "4:3": 4 / 3, "2:3": 2 / 3 };
      const ar = arLocked ? ratios[aspectRatio] : null;

      if (d.handle === "move") {
        let newX = d.startCropX + dxPct;
        let newY = d.startCropY + dyPct;
        newX = clamp(newX, 0, 100 - d.startCropW);
        newY = clamp(newY, 0, 100 - d.startCropH);
        setCropX(newX);
        setCropY(newY);
        return;
      }

      let newX = d.startCropX;
      let newY = d.startCropY;
      let newW = d.startCropW;
      let newH = d.startCropH;

      // Handle horizontal changes
      if (d.handle.includes("e")) {
        newW = clamp(d.startCropW + dxPct, minSize, 100 - d.startCropX);
      }
      if (d.handle.includes("w")) {
        const rawW = d.startCropW - dxPct;
        newW = clamp(rawW, minSize, d.startCropX + d.startCropW);
        newX = d.startCropX + (d.startCropW - newW);
      }

      // Handle vertical changes
      if (d.handle.includes("s")) {
        newH = clamp(d.startCropH + dyPct, minSize, 100 - d.startCropY);
      }
      if (d.handle.includes("n")) {
        const rawH = d.startCropH - dyPct;
        newH = clamp(rawH, minSize, d.startCropY + d.startCropH);
        newY = d.startCropY + (d.startCropH - newH);
      }

      // Enforce aspect ratio
      if (ar) {
        if (d.handle === "e" || d.handle === "w") {
          newH = newW / ar;
        } else {
          newW = newH * ar;
        }
        // Clamp after AR enforcement
        newW = clamp(newW, minSize, 100);
        newH = clamp(newH, minSize, 100);
        newX = clamp(newX, 0, 100 - newW);
        newY = clamp(newY, 0, 100 - newH);
      }

      setCropX(Math.round(newX * 10) / 10);
      setCropY(Math.round(newY * 10) / 10);
      setCropW(Math.round(newW * 10) / 10);
      setCropH(Math.round(newH * 10) / 10);
    };

    const handleUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    // Prevent default drag behavior on images
    const preventDrag = (e: Event) => e.preventDefault();

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    window.addEventListener("dragstart", preventDrag);
    document.body.style.userSelect = "none";
    document.body.style.cursor = dragRef.current?.handle === "move" ? "move" : "nwse-resize";

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("dragstart", preventDrag);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, aspectRatio]);

  const applyCrop = () => {
    const item = files[selectedIndex];
    if (!item) return;

    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isProcessing: true } : f));

    const finish = () => {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isProcessing: false } : f));
    };

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            onAddToast("Could not configure Canvas context.", "error");
            finish();
            return;
          }

          const absX = Math.round(img.naturalWidth * (cropX / 100));
          const absY = Math.round(img.naturalHeight * (cropY / 100));
          const absW = Math.max(1, Math.round(img.naturalWidth * (cropW / 100)));
          const absH = Math.max(1, Math.round(img.naturalHeight * (cropH / 100)));

          canvas.width = absW;
          canvas.height = absH;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          if (rotation !== 0) {
            ctx.fillStyle = outputFormat === "image/jpeg" ? "#FFFFFF" : "transparent";
            if (outputFormat === "image/jpeg") {
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(
              img,
              absX, absY, absW, absH,
              -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
            );
          } else {
            ctx.drawImage(img, absX, absY, absW, absH, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                onAddToast("Couldn't export the cropped image. Try a different format.", "error");
                finish();
                return;
              }

              const reader = new FileReader();
              reader.onloadend = () => {
                setFiles(prev => prev.map(f => f.id === item.id ? {
                  ...f,
                  processedSize: blob.size,
                  processedWidth: canvas.width,
                  processedHeight: canvas.height,
                  processedDataUrl: reader.result as string,
                  isProcessing: false
                } : f));
                onAddToast("Image cropped successfully!", "success");
              };
              reader.onerror = () => {
                onAddToast("Couldn't read the cropped result.", "error");
                finish();
              };
              reader.readAsDataURL(blob);
            },
            outputFormat,
            1.0
          );
        } catch (err: any) {
          onAddToast(`Crop failed: ${err?.message || "Unknown error"}`, "error");
          finish();
        }
      };
      img.onerror = () => {
        onAddToast("Couldn't load this image for cropping. Try re-uploading it.", "error");
        finish();
      };
      img.src = item.originalDataUrl;
    }, 150);
  };

  const handleDownloadSingle = () => {
    const item = files[selectedIndex];
    if (!item || !item.processedDataUrl) return;

    const link = document.createElement("a");
    const ext = outputFormat.split("/")[1];
    link.href = item.processedDataUrl;
    link.download = item.name.replace(/\.[^/.]+$/, "") + `_cropped.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    postDownload.show("Image Cropper");
  };

  const selectedItem = files[selectedIndex];
  const isEditing = !!selectedItem && !selectedItem.processedDataUrl;

  // Drag handle style helpers
  const handleClass = "absolute z-20";
  const cornerSize = "w-4 h-4";
  const edgeSize = "w-full h-2.5";

  return (
    <div className="py-6 md:py-10 space-y-6">

      {files.length === 0 ? (
        <UniversalUploadComponent
          accept="image/*"
          supportedFormats="PNG, JPG, WEBP, AVIF"
          onFilesAdded={handleFilesAdded}
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Left: Visual editor */}
          <div className="xl:col-span-8 space-y-4">

            <Card
              title="Crop Image"
              subtitle="Drag the handles to adjust your crop area"
              actions={
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => document.getElementById("cropper-replace-input")?.click()}
                    className="px-2.5 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Replace
                  </button>
                  <input
                    id="cropper-replace-input"
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
              <div className="relative border border-border-light rounded-2xl overflow-hidden bg-[#121410] flex items-center justify-center min-h-[380px] md:min-h-[460px] max-h-[520px]">
                {selectedItem.isProcessing ? (
                  <div className="flex flex-col items-center gap-3 text-white" role="status" aria-live="polite">
                    <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                    <span className="text-xs font-mono">Cropping image...</span>
                  </div>
                ) : (
                  <div
                    ref={wrapperRef}
                    className="p-6 flex items-center justify-center max-w-full max-h-[460px] select-none"
                    style={{ touchAction: "none" }}
                  >
                    <div className="relative inline-flex max-w-full">
                      {/* Source Image */}
                      <img
                        src={selectedItem.processedDataUrl || selectedItem.originalDataUrl}
                        alt="Cropping View"
                        className="max-w-full max-h-[400px] object-contain rounded-md block pointer-events-none"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transition: isDragging ? "none" : "transform 0.15s ease-out"
                        }}
                        draggable={false}
                        referrerPolicy="no-referrer"
                      />

                      {/* Interactive Crop Overlay */}
                      {isEditing && (
                        <>
                          {/* Darkened area outside crop */}
                          <div
                            className="absolute inset-0 rounded-sm"
                            style={{
                              boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
                              left: `${cropX}%`,
                              top: `${cropY}%`,
                              width: `${cropW}%`,
                              height: `${cropH}%`,
                              pointerEvents: "none"
                            }}
                          />

                          {/* Crop region - draggable */}
                          <div
                            className="absolute border-2 border-brand-primary rounded-sm"
                            style={{
                              left: `${cropX}%`,
                              top: `${cropY}%`,
                              width: `${cropW}%`,
                              height: `${cropH}%`,
                              cursor: "move",
                              touchAction: "none",
                              transition: isDragging ? "none" : "all 0.1s ease-out"
                            }}
                            onPointerDown={(e) => handleDragStart("move", e)}
                          >
                            {/* Rule of thirds lines */}
                            <div className="absolute top-1/3 left-0 w-full h-[0.5px] bg-white/30 pointer-events-none" />
                            <div className="absolute top-2/3 left-0 w-full h-[0.5px] bg-white/30 pointer-events-none" />
                            <div className="absolute left-1/3 top-0 h-full w-[0.5px] bg-white/30 pointer-events-none" />
                            <div className="absolute left-2/3 top-0 h-full w-[0.5px] bg-white/30 pointer-events-none" />

                            {/* Corner drag handles */}
                            <div
                              className={`${handleClass} ${cornerSize} top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-brand-primary cursor-nw-resize shadow-md`}
                              onPointerDown={(e) => handleDragStart("nw", e)}
                            />
                            <div
                              className={`${handleClass} ${cornerSize} top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-brand-primary cursor-ne-resize shadow-md`}
                              onPointerDown={(e) => handleDragStart("ne", e)}
                            />
                            <div
                              className={`${handleClass} ${cornerSize} bottom-0 left-0 -translate-x-1/2 translate-y-1/2 bg-white rounded-full border-2 border-brand-primary cursor-sw-resize shadow-md`}
                              onPointerDown={(e) => handleDragStart("sw", e)}
                            />
                            <div
                              className={`${handleClass} ${cornerSize} bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white rounded-full border-2 border-brand-primary cursor-se-resize shadow-md`}
                              onPointerDown={(e) => handleDragStart("se", e)}
                            />

                            {/* Edge drag handles */}
                            <div
                              className={`${handleClass} left-1/2 -translate-x-1/2 -top-1.5 w-8 h-3 bg-white rounded-full border-2 border-brand-primary cursor-n-resize shadow-md flex items-center justify-center`}
                              onPointerDown={(e) => handleDragStart("n", e)}
                            />
                            <div
                              className={`${handleClass} left-1/2 -translate-x-1/2 -bottom-1.5 w-8 h-3 bg-white rounded-full border-2 border-brand-primary cursor-s-resize shadow-md flex items-center justify-center`}
                              onPointerDown={(e) => handleDragStart("s", e)}
                            />
                            <div
                              className={`${handleClass} top-1/2 -translate-y-1/2 -left-1.5 w-3 h-8 bg-white rounded-full border-2 border-brand-primary cursor-w-resize shadow-md flex items-center justify-center`}
                              onPointerDown={(e) => handleDragStart("w", e)}
                            />
                            <div
                              className={`${handleClass} top-1/2 -translate-y-1/2 -right-1.5 w-3 h-8 bg-white rounded-full border-2 border-brand-primary cursor-e-resize shadow-md flex items-center justify-center`}
                              onPointerDown={(e) => handleDragStart("e", e)}
                            />

                            {/* Dimensions label */}
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                              {Math.round(selectedItem.originalWidth * cropW / 100)} × {Math.round(selectedItem.originalHeight * cropH / 100)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Download panel */}
            {selectedItem.processedDataUrl && (
              <div className="space-y-4">
                <UniversalDownloadPanel
                  onDownloadSingle={handleDownloadSingle}
                  onClearAll={handleClearAll}
                  hasMultiple={false}
                  outputType="Cropped Image"
                  files={[selectedItem]}
                  onAddToast={onAddToast}
                />

                <ContinueEditing
                  currentToolId="image-cropper"
                  files={files}
                  onChangeView={onChangeView}
                  onAddToast={onAddToast}
                />
              </div>
            )}

          </div>

          {/* Right: Controls */}
          <div className="xl:col-span-4">
            <UniversalSettingsPanel
              title="Crop Settings"
              subtitle="Adjust aspect ratio, rotation, and output"
              onReset={() => {
                setAspectRatio("free");
                setRotation(0);
                setCropX(10);
                setCropY(10);
                setCropW(80);
                setCropH(80);
              }}
            >
              <div className="space-y-4">
                <label className="text-xs font-sans font-black tracking-wider uppercase text-text-muted">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["free", "1:1", "16:9", "4:3", "2:3"] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => setAspectRatio(preset)}
                      className={`py-2 px-1 text-[11px] font-black rounded-xl border text-center uppercase transition-all cursor-pointer ${
                        aspectRatio === preset
                          ? "bg-brand-primary border-brand-primary text-white shadow-premium-sm"
                          : "bg-surface-base border-border-light text-text-sub hover:border-brand-primary"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop position (for fine-tuning) */}
              <div className="space-y-3 bg-surface-muted/35 p-4 rounded-xl border border-border-light/60">
                <span className="text-xs font-bold text-text-muted block border-b border-border-light pb-2 flex items-center gap-2">
                  <Move className="w-4 h-4 text-brand-primary" /> Position & Size
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-text-sub">
                      <span>X</span>
                      <span>{Math.round(cropX)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100 - cropW}
                      value={cropX}
                      onChange={(e) => setCropX(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer h-1.5"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-text-sub">
                      <span>Y</span>
                      <span>{Math.round(cropY)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100 - cropH}
                      value={cropY}
                      onChange={(e) => setCropY(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer h-1.5"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-text-sub">
                      <span>W</span>
                      <span>{Math.round(cropW)}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max={100 - cropX}
                      value={cropW}
                      onChange={(e) => setCropW(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer h-1.5"
                      disabled={!isEditing}
                    />
                  </div>
                  {aspectRatio === "free" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-text-sub">
                        <span>H</span>
                        <span>{Math.round(cropH)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max={100 - cropY}
                        value={cropH}
                        onChange={(e) => setCropH(Number(e.target.value))}
                        className="w-full accent-brand-primary cursor-pointer h-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-sans font-black tracking-wider uppercase text-text-muted">
                    Rotation
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-primary">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer h-1.5"
                  disabled={!isEditing}
                />
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-black tracking-wider uppercase text-text-muted block">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e: any) => setOutputFormat(e.target.value)}
                  className="w-full bg-surface-muted hover:bg-surface-base border border-border-light text-text-main font-semibold text-sm px-4 py-2.5 rounded-xl outline-none focus:border-brand-primary cursor-pointer transition-colors"
                >
                  <option value="image/png">PNG - Alpha preserved</option>
                  <option value="image/jpeg">JPEG - Standard</option>
                  <option value="image/webp">WebP - Optimized</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  onClick={applyCrop}
                  className="w-full justify-center gap-2"
                  disabled={!isEditing}
                >
                  Crop Image
                </Button>
              </div>
            </UniversalSettingsPanel>
          </div>

        </div>
      )}

      {/* Mobile sticky download bar */}
      <StickyMobileAction visible={!!selectedItem?.processedDataUrl}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">
              {selectedItem?.processedSize
                ? `${formatBytes(selectedItem.originalSize)} → ${formatBytes(selectedItem.processedSize)}`
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
