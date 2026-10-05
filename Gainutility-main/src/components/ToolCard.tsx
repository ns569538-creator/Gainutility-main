/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import type { ToolId, ViewState } from "../types";
import { toolCanonicalUrl } from "../site";
import { toolsRegistry } from "../toolsRegistry";
import { ToolVisual, isStatusBadge, normalizeBadge, getToolTrust } from "../studioIcons";
import { ChevronRight } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { t } from "../i18n/ui";
import { localizedToolName } from "../i18n/slugs";

interface ToolCardProps {
  toolId: ToolId;
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
  /** Optional affordance label when a tool is not yet launchable. */
  comingSoon?: boolean;
  locale?: string;
}

/**
 * A single Browse Tools card.
 *
 * The header leads with a composed, per-tool visual (mini "before → after"
 * diagram for popular tools, the tool's standard icon otherwise) so every
 * utility is identifiable at a glance. Registry name + literal description
 * carry the meaning, and a trust line states what actually happens to the
 * data before the "Open" affordance. The whole card remains one real link
 * to /tools/<slug> (no nested interactive elements).
 */
export const ToolCard: React.FC<ToolCardProps> = ({ toolId, onChangeView, comingSoon = false, locale: localeProp }) => {
  const ctxLocale = useLocale();
  const locale = localeProp || ctxLocale;
  const tool = toolsRegistry[toolId];
  if (!tool) return null;

  // Enhanced descriptions with input/output clarity for Creator tools
  const enhancedDesc: Record<string, { what: string; input: string; output: string }> = {
    "youtube-thumbnail-preview": {
      what: "Preview thumbnails across YouTube's actual UI surfaces",
      input: "Image (1280×720)",
      output: "Visual preview — no file output"
    },
    "youtube-title-analyzer": {
      what: "Check title length, truncation points, and power words",
      input: "Title text",
      output: "Analysis report — no file output"
    },
    "youtube-timestamp-formatter": {
      what: "Sort, pad, and validate timestamps for YouTube chapters",
      input: "Raw timestamp lines",
      output: "Formatted chapter list — copyable text"
    },
    "youtube-chapter-generator": {
      what: "Build chapters with visual timeline preview",
      input: "Video duration + chapter names/times",
      output: "Formatted chapter list — copyable text"
    },
    "youtube-embed-generator": {
      what: "Generate responsive iframe embed code with options",
      input: "YouTube URL or video ID",
      output: "HTML iframe snippet — copyable code"
    },
    "youtube-url-toolkit": {
      what: "Strip tracking params, extract IDs, generate QR codes",
      input: "Any YouTube URL",
      output: "Clean URL, video ID, QR code"
    },
    "thumbnail-safe-zone": {
      what: "Overlay safe-zone guides to protect key elements from badges",
      input: "Thumbnail image",
      output: "Visual overlay — no file output"
    },
    "youtube-description-formatter": {
      what: "Structure descriptions with sections, links, and chapters",
      input: "Description text + sections",
      output: "Formatted description — copyable text"
    },
    "youtube-keyword-explorer": {
      what: "Find real autocomplete search phrases from YouTube",
      input: "Seed keyword + market",
      output: "Keyword list — copyable or CSV"
    },
    "linkedin-carousel-maker": {
      what: "Build multi-slide LinkedIn carousels",
      input: "Slide content + styling",
      output: "PDF or ZIP of slides"
    },
    "slug-generator": {
      what: "Turn titles into clean, URL-friendly slugs",
      input: "Page title text",
      output: "Clean slug — copyable text"
    },
  };

  const extra = enhancedDesc[toolId];
  const showExtra = !!extra;

  return (
    <a
      id={`tool-card-${toolId}`}
      data-tool-id={toolId}
      href={toolCanonicalUrl(toolId)}
      onClick={(e) => {
        e.preventDefault();
        onChangeView({ type: "tool", id: toolId }, { clickedElementId: `tool-card-${toolId}` });
      }}
      className="browse-tool-card group gu-utility-card bg-surface-base border border-border-subtle hover:border-brand-primary/50 p-4 sm:p-5 rounded-lg cursor-pointer flex flex-col w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="gu-visual-tile relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-border-subtle/80 bg-background/70 transition-colors duration-200 group-hover:border-brand-primary/40 group-hover:bg-brand-primary-light/30">
          <ToolVisual slug={toolId} size={48} />
        </span>
        {isStatusBadge(tool.badge) && (
          <span
            className={`text-[9px] font-mono px-1.5 py-px rounded font-semibold uppercase tracking-wider shrink-0 ${
              normalizeBadge(tool.badge) === "COMING SOON"
                ? "text-text-muted border border-border-subtle"
                : normalizeBadge(tool.badge) === "NEW"
                  ? "text-brand-primary border border-brand-primary/30"
                  : "text-brand-primary border border-brand-primary/30"
            }`}
          >
            {normalizeBadge(tool.badge)}
          </span>
        )}
      </div>

      <div className="space-y-1 min-w-0 pb-3">
        {/* min-h reserves two title lines (leading-snug = 1.375) so a one-line
            name and a wrapping name cost the same vertical space. Without it
            the 1-vs-2-line wrap is what makes rows uneven in the grid. */}
        <h3 className="min-h-[2.75em] text-[15px] md:text-base font-sans font-semibold text-text-main leading-snug group-hover:text-brand-primary transition-colors">
          {localizedToolName(toolId, locale, tool.name)}
        </h3>
        <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2">
          {tool.desc}
        </p>
        {showExtra && (
          <div className="hidden sm:block space-y-1 pt-2">
            <p className="text-xs font-medium text-text-sub">{extra.what}</p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-text-muted">
              <span className="bg-surface-muted px-1.5 py-0.5 rounded">In: {extra.input}</span>
              <span className="bg-surface-muted px-1.5 py-0.5 rounded">Out: {extra.output}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mt-auto pt-4 min-h-[36px]">
        <span className="min-w-0 text-xs font-mono text-text-muted/80 truncate" title={getToolTrust(toolId)}>
          {getToolTrust(toolId)}
        </span>
        <span className="gu-open-cta inline-flex items-center gap-1 text-xs font-sans font-semibold text-brand-primary transition-colors duration-200 shrink-0">
          {comingSoon ? t("moreInfo", locale) : t("openTool", locale)}
          <ChevronRight className="gu-arrow w-3.5 h-3.5 shrink-0" />
        </span>
      </div>
    </a>
  );
};