/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for PDF Studio tools not covered by the rich registry in
 * src/data.ts. One primary search intent per tool with unique title,
 * description, FAQs and contextual related tools. Only claims matching the
 * actual implementation are made.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const PDF_LOCAL =
  "Files are processed entirely inside your browser using client-side JavaScript. Your document is never uploaded to a server.";

export const PDF_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  // ----------------------------------------------------------------
  // Organize
  // ----------------------------------------------------------------
  "merge-pdf": {
    title: "Merge PDF — Combine Multiple PDF Files | GainUtility",
    description:
      "Combine multiple PDF documents into one single file right in your browser. Arrange pages, merge in seconds — free, no uploads, and no watermarks.",
    intro:
      "Combine two or more PDF files into a single organized document directly in your browser. Reorder files, preview page counts, and merge in seconds without uploading files to any external server.",
    steps: [
      "Upload your PDF files by clicking Upload PDF or dragging files into the dropzone.",
      "Rearrange the documents in the exact order you want them merged using drag-and-drop or move buttons.",
      "Click Merge PDFs to combine all documents locally in your browser memory.",
      "Click Download Merged PDF to save your combined file instantly."
    ],
    faqs: [
      {
        question: "How do I merge multiple PDF files into one document?",
        answer:
          "Click the Upload PDF button or drop your PDF files into the workspace. Use the reorder buttons or drag them to put them in the desired sequence, then click Merge PDFs. Your combined file is compiled locally in seconds and ready to download."
      },
      {
        question: "Is there a limit on how many PDFs or pages I can merge?",
        answer:
          "There is no arbitrary file count or page limit. Because GainUtility merges PDFs directly in your web browser using client-side JavaScript, the limit depends solely on your device's available memory."
      },
      {
        question: "Will merging PDFs reduce text or image quality?",
        answer:
          "No. The original page streams, vector text, fonts, and embedded images are copied losslessly into the merged document without recompression, preserving exact quality."
      },
      {
        question: "Are my sensitive or confidential PDF files uploaded to a server?",
        answer:
          "Never. GainUtility executes all PDF merging entirely within your web browser using WebAssembly and client-side JavaScript. Your files never leave your device."
      },
      {
        question: "Can I merge password-protected or encrypted PDFs?",
        answer:
          "If a PDF requires a password to read its contents, you must unlock or remove the password first before merging. Once unlocked, it can be combined with other documents seamlessly."
      }
    ],
    related: ["split-pdf", "compress-images-inside-pdf", "rotate-pdf", "pdf-to-jpg"],
    privacyExplanation: PDF_LOCAL,
    limitations: [
      "Password-protected (encrypted) PDFs must be unlocked before merging.",
      "Browser memory limits apply for very large files (e.g., hundreds of megabytes on low-memory mobile devices)."
    ]
  },
  "split-pdf": {
    title: "Split PDF – Extract Pages Online Free | GainUtility",
    description:
      "Separate PDF pages or extract custom page ranges into new documents in your browser. Download individual files or all in a ZIP — free, no uploads.",
    intro:
      "Extract specific pages or break a large PDF document into smaller individual files directly in your web browser. Select pages visually, choose custom ranges, or divide every N pages with zero file uploads and no quality loss.",
    steps: [
      "Upload your PDF file by clicking Upload PDF to Split or dropping it into the workspace.",
      "Choose your splitting strategy: Extract Selected Pages, Split by Custom Range, or Split Every N Pages.",
      "Review your page selection visually using the interactive preview grid.",
      "Click Process Split PDF and download your files immediately as individual PDFs or in a single ZIP archive."
    ],
    faqs: [
      {
        question: "How do I split a PDF into separate pages or ranges?",
        answer:
          "Upload your PDF, select whether you want to extract specific pages (by clicking their thumbnails), define custom ranges (such as 1-3, 5, 8-10), or split every N pages. Then click Process Split PDF. Your output files are compiled locally in seconds."
      },
      {
        question: "How do I download multiple split PDF files at once?",
        answer:
          "When multiple files are generated, GainUtility automatically bundles them into a single convenient ZIP archive with a primary 'Download All (ZIP)' button, avoiding browser popup-blocker warnings while still allowing individual file downloads."
      },
      {
        question: "Will splitting a PDF reduce text clarity or image quality?",
        answer:
          "No. Splitting extracts and duplicates pages at the binary stream level without rasterizing or recompressing text or images, maintaining 100% of the original vector quality."
      },
      {
        question: "Are my confidential PDF documents uploaded to your servers?",
        answer:
          "Never. GainUtility performs all PDF processing entirely inside your browser using client-side WebAssembly and JavaScript. No files or contents ever leave your device."
      },
      {
        question: "Can I extract just a single page from a large PDF?",
        answer:
          "Yes. Simply click the page thumbnail in Extract mode or type the page number (e.g., 4) in Range mode to download a clean, standalone one-page PDF."
      }
    ],
    related: ["merge-pdf", "compress-images-inside-pdf", "rotate-pdf", "pdf-to-jpg"],
    privacyExplanation: PDF_LOCAL,
    limitations: [
      "Password-protected (encrypted) PDFs must be unlocked before splitting.",
      "Browser memory limits apply for very large files containing thousands of pages on low-memory mobile devices."
    ]
  },
  "rotate-pdf": {
    title: "Rotate PDF Pages — Turn Pages Permanently",
    description:
      "Rotate single pages or an entire PDF by 90°, 180°, or 270° with a live preview. Save the corrected file — processed locally, free.",
    intro:
      "Fix sideways scans in seconds. Rotate any page with a visual preview and export a PDF where every page faces the right way.",
    steps: [
      "Upload the PDF with wrongly oriented pages.",
      "Select a single page or all pages in the preview grid.",
      "Apply a 90°, 180°, or 270° rotation as needed.",
      "Save and download the corrected document."
    ],
    faqs: [
      {
        question: "How do I rotate just one page in a PDF?",
        answer:
          "Upload the PDF, select the specific page thumbnail, and apply the rotation. Other pages keep their original orientation."
      },
      {
        question: "Can I rotate all pages at once?",
        answer: "Yes. Apply the rotation to the whole document in one action instead of page by page."
      },
      {
        question: "Is the rotation permanent after download?",
        answer: "Yes. The downloaded PDF stores the new rotation permanently — it displays correctly in every viewer."
      },
      {
        question: "Does rotating require uploading my document?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["rearrange-pdf", "crop-pdf", "delete-pdf", "merge-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter – Convert Images to PDF | GainUtility",
    description:
      "Turn JPG, JPEG, or PNG images into a clean multi-page PDF. Control page size, orientation, and margins — converted privately in your browser.",
    intro:
      "Add photos or scans in any order, choose A4/Letter or auto-sized pages, and convert them into one polished PDF. Nothing is uploaded anywhere.",
    steps: [
      "Upload one or more JPG or PNG images, or drag them into the tool.",
      "Arrange the images into the exact page order you want.",
      "Pick a page size (A4, Letter, or fit-to-image), orientation, and margin.",
      "Convert and download your finished PDF."
    ],
    whatText:
      "This converter builds a real PDF document from your images. Each picture becomes a full page, and you control page geometry: standard sizes like A4 or Letter, portrait or landscape orientation, and optional margins around each image.",
    whyText:
      "Sending dozens of photos as attachments is messy and often blocked by mail providers. A single PDF keeps pages in order, prints predictably, and opens everywhere — which is why converting images to PDF is standard practice for receipts, assignments, scanned notes, and photo submissions.",
    features: [
      "JPG, JPEG, and PNG input with multi-file batching",
      "Reorder images before converting with simple move controls",
      "A4, Letter, or automatic page sizing with portrait/landscape options",
      "Optional margins around each page",
      "Instant local conversion — no queue, no upload"
    ],
    faqs: [
      {
        question: "How do I convert an image to PDF?",
        answer:
          "Add your image (or many images) to the list, set the page size and margins if needed, then click Convert. The finished PDF downloads immediately."
      },
      {
        question: "Can I convert multiple images into one PDF?",
        answer: "Yes. Every image you add becomes one page of the same PDF, in the order you arrange them."
      },
      {
        question: "Which image formats can I turn into a PDF?",
        answer:
          "JPG/JPEG and PNG files are supported — the two formats most cameras, phones, and screenshot tools produce."
      },
      {
        question: "Is the image-to-PDF converter free?",
        answer:
          "Yes, it is completely free with no sign-up, watermark, or page-count limits, because processing happens on your own device."
      },
      {
        question: "Are my photos uploaded to a server?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["image-converter", "pdf-to-jpg", "reduce-pdf-image-quality", "merge-pdf", "text-to-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter — Convert Pages to JPG | GainUtility",
    description:
      "Render every PDF page as a high-quality JPG image right in your browser. Pick resolution and pages, then download the results.",
    intro:
      "Choose the pages you need, select an output resolution, and export each page as a crisp JPG — all rendered locally on your device.",
    whyText:
      "PDF pages become far easier to embed as JPG images in slide decks, social posts, landing pages, and documentation, or to share a snapshot of a document without handing over the full file. JPG output is compact and opens everywhere.",
    features: [
      "Every page rendered as a high-quality JPG on your device",
      "Export the whole document or just the pages you need",
      "Adjustable output scale for screen or print sharpness",
      "No upload — the PDF never leaves your browser"
    ],
    steps: [
      "Upload the PDF whose pages you want as images.",
      "Select the pages to export and an output scale.",
      "Render — each page is rasterized on your device.",
      "Download the JPG files."
    ],
    faqs: [
      {
        question: "How do I turn a PDF into JPG images?",
        answer:
          "Open your PDF in the tool, choose which pages to export and the image scale, then render. Each selected page becomes a downloadable JPG."
      },
      {
        question: "What resolution are the exported images?",
        answer:
          "You control the scale factor — higher scales produce larger, sharper images suitable for printing; lower scales produce smaller files for screens."
      },
      {
        question: "Can I export only some pages?",
        answer: "Yes. Select individual pages before rendering; only those become images."
      },
      {
        question: "Why does rendering take a moment on big PDFs?",
        answer:
          "Pages are rasterized on your device rather than on a server, so long documents take proportionally longer — but your file stays private."
      }
    ],
    related: ["jpg-to-pdf", "compress-images-inside-pdf", "pdf-to-text", "pdf-to-word", "image-converter"],
    privacyExplanation: PDF_LOCAL
  },
  "extract-pdf": {
    title: "Extract PDF Pages — Pull Pages Into a New PDF",
    description:
      "Visually select pages from any PDF and save them as a new document. Fast, precise extraction that runs entirely inside your browser.",
    intro:
      "See every page as a thumbnail, tick the ones you want, and build a clean new PDF from just that selection.",
    steps: [
      "Upload the PDF you want to pull pages from.",
      "Review the page thumbnails and click the ones you want to keep.",
      "Export the selection to generate the new document.",
      "Download the extracted PDF."
    ],
    faqs: [
      {
        question: "How do I extract certain pages from a PDF?",
        answer:
          "Load the file, click the page thumbnails you want to keep, and export. A new PDF containing only those pages is generated locally."
      },
      {
        question: "Can I extract non-consecutive pages?",
        answer: "Yes — pick any combination, such as pages 2, 5, and 9, in whatever order suits you."
      },
      {
        question: "What is the difference between Extract and Split?",
        answer:
          "Extract builds one PDF from pages you hand-pick visually; Split cuts ranges mechanically. Use whichever matches the job."
      },
      {
        question: "Is extracted content altered?",
        answer: "No. Pages are copied as-is, keeping original formatting, fonts, and image quality."
      }
    ],
    related: ["delete-pdf", "split-pdf", "rearrange-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "delete-pdf": {
    title: "Delete PDF Pages — Remove Pages From a PDF",
    description:
      "Select unwanted pages on a visual grid and remove them from your PDF instantly. Get a cleaned-up file without installing anything.",
    intro:
      "Preview every page, mark the ones to discard, and download the trimmed document — useful for dropping blanks, ads, or sensitive pages.",
    steps: [
      "Upload the PDF that needs trimming.",
      "Click the thumbnails of the pages you want to remove.",
      "Confirm the deletion to rebuild the document without them.",
      "Download the cleaned-up PDF."
    ],
    faqs: [
      {
        question: "How do I remove pages from a PDF?",
        answer:
          "Upload the file, click the thumbnails of the pages you want gone, and delete them. The remaining document downloads immediately."
      },
      {
        question: "Can I delete multiple pages at once?",
        answer: "Yes — select as many pages as you like across the document and remove them in one pass."
      },
      {
        question: "Will the rest of my PDF change?",
        answer: "No. Surviving pages stay untouched; only the deleted pages disappear."
      },
      {
        question: "Where does deletion happen?",
        answer: "Entirely in your browser. " + PDF_LOCAL
      }
    ],
    related: ["remove-blank-pages-pdf", "extract-pdf", "duplicate-page-finder-pdf", "split-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "rearrange-pdf": {
    title: "Rearrange PDF Pages — Reorder Pages Visually",
    description:
      "Reorder PDF pages with move controls and live thumbnails. Fix page order in seconds and download the corrected document — free and local.",
    intro:
      "Straighten mixed-up scans here: view every page, shuffle them into place, and export the reordered PDF.",
    steps: [
      "Upload the PDF with pages in the wrong order.",
      "Use the move controls on the page thumbnails to reposition pages.",
      "Check the live preview until the sequence reads correctly.",
      "Save and download the reordered document."
    ],
    faqs: [
      {
        question: "How do I change the order of pages in a PDF?",
        answer:
          "Open the PDF, use the move controls on each page thumbnail until the sequence is right, then save the rearranged file."
      },
      {
        question: "Can I reverse an entire document?",
        answer: "Yes — or jump to Reverse Page Order for a one-click full reversal of every page."
      },
      {
        question: "Does reordering affect quality?",
        answer: "No. Pages are moved, not re-rendered, so quality is untouched."
      },
      {
        question: "Do my pages leave the device during sorting?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["rotate-pdf", "reverse-page-order-pdf", "extract-pdf", "merge-pdf"],
    privacyExplanation: PDF_LOCAL
  },

  // ----------------------------------------------------------------
  // Security
  // ----------------------------------------------------------------
  "protect-pdf": {
    title: "Password Protect a PDF — Add a Password to PDF",
    description:
      "Encrypt any PDF with a password directly in your browser. Set an open password and permission locks — the file never leaves your device.",
    intro:
      "Choose a strong password and encrypt your document before sharing. Encryption runs locally, so the file and the password stay with you.",
    steps: [
      "Upload the PDF you want to protect.",
      "Enter a strong open password and, if needed, permission restrictions.",
      "Apply encryption — everything happens in your browser.",
      "Download the password-protected file."
    ],
    faqs: [
      {
        question: "How do I put a password on a PDF?",
        answer:
          "Upload the PDF, type your chosen password, and apply encryption. Download the locked file — it will ask for the password whenever it is opened."
      },
      {
        question: "Can I stop people from copying or printing my PDF?",
        answer:
          "Besides the open password you can apply owner permissions that restrict actions like copying text or printing in compliant readers."
      },
      {
        question: "What if I forget the password?",
        answer: "It cannot be recovered from the encrypted file — store it safely before distributing the document."
      },
      {
        question: "Is my password sent to your servers?",
        answer: "No. " + PDF_LOCAL + " The password you type never leaves the page."
      }
    ],
    related: ["unlock-pdf", "remove-pdf-password", "add-pdf-watermark", "flatten-pdf"],
    privacyExplanation: PDF_LOCAL + " Passwords are applied in-memory and never transmitted.",
    limitations: ["Very old readers may not support newer encryption revisions; modern viewers handle the output fine."]
  },
  "unlock-pdf": {
    title: "Unlock PDF — Remove Printing & Copying Restrictions",
    description:
      "Opens freely but blocked from printing or copying? Strip owner-level permission restrictions from PDFs you own — decrypted locally, no password needed.",
    intro:
      "A PDF can open without a password and still refuse printing, copying, or page extraction. Unlock removes those owner restrictions so the file behaves like a normal, unrestricted document.",
    steps: [
      "Upload the restricted PDF you own.",
      "The tool decrypts it using the file's empty open password.",
      "Owner-level permission checks are dropped from the saved copy.",
      "Download the unrestricted PDF.",
    ],
    faqs: [
      {
        question: "What does Unlock PDF actually remove?",
        answer:
          "Owner restrictions — the permission limits on printing, copying, and extracting pages. Files that already open freely are decrypted to a copy with no permission checks left.",
      },
      {
        question: "My file asks for a password to open — will this work?",
        answer:
          "No. An open password can't be bypassed in the browser. If you know the password, use Remove PDF Password, enter it once, and download a fully decrypted copy.",
      },
      {
        question: "Does unlocking change the document contents?",
        answer: "No. Text, layout, and images stay exactly as they were; only the permission restrictions disappear."
      },
      {
        question: "Where is decryption performed?",
        answer: "In your browser. " + PDF_LOCAL
      }
    ],
    related: ["remove-pdf-password", "protect-pdf", "flatten-pdf", "merge-pdf"],
    privacyExplanation: PDF_LOCAL + " Decryption keys exist only in page memory."
  },
  "remove-pdf-password": {
    title: "Remove PDF Password — Save an Unprotected Copy",
    description:
      "Permanently strip password protection from PDFs you're authorized to open. Provide the password once and save a copy that never asks again.",
    intro:
      "Tired of retyping a password for a file you use daily? Decrypt once and keep the open version for your records.",
    steps: [
      "Upload the protected PDF.",
      "Provide its current password so the tool can decrypt it.",
      "Generate the unprotected copy in your browser.",
      "Download and store the new copy safely."
    ],
    faqs: [
      {
        question: "What does removing a PDF password do?",
        answer:
          "It produces a saved copy that opens without any password. The tool verifies you know the current password before decrypting."
      },
      {
        question: "Do I need the original password?",
        answer: "Yes — removing encryption requires decrypting the file, which needs the existing password."
      },
      {
        question: "Will the unprotected copy still have restrictions?",
        answer: "Owner-level restrictions tied to the encryption are lifted along with the open password."
      },
      {
        question: "Where should I store the decrypted copy?",
        answer:
          "Somewhere as safe as the original deserved — an unprotected copy is only as secure as the place you keep it."
      }
    ],
    related: ["unlock-pdf", "protect-pdf", "remove-pdf-metadata", "flatten-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "add-pdf-watermark": {
    title: "Add Watermark to PDF — Stamp Text on PDF Pages",
    description:
      "Overlay custom text watermarks on every PDF page with position, opacity, and angle controls. Applied offline in your browser, free.",
    intro:
      "Brand drafts as DRAFT, CONFIDENTIAL, or with your company name. Adjust size, color, rotation, and transparency, then export the stamped PDF.",
    steps: [
      "Upload the document to stamp.",
      "Type your watermark text and adjust size, angle, color, and opacity.",
      "Preview the placement on the page preview.",
      "Apply the watermark and download the stamped PDF."
    ],
    faqs: [
      {
        question: "How do I add a watermark to a PDF?",
        answer:
          "Upload the document, type your watermark text, adjust style settings such as angle and opacity, and generate the marked-up PDF."
      },
      {
        question: "Does the watermark repeat on all pages?",
        answer: "Yes. The stamp repeats on every page at identical placement."
      },
      {
        question: "Will the watermark hide my text?",
        answer: "You control opacity so page content stays readable beneath the semi-transparent stamp."
      },
      {
        question: "Is watermarking done on a server?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["add-pdf-header-footer", "add-pdf-page-numbers", "flatten-pdf", "protect-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "flatten-pdf": {
    title: "Flatten PDF — Merge Form Fields & Annotations",
    description:
      "Flatten fillable forms and annotations into fixed page content so fields cannot be edited. One click, processed locally, free.",
    intro:
      "Turn interactive form fields and annotation marks into permanent page ink. Ideal before sending signed forms so values cannot be altered.",
    steps: [
      "Upload the fillable form or annotated PDF.",
      "Start flattening to bake fields and annotations into page content.",
      "Verify the flattened preview looks identical to the filled form.",
      "Download the flattened file."
    ],
    faqs: [
      {
        question: "What does flattening a PDF do?",
        answer:
          "It bakes form-field values and annotations into the page itself. The content looks identical but is no longer editable field data."
      },
      {
        question: "Why flatten before emailing a form?",
        answer:
          "Flattened files show the same filled values in every viewer and prevent accidental or intentional edits to field contents."
      },
      {
        question: "Can flattening be undone?",
        answer: "No — flattening is destructive by design. Keep the original interactive file if you may need it later."
      },
      {
        question: "Where does the flattened file get created?",
        answer: "Locally. " + PDF_LOCAL
      }
    ],
    related: ["signature-maker", "protect-pdf", "add-pdf-watermark", "validate-pdf"],
    privacyExplanation: PDF_LOCAL
  },

  // ----------------------------------------------------------------
  // Stamps & layout
  // ----------------------------------------------------------------
  "add-pdf-page-numbers": {
    title: "Add Page Numbers to PDF — Stamp Page Numbers",
    description:
      "Insert page numbers into any PDF with style, position, and starting-number options. Batch-stamped locally in your browser in seconds.",
    intro:
      "Give contracts, reports, and portfolios professional pagination. Pick placement and format — numbers are stamped onto every page.",
    steps: [
      "Upload the PDF that needs pagination.",
      "Choose a numbering style, position, and starting number.",
      "Apply to stamp the numbers onto every page.",
      "Download the numbered document."
    ],
    faqs: [
      {
        question: "How do I add page numbers to a PDF?",
        answer:
          "Upload the file, choose a numbering style and position, and apply. The numbered PDF downloads immediately."
      },
      {
        question: "Can numbering start from a number other than 1?",
        answer: "Yes — useful when appending to documents that are already partially numbered."
      },
      {
        question: "Which positions are available?",
        answer: "Corner and center placements along the bottom or top of each page, consistent across the document."
      },
      {
        question: "Will numbers overlap my content?",
        answer: "Numbers sit near the page edge with small offsets, clear of typical content areas."
      }
    ],
    related: ["add-pdf-header-footer", "add-pdf-watermark", "merge-pdf", "rearrange-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "add-pdf-header-footer": {
    title: "Add Header & Footer to PDF — Stamp Running Text",
    description:
      "Stamp recurring headers and footers — titles, dates, author names, disclaimers — onto every PDF page. Local, free, instant.",
    intro:
      "Put consistent running text at the top or bottom of a document: report titles, confidentiality notices, version tags, or dates.",
    steps: [
      "Upload your PDF.",
      "Enter the header and/or footer text you want on every page.",
      "Choose top or bottom placement for each.",
      "Apply and download the stamped copy."
    ],
    faqs: [
      {
        question: "How do I add a header or footer to every page?",
        answer:
          "Upload the PDF, type the header and/or footer text, choose placement, and apply. Every page receives the same running text."
      },
      {
        question: "Can I combine this with page numbers?",
        answer:
          "Yes — use Add Page Numbers for numeric pagination and this tool for textual headers/footers, in either order."
      },
      {
        question: "Will the footer overwrite existing page furniture?",
        answer: "Text is drawn near the page edge; check a dense page after applying if your layout already uses that area."
      },
      {
        question: "Does this modify my original file?",
        answer: "Never. A new stamped copy is generated; your original stays untouched."
      }
    ],
    related: ["add-pdf-page-numbers", "add-pdf-watermark", "protect-pdf", "rotate-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "crop-pdf": {
    title: "Crop PDF Pages — Trim Margins Visually",
    description:
      "Crop white space and margins from PDF pages with visual controls. Tighten page geometry without touching content — processed in-browser.",
    intro:
      "Shrink wide margins or trim scanner borders. Adjust crop bounds visually and export a cleanly cropped PDF.",
    steps: [
      "Upload the PDF with wide margins or scanner borders.",
      "Set the crop insets visually or enter exact values.",
      "Apply the crop to all pages (or a chosen selection).",
      "Export and download the cropped document."
    ],
    faqs: [
      {
        question: "How do I crop margins off a PDF?",
        answer:
          "Upload the file, set the crop insets visually or numerically, apply to all pages, and download the cropped result."
      },
      {
        question: "Does cropping delete content?",
        answer:
          "Cropping adjusts the visible page box; anything outside the crop area is hidden from view and print rather than erased."
      },
      {
        question: "When is cropping a PDF useful?",
        answer:
          "Removing scanner borders, trimming slide printouts, or tightening book scans surrounded by dark edges."
      },
      {
        question: "Can I preview before saving?",
        answer: "Yes — the crop bounds are shown against the page so you can verify before exporting."
      }
    ],
    related: ["rotate-pdf", "rearrange-pdf", "compress-images-inside-pdf", "extract-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "duplicate-page-finder-pdf": {
    title: "Find Duplicate Pages in a PDF — Scan for Copies",
    description:
      "Scan a PDF for identical duplicate pages automatically, then review flagged copies before removing them. Runs privately in your browser.",
    intro:
      "Long scans often contain repeated sheets. This tool compares pages and highlights likely duplicates so you can clean up confidently.",
    steps: [
      "Upload the PDF you suspect contains repeated sheets.",
      "Run the scan — pages are compared locally in your browser.",
      "Review the flagged duplicate pairs.",
      "Remove confirmed duplicates with the Remove Pages from PDF tool."
    ],
    faqs: [
      {
        question: "How do I find duplicate pages in a PDF?",
        answer:
          "Upload the document and run the scan. Pages with identical content are flagged so you can review and remove them."
      },
      {
        question: "Are near-identical pages detected too?",
        answer:
          "Detection targets pages whose rendered content matches; slightly different scans may not be flagged, so give results a quick review."
      },
      {
        question: "Does the scan upload my document?",
        answer: "No. " + PDF_LOCAL
      },
      {
        question: "How do I remove duplicates after finding them?",
        answer: "Note the flagged page numbers, then use Remove Pages from PDF to remove them in one pass."
      }
    ],
    related: ["delete-pdf", "remove-blank-pages-pdf", "compare-two-pdfs", "extract-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "remove-blank-pages-pdf": {
    title: "Remove Blank Pages From PDF — Auto-Clean Scans",
    description:
      "Automatically detect and delete blank pages from PDFs and scans. Download a tighter document — analyzed locally, free, no sign-up.",
    intro:
      "Scanners love inserting empty sheets. Let the analyzer find truly blank pages and strip them while keeping all real content intact.",
    steps: [
      "Upload the scanned PDF with blank pages.",
      "Start the blank-page analysis.",
      "Review which pages were detected as empty.",
      "Download the cleaned document."
    ],
    faqs: [
      {
        question: "How do I delete blank pages from a PDF?",
        answer:
          "Upload the file and start the scan. Blank pages are identified automatically and removed from the output copy."
      },
      {
        question: "Will pages with tiny marks be deleted?",
        answer:
          "Only effectively-empty pages are removed. Faint scan noise near the threshold may be kept — review the result to confirm nothing important vanished."
      },
      {
        question: "Why do scanned documents have blank pages?",
        answer:
          "Duplex scanners, double-feeds, and section dividers commonly insert empty sheets during batch scanning."
      },
      {
        question: "Is analysis performed on a server?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["duplicate-page-finder-pdf", "delete-pdf", "compress-images-inside-pdf", "split-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "reverse-page-order-pdf": {
    title: "Reverse PDF Page Order — Flip Document Backwards",
    description:
      "Flip the entire page sequence of any PDF from last to first in one click. Perfect for backwards-scanned documents — local and instant.",
    intro:
      "Scanners sometimes output stacks bottom-up. Reverse the whole document at once instead of dragging pages manually.",
    steps: [
      "Upload the backwards-ordered PDF.",
      "Apply the full reversal — last page becomes first.",
      "Check the preview shows natural reading order.",
      "Download the corrected document."
    ],
    faqs: [
      {
        question: "How do I reverse the page order of a PDF?",
        answer: "Upload the file and apply the reversal. Every page flips position — last becomes first — and you download the fixed copy."
      },
      {
        question: "Why are my scanned pages in reverse order?",
        answer:
          "Feeding a stack face-up instead of face-down produces a mirrored sequence; reversing restores reading order instantly."
      },
      {
        question: "Does reversing alter page content?",
        answer: "No. Only the sequence changes — page contents remain identical."
      },
      {
        question: "Can I reverse only a section of pages?",
        answer: "For partial reordering use Rearrange PDF, which lets you move individual pages freely."
      }
    ],
    related: ["rearrange-pdf", "rotate-pdf", "extract-odd-pages-pdf", "extract-even-pages-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "extract-odd-pages-pdf": {
    title: "Extract Odd Pages From PDF — Keep 1st, 3rd, 5th…",
    description:
      "Pull every odd-numbered page out of a PDF into its own document with one click. Handy for double-sided scans — free and browser-based.",
    intro:
      "Splitting a double-sided scan? Extract odd pages (1, 3, 5…) into one file, then grab evens separately and interleave as needed.",
    steps: [
      "Upload the duplex-scanned PDF.",
      "Choose odd-page extraction (pages 1, 3, 5…).",
      "Generate the new single-sided file locally.",
      "Download the extracted pages."
    ],
    faqs: [
      {
        question: "How do I extract only odd pages from a PDF?",
        answer:
          "Upload the PDF and choose odd-page extraction. A new PDF containing pages 1, 3, 5, and onward downloads immediately."
      },
      {
        question: "Why would I extract odd pages?",
        answer:
          "Commonly used when unscanning duplex stacks: odd pages form the front side, even pages the back side of each sheet."
      },
      {
        question: "Does extraction change the pages themselves?",
        answer: "No. Selected pages are copied unchanged into the new file."
      },
      {
        question: "Can I extract even pages too?",
        answer: "Yes — pair this with Extract Even Pages to get both halves of a duplex scan."
      }
    ],
    related: ["extract-even-pages-pdf", "merge-pdf", "rearrange-pdf", "split-pdf"],
    privacyExplanation: PDF_LOCAL
  },
  "extract-even-pages-pdf": {
    title: "Extract Even Pages From PDF — Keep 2nd, 4th, 6th…",
    description:
      "Pull every even-numbered page out of a PDF into a separate document instantly. Ideal companion for duplex-scan cleanup — private and free.",
    intro:
      "Grab pages 2, 4, 6… into their own file. Pair with odd-page extraction to rebuild single-sided versions of double-sided scans.",
    steps: [
      "Upload the duplex-scanned PDF.",
      "Choose even-page extraction (pages 2, 4, 6…).",
      "Generate the new file locally in your browser.",
      "Download the extracted pages."
    ],
    faqs: [
      {
        question: "How do I extract only even pages from a PDF?",
        answer:
          "Upload the PDF and choose even-page extraction. Pages 2, 4, 6, and onward are copied into a fresh downloadable PDF."
      },
      {
        question: "What is this typically used for?",
        answer:
          "Reversing duplex scans: extract evens, optionally reverse them, merge with odds, and recreate a natural single-sided flow."
      },
      {
        question: "Are the extracted pages modified?",
        answer: "No. They are copied as-is, preserving formatting and quality."
      },
      {
        question: "Does my file get uploaded anywhere?",
        answer: "No. " + PDF_LOCAL
      }
    ],
    related: ["extract-odd-pages-pdf", "reverse-page-order-pdf", "merge-pdf", "split-pdf"],
    privacyExplanation: PDF_LOCAL
  }
};
