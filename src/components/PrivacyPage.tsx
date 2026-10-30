/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Privacy Policy page with client-side privacy guarantees.
 * Fully localized across all 8 supported locales.
 */

import React from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { internalLinkProps } from "./RelatedToolsSection";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  HardDrive, 
  Cpu, 
  FileCheck, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface PrivacyPageProps {
  onChangeView: (view: ViewState) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: pageText("privacy.crumbTitle", locale), active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-disabled uppercase">
          <Calendar className="w-4 h-4" /> {pageText("privacy.effectiveDate", locale)}
        </div>
      </div>

      {/* 2. Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
          <ShieldCheck className="w-4 h-4" /> {pageText("privacy.badge", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          {pageText("privacy.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed">
          {pageText("privacy.description", locale)}
        </p>
      </header>

      {/* 3. Core Privacy Facts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-2 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("privacy.p1Title", locale)}</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {pageText("privacy.p1Desc", locale)}
          </p>
        </div>

        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-2 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("privacy.p2Title", locale)}</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {pageText("privacy.p2Desc", locale)}
          </p>
        </div>

        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-2 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("privacy.p3Title", locale)}</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {pageText("privacy.p3Desc", locale)}
          </p>
        </div>
      </div>

      {/* 4. Detailed Sections */}
      <section className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-8 shadow-premium-sm">
        
        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-primary" /> 1. {pageText("privacy.p1Title", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("privacy.description", locale)}
          </p>
          <ul className="space-y-2 text-sm text-text-sub pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>PDF & Documents:</strong> {pageText("privacy.p1Desc", locale)}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Client Memory Sandboxing:</strong> {pageText("privacy.p2Desc", locale)}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Data Retention:</strong> {pageText("privacy.p3Desc", locale)}</span>
            </li>
          </ul>
        </div>

        <div className="h-px bg-border-light" />

        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-primary" /> 2. {pageText("contact.badge", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("contact.description", locale)}{" "}
            <a
              {...internalLinkProps({ type: "contact" }, locale, onChangeView)}
              className="text-brand-primary font-bold underline hover:opacity-80 cursor-pointer"
            >
              {pageText("contact.crumbTitle", locale)}
            </a>.
          </p>
        </div>

      </section>
    </div>
  );
};
