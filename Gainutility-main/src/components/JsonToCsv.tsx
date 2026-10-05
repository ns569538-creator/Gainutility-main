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
  Table,
  ArrowRight,
  ListFilter,
  FileCode,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface JsonToCsvProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const JsonToCsv: React.FC<JsonToCsvProps> = ({ onCopy, onAddToast }) => {
  const [inputVal, setInputVal] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [nestedDelimiter, setNestedDelimiter] = useState(".");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  const sampleJSON = [
    {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "company": {
        "name": "Romaguera-Crona",
        "catchPhrase": "Multi-layered client-server neural-net"
      }
    },
    {
      "id": 2,
      "name": "Ervin Howell",
      "username": "Antonette",
      "email": "Shanna@melissa.tv",
      "company": {
        "name": "Deckow-Crist",
        "catchPhrase": "Proactive didactic contingency"
      }
    },
    {
      "id": 3,
      "name": "Clementine Bauch",
      "username": "Samantha",
      "email": "Nathan@yesenia.net",
      "company": {
        "name": "Romaguera-Jacobson",
        "catchPhrase": "Face to face bifurcated interface"
      }
    }
  ];

  const loadSample = () => {
    const formatted = JSON.stringify(sampleJSON, null, 2);
    setInputVal(formatted);
    handleConvert(formatted, includeHeaders, nestedDelimiter);
  };

  const handleClear = () => {
    setInputVal("");
    setCsvOutput("");
    setErrorMsg(null);
    setHeaders([]);
    setPreviewRows([]);
    onAddToast("CSV converter reset completed", "info");
  };

  // Recursively flatten nested keys
  const flattenObject = (obj: any, delimiter: string, parentKey = "", res: Record<string, any> = {}): Record<string, any> => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const propName = parentKey ? `${parentKey}${delimiter}${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          flattenObject(obj[key], delimiter, propName, res);
        } else if (Array.isArray(obj[key])) {
          res[propName] = JSON.stringify(obj[key]);
        } else {
          res[propName] = obj[key];
        }
      }
    }
    return res;
  };

  const handleConvert = (rawText: string, headersEnabled: boolean, delimiter: string) => {
    if (!rawText.trim()) {
      setCsvOutput("");
      setErrorMsg(null);
      setHeaders([]);
      setPreviewRows([]);
      return;
    }

    try {
      let parsed = JSON.parse(rawText);
      setErrorMsg(null);

      // Standardize input as array of objects
      if (!Array.isArray(parsed)) {
        if (typeof parsed === "object" && parsed !== null) {
          parsed = [parsed];
        } else {
          throw new Error("JSON structure must be an object or an array of objects to construct tabular columns.");
        }
      }

      // Flatten each item in array
      const flattenedRows = parsed.map((item: any) => flattenObject(item, delimiter));

      // Collect all unique keys as headers
      const uniqueHeaders: string[] = Array.from(
        new Set(flattenedRows.flatMap((row: any) => Object.keys(row)))
      );

      setHeaders(uniqueHeaders);
      setPreviewRows(flattenedRows.slice(0, 5)); // Capture up to 5 items for visual layout matrix preview

      // Construct CSV lines
      const csvLines: string[] = [];
      
      if (headersEnabled) {
        // Map headers, escaping any quotation marks
        const headerLine = uniqueHeaders
          .map((h) => `"${h.replace(/"/g, '""')}"`)
          .join(",");
        csvLines.push(headerLine);
      }

      flattenedRows.forEach((row: any) => {
        const rowLine = uniqueHeaders
          .map((h) => {
            const val = row[h] === undefined || row[h] === null ? "" : String(row[h]);
            // Escape values containing commas, quotes, or newlines
            if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",");
        csvLines.push(rowLine);
      });

      setCsvOutput(csvLines.join("\n"));
      onAddToast("Converted JSON to CSV successfully", "success");
    } catch (err: any) {
      setCsvOutput("");
      setHeaders([]);
      setPreviewRows([]);
      setErrorMsg(err.message || "Invalid JSON syntax.");
    }
  };

  useEffect(() => {
    handleConvert(inputVal, includeHeaders, nestedDelimiter);
  }, [includeHeaders, nestedDelimiter]);

  const handleInputChange = (val: string) => {
    setInputVal(val);
    handleConvert(val, includeHeaders, nestedDelimiter);
  };

  const handleFileUpload = (fileText: string) => {
    setInputVal(fileText);
    handleConvert(fileText, includeHeaders, nestedDelimiter);
    onAddToast("JSON File loaded and converted", "success");
  };

  const handleCopyText = () => {
    if (!csvOutput) {
      onAddToast("Nothing to copy", "warning");
      return;
    }
    onCopy(csvOutput);
  };

  const handleDownload = () => {
    if (!csvOutput) {
      onAddToast("Nothing to download", "warning");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([csvOutput], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = `converted_data.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(element.href), 1000);
    onAddToast("CSV file downloaded successfully!", "success");
  };

  return (
    <div className="flex flex-col gap-8" id="json-to-csv-tool">

      {/* DUAL COLS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT PANEL */}
        <Card
          title="Raw JSON Input"
          subtitle="Paste your JSON objects or nested arrays."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadSample} leftIcon={<Sparkles className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold">
                Load Sample
              </Button>
              <Button variant="outline" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4" />} size="sm" className="h-10 px-3.5 rounded-[12px] text-sm font-bold text-status-error border-status-error/30 hover:bg-status-error/5">
                Reset Converter
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            <textarea
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste nested object list here (e.g. [{'id': 1, 'info': {'name': 'bob'}}] )..."
              className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[380px] resize-y shadow-inner"
            />
            
            <FileUpload onFileLoaded={handleFileUpload} accept=".json,application/json" label="or upload raw JSON file" />
          </div>
        </Card>

        {/* OUTPUT PANEL */}
        <Card 
          title="Converted CSV Output" 
          subtitle="Tabular comma separated formatting values."
          actions={
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={handleCopyText} leftIcon={<Copy className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold whitespace-nowrap">
                Copy CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />} className="h-11 px-4 rounded-[12px] text-sm font-bold whitespace-nowrap">
                Export CSV
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-5 flex-grow">
            
            {/* CONVERSION OPTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border-light rounded-xl bg-surface-muted/10">
              
              <label className="flex items-center gap-2.5 text-xs font-bold text-text-main font-sans select-none cursor-pointer uppercase font-mono">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary border-border-light focus:ring-brand-primary"
                />
                Include Header Row
              </label>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase text-text-muted">Delimiter</span>
                <input
                  type="text"
                  maxLength={1}
                  value={nestedDelimiter}
                  onChange={(e) => setNestedDelimiter(e.target.value || ".")}
                  className="w-10 text-center py-1 bg-background border border-border-light rounded font-bold text-text-main"
                  title="Nested properties separator delimiter"
                />
              </div>

            </div>

            {/* CSV DISPLAY */}
            {errorMsg ? (
              <div className="p-5 rounded-[16px] bg-status-error/10 border border-status-error/20 text-status-error text-sm leading-relaxed flex flex-col gap-2 shadow-inner flex-grow min-h-[300px]">
                <h4 className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Conversion Fault</span>
                </h4>
                <p className="font-mono text-xs opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            ) : (
              <textarea
                value={csvOutput}
                readOnly
                placeholder="Awaiting valid JSON data for CSV mapping..."
                className="w-full flex-grow p-6 bg-surface-base text-text-main font-mono text-base sm:text-sm sm:leading-relaxed border border-border-light focus:border-border-focus rounded-[16px] focus:ring-1 focus:ring-border-focus outline-none min-h-[300px] resize-y shadow-inner"
              />
            )}

          </div>
        </Card>

      </div>

      {/* COLUMN TABLE PREVIEW */}
      {previewRows.length > 0 && !errorMsg && (
        <Card title="Structural Grid Column Preview" subtitle="Visual preview of computed tabular headers and rows (up to 5 items shown).">
          <div className="overflow-x-auto w-full border border-border-light rounded-[16px]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted/30 border-b border-border-light text-text-muted font-bold uppercase tracking-wider">
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-4 border-r border-border-light/60 last:border-r-0 min-w-[150px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60">
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-surface-muted/10 text-text-main">
                    {headers.map((h, colIdx) => (
                      <td key={colIdx} className="p-4 border-r border-border-light/60 last:border-r-0 max-w-[250px] truncate" title={String(row[h] || "")}>
                        {row[h] === undefined || row[h] === null ? <span className="text-zinc-400 font-italic">null</span> : String(row[h])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
};
