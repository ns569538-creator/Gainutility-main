/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ViewState, ToolId } from "../types";
import { Breadcrumbs } from "./Common";
import { toolsRegistry } from "../toolsRegistry";
import { 
  FileCheck2, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  ArrowUpDown
} from "lucide-react";

interface AuditEntry {
  url: string;
  toolName: string;
  toolId: ToolId;
  studio: string;
  searchIntent: string;
  title: string;
  metaDesc: string;
  canonical: string;
  h1: string;
  indexability: "INDEX" | "NOINDEX";
  contentDepth: "Deep" | "Medium" | "Focused";
  uniqueValue: string;
  internalLinksCount: number;
  relatedToolsCount: number;
  faqCount: number;
  privacyModel: string;
  funcStatus: "100% Functional (Local)" | "Experimental";
  dupRisk: "None (Unique)" | "Low" | "Consolidated";
  seoRisk: "None" | "Low (Niche)" | "Canonicalized";
  uxRisk: "None (Instant)" | "Low";
  action: "KEEP" | "IMPROVE" | "MERGE" | "NOINDEX";
}

export const SITE_AUDIT_DATA: AuditEntry[] = [
  // 1. Flagship Productivity & Data
  {
    url: "/csv-reconciliation",
    toolName: "CSV / Excel Reconciliation",
    toolId: "csv-reconciliation",
    studio: "Developer Studio",
    searchIntent: "Compare two CSV or Excel spreadsheets, match keys, and detect cell differences",
    title: "CSV & Excel Reconciliation Tool | Free Online Spreadsheet Diff",
    metaDesc: "Compare two CSV or Excel spreadsheets locally in your browser. Auto-detect header keys, identify modified cells, new rows, deletions, and export audit reports.",
    canonical: "https://gainutility.com/csv-reconciliation",
    h1: "Compare & Reconcile Two CSV or Excel Files",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Client-side Excel & CSV parser with smart key detection, pre-comparison normalizer, cell-level diffing & XLSX export",
    internalLinksCount: 6,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/excel-formula-generator",
    toolName: "Plain English → Excel Formula",
    toolId: "excel-formula-generator",
    studio: "Developer Studio",
    searchIntent: "Generate Excel and Google Sheets formulas from plain English descriptions",
    title: "Plain English to Excel Formula Generator | Google Sheets Builder",
    metaDesc: "Convert natural language instructions into validated Excel and Google Sheets formulas. Features syntax explanations, variable placeholders, and formula explainer.",
    canonical: "https://gainutility.com/excel-formula-generator",
    h1: "Generate Excel & Google Sheets Formulas from Plain English",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Deterministic rule-based compiler supporting XLOOKUP, INDEX/MATCH, SUMIFS, LET with live syntax validator and reverse explainer",
    internalLinksCount: 6,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/billable-hours-calculator",
    toolName: "Billable Hours & Expense Calculator",
    toolId: "billable-hours-calculator",
    studio: "Developer Studio",
    searchIntent: "Calculate freelance billable hours, rates, overtime, client retainers, and generate invoice draft",
    title: "Billable Hours Calculator | Freelance Rate & Invoice Generator",
    metaDesc: "Calculate total billable hours, rates, overtime tiers, expenses, and taxes. Compare against client retainer caps and generate clean printable invoice statements.",
    canonical: "https://gainutility.com/billable-hours-calculator",
    h1: "Calculate Billable Hours, Overtime & Client Invoices",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Time tracking, overtime multiplier, mileage expense calculator, retainer budget monitor, and printable invoice statement generator",
    internalLinksCount: 5,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/pdf-difference-checker",
    toolName: "PDF Difference Checker",
    toolId: "pdf-difference-checker",
    studio: "PDF Studio",
    searchIntent: "Compare two PDF documents side-by-side to highlight contract and clause changes",
    title: "PDF Difference Checker | Compare Two PDF Contracts & Agreements",
    metaDesc: "Compare two PDF documents side-by-side offline. Highlight deleted clauses, added terms, modified pricing, and export structured PDF redline audit logs.",
    canonical: "https://gainutility.com/pdf-difference-checker",
    h1: "Compare Two PDF Documents Side-by-Side",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Side-by-side and unified redline contract comparison with clause-level classification and audit export",
    internalLinksCount: 8,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/business-pdf-extractor",
    toolName: "Business PDF Data Extractor",
    toolId: "business-pdf-extractor",
    studio: "PDF Studio",
    searchIntent: "Extract line items, invoice numbers, totals, and tables from PDF invoices and POs",
    title: "Business PDF Data Extractor | Invoice & PO Table Parser",
    metaDesc: "Extract itemized tables, invoice numbers, vendor details, and financial totals from PDF documents. Automatically validates line item arithmetic integrity.",
    canonical: "https://gainutility.com/business-pdf-extractor",
    h1: "Extract Invoices, Purchase Orders & Tables from Business PDFs",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Automatic line item table extraction with subtotal and tax arithmetic audit and CSV/JSON export",
    internalLinksCount: 8,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/invoice-follow-up-tracker",
    toolName: "Invoice Follow-Up Tracker",
    toolId: "invoice-follow-up-tracker",
    studio: "Developer Studio",
    searchIntent: "Track accounts receivable aging, calculate overdue days, and generate payment reminder emails",
    title: "Invoice Follow-Up Tracker | Accounts Receivable & Payment Reminders",
    metaDesc: "Track unpaid customer invoices, calculate accounts receivable aging brackets (0-30, 31-60, 90+ days), and generate 1-click professional reminder emails.",
    canonical: "https://gainutility.com/invoice-follow-up-tracker",
    h1: "Track Accounts Receivable Aging & Generate Invoice Reminders",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Local AR aging dashboard, overdue days calculator, and multi-stage payment follow-up email generator with CSV import/export",
    internalLinksCount: 5,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/font-detector",
    toolName: "Font Detector & Typography Inspector",
    toolId: "font-detector",
    studio: "Design Utilities",
    searchIntent: "Identify fonts from screenshot images and find matching free Google Fonts",
    title: "Font Detector from Image | Find Matching Free Google Fonts",
    metaDesc: "Identify typography and font characteristics from image screenshots. Discover curated open-source Google Fonts alternatives and copy ready-to-use CSS rules.",
    canonical: "https://gainutility.com/font-detector",
    h1: "Identify Fonts from Images & Discover Google Fonts Alternatives",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Image cropping stage, optical character analysis, curated Google Fonts matching, and live editable typography playground",
    internalLinksCount: 6,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },

  // 2. Core JSON Studio
  {
    url: "/json-formatter",
    toolName: "JSON Formatter & Validator",
    toolId: "json-formatter",
    studio: "JSON Studio",
    searchIntent: "Format and validate JSON payloads with syntax error line pointers",
    title: "JSON Formatter & Validator | Offline Syntax Debugger",
    metaDesc: "Beautify, format, minify, and validate JSON data instantly in your browser with high-contrast syntax highlighting and deep error tracing.",
    canonical: "https://gainutility.com/json-formatter",
    h1: "Format, Beautify & Validate JSON Payloads Online",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Strict RFC 8259 parser, custom 2/4/8 space indent, line numbers, error line highlighting, and instant file export",
    internalLinksCount: 7,
    relatedToolsCount: 3,
    faqCount: 6,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/json-compare-diff",
    toolName: "Compare JSON",
    toolId: "json-compare-diff",
    studio: "JSON Studio",
    searchIntent: "Compare two JSON objects side-by-side and highlight structural differences",
      title: "Compare JSON | Side-by-Side JSON Difference Checker",
    metaDesc: "Compare two JSON payloads side-by-side. Highlights modified keys, missing nodes, type differences, and structural array mutations completely offline.",
    canonical: "https://gainutility.com/json-compare-diff",
    h1: "Compare Two JSON Objects Side-by-Side",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "AST structural diffing, key sorting, recursive property mapping, and side-by-side visual color coding",
    internalLinksCount: 6,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/json-to-csv",
    toolName: "JSON to CSV Converter",
    toolId: "json-to-csv",
    studio: "JSON Studio",
    searchIntent: "Convert nested JSON arrays into flat CSV spreadsheets",
    title: "JSON to CSV Converter | Flatten JSON Objects to Spreadsheet",
    metaDesc: "Convert JSON array payloads into clean CSV tables offline. Auto-flattens nested properties using dot notation with live tabular preview and download.",
    canonical: "https://gainutility.com/json-to-csv",
    h1: "Convert JSON Data to CSV Spreadsheets",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Recursive dot-notation flattener, delimiter selector, live table preview, and instant RFC 4180 CSV export",
    internalLinksCount: 6,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/json-validator",
    toolName: "JSON Validator (Canonicalized to Formatter)",
    toolId: "json-validator",
    studio: "JSON Studio",
    searchIntent: "Validate JSON syntax compliance",
    title: "JSON Validator Online | Check RFC 8259 Compliance",
    metaDesc: "Validate JSON syntax compliance locally in your browser. Points out exact missing brackets, trailing commas, and unquoted strings.",
    canonical: "https://gainutility.com/json-formatter",
    h1: "Validate JSON Syntax & Compliance",
    indexability: "NOINDEX",
    contentDepth: "Focused",
    uniqueValue: "Dedicated high-speed validation mode; canonicalized to /json-formatter to prevent thin keyword fragmentation",
    internalLinksCount: 5,
    relatedToolsCount: 3,
    faqCount: 4,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "Consolidated",
    seoRisk: "Canonicalized",
    uxRisk: "None (Instant)",
    action: "MERGE"
  },

  // 3. Core PDF Studio
  {
    url: "/merge-pdf",
    toolName: "Merge PDF Files",
    toolId: "merge-pdf",
    studio: "PDF Studio",
    searchIntent: "Combine multiple PDF documents into one unified file",
    title: "Merge PDF Files Online | Combine Multiple PDFs Securely",
    metaDesc: "Combine multiple PDF documents into a single consolidated file directly in your browser. Reorder files visually with zero server uploads.",
    canonical: "https://gainutility.com/merge-pdf",
    h1: "Merge Multiple PDF Documents into One File",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Client-side PDF-lib binary assembly, drag-to-reorder file tiles, and lossless page compilation",
    internalLinksCount: 7,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/split-pdf",
    toolName: "Split PDF Pages",
    toolId: "split-pdf",
    studio: "PDF Studio",
    searchIntent: "Split PDF into separate files by page range or sheet numbers",
    title: "Split PDF Online | Extract Pages & Split PDF Documents",
    metaDesc: "Split PDF files into individual pages or extract custom page ranges locally. Fast, private, and secure in-browser PDF splitting.",
    canonical: "https://gainutility.com/split-pdf",
    h1: "Split PDF Documents & Extract Page Ranges",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Visual page selector, custom range syntax (1-3, 5, 8-10), and multi-file zip generation",
    internalLinksCount: 7,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  // 5. CSS & Color Studio
  {
    url: "/gradient-generator",
    toolName: "CSS Gradient Generator",
    toolId: "gradient-generator",
    studio: "CSS Studio",
    searchIntent: "Create linear and radial CSS gradients and copy CSS/Tailwind code",
    title: "Interactive CSS Gradient Generator | High-Res PNG Exporter",
    metaDesc: "Design multi-stop linear and radial gradients. Copy standard CSS, approximate Tailwind classes, randomize palettes, and export PNGs.",
    canonical: "https://gainutility.com/gradient-generator",
    h1: "Design Multi-Stop CSS Linear & Radial Gradients",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Multi-color stop draggable rail, linear angle dial, radial shape toggle, Tailwind class generator, and 4K PNG raster exporter",
    internalLinksCount: 5,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  },
  {
    url: "/contrast-checker",
    toolName: "WCAG Contrast Checker",
    toolId: "contrast-checker",
    studio: "Color Studio",
    searchIntent: "Audit text and background colors against WCAG AA and AAA accessibility contrast standards",
    title: "WCAG Color Contrast Checker | AA & AAA Accessibility Auditor",
    metaDesc: "Test color combinations against WCAG 2.1 AA and AAA accessibility standards. Real-time contrast ratio score, live sample text preview, and hex suggestions.",
    canonical: "https://gainutility.com/contrast-checker",
    h1: "Test Color Contrast for WCAG AA & AAA Accessibility",
    indexability: "INDEX",
    contentDepth: "Deep",
    uniqueValue: "Live calculation of mathematical luminance contrast ratio (1:1 to 21:1), badges for normal text, large text, UI components, and suggested accessible hex tweaks",
    internalLinksCount: 5,
    relatedToolsCount: 3,
    faqCount: 5,
    privacyModel: "100% Client-Side Browser Memory",
    funcStatus: "100% Functional (Local)",
    dupRisk: "None (Unique)",
    seoRisk: "None",
    uxRisk: "None (Instant)",
    action: "KEEP"
  }
];

interface SiteAuditPageProps {
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const SiteAuditPage: React.FC<SiteAuditPageProps> = ({ onChangeView, onAddToast }) => {
  const [search, setSearch] = useState("");
  const [selectedStudio, setSelectedStudio] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "INDEX" | "NOINDEX">("All");

  const filteredEntries = useMemo(() => {
    return SITE_AUDIT_DATA.filter(entry => {
      const matchSearch = 
        entry.toolName.toLowerCase().includes(search.toLowerCase()) ||
        entry.url.toLowerCase().includes(search.toLowerCase()) ||
        entry.searchIntent.toLowerCase().includes(search.toLowerCase()) ||
        entry.title.toLowerCase().includes(search.toLowerCase());
      
      const matchStudio = selectedStudio === "All" || entry.studio === selectedStudio;
      const matchAction = selectedAction === "All" || entry.action === selectedAction;
      const matchFilter = selectedFilter === "All" || entry.indexability === selectedFilter;

      return matchSearch && matchStudio && matchAction && matchFilter;
    });
  }, [search, selectedStudio, selectedAction, selectedFilter]);

  const stats = useMemo(() => {
    const totalSite = Object.keys(toolsRegistry).length;
    const audited = SITE_AUDIT_DATA.length;
    const indexed = SITE_AUDIT_DATA.filter(e => e.indexability === "INDEX").length;
    const noindexed = SITE_AUDIT_DATA.filter(e => e.indexability === "NOINDEX").length;
    const deepContent = SITE_AUDIT_DATA.filter(e => e.contentDepth === "Deep").length;
    const clientSideSafe = SITE_AUDIT_DATA.filter(e => e.privacyModel.includes("Client-Side")).length;

    return { totalSite, audited, indexed, noindexed, deepContent, clientSideSafe };
  }, []);

  const handleExportCsv = () => {
    const headers = [
      "URL", "Tool Name", "Studio", "Primary Search Intent", "Title", "Meta Description", 
      "Canonical", "H1", "Indexability", "Content Depth", "Unique Value", "Internal Links", 
      "Related Tools", "FAQ Count", "Privacy Model", "Functionality Status", "Duplicate Risk", 
      "SEO Risk", "UX Risk", "Recommended Action"
    ];

    const rows = filteredEntries.map(e => [
      `"${e.url}"`,
      `"${e.toolName}"`,
      `"${e.studio}"`,
      `"${e.searchIntent.replace(/"/g, '""')}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.metaDesc.replace(/"/g, '""')}"`,
      `"${e.canonical}"`,
      `"${e.h1.replace(/"/g, '""')}"`,
      `"${e.indexability}"`,
      `"${e.contentDepth}"`,
      `"${e.uniqueValue.replace(/"/g, '""')}"`,
      e.internalLinksCount,
      e.relatedToolsCount,
      e.faqCount,
      `"${e.privacyModel}"`,
      `"${e.funcStatus}"`,
      `"${e.dupRisk}"`,
      `"${e.seoRisk}"`,
      `"${e.uxRisk}"`,
      `"${e.action}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gainutility-site-audit-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onAddToast("Audit report exported to CSV successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto py-4">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: "Home", active: false, onClick: () => onChangeView({ type: "home" }) },
          { name: "Site-Wide Content & SEO Quality Audit", active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-disabled uppercase">
          <FileCheck2 className="w-4 h-4" /> Live Master Quality Audit
        </div>
      </div>

      {/* Hero */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/15 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <Sparkles className="w-4 h-4" /> Editorial & Technical Quality Standards
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          Site-Wide Content, SEO & Architecture Audit Table
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed max-w-4xl">
          A structured content, SEO &amp; architecture review of GainUtility's flagship utility routes — a representative sample across the full {Object.keys(toolsRegistry).length}-tool suite. Each row records the primary search intent, unique value, canonical consolidation, indexability decision, and privacy boundary.
        </p>
      </header>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-surface-base border border-border-light rounded-xl shadow-sm space-y-1">
          <span className="text-xs text-text-muted uppercase font-mono font-bold">Site Tool Routes</span>
          <p className="text-2xl font-sans font-bold text-text-main">{stats.totalSite}</p>
        </div>
        <div className="p-4 bg-surface-base border border-border-light rounded-xl shadow-sm space-y-1">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-mono font-bold">Audited &amp; Indexed</span>
          <p className="text-2xl font-sans font-bold text-emerald-600 dark:text-emerald-400">{stats.indexed}</p>
        </div>
        <div className="p-4 bg-surface-base border border-border-light rounded-xl shadow-sm space-y-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 uppercase font-mono font-bold">Audited &amp; Consolidated</span>
          <p className="text-2xl font-sans font-bold text-amber-600 dark:text-amber-400">{stats.noindexed}</p>
        </div>
        <div className="p-4 bg-surface-base border border-border-light rounded-xl shadow-sm space-y-1">
          <span className="text-xs text-brand-primary uppercase font-mono font-bold">Audited Deep Content</span>
          <p className="text-2xl font-sans font-bold text-brand-primary">{stats.deepContent}</p>
        </div>
        <div className="p-4 bg-surface-base border border-border-light rounded-xl shadow-sm space-y-1">
          <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-mono font-bold">100% Client-Side RAM</span>
          <p className="text-2xl font-sans font-bold text-blue-600 dark:text-blue-400">{stats.clientSideSafe}</p>
        </div>
      </div>

      {/* Subtitle clarifying the audit scope */}
      <p className="text-xs text-text-muted -mt-2">
        {stats.audited} flagship routes audited in the table below — {Object.keys(toolsRegistry).length} total tool routes across {new Set(SITE_AUDIT_DATA.map(e => e.studio)).size} studios.
      </p>

      {/* Search & Filter Controls */}
      <div className="p-5 bg-surface-base border border-border-light rounded-2xl shadow-premium-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tool name, URL, search intent, or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border-light rounded-xl text-xs sm:text-sm text-text-main focus:border-brand-primary outline-none"
            />
          </div>

          <select
            value={selectedStudio}
            onChange={(e) => setSelectedStudio(e.target.value)}
            className="px-3 py-2 bg-background border border-border-light rounded-xl text-xs sm:text-sm text-text-main focus:border-brand-primary outline-none"
          >
            <option value="All">All Studios</option>
            <option value="Developer Studio">Developer Studio</option>
            <option value="PDF Studio">PDF Studio</option>
            <option value="JSON Studio">JSON Studio</option>
            <option value="Image Studio">Image Studio</option>
            <option value="CSS Studio">CSS Studio</option>
            <option value="Color Studio">Color Studio</option>
          </select>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-2 bg-background border border-border-light rounded-xl text-xs sm:text-sm text-text-main focus:border-brand-primary outline-none"
          >
            <option value="All">All Indexability</option>
            <option value="INDEX">INDEX Only</option>
            <option value="NOINDEX">NOINDEX Only</option>
          </select>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Download className="w-4 h-4" /> Export Audit CSV
        </button>
      </div>

      {/* Master Audit Table */}
      <div className="bg-surface-base border border-border-light rounded-2xl overflow-hidden shadow-premium-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-muted border-b border-border-light font-sans font-bold text-text-main uppercase tracking-wider">
              <tr>
                <th className="p-3.5 whitespace-nowrap">Tool & URL</th>
                <th className="p-3.5 whitespace-nowrap">Studio</th>
                <th className="p-3.5 min-w-[240px]">Primary Search Intent</th>
                <th className="p-3.5 min-w-[220px]">Canonical & H1</th>
                <th className="p-3.5 whitespace-nowrap">Indexability</th>
                <th className="p-3.5 whitespace-nowrap">Content Depth</th>
                <th className="p-3.5 min-w-[240px]">Unique GainUtility Value</th>
                <th className="p-3.5 whitespace-nowrap">Links / FAQs</th>
                <th className="p-3.5 whitespace-nowrap">Privacy & Risk</th>
                <th className="p-3.5 whitespace-nowrap">Action</th>
                <th className="p-3.5 text-center">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-text-sub">
              {filteredEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-background/80 transition-colors">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-bold text-text-main text-sm">{entry.toolName}</div>
                    <code className="text-[11px] font-mono text-brand-primary">{entry.url}</code>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-surface-muted rounded text-[11px] font-medium text-text-muted">
                      {entry.studio}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-text-sub leading-relaxed">
                    {entry.searchIntent}
                  </td>
                  <td className="p-3.5 text-xs space-y-1">
                    <div className="font-medium text-text-main line-clamp-1" title={entry.h1}><strong>H1:</strong> {entry.h1}</div>
                    <div className="text-[11px] text-text-muted font-mono truncate max-w-[220px]" title={entry.canonical}>{entry.canonical}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                      entry.indexability === "INDEX" 
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {entry.indexability}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="text-[11px] font-mono font-bold text-text-main">
                      {entry.contentDepth}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-text-sub leading-relaxed">
                    {entry.uniqueValue}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-[11px] font-mono">
                    <div>Links: {entry.internalLinksCount}</div>
                    <div>FAQs: {entry.faqCount}</div>
                  </td>
                  <td className="p-3.5 text-[11px] space-y-1 whitespace-nowrap">
                    <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Client RAM
                    </div>
                    <div className="text-text-muted">Dup Risk: {entry.dupRisk}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      entry.action === "KEEP"
                        ? "bg-brand-primary-light text-brand-primary"
                        : "bg-surface-muted text-text-muted"
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => onChangeView({ type: "tool", id: entry.toolId })}
                      className="p-1.5 hover:bg-brand-primary-light text-brand-primary rounded-lg transition-colors cursor-pointer"
                      title={`Open ${entry.toolName}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
