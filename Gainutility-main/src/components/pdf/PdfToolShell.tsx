import { 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  ChevronDown, 
  Settings2, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  FileUp, 
  Sparkles, 
  Eye, 
  ArrowRight,
  Sliders,
  Check
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card } from "../Common";
import { formatBytes } from "./helpers";
import { PdfPreview } from "./PdfPreview";
import { PDFPrivacyNotice, PDFProcessingState, PDFErrorAlert } from "./PdfComponents";
import { usePostDownload } from "../../hooks/usePostDownload";
import { PostDownloadPanel } from "../PostDownloadPanel";
import { useLocale } from "../../i18n/LocaleContext";
import { t, tf } from "../../i18n/ui";

export interface ProcessResult {
  blob: Blob;
  name: string;
  beforeSize: number;
  afterSize: number;
}

export interface AdvancedPdfToolPageProps {
  toolId: string;
  title: string;
  desc: string;
  supportedFormats: string;
  maxSizeStr?: string;
  accept: string;
  icon: React.ReactNode;
  category?: string;
  multiple?: boolean;
  limitations?: string[];
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onCopy?: (text: string) => void;
  optionsPanel?: (state: {
    files: File[];
    options: any;
    setOptions: React.Dispatch<React.SetStateAction<any>>;
  }) => React.ReactNode;
  /** Optional explicit label for the run button (e.g. "Compress PDF"). */
  processLabel?: string;
  getOverlay?: (
    options: any,
    pageIndex: number,
    pageCount: number
  ) => ((ctx: CanvasRenderingContext2D, page: { width: number; height: number }, scale: number, pageIndex: number) => void) | undefined;
  defaultOptions?: any;
  processFiles: (
    files: File[],
    options: any,
    setProgress: (msg: string) => void
  ) => Promise<ProcessResult>;
  faqs?: { question: string; acceptedAnswer: string }[];
}

/** Extension of a file name, lower-cased and dot-less ("" when there is none). */
const extOf = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
};

/** True when the produced blob can be rendered by the PDF canvas preview. */
const isPdfBlob = (name: string, blob: Blob): boolean =>
  blob.type === "application/pdf" || extOf(name) === "pdf";

/** Human label for a produced file's format ("PDF", "Word", "ZIP", "CSV"...). */
const formatLabel = (name: string): string => {
  const ext = extOf(name);
  const map: Record<string, string> = {
    pdf: "PDF",
    docx: "Word",
    doc: "Word",
    xlsx: "Excel",
    csv: "CSV",
    txt: "text",
    zip: "ZIP",
    html: "HTML",
    pptx: "PowerPoint",
    png: "PNG",
    jpg: "JPEG",
    jpeg: "JPEG",
  };
  return map[ext] ?? (ext ? ext.toUpperCase() : "file");
};

/** File card used when neither the input nor the result can be drawn as a PDF. */
const OutputFileCard: React.FC<{ name: string; size: number; format: string }> = ({
  name,
  size,
  format,
}) => (
  <Card className="min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-3">
    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
      <FileText className="w-7 h-7" aria-hidden="true" />
    </div>
    <div className="space-y-1">
      <p className="font-sans font-bold text-text-main break-all">{name}</p>
      <p className="text-xs text-text-muted font-mono">
        {format} · {formatBytes(size)}
      </p>
    </div>
  </Card>
);

interface ResultState {
  url: string;
  blob: Blob;
  name: string;
  beforeSize: number;
  afterSize: number;
  percentChange: number;
  timeMs: number;
}

export const AdvancedPdfToolPage: React.FC<AdvancedPdfToolPageProps> = ({
  toolId,
  title,
  desc,
  supportedFormats,
  maxSizeStr,
  accept,
  icon,
  category = "PDF",
  multiple = false,
  limitations,
  onAddToast,
  optionsPanel,
  processLabel,
  getOverlay,
  defaultOptions = {},
  processFiles,
  faqs,
}) => {
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [result, setResult] = useState<ResultState | null>(null);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const postDownload = usePostDownload();
  const inputId = `${toolId}-file-input`;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (result && !isProcessing) {
      setConfigExpanded(false);
    }
  }, [result, isProcessing]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, []);

  const handleFilesUpload = (uploaded: FileList | File[]) => {
    const incoming = Array.from(uploaded);
    if (!multiple) incoming.length = Math.min(incoming.length, 1);
    const valid = incoming.filter((file) => {
      if (accept === "*") return true;
      const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      return accept.toLowerCase().split(",").map((a) => a.trim()).includes(ext);
    });
    const rejected = incoming.length - valid.length;
    if (valid.length === 0) {
      onAddToast?.(tf("unsupportedFileType", locale, { formats: supportedFormats }), "error");
      return;
    }
    setErrorMessage(null);
    setFiles(multiple ? [...files, ...valid] : valid.slice(0, 1));
    setPreviewPageIndex(0);
    // Revoke previous result if new files are uploaded
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    onAddToast?.(
      rejected > 0
        ? tf("addedSkip", locale, { count: String(valid.length), rejected: String(rejected) })
        : tf("addedFiles", locale, { list: valid.map((f) => f.name).join(", ") }),
      "success"
    );
  };

  const triggerProcess = async () => {
    if (files.length === 0) {
      onAddToast?.(t("addFileFirst", locale), "warning");
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressMsg(t("preparing", locale));
    try {
      const started = performance.now();
      const res = await processFiles(files, options, setProgressMsg);
      const timeMs = Math.round(performance.now() - started);
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          url: URL.createObjectURL(res.blob),
          blob: res.blob,
          name: res.name,
          beforeSize: res.beforeSize,
          afterSize: res.afterSize,
          percentChange:
            res.beforeSize > 0 ? Math.round(((res.afterSize - res.beforeSize) / res.beforeSize) * 100) : 0,
          timeMs,
        };
      });
      onAddToast?.(tf("doneIn", locale, { time: (timeMs / 1000).toFixed(1) }), "success");
    } catch (err: any) {
      const msg = err?.message || t("processingFailed", locale);
      setErrorMessage(msg);
      onAddToast?.(msg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const resetTool = () => {
    setFiles([]);
    setErrorMessage(null);
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setOptions(defaultOptions);
    setConfigExpanded(true);
    setPreviewPageIndex(0);
  };

  const currentOverlay = useMemo(() => {
    if (!getOverlay) return undefined;
    return (ctx: CanvasRenderingContext2D, page: { width: number; height: number }, scale: number, pageIndex: number, pageCount: number) => {
      const fn = getOverlay(options, pageIndex, pageCount);
      if (fn) fn(ctx, page, scale, pageIndex);
    };
  }, [getOverlay, options]);

  const activePdfFile = files[0] ?? null;
  const isInputPdf = activePdfFile ? (activePdfFile.type === "application/pdf" || activePdfFile.name.toLowerCase().endsWith(".pdf")) : false;
  const hasResult = !!result;
  /** What the drop zone accepts, derived from the real `accept` prop. */
  const acceptsPdf = accept === "*" || accept.toLowerCase().split(",").some((a) => a.trim() === ".pdf");
  const acceptsMultipleTypes = accept !== "*" && accept.split(",").length > 1;
  /** Can the produced result be drawn on the PDF canvas? (.docx/.zip/.txt cannot) */
  const isResultPdf = hasResult ? isPdfBlob(result!.name, result!.blob) : false;
  /** The label on the primary download action, matching the actual file. */
  const downloadLabel = hasResult ? `Download ${formatLabel(result!.name)}` : "Download";
  /** Whether there is anything to configure. Tools with no settings still need a run button. */
  const showActionCard = !hasResult || configExpanded;
  /** The mobile action bar is on screen whenever there is an action to take. */
  const showStickyBar = !isProcessing && (files.length > 0 || hasResult);

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    postDownload.show(title);
  };

  return (
    <div
      className={`mx-auto w-full max-w-6xl animate-fade-in ${
        showStickyBar ? "pb-32 lg:pb-16" : "pb-12 sm:pb-16"
      }`}
    >
      {/* 1. EMPTY STATE: PROMINENT DROPZONE */}
      {files.length === 0 && !hasResult && (
        <Card className="p-0 border-2 border-dashed border-border-default hover:border-brand-primary/60 transition-all shadow-premium-sm">
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.length) handleFilesUpload(e.dataTransfer.files);
            }}
            className={`m-2 sm:m-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl px-4 py-12 sm:py-16 md:py-20 text-center transition-all ${
              isDragOver
                ? "bg-brand-primary-light/20 scale-[1.005]"
                : "bg-surface-base hover:bg-surface-muted/40"
            }`}
          >
            <input
              id={inputId}
              type="file"
              accept={accept === "*" ? undefined : accept}
              multiple={multiple}
              className="sr-only"
              tabIndex={0}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesUpload(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-premium-xs mb-5">
              <FileUp className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-text-main">
              {multiple ? t("dropFiles", locale) : t("dropFile", locale)}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-text-muted max-w-md leading-relaxed">
              {acceptsMultipleTypes
                ? `Drop your file here — ${supportedFormats} — to work on it locally in your browser.`
                : acceptsPdf
                  ? "Drop your PDF here to see its pages and apply your changes locally."
                  : `Drop your ${supportedFormats} file here to convert it locally in your browser.`}
            </p>
            <div className="mt-6">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="px-6 py-3 min-h-[48px] shadow-premium-md cursor-pointer pointer-events-none"
                leftIcon={<FileUp className="w-5 h-5" />}
              >
                Choose {acceptsPdf && !acceptsMultipleTypes ? "PDF " : ""}File
              </Button>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-text-muted">
              <span>{supportedFormats}{maxSizeStr ? ` · Max ${maxSizeStr}` : ""}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-brand-primary font-medium">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Processed in your browser
              </span>
            </div>
          </label>
        </Card>
      )}

      {/* 2. ACTIVE PROCESSING STATE */}
      {isProcessing && (
        <PDFProcessingState
          title={`Processing ${title}...`}
          message={progressMsg || "Applying requested changes in local browser memory..."}
          subtext="No files leave your computer. Processing runs entirely in your browser sandbox."
          className="mb-8"
        />
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <PDFErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          actionText="Try Again"
          onAction={triggerProcess}
          className="mb-6"
        />
      )}

      {/* 3. MAIN WORKSPACE (LIVE PREVIEW + CONFIGURATION / RESULT) */}
      {(files.length > 0 || hasResult) && !isProcessing && (
        <div className="space-y-6">
          {/* Active File Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface-base border border-border-light shadow-premium-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-sans font-bold text-text-main truncate max-w-xs sm:max-w-md md:max-w-lg" title={files[0]?.name || result?.name}>
                  {files[0]?.name || result?.name}
                </p>
                <p className="text-xs text-text-muted font-mono">
                  {files[0] ? formatBytes(files[0].size) : (result ? formatBytes(result.beforeSize) : "")}
                  {hasResult && result.beforeSize !== result.afterSize && (
                    <span className="ml-2 font-bold text-status-success">
                      → {formatBytes(result.afterSize)} ({result.percentChange > 0 ? `+${result.percentChange}%` : `${result.percentChange}%`})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetTool}
                className="text-xs min-h-[38px] cursor-pointer"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Upload Different File
              </Button>
            </div>
          </div>

          {/* TWO COLUMN WORKSPACE: PREVIEW (LEFT) + CONTROLS / RESULT (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: LIVE VISUAL PDF PREVIEW */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-sans font-bold text-text-main truncate">
                    {hasResult
                      ? "Result Preview"
                      : isInputPdf
                        ? "Interactive Preview (live changes)"
                        : "Selected File"}
                  </span>
                </div>
                {hasResult ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-status-success/15 text-status-success font-semibold shrink-0">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    Ready
                  </span>
                ) : (
                  <span className="text-xs font-mono text-text-muted shrink-0 hidden sm:inline">
                    {isInputPdf ? "Updates as you change settings" : ""}
                  </span>
                )}
              </div>

              {/* Result / input preview. Only PDFs can be drawn on the canvas —
                  Word/ZIP/text results fall back to a file card instead. */}
              {hasResult ? (
                isResultPdf ? (
                  <PdfPreview
                    file={result.blob}
                    className="shadow-premium-md border-brand-primary/30"
                  />
                ) : (
                  <OutputFileCard
                    name={result.name}
                    size={result.blob.size}
                    format={formatLabel(result.name)}
                  />
                )
              ) : isInputPdf ? (
                <PdfPreview
                  file={activePdfFile}
                  overlay={currentOverlay}
                  pageIndex={previewPageIndex}
                  onPageChange={setPreviewPageIndex}
                  className="shadow-premium-md"
                />
              ) : (
                <OutputFileCard
                  name={files[0]?.name ?? ""}
                  size={files[0]?.size ?? 0}
                  format={formatLabel(files[0]?.name ?? "")}
                />
              )}
            </div>

            {/* RIGHT COLUMN: CONFIGURATION PANEL OR DOWNLOAD RESULT */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* STATE A: RESULT READY TO DOWNLOAD */}
              {hasResult ? (
                <Card className="border-2 border-brand-primary/30 shadow-premium-md space-y-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-status-success/15 text-status-success">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Done
                    </div>
                    <h3 className="text-xl font-sans font-bold text-text-main">
                      Your {formatLabel(result.name)} File is Ready
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      Finished locally in your browser. {isResultPdf
                        ? "Check the preview on the left, then download:"
                        : "Download your file below:"}
                    </p>
                  </div>

                  {/* Size Comparison Card */}
                  <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>Source File:</span>
                      <span>{formatBytes(result.beforeSize)}</span>
                    </div>
                    <div className="flex justify-between text-text-main font-bold">
                      <span>Processed File:</span>
                      <span className="text-brand-primary">{formatBytes(result.afterSize)}</span>
                    </div>
                    {result.beforeSize > 0 && result.beforeSize !== result.afterSize && (
                      <div className="flex justify-between font-bold pt-1.5 border-t border-border-subtle">
                        <span>Size Difference:</span>
                        <span className={result.percentChange <= 0 ? "text-status-success" : "text-text-muted"}>
                          {result.percentChange > 0 ? `+${result.percentChange}%` : `${result.percentChange}%`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-text-muted text-[11px] pt-1">
                      <span>Compilation Time:</span>
                      <span>{(result.timeMs / 1000).toFixed(2)}s</span>
                    </div>
                  </div>

                  {/* Primary Download Button */}
                  <Button
                    id="pdf-tool-download-btn"
                    variant="primary"
                    size="lg"
                    onClick={download}
                    className="w-full text-base py-4 min-h-[52px] shadow-premium-md cursor-pointer"
                    leftIcon={<Download className="w-5 h-5" aria-hidden="true" />}
                  >
                    {downloadLabel}
                  </Button>

                  {/* Secondary Edit & Reset Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setConfigExpanded(true)}
                      className="w-full text-xs font-semibold cursor-pointer"
                      leftIcon={<Settings2 className="w-4 h-4" aria-hidden="true" />}
                    >
                      {optionsPanel ? "Change Settings & Run Again" : "Run Again"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetTool}
                      className="w-full text-xs text-text-muted hover:text-text-main cursor-pointer"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
                    >
                      Start Over / Choose a New File
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* STATE B: SETTINGS + RUN ACTION.
                  Rendered even when a tool has no settings, because the run
                  button lives here — otherwise 15 PDF tools have no way to start. */}
              {showActionCard && (
                <Card className="shadow-premium-sm space-y-4" aria-label={`${title} settings and action`}>
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                      <h3 className="font-sans font-bold text-sm sm:text-base text-text-main">
                        {optionsPanel ? "Tool Settings" : "Ready to Run"}
                      </h3>
                    </div>
                    {hasResult && (
                      <button
                        type="button"
                        onClick={() => setConfigExpanded(false)}
                        className="text-xs text-text-muted hover:text-text-main underline cursor-pointer min-h-[44px] px-1"
                      >
                        Hide
                      </button>
                    )}
                  </div>

                  {/* Dynamic Tool Settings */}
                  {optionsPanel ? (
                    <div className="pt-1">
                      {optionsPanel({ files, options, setOptions })}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      No configuration needed — add your file below and run {title}.
                    </p>
                  )}

                  {/* Action CTA Button */}
                  <div className="pt-4 border-t border-border-subtle space-y-3">
                    <Button
                      id="pdf-tool-process-btn"
                      variant="primary"
                      size="lg"
                      onClick={triggerProcess}
                      disabled={isProcessing || files.length === 0}
                      className="w-full text-sm sm:text-base py-3.5 min-h-[48px] shadow-premium-md cursor-pointer"
                      leftIcon={<Sparkles className="w-4 h-4" aria-hidden="true" />}
                    >
                      {files.length > 1 && multiple
                        ? `Process ${files.length} Files`
                        : processLabel ?? (optionsPanel ? `Apply & Process ${title}` : `Run ${title}`)}
                    </Button>

                    <PDFPrivacyNotice variant="subtle" />
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIVACY & TRANSPARENT LIMITATIONS */}
      <Card className="mt-8 sm:mt-12 bg-surface-muted/40">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-text-main">{t("privacy", locale)}</p>
            <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
              {t("localFileBody", locale)}
            </p>
            {limitations && limitations.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-status-warning/10 border border-status-warning/20 p-3 text-text-main">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" aria-hidden />
                <div className="text-xs">
                  <p className="font-semibold uppercase tracking-wide">{t("canAndCannot", locale)}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 leading-relaxed text-text-sub">
                    {limitations.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 5. TOOL-SPECIFIC FAQ (the `faqs` prop was previously accepted and
          dropped on the floor — 33 call sites were losing their content). */}
      {faqs && faqs.length > 0 && (
        <section className="mt-6 sm:mt-8" aria-labelledby={`${toolId}-tool-faq-heading`}>
          <h2
            id={`${toolId}-tool-faq-heading`}
            className="font-sans font-bold text-base sm:text-lg text-text-main mb-3"
          >
            {t("faqTitle", locale)} — {title}
          </h2>
          <div className="rounded-[18px] sm:rounded-[20px] border border-border-light bg-surface-base shadow-premium-sm divide-y divide-border-light/60 overflow-hidden">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-5 text-sm sm:text-base font-sans font-bold text-text-main hover:text-brand-primary transition-colors min-h-[44px] list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown
                    className="w-4 h-4 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-brand-primary"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-text-sub leading-relaxed">
                  {faq.acceptedAnswer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* MOBILE STICKY ACTION BAR — keeps the one primary action reachable
          without scrolling, respects the iOS home indicator. */}
      {showStickyBar && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border-default bg-surface-base/95 backdrop-blur-md shadow-2xl flex items-center gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          {hasResult ? (
            <Button
              variant="primary"
              size="lg"
              onClick={download}
              className="flex-1 min-h-[48px] shadow-premium-md cursor-pointer text-sm font-bold"
              leftIcon={<Download className="w-4 h-4" aria-hidden="true" />}
            >
              {downloadLabel}
            </Button>
          ) : (
            <Button
              id="pdf-tool-process-btn-mobile"
              variant="primary"
              size="lg"
              onClick={triggerProcess}
              disabled={isProcessing || files.length === 0}
              className="flex-1 min-h-[48px] shadow-premium-md cursor-pointer text-sm font-bold"
              leftIcon={<Sparkles className="w-4 h-4" aria-hidden="true" />}
            >
              {files.length > 1 && multiple
                ? `Process ${files.length} Files`
                : processLabel ?? (optionsPanel ? `Apply & Process ${title}` : `Run ${title}`)}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigExpanded(true)}
            className="min-h-[48px] min-w-[48px] px-3.5 text-xs cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />
    </div>
  );
};
