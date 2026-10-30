/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Contrast Checker section.
 * Reuses the site's full WCAG contrast checker inside the studio flow.
 */
import React from "react";
import { ContrastChecker } from "../../components/ContrastChecker";
import { SectionProps } from "./types";
import { SectionHeading } from "../colorUI";

export const ContrastSection: React.FC<SectionProps> = ({ onCopy, onAddToast }) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Contrast"
        title="WCAG contrast checks"
        subtitle="Verify foreground/background pairs against WCAG AA and AAA. The checker is shared with the site-wide tool, so your results are exactly what you'll deploy."
      />
      <div className="bg-surface-base border border-border-light rounded-3xl p-4 sm:p-5">
        <ContrastChecker onCopy={onCopy} onAddToast={onAddToast} />
      </div>
    </div>
  );
};