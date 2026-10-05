/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Photos to Video — turn several images into a short slideshow video.
 * Dedicated multi-file tool that reuses the local imagesToVideo engine.
 */

import React, { useCallback, useRef, useState } from "react";
import { Upload, Plus, Trash2, RefreshCw, Download, Sparkles } from "lucide-react";
import { MediaFile } from "../core/types";
import { photosToVideo } from "../engines/toolEngines";

interface PhotosToVideoProps {
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

export const PhotosToVideo: React.FC<PhotosToVideoProps> = ({ onAddToast }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [secondsPerImage, setSecondsPerImage] = useState(3);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ blob: Blob; mimeType: string; filename: string; size: number; duration: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    const items: MediaFile[] = Array.from(list).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      mimeType: f.type || imgMime(f.name),
      blob: f,
      size: f.size,
      kind: "image",
    }));
    setFiles((prev) => {
      const next = [...prev, ...items];
      setUrls((prevUrls) => [
        ...prevUrls,
        ...items.map((it) => URL.createObjectURL(it.blob)),
      ]);
      return next;
    });
    onAddToast(`Added ${items.length} image(s).`, "success");
  }, [onAddToast]);

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next;
      });
      setUrls((prev) => {
        const kept = [...prev];
        const removed = kept.splice(index, 1);
        removed.forEach((u) => URL.revokeObjectURL(u));
        return kept;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    urls.forEach((u) => URL.revokeObjectURL(u));
    setUrls([]);
    setFiles([]);
    setResult(null);
  }, [urls]);

  const run = async () => {
    if (files.length < 2) {
      onAddToast("Add at least two images to make a slideshow.", "warning");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setProcessing(true);
    setResult(null);
    setProgress(0);
    try {
      const engineResult = await photosToVideo(
        files,
        { width, height, secondsPerImage },
        {
          onProgress: (p) => {
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
      onAddToast("Slideshow created.", "success");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        onAddToast("Processing was cancelled.", "info");
      } else {
        onAddToast("Couldn’t build the slideshow. Try fewer or smaller images.", "error");
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

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Input zone */}
      {files.length === 0 && (
        <div
          className="rounded-2xl border-2 border-dashed border-border-medium bg-surface-base p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-light/40 text-brand-primary">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-text-main">Add the photos for your slideshow</p>
          <p className="mt-1 text-xs text-text-muted">Select several images — PNG, JPG, WebP</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-[#FAF8F1] hover:bg-brand-primary-hover cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add images
          </button>
        </div>
      )}

      {/* Thumbnail list + settings */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-semibold text-text-main">{files.length} image{files.length > 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button onClick={() => inputRef.current?.click()} className="prBtnGhost">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button onClick={clearAll} className="prBtnGhost">
                  <Trash2 className="h-4 w-4" /> Clear
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map((f, i) => (
                <div key={f.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border-light">
                  <img src={urls[i]} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-status-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {processing ? (
              <div className="mt-5 rounded-xl border border-border-light bg-surface-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                    Building slideshow…
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
            ) : (
              <div className="mt-5 flex justify-end">
                <button onClick={run} className="prBtnPrimary">
                  <Sparkles className="h-4 w-4" />
                  Create slideshow
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Slideshow settings</p>
              <div className="mt-4 space-y-4">
                <Field label="Seconds per image">
                  <input
                    type="range" min={1} max={10} step={0.5} value={secondsPerImage}
                    onChange={(e) => setSecondsPerImage(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <span className="font-mono text-brand-primary text-sm font-semibold">{secondsPerImage}s</span>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width (px)">
                    <input type="number" min={320} max={3840} value={width} onChange={(e) => setWidth(Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Height (px)">
                    <input type="number" min={320} max={3840} value={height} onChange={(e) => setHeight(Number(e.target.value))} className={inputCls} />
                  </Field>
                </div>
                <div className="rounded-xl border border-border-light bg-surface-muted/20 p-3 text-xs text-text-muted leading-relaxed">
                  Images are centre-fitted onto a solid background. Output is a video, generated entirely on your device.
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success/30 bg-status-success/10 px-2.5 py-1 text-[11px] font-semibold text-status-success">
                  <Sparkles className="h-3 w-3" /> Processed in your browser
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !processing && (
        <div className="rounded-2xl border border-border-light bg-surface-base p-5 shadow-premium-sm">
          <p className="text-sm font-semibold text-text-main">Your slideshow is ready.</p>
          <p className="mt-1 text-xs text-text-muted">
            {result.filename} · {formatBytes(result.size)} · {fmtDur(result.duration)}
          </p>
          <video src={URL.createObjectURL(result.blob)} controls playsInline className="mt-4 max-h-72 w-full rounded-xl border border-border-light bg-black" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={download} className="prBtnPrimary"><Download className="h-4 w-4" /> Download</button>
            <button onClick={clearAll} className="prBtnGhost"><RefreshCw className="h-4 w-4" /> Start over</button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[13px] font-semibold text-text-muted">{label}</span>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-border-light bg-surface-muted px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-brand-primary transition-colors";

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
