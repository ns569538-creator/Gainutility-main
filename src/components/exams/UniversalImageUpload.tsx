/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Universal Image Upload Component for GainUtility tools.
 *
 * Provides:
 * - Large, unmistakable drag-and-drop hero zone
 * - 100% clickable area with keyboard support (Enter/Space)
 * - Mobile native photo/camera selection
 * - Drag-over visual feedback
 * - File type validation (JPG, JPEG, PNG, WebP)
 * - Compact, non-distracting local privacy badge
 */

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Camera, FolderOpen, Lock, ShieldCheck } from "lucide-react";

interface UniversalImageUploadProps {
  onFileSelected: (file: File) => void;
  title?: string;
  subtitle?: string;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function UniversalImageUpload({
  onFileSelected,
  title = "Upload your photo",
  subtitle = "Choose a clear photo of yourself. We'll resize and optimize it automatically.",
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  className = "",
  disabled = false,
}: UniversalImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const processFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // Clear input so same file can be re-selected if needed
    e.target.value = "";
  };

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {/* Hero Dropzone Card */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative w-full rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20 ${
          isDragOver
            ? "border-brand-primary bg-brand-primary/5 scale-[1.01] shadow-lg shadow-brand-primary/10"
            : "border-border-light bg-surface-base hover:border-brand-primary hover:bg-surface-muted/30 hover:shadow-md"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex flex-col items-center justify-center space-y-3.5 max-w-md mx-auto">
          {/* Hero Icon */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
              isDragOver
                ? "bg-brand-primary text-white"
                : "bg-brand-primary-light/50 text-brand-primary"
            }`}
          >
            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          {/* Titles */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-text-main group-hover:text-brand-primary transition-colors">
              {isDragOver ? "Drop photo here" : title}
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {isDragOver ? "Release to load your photograph" : subtitle}
            </p>
          </div>

          {/* Action button lookalike */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs sm:text-sm font-bold shadow-sm transition-all group-hover:bg-brand-primary-hover group-hover:shadow-md">
              <ImageIcon className="w-4 h-4" />
              Choose Photo
            </span>
          </div>

          {/* Formats & hints */}
          <p className="text-[11px] text-text-muted pt-1">
            Drag & drop on desktop · Tap on mobile · Supports JPG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Compact, clean privacy guarantee */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted py-0.5">
        <Lock className="w-3.5 h-3.5 text-status-success shrink-0" />
        <span>
          <strong className="font-semibold text-text-main">Processed locally</strong> — Your photo never leaves your device.
        </span>
      </div>
    </div>
  );
}
