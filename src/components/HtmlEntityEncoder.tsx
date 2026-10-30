/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, Switch } from "./Common";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Check, 
  Info,
  ArrowLeftRight,
  ShieldCheck,
  Code
} from "lucide-react";

interface HtmlEntityEncoderProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const HtmlEntityEncoder: React.FC<HtmlEntityEncoderProps> = ({ onCopy, onAddToast }) => {
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [encodeMode, setEncodeMode] = useState<"special" | "all">("special");
  const [useHex, setUseHex] = useState<boolean>(false);

  // Secure encoder without innerHTML injection
  const secureHtmlEncode = (str: string): string => {
    if (!str) return "";

    if (encodeMode === "special") {
      // Encode only core special characters that can trigger XSS
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;"
      };
      return str.replace(/[&<>"'/]/g, (char) => map[char] || char);
    } else {
      // Encode all non-alphanumeric characters into numerical character references (NCRs)
      return str.split("").map((char) => {
        const code = char.charCodeAt(0);
        // Keep standard alphabetic / numeric strings readable
        if (
          (code >= 48 && code <= 57) || // 0-9
          (code >= 65 && code <= 90) || // A-Z
          (code >= 97 && code <= 122)   // a-z
        ) {
          return char;
        }
        return useHex ? `&#x${code.toString(16)};` : `&#${code};`;
      }).join("");
    }
  };

  // Secure decoder without innerHTML injection
  const secureHtmlDecode = (str: string): string => {
    if (!str) return "";

    let decoded = str;

    // Decode hex numeric references: &#xHEX;
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hexNum) => {
      try {
        const code = parseInt(hexNum, 16);
        return String.fromCharCode(code);
      } catch {
        return `&#x${hexNum};`;
      }
    });

    // Decode decimal numeric references: &#DEC;
    decoded = decoded.replace(/&#(\d+);/g, (_, decNum) => {
      try {
        const code = parseInt(decNum, 10);
        return String.fromCharCode(code);
      } catch {
        return `&#${decNum};`;
      }
    });

    // Decode common named entity codes
    const nameMap: Record<string, string> = {
      "&quot;": '"',
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&apos;": "'",
      "&nbsp;": " ",
      "&copy;": "©",
      "&reg;": "®",
      "&trade;": "™"
    };

    Object.entries(nameMap).forEach(([entity, replacement]) => {
      decoded = decoded.replaceAll(entity, replacement);
    });

    return decoded;
  };

  const handleProcess = (val: string, mode: "encode" | "decode") => {
    if (!val.trim()) {
      setOutputVal("");
      return;
    }
    if (mode === "encode") {
      setOutputVal(secureHtmlEncode(val));
    } else {
      setOutputVal(secureHtmlDecode(val));
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    handleProcess(val, activeTab);
  };

  const handleClear = () => {
    setInputVal("");
    setOutputVal("");
    onAddToast("Cleared inputs", "info");
  };

  const handleTabChange = (tab: "encode" | "decode") => {
    setActiveTab(tab);
    if (outputVal) {
      const oldOutput = outputVal;
      setInputVal(oldOutput);
      setOutputVal("");
      handleProcess(oldOutput, tab);
    } else {
      handleProcess(inputVal, tab);
    }
  };

  // Re-run when options change
  useEffect(() => {
    handleProcess(inputVal, activeTab);
  }, [encodeMode, useHex]);

  const loadSample = (type: "xss" | "entity") => {
    if (type === "xss") {
      setActiveTab("encode");
      const sample = `<script>alert('XSS Risk! & query strings');</script>\n<div class="test">Hello World 🌟</div>`;
      setInputVal(sample);
      setOutputVal(secureHtmlEncode(sample));
    } else {
      setActiveTab("decode");
      const sample = `&lt;div class=&quot;premium&quot;&gt;Lorem &amp; Ipsum &#x27;Studio&#x27; &#127881;&lt;/div&gt;`;
      setInputVal(sample);
      setOutputVal(secureHtmlDecode(sample));
    }
    onAddToast("Loaded HTML entity sample", "success");
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
      onAddToast("Nothing to download", "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([outputVal], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `html_entities_${activeTab}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("File backup downloaded!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="html-entity-encoder-tool">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SOURCE PANEL & SETTINGS (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          
          {/* SOURCE CARD */}
          <Card 
            title={activeTab === "encode" ? "Raw HTML Source" : "Encoded HTML entities"} 
            subtitle="Paste target characters. Escape tags or restore source elements."
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
                placeholder={activeTab === "encode" ? "e.g. <div class='bold'>Hello World!</div>..." : "e.g. &lt;div class=&quot;bold&quot;&gt;Hello World!&lt;/div&gt;..."}
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[300px] resize-y shadow-inner"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => loadSample("xss")} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Load Unsafe HTML
                </Button>
                <Button variant="outline" onClick={() => loadSample("entity")} leftIcon={<ArrowLeftRight className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Load Encoded Entities
                </Button>
                <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                  Clear Editor
                </Button>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-text-muted font-mono uppercase bg-surface-muted/10 p-3 rounded-xl border border-border-light">
                <span>Input character count</span>
                <span className="font-bold text-text-main">{inputVal.length} chars</span>
              </div>
            </div>
          </Card>

          {/* ADVANCED ENCODER CONFIG (Only applicable to Encode mode) */}
          {activeTab === "encode" && (
            <Card 
              title="Encoding Settings" 
              subtitle="Control range and numbering notation style for HTML encoding."
            >
              <div className="flex flex-col gap-5">
                
                {/* Encoding depth selection */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-base font-semibold text-text-main font-sans">Target Range Scope</span>
                  <div className="grid grid-cols-2 gap-3 p-1 border border-border-light rounded-xl bg-surface-muted/10">
                    <button
                      onClick={() => setEncodeMode("special")}
                      className={`py-2 px-3 text-sm font-semibold rounded-lg font-sans cursor-pointer transition-all ${encodeMode === "special" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary" : "text-text-muted hover:text-text-main"}`}
                    >
                      Special Characters Only
                    </button>
                    <button
                      onClick={() => setEncodeMode("all")}
                      className={`py-2 px-3 text-sm font-semibold rounded-lg font-sans cursor-pointer transition-all ${encodeMode === "all" ? "bg-white dark:bg-zinc-800 shadow-sm text-brand-primary" : "text-text-muted hover:text-text-main"}`}
                    >
                      All Unicode Characters
                    </button>
                  </div>
                  <span className="text-xs text-text-muted block mt-1">
                    {encodeMode === "special" 
                      ? 'Encodes only < > & " \' / characters (ideal for standard XSS sanitization).' 
                      : 'Encodes every non-alphanumeric character into numerical references (highly secure).'}
                  </span>
                </div>

                {encodeMode === "all" && (
                  <div className="flex items-center justify-between p-1 pt-3 border-t border-border-light">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-text-main font-sans">Use Hexadecimal Numbers</span>
                      <span className="text-xs text-text-muted">Use hex &#xHEX; instead of decimal &#xDEC; format</span>
                    </div>
                    <Switch
                      checked={useHex}
                      onChange={setUseHex}
                      id="hex-ncr-toggle"
                    />
                  </div>
                )}

              </div>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: CONVERTED RESULTS (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          
          {/* OUTPUT RESULT CARD */}
          <Card 
            title={activeTab === "encode" ? "Sanitized HTML Output" : "Restored Cleartext HTML"} 
            subtitle="XSS immune outputs or restored original HTML source."
            actions={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Copy Output
                </Button>
                <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Export File
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-5 flex-grow">
              <textarea
                value={outputVal}
                readOnly
                placeholder="Awaiting translation stream..."
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[300px] resize-y shadow-inner"
              />
              
              <div className="flex justify-between items-center text-xs font-semibold text-text-muted font-mono uppercase bg-surface-muted/10 p-3 rounded-xl border border-border-light">
                <span>Output character count</span>
                <span className="font-bold text-text-main">{outputVal.length} chars</span>
              </div>
            </div>
          </Card>

          {/* SECURITY STATUS REPORT */}
          <div className="p-5 rounded-[16px] bg-[#E8F5E9] dark:bg-[#122F18] border border-status-success/20 text-[#2E7D32] dark:text-status-success text-sm leading-relaxed flex gap-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] dark:text-status-success flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Compliance:</span>
              <p className="text-xs text-[#388E3C] dark:text-[#81C784] mt-1 leading-relaxed">
                By encoding tags like <code>&lt;script&gt;</code> into browser-neutral representations (e.g., <code>&amp;lt;script&amp;gt;</code>), XSS vectors are rendered as inert strings. This completely prevents code injection during user previews or data warehousing.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
