/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Centralized SVG icon system + tool trust statements for the whole platform.
 * Every Studio page, home page, search index and tool header draws from this
 * single source so one tool can never render two different icons.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Ampersands,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  BellRing,
  Binary,
  Bird,
  BookOpen,
  Bot,
  Braces,
  Calculator,
  CalendarClock,
  Camera,
  CaseSensitive,
  ChartNoAxesCombined,
  Check,
  CircleCheck,
  Clapperboard,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Code2,
  CodeXml,
  Columns2,
  Columns3,
  Combine,
  Compass,
  Contrast,
  Copy,
  Crop,
  Database,
  Diff,
  DollarSign,
  Droplet,
  Eraser,
  Eye,
  EyeOff,
  FileArchive,
  FileBox,
  FileCheck,
  FileCheck2,
  FileCode,
  FileCode2,
  FileDiff,
  FileDown,
  FileEdit,
  FileImage,
  FileInput,
  FileJson,
  FileKey,
  FileMinus,
  FileMinus2,
  FileOutput,
  FileSignature,
  FileSpreadsheet,
  FileStack,
  FileText,
  FileVideo,
  FileX,
  Files,
  Film,
  Fingerprint,
  Filter,
  Frame,
  Gauge,
  GitCompare,
  GitCompareArrows,
  Globe,
  Grid2x2,
  Hash,
  IdCard,
  Image,
  ImageDown,
  ImageMinus,
  ImageUp,
  Images,
  IndentIncrease,
  KeyRound,
  Languages,
  Layers,
  LayoutGrid,
  Lightbulb,
  Link,
  List,
  Link2,
  ListOrdered,
  ListTree,
  ListVideo,
  LockKeyhole,
  LockOpen,
  Maximize,
  Minimize,
  Monitor,
  MonitorPlay,
  Music,
  MoveHorizontal,
  Network,
  Package,
  Paintbrush,
  Palette,
  PenLine,
  Presentation,
  QrCode,
  ReceiptText,
  Regex,
  RefreshCw,
  Repeat,
  Rocket,
  RotateCw,
  Rows2,
  Rows3,
  Ruler,
  ScanSearch,
  ScanText,
  Scissors,
  Search,
  Share2,
  Sheet,
  ShieldCheck,
  Shuffle,
  Signature,
  Smartphone,
  Sparkles,
  Split,
  Squircle,
  Stamp,
  Stethoscope,
  SwatchBook,
  Table,
  Table2,
  Tags,
  Text,
  Timer,
  Trash2,
  Type,
  Unlock,
  User,
  Video,
  Wand2,
  Waypoints,
  Wrench,
  Youtube,
  Zap,
} from "lucide-react";
import type { ToolId } from "./types";

/* ── TOOL ICONS ──────────────────────────────────────────────────────────
 * Mapped by tool slug (not by studio/category) so each utility keeps its own
 * identity even when the same tool appears in more than one Studio. */

export const toolIcons: Record<string, LucideIcon> = {
  /* JSON Studio */
  "json-formatter": Braces,
  "json-viewer": Eye,
  "json-compare": Columns2,
  "json-validator": CircleCheck,
  "json-minifier": Minimize,
  "json-beautifier": IndentIncrease,
  "json-tree-viewer": ListTree,
  "json-compare-diff": GitCompareArrows,
  "json-to-csv": Table,

  /* CSS Studio */
  "gradient-generator": Paintbrush,
  "box-shadow-generator": Layers,
  "border-radius-generator": Squircle,

  /* Color Studio */
  "contrast-checker": Contrast,
  "color-palette-generator": Palette,
  "color-picker": Droplet,
  "color-explorer": Compass,
  "color-visualizer": LayoutGrid,
  "image-to-palette": Images,
  /* Media Studio */
  "video-audio-extractor": Music,
  "video-compressor": Clapperboard,
  "video-resizer": MoveHorizontal,
  "video-trimmer": Film,
  "video-converter": Repeat,
  "video-to-gif": FileVideo,
  "photos-to-video": Video,
  "video-downloader": FileDown,
  "add-music-to-photo": Music,
  /* Developer Studio */
  "base64-tool": Binary,
  "qr-code-generator": QrCode,
  "url-encoder-decoder": ArrowLeftRight,
  "html-entity-encoder": Ampersands,
  "uuid-generator": Fingerprint,
  "jwt-decoder": FileKey,
  "password-generator": KeyRound,
  "password-strength-checker": ShieldCheck,
  "hash-generator": Hash,
  "regex-tester": Regex,
  "unix-timestamp-converter": Clock,
  "cron-expression-builder": CalendarClock,
  "text-diff-checker": FileDiff,
  "json-schema-validator": FileCheck2,
  "jsonpath-tester": ScanSearch,
  "csv-json-converter": ArrowUpDown,
  "xml-json-converter": CodeXml,
  "sql-formatter": Database,
  "yaml-formatter": AlignLeft,
  "http-status-code-lookup": Gauge,
  "mime-type-lookup": FileBox,
  "url-parser": Link2,
  "image-metadata-remover": FileMinus2,
  "csv-reconciliation": Sheet,
  "excel-formula-generator": Calculator,
  "billable-hours-calculator": DollarSign,
  "invoice-follow-up-tracker": BellRing,
  "font-detector": Type,

  /* Image Studio */
  "image-resizer": Maximize,
  "image-cropper": Crop,
  "image-converter": ArrowLeftRight,
  "webp-converter": Images,
  "png-jpg-converter": RefreshCw,
  "heic-jpg-converter": ImageDown,
  "svg-converter": FileCode2,
  "image-watermark": Wand2,
  "image-blur-pixelate": EyeOff,
  "social-resizer": Smartphone,
  "favicon-generator": Grid2x2,
  "logo-maker": Sparkles,
  "collage-maker": LayoutGrid,
  "background-remover": Eraser,
  "passport-photo-maker": IdCard,
  "image-upscaler": ImageUp,
  "signature-maker": PenLine,

  /* SEO Studio */
  "seo-meta-generator": Tags,
  "og-meta-generator": Share2,
  "twitter-card-generator": Bird,
  "robots-txt-generator": Bot,
  "xml-sitemap-generator": Network,
  "schema-markup-generator": FileJson,
  "utm-builder": Filter,
  "canonical-url-generator": Link,
  "hreflang-tag-generator": Languages,
  "google-serp-preview": Search,
  "slug-generator": Waypoints,

  /* Website Studio */
  "check-my-website": Stethoscope,
  "launch-checklist": Rocket,

  /* PDF Studio — Security */
  "protect-pdf": LockKeyhole,
  "unlock-pdf": Unlock,
  "remove-pdf-password": LockOpen,
  "add-pdf-watermark": Stamp,
  "flatten-pdf": FileCheck,

  /* PDF Studio — Organize */
  "merge-pdf": Files,
  "split-pdf": Scissors,
  "rotate-pdf": RotateCw,
  "jpg-to-pdf": ImageDown,
  "pdf-to-jpg": Image,
  "extract-pdf": FileDown,
  "delete-pdf": Trash2,
  "rearrange-pdf": Shuffle,
  "add-pdf-page-numbers": ListOrdered,
  "add-pdf-header-footer": Text,
  "crop-pdf": Frame,
  "duplicate-page-finder-pdf": Copy,
  "remove-blank-pages-pdf": FileX,
  "reverse-page-order-pdf": ArrowUpDown,
  "extract-odd-pages-pdf": Rows2,
  "extract-even-pages-pdf": Rows3,

  /* PDF Studio — Convert */
  "word-to-pdf": FileText,
  "pdf-to-word": FileEdit,
  "excel-to-pdf": FileSpreadsheet,
  "pdf-to-excel": Table2,
  "powerpoint-to-pdf": Presentation,
  "pdf-to-powerpoint": Monitor,
  "html-to-pdf": Globe,
  "pdf-to-text": FileOutput,
  "text-to-pdf": FileInput,
  "pdf-to-html": FileCode,
  "pdf-translator": Languages,

  /* PDF Studio — Optimize */
  "remove-pdf-metadata": FileMinus,
  "repair-pdf": Wrench,
  "validate-pdf": BadgeCheck,
  "optimize-pdf-web": Zap,
  "reduce-pdf-image-quality": ImageMinus,
  "compress-images-inside-pdf": Package,

  /* PDF Studio — Advanced */
  "ocr-pdf": ScanText,
  "compare-two-pdfs": GitCompare,
  "merge-selected-page-ranges": Combine,
  "split-by-file-size": Ruler,
  "split-every-n-pages": Split,
  "pdf-difference-checker": Diff,
  "business-pdf-extractor": ReceiptText,

  /* Creator Studio */
  "stylish-name-generator": Sparkles,
  "linkedin-carousel-maker": Columns3,
  "youtube-thumbnail-preview": MonitorPlay,
  "youtube-title-analyzer": CaseSensitive,
  "youtube-timestamp-formatter": Timer,
  "youtube-chapter-generator": ListVideo,
  "youtube-embed-generator": Code2,
  "youtube-url-toolkit": Youtube,
  "thumbnail-safe-zone": Grid2x2,
  "youtube-description-formatter": List,
  "youtube-keyword-explorer": Lightbulb,

  /* Exam & Application */
  "application-file-checker": ClipboardCheck,
  "exam-photo-fixer": Camera,
  "exam-signature-fixer": Signature,
  "exam-thumb-fixer": Fingerprint,
  "declaration-fixer": FileSignature,
  "pdf-exact-size": Ruler,
  "exam-file-requirements": ClipboardList,
};

/* ── TOOL ICON COMPONENT ─────────────────────────────────────────────────
 * One lightweight, consistent SVG for every tool card. Decorative by
 * default (aria-hidden) — the surrounding text carries the meaning. */

interface ToolIconProps {
  slug: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ToolIcon = ({
  slug,
  size = 20,
  strokeWidth = 1.8,
  className = "",
}: ToolIconProps) => {
  const Icon = toolIcons[slug] ?? Wrench;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={`text-text-main transition-colors duration-200 group-hover:text-brand-primary ${className}`}
    />
  );
};

/* ── COMPOSED TOOL VISUALS ────────────────────────────────────────────────
 * A small, data-driven diagram for the tools people reach for most. Each
 * "before → after" scene is built from the same tiny vocabulary (mini file
 * tiles, arrows, badges) so the whole directory reads as one system while
 * every popular tool is still identifiable at a glance. Decorative only —
 * card text carries the meaning. Falls back to the tool's standard icon. */

/** Miniature QR impression (three finder squares + data modules). */
const QrGlyph = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path fill="currentColor" d="M3 3h7v7H3zm1 1v5h5V4H4z" />
    <path fill="currentColor" d="M14 3h7v7h-7zm1 1v5h5V4h-5z" />
    <path fill="currentColor" d="M3 14h7v7H3zm1 1v5h5v-5H4z" />
    <path fill="currentColor" d="M14 14h2v2h-2zM14 18h2v3h-2zM18 14h3v2h-3zM18 17h1v1h-1zM18 20h3v1h-3zM14 17h5v1h-5zM21 14v2h-1v-2z" />
  </svg>
);

/** LinkedIn "in" monogram (Simple Icons path, CC0). */
const LinkedInGlyph = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/** Miniature page tile carrying a format or page label (JPG, PDF, 1, 2...). */
const VFormatTag = ({
  label,
  tone = "neutral",
  small = false,
}: {
  label: string;
  tone?: "neutral" | "brand" | "image";
  small?: boolean;
}) => (
  <span
    className={`flex items-center justify-center rounded-[4px] border font-mono font-bold leading-none select-none ${
      small ? "h-[8px] w-[13px] text-[5px]" : "h-[19px] text-[7px]"
    } ${
      tone === "brand"
        ? "border-brand-primary/40 bg-brand-primary-light text-brand-primary"
        : tone === "image"
          ? "border-border-medium bg-surface-base text-text-main"
          : "border-border-light bg-background text-text-muted"
    }`}
    style={!small ? { width: Math.max(13, Math.ceil(label.length * 4.2 + 2)) } : undefined}
    aria-hidden="true"
  >
    {label}
  </span>
);

const VArrow = () => (
  <ArrowRight strokeWidth={2.6} className="w-[8px] h-[8px] text-text-muted shrink-0" aria-hidden="true" />
);

/** Corner badge used as a status "seal" anchored to the icon placeholder. */
const VBadge = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <span
    className={`gu-vbadge absolute top-[2px] right-[2px] w-[15px] h-[15px] rounded-full grid place-items-center ${className}`}
    aria-hidden="true"
  >
    {children}
  </span>
);

/** Three stacked page lines — the "content" glyph used inside PDF tiles. */
const VLines = ({ className = "" }: { className?: string }) => (
  <span className={`flex flex-col gap-[2px] ${className}`} aria-hidden="true">
    <span className="h-[2px] rounded-full bg-brand-primary/80 w-[10px]" />
    <span className="h-[2px] rounded-full bg-brand-primary/55 w-[8px]" />
    <span className="h-[2px] rounded-full bg-brand-primary/35 w-[5px]" />
  </span>
);

const VImageTile = ({ tone = "neutral" }: { tone?: "neutral" | "brand" }) => (
  <span
    className={`grid place-items-center h-[19px] w-[16px] rounded-[4px] border ${
      tone === "brand"
        ? "border-brand-primary/40 bg-brand-primary-light text-brand-primary"
        : "border-border-light bg-background text-text-muted"
    }`}
    aria-hidden="true"
  >
    <Image strokeWidth={2.4} className="w-[11px] h-[11px]" />
  </span>
);

/** One PDF "page" tile composed of a bordered box + content lines. */
const VPageTile = ({ tone = "neutral" }: { tone?: "neutral" | "brand" }) => (
  <span
    className={`flex flex-col items-center justify-center gap-[2px] h-[19px] w-[16px] rounded-[4px] border ${
      tone === "brand"
        ? "border-brand-primary/40 bg-brand-primary-light"
        : "border-border-light bg-background"
    }`}
    aria-hidden="true"
  >
    <VLines />
  </span>
);

/**
 * Rich, composed visuals keyed by tool slug. Tools without an entry fall
 * back to their standard ToolIcon inside the same tile (see ToolVisual).
 */
export const toolVisuals: Record<string, ReactNode> = {
  "jpg-to-pdf": (
    <span className="flex items-center gap-[2px]">
      <VFormatTag label="JPG" tone="image" />
      <VArrow />
      <VFormatTag label="PDF" tone="brand" />
    </span>
  ),
  "pdf-to-jpg": (
    <span className="flex items-center gap-[2px]">
      <VFormatTag label="PDF" tone="brand" />
      <VArrow />
      <VFormatTag label="JPG" tone="image" />
    </span>
  ),
  "image-converter": (
    <span className="flex items-center gap-[2px]">
      <VFormatTag label="PNG" tone="image" />
      <ArrowLeftRight strokeWidth={2.6} className="w-[8px] h-[8px] text-text-muted shrink-0" aria-hidden="true" />
      <VFormatTag label="WEBP" tone="image" />
    </span>
  ),
  "png-jpg-converter": (
    <span className="flex items-center gap-[2px]">
      <VFormatTag label="PNG" tone="image" />
      <ArrowLeftRight strokeWidth={2.6} className="w-[8px] h-[8px] text-text-muted shrink-0" aria-hidden="true" />
      <VFormatTag label="JPG" tone="image" />
    </span>
  ),
  "merge-pdf": (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      <span className="relative h-[19px] w-[16px]">
        <span className="absolute left-0 top-0 h-[17px] w-[13px] rounded-[4px] border border-border-light bg-surface-base" />
        <span className="absolute left-[3px] top-[2px] h-[17px] w-[13px] rounded-[4px] border border-border-medium bg-background" />
      </span>
      <VArrow />
      <VPageTile tone="brand" />
    </span>
  ),
  "split-pdf": (
    <span className="flex items-center gap-[2px]">
      <VPageTile tone="brand" />
      <VArrow />
      <span className="flex flex-col gap-[2px]" aria-hidden="true">
        <VFormatTag label="1" small />
        <VFormatTag label="2" small />
      </span>
    </span>
  ),
  "background-remover": (
    <span className="grid place-items-center" aria-hidden="true">
      <span className="absolute inset-0 grid place-items-center text-brand-primary/15">
        <Image strokeWidth={1.4} className="w-6 h-6" />
      </span>
      <User strokeWidth={2.4} className="w-5 h-5 text-text-main" />
      <VBadge className="bg-brand-primary text-white border border-background/50">
        <Check strokeWidth={3.2} className="w-2 h-2" />
      </VBadge>
    </span>
  ),
  "qr-code-generator": (
    <span className="grid place-items-center">
      <QrGlyph className="w-[26px] h-[26px] text-brand-primary" />
    </span>
  ),
  "json-validator": (
    <span className="grid place-items-center">
      <Braces strokeWidth={2} className="w-5 h-5 text-text-main" aria-hidden="true" />
      <VBadge className="bg-brand-primary text-white border border-background/50">
        <Check strokeWidth={3.2} className="w-2 h-2" />
      </VBadge>
    </span>
  ),
  "json-beautifier": (
    <span className="flex flex-col items-center justify-center gap-[3px]">
      <Braces strokeWidth={2.2} className="w-[15px] h-[15px] text-brand-primary" aria-hidden="true" />
      <span className="flex flex-col gap-[2px] w-[22px]" aria-hidden="true">
        <span className="h-[2px] rounded-full bg-brand-primary/80" />
        <span className="h-[2px] rounded-full bg-brand-primary/55 ml-1" />
        <span className="h-[2px] rounded-full bg-brand-primary/35 ml-2" />
      </span>
    </span>
  ),
  "linkedin-carousel-maker": (
    <span className="grid place-items-center" aria-hidden="true">
      <span className="flex flex-col gap-[2px]">
        <span className="h-[15px] w-[19px] rounded-[3px] border border-border-medium bg-surface-base" />
        <span className="h-[15px] w-[19px] rounded-[3px] border border-brand-primary/40 bg-brand-primary-light" />
      </span>
      <VBadge className="bg-[#0A66C2] text-white border border-background/50">
        <LinkedInGlyph className="w-[9px] h-[9px]" />
      </VBadge>
    </span>
  ),
};

/** Falls back to the standard icon when a slug has no composed visual. */
export const ToolVisual = ({
  slug,
  size = 44,
  className = "",
}: {
  slug: string;
  size?: number;
  className?: string;
}) => {
  const visual = toolVisuals[slug];
  return (
    <span
      className={`gu-tool-visual grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {visual ?? <ToolIcon slug={slug} size={Math.round(size * 0.5)} strokeWidth={1.7} />}
    </span>
  );
};

/* ── STUDIO HEADER ICONS ─────────────────────────────────────────────────
 * Category identity for each Studio header. Kept separate from the tool
 * card system on purpose. */

export const studioIcons: Record<string, LucideIcon> = {
  json: Braces,
  css: Paintbrush,
  color: Palette,
  developer: Code2,
  image: Image,
  pdf: FileStack,
  seo: ChartNoAxesCombined,
  security: ShieldCheck,
  creator: Video,
  converter: ArrowLeftRight,
  exam: ClipboardCheck,
};

interface StudioIconProps {
  studioId: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const StudioIcon = ({
  studioId,
  size = 32,
  strokeWidth = 1.8,
  className = "",
}: StudioIconProps) => {
  const Icon = studioIcons[studioId] ?? Code2;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={`text-brand-primary ${className}`}
    />
  );
};

/* ── TRUST STATEMENTS ────────────────────────────────────────────────────
 * A short, honest line per tool saying what actually happens to the data.
 * Only claims "stays local" / "never sent" for tools that genuinely process
 * everything in the browser. */

export const TOOL_TRUST: Record<ToolId, string> = {
  /* JSON */
  "json-formatter": "Formatted in your browser",
  "json-viewer": "Parsed in your browser",
  "json-compare": "Compared locally",
  "json-validator": "Validated in your browser",
  "json-minifier": "Minified in your browser",
  "json-beautifier": "Formatted in your browser",
  "json-tree-viewer": "Parsed in your browser",
  "json-compare-diff": "Compared locally",
  "json-to-csv": "Converted locally",

  /* CSS */
  "gradient-generator": "Generated, never sent",
  "box-shadow-generator": "Generated, never sent",
  "border-radius-generator": "Generated, never sent",

  /* Color */
  "contrast-checker": "Checked locally",
  "color-palette-generator": "Generated, never sent",
  "color-picker": "Picked in your browser",
  "color-explorer": "Reads built-in palette",
  "color-visualizer": "Rendered in your browser",
  "image-to-palette": "Image stays on your device",
  /* Media */
  "video-audio-extractor": "Processed in your browser",
  "video-compressor": "Processed in your browser",
  "video-resizer": "Processed in your browser",
  "video-trimmer": "Processed in your browser",
  "video-converter": "Processed in your browser",
  "video-to-gif": "Processed in your browser",
  "photos-to-video": "Processed in your browser",
  "video-downloader": "Link checked in your browser",
  "add-music-to-photo": "Processed in your browser",

  /* Developer */
  "base64-tool": "Encoded in your browser",
  "qr-code-generator": "Generated, never sent",
  "url-encoder-decoder": "Encoded in your browser",
  "html-entity-encoder": "Encoded in your browser",
  "uuid-generator": "Generated, never sent",
  "jwt-decoder": "Decoded in your browser",
  "password-generator": "Generated, never sent",
  "password-strength-checker": "Checked on your device",
  "hash-generator": "Hashed, never sent",
  "regex-tester": "Tested in your browser",
  "unix-timestamp-converter": "Converted in your browser",
  "cron-expression-builder": "Built in your browser",
  "text-diff-checker": "Compared locally",
  "json-schema-validator": "Validated in your browser",
  "jsonpath-tester": "Queried in your browser",
  "csv-json-converter": "Converted locally",
  "xml-json-converter": "Converted locally",
  "sql-formatter": "Formatted in your browser",
  "yaml-formatter": "Formatted in your browser",
  "http-status-code-lookup": "Reads built-in reference",
  "mime-type-lookup": "Reads built-in reference",
  "url-parser": "Parsed in your browser",
  "image-metadata-remover": "Stripped on your device",
  "csv-reconciliation": "Compared locally",
  "excel-formula-generator": "Generated, never sent",
  "billable-hours-calculator": "Calculated in your browser",
  "invoice-follow-up-tracker": "Kept in browser storage",
  "font-detector": "Previews load in your browser",

  /* Image */
  "image-resizer": "Processed in your browser",
  "image-cropper": "Processed in your browser",
  "image-converter": "Converted locally",
  "webp-converter": "Converted locally",
  "png-jpg-converter": "Converted locally",
  "heic-jpg-converter": "Converted locally",
  "svg-converter": "Converted locally",
  "image-watermark": "Image stays on your device",
  "image-blur-pixelate": "Image stays on your device",
  "social-resizer": "Processed in your browser",
  "favicon-generator": "Generated, never sent",
  "logo-maker": "Designed in your browser",
  "collage-maker": "Images stay on your device",
  "background-remover": "Image stays on your device",
  "passport-photo-maker": "Photo stays on your device",
  "image-upscaler": "Image stays on your device",
  "signature-maker": "Signature stays on your device",

  /* SEO */
  "seo-meta-generator": "Generated, never sent",
  "og-meta-generator": "Generated, never sent",
  "twitter-card-generator": "Generated, never sent",
  "robots-txt-generator": "Generated, never sent",
  "xml-sitemap-generator": "Generated, never sent",
  "schema-markup-generator": "Generated, never sent",
  "utm-builder": "Built in your browser",
  "canonical-url-generator": "Generated, never sent",
  "hreflang-tag-generator": "Generated, never sent",
  "google-serp-preview": "Previewed in your browser",
  "slug-generator": "Generated, never sent",

  /* Website Studio */
  "check-my-website": "URL fetched through GainUtility's server",
  "launch-checklist": "URL fetched through GainUtility's server",

  /* PDF — Security */
  "protect-pdf": "Encrypted on your device",
  "unlock-pdf": "Processed on your device",
  "remove-pdf-password": "Processed on your device",
  "add-pdf-watermark": "PDF stays in your browser",
  "flatten-pdf": "PDF stays in your browser",

  /* PDF — Organize */
  "merge-pdf": "PDF stays in your browser",
  "split-pdf": "PDF stays in your browser",
  "rotate-pdf": "PDF stays in your browser",
  "jpg-to-pdf": "PDF stays in your browser",
  "pdf-to-jpg": "PDF stays in your browser",
  "extract-pdf": "PDF stays in your browser",
  "delete-pdf": "PDF stays in your browser",
  "rearrange-pdf": "PDF stays in your browser",
  "add-pdf-page-numbers": "PDF stays in your browser",
  "add-pdf-header-footer": "PDF stays in your browser",
  "crop-pdf": "PDF stays in your browser",
  "duplicate-page-finder-pdf": "Scanned locally",
  "remove-blank-pages-pdf": "Scanned locally",
  "reverse-page-order-pdf": "PDF stays in your browser",
  "extract-odd-pages-pdf": "PDF stays in your browser",
  "extract-even-pages-pdf": "PDF stays in your browser",

  /* PDF — Convert */
  "word-to-pdf": "File stays in your browser",
  "pdf-to-word": "File stays in your browser",
  "excel-to-pdf": "File stays in your browser",
  "pdf-to-excel": "File stays in your browser",
  "powerpoint-to-pdf": "File stays in your browser",
  "pdf-to-powerpoint": "File stays in your browser",
  "html-to-pdf": "Rendered in your browser",
  "pdf-to-text": "Extracted in your browser",
  "text-to-pdf": "Compiled in your browser",
  "pdf-to-html": "Converted locally",
  "pdf-translator": "Text sent to a translation service",

  /* PDF — Optimize */
  "remove-pdf-metadata": "Stripped on your device",
  "repair-pdf": "Rebuilt in your browser",
  "validate-pdf": "Checked in your browser",
  "optimize-pdf-web": "PDF stays in your browser",
  "reduce-pdf-image-quality": "PDF stays in your browser",
  "compress-images-inside-pdf": "PDF stays in your browser",

  /* PDF — Advanced */
  "ocr-pdf": "Read on your device",
  "compare-two-pdfs": "Compared locally",
  "merge-selected-page-ranges": "PDF stays in your browser",
  "split-by-file-size": "PDF stays in your browser",
  "split-every-n-pages": "PDF stays in your browser",
  "pdf-difference-checker": "Compared locally",
  "business-pdf-extractor": "Extracted locally",

  /* Creator */
  "stylish-name-generator": "Generated in your browser",
  "linkedin-carousel-maker": "Carousel stays on your device",
  "youtube-thumbnail-preview": "Previewed in your browser",
  "youtube-title-analyzer": "Checked in your browser",
  "youtube-timestamp-formatter": "Formatted in your browser",
  "youtube-chapter-generator": "Generated in your browser",
  "youtube-embed-generator": "Generated, never sent",
  "youtube-url-toolkit": "Parsed in your browser",
  "thumbnail-safe-zone": "Previewed in your browser",
  "youtube-description-formatter": "Formatted in your browser",
  "youtube-keyword-explorer": "Searches live YouTube autocomplete",

  /* Exam & Application */
  "application-file-checker": "Checked on your device",
  "exam-photo-fixer": "Photo stays on your device",
  "exam-signature-fixer": "Signature stays on your device",
  "exam-thumb-fixer": "Thumb stays on your device",
  "declaration-fixer": "File stays on your device",
  "pdf-exact-size": "File stays on your device",
  "exam-file-requirements": "Files stay on your device",
};

export const getToolTrust = (slug: string): string =>
  TOOL_TRUST[slug as ToolId] ?? "Processed in your browser";

/* Tools whose processing calls an external network service. Used by the
 * static prerender to avoid blanket "runs locally" claims for crawlers. */
const TOOL_EXTERNAL_NOTICE: Partial<Record<ToolId, string>> = {
  "pdf-translator":
    "It sends the text extracted from your PDF to a translation service, then rebuilds the translated PDF locally.",
  "youtube-keyword-explorer":
    "It sends your seed term to YouTube's autocomplete through GainUtility's API proxy to return live keyword suggestions.",
  "check-my-website":
    "It sends the URL you enter to GainUtility's server, which fetches the page, robots.txt, sitemap and a bounded sample of same-site links to build the report. Your URL and the fetched public content are processed for the request and not stored.",
  "launch-checklist":
    "It sends the URL you enter to GainUtility's server, which fetches the page, robots.txt, sitemap and a bounded sample of same-site links to build the checklist. Your URL and the fetched public content are processed for the request and not stored.",
};

/** Full-sentence disclosure for external-call tools, or undefined for local ones. */
export const getToolExternalNotice = (slug: string): string | undefined =>
  TOOL_EXTERNAL_NOTICE[slug as ToolId];

/* ── BADGE LABELS ────────────────────────────────────────────────────────
 * Compact uppercase typography for status badges on tool cards. */

export const normalizeBadge = (badge?: string): string => {
  if (!badge) return "";
  const map: Record<string, string> = {
    "100% Client-Side": "LOCAL",
    "Local Only": "LOCAL",
    "New Release": "NEW",
    "Highly Popular": "POPULAR",
    "Highly Optimized": "HIGHLY OPTIMIZED",
    "Highly Interactive": "INTERACTIVE",
    "SEO Power": "SEO",
    "Coming Soon": "COMING SOON",
  };
  const key = map[badge] ?? badge;
  return key.toUpperCase();
};

/** True only when a badge describes an actual tool status we can substantiate
 * (new arrival, beta/limited access, or a planned tool). Marketing adjectives
 * like POPULAR, FEATURED, or FLAGSHIP are intentionally excluded. */
export const isStatusBadge = (badge?: string): boolean => {
  const n = normalizeBadge(badge);
  return n === "NEW" || n === "BETA" || n === "COMING SOON";
};

export { LinkedInGlyph };