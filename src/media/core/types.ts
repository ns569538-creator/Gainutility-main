/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Core Media domain types shared across the GainUtility Media platform.
 *
 * These are deliberately plain, framework-free types so they can be used by
 * the live app, the prerender, and any future worker without a React import.
 */

/** Kinds of media the platform understands. Derived from inspection, never guessed. */
export type MediaKind = "video" | "audio" | "image" | "unknown";

/** A single media file held in memory as a Blob. */
export interface MediaFile {
  /** Stable id used as a React key. */
  id: string;
  name: string;
  /** Blob type, e.g. "video/mp4", "audio/webm". May be empty when unknown. */
  mimeType: string;
  blob: Blob;
  size: number;
  kind: MediaKind;
  /** Optional object URL for preview (caller manages lifetime). */
  objectUrl?: string;
}

/** Metadata read from the actual media, where measurable. Never invented. */
export interface MediaMetadata {
  durationSeconds?: number;
  width?: number;
  height?: number;
  hasAudio?: boolean;
  hasVideo?: boolean;
  /** Container/codec hint, e.g. "webm", "mp4", "wav". Undefined when unreadable. */
  container?: string;
  /** Frame rate measured directly, when available. */
  frameRate?: number;
}

/** What the platform is able to do with a given piece of media. */
export interface MediaCapabilities {
  canExtractAudio: boolean;
  canReencodeVideo: boolean;
  videoFormats: string[];
  audioFormats: string[];
  canResize: boolean;
  canTrim: boolean;
  canCompress: boolean;
  canRasterize: boolean;
}

/** The outcome of a media operation. */
export interface MediaResult {
  blob: Blob;
  mimeType: string;
  filename: string;
  size: number;
  kind: MediaKind;
  /** Real metadata read back from the finished file (verification). */
  verified: MediaMetadata;
  /** Optional preview object URL (caller manages lifetime). */
  objectUrl?: string;
}

/** A human-readable, actionable error (not an error code). */
export interface MediaErrorInfo {
  /** Short, human sentence, e.g. "We couldn't process this file." */
  message: string;
  /** Optional supporting detail shown only when useful. */
  detail?: string;
  /** Whether the user can retry from the current state. */
  retryable: boolean;
}

/** Type of processing embodied by a workflow. Used for truthful privacy copy. */
export type ProcessingMode = "local" | "server";

export type MediaGoalId =
  | "save"
  | "audio"
  | "smaller"
  | "convert"
  | "trim"
  | "resize"
  | "social"
  | "create";

/**
 * The ONE shared state model for every media workflow.
 * Every tool reuses these states instead of building its own machine.
 */
export type MediaFlowState =
  | { kind: "empty" }
  | { kind: "file-selected"; file: MediaFile }
  | { kind: "link-entered"; url: string }
  | { kind: "analyzing"; file: MediaFile | null; url?: string }
  | { kind: "media-found"; file: MediaFile; metadata: MediaMetadata; capabilities: MediaCapabilities }
  | { kind: "goal-selection"; file: MediaFile; metadata: MediaMetadata; capabilities: MediaCapabilities }
  | { kind: "configuring"; goal: MediaGoalId; file: MediaFile; metadata: MediaMetadata; capabilities: MediaCapabilities }
  | { kind: "processing"; goal: MediaGoalId; progress: number | null; note?: string }
  | { kind: "verifying"; goal: MediaGoalId }
  | { kind: "success"; goal: MediaGoalId; result: MediaResult; inputSize: number; inputMetadata?: MediaMetadata }
  | { kind: "error"; error: MediaErrorInfo }
  | { kind: "unsupported-source"; url: string };

export interface SocialPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  label: string;
}
