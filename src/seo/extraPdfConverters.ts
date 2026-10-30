/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for PDF conversion tools not covered by src/data.ts.
 * Claims are grounded in the actual client-side implementations.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const PDF_LOCAL =
  "Files are processed entirely inside your browser using client-side JavaScript. Your document is never uploaded to a server.";

export const PDF_CONVERTER_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "word-to-pdf": {
    title: "Word to PDF Converter — Convert DOCX to PDF Free",
    description:
      "Convert Microsoft Word .docx documents into clean, professional PDFs directly in your browser. No uploads, no watermarks, no sign-up.",
    intro:
      "Upload a .docx file and download a structured PDF that preserves headings, paragraphs, lists, and tables — converted locally on your device.",
    steps: [
      "Select or drag in your Word (.docx) file.",
      "Wait a moment while the document is parsed and rendered locally.",
      "Review the converted result.",
      "Download the finished PDF."
    ],
    whatText:
      "This converter reads the .docx structure — headings, body text, lists, and tables — and lays it out into standard PDF pages suitable for printing and sharing.",
    whyText:
      "PDF is the universal format for submissions, applications, and print shops because it renders identically everywhere. Converting Word drafts to PDF locks layout so recipients see exactly what you wrote.",
    features: [
      "Supports Microsoft Word .docx input",
      "Preserves headings, paragraphs, lists, and table structure",
      "Automatic page breaks and margins",
      "Runs offline in your browser — no file size queue",
      "Free with no watermark"
    ],
    faqs: [
      {
        question: "How do I convert a Word document to PDF?",
        answer:
          "Add your .docx file to the tool and it converts automatically. Download the resulting PDF when processing finishes."
      },
      {
        question: "Does the converted PDF keep my formatting?",
        answer:
          "Headings, paragraphs, lists, and tables carry over. Complex elements like embedded macros or tracked changes are not part of the output."
      },
      {
        question: "Can I convert older .doc files?",
        answer:
          "Save the file as .docx in Word first — the modern format parses reliably; legacy binary .doc is not supported."
      },
      {
        question: "Is my document uploaded during conversion?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["pdf-to-word", "excel-to-pdf", "powerpoint-to-pdf", "text-to-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-word": {
    title: "PDF to Word Converter — Turn PDF Into Editable DOCX",
    description:
      "Convert PDF pages into editable Microsoft Word .docx documents in your browser. Recover text you can actually edit — free and private.",
    intro:
      "Stop retyping locked PDFs. Extract the text content into an editable Word document you can revise immediately.",
    steps: [
      "Upload a text-based PDF file.",
      "The converter extracts paragraphs into a .docx structure.",
      "Download the editable Word document."
    ],
    faqs: [
      {
        question: "How do I convert a PDF to a Word document?",
        answer:
          "Upload the PDF and let the converter extract its text content into a .docx structure, then download the editable Word file."
      },
      {
        question: "Will scanned PDFs convert to editable Word?",
        answer:
          "Scans contain images rather than text. Run them through OCR PDF first to generate a text layer, then convert."
      },
      {
        question: "How accurate is the conversion?",
        answer:
          "Text-based PDFs convert well. Complex multi-column layouts may need minor reflowing after import into Word."
      },
      {
        question: "Where does conversion happen?",
        answer: "In your browser. " + PDF_LOCAL
      }
    ],
    related: ["word-to-pdf", "ocr-pdf", "pdf-to-text", "pdf-to-html"],
    privacyExplanation: PDF_LOCAL
  },
  "excel-to-pdf": {
    title: "Excel to PDF — Convert Spreadsheets to PDF Online",
    description:
      "Render Excel spreadsheets into clean, print-ready PDF pages right in your browser. Share data without spreadsheet software.",
    intro:
      "Turn .xlsx sheets into paginated PDF tables that look the same on every device — ideal for reports, invoices, and handouts.",
    steps: [
      "Upload your Excel (.xlsx) workbook.",
      "Let the tool render each sheet into print-friendly page layouts.",
      "Check the preview of the generated pages.",
      "Download your PDF."
    ],
    whatText:
      "The converter reads worksheet cells and formats them into clean tabular PDF pages, applying sensible column widths and page breaks so wide tables stay readable.",
    whyText:
      "Recipients without Excel still need your numbers. A PDF snapshot of the sheet preserves values, alignment, and order without exposing editable formulas.",
    features: [
      ".xlsx workbook input with multi-sheet support",
      "Print-friendly pagination of wide tables",
      "Consistent rendering across devices",
      "Local in-browser conversion",
      "No sign-up or watermark"
    ],
    faqs: [
      {
        question: "How do I turn an Excel sheet into a PDF?",
        answer:
          "Upload the .xlsx file, wait for the sheets to be rendered into pages, then download the PDF."
      },
      {
        question: "Are formulas converted?",
        answer:
          "Formulas are evaluated as their current cell values — the PDF shows numbers, not live formulas."
      },
      {
        question: "Can I export multiple sheets at once?",
        answer: "Yes, each worksheet becomes its own sequence of pages in one document."
      },
      {
        question: "Is my spreadsheet sent to a server?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["pdf-to-excel", "word-to-pdf", "csv-reconciliation", "powerpoint-to-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter — Extract Tables From PDF",
    description:
      "Pull tables out of any PDF and rebuild them as structured CSV/Excel grids in your browser. Stop copying cells by hand.",
    intro:
      "Find the tables inside your PDF, extract rows and columns automatically, and download data ready for Excel or Sheets.",
    steps: [
      "Upload the PDF containing your table.",
      "The analyzer detects tabular structures and maps rows and columns.",
      "Preview the extracted grid.",
      "Download as CSV and open it in Excel or Google Sheets."
    ],
    faqs: [
      {
        question: "How do I extract a table from a PDF?",
        answer:
          "Upload the PDF and the analyzer locates tabular structures, exporting them as clean CSV grids you can open in Excel."
      },
      {
        question: "Does it keep rows and columns aligned?",
        answer:
          "Well-formed tables extract cleanly; heavily stylized layouts may need light cleanup after import."
      },
      {
        question: "Can I use the output in Google Sheets?",
        answer: "Yes — CSV opens directly in Google Sheets via File → Import."
      },
      {
        question: "Do you upload my PDF for extraction?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["excel-to-pdf", "pdf-to-word", "csv-json-converter", "ocr-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "powerpoint-to-pdf": {
    title: "PowerPoint to PDF — Convert Slides to PDF Free",
    description:
      "Convert PowerPoint presentations into consistent, shareable PDF files in your browser. One slide per page, no distortion.",
    intro:
      "Share decks that open anywhere. Each slide becomes a crisp PDF page — perfect for email handouts and printing.",
    steps: [
      "Upload your PowerPoint (.pptx) file.",
      "Slides are rendered locally into fixed-size pages.",
      "Review the generated preview.",
      "Download the PDF version of your deck."
    ],
    whatText:
      "Each presentation slide is laid out onto its own PDF page, preserving titles, bullets, and imagery in a fixed layout recipients can't accidentally edit.",
    whyText:
      "Fonts break and layouts shift when decks travel between machines. A PDF freezes every slide exactly as designed and prints predictably.",
    features: [
      ".pptx presentation input",
      "One slide per page output",
      "Fixed layout immune to font substitution",
      "Local browser-side conversion",
      "Free, no watermark"
    ],
    faqs: [
      {
        question: "How do I save PowerPoint slides as a PDF?",
        answer:
          "Upload the .pptx here and download the rendered PDF — each slide becomes one page in order."
      },
      {
        question: "Do animations transfer?",
        answer:
          "No. PDFs are static by nature; slides appear in their final state."
      },
      {
        question: "Will speaker notes be included?",
        answer: "Only slide visuals are exported; notes stay out of the handout."
      },
      {
        question: "Where does the conversion run?",
        answer: "Entirely in your browser. " + PDF_LOCAL
      }
    ],
    related: ["pdf-to-powerpoint", "word-to-pdf", "excel-to-pdf", "merge-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-powerpoint": {
    title: "PDF to PowerPoint — Convert PDF Pages to Slides",
    description:
      "Turn PDF pages into editable PowerPoint slide layouts in your browser. Reuse report pages inside new presentations — private and free.",
    intro:
      "Drop a PDF in, get slides out. Each page maps to an editable slide you can drop straight into a deck.",
    steps: [
      "Upload the PDF you want to reuse.",
      "Each page is translated into a slide layout.",
      "Review how content landed on the slides.",
      "Download the presentation file for editing in PowerPoint."
    ],
    faqs: [
      {
        question: "How do I convert a PDF into PowerPoint slides?",
        answer:
          "Upload the PDF; each page is translated into a slide layout you can download as a .pptx-compatible file."
      },
      {
        question: "Are slides fully editable afterwards?",
        answer:
          "Text content is placed into editable boxes where extraction succeeds; dense graphics may land as fixed elements."
      },
      {
        question: "Why convert PDF back to slides?",
        answer:
          "To reuse approved report content inside a new deck instead of screenshotting pages."
      },
      {
        question: "Is anything uploaded?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["powerpoint-to-pdf", "pdf-to-word", "pdf-to-html", "split-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "html-to-pdf": {
    title: "HTML to PDF Generator — Print HTML as PDF",
    description:
      "Compile HTML snippets or web-page markup into clean PDF printouts directly in your browser. Instant rendering, no uploads.",
    intro:
      "Paste markup or load a snippet, hit convert, and get a typeset PDF. Great for receipts, tickets, and formatted letters.",
    steps: [
      "Paste your HTML source or type rich content.",
      "Adjust page settings if needed.",
      "Render the preview.",
      "Download the PDF."
    ],
    whatText:
      "The renderer interprets your HTML structure and typography, flowing it into standard PDF pages just like a browser's print engine would.",
    whyText:
      "HTML gives you pixel-level control over invoices, labels, and letters; converting to PDF makes the result portable and tamper-resistant.",
    features: [
      "Accepts raw HTML markup and styled snippets",
      "Standard page sizing with automatic flow",
      "Live preview before saving",
      "Client-side rendering only",
      "Completely free"
    ],
    faqs: [
      {
        question: "How do I convert HTML to PDF?",
        answer:
          "Paste your HTML into the editor, preview the rendered pages, and download the PDF."
      },
      {
        question: "Does CSS styling apply?",
        answer: "Basic inline styles and simple rules carry over; complex external stylesheets aren't fetched."
      },
      {
        question: "Can I convert a live website URL?",
        answer:
          "This tool works on pasted markup rather than fetching external sites, which keeps rendering instant and private."
      },
      {
        question: "Is the renderer server-based?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["text-to-pdf", "word-to-pdf", "pdf-to-text", "pdf-to-word"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-text": {
    title: "PDF to Text Extractor — Pull Raw Text From PDF",
    description:
      "Extract raw text and paragraphs from any text-based PDF in your browser. Copy or download as .txt — fast, free, no uploads.",
    intro:
      "Get plain text out of PDFs instantly: search, quote, or feed it to other tools. Extraction runs locally on every page.",
    steps: [
      "Upload a text-based PDF.",
      "Text is extracted page by page automatically.",
      "Review the combined output.",
      "Copy to clipboard or download as a .txt file."
    ],
    whatText:
      "The extractor walks each page's text layer, preserving paragraph breaks where possible, and outputs clean plain text without layout noise.",
    whyText:
      "Plain text is the universal interchange format — for quoting sources, indexing content, feeding search tools, or reusing copy elsewhere.",
    features: [
      "Whole-document extraction with page ordering preserved",
      "Copy-all or download as .txt",
      "Works offline in-browser",
      "Instant results on typical documents",
      "No file limits"
    ],
    faqs: [
      {
        question: "How do I get text out of a PDF?",
        answer:
          "Upload the PDF here; extracted text appears in the output panel ready to copy or save as .txt."
      },
      {
        question: "Why is my scanned PDF returning no text?",
        answer:
          "Scans store pictures, not characters. Run OCR PDF first to build a text layer, then extract."
      },
      {
        question: "Is formatting like bold preserved?",
        answer:
          "Output is plain text by design — emphasis and fonts are dropped, words and paragraphs remain."
      },
      {
        question: "Where does extraction happen?",
        answer: "Locally in your browser. " + PDF_LOCAL
      }
    ],
    related: ["ocr-pdf", "pdf-to-word", "text-to-pdf", "pdf-to-html"],
    privacyExplanation: PDF_LOCAL
  },
  "text-to-pdf": {
    title: "Text to PDF Converter — Save Text & Code as PDF",
    description:
      "Convert plain text, code listings, or markdown logs into neatly typeset PDF pages in your browser. Free, instant, private.",
    intro:
      "Paste any text and get a readable PDF with proper margins and monospace handling for code. Ideal for archiving logs or sharing snippets.",
    steps: [
      "Paste or type your content into the editor.",
      "Pick typography options if needed.",
      "Generate the typeset PDF.",
      "Download or share the finished file."
    ],
    faqs: [
      {
        question: "How do I convert text into a PDF?",
        answer:
          "Paste or type your content, choose typography options if needed, and generate the downloadable PDF."
      },
      {
        question: "Does code keep its indentation?",
        answer:
          "Yes — monospace rendering preserves spacing so code listings stay aligned."
      },
      {
        question: "Can long documents paginate correctly?",
        answer: "Content flows automatically across as many pages as needed with sensible line wrapping."
      },
      {
        question: "Is this done online or offline?",
        answer: "Offline in your browser. " + PDF_LOCAL
      }
    ],
    related: ["html-to-pdf", "word-to-pdf", "jpg-to-pdf", "pdf-to-text"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-html": {
    title: "PDF to HTML Converter — Publish PDF Content as Web Pages",
    description:
      "Convert PDF pages into structured HTML that keeps paragraphs and reading order. Reuse documents on the web — processed locally.",
    intro:
      "Turn static PDFs into web-friendly markup: paragraphs become <p> blocks and structure survives, ready for editing or publishing.",
    steps: [
      "Upload a text-based PDF.",
      "Paragraphs and headings are mapped to HTML elements.",
      "Inspect the generated markup.",
      "Copy or download the HTML output."
    ],
    faqs: [
      {
        question: "How do I convert a PDF to HTML?",
        answer:
          "Upload the PDF and the converter maps its text structure into clean HTML output you can view, copy, or download."
      },
      {
        question: "Is the generated HTML semantic?",
        answer:
          "Paragraphs and headings map to appropriate tags where detectable, producing cleaner code than image dumps."
      },
      {
        question: "What about images in the PDF?",
        answer: "Embedded raster images can be carried over alongside the text structure."
      },
      {
        question: "Does my file leave the browser?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["pdf-to-text", "pdf-to-word", "html-entity-encoder", "html-to-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-translator": {
    title: "Translate PDF Online — Free PDF Translator in Your Browser",
    description:
      "Translate a PDF into another language. Native-text pages convert directly, scanned pages are OCR'd first, and the result is rebuilt page by page.",
    intro:
      "Upload a PDF and download a page-by-page translation of it. Text documents are read and translated directly; scanned pages are recognized with OCR before the text is converted, so image-only files still work. The translated document is rebuilt locally and rendered with correct scripts for languages like Hindi and Arabic.",
    steps: [
      "Upload a PDF — up to 20 MB and 60 pages.",
      "Choose the output language (the source is detected automatically).",
      "The tool reads the document, OCRs scanned pages, then translates every page.",
      "Preview the rebuilt PDF and download the translation."
    ],
    faqs: [
      {
        question: "Does the PDF translator work with scanned documents?",
        answer:
          "Yes. Image-only pages are detected and run through OCR before translation. Clean print works well; handwriting and low-quality scans produce errors that carry into the translation."
      },
      {
        question: "How does it handle languages like Hindi or Arabic?",
        answer:
          "Translated pages are redrawn with the browser's font engine, so Devanagari renders correctly and Arabic pages are set right-to-left — scripts that a simple PDF text edit can't handle."
      },
      {
        question: "Is my PDF file uploaded anywhere?",
        answer:
          "The PDF itself is processed locally and never uploaded. The extracted text is sent to a third-party translation service (Google) for conversion, then returned to your browser and rebuilt into a new PDF on your device."
      },
      {
        question: "Will the translated PDF match the original layout?",
        answer:
          "Not exactly. The tool translates the text and rebuilds each page around it, so layout, images, and styling are reconstructed rather than preserved pixel-for-pixel. Use it when the meaning matters more than the original design."
      }
    ],
    related: ["ocr-pdf", "pdf-to-text", "text-to-pdf", "pdf-to-word"],
    privacyExplanation:
      "The PDF is opened and rebuilt locally and never uploaded to a server. The extracted text is sent to a third-party translation service (Google) for conversion and returned to your device. Don't translate documents that must never leave your computer."
  }
};
