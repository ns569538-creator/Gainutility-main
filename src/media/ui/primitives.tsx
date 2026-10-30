/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared visual primitives for the Media platform. Quiet, local-first,
 * matching the site's cream/amber design language.
 */

import React from "react";
import {
  Music,
  Minimize2,
  Scissors,
  Repeat,
  Move,
  Share2,
  Sparkles,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Check,
} from "lucide-react";
import { MediaGoalId, MediaKind } from "../core/types";

/** Truthful privacy badge — only shows "Processed in your browser." because it is true. */
export const LocalOnlyBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/10 px-2.5 py-1 text-[11px] font-semibold text-status-success ${className}`}
  >
    <Sparkles className="w-3 h-3" />
    Processed in your browser
  </span>
);

const GOAL_ICONS: Record<MediaGoalId, React.ReactNode> = {
  save: <FileVideo className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  smaller: <Minimize2 className="w-5 h-5" />,
  convert: <Repeat className="w-5 h-5" />,
  trim: <Scissors className="w-5 h-5" />,
  resize: <Move className="w-5 h-5" />,
  social: <Share2 className="w-5 h-5" />,
  create: <Sparkles className="w-5 h-5" />,
};

export interface GoalCard {
  id: MediaGoalId;
  label: string;
  description: string;
}

export const KindBadge: React.FC<{ kind: MediaKind }> = ({ kind }) => {
  const map: Record<MediaKind, { label: string; icon: React.ReactNode }> = {
    video: { label: "Video", icon: <FileVideo className="w-3.5 h-3.5" /> },
    audio: { label: "Audio", icon: <Music className="w-3.5 h-3.5" /> },
    image: { label: "Image", icon: <ImageIcon className="w-3.5 h-3.5" /> },
    unknown: { label: "Media", icon: <FileVideo className="w-3.5 h-3.5" /> },
  };
  const m = map[kind];
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-text-muted [&_svg]:w-3.5 [&_svg]:h-3.5">
      {m.icon}
      {m.label}
    </span>
  );
};

/** The goal-selection step — a grid of cards, one per goal a tool offers. */
export const GoalSelector: React.FC<{
  goals: GoalCard[];
  onSelect: (goal: MediaGoalId) => void;
}> = ({ goals, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {goals.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onSelect(g.id)}
          className="group flex items-start gap-3 rounded-xl border border-border-light bg-surface-base p-4 text-left transition-colors cursor-pointer hover:border-brand-primary hover:bg-surface-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary-light/40 text-brand-primary [&_svg]:w-5 [&_svg]:h-5">
            {GOAL_ICONS[g.id]}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-text-main">{g.label}</span>
            <span className="mt-0.5 block text-xs leading-snug text-text-muted">{g.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

/** Linear activity strip shown while analyzing / processing. */
export const ActivityStrip: React.FC<{
  title: string;
  note?: string;
  progress: number | null;
  onCancel?: () => void;
}> = ({ title, note, progress, onCancel }) => {
  const pct = progress == null ? null : Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <div>
            <p className="text-sm font-semibold text-text-main">{title}</p>
            {note && <p className="text-xs text-text-muted mt-0.5">{note}</p>}
          </div>
        </div>
        {pct != null && (
          <span className="font-mono text-lg font-bold text-brand-primary">{pct}%</span>
        )}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-150"
          style={{ width: pct == null ? "8%" : `${pct}%` }}
        />
      </div>
      {onCancel && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-muted hover:text-text-main transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

/** Verified result summary with the real before/after sizes. */
export const ResultSummary: React.FC<{
  inputSize: number;
  resultSize: number;
  duration?: number;
  originalDuration?: number;
  width?: number;
  height?: number;
  originalWidth?: number;
  originalHeight?: number;
  goal?: MediaGoalId;
}> = ({ inputSize, resultSize, duration, originalDuration, width, height, originalWidth, originalHeight, goal }) => {
  const pct = inputSize ? Math.round((1 - resultSize / inputSize) * 100) : 0;
  const isResize = Boolean(originalWidth && originalHeight && width && height && (originalWidth !== width || originalHeight !== height));
  const isTrim = Boolean(originalDuration && duration && Math.abs(originalDuration - duration) > 0.5);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <SummaryCell
        label={isResize ? "Dimensions" : "Original"}
        value={isResize ? `${originalWidth}×${originalHeight} → ${width}×${height}` : formatBytes(inputSize)}
      />
      <SummaryCell
        label={isResize ? "New size" : isTrim ? "Duration" : "Output size"}
        value={isTrim && duration ? `${fmtDur(originalDuration!)} → ${fmtDur(duration)}` : formatBytes(resultSize)}
        highlight
      />
      <SummaryCell
        label={goal === "save" ? "Format" : isResize ? "Resolution" : "Change"}
        value={
          goal === "save"
            ? "Untouched"
            : isResize
            ? `${width}×${height}`
            : `${pct >= 0 ? "−" : "+"}${Math.abs(pct)}%`
        }
        tone={pct > 0 && goal !== "save" ? "good" : "neutral"}
      />
      <SummaryCell
        label="Details"
        value={[
          width && height && !isResize ? `${width}×${height}` : "",
          duration && !isTrim ? fmtDur(duration) : "",
          goal === "audio" ? "16-bit PCM" : "",
        ]
          .filter(Boolean)
          .join(" · ") || "Verified"}
      />
    </div>
  );
};

const SummaryCell: React.FC<{ label: string; value: string; highlight?: boolean; tone?: "good" | "neutral" }> = ({
  label,
  value,
  highlight,
  tone = "neutral",
}) => (
  <div className="rounded-xl border border-border-light bg-surface-muted/20 p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
    <p
      className={`mt-0.5 font-mono text-sm font-bold ${
        highlight
          ? "text-brand-primary"
          : tone === "good"
          ? "text-status-success"
          : "text-text-main"
      }`}
    >
      {value}
    </p>
  </div>
);

/** A verified quality check — truthfully shows what we could confirm. */
export const VerifiedCheck: React.FC<{ lines: string[] }> = ({ lines }) => (
  <ul className="space-y-1.5">
    {lines.map((l, i) => (
      <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-status-success/15 text-status-success">
          <Check className="h-3 w-3" />
        </span>
        <span className="leading-snug">{l}</span>
      </li>
    ))}
  </ul>
);

export const formatBytes = (b: number): string => {
  if (!Number.isFinite(b) || b < 0) return "—";
  if (b < 1024) return `${b} B`;
  const u = ["KB", "MB", "GB"];
  let v = b;
  let i = -1;
  do {
    v /= 1024;
    i += 1;
  } while (v >= 1024 && i < u.length - 1);
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
};

export const fmtDur = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
};
