/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  CarouselSlide, 
  CanvasObject, 
  ImageObject, 
  TextObject, 
  ShapeObject, 
  ArrowObject, 
  LineObject,
  AspectPreset, 
  CAROUSEL_PRESETS,
  SnapGuide
} from "./types";
import { slidePatternDataURI } from "./patternUtil";
import { SLIDE_FOOTER, footerPalette, footerCounterText } from "./slideLayout";
import { 
  Trash2, 
  Copy, 
  RotateCw, 
  ArrowUpRight, 
  Layers, 
  Maximize2, 
  Move, 
  Check, 
  Sparkles,
  Edit3
} from "lucide-react";

interface SlideCanvasStageProps {
  slide: CarouselSlide;
  slideIndex: number;
  totalSlides: number;
  preset: AspectPreset;
  zoom: number;
  zoomMode?: "fit" | "50" | "75" | "100" | "custom";
  onAutoFitZoomCalculated?: (scale: number) => void;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onLayerReorder: (action: "front" | "forward" | "backward" | "back") => void;
  showMarginGuides?: boolean;
}

type DragMode = "move" | "resize" | "rotate" | null;
type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * Inline WYSIWYG text editor.
 *
 * A contentEditable div replaces the old textarea so the editing experience is
 * pixel-identical to the rendered text (same font metrics, padding, pill and
 * flex-centered layout). It renders with NO children: the text is written via
 * `textContent` once on mount, which avoids React rewriting / caret jumps on
 * every keystroke. Enter does not insert newlines (matching a single-paragraph
 * caption edit); Escape or blur exits and commits.
 */
const InlineTextEditor: React.FC<{
  obj: TextObject;
  onCommit: (text: string) => void;
  onExit: () => void;
}> = ({ obj, onCommit, onExit }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = obj.text || "";
    el.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Edit text"
      onInput={(e) => onCommit((e.target as HTMLDivElement).textContent || "")}
      onBlur={onExit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
        else if (e.key === "Escape") e.currentTarget.blur();
        e.stopPropagation();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      spellCheck={false}
      style={{
        width: "100%",
        fontSize: `${obj.fontSize || 32}px`,
        fontWeight: obj.fontWeight || 600,
        fontFamily: obj.fontFamily || "inherit",
        color: obj.fontColor || "#FFFFFF",
        textAlign: obj.textAlign || "center",
        lineHeight: obj.lineHeight || 1.3,
        letterSpacing: `${obj.letterSpacing || 0}px`,
        textTransform: obj.textTransform || "none",
        backgroundColor: obj.textBgColor || "transparent",
        padding: obj.textBgPadding ? `${obj.textBgPadding}px` : "0px",
        borderRadius: obj.textBgRadius ? `${obj.textBgRadius}px` : "0px",
        outline: "2px dashed rgba(117, 171, 82, 0.65)",
        outlineOffset: "-2px",
        userSelect: "text",
        WebkitUserSelect: "text",
        touchAction: "auto",
        cursor: "text"
      }}
      className="w-full whitespace-pre-wrap"
    />
  );
};

export const SlideCanvasStage: React.FC<SlideCanvasStageProps> = ({
  slide,
  slideIndex,
  totalSlides,
  preset,
  zoom,
  zoomMode = "fit",
  onAutoFitZoomCalculated,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onLayerReorder,
  showMarginGuides = true
}) => {
  const presetConfig = CAROUSEL_PRESETS[preset] || CAROUSEL_PRESETS.portrait;
  const canvasWidth = presetConfig.width;
  const canvasHeight = presetConfig.height;

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600
  });

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Interaction Drag State
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialObjState, setInitialObjState] = useState<CanvasObject | null>(null);
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([]);

  const selectedObject = slide.objects.find((o) => o.id === selectedObjectId) || null;

  // Responsive Container Measurement using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerDimensions({ width, height });
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute exact fit scale so the 4:5 slide is 100% visible inside available height & width
  const paddingX = 32;
  const paddingY = 32;
  const availableWidth = Math.max(100, containerDimensions.width - paddingX);
  const availableHeight = Math.max(100, containerDimensions.height - paddingY);
  const calculatedFitScale = Math.min(
    availableHeight / canvasHeight,
    availableWidth / canvasWidth,
    0.95
  );

  useEffect(() => {
    if (onAutoFitZoomCalculated && calculatedFitScale > 0) {
      onAutoFitZoomCalculated(calculatedFitScale);
    }
  }, [calculatedFitScale, onAutoFitZoomCalculated]);

  const effectiveZoom = zoomMode === "fit" ? calculatedFitScale : zoom;

  // Selection handles live inside the scaled canvas, so their raw size must be
  // divided by zoom to keep a constant on-screen size on every viewport
  // (especially small touch screens where "fit" zoom is ~0.25). Raw sizes are
  // clamped so handles never grow huge enough to swallow the whole object.
  const handleRaw = (targetPx: number) => {
    const raw = targetPx / Math.max(effectiveZoom, 0.05);
    return `${Math.min(120, Math.max(24, raw))}px`;
  };

  // Visible indicator (the small dot) also inverse-scales so it reads at a
  // constant on-screen size, but must be allowed to be smaller than the hit area.
  const dotRaw = (targetPx: number) => {
    const raw = targetPx / Math.max(effectiveZoom, 0.05);
    return `${Math.min(60, Math.max(4, raw))}px`;
  };

  // Rough on-canvas height of the quick-action bar (inverse-scaled chrome),
  // used to decide whether it floats below or above the selection.
  const quickBarHeight = 32 / Math.max(effectiveZoom, 0.05);

  // Canvas-y offset for the quick-action bar: below the selection when it
  // fits, otherwise above it, otherwise clamped to the canvas.
  const quickBarTopCanvas = (() => {
    if (!selectedObject) return 0;
    const gap = 10 / Math.max(effectiveZoom, 0.05);
    const below = selectedObject.y + selectedObject.height + gap;
    if (below + quickBarHeight <= canvasHeight) return below;
    if (selectedObject.y >= quickBarHeight + gap) return selectedObject.y - quickBarHeight - gap;
    return Math.max(0, Math.min(below, canvasHeight - quickBarHeight));
  })();

  // Clear inline text editing if selection changes. Text is written back to the
  // object's `text` field on every keystroke, so there is no temporary buffer to commit.
  useEffect(() => {
    if (editingTextId && editingTextId !== selectedObjectId) {
      setEditingTextId(null);
    }
  }, [selectedObjectId]);

  // Keyboard Shortcuts (Arrow movement, Delete, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typingInField = ["INPUT", "TEXTAREA"].includes(tag);
      const isInlineEditing = editingTextId !== null;

      // Escape always wins: cancel inline text editing first, then deselect.
      if (e.key === "Escape") {
        e.preventDefault();
        if (isInlineEditing) {
          setEditingTextId(null);
        } else if (!typingInField) {
          onSelectObject(null);
        }
        return;
      }

      // Don't trigger movement/shortcuts while typing (covers inline text editing too)
      if (isInlineEditing || typingInField || !selectedObject) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onUpdateObject(selectedObject.id, { x: selectedObject.x - step });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onUpdateObject(selectedObject.id, { x: selectedObject.x + step });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onUpdateObject(selectedObject.id, { y: selectedObject.y - step });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onUpdateObject(selectedObject.id, { y: selectedObject.y + step });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteObject(selectedObject.id);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onDuplicateObject(selectedObject.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObject, editingTextId, onUpdateObject, onDeleteObject, onDuplicateObject, onSelectObject]);

  // Helper: Convert screen mouse coordinates into canvas coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!stageRef.current) return { x: 0, y: 0 };
    const rect = stageRef.current.getBoundingClientRect();
    const scaleFactor = rect.width / canvasWidth;
    const x = (clientX - rect.left) / scaleFactor;
    const y = (clientY - rect.top) / scaleFactor;
    return { x, y };
  }, [canvasWidth]);

  // START DRAGGING (Move Object)
  const handleObjectPointerDown = (e: React.PointerEvent, obj: CanvasObject) => {
    e.stopPropagation();
    if (editingTextId === obj.id) return; // Allow text selection when editing

    onSelectObject(obj.id);
    setDragMode("move");
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragStart({ x, y });
    setInitialObjState({ ...obj });
  };

  // START RESIZING (Corner or Edge Handle)
  const handleResizePointerDown = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (!selectedObject) return;

    setDragMode("resize");
    setResizeHandle(handle);
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragStart({ x, y });
    setInitialObjState({ ...selectedObject });
  };

  // START ROTATING
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedObject) return;

    setDragMode("rotate");
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragStart({ x, y });
    setInitialObjState({ ...selectedObject });
  };

  // POINTER MOVE (Handling Drag, Resize, Rotate & Smart Snapping)
  const handlePointerMove = (e: { clientX: number; clientY: number }) => {
    if (!dragMode || !selectedObject || !initialObjState) return;

    const currentCoords = getCanvasCoords(e.clientX, e.clientY);
    const dx = currentCoords.x - dragStart.x;
    const dy = currentCoords.y - dragStart.y;

    // Small movement dead-zone: a click/tap with a slightly shaky hand must not
    // nudge the object or faintly resize it. Keeps select vs. drag unambiguous.
    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;

    if (dragMode === "move") {
      let targetX = initialObjState.x + dx;
      let targetY = initialObjState.y + dy;

      // Smart Alignment Snapping Guides
      const snapThreshold = 12;
      const guides: SnapGuide[] = [];

      // Canvas Center X
      const objCenterX = targetX + initialObjState.width / 2;
      const canvasCenterX = canvasWidth / 2;
      if (Math.abs(objCenterX - canvasCenterX) < snapThreshold) {
        targetX = canvasCenterX - initialObjState.width / 2;
        guides.push({ orientation: "vertical", position: canvasCenterX, label: "Center" });
      }

      // Canvas Center Y
      const objCenterY = targetY + initialObjState.height / 2;
      const canvasCenterY = canvasHeight / 2;
      if (Math.abs(objCenterY - canvasCenterY) < snapThreshold) {
        targetY = canvasCenterY - initialObjState.height / 2;
        guides.push({ orientation: "horizontal", position: canvasCenterY, label: "Middle" });
      }

      // Safe Zone Margin Snaps (60px)
      if (Math.abs(targetX - 60) < snapThreshold) {
        targetX = 60;
        guides.push({ orientation: "vertical", position: 60, label: "Safe Margin" });
      }
      if (Math.abs((targetX + initialObjState.width) - (canvasWidth - 60)) < snapThreshold) {
        targetX = canvasWidth - 60 - initialObjState.width;
        guides.push({ orientation: "vertical", position: canvasWidth - 60, label: "Safe Margin" });
      }

      setActiveSnapGuides(guides);

      // Keep the object within the canvas so it can never be dragged completely
      // off-screen by accident (aligns with existing boundary expectations).
      targetX = Math.min(Math.max(0, targetX), Math.max(0, canvasWidth - initialObjState.width));
      targetY = Math.min(Math.max(0, targetY), Math.max(0, canvasHeight - initialObjState.height));

      onUpdateObject(selectedObject.id, {
        x: Math.round(targetX),
        y: Math.round(targetY)
      });

    } else if (dragMode === "resize" && resizeHandle) {
      const initial = initialObjState;
      const right = initial.x + initial.width;
      const bottom = initial.y + initial.height;

      const isImage = initial.type === "image";
      const aspect = isImage
        ? (initial as ImageObject).naturalAspectRatio || (initial.width / initial.height)
        : null;

      // Determine the new width based on which horizontal side is being dragged.
      let newW = initial.width;
      if (resizeHandle.includes("e")) newW = initial.width + dx;
      else if (resizeHandle.includes("w")) newW = initial.width - dx;
      newW = Math.max(30, newW);

      // Determine the new height (independent for non-image objects).
      let newH = initial.height;
      if (resizeHandle.includes("s")) newH = initial.height + dy;
      else if (resizeHandle.includes("n")) newH = initial.height - dy;
      newH = aspect ? newW / aspect : Math.max(30, newH);

      // Re-anchor position based on the fixed (opposite) edge.
      let newX = initial.x;
      let newY = initial.y;
      if (resizeHandle.includes("w")) newX = right - newW;
      if (resizeHandle.includes("n")) newY = bottom - newH;

      // Clamp within the canvas.
      newX = Math.max(0, Math.min(newX, canvasWidth - 30));
      newY = Math.max(0, Math.min(newY, canvasHeight - 30));
      newW = Math.min(newW, canvasWidth - newX);
      newH = Math.min(newH, canvasHeight - newY);
      newW = Math.max(30, newW);
      newH = Math.max(30, newH);

      if (aspect) {
        // Aspect-locked: height follows width, but never exceed the available height.
        newH = newW / aspect;
        if (newH > canvasHeight - newY) {
          newH = canvasHeight - newY;
          newW = newH * aspect;
        }
        if (resizeHandle.includes("w")) newX = right - newW;
        if (resizeHandle.includes("n")) newY = bottom - newH;
      }

      onUpdateObject(selectedObject.id, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });

    } else if (dragMode === "rotate") {
      const objCenterX = initialObjState.x + initialObjState.width / 2;
      const objCenterY = initialObjState.y + initialObjState.height / 2;
      const rad = Math.atan2(currentCoords.y - objCenterY, currentCoords.x - objCenterX);
      let deg = Math.round(rad * (180 / Math.PI)) + 90; // offset for top stem
      if (deg < 0) deg += 360;

      // Snap to 0, 90, 180, 270 if close
      if (Math.abs(deg - 0) < 4 || Math.abs(deg - 360) < 4) deg = 0;
      if (Math.abs(deg - 90) < 4) deg = 90;
      if (Math.abs(deg - 180) < 4) deg = 180;
      if (Math.abs(deg - 270) < 4) deg = 270;

      onUpdateObject(selectedObject.id, { rotation: deg });
    }
  };

  // END POINTER INTERACTION
  const handlePointerUp = () => {
    setDragMode(null);
    setResizeHandle(null);
    setActiveSnapGuides([]);
    setInitialObjState(null);
  };

  // Track the latest move/up handlers so window-level listeners (attached while
  // dragging) always call the most recent closures.
  const moveRef = useRef<(e: { clientX: number; clientY: number }) => void>(() => {});
  const upRef = useRef<() => void>(() => {});
  useEffect(() => {
    moveRef.current = handlePointerMove;
    upRef.current = handlePointerUp;
  });

  // While an object is being dragged, track the pointer at window level so the drag
  // keeps working even if the cursor leaves the canvas (mouse, trackpad or touch).
  useEffect(() => {
    if (dragMode === null) return;

    const onMove = (e: PointerEvent) => moveRef.current(e);
    const onUp = () => upRef.current();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [dragMode]);

  // INLINE TEXT EDITING ACTIVATION (double-click on canvas, or the Edit button)
  const handleDoubleClickText = (e: React.MouseEvent, obj: TextObject) => {
    e.stopPropagation();
    if (obj.type !== "text") return;
    setEditingTextId(obj.id);
    onSelectObject(obj.id);
  };

  const sortedObjects = [...slide.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div 
      ref={containerRef}
      id="carousel-canvas-container"
      className="relative flex items-center justify-center w-full h-full overflow-auto select-none bg-[#131911]/40 dark:bg-black/50"
      onPointerDown={(e) => {
        // Deselect only when the pointer starts on empty chrome (outside the active
        // canvas). Objects and the canvas background handle their own pointer logic,
        // so this never fights with a drag/resize interaction.
        const target = e.target as HTMLElement | null;
        if (target && !target.closest("#carousel-active-canvas")) {
          setEditingTextId(null);
          onSelectObject(null);
        }
      }}
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(117, 171, 82, 0.18) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Scaled Slide Canvas Frame */}
      <div 
        style={{
          width: `${canvasWidth * effectiveZoom}px`,
          height: `${canvasHeight * effectiveZoom}px`,
          minWidth: `${canvasWidth * effectiveZoom}px`,
          minHeight: `${canvasHeight * effectiveZoom}px`,
          transition: dragMode ? "none" : "width 0.15s ease-out, height 0.15s ease-out"
        }}
        className="relative flex items-center justify-center m-auto"
      >
        <div 
          style={{
            transform: `scale(${effectiveZoom})`,
            transformOrigin: "top left",
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transition: dragMode ? "none" : "transform 0.15s ease-out"
          }}
          className="absolute top-0 left-0 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65)] rounded-2xl overflow-visible ring-1 ring-white/10"
        >
          {/* THE MAIN SLIDE CANVAS STAGE (1080 x 1350 REFERENCE COORDINATE SPACE) */}
          <div
            ref={stageRef}
            id="carousel-active-canvas"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              backgroundColor: slide.backgroundColor || "#141A12",
              backgroundImage: slide.backgroundGradient 
                ? `linear-gradient(to bottom, ${slide.backgroundColor || "#141A12"}, ${slide.backgroundGradient})` 
                : "none"
            }}
            className="relative overflow-hidden rounded-2xl cursor-default touch-none select-none"
            onPointerDown={(e) => {
              // Click directly on the canvas background deselects (objects stop propagation).
              if (e.target === stageRef.current) {
                setEditingTextId(null);
                onSelectObject(null);
              }
            }}
          >
            {/* Template background pattern (rendered from the same SVG used by export),
                or a subtle ambient dot grid when the slide has no explicit template. */}
            {(() => {
              const patternDataURI = slidePatternDataURI(slide, canvasWidth, canvasHeight);
              if (!patternDataURI) {
                return (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-15"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(117, 171, 82, 0.4) 1px, transparent 0)",
                      backgroundSize: "40px 40px"
                    }}
                  />
                );
              }
              return (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url("${patternDataURI}")`,
                    backgroundSize: "100% 100%",
                    opacity: slide.pattern?.opacity ?? 0.9
                  }}
                />
              );
            })()}

            {/* Safe-Zone Margin Guides (60px border) */}
            {showMarginGuides && (
              <div 
                className="absolute inset-[60px] border border-dashed border-brand-primary/25 pointer-events-none rounded-xl"
              />
            )}

            {/* =============================================================== */}
            {/* RENDER ALL OBJECTS ON CANVAS                                    */}
            {/* =============================================================== */}
            {sortedObjects.map((obj) => {
              const isSelected = selectedObjectId === obj.id;
              const isEditingThisText = editingTextId === obj.id;

              return (
                <div
                  key={obj.id}
                  id={`canvas-obj-${obj.id}`}
                  onPointerDown={(e) => handleObjectPointerDown(e, obj)}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    if (obj.type === "text") handleDoubleClickText(e, obj as TextObject);
                  }}
                  style={{
                    position: "absolute",
                    left: `${obj.x}px`,
                    top: `${obj.y}px`,
                    width: `${obj.width}px`,
                    height: `${obj.height}px`,
                    transform: `rotate(${obj.rotation || 0}deg)`,
                    transformOrigin: "center center",
                    opacity: obj.opacity ?? 1,
                    zIndex: obj.zIndex || 1,
                    cursor: isSelected ? "move" : "pointer",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    touchAction: "none"
                  }}
                  className={`group ${
                    isSelected ? "" : "hover:ring-1 hover:ring-brand-primary/50"
                  }`}
                >
                  {/* Selection border overlay (renders above object content) */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-md border border-brand-primary pointer-events-none"
                      style={{
                        zIndex: 999999
                      }}
                    />
                  )}
                  {/* 1. IMAGE OBJECT (Natural Proportion, Contained, Never Stretched) */}
                  {obj.type === "image" && (
                    <div
                      className="w-full h-full relative overflow-hidden"
                      style={{
                        borderRadius: `${(obj as ImageObject).borderRadius || 0}px`,
                        border: (obj as ImageObject).borderWidth 
                          ? `${(obj as ImageObject).borderWidth}px solid ${(obj as ImageObject).borderColor || "#000"}` 
                          : "none",
                        boxShadow: (obj as ImageObject).shadow === "phone"
                          ? "0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
                          : (obj as ImageObject).shadow === "glow"
                          ? "0 0 35px rgba(117,171,82,0.4)"
                          : (obj as ImageObject).shadow === "lg"
                          ? "0 20px 25px -5px rgba(0,0,0,0.5)"
                          : "none"
                      }}
                    >
                      <img
                        src={(obj as ImageObject).imgSrc}
                        alt="Uploaded Graphic"
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    </div>
                  )}

                  {/* 2. TEXT OBJECT */}
                  {obj.type === "text" && (
                    <div className="w-full h-full relative flex flex-col justify-center">
                      {isEditingThisText ? (
                        <InlineTextEditor
                          obj={obj as TextObject}
                          onCommit={(text) => onUpdateObject(obj.id, { text })}
                          onExit={() => setEditingTextId(null)}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: `${(obj as TextObject).fontSize || 32}px`,
                            fontWeight: (obj as TextObject).fontWeight || 600,
                            fontFamily: (obj as TextObject).fontFamily || "inherit",
                            color: (obj as TextObject).fontColor || "#FFF",
                            textAlign: (obj as TextObject).textAlign || "center",
                            lineHeight: (obj as TextObject).lineHeight || 1.3,
                            letterSpacing: `${(obj as TextObject).letterSpacing || 0}px`,
                            textTransform: (obj as TextObject).textTransform || "none",
                            backgroundColor: (obj as TextObject).textBgColor || "transparent",
                            padding: (obj as TextObject).textBgPadding ? `${(obj as TextObject).textBgPadding}px` : "0px",
                            borderRadius: (obj as TextObject).textBgRadius ? `${(obj as TextObject).textBgRadius}px` : "0px"
                          }}
                          className="w-full whitespace-pre-wrap select-none"
                        >
                          {(obj as TextObject).text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. SHAPE OBJECT */}
                  {obj.type === "shape" && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: (obj as ShapeObject).fillColor || "transparent",
                        borderColor: (obj as ShapeObject).strokeColor || "transparent",
                        borderWidth: (obj as ShapeObject).strokeWidth ? `${(obj as ShapeObject).strokeWidth}px` : "0px",
                        borderStyle: "solid",
                        borderRadius: (obj as ShapeObject).shapeKind === "circle" 
                          ? "9999px" 
                          : (obj as ShapeObject).shapeKind === "rounded-rect"
                          ? `${(obj as ShapeObject).borderRadius || 20}px`
                          : (obj as ShapeObject).shapeKind === "highlight-bar"
                          ? "9999px"
                          : "0px"
                      }}
                      className="w-full h-full pointer-events-none"
                    />
                  )}

                  {/* 4. ARROW OBJECT */}
                  {obj.type === "arrow" && (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                          <marker
                            id={`arrowhead-${obj.id}`}
                            markerWidth="6"
                            markerHeight="6"
                            refX="5"
                            refY="3"
                            orient="auto"
                          >
                            <polygon points="0 0, 6 3, 0 6" fill={(obj as ArrowObject).color || "#75AB52"} />
                          </marker>
                        </defs>
                        {(obj as ArrowObject).arrowDirection === "curved-right" ? (
                          <path
                            d="M 15,85 Q 30,15 85,30"
                            fill="none"
                            stroke={(obj as ArrowObject).color || "#75AB52"}
                            strokeWidth={(obj as ArrowObject).strokeWidth || 4}
                            markerEnd={`url(#arrowhead-${obj.id})`}
                            strokeLinecap="round"
                          />
                        ) : (obj as ArrowObject).arrowDirection === "curved-left" ? (
                          <path
                            d="M 85,85 Q 70,15 15,30"
                            fill="none"
                            stroke={(obj as ArrowObject).color || "#75AB52"}
                            strokeWidth={(obj as ArrowObject).strokeWidth || 4}
                            markerEnd={`url(#arrowhead-${obj.id})`}
                            strokeLinecap="round"
                          />
                        ) : (
                          <line
                            x1="15"
                            y1="50"
                            x2="85"
                            y2="50"
                            stroke={(obj as ArrowObject).color || "#75AB52"}
                            strokeWidth={(obj as ArrowObject).strokeWidth || 4}
                            markerEnd={`url(#arrowhead-${obj.id})`}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* SELECTION BOUNDING BOX & INTERACTIVE RESIZE / ROTATE HANDLES */}
                  {/* Handles keep a constant on-screen size (inverse of zoom) so  */}
                  {/* they stay tappable on mobile/tablet.                         */}
                  {/* ============================================================= */}
                  {isSelected && (
                    <>
                      {/* Corner Handles — big invisible touch target wrapping a small visible dot */}
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "nw")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(32), height: handleRaw(32), left: 0, top: 0, transform: "translate(-50%, -50%)", cursor: "nwse-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize top-left"
                        title="Resize top-left"
                      >
                        <div style={{ width: dotRaw(10), height: dotRaw(10) }} className="bg-white border-2 border-brand-primary rounded-full shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "ne")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(32), height: handleRaw(32), left: "100%", top: 0, transform: "translate(-50%, -50%)", cursor: "nesw-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize top-right"
                        title="Resize top-right"
                      >
                        <div style={{ width: dotRaw(10), height: dotRaw(10) }} className="bg-white border-2 border-brand-primary rounded-full shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "se")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(32), height: handleRaw(32), left: "100%", top: "100%", transform: "translate(-50%, -50%)", cursor: "nwse-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize bottom-right"
                        title="Resize bottom-right"
                      >
                        <div style={{ width: dotRaw(10), height: dotRaw(10) }} className="bg-white border-2 border-brand-primary rounded-full shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "sw")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(32), height: handleRaw(32), left: 0, top: "100%", transform: "translate(-50%, -50%)", cursor: "nesw-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize bottom-left"
                        title="Resize bottom-left"
                      >
                        <div style={{ width: dotRaw(10), height: dotRaw(10) }} className="bg-white border-2 border-brand-primary rounded-full shadow-md pointer-events-none" />
                      </div>

                      {/* Edge Handles */}
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "n")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(24), height: handleRaw(24), left: "50%", top: 0, transform: "translate(-50%, -50%)", cursor: "ns-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize top edge"
                        title="Resize top edge"
                      >
                        <div style={{ width: dotRaw(8), height: dotRaw(8) }} className="bg-white border-2 border-brand-primary rounded-sm shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "s")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(24), height: handleRaw(24), left: "50%", top: "100%", transform: "translate(-50%, -50%)", cursor: "ns-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize bottom edge"
                        title="Resize bottom edge"
                      >
                        <div style={{ width: dotRaw(8), height: dotRaw(8) }} className="bg-white border-2 border-brand-primary rounded-sm shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "w")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(24), height: handleRaw(24), left: 0, top: "50%", transform: "translate(-50%, -50%)", cursor: "ew-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize left edge"
                        title="Resize left edge"
                      >
                        <div style={{ width: dotRaw(8), height: dotRaw(8) }} className="bg-white border-2 border-brand-primary rounded-sm shadow-md pointer-events-none" />
                      </div>
                      <div
                        onPointerDown={(e) => handleResizePointerDown(e, "e")}
                        style={{ zIndex: 1000001, touchAction: "none", width: handleRaw(24), height: handleRaw(24), left: "100%", top: "50%", transform: "translate(-50%, -50%)", cursor: "ew-resize" }}
                        className="absolute flex items-center justify-center"
                        aria-label="Resize right edge"
                        title="Resize right edge"
                      >
                        <div style={{ width: dotRaw(8), height: dotRaw(8) }} className="bg-white border-2 border-brand-primary rounded-sm shadow-md pointer-events-none" />
                      </div>

                      {/* Rotation Stem Handle */}
                      <div
                        className="absolute flex flex-col items-center pointer-events-none"
                        style={{
                          zIndex: 1000001,
                          left: "50%",
                          top: 0,
                          gap: `${Math.round(6 / Math.max(effectiveZoom, 0.05))}px`,
                          transform: "translate(-50%, -100%)"
                        }}
                      >
                        <div
                          onPointerDown={handleRotatePointerDown}
                          style={{ width: handleRaw(34), height: handleRaw(34), touchAction: "none", cursor: "grab" }}
                          className="pointer-events-auto bg-white border-2 border-brand-primary rounded-full flex items-center justify-center active:cursor-grabbing shadow-md text-brand-primary"
                          title="Drag to rotate"
                          aria-label="Rotate object"
                        >
                          <RotateCw className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        </div>
                        <div className="w-px bg-brand-primary" style={{ height: `${Math.round(12 / Math.max(effectiveZoom, 0.05))}px` }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Floating Quick Action Mini-Bar (canvas-level, NEVER rotates with */}
            {/* the selection). Inverse-scaled so it stays readable/tappable at  */}
            {/* any canvas zoom; floats below the selection, or above it when */}
            {/* there is no room below. */}
            {selectedObject && (
              <div
                className="absolute left-1/2 bg-surface-elevated/95 border border-border-medium rounded-lg lg:rounded-xl shadow-premium-lg flex items-center gap-1 text-text-main"
                style={{
                  transform: "translateX(-50%)",
                  zIndex: 1000002,
                  top: quickBarTopCanvas,
                  padding: `${Math.round(4 / Math.max(effectiveZoom, 0.05))}px`,
                  gap: `${Math.round(4 / Math.max(effectiveZoom, 0.05))}px`,
                  fontSize: `${Math.round(11 / Math.max(effectiveZoom, 0.05))}px`
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {selectedObject.type === "text" && (
                  <button
                    onClick={(e) => handleDoubleClickText(e, selectedObject as TextObject)}
                    className="flex items-center gap-1 font-medium text-brand-primary"
                    style={{
                      padding: `${Math.round(4 / Math.max(effectiveZoom, 0.05))}px ${Math.round(8 / Math.max(effectiveZoom, 0.05))}px`,
                      minHeight: `${Math.round(28 / Math.max(effectiveZoom, 0.05))}px`
                    }}
                    title="Edit text"
                    aria-label="Edit text"
                  >
                    <Edit3 style={{ width: `${Math.round(14 / Math.max(effectiveZoom, 0.05))}px`, height: `${Math.round(14 / Math.max(effectiveZoom, 0.05))}px` }} />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => onDuplicateObject(selectedObject.id)}
                  style={{
                    padding: `${Math.round(5 / Math.max(effectiveZoom, 0.05))}px`,
                    minHeight: `${Math.round(28 / Math.max(effectiveZoom, 0.05))}px`,
                    minWidth: `${Math.round(28 / Math.max(effectiveZoom, 0.05))}px`
                  }}
                  className="flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main"
                  title="Duplicate"
                  aria-label="Duplicate object"
                >
                  <Copy style={{ width: `${Math.round(15 / Math.max(effectiveZoom, 0.05))}px`, height: `${Math.round(15 / Math.max(effectiveZoom, 0.05))}px` }} />
                </button>
                <button
                  onClick={() => onDeleteObject(selectedObject.id)}
                  style={{
                    padding: `${Math.round(5 / Math.max(effectiveZoom, 0.05))}px`,
                    minHeight: `${Math.round(28 / Math.max(effectiveZoom, 0.05))}px`,
                    minWidth: `${Math.round(28 / Math.max(effectiveZoom, 0.05))}px`
                  }}
                  className="flex items-center justify-center rounded-lg hover:bg-status-error/20 text-text-muted hover:text-status-error"
                  title="Delete"
                  aria-label="Delete object"
                >
                  <Trash2 style={{ width: `${Math.round(15 / Math.max(effectiveZoom, 0.05))}px`, height: `${Math.round(15 / Math.max(effectiveZoom, 0.05))}px` }} />
                </button>
              </div>
            )}

            {/* =============================================================== */}
            {/* SLIDE FOOTER OVERLAYS (Counter, Swipe cue, Author)              */}
            {/* Uses the shared SLIDE_FOOTER geometry + footer palette so the   */}
            {/* editor preview matches the PNG/PDF pixel-for-pixel.             */}
            {/* =============================================================== */}
            {(() => {
              const footer = footerPalette(slide);
              return (
                <>
                  {slide.counterEnabled !== false && (
                    <div
                      className="absolute font-mono font-bold pointer-events-none select-none"
                      style={{
                        right: `${SLIDE_FOOTER.sideInset}px`,
                        bottom: `${SLIDE_FOOTER.bottomInset}px`,
                        fontSize: `${SLIDE_FOOTER.counterSize}px`,
                        lineHeight: 1,
                        color: footer.muted
                      }}
                    >
                      {footerCounterText(slideIndex, totalSlides)}
                    </div>
                  )}

                  {slide.swipeCueEnabled && slideIndex < totalSlides - 1 && (
                    <div
                      className="absolute font-sans font-semibold pointer-events-none select-none flex items-center"
                      style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: `${SLIDE_FOOTER.bottomInset}px`,
                        fontSize: `${SLIDE_FOOTER.swipeSize}px`,
                        lineHeight: 1,
                        gap: "10px",
                        color: footer.accent
                      }}
                    >
                      <span>Swipe</span>
                      <span>→</span>
                    </div>
                  )}

                  {slide.authorHandle && (
                    <div
                      className="absolute font-sans font-medium pointer-events-none select-none"
                      style={{
                        left: `${SLIDE_FOOTER.sideInset}px`,
                        bottom: `${SLIDE_FOOTER.bottomInset}px`,
                        fontSize: `${SLIDE_FOOTER.authorSize}px`,
                        lineHeight: 1,
                        color: footer.muted
                      }}
                    >
                      {slide.authorHandle}
                    </div>
                  )}
                </>
              );
            })()}

            {/* =============================================================== */}
            {/* LIVE SMART ALIGNMENT GUIDES                                      */}
            {/* =============================================================== */}
            {activeSnapGuides.map((guide, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  ...(guide.orientation === "vertical"
                    ? { left: `${guide.position}px`, top: 0, bottom: 0, width: "1px" }
                    : { top: `${guide.position}px`, left: 0, right: 0, height: "1px" })
                }}
                className="border-t border-l border-dashed border-brand-primary pointer-events-none z-50 flex items-center justify-center"
              >
                {guide.label && (
                  <span className="bg-brand-primary text-white text-[10px] font-mono px-1 rounded shadow-sm">
                    {guide.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
