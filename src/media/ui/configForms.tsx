/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared configuration forms for the Media platform goals.
 *
 * Each form emits plain options (via onChange) that the goal's engine reads.
 * All values are real: bitrate, dimensions, trim range, FPS, output format.
 */

import React from "react";
import { MediaGoalId, MediaFile, MediaMetadata, MediaCapabilities } from "../core/types";
import { SOCIAL_PRESETS, presetById } from "../presets";
import { MediaToolConfigProps } from "./MediaTool";


/* --- small labeled field -------------------------------------------------- */

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[13px] font-semibold text-text-sub">{label}</span>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors";

const unitCls = "text-xs text-text-muted";

/* --- format selectors ------------------------------------------------------ */

function supportedFormats(capabilities: MediaCapabilities): string[] {
  if (capabilities.videoFormats && capabilities.videoFormats.length) return capabilities.videoFormats;
  return ["video/webm"];
}

/** Human label for a mime pull. */
const mimeLabel = (mime: string): string => {
  if (mime.includes("mp4")) return "MP4";
  if (mime.includes("webm")) return "WebM";
  if (mime.includes("vp9")) return "WebM (VP9)";
  if (mime.includes("vp8")) return "WebM (VP8)";
  return mime.split(";")[0] || mime;
};

/**
 * Renders the appropriate configuration form for a media goal.
 * `onChange` merges patches; `onStart` is wired by MediaTool.
 */
export const renderMediaConfig = (
  props: MediaToolConfigProps,
  _ctx: { media: MediaFile; metadata: MediaMetadata; capabilities: MediaCapabilities }
): React.ReactNode => {
  const { goal, metadata, capabilities, value, onChange } = props;
  const duration = metadata.durationSeconds || 0;
  const maxWidth = capabilities.videoFormats.length ? 4096 : 1920;

  switch (goal) {
    case "save":
      return (
        <ConfigExplain
          title="Save the original file"
          body="No conversion is needed. The file we fetched from your link is written to your device exactly as it is — nothing is re-encoded, so the quality stays identical."
          onStart={props.onStart}
          startLabel="Save file"
        />
      );

    case "audio":
      return (
        <ConfigExplain
          title="Extract audio track"
          body="The audio track will be decoded by your browser and written to a high-quality WAV file. Nothing leaves your device."
          onStart={props.onStart}
        />
      );

    case "smaller": {
      const bitrate = Number(value.videoBitsPerSecond) || 2_500_000;
      const mbps = bitrate / 1_000_000;
      return (
        <div className="space-y-5">
          <Field label="Target video bitrate">
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.1}
              value={Math.min(8, Math.max(0.5, mbps))}
              onChange={(e) => onChange({ videoBitsPerSecond: Math.round(Number(e.target.value) * 1_000_000) })}
              className="w-full accent-brand-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>Smaller file · 0.5 Mbps</span>
              <span className="font-mono font-semibold text-brand-primary">{mbps.toFixed(1)} Mbps</span>
              <span>Higher quality · 8 Mbps</span>
            </div>
            <p className={unitCls}>
              Lower bitrate shrinks the file but may soften fine detail, especially in fast motion.
            </p>
          </Field>
          <Field label="Output format">
            <select
              className={inputCls}
              value={(value.mimeType as string) ?? ""}
              onChange={(e) => onChange({ mimeType: e.target.value })}
            >
              {supportedFormats(capabilities).map((m) => (
                <option key={m} value={m}>
                  {mimeLabel(m)}
                </option>
              ))}
            </select>
          </Field>
          <StartButton onClick={props.onStart} label="Compress & download" />
        </div>
      );
    }

    case "resize": {
      const width = Number(value.width) || metadata.width || 1280;
      return (
        <div className="space-y-5">
          <Field label="Output width (px)">
            <input
              type="number"
              min={160}
              max={maxWidth}
              step={16}
              value={width}
              onChange={(e) => onChange({ width: Number(e.target.value) })}
              className={inputCls}
            />
            <p className={unitCls}>
              Height scales to keep the original aspect ratio. Original: {metadata.width ? `${metadata.width}×${metadata.height}` : "unknown"}.
            </p>
          </Field>
          <PresetRow width={width} onPick={(w) => onChange({ width: w })} />
          <StartButton onClick={props.onStart} label="Resize & download" />
        </div>
      );
    }

    case "social": {
      const preset = presetById((value.preset as string) ?? "reel");
      return (
        <div className="space-y-5">
          <Field label="Target format">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOCIAL_PRESETS.filter((p) => p.id !== "custom").map((p) => {
                const sel = (value.preset as string) === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      onChange({ preset: p.id, width: p.width, height: p.height, fit: "cover" })
                    }
                    className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition-colors cursor-pointer ${
                      sel
                        ? "border-brand-primary bg-brand-primary-light/30 text-brand-primary-dark"
                        : "border-border-light bg-surface-base text-text-sub hover:border-brand-primary"
                    }`}
                  >
                    <span className="block">{p.name}</span>
                    <span className="mt-0.5 block text-[10px] font-normal text-text-muted">
                      {p.width}×{p.height} · {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="rounded-xl border border-border-light bg-surface-muted/20 p-3 text-xs text-text-muted leading-relaxed">
            The clip is centre-cropped to {preset ? `${preset.width}×${preset.height}` : "the selected"} aspect. Adding
            black pillars is never needed — a true crop fits the frame exactly.
          </div>
          {preset && (
            <Field label="Pixels">
              <span className="font-mono text-sm font-semibold text-text-main">
                {preset.width} × {preset.height}
              </span>
            </Field>
          )}
          <StartButton onClick={props.onStart} label="Prepare & download" />
        </div>
      );
    }

    case "trim": {
      const start = Number(value.start) || 0;
      const end = Number(value.end) || duration || 0;
      const safeStart = Math.min(start, Math.max(0, duration || 0));
      const safeEnd = Math.min(end, duration || 0) || duration || 0;
      return (
        <div className="space-y-5">
          <Field label="Trim range (seconds)">
            <div className="space-y-2">
              <label className="text-xs text-text-muted">
                Start: <span className="font-mono text-brand-primary font-semibold">{safeStart.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, duration || 1)}
                step={0.5}
                value={safeStart}
                onChange={(e) => onChange({ start: Number(e.target.value) })}
                className="w-full accent-brand-primary cursor-pointer"
              />
              <label className="text-xs text-text-muted">
                End: <span className="font-mono text-brand-primary font-semibold">{safeEnd.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, duration || 1)}
                step={0.5}
                value={safeEnd}
                onChange={(e) => onChange({ end: Number(e.target.value) })}
                className="w-full accent-brand-primary cursor-pointer"
              />
            </div>
            <p className={unitCls}>
              Duration: <span className="font-mono font-semibold">{fmtDur(safeEnd - safeStart)}</span> of {fmtDur(duration)}. Drag both handles to select the section to keep.
            </p>
          </Field>
          <div className="flex flex-wrap gap-2">
            <StartButton onClick={props.onStart} label="Trim & download" />
            <button
              type="button"
              onClick={() => onChange({ start: 0, end: duration || 0 })}
              className="prBtnGhost"
            >
              Select whole clip
            </button>
          </div>
        </div>
      );
    }

    case "convert": {
      const fmt = (value.mimeType as string) ?? supportedFormats(capabilities)[0];
      return (
        <div className="space-y-5">
          <Field label="Output format">
            <div className="grid grid-cols-2 gap-2">
              {supportedFormats(capabilities).map((m) => {
                const sel = fmt === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange({ mimeType: m })}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                      sel
                        ? "border-brand-primary bg-brand-primary-light/30 text-brand-primary-dark"
                        : "border-border-light bg-surface-base text-text-sub hover:border-brand-primary"
                    }`}
                  >
                    {mimeLabel(m)}
                  </button>
                );
              })}
            </div>
            <p className={unitCls}>
              Conversion is performed by re-encoding locally. Only containers this browser can write are offered.
            </p>
          </Field>
          <StartButton onClick={props.onStart} label="Convert & download" />
        </div>
      );
    }

    case "create": {
      const fps = Number(value.fps) || 10;
      const maxWidth = Number(value.maxWidth) || 480;
      const start = Number(value.start) || 0;
      const end = Number(value.end) || duration || 0;
      return (
        <div className="space-y-5">
          <Field label="Sequence start (s)">
            <input
              type="number" min={0} max={Math.max(0, duration || 1)} step={1} value={start}
              onChange={(e) => onChange({ start: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="Sequence end (s)">
            <input
              type="number" min={0} max={Math.max(0, duration || 1)} step={1} value={end}
              onChange={(e) => onChange({ end: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Frames per second">
              <input
                type="number" min={2} max={15} step={1} value={fps}
                onChange={(e) => onChange({ fps: Number(e.target.value) })}
                className={inputCls}
              />
              <p className={unitCls}>Lower FPS = smaller GIF.</p>
            </Field>
            <Field label="Max width (px)">
              <input
                type="number" min={160} max={1280} step={40} value={maxWidth}
                onChange={(e) => onChange({ maxWidth: Number(e.target.value) })}
                className={inputCls}
              />
              <p className={unitCls}>Smaller width = smaller GIF.</p>
            </Field>
          </div>
          <StartButton onClick={props.onStart} label="Create GIF" />
        </div>
      );
    }

    default:
      return (
        <div className="text-sm text-text-muted">
          This goal doesn’t need any extra settings — just press {`“Start”`}. {void goal}
        </div>
      );
  }
};

/* --- small helpers --------------------------------------------------------- */

const PresetRow: React.FC<{ width: number; onPick: (w: number) => void }> = ({ width, onPick }) => (
  <div className="flex flex-wrap gap-2">
    {[480, 720, 1080, 1440, 2160].map((w) => (
      <button
        key={w}
        type="button"
        onClick={() => onPick(w)}
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
          width === w
            ? "border-brand-primary bg-brand-primary-light/30 text-brand-primary-dark"
            : "border-border-light bg-surface-base text-text-sub hover:border-brand-primary"
        }`}
      >
        {w}p
      </button>
    ))}
  </div>
);

const StartButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button onClick={onClick} className="prBtnPrimary">
    {label}
  </button>
);

const ConfigExplain: React.FC<{ title: string; body: string; onStart: () => void; startLabel?: string }> = ({
  title,
  body,
  onStart,
  startLabel = "Start",
}) => (
  <div className="space-y-4">
    <div>
      <p className="text-sm font-semibold text-text-main">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
    <StartButton onClick={onStart} label={startLabel} />
  </div>
);

const fmtDur = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  const m = Math.floor(t / 60);
  const sec = t % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};
