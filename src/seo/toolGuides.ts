import { ToolId } from "../types";

/**
 * How-to guides worth surfacing from a tool page (backlink campaign item
 * B-01: contextual tool → guide links for the new article cluster).
 *
 * Every entry must be an existing blog slug AND must be locale-gated by
 * `hasLocalizedArticle` before it renders, so a link never points at an
 * untranslated localized URL.
 */
export interface ToolGuide {
  /** Blog registry slug, e.g. "how-to-merge-pdf-files". */
  slug: string;
  title: string;
  desc: string;
}

export const TOOL_GUIDES: Partial<Record<ToolId, ToolGuide[]>> = {
  "pdf-to-word": [
    {
      slug: "how-to-convert-pdf-to-word",
      title: "How to convert a PDF to Word without losing the text",
      desc: "What converts cleanly, what you rebuild by hand, and when OCR has to come first.",
    },
    {
      slug: "how-to-convert-word-to-pdf",
      title: "How to convert a Word document to PDF",
      desc: "The three things to settle before converting, and the checks worth making after.",
    },
  ],
  "word-to-pdf": [
    {
      slug: "how-to-convert-word-to-pdf",
      title: "How to convert a Word document to PDF",
      desc: "Headings, lists, and tables carry over - macros and tracked changes do not.",
    },
    {
      slug: "how-to-convert-pdf-to-word",
      title: "How to convert a PDF to Word",
      desc: "For when the PDF you are about to create needs to come back editable later.",
    },
  ],
  "ocr-pdf": [
    {
      slug: "how-to-convert-pdf-to-word",
      title: "How to convert a PDF to Word",
      desc: "A scan has no text layer - run OCR first, then move the recognised text into Word.",
    },
    {
      slug: "are-online-pdf-tools-safe",
      title: "Are online PDF tools safe?",
      desc: "OCR on confidential scans: how to check whether a tool ever receives your file.",
    },
  ],
  "merge-pdf": [
    {
      slug: "how-to-merge-pdf-files",
      title: "How to merge multiple PDFs into one file",
      desc: "Order matters: lay out scans and exports before combining them.",
    },
    {
      slug: "are-online-pdf-tools-safe",
      title: "Are online PDF tools safe?",
      desc: "What happens to a document you upload, and how to check any tool yourself.",
    },
  ],
  "split-pdf": [
    {
      slug: "how-to-split-a-pdf",
      title: "How to split a PDF into separate files",
      desc: "Split by page range, by bookmark, or by scanning for blank pages first.",
    },
    {
      slug: "how-to-merge-pdf-files",
      title: "How to merge multiple PDFs into one file",
      desc: "The inverse operation, with the same ordering rules in reverse.",
    },
  ],
  "compress-images-inside-pdf": [
    {
      slug: "how-to-compress-a-pdf",
      title: "How to compress a PDF without ruining it",
      desc: "Where file size actually comes from, and which setting costs the most quality.",
    },
    {
      slug: "fix-pdf-too-big-to-upload",
      title: "Fix a PDF that is too big to upload",
      desc: "When a size limit is the blocker, this is the shortest route under it.",
    },
  ],
  "optimize-pdf-web": [
    {
      slug: "how-to-compress-a-pdf",
      title: "How to compress a PDF without ruining it",
      desc: "The same trade-off, aimed at page weight rather than an upload limit.",
    },
  ],
  "pdf-exact-size": [
    {
      slug: "fix-pdf-too-big-to-upload",
      title: "Fix a PDF that is too big to upload",
      desc: "Size caps for applications and portals, and how to get under them cleanly.",
    },
    {
      slug: "how-to-compress-a-pdf",
      title: "How to compress a PDF without ruining it",
      desc: "Reduce the file without re-encoding images you did not intend to touch.",
    },
  ],
  "jpg-to-pdf": [
    {
      slug: "how-to-convert-jpg-to-pdf",
      title: "How to convert JPG to PDF",
      desc: "Page size, orientation, and ordering - the three things that decide the result.",
    },
    {
      slug: "how-to-merge-pdf-files",
      title: "How to merge multiple PDFs into one file",
      desc: "Combine the PDF you just made with the rest of the document.",
    },
  ],
  "pdf-to-jpg": [
    {
      slug: "how-to-convert-pdf-to-jpg",
      title: "How to convert PDF to JPG",
      desc: "Choosing a resolution that is sharp enough without exploding the file size.",
    },
    {
      slug: "how-to-convert-jpg-to-pdf",
      title: "How to convert JPG to PDF",
      desc: "The reverse direction, when the images need to become a document again.",
    },
  ],
  "add-pdf-watermark": [
    {
      slug: "how-to-add-a-watermark-to-a-pdf",
      title: "How to add a watermark to a PDF",
      desc: "Opacity, placement, and when a diagonal watermark is the wrong choice.",
    },
    {
      slug: "are-online-pdf-tools-safe",
      title: "Are online PDF tools safe?",
      desc: "Watermarked drafts are still confidential - check where the file goes first.",
    },
  ],
  "protect-pdf": [
    {
      slug: "how-to-add-a-watermark-to-a-pdf",
      title: "How to add a watermark to a PDF",
      desc: "Visible marking for a draft that will circulate before it is locked down.",
    },
    {
      slug: "are-online-pdf-tools-safe",
      title: "Are online PDF tools safe?",
      desc: "Passwords are not protection if the file is uploaded first - read the fine print.",
    },
  ],
  "remove-pdf-metadata": [
    {
      slug: "are-online-pdf-tools-safe",
      title: "Are online PDF tools safe?",
      desc: "Metadata, author fields, and what is really attached to a file you share.",
    },
  ],
};
