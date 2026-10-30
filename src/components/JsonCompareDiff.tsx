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
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";

interface JsonCompareDiffProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

interface DiffItem {
  keyPath: string;
  type: "added" | "removed" | "modified" | "identical";
  leftVal: string;
  rightVal: string;
}

export const JsonCompareDiff: React.FC<JsonCompareDiffProps> = ({ onCopy, onAddToast }) => {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [ignoreOrder, setIgnoreOrder] = useState(false);
  const [diffResults, setDiffResults] = useState<DiffItem[]>([]);
  const [hasCompared, setHasCompared] = useState(false);
  const [isPerfectMatch, setIsPerfectMatch] = useState(false);

  const [counts, setCounts] = useState({
    added: 0,
    removed: 0,
    modified: 0,
    identical: 0
  });

  const sampleLeft = {
    "toolName": "JSON Studio Compare Tool",
    "version": "1.0.0",
    "active": true,
    "runtimes": ["Node.js", "Vite", "ESBuild"],
    "specifications": {
      "offlineSupport": true,
      "maxCharacters": 500000
    },
    "integrity": "0xABC123"
  };

  const sampleRight = {
    "toolName": "JSON Studio Compare Tool",
    "version": "1.1.0-alpha",
    "active": true,
    "runtimes": ["Node.js", "Vite", "ESBuild", "WebAssembly"],
    "specifications": {
      "offlineSupport": true,
      "maxCharacters": 1000000,
      "cloudSync": false
    },
    "notes": "Premium Edition"
  };

  const loadSamples = () => {
    setLeftInput(JSON.stringify(sampleLeft, null, 2));
    setRightInput(JSON.stringify(sampleRight, null, 2));
    setHasCompared(false);
    setDiffResults([]);
    onAddToast("Example comparison loaded — replace with your files", "info");
  };

  const handleClear = () => {
    setLeftInput("");
    setRightInput("");
    setDiffResults([]);
    setHasCompared(false);
    setIsPerfectMatch(false);
    setCounts({ added: 0, removed: 0, modified: 0, identical: 0 });
    onAddToast("Cleared left and right workspaces", "info");
  };

  const handleCompare = () => {
    if (!leftInput.trim() || !rightInput.trim()) {
      onAddToast("Please fill in both JSON inputs to compare", "warning");
      return;
    }

    try {
      const lObj = JSON.parse(leftInput);
      const rObj = JSON.parse(rightInput);

      const computedDiffs: DiffItem[] = [];
      const visitedPaths = new Set<string>();

      const compareValues = (left: any, right: any, path: string) => {
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
          const match = ignoreWhitespace && typeLeft === "string"
            ? left.trim() === right.trim()
            : left === right;

          if (match) {
            computedDiffs.push({
              keyPath: path,
              type: "identical",
              leftVal: String(left),
              rightVal: String(right)
            });
          } else {
            computedDiffs.push({
              keyPath: path,
              type: "modified",
              leftVal: String(left),
              rightVal: String(right)
            });
          }
          return;
        }

        // Handle Arrays
        if (Array.isArray(left) && Array.isArray(right)) {
          let lArr = [...left];
          let rArr = [...right];

          if (ignoreOrder) {
            lArr.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
            rArr.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
          }

          const maxLen = Math.max(lArr.length, rArr.length);
          for (let i = 0; i < maxLen; i++) {
            const currentPath = `${path}[${i}]`;
            if (i >= lArr.length) {
              computedDiffs.push({
                keyPath: currentPath,
                type: "added",
                leftVal: "",
                rightVal: JSON.stringify(rArr[i], null, 2)
              });
            } else if (i >= rArr.length) {
              computedDiffs.push({
                keyPath: currentPath,
                type: "removed",
                leftVal: JSON.stringify(lArr[i], null, 2),
                rightVal: ""
              });
            } else {
              compareValues(lArr[i], rArr[i], currentPath);
            }
          }
          return;
        }

        // Handle standard Objects
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        const allKeys = Array.from(new Set([...leftKeys, ...rightKeys]));

        allKeys.forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;
          const hasLeft = leftKeys.includes(key);
          const hasRight = rightKeys.includes(key);

          if (hasLeft && !hasRight) {
            computedDiffs.push({
              keyPath: currentPath,
              type: "removed",
              leftVal: typeof left[key] === "object" ? JSON.stringify(left[key], null, 2) : String(left[key]),
              rightVal: ""
            });
          } else if (!hasLeft && hasRight) {
            computedDiffs.push({
              keyPath: currentPath,
              type: "added",
              leftVal: "",
              rightVal: typeof right[key] === "object" ? JSON.stringify(right[key], null, 2) : String(right[key])
            });
          } else {
            compareValues(left[key], right[key], currentPath);
          }
        });
      };

      compareValues(lObj, rObj, "");

      // Analyze Results counts
      let added = 0;
      let removed = 0;
      let modified = 0;
      let identical = 0;

      computedDiffs.forEach((item) => {
        if (item.type === "added") added++;
        else if (item.type === "removed") removed++;
        else if (item.type === "modified") modified++;
        else if (item.type === "identical") identical++;
      });

      setCounts({ added, removed, modified, identical });
      setIsPerfectMatch(added === 0 && removed === 0 && modified === 0);
      setDiffResults(computedDiffs);
      setHasCompared(true);
      onAddToast("Comparison computed successfully!", "success");
    } catch (err: any) {
      onAddToast(`JSON Syntax Mismatch: ${err.message}`, "error");
    }
  };

  const handleDownloadReport = () => {
    if (diffResults.length === 0) return;
    const report = {
      timestamp: new Date().toISOString(),
      perfectMatch: isPerfectMatch,
      statistics: counts,
      differences: diffResults.filter((d) => d.type !== "identical")
    };
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `json_compare_report.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("Comparison report downloaded!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="json-compare-diff-tool">

      {/* DUAL COLS EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT WORKSPACE */}
        <Card title="JSON Source File A (Original)">
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste original JSON object structure..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[250px] resize-y shadow-inner"
            />
            <FileUpload onFileLoaded={(text) => { setLeftInput(text); onAddToast("Uploaded File A", "success"); }} accept=".json,application/json" label="or upload original .json" />
          </div>
        </Card>

        {/* RIGHT WORKSPACE */}
        <Card title="JSON Source File B (Modified)">
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste modified JSON object structure..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[250px] resize-y shadow-inner"
            />
            <FileUpload onFileLoaded={(text) => { setRightInput(text); onAddToast("Uploaded File B", "success"); }} accept=".json,application/json" label="or upload modified .json" />
          </div>
        </Card>

      </div>

      {/* Quiet sample / reset */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={loadSamples} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
          Load Example
        </Button>
        <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
          Reset Compare Tool
        </Button>
      </div>

      {/* RECONCILIATION CONTROL CENTER */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-text-main font-sans select-none cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary border-border-light focus:ring-brand-primary"
            />
            Ignore Outer Whitespace
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-text-main font-sans select-none cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreOrder}
              onChange={(e) => setIgnoreOrder(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary border-border-light focus:ring-brand-primary"
            />
            Ignore Key Sorting/Array Order
          </label>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleCompare} leftIcon={<ArrowLeftRight className="w-4 h-4" />} className="h-12 md:h-[50px] px-6 rounded-[16px] text-base font-bold">
            Compare Differences
          </Button>
        </div>
      </div>

      {/* DIAGNOSTICS & HIGHLIGHTS */}
      {hasCompared && (
        <div className="flex flex-col gap-8">
          
          {/* COMPARE SUMMARY METRICS CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm">
              <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Added Parameters</span>
              <div className="text-2xl font-bold text-status-success font-mono mt-2">+{counts.added} keys</div>
            </div>
            <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm">
              <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Removed Parameters</span>
              <div className="text-2xl font-bold text-status-error font-mono mt-2">-{counts.removed} keys</div>
            </div>
            <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm">
              <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Modified Values</span>
              <div className="text-2xl font-bold text-amber-500 font-mono mt-2">~{counts.modified} values</div>
            </div>
            <div className="bg-surface-base border border-border-light rounded-2xl p-5 shadow-premium-sm">
              <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Identical Elements</span>
              <div className="text-2xl font-bold text-text-muted font-mono mt-2">{counts.identical} items</div>
            </div>
          </div>

          {/* SIDE-BY-SIDE DIFFERENCES REPORT */}
          <Card 
            title="Difference Log View" 
            subtitle="Granular mapping of non-identical nodes found in original/modified parameters."
            actions={
              <Button size="sm" variant="secondary" onClick={handleDownloadReport} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
                Export Diff Report
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              
              {isPerfectMatch ? (
                <div className="p-8 rounded-[20px] bg-status-success/10 border border-status-success/20 text-center flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-status-success" />
                  <div>
                    <h4 className="font-bold text-status-success text-base">Perfect Structural Match</h4>
                    <p className="text-xs text-status-success/90 mt-1 leading-relaxed">Both JSON inputs match perfectly in types, sorting and parameter values.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border-light/60">
                  {diffResults
                    .filter((d) => d.type !== "identical")
                    .map((diff, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4 flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                          <span className="font-mono text-xs font-bold text-text-main select-all break-all bg-surface-muted/35 px-2 py-1 rounded border border-border-light">
                            {diff.keyPath || "root"}
                          </span>
                        </div>
                        <div className="md:col-span-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            diff.type === "added" ? "bg-status-success/15 text-status-success border border-status-success/20" :
                            diff.type === "removed" ? "bg-status-error/15 text-status-error border border-status-error/20" :
                            "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300/30"
                          }`}>
                            {diff.type}
                          </span>
                        </div>
                        <div className="md:col-span-6 grid grid-cols-2 gap-3">
                          <div className="bg-surface-base p-2.5 rounded-xl border border-border-light/60 font-mono text-xs text-text-muted text-left min-h-[40px] truncate" title={diff.leftVal}>
                            <b className="text-[10px] uppercase font-bold text-text-muted mr-1.5 font-sans">A:</b> {diff.leftVal || "—"}
                          </div>
                          <div className="bg-surface-base p-2.5 rounded-xl border border-border-light/60 font-mono text-xs text-text-muted text-left min-h-[40px] truncate" title={diff.rightVal}>
                            <b className="text-[10px] uppercase font-bold text-text-muted mr-1.5 font-sans">B:</b> {diff.rightVal || "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
