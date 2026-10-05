/**
 * Background Remover — AI-powered foreground segmentation using BEN2.
 *
 * Uses BEN2 (Background Erase Network) for high-quality subject isolation.
 * Model: onnx-community/BEN2-ONNX (MIT license) — see docs/MODEL_LICENSES.md
 * Inference: ONNX Runtime Web (WebGPU / WASM), running off the main thread
 * in a dedicated Web Worker so the UI stays responsive.
 *
 * Processing is entirely client-side. No images are uploaded.
 *
 * @license SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  RefreshCw,
  Eraser,
  Paintbrush,
  Undo,
  CheckCircle,
  Shield,
  FileImage,
  ChevronDown,
  X,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  MoveHorizontal,
  Copy as CopyIcon,
  Check,
} from "lucide-react";
import { Button, Card, StickyMobileAction } from "./Common";
import {
  UniversalUploadComponent,
  ImageFileItem,
  processRawImageFiles,
} from "./ImageToolFramework";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import {
  segmentImage,
  cancelSegmentation,
  disposeBackgroundRemover,
  detectBackend,
  type ProgressCallback,
} from "../lib/backgroundRemoverClient";

/* ------------------------------------------------------------------ */
/* Background presets                                                   */
/* ------------------------------------------------------------------ */

const GRADIENTS = [
  { name: "Sunset Calm", css: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)" },
  { name: "Fresh Mint", css: "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)" },
  { name: "Ocean Breeze", css: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)" },
  { name: "Deep Royal", css: "linear-gradient(135deg, #1e3c72 0%, #2a52be 100%)" },
  { name: "Soft Lavender", css: "linear-gradient(135deg, #e1eec3 0%, #f05053 100%)" },
  { name: "Cosmic Slate", css: "linear-gradient(135deg, #434343 0%, #000000 100%)" },
];

const PRESET_COLORS = [
  { name: "White", hex: "#ffffff" },
  { name: "Light Gray", hex: "#f3f4f6" },
  { name: "Chroma Green", hex: "#00ff00" },
  { name: "Corporate Blue", hex: "#007acc" },
  { name: "Midnight", hex: "#111827" },
];

const MAX_PIXELS = 50_000_000; // 50 megapixels hard limit
/** Safer cap for phones / low-memory devices where full-size canvases OOM. */
const MAX_PIXELS_WEAK_DEVICE = 16_000_000; // 16 megapixels hard limit
const PAINT_SNAPSHOT_MAX_PIXELS = 12_000_000; // undo snapshot cap (memory)

/**
 * Working-resolution cap for segmentation, brushing and export. The BEN2 model
 * always infers on a fixed 1024×1024 input, but the post-processing mask, the
 * alpha-composed result canvas and the PNG data URL all scale with the OUTPUT
 * resolution — that part is the real cost on big photos. Downsampling the
 * working image keeps every step proportionally cheap and the UI responsive,
 * while still producing sharp, print-ready output up to the cap.
 */
const PROCESS_MAX_PIXELS = 12_000_000; // ~3460x3460 max working resolution
const PROCESS_MAX_PIXELS_WEAK_DEVICE = 7_000_000; // ~2650x2650 on phones

/** Detect phones or clearly constrained devices to apply a safe pixel cap. */
function effectiveMaxPixels(): number {
  if (typeof navigator === "undefined") return MAX_PIXELS;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof mem === "number" && mem > 0 && mem < 4;
  const lowCores = (typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8) < 4;
  const mobile = /android|iphone|ipad|ipod|x11/i.test(navigator.userAgent);
  if (mobile || lowMemory || lowCores) return MAX_PIXELS_WEAK_DEVICE;
  return MAX_PIXELS;
}

/** Working-resolution cap for this device (the downsampling target). */
function effectiveProcessMaxPixels(): number {
  if (typeof navigator === "undefined") return PROCESS_MAX_PIXELS;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof mem === "number" && mem > 0 && mem < 4;
  const lowCores = (typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8) < 4;
  const mobile = /android|iphone|ipad|ipod|x11/i.test(navigator.userAgent);
  if (mobile || lowMemory || lowCores) return PROCESS_MAX_PIXELS_WEAK_DEVICE;
  return PROCESS_MAX_PIXELS;
}

/** Non-regressing progress mapping: the bar never visibly goes backwards. */
function mapStage(stage: string, progress: number): { stage: string; pct: number } {
  const lower = stage.toLowerCase();
  if (lower.includes("getting things ready")) {
    if (progress < 94) return { stage: "Downloading the AI model (first use only)…", pct: progress };
    return { stage: "Loading the AI model…", pct: 94 };
  }
  if (lower.includes("removing background")) return { stage: "Removing background…", pct: 95 };
  if (lower.includes("refining")) return { stage: "Refining edges…", pct: 98 };
  if (lower.includes("done")) return { stage: "Done", pct: 100 };
  return { stage, pct: Math.max(progress, 0) };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/**
 * Size an image so it fills the available panel width, but never grows past a
 * comfortable height for the viewport. Portrait images get to use the height;
 * landscape images fill the width; huge images are shown at the panel width.
 */
function fitBoxStyle(width: number, height: number): React.CSSProperties {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const aspect = safeW / safeH;
  return {
    width: `min(100%, calc(54vh * ${aspect}), ${safeW}px)`,
    aspectRatio: `${safeW} / ${safeH}`,
    height: "auto",
    maxWidth: "100%",
  };
}

/** Transparent-preview checkerboard behind the extracted subject. */
const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: "#161914",
  backgroundImage:
    "linear-gradient(45deg, #2c2f26 25%, transparent 25%), linear-gradient(-45deg, #2c2f26 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2c2f26 75%), linear-gradient(-45deg, transparent 75%, #2c2f26 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
};

/**
 * Map a raw engine error to a calm, human message. Technical detail is logged
 * to the console for developers and never shown to users.
 */
function friendlyError(err: unknown): string {
  const msg = String((err as Error)?.message || err || "").toLowerCase();
  if (msg.includes("out of memory") || (msg.includes("memory") && msg.includes("alloc"))) {
    return "Not enough memory to process this image here. Try a smaller image or close other browser tabs.";
  }
  if (msg.includes("megapixels") || msg.includes("too large")) {
    return (err as Error)?.message || "This image is too large to process here.";
  }
  if (/download|network|fetch|cache|source unavailable/i.test(msg)) {
    return "Couldn't prepare the tool. Please try again.";
  }
  if (/webgpu|gpu|execution|provider|backend|session|wasm|inference|onnx|float/i.test(msg)) {
    return "This image couldn't be processed in this browser. Try again, or use a different browser.";
  }
  return "This image couldn't be processed. Please try again.";
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function BackgroundRemover({
  onCopy,
  onAddToast,
}: {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: any) => void;
}) {
  const postDownload = usePostDownload();

  /* --- Upload state --- */
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  /* --- Processing --- */
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("Getting things ready…");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* --- Result: background replacement --- */
  const [backgroundType, setBackgroundType] = useState<"transparent" | "color" | "gradient">("transparent");
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [activeGradient, setActiveGradient] = useState(GRADIENTS[0].css);

  /* --- Manual brush editing --- */
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const viewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingRef = useRef(false);
  const paintHistoryRef = useRef<ImageData[]>([]);
  const lastProgressRef = useRef(0);
  const cancelledRef = useRef(false);
  const [brushMode, setBrushMode] = useState<"erase" | "restore" | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [hasUndo, setHasUndo] = useState(false);

  /* --- Result actions --- */
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [showCompare, setShowCompare] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const compareRef = useRef<HTMLDivElement>(null);
  const isCompareDragRef = useRef(false);

  /* --- Settings panels collapsed state --- */
  const [replaceOpen, setReplaceOpen] = useState(false);

  /* --- Device capability (honest copy + no hidden huge downloads) --- */
  const [backend, setBackend] = useState<"webgpu" | "wasm" | null>(null);
  useEffect(() => {
    let mounted = true;
    detectBackend().then((b) => {
      if (mounted) setBackend(b);
    }).catch(() => { /* leave unknown — behavior stays safe */ });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedItem = files[selectedIndex];

  /* ================================================================ */
  /* Reset / clear                                                     */
  /* ================================================================ */

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setSelectedIndex(0);
    setIsCompleted(false);
    setProcessingProgress(0);
    setProcessingStage("Getting things ready…");
    setBrushMode(null);
    setHasUndo(false);
    setHasError(false);
    setErrorMessage("");
    setShowCompare(false);
    setCopyState("idle");
    paintHistoryRef.current = [];
    originalImgRef.current = null;
  }, []);

  /* ================================================================ */
  /* File upload                                                       */
  /* ================================================================ */

  const handleFilesAdded = useCallback(
    async (rawFiles: File[]) => {
      const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
      if (loadedItems.length > 0) {
        const item = loadedItems[0];
        setFiles([item]);
        setSelectedIndex(0);
        setIsCompleted(false);
        setHasError(false);
        setErrorMessage("");
        setShowCompare(false);
        setCopyState("idle");

        const img = new Image();
        img.onload = () => {
          originalImgRef.current = img;
        };
        img.src = item.originalDataUrl;
      }
    },
    [onAddToast],
  );

  /* ================================================================ */
  /* Background removal (AI segmentation)                              */
  /* ================================================================ */

  const processRemoval = useCallback(async () => {
    if (!originalImgRef.current || isProcessing) return;

    cancelledRef.current = false;
    setIsProcessing(true);
    setIsCompleted(false);
    setHasError(false);
    setErrorMessage("");
    setProcessingStage("Getting things ready…");
    setProcessingProgress(0);
    lastProgressRef.current = 0;
    const startTime = performance.now();

    const onProgress: ProgressCallback = (stage, progress) => {
      const mapped = mapStage(stage, progress);
      const pct = Math.max(lastProgressRef.current, mapped.pct);
      lastProgressRef.current = pct;
      setProcessingProgress(pct);
      setProcessingStage(mapped.stage);
    };

    try {
      const img = originalImgRef.current;

      // Guard against very large images that would exhaust memory client-side.
      // The cap is lower on phones / low-memory devices so a huge upload turns
      // into a clear message instead of a frozen or killed tab.
      const maxPixels = effectiveMaxPixels();
      if (img.naturalWidth * img.naturalHeight > maxPixels) {
        throw new Error(
          `This image is ${(img.naturalWidth * img.naturalHeight / 1_000_000).toFixed(1)} megapixels — too large to process on this device. Please use an image under ${Math.floor(maxPixels / 1_000_000)} MP.`,
        );
      }

      const bitmap = await createImageBitmap(img);

      // Downsample the working image to the device's cap so the alpha mask,
      // the composited result canvas and the PNG encode all stay cheap — the
      // actual inference already runs at a fixed 1024×1024 regardless.
      const workMaxPixels = effectiveProcessMaxPixels();
      let workBitmap = bitmap;
      const srcPixels = bitmap.width * bitmap.height;
      if (srcPixels > workMaxPixels) {
        const scale = Math.sqrt(workMaxPixels / srcPixels);
        const dstW = Math.max(1, Math.round(bitmap.width * scale));
        const dstH = Math.max(1, Math.round(bitmap.height * scale));
        workBitmap = await createImageBitmap(bitmap, {
          resizeWidth: dstW,
          resizeHeight: dstH,
          resizeQuality: "high",
        });
        bitmap.close();
      }

      let dataUrl: string;
      let width: number;
      let height: number;
      try {
        const outcome = await segmentImage(workBitmap, onProgress);
        dataUrl = outcome.dataUrl;
        width = outcome.width;
        height = outcome.height;
      } finally {
        workBitmap.close();
      }

      onProgress("Refining edges…", 98);
      await new Promise((r) => setTimeout(r, 0));

      const base64Len = dataUrl.split(",")[1]?.length ?? 0;
      const approxSize = Math.floor(base64Len * 0.75);

      setProcessingTime(startTime);

      setFiles((prev) =>
        prev.map((f, i) =>
          i === selectedIndex
            ? {
                ...f,
                processedSize: approxSize,
                processedWidth: width,
                processedHeight: height,
                processedDataUrl: dataUrl,
              }
            : f,
        ),
      );

      paintHistoryRef.current = [];
      setHasUndo(false);
      setProcessingProgress(100);
      setProcessingStage("Done");
      setIsCompleted(true);
      setShowCompare(false);
      onAddToast("Background removed", "success");

      setTimeout(() => renderCanvasWithAdjustments(), 0);
    } catch (err: any) {
      // A user-cancelled or disposed run returns to the READY state instead of
      // surfacing an error — nothing went wrong, the user just stopped it.
      if (cancelledRef.current) {
        setProcessingProgress(0);
        setProcessingStage("Getting things ready…");
        onAddToast("Processing cancelled", "warning");
        return;
      }
      console.error("[brembg] error:", err);
      setHasError(true);
      setErrorMessage(friendlyError(err));
      onAddToast("Couldn't process this image", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [originalImgRef, isProcessing, selectedIndex, onAddToast]);

  const [processingTimeMs, setProcessingTimeMs] = useState(0);
  const setProcessingTime = (startTime: number) => setProcessingTimeMs(performance.now() - startTime);

  /**
   * Cancel an in-flight segmentation: the worker is terminated (releasing the
   * loaded model immediately) and the run returns to the READY state. Since
   * terminating the worker also destroys the warm model session, the next
   * "Remove Background" downloads the model again.
   */
  const handleCancel = useCallback(() => {
    if (!isProcessing) return;
    cancelledRef.current = true;
    cancelSegmentation();
  }, [isProcessing]);

  // Release the Background Remover resources (worker + loaded model session)
  // when the user navigates away from the tool.
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      disposeBackgroundRemover();
    };
  }, []);

  /* ================================================================ */
  /* Canvas rendering (background replacement + brush view)            */
  /* ================================================================ */

  const renderCanvasWithAdjustments = useCallback(() => {
    const canvas = viewCanvasRef.current;
    if (!canvas || !selectedItem || !selectedItem.processedDataUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (backgroundType === "color") {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backgroundType === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const hexes = activeGradient.match(/#[0-9a-fA-F]{6}/g);
        if (hexes && hexes.length >= 2) {
          grad.addColorStop(0, hexes[0]);
          grad.addColorStop(1, hexes[hexes.length - 1]);
        } else {
          grad.addColorStop(0, "#FF9A8B");
          grad.addColorStop(1, "#FF99AC");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      if (paintHistoryRef.current.length === 0) {
        if (canvas.width * canvas.height <= PAINT_SNAPSHOT_MAX_PIXELS) {
          paintHistoryRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        } else {
          paintHistoryRef.current = [];
        }
      }
    };
    img.src = selectedItem.processedDataUrl;
  }, [selectedItem, backgroundType, solidColor, activeGradient]);

  useEffect(() => {
    if (isCompleted) renderCanvasWithAdjustments();
  }, [backgroundType, solidColor, activeGradient, isCompleted, renderCanvasWithAdjustments]);

  /* ================================================================ */
  /* Manual brush paint handlers                                       */
  /* ================================================================ */

  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: Math.floor(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.floor(((clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  const handleStartPaint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!brushMode || !isCompleted) return;
    e.preventDefault();
    isPaintingRef.current = true;
    handlePaintMove(e);
  };

  const handlePaintMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || !brushMode || !isCompleted) return;
    e.preventDefault();

    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasMousePos(e);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.clip();

    if (brushMode === "erase") {
      ctx.clearRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
    } else if (brushMode === "restore" && originalImgRef.current) {
      ctx.drawImage(originalImgRef.current, 0, 0);
    }
    ctx.restore();
  };

  const handleStopPaint = () => {
    if (!isPaintingRef.current) return;
    isPaintingRef.current = false;

    const canvas = viewCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (canvas.width * canvas.height <= PAINT_SNAPSHOT_MAX_PIXELS) {
          paintHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
          setHasUndo(true);
        }
      }
    }
  };

  const handleUndo = () => {
    if (paintHistoryRef.current.length <= 1) return;
    paintHistoryRef.current.pop();
    const previousState = paintHistoryRef.current[paintHistoryRef.current.length - 1];
    const canvas = viewCanvasRef.current;
    if (canvas && previousState) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.putImageData(previousState, 0, 0);
        if (paintHistoryRef.current.length <= 1) setHasUndo(false);
      }
    }
  };

  /* ================================================================ */
  /* Result actions: copy + download                                    */
  /* ================================================================ */

  const baseName = (selectedItem?.name.split(".")[0] ?? "image").replace(/[^\w\-]+/g, "-") || "image";

  const downloadCanvasAs = useCallback(
    async (canvas: HTMLCanvasElement, mime: string, quality: number | undefined, fileName: string): Promise<boolean> => {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
      if (!blob) return false;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return true;
    },
    [],
  );

  const handleDownloadPNG = async () => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    const ok = await downloadCanvasAs(canvas, "image/png", undefined, `${baseName}-bg-removed.png`);
    if (!ok) {
      onAddToast("Couldn't create the PNG.", "error");
      return;
    }
    postDownload.show("Background Remover");
  };

  const handleDownloadJPG = async () => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const ok = await downloadCanvasAs(exportCanvas, "image/jpeg", 0.92, `${baseName}-bg-removed.jpg`);
    if (!ok) {
      onAddToast("Couldn't create the JPG.", "error");
      return;
    }
    onAddToast("JPG downloaded (no transparency)", "success");
    postDownload.show("Background Remover");
  };

  const handleCopyImage = async () => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("PNG encoding failed");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopyState("copied");
        window.setTimeout(() => setCopyState("idle"), 2000);
        onAddToast("Image copied to clipboard", "success");
        return;
      }
      // Clipboard images unsupported — gracefully fall back to a download.
      await downloadCanvasAs(canvas, "image/png", undefined, `${baseName}-bg-removed.png`);
      onAddToast("Copying isn't supported in this browser, so the PNG was downloaded instead.", "info");
    } catch (err) {
      console.error("[brembg] clipboard copy failed:", err);
      onAddToast("Couldn't copy the image to your clipboard.", "error");
    }
  };

  /* ================================================================ */
  /* Compare slider                                                    */
  /* ================================================================ */

  const updateCompareSplit = (clientX: number) => {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setCompareSplit((x / rect.width) * 100);
  };

  const handleComparePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isCompareDragRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateCompareSplit(e.clientX);
  };

  const handleComparePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompareDragRef.current) updateCompareSplit(e.clientX);
  };

  const handleComparePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isCompareDragRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const originalW = selectedItem?.originalWidth || 1;
  const originalH = selectedItem?.originalHeight || 1;
  const resultW = selectedItem?.processedWidth || originalW;
  const resultH = selectedItem?.processedHeight || originalH;
  const resultBoxStyle = fitBoxStyle(resultW, resultH);
  const compareBoxStyle = fitBoxStyle(originalW, originalH);

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* PHASE 1: UPLOAD */}
      {files.length === 0 && (
        <div className="space-y-5">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-text-main leading-tight">
              Remove background from an image
            </h2>
            <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-lg mx-auto">
              Cut out the subject of your photo — people, products, pets, vehicles — in a few seconds.
            </p>
          </div>

          <UniversalUploadComponent
            onFilesAdded={handleFilesAdded}
            accept="image/*"
            supportedFormats="JPG, PNG, WebP"
            maxSizeText="40 MB"
            filesCount={files.length}
            onClearAll={handleClearAll}
          />

          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <Shield className="w-3.5 h-3.5 text-status-success" />
            <span>Processed locally in your browser — nothing is uploaded.</span>
          </div>

          {backend === "wasm" && (
            <p className="text-center text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              First use downloads the AI model to your device (cached afterwards). This browser has no GPU support, so the model download is larger and processing runs on the phone's CPU — give it a moment.
            </p>
          )}
        </div>
      )}

      {/* PHASE 2: READY / PROCESSING */}
      {files.length > 0 && !isCompleted && !hasError && (
        <div className="space-y-4">
          {/* File header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border-light bg-surface-base px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-[20px]">
            <div className="flex items-center gap-2 min-w-0">
              <FileImage className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-xs text-text-muted truncate max-w-[150px] sm:max-w-[250px]" title={selectedItem?.name}>
                {selectedItem?.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-text-sub border border-border-light font-bold shrink-0">
                {selectedItem?.originalWidth}x{selectedItem?.originalHeight}px
              </span>
            </div>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-xs font-bold text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>

          {/* Processing / CTA card */}
          <div className="border border-border-light rounded-[24px] overflow-hidden bg-surface-base">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 p-6 sm:p-8">
              <div className="relative shrink-0">
                <div className="relative rounded-xl overflow-hidden border border-border-medium bg-surface-muted">
                  <img
                    src={selectedItem?.originalDataUrl}
                    alt="Uploaded image"
                    className="block max-h-[180px] sm:max-h-[220px] w-auto select-none object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] border-white/30 border-t-brand-primary animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {isProcessing ? (
                <div className="flex-1 w-full min-w-0 space-y-3 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-sans font-bold text-text-main">
                    {processingStage}
                  </p>
                  {processingProgress > 0 && (
                    <div className="w-full max-w-sm">
                      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden border border-border-light/40">
                        <div
                          className="h-full bg-brand-primary rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${Math.min(Math.max(processingProgress, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-text-muted">This can take a moment the first time.</p>
                  {backend === "wasm" && (
                    <p className="text-xs text-text-muted">
                      Running on this device's CPU without a GPU — the first run also downloads the AI model.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-status-error bg-surface-muted/60 hover:bg-status-error/10 border border-border-light hover:border-status-error/30 rounded-lg px-3.5 py-2 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex-1 w-full min-w-0 flex flex-col items-center sm:items-start gap-4">
                  <p className="text-sm text-text-muted leading-relaxed text-center sm:text-left max-w-sm">
                    Remove the background from this image. Everything stays on your device. The first use downloads the AI model to your device — it's cached afterwards.
                  </p>
                  <Button
                    variant="primary"
                    onClick={processRemoval}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    className="w-full max-w-[300px] sm:max-w-none"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Remove Background
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2b: ERROR STATE */}
      {files.length > 0 && hasError && !isCompleted && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border-light bg-surface-base px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-[20px]">
            <div className="flex items-center gap-2 min-w-0">
              <FileImage className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-xs text-text-muted truncate max-w-[150px] sm:max-w-[250px]" title={selectedItem?.name}>
                {selectedItem?.name}
              </span>
            </div>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-xs font-bold text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>

          <Card className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-status-error/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-status-error" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-main">This image couldn't be processed</h3>
              <p className="text-sm text-text-muted max-w-md mx-auto">{errorMessage}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  setHasError(false);
                  setErrorMessage("");
                  processRemoval();
                }}
              >
                Try again
              </Button>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-xl cursor-pointer transition-colors">
                <span>Try another image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handleFilesAdded([e.target.files[0]]);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* PHASE 3: RESULT */}
      {files.length > 0 && isCompleted && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <CheckCircle className="w-4 h-4 text-status-success" aria-hidden="true" />
            <span className="text-sm sm:text-base font-bold text-text-main">Background removed.</span>
          </div>

          {/* Original | Result — side by side on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* ORIGINAL */}
            <div className="flex flex-col min-w-0 overflow-hidden rounded-[18px] border border-border-light bg-[#11130e]">
              <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2">
                <ImageIcon className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Original</span>
              </div>
              <div className="flex flex-1 items-center justify-center p-3 sm:p-4" style={{ minHeight: "min(46vh, 420px)" }}>
                <img
                  src={selectedItem?.originalDataUrl}
                  alt="Original image"
                  className="select-none"
                  style={fitBoxStyle(originalW, originalH)}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* RESULT */}
            <div className="flex flex-col min-w-0 overflow-hidden rounded-[18px] border border-border-light">
              <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2">
                <CheckCircle className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Result</span>
                {backgroundType === "transparent" && (
                  <span className="ml-auto rounded border border-border-light px-1.5 py-0.5 text-[9px] font-bold text-text-muted">
                    Transparent
                  </span>
                )}
              </div>
              <div className="flex flex-1 items-center justify-center p-3 sm:p-4" style={{ minHeight: "min(46vh, 420px)", ...CHECKERBOARD }}>
                <canvas
                  ref={viewCanvasRef}
                  className={`block ${brushMode ? "cursor-cell" : "cursor-default"}`}
                  style={resultBoxStyle}
                  onMouseDown={handleStartPaint}
                  onMouseMove={handlePaintMove}
                  onMouseUp={handleStopPaint}
                  onMouseLeave={handleStopPaint}
                  onTouchStart={handleStartPaint}
                  onTouchMove={handlePaintMove}
                  onTouchEnd={handleStopPaint}
                />
              </div>
            </div>
          </div>

          {/* Actions — only after the result is visible */}
          <div className="mx-auto w-full max-w-lg space-y-2.5">
            <Button
              variant="primary"
              onClick={handleCopyImage}
              className="w-full"
              leftIcon={copyState === "copied" ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            >
              {copyState === "copied" ? "Copied" : "Copy image"}
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button variant="secondary" onClick={handleDownloadPNG} leftIcon={<Download className="w-4 h-4" />} className="w-full">
                Download PNG
              </Button>
              <Button variant="outline" onClick={handleDownloadJPG} leftIcon={<Download className="w-4 h-4" />} className="w-full">
                Download JPG
              </Button>
            </div>
            <p className="text-center text-[11px] text-text-muted">JPG can't store transparency, so its background is flattened.</p>
          </div>

          {/* Before / After comparison — optional */}
          <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[16px] border border-border-light bg-surface-base">
            <button
              type="button"
              onClick={() => setShowCompare((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-text-main transition-colors hover:bg-surface-muted/40"
            >
              <MoveHorizontal className="w-4 h-4 text-text-muted" aria-hidden="true" />
              {showCompare ? "Hide comparison" : "Compare before / after"}
            </button>
            {showCompare && (
              <div className="flex justify-center border-t border-border-light p-3">
                <div
                  ref={compareRef}
                  className="relative touch-none select-none overflow-hidden rounded-xl"
                  style={{ ...compareBoxStyle, ...CHECKERBOARD }}
                  onPointerDown={handleComparePointerDown}
                  onPointerMove={handleComparePointerMove}
                  onPointerUp={handleComparePointerUp}
                  onPointerCancel={handleComparePointerUp}
                >
                  <img
                    src={selectedItem?.originalDataUrl}
                    alt="Original"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - compareSplit}% 0 0)` }}>
                    <img
                      src={selectedItem?.processedDataUrl}
                      alt="Result with background removed"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                    <span className="absolute left-2 top-2 rounded bg-brand-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Result
                    </span>
                  </div>
                  <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    Original
                  </span>
                  <div className="absolute inset-y-0" style={{ left: `${compareSplit}%` }}>
                    <div className="absolute inset-y-0 -ml-px w-0.5 bg-brand-primary">
                      <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-primary text-white shadow-lg">
                        <MoveHorizontal className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Touch up brushes */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setBrushMode(brushMode === "erase" ? null : "erase")}
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                brushMode === "erase"
                  ? "bg-brand-primary text-white"
                  : "border border-border-light bg-surface-base text-text-main hover:bg-surface-hover"
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              Erase
            </button>
            <button
              onClick={() => setBrushMode(brushMode === "restore" ? null : "restore")}
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                brushMode === "restore"
                  ? "bg-brand-primary text-white"
                  : "border border-border-light bg-surface-base text-text-main hover:bg-surface-hover"
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Restore
            </button>
            <button
              disabled={!hasUndo}
              onClick={handleUndo}
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-border-light bg-surface-base px-3 py-1.5 text-xs font-bold text-text-main transition-all hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40"
            >
              <Undo className="w-3.5 h-3.5" />
              Undo
            </button>
            {brushMode && (
              <>
                <span className="shrink-0 text-xs text-text-muted">Size ({brushSize}px)</span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="h-1.5 w-28 accent-brand-primary sm:w-40"
                />
                <span className="text-[11px] text-text-muted">Paint on the result to refine edges</span>
              </>
            )}
          </div>

          {/* Replace background */}
          <div className="overflow-hidden rounded-[16px] border border-border-light bg-surface-base">
            <button
              type="button"
              onClick={() => setReplaceOpen(!replaceOpen)}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/40"
            >
              <span className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-text-main transition-colors group-hover:text-brand-primary">Replace background</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${replaceOpen ? "rotate-180" : ""}`} />
            </button>
            {replaceOpen && (
              <div className="space-y-3 border-t border-border-light px-4 pb-4 pt-3">
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-muted p-1">
                  {(["transparent", "color", "gradient"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setBackgroundType(type);
                        setBrushMode(null);
                      }}
                      className={`cursor-pointer rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                        backgroundType === type
                          ? "bg-surface-base text-brand-primary shadow-sm"
                          : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {backgroundType === "color" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setSolidColor(col.hex)}
                        className="relative h-7 w-7 rounded-full border border-border-medium shadow-sm transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {solidColor === col.hex && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-main">✓</span>
                        )}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-border-medium"
                      title="Custom color"
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="w-24 rounded-lg border border-border-medium px-2 py-1 text-xs font-mono uppercase"
                      aria-label="Custom color hex"
                    />
                  </div>
                )}

                {backgroundType === "gradient" && (
                  <div className="grid grid-cols-3 gap-2">
                    {GRADIENTS.map((grad) => (
                      <button
                        key={grad.name}
                        onClick={() => setActiveGradient(grad.css)}
                        className={`cursor-pointer overflow-hidden rounded-lg border text-left transition-all ${
                          activeGradient === grad.css
                            ? "border-brand-primary ring-1 ring-brand-primary"
                            : "border-border-light hover:border-border-medium"
                        }`}
                      >
                        <div className="h-6 w-full" style={{ background: grad.css }} />
                        <span className="block truncate px-2 py-1 text-[10px] font-bold text-text-main">{grad.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer: privacy + reconfigure */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <p className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <Shield className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
              Processed locally in your browser — nothing is uploaded.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-primary/10 px-4 py-2.5 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary/20">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>New image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handleFilesAdded([e.target.files[0]]);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={processRemoval}
                disabled={isProcessing}
                isLoading={isProcessing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Re-process
              </Button>
              <button
                onClick={handleClearAll}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-text-muted transition-colors hover:bg-status-error/10 hover:text-status-error"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USE CASES — unique supporting content. How-to, privacy and FAQ
          sections live ONLY in Layout's accordions (single source of truth:
          src/data.ts → metadata.steps / privacyExplanation / faqs), so this
          component must never render its own copies. */}
      <div className="max-w-3xl mx-auto space-y-10 pt-8 border-t border-border-light">
        {/* Use cases */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-sans font-black text-text-main">
            Background remover for every use case
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border-light rounded-[18px] bg-surface-base p-5 space-y-2">
              <h3 className="font-sans font-bold text-text-main">Product photos</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Remove backgrounds from product images for e-commerce stores, catalogs, and marketplace listings. Clean product photos sell better and look more professional.
              </p>
            </div>
            <div className="border border-border-light rounded-[18px] bg-surface-base p-5 space-y-2">
              <h3 className="font-sans font-bold text-text-main">Profile pictures</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Create clean portrait images without distracting backgrounds. Ideal for social media profiles, team pages, and professional headshots.
              </p>
            </div>
            <div className="border border-border-light rounded-[18px] bg-surface-base p-5 space-y-2">
              <h3 className="font-sans font-bold text-text-main">Logos and graphics</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Prepare logos and graphic elements for use on different backgrounds. Get a transparent PNG that works on any color surface.
              </p>
            </div>
            <div className="border border-border-light rounded-[18px] bg-surface-base p-5 space-y-2">
              <h3 className="font-sans font-bold text-text-main">Presentations and designs</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Remove unwanted backgrounds from images before placing them in slide decks, documents, or design projects. No background means cleaner compositions.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <StickyMobileAction visible={isCompleted}>
        <div className="mx-auto flex max-w-lg items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex min-h-[44px] shrink-0 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-[#FAF8F1] whitespace-nowrap shadow-premium-sm transition-all duration-200 hover:bg-brand-primary-hover active:scale-[0.98] cursor-pointer"
          >
            {copyState === "copied" ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            <span>{copyState === "copied" ? "Copied" : "Copy image"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border-light bg-surface-base px-4 py-2.5 text-sm font-bold text-text-main transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>PNG</span>
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