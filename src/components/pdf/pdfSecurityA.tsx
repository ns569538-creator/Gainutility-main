import React from "react";
import { LockOpen, KeyRound, ScanText } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  NETWORK_NOTE,
  baseName,
  decryptPdfBytes,
  isPasswordError,
  loadTesseract,
  openWithPdfJs,
  renderPageToCanvas,
} from "./helpers";

/* ================================ UNLOCK PDF =============================== */

export const UnlockPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="unlock-pdf"
    title="Unlock PDF"
    desc="Remove owner restrictions (printing/copying limits) from PDFs that already open without a password — real standard-security decryption, output saved as an unrestricted copy."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<LockOpen className="h-6 w-6" />}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      setProgress("Attempting decryption…");
      const outBytes = await decryptPdfBytes(await file.arrayBuffer(), "").catch((err) => {
        if (/encrypted/i.test(String(err?.message))) {
          throw new Error(
            "This PDF uses an open password, which this tool can't bypass. If you know the password, use Remove PDF Password below and enter it once to get a decrypted copy."
          );
        }
        throw err;
      });
      // Sanity check: result must open cleanly.
      await openWithPdfJs(outBytes.slice());
      const blob = new Blob([outBytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-unlocked.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "What's the difference vs “Remove PDF Password”?",
        acceptedAnswer:
          "Some PDFs open freely but block printing/copying (owner restrictions) — that's what this tool removes, using the file's empty open password. If your file demands a password just to open, use Remove PDF Password and type it once instead.",
      },
      {
        question: "Is this legal?",
        acceptedAnswer:
          "Use it on documents you own or have permission to modify — e.g. restoring printing on your own files after a permissions password was set.",
      },
    ]}
  />
);

/* =========================== REMOVE PDF PASSWORD =========================== */

export const RemovePdfPassword: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="remove-pdf-password"
    title="Remove PDF Password"
    desc="Know the password? Enter it and download a fully decrypted copy with all protection stripped — genuine AES/RC4 decryption, no re-rendering."
    supportedFormats=".pdf"
    maxSizeStr="200 MB"
    accept=".pdf"
    icon={<KeyRound className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ password: "" }}
    optionsPanel={({ options, setOptions }) => (
      <label className="block text-sm text-slate-700 dark:text-slate-200">
        Current password
        <input
          type="password"
          autoComplete="off"
          required
          value={options.password}
          placeholder="The password the file currently asks for"
          onChange={(e) => setOptions((o: any) => ({ ...o, password: e.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          Processed locally; the password never leaves your browser.
        </span>
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      const pwd = String(options.password ?? "");
      if (!pwd) throw new Error("Enter the file's current password in the settings above.");
      setProgress("Decrypting with supplied password…");
      let outBytes: Uint8Array;
      try {
        outBytes = await decryptPdfBytes(await file.arrayBuffer(), pwd);
      } catch (err: any) {
        if (isPasswordError(err)) throw err;
        throw new Error("Decryption failed — double-check the password and try again.");
      }
      await openWithPdfJs(outBytes.slice());
      const blob = new Blob([outBytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}-no-password.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How strong is the removal?",
        acceptedAnswer:
          "It performs the same cryptographic decryption a desktop app does (AES-128/256 or RC4 depending on the file), producing a clean unencrypted PDF.",
      },
      {
        question: "I forgot my password entirely.",
        acceptedAnswer:
          "Then there's nothing this tool can honestly do — strong encryption can't be bypassed in-browser, and we won't pretend otherwise.",
      },
    ]}
  />
);

/* ================================== OCR ==================================== */

export const OcrPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="ocr-pdf"
    title="OCR PDF"
    desc="Recognize text on scanned pages with a real OCR engine (Tesseract WASM) and export editable .txt results per page plus one combined file."
    supportedFormats=".pdf"
    maxSizeStr="150 MB"
    accept=".pdf"
    icon={<ScanText className="h-6 w-6" />}
    limitations={[
      `Runs entirely in-browser after ${NETWORK_NOTE.toLowerCase().replace(/\.$/, "")}`,
      "Expect roughly 3–10 seconds per page depending on hardware; handwriting accuracy is limited.",
    ]}
    onAddToast={onAddToast}
    defaultOptions={{ maxPages: 20 }}
    optionsPanel={({ options, setOptions }) => (
      <label className="block text-sm text-slate-700 dark:text-slate-200">
        Pages to process (OCR is compute-heavy)
        <input
          type="number"
          min={1}
          max={100}
          value={options.maxPages}
          onChange={(e) => setOptions((o: any) => ({ ...o, maxPages: Math.max(1, Number(e.target.value) || 1) }))}
          className="ml-3 w-24 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      setProgress("Loading OCR engine (one-time)…");
      const Tesseract = await loadTesseract();
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const limit = Math.min(doc.numPages, Math.max(1, Number(options.maxPages) || 20));
      const worker = await Tesseract.createWorker("eng");
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const combined: string[] = [];
      try {
        for (let i = 0; i < limit; i++) {
          setProgress(`OCRing page ${i + 1} of ${limit}…`);
          const page = await doc.getPage(i + 1);
          const canvas = await renderPageToCanvas(page, 2);
          const { data } = await worker.recognize(canvas);
          const text = String(data?.text ?? "").trim();
          combined.push(`— Page ${i + 1} —\n${text}\n`);
          zip.file(`page-${String(i + 1).padStart(2, "0")}.txt`, text);
          if (i === 0 && !text)
            throw new Error("Page 1 produced no text — is this really a scan? Try PDF to Text instead.");
          canvas.width = 0;
          canvas.height = 0;
        }
      } finally {
        await worker.terminate?.();
      }
      if (limit < doc.numPages)
        combined.push(`\n[Stopped after ${limit} pages as configured; ${doc.numPages - limit} remaining.]`);
      zip.file("full-text.txt", combined.join("\n"));
      setProgress("Packaging ZIP…");
      const blob = await zip.generateAsync({ type: "blob" });
      return { blob, name: `${baseName(file.name)}-ocr.zip`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Why does the engine need downloading once?",
        acceptedAnswer:
          "Tesseract's neural model is ~12 MB and is fetched from a public CDN the first time, then cached. Your documents themselves are never uploaded.",
      },
      {
        question: "Which languages are supported?",
        acceptedAnswer: "This build ships the English model. More languages can be added on request.",
      },
    ]}
  />
);
