import React, { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  FileText, 
  Sparkles, 
  Calendar, 
  User, 
  FolderKanban, 
  Receipt, 
  Check, 
  AlertCircle,
  Copy,
  ChevronDown
} from "lucide-react";
import { Toast } from "./Common";

interface BillableHoursCalculatorProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: any) => void;
}

interface TimeEntry {
  id: string;
  date: string;
  description: string;
  hours: number;
  rate: number;
  category: string;
  billable: boolean;
}

interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  billable: boolean;
  markupPct: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "Euro (€)" },
  { code: "GBP", symbol: "£", name: "British Pound (£)" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar (CA$)" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar (AU$)" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen (¥)" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc (CHF)" },
  { code: "INR", symbol: "₹", name: "Indian Rupee (₹)" }
];

export const BillableHoursCalculator: React.FC<BillableHoursCalculatorProps> = ({ onCopy, onAddToast }) => {
  // General invoice metadata
  const [clientName, setClientName] = useState<string>("Acme Global Ventures");
  const [clientEmail, setClientEmail] = useState<string>("billing@acmeglobal.com");
  const [projectTitle, setProjectTitle] = useState<string>("Brand Redesign & Web Platform");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("INV-2026-084");
  const [currency, setCurrency] = useState<string>("USD");
  const [defaultRate, setDefaultRate] = useState<number>(125);
  const [taxPct, setTaxPct] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>("Payment due within 14 days via Bank Wire or Stripe.");

  // Entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { id: "t1", date: "2026-08-03", description: "Design System Tokens & Figma Architecture", hours: 6.5, rate: 125, category: "Design", billable: true },
    { id: "t2", date: "2026-08-04", description: "React / Vite Frontend Component Implementation", hours: 8.0, rate: 125, category: "Engineering", billable: true },
    { id: "t3", date: "2026-08-05", description: "Database Schema Setup & REST API Routes", hours: 7.5, rate: 125, category: "Engineering", billable: true },
    { id: "t4", date: "2026-08-06", description: "Internal Project Setup & Workspace Sync (Admin)", hours: 1.5, rate: 125, category: "Admin", billable: false }
  ]);

  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([
    { id: "e1", date: "2026-08-03", description: "Enterprise Web Fonts License (Commercial)", amount: 149.00, category: "Software", billable: true, markupPct: 0 },
    { id: "e2", date: "2026-08-05", description: "Staging Cloud Server Hosting (1 Month)", amount: 45.00, category: "Hosting", billable: true, markupPct: 10 }
  ]);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const curSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || "$";

  // Financial calculations
  const totals = useMemo(() => {
    let totalHoursLogged = 0;
    let totalBillableHours = 0;
    let totalLaborAmount = 0;

    timeEntries.forEach(t => {
      totalHoursLogged += t.hours;
      if (t.billable) {
        totalBillableHours += t.hours;
        totalLaborAmount += t.hours * t.rate;
      }
    });

    let totalExpenses = 0;
    let totalBillableExpenses = 0;

    expenseEntries.forEach(e => {
      totalExpenses += e.amount;
      if (e.billable) {
        const markup = (e.amount * e.markupPct) / 100;
        totalBillableExpenses += e.amount + markup;
      }
    });

    const subtotal = totalLaborAmount + totalBillableExpenses;
    const taxAmount = (subtotal * taxPct) / 100;
    const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

    return {
      totalHoursLogged,
      totalBillableHours,
      totalLaborAmount,
      totalExpenses,
      totalBillableExpenses,
      subtotal,
      taxAmount,
      grandTotal
    };
  }, [timeEntries, expenseEntries, taxPct, discountAmount]);

  // Add new time entry
  const addTimeEntry = () => {
    const today = new Date().toISOString().split("T")[0];
    setTimeEntries(prev => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        date: today,
        description: "",
        hours: 1.0,
        rate: defaultRate,
        category: "General",
        billable: true
      }
    ]);
  };

  // Add new expense entry
  const addExpenseEntry = () => {
    const today = new Date().toISOString().split("T")[0];
    setExpenseEntries(prev => [
      ...prev,
      {
        id: `e-${Date.now()}`,
        date: today,
        description: "",
        amount: 0,
        category: "Software",
        billable: true,
        markupPct: 0
      }
    ]);
  };

  const removeTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(t => t.id !== id));
  };

  const removeExpenseEntry = (id: string) => {
    setExpenseEntries(prev => prev.filter(e => e.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const timeRows = timeEntries.map(t => ({
      Type: "TIME",
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Hours: t.hours,
      Rate: t.rate,
      Billable: t.billable ? "YES" : "NO",
      Total: t.billable ? (t.hours * t.rate).toFixed(2) : "0.00"
    }));

    const expenseRows = expenseEntries.map(e => ({
      Type: "EXPENSE",
      Date: e.date,
      Description: e.description,
      Category: e.category,
      Hours: "N/A",
      Rate: "N/A",
      Billable: e.billable ? "YES" : "NO",
      Total: e.billable ? (e.amount * (1 + e.markupPct / 100)).toFixed(2) : "0.00"
    }));

    const all = [...timeRows, ...expenseRows];
    const headers = Object.keys(all[0]).join(",");
    const rows = all.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Billable_Report_${invoiceNumber || "Draft"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onAddToast?.("Exported billable report CSV!", "success");
  };

  return (
    <div className="flex flex-col gap-6">
{/* View mode toggle & actions */}
      <div className="flex items-center gap-2">
          <div className="flex bg-surface-muted p-1 rounded-xl border border-border-light">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "editor" ? "bg-surface-base text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Time Tracker Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview" ? "bg-surface-base text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Client Invoice Preview
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Billable Hours</span>
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-main mt-1">
            {totals.totalBillableHours.toFixed(1)} <span className="text-xs text-text-muted font-normal">/ {totals.totalHoursLogged.toFixed(1)} hrs</span>
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Labor Amount</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {curSymbol}{totals.totalLaborAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Reimbursable Expenses</span>
            <Receipt className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {curSymbol}{totals.totalBillableExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-brand-primary/40 bg-brand-primary-light/10 shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Grand Total Due</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-primary mt-1">
            {curSymbol}{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {activeTab === "editor" ? (
        <>
          {/* 3. Client & Project Metadata Config */}
          <div className="bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-text-muted block mb-1" htmlFor="billable-hours-calculator-client-company-name">Client / Company Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main font-medium focus:ring-1 focus:ring-brand-primary"
              id="billable-hours-calculator-client-company-name"/>
            </div>

            <div>
              <label className="font-semibold text-text-muted block mb-1" htmlFor="billable-hours-calculator-project-name">Project Name</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main font-medium focus:ring-1 focus:ring-brand-primary"
              id="billable-hours-calculator-project-name"/>
            </div>

            <div>
              <label className="font-semibold text-text-muted block mb-1" htmlFor="billable-hours-calculator-invoice-ref">Invoice / Ref #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main font-mono focus:ring-1 focus:ring-brand-primary"
              id="billable-hours-calculator-invoice-ref"/>
            </div>

            <div>
              <label className="font-semibold text-text-muted block mb-1" htmlFor="billable-hours-calculator-currency">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main font-medium focus:ring-1 focus:ring-brand-primary"
               id="billable-hours-calculator-currency">
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Time Entries Table */}
          <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-sm text-text-main">Hourly Time Logs</h3>
              </div>

              <button
                onClick={addTimeEntry}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Entry</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border-light text-text-muted font-bold">
                    <th className="pb-2 w-28">Date</th>
                    <th className="pb-2">Task Description</th>
                    <th className="pb-2 w-28">Category</th>
                    <th className="pb-2 w-20">Hours</th>
                    <th className="pb-2 w-24">Rate ({curSymbol})</th>
                    <th className="pb-2 w-20">Billable</th>
                    <th className="pb-2 w-24 text-right">Subtotal</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                  {timeEntries.map((entry, idx) => (
                    <tr key={entry.id} className="group">
                      <td className="py-2.5 pr-2">
                        <input aria-label="Time entry date"
                          type="date"
                          value={entry.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, date: val } : t));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-[11px]"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="text"
                          value={entry.description}
                          placeholder="e.g. Frontend UI Development..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, description: val } : t));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-medium"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Time entry category"
                          type="text"
                          value={entry.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, category: val } : t));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Time entry hours"
                          type="number"
                          step="0.25"
                          min="0"
                          value={entry.hours}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, hours: val } : t));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-center"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Time entry rate"
                          type="number"
                          min="0"
                          value={entry.rate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, rate: val } : t));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-right"
                        />
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <input aria-label="Time entry billable"
                          type="checkbox"
                          checked={entry.billable}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setTimeEntries(prev => prev.map(t => t.id === entry.id ? { ...t, billable: val } : t));
                          }}
                          className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
                        />
                      </td>
                      <td className="py-2.5 pr-2 text-right font-mono font-bold text-text-main">
                        {entry.billable ? `${curSymbol}${(entry.hours * entry.rate).toFixed(2)}` : <span className="text-text-muted font-normal">Non-billable</span>}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => removeTimeEntry(entry.id)}
                          aria-label={`Remove time entry dated ${entry.date}`}
                          className="text-text-muted hover:text-red-500 transition-colors p-2 -m-1 inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Expense Entries Table */}
          <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-text-main">Direct Project Expenses & Reimbursables</h3>
              </div>

              <button
                onClick={addExpenseEntry}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border-light text-text-muted font-bold">
                    <th className="pb-2 w-28">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 w-28">Category</th>
                    <th className="pb-2 w-24">Amount ({curSymbol})</th>
                    <th className="pb-2 w-20">Markup %</th>
                    <th className="pb-2 w-20">Billable</th>
                    <th className="pb-2 w-24 text-right">Total</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                  {expenseEntries.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Expense date"
                          type="date"
                          value={exp.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, date: val } : x));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-[11px]"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="text"
                          value={exp.description}
                          placeholder="e.g. SSL Certificate / Cloud Hosting..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, description: val } : x));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-medium"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Expense category"
                          type="text"
                          value={exp.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, category: val } : x));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Expense amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={exp.amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, amount: val } : x));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-right"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input aria-label="Expense markup percent"
                          type="number"
                          min="0"
                          value={exp.markupPct}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, markupPct: val } : x));
                          }}
                          className="w-full bg-surface-muted border border-border-light rounded px-2 py-1 text-text-main font-mono text-center"
                        />
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <input aria-label="Expense billable"
                          type="checkbox"
                          checked={exp.billable}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setExpenseEntries(prev => prev.map(x => x.id === exp.id ? { ...x, billable: val } : x));
                          }}
                          className="rounded border-border-light text-brand-primary focus:ring-brand-primary"
                        />
                      </td>
                      <td className="py-2.5 pr-2 text-right font-mono font-bold text-text-main">
                        {exp.billable ? `${curSymbol}${(exp.amount * (1 + exp.markupPct / 100)).toFixed(2)}` : <span className="text-text-muted font-normal">Internal</span>}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => removeExpenseEntry(exp.id)}
                          aria-label={`Remove expense dated ${exp.date}`}
                          className="text-text-muted hover:text-red-500 transition-colors p-2 -m-1 inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* 6. Clean Client-Ready Invoice Preview */
        <div className="bg-surface-base p-8 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-6 font-sans print:p-0 print:border-none print:shadow-none">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border-light">
            <div>
              <h2 className="text-2xl font-black font-sans text-text-main tracking-tight">BILLABLE HOURS INVOICE</h2>
              <div className="text-xs text-text-muted mt-1 space-y-0.5">
                <p>Project: <span className="font-semibold text-text-main">{projectTitle}</span></p>
                <p>Invoice Ref: <span className="font-mono font-bold text-text-main">{invoiceNumber}</span></p>
                <p>Date: <span className="font-mono">{new Date().toLocaleDateString()}</span></p>
              </div>
            </div>

            <div className="text-right sm:max-w-xs">
              <span className="text-xs uppercase font-bold text-text-muted">Billed To</span>
              <h4 className="text-base font-bold text-text-main mt-0.5">{clientName}</h4>
              <p className="text-xs text-text-muted">{clientEmail}</p>
            </div>
          </div>

          {/* Time logs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Itemized Professional Services</h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-light font-bold text-text-main">
                  <th className="py-2">Date</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Hours</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60">
                {timeEntries.filter(t => t.billable).map(t => (
                  <tr key={t.id}>
                    <td className="py-2.5 font-mono text-text-muted">{t.date}</td>
                    <td className="py-2.5 text-text-main font-medium">{t.description}</td>
                    <td className="py-2.5 text-right font-mono">{t.hours.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono">{curSymbol}{t.rate.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono font-bold">{curSymbol}{(t.hours * t.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expenses */}
          {expenseEntries.some(e => e.billable) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Reimbursable Project Expenses</h4>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-light font-bold text-text-main">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {expenseEntries.filter(e => e.billable).map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 font-mono text-text-muted">{e.date}</td>
                      <td className="py-2.5 text-text-main font-medium">{e.description}</td>
                      <td className="py-2.5 text-text-muted">{e.category}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{curSymbol}{(e.amount * (1 + e.markupPct / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial summary breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6 border-t border-border-light">
            <div className="text-xs text-text-muted sm:max-w-md">
              <span className="font-bold text-text-main block mb-1">Payment Instructions</span>
              <p>{paymentTerms}</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Services Subtotal:</span>
                <span className="font-mono font-bold text-text-main">{curSymbol}{totals.totalLaborAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Expenses Subtotal:</span>
                <span className="font-mono font-bold text-text-main">{curSymbol}{totals.totalBillableExpenses.toFixed(2)}</span>
              </div>
              {taxPct > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Tax ({taxPct}%):</span>
                  <span className="font-mono font-bold text-text-main">{curSymbol}{totals.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-brand-primary pt-2 border-t border-border-light">
                <span>Total Due:</span>
                <span className="font-mono">{curSymbol}{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
