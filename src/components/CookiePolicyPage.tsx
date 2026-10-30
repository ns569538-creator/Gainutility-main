/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cookie and localStorage persistence policy.
 * Fully localized across all 8 supported locales.
 */

import React from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { 
  Cookie, 
  HardDrive, 
  Calendar, 
  Settings 
} from "lucide-react";

interface CookiePolicyPageProps {
  onChangeView: (view: ViewState) => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: pageText("cookies.crumbTitle", locale), active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-disabled uppercase">
          <Calendar className="w-4 h-4" /> {pageText("cookies.updatedDate", locale)}
        </div>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/15 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <Cookie className="w-4 h-4" /> {pageText("cookies.badge", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          {pageText("cookies.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed">
          {pageText("cookies.description", locale)}
        </p>
      </header>

      {/* Storage Breakdown */}
      <section className="bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 space-y-8 shadow-premium-sm">
        
        <div className="space-y-4">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-brand-primary" /> {pageText("cookies.storageTitle", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("cookies.storageDesc", locale)}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-border-light rounded-xl overflow-hidden">
              <thead className="bg-surface-muted font-sans font-bold text-text-main border-b border-border-light">
                <tr>
                  <th className="p-3">{pageText("cookies.thKey", locale)}</th>
                  <th className="p-3">{pageText("cookies.thPurpose", locale)}</th>
                  <th className="p-3">{pageText("cookies.thRetention", locale)}</th>
                  <th className="p-3">{pageText("cookies.thPersonal", locale)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-text-sub">
                <tr>
                  <td className="p-3 font-mono text-xs">premium-suite-theme</td>
                  <td className="p-3">{pageText("cookies.themeDesc", locale)}</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3 font-bold text-emerald-600">{pageText("cookies.valNo", locale)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">gainutility-favorites</td>
                  <td className="p-3">{pageText("cookies.favDesc", locale)}</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3 font-bold text-emerald-600">{pageText("cookies.valNo", locale)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">gainutility-recent-searches</td>
                  <td className="p-3">{pageText("cookies.searchDesc", locale)}</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3 font-bold text-emerald-600">{pageText("cookies.valNo", locale)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">gainutility-invoice-tracker-v1</td>
                  <td className="p-3">{pageText("cookies.invoiceDesc", locale)}</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3 font-bold text-text-muted">{pageText("cookies.valLocalWork", locale)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-px bg-border-light" />

        <div className="space-y-4">
          <h2 className="text-xl font-sans font-bold text-text-main flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" /> {pageText("cookies.clearTitle", locale)}
          </h2>
          <p className="text-sm text-text-sub leading-relaxed">
            {pageText("cookies.clearDesc", locale)}
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-text-sub pl-2">
            <li>{pageText("cookies.clearChrome", locale)}</li>
            <li>{pageText("cookies.clearSafari", locale)}</li>
            <li>{pageText("cookies.clearFirefox", locale)}</li>
          </ul>
        </div>

      </section>
    </div>
  );
};
