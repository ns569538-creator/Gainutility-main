import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Receipt,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";
import { Toast } from "./Common";
import { openWithPdfJs, extractPageLines } from "./pdf/helpers";

interface BusinessPdfExtractorProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: unknown) => void;
}

interface LineItem {
  id: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ExtractedDocument {
  docType: string;
  vendorName: string;
  customerName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  taxAmount: number;
  shipping: number;
  grandTotal: number;
  lineItems: LineItem[];
}

const EMPTY_DOC: ExtractedDocument = {
  docType: "",
  vendorName: "",
  customerName: "",
  invoiceNumber: "",
  issueDate: "",
  dueDate: "",
  currency: "USD",
  taxRate: 0,
  taxAmount: 0,
  shipping: 0,
  grandTotal: 0,
  lineItems: [],
};

const SAMPLE_DOC: ExtractedDocument = {
  docType: "Invoice",
  vendorName: "CloudScale Infrastructure Technologies Inc.",
  customerName: "Acme Digital Media LLC",
  invoiceNumber: "INV-2026-88219",
  issueDate: "2026-08-01",
  dueDate: "2026-08-15",
  currency: "USD",
  taxRate: 8.5,
  taxAmount: 181.05,
  shipping: 0,
  grandTotal: 2311.05,
  lineItems: [
    { id: "1", description: "Cloud Kubernetes Cluster Compute Nodes (3x Standard)", sku: "INF-K8S-01", quantity: 3, unitPrice: 450, lineTotal: 1350 },
    { id: "2", description: "Global Multi-Region Edge CDN & SSL Bandwidth (10TB)", sku: "INF-CDN-10", quantity: 1, unitPrice: 280, lineTotal: 280 },
    { id: "3", description: "Enterprise Priority 24/7 SLA Engineering Support", sku: "SUP-ENT-MO", quantity: 1, unitPrice: 500, lineTotal: 500 },
  ],
};

/* ----------------------------- parsing helpers ---------------------------- */

const num = (raw: string): number => {
  const cleaned = raw.replace(/[,$€£\s]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

/** Normalize several common date formats to YYYY-MM-DD (for <input type=date>). */
const normalizeDate = (raw: string): string => {
  const s = raw.trim();
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    // Assume MM/DD/YYYY (US-style invoices); DD/MM would need locale context.
    return `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  m = s.match(new RegExp(`(${MONTHS.map((x) => x.slice(0, 3)).join("|")})[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i"));
  if (m) {
    const monthIdx = MONTHS.findIndex((x) => x.startsWith(m![1].toLowerCase()));
    if (monthIdx >= 0) return `${m[3]}-${String(monthIdx + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  m = s.match(/(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})/);
  if (m) {
    const monthIdx = MONTHS.findIndex((x) => x.startsWith(m![2].toLowerCase().slice(0, 3)));
    if (monthIdx >= 0) return `${m[3]}-${String(monthIdx + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return "";
};

const findAfter = (lines: string[], labelRe: RegExp): string => {
  for (const line of lines) {
    const m = line.match(labelRe);
    if (m && m.index !== undefined) {
      const rest = line.slice(m.index + m[0].length).replace(/^[\s:#•-]+/, "").trim();
      if (rest) return rest.split(/\s{2,}/)[0].slice(0, 120);
    }
  }
  return "";
};

const detectDocType = (lower: string): string => {
  if (/purchase\s+order|\bpo\b\s*#|p\.o\.#/.test(lower)) return "Purchase Order";
  if (/quotation|quote\s*#|\bquote\b/.test(lower)) return "Quotation";
  if (/receipt/.test(lower)) return "Receipt";
  if (/invoice/.test(lower)) return "Invoice";
  return "";
};

/** Pull plausible line items out of text rows. Best-effort by design. */
const parseLineItems = (lines: string[]): LineItem[] => {
  const items: LineItem[] = [];
  const amountAtEnd = /(?:[$€£])?\s*(\d{1,3}(?:[,. ]\d{3})*[.,]\d{2}|\d+[.,]\d{2})\s*$/;
  const qtyPrice = /^(.*?)(?:^|\s)(\d+(?:\.\d+)?)\s*(?:x|×|@)\s*[$€£]?\s*(\d+[.,]\d{2})\s+[$€£]?\s*(\d{1,3}(?:[,. ]\d{3})*[.,]\d{2}|\d+[.,]\d{2})\s*$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.length < 6) continue;

    const qp = line.match(qtyPrice);
    if (qp) {
      const desc = qp[1].replace(/^[\d.)\-#*\s]+/, "").trim();
      const q = parseFloat(qp[2]);
      const u = num(qp[3]);
      const t = num(qp[4]);
      if (desc.length > 2 && Number.isFinite(q) && Number.isFinite(u) && Number.isFinite(t)) {
        items.push({ id: String(items.length), description: desc.slice(0, 140), quantity: q, unitPrice: u, lineTotal: t });
        continue;
      }
    }

    const endMatch = line.match(amountAtEnd);
    if (endMatch) {
      const total = num(endMatch[1]);
      const before = line.slice(0, endMatch.index ?? 0).trim();
      // Skip obvious non-item rows (labels, totals, addresses).
      if (/total|subtotal|sub-total|balance|amount\s+due|tax|vat|gst|shipping|freight|discount|paid|due\b|date|page/i.test(before)) continue;
      // Split trailing qty x price when written as "desc ... 2 $450.00 $900.00"
      const numsBefore = [...before.matchAll(/[$€£]?\s*(\d{1,3}(?:[,. ]\d{3})*[.,]\d{2}|\d+(?:\.\d+)?)/g)].map((mm) => mm[1]);
      let quantity = 1;
      let unitPrice = NaN;
      let description = before.replace(/^\d+[.)\s]+/, "").trim();
      const skuMatch = description.match(/^([A-Z]{2,}[-_][A-Z0-9-]{2,})\s+/);
      const sku = skuMatch ? skuMatch[1] : undefined;
      if (sku) description = description.slice(sku.length).trim();

      if (numsBefore.length >= 2) {
        const secondLast = num(numsBefore[numsBefore.length - 2]);
        const last = num(numsBefore[numsBefore.length - 1]);
        if (Number.isFinite(secondLast) && Number.isFinite(last)) {
          if (Math.abs(secondLast * quantity - total) <= Math.max(0.02 * total, 0.05)) {
            unitPrice = secondLast;
          } else if (secondLast > 0 && Math.abs(secondLast) < 10000 && !Number.isInteger(total)) {
            unitPrice = last;
            quantity = secondLast;
          } else {
            unitPrice = secondLast;
            quantity = last > 0 && last < 100000 && Number.isInteger(last) ? last : 1;
          }
          description = before.slice(0, before.lastIndexOf(numsBefore[numsBefore.length - 1])).trim() || description;
          description = description.replace(/[$€£]?\s*(\d{1,3}(?:[,. ]\d{3})*[.,]\d{2}|\d+(?:\.\d+)?)\s*$/, "").trim();
        }
      }
      if (description.length > 2 && Number.isFinite(total)) {
        if (!Number.isFinite(unitPrice)) unitPrice = quantity !== 0 ? Number((total / quantity).toFixed(2)) : total;
        items.push({
          id: String(items.length),
          description: description.slice(0, 140),
          sku,
          quantity,
          unitPrice: Number(unitPrice.toFixed(2)),
          lineTotal: total,
        });
      }
    }
  }
  return items;
};

export const BusinessPdfExtractor: React.FC<BusinessPdfExtractorProps> = ({ onAddToast }) => {
  const [fileName, setFileName] = useState("");
  const [docData, setDocData] = useState<ExtractedDocument | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [parseNote, setParseNote] = useState<string>("");
  const [showRawText, setShowRawText] = useState(false);
  const [rawText, setRawText] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, pw?: string) => {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isTxt = /\.txt$/i.test(file.name) || file.type === "text/plain";
    if (!isPdf && !isTxt) {
      onAddToast?.("Please upload a PDF or TXT file.", "error");
      return;
    }
    try {
      setIsLoading(true);
      setNeedsPassword(false);
      let text = "";
      let pages = 0;
      if (isTxt) {
        text = await file.text();
      } else {
        const buf = await file.arrayBuffer();
        const doc = await openWithPdfJs(buf, pw || undefined);
        pages = doc.numPages;
        const chunks: string[] = [];
        for (let p = 0; p < pages; p++) {
          const lines = await extractPageLines(doc, p);
          chunks.push(lines.join("\n"));
        }
        doc.destroy?.();
        text = chunks.join("\n\n");
      }
      setRawText(text);

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const lowerAll = text.toLowerCase();

      const detectedType = detectDocType(lowerAll);
      const invoiceNumber =
        findAfter(lines, /(invoice|inv|po|purchase\s*order|receipt|quote|quotation)\s*(no\.?|number|#)\s*[:.]?\s*/i) ||
        (text.match(/\b((?:INV|PO|REC|Q)[-–]?[\dA-Z-]{3,})\b/i)?.[1] ?? "");

      const issueDate =
        normalizeDate(findAfter(lines, /(issue\s*date|invoice\s*date|date\s*of\s*issue|^date|dated)\s*[:.]?\s*/i)) ||
        "";
      const dueDate = normalizeDate(findAfter(lines, /(due\s*date|payment\s*due|pay\s*by)\s*[:.]?\s*/i));

      const subtotalFound = findAfter(lines, /(sub\s*-?\s*total)\s*[:]?\s*/i);
      const taxFound = findAfter(lines, /(?<!income\s)(tax|vat|gst|hst)\s*(?:\(?\s*(\d+(?:\.\d+)?)\s*%\s*\)?)?\s*[:]?\s*/i);
      const shippingFound = findAfter(lines, /(shipping|freight|delivery)\s*[:]?\s*/i);
      const grandFound =
        findAfter(lines, /(grand\s*total|total\s*due|amount\s*due|balance\s*due|total\s*amount|total)\s*[:]?\s*/i);

      const taxRateMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:tax|vat|gst)/i) || text.match(/(?:tax|vat|gst)\s*\(?(\d+(?:\.\d+)?)\s*%\)?/i);

      const items = parseLineItems(lines);
      const computedSubtotal = items.reduce((s, it) => s + it.lineTotal, 0);
      const statedSubtotal = Number.isFinite(num(subtotalFound)) ? num(subtotalFound) : computedSubtotal;

      const taxAmount = Number.isFinite(num(taxFound)) ? num(taxFound) : 0;
      const shipping = Number.isFinite(num(shippingFound)) ? num(shippingFound) : 0;
      const statedGrand = Number.isFinite(num(grandFound)) ? num(grandFound) : 0;
      const computedGrand = Number(((statedSubtotal || computedSubtotal) + taxAmount + shipping).toFixed(2));
      const grandTotal = statedGrand > 0 ? statedGrand : computedGrand;

      const currency = /€|eur\b/i.test(text) ? "EUR" : /£|gbp\b/i.test(text) ? "GBP" : "USD";

      const notes: string[] = [];
      if (pages === 0 && isTxt) notes.push("plain-text file parsed directly");
      const noSelectable = text.replace(/\[Page \d+[^]]*\]/g, "").trim().length < 40;
      if (noSelectable) {
        notes.push("No selectable text was found - this PDF looks like scanned images, so nothing could be auto-extracted. OCR is required for scans.");
      } else {
        if (!detectedType) notes.push("document type not recognized");
        if (!invoiceNumber) notes.push("no document number found");
        if (items.length === 0) notes.push("line items could not be auto-detected - add them manually below");
        else notes.push(`${items.length} line item${items.length === 1 ? "" : "s"} auto-detected`);
      }

      setDocData({
        docType: detectedType,
        vendorName: "",
        customerName: "",
        invoiceNumber,
        issueDate,
        dueDate,
        currency,
        taxRate: taxRateMatch ? parseFloat(taxRateMatch[1]) : 0,
        taxAmount,
        shipping,
        grandTotal,
        lineItems: items,
      });
      setParseNote(notes.join(" · ") || "extraction complete");
      setIsDemo(false);
      setFileName(file.name);
      onAddToast?.(
        noSelectable
          ? "This PDF has no selectable text (scanned images) - OCR tools are needed for those."
          : `Parsed ${file.name}${pages ? ` (${pages} pages)` : ""}. Review the extracted fields below.`,
        noSelectable ? "warning" : "success"
      );
    } catch (err: any) {
      if (/password/i.test(String(err?.message))) {
        setPendingFile(file);
        setNeedsPassword(true);
        onAddToast?.("This PDF is password protected - enter its password below.", "warning");
      } else {
        onAddToast?.(`Could not read ${file.name}: ${err?.message || "unsupported file"}`, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const submitPassword = () => {
    if (pendingFile) {
      const f = pendingFile;
      setPendingFile(null);
      processFile(f, password);
    }
  };

  /* ------------------------------ math checks ------------------------------ */

  const validation = useMemo(() => {
    if (!docData) return { isValid: true, issues: [] as string[] };
    const issues: string[] = [];
    docData.lineItems.forEach((item, idx) => {
      const expected = Number((item.quantity * item.unitPrice).toFixed(2));
      if (Math.abs(expected - item.lineTotal) > 0.05) {
        issues.push(
          `Line #${idx + 1}: ${item.quantity} × ${item.unitPrice.toFixed(2)} = ${expected.toFixed(2)}, but stated as ${item.lineTotal.toFixed(2)}`
        );
      }
    });
    const calculatedSubtotal = docData.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (docData.grandTotal > 0 && calculatedSubtotal > 0) {
      const expectedGrand = Number((calculatedSubtotal + docData.taxAmount + docData.shipping).toFixed(2));
      if (Math.abs(expectedGrand - docData.grandTotal) > Math.max(0.05, 0.001 * expectedGrand)) {
        issues.push(
          `Totals: lines sum to ${calculatedSubtotal.toFixed(2)}; with tax + shipping the document should read about ${expectedGrand.toFixed(2)}, but it states ${docData.grandTotal.toFixed(2)}`
        );
      }
    }
    return { isValid: issues.length === 0, issues };
  }, [docData]);

  /* -------------------------------- editing -------------------------------- */

  const addLineItem = () => {
    setDocData((prev) =>
      prev
        ? {
            ...prev,
            lineItems: [
              ...prev.lineItems,
              { id: String(Date.now()), description: "New Item", quantity: 1, unitPrice: 0, lineTotal: 0 },
            ],
          }
        : prev
    );
  };

  const removeLineItem = (id: string) => {
    setDocData((prev) => (prev ? { ...prev, lineItems: prev.lineItems.filter((i) => i.id !== id) } : prev));
  };

  const updateLineItem = (id: string, field: keyof LineItem, val: string | number) => {
    setDocData((prev) => {
      if (!prev) return prev;
      const updated = prev.lineItems.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [field]: val };
        if (field === "quantity" || field === "unitPrice") {
          next.lineTotal = Number((next.quantity * next.unitPrice).toFixed(2));
        }
        return next;
      });
      return { ...prev, lineItems: updated };
    });
  };

  /* -------------------------------- exports -------------------------------- */

  const exportCSV = async () => {
    if (!docData) return;
    try {
      const XLSX = await import("xlsx");
      const rows = docData.lineItems.map((item) => ({
        Document_Type: docData.docType,
        Document_Number: docData.invoiceNumber,
        Issue_Date: docData.issueDate,
        Due_Date: docData.dueDate,
        Currency: docData.currency,
        SKU: item.sku || "",
        Description: item.description,
        Quantity: item.quantity,
        Unit_Price: item.unitPrice,
        Line_Total: item.lineTotal,
        Tax_Amount: docData.taxAmount,
        Grand_Total: docData.grandTotal,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ExtractedData");
      XLSX.writeFile(workbook, `Extracted_${docData.invoiceNumber || fileName || "document"}.csv`);
      onAddToast?.("Exported CSV successfully!", "success");
    } catch {
      onAddToast?.("Could not generate CSV.", "error");
    }
  };

  const exportJSON = () => {
    if (!docData) return;
    const jsonStr = JSON.stringify(docData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Extracted_${docData.invoiceNumber || fileName || "document"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast?.("Exported JSON successfully!", "success");
  };

  const loadSample = () => {
    setDocData(JSON.parse(JSON.stringify(SAMPLE_DOC)));
    setIsDemo(true);
    setParseNote("sample data loaded for exploring the editor and exports");
    setFileName("Sample_Invoice.pdf");
    setRawText("");
  };

  const startFresh = () => {
    setDocData(JSON.parse(JSON.stringify(EMPTY_DOC)));
    setIsDemo(false);
    setParseNote("empty form - fill manually or upload a PDF");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={startFresh}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
        >
          Empty form
        </button>
        <button
          onClick={loadSample}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
        >
          Load sample data
        </button>
      </div>

      {/* Password prompt */}
      {needsPassword && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-status-warning/5 border border-status-warning/30 p-4 rounded-2xl">
          <span className="flex items-center gap-2 text-status-warning text-sm font-semibold">
            <Lock className="w-4 h-4 shrink-0" /> Password required
          </span>
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
            Unlock PDF
          </button>
        </div>
      )}

      {/* Upload bar */}
      <div className="bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0">
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={handleFileUpload} />
          <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border-light flex items-center justify-center text-text-muted group-hover:text-brand-primary group-hover:border-brand-primary/40 transition-colors shrink-0">
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-text-main block truncate">{fileName || "Upload an invoice, PO or receipt (PDF/TXT)"}</span>
            <span className="text-[11px] text-text-muted">
              {isLoading ? "Extracting text…" : "Parsed locally in your browser - files never leave your device"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRawText((v) => !v)}
            disabled={!rawText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer disabled:opacity-50"
          >
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showRawText ? "Hide" : "Show"} raw text</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={!docData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            disabled={!docData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Raw extracted text */}
      {showRawText && rawText && (
        <pre className="bg-surface-base p-4 rounded-2xl border border-border-light text-[11px] font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto text-text-sub">
          {rawText}
        </pre>
      )}

      {!docData ? (
        <div className="bg-surface-base p-10 rounded-2xl border border-border-light flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
          <FileText className="w-8 h-8 text-text-muted/60" />
          <h2 className="font-sans font-semibold text-text-main text-lg">Nothing extracted yet</h2>
          <p className="text-xs text-text-muted max-w-md leading-relaxed">
            Upload a text-based PDF above. Scanned/image-only PDFs contain no selectable text - use the OCR PDF
            tool first for those. Or start with an empty form or the sample data to see how everything works.
          </p>
        </div>
      ) : (
        <>
          {/* Parse status */}
          {parseNote && (
            <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
              validation.isValid ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200" : "bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200"
            }`}>
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
              <span>
                {isDemo && "Sample data - replace with your own PDF anytime. "}
                {parseNote.charAt(0).toUpperCase() + parseNote.slice(1)}.
              </span>
            </div>
          )}

          {/* Validation */}
          {!validation.isValid && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col gap-1 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Math discrepancy detected ({validation.issues.length}):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-6 font-mono text-[11px]">
                {validation.issues.map((iss, idx) => (
                  <li key={idx}>{iss}</li>
                ))}
              </ul>
            </div>
          )}
          {validation.isValid && docData.lineItems.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Financial math verified: line items are internally consistent with the stated totals.</span>
            </div>
          )}

          {/* Metadata grid */}
          <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {([
              ["Document Type", "docType", "text", "Invoice"],
              ["Vendor / Issuer", "vendorName", "text", ""],
              ["Customer / Recipient", "customerName", "text", ""],
              ["Invoice / PO Number", "invoiceNumber", "text", "INV-100"],
              ["Issue Date", "issueDate", "date", ""],
              ["Due Date", "dueDate", "date", ""],
              ["Currency", "currency", "text", "USD"],
              ["Tax Rate (%)", "taxRate", "number", "0"],
            ] as const).map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label htmlFor={`fld-${key}`} className="font-semibold text-text-muted block mb-1">{label}</label>
                <input
                  id={`fld-${key}`}
                  type={type}
                  placeholder={placeholder}
                  value={String(docData[key] ?? "")}
                  onChange={(e) =>
                    setDocData((prev) =>
                      prev
                        ? {
                            ...prev,
                            [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                          }
                        : prev
                    )
                  }
                  className="w-full bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main font-semibold outline-none focus:border-brand-primary"
                />
              </div>
            ))}
          </div>

          {/* Line items */}
          <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-main">Line Items ({docData.lineItems.length})</h3>
              <button
                onClick={addLineItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {docData.lineItems.length === 0 ? (
              <p className="text-xs text-text-muted leading-relaxed bg-surface-muted/40 rounded-lg p-3">
                No line items yet. Automatic detection handles clearly formatted rows (description + qty +
                price + amount); complex layouts often need manual entry - which is exactly what this table is for.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-light text-text-muted font-bold">
                      <th className="pb-2 w-32">SKU / Code</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 w-20 text-center">Qty</th>
                      <th className="pb-2 w-24 text-right">Unit Price</th>
                      <th className="pb-2 w-28 text-right">Total</th>
                      <th className="pb-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/60">
                    {docData.lineItems.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-2.5 pr-2">
                          <input
                            type="text"
                            aria-label="SKU"
                            value={item.sku || ""}
                            placeholder="SKU-100"
                            onChange={(e) => updateLineItem(item.id, "sku", e.target.value)}
                            className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-[11px]"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="text"
                            aria-label="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                            className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-medium"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            aria-label="Quantity"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-center"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            aria-label="Unit price"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-right"
                          />
                        </td>
                        <td className="py-2.5 pr-2 text-right font-mono font-bold text-text-main">
                          {(currencySymbol(docData.currency) + item.lineTotal.toFixed(2))}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            aria-label="Remove line item"
                            className="text-text-muted hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-border-light">
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Sum of lines:</span>
                  <span className="font-mono font-bold text-text-main">
                    {currencySymbol(docData.currency)}{docData.lineItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Tax amount:</span>
                  <input
                    type="number"
                    step="0.01"
                    aria-label="Tax amount"
                    value={docData.taxAmount}
                    onChange={(e) => setDocData((prev) => (prev ? { ...prev, taxAmount: parseFloat(e.target.value) || 0 } : prev))}
                    className="w-24 text-right font-mono font-bold bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main outline-none focus:border-brand-primary"
                  />
                </div>
                {docData.shipping !== 0 && (
                  <div className="flex justify-between text-text-muted">
                    <span>Shipping:</span>
                    <input
                      type="number"
                      step="0.01"
                      aria-label="Shipping"
                      value={docData.shipping}
                      onChange={(e) => setDocData((prev) => (prev ? { ...prev, shipping: parseFloat(e.target.value) || 0 } : prev))}
                      className="w-24 text-right font-mono font-bold bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main outline-none focus:border-brand-primary"
                    />
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-brand-primary pt-2 border-t border-border-light">
                  <span>Stated Total:</span>
                  <input
                    type="number"
                    step="0.01"
                    aria-label="Grand total"
                    value={docData.grandTotal}
                    onChange={(e) => setDocData((prev) => (prev ? { ...prev, grandTotal: parseFloat(e.target.value) || 0 } : prev))}
                    className="w-32 text-right font-mono bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const currencySymbol = (code: string): string => {
  switch (code.toUpperCase()) {
    case "EUR": return "\u20AC";
    case "GBP": return "\u00A3";
    default: return "$";
  }
};
