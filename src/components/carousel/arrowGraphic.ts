/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for arrow rendering geometry.
 *
 * The editor preview renders arrows as a 0..100 viewBox SVG (see
 * SlideCanvasStage); the PNG/ZIP canvas exporter and the vector PDF exporter
 * both consume THIS builder so every renderer produces the same path, stroke
 * and arrowhead marker as the on-canvas preview.
 */

import { ArrowObject } from "./types";

/** Editor-exact arrow SVG string (viewBox 0 0 100 100, marker arrowhead). */
export function arrowSVG(obj: ArrowObject): string {
  const color = obj.color || "#75AB52";
  const sw = obj.strokeWidth || 4;
  const direction = obj.arrowDirection || "right";
  const body =
    direction === "curved-right"
      ? `<path d="M 15,85 Q 30,15 85,30" fill="none" stroke="${color}" stroke-width="${sw}" strokeLinecap="round" markerEnd="url(#a)"/>`
      : direction === "curved-left"
      ? `<path d="M 85,85 Q 70,15 15,30" fill="none" stroke="${color}" stroke-width="${sw}" strokeLinecap="round" markerEnd="url(#a)"/>`
      : `<line x1="15" y1="50" x2="85" y2="50" stroke="${color}" stroke-width="${sw}" strokeLinecap="round" markerEnd="url(#a)"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${obj.width}" height="${obj.height}" viewBox="0 0 100 100">` +
    `<defs><marker id="a" markerUnits="strokeWidth" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">` +
    `<polygon points="0 0, 6 3, 0 6" fill="${color}"/></marker></defs>` +
    body +
    "</svg>"
  );
}