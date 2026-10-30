import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  AlertCircle,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { Button } from "../Common";
import { getPdfJs, renderPageToCanvas } from "./helpers";

export interface PdfPreviewProps {
  file: File | Blob | null;
  pageIndex?: number;
  onPageChange?: (index: number) => void;
  overlay?: (
    ctx: CanvasRenderingContext2D,
    page: { width: number; height: number },
    scale: number,
    pageIndex: number,
    pageCount: number
  ) => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number | string;
  showControls?: boolean;
  showPageNav?: boolean;
  showThumbnails?: boolean;
  showBeforeAfterToggle?: boolean;
  renderScale?: number;
  title?: string;
}

interface PageCache {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  file,
  pageIndex = 0,
  onPageChange,
  overlay,
  className = "",
  maxWidth = 800,
  maxHeight = "72vh",
  showControls = true,
  showPageNav = true,
  showThumbnails = true,
  showBeforeAfterToggle = true,
  renderScale = 1.35,
  title,
}) => {
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(renderScale);
  const [showThumbsPanel, setShowThumbsPanel] = useState(false);
  const [showOriginalBefore, setShowOriginalBefore] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [index: number]: string }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  // Cache clean pages keyed by `${index}_${scale}`
  const pageCacheRef = useRef<Map<string, PageCache>>(new Map());
  const isMountedRef = useRef(true);

  // Sync external pageIndex prop
  useEffect(() => {
    if (pageIndex >= 0 && pageIndex !== currentPage && pageIndex < pageCount) {
      setCurrentPage(pageIndex);
    }
  }, [pageIndex, pageCount]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPdf = useCallback(async () => {
    if (!file) {
      setPageCount(0);
      setError(null);
      setThumbnails({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfjsLib = await getPdfJs();
      const buffer = await file.arrayBuffer();
      const copy = new Uint8Array(buffer);
      const task = pdfjsLib.getDocument({ data: copy });
      const doc = await task.promise;

      if (!isMountedRef.current) return;

      pdfDocRef.current = doc;
      setPageCount(doc.numPages);
      setCurrentPage(prev => Math.min(prev, Math.max(0, doc.numPages - 1)));
      pageCacheRef.current.clear();
      setThumbnails({});
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.error("PDF load error:", err);
      setError(err?.message || "Failed to parse PDF document structure");
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [file]);

  useEffect(() => {
    loadPdf();
    return () => {
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch (_) {}
        pdfDocRef.current = null;
      }
      pageCacheRef.current.clear();
    };
  }, [loadPdf]);

  // Clean redraw: draws the cached clean page canvas then applies overlay (if not in "before" mode)
  const drawPageWithOverlay = useCallback((cleanCanvas: HTMLCanvasElement, width: number, height: number, pageIdx: number) => {
    const displayCanvas = canvasRef.current;
    if (!displayCanvas) return;

    displayCanvas.width = width;
    displayCanvas.height = height;
    const ctx = displayCanvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.drawImage(cleanCanvas, 0, 0);

    // Apply live overlay if provided and user has not toggled "Original / Before"
    if (overlay && !showOriginalBefore) {
      overlay(ctx, { width, height }, scale, pageIdx, pageCount);
    }
  }, [overlay, showOriginalBefore, scale, pageCount]);

  // Render the current page (uses cached clean canvas if available for 60 FPS reactivity)
  const renderCurrentPage = useCallback(async (index: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    const cacheKey = `${index}_${scale.toFixed(2)}`;
    const cached = pageCacheRef.current.get(cacheKey);

    if (cached) {
      drawPageWithOverlay(cached.canvas, cached.width, cached.height, index);
      return;
    }

    setIsLoading(true);
    try {
      const page = await pdfDocRef.current.getPage(index + 1);
      const cleanCanvas = await renderPageToCanvas(page, scale);

      if (!isMountedRef.current) return;

      pageCacheRef.current.set(cacheKey, {
        canvas: cleanCanvas,
        width: cleanCanvas.width,
        height: cleanCanvas.height,
      });

      // Keep cache size bounded to 20 pages to protect device memory
      if (pageCacheRef.current.size > 20) {
        const firstKey = pageCacheRef.current.keys().next().value;
        if (firstKey) pageCacheRef.current.delete(firstKey);
      }

      drawPageWithOverlay(cleanCanvas, cleanCanvas.width, cleanCanvas.height, index);
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("Page render error:", err);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [scale, drawPageWithOverlay]);

  // Effect: re-render or re-overlay when page, scale, or overlay options change
  useEffect(() => {
    if (pdfDocRef.current && currentPage >= 0 && currentPage < pageCount) {
      renderCurrentPage(currentPage);
    }
  }, [currentPage, scale, pageCount, renderCurrentPage]);

  // Lazy thumbnail loader for strip
  useEffect(() => {
    if (!pdfDocRef.current || !showThumbsPanel || pageCount <= 1) return;

    let active = true;
    const generateThumbs = async () => {
      const doc = pdfDocRef.current;
      for (let i = 0; i < pageCount; i++) {
        if (!active) break;
        if (thumbnails[i]) continue;
        try {
          const page = await doc.getPage(i + 1);
          const thumbCanvas = await renderPageToCanvas(page, 0.22);
          if (!active) break;
          const dataUrl = thumbCanvas.toDataURL("image/jpeg", 0.6);
          setThumbnails(prev => ({ ...prev, [i]: dataUrl }));
        } catch (_) {}
      }
    };
    generateThumbs();
    return () => { active = false; };
  }, [showThumbsPanel, pageCount]);

  const goToPage = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < pageCount) {
      setCurrentPage(newIndex);
      onPageChange?.(newIndex);
    }
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.4));
  const resetZoom = () => setScale(renderScale);

  const fitToWidth = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const containerW = containerRef.current.clientWidth - 48; // padding
    const curW = canvasRef.current.width / scale;
    if (curW > 0 && containerW > 0) {
      const newScale = Math.max(0.4, Math.min(2.5, containerW / curW));
      setScale(parseFloat(newScale.toFixed(2)));
    }
  };

  const fitToPage = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const containerW = containerRef.current.clientWidth - 48;
    const containerH = (containerRef.current.clientHeight || 500) - 48;
    const curW = canvasRef.current.width / scale;
    const curH = canvasRef.current.height / scale;
    if (curW > 0 && curH > 0) {
      const scaleW = containerW / curW;
      const scaleH = containerH / curH;
      const newScale = Math.max(0.4, Math.min(2.5, Math.min(scaleW, scaleH)));
      setScale(parseFloat(newScale.toFixed(2)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPage(currentPage - 1);
    if (e.key === "ArrowRight") goToPage(currentPage + 1);
    if (e.key === "+" || e.key === "=") zoomIn();
    if (e.key === "-") zoomOut();
    if (e.key === "0") resetZoom();
    if (e.key === "w" || e.key === "W") fitToWidth();
    if (e.key === "p" || e.key === "P") fitToPage();
  };

  if (!file) {
    return (
      <div className={`flex items-center justify-center bg-surface-base border border-border-light rounded-[20px] min-h-[320px] ${className}`}>
        <div className="text-center space-y-3 p-6">
          <FileText className="w-12 h-12 text-text-muted mx-auto" />
          <p className="text-text-sub font-sans font-medium">Select a PDF to inspect live pages</p>
          <span className="text-xs text-text-muted font-mono">Real rendered preview appears here</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-surface-base border border-status-error/30 rounded-[20px] min-h-[320px] p-6 ${className}`}>
        <div className="text-center space-y-3 max-w-md text-status-error">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <p className="font-sans font-bold text-base">Unable to render PDF preview</p>
          <p className="text-xs font-mono text-text-muted break-words">{error}</p>
          <Button variant="outline" size="sm" onClick={loadPdf} className="cursor-pointer text-xs mt-2">
            Retry Rendering
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-surface-base border border-border-light rounded-[20px] overflow-hidden flex flex-col shadow-premium-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${className}`} 
      onKeyDown={handleKeyDown} 
      tabIndex={0}
      aria-label="Interactive PDF document preview"
    >
      {/* Top Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-surface-muted/60 border-b border-border-light select-none text-xs">
        <div className="flex items-center gap-2">
          {title ? (
            <span className="font-sans font-bold text-text-main truncate max-w-[180px] sm:max-w-xs">{title}</span>
          ) : (
            <span className="font-sans font-semibold text-text-main flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-primary" />
              Document Preview
            </span>
          )}
          {overlay && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand-primary/10 text-brand-primary font-semibold">
              <Sparkles className="w-3 h-3" /> Live Changes
            </span>
          )}
        </div>

        {/* Before / After toggle & View Modes */}
        <div className="flex items-center gap-1 sm:gap-2">
          {overlay && showBeforeAfterToggle && (
            <button
              type="button"
              onClick={() => setShowOriginalBefore(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer min-h-[36px] ${
                showOriginalBefore
                  ? "bg-status-warning/20 text-text-main border border-status-warning/40 font-bold"
                  : "bg-surface-base hover:bg-surface-muted border border-border-subtle text-text-sub"
              }`}
              title="Toggle between original document and live modifications"
              aria-label={showOriginalBefore ? "Currently showing original PDF without watermark. Click to see live changes." : "Currently showing live changes. Click to see original PDF."}
            >
              {showOriginalBefore ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-status-warning" />
                  <span>Showing Original</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Before / After</span>
                </>
              )}
            </button>
          )}

          {pageCount > 1 && showThumbnails && (
            <button
              type="button"
              onClick={() => setShowThumbsPanel(p => !p)}
              className={`p-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                showThumbsPanel
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-surface-base border-border-subtle text-text-muted hover:text-text-main"
              }`}
              title="Toggle page thumbnail strip"
              aria-label="Toggle page thumbnails"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center bg-[#0f1115] overflow-auto p-4 sm:p-6 transition-all"
        style={{ minHeight: "320px", maxHeight }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-20">
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Rendering page {currentPage + 1} of {pageCount || 1}…</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="max-w-full block shadow-2xl rounded-sm transition-transform duration-75"
          style={{ imageRendering: "auto" }}
          aria-label={`PDF page ${currentPage + 1} of ${pageCount}`}
        />

        {/* Live Indicator Watermark Pill */}
        {overlay && !showOriginalBefore && !isLoading && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-sm pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span>Interactive Preview</span>
          </div>
        )}
      </div>

      {/* Expandable Page Thumbnail Strip */}
      {showThumbsPanel && pageCount > 1 && (
        <div className="border-t border-border-light bg-surface-muted/50 p-2.5 overflow-x-auto max-w-full flex items-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-lg border transition-all cursor-pointer ${
                currentPage === i
                  ? "border-brand-primary bg-brand-primary-light/20 ring-2 ring-brand-primary/30"
                  : "border-border-subtle bg-surface-base hover:border-brand-primary/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="w-14 h-18 bg-surface-muted rounded overflow-hidden flex items-center justify-center">
                {thumbnails[i] ? (
                  <img src={thumbnails[i]} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-mono text-text-muted">{i + 1}</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-text-sub font-semibold">p. {i + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Controls Bar: Navigation & Fit / Zoom */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-t border-border-light bg-surface-muted/40">
          {/* Page Navigation */}
          {showPageNav && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0 || isLoading}
                aria-label="Previous page"
                className="min-h-[40px] min-w-[40px] p-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-xs sm:text-sm font-mono text-text-main font-semibold min-w-[90px] text-center px-1">
                Page {currentPage + 1} / {pageCount || 1}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pageCount - 1 || isLoading}
                aria-label="Next page"
                className="min-h-[40px] min-w-[40px] p-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Fit & Zoom Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={fitToWidth}
              className="px-2 py-1 rounded-lg border border-border-subtle bg-surface-base hover:bg-surface-muted text-[11px] font-mono font-medium text-text-sub transition-colors cursor-pointer min-h-[36px] hidden sm:inline-flex items-center gap-1"
              title="Fit document width to container (W)"
            >
              <Maximize2 className="w-3 h-3" /> Fit Width
            </button>

            <button
              type="button"
              onClick={fitToPage}
              className="px-2 py-1 rounded-lg border border-border-subtle bg-surface-base hover:bg-surface-muted text-[11px] font-mono font-medium text-text-sub transition-colors cursor-pointer min-h-[36px] hidden sm:inline-flex items-center gap-1"
              title="Fit entire document page in viewer (P)"
            >
              <Minimize2 className="w-3 h-3" /> Fit Page
            </button>

            <div className="h-4 w-px bg-border-light hidden sm:block mx-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              aria-label="Zoom out"
              className="min-h-[38px] min-w-[38px] p-0 cursor-pointer"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-xs font-mono font-bold text-text-main min-w-[48px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              aria-label="Zoom in"
              className="min-h-[38px] min-w-[38px] p-0 cursor-pointer"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              aria-label="Reset zoom"
              className="min-h-[38px] min-w-[38px] p-0 cursor-pointer"
              title="Reset zoom to default (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export interface OriginalVsResultProps {
  originalFile: File | null;
  resultFile: File | null;
  originalPageIndex?: number;
  resultPageIndex?: number;
  onOriginalPageChange?: (index: number) => void;
  onResultPageChange?: (index: number) => void;
  originalOverlay?: (ctx: CanvasRenderingContext2D, page: { width: number; height: number }, scale: number) => void;
  resultOverlay?: (ctx: CanvasRenderingContext2D, page: { width: number; height: number }, scale: number) => void;
  className?: string;
  maxWidth?: number;
  maxHeight?: number | string;
  labels?: { original: string; result: string };
}

export const OriginalVsResult: React.FC<OriginalVsResultProps> = ({
  originalFile,
  resultFile,
  originalPageIndex = 0,
  resultPageIndex = 0,
  onOriginalPageChange,
  onResultPageChange,
  originalOverlay,
  resultOverlay,
  className = "",
  maxWidth = 800,
  maxHeight = 600,
  labels = { original: "Original Document", result: "Modified Output" },
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
          <h4 className="text-xs sm:text-sm font-bold font-sans text-text-main">
            {labels.original}
          </h4>
        </div>
        <PdfPreview
          file={originalFile}
          pageIndex={originalPageIndex}
          onPageChange={onOriginalPageChange}
          overlay={originalOverlay}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          showControls={true}
          showPageNav={true}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
          <h4 className="text-xs sm:text-sm font-bold font-sans text-text-main">
            {labels.result}
          </h4>
        </div>
        <PdfPreview
          file={resultFile}
          pageIndex={resultPageIndex}
          onPageChange={onResultPageChange}
          overlay={resultOverlay}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          showControls={true}
          showPageNav={true}
        />
      </div>
    </div>
  );
};