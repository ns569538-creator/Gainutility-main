/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exam File Requirements — Rebuilt UX
 *
 * Mental model:
 * Choose exam → See required files → Upload ONE file → Check/fix it →
 * File becomes ready → DOWNLOAD THAT FILE IMMEDIATELY.
 *
 * Each file card is completely independent:
 * - If a file already meets requirements: immediate download without forcing through an editor.
 * - Clean, focused editor (crop, zoom, rotate) without distracting face-guides.
 * - Download CTA is immediately visible inside each card.
 * - Responsive mobile-first layout (360px–430px touch-friendly).
 * - Meaningful download filenames (e.g. ssc-cgl-photo.jpg).
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import JSZip from "jszip";
import {
  Download,
  Wand2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  FileImage,
  PenTool,
  Fingerprint,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sliders,
  Check,
  Info,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../Common";
import {
  loadImageWithExif,
  fitAndCropToCanvas,
  compressToTargetRange,
  formatBytes,
  formatKB,
  triggerDownload,
  FormatTarget,
} from "../../exams/imageEngine";
import { ExamPreset, DocumentRequirement, DocumentType, ValidationIssue } from "../../exams/examTypes";
import { EXAMS, searchExams, DOCUMENT_LABELS } from "../../exams/requirements";
import { assessCompliance, targetSummary } from "../../exams/validate";
import { StatusBadge, Disclaimer } from "../../exams/examUi";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";

/* ===================================================================== */
/* Types & Constants                                                     */
/* ===================================================================== */

interface FileState {
  id: string;
  document: DocumentType;
  req: DocumentRequirement;
  fileName?: string;
  originalDataUrl?: string;
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;
  originalFormat?: string;
  processedDataUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  processedFormat?: string;
  processedBlob?: Blob;
  validation: {
    status: "idle" | "ready" | "needs_fixing" | "error";
    issues: ValidationIssue[];
    allPassed?: boolean;
    summary?: string;
  };
  isUploaded: boolean;
  isProcessing: boolean;
  processingStep: string;
}

interface CropOptions {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
}

const POPULAR_PRESETS = [
  { id: "ssc-cgl", label: "SSC CGL" },
  { id: "ssc-chsl", label: "SSC CHSL" },
  { id: "ssc-gd", label: "SSC GD" },
  { id: "upsc", label: "UPSC" },
  { id: "ibps", label: "IBPS" },
  { id: "sbi", label: "SBI" },
  { id: "rrb", label: "RRB" },
  { id: "neet-ug", label: "NEET" },
  { id: "jee-main", label: "JEE" },
  { id: "ctet", label: "CTET" },
  { id: "cuet", label: "CUET" },
  { id: "upsssc", label: "UPSSSC" },
];

const STORAGE_EXAM_KEY = "gainutility:exam_requirements:exam_id";

/* ===================================================================== */
/* Main Component                                                        */
/* ===================================================================== */

export default function ExamFileRequirements({
  onAddToast,
}: {
  onAddToast: (m: string, t: "success" | "error" | "warning" | "info") => void;
}) {
  // Read previously selected exam or default to SSC CGL
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem(STORAGE_EXAM_KEY);
      if (saved && EXAMS.some((e) => e.id === saved)) return saved;
    }
    return "ssc-cgl";
  });

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [examSearch, setExamSearch] = useState("");
  const [showFullReqTable, setShowFullReqTable] = useState(false);

  // Custom specs
  const [customWidth, setCustomWidth] = useState("200");
  const [customHeight, setCustomHeight] = useState("230");
  const [customMinKb, setCustomMinKb] = useState("20");
  const [customMaxKb, setCustomMaxKb] = useState("50");
  const [customFormat, setCustomFormat] = useState<"JPG" | "PNG" | "WebP">("JPG");

  // Files state
  const [files, setFiles] = useState<FileState[]>([]);

  // Editing file state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [cropOptions, setCropOptions] = useState<CropOptions>({
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
  });

  const frameCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Post-download modal
  const postDownload = usePostDownload();

  // Active exam
  const activeExam: ExamPreset | null = useMemo(() => {
    if (isCustomMode) return null;
    return EXAMS.find((e) => e.id === selectedExamId) || EXAMS[0] || null;
  }, [selectedExamId, isCustomMode]);

  // Requirements list
  const requirements: DocumentRequirement[] = useMemo(() => {
    if (isCustomMode) {
      return [
        {
          document: "photo",
          formats: [customFormat],
          minKb: customMinKb ? Number(customMinKb) : undefined,
          maxKb: customMaxKb ? Number(customMaxKb) : 50,
          widthPx: Number(customWidth) || 200,
          heightPx: Number(customHeight) || 230,
          status: "verified",
        },
        {
          document: "signature",
          formats: [customFormat],
          minKb: 10,
          maxKb: 20,
          widthPx: 140,
          heightPx: 60,
          status: "verified",
        },
      ];
    }
    return activeExam?.requirements || [];
  }, [activeExam, isCustomMode, customWidth, customHeight, customMinKb, customMaxKb, customFormat]);

  const filteredExams = useMemo(() => searchExams(examSearch), [examSearch]);

  // Save selected exam to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined" && selectedExamId && !isCustomMode) {
      window.sessionStorage.setItem(STORAGE_EXAM_KEY, selectedExamId);
    }
  }, [selectedExamId, isCustomMode]);

  // Initialize files state when exam requirements change
  useEffect(() => {
    if (requirements.length > 0) {
      setFiles((prev) => {
        return requirements.map((req, i) => {
          const fileId = `${selectedExamId || "custom"}-${req.document}-${i}`;
          // Preserve already processed file if matching
          const existing = prev.find((f) => f.document === req.document && f.isUploaded);
          if (existing) {
            return {
              ...existing,
              id: fileId,
              req,
            };
          }
          return {
            id: fileId,
            document: req.document,
            req,
            isUploaded: false,
            isProcessing: false,
            processingStep: "",
            validation: { status: "idle", issues: [] },
          };
        });
      });
    } else {
      setFiles([]);
    }
    setEditingFileId(null);
  }, [requirements, selectedExamId]);

  // Render crop canvas preview
  useEffect(() => {
    const editingFile = files.find((f) => f.id === editingFileId);
    if (!editingFile || !editingFile.originalDataUrl || !frameCanvasRef.current) return;

    const req = editingFile.req;
    const targetWidth = req.widthPx || 200;
    const targetHeight = req.heightPx || 230;

    const img = new Image();
    img.src = editingFile.originalDataUrl;
    img.onload = () => {
      const canvas = frameCanvasRef.current;
      if (!canvas) return;
      const previewCanvas = fitAndCropToCanvas(img, targetWidth, targetHeight, cropOptions);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(previewCanvas, 0, 0);
    };
  }, [editingFileId, files, cropOptions]);

  // Helpers
  const getFileState = (id: string) => files.find((f) => f.id === id);
  const setFileState = (id: string, patch: Partial<FileState>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleExamSelect = (id: string) => {
    setSelectedExamId(id);
    setIsCustomMode(false);
    setShowExamPicker(false);
    setExamSearch("");
  };

  // Build clean download filename
  const getDownloadFilename = useCallback(
    (fileState: FileState): string => {
      const examSlug = activeExam?.id ? activeExam.id.toLowerCase() : "exam";
      const docSlug =
        fileState.document === "thumb"
          ? "thumb-impression"
          : fileState.document === "signature"
          ? "signature"
          : "photo";
      const ext = fileState.processedFormat?.includes("png")
        ? "png"
        : fileState.processedFormat?.includes("webp")
        ? "webp"
        : "jpg";
      return `${examSlug}-${docSlug}.${ext}`;
    },
    [activeExam]
  );

  // Upload handler
  const handleFileUpload = async (fileId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      onAddToast("Please choose an image file (JPG, PNG, or WebP).", "error");
      return;
    }

    const fileState = getFileState(fileId);
    if (!fileState) return;

    setFileState(fileId, { isProcessing: true, processingStep: "Checking requirements…" });

    try {
      const info = await loadImageWithExif(file);
      const req = fileState.req;

      // Validate against exam requirements
      const compliance = assessCompliance(req, {
        size: file.size,
        width: info.width,
        height: info.height,
        format: info.format,
      });

      const docName = DOCUMENT_LABELS[fileState.document] || fileState.document;

      if (compliance.allPassed) {
        // ALREADY SATISFIES REQUIREMENTS!
        // Immediately make available for download without forcing through editor
        setFileState(fileId, {
          fileName: file.name,
          originalDataUrl: info.dataUrl,
          originalWidth: info.width,
          originalHeight: info.height,
          originalSize: file.size,
          originalFormat: info.format,
          processedDataUrl: info.dataUrl,
          processedSize: file.size,
          processedWidth: info.width,
          processedHeight: info.height,
          processedFormat: info.format,
          processedBlob: file,
          isUploaded: true,
          isProcessing: false,
          validation: {
            status: "ready",
            issues: [],
            allPassed: true,
            summary: "Already meets all official requirements",
          },
        });
        setEditingFileId(null);
        onAddToast(`✓ ${docName} already meets all requirements! Ready to download.`, "success");
      } else {
        // Needs adjustment — open editor directly so user can crop/fix immediately
        setFileState(fileId, {
          fileName: file.name,
          originalDataUrl: info.dataUrl,
          originalWidth: info.width,
          originalHeight: info.height,
          originalSize: file.size,
          originalFormat: info.format,
          processedDataUrl: undefined,
          processedSize: undefined,
          processedWidth: undefined,
          processedHeight: undefined,
          processedFormat: undefined,
          processedBlob: undefined,
          isUploaded: true,
          isProcessing: false,
          validation: {
            status: "needs_fixing",
            issues: compliance.issues,
            allPassed: false,
          },
        });
        setEditingFileId(fileId);
        setCropOptions({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 });
        onAddToast(`${docName} uploaded. Adjust crop and click Fix.`, "info");
      }
    } catch (err: any) {
      setFileState(fileId, { isProcessing: false });
      onAddToast(err.message || "Could not read image file.", "error");
    }
  };

  // Fix processing handler
  const handleFixFile = async (fileId: string) => {
    const fileState = getFileState(fileId);
    if (!fileState || !fileState.originalDataUrl) return;

    const req = fileState.req;
    const targetWidth = req.widthPx || 200;
    const targetHeight = req.heightPx || 230;

    setFileState(fileId, { isProcessing: true, processingStep: "Cropping and optimizing…" });
    await new Promise((r) => setTimeout(r, 40));

    try {
      const img = new Image();
      img.src = fileState.originalDataUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error("Could not load image"));
      });

      // Fit and crop to target canvas
      const croppedCanvas = fitAndCropToCanvas(img, targetWidth, targetHeight, cropOptions);

      // Determine output format
      const allowed = (req.formats || ["JPG"]).map((f) => f.toLowerCase());
      let format: FormatTarget = "jpeg";
      if (allowed.includes("png") && !allowed.includes("jpg") && !allowed.includes("jpeg")) {
        format = "png";
      } else if (allowed.includes("webp") && !allowed.includes("jpg") && !allowed.includes("jpeg")) {
        format = "webp";
      }

      const maxBytes = (req.maxKb ?? 50) * 1024;
      const minBytes = req.minKb ? req.minKb * 1024 : undefined;

      const result = await compressToTargetRange(croppedCanvas, {
        format,
        maxBytes,
        minBytes,
      });

      const compliance = assessCompliance(req, {
        size: result.size,
        width: result.width,
        height: result.height,
        format: result.format,
      });

      const docName = DOCUMENT_LABELS[fileState.document] || fileState.document;

      setFileState(fileId, {
        isProcessing: false,
        processedDataUrl: result.dataUrl,
        processedSize: result.size,
        processedWidth: result.width,
        processedHeight: result.height,
        processedFormat: result.format,
        processedBlob: result.blob,
        validation: {
          status: "ready",
          issues: compliance.issues,
          allPassed: true,
        },
      });

      // Exit editor mode to show the prominent download button immediately
      setEditingFileId(null);
      onAddToast(`✓ ${docName} is ready to download!`, "success");
    } catch (err: any) {
      setFileState(fileId, { isProcessing: false });
      onAddToast(err.message || "Processing failed.", "error");
    }
  };

  // Download handler for single file
  const handleDownloadSingle = (fileId: string) => {
    const fileState = getFileState(fileId);
    if (!fileState || !fileState.processedBlob) return;

    const filename = getDownloadFilename(fileState);
    triggerDownload(fileState.processedBlob, filename);
    postDownload.show("Exam File Requirements");
    onAddToast(`Downloaded ${filename}`, "success");
  };

  // Download all ready files
  const handleDownloadAll = async () => {
    const readyFiles = files.filter((f) => f.processedBlob);
    if (readyFiles.length === 0) {
      onAddToast("No files ready to download.", "warning");
      return;
    }

    try {
      const zip = new JSZip();
      const folderName = activeExam?.id ? activeExam.id.toLowerCase() : "exam_files";
      const folder = zip.folder(folderName) ?? zip;

      for (const f of readyFiles) {
        if (!f.processedBlob) continue;
        const name = getDownloadFilename(f);
        folder.file(name, f.processedBlob);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const filename = `${folderName}-application-files.zip`;
      triggerDownload(blob, filename);
      postDownload.show("Exam File Requirements");
      onAddToast(`Downloaded ZIP containing ${readyFiles.length} files`, "success");
    } catch (err: any) {
      onAddToast(err.message || "Could not generate ZIP.", "error");
    }
  };

  // Reset file card
  const handleResetFile = (fileId: string) => {
    setFileState(fileId, {
      fileName: undefined,
      originalDataUrl: undefined,
      originalWidth: undefined,
      originalHeight: undefined,
      originalSize: undefined,
      originalFormat: undefined,
      processedDataUrl: undefined,
      processedSize: undefined,
      processedWidth: undefined,
      processedHeight: undefined,
      processedFormat: undefined,
      processedBlob: undefined,
      isUploaded: false,
      validation: { status: "idle", issues: [] },
    });
    if (editingFileId === fileId) setEditingFileId(null);
  };

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startDragPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: cropOptions.panX,
      initialPanY: cropOptions.panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startDragPos.current.x;
    const dy = e.clientY - startDragPos.current.y;
    const sensitivity = 0.006 / Math.max(1, cropOptions.zoom * 0.8);
    setCropOptions((prev) => ({
      ...prev,
      panX: Math.max(-1, Math.min(1, startDragPos.current.initialPanX + dx * sensitivity)),
      panY: Math.max(-1, Math.min(1, startDragPos.current.initialPanY + dy * sensitivity)),
    }));
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
        initialPanX: cropOptions.panX,
        initialPanY: cropOptions.panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startDragPos.current.x;
    const dy = e.touches[0].clientY - startDragPos.current.y;
    const sensitivity = 0.007 / Math.max(1, cropOptions.zoom * 0.8);
    setCropOptions((prev) => ({
      ...prev,
      panX: Math.max(-1, Math.min(1, startDragPos.current.initialPanX + dx * sensitivity)),
      panY: Math.max(-1, Math.min(1, startDragPos.current.initialPanY + dy * sensitivity)),
    }));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Ready files count
  const readyFiles = files.filter((f) => Boolean(f.processedBlob));

  /* =================================================================== */
  /* Render                                                              */
  /* =================================================================== */

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* ── 1. EXAM SELECTOR ────────────────────────────────────────── */}
      <section aria-labelledby="exam-selection-title" className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span id="exam-selection-title" className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Choose Examination
          </span>
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setShowExamPicker(false);
            }}
            className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
          >
            {isCustomMode ? "Switch to Exam Presets" : "Need custom dimensions?"}
          </button>
        </div>

        {/* Exam Preset Chips */}
        {!isCustomMode && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {POPULAR_PRESETS.map((p) => {
                const isSelected = selectedExamId === p.id && !showExamPicker;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleExamSelect(p.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                        : "bg-surface-base border-border-light hover:border-brand-primary/40 text-text-main"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowExamPicker((v) => !v)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showExamPicker
                    ? "bg-brand-primary-light border-brand-primary text-brand-primary"
                    : "border-border-light bg-surface-muted/50 hover:bg-surface-muted text-text-sub"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>More exams…</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExamPicker ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Search all exams dropdown */}
            {showExamPicker && (
              <div className="p-3 bg-surface-base border border-border-light rounded-xl space-y-2 shadow-premium-sm">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Search by exam name or authority (e.g. UPSC, SBI, GATE, NEET)..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-light bg-surface-base text-xs sm:text-sm focus:border-brand-primary outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-border-light/50 border border-border-light/60 rounded-lg">
                  {filteredExams.length === 0 ? (
                    <div className="p-3 text-xs text-text-muted text-center">No exams found matching your search.</div>
                  ) : (
                    filteredExams.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleExamSelect(ex.id)}
                        className={`w-full text-left px-3 py-2.5 text-xs sm:text-[13px] flex items-center justify-between hover:bg-surface-muted transition-colors cursor-pointer ${
                          selectedExamId === ex.id ? "bg-brand-primary-light/40 font-bold text-brand-primary" : "text-text-main"
                        }`}
                      >
                        <span className="font-semibold">{ex.examName}</span>
                        <span className="text-[11px] text-text-muted">{ex.authority}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom dimensions inputs */}
        {isCustomMode && (
          <div className="p-4 rounded-xl border border-brand-primary/30 bg-surface-base space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-main">Custom Specifications</span>
              <span className="text-[11px] text-text-muted">Enter exact target parameters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Width (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs font-mono outline-none focus:border-brand-primary"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Height (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs font-mono outline-none focus:border-brand-primary"
                  placeholder="230"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Min KB</label>
                <input
                  type="number"
                  value={customMinKb}
                  onChange={(e) => setCustomMinKb(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs font-mono outline-none focus:border-brand-primary"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Max KB</label>
                <input
                  type="number"
                  value={customMaxKb}
                  onChange={(e) => setCustomMaxKb(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-light bg-surface-base text-xs font-mono outline-none focus:border-brand-primary"
                  placeholder="50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-text-muted">Format:</span>
              {(["JPG", "PNG", "WebP"] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-text-main">
                  <input
                    type="radio"
                    name="customFormat"
                    checked={customFormat === fmt}
                    onChange={() => setCustomFormat(fmt)}
                    className="accent-brand-primary cursor-pointer"
                  />
                  <span>{fmt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Selected Exam Summary Bar */}
        {activeExam && !isCustomMode && (
          <div className="p-3 sm:p-3.5 bg-surface-base border border-border-light rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-main truncate">{activeExam.examName}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary-light text-brand-primary">
                  {activeExam.authority}
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                Verified against official notifications · {activeExam.requirements.length} required application{" "}
                {activeExam.requirements.length === 1 ? "file" : "files"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullReqTable((v) => !v)}
              className="shrink-0 text-xs font-semibold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{showFullReqTable ? "Hide details" : "View specs"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullReqTable ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        {/* Collapsible Requirements Specs Table */}
        {showFullReqTable && activeExam && (
          <div className="p-3 bg-surface-muted/30 border border-border-light rounded-xl overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-light text-text-muted">
                  <th className="pb-1.5 font-semibold">Document</th>
                  <th className="pb-1.5 font-semibold">Dimensions</th>
                  <th className="pb-1.5 font-semibold">File Size</th>
                  <th className="pb-1.5 font-semibold">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/40">
                {activeExam.requirements.map((r, idx) => (
                  <tr key={idx} className="text-text-main">
                    <td className="py-2 font-semibold">{DOCUMENT_LABELS[r.document] || r.document}</td>
                    <td className="py-2 font-mono">
                      {r.widthPx && r.heightPx ? `${r.widthPx} × ${r.heightPx} px` : "Aspect ratio preserved"}
                    </td>
                    <td className="py-2 font-mono">
                      {r.minKb !== undefined && r.maxKb !== undefined
                        ? `${r.minKb}–${r.maxKb} KB`
                        : r.maxKb
                        ? `≤ ${r.maxKb} KB`
                        : "Any"}
                    </td>
                    <td className="py-2 font-mono">{r.formats.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 2. INDEPENDENT FILE CARDS ─────────────────────────────────── */}
      <section aria-label="Required application files" className="space-y-4">
        {files.map((fileState) => {
          const req = fileState.req;
          const docTitle = (DOCUMENT_LABELS[fileState.document] || fileState.document).toUpperCase();
          const targetWidth = req.widthPx || 200;
          const targetHeight = req.heightPx || 230;
          const isEditing = editingFileId === fileState.id;
          const isReady = fileState.validation.status === "ready" && Boolean(fileState.processedBlob);

          return (
            <div
              key={fileState.id}
              className={`rounded-2xl border transition-all duration-200 bg-surface-base overflow-hidden ${
                isReady
                  ? "border-emerald-500/40 shadow-xs"
                  : isEditing
                  ? "border-brand-primary shadow-sm"
                  : "border-border-light"
              }`}
            >
              {/* Card Header — Document title & single clear requirement specification */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border-light/60 flex items-center justify-between gap-3 bg-surface-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isReady ? "bg-emerald-500/10 text-emerald-600" : "bg-brand-primary/10 text-brand-primary"
                    }`}
                  >
                    {fileState.document === "photo" && <FileImage className="w-4 h-4" />}
                    {fileState.document === "signature" && <PenTool className="w-4 h-4" />}
                    {fileState.document === "thumb" && <Fingerprint className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-text-main tracking-tight leading-snug">{docTitle}</h2>
                    <p className="text-[12px] font-mono text-text-muted mt-0.5">
                      Required: {targetWidth} × {targetHeight} px ·{" "}
                      {req.minKb !== undefined ? `${req.minKb}–${req.maxKb} KB` : `≤ ${req.maxKb} KB`} ·{" "}
                      {req.formats.join("/")}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                {isReady ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3 stroke-[2.5]" /> Ready
                  </span>
                ) : fileState.isUploaded && !isEditing ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Needs adjustment
                  </span>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5">
                {/* ── STATE A: NOT UPLOADED ───────────────────────────────── */}
                {!fileState.isUploaded && !fileState.isProcessing && (
                  <div
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/jpeg,image/png,image/webp";
                      input.onchange = (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const f = target.files?.[0];
                        if (f) handleFileUpload(fileState.id, f);
                      };
                      input.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-brand-primary", "bg-brand-primary/5");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5");
                      if (e.dataTransfer.files[0]) handleFileUpload(fileState.id, e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-border-light rounded-xl py-6 px-4 text-center hover:border-brand-primary/60 hover:bg-brand-primary-light/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">
                        Upload {DOCUMENT_LABELS[fileState.document] || fileState.document}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">Drag and drop here, or tap to choose file</p>
                    </div>
                    <button
                      type="button"
                      className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark transition-colors cursor-pointer shadow-xs min-h-[38px]"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Choose File
                    </button>
                  </div>
                )}

                {/* ── STATE B: PROCESSING SPINNER ────────────────────────── */}
                {fileState.isProcessing && (
                  <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                    <RefreshCw className="w-6 h-6 text-brand-primary animate-spin" />
                    <p className="text-xs font-semibold text-text-main">{fileState.processingStep || "Processing image…"}</p>
                  </div>
                )}

                {/* ── STATE C: READY FOR DOWNLOAD (Dominant CTA!) ─────────── */}
                {isReady && !isEditing && (
                  <div className="space-y-4">
                    {/* Visual Success Confirmation Banner */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-950">
                            ✓ {DOCUMENT_LABELS[fileState.document] || fileState.document} ready for your application
                          </p>
                          <p className="text-xs font-mono font-medium text-emerald-800 mt-0.5">
                            {fileState.processedWidth} × {fileState.processedHeight} px ·{" "}
                            {formatBytes(fileState.processedSize || 0)} ·{" "}
                            {fileState.processedFormat?.split("/")[1]?.toUpperCase() || "JPG"}
                          </p>
                        </div>
                      </div>

                      {/* Small thumbnail preview */}
                      {fileState.processedDataUrl && (
                        <div className="h-12 w-12 rounded border border-emerald-300 bg-white overflow-hidden shrink-0 self-start sm:self-center flex items-center justify-center p-0.5">
                          <img
                            src={fileState.processedDataUrl}
                            alt="Prepared result"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dominant Download Button — prominent, large, full-width on mobile */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(fileState.id)}
                        className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-sans font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
                        aria-label={`Download prepared ${DOCUMENT_LABELS[fileState.document] || fileState.document}`}
                      >
                        <Download className="w-5 h-5 stroke-[2.5]" />
                        <span>Download {DOCUMENT_LABELS[fileState.document] || fileState.document}</span>
                      </button>

                      {/* Secondary actions: Adjust or Replace */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFileId(fileState.id);
                            setCropOptions({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 });
                          }}
                          className="font-semibold text-text-sub hover:text-brand-primary hover:underline cursor-pointer flex items-center gap-1 py-1 px-2"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Adjust Crop / Framing</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetFile(fileState.id)}
                          className="font-semibold text-text-muted hover:text-status-error hover:underline cursor-pointer flex items-center gap-1 py-1 px-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Replace File</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STATE D: EDITOR (Crop, Zoom, Rotate, Fix) ───────────── */}
                {fileState.isUploaded && isEditing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Original source thumbnail */}
                      <div className="p-3 rounded-xl border border-border-light bg-surface-muted/20 space-y-1.5 text-center">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                          Original File
                        </span>
                        <div className="h-40 flex items-center justify-center p-2 rounded-lg bg-surface-base border border-border-light/80 overflow-hidden">
                          <img
                            src={fileState.originalDataUrl}
                            alt="Original upload"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                        <p className="text-[11px] font-mono text-text-muted">
                          {fileState.originalWidth} × {fileState.originalHeight} px · {formatBytes(fileState.originalSize || 0)}
                        </p>
                      </div>

                      {/* Interactive Crop & Position Viewport */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                          Position & Framing
                        </span>
                        <div
                          className="relative touch-none cursor-grab active:cursor-grabbing select-none border-2 border-brand-primary rounded-xl overflow-hidden shadow-sm bg-neutral-900"
                          style={{
                            width: `${Math.min(240, targetWidth)}px`,
                            height: `${Math.round((targetHeight / targetWidth) * Math.min(240, targetWidth))}px`,
                            maxHeight: "300px",
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
                        </div>
                        <span className="text-[11px] text-text-muted">Drag inside box to reposition</span>
                      </div>
                    </div>

                    {/* Streamlined Controls (Zoom + Rotate only) */}
                    <div className="p-3 bg-surface-muted/40 rounded-xl border border-border-light space-y-3 max-w-md mx-auto">
                      {/* Zoom */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-text-sub">
                          <span className="flex items-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-brand-primary" /> Zoom
                          </span>
                          <span className="font-mono text-brand-primary">{cropOptions.zoom.toFixed(1)}×</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCropOptions((p) => ({
                                ...p,
                                zoom: Math.max(1.0, Number((p.zoom - 0.1).toFixed(1))),
                              }))
                            }
                            className="p-1.5 rounded-lg border border-border-light bg-surface-base text-text-main hover:bg-surface-muted cursor-pointer"
                            aria-label="Zoom out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.05"
                            value={cropOptions.zoom}
                            onChange={(e) => setCropOptions((p) => ({ ...p, zoom: parseFloat(e.target.value) }))}
                            className="flex-1 accent-brand-primary cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setCropOptions((p) => ({
                                ...p,
                                zoom: Math.min(3.0, Number((p.zoom + 0.1).toFixed(1))),
                              }))
                            }
                            className="p-1.5 rounded-lg border border-border-light bg-surface-base text-text-main hover:bg-surface-muted cursor-pointer"
                            aria-label="Zoom in"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Rotate & Reset */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCropOptions((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                          className="flex-1 min-h-[36px] py-1 px-2.5 rounded-lg border border-border-light bg-surface-base hover:bg-surface-muted text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropOptions({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 })}
                          className="flex-1 min-h-[36px] py-1 px-2.5 rounded-lg border border-border-light bg-surface-base hover:bg-surface-muted text-xs font-semibold text-text-sub flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Action: Fix File */}
                    <div className="space-y-2 max-w-md mx-auto">
                      <Button
                        variant="primary"
                        onClick={() => handleFixFile(fileState.id)}
                        loading={fileState.isProcessing}
                        leftIcon={<Wand2 className="w-4 h-4" />}
                        className="w-full min-h-[46px] py-3 text-sm font-bold shadow-md cursor-pointer"
                      >
                        Fix {DOCUMENT_LABELS[fileState.document] || fileState.document}
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          // If it was already prepared, just cancel edit
                          if (fileState.processedBlob) {
                            setEditingFileId(null);
                          } else {
                            handleResetFile(fileState.id);
                          }
                        }}
                        className="w-full py-2 text-xs font-semibold text-text-muted hover:text-text-main cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── 3. OPTIONAL COMPACT "DOWNLOAD ALL" SUMMARY ───────────────── */}
      {readyFiles.length >= 2 && (
        <section
          aria-label="Download multiple prepared files"
          className="p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-emerald-950">
              {readyFiles.length} files prepared and ready
            </span>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={handleDownloadAll}
            leftIcon={<Download className="w-4 h-4" />}
            className="font-bold cursor-pointer shrink-0"
          >
            Download All ({readyFiles.length} files .zip)
          </Button>
        </section>
      )}

      {/* ── 4. SECONDARY HELP & FAQ (Collapsed by default) ───────────── */}
      <section className="pt-4 border-t border-border-light space-y-3">
        <details className="group rounded-xl border border-border-light bg-surface-base p-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between font-bold text-sm text-text-main cursor-pointer list-none select-none">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              Frequently Asked Questions & How This Works
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3 text-xs text-text-sub leading-relaxed border-t border-border-light/60 pt-3">
            <div>
              <p className="font-bold text-text-main">How does this tool prepare files?</p>
              <p className="mt-0.5">
                The engine resizes your image to the exact pixel dimensions specified by the exam portal and uses smart
                quality compression to keep the file size inside the required KB range.
              </p>
            </div>
            <div>
              <p className="font-bold text-text-main">What if my file already meets the requirements?</p>
              <p className="mt-0.5">
                When you upload a file that already satisfies size, format, and dimension requirements, the tool detects
                this immediately and unlocks the download button without forcing you to re-crop or alter your photo.
              </p>
            </div>
            <div>
              <p className="font-bold text-text-main">Are files uploaded to any server?</p>
              <p className="mt-0.5">
                No. All image operations happen locally inside your browser using client-side Canvas and Blob APIs. Your
                personal photo and signature never leave your device.
              </p>
            </div>
            <div>
              <p className="font-bold text-text-main">What if my exam is not listed in presets?</p>
              <p className="mt-0.5">
                Click &ldquo;Need custom dimensions?&rdquo; at the top to enter your exam portal&rsquo;s exact pixel width,
                height, and min/max KB limits directly.
              </p>
            </div>
          </div>
        </details>

        {/* Independent Tool Disclaimer */}
        <Disclaimer />
      </section>

      {/* Post download rating prompt */}
      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
}