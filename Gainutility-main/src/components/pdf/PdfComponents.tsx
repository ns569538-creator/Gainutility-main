/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  FileUp, 
  RefreshCw, 
  CheckCircle2, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  GripVertical,
  FileText,
  ArrowUp,
  ArrowDown,
  Trash2
} from "lucide-react";
import { Button } from "../Common";
import { ViewState, ToolId } from "../../types";

// ==========================================
// 1. PDF ERROR ALERT (What Happened + What Can I Do)
// ==========================================
export interface PDFErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const PDFErrorAlert: React.FC<PDFErrorAlertProps> = ({
  message,
  onDismiss,
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div 
      className={`p-4 sm:p-5 rounded-2xl bg-status-error/10 border border-status-error/25 text-status-error flex items-start gap-3.5 animate-fade-in ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-status-error" />
      <div className="space-y-1 text-sm leading-relaxed flex-1 min-w-0">
        <p className="font-bold font-sans text-status-error">Action Required</p>
        <p className="text-text-main dark:text-text-sub font-mono text-xs sm:text-sm break-words">{message}</p>
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 inline-flex items-center text-xs font-bold text-status-error underline hover:no-underline cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto text-xs font-mono text-text-muted hover:text-text-main underline hover:no-underline cursor-pointer p-1"
          aria-label="Dismiss error notification"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

// ==========================================
// 2. PDF PRIVACY NOTICE & BADGES
// ==========================================
export interface PDFPrivacyNoticeProps {
  variant?: "pill" | "banner" | "subtle";
  className?: string;
}

export const PDFPrivacyNotice: React.FC<PDFPrivacyNoticeProps> = ({
  variant = "pill",
  className = ""
}) => {
  if (variant === "pill") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted/60 border border-border-subtle text-xs text-text-muted ${className}`}>
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
        <span className="font-sans">100% Client-side. No files are uploaded to external servers.</span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`p-3.5 rounded-xl bg-brand-primary-light/15 border border-brand-primary/20 flex items-center gap-3 text-xs text-text-sub ${className}`}>
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
        <span className="font-sans leading-relaxed">
          <strong>Zero Server Uploads:</strong> All document rendering, parsing, and modification run inside your browser memory.
        </span>
      </div>
    );
  }

  return (
    <div className={`text-xs text-text-muted flex items-start gap-2 ${className}`}>
      <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
      <span className="font-sans leading-relaxed">
        Files stay secure in your browser. Never uploaded to any server.
      </span>
    </div>
  );
};

// ==========================================
// 3. PDF PROCESSING STATE
// ==========================================
export interface PDFProcessingStateProps {
  title?: string;
  message?: string;
  /** Real progress 0-100. Omit when the step count is unknown — the bar then
      renders as indeterminate rather than reporting a fabricated percentage. */
  percentage?: number;
  subtext?: string;
  className?: string;
}

export const PDFProcessingState: React.FC<PDFProcessingStateProps> = ({
  title = "Processing PDF Document...",
  message = "Please wait while your files are parsed locally...",
  percentage,
  subtext = "All operations run in local browser memory without transmitting data over the internet.",
  className = ""
}) => {
  const determinate = typeof percentage === "number" && Number.isFinite(percentage);
  const pct = determinate ? Math.max(0, Math.min(100, percentage as number)) : 0;
  return (
    <div 
      className={`bg-surface-base border border-border-light rounded-[24px] p-6 sm:p-10 md:p-12 text-center space-y-6 shadow-premium-md animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary animate-pulse mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-sans font-bold text-text-main">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-mono text-text-muted min-h-[20px] break-words">
          {message}
        </p>
      </div>

      {/* Progress bar — determinate only when a real percentage is known. */}
      <div 
        className="max-w-md mx-auto space-y-2"
        role="progressbar"
        aria-label="Processing progress"
        {...(determinate
          ? { "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }
          : {})}
      >
        <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden p-0.5 border border-border-subtle">
          <div
            className={`h-full bg-brand-primary rounded-full transition-all duration-300 ease-out ${
              determinate ? "" : "animate-pulse-progress"
            }`}
            style={determinate ? { width: `${Math.max(5, pct)}%` } : { width: "40%" }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-text-muted">
          <span>Processing in your browser</span>
          <span>{determinate ? `${pct}%` : "Working…"}</span>
        </div>
      </div>

      <p className="text-xs text-text-muted max-w-md mx-auto">
        {subtext}
      </p>
    </div>
  );
};

// ==========================================
// 4. PDF FILE CARD (Queue / Item View)
// ==========================================
export interface PDFFileCardProps {
  id: string;
  name: string;
  sizeStr: string;
  pageCount?: number;
  index: number;
  totalCount: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  className?: string;
}

export const PDFFileCard: React.FC<PDFFileCardProps> = ({
  id,
  name,
  sizeStr,
  pageCount,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onRemove,
  draggable = true,
  onDragStart,
  onDragOver,
  onDragEnd,
  className = ""
}) => {
  return (
    <div
      key={id}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border-subtle hover:border-brand-primary/40 bg-surface-muted/40 hover:bg-surface-muted/70 transition-all gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div 
          className="hidden sm:flex text-text-muted/60 hover:text-text-main cursor-grab active:cursor-grabbing p-1"
          title="Drag to reorder"
          aria-hidden="true"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-sans font-bold text-text-main truncate max-w-[200px] sm:max-w-xs md:max-w-sm" title={name}>
            {name}
          </p>
          <p className="text-xs text-text-muted font-mono">
            {sizeStr} {typeof pageCount === "number" && `• ${pageCount} pages`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move ${name} up`}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-25 disabled:pointer-events-none cursor-pointer transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            aria-label={`Move ${name} down`}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main disabled:opacity-25 disabled:pointer-events-none cursor-pointer transition-colors"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name} from queue`}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-status-error/10 text-text-muted hover:text-status-error cursor-pointer transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. PDF UPLOAD DROPZONE
// ==========================================
export interface PDFUploadDropzoneProps {
  id: string;
  accept?: string;
  multiple?: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: FileList | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  badgeText?: string;
  className?: string;
}

export const PDFUploadDropzone: React.FC<PDFUploadDropzoneProps> = ({
  id,
  accept = "application/pdf,.pdf",
  multiple = false,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  inputRef,
  title = "Drop your PDF file here",
  subtitle = "Select a PDF from your computer or drag and drop it into this box",
  buttonLabel = "Upload PDF",
  badgeText = "PDF documents • 100% Client-side • Max 100MB",
  className = ""
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-[24px] p-6 sm:p-10 md:p-14 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? "border-brand-primary bg-brand-primary-light/25 scale-[1.005]"
          : "border-border-default hover:border-brand-primary/60 bg-surface-base hover:bg-surface-muted/40 shadow-premium-sm"
      } ${className}`}
      onClick={() => inputRef.current?.click()}
      role="region"
      aria-label="PDF file upload dropzone"
    >
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          onFileSelect(e.target.files);
          e.target.value = "";
        }}
        className="sr-only"
        aria-label={buttonLabel}
      />

      <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <FileUp className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div className="space-y-1.5 px-2">
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-text-main">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base px-6 py-3.5 min-h-[48px] sm:min-h-[50px] shadow-premium-md cursor-pointer"
            leftIcon={<FileUp className="w-5 h-5" />}
          >
            {buttonLabel}
          </Button>
        </div>

        <div className="pt-3 border-t border-border-subtle/80 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-text-muted">
          <span className="font-mono">{badgeText}</span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span className="inline-flex items-center gap-1.5 text-brand-primary font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            No files leave your computer
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. PDF RESULT CARD
// ==========================================
export interface PDFResultCardProps {
  title: string;
  description: string;
  badgeText?: string;
  primaryAction: {
    id?: string;
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  className?: string;
}

export const PDFResultCard: React.FC<PDFResultCardProps> = ({
  title,
  description,
  badgeText = "Completed Successfully! ✅",
  primaryAction,
  secondaryAction,
  children,
  className = ""
}) => {
  return (
    <div className={`bg-surface-base border-2 border-brand-primary/20 rounded-[24px] p-6 sm:p-8 md:p-10 shadow-premium-md text-center space-y-6 animate-fade-in ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-status-success/10 text-status-success mx-auto">
        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-status-success/15 text-status-success">
          {badgeText}
        </span>
        <h2 className="text-2xl sm:text-3xl font-sans font-bold text-text-main">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-text-sub">
          {description}
        </p>
      </div>

      {/* Primary and Reset CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          id={primaryAction.id}
          variant="primary"
          size="lg"
          onClick={primaryAction.onClick}
          className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 min-h-[50px] sm:min-h-[52px] shadow-premium-md cursor-pointer"
          leftIcon={primaryAction.icon || <Download className="w-5 h-5 sm:w-6 sm:h-6" />}
        >
          {primaryAction.label}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={secondaryAction.onClick}
          className="w-full sm:w-auto text-sm sm:text-base px-6 min-h-[50px] sm:min-h-[52px] cursor-pointer"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          {secondaryAction.label}
        </Button>
      </div>

      {children}

      <div className="pt-4 border-t border-border-subtle flex items-center justify-center gap-2 text-xs text-text-muted">
        <ShieldCheck className="w-4 h-4 text-brand-primary" />
        <span>100% Client-side. No files were uploaded to external servers.</span>
      </div>
    </div>
  );
};

// ==========================================
// 6. PDF RELATED TOOLS / NEXT ACTIONS
// ==========================================
export interface RelatedToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface PDFRelatedToolsProps {
  currentToolId: string;
  onChangeView?: (view: ViewState) => void;
  tools?: RelatedToolItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const DEFAULT_PDF_RELATED_TOOLS: Record<string, RelatedToolItem[]> = {
  "merge-pdf": [
    { id: "split-pdf", name: "Split PDF", description: "Separate pages into individual documents", url: "/tools/split-pdf" },
    { id: "compress-images-inside-pdf", name: "Compress PDF", description: "Shrink file size for emails & uploads", url: "/tools/compress-images-inside-pdf" },
    { id: "rotate-pdf", name: "Rotate PDF", description: "Fix upside down or sideways pages", url: "/tools/rotate-pdf" },
    { id: "rearrange-pdf", name: "Rearrange PDF", description: "Reorder pages in custom sequence", url: "/tools/rearrange-pdf" }
  ],
  "split-pdf": [
    { id: "merge-pdf", name: "Merge PDF", description: "Combine pages with other documents", url: "/tools/merge-pdf" },
    { id: "compress-images-inside-pdf", name: "Compress PDF", description: "Shrink file size for emails & uploads", url: "/tools/compress-images-inside-pdf" },
    { id: "rotate-pdf", name: "Rotate PDF", description: "Fix upside down or sideways pages", url: "/tools/rotate-pdf" },
    { id: "pdf-to-jpg", name: "PDF to JPG", description: "Export pages as high-res images", url: "/tools/pdf-to-jpg" }
  ]
};

export const PDFRelatedTools: React.FC<PDFRelatedToolsProps> = ({
  currentToolId,
  onChangeView,
  tools,
  title = "Next Actions for Your Document",
  subtitle = "Ready for the next step? Combine, compress, or convert your pages:",
  className = ""
}) => {
  const items = tools || DEFAULT_PDF_RELATED_TOOLS[currentToolId] || DEFAULT_PDF_RELATED_TOOLS["merge-pdf"];

  return (
    <div className={`bg-surface-base border border-border-light rounded-[20px] p-5 sm:p-6 shadow-premium-sm space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-primary" />
        <h3 className="font-sans font-bold text-sm sm:text-base text-text-main">
          {title}
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-text-sub">
        {subtitle}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            onClick={(e) => {
              if (onChangeView) {
                e.preventDefault();
                onChangeView({ type: "tool", id: item.id as ToolId });
              }
            }}
            className="p-3.5 rounded-xl border border-border-subtle hover:border-brand-primary/50 hover:bg-surface-muted/60 transition-all text-left group cursor-pointer block min-h-[44px]"
          >
            <div className="font-sans font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary flex items-center justify-between">
              <span>{item.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
            </div>
            <p className="text-xs text-text-muted mt-1 leading-snug">{item.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};
