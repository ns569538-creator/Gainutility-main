/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for rendering slide background patterns.
 *
 * A pattern is rendered once to an SVG string, then:
 *   - the editor preview embeds it as a CSS background-image data URI
 *     (see SlideCanvasStage)
 *   - the export rasterizer loads the same data URI and paints it onto the
 *     output canvas (see canvasUtils)
 *
 * Using the same SVG in both paths guarantees the exported image is
 * pixel-for-pixel consistent with the on-canvas preview — no divergent
 * "preview vs. export" template rendering.
 */

import { CarouselSlide } from "./types";

/**
 * Build the reusable SVG string for a slide's background pattern, sized to
 * the full slide canvas (CSS px). Returns null when there is no pattern.
 * Accepts anything carrying the slide's `pattern` field (a CarouselSlide or a
 * TemplateDef) so picker previews and exports share the exact same renderer.
 */
export function slidePatternSVG(
  slide: Pick<CarouselSlide, "pattern">,
  width: number,
  height: number
): string | null {
  const p = slide.pattern;
  if (!p || p.type === "none") return null;

  const color = p.color || "rgba(117,171,82,0.2)";
  const s = Math.max(20, p.scale || 60);

  switch (p.type) {
    case "grid": {
      return svg(width, height, `
        <defs>
          <pattern id="g" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
            <path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${color}" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      `);
    }
    case "dots": {
      return svg(width, height, `
        <defs>
          <pattern id="d" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
            <circle cx="${s / 2}" cy="${s / 2}" r="${Math.max(0.5, s / 9)}" fill="${color}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#d)"/>
      `);
    }
    case "lines": {
      const r = `${color}`;
      return svg(width, height, `
        <defs>
          <pattern id="l" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="${s / 2}" x2="${s}" y2="${s / 2}" stroke="${r}" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#l)"/>
      `);
    }
    case "circles": {
      return svg(width, height, `
        <circle cx="${width * 0.16}" cy="${height * 0.16}" r="${s}" fill="${color}"/>
        <circle cx="${width * 0.82}" cy="${height * 0.3}" r="${s * 1.6}" fill="${color}"/>
        <circle cx="${width * 0.3}" cy="${height * 0.8}" r="${s * 1.3}" fill="${color}"/>
        <circle cx="${width * 0.78}" cy="${height * 0.92}" r="${s * 0.9}" fill="${color}"/>
      `);
    }
    case "waves": {
      return svg(width, height, `
        <path d="M0 ${height * 0.7} Q ${width * 0.2} ${height * 0.3}, ${width * 0.4} ${height * 0.65} T ${width} ${height * 0.6} L ${width} ${height} L 0 ${height} Z" fill="${color}"/>
      `);
    }
    case "shapes": {
      return svg(width, height, `
        <g fill="${color}">
          <rect x="${width * 0.06}" y="${height * 0.08}" width="${s * 1.8}" height="${s * 0.5}" rx="${s * 0.25}"/>
          <rect x="${width * 0.72}" y="${height * 0.16}" width="${s * 1.4}" height="${s * 0.42}" rx="${s * 0.21}"/>
          <rect x="${width * 0.14}" y="${height * 0.78}" width="${s * 1.6}" height="${s * 0.46}" rx="${s * 0.23}"/>
          <rect x="${width * 0.64}" y="${height * 0.86}" width="${s * 1.9}" height="${s * 0.5}" rx="${s * 0.25}"/>
        </g>
      `);
    }
    default:
      return null;
  }
}

function svg(width: number, height: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
}

/** URL-safe data URI for a slide's pattern (for the CSS preview layer). */
export function slidePatternDataURI(
  slide: Pick<CarouselSlide, "pattern">,
  width: number,
  height: number
): string | null {
  const svgStr = slidePatternSVG(slide, width, height);
  if (!svgStr) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
}
