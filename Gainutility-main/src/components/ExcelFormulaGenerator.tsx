import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  Sliders, 
  Terminal, 
  RefreshCw, 
  Zap, 
  Table, 
  ChevronRight, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers,
  History,
  RotateCcw
} from "lucide-react";
import { Toast } from "./Common";

interface ExcelFormulaGeneratorProps {
  onCopy?: (text: string) => void;
  onAddToast?: (msg: string, type: Toast["type"]) => void;
  onChangeView?: (view: any) => void;
}

interface FormulaResult {
  formula: string;
  syntaxType: "excel" | "sheets";
  title: string;
  explanation: string;
  components: { functionName: string; purpose: string; args: string }[];
  assumedRanges: { label: string; range: string }[];
  tips: string[];
}

interface FormulaTemplate {
  category: "Lookups" | "Aggregations" | "Text & Strings" | "Dates & Times" | "Logical & Conditions" | "Advanced";
  title: string;
  prompt: string;
  excelFormula: string;
  sheetsFormula: string;
  explanation: string;
}

const TEMPLATES: FormulaTemplate[] = [
  {
    category: "Lookups",
    title: "Modern Flexible Lookup (XLOOKUP)",
    prompt: "Find price in column C where SKU in column A matches cell E2, or return 'Not Found'",
    excelFormula: '=XLOOKUP(E2, A2:A100, C2:C100, "Not Found")',
    sheetsFormula: '=XLOOKUP(E2, A2:A100, C2:C100, "Not Found")',
    explanation: "Searches column A for the SKU in E2 and returns the corresponding value from column C. If no match exists, safely returns 'Not Found' instead of an error."
  },
  {
    category: "Lookups",
    title: "Classic Universal Lookup (INDEX/MATCH)",
    prompt: "Look up employee department in column B based on Employee ID in column A",
    excelFormula: '=INDEX(B2:B100, MATCH(E2, A2:A100, 0))',
    sheetsFormula: '=INDEX(B2:B100, MATCH(E2, A2:A100, 0))',
    explanation: "Locates the row position of E2 inside column A with exact matching (0) and retrieves the value from column B at that exact index position."
  },
  {
    category: "Aggregations",
    title: "Multi-Criteria Summation (SUMIFS)",
    prompt: "Sum revenue in col C where status in col B is 'Paid' and date in col A is >= Jan 1 2026",
    excelFormula: '=SUMIFS(C2:C100, B2:B100, "Paid", A2:A100, ">=2026-01-01")',
    sheetsFormula: '=SUMIFS(C2:C100, B2:B100, "Paid", A2:A100, ">=2026-01-01")',
    explanation: "Adds values in column C only when column B equals 'Paid' AND the date in column A is on or after January 1, 2026."
  },
  {
    category: "Aggregations",
    title: "Unique Item Count (UNIQUE + COUNTA)",
    prompt: "Count the number of distinct unique customer emails in column D",
    excelFormula: '=COUNTA(UNIQUE(D2:D100))',
    sheetsFormula: '=COUNTA(UNIQUE(D2:D100))',
    explanation: "Extracts all deduplicated values from column D using UNIQUE, and counts the resulting array length with COUNTA."
  },
  {
    category: "Logical & Conditions",
    title: "Multi-Tier Grading / Status (IFS)",
    prompt: "If score in A2 is >= 90 'Tier 1', if >= 75 'Tier 2', if >= 50 'Tier 3', else 'Needs Review'",
    excelFormula: '=IFS(A2>=90, "Tier 1", A2>=75, "Tier 2", A2>=50, "Tier 3", TRUE, "Needs Review")',
    sheetsFormula: '=IFS(A2>=90, "Tier 1", A2>=75, "Tier 2", A2>=50, "Tier 3", TRUE, "Needs Review")',
    explanation: "Evaluates condition steps sequentially from top to bottom, outputting the first tier that evaluates to true."
  },
  {
    category: "Text & Strings",
    title: "Extract Domain from Email Address",
    prompt: "Extract everything after the '@' sign in email cell A2",
    excelFormula: '=TEXTAFTER(A2, "@")',
    sheetsFormula: '=SPLIT(A2, "@", TRUE, TRUE)',
    explanation: "Parses string A2 and extracts the domain name suffix following the '@' delimiter."
  },
  {
    category: "Dates & Times",
    title: "Calculate Work Days Difference",
    prompt: "Calculate business days between start date in A2 and completion date in B2 excluding holidays in H2:H10",
    excelFormula: '=NETWORKDAYS(A2, B2, H2:H10)',
    sheetsFormula: '=NETWORKDAYS(A2, B2, H2:H10)',
    explanation: "Calculates total working weekdays (Monday through Friday) between two dates, automatically subtracting listed holiday dates."
  },
  {
    category: "Advanced",
    title: "Google Sheets SQL Query (QUERY)",
    prompt: "Filter and sort active accounts where MRR > 500 ordered by revenue descending",
    excelFormula: '=SORT(FILTER(A2:D100, (B2:B100="Active")*(C2:C100>500)), 3, -1)',
    sheetsFormula: '=QUERY(A2:D100, "SELECT A, B, C, D WHERE B = \'Active\' AND C > 500 ORDER BY C DESC", 1)',
    explanation: "Runs dynamic filtering and sorting over the source table. Google Sheets uses native SQL-like syntax; Excel uses modern dynamic array FILTER + SORT."
  }
];

export const ExcelFormulaGenerator: React.FC<ExcelFormulaGeneratorProps> = ({ onCopy, onAddToast }) => {
  const [platform, setPlatform] = useState<"excel" | "sheets">("excel");
  const [prompt, setPrompt] = useState<string>("Sum total revenue in column D where status in column B is 'Complete' and region in column C is 'North'");
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Editable Column ranges mapping for live customization
  const [customRanges, setCustomRanges] = useState<{ [key: string]: string }>({
    "Sum Range": "D2:D100",
    "Condition Range 1": "B2:B100",
    "Condition Value 1": '"Complete"',
    "Condition Range 2": "C2:C100",
    "Condition Value 2": '"North"'
  });

  // Compile Formula from Prompt with semantic parser
  const generatedFormula = useMemo<FormulaResult>(() => {
    const q = prompt.toLowerCase();

    // 1. SUMIFS pattern
    if (q.includes("sum") && (q.includes("where") || q.includes("if") || q.includes("when") || q.includes("condition"))) {
      const isSheets = platform === "sheets";
      const sumRange = customRanges["Sum Range"] || "D2:D100";
      const cond1 = customRanges["Condition Range 1"] || "B2:B100";
      const val1 = customRanges["Condition Value 1"] || '"Complete"';
      const cond2 = customRanges["Condition Range 2"] || "C2:C100";
      const val2 = customRanges["Condition Value 2"] || '"North"';

      return {
        formula: `=SUMIFS(${sumRange}, ${cond1}, ${val1}, ${cond2}, ${val2})`,
        syntaxType: platform,
        title: "Multi-Criteria Conditional Sum (SUMIFS)",
        explanation: "Calculates the mathematical sum of the target numbers only for rows where all specified criteria evaluate to true.",
        components: [
          { functionName: "SUMIFS", purpose: "Main summation engine", args: "Sum_Range, Criteria_Range1, Criteria1, ..." },
          { functionName: sumRange, purpose: "Values to sum", args: "Column containing numbers" },
          { functionName: `${cond1} = ${val1}`, purpose: "First filter filter condition", args: "Status match" },
          { functionName: `${cond2} = ${val2}`, purpose: "Second filter condition", args: "Region match" }
        ],
        assumedRanges: [
          { label: "Sum Range", range: sumRange },
          { label: "Condition Range 1", range: cond1 },
          { label: "Condition Value 1", range: val1 },
          { label: "Condition Range 2", range: cond2 },
          { label: "Condition Value 2", range: val2 }
        ],
        tips: [
          "Wrap text match values in double quotes.",
          "To sum numbers greater than 100, use \">100\" as your criteria parameter.",
          "Ensure all criteria ranges have identical row start and end indexes."
        ]
      };
    }

    // 2. XLOOKUP / VLOOKUP pattern
    if (q.includes("lookup") || q.includes("find") || q.includes("search") || q.includes("vlookup") || q.includes("match")) {
      const lookupVal = "E2";
      const lookupCol = "A2:A100";
      const returnCol = "C2:C100";

      return {
        formula: `=XLOOKUP(${lookupVal}, ${lookupCol}, ${returnCol}, "Not Found")`,
        syntaxType: platform,
        title: "Exact Dynamic Search (XLOOKUP)",
        explanation: "Looks up a key value in the search column and returns the corresponding value from the return column. Includes built-in error handling.",
        components: [
          { functionName: "XLOOKUP", purpose: "Modern exact search function", args: "Lookup_Value, Lookup_Array, Return_Array, [If_Not_Found]" },
          { functionName: lookupVal, purpose: "Target search key", args: "Cell or value being matched" },
          { functionName: lookupCol, purpose: "Index column", args: "Search key range" },
          { functionName: returnCol, purpose: "Output column", args: "Values to retrieve" }
        ],
        assumedRanges: [
          { label: "Search Key Cell", range: lookupVal },
          { label: "Lookup Column", range: lookupCol },
          { label: "Return Column", range: returnCol }
        ],
        tips: [
          "XLOOKUP defaults to exact match without needing a 'FALSE' or '0' flag.",
          "Works in both left-to-right and right-to-left directions, unlike legacy VLOOKUP."
        ]
      };
    }

    // 3. COUNTIFS / Unique count pattern
    if (q.includes("count") && (q.includes("unique") || q.includes("distinct"))) {
      const range = "A2:A100";
      return {
        formula: `=COUNTA(UNIQUE(${range}))`,
        syntaxType: platform,
        title: "Distinct Unique Count (COUNTA + UNIQUE)",
        explanation: "Generates a unique deduplicated list of values and counts the non-empty records.",
        components: [
          { functionName: "COUNTA", purpose: "Counts non-empty array elements", args: "Array" },
          { functionName: "UNIQUE", purpose: "Filters duplicate entries", args: "Range" }
        ],
        assumedRanges: [
          { label: "Target Column", range: range }
        ],
        tips: [
          "In Google Sheets and Excel 365, UNIQUE returns a dynamic spill array.",
          "To ignore blank cells, wrap with FILTER(A2:A100, A2:A100<>\"\")."
        ]
      };
    }

    // 4. IF / IFS Conditional pattern
    if (q.includes("if") || q.includes("condition") || q.includes("tier") || q.includes("grade")) {
      return {
        formula: `=IFS(A2>=1000, "Enterprise", A2>=250, "Pro", A2>0, "Starter", TRUE, "Inactive")`,
        syntaxType: platform,
        title: "Multi-Tier Logic Branch (IFS)",
        explanation: "Tests conditions in sequence and returns the result corresponding to the first true condition.",
        components: [
          { functionName: "IFS", purpose: "Multi-condition evaluation", args: "Condition1, Value1, [Condition2, Value2, ...]" },
          { functionName: "TRUE", purpose: "Default fallback catch-all", args: "Returned if no previous conditions pass" }
        ],
        assumedRanges: [
          { label: "Input Cell", range: "A2" }
        ],
        tips: [
          "Order your conditions from most specific / highest threshold to lowest.",
          "Use TRUE at the end as a safe default fallback value."
        ]
      };
    }

    // 5. Default Universal Dynamic Array Filter
    return {
      formula: platform === "sheets" 
        ? `=FILTER(A2:D100, (B2:B100="Active") * (C2:C100>100))` 
        : `=FILTER(A2:D100, (B2:B100="Active") * (C2:C100>100), "No matches")`,
      syntaxType: platform,
      title: "Dynamic Multi-Criteria Filter (FILTER)",
      explanation: "Extracts and displays all rows matching compound logical conditions automatically.",
      components: [
        { functionName: "FILTER", purpose: "Dynamic range filter", args: "Array, Include_Conditions, [If_Empty]" },
        { functionName: "*", purpose: "Boolean AND operator", args: "Multiplies condition masks" }
      ],
      assumedRanges: [
        { label: "Data Table Range", range: "A2:D100" },
        { label: "Status Column", range: "B2:B100" },
        { label: "Amount Column", range: "C2:C100" }
      ],
      tips: [
        "Use `*` for AND logic and `+` for OR logic when compounding criteria.",
        "The output will dynamically expand into neighboring empty cells."
      ]
    };
  }, [prompt, platform, customRanges]);

  const handleCopyFormula = () => {
    if (onCopy) {
      onCopy(generatedFormula.formula);
    } else {
      navigator.clipboard.writeText(generatedFormula.formula);
    }
    setCopied(true);
    onAddToast?.("Formula copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadTemplate = (tpl: FormulaTemplate) => {
    setPrompt(tpl.prompt);
    onAddToast?.(`Loaded template: ${tpl.title}`, "info");
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "All") return TEMPLATES;
    return TEMPLATES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col gap-6">
      {/* Platform Toggle */}
      <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-border-light shrink-0">
          <button
            onClick={() => setPlatform("excel")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platform === "excel" ? "bg-surface-base text-text-main shadow-sm border border-border-light" : "text-text-muted hover:text-text-main"
            }`}
          >
            Microsoft Excel
          </button>
          <button
            onClick={() => setPlatform("sheets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platform === "sheets" ? "bg-surface-base text-text-main shadow-sm border border-border-light" : "text-text-muted hover:text-text-main"
            }`}
          >
            Google Sheets
          </button>
      </div>

      {/* 2. Main Prompt Box */}
      <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-brand-primary" />
            Describe what you need in plain English
          </label>
          <span className="text-[11px] text-text-muted">Type naturally: columns, conditions, lookups, sums, dates</span>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Find price in column C where SKU in column A matches E2, or sum column D where status is 'Paid'..."
            className="w-full text-sm md:text-base font-medium p-4 bg-surface-muted border border-border-light rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
          />
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-text-muted">Quick ideas:</span>
          <button
            onClick={() => setPrompt("Sum column D where column B is 'Complete' and column C is 'North'")}
            className="px-2.5 py-1 rounded-md text-xs bg-surface-muted hover:bg-surface-base border border-border-light text-text-sub transition-colors cursor-pointer"
          >
            Conditional Sum (SUMIFS)
          </button>
          <button
            onClick={() => setPrompt("XLOOKUP employee department in column B using employee ID from column A")}
            className="px-2.5 py-1 rounded-md text-xs bg-surface-muted hover:bg-surface-base border border-border-light text-text-sub transition-colors cursor-pointer"
          >
            XLOOKUP Search
          </button>
          <button
            onClick={() => setPrompt("Count unique customer email addresses in column A")}
            className="px-2.5 py-1 rounded-md text-xs bg-surface-muted hover:bg-surface-base border border-border-light text-text-sub transition-colors cursor-pointer"
          >
            Count Unique
          </button>
          <button
            onClick={() => setPrompt("If value in A2 > 100 return 'High' otherwise return 'Normal'")}
            className="px-2.5 py-1 rounded-md text-xs bg-surface-muted hover:bg-surface-base border border-border-light text-text-sub transition-colors cursor-pointer"
          >
            IF Condition
          </button>
        </div>
      </div>

      {/* 3. Generated Formula Hero Output */}
      <div className="bg-surface-base p-6 rounded-2xl border border-brand-primary/30 shadow-premium-sm flex flex-col gap-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm text-text-main">{generatedFormula.title}</span>
          </div>
          <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary-light/60 px-2 py-0.5 rounded border border-brand-primary/20">
            {platform.toUpperCase()} SYNTAX
          </span>
        </div>

        {/* Formula Code Box */}
        <div className="bg-surface-muted p-4 rounded-xl border border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <code className="text-base sm:text-lg font-mono font-bold text-brand-primary break-all select-all">
            {generatedFormula.formula}
          </code>

          <button
            onClick={handleCopyFormula}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-primary text-surface-base hover:bg-brand-primary/90 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Formula"}</span>
          </button>
        </div>

        {/* Plain English Logic Explanation */}
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-light/60 text-xs sm:text-sm text-text-main flex flex-col gap-2">
          <div className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
            How this formula works
          </div>
          <p className="leading-relaxed text-text-sub">
            {generatedFormula.explanation}
          </p>
        </div>

        {/* Step-by-Step Function Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {generatedFormula.components.map((comp, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border-light bg-surface-base flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand-primary">{comp.functionName}</span>
                <span className="text-[10px] text-text-muted font-mono">{comp.args}</span>
              </div>
              <p className="text-text-sub">{comp.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Categorized Formula Template Library */}
      <div className="bg-surface-base p-6 rounded-2xl border border-border-light shadow-premium-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-text-main">Popular Formula Templates</h3>
            <p className="text-xs text-text-muted mt-0.5">Click any template to load it into the generator and customize its column ranges.</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Lookups", "Aggregations", "Logical & Conditions", "Text & Strings", "Dates & Times", "Advanced"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-brand-primary text-surface-base font-bold" 
                    : "bg-surface-muted text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl, i) => (
            <div
              key={i}
              onClick={() => handleLoadTemplate(tpl)}
              className="p-4 rounded-xl border border-border-light hover:border-brand-primary/40 bg-surface-muted/30 hover:bg-surface-muted/60 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">{tpl.category}</span>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-transform group-hover:translate-x-0.5" />
                </div>
                <h4 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">{tpl.title}</h4>
                <p className="text-xs text-text-muted line-clamp-2">{tpl.explanation}</p>
              </div>

              <div className="pt-2 border-t border-border-light/60">
                <code className="text-xs font-mono font-bold text-text-sub group-hover:text-brand-primary truncate block">
                  {platform === "excel" ? tpl.excelFormula : tpl.sheetsFormula}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
