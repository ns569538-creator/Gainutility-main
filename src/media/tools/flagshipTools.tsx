/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flagshit Media tools — each wires the universal MediaTool to the real
 * local engines. All processing is done in the browser; nothing is sent to a
 * server.
 */

import React from "react";
import { useMediaFlow } from "../core/useMediaFlow";
import { MEDIA_TOOLS, MediaToolId, GOAL_META } from "../core/goals";
import { analyzeMedia } from "../core/analyze";
import { MediaTool, GoalCard } from "../ui/MediaTool";
import { renderMediaConfig } from "../ui/configForms";
import { MediaResult } from "../core/types";

interface FlagshipToolProps {
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const goalCards = (toolId: MediaToolId): GoalCard[] =>
  MEDIA_TOOLS[toolId].goals.map((g) => ({
    id: g.id,
    label: g.label,
    description: g.description,
  }));

const goalEnginesOf = (toolId: MediaToolId) => {
  const map: Record<string, any> = {};
  for (const g of MEDIA_TOOLS[toolId].goals) map[g.id] = g.engine;
  return map;
};

const defaultVerifyLines = (label: string) => (result: MediaResult, inputSize: number) => {
  const lines: string[] = [`The ${label} was written and re-read from your device.`];
  if (result.size > 0 && inputSize > 0) {
    const pct = Math.round((1 - result.size / inputSize) * 100);
    lines.push(
      pct > 0
        ? `Saved ${pct}% of the original file size (${formatBytes(inputSize)} → ${formatBytes(result.size)}).`
        : `New file: ${formatBytes(result.size)}.`
    );
  }
  if (result.verified.width && result.verified.height) {
    lines.push(`Verified dimensions: ${result.verified.width}×${result.verified.height}.`);
  }
  if (result.verified.durationSeconds) {
    lines.push(`Verified duration: ${fmtDur(result.verified.durationSeconds)}.`);
  }
  return lines;
};

export const VideoAudioExtractor: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, MOV, or MKV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-audio-extractor"
      goals={goalCards("video-audio-extractor")}
      engines={goalEnginesOf("video-audio-extractor") as any}
      onAddToast={onAddToast}
      verifyLines={defaultVerifyLines("audio track")}
    />
  );
};

export const VideoCompressor: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, or MOV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-compressor"
      goals={goalCards("video-compressor")}
      engines={goalEnginesOf("video-compressor") as any}
      onAddToast={onAddToast}
      defaultOptions={{ smaller: { videoBitsPerSecond: 2_500_000 } }}
      verifyLines={defaultVerifyLines("compressed video")}
    />
  );
};

export const VideoResizer: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, or MOV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-resizer"
      goals={goalCards("video-resizer")}
      engines={goalEnginesOf("video-resizer") as any}
      onAddToast={onAddToast}
      defaultOptions={{ resize: { width: 1280 }, social: { preset: "reel", width: 1080, height: 1920, fit: "cover" } }}
      verifyLines={defaultVerifyLines("resized video")}
    />
  );
};

export const VideoTrimmer: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, or MOV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-trimmer"
      goals={goalCards("video-trimmer")}
      engines={goalEnginesOf("video-trimmer") as any}
      onAddToast={onAddToast}
      verifyLines={defaultVerifyLines("trimmed video")}
    />
  );
};

export const VideoConverter: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, or MOV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-converter"
      goals={goalCards("video-converter")}
      engines={goalEnginesOf("video-converter") as any}
      onAddToast={onAddToast}
      verifyLines={defaultVerifyLines("converted video")}
    />
  );
};

export const VideoToGif: React.FC<FlagshipToolProps> = ({ onAddToast }) => {
  const flow = useMediaFlow({
    onAnalyze: (file, resolve, reject) =>
      analyzeMedia(file).then((r) => resolve(r.metadata, r.capabilities)).catch(() =>
        reject("We couldn’t read that file. Try an MP4, WebM, or MOV clip.")
      ),
  });
  return (
    <ToolShell
      flow={flow as any}
      toolId="video-to-gif"
      goals={goalCards("video-to-gif")}
      engines={goalEnginesOf("video-to-gif") as any}
      onAddToast={onAddToast}
      defaultOptions={{ create: { fps: 10, maxWidth: 480 } }}
      verifyLines={defaultVerifyLines("GIF")}
    />
  );
};

/* ------------------------------------------------------------------ */

interface ToolShellProps {
  flow: any;
  toolId: string;
  goals: GoalCard[];
  engines: any;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  defaultOptions?: any;
  verifyLines?: (result: MediaResult, inputSize: number) => string[];
}

export const ToolShell: React.FC<ToolShellProps> = ({
  flow,
  toolId,
  goals,
  engines,
  onAddToast,
  defaultOptions,
  verifyLines,
}) => {
  void GOAL_META;
  return (
    <MediaTool
      toolId={toolId}
      title={toolTitle(toolId)}
      goals={goals}
      goalEngines={engines}
      flow={flow}
      renderConfig={renderMediaConfig}
      defaultOptions={defaultOptions}
      verifyLines={verifyLines}
      onAddToast={onAddToast}
    />
  );
};

export const toolTitle = (id: string): string => {
  const map: Record<string, string> = {
    "video-audio-extractor": "Video Audio Extractor",
    "video-compressor": "Video Compressor",
    "video-resizer": "Video Resizer",
    "video-trimmer": "Video Trimmer",
    "video-converter": "Video Converter",
    "video-to-gif": "Video to GIF",
  };
  return map[id] ?? "Media Tool";
};

const formatBytes = (b: number): string => {
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
