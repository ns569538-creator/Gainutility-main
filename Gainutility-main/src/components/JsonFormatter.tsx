/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Button, 
  Card, 
  TextArea, 
  Switch, 
  FileUpload, 
  EmptyState 
} from "./Common";
import { 
  Check, 
  Copy, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertOctagon, 
  Braces, 
  Sparkles,
  RefreshCw
} from "lucide-react";

interface JsonFormatterProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const JsonFormatter: React.FC<JsonFormatterProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [autoFormatOnPaste, setAutoFormatOnPaste] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sampleJSON = {
    "platformName": "GainUtility",
    "version": "4.2.1-enterprise",
    "status": "online",
    "database": {
      "type": "relational-hybrid",
      "nodes": 8,
      "readOnly": false,
      "supportedRegions": ["us-east", "eu-central", "ap-south"]
    },
    "featuresEnabled": {
      "realtimeSync": true,
      "edgeCaching": true,
      "clientSchemaValidation": true
    },
    "maxPayloadBytes": 104857600
  };

  const loadSample = () => {
    setInputVal(JSON.stringify(sampleJSON, null, 2));
    setErrorInfo(null);
    setIsValid(null);
    setOutputVal("");
  };

  const clearEditor = () => {
    setInputVal("");
    setOutputVal("");
    setErrorInfo(null);
    setIsValid(null);
    onAddToast("Editor cleared", "info");
  };

  const handleValidateAndFormat = (beautify: boolean = true) => {
    if (!inputVal.trim()) {
      setErrorInfo(null);
      setIsValid(null);
      setOutputVal("");
      return;
    }

    try {
      const parsed = JSON.parse(inputVal);
      setIsValid(true);
      setErrorInfo(null);
      
      if (beautify) {
        const formatted = JSON.stringify(parsed, null, indentSize);
        setOutputVal(formatted);
        onAddToast("JSON Formatted Successfully", "success");
      } else {
        const minified = JSON.stringify(parsed);
        setOutputVal(minified);
        onAddToast("JSON Minified Successfully", "success");
      }
    } catch (err: any) {
      setIsValid(false);
      const errMsg = err.message || "Invalid JSON";
      
      // Parse specific line & column numbers from JS engines
      let lineNum: number | undefined;
      let colNum: number | undefined;
      
      // Chrome/V8: "... at position 42 (line 3 column 5)"
      // Firefox:  "... (at line 3 column 5)"
      const posLineColMatch = errMsg.match(/position\s+(\d+)\s+\(line\s+(\d+)\s+column\s+(\d+)\)/i);
      const firefoxMatch = errMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      const posOnlyMatch = errMsg.match(/position\s+(\d+)/i);
      const lineOnlyMatch = errMsg.match(/line\s+(\d+)/i);

      if (posLineColMatch) {
        // Chrome format — prefer the explicit line/col from parentheses
        lineNum = parseInt(posLineColMatch[2], 10);
        colNum = parseInt(posLineColMatch[3], 10);
      } else if (firefoxMatch && !posOnlyMatch) {
        // Firefox format — no position byte offset
        lineNum = parseInt(firefoxMatch[1], 10);
        colNum = parseInt(firefoxMatch[2], 10);
      } else if (posOnlyMatch) {
        // Fallback: byte offset only — compute line/col from the raw input
        const pos = parseInt(posOnlyMatch[1], 10);
        const beforePos = inputVal.substring(0, pos);
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
      setOutputVal("");
      onAddToast("JSON Validation Failed", "error");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (autoFormatOnPaste) {
      const pastedText = e.clipboardData.getData("text");
      if (pastedText) {
        // Schedule auto format after paste sets value
        setTimeout(() => {
          try {
            const parsed = JSON.parse(pastedText);
            setIsValid(true);
            setErrorInfo(null);
            setOutputVal(JSON.stringify(parsed, null, indentSize));
            onAddToast("Pasted & Formatted Successfully", "success");
          } catch (err) {
            // Ignore failure on live paste if formatting fails, standard value will stay
          }
        }, 50);
      }
    }
  };

  // Keyboard Shortcuts (Ctrl / Cmd + Enter to format)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleValidateAndFormat(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputVal, indentSize]);

  const handleUpload = (content: string, name: string) => {
    setInputVal(content);
    setErrorInfo(null);
    setIsValid(null);
    setOutputVal("");
    onAddToast(`Loaded file: ${name}`, "success");
  };

  const handleDownload = () => {
    const textToDownload = outputVal || inputVal;
    if (!textToDownload.trim()) {
      onAddToast("No content to download", "warning");
      return;
    }
    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast("File download initiated", "success");
  };

  const handleCopy = () => {
    const content = outputVal || inputVal;
    if (!content.trim()) {
      onAddToast("No content to copy", "warning");
      return;
    }
    onCopy(content);
  };

  return (
    <div className="flex flex-col gap-8" id="json-formatter-tool">
      
      {/* Configuration bar */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm md:text-base font-bold uppercase tracking-wider text-text-muted">Indent:</span>
            <div className="flex gap-1 border border-border-light rounded-lg p-1 bg-background">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => setIndentSize(size)}
                  className={`px-3 py-1.5 text-xs md:text-sm font-mono font-bold rounded-md cursor-pointer transition-colors ${
                    indentSize === size 
                      ? "bg-brand-primary text-[#FAF8F1]" 
                      : "text-text-sub hover:bg-surface-hover"
                  }`}
                >
                  {size}s
                </button>
              ))}
            </div>
          </div>
          <div className="h-6 w-px bg-border-light hidden sm:block" />
          <Switch
            id="auto-format-switch"
            checked={autoFormatOnPaste}
            onChange={setAutoFormatOnPaste}
            label="Auto-format on Paste"
          />
        </div>
      </div>

      {/* Editor & output viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* INPUT PANEL */}
        <Card
          id="json-input-card"
          title="Raw JSON Input"
          subtitle="Paste or upload JSON. Press Ctrl+Enter to format."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Sample
              </Button>
              <Button variant="outline" onClick={clearEditor} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                Clear
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-1">
            <div className="relative flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={inputVal}
                onPaste={handlePaste}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setIsValid(null);
                  setErrorInfo(null);
                }}
                placeholder='{\n  "input": "Enter your JSON string here"\n}'
                className="w-full flex-1 p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[440px] shadow-inner"
              />
            </div>

            <FileUpload
              accept=".json"
              onFileLoaded={handleUpload}
              label="Load .json file"
              className="py-5"
            />

            <div className="flex gap-3">
              <Button 
                variant="primary" 
                onClick={() => handleValidateAndFormat(true)} 
                className="flex-1 h-12 md:h-[50px] rounded-[16px] text-base font-bold"
                leftIcon={<Braces className="w-5 h-5" />}
              >
                Validate & Format
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleValidateAndFormat(false)}
                className="h-12 md:h-[50px] rounded-[16px] text-base font-bold"
                leftIcon={<RefreshCw className="w-5 h-5" />}
              >
                Minify
              </Button>
            </div>
          </div>
        </Card>

        {/* OUTPUT PANEL */}
        <Card
          id="json-output-card"
          title="Beautified & Validated Output"
          subtitle="Validated client-side. Zero data leaves your device."
          actions={
            outputVal ? (
              <div className="flex gap-3">
                <Button size="md" variant="primary" onClick={handleCopy} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Copy
                </Button>
                <Button size="md" variant="outline" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Download
                </Button>
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-5 flex-1">
            
            {/* Status alerts */}
            {isValid === true && (
              <div className="flex items-start gap-3 p-5 rounded-[16px] bg-status-success/10 border border-status-success/30 text-status-success text-base font-medium font-sans leading-relaxed">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>JSON structure is perfectly valid! Ready for production deployment.</span>
              </div>
            )}

            {isValid === false && errorInfo && (
              <div className="flex flex-col gap-2 p-5 rounded-[16px] bg-status-error/10 border border-status-error/30 text-status-error text-base leading-relaxed">
                <div className="flex items-start gap-3 font-sans font-semibold">
                  <AlertOctagon className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>Syntax Error: {errorInfo.message}</span>
                </div>
                {(errorInfo.line || errorInfo.column) && (
                  <p className="text-sm font-mono mt-1 opacity-90 pl-8">
                    Location: Line {errorInfo.line || "?"}, Character {errorInfo.column || "?"}
                  </p>
                )}
              </div>
            )}

            {isValid === null && !outputVal && (
              <div className="flex-1 flex items-center justify-center min-h-[360px]">
                <EmptyState
                  title="Awaiting Input Data"
                  description="Beautified JSON output and deep syntax tracing will appear here once validation triggers."
                  icon={<Braces className="w-10 h-10 text-text-muted animate-pulse" />}
                />
              </div>
            )}

            {outputVal && (
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
