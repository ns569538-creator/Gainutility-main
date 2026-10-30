import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Type,
  Search,
  Check,
  Copy,
  ExternalLink,
  Info,
  Bold,
  Upload,
  X,
  ImageIcon,
  FileText,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Eye,
  Layers,
  Loader2,
  Crop,
  ZoomIn,
  RotateCw,
  Sun,
  Contrast,
  RefreshCw,
  SearchCheck,
  BookOpen,
  AlertCircle,
  Tags,
  BadgeCheck
} from "lucide-react";
import { Toast, Button } from "./Common";
import {
  FONTS,
  COMMERCIAL_FONTS,
  FontEntry,
  FontCategory,
  findCommercial,
  freeAlternativesForCommercial,
  cssUrlFor,
  cssImportSnippet,
  fontFamilyDecl,
} from "../lib/fontCatalog";
import {
  getFonts,
  EnrichedFont,
  workerStatus,
} from "../lib/googleFonts";

interface FontDetectorProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: unknown) => void;
}

type ViewMode = "catalog" | "image" | "pdf";

const CATEGORIES = ["All", "Sans-Serif", "Serif", "Monospace", "Display", "Script"] as const;

const PAIRINGS: Array<{ heading: string; body: string; note: string }> = [
  { heading: "Playfair Display", body: "Inter", note: "Classic editorial contrast — elegant serif over a quiet humanist sans." },
  { heading: "Montserrat", body: "Merriweather", note: "Geometric headline energy with a highly readable serif body." },
  { heading: "Inter", body: "Inter", note: "Single-family hierarchy via weights (600 headings / 400 body)." },
  { heading: "Bebas Neue", body: "Open Sans", note: "Loud condensed caps paired with a workhorse text face." },
  { heading: "DM Sans", body: "DM Sans", note: "Minimal product UI — same family, different weights." },
  { heading: "Poppins", body: "Lora", note: "Geometric warmth meets classic serif elegance." }
];

const buildCatalogCssUrl = (fonts: Array<{ family: string; weights: number[] }>): string =>
  `https://fonts.googleapis.com/css2?${fonts
    .map((f) => `family=${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`)
    .join("&")}&display=swap`;

type Confidence = "strong" | "good" | "similar";

interface MatchResult {
  font: EnrichedFont;
  confidence: Confidence;
  score: number; // 0..100 (heuristic, shown as a coarse meter not an exact claim)
  reasons: string[];
}

interface DetectedSignals {
  hasText: boolean;
  charCount: number;
  uppercaseRatio: number;
  inkRatio: number; // 0..1 share of dark pixels (weight)
  isCondensed: boolean;
  isWide: boolean;
  serifLikely: boolean;
  handwritingLikely: boolean;
  allCaps: boolean;
  /** Ink bounding-box size in canvas px (0 when no ink). */
  inkWidthPx: number;
  inkHeightPx: number;
  /** Estimated text line count from horizontal projection (min 1). */
  lineCount: number;
}

interface Region {
  x: number; y: number; w: number; h: number; // fractions 0..1
}

interface PdfFontInfo {
  name: string;
  fallbackName?: string;
  italic?: boolean;
  weight?: number;
}

const confidenceLabel: Record<Confidence, string> = {
  strong: "Likely match",
  good: "Possible match",
  similar: "Similar font",
};

export const FontDetector: React.FC<FontDetectorProps> = ({ onCopy, onAddToast }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("image");

  // ---- Catalog / Search state ----
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [showCommercial, setShowCommercial] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("inter");
  const [selectedFromDetection, setSelectedFromDetection] = useState(false);
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState(28);
  const [weight, setWeight] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [catalogFonts, setCatalogFonts] = useState<EnrichedFont[]>([]);
  const [googleStatus, setGoogleStatus] = useState<"loading" | "live" | "local" | "error">("loading");

  // ---- Image state ----
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropRegion, setCropRegion] = useState<Region>({ x: 0.15, y: 0.3, w: 0.7, h: 0.4 });
  const [imgRotation, setImgRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [preparedSample, setPreparedSample] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [detectedSignals, setDetectedSignals] = useState<DetectedSignals | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [process, setProcess] = useState<{ stage: string; progress: number } | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [imageConfidenceNote, setImageConfidenceNote] = useState("");

  // ---- PDF state ----
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [embeddedFonts, setEmbeddedFonts] = useState<PdfFontInfo[]>([]);
  const [pdfDetectionMethod, setPdfDetectionMethod] = useState<"none" | "embedded" | "visual">("none");
  const [pdfProcess, setPdfProcess] = useState<{ stage: string; progress: number } | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const imageRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageStageRef = useRef<HTMLDivElement>(null);

  // ---- Load Google Fonts index ----
  useEffect(() => {
    let alive = true;
    (async () => {
      setGoogleStatus("loading");
      const status = await workerStatus();
      if (!alive) return;
      setGoogleStatus(status.source === "worker" ? "live" : "local");
      setCatalogFonts(await getFonts());
    })();
    return () => { alive = false; };
  }, []);

  // Load CSS for catalog fonts so previews actually render.
  useEffect(() => {
    const fams = (catalogFonts.length ? catalogFonts : FONTS).map((f) => ({ family: f.family, weights: f.weights.slice(0, 3) }));
    if (!document.getElementById("font-detector-catalog") && fams.length) {
      const link = document.createElement("link");
      link.id = "font-detector-catalog";
      link.rel = "stylesheet";
      link.href = buildCatalogCssUrl(fams);
      link.onload = () => setGoogleLoaded(true);
      link.onerror = () => setGoogleLoaded(false);
      document.head.appendChild(link);
    } else {
      setGoogleLoaded(true);
    }
  }, [catalogFonts]);

  // ---- Derived font list for catalog/search ----
  const sourceFonts: EnrichedFont[] = useMemo(
    () => (catalogFonts.length ? catalogFonts : FONTS),
    [catalogFonts]
  );

  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cats = category === "All" ? null : new Set<FontCategory>([category as FontCategory]);
    return sourceFonts.filter((f) => {
      if (freeOnly && !f.free) return false;
      if (showCommercial && f.free) return false;
      if (cats && !cats.has(f.category)) return false;
      if (!q) return true;
      return (
        f.family.toLowerCase().includes(q) ||
        f.designers.toLowerCase().includes(q) ||
        f.bestFor.toLowerCase().includes(q) ||
        f.traits.some((t) => t.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [sourceFonts, query, category, freeOnly, showCommercial]);

  // Commercial fonts are always shown at the bottom when browsing/searching free.
  const visibleCommercial = useMemo(() => {
    const q = query.trim().toLowerCase();
    const show = showCommercial || (!!q && q.length > 1);
    if (!show) return [];
    return COMMERCIAL_FONTS.filter((c) =>
      !q ||
      c.family.toLowerCase().includes(q) ||
      c.traits.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [query, showCommercial]);

  const selected: EnrichedFont = useMemo(() => {
    const found = sourceFonts.find((f) => f.id === selectedId);
    if (found) return found;
    const comm = COMMERCIAL_FONTS.find((c) => c.id === selectedId || c.family === selectedId);
    if (comm) {
      return {
        ...newBaseFromCommercial(comm),
        commercial: true,
        id: comm.id,
        family: comm.family,
        category: comm.category,
        designers: comm.designers,
        weights: comm.weights,
        traits: comm.traits,
        bestFor: comm.traits.join(", "),
        subsets: comm.subsets,
        license: comm.license,
        source: comm.source,
        free: false,
        classification: comm.classification,
      };
    }
    return sourceFonts[0] ?? FONTS[0];
  }, [sourceFonts, selectedId]);

  function newBaseFromCommercial(c: (typeof COMMERCIAL_FONTS)[number]): EnrichedFont {
    return {
      id: c.id, family: c.family, category: c.category, kind: "commercial",
      designers: c.designers, weights: c.weights, italic: false, variable: false,
      subsets: c.subsets, license: c.license, licenseRaw: null, source: c.source,
      free: false, popularity: Number.MAX_SAFE_INTEGER, condensed: false, expanded: false,
      tagIdx: [], tagPaths: [], traits: c.traits, bestFor: c.traits.join(", "),
      classification: c.classification, freeAlternatives: c.freeAlternatives,
      haystack: `${c.family} ${c.traits.join(" ")}`.toLowerCase(),
    };
  }

  const { commercial: selectedCommercial, free: selectedFreeAlt } = useMemo(
    () => freeAlternativesForCommercial(selected.family),
    [selected]
  );

  const compareFonts = useMemo(() => {
    return compareIds
      .map((id) => sourceFonts.find((f) => f.id === id) || COMMERCIAL_FONTS.find((c) => c.id === id))
      .filter(Boolean) as Array<FontEntry | (typeof COMMERCIAL_FONTS)[number]>;
  }, [compareIds, sourceFonts]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const displayText = previewText || "GainUtility";

  // ==========================================================================
  // IMAGE PIPELINE
  // ==========================================================================

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      onAddToast?.("Please upload an image file (JPG, PNG, WebP)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      setImageFileName(file.name);
      setOcrText("");
      setDetectedSignals(null);
      setMatchResults([]);
      setPreparedSample(null);
      setProcess(null);
      setProcessError(null);
      setCropRegion({ x: 0.12, y: 0.3, w: 0.76, h: 0.4 });
      setImgRotation(0);
      setBrightness(100);
      setContrast(100);
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }, [onAddToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files[0]);
  }, [handleImageUpload]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const loadExampleImage = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FAF8F1";
    ctx.fillRect(0, 0, 900, 320);
    ctx.fillStyle = "#1b1d16";
    ctx.font = "600 88px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sample Headline", 450, 128);
    ctx.font = "400 34px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#4a4f45";
    ctx.fillText("Secondary line of sample body copy", 450, 224);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "example-text.png", { type: "image/png" });
      handleImageUpload(file);
    }, "image/png");
  }, [handleImageUpload]);

  // Rotate the displayed image (does not modify source until sample is prepared).
  const rotateImage = useCallback(() => {
    setImgRotation((r) => (r + 90) % 360);
  }, []);

  // Prepare the cropped/rotated/adjusted sample into a canvas + dataURL.
  const prepareSample = useCallback((): string | null => {
    if (!uploadedImage) return null;
    const stage = imageStageRef.current;
    const img = new Image();
    const dataUrl = prepareSampleSync(uploadedImage, cropRegion, imgRotation, brightness, contrast, stage);
    if (dataUrl) {
      setPreparedSample(dataUrl);
      // Reset previous results so the user knows this is a fresh run.
      setMatchResults([]);
      setOcrText("");
      setDetectedSignals(null);
    }
    return dataUrl;
  }, [uploadedImage, cropRegion, imgRotation, brightness, contrast]);

  function prepareSampleSync(
    src: string,
    region: Region,
    rotation: number,
    br: number,
    ct: number,
    stageEl: HTMLDivElement | null
  ): string | null {
    const img = new Image();
    let out: string | null = null;
    try {
      const naturalW = 1000;
      const draw = () => {
        const vw = stageEl ? stageEl.clientWidth : 600;
        const scale = naturalW / img.naturalWidth;
        const cw = Math.max(60, Math.round(img.naturalWidth * region.w * scale));
        const ch = Math.max(60, Math.round(img.naturalHeight * region.h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Apply rotation by drawing into a rotated buffer.
        const rad = (rotation * Math.PI) / 180;
        if (rotation % 180 !== 0) {
          canvas.width = ch;
          canvas.height = cw;
        }
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        if (br !== 100 || ct !== 100) {
          ctx.filter = `brightness(${br / 100}) contrast(${ct / 100})`;
        }
        ctx.drawImage(
          img,
          img.naturalWidth * region.x,
          img.naturalHeight * region.y,
          img.naturalWidth * region.w,
          img.naturalHeight * region.h,
          0,
          0,
          cw,
          ch
        );
        ctx.restore();
        out = canvas.toDataURL("image/png");
      };
      img.onload = draw;
      img.src = src;
      // draw happens synchronously on load for data URLs in most browsers
    } catch (e) {
      console.error(e);
    }
    return out;
  }

  // Because <img> load is async for data URLs is typically synchronous-ish, we use
  // the sync helper above and treat the returned data URL optimistically; the
  // recognition step re-decodes from the data URL which guarantees correctness.
  // Fallback path uses a fresh Image decode below.

  const [signalAnalysisError, setSignalAnalysisError] = useState(false);

  const analyzeSignals = useCallback(async (target: string): Promise<DetectedSignals> => {
    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("image decode failed"));
      i.src = target;
    });
    const canvas = document.createElement("canvas");
    const maxW = 1200;
    const scale = Math.min(1, maxW / imgEl.naturalWidth);
    canvas.width = Math.round(imgEl.naturalWidth * scale);
    canvas.height = Math.round(imgEl.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas ctx");
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Threshold: treat dark pixels as ink; track bbox + per-row ink for
    // scale-invariant width/line estimates.
    let dark = 0;
    let total = 0;
    let minX = w, maxX = -1, minY = h, maxY = -1;
    const rowDark = new Uint32Array(h);
    for (let i = 0; i < px.length; i += 4) {
      const b = (px[i] + px[i + 1] + px[i + 2]) / 3;
      total++;
      if (b < 128) {
        dark++;
        const p = i >> 2;
        const x = p % w;
        const y = (p / w) | 0;
        rowDark[y]++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const inkRatio = total ? dark / total : 0;
    const hasInk = maxX >= minX && maxY >= minY;
    const inkWidthPx = hasInk ? maxX - minX + 1 : 0;
    const inkHeightPx = hasInk ? maxY - minY + 1 : 0;

    // Text line count from horizontal projection inside the ink bbox (noise
    // rows below a tiny threshold count as gaps).
    let lineCount = 0;
    let inLine = false;
    const rowNoise = Math.max(2, Math.floor(inkWidthPx * 0.01));
    for (let y = minY; y <= maxY; y++) {
      const filled = rowDark[y] > rowNoise;
      if (filled && !inLine) { inLine = true; lineCount++; }
      else if (!filled) inLine = false;
    }

    // Horizontal stroke-run detection: overall average, plus a baseline band
    // vs mid x-height band comparison — serifs add short horizontal strokes
    // near the baseline, so bot/mid run ratio rises for serif construction.
    const bandAvgRuns = (y0: number, y1: number): number => {
      if (y1 < y0) return 0;
      let runsSum = 0;
      let rows = 0;
      for (let y = y0; y <= y1; y++) {
        rows++;
        let inRun = false;
        let runs = 0;
        for (let x = minX; x <= maxX; x++) {
          const idx = (y * w + x) * 4;
          const b = (px[idx] + px[idx + 1] + px[idx + 2]) / 3;
          const isDark = b < 128;
          if (isDark && !inRun) { inRun = true; runs++; }
          else if (!isDark) inRun = false;
        }
        runsSum += runs;
      }
      return rows ? runsSum / rows : 0;
    };

    const avgRuns = hasInk ? bandAvgRuns(minY, maxY) : 0;
    const midRuns = hasInk
      ? bandAvgRuns(minY + Math.floor(inkHeightPx * 0.35), minY + Math.floor(inkHeightPx * 0.6))
      : 0;
    const botRuns = hasInk
      ? bandAvgRuns(minY + Math.floor(inkHeightPx * 0.72), minY + Math.floor(inkHeightPx * 0.92))
      : 0;
    const serifLikely =
      inkRatio > 0.06 && inkRatio < 0.55 && midRuns > 0 && botRuns / midRuns > 1.45;

    // Connected script: long unbroken horizontal runs (avg runs/row stays low),
    // not the high-run signature of sparse normal text.
    const handwritingLikely = inkRatio > 0.02 && inkRatio < 0.35 && avgRuns > 0 && avgRuns < 2.2;

    return {
      hasText: true,
      charCount: 0, // filled from OCR
      uppercaseRatio: 0,
      inkRatio,
      isCondensed: false,
      isWide: false,
      serifLikely,
      handwritingLikely,
      allCaps: false,
      inkWidthPx,
      inkHeightPx,
      lineCount: Math.max(1, lineCount),
    };
  }, []);

  const runRecognition = useCallback(async (target: string) => {
    setProcess({ stage: "Reading text…", progress: 8 });
    setProcessError(null);
    setMatchResults([]);
    setOcrText("");
    setDetectedSignals(null);
    setSelectedFromDetection(false);

    let text = "";
    try {
      // 1) OCR text
      setProcess({ stage: "Detecting visible text…", progress: 20 });
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(target, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text" && m.progress) {
            const p = Math.round(18 + m.progress * 32);
            setProcess({ stage: "Detecting visible text…", progress: p });
          }
        },
      });
      text = (result.data.text || "").replace(/\s+/g, " ").trim();
      setOcrText(text);

      // 2) Letter-shape analysis
      setProcess({ stage: "Analyzing letter shapes…", progress: 55 });
      const signals = await analyzeSignals(target);
      const letters = (text.replace(/[^a-zA-Z]/g, "") || "");
      const caps = (text.match(/[A-Z]/g) || []).length;
      signals.charCount = letters.length;
      signals.uppercaseRatio = letters.length ? caps / letters.length : 0;
      signals.allCaps = letters.length > 2 && signals.uppercaseRatio > 0.75;

      // Scale-invariant width/condensation: advance-per-char relative to the
      // estimated line height (from the ink bbox + line count), not OCR length.
      if (signals.charCount >= 4 && signals.inkWidthPx > 0 && signals.inkHeightPx > 0) {
        const lines = Math.max(1, signals.lineCount);
        const chars = Math.max(1, text.length);
        const lineH = signals.inkHeightPx / lines;
        const estW = (signals.inkWidthPx * lines) / (chars * lineH);
        signals.isCondensed = estW < 0.45;
        signals.isWide = estW > 0.72;
      }
      if (signals.charCount === 0) {
        signals.hasText = false;
      }
      setDetectedSignals(signals);

      // 3) Compare against catalog (free + commercial faces, deduped)
      setProcess({ stage: "Comparing letter shapes to fonts…", progress: 72 });
      const seenIds = new Set<string>();
      const matchPool: EnrichedFont[] = [];
      for (const f of sourceFonts) {
        if (!seenIds.has(f.id)) { seenIds.add(f.id); matchPool.push(f); }
      }
      for (const c of COMMERCIAL_FONTS) {
        if (seenIds.has(c.id)) continue;
        seenIds.add(c.id);
        matchPool.push({ ...newBaseFromCommercial(c), commercial: true });
      }
      const ranked = rankFonts(signals, text, matchPool);
      setMatchResults(ranked);
      setSelectedFromDetection(true);

      if (ranked.length && ranked[0].confidence !== "similar") {
        setSelectedId(ranked[0].font.id);
      }

      // 4) Done
      setProcess(null);
      setImageConfidenceNote(
        signals.hasText
          ? `Matched using ${signals.charCount} characters, ink weight, width and letter shapes from your sample.`
          : "No clear text detected — results below are based on overall letter shapes and may be less precise."
      );
    } catch (err) {
      console.error("Analysis failed:", err);
      setProcess(null);
      setProcessError("Couldn't identify this sample. Try a clearer crop.");
    }
  }, [analyzeSignals, sourceFonts]);

  function rankFonts(signals: DetectedSignals, text: string, pool: EnrichedFont[]): MatchResult[] {
    const scored = pool.map((font) => {
      let score = 32;
      const reasons: string[] = [];
      const cl = font.classification;

      // Weight
      if (signals.inkRatio > 0.32) {
        if ((cl.weightHint ?? 4) >= 6) { score += 12; reasons.push("Heavy / bold letterforms"); }
      } else if (signals.inkRatio > 0.18) {
        if ((cl.weightHint ?? 4) >= 4 && (cl.weightHint ?? 4) <= 6) { score += 8; reasons.push("Balanced stroke weight"); }
      } else if (signals.inkRatio < 0.16) {
        if ((cl.weightHint ?? 4) <= 3) { score += 10; reasons.push("Light hairline strokes"); }
      }

      // Width
      if (signals.isCondensed && cl.condensed) { score += 12; reasons.push("Condensed proportions"); }
      if (signals.isWide && cl.wide) { score += 11; reasons.push("Wide / expanded proportions"); }

      // Serif / sans
      if (signals.serifLikely) {
        if (cl.serif) { score += 14; reasons.push("Serif terminals"); }
        else if (cl.sans) { score -= 8; }
      } else {
        if (cl.sans) { score += 9; reasons.push("Sans-serif construction"); }
        else if (cl.serif) { score -= 6; }
      }

      // Handwriting / script
      if (signals.handwritingLikely && cl.script) { score += 16; reasons.push("Connected script forms"); }
      if (signals.allCaps && cl.display) { score += 12; reasons.push("Display / all-caps letterforms"); }
      if (signals.allCaps && cl.script) { score -= 10; }

      // Category sanity
      if (cl.monospace && !signals.charCount) score -= 5;

      score = Math.max(0, Math.min(98, score));
      const confidence: Confidence =
        score >= 80 && signals.hasText ? "strong"
        : score >= 62 ? "good"
        : "similar";

      return { font, confidence, score, reasons };
    });

    scored.sort((a, b) => b.score - a.score);
    const kept = scored.slice(0, 8);
    const top = kept[0]?.score ?? 0;
    const second = kept[1]?.score ?? 0;
    if (kept.length) {
      // "Likely" only with real text evidence, enough characters, and a clear
      // lead over the runner-up; no OCR text caps everything at "Similar".
      const strongOk =
        signals.hasText &&
        signals.charCount >= 4 &&
        top >= 80 &&
        top - second >= 8;
      if (!strongOk) {
        for (let i = 0; i < kept.length; i++) {
          if (kept[i].confidence === "strong") kept[i] = { ...kept[i], confidence: "good" };
        }
      }
      if (!signals.hasText || signals.charCount === 0) {
        for (let i = 0; i < kept.length; i++) {
          if (kept[i].confidence !== "similar") kept[i] = { ...kept[i], confidence: "similar" };
        }
      } else if (top < 55) {
        kept[0] = { ...kept[0], confidence: "similar" };
      }
    }
    return kept;
  }

  const handleAnalyzeSample = useCallback(async () => {
    const target = prepareSample();
    if (!target) return;
    await runRecognition(target);
  }, [prepareSample, runRecognition]);

  // ==========================================================================
  // PDF PIPELINE
  // ==========================================================================

  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      onAddToast?.("Please upload a PDF file", "error");
      return;
    }
    setPdfFileName(file.name);
    setPdfError(null);
    setPdfProcess(null);
    setEmbeddedFonts([]);
    setPdfDetectionMethod("none");
    setPdfPreview(null);
    setCurrentPage(1);
    try {
      const { loadPdfJs } = await import("../lib/pdfJsLoader");
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setPageCount(doc.numPages);
      await renderPdfPage(doc, 1, setPdfPreview);
      await extractPdfFonts(doc, 1);
    } catch (err) {
      console.error(err);
      setPdfError("Couldn't open this PDF. It may be corrupted or password-protected.");
    }
  }, [onAddToast]);

  async function renderPdfPage(doc: any, pageNum: number, setter: (url: string) => void) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport }).promise;
    // Extract fonts after render (fonts populate commonObjs).
    setter(canvas.toDataURL("image/png"));
    return page;
  }

  async function extractPdfFonts(doc: any, pageNum: number) {
    let page;
    try {
      page = await doc.getPage(pageNum);
      await page.getOperatorList();
    } catch { return; }
    const fonts: PdfFontInfo[] = [];
    const seen = new Set<string>();
    if (page.commonObjs) {
      page.commonObjs.forEach((obj: any, key: string) => {
        if (!obj) return;
        const name = obj.name && obj.name !== "null" ? obj.name : obj.fallbackName;
        const fallbackName = obj.fallbackName;
        const base = name || fallbackName || key;
        if (base && typeof base === "string" && !seen.has(base)) {
          seen.add(base);
          const italic = !!(obj.properties && obj.properties.italic);
          const weight =
            obj.properties && typeof obj.properties.fontWeight === "number"
              ? obj.properties.fontWeight
              : undefined;
          if (name || fallbackName) {
            fonts.push({ name, fallbackName, italic, weight });
          }
        }
      });
    }
    // Also scan objMap keys
    if (page.objs && page.objs._map) {
      for (const [key, entry] of page.objs._map.entries()) {
        if (entry && typeof entry === "object" && (entry as any).name) {
          const nm = (entry as any).name;
          if (typeof nm === "string" && !seen.has(nm)) {
            seen.add(nm);
            fonts.push({ name: nm });
          }
        }
      }
    }
    setEmbeddedFonts(fonts);
    if (fonts.length) setPdfDetectionMethod("embedded");
  }

  const changePdfPage = useCallback(async (n: number) => {
    if (!pdfDoc) return;
    const target = Math.max(1, Math.min(pageCount, n));
    setCurrentPage(target);
    setPdfProcess({ stage: "Rendering page…", progress: 30 });
    setPdfError(null);
    try {
      await renderPdfPage(pdfDoc, target, setPdfPreview);
      await extractPdfFonts(pdfDoc, target);
      setPdfProcess(null);
    } catch (err) {
      console.error(err);
      setPdfProcess(null);
      setPdfError("Couldn't render this page.");
    }
  }, [pdfDoc, pageCount]);

  const detectPdfVisually = useCallback(async () => {
    if (!pdfPreview) return;
    setPdfDetectionMethod("visual");
    setPdfProcess({ stage: "Detecting text on page…", progress: 20 });
    setPdfError(null);
    await runRecognition(pdfPreview);
    setPdfProcess(null);
  }, [pdfPreview, runRecognition]);

  const clearPdf = useCallback(() => {
    setPdfDoc(null);
    setPdfFileName("");
    setPageCount(0);
    setPdfPreview(null);
    setEmbeddedFonts([]);
    setPdfDetectionMethod("none");
    setPdfError(null);
    setPdfProcess(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  }, []);

  // ==========================================================================
  // EXPORT HELPERS
  // ==========================================================================

  const copyText = useCallback((text: string, label: string) => {
    if (onCopy) onCopy(text);
    else navigator.clipboard.writeText(text).catch(() => {});
    onAddToast?.(`${label} copied!`, "success");
  }, [onCopy, onAddToast]);

  const handleCopyCSS = useCallback(() => {
    const wghts = selected.weights.join(";");
    const importUrl = cssUrlFor(selected.family, selected.weights);
    const cat = (selected.category as FontCategory) || "Sans-Serif";
    const snippet = [
      `@import url('${importUrl}');`,
      ``,
      `.font-style {`,
      `  ${fontFamilyDecl(selected.family, cat)}`,
      `  font-weight: ${weight};`,
      `  letter-spacing: ${letterSpacing}px;`,
      `}`,
    ].join("\n");
    copyText(snippet, `CSS for ${selected.family}`);
  }, [selected, weight, letterSpacing, copyText]);

  const copyImportSnippet = useCallback(() => {
    const s = cssImportSnippet(selected.family, selected.weights, selected.category);
    copyText(s, "CSS @import");
  }, [selected, copyText]);

  const copyFamilyDecl = useCallback(() => {
    const s = fontFamilyDecl(selected.family, selected.category);
    copyText(s, "font-family");
  }, [selected, copyText]);

  const copyFontDecl = useCallback((family: string, category?: FontCategory) => {
    copyText(fontFamilyDecl(family, category ?? "Sans-Serif"), `CSS for ${family}`);
  }, [copyText]);

  const renderMatchRow = (result: MatchResult, hero = false) => {
    const { font, confidence, reasons } = result;
    return (
      <div
        key={font.id}
        className={`rounded-xl border p-4 transition-all cursor-pointer ${
          hero
            ? "bg-brand-primary-light/30 border-brand-primary/40 ring-1 ring-brand-primary/20"
            : confidence === "strong"
              ? "bg-brand-primary-light/20 border-brand-primary/30"
              : "bg-surface-base border-border-light hover:border-brand-primary/30"
        }`}
        onClick={() => { setSelectedId(font.id); setSelectedFromDetection(true); setViewMode("catalog"); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(font.id); setSelectedFromDetection(true); setViewMode("catalog"); } }}
      >
        <div className={`flex items-center justify-between gap-2 ${hero ? "mb-3" : "mb-2"}`}>
          <span className={`${hero ? "text-2xl sm:text-3xl" : "text-lg"} text-text-main break-words`} style={{ fontFamily: `'${font.family}', sans-serif` }}>
            {displayText.split(" ").slice(0, 4).join(" ") || font.family}
          </span>
          <ConfidenceBadge confidence={confidence} hasText={detectedSignals?.hasText ?? false} charCount={detectedSignals?.charCount ?? 0} />
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`${hero ? "text-base" : "text-sm"} font-bold text-text-main break-words min-w-0`}>{font.family}</span>
          <span className="text-[11px] text-text-muted whitespace-nowrap">{font.category} · {font.free ? "Free" : "Paid"}</span>
        </div>
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {reasons.map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-surface-muted border border-border-light text-[10px] font-semibold text-text-sub">{r}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button onClick={(e) => { e.stopPropagation(); setSelectedId(font.id); setSelectedFromDetection(true); setViewMode("catalog"); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary text-[#FAF8F1] hover:bg-brand-primary-hover cursor-pointer">
            <Eye className="w-3 h-3" /> Preview
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleCompare(font.id); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary cursor-pointer">
            <Layers className="w-3 h-3" /> {compareIds.includes(font.id) ? "Compared" : "Compare"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); copyFontDecl(font.family, font.category); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary cursor-pointer">
            <Copy className="w-3 h-3" /> Copy CSS
          </button>
          <FindAltLink family={font.family} onSelect={(id) => { setSelectedId(id); setViewMode("catalog"); }} />
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className="flex flex-col gap-5"
      onPaste={handlePaste}
      tabIndex={-1}
    >
{/* Mode Toggle */}
      <div className="flex items-center bg-surface-muted rounded-xl border border-border-light p-1 shrink-0 flex-wrap">
          <Button
            type="button"
            onClick={() => setViewMode("image")}
            variant={viewMode === "image" ? "primary" : "ghost"}
            size="sm"
            leftIcon={<ImageIcon className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            From Image
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode("pdf")}
            variant={viewMode === "pdf" ? "primary" : "ghost"}
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            From PDF
          </Button>
          <Button
            type="button"
            onClick={() => setViewMode("catalog")}
            variant={viewMode === "catalog" ? "primary" : "ghost"}
            size="sm"
            leftIcon={<Search className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            Search & Preview
          </Button>
      </div>

      {/* ================= IMAGE MODE ================= */}
      {viewMode === "image" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: upload + editing */}
          <div className="flex flex-col gap-4">
            {!uploadedImage ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center transition-all min-h-[300px] cursor-pointer ${
                  isDragOver ? "border-brand-primary bg-brand-primary-light/30" : "border-border-medium hover:border-brand-primary hover:bg-surface-muted/20"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload image to identify a font"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                />
                <div className="w-16 h-16 rounded-2xl bg-brand-primary-light flex items-center justify-center border border-brand-primary/15 text-brand-primary">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-sans font-bold text-base text-text-main">Drop a screenshot, logo or poster here</p>
                  <p className="text-sm text-text-muted mt-1">…or upload an image. Paste from clipboard with Ctrl+V.</p>
                  <p className="text-xs text-text-disabled mt-2">JPG · PNG · WEBP</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    variant="primary"
                    size="md"
                    leftIcon={<Upload className="w-4 h-4" />}
                    className="min-h-[44px]"
                  >
                    Upload image
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); loadExampleImage(); }}
                    variant="outline"
                    size="md"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="min-h-[44px]"
                  >
                    Try an Example
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-base border border-border-light rounded-2xl overflow-hidden shadow-premium-sm">
                {/* Editor stage */}
                <div className="relative">
                  <div ref={imageStageRef} className="relative w-full max-h-[380px] bg-background overflow-hidden select-none">
                    <img
                      src={uploadedImage}
                      alt="Uploaded image for font identification"
                      draggable={false}
                      style={{ transform: `rotate(${imgRotation}deg) scale(${zoom})`, transition: "transform 0.15s ease" }}
                      className="w-full max-h-[380px] object-contain"
                    />
                  </div>
                  {/* Remove */}
                  <Button
                    type="button"
                    onClick={() => {
                      setUploadedImage(null);
                      setOcrText(""); setDetectedSignals(null); setMatchResults([]); setPreparedSample(null); setProcess(null); setProcessError(null);
                    }}
                    variant="ghost"
                    size="sm"
                    aria-label="Remove uploaded image"
                    className="absolute top-3 right-3 min-h-[44px] min-w-[44px] p-1"
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    <span className="sr-only">Remove uploaded image</span>
                  </Button>
                </div>

                {/* Adjust toolbar */}
                <div className="px-4 py-3 border-t border-border-light flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={rotateImage}
                    variant="outline"
                    size="sm"
                    leftIcon={<RotateCw className="w-4 h-4" />}
                    className="min-h-[44px]"
                    title="Rotate 90°"
                    aria-label="Rotate image 90 degrees"
                  >
                    Rotate
                  </Button>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted px-1.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <input type="range" min={0.8} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="accent-brand-primary w-20" aria-label="Zoom" />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted px-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    <input type="range" min={40} max={180} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="accent-brand-primary w-16" aria-label="Brightness" />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted px-1.5">
                    <Contrast className="w-3.5 h-3.5" />
                    <input type="range" min={40} max={180} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="accent-brand-primary w-16" aria-label="Contrast" />
                  </label>
                  <Button
                    type="button"
                    onClick={() => { setCropRegion({ x: 0.12, y: 0.3, w: 0.76, h: 0.4 }); setImgRotation(0); setBrightness(100); setContrast(100); setZoom(1); }}
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="min-h-[44px]"
                    title="Reset adjustments"
                  >
                    Reset
                  </Button>
                </div>

                {/* Crop region explanation */}
                <div className="px-4 pb-1">
                  <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5" />
                    Select the exact text region (drag the highlighted box). The sample is cropped from this area.
                  </p>
                </div>

                {/* Crop select handles dynamically */}
                <CropSelector
                  imgSrc={uploadedImage}
                  region={cropRegion}
                  onChange={setCropRegion}
                />

                <div className="px-4 py-3 border-t border-border-light flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs font-mono text-text-muted truncate max-w-[180px]">{imageFileName}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => { prepareSample(); }}
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      className="min-h-[44px]"
                      title="Preview the cropped sample"
                    >
                      Preview crop
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAnalyzeSample}
                      disabled={!!process}
                      variant="primary"
                      size="md"
                      leftIcon={process ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      className="min-h-[48px]"
                    >
                      {process ? process.stage : "Identify Font"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!uploadedImage && (
              <div className="bg-brand-accent/5 border border-brand-accent/25 p-4 rounded-xl flex items-start gap-2.5 text-xs text-text-sub">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent" />
                <span>
                  Everything runs locally in your browser. Your image is never uploaded. Crop the exact text, adjust brightness or rotation if needed, then identify the font.
                </span>
              </div>
            )}
          </div>

          {/* Right: sample + results */}
          <div className="flex flex-col gap-4">
            {preparedSample && !process && (
              <div className="bg-surface-base border border-border-light rounded-2xl p-4 shadow-premium-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
                    <Crop className="w-4 h-4 text-brand-primary" /> Your sample
                  </h3>
                  <button onClick={() => setPreparedSample(null)} className="text-xs text-text-muted hover:text-brand-primary cursor-pointer ml-auto">Clear</button>
                </div>
                <img src={preparedSample} alt="Cropped sample to identify" className="w-full max-h-[120px] object-contain border border-border-light rounded-lg" style={{ imageRendering: "auto" }} />
                {detectedSignals && detectedSignals.charCount > 0 && (
                  <p className="text-[11px] font-mono text-text-muted mt-2">~{detectedSignals.charCount} characters detected</p>
                )}
              </div>
            )}

            {/* Progress */}
            {process && (
              <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm" role="status" aria-live="polite">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                  <span className="font-sans font-bold text-sm text-text-main">{process.stage}</span>
                </div>
                <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${process.progress}%` }} />
                </div>
                <p className="text-xs font-mono text-text-muted mt-2">{process.progress}%</p>
              </div>
            )}

            {/* Error */}
            {processError && !process && (
              <div className="bg-status-error/5 border border-status-error/25 rounded-2xl p-5 shadow-premium-sm" role="alert">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-status-error" />
                  <h3 className="font-sans font-bold text-sm text-text-main">Couldn't identify this sample.</h3>
                </div>
                <p className="text-xs text-text-sub">Try a clearer crop, a larger selection, or a higher-contrast image.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => setProcessError(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-muted border border-border-light text-text-main hover:text-brand-primary cursor-pointer">Try again</button>
                  <button onClick={() => { setUploadedImage(null); setMatchResults([]); setPreparedSample(null); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-muted border border-border-light text-text-main hover:text-brand-primary cursor-pointer">Upload another image</button>
                </div>
              </div>
            )}

            {/* Detected characteristics */}
            {detectedSignals && !process && (
              <SignalsPanel signals={detectedSignals} />
            )}

            {/* Results */}
            {matchResults.length > 0 && !process && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
                    <Search className="w-4 h-4 text-brand-primary" /> Candidate fonts
                  </h3>
                  <span className="text-[11px] text-text-muted">Ranked by visual similarity — not exact identification</span>
                </div>
                {imageConfidenceNote && (
                  <p className="text-[11px] text-text-muted flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-primary" /> {imageConfidenceNote}
                  </p>
                )}
                {renderMatchRow(matchResults[0], true)}
                {matchResults.slice(1).length > 0 && (
                  <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2 pt-2">
                    <Search className="w-4 h-4 text-brand-primary" /> Other candidates
                  </h3>
                )}
                {matchResults.slice(1).map((r) => renderMatchRow(r))}
                {matchResults[0]?.confidence === "similar" && (
                  <div className="bg-brand-accent/5 border border-brand-accent/25 p-4 rounded-xl text-xs text-text-sub flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent" />
                    <span>
                      <strong className="text-text-main">Only similar fonts found.</strong> For stylized or connected lettering an exact match may be unreliable. Crop one word, or one letter, for a sharper result.
                    </span>
                  </div>
                )}
              </div>
            )}

            {!preparedSample && !process && !matchResults.length && !processError && (
              <div className="bg-brand-accent/5 border border-brand-accent/25 p-4 rounded-xl flex items-start gap-2.5 text-xs text-text-sub">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent" />
                <span>
                  Upload a screenshot, poster, logo or UI image. Use the crop box to select the exact text, adjust rotation/brightness if needed, then press <strong>Identify Font</strong>. Results are ranked and labelled by confidence.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PDF MODE ================= */}
      {viewMode === "pdf" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: upload + page */}
          <div className="flex flex-col gap-4">
            {!pdfDoc ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center transition-all min-h-[260px] cursor-pointer ${
                  isDragOver ? "border-brand-primary bg-brand-primary-light/30" : "border-border-medium hover:border-brand-primary hover:bg-surface-muted/20"
                }`}
                onClick={() => pdfInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) handlePdfUpload(e.dataTransfer.files[0]); }}
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  aria-label="Upload PDF to identify fonts"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
                />
                <div className="w-16 h-16 rounded-2xl bg-brand-primary-light flex items-center justify-center border border-brand-primary/15 text-brand-primary">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-sans font-bold text-base text-text-main">Upload a PDF to detect its fonts</p>
                  <p className="text-sm text-text-muted mt-1">Embedded font metadata is read first; scanned pages fall back to visual matching.</p>
                  <p className="text-xs text-text-disabled mt-2">Handled 100% locally — your file never leaves the browser.</p>
                </div>
              </div>
            ) : (
              <div className="bg-surface-base border border-border-light rounded-2xl overflow-hidden shadow-premium-sm">
                <div className="px-4 py-3 border-b border-border-light flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-text-muted truncate max-w-[200px]">{pdfFileName}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changePdfPage(currentPage - 1)} disabled={currentPage <= 1 || !!pdfProcess} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-muted border border-border-light text-text-main hover:text-brand-primary disabled:opacity-40 cursor-pointer" aria-label="Previous page">‹</button>
                    <span className="text-xs font-mono text-text-main">Page {currentPage} / {pageCount}</span>
                    <button onClick={() => changePdfPage(currentPage + 1)} disabled={currentPage >= pageCount || !!pdfProcess} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-muted border border-border-light text-text-main hover:text-brand-primary disabled:opacity-40 cursor-pointer" aria-label="Next page">›</button>
                    <button onClick={clearPdf} aria-label="Remove PDF" className="w-7 h-7 rounded-lg border border-border-light text-text-muted hover:text-status-error hover:border-status-error/30 flex items-center justify-center cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {pdfProcess && (
                  <div className="px-4 py-3 flex items-center gap-3 text-xs text-text-main" role="status">
                    <Loader2 className="w-4 h-4 text-brand-primary animate-spin" /> {pdfProcess.stage}
                  </div>
                )}
                <div className="bg-background">
                  {pdfPreview ? (
                    <img src={pdfPreview} alt={`Preview of PDF page ${currentPage}`} className="w-full max-h-[420px] object-contain" />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-sm text-text-muted">Rendering…</div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-border-light flex flex-wrap items-center gap-2">
                  {pdfDetectionMethod === "visual" && (
                    <button onClick={detectPdfVisually} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-brand-primary text-[#FAF8F1] hover:bg-brand-primary-hover cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Re-run visual detection
                    </button>
                  )}
                  {pdfDetectionMethod !== "visual" && (
                    <button onClick={detectPdfVisually} disabled={!pdfPreview || !!pdfProcess} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-brand-primary text-[#FAF8F1] hover:bg-brand-primary-hover disabled:opacity-50 cursor-pointer">
                      <SearchCheck className="w-3.5 h-3.5" /> Visually detect fonts on this page
                    </button>
                  )}
                  <span className="text-[11px] text-text-muted ml-auto">Fonts read from this PDF's embedded metadata when available.</span>
                </div>
              </div>
            )}
            {pdfError && (
              <div className="bg-status-error/5 border border-status-error/25 rounded-2xl p-4 text-xs text-status-error flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {pdfError}
              </div>
            )}
          </div>

          {/* Right: extracted fonts + results */}
          <div className="flex flex-col gap-4">
            {pdfDoc && (
              <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm space-y-3">
                <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-primary" /> Fonts on page {currentPage}
                </h3>
                {pdfDetectionMethod === "embedded" && embeddedFonts.length > 0 && (
                  <>
                    <p className="text-[11px] text-status-success flex items-center gap-1.5 bg-status-success/5 border border-status-success/20 rounded-lg px-2.5 py-1.5 w-fit">
                      <BadgeCheck className="w-3.5 h-3.5" /> Embedded font detected (read from PDF metadata)
                    </p>
                    <ul className="space-y-2">
                      {embeddedFonts.map((f, i) => (
                        <li key={i} className="p-3 rounded-xl bg-surface-muted/60 border border-border-light flex items-center justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-text-main break-words">{f.name || f.fallbackName || "Embedded font"}</p>
                            {f.fallbackName && f.fallbackName !== f.name && (
                              <p className="text-[11px] text-text-muted">fallback: {f.fallbackName}</p>
                            )}
                            {(f.italic || f.weight) && (
                              <p className="text-[11px] text-text-muted">
                                {f.italic ? "Italic" : "Regular"}
                                {f.weight ? ` · weight ${f.weight}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => copyText(f.name || f.fallbackName || "", "Font name")} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary cursor-pointer"><Copy className="w-3 h-3" /> Copy</button>
                            <button onClick={() => { if (f.name) { setSelectedId(f.name); setSelectedFromDetection(true); setViewMode("catalog"); } }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary text-[#FAF8F1] cursor-pointer"><Search className="w-3 h-3" /> Find</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {pdfDetectionMethod === "visual" && (
                  <p className="text-[11px] text-brand-primary flex items-center gap-1.5 bg-brand-primary-light/20 border border-brand-primary/20 rounded-lg px-2.5 py-1.5 w-fit">
                    <SearchCheck className="w-3.5 h-3.5" /> Visually matched font — based on rendered page text, not embedded metadata
                  </p>
                )}
                {pdfDetectionMethod === "none" && (
                  <p className="text-[11px] text-text-muted">
                    No embedded font metadata looked up yet. Choose <strong>Visually detect fonts</strong> to match by letter shapes.
                  </p>
                )}
              </div>
            )}

            {/* Shared results panel (from visual detection) */}
            {matchResults.length > 0 && viewMode === "pdf" && !pdfProcess && (
              <PdfResults
                results={matchResults}
                displayText={displayText}
                onPreview={(id) => { setSelectedId(id); setViewMode("catalog"); }}
                onCompare={(id) => toggleCompare(id)}
                compareIds={compareIds}
                onCopyCss={(family) => copyFontDecl(family)}
                onSelectAlt={(id) => { setSelectedId(id); setViewMode("catalog"); }}
                detectedSignals={detectedSignals}
              />
            )}

            {!pdfDoc && (
              <div className="bg-brand-accent/5 border border-brand-accent/25 p-4 rounded-xl flex items-start gap-2.5 text-xs text-text-sub">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent" />
                <span>
                  For PDFs with embedded fonts, the real font metadata is read directly for accuracy. For scanned or image-only PDFs, the page is rendered and matched visually.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CATALOG / SEARCH MODE ================= */}
      {viewMode === "catalog" && (
        <CatalogView
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          freeOnly={freeOnly}
          setFreeOnly={setFreeOnly}
          showCommercial={showCommercial}
          setShowCommercial={setShowCommercial}
          filteredFonts={filteredFonts}
          visibleCommercial={visibleCommercial}
          selected={selected}
          setSelectedId={(id) => { setSelectedId(id); setSelectedFromDetection(true); }}
          compareIds={compareIds}
          toggleCompare={toggleCompare}
          compareFonts={compareFonts}
          showCompare={showCompare}
          setShowCompare={setShowCompare}
          selectedCommercial={selectedCommercial}
          selectedFreeAlt={selectedFreeAlt}
          previewText={previewText}
          setPreviewText={setPreviewText}
          fontSize={fontSize}
          setFontSize={setFontSize}
          weight={weight}
          setWeight={setWeight}
          letterSpacing={letterSpacing}
          setLetterSpacing={setLetterSpacing}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          onCopyCSS={handleCopyCSS}
          onCopyImport={copyImportSnippet}
          onCopyFamily={copyFamilyDecl}
          copyText={copyText}
          googleStatus={googleStatus}
          googleLoaded={googleLoaded}
          selectedFromDetection={selectedFromDetection}
        />
      )}

      {/* Educational / supporting SEO content */}
      <SupportContent />
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

function ConfidenceBadge({ confidence, hasText, charCount }: { confidence: Confidence; hasText: boolean; charCount: number }) {
  const map: Record<Confidence, { label: string; cls: string; subtext?: string }> = {
    strong: { label: "Likely match", cls: "bg-brand-primary text-[#FAF8F1]", subtext: "Strong visual match" },
    good: { label: "Possible match", cls: "bg-secondary text-[#FAF8F1] bg-[#D4A845]", subtext: "Moderate visual match" },
    similar: { label: "Similar font", cls: "bg-surface-muted text-text-sub border border-border-light", subtext: hasText && charCount > 0 ? "Weak visual match" : "Insufficient evidence" },
  };
  const m = map[confidence];
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${m.cls}`} title={m.subtext}>
      {m.label}
      {m.subtext && <span className="ml-1 opacity-80">({m.subtext})</span>}
    </span>
  );
}

function SignalsPanel({ signals }: { signals: DetectedSignals }) {
  const chips: string[] = [];
  if (signals.inkRatio > 0.32) chips.push("Heavy / bold letterforms");
  else if (signals.inkRatio < 0.16) chips.push("Light / thin strokes");
  else chips.push("Balanced stroke weight");
  if (signals.isCondensed) chips.push("Condensed");
  else if (signals.isWide) chips.push("Wide / expanded");
  if (signals.serifLikely) chips.push("Serif construction");
  else if (signals.charCount >= 4) chips.push("Sans-serif construction");
  else chips.push("Construction unclear");
  if (signals.handwritingLikely) chips.push("Connected / script forms");
  if (signals.allCaps) chips.push("All-caps display");
  if (signals.charCount > 0) chips.push(`${signals.charCount} characters read`);
  return (
    <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm space-y-3">
      <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-brand-primary" /> Detected letter characteristics
      </h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((c, i) => (
          <span key={i} className="px-3 py-1.5 rounded-full bg-brand-primary-light border border-brand-primary/15 text-xs font-semibold text-brand-primary">{c}</span>
        ))}
      </div>
    </div>
  );
}

function FindAltLink({ family, onSelect }: { family: string; onSelect: (id: string) => void }) {
  const { commercial, free } = freeAlternativesForCommercial(family);
  if (!commercial || free.length === 0) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(commercial.id); }}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-secondary-light border border-secondary/30 text-text-sub hover:text-brand-primary cursor-pointer"
      title={`${free.length} free alternatives for ${family}`}
    >
      <Tags className="w-3 h-3" /> Free alternative
    </button>
  );
}

// --- Crop selector overlay ---
function CropSelector({ imgSrc, region, onChange }: { imgSrc: string; region: Region; onChange: (r: Region) => void }) {
  const drag = useRef<{ mode: "move" | "nwse" | "nesw" | "n" | "s" | "e" | "w"; startX: number; startY: number; orig: Region } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 300 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { setSize({ w: el.clientWidth, h: el.clientHeight }); });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  const onPointerDown = (mode: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { mode: mode as any, startX: e.clientX, startY: e.clientY, orig: { ...region } };
    setDragOver(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.startX) / Math.max(size.w, 1);
    const dy = (e.clientY - drag.current.startY) / Math.max(size.h, 1);
    const o = drag.current.orig;
    const m = drag.current.mode;
    const nx = clamp(o.x + (m === "move" ? dx : m === "nwse" || m === "w" || m === "nesw" ? dx : 0));
    const ny = clamp(o.y + (m === "move" ? dy : m === "nwse" || m === "n" || m === "nesw" ? dy : 0));
    const nw = clamp(o.w + (m === "move" || m === "e" ? dx : m === "nwse" ? -dx : m === "nesw" ? dx : 0));
    const nh = clamp(o.h + (m === "move" || m === "s" ? dy : m === "nwse" ? -dy : m === "nesw" ? dy : 0));
    onChange({
      x: nx,
      y: ny,
      w: m === "move" ? o.w : Math.max(0.04, Math.min(1 - nx, nw)),
      h: m === "move" ? o.h : Math.max(0.04, Math.min(1 - ny, nh)),
    });
  };

  const onPointerUp = () => { drag.current = null; setDragOver(false); };

  const R = {
    left: `${region.x * 100}%`,
    top: `${region.y * 100}%`,
    width: `${region.w * 100}%`,
    height: `${region.h * 100}%`,
  };

  return (
    <div
      ref={boxRef}
      className={`relative w-full h-64 bg-cover bg-no-repeat select-none ${dragOver ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ backgroundImage: `url(${imgSrc})`, backgroundPosition: "center", backgroundSize: "contain", backgroundColor: "var(--background)" }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="application"
      aria-label="Crop region selection — drag the box to choose the text area"
    >
      {/* Dimmed overlay outside selection: four strips around the clear box */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-black/40" style={{ left: 0, top: 0, right: 0, height: `${region.y * 100}%` }} />
        <div className="absolute bg-black/40" style={{ left: 0, bottom: 0, right: 0, height: `${(1 - region.y - region.h) * 100}%` }} />
        <div className="absolute bg-black/40" style={{ left: 0, top: `${region.y * 100}%`, bottom: `${(1 - region.y - region.h) * 100}%`, width: `${region.x * 100}%` }} />
        <div className="absolute bg-black/40" style={{ right: 0, top: `${region.y * 100}%`, bottom: `${(1 - region.y - region.h) * 100}%`, width: `${(1 - region.x - region.w) * 100}%` }} />
      </div>
      {/* Selection box */}
      <div
        style={{ ...R, position: "absolute", border: "2px solid var(--brand-primary, #4F6F2F)", boxShadow: "0 0 0 1px rgba(0,0,0,0.2)" }}
        onPointerDown={onPointerDown("move")}
      >
        {/* Handles - 44px minimum touch target */}
        <div className="absolute -top-3 -left-3 w-11 h-11 bg-brand-primary cursor-nwse-resize" onPointerDown={onPointerDown("nwse")} style={{ touchAction: "none" }} />
        <div className="absolute -top-3 -right-3 w-11 h-11 bg-brand-primary cursor-nesw-resize" onPointerDown={onPointerDown("nesw")} style={{ touchAction: "none" }} />
        <div className="absolute -bottom-3 -left-3 w-11 h-11 bg-brand-primary cursor-nesw-resize" onPointerDown={onPointerDown("nesw")} style={{ touchAction: "none" }} />
        <div className="absolute -bottom-3 -right-3 w-11 h-11 bg-brand-primary cursor-nwse-resize" onPointerDown={onPointerDown("nwse")} style={{ touchAction: "none" }} />
      </div>
    </div>
  );
}

// --- PDF results panel ---
function PdfResults(props: {
  results: MatchResult[];
  displayText: string;
  onPreview: (id: string) => void;
  onCompare: (id: string) => void;
  compareIds: string[];
  onCopyCss: (family: string) => void;
  onSelectAlt: (id: string) => void;
  detectedSignals: DetectedSignals | null;
}) {
  const { results, displayText, detectedSignals } = props;
  return (
    <div className="space-y-3">
      <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
        <SearchCheck className="w-4 h-4 text-brand-primary" /> Visually matched fonts
      </h3>
      {results.map(({ font, confidence }) => (
        <div key={font.id} className="rounded-xl border border-border-light bg-surface-base p-4 shadow-premium-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-lg text-text-main break-words" style={{ fontFamily: `'${font.family}', sans-serif` }}>
              {displayText.split(" ").slice(0, 4).join(" ") || font.family}
            </span>
            <ConfidenceBadge confidence={confidence} hasText={detectedSignals?.hasText ?? false} charCount={detectedSignals?.charCount ?? 0} />
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-bold text-text-main break-words min-w-0">{font.family}</span>
            <span className="text-[11px] text-text-muted whitespace-nowrap">{font.category} · {font.free ? "Free" : "Paid"}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button onClick={() => props.onPreview(font.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary text-[#FAF8F1] cursor-pointer"><Eye className="w-3 h-3" /> Preview</button>
            <button onClick={() => props.onCompare(font.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary cursor-pointer"><Layers className="w-3 h-3" /> {props.compareIds.includes(font.id) ? "Compared" : "Compare"}</button>
            <button onClick={() => props.onCopyCss(font.family)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary cursor-pointer"><Copy className="w-3 h-3" /> Copy CSS</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Catalog view (search + preview + compare + details + alternatives) ---
interface CatalogViewProps {
  query: string; setQuery: (q: string) => void;
  category: (typeof CATEGORIES)[number]; setCategory: (c: (typeof CATEGORIES)[number]) => void;
  freeOnly: boolean; setFreeOnly: (b: boolean) => void;
  showCommercial: boolean; setShowCommercial: (b: boolean) => void;
  filteredFonts: EnrichedFont[];
  visibleCommercial: (typeof COMMERCIAL_FONTS)[number][];
  selected: EnrichedFont;
  setSelectedId: (id: string) => void;
  compareIds: string[]; toggleCompare: (id: string) => void;
  compareFonts: Array<FontEntry | (typeof COMMERCIAL_FONTS)[number]>;
  showCompare: boolean; setShowCompare: (b: boolean) => void;
  selectedCommercial: FontEntry | null | undefined;
  selectedFreeAlt: FontEntry[];
  previewText: string; setPreviewText: (s: string) => void;
  fontSize: number; setFontSize: (n: number) => void;
  weight: number; setWeight: (n: number) => void;
  letterSpacing: number; setLetterSpacing: (n: number) => void;
  lineHeight: number; setLineHeight: (n: number) => void;
  onCopyCSS: () => void; onCopyImport: () => void; onCopyFamily: () => void;
  copyText: (text: string, label: string) => void;
  googleStatus: "loading" | "live" | "local" | "error";
  googleLoaded: boolean;
  selectedFromDetection: boolean;
}

function CatalogView(p: CatalogViewProps) {
  const { selected } = p;
  const isCommercial = !selected.free || p.selectedCommercial != null;
  const isCmp = (id: string) => p.compareIds.includes(id);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [p.query, p.category, p.freeOnly, p.showCommercial]);

  return (
    <>
      {/* Controls bar */}
      <div className="bg-surface-base p-4 rounded-2xl border border-border-light shadow-premium-sm flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="search"
            value={p.query}
            onChange={(e) => p.setQuery(e.target.value)}
            placeholder="Search fonts — Inter, Roboto, serif, bold, condensed…"
            aria-label="Search fonts"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border-light rounded-xl text-text-main focus:border-brand-primary outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center" role="group" aria-label="Category filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => p.setCategory(cat)}
              aria-pressed={p.category === cat}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                p.category === cat ? "bg-brand-primary-light text-brand-primary border border-brand-primary" : "bg-surface-muted border border-border-light text-text-sub hover:bg-surface-base"
              }`}
            >
              {cat === "All" ? "All" : cat === "Sans-Serif" ? "Sans" : cat === "Monospace" ? "Mono" : cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => p.setFreeOnly(!p.freeOnly)}
            aria-pressed={p.freeOnly}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              p.freeOnly ? "bg-brand-primary text-[#FAF8F1]" : "bg-surface-muted border border-border-light text-text-sub hover:bg-surface-base"
            }`}
            title="Only show fonts free for commercial use"
          >
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Free fonts only</span>
          </button>
          <button
            onClick={() => p.setShowCommercial(!p.showCommercial)}
            aria-pressed={p.showCommercial}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              p.showCommercial ? "bg-secondary text-[#FAF8F1] bg-[#D4A845]" : "bg-surface-muted border border-border-light text-text-sub hover:bg-surface-base"
            }`}
            title="Show popular paid fonts with free alternatives"
          >
            Commercial with free alts
          </button>
          {p.compareIds.length > 0 && (
            <button
              onClick={() => p.setShowCompare(!p.showCompare)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary text-[#FAF8F1] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Layers className="w-3.5 h-3.5" /> Compare ({p.compareIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Google Fonts source status */}
      {p.googleStatus === "local" && (
        <div className="flex items-start gap-2 text-xs text-text-muted bg-surface-muted/40 border border-border-light rounded-xl px-4 py-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-primary" />
          <span>Using the built-in font index (the optional Google Fonts proxy is offline). Search &amp; preview still work fully.</span>
        </div>
      )}

      {/* Comparison Mode */}
      {p.showCompare && p.compareFonts.length > 0 && (
        <div className="bg-surface-base border border-brand-primary/30 rounded-2xl p-5 shadow-premium-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" /> Font Comparison
              <span className="text-[10px] font-mono text-text-muted">— same text, side by side</span>
            </h3>
            <button onClick={() => { p.setShowCompare(false); }} className="text-xs text-text-muted hover:text-status-error cursor-pointer">Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="py-2 pr-4 text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Font</th>
                  <th className="py-2 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Preview ({p.fontSize}px)</th>
                  <th className="py-2 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Category</th>
                  <th className="py-2 pl-4 text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Notes</th>
                </tr>
              </thead>
              <tbody>
                {p.compareFonts.map((font) => (
                  <tr key={font.id} className="border-b border-border-light/40 align-top">
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-text-main break-words">{font.family}</span>
                      <span className="block text-[10px] text-text-muted">by {font.designers}</span>
                    </td>
                    <td className="py-3 px-4 min-w-[220px]">
                      <span
                        className="block"
                        style={{ fontFamily: `'${font.family}', system-ui`, fontWeight: p.weight, fontSize: `${p.fontSize}px`, lineHeight: p.lineHeight, letterSpacing: `${p.letterSpacing}px` }}
                      >
                        {p.previewText || "Aa Bb Cc"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono text-text-muted">{font.category}</span>
                    </td>
                    <td className="py-3 pl-4">
                      <span className="text-xs text-text-sub break-words">{"traits" in font ? (font as FontEntry).traits.slice(0, 2).join(" · ") : (font as any).traits?.slice(0,2).join(" · ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={p.onCopyImport} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand-primary text-[#FAF8F1] hover:bg-brand-primary-hover cursor-pointer">
            <Copy className="w-3.5 h-3.5" /> Copy selected fonts CSS
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {p.filteredFonts.slice(0, visibleCount).map((font) => {
          const isSel = font.id === p.selected.id;
          return (
            <div
              key={font.id}
              onClick={() => p.setSelectedId(font.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  p.setSelectedId(font.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
                isSel ? "bg-brand-primary-light/40 border-brand-primary/40 shadow-sm ring-1 ring-brand-primary/30" : "bg-surface-base border-border-light hover:border-brand-primary/30"
              }`}
            >
              <span className="block text-lg text-text-main break-words leading-snug" style={{ fontFamily: `'${font.family}', system-ui`, fontWeight: p.weight }}>
                {p.previewText.split(" ").slice(0, 3).join(" ") || font.family}
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block font-bold text-[13px] text-text-main break-words">{font.family}</span>
                  <span className="block text-[11px] text-text-muted truncate">{font.designers} · {font.category}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); p.toggleCompare(font.id); }}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${isCmp(font.id) ? "bg-brand-primary text-[#FAF8F1]" : "bg-surface-muted hover:bg-brand-primary-light text-text-muted hover:text-brand-primary border border-border-light"}`}
                    title={isCmp(font.id) ? "Remove from comparison" : "Add to comparison"}
                    aria-label={isCmp(font.id) ? "Remove from comparison" : "Add to comparison"}
                  >
                    <Layers className="w-3 h-3" />
                  </button>
                </div>
              </span>
              <span className="text-[11px] text-text-sub leading-relaxed line-clamp-2">{font.bestFor}</span>
            </div>
          );
        })}
        {p.filteredFonts.length === 0 && p.visibleCommercial.length === 0 && (
          <div className="col-span-full bg-surface-base p-8 rounded-2xl border border-border-light text-center text-sm text-text-muted">
            No fonts match "{p.query}". Try a broader term like "serif", "mono" or a weight.
          </div>
        )}
      </div>
      {p.filteredFonts.length > visibleCount && (
        <button
          onClick={() => setVisibleCount((c) => c + 24)}
          className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-border-light bg-surface-base px-4 text-sm font-bold text-text-main hover:border-brand-primary/40 hover:text-brand-primary transition-colors cursor-pointer"
        >
          Show more ({p.filteredFonts.length - visibleCount} remaining)
        </button>
      )}

      {/* Commercial fonts section */}
      {p.visibleCommercial.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-sans font-bold text-sm text-text-main">Popular paid fonts with free alternatives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {p.visibleCommercial.map((font) => {
              const alt = freeAlternativesForCommercial(font.family).free;
              return (
                <button
                  key={font.id}
                  onClick={() => p.setSelectedId(font.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${selected.id === font.id ? "bg-secondary-light/40 border-secondary/40 ring-1 ring-secondary/30" : "bg-surface-base border-border-light hover:border-secondary/30"}`}
                >
                  <span className="block text-2xl text-text-main break-words" style={{ fontFamily: `'${font.family}', Georgia, serif` }}>
                    {p.previewText.split(" ").slice(0, 3).join(" ") || font.family}
                  </span>
                  <span>
                    <span className="block font-bold text-sm text-text-main break-words">{font.family}</span>
                    <span className="block text-[11px] text-text-muted">Paid font</span>
                  </span>
                  {alt.length > 0 && (
                    <span className="text-[11px] text-text-sub">
                      <span className="font-bold text-brand-primary">Free alternative:</span> {alt.map((a) => a.family).slice(0, 3).join(", ")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Preview */}
        <div className="bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
          <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-primary" /> Live Preview{isCommercial ? " — paid font" : ""}
          </h3>

          <input
            type="text"
            value={p.previewText}
            onChange={(e) => p.setPreviewText(e.target.value)}
            placeholder="Type custom text to preview…"
            aria-label="Preview text"
            className="p-2.5 text-sm bg-surface-muted border border-border-light rounded-lg text-text-main font-medium outline-none focus:border-brand-primary w-full"
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              Size
              <input type="range" min={12} max={96} value={p.fontSize} onChange={(e) => p.setFontSize(Number(e.target.value))} className="accent-brand-primary w-24" aria-label="Font size" />
              <span className="font-mono w-9 text-right">{p.fontSize}px</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Bold className="w-3.5 h-3.5" /> Weight
              <select value={p.weight} onChange={(e) => p.setWeight(Number(e.target.value))} className="bg-surface-muted border border-border-light rounded-lg px-2 py-1.5 text-xs text-text-main outline-none cursor-pointer" aria-label="Font weight">
                {[100,200,300,400,500,600,700,800,900].map((w) => (
                  <option key={w} value={w}>{w}{(selected.weights.length && !selected.weights.includes(w)) ? " (n/a)" : ""}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              Spacing
              <input type="range" min={-3} max={12} step={0.5} value={p.letterSpacing} onChange={(e) => p.setLetterSpacing(Number(e.target.value))} className="accent-brand-primary w-20" aria-label="Letter spacing" />
              <span className="font-mono w-8 text-right">{p.letterSpacing}px</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              Line height
              <input type="range" min={1} max={2} step={0.05} value={p.lineHeight} onChange={(e) => p.setLineHeight(Number(e.target.value))} className="accent-brand-primary w-20" aria-label="Line height" />
              <span className="font-mono w-9 text-right">{p.lineHeight}</span>
            </label>
          </div>

          <div className="p-6 rounded-xl bg-surface-muted/50 border border-border-light overflow-hidden min-h-[110px] flex items-center">
            <p
              className="text-text-main break-words leading-snug m-0 w-full"
              style={{
                fontFamily: `'${selected.family}', system-ui`,
                fontSize: `${p.fontSize}px`,
                fontWeight: p.weight,
                letterSpacing: `${p.letterSpacing}px`,
                lineHeight: p.lineHeight,
              }}
            >
              {p.previewText || "GainUtility"}
            </p>
          </div>

          {/* Quick previews */}
          <div className="flex flex-wrap gap-2">
            {["Design faster.", "The quick brown fox", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "GainUtility Pro"].map((text) => (
              <button key={text} onClick={() => p.setPreviewText(text)} className="px-3 py-1.5 rounded-lg text-[11px] font-mono bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary hover:border-brand-primary/20 transition-all cursor-pointer">
                {text.length > 22 ? text.slice(0, 20) + "…" : text}
              </button>
            ))}
          </div>

          {/* Export actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={p.onCopyCSS} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary text-[#FAF8F1] text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer">
              <Copy className="w-4 h-4" /> Copy CSS
            </button>
            <button onClick={p.onCopyImport} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-light text-sm font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer">
              <Copy className="w-4 h-4" /> @import
            </button>
            <button onClick={p.onCopyFamily} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-light text-sm font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer">
              <Copy className="w-4 h-4" /> font-family
            </button>
            <a href={`https://fonts.google.com/specimen/${encodeURIComponent(selected.family)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-light text-sm font-bold text-brand-primary hover:bg-surface-muted transition-colors">
              Open source <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Details & alternatives */}
        <div className="bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-text-main break-words">{selected.family}</h3>
              <p className="text-[11px] text-text-muted">by {selected.designers}</p>
            </div>
            {isCommercial && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-secondary-light text-text-sub border border-secondary/30 shrink-0">Paid font</span>
            )}
          </div>

          {/* Info table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <InfoRow label="Category" value={selected.category.toUpperCase()} />
            <InfoRow label="License" value={selected.license} />
            <InfoRow label="Free for commercial use" value={selected.free ? "Yes" : "No — license required"} />
            <InfoRow label="Weights" value={selected.weights.join(" · ") || "—"} />
            <InfoRow label="Subsets" value={(selected.subsets || ["latin"]).slice(0, 5).join(", ")} />
            <InfoRow label="Source" value={<a href={selected.source} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">{selected.source.replace("https://", "")}</a>} />
          </div>
          {selected.notes && selected.notes.length > 0 && (
            <p className="text-xs text-text-sub">{selected.notes[0]}</p>
          )}

          {/* Weights quick select */}
          {selected.weights && selected.weights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.weights.map((w) => (
                <button key={w} onClick={() => p.setWeight(w)} className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${p.weight === w ? "bg-brand-primary text-[#FAF8F1]" : "bg-surface-muted border border-border-light text-text-sub hover:text-brand-primary"}`}>{w}</button>
              ))}
            </div>
          )}

          {/* Traits */}
          {selected.traits && selected.traits.length > 0 && (
            <ul className="space-y-1.5">
              {selected.traits.slice(0, 4).map((t, i) => (
                <li key={i} className="text-xs text-text-sub flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-brand-primary shrink-0" />{t}</li>
              ))}
            </ul>
          )}

          {/* Free alternatives for commercial fonts */}
          {p.selectedCommercial && p.selectedFreeAlt.length > 0 && (
            <div className="pt-3 border-t border-border-light">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-brand-primary" /> Closest free alternatives
              </h4>
              <div className="space-y-2">
                {p.selectedFreeAlt.slice(0, 4).map((fa) => (
                  <div key={fa.id} className="p-3 rounded-xl bg-surface-muted/60 border border-border-light flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main" style={{ fontFamily: `'${fa.family}', sans-serif` }}>{fa.family}</p>
                      <p className="text-[10px] text-text-muted">{fa.category} · {fa.license}</p>
                    </div>
                    <button onClick={() => p.setSelectedId(fa.id)} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary text-[#FAF8F1] cursor-pointer">Open <ArrowRight className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {p.selectedCommercial && p.selectedFreeAlt.length === 0 && (
            <p className="text-[11px] text-text-muted">Licensing for this font is not bundled. Verify on the source before reusing commercially.</p>
          )}
          {selected.license === "License information unavailable" && (
            <p className="text-[11px] text-text-muted">License information unavailable.</p>
          )}

          {/* Pairings */}
          <div className="pt-3 border-t border-border-light">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> Suggested pairings
            </h4>
            <div className="space-y-2.5">
              {PAIRINGS.filter((x) => x.heading === selected.family || x.body === selected.family).concat(PAIRINGS.slice(0, 3)).filter((v, i, a) => a.findIndex((x) => x.heading === v.heading && x.body === v.body) === i).slice(0, 4).map((pair) => (
                <div key={`${pair.heading}-${pair.body}`} className="p-3 rounded-xl bg-surface-muted/60 border border-border-light">
                  <p className="text-xs">
                    <span className="font-bold text-text-main" style={{ fontFamily: `'${pair.heading}', serif` }}>{pair.heading}</span>
                    <span className="text-text-muted mx-1.5">×</span>
                    <span className="font-semibold text-text-sub" style={{ fontFamily: `'${pair.body}', sans-serif` }}>{pair.body}</span>
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{pair.note}</p>
                </div>
              ))}
            </div>
          </div>

          {p.selectedFromDetection && (
            <div className="flex items-start gap-2 text-[11px] text-text-muted bg-brand-primary-light/20 border border-brand-primary/15 rounded-xl px-3 py-2">
              <SearchComplete className="w-4 h-4 shrink-0 text-brand-primary" />
              <span>Selected from your image/PDF detection result.</span>
            </div>
          )}
          {!p.googleLoaded && (
            <p className="text-[11px] text-text-muted">Font render files still loading.</p>
          )}
        </div>
      </div>
    </>
  );
}

function SearchComplete({ className }: { className?: string }) {
  return <Sparkles className={className} />;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-surface-muted/50 border border-border-light/50">
      <p className="text-[10px] font-mono uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-xs font-semibold text-text-main mt-0.5 break-words min-w-0">{value}</p>
    </div>
  );
}

// ============================================================================
// Supporting SEO / educational content (natural, concise, genuinely useful)
// ============================================================================

function SupportContent() {
  return (
    <section className="mt-4 flex flex-col gap-8 border-t border-border-light pt-8">
      <div className="max-w-3xl">
        <h2 className="font-sans font-black text-xl md:text-2xl text-text-main tracking-tight">Identify and extract fonts from images, logos and PDFs</h2>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          GainUtility's Font Finder is a privacy-first typography utility. It identifies fonts from screenshots, posters, logos, UI images, scanned documents and PDF pages — then helps you preview, compare, find free alternatives and copy CSS. Everything runs locally in your browser; your files are never uploaded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SupportCard
          icon={<ImageIcon className="w-4 h-4" />}
          title="How to identify a font from an image"
          body={["Upload a screenshot, poster or logo of the text you want to identify.", "Drag the crop box to select the exact text region. Rotate it if the text is angled.", "Adjust brightness/contrast if the letters are low contrast against the background.", "Press Identify Font — the tool reads the text, analyzes letter shapes (weight, width vs height, baseline structure, serifs), and returns ranked candidates labelled Likely / Possible / Similar match.", "Beware: stylized or connected lettering rarely matches exactly — expect 'Similar fonts found' for those and refine by cropping a single word or letter."]}
        />
        <SupportCard
          icon={<FileText className="w-4 h-4" />}
          title="How to identify fonts in a PDF"
          body={["Upload your PDF and pick the page with the type you want to inspect.", "If the PDF embeds real font metadata, the exact family and weight/style is read straight from the file — labelled 'Embedded font detected'.", "For scanned or image-only PDFs, the page is rendered and the letters are matched visually — labelled 'Visually matched font'.", "Use your text-based PDFs to get the precise embedded answer; images-only PDFs get a best-effort visual match."]}
        />
        <SupportCard
          icon={<Tags className="w-4 h-4" />}
          title="How to find a free alternative to a paid font"
          body={["Open any detected or searched font result.", "For commercial faces such as Helvetica Neue, Futura or Proxima Nova, the info panel lists closest free alternatives (e.g. Inter, Roboto, Montserrat).", "Wording reflects similarity honestly — 'Closest free alternative' means close but not identical.", "Each alternative shows its license so you can confirm it's safe for commercial use."]}
        />
        <SupportCard
          icon={<SearchCheck className="w-4 h-4" />}
          title="How font matching works"
          body={["The matcher reads visible text with OCR, then measures real signals: stroke weight (ink density), character width vs height (condensation), uppercase share, baseline run structure, and serif vs sans construction.", "It ranks the curated catalog by how many of those signals each font shares.", "Confidence is shown honestly — you'll see Likely match, Possible match or Similar font based on how many signals agree and how close the top candidates are; no exact-match claim is made from weak evidence.", "Hand-drawn scripts, connecting lettering and one-off logos almost always resolve to 'similar fonts' — never a false exact claim."]}
        />
        <SupportCard
          icon={<Check className="w-4 h-4" />}
          title="Free fonts and commercial fonts"
          body={["Free fonts (Google Fonts and other open sources) are licensed for commercial use, typically under the SIL Open Font License or Apache License.", "Commercial / paid fonts require a license from the foundry before reuse in products or client work.", "When licensing data is reliable it is shown; otherwise you'll see 'License information unavailable' rather than a guess.", "The 'Free fonts only' toggle surfaces matches you can legally use right away."]}
        />
        <SupportCard
          icon={<Copy className="w-4 h-4" />}
          title="Exporting fonts to CSS"
          body={["Pick a font and use Copy CSS, @import or font-family to drop it straight into a stylesheet.", "Example: .font-style { font-family: 'Inter', sans-serif; font-weight: 500; }", "Font extraction here means identifying metadata, family names and CSS, not redistributing proprietary font files."]}
        />
      </div>
    </section>
  );
}

function SupportCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string[] }) {
  return (
    <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm">
      <h3 className="font-sans font-bold text-sm text-text-main flex items-center gap-2 mb-2">
        <span className="text-brand-primary">{icon}</span> {title}
      </h3>
      <ul className="space-y-1.5">
        {body.map((b, i) => (
          <li key={i} className="text-xs text-text-sub leading-relaxed flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-primary shrink-0" /> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
