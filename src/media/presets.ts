/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Social / platform preparation presets.
 *
 * Each preset configures REAL media settings (dimensions, aspect ratio, crop
 * strategy) that the local engine applies. These are honest utility presets —
 * they never claim official platform endorsement.
 */

import { SocialPreset } from "./core/types";

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: "reel", name: "Instagram Reel", width: 1080, height: 1920, label: "9:16" },
  { id: "tiktok", name: "TikTok", width: 1080, height: 1920, label: "9:16" },
  { id: "shorts", name: "YouTube Shorts", width: 1080, height: 1920, label: "9:16" },
  { id: "whatsapp-status", name: "WhatsApp Status", width: 1080, height: 1920, label: "9:16" },
  { id: "instagram-post", name: "Instagram Post", width: 1080, height: 1080, label: "1:1" },
  { id: "square", name: "Square", width: 1080, height: 1080, label: "1:1" },
  { id: "landscape", name: "YouTube", width: 1920, height: 1080, label: "16:9" },
  { id: "custom", name: "Custom", width: 0, height: 0, label: "Custom" },
];

export const presetById = (id: string): SocialPreset | undefined =>
  SOCIAL_PRESETS.find((p) => p.id === id);

/** Resize an image/video to fit a target while keeping its aspect ratio true. */
export const fitDimensions = (
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number
): { width: number; height: number; crop: boolean } => {
  if (!targetW || !targetH) return { width: sourceW, height: sourceH, crop: false };
  const targetRatio = targetW / targetH;
  const sourceRatio = sourceW / sourceH;
  // If aspect differs, we crop the source to the target ratio (center crop).
  if (Math.abs(sourceRatio - targetRatio) > 0.001) {
    return { width: targetW, height: targetH, crop: true };
  }
  return { width: targetW, height: targetH, crop: false };
};
