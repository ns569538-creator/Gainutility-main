/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — static color data.
 * DOM-free so the SEO / prerender pipeline can enumerate colors & palettes.
 */

import { hexToRgb, paletteFromSlug, paletteName } from "./color";

/* ------------------------------------------------------------------ */
/* Named colors                                                        */
/* ------------------------------------------------------------------ */

export type ColorFamily =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "pink"
  | "brown"
  | "gray"
  | "black"
  | "white";

export interface NamedColor {
  name: string;
  hex: string;
  family: ColorFamily;
}

const familyOf = (family: ColorFamily) => family;

/** Curated, authoritative named colors (subset of CSS Color Module 4). */
export const NAMED_COLORS: NamedColor[] = [
  // Red family
  { name: "Crimson", hex: "#DC143C", family: familyOf("red") },
  { name: "Firebrick", hex: "#B22222", family: familyOf("red") },
  { name: "Indian Red", hex: "#CD5C5C", family: familyOf("red") },
  { name: "Light Coral", hex: "#F08080", family: familyOf("red") },
  { name: "Red", hex: "#FF0000", family: familyOf("red") },
  { name: "Rosy Brown", hex: "#BC8F8F", family: familyOf("red") },
  { name: "Salmon", hex: "#FA8072", family: familyOf("red") },
  { name: "Tomato", hex: "#FF6347", family: familyOf("red") },
  { name: "Dark Red", hex: "#8B0000", family: familyOf("red") },

  // Orange family
  { name: "Coral", hex: "#FF7F50", family: familyOf("orange") },
  { name: "Dark Orange", hex: "#FF8C00", family: familyOf("orange") },
  { name: "Dark Salmon", hex: "#E9967A", family: familyOf("orange") },
  { name: "Light Salmon", hex: "#FFA07A", family: familyOf("orange") },
  { name: "Orange", hex: "#FFA500", family: familyOf("orange") },
  { name: "Orange Red", hex: "#FF4500", family: familyOf("orange") },
  { name: "Sandy Brown", hex: "#F4A460", family: familyOf("orange") },

  // Yellow / amber family
  { name: "Amber", hex: "#FFBF00", family: familyOf("yellow") },
  { name: "Dark Khaki", hex: "#BDB76B", family: familyOf("yellow") },
  { name: "Gold", hex: "#FFD700", family: familyOf("yellow") },
  { name: "Goldenrod", hex: "#DAA520", family: familyOf("yellow") },
  { name: "Khaki", hex: "#F0E68C", family: familyOf("yellow") },
  { name: "Lemon Chiffon", hex: "#FFFACD", family: familyOf("yellow") },
  { name: "Light Goldenrod Yellow", hex: "#FAFAD2", family: familyOf("yellow") },
  { name: "Moccasin", hex: "#FFE4B5", family: familyOf("yellow") },
  { name: "Pale Goldenrod", hex: "#EEE8AA", family: familyOf("yellow") },
  { name: "Peach Puff", hex: "#FFDAB9", family: familyOf("yellow") },
  { name: "Yellow", hex: "#FFFF00", family: familyOf("yellow") },

  // Green family
  { name: "Dark Green", hex: "#006400", family: familyOf("green") },
  { name: "Dark Olive Green", hex: "#556B2F", family: familyOf("green") },
  { name: "Dark Sea Green", hex: "#8FBC8F", family: familyOf("green") },
  { name: "Forest Green", hex: "#228B22", family: familyOf("green") },
  { name: "Green", hex: "#008000", family: familyOf("green") },
  { name: "Green Yellow", hex: "#ADFF2F", family: familyOf("green") },
  { name: "Lawn Green", hex: "#7CFC00", family: familyOf("green") },
  { name: "Light Green", hex: "#90EE90", family: familyOf("green") },
  { name: "Lime", hex: "#00FF00", family: familyOf("green") },
  { name: "Lime Green", hex: "#32CD32", family: familyOf("green") },
  { name: "Medium Sea Green", hex: "#3CB371", family: familyOf("green") },
  { name: "Medium Spring Green", hex: "#00FA9A", family: familyOf("green") },
  { name: "Olive", hex: "#808000", family: familyOf("green") },
  { name: "Olive Drab", hex: "#6B8E23", family: familyOf("green") },
  { name: "Sea Green", hex: "#2E8B57", family: familyOf("green") },
  { name: "Spring Green", hex: "#00FF7F", family: familyOf("green") },
  { name: "Yellow Green", hex: "#9ACD32", family: familyOf("green") },

  // Cyan / teal family
  { name: "Aqua", hex: "#00FFFF", family: familyOf("cyan") },
  { name: "Aquamarine", hex: "#7FFFD4", family: familyOf("cyan") },
  { name: "Cadet Blue", hex: "#5F9EA0", family: familyOf("cyan") },
  { name: "Dark Cyan", hex: "#008B8B", family: familyOf("cyan") },
  { name: "Dark Turquoise", hex: "#00CED1", family: familyOf("cyan") },
  { name: "Light Cyan", hex: "#E0FFFF", family: familyOf("cyan") },
  { name: "Light Sea Green", hex: "#20B2AA", family: familyOf("cyan") },
  { name: "Medium Aquamarine", hex: "#66CDAA", family: familyOf("cyan") },
  { name: "Medium Turquoise", hex: "#48D1CC", family: familyOf("cyan") },
  { name: "Teal", hex: "#008080", family: familyOf("cyan") },
  { name: "Turquoise", hex: "#40E0D0", family: familyOf("cyan") },

  // Blue family
  { name: "Alice Blue", hex: "#F0F8FF", family: familyOf("blue") },
  { name: "Blue", hex: "#0000FF", family: familyOf("blue") },
  { name: "Blue Steel", hex: "#4682B4", family: familyOf("blue") },
  { name: "Cornflower Blue", hex: "#6495ED", family: familyOf("blue") },
  { name: "Dark Blue", hex: "#00008B", family: familyOf("blue") },
  { name: "Dark Slate Blue", hex: "#483D8B", family: familyOf("blue") },
  { name: "Deep Sky Blue", hex: "#00BFFF", family: familyOf("blue") },
  { name: "Dodger Blue", hex: "#1E90FF", family: familyOf("blue") },
  { name: "Light Blue", hex: "#ADD8E6", family: familyOf("blue") },
  { name: "Light Sky Blue", hex: "#87CEFA", family: familyOf("blue") },
  { name: "Midnight Blue", hex: "#191970", family: familyOf("blue") },
  { name: "Navy", hex: "#000080", family: familyOf("blue") },
  { name: "Powder Blue", hex: "#B0E0E6", family: familyOf("blue") },
  { name: "Royal Blue", hex: "#4169E1", family: familyOf("blue") },
  { name: "Sky Blue", hex: "#87CEEB", family: familyOf("blue") },
  { name: "Slate Blue", hex: "#6A5ACD", family: familyOf("blue") },
  { name: "Steel Blue", hex: "#4682B4", family: familyOf("blue") },

  // Purple / violet family
  { name: "Blue Violet", hex: "#8A2BE2", family: familyOf("purple") },
  { name: "Dark Magenta", hex: "#8B008B", family: familyOf("purple") },
  { name: "Dark Orchid", hex: "#9932CC", family: familyOf("purple") },
  { name: "Dark Violet", hex: "#9400D3", family: familyOf("purple") },
  { name: "Fuchsia", hex: "#FF00FF", family: familyOf("purple") },
  { name: "Indigo", hex: "#4B0082", family: familyOf("purple") },
  { name: "Magenta", hex: "#FF00FF", family: familyOf("purple") },
  { name: "Medium Orchid", hex: "#BA55D3", family: familyOf("purple") },
  { name: "Medium Purple", hex: "#9370DB", family: familyOf("purple") },
  { name: "Medium Slate Blue", hex: "#7B68EE", family: familyOf("purple") },
  { name: "Medium Violet Red", hex: "#C71585", family: familyOf("purple") },
  { name: "Orchid", hex: "#DA70D6", family: familyOf("purple") },
  { name: "Plum", hex: "#DDA0DD", family: familyOf("purple") },
  { name: "Purple", hex: "#800080", family: familyOf("purple") },
  { name: "Rebecca Purple", hex: "#663399", family: familyOf("purple") },
  { name: "Thistle", hex: "#D8BFD8", family: familyOf("purple") },
  { name: "Violet", hex: "#EE82EE", family: familyOf("purple") },
  { name: "Violet Blue", hex: "#324AB2", family: familyOf("purple") },

  // Pink family
  { name: "Deep Pink", hex: "#FF1493", family: familyOf("pink") },
  { name: "Hot Pink", hex: "#FF69B4", family: familyOf("pink") },
  { name: "Light Pink", hex: "#FFB6C1", family: familyOf("pink") },
  { name: "Pale Violet Red", hex: "#DB7093", family: familyOf("pink") },
  { name: "Pink", hex: "#FFC0CB", family: familyOf("pink") },

  // Brown family
  { name: "Bisque", hex: "#FFE4C4", family: familyOf("brown") },
  { name: "Brown", hex: "#A52A2A", family: familyOf("brown") },
  { name: "Burlywood", hex: "#DEB887", family: familyOf("brown") },
  { name: "Chocolate", hex: "#D2691E", family: familyOf("brown") },
  { name: "Saddle Brown", hex: "#8B4513", family: familyOf("brown") },
  { name: "Sienna", hex: "#A0522D", family: familyOf("brown") },
  { name: "Tan", hex: "#D2B48C", family: familyOf("brown") },
  { name: "Wheat", hex: "#F5DEB3", family: familyOf("brown") },

  // Gray family
  { name: "Dark Gray", hex: "#A9A9A9", family: familyOf("gray") },
  { name: "Dark Slate Gray", hex: "#2F4F4F", family: familyOf("gray") },
  { name: "Dim Gray", hex: "#696969", family: familyOf("gray") },
  { name: "Gainsboro", hex: "#DCDCDC", family: familyOf("gray") },
  { name: "Gray", hex: "#808080", family: familyOf("gray") },
  { name: "Light Gray", hex: "#D3D3D3", family: familyOf("gray") },
  { name: "Light Slate Gray", hex: "#778899", family: familyOf("gray") },
  { name: "Silver", hex: "#C0C0C0", family: familyOf("gray") },
  { name: "Slate Gray", hex: "#708090", family: familyOf("gray") },

  // Black / white family
  { name: "Black", hex: "#000000", family: familyOf("black") },
  { name: "White", hex: "#FFFFFF", family: familyOf("white") },
  { name: "White Smoke", hex: "#F5F5F5", family: familyOf("white") },
  { name: "Floral White", hex: "#FFFAF0", family: familyOf("white") },
  { name: "Ivory", hex: "#FFFFF0", family: familyOf("white") },
  { name: "Old Lace", hex: "#FDF5E6", family: familyOf("white") },
  { name: "Snow", hex: "#FFFAFA", family: familyOf("white") },
];

export const COLOR_FAMILIES: ColorFamily[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
];

const FAMILY_LABEL: Record<ColorFamily, string> = {
  red: "Reds",
  orange: "Oranges",
  yellow: "Yellows",
  green: "Greens",
  cyan: "Cyans & Teals",
  blue: "Blues",
  purple: "Purples & Violets",
  pink: "Pinks",
  brown: "Browns",
  gray: "Grays",
  black: "Blacks",
  white: "Whites",
};

export const familyLabel = (f: ColorFamily): string => FAMILY_LABEL[f];

/** Hero colors that get standalone, crawlable /colors/<slug> pages. */
export interface HeroColor {
  slug: string;
  name: string;
  hex: string;
  family: ColorFamily;
  blurb: string;
}

export const HERO_COLORS: HeroColor[] = [
  { slug: "red", name: "Red", hex: "#EF4444", family: "red", blurb: "Energy, urgency, and strong focal points." },
  { slug: "orange", name: "Orange", hex: "#F97316", family: "orange", blurb: "Playful warmth for calls to action." },
  { slug: "amber", name: "Amber", hex: "#F59E0B", family: "yellow", blurb: "Optimistic highlights and warnings." },
  { slug: "yellow", name: "Yellow", hex: "#EAB308", family: "yellow", blurb: "Bright attention and cheerful accents." },
  { slug: "green", name: "Green", hex: "#22C55E", family: "green", blurb: "Success states and natural calm." },
  { slug: "teal", name: "Teal", hex: "#14B8A6", family: "cyan", blurb: "Modern balance between blue and green." },
  { slug: "cyan", name: "Cyan", hex: "#06B6D4", family: "cyan", blurb: "Fresh, technical energy." },
  { slug: "blue", name: "Blue", hex: "#3B82F6", family: "blue", blurb: "Trust, depth, and reliable interfaces." },
  { slug: "indigo", name: "Indigo", hex: "#6366F1", family: "purple", blurb: "Energetic, distinct brand statements." },
  { slug: "violet", name: "Violet", hex: "#8B5CF6", family: "purple", blurb: "Creative, premium, expressive." },
  { slug: "purple", name: "Purple", hex: "#A855F7", family: "purple", blurb: "Imaginative and bold emphasis." },
  { slug: "pink", name: "Pink", hex: "#EC4899", family: "pink", blurb: "Approachable warmth with energy." },
  { slug: "brown", name: "Brown", hex: "#92400E", family: "brown", blurb: "Grounded, organic neutral." },
  { slug: "slate", name: "Slate", hex: "#64748B", family: "gray", blurb: "Quiet, functional neutral." },
  { slug: "gray", name: "Gray", hex: "#6B7280", family: "gray", blurb: "Muted neutrals for hierarchy." },
  { slug: "navy", name: "Navy", hex: "#1E3A8A", family: "blue", blurb: "Professional corporate depth." },
];

/** Resolve a /colors/<slug or name> token to a concrete hex. */
export const colorSlug = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const resolveColorToken = (token: string): { hex: string; name: string; slug: string; family: ColorFamily } | null => {
  const hero = HERO_COLORS.find((h) => h.slug === token || h.name.toLowerCase() === token);
  if (hero) return { hex: hero.hex, name: hero.name, slug: hero.slug, family: hero.family };
  const named = NAMED_COLORS.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, "-") === token || c.name.toLowerCase() === token
  );
  if (named) {
    return {
      hex: named.hex,
      name: named.name,
      slug: colorSlug(named.name),
      family: named.family,
    };
  }
  return null;
};

/** Nearest NAMED_COLORS entry for any hex (labeling generator columns). */
export const nearestNamedColor = (hex: string): NamedColor | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best: NamedColor | null = null;
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const cRgb = hexToRgb(c.hex);
    if (!cRgb) continue;
    const d =
      Math.pow(rgb.r - cRgb.r, 2) +
      Math.pow(rgb.g - cRgb.g, 2) +
      Math.pow(rgb.b - cRgb.b, 2);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
};

/* ------------------------------------------------------------------ */
/* Curated palettes (Explore + /color-palettes/<slug>)                 */
/* ------------------------------------------------------------------ */

export type PaletteStyle = "minimal" | "vibrant" | "muted" | "pastel" | "dark" | "neon";

export interface CuratedPalette {
  slug: string;
  name: string;
  colors: string[];
  style: PaletteStyle;
  use: string;
  desc: string;
}

export const CURATED_PALETTES: CuratedPalette[] = [
  {
    slug: "ocean-depths",
    name: "Ocean Depths",
    colors: ["#064E3B", "#0D9488", "#2DD4BF", "#A7F3D0", "#ECFDF5"],
    style: "muted",
    use: "Finance dashboards, calm brand systems",
    desc: "Deep teal greens shifting toward soft foam — a grounding palette for brands that need quiet confidence.",
  },
  {
    slug: "sunset-coast",
    name: "Sunset Coast",
    colors: ["#9D174D", "#F43F5E", "#FB923C", "#FDE68A", "#FFFBEB"],
    style: "vibrant",
    use: "Travel, food, lifestyle marketing",
    desc: "Pink-to-amber warmth with a cream base, ideal for emotional, editorial visuals.",
  },
  {
    slug: "midnight-minimal",
    name: "Midnight Minimal",
    colors: ["#0F172A", "#1E293B", "#334155", "#CBD5E1", "#F8FAFC"],
    style: "dark",
    use: "B2B SaaS, developer tools, code themes",
    desc: "Slate-based monochrome with crisp light-on-dark hierarchy — a UI workhorse.",
  },
  {
    slug: "forest-floor",
    name: "Forest Floor",
    colors: ["#14532D", "#166534", "#4D7C0F", "#84CC16", "#F7FEE7"],
    style: "muted",
    use: "Outdoor brands, wellness, agriculture",
    desc: "Deep greens rising into fresh lime, grounded in earthy optimism.",
  },
  {
    slug: "pastel-dreams",
    name: "Pastel Dreams",
    colors: ["#FBCFE8", "#C7D2FE", "#BAE6FD", "#D1FAE5", "#FEF3C7"],
    style: "pastel",
    use: "Kids, beauty, playful products",
    desc: "Soft candy hues that stay friendly without screaming for attention.",
  },
  {
    slug: "neon-night",
    name: "Neon Night",
    colors: ["#000000", "#F0ABFC", "#67E8F9", "#FDE047", "#22D3EE"],
    style: "neon",
    use: "Gaming, streaming, nightlife",
    desc: "Electric accents on true black — high-impact contrast for digital-first brands.",
  },
  {
    slug: "royal-duo",
    name: "Royal Duo",
    colors: ["#312E81", "#4338CA", "#818CF8", "#C7D2FE", "#EEF2FF"],
    style: "minimal",
    use: "Enterprise software, legal, fintech",
    desc: "Indigo restraint with generous neutral space — professional and trustworthy.",
  },
  {
    slug: "beach-umbrella",
    name: "Beach Umbrella",
    colors: ["#0EA5E9", "#F97316", "#FACC15", "#F43F5E", "#ECFDF5"],
    style: "vibrant",
    use: "Summer campaigns, consumer apps",
    desc: "Primary-coded fun with a cool cream finish for balance.",
  },
  {
    slug: "terra-video-donations",
    name: "Terra",
    colors: ["#7C2D12", "#C2410C", "#F59E0B", "#FDE68A", "#FFF7ED"],
    style: "muted",
    use: "Artisan, coffee, handmade goods",
    desc: "Earthy oranges and ambers warmed by cream — honest and tactile.",
  },
  {
    slug: "electric-ice",
    name: "Electric Ice",
    colors: ["#164E63", "#0891B2", "#06B6D4", "#A5F3FC", "#ECFEFF"],
    style: "vibrant",
    use: "Tech, telehealth, energy apps",
    desc: "Cyan clarity from deep lagoon to pale ice — crisp and contemporary.",
  },
  {
    slug: "rosewater",
    name: "Rosewater",
    colors: ["#881337", "#E11D48", "#FDA4AF", "#FECDD3", "#FFF1F2"],
    style: "minimal",
    use: "E-commerce, fashion, cosmetics",
    desc: "Rose-toned refinement with a blush base for premium retail vibes.",
  },
  {
    slug: "ink-and-paper",
    name: "Ink & Paper",
    colors: ["#111827", "#4B5563", "#9CA3AF", "#E5E7EB", "#FFFFFF"],
    style: "minimal",
    use: "Editorial, docs, portfolios",
    desc: "The classic print palette translated to screens — timeless and legible.",
  },
  {
    slug: "aurora",
    name: "Aurora",
    colors: ["#022C22", "#0F766E", "#2DD4BF", "#86EFAC", "#DCFCE7"],
    style: "muted",
    use: "Sustainability, nature-tech, travel",
    desc: "Northern-light greens on deep forest — soothing with a hint of wonder.",
  },
  {
    slug: "citrus-punch",
    name: "Citrus Punch",
    colors: ["#1A2E05", "#3F6212", "#84CC16", "#D9F99D", "#F7FEE7"],
    style: "vibrant",
    use: "Fitness, juice, energy brands",
    desc: "Sharp lime zing anchored by deep olive — energetic yet grounded.",
  },
  {
    slug: "lavender-fields",
    name: "Lavender Fields",
    colors: ["#4C1D95", "#7C3AED", "#C4B5FD", "#EDE9FE", "#FFFFFF"],
    style: "pastel",
    use: "Spirituality, culture, wellness apps",
    desc: "Violet calm with soft lilac breathing room — gentle and premium.",
  },
  {
    slug: "concrete-canyon",
    name: "Concrete Canyon",
    colors: ["#1C1917", "#44403C", "#78716C", "#D6D3D1", "#FAFAF9"],
    style: "dark",
    use: "Architecture, industrial, portfolios",
    desc: "Warm gray tones for a sturdier, more human take on monochrome.",
  },
];

/** Resolve a /color-palettes/<slug> token (named curated slug or encoded hex-chain). */
export const resolvePaletteToken = (
  token: string
): {
  slug: string;
  name: string;
  colors: string[];
  desc: string;
  use?: string;
  style?: PaletteStyle;
  curated: boolean;
} | null => {
  const curated = CURATED_PALETTES.find(
    (p) => p.slug === token || p.name.toLowerCase().replace(/\s+/g, "-") === token
  );
  if (curated) {
    return {
      slug: curated.slug,
      name: curated.name,
      colors: curated.colors,
      desc: curated.desc,
      use: curated.use,
      style: curated.style,
      curated: true,
    };
  }
  const colors = paletteFromSlug(token);
  if (colors && colors.length >= 1) {
    return {
      slug: token,
      name: `${paletteName(colors)} — instant palette`,
      colors,
      desc: "An instant palette encoded directly in the URL. Any hexes you share this way stay stable and crawlable.",
      use: "Instant generated palette",
      curated: false,
    };
  }
  return null;
};

/* ------------------------------------------------------------------ */
/* UI color systems (reference palettes — not official brand assets)  */
/* ------------------------------------------------------------------ */

export type UIColorRoleId =
  | "primary"
  | "accent"
  | "accent2"
  | "accent3"
  | "accent4"
  | "background"
  | "surface"
  | "text"
  | "muted"
  | "link"
  | "success"
  | "cta"
  | "border"
  | "danger";

export interface UIColorRole {
  role: UIColorRoleId;
  color: string;
  note: string;
}

export interface UIColorSystem {
  id: string;
  name: string;
  type: string;
  desc: string;
  usage: string;
  colors: UIColorRole[];
}

const r = (role: UIColorRoleId, color: string, note: string): UIColorRole => ({ role, color, note });

/** Reference color systems — approximate UI colors gathered from public screenshots and docs. */
export const UI_COLOR_SYSTEMS: UIColorSystem[] = [
  {
    id: "spotify",
    name: "Spotify",
    type: "Music streaming",
    desc: "Dark-first green interface with strong single-hue identity.",
    usage: "Dark-mode audio, media, creator products.",
    colors: [
      r("primary", "#1DB954", "Signature green for CTAs and active states"),
      r("background", "#191414", "Near-black canvas"),
      r("surface", "#282828", "Cards, rows, hover fills"),
      r("text", "#FFFFFF", "Primary copy"),
      r("muted", "#B3B3B3", "Secondary copy and icons"),
      r("success", "#1ED760", "Playback and positive feedback"),
      r("link", "#1DB954", "Links inherit the accent green"),
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "Social network",
    desc: "A gradient-forward system with violet, magenta and orange at its heart.",
    usage: "Social, creator and lifestyle interfaces.",
    colors: [
      r("primary", "#E4405F", "Hot-pink anchor"),
      r("accent", "#833AB4", "Deep violet for depth and gradients"),
      r("cta", "#F77737", "Sunset orange for gradient blends"),
      r("background", "#FFFFFF", "Bright feed surface"),
      r("surface", "#FAFAFA", "Secondary panels"),
      r("text", "#262626", "Primary copy"),
      r("muted", "#8E8E8E", "Secondary copy"),
      r("link", "#00376B", "Profile links and hashtag emphasis"),
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    type: "Streaming video",
    desc: "Signature deep red against charcoal, built for cinematic contrast.",
    usage: "Entertainment, video, premium subscription apps.",
    colors: [
      r("primary", "#E50914", "Signature red for CTAs and branding"),
      r("background", "#141414", "Cinematic charcoal canvas"),
      r("surface", "#2F2F2F", "Cards and secondary panels"),
      r("text", "#FFFFFF", "Primary copy on dark"),
      r("muted", "#B8B8B8", "Secondary copy"),
      r("accent", "#F5F5F1", "Restricted white accent"),
    ],
  },
  {
    id: "slack",
    name: "Slack",
    type: "Team collaboration",
    desc: "Aubergine-anchored retro palette with distinct accents per workspace.",
    usage: "B2B SaaS, productivity and team tools.",
    colors: [
      r("primary", "#611F69", "Aubergine brand anchor"),
      r("cta", "#36C5F0", "Sky blue for calls to action"),
      r("accent", "#2EB67D", "Green for positive states"),
      r("accent2", "#ECB22E", "Yellow for warnings"),
      r("accent3", "#E01E5A", "Red for alerts"),
      r("background", "#FFFFFF", "Light canvas"),
      r("surface", "#F8F8F8", "Chat and sidebar panels"),
      r("text", "#1D1C1D", "Primary copy"),
      r("muted", "#616061", "Secondary copy"),
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "Payments",
    desc: "Vivid purple over warm neutrals with a bright blue reserved for CTAs.",
    usage: "Fintech, developer platforms, commerce dashboards.",
    colors: [
      r("cta", "#635BFF", "Signature ultraviolet button"),
      r("primary", "#635BFF", "Brand anchor"),
      r("background", "#FFFFFF", "Light canvas"),
      r("surface", "#F6F8FA", "Panels and code blocks"),
      r("text", "#0A2540", "Deep ink copy"),
      r("muted", "#425466", "Secondary copy"),
      r("success", "#00D924", "Positive states"),
    ],
  },
  {
    id: "figma",
    name: "Figma",
    type: "Design tools",
    desc: "Neutral gray canvas punctuated by a playful four-color accent set.",
    usage: "Design tooling, creative SaaS, plugin markets.",
    colors: [
      r("background", "#1E1E1E", "Dark canvas"),
      r("surface", "#2C2C2C", "Panels and inspectors"),
      r("text", "#FFFFFF", "Primary copy"),
      r("accent", "#0ACF83", "Player-green primary"),
      r("accent2", "#F24E1E", "Fig-orange"),
      r("accent3", "#A259FF", "Violet"),
      r("accent4", "#1ABCFE", "Cyan"),
    ],
  },
  {
    id: "notion",
    name: "Notion",
    type: "Workspace / notes",
    desc: "Restrained light neutrals with a cool, dependable black accent set.",
    usage: "Personal productivity, wikis, knowledge bases.",
    colors: [
      r("background", "#FFFFFF", "Paper-white canvas"),
      r("surface", "#F7F7F5", "Sidebar and cards"),
      r("text", "#37352F", "Warm ink copy"),
      r("muted", "#787774", "Secondary copy"),
      r("accent", "#2383E2", "Accent blue for links and toggles"),
      r("success", "#0FBF8B", "Positive states"),
      r("link", "#2383E2", "Links"),
    ],
  },
  {
    id: "github",
    name: "GitHub",
    type: "Developer platform",
    desc: "Near-black canvas with a restrained blue accent and status hues.",
    usage: "Developer tools, code hosting, CI/CD dashboards.",
    colors: [
      r("background", "#0D1117", "GitHub-dark canvas"),
      r("surface", "#161B22", "Panels and cards"),
      r("border", "#30363D", "Border neutrals"),
      r("text", "#E6EDF3", "Primary copy"),
      r("muted", "#8D96A0", "Secondary copy"),
      r("link", "#4493F8", "Link blue"),
      r("success", "#3FB950", "Merge and ready states"),
      r("danger", "#F85149", "Conflict and error states"),
    ],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    type: "Travel / hospitality",
    desc: "Razzmatazz pink leadership over paper-white space.",
    usage: "Travel, marketplaces, hospitality apps.",
    colors: [
      r("primary", "#FF385C", "Razzmatazz pink for CTAs"),
      r("background", "#FFFFFF", "Paper-white canvas"),
      r("surface", "#F7F7F7", "Cards and filters"),
      r("text", "#222222", "Primary copy"),
      r("muted", "#717171", "Secondary copy"),
      r("link", "#222222", "Links in ink"),
      r("success", "#008A05", "Positive states"),
    ],
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    type: "Social network",
    desc: "A white/black binary with egg-blue reserved for interactive elements.",
    usage: "Social, news, public conversation apps.",
    colors: [
      r("primary", "#1D9BF0", "Signature sky blue"),
      r("cta", "#1D9BF0", "Buttons and links"),
      r("background", "#FFFFFF", "Light canvas"),
      r("surface", "#EFF3F4", "Panels, hover fills, pills"),
      r("text", "#0F1419", "Primary copy"),
      r("muted", "#536471", "Secondary copy"),
      r("accent", "#FFD400", "Verified badge amber"),
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    type: "Professional network",
    desc: "Steady LinkedIn blue with generous whitespace and trust neutrals.",
    usage: "Professional networking, B2B, hiring platforms.",
    colors: [
      r("primary", "#0A66C2", "LinkedIn blue for CTAs"),
      r("link", "#0A66C2", "Links"),
      r("background", "#F3F2EF", "Canvas"),
      r("surface", "#FFFFFF", "Cards"),
      r("text", "#191919", "Primary copy"),
      r("muted", "#666666", "Secondary copy"),
      r("success", "#057642", "Positive states"),
      r("danger", "#D11124", "Alert states"),
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    type: "Messaging",
    desc: "Teal-green leadership backed by a calm, chat-centric neutral.",
    usage: "Messaging, community, customer support.",
    colors: [
      r("primary", "#25D366", "Signature teal-green"),
      r("cta", "#075E54", "Deep teal for dark surfaces"),
      r("accent", "#128C7E", "Chat accent teal"),
      r("background", "#ECE5DD", "Warm light canvas"),
      r("muted", "#667781", "Secondary copy"),
      r("text", "#111B21", "Primary copy"),
    ],
  },
];

export const resolveUiColorSystem = (id: string): UIColorSystem | undefined =>
  UI_COLOR_SYSTEMS.find((s) => s.id === id || s.name.toLowerCase() === id);

export const ROLE_LABELS: Record<UIColorRoleId, string> = {
  primary: "Primary",
  accent: "Accent",
  accent2: "Accent 2",
  accent3: "Accent 3",
  accent4: "Accent 4",
  background: "Background",
  surface: "Surface",
  text: "Text",
  muted: "Muted",
  link: "Links",
  success: "Success",
  cta: "Call to action",
  border: "Border",
  danger: "Danger",
};