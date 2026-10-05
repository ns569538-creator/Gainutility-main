/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — Gradient section.
 * Wraps the site-wide CSS gradient generator inside the studio flow.
 */
import React from "react";
import { GradientGenerator } from "../../components/GradientGenerator";
import { SectionProps } from "./types";
import { SectionHeading } from "../colorUI";

export const GradientSection: React.FC<SectionProps> = ({ onCopy, onAddToast }) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Gradients"
        title="CSS gradient builder"
        subtitle="Tune angle, stops and blending for buttons, headers and backgrounds, then copy the production CSS."
      />
      <div className="bg-surface-base border border-border-light rounded-3xl p-4 sm:p-5">
        <GradientGenerator onCopy={onCopy} onAddToast={onAddToast} />
      </div>
    </div>
  );
};