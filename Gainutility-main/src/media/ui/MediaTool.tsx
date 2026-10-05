/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MediaTool — the universal, goal-first media workspace.
 *
 * Renders the full shared flow for any media tool:
 *   EMPTY → FILE_SELECTED → ANALYZING → MEDIA_FOUND → GOAL_SELECTION →
 *   CONFIGURING → PROCESSING → VERIFYING → SUCCESS / ERROR
 *
 * Tools only supply a goal list, a per-goal engine, and a per-goal
 * configuration renderer. Everything else — file input, analysis, goal picker,
 * progress, verification, result and download — is shared here once.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Upload, RefreshCw, Download, ArrowLeft, Captions } from "lucide-react";
import { MediaGoalId, MediaFile, MediaMetadata, MediaCapabilities, MediaResult } from "../core/types";
import { MediaEngine, UseMediaFlowResult } from "../core/useMediaFlow";
import { GoalSelector, LocalOnlyBadge, ActivityStrip, ResultSummary, VerifiedCheck, KindBadge } from "./primitives";

export interface GoalCard {
  id: MediaGoalId;
  label: string;
  description: string;
}

export interface MediaToolConfigProps {
  goal: MediaGoalId;
  file: MediaFile;
  metadata: MediaMetadata;
  capabilities: MediaCapabilities;
  value: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
  onStart: () => void;
}

export interface MediaToolProps {
  toolId: string;
  title: string;
  goals: GoalCard[];
  /** Engine for each goal this tool supports. */
  goalEngines: Partial<Record<MediaGoalId, MediaEngine>>;
  flow: UseMediaFlowResult;
  renderConfig: (props: MediaToolConfigProps, ctx: {
    media: MediaFile;
    metadata: MediaMetadata;
    capabilities: MediaCapabilities;
  }) => React.ReactNode;
  verifyLines?: (result: MediaResult, inputSize: number) => string[];
  defaultOptions?: Partial<Record<MediaGoalId, Record<string, any>>>;
  /**
   * Optional replacement for the default drop zone in the empty state.
   * Link-first tools use this to show a paste-a-link field while still
   * handing dropped files to the shared flow via `onFiles`.
   */
  renderEmpty?: (props: {
    onFiles: (files: FileList | null) => void;
    onToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  }) => React.ReactNode;
  onDownload?: (result: MediaResult) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const guessMime = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
    avi: "video/x-msvideo", mkv: "video/x-matroska", mp3: "audio/mpeg", m4a: "audio/mp4",
    wav: "audio/wav", ogg: "audio/ogg", aac: "audio/aac", flac: "audio/flac",
    gif: "image/gif", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  };
  return map[ext] ?? "";
};

const guessKind = (mime: string): MediaFile["kind"] => {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  return "unknown";
};

export const MediaTool: React.FC<MediaToolProps> = ({
  toolId,
  title,
  goals,
  goalEngines,
  flow,
  renderConfig,
  verifyLines,
  defaultOptions,
  renderEmpty,
  onDownload,
  onAddToast,
}) => {
  const { state, setFile, startAnalysis, pickGoal, startProcessing, reset, cancel, progress, note } = flow;
  const [options, setOptions] = useState<Record<string, any>>({});
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      const mime = f.type || guessMime(f.name);
      const file: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        mimeType: mime,
        blob: f,
        size: f.size,
        kind: guessKind(mime),
      };
      setFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(f));
      setOptions({});
      onAddToast(`Added "${f.name}".`, "success");
    },
    [setFile, previewUrl, onAddToast]
  );

  useEffect(() => {
    const w = window as any;
    if (w.__gainutility_handoff_files && w.__gainutility_handoff_files.length > 0) {
      const list = w.__gainutility_handoff_files;
      w.__gainutility_handoff_files = undefined;
      handleFiles(list as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeField = useCallback((patch: Record<string, any>) => {
    setOptions((prev) => ({ ...prev, ...patch }));
  }, []);

  const download = useCallback(
    (result: MediaResult) => {
      const link = document.createElement("a");
      const url = URL.createObjectURL(result.blob);
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onAddToast("Download started.", "success");
      onDownload?.(result);
    },
    [onAddToast, onDownload]
  );

  const currentGoal = state.kind === "configuring" ? state.goal : undefined;

  return (
    <div className="py-4 md:py-6 space-y-6">
      {state.kind === "empty" && (
        renderEmpty ? (
          renderEmpty({ onFiles: handleFiles, onToast: onAddToast })
        ) : (
          <UniversalInput onFiles={handleFiles} onToast={onAddToast} />
        )
      )}

      {state.kind === "file-selected" && (
        <FileSelectedCard file={state.file} url={previewUrl} onAnalyze={startAnalysis} onReset={() => setFile(null)} />
      )}

      {state.kind === "analyzing" && (
        <ActivityStrip title="Analyzing your file…" note="Reading duration, resolution, and audio track." progress={progress} />
      )}

      {(state.kind === "media-found" || state.kind === "goal-selection") && (
        <div className="space-y-5">
          <MetaCard file={state.file} metadata={state.metadata} onReset={reset} />
          <div>
            <h2 className="text-base font-bold text-text-main">
              {state.file.kind === "video"
                ? "We found a video."
                : state.file.kind === "audio"
                ? "We found an audio track."
                : "We found your media."}
            </h2>
            <p className="mt-0.5 mb-3 text-sm text-text-muted">What do you want to do with it?</p>
            <GoalSelector goals={goals} onSelect={pickGoal} />
          </div>
        </div>
      )}

      {state.kind === "configuring" && (
        <ConfigStep
          goal={state.goal}
          file={state.file}
          metadata={state.metadata}
          capabilities={state.capabilities}
          value={options}
          onChange={changeField}
          goals={goals}
          renderConfig={renderConfig}
          toolId={toolId}
          title={title}
          onStart={async () => {
            const engine = goalEngines[state.goal];
            if (!engine) {
              onAddToast("This operation isn’t available in your browser yet.", "error");
              return;
            }
            await startProcessing(engine, state.goal, {
              ...defaultOptions?.[state.goal],
              ...options,
            });
          }}
        />
      )}

      {state.kind === "processing" && (
        <ActivityStrip title="Processing locally…" note={note} progress={progress} onCancel={cancel} />
      )}

      {state.kind === "verifying" && (
        <ActivityStrip title="Verifying the result…" progress={progress} />
      )}

      {state.kind === "success" && (
        <SuccessStep
          goal={state.goal}
          result={state.result}
          inputSize={state.inputSize}
          inputMetadata={state.inputMetadata}
          verifyLines={verifyLines}
          onDownload={download}
          onReset={reset}
          goals={goals}
          onChainAction={(nextGoal) => {
            if (state.kind !== "success") return;
            const { result } = state;
            const chainedFile: MediaFile = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: result.filename,
              mimeType: result.mimeType,
              blob: result.blob,
              size: result.size,
              kind: result.kind,
            };
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(result.blob));
            setOptions({});
            const isVideo = result.kind === "video";
            const isAudio = result.kind === "audio";
            const capabilities: MediaCapabilities = {
              canExtractAudio: isVideo && Boolean(result.verified.hasAudio),
              canReencodeVideo: isVideo,
              videoFormats: isVideo ? ["webm", "mp4"] : [],
              audioFormats: isVideo || isAudio ? ["wav"] : [],
              canResize: isVideo,
              canTrim: Boolean(result.verified.durationSeconds && result.verified.durationSeconds > 0),
              canCompress: isVideo || isAudio,
              canRasterize: isVideo,
            };
            flow.setMediaFound(chainedFile, result.verified, capabilities);
            flow.pickGoal(nextGoal);
            onAddToast(`Ready to ${nextGoal}.`, "info");
          }}
        />
      )}

      {state.kind === "error" && (
        <div className="rounded-2xl border border-status-error/30 bg-status-error/5 p-5">
          <p className="text-sm font-semibold text-status-error">We couldn’t process this file.</p>
          <p className="mt-1 text-xs text-text-muted">{state.error.message}</p>
          {state.error.retryable && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={reset} className="prBtnPrimary">
                <RefreshCw className="h-4 w-4" />
                Start over
              </button>
            </div>
          )}
        </div>
      )}

      {/* prevent unused warning */}
      {void currentGoal}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Leaf components                                                     */
/* ------------------------------------------------------------------ */

const FileSelectedCard: React.FC<{ file: MediaFile; url?: string; onAnalyze: () => void; onReset: () => void }> = ({
  file,
  url,
  onAnalyze,
  onReset,
}) => (
  <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <FileThumb kind={file.kind} url={url} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-text-main">{file.name}</p>
          <KindBadge kind={file.kind} />
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {formatSize(file.size)} · {file.mimeType || "unknown type"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onAnalyze} className="prBtnPrimary">
            <Captions className="h-4 w-4" />
            Analyze file
          </button>
          <button onClick={onReset} className="prBtnGhost">
            <ArrowLeft className="h-4 w-4" />
            Choose a different file
          </button>
        </div>
      </div>
    </div>
    <div className="mt-4">
      <LocalOnlyBadge />
    </div>
  </div>
);

const MetaCard: React.FC<{ file: MediaFile; metadata: MediaMetadata; onReset: () => void }> = ({
  file,
  metadata,
  onReset,
}) => (
  <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-semibold text-text-main">{file.name}</p>
        <p className="mt-0.5 text-xs text-text-muted">{metaLine(metadata)} · {formatSize(file.size)}</p>
      </div>
      <button onClick={onReset} className="prBtnGhost">
        <RefreshCw className="h-4 w-4" />
        Change file
      </button>
    </div>
  </div>
);

const ConfigStep: React.FC<{
  goal: MediaGoalId;
  file: MediaFile;
  metadata: MediaMetadata;
  capabilities: MediaCapabilities;
  value: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
  goals: GoalCard[];
  renderConfig: MediaToolProps["renderConfig"];
  toolId: string;
  title: string;
  onStart: () => void;
}> = ({ goal, file, metadata, capabilities, value, onChange, goals, renderConfig, toolId, title, onStart }) => {
  const goalDef = goals.find((g) => g.id === goal);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {goalDef?.label ?? "Configure"}
        </p>
        <div className="mt-4">
          {renderConfig(
            { goal, file, metadata, capabilities, value, onChange, onStart },
            { media: file, metadata, capabilities }
          )}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</p>
          <p className="mt-1 truncate text-sm font-semibold text-text-main">{file.name}</p>
          <p className="mt-0.5 text-xs text-text-muted">{metaLine(metadata)}</p>
          <div className="mt-3">
            <LocalOnlyBadge />
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessStep: React.FC<{
  goal: MediaGoalId;
  result: MediaResult;
  inputSize: number;
  inputMetadata?: MediaMetadata;
  verifyLines?: (result: MediaResult, inputSize: number) => string[];
  onDownload: (result: MediaResult) => void;
  onReset: () => void;
  goals: GoalCard[];
  onChainAction?: (goalId: MediaGoalId) => void;
}> = ({ goal, result, inputSize, inputMetadata, verifyLines, onDownload, onReset, goals, onChainAction }) => {
  const [objUrl, setObjUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    const url = URL.createObjectURL(result.blob);
    setObjUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result.blob]);

  // Contextually relevant next actions based on output kind
  const nextGoals = goals.filter((g) => {
    if (g.id === goal && goal !== "save") return false;
    if (result.kind === "video") {
      return ["audio", "smaller", "trim", "resize", "social", "create"].includes(g.id);
    }
    if (result.kind === "audio") {
      return ["trim"].includes(g.id);
    }
    return false;
  });

  return (
    <div className="space-y-5 pb-16 sm:pb-0">
      <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-base font-bold text-text-main">Ready to download.</p>
            <p className="mt-0.5 text-xs text-text-muted">{result.filename}</p>
          </div>
          <button onClick={() => onDownload(result)} className="prBtnPrimary hidden sm:inline-flex">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>

        <div className="mt-4">
          <ResultSummary
            inputSize={inputSize}
            resultSize={result.size}
            duration={result.verified.durationSeconds}
            originalDuration={inputMetadata?.durationSeconds}
            width={result.verified.width}
            height={result.verified.height}
            originalWidth={inputMetadata?.width}
            originalHeight={inputMetadata?.height}
            goal={goal}
          />
        </div>

        {verifyLines && (
          <div className="mt-4 rounded-xl border border-border-light bg-surface-muted/20 p-4">
            <VerifiedCheck lines={verifyLines(result, inputSize)} />
          </div>
        )}

        {objUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border-light">
            {result.kind === "video" ? (
              <video src={objUrl} controls playsInline className="max-h-72 w-full bg-black" />
            ) : result.kind === "audio" ? (
              <audio src={objUrl} controls className="w-full" />
            ) : (
              <img src={objUrl} alt="" className="max-h-72 w-full object-contain bg-black" />
            )}
          </div>
        )}

        {/* Next Actions Chaining */}
        {nextGoals.length > 0 && onChainAction && (
          <div className="mt-6 border-t border-border-light pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Need something else?
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Use this output directly in another operation:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nextGoals.map((ng) => (
                <button
                  key={ng.id}
                  type="button"
                  onClick={() => onChainAction(ng.id)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border-light bg-surface-muted/30 p-2.5 text-left text-xs font-medium text-text-main transition-colors hover:border-brand-primary hover:bg-surface-muted cursor-pointer"
                >
                  <span className="font-semibold">{ng.label}</span>
                  <span className="text-text-muted text-[11px] truncate">{ng.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onDownload(result)} className="prBtnPrimary">
          <Download className="h-4 w-4" />
          Download {result.filename}
        </button>
        <button onClick={onReset} className="prBtnGhost">
          <RefreshCw className="h-4 w-4" />
          Process another
        </button>
      </div>

      {/* Mobile sticky download bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-border-light bg-surface-base/95 p-3 backdrop-blur shadow-premium-lg sm:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-text-main">{result.filename}</p>
          <p className="text-[10px] text-text-muted">{formatSize(result.size)} · Ready</p>
        </div>
        <button
          onClick={() => onDownload(result)}
          className="prBtnPrimary h-10 px-4 text-xs shrink-0"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
};

const UniversalInput: React.FC<{ onFiles: (f: FileList | null) => void; onToast: (m: string, t: "success" | "error" | "warning" | "info") => void }> = ({
  onFiles,
  onToast,
}) => {
  const dragRef = React.useRef<number>(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragEnter={(e) => { e.preventDefault(); dragRef.current += 1; setDragging(true); }}
      onDragLeave={() => { dragRef.current -= 1; if (dragRef.current <= 0) setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        dragRef.current = 0;
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging ? "border-brand-primary bg-brand-primary-light/10" : "border-border-medium bg-surface-base"
      }`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-light/40 text-brand-primary">
        <Upload className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-text-main">Drop a video or audio file here</p>
      <p className="mt-1 text-xs text-text-muted">MP4, WebM, MOV, MKV, MP3, WAV and more</p>
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-[#FAF8F1] hover:bg-brand-primary-hover cursor-pointer"
      >
        <Upload className="h-4 w-4" />
        Choose a file
      </button>
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }}
      />
      <div className="mt-4 flex justify-center">
        <LocalOnlyBadge />
      </div>
      <p className="mt-3 text-[11px] text-text-muted">Files never leave your device.</p>
      {void onToast}
    </div>
  );
};

const FileThumb: React.FC<{ kind: MediaFile["kind"]; url?: string }> = ({ kind, url }) => {
  const isImage = kind === "image" && url;
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-light bg-surface-muted">
      {isImage ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl" aria-hidden>
          🎞️
        </span>
      )}
    </div>
  );
};

const formatSize = (b: number): string => {
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

const metaLine = (m: MediaMetadata): string => {
  const parts: string[] = [];
  if (m.durationSeconds != null) parts.push(`Duration ${fmtS(m.durationSeconds)}`);
  if (m.width && m.height) parts.push(`${m.width}×${m.height}`);
  if (m.hasAudio !== undefined) parts.push(m.hasAudio ? "with audio" : "no audio");
  if (m.container) parts.push(m.container.toUpperCase());
  return parts.join(" · ") || "Metadata";
};

const fmtS = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  const m = Math.floor(t / 60);
  const sec = t % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};
