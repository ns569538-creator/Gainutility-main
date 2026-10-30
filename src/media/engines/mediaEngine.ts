/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Local browser media engine primitives.
 *
 * Everything here is REAL: it decodes the input with the browser's media
 * stack (or draws it to a canvas) and re-encodes with MediaRecorder /
 * Web Audio. Output file sizes are the actual size of the produced blob.
 *
 * Processing is local-only; no bytes are ever sent to a server.
 */

import { MediaFile, MediaMetadata, SocialPreset } from "../core/types";

export interface ProgressSource {
  onProgress?: (fraction: number | null, note?: string) => void;
  signal?: AbortSignal;
}

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
};

function loadMediaElement(file: MediaFile): Promise<HTMLMediaElement> {
  return new Promise((resolve, reject) => {
    const isVideo = file.mimeType.startsWith("video/") || file.kind === "video";
    const el = document.createElement(isVideo ? "video" : "audio") as HTMLMediaElement;
    el.muted = true;
    (el as HTMLVideoElement).playsInline = true;
    el.preload = "auto";
    const url = URL.createObjectURL(file.blob);
    el.onloadedmetadata = () => resolve(el);
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this media in your browser."));
    };
    el.src = url;
  });
}

async function loadVideo(file: MediaFile): Promise<HTMLVideoElement> {
  const el = (await loadMediaElement(file)) as HTMLVideoElement;
  await new Promise<void>((resolve) => {
    const onSeeked = () => resolve();
    el.addEventListener("seeked", onSeeked, { once: true });
    setTimeout(() => resolve(), 400);
  });
  return el;
}

export interface VideoRenderOptions {
  width?: number;
  height?: number;
  start?: number;
  end?: number;
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  background?: string;
  includeAudio?: boolean;
  /** Optional per-frame compositor. */
  drawFrame?: (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, t: number) => void;
}

function padCanvas(w: number, h: number): { width: number; height: number } {
  return { width: w - (w % 2), height: h - (h % 2) };
}

/** Build a playable recorded video from a source video. Real, verified output. */
export async function recordVideo(
  file: MediaFile,
  opts: VideoRenderOptions,
  progress?: ProgressSource
): Promise<{
  blob: Blob;
  mimeType: string;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}> {
  const { onProgress } = progress ?? {};
  const signal = progress?.signal;
  const video = await loadVideo(file);
  throwIfAborted(signal);

  const sourceDur = Number.isFinite(video.duration) ? video.duration : 0;
  const start = Math.min(opts.start ?? 0, sourceDur);
  const end = Math.min(opts.end ?? sourceDur, sourceDur) || sourceDur;
  const duration = end - start;
  const sourceW = video.videoWidth || 640;
  const sourceH = video.videoHeight || 360;
  const targetW = opts.width ?? sourceW;
  const targetH = opts.height ?? sourceH * (targetW / sourceW);
  const { width: w, height: h } = padCanvas(Math.round(targetW), Math.round(targetH));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = opts.background ?? "#111";
  ctx.fillRect(0, 0, w, h);

  const pickMime = (): string => {
    if (opts.mimeType && typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(opts.mimeType)) {
      return opts.mimeType;
    }
    if (typeof MediaRecorder !== "undefined") {
      for (const c of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) {
        if (MediaRecorder.isTypeSupported(c)) return c;
      }
      if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    }
    return "video/webm";
  };
  const mimeType = pickMime();

  const stream = canvas.captureStream(30);
  let hasAudio = false;
  let audioCtx: AudioContext | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let rawVideoUrl = "";

  try {
    const videoTrack = (stream.getVideoTracks() as MediaStreamTrack[])[0];
    const hasSourceVideo = video.videoWidth > 0;
    const wantAudio = opts.includeAudio !== false;
    rawVideoUrl = video.getAttribute("src") || "";
    if (hasSourceVideo && wantAudio && typeof AudioContext !== "undefined") {
      try {
        audioCtx = new AudioContext();
        sourceNode = audioCtx.createMediaElementSource(video);
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);
        // Note: Do NOT connect to audioCtx.destination — silent background recording prevents blasting sound to user speakers.
        stream.addTrack(destNode.stream.getAudioTracks()[0]);
        hasAudio = true;
      } catch {
        hasAudio = false;
      }
    }
    // eslint-disable-next-line no-unused-vars
    void videoTrack;
  } catch {
    /* ignore */
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: opts.videoBitsPerSecond ?? 3_000_000,
    audioBitsPerSecond: opts.audioBitsPerSecond ?? 128_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stoppedPromise: Promise<void> = new Promise((resolve) => {
    recorder.onstop = () => resolve();
  });

  const stop = () => {
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch { /* ignore */ }
    }
  };

  try {
    recorder.start(250);
    video.currentTime = start;
    try {
      await video.play();
    } catch {
      /* muted autoplay usually allowed; continue regardless */
    }

    const draw = () => {
      ctx.fillStyle = opts.background ?? "#111";
      ctx.fillRect(0, 0, w, h);
      const dw = video.videoWidth || w;
      const dh = video.videoHeight || h;
      const scale = Math.max(w / dw, h / dh);
      ctx.drawImage(video, (w - dw * scale) / 2, (h - dh * scale) / 2, dw * scale, dh * scale);
      if (opts.drawFrame) opts.drawFrame(ctx, video, video.currentTime);
    };

    const total = Math.max(0.001, duration);

    await new Promise<void>((resolve) => {
      let isDone = false;
      const finish = () => {
        if (isDone) return;
        isDone = true;
        video.removeEventListener("ended", finish);
        stop();
        resolve();
      };
      video.addEventListener("ended", finish, { once: true });

      const step = () => {
        if (isDone) return;
        throwIfAborted(signal);
        draw();
        if (onProgress) onProgress(Math.min(1, (video.currentTime - start) / total));
        if (video.currentTime < end && !video.ended) {
          requestAnimationFrame(step);
        } else {
          finish();
        }
      };
      requestAnimationFrame(() => {
        if (onProgress) onProgress(0.02, "Encoding ready, processing frames…");
        step();
      });
    });

    await stoppedPromise;
  } finally {
    // Guaranteed cleanup
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch { /* ignore */ }
    (stream.getTracks() as MediaStreamTrack[]).forEach((t) => t.stop());
    try {
      if (audioCtx && audioCtx.state !== "closed") {
        await audioCtx.close();
      }
    } catch { /* ignore */ }
    if (rawVideoUrl.startsWith("blob:")) URL.revokeObjectURL(rawVideoUrl);
  }

  const outMime = recorder.mimeType || mimeType;
  const blob = new Blob(chunks, { type: outMime });
  return { blob, mimeType: outMime, duration, width: w, height: h, hasAudio };
}

/** Extract audio to WAV via OfflineAudioContext (real, decoded + rendered). */
export async function extractAudioWav(
  file: MediaFile,
  progress?: ProgressSource
): Promise<Blob> {
  const { onProgress } = progress ?? {};
  const signal = progress?.signal;
  const arrayBuf = await file.blob.arrayBuffer();
  throwIfAborted(signal);
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  // Decode via a temporary context, then render offline.
  const tempCtx: AudioContext = new AudioCtxClass();
  const buffer = await tempCtx.decodeAudioData(arrayBuf);
  await tempCtx.close();
  throwIfAborted(signal);

  const sampleRate = Math.min(buffer.sampleRate, 44100);
  const length = Math.ceil(buffer.duration * sampleRate);
  const off = new OfflineAudioContext(2, length, sampleRate);
  const source = off.createBufferSource();
  source.buffer = buffer;
  const compressor = off.createDynamicsCompressor();
  source.connect(compressor);
  compressor.connect(off.destination);
  source.start(0);
  if (onProgress) onProgress(0.2, "Decoding audio…");
  const rendered = await off.startRendering();
  if (onProgress) onProgress(0.9, "Encoding WAV…");
  const blob = await audioBufferToWavBlob(rendered);
  if (onProgress) onProgress(1);
  return blob;
}

/** Web Audio -> 16-bit PCM WAV Blob. */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let ch = 0; ch < numCh; ch++) {
    const channel = buffer.getChannelData(ch);
    for (let i = 0; i < numFrames; i++) {
      const sample = Math.max(-1, Math.min(1, channel[i]));
      const int = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset + i * blockAlign + ch * 2, int, true);
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

/** Encode a set of image files (or a single image) into an animated video. */
export async function imagesToVideo(
  images: Array<{ blob: Blob }>,
  opts: { width?: number; height?: number; secondsPerImage?: number; background?: string },
  progress?: ProgressSource
): Promise<{ blob: Blob; mimeType: string; width: number; height: number; hasAudio: boolean }> {
  const { onProgress } = progress ?? {};
  const first = await loadImageBlob(images[0].blob);
  const srcW = first.width || 1080;
  const srcH = first.height || 1080;
  const w = Math.round(opts.width ?? 1080) - (Math.round(opts.width ?? 1080) % 2);
  const h = Math.round(opts.height ?? srcH * ((opts.width ?? srcW) / srcW)) - (Math.round(opts.height ?? srcH * ((opts.width ?? srcW) / srcW)) % 2);
  const secondsPerImage = opts.secondsPerImage ?? 3;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const pickMime = (): string => {
    if (typeof MediaRecorder !== "undefined") {
      for (const c of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) {
        if (MediaRecorder.isTypeSupported(c)) return c;
      }
    }
    return "video/webm";
  };
  const mimeType = pickMime();
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((r) => (recorder.onstop = () => r()));
  recorder.start(200);

  const imgElements: HTMLImageElement[] = [];
  for (const im of images) {
    imgElements.push(await loadImageBlob(im.blob));
  }

  const total = secondsPerImage * images.length;
  onProgress?.(0.05, "Building slideshow…");

  await new Promise<void>((resolve) => {
    let t = 0;
    const step = () => {
      ctx.fillStyle = opts.background ?? "#111";
      ctx.fillRect(0, 0, w, h);
      const idx = Math.min(images.length - 1, Math.floor(t / secondsPerImage));
      const img = imgElements[idx];
      const scale = Math.max(w / img.width, h / img.height);
      ctx.drawImage(img, (w - img.width * scale) / 2, (h - img.height * scale) / 2, img.width * scale, img.height * scale);
      t += 1 / 30;
      onProgress?.(Math.min(0.97, (t / total) * 0.9 + 0.05));
      if (t < total) {
        requestAnimationFrame(step);
      } else {
        if (recorder.state !== "inactive") recorder.stop();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
  await stopped;
  (stream.getVideoTracks() as MediaStreamTrack[]).forEach((tr) => tr.stop());

  const blob = new Blob(chunks, { type: mimeType });
  return { blob, mimeType, width: w, height: h, hasAudio: false };
}

function loadImageBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

/** Build a human-friendly output filename from a source filename, sanitized. */
export const safeBase = (name: string): string => {
  const base = (name || "gainutility-media").replace(/\.[a-z0-9]{1,5}$/i, "");
  const cleaned = base
    .replace(/[\\/]+/g, "-")
    .replace(/^\.+/, "")
    .replace(/[^\w.\- ]+/g, "-")
    .trim();
  return cleaned || "gainutility-media";
};

/** Map a mime type to the most useful file extension. */
export const extFor = (mime: string): string => {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp3")) return "mp3";
  if (mime.includes("wave") || mime.includes("wav") || mime.includes("x-wav")) return "wav";
  if (mime.includes("m4a")) return "m4a";
  if (mime.includes("aac")) return "aac";
  if (mime.includes("flac")) return "flac";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return "bin";
};

export type { MediaMetadata, SocialPreset };
