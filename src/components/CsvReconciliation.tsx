import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  Download, 
  Filter, 
  Settings2, 
  Search, 
  HelpCircle, 
  Layers, 
  Eye, 
  FileText, 
  Sparkles,
  Check,
  Copy,
  ChevronDown
} from "lucide-react";
import { Toast } from "./Common";

interface CsvReconciliationProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: any) => void;
}

interface NormalizationConfig {
  trimWhitespace: boolean;
  caseInsensitive: boolean;
  stripCurrency: boolean;
  normalizeDates: boolean;
  numericTolerance: boolean;
  treatNullsEqual: boolean;
}

interface RowData {
  [key: string]: any;
}

type DiffStatus = "matched" | "changed" | "added" | "removed" | "duplicate";

interface DiffRecord {
  id: string;
  keyVal: string;
  status: DiffStatus;
  rowA?: RowData;
  rowB?: RowData;
  changes: { [col: string]: { valA: any; valB: any } };
}

export const CsvReconciliation: React.FC<CsvReconciliationProps> = ({ onCopy, onAddToast }) => {
  // File states
  const [fileAName, setFileAName] = useState<string>("System_Orders_A.csv");
  const [fileBName, setFileBName] = useState<string>("Warehouse_Shipments_B.csv");
  const [rowsA, setRowsA] = useState<RowData[]>([]);
  const [rowsB, setRowsB] = useState<RowData[]>([]);
  const [headersA, setHeadersA] = useState<string[]>([]);
  const [headersB, setHeadersB] = useState<string[]>([]);

  // Key selection
  const [keyColA, setKeyColA] = useState<string>("");
  const [keyColB, setKeyColB] = useState<string>("");

  // Normalization settings
  const [normalization, setNormalization] = useState<NormalizationConfig>({
    trimWhitespace: true,
    caseInsensitive: true,
    stripCurrency: true,
    normalizeDates: true,
    numericTolerance: true,
    treatNullsEqual: true
  });

  // UI / Filter states
  const [activeFilter, setActiveFilter] = useState<"all" | "differences" | "changed" | "added" | "removed" | "matched" | "duplicate">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedColDiffOnly, setSelectedColDiffOnly] = useState<boolean>(false);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  // Do NOT auto-load sample data - show empty state per Phase 3
  // React.useEffect(() => {
  //   loadSampleData("ecommerce");
  // }, []);

  // Preset sample loader
  const loadSampleData = (preset: "ecommerce" | "finance" | "crm") => {
    if (preset === "ecommerce") {
      const sampleA = [
        { "Order_ID": "ORD-101", "Customer": "Sarah Jenkins", "Amount": "$149.50", "SKU": "EVER-GREEN-01", "Status": "Shipped", "Date": "2026-08-10" },
        { "Order_ID": "ORD-102", "Customer": "Michael Chang", "Amount": "$89.00", "SKU": "EVER-DESK-04", "Status": "Shipped", "Date": "2026-08-11" },
        { "Order_ID": "ORD-103", "Customer": "Emma Watson", "Amount": "$420.00", "SKU": "EVER-CHAIR-09", "Status": "Processing", "Date": "2026-08-11" },
        { "Order_ID": "ORD-104", "Customer": "David Miller", "Amount": "$65.25", "SKU": "EVER-LAMP-02", "Status": "Shipped", "Date": "2026-08-12" },
        { "Order_ID": "ORD-105", "Customer": "Chloe Adams", "Amount": "$230.00", "SKU": "EVER-GREEN-01", "Status": "Refunded", "Date": "2026-08-12" },
        { "Order_ID": "ORD-106", "Customer": "Robert Davis", "Amount": "$12.50", "SKU": "EVER-CABLE-01", "Status": "Delivered", "Date": "2026-08-13" },
      ];

      const sampleB = [
        { "Order_ID": "ORD-101", "Customer": "Sarah Jenkins", "Amount": "149.50", "SKU": "EVER-GREEN-01", "Status": "Delivered", "Date": "2026-08-10" }, // Changed status
        { "Order_ID": "ORD-102", "Customer": "Michael Chang", "Amount": "$89.00", "SKU": "EVER-DESK-04", "Status": "Shipped", "Date": "2026-08-11" }, // Matched
        { "Order_ID": "ORD-103", "Customer": "Emma Watson", "Amount": "$450.00", "SKU": "EVER-CHAIR-09", "Status": "Shipped", "Date": "2026-08-11" }, // Changed amount & status
        { "Order_ID": "ORD-104", "Customer": "David Miller", "Amount": "$65.25", "SKU": "EVER-LAMP-02", "Status": "Shipped", "Date": "2026-08-12" }, // Matched
        { "Order_ID": "ORD-107", "Customer": "Alice Walker", "Amount": "$310.00", "SKU": "EVER-BOOK-05", "Status": "Shipped", "Date": "2026-08-14" }, // Added in B
      ];

      setFileAName("Shopify_Store_Orders.csv");
      setFileBName("3PL_Warehouse_Shipments.csv");
      setRowsA(sampleA);
      setRowsB(sampleB);
      setHeadersA(Object.keys(sampleA[0]));
      setHeadersB(Object.keys(sampleB[0]));
      setKeyColA("Order_ID");
      setKeyColB("Order_ID");
    } else if (preset === "finance") {
      const sampleA = [
        { "Invoice_No": "INV-2026-01", "Client": "Acme Corp", "Gross_Total": "$12,450.00", "Paid_Date": "2026-07-30", "Currency": "USD" },
        { "Invoice_No": "INV-2026-02", "Client": "Globex Inc", "Gross_Total": "$8,200.00", "Paid_Date": "2026-08-01", "Currency": "USD" },
        { "Invoice_No": "INV-2026-03", "Client": "Stark Industries", "Gross_Total": "$45,000.00", "Paid_Date": "2026-08-05", "Currency": "USD" },
        { "Invoice_No": "INV-2026-04", "Client": "Wayne Enterprises", "Gross_Total": "$3,100.00", "Paid_Date": "2026-08-08", "Currency": "USD" }
      ];
      const sampleB = [
        { "Invoice_No": "INV-2026-01", "Client": "Acme Corp", "Gross_Total": "12450.00", "Paid_Date": "2026-07-30", "Currency": "USD" },
        { "Invoice_No": "INV-2026-02", "Client": "Globex Inc", "Gross_Total": "$8,200.00", "Paid_Date": "2026-08-01", "Currency": "USD" },
        { "Invoice_No": "INV-2026-03", "Client": "Stark Industries", "Gross_Total": "$44,500.00", "Paid_Date": "2026-08-05", "Currency": "USD" }, // $500 fee deduction diff
        { "Invoice_No": "INV-2026-05", "Client": "Cyberdyne Systems", "Gross_Total": "$19,000.00", "Paid_Date": "2026-08-15", "Currency": "USD" } // Added in B
      ];
      setFileAName("Accounting_Ledger.xlsx");
      setFileBName("Bank_Deposit_Statement.csv");
      setRowsA(sampleA);
      setRowsB(sampleB);
      setHeadersA(Object.keys(sampleA[0]));
      setHeadersB(Object.keys(sampleB[0]));
      setKeyColA("Invoice_No");
      setKeyColB("Invoice_No");
    } else {
      const sampleA = [
        { "Email": "alex@startup.io", "Plan": "Pro", "Seats": "5", "MRR": "$250", "Country": "US" },
        { "Email": "elena@design.co", "Plan": "Enterprise", "Seats": "20", "MRR": "$1,200", "Country": "DE" },
        { "Email": "marcus@code.dev", "Plan": "Starter", "Seats": "1", "MRR": "$29", "Country": "UK" },
      ];
      const sampleB = [
        { "Email": "alex@startup.io", "Plan": "Pro", "Seats": "5", "MRR": "$250.00", "Country": "United States" },
        { "Email": "elena@design.co", "Plan": "Enterprise", "Seats": "25", "MRR": "$1,500", "Country": "DE" }, // Upgraded seats
        { "Email": "sophia@ai.org", "Plan": "Pro", "Seats": "10", "MRR": "$500", "Country": "CA" } // New customer
      ];
      setFileAName("HubSpot_CRM_Export.csv");
      setFileBName("Stripe_Active_Subscriptions.csv");
      setRowsA(sampleA);
      setRowsB(sampleB);
      setHeadersA(Object.keys(sampleA[0]));
      setHeadersB(Object.keys(sampleB[0]));
      setKeyColA("Email");
      setKeyColB("Email");
    }
  };

  // Helper to parse file (CSV or XLSX)
  const parseSpreadsheetFile = async (file: File): Promise<{ rows: RowData[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary", cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          if (!json || json.length === 0) {
            reject(new Error("The selected spreadsheet contains no data rows."));
            return;
          }
          
          const headers = Object.keys(json[0]);
          resolve({ rows: json, headers });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  };

  // Detect likely key column
  const detectPrimaryKey = (headers: string[]): string => {
    const priorityKeywords = ["id", "order_id", "orderid", "invoice", "invoiceno", "email", "sku", "code", "key", "number", "uuid", "account"];
    for (const kw of priorityKeywords) {
      const match = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, "").includes(kw));
      if (match) return match;
    }
    return headers[0] || "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "A" | "B") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { rows, headers } = await parseSpreadsheetFile(file);
      if (target === "A") {
        setFileAName(file.name);
        setRowsA(rows);
        setHeadersA(headers);
        const autoKey = detectPrimaryKey(headers);
        setKeyColA(autoKey);
      } else {
        setFileBName(file.name);
        setRowsB(rows);
        setHeadersB(headers);
        const autoKey = detectPrimaryKey(headers);
        setKeyColB(autoKey);
      }
      onAddToast?.(`Loaded ${file.name} (${rows.length} rows, ${headers.length} columns)`, "success");
    } catch (err: any) {
      onAddToast?.(err?.message || "Failed to parse file. Please verify CSV/XLSX format.", "error");
    }
    // Reset file input
    e.target.value = "";
  };

  // Value normalization function
  const normalizeValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    let str = String(val);

    if (normalization.trimWhitespace) {
      str = str.trim();
    }

    if (normalization.treatNullsEqual) {
      const lower = str.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "n/a" || lower === "none" || lower === "-") {
        return "";
      }
    }

    if (normalization.stripCurrency) {
      // If it looks like a currency number like "$1,450.00" -> "1450"
      const cleanNum = str.replace(/[$,€£¥\s]/g, "");
      const parsedNum = parseFloat(cleanNum);
      if (!isNaN(parsedNum) && /^[+-]?[0-9]*\.?[0-9]+$/.test(cleanNum)) {
        str = parsedNum.toFixed(2).replace(/\.00$/, "");
      }
    }

    if (normalization.normalizeDates) {
      // If valid date string, normalize to ISO YYYY-MM-DD
      const dateObj = new Date(str);
      if (!isNaN(dateObj.getTime()) && str.length >= 8 && /\d/.test(str) && (str.includes("-") || str.includes("/") || str.includes("."))) {
        // Format to YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        str = `${year}-${month}-${day}`;
      }
    }

    if (normalization.caseInsensitive) {
      str = str.toLowerCase();
    }

    return str;
  };

  // All combined column headers for view
  const allHeaders = useMemo(() => {
    const set = new Set<string>();
    headersA.forEach(h => set.add(h));
    headersB.forEach(h => set.add(h));
    return Array.from(set);
  }, [headersA, headersB]);

  // Main Reconciliation Engine
  const reconciliation = useMemo(() => {
    if (!keyColA || !keyColB || rowsA.length === 0 || rowsB.length === 0) {
      return {
        records: [] as DiffRecord[],
        stats: { totalA: rowsA.length, totalB: rowsB.length, matched: 0, changed: 0, added: 0, removed: 0, duplicates: 0 }
      };
    }

    const mapA = new Map<string, RowData[]>();
    const mapB = new Map<string, RowData[]>();

    // Index File A
    rowsA.forEach((row) => {
      const rawKey = row[keyColA];
      const normKey = normalizeValue(rawKey);
      if (!normKey) return;
      if (!mapA.has(normKey)) mapA.set(normKey, []);
      mapA.get(normKey)!.push(row);
    });

    // Index File B
    rowsB.forEach((row) => {
      const rawKey = row[keyColB];
      const normKey = normalizeValue(rawKey);
      if (!normKey) return;
      if (!mapB.has(normKey)) mapB.set(normKey, []);
      mapB.get(normKey)!.push(row);
    });

    const records: DiffRecord[] = [];
    const processedKeys = new Set<string>();

    let countMatched = 0;
    let countChanged = 0;
    let countAdded = 0;
    let countRemoved = 0;
    let countDuplicates = 0;

    // Check records in A vs B
    mapA.forEach((rowsListA, keyVal) => {
      processedKeys.add(keyVal);
      const rowsListB = mapB.get(keyVal);

      // Check duplicates
      const isDup = rowsListA.length > 1 || (rowsListB && rowsListB.length > 1);
      if (isDup) countDuplicates++;

      if (!rowsListB || rowsListB.length === 0) {
        // In A but not in B -> Removed
        countRemoved += rowsListA.length;
        rowsListA.forEach((rA, idx) => {
          records.push({
            id: `rem-${keyVal}-${idx}`,
            keyVal,
            status: isDup ? "duplicate" : "removed",
            rowA: rA,
            rowB: undefined,
            changes: {}
          });
        });
      } else {
        // In both -> Compare fields
        const rA = rowsListA[0];
        const rB = rowsListB[0];

        const changes: { [col: string]: { valA: any; valB: any } } = {};
        let hasChanges = false;

        allHeaders.forEach(col => {
          const valA = rA[col];
          const valB = rB[col];
          const normA = normalizeValue(valA);
          const normB = normalizeValue(valB);

          if (normA !== normB) {
            changes[col] = { valA, valB };
            hasChanges = true;
          }
        });

        if (hasChanges) {
          countChanged++;
          records.push({
            id: `chg-${keyVal}`,
            keyVal,
            status: isDup ? "duplicate" : "changed",
            rowA: rA,
            rowB: rB,
            changes
          });
        } else {
          countMatched++;
          records.push({
            id: `mat-${keyVal}`,
            keyVal,
            status: isDup ? "duplicate" : "matched",
            rowA: rA,
            rowB: rB,
            changes: {}
          });
        }
      }
    });

    // Check records in B not processed yet (Added in B)
    mapB.forEach((rowsListB, keyVal) => {
      if (!processedKeys.has(keyVal)) {
        countAdded += rowsListB.length;
        const isDup = rowsListB.length > 1;
        if (isDup) countDuplicates++;

        rowsListB.forEach((rB, idx) => {
          records.push({
            id: `add-${keyVal}-${idx}`,
            keyVal,
            status: isDup ? "duplicate" : "added",
            rowA: undefined,
            rowB: rB,
            changes: {}
          });
        });
      }
    });

    return {
      records,
      stats: {
        totalA: rowsA.length,
        totalB: rowsB.length,
        matched: countMatched,
        changed: countChanged,
        added: countAdded,
        removed: countRemoved,
        duplicates: countDuplicates
      }
    };
  }, [rowsA, rowsB, keyColA, keyColB, normalization, allHeaders]);

  // Filtered records for display
  const displayedRecords = useMemo(() => {
    return reconciliation.records.filter(record => {
      // Status filter
      if (activeFilter === "differences") {
        if (record.status === "matched") return false;
      } else if (activeFilter !== "all" && record.status !== activeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const keyMatch = record.keyVal.toLowerCase().includes(q);
        const rowAMatch = record.rowA && Object.values(record.rowA).some(v => String(v).toLowerCase().includes(q));
        const rowBMatch = record.rowB && Object.values(record.rowB).some(v => String(v).toLowerCase().includes(q));
        return keyMatch || rowAMatch || rowBMatch;
      }

      return true;
    });
  }, [reconciliation.records, activeFilter, searchQuery]);

  // Export Results to CSV
  const exportToCSV = (onlyDiffs: boolean = false) => {
    const itemsToExport = onlyDiffs 
      ? reconciliation.records.filter(r => r.status !== "matched") 
      : reconciliation.records;

    if (itemsToExport.length === 0) {
      onAddToast?.("No records to export with current filter.", "warning");
      return;
    }

    const exportRows = itemsToExport.map(rec => {
      const row: any = {
        "Reconciliation_Status": rec.status.toUpperCase(),
        "Key_Identifier": rec.keyVal
      };

      allHeaders.forEach(col => {
        if (rec.changes[col]) {
          row[`${col} (File A)`] = rec.changes[col].valA ?? "";
          row[`${col} (File B)`] = rec.changes[col].valB ?? "";
          row[`${col} (Difference)`] = "CHANGED";
        } else {
          row[col] = rec.rowB?.[col] ?? rec.rowA?.[col] ?? "";
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reconciliation");
    XLSX.writeFile(workbook, `Reconciliation_Report_${new Date().toISOString().split("T")[0]}.csv`);
    onAddToast?.("Exported reconciliation CSV successfully!", "success");
  };

  // Export Audit Report (Human-readable Markdown/Text)
  const downloadAuditReport = () => {
    const { stats } = reconciliation;
    const matchPct = stats.totalA > 0 ? ((stats.matched / stats.totalA) * 100).toFixed(1) : "0";

    const content = [
      `=============================================================`,
      `GAINUTILITY SUITE - RECONCILIATION AUDIT REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `File A: ${fileAName} (${stats.totalA} rows) | Key: ${keyColA}`,
      `File B: ${fileBName} (${stats.totalB} rows) | Key: ${keyColB}`,
      `=============================================================`,
      ``,
      `EXECUTIVE SUMMARY:`,
      `-------------------------------------------------------------`,
      `- Total Records File A:     ${stats.totalA}`,
      `- Total Records File B:     ${stats.totalB}`,
      `- Identical Match Rate:     ${matchPct}% (${stats.matched} records)`,
      `- Value Modifications:      ${stats.changed} records`,
      `- Added Records (In B only): ${stats.added} records`,
      `- Removed Records (In A only): ${stats.removed} records`,
      `- Duplicate Keys Flagged:   ${stats.duplicates} records`,
      ``,
      `NORMALIZATION POLICIES APPLIED:`,
      `-------------------------------------------------------------`,
      `- Case Insensitive: ${normalization.caseInsensitive ? "YES" : "NO"}`,
      `- Trim Whitespace: ${normalization.trimWhitespace ? "YES" : "NO"}`,
      `- Strip Currency/Number Symbols: ${normalization.stripCurrency ? "YES" : "NO"}`,
      `- Normalize Date Formats: ${normalization.normalizeDates ? "YES" : "NO"}`,
      ``,
      `ITEMIZED DISCREPANCIES (${reconciliation.records.filter(r => r.status !== "matched").length} items):`,
      `-------------------------------------------------------------`,
      ...reconciliation.records
        .filter(r => r.status !== "matched")
        .map((r, i) => {
          const changeDetails = Object.entries(r.changes)
            .map(([col, diff]) => `    * ${col}: [A: "${(diff as any).valA ?? ''}"] -> [B: "${(diff as any).valB ?? ''}"]`)
            .join("\n");
          return `[${i + 1}] Status: ${r.status.toUpperCase()} | Key: ${r.keyVal}\n${changeDetails || "    (Record presence discrepancy)"}`;
        }),
      ``,
      `=============================================================`,
      `End of Reconciliation Report - Verified with GainUtility Sandbox.`
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reconciliation_Audit_Summary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onAddToast?.("Audit report downloaded.", "success");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Preset quick loaders (labeled as examples) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-muted">Try Examples:</span>
        <button
          onClick={() => loadSampleData("ecommerce")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light hover:border-brand-primary/40 text-text-main transition-colors cursor-pointer"
        >
          Orders vs Shipping (Example)
        </button>
        <button
          onClick={() => loadSampleData("finance")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light hover:border-brand-primary/40 text-text-main transition-colors cursor-pointer"
        >
          Invoices vs Bank (Example)
        </button>
        <button
          onClick={() => loadSampleData("crm")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface-base border border-border-light hover:border-brand-primary/40 text-text-main transition-colors cursor-pointer"
        >
          CRM vs Stripe (Example)
        </button>
      </div>

      {/* 2. File Upload & Primary Key Setup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File A Upload Card */}
        <div className="bg-surface-base p-5 rounded-2xl border border-border-light flex flex-col gap-4 shadow-premium-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/20">
                A
              </span>
              <span className="font-bold text-sm text-text-main">Original Spreadsheet (File A)</span>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {rowsA.length} rows • {headersA.length} cols
            </span>
          </div>

          <div 
            onClick={() => fileInputARef.current?.click()}
            className="border-2 border-dashed border-border-light hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-surface-muted/30 group"
          >
            <input 
              ref={fileInputARef}
              type="file" 
              accept=".csv,.xlsx,.xls,.tsv" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "A")} 
            />
            <Upload className="w-5 h-5 text-text-muted group-hover:text-blue-500 transition-colors" />
            <div className="text-xs">
              <span className="font-bold text-text-main truncate max-w-[240px] inline-block align-bottom">{fileAName}</span>
              <span className="text-text-muted block mt-0.5">Click or drag & drop CSV or XLSX</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-light/60">
            <label className="text-xs font-semibold text-text-muted whitespace-nowrap" htmlFor="csv-reconciliation-primary-key-a">Primary Key (A):</label>
            <select
              value={keyColA}
              onChange={(e) => setKeyColA(e.target.value)}
              className="flex-1 text-xs font-mono font-bold bg-surface-muted border border-border-light rounded-lg px-2.5 py-1.5 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
             id="csv-reconciliation-primary-key-a">
              {headersA.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File B Upload Card */}
        <div className="bg-surface-base p-5 rounded-2xl border border-border-light flex flex-col gap-4 shadow-premium-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                B
              </span>
              <span className="font-bold text-sm text-text-main">Revised / Comparison (File B)</span>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {rowsB.length} rows • {headersB.length} cols
            </span>
          </div>

          <div 
            onClick={() => fileInputBRef.current?.click()}
            className="border-2 border-dashed border-border-light hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-surface-muted/30 group"
          >
            <input 
              ref={fileInputBRef}
              type="file" 
              accept=".csv,.xlsx,.xls,.tsv" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "B")} 
            />
            <Upload className="w-5 h-5 text-text-muted group-hover:text-emerald-500 transition-colors" />
            <div className="text-xs">
              <span className="font-bold text-text-main truncate max-w-[240px] inline-block align-bottom">{fileBName}</span>
              <span className="text-text-muted block mt-0.5">Click or drag & drop CSV or XLSX</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border-light/60">
            <label className="text-xs font-semibold text-text-muted whitespace-nowrap" htmlFor="csv-reconciliation-primary-key-b">Primary Key (B):</label>
            <select
              value={keyColB}
              onChange={(e) => setKeyColB(e.target.value)}
              className="flex-1 text-xs font-mono font-bold bg-surface-muted border border-border-light rounded-lg px-2.5 py-1.5 text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
             id="csv-reconciliation-primary-key-b">
              {headersB.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Normalization Rules Drawer / Toggles */}
      <div className="bg-surface-base p-4 rounded-xl border border-border-light">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs font-bold text-text-main hover:text-brand-primary cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-brand-primary" />
            <span>Comparison Normalization Rules ({Object.values(normalization).filter(Boolean).length} Active)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettings ? "rotate-180" : ""}`} />
          </button>

          <span className="text-[11px] text-text-muted">
            Ignores minor formatting differences to prevent false positive flags
          </span>
        </div>

        {showSettings && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-border-light/60 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={normalization.trimWhitespace}
                onChange={(e) => setNormalization(prev => ({ ...prev, trimWhitespace: e.target.checked }))}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
              <span>Trim Whitespace</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={normalization.caseInsensitive}
                onChange={(e) => setNormalization(prev => ({ ...prev, caseInsensitive: e.target.checked }))}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
              <span>Case Insensitive</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={normalization.stripCurrency}
                onChange={(e) => setNormalization(prev => ({ ...prev, stripCurrency: e.target.checked }))}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
              <span>Normalize Currency ($1,000 → 1000)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={normalization.normalizeDates}
                onChange={(e) => setNormalization(prev => ({ ...prev, normalizeDates: e.target.checked }))}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
              <span>Normalize Dates (YYYY-MM-DD)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={normalization.treatNullsEqual}
                onChange={(e) => setNormalization(prev => ({ ...prev, treatNullsEqual: e.target.checked }))}
                className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
              />
              <span>Treat null, N/A, and empty equal</span>
            </label>
          </div>
        )}
      </div>

      {/* 4. Executive Summary KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Matched */}
        <div 
          onClick={() => setActiveFilter("matched")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "matched" 
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Matched</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {reconciliation.stats.matched}
          </div>
          <span className="text-[10px] text-text-muted">Identical records</span>
        </div>

        {/* Changed */}
        <div 
          onClick={() => setActiveFilter("changed")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "changed" 
              ? "bg-amber-500/10 border-amber-500/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Changed</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {reconciliation.stats.changed}
          </div>
          <span className="text-[10px] text-text-muted">Mismatched values</span>
        </div>

        {/* Added */}
        <div 
          onClick={() => setActiveFilter("added")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "added" 
              ? "bg-blue-500/10 border-blue-500/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-blue-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Added (B)</span>
            <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {reconciliation.stats.added}
          </div>
          <span className="text-[10px] text-text-muted">New in File B</span>
        </div>

        {/* Removed */}
        <div 
          onClick={() => setActiveFilter("removed")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "removed" 
              ? "bg-red-500/10 border-red-500/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-red-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Removed (A)</span>
            <MinusCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
            {reconciliation.stats.removed}
          </div>
          <span className="text-[10px] text-text-muted">Missing in File B</span>
        </div>

        {/* Duplicates */}
        <div 
          onClick={() => setActiveFilter("duplicate")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "duplicate" 
              ? "bg-purple-500/10 border-purple-500/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Duplicates</span>
            <Layers className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {reconciliation.stats.duplicates}
          </div>
          <span className="text-[10px] text-text-muted">Repeated keys</span>
        </div>

        {/* Total Records Difference */}
        <div 
          onClick={() => setActiveFilter("all")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            activeFilter === "all" 
              ? "bg-brand-primary-light/40 border-brand-primary/40 shadow-sm" 
              : "bg-surface-base border-border-light hover:border-brand-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted">Net Rows Diff</span>
            <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-xl font-bold font-mono text-text-main mt-1">
            {reconciliation.stats.totalB - reconciliation.stats.totalA >= 0 ? `+${reconciliation.stats.totalB - reconciliation.stats.totalA}` : `${reconciliation.stats.totalB - reconciliation.stats.totalA}`}
          </div>
          <span className="text-[10px] text-text-muted">{reconciliation.records.length} total keys</span>
        </div>
      </div>

      {/* 5. Filter Toolbar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-base p-4 rounded-2xl border border-border-light shadow-premium-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "all" ? "bg-brand-primary text-surface-base" : "bg-surface-muted text-text-sub hover:bg-surface-muted/80"
            }`}
          >
            All ({reconciliation.records.length})
          </button>
          <button
            onClick={() => setActiveFilter("differences")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "differences" ? "bg-brand-primary text-surface-base" : "bg-surface-muted text-text-sub hover:bg-surface-muted/80"
            }`}
          >
            Differences ({reconciliation.stats.changed + reconciliation.stats.added + reconciliation.stats.removed})
          </button>
          <button
            onClick={() => setActiveFilter("changed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "changed" ? "bg-amber-600 text-white" : "bg-surface-muted text-text-sub hover:bg-surface-muted/80"
            }`}
          >
            Changed ({reconciliation.stats.changed})
          </button>
          <button
            onClick={() => setActiveFilter("added")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "added" ? "bg-blue-600 text-white" : "bg-surface-muted text-text-sub hover:bg-surface-muted/80"
            }`}
          >
            Added ({reconciliation.stats.added})
          </button>
          <button
            onClick={() => setActiveFilter("removed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "removed" ? "bg-red-600 text-white" : "bg-surface-muted text-text-sub hover:bg-surface-muted/80"
            }`}
          >
            Removed ({reconciliation.stats.removed})
          </button>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-surface-muted border border-border-light rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary w-40 sm:w-48"
            />
          </div>

          <button
            onClick={() => exportToCSV(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light hover:border-brand-primary/30 text-text-main transition-colors cursor-pointer whitespace-nowrap"
            title="Export full reconciliation table to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={downloadAuditReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors cursor-pointer whitespace-nowrap"
            title="Download formatted text audit summary report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>

      {/* 6. Filterable Difference Table */}
      <div className="bg-surface-base rounded-2xl border border-border-light shadow-premium-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-surface-muted/95 backdrop-blur z-10 border-b border-border-light">
              <tr>
                <th className="p-3 font-bold text-text-main whitespace-nowrap w-24">Status</th>
                <th className="p-3 font-bold text-text-main whitespace-nowrap">Primary Key</th>
                {allHeaders.map(col => (
                  <th key={col} className="p-3 font-bold text-text-main whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/60">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={allHeaders.length + 2} className="p-8 text-center text-text-muted">
                    No matching records found for the current filter.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((rec) => {
                  return (
                    <tr 
                      key={rec.id}
                      className={`hover:bg-surface-muted/40 transition-colors ${
                        rec.status === "changed" ? "bg-amber-500/[0.03]" :
                        rec.status === "added" ? "bg-blue-500/[0.03]" :
                        rec.status === "removed" ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      {/* Status Tag */}
                      <td className="p-3 whitespace-nowrap">
                        {rec.status === "matched" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Matched
                          </span>
                        )}
                        {rec.status === "changed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                            <AlertTriangle className="w-2.5 h-2.5" /> Changed
                          </span>
                        )}
                        {rec.status === "added" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                            <PlusCircle className="w-2.5 h-2.5" /> Added (B)
                          </span>
                        )}
                        {rec.status === "removed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px]">
                            <MinusCircle className="w-2.5 h-2.5" /> Removed (A)
                          </span>
                        )}
                        {rec.status === "duplicate" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                            <Layers className="w-2.5 h-2.5" /> Duplicate
                          </span>
                        )}
                      </td>

                      {/* Primary Key Value */}
                      <td className="p-3 font-mono font-bold text-text-main whitespace-nowrap">
                        {rec.keyVal}
                      </td>

                      {/* Columns */}
                      {allHeaders.map(col => {
                        const change = rec.changes[col];
                        const valA = rec.rowA?.[col];
                        const valB = rec.rowB?.[col];

                        if (change) {
                          return (
                            <td key={col} className="p-3 bg-amber-500/10 font-mono">
                              <div className="flex flex-col gap-0.5">
                                <span className="line-through text-red-600/80 dark:text-red-400/80 text-[11px]">
                                  {change.valA ?? "<empty>"}
                                </span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                  {change.valB ?? "<empty>"}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Regular cell
                        const displayVal = valB ?? valA ?? "";
                        return (
                          <td 
                            key={col} 
                            className={`p-3 text-text-sub font-mono truncate max-w-[200px] ${
                              rec.status === "removed" ? "text-red-600/70 line-through" :
                              rec.status === "added" ? "text-blue-600 dark:text-blue-400 font-semibold" : ""
                            }`}
                          >
                            {String(displayVal)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
