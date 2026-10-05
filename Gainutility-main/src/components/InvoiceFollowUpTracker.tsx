import React, { useState, useEffect, useMemo } from "react";
import { 
  BellRing, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  FileText, 
  Download, 
  Upload, 
  Send,
  MessageSquareText
} from "lucide-react";
import { Toast } from "./Common";

interface InvoiceFollowUpTrackerProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: any) => void;
}

export type InvoiceStatus = "draft" | "sent" | "due_soon" | "overdue" | "paid";

export interface TrackedInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  lastContactDate?: string;
}

const TEMPLATES = {
  pre_due: {
    title: "Pre-Due Gentle Reminder (3 Days Before)",
    subject: "Friendly Reminder: Invoice {InvoiceNo} from GainUtility",
    body: `Hi {Client},\n\nI hope you're having a productive week.\n\nThis is a friendly reminder that invoice {InvoiceNo} for {Amount} is scheduled for payment in 3 days on {DueDate}.\n\nIf you need an additional copy of the invoice or have any questions regarding the deliverables, please let me know.\n\nThank you for your business!\n\nBest regards,\nAccounting Team`
  },
  due_today: {
    title: "Due Today Notice",
    subject: "Invoice {InvoiceNo} Due Today ({Amount})",
    body: `Hi {Client},\n\nHope all is well. This is a quick note to let you know that invoice {InvoiceNo} for {Amount} is due today ({DueDate}).\n\nPlease let us know once payment has been remitted so we can update your account ledger.\n\nThank you!\n\nBest regards,\nAccounts Receivable`
  },
  overdue_7: {
    title: "Stage 1: Overdue 7 Days (Polite Nudge)",
    subject: "Follow-up: Invoice {InvoiceNo} is {DaysOverdue} days past due",
    body: `Hi {Client},\n\nWe haven't received payment yet for invoice {InvoiceNo} ({Amount}), which was due on {DueDate} ({DaysOverdue} days ago).\n\nCould you please check in with your finance team and confirm when we can expect payment?\n\nIf you have already sent this payment, please disregard this note.\n\nThanks,\nAccounts Team`
  },
  overdue_14: {
    title: "Stage 2: Overdue 14–30 Days (Urgent Status Request)",
    subject: "URGENT: Outstanding Payment for Invoice {InvoiceNo}",
    body: `Dear {Client},\n\nWe are following up regarding overdue invoice {InvoiceNo} in the amount of {Amount}, which was due on {DueDate} and is now {DaysOverdue} days overdue.\n\nWe have not received a response to our previous reminders. Please provide an immediate update regarding the payment schedule.\n\nBest regards,\nFinance & Operations`
  },
  final_demand: {
    title: "Stage 3: Final Notice (30+ Days)",
    subject: "FINAL NOTICE: Immediate payment required for Invoice {InvoiceNo}",
    body: `Dear {Client},\n\nDespite repeated notices, invoice {InvoiceNo} ({Amount}) remains unpaid and is now {DaysOverdue} days past due.\n\nPlease remit payment immediately to avoid suspension of ongoing services and potential escalation to collections.\n\nSincerely,\nLegal & Finance Department`
  }
};

export const InvoiceFollowUpTracker: React.FC<InvoiceFollowUpTrackerProps> = ({ onCopy, onAddToast }) => {
  const [invoices, setInvoices] = useState<TrackedInvoice[]>([
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-001",
      clientName: "Vortex Media Group",
      clientEmail: "accounting@vortexmedia.io",
      amount: 4500.00,
      currency: "USD",
      issueDate: "2026-07-01",
      dueDate: "2026-07-15",
      status: "overdue",
      notes: "Website redesign milestone 2",
      lastContactDate: "2026-07-22"
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-002",
      clientName: "Apex Retailers Inc",
      clientEmail: "finance@apexretail.com",
      amount: 2850.00,
      currency: "USD",
      issueDate: "2026-08-01",
      dueDate: "2026-08-15",
      status: "due_soon",
      notes: "Monthly SEO and content retainer"
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-2026-003",
      clientName: "Starlight Digital",
      clientEmail: "billing@starlight.co",
      amount: 6200.00,
      currency: "USD",
      issueDate: "2026-07-10",
      dueDate: "2026-07-24",
      status: "paid",
      notes: "Custom backend API integration"
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<TrackedInvoice | null>(null);
  const [activeTemplateKey, setActiveTemplateKey] = useState<keyof typeof TEMPLATES>("overdue_7");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Auto-calculate overdue days and status
  const today = new Date();

  const getDaysDiff = (dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const diffTime = today.getTime() - due.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // KPIs
  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;
    let totalPaid = 0;

    invoices.forEach(inv => {
      if (inv.status === "paid") {
        totalPaid += inv.amount;
      } else {
        totalOutstanding += inv.amount;
        const daysDiff = getDaysDiff(inv.dueDate);
        if (daysDiff > 0 || inv.status === "overdue") {
          totalOverdue += inv.amount;
          overdueCount++;
        } else if (daysDiff >= -5 && daysDiff <= 0) {
          dueSoonCount++;
        }
      }
    });

    return {
      totalOutstanding,
      totalOverdue,
      overdueCount,
      dueSoonCount,
      totalPaid
    };
  }, [invoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (filterStatus !== "all" && inv.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, filterStatus, searchQuery]);

  // Selected email generator
  const generatedEmail = useMemo(() => {
    if (!selectedInvoice) return null;
    const tpl = TEMPLATES[activeTemplateKey];
    const daysOverdue = Math.max(0, getDaysDiff(selectedInvoice.dueDate));

    const subject = tpl.subject
      .replace("{InvoiceNo}", selectedInvoice.invoiceNumber)
      .replace("{Amount}", `$${selectedInvoice.amount.toFixed(2)}`)
      .replace("{Client}", selectedInvoice.clientName)
      .replace("{DueDate}", selectedInvoice.dueDate)
      .replace("{DaysOverdue}", String(daysOverdue));

    const body = tpl.body
      .replace(/{InvoiceNo}/g, selectedInvoice.invoiceNumber)
      .replace(/{Amount}/g, `$${selectedInvoice.amount.toFixed(2)}`)
      .replace(/{Client}/g, selectedInvoice.clientName)
      .replace(/{DueDate}/g, selectedInvoice.dueDate)
      .replace(/{DaysOverdue}/g, String(daysOverdue));

    return { subject, body };
  }, [selectedInvoice, activeTemplateKey]);

  const handleCopyEmail = () => {
    if (!generatedEmail) return;
    const fullText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    if (onCopy) {
      onCopy(fullText);
    } else {
      navigator.clipboard.writeText(fullText);
    }
    setCopiedEmail(true);
    onAddToast?.("Follow-up email copied to clipboard!", "success");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenMailto = () => {
    if (!selectedInvoice || !generatedEmail) return;
    const mailtoUrl = `mailto:${encodeURIComponent(selectedInvoice.clientEmail)}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.location.href = mailtoUrl;
  };

  const addNewInvoice = () => {
    const newInv: TrackedInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
      clientName: "New Client",
      clientEmail: "billing@client.com",
      amount: 1000,
      currency: "USD",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "sent",
      notes: ""
    };
    setInvoices(prev => [newInv, ...prev]);
    setSelectedInvoice(newInv);
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    if (selectedInvoice?.id === id) {
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-text-main">Aging Overview</h2>
        <button
          onClick={addNewInvoice}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* 2. Aging KPI Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Total Outstanding</span>
            <DollarSign className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-main mt-1">
            ${stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Overdue Amount</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
            ${stats.totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-text-muted ml-1">({stats.overdueCount})</span>
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Due Soon</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {stats.dueSoonCount} <span className="text-xs font-normal text-text-muted">invoices</span>
          </div>
        </div>

        <div className="bg-surface-base p-4 rounded-xl border border-border-light shadow-premium-sm">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Paid / Recovered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Invoice Ledger + Follow-up Email Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ledger Column */}
        <div className="lg:col-span-7 bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-text-main">Invoices Ledger</h3>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2 py-1 text-xs bg-surface-muted border border-border-light rounded-lg text-text-main w-36 sm:w-44 focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <select aria-label="Filter invoices by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-surface-muted border border-border-light rounded-lg px-2 py-1 text-text-main font-semibold"
              >
                <option value="all">All</option>
                <option value="overdue">Overdue</option>
                <option value="due_soon">Due Soon</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* List of Invoices */}
          <div className="divide-y divide-border-light/60 max-h-[500px] overflow-y-auto">
            {filteredInvoices.map((inv) => {
              const daysDiff = getDaysDiff(inv.dueDate);
              const isSelected = selectedInvoice?.id === inv.id;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected ? "bg-brand-primary-light/40 border border-brand-primary/40 shadow-sm" : "hover:bg-surface-muted/50"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-text-main">{inv.invoiceNumber}</span>
                      {inv.status === "overdue" && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px] font-bold">
                          {daysDiff}d Overdue
                        </span>
                      )}
                      {inv.status === "due_soon" && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                          Due Soon
                        </span>
                      )}
                      {inv.status === "paid" && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                          Paid
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted truncate">{inv.clientName}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-text-main block">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">Due: {inv.dueDate}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Follow-up Email Generator Column */}
        <div className="lg:col-span-5 bg-surface-base p-5 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-brand-primary" />
              <h3 className="font-bold text-sm text-text-main">Follow-Up Email Generator</h3>
            </div>

            {selectedInvoice && (
              <span className="text-xs font-mono font-bold text-brand-primary">
                {selectedInvoice.invoiceNumber}
              </span>
            )}
          </div>

          {selectedInvoice && generatedEmail ? (
            <>
              {/* Template selector */}
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1" htmlFor="invoice-follow-up-tracker-select-stage-template">Select Stage Template:</label>
                <select
                  value={activeTemplateKey}
                  onChange={(e) => setActiveTemplateKey(e.target.value as any)}
                  className="w-full text-xs font-bold bg-surface-muted border border-border-light rounded-lg px-3 py-2 text-text-main focus:ring-1 focus:ring-brand-primary"
                 id="invoice-follow-up-tracker-select-stage-template">
                  <option value="pre_due">Pre-Due Reminder (3 Days Before)</option>
                  <option value="due_today">Due Date Notice (Today)</option>
                  <option value="overdue_7">Stage 1: 7 Days Overdue (Friendly Nudge)</option>
                  <option value="overdue_14">Stage 2: 14–30 Days Overdue (Urgent Request)</option>
                  <option value="final_demand">Stage 3: 30+ Days Overdue (Final Notice)</option>
                </select>
              </div>

              {/* Email preview */}
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border-light flex flex-col gap-2 text-xs">
                <div className="font-bold text-text-main pb-2 border-b border-border-light/60">
                  <span className="text-text-muted font-normal">Subject: </span>{generatedEmail.subject}
                </div>
                <div className="whitespace-pre-line text-text-sub font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                  {generatedEmail.body}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-base border border-border-light text-text-main transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? "Copied!" : "Copy Email Text"}</span>
                </button>

                <button
                  onClick={handleOpenMailto}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Email Client</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-text-muted text-xs flex flex-col items-center gap-2">
              <Mail className="w-8 h-8 text-text-muted opacity-40" />
              <span>Select an invoice from the ledger to generate a tailored follow-up message.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
