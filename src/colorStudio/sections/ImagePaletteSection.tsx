/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Image → Palette section.
 * Extracts a palette from a user photo, fully client-side.
 */
import React from "react";
import { ImageColorPaletteExtractor } from "../../components/AdvancedDeveloperTools";
import { SectionProps } from "./types";
import { SectionHeading } from "../colorUI";

export const ImagePaletteSection: React.FC<SectionProps> = ({ onCopy, onAddToast }) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Image → Palette"
        title="Pull a palette out of any photo"
        subtitle="Drop a photo and the extractor samples its dominant colors. Processing happens entirely in your browser — nothing is uploaded."
      />
      <div className="bg-surface-base border border-border-light rounded-3xl p-4 sm:p-5">
        <ImageColorPaletteExtractor onAddToast={onAddToast} />
      </div>
    </div>
  );
};