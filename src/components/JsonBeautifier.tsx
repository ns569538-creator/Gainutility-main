/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, FileUpload } from "./Common";
import { usePostDownload } from "../hooks/usePostDownload";
import { PostDownloadPanel } from "./PostDownloadPanel";
import { tt } from "../i18n/toolUi";
import { t } from "../i18n/ui";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/jsonBeautifier";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Check, 
  Settings,
  ListFilter,
  Eye,
  FileCode
} from "lucide-react";

interface JsonBeautifierProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

/** Upper bound for live formatting. Keeps large paste/file drops responsive. */
const MAX_INPUT_CHARS = 5_000_000;

export const JsonBeautifier: React.FC<JsonBeautifierProps> = ({ onCopy, onAddToast }) => {
  const locale = useLocale();
  const postDownload = usePostDownload();

  const [inputVal, setInputVal] = useState("");
  const [indentStyle, setIndentStyle] = useState<"2" | "4" | "tab">("2");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formattedText, setFormattedText] = useState("");

  const formatTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (formatTimerRef.current !== null) window.clearTimeout(formatTimerRef.current);
    };
  }, []);

  const sampleJSON = {
    "project": "JSON Studio Beautifier",
    "active": true,
    "rating": 4.95,
    "specifications": {
      "language": "TypeScript 5.x",
      "engine": "V8 / Hermes compatible",
      "formatsSupported": ["json", "geojson", "ndjson"]
    },
    "features": [
      { "id": 1, "name": "Custom Indents" },
      { "id": 2, "name": "Dynamic Color Themes" }
    ],
    "remarks": null
  };

  const loadSample = () => {
    const minified = JSON.stringify(sampleJSON);
    setInputVal(minified);
    handleFormat(minified, indentStyle);
  };

  const handleClear = () => {
    setInputVal("");
    setFormattedText("");
    setErrorMsg(null);
    onAddToast(tt("json-beautifier", "clearedWorkspace", locale, "Cleared Beautifier workspace"), "info");
  };

  const getIndentChar = (style: "2" | "4" | "tab"): string | number => {
    if (style === "2") return 2;
    if (style === "4") return 4;
    return "\t";
  };

  const handleFormat = (val: string, style: "2" | "4" | "tab") => {
    if (!val.trim()) {
      setFormattedText("");
      setErrorMsg(null);
      return;
    }

    if (val.length > MAX_INPUT_CHARS) {
      setFormattedText("");
      setErrorMsg(`Input exceeds ${Math.floor(MAX_INPUT_CHARS / 1_000_000)} MB — live formatting is paused. Remove some content to continue.`);
      return;
    }

    try {
      const parsed = JSON.parse(val);
      const space = getIndentChar(style);
      const result = JSON.stringify(parsed, null, space);
      setFormattedText(result);
      setErrorMsg(null);
    } catch (err: any) {
      setFormattedText("");
      setErrorMsg(err.message || tt("json-beautifier", "invalidSyntax", locale, "Invalid JSON syntax detected."));
    }
  };

  useEffect(() => {
    handleFormat(inputVal, indentStyle);
  }, [indentStyle]);

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (formatTimerRef.current !== null) window.clearTimeout(formatTimerRef.current);
    formatTimerRef.current = window.setTimeout(() => handleFormat(val, indentStyle), 200);
  };

  const handleFileUpload = (fileText: string) => {
    setInputVal(fileText);
    if (fileText.length > MAX_INPUT_CHARS) {
      setFormattedText("");
      setErrorMsg(`File is larger than ${Math.floor(MAX_INPUT_CHARS / 1_000_000)} MB — too large for live formatting. Use a smaller payload.`);
      onAddToast("File exceeds the safety limit for live formatting", "warning");
      return;
    }
    handleFormat(fileText, indentStyle);
    onAddToast(tt("json-beautifier", "fileLoaded", locale, "File loaded and beautified"), "success");
  };

  const handleCopyText = () => {
    if (!formattedText) {
      onAddToast(tt("json-beautifier", "nothingToCopy", locale, "Nothing to copy"), "warning");
      return;
    }
    onCopy(formattedText);
  };

  const handleDownload = () => {
    if (!formattedText) {
      onAddToast(tt("json-beautifier", "nothingToDownload", locale, "Nothing to download"), "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([formattedText], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `beautified_data.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast(tt("json-beautifier", "downloaded", locale, "Beautified JSON downloaded!"), "success");
    postDownload.show("JSON Beautifier");
  };

  // Safe client-side JSON Syntax Highlighter generator
  const renderHighlightedJson = (jsonStr: string) => {
    if (!jsonStr) return null;
    
    // Escape standard characters for secure HTML injection
    const escaped = jsonStr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Regular expressions for JSON parts
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    escaped.replace(regex, (match: string, p1: any, offset: number) => {
      // Append non-matching leading text
      if (offset > lastIndex) {
        parts.push(escaped.substring(lastIndex, offset));
      }

      let cls = "text-text-main"; // standard formatting
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-brand-primary font-bold dark:text-[#A9DFBF]"; // key
        } else {
          cls = "text-amber-600 dark:text-[#F5B041]"; // string value
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-600 dark:text-[#BB8FCE]"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-zinc-400 font-italic"; // null
      } else {
        cls = "text-blue-600 dark:text-[#85C1E9]"; // number
      }

      parts.push(
        <span key={offset} className={cls}>
          {match}
        </span>
      );

      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < escaped.length) {
      parts.push(escaped.substring(lastIndex));
    }

    return <pre className="font-mono text-base sm:text-sm sm:leading-relaxed overflow-x-auto whitespace-pre">{parts}</pre>;
  };

  return (
    <div className="flex flex-col gap-8" id="json-beautifier-tool">

      {/* DUAL COLS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* INPUT SOURCE */}
        <Card
          title={tt("json-beautifier", "rawInputTitle", locale, "Raw JSON Input")}
          subtitle={tt("json-beautifier", "rawInputSubtitle", locale, "Paste compressed, minified, or disorganized JSON text.")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                {tt("json-beautifier", "loadSample", locale, "Load Sample")}
              </Button>
              <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                {t("clear", locale)}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. {'user':'alice','roles':['admin','developer']}..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
            />

            <FileUpload onFileLoaded={handleFileUpload} accept=".json,application/json" label={tt("json-beautifier", "uploadLabel", locale, "or upload raw .json payload")} />
          </div>
        </Card>

        {/* BEAUTIFIED OUTPUT */}
        <Card 
          title={tt("json-beautifier", "formattedTitle", locale, "Formatted Result")} 
          subtitle={tt("json-beautifier", "formattedSubtitle", locale, "Clean structural spacing and pretty print visualization.")}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                {t("copy", locale)}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                {tt("json-beautifier", "exportFile", locale, "Export File")}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            
            {/* INDENT STYLE SETTING IN OUTPUT */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border-light bg-surface-muted/10 font-mono text-xs">
              <span className="font-bold uppercase text-text-muted flex items-center gap-1.5">
                <Settings className="w-4 h-4" /> {tt("json-beautifier", "indentationStyle", locale, "Indentation Style")}
              </span>
              <div className="flex gap-1 bg-surface-muted/30 p-1 border border-border-light rounded-lg">
                <button
                  onClick={() => setIndentStyle("2")}
                  className={`px-3 py-1.5 font-bold rounded-md transition-all cursor-pointer ${indentStyle === "2" ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                  {tt("json-beautifier", "twoSpaces", locale, "2 Spaces")}
                </button>
                <button
                  onClick={() => setIndentStyle("4")}
                  className={`px-3 py-1.5 font-bold rounded-md transition-all cursor-pointer ${indentStyle === "4" ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                  {tt("json-beautifier", "fourSpaces", locale, "4 Spaces")}
                </button>
                <button
                  onClick={() => setIndentStyle("tab")}
                  className={`px-3 py-1.5 font-bold rounded-md transition-all cursor-pointer ${indentStyle === "tab" ? "bg-white dark:bg-zinc-800 text-brand-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                  {tt("json-beautifier", "tabs", locale, "Tabs")}
                </button>
              </div>
            </div>

            {/* LIVE DISPLAY AND ERROR CODES */}
            {errorMsg ? (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed flex flex-col gap-2 shadow-inner flex-grow min-h-[380px]">
                <h4 className="font-bold flex items-center gap-2">
                  <FileCode className="w-5 h-5 flex-shrink-0" />
                  <span>{tt("json-beautifier", "syntaxMismatch", locale, "Syntax Parse Mismatch")}</span>
                </h4>
                <p className="font-mono text-xs opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            ) : formattedText ? (
              <div className="w-full flex-grow p-6 bg-surface-base text-text-main rounded-[16px] border border-border-light overflow-auto min-h-[380px] shadow-inner max-h-[500px]">
                {renderHighlightedJson(formattedText)}
              </div>
            ) : (
              <div className="w-full flex-grow p-6 bg-surface-base text-text-muted font-mono text-sm border border-border-light rounded-[16px] flex items-center justify-center min-h-[380px]">
                <span>{tt("json-beautifier", "awaiting", locale, "Awaiting pretty print parsing...")}</span>
              </div>
            )}

          </div>
        </Card>

      </div>

      <PostDownloadPanel
        info={postDownload.info}
        onClose={postDownload.close}
        onDismiss={postDownload.dismiss}
        onAddToast={onAddToast}
      />

    </div>
  );
};

