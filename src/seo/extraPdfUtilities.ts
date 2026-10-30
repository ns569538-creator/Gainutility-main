/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for PDF optimization, inspection and advanced utilities
 * not covered by src/data.ts.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const PDF_LOCAL =
  "Files are processed entirely inside your browser using client-side JavaScript. Your document is never uploaded to a server.";

export const PDF_UTILITY_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "remove-pdf-metadata": {
    title: "Remove PDF Metadata — Strip Hidden Document Info",
    description:
      "Delete author names, creation dates, editing history, and other hidden metadata from PDFs in your browser. Share documents worry-free.",
    intro:
      "PDFs carry invisible baggage — author names, software versions, timestamps. Scrub it before sharing sensitive or anonymous documents.",
    steps: [
      "Upload the PDF you plan to share.",
      "Review which metadata fields were detected.",
      "Strip all hidden fields with one click.",
      "Download the cleaned document."
    ],
    whatText:
      "The tool reads the document information dictionary and XMP stream, then rewrites the file without those fields so nothing identifying leaks out.",
    whyText:
      "Metadata has leaked authors' identities in court filings and journalism for decades. If privacy matters, stripping it before publishing takes seconds.",
    features: [
      "Detects author, producer, creation/modification dates, and custom fields",
      "One-click removal of all informational fields",
      "Content of pages remains 100% untouched",
      "Runs locally in your browser",
      "Free with no file limits"
    ],
    faqs: [
      {
        question: "What metadata does a PDF contain?",
        answer:
          "Typically title, author, subject, keywords, creating application, and timestamps — plus optional XMP records with richer history."
      },
      {
        question: "Does removing metadata change my pages?",
        answer: "No. Visible content stays identical; only hidden descriptive fields are deleted."
      },
      {
        question: "Why should I strip metadata before sharing?",
        answer:
          "It prevents leaking your name, employer, software, and edit history embedded without your knowledge."
      },
      {
        question: "Is cleaning done on a server?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["compress-images-inside-pdf", "protect-pdf", "validate-pdf"],
    privacyExplanation: PDF_LOCAL + " The stripped output never touches a server."
  },
  "repair-pdf": {
    title: "Repair PDF File — Fix Corrupted PDFs Online",
    description:
      "Reconstruct broken cross-reference tables and salvage readable pages from corrupted PDFs — rebuilt locally in your browser.",
    intro:
      "Won't open? Error on every page? Attempt a structural rebuild that recovers what's salvageable instead of losing the file entirely.",
    steps: [
      "Upload the damaged PDF file.",
      "The tool scans raw objects and rebuilds a valid document structure.",
      "Review which pages were recovered.",
      "Download the repaired copy."
    ],
    faqs: [
      {
        question: "How do I repair a corrupted PDF?",
        answer:
          "Upload the damaged file; the tool scans raw objects and rebuilds a valid structure around recoverable content, then offers a repaired copy."
      },
      {
        question: "Can all damaged PDFs be recovered?",
        answer:
          "No — recovery depends on how much of the file survived. Truncated downloads often yield most pages; heavily overwritten files may not open at all."
      },
      {
        question: "Will repaired files look identical?",
        answer:
          "Recovered pages keep original appearance; some auxiliary structures like form fields may not survive severe damage."
      },
      {
        question: "Where does repair run?",
        answer: "In your browser. " + PDF_LOCAL
      }
    ],
    related: ["validate-pdf", "optimize-pdf-web", "merge-pdf", "split-every-n-pages"],
    privacyExplanation: PDF_LOCAL
  },
  "validate-pdf": {
    title: "Validate PDF — Check Structure & Compliance",
    description:
      "Audit PDF internals against standard structural rules including PDF/A conformance signals. Get a clear health report instantly, in-browser.",
    intro:
      "Know exactly what's inside your PDF before archiving or submitting: version, encryption state, fonts, and compliance flags at a glance.",
    steps: [
      "Upload the PDF you want to audit.",
      "The validator inspects structure, references, and encryption state.",
      "Read the health report and flagged issues.",
      "Fix problems or archive with confidence."
    ],
    faqs: [
      {
        question: "How do I check if my PDF is valid?",
        answer:
          "Upload it here; the validator inspects the document structure and reports issues such as missing tables, bad references, or encryption."
      },
      {
        question: "What is PDF/A and can I check for it?",
        answer:
          "PDF/A is an archival subset banning external dependencies; the audit surfaces conformance indicators relevant to long-term storage."
      },
      {
        question: "My PDF opens fine — why validate?",
        answer:
          "Viewers silently tolerate many defects. Validation catches problems that break printers, parsers, and archival systems later."
      },
      {
        question: "Does validation upload my file?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["repair-pdf", "remove-pdf-metadata", "compare-two-pdfs",
                                 "optimize-pdf-web"],
    privacyExplanation: PDF_LOCAL
  },
  "optimize-pdf-web": {
    title: "Optimize PDF for Web — Faster Online Viewing",
    description:
      "Restructure PDF streams for faster incremental loading in browsers and preview panes. Lighter first-page display, processed locally.",
    intro:
      "Make big documents pleasant to view online: reorganized streams let viewers paint the first page while the rest still loads.",
    steps: [
      "Upload the PDF intended for web embedding.",
      "Internal object order is reorganized for progressive rendering.",
      "Compare before and after if desired.",
      "Download the optimized file."
    ],
    faqs: [
      {
        question: "What does optimizing a PDF for web do?",
        answer:
          "It reorganizes internal object order and stream layout toward linearized-style delivery, so viewers render early pages sooner during download."
      },
      {
        question: "Will optimizing change how my PDF looks?",
        answer:
          "No. Optimization reorganizes the internal structure only — page content, text, and images are untouched. If your goal is a smaller file rather than faster loading, use Compress PDF instead."
      },
      {
        question: "When should I optimize?",
        answer:
          "Before embedding manuals, reports, or catalogs on websites where visitors expect instant previews."
      },
      {
        question: "Is optimization done offline?",
        answer: "Yes. " + PDF_LOCAL
      }
    ],
    related: ["split-pdf", "reduce-pdf-image-quality", "compress-images-inside-pdf", "validate-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "reduce-pdf-image-quality": {
    title: "Compress PDF — Shrink Heavy PDFs",
    description:
      "Downsample oversized images embedded in your PDF to cut file size dramatically. Keep text crisp while photos slim down — all in-browser.",
    intro:
      "The fastest way to shrink scan-heavy PDFs: resample giant images to sane resolutions while leaving text and vectors untouched.",
    steps: [
      "Upload the image-heavy PDF.",
      "Choose target quality/resolution for embedded images.",
      "Apply downsampling locally.",
      "Compare sizes and download the lighter file."
    ],
    whatText:
      "Embedded raster images are re-encoded at your chosen quality level. Text, fonts, and vector graphics bypass processing entirely and stay pixel-perfect.",
    whyText:
      "Scanners export at 300–600 DPI by default, producing enormous files. Resampling to screen-appropriate resolution routinely cuts size by half or more with no visible loss on screen.",
    features: [
      "Adjustable quality presets",
      "Text/vector content preserved automatically",
      "Before/after size comparison",
      "Local processing only",
      "Unlimited free use"
    ],
    faqs: [
      {
        question: "How do I make a scanned PDF smaller?",
        answer:
          "Run it through this tool and downsample embedded images — scans are mostly picture data, so savings are immediate."
      },
      {
        question: "Will text become blurry?",
        answer: "Never — text isn't rasterized; it stays vector-sharp at any zoom level."
      },
      {
        question: "Which quality preset should I pick?",
        answer:
          "Screen reading tolerates aggressive settings; choose higher quality only if pages will be printed."
      },
      {
        question: "Do you upload my document to compress it?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["compress-images-inside-pdf", "jpg-to-pdf", "optimize-pdf-web", "text-to-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "compress-images-inside-pdf": {
    title: "Compress Images Inside PDF — Re-encode Embedded Photos",
    description:
      "Re-compress embedded raster images within a PDF without touching its text layer. Smaller files, identical words — private browser processing.",
    intro:
      "Target just the pictures: re-encode embedded JPEGs and PNGs at efficient quality while every character of text survives intact.",
    steps: [
      "Upload the PDF with heavy embedded images.",
      "Choose a compression strength for the rasters.",
      "Apply and let images re-encode in place.",
      "Download the lighter file — text stays untouched."
    ],
    faqs: [
      {
        question: "How do I compress images already inside a PDF?",
        answer:
          "Upload the file, select compression strength, and apply — embedded rasters are re-encoded in place."
      },
      {
        question: "Is this different from Compress PDF?",
        answer:
          "Both shrink files via images; this one emphasizes clean re-encoding of existing rasters, while Compress PDF focuses on resolution downsampling."
      },
      {
        question: "Can text be affected?",
        answer: "No — textual and vector layers pass through unmodified by design."
      },
      {
        question: "Where does re-encoding occur?",
        answer: "Locally in your browser. " + PDF_LOCAL
      }
    ],
    related: ["reduce-pdf-image-quality", "pdf-to-jpg", "optimize-pdf-web", "image-converter"],
    privacyExplanation: PDF_LOCAL
  },
  "ocr-pdf": {
    title: "OCR PDF — Extract Text From Scanned Documents",
    description:
      "Run optical character recognition (Tesseract) on scanned PDFs entirely in your browser and download recognized text as .txt. No uploads.",
    intro:
      "Turn picture-only scans into selectable text using Tesseract OCR running locally — your confidential scans stay on your machine.",
    steps: [
      "Upload the scanned PDF.",
      "OCR processes each page with Tesseract in-page.",
      "Review recognized text per page.",
      "Copy results or download the combined .txt file."
    ],
    whatText:
      "Each page is rendered to an image, then Tesseract's recognition engine detects characters and lines, producing plain text you can search and reuse.",
    whyText:
      "Locked scans are dead weight — you cannot quote, search, or index them. OCR revives old contracts, receipts, and printed notes into usable data.",
    features: [
      "Tesseract engine runs fully client-side",
      "Per-page progress with combined output",
      "Downloadable .txt result",
      "Nothing uploaded — ideal for confidential scans",
      "Free unlimited use"
    ],
    limitations: [
      "Accuracy depends on scan quality; blurry or skewed scans reduce recognition rates",
      "Recognition speed scales with page count since processing is local"
    ],
    faqs: [
      {
        question: "How do I extract text from a scanned PDF?",
        answer:
          "Upload it here; OCR analyzes each page and outputs recognized characters ready to copy or save as .txt."
      },
      {
        question: "How accurate is the OCR?",
        answer:
          "Clean 300-DPI scans recognize very well; skewed, low-resolution, or stylized text lowers accuracy. Review output for critical documents."
      },
      {
        question: "Which languages are supported?",
        answer: "English models are loaded by default; support depends on the bundled language data."
      },
      {
        question: "Are my scanned documents uploaded?",
        answer: "No. " + PDF_LOCAL + " Recognition itself also runs on-device."
      }
    ],
    related: ["pdf-to-text", "pdf-to-word", "compare-two-pdfs", "remove-blank-pages-pdf"],
    privacyExplanation: PDF_LOCAL + " The Tesseract model also executes locally."
  },
  "compare-two-pdfs": {
    title: "Compare Two PDFs — Spot Text Differences Between Versions",
    description:
      "Compare two PDF versions by diffing their text content. Highlight added, removed and modified clauses, then download a difference report. Runs locally.",
    intro:
      "Upload two versions of the same document and see exactly what changed between drafts — added, removed, or altered text surfaced clearly. This tool compares TEXT CONTENT ONLY — visual layout, images, and formatting are not analyzed.",
    steps: [
      "Upload the original PDF.",
      "Upload the revised PDF.",
      "Run the comparison analysis.",
      "Review highlighted text differences page by page."
    ],
    whatText:
      "Text layers of both documents are extracted and aligned, then differences are flagged so additions and deletions stand out during review. Comparison is text-only; visual/layout changes are not detected.",
    whyText:
      "Manually proofreading contract redlines invites mistakes. Automated text comparison catches every wording change, even subtle ones hidden mid-paragraph. This tool runs entirely in your browser — no uploads.",
    features: [
      "Side-by-side text comparison with synchronized scrolling",
      "Unified redline view with additions (green), deletions (red), modifications (amber)",
      "Category filters: financial, dates, metrics, clauses",
      "Handles multi-page documents",
      "Entirely local comparison — no uploads",
      "Downloadable text difference report (.txt)"
    ],
    limitations: [
      "Compares TEXT CONTENT ONLY — visual layout, images, formatting, and scanned/raster PDFs are not analyzed.",
      "For scanned PDFs, run both through OCR PDF first."
    ],
    faqs: [
      {
        question: "How do I compare two PDF documents?",
        answer:
          "Load both files, start the analysis, and review the flagged textual differences between them."
      },
      {
        question: "Can it compare scanned documents?",
        answer:
          "Only after OCR creates text layers — run both through OCR PDF first for best results."
      },
      {
        question: "Does it show visual/layout changes?",
        answer:
          "No. This tool compares extracted text content only. Visual layout, images, fonts, and formatting differences are not detected."
      },
      {
        question: "Are my documents sent anywhere?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["text-diff-checker", "duplicate-page-finder-pdf", "ocr-pdf", "validate-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "merge-selected-page-ranges": {
    title: "Merge Selected Page Ranges — Combine PDF Sections",
    description:
      "Merge specific page ranges from multiple PDFs into one compiled document. Cherry-pick chapters across files — local and watermark-free.",
    intro:
      "Need chapter 2 of one report and appendix A of another? Define exact ranges per source file and compile them in order.",
    steps: [
      "Add each source PDF to the queue.",
      "Define the page range to pull from every file (e.g., 3-9).",
      "Arrange the selections in the order you want them compiled.",
      "Merge and download the combined document."
    ],
    faqs: [
      {
        question: "How do I merge certain pages from different PDFs?",
        answer:
          "Add each file, specify its range (e.g., 3-9), order the selections, and merge — output contains only chosen spans."
      },
      {
        question: "Can I take multiple ranges from one file?",
        answer: "Yes — define several range entries pointing at the same document."
      },
      {
        question: "Difference vs regular Merge PDF?",
        answer:
          "Plain Merge concatenates whole files; this one extracts precisely defined slices first, saving manual extraction steps."
      },
      {
        question: "Is compilation performed privately?",
        answer: "Yes. " + PDF_LOCAL
      }
    ],
    related: ["merge-pdf", "extract-pdf", "split-pdf", "split-every-n-pages"],
    privacyExplanation: PDF_LOCAL
  },
  "split-by-file-size": {
    title: "Split PDF by File Size — Fit Email Attachment Limits",
    description:
      "Break huge PDFs into parts under a target size limit (10MB, 25MB…). Beat email caps without manual math — split locally in-browser.",
    intro:
      "Email bounced your 40MB attachment? Set a max part size and receive ready-to-send chunks preserving page boundaries.",
    steps: [
      "Enter your maximum part size (e.g., 10 MB).",
      "Upload the oversized PDF.",
      "The splitter packs as many whole pages as fit under each cap.",
      "Download all ready-to-send parts."
    ],
    faqs: [
      {
        question: "How do I split a PDF under 10MB?",
        answer:
          "Enter your target size, upload the file, and split — parts are packed with as many pages as fit under the cap."
      },
      {
        question: "Why not just compress instead?",
        answer:
          "Compression helps but rarely suffices alone; splitting guarantees each part meets hard platform limits."
      },
      {
        question: "Are pages ever divided mid-content?",
        answer: "No — splits happen only between pages, keeping every page whole."
      },
      {
        question: "Where does sizing analysis run?",
        answer: "In-browser. " + PDF_LOCAL
      }
    ],
    related: ["split-every-n-pages", "split-pdf", "compress-images-inside-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "split-every-n-pages": {
    title: "Split PDF Every N Pages — Batch Divide Documents",
    description:
      "Automatically divide a long PDF into equal chunks of N pages each (5, 10, 20…). Batch-splitting done locally, free, no sign-up.",
    intro:
      "Turn a 200-page binder into twenty 10-page files in seconds — perfect for chapter handouts, batch printing, and review packets.",
    steps: [
      "Set the chunk length in pages (e.g., every 10 pages).",
      "Upload the long PDF.",
      "The document is divided into sequential equal parts.",
      "Download all generated files."
    ],
    faqs: [
      {
        question: "How do I split a PDF into equal parts?",
        answer:
          "Set chunk length (e.g., every 10 pages), upload, and split — sequential files download together."
      },
      {
        question: "What if the last chunk is smaller?",
        answer: "A final short file contains leftover pages — nothing is dropped."
      },
      {
        question: "Can I name chunks automatically?",
        answer: "Outputs follow a numbered pattern reflecting their page span for easy sorting."
      },
      {
        question: "Is batch splitting server-side?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["split-by-file-size", "split-pdf", "rearrange-pdf"],
    privacyExplanation: PDF_LOCAL
  }
};
