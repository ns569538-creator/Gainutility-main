/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Premium vector thumbnail for GainUtility blog articles.
 * Renders an ultra-crisp, category-tailored editorial graphic with 0KB network payload,
 * zero layout shift, and full dark-mode compatibility.
 */

import React from "react";
import { BlogCategory } from "../../blog/blogData";
import { 
  FileText, 
  Image as ImageIcon, 
  Code, 
  Search, 
  Clock, 
  Layers, 
  Wand2, 
  FileSpreadsheet, 
  Terminal, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface ArticleThumbnailProps {
  category: BlogCategory;
  slug: string;
  featured?: boolean;
  className?: string;
}

export const ArticleThumbnail: React.FC<ArticleThumbnailProps> = ({
  category,
  slug,
  featured = false,
  className = "",
}) => {
  // Category-specific visual theme tokens
  const theme = React.useMemo(() => {
    switch (category) {
      case "PDF":
        return {
          gradient: "from-red-500/15 via-orange-500/10 to-amber-500/5 dark:from-red-950/40 dark:via-orange-950/20 dark:to-transparent",
          border: "border-red-500/20 dark:border-red-500/30",
          iconColor: "text-red-500 dark:text-red-400",
          badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
          accentColor: "#EF4444",
          badgeText: "PDF GUIDE",
        };
      case "Images":
        return {
          gradient: "from-amber-500/15 via-rose-500/10 to-orange-500/5 dark:from-amber-950/40 dark:via-rose-950/20 dark:to-transparent",
          border: "border-amber-500/20 dark:border-amber-500/30",
          iconColor: "text-amber-600 dark:text-amber-400",
          badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
          accentColor: "#F59E0B",
          badgeText: "IMAGE GUIDE",
        };
      case "Developer":
        return {
          gradient: "from-blue-500/15 via-indigo-500/10 to-cyan-500/5 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-transparent",
          border: "border-blue-500/20 dark:border-blue-500/30",
          iconColor: "text-blue-500 dark:text-blue-400",
          badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          accentColor: "#3B82F6",
          badgeText: "DEV TOOLKIT",
        };
      case "SEO":
        return {
          gradient: "from-emerald-500/15 via-teal-500/10 to-cyan-500/5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent",
          border: "border-emerald-500/20 dark:border-emerald-500/30",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
          accentColor: "#10B981",
          badgeText: "SEO STRATEGY",
        };
      case "Productivity":
      default:
        return {
          gradient: "from-violet-500/15 via-purple-500/10 to-indigo-500/5 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-transparent",
          border: "border-violet-500/20 dark:border-violet-500/30",
          iconColor: "text-violet-600 dark:text-violet-400",
          badgeBg: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
          accentColor: "#8B5CF6",
          badgeText: "WORKFLOW",
        };
    }
  }, [category]);

  // Specific micro-illustration based on topic slug
  const renderIllustration = () => {
    if (category === "PDF") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background layered doc */}
          <div className="absolute w-24 h-32 sm:w-28 sm:h-36 rounded-lg bg-surface-base/80 border border-border-subtle shadow-sm translate-x-3 -translate-y-2 rotate-6 opacity-60" />
          {/* Main front doc */}
          <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-xl bg-surface-base border border-border-light shadow-premium-sm p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center text-red-500 font-mono text-[10px] font-bold">
                PDF
              </div>
              <FileText className="w-4 h-4 text-text-muted" />
            </div>
            <div className="space-y-1.5 my-auto">
              <div className="h-2 w-3/4 bg-border-light rounded-sm" />
              <div className="h-2 w-full bg-border-light/80 rounded-sm" />
              <div className="h-2 w-5/6 bg-border-light/60 rounded-sm" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-divider">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-[9px] font-mono text-text-muted">100% Private</span>
            </div>
          </div>
        </div>
      );
    }

    if (category === "Images") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Checkered transparency mockup */}
          <div className="relative w-36 h-28 sm:w-44 sm:h-32 rounded-xl bg-surface-base border border-border-light shadow-premium-sm overflow-hidden flex flex-col">
            <div className="h-6 bg-surface-muted border-b border-border-light px-2.5 flex items-center justify-between">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>
              <span className="text-[9px] font-mono text-text-muted">lossless · web-ready</span>
            </div>
            <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:8px_8px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
                {slug.includes("background") ? (
                  <Wand2 className="w-7 h-7 text-amber-500 animate-pulse" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (category === "Developer") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Terminal / Code mockup */}
          <div className="w-36 h-28 sm:w-44 sm:h-32 rounded-xl bg-[#12161A] text-gray-200 border border-border-light shadow-premium-sm p-3 flex flex-col font-mono text-[10px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <Terminal className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="space-y-1 text-[11px] leading-tight flex-1">
              <p className="text-blue-400 font-bold">$ browser.exec()</p>
              <p className="text-emerald-400">✓ parseJson(valid)</p>
              <p className="text-gray-400 text-[10px]">0ms server latency</p>
            </div>
          </div>
        </div>
      );
    }

    if (category === "SEO") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Search snippet card */}
          <div className="w-40 h-28 sm:w-48 sm:h-32 rounded-xl bg-surface-base border border-border-light shadow-premium-sm p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                <Search className="w-2.5 h-2.5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                gainutility.com › {category.toLowerCase()}
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-4/5 bg-blue-600/20 dark:bg-blue-400/20 rounded-sm" />
              <div className="h-2 w-full bg-border-light rounded-sm" />
              <div className="h-2 w-3/4 bg-border-light/80 rounded-sm" />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted">
              <span>SERP Rank #1</span>
              <span className="text-emerald-600 font-bold">100% Score</span>
            </div>
          </div>
        </div>
      );
    }

    // Productivity / Workflow
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-36 h-28 sm:w-44 sm:h-32 rounded-xl bg-surface-base border border-border-light shadow-premium-sm p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-violet-600 uppercase">Calculator</span>
            <Clock className="w-4 h-4 text-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 py-1">
            <div className="p-1.5 rounded bg-surface-muted text-center">
              <span className="text-[9px] text-text-muted block">Hours</span>
              <span className="text-xs font-mono font-bold text-text-main">40.0</span>
            </div>
            <div className="p-1.5 rounded bg-violet-500/10 text-center">
              <span className="text-[9px] text-violet-600 block">Billable</span>
              <span className="text-xs font-mono font-bold text-violet-600">$125/h</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-text-muted text-center border-t border-divider pt-1">
            Instant Client-Side Math
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${theme.border} bg-gradient-to-br ${theme.gradient} transition-all duration-300 group-hover:scale-[1.01] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle background tech grid */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

      {/* Category corner badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs ${theme.badgeBg}`}>
          {theme.badgeText}
        </span>
      </div>

      {/* Visual illustration center */}
      <div className={`w-full h-full flex items-center justify-center p-4 ${featured ? "min-h-[220px] sm:min-h-[280px]" : "min-h-[170px] sm:min-h-[190px]"}`}>
        {renderIllustration()}
      </div>
    </div>
  );
};
