/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LogoLayout =
  | "icon-left"
  | "icon-top"
  | "icon-right"
  | "icon-bottom"
  | "monogram"
  | "wordmark-only"
  | "icon-only";

export type LogoShape = "transparent" | "rounded" | "square" | "circle" | "pill" | "badge";

export type MonogramStyle =
  | "circle"
  | "shield"
  | "hexagon"
  | "diamond"
  | "stacked"
  | "minimal";

export interface VectorPrimitive {
  id: string;
  type: "line" | "rect" | "circle" | "triangle" | "divider" | "ring" | "rounded-rect" | "arc" | "dot" | "grid" | "bracket" | "wave";
  name: string;
  x: number; // horizontal offset from center (normalized -1 to 1)
  y: number; // vertical offset from center (normalized -1 to 1)
  width: number; // normalized 0 to 1
  height: number; // normalized 0 to 1
  rotation: number; // degrees
  color: string;
  opacity: number; // 0 - 1
  strokeWidth: number; // normalized 0 to 0.1
  fill: boolean;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number; // for rounded-rect, 0-1
  visible?: boolean; // visibility toggle
}

export type { LogoSymbol, LogoCategory } from "./logoIcons";
export { LOGO_CATEGORIES, LOGO_SYMBOLS, searchIcons } from "./logoIcons";

export type FontCategory =
  | "All"
  | "Sans"
  | "Serif"
  | "Display"
  | "Geometric"
  | "Editorial"
  | "Monospace"
  | "Rounded"
  | "Technical"
  | "Elegant"
  | "Bold"
  | "Minimal";

export interface LogoFont {
  fontFamily: string;
  name: string;
  category: FontCategory;
  categories?: FontCategory[];
  weights: number[];
  googleFontQuery?: string;
  letterSpacingDef?: number;
}

export interface LogoPalette {
  id: string;
  name: string;
  iconColor: string;
  textColor: string;
  taglineColor: string;
  bgColor: string;
  accentColor: string;
}

export interface LogoPreset {
  id: string;
  name: string;
  layout: LogoLayout;
  font: string;
  symbolId: string;
  palette: LogoPalette;
  shape: LogoShape;
  letterSpacing: number;
  iconScale: number;
  iconSize?: number;
  iconTextGap?: number;
  monogramStyle?: MonogramStyle;
}



export function normalizeSymbolCategory(rawCategory: string): "Abstract" | "Tech" | "Business" | "Creative" | "Nature" | "Minimal" {
  const cat = (rawCategory || "").toLowerCase();
  if (
    cat.includes("tech") ||
    cat.includes("digital") ||
    cat.includes("ai") ||
    cat.includes("code") ||
    cat.includes("server") ||
    cat.includes("cloud") ||
    cat.includes("data") ||
    cat.includes("silicon")
  ) {
    return "Tech";
  }
  if (
    cat.includes("finance") ||
    cat.includes("business") ||
    cat.includes("agency") ||
    cat.includes("security") ||
    cat.includes("educat") ||
    cat.includes("market")
  ) {
    return "Business";
  }
  if (
    cat.includes("nature") ||
    cat.includes("leaf") ||
    cat.includes("growth") ||
    cat.includes("health") ||
    cat.includes("tree") ||
    cat.includes("seed")
  ) {
    return "Nature";
  }
  if (
    cat.includes("geometric") ||
    cat.includes("minimal") ||
    cat.includes("circle") ||
    cat.includes("square") ||
    cat.includes("letter") ||
    cat.includes("arrow") ||
    cat.includes("hexagon") ||
    cat.includes("line") ||
    cat.includes("arc")
  ) {
    return "Minimal";
  }
  if (
    cat.includes("creative") ||
    cat.includes("media") ||
    cat.includes("food") ||
    cat.includes("sport") ||
    cat.includes("diamond") ||
    cat.includes("art") ||
    cat.includes("flame")
  ) {
    return "Creative";
  }
  return "Abstract";
}

export const LOGO_FONTS: LogoFont[] = [
  // Sans & Modern
  {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    name: "Plus Jakarta Sans",
    category: "Sans",
    categories: ["Sans", "Minimal"],
    weights: [500, 600, 700, 800],
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'Inter', sans-serif",
    name: "Inter",
    category: "Sans",
    categories: ["Sans", "Minimal", "Geometric"],
    weights: [500, 600, 700, 800],
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Manrope', sans-serif",
    name: "Manrope",
    category: "Sans",
    categories: ["Sans", "Minimal"],
    weights: [600, 700, 800],
    googleFontQuery: "Manrope:wght@600;700;800",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'DM Sans', sans-serif",
    name: "DM Sans",
    category: "Sans",
    categories: ["Sans", "Minimal"],
    weights: [500, 700],
    googleFontQuery: "DM+Sans:wght@500;700",
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Outfit', sans-serif",
    name: "Outfit Clean",
    category: "Sans",
    categories: ["Sans", "Minimal"],
    weights: [600, 700, 800],
    googleFontQuery: "Outfit:wght@600;700;800",
    letterSpacingDef: -0.02,
  },

  // Geometric
  {
    fontFamily: "'Montserrat', sans-serif",
    name: "Montserrat",
    category: "Geometric",
    categories: ["Geometric", "Bold", "Sans"],
    weights: [700, 800, 900],
    googleFontQuery: "Montserrat:wght@700;800;900",
    letterSpacingDef: 0.05,
  },
  {
    fontFamily: "'Poppins', sans-serif",
    name: "Poppins",
    category: "Geometric",
    categories: ["Geometric", "Sans", "Rounded"],
    weights: [600, 700, 800],
    googleFontQuery: "Poppins:wght@600;700;800",
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Space Grotesk', sans-serif",
    name: "Space Grotesk",
    category: "Geometric",
    categories: ["Geometric", "Technical", "Display"],
    weights: [600, 700],
    googleFontQuery: "Space+Grotesk:wght@600;700",
    letterSpacingDef: -0.03,
  },
  {
    fontFamily: "'IBM Plex Sans', sans-serif",
    name: "IBM Plex Sans",
    category: "Geometric",
    categories: ["Geometric", "Technical", "Sans"],
    weights: [600, 700],
    googleFontQuery: "IBM+Plex+Sans:wght@600;700",
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Roboto Mono', monospace",
    name: "Roboto Mono",
    category: "Monospace",
    categories: ["Monospace", "Technical", "Minimal"],
    weights: [500, 600, 700],
    letterSpacingDef: -0.04,
  },

  // Editorial & Serif
  {
    fontFamily: "'Playfair Display', serif",
    name: "Playfair Display",
    category: "Editorial",
    categories: ["Editorial", "Serif", "Elegant"],
    weights: [600, 700, 800],
    googleFontQuery: "Playfair+Display:ital,wght@0,600;0,700;0,800;1,600",
    letterSpacingDef: 0,
  },
  {
    fontFamily: "'Cinzel', serif",
    name: "Cinzel Heritage",
    category: "Editorial",
    categories: ["Editorial", "Serif", "Elegant"],
    weights: [600, 700, 800],
    googleFontQuery: "Cinzel:wght@600;700;800",
    letterSpacingDef: 0.12,
  },
  {
    fontFamily: "'Libre Baskerville', serif",
    name: "Libre Baskerville",
    category: "Editorial",
    categories: ["Editorial", "Serif"],
    weights: [700],
    googleFontQuery: "Libre+Baskerville:wght@700",
    letterSpacingDef: 0.02,
  },
  {
    fontFamily: "'Cormorant Garamond', serif",
    name: "Cormorant Garamond",
    category: "Editorial",
    categories: ["Editorial", "Serif", "Elegant"],
    weights: [600, 700],
    googleFontQuery: "Cormorant+Garamond:wght@600;700",
    letterSpacingDef: 0.02,
  },

  // Technical & Monospace
  {
    fontFamily: "'JetBrains Mono', monospace",
    name: "JetBrains Mono",
    category: "Technical",
    categories: ["Technical", "Monospace"],
    weights: [500, 600, 700],
    googleFontQuery: "JetBrains+Mono:wght@500;600;700",
    letterSpacingDef: -0.03,
  },
  {
    fontFamily: "'Fira Code', monospace",
    name: "Fira Code",
    category: "Technical",
    categories: ["Technical", "Monospace"],
    weights: [500, 600, 700],
    googleFontQuery: "Fira+Code:wght@500;600;700",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'Source Code Pro', monospace",
    name: "Source Code Pro",
    category: "Technical",
    categories: ["Technical", "Monospace"],
    weights: [600, 700],
    googleFontQuery: "Source+Code+Pro:wght@600;700",
    letterSpacingDef: -0.02,
  },

  // Display & Bold
  {
    fontFamily: "'Syne', sans-serif",
    name: "Syne Avant-Garde",
    category: "Display",
    categories: ["Display", "Bold"],
    weights: [700, 800],
    googleFontQuery: "Syne:wght@700;800",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'Bebas Neue', cursive",
    name: "Bebas Neue Bold",
    category: "Display",
    categories: ["Display", "Bold"],
    weights: [400],
    googleFontQuery: "Bebas+Neue",
    letterSpacingDef: 0.06,
  },
  {
    fontFamily: "'Archivo Black', sans-serif",
    name: "Archivo Black",
    category: "Display",
    categories: ["Display", "Bold"],
    weights: [400],
    googleFontQuery: "Archivo+Black",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'Anton', sans-serif",
    name: "Anton",
    category: "Display",
    categories: ["Display", "Bold"],
    weights: [400],
    googleFontQuery: "Anton",
    letterSpacingDef: 0.02,
  },

  // Elegant
  {
    fontFamily: "'Fraunces', serif",
    name: "Fraunces",
    category: "Elegant",
    categories: ["Elegant", "Editorial", "Serif"],
    weights: [600, 700, 800],
    googleFontQuery: "Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800",
    letterSpacingDef: 0.01,
  },
  {
    fontFamily: "'Abril Fatface', cursive",
    name: "Abril Fatface",
    category: "Elegant",
    categories: ["Elegant", "Display", "Serif", "Bold"],
    weights: [400],
    googleFontQuery: "Abril+Fatface",
    letterSpacingDef: 0.02,
  },
  {
    fontFamily: "'Marcellus', serif",
    name: "Marcellus",
    category: "Elegant",
    categories: ["Elegant", "Editorial", "Serif"],
    weights: [400],
    googleFontQuery: "Marcellus",
    letterSpacingDef: 0.05,
  },
  {
    fontFamily: "'Prata', serif",
    name: "Prata",
    category: "Elegant",
    categories: ["Elegant", "Editorial", "Serif"],
    weights: [400],
    googleFontQuery: "Prata",
    letterSpacingDef: 0.03,
  },

  // Rounded & Friendly
  {
    fontFamily: "'Nunito', sans-serif",
    name: "Nunito",
    category: "Rounded",
    categories: ["Rounded", "Sans"],
    weights: [600, 700, 800],
    googleFontQuery: "Nunito:wght@600;700;800",
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Quicksand', sans-serif",
    name: "Quicksand",
    category: "Rounded",
    categories: ["Rounded", "Sans"],
    weights: [600, 700],
    googleFontQuery: "Quicksand:wght@600;700",
    letterSpacingDef: 0.02,
  },
  {
    fontFamily: "'Varela Round', sans-serif",
    name: "Varela Round",
    category: "Rounded",
    categories: ["Rounded", "Sans"],
    weights: [400],
    googleFontQuery: "Varela+Round",
    letterSpacingDef: 0,
  },
  {
    fontFamily: "'Comfortaa', cursive",
    name: "Comfortaa",
    category: "Rounded",
    categories: ["Rounded", "Display"],
    weights: [600, 700],
    googleFontQuery: "Comfortaa:wght@600;700",
    letterSpacingDef: 0.01,
  },

  // Bold
  {
    fontFamily: "'Rubik', sans-serif",
    name: "Rubik Bold",
    category: "Bold",
    categories: ["Bold", "Rounded", "Sans"],
    weights: [700, 800, 900],
    googleFontQuery: "Rubik:wght@700;800;900",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'Chakra Petch', sans-serif",
    name: "Chakra Petch",
    category: "Technical",
    categories: ["Technical", "Display", "Geometric", "Bold"],
    weights: [600, 700],
    googleFontQuery: "Chakra+Petch:wght@600;700",
    letterSpacingDef: -0.01,
  },
  {
    fontFamily: "'Exo 2', sans-serif",
    name: "Exo 2",
    category: "Technical",
    categories: ["Technical", "Geometric", "Sans", "Bold"],
    weights: [700, 800],
    googleFontQuery: "Exo+2:wght@700;800",
    letterSpacingDef: -0.02,
  },

  // Minimal
  {
    fontFamily: "'Inter', sans-serif",
    name: "Inter Tight",
    category: "Minimal",
    categories: ["Minimal", "Sans"],
    weights: [500, 600, 700],
    googleFontQuery: "Inter+Tight:wght@500;600;700",
    letterSpacingDef: -0.02,
  },
  {
    fontFamily: "'DM Sans', sans-serif",
    name: "DM Sans Minimal",
    category: "Minimal",
    categories: ["Minimal", "Sans"],
    weights: [500, 600],
    googleFontQuery: "DM+Sans:wght@500;600",
    letterSpacingDef: 0,
  },
  {
    fontFamily: "'Outfit', sans-serif",
    name: "Outfit Light",
    category: "Minimal",
    categories: ["Minimal", "Sans"],
    weights: [300, 400, 500],
    googleFontQuery: "Outfit:wght@300;400;500",
    letterSpacingDef: 0.02,
  },
  {
    fontFamily: "'IBM Plex Sans', sans-serif",
    name: "IBM Plex Sans Light",
    category: "Minimal",
    categories: ["Minimal", "Sans", "Geometric"],
    weights: [300, 400, 500],
    googleFontQuery: "IBM+Plex+Sans:wght@300;400;500",
    letterSpacingDef: 0.01,
  },
];

export const LOGO_PALETTES: LogoPalette[] = [
  {
    id: "bold-energetic",
    name: "Bold & Energetic",
    iconColor: "#EA580C",
    textColor: "#0F172A",
    taglineColor: "#475569",
    bgColor: "#FFFDF7",
    accentColor: "#FB923C",
  },
  {
    id: "trust-tech",
    name: "Trust & Technology",
    iconColor: "#2563EB",
    textColor: "#0F172A",
    taglineColor: "#64748B",
    bgColor: "#FFFFFF",
    accentColor: "#60A5FA",
  },
  {
    id: "eco-organic",
    name: "Eco & Organic",
    iconColor: "#059669",
    textColor: "#064E3B",
    taglineColor: "#047857",
    bgColor: "#FDFBF7",
    accentColor: "#34D399",
  },
  {
    id: "premium-luxury",
    name: "Premium & Luxury",
    iconColor: "#D97706",
    textColor: "#F8FAFC",
    taglineColor: "#CBD5E1",
    bgColor: "#0B0F17",
    accentColor: "#FBBF24",
  },
  {
    id: "creative-dynamic",
    name: "Creative & Dynamic",
    iconColor: "#7C3AED",
    textColor: "#1E1B4B",
    taglineColor: "#6B7280",
    bgColor: "#FFFFFF",
    accentColor: "#C084FC",
  },
  {
    id: "minimal-editorial",
    name: "Minimal & Editorial",
    iconColor: "#111827",
    textColor: "#111827",
    taglineColor: "#4B5563",
    bgColor: "#FFFFFF",
    accentColor: "#64748B",
  },
  {
    id: "cyber-neon",
    name: "Cyber & AI",
    iconColor: "#06B6D4",
    textColor: "#F1F5F9",
    taglineColor: "#94A3B8",
    bgColor: "#030712",
    accentColor: "#38BDF8",
  },
  {
    id: "gainutility-brand",
    name: "GainUtility Signature",
    iconColor: "#D97A3F",
    textColor: "#172015",
    taglineColor: "#5C6B58",
    bgColor: "#F7F8F4",
    accentColor: "#D4A845",
  },
];

export const STARTER_PRESETS: LogoPreset[] = [
  {
    id: "tech-saas",
    name: "SaaS & Cloud",
    layout: "icon-left",
    font: "'Outfit', sans-serif",
    symbolId: "terminal-code",
    palette: LOGO_PALETTES[1], // Trust & Technology
    shape: "transparent",
    letterSpacing: -0.02,
    iconScale: 1,
    iconSize: 58,
    iconTextGap: 24,
    monogramStyle: "hexagon",
  },
  {
    id: "luxury-crest",
    name: "Heritage & Luxury",
    layout: "monogram",
    font: "'Cinzel', serif",
    symbolId: "crown-crest",
    palette: LOGO_PALETTES[3], // Premium & Luxury
    shape: "badge",
    letterSpacing: 0.12,
    iconScale: 1.1,
    iconSize: 64,
    iconTextGap: 28,
    monogramStyle: "shield",
  },
  {
    id: "minimal-clean",
    name: "Minimalist Wordmark",
    layout: "wordmark-only",
    font: "'Inter', sans-serif",
    symbolId: "sparkle-star",
    palette: LOGO_PALETTES[5], // Minimal & Editorial
    shape: "transparent",
    letterSpacing: -0.01,
    iconScale: 0.9,
    iconSize: 48,
    iconTextGap: 20,
    monogramStyle: "minimal",
  },
  {
    id: "growth-agency",
    name: "Scale & Agency",
    layout: "icon-top",
    font: "'Space Grotesk', sans-serif",
    symbolId: "growth-ascent",
    palette: LOGO_PALETTES[0], // Bold & Energetic
    shape: "rounded",
    letterSpacing: -0.03,
    iconScale: 1.15,
    iconSize: 68,
    iconTextGap: 26,
    monogramStyle: "circle",
  },
  {
    id: "cyber-core",
    name: "Cyber & AI",
    layout: "icon-left",
    font: "'Syne', sans-serif",
    symbolId: "ai-brain-mesh",
    palette: LOGO_PALETTES[6], // Cyber & AI
    shape: "rounded",
    letterSpacing: -0.02,
    iconScale: 1.05,
    iconSize: 60,
    iconTextGap: 24,
    monogramStyle: "hexagon",
  },
  {
    id: "eco-studio",
    name: "Eco & Wellness",
    layout: "icon-top",
    font: "'Playfair Display', serif",
    symbolId: "sprout-leaf",
    palette: LOGO_PALETTES[2], // Eco & Organic
    shape: "circle",
    letterSpacing: 0.02,
    iconScale: 1.05,
    iconSize: 64,
    iconTextGap: 24,
    monogramStyle: "circle",
  },
];

/**
 * Calculates WCAG 2.1 relative luminance and contrast ratio between two hex colors.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const getLum = (hex: string) => {
    let clean = (hex || "#FFFFFF").replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (clean.length !== 6) return 0.5;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  try {
    const l1 = getLum(hex1);
    const l2 = getLum(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  } catch {
    return 4.5;
  }
}

/**
 * Honest analysis of small-size (16px - 32px) icon visibility.
 */
export function assessSmallSizeVisibility(
  layout: LogoLayout,
  textLength: number,
  contrastRatio: number
): {
  score: number;
  status: "Crisp & Clear" | "Good Readability" | "Moderate Definition" | "Caution - Low Contrast";
  colorClass: string;
  recommendation: string;
} {
  let score = 90;

  if (contrastRatio < 3.0) score -= 35;
  else if (contrastRatio < 4.5) score -= 15;

  if (layout === "wordmark-only" && textLength > 6) {
    score -= 25;
  } else if (layout === "icon-left" && textLength > 8) {
    score -= 15;
  } else if (layout === "monogram") {
    score += 8;
  } else if (layout === "icon-only") {
    score += 10;
  }

  score = Math.max(15, Math.min(100, score));

  if (score >= 85) {
    return {
      score,
      status: "Crisp & Clear",
      colorClass: "text-status-success",
      recommendation: "High contrast and compact shape retain sharpness in 16px browser tabs and mobile bookmark lists.",
    };
  }
  if (score >= 70) {
    return {
      score,
      status: "Good Readability",
      colorClass: "text-brand-primary",
      recommendation: "Visible in website navigation headers and 32px taskbar icons. The standalone icon mark is recommended for 16px favicons.",
    };
  }
  if (score >= 50) {
    return {
      score,
      status: "Moderate Definition",
      colorClass: "text-amber-500",
      recommendation: "Fine lines or longer text may compress at 16×16. Consider switching to the Monogram or Icon-Only layout for smaller app icons.",
    };
  }
  return {
    score,
    status: "Caution - Low Contrast",
    colorClass: "text-status-error",
    recommendation: "Small-size legibility is limited. Increase color contrast and prioritize a 1-2 letter monogram or bold vector symbol for sub-32px displays.",
  };
}
