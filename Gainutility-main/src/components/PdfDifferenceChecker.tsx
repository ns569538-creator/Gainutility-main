import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Split,
  Calendar,
  DollarSign,
  RefreshCw,
  Lock,
  X
} from "lucide-react";
import { Toast } from "./Common";
import { openWithPdfJs, extractPageLines } from "./pdf/helpers";

interface PdfDifferenceCheckerProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: unknown) => void;
}

interface DiffLine {
  id: string;
  type: "same" | "added" | "removed" | "modified";
  lineA?: string;
  lineB?: string;
  lineNumberA?: number;
  lineNumberB?: number;
  category?: "financial" | "date" | "metric" | "clause" | "general";
}

interface LoadedDoc {
  name: string;
  text: string;
  pages: number;
}

/** Line-level LCS diff (same DP approach as word diff, capped for memory safety). */
const diffLinesLcs = (aLines: string[], bLines: string[]): DiffLine[] => {
  const MAX = 4000;
  const a = aLines.length > MAX ? aLines.slice(0, MAX) : aLines;
  const b = bLines.length > MAX ? bLines.slice(0, MAX) : bLines;

  const rows = a.length + 1;
  const cols = b.length + 1;
  // Int32 dp table; rows*cols up to ~16M cells is fine as flat array of Uint32.
  const dp = new Uint32Array(rows * cols);
  const at = (i: number, j: number) => i * cols + j;
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[at(i, j)] =
        a[i] === b[j]
          ? dp[at(i + 1, j + 1)] + 1
          : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let n = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      if (a[i].trim().length > 0) {
        out.push({
          id: `d${n++}`,
          type: "same",
          lineA: a[i],
          lineB: b[j],
          lineNumberA: i + 1,
          lineNumberB: j + 1,
        });
      }
      i++;
      j++;
    } else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) {
      out.push({ id: `d${n++}`, type: "removed", lineA: a[i], lineNumberA: i + 1 });
      i++;
    } else {
      out.push({ id: `d${n++}`, type: "added", lineB: b[j], lineNumberB: j + 1 });
      j++;
    }
  }
  while (i < a.length) {
    if (a[i].trim()) out.push({ id: `d${n++}`, type: "removed", lineA: a[i], lineNumberA: i + 1 });
    i++;
  }
  while (j < b.length) {
    if (b[j].trim()) out.push({ id: `d${n++}`, type: "added", lineB: b[j], lineNumberB: j + 1 });
    j++;
  }

  // Attach removed+added pairs that are adjacent so UI can treat them as modifications.
  return out;
};

const detectCategory = (lineA = "", lineB = ""): DiffLine["category"] => {
  const combined = `${lineA} ${lineB}`;
  if (/[$€£¥]|\d+\.\d{2}|fee|cost|price|total|salary|bonus|payment|installment/i.test(combined)) {
    return "financial";
  }
  if (/january|february|march|april|\bjan\b|\bfeb\b|\bmar\b|\bapr\b|\bjun\b|\bjul\b|\baug\b|\bsep\b|\boct\b|\bnov\b|\bdec\b|date|deadline|month|weeks?|days?|year|202\d/i.test(combined)) {
    return "date";
  }
  if (/[%]|percent|ratio|\brate\b|uptime|\bsla\b|hours|options|shares|units/i.test(combined)) {
    return "metric";
  }
  if (/section|clause|termination|warrant(y)?|governing|law|agreement|party|liability|notice/i.test(combined)) {
    return "clause";
  }
  return "general";
};

export const PdfDifferenceChecker: React.FC<PdfDifferenceCheckerProps> = ({ onAddToast }) => {
  const [docA, setDocA] = useState<LoadedDoc | null>(null);
  const [docB, setDocB] = useState<LoadedDoc | null>(null);
  const [loadingTarget, setLoadingTarget] = useState<"A" | "B" | null>(null);
  const [password, setPassword] = useState("");
  const [needsPasswordFor, setNeedsPasswordFor] = useState<"A" | "B" | null>(null);
  const [activeMode, setActiveMode] = useState<"sideBySide" | "unified">("sideBySide");
  const [filterFocus, setFilterFocus] = useState<"all" | "importantOnly" | "financialOnly" | "datesOnly">("all");
  const [currentChangeIdx, setCurrentChangeIdx] = useState(0);

  const pendingFileRef = useRef<File | null>(null);
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const extractText = async (file: File, pw?: string): Promise<{ text: string; pages: number }> => {
    if (/\.txt$/i.test(file.name)) {
      const raw = await file.text();
      return { text: raw.replace(/\r\n/g, "\n"), pages: 0 };
    }
    const buf = await file.arrayBuffer();
    const doc = await openWithPdfJs(buf, pw || undefined);
    const chunks: string[] = [];
    for (let p = 0; p < doc.numPages; p++) {
      const lines = await extractPageLines(doc, p);
      if (lines.length > 0) {
        chunks.push(lines.join("\n"));
      } else {
        chunks.push(`[Page ${p + 1} contains no selectable text - it may be a scanned image.]`);
      }
    }
    doc.destroy?.();
    return { text: chunks.join("\n\n"), pages: doc.numPages };
  };

  const handleFile = async (file: File, target: "A" | "B", pw?: string) => {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isTxt = /\.txt$/i.test(file.name) || file.type === "text/plain";
    if (!isPdf && !isTxt) {
      onAddToast?.("Please upload a PDF or TXT file.", "error");
      return;
    }
    try {
      setLoadingTarget(target);
      setNeedsPasswordFor(null);
      const { text, pages } = await extractText(file, pw);
      const loaded: LoadedDoc = { name: file.name, text, pages };
      if (target === "A") setDocA(loaded);
      else setDocB(loaded);
      setCurrentChangeIdx(0);
      onAddToast?.(
        pages > 0
          ? `Extracted text from ${file.name} (${pages} page${pages === 1 ? "" : "s"})`
          : `Loaded ${file.name}`,
        "success"
      );
    } catch (err: any) {
      if (/password/i.test(String(err?.message))) {
        pendingFileRef.current = file;
        setNeedsPasswordFor(target);
        onAddToast?.("This PDF is password protected - enter its password below.", "warning");
      } else {
        onAddToast?.(`Could not read ${file.name}: ${err?.message || "unsupported file"}`, "error");
      }
    } finally {
      setLoadingTarget(null);
    }
  };

  const submitPassword = () => {
    if (pendingFileRef.current && needsPasswordFor) {
      const f = pendingFileRef.current;
      const t = needsPasswordFor;
      pendingFileRef.current = null;
      setNeedsPasswordFor(null);
      handleFile(f, t, password);
    }
  };

  const clearDoc = (target: "A" | "B") => {
    if (target === "A") setDocA(null);
    else setDocB(null);
  };

  const loadSamplePair = () => {
    const sampleA = [
      "MASTER SERVICES AGREEMENT",
      "Dated: March 15, 2026",
      "Parties: Apex Digital Solutions LLC ('Provider') and Horizon Retail Inc ('Client').",
      "",
      "SECTION 1. SCOPE OF SERVICES",
      "1.1 The Provider shall deliver cloud migration, system architecture, and API integration services.",
      "1.2 Total project fee is fixed at $45,000 USD, payable in three equal monthly installments of $15,000.",
      "1.3 Target completion milestone date is September 30, 2026.",
      "",
      "SECTION 2. SERVICE LEVEL AGREEMENT (SLA)",
      "2.1 Provider warrants a guaranteed uptime of 99.5% during production operating hours.",
      "2.2 Critical support ticket resolution SLA is guaranteed within 4 hours.",
      "",
      "SECTION 3. TERMINATION & PENALTIES",
      "3.1 Either party may terminate this agreement with 30 days written notice.",
      "3.2 Late payment shall accrue interest at 1.5% per month.",
    ].join("\n");
    const sampleB = [
      "MASTER SERVICES AGREEMENT",
      "Dated: March 18, 2026",
      "Parties: Apex Digital Solutions LLC ('Provider') and Horizon Retail Inc ('Client').",
      "",
      "SECTION 1. SCOPE OF SERVICES",
      "1.1 The Provider shall deliver cloud migration, system architecture, API integration, and 24/7 monitoring services.",
      "1.2 Total project fee is fixed at $58,000 USD, payable in four monthly installments of $14,500.",
      "1.3 Target completion milestone date is November 15, 2026.",
      "",
      "SECTION 2. SERVICE LEVEL AGREEMENT (SLA)",
      "2.1 Provider warrants a guaranteed uptime of 99.9% during production operating hours.",
      "2.2 Critical support ticket resolution SLA is guaranteed within 2 hours.",
      "",
      "SECTION 3. TERMINATION & PENALTIES",
      "3.1 Either party may terminate this agreement with 60 days written notice.",
      "3.2 Late payment shall accrue interest at 2.0% per month.",
      "3.3 Governing law shall be the State of California.",
    ].join("\n");
    setDocA({ name: "Sample_Agreement_v1.txt", text: sampleA, pages: 0 });
    setDocB({ name: "Sample_Agreement_v2.txt", text: sampleB, pages: 0 });
    setCurrentChangeIdx(0);
    onAddToast?.("Loaded two sample documents so you can see how the comparison works.", "info");
  };

  /* ------------------------------- diff engine ------------------------------ */

  const diffResult = useMemo(() => {
    const ready = Boolean(docA && docB);
    if (!ready) return null;

    const rawOps = diffLinesLcs(docA!.text.split("\n"), docB!.text.split("\n"));

    // Pair adjacent removed/added runs into "modified" entries for readability.
    const paired: DiffLine[] = [];
    for (let k = 0; k < rawOps.length; k++) {
      const op = rawOps[k];
      if (op.type === "removed") {
        const removedRun: string[] = [];
        while (k < rawOps.length && rawOps[k].type === "removed") removedRun.push(rawOps[k++].lineA!);
        const addedRun: string[] = [];
        const startIdx = k;
        while (k < rawOps.length && rawOps[k].type === "added") addedRun.push(rawOps[k++].lineB!);
        if (addedRun.length > 0 && removedRun.length === addedRun.length && addedRun.length <= 4) {
          // Equal-length runs read naturally as line rewrites.
          for (let r = 0; r < removedRun.length; r++) {
            paired.push({
              id: `m${paired.length}`,
              type: "modified",
              lineA: removedRun[r],
              lineB: addedRun[r],
              category: detectCategory(removedRun[r], addedRun[r]),
            });
          }
        } else {
          for (const line of removedRun) {
            paired.push({ id: `r${paired.length}`, type: "removed", lineA: line, category: detectCategory(line, "") });
          }
          if (startIdx !== k) {
            for (const line of addedRun) {
              paired.push({ id: `a${paired.length}`, type: "added", lineB: line, category: detectCategory("", line) });
            }
          }
        }
        k--;
        continue;
      }
      if (op.type === "added") {
        paired.push({ id: `a${paired.length}`, type: "added", lineB: op.lineB!, category: detectCategory("", op.lineB!) });
      } else {
        paired.push(op);
      }
    }

    let changedCount = 0;
    let financialChanges = 0;
    let dateChanges = 0;
    let metricChanges = 0;
    for (const line of paired) {
      if (line.type === "same") continue;
      changedCount++;
      if (line.category === "financial") financialChanges++;
      else if (line.category === "date") dateChanges++;
      else if (line.category === "metric") metricChanges++;
    }

    return {
      diffLines: paired,
      stats: {
        totalLinesA: docA!.text.split("\n").length,
        totalLinesB: docB!.text.split("\n").length,
        changedCount,
        financialChanges,
        dateChanges,
        metricChanges,
      },
    };
  }, [docA, docB]);

  const displayedDiffs = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.diffLines.filter((line) => {
      if (filterFocus === "importantOnly") return line.type !== "same" && line.category !== "general";
      if (filterFocus === "financialOnly") return line.type !== "same" && line.category === "financial";
      if (filterFocus === "datesOnly") return line.type !== "same" && line.category === "date";
      return true;
    });
  }, [diffResult, filterFocus]);

  const changeItems = useMemo(
    () => (diffResult ? diffResult.diffLines.filter((d) => d.type !== "same") : []),
    [diffResult]
  );

  const handleNextChange = () => {
    if (changeItems.length === 0) return;
    setCurrentChangeIdx((prev) => (prev + 1) % changeItems.length);
  };

  const handlePrevChange = () => {
    if (changeItems.length === 0) return;
    setCurrentChangeIdx((prev) => (prev - 1 + changeItems.length) % changeItems.length);
  };

const downloadDiffAuditReport = () => {
    if (!diffResult) return;
    const report = [
      `=============================================================`,
      `GAINUTILITY - PDF TEXT DIFFERENCE REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `Original File (A): ${docA?.name ?? "-"}`,
      `Revised File (B):  ${docB?.name ?? "-"}`,
      `=============================================================`,
      ``,
      `NOTE: This comparison analyzes TEXT CONTENT ONLY. Visual layout, images, and formatting are not compared.`,
      ``,
      `SUMMARY OF DETECTED REVISIONS:`,
      `-------------------------------------------------------------`,
      `- Total Change Locations:    ${diffResult.stats.changedCount}`,
      `- Financial / Price Changes: ${diffResult.stats.financialChanges}`,
      `- Date & Timeline Changes:   ${diffResult.stats.dateChanges}`,
      `- Metrics & SLA Alterations: ${diffResult.stats.metricChanges}`,
      ``,
      `DETAILED MODIFICATIONS:`,
      `-------------------------------------------------------------`,
      ...changeItems.map((c, i) =>
        [
          `[Change #${i + 1}] Category: ${(c.category ?? "GENERAL").toUpperCase()} | Status: ${c.type.toUpperCase()}`,
          c.lineA !== undefined ? `  - OLD (Doc A): "${c.lineA}"` : `  - OLD (Doc A): <not present>`,
          c.lineB !== undefined ? `  + NEW (Doc B): "${c.lineB}"` : `  + NEW (Doc B): <deleted in revision>`,
          ``,
        ].join("\n")
      ),
      `=============================================================`,
      `Comparison performed locally in your browser.`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PDF_Text_Difference_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast?.("Downloaded text difference report!", "success");
  };

  const renderUploader = (target: "A" | "B") => {
    const doc = target === "A" ? docA : docB;
    const isLoading = loadingTarget === target;
    const inputRef = target === "A" ? fileInputARef : fileInputBRef;
    return (
      <div className="bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {target === "A" ? "Original Document (Doc A)" : "Revised Document (Doc B)"}
          </span>
          {doc && (
            <span className="text-xs font-mono text-text-muted">
              {doc.pages > 0 ? `${doc.pages} page${doc.pages === 1 ? "" : "s"}` : `${doc.text.split("\n").length} lines`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="border-2 border-dashed border-border-light rounded-xl p-3.5 flex items-center justify-between gap-3 bg-surface-muted/30">
            <RefreshCw className="w-5 h-5 text-brand-primary animate-spin shrink-0" />
            <span className="text-xs font-semibold text-text-muted">Extracting text…</span>
          </div>
        ) : doc ? (
          <div className="border border-border-light rounded-xl p-3.5 flex items-center justify-between gap-3 bg-surface-muted/30">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <FileText className="w-5 h-5 text-brand-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-main truncate">{doc.name}</p>
                <p className="text-[10px] text-text-muted">{doc.text.length.toLocaleString()} characters extracted</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => clearDoc(target)}
              aria-label={`Remove document ${target}`}
              className="p-1.5 rounded-lg hover:bg-status-error/10 text-status-error transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f, target);
            }}
            className="border-2 border-dashed border-border-light hover:border-brand-primary/50 rounded-xl p-3.5 flex items-center justify-between gap-3 bg-surface-muted/30 cursor-pointer transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], target)}
            />
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-5 h-5 text-text-muted shrink-0" />
              <span className="text-xs font-bold text-text-main">Drop or click to upload</span>
            </div>
            <span className="text-xs text-brand-primary font-semibold shrink-0">PDF / TXT</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={loadSamplePair}
          disabled={loadingTarget !== null}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          Load sample pair
        </button>
      </div>

      {/* Password prompt */}
      {needsPasswordFor && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-status-warning/5 border border-status-warning/30 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-status-warning text-sm font-semibold">
            <Lock className="w-4 h-4 shrink-0" />
            Password needed for Doc {needsPasswordFor}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPassword()}
            placeholder="PDF password"
            aria-label="PDF password"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-base border border-border-medium text-text-main outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus"
          />
          <button
            onClick={submitPassword}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors cursor-pointer"
          >
            Unlock &amp; Compare
          </button>
        </div>
      )}

      {/* Upload cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderUploader("A")}
        {renderUploader("B")}
      </div>

{!docA || !docB ? (
        <div className="bg-surface-base p-10 rounded-2xl border border-border-light flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
          <AlertTriangle className="w-8 h-8 text-text-muted/60" />
          <h2 className="font-sans font-semibold text-text-main text-lg">
            Upload two documents to compare
          </h2>
          <p className="text-xs text-text-muted max-w-md leading-relaxed">
            Text is extracted directly from each file in your browser, then compared line by line.
            This tool compares <strong>text content only</strong> — visual layout, images, and formatting are not analyzed.
            Or press "Load sample pair" above to see the tool in action first.
          </p>
        </div>
      ) : loadingTarget ? (
        <div className="bg-surface-base p-10 rounded-2xl border border-border-light flex flex-col items-center gap-3" role="status" aria-live="polite">
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-sm text-text-muted">Reading document {loadingTarget}…</p>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setFilterFocus("all")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                filterFocus === "all" ? "bg-brand-primary-light/40 border-brand-primary/40 shadow-sm" : "bg-surface-base border-border-light"
              }`}
            >
              <span className="flex items-center justify-between text-text-muted text-xs">
                <span>Total Changes</span>
                <Split className="w-3.5 h-3.5 text-brand-primary" />
              </span>
              <span className="block text-xl font-bold font-mono text-text-main mt-1">
                {diffResult!.stats.changedCount}
              </span>
            </button>

            <button
              onClick={() => setFilterFocus("financialOnly")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                filterFocus === "financialOnly" ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm" : "bg-surface-base border-border-light"
              }`}
            >
              <span className="flex items-center justify-between text-text-muted text-xs">
                <span>Price &amp; Financials</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              </span>
              <span className="block text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {diffResult!.stats.financialChanges}
              </span>
            </button>

            <button
              onClick={() => setFilterFocus("datesOnly")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                filterFocus === "datesOnly" ? "bg-blue-500/10 border-blue-500/40 shadow-sm" : "bg-surface-base border-border-light"
              }`}
            >
              <span className="flex items-center justify-between text-text-muted text-xs">
                <span>Deadlines &amp; Dates</span>
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
              </span>
              <span className="block text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {diffResult!.stats.dateChanges}
              </span>
            </button>

            <button
              onClick={() => setFilterFocus("importantOnly")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                filterFocus === "importantOnly" ? "bg-amber-500/10 border-amber-500/40 shadow-sm" : "bg-surface-base border-border-light"
              }`}
            >
              <span className="flex items-center justify-between text-text-muted text-xs">
                <span>Important Focus</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <span className="block text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {diffResult!.stats.financialChanges + diffResult!.stats.dateChanges + diffResult!.stats.metricChanges}
              </span>
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-base p-4 rounded-2xl border border-border-light shadow-premium-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted">Change Navigator:</span>
              <button
                onClick={handlePrevChange}
                aria-label="Previous modification"
                className="p-1.5 rounded-lg bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-text-main px-1">
                {changeItems.length > 0 ? `${currentChangeIdx + 1} of ${changeItems.length}` : "0 of 0"}
              </span>
              <button
                onClick={handleNextChange}
                aria-label="Next modification"
                className="p-1.5 rounded-lg bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-surface-muted p-1 rounded-xl border border-border-light" role="tablist" aria-label="View mode">
                <button
                  onClick={() => setActiveMode("sideBySide")}
                  role="tab"
                  aria-selected={activeMode === "sideBySide"}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "sideBySide" ? "bg-surface-base text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveMode("unified")}
                  role="tab"
                  aria-selected={activeMode === "unified"}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "unified" ? "bg-surface-base text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Unified Stream
                </button>
              </div>

              <button
                onClick={downloadDiffAuditReport}
                disabled={changeItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.txt)</span>
              </button>
            </div>
          </div>

          {/* Viewer */}
          <div className="bg-surface-base rounded-2xl border border-border-light shadow-premium-sm overflow-hidden flex flex-col font-mono text-xs">
            {displayedDiffs.length === 0 ? (
              <div className="p-10 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="font-sans font-semibold text-text-main text-base">
                  {filterFocus === "all"
                    ? "The text content of both documents is identical."
                    : "No changes match this filter."}
                </p>
                <p className="text-xs text-text-muted">
                  This tool compares extracted text only. Visual differences (layout, images, formatting) are not detected.
                </p>
              </div>
            ) : activeMode === "sideBySide" ? (
              <div className="grid grid-cols-2 divide-x divide-border-light max-h-[600px] overflow-y-auto">
                <div className="flex flex-col">
                  <div className="sticky top-0 bg-surface-muted/95 backdrop-blur p-3 font-bold text-text-main border-b border-border-light z-10">
                    Original Document (A)
                  </div>
                  <div className="divide-y divide-border-light/40">
                    {displayedDiffs.map((d) => (
                      <div
                        key={`left-${d.id}`}
                        className={`p-3 leading-relaxed flex items-start gap-2 break-words ${
                          d.type === "removed" ? "bg-red-500/10 text-red-700 dark:text-red-300" : d.type === "modified" ? "bg-red-500/5 text-red-600 dark:text-red-300" : "text-text-sub"
                        }`}
                      >
                        <span className="text-text-muted w-6 text-right select-none opacity-50">{d.lineNumberA ?? ""}</span>
                        <span className="flex-1">{d.lineA ?? (d.type === "added" ? "<not present in A>" : "")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="sticky top-0 bg-surface-muted/95 backdrop-blur p-3 font-bold text-text-main border-b border-border-light z-10">
                    Revised Document (B)
                  </div>
                  <div className="divide-y divide-border-light/40">
                    {displayedDiffs.map((d) => (
                      <div
                        key={`right-${d.id}`}
                        className={`p-3 leading-relaxed flex items-start gap-2 break-words ${
                          d.type === "added" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold" : d.type === "modified" ? "bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "text-text-sub"
                        }`}
                      >
                        <span className="text-text-muted w-6 text-right select-none opacity-50">{d.lineNumberB ?? ""}</span>
                        <span className="flex-1">{d.lineB ?? (d.type === "removed" ? "<deleted in B>" : "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border-light/50 max-h-[600px] overflow-y-auto">
                {displayedDiffs.map((d) => (
                  <div
                    key={d.id}
                    className={`p-3 leading-relaxed flex items-start gap-3 break-words ${
                      d.type === "added" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
                      d.type === "removed" ? "bg-red-500/10 text-red-700 dark:text-red-300" :
                      "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    <span className="font-bold w-4 select-none shrink-0">
                      {d.type === "added" ? "+" : d.type === "removed" ? "-" : "±"}
                    </span>
                    <div className="flex-1 space-y-1">
                      {d.category && d.category !== "general" && (
                        <span className="inline-block px-1.5 py-0.5 mr-2 rounded bg-surface-muted text-[10px] font-bold uppercase tracking-wide text-text-muted align-middle">
                          {d.category}
                        </span>
                      )}
                      {d.lineA !== undefined && (
                        <div className={d.type === "modified" ? "line-through text-red-600 dark:text-red-400 opacity-75" : ""}>
                          {d.lineA}
                        </div>
                      )}
                      {d.lineB !== undefined && (
                        <div className={d.type === "modified" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                          {d.lineB}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {changeItems.length > 0 && (
            <p className="text-[11px] text-text-muted text-center">
              Showing change {Math.min(currentChangeIdx + 1, changeItems.length)} of {changeItems.length}.
              Categories (financials, dates, metrics, clauses) are keyword heuristics to help you prioritize review.
            </p>
          )}
        </>
      )}
    </div>
  );
};
