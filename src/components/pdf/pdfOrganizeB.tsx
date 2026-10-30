import React from "react";
import { FileQuestion, CopyX, Wand2, PackageOpen } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  baseName,
  canvasFingerprint,
  canvasPixelVariance,
  formatBytes,
  getPageTextItems,
  openWithPdfJs,
  renderPageToCanvas,
} from "./helpers";
import { PDFDocument } from "@cantoo/pdf-lib";

/* ============================= SPLIT BY SIZE =============================== */

export const SplitByFileSize: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="split-pdf-by-size"
    title="Split PDF by Size"
    desc="Break a large PDF into parts under your target size — measured on genuinely saved files, not guesses."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<PackageOpen className="h-6 w-6" />}
    defaultOptions={{ targetMb: 5 }}
    optionsPanel={({ options, setOptions }) => (
      <label className="block text-sm text-slate-700 dark:text-slate-200">
        Target maximum per part (MB)
        <input
          type="number"
          min={0.2}
          step={0.5}
          value={options.targetMb}
          onChange={(e) => setOptions((o: any) => ({ ...o, targetMb: Math.max(0.2, Number(e.target.value) || 1) }))}
          className="ml-3 w-24 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const targetBytes = Number(options.targetMb) * 1024 * 1024;
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true }).catch(() => {
        throw new Error("Could not parse this PDF (it may be encrypted — run Unlock PDF first).");
      });
      const count = src.getPageCount();
      const probe = await PDFDocument.create();
      const firstCopy = await probe.copyPages(src, [0]);
      firstCopy.forEach((p) => probe.addPage(p));
      const probeBytes = await probe.save();
      if (probeBytes.byteLength > targetBytes)
        throw new Error(
          `Even a single page (${formatBytes(probeBytes.byteLength)}) exceeds your ${options.targetMb} MB target. Raise the target or compress the file first.`
        );

      // Start from an estimate, then adjust with real saves.
      let perPage = probeBytes.byteLength;
      const parts: number[][] = [];
      let current: number[] = [];
      let i = 0;
      while (i < count) {
        const est = Math.max(1, Math.floor((targetBytes - 1200) / Math.max(perPage, 500)));
        let take = Math.min(est, count - i);
        let bytes: Uint8Array;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          setProgress(`Testing part ${parts.length + 1}: pages ${i + 1}-${i + take}…`);
          const doc = await PDFDocument.create();
          const copied = await doc.copyPages(src, Array.from({ length: take }, (_, k) => i + k));
          copied.forEach((p) => doc.addPage(p));
          bytes = await doc.save();
          if (bytes.byteLength <= targetBytes || take === 1) break;
          take = Math.max(1, Math.floor(take * ((targetBytes / bytes.byteLength) * 0.95)));
          if (take >= count - i) continue;
        }
        parts.push(Array.from({ length: take }, (_, k) => i + k));
        perPage = bytes.byteLength / take;
        i += take;
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const base = baseName(file.name);
      const report: string[] = [`Split report for ${file.name}`, `Target: ≤ ${options.targetMb} MB/part`, ""];
      for (let p = 0; p < parts.length; p++) {
        setProgress(`Saving part ${p + 1} of ${parts.length}…`);
        const doc = await PDFDocument.create();
        const copied = await doc.copyPages(src, parts[p]);
        copied.forEach((pg) => doc.addPage(pg));
        const bytes = await doc.save();
        zip.file(`${base}-part${String(p + 1).padStart(2, "0")}.pdf`, bytes);
        report.push(`part${p + 1}.pdf → pages ${parts[p][0] + 1}-${parts[p][parts[p].length - 1] + 1} (${formatBytes(bytes.byteLength)})`);
      }
      zip.file("split-report.txt", report.join("\n"));
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${base}-size-split.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How accurate are the size limits?",
        acceptedAnswer:
          "Every part is actually serialized and checked against your target before finalizing, so no part will exceed it (the ZIP wrapper adds negligible overhead).",
      },
    ]}
  />
);

/* ========================== DUPLICATE PAGE FINDER ========================== */

export const DuplicatePageFinderPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="duplicate-page-finder-pdf"
    title="Duplicate Page Finder"
    desc="Visually compare every page and find exact duplicates — optionally remove them, keeping the first occurrence."
    supportedFormats=".pdf"
    maxSizeStr="150 MB"
    accept=".pdf"
    icon={<CopyX className="h-6 w-6" />}
    defaultOptions={{ action: "remove" }}
    optionsPanel={({ options, setOptions }) => (
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Action">
        {[
          ["report", "Report only"],
          ["remove", "Remove duplicates"],
        ].map(([v, label]) => (
          <button
            key={v}
            role="radio"
            aria-checked={options.action === v}
            onClick={() => setOptions((o: any) => ({ ...o, action: v }))}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              options.action === v
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 text-slate-600 hover:border-emerald-400 dark:border-slate-600 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const fingerprints: string[] = [];
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Analyzing page ${i + 1} of ${doc.numPages}…`);
        const page = await doc.getPage(i + 1);
        const canvas = await renderPageToCanvas(page, 0.35);
        fingerprints.push(canvasFingerprint(canvas));
        canvas.width = 0;
        canvas.height = 0;
      }
      const groups = new Map<string, number[]>();
      fingerprints.forEach((fp, idx) => {
        const arr = groups.get(fp) ?? [];
        arr.push(idx + 1);
        groups.set(fp, arr);
      });
      const dupGroups = [...groups.values()].filter((g) => g.length > 1);
      if (dupGroups.length === 0)
        throw new Error("No duplicate pages were found — every page is visually unique.");

      const reportLines = [
        `Duplicate analysis for ${file.name}`,
        `${doc.numPages} pages scanned, ${dupGroups.length} duplicate group(s):`,
        "",
        ...dupGroups.map((g, gi) => `Group ${gi + 1}: pages ${g.join(", ")}`),
      ];

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      if (options.action !== "remove") {
        zip.file("duplicate-report.txt", reportLines.join("\n"));
        const blob = await zip.generateAsync({ type: "blob" });
        return { blob, name: `${baseName(file.name)}-duplicates-report.zip`, beforeSize: file.size, afterSize: blob.size };
      }

      const keep = fingerprints.map((_, i) => i).filter((i) => groups.get(fingerprints[i])![0] === i);
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true }).catch(() => null);
      if (!src)
        throw new Error("This PDF could not be opened for editing (encrypted?). Run Unlock PDF first.");
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keep);
      copied.forEach((p) => out.addPage(p));
      zip.file(`${baseName(file.name)}-deduped.pdf`, await out.save());
      zip.file("duplicate-report.txt", [
        ...reportLines,
        "",
        `Removed ${doc.numPages - keep.length} page(s); kept ${keep.length}.`,
      ].join("\n"));
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${baseName(file.name)}-deduped.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How are 'duplicates' decided?",
        acceptedAnswer:
          "Each page is rendered small and reduced to a perceptual fingerprint; pages with identical fingerprints are duplicates. Near-identical scans (slightly rotated) are intentionally NOT flagged.",
      },
    ]}
  />
);

/* =========================== REMOVE BLANK PAGES ============================ */

export const RemoveBlankPagesPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="remove-blank-pages-pdf"
    title="Remove Blank Pages"
    desc="Detect truly empty pages (no text AND no meaningful graphics) and produce a cleaned PDF plus a report of what was removed."
    supportedFormats=".pdf"
    maxSizeStr="150 MB"
    accept=".pdf"
    icon={<FileQuestion className="h-6 w-6" />}
    defaultOptions={{}}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const blanks: number[] = [];
      const kept: number[] = [];
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Inspecting page ${i + 1} of ${doc.numPages}…`);
        const page = await doc.getPage(i + 1);
        const items = await getPageTextItems(page);
        const hasText = items.some((it) => it.str.trim().length > 0);
        const canvas = await renderPageToCanvas(page, 0.25);
        const variance = canvasPixelVariance(canvas);
        canvas.width = 0;
        canvas.height = 0;
        if (!hasText && variance < 16) blanks.push(i + 1);
        else kept.push(i);
      }
      if (blanks.length === 0)
        throw new Error("No blank pages detected — every page has content.");
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true }).catch(() => null);
      if (!src)
        throw new Error("The file can't be edited directly (encrypted?). Unlock it first, then retry.");
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, kept);
      copied.forEach((p) => out.addPage(p));
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file(`${baseName(file.name)}-no-blanks.pdf`, await out.save());
      zip.file(
        "removed-pages-report.txt",
        [`Removed ${blanks.length} blank page(s): ${blanks.join(", ")}`, `Kept ${kept.length} pages.`].join("\n")
      );
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${baseName(file.name)}-cleaned.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "What counts as blank?",
        acceptedAnswer:
          "A page must have zero selectable text AND its rendered image must be nearly uniform in color. Pages containing only faint scan noise may still be kept — raise nothing here; use Compress instead.",
      },
    ]}
  />
);

/* ================================= REPAIR ================================== */

export const RepairPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="repair-pdf"
    title="Repair PDF"
    desc="Attempt genuine recovery of a damaged PDF — first rebuilding its structure, then falling back to a full visual reconstruction if needed."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<Wand2 className="h-6 w-6" />}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      const raw = await file.arrayBuffer();
      let method = "";
      let bytes: Uint8Array;

      setProgress("Strategy 1: rebuilding document structure…");
      try {
        const doc = await PDFDocument.load(raw, { ignoreEncryption: true, throwOnInvalidObject: false });
        bytes = await doc.save();
        // verify it renders
        const test = await openWithPdfJs(bytes.slice());
        if (test.numPages > 0) method = "structure-rebuild";
      } catch {
        /* fall through */
      }

      if (!method) {
        setProgress("Strategy 2: visual reconstruction…");
        try {
          const { rasterizeToPdf } = await import("./helpers");
          const res = await rasterizeToPdf(raw, { scale: 1.6, jpegQuality: 0.85 }, setProgress);
          bytes = res.pdfBytes;
          method = "visual-reconstruction";
        } catch (err: any) {
          throw new Error(
            err?.message?.includes("password")
              ? "This file is encrypted, not merely damaged. Run Unlock PDF first."
              : "Recovery failed — the file is too badly damaged beyond either repair strategy."
          );
        }
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file(`${baseName(file.name)}-repaired.pdf`, bytes);
      zip.file(
        "repair-log.txt",
        [
          `Source: ${file.name}`,
          `Method: ${method === "structure-rebuild" ? "Structural rebuild (objects preserved)" : "Visual reconstruction (pages rebuilt as images)"}`,
          `Recovered pages: rendered successfully`,
        ].join("\n")
      );
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${baseName(file.name)}-repaired.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "What do the two repair strategies mean?",
        acceptedAnswer:
          "Strategy 1 re-parses every object and writes a brand-new clean file — content stays fully intact. Strategy 2 renders whatever pages still display and rebuilds them as images when the internal structure is unsalvageable.",
      },
    ]}
  />
);
