/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Contact page. There is no backend to file tickets, so the form builds a
 * real, pre-filled email and opens the visitor's own mail app. Nothing is
 * stored or silently "logged" — if a message wasn't sent in your mail app,
 * it wasn't sent.
 * Fully localized across all 8 supported locales.
 */

import React, { useState } from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { Mail, Send, MessageSquare, ShieldCheck } from "lucide-react";

interface ContactPageProps {
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onChangeView, onAddToast }) => {
  const locale = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Bug Report");
  const [toolName, setToolName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      onAddToast(pageText("contact.toastEmpty", locale), "warning");
      return;
    }

    const subject = `${category}${toolName ? ` — ${toolName}` : ""}`;
    const body = [
      ...(name ? [`Name: ${name}`] : []),
      ...(email ? [`Email: ${email}`] : []),
      `Tool: ${toolName || "—"}`,
      "",
      message,
    ].join("\n");

    const url = `mailto:support@gainutility.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    onAddToast(pageText("contact.toastSuccess", locale), "info");
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, view: { type: "home" }, onClick: () => onChangeView({ type: "home" }) },
          { name: pageText("contact.crumbTitle", locale), active: true }
        ]} />
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-primary-light border border-brand-primary/15 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-brand-primary uppercase">
          <MessageSquare className="w-4 h-4" /> {pageText("contact.badge", locale)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-text-main tracking-tight">
          {pageText("contact.heading", locale)}
        </h1>
        <p className="text-base sm:text-lg text-text-sub leading-relaxed">
          {pageText("contact.description", locale)}
        </p>
      </header>

      {/* Form and Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-text-main text-base">{pageText("contact.emailCardTitle", locale)}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {pageText("contact.emailCardDesc", locale)}
            </p>
            <a href="mailto:support@gainutility.com" className="text-sm font-mono font-bold text-brand-primary hover:underline block pt-1">
              support@gainutility.com
            </a>
          </div>

          <div className="p-6 bg-surface-base border border-border-light rounded-2xl space-y-3 shadow-premium-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-text-main text-base">{pageText("contact.securityCardTitle", locale)}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {pageText("contact.securityCardDesc", locale)}
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="md:col-span-2 bg-surface-base border border-border-light rounded-2xl p-6 sm:p-8 shadow-premium-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider">{pageText("contact.nameLabel", locale)}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={pageText("contact.namePlaceholder", locale)}
                  className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm text-text-main focus:border-brand-primary outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider">{pageText("contact.emailLabel", locale)}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={pageText("contact.emailPlaceholder", locale)}
                  className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm text-text-main focus:border-brand-primary outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider">{pageText("contact.categoryLabel", locale)}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm text-text-main focus:border-brand-primary outline-none min-h-[44px]"
                >
                  <option value="Bug Report">{pageText("contact.catBug", locale)}</option>
                  <option value="Feature Request">{pageText("contact.catFeature", locale)}</option>
                  <option value="General Inquiry">{pageText("contact.catGeneral", locale)}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider">{pageText("contact.toolNameLabel", locale)}</label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder={pageText("contact.toolNamePlaceholder", locale)}
                  className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm text-text-main focus:border-brand-primary outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main uppercase tracking-wider">{pageText("contact.messageLabel", locale)} *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={pageText("contact.messagePlaceholder", locale)}
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm text-text-main focus:border-brand-primary outline-none resize-y"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] rounded-xl font-sans font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm whitespace-nowrap min-h-[44px]"
            >
              <Send className="w-4 h-4" /> {pageText("contact.submit", locale)}
            </button>
            <p className="text-xs text-text-muted leading-relaxed">
              {pageText("contact.privacyNote", locale)}
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};