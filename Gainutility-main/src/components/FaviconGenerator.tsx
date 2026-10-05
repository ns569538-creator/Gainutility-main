/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ViewState } from "../types";
import {
  Upload,
  Type,
  Shapes,
  Smile,
  Download,
  Copy,
  Check,
  RefreshCw,
  FolderArchive,
  Monitor,
  Smartphone,
  Bookmark,
  Search,
  Eye,
  EyeOff,
  Sliders,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Palette,
  RotateCw,
  ZoomIn,
  Shield,
  FileCode,
  Globe,
  Trash2,
} from "lucide-react";
import { Button, Card, Breadcrumbs, StickyMobileAction } from "./Common";
import { ContinueEditing } from "./ContinueEditing";
import JSZip from "jszip";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import { FAVICON_SYMBOLS, SYMBOL_CATEGORIES, FaviconSymbol } from "./favicon/faviconSymbols";
import {
  COLOR_PALETTES,
  CURATED_FONTS,
  STYLE_PRESETS,
  STARTER_EXAMPLES,
  calculateContrast,
  StylePreset,
  StarterExample,
} from "./favicon/faviconPresets";
import {
  dataUrlToBytes,
  buildIcoFile,
  generateWebManifest,
  generateHtmlSnippet,
} from "./favicon/faviconIco";

interface FaviconGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

type GeneratorMode = "upload" | "text" | "symbol" | "emoji";
type ShapeType = "square" | "rounded" | "circle" | "custom";

export const FaviconGenerator: React.FC<FaviconGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView,
}) => {
  const postDownload = usePostDownload();

  // Mode Selection
  const [mode, setMode] = useState<GeneratorMode>("upload");

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text / Initials state
  const [text, setText] = useState<string>("GU");
  const [fontFamily, setFontFamily] = useState<string>(CURATED_FONTS[0].fontFamily);
  const [fontWeight, setFontWeight] = useState<number>(800);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);

  // Symbol state
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>("star");
  const [symbolCategory, setSymbolCategory] = useState<string>("All");
  const [symbolSearch, setSymbolSearch] = useState<string>("");

  // Emoji state
  const [emoji, setEmoji] = useState<string>("⚡");

  // Common Canvas Styling & Layout
  const [shape, setShape] = useState<ShapeType>("rounded");
  const [customRadius, setCustomRadius] = useState<number>(22); // 0 to 50%
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>("#131913");
  const [fgColor, setFgColor] = useState<string>("#D97A3F");
  const [padding, setPadding] = useState<number>(14); // 0 to 40%
  const [scale, setScale] = useState<number>(1); // 0.5 to 2.5
  const [panX, setPanX] = useState<number>(0); // -50 to 50
  const [panY, setPanY] = useState<number>(0); // -50 to 50
  const [rotation, setRotation] = useState<number>(0); // -180 to 180
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);

  // Metadata / Manifest
  const [appTitle, setAppTitle] = useState<string>("My Website");
  const [appShortName, setAppShortName] = useState<string>("Website");

  // Real Multi-Size Render Previews (data URLs)
  const [masterDataUrl, setMasterDataUrl] = useState<string>("");
  const [preview16, setPreview16] = useState<string>("");
  const [preview32, setPreview32] = useState<string>("");
  const [preview48, setPreview48] = useState<string>("");
  const [preview180, setPreview180] = useState<string>("");
  const [preview192, setPreview192] = useState<string>("");
  const [preview512, setPreview512] = useState<string>("");

  // Generation & Packaging
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Active Context Tab
  const [contextTab, setContextTab] = useState<"tab" | "bookmark" | "mobile" | "search">("tab");

  // Live Contrast Score
  const contrastRatio = useMemo(() => {
    if (isTransparent) return 4.5; // neutral
    return calculateContrast(fgColor, bgColor);
  }, [fgColor, bgColor, isTransparent]);

  const hasLowContrast = !isTransparent && contrastRatio < 3.0;

  // Curated Symbols filtered
  const filteredSymbols = useMemo(() => {
    return FAVICON_SYMBOLS.filter((s) => {
      const matchCat = symbolCategory === "All" || s.category === symbolCategory;
      const matchSearch =
        !symbolSearch ||
        s.name.toLowerCase().includes(symbolSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(symbolSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [symbolCategory, symbolSearch]);

  const selectedSymbol = useMemo(() => {
    return FAVICON_SYMBOLS.find((s) => s.id === selectedSymbolId) || FAVICON_SYMBOLS[0];
  }, [selectedSymbolId]);

  // Master Render Canvas generator
  const renderMasterCanvas = useCallback(
    (size: number, withSafeAreaOverlay: boolean = false): HTMLCanvasElement => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return canvas;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, size, size);

      // Determine corner radius in pixels
      let radiusPx = 0;
      if (shape === "circle") {
        radiusPx = size / 2;
      } else if (shape === "rounded") {
        radiusPx = size * 0.22; // iOS squircle proportion
      } else if (shape === "custom") {
        radiusPx = size * (customRadius / 100);
      } else {
        radiusPx = 0; // square
      }

      // Clip path for container shape
      ctx.save();
      ctx.beginPath();
      if (shape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (radiusPx > 0) {
        ctx.roundRect(0, 0, size, size, radiusPx);
      } else {
        ctx.rect(0, 0, size, size);
      }
      ctx.closePath();
      ctx.clip();

      // Fill background if not transparent
      if (!isTransparent) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }

      // Transform inner coordinate space
      const cx = size / 2 + (panX / 100) * size;
      const cy = size / 2 + (panY / 100) * size;
      ctx.save();
      ctx.translate(cx, cy);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      ctx.scale(scale, scale);

      // Content drawing bounds with padding
      const padPx = (padding / 100) * size;
      const availableSize = Math.max(1, size - padPx * 2);

      // Render based on active mode
      if (mode === "upload" && uploadedImage) {
        const iw = uploadedImage.naturalWidth || uploadedImage.width;
        const ih = uploadedImage.naturalHeight || uploadedImage.height;
        let dw = availableSize;
        let dh = availableSize;
        if (iw > ih) {
          dw = availableSize * (iw / ih);
        } else {
          dh = availableSize * (ih / iw);
        }
        ctx.drawImage(uploadedImage, -dw / 2, -dh / 2, dw, dh);
      } else if (mode === "text") {
        const textVal = text.trim() || "GU";
        const fontSize = textVal.length > 2 ? availableSize * 0.42 : availableSize * 0.58;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fgColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.letterSpacing = `${(letterSpacing / 100) * fontSize}px`;
        ctx.fillText(textVal, 0, 0);
      } else if (mode === "symbol") {
        const pathData = selectedSymbol.path;
        const p2d = new Path2D(pathData);
        const iconScale = availableSize / 24;
        ctx.save();
        ctx.scale(iconScale, iconScale);
        ctx.translate(-12, -12); // Center 24x24 path around origin
        ctx.fillStyle = fgColor;
        ctx.fill(p2d);
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = 1.2;
        ctx.stroke(p2d);
        ctx.restore();
      } else if (mode === "emoji") {
        const emojiVal = emoji || "⚡";
        const fontSize = availableSize * 0.65;
        ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emojiVal, 0, 0);
      }

      ctx.restore(); // restore transformed inner space
      ctx.restore(); // restore clipping path

      // Safe area overlay (non-exported guide)
      if (withSafeAreaOverlay) {
        ctx.save();
        ctx.strokeStyle = "#D97A3F";
        ctx.lineWidth = Math.max(1, size * 0.015);
        ctx.setLineDash([size * 0.02, size * 0.02]);
        // Inner 80% circle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      return canvas;
    },
    [
      mode,
      uploadedImage,
      text,
      fontFamily,
      fontWeight,
      letterSpacing,
      selectedSymbol,
      emoji,
      shape,
      customRadius,
      isTransparent,
      bgColor,
      fgColor,
      padding,
      scale,
      panX,
      panY,
      rotation,
    ]
  );

  // Sync previews whenever parameters change
  useEffect(() => {
    const c512 = renderMasterCanvas(512, showSafeArea);
    setMasterDataUrl(c512.toDataURL("image/png"));

    const c16 = renderMasterCanvas(16, false);
    setPreview16(c16.toDataURL("image/png"));

    const c32 = renderMasterCanvas(32, false);
    setPreview32(c32.toDataURL("image/png"));

    const c48 = renderMasterCanvas(48, false);
    setPreview48(c48.toDataURL("image/png"));

    const c180 = renderMasterCanvas(180, false);
    setPreview180(c180.toDataURL("image/png"));

    const c192 = renderMasterCanvas(192, false);
    setPreview192(c192.toDataURL("image/png"));

    const c512clean = renderMasterCanvas(512, false);
    setPreview512(c512clean.toDataURL("image/png"));
  }, [renderMasterCanvas, showSafeArea]);

  // Image Upload Handler
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onAddToast("Please upload a valid image (PNG, JPG, WEBP, or SVG).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setUploadedFileName(file.name);
        setUploadedFileUrl(result);
        setMode("upload");
        setScale(1);
        setPanX(0);
        setPanY(0);
        setRotation(0);
        onAddToast(`Loaded ${file.name} (${img.naturalWidth}×${img.naturalHeight})`, "success");
      };
      img.onerror = () => {
        onAddToast("Could not decode this image. Try another file.", "error");
      };
      img.src = result;
    };
    reader.onerror = () => {
      onAddToast("Failed to read the selected file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Reset to default
  const handleReset = () => {
    setMode("text");
    setText("GU");
    setFontFamily(CURATED_FONTS[0].fontFamily);
    setFontWeight(800);
    setLetterSpacing(0);
    setShape("rounded");
    setCustomRadius(22);
    setIsTransparent(false);
    setBgColor("#131913");
    setFgColor("#D97A3F");
    setPadding(14);
    setScale(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setShowSafeArea(false);
    setUploadedImage(null);
    setUploadedFileName("");
    setHasGenerated(false);
    onAddToast("Workspace reset to clean default.", "info");
  };

  // Apply Preset
  const handleApplyPreset = (preset: StylePreset) => {
    setFontFamily(preset.fontFamily);
    setFontWeight(preset.fontWeight);
    setShape(preset.shape);
    setCustomRadius(preset.cornerRadiusPercent);
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setIsTransparent(preset.isTransparent);
    setPadding(preset.padding);
    onAddToast(`Applied style preset: ${preset.name}`, "success");
  };

  // Apply Starter
  const handleApplyStarter = (starter: StarterExample) => {
    setMode(starter.type);
    if (starter.type === "text") {
      setText(starter.value);
    } else if (starter.type === "symbol") {
      setSelectedSymbolId(starter.value);
    } else if (starter.type === "emoji") {
      setEmoji(starter.value);
    }
    setFgColor(starter.fg);
    setBgColor(starter.bg);
    setIsTransparent(false);
    setShape(starter.shape);
    setScale(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    onAddToast(`Loaded template: ${starter.name}`, "success");
  };

  // Export Full ZIP Package
  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // Render crisp clean frames without safe area guides
      const f16 = renderMasterCanvas(16, false).toDataURL("image/png");
      const f32 = renderMasterCanvas(32, false).toDataURL("image/png");
      const f48 = renderMasterCanvas(48, false).toDataURL("image/png");
      const f180 = renderMasterCanvas(180, false).toDataURL("image/png");
      const f192 = renderMasterCanvas(192, false).toDataURL("image/png");
      const f512 = renderMasterCanvas(512, false).toDataURL("image/png");

      zip.file("favicon-16x16.png", dataUrlToBytes(f16));
      zip.file("favicon-32x32.png", dataUrlToBytes(f32));
      zip.file("favicon-48x48.png", dataUrlToBytes(f48));
      zip.file("apple-touch-icon.png", dataUrlToBytes(f180));
      zip.file("android-chrome-192x192.png", dataUrlToBytes(f192));
      zip.file("android-chrome-512x512.png", dataUrlToBytes(f512));

      // Multi-resolution genuine .ico
      const icoBytes = buildIcoFile([
        { size: 16, dataUrl: f16 },
        { size: 32, dataUrl: f32 },
        { size: 48, dataUrl: f48 },
      ]);
      zip.file("favicon.ico", icoBytes);

      // Web Manifest
      const manifestStr = generateWebManifest({
        name: appTitle,
        shortName: appShortName,
        themeColor: bgColor,
        backgroundColor: isTransparent ? "#ffffff" : bgColor,
      });
      zip.file("site.webmanifest", manifestStr);

      // README instructions
      const readme = `# Favicon Package — Generated with GainUtility
https://gainutility.com/tools/favicon-generator

## Files Included:
- favicon.ico: Multi-resolution container (16x16, 32x32, 48x48) for desktop browsers and legacy clients.
- favicon-16x16.png: Browser tab icon.
- favicon-32x32.png: High-DPI browser tab / bookmarks bar icon.
- favicon-48x48.png: Desktop shortcut icon.
- apple-touch-icon.png (180x180): iOS Safari home-screen web clip icon.
- android-chrome-192x192.png: Android PWA homescreen icon.
- android-chrome-512x512.png: PWA splash screen & high-res icon.
- site.webmanifest: PWA application configuration.

## Installation in HTML <head>:
\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
\`\`\`
Place these files in your website's root public directory (e.g. /public or /webroot).
`;
      zip.file("README.md", readme);

      const content = await zip.generateAsync({ type: "blob" });
      const filename = `${appShortName.toLowerCase().replace(/[^a-z0-9]/gi, "_") || "favicon"}_bundle.zip`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1500);

      setHasGenerated(true);
      onAddToast("Favicon bundle generated and downloaded!", "success");
      postDownload.show("Favicon Generator");
    } catch (err) {
      onAddToast("Failed to compile ZIP package.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Individual Asset
  const downloadSingleFile = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast(`Downloaded ${filename}`, "success");
  };

  const downloadIcoDirect = () => {
    const f16 = renderMasterCanvas(16, false).toDataURL("image/png");
    const f32 = renderMasterCanvas(32, false).toDataURL("image/png");
    const f48 = renderMasterCanvas(48, false).toDataURL("image/png");
    const icoBytes = buildIcoFile([
      { size: 16, dataUrl: f16 },
      { size: 32, dataUrl: f32 },
      { size: 48, dataUrl: f48 },
    ]);
    const blob = new Blob([icoBytes], { type: "image/x-icon" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "favicon.ico";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    onAddToast("Downloaded multi-size favicon.ico", "success");
  };

  const handleCopyHtml = () => {
    const snippet = generateHtmlSnippet();
    onCopy(snippet);
    setCopiedSnippet(true);
    onAddToast("HTML head tags copied to clipboard!", "success");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyManifest = () => {
    const manifestStr = generateWebManifest({
      name: appTitle,
      shortName: appShortName,
      themeColor: bgColor,
      backgroundColor: isTransparent ? "#ffffff" : bgColor,
    });
    onCopy(manifestStr);
    setCopiedManifest(true);
    onAddToast("site.webmanifest JSON copied to clipboard!", "success");
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="py-4 sm:py-8 space-y-8 sm:space-y-12">
      {/* ── 1. STUDIO WORKSPACE ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Creator Tabs & Design Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="bg-surface-base border border-border-subtle rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-premium-sm">
            {[
              { id: "upload", label: "Upload Image", icon: <Upload className="w-4 h-4" /> },
              { id: "text", label: "Text / Initials", icon: <Type className="w-4 h-4" /> },
              { id: "symbol", label: "Symbol", icon: <Shapes className="w-4 h-4" /> },
              { id: "emoji", label: "Emoji", icon: <Smile className="w-4 h-4" /> },
            ].map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as GeneratorMode)}
                  className={`flex-1 min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    active
                      ? "bg-brand-primary text-[#FAF8F1] shadow-premium-sm"
                      : "text-text-sub hover:text-text-main hover:bg-surface-muted/60"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Starter Templates */}
          <div className="bg-surface-base border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Quick Starters
              </span>
              <span className="text-[11px] text-text-muted">One-click templates</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {STARTER_EXAMPLES.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => handleApplyStarter(starter)}
                  className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:border-border-hover bg-surface-muted/30 hover:bg-surface-muted text-xs font-semibold text-text-main transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-sm shrink-0"
                    style={{ backgroundColor: starter.bg }}
                  />
                  <span>{starter.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode-Specific Content Panels */}
          <Card>
            {mode === "upload" && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragOver
                      ? "border-brand-primary bg-brand-primary/5"
                      : "border-border-default hover:border-border-hover bg-surface-muted/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-surface-base border border-border-subtle flex items-center justify-center text-brand-primary shadow-premium-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-text-main">
                      {uploadedFileName ? `Re-upload: ${uploadedFileName}` : "Drop your image here, or browse"}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      PNG, JPG, WEBP, or SVG (square format 512×512+ recommended)
                    </p>
                  </div>
                </div>
                {uploadedImage && (
                  <div className="flex items-center justify-between text-xs text-text-muted px-1">
                    <span>
                      Active file: <strong>{uploadedFileName}</strong> ({uploadedImage.naturalWidth}×
                      {uploadedImage.naturalHeight}px)
                    </span>
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedFileName("");
                        setUploadedFileUrl("");
                      }}
                      className="text-status-error hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove file
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === "text" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-main">Text / Initials</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={text}
                      onChange={(e) => setText(e.target.value.toUpperCase())}
                      placeholder="e.g. GU"
                      className="w-full h-11 px-3.5 rounded-xl border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base text-text-main font-bold text-base outline-none transition-colors"
                    />
                    <p className="text-[11px] text-text-muted">
                      Favicons are tiny (16px). 1 or 2 characters remain easiest to recognize.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-main" htmlFor="favicon-generator-typography">Typography</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base text-text-main text-xs font-medium outline-none transition-colors"
                     id="favicon-generator-typography">
                      {CURATED_FONTS.map((f) => (
                        <option key={f.id} value={f.fontFamily}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-main">Weight</span>
                      <span className="font-mono text-text-muted">{fontWeight}</span>
                    </div>
                    <input aria-label="Font weight"
                      type="range"
                      min={400}
                      max={900}
                      step={100}
                      value={fontWeight}
                      onChange={(e) => setFontWeight(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-main">Letter Spacing</span>
                      <span className="font-mono text-text-muted">{letterSpacing}%</span>
                    </div>
                    <input aria-label="Letter spacing"
                      type="range"
                      min={-10}
                      max={30}
                      step={2}
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === "symbol" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search symbols..."
                      value={symbolSearch}
                      onChange={(e) => setSymbolSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base text-xs text-text-main outline-none"
                    />
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                    {SYMBOL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSymbolCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          symbolCategory === cat
                            ? "bg-brand-primary text-white"
                            : "bg-surface-muted/40 hover:bg-surface-muted text-text-sub"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 border border-border-subtle rounded-xl bg-surface-muted/10">
                  {filteredSymbols.map((sym) => {
                    const isSelected = selectedSymbolId === sym.id;
                    return (
                      <button
                        key={sym.id}
                        title={sym.name}
                        onClick={() => setSelectedSymbolId(sym.id)}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-primary text-white ring-2 ring-brand-primary/40 shadow-sm"
                            : "bg-surface-base hover:bg-surface-muted text-text-main border border-border-subtle"
                        }`}
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d={sym.path} />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === "emoji" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main" htmlFor="favicon-generator-emoji-character">Emoji Character</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={2}
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-16 h-14 text-center text-3xl rounded-xl border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base outline-none"
                    id="favicon-generator-emoji-character"/>
                    <div className="flex-1 text-xs text-text-muted leading-relaxed">
                      Type or paste any native emoji.
                      <span className="block text-[11px] text-brand-primary mt-0.5">
                        Notice: System emoji rendering can differ slightly between Windows, macOS, and Android.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["⚡", "🚀", "✨", "🛡️", "🔥", "💡", "🎯", "💎", "💻", "☕", "🌟", "⚙️", "📈", "🌍"].map(
                    (em) => (
                      <button
                        key={em}
                        onClick={() => setEmoji(em)}
                        className="w-9 h-9 rounded-lg border border-border-subtle bg-surface-base hover:bg-surface-muted text-base flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                      >
                        {em}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Style & Geometry Controls */}
          <Card title="Shape & Dimensions">
            <div className="space-y-5">
              {/* Shape Selection */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-main block">Container Shape</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "square", label: "Square" },
                    { id: "rounded", label: "Squircle" },
                    { id: "circle", label: "Circle" },
                    { id: "custom", label: "Custom" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id as ShapeType)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        shape === s.id
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                          : "bg-surface-base hover:bg-surface-muted border-border-subtle text-text-main"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {shape === "custom" && (
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Corner Radius</span>
                      <span className="font-mono text-text-main">{customRadius}%</span>
                    </div>
                    <input aria-label="Corner radius"
                      type="range"
                      min={0}
                      max={50}
                      value={customRadius}
                      onChange={(e) => setCustomRadius(Number(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Transform Sliders (Scale, Padding, Position, Rotation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-main">Zoom / Scale</span>
                    <span className="font-mono text-text-muted">{scale.toFixed(2)}x</span>
                  </div>
                  <input aria-label="Zoom scale"
                    type="range"
                    min={0.5}
                    max={2.2}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-main">Padding</span>
                    <span className="font-mono text-text-muted">{padding}%</span>
                  </div>
                  <input aria-label="Padding"
                    type="range"
                    min={0}
                    max={36}
                    step={2}
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Pan X</span>
                    <span className="font-mono text-text-main">{panX}%</span>
                  </div>
                  <input aria-label="Pan X"
                    type="range"
                    min={-40}
                    max={40}
                    value={panX}
                    onChange={(e) => setPanX(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Pan Y</span>
                    <span className="font-mono text-text-main">{panY}%</span>
                  </div>
                  <input aria-label="Pan Y"
                    type="range"
                    min={-40}
                    max={40}
                    value={panY}
                    onChange={(e) => setPanY(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Rotation</span>
                    <span className="font-mono text-text-main">{rotation}°</span>
                  </div>
                  <input aria-label="Rotation"
                    type="range"
                    min={-180}
                    max={180}
                    step={5}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Safe Area & Reset toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-divider">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showSafeArea}
                    onChange={(e) => setShowSafeArea(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
                  />
                  <span>Show Safe Area Guide (dashed ring)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                    setPadding(14);
                  }}
                  className="text-xs text-brand-primary hover:underline font-medium cursor-pointer"
                >
                  Reset Placement
                </button>
              </div>
            </div>
          </Card>

          {/* Color System */}
          <Card title="Color & Contrast">
            <div className="space-y-4">
              {/* Transparent Toggle & Custom Pickers */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTransparent}
                    onChange={(e) => setIsTransparent(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
                  />
                  <span>Transparent Background</span>
                </label>

                {!isTransparent && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Background:</span>
                    <div className="flex items-center gap-1.5 bg-surface-muted px-2 py-1 rounded-lg border border-border-subtle">
                      <input aria-label="Background color"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input aria-label="Background color hex"
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-16 text-xs font-mono bg-transparent text-text-main outline-none uppercase"
                      />
                    </div>
                  </div>
                )}

                {mode !== "upload" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Foreground:</span>
                    <div className="flex items-center gap-1.5 bg-surface-muted px-2 py-1 rounded-lg border border-border-subtle">
                      <input aria-label="Foreground color"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input aria-label="Foreground color hex"
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-16 text-xs font-mono bg-transparent text-text-main outline-none uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contrast warning */}
              {hasLowContrast && (
                <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-start gap-2.5 text-xs text-text-main">
                  <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-status-warning">Low contrast ({contrastRatio.toFixed(1)}:1):</span>{" "}
                    This color combination may become difficult to recognize when scaled down to 16×16 in browser tabs.
                  </div>
                </div>
              )}

              {/* Curated Color Palettes */}
              <div className="space-y-2 pt-2 border-t border-divider">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted block">
                  Curated Color Pairings
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PALETTES.slice(0, 9).map((palette, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFgColor(palette.fg);
                        setBgColor(palette.bg);
                        setIsTransparent(false);
                      }}
                      className="p-2 rounded-xl border border-border-subtle hover:border-border-hover bg-surface-base text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: palette.bg }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: palette.fg }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-text-main truncate">
                          {palette.name}
                        </span>
                        <span className="block text-[10px] text-text-muted">{palette.group}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Previews & Small-Size Check */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Visual Canvas Preview */}
          <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-premium-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Master Icon Canvas
              </span>
              <span className="text-xs font-semibold text-brand-primary">512×512 HD</span>
            </div>

            {/* Checkerboard container for transparency visualization */}
            <div className="aspect-square w-full max-w-[280px] mx-auto rounded-2xl p-4 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] border border-border-subtle shadow-inner relative">
              {masterDataUrl && (
                <img
                  src={masterDataUrl}
                  alt="Favicon master preview"
                  className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                />
              )}
            </div>

            {/* Metadata Fields for Manifest */}
            <div className="space-y-3 pt-3 border-t border-divider">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">Website / App Name</label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="e.g. Acme Studio"
                  className="w-full h-9 px-3 rounded-lg border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base text-xs text-text-main outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-main">Short Name (Homescreen)</label>
                <input
                  type="text"
                  value={appShortName}
                  onChange={(e) => setAppShortName(e.target.value)}
                  placeholder="e.g. Acme"
                  className="w-full h-9 px-3 rounded-lg border border-border-input hover:border-border-default focus:border-brand-primary bg-surface-base text-xs text-text-main outline-none"
                />
              </div>
            </div>

            {/* Primary Generation CTA Button */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleDownloadZip}
                disabled={isGenerating}
                className="w-full justify-center gap-2 font-bold min-h-[48px]"
              >
                <FolderArchive className="w-5 h-5" />
                <span>{isGenerating ? "Compiling Assets..." : "Download Favicon Package (.zip)"}</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={downloadIcoDirect}
                  className="flex-1 justify-center text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ico</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => downloadSingleFile(preview32, "favicon-32x32.png")}
                  className="flex-1 justify-center text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG 32px</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="px-3 text-text-muted hover:text-text-main"
                  title="Reset workspace"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* ── 2. SMALL-SIZE CHECK (CRUCIAL REQUIREMENT) ── */}
          <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-premium-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-sans font-bold text-text-main">Small-Size Check</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Details that look good at 512px can disappear at 16px.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-muted text-brand-primary border border-border-subtle">
                CRUCIAL
              </span>
            </div>

            {/* Prominent 16px & 32px inspection loupe */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-border-subtle bg-surface-muted/30 flex flex-col items-center justify-center gap-2">
                <span className="text-[11px] font-mono text-text-muted">16×16 Actual & Loupe</span>
                <div className="flex items-center gap-4">
                  {/* Actual size */}
                  <img src={preview16} alt="16px actual" className="w-4 h-4 shrink-0 shadow-sm" />
                  {/* 4x zoomed */}
                  <div className="w-12 h-12 border border-border-subtle rounded bg-surface-base flex items-center justify-center overflow-hidden">
                    <img
                      src={preview16}
                      alt="16px loupe"
                      className="w-10 h-10 [image-rendering:pixelated]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border-subtle bg-surface-muted/30 flex flex-col items-center justify-center gap-2">
                <span className="text-[11px] font-mono text-text-muted">32×32 Actual & Loupe</span>
                <div className="flex items-center gap-4">
                  {/* Actual size */}
                  <img src={preview32} alt="32px actual" className="w-8 h-8 shrink-0 shadow-sm" />
                  {/* 2x zoomed */}
                  <div className="w-12 h-12 border border-border-subtle rounded bg-surface-base flex items-center justify-center overflow-hidden">
                    <img
                      src={preview32}
                      alt="32px loupe"
                      className="w-12 h-12 [image-rendering:pixelated]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scale matrix strip */}
            <div className="flex items-center justify-between gap-1 p-3 rounded-xl border border-border-subtle bg-surface-base">
              {[
                { size: 16, src: preview16 },
                { size: 32, src: preview32 },
                { size: 48, src: preview48 },
                { size: 64, src: preview180 },
                { size: 128, src: preview192 },
              ].map((item) => (
                <div key={item.size} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded border border-border-subtle/60 flex items-center justify-center bg-surface-muted/20">
                    <img
                      src={item.src}
                      alt={`${item.size}px`}
                      style={{ width: Math.min(item.size, 32), height: Math.min(item.size, 32) }}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{item.size}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. REAL-WORLD CONTEXT SIMULATION ───────────────────────── */}
      <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-7 shadow-premium-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-text-main text-base sm:text-lg">
                See It in Context
              </h3>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border-subtle">
                Visual Simulation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Verify how your favicon renders inside actual browser chrome and mobile home-screens.
            </p>
          </div>

          {/* Context Selector Tabs */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border-subtle">
            {[
              { id: "tab", label: "Browser Tab", icon: <Monitor className="w-3.5 h-3.5" /> },
              { id: "bookmark", label: "Bookmark", icon: <Bookmark className="w-3.5 h-3.5" /> },
              { id: "mobile", label: "Mobile App", icon: <Smartphone className="w-3.5 h-3.5" /> },
              { id: "search", label: "Search Result", icon: <Search className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContextTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contextTab === tab.id
                    ? "bg-surface-base text-text-main shadow-sm"
                    : "text-text-sub hover:text-text-main"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Context Display Window */}
        <div className="p-4 sm:p-6 rounded-2xl bg-surface-muted/30 border border-border-subtle">
          {contextTab === "tab" && (
            <div className="max-w-xl mx-auto rounded-xl border border-border-default bg-[#E2E8F0] dark:bg-[#1E293B] p-2 shadow-sm space-y-2">
              {/* Tab Header Chrome */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 pl-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center">
                  <div className="flex items-center gap-2 bg-surface-base px-3 py-1.5 rounded-t-lg border-t border-x border-border-subtle max-w-[220px] shadow-sm">
                    <img src={preview16} alt="tab icon" className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium text-text-main truncate">
                      {appTitle || "My Website"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Address bar */}
              <div className="bg-surface-base h-8 rounded-lg border border-border-subtle flex items-center px-3 gap-2 text-xs text-text-muted">
                <span className="text-status-success">🔒</span>
                <span className="font-mono text-text-main">https://example.com</span>
              </div>
            </div>
          )}

          {contextTab === "bookmark" && (
            <div className="max-w-lg mx-auto p-3 rounded-xl border border-border-subtle bg-surface-base shadow-sm space-y-2">
              <span className="text-[11px] font-mono text-text-muted block">Bookmarks Bar</span>
              <div className="flex items-center gap-4 border-t border-divider pt-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface-muted cursor-default">
                  <img src={preview16} alt="bookmark icon" className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold text-text-main">{appShortName || "Site"}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded text-text-muted text-xs">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span>GitHub</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded text-text-muted text-xs">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span>Documentation</span>
                </div>
              </div>
            </div>
          )}

          {contextTab === "mobile" && (
            <div className="max-w-xs mx-auto p-6 rounded-2xl border border-border-default bg-gradient-to-b from-slate-800 to-slate-950 text-white shadow-lg flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-white/10 flex items-center justify-center bg-black/40">
                <img src={preview180} alt="mobile app icon" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-white/90 truncate max-w-[120px]">
                {appShortName || "Website"}
              </span>
            </div>
          )}

          {contextTab === "search" && (
            <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-base shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-muted border border-border-subtle flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                  <img src={preview16} alt="search snippet icon" className="w-4 h-4 object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-text-main leading-tight truncate">
                    {appTitle || "My Website"}
                  </span>
                  <span className="block text-[11px] font-mono text-text-muted truncate">
                    https://example.com
                  </span>
                </div>
              </div>
              <h4 className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer pt-1">
                {appTitle} — Fast, Modern & Reliable Experience
              </h4>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                Discover the official site for {appTitle}. All modern features, documentation, and tools available directly online.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. COMPILED ASSET SUITE & CODE SNIPPETS ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Head Tags Installation Code */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="HTML Head Tags" subtitle="Add these tags into your document's <head> section">
            <div className="relative bg-surface-muted border border-border-subtle rounded-xl p-4 font-mono text-xs text-text-main leading-relaxed">
              <pre className="overflow-x-auto whitespace-pre">{generateHtmlSnippet()}</pre>
              <button
                onClick={handleCopyHtml}
                className="absolute top-3 right-3 p-2 bg-surface-base hover:bg-surface-muted border border-border-subtle rounded-lg text-text-sub transition-colors cursor-pointer"
                title="Copy HTML code"
              >
                {copiedSnippet ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </Card>
        </div>

        {/* Web Manifest JSON Code */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="site.webmanifest" subtitle="PWA installation and Android homescreen settings">
            <div className="relative bg-surface-muted border border-border-subtle rounded-xl p-4 font-mono text-xs text-text-main leading-relaxed">
              <pre className="overflow-x-auto whitespace-pre max-h-[160px]">
                {generateWebManifest({
                  name: appTitle,
                  shortName: appShortName,
                  themeColor: bgColor,
                  backgroundColor: isTransparent ? "#ffffff" : bgColor,
                })}
              </pre>
              <button
                onClick={handleCopyManifest}
                className="absolute top-3 right-3 p-2 bg-surface-base hover:bg-surface-muted border border-border-subtle rounded-lg text-text-sub transition-colors cursor-pointer"
                title="Copy manifest JSON"
              >
                {copiedManifest ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Package File Inventory */}
      <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-7 shadow-premium-sm space-y-4">
        <h3 className="font-sans font-bold text-text-main text-base sm:text-lg">
          Generated Favicon Package Contents
        </h3>
        <p className="text-xs text-text-muted">
          All modern resolutions included in the compiled ZIP. Free, client-side, zero server tracking.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { name: "favicon.ico", desc: "Genuine multi-res (16/32/48 embedded)", size: "Multi-size" },
            { name: "favicon-16x16.png", desc: "Standard desktop browser tabs", size: "16×16" },
            { name: "favicon-32x32.png", desc: "Retina tabs & bookmark bars", size: "32×32" },
            { name: "favicon-48x48.png", desc: "Windows shortcuts & taskbars", size: "48×48" },
            { name: "apple-touch-icon.png", desc: "iOS Safari homescreen icon", size: "180×180" },
            { name: "android-chrome-192x192.png", desc: "Android homescreen shortcut", size: "192×192" },
            { name: "android-chrome-512x512.png", desc: "PWA splash screen icon", size: "512×512" },
            { name: "site.webmanifest", desc: "PWA JSON configuration", size: "Manifest" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-surface-muted/30 border border-border-subtle rounded-xl space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-primary truncate">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono text-text-muted">{item.size}</span>
              </div>
              <span className="text-[11px] text-text-muted block leading-tight">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. DETAILED TECHNICAL & EDUCATIONAL GUIDES ─────────────── */}
      <div className="bg-surface-base border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-premium-sm space-y-8">
        <div>
          <h2 className="text-lg sm:text-2xl font-sans font-bold text-text-main">
            How to Create a Favicon That Stays Sharp at 16px
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
            A website icon occupies only 16×16 screen pixels in a browser tab. Intricate illustrations,
            long words, and subtle gradients that look beautiful at 512px frequently degrade into illegible
            blurs when downscaled. Follow these proven principles to create a recognizable mark.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
            <h4 className="font-sans font-bold text-sm text-text-main">1. Simplify to One Concept</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Don't attempt to squeeze a full company logo, tagline, or banner into a tab icon. Pick one
              distinguishable letter, monogram, or bold geometric silhouette.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
            <h4 className="font-sans font-bold text-sm text-text-main">2. Prioritize High Contrast</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Users browse in dark mode, light mode, and customized operating system color schemes. Maintain
              a contrast ratio of at least 3.5:1 between your foreground glyph and container background.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
            <h4 className="font-sans font-bold text-sm text-text-main">3. Test at 16×16 First</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Use our built-in <strong>Small-Size Check</strong> before publishing. If you cannot recognize the icon
              in 0.2 seconds at 16px, simplify the stroke weight or expand the padding.
            </p>
          </div>
        </div>

        {/* Integration Guides (HTML, Next.js, WordPress, Shopify) */}
        <div className="space-y-4 pt-4 border-t border-divider">
          <h3 className="font-sans font-bold text-base sm:text-lg text-text-main">
            Adding Favicons Across Different Frameworks & CMS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
              <span className="font-mono text-xs font-bold text-brand-primary">Next.js (App Router)</span>
              <p className="text-xs text-text-muted leading-relaxed">
                Place <code>favicon.ico</code> directly in your <code>/app</code> directory. Next.js automatically
                serves it as the root icon. For Apple icons and manifest, place them in <code>/public</code> or use
                metadata route handlers.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
              <span className="font-mono text-xs font-bold text-brand-primary">Standard HTML / Vite</span>
              <p className="text-xs text-text-muted leading-relaxed">
                Extract the ZIP files into your <code>/public</code> directory. Paste the generated <code>&lt;link&gt;</code> tags
                directly into <code>index.html</code> inside <code>&lt;head&gt;</code>.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
              <span className="font-mono text-xs font-bold text-brand-primary">WordPress</span>
              <p className="text-xs text-text-muted leading-relaxed">
                Go to <strong>Appearance → Customize → Site Identity → Site Icon</strong>. Upload the 512×512 PNG file.
                WordPress will automatically handle cropping and Apple touch icon generation.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-muted/20 space-y-2">
              <span className="font-mono text-xs font-bold text-brand-primary">Shopify</span>
              <p className="text-xs text-text-muted leading-relaxed">
                Navigate to <strong>Online Store → Themes → Customize → Theme Settings → Logo → Favicon image</strong>.
                Upload your 32×32 or 512×512 PNG.
              </p>
            </div>
          </div>
        </div>

        {/* Search Engine Crawling Disclosure */}
        <div className="p-4 rounded-xl bg-surface-muted/40 border border-border-subtle flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div className="text-xs text-text-muted leading-relaxed">
            <strong className="text-text-main">Search Engine Appearance Notice:</strong> While this tool compiles standard-compliant
            favicons, Google and Bing control their own crawling schedules. Updating your favicon on your server does not guarantee
            instant appearance in search results; search engine bots may take from a few days to several weeks to recrawl your home page
            and update their search icon caches.
          </div>
        </div>
      </div>

      {/* ── 6. COMPREHENSIVE FAQS ─────────────────────────────────── */}
      <div className="bg-surface-base border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-premium-sm space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-sans font-bold text-text-main">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Technical answers to common website icon questions.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is the favicon.ico file a genuine ICO or just a renamed PNG?",
              a: "It is a genuine multi-resolution .ico binary container. It packages 16×16, 32×32, and 48×48 PNG frames with standard ICO headers and directory offset tables. Legacy browsers and Windows desktop shortcuts parse it natively.",
            },
            {
              q: "Why does my favicon look blurry in browser tabs?",
              a: "Favicons appear blurry when a high-resolution logo with complex lines or tiny text is downscaled by the browser without proper pixel snapping, or when the website fails to provide dedicated 16x16 and 32x32 PNG assets. Providing exact dimensions prevents browser resampling blur.",
            },
            {
              q: "Do modern websites still need favicon.ico in 2026?",
              a: "Yes. Even though modern HTML uses <link rel=\"icon\" type=\"image/png\">, many tools, scrapers, bookmark managers, and browsers automatically make fallback GET requests to /favicon.ico. Providing a real favicon.ico prevents 404 errors in your server logs.",
            },
            {
              q: "What is an Apple Touch Icon and what size should it be?",
              a: "The Apple Touch Icon is used when an iOS or iPadOS Safari user taps 'Add to Home Screen' or bookmarks your site. The standard size is 180×180 PNG. Apple automatically applies subtle edge rounding.",
            },
            {
              q: "What are the 192×192 and 512×512 icons for?",
              a: "These are specified in site.webmanifest for Progressive Web Apps (PWAs) and Android devices. Android Chrome uses 192×192 for the homescreen app icon and 512×512 for the splash screen when the app opens.",
            },
            {
              q: "Can I use an emoji as my favicon?",
              a: "Yes! Emoji favicons are popular for personal blogs, prototypes, and developer tools. Keep in mind that native emoji appearance varies slightly depending on whether the visitor is on macOS, Windows, iOS, or Android.",
            },
            {
              q: "Does GainUtility upload my artwork to any server?",
              a: "No. All canvas rendering, color processing, ICO compilation, and ZIP packaging happens entirely within your web browser using HTML5 Canvas and WebAssembly/JavaScript. Your graphics never touch a server.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border-subtle bg-surface-muted/10 space-y-1.5">
              <h5 className="font-sans font-bold text-sm text-text-main">{faq.q}</h5>
              <p className="text-xs text-text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. RELATED TOOLS ──────────────────────────────────────── */}
      <ContinueEditing
        currentToolId="favicon-generator"
        files={[]}
        onAddToast={onAddToast}
        onChangeView={onChangeView}
      />

      {/* ── 8. STICKY MOBILE ACTION BAR ───────────────────────────── */}
      <StickyMobileAction visible={true}>
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="min-w-0">
            <span className="text-xs font-bold text-text-main block truncate">Favicon Studio</span>
            <span className="text-[10px] text-text-muted font-mono block">Complete ZIP Package</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-xs transition-all shadow-premium-sm active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? "Building..." : "Download ZIP"}</span>
          </button>
        </div>
      </StickyMobileAction>

      {/* Post Download Feedback */}
      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};
