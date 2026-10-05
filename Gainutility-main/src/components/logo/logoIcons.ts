/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogoSymbol {
  id: string;
  name: string;
  category: LogoCategory;
  keywords: string[];
  path: string;
  viewBox?: string;
  isStroke?: boolean;
}

export type LogoCategory =
  | "Abstract"
  | "Tech"
  | "Business"
  | "Creative"
  | "Nature"
  | "Security"
  | "Food"
  | "Health"
  | "Travel"
  | "Sport"
  | "Education"
  | "Minimal";

export const LOGO_CATEGORIES: readonly ["All", ...LogoCategory[]] = [
  "All",
  "Abstract",
  "Tech",
  "Business",
  "Creative",
  "Nature",
  "Security",
  "Food",
  "Health",
  "Travel",
  "Sport",
  "Education",
  "Minimal",
] as const;

export const LOGO_SYMBOLS: LogoSymbol[] = [
  // ═════════════════════════════════════════════════════════════════
  // 1. ABSTRACT (16 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "abstract-mobius",
    name: "Infinity Flow",
    category: "Abstract",
    keywords: ["infinity", "loop", "flow", "continuous", "mobius", "cycle", "perpetual"],
    path: "M18.18 8.18a4.5 4.5 0 00-6.36 0L10.5 9.5 9.18 8.18a4.5 4.5 0 00-6.36 6.36l7.68 7.68 7.68-7.68a4.5 4.5 0 000-6.36z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-delta",
    name: "Delta Shift",
    category: "Abstract",
    keywords: ["delta", "triangle", "change", "shift", "forward", "prism", "arrow"],
    path: "M12 3L2 20h20L12 3zm0 6l5 9H7l5-9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-orb",
    name: "Orbit Sphere",
    category: "Abstract",
    keywords: ["orbit", "sphere", "planet", "rings", "circle", "space", "cosmic"],
    path: "M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm0 6a4 4 0 110 8 4 4 0 010-8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-helix",
    name: "Double Helix",
    category: "Abstract",
    keywords: ["helix", "dna", "spiral", "evolution", "curve", "bio", "strand"],
    path: "M12 2c-3 2-3 6-3 8s3 6 3 8M12 22c-3-2-3-6-3-8s3-6 3-8M7 8c0-2 2-3 4-3s4 1 4 3M17 16c0 2-2 3-4 3s-4-1-4-3",
    viewBox: "0 0 24 24",
  },
  {
    id: "circle-orbit",
    name: "Orbital Rings",
    category: "Abstract",
    keywords: ["orbit", "rings", "system", "satellite", "revolve", "cosmic"],
    path: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a6 6 0 106 6 6 6 0 00-6-6zm0 4a2 2 0 102 2 2 2 0 00-2-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "isometric-cube",
    name: "Hexa Cube",
    category: "Abstract",
    keywords: ["cube", "isometric", "box", "3d", "volume", "structure", "block"],
    path: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
    viewBox: "0 0 24 24",
  },
  {
    id: "hexagon-core",
    name: "Hexagon Core",
    category: "Abstract",
    keywords: ["hexagon", "core", "honeycomb", "geometry", "solid", "polygon"],
    path: "M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 4.5l-4.76 2.75v5.5L12 17.5l4.76-2.75v-5.5L12 6.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "diamond-facet",
    name: "Diamond Prism",
    category: "Abstract",
    keywords: ["diamond", "prism", "gem", "facet", "rhombus", "crystal", "precision"],
    path: "M12 2l9 10-9 10-9-10 9-10zm0 4.24L6.24 12 12 17.76 17.76 12 12 6.24z",
    viewBox: "0 0 24 24",
  },
  {
    id: "square-interlock",
    name: "Dual Square",
    category: "Abstract",
    keywords: ["square", "interlock", "overlap", "fusion", "connection", "duo"],
    path: "M4 4h10v10H4V4zm6 6h10v10H10V10z",
    viewBox: "0 0 24 24",
  },
  {
    id: "sinusoid-wave",
    name: "Sine Rhythm",
    category: "Abstract",
    keywords: ["wave", "sine", "rhythm", "audio", "frequency", "sound", "vibration"],
    path: "M2 12c3-6 6-6 9 0s6 6 9 0",
    viewBox: "0 0 24 24",
  },
  {
    id: "geometric-facet",
    name: "Crystal Facet",
    category: "Abstract",
    keywords: ["crystal", "facet", "gem", "mineral", "sharp", "geometric"],
    path: "M12 2l9 7-9 7-9-7 9-7zm0 3.5L5.5 12 12 16.5 18.5 12 12 8.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "wave-flow",
    name: "Sound Wave",
    category: "Abstract",
    keywords: ["sound", "wave", "audio", "voice", "signal", "eq", "music"],
    path: "M2 12h2l2-6 4 12 4-12 4 12 2-6h4",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-vortex",
    name: "Vortex Spiral",
    category: "Abstract",
    keywords: ["vortex", "spiral", "whirl", "swirl", "cyclone", "energy", "motion"],
    path: "M12 2a10 10 0 00-7.07 17.07l1.41-1.41A8 8 0 0112 4a8 8 0 018 8 8 8 0 01-2.34 5.66l1.41 1.41A10 10 0 0012 2zm0 4a6 6 0 00-6 6 6 6 0 001.76 4.24l1.41-1.41A4 4 0 018 12a4 4 0 014-4 4 4 0 014 4c0 1.1-.45 2.1-1.17 2.83l1.41 1.41A6 6 0 0012 6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-intersect",
    name: "Intersect Triangles",
    category: "Abstract",
    keywords: ["triangle", "intersect", "trinity", "delta", "geometry", "prism"],
    path: "M12 2l10 17H2L12 2zm0 4.5L5.5 17h13L12 6.5zM12 9l3.5 6h-7L12 9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-rings-trio",
    name: "Olympic Trio",
    category: "Abstract",
    keywords: ["rings", "trio", "circle", "overlap", "venn", "union", "synergy"],
    path: "M8 6a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm8 0a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm-4 6a4.5 4.5 0 100 9 4.5 4.5 0 000-9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "abstract-ribbon",
    name: "Origami Fold",
    category: "Abstract",
    keywords: ["origami", "fold", "ribbon", "paper", "craft", "plane", "modern"],
    path: "M3 4l9 16 9-16-9 4-9-4zm9 6l5-2.2-5 9-5-9 5 2.2z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 2. TECH & AI (16 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "terminal-code",
    name: "Terminal Code",
    category: "Tech",
    keywords: ["terminal", "code", "dev", "cli", "command", "prompt", "developer", "software", "syntax"],
    path: "M4 17l6-6-6-6m8 14h8",
    viewBox: "0 0 24 24",
  },
  {
    id: "cpu-chip",
    name: "Silicon Core",
    category: "Tech",
    keywords: ["cpu", "chip", "processor", "hardware", "silicon", "microchip", "circuit", "tech"],
    path: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2zm2 4h6v6H9V9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cloud-network",
    name: "Cloud Sync",
    category: "Tech",
    keywords: ["cloud", "sync", "saas", "network", "server", "data", "storage", "hosting", "online"],
    path: "M6.5 19a4.5 4.5 0 01-.42-8.98A7.002 7.002 0 0119.5 12 5 5 0 0118 21.9H6.5",
    viewBox: "0 0 24 24",
  },
  {
    id: "nodes-network",
    name: "Node Mesh",
    category: "Tech",
    keywords: ["nodes", "network", "mesh", "meshnet", "graph", "distributed", "blockchain", "p2p"],
    path: "M12 2a3 3 0 100 6 3 3 0 000-6zm-7 14a3 3 0 100 6 3 3 0 000-6zm14 0a3 3 0 100 6 3 3 0 000-6zM10.2 7.3L6.8 14.7m7-7.4l3.4 7.4M8 19h8",
    viewBox: "0 0 24 24",
  },
  {
    id: "circuit-junction",
    name: "Circuit Path",
    category: "Tech",
    keywords: ["circuit", "pcb", "electronics", "hardware", "junction", "path", "iot", "trace"],
    path: "M12 2v4m0 12v4M2 12h4m12 0h4m-8-4a4 4 0 100 8 4 4 0 000-8zm-5-3l2 2m6 6l2 2m-10 0l2-2m6-6l2-2",
    viewBox: "0 0 24 24",
  },
  {
    id: "code-brackets",
    name: "Code Syntax",
    category: "Tech",
    keywords: ["code", "brackets", "html", "syntax", "tag", "programming", "web", "software"],
    path: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    viewBox: "0 0 24 24",
  },
  {
    id: "ai-brain-mesh",
    name: "Neural Nexus",
    category: "Tech",
    keywords: ["ai", "brain", "neural", "intelligence", "nexus", "synapse", "deep learning", "smart"],
    path: "M12 2a5 5 0 015 5c0 1.94-1.1 3.63-2.73 4.46.23.47.4.98.5 1.54h2.23a4 4 0 014 4 4 4 0 01-4 4h-2a4 4 0 01-4-4v-1a5 5 0 01-5-5c0-1.94 1.1-3.63 2.73-4.46A4.97 4.97 0 017 7a5 5 0 015-5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "ai-spark-gem",
    name: "Intelligent Spark",
    category: "Tech",
    keywords: ["ai", "spark", "gem", "intelligence", "generation", "copilot", "llm", "assistant"],
    path: "M12 2l2.8 6.2L21 11l-6.2 2.8L12 20l-2.8-6.2L3 11l6.2-2.8L12 2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cyber-matrix",
    name: "Quantum Lattice",
    category: "Tech",
    keywords: ["matrix", "quantum", "lattice", "grid", "blocks", "cyber", "system"],
    path: "M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm12 0h4v4h-4v-4zm-6-6h4v4h-4v-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "server-rack",
    name: "Server Stack",
    category: "Tech",
    keywords: ["server", "stack", "datacenter", "rack", "infrastructure", "devops", "cloud"],
    path: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm6 4h4v4h-4v-4zm0 6h4v4h-4v-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "database-cylinder",
    name: "Database Core",
    category: "Tech",
    keywords: ["database", "sql", "data", "storage", "core", "tables", "records", "nosql"],
    path: "M12 2C6.48 2 2 4.5 2 9s4.48 7 10 7 10-2.5 10-7-4.48-7-10-7zm0 2a8 8 0 010 14M12 6a8 8 0 010 10M12 10a8 8 0 000 6",
    viewBox: "0 0 24 24",
  },
  {
    id: "cloud-lightning",
    name: "Cloud Lightning",
    category: "Tech",
    keywords: ["cloud", "lightning", "speed", "fast", "power", "compute", "turbo"],
    path: "M19.36 10a6 6 0 00-11.28 0 4 4 0 00-6.44 3.54A5.96 5.96 0 002 17.5a5.96 5.96 0 004.64 5.46 6 6 0 008.72 0 5.96 5.96 0 004.64-5.46A5.96 5.96 0 0022 17.5a5.96 5.96 0 00-2.64-5.46 4 4 0 00-6.44-3.54zm-10 6.5a2 2 0 114 0 2 2 0 01-4 0z",
    viewBox: "0 0 24 24",
  },
  {
    id: "robotics-head",
    name: "Bionic Android",
    category: "Tech",
    keywords: ["robot", "bionic", "android", "ai", "automaton", "bot", "agent", "cyber"],
    path: "M12 2a2 2 0 012 2v1h4a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2zm-3 8a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5 6h4v1H10v-1z",
    viewBox: "0 0 24 24",
  },
  {
    id: "wireless-wave",
    name: "Signal Beacon",
    category: "Tech",
    keywords: ["wireless", "signal", "wifi", "beacon", "broadcast", "radio", "telecom", "iot"],
    path: "M12 18a2 2 0 100 4 2 2 0 000-4zm-4.95-3.54a7 7 0 019.9 0M4.22 10.22a11 11 0 0115.56 0M1.39 6.05a15 15 0 0121.22 0",
    viewBox: "0 0 24 24",
  },
  {
    id: "git-branch",
    name: "Branch Fork",
    category: "Tech",
    keywords: ["git", "branch", "version", "fork", "merge", "commit", "source", "repo"],
    path: "M6 3a3 3 0 100 6 3 3 0 000-6zm12 6a3 3 0 100-6 3 3 0 000 6zm-6 9a3 3 0 100 6 3 3 0 000-6zM6 9v9m12-3a9 9 0 00-9-9",
    viewBox: "0 0 24 24",
  },
  {
    id: "api-plug",
    name: "API Connector",
    category: "Tech",
    keywords: ["api", "plug", "connector", "integration", "link", "webhook", "pipeline"],
    path: "M9 2v4m6-4v4M4 8h16a2 2 0 012 2v2a6 6 0 01-6 6h-1v4h-2v-4H9a6 6 0 01-6-6v-2a2 2 0 012-2z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 3. BUSINESS & FINANCE (14 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "growth-ascent",
    name: "Growth Vector",
    category: "Business",
    keywords: ["growth", "trend", "vector", "up", "bull", "chart", "invest", "finance", "scale"],
    path: "M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6",
    viewBox: "0 0 24 24",
  },
  {
    id: "bull-market",
    name: "Market Ascent",
    category: "Business",
    keywords: ["market", "ascent", "trade", "stocks", "wall street", "profits", "gains"],
    path: "M3 3v18h18M7 14l4-4 4 4 5-6",
    viewBox: "0 0 24 24",
  },
  {
    id: "shield-pillar",
    name: "Pillar Crest",
    category: "Business",
    keywords: ["pillar", "bank", "institution", "trust", "capital", "firm", "law", "advisory"],
    path: "M4 4h16M4 20h16M6 4v16m4-16v16m4-16v16m4-16v16",
    viewBox: "0 0 24 24",
  },
  {
    id: "apex-pyramid",
    name: "Apex Tier",
    category: "Business",
    keywords: ["apex", "pyramid", "hierarchy", "top", "leader", "executive", "premium"],
    path: "M12 2L1 21h22L12 2zm0 6l6 11H6l6-11z",
    viewBox: "0 0 24 24",
  },
  {
    id: "chart-trending",
    name: "Growth Chart",
    category: "Business",
    keywords: ["chart", "analytics", "stats", "metrics", "kpi", "dashboard", "revenue"],
    path: "M3 3v18h18M19 14l-5-5-4 4-3-3",
    viewBox: "0 0 24 24",
  },
  {
    id: "coin-stack",
    name: "Wealth Stack",
    category: "Business",
    keywords: ["coin", "money", "wealth", "currency", "crypto", "token", "cash", "capital"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm2 12a2 2 0 11-4 0 2 2 0 014 0zM7 10a5 5 0 0110 0M7 14a9 9 0 0110 0",
    viewBox: "0 0 24 24",
  },
  {
    id: "briefcase-lock",
    name: "Secure Business",
    category: "Business",
    keywords: ["briefcase", "corporate", "portfolio", "consulting", "executive", "deal"],
    path: "M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2h-3v2h14V4h-3v16zM10 2v2h4V2h-4zm8 16H6V8h12v10z",
    viewBox: "0 0 24 24",
  },
  {
    id: "target-bullseye",
    name: "Target Focus",
    category: "Business",
    keywords: ["target", "bullseye", "goal", "mission", "aim", "focus", "okr", "strategy"],
    path: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a6 6 0 106 6 6 6 0 00-6-6zm0 4a2 2 0 102 2 2 2 0 00-2-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "building-skyscraper",
    name: "Metro Tower",
    category: "Business",
    keywords: ["skyscraper", "building", "real estate", "tower", "city", "corporate", "property"],
    path: "M6 2h12a2 2 0 012 2v18H4V4a2 2 0 012-2zm2 4v2h2V6H8zm6 0v2h2V6h-2zm-6 4v2h2v-2H8zm6 0v2h2v-2h-2zm-6 4v2h2v-2H8zm6 0v2h2v-2h-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "scale-balance",
    name: "Justice Balance",
    category: "Business",
    keywords: ["scale", "balance", "law", "legal", "justice", "equality", "attorney", "ethics"],
    path: "M12 3v18m-7-9l7-6 7 6M2 17l3-6 3 6H2zm14 0l3-6 3 6h-6zM8 21h8",
    viewBox: "0 0 24 24",
  },
  {
    id: "rocket-launch",
    name: "Venture Rocket",
    category: "Business",
    keywords: ["rocket", "launch", "startup", "venture", "blastoff", "scale", "speed", "boost"],
    path: "M12 2.5s4 4 4 10.5l-4 4-4-4c0-6.5 4-10.5 4-10.5zM4.5 13.5l3.5 3.5-3 4-1.5-1.5 1-6zm15 0l-3.5 3.5 3 4 1.5-1.5-1-6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "diamond-vault",
    name: "Safe Reserve",
    category: "Business",
    keywords: ["vault", "safe", "reserve", "secure", "lock", "bank", "asset", "protection"],
    path: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 4a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "handshake-deal",
    name: "Alliance Deal",
    category: "Business",
    keywords: ["deal", "partnership", "agreement", "handshake", "trust", "contract", "b2b"],
    path: "M3 11l4-4 5 5 7-7 2 2-9 9-4-4-3 3-2-2zm18-2l-2-2-4 4 2 2 4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "bag-minimal",
    name: "Commerce Cart",
    category: "Business",
    keywords: ["bag", "shopping", "ecommerce", "retail", "store", "shop", "cart", "goods"],
    path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zm0 4h12M9 10a3 3 0 006 0",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 4. CREATIVE & MEDIA (14 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "compass-star",
    name: "North Star",
    category: "Creative",
    keywords: ["star", "compass", "guidance", "spark", "direction", "brand", "agency"],
    path: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "palette-prism",
    name: "Color Prism",
    category: "Creative",
    keywords: ["palette", "color", "paint", "art", "prism", "studio", "hue", "design"],
    path: "M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.49.09.91-.27.91-.77v-1.12c0-.55.45-1 1-1h1.5c3.59 0 6.5-2.91 6.5-6.5C18.75 6.26 15.74 2 12 2zm-5.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "camera-aperture",
    name: "Lens Shutter",
    category: "Creative",
    keywords: ["camera", "lens", "shutter", "aperture", "photo", "film", "cinema", "video"],
    path: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm2.36 2.37l4.7 4.7-2.9 5.02-4.7-4.7 2.9-5.02zM4.37 14.36l4.7-4.7 5.02 2.9-4.7 4.7-5.02-2.9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "design-layers",
    name: "Canvas Layers",
    category: "Creative",
    keywords: ["layers", "stack", "sheets", "levels", "design", "ui", "ux", "photoshop"],
    path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    viewBox: "0 0 24 24",
  },
  {
    id: "pen-nib",
    name: "Calligraphy Nib",
    category: "Creative",
    keywords: ["pen", "nib", "calligraphy", "writing", "author", "ink", "editorial", "literary"],
    path: "M12 2l-7 13 4 7h6l4-7-7-13zm0 6a2 2 0 110 4 2 2 0 010-4zm0 6v6",
    viewBox: "0 0 24 24",
  },
  {
    id: "crown-crest",
    name: "Royal Crown",
    category: "Creative",
    keywords: ["crown", "royal", "luxury", "king", "queen", "prestige", "vip", "gold"],
    path: "M2 4l3 12h14l3-12-5 6-5-8-5 8-5-6zm3 14h14v2H5v-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "brush-stroke",
    name: "Brush Stroke",
    category: "Creative",
    keywords: ["brush", "paint", "stroke", "draw", "canvas", "fine art", "illustrator"],
    path: "M12 2L3 10v10a2 2 0 002 2h14a2 2 0 002-2V10l-9-8zM7 14l5-5 5 5M7 18l5-5 5 5",
    viewBox: "0 0 24 24",
  },
  {
    id: "spark-magic",
    name: "Magic Spark",
    category: "Creative",
    keywords: ["spark", "magic", "sparkle", "wand", "enchanted", "glow", "stellar", "special"],
    path: "M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2zM12 6a4 4 0 100 8 4 4 0 000-8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "pen-tool",
    name: "Bezier Vector",
    category: "Creative",
    keywords: ["pen", "vector", "bezier", "anchor", "curve", "illustrator", "path"],
    path: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "flame-fire",
    name: "Creative Flame",
    category: "Creative",
    keywords: ["flame", "fire", "passion", "energy", "burn", "warm", "spark"],
    path: "M12 2c-.5 2-2 4-2 6 0 1.5.8 2.8 2 3.5-1.5.2-3 1.5-3 3.5 0 2.8 2.2 5 5 5s5-2.2 5-5c0-4-4-6-4-9 0-1.5 1-3 1-4-2 0-3 1-4 2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "feather-quill",
    name: "Feather Quill",
    category: "Creative",
    keywords: ["feather", "quill", "light", "poet", "author", "write", "gentle"],
    path: "M20.24 3.76a6 6 0 00-8.48 0L3.52 12l-.52 5 5-.52 8.24-8.24a6 6 0 000-8.48zM9 15l6-6",
    viewBox: "0 0 24 24",
  },
  {
    id: "wand-magic",
    name: "Creation Wand",
    category: "Creative",
    keywords: ["wand", "wizard", "alchemy", "magic", "craft", "sparks"],
    path: "M14.5 9.5l-11 11a1.5 1.5 0 002.12 2.12l11-11a1.5 1.5 0 00-2.12-2.12zM18 2l1.2 2.8L22 6l-2.8 1.2L18 10l-1.2-2.8L14 6l2.8-1.2L18 2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "geometric-shapes",
    name: "Shape Trinity",
    category: "Creative",
    keywords: ["shapes", "circle", "square", "triangle", "geometry", "bauhaus", "form"],
    path: "M6 4a3 3 0 100 6 3 3 0 000-6zm12 1l-3 6h6l-3-6zm-7 10h6v6h-6v-6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "origami-swan",
    name: "Origami Swan",
    category: "Creative",
    keywords: ["origami", "swan", "bird", "craft", "geometry", "japan", "sculpt"],
    path: "M3 13l4-7 4 3 6-7 4 19-14-3-4-5zM11 9l-4 7h8l-4-7z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 5. NATURE & ORGANIC (14 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "sprout-leaf",
    name: "Eco Sprout",
    category: "Nature",
    keywords: ["leaf", "eco", "green", "bio", "plant", "organic", "growth", "nature", "sustainability"],
    path: "M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    viewBox: "0 0 24 24",
  },
  {
    id: "twin-leaves",
    name: "Dual Flora",
    category: "Nature",
    keywords: ["leaves", "flora", "botany", "plant", "garden", "green", "herbal"],
    path: "M2 22s2-8 9-8c0-5 4-9 9-9 0 7-4 11-9 11-3.5 0-5.5 1.5-7 4M11 14c-1 3-3 5-6 6",
    viewBox: "0 0 24 24",
  },
  {
    id: "leaf-organic",
    name: "Organic Leaf",
    category: "Nature",
    keywords: ["leaf", "clean", "fresh", "vegan", "natural", "farm", "pure"],
    path: "M12 2C6.5 2 2 7 2 12.5c0 4.1 2.6 7.6 6.3 8.9.5.2 1.1-.2 1.1-.7v-3.2c0-.6.4-1 1-1h1.2c4.4 0 8.4-3.5 8.4-8 0-4.7-3.6-8.5-8-8.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "tree-pine",
    name: "Pine Tree",
    category: "Nature",
    keywords: ["tree", "pine", "forest", "evergreen", "timber", "wood", "outdoor"],
    path: "M12 2l-4 6h8l-4 6h3v6h-6v-6H7l5-6 5 6h-3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "seed-sprout",
    name: "Seedling Growth",
    category: "Nature",
    keywords: ["seed", "sprout", "grow", "soil", "origin", "beginning", "sapling"],
    path: "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zm-1-10c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM7 13c0-2 3-3 5-3s5 1 5 3",
    viewBox: "0 0 24 24",
  },
  {
    id: "mountain-peak",
    name: "Mountain Peak",
    category: "Nature",
    keywords: ["mountain", "peak", "alpine", "summit", "climb", "heights", "rocky", "outdoor"],
    path: "M3 20h18L15 6l-4 7-2-3-6 10zm10.5-8.5l2.5 4.5h-5l2.5-4.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "sun-radiant",
    name: "Radiant Sun",
    category: "Nature",
    keywords: ["sun", "radiant", "light", "solar", "warm", "day", "energy", "bright"],
    path: "M12 7a5 5 0 100 10 5 5 0 000-10zm0-5v3m0 14v3m10-10h-3M5 12H2m15.07-7.07l-2.12 2.12M9.05 14.95l-2.12 2.12m12.14 0l-2.12-2.12M9.05 9.05L6.93 6.93",
    viewBox: "0 0 24 24",
  },
  {
    id: "ocean-wave",
    name: "Crest Wave",
    category: "Nature",
    keywords: ["wave", "ocean", "sea", "water", "surf", "current", "tide", "marine"],
    path: "M2 16c2.5-3 5.5-3 8 0s5.5 3 8 0 4-2 4-2M2 11c2.5-3 5.5-3 8 0s5.5 3 8 0 4-2 4-2M2 6c2.5-3 5.5-3 8 0s5.5 3 8 0 4-2 4-2",
    viewBox: "0 0 24 24",
  },
  {
    id: "water-droplet",
    name: "Water Droplet",
    category: "Nature",
    keywords: ["water", "droplet", "drop", "aqua", "rain", "fluid", "pure", "drink"],
    path: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    viewBox: "0 0 24 24",
  },
  {
    id: "crescent-moon",
    name: "Night Moon",
    category: "Nature",
    keywords: ["moon", "night", "lunar", "crescent", "sleep", "dark", "sky", "stars"],
    path: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    viewBox: "0 0 24 24",
  },
  {
    id: "wind-breeze",
    name: "Gentle Breeze",
    category: "Nature",
    keywords: ["wind", "breeze", "air", "gust", "flow", "weather", "atmosphere"],
    path: "M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2",
    viewBox: "0 0 24 24",
  },
  {
    id: "flower-blossom",
    name: "Flora Blossom",
    category: "Nature",
    keywords: ["flower", "blossom", "petal", "bloom", "beauty", "spring", "botanical"],
    path: "M12 2a4 4 0 00-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4a4 4 0 00-4-4zm-6 6a4 4 0 00-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4a4 4 0 00-4-4zm12 0a4 4 0 00-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4a4 4 0 00-4-4zm-6 6a4 4 0 00-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4a4 4 0 00-4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "clover-lucky",
    name: "Four Leaf Clover",
    category: "Nature",
    keywords: ["clover", "lucky", "irish", "fortune", "four-leaf", "fortune"],
    path: "M12 12a3.5 3.5 0 10-3.5-3.5H12v3.5zm0 0a3.5 3.5 0 103.5-3.5H12v3.5zm0 0a3.5 3.5 0 10-3.5 3.5H12V12zm0 0a3.5 3.5 0 103.5 3.5H12V12zm0 3.5V22",
    viewBox: "0 0 24 24",
  },
  {
    id: "earth-globe-eco",
    name: "Planet Earth",
    category: "Nature",
    keywords: ["earth", "planet", "globe", "world", "environment", "ecology", "green"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm-1 2.06c.33 0 .66.02 1 .06a8 8 0 016.92 6.88H15v1a2 2 0 01-2 2h-1v2a2 2 0 01-2 2H9v1.94A8 8 0 014.06 13H8a2 2 0 012-2V9a2 2 0 012-2h1V4.06z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 6. SECURITY & SHIELD (12 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "shield-key",
    name: "Secure Shield",
    category: "Security",
    keywords: ["shield", "security", "protect", "defense", "safe", "guard", "privacy", "secure"],
    path: "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 5a2 2 0 012 2c0 .74-.4 1.39-1 1.73V14a1 1 0 01-2 0v-3.27A2 2 0 0112 7z",
    viewBox: "0 0 24 24",
  },
  {
    id: "shield-vault",
    name: "Cyber Fortress",
    category: "Security",
    keywords: ["fortress", "shield", "defense", "firewall", "cybersecurity", "bastion"],
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-1-8h2v2h-2v-2zm0-6h2v4h-2V8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "lock-shield",
    name: "Lock Shield",
    category: "Security",
    keywords: ["lock", "padlock", "encryption", "crypto", "ssl", "private", "confidential"],
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-1-8v4h-2v-4zm4-8a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2h4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "key-skeleton",
    name: "Skeleton Key",
    category: "Security",
    keywords: ["key", "access", "unlock", "passkey", "auth", "token", "login"],
    path: "M15.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5zM15.5 3.5a2.12 2.12 0 010 3L4 20l-1 4 4-1 12.5-12.5a2.12 2.12 0 013 3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "shield-check",
    name: "Verified Shield",
    category: "Security",
    keywords: ["verified", "check", "approved", "compliance", "audited", "certified", "safe"],
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-2-9l-2-2-1.41 1.41L10 15.83l6.59-6.59L15.17 7.83 10 13z",
    viewBox: "0 0 24 24",
  },
  {
    id: "fingerprint-scan",
    name: "Biometric Scan",
    category: "Security",
    keywords: ["biometric", "fingerprint", "touch id", "identity", "kyc", "auth", "personal"],
    path: "M12 2a8 8 0 00-8 8c0 2.2.9 4.2 2.3 5.7l1.4-1.4A6 6 0 016 10a6 6 0 1112 0c0 1.6-.6 3-1.7 4.3l1.4 1.4A8 8 0 0020 10a8 8 0 00-8-8zm0 4a4 4 0 00-4 4c0 1.1.4 2.1 1.2 2.8l1.4-1.4A2 2 0 0110 10a2 2 0 114 0c0 .6-.2 1.1-.6 1.4l1.4 1.4c.7-.7 1.2-1.7 1.2-2.8a4 4 0 00-4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "padlock-modern",
    name: "Minimal Padlock",
    category: "Security",
    keywords: ["padlock", "lock", "vault", "close", "secure", "encrypted"],
    path: "M19 11h-1V7a6 6 0 00-12 0v4H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM8 7a4 4 0 018 0v4H8V7zm4 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "eye-scan",
    name: "Retina Sentry",
    category: "Security",
    keywords: ["eye", "retina", "scan", "vision", "watch", "sentry", "monitoring", "surveillance"],
    path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 5a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 100-6 3 3 0 000 6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "badge-sheriff",
    name: "Authority Star",
    category: "Security",
    keywords: ["badge", "sheriff", "police", "star", "authority", "officer", "marshal"],
    path: "M12 2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 15.3 6.8 18l1-5.8-4.2-4.1 5.8-.8L12 2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "firewall-brick",
    name: "Defense Firewall",
    category: "Security",
    keywords: ["firewall", "brick", "wall", "network", "protection", "barrier", "defense"],
    path: "M3 3h18v18H3V3zm2 4h6v4H5V7zm8 0h6v4h-6V7zm-8 6h10v4H5v-4zm12 0h2v4h-2v-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "check-circle-double",
    name: "Double Confirm",
    category: "Security",
    keywords: ["check", "confirm", "verified", "guarantee", "trustmark", "authentic"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    viewBox: "0 0 24 24",
  },
  {
    id: "monogram-shield",
    name: "Heraldic Crest",
    category: "Security",
    keywords: ["crest", "heraldic", "shield", "insignia", "heritage", "coat of arms"],
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 7. FOOD & RESTAURANT (10 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "coffee-steam",
    name: "Artisan Brew",
    category: "Food",
    keywords: ["coffee", "cup", "brew", "cafe", "espresso", "latte", "roast", "tea", "drink"],
    path: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-5v3m4-3v3m4-3v3",
    viewBox: "0 0 24 24",
  },
  {
    id: "cloche-dining",
    name: "Gourmet Cloche",
    category: "Food",
    keywords: ["dining", "cloche", "restaurant", "fine dining", "gourmet", "chef", "plate", "serve"],
    path: "M12 5a2 2 0 012 2c0 .4-.1.7-.3 1H21a1 1 0 011 1c0 5-4 9-10 9S2 14 2 9a1 1 0 011-1h7.3c-.2-.3-.3-.6-.3-1a2 2 0 012-2zM2 20h20v2H2v-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "chef-hat",
    name: "Chef Toque",
    category: "Food",
    keywords: ["chef", "hat", "cook", "kitchen", "bakery", "toque", "baker"],
    path: "M6 18h12v4H6v-4zm13-8a3.5 3.5 0 00-3.5-3.5c-.4 0-.8.1-1.2.2A4.5 4.5 0 006 8a3.5 3.5 0 00-1 6.8V16h14v-1.2A3.5 3.5 0 0019 10z",
    viewBox: "0 0 24 24",
  },
  {
    id: "fork-knife",
    name: "Bistro Cutlery",
    category: "Food",
    keywords: ["cutlery", "fork", "knife", "bistro", "eatery", "food", "table", "dine"],
    path: "M18 2v20M2 2v6a3 3 0 003 3v11h2V11a3 3 0 003-3V2H8v5H6V2H2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "wine-glass",
    name: "Sommelier Goblet",
    category: "Food",
    keywords: ["wine", "glass", "goblet", "bar", "cocktail", "lounge", "drink", "vineyard"],
    path: "M8 2h8a4 4 0 014 4c0 3.3-2.7 6-6 6v7h4v2H6v-2h4v-7C6.7 12 4 9.3 4 6a4 4 0 014-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "wheat-ear",
    name: "Golden Wheat",
    category: "Food",
    keywords: ["wheat", "grain", "bakery", "bread", "harvest", "flour", "beer", "agriculture"],
    path: "M2 22l10-10m-3-3a3 3 0 014.24 0M11 7a3 3 0 014.24 0M13 5a3 3 0 014.24 0M12 12a3 3 0 000-4.24m2 2a3 3 0 000-4.24m2 2a3 3 0 000-4.24",
    viewBox: "0 0 24 24",
  },
  {
    id: "pizza-slice",
    name: "Artisan Pizza",
    category: "Food",
    keywords: ["pizza", "slice", "italian", "crust", "cheese", "fast food", "pizzeria"],
    path: "M12 2C7 2 2.5 3.8 1 5l11 17L23 5c-1.5-1.2-6-3-11-3zm-2 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cupcake-sweet",
    name: "Sweet Pastry",
    category: "Food",
    keywords: ["cupcake", "bakery", "dessert", "sweet", "pastry", "cake", "confectionery"],
    path: "M5 11l2 10h10l2-10H5zm7-9a4 4 0 00-4 4c0 .4.1.8.2 1.1A3 3 0 004 9c0 1.1.9 2 2 2h12a2 2 0 002-2 3 3 0 00-3.2-2.9c.1-.3.2-.7.2-1.1a4 4 0 00-4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cocktail-martini",
    name: "Martini Lounge",
    category: "Food",
    keywords: ["cocktail", "martini", "bar", "club", "lounge", "drink", "spirits", "party"],
    path: "M3 3h18l-8 9v7h4v2H7v-2h4v-7L3 3zm4.5 4h9",
    viewBox: "0 0 24 24",
  },
  {
    id: "bowl-steaming",
    name: "Noodle Bowl",
    category: "Food",
    keywords: ["bowl", "noodle", "ramen", "soup", "hot", "asian", "chopsticks", "food"],
    path: "M3 10c0 4.97 4.03 9 9 9s9-4.03 9-9H3zm4-7v3m5-3v3m5-3v3M8 21h8v1H8v-1z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 8. HEALTH & WELLNESS (10 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "heart-pulse",
    name: "Vital Pulse",
    category: "Health",
    keywords: ["heart", "pulse", "vital", "ecg", "cardio", "health", "care", "doctor", "hospital"],
    path: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cross-health",
    name: "Medical Cross",
    category: "Health",
    keywords: ["cross", "medical", "clinic", "first aid", "emergency", "pharmacy", "red cross"],
    path: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "pulse-line",
    name: "Heartbeat Line",
    category: "Health",
    keywords: ["pulse", "heartbeat", "ecg", "cardiogram", "rhythm", "life", "vitality"],
    path: "M3 12h4l2-4 2 4 2-8 2 8 2 4h4M3 12v0",
    viewBox: "0 0 24 24",
  },
  {
    id: "wellness-lotus",
    name: "Lotus Wellness",
    category: "Health",
    keywords: ["lotus", "wellness", "yoga", "meditation", "spa", "zen", "relax", "holistic"],
    path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm0-10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "dna-double",
    name: "Genomic Strand",
    category: "Health",
    keywords: ["dna", "genomics", "biotech", "gene", "heredity", "science", "laboratory"],
    path: "M4 4c4 4 4 12 8 12s4-8 8-12M4 20c4-4 4-12 8-12s4 8 8 12m-14-8h12",
    viewBox: "0 0 24 24",
  },
  {
    id: "pill-capsule",
    name: "Rx Capsule",
    category: "Health",
    keywords: ["pill", "capsule", "rx", "pharma", "medicine", "drug", "tablet", "remedy"],
    path: "M10.5 4.5l9 9a4.95 4.95 0 01-7 7l-9-9a4.95 4.95 0 017-7zm-2 5l7 7",
    viewBox: "0 0 24 24",
  },
  {
    id: "stethoscope-heart",
    name: "Doctor Stethoscope",
    category: "Health",
    keywords: ["stethoscope", "doctor", "pediatrician", "nurse", "exam", "checkup"],
    path: "M6 3v7a6 6 0 0012 0V3m-2 0h4M4 3h4m4 13v2a4 4 0 008 0v-2m0 0a2 2 0 100-4 2 2 0 000 4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "eye-optic",
    name: "Optic Clinic",
    category: "Health",
    keywords: ["eye", "optic", "vision", "ophthalmology", "optometry", "glasses", "sight"],
    path: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zm10 4a4 4 0 100-8 4 4 0 000 8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "tooth-dental",
    name: "Dental Crown",
    category: "Health",
    keywords: ["tooth", "dental", "dentist", "oral", "orthodontic", "smile", "teeth"],
    path: "M12 2C8 2 6 4 6 7c0 4 2 8 3 13 1-2 2-3 3-3s2 1 3 3c1-5 3-9 3-13 0-3-2-5-6-5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "shield-health",
    name: "Immunology Shield",
    category: "Health",
    keywords: ["shield", "health", "immunity", "protection", "vaccine", "defense", "care"],
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-1-12h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 9. TRAVEL & EXPLORATION (10 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "globe-travel",
    name: "Global Meridian",
    category: "Travel",
    keywords: ["globe", "travel", "world", "international", "flight", "meridian", "earth", "tour"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 3 4 6.5 4 10s-1.5 7-4 10m0-20c-2.5 3-4 6.5-4 10s1.5 7 4 10M2 12h20",
    viewBox: "0 0 24 24",
  },
  {
    id: "compass-arrow",
    name: "Precision Pointer",
    category: "Travel",
    keywords: ["compass", "pointer", "direction", "navigation", "map", "gps", "orient"],
    path: "M12 2l4 8-4 4-4-4 4-8zm0 12l4 4-4 4-4-4 4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "airplane-flight",
    name: "Aviation Jet",
    category: "Travel",
    keywords: ["airplane", "jet", "flight", "airline", "airport", "fly", "cargo", "travel"],
    path: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "pin-map",
    name: "Location Beacon",
    category: "Travel",
    keywords: ["pin", "location", "map", "marker", "gps", "place", "spot", "destination"],
    path: "M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "ship-anchor",
    name: "Nautical Anchor",
    category: "Travel",
    keywords: ["anchor", "nautical", "ship", "sail", "sea", "harbor", "navy", "boat"],
    path: "M12 2a3 3 0 100 6 3 3 0 000-6zm0 6v14m-8-7a8 8 0 0016 0h-2a6 6 0 01-12 0H4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "suitcase-luggage",
    name: "Voyage Luggage",
    category: "Travel",
    keywords: ["suitcase", "luggage", "baggage", "trip", "vacation", "holiday", "hotel"],
    path: "M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2h4a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4zm2-2v2h4V4h-4zm-6 6h16",
    viewBox: "0 0 24 24",
  },
  {
    id: "hot-air-balloon",
    name: "Aero Balloon",
    category: "Travel",
    keywords: ["balloon", "sky", "flight", "air", "adventure", "scenic", "heights"],
    path: "M12 2a7 7 0 00-5.5 11.3L10 18h4l3.5-4.7A7 7 0 0012 2zm-2 18h4v2h-4v-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "mountain-trail",
    name: "Trail Route",
    category: "Travel",
    keywords: ["trail", "mountain", "hike", "trek", "outdoor", "route", "adventure", "path"],
    path: "M4 19L10 7l4 8 2-3 4 7H4zm8-2l-2-4-3 6h10l-2-3-3 1z",
    viewBox: "0 0 24 24",
  },
  {
    id: "tent-camping",
    name: "Basecamp Tent",
    category: "Travel",
    keywords: ["tent", "camp", "basecamp", "wilderness", "glamping", "forest", "scout"],
    path: "M12 3L2 19h20L12 3zm0 5l6 11h-4l-2-4-2 4H6l6-11z",
    viewBox: "0 0 24 24",
  },
  {
    id: "lighthouse-beacon",
    name: "Harbor Lighthouse",
    category: "Travel",
    keywords: ["lighthouse", "beacon", "coast", "light", "guide", "safety", "maritime"],
    path: "M9 3h6l1 4h-8l1-4zm-2 6h10l2 13H5L7 9zm5 2a2 2 0 100 4 2 2 0 000-4z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 10. SPORT & FITNESS (10 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "trophy-crest",
    name: "Champion Cup",
    category: "Sport",
    keywords: ["trophy", "cup", "champion", "winner", "victory", "first", "gold", "award"],
    path: "M6 9V4h12v5a6 6 0 01-12 0zm0 0H3a2 2 0 01-2-2V5a2 2 0 012-2h3m12 6h3a2 2 0 002-2V5a2 2 0 00-2-2h-3m-7 13v4m-4 0h8",
    viewBox: "0 0 24 24",
  },
  {
    id: "dumbbell-weights",
    name: "Barbell Iron",
    category: "Sport",
    keywords: ["dumbbell", "barbell", "weights", "gym", "fitness", "workout", "crossfit", "strength"],
    path: "M6 5v14M18 5v14M2 9v6m20-6v6M6 12h12",
    viewBox: "0 0 24 24",
  },
  {
    id: "running-athlete",
    name: "Velocity Runner",
    category: "Sport",
    keywords: ["runner", "running", "sprint", "athlete", "marathon", "track", "speed", "cardio"],
    path: "M13 4a2 2 0 100-4 2 2 0 000 4zm4 6l-3-2-2 2-3-2-4 3 1.5 2 3-2 2 2-4 7h2.5l2.5-5 3 2v6h2v-7l-2.5-2 1-3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "stopwatch-timer",
    name: "Precision Chrono",
    category: "Sport",
    keywords: ["stopwatch", "chrono", "timer", "seconds", "race", "pace", "lap", "speed"],
    path: "M12 2v3m-2-3h4m4.2 3.8l2-2M12 9v5l3 3M12 5a9 9 0 100 18 9 9 0 000-18z",
    viewBox: "0 0 24 24",
  },
  {
    id: "bicycle-cyclist",
    name: "Road Cycle",
    category: "Sport",
    keywords: ["bicycle", "bike", "cyclist", "ride", "triathlon", "tour", "pedal"],
    path: "M5 19a4 4 0 100-8 4 4 0 000 8zm14 0a4 4 0 100-8 4 4 0 000 8zm-9-4h4l3-6h-4l-3 6zM15 9l-2-4h-4",
    viewBox: "0 0 24 24",
  },
  {
    id: "medal-award",
    name: "Prize Medal",
    category: "Sport",
    keywords: ["medal", "award", "ribbon", "prize", "podium", "olympic", "honor"],
    path: "M12 15a5 5 0 100-10 5 5 0 000 10zm-3-9L4 2h4l4 4zm6 0l5-4h-4l-4 4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "flame-torch",
    name: "Olympic Torch",
    category: "Sport",
    keywords: ["torch", "flame", "olympic", "fire", "ceremony", "games", "spirit"],
    path: "M10 13l2 8 2-8h-4zm2-11c-2 2-4 4-2 7 1 1 2 2 2 3 0-1 1-2 2-3 2-3 0-5-2-7z",
    viewBox: "0 0 24 24",
  },
  {
    id: "archery-target",
    name: "Arrow Target",
    category: "Sport",
    keywords: ["archery", "target", "bow", "arrow", "precision", "accuracy", "sport"],
    path: "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a6 6 0 106 6 6 6 0 00-6-6zm0 3l-2 3h4l-2-3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "shield-crest-sports",
    name: "Club Emblem",
    category: "Sport",
    keywords: ["club", "emblem", "fc", "team", "league", "crest", "badge", "squad"],
    path: "M12 2L4 5v7c0 5.5 3.8 10 8 11 4.2-1 8-5.5 8-11V5l-8-3zm0 4l4 4-4 4-4-4 4-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "boxing-glove",
    name: "Knockout Power",
    category: "Sport",
    keywords: ["boxing", "glove", "mma", "fighter", "combat", "ring", "power"],
    path: "M12 3a6 6 0 00-6 6v3a4 4 0 004 4h4a4 4 0 004-4V9a6 6 0 00-6-6zm-4 15h8v3H8v-3z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 11. EDUCATION & KNOWLEDGE (10 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "book-open",
    name: "Wisdom Tome",
    category: "Education",
    keywords: ["book", "read", "wisdom", "study", "library", "learn", "course", "pages", "tome"],
    path: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
    viewBox: "0 0 24 24",
  },
  {
    id: "graduation-cap",
    name: "Scholar Mortarboard",
    category: "Education",
    keywords: ["graduation", "cap", "mortarboard", "alumni", "degree", "university", "college", "diploma"],
    path: "M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.8V17c0 3 3.5 5 7 5s7-2 7-5v-4.2l-7 3.8-7-3.8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "lightbulb-idea",
    name: "Genius Filament",
    category: "Education",
    keywords: ["lightbulb", "idea", "smart", "invention", "think", "eureka", "brainstorm", "creativity"],
    path: "M9 21h6v-1H9v1zm3-19a7 7 0 00-7 7c0 2.4 1.2 4.5 3 5.7V17a2 2 0 002 2h4a2 2 0 002-2v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 00-7-7z",
    viewBox: "0 0 24 24",
  },
  {
    id: "atom-nucleus",
    name: "Quantum Nucleus",
    category: "Education",
    keywords: ["atom", "science", "physics", "nucleus", "orbit", "chemistry", "research", "lab"],
    path: "M12 2a10 5 0 00-8.66 7.5A10 5 0 0012 17a10 5 0 008.66-7.5A10 5 0 0012 2zm0 6a4 4 0 100 8 4 4 0 000-8z",
    viewBox: "0 0 24 24",
  },
  {
    id: "school-academy",
    name: "Classic Academy",
    category: "Education",
    keywords: ["school", "academy", "campus", "institution", "faculty", "heritage"],
    path: "M12 2L2 7v2h20V7L12 2zM4 11v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zM2 21h20v2H2v-2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "diploma-scroll",
    name: "Honor Scroll",
    category: "Education",
    keywords: ["diploma", "scroll", "certificate", "honor", "award", "charter", "license"],
    path: "M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-2 10H7v-2h10v2zm0-4H7V8h10v2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "microscope-lab",
    name: "Bio Microscope",
    category: "Education",
    keywords: ["microscope", "lab", "biology", "research", "scientific", "discover", "lens"],
    path: "M9 3h6v2H9V3zm3 4v7m-4 5h8v2H8v-2zm-3-2a7 7 0 0114 0h-2a5 5 0 00-10 0H5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "quill-inkpot",
    name: "Scholar Quill",
    category: "Education",
    keywords: ["quill", "inkpot", "scholar", "ancient", "history", "study", "manuscript"],
    path: "M20 2s-8 4-11 9l-2 8 8-2c5-3 9-11 9-11zm-8 10l-3 3",
    viewBox: "0 0 24 24",
  },
  {
    id: "telescope-stars",
    name: "Astronomy Scope",
    category: "Education",
    keywords: ["telescope", "astronomy", "space", "stars", "cosmos", "observatory", "discover"],
    path: "M10 4l10 5-2 4-10-5 2-4zm-1 8l-4 9h2l3-7m4 7h2l-4-9",
    viewBox: "0 0 24 24",
  },
  {
    id: "open-compass-math",
    name: "Drafting Divider",
    category: "Education",
    keywords: ["drafting", "divider", "math", "geometry", "architecture", "measure", "precision"],
    path: "M12 2a2 2 0 100 4 2 2 0 000-4zm-1 4L4 21h2l5-12 5 12h2L13 6h-2z",
    viewBox: "0 0 24 24",
  },

  // ═════════════════════════════════════════════════════════════════
  // 12. MINIMAL & GEOMETRIC (14 symbols)
  // ═════════════════════════════════════════════════════════════════
  {
    id: "circle-dot",
    name: "Centered Dot",
    category: "Minimal",
    keywords: ["dot", "circle", "minimal", "zen", "target", "focus", "clean", "simple"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 8a2 2 0 100 4 2 2 0 000-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "circle-triple",
    name: "Triple Ring",
    category: "Minimal",
    keywords: ["rings", "triple", "concentric", "ripple", "echo", "minimal", "pure"],
    path: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16zm0 2a6 6 0 100 12 6 6 0 000-12z",
    viewBox: "0 0 24 24",
  },
  {
    id: "square-frame",
    name: "Square Box",
    category: "Minimal",
    keywords: ["square", "box", "frame", "border", "minimalist", "clean", "outline"],
    path: "M4 4h16v16H4V4zm2 2v12h12V6H6z",
    viewBox: "0 0 24 24",
  },
  {
    id: "rule-line",
    name: "Minimal Line",
    category: "Minimal",
    keywords: ["line", "divider", "horizontal", "dash", "pure", "sleek"],
    path: "M3 12h18",
    viewBox: "0 0 24 24",
  },
  {
    id: "arc-mark",
    name: "Geometric Arc",
    category: "Minimal",
    keywords: ["arc", "curve", "smile", "bridge", "dome", "minimal"],
    path: "M4 18A8 8 0 0120 18",
    viewBox: "0 0 24 24",
  },
  {
    id: "hexagon-nested",
    name: "Nested Hexagon",
    category: "Minimal",
    keywords: ["hexagon", "nested", "polygon", "rings", "geometry", "honeycomb"],
    path: "M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 4.5l-4.76 2.75v5.5L12 17.5l4.76-2.75v-5.5L12 6.5z",
    viewBox: "0 0 24 24",
  },
  {
    id: "diamond-outline",
    name: "Rhombus Mark",
    category: "Minimal",
    keywords: ["rhombus", "diamond", "square", "rotate", "outline", "fine"],
    path: "M12 2l9 10-9 10-9-10 9-10zm0 3L5 12l7 7 7-7-7-7z",
    viewBox: "0 0 24 24",
  },
  {
    id: "cross-plus",
    name: "Precision Plus",
    category: "Minimal",
    keywords: ["plus", "cross", "addition", "positive", "swiss", "minimal"],
    path: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "chevron-double",
    name: "Double Chevron",
    category: "Minimal",
    keywords: ["chevron", "arrow", "forward", "shift", "accelerate", "next"],
    path: "M7 6l6 6-6 6M13 6l6 6-6 6",
    viewBox: "0 0 24 24",
  },
  {
    id: "dots-quad",
    name: "Quad Matrix",
    category: "Minimal",
    keywords: ["dots", "quad", "points", "four", "grid", "clean"],
    path: "M6 6a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-12 12a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z",
    viewBox: "0 0 24 24",
  },
  {
    id: "triangle-solid",
    name: "Solid Prism",
    category: "Minimal",
    keywords: ["triangle", "solid", "delta", "trinity", "pyramid", "play"],
    path: "M12 3L2 20h20L12 3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "circle-half",
    name: "Semi Circle",
    category: "Minimal",
    keywords: ["half", "semi", "circle", "moon", "phase", "duality", "balance"],
    path: "M12 2a10 10 0 000 20V2z",
    viewBox: "0 0 24 24",
  },
  {
    id: "parallel-bars",
    name: "Equal Bars",
    category: "Minimal",
    keywords: ["bars", "parallel", "equal", "lines", "harmony", "balance"],
    path: "M4 8h16v3H4V8zm0 5h16v3H4v-3z",
    viewBox: "0 0 24 24",
  },
  {
    id: "asterisk-star",
    name: "Clean Asterisk",
    category: "Minimal",
    keywords: ["asterisk", "star", "cross", "accent", "point", "burst", "flare"],
    path: "M12 2v20m-7.07-2.93l14.14-14.14M2 12h20M4.93 4.93l14.14 14.14",
    viewBox: "0 0 24 24",
  },
];

/**
 * Intelligent fuzzy keyword and category search for icons.
 * Handles synonyms (e.g. searching 'AI' matches 'robot', 'brain', 'chip').
 */
export function searchIcons(
  symbols: LogoSymbol[],
  query: string,
  category: string = "All",
  favoriteIds: string[] = [],
  recentIds: string[] = []
): LogoSymbol[] {
  let list = symbols;

  // Virtual category filters
  if (category === "Favorites") {
    return list.filter((s) => favoriteIds.includes(s.id));
  }
  if (category === "Recent") {
    const map = new Map(list.map((s) => [s.id, s]));
    return recentIds.map((id) => map.get(id)).filter(Boolean) as LogoSymbol[];
  }
  if (category !== "All") {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return list;

  return list.filter((s) => {
    // 1. Direct name match
    if (s.name.toLowerCase().includes(cleanQuery)) return true;
    // 2. Category match
    if (s.category.toLowerCase().includes(cleanQuery)) return true;
    // 3. Keyword / synonym matches
    if (s.keywords && s.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))) return true;
    // 4. Word stem or sub-token match
    const words = cleanQuery.split(/\s+/);
    return words.every(
      (w) =>
        s.name.toLowerCase().includes(w) ||
        s.category.toLowerCase().includes(w) ||
        (s.keywords && s.keywords.some((kw) => kw.toLowerCase().includes(w)))
    );
  });
}
