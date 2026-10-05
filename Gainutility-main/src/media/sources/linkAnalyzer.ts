/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LinkAnalyzer — validates a pasted link and, where the source genuinely
 * allows it, fetches the media directly in the browser.
 *
 * Hard limits (never bypassed):
 *  - Only http(s). No cookies/tokens/passwords ever sent.
 *  - Single GET request to the exact URL the user pasted. No endpoint fetches
 *    arbitrary URLs; no proxy; no scraping of pages.
 *  - Media is verified by content-type, extension signal, and a light byte
 *    sniff — never assumed from the URL alone.
 *  - Hard cap at MAX_MEDIA_BYTES while streaming; timeout on slow hosts.
 *
 * Every failure returns a short, honest, human sentence (no error codes).
 */

import { MediaFile, MediaKind } from "../core/types";
import {
  MAX_MEDIA_BYTES,
  LINK_FETCH_TIMEOUT_MS,
  classifyUrl,
  MediaSource,
} from "./sourceRegistry";

export type LinkAnalysis =
  | { status: "invalid-url"; message: string }
  | { status: "unsupported-source"; source: MediaSource; url: string; message: string }
  | { status: "network-error"; message: string; detail?: string }
  | { status: "not-media"; message: string }
  | { status: "too-large"; message: string }
  | { status: "ok"; file: MediaFile; sourceId: string; url: string };

const EXT_MIME: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/x-m4v", webm: "video/webm", mov: "video/quicktime",
  mkv: "video/x-matroska", avi: "video/x-msvideo", mpg: "video/mpeg", mpeg: "video/mpeg",
  "3gp": "video/3gpp", ogv: "video/ogg",
  mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg",
  oga: "audio/ogg", aac: "audio/aac", flac: "audio/flac", opus: "audio/opus",
  gif: "image/gif", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  webp: "image/webp", bmp: "image/bmp", avif: "image/avif", svg: "image/svg+xml",
};

/** MIME families we consider actual media. */
const isMediaMime = (mime: string): boolean =>
  mime.startsWith("video/") || mime.startsWith("audio/") || mime.startsWith("image/");

const kindOf = (mime: string): MediaKind => {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  return "unknown";
};

const kindOfExt = (ext: string | null): MediaKind => {
  if (!ext) return "unknown";
  if (["mp4", "m4v", "webm", "mov", "mkv", "avi", "mpg", "mpeg", "3gp", "ogv"].includes(ext)) return "video";
  if (["mp3", "m4a", "wav", "ogg", "oga", "aac", "flac", "opus"].includes(ext)) return "audio";
  if (["gif", "png", "jpg", "jpeg", "webp", "bmp", "avif", "svg"].includes(ext)) return "image";
  return "unknown";
};

/** Light magic-number sniff over the first bytes of a real media file. */
const sniffMime = (head: Uint8Array): string | null => {
  const starts = (bytes: number[], i = 0) => head.length >= bytes.length + i && bytes.every((b, j) => head[i + j] === b);
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (starts([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (starts([0x52, 0x49, 0x46, 0x46]) && head.length >= 12 && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (starts([0x1a, 0x45, 0xdf, 0xa3])) return "video/webm"; // EBML
  if (starts([0x49, 0x44, 0x33]) || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0)) return "audio/mpeg";
  if (starts([0x52, 0x49, 0x46, 0x46]) && head.length >= 12) {
    const fourcc = String.fromCharCode(head[8], head[9], head[10], head[11]);
    if (fourcc === "WAVE") return "audio/wav";
    if (fourcc === "AVI ") return "video/x-msvideo";
  }
  if (starts([0x4f, 0x67, 0x67, 0x53])) return "audio/ogg";
  // ISO-BMFF base: "ftyp" at offset 4 — covers mp4/mov/m4v.
  if (starts([0x66, 0x74, 0x79, 0x70], 4)) return "video/mp4";
  return null;
};

const cleanBase = (name: string): string =>
  name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[/\\:*?"<>|]+/g, "-")
    .trim()
    .slice(0, 80) || "media";

/** A filename that only ever contains safe characters. */
export const sanitizeFilename = (name: string, ext: string | null): string => {
  const safe = cleanBase(name.replace(/^[a-z]+:\/\/[^/]+\//i, "").replace(/%20/g, " "));
  const dot = ext && /^[a-z0-9]{2,5}$/i.test(ext) ? `.${ext}` : "";
  return `${safe}${dot}`;
};

const displaySourceName = (source: MediaSource): string =>
  source.hostLabels[0] ? source.hostLabels[0] : source.name;

const UNSUPPORTED_MESSAGES: Record<string, string> = {
  youtube:
    "YouTube doesn't allow downloads from a browser, so this link can't be handled here. Paste a direct file link or upload the video instead.",
  instagram:
    "Instagram media is behind login and cookies, which we never use. Paste a direct file link or upload the video instead.",
  facebook:
    "Facebook videos are behind an account and anti-bot checks. Paste a direct file link or upload the video instead.",
  x: "X posts don't expose their media to third-party browsers. Paste a direct file link or upload the video instead.",
  tiktok:
    "TikTok serves media dynamically and blocks external requests. Paste a direct file link or upload the video instead.",
};

/** Begin a capped, timed-out, CORS-probed download of the exact URL. */
const fetchMedia = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), LINK_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      credentials: "omit",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
};

const resultTooLarge = (): LinkAnalysis => ({
  status: "too-large",
  message:
    "This file is too large for browser processing (limit 256 MB). Try a smaller file or a direct download on your device instead.",
});

/**
 * Analyze a pasted link. Returns either an honest refusal with friendly copy,
 * or a verified MediaFile ready for the goal workspace.
 */
export const analyzeLink = async (raw: string): Promise<LinkAnalysis> => {
  const classified = classifyUrl(raw);
  if (classified.status === "invalid") {
    return {
      status: "invalid-url",
      message: "That doesn't look like a link. Paste the full address of the file (starting with http:// or https://).",
    };
  }
  if (classified.status === "platform-unsupported") {
    return {
      status: "unsupported-source",
      source: classified.source,
      url: classified.url.href,
      message:
        UNSUPPORTED_MESSAGES[classified.source.id] ??
        `${displaySourceName(classified.source)} isn't supported right now. Paste a direct file link or upload the media instead.`,
    };
  }

  const { source, url, extension } = classified;
  const ext = extension ?? (url.pathname.split(".").pop()?.toLowerCase() ?? null);

  let response: Response;
  try {
    response = await fetchMedia(url.href);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return {
        status: "network-error",
        message: "We couldn't access this link — it took too long to respond.",
        detail: "The site may be slow or blocked from this browser.",
      };
    }
    return {
      status: "network-error",
      message: "We couldn't access this link.",
      detail: "The site may block cross-origin access, or the address may no longer be available.",
    };
  }

  if (!response.ok) {
    return {
      status: "network-error",
      message: "We couldn't access this link.",
      detail: `The address answered with an error (${response.status}) and didn't serve a media file.`,
    };
  }

  const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const contentLength = Number(response.headers.get("content-length") || "0") || 0;

  if (contentType && contentType !== "application/octet-stream" && !isMediaMime(contentType)) {
    if (contentType === "text/html") {
      return {
        status: "not-media",
        message: "This link points to a page, not a media file. Paste a direct link to the video, audio, or image file instead.",
      };
    }
    if (!ext) {
      return {
        status: "not-media",
        message: "This link doesn't point to a media file. Paste a direct file link (MP4, WebM, MP3, PNG, …) or upload the media instead.",
      };
    }
  }

  const length = contentLength || 0;
  if (length > MAX_MEDIA_BYTES) return resultTooLarge();

  const mimeBase = contentType && contentType !== "application/octet-stream" ? contentType : "";
  const extMime = ext && EXT_MIME[ext] ? EXT_MIME[ext] : "";
  const body: BlobPart[] = [];
  let received = 0;
  let head = new Uint8Array(0);

  try {
    const reader = response.body?.getReader();
    if (!reader) {
      return {
        status: "network-error",
        message: "We couldn't access this link.",
        detail: "The browser couldn't stream the response — the site may block access.",
      };
    }
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > MAX_MEDIA_BYTES) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        return resultTooLarge();
      }
      if (head.length < 4096) {
        head = new Uint8Array(Math.min(4096, head.length + value.byteLength));
        head.set(value.subarray(0, head.length));
      }
      body.push(value);
    }
    await reader.releaseLock();
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return {
        status: "network-error",
        message: "We couldn't access this link — it took too long to respond.",
      };
    }
    return {
      status: "network-error",
      message: "We couldn't access this link.",
      detail: "The connection dropped partway through.",
    };
  }

  if (received === 0) {
    return {
      status: "not-media",
      message: "The link didn't return any file content.",
    };
  }

  const sniffed = sniffMime(head);
  const mime = sniffed || (mimeBase && isMediaMime(mimeBase) ? mimeBase : "") || extMime || "application/octet-stream";
  const kind = kindOf(mime) !== "unknown" ? kindOf(mime) : kindOfExt(ext);

  if (kind === "unknown") {
    return {
      status: "not-media",
      message:
        "The link didn't point to a video, audio, or image file that this browser can read. Paste a direct file link or upload the media instead.",
    };
  }

  const meta = new Blob(body, { type: mime });
  const blobType = mime === "application/octet-stream" ? "" : mime;
  const finalBlob = blobType ? meta.slice(0, meta.size, blobType) : meta;

  const pathBase = decodeURIComponent(url.pathname.split("/").pop() || "").replace(/^[.]+/, "");
  const fallbackExt = ext || (sniffed ? sniffed.split("/")[1]?.split("+")[0] : null) || null;
  const file: MediaFile = {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: sanitizeFilename(pathBase, fallbackExt),
    mimeType: blobType,
    blob: finalBlob,
    size: finalBlob.size,
    kind,
  };

  return { status: "ok", file, sourceId: source.id, url: url.href };
};