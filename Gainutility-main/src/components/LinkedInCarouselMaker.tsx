/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Trash2, 
  Copy, 
  RotateCw, 
  Download, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Smartphone, 
  Monitor, 
  Palette, 
  FileArchive, 
  Plus, 
  FileText, 
  GripVertical, 
  Edit3, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Undo2,
  Sparkles,
  Upload,
  Sliders,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  LayoutTemplate,
  Heading,
  Image as ImageIcon,
  Square
} from "lucide-react";
import { PostTaskSuccess } from "./PostTaskSuccess";
import { 
  CarouselSlide, 
  CanvasObject, 
  ImageObject, 
  TextObject, 
  ShapeObject, 
  ArrowObject, 
  AspectPreset, 
  CAROUSEL_PRESETS,
  TextPreset,
  ShapeKind,
  ArrowDirection
} from "./carousel/types";
import { 
  createImageObject, 
  createTextObject, 
  createShapeObject, 
  createArrowObject, 
  exportSlidesToZip, 
  exportSlidesToPdf 
} from "./carousel/canvasUtils";
import { CanvasToolbar } from "./carousel/CanvasToolbar";
import { SlideCanvasStage } from "./carousel/SlideCanvasStage";
import { assertWithinHardLimit, safeCanvasSize } from "../utils/imageLimits";
import { ContextualPropertiesPanel } from "./carousel/ContextualPropertiesPanel";
import { SlideSorterPanel } from "./carousel/SlideSorterPanel";
import { TemplatePickerModal, InlineTemplatePicker } from "./carousel/TemplatePicker";
import {
  createSlideFromTemplate,
  applyTemplateToSlide,
  getRecommendedTextTone,
  TemplateDef,
} from "./carousel/templates";

interface LinkedInCarouselMakerProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: any) => void;
}

export const LinkedInCarouselMaker: React.FC<LinkedInCarouselMakerProps> = ({
  onAddToast,
  onCopy,
}) => {
  // Main Slides Array
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Global Settings & Zoom
  const [preset, setPreset] = useState<AspectPreset>("portrait");
  const [zoom, setZoom] = useState<number>(0.48);
  const [zoomMode, setZoomMode] = useState<"fit" | "50" | "75" | "100" | "custom">("fit");
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);

  // Mobile / Tablet Tab State for side panels
  const [mobileTab, setMobileTab] = useState<"slides" | "canvas" | "properties">("canvas");

  // Mobile: "Add" quick-action dropdown + hidden file input for image pickup
  const [addMenuOpen, setAddMenuOpen] = useState<boolean>(false);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  // Template picker modal state (workspace / when slides already exist)
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);

  // Undo / Redo History
  const [history, setHistory] = useState<CarouselSlide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Coalesces rapid successive edits (dragging, resizing, typing) into one undo step.
  const lastEditRef = useRef<{ key: string; time: number } | null>(null);

  // Export State & Success Modal
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [taskDone, setTaskDone] = useState<boolean>(false);
  const [lastExportCount, setLastExportCount] = useState<number>(0);
  const [lastExportType, setLastExportType] = useState<"zip" | "pdf">("zip");

  // Drag & drop file upload state
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Active slide & selection
  const activeSlide = slides[activeSlideIndex] || null;
  const selectedObject = activeSlide?.objects.find((o) => o.id === selectedObjectId) || null;

  // Push state to history for undo/redo
  const pushToHistory = useCallback((newSlides: CarouselSlide[]) => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, newSlides].slice(-25); // Cap at 25 steps
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 24));
  }, [historyIndex]);

  // Snapshot the initial (empty) state so the very first action is undoable.
  useEffect(() => {
    setHistory([[]]);
    setHistoryIndex(0);
  }, []);

  // Apply a slides change and record it in history. Pass a coalesceKey for
  // continuous edits (drag, resize, typing) so they collapse into one step.
  const commitSlides = useCallback(
    (nextSlides: CarouselSlide[], coalesceKey?: string) => {
      const now = Date.now();
      const canCoalesce =
        coalesceKey &&
        lastEditRef.current?.key === coalesceKey &&
        now - lastEditRef.current.time < 800;

      if (canCoalesce) {
        setHistory((prev) => {
          const branch = prev.slice(0, historyIndex + 1);
          if (branch.length === 0) return [nextSlides];
          return [...branch.slice(0, -1), nextSlides].slice(-25);
        });
        lastEditRef.current = { key: coalesceKey, time: now };
      } else {
        pushToHistory(nextSlides);
        lastEditRef.current = coalesceKey ? { key: coalesceKey, time: now } : null;
      }
      setSlides(nextSlides);
    },
    [historyIndex, pushToHistory]
  );

  // UNDO
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevSlides = history[historyIndex - 1];
    setSlides(prevSlides);
    setHistoryIndex(historyIndex - 1);
    setActiveSlideIndex((cur) => (prevSlides.length === 0 ? 0 : Math.min(cur, prevSlides.length - 1)));
    setSelectedObjectId(null);
    if (onAddToast) onAddToast("Undo applied", "info");
  };

  // REDO
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextSlides = history[historyIndex + 1];
    setSlides(nextSlides);
    setHistoryIndex(historyIndex + 1);
    setActiveSlideIndex((cur) => (nextSlides.length === 0 ? 0 : Math.min(cur, nextSlides.length - 1)));
    setSelectedObjectId(null);
    if (onAddToast) onAddToast("Redo applied", "info");
  };

  // Zoom Handler
  const handleSetZoom = (newZoom: number, mode: "fit" | "50" | "75" | "100" | "custom" = "custom") => {
    setZoom(newZoom);
    setZoomMode(mode);
  };

  // --------------------------------------------------------------------------
  // IMAGE INGESTION: Preserves natural proportion & creates contain ImageObject
  // --------------------------------------------------------------------------
  const handleIngestFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      if (onAddToast) onAddToast("Please select valid image files.", "warning");
      return;
    }

    const presetConfig = CAROUSEL_PRESETS[preset];
    const newSlides: CarouselSlide[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not decode "${file.name}".`));
        image.src = dataUrl;
      });

      try {
        assertWithinHardLimit(img.naturalWidth || 1, img.naturalHeight || 1);
      } catch (err: any) {
        if (onAddToast) onAddToast(err.message || "Image is too large to add.", "warning");
        continue;
      }

      // Memory guard for phones: downscale huge source images before they are
      // stored in the undo history / slide state, so the tab stays responsive.
      const guarded = safeCanvasSize(img.naturalWidth || 1, img.naturalHeight || 1);
      let ingestUrl = dataUrl;
      let ingestWidth = img.naturalWidth;
      let ingestHeight = img.naturalHeight;
      if (guarded.downscaled) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = guarded.width;
          canvas.height = guarded.height;
          ctx.drawImage(img, 0, 0, guarded.width, guarded.height);
          ingestUrl = canvas.toDataURL("image/jpeg", 0.92);
          ingestWidth = guarded.width;
          ingestHeight = guarded.height;
        }
      }

      // Create proportional ImageObject (contained, natural aspect, with room for headlines)
      const imgObject = createImageObject(
        ingestUrl,
        ingestWidth,
        ingestHeight,
        presetConfig.width,
        presetConfig.height,
        2
      );

      // Add default headline text above image
      const headlineObject = createTextObject(
        "heading",
        presetConfig.width,
        presetConfig.height,
        10,
        true
      );
      headlineObject.text = i === 0 
        ? "How we simplified this flow" 
        : `Step 0${i + 1} — Key takeaway`;
      headlineObject.y = 80;

      // Add default caption text below image
      const subheadObject = createTextObject(
        "caption",
        presetConfig.width,
        presetConfig.height,
        10,
        true
      );
      subheadObject.text = "Double-click the text to edit it";
      subheadObject.y = presetConfig.height - 110;

      const slide: CarouselSlide = {
        id: "slide_" + Math.random().toString(36).substring(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""),
        backgroundColor: "#141A12",
        objects: [headlineObject, imgObject, subheadObject],
        counterEnabled: true,
        swipeCueEnabled: i === 0,
        authorHandle: "@gainutilitysuite"
      };

      newSlides.push(slide);
    }

    const updatedSlides = [...slides, ...newSlides];
    setSlides(updatedSlides);
    pushToHistory(updatedSlides);
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    if (slides.length === 0) {
      setActiveSlideIndex(0);
    }
    if (onAddToast) {
      onAddToast(`Added ${newSlides.length} slide${newSlides.length > 1 ? "s" : ""}.`, "success");
    }
  };

  // --------------------------------------------------------------------------
  // OBJECT MANIPULATION HANDLERS
  // --------------------------------------------------------------------------
  const handleUpdateActiveSlide = (updates: Partial<CarouselSlide>) => {
    if (!activeSlide) return;
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...updates } : s));
    commitSlides(nextSlides, "slide");
  };

  const handleUpdateObject = (objId: string, updates: Partial<CanvasObject>) => {
    if (!activeSlide) return;
    const nextObjects = activeSlide.objects.map((obj) => (obj.id === objId ? ({ ...obj, ...updates } as CanvasObject) : obj));
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    commitSlides(nextSlides, `obj-${objId}`);
  };

  const handleDeleteObject = (objId: string) => {
    if (!activeSlide) return;
    const nextObjects = activeSlide.objects.filter((obj) => obj.id !== objId);
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    setSlides(nextSlides);
    setSelectedObjectId(null);
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast("Object deleted", "info");
  };

  const handleDuplicateObject = (objId: string) => {
    if (!activeSlide) return;
    const targetObj = activeSlide.objects.find((o) => o.id === objId);
    if (!targetObj) return;

    const duplicated: CanvasObject = {
      ...targetObj,
      id: "obj_" + Math.random().toString(36).substring(2, 9),
      x: targetObj.x + 30,
      y: targetObj.y + 30,
      zIndex: (targetObj.zIndex || 1) + 1
    };

    const nextObjects = [...activeSlide.objects, duplicated];
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    setSlides(nextSlides);
    setSelectedObjectId(duplicated.id);
    pushToHistory(nextSlides);
  };

  // Add Elements to current active slide
  const handleAddText = (presetType: TextPreset = "heading") => {
    if (!activeSlide) return;
    const presetConfig = CAROUSEL_PRESETS[preset];
    const maxZ = Math.max(...activeSlide.objects.map((o) => o.zIndex || 1), 0);
    const tone = getRecommendedTextTone(activeSlide);
    const newText = createTextObject(presetType, presetConfig.width, presetConfig.height, maxZ + 1, tone === "light");

    const nextObjects = [...activeSlide.objects, newText];
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    setSlides(nextSlides);
    setSelectedObjectId(newText.id);
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast("Text added", "info");
  };

  const handleAddImageToSlide = async (file: File) => {
    if (!activeSlide) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const presetConfig = CAROUSEL_PRESETS[preset];
        const maxZ = Math.max(...activeSlide.objects.map((o) => o.zIndex || 1), 0);
        const newImgObj = createImageObject(src, img.naturalWidth, img.naturalHeight, presetConfig.width, presetConfig.height, maxZ + 1);

        const nextObjects = [...activeSlide.objects, newImgObj];
        const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
        setSlides(nextSlides);
        setSelectedObjectId(newImgObj.id);
        pushToHistory(nextSlides);
        if (onAddToast) onAddToast("Image added to slide", "success");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleAddShape = (kind: ShapeKind) => {
    if (!activeSlide) return;
    const presetConfig = CAROUSEL_PRESETS[preset];
    const maxZ = Math.max(...activeSlide.objects.map((o) => o.zIndex || 1), 0);
    const newShape = createShapeObject(kind, presetConfig.width, presetConfig.height, maxZ + 1);

    const nextObjects = [...activeSlide.objects, newShape];
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    setSlides(nextSlides);
    setSelectedObjectId(newShape.id);
    pushToHistory(nextSlides);
  };

  const handleAddArrow = (direction: ArrowDirection) => {
    if (!activeSlide) return;
    const presetConfig = CAROUSEL_PRESETS[preset];
    const maxZ = Math.max(...activeSlide.objects.map((o) => o.zIndex || 1), 0);
    const newArrow = createArrowObject(direction, presetConfig.width, presetConfig.height, maxZ + 1);

    const nextObjects = [...activeSlide.objects, newArrow];
    const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: nextObjects } : s));
    setSlides(nextSlides);
    setSelectedObjectId(newArrow.id);
    pushToHistory(nextSlides);
  };

  // Align selected object
  const handleAlignSelected = (alignment: "left" | "center-x" | "right" | "top" | "center-y" | "bottom") => {
    if (!selectedObject || !activeSlide) return;
    const presetConfig = CAROUSEL_PRESETS[preset];
    let nextX = selectedObject.x;
    let nextY = selectedObject.y;

    if (alignment === "center-x") nextX = Math.round((presetConfig.width - selectedObject.width) / 2);
    else if (alignment === "left") nextX = 60;
    else if (alignment === "right") nextX = presetConfig.width - selectedObject.width - 60;
    else if (alignment === "center-y") nextY = Math.round((presetConfig.height - selectedObject.height) / 2);
    else if (alignment === "top") nextY = 60;
    else if (alignment === "bottom") nextY = presetConfig.height - selectedObject.height - 60;

    handleUpdateObject(selectedObject.id, { x: nextX, y: nextY });
  };

  // Layer Reordering
  const handleLayerReorder = (action: "front" | "forward" | "backward" | "back") => {
    if (!selectedObject || !activeSlide) return;
    const sorted = [...activeSlide.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const currentIndex = sorted.findIndex((o) => o.id === selectedObject.id);
    if (currentIndex === -1) return;

    // Apply a single atomic change in one commit so adjacent layers actually swap.
    let swappedObjects: CanvasObject[] | null = null;
    let toastMsg: string | null = null;

    if (action === "front") {
      const maxZ = Math.max(...sorted.map((o) => o.zIndex || 1), 0);
      swappedObjects = activeSlide.objects.map((o) => (o.id === selectedObject.id ? { ...o, zIndex: maxZ + 1 } : o));
      toastMsg = "Moved to front";
    } else if (action === "back") {
      const minZ = Math.min(...sorted.map((o) => o.zIndex || 1), 1);
      swappedObjects = activeSlide.objects.map((o) => (o.id === selectedObject.id ? { ...o, zIndex: Math.max(0, minZ - 1) } : o));
      toastMsg = "Moved to back";
    } else if (action === "forward" && currentIndex < sorted.length - 1) {
      const swapWith = sorted[currentIndex + 1];
      const curZ = selectedObject.zIndex || 1;
      swappedObjects = activeSlide.objects.map((o) => {
        if (o.id === selectedObject.id) return { ...o, zIndex: swapWith.zIndex || 1 };
        if (o.id === swapWith.id) return { ...o, zIndex: curZ };
        return o;
      });
      toastMsg = "Brought forward";
    } else if (action === "backward" && currentIndex > 0) {
      const swapWith = sorted[currentIndex - 1];
      const curZ = selectedObject.zIndex || 1;
      swappedObjects = activeSlide.objects.map((o) => {
        if (o.id === selectedObject.id) return { ...o, zIndex: swapWith.zIndex || 0 };
        if (o.id === swapWith.id) return { ...o, zIndex: curZ };
        return o;
      });
      toastMsg = "Sent backward";
    }

    if (swappedObjects) {
      const nextSlides = slides.map((s, idx) => (idx === activeSlideIndex ? { ...s, objects: swappedObjects as CanvasObject[] } : s));
      commitSlides(nextSlides, `layer-${selectedObject.id}`);
      if (toastMsg && onAddToast) onAddToast(toastMsg, "info");
    }
  };

  // --------------------------------------------------------------------------
  // SLIDE MANAGEMENT (Add, Duplicate, Delete, Reorder)
  // --------------------------------------------------------------------------
  const handleAddBlankSlide = () => {
    const presetConfig = CAROUSEL_PRESETS[preset];
    const blankBg = slides[0]?.backgroundColor || "#141A12";
    const tone = getRecommendedTextTone({ backgroundColor: blankBg });
    const newSlide: CarouselSlide = {
      id: "slide_" + Math.random().toString(36).substring(2, 9),
      name: `Slide ${slides.length + 1}`,
      backgroundColor: blankBg,
      objects: [
        createTextObject("heading", presetConfig.width, presetConfig.height, 1, tone === "light")
      ],
      counterEnabled: true,
      swipeCueEnabled: false,
      authorHandle: slides[0]?.authorHandle || "@gainutilitysuite"
    };

    const nextSlides = [...slides, newSlide];
    setSlides(nextSlides);
    setActiveSlideIndex(nextSlides.length - 1);
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast("Added new slide", "info");
  };

  // --------------------------------------------------------------------------
  // TEMPLATE HANDLERS (styling vs. fresh-slide creation)
  // --------------------------------------------------------------------------
  const buildTemplateSlides = (template: TemplateDef, count: number): CarouselSlide[] => {
    const presetConfig = CAROUSEL_PRESETS[preset];
    const built: CarouselSlide[] = [];
    for (let i = 0; i < count; i++) {
      built.push(createSlideFromTemplate(template, presetConfig, i, count));
    }
    return built;
  };

  const commitNewSlides = (newSlides: CarouselSlide[], toastMsg: string) => {
    const nextSlides = [...slides, ...newSlides];
    setSlides(nextSlides);
    setActiveSlideIndex(Math.max(0, slides.length === 0 ? 0 : slides.length));
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast(toastMsg, "success");
  };

  /** Empty-state / modal "create": make fresh slides from a template. */
  const handleApplyTemplateAsNewSlides = (template: TemplateDef, count: number) => {
    const built = buildTemplateSlides(template, count);
    commitNewSlides(built, `Created ${built.length} ${template.name} slide${built.length > 1 ? "s" : ""}.`);
    setTemplateModalOpen(false);
  };

  /** Workspace "style": restyle the ACTIVE slide's background, keep content. */
  const handleApplyTemplateToActive = (template: TemplateDef) => {
    if (!activeSlide) return;
    handleUpdateActiveSlide(applyTemplateToSlide(activeSlide, template));
    setTemplateModalOpen(false);
    if (onAddToast) onAddToast(`Applied “${template.name}” background`, "success");
  };

  /** Create fresh blank slides (empty state "Use Blank Canvas"). */
  const handleUseBlankNewSlides = () => {
    const presetConfig = CAROUSEL_PRESETS[preset];
    const blankSlides: CarouselSlide[] = [];
    for (let i = 0; i < 3; i++) {
      blankSlides.push({
        id: "slide_" + Math.random().toString(36).substring(2, 9),
        name: `Slide ${blankSlides.length + 1}`,
        backgroundColor: "#141A12",
        objects: [
          createTextObject("heading", presetConfig.width, presetConfig.height, 1, true)
        ],
        counterEnabled: true,
        swipeCueEnabled: i === 0,
        authorHandle: "@gainutilitysuite"
      });
    }
    commitNewSlides(blankSlides, "Created 3 blank slides.");
    setTemplateModalOpen(false);
  };

  /** Workspace "blank": reset active slide background to a neutral frame. */
  const handleResetActiveSlideBackground = () => {
    if (!activeSlide) return;
    handleUpdateActiveSlide({
      backgroundColor: "#141A12",
      backgroundGradient: undefined,
      pattern: undefined,
      accent: undefined,
      templateId: undefined
    });
    setTemplateModalOpen(false);
    if (onAddToast) onAddToast("Background reset to blank canvas", "info");
  };

  /** Central dispatch used by both inline and modal pickers. */
  const handleTemplatePickerApply = (template: TemplateDef, count: number) => {
    if (slides.length === 0) {
      handleApplyTemplateAsNewSlides(template, count);
    } else {
      handleApplyTemplateToActive(template);
    }
  };

  const handleTemplatePickerBlank = () => {
    if (slides.length === 0) {
      handleUseBlankNewSlides();
    } else {
      handleResetActiveSlideBackground();
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    if (!target) return;

    const duplicated: CarouselSlide = {
      ...JSON.parse(JSON.stringify(target)),
      id: "slide_" + Math.random().toString(36).substring(2, 9),
      name: `${target.name} (Copy)`
    };

    const nextSlides = [...slides.slice(0, index + 1), duplicated, ...slides.slice(index + 1)];
    setSlides(nextSlides);
    setActiveSlideIndex(index + 1);
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast("Slide duplicated", "info");
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      if (onAddToast) onAddToast("Carousel must have at least one slide.", "warning");
      return;
    }

    const nextSlides = slides.filter((_, idx) => idx !== index);
    setSlides(nextSlides);
    setActiveSlideIndex(Math.max(0, index - 1));
    pushToHistory(nextSlides);
    if (onAddToast) onAddToast("Slide deleted", "info");
  };

  const handleReorderSlides = (fromIndex: number, toIndex: number) => {
    const updated = [...slides];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSlides(updated);
    setActiveSlideIndex(toIndex);
    pushToHistory(updated);
  };

  // --------------------------------------------------------------------------
  // EXPORT HANDLERS (Render exact WYSIWYG canvas state)
  // --------------------------------------------------------------------------
  const handleDownloadAllZip = async () => {
    if (slides.length === 0) return;
    setIsExportingZip(true);
    try {
      const zipBlob = await exportSlidesToZip(slides, preset);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gainutility-linkedin-carousel-${slides.length}-slides.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExportCount(slides.length);
      setLastExportType("zip");
      setTaskDone(true);
      if (onAddToast) onAddToast("Carousel ZIP exported successfully!", "success");
    } catch (err) {
      console.error(err);
      if (onAddToast) onAddToast("Export failed. Please try again.", "error");
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadAsPdf = async () => {
    if (slides.length === 0) return;
    setIsExportingPdf(true);
    try {
      const pdfBlob = await exportSlidesToPdf(slides, preset);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gainutility-linkedin-carousel-${slides.length}-slides.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExportCount(slides.length);
      setLastExportType("pdf");
      setTaskDone(true);
      if (onAddToast) onAddToast("LinkedIn Document PDF ready for publishing!", "success");
    } catch (err) {
      console.error(err);
      if (onAddToast) onAddToast("PDF export failed.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // --------------------------------------------------------------------------
  // PRESET CHANGES: proportionally rescale every object so layouts adapt.
  // --------------------------------------------------------------------------
  const relayoutSlidesForPreset = (slidesToFit: CarouselSlide[], fromId: AspectPreset, toId: AspectPreset): CarouselSlide[] => {
    const fromC = CAROUSEL_PRESETS[fromId] || CAROUSEL_PRESETS.portrait;
    const toC = CAROUSEL_PRESETS[toId] || CAROUSEL_PRESETS.portrait;
    const sx = toC.width / fromC.width;
    const sy = toC.height / fromC.height;

    const fitObject = (obj: CanvasObject): CanvasObject => {
      const scaled: any = {
        ...obj,
        x: Math.round(obj.x * sx),
        y: Math.round(obj.y * sy),
        width: Math.max(20, Math.round(obj.width * sx)),
        height: Math.max(20, Math.round(obj.height * sy))
      };
      if (obj.type === "text") {
        scaled.fontSize = Math.max(10, Math.round((obj.fontSize || 24) * sx));
        scaled.letterSpacing = Math.round((obj.letterSpacing || 0) * sx);
        if (obj.textBgPadding != null) scaled.textBgPadding = Math.max(0, Math.round(obj.textBgPadding * sx));
        if (obj.textBgRadius != null) scaled.textBgRadius = Math.max(0, Math.round(obj.textBgRadius * sx));
      } else if (obj.type === "shape") {
        if (obj.borderRadius != null) scaled.borderRadius = Math.max(0, Math.round(obj.borderRadius * sx));
        if (obj.strokeWidth != null) scaled.strokeWidth = Math.max(1, Math.round(obj.strokeWidth * sx));
      } else if (obj.type === "image") {
        if (obj.borderRadius != null) scaled.borderRadius = Math.max(0, Math.round(obj.borderRadius * sx));
        if (obj.borderWidth != null) scaled.borderWidth = Math.max(1, Math.round(obj.borderWidth * sx));
      }
      return scaled as CanvasObject;
    };

    return slidesToFit.map((s) => ({ ...s, objects: s.objects.map(fitObject) }));
  };

  const handleSetPreset = (newPreset: AspectPreset) => {
    if (newPreset === preset) return;
    if (slides.length > 0) {
      const rescaled = relayoutSlidesForPreset(slides, preset, newPreset);
      setSlides(rescaled);
      pushToHistory(rescaled);
      if (onAddToast) onAddToast(`Slides rescaled to ${CAROUSEL_PRESETS[newPreset].ratio}`, "info");
    }
    setPreset(newPreset);
  };

  // Sample Carousel Starter (for quick trial without files)
  const handleLoadSample = () => {
    const presetConfig = CAROUSEL_PRESETS.portrait;
    
    onAddToast("Example carousel loaded — replace with your slides", "info");
    
    // Slide 1: Cover with Title + Mobile Mockup Frame + Subtitle
    const slide1: CarouselSlide = {
      id: "slide_sample_1",
      name: "Cover Slide",
      backgroundColor: "#141A12",
      objects: [
        {
          id: "txt_1",
          type: "text",
          text: "✨ CASE STUDY",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "ui-monospace, monospace",
          fontColor: "#8BCE62",
          textAlign: "center",
          lineHeight: 1,
          letterSpacing: 1,
          textTransform: "uppercase",
          textBgColor: "rgba(117, 171, 82, 0.2)",
          textBgPadding: 10,
          textBgRadius: 18,
          x: 440,
          y: 60,
          width: 200,
          height: 44,
          rotation: 0,
          zIndex: 10,
          opacity: 1
        },
        {
          id: "txt_2",
          type: "text",
          text: "5 UX decisions that reduced friction by 40%",
          fontSize: 52,
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontColor: "#F4F7F2",
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: -1,
          x: 108,
          y: 130,
          width: 864,
          height: 140,
          rotation: 0,
          zIndex: 10,
          opacity: 1
        },
        {
          id: "shape_card",
          type: "shape",
          shapeKind: "rounded-rect",
          fillColor: "rgba(255, 255, 255, 0.05)",
          strokeColor: "rgba(117, 171, 82, 0.4)",
          strokeWidth: 2,
          borderRadius: 24,
          x: 280,
          y: 320,
          width: 520,
          height: 820,
          rotation: 0,
          zIndex: 2,
          opacity: 1
        },
        {
          id: "txt_sub",
          type: "text",
          text: "Swipe to see before & after breakdown →",
          fontSize: 26,
          fontWeight: 500,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontColor: "#CBD6C8",
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: 0,
          x: 240,
          y: 1200,
          width: 600,
          height: 40,
          rotation: 0,
          zIndex: 10,
          opacity: 1
        }
      ],
      counterEnabled: true,
      swipeCueEnabled: true,
      authorHandle: "@gainutilitysuite"
    };

    let loadedSlides = [slide1];
    if (preset !== "portrait") {
      loadedSlides = relayoutSlidesForPreset(loadedSlides, "portrait", preset);
    }
    setSlides(loadedSlides);
    setActiveSlideIndex(0);
    setSelectedObjectId(null);
    pushToHistory(loadedSlides);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-3 sm:gap-4 select-none">
      
      {/* Hidden file input for main dropzone */}
      <input
        type="file"
        ref={mainFileInputRef}
        multiple
        onChange={(e) => {
          if (e.target.files) handleIngestFiles(e.target.files);
        }}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* =================================================================== */}
      {/* 1. EMPTY STATE: CLEAN UPLOAD DROPZONE                               */}
      {/* =================================================================== */}
      {slides.length === 0 ? (
        <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-2xl lg:rounded-3xl p-4 sm:p-8 lg:p-12 text-center flex flex-col items-center justify-center min-h-[320px] sm:min-h-[460px] shadow-premium-sm relative overflow-hidden">
          {/* Subtle Ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-4 relative z-10">
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-[58ch] mx-auto">
              Upload screenshots or images to compose a clean 4:5 LinkedIn carousel.
              Screenshots stay completely contained without forced cropping — scale, position, and add annotations with full canvas freedom.
            </p>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files) handleIngestFiles(e.dataTransfer.files);
              }}
              onClick={() => mainFileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 group ${
                isDraggingFile
                  ? "border-brand-primary bg-brand-primary-light/40 scale-[1.01]"
                  : "border-border-medium hover:border-brand-primary bg-surface-muted/50 hover:bg-surface-muted"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <span className="font-sans font-bold text-sm sm:text-base text-text-main block">
                  Drop images or mobile screenshots here
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Supports PNG, JPG, WebP • Multi-file auto slide generation
                </span>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-sans font-bold text-xs sm:text-sm shadow-premium-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload Carousel Images</span>
              </button>
            </div>

            {/* Quick Starter Options */}
            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-text-muted">
              <span>Need a quick start?</span>
              <button
                onClick={handleLoadSample}
                className="font-sans font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Load Example Carousel
              </button>
              <span>•</span>
              <button
                onClick={handleAddBlankSlide}
                className="font-sans font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Start Blank
              </button>
            </div>
          </div>

          {/* Real template starters (inline grid, live previews) */}
          <div className="w-full max-w-3xl mx-auto relative z-10 mt-8 text-left">
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="font-sans font-bold text-sm text-text-main">
                Or start from a curated template
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                editable frames, not finished posts
              </span>
            </div>
            <InlineTemplatePicker
              onApply={handleTemplatePickerApply}
              onUseBlank={handleTemplatePickerBlank}
              initialCount={3}
              aspect={preset}
            />
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* 2. WIDE, COMPACT VIEWPORT-FRIENDLY DESIGN WORKSPACE                 */
        /* =================================================================== */
        <div className="w-full flex flex-col gap-2">
          
          {/* TOP WORKSPACE HEADER & TOOLBAR */}
          <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-xl lg:rounded-2xl shadow-premium-sm px-2 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
            
            {/* Left: Branding & Status */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
              <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-brand-primary-light text-brand-primary text-[10px] font-mono font-bold">
                {slides.length} {slides.length === 1 ? "Slide" : "Slides"}
              </span>
              <span className="hidden md:inline text-[11px] font-mono text-text-muted">
                {CAROUSEL_PRESETS[preset].ratio}
              </span>
              <button
                onClick={() => setTemplateModalOpen(true)}
                className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border-light dark:border-border-medium text-[11px] font-sans font-bold text-text-main transition-all items-center gap-1.5 cursor-pointer"
                title="Apply a background template to this slide"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-brand-primary" />
                <span className="hidden md:inline">Templates</span>
              </button>
            </div>

            {/* Middle: Canvas Tools */}
            <div className="flex-1 min-w-0 max-w-2xl flex items-center justify-center">
              <CanvasToolbar
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onAddText={handleAddText}
                onAddImage={handleAddImageToSlide}
                onAddShape={handleAddShape}
                onAddArrow={handleAddArrow}
                selectedObject={selectedObject}
                onDeleteSelected={() => selectedObjectId && handleDeleteObject(selectedObjectId)}
                onDuplicateSelected={() => selectedObjectId && handleDuplicateObject(selectedObjectId)}
                onAlignSelected={handleAlignSelected}
                onLayerReorder={handleLayerReorder}
                zoom={zoom}
                zoomMode={zoomMode}
                onSetZoom={handleSetZoom}
                showMarginGuides={showMarginGuides}
                onToggleMarginGuides={() => setShowMarginGuides(!showMarginGuides)}
              />
            </div>

            {/* Right: Export Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Mobile: Templates button (if not visible in left section) */}
              <button
                onClick={() => setTemplateModalOpen(true)}
                className="sm:hidden p-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border-light text-text-muted cursor-pointer"
                title="Templates"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-brand-primary" />
              </button>

              <button
                onClick={handleDownloadAllZip}
                disabled={isExportingZip || isExportingPdf}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-hover text-text-main border border-border-light text-xs font-sans font-semibold transition-all items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Download all slide images as ZIP"
              >
                {isExportingZip ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                ) : (
                  <FileArchive className="w-3.5 h-3.5 text-brand-primary" />
                )}
                <span className="hidden lg:inline">Download</span>
                <span>ZIP</span>
              </button>

              <button
                onClick={handleDownloadAsPdf}
                disabled={isExportingZip || isExportingPdf}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-sans font-bold shadow-premium-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Export LinkedIn Carousel PDF document"
              >
                {isExportingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span className="hidden min-[400px]:inline">Export</span>
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DESKTOP 3-COLUMN WORKSPACE (lg: 1024px+)                         */}
          {/* ================================================================= */}
          <div className="hidden lg:flex rounded-2xl lg:rounded-3xl border border-border-light dark:border-border-medium bg-surface-base dark:bg-surface-elevated shadow-premium-md overflow-hidden" style={{ height: "min(74vh, 820px)", minHeight: 560 }}>
            
            {/* 1. LEFT: Slide Sorter — responsive width */}
            <div className="hidden lg:flex w-[200px] xl:w-[220px] 2xl:w-[240px] shrink-0 border-r border-border-light dark:border-border-medium h-full flex-col overflow-hidden bg-surface-base dark:bg-surface-elevated">
              <SlideSorterPanel
                slides={slides}
                activeSlideIndex={activeSlideIndex}
                onSelectSlide={(idx) => {
                  setActiveSlideIndex(idx);
                  setSelectedObjectId(null);
                }}
                onAddSlide={handleAddBlankSlide}
                onDuplicateSlide={handleDuplicateSlide}
                onDeleteSlide={handleDeleteSlide}
                onReorderSlides={handleReorderSlides}
                preset={preset}
              />
            </div>

            {/* 2. CENTER: Canvas — always gets remaining space */}
            <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-[#131911]/40 dark:bg-black/50 flex flex-col">
              {activeSlide && (
                <SlideCanvasStage
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  zoom={zoom}
                  zoomMode={zoomMode}
                  onAutoFitZoomCalculated={(fitScale) => {
                    if (zoomMode === "fit") setZoom(fitScale);
                  }}
                  selectedObjectId={selectedObjectId}
                  onSelectObject={setSelectedObjectId}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  onLayerReorder={handleLayerReorder}
                  showMarginGuides={showMarginGuides}
                />
              )}
            </div>

            {/* 3. RIGHT: Properties — responsive width */}
            <div className="hidden lg:flex w-[260px] xl:w-[280px] 2xl:w-[300px] shrink-0 border-l border-border-light dark:border-border-medium h-full flex-col overflow-hidden bg-surface-base dark:bg-surface-elevated">
              {activeSlide && (
                <ContextualPropertiesPanel
                  selectedObject={selectedObject}
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  onSetPreset={handleSetPreset}
                  onUpdateSlide={handleUpdateActiveSlide}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  showMarginGuides={showMarginGuides}
                  onToggleMarginGuides={() => setShowMarginGuides(!showMarginGuides)}
                  onCopy={onCopy}
                />
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* TABLET LAYOUT (md–lg: 768px–1023px)                               */}
          {/* Canvas is primary. Slides/Properties via tab bar.                */}
          {/* ================================================================= */}
          <div className="hidden md:flex lg:hidden flex-col gap-2">
            {/* Tab selector */}
            <div className="flex items-center rounded-xl bg-surface-muted p-0.5 border border-border-light">
              <button
                onClick={() => setMobileTab("slides")}
                className={`flex-1 py-1.5 text-[11px] font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  mobileTab === "slides" ? "bg-brand-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
                }`}
              >
                Slides ({slides.length})
              </button>
              <button
                onClick={() => setMobileTab("canvas")}
                className={`flex-1 py-1.5 text-[11px] font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  mobileTab === "canvas" ? "bg-brand-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
                }`}
              >
                Canvas
              </button>
              <button
                onClick={() => setMobileTab("properties")}
                className={`flex-1 py-1.5 text-[11px] font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  mobileTab === "properties" ? "bg-brand-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
                }`}
              >
                Properties
              </button>
            </div>

            {/* Canvas always visible on tablet */}
            <div className="w-full rounded-2xl border border-border-light dark:border-border-medium bg-[#131911]/40 dark:bg-black/50 overflow-hidden shadow-premium-sm" style={{ height: "min(60vh, 520px)", minHeight: 360 }}>
              {activeSlide && (
                <SlideCanvasStage
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  zoom={zoom}
                  zoomMode="fit"
                  onAutoFitZoomCalculated={(fitScale) => setZoom(fitScale)}
                  selectedObjectId={selectedObjectId}
                  onSelectObject={setSelectedObjectId}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  onLayerReorder={handleLayerReorder}
                  showMarginGuides={showMarginGuides}
                />
              )}
            </div>

            {/* Secondary panel: slides or properties */}
            {mobileTab === "slides" && (
              <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-2xl p-2.5 shadow-premium-sm max-h-[280px] overflow-hidden">
                <SlideSorterPanel
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  onSelectSlide={(idx) => {
                    setActiveSlideIndex(idx);
                    setSelectedObjectId(null);
                    setMobileTab("canvas");
                  }}
                  onAddSlide={handleAddBlankSlide}
                  onDuplicateSlide={handleDuplicateSlide}
                  onDeleteSlide={handleDeleteSlide}
                  onReorderSlides={handleReorderSlides}
                  preset={preset}
                />
              </div>
            )}
            {mobileTab === "properties" && activeSlide && (
              <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-2xl p-2.5 shadow-premium-sm max-h-[45vh] overflow-y-auto">
                <ContextualPropertiesPanel
                  selectedObject={selectedObject}
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  onSetPreset={handleSetPreset}
                  onUpdateSlide={handleUpdateActiveSlide}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  showMarginGuides={showMarginGuides}
                  onToggleMarginGuides={() => setShowMarginGuides(!showMarginGuides)}
                  onCopy={onCopy}
                />
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* MOBILE LAYOUT (< md: 320px–767px)                                 */}
          {/* Canvas-first. Slide nav bar + property bottom sheet.             */}
          {/* ================================================================= */}
          <div className="flex md:hidden flex-col gap-2">
            {/* Mobile Slide Navigation Bar */}
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => {
                  if (activeSlideIndex > 0) {
                    setActiveSlideIndex(activeSlideIndex - 1);
                    setSelectedObjectId(null);
                  }
                }}
                disabled={activeSlideIndex === 0}
                className="shrink-0 w-8 h-8 rounded-lg bg-surface-muted border border-border-light flex items-center justify-center text-text-muted disabled:opacity-30 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                <span className="text-[11px] font-mono font-bold text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-full shrink-0">
                  {String(activeSlideIndex + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setMobileTab(mobileTab === "slides" ? "canvas" : "slides")}
                  className="text-[11px] font-sans font-semibold text-text-main truncate cursor-pointer hover:text-brand-primary transition-colors"
                >
                  {activeSlide?.name || `Slide ${activeSlideIndex + 1}`}
                </button>
              </div>

              <button
                onClick={() => {
                  setMobileTab(mobileTab === "slides" ? "canvas" : "slides");
                }}
                className="shrink-0 w-8 h-8 rounded-lg bg-surface-muted border border-border-light flex items-center justify-center text-text-muted cursor-pointer"
                aria-label="Open slide browser"
              >
                <GripVertical className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (activeSlideIndex < slides.length - 1) {
                    setActiveSlideIndex(activeSlideIndex + 1);
                    setSelectedObjectId(null);
                  }
                }}
                disabled={activeSlideIndex >= slides.length - 1}
                className="shrink-0 w-8 h-8 rounded-lg bg-surface-muted border border-border-light flex items-center justify-center text-text-muted disabled:opacity-30 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Slide Strip (when slides tab is open) */}
            {mobileTab === "slides" && (
              <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-xl p-1.5 shadow-sm">
                <SlideSorterPanel
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  onSelectSlide={(idx) => {
                    setActiveSlideIndex(idx);
                    setSelectedObjectId(null);
                    setMobileTab("canvas");
                  }}
                  onAddSlide={handleAddBlankSlide}
                  onDuplicateSlide={handleDuplicateSlide}
                  onDeleteSlide={handleDeleteSlide}
                  onReorderSlides={handleReorderSlides}
                  preset={preset}
                  isMobileHorizontal={true}
                />
              </div>
            )}

            {/* Mobile Canvas — primary workspace */}
            <div className="w-full rounded-xl border border-border-light dark:border-border-medium bg-[#131911]/40 dark:bg-black/50 overflow-hidden shadow-premium-sm relative" style={{ height: "min(52vh, 420px)", minHeight: 280 }}>
              {activeSlide && (
                <SlideCanvasStage
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  zoom={zoom}
                  zoomMode="fit"
                  onAutoFitZoomCalculated={(fitScale) => setZoom(fitScale)}
                  selectedObjectId={selectedObjectId}
                  onSelectObject={setSelectedObjectId}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  onLayerReorder={handleLayerReorder}
                  showMarginGuides={showMarginGuides}
                />
              )}
            </div>

            {/* Mobile Quick Action Bar */}
            <div className="flex items-center gap-1.5 px-1">
              {/* "Add ▾" dropdown — element shortcuts that stay reachable on mobile */}
              <div className="relative flex-1 min-w-0">
                <button
                  onClick={() => setAddMenuOpen((v) => !v)}
                  className="w-full py-2 rounded-xl bg-surface-muted border border-border-light text-[10px] font-sans font-semibold text-text-main flex items-center justify-center gap-1 cursor-pointer"
                  aria-haspopup="menu"
                  aria-expanded={addMenuOpen}
                >
                  <Plus className="w-3 h-3 text-brand-primary" />
                  <span>Add</span>
                  <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${addMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {addMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAddMenuOpen(false)} aria-hidden="true" />
                    <div
                      role="menu"
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 z-50 rounded-xl border border-border-light dark:border-border-medium bg-surface-elevated shadow-premium-lg p-1"
                    >
                      <button
                        role="menuitem"
                        onClick={() => { setAddMenuOpen(false); handleAddText("heading"); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-sans font-semibold text-text-main hover:bg-surface-muted cursor-pointer"
                      >
                        <Heading className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Text heading</span>
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { setAddMenuOpen(false); mobileFileRef.current?.click(); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-sans font-semibold text-text-main hover:bg-surface-muted cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Image</span>
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { setAddMenuOpen(false); handleAddShape("rectangle"); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-sans font-semibold text-text-main hover:bg-surface-muted cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Shape</span>
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { setAddMenuOpen(false); handleAddArrow("right"); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-sans font-semibold text-text-main hover:bg-surface-muted cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Arrow</span>
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { setAddMenuOpen(false); handleAddBlankSlide(); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-sans font-semibold text-text-main hover:bg-surface-muted cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Slide</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Hidden mobile file input (multiselect) driven by the Add menu */}
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                tabIndex={-1}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) Array.from(files).forEach((f) => handleAddImageToSlide(f));
                  e.target.value = "";
                }}
              />
              {selectedObjectId ? (
                <>
                  <button
                    onClick={() => selectedObjectId && handleDuplicateObject(selectedObjectId)}
                    className="py-2 px-3 rounded-xl bg-surface-muted border border-border-light text-text-muted cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => selectedObjectId && handleDeleteObject(selectedObjectId)}
                    className="py-2 px-3 rounded-xl bg-surface-muted border border-border-light text-status-error cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : null}
              <button
                onClick={() => setMobileTab(mobileTab === "properties" ? "canvas" : "properties")}
                className={`py-2 px-3 rounded-xl border text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer ${
                  mobileTab === "properties" && selectedObject
                    ? "bg-brand-primary-light border-brand-primary text-brand-primary"
                    : "bg-surface-muted border-border-light text-text-muted"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span className="hidden min-[400px]:inline">Props</span>
              </button>
            </div>

            {/* Mobile Properties Bottom Panel */}
            {mobileTab === "properties" && activeSlide && (
              <div className="bg-surface-base dark:bg-surface-elevated border border-border-light dark:border-border-medium rounded-xl p-2.5 shadow-premium-sm max-h-[45vh] overflow-y-auto">
                <ContextualPropertiesPanel
                  selectedObject={selectedObject}
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={slides.length}
                  preset={preset}
                  onSetPreset={handleSetPreset}
                  onUpdateSlide={handleUpdateActiveSlide}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  showMarginGuides={showMarginGuides}
                  onToggleMarginGuides={() => setShowMarginGuides(!showMarginGuides)}
                  onCopy={onCopy}
                />
              </div>
            )}

            {/* Mobile Sticky Export Bar */}
            <div className="sticky bottom-0 flex items-center gap-2 bg-surface-base dark:bg-surface-elevated border-t border-border-light px-2 py-2 -mx-0.5 rounded-b-xl">
              <button
                onClick={handleDownloadAllZip}
                disabled={isExportingZip || isExportingPdf}
                className="flex-1 py-2 rounded-xl bg-surface-muted hover:bg-surface-hover text-text-main border border-border-light text-[11px] font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isExportingZip ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                ) : (
                  <FileArchive className="w-3.5 h-3.5 text-brand-primary" />
                )}
                <span>ZIP</span>
              </button>
              <button
                onClick={handleDownloadAsPdf}
                disabled={isExportingZip || isExportingPdf}
                className="flex-[1.5] py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-[11px] font-sans font-bold shadow-premium-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. LITTLE WIN TRUE MODAL POPUP (Triggered after export)             */}
      {/* =================================================================== */}
      <PostTaskSuccess
        isOpen={taskDone}
        onClose={() => setTaskDone(false)}
        toolName="LinkedIn Carousel"
        taskType="carousel-ready"
        resultDescription={`${lastExportCount} slides · Ready to publish`}
        previewThumbnailList={slides.map((s) => {
          const imgObj = s.objects.find((o) => o.type === "image");
          return (imgObj as any)?.imgSrc || "";
        }).filter(Boolean)}
        primaryAction={{
          label: "Download Again",
          onClick: lastExportType === "pdf" ? handleDownloadAsPdf : handleDownloadAllZip,
          icon: <Download className="w-3.5 h-3.5" />
        }}
        shareTitle="TODAY I DESIGNED THIS. ✨"
        shareSubtitle={`LinkedIn Carousel · ${slides.length} slides · Ready to publish`}
        onAddToast={onAddToast}
      />

      {/* =================================================================== */}
      {/* 4. TEMPLATE PICKER MODAL (workspace restyle mode)                   */}
      {/* =================================================================== */}
      <TemplatePickerModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onApply={handleTemplatePickerApply}
        onUseBlank={handleTemplatePickerBlank}
        aspect={preset}
        showCount={false}
        applyLabel="Apply to Current Slide"
        blankLabel="Reset Background"
        title="Restyle this slide's background"
      />
    </div>
  );
};
