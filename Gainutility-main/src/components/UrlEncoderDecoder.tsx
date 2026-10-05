/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card } from "./Common";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Check, 
  Info,
  ArrowLeftRight,
  ShieldAlert
} from "lucide-react";

interface UrlEncoderDecoderProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const UrlEncoderDecoder: React.FC<UrlEncoderDecoderProps> = ({ onCopy, onAddToast }) => {
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedEncoded, setDetectedEncoded] = useState<boolean>(false);

  // Auto-detect if input string is likely URL encoded
  const checkIfEncoded = (str: string): boolean => {
    if (!str.trim()) return false;
    // Simple regex: contains standard URL percent encoding indicators like %20, %2F, %3F, etc.
    const regex = /%[0-9A-Fa-f]{2}/;
    return regex.test(str);
  };

  // Convert/process values in real-time
  const handleProcess = (val: string, mode: "encode" | "decode") => {
    if (!val.trim()) {
      setOutputVal("");
      setErrorMsg(null);
      return;
    }

    try {
      setErrorMsg(null);
      if (mode === "encode") {
        // Safe complete encode including spec symbols
        const encoded = encodeURIComponent(val);
        setOutputVal(encoded);
      } else {
        // Safe complete decode with error check
        const decoded = decodeURIComponent(val);
        setOutputVal(decoded);
      }
    } catch (err: any) {
      setOutputVal("");
      setErrorMsg(`Malformed URL percent-encoding payload: ${err.message}. Make sure your string follows correct hex bounds (e.g. %20 or %3F).`);
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    const isEncoded = checkIfEncoded(val);
    setDetectedEncoded(isEncoded);
    handleProcess(val, activeTab);
  };

  const handleTabChange = (tab: "encode" | "decode") => {
    setActiveTab(tab);
    // Swap input and output on tab change for fast multi-step workflow
    if (outputVal && !errorMsg) {
      const oldOutput = outputVal;
      setInputVal(oldOutput);
      setOutputVal("");
      handleProcess(oldOutput, tab);
    } else {
      handleProcess(inputVal, tab);
    }
  };

  const handleClear = () => {
    setInputVal("");
    setOutputVal("");
    setErrorMsg(null);
    setDetectedEncoded(false);
    onAddToast("Cleared inputs and outputs", "info");
  };

  const loadSample = (type: "search" | "query") => {
    if (type === "search") {
      setActiveTab("encode");
      const sample = "https://ai.studio/build?query=premium css widgets & developer utilities=true";
      setInputVal(sample);
      setDetectedEncoded(false);
      handleProcess(sample, "encode");
    } else {
      setActiveTab("decode");
      const sample = "https%3A%2F%2Fai.studio%2Fbuild%3Fquery%3Dpremium%2520css%2520widgets%2520%26%2520developer%2520utilities%3Dtrue";
      setInputVal(sample);
      setDetectedEncoded(true);
      handleProcess(sample, "decode");
    }
    onAddToast(`Loaded sample URL`, "success");
  };

  const handleCopyText = () => {
    if (!outputVal) {
      onAddToast("Nothing to copy", "warning");
      return;
    }
    onCopy(outputVal);
  };

  const handleDownload = () => {
    if (!outputVal) {
      onAddToast("Nothing to export", "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([outputVal], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `url_${activeTab === "encode" ? "encoded" : "decoded"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("File downloaded successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="url-encoder-decoder-tool">

      {/* DETECTED ENCODED SUGGESTION */}
      {detectedEncoded && activeTab === "encode" && (
        <div className="flex items-center justify-between p-5 rounded-[16px] bg-brand-primary-light/15 border border-brand-primary/20 text-brand-primary font-sans leading-relaxed shadow-sm">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">We detected percent-encoding characters in your input. Would you like to switch to decoding?</span>
          </div>
          <Button size="sm" variant="primary" onClick={() => handleTabChange("decode")} className="h-10 px-4 rounded-xl text-xs font-bold">
            Switch to Decoder
          </Button>
        </div>
      )}

      {/* DUAL WORKSPACE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT PANEL */}
        <Card 
          title={activeTab === "encode" ? "Raw Input Text" : "Encoded Input string"} 
          subtitle="Input characters. Re-computes in real-time as you type."
          actions={
            <div className="flex border border-border-light rounded-xl overflow-hidden p-0.5 bg-surface-muted/30">
              <button
                onClick={() => handleTabChange("encode")}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-[10px] cursor-pointer ${activeTab === "encode" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary" : "text-text-muted hover:text-text-main"}`}
              >
                Encode Mode
              </button>
              <button
                onClick={() => handleTabChange("decode")}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-[10px] cursor-pointer ${activeTab === "decode" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary" : "text-text-muted hover:text-text-main"}`}
              >
                Decode Mode
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={activeTab === "encode" ? "Paste normal URL or plain text (e.g. query param values)..." : "Paste percent encoded string (e.g. https%3A%2F%2F...)..."}
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
            />

            {/* Sample / clear */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => loadSample("search")} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Raw URL
              </Button>
              <Button variant="outline" onClick={() => loadSample("query")} leftIcon={<ArrowLeftRight className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Encoded URL
              </Button>
              <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                Clear All
              </Button>
            </div>

            {/* Metric counters */}
            <div className="flex justify-between items-center text-xs font-semibold text-text-muted font-mono uppercase bg-surface-muted/10 p-3 rounded-xl border border-border-light">
              <span>Source Length</span>
              <span className="font-bold text-text-main">{inputVal.length} chars</span>
            </div>
          </div>
        </Card>

        {/* OUTPUT PANEL */}
        <Card 
          title={activeTab === "encode" ? "Encoded Output String" : "Decoded Output Text"} 
          subtitle="Unicode compliant percent encoding or original cleartext text."
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                Copy
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                Export TXT
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            
            {/* Graceful decoding errors */}
            {errorMsg ? (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed flex flex-col gap-2 shadow-inner flex-grow min-h-[380px]">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>Syntax Processing Error</span>
                </div>
                <p className="font-mono text-xs opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            ) : (
              <textarea
                value={outputVal}
                readOnly
                placeholder="Awaiting input conversion..."
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
              />
            )}

            {/* Metric counters */}
            <div className="flex justify-between items-center text-xs font-semibold text-text-muted font-mono uppercase bg-surface-muted/10 p-3 rounded-xl border border-border-light">
              <span>Output Length</span>
              <span className="font-bold text-text-main">{outputVal.length} chars</span>
            </div>

          </div>
        </Card>

      </div>

    </div>
  );
};
