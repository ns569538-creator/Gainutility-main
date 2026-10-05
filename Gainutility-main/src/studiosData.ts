/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolId } from "./types";

export interface StudioInfo {
  id: string;
  name: string;
  desc: string;
  longDesc: string;
  iconName: string; // Used to pick corresponding Lucide icon dynamically
  tools: ToolId[];
  faqs: { question: string; answer: string }[];
  relatedStudios: string[];
  benefits?: string[];
  useCases?: { title: string; desc: string }[];
}

export interface CollectionInfo {
  id: string;
  name: string;
  desc: string;
  tagline: string;
  tools: ToolId[];
}

export const STUDIOS: StudioInfo[] = [
  {
    id: "json",
    name: "JSON Studio",
    desc: "Format, validate & compare JSON.",
    longDesc: "Format disorganized JSON, run compliance checks against RFC 8259, compress payload size by stripping padding, and explore nested structures with expandable node views. Everything runs in your browser.",
    iconName: "Braces",
    tools: ["json-validator", "json-beautifier", "json-minifier", "json-tree-viewer", "json-compare-diff", "json-to-csv"],
    faqs: [
      {
        question: "Is my JSON structure secure in JSON Studio?",
        answer: "Yes, 100%. All validators, minifiers, and formatter parsing processes execute inside your local browser tab. No payloads are ever dispatched to remote logging layers, ensuring absolute confidentiality."
      },
      {
        question: "Why does standard JSON forbid single quotes and trailing commas?",
        answer: "The official ECMA-404 JSON standard strictly enforces double quotes (\") for enclosing strings and keys, and forbids trailing commas to simplify cross-platform parser grammar and avoid trailing node mismatches."
      },
      {
        question: "What is the difference between JSON beautification and minification?",
        answer: "Beautification adds nested indentation spaces (typically 2 or 4 spaces) and line breaks to maximize readability for humans. Minification strips out all non-essential spacing and comments to minimize data transfer size over API networks."
      },
      {
        question: "Can I parse extremely large JSON dumps in my browser?",
        answer: "Yes. Because validation and tree rendering run entirely on your machine, capacity is bounded by your device's memory rather than a server quota. Very large payloads may take a few seconds to parse and render, but nothing is uploaded."
      },
      {
        question: "How does Compare JSON detect changes?",
        answer: "The diff engine recursively parses both JSON structures into sorted abstract syntax trees, and then compares matching key-value keys, highlighting mutations, added parameters, or deleted rows side-by-side."
      },
      {
        question: "Does the CSV exporter handle nested objects correctly?",
        answer: "Yes, our flattener recurses into deep properties and maps them using standardized dot notation (e.g. 'profile.address.city') to align complex hierarchical objects into standard flat columns."
      }
    ],
    relatedStudios: ["developer", "converter"],
    benefits: [
      "Client-side browser execution — parsed payloads aren't sent to any server.",
      "Strict RFC-8259 compliant parsing with precise line-by-line syntax error tracing.",
      "High-speed tree visualization and differential mutations highlighted in real-time."
    ],
    useCases: [
      {
        title: "Enterprise Payload Formatting",
        desc: "Format and inspect raw production API logs containing customer metrics safely without triggering network leaks."
      },
      {
        title: "Log Trace Mutation Auditing",
        desc: "Compare two API configurations side-by-side to inspect which flags or parameters were modified during production deployments."
      }
    ]
  },
  {
    id: "css",
    name: "CSS Studio",
    desc: "Gradients, shadows & UI generators.",
    longDesc: "Craft multi-stop linear or radial background CSS patterns, configure layered organic border blobs with asymmetrical inputs, and assemble complex box shadows on a real-time render board. Copy finished CSS or Tailwind values directly.",
    iconName: "Paintbrush",
    tools: ["gradient-generator", "box-shadow-generator", "border-radius-generator"],
    faqs: [
      {
        question: "Can I export the gradients or shapes to production directly?",
        answer: "Absolutely. CSS Studio outputs standard, copyable W3C-compliant CSS classes and custom inline properties that you can paste directly into standard stylesheets or apply as inline layout elements."
      },
      {
        question: "What are multi-stop gradients and how are they structured?",
        answer: "Multi-stop gradients blend multiple independent color coordinates across linear angles or radial focal points. The CSS engine outputs sequential color-stop percentages (e.g., '#ef4444 0%, #3b82f6 100%') to control color boundaries."
      },
      {
        question: "How does the Box Shadow builder make shadows look soft and natural?",
        answer: "We support multi-layered shadow compounding. By overlaying multiple low-opacity box-shadow properties with increasing blur radii and offsets, the interface creates a smooth, physical 'ambient occlusion' look."
      },
      {
        question: "Are these CSS rules compliant with legacy web browsers?",
        answer: "Yes, our styles target standard, gainutility W3C specifications. When creating gradients or rounded values, standard CSS classes ensure full native compatibility back to Internet Explorer 11."
      },
      {
        question: "How does the asymmetrical Border Radius generator operate?",
        answer: "It uses the slash syntax in border-radius (e.g., '30% 70% 70% 30% / 50% 60% 40% 50%'). This enables the horizontal and vertical radii of individual corners to scale independently, creating fluid, organic, blob-like designs."
      },
      {
        question: "Is there support for Tailwind CSS utility class exports?",
        answer: "Yes, our visual generators output both standard raw CSS classes and corresponding Tailwind configuration theme offsets you can paste straight into tailwind.config.js files."
      }
    ],
    relatedStudios: ["color", "creator"],
    benefits: [
      "Instant copyable CSS and Tailwind properties with real-time preview boards.",
      "Fluid border-radius modifiers enabling organic custom blobs for visual designs.",
      "Multi-layered ambient drop shadow compounders for modern editorial mockups."
    ],
    useCases: [
      {
        title: "Prototyping Landing Page Gradients",
        desc: "Visual design of multi-stop ambient backgrounds and hero panels, exporting clean variables directly to stylesheets."
      },
      {
        title: "Fluid Component Corner Blob Styling",
        desc: "Creating irregular rounded avatars or decoration elements to give static branding interfaces an organic editorial feel."
      }
    ]
  },
  {
    id: "color",
    name: "Color Studio",
    desc: "Contrast, accessibility, scales & palettes.",
    longDesc: "A visual inspection toolkit centered on semantic accessibility and readability. Validate background and text pairings against WCAG 2.1 AA & AAA parameters, generate complete design-system color scales from a single color using OKLCH perceptual color science, simulate color vision deficiencies like Deuteranopia or Tritanopia, and correct color values automatically.",
    iconName: "Palette",
    tools: ["contrast-checker", "color-palette-generator", "color-picker", "color-explorer", "color-visualizer", "image-to-palette"],
    faqs: [
      {
        question: "What is WCAG AA and AAA compliance?",
        answer: "WCAG AA requires a minimum color contrast ratio of 4.5:1 for body copy and 3:1 for large display elements. WCAG AAA elevates these requirements to 7:1 for text to support users with severe low vision impairments."
      },
      {
        question: "Why should designers simulate color blindness on their interfaces?",
        answer: "Over 8% of males and 0.5% of females experience color vision deficiencies. Simulating spectrums like Deuteranopia ensures critical information (like success states or charts) remains legible."
      },
      {
        question: "How is relative luminance calculated in the WCAG standard?",
        answer: "Relative luminance is calculated as the relative brightness of any point in a color space, normalized of sRGB values. It weighs green most heavily, followed by red and blue, mimicking human ocular perception."
      },
      {
        question: "Does the Color Studio support sRGB and OKLCH scales?",
        answer: "Yes, you can toggle between standard sRGB hex codes, RGB percentages, and the perceptually uniform OKLCH spaces which keep brightness curves consistent across distinct hues."
      },
      {
        question: "How does the Suggest Accessible Color feature function?",
        answer: "If your color combination fails the contrast audit, our algorithm incrementally lightens or darkens your text color value, using a binary search pattern, until it finds the closest shade satisfying the 4.5:1 ratio."
      },
      {
        question: "Can I inspect the contrast of non-text UI elements?",
        answer: "Yes, WCAG 2.1 introduces a 3:1 contrast requirement for user interface components like input borders, checkbox states, and interactive graphics. Our tools check these metrics automatically."
      }
    ],
    relatedStudios: ["css", "image"],
    benefits: [
      "Strict compliance auditing following official WCAG 2.1 relative luminance ratios.",
      "Live filters simulating Deuteranopia, Protanopia, Tritanopia, and complete achromatopsia.",
      "One-click smart accessible suggestions generating the nearest compliant hexadecimal value."
    ],
    useCases: [
      {
        title: "Design System Accessibility Audit",
        desc: "Validating primary, secondary, and accent color pairs to compile standard design token compliant sheets."
      },
      {
        title: "Contrast Fixes for User Interfaces",
        desc: "Solving readable text issues in dashboard indicators, alert boxes, and secondary buttons with instant suggested shade shifts."
      }
    ]
  },
  {
    id: "developer",
    name: "Developer Studio",
    desc: "Encoding, QR codes & developer utilities.",
    longDesc: "An array of vital developer operations. Escape special entities to prevent cross-site scripting vulnerabilities, format compliant percent-encoded URLs, construct durable QR codes with logo overlays, and convert raw text strings into binary-safe Base64 symbols.",
    iconName: "Code2",
    tools: [
      "qr-code-generator", "url-encoder-decoder", "html-entity-encoder", "base64-tool",
      "uuid-generator", "jwt-decoder", "password-generator", "password-strength-checker", "hash-generator",
      "regex-tester", "unix-timestamp-converter", "cron-expression-builder", "text-diff-checker",
      "json-schema-validator", "jsonpath-tester", "csv-json-converter", "xml-json-converter",
      "sql-formatter", "yaml-formatter", "http-status-code-lookup", "mime-type-lookup",
      "url-parser", "image-metadata-remover",
      "csv-reconciliation", "excel-formula-generator", "billable-hours-calculator", "invoice-follow-up-tracker", "font-detector"
    ],
    faqs: [
      {
        question: "What is the security advantage of using your encoding tools?",
        answer: "XSS prevention depends on clean output context escaping. Converting risky characters like '<' or '>' to HTML entities guarantees browsers interpret them as inert layout elements rather than active execution scripts."
      },
      {
        question: "Why should developers encode URL parameters?",
        answer: "URLs can only transit standard ASCII characters. Percent-encoding translates space bars to '%20' and query characters to hex bytes, ensuring search engines and routing APIs parse them safely."
      },
      {
        question: "Does the Base64 encoder handle international UTF-8 character sets?",
        answer: "Yes. Our encoders convert Unicode text into byte arrays via TextEncoder prior to packing them into 6-bit Base64 symbols, preserving accents, Cyrillic, and emojis."
      },
      {
        question: "What is the error correction level on generated QR codes?",
        answer: "We support Low, Medium, Quartile, and High error correction levels (up to 30% damage recovery). Higher levels allow you to overlay custom branding logos inside the center of the QR matrix."
      },
      {
        question: "How does the local JWT decoder inspect token credentials?",
        answer: "JWT tokens consist of Base64Url-encoded header, payload, and signature segments. We split these segments and decode them locally without contacting any backend, protecting your identity claims."
      },
      {
        question: "Why is the UUID generator safe to use for database keys?",
        answer: "We use standard cryptographic random numbers (crypto.getRandomValues) to seed the 128-bit UUID v4 sequence, guaranteeing extreme collision safety for database indices."
      }
    ],
    relatedStudios: ["json", "security", "converter"],
    benefits: [
      "Secure client-side cryptography protecting sensitive corporate tokens and hashes.",
      "High-contrast vector QR code generator with logo overlays and damage correction levels.",
      "Automated format detection and side-by-side comparative text difference highlights."
    ],
    useCases: [
      {
        title: "Percent-Encoding Parameter Deliveries",
        desc: "Sanitizing tracking arrays or redirect query parameters to protect system URLs from parser breakdowns."
      },
      {
        title: "Secure offline Credential Hashing",
        desc: "Generating high-entropy system passwords and creating SHA-256 binary validation strings securely client-side."
      }
    ]
  },
  {
    id: "image",
    name: "Image Studio",
    desc: "Compress, resize & convert images.",
    longDesc: "A browser-side picture workspace. Resize visual elements, compress JPEG or PNG payloads without backend uploads, apply layout aspect overlays, and perform quick graphic crops with instant visual preview boards.",
    iconName: "Image",
    tools: [
      "image-resizer", 
      "image-cropper", 
      "image-converter", 
      "image-watermark", 
      "image-blur-pixelate",
      "social-resizer",
      "favicon-generator",
      "logo-maker",
      "collage-maker",
      "background-remover",
      "passport-photo-maker",
      "image-upscaler",
      "signature-maker"
    ],
    faqs: [
      {
        question: "How does the Image Compressor compress pictures locally?",
        answer: "The compressor uses modern HTML5 Canvas rendering APIs along with browser canvas-to-blob capabilities to resample and re-encode images in formats like JPEG, PNG, or WebP. This preserves pixel depth while providing optimal footprint reduction entirely inside your local browser tab."
      },
      {
        question: "Is my personal photo library protected?",
        answer: "Completely. Because there is no backend web server, no image you drop is ever dispatched to remote logging or storage nodes. Every pixel resizes, crops, and blurs directly on your local CPU."
      },
      {
        question: "How much image file weight can I save by converting to WebP?",
        answer: "WebP lossy compression typically yields 25% to 34% smaller file sizes than traditional JPEGs, and lossless WebP is 26% smaller than PNGs while preserving transparent alpha channels."
      },
      {
        question: "Can I batch crop or watermark multiple photos simultaneously?",
        answer: "Yes, our Image Studio supports batch queues. You can define a standard watermark text overlay or brand logo, adjust the opacity, and export the entire processed set in a single action."
      },
      {
        question: "How does the Blur and Pixelate brush censor sensitive data?",
        answer: "The brush reads the pixel coordinate data on a Canvas overlay and applies a local Gaussian blur algorithm or snaps local block coordinates to pixelated boundaries, destroying legible shapes offline."
      },
      {
        question: "Why should I strip metadata or EXIF logs from my uploaded photos?",
        answer: "EXIF parameters contain precise GPS coordinates, device timestamps, and camera models. Stripping these parameters prior to web publishing prevents stalkers or crawlers from harvesting location history."
      }
    ],
    relatedStudios: ["css", "creator"],
    benefits: [
      "Fast browser-side resampling that eliminates heavy server uploads and queues.",
      "Stripping of EXIF GPS coordinates and private device metadata for optimal privacy.",
      "Custom pixel censors and custom alpha-transparency WebP converters."
    ],
    useCases: [
      {
        title: "Pre-Publishing Blog Optimization",
        desc: "Batch scaling high-resolution designer screenshots down and converting them to WebP format to accelerate webpage loading."
      },
      {
        title: "Securing Screenshot Sharing",
        desc: "Stripping geo-coordinates from screenshots and blurring sensitive financial tables before publishing online."
      }
    ]
  },
  {
    id: "pdf",
    name: "PDF Studio",
    desc: "Merge, split & optimize PDFs.",
    longDesc: "A complete offline suite of PDF tools. Merge separate documents, split pages, compress metadata footprints, extract sections, discard unnecessary sheets, rearrange pages, and add password locks with zero server uploads.",
    iconName: "FileStack",
    tools: [
      "merge-pdf", "split-pdf", "rotate-pdf", "jpg-to-pdf", "pdf-to-jpg", "extract-pdf", "delete-pdf", "rearrange-pdf", "protect-pdf",
      "unlock-pdf", "remove-pdf-password", "add-pdf-watermark", "flatten-pdf",
      "add-pdf-page-numbers", "add-pdf-header-footer", "crop-pdf", "duplicate-page-finder-pdf", "remove-blank-pages-pdf", "reverse-page-order-pdf", "extract-odd-pages-pdf", "extract-even-pages-pdf",
      "word-to-pdf", "pdf-to-word", "excel-to-pdf", "pdf-to-excel", "powerpoint-to-pdf", "pdf-to-powerpoint", "html-to-pdf", "pdf-to-text", "text-to-pdf", "pdf-to-html", "pdf-translator",
      "remove-pdf-metadata", "repair-pdf", "validate-pdf", "optimize-pdf-web", "reduce-pdf-image-quality", "compress-images-inside-pdf",
      "ocr-pdf", "compare-two-pdfs", "split-by-file-size", "split-every-n-pages",
      "pdf-difference-checker", "business-pdf-extractor"
    ],
    faqs: [
      {
        question: "Is PDF processing safe for sensitive invoices and contracts?",
        answer: "Absolutely. Standard online converters transmit your files to cloud servers. Our premium PDF Studio processes your files entirely inside your browser sandbox via client-side JavaScript, meaning your sensitive documents never leave your computer."
      },
      {
        question: "What limits are there on file sizes?",
        answer: "Since all actions run in your browser, there are no artificial limits. It depends solely on your computer's memory. Large PDFs over 100MB are supported comfortably."
      },
      {
        question: "Does local PDF compression reduce text or chart crispness?",
        answer: "Our optimizer reduces file weight primarily by down-sampling heavy embedded graphic assets and stripping unneeded structural metadata logs while keeping fonts and vector vectors perfectly sharp."
      },
      {
        question: "How does the client-side PDF password locker encrypt files?",
        answer: "It uses secure local cryptography to apply standard 128-bit RC4 or 256-bit AES encryption layers, embedding the pass-key directly in the document file metadata without communicating with a server."
      },
      {
        question: "Can I split a single giant manual into separate page ranges?",
        answer: "Yes, you can upload a multi-page PDF document and input precise page targets (e.g., '1-5, 8, 12-15') to extract specific sheets or split them into separate files."
      },
      {
        question: "Is there support for adding watermark layers or page numbering?",
        answer: "Yes, you can compound custom page stamps, headers, footers, and semi-transparent copyright watermarks across all pages completely offline with real-time preview thumbnails."
      }
    ],
    relatedStudios: ["developer", "seo"],
    benefits: [
      "Zero-server document safety ensuring sensitive billing or contracts remain private.",
      "Merging, splitting, and reordering pages — no payment limits.",
      "Offline cryptographically applied 256-bit AES password security and watermarks."
    ],
    useCases: [
      {
        title: "Enterprise Invoice Bundling",
        desc: "Consolidating 40 individual billing records and financial reports into a single compiled document for financial auditors."
      },
      {
        title: "Locking Contract Agreements Safely",
        desc: "Encrypting strategic client pitch documents with individual passwords offline prior to emailing them."
      }
    ]
  },
  {
    id: "seo",
    name: "SEO Studio",
    desc: "Metadata, sitemaps & structured data.",
    longDesc: "Inspect canonical tags, metadata length limits, Open Graph schemas, and sitemap structure, and see what's missing or out of spec on each page.",
    iconName: "ChartNoAxesCombined",
    tools: [
      "seo-meta-generator", 
      "og-meta-generator", 
      "twitter-card-generator", 
      "robots-txt-generator", 
      "xml-sitemap-generator", 
      "schema-markup-generator", 
      "utm-builder", 
      "canonical-url-generator", 
      "hreflang-tag-generator", 
      "google-serp-preview",
      "slug-generator",
      "check-my-website",
      "launch-checklist"
    ],
    faqs: [
      {
        question: "Why does metadata length matter for search ranking?",
        answer: "Search engines truncate snippet titles beyond 60 characters and descriptions beyond 160 characters. Keeping text within boundaries prevents ellipsis cutting on search result pages."
      },
      {
        question: "What is the purpose of a canonical URL generator?",
        answer: "It creates a unique tag pointing search engines to the authoritative page version. This prevents duplicate index penalties caused by separate parameter tracking codes."
      },
      {
        question: "How does the schema markup generator improve rich search results?",
        answer: "It compiles JSON-LD structured data that search crawlers parse to display star ratings, products, reviews, and interactive FAQ questions directly on SERP boards."
      },
      {
        question: "Why is robots.txt configuration critical for crawl budgets?",
        answer: "It instructs search bots which internal paths to bypass (like temporary dashboards), conserving your crawl allocation for primary landing resources."
      },
      {
        question: "Does the slug generator support international Unicode characters?",
        answer: "Yes, our generator translates accented characters, Cyrillic, and Asian symbols into standard, lowercase, URL-friendly alphanumeric slashes cleanly."
      },
      {
        question: "What are hreflang signals and how are they used?",
        answer: "Hreflang tags advise search engines of region-specific versions of a page, serving the French layout to users in France and English to users in the US."
      }
    ],
    relatedStudios: ["developer"],
    benefits: [
      "Real-time SERP snippet checkers tracking precise pixel widths for search views.",
      "Structured JSON-LD schema builder outputting error-free structural listings.",
      "Safe UTM campaign URL generators preventing search indexing on tracking variants."
    ],
    useCases: [
      {
        title: "Rich Snippet Optimization",
        desc: "Generating structural WebSite and FAQPage schema data markup to qualify for interactive search enhancements."
      },
      {
        title: "Social Card Configuration Auditing",
        desc: "Drafting optimized Open Graph meta tags and Twitter summaries to guarantee professional preview cards on messaging boards."
      }
    ]
  },
  {
    id: "security",
    name: "Security Studio",
    desc: "Hashing, escaping & security utilities.",
    longDesc: "Audit security envelopes with developer-grade tools that run entirely offline. Inspect raw token claims, sanitize hazardous inputs, escape scripts to prevent injection attacks, and evaluate cryptographic hashes.",
    iconName: "ShieldCheck",
    tools: [
      "password-generator",
      "password-strength-checker",
      "hash-generator",
      "html-entity-encoder",
      "uuid-generator",
      "jwt-decoder"
    ],
    faqs: [
      {
        question: "How does local escaping prevent database cross-site injections?",
        answer: "By replacing hazardous markdown or script elements with inert, safe entities before storing them in database records, rendering panels will only print the literal characters rather than compiling them as browser scripts."
      },
      {
        question: "What makes local password generators more secure than online ones?",
        answer: "Online generators send generated keys over HTTPS networks, exposing them to server logs or transit eavesdropping. Our tool creates keys directly in browser memory."
      },
      {
        question: "How does relative entropy evaluate password strength?",
        answer: "Entropy evaluates password unpredictability in bits. Standard alphanumeric codes with mixed symbols scale up entropy, requiring exponentially higher brute-force computations."
      },
      {
        question: "Are UUID identities predictable?",
        answer: "UUID v4 generates 122 bits of clean random entropy. Under modern browser cryptographic random sources, the probability of duplicate collisions is practically zero."
      },
      {
        question: "Can I inspect the claims of signed JWT credentials without a signature key?",
        answer: "Yes. JWT signatures verify integrity, but the header and payload segments are standard Base64Url-encoded strings. You can decode and read them safely."
      },
      {
        question: "Does the Security Studio support bcrypt or argon2 hashing?",
        answer: "Hash Generator uses your browser's native WebCrypto engine, supporting SHA-1, SHA-256, SHA-384, and SHA-512 digests. bcrypt and argon2 are password-storage algorithms and are not part of the browser's built-in crypto suite."
      }
    ],
    relatedStudios: ["developer", "json"],
    benefits: [
      "100% offline security audits ensuring sensitive user credentials remain private.",
      "High-entropy secure password generators fueled by native crypto.getRandomValues.",
      "HTML entity escapers neutralizing script vectors before database insertions."
    ],
    useCases: [
      {
        title: "Local UUID Generation for Database Seeding",
        desc: "Generating dozens of high-entropy UUID v4 identifiers securely offline to seed production tables."
      },
      {
        title: "JWT Token Header Inspection",
        desc: "Decoding strategic payload claims from authorization header strings locally to debug token expirations."
      }
    ]
  },
  {
    id: "creator",
    name: "Creator Studio",
    desc: "YouTube & creator optimization tools.",
    longDesc: "A visual workspace for online video publishers. Audit keyword search trends, analyze title lengths, overlay thumbnail safe zones, and compile consistent descriptions — all in your browser.",
    iconName: "Video",
    tools: [
      "linkedin-carousel-maker",
      "youtube-thumbnail-preview",
      "youtube-title-analyzer",
      "youtube-timestamp-formatter",
      "youtube-chapter-generator",
      "youtube-embed-generator",
      "youtube-url-toolkit",
      "thumbnail-safe-zone",
      "youtube-description-formatter",
      "youtube-keyword-explorer",
      "slug-generator"
    ],
    faqs: [
      {
        question: "Why are thumbnail safe zones critical for mobile viewing?",
        answer: "YouTube overlays a dark duration badge in the bottom-right corner of video thumbnails. Ensuring critical text, branding, or faces stay out of this zone prevents them from being blocked."
      },
      {
        question: "How does the Description Formatter increase SEO relevancy?",
        answer: "It structures description copy into scannable chunks: above-the-fold call to actions, timestamps for chapters, social credits, and relevant tagging systems, which search bots parse for indexation."
      },
      {
        question: "What is a thumbnail safe zone check?",
        answer: "It simulates how thumbnails display across diverse devices (desktop, mobile feed, sidebar) and checks if badges block critical graphic areas."
      },
      {
        question: "Where do YouTube keyword suggestions come from?",
        answer: "The Keyword Explorer builds suggestion ideas locally from your seed term using proven query patterns and scores each variation for length and semantic focus. It does not pull live search-volume data from YouTube."
      },
      {
        question: "Does the Title Analyzer evaluate click-through optimization?",
        answer: "It audits titles against characters counts (ideal is 50-60), sentiment flags, and readability indexes to make titles stand out in crowded feeds."
      },
      {
        question: "Can I persist my publishing progress checklists?",
        answer: "Absolutely, our checklist tool uses browser localStorage, saving your pre-flight checklist status automatically between tabs."
      }
    ],
    relatedStudios: ["css", "seo"],
    benefits: [
      "Mobile safe zone overlay checks protecting branding from being blocked.",
      "Description templates that structure CTAs, links, and video chapters.",
      "Sentiment and length audits for titles ensuring high click-through potential."
    ],
    useCases: [
      {
        title: "Pre-Flight Video Publishing Checklist",
        desc: "Checking metadata, links, hashtags, and visual areas before uploading video projects to guarantee perfect indexing."
      },
      {
        title: "Keyword Trend Selection",
        desc: "Compiling related search queries to inject into tags and paragraphs, maximizing search discovery ranking."
      }
    ]
  },
  {
    id: "converter",
    name: "Converter Studio",
    desc: "Convert text, data & formats.",
    longDesc: "Accelerate data migration and pipeline formatting. Flatten hierarchical JSON arrays to clean, downloadable spreadsheet-ready CSV tables, convert binary string representations to Base64 schemas, and translate encoded URL queries.",
    iconName: "ArrowLeftRight",
    tools: [
      "json-to-csv",
      "base64-tool",
      "url-encoder-decoder",
      "csv-json-converter",
      "xml-json-converter",
      "unix-timestamp-converter"
    ],
    faqs: [
      {
        question: "How are nested objects handled during CSV flattening?",
        answer: "Nested dictionary keys are recursively concatenated using standard dot separators (e.g. 'user.address.zip') to align nested dimensions into flat columns."
      },
      {
        question: "Is data conversion safe for private company spreadsheets?",
        answer: "100%. Traditional converters send files to remote servers, risking data leaks. Our Converter Studio operates completely within your browser, ensuring no file leaves your device."
      },
      {
        question: "Can I convert Base64 strings directly back to original text?",
        answer: "Yes, the Base64 utility is bi-directional. You can encode raw Unicode strings or decode Base64 strings with full UTF-8 character integrity."
      },
      {
        question: "Does the URL Decoder handle special symbols?",
        answer: "Yes, it fully decodes percent-encoded bytes (like '%20' for spaces, '%26' for ampersands, or multi-byte emoji sequences) back to standard UTF-8 characters."
      },
      {
        question: "What is the limit on CSV export file rows?",
        answer: "There are no server limits. It handles thousands of rows, exporting clean RFC-compliant CSVs matching Excel and Google Sheets specs."
      },
      {
        question: "Does the Converter Studio preserve data types during conversion?",
        answer: "Yes, booleans, nulls, numbers, and strings are parsed and formatted to preserve correct data representation in outputs."
      }
    ],
    relatedStudios: ["json", "developer"],
    benefits: [
      "Offline schema migrations avoiding database credential exposures.",
      "Recursive nested arrays flattened into tidy columns automatically.",
      "Clean bi-directional encoding supporting Unicode and emojis."
    ],
    useCases: [
      {
        title: "Exporting Database Logs to Spreadsheets",
        desc: "Converting nested JSON response arrays into standardized CSV formats for business analytics tools."
      },
      {
        title: "Decoding Encoded Query Strings",
        desc: "Decoding nested tracking parameters from log structures back into legible text for developer audits."
      }
    ]
  },
  {
    id: "exam",
    name: "Exam & Application",
    desc: "Photo, signature & file fixers for applications.",
    longDesc: "Prepare your application and examination files so they upload cleanly the first time. Check and fix your photo, signature and thumb impression to the exact KB and pixel requirements, compress a handwritten declaration or PDF to the size limit, and download everything ready to submit — all processed privately on your device.",
    iconName: "ClipboardCheck",
    tools: [
      "application-file-checker",
      "exam-photo-fixer",
      "exam-signature-fixer",
      "exam-thumb-fixer",
      "declaration-fixer",
      "pdf-exact-size",
      "exam-file-requirements"
    ],
    faqs: [
      {
        question: "Are my photo and signature files uploaded anywhere?",
        answer: "No. Every tool in this studio processes your files entirely inside your browser using the Canvas API. Nothing is sent to a server, so we never see your photo, signature or documents."
      },
      {
        question: "Where do the file requirements come from?",
        answer: "Each requirement is tied to an official notification or application guideline with a verification date. Every value is flagged as verified, needs-review (unverified — please confirm), or outdated, and we never hide uncertainty."
      },
      {
        question: "What if my exam or portal isn't listed?",
        answer: "Use the Custom option inside a fixer to enter your own size, dimensions and format, or use the Declaration and PDF tools with your own target. Confirm those values against your own official instructions."
      },
      {
        question: "Will the file definitely be accepted?",
        answer: "No tool can guarantee acceptance. These files match the technical requirements recorded from the selected official source; final acceptance is determined by the application portal, which you should verify before final submission."
      }
    ],
    relatedStudios: ["image", "pdf"],
    benefits: [
      "100% client-side processing — your documents never leave your device.",
      "Every requirement tied to an official source with a clear verification status.",
      "Iterative compression that keeps the best readable quality that fits the size limit."
    ],
    useCases: [
      {
        title: "Pre-Upload Application Prep",
        desc: "Bring your photo, signature and thumb impression to the exact size and dimensions before opening the application portal."
      },
      {
        title: "Fixing a Rejected Upload",
        desc: "A portal rejected your photo for size — upload it and fix it to the recorded limit, then re-attach."
      }
    ]
  }
];

export const COLLECTIONS: CollectionInfo[] = [
  {
    id: "developer-kit",
    name: "Developer Kit",
    tagline: "Essential tools for every developer.",
    desc: "JSON formatting, Base64 encoding, URL encoding, and HTML entity escaping — all in one place.",
    tools: ["json-beautifier", "json-validator", "json-minifier", "base64-tool", "url-encoder-decoder", "html-entity-encoder", "regex-tester", "hash-generator"]
  },
  {
    id: "design-kit",
    name: "Design Kit",
    tagline: "Visual tools for designers and front-end developers.",
    desc: "CSS gradients, box shadows, border radius, color palettes, and contrast checking.",
    tools: ["gradient-generator", "box-shadow-generator", "border-radius-generator", "contrast-checker"]
  },
  {
    id: "file-kit",
    name: "File Kit",
    tagline: "PDF, image, and document tools.",
    desc: "Merge PDFs, compress images, convert formats, and manage files — all processed locally.",
    tools: ["merge-pdf", "compress-images-inside-pdf", "split-pdf", "image-converter", "image-resizer", "image-cropper"]
  },
  {
    id: "utility-kit",
    name: "Utility Kit",
    tagline: "Quick everyday tools.",
    desc: "QR codes, text tools, number converters, and encoding utilities for everyday tasks.",
    tools: ["qr-code-generator", "json-to-csv", "unix-timestamp-converter", "uuid-generator", "slug-generator"]
  },
  {
    id: "recently-added",
    name: "Recently Added",
    tagline: "Latest additions to the toolkit.",
    desc: "New tools just added: JSON diff checker, JSON to CSV converter, CSS box shadow generator, and border radius generator.",
    tools: ["json-compare-diff", "json-to-csv", "box-shadow-generator", "border-radius-generator"]
  },
  {
    id: "beginner-friendly",
    name: "Beginner Friendly",
    tagline: "Easy to use, no experience needed.",
    desc: "Simple tools that work right away: QR code generator, CSS gradient maker, and border radius creator.",
    tools: ["qr-code-generator", "gradient-generator", "border-radius-generator"]
  },
  {
    id: "frontend-toolkit",
    name: "Frontend Toolkit",
    tagline: "Visual tools for front-end work.",
    desc: "CSS gradients, box shadows, contrast checking, color scales, and design tokens for front-end developers.",
    tools: ["gradient-generator", "contrast-checker", "box-shadow-generator", "border-radius-generator"]
  }
];
