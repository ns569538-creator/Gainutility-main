/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Trash2, 
  Download, 
  Sliders, 
  RotateCw, 
  RefreshCw, 
  Check, 
  Eye, 
  User, 
  Settings, 
  Grid, 
  Printer, 
  Sparkles,
  Sun,
  Contrast,
  SlidersHorizontal
} from "lucide-react";
import { Button, Card } from "./Common";
import { UniversalUploadComponent, ImageFileItem, processRawImageFiles } from "./ImageToolFramework";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface CountryPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  ratio: number; // width / height
  description: string;
}

const PRESETS: CountryPreset[] = [
  { id: "us", name: "United States (2x2 in)", widthMm: 50.8, heightMm: 50.8, ratio: 1.0, description: "US Passport, Visa, Green Card. 2x2 inches (51x51 mm)." },
  { id: "uk", name: "United Kingdom (35x45 mm)", widthMm: 35, heightMm: 45, ratio: 35 / 45, description: "UK Passport, Driving Licence. 35x45 mm." },
  { id: "schengen", name: "Schengen Visa (35x45 mm)", widthMm: 35, heightMm: 45, ratio: 35 / 45, description: "Schengen Europe Visa, Passport. 35x45 mm." },
  { id: "canada", name: "Canada Passport (50x70 mm)", widthMm: 50, heightMm: 70, ratio: 50 / 70, description: "Canadian Passport. 50x70 mm." },
  { id: "india", name: "India Passport (35x35 mm)", widthMm: 35, heightMm: 35, ratio: 1.0, description: "Indian Passport, Visa. 35x35 mm." },
  { id: "australia", name: "Australia Passport (35x45 mm)", widthMm: 35, heightMm: 45, ratio: 35 / 45, description: "Australian Passport, Visa. 35x45 mm." }
];

const BACKDROP_COLORS = [
  { name: "Keep Original", hex: "original", label: "Original" },
  { name: "Pure White", hex: "#ffffff", label: "White" },
  { name: "Light Gray", hex: "#f0f2f5", label: "Light Gray" },
  { name: "Off-White", hex: "#fbf8f3", label: "Off-White" },
  { name: "Standard Blue", hex: "#cee5f2", label: "Standard Blue" }
];

export default function PassportPhotoMaker({
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
  const [activePreset, setActivePreset] = useState<string>("us");
  
  // Alignment & Cropping modifiers
  const [zoom, setZoom] = useState<number>(100); // percentage 50 - 300
  const [rotation, setRotation] = useState<number>(0); // degrees -45 to 45
  const [offsetX, setOffsetX] = useState<number>(0); // offset pixels
  const [offsetY, setOffsetY] = useState<number>(0); // offset pixels
  
  // Lighting adjustment states
  const [brightness, setBrightness] = useState<number>(100); // 50 to 150
  const [contrast, setContrast] = useState<number>(100); // 50 to 150
  const [exposure, setExposure] = useState<number>(100); // 50 to 150
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [sharpness, setSharpness] = useState<number>(0); // 0 to 10 unsharp mask intensity

  // Background color replace state
  const [docBgColor, setDocBgColor] = useState<string>("original");

  // Multi-print sheet states
  const [printLayout, setPrintLayout] = useState<"none" | "a4" | "letter">("none");

  // Output generated variables
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string>("");
  const [printSheetDataUrl, setPrintSheetDataUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  // Interactive drag state for pan
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedItem = files[0];
  const preset = PRESETS.find(p => p.id === activePreset) || PRESETS[0];

  const handleClearAll = () => {
    setFiles([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setCroppedDataUrl("");
    setPrintSheetDataUrl("");
    setZoom(100);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(100);
    setContrast(100);
    setExposure(100);
    setSaturation(100);
    setSharpness(0);
    setDocBgColor("original");
    setPrintLayout("none");
    imageRef.current = null;
  };

  const handleFilesAdded = async (rawFiles: File[]) => {
    const loadedItems = await processRawImageFiles(rawFiles, onAddToast);
    if (loadedItems.length > 0) {
      setFiles([loadedItems[0]]);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
      };
      img.src = loadedItems[0].originalDataUrl;
      setIsCompleted(false);
    }
  };

  // Drag listeners for direct viewport manipulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedItem) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffsetX(prev => prev + dx);
    setOffsetY(prev => prev + dy);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Run passport cropping algorithm client-side using Canvas HTML5
  const generatePhotos = () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const img = imageRef.current!;
        const croppedCanvas = document.createElement("canvas");
        
        // Define passport dimensions at 300 DPI (approx 600px width for 2 in / 50.8 mm)
        const targetWidth = Math.round((preset.widthMm / 25.4) * 300);
        const targetHeight = Math.round((preset.heightMm / 25.4) * 300);
        
        croppedCanvas.width = targetWidth;
        croppedCanvas.height = targetHeight;
        const ctx = croppedCanvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize 2D canvas context.");

        // Clear canvas
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Draw document solid background replacement if not original
        if (docBgColor !== "original") {
          ctx.fillStyle = docBgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.save();
        
        // Center of the target viewport
        ctx.translate(targetWidth / 2, targetHeight / 2);
        
        // Apply manual pan and rotation adjustments
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(offsetX, offsetY);

        // Apply visual zoom factor to original dimensions
        const scale = (zoom / 100) * (targetWidth / img.width);
        const drawW = img.width * scale;
        const drawH = img.height * scale;

        // Apply filters: brightness, contrast, exposure, saturation, sharpness
        // In Canvas 2D, we can write a CSS-style filter string directly to the context! This is extremely fast.
        let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        if (exposure !== 100) {
          // Approximate exposure by scaling contrast and brightness slightly
          const expMult = exposure / 100;
          filterStr += ` brightness(${100 * expMult}%)`;
        }
        ctx.filter = filterStr;

        // Draw image centered in translation matrix
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Apply optional highpass sharpening filter (convolution kernel matrix)
        if (sharpness > 0) {
          const sVal = sharpness / 10; // scale 0-1
          const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const sharpData = applySharpenKernel(imgData, sVal);
          ctx.putImageData(sharpData, 0, 0);
        }

        const croppedUrl = croppedCanvas.toDataURL("image/jpeg", 0.95);
        setCroppedDataUrl(croppedUrl);

        // Generate printable sheet layout if letter/A4 is chosen
        if (printLayout !== "none") {
          const sheetUrl = generatePrintSheet(croppedUrl, targetWidth, targetHeight, printLayout);
          setPrintSheetDataUrl(sheetUrl);
        } else {
          setPrintSheetDataUrl("");
        }

        setIsCompleted(true);
        setIsProcessing(false);
        onAddToast("Biometric photos generated successfully!", "success");

      } catch (err: any) {
        setIsProcessing(false);
        onAddToast(`Failed to generate: ${err.message}`, "error");
      }
    }, 400);
  };

  // 3x3 Sharpen Kernel convolution helper
  const applySharpenKernel = (imgData: ImageData, weight: number): ImageData => {
    const width = imgData.width;
    const height = imgData.height;
    const input = imgData.data;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext("2d")!;
    const outputImgData = outputCtx.createImageData(width, height);
    const output = outputImgData.data;

    // Sharpen matrix:
    //  0  -w   0
    // -w 1+4w -w
    //  0  -w   0
    const w = weight * 0.5;
    const center = 1 + 4 * w;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // Red, Green, Blue
          const idx = (y * width + x) * 4 + c;
          
          const val = 
            center * input[idx] -
            w * input[((y - 1) * width + x) * 4 + c] -
            w * input[((y + 1) * width + x) * 4 + c] -
            w * input[(y * width + (x - 1)) * 4 + c] -
            w * input[(y * width + (x + 1)) * 4 + c];

          output[idx] = Math.max(0, Math.min(255, val));
        }
        output[(y * width + x) * 4 + 3] = input[(y * width + x) * 4 + 3]; // Keep alpha
      }
    }
    return outputImgData;
  };

  // Compile individual photos into an A4/Letter size collage sheet
  const generatePrintSheet = (croppedUrl: string, itemW: number, itemH: number, size: "a4" | "letter"): string => {
    const sheetCanvas = document.createElement("canvas");
    
    // A4 dimensions at 300 DPI: 2480 x 3508 pixels
    // Letter dimensions at 300 DPI: 2550 x 3300 pixels
    const sheetW = size === "a4" ? 2480 : 2550;
    const sheetH = size === "a4" ? 3508 : 3300;
    
    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;
    const ctx = sheetCanvas.getContext("2d");
    if (!ctx) return "";

    // Fill white backdrop for sheet paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sheetW, sheetH);

    // Load photo image synchronously from base64 dataUrl
    const img = new Image();
    img.src = croppedUrl;

    // Draw grid of passport photos with margins & faint cut marks
    const gridCols = size === "a4" ? 4 : 4;
    const gridRows = size === "a4" ? 5 : 4;
    const startX = Math.round((sheetW - (itemW * gridCols + 60 * (gridCols - 1))) / 2);
    const startY = Math.round((sheetH - (itemH * gridRows + 60 * (gridRows - 1))) / 2);

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = startX + c * (itemW + 60);
        const y = startY + r * (itemH + 60);

        // Draw passport photo item
        ctx.drawImage(img, x, y, itemW, itemH);

        // Draw faint grey border crop guidelines
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, itemW, itemH);
      }
    }

    // Add professional layout annotation footer
    ctx.fillStyle = "#555555";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("GainUtility - Premium Passport Photo Sheet", startX, startY - 80);
    ctx.font = "italic 24px sans-serif";
    ctx.fillText(`Preset: ${preset.name} | Resolution: 300 DPI | Size: ${size.toUpperCase()}`, startX, startY - 40);

    return sheetCanvas.toDataURL("image/jpeg", 0.90);
  };

  // Sync sheet updates instantly when presets or print configurations toggle
  useEffect(() => {
    if (isCompleted && croppedDataUrl) {
      if (printLayout !== "none") {
        // Recalculate sheet
        const itemW = Math.round((preset.widthMm / 25.4) * 300);
        const itemH = Math.round((preset.heightMm / 25.4) * 300);
        const url = generatePrintSheet(croppedDataUrl, itemW, itemH, printLayout);
        setPrintSheetDataUrl(url);
      } else {
        setPrintSheetDataUrl("");
      }
    }
  }, [printLayout, activePreset, isCompleted]);

  // Download individual photo output
  const downloadSinglePhoto = () => {
    if (!croppedDataUrl) return;
    const link = document.createElement("a");
    link.download = `passport_${preset.id}_${selectedItem.name.split(".")[0] || "photo"}.jpg`;
    link.href = croppedDataUrl;
    link.click();
    onAddToast("Biometric photo saved successfully!", "success");
    postDownload.show("Passport Photo Maker");
  };

  // Download printable sheet
  const downloadPrintSheet = () => {
    if (!printSheetDataUrl) return;
    const link = document.createElement("a");
    link.download = `passport_sheet_${printLayout}_${preset.id}.jpg`;
    link.href = printSheetDataUrl;
    link.click();
    onAddToast("Printable photo sheet saved!", "success");
    postDownload.show("Passport Photo Maker");
  };

  return (
    <div className="space-y-6">
      {/* Main Studio Workspace */}
      {files.length === 0 ? (
        <UniversalUploadComponent
          onFilesAdded={handleFilesAdded}
          accept="image/*"
          supportedFormats="PNG, JPG, WEBP"
          maxSizeText="40MB"
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: Alignment Viewport Workspace */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-border-light bg-surface-base px-5 py-3 rounded-[20px]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                  <User className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-text-main truncate max-w-[180px]" title={selectedItem.name}>
                  {selectedItem.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <label
                  className="px-2.5 py-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors inline-flex items-center"
                >
                  <span>Replace File</span>
                  <input
                    id="passport-replace-input"
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

                <Button variant="outline" size="sm" onClick={handleClearAll} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remove File
                </Button>
              </div>
            </div>

            {/* Viewport Frame with Biometric Overlays */}
            <div className="relative border border-border-light rounded-[24px] bg-[#11130e] flex flex-col items-center justify-center p-6 min-h-[380px] md:min-h-[460px] overflow-hidden">
              
              {!isCompleted ? (
                /* INTERACTIVE CROPPING ADJUSTMENT VIEW */
                <div className="relative w-full flex flex-col items-center gap-4">
                  
                  {/* Aspect Ratio Constraint Box */}
                  <div 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative border-4 border-dashed border-white/50 rounded-lg overflow-hidden shadow-2xl bg-[#1b1c19] cursor-move select-none"
                    style={{ 
                      width: "300px", 
                      height: `${300 / preset.ratio}px`,
                      maxHeight: "380px"
                    }}
                  >
                    {/* Source Portrait Image mapped with transforms */}
                    <img
                      src={selectedItem.originalDataUrl}
                      alt="Source Portrait"
                      className="absolute origin-center select-none max-w-none pointer-events-none"
                      style={{
                        transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${(zoom / 100) * (300 / selectedItem.originalWidth)})`,
                        left: "50%",
                        top: "50%",
                        width: `${selectedItem.originalWidth}px`,
                        height: `${selectedItem.originalHeight}px`
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* BIOMETRIC GUIDES OVERLAY */}
                    <div className="absolute inset-0 border-2 border-brand-primary/40 pointer-events-none flex flex-col items-center justify-between p-4">
                      {/* Top crown line */}
                      <div className="w-full border-t border-dashed border-status-info/80 relative">
                        <span className="absolute left-2 -top-4 text-[9px] font-mono font-bold text-status-info uppercase tracking-wider">Top of Head</span>
                      </div>

                      {/* Eye Alignment Outline */}
                      <div className="w-full border-t-2 border-dashed border-brand-primary/90 flex justify-center relative my-auto h-[1px]">
                        <span className="absolute left-2 -top-4 text-[9px] font-mono font-bold text-brand-primary uppercase tracking-wider">Eye Line</span>
                        <div className="w-32 h-6 border border-brand-primary/30 rounded-full -mt-3 flex items-center justify-around">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-primary/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-primary/40" />
                        </div>
                      </div>

                      {/* Chin Boundary */}
                      <div className="w-full border-b border-dashed border-status-info/80 relative">
                        <span className="absolute left-2 top-1 text-[9px] font-mono font-bold text-status-info uppercase tracking-wider">Chin Base</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#FAF8F1]/60 text-center max-w-sm leading-relaxed">
                    ↕ Drag portrait photo inside the grid box to pan. Adjust size & rotation sliders on the right to align features with dashed guidelines.
                  </p>

                  <Button
                    variant="primary"
                    onClick={generatePhotos}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="w-full max-w-[220px]"
                  >
                    Create Passport Photo
                  </Button>
                </div>
              ) : (
                /* COMPLETED PREVIEW VIEW (Single or Sheet Mode) */
                <div className="w-full flex flex-col items-center gap-6">
                  
                  {/* Toggle Display Single vs Sheet */}
                  <div className="inline-flex bg-surface-muted border border-border-light p-1 rounded-xl">
                    <button 
                      onClick={() => setPrintLayout("none")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        printLayout === "none" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      Single Biometric Photo
                    </button>
                    <button 
                      onClick={() => setPrintLayout("a4")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        printLayout !== "none" ? "bg-surface-base text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      Print Sheet Grid (Collage)
                    </button>
                  </div>

                  {/* Render Area */}
                  {printLayout === "none" ? (
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                      <div 
                        className="p-1 bg-surface-base border border-border-medium rounded-xl shadow-xl flex items-center justify-center overflow-hidden"
                        style={{ width: "200px", height: `${200 / preset.ratio}px` }}
                      >
                        <img 
                          src={croppedDataUrl} 
                          alt="Cropped Output" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs px-3 py-1 bg-brand-primary-light text-brand-primary font-mono font-black border border-brand-primary/10 rounded-full uppercase">
                        {preset.widthMm} × {preset.heightMm} MM (300 DPI)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
                      {/* Print Sheet Selection Options */}
                      <div className="flex gap-2 mb-1">
                        <button 
                          onClick={() => setPrintLayout("a4")}
                          className={`px-3 py-1 text-[11px] font-mono rounded-full border cursor-pointer ${
                            printLayout === "a4" ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "border-border-medium text-text-sub"
                          }`}
                        >
                          A4 Paper Size
                        </button>
                        <button 
                          onClick={() => setPrintLayout("letter")}
                          className={`px-3 py-1 text-[11px] font-mono rounded-full border cursor-pointer ${
                            printLayout === "letter" ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" : "border-border-medium text-text-sub"
                          }`}
                        >
                          Letter Paper Size
                        </button>
                      </div>

                      {/* Render sheet image scaled down */}
                      <div className="border border-border-medium bg-white p-3 shadow-2xl rounded-md max-w-full max-h-[340px] overflow-auto">
                        <img 
                          src={printSheetDataUrl} 
                          alt="Collage Sheet" 
                          className="max-h-[300px] w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs px-3 py-1 bg-brand-secondary-light text-brand-secondary-hover font-mono font-bold rounded-full">
                        Multi-Photo Sheet ready to download and print
                      </span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="primary" 
                      onClick={printLayout === "none" ? downloadSinglePhoto : downloadPrintSheet}
                      leftIcon={<Download className="w-5 h-5" />}
                    >
                      {printLayout === "none" ? "Download Cropped Photo" : `Download Printable ${printLayout.toUpperCase()} Sheet`}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCompleted(false)}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Re-Align Photo
                    </Button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Calibration & Country Preset Settings */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            
            {/* Country Presets Card */}
            <Card title="Document Specifications" subtitle="Choose destination document dimensions.">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1 border border-border-light/40 rounded-xl p-1 bg-surface-muted/30">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePreset(p.id);
                        setOffsetX(0);
                        setOffsetY(0);
                        setZoom(100);
                        setIsCompleted(false);
                      }}
                      className={`p-3 text-left rounded-xl border flex flex-col gap-0.5 cursor-pointer transition-all ${
                        activePreset === p.id 
                          ? "bg-brand-primary-light/50 border-brand-primary" 
                          : "bg-surface-base border-border-light hover:border-border-medium"
                      }`}
                    >
                      <span className="text-sm font-bold text-text-main flex items-center justify-between">
                        {p.name}
                        {activePreset === p.id && <Check className="w-4 h-4 text-brand-primary" />}
                      </span>
                      <span className="text-xs text-text-muted">{p.description}</span>
                      <span className="text-[10px] font-mono text-text-sub mt-0.5">{p.widthMm} × {p.heightMm} mm · {p.ratio > 1 ? "Landscape" : "Portrait"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Alignment Adjustments View Controls */}
            {!isCompleted && (
              <Card title="Biometric Alignment" subtitle="Center portrait features inside guidelines.">
                <div className="space-y-5">
                  
                  {/* Zoom Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span>Face Zoom Scale</span>
                      <span>{zoom}%</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="300"
                      value={zoom}
                      onChange={(e) => setZoom(parseInt(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span>Rotational Align</span>
                      <span>{rotation}°</span>
                    </div>
                    <input 
                      type="range"
                      min="-45"
                      max="45"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-brand-primary cursor-pointer"
                    />
                  </div>

                  {/* Recenter button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setOffsetX(0);
                      setOffsetY(0);
                      setZoom(100);
                      setRotation(0);
                    }}
                    className="w-full"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Reset Position
                  </Button>
                </div>
              </Card>
            )}

            {/* Lighting & Filters Correction Suite Card */}
            <Card title="Lighting Correction" subtitle="Fine-tune colors and crispness for document requirements.">
              <div className="space-y-4">
                
                {/* Background color replace (specifically white/lightgray for official papers) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted font-mono uppercase">Replace Paper Background</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {BACKDROP_COLORS.map((bc) => (
                      <button
                        key={bc.hex}
                        onClick={() => {
                          setDocBgColor(bc.hex);
                          setIsCompleted(false); // require re-crop
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                          docBgColor === bc.hex 
                            ? "bg-brand-primary text-[#FAF8F1] border-brand-primary" 
                            : "bg-surface-base border-border-light hover:border-border-medium"
                        }`}
                      >
                        {bc.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    Official biometric regulations strictly require clean white or light grey backgrounds without patterns or shadows.
                  </p>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={brightness}
                    onChange={(e) => { setBrightness(parseInt(e.target.value)); setIsCompleted(false); }}
                    className="w-full accent-brand-primary"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={contrast}
                    onChange={(e) => { setContrast(parseInt(e.target.value)); setIsCompleted(false); }}
                    className="w-full accent-brand-primary"
                  />
                </div>

                {/* Sharpness (High-fidelity custom convolution filter) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> Crispness / Sharpening</span>
                    <span>Level {sharpness}</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" value={sharpness}
                    onChange={(e) => { setSharpness(parseInt(e.target.value)); setIsCompleted(false); }}
                    className="w-full accent-brand-primary"
                  />
                </div>
              </div>
            </Card>

          </div>
        </div>
      )}

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
}
