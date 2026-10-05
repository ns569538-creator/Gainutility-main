import { ViewState } from "../types";
import React, { useRef, useState } from "react";
import { Lock, RefreshCw, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button, Card } from "./Common";
import { encryptPdfBytes, formatBytes } from "./pdf/helpers";
import { PdfPreview } from "./pdf/PdfPreview";
import { PDFErrorAlert } from "./pdf/PdfComponents";

interface ProtectPdfProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const ProtectPdf: React.FC<ProtectPdfProps> = ({ onAddToast }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  // Persisted inline error — a toast alone disappears before a screen-reader
  // user (or a slow reader) gets to it, so failures stay on the page too.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showUserPass, setShowUserPass] = useState(false);
  const [showOwnerPass, setShowOwnerPass] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUrl = useRef<string | null>(null);

  const resetAll = () => {
    if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    lastUrl.current = null;
    setResultUrl(null);
    setResultName("");
    setPdfFile(null);
    setBuffer(null);
    setPageCount(0);
    setUserPassword("");
    setOwnerPassword("");
    setErrorMessage(null);
  };

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      const msg = "That's not a .pdf file — please choose a PDF.";
      setErrorMessage(msg);
      onAddToast(msg, "error");
      return;
    }
    try {
      setIsProcessing(true);
      setProgressMsg("Reading PDF structure…");
      const arrayBuffer = await file.arrayBuffer();
      // Validate it parses before accepting (encrypted-with-password files are rejected here)
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      let count: number;
      try {
        const doc = await PDFDocument.load(arrayBuffer.slice(0));
        count = doc.getPageCount();
      } catch (err: any) {
        if (/encrypt|password/i.test(String(err?.message))) {
          throw new Error(
            "This file is already password-protected. Remove its password first (Remove PDF Password tool), then protect it anew."
          );
        }
        throw new Error("The file could not be parsed as a PDF — it may be corrupted.");
      }
      resetAll();
      setBuffer(arrayBuffer);
      setPdfFile(file);
      setPageCount(count);
      onAddToast(`Loaded "${file.name}" (${count} pages).`, "success");
    } catch (err: any) {
      const msg = err?.message || "Failed to load PDF.";
      setErrorMessage(msg);
      onAddToast(msg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const handleProtectPdf = async () => {
    if (!buffer || !pdfFile) return;
    if (!userPassword && !ownerPassword) {
      const msg = "Enter at least one password — otherwise there is nothing to protect.";
      setErrorMessage(msg);
      onAddToast(msg, "warning");
      return;
    }
    if (userPassword && userPassword.length < 4) {
      const msg = "Use a user password of at least 4 characters.";
      setErrorMessage(msg);
      onAddToast(msg, "warning");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressMsg("Encrypting with real standard-security cryptography…");
    try {
      const bytes = await encryptPdfBytes(buffer, userPassword, ownerPassword, {
        printing: allowPrinting ? ("highResolution" as any) : undefined,
        copying: allowCopying,
        modifying: allowModifying,
      });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      lastUrl.current = url;
      setResultUrl(url);
      setResultName(`${pdfFile.name.replace(/\.pdf$/i, "")}-protected.pdf`);
      onAddToast(
        `Encrypted (${formatBytes(bytes.byteLength)}). Verify it asks for your password when opened.`,
        "success"
      );
    } catch (err: any) {
      const msg = `Protection failed: ${err?.message || "unknown error"}`;
      setErrorMessage(msg);
      onAddToast(msg, "error");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl pb-16">
      {!pdfFile ? (
        <Card title="Upload PDF to Protect" subtitle="Files are encrypted locally — nothing is uploaded.">
          {errorMessage && (
            <PDFErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} className="mb-5" />
          )}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-600 dark:hover:bg-emerald-900/10"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-label="Choose a PDF file to protect"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <div className="rounded-full bg-emerald-100 p-4 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Lock className="h-10 w-10" aria-hidden />
            </div>
            <div>
              <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">Upload PDF File</span>
              <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">or drag &amp; drop here</span>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Visual PDF Inspection (Left ~58% on desktop, Top on mobile) */}
          <div className="order-1 lg:order-1 space-y-6 lg:col-span-7 lg:sticky lg:top-6">
            <Card title="Document Preview" subtitle={`${pageCount} pages loaded • ${formatBytes(pdfFile.size)}`}>
              <div className="p-1">
                <PdfPreview file={pdfFile} maxHeight={520} />
              </div>
            </Card>
          </div>

          {/* Right Column: Passwords & Permissions (Right ~42% on desktop, Below preview on mobile) */}
          <div className="order-2 lg:order-2 space-y-6 lg:col-span-5">
            <Card title="Passwords & Permissions" subtitle="Strong passwords only — there is no recovery option." collapsible>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pp-user-pass" className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                    User password (needed to open)
                  </label>
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    Anyone opening the PDF must type this.
                  </p>
                  <div className="relative">
                    <input
                      id="pp-user-pass"
                      type={showUserPass ? "text" : "password"}
                      value={userPassword}
                      autoComplete="new-password"
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter strong user password"
                      className="w-full rounded-[14px] border border-slate-300 bg-white px-5 py-3.5 pr-12 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      aria-label={showUserPass ? "Hide user password" : "Show user password"}
                      onClick={() => setShowUserPass(!showUserPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showUserPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <label htmlFor="pp-owner-pass" className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                    Owner password (controls permissions)
                  </label>
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    Optional; defaults to the user password when left empty.
                  </p>
                  <div className="relative">
                    <input
                      id="pp-owner-pass"
                      type={showOwnerPass ? "text" : "password"}
                      value={ownerPassword}
                      autoComplete="new-password"
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Enter owner password (optional)"
                      className="w-full rounded-[14px] border border-slate-300 bg-white px-5 py-3.5 pr-12 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      aria-label={showOwnerPass ? "Hide owner password" : "Show owner password"}
                      onClick={() => setShowOwnerPass(!showOwnerPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showOwnerPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <fieldset className="pt-2">
                  <legend className="text-sm font-bold text-slate-800 dark:text-slate-100">Allow readers to</legend>
                  <div className="mt-2 space-y-2">
                    {[
                      ["Print the document", allowPrinting, setAllowPrinting] as const,
                      ["Copy text and images", allowCopying, setAllowCopying] as const,
                      ["Modify contents", allowModifying, setAllowModifying] as const,
                    ].map(([label, val, set]) => (
                      <label key={label} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => set(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Note: permission flags are enforced by well-behaved viewers; they cannot stop determined tools.
                    The user password is what actually keeps people out.
                  </p>
                </fieldset>

                {isProcessing && progressMsg && (
                  <div aria-live="polite" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{progressMsg}</p>
                  </div>
                )}

                {errorMessage && (
                  <PDFErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
                )}

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-700">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-xs font-mono text-slate-500 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer min-h-[44px] flex items-center"
                  >
                    Choose a different file ({pageCount} pages loaded)
                  </button>
                  <Button variant="primary" onClick={handleProtectPdf} loading={isProcessing} className="cursor-pointer min-h-[44px]">
                    Apply AES Encryption
                  </Button>
                </div>

                {resultUrl && (
                  <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5 sm:flex-row sm:items-center dark:border-emerald-700 dark:bg-emerald-900/20 shadow-sm animate-fade-in">
                    <div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                        ✓ Encrypted Copy Ready!
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Download your file and open it to verify the password prompt appears.
                      </p>
                    </div>
                    <a
                      id="download-protected-pdf-btn"
                      href={resultUrl}
                      download={resultName}
                      className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer min-h-[44px] flex items-center justify-center"
                    >
                      DOWNLOAD PROTECTED PDF
                    </a>
                  </div>
                )}
              </div>
            </Card>

            <Card title="How this works" subtitle="Genuine cryptography, in your tab." collapsible>
              <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  Your file is encrypted with the PDF standard-security handler using{" "}
                  <strong>AES-256</strong> (128-bit for maximum viewer compatibility where needed by the engine).
                  The output is a genuinely encrypted document, not a renamed copy.
                </p>
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  <li><strong>User password</strong> — required to open and decrypt contents.</li>
                  <li><strong>Owner password</strong> — unlocks permission changes without opening restrictions.</li>
                </ul>
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>Encryption runs entirely in your browser. Passwords never leave this tab.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
