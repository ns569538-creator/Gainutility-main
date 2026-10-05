/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Terms of Service page.
 * Fully localized across all 8 supported locales.
 */

import React from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  CheckCircle2
} from "lucide-react";

interface TermsPageProps {
  onChangeView: (view: ViewState) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, onClick: () => onChangeView({ type: "home" }) },
          { name: pageText("terms.crumbTitle", locale), active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-disabled uppercase">
          <Calendar className="w-4 h-4" /> {pageText("terms.updatedDate", locale)}
        </div>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/15 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <Scale className="w-4 h-4" /> {pageText("terms.badge", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          {pageText("terms.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed">
          {pageText("terms.description", locale)}
        </p>
      </header>

      {/* Terms Content */}
      <section className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-8 shadow-premium-sm">
        
        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-primary" /> {pageText("terms.s1Title", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("terms.s1Desc", locale)}
          </p>
        </div>

        <div className="h-px bg-border-light" />

        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" /> {pageText("terms.s2Title", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("terms.s2Desc", locale)}
          </p>
        </div>

        <div className="h-px bg-border-light" />

        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-primary" /> {pageText("terms.s3Title", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("terms.s3Desc", locale)}
          </p>
        </div>

        <div className="h-px bg-border-light" />

        <div className="space-y-3">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" /> {pageText("terms.s4Title", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("terms.s4Desc", locale)}
          </p>
        </div>

      </section>
    </div>
  );
};
