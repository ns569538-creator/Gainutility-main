/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Goal registry — defines which goals each flagship media tool offers and the
 * engine function that performs each operation. Central place so the UI can
 * render the right goal cards + config once a file is analysed.
 *
 * Engines are REAL browser-side operations (see engines/).
 */

import { MediaGoalId, MediaKind } from "./types";
import { MediaEngine } from "./useMediaFlow";
import {
  extractAudio,
  compressVideo,
  resizeVideo,
  trimVideo,
  convertVideo,
  videoToGif,
  saveMedia,
} from "../engines/toolEngines";

export type MediaToolId =
  | "video-audio-extractor"
  | "video-compressor"
  | "video-resizer"
  | "video-trimmer"
  | "video-converter"
  | "video-to-gif"
  | "video-downloader"
  | "add-music-to-photo";

export interface GoalDefinition {
  id: MediaGoalId;
  /** Short label used on the goal card. */
  label: string;
  /** One-line supporting copy. */
  description: string;
  /** Kinds accepted for this goal. */
  accepts: MediaKind[];
  /** The engine that fulfils the goal. */
  engine: MediaEngine;
}

export interface MediaToolDefinition {
  id: MediaToolId;
  /** Goals this tool presents as the filtered goal set. */
  goals: GoalDefinition[];
}

const toEngine = (fn: (...args: any[]) => Promise<any>): MediaEngine => fn as MediaEngine;

export const MEDIA_TOOLS: Record<MediaToolId, MediaToolDefinition> = {
  "video-audio-extractor": {
    id: "video-audio-extractor",
    goals: [
      {
        id: "audio",
        label: "Get the audio",
        description: "Save the audio track as a separate sound file.",
        accepts: ["video"],
        engine: toEngine((file, _o, progress, signal) => extractAudio(file, { ...progress, signal })),
      },
    ],
  },

  "video-compressor": {
    id: "video-compressor",
    goals: [
      {
        id: "smaller",
        label: "Make it smaller",
        description: "Reduce the file size for easy sharing or storage.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          compressVideo(file, { videoBitsPerSecond: Number(o.videoBitsPerSecond) || 2_500_000, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
    ],
  },

  "video-resizer": {
    id: "video-resizer",
    goals: [
      {
        id: "resize",
        label: "Resize it",
        description: "Adjust dimensions to fit your screen or platform.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          resizeVideo(file, { width: Number(o.width) || 1280, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
      {
        id: "social",
        label: "Prepare for social",
        description: "Reframe to 9:16 vertical, 1:1 square, or 16:9 widescreen.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          resizeVideo(
            file,
            {
              width: Number(o.width) || 1080,
              height: Number(o.height),
              background: "#111",
              mimeType: o.mimeType,
            },
            { ...progress, signal }
          )
        ),
      },
    ],
  },

  "video-trimmer": {
    id: "video-trimmer",
    goals: [
      {
        id: "trim",
        label: "Trim it",
        description: "Keep only the section or highlight you want.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          trimVideo(file, { start: Number(o.start) || 0, end: Number(o.end) || 0, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
    ],
  },

  "video-converter": {
    id: "video-converter",
    goals: [
      {
        id: "convert",
        label: "Change the format",
        description: "Convert to MP4 or WebM for broad compatibility.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          convertVideo(file, { mimeType: o.mimeType || "video/webm" }, { ...progress, signal })
        ),
      },
    ],
  },

  "video-to-gif": {
    id: "video-to-gif",
    goals: [
      {
        id: "create",
        label: "Make a GIF",
        description: "Turn a short video clip into a shareable animated GIF.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          videoToGif(
            file,
            { start: Number(o.start) || 0, end: Number(o.end) || 0, fps: Number(o.fps) || 10, maxWidth: Number(o.maxWidth) || 480 },
            { ...progress, signal }
          )
        ),
      },
      {
        id: "trim",
        label: "Trim it",
        description: "Keep only the section or highlight you want.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          trimVideo(file, { start: Number(o.start) || 0, end: Number(o.end) || 0, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
    ],
  },

  "video-downloader": {
    id: "video-downloader",
    goals: [
      {
        id: "save",
        label: "Save the video",
        description: "Keep the original video file as-is — no re-encoding or quality loss.",
        accepts: ["video", "audio", "image"],
        engine: toEngine((file, _o, progress, signal) => saveMedia(file, { ...progress, signal })),
      },
      {
        id: "audio",
        label: "Get the audio",
        description: "Save the audio track as a separate sound file.",
        accepts: ["video"],
        engine: toEngine((file, _o, progress, signal) => extractAudio(file, { ...progress, signal })),
      },
      {
        id: "smaller",
        label: "Make it smaller",
        description: "Reduce the file size for easy sharing or storage.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          compressVideo(file, { videoBitsPerSecond: Number(o.videoBitsPerSecond) || 2_500_000, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
      {
        id: "trim",
        label: "Trim it",
        description: "Keep only the section or highlight you want.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          trimVideo(file, { start: Number(o.start) || 0, end: Number(o.end) || 0, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
      {
        id: "resize",
        label: "Resize it",
        description: "Adjust dimensions to fit your screen or platform.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          resizeVideo(file, { width: Number(o.width) || 1280, mimeType: o.mimeType }, { ...progress, signal })
        ),
      },
      {
        id: "convert",
        label: "Change the format",
        description: "Convert to MP4 or WebM for broad compatibility.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          convertVideo(file, { mimeType: o.mimeType || "video/webm" }, { ...progress, signal })
        ),
      },
      {
        id: "social",
        label: "Prepare for social",
        description: "Reframe to 9:16 vertical, 1:1 square, or 16:9 widescreen.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          resizeVideo(
            file,
            {
              width: Number(o.width) || 1080,
              height: Number(o.height),
              background: "#111",
              mimeType: o.mimeType,
            },
            { ...progress, signal }
          )
        ),
      },
      {
        id: "create",
        label: "Make a GIF",
        description: "Turn a short video clip into a shareable animated GIF.",
        accepts: ["video"],
        engine: toEngine((file, o, progress, signal) =>
          videoToGif(
            file,
            { start: Number(o.start) || 0, end: Number(o.end) || 0, fps: Number(o.fps) || 10, maxWidth: Number(o.maxWidth) || 480 },
            { ...progress, signal }
          )
        ),
      },
    ],
},
  "add-music-to-photo": {
    id: "add-music-to-photo",
    goals: [],
  },
};

/** The labels + descriptions used on goal cards. */
export const GOAL_META: Record<MediaGoalId, { icon: string; available: boolean }> = {
  save: { icon: "save", available: true },
  audio: { icon: "audio", available: true },
  smaller: { icon: "smaller", available: true },
  convert: { icon: "convert", available: true },
  trim: { icon: "trim", available: true },
  resize: { icon: "resize", available: true },
  social: { icon: "social", available: true },
  create: { icon: "create", available: true },
};
