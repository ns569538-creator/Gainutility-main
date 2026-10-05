import React from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  ArrowRight, 
  Check, 
  Plus, 
  QrCode, 
  Play, 
  Code, 
  Search,
  Globe
} from "lucide-react";

interface ToolPreviewProps {
  toolId: string;
}

export const ToolPreview: React.FC<ToolPreviewProps> = ({ toolId }) => {
  // Common container: 70-90px tall, plenty of whitespace, subtle theme-aware background and borders
  const containerClass = "w-full h-[84px] rounded-xl relative flex items-center justify-between px-5 bg-surface-muted/30 border border-border-subtle/40 overflow-hidden font-sans select-none";

  switch (toolId) {
    // 1. JSON Formatter
    case "json-formatter":
      return (
        <div className={`${containerClass} justify-start gap-4 font-mono text-[10px] py-2 leading-relaxed bg-[#0F120A] dark:bg-[#070A04] border-[#222C17]/40`}>
          <div className="text-text-disabled border-r border-[#222C17] pr-3 flex flex-col select-none text-right">
            <span>1</span>
            <span>2</span>
            <span>3</span>
          </div>
          <div className="flex flex-col text-left">
            <div>
              <span className="text-text-sub font-bold">"status"</span>
              <span className="text-text-main">:</span> <span className="text-brand-primary">"success"</span><span className="text-text-main">,</span>
            </div>
            <div>
              <span className="text-text-sub font-bold">"payload"</span>
              <span className="text-text-main">:</span> <span className="text-text-main">{"{"}</span>
            </div>
            <div className="pl-4">
              <span className="text-text-sub font-bold">"valid"</span>
              <span className="text-text-main">:</span> <span className="text-purple-500 dark:text-purple-400 font-bold">true</span>
            </div>
          </div>
          <div className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded bg-brand-primary-light/10 border border-brand-primary/15 text-[8px] text-brand-primary uppercase font-bold tracking-wider">
            JSON Valid
          </div>
        </div>
      );

    // 4. Merge PDF
    case "merge-pdf":
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 bg-surface-base border border-border-subtle px-2 py-0.5 rounded text-[10px]">
                <FileText className="w-3 h-3 text-red-500" />
                <span className="text-text-sub font-medium max-w-[50px] truncate">doc_1.pdf</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-base border border-border-subtle px-2 py-0.5 rounded text-[10px]">
                <FileText className="w-3 h-3 text-red-500" />
                <span className="text-text-sub font-medium max-w-[50px] truncate">doc_2.pdf</span>
              </div>
            </div>
            <Plus className="w-3.5 h-3.5 text-text-muted mx-1" />
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
          </div>

          <div className="flex items-center gap-2.5 bg-brand-primary/10 border border-brand-primary/20 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/10">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-main leading-tight">merged.pdf</span>
              <span className="text-[9px] font-mono text-brand-primary font-bold">2 PAGES</span>
            </div>
          </div>
        </div>
      );

    // 5. CSS Gradients
    case "gradient-generator":
      return (
        <div className={`${containerClass} flex-col gap-2 py-2.5 justify-center items-stretch`}>
          <div 
            className="w-full h-5 rounded-lg border border-border-subtle/60 shadow-inner"
            style={{ backgroundImage: "linear-gradient(to right, #556B2F, #D9B95B, #A83737)" }}
          />
          <div className="flex justify-between items-center text-[9px] font-mono text-text-muted">
            <span className="font-bold text-brand-primary">#556B2F</span>
            <span className="font-bold text-text-sub">#D9B95B</span>
            <span className="font-bold text-red-600 dark:text-red-400">#A83737</span>
          </div>
        </div>
      );

    // 6. Contrast Checker
    case "contrast-checker":
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-3">
            {/* Color Swatch A */}
            <div 
              className="w-12 h-11 rounded-lg border border-border-subtle/60 flex flex-col items-center justify-center shadow-premium-sm"
              style={{ backgroundColor: "#151A0D", color: "#8CA44E" }}
            >
              <span className="text-xs font-bold leading-none">Aa</span>
              <span className="text-[8px] font-mono mt-0.5">6.4:1</span>
            </div>
            {/* Color Swatch B */}
            <div 
              className="w-12 h-11 rounded-lg border border-border-subtle/60 flex flex-col items-center justify-center shadow-premium-sm"
              style={{ backgroundColor: "#F4F0E6", color: "#263124" }}
            >
              <span className="text-xs font-bold leading-none">Aa</span>
              <span className="text-[8px] font-mono mt-0.5">12.8:1</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/15">
              <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wide">WCAG AAA</span>
              <Check className="w-2.5 h-2.5 text-brand-primary stroke-[3]" />
            </div>
            <span className="text-[9px] font-mono text-text-muted">Contrast Ratio: Perfect</span>
          </div>
        </div>
      );

    // 7. QR Code Generator
    case "qr-code-generator":
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-base rounded-lg border border-border-subtle shadow-premium-sm text-text-main">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-brand-primary tracking-wide">TARGET URI:</span>
              <span className="text-xs font-semibold text-text-main max-w-[120px] truncate leading-tight">https://gainutility.suite</span>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/15 text-[8px] font-mono font-bold text-brand-primary">
            PNG/SVG
          </div>
        </div>
      );

    // 8. Base64 Encoder/Decoder
    case "base64-tool":
      return (
        <div className={containerClass}>
          <div className="bg-surface-base border border-border-subtle rounded-lg px-2.5 py-1 flex flex-col max-w-[100px] shadow-premium-sm">
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider select-none">ASCII</span>
            <span className="text-xs font-bold text-text-main font-mono truncate">Hello</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-text-muted" />

          <div className="bg-brand-primary-light/40 border border-brand-primary/20 rounded-lg px-2.5 py-1 flex flex-col max-w-[100px] shadow-premium-sm">
            <span className="text-[8px] font-bold text-brand-primary uppercase tracking-wider select-none">BASE64</span>
            <span className="text-xs font-bold text-brand-primary font-mono truncate">SGVsbG8=</span>
          </div>
        </div>
      );

    // 9. SEO Meta Generator
    case "seo-meta-generator":
      return (
        <div className={`${containerClass} flex-col items-stretch justify-center gap-1 py-2 bg-[#090C05] dark:bg-[#050703] border-[#222C17]/30`}>
          <div className="flex items-center gap-1 text-[8px] font-mono text-text-muted">
            <Globe className="w-2.5 h-2.5 text-brand-primary/70" />
            <span className="text-brand-primary/80">gainutility.suite › tools › seo</span>
          </div>
          <div className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer leading-tight truncate">
            GainUtility - Premium Browser-First Local Tools
          </div>
          <div className="text-[9px] text-text-muted/90 truncate leading-none">
            Optimize tags and format description cards securely offline with zero tracking.
          </div>
        </div>
      );

    // 10. URL Encoder/Decoder
    case "url-encoder-decoder":
      return (
        <div className={containerClass}>
          <div className="bg-surface-base border border-border-subtle rounded-lg px-2.5 py-1 flex flex-col max-w-[100px] shadow-premium-sm">
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider select-none">RAW</span>
            <span className="text-xs font-bold text-text-main font-mono truncate">foo bar</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-text-muted" />

          <div className="bg-brand-primary-light/40 border border-brand-primary/20 rounded-lg px-2.5 py-1 flex flex-col max-w-[100px] shadow-premium-sm">
            <span className="text-[8px] font-bold text-brand-primary uppercase tracking-wider select-none">ENCODED</span>
            <span className="text-xs font-bold text-brand-primary font-mono truncate">foo%20bar</span>
          </div>
        </div>
      );

    // 11. Image Cropper
    case "image-cropper":
      return (
        <div className={`${containerClass} justify-center`}>
          <div className="relative w-44 h-12 rounded border border-dashed border-brand-primary/40 bg-surface-base flex items-center justify-center shadow-premium-sm">
            {/* Aspect grid dashes */}
            <div className="absolute inset-x-1/3 inset-y-0 border-r border-l border-dashed border-brand-primary/15" />
            <div className="absolute inset-y-1/3 inset-x-0 border-t border-b border-dashed border-brand-primary/15" />
            
            {/* L-shaped Crop Handles */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-brand-primary" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-brand-primary" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-brand-primary" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-brand-primary" />
            
            <span className="text-[9px] font-mono font-bold text-brand-primary bg-brand-primary-light/70 px-1.5 py-0.5 rounded shadow-sm z-10 select-none">
              16 : 9
            </span>
          </div>
        </div>
      );

    // 12. YouTube Thumbnail Preview
    case "youtube-thumbnail-preview":
      return (
        <div className={`${containerClass} justify-center`}>
          <div 
            className="relative w-36 h-14 rounded-lg overflow-hidden border border-border-subtle shadow-premium-sm flex items-center justify-center"
            style={{ backgroundImage: "linear-gradient(135deg, #465B26 0%, #1E2514 100%)" }}
          >
            {/* Thumbnail Play button */}
            <div className="w-8 h-6 rounded bg-red-600 flex items-center justify-center shadow">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
            {/* Duration stamp */}
            <div className="absolute bottom-1 right-1 px-1 rounded bg-[#0C0F08] border border-border-subtle/10 text-[7px] font-mono font-bold text-white leading-none">
              14:20
            </div>
          </div>
        </div>
      );

    // 13. CSV Reconciliation Preview
    case "csv-reconciliation":
      return (
        <div className={`${containerClass} font-mono text-[9px] justify-between`}>
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">A: 1,420</div>
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">B: 1,425</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">3 Diff</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">99.8% Match</span>
          </div>
        </div>
      );

    // 14. Excel Formula Generator Preview
    case "excel-formula-generator":
      return (
        <div className={`${containerClass} font-mono text-[9px] justify-between bg-surface-muted/40`}>
          <div className="flex flex-col gap-0.5 truncate max-w-[210px]">
            <span className="text-text-muted text-[8px] uppercase">Plain English → Formula</span>
            <span className="font-bold text-brand-primary truncate">=XLOOKUP(A2, Sheet1!A:A, Sheet1!C:C)</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-brand-primary-light/40 text-brand-primary font-bold text-[8px] shrink-0">EXCEL/SHEETS</span>
        </div>
      );

    // 15. Billable Hours Calculator Preview
    case "billable-hours-calculator":
      return (
        <div className={`${containerClass} font-mono text-[10px] justify-between`}>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">38.5 hrs</span>
            <span className="text-[8px] text-text-muted">$125.00/hr</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">$4,812.50</span>
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      );

    // 16. PDF Difference Checker Preview
    case "pdf-difference-checker":
      return (
        <div className={`${containerClass} font-mono text-[9px] justify-between`}>
          <div className="flex flex-col gap-0.5">
            <span className="line-through text-red-500">$45,000 SLA 99.5%</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">$58,000 SLA 99.9%</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[8px]">
            ± 4 CLAUSES
          </span>
        </div>
      );

    // 17. Business PDF Extractor Preview
    case "business-pdf-extractor":
      return (
        <div className={`${containerClass} font-mono text-[9px] justify-between`}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-text-main">INV-2026-084</span>
              <span className="text-text-muted text-[8px]">3 Line Items</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[9px]">
            MATH VERIFIED
          </span>
        </div>
      );

    // 18. Invoice Follow-Up Tracker Preview
    case "invoice-follow-up-tracker":
      return (
        <div className={`${containerClass} font-mono text-[9px] justify-between`}>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-text-main">INV-9021 • Acme Corp</span>
            <span className="text-red-500 font-bold text-[8px]">7 DAYS OVERDUE</span>
          </div>
          <span className="px-2 py-1 rounded bg-brand-primary text-surface-base font-bold text-[8px]">
            1-CLICK REMIND
          </span>
        </div>
      );

    // 19. Font Detector Preview
    case "font-detector":
      return (
        <div className={`${containerClass} justify-between`}>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-text-main">Aa</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-main">Futura Bold</span>
              <span className="text-[9px] font-mono text-text-muted">Geometric Sans</span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold text-[9px]">
            96% MATCH
          </span>
        </div>
      );

    // Fallback standard visual preview for other/new tools
    default:
      return (
        <div className={containerClass}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brand-primary-light/40 flex items-center justify-center border border-brand-primary/10 text-brand-primary">
              <Code className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-main capitalize">{toolId.replace("-", " ")}</span>
              <span className="text-[9px] font-mono text-text-muted">BROWSER UTILITY</span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded bg-brand-primary-light/20 border border-brand-primary/10 text-[9px] font-mono font-bold text-brand-primary">
            LOCAL
          </div>
        </div>
      );
  }
};
