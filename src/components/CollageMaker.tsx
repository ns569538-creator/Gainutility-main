import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Download, 
  Trash2, 
  Grid,
  FileImage,
  Layout,
  LayoutGrid
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
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";

interface CollageMakerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const CollageMaker: React.FC<CollageMakerProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const postDownload = usePostDownload();
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  // Collage settings
  const [activeLayout, setActiveLayout] = useState<"2-horiz" | "2-vert" | "3-grid" | "4-grid">("4-grid");
  const [gridSpacing, setGridSpacing] = useState<number>(15); // in pixels (0-40)
  const [borderRadius, setBorderRadius] = useState<number>(10); // in pixels (0-30)
  const [borderWidth, setBorderWidth] = useState<number>(15); // in pixels (0-40)
  const [borderColor, setBorderColor] = useState<string>("#FAF8F1"); // outer padding fill color

  // Result URL
  const [collageUrl, setCollageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Smart handoff check on mount
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

  // Real-time rendering compilation loop
  useEffect(() => {
    if (files.length >= 2) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        renderCollage();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCollageUrl("");
    }
  }, [files, activeLayout, gridSpacing, borderRadius, borderWidth, borderColor]);

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
      onAddToast(`Added ${loadedItems.length} photo(s). Min 2 files required to render.`, "info");
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
    setCollageUrl("");
    setIsProcessing(false);
  };

  const renderCollage = async () => {
    if (files.length < 2) {
      setIsProcessing(false);
      return;
    }
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const size = 1200;
    canvas.width = size;
    canvas.height = size;

    // Fill background border
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, size, size);

    // Grab up to 4 loaded files
    const activeFiles = files.slice(0, 4);

    const imgPromises = activeFiles.map(item => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = item.originalDataUrl;
      });
    });

    try {
      const loadedImgs = await Promise.all(imgPromises);
      if (loadedImgs.length === 0) {
        setIsProcessing(false);
        return;
      }

      interface Cell {
        x: number;
        y: number;
        w: number;
        h: number;
      }
      let cells: Cell[] = [];
      const padding = borderWidth;
      const gap = gridSpacing;
      const count = loadedImgs.length;

      // Determine layout boundaries
      if (activeLayout === "2-horiz" || (activeLayout === "3-grid" && count === 2) || (activeLayout === "4-grid" && count === 2)) {
        const cellW = (size - padding * 2 - gap) / 2;
        const cellH = size - padding * 2;
        cells = [
          { x: padding, y: padding, w: cellW, h: cellH },
          { x: padding + cellW + gap, y: padding, w: cellW, h: cellH }
        ];
      } else if (activeLayout === "2-vert") {
        const cellW = size - padding * 2;
        const cellH = (size - padding * 2 - gap) / 2;
        cells = [
          { x: padding, y: padding, w: cellW, h: cellH },
          { x: padding, y: padding + cellH + gap, w: cellW, h: cellH }
        ];
      } else if (activeLayout === "3-grid" || (activeLayout === "4-grid" && count === 3)) {
        const cellW = (size - padding * 2 - gap) / 2;
        const largeH = size - padding * 2;
        const smallH = (size - padding * 2 - gap) / 2;
        cells = [
          { x: padding, y: padding, w: cellW, h: largeH },
          { x: padding + cellW + gap, y: padding, w: cellW, h: smallH },
          { x: padding + cellW + gap, y: padding + smallH + gap, w: cellW, h: smallH }
        ];
      } else {
        // 4-grid square
        const cellW = (size - padding * 2 - gap) / 2;
        const cellH = (size - padding * 2 - gap) / 2;
        cells = [
          { x: padding, y: padding, w: cellW, h: cellH },
          { x: padding + cellW + gap, y: padding, w: cellW, h: cellH },
          { x: padding, y: padding + cellH + gap, w: cellW, h: cellH },
          { x: padding + cellW + gap, y: padding + cellH + gap, w: cellW, h: cellH }
        ];
      }

      // Draw items
      loadedImgs.forEach((img, idx) => {
        const cell = cells[idx];
        if (!cell) return;

        ctx.save();
        
        // Rounded corners clipping mask
        ctx.beginPath();
        const r = borderRadius;
        ctx.moveTo(cell.x + r, cell.y);
        ctx.lineTo(cell.x + cell.w - r, cell.y);
        ctx.quadraticCurveTo(cell.x + cell.w, cell.y, cell.x + cell.w, cell.y + r);
        ctx.lineTo(cell.x + cell.w, cell.y + cell.h - r);
        ctx.quadraticCurveTo(cell.x + cell.w, cell.y + cell.h, cell.x + cell.w - r, cell.y + cell.h);
        ctx.lineTo(cell.x + r, cell.y + cell.h);
        ctx.quadraticCurveTo(cell.x, cell.y + cell.h, cell.x, cell.y + cell.h - r);
        ctx.lineTo(cell.x, cell.y + r);
        ctx.quadraticCurveTo(cell.x, cell.y, cell.x + r, cell.y);
        ctx.closePath();
        ctx.clip();

        // Draw image cover centered
        const nativeW = img.naturalWidth;
        const nativeH = img.naturalHeight;
        const ratioCell = cell.w / cell.h;
        const ratioImg = nativeW / nativeH;

        let drawW = cell.w;
        let drawH = cell.h;
        let dX = cell.x;
        let dY = cell.y;

        if (ratioImg > ratioCell) {
          drawW = cell.h * ratioImg;
          dX = cell.x + (cell.w - drawW) / 2;
        } else {
          drawH = cell.w / ratioImg;
          dY = cell.y + (cell.h - drawH) / 2;
        }

        ctx.drawImage(img, dX, dY, drawW, drawH);
        ctx.restore();
      });

      setCollageUrl(canvas.toDataURL("image/jpeg", 0.92));
    } catch (e) {
      console.error("Failed to render collage matrix", e);
      onAddToast("Failed to render collage.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCollage = () => {
    if (!collageUrl) return;
    const link = document.createElement("a");
    link.href = collageUrl;
    link.download = `gainutility_collage_${activeLayout}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Collage downloaded successfully!", "success");
    postDownload.show("Collage Maker");
  };

  const faqs = [
    {
      question: "How many images can I merge into a collage?",
      answer: "We support up to 4 images inside our standard grids. Excess images uploaded will remain in the thumbnail sidebar queue so you can swap them easily."
    },
    {
      question: "Are layouts fully responsive?",
      answer: "Yes. In the preview arena, the canvas scale shifts gracefully for mobile and desktop screens. The final downloaded JPG file is generated at ultra-high resolution (1200x1200px)."
    },
    {
      question: "Can I adjust border colors and spacing?",
      answer: "Yes, you can configure spacing borders, corner radius roundness, outer border widths, and choose any hex border background color with our pickers."
    }
  ];

  const features = [
    {
      title: "Flexible Layouts Grid",
      desc: "Merge photos into dual vertical columns, rows, bento grids, or standard 4-grid quadrants.",
      icon: <Grid className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Real-time Spacing & Styles",
      desc: "Slide variables for spacing margins, corner radius curved squircles, and outer canvas frames.",
      icon: <Sliders className="w-5 h-5 text-brand-primary" />
    },
    {
      title: "Local GPU Compositing",
      desc: "Every composition renders strictly inside your browser sandbox using canvas APIs, guaranteeing 100% privacy.",
      icon: <ShieldCheck className="w-5 h-5 text-brand-primary" />
    }
  ];

  const howItWorks = [
    "Select and upload 2 to 4 photos using our secure workspace uploader.",
    "Toggle spacing ratios, border paddings, and background border hex colors in the sidebar.",
    "Select layout patterns (2-Column, 2-Row, 3-Grid, or 4-Quadrant squares).",
    "Preview the high fidelity composite rendering in real-time, click Download, or handoff."
  ];

  return (
    <div className="py-6 md:py-10 space-y-10">
      
      {files.length === 0 ? (
        <UniversalUploadComponent
          accept="image/*"
          supportedFormats="PNG, JPG, WEBP"
          onFilesAdded={handleFilesAdded}
          filesCount={files.length}
          onClearAll={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 space-y-6">
            {/* Collage preview using a simple image or canvas preview card */}
            <Card title="Live Collage Canvas" subtitle="Real-time browser-side composition rendering">
              <div className="flex flex-col items-center justify-center bg-background/50 border border-border-light rounded-[20px] p-6 min-h-[400px]">
                {collageUrl ? (
                  <img src={collageUrl} alt="Collage preview" className="max-h-[500px] rounded-lg shadow-premium-md object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-text-muted space-y-2">
                    <Grid className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-sm">Minimum 2 photos required to compile collage.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* List of uploaded files thumbnails */}
            <Card 
              title="Uploaded Images" 
              subtitle={`${files.length} images added (Max 4 used in collage)`}
              extra={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => document.getElementById("collage-add-more-input")?.click()}
                    className="px-2.5 py-1 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Add File
                  </button>
                  <input
                    id="collage-add-more-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const rawFiles: File[] = [];
                        for (let i = 0; i < e.target.files.length; i++) {
                          rawFiles.push(e.target.files[i]);
                        }
                        handleFilesAdded(rawFiles);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-xs font-bold text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-lg cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {files.map((file, idx) => (
                  <div key={file.id} className="relative group rounded-xl overflow-hidden border border-border-light bg-surface-muted/30">
                    <img src={file.originalDataUrl} alt={file.name} className="w-full h-24 object-cover" />
                    
                    {/* On-hover Overlay for Replace and Remove */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => document.getElementById(`replace-collage-${idx}`)?.click()}
                        className="p-1.5 bg-brand-primary text-white rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        title="Replace Image"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin-hover" />
                      </button>
                      <input
                        id={`replace-collage-${idx}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (el) => {
                              const dataUrl = el.target?.result as string;
                              const img = new Image();
                              img.onload = () => {
                                setFiles(prev => {
                                  const next = [...prev];
                                  next[idx] = {
                                    id: Math.random().toString(36).substring(2, 9),
                                    file: f,
                                    name: f.name,
                                    originalSize: f.size,
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
                            reader.readAsDataURL(f);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1.5 bg-status-error text-white rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {idx < 4 && (
                      <span className="absolute bottom-1 left-1 bg-brand-primary text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                        Cell {idx + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Settings panel on the right */}
          <div className="xl:col-span-4 space-y-6">
            <Card title="Collage Layouts" subtitle="Select a grid pattern">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "2-horiz", label: "2 Columns" },
                  { id: "2-vert", label: "2 Rows" },
                  { id: "3-grid", label: "3 Grid Layout" },
                  { id: "4-grid", label: "4 Quadrant Grid" }
                ].map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => setActiveLayout(layout.id as any)}
                    className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      activeLayout === layout.id
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-surface-base hover:bg-surface-muted border-border-light text-text-main"
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Spacing & Borders" subtitle="Fine-tune appearance variables">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-muted">Grid Gap ({gridSpacing}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={gridSpacing}
                    onChange={e => setGridSpacing(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-muted">Border Radius ({borderRadius}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={borderRadius}
                    onChange={e => setBorderRadius(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-muted">Outer Padding ({borderWidth}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={borderWidth}
                    onChange={e => setBorderWidth(parseInt(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-muted">Border Color</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["#FAF8F1", "#1E1E1E", "#FFFFFF", "#4A5568", "#F56565", "#48BB78", "#4299E1"].map(color => (
                      <button
                        key={color}
                        onClick={() => setBorderColor(color)}
                        className={`w-8 h-8 rounded-full border border-border-light transition-transform ${
                          borderColor === color ? "scale-110 ring-2 ring-brand-primary" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={borderColor}
                      onChange={e => setBorderColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Export Collage" subtitle="Download high resolution JPG">
              <div className="space-y-3">
                <Button
                  onClick={handleDownloadCollage}
                  disabled={files.length < 2 || isProcessing}
                  className="w-full justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? "Rendering..." : "Download Composite Jpg"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="w-full justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-status-error" />
                  Reset Canvas
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Related tools — strictly after the download action, never before it. */}
      {collageUrl && !isProcessing && (
        <ContinueEditing
          currentToolId="collage-maker"
          files={files}
          onAddToast={onAddToast}
          onChangeView={onChangeView}
        />
      )}

      {/* Mobile sticky download bar */}
      <StickyMobileAction visible={!!collageUrl && !isProcessing}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">Collage ready</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadCollage}
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
