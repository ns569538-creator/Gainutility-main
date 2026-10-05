/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, FileUpload } from "./Common";
import { markToolCompleted } from "../toolCompletion";
import { 
  Copy, 
  Trash2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Check, 
  AlertCircle,
  CheckCircle2,
  FileCode,
  Layers,
  FileJson
} from "lucide-react";

interface JsonValidatorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

/** Upper bound for live validation. Keeps large paste/file drops responsive. */
const MAX_INPUT_CHARS = 5_000_000;

export const JsonValidator: React.FC<JsonValidatorProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [stats, setStats] = useState({
    charCount: 0,
    objectCount: 0,
    arrayCount: 0,
    depth: 0
  });

  const validateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (validateTimerRef.current !== null) window.clearTimeout(validateTimerRef.current);
    };
  }, []);

  const sampleJSON = {
    "name": "JSON Studio Validator",
    "status": "active",
    "version": "1.0.0",
    "features": [
      "Live Validation",
      "Syntax Highlighting",
      "Detailed Line Errors",
      "Offline Secure Processing"
    ],
    "settings": {
      "theme": "premium-dark",
      "beautify": true,
      "maxPayloadMb": 50
    },
    "meta": {
      "author": "JSON Studio",
      "tags": ["json", "validator", "linter", "developer-tools"]
    }
  };

  const loadSample = () => {
    const formatted = JSON.stringify(sampleJSON, null, 2);
    setInputVal(formatted);
    validateJson(formatted);
    onAddToast("Loaded valid sample JSON", "success");
  };

  const handleClear = () => {
    setInputVal("");
    setIsValid(null);
    setErrorInfo(null);
    setStats({ charCount: 0, objectCount: 0, arrayCount: 0, depth: 0 });
    onAddToast("Cleared JSON Validator workspace", "info");
  };

  const computeStats = (parsedObj: any, rawText: string) => {
    let objectCount = 0;
    let arrayCount = 0;
    let maxDepth = 0;

    const traverse = (obj: any, currentDepth: number) => {
      if (obj === null || typeof obj !== "object") return;
      
      maxDepth = Math.max(maxDepth, currentDepth);

      if (Array.isArray(obj)) {
        arrayCount++;
        obj.forEach((item) => traverse(item, currentDepth + 1));
      } else {
        objectCount++;
        Object.values(obj).forEach((value) => traverse(value, currentDepth + 1));
      }
    };

    try {
      traverse(parsedObj, 1);
    } catch (e) {
      // Ignored
    }

    setStats({
      charCount: rawText.length,
      objectCount,
      arrayCount,
      depth: maxDepth
    });
  };

  const validateJson = (text: string) => {
    if (!text.trim()) {
      setIsValid(null);
      setErrorInfo(null);
      setStats({ charCount: 0, objectCount: 0, arrayCount: 0, depth: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setIsValid(true);
      setErrorInfo(null);
      computeStats(parsed, text);
      markToolCompleted("json-validator");
    } catch (err: any) {
      setIsValid(false);
      const errMsg = err.message || "Invalid JSON syntax";
      
      let lineNum: number | undefined;
      let colNum: number | undefined;

      // Chrome/V8: "... at position 42 (line 3 column 5)"
      // Firefox:  "... (at line 3 column 5)"
      const posLineColMatch = errMsg.match(/position\s+(\d+)\s+\(line\s+(\d+)\s+column\s+(\d+)\)/i);
      const firefoxMatch = errMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      const posOnlyMatch = errMsg.match(/position\s+(\d+)/i);
      const lineOnlyMatch = errMsg.match(/line\s+(\d+)/i);

      if (posLineColMatch) {
        lineNum = parseInt(posLineColMatch[2], 10);
        colNum = parseInt(posLineColMatch[3], 10);
      } else if (firefoxMatch && !posOnlyMatch) {
        lineNum = parseInt(firefoxMatch[1], 10);
        colNum = parseInt(firefoxMatch[2], 10);
      } else if (posOnlyMatch) {
        const pos = parseInt(posOnlyMatch[1], 10);
        const beforePos = text.substring(0, pos);
        const lines = beforePos.split("\n");
        lineNum = lines.length;
        colNum = lines[lines.length - 1].length + 1;
      } else if (lineOnlyMatch) {
        lineNum = parseInt(lineOnlyMatch[1], 10);
      }

      setErrorInfo({
        message: errMsg,
        line: lineNum,
        column: colNum
      });
      setStats({
        charCount: text.length,
        objectCount: 0,
        arrayCount: 0,
        depth: 0
      });
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (val.length > MAX_INPUT_CHARS) {
      setIsValid(null);
      setErrorInfo({
        message: `Input exceeds ${Math.floor(MAX_INPUT_CHARS / 1_000_000)} MB — live validation is paused. Remove some content to continue.`
      });
      setStats({ charCount: val.length, objectCount: 0, arrayCount: 0, depth: 0 });
      return;
    }
    if (validateTimerRef.current !== null) window.clearTimeout(validateTimerRef.current);
    validateTimerRef.current = window.setTimeout(() => validateJson(val), 200);
  };

  const handleFileUpload = (fileText: string) => {
    if (fileText.length > MAX_INPUT_CHARS) {
      setInputVal("");
      setIsValid(null);
      setErrorInfo({
        message: `File is larger than ${Math.floor(MAX_INPUT_CHARS / 1_000_000)} MB — too large for live validation. Use a smaller payload.`
      });
      onAddToast("File exceeds the safety limit for live validation", "warning");
      return;
    }
    setInputVal(fileText);
    validateJson(fileText);
    onAddToast("File uploaded and analyzed", "success");
  };

  const handleFormat = () => {
    if (!inputVal.trim()) {
      onAddToast("Enter JSON to format", "warning");
      return;
    }
    try {
      const parsed = JSON.parse(inputVal);
      const formatted = JSON.stringify(parsed, null, 2);
      setInputVal(formatted);
      validateJson(formatted);
      onAddToast("Formatted JSON successfully", "success");
    } catch (err) {
      onAddToast("Please fix validation errors before formatting", "error");
    }
  };

  const handleMinify = () => {
    if (!inputVal.trim()) {
      onAddToast("Enter JSON to minify", "warning");
      return;
    }
    try {
      const parsed = JSON.parse(inputVal);
      const minified = JSON.stringify(parsed);
      setInputVal(minified);
      validateJson(minified);
      onAddToast("Minified JSON successfully", "success");
    } catch (err) {
      onAddToast("Please fix validation errors before minifying", "error");
    }
  };

  const handleCopyText = () => {
    if (!inputVal) {
      onAddToast("Nothing to copy", "warning");
      return;
    }
    onCopy(inputVal);
  };

  const handleDownload = () => {
    if (!inputVal) {
      onAddToast("Nothing to download", "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([inputVal], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `validated_data.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("JSON downloaded successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="json-validator-tool">

      {/* DUAL COLS: EDITOR AND STATISTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <Card 
            title="JSON Input Payload" 
            subtitle="Paste your JSON or drop a file to validate structure in real-time."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  const malformed = `{\n  "name": "Malformed JSON",\n  "unquoted_key": true,\n  "broken_array": [1, 2,\n}`;
                  setInputVal(malformed);
                  validateJson(malformed);
                  onAddToast("Loaded malformed sample", "info");
                }} leftIcon={<FileCode className="w-4 h-4 text-status-error" />} className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error/80 border-status-error/20 hover:bg-status-error/5">
                  Load Malformed
                </Button>
                <Button size="sm" variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Load Valid Sample
                </Button>
                <Button size="sm" variant="outline" onClick={handleFormat} leftIcon={<Check className="w-4 h-4" />} className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Format
                </Button>
                <Button size="sm" variant="secondary" onClick={handleMinify} leftIcon={<Layers className="w-4 h-4" />} className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Minify
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-5 flex-grow">
              
              <div className="relative flex-grow min-h-[420px] flex flex-col">
                <textarea
                  value={inputVal}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste raw JSON here (e.g. { 'id': 101, 'status': 'valid' })..."
                  className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[420px] resize-y shadow-inner"
                />
              </div>

              {/* Quick drag & drop upload */}
              <FileUpload onFileLoaded={handleFileUpload} accept=".json,application/json" label="or drop standard .json file here" />

            </div>
          </Card>
        </div>

        {/* RIGHT ANALYTICS SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* VALIDATION STATUS CARD */}
          <Card title="Validation Engine" subtitle="Live structural diagnostics report">
            <div className="flex flex-col gap-5">
              
              {/* STATUS INDICATOR HERO */}
              {isValid === null ? (
                <div className="p-6 rounded-[20px] bg-surface-muted/30 border border-border-light text-center flex flex-col items-center justify-center gap-3">
                  <FileJson className="w-12 h-12 text-text-muted" />
                  <div>
                    <h4 className="font-bold text-text-main text-base">Awaiting Payload</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">Please paste JSON syntax to start automatic analysis</p>
                  </div>
                </div>
              ) : isValid ? (
                <div data-tool-result className="p-6 rounded-[20px] bg-status-success/10 border border-status-success/20 text-center flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-status-success" />
                  <div>
                    <h4 className="font-bold text-status-success text-lg">Valid JSON Syntax</h4>
                    <p className="text-xs text-status-success/90 mt-1 leading-relaxed">No structural anomalies or unquoted literals detected</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-[20px] bg-status-error/10 border border-status-error/20 flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-status-error">
                    <AlertCircle className="w-10 h-10 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-status-error text-base">Syntax Parse Error</h4>
                      <p className="text-xs text-status-error/90 leading-relaxed">Malformed JSON schema standard</p>
                    </div>
                  </div>
                  
                  {errorInfo && (
                    <div className="p-4 rounded-xl bg-background/50 border border-status-error/10 font-mono text-xs text-text-main flex flex-col gap-2">
                      <p className="text-status-error font-semibold break-words leading-relaxed">{errorInfo.message}</p>
                      {(errorInfo.line || errorInfo.column) && (
                        <div className="flex gap-4 pt-2 border-t border-border-light text-[10px] text-text-muted uppercase font-bold">
                          {errorInfo.line && <span>Line: {errorInfo.line}</span>}
                          {errorInfo.column && <span>Column: {errorInfo.column}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION PACK */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-light">
                <Button variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-12 rounded-[14px] text-sm font-bold">
                  Copy Text
                </Button>
                <Button variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-12 rounded-[14px] text-sm font-bold">
                  Download
                </Button>
              </div>

            </div>
          </Card>

          {/* OBJECT AND METRICS STATS CARD */}
          <Card title="Structural Statistics" subtitle="Quantified object matrix metrics">
            <div className="flex flex-col gap-4 font-mono">
              <div className="flex justify-between items-center p-3.5 bg-surface-muted/10 border border-border-light rounded-xl text-sm">
                <span className="text-xs text-text-muted font-bold uppercase">Character Count</span>
                <span className="font-bold text-text-main">{stats.charCount}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-surface-muted/10 border border-border-light rounded-xl text-sm">
                <span className="text-xs text-text-muted font-bold uppercase">Object Clusters</span>
                <span className="font-bold text-text-main">{stats.objectCount}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-surface-muted/10 border border-border-light rounded-xl text-sm">
                <span className="text-xs text-text-muted font-bold uppercase">Array Nodes</span>
                <span className="font-bold text-text-main">{stats.arrayCount}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-surface-muted/10 border border-border-light rounded-xl text-sm">
                <span className="text-xs text-text-muted font-bold uppercase">Max Tree Depth</span>
                <span className="font-bold text-text-main">{stats.depth}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
