/**
 * Read-only code panel for the Image to Code tool: line-wrapped syntax
 * highlighting + copy button. Highlighters pre-escape the whole string,
 * then run a single replace pass so injected markup is never re-scanned
 * (same safety model as JsonBeautifier's renderHighlightedJson).
 */

import React, { useId, useState } from "react";
import { Check, Copy, Download } from "lucide-react";

export type CodeLanguage = "html" | "css";

interface CodeViewerProps {
  language: CodeLanguage;
  code: string;
  onCopy: (text: string) => void;
  copyLabel: string;
  copiedLabel?: string;
  onDownload?: () => void;
  downloadLabel?: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const span = (className: string, text: string): string =>
  `<span class="${className}">${text}</span>`;

/** Single-pass HTML highlighter over pre-escaped source. */
const highlightHtml = (code: string): string => {
  const escaped = escapeHtml(code);
  const token =
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[a-zA-Z][\w:-]*)|([a-zA-Z-]+)(?==)|("[^"]*")|(\/?&gt;)/g;
  return escaped.replace(
    token,
    (match, comment: string, tagOpen: string, attr: string, value: string, close: string) => {
      if (comment) return span("text-zinc-400 dark:text-[#7F848E] italic", comment);
      if (tagOpen) return span("text-brand-primary font-bold dark:text-[#A9DFBF]", tagOpen);
      if (attr) return span("text-purple-600 dark:text-[#BB8FCE]", attr);
      if (value) return span("text-amber-600 dark:text-[#F5B041]", value);
      if (close) return span("text-brand-primary font-bold dark:text-[#A9DFBF]", close);
      return match;
    }
  );
};

/** Single-pass CSS highlighter over pre-escaped source. */
const highlightCss = (code: string): string => {
  const escaped = escapeHtml(code);
  const token = /(\/\*[\s\S]*?\*\/)|(@[\w-]+)|("[^"]*"|'[^']*')|([\w-]+)(?=\s*:)|([^{}@/"']+?)(?=\s*\{)|([{}])/g;
  return escaped.replace(
    token,
    (
      match,
      comment: string,
      atRule: string,
      str: string,
      prop: string,
      selector: string,
      brace: string
    ) => {
      if (comment) return span("text-zinc-400 dark:text-[#7F848E] italic", comment);
      if (atRule) return span("text-purple-600 dark:text-[#BB8FCE] font-bold", atRule);
      if (str) return span("text-amber-600 dark:text-[#F5B041]", str);
      if (prop) return span("text-blue-600 dark:text-[#85C1E9]", prop);
      if (selector) return span("text-brand-primary font-bold dark:text-[#A9DFBF]", selector);
      if (brace) return span("text-zinc-500 dark:text-[#ABB2BF]", brace);
      return match;
    }
  );
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  language,
  code,
  onCopy,
  copyLabel,
  copiedLabel = "Copied!",
  onDownload,
  downloadLabel,
}) => {
  const headingId = useId();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const html = language === "html" ? highlightHtml(code) : highlightCss(code);

  return (
    <div className="border border-border-light rounded-[14px] bg-background overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border-light bg-surface-muted">
        <span id={headingId} className="font-mono text-xs font-bold uppercase tracking-wide text-text-muted">
          {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-sans bg-surface-base border border-border-light text-text-main hover:text-brand-primary hover:border-brand-primary/40 transition-colors cursor-pointer min-h-[32px]"
            aria-label={copyLabel}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
          {onDownload && downloadLabel && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-sans bg-surface-base border border-border-light text-text-main hover:text-brand-primary hover:border-brand-primary/40 transition-colors cursor-pointer min-h-[32px]"
              aria-label={downloadLabel}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadLabel}</span>
            </button>
          )}
        </div>
      </div>
      <pre
        aria-labelledby={headingId}
        className="font-mono text-[13px] leading-relaxed p-4 overflow-auto max-h-[420px] whitespace-pre-wrap break-words text-text-main"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
