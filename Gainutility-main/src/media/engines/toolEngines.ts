/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * High-level flagship tool operations built on the engine primitives.
 *
 * Each method is a REAL browser-side operation. Progress is reported honestly
 * and an AbortSignal can cancel long runs.
 */

import { MediaFile } from "../core/types";
import {
  recordVideo,
  extractAudioWav,
  imagesToVideo,
  safeBase,
  extFor,
  ProgressSource,
} from "./mediaEngine";
import { encodeGif, quantize, GifFrame } from "./gifEncoder";
import { inspectMedia } from "../core/inspect";

/** Keep the original file exactly as it is — no re-encoding, no quality loss. */
export async function saveMedia(file: MediaFile, progress?: ProgressSource) {
  progress?.onProgress?.(0.5, "Preparing the original file…");
  const verified = await inspectMedia(file, { timeoutMs: 8000 });
  progress?.onProgress?.(1);
  return {
    blob: file.blob,
    mimeType: file.mimeType,
    filename: file.name,
    size: file.blob.size,
    kind: file.kind,
    verified,
  };
}

/** Export a trimmed copy of a video. */
export async function trimVideo(
  file: MediaFile,
  opts: { start: number; end: number; mimeType?: string },
  progress?: ProgressSource
) {
  const r = await recordVideo(
    file,
    { start: opts.start, end: opts.end, mimeType: opts.mimeType, includeAudio: true },
    progress
  );
  return {
    blob: r.blob,
    mimeType: r.mimeType,
    filename: `${safeBase(file.name)}-trimmed.${extFor(r.mimeType)}`,
    size: r.blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds: r.duration,
      width: r.width,
      height: r.height,
      hasAudio: r.hasAudio,
      hasVideo: true,
      container: r.mimeType.split("/")[1]?.split(";")[0],
    },
  };
}

/** Export a compressed (lower bitrate / resolution) copy of a video. */
export async function compressVideo(
  file: MediaFile,
  opts: { width?: number; videoBitsPerSecond?: number; mimeType?: string },
  progress?: ProgressSource
) {
  const r = await recordVideo(
    file,
    {
      width: opts.width,
      videoBitsPerSecond: opts.videoBitsPerSecond,
      mimeType: opts.mimeType,
      includeAudio: true,
    },
    progress
  );
  return {
    blob: r.blob,
    mimeType: r.mimeType,
    filename: `${safeBase(file.name)}-compressed.${extFor(r.mimeType)}`,
    size: r.blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds: r.duration,
      width: r.width,
      height: r.height,
      hasAudio: r.hasAudio,
      hasVideo: true,
      container: r.mimeType.split("/")[1]?.split(";")[0],
    },
  };
}

/** Export a video resized to a target width (aspect preserved). */
export async function resizeVideo(
  file: MediaFile,
  opts: { width: number; height?: number; mimeType?: string; background?: string },
  progress?: ProgressSource
) {
  const r = await recordVideo(
    file,
    {
      width: opts.width,
      height: opts.height,
      mimeType: opts.mimeType,
      background: opts.background ?? "#111",
      includeAudio: true,
    },
    progress
  );
  return {
    blob: r.blob,
    mimeType: r.mimeType,
    filename: `${safeBase(file.name)}-resized.${extFor(r.mimeType)}`,
    size: r.blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds: r.duration,
      width: r.width,
      height: r.height,
      hasAudio: r.hasAudio,
      hasVideo: true,
      container: r.mimeType.split("/")[1]?.split(";")[0],
    },
  };
}

/** Convert a video to the requested target container/codec. */
export async function convertVideo(
  file: MediaFile,
  opts: { mimeType: string },
  progress?: ProgressSource
) {
  const r = await recordVideo(file, { mimeType: opts.mimeType, includeAudio: true }, progress);
  return {
    blob: r.blob,
    mimeType: r.mimeType,
    filename: `${safeBase(file.name)}.${extFor(r.mimeType)}`,
    size: r.blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds: r.duration,
      width: r.width,
      height: r.height,
      hasAudio: r.hasAudio,
      hasVideo: true,
      container: r.mimeType.split("/")[1]?.split(";")[0],
    },
  };
}

/** Extract audio from a video and return a WAV blob. */
export async function extractAudio(file: MediaFile, progress?: ProgressSource) {
  const blob = await extractAudioWav(file, progress);
  return {
    blob,
    mimeType: "audio/wav",
    filename: `${safeBase(file.name)}-audio.wav`,
    size: blob.size,
    kind: "audio" as const,
    verified: {
      hasAudio: true,
      container: "wav",
      durationSeconds: undefined,
    },
  };
}

/** Build an animated GIF from a video (real GIF89a encoding). */
export async function videoToGif(
  file: MediaFile,
  opts: { start: number; end: number; fps?: number; maxWidth?: number },
  progress?: ProgressSource
) {
  const { onProgress } = progress ?? {};
  const { video, url } = await loadVideoFrames(file);
  try {
    const sourceDur = video.duration || 0;
    const start = Math.min(opts.start, sourceDur);
    const end = Math.min(opts.end, sourceDur) || sourceDur;
    const fps = Math.min(15, opts.fps ?? 10);
    const width = Math.min(opts.maxWidth ?? 480, video.videoWidth || 480);
    const height = Math.round((video.videoHeight || 270) * (width / (video.videoWidth || 480)));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    const frames: GifFrame[] = [];
    const frameCount = Math.max(1, Math.round((end - start) * fps));
    const step = (end - start) / frameCount;

    video.currentTime = start;
    await new Promise<void>((resolve) => {
      const onSeeked = () => resolve();
      video.addEventListener("seeked", onSeeked, { once: true });
      setTimeout(() => resolve(), 500);
    });

    for (let i = 0; i < frameCount; i++) {
      const t = start + i * step;
      video.currentTime = t;
      await seekAndCapture(video);
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const { pixels, palette } = quantize(imageData.data, 256);
      frames.push({
        width,
        height,
        pixels,
        palette,
        delayCs: Math.round((1 / fps) * 100),
      });
      onProgress?.((i + 1) / frameCount);
    }

    const blob = encodeGif(frames);
    return {
      blob,
      mimeType: "image/gif",
      filename: `${safeBase(file.name)}.gif`,
      size: blob.size,
      kind: "image" as const,
      verified: { width, height, container: "gif" },
    };
  } finally {
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch { /* ignore */ }
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  }
}

/** Build a slideshow video from images. */
export async function photosToVideo(
  files: MediaFile[],
  opts: { width?: number; height?: number; secondsPerImage?: number },
  progress?: ProgressSource
) {
  const r = await imagesToVideo(
    files.map((f) => ({ blob: f.blob })),
    opts,
    progress
  );
  const durationSeconds = (opts.secondsPerImage ?? 3) * files.length;
  return {
    blob: r.blob,
    mimeType: r.mimeType,
    filename: `gainutility-slideshow.${extFor(r.mimeType)}`,
    size: r.blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds,
      width: r.width,
      height: r.height,
      hasVideo: true,
      hasAudio: false,
      container: r.mimeType.split("/")[1]?.split(";")[0],
    },
  };
}

/** Build a video from a single image + audio track. */
export async function addMusicToPhoto(
  imageFile: MediaFile,
  audioFile: MediaFile,
  opts: {
    width: number;
    height: number;
    audioStart?: number;
    audioEnd?: number;
    volume?: number;
    background?: string;
    fit?: "cover" | "contain";
    mimeType?: string;
  },
  progress?: ProgressSource
) {
  const { onProgress } = progress ?? {};
  const signal = progress?.signal;

  const throwIfAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  };

  const loadImage = (blob: Blob): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image.")); };
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  const loadAudio = (blob: Blob): Promise<HTMLAudioElement> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.preload = "auto";
      audio.onloadedmetadata = () => resolve(audio);
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load audio.")); };
      audio.src = url;
    });

  const [img, audio] = await Promise.all([loadImage(imageFile.blob), loadAudio(audioFile.blob)]);

  const sourceDur = audio.duration || 0;
  const audioStart = Math.min(opts.audioStart ?? 0, sourceDur);
  const audioEnd = Math.min(opts.audioEnd ?? sourceDur, sourceDur) || sourceDur;
  const duration = audioEnd - audioStart;
  const volume = Math.min(1, Math.max(0, opts.volume ?? 1));

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

  const canvas = document.createElement("canvas");
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = opts.background ?? "#111";
  ctx.fillRect(0, 0, opts.width, opts.height);

  const stream = canvas.captureStream(30);
  let hasAudio = false;
  let audioCtx: AudioContext | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let gainNode: GainNode | null = null;

  try {
    if (typeof AudioContext !== "undefined") {
      try {
        audioCtx = new AudioContext();
        sourceNode = audioCtx.createMediaElementSource(audio);
        gainNode = audioCtx.createGain();
        gainNode.gain.value = volume;
        sourceNode.connect(gainNode);
        const destNode = audioCtx.createMediaStreamDestination();
        gainNode.connect(destNode);
        stream.addTrack(destNode.stream.getAudioTracks()[0]);
        hasAudio = true;
      } catch {
        hasAudio = false;
      }
    }
  } catch { /* ignore */ }

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000, audioBitsPerSecond: 128_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
  const stoppedPromise = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });

  const drawFrame = () => {
    ctx.fillStyle = opts.background ?? "#111";
    ctx.fillRect(0, 0, opts.width, opts.height);
    const imgW = img.width;
    const imgH = img.height;
    let dw, dh, dx, dy;
    if (opts.fit === "contain") {
      const scale = Math.min(opts.width / imgW, opts.height / imgH);
      dw = imgW * scale;
      dh = imgH * scale;
      dx = (opts.width - dw) / 2;
      dy = (opts.height - dh) / 2;
    } else {
      const scale = Math.max(opts.width / imgW, opts.height / imgH);
      dw = imgW * scale;
      dh = imgH * scale;
      dx = (opts.width - dw) / 2;
      dy = (opts.height - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  try {
    onProgress?.(0.05, "Preparing audio…");
    audio.currentTime = audioStart;
    await new Promise<void>((resolve) => {
      const onSeeked = () => { audio.removeEventListener("seeked", onSeeked); resolve(); };
      audio.addEventListener("seeked", onSeeked, { once: true });
      setTimeout(() => resolve(), 300);
    });
    throwIfAborted(signal);

    onProgress?.(0.1, "Encoding video…");
    recorder.start(250);
    audio.play().catch(() => { /* muted autoplay */ });

    const startTime = performance.now();
    const totalMs = duration * 1000;

    await new Promise<void>((resolve) => {
      const step = () => {
        if (signal?.aborted) { recorder.stop(); resolve(); return; }
        const elapsed = performance.now() - startTime;
        if (elapsed >= totalMs) {
          recorder.stop();
          resolve();
          return;
        }
        drawFrame();
        onProgress?.(0.1 + 0.85 * (elapsed / totalMs));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    await stoppedPromise;
  } finally {
    try { audio.pause(); audio.removeAttribute("src"); audio.load(); } catch { /* ignore */ }
    try { if (audioCtx && audioCtx.state !== "closed") await audioCtx.close(); } catch { /* ignore */ }
    (stream.getTracks() as MediaStreamTrack[]).forEach((t) => t.stop());
  }

  const outMime = recorder.mimeType || mimeType;
  const blob = new Blob(chunks, { type: outMime });
  return {
    blob,
    mimeType: outMime,
    filename: `${safeBase(imageFile.name)}-with-music.${extFor(outMime)}`,
    size: blob.size,
    kind: "video" as const,
    verified: {
      durationSeconds: duration,
      width: opts.width,
      height: opts.height,
      hasVideo: true,
      hasAudio,
      container: outMime.split("/")[1]?.split(";")[0],
    },
  };
}

async function loadVideoFrames(file: MediaFile): Promise<{ video: HTMLVideoElement; url: string }> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("video");
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    const url = URL.createObjectURL(file.blob);
    el.onloadedmetadata = () => resolve({ video: el, url });
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this video in your browser."));
    };
    el.src = url;
  });
}

function seekAndCapture(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    setTimeout(() => resolve(), 120);
  });
}
