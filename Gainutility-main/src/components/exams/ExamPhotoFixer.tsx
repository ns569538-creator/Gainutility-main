/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exam Photo Fixer — Rebuilt UX & Visual Workflow.
 *
 * Mental Model:
 * 1. Requirements (Compact summary + quick presets + custom toggle)
 * 2. Upload (Hero drag-and-drop zone, transforms into photo workspace)
 * 3. Adjust (Interactive crop with face guide, zero white borders)
 * 4. Fix & Download (Clear progress, PASS/FAIL checks, download hero)
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Wand2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sliders,
  UserCheck,
  Check,
  ArrowRight,
  RefreshCw,
  Search,
  ChevronDown,
  Settings2,
  FileCheck,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { Button, Card } from "../Common";
import {
  loadImageWithExif,
  fitAndCropToCanvas,
  compressToTargetRange,
  formatBytes,
  formatKB,
  triggerDownload,
  FormatTarget,
  CompressionResult,
} from "../../exams/imageEngine";
import { ExamPreset, DocumentRequirement } from "../../exams/examTypes";
import { searchExams, customPreset, EXAMS } from "../../exams/requirements";
import { assessCompliance, targetSummary, DetailedValidation } from "../../exams/validate";
import { StatusBadge, StatChip, Disclaimer } from "../../exams/examUi";
import { UniversalImageUpload } from "./UniversalImageUpload";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";

interface PhotoSourceState {
  file: File;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  size: number;
  format: string;
  dataUrl: string;
  orientation: number;
}

const POPULAR_PRESETS = [
  { id: "ssc-cgl", label: "SSC CGL" },
  { id: "upsc", label: "UPSC" },
  { id: "ibps", label: "IBPS" },
  { id: "sbi", label: "SBI" },
  { id: "rrb", label: "RRB" },
];

export default function ExamPhotoFixer({
  onAddToast,
}: {
  onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void;
}) {
  // Requirement state
  const [selectedExamId, setSelectedExamId] = useState<string>("ssc-cgl");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showMoreExams, setShowMoreExams] = useState(false);
  const [examSearch, setExamSearch] = useState("");

  // Custom specification inputs
  const [customWidth, setCustomWidth] = useState("200");
  const [customHeight, setCustomHeight] = useState("230");
  const [customMinKb, setCustomMinKb] = useState("20");
  const [customMaxKb, setCustomMaxKb] = useState("50");
  const [customFormat, setCustomFormat] = useState<"JPG" | "PNG" | "WebP">("JPG");

  // Uploaded photo state
  const [source, setSource] = useState<PhotoSourceState | null>(null);

  // Framing & crop state
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0); // -1.0 to 1.0
  const [panY, setPanY] = useState(0); // -1.0 to 1.0
  const [rotation, setRotation] = useState(0);
  const [showFaceGuide, setShowFaceGuide] = useState(true);

  // Processing & result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [processedResult, setProcessedResult] = useState<CompressionResult | null>(null);
  const [compliance, setCompliance] = useState<DetailedValidation | null>(null);

  // Framing canvas ref & drag handlers
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
  const resultRef = useRef<HTMLDivElement | null>(null);

  const postDownload = usePostDownload();

  const activeExam = EXAMS.find((e) => e.id === selectedExamId) || EXAMS[0];

  // Derive current effective requirement
  const getRequirement = useCallback((): DocumentRequirement => {
    if (isCustomMode) {
      return {
        document: "photo",
        formats: [customFormat],
        minKb: customMinKb ? Number(customMinKb) : undefined,
        maxKb: customMaxKb ? Number(customMaxKb) : 50,
        widthPx: Number(customWidth) || 200,
        heightPx: Number(customHeight) || 230,
        status: "needs_review",
      };
    }
    const photoReq = activeExam.requirements.find((r) => r.document === "photo");
    return (
      photoReq || {
        document: "photo",
        formats: ["JPG", "JPEG"],
        minKb: 20,
        maxKb: 50,
        widthPx: 200,
        heightPx: 230,
        status: "verified",
      }
    );
  }, [isCustomMode, activeExam, customWidth, customHeight, customMinKb, customMaxKb, customFormat]);

  const req = getRequirement();
  const targetWidth = req.widthPx || 200;
  const targetHeight = req.heightPx || 230;

  // Render framing canvas preview
  useEffect(() => {
    if (!source || !frameCanvasRef.current) return;
    const canvas = frameCanvasRef.current;
    const previewCanvas = fitAndCropToCanvas(source.canvas, targetWidth, targetHeight, {
      zoom,
      panX,
      panY,
      rotation,
    });

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(previewCanvas, 0, 0);
    }
  }, [source, targetWidth, targetHeight, zoom, panX, panY, rotation]);

  // Upload handler
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onAddToast("Please choose a valid photo file (JPG, PNG, or WebP).", "error");
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep("Reading photo and orientation…");
      const info = await loadImageWithExif(file);

      setSource({
        file,
        canvas: info.canvas,
        width: info.width,
        height: info.height,
        size: file.size,
        format: info.format,
        dataUrl: info.dataUrl,
        orientation: info.orientation,
      });

      // Reset framing adjustments
      setZoom(1.0);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setProcessedResult(null);
      setCompliance(null);
      setIsProcessing(false);
      onAddToast("Photo loaded. Frame your photo and click Fix Photo.", "info");
    } catch (err: any) {
      setIsProcessing(false);
      onAddToast(err.message || "Failed to load photo.", "error");
    }
  };

  // Main processing pipeline
  const handleFixPhoto = async () => {
    if (!source) return;

    try {
      setIsProcessing(true);
      setProcessingStep("1. Cropping to exact aspect ratio (no white bars)…");
      await new Promise((r) => setTimeout(r, 60));

      const croppedCanvas = fitAndCropToCanvas(source.canvas, targetWidth, targetHeight, {
        zoom,
        panX,
        panY,
        rotation,
      });

      setProcessingStep("2. Optimizing file size within target range…");
      await new Promise((r) => setTimeout(r, 60));

      let format: FormatTarget = "jpeg";
      const allowed = (req.formats || ["JPG"]).map((f) => f.toLowerCase());
      if (allowed.includes("png") && !allowed.includes("jpg") && !allowed.includes("jpeg")) {
        format = "png";
      } else if (allowed.includes("webp") && !allowed.includes("jpg")) {
        format = "webp";
      }

      const maxBytes = (req.maxKb ?? 50) * 1024;
      const minBytes = req.minKb ? req.minKb * 1024 : undefined;

      const result = await compressToTargetRange(croppedCanvas, {
        format,
        maxBytes,
        minBytes,
      });

      setProcessingStep("3. Checking all requirements…");
      await new Promise((r) => setTimeout(r, 40));

      const comp = assessCompliance(req, {
        size: result.size,
        width: result.width,
        height: result.height,
        format: result.format,
      });

      setProcessedResult(result);
      setCompliance(comp);
      setIsProcessing(false);

      if (comp.allPassed) {
        onAddToast("Photo is ready to upload!", "success");
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        onAddToast("Photo processed. Some requirements need attention.", "warning");
      }
    } catch (err: any) {
      setIsProcessing(false);
      onAddToast(err.message || "Processing failed.", "error");
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!processedResult) return;
    const kb = Math.round(processedResult.size / 1024);
    let filename = "GainUtility_Photo";

    if (!isCustomMode) {
      const cleanExam = activeExam.examName.replace(/[^a-zA-Z0-9]/g, "_");
      filename = `GainUtility_${cleanExam}_Photo_${kb}KB.jpg`;
    } else {
      filename = `GainUtility_Photo_${targetWidth}x${targetHeight}_${kb}KB.jpg`;
    }

    triggerDownload(processedResult.blob, filename);
    postDownload.show("Exam Photo Fixer");
    onAddToast(`Downloaded ${filename}`, "success");
  };

  // Drag handlers for framing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startDragPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startDragPos.current.x;
    const dy = e.clientY - startDragPos.current.y;
    const sensitivity = 0.006 / Math.max(1, zoom * 0.8);
    setPanX(Math.max(-1, Math.min(1, startDragPos.current.initialPanX + dx * sensitivity)));
    setPanY(Math.max(-1, Math.min(1, startDragPos.current.initialPanY + dy * sensitivity)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      startDragPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panX,
        initialPanY: panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startDragPos.current.x;
    const dy = e.touches[0].clientY - startDragPos.current.y;
    const sensitivity = 0.007 / Math.max(1, zoom * 0.8);
    setPanX(Math.max(-1, Math.min(1, startDragPos.current.initialPanX + dx * sensitivity)));
    setPanY(Math.max(-1, Math.min(1, startDragPos.current.initialPanY + dy * sensitivity)));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const resetAll = () => {
    setSource(null);
    setProcessedResult(null);
    setCompliance(null);
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  };

  const filteredExams = searchExams(examSearch);

  // Active step in mental model
  const activeStep = !source ? 2 : !processedResult ? 3 : 4;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ─── VISUAL WORKFLOW PROGRESS INDICATOR ─── */}
      <div className="bg-surface-base border border-border-light rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-text-muted">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 ${
              activeStep >= 1 ? "text-brand-primary font-bold" : ""
            }`}
          >
            <span
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                activeStep >= 1 ? "bg-brand-primary text-white" : "bg-surface-muted text-text-muted"
              }`}
            >
              1
            </span>
            <span>Requirements</span>
          </div>

          <span className="text-border-light text-xs">→</span>

          <div
            className={`flex items-center gap-1.5 sm:gap-2 ${
              activeStep >= 2 ? "text-brand-primary font-bold" : ""
            }`}
          >
            <span
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                activeStep >= 2 ? "bg-brand-primary text-white" : "bg-surface-muted text-text-muted"
              }`}
            >
              2
            </span>
            <span>Upload Photo</span>
          </div>

          <span className="text-border-light text-xs">→</span>

          <div
            className={`flex items-center gap-1.5 sm:gap-2 ${
              activeStep >= 3 ? "text-brand-primary font-bold" : ""
            }`}
          >
            <span
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                activeStep >= 3 ? "bg-brand-primary text-white" : "bg-surface-muted text-text-muted"
              }`}
            >
              3
            </span>
            <span>Adjust</span>
          </div>

          <span className="text-border-light text-xs">→</span>

          <div
            className={`flex items-center gap-1.5 sm:gap-2 ${
              activeStep >= 4 ? "text-status-success font-bold" : ""
            }`}
          >
            <span
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                activeStep >= 4 ? "bg-status-success text-white" : "bg-surface-muted text-text-muted"
              }`}
            >
              4
            </span>
            <span>Download</span>
          </div>
        </div>
      </div>

      {/* ─── 1. COMPACT REQUIREMENTS SUMMARY CARD ─── */}
      <div className="bg-surface-base border border-border-light rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-text-main">
                {!isCustomMode ? `${activeExam.examName} Photo Requirements` : "Custom Photo Requirements"}
              </h2>
              {!isCustomMode && <StatusBadge status={req.status} />}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {!isCustomMode
                ? `Official guidelines from ${activeExam.authority} (Verified ${activeExam.lastVerified})`
                : "User-defined requirements"}
            </p>
          </div>

          {/* Compact Target Spec Box */}
          <div className="flex items-center gap-3 bg-brand-primary-light/30 border border-brand-primary/20 px-3.5 py-2 rounded-xl text-xs">
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-mono">Size</span>
              <span className="font-bold text-brand-primary font-mono">
                {req.minKb ? `${req.minKb}–${req.maxKb} KB` : `≤ ${req.maxKb} KB`}
              </span>
            </div>
            <div className="w-px h-6 bg-brand-primary/20" />
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-mono">Dimensions</span>
              <span className="font-bold text-text-main font-mono">
                {req.widthPx} × {req.heightPx} px
              </span>
            </div>
            <div className="w-px h-6 bg-brand-primary/20" />
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-mono">Format</span>
              <span className="font-bold text-text-main font-mono">JPG / JPEG</span>
            </div>
          </div>
        </div>

        {/* Preset quick buttons & Search drawer */}
        {!isCustomMode && (
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Popular exams:</span>
            {POPULAR_PRESETS.map((p) => {
              const isSelected = selectedExamId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(p.id);
                    setProcessedResult(null);
                    setCompliance(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                      : "bg-surface-base border-border-light hover:border-brand-primary/50 text-text-main"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowMoreExams((s) => !s)}
              className="px-3 py-1.5 rounded-xl border border-border-light bg-surface-muted/50 hover:bg-surface-muted text-xs font-semibold text-text-main flex items-center gap-1 cursor-pointer"
            >
              <span>More exams</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreExams ? "rotate-180" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setProcessedResult(null);
              }}
              className="text-xs text-brand-primary hover:underline font-semibold ml-auto cursor-pointer"
            >
              Need custom settings?
            </button>
          </div>
        )}

        {/* Expanded 'More exams' search list */}
        {!isCustomMode && showMoreExams && (
          <div className="pt-2 border-t border-border-light space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="Search exam requirements..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-light bg-surface-base text-xs focus:border-brand-primary outline-none"
              />
            </div>
            <div className="max-h-36 overflow-y-auto border border-border-light rounded-xl divide-y divide-border-light bg-surface-base">
              {filteredExams.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(ex.id);
                    setShowMoreExams(false);
                    setExamSearch("");
                    setProcessedResult(null);
                    setCompliance(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-surface-muted flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-text-main">{ex.examName}</span>
                  <span className="text-text-muted text-[11px]">{ex.authority}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Settings Form */}
        {isCustomMode && (
          <div className="pt-2 border-t border-border-light space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Width (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs outline-none focus:border-brand-primary font-mono"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Height (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs outline-none focus:border-brand-primary font-mono"
                  placeholder="230"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Min KB</label>
                <input
                  type="number"
                  value={customMinKb}
                  onChange={(e) => setCustomMinKb(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs outline-none focus:border-brand-primary font-mono"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Max KB</label>
                <input
                  type="number"
                  value={customMaxKb}
                  onChange={(e) => setCustomMaxKb(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs outline-none focus:border-brand-primary font-mono"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Format:</span>
                {(["JPG", "PNG", "WebP"] as const).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="fmt"
                      checked={customFormat === fmt}
                      onChange={() => setCustomFormat(fmt)}
                      className="accent-brand-primary"
                    />
                    <span>{fmt}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-brand-primary hover:underline font-semibold cursor-pointer"
              >
                Back to Exam Presets
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. UPLOAD STATE / ACTIVE WORKSPACE ─── */}
      {!source ? (
        /* Empty Hero Upload Card */
        <UniversalImageUpload onFileSelected={handlePhotoUpload} />
      ) : (
        /* Uploaded Photo Workspace */
        <div className="bg-surface-base border border-border-light rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs">
          {/* Header with Photo Details & Change Photo button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-main text-sm truncate max-w-[200px] sm:max-w-xs">
                    {source.file.name}
                  </span>
                  <span className="text-[11px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
                    ✓ Photo loaded
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  {formatBytes(source.size)} • {source.width} × {source.height} px • {source.format.toUpperCase()}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={resetAll}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="py-2 px-3 text-xs self-start sm:self-auto cursor-pointer"
            >
              Change Photo
            </Button>
          </div>

          {/* Workspace: 2 Columns on Desktop, Single Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Interactive Framing Preview Canvas */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <div
                className="relative touch-none cursor-grab active:cursor-grabbing select-none border-2 border-brand-primary/40 rounded-xl overflow-hidden shadow-inner bg-surface-muted/40"
                style={{
                  width: `${Math.min(260, targetWidth)}px`,
                  height: `${Math.round((targetHeight / targetWidth) * Math.min(260, targetWidth))}px`,
                  maxHeight: "340px",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas ref={frameCanvasRef} className="w-full h-full object-cover block" />

                {/* Face Guide Overlay */}
                {showFaceGuide && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <svg viewBox="0 0 200 230" className="w-full h-full text-brand-primary/60 opacity-80">
                      <ellipse
                        cx="100"
                        cy="95"
                        rx="46"
                        ry="62"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeDasharray="4 3"
                      />
                      <line
                        x1="65"
                        y1="85"
                        x2="135"
                        y2="85"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1="80"
                        y1="157"
                        x2="120"
                        y2="157"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                    </svg>
                    <span className="absolute bottom-2 text-[10px] font-medium bg-black/60 text-white px-2 py-0.5 rounded-full">
                      Align face & eyes in oval
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-text-muted mt-2">
                Drag to center photo • Zero white margins
              </span>
            </div>

            {/* Right: Framing Controls & Primary Action */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-surface-muted/50 p-4 rounded-xl space-y-3.5 border border-border-light">
                <span className="text-xs font-bold text-text-main block">
                  Adjust Framing (Optional)
                </span>

                {/* Zoom control */}
                <div>
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </span>
                    <span className="font-mono text-brand-primary font-bold">{zoom.toFixed(1)}×</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(1.0, Number((z - 0.1).toFixed(1))))}
                      className="p-1 rounded-lg border border-border-light hover:bg-surface-base text-text-main cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-primary cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(1))))}
                      className="p-1 rounded-lg border border-border-light hover:bg-surface-base text-text-main cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rotate & Face Guide Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg border border-border-light bg-surface-base hover:bg-surface-muted text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFaceGuide((g) => !g)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      showFaceGuide
                        ? "bg-brand-primary-light/40 border-brand-primary/40 text-brand-primary"
                        : "border-border-light bg-surface-base text-text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Face Guide
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.0);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                  }}
                  className="text-[11px] text-text-muted hover:text-text-main underline cursor-pointer block"
                >
                  Reset position & zoom
                </button>
              </div>

              {/* Primary Action Button */}
              <Button
                variant="primary"
                onClick={handleFixPhoto}
                loading={isProcessing}
                leftIcon={<Wand2 className="w-4 h-4" />}
                className="w-full py-3.5 text-sm sm:text-base font-bold shadow-md cursor-pointer"
              >
                {processedResult ? "Re-process Photo" : `Fix Photo to ${req.minKb ? `${req.minKb}–${req.maxKb} KB` : `${req.maxKb} KB`}`}
              </Button>
            </div>
          </div>

          {/* Processing Visual Stepper */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-brand-primary-light/30 border border-brand-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-primary">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Preparing your photo…</span>
              </div>
              <p className="text-xs text-text-muted pl-6">{processingStep}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. RESULT & COMPLIANCE SECTION ─── */}
      {processedResult && compliance && (
        <div
          ref={resultRef}
          className="bg-surface-base border-2 border-brand-primary/30 rounded-2xl p-4 sm:p-6 space-y-6 shadow-md"
        >
          {/* Header with Overall Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light">
            <div>
              <h3 className="text-lg font-bold text-text-main">Your Photo Is Ready</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Processed locally to exact application specifications.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                compliance.allPassed
                  ? "bg-status-success/10 text-status-success border border-status-success/30"
                  : "bg-status-error/10 text-status-error border border-status-error/30"
              }`}
            >
              {compliance.allPassed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>READY TO UPLOAD</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>NOT READY — ADJUST REQUIRED</span>
                </>
              )}
            </div>
          </div>

          {/* Clean 2-Panel Preview: Before vs After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/30 space-y-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Before (Original)
              </span>
              <div className="h-52 flex items-center justify-center p-2 rounded-lg bg-surface-base border border-border-light overflow-hidden">
                <img
                  src={source?.dataUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>
              <div className="text-xs text-text-muted flex justify-between font-mono pt-1">
                <span>{source?.width} × {source?.height} px</span>
                <span>{formatBytes(source?.size || 0)}</span>
              </div>
            </div>

            {/* After */}
            <div className="p-3.5 rounded-xl border-2 border-brand-primary/30 bg-surface-base space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
                  After (Upload-Ready)
                </span>
                <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
                  No white borders
                </span>
              </div>
              <div className="h-52 flex items-center justify-center p-2 rounded-lg bg-surface-muted/20 border border-border-light overflow-hidden">
                <img
                  src={processedResult.dataUrl}
                  alt="Processed"
                  className="max-h-full max-w-full object-contain rounded shadow-sm"
                />
              </div>
              <div className="text-xs font-semibold text-text-main flex justify-between font-mono pt-1">
                <span>{processedResult.width} × {processedResult.height} px</span>
                <span className="text-brand-primary font-bold">{formatBytes(processedResult.size)}</span>
              </div>
            </div>
          </div>

          {/* Official Verification Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {compliance.checks.map((chk) => (
              <div
                key={chk.id}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  chk.passed
                    ? "bg-status-success/[0.03] border-status-success/30"
                    : "bg-status-error/[0.04] border-status-error/40"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-text-main">{chk.label}</span>
                  {chk.passed ? (
                    <span className="text-status-success flex items-center gap-0.5 font-bold">
                      <Check className="w-3.5 h-3.5" /> PASS
                    </span>
                  ) : (
                    <span className="text-status-error flex items-center gap-0.5 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> FAIL
                    </span>
                  )}
                </div>
                <div className="pt-0.5 text-[11px]">
                  <div className="text-text-muted">Target: <span className="font-semibold text-text-main">{chk.required}</span></div>
                  <div className="text-text-muted">Result: <span className="font-semibold text-text-main">{chk.actual}</span></div>
                </div>
                {chk.message && (
                  <p className="text-[11px] text-status-error font-medium pt-1">
                    {chk.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Warning or explanation note if applicable */}
          {processedResult.note && (
            <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs text-status-warning flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{processedResult.note}</span>
            </div>
          )}

          {/* Hero Download CTA & Secondary Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant={compliance.allPassed ? "success" : "primary"}
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
              className="py-3.5 px-8 text-sm sm:text-base font-bold shadow-md flex-1 sm:flex-initial cursor-pointer"
            >
              Download Photo ({formatKB(processedResult.size)})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
              leftIcon={<Sliders className="w-4 h-4" />}
              className="py-3 text-xs sm:text-sm cursor-pointer"
            >
              Adjust Crop / Framing
            </Button>
            <Button
              variant="ghost"
              onClick={resetAll}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="py-3 text-xs sm:text-sm text-text-muted cursor-pointer"
            >
              Start Over
            </Button>
          </div>

          <PostDownloadPanel
            info={postDownload.info}
            onClose={postDownload.close}
            onDismiss={postDownload.dismiss}
            onAddToast={onAddToast}
          />
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="max-w-3xl pt-2">
        <Disclaimer />
      </div>
    </div>
  );
}
