/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FaviconSymbol {
  id: string;
  name: string;
  category: string;
  // SVG path definition on a 24x24 coordinate grid
  path: string;
}

export const SYMBOL_CATEGORIES = [
  "All",
  "Shapes & Marks",
  "Tech & Code",
  "Commerce & Finance",
  "Media & Creative",
  "Interface & System",
  "Lifestyle & Nature",
] as const;

export type SymbolCategory = (typeof SYMBOL_CATEGORIES)[number];

export const FAVICON_SYMBOLS: FaviconSymbol[] = [
  // Shapes & Marks
  {
    id: "star",
    name: "Star",
    category: "Shapes & Marks",
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  {
    id: "sparkles",
    name: "Sparkles",
    category: "Shapes & Marks",
    path: "M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8zm7-1c0 1.6-1.4 3-3 3 1.6 0 3 1.4 3 3 0-1.6 1.4-3 3-3-1.6 0-3-1.4-3-3z",
  },
  {
    id: "heart",
    name: "Heart",
    category: "Shapes & Marks",
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  {
    id: "check",
    name: "Checkmark",
    category: "Shapes & Marks",
    path: "M20 6L9 17l-5-5",
  },
  {
    id: "arrow-up-right",
    name: "Arrow",
    category: "Shapes & Marks",
    path: "M7 17L17 7M7 7h10v10",
  },
  {
    id: "zap",
    name: "Lightning",
    category: "Shapes & Marks",
    path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    id: "shield",
    name: "Shield",
    category: "Shapes & Marks",
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    id: "circle-dot",
    name: "Target / Dot",
    category: "Shapes & Marks",
    path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },

  // Tech & Code
  {
    id: "code",
    name: "Code Brackets",
    category: "Tech & Code",
    path: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  },
  {
    id: "terminal",
    name: "Terminal",
    category: "Tech & Code",
    path: "M4 17l6-6-6-6M12 19h8",
  },
  {
    id: "cpu",
    name: "Microchip",
    category: "Tech & Code",
    path: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M6 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm3 4h6v6H9V9z",
  },
  {
    id: "globe",
    name: "Globe / Web",
    category: "Tech & Code",
    path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  },
  {
    id: "lock",
    name: "Lock / Security",
    category: "Tech & Code",
    path: "M7 11V7a5 5 0 0 1 10 0v4m-12 0h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
  },
  {
    id: "cloud",
    name: "Cloud",
    category: "Tech & Code",
    path: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  },
  {
    id: "link",
    name: "Link",
    category: "Tech & Code",
    path: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  },

  // Commerce & Finance
  {
    id: "shopping-bag",
    name: "Shopping Bag",
    category: "Commerce & Finance",
    path: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  },
  {
    id: "chart-bar",
    name: "Bar Chart",
    category: "Commerce & Finance",
    path: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    id: "dollar-sign",
    name: "Finance / Currency",
    category: "Commerce & Finance",
    path: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    id: "trending-up",
    name: "Growth",
    category: "Commerce & Finance",
    path: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  },

  // Media & Creative
  {
    id: "camera",
    name: "Camera",
    category: "Media & Creative",
    path: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
  {
    id: "image",
    name: "Image",
    category: "Media & Creative",
    path: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-10.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11.5 10H5l6-8 4 5 3-4 3 7z",
  },
  {
    id: "play",
    name: "Play / Video",
    category: "Media & Creative",
    path: "M5 3l14 9-14 9V3z",
  },
  {
    id: "music",
    name: "Music / Audio",
    category: "Media & Creative",
    path: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  },
  {
    id: "palette",
    name: "Palette / Design",
    category: "Media & Creative",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z",
  },

  // Interface & System
  {
    id: "home",
    name: "Home",
    category: "Interface & System",
    path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  },
  {
    id: "search",
    name: "Search",
    category: "Interface & System",
    path: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35",
  },
  {
    id: "user",
    name: "User / Profile",
    category: "Interface & System",
    path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  {
    id: "settings",
    name: "Settings / Gear",
    category: "Interface & System",
    path: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    id: "mail",
    name: "Mail / Contact",
    category: "Interface & System",
    path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  },
  {
    id: "folder",
    name: "Folder",
    category: "Interface & System",
    path: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  },
  {
    id: "file-text",
    name: "Document",
    category: "Interface & System",
    path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "Interface & System",
    path: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-16 6h18M16 2v4M8 2v4",
  },

  // Lifestyle & Nature
  {
    id: "map-pin",
    name: "Location",
    category: "Lifestyle & Nature",
    path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    id: "coffee",
    name: "Coffee / Food",
    category: "Lifestyle & Nature",
    path: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3",
  },
  {
    id: "graduation-cap",
    name: "Education / Cap",
    category: "Lifestyle & Nature",
    path: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  },
  {
    id: "compass",
    name: "Travel / Compass",
    category: "Lifestyle & Nature",
    path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm4.24-14.24l-2.83 8.49-8.49 2.83 2.83-8.49 8.49-2.83z",
  },
  {
    id: "activity",
    name: "Health / Activity",
    category: "Lifestyle & Nature",
    path: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    id: "leaf",
    name: "Nature / Leaf",
    category: "Lifestyle & Nature",
    path: "M11 20A7 7 0 0 1 4 13C4 7 12 2 20 2c0 8-5 16-9 18z M2 22l10-10",
  },
];
