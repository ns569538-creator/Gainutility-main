/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorPair {
  name: string;
  group: string;
  fg: string;
  bg: string;
}

export const COLOR_PALETTES: ColorPair[] = [
  // Trustworthy
  { name: "Deep Navy & White", group: "Trustworthy", fg: "#FFFFFF", bg: "#0A2540" },
  { name: "Cobalt & Cream", group: "Trustworthy", fg: "#0047AB", bg: "#F4F7F2" },
  { name: "Steel & Light Neutral", group: "Trustworthy", fg: "#1E3A8A", bg: "#F1F5F9" },

  // Energetic
  { name: "Brand Amber & Dark", group: "Energetic", fg: "#D97A3F", bg: "#131913" },
  { name: "Vibrant Orange & White", group: "Energetic", fg: "#FFFFFF", bg: "#EA580C" },
  { name: "Crimson & White", group: "Energetic", fg: "#FFFFFF", bg: "#DC2626" },

  // Natural
  { name: "Forest Green & Warm White", group: "Natural", fg: "#FFFFFF", bg: "#1E392A" },
  { name: "Olive & Cream", group: "Natural", fg: "#3F4E38", bg: "#F7F8F4" },
  { name: "Emerald & Dark Forest", group: "Natural", fg: "#10B981", bg: "#0D110D" },

  // Premium
  { name: "Charcoal & Warm Gold", group: "Premium", fg: "#D4AF37", bg: "#18181B" },
  { name: "Midnight & Muted Bronze", group: "Premium", fg: "#E2C391", bg: "#0F172A" },
  { name: "Obsidian & Platinum", group: "Premium", fg: "#F8FAFC", bg: "#09090B" },

  // Creative
  { name: "Purple & Soft White", group: "Creative", fg: "#FFFFFF", bg: "#6D28D9" },
  { name: "Indigo & Lavender", group: "Creative", fg: "#4338CA", bg: "#EEF2FF" },
  { name: "Fuchsia & Dark Navy", group: "Creative", fg: "#E11D48", bg: "#0B0F19" },

  // Modern
  { name: "Monochrome Black on White", group: "Modern", fg: "#111827", bg: "#FFFFFF" },
  { name: "Monochrome White on Black", group: "Modern", fg: "#FFFFFF", bg: "#111827" },
  { name: "Dark Emerald & Light Gray", group: "Modern", fg: "#064E3B", bg: "#F3F4F6" },

  // Friendly
  { name: "Teal & Warm White", group: "Friendly", fg: "#FFFFFF", bg: "#0D9488" },
  { name: "Sky Blue & Soft Amber", group: "Friendly", fg: "#0284C7", bg: "#FEF3C7" },
  { name: "Mint & Dark Charcoal", group: "Friendly", fg: "#34D399", bg: "#1F2937" },
];

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  fallback: string;
  category: "sans" | "serif" | "mono" | "display";
}

export const CURATED_FONTS: FontOption[] = [
  { id: "inter", name: "Modern Sans (Inter)", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fallback: "sans-serif", category: "sans" },
  { id: "system", name: "System UI", fontFamily: "system-ui, -apple-system, sans-serif", fallback: "sans-serif", category: "sans" },
  { id: "mono", name: "Code Monospace", fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace", fallback: "monospace", category: "mono" },
  { id: "georgia", name: "Editorial Serif (Georgia)", fontFamily: "Georgia, Cambria, 'Times New Roman', serif", fallback: "serif", category: "serif" },
  { id: "impact", name: "Bold Impact", fontFamily: "Impact, 'Arial Black', sans-serif", fallback: "sans-serif", category: "display" },
  { id: "trebuchet", name: "Friendly (Trebuchet)", fontFamily: "'Trebuchet MS', 'Lucida Grande', sans-serif", fallback: "sans-serif", category: "sans" },
  { id: "playfair", name: "Classic Display", fontFamily: "'Playfair Display', Georgia, serif", fallback: "serif", category: "serif" },
];

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  fontWeight: number;
  shape: "square" | "rounded" | "circle";
  cornerRadiusPercent: number;
  fgColor: string;
  bgColor: string;
  isTransparent: boolean;
  padding: number;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "clean",
    name: "Clean",
    description: "Rounded square with high-contrast neutral look",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 700,
    shape: "rounded",
    cornerRadiusPercent: 22,
    fgColor: "#FFFFFF",
    bgColor: "#0F172A",
    isTransparent: false,
    padding: 18,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Uncontained graphic mark with transparent background",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    shape: "square",
    cornerRadiusPercent: 0,
    fgColor: "#111827",
    bgColor: "#FFFFFF",
    isTransparent: true,
    padding: 10,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Heavy weight, solid vibrant background for maximum visibility",
    fontFamily: "Impact, 'Arial Black', sans-serif",
    fontWeight: 900,
    shape: "rounded",
    cornerRadiusPercent: 18,
    fgColor: "#FFFFFF",
    bgColor: "#D97A3F",
    isTransparent: false,
    padding: 12,
  },
  {
    id: "playful",
    name: "Playful",
    description: "Circular friendly format with energetic colors",
    fontFamily: "'Trebuchet MS', 'Lucida Grande', sans-serif",
    fontWeight: 800,
    shape: "circle",
    cornerRadiusPercent: 50,
    fgColor: "#FFFFFF",
    bgColor: "#0D9488",
    isTransparent: false,
    padding: 18,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Classic navy and white with geometric rounded corner",
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
    fontWeight: 700,
    shape: "rounded",
    cornerRadiusPercent: 24,
    fgColor: "#FFFFFF",
    bgColor: "#0A2540",
    isTransparent: false,
    padding: 16,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Monospace coding aesthetic with emerald on dark",
    fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace",
    fontWeight: 700,
    shape: "rounded",
    cornerRadiusPercent: 16,
    fgColor: "#10B981",
    bgColor: "#0D110D",
    isTransparent: false,
    padding: 16,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Warm gold glyph on obsidian charcoal surface",
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
    fontWeight: 700,
    shape: "rounded",
    cornerRadiusPercent: 22,
    fgColor: "#D4AF37",
    bgColor: "#18181B",
    isTransparent: false,
    padding: 16,
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Pure black and white with high legibility",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 800,
    shape: "square",
    cornerRadiusPercent: 0,
    fgColor: "#FFFFFF",
    bgColor: "#000000",
    isTransparent: false,
    padding: 14,
  },
];

export interface StarterExample {
  id: string;
  name: string;
  type: "text" | "symbol" | "emoji";
  value: string;
  fg: string;
  bg: string;
  shape: "square" | "rounded" | "circle";
  fontFamily?: string;
  fontWeight?: number;
}

export const STARTER_EXAMPLES: StarterExample[] = [
  { id: "ex-initials-gu", name: "GU Initial", type: "text", value: "GU", fg: "#FAF8F1", bg: "#D97A3F", shape: "rounded" },
  { id: "ex-initials-a", name: "Letter A", type: "text", value: "A", fg: "#FFFFFF", bg: "#0A2540", shape: "rounded" },
  { id: "ex-symbol-star", name: "Golden Star", type: "symbol", value: "star", fg: "#D4AF37", bg: "#18181B", shape: "circle" },
  { id: "ex-symbol-zap", name: "Lightning", type: "symbol", value: "zap", fg: "#F59E0B", bg: "#0F172A", shape: "rounded" },
  { id: "ex-symbol-code", name: "Developer Code", type: "symbol", value: "code", fg: "#10B981", bg: "#0D110D", shape: "rounded" },
  { id: "ex-symbol-shield", name: "Security Shield", type: "symbol", value: "shield", fg: "#FFFFFF", bg: "#1E3A8A", shape: "rounded" },
  { id: "ex-emoji-rocket", name: "Rocket Emoji", type: "emoji", value: "🚀", fg: "#FFFFFF", bg: "#1E1E2E", shape: "rounded" },
  { id: "ex-emoji-spark", name: "Sparkle Emoji", type: "emoji", value: "✨", fg: "#FFFFFF", bg: "#064E3B", shape: "circle" },
];

/**
 * Calculates WCAG 2.1 relative luminance and contrast ratio between two HEX colors.
 */
export function calculateContrast(hex1: string, hex2: string): number {
  const getRGB = (hex: string) => {
    let clean = hex.replace("#", "").trim();
    if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const getLuminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const l1 = getLuminance(getRGB(hex1));
    const l2 = getLuminance(getRGB(hex2));
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21; // fallback max
  }
}
