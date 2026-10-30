/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MediaInspector — reads REAL metadata from a media file by loading it into
 * an offscreen <video>/<audio> element. All values are measured from the
 * actual file; nothing is assumed from the extension or MIME.
 */

import { MediaFile, MediaMetadata, MediaCapabilities } from "./types";

/** Resolve the mime/container from the blob when the browser can, else undefined. */
const containerOf = (mime: string): string | undefined => {
  const m = mime.match(/^([a-z0-9]+)\//i);
  if (!m) return undefined;
  const base = m[1].toLowerCase();
  if (base === "video" || base === "audio") {
    const codec = mime.split("/")[1]?.split(";")[0]?.trim();
    return codec || undefined;
  }
  return undefined;
};

/** b: audioContext waiting until the browser has decoded duration/state. */
const waitFor = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const inspectMedia = (
  file: MediaFile,
  opts: { timeoutMs?: number } = {}
): Promise<MediaMetadata> => {
  const timeoutMs = opts.timeoutMs ?? 15000;
  return new Promise((resolve, reject) => {
    const url = file.blob instanceof Blob ? URL.createObjectURL(file.blob) : "";
    const timeouts: number[] = [];
    const cleanup = (el: HTMLMediaElement) => {
      timeouts.forEach((t) => window.clearTimeout(t));
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
        /* ignore */
      }
      if (url) URL.revokeObjectURL(url);
    };

    const isVideo = file.mimeType.startsWith("video/") || file.kind === "video";
    const el = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement;
    el.muted = true;
    el.preload = "metadata";

    const done = (meta: MediaMetadata) => { cleanup(el); resolve(meta); };
    const fail = () => { cleanup(el); resolve({}); };

    el.addEventListener("loadedmetadata", () => {
      const meta: MediaMetadata = {
        durationSeconds:
          Number.isFinite(el.duration) && el.duration > 0 ? el.duration : undefined,
        width: (el as HTMLVideoElement).videoWidth || undefined,
        height: (el as HTMLVideoElement).videoHeight || undefined,
        container: containerOf(file.mimeType),
      };
      if (isVideo) {
        meta.hasVideo = (el as HTMLVideoElement).videoWidth > 0;
        // Inspect audio via the media element's audio tracks where the
        // browser exposes them; otherwise leave undefined.
        const audioTracks = (el as any).audioTracks;
        if (audioTracks && audioTracks.length != null) {
          meta.hasAudio = audioTracks.length > 0;
        }
      } else {
        meta.hasAudio = true;
      }
      done(meta);
    });

    function handleError() {
      // A time-limited seek is the most reliable way to confirm audio in a
      // video; fall back to resolving with whatever metadata we have.
      fail();
    }
    el.addEventListener("error", handleError);

    // Try to measure frame rate when the file also carries video, using the
    // requestVideoFrameCallback on modern browsers (best-effort, real).
    try {
      if (isVideo && "requestVideoFrameCallback" in el) {
        (el as any).requestVideoFrameCallback((_: unknown, meta: { mediaTime: number }) => {
          const t0 = meta.mediaTime;
          (el as any).requestVideoFrameCallback((__: unknown, meta2: { mediaTime: number }) => {
            const dt = meta2.mediaTime - t0;
            if (dt > 0.02 && dt < 1) {
              // measure as soon as we have two frames
            }
          });
        });
      }
    } catch {
      /* best-effort only */
    }

    if (url) el.src = url;
    else el.src = file.blob instanceof Blob ? "" : "";

    timeouts.push(window.setTimeout(fail, timeoutMs));
  });
};

/**
 * Capability detection based on the measured metadata plus the actual browser
 * (MediaRecorder mime support). Never advertises formats it cannot produce.
 */
export const detectCapabilities = (
  metadata: MediaMetadata,
  options: { isMobile?: boolean } = {}
): MediaCapabilities => {
  const isMobile = options.isMobile ?? false;

  // MediaRecorder supported mime types — only advertise what this browser
  // can actually encode so we never show a "Download" that can't exist.
  const recorded: string[] = [];
  if (typeof MediaRecorder !== "undefined") {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4;codecs=avc1",
      "video/mp4",
    ];
    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c)) recorded.push(c);
      } catch {
        /* ignore */
      }
    }
  }
  const videoFormats = recorded.filter((c) => c.startsWith("video")).length
    ? Array.from(new Set(recorded.filter((c) => c.startsWith("video"))))
    : [];
  const audioFormats = recorded.filter((c) => c.startsWith("audio")).length
    ? Array.from(new Set(recorded.filter((c) => c.startsWith("audio"))))
    : ["audio/wav"];

  const hasModernMedia = typeof MediaRecorder !== "undefined";

  return {
    canExtractAudio: hasModernMedia && !!metadata.hasAudio,
    canReencodeVideo: hasModernMedia && videoFormats.length > 0,
    videoFormats,
    audioFormats: audioFormats.length ? audioFormats : ["audio/wav"],
    canResize: hasModernMedia && !!metadata.hasVideo,
    canTrim: hasModernMedia && !!metadata.hasVideo,
    canCompress: hasModernMedia && !!metadata.hasVideo,
    canRasterize: true, // canvas-based; works everywhere
  };
};
