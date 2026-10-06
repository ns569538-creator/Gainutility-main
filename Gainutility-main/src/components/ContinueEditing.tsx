/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  FileImage, 
  Crop, 
  Sliders, 
  Type, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  FileText,
  Lock,
  RotateCw,
  Scissors,
  Grid,
  Heart,
  Code2,
  FileCode,
  FileSearch,
  CheckCircle,
  Minimize2,
  KeyRound,
  Unlock,
  Maximize2,
  Palette,
  QrCode
} from "lucide-react";
import { ToolId, ViewState } from "../types";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";
import { getToolExternalNotice } from "../studioIcons";
import { absoluteUrl } from "../site";
import { publicPathForView } from "../router";

/**
 * Tools whose page actually renders <ContinueEditing>.
 *
 * Layout uses this to decide whether the "Related tools" grid should hide the
 * handoff targets: filtering by WORKFLOW_GRAPH unconditionally removed cards
 * from pages that never render the handoff section at all, shrinking the
 * internal-link graph for no reason.
 */
export const CONTINUE_EDITING_TOOLS: ReadonlySet<string> = new Set([
  "canonical-url-generator",
  "collage-maker",
  "favicon-generator",
  "google-serp-preview",
  "hreflang-tag-generator",
  "image-blur-pixelate",
  "image-converter",
  "image-cropper",
  "image-resizer",
  "image-watermark",
  "logo-maker",
  "robots-txt-generator",
  "schema-markup-generator",
  "seo-meta-generator",
  "social-resizer",
  "twitter-card-generator",
  "utm-builder",
  "xml-sitemap-generator",
]);

// Handoff types
export interface HandoffFile {
  file: File;
  name: string;
  originalSize: number;
}

export interface HandoffSeoData {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  siteName?: string;
}

// Global window declaration
declare global {
  interface Window {
    __gainutility_handoff_files?: HandoffFile[];
    __gainutility_handoff_json?: string;
    __gainutility_handoff_seo?: HandoffSeoData;
  }
}

interface ContinueEditingProps {
  currentToolId?: ToolId;
  files?: any[]; // ImageFileItem or raw files
  jsonContent?: string;
  seoData?: HandoffSeoData;
  onChangeView?: (view: ViewState, options?: { clickedElementId?: string }) => void;
  onAddToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

interface WorkflowTool {
  id: ToolId;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

/**
 * Workflow-aware next-step recommendations.
 *
 * WORKFLOW_TOOLS holds rich metadata for every tool that can be handed off to.
 * WORKFLOW_GRAPH encodes real, useful hand-off sequences: each tool lists the
 * next steps that make sense *with the current output in hand* (e.g. after
 * compressing an image, resize or convert; after merging PDFs, compress).
 * Tools without an explicit entry fall back to a curated default list rather
 * than a dump of everything in their category.
 */
const WORKFLOW_TOOLS: Record<string, WorkflowTool> = {
  "image-resizer": { id: "image-resizer", name: "Resize Image", desc: "Set exact pixel dimensions or multipliers.", icon: <Sliders className="w-5 h-5 text-brand-primary" /> },
  "image-cropper": { id: "image-cropper", name: "Crop Image", desc: "Trim aspect ratios visually with guides.", icon: <Crop className="w-5 h-5 text-brand-primary" /> },
  "image-converter": { id: "image-converter", name: "Convert Image", desc: "Switch between JPG, PNG, WebP, and AVIF.", icon: <FileImage className="w-5 h-5 text-brand-primary" /> },
  "png-jpg-converter": { id: "png-jpg-converter", name: "PNG ↔ JPG", desc: "Flip transparent PNGs to JPG or back.", icon: <RefreshCw className="w-5 h-5 text-brand-primary" /> },
  "image-watermark": { id: "image-watermark", name: "Image Watermark", desc: "Safeguard assets with copyrights or logos.", icon: <Type className="w-5 h-5 text-brand-primary" /> },
  "image-blur-pixelate": { id: "image-blur-pixelate", name: "Blur & Pixelate", desc: "Censor faces, details, or sensitive cards.", icon: <EyeOff className="w-5 h-5 text-brand-primary" /> },
  "social-resizer": { id: "social-resizer", name: "Social Resizer", desc: "Crop with safe-zones for 12+ platforms.", icon: <Sparkles className="w-5 h-5 text-brand-primary" /> },
  "favicon-generator": { id: "favicon-generator", name: "Favicon Generator", desc: "Create multi-size icons and PWA assets.", icon: <Heart className="w-5 h-5 text-brand-primary" /> },
  "logo-maker": { id: "logo-maker", name: "Free Logo Maker", desc: "Create and customize SVG and PNG logos.", icon: <Sparkles className="w-5 h-5 text-brand-primary" /> },
  "collage-maker": { id: "collage-maker", name: "Collage Maker", desc: "Join photos into templates and grids.", icon: <Grid className="w-5 h-5 text-brand-primary" /> },
  "background-remover": { id: "background-remover", name: "Background Remover", desc: "AI-powered background removal with clean edges.", icon: <Sparkles className="w-5 h-5 text-brand-primary" /> },
  "image-metadata-remover": { id: "image-metadata-remover", name: "Metadata Remover", desc: "Strip EXIF and GPS data from photos.", icon: <Lock className="w-5 h-5 text-brand-primary" /> },
  "image-upscaler": { id: "image-upscaler", name: "Image Upscaler", desc: "Enlarge images while smoothing edges.", icon: <Maximize2 className="w-5 h-5 text-brand-primary" /> },
  "passport-photo-maker": { id: "passport-photo-maker", name: "Passport Photo", desc: "Fit portraits to official document sizes.", icon: <FileImage className="w-5 h-5 text-brand-primary" /> },

  "merge-pdf": { id: "merge-pdf", name: "Merge PDF", desc: "Join multiple documents into one compiled file.", icon: <FileText className="w-5 h-5 text-brand-primary" /> },
  "split-pdf": { id: "split-pdf", name: "Split PDF", desc: "Isolate individual ranges into separate cards.", icon: <Scissors className="w-5 h-5 text-brand-primary" /> },
  "compress-images-inside-pdf": { id: "compress-images-inside-pdf", name: "Compress Images Inside PDF", desc: "Shrink the embedded images to cut PDF size.", icon: <Minimize2 className="w-5 h-5 text-brand-primary" /> },
  "reduce-pdf-image-quality": { id: "reduce-pdf-image-quality", name: "Compress PDF", desc: "Downsample image quality across the document.", icon: <RefreshCw className="w-5 h-5 text-brand-primary" /> },
  "rotate-pdf": { id: "rotate-pdf", name: "Rotate PDF", desc: "Align landscape or upside-down pages.", icon: <RotateCw className="w-5 h-5 text-brand-primary" /> },
  "protect-pdf": { id: "protect-pdf", name: "Protect PDF", desc: "Enforce password layers and usage rights.", icon: <Lock className="w-5 h-5 text-brand-primary" /> },
  "unlock-pdf": { id: "unlock-pdf", name: "Unlock PDF", desc: "Strip owner restrictions (printing/copying limits).", icon: <KeyRound className="w-5 h-5 text-brand-primary" /> },
  "remove-pdf-password": { id: "remove-pdf-password", name: "Remove PDF Password", desc: "Drop protection from a PDF you can open.", icon: <Unlock className="w-5 h-5 text-brand-primary" /> },
  "pdf-to-jpg": { id: "pdf-to-jpg", name: "PDF to JPG", desc: "Rasterize pages into images offline.", icon: <FileImage className="w-5 h-5 text-brand-primary" /> },
  "jpg-to-pdf": { id: "jpg-to-pdf", name: "Image to PDF", desc: "Pack images into a paginated PDF.", icon: <FileText className="w-5 h-5 text-brand-primary" /> },
  "pdf-to-word": { id: "pdf-to-word", name: "PDF to Word", desc: "Convert PDFs into editable DOCX files.", icon: <FileCode className="w-5 h-5 text-brand-primary" /> },
  "word-to-pdf": { id: "word-to-pdf", name: "Word to PDF", desc: "Convert DOCX documents into PDFs.", icon: <FileText className="w-5 h-5 text-brand-primary" /> },
  "webp-converter": { id: "webp-converter", name: "WebP Converter", desc: "Convert images to and from WebP.", icon: <RefreshCw className="w-5 h-5 text-brand-primary" /> },
  "qr-code-generator": { id: "qr-code-generator", name: "QR Code Generator", desc: "Create QR codes as PNG or SVG.", icon: <QrCode className="w-5 h-5 text-brand-primary" /> },
  "image-to-palette": { id: "image-to-palette", name: "Image to Palette", desc: "Extract a color palette from a photo.", icon: <Palette className="w-5 h-5 text-brand-primary" /> },
  "extract-pdf": { id: "extract-pdf", name: "Extract PDF Pages", desc: "Pull specific page ranges into a new file.", icon: <Scissors className="w-5 h-5 text-brand-primary" /> },
  "add-pdf-watermark": { id: "add-pdf-watermark", name: "Add Watermark to PDF", desc: "Overlay text or image watermarks.", icon: <Type className="w-5 h-5 text-brand-primary" /> },

  "json-formatter": { id: "json-formatter", name: "JSON Formatter", desc: "Indent and beautify schema parameters clearly.", icon: <FileCode className="w-5 h-5 text-brand-primary" /> },
  "json-validator": { id: "json-validator", name: "JSON Validator", desc: "Audit syntax and RFC definition nodes.", icon: <FileSearch className="w-5 h-5 text-brand-primary" /> },
  "json-minifier": { id: "json-minifier", name: "JSON Minifier", desc: "Strip whitespace, breaks, and comments.", icon: <Minimize2 className="w-5 h-5 text-brand-primary" /> },
  "json-beautifier": { id: "json-beautifier", name: "JSON Beautifier", desc: "Unpack minified feeds into readable models.", icon: <Code2 className="w-5 h-5 text-brand-primary" /> },
  "json-compare-diff": { id: "json-compare-diff", name: "Compare JSON", desc: "Highlight changes between two documents.", icon: <RefreshCw className="w-5 h-5 text-brand-primary" /> },
  "json-to-csv": { id: "json-to-csv", name: "JSON to CSV", desc: "Flatten arrays into spreadsheet tables.", icon: <Grid className="w-5 h-5 text-brand-primary" /> },
  "csv-json-converter": { id: "csv-json-converter", name: "CSV to JSON", desc: "Turn tabular data into structured JSON.", icon: <FileCode className="w-5 h-5 text-brand-primary" /> },

  "seo-meta-generator": { id: "seo-meta-generator", name: "Meta Tag Generator", desc: "Generate and validate clean HTML headers.", icon: <Sliders className="w-5 h-5 text-brand-primary" /> },
  "og-meta-generator": { id: "og-meta-generator", name: "Open Graph Generator", desc: "Design Facebook and LinkedIn rich snippets.", icon: <Sparkles className="w-5 h-5 text-brand-primary" /> },
  "twitter-card-generator": { id: "twitter-card-generator", name: "Twitter Card Generator", desc: "Optimize summary cards for X.", icon: <RefreshCw className="w-5 h-5 text-brand-primary" /> },
  "google-serp-preview": { id: "google-serp-preview", name: "SERP Preview", desc: "Check title and description truncation.", icon: <Crop className="w-5 h-5 text-brand-primary" /> },
  "schema-markup-generator": { id: "schema-markup-generator", name: "Schema Generator", desc: "Build JSON-LD structured data.", icon: <Code2 className="w-5 h-5 text-brand-primary" /> },
  "utm-builder": { id: "utm-builder", name: "UTM Builder", desc: "Build campaign URLs with consistent tags.", icon: <Grid className="w-5 h-5 text-brand-primary" /> },
  "canonical-url-generator": { id: "canonical-url-generator", name: "Canonical URL", desc: "Prevent duplicate indexing cleanly.", icon: <FileSearch className="w-5 h-5 text-brand-primary" /> },
  "hreflang-tag-generator": { id: "hreflang-tag-generator", name: "hreflang Generator", desc: "Signal regional alternates to crawlers.", icon: <CheckCircle className="w-5 h-5 text-brand-primary" /> },
  "robots-txt-generator": { id: "robots-txt-generator", name: "Robots.txt Generator", desc: "Compose crawler allow/disallow rules.", icon: <FileCode className="w-5 h-5 text-brand-primary" /> },
  "xml-sitemap-generator": { id: "xml-sitemap-generator", name: "XML Sitemap Generator", desc: "Build a prioritized sitemap for crawlers.", icon: <Grid className="w-5 h-5 text-brand-primary" /> },
  "check-my-website": { id: "check-my-website", name: "Check My Website", desc: "Scan a URL for health and SEO findings.", icon: <FileSearch className="w-5 h-5 text-brand-primary" /> },
  "launch-checklist": { id: "launch-checklist", name: "Launch Checklist", desc: "Gate launch with critical/important items.", icon: <CheckCircle className="w-5 h-5 text-brand-primary" /> },
};

export const WORKFLOW_GRAPH: Partial<Record<string, ToolId[]>> = {
  // Image workflows — output of one feeds the next.
  "image-resizer": ["favicon-generator", "image-cropper", "image-converter", "social-resizer"],
  "image-cropper": ["image-resizer", "social-resizer", "image-watermark", "image-blur-pixelate"],
  "image-converter": ["image-watermark", "image-resizer", "jpg-to-pdf", "favicon-generator"],
  "png-jpg-converter": ["image-converter", "image-resizer", "social-resizer"],
  "webp-converter": ["image-converter", "image-to-palette", "favicon-generator"],
  "image-watermark": ["image-converter", "image-resizer", "social-resizer"],
  "image-blur-pixelate": ["image-converter", "image-watermark", "social-resizer"],
  "image-upscaler": ["image-converter", "image-cropper", "image-resizer"],
  "background-remover": ["image-converter", "image-resizer", "collage-maker", "image-watermark"],
  "image-metadata-remover": ["image-converter", "image-cropper", "image-resizer"],
  "social-resizer": ["image-resizer", "image-cropper", "collage-maker"],
  "favicon-generator": ["logo-maker", "image-converter", "image-resizer"],
  "logo-maker": ["favicon-generator", "image-resizer", "image-converter"],
  "collage-maker": ["image-resizer", "image-cropper", "image-converter"],
  "passport-photo-maker": ["image-resizer", "image-cropper", "image-watermark"],
  "jpg-to-pdf": ["merge-pdf", "compress-images-inside-pdf", "pdf-to-jpg"],
  "pdf-to-jpg": ["merge-pdf", "compress-images-inside-pdf", "split-pdf", "image-resizer"],

  // PDF workflows.
  "merge-pdf": ["split-pdf", "compress-images-inside-pdf", "protect-pdf", "pdf-to-word"],
  "split-pdf": ["compress-images-inside-pdf", "merge-pdf", "extract-pdf", "pdf-to-jpg"],
  "rotate-pdf": ["merge-pdf", "compress-images-inside-pdf", "extract-pdf", "pdf-to-word"],
  "extract-pdf": ["merge-pdf", "compress-images-inside-pdf", "pdf-to-jpg"],
  "protect-pdf": ["unlock-pdf", "remove-pdf-password", "compress-images-inside-pdf", "merge-pdf"],
  "unlock-pdf": ["remove-pdf-password", "compress-images-inside-pdf", "merge-pdf"],
  "remove-pdf-password": ["unlock-pdf", "compress-images-inside-pdf", "merge-pdf"],
  "add-pdf-watermark": ["compress-images-inside-pdf", "merge-pdf", "protect-pdf"],
  "pdf-to-word": ["word-to-pdf", "compress-images-inside-pdf", "merge-pdf"],
  "word-to-pdf": ["merge-pdf", "compress-images-inside-pdf", "protect-pdf"],

  // JSON workflows.
  "json-beautifier": ["json-validator", "json-minifier", "json-compare-diff"],
  "json-tree-viewer": ["json-validator", "json-minifier", "json-compare-diff"],
  "json-compare-diff": ["json-validator", "json-minifier", "json-to-csv"],
  "json-validator": ["json-beautifier", "json-minifier", "json-to-csv"],
  "json-minifier": ["json-beautifier", "json-validator", "json-compare-diff"],
  "json-to-csv": ["csv-json-converter", "json-beautifier", "json-validator"],
  "csv-json-converter": ["json-to-csv", "json-beautifier", "json-validator"],

  // SEO workflows — output of one feeds the next.
  "seo-meta-generator": ["og-meta-generator", "twitter-card-generator", "google-serp-preview", "schema-markup-generator"],
  "og-meta-generator": ["twitter-card-generator", "google-serp-preview", "seo-meta-generator"],
  "twitter-card-generator": ["og-meta-generator", "google-serp-preview", "seo-meta-generator"],
  "google-serp-preview": ["seo-meta-generator", "schema-markup-generator", "og-meta-generator"],
  "schema-markup-generator": ["google-serp-preview", "seo-meta-generator", "og-meta-generator"],
  "utm-builder": ["canonical-url-generator", "hreflang-tag-generator", "qr-code-generator", "google-serp-preview"],
  "canonical-url-generator": ["hreflang-tag-generator", "google-serp-preview", "seo-meta-generator"],
  "hreflang-tag-generator": ["canonical-url-generator", "google-serp-preview", "seo-meta-generator"],
  "robots-txt-generator": ["xml-sitemap-generator", "check-my-website", "launch-checklist"],
  "xml-sitemap-generator": ["robots-txt-generator", "check-my-website", "launch-checklist"],
  "check-my-website": ["launch-checklist", "seo-meta-generator", "robots-txt-generator", "xml-sitemap-generator"],
  "launch-checklist": ["check-my-website", "seo-meta-generator", "og-meta-generator", "schema-markup-generator"],
};

/** Fallback ordering when a tool has no explicit graph entry. */
const DEFAULT_ORDER: ToolId[] = [
  "image-resizer", "image-converter", "merge-pdf", "split-pdf", "compress-images-inside-pdf",
  "json-beautifier", "json-validator", "seo-meta-generator", "og-meta-generator",
];

export const ContinueEditing: React.FC<ContinueEditingProps> = ({
  currentToolId,
  files = [],
  jsonContent = "",
  seoData,
  onChangeView,
  onAddToast
}) => {
  if (!onChangeView) return null;

  const locale = useLocale();
  const toolId = currentToolId || "";

  // Detect a coarse category only for the hint copy (JSON / file workflows).
  let category: "image" | "pdf" | "json" | "seo" = "image";
  const isJsonTool = toolId.startsWith("json") || toolId === "csv-json-converter" || toolId === "json-to-csv";
  const isSeoTool = [
    "seo-meta-generator", "og-meta-generator", "twitter-card-generator", "robots-txt-generator",
    "xml-sitemap-generator", "schema-markup-generator", "utm-builder", "canonical-url-generator",
    "hreflang-tag-generator", "google-serp-preview",
    "check-my-website", "launch-checklist",
  ].includes(toolId);

  if (isJsonTool) {
    category = "json";
  } else if (isSeoTool) {
    category = "seo";
  } else if (
    toolId === "jpg-to-pdf" ||
    toolId === "pdf-to-jpg" ||
    toolId === "pdf-to-word" ||
    toolId === "word-to-pdf" ||
    toolId.includes("pdf")
  ) {
    category = "pdf";
  }

  // Resolve workflow-aware recommendations from the directed graph.
  const recommendations = (() => {
    const orderedIds = WORKFLOW_GRAPH[toolId] ?? DEFAULT_ORDER;
    return orderedIds
      .map((id) => WORKFLOW_TOOLS[id])
      .filter((t): t is WorkflowTool => Boolean(t) && t.id !== toolId)
      .slice(0, 4);
  })();

  // Handle handoff navigation
  const handleNavigateToTool = async (targetId: ToolId, targetName: string) => {
    if (category === "image" || category === "pdf") {
      // Find the most appropriate files to carry forward.
      // If there are processed files, use those! Otherwise, use original files.
      const handoffItems: HandoffFile[] = [];

      for (const item of files) {
        // Look for processedDataUrl or originalDataUrl
        const dataUrlToUse = item.processedDataUrl || item.originalDataUrl;
        if (!dataUrlToUse) continue;

        try {
          // Convert dataUrl back to a Blob / File
          const res = await fetch(dataUrlToUse);
          const blob = await res.blob();
          
          let ext = "jpg";
          if (blob.type.includes("png")) ext = "png";
          else if (blob.type.includes("webp")) ext = "webp";
          else if (blob.type.includes("gif")) ext = "gif";
          else if (blob.type.includes("pdf")) ext = "pdf";

          // Format clean handoff filename
          let cleanName = item.name;
          // Strip existing extension
          cleanName = cleanName.replace(/\.[^/.]+$/, "");
          // Append proper suffix and ext
          cleanName = `${cleanName}_processed.${ext}`;

          const fileObj = new File([blob], cleanName, { type: blob.type });
          handoffItems.push({
            file: fileObj,
            name: cleanName,
            originalSize: fileObj.size
          });
        } catch (err) {
          console.error("Failed to parse file for handoff", err);
        }
      }

      if (handoffItems.length > 0) {
        window.__gainutility_handoff_files = handoffItems;
        if (onAddToast) {
          onAddToast(`Smart handoff active! Passed ${handoffItems.length} file(s) into ${targetName}.`, "success");
        }
      } else {
        if (onAddToast) {
          onAddToast("No processed files found to continue editing.", "warning");
        }
        return;
      }
    } else if (category === "json") {
      if (jsonContent) {
        window.__gainutility_handoff_json = jsonContent;
        if (onAddToast) {
          onAddToast("Passed schema structure into next editor tool.", "success");
        }
      } else {
        if (onAddToast) {
          onAddToast("No JSON content found to continue editing.", "warning");
        }
        return;
      }
    } else if (category === "seo") {
      if (seoData) {
        window.__gainutility_handoff_seo = seoData;
        if (onAddToast) {
          onAddToast(`Smart handoff active! Passed metadata for "${seoData.title || seoData.url}" into ${targetName}.`, "success");
        }
      } else {
        // Even if empty, allow transition
        window.__gainutility_handoff_seo = {};
      }
    }

    // Trigger navigation
    if (onChangeView) {
      onChangeView({ type: "tool", id: targetId }, { clickedElementId: `continue-edit-${targetId}` });
    }
  };

  const externalNotice = toolId ? getToolExternalNotice(toolId) : undefined;

  return (
    <section
      aria-label={t("nextStep", locale)}
      className="bg-surface-base border border-border-light rounded-[20px] p-5 md:p-6 shadow-premium-sm space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-sans font-bold tracking-tight text-text-main">
          {t("nextStep", locale)}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          {category === "json"
            ? t("relatedToolsJsonHint", locale)
            : t("relatedToolsFilesHint", locale)}
        </p>
      </div>

      <div className="gu-related">
        {recommendations.map((rec) => (
          <a
            key={rec.id}
            id={`continue-edit-${rec.id}`}
            href={absoluteUrl(publicPathForView({ type: "tool", id: rec.id }, locale))}
            onClick={(e) => {
              e.preventDefault();
              handleNavigateToTool(rec.id, rec.name);
            }}
            className="gu-related-card gu-focus group relative flex flex-col gap-2.5 rounded-[16px] border border-border-light bg-surface-muted/20 hover:border-brand-primary hover:bg-surface-muted/40 hover:shadow-premium-sm transition-all duration-200 cursor-pointer p-4 text-left min-w-0"
          >
            <span className="p-2 bg-brand-primary-light/80 text-brand-primary rounded-lg inline-block self-start group-hover:bg-brand-primary/20 transition-colors duration-200">
              {rec.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-sans font-semibold text-sm text-text-main group-hover:text-brand-primary transition-colors break-words leading-snug">
                {rec.name}
              </span>
              <span className="block text-xs text-text-muted leading-relaxed mt-0.5">
                {rec.desc}
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* Privacy indicator — consistent local-processing statement, or the
          real external-service disclosure for tools that call one. */}
      <div className="flex items-start gap-2 pt-4 border-t border-border-light/50">
        <Lock className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed">
          {externalNotice || t("privacyNoticeDefault", locale)}
        </p>
      </div>
    </section>
  );
};
