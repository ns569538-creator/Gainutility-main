import React from "react";
import { Gauge, ImageMinus, FileSearch, GitCompare } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  baseName,
  canvasToJpegBytes,
  diffWordLists,
  escapeXml,
  extractPageLines,
  openWithPdfJs,
  rasterizeToPdf,
  renderPageToCanvas,
} from "./helpers";
import { PDFDocument, rgb } from "@cantoo/pdf-lib";

/* =============================== VALIDATE PDF ============================== */

export const ValidatePdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="validate-pdf"
    title="Validate PDF"
    desc="Run a structural health-check on a PDF: parse integrity, page renderability, encryption status, text layer presence — with an actionable report."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<FileSearch className="h-6 w-6" />}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[]) => {
      const checks: string[] = [];
      let passCount = 0;
      let totalChecks = 0;
      const check = (name: string, ok: boolean, detail: string) => {
        checks.push(`${ok ? "[PASS]" : "[FAIL]"} ${name}${detail ? ` — ${detail}` : ""}`);
        totalChecks++;
        if (ok) passCount++;
      };

      let libDoc: any = null;
      try {
        libDoc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, throwOnInvalidObject: false });
        check("Structural parse", true, `${libDoc.getPageCount()} pages found`);
      } catch (e: any) {
        check("Structural parse", false, e?.message ?? "unparseable");
      }

      let jsDoc: any = null;
      try {
        jsDoc = await openWithPdfJs(await file.arrayBuffer());
        check("Renderer open", true, `${jsDoc.numPages} pages`);
      } catch (e: any) {
        check("Renderer open", false, e?.message ?? "failed");
      }

      if (jsDoc) {
        let rendered = 0;
        const sample = Math.min(3, jsDoc.numPages);
        for (let i = 0; i < sample; i++) {
          try {
            const c = await renderPageToCanvas(await jsDoc.getPage(i + 1), 0.5);
            rendered++;
            c.width = 0;
            c.height = 0;
          } catch {
            /* counted below */
          }
        }
        check("Page renderability", rendered === sample, `${rendered}/${sample} sampled pages drew cleanly`);

        try {
          const items = await (await jsDoc.getPage(1)).getTextContent();
          const chars = (items.items as any[]).reduce((a: number, it: any) => a + (it.str?.length ?? 0), 0);
          check("Text layer present", chars > 0, chars > 0 ? "selectable text found on page 1" : "page 1 has no text (scan?)");
        } catch {
          check("Text layer present", false, "could not read text content");
        }
      }

      let encrypted = false;
      try {
        await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false, updateMetadata: false });
      } catch (e: any) {
        encrypted = /encrypt/i.test(String(e?.message));
      }
      checks.push(`[INFO] Encryption — ${encrypted ? "file IS encrypted (use Unlock/Remove Password first for editing)" : "not encrypted"}`);

      if (libDoc && jsDoc)
        check(
          "Parser agreement",
          libDoc.getPageCount() === jsDoc.numPages,
          `pdf-lib: ${libDoc.getPageCount()}, pdf.js: ${jsDoc.numPages}`
        );

      const verdict = passCount === totalChecks ? "HEALTHY" : passCount >= 3 ? "MINOR ISSUES" : "DAMAGED";
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file(
        "validation-report.txt",
        [
          `Validation report — ${file.name}`,
          `Overall verdict: ${verdict}`,
          "",
          ...checks,
          "",
          "Generated locally by GainUtility.",
        ].join("\n")
      );
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${baseName(file.name)}-validation-report.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "What should I do about failed checks?",
        acceptedAnswer:
          "Structure or render failures are usually fixable with Repair PDF. A missing text layer means the document is a scan — run OCR. An encryption notice points you to the unlock tools.",
      },
    ]}
  />
);

/* ============================ OPTIMIZE FOR WEB ============================= */

export const OptimizePdfWeb: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="optimize-pdf-web"
    title="Optimize PDF for Web"
    desc="Runs two genuine pipelines and keeps the smaller result: object-stream/metadata cleanup versus image re-encoding — no fake 'optimization'."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<Gauge className="h-6 w-6" />}
    limitations={[
      "True linearization ('fast web view') requires server-side tooling and is honestly out of scope in-browser.",
    ]}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      const raw = await file.arrayBuffer();

      setProgress("Pipeline A: structural cleanup…");
      let cleanBytes: Uint8Array | null = null;
      try {
        const doc = await PDFDocument.load(raw, { ignoreEncryption: true, updateMetadata: false });
        doc.setTitle("");
        doc.setAuthor("");
        doc.setSubject("");
        doc.setKeywords([]);
        cleanBytes = await doc.save({ useObjectStreams: true });
      } catch {
        cleanBytes = null;
      }

      setProgress("Pipeline B: image re-encoding…");
      let rasterBytes: Uint8Array | null = null;
      try {
        const res = await rasterizeToPdf(raw, { scale: 1.5, jpegQuality: 0.7 }, setProgress);
        rasterBytes = res.pdfBytes;
      } catch {
        rasterBytes = null;
      }

      const candidates = [
        { name: "structural cleanup", bytes: cleanBytes },
        { name: "image re-encoding", bytes: rasterBytes },
      ].filter((c): c is { name: string; bytes: Uint8Array } => !!c.bytes);

      if (candidates.length === 0)
        throw new Error("This file could not be optimized (encrypted or unreadable). Try Unlock PDF first.");
      candidates.sort((a, b) => a.bytes.byteLength - b.bytes.byteLength);
      const winner = candidates[0];
      if (winner.bytes.byteLength >= raw.byteLength)
        throw new Error(
          "Good news: this PDF is already efficiently packed — every pipeline produced a larger file, so nothing was changed."
        );

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file(`${baseName(file.name)}-optimized.pdf`, winner.bytes);
      zip.file(
        "optimization-log.txt",
        [
          `Source size : ${raw.byteLength.toLocaleString()} bytes`,
          `Winner      : ${winner.name}`,
          `Result size : ${winner.bytes.byteLength.toLocaleString()} bytes`,
          `Saved       : ${(100 - (winner.bytes.byteLength / raw.byteLength) * 100).toFixed(1)}%`,
          ...candidates.map((c) => `- ${c.name}: ${c.bytes.byteLength.toLocaleString()} bytes`),
        ].join("\n")
      );
      const blob = await zip.generateAsync({ type: "blob" });
      // Report the bytes the user actually downloads (the ZIP container),
      // not the inner PDF, so the on-screen size comparison is truthful.
      return { blob, name: `${baseName(file.name)}-optimized.zip`, beforeSize: raw.byteLength, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Why might nothing shrink?",
        acceptedAnswer:
          "PDFs exported with modern tools are often already compressed. When both pipelines produce bigger files we refuse to ship a worse result and tell you so instead.",
      },
    ]}
  />
);

/* ============================= COMPRESS PDF ================================= */

export const ReducePdfImageQuality: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="reduce-pdf-image-quality"
    title="Compress PDF"
    desc="Re-encode every page image at your chosen JPEG quality and resolution — the honest way to shrink scanned documents."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<ImageMinus className="h-6 w-6" />}
    defaultOptions={{ quality: 60, dpi: 110 }}
    optionsPanel={({ options, setOptions }) => (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-700 dark:text-slate-200">
          JPEG quality ({options.quality}%)
          <input
            type="range"
            min={30}
            max={90}
            value={options.quality}
            onChange={(e) => setOptions((o: any) => ({ ...o, quality: Number(e.target.value) }))}
            className="mt-2 w-full accent-emerald-600"
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-slate-200">
          Resolution
          <select
            value={options.dpi}
            onChange={(e) => setOptions((o: any) => ({ ...o, dpi: Number(e.target.value) }))}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value={72}>72 DPI (screen)</option>
            <option value={110}>110 DPI (balanced)</option>
            <option value={150}>150 DPI (print)</option>
          </select>
        </label>
      </div>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const scale = Number(options.dpi) / 72;
      const res = await rasterizeToPdf(
        await file.arrayBuffer(),
        { scale, jpegQuality: Math.min(0.95, Math.max(0.2, Number(options.quality) / 100)) },
        setProgress
      );
      if (res.pdfBytes.byteLength >= file.size)
        throw new Error(
          "At these settings the rebuilt file isn't smaller than the original. Lower the quality/resolution."
        );
      const blob = new Blob([res.pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-reduced.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Is this different from Compress PDF?",
        acceptedAnswer:
          "Compress tries lossless-ish structural tricks first; this tool deliberately re-encodes images at lower fidelity for maximum savings on scans.",
      },
    ]}
  />
);

/* ====================== COMPRESS IMAGES INSIDE A PDF ======================= */

export const CompressImagesInsidePdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="compress-images-inside-pdf"
    title="Compress Images Inside PDF"
    desc="Rebuild page imagery with tuned JPEG compression — including an optional grayscale conversion that typically halves scan sizes."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<ImageMinus className="h-6 w-6" />}
    defaultOptions={{ level: "balanced", quality: 55, grayscale: false }}
    optionsPanel={({ options, setOptions }) => (
      <div className="space-y-4">
        {/* Compression Level Presets */}
        <div>
          <span className="block text-xs font-mono uppercase text-slate-500 dark:text-slate-400 mb-2 font-bold">
            Compression Level
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "low", label: "Low", q: 75, gray: false, desc: "Crisp Text • ~20-30% off" },
              { id: "balanced", label: "Balanced", q: 55, gray: false, desc: "Recommended • ~40-60% off" },
              { id: "strong", label: "Strong", q: 35, gray: true, desc: "Max Shrink • ~60-80% off" },
            ].map((preset) => {
              const isActive = options.level === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setOptions((o: any) => ({ ...o, level: preset.id, quality: preset.q, grayscale: preset.gray }))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[56px] flex flex-col justify-between ${
                    isActive
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className={`text-xs font-bold font-sans ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 leading-tight">
                    {preset.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Sliders */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span>Image Quality:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{options.quality}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={85}
              value={options.quality}
              onChange={(e) => {
                const val = Number(e.target.value);
                setOptions((o: any) => ({ ...o, quality: val, level: "custom" }));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-3 pt-1 text-xs text-slate-700 dark:text-slate-200 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={!!options.grayscale}
              onChange={(e) => setOptions((o: any) => ({ ...o, grayscale: e.target.checked, level: "custom" }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Convert images to grayscale (substantially reduces scanned document size)</span>
          </label>
        </div>
      </div>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const q = Math.min(0.9, Math.max(0.15, Number(options.quality) / 100));
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Re-encoding page ${i + 1} of ${doc.numPages}…`);
        const page = await doc.getPage(i + 1);
        const canvas = await renderPageToCanvas(page, 1.5);
        if (options.grayscale) {
          const ctx = canvas.getContext("2d")!;
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = img.data;
          for (let p = 0; p < d.length; p += 4) {
            const g = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
            d[p] = d[p + 1] = d[p + 2] = g;
          }
          ctx.putImageData(img, 0, 0);
        }
        const jpeg = await canvasToJpegBytes(canvas, q);
        const emb = await out.embedJpg(jpeg);
        const pg = out.addPage([emb.width, emb.height]);
        pg.drawImage(emb, { x: 0, y: 0, width: emb.width, height: emb.height });
        canvas.width = 0;
        canvas.height = 0;
      }
      const bytes = await out.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-compressed.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Does grayscale really help that much?",
        acceptedAnswer:
          "For black-and-white scans yes — color JPEG wastes ~half its bits on chroma channels that contain only noise here.",
      },
    ]}
  />
);

/* ============================== COMPARE TWO PDFS =========================== */

export const CompareTwoPdfs: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="compare-two-pdfs"
    title="Compare Two PDFs"
    desc="Word-level diff of two documents' real text content — additions highlighted green, deletions red, delivered as a shareable HTML report."
    supportedFormats=".pdf"
    maxSizeStr="100 MB each"
    accept=".pdf"
    multiple
    icon={<GitCompare className="h-6 w-6" />}
    limitations={["Compares extracted TEXT content; purely visual changes like moved images are not detected."]}
    onAddToast={onAddToast}
    processFiles={async (files: File[], _opts, setProgress) => {
      if (files.length !== 2)
        throw new Error("Select exactly TWO PDFs to compare (remove extras first).");
      const [aBuf, bBuf] = [await files[0].arrayBuffer(), await files[1].arrayBuffer()];
      const subtle = globalThis.crypto?.subtle;
      let identical = false;
      if (subtle) {
        const aHash = await subtle.digest("SHA-256", aBuf.slice(0));
        const bHash = await subtle.digest("SHA-256", bBuf.slice(0));
        identical = BufferCompare(aHash, bHash);
      }
      if (identical)
        return {
          blob: new Blob([`<html><body><h1>Identical files</h1><p>${escapeXml(files[0].name)} and ${escapeXml(files[1].name)} are byte-for-byte identical.</p></body></html>`], { type: "text/html" }),
          name: "comparison-report.html",
          beforeSize: aBuf.byteLength,
          afterSize: bBuf.byteLength,
        };

      setProgress("Extracting text from both documents…");
      const [docA, docB] = [await openWithPdfJs(aBuf), await openWithPdfJs(bBuf)];
      const linesA: string[] = [];
      const linesB: string[] = [];
      for (let i = 0; i < docA.numPages; i++) linesA.push(...(await extractPageLines(docA, i)));
      for (let i = 0; i < docB.numPages; i++) linesB.push(...(await extractPageLines(docB, i)));
      const ops = diffWordLists(linesA.join("\n").split(/\s+/), linesB.join("\n").split(/\s+/));
      const added = ops.filter((o) => o.type === "added").length;
      const removed = ops.filter((o) => o.type === "removed").length;

      // collapse runs of same-type ops into styled chunks
      const htmlChunks: string[] = [];
      for (const op of ops) {
        const cls = op.type === "added" ? "add" : op.type === "removed" ? "del" : "";
        htmlChunks.push(cls ? `<${cls === "add" ? "ins" : "del"}>${escapeXml(op.word)}</${cls === "add" ? "ins" : "del"}>` : escapeXml(op.word));
      }
      const reportHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>PDF Comparison Report</title><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.7}.stats{display:flex;gap:1rem;margin-bottom:1.5rem}.card{border:1px solid #e2e8f0;border-radius:8px;padding:.75rem 1.25rem}ins{background:#dcfce7;text-decoration:none;color:#166534}del{background:#fee2e2;color:#991b1b}p.txt{white-space:normal}</style></head><body><h1>Comparison Report</h1><div class="stats"><div class="card">Document A<br><strong>${escapeXml(files[0].name)}</strong></div><div class="card">Document B<br><strong>${escapeXml(files[1].name)}</strong></div><div class="card"><span style="color:#166534">+${added.toLocaleString()}</span> words added</div><div class="card"><span style="color:#991b1b">−${removed.toLocaleString()}</span> words removed</div></div><h2>Merged diff</h2><p class="txt">${htmlChunks.join(" ")}</p></body></html>`;
      const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
      return {
        blob,
        name: `comparison-${baseName(files[0].name)}-vs-${baseName(files[1].name)}.html`,
        beforeSize: aBuf.byteLength,
        afterSize: blob.size,
      };
    }}
    faqs={[
      {
        question: "How similar must wording be to match?",
        acceptedAnswer:
          "Matching is exact-word based via a longest-common-subsequence pass, so reworded sentences show as remove+add pairs while unchanged regions stay unhighlighted.",
      },
    ]}
  />
);

/** constant-time-ish comparison of two SHA-256 digests */
const BufferCompare = (a: ArrayBuffer, b: ArrayBuffer): boolean => {
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  if (va.length !== vb.length) return false;
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
};
