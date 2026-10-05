/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, Switch, FileUpload, EmptyState } from "./Common";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  Binary, 
  CheckCircle, 
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { tt, ttf } from "../i18n/toolUi";
import { t } from "../i18n/ui";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/base64Tool";

interface Base64ToolProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const Base64Tool: React.FC<Base64ToolProps> = ({ onCopy, onAddToast }) => {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBase64Detected, setIsBase64Detected] = useState(false);

  // Helper: UTF-8 safe Base64 Encoding
  const utf8EncodeBase64 = (str: string): string => {
    try {
      // Convert string to UTF-8 percent-encoded string, then encode
      const bytes = new TextEncoder().encode(str);
      let binString = "";
      bytes.forEach((b) => {
        binString += String.fromCharCode(b);
      });
      return btoa(binString);
    } catch (e) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  };

  // Helper: UTF-8 safe Base64 Decoding
  const utf8DecodeBase64 = (base64Str: string): string => {
    // Standard cleaning of whitespaces
    const cleaned = base64Str.trim().replace(/\s/g, "");
    
    // btoa/atob require binary strings. Decode base64 to binary character stream first
    const binString = atob(cleaned);
    const len = binString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  // Auto-detect valid Base64 string for decode helper invitation
  const checkIfValidBase64 = (str: string): boolean => {
    const trimmed = str.trim();
    if (!trimmed) return false;
    // Check standard Base64 characters and alignment patterns
    const regex = /^[A-Za-z0-9+/=]+$/;
    if (!regex.test(trimmed)) return false;
    // Check length alignments (Base64 is padded to multiples of 4)
    if (trimmed.length % 4 !== 0) return false;
    
    try {
      // Verify parsing doesn't throw immediate errors
      atob(trimmed);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleProcess = () => {
    if (!inputVal.trim()) {
      setOutputVal("");
      setErrorMsg(null);
      return;
    }

    try {
      setErrorMsg(null);
      if (activeTab === "encode") {
        const encoded = utf8EncodeBase64(inputVal);
        setOutputVal(encoded);
        onAddToast(tt("base64-tool", "encodeComplete", locale, "Base64 Encoding Complete"), "success");
      } else {
        const decoded = utf8DecodeBase64(inputVal);
        setOutputVal(decoded);
        onAddToast(tt("base64-tool", "decodeComplete", locale, "Base64 Decoding Complete"), "success");
      }
    } catch (err: any) {
      setOutputVal("");
      setErrorMsg(tt("base64-tool", "decodeFailedError", locale, "Failed to decode. String is not a valid Base64 sequence or contains unsupported data formats."));
      onAddToast(tt("base64-tool", "processFailed", locale, "Base64 Processing Failed"), "error");
    }
  };

  // Live updates
  useEffect(() => {
    handleProcess();

    // Auto detect Base64 strings to help user switch modes
    if (activeTab === "encode" && checkIfValidBase64(inputVal)) {
      setIsBase64Detected(true);
    } else {
      setIsBase64Detected(false);
    }
  }, [inputVal, activeTab]);

  const handleClear = () => {
    setInputVal("");
    setOutputVal("");
    setErrorMsg(null);
    onAddToast(tt("base64-tool", "editorCleared", locale, "Editor cleared"), "info");
  };

  const loadSample = () => {
    if (activeTab === "encode") {
      setInputVal("Premium Multilingual toolkit - Built for absolute performance and SEO-first integrity! 🎯");
    } else {
      setInputVal("UHJlbWl1bSBNdWx0aWxpbmd1YWwgdG9vbGtpdCAtIEJ1aWx0IGZvciBhYnNvbHV0ZSBwZXJmb3JtYW5jZSBhbmQgU0VPLWZpcnN0IGludGVncml0eSEg8J+Mnw==");
    }
  };

  const handleDownload = () => {
    const target = outputVal || inputVal;
    if (!target.trim()) {
      onAddToast(tt("base64-tool", "noContentExport", locale, "No content to export"), "warning");
      return;
    }
    const blob = new Blob([target], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab === "encode" ? "encoded_base64.txt" : "decoded_raw.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast(tt("base64-tool", "downloadInitiated", locale, "Download initiated"), "success");
  };

  const handleUpload = (content: string, name: string) => {
    setInputVal(content);
    onAddToast(ttf("base64-tool", "loadedFile", locale, { name }, `Loaded file: ${name}`), "success");
  };

  const handleCopy = () => {
    const target = outputVal || inputVal;
    if (!target.trim()) {
      onAddToast(tt("base64-tool", "noContentCopy", locale, "No content to copy"), "warning");
      return;
    }
    onCopy(target);
  };

  return (
    <div className="flex flex-col gap-8" id="base64-tool">
      
      {/* Config Bar */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        
        {/* Toggle tabs */}
        <div className="flex gap-3 bg-background border border-border-light rounded-[16px] p-1.5 shadow-sm">
          <button
            onClick={() => { setActiveTab("encode"); setInputVal(""); setOutputVal(""); }}
            className={`py-3 px-6 rounded-[12px] font-sans font-bold text-base transition-all duration-200 cursor-pointer ${
              activeTab === "encode"
                ? "bg-brand-primary text-[#FAF8F1] shadow-sm"
                : "hover:bg-surface-hover text-text-sub"
            }`}
          >
            {tt("base64-tool", "encodeMode", locale, "Encoder Mode")}
          </button>
          <button
            onClick={() => { setActiveTab("decode"); setInputVal(""); setOutputVal(""); }}
            className={`py-3 px-6 rounded-[12px] font-sans font-bold text-base transition-all duration-200 cursor-pointer ${
              activeTab === "decode"
                ? "bg-brand-primary text-[#FAF8F1] shadow-sm"
                : "hover:bg-surface-hover text-text-sub"
            }`}
          >
            {tt("base64-tool", "decodeMode", locale, "Decoder Mode")}
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={handleClear} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5" leftIcon={<Trash2 className="w-4 h-4" />}>
            {t("clear", locale)}
          </Button>
        </div>

      </div>

      {/* Workspace editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* INPUT COMPOSER */}
        <Card
          id="base64-input-card"
          title={activeTab === "encode" ? tt("base64-tool", "inputTitleEncode", locale, "Raw Text / String") : tt("base64-tool", "inputTitleDecode", locale, "Base64 Code String")}
          subtitle={tt("base64-tool", "inputSubtitle", locale, "Input content will process locally inside the sandboxed context.")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                {tt("base64-tool", "loadPreset", locale, "Load Preset")}
              </Button>
              <span className="text-sm font-mono font-bold text-text-muted bg-surface-muted/50 px-3 py-1.5 rounded-lg border border-border-light/60">
                {ttf("base64-tool", "characterCount", locale, { count: String(inputVal.length) }, `${inputVal.length} characters`)}
              </span>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-1">
            
            {isBase64Detected && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-[16px] bg-brand-accent/15 border border-brand-accent/30 text-text-main text-base leading-relaxed gap-4">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-brand-accent shrink-0" />
                  <span>{tt("base64-tool", "detectedPrompt", locale, "Base64 format detected! Would you like to switch to Decoder Mode?")}</span>
                </div>
                <button
                  onClick={() => setActiveTab("decode")}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 shadow-sm"
                >
                  {tt("base64-tool", "switchNow", locale, "Switch Now")}
                </button>
              </div>
            )}

            <div className="relative flex-1">
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={activeTab === "encode" ? tt("base64-tool", "inputPlaceholderEncode", locale, "Write or paste standard text string here...") : tt("base64-tool", "inputPlaceholderDecode", locale, "Paste valid Base64 code here (e.g. dGVzdGluZw==)...")}
                className="w-full h-full p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[440px] shadow-inner pr-12"
              />
              {inputVal && (
                <button
                  onClick={() => setInputVal("")}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors duration-150 cursor-pointer"
                  title={tt("base64-tool", "clearInput", locale, "Clear input")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <FileUpload
              accept=".txt, .json, .b64"
              onFileLoaded={handleUpload}
              label={tt("base64-tool", "uploadLabel", locale, "Load data from text/b64 file")}
              className="py-5"
            />

          </div>
        </Card>
 
        {/* OUTPUT COMPOSER */}
        <Card
          id="base64-output-card"
          title={activeTab === "encode" ? tt("base64-tool", "outputTitleEncode", locale, "Base64 Code String Output") : tt("base64-tool", "outputTitleDecode", locale, "Decoded Text Output")}
          subtitle={tt("base64-tool", "outputSubtitle", locale, "Real-time safe conversions. Multi-language character support.")}
          actions={
            <div className="flex gap-3 items-center">
              {outputVal && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
              <Button size="md" variant="primary" onClick={handleCopy} disabled={!outputVal} leftIcon={<Copy className="w-4 h-4" />} className="h-[48px] md:h-[50px] rounded-[16px] text-sm font-bold">
                {t("copy", locale)}
              </Button>
              <Button size="md" variant="outline" onClick={handleDownload} disabled={!outputVal} leftIcon={<Download className="w-4 h-4" />} className="h-[48px] md:h-[50px] rounded-[16px] text-sm font-bold">
                {t("export", locale)}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-1">
            
            {errorMsg && (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/30 text-status-error text-base font-mono leading-relaxed">
                {errorMsg}
              </div>
            )}

            {!errorMsg && !outputVal && (
              <div className="flex-1 flex items-center justify-center min-h-[360px]">
                <EmptyState
                  title={tt("base64-tool", "awaitingTitle", locale, "Awaiting Processed Stream")}
                  description={tt("base64-tool", "awaitingDescription", locale, "Converted Base64 text streams appear here in real-time as you write in the input composer.")}
                  icon={<Binary className="w-10 h-10 text-text-muted animate-pulse" />}
                />
              </div>
            )}

            {!errorMsg && outputVal && (
              <div className="relative flex-1 flex flex-col">
                <pre className="w-full flex-1 p-6 bg-[#1C2311]/95 text-[#FAF8F1] rounded-[16px] font-mono text-base sm:text-sm sm:leading-relaxed overflow-auto max-h-[500px] select-all border border-border-light shadow-lg">
                  <code>{outputVal}</code>
                </pre>
              </div>
            )}

          </div>
        </Card>

      </div>

    </div>
  );
};
