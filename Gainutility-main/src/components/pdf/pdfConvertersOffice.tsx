import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  OFFICE_LIMITATIONS,
  baseName,
  escapeXml,
  extractPageLines,
  openWithPdfJs,
  parseCsv,
  sanitizeText,
  unescapeXmlEntities,
  wrapWithMetrics,
} from "./helpers";
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

/* ============================== PDF → WORD ================================ */

export const PdfToWord: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="pdf-to-word"
    title="PDF to Word"
    desc="Convert a PDF into an editable .docx document using its real embedded text — every extracted paragraph becomes editable text in Word."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<FileText className="h-6 w-6" />}
    limitations={OFFICE_LIMITATIONS}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      setProgress("Reading PDF structure…");
      const bytes = await file.arrayBuffer();
      const doc = await openWithPdfJs(bytes);
      const pageLines: string[][] = [];
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Extracting text from page ${i + 1} of ${doc.numPages}…`);
        pageLines.push(await extractPageLines(doc, i));
      }
      if (pageLines.every((l) => l.length === 0)) {
        throw new Error(
          "No selectable text found — this PDF is likely a scan. Use “OCR PDF” first, then convert its output."
        );
      }
      setProgress("Building Word document…");
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file(
        "[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`
      );
      zip.file(
        "_rels/.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
      );
      const word = zip.folder("word")!;
      word.file(
        "_rels/document.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
      );
      word.file(
        "styles.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`
      );
      let body = "";
      pageLines.forEach((lines, pi) => {
        body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="808080"/></w:rPr><w:t xml:space="preserve">— Page ${pi + 1} —</w:t></w:r></w:p>`;
        for (const line of lines) {
          body += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(sanitizeText(line))}</w:t></w:r></w:p>`;
        }
        if (pi < pageLines.length - 1) body += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
      });
      word.file(
        "document.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`
      );
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      return { blob, name: `${baseName(file.name)}.docx`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Will the layout match my original PDF exactly?",
        acceptedAnswer:
          "No converter can perfectly reverse-engineer layout from PDF's drawing instructions. This tool faithfully extracts every piece of embedded text as editable paragraphs in reading order, which covers most text-centric documents. Complex multi-column magazine layouts may need manual re-flowing.",
      },
      {
        question: "My PDF is a scan — why did conversion fail?",
        acceptedAnswer:
          "Scanned pages are photographs without embedded text. Run the OCR PDF tool first to generate a searchable text layer, then convert.",
      },
    ]}
  />
);

/* ============================== WORD → PDF ================================ */

export const WordToPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="word-to-pdf"
    title="Word to PDF"
    desc="Turn .docx documents or plain-text/Markdown files into clean, paginated PDFs — real text extraction with headings, wrapping and page breaks."
    supportedFormats=".docx, .txt, .md"
    maxSizeStr="20 MB"
    accept=".docx,.txt,.md"
    icon={<FileText className="h-6 w-6" />}
    limitations={[
      "Text content, paragraphs and heading levels are converted; embedded images, tables' visual styling and custom fonts are not reproduced.",
    ]}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[]) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let paragraphs: { text: string; level: number }[] = [];
      if (ext === "docx") {
        const JSZip = (await import("jszip")).default;
        let zip: any;
        try {
          zip = await JSZip.loadAsync(file);
        } catch {
          throw new Error("This file is not a valid .docx package. Re-save it from Word and try again.");
        }
        const docXml = await zip.file("word/document.xml")?.async("string");
        if (!docXml) throw new Error("No readable content found inside this .docx.");
        for (const paraRaw of docXml.split(/<\/w:p>/)) {
          const runs = [...paraRaw.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)].map((m) =>
            unescapeXmlEntities(m[1])
          );
          const text = runs.join("").replace(/\s+/g, " ").trim();
          if (!text) continue;
          const styleMatch = paraRaw.match(/w:pStyle[^>]*w:val="(Heading(\d)|Title)"/i);
          let level = 0;
          if (styleMatch) level = styleMatch[2] ? parseInt(styleMatch[2], 10) : 1;
          paragraphs.push({ text, level });
        }
      } else {
        const raw = await file.text();
        for (const line of raw.split(/\n/)) {
          const heading = line.match(/^(#{1,3})\s+(.*)$/);
          paragraphs.push({ text: heading ? heading[2] : line.replace(/\s+$/, ""), level: heading ? heading[1].length : 0 });
        }
      }
      paragraphs = paragraphs.filter((p) => p.text.trim() !== "");
      if (paragraphs.length === 0) throw new Error("The document appears to be empty.");

      const pdf = await PDFDocument.create();
      pdf.setTitle(baseName(file.name));
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const sizes = [24, 18, 15];
      const margin = 56;
      const width = 595.28;
      const height = 841.89;
      const maxWidth = width - margin * 2;
      let page = pdf.addPage([width, height]);
      let cursorY = height - margin;

      for (const para of paragraphs) {
        const size = para.level > 0 ? sizes[para.level - 1] : 11;
        const font = para.level > 0 ? boldFont : bodyFont;
        const lineHeight = size * 1.45;
        const lines = wrapWithMetrics(para.text, font, size, maxWidth);
        for (const line of lines) {
          if (cursorY - lineHeight < margin) {
            page = pdf.addPage([width, height]);
            cursorY = height - margin;
          }
          page.drawText(sanitizeText(line), { x: margin, y: cursorY - size, size, font, color: rgb(0.1, 0.12, 0.16) });
          cursorY -= lineHeight;
        }
        cursorY -= para.level > 0 ? size * 0.5 : 4;
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Does this keep images from my Word file?",
        acceptedAnswer: "Currently only text is converted, including headings and paragraphs. Image support in .docx→PDF conversion is planned.",
      },
      {
        question: "Why does an old .doc file fail?",
        acceptedAnswer: "Legacy binary .doc isn't a ZIP-based format. Open it in Word/LibreOffice and save as .docx first.",
      },
    ]}
  />
);
