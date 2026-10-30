/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, FileUpload, EmptyState, Switch } from "./Common";
import { 
  Braces, 
  Copy, 
  Download, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  FolderOpen, 
  FolderClosed,
  Link,
  Check,
  Minimize2,
  Maximize2
} from "lucide-react";

interface JsonViewerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const sampleJSON = {
    "user": {
      "id": 1024,
      "name": "Jane Miller",
      "email": "jane.miller@design.co",
      "role": "Lead UX Architect",
      "active": true,
      "skills": ["Figma", "Design Systems", "React", "Tailwind CSS"],
      "meta": {
        "timezone": "America/New_York",
        "lastLogin": "2026-07-08T14:32:00Z",
        "preferences": {
          "theme": "dark",
          "notifications": {
            "email": true,
            "slack": false
          }
        }
      }
    },
    "organization": {
      "name": "GainUtility Co.",
      "tier": "enterprise",
      "seats": 150
    }
  };

  const loadSample = () => {
    const stringified = JSON.stringify(sampleJSON, null, 2);
    setInputVal(stringified);
    try {
      const parsed = JSON.parse(stringified);
      setParsedData(parsed);
      setIsValid(true);
      setErrorMsg("");
      // Auto-expand root by default
      const initialExpanded: Record<string, boolean> = {};
      buildInitialExpanded(parsed, "", initialExpanded);
      setExpandedKeys(initialExpanded);
      onAddToast("Sample data loaded", "success");
    } catch (e: any) {
      setIsValid(false);
      setErrorMsg(e.message || "Parse Error");
    }
  };

  const clearAll = () => {
    setInputVal("");
    setParsedData(null);
    setSearchQuery("");
    setExpandedKeys({});
    setIsValid(null);
    setErrorMsg("");
    onAddToast("Viewer cleared", "info");
  };

  // Helper to build default expanded paths for root/level-1
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
            // Only expand first level to keep visual hierarchy clean
            if (path === "") {
              expanded[childPath] = true;
            }
          }
        });
      }
    }
  };

  const handleParse = () => {
    if (!inputVal.trim()) {
      setParsedData(null);
      setIsValid(null);
      setErrorMsg("");
      return;
    }

    try {
      const parsed = JSON.parse(inputVal);
      setParsedData(parsed);
      setIsValid(true);
      setErrorMsg("");
      
      const initialExpanded: Record<string, boolean> = {};
      buildInitialExpanded(parsed, "", initialExpanded);
      setExpandedKeys(initialExpanded);
      
      onAddToast("JSON Parsed successfully", "success");
    } catch (e: any) {
      setIsValid(false);
      setParsedData(null);
      setErrorMsg(e.message || "Failed to parse JSON string. Verify formatting.");
      onAddToast("Parsing failed", "error");
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to parse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleParse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputVal]);

  const handleUpload = (content: string, name: string) => {
    setInputVal(content);
    try {
      const parsed = JSON.parse(content);
      setParsedData(parsed);
      setIsValid(true);
      setErrorMsg("");
      const initialExpanded: Record<string, boolean> = {};
      buildInitialExpanded(parsed, "", initialExpanded);
      setExpandedKeys(initialExpanded);
      onAddToast(`Loaded and parsed file: ${name}`, "success");
    } catch (e: any) {
      setIsValid(false);
      setParsedData(null);
      setErrorMsg(e.message || "File JSON is invalid.");
      onAddToast("File contains invalid JSON", "error");
    }
  };

  const handleDownload = () => {
    if (!parsedData) {
      onAddToast("No parsed data to download", "warning");
      return;
    }
    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viewed_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddToast("JSON file downloaded", "success");
  };

  const handleExpandAll = () => {
    if (!parsedData) return;
    const expanded: Record<string, boolean> = {};
    const traverse = (val: any, path: string) => {
      if (val && typeof val === "object") {
        expanded[path || "root"] = true;
        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            traverse(item, `${path}[${index}]`);
          });
        } else {
          Object.keys(val).forEach((key) => {
            traverse(val[key], path ? `${path}.${key}` : key);
          });
        }
      }
    };
    traverse(parsedData, "");
    setExpandedKeys(expanded);
    onAddToast("Expanded all nodes", "info");
  };

  const handleCollapseAll = () => {
    setExpandedKeys({ "root": true });
    onAddToast("Collapsed all nodes", "info");
  };

  const handleCopyPath = (path: string) => {
    const fullPath = path || "root";
    onCopy(fullPath);
    setCopiedPath(fullPath);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (val: any, path: string, keyName: string | number | null, depth: number): React.ReactNode => {
    const isObject = val !== null && typeof val === "object";
    const nodeKey = path || "root";
    const isExpanded = expandedKeys[nodeKey] !== false; // default to expanded if not set false, but we can configure this.
    
    // Highlight if search query matches the key or path
    const isMatched = searchQuery
      ? (typeof keyName === "string" && keyName.toLowerCase().includes(searchQuery.toLowerCase())) || 
        path.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const toggleNode = () => {
      setExpandedKeys(prev => ({
        ...prev,
        [nodeKey]: !isExpanded
      }));
    };

    const indentStyle = { paddingLeft: `${depth * 16}px` };

    if (!isObject) {
      // Primitive types styling
      let valueColor = "text-[#606C38] dark:text-[#A3B18A]"; // strings
      let formattedVal = JSON.stringify(val);

      if (typeof val === "number") {
        valueColor = "text-amber-600 dark:text-amber-400 font-bold";
      } else if (typeof val === "boolean") {
        valueColor = val ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold";
      } else if (val === null) {
        valueColor = "text-gray-400 dark:text-gray-500 italic";
        formattedVal = "null";
      }

      return (
        <div 
          className={`group flex items-center justify-between py-1 px-2 hover:bg-surface-muted/50 rounded transition-colors ${isMatched ? "bg-amber-100/50 dark:bg-amber-950/20 border-l-2 border-amber-500" : ""}`}
          style={indentStyle}
          key={path}
        >
          <div className="flex items-center gap-1.5 font-mono text-base sm:text-sm sm:leading-relaxed overflow-hidden text-ellipsis">
            <span className="w-4" /> {/* align spacer for primitive vs object toggle */}
            {keyName !== null && (
              <span className="text-text-main font-bold">
                {typeof keyName === "string" ? `"${keyName}"` : keyName}:
              </span>
            )}
            <span className={`break-all ${valueColor}`}>{formattedVal}</span>
          </div>

          <button
            onClick={() => handleCopyPath(path)}
            className="opacity-0 group-hover:opacity-100 text-xs font-mono font-medium flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-light bg-surface-base hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-all cursor-pointer"
            title="Copy JSON Path"
          >
            {copiedPath === path ? <Check className="w-3 h-3 text-status-success" /> : <Link className="w-3 h-3" />}
            <span className="text-[10px]">{copiedPath === path ? "Copied" : "Copy Path"}</span>
          </button>
        </div>
      );
    }

    // Object/Array nodes rendering
    const isArr = Array.isArray(val);
    const keys = isArr ? Array.from({ length: val.length }, (_, i) => i) : Object.keys(val);
    const size = keys.length;
    const bracketOpen = isArr ? "[" : "{";
    const bracketClose = isArr ? "]" : "}";

    // Hide if search is active and neither this node nor any children match the query
    let shouldRender = true;
    if (searchQuery) {
      // Simple heuristic check: see if any path matching exists inside children
      const checkMatch = (obj: any, innerPath: string): boolean => {
        if (innerPath.toLowerCase().includes(searchQuery.toLowerCase())) return true;
        if (obj && typeof obj === "object") {
          if (Array.isArray(obj)) {
            return obj.some((v, idx) => checkMatch(v, `${innerPath}[${idx}]`));
          } else {
            return Object.keys(obj).some(k => checkMatch(obj[k], innerPath ? `${innerPath}.${k}` : k));
          }
        }
        return false;
      };
      shouldRender = checkMatch(val, path);
    }

    if (!shouldRender) return null;

    return (
      <div className="flex flex-col" key={path}>
        <div 
          className={`group flex items-center justify-between py-1 px-2 hover:bg-surface-muted/50 rounded transition-colors ${isMatched ? "bg-amber-100/50 dark:bg-amber-950/20 border-l-2 border-amber-500" : ""}`}
          style={indentStyle}
        >
          <div className="flex items-center gap-1.5 font-mono text-base sm:text-sm sm:leading-relaxed cursor-pointer select-none" onClick={toggleNode}>
            <span className="text-text-muted hover:text-brand-primary transition-colors">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
            {keyName !== null && (
              <span className="text-text-main font-bold">
                {typeof keyName === "string" ? `"${keyName}"` : keyName}:
              </span>
            )}
            <span className="text-text-muted font-bold">
              {bracketOpen}
              <span className="text-xs font-semibold bg-surface-muted border border-border-light px-1 py-0.5 rounded text-text-sub font-mono mx-1">
                {size} {size === 1 ? "item" : "items"}
              </span>
              {!isExpanded && `... ${bracketClose}`}
            </span>
          </div>

          <button
            onClick={() => handleCopyPath(path)}
            className="opacity-0 group-hover:opacity-100 text-xs font-mono font-medium flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-light bg-surface-base hover:bg-surface-hover text-text-muted hover:text-brand-primary transition-all cursor-pointer"
            title="Copy JSON Path"
          >
            {copiedPath === path ? <Check className="w-3 h-3 text-status-success" /> : <Link className="w-3 h-3" />}
            <span className="text-[10px]">{copiedPath === path ? "Copied" : "Copy Path"}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="flex flex-col">
            {keys.map((key) => {
              const childVal = val[key];
              const childPath = isArr 
                ? `${path}[${key}]` 
                : path 
                  ? `${path}.${key}` 
                  : key;
              return renderTreeNode(childVal, childPath, key, depth + 1);
            })}
            <div className="py-0.5 px-2 font-mono text-sm text-text-muted select-none" style={{ paddingLeft: `${(depth * 16) + 16}px` }}>
              {bracketClose}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8" id="json-viewer-tool">
      
      {/* TOOLBAR CONTROLS */}
      <div className="bg-surface-base border border-border-light rounded-[20px] p-4 sm:p-6 flex flex-wrap gap-5 items-center justify-between shadow-premium-sm">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExpandAll} leftIcon={<Maximize2 className="w-4 h-4" />} className="h-11 md:h-[46px] rounded-[14px] text-sm font-bold">
            Expand All
          </Button>
          <Button variant="secondary" onClick={handleCollapseAll} leftIcon={<Minimize2 className="w-4 h-4" />} className="h-11 md:h-[46px] rounded-[14px] text-sm font-bold">
            Collapse All
          </Button>
          <Button variant="outline" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 md:h-[46px] rounded-[14px] text-sm font-bold">
            Download JSON
          </Button>
        </div>
      </div>

      {/* DUAL COLUMN INTERACTIVE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* INPUT SOURCE COLUMN */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <Card
            id="json-viewer-input"
            title="JSON Source Input"
            subtitle="Paste raw JSON content or drop file here."
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                  Load Sample
                </Button>
                <Button variant="outline" onClick={clearAll} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                  Clear
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-5 flex-grow">
              <textarea
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setIsValid(null);
                }}
                placeholder='{\n  "data": "Enter JSON string here"\n}'
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[440px] resize-y shadow-inner"
              />

              <FileUpload
                accept=".json"
                onFileLoaded={handleUpload}
                label="Upload .json file"
                className="py-5"
              />

              <Button 
                variant="primary" 
                onClick={handleParse}
                className="w-full h-12 md:h-[50px] rounded-[16px] text-base font-bold"
                leftIcon={<Braces className="w-5 h-5" />}
              >
                Parse to Interactive Tree
              </Button>
            </div>
          </Card>
        </div>

        {/* INTERACTIVE TREE VIEW COLUMN */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <Card
            id="json-viewer-tree"
            title="Interactive Explorer Tree"
            subtitle="Search keys, expand objects, and copy specific item JSON paths."
          >
            <div className="flex flex-col gap-5 flex-grow">
              
              {/* Parse/Validation status and error bars */}
              {isValid === false && errorMsg && (
                <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed">
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <Braces className="w-5 h-5" />
                    <span>Failed to parse JSON content</span>
                  </div>
                  <p className="font-mono text-xs opacity-90">{errorMsg}</p>
                </div>
              )}

              {/* Dynamic Key Search Filter */}
              {parsedData && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search keys or JSON paths... (e.g. email, user.skills)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 text-base rounded-[16px] bg-background border border-border-light text-text-main placeholder-text-muted/60 placeholder:text-[15px] focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none h-[50px] transition-all"
                  />
                  <Search className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-sm font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Interactive Tree Arena */}
              <div className="border border-border-light bg-surface-muted/20 rounded-[16px] p-6 overflow-auto max-h-[580px] min-h-[440px] flex-grow shadow-inner">
                {parsedData ? (
                  <div className="flex flex-col gap-1 font-mono">
                    {renderTreeNode(parsedData, "", null, 0)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[360px]">
                    <EmptyState
                      title="Awaiting Parsed JSON"
                      description="Enter valid JSON strings in the raw input box and click Parse to render the tree view."
                      icon={<Braces className="w-12 h-12 text-text-muted opacity-80" />}
                    />
                  </div>
                )}
              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
