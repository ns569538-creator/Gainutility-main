/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Human-friendly formatting helpers for media metadata (bytes, duration,
 * dimensions). Pure functions, DOM-free so they can run anywhere.
 */

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes;
  let u = -1;
  do {
    v /= 1024;
    u += 1;
  } while (v >= 1024 && u < units.length - 1);
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
};

export const formatDuration = (seconds?: number): string => {
  if (!Number.isFinite(seconds) || seconds == null) return "—";
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss}`;
};

export const formatDimensions = (width?: number, height?: number): string =>
  width && height ? `${width}×${height}` : "—";

export const formatPercent = (size: number, inputSize: number): string => {
  if (!inputSize || !Number.isFinite(inputSize)) return "";
  const pct = (1 - size / inputSize) * 100;
  return `${pct.toFixed(0)}%`;
};

/** How much smaller (or larger) a result is vs the input, as a signed pct. */
export const sizeDeltaPercent = (size: number, inputSize: number): number => {
  if (!inputSize || !Number.isFinite(inputSize)) return 0;
  return ((size - inputSize) / inputSize) * 100;
};
