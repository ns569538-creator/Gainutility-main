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
  ChevronRight, 
  ChevronDown, 
  Search, 
  FolderOpen, 
  FolderClosed,
  Link,
  Minimize2,
  Maximize2,
  FileJson,
  KeyRound
} from "lucide-react";

interface JsonTreeViewerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [stats, setStats] = useState({ nodesCount: 0, keysCount: 0 });

  const sampleJSON = {
    "organization": "JSON Studio Networks",
    "active": true,
    "nodes": [
      {
        "id": "hub-01",
        "location": "Virginia, US",
        "loadPercent": 42.5,
        "backupActive": false
      },
      {
        "id": "hub-02",
        "location": "Frankfurt, DE",
        "loadPercent": 68.1,
        "backupActive": true
      }
    ],
    "administrators": {
      "lead": "Max Planck",
      "escalationEmail": "ops@jsonstudio.dev"
    },
    "integrityHash": "0x7F8C2A9B0E1D"
  };

  const loadSample = () => {
    const text = JSON.stringify(sampleJSON, null, 2);
    setInputVal(text);
    handleParse(text);
  };

  const handleClear = () => {
    setInputVal("");
    setParsedData(null);
    setSearchQuery("");
    setExpandedKeys({});
    setIsValid(null);
    setErrorMsg("");
    setStats({ nodesCount: 0, keysCount: 0 });
    onAddToast("Tree Viewer reset completed", "info");
  };

  const computeTreeStats = (obj: any) => {
    let nodesCount = 0;
    let keysCount = 0;

    const count = (val: any) => {
      nodesCount++;
      if (val && typeof val === "object") {
        if (!Array.isArray(val)) {
          Object.keys(val).forEach((k) => {
            keysCount++;
            count(val[k]);
          });
        } else {
          val.forEach((item) => count(item));
        }
      }
    };

    try {
      count(obj);
      setStats({ nodesCount, keysCount });
    } catch {
      // Ignored
    }
  };

  const buildInitialExpanded = (val: any, path: string, expanded: Record<string, boolean>) => {
    if (val && typeof val === "object") {
      expanded[path || "root"] = true;
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          if (item && typeof item === "object") {
            buildInitialExpanded(item, `${path}[${index}]`, expanded);
          }
        });
      } else {
        Object.keys(val).forEach((key) => {
          const childVal = val[key];
          const childPath = path ? `${path}.${key}` : key;
          if (childVal && typeof childVal === "object") {
            buildInitialExpanded(childVal, childPath, expanded);
          }
        });
      }
    }
  };

  const handleParse = (text: string) => {
    if (!text.trim()) {
      setParsedData(null);
      setIsValid(null);
      setErrorMsg("");
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setParsedData(parsed);
      setIsValid(true);
      setErrorMsg("");
      computeTreeStats(parsed);

      const initialExpanded: Record<string, boolean> = {};
      buildInitialExpanded(parsed, "", initialExpanded);
      setExpandedKeys(initialExpanded);
      onAddToast("JSON Parsed & visual tree rendered", "success");
    } catch (err: any) {
      setIsValid(false);
      setParsedData(null);
      setErrorMsg(err.message || "Invalid JSON syntax formatting.");
      onAddToast("Parsing failed", "error");
    }
  };

  const toggleNode = (path: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleExpandAll = () => {
    if (!parsedData) return;
    const allExpanded: Record<string, boolean> = {};
    const traverse = (val: any, path: string) => {
      if (val && typeof val === "object") {
        allExpanded[path || "root"] = true;
        if (Array.isArray(val)) {
          val.forEach((item, index) => traverse(item, `${path}[${index}]`));
        } else {
          Object.keys(val).forEach((k) => traverse(val[k], path ? `${path}.${k}` : k));
        }
      }
    };
    traverse(parsedData, "");
    setExpandedKeys(allExpanded);
    onAddToast("Expanded all nodes", "info");
  };

  const handleCollapseAll = () => {
    setExpandedKeys({});
    onAddToast("Collapsed all tree nodes", "info");
  };

  const handleCopyNodeValue = (nodeVal: any) => {
    const textToCopy = typeof nodeVal === "object" ? JSON.stringify(nodeVal, null, 2) : String(nodeVal);
    onCopy(textToCopy);
  };

  // Check if string matches query (case insensitive)
  const matchesSearch = (text: string): boolean => {
    if (!searchQuery) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (value: any, keyName: string | number, path: string, isLast: boolean): React.JSX.Element => {
    const isObject = value !== null && typeof value === "object";
    const currentPath = path || "root";
    const isExpanded = !!expandedKeys[currentPath];
    const isKeySearchMatch = typeof keyName === "string" && matchesSearch(keyName);
    const isValSearchMatch = !isObject && matchesSearch(String(value));

    // Highlight class on matches
    const searchHighlightClass = (isKeySearchMatch || isValSearchMatch) 
      ? "bg-amber-100 dark:bg-amber-950/40 text-brand-primary p-0.5 rounded" 
      : "";

    if (isObject) {
      const isArr = Array.isArray(value);
      const keys = Object.keys(value);
      const itemsCount = keys.length;
      const bracketOpen = isArr ? "[" : "{";
      const bracketClose = isArr ? "]" : "}";

      return (
        <div key={currentPath} className="flex flex-col pl-4 text-sm font-mono border-l border-border-light/40 ml-2 py-0.5">
          <div className="flex items-center gap-1.5 group/node py-0.5">
            
            {/* Expand / Collapse triggers */}
            <button
              onClick={() => toggleNode(currentPath)}
              className="p-0.5 hover:bg-surface-muted/30 rounded text-text-muted transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {/* Icon */}
            <span className="text-brand-primary">
              {isExpanded ? <FolderOpen className="w-3.5 h-3.5" /> : <FolderClosed className="w-3.5 h-3.5" />}
            </span>

            {/* Key Name */}
            {keyName !== "" && (
              <span className={`font-semibold text-zinc-900 dark:text-zinc-200 ${searchHighlightClass}`}>
                {keyName}:
              </span>
            )}

            {/* Value Preview (Brackets) */}
            <span className="text-text-muted text-xs">
              {bracketOpen}
              <span className="text-[10px] font-bold uppercase mx-1 bg-surface-muted/30 px-1.5 py-0.5 rounded text-text-muted font-sans">
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </span>
              {!isExpanded && `... ${bracketClose}`}
            </span>

            {/* Copy node on hover */}
            <button
              onClick={() => handleCopyNodeValue(value)}
              className="opacity-0 group-hover/node:opacity-100 p-1 hover:bg-surface-muted/30 rounded text-text-muted transition-opacity cursor-pointer text-xs ml-2"
              title="Copy Object Node"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {/* Children nodes */}
          {isExpanded && (
            <div className="flex flex-col">
              {isArr ? (
                value.map((item, index) => 
                  renderTreeNode(item, index, `${currentPath}[${index}]`, index === value.length - 1)
                )
              ) : (
                keys.map((k, index) => {
                  const childPath = path ? `${path}.${k}` : k;
                  return renderTreeNode(value[k], k, childPath, index === keys.length - 1);
                })
              )}
              
              {/* Bracket Close on expanded */}
              <div className="pl-6 text-text-muted text-xs select-none">
                {bracketClose}{!isLast && ","}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Primitives renderer
    let valClass = "text-[#F5B041]"; // standard string color
    if (typeof value === "number") valClass = "text-blue-500";
    if (typeof value === "boolean") valClass = "text-purple-500";
    if (value === null) valClass = "text-zinc-400 font-italic";

    return (
      <div key={currentPath} className="flex items-center gap-1.5 pl-10 text-sm font-mono group/leaf py-0.5 border-l border-border-light/40 ml-2">
        {/* Bullet marker */}
        <span className="w-1.5 h-1.5 rounded-full bg-border-light flex-shrink-0" />

        {/* Key Name */}
        {keyName !== "" && (
          <span className={`font-semibold text-zinc-900 dark:text-zinc-200 ${isKeySearchMatch ? searchHighlightClass : ""}`}>
            {keyName}:
          </span>
        )}

        {/* Value */}
        <span className={`${valClass} ${isValSearchMatch ? searchHighlightClass : ""}`}>
          {typeof value === "string" ? `"${value}"` : String(value)}
          {!isLast && <span className="text-text-muted">,</span>}
        </span>

        {/* Copy trigger */}
        <button
          onClick={() => handleCopyNodeValue(value)}
          className="opacity-0 group-hover/leaf:opacity-100 p-1 hover:bg-surface-muted/30 rounded text-text-muted transition-opacity cursor-pointer text-[10px] ml-2"
          title="Copy node value"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    handleParse(val);
  };

  const handleFileUpload = (fileText: string) => {
    setInputVal(fileText);
    handleParse(fileText);
    onAddToast("JSON File loaded successfully", "success");
  };

  const handleDownload = () => {
    if (!inputVal) {
      onAddToast("Nothing to download", "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([inputVal], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `tree_visualizer_data.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("JSON downloaded successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="json-tree-viewer-tool">

      {/* SEARCH CONTROL BAR */}
      {parsedData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-surface-base border border-border-light rounded-[20px] p-6 shadow-premium-sm">
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, parameters or values instantly..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-border-light rounded-xl font-sans text-sm focus:outline-none focus:ring-1 focus:ring-border-focus focus:border-border-focus"
            />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button variant="outline" onClick={handleExpandAll} leftIcon={<Maximize2 className="w-4 h-4" />} className="w-full h-11 text-xs font-bold rounded-xl">
              Expand All
            </Button>
            <Button variant="outline" onClick={handleCollapseAll} leftIcon={<Minimize2 className="w-4 h-4" />} className="w-full h-11 text-xs font-bold rounded-xl">
              Collapse All
            </Button>
          </div>
          <div className="md:col-span-3 font-mono text-xs text-text-muted uppercase font-bold flex justify-between bg-surface-muted/10 p-3 rounded-xl border border-border-light">
            <span>Keys: <b className="text-text-main">{stats.keysCount}</b></span>
            <span>Nodes: <b className="text-text-main">{stats.nodesCount}</b></span>
          </div>
        </div>
      )}

      {/* DUAL COLS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT SOURCE CARD */}
        <Card
          title="Raw JSON Input"
          subtitle="Input payload to build expandable schema tree."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Sample
              </Button>
              <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                Reset
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste JSON syntax tree to visualize..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
            />
            
            <FileUpload onFileLoaded={handleFileUpload} accept=".json,application/json" label="or upload raw .json schema file" />
          </div>
        </Card>

        {/* VISUAL TREE PREVIEW CARD */}
        <Card 
          title="Interactive JSON Tree" 
          subtitle="Expand nodes, traverse structures, or copy nested keys."
          actions={
            <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold">
              Download Tree JSON
            </Button>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            {errorMsg ? (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed flex flex-col gap-2 shadow-inner flex-grow min-h-[380px]">
                <h4 className="font-bold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 flex-shrink-0" />
                  <span>Validation Failure</span>
                </h4>
                <p className="font-mono text-xs opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            ) : parsedData ? (
              <div className="w-full flex-grow p-6 bg-surface-base border border-border-light rounded-[16px] overflow-auto min-h-[380px] max-h-[500px] shadow-inner">
                {renderTreeNode(parsedData, "", "", true)}
              </div>
            ) : (
              <div className="w-full flex-grow p-6 bg-surface-base text-text-muted font-mono text-sm border border-border-light rounded-[16px] flex items-center justify-center min-h-[380px]">
                <span>Awaiting structural compilation to build visual tree...</span>
              </div>
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};
