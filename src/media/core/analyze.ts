/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * analyzeMedia — real inspection of a media file using the browser's
 * media stack. Returns measured metadata plus truthful capability detection.
 * Used by the shared MediaTool analysis step.
 */

import { MediaFile, MediaMetadata, MediaCapabilities } from "./types";
import { inspectMedia, detectCapabilities } from "./inspect";

export interface AnalyzeResult {
  metadata: MediaMetadata;
  capabilities: MediaCapabilities;
}

export const analyzeMedia = async (file: MediaFile): Promise<AnalyzeResult> => {
  const metadata = await inspectMedia(file);
  const capabilities = detectCapabilities(metadata);
  return { metadata, capabilities };
};
