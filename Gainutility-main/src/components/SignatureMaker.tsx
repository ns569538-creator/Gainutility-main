/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Trash2, 
  Download, 
  RefreshCw, 
  Sliders, 
  Paintbrush, 
  Type, 
  FileImage, 
  Check, 
  Sparkles, 
  Undo, 
  Upload,
  Palette,
  Eye,
  X
} from "lucide-react";
import { Button, Card } from "./Common";
import { UniversalUploadComponent, ImageFileItem, processRawImageFiles } from "./ImageToolFramework";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

const INK_COLORS = [
  { name: "Classic Black", hex: "#000000" },
  { name: "Deep Ink Blue", hex: "#002d62" },
  { name: "Royal Purple", hex: "#512da8" },
  { name: "Scribe Teal", hex: "#00695c" },
  { name: "Bold Red", hex: "#c62828" }
];

const SIGNATURE_FONTS = [
  { id: "dancing", name: "Dancing Script", family: "'Dancing Script', cursive", url: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" },
  { id: "greatvibes", name: "Great Vibes", family: "'Great Vibes', cursive", url: "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" },
  { id: "sacramento", name: "Sacramento", family: "'Sacramento', cursive", url: "https://fonts.googleapis.com/css2?family=Sacramento&display=swap" },
  { id: "caveat", name: "Caveat Brush", family: "'Caveat', cursive", url: "https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" },
  { id: "monsieur", name: "Monsieur La Doulaise", family: "'Monsieur La Doulaise', cursive", url: "https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap" }
];

export default function SignatureMaker({
  onCopy,
  onAddToast,
  onChangeView
}: {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: any) => void;
}) {
  const postDownload = usePostDownload();
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const [inkColor, setInkColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(3); // 1 to 8

  // Drawing mode states
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawContent, setHasDrawContent] = useState<boolean>(false);
  const [drawHistory, setDrawHistory] = useState<string[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Typing mode states
  const [typedName, setTypedName] = useState<string>("John Doe");
  const [activeFontId, setActiveFontId] = useState<string>("dancing");
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Upload (Paper extractor) states
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [contrastThreshold, setContrastThreshold] = useState<number>(128); // 0-255
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [extractedDataUrl, setExtractedDataUrl] = useState<string>("");
  const uploadImgRef = useRef<HTMLImageElement | null>(null);

  // Load Google WebFonts programmatically to ensure Cursive styles render properly
  useEffect(() => {
    SIGNATURE_FONTS.forEach(font => {
      if (!document.getElementById(`font-sig-${font.id}`)) {
        const link = document.createElement("link");
        link.id = `font-sig-${font.id}`;
        link.rel = "stylesheet";
        link.href = font.url;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Sync / Draw typed signature to offline canvas to generate exact high-res export
  useEffect(() => {
    if (activeTab === "type") {
      renderTypedSignature();
    }
  }, [typedName, activeFontId, inkColor, activeTab]);

  const renderTypedSignature = () => {
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply ink coloring
    ctx.fillStyle = inkColor;
    
    // Choose selected font family
    const fontObj = SIGNATURE_FONTS.find(f => f.id === activeFontId) || SIGNATURE_FONTS[0];
    ctx.font = `italic 72px ${fontObj.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the typed name
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
  };

  // --- DRAWING BEZIER CURVE GRAPHIC ENGINE ---
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.round(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.round(((clientY - rect.top) / rect.height) * canvas.height)
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Push current canvas state to undo history
    setDrawHistory(prev => [...prev, canvas.toDataURL()]);

    isDrawingRef.current = true;
    const pos = getCanvasMousePos(e);
    lastPointRef.current = pos;
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getCanvasMousePos(e);

    ctx.beginPath();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Quadratic Bézier curve interpolation for smooth ink strokes
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    const xc = (lastPointRef.current.x + currentPos.x) / 2;
    const yc = (lastPointRef.current.y + currentPos.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, xc, yc);
    ctx.stroke();

    lastPointRef.current = currentPos;
    setHasDrawContent(true);
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
  };

  const handleUndoDraw = () => {
    if (drawHistory.length === 0) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousUrl = drawHistory[drawHistory.length - 1];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setDrawHistory(prev => prev.slice(0, prev.length - 1));
      if (drawHistory.length === 1) {
        setHasDrawContent(false);
      }
    };
    img.src = previousUrl;
  };

  const handleClearDraw = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawContent(false);
      setDrawHistory([]);
    }
  };

  // --- PAPER PHOTO EXTRACTION CORE ---
  const handleFilesAdded = async (rawFiles: File[]) => {
    const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
    if (loadedItems.length > 0) {
      setFiles([loadedItems[0]]);
      const img = new Image();
      img.onload = () => {
        uploadImgRef.current = img;
      };
      img.src = loadedItems[0].originalDataUrl;
      setIsCompleted(false);
      setExtractedDataUrl("");
    }
  };

  const runPaperExtraction = () => {
    if (!uploadImgRef.current) return;
    
    try {
      const img = uploadImgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Extract ink threshold pixels. Threshold is 0-255.
      // Greyscale = 0.299R + 0.587G + 0.114B
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (gray > contrastThreshold) {
          // White paper -> make transparent
          data[i+3] = 0;
        } else {
          // Dark ink -> keep and replace with selected custom ink color
          // Extract RGB from active inkColor HEX
          const hex = inkColor.replace("#", "");
          data[i] = parseInt(hex.substring(0, 2), 16);
          data[i+1] = parseInt(hex.substring(2, 4), 16);
          data[i+2] = parseInt(hex.substring(4, 6), 16);
          data[i+3] = 255; // opaque ink
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setExtractedDataUrl(canvas.toDataURL("image/png"));
      setIsCompleted(true);
      onAddToast("Signature extracted from paper successfully!", "success");

    } catch (err: any) {
      onAddToast(`Extraction error: ${err.message}`, "error");
    }
  };

  // Trigger paper extract instantly as sliders change
  useEffect(() => {
    if (activeTab === "upload" && uploadImgRef.current && files.length > 0) {
      runPaperExtraction();
    }
  }, [contrastThreshold, inkColor, files]);

  // --- DOWNLOAD EXPORTS (PNG & SVG) ---
  const downloadSignature = (format: "png" | "svg") => {
    let sourceCanvas: HTMLCanvasElement | null = null;
    let filename = `signature_${activeTab}`;

    if (activeTab === "draw") {
      sourceCanvas = drawCanvasRef.current;
    } else if (activeTab === "type") {
      sourceCanvas = typeCanvasRef.current;
    } else if (activeTab === "upload") {
      // Extracted png dataUrl is ready
      if (!extractedDataUrl) return;
      
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = extractedDataUrl;
      link.click();
      onAddToast("Transparent paper signature saved!", "success");
      postDownload.show("Signature Maker");
      return;
    }

    if (!sourceCanvas) return;

    if (format === "png") {
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = sourceCanvas.toDataURL("image/png");
      link.click();
      onAddToast("Transparent PNG signature downloaded!", "success");
      postDownload.show("Signature Maker");
    } else {
      // SVG vector export option
      // Draw path vectors can be mathematically wrapped inside an SVG path element
      // For typed signatures, we embed the text inside an SVG wrapper
      let svgStr = "";
      if (activeTab === "type") {
        const fontObj = SIGNATURE_FONTS.find(f => f.id === activeFontId) || SIGNATURE_FONTS[0];
        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300">
          <style>
            @import url('${fontObj.url}');
            .sig-text { font: italic 72px ${fontObj.family}; fill: ${inkColor}; text-anchor: middle; dominant-baseline: middle; }
          </style>
          <text x="400" y="150" class="sig-text">${typedName}</text>
        </svg>`;
      } else {
        // Draw raster SVG fallback
        const pngUrl = sourceCanvas.toDataURL("image/png");
        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sourceCanvas.width} ${sourceCanvas.height}" width="${sourceCanvas.width}" height="${sourceCanvas.height}">
          <image href="${pngUrl}" x="0" y="0" width="${sourceCanvas.width}" height="${sourceCanvas.height}" />
        </svg>`;
      }

      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${filename}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      onAddToast("Vector SVG signature downloaded!", "success");
      postDownload.show("Signature Maker");
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB CONTROLS */}
      <div className="flex justify-center">
        <div className="inline-flex bg-surface-muted border border-border-light p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab("draw")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "draw" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
          <button 
            onClick={() => setActiveTab("type")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "type" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Cursive</span>
          </button>
          <button 
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "upload" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Extract from Paper</span>
          </button>
        </div>
      </div>

      {/* 3. PRIMARY SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT: Drawing canvas board / Visual preview board */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="relative border border-border-light rounded-[24px] bg-[#11130e] flex flex-col items-center justify-center p-6 min-h-[340px] md:min-h-[400px] overflow-hidden">
            
            {activeTab === "draw" && (
              /* SMOOTH DRAWING CANVAS */
              <div className="w-full flex flex-col items-center gap-4">
                <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
                  🖊️ Draw your signature inside the tablet frame below:
                </p>
                <div 
                  className="relative w-full max-w-2xl h-[260px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                  style={{ 
                    backgroundImage: "radial-gradient(#2c2e2a 15%, transparent 15%)",
                    backgroundSize: "20px 20px"
                  }}
                >
                  <canvas
                    ref={drawCanvasRef}
                    width="640"
                    height="260"
                    className="w-full h-full cursor-pencil bg-transparent"
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDrawMove}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDrawMove}
                    onTouchEnd={handleStopDraw}
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={drawHistory.length === 0} 
                    onClick={handleUndoDraw}
                    leftIcon={<Undo className="w-4 h-4" />}
                  >
                    Undo Last Stroke
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!hasDrawContent} 
                    onClick={handleClearDraw}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Clear Slate
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "type" && (
              /* CURSIVE TYPED CANVAS */
              <div className="w-full flex flex-col items-center gap-4">
                <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
                  ✨ Instant professional typed cursive preview:
                </p>
                <div className="w-full max-w-2xl h-[260px] rounded-2xl bg-[#1b1c19] border border-white/10 flex items-center justify-center p-4">
                  <canvas
                    ref={typeCanvasRef}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              /* PHOTO SIGNATURE EXTRACTION VIEW */
              <div className="w-full flex flex-col items-center gap-4">
                {files.length === 0 ? (
                  <UniversalUploadComponent
                    onFilesAdded={handleFilesAdded}
                    accept="image/*"
                    supportedFormats="PNG, JPG, WEBP"
                    maxSizeText="40MB"
                    filesCount={files.length}
                    onClearAll={() => setFiles([])}
                  />
                ) : (
                  <div className="w-full flex flex-col items-center gap-4">
                    <p className="text-xs text-text-muted font-mono uppercase">
                      📸 Adjust paper brightness-threshold on the right to extract transparent signature:
                    </p>
                    <div className="w-full max-w-2xl h-[260px] rounded-2xl bg-[#1b1c19] border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                      {extractedDataUrl ? (
                        <div 
                          className="relative max-w-full max-h-full p-2 flex items-center justify-center rounded-xl border border-white/5"
                          style={{ 
                            backgroundImage: "radial-gradient(#2c2e2a 15%, transparent 15%)",
                            backgroundSize: "16px 16px"
                          }}
                        >
                          <img 
                            src={extractedDataUrl} 
                            alt="Extracted Ink Signature" 
                            className="max-h-[220px] w-auto object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <img 
                          src={files[0].originalDataUrl} 
                          alt="Paper Source" 
                          className="max-h-[220px] w-auto object-contain opacity-60"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label
                        className="px-2.5 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors inline-flex items-center"
                      >
                        <span>Replace File</span>
                        <input
                          id="signature-replace-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFilesAdded([e.target.files[0]]);
                            }
                            e.target.value = "";
                          }}
                          className="sr-only"
                        />
                      </label>

                      <Button variant="outline" size="sm" onClick={() => setFiles([])} leftIcon={<Trash2 className="w-4 h-4" />}>
                        Remove File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Action trigger exports */}
          {((activeTab === "draw" && hasDrawContent) || (activeTab === "type" && typedName) || (activeTab === "upload" && extractedDataUrl)) && (
            <div className="border border-border-light bg-surface-base p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary-light text-brand-primary font-mono font-bold border border-brand-primary/10 uppercase">
                  Transparent Backdrop
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Exported files contain clear transparent pixels, ready for PDF doc signers, emails, or contract files.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button 
                  variant="primary" 
                  onClick={() => downloadSignature("png")}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download transparent PNG
                </Button>
                {activeTab !== "upload" && (
                  <Button 
                    variant="outline" 
                    onClick={() => downloadSignature("svg")}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Export SVG Vector
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT: Calibration Settings Panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Custom Ink Colors */}
          <Card title="Ink Coloring" subtitle="Set standard or custom professional ink pigments.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                {INK_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => setInkColor(col.hex)}
                    className="w-8 h-8 rounded-full border border-border-medium shadow-inner transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {inkColor === col.hex && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-black">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted font-mono uppercase" htmlFor="signature-maker-custom-ink-hex-color-picker">Custom Ink HEX Color Picker</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className="w-10 h-10 rounded border border-border-medium cursor-pointer shrink-0"
                  id="signature-maker-custom-ink-hex-color-picker"/>
                  <input aria-label="Custom ink color hex" 
                    type="text"
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm font-mono border border-border-medium rounded-xl uppercase"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Draw mode specific settings */}
          {activeTab === "draw" && (
            <Card title="Brush Details" subtitle="Refine pen tip thickness.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Nib Weight</span>
                    <span className="text-brand-primary">{strokeWidth}px</span>
                  </div>
                  <input aria-label="Nib weight" 
                    type="range"
                    min="1"
                    max="8"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <div className="p-3 bg-surface-muted rounded-xl border border-border-light text-[11px] text-text-sub flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-primary" />
                  <span>Quadratic stroke-smoothing is auto-enabled to make mouse/trackpad movements look natural.</span>
                </div>
              </div>
            </Card>
          )}

          {/* Type mode specific settings */}
          {activeTab === "type" && (
            <Card title="Handwriting Fonts" subtitle="Select handwriting typography style.">
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted font-mono uppercase">Your Full Name or Initials</label>
                  <input 
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border-medium rounded-xl focus:outline-none focus:border-brand-primary"
                    placeholder="Enter name..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted font-mono uppercase block mb-1">Cursive Fonts Presets</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto">
                    {SIGNATURE_FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setActiveFontId(font.id)}
                        className={`p-2 px-3 text-left border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          activeFontId === font.id 
                            ? "bg-brand-primary-light border-brand-primary text-brand-primary" 
                            : "bg-surface-base border-border-light hover:border-border-medium"
                        }`}
                      >
                        <span className="text-xs font-bold">{font.name}</span>
                        <span className="text-sm italic" style={{ fontFamily: font.family }}>Aa</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* Upload Mode threshold settings */}
          {activeTab === "upload" && files.length > 0 && (
            <Card title="Contrast Threshold" subtitle="Isolate background paper fibers from ink lines.">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Paper Detection Level</span>
                    <span className="text-brand-primary">{contrastThreshold}</span>
                  </div>
                  <input aria-label="Paper detection level" 
                    type="range"
                    min="50"
                    max="220"
                    value={contrastThreshold}
                    onChange={(e) => setContrastThreshold(parseInt(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Higher threshold values preserve finer, lighter ink details but might catch background scanner noise. Lower values give clean thick pen paths.
                </p>
              </div>
            </Card>
          )}

        </div>

      </div>

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
}
