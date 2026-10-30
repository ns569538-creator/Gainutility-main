import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Sliders, 
  ArrowLeftRight, 
  Zap, 
  ShieldCheck, 
  Trash2,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  Info,
  Download,
  CheckCircle,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  ChevronDown,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button, Card, StickyMobileAction } from "./Common";
import { 
  ImageFileItem, 
  UniversalUploadComponent,
  UniversalDownloadPanel 
} from "./ImageToolFramework";
import { ContinueEditing } from "./ContinueEditing";
import JSZip from "jszip";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import { useLocale } from "../i18n/LocaleContext";
import { tt, ttf } from "../i18n/toolUi";
import "../i18n/tools/imageConverter";
import { MAX_PIXELS, safeCanvasSize } from "../utils/imageLimits";
import { useToolStateRestoration } from "../lib/toolStateStore";

// Extend window interface for dynamic heic2any
declare global {
  interface Window {
    heic2any?: any;
  }
}

interface ImageConverterProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const locale = useLocale();
  const postDownload = usePostDownload();

  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  // HEIC loader state
  const [engineReady, setEngineReady] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);

  // Settings
  const [outputFormat, setOutputFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState<number>(85); // 10-100 (for jpeg/webp/avif)
  
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<string>("");
  const [resizeHeight, setResizeHeight] = useState<string>("");
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [fileNamePrefix, setFileNamePrefix] = useState<string>("");
  const [fileNameSuffix, setFileNameSuffix] = useState<string>("_converted");
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  
  // Interactive Slider state
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState("");
  const [remainingFiles, setRemainingFiles] = useState(0);

  // Real encoder capability probe: browsers must be asked honestly because
  // canvas.toBlob() silently falls back to PNG when a codec is missing
  // (e.g. AVIF/TIFF encoding is not implemented anywhere today).
  const [codecSupport, setCodecSupport] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const results: Record<string, boolean> = {};
      const c = document.createElement("canvas");
      c.width = 2;
      c.height = 2;
      const candidates = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/tiff"];
      for (const mime of candidates) {
        try {
          const blob = await new Promise<Blob | null>((resolve) =>
            c.toBlob(resolve, mime, mime === "image/png" || mime === "image/tiff" ? undefined : 0.8)
          );
          results[mime] = !!blob && blob.type === mime;
        } catch {
          results[mime] = false;
        }
      }
      // BMP and ICO are produced by our own encoders - always available.
      results["image/bmp"] = true;
      results["image/x-icon"] = true;
      if (!cancelled) setCodecSupport(results);
    };
    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Back/Forward history restoration
  const getSerializableState = useCallback(() => ({
    files: files.map(f => ({
      id: f.id,
      name: f.name,
      originalSize: f.originalSize,
      originalWidth: f.originalWidth,
      originalHeight: f.originalHeight,
      originalDataUrl: f.originalDataUrl,
      processedSize: f.processedSize,
      processedWidth: f.processedWidth,
      processedHeight: f.processedHeight,
      processedDataUrl: f.processedDataUrl,
    })),
    selectedIndex,
    outputFormat,
    quality,
    showAdvanced,
    resizeWidth,
    resizeHeight,
    keepAspectRatio,
    backgroundColor,
    fileNamePrefix,
    fileNameSuffix,
    stripMetadata,
    sliderPosition,
  }), [files, selectedIndex, outputFormat, quality, showAdvanced, resizeWidth, resizeHeight, keepAspectRatio, backgroundColor, fileNamePrefix, fileNameSuffix, stripMetadata, sliderPosition]);

  const restoreState = useCallback((saved: unknown) => {
    const s = saved as Partial<{
      files: ImageFileItem[];
      selectedIndex: number;
      outputFormat: string;
      quality: number;
      showAdvanced: boolean;
      resizeWidth: string;
      resizeHeight: string;
      keepAspectRatio: boolean;
      backgroundColor: string;
      fileNamePrefix: string;
      fileNameSuffix: string;
      stripMetadata: boolean;
      sliderPosition: number;
    }>;
    if (!s) return;
    if (s.files) setFiles(s.files);
    if (typeof s.selectedIndex === "number") setSelectedIndex(s.selectedIndex);
    if (s.outputFormat) setOutputFormat(s.outputFormat);
    if (typeof s.quality === "number") setQuality(s.quality);
    if (typeof s.showAdvanced === "boolean") setShowAdvanced(s.showAdvanced);
    if (s.resizeWidth !== undefined) setResizeWidth(s.resizeWidth);
    if (s.resizeHeight !== undefined) setResizeHeight(s.resizeHeight);
    if (typeof s.keepAspectRatio === "boolean") setKeepAspectRatio(s.keepAspectRatio);
    if (s.backgroundColor) setBackgroundColor(s.backgroundColor);
    if (s.fileNamePrefix !== undefined) setFileNamePrefix(s.fileNamePrefix);
    if (s.fileNameSuffix !== undefined) setFileNameSuffix(s.fileNameSuffix);
    if (typeof s.stripMetadata === "boolean") setStripMetadata(s.stripMetadata);
    if (typeof s.sliderPosition === "number") setSliderPosition(s.sliderPosition);
  }, []);

  useToolStateRestoration("image-converter", getSerializableState, restoreState);

  // Load heic2any on mount
  useEffect(() => {
    if (window.heic2any) {
      setEngineReady(true);
      return;
    }

    setEngineLoading(true);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    script.async = true;
    script.onload = () => {
      setEngineReady(true);
      setEngineLoading(false);
    };
    script.onerror = () => {
      setEngineLoading(false);
      onAddToast("Failed to load HEIC decoding engine. HEIC conversion might be unavailable.", "warning");
    };
    document.body.appendChild(script);
  }, [onAddToast]);

  // Smart Handoff mount effect
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

  // Reset or initialize dimensions when selected item changes
  useEffect(() => {
    const item = files[selectedIndex];
    if (item) {
      setResizeWidth(item.originalWidth.toString());
      setResizeHeight(item.originalHeight.toString());
    }
  }, [selectedIndex, files.length]);

  const handleWidthChange = (val: string) => {
    setResizeWidth(val);
    const item = files[selectedIndex];
    if (item && keepAspectRatio && val) {
      const numWidth = parseInt(val);
      if (!isNaN(numWidth) && item.originalWidth > 0) {
        const ratio = item.originalWidth / item.originalHeight;
        const newHeight = Math.round(numWidth / ratio);
        setResizeHeight(newHeight.toString());
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setResizeHeight(val);
    const item = files[selectedIndex];
    if (item && keepAspectRatio && val) {
      const numHeight = parseInt(val);
      if (!isNaN(numHeight) && item.originalHeight > 0) {
        const ratio = item.originalWidth / item.originalHeight;
        const newWidth = Math.round(numHeight * ratio);
        setResizeWidth(newWidth.toString());
      }
    }
  };

  const handleFilesAdded = (rawFiles: File[]) => {
    const validFiles = rawFiles.filter(file => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return (
        file.type.startsWith("image/") ||
        ["heic", "heif", "svg", "tiff", "tif", "bmp", "ico", "webp", "avif", "gif"].includes(ext || "")
      );
    });

    if (validFiles.length === 0) {
      onAddToast("Please upload valid image files (JPG, PNG, WEBP, AVIF, HEIC, SVG, BMP, TIFF, ICO, GIF)!", "error");
      return;
    }

    const newItems: ImageFileItem[] = [];
    let loadedCount = 0;

    validFiles.forEach(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isHeic = ext === "heic" || ext === "heif";

      if (isHeic) {
        // Create temporary item for HEIC until fully processed
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: 1200, // standard placeholder width before decode
          originalHeight: 800, // placeholder height
          originalDataUrl: "", // filled during conversion
          isProcessing: false
        });
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setFiles(prev => {
            const updated = [...prev, ...newItems];
            if (prev.length === 0) setSelectedIndex(0);
            return updated;
          });
          onAddToast(`Added HEIC file(s) to queue. Decodes automatically on conversion!`, "info");
        }
      } else {
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
              originalWidth: img.naturalWidth || img.width || 300,
              originalHeight: img.naturalHeight || img.height || 300,
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
              onAddToast(`Loaded ${validFiles.length} file(s) into queue.`, "success");
            }
          };
          img.onerror = () => {
            loadedCount++;
            onAddToast(`Could not read dimensions for ${file.name}. Standard placeholder used.`, "warning");
            newItems.push({
              id: Math.random().toString(36).substring(2, 9),
              file,
              name: file.name,
              originalSize: file.size,
              originalWidth: 400,
              originalHeight: 400,
              originalDataUrl: dataUrl,
              isProcessing: false
            });
            if (loadedCount === validFiles.length) {
              setFiles(prev => {
                const updated = [...prev, ...newItems];
                if (prev.length === 0) setSelectedIndex(0);
                return updated;
              });
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    });
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

  // BMP encoder helper
  const convertCanvasToBmp = (canvas: HTMLCanvasElement): Blob => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelDataSize = rowSize * height;
    const fileSize = 54 + pixelDataSize;
    
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    
    // BMP File Header
    view.setUint16(0, 0x4D42, false); // "BM" signature
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, 54, true); // Offset to pixel data
    
    // DIB Header (BITMAPINFOHEADER)
    view.setUint32(14, 40, true); // Header size
    view.setInt32(18, width, true);
    view.setInt32(22, height, true); // positive height means bottom-up
    view.setUint16(26, 1, true); // Planes
    view.setUint16(28, 24, true); // 24-bit RGB
    view.setUint32(30, 0, true); // BI_RGB (no compression)
    view.setUint32(34, pixelDataSize, true);
    view.setInt32(38, 2835, true); // approx 72 DPI
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);
    
    const bytes = new Uint8Array(buffer);
    let offset = 54;
    
    for (let y = height - 1; y >= 0; y--) {
      const rowOffset = y * width * 4;
      let xOffset = 0;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x * 4;
        bytes[offset + xOffset] = data[i + 2];     // Blue
        bytes[offset + xOffset + 1] = data[i + 1]; // Green
        bytes[offset + xOffset + 2] = data[i];     // Red
        xOffset += 3;
      }
      // Row padding
      for (let p = xOffset; p < rowSize; p++) {
        bytes[offset + p] = 0;
      }
      offset += rowSize;
    }
    
    return new Blob([bytes], { type: "image/bmp" });
  };

  // ICO single resolution container helper (places high-fidelity PNG within ICO stream)
  const convertPngToIco = (pngBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const pngBuffer = reader.result as ArrayBuffer;
        const pngBytes = new Uint8Array(pngBuffer);
        const icoLength = 22 + pngBytes.length;
        const icoBuffer = new ArrayBuffer(icoLength);
        const view = new DataView(icoBuffer);
        
        // ICO Header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Type (1 for icon)
        view.setUint16(4, 1, true); // Image count (1)
        
        // ICO Directory Entry
        view.setUint8(6, 0); // Width (0 means 256)
        view.setUint8(7, 0); // Height (0 means 256)
        view.setUint8(8, 0); // Palette
        view.setUint8(9, 0); // Reserved
        view.setUint16(10, 1, true); // Color planes
        view.setUint16(12, 32, true); // bits per pixel (32)
        view.setUint32(14, pngBytes.length, true); // PNG size
        view.setUint32(18, 22, true); // PNG data start offset
        
        const icoBytes = new Uint8Array(icoBuffer);
        icoBytes.set(pngBytes, 22);
        
        resolve(new Blob([icoBytes], { type: "image/x-icon" }));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(pngBlob);
    });
  };

  const convertSingleImage = (item: ImageFileItem): Promise<{ size: number; width: number; height: number; dataUrl: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Refuse to fake it: if the browser cannot encode the requested mime
        // type, fail loudly instead of writing PNG bytes with a wrong extension.
        if (
          (outputFormat === "image/avif" || outputFormat === "image/tiff" || outputFormat === "image/webp") &&
          codecSupport[outputFormat] === false
        ) {
          reject(new Error(`${getFormatExtension(outputFormat).toUpperCase()} encoding is not supported by this browser`));
          return;
        }

        let sourceImgSrc = item.originalDataUrl;
        
        // HEIC decode handler
        if (
          item.name.toLowerCase().endsWith(".heic") ||
          item.name.toLowerCase().endsWith(".heif") ||
          item.file.type === "image/heic" ||
          item.file.type === "image/heif"
        ) {
          if (window.heic2any) {
            try {
              const convertedBlob = await window.heic2any({
                blob: item.file,
                toType: "image/jpeg",
                quality: quality / 100
              });
              const reader = new FileReader();
              const convertedDataUrl = await new Promise<string>((res, rej) => {
                reader.onloadend = () => res(reader.result as string);
                reader.onerror = rej;
                reader.readAsDataURL(convertedBlob as Blob);
              });
              sourceImgSrc = convertedDataUrl;
            } catch (err: any) {
              reject(new Error("HEIC processing error: " + (err.message || "Decoder failed")));
              return;
            }
          } else {
            reject(new Error("HEIC Engine is not initialized yet. Please wait."));
            return;
          }
        }

        if (!sourceImgSrc) {
          reject(new Error("No valid source image binary stream available"));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context initialization failure"));
            return;
          }

          // Dimensions
          let w = img.naturalWidth || img.width || 300;
          let h = img.naturalHeight || img.height || 300;
          
          const customW = parseInt(resizeWidth);
          const customH = parseInt(resizeHeight);
          if (showAdvanced && !isNaN(customW) && customW > 0) {
            w = customW;
          }
          if (showAdvanced && !isNaN(customH) && customH > 0) {
            h = customH;
          }

          canvas.width = w;
          canvas.height = h;

          // Memory guard: refuse absurd output sizes and clamp oversized
          // canvases on phones / low-memory devices so the tab can't OOM.
          if (w * h > MAX_PIXELS) {
            reject(new Error(
              `Output would be ${(w * h / 1_000_000).toFixed(1)} megapixels — too large to process here. Use a smaller size (under ${Math.floor(MAX_PIXELS / 1_000_000)} MP).`
            ));
            return;
          }
          const guarded = safeCanvasSize(w, h);
          if (guarded.width !== w || guarded.height !== h) {
            w = guarded.width;
            h = guarded.height;
            canvas.width = w;
            canvas.height = h;
          }

          // Background Fill for Transparency-Destroying formats
          if (outputFormat === "image/jpeg" || outputFormat === "image/bmp") {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);
          }

          ctx.drawImage(img, 0, 0, w, h);

          // Render custom formats
          if (outputFormat === "image/bmp") {
            try {
              const bmpBlob = convertCanvasToBmp(canvas);
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  size: bmpBlob.size,
                  width: w,
                  height: h,
                  dataUrl: reader.result as string
                });
              };
              reader.readAsDataURL(bmpBlob);
            } catch (err) {
              reject(err);
            }
          } else if (outputFormat === "image/x-icon") {
            // Resize canvas to standard square icon boundary (max 256)
            const iconSize = Math.min(256, Math.max(16, Math.min(w, h)));
            const icoCanvas = document.createElement("canvas");
            icoCanvas.width = iconSize;
            icoCanvas.height = iconSize;
            const icoCtx = icoCanvas.getContext("2d");
            if (icoCtx) {
              // Keep ICO transparency - do NOT paint a background here.
              icoCtx.drawImage(img, 0, 0, iconSize, iconSize);
            }
            
            icoCanvas.toBlob(async (pngBlob) => {
              if (!pngBlob) {
                reject(new Error("ICO render buffer mismatch"));
                return;
              }
              try {
                const icoBlob = await convertPngToIco(pngBlob);
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve({
                    size: icoBlob.size,
                    width: iconSize,
                    height: iconSize,
                    dataUrl: reader.result as string
                  });
                };
                reader.readAsDataURL(icoBlob);
              } catch (err) {
                reject(err);
              }
            }, "image/png");
          } else {
            // Standard browser outputs: WebP, JPEG, PNG, AVIF, TIFF
            const qFactor = quality / 100;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Canvas conversion to blob failed"));
                  return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve({
                    size: blob.size,
                    width: w,
                    height: h,
                    dataUrl: reader.result as string
                  });
                };
                reader.readAsDataURL(blob);
              },
              outputFormat,
              outputFormat === "image/png" ? undefined : qFactor
            );
          }
        };
        img.onerror = () => reject(new Error("Could not draw file onto canvas board"));
        img.src = sourceImgSrc;
      } catch (err: any) {
        reject(err);
      }
    });
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessingPercentage(0);
    setRemainingFiles(files.length);

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      setCurrentProcessingName(item.name);
      setRemainingFiles(files.length - i);
      
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isProcessing: true } : f));

      try {
        const processed = await convertSingleImage(item);
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
          error: err.message || "Failed to convert" 
        } : f));
      }

      setProcessingPercentage(Math.round(((i + 1) / files.length) * 100));
    }

    setRemainingFiles(0);
    setIsProcessing(false);
    onAddToast("Batch conversion completed successfully!", "success");
  };

  const getFormatExtension = (mimeType: string) => {
    switch (mimeType) {
      case "image/jpeg": return "jpg";
      case "image/png": return "png";
      case "image/webp": return "webp";
      case "image/avif": return "avif";
      case "image/bmp": return "bmp";
      case "image/tiff": return "tiff";
      case "image/x-icon": return "ico";
      default: return "converted";
    }
  };

  const computeOutputName = (originalName: string) => {
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const ext = getFormatExtension(outputFormat);
    return `${fileNamePrefix}${baseName}${fileNameSuffix}.${ext}`;
  };

  const handleDownloadSingle = (item: ImageFileItem) => {
    if (!item.processedDataUrl) return;

    const link = document.createElement("a");
    link.href = item.processedDataUrl;
    link.download = computeOutputName(item.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    postDownload.show("Image Converter");
  };

  const handleDownloadZip = async () => {
    const processedFiles = files.filter(f => f.processedDataUrl);
    if (processedFiles.length === 0) return;

    const zip = new JSZip();

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      if (item.processedDataUrl) {
        const base64Data = item.processedDataUrl.split(",")[1];
        zip.file(computeOutputName(item.name), base64Data, { base64: true });
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "gainutility_converted_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      onAddToast("Batch converted ZIP archive compiled!", "success");
      postDownload.show("Image Converter");
    } catch (err) {
      onAddToast("Failed to compile ZIP packaging.", "error");
    }
  };

  // Split view slider handlers
  const handleSliderMove = (e: React.MouseEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleSliderTouch = (e: React.TouchEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const hasProcessedFiles = files.some(f => f.processedDataUrl);
  const selectedItem = files[selectedIndex];

  // Helper size formatter
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  /** Honest delta label: "-42%" when smaller, "+18%" when larger (conversion can grow files). */
  const formatSizeDelta = (processedBytes: number, originalBytes: number): string => {
    if (!originalBytes || !processedBytes) return "";
    const pct = Math.round((1 - processedBytes / originalBytes) * 100);
    return pct >= 0 ? `-${pct}%` : `+${-pct}%`;
  };

  const outputFormatsList = [
    { id: "image/webp", label: "WEBP", desc: "Best for web page speed optimization" },
    { id: "image/png", label: "PNG", desc: "Lossless, retains high color & transparency" },
    { id: "image/jpeg", label: "JPG", desc: "Most compatible, perfect for photos" },
    { id: "image/avif", label: "AVIF", desc: "Next-gen standard, superior compression" },
    { id: "image/bmp", label: "BMP", desc: "Standard lossless Windows bitmap format" },
    { id: "image/tiff", label: "TIFF", desc: "Highest detail, popular in desktop publishing" },
    { id: "image/x-icon", label: "ICO", desc: "Favicon icons for websites (resizes to 256)" }
  ];

  return (
    <div className="w-full flex flex-col gap-10">
      
      {files.length === 0 ? (
        <UniversalUploadComponent
          accept="image/*,.heic,.heif,.svg,.tiff,.tif,.bmp,.ico"
          supportedFormats="JPG, JPEG, PNG, WEBP, AVIF, HEIC, SVG, BMP, TIFF, ICO, GIF (1st frame)"
          onFilesAdded={handleFilesAdded}
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Preview & Interactive split comparison */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Split Comparison Slider card */}
            <Card 
              title={tt("image-converter", "compareTitle", locale, "Interactive Comparison Preview")} 
              subtitle={tt("image-converter", "compareSubtitle", locale, "Drag the vertical split line to compare Original vs Converted")} 
              className="relative"
              extra={
                <div className="flex flex-wrap items-center gap-1.5">
                  <label
                    className="px-2.5 py-1 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors inline-flex items-center"
                  >
                    <span>{tt("image-converter", "addFile", locale, "Add File")}</span>
                    <input
                      id="converter-add-input"
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif,.svg,.tiff,.tif,.bmp,.ico"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileList: File[] = [];
                          for (let i = 0; i < e.target.files.length; i++) {
                            fileList.push(e.target.files[i]);
                          }
                          handleFilesAdded(fileList);
                        }
                        e.target.value = "";
                      }}
                      className="sr-only"
                    />
                  </label>

                  <label
                    className="px-2.5 py-1 text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488]/20 rounded-lg cursor-pointer transition-colors inline-flex items-center"
                  >
                    <span>Replace</span>
                    <input
                      id="converter-replace-input"
                      type="file"
                      accept="image/*,.heic,.heif,.svg,.tiff,.tif,.bmp,.ico"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0] && selectedItem) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onerror = () => console.error("Read error on replace");
                          reader.onload = (readerEvent) => {
                            const dataUrl = readerEvent.target?.result as string;
                            const img = new Image();
                            img.onerror = () => console.error("Decode error on replace");
                            img.onload = () => {
                              setFiles(prev => {
                                const next = [...prev];
                                next[selectedIndex] = {
                                  id: Math.random().toString(36).substring(2, 9),
                                  file,
                                  name: file.name,
                                  originalSize: file.size,
                                  originalWidth: img.naturalWidth,
                                  originalHeight: img.naturalHeight,
                                  originalDataUrl: dataUrl,
                                  isProcessing: false
                                };
                                return next;
                              });
                            };
                            img.src = dataUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                      className="sr-only"
                    />
                  </label>

                  <button
                    onClick={() => {
                      setFiles(prev => {
                        const filtered = prev.filter((_, idx) => idx !== selectedIndex);
                        if (selectedIndex >= filtered.length) {
                          setSelectedIndex(Math.max(0, filtered.length - 1));
                        }
                        return filtered;
                      });
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Remove
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-xs font-bold text-text-muted hover:text-status-error bg-surface-muted hover:bg-status-error/10 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              }
            >
              {selectedItem ? (
                <div className="space-y-4">
                  {selectedItem.name.toLowerCase().endsWith(".heic") && !selectedItem.processedDataUrl ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface-muted rounded-xl border border-dashed border-border-light text-center gap-4">
                      <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                      <div>
                        <p className="font-sans font-semibold text-text-main">HEIC Image Enqueued</p>
                        <p className="text-xs text-text-muted mt-1 max-w-sm">HEIC images decode dynamically during the conversion process in the browser sandbox.</p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      ref={sliderContainerRef}
                      onMouseMove={handleSliderMove}
                      onTouchMove={handleSliderTouch}
                      className="relative w-full aspect-video md:aspect-[16/10] gu-checkerboard rounded-xl overflow-hidden border border-border-light select-none cursor-ew-resize"
                    >
                      {/* Left: Original */}
                      {selectedItem.originalDataUrl ? (
                        <img 
                          src={selectedItem.originalDataUrl} 
                          alt="Original" 
                          className="absolute inset-0 w-full h-full object-contain p-2"
                          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100, 0 100)` }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-text-disabled text-sm">Original preview loading...</div>
                      )}
                      
                      {/* Right: Converted or placeholder */}
                      <img 
                        src={selectedItem.processedDataUrl || selectedItem.originalDataUrl} 
                        alt="Converted Preview" 
                        className="absolute inset-0 w-full h-full object-contain p-2"
                        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100, ${sliderPosition}% 100)` }}
                        referrerPolicy="no-referrer"
                      />

                      {/* Split boundary divider */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-brand-primary flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg border border-white shrink-0 pointer-events-auto">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Top labels */}
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded select-none">
                        Original
                      </div>
                      <div className="absolute top-3 right-3 bg-brand-primary/90 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded select-none">
                        {selectedItem.processedDataUrl ? "Converted" : "Original View"}
                      </div>
                    </div>
                  )}

                  {/* Active file metadata banner */}
                  <div className="bg-surface-muted/50 border border-border-light rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-text-muted font-mono uppercase tracking-wider text-[10px]">Dimensions</p>
                      <p className="text-text-main font-semibold mt-0.5">
                        {selectedItem.originalWidth} × {selectedItem.originalHeight} px
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted font-mono uppercase tracking-wider text-[10px]">Aspect Ratio</p>
                      <p className="text-text-main font-semibold mt-0.5">
                        {(selectedItem.originalWidth / selectedItem.originalHeight).toFixed(2)}:1
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted font-mono uppercase tracking-wider text-[10px]">Original Size</p>
                      <p className="text-text-main font-semibold mt-0.5">
                        {formatBytes(selectedItem.originalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted font-mono uppercase tracking-wider text-[10px]">Status</p>
                      {selectedItem.processedDataUrl ? (
                        <p className="text-brand-primary font-bold mt-0.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Converted ({formatSizeDelta(selectedItem.processedSize, selectedItem.originalSize)})
                        </p>
                      ) : selectedItem.error ? (
                        <p className="text-status-error font-semibold mt-0.5">{selectedItem.error}</p>
                      ) : (
                        <p className="text-text-muted mt-0.5">Ready</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>

            {/* Queue Manager Table */}
            <Card title={ttf("image-converter", "queueTitle", locale, { count: String(files.length) }, `Queue Management List (${files.length} items)`)} subtitle={tt("image-converter", "queueSubtitle", locale, "Select an item to view or customize output parameters")}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-light text-text-muted font-mono uppercase">
                      <th className="py-3 px-2">Filename</th>
                      <th className="py-3 px-2">Original Size</th>
                      <th className="py-3 px-2">Output Target</th>
                      <th className="py-3 px-2 text-right">Result</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/40">
                    {files.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedIndex(idx)}
                          className={`group cursor-pointer transition-colors ${isSelected ? "bg-brand-primary-light/10" : "hover:bg-surface-muted/40"}`}
                        >
                          <td className="py-3.5 px-2 font-medium text-text-main max-w-xs truncate">
                            <div className="flex items-center gap-2">
                              <ImageIcon className={`w-4 h-4 shrink-0 ${isSelected ? "text-brand-primary" : "text-text-muted"}`} />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-text-muted">{formatBytes(item.originalSize)}</td>
                          <td className="py-3.5 px-2 font-semibold text-brand-primary">
                            {getFormatExtension(outputFormat).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            {item.processedSize ? (
                              <div className="flex flex-col items-end">
                                <span className="font-bold text-text-main">{formatBytes(item.processedSize)}</span>
                                <span className={`text-[10px] font-mono font-bold ${item.processedSize <= item.originalSize ? "text-brand-primary" : "text-amber-600"}`}>
                                  {formatSizeDelta(item.processedSize, item.originalSize)}
                                </span>
                              </div>
                            ) : item.isProcessing ? (
                              <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin inline" />
                            ) : item.error ? (
                              <span className="text-status-error font-medium">Failed</span>
                            ) : (
                              <span className="text-text-disabled">Pending</span>
                            )}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.processedDataUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadSingle(item);
                                  }}
                                  className="p-1 rounded hover:bg-surface-muted text-brand-primary cursor-pointer"
                                  title={tt("image-converter", "downloadSingle", locale, "Download single file")}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                className="p-1 rounded hover:bg-surface-muted text-status-error cursor-pointer"
                                title={tt("image-converter", "removeFile", locale, "Remove file")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-light">
                <Button 
                  onClick={handleClearAll} 
                  variant="outline" 
                  className="text-status-error border-status-error/15 hover:bg-status-error/5 hover:text-status-error"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {tt("image-converter", "clearQueue", locale, "Clear Entire Queue")}
                </Button>

                {hasProcessedFiles && (
                  <div className="flex gap-2.5">
                    <Button onClick={handleDownloadZip}>
                      <FolderArchive className="w-4 h-4 mr-2" />
                      {tt("image-converter", "downloadZip", locale, "Download All as ZIP")}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

          </div>

          {/* Right panel: Target configuration & Advanced settings sidebar */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Primary Target card */}
            <Card title={tt("image-converter", "conversionSettings", locale, "Conversion Settings")}>
              <div className="space-y-6">
                
                {/* Format selection */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">{tt("image-converter", "outputFormat", locale, "Output Format")}</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {outputFormatsList.map(fmt => {
                      const supported = codecSupport[fmt.id] !== false;
                      const isSelected = outputFormat === fmt.id;
                      return (
                        <Button
                          key={fmt.id}
                          onClick={() => {
                            if (supported) setOutputFormat(fmt.id);
                            else onAddToast(`${fmt.label} encoding is not available in this browser`, "warning");
                          }}
                          disabled={!supported}
                          variant={isSelected ? "primary" : "outline"}
                          size="sm"
                          className="w-full justify-start gap-3 text-left py-3 px-4"
                        >
                          <div className="flex items-center justify-between flex-1">
                            <span className="font-bold text-sm">{fmt.label}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
                          </div>
                          <p className={`text-[11px] mt-0.5 leading-normal ${!supported ? "text-text-disabled" : "text-text-muted"}`}>
                            {supported ? fmt.desc : "Not encodable in this browser - would silently produce PNG"}
                          </p>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Quality Factor */}
                {outputFormat !== "image/png" && outputFormat !== "image/bmp" && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-muted">{tt("image-converter", "compressionQuality", locale, "Compression Quality")}</span>
                      <span className="text-brand-primary font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={e => setQuality(parseInt(e.target.value))}
                      className="w-full accent-brand-primary h-2 bg-border-light rounded-lg cursor-ew-resize focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted font-mono uppercase">
                      <span>{tt("image-converter", "maxCompression", locale, "Max Compression")}</span>
                      <span>{tt("image-converter", "highFidelity", locale, "High Fidelity")}</span>
                    </div>
                  </div>
                )}

                {/* Advanced parameters accordion trigger */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2.5 text-xs font-sans font-bold text-text-sub hover:text-brand-primary transition-colors border-t border-b border-border-light cursor-pointer whitespace-nowrap"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    {showAdvanced ? tt("image-converter", "hideAdvanced", locale, "Hide Advanced Options") : tt("image-converter", "showAdvanced", locale, "Show Advanced Options (Resizing, Custom Colors)")}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                {/* Advanced parameters collapsible panel */}
                {showAdvanced && (
                  <div className="space-y-5 animate-fade-in text-xs">
                    
                    {/* Dimension resize options */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">{tt("image-converter", "resizeDimensions", locale, "Resize Dimensions")}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted">{tt("image-converter", "widthPx", locale, "Width (px)")}</span>
                          <input
                            type="number"
                            value={resizeWidth}
                            onChange={e => handleWidthChange(e.target.value)}
                            placeholder={tt("image-converter", "widthPh", locale, "Width")}
                            className="w-full py-2 px-3 border border-border-light rounded-lg bg-surface-base focus:border-brand-primary outline-none font-semibold text-text-main"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted">{tt("image-converter", "heightPx", locale, "Height (px)")}</span>
                          <input
                            type="number"
                            value={resizeHeight}
                            onChange={e => handleHeightChange(e.target.value)}
                            placeholder={tt("image-converter", "heightPh", locale, "Height")}
                            className="w-full py-2 px-3 border border-border-light rounded-lg bg-surface-base focus:border-brand-primary outline-none font-semibold text-text-main"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center gap-2 mt-2 select-none cursor-pointer text-text-sub font-medium">
                        <input
                          type="checkbox"
                          checked={keepAspectRatio}
                          onChange={e => setKeepAspectRatio(e.target.checked)}
                          className="accent-brand-primary w-4 h-4 rounded"
                        />
                        <span>{tt("image-converter", "preserveAspect", locale, "Preserve Aspect Ratio Constraint")}</span>
                      </label>
                    </div>

                    {/* Transparency background picker */}
                    {(outputFormat === "image/jpeg" || outputFormat === "image/bmp") && (
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">{tt("image-converter", "transparencyFill", locale, "Transparency Color Fill")}</label>
                        <p className="text-[10px] text-text-muted leading-relaxed">{tt("image-converter", "transparencyHint", locale, "Solid background color to overlay behind transparent pixels when converting to JPG/BMP.")}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={e => setBackgroundColor(e.target.value)}
                            className="w-8 h-8 rounded border border-border-light cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={e => setBackgroundColor(e.target.value)}
                            className="py-1.5 px-3 border border-border-light rounded-lg bg-surface-base focus:border-brand-primary outline-none font-mono text-center text-text-main font-semibold uppercase max-w-[100px]"
                          />
                          <div className="flex gap-1.5">
                            {["#FFFFFF", "#000000", "#F5F5F5", "#E5E5E5"].map(c => (
                              <button
                                key={c}
                                onClick={() => setBackgroundColor(c)}
                                className="w-5 h-5 rounded border border-border-light cursor-pointer hover:scale-105 transition-transform"
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Output naming configuration */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">{tt("image-converter", "renamePattern", locale, "Output File Renaming Pattern")}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted">{tt("image-converter", "filenamePrefix", locale, "Filename Prefix")}</span>
                          <input
                            type="text"
                            value={fileNamePrefix}
                            onChange={e => setFileNamePrefix(e.target.value)}
                            placeholder={tt("image-converter", "prefixPh", locale, "e.g. optimized_")}
                            className="w-full py-1.5 px-2.5 border border-border-light rounded-lg bg-surface-base focus:border-brand-primary outline-none font-mono text-text-main"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted">{tt("image-converter", "filenameSuffix", locale, "Filename Suffix")}</span>
                          <input
                            type="text"
                            value={fileNameSuffix}
                            onChange={e => setFileNameSuffix(e.target.value)}
                            placeholder={tt("image-converter", "suffixPh", locale, "e.g. _converted")}
                            className="w-full py-1.5 px-2.5 border border-border-light rounded-lg bg-surface-base focus:border-brand-primary outline-none font-mono text-text-main"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-text-disabled leading-normal font-mono">
                        Preview: {selectedItem ? computeOutputName(selectedItem.name) : "image_converted.webp"}
                      </p>
                    </div>

                    {/* Metadata handler */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">{tt("image-converter", "metadataConfig", locale, "Metadata (EXIF) Configuration")}</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Button
                          onClick={() => setStripMetadata(true)}
                          variant={stripMetadata ? "primary" : "outline"}
                          size="sm"
                          className="w-full justify-center py-1.5"
                        >
                          {tt("image-converter", "stripExif", locale, "Strip GPS/EXIF")}
                        </Button>
                        <Button
                          onClick={() => setStripMetadata(false)}
                          variant={!stripMetadata ? "primary" : "outline"}
                          size="sm"
                          className="w-full justify-center py-1.5"
                        >
                          {tt("image-converter", "retainExif", locale, "Retain (If supported)")}
                        </Button>
                      </div>
                      <p className="text-[9px] text-text-disabled leading-normal">{tt("image-converter", "exifHint", locale, "Stripping EXIF/GPS logs reduces files by up to 20KB and prevents location leakage on publication.")}</p>
                    </div>

                  </div>
                )}

                {/* Process / Convert Action Button */}
                <Button
                  onClick={processImages}
                  disabled={isProcessing}
                  className="w-full justify-center gap-2.5 h-12 shadow-premium-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  <span className="font-bold text-sm">
                    {isProcessing ? tt("image-converter", "convertingTitle", locale, "Converting Enqueued Queue...") : tt("image-converter", "applyParams", locale, "Apply Conversion Parameters")}
                  </span>
                </Button>

                {isProcessing && (
                  <div className="space-y-1 bg-surface-muted/60 p-3 rounded-lg border border-border-light">
                    <div className="flex justify-between text-[11px] text-text-sub">
                      <span>Currently Converting: <strong className="text-brand-primary truncate max-w-[150px] inline-block align-bottom">{currentProcessingName}</strong></span>
                      <span>{processingPercentage}%</span>
                    </div>
                    <div className="w-full bg-border-light rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${processingPercentage}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-disabled mt-1 font-mono">
                      <span>{remainingFiles} files remaining</span>
                      <span>Uniform Batch Processing</span>
                    </div>
                  </div>
                )}

              </div>
            </Card>

          </div>

        </div>
      )}

      {/* Post-conversion download panel — immediately after the workspace so
          Download is always the primary action once results exist. */}
      {hasProcessedFiles && !isProcessing && (
        <UniversalDownloadPanel
          onDownloadSingle={() => {
            const item = files.find(f => f.processedDataUrl);
            if (item) handleDownloadSingle(item);
          }}
          onDownloadZip={files.filter(f => f.processedDataUrl).length > 1 ? handleDownloadZip : undefined}
          onClearAll={handleClearAll}
          hasMultiple={files.filter(f => f.processedDataUrl).length > 1}
          files={files}
          outputType={getFormatExtension(outputFormat).toUpperCase()}
          originalSize={files.reduce((sum, f) => sum + f.originalSize, 0)}
          processedSize={files.filter(f => f.processedSize).reduce((sum, f) => sum + (f.processedSize || 0), 0)}
          status={`${files.filter(f => f.processedDataUrl).length} of ${files.length} converted`}
          onAddToast={onAddToast}
        />
      )}

      {/* Related tools — strictly after Download, never before it. */}
      {hasProcessedFiles && !isProcessing && (
        <ContinueEditing
          currentToolId="image-converter"
          files={files}
          onChangeView={onChangeView}
          onAddToast={onAddToast}
        />
      )}

      {/* Mobile sticky download bar — same task surfaced on small screens. */}
      <StickyMobileAction visible={hasProcessedFiles && !isProcessing}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">
              {getFormatExtension(outputFormat).toUpperCase()} ·{" "}
              {files.filter(f => f.processedDataUrl).length} of {files.length} ready
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const item = files.find(f => f.processedDataUrl);
              if (item) handleDownloadSingle(item);
            }}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-sm transition-all duration-200 shadow-premium-sm active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>{tt("image-converter", "downloadSingle", locale, "Download")}</span>
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
