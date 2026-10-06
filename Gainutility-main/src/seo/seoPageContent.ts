import { ToolId } from "../types";
import type { LocaleCode } from "../i18n/slugs";
import { localizedToolName } from "../i18n/slugs";
import { RELATED_DESC_TEMPLATE, localizedHubOverlay } from "../i18n/hubs";
import { DEFAULT_LOCALE } from "../i18n/locales";
import { toolsRegistry } from "../toolsRegistry";
import { localizedCrumbPath } from "./shared";

/**
 * Rich content blocks for guide-style SEO pages. Plain data only (no JSX) so
 * the prerender's static bodyContent can emit the same crawlable HTML before
 * React hydrates the interactive copy buttons and live previews.
 */
export type SeoPageSection =
  | { type: "heading"; text: string }
  | { type: "paragraphs"; items: string[] }
  | { type: "list"; items: string[] }
  /** Copyable code block; `content` is the exact text written to the clipboard. */
  | { type: "code"; label?: string; content: string }
  /**
   * Live shadow preview paired with its declaration. The preview applies
   * `${property}: ${value}` inline and the copy button writes the same string,
   * so what you see is byte-for-byte what you paste.
   */
  | {
      type: "shadowDemo";
      label: string;
      property: "box-shadow" | "text-shadow";
      value: string;
      /** Corner radius of the preview card (box-shadow demos). */
      radius?: number;
      stageBg?: string;
      /** Sample text for text-shadow demos. */
      text?: string;
    }
  | { type: "table"; caption?: string; columns: string[]; rows: string[][] }
  /** Internal cluster links (other SEO pages and blog articles). */
  | { type: "links"; heading?: string; items: { path: string; title: string; desc: string }[] }
  /**
   * "Which tool do I need?" chooser: one row per job, worded the way a reader
   * would describe the job rather than the way the product is named. Each row
   * links the canonical destination for that job (a hub sub-page where one
   * exists, otherwise the tool page) - no row repeats another row's path.
   */
  | {
      type: "chooser";
      heading?: string;
      /** One quiet line under the heading; kept to a single sentence. */
      note?: string;
      items: { label: string; path: string; hint?: string }[];
    }
  /**
   * Three-axis comparison strip (A-01). One row per service, one column per
   * axis the vendor actually publishes: account required, whether the file is
   * uploaded, free-tier limits. Every row carries its own source links and the
   * table carries the verification date; where a vendor does not publish a
   * figure, the cell says so instead of carrying an estimate.
   */
  | {
      type: "comparison";
      heading?: string;
      note?: string;
      columns: string[];
      rows: { name: string; cells: string[]; sources: { label: string; href: string }[] }[];
      /** ISO date the cells were last checked against the linked sources. */
      verified: string;
    };

export interface SeoPageEntry {
  slug: string;
  path: string;
  category: string;
  categorySlug: string;
  title: string;
  description: string;
  /** Overrides the default hub H1 template (guide pages set their own). */
  h1?: string;
  primaryTool: ToolId | null;
  relatedTools: { id: ToolId; name: string; description: string }[];
  breadcrumbs: { name: string; url: string }[];
  intro: string;
  /** Rich guide content rendered between the hero and the use-case grid. */
  sections?: SeoPageSection[];
  useCases: { title: string; desc: string }[];
  steps: string[];
  faq: { question: string; answer: string }[];
  keywords: string[];
  limitations?: string[];
}

const PDF_ROOT = "/pdf";
const JSON_ROOT = "/json";
const IMAGE_ROOT = "/image";
const CSS_ROOT = "/css";
const DEV_ROOT = "/dev";
const SEO_ROOT = "/seo";
const MEDIA_ROOT = "/media";
const CREATOR_ROOT = "/creator";

const pdfRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "merge-pdf": "Merge PDF",
      "split-pdf": "Split PDF",
      "compress-images-inside-pdf": "Compress Images Inside PDF",
      "rotate-pdf": "Rotate PDF",
      "jpg-to-pdf": "Image to PDF",
      "pdf-to-jpg": "PDF to JPG",
      "image-converter": "Image Converter",
      "extract-pdf": "Extract PDF Pages",
      "delete-pdf": "Remove Pages from PDF",
      "rearrange-pdf": "Rearrange PDF",
      "protect-pdf": "Protect PDF",
      "word-to-pdf": "Word to PDF",
      "pdf-to-word": "PDF to Word",
      "text-to-pdf": "Text to PDF",
      "pdf-to-text": "PDF to Text",
      "add-pdf-watermark": "Add Watermark to PDF",
      "flatten-pdf": "Flatten PDF",
      "add-pdf-page-numbers": "Add Page Numbers",
      "crop-pdf": "Crop PDF",
      "unlock-pdf": "Unlock PDF",
      "repair-pdf": "Repair PDF",
      "validate-pdf": "Validate PDF",
      "optimize-pdf-web": "Optimize PDF for Web",
      "ocr-pdf": "OCR PDF",
      "compare-two-pdfs": "Compare PDFs",
      "remove-pdf-metadata": "Remove PDF Metadata",
      "pdf-to-html": "PDF to HTML",
      "html-to-pdf": "HTML to PDF",
      "pdf-to-excel": "PDF to Excel",
      "pdf-to-powerpoint": "PDF to PowerPoint",
      "reduce-pdf-image-quality": "Compress PDF",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online.` };
  });

const jsonRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "json-formatter": "JSON Formatter",
      "json-viewer": "JSON Viewer",
      "json-compare": "JSON Compare (Classic)",
      "json-validator": "JSON Validator",
      "json-minifier": "JSON Minifier",
      "json-beautifier": "JSON Beautifier",
      "json-tree-viewer": "JSON Tree Viewer",
      "json-compare-diff": "Compare JSON",
      "json-to-csv": "JSON to CSV",
      "csv-json-converter": "CSV JSON Converter",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online.` };
  });

const imageRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "image-resizer": "Image Resizer",
      "image-cropper": "Image Cropper",
      "image-converter": "Image Converter",
      "image-watermark": "Image Watermark",
      "image-blur-pixelate": "Image Blur",
      "social-resizer": "Social Media Resizer",
      "favicon-generator": "Favicon Generator",
      "collage-maker": "Collage Maker",
      "background-remover": "Background Remover",
      "image-upscaler": "Image Upscaler",
    };
    // Registry name keeps tools added to the hub later from rendering as raw slugs.
    const name = names[id] ?? toolsRegistry[id]?.name ?? id;
    return { id, name, description: `Use the ${name} tool online.` };
  });

const devRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "qr-code-generator": "QR Code Generator",
      "base64-tool": "Base64 Encoder & Decoder",
      "url-encoder-decoder": "URL Encoder",
      "html-entity-encoder": "HTML Entity Encoder",
      "uuid-generator": "UUID Generator",
      "jwt-decoder": "JWT Decoder",
      "password-generator": "Password Generator",
      "password-strength-checker": "Password Strength",
      "hash-generator": "Hash Generator",
      "regex-tester": "Regex Tester",
      "unix-timestamp-converter": "Timestamp Converter",
      "cron-expression-builder": "Cron Builder",
      "text-diff-checker": "Text Diff Checker",
      "json-schema-validator": "JSON Schema Validator",
      "csv-json-converter": "CSV JSON Converter",
      "xml-json-converter": "XML JSON Converter",
      "sql-formatter": "SQL Formatter",
      "yaml-formatter": "YAML Formatter",
      "http-status-code-lookup": "HTTP Status Codes",
      "mime-type-lookup": "MIME Type Lookup",
      "url-parser": "URL Parser",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online.` };
  });

const seoRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "seo-meta-generator": "SEO Meta Generator",
      "og-meta-generator": "Open Graph Generator",
      "twitter-card-generator": "Twitter Card Generator",
      "robots-txt-generator": "Robots.txt Generator",
      "xml-sitemap-generator": "XML Sitemap Generator",
      "schema-markup-generator": "Schema Markup Generator",
      "utm-builder": "UTM Builder",
      "canonical-url-generator": "Canonical URL Generator",
      "hreflang-tag-generator": "Hreflang Tag Generator",
      "google-serp-preview": "SERP Preview",
      "slug-generator": "Slug Generator",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online.` };
  });

const creatorRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "youtube-thumbnail-preview": "YouTube Thumbnail Preview",
      "youtube-title-analyzer": "YouTube Title Analyzer",
      "youtube-timestamp-formatter": "YouTube Timestamp Formatter",
      "youtube-chapter-generator": "YouTube Chapter Generator",
      "youtube-embed-generator": "YouTube Embed Generator",
      "youtube-url-toolkit": "YouTube URL Toolkit",
      "thumbnail-safe-zone": "Thumbnail Safe Zone Checker",
      "youtube-description-formatter": "YouTube Description Formatter",
      "youtube-keyword-explorer": "YouTube Keyword Explorer",
      "linkedin-carousel-maker": "LinkedIn Carousel Maker",
      "slug-generator": "Slug Generator",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online — processed in your browser.` };
  });

const mediaRelated = (ids: ToolId[]): { id: ToolId; name: string; description: string }[] =>
  ids.map((id) => {
    const names: Record<string, string> = {
      "video-audio-extractor": "Video Audio Extractor",
      "video-compressor": "Video Compressor",
      "video-resizer": "Video Resizer",
      "video-trimmer": "Video Trimmer",
      "video-converter": "Video Converter",
      "video-to-gif": "Video to GIF",
      "photos-to-video": "Photos to Video",
      "video-downloader": "Video Downloader",
      "add-music-to-photo": "Add Music to Photo",
      "image-resizer": "Image Resizer",
    };
    return { id, name: names[id] ?? id, description: `Use the ${names[id] ?? id} tool online — processed in your browser.` };
  });

export const SEO_PAGES: SeoPageEntry[] = [
  // ────────────── PDF Hub ──────────────
  {
    slug: "pdf",
    path: PDF_ROOT,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free PDF Tools — Merge, Split & Compress PDFs | GainUtility",
    description: "Use 40+ free PDF tools in your browser: merge, split, compress, rotate and convert. Files stay local, and any tool that calls an external service says so.",
    primaryTool: null,
    relatedTools: pdfRelated(["merge-pdf", "split-pdf", "compress-images-inside-pdf", "rotate-pdf", "jpg-to-pdf", "pdf-to-word"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
    ],
    intro: "GainUtility's PDF toolkit processes files in your browser, so most PDFs stay on your device. Merge multiple PDFs, split by page range, compress file sizes, rotate pages, convert between PDF, images, and Office documents, and much more. One tool, the PDF Translator, sends extracted text to a translation service and discloses that on its page.",
    useCases: [
      { title: "Merge Multiple PDFs", desc: "Combine multiple PDF documents into a single file. Drag and drop to reorder pages before merging." },
      { title: "Split PDF by Page", desc: "Extract specific pages or ranges from a PDF. Split every N pages or separate by file size." },
      { title: "Compress PDF Size", desc: "Reduce PDF file size for email attachments and web uploads while maintaining quality." },
      { title: "Convert Images to PDF", desc: "Turn JPG, PNG, or other images into a clean PDF document with customizable margins." },
    ],
    steps: [
      "Choose the PDF tool you need from the collection above.",
      "Drop your PDF files into the upload zone or click to browse.",
      "Adjust settings like page ranges, compression level, or output format.",
      "Click the action button and download your processed PDF instantly.",
    ],
    faq: [
      { question: "Are my PDF files uploaded to a server?", answer: "Most tools process your PDF directly in your browser, so the file stays on your device. The PDF Translator is the exception - it sends the extracted text to a translation service, and this is disclosed on its own page." },
      { question: "Is there a file size limit?", answer: "Processing is limited by your browser's memory. Most files up to 100MB work smoothly. For very large files, try splitting first." },
      { question: "Can I use these tools on mobile?", answer: "Yes. All PDF tools are responsive and work on smartphones and tablets through your mobile browser." },
    ],
    sections: [
      {
        type: "chooser",
        heading: "Which PDF tool do I need?",
        note: "Pick the job rather than the tool name. Every tool below is free, needs no account, and states on its own page where the file is processed.",
        items: [
          { label: "Compress a PDF", path: "/pdf/compress", hint: "Shrink an image-heavy scan until it clears an email or upload cap." },
          { label: "Merge PDFs", path: "/pdf/merge", hint: "Combine separate scans or exports into one document." },
          { label: "Split a PDF", path: "/pdf/split", hint: "Pull out a page range, or break a large file into pieces." },
          { label: "Convert PDF to Word", path: "/pdf/pdf-to-word", hint: "Make a born-digital PDF editable again." },
          { label: "Convert images to PDF", path: "/pdf/jpg-to-pdf", hint: "Turn a stack of photos or scans into one document." },
          { label: "Rotate PDF pages", path: "/pdf/rotate", hint: "Fix sideways pages before you send the file on." },
          { label: "Convert PDF to JPG", path: "/tools/pdf-to-jpg", hint: "Export pages as images for slides, posts or previews." },
          { label: "Remove PDF pages", path: "/tools/delete-pdf", hint: "Drop blank, duplicate or irrelevant pages." },
          { label: "Protect a PDF", path: "/tools/protect-pdf", hint: "Add a password and restrict printing or copying." },
          { label: "Read a scanned PDF", path: "/tools/ocr-pdf", hint: "Recover the text from a scan that has none." },
        ],
      },
      {
        type: "comparison",
        heading: "Compared on three published facts",
        note: "Three questions, and only what each service publishes about itself: does it need an account, does the file leave your device, and what the free tier allows.",
        columns: ["Service", "Account required?", "File uploaded to a server?", "Free-tier limits"],
        verified: "2026-10-01",
        rows: [
          {
            name: "GainUtility",
            cells: [
              "No - the site has no accounts and no sign-up.",
              "No for the PDF tools: they run in your browser. The PDF Translator is the exception, and it says so on its own page.",
              "No published caps - no daily task limit and no file-size paywall.",
            ],
            sources: [{ label: "How GainUtility handles files", href: "/privacy" }],
          },
          {
            name: "Smallpdf",
            cells: [
              "No - the free plan is available to non-registered users.",
              "Yes - the file is uploaded and transferred over TLS.",
              "2 conversions per day on the free plan.",
            ],
            sources: [{ label: "smallpdf.com/support", href: "https://smallpdf.com/support" }],
          },
          {
            name: "iLovePDF",
            cells: [
              "No - the vendor says no account or download is required.",
              "Yes - upload the file, download the result.",
              "Limited document processing; the vendor does not publish a number.",
            ],
            sources: [
              { label: "ilovepdf.com/pricing", href: "https://www.ilovepdf.com/pricing" },
              { label: "ilovepdf.com blog", href: "https://www.ilovepdf.com/blog/edit-pdf-without-adobe-acrobat-ilovepdf" },
            ],
          },
          {
            name: "PDF2Go",
            cells: [
              "No - the vendor states no signup is required.",
              "Yes - the file is uploaded for processing.",
              "100 MB free upload cap; free daily Credits, count not published.",
            ],
            sources: [
              { label: "pdf2go.com/help", href: "https://www.pdf2go.com/help" },
              { label: "pdf2go.com blog", href: "https://www.pdf2go.com/blog/premium-plans-unveiled" },
            ],
          },
          {
            name: "PDF24",
            cells: [
              "Not stated on the vendor's FAQ.",
              "Yes - uploaded, and deleted from the server within one hour.",
              "Free of charge and without restriction; the vendor states there are no artificial limits.",
            ],
            sources: [
              { label: "tools.pdf24.org FAQ", href: "https://tools.pdf24.org/en/faq" },
              { label: "tools.pdf24.org", href: "https://tools.pdf24.org/en/" },
            ],
          },
          {
            name: "Sejda",
            cells: [
              "No - the pricing page states No signup required.",
              "Yes - documents are uploaded and processed on the vendor's servers.",
              "Page and hourly limits plus tool-specific limits; the pricing page does not publish the numbers.",
            ],
            sources: [{ label: "sejda.com/pricing", href: "https://www.sejda.com/pricing" }],
          },
        ],
      },
      {
        type: "links",
        heading: "PDF how-to guides",
        items: [
          { path: "/blog/how-to-merge-pdf-files", title: "Merge multiple PDFs into one file", desc: "Order pages first: how to lay out scans and exports before combining them." },
          { path: "/blog/how-to-split-a-pdf", title: "Split a PDF into separate files", desc: "By page range, by bookmark, or by removing blank pages first." },
          { path: "/blog/how-to-compress-a-pdf", title: "Compress a PDF without losing what you need", desc: "Where the size comes from, and how to reduce it in checkable steps." },
          { path: "/blog/pdf-file-size-limits", title: "PDF file size limits by destination", desc: "What email, portals and upload forms actually accept, and the fixes in order." },
          { path: "/blog/fix-pdf-too-big-to-upload", title: "Fix a PDF that is too big to upload", desc: "Get under an application or portal size cap without re-scanning." },
          { path: "/blog/how-to-convert-pdf-to-word", title: "Convert a PDF to Word", desc: "What converts cleanly, what you rebuild, and when OCR comes first." },
          { path: "/blog/how-to-convert-word-to-pdf", title: "Convert a Word document to PDF", desc: "Lock the layout you approved - and the three checks worth making." },
          { path: "/blog/are-online-pdf-tools-safe", title: "Are online PDF tools safe?", desc: "Quoted retention terms from the major tools, and how to verify any tool." },
        ],
      },
    ],
    keywords: ["pdf tools online free", "merge pdf", "split pdf", "compress pdf", "pdf editor online"],
  },

  // ────────────── PDF Tool Pages ──────────────
  {
    slug: "merge",
    path: `${PDF_ROOT}/merge`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free PDF Merge Tool — Combine Multiple PDFs | GainUtility",
    description: "Merge multiple PDF files into one document instantly. Drag and drop to reorder pages. Free, fast, and completely private — no uploads needed.",
    primaryTool: "merge-pdf",
    relatedTools: pdfRelated(["split-pdf", "compress-images-inside-pdf", "rearrange-pdf", "extract-pdf", "rotate-pdf"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "Merge PDF", url: `${PDF_ROOT}/merge` },
    ],
    intro: "Combine multiple PDF documents into a single, organized file. Our merge tool lets you drag and drop files to reorder them before combining, all directly in your browser with zero server uploads.",
    useCases: [
      { title: "Combine Contracts", desc: "Merge multiple contract pages or addenda into one complete document for signing." },
      { title: "Assemble Reports", desc: "Combine section-specific PDFs into a single combined report." },
      { title: "Merge Scanned Pages", desc: "Join individually scanned pages into one continuous PDF document." },
    ],
    steps: [
      "Drop your PDF files into the merge zone.",
      "Drag files to reorder them in the desired sequence.",
      "Click Merge to combine all files into one PDF.",
      "Download the merged PDF to your device.",
    ],
    faq: [
      { question: "How many PDFs can I merge at once?", answer: "You can merge as many PDFs as your browser can handle. Most browsers easily manage 20+ files simultaneously." },
      { question: "Does merging affect PDF quality?", answer: "No. Merging preserves the original quality of all pages. No compression or quality loss occurs during the merge process." },
    ],
    sections: [
      {
        type: "links",
        heading: "Merging PDFs: the guide",
        items: [
          { path: "/blog/how-to-merge-pdf-files", title: "How to merge multiple PDFs into one file", desc: "Page order, mixed scans and exports, and the checks worth making after." },
          { path: "/blog/how-to-convert-jpg-to-pdf", title: "Convert JPG to PDF first", desc: "When part of the document is a stack of photos or scans." },
        ],
      },
    ],
    keywords: ["merge pdf online free", "combine pdf files", "join pdf", "pdf merge tool"],
  },
  {
    slug: "compress",
    path: `${PDF_ROOT}/compress`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free PDF Compressor — Reduce File Size | GainUtility",
    description: "Compress PDF files online for free. Reduce PDF file size for email and web uploads by shrinking the embedded images — fast, private, no uploads.",
    primaryTool: "compress-images-inside-pdf",
    relatedTools: pdfRelated(["merge-pdf", "optimize-pdf-web", "reduce-pdf-image-quality", "compress-images-inside-pdf"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "Compress PDF", url: `${PDF_ROOT}/compress` },
    ],
    intro: "Reduce the file size of large, image-heavy PDFs without sacrificing readability. Compress the embedded images — scans, photos, and screenshots — to shrink the whole file for email attachments, web uploads, and storage. Everything runs locally in your browser.",
    useCases: [
      { title: "Email Attachments", desc: "Shrink image-heavy PDFs below email size limits while keeping text crisp and images clear." },
      { title: "Web Uploads", desc: "Reduce file sizes for platforms with upload limits like government portals or job applications." },
      { title: "Storage Optimization", desc: "Save disk space by compressing large PDF archives full of scanned pages and photos." },
    ],
    steps: [
      "Upload your PDF that contains large embedded images or scans.",
      "Adjust the image quality or scale slider to the desired balance.",
      "Watch the projected file size update instantly as you tweak.",
      "Download the smaller, compacted PDF.",
    ],
    faq: [
      { question: "How much can I reduce a PDF's size?", answer: "Compressing the embedded images typically reduces file size by 30-70% depending on the original content. PDFs with many high-resolution images compress more than text-only documents." },
      { question: "Is the compressed PDF lower quality?", answer: "At low and medium compression levels, quality differences are imperceptible. High compression may slightly reduce image resolution." },
    ],
    sections: [
      {
        type: "links",
        heading: "Reducing PDF size: the guides",
        items: [
          { path: "/blog/how-to-compress-a-pdf", title: "How to compress a PDF without losing what you need", desc: "See where the size comes from, then compress in steps you can check." },
          { path: "/blog/pdf-file-size-limits", title: "PDF file size limits by destination", desc: "The published caps for email, portals and web uploads, and how much headroom to leave." },
          { path: "/blog/fix-pdf-too-big-to-upload", title: "Fix a PDF that is too big to upload", desc: "When a portal or application cap is the blocker, and how to get under it." },
        ],
      },
    ],
    keywords: ["compress pdf online free", "reduce pdf size", "pdf compressor", "shrink pdf file"],
  },
  {
    slug: "split",
    path: `${PDF_ROOT}/split`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free PDF Splitter — Extract Pages from PDF | GainUtility",
    description: "Split PDF files online for free. Extract specific pages, split by range, or separate every page. Fast, private, no uploads required.",
    primaryTool: "split-pdf",
    relatedTools: pdfRelated(["merge-pdf", "extract-pdf", "extract-odd-pages-pdf", "extract-even-pages-pdf", "rearrange-pdf"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "Split PDF", url: `${PDF_ROOT}/split` },
    ],
    intro: "Extract pages from any PDF with precision. Split by page range, extract odd/even pages, or separate every page into individual files — all processed locally in your browser.",
    useCases: [
      { title: "Extract Report Sections", desc: "Pull specific chapter ranges from a large document into a focused subset." },
      { title: "Separate Signed Pages", desc: "Extract only the signature pages from a contract for independent archiving." },
      { title: "Split by File Size", desc: "Divide large PDFs into smaller chunks that meet upload size limits." },
    ],
    steps: [
      "Upload your PDF file.",
      "Choose split mode: by range, every N pages, or extract individual pages.",
      "Enter page ranges or settings.",
      "Download the split PDF files as individual downloads or a ZIP.",
    ],
    faq: [
      { question: "Can I extract non-consecutive pages?", answer: "Yes. Use the page range mode to specify non-consecutive pages like 1,3,5-8,12." },
      { question: "Will the extracted pages retain formatting?", answer: "Absolutely. Extracted pages preserve all formatting, images, fonts, and links from the original PDF." },
    ],
    sections: [
      {
        type: "links",
        heading: "Splitting PDFs: the guide",
        items: [
          { path: "/blog/how-to-split-a-pdf", title: "How to split a PDF and keep only the pages you need", desc: "Most splits are range extraction, not division in half - pick the pages." },
          { path: "/blog/how-to-merge-pdf-files", title: "How to merge PDFs back together", desc: "For when the split was temporary and the file needs to be whole again." },
        ],
      },
    ],
    keywords: ["split pdf online free", "extract pdf pages", "pdf splitter", "separate pdf pages"],
  },
  {
    slug: "pdf-to-word",
    path: `${PDF_ROOT}/pdf-to-word`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free Online PDF to Word Converter | GainUtility",
    description: "Convert PDF to Word documents online for free. Preserve formatting, tables, and images. Fast conversion with complete privacy — no uploads.",
    primaryTool: "pdf-to-word",
    relatedTools: pdfRelated(["word-to-pdf", "pdf-to-text", "pdf-to-excel", "pdf-to-html"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "PDF to Word", url: `${PDF_ROOT}/pdf-to-word` },
    ],
    intro: "Convert your PDF documents into editable Word files while preserving formatting, tables, images, and text layout. Processed entirely in your browser for maximum privacy.",
    useCases: [
      { title: "Edit PDF Content", desc: "Convert PDFs to Word for easy editing of text, tables, and formatting." },
      { title: "Resume Templates", desc: "Convert PDF resume templates into editable Word documents for customization." },
      { title: "Contract Modifications", desc: "Turn PDF contracts into editable Word files for clause revisions." },
    ],
    steps: [
      "Upload your PDF document.",
      "Click Convert to Word.",
      "Wait for the conversion to complete.",
      "Download the editable .docx file.",
    ],
    faq: [
      { question: "Does the conversion preserve formatting?", answer: "Our converter preserves most formatting including tables, headings, and images. Complex layouts may need minor adjustments in Word." },
      { question: "Can I convert password-protected PDFs?", answer: "You'll need to unlock the PDF first using our Unlock PDF tool, then convert the unprotected version." },
    ],
    sections: [
      {
        type: "links",
        heading: "PDF to Word: the guide",
        items: [
          { path: "/blog/how-to-convert-pdf-to-word", title: "How to convert a PDF to Word without losing the text", desc: "What converts cleanly, what you rebuild by hand, and when OCR has to come first." },
          { path: "/blog/how-to-convert-word-to-pdf", title: "How to convert a Word document to PDF", desc: "The other direction, and the checks worth making before you send it." },
          { path: "/blog/are-online-pdf-tools-safe", title: "Are online PDF tools safe?", desc: "What happens to a document you upload - and how to check any tool yourself." },
        ],
      },
    ],
    keywords: ["pdf to word converter free", "convert pdf to docx", "pdf to word online", "edit pdf as word"],
  },
  {
    slug: "rotate",
    path: `${PDF_ROOT}/rotate`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free PDF Rotate Tool — Fix Page Orientation | GainUtility",
    description: "Rotate PDF pages online for free. Fix page orientation with instant preview. Rotate specific or all pages. Private, fast, no uploads.",
    primaryTool: "rotate-pdf",
    relatedTools: pdfRelated(["crop-pdf", "rearrange-pdf", "merge-pdf", "delete-pdf"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "Rotate PDF", url: `${PDF_ROOT}/rotate` },
    ],
    intro: "Fix PDF page orientation instantly. Rotate specific pages or the entire document with real-time browser preview. No server uploads required.",
    useCases: [
      { title: "Fix Scanned Documents", desc: "Correct orientation of pages scanned at the wrong angle." },
      { title: "Landscape Pages", desc: "Rotate landscape pages in a portrait-oriented document for consistent viewing." },
      { title: "Presentation Slides", desc: "Adjust orientation of PDF presentation slides for proper display." },
    ],
    steps: [
      "Upload your PDF file.",
      "Preview all pages in the grid view.",
      "Click rotate buttons on individual pages or use Rotate All.",
      "Download the corrected PDF.",
    ],
    faq: [
      { question: "Can I rotate only specific pages?", answer: "Yes. Click the rotate button on individual pages to rotate them independently, or use the Rotate All option for the entire document." },
    ],
    keywords: ["rotate pdf online free", "rotate pdf pages", "fix pdf orientation", "pdf rotator"],
  },
  {
    slug: "jpg-to-pdf",
    path: `${PDF_ROOT}/jpg-to-pdf`,
    category: "PDF Tools",
    categorySlug: "pdf",
    title: "Free Online JPG to PDF Converter | GainUtility",
    description: "Convert JPG and PNG images to PDF files online for free. Custom margins, page sizes, and layouts. Fast and private — no uploads.",
    primaryTool: "jpg-to-pdf",
    relatedTools: pdfRelated(["text-to-pdf", "pdf-to-jpg", "compress-images-inside-pdf", "merge-pdf"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "PDF Tools", url: PDF_ROOT },
      { name: "Image to PDF", url: `${PDF_ROOT}/jpg-to-pdf` },
    ],
    intro: "Turn your JPG, PNG, or other images into clean PDF documents. Customize page size, margins, and layout — all processed locally in your browser.",
    useCases: [
      { title: "Create Photo Albums", desc: "Combine multiple photos into a single PDF album with consistent page layouts." },
      { title: "Document Scans", desc: "Convert scanned images into a proper PDF document for archiving." },
      { title: "Submission Packages", desc: "Bundle multiple image attachments into one PDF for application submissions." },
    ],
    steps: [
      "Drag and drop your image files into the converter.",
      "Arrange images in the desired order.",
      "Select page size, margins, and orientation.",
      "Click Convert and download your PDF.",
    ],
    faq: [
      { question: "What image formats are supported?", answer: "We support JPG, JPEG, PNG, BMP, GIF, TIFF, and WebP image formats for conversion to PDF." },
    ],
    sections: [
      {
        type: "links",
        heading: "Images and PDFs: the guides",
        items: [
          { path: "/blog/how-to-convert-jpg-to-pdf", title: "How to convert JPG images to a PDF", desc: "Reading order, page size, and margins - the three things that decide the result." },
          { path: "/blog/how-to-convert-pdf-to-jpg", title: "How to convert PDF pages to JPG", desc: "The reverse direction, when each page has to become a separate image." },
          { path: "/blog/how-to-merge-pdf-files", title: "How to merge multiple PDFs into one file", desc: "Combine the file you just made with the rest of the document." },
        ],
      },
    ],
    keywords: ["jpg to pdf converter free", "image to pdf", "png to pdf", "photos to pdf"],
  },

  // ────────────── JSON Hub ──────────────
  {
    slug: "json",
    path: JSON_ROOT,
    category: "JSON Tools",
    categorySlug: "json",
    title: "Free JSON Tools — Format, Validate & Convert | GainUtility",
    description: "Use free JSON tools in your browser. Format, validate, minify, compare, and convert JSON data instantly. Fast, private, no uploads.",
    primaryTool: null,
    relatedTools: jsonRelated(["json-beautifier", "json-validator", "json-minifier", "json-tree-viewer", "json-compare-diff", "json-to-csv"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: JSON_ROOT },
    ],
    intro: "GainUtility's JSON toolkit helps developers format, validate, compare, and transform JSON data — all processed locally in your browser. No data ever leaves your device.",
    useCases: [
      { title: "Format & Beautify", desc: "Prettify minified JSON with syntax highlighting and custom indentation." },
      { title: "Validate & Debug", desc: "Find syntax errors with line numbers and character positions for quick debugging." },
      { title: "Compare & Diff", desc: "Side-by-side comparison to spot structural differences between JSON objects." },
      { title: "Convert Data", desc: "Transform JSON to CSV, or convert CSV/XML to JSON format." },
    ],
    steps: [
      "Choose the JSON tool you need from the collection.",
      "Paste or type your JSON data into the editor.",
      "Use the tool's features — format, validate, compare, or convert.",
      "Copy the result or download it as a file.",
    ],
    faq: [
      { question: "Is my JSON data sent to a server?", answer: "No. All JSON processing happens entirely in your browser. Your data never leaves your device." },
      { question: "What JSON features are supported?", answer: "Full JSON specification support including nested objects, arrays, unicode strings, and numeric types." },
    ],
    sections: [
      {
        type: "chooser",
        heading: "Which JSON job do you have?",
        note: "Pick the job rather than the tool name. Each one runs in your browser, so your payload is never uploaded.",
        items: [
          { label: "Format and beautify JSON", path: `${JSON_ROOT}/formatter`, hint: "Prettify a minified response with consistent indentation and syntax highlighting." },
          { label: "Validate JSON", path: `${JSON_ROOT}/validator`, hint: "Catch syntax errors with the line number and character position." },
          { label: "Read JSON as a tree", path: `${JSON_ROOT}/viewer`, hint: "Expand and collapse nested objects and arrays instead of scanning raw text." },
        ],
      },
    ],
    keywords: ["json formatter online free", "json validator", "json tools", "format json online"],
  },

  // ────────────── JSON Tool Pages ──────────────
  {
    slug: "formatter",
    path: `${JSON_ROOT}/formatter`,
    category: "JSON Tools",
    categorySlug: "json",
    title: "Free Online JSON Formatter & Beautifier | GainUtility",
    description: "Format and beautify JSON data instantly. Syntax highlighting, custom indentation, error detection. Free, fast, and private — no uploads.",
    primaryTool: "json-beautifier",
    relatedTools: jsonRelated(["json-minifier", "json-validator", "json-tree-viewer", "json-compare-diff"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: JSON_ROOT },
      { name: "JSON Beautifier", url: `${JSON_ROOT}/formatter` },
    ],
    intro: "Beautify minified or messy JSON data with instant formatting. Supports 2, 4, and 8-space indentation with syntax highlighting and error detection — all running locally in your browser.",
    useCases: [
      { title: "API Response Debugging", desc: "Format raw API responses for easier reading and debugging." },
      { title: "Config File Formatting", desc: "Prettify minified configuration files like package.json or tsconfig.json." },
      { title: "Code Review", desc: "Format JSON payloads for cleaner code review and documentation." },
    ],
    steps: [
      "Paste your JSON data into the input area.",
      "Select your preferred indentation style (2, 4, or 8 spaces).",
      "Click Format to beautify the JSON.",
      "Copy the formatted output or download it.",
    ],
    faq: [
      { question: "What happens if my JSON has syntax errors?", answer: "The formatter highlights the exact line and character position of any syntax error, making it easy to fix." },
    ],
    keywords: ["json formatter online", "beautify json", "format json", "json pretty print"],
  },
  {
    slug: "validator",
    path: `${JSON_ROOT}/validator`,
    category: "JSON Tools",
    categorySlug: "json",
    title: "Free Online JSON Validator — Check JSON Syntax | GainUtility",
    description: "Validate JSON data instantly. Find syntax errors with line numbers and detailed messages. Free, fast, private — runs in your browser.",
    primaryTool: "json-validator",
    relatedTools: jsonRelated(["json-beautifier", "json-schema-validator", "json-minifier", "json-tree-viewer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: JSON_ROOT },
      { name: "JSON Validator", url: `${JSON_ROOT}/validator` },
    ],
    intro: "Validate JSON syntax with detailed error messages, line numbers, and character positions. Our validator catches common mistakes like trailing commas, missing quotes, and structural errors — all processed locally.",
    useCases: [
      { title: "Debug API Payloads", desc: "Quickly find syntax issues in JSON sent to or received from APIs." },
      { title: "Validate Config Files", desc: "Check configuration files before deploying to production." },
      { title: "Data Quality Check", desc: "Ensure JSON data from external sources is valid before processing." },
    ],
    steps: [
      "Paste your JSON data into the input panel.",
      "Click Validate to check the syntax.",
      "Review the validation results and error messages.",
      "Fix any highlighted issues and re-validate.",
    ],
    faq: [
      { question: "What types of errors does it detect?", answer: "It detects missing commas, trailing commas, unclosed brackets, unquoted keys, invalid strings, and structural nesting errors." },
    ],
    keywords: ["json validator online", "validate json", "check json syntax", "json error checker"],
  },
  {
    slug: "viewer",
    path: `${JSON_ROOT}/viewer`,
    category: "JSON Tools",
    categorySlug: "json",
    title: "Free Online JSON Viewer — Explore JSON Trees | GainUtility",
    description: "View and explore JSON data as an interactive tree. Collapse, expand, search keys, and copy JSON paths. Free, fast, private.",
    primaryTool: "json-tree-viewer",
    relatedTools: jsonRelated(["json-beautifier", "json-compare-diff", "json-minifier"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "JSON Tools", url: JSON_ROOT },
      { name: "JSON Tree Viewer", url: `${JSON_ROOT}/viewer` },
    ],
    intro: "Explore complex JSON structures as an interactive tree. Collapse and expand nodes, search by key name, and copy JSON paths — all processed locally in your browser.",
    useCases: [
      { title: "API Response Exploration", desc: "Navigate deeply nested API responses with collapsible tree nodes." },
      { title: "Data Structure Analysis", desc: "Understand the shape and hierarchy of complex JSON datasets." },
      { title: "Path Extraction", desc: "Copy exact JSON paths for specific values to use in code or documentation." },
    ],
    steps: [
      "Paste your JSON data into the viewer.",
      "The tree renders automatically with collapsible nodes.",
      "Use the search bar to find specific keys.",
      "Click on any value to copy its JSON path.",
    ],
    faq: [
      { question: "How large can the JSON be?", answer: "The viewer handles JSON up to several megabytes. For extremely large files, the tree renders progressively for smooth performance." },
    ],
    keywords: ["json viewer online", "json tree viewer", "explore json", "json path finder"],
  },

  // ────────────── Image Hub ──────────────
  {
    slug: "image",
    path: IMAGE_ROOT,
    category: "Image Tools",
    categorySlug: "image",
    h1: "Free Online Image Tools",
    title: "Free Image Tools — Compress, Resize & Convert | GainUtility",
    description: "Free image tools to compress, resize, crop, convert, remove backgrounds and more. Process supported images in your browser with no account required.",
    primaryTool: null,
    relatedTools: imageRelated([
      "image-converter",
      "image-resizer",
      "image-cropper",
      "background-remover",
      "image-watermark",
      "image-blur-pixelate",
      "social-resizer",
      "logo-maker",
      "image-metadata-remover",
      "image-upscaler",
      "passport-photo-maker",
      "collage-maker",
      "favicon-generator",
      "linkedin-carousel-maker",
    ]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Image Tools", url: IMAGE_ROOT },
    ],
    intro: "Compress, resize, crop, convert and edit images directly in your browser. Most tools process files on your device, so you can get the result without creating an account.",
    useCases: [
      { title: "Compress & Optimize", desc: "Shrink image file size for websites, emails, or strict portal uploads without visible quality degradation." },
      { title: "Resize & Crop", desc: "Scale dimensions by exact pixels or percentage, or crop photos with preset aspect ratios." },
      { title: "Convert Formats", desc: "Convert between JPG, PNG, modern WebP, Apple HEIC, and vector SVG formats directly." },
      { title: "Edit & Censor", desc: "Isolate subjects with transparent cutouts, blur sensitive private data, or strip camera EXIF and GPS tags." },
    ],
    steps: [
      "Select the image tool matching your task.",
      "Drop or choose photos from your computer or phone.",
      "Adjust dimensions, format, or quality settings.",
      "Download your processed images immediately with zero server uploads.",
    ],
    faq: [
      { question: "What image formats can I use?", answer: "GainUtility supports JPG, JPEG, PNG, WebP, Apple HEIC/HEIF, SVG, BMP, and TIFF formats." },
      { question: "Are my images uploaded?", answer: "No. Most GainUtility image tools process files directly in your browser using HTML5 Canvas, WebAssembly, and local workers. Your photos never leave your device." },
      { question: "Can I compress multiple images at once?", answer: "Yes. Tools like Image Converter & Compressor, Image Resizer, Image Watermark, and Background Remover support batch processing and ZIP download." },
      { question: "How do I reduce image size without making it blurry?", answer: "Use visual quality compression between 80% and 85%, or convert to modern WebP. This preserves sharp edges and fine details while stripping invisible data." },
      { question: "What is the difference between JPG, PNG and WebP?", answer: "JPG is ideal for photographs, PNG supports lossless transparency, and WebP provides superior compression for both photographs and transparent graphics with smaller file sizes." },
      { question: "How do I convert HEIC to JPG?", answer: "Use our Image Converter — select iPhone HEIC photos directly from your computer or phone, and they are decoded locally to universal JPG files." },
      { question: "Can I resize an image to exact pixels?", answer: "Yes. The Image Resizer lets you enter custom width and height in pixels with an optional aspect ratio lock to prevent distortion." },
      { question: "Can I use these image tools on my phone?", answer: "Yes. All GainUtility image tools are built with responsive mobile layouts and work directly in Safari, Chrome, and mobile browsers." },
    ],
    sections: [
      {
        type: "chooser",
        heading: "Which image job do you have?",
        note: "Pick the job rather than the tool name. Files are processed on your device unless a page says otherwise.",
        items: [
          { label: "Resize an image", path: `${IMAGE_ROOT}/resize`, hint: "Scale to exact pixels or a percentage with an aspect-ratio lock, one file or a batch." },
        ],
      },
      {
        type: "links",
        heading: "Resizing, step by step",
        items: [
          { path: "/blog/how-to-resize-an-image", title: "Resize an image the right way", desc: "Pixels versus percentage, when to upsample, and the quality settings worth keeping." },
        ],
      },
    ],
    keywords: ["free online image tools", "image compressor", "image resizer", "image converter", "crop image", "background remover", "webp converter", "heic to jpg"],
  },

  // ────────────── Image Tool Pages ──────────────
  {
    slug: "resize-image",
    path: `${IMAGE_ROOT}/resize`,
    category: "Image Tools",
    categorySlug: "image",
    title: "Free Image Resizer — Change Photo Dimensions | GainUtility",
    description: "Resize images online for free. Scale by pixels or percentage with aspect ratio lock. Batch resize with preview. Fast and private.",
    primaryTool: "image-resizer",
    relatedTools: imageRelated(["image-cropper", "image-converter", "social-resizer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Image Tools", url: IMAGE_ROOT },
      { name: "Image Resizer", url: `${IMAGE_ROOT}/resize` },
    ],
    intro: "Change image dimensions by exact pixels or percentage scaling. Our resizer preserves aspect ratios and supports batch processing — all client-side for complete privacy.",
    useCases: [
      { title: "Responsive Images", desc: "Create multiple size variants for responsive web design." },
      { title: "Thumbnail Generation", desc: "Resize photos to standard thumbnail dimensions for galleries." },
      { title: "Print Preparation", desc: "Scale images to exact print dimensions at specific DPI values." },
    ],
    steps: [
      "Upload your images to the resizer.",
      "Enter target width and height in pixels or percentage.",
      "Enable aspect ratio lock to prevent distortion.",
      "Download resized images or batch ZIP.",
    ],
    faq: [
      { question: "Will resizing distort my image?", answer: "With aspect ratio lock enabled, images are scaled proportionally. Disabling the lock allows freeform resizing which may distort the image." },
    ],
    keywords: ["resize image online free", "change image dimensions", "image resizer tool", "scale photo"],
  },

  // ────────────── CSS Hub ──────────────
  {
    slug: "css",
    path: CSS_ROOT,
    category: "CSS Tools",
    categorySlug: "css",
    title: "Free CSS Tools — Gradients, Shadows & Design | GainUtility",
    description: "Use free CSS tools in your browser. Generate gradients, box shadows, border radius, check contrast, and explore design systems. No uploads needed.",
    primaryTool: null,
    relatedTools: [
      { id: "gradient-generator", name: "Gradient Generator", description: "Design multi-stop CSS gradients." },
      { id: "box-shadow-generator", name: "CSS Box Shadow Generator", description: "Design layered, inset, or soft CSS shadows." },
      { id: "border-radius-generator", name: "Border Radius Generator", description: "Design asymmetric corners and blobs." },
      { id: "contrast-checker", name: "Contrast Checker", description: "Verify WCAG color contrast compliance." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "CSS Tools", url: CSS_ROOT },
    ],
    intro: "GainUtility's CSS toolkit helps designers and developers create beautiful visual effects. Generate gradients, construct multi-layer shadows, design border radius patterns, and verify color accessibility — all with live preview.",
    useCases: [
      { title: "Gradient Design", desc: "Create linear and radial gradients with multiple color stops, randomize palettes, and export as CSS or PNG." },
      { title: "Shadow Construction", desc: "Build multi-layer box shadows with custom offsets, blur, spread, and color controls." },
      { title: "Accessibility Checking", desc: "Verify color combinations meet WCAG AA and AAA contrast standards." },
    ],
    steps: [
      "Choose the CSS tool you need from the collection.",
      "Adjust parameters using the interactive controls.",
      "Preview changes in real-time.",
      "Copy the generated CSS code or export assets.",
    ],
    faq: [
      { question: "Can I export CSS code?", answer: "Yes. All CSS tools generate copy-ready CSS code. Some tools also support Tailwind CSS class approximations and PNG exports." },
      { question: "Which tool should I use for shadows?", answer: "The CSS Box Shadow Generator handles box-shadow and text-shadow with layered presets and live preview. Its guide, examples gallery, and multi-layer tutorial live under /css/box-shadow." },
    ],
    keywords: ["css tools online free", "css gradient generator", "box shadow generator", "css design tools"],
    sections: [
      {
        type: "links",
        heading: "Box-shadow guides",
        items: [
          { path: "/css/box-shadow", title: "box-shadow syntax & values", desc: "What each value does, with copy-ready examples and a live generator." },
          { path: "/css/box-shadow/examples", title: "Box-shadow examples gallery", desc: "Cards, buttons, inputs, rings, and glows — preview and copy each one." },
          { path: "/css/box-shadow/multiple-shadows", title: "Multiple box-shadows", desc: "How comma-separated layers stack, paint, and combine into real depth." },
        ],
      },
      {
        type: "links",
        heading: "Box-shadow articles",
        items: [
          { path: "/blog/box-shadow-values-real-websites", title: "Values real websites ship", desc: "33,438 measured declarations from the CSS of the top 1,000 sites." },
          { path: "/blog/box-shadow-vs-drop-shadow-filter", title: "box-shadow vs drop-shadow", desc: "Border-box rectangle versus alpha-shape shadow, with side-by-side demos." },
          { path: "/blog/soft-shadow-css-recipes", title: "Soft shadow recipes", desc: "Copy-ready values that stay clean, and why stacked shadows go muddy." },
          { path: "/blog/neumorphism-box-shadow-guide", title: "Neumorphism box-shadow guide", desc: "The two-layer light/dark formula, the inset flip, and where it works." },
        ],
      },
    ],
  },

  // ────────────── Box-shadow guide (/css/box-shadow) ──────────────
  {
    slug: "box-shadow",
    path: `${CSS_ROOT}/box-shadow`,
    category: "CSS Tools",
    categorySlug: "css",
    title: "CSS box-shadow Guide — Syntax & Examples | GainUtility",
    description:
      "What every box-shadow value does: offsets, blur, spread, color, inset and stacked layers, with copy-ready examples and when text-shadow or drop-shadow wins.",
    h1: "CSS box-shadow: syntax, values, and examples",
    primaryTool: "box-shadow-generator",
    relatedTools: [
      { id: "box-shadow-generator", name: "CSS Box Shadow Generator", description: "Design layered, inset, or soft CSS shadows." },
      { id: "border-radius-generator", name: "Border Radius Generator", description: "Design asymmetric corners and blobs." },
      { id: "gradient-generator", name: "Gradient Generator", description: "Design multi-stop CSS gradients." },
      { id: "contrast-checker", name: "Contrast Checker", description: "Verify WCAG color contrast compliance." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "CSS Tools", url: CSS_ROOT },
      { name: "box-shadow", url: `${CSS_ROOT}/box-shadow` },
    ],
    intro:
      "box-shadow paints one or more blurred copies of an element's border box behind it. Each layer is an X offset, a Y offset, an optional blur, an optional spread, and a color — comma-separated when you stack them. This page is the reference: what each value does, what real sites ship, and copy-ready starting points you can tune in the generator below.",
    sections: [
      {
        type: "paragraphs",
        items: [
          "The shadow silhouette comes from the element's own border box, so border-radius on the same element rounds the shadow too. A shadow with no offset and no spread sits entirely behind the element — only the blur peeks out around the edges, which is why 0 0 with a visible color reads as a soft halo rather than depth.",
        ],
      },
      {
        type: "heading",
        text: "Syntax at a glance",
      },
      {
        type: "code",
        label: "Full layer syntax",
        content: "box-shadow: offset-x offset-y blur-radius spread-radius color;",
      },
      {
        type: "code",
        label: "Inset (draws inside the border box)",
        content: "box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);",
      },
      {
        type: "paragraphs",
        items: [
          "Blur and spread are optional — drop them and the layer still parses, because color is unambiguous at the end while a bare length could be misread. Writing color last (or using a color function like rgba()) keeps the parser from treating a color keyword as a length.",
        ],
      },
      {
        type: "heading",
        text: "What each value does",
      },
      {
        type: "table",
        columns: ["Value", "What it does", "Starting point"],
        rows: [
          ["offset-x", "Moves the shadow right (positive) or left (negative) from the border box.", "0 — production CSS pins X at zero almost universally"],
          ["offset-y", "Moves the shadow down (positive) or up (negative).", "0 to −4 px; down a little, or straight down"],
          ["blur-radius", "Feathers the edge outward from the silhouette. 0 keeps a hard edge.", "Single digits for cards; 0 for focus rings"],
          ["spread-radius", "Grows (positive) or shrinks (negative) the silhouette before blurring. Box-shadow only.", "0, or −4 to −8 px to tuck wide blurs under a card"],
          ["color", "Any CSS color. With alpha it composites over what sits behind it.", "rgba(0,0,0,0.08) to rgba(0,0,0,0.3)"],
          ["inset", "Keyword before the lengths; flips the shadow inside the border box.", "Pressed buttons, input wells, the dark half of soft UI"],
        ],
        caption: "The six parts of a box-shadow layer, with practical starting values.",
      },
      {
        type: "heading",
        text: "Copy-ready starting points",
      },
      {
        type: "paragraphs",
        items: [
          "Each preview below applies exactly the declaration shown — the copy button writes that same string. Load any of them into the generator underneath to retune offsets, blur, and alpha live.",
        ],
      },
      {
        type: "shadowDemo",
        label: "Soft card (contact + ambient)",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.06),\n  0 8px 24px -6px rgba(0, 0, 0, 0.12)",
        radius: 16,
      },
      {
        type: "shadowDemo",
        label: "Raised button",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.1),\n  0 4px 12px -2px rgba(0, 0, 0, 0.12)",
        radius: 10,
      },
      {
        type: "shadowDemo",
        label: "Inset well (pressed)",
        property: "box-shadow",
        value: "inset 0 2px 6px rgba(0, 0, 0, 0.15)",
        radius: 12,
      },
      {
        type: "shadowDemo",
        label: "Hairline focus ring",
        property: "box-shadow",
        value: "0 0 0 2px #ffffff, 0 0 0 4px rgba(217, 122, 63, 0.55)",
        radius: 12,
      },
      {
        type: "heading",
        text: "One layer, or a stack",
      },
      {
        type: "paragraphs",
        items: [
          "Layers are comma-separated and the first one paints on top. The pairing that reads as real depth is a tight contact shadow close to the surface plus a wide, faint ambient layer below it — two layers with different offsets, blurs, and alphas, not one thick dark smear.",
          "Measured against the shipped CSS of the top 1,000 sites, most production shadows stay on a single layer with a zero X offset, a small or zero Y offset, single-digit blur, and a low-alpha neutral color. The stacks that do exist are usually framework tokens rather than art direction.",
        ],
      },
      {
        type: "links",
        heading: "Keep reading on layers",
        items: [
          { path: "/css/box-shadow/multiple-shadows", title: "Multiple box-shadows", desc: "Comma syntax, paint order, and the contact-plus-ambient recipe in depth." },
          { path: "/blog/box-shadow-values-real-websites", title: "Box-shadow values real websites use", desc: "33,438 measured declarations: offsets, blur, spread, alpha, and layering." },
        ],
      },
      {
        type: "heading",
        text: "box-shadow, text-shadow, or drop-shadow?",
      },
      {
        type: "paragraphs",
        items: [
          "box-shadow traces the rectangle of the border box (rounded by border-radius) and supports spread and inset. text-shadow traces the outline of every glyph and accepts only X, Y, blur, and color. The third option, filter: drop-shadow(), traces the alpha shape of an image or an SVG — useful for icons and cut-outs, but without spread or inset, and as a filter it re-rasterizes the element whenever it or its shadow changes.",
        ],
      },
      {
        type: "links",
        heading: "Comparison guides",
        items: [
          { path: "/blog/box-shadow-vs-drop-shadow-filter", title: "box-shadow vs drop-shadow", desc: "Border-box rectangle versus alpha-shape shadow, with side-by-side demos." },
          { path: "/blog/soft-shadow-css-recipes", title: "Soft shadow recipes", desc: "Why soft shadows go muddy, and the alpha-first values that fix it." },
        ],
      },
    ],
    useCases: [
      { title: "Cards and panels", desc: "Lift a surface off the page with a tight contact layer plus a wide ambient layer at low alpha." },
      { title: "Pressed and recessed states", desc: "Use inset shadows for input wells, toggles, and the dark half of soft-UI surfaces." },
      { title: "Focus rings and hairlines", desc: "Zero blur with a small spread draws rings and borders without a border property." },
    ],
    steps: [
      "Pick a starting point above and copy it, or open the generator with a preset.",
      "Set X to 0, then nudge Y down 1–4 px — or keep both at 0 for a centered halo.",
      "Add blur for softness and negative spread to tuck wide blurs under the element.",
      "Keep the color a neutral low alpha; raise it only until the edge reads.",
      "Copy the declaration, a CSS variable, a bare value, or a Tailwind class.",
    ],
    faq: [
      { question: "What does box-shadow do?", answer: "It draws one or more blurred copies of the element's border box behind it. Each layer has an X offset, a Y offset, an optional blur, an optional spread, and a color; the keyword inset draws the layer inside the border box instead of behind it." },
      { question: "Why is my box-shadow not showing?", answer: "The usual causes: a parent with overflow: hidden clips it, the color has no visible alpha (or matches the background), or another element paints over it. Give the layer a visible offset like 0 8px with blur 16 and a mid alpha first — if it appears, the layout was fine and the values were the problem." },
      { question: "Can box-shadow be inset?", answer: "Yes. Put the inset keyword before the lengths — box-shadow: inset 0 2px 6px rgba(0,0,0,0.15) — to draw the shadow inside the border box for recessed wells, pressed buttons, and soft-UI shading. Layers in one declaration can mix inset and outer freely." },
      { question: "What is the difference between box-shadow and text-shadow?", answer: "box-shadow traces the element's border box, honors border-radius, and supports spread and inset. text-shadow traces each glyph's outline and takes only X offset, Y offset, blur, and color. Both accept comma-separated layers with the first layer painted on top." },
      { question: "Do box-shadows need vendor prefixes?", answer: "No. box-shadow is unprefixed in every current browser, so clean standard CSS is enough. Old -webkit-box-shadow declarations still work but are unnecessary in new code." },
    ],
    keywords: ["box-shadow css", "css box shadow syntax", "box shadow examples", "inset box shadow", "css shadow guide"],
  },

  // ────────────── Box-shadow examples (/css/box-shadow/examples) ──────────────
  {
    slug: "box-shadow-examples",
    path: `${CSS_ROOT}/box-shadow/examples`,
    category: "CSS Tools",
    categorySlug: "css",
    title: "CSS Box Shadow Examples — Cards & Buttons | GainUtility",
    description:
      "Copy-paste CSS box-shadow examples for cards, buttons, inputs, focus rings, inset wells and glows, each with a live preview and the exact declaration.",
    h1: "CSS box-shadow examples you can copy",
    primaryTool: "box-shadow-generator",
    relatedTools: [
      { id: "box-shadow-generator", name: "CSS Box Shadow Generator", description: "Design layered, inset, or soft CSS shadows." },
      { id: "border-radius-generator", name: "Border Radius Generator", description: "Design asymmetric corners and blobs." },
      { id: "gradient-generator", name: "Gradient Generator", description: "Design multi-stop CSS gradients." },
      { id: "contrast-checker", name: "Contrast Checker", description: "Verify WCAG color contrast compliance." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "CSS Tools", url: CSS_ROOT },
      { name: "Box Shadow Examples", url: `${CSS_ROOT}/box-shadow/examples` },
    ],
    intro:
      "Nine shadows you can paste today. Each card below renders the declaration it shows — the preview and the copy button use the same string, so nothing drifts between the demo and your stylesheet. Load any of them into the generator at the bottom of the page to retune it.",
    sections: [
      {
        type: "heading",
        text: "Cards and panels",
      },
      {
        type: "shadowDemo",
        label: "Subtle card raise",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.06),\n  0 4px 12px -2px rgba(0, 0, 0, 0.08)",
        radius: 16,
      },
      {
        type: "shadowDemo",
        label: "Floating panel",
        property: "box-shadow",
        value: "0 2px 6px -1px rgba(0, 0, 0, 0.08),\n  0 12px 28px -8px rgba(0, 0, 0, 0.14)",
        radius: 20,
      },
      {
        type: "shadowDemo",
        label: "Material-style three-layer stack",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.07),\n  0 4px 8px rgba(0, 0, 0, 0.07),\n  0 12px 24px rgba(0, 0, 0, 0.08)",
        radius: 14,
      },
      {
        type: "heading",
        text: "Buttons and inputs",
      },
      {
        type: "shadowDemo",
        label: "Primary button",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.1),\n  0 4px 12px -2px rgba(0, 0, 0, 0.12)",
        radius: 10,
      },
      {
        type: "shadowDemo",
        label: "Input well (inset)",
        property: "box-shadow",
        value: "inset 0 1px 2px rgba(0, 0, 0, 0.08),\n  inset 0 2px 6px rgba(0, 0, 0, 0.06)",
        radius: 10,
      },
      {
        type: "shadowDemo",
        label: "Pressed button (inset)",
        property: "box-shadow",
        value: "inset 0 2px 4px rgba(0, 0, 0, 0.15)",
        radius: 10,
      },
      {
        type: "heading",
        text: "Rings, focus, and glow",
      },
      {
        type: "shadowDemo",
        label: "Focus ring (two-layer)",
        property: "box-shadow",
        value: "0 0 0 2px #ffffff, 0 0 0 4px rgba(217, 122, 63, 0.55)",
        radius: 12,
      },
      {
        type: "shadowDemo",
        label: "Brand glow",
        property: "box-shadow",
        value: "0 0 0 1px rgba(217, 122, 63, 0.25),\n  0 8px 32px -8px rgba(217, 122, 63, 0.45)",
        radius: 999,
      },
      {
        type: "shadowDemo",
        label: "Dark surface lift",
        property: "box-shadow",
        value: "0 2px 8px rgba(0, 0, 0, 0.45),\n  0 16px 40px -12px rgba(0, 0, 0, 0.6)",
        radius: 16,
        stageBg: "#191D18",
      },
      {
        type: "paragraphs",
        items: [
          "The dark-surface example raises the alpha on purpose: black-on-black has no contrast, so shadows on dark UI routinely need two to three times the opacity they need on white. If a shadow vanishes when you switch themes, alpha is the first knob to turn.",
        ],
      },
      {
        type: "links",
        heading: "Go deeper",
        items: [
          { path: "/css/box-shadow", title: "box-shadow syntax & values", desc: "What each part of the declaration does, with practical starting ranges." },
          { path: "/css/box-shadow/multiple-shadows", title: "Multiple box-shadows", desc: "How to build the two- and three-layer stacks used above." },
          { path: "/blog/box-shadow-values-real-websites", title: "Values real websites ship", desc: "Measured offsets, blur, spread, and alpha from the top 1,000 sites." },
        ],
      },
    ],
    useCases: [
      { title: "Start from a working shadow", desc: "Copy an example as-is for a quick result, or load it into the generator to tune alpha, blur, and offsets." },
      { title: "Match a component pattern", desc: "Cards, buttons, inputs, rings, and glows each have a dedicated starting point here." },
      { title: "Adapt across themes", desc: "Light and dark stage backgrounds show how the same shape reads on different surfaces." },
    ],
    steps: [
      "Find the example whose depth matches your component.",
      "Copy the declaration — the preview and the copied text are the same string.",
      "Paste it into your stylesheet, or load it in the generator below and adjust it first.",
      "Pair rounded corners with the Border Radius Generator so the shadow silhouette matches the surface.",
    ],
    faq: [
      { question: "How do I copy an example?", answer: "Use the Copy button on any example card. It writes that card's declaration — exactly what the preview applies — to your clipboard, ready to paste into a stylesheet." },
      { question: "Can I edit these shadows before copying?", answer: "Yes. Open the generator below, paste the declaration into its import field (or load a preset), and adjust offsets, blur, spread, opacity, and color with live preview before copying the result." },
      { question: "Why does my shadow look wrong on a dark background?", answer: "Dark surfaces swallow low-alpha black shadows. Raise the alpha — often to two or three times the value you use on white — or tint the shadow. The dark-surface example on this page shows a pair of values that read on #191D18." },
      { question: "Are these examples production-ready?", answer: "Yes — they use only standard box-shadow syntax with no prefixes, and their values sit inside the ranges real sites ship. Adjust the alpha to your own background and component size." },
    ],
    keywords: ["box shadow examples css", "css shadow examples", "card shadow css", "inset shadow examples", "focus ring css"],
  },

  // ────────────── Multiple shadows (/css/box-shadow/multiple-shadows) ──────────────
  {
    slug: "box-shadow-multiple",
    path: `${CSS_ROOT}/box-shadow/multiple-shadows`,
    category: "CSS Tools",
    categorySlug: "css",
    title: "Multiple Box Shadows in CSS — Stacked Layers | GainUtility",
    description:
      "How comma-separated box-shadow layers work: syntax, paint order, the contact-plus-ambient recipe, mixing inset with outer layers, and copy-ready examples.",
    h1: "Multiple box-shadows: how layered shadows work",
    primaryTool: "box-shadow-generator",
    relatedTools: [
      { id: "box-shadow-generator", name: "CSS Box Shadow Generator", description: "Design layered, inset, or soft CSS shadows." },
      { id: "border-radius-generator", name: "Border Radius Generator", description: "Design asymmetric corners and blobs." },
      { id: "gradient-generator", name: "Gradient Generator", description: "Design multi-stop CSS gradients." },
      { id: "contrast-checker", name: "Contrast Checker", description: "Verify WCAG color contrast compliance." },
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "CSS Tools", url: CSS_ROOT },
      { name: "Multiple box-shadows", url: `${CSS_ROOT}/box-shadow/multiple-shadows` },
    ],
    intro:
      "One box-shadow value can hold as many layers as you separate with commas. Each layer paints independently — first listed on top — which is how a single element gets both a tight contact shadow and a wide ambient one, or a focus ring plus depth in the same declaration.",
    sections: [
      {
        type: "heading",
        text: "The comma syntax",
      },
      {
        type: "code",
        label: "Two layers in one declaration",
        content: "box-shadow:\n  0 1px 2px rgba(0, 0, 0, 0.06),\n  0 8px 24px -6px rgba(0, 0, 0, 0.12);",
      },
      {
        type: "paragraphs",
        items: [
          "Every layer is a full box-shadow value — offsets, optional blur, optional spread, color, optional inset. There is no separate multi-shadow property and no limit in the grammar beyond what the browser can paint; interface work typically stays between one and four layers, because more layers rarely change what the eye sees.",
        ],
      },
      {
        type: "heading",
        text: "Paint order: first listed paints on top",
      },
      {
        type: "paragraphs",
        items: [
          "Layers stack like translucent sheets: the first value in the list renders over the ones after it. That order matters when layers overlap — a crisp ring listed first stays crisp above a soft glow listed second, while the reverse order lets the glow wash over the ring.",
        ],
      },
      {
        type: "code",
        label: "Ring on top of depth",
        content: "box-shadow:\n  0 0 0 2px #ffffff,          /* painted first (on top) */\n  0 8px 24px -6px rgba(0, 0, 0, 0.14);",
      },
      {
        type: "heading",
        text: "The contact + ambient recipe",
      },
      {
        type: "paragraphs",
        items: [
          "Real objects occlude light twice: a dark, tight shadow where they nearly touch the surface, and a broader, fainter one spreading away from it. Two layers reproduce that — a small offset and blur with low alpha, then a larger offset and blur with a wider radius (and usually negative spread so it tucks under the element).",
        ],
      },
      {
        type: "shadowDemo",
        label: "Contact + ambient",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.06),\n  0 8px 24px -6px rgba(0, 0, 0, 0.12)",
        radius: 16,
      },
      {
        type: "paragraphs",
        items: [
          "A single thick dark layer reads as a sticker; the pair reads as depth. If a card still looks flat, the fix is usually a second layer, not a darker first one.",
        ],
      },
      {
        type: "heading",
        text: "Longer stacks",
      },
      {
        type: "shadowDemo",
        label: "Three-layer elevation",
        property: "box-shadow",
        value: "0 1px 2px rgba(0, 0, 0, 0.07),\n  0 4px 8px rgba(0, 0, 0, 0.07),\n  0 12px 24px -4px rgba(0, 0, 0, 0.1)",
        radius: 14,
      },
      {
        type: "paragraphs",
        items: [
          "Three and four layers work the same way — each adds a rung between the surface and the furthest blur. Beyond a few rungs the extra layers contribute almost nothing visually, so stop when the gradient from contact to ambient already looks smooth.",
        ],
      },
      {
        type: "heading",
        text: "Mixing inset and outer layers",
      },
      {
        type: "paragraphs",
        items: [
          "The inset keyword is per-layer, so one declaration can hold outer depth and inner shading at the same time — a raised panel that also looks slightly recessed where content sits, or a button with ambient lift plus a pressed top edge.",
        ],
      },
      {
        type: "code",
        label: "Outer lift + inner shading",
        content: "box-shadow:\n  inset 0 1px 2px rgba(0, 0, 0, 0.06),\n  0 8px 24px -6px rgba(0, 0, 0, 0.14);",
      },
      {
        type: "shadowDemo",
        label: "Outer lift + inner shading",
        property: "box-shadow",
        value: "inset 0 1px 2px rgba(0, 0, 0, 0.06),\n  0 8px 24px -6px rgba(0, 0, 0, 0.14)",
        radius: 16,
      },
      {
        type: "heading",
        text: "When stacks go muddy",
      },
      {
        type: "list",
        items: [
          "Each layer's alpha composites with the ones below it — three layers at 0.3 black stack far darker than one. Start every layer at 0.05–0.12 and raise only what needs to read.",
          "Layers with nearly identical offsets and blurs just double the darkness. Give each rung a clearly different offset or blur radius.",
          "Blur grows the painted area in every direction; pair large blurs with negative spread so the halo does not swell the component's footprint.",
          "Styling a child element does not stack onto the parent's shadow — each element shadows only its own border box.",
        ],
      },
      {
        type: "links",
        heading: "Related guides",
        items: [
          { path: "/css/box-shadow", title: "box-shadow syntax & values", desc: "The full reference for every value in a layer." },
          { path: "/css/box-shadow/examples", title: "Examples gallery", desc: "Copy-ready single and multi-layer shadows for common components." },
          { path: "/blog/box-shadow-values-real-websites", title: "How many layers real sites ship", desc: "Measured layer counts: single shadows dominate production CSS." },
        ],
      },
    ],
    useCases: [
      { title: "Depth that reads as real", desc: "Pair a tight contact layer with a wide ambient layer — the combination physical objects produce." },
      { title: "Ring plus depth in one rule", desc: "List a zero-blur focus ring first so it paints above the soft drop underneath it." },
      { title: "Raised yet recessed", desc: "Mix inset and outer layers in a single declaration for panels and buttons with both cues." },
    ],
    steps: [
      "Start with two layers: 0 1px 2px at low alpha, then 0 8px 24px −6px at slightly higher alpha.",
      "Keep the tight layer first so the contact edge stays crisp over the ambient blur.",
      "Add a third layer only if the mid-distance still looks flat.",
      "Raise alphas together — stacked transparency multiplies — and keep each rung clearly spaced in offset or blur.",
      "Copy the whole comma-separated value from the generator, as a declaration, CSS variable, or Tailwind class.",
    ],
    faq: [
      { question: "How many box-shadows can one element have?", answer: "There is no practical limit in the syntax — just separate full layer values with commas. Interface work usually stays at one to four layers: each extra layer needs a visibly different offset or blur to change what you see, and stacked alphas get darker as you add more." },
      { question: "Which layer paints on top?", answer: "The first value in the comma-separated list paints over the ones after it. List crisp rings and contact edges first when they should stay sharp above a soft glow underneath." },
      { question: "Why does my stacked shadow look muddy?", answer: "Almost always stacked alpha: each translucent layer darkens the ones below it. Drop every layer to 0.05–0.12, space the rungs so offsets and blurs clearly differ, and pair large blurs with negative spread so halos do not swell." },
      { question: "Can I mix inset and outer shadows in one declaration?", answer: "Yes — inset is a per-layer keyword, so a single box-shadow list can contain inset and outer layers together. A common pairing is an inset contact shade with an outer ambient drop on the same element." },
    ],
    keywords: ["multiple box shadows css", "stacked box shadow", "layered box shadow css", "comma separated box shadow"],
  },

  // ────────────── Developer Hub ──────────────
  {
    slug: "dev",
    path: DEV_ROOT,
    category: "Developer Tools",
    categorySlug: "developer",
    title: "Free Developer Tools — QR, Base64 & Regex | GainUtility",
    description: "Use free developer tools in your browser. Generate QR codes, encode Base64, create UUIDs, test regex, and more. Fast, private, no uploads.",
    primaryTool: null,
    relatedTools: devRelated(["qr-code-generator", "base64-tool", "uuid-generator", "url-encoder-decoder", "jwt-decoder", "regex-tester"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: DEV_ROOT },
    ],
    intro: "GainUtility's developer toolkit provides essential utilities for everyday development tasks. Generate QR codes, encode/decode Base64 and URLs, create UUIDs, decode JWTs, test regex patterns, and more — all processed locally.",
    useCases: [
      { title: "QR Code Generation", desc: "Create styled QR codes for URLs, WiFi, email, WhatsApp, and vCard contacts." },
      { title: "Data Encoding", desc: "Encode and decode Base64, URL percent-encoding, and HTML entities." },
      { title: "Identity Generation", desc: "Generate UUIDs (v1, v4, v7), hash strings, and create secure passwords." },
      { title: "Code Utilities", desc: "Test regex patterns, format SQL/YAML, and build cron expressions." },
    ],
    steps: [
      "Choose the developer tool you need from the collection.",
      "Enter your input data.",
      "Configure any settings or options.",
      "Copy the output or download results.",
    ],
    faq: [
      { question: "Are these tools suitable for production use?", answer: "Our tools are designed for development, testing, and debugging. For production security tools like password generation, always use established libraries." },
    ],
    sections: [
      {
        type: "chooser",
        heading: "Which developer job do you have?",
        note: "Pick the job rather than the tool name. Everything below runs locally, with no account and no upload.",
        items: [
          { label: "Make a QR code", path: `${DEV_ROOT}/qr-code`, hint: "Styled codes for URLs, WiFi, email, WhatsApp and vCards." },
          { label: "Encode or decode Base64", path: `${DEV_ROOT}/base64`, hint: "UTF-8 safe conversion with automatic detection of which direction you need." },
          { label: "Generate a password", path: `${DEV_ROOT}/password`, hint: "Set length and character groups, then copy a Web Crypto random password." },
        ],
      },
    ],
    keywords: ["developer tools online free", "qr code generator", "base64 encoder", "uuid generator"],
  },

  // ────────────── Developer Tool Pages ──────────────
  {
    slug: "qr-code",
    path: `${DEV_ROOT}/qr-code`,
    category: "Developer Tools",
    categorySlug: "developer",
    title: "Free QR Code Generator — Custom Styled Codes | GainUtility",
    description: "Generate custom QR codes online for free. Support URLs, WiFi, email, WhatsApp, vCard. Custom colors, logos, and error correction. Private.",
    primaryTool: "qr-code-generator",
    relatedTools: devRelated(["url-encoder-decoder", "base64-tool", "slug-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: DEV_ROOT },
      { name: "QR Code Generator", url: `${DEV_ROOT}/qr-code` },
    ],
    intro: "Generate professional QR codes with customizable colors, error correction levels, quiet zones, and logo overlays. Supports URLs, WiFi credentials, email addresses, phone numbers, WhatsApp, and vCard contacts — all generated locally.",
    useCases: [
      { title: "Business Cards", desc: "Add QR codes linking to your portfolio, LinkedIn, or contact information." },
      { title: "WiFi Sharing", desc: "Generate QR codes for WiFi network credentials for easy guest access." },
      { title: "Event Marketing", desc: "Create branded QR codes for event posters, flyers, and promotional materials." },
    ],
    steps: [
      "Select the QR code type (URL, WiFi, Email, etc.).",
      "Enter your content and customize appearance.",
      "Adjust error correction level and quiet zone.",
      "Download the QR code as PNG or SVG.",
    ],
    faq: [
      { question: "Can I add a logo to the QR code?", answer: "Yes. You can overlay a custom logo in the center of the QR code. Higher error correction levels allow larger logos while maintaining scannability." },
    ],
    keywords: ["qr code generator online free", "create qr code", "custom qr code", "wifi qr code generator"],
  },
  {
    slug: "base64",
    path: `${DEV_ROOT}/base64`,
    category: "Developer Tools",
    categorySlug: "developer",
    title: "Free Online Base64 Encoder & Decoder | GainUtility",
    description: "Encode and decode Base64 strings online for free. UTF-8 safe, live auto-detection, and instant conversion. Fast and private.",
    primaryTool: "base64-tool",
    relatedTools: devRelated(["url-encoder-decoder", "html-entity-encoder", "hash-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: DEV_ROOT },
      { name: "Base64 Encoder & Decoder", url: `${DEV_ROOT}/base64` },
    ],
    intro: "Encode text to Base64 or decode Base64 strings with our binary-safe converter. Supports full UTF-8 characters including emojis with live auto-detection of encoded inputs.",
    useCases: [
      { title: "API Authentication", desc: "Encode credentials for Basic Authentication headers." },
      { title: "Data Embedding", desc: "Embed binary data in JSON, XML, or HTML documents." },
      { title: "Email Attachments", desc: "Encode file contents for MIME email attachments." },
    ],
    steps: [
      "Paste your text or Base64 string into the input.",
      "The tool auto-detects encoding direction.",
      "Click Encode or Decode as needed.",
      "Copy the result to your clipboard.",
    ],
    faq: [
      { question: "Does it support Unicode and emojis?", answer: "Yes. The encoder uses UTF-8 encoding to properly handle all Unicode characters including emojis and special symbols." },
    ],
    keywords: ["base64 encoder online free", "base64 decoder", "encode decode base64", "base64 tool"],
  },
  {
    slug: "password-generator",
    path: `${DEV_ROOT}/password`,
    category: "Developer Tools",
    categorySlug: "developer",
    title: "Password Generator — Secure Random Passwords | GainUtility",
    description: "Generate secure random passwords online for free. Custom length, character sets, and entropy evaluation. Private — generated locally.",
    primaryTool: "password-generator",
    relatedTools: devRelated(["password-strength-checker", "hash-generator", "uuid-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Developer Tools", url: DEV_ROOT },
      { name: "Password Generator", url: `${DEV_ROOT}/password` },
    ],
    intro: "Generate high-entropy random passwords with customizable length and character groups. Our generator runs entirely in your browser using the Web Crypto API — passwords are never transmitted or stored.",
    useCases: [
      { title: "Account Security", desc: "Create strong, unique passwords for new online accounts." },
      { title: "API Keys", desc: "Generate random API keys and tokens for development projects." },
      { title: "Passphrase Generation", desc: "Build passwords with specific character requirements for compliance." },
    ],
    steps: [
      "Set your desired password length using the slider.",
      "Toggle character groups: uppercase, lowercase, numbers, symbols.",
      "Review the entropy score and strength rating.",
      "Click Generate and copy the password.",
    ],
    faq: [
      { question: "Are generated passwords truly random?", answer: "Yes. We use the browser's Web Crypto API which provides cryptographically secure random values, not pseudo-random generators." },
    ],
    keywords: ["password generator online free", "random password generator", "secure password creator", "strong password generator"],
  },

  // ────────────── SEO Hub ──────────────
  {
    slug: "seo",
    path: SEO_ROOT,
    category: "SEO Tools",
    categorySlug: "seo",
    title: "Free SEO Tools — Meta Tags, Schema & Sitemaps | GainUtility",
    description: "Use free SEO tools in your browser. Generate meta tags, Open Graph cards, schema markup, sitemaps, robots.txt, and SERP previews. Fast, private.",
    primaryTool: null,
    relatedTools: seoRelated(["check-my-website", "launch-checklist", "seo-meta-generator", "schema-markup-generator", "google-serp-preview", "xml-sitemap-generator", "robots-txt-generator", "utm-builder", "slug-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "SEO Tools", url: SEO_ROOT },
    ],
    intro: "GainUtility's SEO toolkit helps you control exactly how search engines see your pages. Generate optimized meta titles and descriptions, build JSON-LD schema markup, create XML sitemaps and robots.txt rules, preview SERP snippets, and track campaigns with UTM links — all processed locally in your browser.",
    useCases: [
      { title: "On-Page SEO", desc: "Generate optimized title tags, meta descriptions, and canonical URLs within search engine length limits." },
      { title: "Rich Results", desc: "Create JSON-LD schema markup for products, articles, FAQs, and organization entities." },
      { title: "Crawl Control", desc: "Build robots.txt directives and XML sitemaps to guide search bots across your site." },
      { title: "Social Sharing", desc: "Craft Open Graph and Twitter Card metadata for polished link previews." },
    ],
    steps: [
      "Choose the SEO tool you need from the collection.",
      "Enter your page URL, title, and content details.",
      "Configure the settings, from character limits to structured data types.",
      "Copy the generated tags, markup, or files into your site.",
    ],
    faq: [
      { question: "Are these SEO tools free?", answer: "Yes, every SEO tool is free to use and runs entirely in your browser — no accounts, uploads, or subscriptions." },
      { question: "Do you check live search rankings?", answer: "No. Our tools generate SEO assets (meta tags, schema, sitemaps). They don't query search engines for ranking data." },
      { question: "Can I use the generated code directly in production?", answer: "Yes. All output is production-ready. Copy the meta tags, JSON-LD, or XML directly into your HTML head or config files." },
    ],
    keywords: ["free seo tools online", "meta tag generator", "schema markup generator", "xml sitemap generator", "seo tools", "og tag generator"],
  },

  // ────────────── Creator Studio Hub ──────────────
  {
    slug: "creator",
    path: CREATOR_ROOT,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "Free Creator Tools — YouTube & LinkedIn | GainUtility",
    description: "Optimize YouTube thumbnails, titles, chapters and descriptions, build LinkedIn carousels, and generate clean slugs. All tools run locally — no uploads.",
    primaryTool: null,
    relatedTools: creatorRelated(["youtube-thumbnail-preview", "youtube-title-analyzer", "youtube-timestamp-formatter", "youtube-chapter-generator", "youtube-embed-generator", "youtube-url-toolkit", "thumbnail-safe-zone", "youtube-description-formatter", "youtube-keyword-explorer", "linkedin-carousel-maker", "slug-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
    ],
    intro: "GainUtility's Creator Studio gives you practical tools for publishing to YouTube, LinkedIn, and the web. Preview thumbnails at real display sizes, analyze titles for truncation and click-through signals, format timestamps and chapters to YouTube specs, generate responsive embed codes, clean tracking from URLs, build LinkedIn carousels, and create SEO-friendly slugs. Every tool processes your input locally in the browser — nothing is uploaded to a server.",
    useCases: [
      { title: "Pre-Flight YouTube Publishing", desc: "Check thumbnail safe zones, validate title length, format chapters, and structure descriptions before upload." },
      { title: "LinkedIn Carousel Creation", desc: "Build multi-slide carousels with custom branding and export as PDF or ZIP for LinkedIn posts." },
      { title: "URL & Slug Cleanup", desc: "Strip tracking parameters from YouTube links and generate clean, SEO-friendly slugs for any page." },
      { title: "Keyword Research", desc: "Discover real autocomplete search phrases from YouTube to inform titles, tags, and descriptions." },
    ],
    steps: [
      "Choose the creator tool you need from the collection.",
      "Enter your input — text, URLs, or upload an image.",
      "Adjust settings and preview the result.",
      "Copy the output or download the file.",
    ],
    faq: [
      { question: "Are these tools free?", answer: "Yes. Every Creator tool is free and runs entirely in your browser — no accounts, uploads, or subscriptions." },
      { question: "Do my files leave my device?", answer: "No. All processing happens locally using browser APIs. Images, text, and URLs are never uploaded to a server." },
      { question: "Where does the YouTube keyword data come from?", answer: "The Keyword Explorer fetches live autocomplete suggestions from YouTube's public suggest endpoint via a proxy. It shows real phrases people search for, not estimated volumes." },
    ],
    keywords: ["creator tools free", "youtube thumbnail preview", "youtube title analyzer", "youtube chapter generator", "linkedin carousel maker", "slug generator"],
  },

  // ────────────── Creator Tool Pages ──────────────
  {
    slug: "youtube-thumbnail-preview",
    path: `/tools/youtube-thumbnail-preview`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Thumbnail Preview — Test Across All Display Sizes | GainUtility",
    description: "Preview your YouTube thumbnail across desktop, mobile feed, sidebar, and TV layouts before publishing. Catch unreadable designs instantly — free, local, no uploads.",
    primaryTool: "youtube-thumbnail-preview",
    relatedTools: creatorRelated(["thumbnail-safe-zone", "youtube-title-analyzer", "youtube-keyword-explorer", "linkedin-carousel-maker"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Thumbnail Preview", url: `/tools/youtube-thumbnail-preview` },
    ],
    intro: "Your thumbnail looks great at full size — but how does it read in a crowded sidebar on a phone? This tool renders your image inside faithful simulations of YouTube's actual UI surfaces at their true relative scales: search grid, home feed, watch-page sidebar, and living-room TV.",
    useCases: [
      { title: "Mobile Sidebar Check", desc: "Verify text and faces remain legible at ~168px width in the mobile watch-next sidebar." },
      { title: "TV Layout Review", desc: "Check how your design holds up on living-room TV where thumbnails display larger but with different chrome." },
      { title: "Search Result Preview", desc: "See how your thumbnail competes in the search grid alongside other videos." },
    ],
    steps: [
      "Upload your thumbnail image (1280×720 recommended, under 2MB).",
      "Toggle between Search, Home, Sidebar, and TV preview modes.",
      "Check readability of text, logos, and faces at each size.",
      "Iterate until it pops everywhere.",
    ],
    faq: [
      { question: "What size should YouTube thumbnails be?", answer: "1280×720 pixels (16:9), under 2MB, in JPG or PNG. This is the standard that renders across all surfaces." },
      { question: "Why does my thumbnail look different on mobile?", answer: "Mobile crops tighter and displays smaller; text under ~24pt equivalent becomes illegible. Preview to verify." },
      { question: "Is my thumbnail uploaded anywhere?", answer: "No. The preview renders entirely in your browser using the Canvas API. Your image never leaves your device." },
    ],
    keywords: ["youtube thumbnail preview", "preview youtube thumbnail", "thumbnail checker", "youtube thumbnail size"],
  },
  {
    slug: "youtube-title-analyzer",
    path: `/tools/youtube-title-analyzer`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Title Analyzer — Optimize Length, Truncation & Click Signals | GainUtility",
    description: "Analyze video titles for character length, mobile/desktop truncation points, power words, and capitalization balance. Score titles before publishing — free and local.",
    primaryTool: "youtube-title-analyzer",
    relatedTools: creatorRelated(["youtube-thumbnail-preview", "youtube-description-formatter", "youtube-keyword-explorer", "slug-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Title Analyzer", url: `/tools/youtube-title-analyzer` },
    ],
    intro: "Titles decide clicks. Get instant feedback on pixel-length versus known truncation thresholds, front-loaded keyword position, ALL-CAPS ratio, number usage, and recognized emotional trigger vocabulary. The analyzer evaluates structural qualities that correlate with click-through rate.",
    useCases: [
      { title: "Truncation Safety", desc: "Ensure your hook survives YouTube's ~60-70 character desktop cutoff and far tighter mobile limits." },
      { title: "Front-Loading Keywords", desc: "Verify your primary keyword appears early enough to be visible in all feed contexts." },
      { title: "Power Word Balance", desc: "Check for emotional triggers (how, why, secret, proven) without crossing into clickbait territory." },
    ],
    steps: [
      "Type or paste your draft title.",
      "Review the length meter against desktop and mobile truncation bounds.",
      "Check power-word detection and capitalization analysis.",
      "Refine until every signal is green.",
    ],
    faq: [
      { question: "How long can YouTube titles be?", answer: "Technically 100 characters, but visible space ends near 60–70 on most screens. Aim for hooks inside 50 characters." },
      { question: "Do emojis help YouTube titles?", answer: "Sparingly — one relevant emoji draws the eye; stacks look spammy and may hurt perceived credibility." },
      { question: "Is ALL CAPS bad for titles?", answer: "Full caps reads as shouting; strategic single-word caps emphasize without triggering viewer fatigue." },
      { question: "Does this analyze my published videos?", answer: "It analyzes any title text you paste — no channel connection needed, fully private." },
    ],
    keywords: ["youtube title analyzer", "optimize youtube title", "youtube title length", "youtube title checker"],
  },
  {
    slug: "youtube-timestamp-formatter",
    path: `/tools/youtube-timestamp-formatter`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Timestamp Formatter — Clean Chapter Timestamps | GainUtility",
    description: "Sort, pad, and validate video timestamps into YouTube-compliant formatting automatically. Paste-ready output, free and instant.",
    primaryTool: "youtube-timestamp-formatter",
    relatedTools: creatorRelated(["youtube-chapter-generator", "youtube-description-formatter", "youtube-title-analyzer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Timestamp Formatter", url: `/tools/youtube-timestamp-formatter` },
    ],
    intro: "Turn messy timestamp notes into perfectly formatted chapter lists YouTube recognizes — sorted, zero-padded, and validated. The formatter parses mixed formats (1:23, 01:23:45), enforces chronological ordering, pads segments consistently, and validates YouTube's chapter requirements.",
    useCases: [
      { title: "Chapter List Cleanup", desc: "Fix out-of-order timestamps, missing zero-padding, and duplicate entries before pasting into your description." },
      { title: "Bulk Timestamp Processing", desc: "Paste a raw list from your editing notes and get a clean, compliant chapter block in seconds." },
    ],
    steps: [
      "Paste your raw timestamps (one per line, any format).",
      "The formatter sorts them chronologically and normalizes the format.",
      "Fix any flagged issues like duplicates or out-of-range times.",
      "Copy the clean list into your video description.",
    ],
    faq: [
      { question: "What format do YouTube chapters require?", answer: "Each line starts with a timestamp (first line must be 00:00), ascending order, minimum three chapters total." },
      { question: "Why aren't my chapters showing up?", answer: "Commonly: missing 00:00 start, timestamps out of order, fewer than three entries, or timestamps placed after non-timestamp text lines." },
      { question: "Can I add labels to timestamps?", answer: "Yes — text following each timestamp becomes the clickable chapter name shown in the player." },
      { question: "Does this need my video link?", answer: "No — pure text processing happens locally with nothing uploaded." },
    ],
    keywords: ["youtube timestamp formatter", "youtube chapter timestamps", "format timestamps youtube", "youtube chapters tool"],
  },
  {
    slug: "youtube-chapter-generator",
    path: `/tools/youtube-chapter-generator`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Chapter Generator — Build Chapters with Visual Timeline | GainUtility",
    description: "Create YouTube chapters with visual timeline previews showing proportional segments. Interactive builder, export-ready lists, free and local.",
    primaryTool: "youtube-chapter-generator",
    relatedTools: creatorRelated(["youtube-timestamp-formatter", "youtube-description-formatter", "youtube-keyword-explorer", "youtube-title-analyzer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Chapter Generator", url: `/tools/youtube-chapter-generator` },
    ],
    intro: "See your video's structure as you build it. Enter your video's total duration, add chapters with names and start times, and watch segments render proportionally on a visual track so pacing gaps jump out immediately.",
    useCases: [
      { title: "Balanced Chapter Pacing", desc: "Visual timeline shows if chapters are clustered or spread evenly — adjust for better viewer navigation." },
      { title: "Description-Ready Export", desc: "Generates YouTube-spec compliant chapter list with 00:00 start and proper formatting." },
    ],
    steps: [
      "Enter your video's total duration.",
      "Add chapters with names and start times.",
      "Watch segments render proportionally on the visual track.",
      "Export the formatted chapter list for your description.",
    ],
    faq: [
      { question: "How many chapters should a YouTube video have?", answer: "Rule of thumb: one per major topic shift — typically 5–12 for standard tutorials; long podcasts benefit from more granular splits." },
      { question: "Do YouTube chapters help SEO?", answer: "Yes — chapter titles become searchable key moments in Google video results, multiplying entry points to your content." },
      { question: "Can I generate chapters automatically?", answer: "You supply the topic breaks and times; the generator handles formatting, ordering, and visual validation." },
      { question: "Where do I paste generated chapters?", answer: "Into the first comment or top of your video description, starting with the required 00:00 entry." },
    ],
    keywords: ["youtube chapter generator", "create youtube chapters", "youtube chapters tool", "video chapter maker"],
  },
  {
    slug: "youtube-embed-generator",
    path: `/tools/youtube-embed-generator`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Embed Generator — Responsive Iframes with Options | GainUtility",
    description: "Generate custom responsive YouTube embed code with loop, mute, autoplay, and privacy mode toggles. Copy-paste iframe snippets free and local.",
    primaryTool: "youtube-embed-generator",
    relatedTools: creatorRelated(["youtube-url-toolkit", "youtube-thumbnail-preview", "qr-code-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Embed Generator", url: `/tools/youtube-embed-generator` },
    ],
    intro: "Build the exact embed behavior you want — responsive sizing, looping, muted autoplay, privacy-enhanced mode — without touching raw parameters. The tool assembles youtube-nocookie.com iframes with correctly encoded parameter strings for each selected behavior, wrapped in responsive container markup.",
    useCases: [
      { title: "Responsive Blog Embeds", desc: "Use the generated snippet — it wraps the iframe in aspect-ratio CSS keeping 16:9 proportions at any width." },
      { title: "GDPR-Friendlier Embeds", desc: "Privacy-enhanced nocookie domain sets cookies only when the visitor actually plays the video." },
      { title: "Looping Background Videos", desc: "Enable both mute AND autoplay together for reliable auto-start looping behavior." },
    ],
    steps: [
      "Paste any YouTube URL or video ID.",
      "Toggle options: loop, mute, autoplay, controls, privacy mode.",
      "Preview the embedded result live.",
      "Copy the generated iframe code.",
    ],
    faq: [
      { question: "How do I embed a YouTube video responsively?", answer: "Use the generated snippet — it wraps the iframe in aspect-ratio CSS keeping 16:9 proportions at any width." },
      { question: "What is youtube-nocookie.com?", answer: "Privacy-enhanced embedding that sets cookies only when the visitor actually plays the video — recommended for GDPR-conscious sites." },
      { question: "Why won't my embedded video autoplay?", answer: "Browsers block unmuted autoplay; enable both mute AND autoplay together for reliable auto-start behavior." },
      { question: "Can I loop embedded videos?", answer: "Yes — toggle loop here and the proper playlist parameter gets appended to make looping actually function." },
    ],
    keywords: ["youtube embed generator", "youtube embed code", "responsive youtube embed", "youtube iframe generator"],
  },
  {
    slug: "youtube-url-toolkit",
    path: `/tools/youtube-url-toolkit`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube URL Toolkit — Clean Links & Extract Video IDs | GainUtility",
    description: "Strip tracking parameters from YouTube links, extract video/channel IDs, and generate share QR codes. All parsing done locally.",
    primaryTool: "youtube-url-toolkit",
    relatedTools: creatorRelated(["url-encoder-decoder", "youtube-embed-generator", "qr-code-generator", "youtube-keyword-explorer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube URL Toolkit", url: `/tools/youtube-url-toolkit` },
    ],
    intro: "Paste any YouTube link variant — watch, shorts, live, youtu.be — and get clean canonical URLs, extracted IDs, and scannable QR codes. The toolkit parses all common YouTube URL structures, isolates the underlying identifiers, removes tracking suffixes (?si=, &feature=), and reconstructs minimal canonical forms.",
    useCases: [
      { title: "Clean Sharing Links", desc: "Remove tracking baggage (?si=, &feature=) from shared links for shorter, prettier URLs." },
      { title: "Video ID Extraction", desc: "Extract the bare video ID for API calls, custom embeds, or thumbnail URLs." },
      { title: "Offline QR Sharing", desc: "Generate QR codes for clean canonical links to share in print or presentations." },
    ],
    steps: [
      "Paste any format of YouTube URL.",
      "View extracted video ID, channel info, and cleaned canonical link.",
      "Generate a QR code for offline sharing.",
      "Copy whichever format you need.",
    ],
    faq: [
      { question: "How do I remove tracking from YouTube links?", answer: "Paste the link here; everything after the core identifier gets stripped and a clean canonical URL comes back." },
      { question: "What is the ?si= parameter on YouTube links?", answer: "A share-tracking token identifying where you copied the link from — harmless but unnecessary clutter." },
      { question: "Can I extract just the video ID?", answer: "Yes — the toolkit surfaces the bare ID separately for API calls or custom embeds." },
      { question: "Does link parsing happen online?", answer: "No — pure string processing in your browser. Nothing is uploaded." },
    ],
    keywords: ["youtube url cleaner", "extract youtube video id", "youtube link shortener", "youtube url toolkit"],
  },
  {
    slug: "thumbnail-safe-zone",
    path: `/tools/thumbnail-safe-zone`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "Thumbnail Safe Zone Checker — Protect Key Elements from Badges | GainUtility",
    description: "Overlay safe-area grids on YouTube thumbnails to keep text and logos clear of duration badges and corner overlays. Design with confidence.",
    primaryTool: "thumbnail-safe-zone",
    relatedTools: creatorRelated(["youtube-thumbnail-preview", "youtube-title-analyzer", "image-cropper", "social-resizer"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "Thumbnail Safe Zone Checker", url: `/tools/thumbnail-safe-zone` },
    ],
    intro: "YouTube covers corners with duration stamps and UI chrome. Verify your branding survives every overlay before uploading. This tool renders known YouTube overlay positions — bottom-right duration badge, hover progress bars, mobile UI elements — atop your image so collisions become obvious pre-upload.",
    useCases: [
      { title: "Duration Badge Clearance", desc: "Ensure critical text and logos stay out of the bottom-right ~15% where the duration badge sits." },
      { title: "Mobile UI Overlap Check", desc: "Verify elements aren't hidden by mobile-specific overlays like the 'Shorts' badge or channel avatar." },
      { title: "Composition Grid", desc: "Use grid divider overlays to compose thumbnails with deliberate visual hierarchy." },
    ],
    steps: [
      "Upload your thumbnail design.",
      "Toggle overlay guides: duration badge, progress bar, corner elements.",
      "Reposition critical text/logos outside blocked zones.",
      "Download the adjusted design.",
    ],
    faq: [
      { question: "Where is the YouTube duration badge positioned?", answer: "Bottom-right corner of thumbnails — roughly the lower-right 15% should avoid critical content." },
      { question: "Do overlays hide parts of my thumbnail permanently?", answer: "Overlays are viewer-side UI; your file stays intact — but anything beneath them stays invisible while they show." },
      { question: "Should faces go in specific areas?", answer: "Center-left bias performs well generally since right side hosts badges; the grid helps you compose deliberately." },
      { question: "Is my uploaded design stored anywhere?", answer: "No. All processing happens locally in your browser. Your image never leaves your device." },
    ],
    keywords: ["youtube thumbnail safe zone", "thumbnail safe area", "youtube duration badge", "thumbnail overlay checker"],
  },
  {
    slug: "youtube-description-formatter",
    path: `/tools/youtube-description-formatter`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Description Formatter — Professional Layouts | GainUtility",
    description: "Build structured YouTube descriptions with section headers, credits, CTAs, and links. Template-driven blocks ready to paste — free and local.",
    primaryTool: "youtube-description-formatter",
    relatedTools: creatorRelated(["youtube-chapter-generator", "youtube-title-analyzer", "youtube-keyword-explorer", "slug-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Description Formatter", url: `/tools/youtube-description-formatter` },
    ],
    intro: "Stop writing walls of text. Compose descriptions with clear sections — about, chapters, links, credits, disclaimers — using proven templates. The formatter assembles your content into consistently structured sections using Unicode-safe dividers, emoji headers where wanted, and logical ordering that scans well collapsed or expanded.",
    useCases: [
      { title: "Above-the-Fold Optimization", desc: "Structure the first ~150 characters with a hook, then add scannable sections for link clicks and subscriber conversion." },
      { title: "Link Block Management", desc: "Group social links, affiliate disclosures, and references into clean, labeled blocks." },
      { title: "Chapter Integration", desc: "Paste formatted chapters from the Chapter Generator directly into the description structure." },
    ],
    steps: [
      "Start from a template or blank structure.",
      "Fill each section: intro hook, chapters, social links, gear list.",
      "Preview rendered spacing and dividers.",
      "Copy the complete formatted block.",
    ],
    faq: [
      { question: "How do I write a good YouTube description?", answer: "Hook in the first two lines, then structure remaining content into scannable labeled sections with links grouped together." },
      { question: "How many links should a description contain?", answer: "Keep primary CTAs to 3–5 above the fold; exhaustive link dumps below the fold work fine for reference material." },
      { question: "Do keywords in descriptions matter?", answer: "Moderately — natural keyword inclusion helps topical understanding, but stuffing harms readability and adds little." },
      { question: "Can I save my template?", answer: "Templates persist during your session via local storage; nothing transmits to servers." },
    ],
    limitations: ["Descriptions cap at 5000 characters; very long sections need trimming."],
    keywords: ["youtube description formatter", "format youtube description", "youtube description template", "youtube description generator"],
  },
  {
    slug: "youtube-keyword-explorer",
    path: `/tools/youtube-keyword-explorer`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "YouTube Keyword Explorer — Real Autocomplete Search Phrases | GainUtility",
    description: "Find the actual phrases viewers type into YouTube search. Live autocomplete keywords you can filter, select, and copy for titles, descriptions, and tags.",
    primaryTool: "youtube-keyword-explorer",
    relatedTools: creatorRelated(["youtube-title-analyzer", "youtube-description-formatter", "youtube-chapter-generator", "youtube-thumbnail-preview"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "YouTube Keyword Explorer", url: `/tools/youtube-keyword-explorer` },
    ],
    intro: "Instead of inventing searches, this tool asks YouTube's autocomplete what viewers really type — in the market you pick — then helps you filter, compare, and turn those real phrases into titles, descriptions, and tag lists. For each search, a Cloudflare proxy asks YouTube's suggest endpoint using the selected language and region, then folds the seed results and optional A–Z expansions together.",
    useCases: [
      { title: "Title Keyword Discovery", desc: "Anchor your title to phrases people actually search for, not guessed keywords." },
      { title: "Tag List Building", desc: "Use the 500-character tag builder to create a compliant tag list from selected keywords." },
      { title: "Description SEO", desc: "Weave high-signal phrases naturally into your description for topical relevance." },
    ],
    steps: [
      "Enter a seed term for your video topic.",
      "Pick a market (language/region whose search suggestions you want).",
      "Optionally expand A–Z to surface more keywords and see which ones appear most.",
      "Filter by pattern, compare relative signal, and select the keywords you want.",
      "Copy them as a list, download a CSV, or build a 500-character tag list.",
    ],
    faq: [
      { question: "Where does the keyword data come from?", answer: "Live YouTube autocomplete: for every search the tool asks YouTube's suggest endpoint through GainUtility's API proxy, using the language and region you selected. The responses are real suggestions seen in YouTube search." },
      { question: "Do you show the exact search volume for a keyword?", answer: "No — and that is deliberate. Public search volumes are estimates, and made-up numbers would mislead you. The Relative signal column compares each keyword within your result set using position and how many lists it surfaced in." },
      { question: "Is my search stored or sent anywhere unexpected?", answer: "Only the seed term you typed is sent to GainUtility's proxy so it can fetch suggestions from YouTube. Searches and results are not stored, and no account is involved." },
      { question: "Are tags still important for YouTube?", answer: "Modestly. Tags help disambiguation and misspellings but carry far less weight than titles, thumbnails, and watch time. The tag builder stays within YouTube's 500-character field." },
    ],
    limitations: [
      "Suggests phrases only — no search volumes, difficulty, or ranking estimates are shown.",
      "Suggestions are a snapshot at fetch time and can change.",
      "Tags are a minor ranking input — titles and thumbnails matter more.",
    ],
    keywords: ["youtube keyword tool", "youtube keyword research", "youtube autocomplete", "youtube tags generator"],
  },
  {
    slug: "linkedin-carousel-maker",
    path: `/tools/linkedin-carousel-maker`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "LinkedIn Carousel Maker — Build Multi-Slide Carousels | GainUtility",
    description: "Build multi-slide LinkedIn carousels with custom branding, styling, and layout. Export as PDF or ZIP — free, local, no account needed.",
    primaryTool: "linkedin-carousel-maker",
    relatedTools: creatorRelated(["slug-generator", "youtube-thumbnail-preview", "collage-maker", "favicon-generator"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "LinkedIn Carousel Maker", url: `/tools/linkedin-carousel-maker` },
    ],
    intro: "Create professional LinkedIn carousels without design software. Add slides with headings, body text, images, and branding. Customize colors, fonts, and spacing. Export as a multi-page PDF (for direct LinkedIn upload) or a ZIP of individual PNG slides.",
    useCases: [
      { title: "Thought Leadership Posts", desc: "Turn a blog post or thread into a swipeable carousel for higher engagement on LinkedIn." },
      { title: "Case Study Breakdowns", desc: "Present metrics, quotes, and visuals across slides that viewers can swipe at their own pace." },
      { title: "Educational Series", desc: "Break complex topics into digestible slides with consistent branding." },
    ],
    steps: [
      "Choose a template or start blank.",
      "Add slides with headings, text, and optional images.",
      "Customize branding: colors, fonts, logo placement.",
      "Preview the full carousel.",
      "Export as PDF (for LinkedIn) or ZIP of PNG slides.",
    ],
    faq: [
      { question: "What format does LinkedIn accept for carousels?", answer: "LinkedIn accepts multi-page PDFs. The tool exports a PDF with each slide as a page, ready for direct upload." },
      { question: "Can I use my own fonts and colors?", answer: "Yes — customize primary/secondary colors, heading/body fonts, and logo placement per slide or globally." },
      { question: "Is there a slide limit?", answer: "LinkedIn recommends 3–20 slides for optimal engagement. The tool supports up to 30 slides." },
      { question: "Are my slides uploaded anywhere?", answer: "No. All rendering happens in your browser via Canvas API. Your content never leaves your device." },
    ],
    keywords: ["linkedin carousel maker", "create linkedin carousel", "linkedin pdf carousel", "linkedin slides tool"],
  },
  {
    slug: "slug-generator",
    path: `/tools/slug-generator`,
    category: "Creator Studio",
    categorySlug: "creator",
    title: "SEO Slug Generator — Clean URL-Friendly Slugs | GainUtility",
    description: "Turn a page title into a clean, lowercase, URL-friendly slug. Handles Unicode, strips punctuation, and replaces spaces with hyphens.",
    primaryTool: "slug-generator",
    relatedTools: creatorRelated(["youtube-url-toolkit", "canonical-url-generator", "utm-builder", "linkedin-carousel-maker"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Creator Tools", url: CREATOR_ROOT },
      { name: "Slug Generator", url: `/tools/slug-generator` },
    ],
    intro: "Generate clean, consistent slugs for any CMS or static site. Type or paste your headline and the generator lowercases it, strips punctuation, replaces spaces with hyphens, transliterates accented characters, and trims stray separators.",
    useCases: [
      { title: "Blog Post URLs", desc: "Turn article titles into clean, readable URLs that work in any CMS." },
      { title: "Product Page Slugs", desc: "Generate consistent slugs for e-commerce product pages from product names." },
      { title: "Multilingual Sites", desc: "Accented Latin characters transliterate to base forms (é → e); other scripts handled per separator rules." },
    ],
    steps: [
      "Type or paste your page title.",
      "Review the generated slug.",
      "Adjust separator or custom rules if needed.",
      "Copy the slug into your CMS URL field.",
    ],
    faq: [
      { question: "How do I turn a title into an SEO-friendly slug?", answer: "Type or paste your headline and the generator lowercases it, strips punctuation, replaces spaces with hyphens, and trims stray separators." },
      { question: "Does it handle accented and non-Latin characters?", answer: "Accented Latin letters are transliterated to their base forms (é becomes e). Other scripts are handled according to the selected separator and cleanup rules so the result stays URL-safe." },
      { question: "How long should a URL slug be?", answer: "Shorter is generally better for readability in search results — aim for a few descriptive words rather than the full headline, dropping filler words when they add nothing." },
    ],
    keywords: ["slug generator", "url slug generator", "seo slug generator", "title to slug"],
  },

  // ────────────── Media Hub ──────────────
  {
    slug: "media",
    path: MEDIA_ROOT,
    category: "Media Studio",
    categorySlug: "media",
    title: "Free Video & Audio Tools — Edit Locally in Your Browser",
    description: "Extract audio, compress, resize, trim, convert, and turn videos into GIFs — all free and processed entirely in your browser.",
    primaryTool: null,
    relatedTools: mediaRelated(["video-audio-extractor", "video-compressor", "video-resizer", "video-trimmer", "video-converter", "video-to-gif", "photos-to-video", "video-downloader", "add-music-to-photo"]),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Media Tools", url: MEDIA_ROOT },
    ],
    intro: "GainUtility's media toolkit covers the everyday video and audio jobs without uploading a single file. Extract an audio track, shrink a clip's file size, resize video to social formats, trim unwanted footage, convert to a container your browser can write, or turn a short clip into a GIF — each task runs on your device and the result is verified before you download.",
    useCases: [
      { title: "Extract Audio", desc: "Pull the audio track out of a video and keep it as a high-quality WAV file." },
      { title: "Smaller Files", desc: "Re-encode a video with a lower bitrate so it is easier to email or upload." },
      { title: "Social Formats", desc: "Reframe clips to 9:16, 1:1, or 16:9 for Instagram, TikTok, and YouTube." },
      { title: "GIFs & Slideshows", desc: "Turn a short clip into an animated GIF or stitch photos into a video." },
    ],
    steps: [
      "Choose the media tool you need from the collection.",
      "Drop a video or audio file into the workspace.",
      "Pick the goal and adjust the settings (bitrate, size, range, format).",
      "Download the result — checked and verified locally.",
    ],
    faq: [
      { question: "Are these video tools free?", answer: "Yes. Every media tool is free and runs entirely in your browser — no accounts, uploads, or subscriptions." },
      { question: "Do my files leave my device?", answer: "No. All media is decoded and re-encoded locally using the browser's own encoders. Files are never uploaded to a server." },
      { question: "Which output formats are available?", answer: "Output depends on what the browser can encode: typically WebM (VP8/VP9) and MP4 where supported, WAV for audio, and GIF for exports." },
    ],
    keywords: ["free video tools online", "audio extractor", "video compressor", "video resizer", "video trimmer", "video converter", "video to gif"],
  },
];

export const SEO_PAGE_MAP: Record<string, SeoPageEntry> = {};
for (const page of SEO_PAGES) {
  SEO_PAGE_MAP[page.slug] = page;
  SEO_PAGE_MAP[page.path] = page;
}

/* ------------------------------------------------------------------ */
/* Localized hub resolution                                            */
/* ------------------------------------------------------------------ */

/**
 * Resolve the effective hub entry for a locale: the English base entry
 * overlaid with the genuinely translated content from src/i18n/hubs.ts when
 * one exists. Related-tool names use the shared localized tool-name map and
 * the generic localized description pattern, matching the English entries.
 *
 * When no overlay exists (gated sub-pages, missing locale) the English entry
 * is returned unchanged so nothing ever renders fabricated localized data.
 */
export const localizedSeoEntry = (
  en: SeoPageEntry,
  locale: string = DEFAULT_LOCALE
): SeoPageEntry => {
  const overlay = localizedHubOverlay(en.slug, locale);
  if (!overlay) return en;
  const code = (locale.toLowerCase() === "es-co" ? "es-mx" : locale) as LocaleCode;
  const enName = new Map(en.relatedTools.map((r) => [r.id, r.name]));
  const tpl = RELATED_DESC_TEMPLATE[code] ?? RELATED_DESC_TEMPLATE.en;
  return {
    ...en,
    category: overlay.category,
    // Only override when the overlay carries one: a hub whose English H1 is
    // the generic template keeps falling back to the localized template.
    ...(overlay.h1 ? { h1: overlay.h1 } : {}),
    title: overlay.title,
    description: overlay.description,
    intro: overlay.intro,
    useCases: overlay.useCases,
    steps: overlay.steps,
    faq: overlay.faq,
    breadcrumbs: overlay.breadcrumbs.map((c, i) => ({
      name: c.name,
      url: localizedCrumbPath(locale, en.breadcrumbs[i]?.url ?? c.url),
    })),
    relatedTools: en.relatedTools.map((r) => {
      const name = localizedToolName(r.id, code, enName.get(r.id) ?? r.id);
      return { id: r.id, name, description: tpl.replace("{name}", name) };
    }),
  };
};
