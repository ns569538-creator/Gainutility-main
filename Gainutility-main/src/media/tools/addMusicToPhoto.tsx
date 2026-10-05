/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Add Music to Photo — turn a photo and an audio file into a share-ready video.
 * Single-file tool that uses the local addMusicToPhoto engine.
 */

import React, { useCallback, useRef, useState } from "react";
import { Upload, Plus, Trash2, RefreshCw, Download, Music, Image, Loader2, X } from "lucide-react";
import { MediaFile } from "../core/types";
import { addMusicToPhoto } from "../engines/toolEngines";
import { SOCIAL_PRESETS } from "../presets";

interface AddMusicToPhotoProps {
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const imgMime = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    gif: "image/gif", avif: "image/avif", bmp: "image/bmp",
  };
  return map[ext] ?? "image/*";
};

const audioMime = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", aac: "audio/aac",
    ogg: "audio/ogg", flac: "audio/flac",
  };
  return map[ext] ?? "audio/*";
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

const presetOptions: { id: string; label: string; width: number; height: number }[] = [
  { id: "whatsapp-status", label: "WhatsApp Status (9:16)", width: 1080, height: 1920 },
  { id: "instagram-story", label: "Instagram Story (9:16)", width: 1080, height: 1920 },
  { id: "instagram-reel", label: "Instagram Reel (9:16)", width: 1080, height: 1920 },
  { id: "youtube-shorts", label: "YouTube Shorts (9:16)", width: 1080, height: 1920 },
  { id: "tiktok", label: "TikTok (9:16)", width: 1080, height: 1920 },
  { id: "instagram-post", label: "Instagram Post (1:1)", width: 1080, height: 1080 },
  { id: "square", label: "Square (1:1)", width: 1080, height: 1080 },
  { id: "landscape", label: "Landscape (16:9)", width: 1920, height: 1080 },
  { id: "custom", label: "Custom", width: 0, height: 0 },
];

export const AddMusicToPhoto: React.FC<AddMusicToPhotoProps> = ({ onAddToast }) => {
  const [imageFile, setImageFile] = useState<MediaFile | null>(null);
  const [audioFile, setAudioFile] = useState<MediaFile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ blob: Blob; mimeType: string; filename: string; size: number; duration: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [preset, setPreset] = useState("whatsapp-status");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [background, setBackground] = useState("#111111");
  const [audioStart, setAudioStart] = useState(0);
  const [audioEnd, setAudioEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const selectedPreset = presetOptions.find(p => p.id === preset) ?? presetOptions[0];

  const width = preset === "custom" ? customWidth : selectedPreset.width;
  const height = preset === "custom" ? customHeight : selectedPreset.height;

  // Refs for latest values in run callback (avoids dependency array issues)
  const imageFileRef = useRef(imageFile);
  const audioFileRef = useRef(audioFile);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const audioStartRef = useRef(audioStart);
  const audioEndRef = useRef(audioEnd);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  const backgroundRef = useRef(background);
  const fitRef = useRef(fit);

  // Keep refs in sync
  imageFileRef.current = imageFile;
  audioFileRef.current = audioFile;
  widthRef.current = width;
  heightRef.current = height;
  audioStartRef.current = audioStart;
  audioEndRef.current = audioEnd;
  volumeRef.current = volume;
  mutedRef.current = muted;
  backgroundRef.current = background;
  fitRef.current = fit;

  const addImage = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    const f = list[0];
    const file: MediaFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      mimeType: f.type || imgMime(f.name),
      blob: f,
      size: f.size,
      kind: "image",
    };
    setImageFile(file);
    setImageUrl(URL.createObjectURL(f));
    onAddToast(`Added image: ${f.name}`, "success");
  }, [onAddToast]);

  const addAudio = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    const f = list[0];
    const file: MediaFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      mimeType: f.type || audioMime(f.name),
      blob: f,
      size: f.size,
      kind: "audio",
    };
    setAudioFile(file);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    if (audioRef.current) {
      audioRef.current.src = url;
    } else {
      const audio = new Audio(url);
      audioRef.current = audio;
    }
    onAddToast(`Added audio: ${f.name}`, "success");
  }, [onAddToast]);

  const removeImage = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
  }, [imageUrl]);

  const removeAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setAudioEnd(0);
  }, [audioUrl]);

  const handleAudioMetadata = useCallback(() => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || 0;
      setAudioDuration(dur);
      setAudioEnd(dur);
    }
  }, []);

  const clearAll = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setImageFile(null);
    setAudioFile(null);
    setImageUrl(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setAudioEnd(0);
    setResult(null);
  }, [imageUrl, audioUrl]);

  const run = async () => {
    if (!imageFileRef.current || !audioFileRef.current) {
      onAddToast("Please add both an image and an audio file.", "warning");
      return;
    }
    if (audioEndRef.current <= audioStartRef.current) {
      onAddToast("Audio end must be after start.", "warning");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setProcessing(true);
    setResult(null);
    setProgress(0);
    try {
      const engineResult = await addMusicToPhoto(
        imageFileRef.current,
        audioFileRef.current,
        {
          width: widthRef.current,
          height: heightRef.current,
          audioStart: audioStartRef.current,
          audioEnd: audioEndRef.current,
          volume: mutedRef.current ? 0 : volumeRef.current,
          background: backgroundRef.current,
          fit: fitRef.current,
        },
        {
          onProgress: (p, note) => {
            setProgress(p);
            if (controller.signal.aborted) throw new DOMException("Aborted", "AbortError");
          },
          signal: controller.signal,
        }
      );
      setResult({
        blob: engineResult.blob,
        mimeType: engineResult.mimeType,
        filename: engineResult.filename,
        size: engineResult.size,
        duration: engineResult.verified.durationSeconds || 0,
      });
      onAddToast("Video created successfully.", "success");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        onAddToast("Processing was cancelled.", "info");
      } else {
        onAddToast("Couldn't create the video. Try smaller files or check formats.", "error");
      }
    } finally {
      setProcessing(false);
      abortRef.current = null;
    }
  };

  const cancel = () => abortRef.current?.abort();

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onAddToast("Download started.", "success");
  };

  const pct = progress == null ? null : Math.round(progress * 100);

  const canProcess = imageFileRef.current && audioFileRef.current && audioEndRef.current > audioStartRef.current;

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Input zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image upload */}
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-main flex items-center gap-2">
              <Image className="h-4 w-4" /> Image
            </p>
            {imageFile && (
              <button onClick={removeImage} className="prBtnGhost text-xs">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
          {imageFile ? (
            <div className="mt-4 relative aspect-video overflow-hidden rounded-xl border border-border-light">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              {fit === "contain" && (
                <div className="absolute inset-0 border-2 border-dashed border-brand-primary/50 pointer-events-none" />
              )}
            </div>
          ) : (
            <div
              className="mt-4 relative aspect-video rounded-xl border-2 border-dashed border-border-medium bg-surface-muted/20 flex items-center justify-center cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              <div className="text-center p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light/40 text-brand-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-text-main">Add a photo</p>
                <p className="mt-1 text-xs text-text-muted">JPG, PNG, WebP</p>
              </div>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { addImage(e.target.files); e.target.value = ""; }}
          />
        </div>

        {/* Audio upload */}
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-main flex items-center gap-2">
              <Music className="h-4 w-4" /> Audio
            </p>
            {audioFile && (
              <button onClick={removeAudio} className="prBtnGhost text-xs">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
          {audioFile ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  onLoadedMetadata={handleAudioMetadata}
                  className="flex-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-text-muted">
                <span>Duration: {fmtDur(audioDuration)}</span>
                <span>Size: {formatBytes(audioFile.size)}</span>
              </div>
            </div>
          ) : (
            <div
              className="mt-4 rounded-xl border-2 border-dashed border-border-medium bg-surface-muted/20 p-6 text-center cursor-pointer"
              onClick={() => audioInputRef.current?.click()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light/40 text-brand-primary">
                <Music className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-text-main">Add an audio file</p>
              <p className="mt-1 text-xs text-text-muted">MP3, WAV, M4A, AAC</p>
            </div>
          )}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => { addAudio(e.target.files); e.target.value = ""; }}
          />
        </div>
      </div>

      {/* Settings */}
      {(imageFile || audioFile) && (
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Preset */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-[13px] font-semibold text-text-sub block mb-1.5">Preset</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                {presetOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            {/* Custom width/height */}
            {preset === "custom" && (
              <>
                <div>
                  <label className="text-[13px] font-semibold text-text-sub block mb-1.5">Width (px)</label>
                  <input
                    type="number"
                    min={160}
                    max={3840}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(160, Math.min(3840, Number(e.target.value) || 1080)))}
                    className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-text-sub block mb-1.5">Height (px)</label>
                  <input
                    type="number"
                    min={160}
                    max={3840}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(160, Math.min(3840, Number(e.target.value) || 1920)))}
                    className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
              </>
            )}
          </div>

          {/* Image fit & background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-semibold text-text-sub block mb-1.5">Image fit</label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as "cover" | "contain")}
                className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                <option value="cover">Cover (fill, may crop)</option>
                <option value="contain">Contain (fit, may letterbox)</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-text-sub block mb-1.5">Background color</label>
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full h-11 rounded-xl border border-border-light bg-surface-muted px-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Audio trim */}
          <div className="border-t border-border-light pt-4">
            <label className="text-[13px] font-semibold text-text-sub block mb-2">Audio trim</label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Start (seconds)</label>
                  <input
                    type="number"
                    min={0}
                    max={audioDuration}
                    step={0.1}
                    value={audioStart}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(audioDuration, Number(e.target.value) || 0));
                      setAudioStart(v);
                      if (audioRef.current) audioRef.current.currentTime = v;
                    }}
                    className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">End (seconds)</label>
                  <input
                    type="number"
                    min={0}
                    max={audioDuration}
                    step={0.1}
                    value={audioEnd}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(audioDuration, Number(e.target.value) || audioDuration));
                      setAudioEnd(v);
                    }}
                    className="w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={muted}
                      onChange={(e) => setMuted(e.target.checked)}
                      className="w-4 h-4 rounded border-border-medium text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-xs text-text-muted">Mute</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-text-muted">
                  <span>Volume: {Math.round(volume * 100)}%</span>
                  <span>{fmtDur(audioEnd - audioStart)} selected</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Output info */}
          <div className="rounded-xl border border-border-light bg-surface-muted/20 p-3 text-xs text-text-muted leading-relaxed">
            Output: {width}×{height} · {preset === "custom" ? "Custom" : selectedPreset.label} · {fmtDur(audioEnd - audioStart)} duration
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/10 px-2.5 py-1 text-[11px] font-semibold text-status-success">
            <Loader2 className="h-3 w-3" /> Processed in your browser
          </span>
        </div>
      )}

      {/* Action buttons */}
      {(imageFile || audioFile) && !processing && !result && (
        <div className="flex justify-end gap-3">
          <button onClick={clearAll} className="prBtnGhost">
            <RefreshCw className="h-4 w-4" /> Start over
          </button>
          <button
            onClick={run}
            disabled={!canProcess}
            className="prBtnPrimary"
          >
            <Loader2 className="h-4 w-4" /> Create video
          </button>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              Creating video…
            </div>
            {pct != null && <span className="font-mono font-bold text-brand-primary">{pct}%</span>}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full bg-brand-primary transition-all" style={{ width: pct == null ? "8%" : `${pct}%` }} />
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={cancel} className="prBtnGhost">Cancel</button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !processing && (
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm space-y-4">
          <p className="text-sm font-semibold text-text-main">Your video is ready.</p>
          <p className="text-xs text-text-muted">
            {result.filename} · {formatBytes(result.size)} · {fmtDur(result.duration)} · {width}×{height}
          </p>
          <video src={URL.createObjectURL(result.blob)} controls playsInline className="max-h-72 w-full rounded-xl border border-border-light bg-black" />
          <div className="flex flex-wrap gap-2">
            <button onClick={download} className="prBtnPrimary"><Download className="h-4 w-4" /> Download</button>
            <button onClick={clearAll} className="prBtnGhost"><RefreshCw className="h-4 w-4" /> Create another</button>
          </div>
        </div>
      )}
    </div>
  );
};