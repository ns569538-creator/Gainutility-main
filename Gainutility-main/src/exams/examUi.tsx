/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared UI primitives for the Application File Checker suite: privacy banner,
 * requirement cards, status badges, mobile upload buttons (with camera), and
 * validation/issue rendering.
 */

import React, { useRef } from "react";
import {
  Lock,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  Check,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Info,
  FileImage,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Card } from "../components/Common";
import {
  DocumentRequirement,
  ExamPreset,
  RequirementStatus,
  ValidationIssue,
  EXAM_DISCLAIMER,
} from "./examTypes";
import { DOCUMENT_LABELS, DOCUMENT_HINTS } from "./requirements";

/* ------------------------------------------------------------------ */
/* Privacy banner                                                      */
/* ------------------------------------------------------------------ */

export function PrivacyBanner({ local = true }: { local?: boolean }) {
  return (
    <div className="bg-brand-primary-light/40 border border-brand-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="p-2.5 bg-brand-primary text-white rounded-xl shrink-0">
        <Lock className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-main">🔒 Processed on your device</p>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
          {local
            ? "Your file stays in your browser. Nothing is uploaded to a server, so we never see your photo, signature or documents."
            : "Temporary server processing is required for this feature. Your file is used only to produce your result and is not shared with third parties."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

export function StatusBadge({ status }: { status: "verified" | "needs_review" | "outdated" }) {
  const map: Record<RequirementStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    verified: {
      label: "✓ Verified requirement",
      cls: "bg-status-success/10 text-status-success border-status-success/20",
      icon: <Check className="w-3.5 h-3.5" />,
    },
    needs_review: {
      label: "? Unverified — confirm",
      cls: "bg-brand-secondary-light/40 text-brand-secondary-hover border-brand-secondary/20",
      icon: <Info className="w-3.5 h-3.5" />,
    },
    outdated: {
      label: "! Outdated — may have changed",
      cls: "bg-status-warning/10 text-status-warning border-status-warning/20",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Requirement card (compact)                                          */
/* ------------------------------------------------------------------ */

function RuleRow({ label, value, status }: { label: string; value?: string; status?: RequirementStatus }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono font-bold text-text-main text-right">{value}</span>
    </div>
  );
}

export function RequirementCard({ doc, exam }: { doc: DocumentRequirement; exam?: ExamPreset }) {
  const fmt = doc.formats.join(" / ");
  const size = [doc.minKb !== undefined ? `${doc.minKb}` : null, doc.maxKb !== undefined ? `${doc.maxKb}` : null]
    .filter(Boolean)
    .join("–");
  const dims = doc.widthPx && doc.heightPx ? `${doc.widthPx} × ${doc.heightPx} px` : undefined;
  const cm = doc.widthCm && doc.heightCm ? `${doc.widthCm} × ${doc.heightCm} cm` : undefined;

  return (
    <div className="border border-border-light rounded-2xl bg-surface-base p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
            <FileImage className="w-4 h-4" />
          </span>
          <span className="font-bold text-text-main text-sm">{DOCUMENT_LABELS[doc.document] || doc.document}</span>
        </div>
        <StatusBadge status={doc.status} />
      </div>
      <div className="h-px bg-border-light" />
      <div className="space-y-1.5">
        {size && <RuleRow label="File size" value={doc.minKb !== undefined && doc.maxKb !== undefined ? `${size} KB` : size} />}
        {dims && <RuleRow label="Dimensions" value={dims} />}
        {cm && <RuleRow label="Physical size" value={cm} />}
        {doc.dpi && <RuleRow label="DPI" value={`${doc.dpi} dpi`} />}
        {fmt && <RuleRow label="Format" value={fmt} />}
        {doc.aspectRatio && <RuleRow label="Aspect ratio" value={doc.aspectRatio} />}
        {doc.background && <RuleRow label="Background" value={doc.background} />}
      </div>
      {doc.specialInstructions && doc.specialInstructions.length > 0 && (
        <ul className="space-y-1 pt-1">
          {doc.specialInstructions.map((s, i) => (
            <li key={i} className="text-[11px] text-text-muted flex gap-1.5">
              <span className="text-brand-primary shrink-0">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exam requirement summary section                                     */
/* ------------------------------------------------------------------ */

export function ExamRequirementsSection({ exam }: { exam: ExamPreset }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-border-light rounded-2xl bg-surface-base overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-surface-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div>
          <p className="font-bold text-text-main">What do I need to upload?</p>
          <p className="text-xs text-text-muted mt-0.5">
            {exam.examName} {exam.year} · Source: {exam.officialSource} · Verified: {exam.lastVerified}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-5 pb-5 space-y-3 border-t border-border-light pt-4">
              {exam.requirements.map((r, i) => (
                <RequirementCard key={i} doc={r} exam={exam} />
              ))}
              <p className="text-[11px] text-text-muted leading-relaxed pt-1">
                {DOCUMENT_HINTS.photo} Requirements may change — verify the current official instructions before final submission.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Issue list (plain-language errors), per spec.                        */
/* ------------------------------------------------------------------ */

export function IssueList({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
            issue.level === "official"
              ? "border-status-error/25 bg-status-error/[0.04]"
              : "border-brand-secondary/25 bg-brand-secondary-light/20"
          }`}
        >
          {issue.level === "official" ? (
            <XCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-brand-secondary-hover shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <p className={`font-medium ${issue.level === "official" ? "text-status-error" : "text-brand-secondary-hover"}`}>
              {issue.level === "official" ? "Official requirement" : "Quality suggestion"}
            </p>
            <p className="text-text-main">{issue.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile-friendly upload actions (Take Photo / Gallery / Browse)       */
/* ------------------------------------------------------------------ */

export function CameraUploadButtons({
  onFiles,
  accept = "image/*",
  label = "Add a file",
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  label?: string;
}) {
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const commit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const camSupported =
    typeof window !== "undefined" &&
    ("capture" in document.createElement("input"));

  const btn =
    "inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border-light bg-surface-base hover:border-brand-primary hover:bg-surface-hover text-sm font-semibold text-text-main cursor-pointer transition-all min-h-[46px] focus-visible:ring-2 focus-visible:ring-brand-primary";

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {camSupported && (
          <>
            <button type="button" onClick={() => cameraRef.current?.click()} className={btn}>
              <Camera className="w-4 h-4 text-brand-primary" />
              Take Photo
            </button>
            <button type="button" onClick={() => galleryRef.current?.click()} className={btn}>
              <ImageIcon className="w-4 h-4 text-brand-primary" />
              Choose from Gallery
            </button>
          </>
        )}
        <button type="button" onClick={() => browseRef.current?.click()} className={btn}>
          <FolderOpen className="w-4 h-4 text-brand-primary" />
          Browse Files
        </button>
      </div>
      <input ref={browseRef} type="file" accept={accept} className="hidden" onChange={commit} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={commit} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={commit} />
      <p className="text-[11px] text-text-muted px-1">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Disclaimer                                                          */
/* ------------------------------------------------------------------ */

export function Disclaimer() {
  return <p className="text-[11px] text-text-muted leading-relaxed">{EXAM_DISCLAIMER}</p>;
}

/* --------------------------------------------------------------------- */
/* Stat / info chip                                                      */
/* --------------------------------------------------------------------- */

export function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-surface-muted border border-border-light/60">
      <p className="text-[10px] uppercase tracking-wide font-mono text-text-muted">{label}</p>
      <p className={`text-sm font-mono font-bold mt-0.5 ${accent ? "text-brand-primary" : "text-text-main"}`}>{value}</p>
    </div>
  );
}

/* Re-export Button for convenience */
export { Button, Card };
