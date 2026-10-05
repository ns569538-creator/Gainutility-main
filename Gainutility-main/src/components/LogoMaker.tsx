/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ViewState } from "../types";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  FolderArchive,
  Type,
  Shapes,
  Palette,
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  CreditCard,
  Grid,
  RotateCcw,
  RotateCw,
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy as CopyIcon,
  Shield,
  CircleDot,
  Square,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Minus,
  Divide,
  Circle,
  Triangle,
  ChevronDown,
  ChevronUp,
  Pill,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileCode,
  CheckCircle2,
  Move,
  Lock,
  Unlock,
  Star,
  Crosshair,
} from "lucide-react";
import { StickyMobileAction } from "./Common";
import { ContinueEditing } from "./ContinueEditing";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import {
  LogoLayout,
  LogoShape,
  LogoPalette,
  MonogramStyle,
  VectorPrimitive,
  FontCategory,
  LOGO_SYMBOLS,
  LOGO_CATEGORIES,
  LOGO_FONTS,
  LOGO_PALETTES,
  getContrastRatio,
  assessSmallSizeVisibility,
  searchIcons,
} from "./logo/logoPresets";
import {
  LogoConfig,
  buildLogoSvg,
  exportLogoSvgString,
  rasterizeSvgToBlob,
  triggerFileDownload,
  buildCompleteBrandKitZip,
  validateSvgString,
  getSafeFilename,
} from "./logo/logoExport";
import { ensureDocumentFont, getCleanFontFamily } from "./logo/fontManager";

interface LogoMakerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

// Exactly 6 primary editor tabs matching architectural specs:
// Layout, Typography, Icon, Colors, Spacing, Elements
type TabType = "layout" | "typography" | "icon" | "colors" | "spacing" | "elements";
type PreviewContext = "canvas" | "header" | "card" | "favicon";
type CanvasBgMode = "transparent" | "light" | "dark" | "custom";

// Subtle neutral checkerboard pattern (Zero orange, low contrast, professional design surface)
const CHECKERBOARD_LIGHT = `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23F1F5F9' d='M0 0h8v8H0V0zm8 8h8v8H8V8z'/%3E%3C/svg%3E")`;
const CHECKERBOARD_DARK = `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%231E293B' d='M0 0h8v8H0V0zm8 8h8v8H8V8z'/%3E%3C/svg%3E")`;

// Full state snapshot for deterministic undo/redo
interface LogoStateSnapshot {
  brandName: string;
  tagline: string;
  showTagline: boolean;
  monogramText: string;
  monogramStyle: MonogramStyle;
  layout: LogoLayout;
  shape: LogoShape;
  selectedSymbolId: string;
  customIconColor: string | null;
  palette: LogoPalette;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase";
  textAlign: "left" | "center" | "right";
  iconScale: number;
  iconSize: number;
  iconTextGap: number;
  brandTaglineGap: number;
  overallScale: number;
  symbolOffsetX: number;
  symbolOffsetY: number;
  logoOffsetX: number;
  logoOffsetY: number;
  iconAlignment: "start" | "center" | "end";
  iconContainerShape: "none" | "circle" | "rounded" | "square" | "capsule";
  iconContainerPadding: number;
  iconContainerColor: string;
  iconContainerBorderColor: string;
  iconContainerBorderWidth: number;
  iconContainerRadius: number;
  textOffsetX: number;
  textOffsetY: number;
  containerBorderWidth: number;
  containerBorderColor: string;
  containerRadius: number;
  containerFill: string;
  primitives: VectorPrimitive[];
}

export const LogoMaker: React.FC<LogoMakerProps> = ({
  onCopy,
  onAddToast,
  onChangeView,
}) => {
  const postDownload = usePostDownload();

  // ── 1. CANONICAL BRAND STATE ──────────────────────────────────────
  const [brandName, setBrandName] = useState<string>("Vanguard");
  const [tagline, setTagline] = useState<string>("Next-Gen Cloud Tools");
  const [showTagline, setShowTagline] = useState<boolean>(true);
  const [monogramText, setMonogramText] = useState<string>("VG");
  const [monogramStyle, setMonogramStyle] = useState<MonogramStyle>("hexagon");

  // Layout & Container Shape
  const [layout, setLayout] = useState<LogoLayout>("icon-left");
  const [shape, setShape] = useState<LogoShape>("transparent");

  // Logo Lockup Dragging & Centered Artboard Coordinates
  const [logoOffsetX, setLogoOffsetX] = useState<number>(0);
  const [logoOffsetY, setLogoOffsetY] = useState<number>(0);
  const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);
  const [isLogoSelected, setIsLogoSelected] = useState<boolean>(false);
  const [snapGuides, setSnapGuides] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });
  const dragStartRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    logoStartOffsetX: number;
    logoStartOffsetY: number;
  }>({ pointerStartX: 0, pointerStartY: 0, logoStartOffsetX: 0, logoStartOffsetY: 0 });

  // Symbol & Icon Sizing
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>("terminal-code");
  const [symbolCategory, setSymbolCategory] = useState<string>("All");
  const [symbolSearch, setSymbolSearch] = useState<string>("");
  const [iconScale, setIconScale] = useState<number>(1);
  const [iconSize, setIconSize] = useState<number>(56);
  const [iconTextGap, setIconTextGap] = useState<number>(16);
  const [brandTaglineGap, setBrandTaglineGap] = useState<number>(14);

  // Symbol Position & Alignment (Structured System)
  const [iconAlignment, setIconAlignment] = useState<"start" | "center" | "end">("center");
  const [symbolOffsetX, setSymbolOffsetX] = useState<number>(0);
  const [symbolOffsetY, setSymbolOffsetY] = useState<number>(0);
  const [showFinePositioning, setShowFinePositioning] = useState<boolean>(false);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState<boolean>(false);

  // Dedicated Icon Container System
  const [iconContainerShape, setIconContainerShape] = useState<"none" | "circle" | "rounded" | "square" | "capsule">("none");
  const [iconContainerPadding, setIconContainerPadding] = useState<number>(14);
  const [iconContainerColor, setIconContainerColor] = useState<string>("transparent");
  const [iconContainerBorderColor, setIconContainerBorderColor] = useState<string>("#CBD5E1");
  const [iconContainerBorderWidth, setIconContainerBorderWidth] = useState<number>(1.5);
  const [iconContainerRadius, setIconContainerRadius] = useState<number>(16);

  // Favorite & Recent Icons persistence
  const [favoriteSymbolIds, setFavoriteSymbolIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("gu_logo_favorite_icons");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [recentSymbolIds, setRecentSymbolIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("gu_logo_recent_icons");
      return raw ? JSON.parse(raw) : ["terminal-code", "cpu-chip", "cloud-network", "ai-brain-mesh"];
    } catch {
      return [];
    }
  });

  // Text Position Offsets
  const [textOffsetX, setTextOffsetX] = useState<number>(0);
  const [textOffsetY, setTextOffsetY] = useState<number>(0);

  // Typography Details
  const [fontFamily, setFontFamily] = useState<string>(LOGO_FONTS[4].fontFamily); // Outfit Clean
  const [fontCategory, setFontCategory] = useState<string>("All");
  const [fontSearch, setFontSearch] = useState<string>("");
  const [fontWeight, setFontWeight] = useState<number>(700);
  const [fontSize, setFontSize] = useState<number>(46);
  const [letterSpacing, setLetterSpacing] = useState<number>(-0.02);
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase">("none");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [overallScale, setOverallScale] = useState<number>(1.0);

  // Palette & Independent Colors
  const [palette, setPalette] = useState<LogoPalette>(LOGO_PALETTES[1]); // Trust & Technology
  const [customIconColor, setCustomIconColor] = useState<string | null>(null);
  const effectiveIconColor = customIconColor || palette.iconColor;

  // Container styling (visible and customizable)
  const [containerBorderWidth, setContainerBorderWidth] = useState<number>(1);
  const [containerBorderColor, setContainerBorderColor] = useState<string>("#CBD5E1");
  const [containerRadius, setContainerRadius] = useState<number>(16);
  const [containerFill, setContainerFill] = useState<string>("#FFFFFF");

  // Vector Primitives & Custom Layers
  const [primitives, setPrimitives] = useState<VectorPrimitive[]>([]);
  const [selectedPrimitiveId, setSelectedPrimitiveId] = useState<string | null>(null);
  const [hoveredPrimitiveId, setHoveredPrimitiveId] = useState<string | null>(null);

  // Full Undo/Redo history
  const [history, setHistory] = useState<LogoStateSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoAction = useRef<boolean>(false);

  // Canvas View Controls
  const [canvasBgMode, setCanvasBgMode] = useState<CanvasBgMode>("transparent");
  const [customCanvasBg, setCustomCanvasBg] = useState<string>("#F8FAFC");
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [previewContext, setPreviewContext] = useState<PreviewContext>("canvas");

  // Active Preset Archetype (Minimal, Modern, Luxury, Tech, Playful, Editorial)
  const [activeArchetype, setActiveArchetype] = useState<string>("Modern");

  // Editor Tab: exactly 6 primary categories
  const [activeTab, setActiveTab] = useState<TabType>("layout");

  // Export State
  const [transparentExport, setTransparentExport] = useState<boolean>(true);
  const [exportMultiplier, setExportMultiplier] = useState<number>(2);
  const [packagingProgress, setPackagingProgress] = useState<string>("");
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [exportingType, setExportingType] = useState<"svg" | "png" | "zip" | "copy" | null>(null);
  const [showMobileMore, setShowMobileMore] = useState<boolean>(false);
  const [showVariations, setShowVariations] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const exportSectionRef = useRef<HTMLDivElement>(null);
  const [isExportVisible, setIsExportVisible] = useState(false);

  // Dynamically load Google Fonts into document head
  useEffect(() => {
    const fontLinkId = "gu-logo-maker-fonts";
    if (typeof document !== "undefined" && !document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Syne:wght@700;800&family=Roboto+Mono:wght@500;600;700&family=Montserrat:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@600;700;800&family=DM+Sans:wght@500;600;700&family=Poppins:wght@600;700;800&family=Libre+Baskerville:wght@700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Bebas+Neue&family=Archivo+Black&family=Anton&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Abril+Fatface&family=Marcellus&family=Prata&family=Nunito:wght@600;700;800&family=Quicksand:wght@600;700&family=Varela+Round&family=Comfortaa:wght@600;700&family=Rubik:wght@700;800;900&family=Chakra+Petch:wght@600;700&family=Exo+2:wght@700;800&family=JetBrains+Mono:wght@500;600;700&family=Fira+Code:wght@500;600;700&family=Source+Code+Pro:wght@600;700&family=Inter+Tight:wght@500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Preload selected font into document.fonts
  useEffect(() => {
    ensureDocumentFont(fontFamily, fontWeight).catch(() => {});
  }, [fontFamily, fontWeight]);

  // Intersection observer for sticky mobile action
  useEffect(() => {
    const el = exportSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsExportVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Selected Symbol Object
  const selectedSymbol = useMemo(() => {
    return (
      LOGO_SYMBOLS.find((s) => s.id === selectedSymbolId) || LOGO_SYMBOLS[0]
    );
  }, [selectedSymbolId]);

  // Symbol & Icon Interaction Handlers
  const toggleFavoriteSymbol = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteSymbolIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("gu_logo_favorite_icons", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Filtered Symbols with fuzzy search and keyword synonyms
  const filteredSymbols = useMemo(() => {
    return searchIcons(LOGO_SYMBOLS, symbolSearch, symbolCategory, favoriteSymbolIds, recentSymbolIds);
  }, [symbolCategory, symbolSearch, favoriteSymbolIds, recentSymbolIds]);

  // Filtered Fonts with Search & Category
  const filteredFonts = useMemo(() => {
    const query = fontSearch.trim().toLowerCase();
    return LOGO_FONTS.filter((f) => {
      const matchCat =
        fontCategory === "All" ||
        f.category === fontCategory ||
        (f.categories && f.categories.includes(fontCategory as FontCategory));
      const matchQuery =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.fontFamily.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [fontCategory, fontSearch]);

  // Current Canonical Logo Configuration Model
  const currentConfig: LogoConfig = useMemo(() => {
    return {
      brandName: brandName.trim() || "Brand",
      tagline: tagline.trim(),
      layout,
      shape: transparentExport && shape === "transparent" ? "transparent" : shape,
      symbol: selectedSymbol,
      palette: {
        ...palette,
        iconColor: effectiveIconColor,
      },
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      textTransform,
      textAlign,
      iconScale,
      iconSize,
      overallScale,
      iconTextGap,
      brandTaglineGap,
      symbolOffsetX,
      symbolOffsetY,
      logoOffsetX,
      logoOffsetY,
      iconAlignment,
      iconContainerShape,
      iconContainerPadding,
      iconContainerColor,
      iconContainerBorderColor,
      iconContainerBorderWidth,
      iconContainerRadius,
      textOffsetX,
      textOffsetY,
      monogramText: monogramText.trim() || brandName.slice(0, 2),
      monogramStyle,
      showTagline,
      primitives,
      borderWidth: containerBorderWidth,
      borderColor: containerBorderColor,
      padding: containerRadius,
    };
  }, [
    brandName,
    tagline,
    layout,
    shape,
    transparentExport,
    selectedSymbol,
    palette,
    effectiveIconColor,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    textTransform,
    textAlign,
    iconScale,
    iconSize,
    overallScale,
    iconTextGap,
    brandTaglineGap,
    symbolOffsetX,
    symbolOffsetY,
    logoOffsetX,
    logoOffsetY,
    iconAlignment,
    iconContainerShape,
    iconContainerPadding,
    iconContainerColor,
    iconContainerBorderColor,
    iconContainerBorderWidth,
    iconContainerRadius,
    textOffsetX,
    textOffsetY,
    monogramText,
    monogramStyle,
    showTagline,
    primitives,
    containerBorderWidth,
    containerBorderColor,
    containerRadius,
  ]);

  // Master SVG vector string
  const svgString = useMemo(() => {
    return buildLogoSvg(currentConfig);
  }, [currentConfig]);

  // Effective export configuration accounting for transparent/non-transparent background
  const effectiveExportConfig: LogoConfig = useMemo(() => {
    return {
      ...currentConfig,
      shape: transparentExport && shape === "transparent" ? "transparent" : shape,
      backgroundColor: transparentExport
        ? null
        : shape !== "transparent"
        ? null
        : canvasBgMode === "dark"
        ? "#090D16"
        : canvasBgMode === "light"
        ? "#FFFFFF"
        : canvasBgMode === "custom"
        ? customCanvasBg
        : "#FFFFFF",
    };
  }, [currentConfig, transparentExport, shape, canvasBgMode, customCanvasBg]);

  // Snapshot generation
  const createSnapshot = useCallback((): LogoStateSnapshot => {
    return {
      brandName,
      tagline,
      showTagline,
      monogramText,
      monogramStyle,
      layout,
      shape,
      selectedSymbolId,
      customIconColor,
      palette: { ...palette },
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      textTransform,
      textAlign,
      iconScale,
      iconSize,
      iconTextGap,
      brandTaglineGap,
      overallScale,
      symbolOffsetX,
      symbolOffsetY,
      logoOffsetX,
      logoOffsetY,
      iconAlignment,
      iconContainerShape,
      iconContainerPadding,
      iconContainerColor,
      iconContainerBorderColor,
      iconContainerBorderWidth,
      iconContainerRadius,
      textOffsetX,
      textOffsetY,
      containerBorderWidth,
      containerBorderColor,
      containerRadius,
      containerFill,
      primitives: [...primitives],
    };
  }, [
    brandName,
    tagline,
    showTagline,
    monogramText,
    monogramStyle,
    layout,
    shape,
    selectedSymbolId,
    customIconColor,
    palette,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    textTransform,
    textAlign,
    iconScale,
    iconSize,
    iconTextGap,
    brandTaglineGap,
    overallScale,
    symbolOffsetX,
    symbolOffsetY,
    logoOffsetX,
    logoOffsetY,
    iconAlignment,
    iconContainerShape,
    iconContainerPadding,
    iconContainerColor,
    iconContainerBorderColor,
    iconContainerBorderWidth,
    iconContainerRadius,
    textOffsetX,
    textOffsetY,
    containerBorderWidth,
    containerBorderColor,
    containerRadius,
    containerFill,
    primitives,
  ]);

  // Save snapshot to history (debounced for continuous inputs)
  const saveSnapshotTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pushSnapshotToHistory = useCallback(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    if (saveSnapshotTimerRef.current) {
      clearTimeout(saveSnapshotTimerRef.current);
    }
    saveSnapshotTimerRef.current = setTimeout(() => {
      const snapshot = createSnapshot();
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(snapshot);
        if (next.length > 30) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    }, 250);
  }, [createSnapshot, historyIndex]);

  // Symbol & Icon Interaction Handlers
  const selectSymbolWithRecent = useCallback((id: string) => {
    setSelectedSymbolId(id);
    setRecentSymbolIds((prev) => {
      const filtered = prev.filter((x) => x !== id);
      const next = [id, ...filtered].slice(0, 12);
      try {
        localStorage.setItem("gu_logo_recent_icons", JSON.stringify(next));
      } catch {}
      return next;
    });
    pushSnapshotToHistory();
  }, [pushSnapshotToHistory]);

  const handleNudge = useCallback((dx: number, dy: number) => {
    setSymbolOffsetX((prev) => Math.max(-100, Math.min(100, prev + dx)));
    setSymbolOffsetY((prev) => Math.max(-100, Math.min(100, prev + dy)));
    setShowAlignmentGuides(true);
    pushSnapshotToHistory();
    setTimeout(() => setShowAlignmentGuides(false), 1400);
  }, [pushSnapshotToHistory]);

  const handleResetIcon = useCallback(() => {
    setSelectedSymbolId("terminal-code");
    setIconSize(56);
    setIconTextGap(16);
    setIconScale(1);
    setSymbolOffsetX(0);
    setSymbolOffsetY(0);
    setIconAlignment("center");
    setIconContainerShape("none");
    setIconContainerPadding(14);
    setIconContainerColor("transparent");
    setIconContainerBorderColor("#CBD5E1");
    setIconContainerBorderWidth(1.5);
    setIconContainerRadius(16);
    setCustomIconColor(null);
    pushSnapshotToHistory();
    onAddToast("Icon restored to default settings", "info");
  }, [pushSnapshotToHistory, onAddToast]);

  const handleResetLayout = useCallback(() => {
    setLayout("icon-left");
    setIconTextGap(16);
    setIconAlignment("center");
    setLogoOffsetX(0);
    setLogoOffsetY(0);
    setSymbolOffsetX(0);
    setSymbolOffsetY(0);
    setTextOffsetX(0);
    setTextOffsetY(0);
    pushSnapshotToHistory();
    onAddToast("Layout arrangement reset", "info");
  }, [pushSnapshotToHistory, onAddToast]);

  const handleResetPosition = useCallback(() => {
    setLogoOffsetX(0);
    setLogoOffsetY(0);
    setSymbolOffsetX(0);
    setSymbolOffsetY(0);
    setTextOffsetX(0);
    setTextOffsetY(0);
    setShowAlignmentGuides(true);
    pushSnapshotToHistory();
    setTimeout(() => setShowAlignmentGuides(false), 1200);
    onAddToast("Logo position centered", "info");
  }, [pushSnapshotToHistory, onAddToast]);

  // Initialize history on mount
  useEffect(() => {
    if (history.length === 0) {
      const initial = createSnapshot();
      setHistory([initial]);
      setHistoryIndex(0);
    }
  }, [createSnapshot, history.length]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const snap = history[prevIndex];
      isUndoRedoAction.current = true;
      setBrandName(snap.brandName);
      setTagline(snap.tagline);
      setShowTagline(snap.showTagline);
      setMonogramText(snap.monogramText);
      setMonogramStyle(snap.monogramStyle);
      setLayout(snap.layout);
      setShape(snap.shape);
      setSelectedSymbolId(snap.selectedSymbolId);
      setCustomIconColor(snap.customIconColor);
      setPalette(snap.palette);
      setFontFamily(snap.fontFamily);
      setFontWeight(snap.fontWeight);
      setFontSize(snap.fontSize);
      setLetterSpacing(snap.letterSpacing);
      setTextTransform(snap.textTransform);
      setTextAlign(snap.textAlign);
      setIconScale(snap.iconScale);
      setIconSize(snap.iconSize);
      setIconTextGap(snap.iconTextGap);
      setBrandTaglineGap(snap.brandTaglineGap);
      setOverallScale(snap.overallScale);
      setSymbolOffsetX(snap.symbolOffsetX);
      setSymbolOffsetY(snap.symbolOffsetY);
      setLogoOffsetX(snap.logoOffsetX ?? 0);
      setLogoOffsetY(snap.logoOffsetY ?? 0);
      if (snap.iconAlignment) setIconAlignment(snap.iconAlignment);
      if (snap.iconContainerShape) setIconContainerShape(snap.iconContainerShape);
      if (snap.iconContainerPadding !== undefined) setIconContainerPadding(snap.iconContainerPadding);
      if (snap.iconContainerColor) setIconContainerColor(snap.iconContainerColor);
      if (snap.iconContainerBorderColor) setIconContainerBorderColor(snap.iconContainerBorderColor);
      if (snap.iconContainerBorderWidth !== undefined) setIconContainerBorderWidth(snap.iconContainerBorderWidth);
      if (snap.iconContainerRadius !== undefined) setIconContainerRadius(snap.iconContainerRadius);
      setTextOffsetX(snap.textOffsetX);
      setTextOffsetY(snap.textOffsetY);
      setContainerBorderWidth(snap.containerBorderWidth);
      setContainerBorderColor(snap.containerBorderColor);
      setContainerRadius(snap.containerRadius);
      setContainerFill(snap.containerFill);
      setPrimitives(snap.primitives);
      setHistoryIndex(prevIndex);
      onAddToast("Undo", "info");
    }
  }, [history, historyIndex, onAddToast]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const snap = history[nextIndex];
      isUndoRedoAction.current = true;
      setBrandName(snap.brandName);
      setTagline(snap.tagline);
      setShowTagline(snap.showTagline);
      setMonogramText(snap.monogramText);
      setMonogramStyle(snap.monogramStyle);
      setLayout(snap.layout);
      setShape(snap.shape);
      setSelectedSymbolId(snap.selectedSymbolId);
      setCustomIconColor(snap.customIconColor);
      setPalette(snap.palette);
      setFontFamily(snap.fontFamily);
      setFontWeight(snap.fontWeight);
      setFontSize(snap.fontSize);
      setLetterSpacing(snap.letterSpacing);
      setTextTransform(snap.textTransform);
      setTextAlign(snap.textAlign);
      setIconScale(snap.iconScale);
      setIconSize(snap.iconSize);
      setIconTextGap(snap.iconTextGap);
      setBrandTaglineGap(snap.brandTaglineGap);
      setOverallScale(snap.overallScale);
      setSymbolOffsetX(snap.symbolOffsetX);
      setSymbolOffsetY(snap.symbolOffsetY);
      setLogoOffsetX(snap.logoOffsetX ?? 0);
      setLogoOffsetY(snap.logoOffsetY ?? 0);
      if (snap.iconAlignment) setIconAlignment(snap.iconAlignment);
      if (snap.iconContainerShape) setIconContainerShape(snap.iconContainerShape);
      if (snap.iconContainerPadding !== undefined) setIconContainerPadding(snap.iconContainerPadding);
      if (snap.iconContainerColor) setIconContainerColor(snap.iconContainerColor);
      if (snap.iconContainerBorderColor) setIconContainerBorderColor(snap.iconContainerBorderColor);
      if (snap.iconContainerBorderWidth !== undefined) setIconContainerBorderWidth(snap.iconContainerBorderWidth);
      if (snap.iconContainerRadius !== undefined) setIconContainerRadius(snap.iconContainerRadius);
      setTextOffsetX(snap.textOffsetX);
      setTextOffsetY(snap.textOffsetY);
      setContainerBorderWidth(snap.containerBorderWidth);
      setContainerBorderColor(snap.containerBorderColor);
      setContainerRadius(snap.containerRadius);
      setContainerFill(snap.containerFill);
      setPrimitives(snap.primitives);
      setHistoryIndex(nextIndex);
      onAddToast("Redo", "info");
    }
  }, [history, historyIndex, onAddToast]);

  // Live Contrast & Readability Metrics
  const contrastRatio = useMemo(() => {
    const effectiveBg =
      shape === "transparent"
        ? canvasBgMode === "dark"
          ? "#090D16"
          : canvasBgMode === "light"
          ? "#FFFFFF"
          : customCanvasBg
        : palette.bgColor;
    return getContrastRatio(palette.textColor, effectiveBg);
  }, [shape, canvasBgMode, customCanvasBg, palette]);

  const readabilityAssessment = useMemo(() => {
    return assessSmallSizeVisibility(layout, brandName.length, contrastRatio);
  }, [layout, brandName, contrastRatio]);

  const isSquareArtboard = useMemo(() => {
    return (
      layout === "monogram" ||
      layout === "icon-only" ||
      shape === "circle" ||
      shape === "square" ||
      shape === "pill" ||
      shape === "badge"
    );
  }, [layout, shape]);

  // Pointer-based real canvas dragging
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement)?.closest("button, input, select, label, a")) return;

    e.preventDefault();
    setIsDraggingLogo(true);
    setIsLogoSelected(true);
    dragStartRef.current = {
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      logoStartOffsetX: logoOffsetX,
      logoStartOffsetY: logoOffsetY,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, [logoOffsetX, logoOffsetY]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingLogo) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const rect = canvasEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const artboardWidth = isSquareArtboard ? 800 : 1200;
    const artboardHeight = 800;

    const scale = (artboardWidth / rect.width) / zoomLevel;
    const deltaX = (e.clientX - dragStartRef.current.pointerStartX) * scale;
    const deltaY = (e.clientY - dragStartRef.current.pointerStartY) * scale;

    let nextX = Math.round(dragStartRef.current.logoStartOffsetX + deltaX);
    let nextY = Math.round(dragStartRef.current.logoStartOffsetY + deltaY);

    const maxX = artboardWidth * 0.45;
    const maxY = artboardHeight * 0.45;
    nextX = Math.max(-maxX, Math.min(maxX, nextX));
    nextY = Math.max(-maxY, Math.min(maxY, nextY));

    // Snap to center:
    const snapDistance = 16;
    let snappedX = false;
    let snappedY = false;

    if (Math.abs(nextX) < snapDistance) {
      nextX = 0;
      snappedX = true;
    }
    if (Math.abs(nextY) < snapDistance) {
      nextY = 0;
      snappedY = true;
    }

    setSnapGuides({ x: snappedX, y: snappedY });
    setLogoOffsetX(nextX);
    setLogoOffsetY(nextY);
  }, [isDraggingLogo, isSquareArtboard, zoomLevel]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      setSnapGuides({ x: false, y: false });
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      if (
        logoOffsetX !== dragStartRef.current.logoStartOffsetX ||
        logoOffsetY !== dragStartRef.current.logoStartOffsetY
      ) {
        pushSnapshotToHistory();
      }
    }
  }, [isDraggingLogo, logoOffsetX, logoOffsetY, pushSnapshotToHistory]);

  // ── 6 CURATED ARCHETYPES ──────────────────────────────────────────
  const ARCHETYPES = [
    {
      id: "Minimal",
      label: "Minimal",
      apply: () => {
        setLayout("wordmark-only");
        setFontFamily(LOGO_FONTS[8].fontFamily); // Inter
        setFontWeight(600);
        setLetterSpacing(-0.01);
        setShape("transparent");
        setPalette(LOGO_PALETTES[5]); // Minimal & Editorial
        setIconScale(0.9);
      },
    },
    {
      id: "Modern",
      label: "Modern",
      apply: () => {
        setLayout("icon-left");
        setFontFamily(LOGO_FONTS[4].fontFamily); // Outfit Clean
        setSelectedSymbolId("terminal-code");
        setFontWeight(700);
        setLetterSpacing(-0.02);
        setShape("transparent");
        setPalette(LOGO_PALETTES[1]); // Trust & Technology
        setIconSize(56);
        setIconTextGap(24);
      },
    },
    {
      id: "Luxury",
      label: "Luxury",
      apply: () => {
        setLayout("monogram");
        setFontFamily(LOGO_FONTS[1].fontFamily); // Cinzel
        setSelectedSymbolId("crown-crest");
        setFontWeight(700);
        setLetterSpacing(0.12);
        setShape("badge");
        setPalette(LOGO_PALETTES[3]); // Premium & Luxury
        setMonogramStyle("shield");
      },
    },
    {
      id: "Tech",
      label: "Tech",
      apply: () => {
        setLayout("icon-left");
        setFontFamily(LOGO_FONTS[2].fontFamily); // Space Grotesk
        setSelectedSymbolId("cpu-chip");
        setFontWeight(700);
        setLetterSpacing(-0.03);
        setShape("transparent");
        setPalette(LOGO_PALETTES[6]); // Cyber & AI
        setIconSize(58);
        setIconTextGap(24);
      },
    },
    {
      id: "Playful",
      label: "Playful",
      apply: () => {
        setLayout("icon-top");
        setFontFamily(LOGO_FONTS[11].fontFamily); // Poppins
        setSelectedSymbolId("spark-burst");
        setFontWeight(700);
        setLetterSpacing(0.00);
        setShape("rounded");
        setPalette(LOGO_PALETTES[0]); // Bold & Energetic
        setIconSize(64);
        setIconTextGap(20);
      },
    },
    {
      id: "Editorial",
      label: "Editorial",
      apply: () => {
        setLayout("icon-top");
        setFontFamily(LOGO_FONTS[3].fontFamily); // Playfair Display
        setSelectedSymbolId("leaf-eco");
        setFontWeight(700);
        setLetterSpacing(0.04);
        setShape("transparent");
        setPalette(LOGO_PALETTES[2]); // Earth & Botanical
        setIconSize(52);
        setIconTextGap(20);
      },
    },
  ];

  const handleSelectArchetype = (archetype: (typeof ARCHETYPES)[0]) => {
    setActiveArchetype(archetype.id);
    archetype.apply();
    pushSnapshotToHistory();
    onAddToast(`✓ ${archetype.label} style applied`, "info");
  };

  // Quick Spacing Presets
  const handleApplySpacingPreset = (mode: "compact" | "balanced" | "airy") => {
    if (mode === "compact") {
      setLetterSpacing(-0.03);
      setIconScale(0.9);
      setIconTextGap(16);
      setBrandTaglineGap(10);
      onAddToast("Compact spacing applied", "info");
    } else if (mode === "balanced") {
      setLetterSpacing(0.00);
      setIconScale(1.0);
      setIconTextGap(24);
      setBrandTaglineGap(14);
      onAddToast("Balanced spacing applied", "info");
    } else {
      setLetterSpacing(0.08);
      setIconScale(1.1);
      setIconTextGap(36);
      setBrandTaglineGap(18);
      onAddToast("Airy spacing applied", "info");
    }
    pushSnapshotToHistory();
  };

  // Reset to default
  const handleResetToDefault = () => {
    setBrandName("Vanguard");
    setTagline("Next-Gen Cloud Tools");
    setShowTagline(true);
    setMonogramText("VG");
    setPrimitives([]);
    setCustomIconColor(null);
    setZoomLevel(1);
    setOverallScale(1.0);
    setTextTransform("none");
    setTextAlign("center");
    const modern = ARCHETYPES.find((a) => a.id === "Modern");
    if (modern) handleSelectArchetype(modern);
    pushSnapshotToHistory();
    onAddToast("Reset to clean defaults", "info");
  };

  // Add Manual Vector Element
  const handleAddPrimitive = useCallback(
    (type: VectorPrimitive["type"]) => {
      const newId = `prim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const defaults: Record<VectorPrimitive["type"], Partial<VectorPrimitive>> = {
        line: { x: 0, y: 0.15, width: 0.35, height: 0.008, name: "Rule Line", fill: false, strokeWidth: 0.004, visible: true },
        divider: { x: 0, y: 0.15, width: 0.35, height: 0.008, name: "Divider", fill: false, strokeWidth: 0.004, visible: true },
        rect: { x: 0, y: 0, width: 0.2, height: 0.2, name: "Rectangle", fill: true, strokeWidth: 0.004, radius: 0.08, visible: true },
        "rounded-rect": { x: 0, y: 0, width: 0.2, height: 0.2, name: "Rounded Rect", fill: true, strokeWidth: 0.004, radius: 0.2, visible: true },
        circle: { x: 0, y: 0, width: 0.15, height: 0.15, name: "Circle", fill: true, strokeWidth: 0.004, visible: true },
        ring: { x: 0, y: 0, width: 0.15, height: 0.15, name: "Ring", fill: false, strokeWidth: 0.015, visible: true },
        triangle: { x: 0, y: 0, width: 0.15, height: 0.15, name: "Triangle", fill: true, strokeWidth: 0.004, visible: true },
        arc: { x: 0, y: 0, width: 0.2, height: 0.2, name: "Arc", fill: false, strokeWidth: 0.004, visible: true },
        dot: { x: 0, y: 0, width: 0.05, height: 0.05, name: "Dot", fill: true, strokeWidth: 0.004, visible: true },
        grid: { x: 0, y: 0, width: 0.25, height: 0.25, name: "Dot Grid", fill: true, strokeWidth: 0.004, visible: true },
        bracket: { x: 0, y: 0, width: 0.2, height: 0.2, name: "Bracket", fill: false, strokeWidth: 0.004, visible: true },
        wave: { x: 0, y: 0, width: 0.3, height: 0.1, name: "Wave", fill: false, strokeWidth: 0.004, visible: true },
      };

      const def = defaults[type] || { x: 0, y: 0, width: 0.15, height: 0.15, name: type, fill: true, strokeWidth: 0.004 };
      const newPrim: VectorPrimitive = {
        id: newId,
        type,
        name: def.name!,
        x: def.x!,
        y: def.y!,
        width: def.width!,
        height: def.height!,
        rotation: 0,
        color: palette.accentColor,
        fillColor: def.fill ? palette.accentColor : undefined,
        borderColor: def.fill ? undefined : palette.accentColor,
        opacity: 1,
        strokeWidth: def.strokeWidth!,
        fill: def.fill!,
        radius: def.radius,
      };
      setPrimitives((prev) => [...prev, newPrim]);
      setSelectedPrimitiveId(newId);
      pushSnapshotToHistory();
      onAddToast(`Added ${newPrim.name}`, "info");
    },
    [palette.accentColor, pushSnapshotToHistory, onAddToast]
  );

  const handleUpdatePrimitive = useCallback(
    (id: string, updates: Partial<VectorPrimitive>) => {
      setPrimitives((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      pushSnapshotToHistory();
    },
    [pushSnapshotToHistory]
  );

  const handleDeletePrimitive = useCallback(
    (id: string) => {
      setPrimitives((prev) => prev.filter((p) => p.id !== id));
      if (selectedPrimitiveId === id) setSelectedPrimitiveId(null);
      pushSnapshotToHistory();
      onAddToast("Element removed", "info");
    },
    [selectedPrimitiveId, pushSnapshotToHistory, onAddToast]
  );

  const handleDuplicatePrimitive = useCallback(
    (id: string) => {
      const source = primitives.find((p) => p.id === id);
      if (!source) return;
      const newId = `prim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const copy: VectorPrimitive = {
        ...source,
        id: newId,
        name: `${source.name} Copy`,
        x: source.x + 0.04,
        y: source.y + 0.04,
      };
      setPrimitives((prev) => [...prev, copy]);
      setSelectedPrimitiveId(newId);
      pushSnapshotToHistory();
      onAddToast("Element duplicated", "info");
    },
    [primitives, pushSnapshotToHistory, onAddToast]
  );

  const handleMovePrimitiveLayer = useCallback(
    (id: string, direction: "up" | "down") => {
      setPrimitives((prev) => {
        const index = prev.findIndex((p) => p.id === id);
        if (index === -1) return prev;
        const newArr = [...prev];
        if (direction === "up" && index < newArr.length - 1) {
          const temp = newArr[index];
          newArr[index] = newArr[index + 1];
          newArr[index + 1] = temp;
        } else if (direction === "down" && index > 0) {
          const temp = newArr[index];
          newArr[index] = newArr[index - 1];
          newArr[index - 1] = temp;
        }
        return newArr;
      });
      pushSnapshotToHistory();
    },
    [pushSnapshotToHistory]
  );

  // Keyboard navigation for selected element (Arrows move, Delete key removes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if (!selectedPrimitiveId && activeTab === "icon") {
        const step = e.shiftKey ? 5 : 1;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleNudge(-step, 0);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNudge(step, 0);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          handleNudge(0, -step);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          handleNudge(0, step);
        }
        return;
      }

      // If no primitive is selected and we are on canvas context (or logo is selected), allow nudging the logo lockup position
      if (!selectedPrimitiveId && (isLogoSelected || previewContext === "canvas")) {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setLogoOffsetX((x) => x - step);
          pushSnapshotToHistory();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setLogoOffsetX((x) => x + step);
          pushSnapshotToHistory();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setLogoOffsetY((y) => y - step);
          pushSnapshotToHistory();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setLogoOffsetY((y) => y + step);
          pushSnapshotToHistory();
        } else if (e.key === "Escape") {
          setIsLogoSelected(false);
          setSnapGuides({ x: false, y: false });
        }
        return;
      }

      if (!selectedPrimitiveId) return;

      const step = e.shiftKey ? 0.05 : 0.01;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPrimitives((prev) =>
          prev.map((p) => (p.id === selectedPrimitiveId ? { ...p, x: Number((p.x - step).toFixed(3)) } : p))
        );
        pushSnapshotToHistory();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPrimitives((prev) =>
          prev.map((p) => (p.id === selectedPrimitiveId ? { ...p, x: Number((p.x + step).toFixed(3)) } : p))
        );
        pushSnapshotToHistory();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPrimitives((prev) =>
          prev.map((p) => (p.id === selectedPrimitiveId ? { ...p, y: Number((p.y - step).toFixed(3)) } : p))
        );
        pushSnapshotToHistory();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setPrimitives((prev) =>
          prev.map((p) => (p.id === selectedPrimitiveId ? { ...p, y: Number((p.y + step).toFixed(3)) } : p))
        );
        pushSnapshotToHistory();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeletePrimitive(selectedPrimitiveId);
      } else if (e.key === "Escape") {
        setSelectedPrimitiveId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPrimitiveId, activeTab, isLogoSelected, previewContext, handleNudge, handleDeletePrimitive, pushSnapshotToHistory]);

  // Copy raw SVG markup to clipboard
  const handleCopySvg = async () => {
    if (exportingType) return;
    setExportingType("copy");
    try {
      const finalSvgString = await exportLogoSvgString(effectiveExportConfig);
      validateSvgString(finalSvgString);
      await navigator.clipboard.writeText(finalSvgString);
      setCopiedSvg(true);
      onAddToast("SVG code copied to clipboard", "success");
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (err) {
      console.error("[Copy SVG] Error:", err);
      onAddToast("Export failed. Please try again.", "error");
    } finally {
      setExportingType(null);
    }
  };

  // Download Standalone Vector SVG (Guarantees valid XML & embedded web fonts)
  const handleDownloadSvg = async () => {
    if (exportingType) return;
    if (!brandName.trim()) {
      onAddToast("Please provide a brand name", "error");
      return;
    }
    setExportingType("svg");
    try {
      const finalSvgString = await exportLogoSvgString(effectiveExportConfig);
      validateSvgString(finalSvgString);
      const blob = new Blob([finalSvgString], { type: "image/svg+xml;charset=utf-8" });
      const filename = getSafeFilename(brandName, "", "svg");
      triggerFileDownload(blob, filename);
      onAddToast("SVG downloaded", "success");
      postDownload.show("SVG Vector Logo", 1);
    } catch (err) {
      console.error("[Download SVG] Error:", err);
      onAddToast("Export failed. Please try again.", "error");
    } finally {
      setExportingType(null);
    }
  };

  // Download High-Res PNG with Embedded Fonts & Real Alpha Transparency
  const handleDownloadPng = async (multiplier = exportMultiplier) => {
    if (exportingType) return;
    if (!brandName.trim()) {
      onAddToast("Please provide a brand name", "error");
      return;
    }
    setExportingType("png");
    try {
      const isSquare =
        layout === "monogram" || layout === "icon-only" || shape === "circle" || shape === "badge" || shape === "square";
      const baseW = isSquare ? 800 : 1200;
      const baseH = 800;
      const targetW = baseW * multiplier;
      const targetH = baseH * multiplier;

      const finalSvgString = await exportLogoSvgString(effectiveExportConfig);
      validateSvgString(finalSvgString);
      const isTransparent = transparentExport && shape === "transparent";
      const blob = await rasterizeSvgToBlob(
        finalSvgString,
        targetW,
        targetH,
        isTransparent,
        effectiveExportConfig.fontFamily,
        effectiveExportConfig.fontWeight,
        effectiveExportConfig.backgroundColor
      );
      const filename = getSafeFilename(brandName, `${multiplier}x`, "png");
      triggerFileDownload(blob, filename);
      onAddToast("PNG downloaded", "success");
      postDownload.show(`PNG Logo (${multiplier}x)`, 1);
    } catch (err) {
      console.error("[Download PNG] Error:", err);
      onAddToast("Export failed. Please try again.", "error");
    } finally {
      setExportingType(null);
    }
  };

  // Complete ZIP Brand Kit
  const handleDownloadBrandKit = async () => {
    if (exportingType) return;
    setExportingType("zip");
    setPackagingProgress("Preparing Brand Package…");

    try {
      const zipBlob = await buildCompleteBrandKitZip(effectiveExportConfig, (progressMsg) => {
        setPackagingProgress(progressMsg);
      });
      const filename = getSafeFilename(brandName, "brand-package", "zip");
      triggerFileDownload(zipBlob, filename);
      onAddToast("Complete Brand Package ZIP downloaded", "success");
      postDownload.show("Complete Brand Package ZIP", 8);
    } catch (err) {
      console.error("[Brand Kit] Error:", err);
      onAddToast("Export failed. Please try again.", "error");
    } finally {
      setExportingType(null);
      setPackagingProgress("");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* ── 1. MAIN INTERACTIVE STUDIO WORKSPACE ──────────────────── */}
      <section
        id="logo-maker-studio"
        aria-label="Logo Maker Studio"
        className="w-full"
      >
        <h2 className="sr-only">Logo Maker Studio</h2>

        {/* 2-Column Desktop Grid: Left Canvas (Hero) | Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ════════════════════════════════════════════════════════════
              COLUMN 1 (LG: 7 COLS) — THE LOGO PREVIEW (THE HERO)
              ════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-3 lg:sticky lg:top-20 order-1 lg:order-1">
            
            <div className="rounded-2xl border border-border-subtle bg-surface-base shadow-sm overflow-hidden transition-all">
              
              {/* Preview Toolbar with Crystal Clear Controls & Tooltips */}
              <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between gap-2 bg-surface-muted/30 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                
                {/* Surface Context Selector */}
                <div className="flex items-center gap-1 bg-surface-base p-1 rounded-xl border border-border-subtle/80 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewContext("canvas")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewContext === "canvas"
                        ? "bg-brand-primary text-[#FAF8F1] shadow-xs font-semibold"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    aria-label="Canvas view"
                    title="Interactive canvas view"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Canvas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewContext("header")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewContext === "header"
                        ? "bg-brand-primary text-[#FAF8F1] shadow-xs font-semibold"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    aria-label="Website nav header mockup"
                    title="Web navigation header preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Web Header</span>
                    <span className="sm:hidden">Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewContext("card")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewContext === "card"
                        ? "bg-brand-primary text-[#FAF8F1] shadow-xs font-semibold"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    aria-label="Business card mockup"
                    title="Business card mockup"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewContext("favicon")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewContext === "favicon"
                        ? "bg-brand-primary text-[#FAF8F1] shadow-xs font-semibold"
                        : "text-text-muted hover:text-text-main"
                    }`}
                    aria-label="Small size icon view"
                    title="Favicon and app icon readability"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">App Icon</span>
                    <span className="sm:hidden">Icon</span>
                  </button>
                </div>

                {/* Canvas Background, Grid, Zoom & History */}
                <div className="flex items-center gap-1.5 shrink-0">
                  
                  {/* Canvas Background Mode Selector */}
                  <div className="flex items-center gap-0.5 bg-surface-base p-1 rounded-xl border border-border-subtle/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setCanvasBgMode("transparent")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium flex items-center gap-1 ${
                        canvasBgMode === "transparent"
                          ? "bg-brand-primary text-white shadow-xs font-semibold"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title="Transparent background (neutral grid)"
                      aria-label="Transparent background"
                    >
                      <CircleDot className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasBgMode("light")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        canvasBgMode === "light"
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title="Light canvas background (#FFFFFF)"
                      aria-label="Light background"
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasBgMode("dark")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        canvasBgMode === "dark"
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title="Dark canvas background (#090D16)"
                      aria-label="Dark background"
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </button>
                    <label
                      className={`relative p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                        canvasBgMode === "custom"
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title="Custom canvas background color"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <input
                        type="color"
                        value={customCanvasBg}
                        onChange={(e) => {
                          setCustomCanvasBg(e.target.value);
                          setCanvasBgMode("custom");
                        }}
                        className="sr-only"
                        aria-label="Custom canvas background color"
                      />
                    </label>
                  </div>

                  {/* Grid Toggle */}
                  <div className="flex items-center bg-surface-base p-1 rounded-xl border border-border-subtle/80">
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        showGrid
                          ? "bg-brand-primary text-white shadow-xs font-semibold"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title={showGrid ? "Hide alignment grid" : "Show alignment grid"}
                      aria-label="Toggle alignment grid"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                  </div>

                  {/* Center / Reset Position */}
                  <div className="flex items-center bg-surface-base p-1 rounded-xl border border-border-subtle/80 text-xs">
                    <button
                      type="button"
                      onClick={handleResetPosition}
                      className={`p-1.5 sm:px-2 sm:py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
                        logoOffsetX !== 0 || logoOffsetY !== 0
                          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/30 font-semibold"
                          : "text-text-muted hover:text-text-main"
                      }`}
                      title={logoOffsetX !== 0 || logoOffsetY !== 0 ? `Center Logo (Offset: ${logoOffsetX}px, ${logoOffsetY}px)` : "Center Logo (Already centered)"}
                      aria-label="Center Logo"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Center</span>
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-0.5 bg-surface-base p-1 rounded-xl border border-border-subtle/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-main cursor-pointer"
                      title="Zoom out"
                      aria-label="Zoom out"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-text-muted hover:text-text-main cursor-pointer"
                      title="Click to reset zoom to 100%"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-main cursor-pointer"
                      title="Zoom in"
                      aria-label="Zoom in"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex items-center gap-0.5 bg-surface-base p-1 rounded-xl border border-border-subtle/80">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-main"
                      title="Undo (reverses last change)"
                      aria-label="Undo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-main"
                      title="Redo"
                      aria-label="Redo"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── THE CANVAS HERO STAGE ── */}
              <div
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                className={`w-full relative flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-hidden select-none transition-all duration-150 touch-none ${
                  isSquareArtboard
                    ? "aspect-square max-h-[580px] mx-auto"
                    : "aspect-[3/2] min-h-[260px] sm:min-h-[360px] lg:min-h-[440px]"
                } ${isDraggingLogo ? "cursor-grabbing" : "cursor-grab"}`}
                style={{
                  backgroundColor:
                    canvasBgMode === "dark"
                      ? "#090D16"
                      : canvasBgMode === "light"
                      ? "#FFFFFF"
                      : canvasBgMode === "custom"
                      ? customCanvasBg
                      : "#F8FAFC",
                  backgroundImage:
                    canvasBgMode === "transparent"
                      ? CHECKERBOARD_LIGHT
                      : showGrid
                      ? canvasBgMode === "dark"
                        ? "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)"
                        : "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)"
                      : "none",
                  backgroundSize: canvasBgMode === "transparent" ? "16px 16px" : "20px 20px",
                }}
                onClick={() => setSelectedPrimitiveId(null)}
              >
                {/* Floating Centering Notice when Displaced */}
                {(logoOffsetX !== 0 || logoOffsetY !== 0) && previewContext === "canvas" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetPosition();
                    }}
                    className="absolute bottom-3 right-3 z-20 px-2.5 py-1.5 rounded-lg bg-surface-base/90 backdrop-blur-md border border-border-subtle shadow-md text-xs font-semibold text-brand-primary hover:bg-surface-base flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Click to reset logo to exact center"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Reset Center</span>
                    <span className="text-[10px] font-mono text-text-muted">
                      ({logoOffsetX > 0 ? `+${logoOffsetX}` : logoOffsetX}, {logoOffsetY > 0 ? `+${logoOffsetY}` : logoOffsetY})
                    </span>
                  </button>
                )}

                {/* Context 1: Pure Canvas Logo (The Hero) */}
                {previewContext === "canvas" && (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-100 relative [&_svg]:w-full [&_svg]:h-full [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:block"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                  >
                    {(() => {
                      const interactiveSvg = buildLogoSvg(currentConfig, undefined, undefined, {
                        showSelectionOverlay: true,
                        selectedPrimitiveId,
                        hoveredPrimitiveId,
                        showAlignmentGuides: showAlignmentGuides || isDraggingLogo,
                        isLogoSelected: isLogoSelected || isDraggingLogo,
                        showSnapGuides: snapGuides,
                        isDragging: isDraggingLogo,
                      });
                      return (
                        <div
                          className="w-full h-full flex items-center justify-center pointer-events-none"
                          dangerouslySetInnerHTML={{ __html: interactiveSvg }}
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Context 2: Website Header Mockup */}
                {previewContext === "header" && (
                  <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-surface-base shadow-md overflow-hidden animate-in fade-in duration-200">
                    <div className="px-3 py-1.5 border-b border-border-subtle bg-surface-muted/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-[10px] text-text-muted font-mono ml-2 truncate">
                        https://{brandName.toLowerCase().replace(/[^a-z0-9]/g, "") || "brand"}.com
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between border-b border-border-subtle/50">
                      <div
                        className="h-9 w-auto max-w-[180px] flex items-center overflow-hidden [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                        dangerouslySetInnerHTML={{ __html: svgString }}
                      />
                      <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-text-muted">
                        <span>Platform</span>
                        <span>Docs</span>
                        <span className="px-3 py-1 rounded-md bg-brand-primary text-white font-semibold text-[11px]">
                          Get Started
                        </span>
                      </div>
                    </div>
                    <div className="p-6 bg-surface-muted/10 text-center space-y-2">
                      <div className="h-3 w-36 bg-border-subtle rounded mx-auto" />
                      <div className="h-2.5 w-48 bg-border-subtle/60 rounded mx-auto" />
                    </div>
                  </div>
                )}

                {/* Context 3: Business Card Mockup */}
                {previewContext === "card" && (
                  <div className="w-full max-w-[360px] aspect-[1.75/1] rounded-2xl bg-surface-base border border-border-subtle shadow-lg p-6 flex flex-col justify-between relative overflow-hidden animate-in fade-in duration-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-xl -mr-8 -mt-8" />
                    <div
                      className="h-10 w-auto max-w-[200px] overflow-hidden flex items-center [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: svgString }}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-text-main">Alex Morgan</div>
                      <div className="text-[10px] text-text-muted font-medium">Founder &amp; CEO</div>
                      <div className="text-[9px] text-text-muted font-mono pt-0.5">
                        alex@{brandName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"}.com
                      </div>
                    </div>
                  </div>
                )}

                {/* Context 4: App Icon & Favicon Scale */}
                {previewContext === "favicon" && (
                  <div className="space-y-4 text-center animate-in fade-in duration-200">
                    <div className="text-xs font-semibold text-text-muted">
                      App Icon &amp; Tab Readability
                    </div>
                    <div className="flex items-center justify-center gap-6 flex-wrap">
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border-subtle bg-surface-base">
                        <div className="w-5 h-5 overflow-hidden flex items-center justify-center border border-border-subtle rounded-xs">
                          <div
                            className="w-5 h-5 scale-[0.3] origin-top-left"
                            dangerouslySetInnerHTML={{
                              __html: buildLogoSvg(
                                {
                                  ...currentConfig,
                                  layout: layout === "monogram" ? "monogram" : "icon-only",
                                },
                                64,
                                64
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-muted">16×16</span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border-subtle bg-surface-base">
                        <div className="w-8 h-8 overflow-hidden flex items-center justify-center border border-border-subtle rounded-md">
                          <div
                            className="w-8 h-8 scale-[0.5] origin-top-left"
                            dangerouslySetInnerHTML={{
                              __html: buildLogoSvg(
                                {
                                  ...currentConfig,
                                  layout: layout === "monogram" ? "monogram" : "icon-only",
                                },
                                64,
                                64
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-muted">32×32</span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border-subtle bg-surface-base">
                        <div className="w-12 h-12 overflow-hidden flex items-center justify-center border border-border-subtle rounded-lg">
                          <div
                            className="w-12 h-12 scale-[0.75] origin-top-left"
                            dangerouslySetInnerHTML={{
                              __html: buildLogoSvg(
                                {
                                  ...currentConfig,
                                  layout: layout === "monogram" ? "monogram" : "icon-only",
                                },
                                64,
                                64
                              ),
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-muted">48×48</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Canvas Status Bar with Alignment & Position indicator */}
            <div className="px-3 py-1.5 rounded-xl bg-surface-muted/30 border border-border-subtle/60 flex items-center justify-between text-[11px] text-text-muted flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono">
                  Artboard: {isSquareArtboard ? "800×800 (1:1)" : "1200×800 (3:2)"}
                </span>
                <span className="font-sans font-medium text-text-muted hidden sm:inline">
                  Font: {getCleanFontFamily(fontFamily)} ({fontWeight})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono flex items-center gap-1">
                  Position:{" "}
                  {logoOffsetX === 0 && logoOffsetY === 0 ? (
                    <span className="text-emerald-500 font-semibold">Centered (0, 0)</span>
                  ) : (
                    <span className="text-amber-500 font-semibold">
                      {logoOffsetX > 0 ? `+${logoOffsetX}` : logoOffsetX}px, {logoOffsetY > 0 ? `+${logoOffsetY}` : logoOffsetY}px
                    </span>
                  )}
                </span>
                <span className="font-mono hidden sm:inline">Contrast: {contrastRatio.toFixed(1)}:1</span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              COLUMN 2 (LG: 5 COLS) — THE CONTROL STUDIO
              ════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 order-2 lg:order-2 lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-5.5rem)] flex flex-col rounded-2xl border border-border-subtle bg-surface-base shadow-sm overflow-hidden">
            
            {/* ── FIXED CONTROLS HEADER: BRAND, STYLES, TABS ── */}
            <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface-base shrink-0 space-y-3">
              
              {/* 2.1 Brand Identity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="brand-name-input"
                    className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono block"
                  >
                    Brand Identity
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showTagline}
                      onChange={(e) => {
                        setShowTagline(e.target.checked);
                        pushSnapshotToHistory();
                      }}
                      className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                    />
                    <span>Tagline</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    id="brand-name-input"
                    type="text"
                    value={brandName}
                    onChange={(e) => {
                      setBrandName(e.target.value);
                      pushSnapshotToHistory();
                    }}
                    placeholder="e.g. Vanguard"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-subtle bg-surface-base text-text-main font-semibold placeholder-text-muted outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all font-sans min-h-[40px]"
                  />

                  {showTagline ? (
                    <input
                      id="tagline-input"
                      type="text"
                      value={tagline}
                      onChange={(e) => {
                        setTagline(e.target.value);
                        pushSnapshotToHistory();
                      }}
                      placeholder="e.g. Next-Gen Cloud Tools"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle bg-surface-base text-text-main placeholder-text-muted outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all font-sans min-h-[40px]"
                    />
                  ) : (
                    <div className="hidden sm:flex items-center px-3 text-[11px] text-text-muted border border-dashed border-border-subtle/70 rounded-xl bg-surface-muted/20">
                      Check "Tagline" to add descriptor
                    </div>
                  )}
                </div>
              </div>

              {/* 2.2 Curated Archetypes (Minimal, Modern, Luxury, Tech, Playful, Editorial) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-primary" /> Curated Style
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">1-click preset</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => handleSelectArchetype(arch)}
                      className={`py-1.5 px-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer text-center truncate ${
                        activeArchetype === arch.id
                          ? "border-brand-primary bg-brand-primary text-white font-bold shadow-xs"
                          : "border-border-subtle bg-surface-base hover:bg-surface-muted/60 text-text-main"
                      }`}
                      title={`${arch.label} style`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2.3 Segmented Tab Bar */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-muted/60 border border-border-subtle text-xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { id: "layout", label: "Layout", icon: Layers },
                  { id: "typography", label: "Type", icon: Type },
                  { id: "icon", label: "Icon", icon: Shapes },
                  { id: "colors", label: "Color", icon: Palette },
                  { id: "spacing", label: "Spacing", icon: Sliders },
                  { id: "elements", label: "Elements", icon: SlidersHorizontal },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 min-h-[34px] whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-text-muted hover:text-text-main hover:bg-surface-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── INDEPENDENTLY SCROLLABLE CONTROLS BODY ── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 [scrollbar-width:thin]">

                {/* ════════════════════════════════════════════════════════
                    TAB 1: LAYOUT & CONTAINER SHAPE
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "layout" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <h3 className="sr-only">Layout</h3>

                    {/* Arrangement */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                          Arrangement
                        </span>
                        <button
                          type="button"
                          onClick={handleResetLayout}
                          className="text-[10px] text-text-muted hover:text-brand-primary underline transition-colors cursor-pointer"
                        >
                          Reset Layout
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "icon-left", label: "Icon Left", sub: "Horizontal" },
                          { id: "icon-top", label: "Icon Top", sub: "Stacked" },
                          { id: "icon-right", label: "Icon Right", sub: "Reversed" },
                          { id: "icon-bottom", label: "Icon Bottom", sub: "Inverted" },
                          { id: "monogram", label: "Monogram", sub: "Lettermark" },
                          { id: "wordmark-only", label: "Wordmark", sub: "Text Only" },
                          { id: "icon-only", label: "Icon Only", sub: "Mark" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setLayout(item.id as LogoLayout);
                              pushSnapshotToHistory();
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center min-h-[50px] ${
                              layout === item.id
                                ? "border-brand-primary bg-brand-primary/5 text-brand-primary font-bold shadow-xs"
                                : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main hover:bg-surface-muted/40"
                            }`}
                          >
                            <span className="text-xs font-semibold block">{item.label}</span>
                            <span className="text-[10px] text-text-muted font-mono block">{item.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Container Shape */}
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                        Container Shape
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          { id: "transparent", label: "None", icon: <Square className="w-3.5 h-3.5 opacity-30" /> },
                          { id: "rounded", label: "Rounded", icon: <Square className="w-3.5 h-3.5 rounded-md" /> },
                          { id: "square", label: "Square", icon: <Square className="w-3.5 h-3.5" /> },
                          { id: "circle", label: "Circle", icon: <Circle className="w-3.5 h-3.5" /> },
                          { id: "pill", label: "Pill", icon: <Pill className="w-3.5 h-3.5" /> },
                          { id: "badge", label: "Shield", icon: <Shield className="w-3.5 h-3.5" /> },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setShape(s.id as LogoShape);
                              pushSnapshotToHistory();
                            }}
                            className={`p-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[46px] ${
                              shape === s.id
                                ? "border-brand-primary bg-brand-primary/5 text-brand-primary font-bold shadow-xs"
                                : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main hover:bg-surface-muted/30"
                            }`}
                          >
                            <span className="text-brand-primary">{s.icon}</span>
                            <span className="text-[11px]">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Container Shape Customization (Section 28) */}
                    {shape !== "transparent" && (
                      <div className="p-3.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-brand-primary block">
                          Container Properties
                        </span>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-border-width-px">Border Width: {containerBorderWidth}px</label>
                            <input
                              type="range"
                              min={0}
                              max={8}
                              step={1}
                              value={containerBorderWidth}
                              onChange={(e) => {
                                setContainerBorderWidth(parseInt(e.target.value));
                                pushSnapshotToHistory();
                              }}
                              className="w-full accent-brand-primary cursor-pointer"
                            id="logo-maker-border-width-px"/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-corner-radius-px">Corner Radius: {containerRadius}px</label>
                            <input
                              type="range"
                              min={0}
                              max={48}
                              step={2}
                              value={containerRadius}
                              onChange={(e) => {
                                setContainerRadius(parseInt(e.target.value));
                                pushSnapshotToHistory();
                              }}
                              className="w-full accent-brand-primary cursor-pointer"
                            id="logo-maker-corner-radius-px"/>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Monogram Options */}
                    {layout === "monogram" && (
                      <div className="p-3.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="monogram-initials"
                            className="text-[11px] font-bold uppercase tracking-wider font-mono text-brand-primary"
                          >
                            Initials (1–3 Letters)
                          </label>
                          <input
                            id="monogram-initials"
                            type="text"
                            maxLength={3}
                            value={monogramText}
                            onChange={(e) => {
                              setMonogramText(e.target.value.toUpperCase());
                              pushSnapshotToHistory();
                            }}
                            className="w-16 px-2 py-1 text-center font-bold text-sm uppercase rounded-lg border border-border-subtle bg-surface-base"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "hexagon", label: "Hexagon" },
                            { id: "shield", label: "Shield" },
                            { id: "circle", label: "Ring" },
                            { id: "diamond", label: "Diamond" },
                            { id: "stacked", label: "Stacked" },
                            { id: "minimal", label: "Box" },
                          ].map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => {
                                setMonogramStyle(style.id as MonogramStyle);
                                pushSnapshotToHistory();
                              }}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                                monogramStyle === style.id
                                  ? "border-brand-primary bg-brand-primary text-white font-bold"
                                  : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main"
                              }`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    TAB 2: TYPOGRAPHY SYSTEM (Search + Live Cards)
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "typography" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <h3 className="sr-only">Typography</h3>

                    {/* Font Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        placeholder="Search fonts: Inter, Poppins, Space Grotesk, Playfair..."
                        className="w-full pl-8 pr-3.5 py-1.5 text-xs rounded-xl border border-border-subtle bg-surface-base text-text-main outline-none focus:border-brand-primary min-h-[36px]"
                      />
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
                      {["All", "Sans", "Serif", "Display", "Geometric", "Editorial", "Monospace", "Rounded", "Technical", "Elegant", "Bold", "Minimal"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFontCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs ${
                            fontCategory === cat
                              ? "bg-brand-primary text-white font-semibold"
                              : "bg-surface-muted text-text-muted hover:text-text-main"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Live Font Cards (Showing Actual Font with Zero Flash) */}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {filteredFonts.map((font) => (
                        <button
                          key={font.name}
                          type="button"
                          onClick={() => {
                            setFontFamily(font.fontFamily);
                            if (font.letterSpacingDef !== undefined) {
                              setLetterSpacing(font.letterSpacingDef);
                            }
                            pushSnapshotToHistory();
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[46px] ${
                            fontFamily === font.fontFamily
                              ? "border-brand-primary bg-brand-primary/5 text-brand-primary font-bold shadow-xs"
                              : "border-border-subtle bg-surface-base text-text-main hover:bg-surface-muted/40"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span
                              style={{ fontFamily: font.fontFamily }}
                              className="text-base block truncate"
                            >
                              {brandName.trim() || font.name}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono block">
                              {font.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted font-mono shrink-0 px-2 py-0.5 rounded bg-surface-muted/60">
                            {font.category}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Font Controls: Weight, Transform, Alignment */}
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      {/* Weight Selector */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-text-main">
                          <span className="uppercase tracking-wider font-mono text-[11px] text-text-muted">Weight</span>
                          <span className="font-mono text-text-muted text-[11px]">{fontWeight}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[400, 600, 700, 800].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => {
                                setFontWeight(w);
                                pushSnapshotToHistory();
                              }}
                              className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                fontWeight === w
                                  ? "border-brand-primary bg-brand-primary text-white"
                                  : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main"
                              }`}
                            >
                              {w === 400 ? "Regular" : w === 600 ? "SemiBold" : w === 700 ? "Bold" : "Black"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Transform & Text Align */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted block">Case</span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: "none", label: "Aa" },
                              { id: "uppercase", label: "AA" },
                              { id: "lowercase", label: "aa" },
                            ].map((tf) => (
                              <button
                                key={tf.id}
                                type="button"
                                onClick={() => {
                                  setTextTransform(tf.id as any);
                                  pushSnapshotToHistory();
                                }}
                                className={`py-1 rounded border text-center font-mono text-xs ${
                                  textTransform === tf.id
                                    ? "border-brand-primary bg-brand-primary text-white font-bold"
                                    : "border-border-subtle bg-surface-base text-text-muted"
                                }`}
                              >
                                {tf.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted block">Alignment</span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: "left", icon: <AlignLeft className="w-3.5 h-3.5" /> },
                              { id: "center", icon: <AlignCenter className="w-3.5 h-3.5" /> },
                              { id: "right", icon: <AlignRight className="w-3.5 h-3.5" /> },
                            ].map((al) => (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => {
                                  setTextAlign(al.id as any);
                                  pushSnapshotToHistory();
                                }}
                                className={`py-1 rounded border flex items-center justify-center text-xs ${
                                  textAlign === al.id
                                    ? "border-brand-primary bg-brand-primary text-white"
                                    : "border-border-subtle bg-surface-base text-text-muted"
                                }`}
                              >
                                {al.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Font Size & Letter Spacing with Numeric Value Inputs */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted font-mono">
                            <span>Font Size</span>
                            <span>{fontSize}px</span>
                          </div>
                          <input aria-label="Font size"
                            type="range"
                            min={24}
                            max={84}
                            step={1}
                            value={fontSize}
                            onChange={(e) => {
                              setFontSize(parseInt(e.target.value));
                              pushSnapshotToHistory();
                            }}
                            className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted font-mono">
                            <span>Letter Spacing</span>
                            <span>{letterSpacing.toFixed(2)}em</span>
                          </div>
                          <input aria-label="Letter spacing"
                            type="range"
                            min={-0.05}
                            max={0.25}
                            step={0.01}
                            value={letterSpacing}
                            onChange={(e) => {
                              setLetterSpacing(parseFloat(e.target.value));
                              pushSnapshotToHistory();
                            }}
                            className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    TAB 3: ICON / SYMBOL SYSTEM (Structured Professional Architecture)
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "icon" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider font-mono">
                          Icon System
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetIcon}
                        className="px-2.5 py-1 text-[11px] font-medium text-text-muted hover:text-brand-primary hover:bg-surface-muted/50 rounded-lg transition-colors border border-border-subtle/70 cursor-pointer flex items-center gap-1.5"
                        title="Reset icon to default size, position, gap, and styling"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Icon</span>
                      </button>
                    </div>

                    {/* Section 1: Structured Positioning & Optical Alignment */}
                    <div className="space-y-2.5 p-3 rounded-xl border border-border-subtle bg-surface-base">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-main uppercase tracking-wider font-mono">
                          Icon Position
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          Structured Alignment
                        </span>
                      </div>
                      
                      {/* Primary Position: Left, Top, Right, Bottom */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "icon-left", label: "Left" },
                          { id: "icon-top", label: "Top" },
                          { id: "icon-right", label: "Right" },
                          { id: "icon-bottom", label: "Bottom" },
                        ].map((pos) => {
                          const isSelected = layout === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => {
                                setLayout(pos.id as LogoLayout);
                                pushSnapshotToHistory();
                              }}
                              className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer min-h-[38px] ${
                                isSelected
                                  ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                                  : "border-border-subtle bg-surface-muted/40 text-text-muted hover:text-text-main hover:bg-surface-muted"
                              }`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Secondary Optical Alignment: Start, Center, End */}
                      <div className="pt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                          <span>Alignment with Text Group</span>
                          <span className="capitalize">{iconAlignment}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            {
                              id: "start",
                              label: layout === "icon-top" || layout === "icon-bottom" ? "Left" : "Top",
                              sub: "Start",
                            },
                            {
                              id: "center",
                              label: "Center",
                              sub: "Balanced",
                            },
                            {
                              id: "end",
                              label: layout === "icon-top" || layout === "icon-bottom" ? "Right" : "Bottom",
                              sub: "End",
                            },
                          ].map((align) => {
                            const isSelected = iconAlignment === align.id;
                            return (
                              <button
                                key={align.id}
                                type="button"
                                onClick={() => {
                                  setIconAlignment(align.id as "start" | "center" | "end");
                                  pushSnapshotToHistory();
                                }}
                                className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer min-h-[36px] ${
                                  isSelected
                                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs ring-1 ring-brand-primary"
                                    : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main hover:bg-surface-muted/30 text-xs"
                                }`}
                              >
                                <span className="block text-xs font-medium">{align.label}</span>
                                <span className="block text-[9px] text-text-muted font-mono opacity-80">{align.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Icon ↔ Text Gap with Presets */}
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-base space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-main uppercase tracking-wider font-mono">
                          Icon / Text Gap
                        </span>
                        <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                          {iconTextGap}px
                        </span>
                      </div>

                      {/* Gap Quick Presets */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Tight", value: 8 },
                          { label: "Balanced", value: 16 },
                          { label: "Spacious", value: 28 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setIconTextGap(preset.value);
                              pushSnapshotToHistory();
                            }}
                            className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-all cursor-pointer min-h-[34px] ${
                              iconTextGap === preset.value
                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs"
                                : "border-border-subtle bg-surface-muted/30 text-text-muted hover:text-text-main"
                            }`}
                          >
                            <span>{preset.label}</span>
                            <span className="text-[10px] text-text-muted font-mono ml-1">({preset.value}px)</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1 pt-1">
                        <input
                          type="range"
                          min={0}
                          max={96}
                          step={2}
                          value={iconTextGap}
                          onChange={(e) => {
                            setIconTextGap(parseInt(e.target.value));
                            pushSnapshotToHistory();
                          }}
                          className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                          aria-label="Icon to text gap in pixels"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-text-muted">
                          <span>0px (Close)</span>
                          <span>48px</span>
                          <span>96px (Wide)</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Icon Size Control with Presets */}
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-base space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-main uppercase tracking-wider font-mono">
                          Icon Size
                        </span>
                        <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                          {iconSize}px
                        </span>
                      </div>

                      {/* Size Quick Presets */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {[32, 48, 64, 80, 96].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setIconSize(s);
                              pushSnapshotToHistory();
                            }}
                            className={`py-1 px-1 text-xs rounded-lg border font-mono transition-all cursor-pointer min-h-[32px] ${
                              iconSize === s
                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs"
                                : "border-border-subtle bg-surface-muted/30 text-text-muted hover:text-text-main"
                            }`}
                          >
                            {s}px
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1 pt-1">
                        <input
                          type="range"
                          min={24}
                          max={120}
                          step={2}
                          value={iconSize}
                          onChange={(e) => {
                            setIconSize(parseInt(e.target.value));
                            pushSnapshotToHistory();
                          }}
                          className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                          aria-label="Icon size in pixels"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-text-muted">
                          <span>24px (Subtle)</span>
                          <span>72px</span>
                          <span>120px (Hero)</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Dedicated Icon Color Control */}
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-base space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-text-main flex items-center gap-1.5 font-mono">
                            <span>◆</span>
                            <span>Icon Color</span>
                          </span>
                          <span className="text-[10px] text-text-muted block">
                            Independent from brand typography
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-text-muted bg-surface-muted/50 px-2 py-0.5 rounded border border-border-subtle">
                            {effectiveIconColor}
                          </span>
                          <label className="w-7 h-7 rounded-lg border border-border-subtle cursor-pointer overflow-hidden inline-block shadow-2xs relative">
                            <input
                              type="color"
                              value={effectiveIconColor}
                              onChange={(e) => {
                                setCustomIconColor(e.target.value);
                                pushSnapshotToHistory();
                              }}
                              className="w-full h-full opacity-0 cursor-pointer absolute inset-0"
                              aria-label="Pick icon color"
                            />
                            <div className="w-full h-full" style={{ backgroundColor: effectiveIconColor }} />
                          </label>
                          {customIconColor && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomIconColor(null);
                                pushSnapshotToHistory();
                              }}
                              className="text-[11px] text-brand-primary underline hover:text-brand-primary/80 cursor-pointer font-medium"
                            >
                              Sync Palette
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Icon Container / Badge System */}
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-base space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-main uppercase tracking-wider font-mono">
                          Icon Container
                        </span>
                        <span className="text-[10px] text-text-muted font-mono capitalize">
                          {iconContainerShape}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { id: "none", label: "None" },
                          { id: "circle", label: "Circle" },
                          { id: "rounded", label: "Rounded" },
                          { id: "square", label: "Square" },
                          { id: "capsule", label: "Capsule" },
                        ].map((c) => {
                          const isSelected = iconContainerShape === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setIconContainerShape(c.id as any);
                                if (c.id !== "none" && iconContainerColor === "transparent") {
                                  setIconContainerColor(palette.accentColor + "18");
                                }
                                pushSnapshotToHistory();
                              }}
                              className={`py-2 px-1 text-xs rounded-lg border text-center transition-all cursor-pointer min-h-[38px] ${
                                isSelected
                                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs ring-1 ring-brand-primary"
                                  : "border-border-subtle bg-surface-muted/30 text-text-muted hover:text-text-main"
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>

                      {iconContainerShape !== "none" && (
                        <div className="space-y-2.5 pt-2 border-t border-border-subtle/70 animate-in fade-in duration-150">
                          {/* Container Padding */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                              <span>Container Padding</span>
                              <span>{iconContainerPadding}px</span>
                            </div>
                            <input aria-label="Container padding"
                              type="range"
                              min={6}
                              max={40}
                              step={2}
                              value={iconContainerPadding}
                              onChange={(e) => {
                                setIconContainerPadding(parseInt(e.target.value));
                                pushSnapshotToHistory();
                              }}
                              className="w-full accent-brand-primary cursor-pointer min-h-[26px]"
                            />
                          </div>

                          {/* Container Color & Border Color */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="flex items-center justify-between p-2 rounded-lg border border-border-subtle bg-surface-muted/30">
                              <span className="text-[10px] font-mono text-text-muted">Fill</span>
                              <div className="flex items-center gap-1.5">
                                <label className="w-5 h-5 rounded border border-border-subtle cursor-pointer overflow-hidden inline-block relative">
                                  <input
                                    type="color"
                                    value={iconContainerColor === "transparent" ? "#F1F5F9" : iconContainerColor}
                                    onChange={(e) => {
                                      setIconContainerColor(e.target.value);
                                      pushSnapshotToHistory();
                                    }}
                                    className="w-full h-full opacity-0 cursor-pointer absolute inset-0"
                                  />
                                  <div
                                    className="w-full h-full"
                                    style={{
                                      backgroundColor:
                                        iconContainerColor === "transparent" ? "transparent" : iconContainerColor,
                                      border: iconContainerColor === "transparent" ? "1px dashed #94A3B8" : "none",
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIconContainerColor("transparent");
                                    pushSnapshotToHistory();
                                  }}
                                  className="text-[9px] text-text-muted hover:text-text-main font-mono"
                                  title="Transparent Fill"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg border border-border-subtle bg-surface-muted/30">
                              <span className="text-[10px] font-mono text-text-muted">Border</span>
                              <div className="flex items-center gap-1.5">
                                <label className="w-5 h-5 rounded border border-border-subtle cursor-pointer overflow-hidden inline-block relative">
                                  <input
                                    type="color"
                                    value={iconContainerBorderColor}
                                    onChange={(e) => {
                                      setIconContainerBorderColor(e.target.value);
                                      pushSnapshotToHistory();
                                    }}
                                    className="w-full h-full opacity-0 cursor-pointer absolute inset-0"
                                  />
                                  <div className="w-full h-full" style={{ backgroundColor: iconContainerBorderColor }} />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Border Width & Radius */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                                <span>Border Width</span>
                                <span>{iconContainerBorderWidth}px</span>
                              </div>
                              <input aria-label="Container border width"
                                type="range"
                                min={0}
                                max={8}
                                step={0.5}
                                value={iconContainerBorderWidth}
                                onChange={(e) => {
                                  setIconContainerBorderWidth(parseFloat(e.target.value));
                                  pushSnapshotToHistory();
                                }}
                                className="w-full accent-brand-primary cursor-pointer min-h-[24px]"
                              />
                            </div>

                            {iconContainerShape === "rounded" && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                                  <span>Corner Radius</span>
                                  <span>{iconContainerRadius}px</span>
                                </div>
                                <input aria-label="Container corner radius"
                                  type="range"
                                  min={4}
                                  max={40}
                                  step={2}
                                  value={iconContainerRadius}
                                  onChange={(e) => {
                                    setIconContainerRadius(parseInt(e.target.value));
                                    pushSnapshotToHistory();
                                  }}
                                  className="w-full accent-brand-primary cursor-pointer min-h-[24px]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 6: Optional Fine Positioning (Collapsible / Advanced) */}
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-base space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowFinePositioning(!showFinePositioning)}
                        className="w-full flex items-center justify-between text-left cursor-pointer"
                        aria-expanded={showFinePositioning}
                      >
                        <div>
                          <span className="text-[11px] font-bold text-text-main uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
                            <span>Fine Adjustment</span>
                          </span>
                          <span className="text-[10px] text-text-muted block">
                            Subtle pixel nudging (X: {symbolOffsetX}px, Y: {symbolOffsetY}px)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(symbolOffsetX !== 0 || symbolOffsetY !== 0) && (
                            <span className="w-2 h-2 rounded-full bg-brand-primary" />
                          )}
                          {showFinePositioning ? (
                            <ChevronUp className="w-4 h-4 text-text-muted" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-muted" />
                          )}
                        </div>
                      </button>

                      {showFinePositioning && (
                        <div className="pt-2.5 space-y-3 border-t border-border-subtle/70 animate-in fade-in duration-150">
                          {/* Nudge Directional Pad */}
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleNudge(0, -1)}
                                className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-muted/50 hover:bg-surface-muted flex items-center justify-center text-text-main cursor-pointer"
                                title="Nudge Up 1px (Shift: 5px)"
                                aria-label="Nudge Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleNudge(-1, 0)}
                                  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-muted/50 hover:bg-surface-muted flex items-center justify-center text-text-main cursor-pointer"
                                  title="Nudge Left 1px (Shift: 5px)"
                                  aria-label="Nudge Left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSymbolOffsetX(0);
                                    setSymbolOffsetY(0);
                                    pushSnapshotToHistory();
                                  }}
                                  className="px-2 h-8 rounded-lg border border-border-subtle bg-surface-base hover:bg-surface-muted text-[10px] font-mono text-text-muted hover:text-text-main cursor-pointer"
                                  title="Reset fine offset to 0,0"
                                >
                                  Center
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleNudge(1, 0)}
                                  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-muted/50 hover:bg-surface-muted flex items-center justify-center text-text-main cursor-pointer"
                                  title="Nudge Right 1px (Shift: 5px)"
                                  aria-label="Nudge Right"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleNudge(0, 1)}
                                className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-muted/50 hover:bg-surface-muted flex items-center justify-center text-text-main cursor-pointer"
                                title="Nudge Down 1px (Shift: 5px)"
                                aria-label="Nudge Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Direct Numeric Coordinate Readout & Guide toggle */}
                            <div className="space-y-2 text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <span className="text-text-muted w-4">X:</span>
                                <input aria-label="Symbol offset X"
                                  type="number"
                                  value={symbolOffsetX}
                                  onChange={(e) => {
                                    setSymbolOffsetX(parseInt(e.target.value) || 0);
                                    pushSnapshotToHistory();
                                  }}
                                  className="w-16 px-2 py-1 text-center rounded border border-border-subtle bg-surface-base text-text-main"
                                />
                                <span className="text-[10px] text-text-muted">px</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-text-muted w-4">Y:</span>
                                <input aria-label="Symbol offset Y"
                                  type="number"
                                  value={symbolOffsetY}
                                  onChange={(e) => {
                                    setSymbolOffsetY(parseInt(e.target.value) || 0);
                                    pushSnapshotToHistory();
                                  }}
                                  className="w-16 px-2 py-1 text-center rounded border border-border-subtle bg-surface-base text-text-main"
                                />
                                <span className="text-[10px] text-text-muted">px</span>
                              </div>
                              <label className="flex items-center gap-1.5 text-[10px] text-text-muted cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={showAlignmentGuides}
                                  onChange={(e) => setShowAlignmentGuides(e.target.checked)}
                                  className="accent-brand-primary"
                                />
                                <span>Show Alignment Guides</span>
                              </label>
                            </div>
                          </div>
                          <p className="text-[10px] text-text-muted text-center font-mono">
                            Keyboard: Arrow keys = 1px, Shift + Arrow = 5px
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Section 7: Curated Icon Library, Search & Categories */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                          Icon Library ({filteredSymbols.length} Symbols)
                        </span>
                        {(favoriteSymbolIds.length > 0 || recentSymbolIds.length > 0) && (
                          <span className="text-[10px] text-text-muted font-mono">
                            ⭐ {favoriteSymbolIds.length} Saved
                          </span>
                        )}
                      </div>

                      {/* Search Bar with clear */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          value={symbolSearch}
                          onChange={(e) => setSymbolSearch(e.target.value)}
                          placeholder="Search symbols: AI, growth, tech, shield, leaf, code..."
                          className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-border-subtle bg-surface-base text-text-main outline-none focus:border-brand-primary min-h-[38px]"
                        />
                        {symbolSearch && (
                          <button
                            type="button"
                            onClick={() => setSymbolSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs font-mono p-1 cursor-pointer"
                            aria-label="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Category Chips with Favorites & Recent */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
                        {/* All */}
                        <button
                          type="button"
                          onClick={() => setSymbolCategory("All")}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium min-h-[32px] ${
                            symbolCategory === "All"
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "bg-surface-muted/60 text-text-muted hover:text-text-main hover:bg-surface-muted"
                          }`}
                        >
                          All ({LOGO_SYMBOLS.length})
                        </button>

                        {/* Favorites */}
                        <button
                          type="button"
                          onClick={() => setSymbolCategory("Favorites")}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium min-h-[32px] flex items-center gap-1 ${
                            symbolCategory === "Favorites"
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "bg-surface-muted/60 text-text-muted hover:text-text-main hover:bg-surface-muted"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>Favorites ({favoriteSymbolIds.length})</span>
                        </button>

                        {/* Recent */}
                        <button
                          type="button"
                          onClick={() => setSymbolCategory("Recent")}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium min-h-[32px] flex items-center gap-1 ${
                            symbolCategory === "Recent"
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "bg-surface-muted/60 text-text-muted hover:text-text-main hover:bg-surface-muted"
                          }`}
                        >
                          <span>Recent ({recentSymbolIds.length})</span>
                        </button>

                        {/* Real 12 Curated Categories */}
                        {LOGO_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSymbolCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium min-h-[32px] ${
                              symbolCategory === cat
                                ? "bg-brand-primary text-white font-semibold shadow-xs"
                                : "bg-surface-muted/60 text-text-muted hover:text-text-main hover:bg-surface-muted"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Icon Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border border-border-subtle rounded-xl bg-surface-muted/10">
                        {filteredSymbols.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-text-muted space-y-1">
                            <p className="text-xs font-medium">No symbols match "{symbolSearch}"</p>
                            <p className="text-[10px] font-mono">Try searching tech, growth, leaf, shield, or minimalist shapes</p>
                          </div>
                        ) : (
                          filteredSymbols.map((s) => {
                            const isSelected = selectedSymbolId === s.id;
                            const isFav = favoriteSymbolIds.includes(s.id);
                            return (
                              <div
                                key={s.id}
                                className={`group relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[64px] min-w-[44px] ${
                                  isSelected
                                    ? "border-brand-primary bg-brand-primary/10 shadow-xs ring-2 ring-brand-primary/30"
                                    : "border-border-subtle bg-surface-base hover:bg-surface-muted/60 hover:border-text-muted/40"
                                }`}
                                onClick={() => selectSymbolWithRecent(s.id)}
                                title={`${s.name} • ${s.category}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    selectSymbolWithRecent(s.id);
                                  }
                                }}
                                aria-label={`${s.name}, Category: ${s.category}`}
                              >
                                <svg
                                  viewBox={s.viewBox || "0 0 24 24"}
                                  className="w-5 h-5 fill-current text-text-main transition-transform group-hover:scale-105"
                                >
                                  <path d={s.path} />
                                </svg>
                                <span className="text-[9px] font-mono text-text-muted truncate w-full text-center group-hover:text-text-main transition-colors">
                                  {s.name}
                                </span>

                                {/* Favorite Star Toggle Button */}
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavoriteSymbol(s.id, e)}
                                  className={`absolute top-1 right-1 p-1 rounded transition-opacity cursor-pointer ${
                                    isFav
                                      ? "text-amber-500 opacity-100"
                                      : "text-text-muted opacity-0 group-hover:opacity-80 hover:text-amber-500"
                                  }`}
                                  title={isFav ? "Remove from favorites" : "Save to favorites"}
                                  aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
                                >
                                  <Star className={`w-3 h-3 ${isFav ? "fill-amber-400 text-amber-500" : ""}`} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    TAB 4: COLORS SYSTEM (Semantic Visuals)
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "colors" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <h3 className="sr-only">Colors</h3>

                    {/* Curated Brand Palettes */}
                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                        Curated Palettes
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {LOGO_PALETTES.map((pal) => (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() => {
                              setPalette(pal);
                              setCustomIconColor(null);
                              pushSnapshotToHistory();
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[40px] ${
                              palette.id === pal.id
                                ? "border-brand-primary bg-brand-primary/5 shadow-xs ring-1 ring-brand-primary"
                                : "border-border-subtle bg-surface-base hover:bg-surface-muted/30"
                            }`}
                          >
                            <span className="text-xs font-medium text-text-main truncate">
                              {pal.name}
                            </span>
                            <div className="flex items-center -space-x-1 shrink-0 ml-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white"
                                style={{ backgroundColor: pal.iconColor }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white"
                                style={{ backgroundColor: pal.textColor }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white"
                                style={{ backgroundColor: pal.bgColor }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Semantic Color Controls with Clear Visual Indicators (Section 21) */}
                    <div className="space-y-2.5 pt-2 border-t border-border-subtle">
                      <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                        Semantic Color Controls
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        
                        {/* Brand / Text */}
                        <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-base flex items-center justify-between">
                          <span className="text-text-main font-semibold text-xs flex items-center gap-1 font-mono">
                            <span>●</span> Brand Text
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-text-muted">{palette.textColor}</span>
                            <input
                              type="color"
                              value={palette.textColor}
                              onChange={(e) => {
                                setPalette({ ...palette, textColor: e.target.value });
                                pushSnapshotToHistory();
                              }}
                              className="w-6 h-6 rounded border-0 cursor-pointer"
                              title="Pick brand text color"
                            />
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-base flex items-center justify-between">
                          <span className="text-text-main font-semibold text-xs flex items-center gap-1 font-mono">
                            <span>◆</span> Icon
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-text-muted">{effectiveIconColor}</span>
                            <input
                              type="color"
                              value={effectiveIconColor}
                              onChange={(e) => {
                                setCustomIconColor(e.target.value);
                                pushSnapshotToHistory();
                              }}
                              className="w-6 h-6 rounded border-0 cursor-pointer"
                              title="Pick icon color"
                            />
                          </div>
                        </div>

                        {/* Tagline */}
                        <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-base flex items-center justify-between">
                          <span className="text-text-main font-semibold text-xs flex items-center gap-1 font-mono">
                            <span>▲</span> Tagline
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-text-muted">{palette.taglineColor}</span>
                            <input
                              type="color"
                              value={palette.taglineColor}
                              onChange={(e) => {
                                setPalette({ ...palette, taglineColor: e.target.value });
                                pushSnapshotToHistory();
                              }}
                              className="w-6 h-6 rounded border-0 cursor-pointer"
                              title="Pick tagline color"
                            />
                          </div>
                        </div>

                        {/* Surface / Container Background */}
                        <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-base flex items-center justify-between">
                          <span className="text-text-main font-semibold text-xs flex items-center gap-1 font-mono">
                            <span>■</span> Surface
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-text-muted">{palette.bgColor}</span>
                            <input
                              type="color"
                              value={palette.bgColor}
                              onChange={(e) => {
                                setPalette({ ...palette, bgColor: e.target.value });
                                pushSnapshotToHistory();
                              }}
                              className="w-6 h-6 rounded border-0 cursor-pointer"
                              title="Pick container surface color"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    TAB 5: SPACING SYSTEM (Deterministic & Predictable)
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "spacing" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <h3 className="sr-only">Spacing</h3>

                    {/* Presets */}
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                        Spacing Presets
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "compact", label: "Compact" },
                          { id: "balanced", label: "Balanced" },
                          { id: "airy", label: "Airy" },
                        ].map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => handleApplySpacingPreset(sp.id as any)}
                            className="py-2 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted/60 text-text-main font-semibold text-xs text-center transition-all cursor-pointer min-h-[40px]"
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deterministic Numeric Sliders (Section 22) */}
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-text-muted font-mono">
                          <span>Icon ↔ Wordmark Gap</span>
                          <span>{iconTextGap}px</span>
                        </div>
                        <input aria-label="Icon to wordmark gap"
                          type="range"
                          min={0}
                          max={48}
                          step={2}
                          value={iconTextGap}
                          onChange={(e) => {
                            setIconTextGap(parseInt(e.target.value));
                            pushSnapshotToHistory();
                          }}
                          className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                        />
                      </div>

                      {showTagline && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted font-mono">
                            <span>Wordmark ↔ Tagline Gap</span>
                            <span>{brandTaglineGap}px</span>
                          </div>
                          <input aria-label="Wordmark to tagline gap"
                            type="range"
                            min={0}
                            max={40}
                            step={1}
                            value={brandTaglineGap}
                            onChange={(e) => {
                              setBrandTaglineGap(parseInt(e.target.value));
                              pushSnapshotToHistory();
                            }}
                            className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-text-muted font-mono">
                          <span>Overall Scale</span>
                          <span>{Math.round(overallScale * 100)}%</span>
                        </div>
                        <input aria-label="Overall scale"
                          type="range"
                          min={0.5}
                          max={2.0}
                          step={0.05}
                          value={overallScale}
                          onChange={(e) => {
                            setOverallScale(parseFloat(e.target.value));
                            pushSnapshotToHistory();
                          }}
                          className="w-full accent-brand-primary cursor-pointer min-h-[28px]"
                        />
                      </div>

                      {/* Artboard & Canvas Positioning */}
                      <div className="pt-2 border-t border-border-subtle/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                            Canvas Position
                          </span>
                          <button
                            type="button"
                            onClick={handleResetPosition}
                            className="text-[11px] text-brand-primary hover:underline font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Crosshair className="w-3 h-3" />
                            <span>Center Logo</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 rounded-lg border border-border-subtle bg-surface-muted/30 flex items-center justify-between">
                            <span className="text-text-muted">Offset X:</span>
                            <div className="flex items-center gap-1">
                              <input aria-label="Logo offset X"
                                type="number"
                                value={logoOffsetX}
                                onChange={(e) => {
                                  setLogoOffsetX(parseInt(e.target.value) || 0);
                                  pushSnapshotToHistory();
                                }}
                                className="w-14 px-1.5 py-0.5 text-right rounded border border-border-subtle bg-surface-base text-text-main text-xs font-mono"
                              />
                              <span className="text-[10px] text-text-muted">px</span>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg border border-border-subtle bg-surface-muted/30 flex items-center justify-between">
                            <span className="text-text-muted">Offset Y:</span>
                            <div className="flex items-center gap-1">
                              <input aria-label="Logo offset Y"
                                type="number"
                                value={logoOffsetY}
                                onChange={(e) => {
                                  setLogoOffsetY(parseInt(e.target.value) || 0);
                                  pushSnapshotToHistory();
                                }}
                                className="w-14 px-1.5 py-0.5 text-right rounded border border-border-subtle bg-surface-base text-text-main text-xs font-mono"
                              />
                              <span className="text-[10px] text-text-muted">px</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-text-muted font-sans">
                          Tip: Click and drag anywhere on the canvas to move the logo freely. It snaps to center automatically.
                        </p>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="w-full py-2.5 px-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-text-muted hover:text-text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Clean Defaults</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    TAB 6: MANUAL ELEMENTS & LAYERS (Sections 24–28)
                    ════════════════════════════════════════════════════════ */}
                {activeTab === "elements" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <h3 className="sr-only">Elements</h3>

                    {/* Quick Add Buttons */}
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                        Add Vector Shape
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { type: "line", label: "Line", icon: <Minus className="w-3.5 h-3.5" /> },
                          { type: "divider", label: "Divider", icon: <Divide className="w-3.5 h-3.5" /> },
                          { type: "rect", label: "Rectangle", icon: <Square className="w-3.5 h-3.5" /> },
                          { type: "circle", label: "Circle", icon: <Circle className="w-3.5 h-3.5" /> },
                          { type: "ring", label: "Ring", icon: <CircleDot className="w-3.5 h-3.5" /> },
                        ].map((el) => (
                          <button
                            key={el.type}
                            type="button"
                            onClick={() => handleAddPrimitive(el.type as VectorPrimitive["type"])}
                            className="py-2 px-1.5 rounded-lg border border-border-subtle hover:border-brand-primary hover:bg-brand-primary/5 text-text-main font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[48px]"
                          >
                            <span className="text-brand-primary">{el.icon}</span>
                            <span className="text-[10px]">{el.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layers List (Section 27) */}
                    <div className="space-y-2 pt-2 border-t border-border-subtle">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                          Layers ({primitives.length + 2})
                        </span>
                        <span className="text-[10px] text-text-muted">Top to bottom</span>
                      </div>

                      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                        {/* Dynamic Custom Primitives */}
                        {primitives.map((prim, idx) => (
                          <div
                            key={prim.id}
                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                              selectedPrimitiveId === prim.id
                                ? "border-brand-primary bg-brand-primary/10 font-bold"
                                : "border-border-subtle bg-surface-base"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedPrimitiveId(prim.id)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                            >
                              <span className="text-[10px] font-mono text-text-muted">#{idx + 1}</span>
                              <span className="truncate">{prim.name}</span>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMovePrimitiveLayer(prim.id, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded text-text-muted hover:text-text-main disabled:opacity-20 cursor-pointer"
                                title="Move layer up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePrimitiveLayer(prim.id, "down")}
                                disabled={idx === primitives.length - 1}
                                className="p-1 rounded text-text-muted hover:text-text-main disabled:opacity-20 cursor-pointer"
                                title="Move layer down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicatePrimitive(prim.id)}
                                className="p-1 rounded text-text-muted hover:text-text-main cursor-pointer"
                                title="Duplicate element"
                              >
                                <CopyIcon className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePrimitive(prim.id)}
                                className="p-1 rounded text-status-error hover:bg-status-error/10 cursor-pointer"
                                title="Delete element"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Built-in Core Layers */}
                        <div className="p-2 rounded-xl border border-border-subtle/50 bg-surface-muted/20 flex items-center justify-between text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-primary" />
                            <span>Wordmark ({brandName})</span>
                          </span>
                          <span className="text-[10px] font-mono">Core</span>
                        </div>

                        <div className="p-2 rounded-xl border border-border-subtle/50 bg-surface-muted/20 flex items-center justify-between text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Icon ({selectedSymbol.name})</span>
                          </span>
                          <span className="text-[10px] font-mono">Core</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Element Property Inspector (Section 24 & 25) */}
                    {selectedPrimitiveId && (() => {
                      const prim = primitives.find((p) => p.id === selectedPrimitiveId);
                      if (!prim) return null;
                      return (
                        <div className="p-3.5 rounded-xl border border-brand-primary/30 bg-brand-primary/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-brand-primary">
                              Selected: {prim.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicatePrimitive(prim.id)}
                                className="p-1 rounded text-text-muted hover:text-text-main cursor-pointer"
                                title="Duplicate"
                              >
                                <CopyIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePrimitive(prim.id)}
                                className="p-1 rounded text-status-error hover:bg-status-error/10 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Position X / Y Controls */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-position-x">Position X: {prim.x.toFixed(2)}</label>
                              <input
                                type="range"
                                min={-0.6}
                                max={0.6}
                                step={0.01}
                                value={prim.x}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { x: parseFloat(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-position-x"/>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-position-y">Position Y: {prim.y.toFixed(2)}</label>
                              <input
                                type="range"
                                min={-0.6}
                                max={0.6}
                                step={0.01}
                                value={prim.y}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { y: parseFloat(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-position-y"/>
                            </div>
                          </div>

                          {/* Size Width / Height Controls */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-width">Width: {Math.round(prim.width * 100)}%</label>
                              <input
                                type="range"
                                min={0.02}
                                max={1.0}
                                step={0.01}
                                value={prim.width}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { width: parseFloat(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-width"/>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-height">Height: {Math.round(prim.height * 100)}%</label>
                              <input
                                type="range"
                                min={0.005}
                                max={0.6}
                                step={0.005}
                                value={prim.height}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { height: parseFloat(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-height"/>
                            </div>
                          </div>

                          {/* Color, Opacity & Rotation */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-color">Color</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={prim.color || palette.accentColor}
                                  onChange={(e) => handleUpdatePrimitive(prim.id, { color: e.target.value, fillColor: prim.fill ? e.target.value : undefined, borderColor: prim.fill ? undefined : e.target.value })}
                                  className="w-6 h-6 rounded border-0 cursor-pointer"
                                id="logo-maker-color"/>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-opacity">Opacity: {Math.round(prim.opacity * 100)}%</label>
                              <input
                                type="range"
                                min={0.1}
                                max={1.0}
                                step={0.05}
                                value={prim.opacity}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { opacity: parseFloat(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-opacity"/>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-text-muted block" htmlFor="logo-maker-rotation">Rotation: {prim.rotation}°</label>
                              <input
                                type="range"
                                min={-180}
                                max={180}
                                step={5}
                                value={prim.rotation}
                                onChange={(e) => handleUpdatePrimitive(prim.id, { rotation: parseInt(e.target.value) })}
                                className="w-full accent-brand-primary cursor-pointer"
                              id="logo-maker-rotation"/>
                            </div>
                          </div>

                          <div className="text-[10px] text-text-muted font-mono pt-1">
                            Keyboard shortcut: Use Arrow keys to move (Shift for 5× step), Delete key to remove.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

            {/* ── PINNED EXPORT DOCK (ALWAYS VISIBLE AT BOTTOM OF CONTROLS STUDIO) ── */}
            <div
              ref={exportSectionRef}
              id="export-panel"
              className="p-3.5 sm:p-4 border-t border-border-subtle bg-surface-base/95 backdrop-blur-xs shrink-0 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Export Ready</span>
                </span>

                <div className="flex items-center gap-2 text-xs">
                  {/* Transparent Toggle */}
                  <label className="flex items-center gap-1 cursor-pointer text-text-main font-medium select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={transparentExport}
                      onChange={(e) => setTransparentExport(e.target.checked)}
                      className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                    />
                    <span>Transparent</span>
                  </label>

                  {/* Scale Multiplier */}
                  <div className="flex items-center gap-0.5 bg-surface-muted/60 p-0.5 rounded-lg border border-border-subtle text-[11px]">
                    {[1, 2, 4].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setExportMultiplier(m)}
                        className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                          exportMultiplier === m
                            ? "bg-brand-primary text-white"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        {m}×
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Download Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={exportingType !== null}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileCode className="w-4 h-4" />
                  <span>{exportingType === "svg" ? "Preparing SVG…" : "Download SVG"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPng(exportMultiplier)}
                  disabled={exportingType !== null}
                  className="w-full py-2.5 px-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted/60 text-text-main font-sans font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 text-brand-primary" />
                  <span>{exportingType === "png" ? "Preparing PNG…" : `Download PNG (${exportMultiplier}×)`}</span>
                </button>
              </div>

              {/* Secondary Actions: Copy SVG & Brand Package ZIP */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  disabled={exportingType !== null}
                  className="w-full py-2 px-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted/60 text-text-muted hover:text-text-main font-sans font-semibold text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copiedSvg ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSvg ? "SVG Copied!" : exportingType === "copy" ? "Copying…" : "Copy SVG"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBrandKit}
                  disabled={exportingType !== null}
                  className="w-full py-2 px-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary font-sans font-bold text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderArchive className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {exportingType === "zip"
                      ? (packagingProgress || "Packaging…")
                      : "Brand ZIP"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MULTI-SURFACE BRAND VARIATIONS (Optional Secondary Preview) ── */}
      <section
        id="logo-variations"
        aria-labelledby="variations-heading"
        className="space-y-4 pt-6 border-t border-border-subtle"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2
              id="variations-heading"
              className="text-lg sm:text-xl font-sans font-bold text-text-main flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-brand-primary" />
              <span>Multi-Surface Brand Variations</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Optional preview: Test how your design adapts across light websites, dark dashboards, print, and favicons.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVariations((v) => !v)}
            className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-xs font-semibold text-text-main transition-colors cursor-pointer flex items-center gap-1.5 min-h-[38px]"
          >
            <span>{showVariations ? "Hide Variations" : "Preview Multi-Surface Variations"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showVariations ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showVariations && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch animate-in fade-in duration-200">
            {/* Card 1: Light Surface */}
            <div className="h-full min-h-[170px] p-4 rounded-2xl border border-border-subtle bg-white shadow-xs flex flex-col justify-between space-y-3 transition-colors">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                Light Surface
              </span>
              <div
                className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                dangerouslySetInnerHTML={{
                  __html: buildLogoSvg({
                    ...currentConfig,
                    shape: "transparent",
                    palette: {
                      ...currentConfig.palette,
                      textColor: "#0F172A",
                      taglineColor: "#64748B",
                    },
                  }),
                }}
              />
              <span className="text-[10px] text-slate-500 font-mono text-center block">
                Header &amp; White Pages
              </span>
            </div>

            {/* Card 2: Dark Surface */}
            <div className="h-full min-h-[170px] p-4 rounded-2xl border border-slate-800 bg-[#090D16] shadow-xs flex flex-col justify-between space-y-3 transition-colors">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono">
                Dark Surface
              </span>
              <div
                className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                dangerouslySetInnerHTML={{
                  __html: buildLogoSvg({
                    ...currentConfig,
                    shape: "transparent",
                    palette: {
                      ...currentConfig.palette,
                      textColor: "#F8FAFC",
                      taglineColor: "#94A3B8",
                    },
                  }),
                }}
              />
              <span className="text-[10px] text-slate-400 font-mono text-center block">
                Dark App &amp; Footers
              </span>
            </div>

            {/* Card 3: Pure Monochrome */}
            <div className="h-full min-h-[170px] p-4 rounded-2xl border border-border-subtle bg-white shadow-xs flex flex-col justify-between space-y-3 transition-colors">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                Monochrome
              </span>
              <div
                className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                dangerouslySetInnerHTML={{
                  __html: buildLogoSvg({
                    ...currentConfig,
                    shape: "transparent",
                    palette: {
                      ...currentConfig.palette,
                      iconColor: "#111827",
                      textColor: "#111827",
                      taglineColor: "#4B5563",
                    },
                  }),
                }}
              />
              <span className="text-[10px] text-slate-500 font-mono text-center block">
                Print &amp; Invoices
              </span>
            </div>

            {/* Card 4: Square Mark */}
            <div className="h-full min-h-[170px] p-4 rounded-2xl border border-border-subtle bg-white shadow-xs flex flex-col justify-between space-y-3 transition-colors">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                Square Mark
              </span>
              <div className="w-full h-24 flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                <div
                  className="w-16 h-16 flex items-center justify-center overflow-hidden [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto"
                  dangerouslySetInnerHTML={{
                    __html: buildLogoSvg(
                      {
                        ...currentConfig,
                        layout: currentConfig.layout === "monogram" ? "monogram" : "icon-only",
                        shape: "transparent",
                      },
                      240,
                      240
                    ),
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono text-center block">
                1:1 Favicon &amp; App Icon
              </span>
            </div>
          </div>
        )}
      </section>

{/* ── 3. WEBSITE ASSET WORKFLOW GUIDANCE ──────────────────────── */}
      <section
        id="workflow-guidance"
        aria-labelledby="workflow-heading"
        className="border-t border-border-subtle pt-8 space-y-4"
      >
        <h2
          id="workflow-heading"
          className="text-xl sm:text-2xl font-sans font-bold text-text-main"
        >
          Website Asset Workflow: From Vector Logo to Favicon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-text-muted leading-relaxed">
          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-2">
            <span className="text-brand-primary font-bold font-mono text-xs block uppercase">
              Step 1: Website Header (SVG)
            </span>
            <p>
              Deploy your master <strong className="text-text-main font-semibold">logo.svg</strong> in your site’s navigation bar. Because SVG is mathematically drawn from XML vector paths, it remains crystal clear on standard 1080p monitors, 4K desktop screens, and high-density Retina phones with virtually zero file weight.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-2">
            <span className="text-brand-primary font-bold font-mono text-xs block uppercase">
              Step 2: High-DPI Fallback (PNG)
            </span>
            <p>
              For email signatures, PDFs, and platforms where vector SVGs are restricted, use the exported <strong className="text-text-main font-semibold">logo-2x.png</strong>. Transparent PNGs preserve crisp edges and alpha transparency across both dark and light backdrops.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-2">
            <span className="text-brand-primary font-bold font-mono text-xs block uppercase">
              Step 3: Favicon &amp; App Icons
            </span>
            <p>
              Take the exported standalone square mark into the{" "}
              <button
                type="button"
                onClick={() => onChangeView?.({ type: "tool", id: "favicon-generator" })}
                className="text-brand-primary underline hover:text-brand-primary-hover font-semibold inline cursor-pointer"
              >
                GainUtility Favicon Generator
              </button>{" "}
              to compile your multi-resolution .ico container, Apple touch icons, and Android PWA manifests in one click.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. LOGO DESIGN GUIDANCE ────────────────────────────────── */}
      <section
        id="logo-design-guidance"
        aria-labelledby="types-heading"
        className="border-t border-border-subtle pt-8 space-y-4"
      >
        <h2
          id="types-heading"
          className="text-xl sm:text-2xl font-sans font-bold text-text-main"
        >
          How to Choose the Right Logo Type for Your Brand
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-text-muted leading-relaxed">
          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-1.5">
            <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              When to Use a Wordmark (Text Logo)
            </h3>
            <p>
              A wordmark focuses entirely on the brand’s name using distinctive typography and custom letter-spacing. Choose a wordmark if your brand name is short (under 8 letters), memorable, and unique (like Sony or Stripe). Wordmarks establish immediate brand recall because visitors read your exact name rather than deciphering an abstract icon.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-1.5">
            <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              When to Use a Monogram (Lettermark)
            </h3>
            <p>
              A monogram reduces a long, multi-word company name into 1 to 3 bold initials enclosed in a crest or badge (like IBM, HP, or NASA). Monograms are exceptionally effective on mobile screens, app icons, and social media avatars where long words become unreadable.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-1.5">
            <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              Why Small-Size Testing Matters
            </h3>
            <p>
              A logo that looks stunning at 800px on a design canvas can fail in real-world use if it turns into a muddy smudge at 16×16 in a browser tab. Always inspect your logo in the Small Size Loupe to ensure your symbol and text maintain recognizable silhouettes at compact dimensions.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-1.5">
            <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              SVG vs. Transparent PNG
            </h3>
            <p>
              SVG is an open vector format that stores geometric coordinates. It scales infinitely without pixelation and allows CSS styling directly on the web. PNG is a raster bitmap format with lossless compression, ideal for legacy environments, slide presentations, and social media profiles.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FREQUENTLY ASKED QUESTIONS ──────────────────────────── */}
      <section
        id="logo-maker-faq"
        aria-labelledby="faq-heading"
        className="border-t border-border-subtle pt-8 space-y-4"
      >
        <div>
          <h2
            id="faq-heading"
            className="text-xl sm:text-2xl font-sans font-bold text-text-main"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Clear, practical answers about logo design, file formats, and website integration.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              q: "What is a logo maker?",
              a: "A logo maker is an online design utility that lets you create, customize, and export brand logos using tailored typography, curated vector symbols, color schemes, and layout templates without needing complex graphic software.",
            },
            {
              q: "Can I create a logo without design software?",
              a: "Yes. GainUtility Free Logo Maker runs completely in your web browser. You can select curated fonts, geometric marks, layouts, and color palettes with live interactive previews and download production-ready SVG and PNG files instantly.",
            },
            {
              q: "Can I make a logo from initials?",
              a: "Yes. Switch to the Monogram Badge layout, type your 1 to 3 initials into the Monogram field, and pick your preferred font and badge shape to build a crisp lettermark.",
            },
            {
              q: "Can I download an SVG logo?",
              a: "Yes. You can download a standalone vector SVG file or copy the raw SVG markup directly to your clipboard. The SVG contains clean vector coordinates and embedded web font declarations ready for your website.",
            },
            {
              q: "Can I download a transparent PNG?",
              a: "Yes. By choosing the Transparent container shape, your downloaded PNG files (1x, 2x Retina, and 4x High-Res) will have an alpha channel background that blends seamlessly into any web or print background.",
            },
            {
              q: "What size should a website logo be?",
              a: "Most modern website headers render logos between 32px and 48px in height. When using vector SVG, height adjusts automatically without loss of clarity. When using raster PNGs, deploy a 2x asset (e.g., 600×240 or 1200×480) to ensure crisp rendering on high-density Retina screens.",
            },
            {
              q: "Should I use SVG or PNG for my website logo?",
              a: "Use SVG for website headers and landing pages whenever possible. It provides the sharpest rendering, smallest network payload, and responsive scaling. Use high-resolution PNG for email newsletters, PDFs, and social media avatars.",
            },
            {
              q: "Can I use my logo as a favicon?",
              a: "Yes. For favicons, use the standalone icon mark or monogram variant from your brand kit. You can drop the generated square PNG into the GainUtility Favicon Generator to produce multi-resolution .ico and Apple touch files.",
            },
            {
              q: "Can I create a logo on my phone?",
              a: "Yes. The editor is built mobile-first. You can adjust text, fonts, colors, and layout on iOS and Android devices, inspect real-size previews, and download your logo package directly to your mobile device.",
            },
            {
              q: "Does GainUtility upload my design to any server?",
              a: "No. All SVG rendering, canvas rasterization, and ZIP archiving take place entirely on your device inside your web browser. None of your brand names, text, or exported files are ever uploaded or stored remotely.",
            },
            {
              q: "Can I edit the colors and fonts?",
              a: "Yes. You can choose from pre-curated color schemes and Google Fonts, or specify custom hex codes for the icon, brand text, tagline, and background surfaces.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-base space-y-1.5"
            >
              <h3 className="font-sans font-bold text-sm sm:text-base text-text-main">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CONTEXTUAL INTERNAL LINKS & RELATED UTILITIES ───────── */}
      <section
        id="related-tools-section"
        aria-labelledby="toolkit-heading"
        className="p-5 sm:p-6 rounded-2xl border border-border-subtle bg-surface-muted/20 space-y-3"
      >
        <h2
          id="toolkit-heading"
          className="font-sans font-bold text-sm sm:text-base text-text-main"
        >
          Complete Your Digital Brand Toolkit
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Turn your finished logo into a complete online identity with related browser utilities:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onChangeView?.({ type: "tool", id: "favicon-generator" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">Favicon Generator</span>
            <span className="text-[11px] text-text-muted block">Turn your logo mark into .ico and touch icons</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView?.({ type: "tool", id: "gradient-generator" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">CSS Gradient Studio</span>
            <span className="text-[11px] text-text-muted block">Build harmonious brand gradients and CSS backgrounds</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView?.({ type: "tool", id: "qr-code-generator" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">QR Code Generator</span>
            <span className="text-[11px] text-text-muted block">Generate scannable codes styled with brand colors</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView?.({ type: "tool", id: "og-meta-generator" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">OG Meta Tag Studio</span>
            <span className="text-[11px] text-text-muted block">Configure social share previews for X and LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView?.({ type: "tool", id: "image-resizer" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">Image Resizer</span>
            <span className="text-[11px] text-text-muted block">Quickly adjust logo raster dimensions offline</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView?.({ type: "seo-page", id: "image" })}
            className="p-3 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-left transition-all cursor-pointer space-y-0.5 min-h-[56px]"
          >
            <span className="text-xs font-bold text-brand-primary block">Image Tools Hub</span>
            <span className="text-[11px] text-text-muted block">Explore background remover, cropper &amp; converters</span>
          </button>
        </div>
      </section>

      {/* ── 7. RELATED TOOLS (CONTINUE EDITING) ───────────────────── */}
      <ContinueEditing
        currentToolId="logo-maker"
        files={[]}
        onAddToast={onAddToast}
        onChangeView={onChangeView}
      />

      {/* ── 8. STICKY MOBILE ACTION BAR ───────────────────────────── */}
      <StickyMobileAction visible={true}>
        <div className="space-y-2 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
          {showMobileMore && (
            <div className="p-3 rounded-xl bg-surface-base border border-border-subtle shadow-xl space-y-2 mb-2 animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border-subtle">
                <span className="font-bold text-text-main">More Export Options</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-text-main font-medium select-none text-[11px]">
                  <input
                    type="checkbox"
                    checked={transparentExport}
                    onChange={(e) => setTransparentExport(e.target.checked)}
                    className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                  />
                  <span>Transparent</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCopySvg();
                    setShowMobileMore(false);
                  }}
                  className="py-2 px-2.5 rounded-lg border border-border-subtle bg-surface-muted/50 text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSvg ? "SVG Copied!" : "Copy SVG"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadBrandKit();
                    setShowMobileMore(false);
                  }}
                  className="py-2 px-2.5 rounded-lg border border-brand-primary/20 bg-brand-primary/5 text-xs font-bold text-brand-primary flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 shrink-0" />
                  <span>Brand ZIP</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={exportingType !== null}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-sans font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              <FileCode className="w-4 h-4" />
              <span>Download SVG</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPng(exportMultiplier)}
              disabled={exportingType !== null}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border-subtle bg-surface-base hover:bg-surface-muted text-text-main font-sans font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-brand-primary" />
              <span>PNG ({exportMultiplier}×)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobileMore((m) => !m)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                showMobileMore
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-border-subtle bg-surface-base text-text-muted hover:text-text-main"
              }`}
              title="More export options"
              aria-label="More export options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
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
