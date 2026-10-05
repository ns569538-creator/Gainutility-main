/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import type { ToolId, ViewState } from "../types";
import { ToolVisual } from "../studioIcons";
import { toolCanonicalUrl } from "../site";
import { SEO_PAGE_MAP, localizedSeoEntry } from "../seo/seoPageContent";
import {
  IMAGE_HUB_TOOLS as IMAGE_TOOLS,
  type ImageJobFilter,
  type ImageToolItem,
} from "../imageHubData";
import { Search, X, ChevronRight, ShieldCheck, HelpCircle } from "lucide-react";

interface ImageCategoryHubProps {
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
  locale?: string;
}

/** 10 top-intent tools prioritized in Popular Image Tools */
const POPULAR_TOOL_IDS: ToolId[] = [
  "image-converter",
  "image-resizer",
  "background-remover",
  "image-cropper",
  "image-upscaler",
  "heic-jpg-converter",
  "png-jpg-converter",
  "webp-converter",
  "exam-photo-fixer",
  "jpg-to-pdf",
];

/** Quick Task Selector items */
const QUICK_TASKS: { label: string; action: "filter" | "navigate"; job?: ImageJobFilter; toolId?: ToolId }[] = [
  { label: "Compress", action: "filter", job: "compress" },
  { label: "Resize", action: "filter", job: "resize" },
  { label: "Convert", action: "filter", job: "convert" },
  { label: "Remove background", action: "navigate", toolId: "background-remover" },
  { label: "Crop", action: "navigate", toolId: "image-cropper" },
  { label: "Upscale", action: "navigate", toolId: "image-upscaler" },
  { label: "HEIC → JPG", action: "navigate", toolId: "heic-jpg-converter" },
  { label: "Watermark", action: "navigate", toolId: "image-watermark" },
];

/** Category Intent Sections with H2s */
interface CategorySection {
  title: string;
  subtitle: string;
  toolIds: ToolId[];
}

const CATEGORY_SECTIONS: CategorySection[] = [
  {
    title: "Compress & Optimize Images",
    subtitle: "Reduce file sizes while keeping images looking crisp and clear.",
    toolIds: ["image-converter", "exam-photo-fixer", "webp-converter", "image-metadata-remover"],
  },
  {
    title: "Resize & Crop Images",
    subtitle: "Scale dimensions to exact pixel values or crop to standard aspect ratios.",
    toolIds: ["image-resizer", "image-cropper", "social-resizer", "passport-photo-maker", "exam-signature-fixer", "exam-thumb-fixer"],
  },
  {
    title: "Convert Image Formats",
    subtitle: "Convert between JPG, PNG, WebP, Apple HEIC, SVG, and PDF documents.",
    toolIds: ["image-converter", "png-jpg-converter", "heic-jpg-converter", "webp-converter", "svg-converter", "jpg-to-pdf", "pdf-to-jpg"],
  },
  {
    title: "Edit Images",
    subtitle: "Remove backgrounds, censor sensitive information, add watermarks, and arrange collages.",
    toolIds: ["background-remover", "image-blur-pixelate", "image-watermark", "signature-maker", "collage-maker", "favicon-generator", "logo-maker", "image-to-palette"],
  },
  {
    title: "Improve Image Quality",
    subtitle: "Upscale low-resolution photos and reduce digital compression noise.",
    toolIds: ["image-upscaler"],
  },
];

/** Tool Chains / Common Workflows */
const TOOL_CHAINS = [
  {
    goal: "Need a smaller image?",
    steps: [
      { name: "Resize", id: "image-resizer" as ToolId },
      { name: "Compress", id: "image-converter" as ToolId },
      { name: "Convert to WebP", id: "webp-converter" as ToolId },
    ],
    outcome: "Minimal file size for fast websites and emails",
  },
  {
    goal: "Need an iPhone photo for a website?",
    steps: [
      { name: "HEIC to JPG", id: "heic-jpg-converter" as ToolId },
      { name: "Resize", id: "image-resizer" as ToolId },
      { name: "Compress", id: "image-converter" as ToolId },
    ],
    outcome: "Universal compatibility with fast loading times",
  },
  {
    goal: "Need a clean product image?",
    steps: [
      { name: "Remove Background", id: "background-remover" as ToolId },
      { name: "Resize Dimensions", id: "image-resizer" as ToolId },
      { name: "Compress to WebP", id: "webp-converter" as ToolId },
    ],
    outcome: "Clean transparent visual ready for ecommerce",
  },
  {
    goal: "Need to upload to an official portal?",
    steps: [
      { name: "Crop Framing", id: "image-cropper" as ToolId },
      { name: "Exact Dimensions", id: "image-resizer" as ToolId },
      { name: "Under Target KB", id: "exam-photo-fixer" as ToolId },
    ],
    outcome: "Guaranteed compliance with portal file limits",
  },
];

export const ImageCategoryHub: React.FC<ImageCategoryHubProps> = ({ onChangeView, locale }) => {
  const [activeJob, setActiveJob] = useState<ImageJobFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Head tags, canonical, hreflang and JSON-LD for this route all come from
  // Layout's SEO effect (same source the prerender script uses). Only the copy
  // below is read from the shared /image entry, so the hub body, the
  // prerendered HTML and the FAQ schema publish identical text.
  const seoEntry = SEO_PAGE_MAP["image"];
  const locEntry = seoEntry ? localizedSeoEntry(seoEntry, locale) : undefined;
  const imageFaqs = (locEntry?.faq ?? []).map((f) => ({ q: f.question, a: f.answer }));

  const toolMap = useMemo(() => new Map(IMAGE_TOOLS.map((t) => [t.id, t])), []);

  const openTool = (id: ToolId) => {
    onChangeView({ type: "tool", id }, { clickedElementId: `image-tool-${id}` });
  };

  // Search filter
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const terms = q.split(/\s+/).filter(Boolean);
    return IMAGE_TOOLS.filter((tool) => {
      const haystack = `${tool.name} ${tool.desktopDesc} ${tool.keywords.join(" ")}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [searchQuery]);

  const activeJobTools = useMemo(() => {
    if (activeJob === "all") return null;
    return IMAGE_TOOLS.filter((t) => t.jobs.includes(activeJob));
  }, [activeJob]);

  const isFiltering = searchQuery.trim().length > 0 || activeJob !== "all";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 text-left">
      {/* ─── Breadcrumb ────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted mb-4 sm:mb-5">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onChangeView({ type: "home" });
          }}
          className="hover:text-brand-primary transition-colors cursor-pointer"
        >
          Home
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-text-disabled shrink-0" aria-hidden="true" />
        <span className="text-text-main font-semibold" aria-current="page">
          Image Tools
        </span>
      </nav>

      {/* ─── Compact Hero ──────────────────────────────────── */}
      <header className="mb-5 sm:mb-6">
        <h1 className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-text-main tracking-tight leading-tight mb-2">
          {locEntry?.h1 ?? "Free Online Image Tools"}
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
          {locEntry?.intro ??
            "Compress, resize, crop, convert and edit images directly in your browser. Most tools process files on your device, so you can get the result without creating an account."}
        </p>
      </header>

      {/* ─── Quick Task Selector ────────────────────────────── */}
      <div className="mb-6 sm:mb-8 pb-3 border-b border-border-subtle/80">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-text-sub uppercase tracking-wider">
            What do you need to do?
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {QUICK_TASKS.map((task) => (
            <button
              key={task.label}
              type="button"
              onClick={() => {
                if (task.action === "navigate" && task.toolId) {
                  openTool(task.toolId);
                } else if (task.job) {
                  setActiveJob(task.job);
                  setSearchQuery("");
                }
              }}
              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-sans font-medium transition-colors cursor-pointer min-h-[38px] ${
                activeJob === task.job
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-surface-base text-text-main border border-border-subtle hover:border-brand-primary/40 hover:bg-surface-muted"
              }`}
            >
              {task.label}
            </button>
          ))}
          {activeJob !== "all" && (
            <button
              type="button"
              onClick={() => setActiveJob("all")}
              className="shrink-0 text-xs font-semibold text-brand-primary hover:underline px-2 py-1.5 cursor-pointer"
            >
              View all
            </button>
          )}
        </div>
      </div>

      {/* ─── Search Bar & Category Filters ──────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" aria-hidden="true" />
          <input
            id="image-tools-filter-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search image tools (e.g. webp, crop, heic)..."
            aria-label="Search image tools"
            className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-base border border-border-input hover:border-border-default focus:border-brand-primary text-xs sm:text-sm text-text-main placeholder:text-text-disabled transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-text-muted hover:text-text-main transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(["all", "compress", "resize", "convert", "edit", "improve"] as ImageJobFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveJob(tab);
                setSearchQuery("");
              }}
              className={`capitalize px-2.5 py-1.5 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer shrink-0 ${
                activeJob === tab
                  ? "bg-text-main text-surface-base"
                  : "text-text-muted hover:text-text-main hover:bg-surface-muted"
              }`}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Active Filter / Search Results ─────────────────── */}
      {isFiltering ? (
        <section aria-label="Filtered tools" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm font-semibold text-text-main">
              {searchResults
                ? `Search results (${searchResults.length})`
                : `Showing ${activeJob} tools (${activeJobTools?.length ?? 0})`}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveJob("all");
              }}
              className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>

          {(searchResults ? searchResults : activeJobTools)?.length === 0 ? (
            <div className="p-8 text-center bg-surface-base border border-border-subtle rounded-xl">
              <p className="text-sm text-text-muted mb-2">No image tools matched your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveJob("all");
                }}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {(searchResults ? searchResults : activeJobTools)?.map((t) => (
                <ImageToolCard key={t.id} tool={t} onOpen={() => openTool(t.id)} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ─── Popular Image Tools (Top 10 highest-intent) ─── */}
          <section aria-labelledby="h2-popular-image-tools" className="mb-12">
            <div className="mb-4">
              <h2 id="h2-popular-image-tools" className="font-sans font-bold text-xl sm:text-2xl text-text-main">
                Popular Image Tools
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                The most frequently used image operations for everyday work.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {POPULAR_TOOL_IDS.map((id) => {
                const t = toolMap.get(id);
                if (!t) return null;
                return <ImageToolCard key={id} tool={t} onOpen={() => openTool(id)} featured />;
              })}
            </div>
          </section>

          {/* ─── Tool Chains / Workflows ─────────────────────── */}
          <section aria-labelledby="h2-image-workflows" className="mb-12 bg-surface-muted/30 border border-border-subtle rounded-2xl p-4 sm:p-5">
            <div className="mb-3">
              <h3 id="h2-image-workflows" className="font-sans font-bold text-base sm:text-lg text-text-main">
                Common image workflows
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Complete connected steps without leaving your browser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOOL_CHAINS.map((wf, idx) => (
                <div
                  key={idx}
                  className="bg-surface-base border border-border-subtle/80 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <p className="font-sans font-semibold text-xs sm:text-sm text-text-main mb-1.5">
                    {wf.goal}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 my-1.5">
                    {wf.steps.map((st, sIdx) => (
                      <React.Fragment key={st.id}>
                        {sIdx > 0 && (
                          <span className="text-text-disabled text-xs" aria-hidden="true">
                            →
                          </span>
                        )}
                        <a
                          href={toolCanonicalUrl(st.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            openTool(st.id);
                          }}
                          className="text-xs font-medium px-2 py-0.5 rounded bg-surface-muted hover:bg-brand-primary-light/40 hover:text-brand-primary transition-colors text-text-main cursor-pointer"
                        >
                          {st.name}
                        </a>
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-xs text-text-muted mt-1.5 pt-1.5 border-t border-border-subtle/50">
                    Result: <span className="font-medium text-text-sub">{wf.outcome}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Organized Intent Sections (H2s) ─────────────── */}
          <div className="space-y-12 mb-14">
            {CATEGORY_SECTIONS.map((sec) => {
              const secId = `h2-${sec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return (
                <section key={sec.title} aria-labelledby={secId} className="space-y-3">
                  <div className="border-b border-border-subtle/70 pb-2">
                    <h2 id={secId} className="font-sans font-bold text-lg sm:text-xl text-text-main">
                      {sec.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                      {sec.subtitle}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {sec.toolIds.map((id) => {
                      const t = toolMap.get(id);
                      if (!t) return null;
                      return <ImageToolCard key={id} tool={t} onOpen={() => openTool(id)} />;
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Phase 9: Privacy Section ───────────────────────── */}
      <section aria-labelledby="h2-why-use-gainutility" className="border-t border-border-subtle pt-8 sm:pt-10 mb-10">
        <h2 id="h2-why-use-gainutility" className="font-sans font-bold text-xl sm:text-2xl text-text-main mb-3">
          Why use GainUtility for image tools?
        </h2>
        <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-sans font-semibold text-base text-text-main">
                Your images stay yours.
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed mt-1">
                Most GainUtility image tools process files directly in your browser using HTML5 Canvas and client-side algorithms.
                When a tool requires an external network service, we state so clearly before you upload.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs font-semibold">
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onChangeView({ type: "privacy" });
                  }}
                  className="text-brand-primary hover:underline cursor-pointer"
                >
                  Privacy Policy →
                </a>
                <a
                  href="/security"
                  onClick={(e) => {
                    e.preventDefault();
                    onChangeView({ type: "security" });
                  }}
                  className="text-brand-primary hover:underline cursor-pointer"
                >
                  Security Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Phase 20: SEO Practical Guide ──────────────────── */}
      <section aria-labelledby="h2-image-guide" className="border-t border-border-subtle pt-8 sm:pt-10 mb-10">
        <h2 id="h2-image-guide" className="font-sans font-bold text-xl sm:text-2xl text-text-main mb-4">
          Guide to everyday image optimization
        </h2>
        <div className="prose prose-sm sm:prose-base max-w-none text-text-muted space-y-3 leading-relaxed">
          <p>
            Digital images are used across websites, email newsletters, resumes, and official application portals.
            However, digital cameras and modern smartphones generate raw files that are unnecessarily heavy—often
            between 5 MB and 20 MB with dimensions exceeding 4000 pixels. Uploading such files directly slows down websites,
            triggers email attachment rejections, and fails portal size checks.
          </p>
          <p>
            <strong>Choosing the right format:</strong> Use <strong>JPG</strong> for rich photographic content where minor compression artifacts remain invisible.
            Use <strong>PNG</strong> when transparent backgrounds or razor-sharp typographic edges are required.
            Use <strong>WebP</strong> for modern web publishing; it provides 25% to 35% smaller file sizes than JPG with identical visual fidelity.
            If you capture photos on an iPhone, convert <strong>HEIC</strong> files to universal JPGs before sharing with Windows or Android users.
          </p>
          <p>
            <strong>Resizing versus compressing:</strong> Resizing alters physical pixel dimensions (e.g. scaling a 4000×3000 px photo down to 1200×900 px).
            Compressing removes redundant color and frequency data without altering dimensions. For optimal results on websites, resize the photo to its actual display dimensions first, then apply moderate compression (80–85% quality).
          </p>
          <p>
            <strong>Client-side batch processing:</strong> Because GainUtility image utilities run locally in your browser,
            batch tools like the Image Compressor, Image Resizer, and HEIC Converter process multiple files concurrently on your device's hardware,
            saving bandwidth and keeping private photos off third-party servers.
          </p>
        </div>
      </section>

      {/* ─── Phase 33: Frequently Asked Questions ───────────── */}
      <section aria-labelledby="h2-image-faqs" className="border-t border-border-subtle pt-8 sm:pt-10 mb-12">
        <h2 id="h2-image-faqs" className="font-sans font-bold text-xl sm:text-2xl text-text-main mb-5">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2.5 max-w-3xl">
          {imageFaqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-surface-base border border-border-subtle rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer font-sans font-semibold text-xs sm:text-sm text-text-main hover:text-brand-primary transition-colors list-none">
                <span>{faq.q}</span>
                <HelpCircle className="w-4 h-4 text-text-muted group-open:text-brand-primary transition-colors shrink-0 ml-3" aria-hidden="true" />
              </summary>
              <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs sm:text-[13px] text-text-muted leading-relaxed border-t border-border-subtle/50 pt-2.5">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── Cross Category Linking ─────────────────────────── */}
      <div className="border-t border-border-subtle pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
        <span>Need document or development utilities?</span>
        <div className="flex items-center gap-4">
          <a
            href="/pdf"
            onClick={(e) => {
              e.preventDefault();
              onChangeView({ type: "seo-page", id: "pdf" });
            }}
            className="font-semibold text-brand-primary hover:underline cursor-pointer"
          >
            PDF Tools →
          </a>
          <a
            href="/dev"
            onClick={(e) => {
              e.preventDefault();
              onChangeView({ type: "seo-page", id: "dev" });
            }}
            className="font-semibold text-brand-primary hover:underline cursor-pointer"
          >
            Developer Tools →
          </a>
          <a
            href="/tools"
            onClick={(e) => {
              e.preventDefault();
              onChangeView({ type: "tools-directory" });
            }}
            className="font-semibold text-brand-primary hover:underline cursor-pointer"
          >
            All Utilities →
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-first responsive Tool Card
 * Desktop: Tool name, short description, batch badge, privacy label, Open CTA
 * Mobile: Tool name, short task-first description, compact badge, min 44px tap target
 */
interface ImageToolCardProps {
  tool: ImageToolItem;
  onOpen: () => void;
  featured?: boolean;
}

const ImageToolCard: React.FC<ImageToolCardProps> = ({ tool, onOpen, featured = false }) => {
  return (
    <a
      id={`image-tool-${tool.id}`}
      href={toolCanonicalUrl(tool.id)}
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      className={`group bg-surface-base border rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all cursor-pointer hover:border-brand-primary/50 hover:shadow-sm ${
        featured ? "border-brand-primary/30" : "border-border-subtle"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-muted/60 text-text-main group-hover:border-brand-primary/40 group-hover:bg-brand-primary-light/20 transition-colors">
            <ToolVisual slug={tool.id} size={36} />
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {tool.batchSupported && (
              <span className="text-[11px] font-mono text-text-sub bg-surface-muted px-1.5 py-0.5 rounded border border-border-subtle">
                Batch supported
              </span>
            )}
          </div>
        </div>

        <h3 className="font-sans font-semibold text-sm sm:text-base text-text-main group-hover:text-brand-primary transition-colors leading-snug">
          {tool.name}
        </h3>

        {/* Desktop description */}
        <p className="hidden sm:block text-xs sm:text-[13px] text-text-muted mt-1 leading-relaxed line-clamp-2">
          {tool.desktopDesc}
        </p>

        {/* Mobile description: direct, short, task-first */}
        <p className="block sm:hidden text-xs text-text-muted mt-0.5 leading-snug line-clamp-2">
          {tool.mobileDesc}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-subtle/50 min-h-[36px]">
        <span className="text-xs text-text-disabled truncate">
          {tool.privacy}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-brand-primary group-hover:translate-x-0.5 transition-transform shrink-0">
          Open
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
};
