/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Undo2, 
  Redo2, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Trash2, 
  Copy, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ChevronDown,
  Sparkles,
  MousePointer,
  Minus,
  Shield,
  Eye
} from "lucide-react";
import { CanvasObject, TextPreset, ShapeKind, ArrowDirection } from "./types";

interface CanvasToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddText: (preset?: TextPreset) => void;
  onAddImage: (file: File) => void;
  onAddShape: (kind: ShapeKind) => void;
  onAddArrow: (direction: ArrowDirection) => void;
  selectedObject: CanvasObject | null;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAlignSelected: (alignment: "left" | "center-x" | "right" | "top" | "center-y" | "bottom") => void;
  onLayerReorder: (action: "front" | "forward" | "backward" | "back") => void;
  zoom: number;
  zoomMode: "fit" | "50" | "75" | "100" | "custom";
  onSetZoom: (zoom: number, mode?: "fit" | "50" | "75" | "100" | "custom") => void;
  showMarginGuides?: boolean;
  onToggleMarginGuides?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddText,
  onAddImage,
  onAddShape,
  onAddArrow,
  selectedObject,
  onDeleteSelected,
  onDuplicateSelected,
  onAlignSelected,
  onLayerReorder,
  zoom,
  zoomMode,
  onSetZoom,
  showMarginGuides,
  onToggleMarginGuides
}) => {
  const [textMenuOpen, setTextMenuOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onAddImage(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getZoomLabel = () => {
    if (zoomMode === "fit") return "Fit";
    return `${Math.round(zoom * 100)}%`;
  };

  return (
    <div className="flex items-center justify-between gap-1 bg-surface-base dark:bg-surface-elevated text-text-main select-none w-full">
      {/* Hidden file input for adding images */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileChange} 
        accept="image/png,image/jpeg,image/webp,image/svg+xml" 
        className="hidden" 
      />

      {/* PRIMARY ADD OBJECT TOOLS — horizontally scrollable on small widths */}
      <div className="flex items-center gap-1 lg:gap-1.5 max-w-full overflow-x-auto custom-scrollbar">
        {/* Undo / Redo */}
        <div className="flex items-center bg-surface-muted rounded-lg lg:rounded-xl p-0.5 border border-border-light/60 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="p-1.5 min-w-[26px] min-h-[26px] rounded-md lg:rounded-lg text-text-muted hover:text-text-main hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className="p-1.5 min-w-[26px] min-h-[26px] rounded-md lg:rounded-lg text-text-muted hover:text-text-main hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-border-light dark:border-border-medium mx-0.5 shrink-0" />

        {/* + Text with Quick Dropdown */}
        <div className="relative shrink-0">
          <div className="inline-flex rounded-lg lg:rounded-xl bg-surface-muted border border-border-light/80 hover:border-brand-primary transition-colors overflow-hidden">
            <button
              onClick={() => onAddText("heading")}
              className="px-2 lg:px-2.5 py-1.5 lg:py-1 text-[11px] lg:text-xs font-sans font-semibold text-text-main hover:text-brand-primary flex items-center gap-1 cursor-pointer"
              title="Add text to canvas"
              aria-label="Add text"
            >
              <Type className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden md:inline">Text</span>
            </button>
            <button
              onClick={() => setTextMenuOpen(!textMenuOpen)}
              className="px-1.5 py-1 border-l border-border-light/80 hover:bg-surface-hover text-text-muted cursor-pointer"
              aria-label="Text presets"
              title="Text presets"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {textMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setTextMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-surface-elevated border border-border-medium rounded-xl shadow-premium-lg p-1.5 z-50 space-y-1">
                <button
                  onClick={() => { onAddText("heading"); setTextMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-surface-muted hover:text-brand-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Headline</span>
                  <span className="text-[10px] font-mono text-text-muted">H1</span>
                </button>
                <button
                  onClick={() => { onAddText("subheading"); setTextMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-surface-muted hover:text-brand-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Subheading</span>
                  <span className="text-[10px] font-mono text-text-muted">H2</span>
                </button>
                <button
                  onClick={() => { onAddText("body"); setTextMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-normal hover:bg-surface-muted hover:text-brand-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Body Text</span>
                  <span className="text-[10px] font-mono text-text-muted">P</span>
                </button>
                <button
                  onClick={() => { onAddText("pill"); setTextMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-brand-primary hover:bg-surface-muted transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Step / Badge Pill</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* + Add Image */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2 lg:px-2.5 py-1.5 lg:py-1 rounded-lg lg:rounded-xl bg-surface-muted border border-border-light/80 hover:border-brand-primary transition-colors text-[11px] lg:text-xs font-sans font-semibold text-text-main hover:text-brand-primary flex items-center gap-1 cursor-pointer shrink-0"
          title="Upload image or screenshot to slide"
          aria-label="Add image"
        >
          <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
          <span className="hidden md:inline">Image</span>
        </button>

        {/* + Shapes */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
            className="px-2 lg:px-2.5 py-1.5 lg:py-1 rounded-lg lg:rounded-xl bg-surface-muted border border-border-light/80 hover:border-brand-primary transition-colors text-[11px] lg:text-xs font-sans font-semibold text-text-main hover:text-brand-primary flex items-center gap-1 cursor-pointer"
            aria-label="Add shape"
            title="Add shape"
          >
            <Square className="w-3.5 h-3.5 text-brand-primary" />
            <span className="hidden md:inline">Shape</span>
            <ChevronDown className="w-3 h-3 text-text-muted ml-0.5 hidden md:inline" />
          </button>

          {shapeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShapeMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-surface-elevated border border-border-medium rounded-xl shadow-premium-lg p-1.5 z-50 space-y-1">
                <button
                  onClick={() => { onAddShape("rounded-rect"); setShapeMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 text-brand-primary rounded" />
                  <span>Rounded Card</span>
                </button>
                <button
                  onClick={() => { onAddShape("rectangle"); setShapeMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Rectangle</span>
                </button>
                <button
                  onClick={() => { onAddShape("circle"); setShapeMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Circle className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Circle</span>
                </button>
                <button
                  onClick={() => { onAddShape("highlight-bar"); setShapeMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-brand-primary stroke-[4]" />
                  <span>Highlight Bar</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* + Arrow */}
        <button
          onClick={() => onAddArrow("curved-right")}
          className="px-2 lg:px-2.5 py-1.5 lg:py-1 rounded-lg lg:rounded-xl bg-surface-muted border border-border-light/80 hover:border-brand-primary transition-colors text-[11px] lg:text-xs font-sans font-semibold text-text-main hover:text-brand-primary flex items-center gap-1 cursor-pointer shrink-0"
          title="Add curved annotation arrow"
          aria-label="Add arrow"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-brand-primary" />
          <span className="hidden md:inline">Arrow</span>
        </button>
      </div>

      {/* CONTEXTUAL ACTIONS & ZOOM */}
      <div className="flex items-center gap-1 lg:gap-1.5 shrink-0">
        {selectedObject && (
          <>
            {/* Alignment Controls */}
            <div className="relative">
              <button
                onClick={() => setAlignMenuOpen(!alignMenuOpen)}
                className="p-1.5 min-w-[26px] min-h-[26px] rounded-lg text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
                title="Align Object"
                aria-label="Align object"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              {alignMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAlignMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface-elevated border border-border-medium rounded-xl shadow-premium-lg p-1.5 z-50 space-y-1">
                    <button
                      onClick={() => { onAlignSelected("center-x"); setAlignMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                    >
                      <span>Center Horizontally</span>
                      <AlignCenter className="w-3.5 h-3.5 text-brand-primary" />
                    </button>
                    <button
                      onClick={() => { onAlignSelected("center-y"); setAlignMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                    >
                      <span>Center Vertically</span>
                      <AlignJustify className="w-3.5 h-3.5 text-brand-primary" />
                    </button>
                    <button
                      onClick={() => { onAlignSelected("left"); setAlignMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                    >
                      <span>Align Left</span>
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { onAlignSelected("right"); setAlignMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                    >
                      <span>Align Right</span>
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Layer Reorder Controls */}
            <div className="relative">
              <button
                onClick={() => setLayerMenuOpen(!layerMenuOpen)}
                className="p-1.5 min-w-[26px] min-h-[26px] rounded-lg text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
                title="Layer Order"
                aria-label="Layer order"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {layerMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLayerMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-surface-elevated border border-border-medium rounded-xl shadow-premium-lg p-1.5 z-50 space-y-1">
                    <button
                      onClick={() => { onLayerReorder("front"); setLayerMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted cursor-pointer"
                    >
                      Bring to Front
                    </button>
                    <button
                      onClick={() => { onLayerReorder("forward"); setLayerMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted cursor-pointer"
                    >
                      Bring Forward
                    </button>
                    <button
                      onClick={() => { onLayerReorder("backward"); setLayerMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted cursor-pointer"
                    >
                      Send Backward
                    </button>
                    <button
                      onClick={() => { onLayerReorder("back"); setLayerMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-muted cursor-pointer"
                    >
                      Send to Back
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Duplicate */}
            <button
              onClick={onDuplicateSelected}
              className="p-1.5 min-w-[26px] min-h-[26px] rounded-lg text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer"
              title="Duplicate (Ctrl+D)"
              aria-label="Duplicate object"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete Object */}
            <button
              onClick={onDeleteSelected}
              className="p-1.5 min-w-[26px] min-h-[26px] rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
              title="Delete Object (Delete)"
              aria-label="Delete object"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-border-light dark:border-border-medium mx-0.5" />
          </>
        )}

        {/* Toggle Safe Margins Shortcut */}
        {onToggleMarginGuides && (
          <button
            onClick={onToggleMarginGuides}
            className={`p-1.5 min-w-[26px] min-h-[26px] rounded-lg transition-colors cursor-pointer ${
              showMarginGuides 
                ? "bg-brand-primary-light text-brand-primary font-bold" 
                : "text-text-muted hover:text-text-main hover:bg-surface-muted"
            }`}
            title={showMarginGuides ? "Safe margins visible" : "Safe margins hidden"}
            aria-label="Toggle safe margin guides"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Zoom Controls Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
            className="px-1.5 lg:px-2 py-1.5 lg:py-1 rounded-lg lg:rounded-xl bg-surface-muted border border-border-light text-[10px] lg:text-xs font-mono font-medium text-text-sub hover:text-text-main flex items-center gap-0.5 lg:gap-1 cursor-pointer"
            title="Slide Zoom Scale"
            aria-label="Slide zoom scale"
          >
            <span>{getZoomLabel()}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {zoomMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setZoomMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-surface-elevated border border-border-medium rounded-xl shadow-premium-lg p-1.5 z-50 space-y-1 text-xs font-mono">
                <button
                  onClick={() => { onSetZoom(zoom, "fit"); setZoomMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between cursor-pointer font-sans ${
                    zoomMode === "fit" ? "bg-brand-primary-light text-brand-primary font-bold" : "hover:bg-surface-muted"
                  }`}
                >
                  <span>Fit to Screen</span>
                  <span className="text-[10px] font-mono opacity-70">Auto</span>
                </button>
                <div className="h-px bg-border-light my-0.5" />
                <button
                  onClick={() => { onSetZoom(0.5, "50"); setZoomMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg cursor-pointer ${
                    zoomMode === "50" ? "bg-brand-primary-light text-brand-primary font-bold" : "hover:bg-surface-muted"
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => { onSetZoom(0.75, "75"); setZoomMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg cursor-pointer ${
                    zoomMode === "75" ? "bg-brand-primary-light text-brand-primary font-bold" : "hover:bg-surface-muted"
                  }`}
                >
                  75%
                </button>
                <button
                  onClick={() => { onSetZoom(1.0, "100"); setZoomMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg cursor-pointer ${
                    zoomMode === "100" ? "bg-brand-primary-light text-brand-primary font-bold" : "hover:bg-surface-muted"
                  }`}
                >
                  100%
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};