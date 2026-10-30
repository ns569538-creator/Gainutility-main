/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Video Downloader — the link-first media tool.
 *
 * Paste a link, we check it honestly, then route into the shared goal
 * workspace (save original, extract audio, compress, convert, trim, resize,
 * social formats). Dropping a file works exactly like the other media tools.
 *
 * Honesty rules:
 *  - Only direct file links with CORS can be fetched from a browser. Streaming
 *    platforms are recognised and refused with clear copy, never bypassed.
 *  - The goal cards shown are filtered to what the analysed media actually
 *    supports. An audio file never claims to "prepare for social".
 */

import React, { useRef, useState } from "react";
import { Link2, Upload, Loader2 } from "lucide-react";
import { useMediaFlow, MediaEngine } from "../core/useMediaFlow";
import { MEDIA_TOOLS } from "../core/goals";
import { analyzeMedia } from "../core/analyze";
import { analyzeLink } from "../sources/linkAnalyzer";
import { MediaTool, GoalCard } from "../ui/MediaTool";
import { renderMediaConfig } from "../ui/configForms";
import { LocalOnlyBadge } from "../ui/primitives";
import {
  MediaFile,
  MediaKind,
  MediaMetadata,
  MediaCapabilities,
  MediaResult,
  MediaGoalId,
} from "../core/types";

interface VideoDownloaderProps {
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const TOOL = "video-downloader" as const;

const goalsForKind = (kind: MediaKind): GoalCard[] =>
  MEDIA_TOOLS[TOOL].goals
    .filter((g) => g.accepts.includes(kind))
    .map((g) => ({ id: g.id, label: g.label, description: g.description }));

const enginesOf = (): Partial<Record<MediaGoalId, MediaEngine>> => {
  const map: Record<string, MediaEngine> = {};
  for (const g of MEDIA_TOOLS[TOOL].goals) map[g.id] = g.engine;
  return map;
};

const verifyLines = (result: MediaResult, inputSize: number): string[] => {
  const lines: string[] = [];
  if (result.verified.width && result.verified.height) {
    lines.push(`Verified dimensions: ${result.verified.width}×${result.verified.height}.`);
  }
  if (result.verified.durationSeconds) {
    lines.push(`Verified duration: ${fmtDur(result.verified.durationSeconds)}.`);
  }
  if (result.size === inputSize) {
    lines.push("Saved the original file as-is — no re-encoding happened.");
  } else {
    lines.push(`File size: ${formatBytes(result.size)} (compared with ${formatBytes(inputSize)} from the link).`);
    lines.push("The result was written and re-read from your device.");
  }
  return lines;
};

export const VideoDownloader: React.FC<VideoDownloaderProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file)
        .then((r) => resolve(r.metadata, r.capabilities))
        .catch(() =>
          reject("We couldn't read that file. Try an MP4, WebM, MOV, MP3, WAV, or image file.")
        ),
  });
  const { state, setMediaFound } = flow;

  const currentKind: MediaKind =
    state.kind === "media-found" ||
    state.kind === "goal-selection" ||
    state.kind === "configuring"
      ? state.file.kind
      : "video";

  return (
    <MediaTool
      toolId={TOOL}
      title="Video Downloader"
      goals={goalsForKind(currentKind)}
      goalEngines={enginesOf()}
      flow={flow}
      renderConfig={renderMediaConfig}
      verifyLines={verifyLines}
      defaultOptions={{ social: { preset: "reel", width: 1080, height: 1920, fit: "cover" } }}
      renderEmpty={({ onFiles, onToast }) => (
        <LinkInput onFiles={onFiles} onToast={onToast} onMediaFound={setMediaFound} />
      )}
      onAddToast={onAddToast}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Link-first empty state                                              */
/* ------------------------------------------------------------------ */

const LinkInput: React.FC<{
  onFiles: (files: FileList | null) => void;
  onToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onMediaFound: (file: MediaFile, metadata: MediaMetadata, capabilities: MediaCapabilities) => void;
}> = ({ onFiles, onToast, onMediaFound }) => {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw || checking) return;
    setChecking(true);
    setError(null);
    setErrorDetail(undefined);
    try {
      const result = await analyzeLink(raw);
      if (result.status === "ok") {
        const analysis = await analyzeMedia(result.file);
        onMediaFound(result.file, analysis.metadata, analysis.capabilities);
        onToast("The link checked out — the file is ready to work with.", "success");
      } else {
        const detail = "detail" in result && result.detail ? result.detail : undefined;
        setError(result.message);
        setErrorDetail(detail);
      }
    } catch {
      setError("We couldn't access this link.");
    } finally {
      setChecking(false);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorDetail(undefined);
    setValue("");
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragRef.current += 1;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragRef.current -= 1;
        if (dragRef.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragRef.current = 0;
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      className="rounded-2xl border border-border-light bg-surface-base p-6 shadow-premium-sm md:p-8"
    >
      <h1 className="text-2xl font-bold tracking-tight text-text-main md:text-3xl">
        Download a video from a link
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
        Paste a supported video link and we&rsquo;ll check what media is available.
      </p>

      <form onSubmit={submit} className="mt-6" aria-label="Check a media link">
        <label htmlFor="vd-link" className="text-[13px] font-semibold text-text-sub">
          Media link
        </label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <input
            id="vd-link"
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com/video.mp4"
            autoComplete="url"
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted/60 focus:border-brand-primary"
          />
          <button
            type="submit"
            disabled={checking || !value.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-[#FAF8F1] transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <Link2 className="h-4 w-4" />
            {checking ? "Checking…" : "Check link"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          No account required. Works with direct media links — YouTube, Instagram
          and streaming platforms aren&rsquo;t supported here.
        </p>
      </form>

      {checking && (
        <div className="mt-5 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
          Checking your link…
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-status-error/30 bg-status-error/5 p-4">
          <p className="text-sm font-semibold text-status-error">
            We couldn&rsquo;t use that link.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{error}</p>
          {errorDetail && (
            <p className="mt-1 text-xs leading-relaxed text-text-muted">{errorDetail}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={clearError} className="prBtnGhost">
              Try another link
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="prBtnGhost">
              <Upload className="h-4 w-4" />
              Upload the file instead
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-border-light pt-5">
        <div
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-5 py-5 text-center transition-colors ${
            dragging
              ? "border-brand-primary bg-brand-primary-light/10"
              : "border-border-medium bg-surface-muted/20 hover:border-brand-primary"
          }`}
        >
          <p className="text-sm font-semibold text-text-main">Or drop a file here</p>
          <p className="mt-1 text-xs text-text-muted">
            Click to choose a video, audio, or image file
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 pt-2 border-t border-border-light/60">
        <LocalOnlyBadge />
        <p className="text-center text-[11px] text-text-muted/80 max-w-lg leading-normal">
          Only download or transform media you have permission to use. GainUtility is not affiliated with third-party platforms.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*,audio/*,image/*"
        hidden
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */

const formatBytes = (b: number): string => {
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

const fmtDur = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  const m = Math.floor(t / 60);
  const sec = t % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};