/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Security architecture and memory isolation documentation.
 * Fully localized across all 8 supported locales.
 */

import React from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { 
  ShieldCheck, 
  Lock, 
  FileLock2, 
  Terminal, 
  CheckCircle2, 
  Calendar,
  HardDrive
} from "lucide-react";

interface SecurityPageProps {
  onChangeView: (view: ViewState) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, onClick: () => onChangeView({ type: "home" }) },
          { name: pageText("security.crumbTitle", locale), active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-disabled uppercase">
          <Calendar className="w-4 h-4" /> {pageText("security.updatedDate", locale)}
        </div>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
          <ShieldCheck className="w-4 h-4" /> {pageText("security.badge", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          {pageText("security.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed">
          {pageText("security.description", locale)}
        </p>
      </header>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("security.s1Title", locale)}</h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {pageText("security.s1Desc", locale)}
          </p>
        </div>

        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <FileLock2 className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("security.s2Title", locale)}</h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {pageText("security.s2Desc", locale)}
          </p>
        </div>

        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("security.s3Title", locale)}</h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {pageText("security.s3Desc", locale)}
          </p>
        </div>

        <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-text-main text-base">{pageText("security.s4Title", locale)}</h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {pageText("security.s4Desc", locale)}
          </p>
        </div>
      </div>

      {/* Security Best Practices */}
      <section className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-6 shadow-premium-sm">
        <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-primary" /> {pageText("security.verifyTitle", locale)}
        </h2>
        <p className="text-sm text-text-sub leading-relaxed">
          {pageText("security.verifyDesc", locale)}
        </p>
        <ol className="space-y-3 text-sm text-text-sub list-decimal list-inside pl-2">
          <li>{pageText("security.verifyStep1", locale)}</li>
          <li>{pageText("security.verifyStep2", locale)}</li>
          <li>{pageText("security.verifyStep3", locale)}</li>
          <li>{pageText("security.verifyStep4", locale)}</li>
          <li>{pageText("security.verifyStep5", locale)}</li>
        </ol>
      </section>
    </div>
  );
};
