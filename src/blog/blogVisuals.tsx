/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Category visuals for the Blog index.
 *
 * One small, consistent composite per blog topic — PDF, Images, SEO,
 * Developer, Productivity — built from the same icon vocabulary as the
 * tool cards, so a topic reads at a glance without any stock imagery.
 * Decorative only (aria-hidden); labels always carry the meaning.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChartNoAxesCombined,
  Check,
  ClipboardCheck,
  Code2,
  FileText,
  Image,
  Search,
  Sun,
} from "lucide-react";
import type { BlogCategory } from "./blogData";

const VBadge = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <span
    className={`gu-vbadge absolute grid place-items-center rounded-full ${className}`}
    aria-hidden="true"
  >
    {children}
  </span>
);

interface BlogCategoryVisualProps {
  category: BlogCategory;
  /** Tile size in px; glyphs scale with it. */
  size?: number;
  className?: string;
}

export const BlogCategoryVisual: React.FC<BlogCategoryVisualProps> = ({
  category,
  size = 44,
  className = "",
}) => {
  const iconSize = Math.round(size * 0.5);
  const icon: LucideIcon =
    category === "PDF"
      ? FileText
      : category === "Images"
        ? Image
        : category === "SEO"
          ? Search
          : category === "Developer"
            ? Code2
            : ClipboardCheck;
  const Glyph = icon;

  const badge =
    category === "PDF" ? (
      <VBadge
        className={`-bottom-[6px] -right-[6px] bg-brand-primary-light text-brand-primary border border-brand-primary/30 font-mono font-bold leading-none`}
      >
        <span className="text-[8px] px-1 py-[3px]">PDF</span>
      </VBadge>
    ) : category === "Images" ? (
      <VBadge className="-top-[6px] -right-[6px] bg-brand-primary-light text-brand-primary border border-brand-primary/30 p-[3px]">
        <Sun className="w-2.5 h-2.5" />
      </VBadge>
    ) : category === "SEO" ? (
      <VBadge className="-top-[6px] -right-[6px] bg-brand-primary-light text-brand-primary border border-brand-primary/30 p-[3px]">
        <ChartNoAxesCombined className="w-2.5 h-2.5" />
      </VBadge>
    ) : category === "Developer" ? (
      <VBadge className="-bottom-[6px] -right-[6px] bg-brand-primary-light text-brand-primary border border-brand-primary/30 font-mono font-bold leading-none">
        <span className="text-[8px] px-[5px] py-[3px]">{"</>"}</span>
      </VBadge>
    ) : (
      <VBadge className="-top-[6px] -right-[6px] bg-brand-primary text-white p-[3px]">
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
      </VBadge>
    );

  return (
    <span
      className={`gu-blog-visual relative grid place-items-center rounded-[12px] border border-border-light bg-background select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Glyph size={iconSize} strokeWidth={1.8} className="text-text-main" />
      {badge}
    </span>
  );
};