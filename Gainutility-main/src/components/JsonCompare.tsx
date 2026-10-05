/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Button, Card, FileUpload, EmptyState, Switch } from "./Common";
import { 
  Braces, 
  Copy, 
  Download, 
  Trash2, 
  Sparkles, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertCircle,
  FileDown
} from "lucide-react";

interface JsonCompareProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

interface DiffItem {
  keyPath: string;
  type: "added" | "removed" | "modified" | "identical";
  leftVal: string;
  rightVal: string;
}

export const JsonCompare: React.FC<JsonCompareProps> = ({ onCopy, onAddToast }) => {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [diffResults, setDiffResults] = useState<DiffItem[]>([]);
  const [hasCompared, setHasCompared] = useState(false);
  const [isPerfectMatch, setIsPerfectMatch] = useState(false);

  const sampleLeft = {
    "platformName": "GainUtility",
    "version": "4.2.0-beta",
    "status": "online",
    "database": {
      "type": "relational",
      "nodes": 4,
      "readOnly": false
    },
    "features": ["formatting", "encoding", "contrast-check"]
  };

  const sampleRight = {
    "platformName": "GainUtility",
    "version": "4.2.1-production",
    "status": "online",
    "database": {
      "type": "relational-hybrid",
      "nodes": 8,
      "readOnly": false,
      "caching": true
    },
    "features": ["formatting", "encoding", "contrast-check", "json-diff"]
  };

  const loadSamples = () => {
    setLeftInput(JSON.stringify(sampleLeft, null, 2));
    setRightInput(JSON.stringify(sampleRight, null, 2));
    setHasCompared(false);
    setDiffResults([]);
    onAddToast("Example comparison loaded — replace with your files", "info");
  };

  const clearAll = () => {
    setLeftInput("");
    setRightInput("");
    setDiffResults([]);
    setHasCompared(false);
    setIsPerfectMatch(false);
    onAddToast("Compare editors cleared", "info");
  };

  const handleCompare = () => {
    if (!leftInput.trim() || !rightInput.trim()) {
      onAddToast("Please fill in both JSON inputs to compare", "warning");
      return;
    }

    try {
      let lObj = JSON.parse(leftInput);
      let rObj = JSON.parse(rightInput);

      const computedDiffs: DiffItem[] = [];
      const visitedPaths = new Set<string>();

      // Recursive comparison function
      const computeDiff = (left: any, right: any, path: string) => {
        visitedPaths.add(path);

        if (left === null && right === null) {
          computedDiffs.push({ keyPath: path, type: "identical", leftVal: "null", rightVal: "null" });
          return;
        }

        const typeLeft = typeof left;
        const typeRight = typeof right;

        if (typeLeft !== typeRight || (left === null && right !== null) || (left !== null && right === null)) {
          computedDiffs.push({
            keyPath: path,
            type: "modified",
            leftVal: JSON.stringify(left),
            rightVal: JSON.stringify(right)
          });
          return;
        }

        if (typeLeft !== "object") {
          // Primitives compare
          const match = ignoreWhitespace && typeLeft === "string"
            ? left.trim() === right.trim()
            : left === right;

          if (!match) {
            computedDiffs.push({
              keyPath: path,
              type: "modified",
              leftVal: JSON.stringify(left),
              rightVal: JSON.stringify(right)
            });
          } else {
            computedDiffs.push({
              keyPath: path,
              type: "identical",
              leftVal: JSON.stringify(left),
              rightVal: JSON.stringify(right)
            });
          }
          return;
        }

        // Both are objects/arrays
        const isLeftArr = Array.isArray(left);
        const isRightArr = Array.isArray(right);

        if (isLeftArr !== isRightArr) {
          computedDiffs.push({
            keyPath: path,
            type: "modified",
            leftVal: isLeftArr ? "Array" : "Object",
            rightVal: isRightArr ? "Array" : "Object"
          });
          return;
        }

        if (isLeftArr) {
          const maxLen = Math.max(left.length, right.length);
          for (let i = 0; i < maxLen; i++) {
            const childPath = `${path}[${i}]`;
            if (i >= left.length) {
              computedDiffs.push({
                keyPath: childPath,
                type: "added",
                leftVal: "(undefined)",
                rightVal: JSON.stringify(right[i])
              });
            } else if (i >= right.length) {
              computedDiffs.push({
                keyPath: childPath,
                type: "removed",
                leftVal: JSON.stringify(left[i]),
                rightVal: "(undefined)"
              });
            } else {
              computeDiff(left[i], right[i], childPath);
            }
          }
        } else {
          // Objects
          const leftKeys = Object.keys(left);
          const rightKeys = Object.keys(right);
          const allKeys = Array.from(new Set([...leftKeys, ...rightKeys]));

          allKeys.forEach((key) => {
            const childPath = path ? `${path}.${key}` : key;
            const hasLeft = leftKeys.includes(key);
            const hasRight = rightKeys.includes(key);

            if (hasLeft && !hasRight) {
              computedDiffs.push({
                keyPath: childPath,
                type: "removed",
                leftVal: JSON.stringify(left[key]),
                rightVal: "(undefined)"
              });
            } else if (!hasLeft && hasRight) {
              computedDiffs.push({
                keyPath: childPath,
                type: "added",
                leftVal: "(undefined)",
                rightVal: JSON.stringify(right[key])
              });
            } else {
              computeDiff(left[key], right[key], childPath);
            }
          });
        }
      };

      computeDiff(lObj, rObj, "");

      setDiffResults(computedDiffs);
      setHasCompared(true);

      const nonIdentical = computedDiffs.filter(d => d.type !== "identical");
      const match = nonIdentical.length === 0;
      setIsPerfectMatch(match);

      if (match) {
        onAddToast("JSON structures are identical!", "success");
      } else {
        onAddToast(`Found ${nonIdentical.length} differences`, "warning");
      }
    } catch (e: any) {
      onAddToast(`Failed to parse. Ensure both JSON fields are syntactically valid: ${e.message}`, "error");
    }
  };

  const handleDownloadDiff = () => {
    if (diffResults.length === 0) return;
    
    const summary = {
      timestamp: new Date().toISOString(),
      matchStatus: isPerfectMatch ? "IDENTICAL" : "DIFFERENT",
      differencesCount: diffResults.filter(d => d.type !== "identical").length,
      differences: diffResults.filter(d => d.type !== "identical")
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "json_compare_report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast("Diff report downloaded", "success");
  };

  const handleCopyDiff = () => {
    if (diffResults.length === 0) return;
    const readable = diffResults
      .filter(d => d.type !== "identical")
      .map(d => `[${d.type.toUpperCase()}] ${d.keyPath}\n  Original (Left): ${d.leftVal}\n  Target (Right): ${d.rightVal}`)
      .join("\n\n");
    onCopy(readable || "Structures are completely identical.");
  };

  return (
    <div className="flex flex-col gap-8" id="json-compare-tool">
      
      {/* HEADER CONTROL BAR */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-5 flex-wrap">
          <Button variant="outline" onClick={loadSamples} leftIcon={<Sparkles className="w-4 h-4" />} className="h-12 md:h-[50px] rounded-[16px] text-base font-bold">
            Load Example
          </Button>
          <Button variant="outline" onClick={clearAll} className="text-status-error border-status-error/30 hover:bg-status-error/5 h-12 md:h-[50px] rounded-[16px] text-base font-bold" leftIcon={<Trash2 className="w-4 h-4" />}>
            Clear
          </Button>
          <div className="h-6 w-px bg-border-light hidden md:block" />
          <Switch
            id="whitespace-ignore-toggle"
            checked={ignoreWhitespace}
            onChange={setIgnoreWhitespace}
            label="Ignore String Whitespace"
          />
        </div>

        <Button 
          variant="primary" 
          onClick={handleCompare}
          leftIcon={<ArrowLeftRight className="w-5 h-5" />}
          className="h-12 md:h-[50px] px-6 rounded-[16px] text-base font-bold"
        >
          Compare JSON Objects
        </Button>
      </div>

      {/* INPUT EDITORS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT CARD */}
        <Card
          id="json-compare-left"
          title="Original JSON (Left Source)"
          subtitle="Reference object / before changes."
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder='{\n  "version": "1.0.0"\n}'
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[400px] resize-y shadow-inner"
            />
            <FileUpload
              accept=".json"
              onFileLoaded={(content, name) => {
                setLeftInput(content);
                onAddToast(`Loaded Left source: ${name}`, "success");
              }}
              label="Upload left .json file"
              className="py-5"
            />
          </div>
        </Card>

        {/* RIGHT CARD */}
        <Card
          id="json-compare-right"
          title="Modified JSON (Right Source)"
          subtitle="Target object / after changes."
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder='{\n  "version": "1.0.1"\n}'
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[400px] resize-y shadow-inner"
            />
            <FileUpload
              accept=".json"
              onFileLoaded={(content, name) => {
                setRightInput(content);
                onAddToast(`Loaded Right source: ${name}`, "success");
              }}
              label="Upload right .json file"
              className="py-5"
            />
          </div>
        </Card>

      </div>

      {/* COMPARISON RESULTS SCREEN */}
      {hasCompared && (
        <Card
          id="json-compare-results"
          title="Structural Differences & Diff Findings"
          subtitle="Side-by-side key mutations mapped recursively."
          actions={
            diffResults.length > 0 ? (
              <div className="flex gap-3">
                <Button size="md" variant="outline" onClick={handleCopyDiff} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Copy Diff Findings
                </Button>
                <Button size="md" variant="secondary" onClick={handleDownloadDiff} leftIcon={<FileDown className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                  Export Report
                </Button>
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-6">
            
            {/* MATCHING STATUS BULLETINS */}
            {isPerfectMatch ? (
              <div className="flex items-start gap-3 p-5 rounded-[16px] bg-status-success/15 border border-status-success/30 text-status-success text-base font-semibold font-sans leading-relaxed">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>The JSON structures are 100% identical! All keys, values, and nesting match perfectly.</span>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-5 rounded-[16px] bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-base font-semibold font-sans leading-relaxed">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span>Divergent payloads detected! Review the differences list below for precise path mismatch.</span>
                  <p className="text-sm font-mono font-normal opacity-85 mt-2">
                    Removed elements: <span className="text-status-error font-bold">-{diffResults.filter(d => d.type === "removed").length}</span> | 
                    Added elements: <span className="text-status-success font-bold">+{diffResults.filter(d => d.type === "added").length}</span> | 
                    Modified elements: <span className="text-amber-600 dark:text-amber-300 font-bold">~{diffResults.filter(d => d.type === "modified").length}</span>
                  </p>
                </div>
              </div>
            )}

            {/* DUAL COLUMN PATH TRACING */}
            {!isPerfectMatch && (
              <div className="border border-border-light rounded-[16px] overflow-hidden bg-background shadow-premium-sm">
                
                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-4 bg-surface-muted p-5 border-b border-border-light text-xs md:text-sm font-bold uppercase tracking-wider text-text-muted font-mono">
                  <div className="col-span-4">JSON Key Path</div>
                  <div className="col-span-2">Mutation</div>
                  <div className="col-span-3">Left (Original)</div>
                  <div className="col-span-3">Right (Modified)</div>
                </div>

                {/* TABLE BODY */}
                <div className="divide-y divide-border-light max-h-[480px] overflow-y-auto">
                  {diffResults
                    .filter((item) => item.type !== "identical")
                    .map((item, index) => {
                      let typeBadge = "";
                      let typeClass = "";
                      let rowBg = "";

                      if (item.type === "removed") {
                        typeBadge = "REMOVED";
                        typeClass = "bg-status-error/10 text-status-error border border-status-error/20";
                        rowBg = "bg-status-error/[0.02]";
                      } else if (item.type === "added") {
                        typeBadge = "ADDED";
                        typeClass = "bg-status-success/10 text-status-success border border-status-success/20";
                        rowBg = "bg-status-success/[0.02]";
                      } else if (item.type === "modified") {
                        typeBadge = "MODIFIED";
                        typeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
                        rowBg = "bg-amber-500/[0.02]";
                      }

                      return (
                        <div key={index} className={`grid grid-cols-12 gap-4 p-5 font-mono text-xs md:text-sm items-center leading-relaxed hover:bg-surface-muted/35 transition-colors ${rowBg}`}>
                          <div className="col-span-4 font-bold break-all text-text-main">
                            $.{item.keyPath || "(root)"}
                          </div>
                          <div className="col-span-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${typeClass}`}>
                              {typeBadge}
                            </span>
                          </div>
                          <div className="col-span-3 break-all text-status-error font-mono font-medium max-h-[120px] overflow-y-auto">
                            {item.leftVal}
                          </div>
                          <div className="col-span-3 break-all text-status-success font-mono font-medium max-h-[120px] overflow-y-auto">
                            {item.rightVal}
                          </div>
                        </div>
                      );
                    })}
                </div>

              </div>
            )}

          </div>
        </Card>
      )}

    </div>
  );
};
