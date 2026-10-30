/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { CarouselSlide, AspectPreset } from "./types";
import { 
  Plus, 
  Copy, 
  Trash2, 
  GripVertical, 
  Image as ImageIcon,
  Sparkles,
  FileText
} from "lucide-react";

interface SlideSorterPanelProps {
  slides: CarouselSlide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (type?: "blank" | "image") => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (fromIndex: number, toIndex: number) => void;
  preset: AspectPreset;
  className?: string;
  isMobileHorizontal?: boolean;
}

export const SlideSorterPanel: React.FC<SlideSorterPanelProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlides,
  preset,
  className = "",
  isMobileHorizontal = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Touch drag-to-reorder state for the mobile horizontal strip. HTML5
  // drag & drop is not reliable on touch screens, so the strip uses a
  // long-press + pointer-move gesture instead.
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  // Always-fresh handler so window-level drag listeners never go stale.
  const reorderRef = useRef(onReorderSlides);
  reorderRef.current = onReorderSlides;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDropTargetIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderSlides(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // ── Touch helpers ────────────────────────────────────────────────────────
  const startPressTimer = (index: number) => {
    if (slides.length < 2) return;
    cancelPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null;
      setTouchDragIndex(index);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }, 420);
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // While a touch drag is active, block page + strip scrolling so the gesture
  // only reorders. Restored automatically when the strip scrolls normally.
  React.useEffect(() => {
    if (touchDragIndex === null) return;
    const prevBody = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const strip = stripRef.current;
    const prevStripOverflow = strip?.style.overflow ?? "";
    if (strip) strip.style.overflow = "hidden";
    const onPointerMove = (e: PointerEvent) => {
      const stripEl = stripRef.current;
      if (!stripEl) return;
      const cards = Array.from(stripEl.querySelectorAll("[data-slide-idx]")) as HTMLElement[];
      let target: number | null = null;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          target = Number(card.dataset.slideIdx);
          break;
        }
      }
      if (target !== null && target !== touchDragIndex) {
        reorderRef.current(touchDragIndex, target);
        setTouchDragIndex(target);
      }
    };
    window.addEventListener("pointermove", onPointerMove);
    const onUp = () => setTouchDragIndex(null);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.overflow = prevBody;
      if (strip) strip.style.overflow = prevStripOverflow;
    };
  }, [touchDragIndex !== null]);

  // Mobile / Tablet Horizontal Carousel Strip
  if (isMobileHorizontal) {
    return (
      <div
        ref={stripRef}
        className="w-full flex items-stretch gap-2 overflow-x-auto py-1 px-1 select-none custom-scrollbar"
      >
        {slides.map((slide, index) => {
          const isActive = activeSlideIndex === index;
          const isTouchDragging = touchDragIndex === index;
          const imageObj = slide.objects.find((o) => o.type === "image");
          const textObj = slide.objects.find((o) => o.type === "text");

          return (
            <div
              key={slide.id}
              data-slide-idx={index}
              onClick={() => !isTouchDragging && onSelectSlide(index)}
              onPointerDown={(e) => {
                e.stopPropagation();
                startPressTimer(index);
              }}
              onPointerUp={cancelPressTimer}
              onPointerLeave={cancelPressTimer}
              className={`relative shrink-0 w-[68px] h-24 rounded-xl border-2 p-1 flex flex-col items-stretch transition-all cursor-pointer overflow-hidden ${
                isActive 
                  ? "border-brand-primary bg-brand-primary-light/30 shadow-sm" 
                  : "border-border-light bg-surface-base hover:border-border-medium"
              } ${isTouchDragging ? "opacity-40 scale-95 border-brand-primary border-dashed" : ""}`}
              style={{ backgroundColor: slide.backgroundColor || "#141A12", touchAction: "pan-x" }}
              aria-label={`Go to slide ${index + 1}`}
              role="button"
            >
              {/* Top Tag: 01 */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold px-1 rounded bg-black/60 text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index === 0 && (
                  <span className="text-[7px] font-mono font-bold text-brand-primary bg-black/50 px-1 rounded">
                    Cover
                  </span>
                )}
                {isTouchDragging && (
                  <GripVertical className="w-3 h-3 text-white/80" />
                )}
              </div>

              {/* Center mini preview */}
              <div className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden my-0.5">
                {imageObj ? (
                  <div className="w-7 h-9 rounded border border-white/20 overflow-hidden bg-black/40">
                    <img src={(imageObj as any).imgSrc} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : textObj ? (
                  <span className="text-[7px] text-white/80 line-clamp-2 text-center px-0.5">
                    {(textObj as any).text}
                  </span>
                ) : (
                  <div className="w-4 h-4 rounded border border-dashed border-white/30" />
                )}
              </div>

              {/* Bottom actions — only on the active slide (touch friendly) */}
              <div className={`flex items-center justify-center gap-0.5 ${isActive ? "" : "opacity-0"}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(index);
                  }}
                  className="w-6 h-6 rounded-md bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/90 text-[9px] cursor-pointer"
                  title="Duplicate slide"
                  aria-label={`Duplicate slide ${index + 1}`}
                >
                  <Copy className="w-3 h-3" />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(index);
                    }}
                    className="w-6 h-6 rounded-md bg-black/50 hover:bg-red-500/80 flex items-center justify-center text-white/90 text-[9px] cursor-pointer"
                    title="Delete slide"
                    aria-label={`Delete slide ${index + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderSlides(index, index - 1);
                    }}
                    className="w-6 h-6 rounded-md bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/90 text-[9px] cursor-pointer"
                    title="Move slide left"
                    aria-label={`Move slide ${index + 1} left`}
                  >
                    <span className="text-xs leading-none">⟵</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Slide Mobile Button */}
        <button
          onClick={() => onAddSlide("blank")}
          className="shrink-0 w-14 h-24 rounded-xl border border-dashed border-border-medium hover:border-brand-primary bg-surface-muted/50 hover:bg-surface-muted flex flex-col items-center justify-center gap-1 text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
          title="Add blank slide"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold">Add</span>
        </button>
      </div>
    );
  }

  // Desktop Vertical Compact Panel
  return (
    <div className={`w-full h-full flex flex-col justify-between p-3 select-none overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-light/80 shrink-0">
        <div className="min-w-0">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-main">
            Slides ({slides.length})
          </h4>
          <p className="text-[10px] text-text-muted hidden xl:block">Drag to reorder</p>
        </div>

        <button
          onClick={() => onAddSlide("blank")}
          className="px-2 py-1.5 rounded-lg bg-brand-primary-light hover:bg-brand-primary/20 text-brand-primary text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Add blank slide"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden xl:inline">Slide</span>
        </button>
      </div>

      {/* Slide Thumbnails List (Scrollable internally) */}
      <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 min-h-0 custom-scrollbar">
        {slides.map((slide, index) => {
          const isActive = activeSlideIndex === index;
          const isDragging = draggedIndex === index;
          const isDropTarget = dropTargetIndex === index;

          const imageObj = slide.objects.find((o) => o.type === "image");
          const textObj = slide.objects.find((o) => o.type === "text");

          return (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectSlide(index)}
              className={`group relative rounded-xl border p-1.5 transition-all cursor-pointer ${
                isActive 
                  ? "border-brand-primary bg-brand-primary-light/20 shadow-sm" 
                  : "border-border-light bg-surface-base hover:border-border-medium hover:bg-surface-muted/40"
              } ${isDragging ? "opacity-35" : ""} ${
                isDropTarget ? "border-brand-primary border-dashed bg-brand-primary-light/10" : ""
              }`}
            >
              <div className="flex items-center gap-1.5">
                {/* Drag Handle */}
                <div 
                  className="cursor-grab active:cursor-grabbing text-text-muted/60 hover:text-text-main p-0.5 shrink-0"
                  title="Drag to reorder slide"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Slide Preview Card Mini Canvas (4:5 ratio) */}
                <div 
                  className="w-10 h-13 rounded-lg border border-white/10 overflow-hidden shrink-0 relative flex flex-col justify-between p-0.5 shadow-sm"
                  style={{ backgroundColor: slide.backgroundColor || "#141A12" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-mono font-bold px-0.5 rounded bg-black/70 text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {imageObj ? (
                    <div className="w-full flex-1 flex items-center justify-center my-0.5 overflow-hidden">
                      <img 
                        src={(imageObj as any).imgSrc} 
                        alt="" 
                        className="max-h-7 w-auto object-contain rounded" 
                      />
                    </div>
                  ) : textObj ? (
                    <div className="text-[6px] text-white/80 line-clamp-2 text-center my-auto leading-tight px-0.5">
                      {(textObj as any).text}
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex items-center justify-center">
                      <div className="w-3 h-3 rounded border border-dashed border-white/20" />
                    </div>
                  )}

                  <div className="text-[5px] font-mono text-white/50 text-right">
                    {slide.objects.length} obj
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-sans font-semibold text-text-main truncate">
                      {index === 0 ? "01 Cover" : `Slide ${String(index + 1).padStart(2, "0")}`}
                    </span>
                  </div>

                  <p className="text-[9px] text-text-muted truncate mt-0.5 hidden sm:block">
                    {imageObj ? "With Image" : textObj ? (textObj as any).text : "Blank"}
                  </p>

                  {/* Actions Bar — always visible on all devices */}
                  <div className="flex items-center gap-0.5 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSlide(index);
                      }}
                      className="p-1.5 min-w-[28px] min-h-[28px] rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      title="Duplicate Slide"
                      aria-label={`Duplicate slide ${index + 1}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlide(index);
                        }}
                        className="p-1.5 min-w-[28px] min-h-[28px] rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error transition-colors cursor-pointer"
                        title="Delete Slide"
                        aria-label={`Delete slide ${index + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slide Bottom Action */}
      <button
        onClick={() => onAddSlide("blank")}
        className="w-full py-2 rounded-xl border border-dashed border-border-medium hover:border-brand-primary bg-surface-muted/40 hover:bg-surface-muted text-text-muted hover:text-brand-primary text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 mt-2"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Slide</span>
      </button>
    </div>
  );
};