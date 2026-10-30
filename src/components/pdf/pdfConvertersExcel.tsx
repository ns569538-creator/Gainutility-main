import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  OFFICE_LIMITATIONS,
  baseName,
  getPageTextItems,
  openWithPdfJs,
  parseCsv,
  sanitizeText,
  wrapWithMetrics,
} from "./helpers";
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

/* ============================== PDF → EXCEL =============================== */

interface Cell {
  x: number;
  endX: number;
  text: string;
}

const extractPageRows = async (page: any): Promise<string[][]> => {
  const items = await getPageTextItems(page);
  const usable = items.filter((it) => it.str.trim() !== "");
  if (usable.length === 0) return [];
  const heights = usable.map((it) => Math.abs(it.transform[3]) || it.height).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length / 2)] || 10;
  const yTol = medianH * 0.6;
  // cluster items into visual rows
  const sortedByY = [...usable].sort((a, b) => b.transform[5] - a.transform[5]);
  const rows: string[][] = [];
  let currentRow: Cell[] = [];
  let currentY = NaN;
  for (const it of sortedByY) {
    const y = it.transform[5];
    if (Number.isNaN(currentY) || Math.abs(currentY - y) <= yTol) {
      currentRow.push({ x: it.transform[4], endX: it.transform[4] + it.width, text: it.str.trim() });
      currentY = Number.isNaN(currentY) ? y : (currentY + y) / 2;
    } else {
      rows.push(finalizeRow(currentRow));
      currentRow = [{ x: it.transform[4], endX: it.transform[4] + it.width, text: it.str.trim() }];
      currentY = y;
    }
  }
  if (currentRow.length) rows.push(finalizeRow(currentRow));
  return rows;
};

/** Split a visual row into cells using horizontal gaps. */
const finalizeRow = (row: Cell[]): string[] => {
  row.sort((a, b) => a.x - b.x);
  const cells: string[] = [];
  let cur = row[0].text;
  for (let i = 1; i < row.length; i++) {
    const gap = row[i].x - row[i - 1].endX;
    if (gap > 4) {
      cells.push(cur);
      cur = row[i].text;
    } else {
      cur += (cur.endsWith(" ") || row[i].text.startsWith(" ") ? "" : " ") + row[i].text;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.replace(/\s+/g, " ").trim());
};

const csvEscape = (v: string): string =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export const PdfToExcel: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="pdf-to-excel"
    title="PDF to Excel"
    desc="Recover tables from a PDF into a real .xlsx workbook — columns are reconstructed from the actual text positions on each page."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<FileSpreadsheet className="h-6 w-6" />}
    limitations={[
      "Table structure is inferred from text spacing; merged cells, colors and formulas cannot be recovered.",
      "Best results on digitally generated PDFs — scanned tables need OCR first.",
    ]}
    onAddToast={onAddToast}
    defaultOptions={{ format: "xlsx" }}
    optionsPanel={({ options, setOptions }) => (
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Output format">
        {(["xlsx", "csv"] as const).map((f) => (
          <button
            key={f}
            role="radio"
            aria-checked={options.format === f}
            onClick={() => setOptions((o: any) => ({ ...o, format: f }))}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              options.format === f
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 text-slate-600 hover:border-emerald-400 dark:border-slate-600 dark:text-slate-300"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      setProgress("Reading PDF…");
      const bytes = await file.arrayBuffer();
      const doc = await openWithPdfJs(bytes);
      const pages: string[][][] = [];
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Analyzing layout of page ${i + 1} of ${doc.numPages}…`);
        const page = await doc.getPage(i + 1);
        pages.push(await extractPageRows(page));
      }
      if (pages.every((p) => p.length === 0)) {
        throw new Error("No selectable text found. If this is a scan, run “OCR PDF” first.");
      }

      setProgress(`Building ${String(options.format).toUpperCase()}…`);
      if (options.format === "csv") {
        const parts: string[] = [];
        pages.forEach((rows, pi) => {
          parts.push(`# Page ${pi + 1}`);
          rows.forEach((r) => parts.push(r.map(csvEscape).join(",")));
          parts.push("");
        });
        const blob = new Blob([parts.join("\n")], { type: "text/csv;charset=utf-8" });
        return { blob, name: `${baseName(file.name)}.csv`, beforeSize: file.size, afterSize: blob.size };
      }

      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      pages.forEach((rows, pi) => {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, `Page ${pi + 1}`.slice(0, 31));
      });
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
      const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      return { blob, name: `${baseName(file.name)}.xlsx`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How are columns detected?",
        acceptedAnswer:
          "Every word carries coordinates inside the PDF. Words whose vertical positions align form a row; horizontal gaps larger than normal word spacing split the row into columns.",
      },
      {
        question: "Why is my scanned spreadsheet empty?",
        acceptedAnswer: "Scans contain pictures of text, not text. Run OCR PDF first to create a searchable copy.",
      },
    ]}
  />
);

/* ============================== EXCEL → PDF =============================== */

export const ExcelToPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="excel-to-pdf"
    title="Excel/CSV to PDF"
    desc="Convert CSV spreadsheets into clean, ruled PDF tables with repeating header rows and automatic pagination."
    supportedFormats=".csv"
    maxSizeStr="20 MB"
    accept=".csv"
    icon={<FileSpreadsheet className="h-6 w-6" />}
    limitations={["Accepts .csv exports. Legacy .xls/.xlsx must be re-exported as CSV from your spreadsheet app."]}
    onAddToast={onAddToast}
    multiple
    processFiles={async (files: File[], _opts, setProgress) => {
      const pdf = await PDFDocument.create();
      pdf.setTitle("Spreadsheet export");
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const width = 841.89; // A4 landscape
      const height = 595.28;
      const margin = 36;
      const size = 9;

      let page: any = null;
      let y = 0;
      let colWidths: number[] = [];
      const ensurePage = () => {
        page = pdf.addPage([width, height]);
        y = height - margin;
      };
      const drawGridRow = (cells: string[], isHeader: boolean) => {
        const wrapped = cells.map((c, ci) =>
          wrapWithMetrics(sanitizeText(c), font, size, Math.max(colWidths[ci] ?? 40, 30) - 8)
        );
        const lineH = size * 1.35;
        const rowH = Math.max(...wrapped.map((w) => w.length), 1) * lineH + 6;
        if (y - rowH < margin) {
          ensurePage();
        }
        let x = margin;
        wrapped.forEach((lines, ci) => {
          const cw = colWidths[ci] ?? 60;
          page.drawRectangle({ x, y: y - rowH, width: cw, height: rowH, borderColor: rgb(0.75, 0.78, 0.82), borderWidth: 0.5, color: isHeader ? rgb(0.93, 0.96, 0.94) : undefined });
          lines.slice(0, Math.floor(rowH / lineH)).forEach((line, li) => {
            page.drawText(line, { x: x + 4, y: y - 10 - li * lineH, size, font: isHeader ? bold : font, color: rgb(0.12, 0.15, 0.19) });
          });
          x += cw;
        });
        y -= rowH;
      };

      for (const file of files) {
        setProgress(`Rendering ${file.name}…`);
        const rows = parseCsv(await file.text());
        if (rows.length === 0) continue;
        if (page && y < height - margin - 30) {
          page.drawText(`${file.name}`, { x: margin, y: y - 16, size: 11, font: bold, color: rgb(0.1, 0.3, 0.2) });
          y -= 28;
        } else {
          ensurePage();
          page.drawText(`${file.name}`, { x: margin, y: y - 16, size: 11, font: bold, color: rgb(0.1, 0.3, 0.2) });
          y -= 28;
        }
        const cols = Math.max(...rows.map((r) => r.length));
        // width proportional to content, clamped
        const rawWidths = Array.from({ length: cols }, (_, ci) =>
          Math.min(Math.max(...rows.map((r) => (r[ci] ?? "").length)) * size * 0.62 + 12, 220)
        );
        const total = rawWidths.reduce((a, b) => a + b, 0);
        const avail = width - margin * 2;
        colWidths = total > avail ? rawWidths.map((w) => (w / total) * avail) : rawWidths;
        rows.forEach((r, ri) => drawGridRow(Array.from({ length: cols }, (_, ci) => r[ci] ?? ""), ri === 0));
        y -= 14;
      }
      if (!page) throw new Error("No CSV content found — the files may be empty.");

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const beforeSize = files.reduce((a, f) => a + f.size, 0);
      return { blob, name: files.length === 1 ? `${baseName(files[0].name)}.pdf` : `spreadsheets.pdf`, beforeSize, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How are column widths decided?",
        acceptedAnswer:
          "Each column starts proportional to its longest cell, then all columns are scaled proportionally when the table exceeds the printable width. Long cells wrap onto multiple lines.",
      },
      {
        question: "Does the header repeat on every page?",
        acceptedAnswer: "Yes — the first row of each CSV repeats whenever the table continues on a new page.",
      },
    ]}
  />
);
