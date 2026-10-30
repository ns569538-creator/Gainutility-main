/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Trash2, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  ArrowLeftRight, 
  Maximize2, 
  Eye, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { Button, Card, StickyMobileAction } from "./Common";
import { UniversalUploadComponent, ImageFileItem, UniversalDownloadPanel, processRawImageFiles } from "./ImageToolFramework";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

export default function ImageUpscaler({
  onCopy,
  onAddToast,
  onChangeView
}: {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: any) => void;
}) {
  const postDownload = usePostDownload();
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [denoiseLevel, setDenoiseLevel] = useState<"none" | "low" | "medium" | "high">("medium");
  const [sharpenFactor, setSharpenFactor] = useState<number>(3); // 0 to 10
  
  // Interactive Slider Split coordinates
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSliderRef = useRef<boolean>(false);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const selectedItem = files[0];

  const handleClear = () => {
    setFiles([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setProgress(0);
    setSliderPosition(50);
  };

  const handleClearAll = () => {
    handleClear();
  };

  const handleFilesAdded = async (rawFiles: File[]) => {
    const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
    if (loadedItems.length > 0) {
      setFiles([loadedItems[0]]);
      setIsCompleted(false);
    }
  };

  // Perform upscale pipeline for real: resample -> optional denoise -> optional sharpen.
  // Progress updates are interleaved with event-loop yields so the bar paints during heavy work.
  const processUpscale = async () => {
    if (!selectedItem || isProcessing) return;
    setIsProcessing(true);
    setIsCompleted(false);
    setProgress(5);

    const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not decode image"));
        el.src = selectedItem.originalDataUrl;
      });

      const targetW = img.width * upscaleFactor;
      const targetH = img.height * upscaleFactor;

      // Guard against absurd allocations (e.g. 40MP source at 4x = 640MP).
      if (targetW * targetH > 80_000_000) {
        throw new Error("Output would exceed 80 megapixels - use a smaller source or 2x.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      setProgress(15);
      await yieldToUi();

      // Step 1 - high quality interpolation resize.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);
      let imgData = ctx.getImageData(0, 0, targetW, targetH);

      setProgress(45);
      await yieldToUi();

      // Step 2 - edge-aware local denoise.
      if (denoiseLevel !== "none") {
        const levelVal = denoiseLevel === "low" ? 1 : denoiseLevel === "medium" ? 2 : 3;
        imgData = applyDenoiseBilateral(imgData, levelVal);
      }

      setProgress(70);
      await yieldToUi();

      // Step 3 - unsharp-mask style sharpening.
      if (sharpenFactor > 0) {
        imgData = applyHighpassSharpen(imgData, sharpenFactor / 10);
      }

      ctx.putImageData(imgData, 0, 0);

      // Preserve the source format family so transparency never silently dies.
      const wasJpeg = selectedItem.originalDataUrl.startsWith("data:image/jpeg");
      const mime = wasJpeg ? "image/jpeg" : "image/png";
      const upscaledUrl = canvas.toDataURL(mime, 0.95);

      // Real byte length of the produced file (base64 encodes ~3 bytes per 4 chars).
      const base64Len = upscaledUrl.split(",")[1]?.length ?? 0;
      const approxSize = Math.floor(base64Len * 0.75);

      setFiles(prev => prev.map((f, i) => i === 0 ? {
        ...f,
        processedSize: approxSize,
        processedWidth: targetW,
        processedHeight: targetH,
        processedDataUrl: upscaledUrl
      } : f));

      setProgress(100);
      setIsCompleted(true);
      onAddToast("Image upscaled successfully!", "success");
    } catch (err: any) {
      onAddToast(`Upscaling error: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Edge-aware local noise reduction (smooths similar colors, preserves borders).
  const applyDenoiseBilateral = (imgData: ImageData, radius: number): ImageData => {
    const width = imgData.width;
    const height = imgData.height;
    const input = imgData.data;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext("2d")!;
    const outputImgData = outputCtx.createImageData(width, height);
    const output = outputImgData.data;

    // Start as an exact copy so untouched pixels (borders) stay valid
    // instead of degrading to transparent black.
    output.set(input);

    // Apply 3x3 or 5x5 neighborhood smoothing
    const step = radius === 1 ? 1 : 2;

    for (let y = step; y < height - step; y++) {
      for (let x = step; x < width - step; x++) {
        const centerIdx = (y * width + x) * 4;
        const cr = input[centerIdx];
        const cg = input[centerIdx+1];
        const cb = input[centerIdx+2];

        let sumR = 0, sumG = 0, sumB = 0, weightSum = 0;

        for (let dy = -step; dy <= step; dy++) {
          for (let dx = -step; dx <= step; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const r = input[idx];
            const g = input[idx+1];
            const b = input[idx+2];

            // Color proximity threshold: preserve strong edges
            const colorDist = Math.sqrt(Math.pow(r-cr,2) + Math.pow(g-cg,2) + Math.pow(b-cb,2));
            if (colorDist < 45) {
              const weight = 1.0 - (colorDist / 45);
              sumR += r * weight;
              sumG += g * weight;
              sumB += b * weight;
              weightSum += weight;
            }
          }
        }

        const targetIdx = (y * width + x) * 4;
        if (weightSum > 0) {
          output[targetIdx] = sumR / weightSum;
          output[targetIdx+1] = sumG / weightSum;
          output[targetIdx+2] = sumB / weightSum;
        } else {
          output[targetIdx] = cr;
          output[targetIdx+1] = cg;
          output[targetIdx+2] = cb;
        }
        output[targetIdx+3] = input[targetIdx+3]; // Copy alpha
      }
    }
    return outputImgData;
  };

  // Highpass edge sharpening filter
  const applyHighpassSharpen = (imgData: ImageData, factor: number): ImageData => {
    const width = imgData.width;
    const height = imgData.height;
    const input = imgData.data;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext("2d")!;
    const outputImgData = outputCtx.createImageData(width, height);
    const output = outputImgData.data;

    // Preserve untouched pixels (borders) instead of leaving them transparent.
    output.set(input);

    const kernel = [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * width + x) * 4 + c;
          
          const val = 
            5 * input[idx] -
            input[((y - 1) * width + x) * 4 + c] -
            input[((y + 1) * width + x) * 4 + c] -
            input[(y * width + (x - 1)) * 4 + c] -
            input[(y * width + (x + 1)) * 4 + c];

          const blended = input[idx] * (1 - factor) + val * factor;
          output[idx] = Math.max(0, Math.min(255, blended));
        }
        output[(y * width + x) * 4 + 3] = input[(y * width + x) * 4 + 3];
      }
    }
    return outputImgData;
  };

  // Split-screen drag handles (pointer events cover mouse, touch, and pen)
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, pos)));
  };

  const handlePointerDownSlider = (e: React.PointerEvent) => {
    isDraggingSliderRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    handleSliderMove(e.clientX);
  };

  const handlePointerMoveSlider = (e: React.PointerEvent) => {
    if (!isDraggingSliderRef.current) return;
    handleSliderMove(e.clientX);
  };

  const handlePointerUpSlider = () => {
    isDraggingSliderRef.current = false;
  };

  const handleDownloadSingle = () => {
    if (!selectedItem?.processedDataUrl) return;
    const ext = selectedItem.processedDataUrl.startsWith("data:image/jpeg") ? "jpg" : "png";
    const link = document.createElement("a");
    link.download = `enhanced_${upscaleFactor}x_${selectedItem.name.split(".")[0] || "image"}.${ext}`;
    link.href = selectedItem.processedDataUrl;
    link.click();
    onAddToast("Enhanced image saved successfully!", "success");
    postDownload.show("Image Upscaler");
  };

return (
    <div className="space-y-6">
      {/* Primary Workspace Panel */}
      {files.length === 0 ? (
        <UniversalUploadComponent
          onFilesAdded={handleFilesAdded}
          accept="image/*"
          supportedFormats="PNG, JPG, WEBP, AVIF"
          maxSizeText="40MB"
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: Live Interactive Compare Slider Stage */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border-light bg-surface-base px-5 py-3 rounded-[20px]">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted text-text-sub border border-border-light font-mono font-bold">
                  Original: {selectedItem.originalWidth}x{selectedItem.originalHeight}px
                </span>
                {isCompleted && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary-light text-brand-primary border border-brand-primary/10 font-mono font-black animate-bounce">
                    Upscaled: {selectedItem.processedWidth}x{selectedItem.processedHeight}px
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => document.getElementById("upscaler-replace-input")?.click()}
                  className="px-2.5 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors"
                >
                  Replace File
                </button>
                <input
                  id="upscaler-replace-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFilesAdded([e.target.files[0]]);
                    }
                  }}
                  className="hidden"
                />

                <Button variant="outline" size="sm" onClick={handleClearAll} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remove File
                </Button>
              </div>
            </div>

            {/* Split Screen Before/After Swipe Slider Container */}
            <div 
              ref={containerRef}
              onPointerMove={handlePointerMoveSlider}
              onPointerUp={handlePointerUpSlider}
              onPointerLeave={handlePointerUpSlider}
              className="relative border border-border-light rounded-[24px] bg-[#11130e] flex items-center justify-center min-h-[380px] md:min-h-[460px] overflow-hidden p-2 select-none"
            >
              {!isCompleted ? (
                /* RAW PRE-PROCESSED STATE */
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                  <div className="border border-white/10 rounded-lg overflow-hidden max-h-[300px] shadow-2xl bg-[#1b1c19]">
                    <img
                      src={selectedItem.originalDataUrl}
                      alt="Source for Upscaling"
                      className="max-h-[300px] w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs text-text-muted">Ready to enlarge image by {upscaleFactor}x with noise-reduction.</p>
                  <Button 
                    variant="primary" 
                    onClick={processUpscale}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="w-full max-w-[200px]"
                  >
                    Upscale Image
                  </Button>
                </div>
              ) : (
                /* INTERACTIVE SPLIT SCREEN COMPARE SLIDER */
                <div 
                  className="relative w-full h-[400px] md:h-[440px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-white/10"
                  onPointerDown={handlePointerDownSlider}
                >
                  {/* Left Layer: ENHANCED (Behind, revealed by mask) */}
                  <div className="absolute inset-0 w-full h-full bg-[#1b1c19]">
                    <img 
                      src={selectedItem.processedDataUrl} 
                      alt="Upscaled View" 
                      className="w-full h-full object-contain pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Right Layer: ORIGINAL (Positioned on top, width controlled by sliderPosition) */}
                  <div 
                    className="absolute inset-y-0 right-0 h-full overflow-hidden bg-[#1b1c19] border-l border-white/40"
                    style={{ width: `${100 - sliderPosition}%` }}
                  >
                    {/* Mirror original image content horizontally positioned to align perfectly */}
                    <img 
                      src={selectedItem.originalDataUrl} 
                      alt="Original View" 
                      className="absolute right-0 top-0 h-full object-contain pointer-events-none"
                      style={{ 
                        width: containerRef.current?.getBoundingClientRect().width, 
                        maxWidth: "none" 
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Visual Swipe Separator Drag Handle */}
                  <div 
                    role="slider"
                    tabIndex={0}
                    aria-label="Compare position between enhanced and original image"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(sliderPosition)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setSliderPosition((p) => Math.max(0, p - 5));
                      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setSliderPosition((p) => Math.min(100, p + 5));
                      } else if (e.key === "Home") {
                        setSliderPosition(0);
                      } else if (e.key === "End") {
                        setSliderPosition(100);
                      }
                    }}
                    className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-8 h-8 bg-brand-primary rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-lg transform -translate-x-1/2">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Interactive Annotations */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase rounded-md shadow-md pointer-events-none tracking-wider">
                    Enhanced ({upscaleFactor}x)
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-[10px] font-black uppercase rounded-md shadow-md pointer-events-none tracking-wider">
                    Original Pixels
                  </div>
                </div>
              )}
            </div>

            {/* Progressive Processing Bar (real work runs between updates) */}
            {isProcessing && (
              <div className="space-y-2 border border-border-light p-5 rounded-[20px] bg-surface-base">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-brand-primary font-bold animate-pulse">Resampling &amp; filtering pixels...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Precise Adjustment Controls Panel */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Upscale Settings Options */}
            <Card title="Upscale Multiplier" subtitle="Select target resolution amplification factors.">
              <div className="grid grid-cols-2 gap-2">
                {([2, 4] as const).map((factor) => (
                  <button
                    key={factor}
                    onClick={() => {
                      setUpscaleFactor(factor);
                      setIsCompleted(false);
                    }}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      upscaleFactor === factor 
                        ? "border-brand-primary bg-brand-primary-light/40 font-black text-brand-primary" 
                        : "border-border-light hover:border-border-medium text-text-sub bg-surface-base"
                    }`}
                  >
                    <span className="text-xl font-sans font-black">{factor}x</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider">Enlarge</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Denoise and Anti-aliasing Cards */}
            <Card title="Noise Reduction" subtitle="Clean up pixel artifacts or compression blocks.">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["none", "low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setDenoiseLevel(level);
                        setIsCompleted(false);
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                        denoiseLevel === level 
                          ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" 
                          : "bg-surface-base border-border-light hover:border-border-medium text-text-sub"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Smooths jpeg compression grain blocks locally. Medium or High is recommended for old screenshots or photos.
                </p>
              </div>
            </Card>

            {/* Sharpen Edge Tuning */}
            <Card title="Edge Sharpener" subtitle="Re-synthesize contrast bounds around fine elements.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Edge Contrast Focus</span>
                    <span className="text-brand-primary">Level {sharpenFactor}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="10"
                    value={sharpenFactor}
                    onChange={(e) => {
                      setSharpenFactor(parseInt(e.target.value));
                      setIsCompleted(false);
                    }}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Highlights high-pass contours. High sharpening is great for reading blurred text or enhancing structural illustrations.
                </p>

                {isCompleted && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={processUpscale}
                    className="w-full"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Apply New Parameters
                  </Button>
                )}
              </div>
            </Card>

            {/* Download Panel */}
            {isCompleted && (
              <UniversalDownloadPanel
                onDownloadSingle={handleDownloadSingle}
                onClearAll={handleClearAll}
                hasMultiple={false}
                files={files}
                outputType={selectedItem.processedDataUrl?.startsWith("data:image/jpeg") ? "JPG" : "PNG"}
                originalSize={selectedItem.originalSize}
                processedSize={selectedItem.processedSize}
                onAddToast={onAddToast}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile sticky download bar */}
      <StickyMobileAction visible={isCompleted}>
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
}
