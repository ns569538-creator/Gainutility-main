import { ToolId } from "../types";

/* ------------------------------------------------------------------ */
/* Comparison page data — tool-vs-tool and category "best" pages       */
/* ------------------------------------------------------------------ */

export interface ComparisonTool {
  id: ToolId;
  name: string;
  description: string;
  bestFor: string;
  pros: string[];
  toolPath: string;
}

export interface ComparisonFeature {
  label: string;
  toolA: string;
  toolB: string;
}

export interface ComparisonPageEntry {
  slug: string;
  path: string;
  title: string;
  description: string;
  toolA: ComparisonTool;
  toolB: ComparisonTool;
  intro: string;
  comparisonTable: ComparisonFeature[];
  decisionA: string;
  decisionB: string;
  faq: { question: string; answer: string }[];
  breadcrumbs: { name: string; url: string }[];
  keywords: string[];
}

export interface CategoryBestEntry {
  slug: string;
  path: string;
  title: string;
  description: string;
  category: string;
  categoryPath: string;
  intro: string;
  tools: { id: ToolId; name: string; rank: number; description: string; bestFor: string }[];
  /**
   * How-to guides that match this category's tools, rendered after the ranked
   * list. Every `path` must be a real route; blog targets are additionally
   * locale-gated at render time (`hasLocalizedArticle`), so a localized page
   * never links at an article that was not translated for that locale.
   */
  guides?: { heading?: string; items: { path: string; title: string; desc: string }[] };
  faq: { question: string; answer: string }[];
  breadcrumbs: { name: string; url: string }[];
  keywords: string[];
}

/* ------------------------------------------------------------------ */
/* Tool-vs-Tool Comparisons                                            */
/* ------------------------------------------------------------------ */

export const COMPARISON_PAGES: ComparisonPageEntry[] = [
  {
    slug: "merge-vs-split-pdf",
    path: "/compare/merge-vs-split-pdf",
    title: "Merge PDF vs Split PDF — Which Do You Need? | GainUtility",
    description: "Compare Merge PDF and Split PDF tools. Learn when to combine multiple PDFs into one file vs extracting specific pages. Free, private, browser-based.",
    toolA: {
      id: "merge-pdf",
      name: "Merge PDF",
      description: "Combine multiple PDF files into a single document",
      bestFor: "Combining contracts, assembling reports, joining scanned pages",
      pros: ["Drag-and-drop reordering", "Unlimited file count", "Preserves original quality"],
      toolPath: "/tools/merge-pdf",
    },
    toolB: {
      id: "split-pdf",
      name: "Split PDF",
      description: "Extract specific pages or ranges from a PDF",
      bestFor: "Extracting chapters, separating signed pages, splitting by file size",
      pros: ["Page range extraction", "Split by file size", "Odd/even page separation"],
      toolPath: "/tools/split-pdf",
    },
    intro: "Both Merge PDF and Split PDF are essential PDF management tools, but they serve opposite purposes. Merge PDF combines multiple files into one, while Split PDF extracts pages from an existing document. Understanding when to use each saves time and ensures your PDFs are organized correctly.",
    comparisonTable: [
      { label: "Primary function", toolA: "Combine multiple PDFs into one file", toolB: "Extract pages from a single PDF" },
      { label: "Input files", toolA: "Multiple PDF files", toolB: "One PDF file" },
      { label: "Output files", toolA: "Single merged PDF", toolB: "One or more PDF files" },
      { label: "Reordering", toolA: "Drag-and-drop page reordering before merge", toolB: "Page range selection" },
      { label: "Page selection", toolA: "All pages from each file", toolB: "Specific pages or ranges" },
      { label: "Batch support", toolA: "Merge 20+ files at once", toolB: "Process one file at a time" },
      { label: "File size handling", toolA: "Output grows with total input", toolB: "Split by file size limit" },
    ],
    decisionA: "Use Merge PDF when you have multiple separate PDF documents that need to become one — like combining signed contract pages, assembling a report from multiple sections, or joining individually scanned pages into a single document.",
    decisionB: "Use Split PDF when you have one large PDF and need to pull out specific pages — like extracting a chapter from a manual, separating the signature page from a contract, or dividing a large file into smaller pieces for email.",
    faq: [
      { question: "Can I merge PDFs and then split the result?", answer: "Yes. A common workflow is to merge multiple PDFs into one, then split out only the pages you need. Both tools work entirely in your browser with no uploads." },
      { question: "Which tool should I use for a 50-page PDF where I need pages 10-20?", answer: "Use Split PDF. It lets you specify exact page ranges to extract, giving you just the 11 pages you need from the larger document." },
      { question: "Do both tools preserve PDF quality?", answer: "Yes. Both Merge PDF and Split PDF preserve the original quality, formatting, images, and fonts of all pages. No compression or quality loss occurs." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: "/pdf" },
      { name: "Merge vs Split PDF", url: "/compare/merge-vs-split-pdf" },
    ],
    keywords: ["merge pdf vs split pdf", "combine pdf or extract pages", "pdf merge compare", "pdf split compare"],
  },

  {
    slug: "compress-vs-optimize-pdf",
    path: "/compare/compress-vs-optimize-pdf",
    title: "Compress vs Optimize PDF — What's Different? | GainUtility",
    description: "Compare Compress PDF and Optimize PDF tools. Understand when to reduce file size vs optimizing for web. Free, private, browser-based.",
    toolA: {
      id: "compress-images-inside-pdf",
      name: "Compress Images Inside PDF",
      description: "Shrink a PDF by compressing the embedded images",
      bestFor: "Image-heavy PDFs, email attachments, upload limits",
      pros: ["Per-page image quality control", "30-70% size reduction", "Keeps text fully sharp"],
      toolPath: "/tools/compress-images-inside-pdf",
    },
    toolB: {
      id: "optimize-pdf-web",
      name: "Optimize PDF",
      description: "Optimize PDF for web delivery and fast loading",
      bestFor: "Web publishing, document sharing, performance optimization",
      pros: ["Web-optimized output", "Font subsetting", "Metadata cleanup"],
      toolPath: "/tools/optimize-pdf-web",
    },
    intro: "Compress the images inside a PDF and Optimize PDF both reduce file size, but they target different use cases. Compressing the embedded images focuses on maximum size reduction for sharing, while Optimize PDF is tuned for web delivery with proper font handling and metadata cleanup.",
    comparisonTable: [
      { label: "Primary goal", toolA: "Maximum file size reduction", toolB: "Web-ready optimized PDF" },
      { label: "Compression levels", toolA: "Per-page image quality settings", toolB: "Automatic optimization" },
      { label: "Font handling", toolA: "Recompresses images only", toolB: "Font subsetting included" },
      { label: "Metadata", toolA: "Preserved", toolB: "Cleaned and minimized" },
      { label: "Best for", toolA: "Email and uploads", toolB: "Web publishing" },
      { label: "Output quality", toolA: "Depends on chosen image quality", toolB: "Optimized for screen viewing" },
    ],
    decisionA: "Choose image compression when you need to quickly shrink an image-heavy PDF for email attachments, file upload limits, or to save storage space. Pick the per-page trade-off between size and quality.",
    decisionB: "Use Optimize PDF when you're publishing a PDF on a website or need it to load quickly in a browser. It handles fonts, metadata, and structure for the best web experience.",
    faq: [
      { question: "Can I use both tools on the same PDF?", answer: "You can, but it's usually unnecessary. Optimize PDF already includes image recompression. If you need further size reduction after optimizing, then compress the images inside the PDF." },
      { question: "Which tool gives a smaller file?", answer: "Compressing the images with high-quality settings typically produces smaller files. Optimize PDF prioritizes web compatibility and rendering quality over maximum compression." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: "/pdf" },
      { name: "Compress vs Optimize PDF", url: "/compare/compress-vs-optimize-pdf" },
    ],
    keywords: ["compress pdf vs optimize pdf", "pdf compression comparison", "reduce pdf size vs optimize pdf"],
  },

  {
    slug: "json-formatter-vs-minifier",
    path: "/compare/json-formatter-vs-minifier",
    title: "JSON Formatter or Minifier — Format or Compact | GainUtility",
    description: "Compare JSON Formatter and JSON Minifier. Learn when to beautify JSON for reading vs minify it for transfer. Free, private, browser-based.",
    toolA: {
      id: "json-beautifier",
      name: "JSON Beautifier",
      description: "Beautify and format JSON with syntax highlighting",
      bestFor: "Debugging API responses, reviewing config files, code review",
      pros: ["Syntax highlighting", "Custom indentation", "Error detection"],
      toolPath: "/tools/json-beautifier",
    },
    toolB: {
      id: "json-minifier",
      name: "JSON Minifier",
      description: "Remove whitespace and compress JSON to minimum size",
      bestFor: "Production payloads, API transfer, reducing bandwidth",
      pros: ["Maximum compression", "Preserves data", "Fast processing"],
      toolPath: "/tools/json-minifier",
    },
    intro: "JSON Formatter and JSON Minifier are complementary tools that transform JSON in opposite directions. Formatter adds whitespace and indentation for human readability, while Minifier strips all unnecessary characters for compact transfer.",
    comparisonTable: [
      { label: "Action", toolA: "Adds indentation and line breaks", toolB: "Removes all whitespace" },
      { label: "Output size", toolA: "Larger (human-readable)", toolB: "Smallest possible" },
      { label: "Use case", toolA: "Reading and debugging", toolB: "Production and transfer" },
      { label: "Syntax highlighting", toolA: "Yes", toolB: "No" },
      { label: "Error detection", toolA: "Highlights error location", toolB: "Reports syntax errors" },
      { label: "Indentation options", toolA: "2, 4, or 8 spaces", toolB: "None (stripped)" },
    ],
    decisionA: "Use JSON Beautifier when you need to read, debug, or review JSON data. It makes API responses, config files, and nested structures easy to understand with syntax highlighting and proper indentation.",
    decisionB: "Use JSON Minifier when you need to minimize JSON size for API payloads, database storage, or network transfer. Smaller payloads mean faster transfers and lower bandwidth usage.",
    faq: [
      { question: "Does minifying JSON change the data?", answer: "No. Minification only removes whitespace, line breaks, and indentation. The actual data values, structure, and meaning are completely preserved." },
      { question: "Can I format then minify the same JSON?", answer: "Yes. A common workflow is to format JSON for review, then minify it before sending to a production API. Both tools are free and run in your browser." },
      { question: "Which tool catches JSON syntax errors?", answer: "Both detect syntax errors. The Formatter highlights the exact line and character position, making it easier to locate and fix issues." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: "/json" },
      { name: "JSON Formatter vs Minifier", url: "/compare/json-formatter-vs-minifier" },
    ],
    keywords: ["json formatter vs minifier", "format json vs minify json", "json beautify vs compress"],
  },

  {
    slug: "word-to-pdf-vs-pdf-to-word",
    path: "/compare/word-to-pdf-vs-pdf-to-word",
    title: "Word to PDF vs PDF to Word — Which Way Round? | GainUtility",
    description: "Compare Word to PDF and PDF to Word converters. When to convert document formats and which tool preserves formatting better. Free, private, browser-based.",
    toolA: {
      id: "word-to-pdf",
      name: "Word to PDF",
      description: "Convert Word documents to PDF format",
      bestFor: "Finalizing documents, sharing, printing",
      pros: ["Preserves formatting", "Universal compatibility", "Print-ready output"],
      toolPath: "/tools/word-to-pdf",
    },
    toolB: {
      id: "pdf-to-word",
      name: "PDF to Word",
      description: "Convert PDF documents to editable Word files",
      bestFor: "Editing PDF content, modifying text, updating contracts",
      pros: ["Editable output", "Preserves tables", "Maintains layout"],
      toolPath: "/tools/pdf-to-word",
    },
    intro: "Word to PDF and PDF to Word are reverse conversions that serve different stages of document workflows. Word to PDF finalizes documents for sharing and printing, while PDF to Word makes locked PDFs editable again.",
    comparisonTable: [
      { label: "Input format", toolA: "Word (.docx)", toolB: "PDF (.pdf)" },
      { label: "Output format", toolA: "PDF (.pdf)", toolB: "Word (.docx)" },
      { label: "Primary use", toolA: "Finalize and share", toolB: "Edit and modify" },
      { label: "Formatting", toolA: "Preserved from Word", toolB: "Best-effort reconstruction" },
      { label: "Editability", toolA: "Creates read-only PDF", toolB: "Creates editable Word" },
      { label: "Tables", toolA: "Preserved perfectly", toolB: "Reconstructed with best effort" },
    ],
    decisionA: "Use Word to PDF when your document is ready to be finalized — for sharing with clients, submitting to portals, or printing. The PDF format ensures consistent rendering across all devices.",
    decisionB: "Use PDF to Word when you receive a PDF that needs editing — modifying a contract clause, updating text in a report, or customizing a PDF template. The output is an editable Word document.",
    faq: [
      { question: "Does Word to PDF preserve all formatting?", answer: "Yes. The conversion maintains fonts, colors, images, tables, headers, footers, and page layouts exactly as they appear in the Word document." },
      { question: "Can I convert a password-protected PDF to Word?", answer: "You'll need to unlock the PDF first using our Unlock PDF tool, then convert the unprotected version to Word." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: "/pdf" },
      { name: "Word to PDF vs PDF to Word", url: "/compare/word-to-pdf-vs-pdf-to-word" },
    ],
    keywords: ["word to pdf vs pdf to word", "convert word to pdf or pdf to word", "document conversion comparison"],
  },

  {
    slug: "jpg-to-pdf-vs-pdf-to-jpg",
    path: "/compare/jpg-to-pdf-vs-pdf-to-jpg",
    title: "JPG to PDF vs PDF to JPG — Which Do You Need? | GainUtility",
    description: "Compare JPG to PDF and PDF to JPG converters. When to create PDFs from images vs extract images from PDFs. Free, private, browser-based.",
    toolA: {
      id: "jpg-to-pdf",
      name: "Image to PDF",
      description: "Convert JPG and PNG images to PDF documents",
      bestFor: "Photo albums, scanned documents, submission packages",
      pros: ["Custom page sizes", "Multiple image support", "Layout options"],
      toolPath: "/tools/jpg-to-pdf",
    },
    toolB: {
      id: "pdf-to-jpg",
      name: "PDF to JPG",
      description: "Extract images from PDF or convert pages to images",
      bestFor: "Extracting photos, getting page screenshots, sharing images",
      pros: ["Page-level extraction", "High resolution output", "Individual image files"],
      toolPath: "/tools/pdf-to-jpg",
    },
    intro: "JPG to PDF and PDF to JPG handle the conversion between image and document formats. JPG to PDF creates documents from photos, while PDF to JPG extracts images from existing PDFs.",
    comparisonTable: [
      { label: "Input format", toolA: "JPG, PNG, BMP, GIF, TIFF", toolB: "PDF" },
      { label: "Output format", toolA: "PDF document", toolB: "JPG images" },
      { label: "Multiple inputs", toolA: "Multiple images → one PDF", toolB: "One PDF → multiple images" },
      { label: "Page layout", toolA: "Custom margins and orientation", toolB: "One image per page" },
      { label: "Quality control", toolA: "Page size and margins", toolB: "Image resolution" },
    ],
    decisionA: "Use JPG to PDF when you need to combine photos into a document — creating a photo album PDF, converting scanned images to a proper document, or bundling multiple image attachments into one PDF for submission.",
    decisionB: "Use PDF to JPG when you need to extract images from a PDF — pulling photos from a document, getting a screenshot of a specific page, or sharing individual pages as images.",
    faq: [
      { question: "What image formats does JPG to PDF support?", answer: "We support JPG, JPEG, PNG, BMP, GIF, TIFF, and WebP image formats for conversion to PDF." },
      { question: "Does PDF to JPG extract embedded images or render pages?", answer: "PDF to JPG renders each page as a high-resolution JPG image, preserving all visual content including text, images, and layouts." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: "/pdf" },
      { name: "JPG to PDF vs PDF to JPG", url: "/compare/jpg-to-pdf-vs-pdf-to-jpg" },
    ],
    keywords: ["jpg to pdf vs pdf to jpg", "image to pdf or pdf to image", "pdf image conversion comparison"],
  },

  {
    slug: "image-crop-vs-resize",
    path: "/compare/image-crop-vs-resize",
    title: "Image Cropper vs Resizer — Crop or Scale? | GainUtility",
    description: "Compare Image Cropper and Image Resizer. When to cut parts of an image vs scaling dimensions. Free, private, browser-based.",
    toolA: {
      id: "image-cropper",
      name: "Image Cropper",
      description: "Cut and trim image areas with precision",
      bestFor: "Removing unwanted areas, focusing on subjects, formatting crops",
      pros: ["Freeform cropping", "Aspect ratio presets", "Preview before apply"],
      toolPath: "/tools/image-cropper",
    },
    toolB: {
      id: "image-resizer",
      name: "Image Resizer",
      description: "Scale image dimensions by pixels or percentage",
      bestFor: "Social media sizing, thumbnails, responsive images",
      pros: ["Exact pixel control", "Aspect ratio lock", "Batch processing"],
      toolPath: "/tools/image-resizer",
    },
    intro: "Image Cropper and Image Resizer both change the visible area of an image, but in different ways. Cropper removes parts of the image to focus on a specific area, while Resizer scales the entire image to new dimensions.",
    comparisonTable: [
      { label: "What changes", toolA: "Visible area (crops edges)", toolB: "Pixel dimensions (scales entire image)" },
      { label: "Content loss", toolA: "Removes cropped areas", toolB: "No content removed" },
      { label: "Focus", toolA: "Select specific region", toolB: "Scale entire image" },
      { label: "Aspect ratio", toolA: "Freeform or preset ratios", toolB: "Locked or freeform" },
      { label: "Best for", toolA: "Removing borders, focusing subjects", toolB: "Platform-specific sizing" },
    ],
    decisionA: "Use Image Cropper when you need to remove unwanted areas — cutting off a border, focusing on a face in a photo, or formatting an image to a specific aspect ratio by trimming edges.",
    decisionB: "Use Image Resizer when you need the entire image at different dimensions — creating thumbnails, sizing for social media platforms, or making images responsive for different screen sizes.",
    faq: [
      { question: "Can I crop and then resize the same image?", answer: "Yes. Crop first to focus on the area you want, then resize to the exact dimensions needed. Both tools run in your browser with no uploads." },
      { question: "Does cropping reduce file size?", answer: "Yes, typically. Cropping removes pixel data from the edges, which reduces the total file size. However, the primary purpose is to focus on a specific area." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Image Tools", url: "/image" },
      { name: "Image Crop vs Resize", url: "/compare/image-crop-vs-resize" },
    ],
    keywords: ["image crop vs resize", "crop image or resize image", "image cropping vs scaling comparison"],
  },

  {
    slug: "json-validator-vs-schema-validator",
    path: "/compare/json-validator-vs-schema-validator",
    title: "JSON vs Schema Validator — Syntax or Structure | GainUtility",
    description: "Compare JSON Validator and JSON Schema Validator. Check syntax errors vs validate against a schema. Free, private, browser-based.",
    toolA: {
      id: "json-validator",
      name: "JSON Validator",
      description: "Check JSON syntax for errors with line numbers",
      bestFor: "Debugging syntax, catching typos, validating API responses",
      pros: ["Line-by-line error detection", "Character position", "Instant validation"],
      toolPath: "/tools/json-validator",
    },
    toolB: {
      id: "json-schema-validator",
      name: "JSON Schema Validator",
      description: "Validate JSON against a JSON Schema definition",
      bestFor: "API contract validation, config verification, data quality",
      pros: ["Schema-based validation", "Type checking", "Required field validation"],
      toolPath: "/tools/json-schema-validator",
    },
    intro: "JSON Validator and JSON Schema Validator both validate JSON, but at different levels. JSON Validator checks for syntax errors (is this valid JSON?), while JSON Schema Validator checks structural compliance (does this JSON match my expected format?).",
    comparisonTable: [
      { label: "Validation level", toolA: "Syntax only (RFC 8259)", toolB: "Structure + types + rules" },
      { label: "Requires schema", toolA: "No", toolB: "Yes (JSON Schema)" },
      { label: "Checks", toolA: "Commas, brackets, quotes, escaping", toolB: "Types, required fields, ranges, patterns" },
      { label: "Error detail", toolA: "Line and character position", toolB: "Path to failing field + rule" },
      { label: "Use case", toolA: "Is this valid JSON?", toolB: "Does this match my API spec?" },
      { label: "Speed", toolA: "Instant", toolB: "Depends on schema complexity" },
    ],
    decisionA: "Use JSON Validator when you need to quickly check if JSON is syntactically correct — debugging an API response, checking a pasted JSON snippet, or finding typos in a config file.",
    decisionB: "Use JSON Schema Validator when you need to verify that JSON conforms to a specific structure — validating API request/response payloads, checking form data against requirements, or ensuring config files have the right fields and types.",
    faq: [
      { question: "Can I use both tools together?", answer: "Yes. First validate syntax with JSON Validator to ensure the JSON is parseable, then validate structure with JSON Schema Validator to ensure it matches your expected format." },
      { question: "What is JSON Schema?", answer: "JSON Schema is a standard for describing the structure and constraints of JSON data. It defines required fields, data types, value ranges, and pattern matching rules." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: "/json" },
      { name: "JSON Validator vs Schema Validator", url: "/compare/json-validator-vs-schema-validator" },
    ],
    keywords: ["json validator vs schema validator", "json validation comparison", "json syntax vs schema validation"],
  },

  {
    slug: "password-vs-hash-generator",
    path: "/compare/password-vs-hash-generator",
    title: "Password vs Hash Generator — Which Is Safer? | GainUtility",
    description: "Compare Password Generator and Hash Generator. Generate random passwords vs create deterministic hashes. Free, private, browser-based.",
    toolA: {
      id: "password-generator",
      name: "Password Generator",
      description: "Generate cryptographically secure random passwords",
      bestFor: "Account security, API keys, secure tokens",
      pros: ["Web Crypto API", "Custom character sets", "Entropy evaluation"],
      toolPath: "/tools/password-generator",
    },
    toolB: {
      id: "hash-generator",
      name: "Hash Generator",
      description: "Create SHA-256, SHA-512, and other cryptographic hashes",
      bestFor: "Data integrity, checksums, password storage verification",
      pros: ["Multiple algorithms", "Deterministic output", "File hashing"],
      toolPath: "/tools/hash-generator",
    },
    intro: "Password Generator and Hash Generator both produce cryptographic output, but serve fundamentally different purposes. Password Generator creates random, unique passwords, while Hash Generator creates deterministic fingerprints of input data.",
    comparisonTable: [
      { label: "Output type", toolA: "Random password string", toolB: "Fixed-length hash digest" },
      { label: "Deterministic?", toolA: "No (each run produces different output)", toolB: "Yes (same input always produces same hash)" },
      { label: "Purpose", toolA: "Create new secrets", toolB: "Verify data integrity" },
      { label: "Algorithms", toolA: "Random (Web Crypto)", toolB: "SHA-1, SHA-256, SHA-384, SHA-512" },
      { label: "Input", toolA: "Length and character options", toolB: "Text or file content" },
      { label: "Reversible?", toolA: "N/A (output is the secret)", toolB: "No (one-way function)" },
    ],
    decisionA: "Use Password Generator when you need a new, random, high-entropy password — for account creation, API key generation, or creating secure tokens. Each click produces a unique result.",
    decisionB: "Use Hash Generator when you need to create a fingerprint of data — verifying file integrity, implementing checksums, or understanding how password hashing works. The same input always produces the same hash.",
    faq: [
      { question: "Can I store the generated password?", answer: "You should copy and store it immediately in a password manager. The generator does not save or transmit any passwords." },
      { question: "Is a hash the same as encryption?", answer: "No. Hashing is a one-way operation — you cannot reverse a hash to get the original data. Encryption is reversible with the correct key." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: "/dev" },
      { name: "Password vs Hash Generator", url: "/compare/password-vs-hash-generator" },
    ],
    keywords: ["password generator vs hash generator", "random password or hash", "cryptographic tools comparison"],
  },

  {
    slug: "qr-code-vs-url-encoder",
    path: "/compare/qr-code-vs-url-encoder",
    title: "QR Code vs URL Encoder — Visual or Text? | GainUtility",
    description: "Compare QR Code Generator and URL Encoder. When to create visual QR codes vs encode URLs as text. Free, private, browser-based.",
    toolA: {
      id: "qr-code-generator",
      name: "QR Code Generator",
      description: "Create styled QR codes for URLs, WiFi, contacts, and more",
      bestFor: "Print materials, business cards, WiFi sharing, event marketing",
      pros: ["Custom colors and logos", "Multiple QR types", "PNG and SVG export"],
      toolPath: "/tools/qr-code-generator",
    },
    toolB: {
      id: "url-encoder-decoder",
      name: "URL Encoder/Decoder",
      description: "Encode and decode URL percent-encoding",
      bestFor: "API parameters, tracking URLs, link sharing in text",
      pros: ["Instant encoding", "UTF-8 safe", "Bidirectional"],
      toolPath: "/tools/url-encoder-decoder",
    },
    intro: "QR Code Generator and URL Encoder both make URLs more shareable, but in different mediums. QR codes are visual scannable codes for print and physical sharing, while URL encoding makes special characters safe for text-based transfer.",
    comparisonTable: [
      { label: "Output format", toolA: "PNG or SVG image", toolB: "Encoded text string" },
      { label: "Share medium", toolA: "Visual (print, screen, physical)", toolB: "Text (emails, APIs, code)" },
      { label: "Scanning", toolA: "Camera or QR scanner", toolB: "Paste into browser or code" },
      { label: "Content types", toolA: "URLs, WiFi, email, phone, vCard", toolB: "URLs and text" },
      { label: "Customization", toolA: "Colors, logos, error correction", toolB: "None (standard encoding)" },
    ],
    decisionA: "Use QR Code Generator when you need a visual, scannable code — for business cards, event posters, WiFi sharing, restaurant menus, or any physical print material.",
    decisionB: "Use URL Encoder/Decoder when you need to make URLs safe for text transmission — encoding query parameters, API URLs with special characters, or tracking links in code.",
    faq: [
      { question: "Can a QR code contain a URL that's also encoded?", answer: "Yes. You can put an encoded URL inside a QR code, but it's usually unnecessary. QR codes handle URLs natively — encoding is for text-based transfer only." },
      { question: "Which tool is better for sharing a WiFi password?", answer: "QR Code Generator. Create a WiFi QR code that guests can scan to connect instantly, without typing the password." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: "/dev" },
      { name: "QR Code vs URL Encoder", url: "/compare/qr-code-vs-url-encoder" },
    ],
    keywords: ["qr code vs url encoder", "qr code generator or url encoding", "sharing tools comparison"],
  },
];

/* ------------------------------------------------------------------ */
/* Category "Best" Pages                                               */
/* ------------------------------------------------------------------ */

export const CATEGORY_BEST_PAGES: CategoryBestEntry[] = [
  {
    slug: "pdf",
    path: "/pdf/best",
    title: "Best PDF Tools 2026 — Merge, Split & Convert | GainUtility",
    description: "Discover the best free PDF tools for 2026: merge, split, compress, rotate and convert in your browser. Each tool states what it does with your file.",
    category: "PDF Tools",
    categoryPath: "/pdf",
    intro: "GainUtility offers 40+ free PDF tools that process files in your browser. Most tools keep your PDF on your device; the PDF Translator is the exception, and its page discloses that it sends extracted text to a translation service. Here are the most popular tools for common PDF tasks.",
    tools: [
      { id: "merge-pdf", name: "Merge PDF", rank: 1, description: "Combine multiple PDFs into one document with drag-and-drop reordering.", bestFor: "Assembling contracts, reports, and multi-page documents" },
      { id: "compress-images-inside-pdf", name: "Compress Images Inside PDF", rank: 2, description: "Reduce PDF file size by 30-70% by compressing the embedded images.", bestFor: "Image-heavy PDFs, email attachments, and storage optimization" },
      { id: "split-pdf", name: "Split PDF", rank: 3, description: "Extract specific pages or ranges from any PDF document.", bestFor: "Pulling chapters, separating signed pages, splitting large files" },
      { id: "pdf-to-word", name: "PDF to Word", rank: 4, description: "Convert PDF to editable Word documents with formatting preserved.", bestFor: "Editing PDF content, modifying contracts, updating reports" },
      { id: "rotate-pdf", name: "Rotate PDF", rank: 5, description: "Fix page orientation with instant preview and per-page control.", bestFor: "Correcting scanned documents, fixing landscape pages" },
      { id: "jpg-to-pdf", name: "Image to PDF", rank: 6, description: "Convert images to PDF with custom margins, page sizes, and layouts.", bestFor: "Photo albums, scanned documents, submission packages" },
    ],
    guides: {
      heading: "Guides for the jobs above",
      items: [
        { path: "/blog/how-to-merge-pdf-files", title: "How to merge multiple PDFs into one file", desc: "Page order first: how to lay out scans and exports before combining them." },
        { path: "/blog/how-to-compress-a-pdf", title: "How to compress a PDF without losing what you need", desc: "Where the size comes from, and how to reduce it in checkable steps." },
        { path: "/blog/how-to-split-a-pdf", title: "How to split a PDF and keep only the pages you need", desc: "By range, by bookmark, or by dropping blank pages first." },
        { path: "/blog/how-to-convert-pdf-to-word", title: "How to convert a PDF to Word without losing the text", desc: "What converts cleanly, what you rebuild by hand, and when OCR comes first." },
        { path: "/blog/how-to-convert-jpg-to-pdf", title: "How to convert JPG images to a PDF", desc: "Page size, orientation and ordering - the three things that decide the result." },
        { path: "/blog/are-online-pdf-tools-safe", title: "Are online PDF tools safe?", desc: "What happens to a document you upload, and how to check any tool yourself." },
      ],
    },
    faq: [
      { question: "Are these PDF tools really free?", answer: "Yes. All PDF tools are completely free with no sign-up required. There are no hidden fees, usage limits, or premium tiers." },
      { question: "Is my PDF data safe?", answer: "Your PDF is processed on your device and never stored on our servers. The one exception is the PDF Translator, which sends the extracted text to a translation service and discloses this on its page." },
      { question: "What's the maximum file size?", answer: "Processing is limited only by your browser's memory. Most files up to 100MB work smoothly. For very large files, try splitting first." },
      { question: "Can I use these tools on mobile?", answer: "Yes. All PDF tools are responsive and work on smartphones and tablets through your mobile browser." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: "/pdf" },
      { name: "Best PDF Tools", url: "/pdf/best" },
    ],
    keywords: ["best free pdf tools 2026", "top pdf tools online", "free pdf merge split compress", "best pdf editor free"],
  },

  {
    slug: "json",
    path: "/json/best",
    title: "Best Free JSON Tools 2026 — Format & Convert | GainUtility",
    description: "Discover the best free JSON tools for 2026. Format, validate, minify, compare, and convert JSON data instantly in your browser. No uploads needed.",
    category: "JSON Tools",
    categoryPath: "/json",
    intro: "GainUtility's JSON toolkit helps developers format, validate, compare, and transform JSON data — all processed locally in your browser. Here are the essential tools for working with JSON.",
    tools: [
      { id: "json-beautifier", name: "JSON Beautifier", rank: 1, description: "Beautify minified JSON with syntax highlighting and custom indentation.", bestFor: "Debugging API responses, reviewing config files" },
      { id: "json-validator", name: "JSON Validator", rank: 2, description: "Validate JSON syntax with line numbers and detailed error messages.", bestFor: "Finding syntax errors, checking API payloads" },
      { id: "json-minifier", name: "JSON Minifier", rank: 3, description: "Remove whitespace and compress JSON to minimum size.", bestFor: "Production payloads, reducing bandwidth" },
      { id: "json-tree-viewer", name: "JSON Tree Viewer", rank: 4, description: "Explore JSON as an interactive tree with collapsible nodes.", bestFor: "Navigating complex nested structures" },
      { id: "json-compare-diff", name: "Compare JSON", rank: 5, description: "Side-by-side comparison to spot differences between JSON objects.", bestFor: "Config auditing, API response comparison" },
      { id: "json-to-csv", name: "JSON to CSV", rank: 6, description: "Convert JSON arrays to CSV spreadsheet format.", bestFor: "Exporting data to spreadsheets, data analysis" },
    ],
    guides: {
      heading: "Before you format anything",
      items: [
        { path: "/blog/format-and-debug-json-when-api-responses-are-unreadable", title: "How to read and fix unreadable JSON from an API", desc: "Minified responses, trailing commas, and an error message that points at the wrong line." },
      ],
    },
    faq: [
      { question: "Is my JSON data sent to a server?", answer: "No. All JSON processing happens entirely in your browser. Your data never leaves your device." },
      { question: "What JSON features are supported?", answer: "Full JSON specification support including nested objects, arrays, unicode strings, and numeric types." },
      { question: "Can I use these tools offline?", answer: "Yes. Once the page loads, all tools work offline with no internet connection required." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: "/json" },
      { name: "Best JSON Tools", url: "/json/best" },
    ],
    keywords: ["best free json tools 2026", "top json formatter validator", "free json tools online", "json development tools"],
  },

  {
    slug: "image",
    path: "/image/best",
    title: "Best Free Image Tools 2026 — Compress & Resize | GainUtility",
    description: "Discover the best free image tools for 2026. Compress, resize, crop, convert, watermark, and edit images in your browser. No uploads, complete privacy.",
    category: "Image Tools",
    categoryPath: "/image",
    intro: "GainUtility's image toolkit processes everything in your browser — no server uploads. Here are the most popular image tools for common editing tasks.",
    tools: [
      { id: "image-converter", name: "Image Converter", rank: 1, description: "Convert between JPG, PNG, WebP, AVIF, and other formats.", bestFor: "Format compatibility, WebP conversion" },
      { id: "image-resizer", name: "Image Resizer", rank: 2, description: "Change image dimensions by exact pixels or percentage scaling.", bestFor: "Social media, thumbnails, responsive images" },
      { id: "image-cropper", name: "Image Cropper", rank: 3, description: "Cut and trim image areas with precision and aspect ratio presets.", bestFor: "Removing borders, focusing on subjects" },
      { id: "image-watermark", name: "Image Watermark", rank: 4, description: "Add text or logo watermarks to protect your images.", bestFor: "Copyright protection, brand attribution" },
      { id: "social-resizer", name: "Social Media Image Resizer", rank: 5, description: "Batch resize images to exact dimensions for Instagram, Facebook, LinkedIn, and Twitter.", bestFor: "Social profiles, post images, multi-platform sizing" },
      { id: "background-remover", name: "Background Remover", rank: 6, description: "AI-powered background removal with automatic subject detection and clean transparent PNG export.", bestFor: "People, products, animals, vehicles, complex backgrounds" },
    ],
    guides: {
      heading: "Guides for the jobs above",
      items: [
        { path: "/blog/how-to-resize-an-image", title: "How to resize an image to an exact pixel size", desc: "Exact dimensions for a form, a thumbnail or a profile picture, without upscaling blur." },
        { path: "/blog/how-to-compress-an-image", title: "How to compress images without losing too much quality", desc: "Where image weight comes from, and how far you can push each format." },
        { path: "/blog/how-to-remove-background-from-an-image", title: "How to remove a background from an image", desc: "Sample the colour, set the tolerance, and check the edges before you export." },
        { path: "/blog/how-to-make-a-transparent-png", title: "How to make a transparent PNG", desc: "How to get a clean alpha channel instead of a white fringe." },
        { path: "/blog/background-remover-for-product-photos", title: "Background removal for product photos", desc: "When a clean cut-out matters more than a fast one, and what to check." },
      ],
    },
    faq: [
      { question: "Are my images uploaded to a server?", answer: "No. All image processing happens in your browser using the Canvas API. Your images never leave your device." },
      { question: "What image formats are supported?", answer: "We support JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF, and SVG formats across our tools." },
      { question: "Can I process multiple images at once?", answer: "Yes. Most image tools support batch processing — upload multiple files and download them individually or as a ZIP archive." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Image Tools", url: "/image" },
      { name: "Best Image Tools", url: "/image/best" },
    ],
    keywords: ["best free image tools 2026", "top image compressor resizer", "free image editing tools", "online image tools"],
  },

  {
    slug: "dev",
    path: "/dev/best",
    title: "Best Free Developer Tools — QR, Base64 & More | GainUtility",
    description: "Discover the best free developer tools for 2026. QR codes, Base64 encoding, UUID generation, regex testing, and more. Fast, private, browser-based.",
    category: "Developer Tools",
    categoryPath: "/dev",
    intro: "GainUtility's developer toolkit provides essential utilities for everyday development tasks. Here are the most-used tools by developers.",
    tools: [
      { id: "qr-code-generator", name: "QR Code Generator", rank: 1, description: "Create styled QR codes with custom colors, logos, and error correction.", bestFor: "Business cards, WiFi sharing, event marketing" },
      { id: "base64-tool", name: "Base64 Encoder & Decoder", rank: 2, description: "Encode and decode Base64 with full UTF-8 and emoji support.", bestFor: "API authentication, data embedding" },
      { id: "uuid-generator", name: "UUID Generator", rank: 3, description: "Generate UUID v1, v4, and v7 with cryptographic randomness.", bestFor: "Database keys, unique identifiers" },
      { id: "regex-tester", name: "Regex Tester", rank: 4, description: "Test regular expressions with real-time match highlighting.", bestFor: "Pattern validation, regex debugging" },
      { id: "jwt-decoder", name: "JWT Decoder", rank: 5, description: "Decode and inspect JWT token headers and payloads.", bestFor: "Auth debugging, token inspection" },
      { id: "password-generator", name: "Password Generator", rank: 6, description: "Generate cryptographically secure passwords with entropy evaluation.", bestFor: "Account security, API key generation" },
    ],
    guides: {
      heading: "Guides for the jobs above",
      items: [
        { path: "/blog/how-to-make-a-qr-code", title: "How to make a QR code that actually scans", desc: "Error correction, module size and the one test to run before you print." },
      ],
    },
    faq: [
      { question: "Are these tools suitable for production use?", answer: "Our tools are designed for development, testing, and debugging. For production security, use established libraries and frameworks." },
      { question: "Do these tools store any data?", answer: "No. All tools run entirely in your browser. No data is transmitted, stored, or logged on any server." },
      { question: "Can I use these offline?", answer: "Yes. Once the page loads, all developer tools work completely offline." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: "/dev" },
      { name: "Best Developer Tools", url: "/dev/best" },
    ],
    keywords: ["best free developer tools 2026", "top developer utilities", "free qr code base64 uuid tools", "online developer tools"],
  },

  {
    slug: "css",
    path: "/css/best",
    title: "Best Free CSS Tools 2026 — Gradients & Shadows | GainUtility",
    description: "Discover the best free CSS tools for 2026. Generate gradients, box shadows, border radius, and check contrast. No uploads needed.",
    category: "CSS Tools",
    categoryPath: "/css",
    intro: "GainUtility's CSS toolkit helps designers and developers create beautiful visual effects with live preview. Here are the essential CSS tools.",
    tools: [
      { id: "gradient-generator", name: "Gradient Generator", rank: 1, description: "Create linear and radial CSS gradients with multiple color stops.", bestFor: "Backgrounds, hero sections, buttons" },
      { id: "box-shadow-generator", name: "CSS Box Shadow Generator", rank: 2, description: "Design layered, inset, or soft CSS box shadows with custom controls.", bestFor: "Card designs, depth effects, UI polish" },
      { id: "contrast-checker", name: "Contrast Checker", rank: 3, description: "Verify WCAG AA and AAA color contrast compliance.", bestFor: "Accessibility audits, design system validation" },
      { id: "border-radius-generator", name: "Border Radius Generator", rank: 4, description: "Design asymmetric corners and organic blob shapes.", bestFor: "Custom shapes, modern UI elements" },
    ],
    guides: {
      heading: "Guides for the jobs above",
      items: [
        { path: "/blog/box-shadow-values-real-websites", title: "What box-shadow values real websites actually use", desc: "Measured offsets, blurs and alphas instead of numbers chosen by feel." },
        { path: "/blog/soft-shadow-css-recipes", title: "Soft shadow CSS recipes that don't turn out muddy", desc: "Set alpha first, then offset and blur - the order that keeps shadows clean." },
        { path: "/blog/box-shadow-vs-drop-shadow-filter", title: "box-shadow vs filter: drop-shadow() - which to use", desc: "Why the two look different on the same shape, and when each one is right." },
        { path: "/blog/clean-up-css-gradients-and-borders-in-design-work", title: "How to tune CSS gradients, shadows and contrast without guessing", desc: "One pass over colour, contrast and edges instead of nudging values blindly." },
        { path: "/blog/neumorphism-box-shadow-guide", title: "Neumorphism box shadow: the two-layer formula and its limits", desc: "Where the style works, where it fails accessibility, and the focus-ring fix." },
      ],
    },
    faq: [
      { question: "Can I export CSS code from these tools?", answer: "Yes. All CSS tools generate copy-ready CSS code. Some tools also support Tailwind CSS class approximations and PNG exports." },
      { question: "Are the CSS rules cross-browser compatible?", answer: "Yes. Our tools output standard W3C-compliant CSS that works in all modern browsers." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "CSS Tools", url: "/css" },
      { name: "Best CSS Tools", url: "/css/best" },
    ],
    keywords: ["best free css tools 2026", "css gradient generator", "box shadow generator free", "css design tools online"],
  },

  {
    slug: "seo",
    path: "/seo/best",
    title: "Best Free SEO Tools 2026 — Meta Tags & Schema | GainUtility",
    description: "Discover the best free SEO tools for 2026. Generate meta tags, schema markup, sitemaps, and optimize for search engines. Fast, private.",
    category: "SEO Tools",
    categoryPath: "/seo",
    intro: "GainUtility's SEO toolkit helps you optimize search engine signals with precision. Here are the essential tools for SEO professionals and site owners.",
    tools: [
      { id: "seo-meta-generator", name: "SEO Meta Generator", rank: 1, description: "Generate optimized title tags and meta descriptions.", bestFor: "On-page SEO, SERP snippet optimization" },
      { id: "schema-markup-generator", name: "Schema Markup Generator", rank: 2, description: "Create JSON-LD structured data for rich search results.", bestFor: "Rich snippets, FAQ results, product listings" },
      { id: "google-serp-preview", name: "Google SERP Preview", rank: 3, description: "Preview how your page will appear in Google search results.", bestFor: "Title/description optimization, pixel width checking" },
      { id: "robots-txt-generator", name: "Robots.txt Generator", rank: 4, description: "Create and validate robots.txt files for crawl control.", bestFor: "Crawl budget optimization, bot management" },
      { id: "xml-sitemap-generator", name: "XML Sitemap Generator", rank: 5, description: "Generate XML sitemaps for search engine indexing.", bestFor: "Site indexing, search console setup" },
      { id: "utm-builder", name: "UTM Builder", rank: 6, description: "Create UTM-tracked campaign URLs for analytics.", bestFor: "Campaign tracking, marketing attribution" },
    ],
    guides: {
      heading: "Guides for the jobs above",
      items: [
        { path: "/blog/write-seo-title-and-meta-description-in-twenty-minutes", title: "How to write a page title and meta description", desc: "What the SERP actually shows, and how to keep both from being rewritten." },
      ],
    },
    faq: [
      { question: "Do these SEO tools check live search rankings?", answer: "No. Our tools generate SEO assets (meta tags, schema, sitemaps). They don't query search engines for ranking data." },
      { question: "Can I use the generated code directly?", answer: "Yes. All output is production-ready. Copy the generated meta tags, JSON-LD, or XML directly into your HTML or config files." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "SEO Tools", url: "/seo" },
      { name: "Best SEO Tools", url: "/seo/best" },
    ],
    keywords: ["best free seo tools 2026", "meta tag generator", "schema markup generator free", "seo tools online"],
  },
];

/* ------------------------------------------------------------------ */
/* Lookup maps                                                         */
/* ------------------------------------------------------------------ */

export const COMPARISON_PAGE_MAP: Record<string, ComparisonPageEntry> = {};
for (const page of COMPARISON_PAGES) {
  COMPARISON_PAGE_MAP[page.slug] = page;
  COMPARISON_PAGE_MAP[page.path] = page;
}

export const CATEGORY_BEST_MAP: Record<string, CategoryBestEntry> = {};
for (const page of CATEGORY_BEST_PAGES) {
  CATEGORY_BEST_MAP[page.slug] = page;
  CATEGORY_BEST_MAP[page.path] = page;
}
