import React, { ReactNode } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";
import { ArrowRight, HelpCircle } from "lucide-react";

interface ToolPageLayoutProps {
  toolId: string;
  toolName: string;
  toolDescription: string;
  children: ReactNode;
  onChangeView: (view: any) => void;
  howItWorks?: ReactNode;
  whatYouGet?: ReactNode;
  limitations?: ReactNode;
  privacyNote?: string;
  trustNote?: string;
  className?: string;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  toolId,
  toolName,
  toolDescription,
  children,
  onChangeView,
  howItWorks,
  whatYouGet,
  limitations,
  privacyNote,
  trustNote,
  className = "",
}) => {
  const locale = useLocale();

  return (
    <div className={`flex flex-col gap-8 ${className}`} id={`${toolId}-tool`}>
      {/* Trust / Processing Strip */}
      {(privacyNote || trustNote) && (
        <div className="bg-surface-base rounded-2xl p-4 shadow-premium-sm flex flex-wrap items-center gap-3">
          {trustNote && (
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
              <span>{trustNote}</span>
            </div>
          )}
          {privacyNote && (
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{privacyNote}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Tool Workspace */}
      <main className="flex-1">
        {children}
      </main>

      {/* How It Works */}
      {howItWorks && (
        <section className="bg-surface-base rounded-2xl p-6 md:p-8 shadow-premium-sm space-y-4" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-lg md:text-xl font-sans font-semibold text-text-main">
            How it works
          </h2>
          <div className="text-sm text-text-sub leading-relaxed">
            {howItWorks}
          </div>
        </section>
      )}

      {/* What You Get */}
      {whatYouGet && (
        <section className="bg-surface-base rounded-2xl p-6 md:p-8 shadow-premium-sm space-y-4" aria-labelledby="what-you-get-heading">
          <h2 id="what-you-get-heading" className="text-lg md:text-xl font-sans font-semibold text-text-main">
            What you get
          </h2>
          <div className="text-sm text-text-sub leading-relaxed">
            {whatYouGet}
          </div>
        </section>
      )}

      {/* Limitations / Accuracy */}
      {limitations && (
        <section className="bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl p-6 md:p-8 shadow-premium-sm space-y-4" aria-labelledby="limitations-heading">
          <h2 id="limitations-heading" className="text-lg md:text-xl font-sans font-semibold text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            Important limitations
          </h2>
          <div className="text-sm text-text-sub leading-relaxed">
            {limitations}
          </div>
        </section>
      )}

      {/* Creator Studio CTA */}
      <section className="bg-surface-base rounded-2xl p-6 md:p-8 shadow-premium-sm text-center space-y-3">
        <p className="text-sm text-text-sub">
          Need another creator tool?
        </p>
        <button
          onClick={() => onChangeView({ type: "studio", id: "creator" })}
          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          Back to Creator Studio
        </button>
      </section>
    </div>
  );
};