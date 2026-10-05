import React from "react";
import { ArrowLeftRight, ListOrdered, Combine, Grid3X3 } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import { baseName, parsePageRanges } from "./helpers";
import { PDFDocument } from "@cantoo/pdf-lib";

const loadCopyable = async (file: File) => {
  try {
    return await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  } catch {
    throw new Error(
      `“${file.name}” could not be parsed. If it's password-protected, run Unlock PDF on it first.`
    );
  }
};

/* ============================ REVERSE PAGE ORDER =========================== */

export const ReversePageOrderPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
      <AdvancedPdfToolPage
        toolId="reverse-page-order-pdf"
        title="Reverse Page Order"
        desc="Flip the entire page sequence of a PDF so the last page becomes the first — useful for scanned documents fed backwards."
        supportedFormats=".pdf"
        maxSizeStr="200 MB"
        accept=".pdf"
        icon={<ArrowLeftRight className="h-6 w-6" />}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[]) => {
      const src = await loadCopyable(file);
      const out = await PDFDocument.create();
      const indices = src.getPageIndices().reverse();
      const copied = await out.copyPages(src, indices);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-reversed.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Does quality degrade?",
        acceptedAnswer: "No — pages are moved as-is between documents without re-encoding anything.",
      },
    ]}
  />
);

/* ========================== EXTRACT ODD/EVEN PAGES ========================= */

const oddEvenTool = (
  which: "odd" | "even",
  icon: React.ReactNode
) =>
  function ExtractOddEven({ onAddToast, onChangeView }: any) {
    return (
      <AdvancedPdfToolPage
        toolId={`extract-${which}-pages-pdf`}
        title={which === "odd" ? "Extract Odd Pages" : "Extract Even Pages"}
        desc={
          which === "odd"
            ? "Pull every odd-numbered page (1, 3, 5 …) into a separate PDF."
            : "Pull every even-numbered page (2, 4, 6 …) into a separate PDF."
        }
        supportedFormats=".pdf"
        maxSizeStr="200 MB"
        accept=".pdf"
        icon={icon}
        onAddToast={onAddToast}
        processFiles={async ([file]: File[]) => {
          const src = await loadCopyable(file);
          const wanted = src
            .getPageIndices()
            .filter((i) => (which === "odd" ? i % 2 === 0 : i % 2 === 1));
          if (wanted.length === 0)
            throw new Error(
              which === "odd"
                ? "This document has no odd pages (it may be a single even page?)."
                : "This document has no even-numbered pages."
            );
          const out = await PDFDocument.create();
          const copied = await out.copyPages(src, wanted);
          copied.forEach((p) => out.addPage(p));
          const bytes = await out.save();
          const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
          return {
            blob,
            name: `${baseName(file.name)}-${which}-pages.pdf`,
            beforeSize: file.size,
            afterSize: blob.size,
          };
        }}
        faqs={[
          {
            question: "Why would I split odd/even?",
            acceptedAnswer:
              "Double-sided scans are often fed through a sheet-fed scanner twice — odds first, then evens flipped. This tool recombines or isolates either half.",
          },
        ]}
      />
    );
  };

export const ExtractOddPagesPdf = oddEvenTool(
  "odd",
  <ListOrdered className="h-6 w-6" />
);

export const ExtractEvenPagesPdf = oddEvenTool(
  "even",
  <ListOrdered className="h-6 w-6 rotate-180" />
);

/* ======================= MERGE SELECTED PAGE RANGES ======================== */

export const MergeSelectedPageRanges: React.FC<any> = ({ onAddToast, onChangeView }) => (
      <AdvancedPdfToolPage
        toolId="merge-selected-page-ranges"
        title="Merge Selected Pages"
    desc="Combine several PDFs while taking only chosen page ranges from each — e.g. take pages 1-2 of every chapter file."
    supportedFormats=".pdf"
    maxSizeStr="200 MB each"
    accept=".pdf"
    multiple
    icon={<Combine className="h-6 w-6" />}
    defaultOptions={{ ranges: "1-" }}
    optionsPanel={({ options, setOptions }) => (
      <label className="block text-sm text-slate-700 dark:text-slate-200">
        Page ranges to take from <em>each</em> file
        <input
          type="text"
          value={options.ranges}
          placeholder="e.g. 1-3, 7"
          onChange={(e) => setOptions((o: any) => ({ ...o, ranges: e.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          Applied independently to every uploaded document.
        </span>
      </label>
    )}
    processFiles={async (files: File[], options, setProgress) => {
      if (files.length < 2)
        throw new Error("Add at least two PDFs above to merge their selected pages.");
      const out = await PDFDocument.create();
      let totalTaken = 0;
      for (let fi = 0; fi < files.length; fi++) {
        setProgress(`Reading ${files[fi].name} (${fi + 1}/${files.length})…`);
        const src = await loadCopyable(files[fi]);
        const idx = parsePageRanges(options.ranges ?? "1-", src.getPageCount());
        const copied = await out.copyPages(src, idx);
        copied.forEach((p) => out.addPage(p));
        totalTaken += idx.length;
      }
      if (totalTaken === 0) throw new Error("The given ranges matched no pages.");
      const bytes = await out.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const beforeSize = files.reduce((a, f) => a + f.size, 0);
      return { blob, name: `merged-selection.pdf`, beforeSize, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Can different ranges be used per file?",
        acceptedAnswer:
          "Currently one range expression applies to every file (great for batch chapters). For fully custom ordering use the full Organize/Reorder tool.",
      },
    ]}
  />
);

/* ============================ SPLIT EVERY N PAGES ========================== */

export const SplitEveryNPages: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="split-every-n-pages"
    title="Split Every N Pages"
    desc="Cut a PDF into equal chunks of N pages each — delivered together in one ZIP archive."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<Grid3X3 className="h-6 w-6" />}
    defaultOptions={{ n: 1 }}
    optionsPanel={({ options, setOptions }) => (
      <label className="block text-sm text-slate-700 dark:text-slate-200">
        Pages per output file
        <input
          type="number"
          min={1}
          max={500}
          value={options.n}
          onChange={(e) => setOptions((o: any) => ({ ...o, n: Math.max(1, Number(e.target.value) || 1) }))}
          className="ml-3 w-24 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const n = Math.max(1, Number(options.n) || 1);
      const src = await loadCopyable(file);
      const count = src.getPageCount();
      const parts = Math.ceil(count / n);
      if (parts < 2) throw new Error(`The document has only ${count} page(s) — nothing to split at ${n}/file.`);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const base = baseName(file.name);
      for (let p = 0; p < parts; p++) {
        setProgress(`Building part ${p + 1} of ${parts}…`);
        const out = await PDFDocument.create();
        const idx = Array.from({ length: Math.min(n, count - p * n) }, (_, k) => p * n + k);
        const copied = await out.copyPages(src, idx);
        copied.forEach((pg) => out.addPage(pg));
        const bytes = await out.save();
        zip.file(`${base}-part${String(p + 1).padStart(2, "0")}.pdf`, bytes);
      }
      setProgress("Compressing ZIP…");
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${base}-parts.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How are the output files named?",
        acceptedAnswer:
          "Zero-padded sequential names like report-part01.pdf, report-part02.pdf so they sort correctly everywhere.",
      },
    ]}
  />
);
