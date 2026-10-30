/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from "jszip";
import {
  LogoLayout,
  LogoShape,
  LogoSymbol,
  LogoPalette,
  MonogramStyle,
  VectorPrimitive,
  LOGO_SYMBOLS,
} from "./logoPresets";
import { embedFontInSvg, ensureDocumentFont, getCleanFontFamily } from "./fontManager";

interface RenderOptions {
  showSelectionOverlay?: boolean;
  isLogoSelected?: boolean;
  selectedPrimitiveId?: string | null;
  hoveredPrimitiveId?: string | null;
  canvasWidth?: number;
  canvasHeight?: number;
  showAlignmentGuides?: boolean;
  showSnapGuides?: { x?: boolean; y?: boolean };
  isDragging?: boolean;
}

export interface LogoConfig {
  brandName: string;
  tagline: string;
  layout: LogoLayout;
  shape: LogoShape;
  symbol: LogoSymbol;
  palette: LogoPalette;
  fontFamily: string;
  fontWeight: number;
  letterSpacing: number; // in em, e.g. -0.02 to 0.20
  fontSize?: number; // base brand text size, default 72
  iconSize?: number; // base icon size in px, default 96
  iconScale: number; // icon scale multiplier, default 1
  overallScale?: number; // overall logo scale multiplier, default 1
  iconTextGap?: number; // gap between icon and text in px, default 20 (0 - 96px)
  brandTaglineGap?: number; // gap between brand name and tagline in px, default 18
  symbolOffsetX?: number; // horizontal fine offset for symbol in px
  symbolOffsetY?: number; // vertical fine offset for symbol in px
  logoOffsetX?: number; // artboard horizontal offset for entire logo lockup
  logoOffsetY?: number; // artboard vertical offset for entire logo lockup
  iconAlignment?: "start" | "center" | "end"; // icon alignment with text block
  iconContainerShape?: "none" | "circle" | "rounded" | "square" | "capsule";
  iconContainerPadding?: number; // padding inside icon container in px
  iconContainerColor?: string; // background fill of container
  iconContainerBorderColor?: string; // border color of container
  iconContainerBorderWidth?: number; // border stroke width in px
  iconContainerRadius?: number; // radius for rounded container
  textOffsetX?: number; // horizontal offset for text in px
  textOffsetY?: number; // vertical offset for text in px
  textTransform?: "none" | "uppercase" | "lowercase";
  textAlign?: "left" | "center" | "right";
  monogramText: string;
  monogramStyle?: MonogramStyle;
  customIconSvg?: string;
  showTagline: boolean;
  primitives?: VectorPrimitive[];
  borderWidth?: number;
  borderColor?: string;
  padding?: number;
  backgroundColor?: string | null;
}

export function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Estimates text width based on character count, average character aspect ratio,
 * font weight and letter spacing.
 * Includes extra padding for descenders/ascenders to prevent clipping.
 */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  letterSpacingEm: number = 0,
  fontWeight: number = 700
): number {
  if (!text) return 0;
  // Weight factor: bold fonts take slightly more horizontal space
  const weightFactor = fontWeight >= 800 ? 0.62 : fontWeight >= 600 ? 0.58 : 0.54;
  let charWidthSum = 0;
  for (const ch of text) {
    if (/[ijlI1\.,;:\'!]/.test(ch)) {
      charWidthSum += fontSize * 0.28;
    } else if (/[wmWM@]/.test(ch)) {
      charWidthSum += fontSize * 0.88;
    } else if (/[A-Z]/.test(ch)) {
      charWidthSum += fontSize * 0.68;
    } else {
      charWidthSum += fontSize * weightFactor;
    }
  }
  const trackingPx = letterSpacingEm * fontSize * (text.length - 1);
  // Add 10% padding for safety margin (prevents clipping at edges)
  return Math.round((charWidthSum + trackingPx) * 1.1);
}

/**
 * Estimates text bounding box for layout calculations.
 * Returns { width, ascent, descent, lineHeight }
 */
export function estimateTextBounds(
  text: string,
  fontSize: number,
  letterSpacingEm: number = 0,
  fontWeight: number = 700
): { width: number; ascent: number; descent: number; lineHeight: number } {
  const width = estimateTextWidth(text, fontSize, letterSpacingEm, fontWeight);
  // Standard font metrics approximations
  const ascent = fontSize * 0.85;  // Top of capital letters
  const descent = fontSize * 0.30; // Bottom of descenders (g, y, p, j, Q)
  const lineHeight = fontSize * 1.25;
  return { width, ascent, descent, lineHeight };
}

/**
 * Generates mathematically aligned, clean vector SVG markup for the configured logo.
 */
export function buildLogoSvg(
  config: LogoConfig,
  customWidth?: number,
  customHeight?: number,
  renderOptions?: RenderOptions
): string {
  const {
    brandName,
    tagline,
    layout,
    shape,
    symbol,
    palette,
    fontFamily,
    fontWeight,
    letterSpacing,
    iconScale,
    monogramText,
    monogramStyle = "circle",
    showTagline,
    primitives = [],
    borderWidth,
    borderColor,
    padding,
  } = config;

  const activeSymbol: LogoSymbol =
    symbol ||
    LOGO_SYMBOLS.find(
      (s) => s.id === (config as any).symbolId || s.id === (config as any).selectedSymbolId
    ) ||
    LOGO_SYMBOLS[0];

  const { showSelectionOverlay = false, selectedPrimitiveId = null, hoveredPrimitiveId = null, canvasWidth, canvasHeight } = renderOptions || {};

  const isSquare =
    layout === "monogram" ||
    layout === "icon-only" ||
    shape === "circle" ||
    shape === "square" ||
    shape === "pill" ||
    shape === "badge";

  // Fixed canonical design coordinate system (Prompt Section 5)
  // Standard artboard: 1200 x 800; Square artboard: 800 x 800
  const defaultWidth = isSquare ? 800 : 1200;
  const defaultHeight = 800;
  const actualWidth = customWidth ?? defaultWidth;
  const actualHeight = customHeight ?? defaultHeight;
  const cx = actualWidth / 2;
  const cy = actualHeight / 2;

  const cleanFont = getCleanFontFamily(fontFamily);
  const overallScale = config.overallScale || 1;
  const effectiveIconScale = iconScale || 1;
  const iconAlignment = config.iconAlignment || "center";
  const symbolOffsetX = config.symbolOffsetX ?? 0;
  const symbolOffsetY = config.symbolOffsetY ?? 0;
  const textOffsetX = config.textOffsetX ?? 0;
  const textOffsetY = config.textOffsetY ?? 0;

  const logoOffsetX = config.logoOffsetX ?? 0;
  const logoOffsetY = config.logoOffsetY ?? 0;
  const logoCenterX = cx + logoOffsetX;
  const logoCenterY = cy + logoOffsetY;

  const formatText = (txt: string, transform?: "none" | "uppercase" | "lowercase") => {
    if (!txt) return "";
    if (transform === "uppercase") return txt.toUpperCase();
    if (transform === "lowercase") return txt.toLowerCase();
    return txt;
  };

  const displayBrandName = formatText(brandName, config.textTransform) || "Brand";
  const displayTagline = formatText(tagline, "uppercase");
  const hasTagline = showTagline && Boolean(displayTagline.trim());

  // Helper to evaluate text and icon metrics for any given font size:
  const getLockupMetrics = (fSize: number) => {
    const brandCapHeight = fSize * 0.72;
    const bWidth = estimateTextWidth(displayBrandName, fSize, letterSpacing, fontWeight);
    const tagFSize = Math.max(13, Math.round(fSize * 0.30));
    const tagCapHeight = tagFSize * 0.72;
    const tagW = hasTagline ? estimateTextWidth(displayTagline, tagFSize, 0.14, 600) : 0;
    const wordmarkW = Math.max(bWidth, tagW);

    // Spacing derived from actual geometry rather than arbitrary offsets
    const brandTagGap = config.brandTaglineGap !== undefined
      ? Math.round(config.brandTaglineGap * (fSize / 72))
      : Math.round(brandCapHeight * 0.28);
    const textGroupH = hasTagline ? brandCapHeight + brandTagGap + tagCapHeight : brandCapHeight;

    // Icon height is ~1.1x cap height of brand name as standard starting point
    const iSize = Math.round(brandCapHeight * 1.1 * iconScale);
    const hasIconContainer = Boolean(config.iconContainerShape && config.iconContainerShape !== "none");
    const cPadding = hasIconContainer ? Math.round((config.iconContainerPadding ?? 14) * (fSize / 72)) : 0;
    const effIconW = hasIconContainer
      ? (config.iconContainerShape === "capsule" ? (iSize + cPadding * 2) * 1.25 : iSize + cPadding * 2)
      : iSize;
    const effIconH = hasIconContainer ? iSize + cPadding * 2 : iSize;

    const iTextGap = config.iconTextGap !== undefined
      ? Math.round(config.iconTextGap * (fSize / 72))
      : Math.round(brandCapHeight * 0.36);

    let lWidth = wordmarkW;
    let lHeight = textGroupH;

    if (layout === "icon-left" || layout === "icon-right") {
      lWidth = effIconW + iTextGap + wordmarkW;
      lHeight = Math.max(effIconH, textGroupH);
    } else if (layout === "icon-top" || layout === "icon-bottom") {
      lWidth = Math.max(effIconW, wordmarkW);
      lHeight = effIconH + iTextGap + textGroupH;
    } else if (layout === "monogram" || layout === "icon-only") {
      lWidth = isSquare ? 420 : 500;
      lHeight = isSquare ? 420 : 500;
    }

    return {
      fSize,
      brandCapHeight,
      brandTextWidth: bWidth,
      taglineFontSize: tagFSize,
      taglineCapHeight: tagCapHeight,
      taglineWidth: tagW,
      wordmarkWidth: wordmarkW,
      brandTaglineGap: brandTagGap,
      textGroupHeight: textGroupH,
      iconSize: iSize,
      hasContainer: hasIconContainer,
      containerPadding: cPadding,
      effectiveIconWidth: effIconW,
      effectiveIconHeight: effIconH,
      iconTextGap: iTextGap,
      lockupWidth: lWidth,
      lockupHeight: lHeight,
    };
  };

  // Determine optimal base font size so lockup occupies ~55-62% of artboard width:
  const testMetrics = getLockupMetrics(100);
  const targetLockupWidth = actualWidth * 0.58;
  const targetLockupMaxHeight = actualHeight * 0.60;

  let optimalBaseFontSize = 96;
  if (testMetrics.lockupWidth > 0 && testMetrics.lockupHeight > 0) {
    const scaleFactor = Math.min(
      targetLockupWidth / testMetrics.lockupWidth,
      targetLockupMaxHeight / testMetrics.lockupHeight
    );
    optimalBaseFontSize = Math.round(100 * scaleFactor);
  }
  // Clamp base font size to sensible limits
  optimalBaseFontSize = Math.max(48, Math.min(220, optimalBaseFontSize));

  // If user explicitly provided config.fontSize (where 46 is reference default), scale proportionally:
  const userFontRatio = config.fontSize ? (config.fontSize / 46) : 1;
  const brandFontSize = Math.round(optimalBaseFontSize * userFontRatio * overallScale);

  // Compute final geometry metrics with the calculated brandFontSize:
  const metrics = getLockupMetrics(brandFontSize);
  const {
    brandCapHeight,
    brandTextWidth,
    taglineFontSize,
    taglineCapHeight,
    taglineWidth,
    brandTaglineGap,
    textGroupHeight,
    iconSize,
    hasContainer,
    containerPadding,
    effectiveIconWidth,
    effectiveIconHeight,
    iconTextGap,
    lockupWidth: totalLockupWidth,
    lockupHeight: totalLockupHeight,
  } = metrics;

  const trackingPx = letterSpacing * brandFontSize;

  // Convert normalized coordinates to pixel coordinates
  const normToPx = (normX: number, normY: number) => ({
    x: cx + normX * (actualWidth / 2),
    y: cy + normY * (actualHeight / 2),
  });

  const normToSize = (normSize: number) => normSize * Math.min(actualWidth, actualHeight);

  // Background shape definition
  let bgElement = "";
  const containerFill = config.borderWidth && config.borderColor ? config.borderColor : palette.bgColor;
  
  if (shape !== "transparent") {
    const borderW = config.borderWidth || 0;
    const borderC = config.borderColor || palette.accentColor;
    const radius = config.padding || 0;

    if (shape === "circle") {
      const r = Math.min(cx, cy) * 0.92;
      bgElement = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${containerFill}" 
          ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />
      `;
    } else if (shape === "rounded") {
      const rx = radius > 0 ? radius : Math.min(actualWidth, actualHeight) * 0.08;
      bgElement = `
        <rect width="${actualWidth}" height="${actualHeight}" rx="${rx}" fill="${containerFill}"
          ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />
      `;
    } else if (shape === "square") {
      bgElement = `
        <rect width="${actualWidth}" height="${actualHeight}" fill="${containerFill}"
          ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />
      `;
    } else if (shape === "pill") {
      const rx = Math.min(actualWidth, actualHeight) / 2;
      bgElement = `
        <rect width="${actualWidth}" height="${actualHeight}" rx="${rx}" fill="${containerFill}"
          ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />
      `;
    } else if (shape === "badge") {
      bgElement = `
        <rect width="${actualWidth}" height="${actualHeight}" rx="32" fill="${containerFill}"
          ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />
        <rect x="16" y="16" width="${actualWidth - 32}" height="${actualHeight - 32}" rx="24" fill="none" stroke="${palette.accentColor}" stroke-width="3" opacity="0.6" />
      `;
    } else {
      bgElement = `<rect width="${actualWidth}" height="${actualHeight}" fill="${containerFill}" ${borderW > 0 ? `stroke="${borderC}" stroke-width="${borderW}"` : ""} />`;
    }
  } else if (config.backgroundColor) {
    bgElement = `<rect width="${actualWidth}" height="${actualHeight}" fill="${config.backgroundColor}" />`;
  }

  // Symbol element renderer with container integration
  const renderSymbol = (
    sX: number,
    sY: number,
    sSize: number,
    sColor: string = palette.iconColor
  ) => {
    let containerMarkup = "";
    if (hasContainer) {
      const cFill = config.iconContainerColor || "transparent";
      const cStroke = config.iconContainerBorderColor || palette.accentColor;
      const cStrokeW = config.iconContainerBorderWidth ?? 1.5;
      const cRadius = config.iconContainerRadius ?? 16;
      if (config.iconContainerShape === "circle") {
        containerMarkup = `<circle cx="${sX}" cy="${sY}" r="${effectiveIconHeight / 2}" fill="${cFill}" ${cStrokeW > 0 ? `stroke="${cStroke}" stroke-width="${cStrokeW}"` : ""} />`;
      } else if (config.iconContainerShape === "rounded") {
        containerMarkup = `<rect x="${sX - effectiveIconWidth / 2}" y="${sY - effectiveIconHeight / 2}" width="${effectiveIconWidth}" height="${effectiveIconHeight}" rx="${cRadius}" fill="${cFill}" ${cStrokeW > 0 ? `stroke="${cStroke}" stroke-width="${cStrokeW}"` : ""} />`;
      } else if (config.iconContainerShape === "square") {
        containerMarkup = `<rect x="${sX - effectiveIconWidth / 2}" y="${sY - effectiveIconHeight / 2}" width="${effectiveIconWidth}" height="${effectiveIconHeight}" fill="${cFill}" ${cStrokeW > 0 ? `stroke="${cStroke}" stroke-width="${cStrokeW}"` : ""} />`;
      } else if (config.iconContainerShape === "capsule") {
        containerMarkup = `<rect x="${sX - effectiveIconWidth / 2}" y="${sY - effectiveIconHeight / 2}" width="${effectiveIconWidth}" height="${effectiveIconHeight}" rx="${effectiveIconHeight / 2}" fill="${cFill}" ${cStrokeW > 0 ? `stroke="${cStroke}" stroke-width="${cStrokeW}"` : ""} />`;
      }
    }

    let symbolMarkup = "";
    if (config.customIconSvg) {
      symbolMarkup = `<g transform="translate(${sX - sSize / 2}, ${sY - sSize / 2}) scale(${sSize / 100})">${config.customIconSvg}</g>`;
    } else {
      const scale = sSize / 24;
      symbolMarkup = `
        <g transform="translate(${sX}, ${sY}) scale(${scale}) translate(-12, -12)">
          <path d="${activeSymbol.path}" fill="${sColor}" fill-rule="evenodd" clip-rule="evenodd" />
        </g>
      `;
    }

    return `${containerMarkup}${symbolMarkup}`;
  };

  let contentElements = "";
  const lockupStartX = logoCenterX - totalLockupWidth / 2;
  const lockupStartY = logoCenterY - totalLockupHeight / 2;

  if (layout === "icon-left") {
    // Optical horizontal positioning
    const symbolCenterX = lockupStartX + effectiveIconWidth / 2 + symbolOffsetX;
    const textStartX = lockupStartX + effectiveIconWidth + iconTextGap + textOffsetX;

    // Optical vertical centering with complete text group
    const textBlockTop = logoCenterY - textGroupHeight / 2;
    const brandBaselineY = textBlockTop + brandCapHeight + textOffsetY;
    const taglineBaselineY = textBlockTop + brandCapHeight + brandTaglineGap + taglineCapHeight + textOffsetY;

    // Vertically center the icon against the complete text block
    let symbolCenterY = logoCenterY + symbolOffsetY;
    if (iconAlignment === "start") {
      symbolCenterY = textBlockTop + effectiveIconHeight / 2 + symbolOffsetY;
    } else if (iconAlignment === "end") {
      symbolCenterY = textBlockTop + textGroupHeight - effectiveIconHeight / 2 + symbolOffsetY;
    }

    contentElements = `
      ${renderSymbol(symbolCenterX, symbolCenterY, iconSize)}
      <g text-anchor="start">
        <text x="${textStartX}" y="${brandBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="${fontWeight}" font-size="${brandFontSize}" fill="${palette.textColor}" letter-spacing="${trackingPx}" dominant-baseline="alphabetic">${escapeXml(displayBrandName)}</text>
        ${
          hasTagline
            ? `<text x="${textStartX}" y="${taglineBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="${taglineFontSize}" fill="${palette.taglineColor}" letter-spacing="2.5" text-transform="uppercase" dominant-baseline="alphabetic">${escapeXml(displayTagline)}</text>`
            : ""
        }
      </g>
    `;
  } else if (layout === "icon-right") {
    const textStartX = lockupStartX + textOffsetX;
    const symbolCenterX = lockupStartX + Math.max(brandTextWidth, taglineWidth) + iconTextGap + effectiveIconWidth / 2 + symbolOffsetX;

    const textBlockTop = logoCenterY - textGroupHeight / 2;
    const brandBaselineY = textBlockTop + brandCapHeight + textOffsetY;
    const taglineBaselineY = textBlockTop + brandCapHeight + brandTaglineGap + taglineCapHeight + textOffsetY;

    let symbolCenterY = logoCenterY + symbolOffsetY;
    if (iconAlignment === "start") {
      symbolCenterY = textBlockTop + effectiveIconHeight / 2 + symbolOffsetY;
    } else if (iconAlignment === "end") {
      symbolCenterY = textBlockTop + textGroupHeight - effectiveIconHeight / 2 + symbolOffsetY;
    }

    contentElements = `
      <g text-anchor="start">
        <text x="${textStartX}" y="${brandBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="${fontWeight}" font-size="${brandFontSize}" fill="${palette.textColor}" letter-spacing="${trackingPx}" dominant-baseline="alphabetic">${escapeXml(displayBrandName)}</text>
        ${
          hasTagline
            ? `<text x="${textStartX}" y="${taglineBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="${taglineFontSize}" fill="${palette.taglineColor}" letter-spacing="2.5" text-transform="uppercase" dominant-baseline="alphabetic">${escapeXml(displayTagline)}</text>`
            : ""
        }
      </g>
      ${renderSymbol(symbolCenterX, symbolCenterY, iconSize)}
    `;
  } else if (layout === "icon-top") {
    const symbolCenterY = lockupStartY + effectiveIconHeight / 2 + symbolOffsetY;
    const textBlockTop = lockupStartY + effectiveIconHeight + iconTextGap;
    const brandBaselineY = textBlockTop + brandCapHeight + textOffsetY;
    const taglineBaselineY = textBlockTop + brandCapHeight + brandTaglineGap + taglineCapHeight + textOffsetY;

    let symbolCenterX = logoCenterX + symbolOffsetX;
    if (iconAlignment === "start") {
      symbolCenterX = lockupStartX + effectiveIconWidth / 2 + symbolOffsetX;
    } else if (iconAlignment === "end") {
      symbolCenterX = lockupStartX + totalLockupWidth - effectiveIconWidth / 2 + symbolOffsetX;
    }

    const textAnchor = config.textAlign === "left" ? "start" : config.textAlign === "right" ? "end" : "middle";
    const textAnchorX = config.textAlign === "left"
      ? lockupStartX + textOffsetX
      : config.textAlign === "right"
      ? lockupStartX + totalLockupWidth + textOffsetX
      : logoCenterX + textOffsetX;

    contentElements = `
      ${renderSymbol(symbolCenterX, symbolCenterY, iconSize)}
      <g text-anchor="${textAnchor}">
        <text x="${textAnchorX}" y="${brandBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="${fontWeight}" font-size="${brandFontSize}" fill="${palette.textColor}" letter-spacing="${trackingPx}" dominant-baseline="alphabetic">${escapeXml(displayBrandName)}</text>
        ${
          hasTagline
            ? `<text x="${textAnchorX}" y="${taglineBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="${taglineFontSize}" fill="${palette.taglineColor}" letter-spacing="2.5" text-transform="uppercase" dominant-baseline="alphabetic">${escapeXml(displayTagline)}</text>`
            : ""
        }
      </g>
    `;
  } else if (layout === "icon-bottom") {
    const textBlockTop = lockupStartY;
    const brandBaselineY = textBlockTop + brandCapHeight + textOffsetY;
    const taglineBaselineY = textBlockTop + brandCapHeight + brandTaglineGap + taglineCapHeight + textOffsetY;
    const symbolCenterY = textBlockTop + textGroupHeight + iconTextGap + effectiveIconHeight / 2 + symbolOffsetY;

    let symbolCenterX = logoCenterX + symbolOffsetX;
    if (iconAlignment === "start") {
      symbolCenterX = lockupStartX + effectiveIconWidth / 2 + symbolOffsetX;
    } else if (iconAlignment === "end") {
      symbolCenterX = lockupStartX + totalLockupWidth - effectiveIconWidth / 2 + symbolOffsetX;
    }

    const textAnchor = config.textAlign === "left" ? "start" : config.textAlign === "right" ? "end" : "middle";
    const textAnchorX = config.textAlign === "left"
      ? lockupStartX + textOffsetX
      : config.textAlign === "right"
      ? lockupStartX + totalLockupWidth + textOffsetX
      : logoCenterX + textOffsetX;

    contentElements = `
      <g text-anchor="${textAnchor}">
        <text x="${textAnchorX}" y="${brandBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="${fontWeight}" font-size="${brandFontSize}" fill="${palette.textColor}" letter-spacing="${trackingPx}" dominant-baseline="alphabetic">${escapeXml(displayBrandName)}</text>
        ${
          hasTagline
            ? `<text x="${textAnchorX}" y="${taglineBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="${taglineFontSize}" fill="${palette.taglineColor}" letter-spacing="2.5" text-transform="uppercase" dominant-baseline="alphabetic">${escapeXml(displayTagline)}</text>`
            : ""
        }
      </g>
      ${renderSymbol(symbolCenterX, symbolCenterY, iconSize)}
    `;
  } else if (layout === "monogram") {
    const rawInitials = (monogramText || brandName.slice(0, 2)).trim().toUpperCase();
    const initials = rawInitials.slice(0, 3) || "V";
    const emblemRadius = Math.min(cx, cy) * 0.58 * overallScale;
    const initialsFontSize = initials.length === 1 ? emblemRadius * 1.15 : initials.length === 2 ? emblemRadius * 0.85 : emblemRadius * 0.68;
    const emblemCenterX = logoCenterX + symbolOffsetX;
    const emblemCenterY = logoCenterY + symbolOffsetY;

    let monogramEnclosure = "";
    if (monogramStyle === "circle") {
      monogramEnclosure = `
        <circle cx="${emblemCenterX}" cy="${emblemCenterY}" r="${emblemRadius}" fill="none" stroke="${palette.iconColor}" stroke-width="5" />
        <circle cx="${emblemCenterX}" cy="${emblemCenterY}" r="${emblemRadius - 12}" fill="none" stroke="${palette.accentColor}" stroke-dasharray="6 4" stroke-width="2" opacity="0.75" />
      `;
    } else if (monogramStyle === "shield") {
      monogramEnclosure = `
        <path d="M${emblemCenterX} ${emblemCenterY - emblemRadius} Q${emblemCenterX + emblemRadius * 0.9} ${emblemCenterY - emblemRadius} ${emblemCenterX + emblemRadius * 0.85} ${emblemCenterY + emblemRadius * 0.2} Q${emblemCenterX + emblemRadius * 0.5} ${emblemCenterY + emblemRadius * 0.9} ${emblemCenterX} ${emblemCenterY + emblemRadius} Q${emblemCenterX - emblemRadius * 0.5} ${emblemCenterY + emblemRadius * 0.9} ${emblemCenterX - emblemRadius * 0.85} ${emblemCenterY + emblemRadius * 0.2} Q${emblemCenterX - emblemRadius * 0.9} ${emblemCenterY - emblemRadius} ${emblemCenterX} ${emblemCenterY - emblemRadius} Z" fill="none" stroke="${palette.iconColor}" stroke-width="4.5" />
      `;
    } else if (monogramStyle === "hexagon") {
      const hR = emblemRadius * 0.95;
      const pts = [0, 60, 120, 180, 240, 300]
        .map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return `${emblemCenterX + hR * Math.cos(rad)},${emblemCenterY + hR * Math.sin(rad)}`;
        })
        .join(" ");
      monogramEnclosure = `
        <polygon points="${pts}" fill="none" stroke="${palette.iconColor}" stroke-width="4.5" />
        <polygon points="${pts}" fill="none" stroke="${palette.accentColor}" stroke-width="1.5" transform="scale(0.88) translate(${emblemCenterX * 0.136}, ${emblemCenterY * 0.136})" opacity="0.6" />
      `;
    } else if (monogramStyle === "diamond") {
      monogramEnclosure = `
        <rect x="${emblemCenterX - emblemRadius * 0.72}" y="${emblemCenterY - emblemRadius * 0.72}" width="${emblemRadius * 1.44}" height="${emblemRadius * 1.44}" fill="none" stroke="${palette.iconColor}" stroke-width="4.5" transform="rotate(45 ${emblemCenterX} ${emblemCenterY})" />
      `;
    } else if (monogramStyle === "stacked" && initials.length >= 2) {
      const char1 = initials[0];
      const char2 = initials[1];
      contentElements = `
        <g text-anchor="middle">
          <text x="${emblemCenterX - 30}" y="${emblemCenterY - 10}" font-family="'${cleanFont}', sans-serif" font-weight="900" font-size="110" fill="${palette.iconColor}">${escapeXml(char1)}</text>
          <text x="${emblemCenterX + 30}" y="${emblemCenterY + 68}" font-family="'${cleanFont}', sans-serif" font-weight="900" font-size="110" fill="${palette.textColor}">${escapeXml(char2)}</text>
          <line x1="${emblemCenterX - 65}" y1="${emblemCenterY + 12}" x2="${emblemCenterX + 65}" y2="${emblemCenterY + 12}" stroke="${palette.accentColor}" stroke-width="4" opacity="0.7" />
        </g>
      `;
    } else {
      monogramEnclosure = `
        <rect x="${emblemCenterX - emblemRadius * 0.75}" y="${emblemCenterY - emblemRadius * 0.75}" width="${emblemRadius * 1.5}" height="${emblemRadius * 1.5}" rx="20" fill="none" stroke="${palette.iconColor}" stroke-width="4" />
      `;
    }

    if (!contentElements) {
      contentElements = `
        ${monogramEnclosure}
        <text x="${emblemCenterX}" y="${emblemCenterY + (initialsFontSize * 0.35) + textOffsetY}" font-family="'${cleanFont}', sans-serif" font-weight="800" font-size="${initialsFontSize}" fill="${palette.textColor}" text-anchor="middle" letter-spacing="1">${escapeXml(initials)}</text>
        ${
          hasTagline
            ? `<text x="${emblemCenterX}" y="${emblemCenterY + emblemRadius + 38 + textOffsetY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="16" fill="${palette.taglineColor}" text-anchor="middle" letter-spacing="3" text-transform="uppercase">${escapeXml(displayTagline)}</text>`
            : ""
        }
      `;
    }
  } else if (layout === "wordmark-only") {
    const textBlockTop = logoCenterY - textGroupHeight / 2;
    const brandBaselineY = textBlockTop + brandCapHeight + textOffsetY;
    const taglineBaselineY = textBlockTop + brandCapHeight + brandTaglineGap + taglineCapHeight + textOffsetY;

    const textAnchor = config.textAlign === "left" ? "start" : config.textAlign === "right" ? "end" : "middle";
    const textAnchorX = config.textAlign === "left"
      ? lockupStartX + textOffsetX
      : config.textAlign === "right"
      ? lockupStartX + totalLockupWidth + textOffsetX
      : logoCenterX + textOffsetX;

    contentElements = `
      <g text-anchor="${textAnchor}">
        <text x="${textAnchorX}" y="${brandBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="${fontWeight}" font-size="${brandFontSize + 6}" fill="${palette.textColor}" letter-spacing="${trackingPx}" dominant-baseline="alphabetic">
          ${escapeXml(displayBrandName)}<tspan fill="${palette.iconColor}">.</tspan>
        </text>
        ${
          hasTagline
            ? `<text x="${textAnchorX}" y="${taglineBaselineY}" font-family="'${cleanFont}', sans-serif" font-weight="600" font-size="${taglineFontSize}" fill="${palette.taglineColor}" letter-spacing="2.5" text-transform="uppercase" dominant-baseline="alphabetic">${escapeXml(displayTagline)}</text>`
            : ""
        }
      </g>
    `;
  } else {
    // icon-only
    const symbolSize = Math.min(actualWidth, actualHeight) * 0.44 * iconScale * overallScale;
    contentElements = renderSymbol(logoCenterX + symbolOffsetX, logoCenterY + symbolOffsetY, symbolSize);
  }

  // Wrap content elements in an interactive logo lockup group:
  contentElements = `<g id="logo-lockup-group" data-logo-group="true" ${renderOptions?.isDragging ? 'style="cursor: grabbing;"' : 'style="cursor: grab;"'}>
    ${contentElements}
  </g>`;

  // Selection bounding box overlay:
  let selectionBoxMarkup = "";
  if (renderOptions?.showSelectionOverlay && renderOptions?.isLogoSelected) {
    const selPad = 14;
    const selX = lockupStartX - selPad;
    const selY = lockupStartY - selPad;
    const selW = totalLockupWidth + selPad * 2;
    const selH = totalLockupHeight + selPad * 2;
    selectionBoxMarkup = `
      <g class="logo-selection-box" pointer-events="none">
        <rect x="${selX}" y="${selY}" width="${selW}" height="${selH}" rx="8" fill="none" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.75" />
        <rect x="${selX - 3.5}" y="${selY - 3.5}" width="7" height="7" rx="1.5" fill="#2563EB" />
        <rect x="${selX + selW - 3.5}" y="${selY - 3.5}" width="7" height="7" rx="1.5" fill="#2563EB" />
        <rect x="${selX - 3.5}" y="${selY + selH - 3.5}" width="7" height="7" rx="1.5" fill="#2563EB" />
        <rect x="${selX + selW - 3.5}" y="${selY + selH - 3.5}" width="7" height="7" rx="1.5" fill="#2563EB" />
      </g>
    `;
  }

  // Render vector primitives (added lines, dividers, shapes)
  let primitivesMarkup = "";
  if (primitives && primitives.length > 0) {
    primitivesMarkup = primitives
      .filter((p) => p.visible !== false) // Skip hidden primitives
      .map((p) => {
        const pos = normToPx(p.x, p.y);
        const posX = pos.x;
        const posY = pos.y;
        const w = normToSize(p.width);
        const h = normToSize(p.height);
        const strokeW = normToSize(p.strokeWidth || 0.004);
        const transform = p.rotation ? `transform="rotate(${p.rotation} ${posX} ${posY})"` : "";
        const fillColor = p.fillColor || p.color;
        const borderColor = p.borderColor || p.color;
        const borderW = p.borderWidth !== undefined ? normToSize(p.borderWidth) : strokeW;
        const isSelected = showSelectionOverlay && selectedPrimitiveId === p.id;
        const isHovered = showSelectionOverlay && hoveredPrimitiveId === p.id && !isSelected;

        const renderPrimitive = () => {
          switch (p.type) {
            case "line": {
              const halfW = w / 2;
              return `<line x1="${posX - halfW}" y1="${posY}" x2="${posX + halfW}" y2="${posY}" stroke="${p.color}" stroke-width="${strokeW}" opacity="${p.opacity}" ${transform} stroke-linecap="round" />`;
            }
            case "divider": {
              const halfW = w / 2;
              return `
                <g opacity="${p.opacity}" ${transform}>
                  <line x1="${posX - halfW}" y1="${posY}" x2="${posX - Math.max(12, halfW * 0.3)}" y2="${posY}" stroke="${p.color}" stroke-width="${strokeW}" stroke-linecap="round" />
                  <rect x="${posX - 4}" y="${posY - 4}" width="8" height="8" fill="${p.color}" transform="rotate(45 ${posX} ${posY})" />
                  <line x1="${posX + Math.max(12, halfW * 0.3)}" y1="${posY}" x2="${posX + halfW}" y2="${posY}" stroke="${p.color}" stroke-width="${strokeW}" stroke-linecap="round" />
                </g>
              `;
            }
            case "rect": {
              const rx = p.radius !== undefined ? normToSize(p.radius * Math.min(w, h) * 0.5) : normToSize(0.015);
              return `<rect x="${posX - w / 2}" y="${posY - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${p.fill ? fillColor : "none"}" stroke="${p.fill ? "none" : borderColor}" stroke-width="${borderW}" opacity="${p.opacity}" ${transform} />`;
            }
            case "rounded-rect": {
              const rx = normToSize((p.radius || 0.2) * Math.min(w, h) * 0.5);
              return `<rect x="${posX - w / 2}" y="${posY - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${p.fill ? fillColor : "none"}" stroke="${p.fill ? "none" : borderColor}" stroke-width="${borderW}" opacity="${p.opacity}" ${transform} />`;
            }
            case "circle": {
              const r = w / 2;
              return `<circle cx="${posX}" cy="${posY}" r="${r}" fill="${p.fill ? fillColor : "none"}" stroke="${p.fill ? "none" : borderColor}" stroke-width="${borderW}" opacity="${p.opacity}" ${transform} />`;
            }
            case "ring": {
              const r = w / 2;
              const innerR = r * (1 - (p.strokeWidth || 0.1));
              return `
                <circle cx="${posX}" cy="${posY}" r="${r}" fill="none" stroke="${borderColor}" stroke-width="${borderW}" opacity="${p.opacity}" ${transform} />
                <circle cx="${posX}" cy="${posY}" r="${innerR}" fill="none" stroke="${borderColor}" stroke-width="${Math.max(1, borderW * 0.3)}" opacity="${p.opacity * 0.5}" ${transform} stroke-dasharray="4,4" />
              `;
            }
            case "triangle": {
              const hW = w / 2;
              const hH = h / 2;
              const pts = `${posX},${posY - hH} ${posX + hW},${posY + hH} ${posX - hW},${posY + hH}`;
              return `<polygon points="${pts}" fill="${p.fill ? fillColor : "none"}" stroke="${p.fill ? "none" : borderColor}" stroke-width="${borderW}" opacity="${p.opacity}" ${transform} />`;
            }
            case "arc": {
              const r = w / 2;
              const startAngle = -90;
              const endAngle = 90;
              const x1 = posX + r * Math.cos((startAngle * Math.PI) / 180);
              const y1 = posY + r * Math.sin((startAngle * Math.PI) / 180);
              const x2 = posX + r * Math.cos((endAngle * Math.PI) / 180);
              const y2 = posY + r * Math.sin((endAngle * Math.PI) / 180);
              const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
              return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${p.color}" stroke-width="${strokeW}" opacity="${p.opacity}" ${transform} stroke-linecap="round" />`;
            }
            case "dot": {
              const r = Math.min(w, h) / 2;
              return `<circle cx="${posX}" cy="${posY}" r="${r}" fill="${p.color}" opacity="${p.opacity}" ${transform} />`;
            }
            case "grid": {
              const cols = 3;
              const rows = 3;
              const cellW = w / cols;
              const cellH = h / rows;
              let gridMarkup = "";
              for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                  const x = posX - w / 2 + col * cellW + cellW / 2;
                  const y = posY - h / 2 + row * cellH + cellH / 2;
                  const r = Math.min(cellW, cellH) * 0.3;
                  gridMarkup += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.color}" opacity="${p.opacity}" />`;
                }
              }
              return `<g ${transform}>${gridMarkup}</g>`;
            }
            case "bracket": {
              const halfW = w / 2;
              const halfH = h / 2;
              const thickness = Math.max(2, strokeW);
              return `
                <g ${transform} stroke="${p.color}" stroke-width="${thickness}" fill="none" opacity="${p.opacity}">
                  <path d="M ${posX - halfW} ${posY - halfH} L ${posX - halfW} ${posY + halfH}" stroke-linecap="round" />
                  <path d="M ${posX + halfW} ${posY - halfH} L ${posX + halfW} ${posY + halfH}" stroke-linecap="round" />
                  <path d="M ${posX - halfW} ${posY - halfH} L ${posX - halfW * 0.5} ${posY - halfH}" stroke-linecap="round" />
                  <path d="M ${posX + halfW} ${posY - halfH} L ${posX + halfW * 0.5} ${posY - halfH}" stroke-linecap="round" />
                  <path d="M ${posX - halfW} ${posY + halfH} L ${posX - halfW * 0.5} ${posY + halfH}" stroke-linecap="round" />
                  <path d="M ${posX + halfW} ${posY + halfH} L ${posX + halfW * 0.5} ${posY + halfH}" stroke-linecap="round" />
                </g>
              `;
            }
            case "wave": {
              const amplitude = h * 0.4;
              const frequency = 2;
              const segments = 20;
              let pathD = `M ${posX - w / 2} ${posY}`;
              for (let i = 0; i <= segments; i++) {
                const x = posX - w / 2 + (w * i) / segments;
                const y = posY + amplitude * Math.sin((i / segments) * frequency * Math.PI * 2);
                pathD += ` L ${x} ${y}`;
              }
              return `<path d="${pathD}" fill="none" stroke="${p.color}" stroke-width="${strokeW}" opacity="${p.opacity}" ${transform} stroke-linecap="round" stroke-linejoin="round" />`;
            }
            default:
              return "";
          }
        };

        const primitiveSVG = renderPrimitive();

        // Add selection overlay if selected
        let selectionOverlay = "";
        if (isSelected) {
          const bounds = getPrimitiveBounds(p, posX, posY, w, h);
          selectionOverlay = `
            <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"
              fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="6,4" pointer-events="none" />
            ${renderResizeHandles(bounds.x, bounds.y, bounds.width, bounds.height)}
            <text x="${bounds.x + bounds.width / 2}" y="${bounds.y - 8}" text-anchor="middle"
              font-family="system-ui" font-size="10" fill="#2563EB" font-weight="600" pointer-events="none">
              ${p.name}
            </text>
          `;
        } else if (isHovered) {
          const bounds = getPrimitiveBounds(p, posX, posY, w, h);
          selectionOverlay = `
            <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"
              fill="none" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6" pointer-events="none" />
          `;
        }

        return `${primitiveSVG}${selectionOverlay}`;
      })
      .join("\n");
  }

  function getPrimitiveBounds(p: VectorPrimitive, posX: number, posY: number, w: number, h: number) {
    const halfW = w / 2;
    const halfH = h / 2;
    let x = posX - halfW;
    let y = posY - halfH;
    let width = w;
    let height = h;

    if (p.type === "line" || p.type === "divider" || p.type === "arc" || p.type === "wave") {
      // For line-like elements, bounds are the line extent
      x = posX - halfW;
      y = posY - Math.max(halfH, 4);
      width = w;
      height = Math.max(h, 8);
    } else if (p.type === "circle" || p.type === "ring" || p.type === "dot") {
      const r = w / 2;
      x = posX - r;
      y = posY - r;
      width = r * 2;
      height = r * 2;
    } else if (p.type === "grid") {
      x = posX - halfW;
      y = posY - halfH;
      width = w;
      height = h;
    } else if (p.type === "bracket") {
      x = posX - halfW - 4;
      y = posY - halfH - 4;
      width = w + 8;
      height = h + 8;
    }

    // Add padding for stroke width
    const pad = 4;
    return { x: x - pad, y: y - pad, width: width + pad * 2, height: height + pad * 2 };
  }

  function renderResizeHandles(x: number, y: number, width: number, height: number) {
    const handleSize = 10;
    const handles = [
      { x: x - handleSize / 2, y: y - handleSize / 2 }, // top-left
      { x: x + width / 2 - handleSize / 2, y: y - handleSize / 2 }, // top-middle
      { x: x + width - handleSize / 2, y: y - handleSize / 2 }, // top-right
      { x: x - handleSize / 2, y: y + height / 2 - handleSize / 2 }, // middle-left
      { x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2 }, // middle-right
      { x: x - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-left
      { x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-middle
      { x: x + width - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-right
    ];
    return handles.map((h, i) => `
      <rect x="${h.x}" y="${h.y}" width="${handleSize}" height="${handleSize}"
        fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5" pointer-events="none"
        data-handle="${['tl','tm','tr','ml','mr','bl','bm','br'][i]}" />
    `).join("");
  }

  const showSnapX = renderOptions?.showSnapGuides?.x || (renderOptions?.showAlignmentGuides && Math.abs(logoOffsetX) < 3);
  const showSnapY = renderOptions?.showSnapGuides?.y || (renderOptions?.showAlignmentGuides && Math.abs(logoOffsetY) < 3);

  const snapGuidesMarkup = (renderOptions?.showSelectionOverlay && (showSnapX || showSnapY || renderOptions?.showAlignmentGuides))
    ? `
      <g opacity="0.6" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="4,4" pointer-events="none">
        ${showSnapX || renderOptions?.showAlignmentGuides ? `<line x1="${cx}" y1="0" x2="${cx}" y2="${actualHeight}" />` : ""}
        ${showSnapY || renderOptions?.showAlignmentGuides ? `<line x1="0" y1="${cy}" x2="${actualWidth}" y2="${cy}" />` : ""}
        <circle cx="${cx}" cy="${cy}" r="4" fill="#2563EB" />
      </g>
    `
    : "";

return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${actualWidth} ${actualHeight}" width="${actualWidth}" height="${actualHeight}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont)}:wght@${fontWeight}&display=swap');
    text { user-select: none; }
  </style>
  ${bgElement}
  ${primitivesMarkup}
  ${contentElements}
  ${selectionBoxMarkup}
  ${snapGuidesMarkup}
</svg>`;
}

/**
 * Rigorously validates SVG XML structure before triggering any download or rasterization.
 * Prevents corrupted, unclosed, or undefined SVG files from ever reaching the user.
 */
export function validateSvgString(svg: string): void {
  if (!svg || typeof svg !== "string") {
    throw new Error("SVG output is empty or not a valid string");
  }
  const trimmed = svg.trim();
  if (!trimmed.includes("<svg")) {
    throw new Error("SVG output missing root <svg> element");
  }
  if (!trimmed.includes("</svg>")) {
    throw new Error("SVG output missing closing </svg> tag");
  }
  if (!trimmed.includes("viewBox") && !trimmed.includes("width=")) {
    throw new Error("SVG output missing viewBox or width coordinate definitions");
  }
  if (trimmed.includes("NaN")) {
    throw new Error("SVG output contains invalid 'NaN' coordinate values");
  }
  if (/=["'](?:undefined|null)["']/.test(trimmed) || />\s*(?:undefined|null)\s*</.test(trimmed)) {
    throw new Error("SVG output contains unresolved 'undefined' or 'null' values");
  }
  if (trimmed.includes("[object Object]")) {
    throw new Error("SVG output contains serialized '[object Object]' markup");
  }
}

/**
 * Generates an OS-safe, cross-browser compliant filename from the brand name.
 * Strips reserved characters: / \ : * ? " < > |
 */
export function getSafeFilename(brandName: string, suffix = "", extension = "svg"): string {
  const clean = (brandName || "logo")
    .trim()
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const base = clean || "logo";
  const suff = suffix ? `-${suffix}` : "";
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `${base}${suff}${ext}`;
}

/**
 * Standalone master SVG exporter that guarantees web fonts are embedded via base64
 * and the output starts with valid XML declaration and passes rigorous validation.
 */
export async function exportLogoSvgString(config: LogoConfig): Promise<string> {
  const rawSvg = buildLogoSvg(config, undefined, undefined, { showSelectionOverlay: false });
  try {
    await ensureDocumentFont(config.fontFamily, config.fontWeight || 700);
    const withFont = await embedFontInSvg(rawSvg, config.fontFamily, config.fontWeight || 700);
    let finalSvg = withFont.trim();
    if (!finalSvg.startsWith("<?xml")) {
      finalSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + finalSvg;
    }
    validateSvgString(finalSvg);
    return finalSvg;
  } catch (err) {
    console.warn("[exportLogoSvgString] Font embedding warning, falling back to clean vector SVG:", err);
    let finalSvg = rawSvg.trim();
    if (!finalSvg.startsWith("<?xml")) {
      finalSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + finalSvg;
    }
    validateSvgString(finalSvg);
    return finalSvg;
  }
}

/**
 * Rasterizes an SVG string to a high-DPI Canvas blob,
 * ensuring web fonts are preloaded and embedded via base64 for 100% fidelity.
 */
export async function rasterizeSvgToBlob(
  svgString: string,
  targetWidth: number,
  targetHeight: number,
  transparent = true,
  fontFamily?: string,
  fontWeight?: number,
  backgroundColor?: string | null
): Promise<Blob> {
  // If font is specified and svgString does not yet have an embedded @font-face, embed it
  let finalSvg = svgString;
  if (fontFamily && !finalSvg.includes("@font-face")) {
    try {
      await ensureDocumentFont(fontFamily, fontWeight || 700);
      finalSvg = await embedFontInSvg(svgString, fontFamily, fontWeight || 700);
    } catch (e) {
      console.warn("[rasterizeSvgToBlob] Font embed warning:", e);
    }
  }

  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  validateSvgString(finalSvg);

  return new Promise((resolve, reject) => {
    const blob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = async () => {
      try {
        if ("decode" in img) {
          try {
            await img.decode();
          } catch {
            // decode error can occur on some SVG formats, proceed to draw
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Unable to create canvas 2D context"));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Always clear canvas for true alpha transparency
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // If not transparent and backgroundColor provided, fill background
        if (!transparent && backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);

        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas toBlob failed to produce PNG"));
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG for rasterization"));
    };

    img.src = url;
  });
}

/**
 * Downloads a Blob directly with safe cross-browser trigger and proper object URL lifecycle.
 */
export function triggerFileDownload(blob: Blob | string, filename: string): void {
  const url = typeof blob === "string" ? blob : URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof blob !== "string") {
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

/**
 * Packages full Brand Kit ZIP with SVG, 1x/2x/4x PNGs, Light/Dark/Monochrome variants,
 * standalone icon, social avatar, favicons, and typography documentation.
 */
export async function buildCompleteBrandKitZip(
  config: LogoConfig,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Pre-fetch base64 font for export package consistency
  onProgress?.("Loading and embedding brand typography...");
  await ensureDocumentFont(config.fontFamily, config.fontWeight);

  onProgress?.("Generating standalone master SVG with embedded typography...");
  const svgPrimary = await exportLogoSvgString(config);
  zip.file("logo.svg", svgPrimary);

  // Determine base aspect ratio based on canonical artboard
  const isSquare =
    config.layout === "monogram" ||
    config.layout === "icon-only" ||
    config.shape === "circle" ||
    config.shape === "square" ||
    config.shape === "pill" ||
    config.shape === "badge";
  const baseW = isSquare ? 800 : 1200;
  const baseH = 800;

  // 1. Transparent Standard PNG (1x)
  onProgress?.("Rasterizing 1x standard PNG...");
  const png1x = await rasterizeSvgToBlob(
    svgPrimary,
    baseW,
    baseH,
    config.shape === "transparent",
    config.fontFamily,
    config.fontWeight
  );
  zip.file("logo-standard.png", png1x);

  // 2. High-Res 2x PNG (Retina)
  onProgress?.("Rendering 2x Retina PNG...");
  const png2x = await rasterizeSvgToBlob(
    svgPrimary,
    baseW * 2,
    baseH * 2,
    config.shape === "transparent",
    config.fontFamily,
    config.fontWeight
  );
  zip.file("logo-retina-2x.png", png2x);

  // 3. Ultra High-Res 4x PNG (Print / 4K)
  onProgress?.("Rendering 4x Ultra High-Res PNG...");
  const png4x = await rasterizeSvgToBlob(
    svgPrimary,
    baseW * 4,
    baseH * 4,
    config.shape === "transparent",
    config.fontFamily,
    config.fontWeight
  );
  zip.file("logo-print-4x.png", png4x);

  // 4. Dark Mode Variant
  onProgress?.("Generating Dark Mode variant...");
  const darkConfig: LogoConfig = {
    ...config,
    shape: "rounded",
    palette: {
      ...config.palette,
      bgColor: "#0B0F19",
      textColor: "#F8FAFC",
      taglineColor: "#94A3B8",
    },
  };
  const darkSvg = await exportLogoSvgString(darkConfig);
  const darkPng = await rasterizeSvgToBlob(
    darkSvg,
    baseW * 2,
    baseH * 2,
    false,
    darkConfig.fontFamily,
    darkConfig.fontWeight
  );
  zip.file("logo-dark-mode.svg", darkSvg);
  zip.file("logo-dark-mode.png", darkPng);

  // 5. Light Mode Variant
  onProgress?.("Generating Light Mode variant...");
  const lightConfig: LogoConfig = {
    ...config,
    shape: "rounded",
    palette: {
      ...config.palette,
      bgColor: "#FFFFFF",
      textColor: "#0F172A",
      taglineColor: "#64748B",
    },
  };
  const lightSvg = await exportLogoSvgString(lightConfig);
  const lightPng = await rasterizeSvgToBlob(
    lightSvg,
    baseW * 2,
    baseH * 2,
    false,
    lightConfig.fontFamily,
    lightConfig.fontWeight
  );
  zip.file("logo-light-mode.svg", lightSvg);
  zip.file("logo-light-mode.png", lightPng);

  // 6. Monochrome Print Variant
  onProgress?.("Generating Monochrome variant...");
  const monoConfig: LogoConfig = {
    ...config,
    shape: "rounded",
    palette: {
      ...config.palette,
      iconColor: "#111827",
      textColor: "#111827",
      taglineColor: "#4B5563",
      bgColor: "#FFFFFF",
    },
  };
  const monoSvg = await exportLogoSvgString(monoConfig);
  const monoPng = await rasterizeSvgToBlob(
    monoSvg,
    baseW * 2,
    baseH * 2,
    false,
    monoConfig.fontFamily,
    monoConfig.fontWeight
  );
  zip.file("logo-monochrome.svg", monoSvg);
  zip.file("logo-monochrome.png", monoPng);

  // 7. Standalone Icon Mark (Square 512x512)
  onProgress?.("Extracting standalone square icon...");
  const markConfig: LogoConfig = {
    ...config,
    layout: config.layout === "monogram" ? "monogram" : "icon-only",
    shape: config.shape === "circle" ? "circle" : "rounded",
  };
  const markSvg = await exportLogoSvgString(markConfig);
  const markPng = await rasterizeSvgToBlob(
    markSvg,
    512,
    512,
    false,
    markConfig.fontFamily,
    markConfig.fontWeight
  );
  zip.file("logo-icon-mark.svg", markSvg);
  zip.file("logo-icon-mark.png", markPng);

  // 8. Social Avatar (500x500)
  onProgress?.("Compiling social profile avatar...");
  const avatarPng = await rasterizeSvgToBlob(
    markSvg,
    500,
    500,
    false,
    markConfig.fontFamily,
    markConfig.fontWeight
  );
  zip.file("social-avatar-500px.png", avatarPng);

  // 9. Favicon sizes (16, 32, 48, 180 apple touch)
  onProgress?.("Generating favicon & touch icons...");
  const fav16 = await rasterizeSvgToBlob(markSvg, 16, 16, true, markConfig.fontFamily, markConfig.fontWeight);
  const fav32 = await rasterizeSvgToBlob(markSvg, 32, 32, true, markConfig.fontFamily, markConfig.fontWeight);
  const fav48 = await rasterizeSvgToBlob(markSvg, 48, 48, true, markConfig.fontFamily, markConfig.fontWeight);
  const fav180 = await rasterizeSvgToBlob(markSvg, 180, 180, false, markConfig.fontFamily, markConfig.fontWeight);
  zip.file("favicon-16.png", fav16);
  zip.file("favicon-32.png", fav32);
  zip.file("favicon-48.png", fav48);
  zip.file("apple-touch-icon.png", fav180);

  // 10. Brand Guidelines README
  onProgress?.("Writing brand guidelines document...");
  const brandReadme = `=====================================================
${config.brandName.toUpperCase()} — BRAND ASSET PACKAGE
Generated by GainUtility Logo Maker (100% In-Browser & Private)
Date: ${new Date().toISOString().split("T")[0]}
=====================================================

BRAND SPECIFICATIONS:
- Brand Name:         ${config.brandName}
${config.tagline ? `- Tagline:            ${config.tagline}` : ""}
- Primary Typography: ${config.fontFamily} (Weight: ${config.fontWeight})
- Letter Spacing:     ${config.letterSpacing}em
- Layout Mode:        ${config.layout}
- Icon Symbol:        ${config.symbol.name} (${config.symbol.category})
- Icon Size:          ${config.iconSize || 56}px (Scale: ${Math.round(config.iconScale * 100)}%)
- Icon/Text Gap:      ${config.iconTextGap ?? 24}px

COLOR CODES (HEX):
- Icon Color:         ${config.palette.iconColor}
- Text Color:         ${config.palette.textColor}
- Tagline Color:      ${config.palette.taglineColor}
- Accent Color:       ${config.palette.accentColor}
- Background Color:   ${config.palette.bgColor}

FILE DIRECTORY:
- logo.svg                  : Master vector file (infinitely scalable, responsive)
- logo-standard.png         : Web header size (1x)
- logo-retina-2x.png        : Crisp 2x display for high-DPI Mac/iPhone displays
- logo-print-4x.png         : Ultra high-res 4x for presentations & mockups
- logo-dark-mode.png/svg    : High-contrast version for dark surfaces & headers
- logo-light-mode.png/svg   : Clean version for light pages & printed cards
- logo-monochrome.png/svg   : High-contrast black & white version for invoices
- logo-icon-mark.png/svg    : Standalone square mark (favicon & app icon ready)
- social-avatar-500px.png   : 500×500 square profile image for Twitter/LinkedIn
- favicon-16.png            : 16×16px browser tab favicon
- favicon-32.png            : 32×32px standard desktop shortcut icon
- favicon-48.png            : 48×48px Windows taskbar icon
- apple-touch-icon.png      : 180×180px iOS home screen icon

WEBSITE INTEGRATION TIPS:
1. For modern web headers, use 'logo.svg' with CSS:
   img.site-logo { height: 36px; width: auto; }
2. For high-DPI raster fallback, use 'logo-retina-2x.png':
   <img src="logo-standard.png" srcset="logo-retina-2x.png 2x" alt="${config.brandName}">
3. For favicon and browser tab icons, open GainUtility Favicon Generator:
   https://gainutility.com/tools/favicon-generator and upload 'logo-icon-mark.png'.

All graphics were rasterized and packaged privately in your browser.
`;
  zip.file("brand-guidelines.txt", brandReadme);

  onProgress?.("Compressing ZIP archive...");
  return await zip.generateAsync({ type: "blob" });
}
