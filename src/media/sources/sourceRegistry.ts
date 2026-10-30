/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SourceRegistry — the single honest list of media sources GainUtility can work
 * with, and the classifier that decides how a pasted link is handled.
 *
 * Rules:
 *  - "direct" links (a URL that points at an actual media file) are fetched
 *    straight from the browser. This only works when the host sends the media
 *    with permissive CORS headers — we surface that honestly instead of trying
 *    to work around it (no proxies, no cookies, no scraping).
 *  - Streaming platforms (YouTube, Instagram, Facebook, X/Twitter, TikTok) are
 *    recognised but NOT supported from a browser. No legitimate client-side
 *    mechanism exists to grab their media, so we never claim otherwise.
 *
 * Framework-free and DOM-free: usable by the app, the prerender, and tests.
 */

export type RetrievalMode = "direct" | "none";

export type SourceStatus = "supported" | "unsupported";

export interface MediaSource {
  id: string;
  /** Display name shown in the supported-sources list. */
  name: string;
  /** Hostname suffixes (lowercase, no "www.") used for matching. */
  hosts: string[];
  /** Human host labels used in copy, e.g. “youtube.com”. */
  hostLabels: string[];
  /** How media would be retrieved ("none" = never supported). */
  retrievalMode: RetrievalMode;
  status: SourceStatus;
  /** Shown in the goal-first list so the tool is truthful about limits. */
  featured: boolean;
  /** One honest sentence about what happens with this source. */
  note: string;
}

/** Maximum bytes fetched from a link (256 MiB). Hard cap, enforced while streaming. */
export const MAX_MEDIA_BYTES = 256 * 1024 * 1024;

/** How long a link fetch may take before we treat it as unavailable. */
export const LINK_FETCH_TIMEOUT_MS = 20_000;

/** File extensions we treat as “a direct media file” when seen on a URL path. */
export const DIRECT_MEDIA_EXT = new Set([
  // video
  "mp4", "m4v", "webm", "mov", "mkv", "avi", "mpg", "mpeg", "3gp", "ogv",
  // audio
  "mp3", "m4a", "wav", "ogg", "oga", "aac", "flac", "opus",
  // image
  "gif", "png", "jpg", "jpeg", "webp", "bmp", "avif", "svg",
]);

const platformHosts = {
  youtube: ["youtube.com", "youtu.be", "youtube-nocookie.com", "music.youtube.com"],
  instagram: ["instagram.com", "instagr.am"],
  facebook: ["facebook.com", "fb.watch", "fb.com"],
  x: ["x.com", "twitter.com"],
  tiktok: ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com", "douyin.com"],
} as const;

export const SOURCES: MediaSource[] = [
  {
    id: "direct",
    name: "Direct media links",
    hosts: [],
    hostLabels: ["CDNs", "Cloudflare", "AWS S3", "Wikimedia", "CORS-enabled servers"],
    retrievalMode: "direct",
    status: "supported",
    featured: true,
    note: "A URL pointing directly to a media file (MP4, WebM, MP3, WAV, PNG, etc.) on servers allowing browser access.",
  },
  {
    id: "youtube",
    name: "YouTube",
    hosts: [...platformHosts.youtube],
    hostLabels: ["youtube.com", "youtu.be"],
    retrievalMode: "none",
    status: "unsupported",
    featured: false,
    note: "Recognised, but browsers can't download YouTube videos without its consent. We don't try to bypass that.",
  },
  {
    id: "instagram",
    name: "Instagram",
    hosts: [...platformHosts.instagram],
    hostLabels: ["instagram.com"],
    retrievalMode: "none",
    status: "unsupported",
    featured: false,
    note: "Instagram media requires login or cookies, which we never use.",
  },
  {
    id: "facebook",
    name: "Facebook",
    hosts: [...platformHosts.facebook],
    hostLabels: ["facebook.com", "fb.watch"],
    retrievalMode: "none",
    status: "unsupported",
    featured: false,
    note: "Facebook videos sit behind accounts and anti-bot checks, so we can't fetch them.",
  },
  {
    id: "x",
    name: "X / Twitter",
    hosts: [...platformHosts.x],
    hostLabels: ["x.com", "twitter.com"],
    retrievalMode: "none",
    status: "unsupported",
    featured: false,
    note: "X media isn't served to third-party browsers without authentication.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    hosts: [...platformHosts.tiktok],
    hostLabels: ["tiktok.com"],
    retrievalMode: "none",
    status: "unsupported",
    featured: false,
    note: "TikTok serves media dynamically and blocks external requests, so we can't help with TikTok links.",
  },
  {
    id: "web",
    name: "Any other page or file",
    hosts: [],
    hostLabels: ["Any http(s) address"],
    retrievalMode: "direct",
    status: "supported",
    featured: false,
    note: "If the address serves a real media file with CORS allowed, we can read it. Otherwise we tell you honestly.",
  },
];

const platformsById = new Map(SOURCES.filter((s) => s.id !== "direct" && s.id !== "web").map((s) => [s.id, s]));

/** Normalised hostname: lowercase, without "www.". */
const hostOf = (url: URL): string => url.hostname.toLowerCase().replace(/^www\./, "");

/** Disallow localhost, link-local, and private RFC1918 subnets to prevent internal LAN probes. */
const isPrivateOrLoopbackHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" || h === "::") return true;
  const parts = h.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255)) {
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local
    if (a === 0) return true;
  }
  return false;
};

const endsWithMediaExt = (pathname: string): string | null => {
  const seg = pathname.split("/").pop() ?? "";
  const dot = seg.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = seg.slice(dot + 1).toLowerCase();
  return DIRECT_MEDIA_EXT.has(ext) ? ext : null;
};

const findPlatform = (host: string): MediaSource | null => {
  for (const src of platformsById.values()) {
    if (src.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return src;
  }
  return null;
};

export type UrlClassification =
  | { status: "invalid" }
  | { status: "direct"; source: MediaSource; url: URL; extension: string | null }
  | { status: "platform-unsupported"; source: MediaSource; url: URL }
  | { status: "web"; source: MediaSource; url: URL; extension: string | null };

/**
 * Classify a pasted link. Never throws, never touches the network.
 * Classification is a hint — the fetch step still verifies the real content.
 */
export const classifyUrl = (raw: string): UrlClassification => {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { status: "invalid" };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { status: "invalid" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { status: "invalid" };

  const host = hostOf(url);
  if (isPrivateOrLoopbackHost(host)) {
    return { status: "invalid" };
  }

  // Check known platforms FIRST, before file extension check,
  // so URLs like https://youtube.com/video.mp4 are correctly flagged as unsupported platform.
  const platform = findPlatform(host);
  if (platform) {
    return { status: "platform-unsupported", source: platform, url };
  }

  const extension = endsWithMediaExt(url.pathname);
  if (extension) {
    return { status: "direct", source: SOURCES[0], url, extension };
  }

  return { status: "web", source: SOURCES[SOURCES.length - 1], url, extension: null };
};

/** The supported-list entries shown under “What can I expect?” — honest only. */
export const SUPPORTED_SOURCE_LIST = SOURCES.filter((s) => s.retrievalMode === "direct");