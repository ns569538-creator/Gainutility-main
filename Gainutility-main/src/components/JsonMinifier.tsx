/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, FileUpload } from "./Common";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Check, 
  Layers,
  ArrowRight,
  TrendingDown,
  Percent
} from "lucide-react";

interface JsonMinifierProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const JsonMinifier: React.FC<JsonMinifierProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    originalSize: 0,
    minifiedSize: 0,
    savedChars: 0,
    compressionRatio: "0"
  });

  const sampleJSON = {
    "organization": "JSON Studio Minifier",
    "established": 2026,
    "services": {
      "hosting": "cloud-native",
      "redundancy": ["primary-east", "replica-west"],
      "uptimeTarget": 99.999
    },
    "compliance": {
      "gdpr": true,
      "iso27001": true
    },
    "debug": null
  };

  const loadSample = () => {
    const formatted = JSON.stringify(sampleJSON, null, 4);
    setInputVal(formatted);
    handleMinify(formatted);
  };

  const handleClear = () => {
    setInputVal("");
    setOutputVal("");
    setErrorMsg(null);
    setMetrics({ originalSize: 0, minifiedSize: 0, savedChars: 0, compressionRatio: "0" });
    onAddToast("Minifier workspace reset", "info");
  };

  const handleMinify = (val: string) => {
    if (!val.trim()) {
      setOutputVal("");
      setErrorMsg(null);
      setMetrics({ originalSize: 0, minifiedSize: 0, savedChars: 0, compressionRatio: "0" });
      return;
    }

    try {
      const parsed = JSON.parse(val);
      const minified = JSON.stringify(parsed);
      setOutputVal(minified);
      setErrorMsg(null);

      // Compute statistics
      const origLen = val.length;
      const minLen = minified.length;
      const saved = Math.max(0, origLen - minLen);
      const compression = origLen > 0 ? ((saved / origLen) * 100).toFixed(1) : "0";

      setMetrics({
        originalSize: origLen,
        minifiedSize: minLen,
        savedChars: saved,
        compressionRatio: compression
      });
      onAddToast("Minified JSON", "success");
    } catch (err: any) {
      setOutputVal("");
      setErrorMsg(`Malformed JSON layout: ${err.message}`);
      setMetrics({ originalSize: val.length, minifiedSize: 0, savedChars: 0, compressionRatio: "0" });
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    handleMinify(val);
  };

  const handleFileUpload = (fileText: string) => {
    setInputVal(fileText);
    handleMinify(fileText);
    onAddToast("File uploaded and minified", "success");
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
    const file = new Blob([outputVal], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `compressed_data.min.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("Minified file downloaded successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="json-minifier-tool">

      {/* METRICS SHOWCASE GRID */}
      {metrics.originalSize > 0 && !errorMsg && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm flex flex-col justify-between">
            <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Original Size</span>
            <span className="text-2xl font-bold text-text-main font-mono mt-2">{metrics.originalSize} chars</span>
          </div>
          <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm flex flex-col justify-between">
            <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Minified Size</span>
            <span className="text-2xl font-bold text-text-main font-mono mt-2">{metrics.minifiedSize} chars</span>
          </div>
          <div className="bg-[#E8F5E9] dark:bg-[#122F18] border border-status-success/20 rounded-2xl p-5 shadow-premium-sm flex flex-col justify-between">
            <span className="text-xs text-[#2E7D32] dark:text-status-success font-bold font-mono uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Characters Saved
            </span>
            <span className="text-2xl font-bold text-[#2E7D32] dark:text-status-success font-mono mt-2">-{metrics.savedChars} chars</span>
          </div>
          <div className="bg-brand-primary-light/10 border border-brand-primary/20 rounded-2xl p-5 shadow-premium-sm flex flex-col justify-between">
            <span className="text-xs text-brand-primary font-bold font-mono uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Compression Ratio
            </span>
            <span className="text-2xl font-bold text-brand-primary font-mono mt-2">{metrics.compressionRatio}% saved</span>
          </div>
        </div>
      )}

      {/* DUAL COLS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT EDITOR */}
        <Card
          title="Raw Pretty JSON"
          subtitle="Paste your standard indented JSON. Compresses instantly."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Sample
              </Button>
              <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                Clear Workspace
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste indented JSON data structure here..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
            />
            
            <FileUpload onFileLoaded={handleFileUpload} accept=".json,application/json" label="or upload file to compress" />
          </div>
        </Card>

        {/* COMPRESSED OUTPUT */}
        <Card 
          title="Minified Result" 
          subtitle="Whitespace-free, single-line optimized output."
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                Copy Output
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                Download JSON
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            {errorMsg ? (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed flex flex-col gap-2 shadow-inner flex-grow min-h-[380px]">
                <h4 className="font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 flex-shrink-0" />
                  <span>Validation Error</span>
                </h4>
                <p className="font-mono text-xs opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            ) : (
              <textarea
                value={outputVal}
                readOnly
                placeholder="Awaiting pretty source for compression..."
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-xs sm:leading-normal border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner break-all"
              />
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};
