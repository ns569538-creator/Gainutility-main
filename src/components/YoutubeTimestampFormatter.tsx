import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  RotateCcw, 
  Play, 
  AlertCircle, 
  FileText, 
  Sliders, 
  ArrowDownAZ, 
  Layers,
  Sparkles,
  CheckCircle,
  Youtube,
  Info,
  ArrowRight,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeTimestampFormatterProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

interface ParsedTimestamp {
  raw: string;
  seconds: number;
  timeStr: string;
  label: string;
  error?: string;
}

const EXAMPLE_UNFORMATTED = `1:22 Setup
00:00 Intro
4:51 Tutorial
1:22 Intro duplicated timestamp
10:5 Video End
`;

export const YoutubeTimestampFormatter: React.FC<YoutubeTimestampFormatterProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [inputText, setInputText] = useState<string>(EXAMPLE_UNFORMATTED);
  const [formattedText, setFormattedText] = useState<string>("");
  const [parsedItems, setParsedItems] = useState<ParsedTimestamp[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [autoZeroPad, setAutoZeroPad] = useState<boolean>(true);

  const parseTimestamps = (text: string): ParsedTimestamp[] => {
    const lines = text.split("\n");
    const results: ParsedTimestamp[] = [];

    const timeRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/g;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      timeRegex.lastIndex = 0;
      const match = timeRegex.exec(trimmed);

      if (match) {
        const fullMatch = match[0];
        const hrs = match[1] ? parseInt(match[1]) : 0;
        const mins = parseInt(match[2]);
        const secs = parseInt(match[3]);

        const totalSeconds = hrs * 3600 + mins * 60 + secs;

        let label = trimmed.replace(fullMatch, "").replace(/^[-:| ]+/, "").trim();
        if (!label) label = "Untitled Chapter";

        results.push({
          raw: trimmed,
          seconds: totalSeconds,
          timeStr: fullMatch,
          label
        });
      } else {
        results.push({
          raw: trimmed,
          seconds: -1,
          timeStr: "",
          label: trimmed,
          error: "No timestamp detected in this line"
        });
      }
    });

    return results;
  };

  const handleFormat = () => {
    const parsed = parseTimestamps(inputText);
    
    const validItems = parsed.filter(item => item.seconds !== -1);
    const errors: string[] = [];

    if (validItems.length === 0) {
      errors.push("No valid timestamps found. Please write lists like '01:30 Introduction'.");
      setValidationErrors(errors);
      setParsedItems(parsed);
      setFormattedText("");
      onAddToast("Formatting failed. Check validation feedback.", "error");
      return;
    }

    validItems.sort((a, b) => a.seconds - b.seconds);

    const secondsSeen = new Set<number>();
    const duplicateSeconds = new Set<number>();
    validItems.forEach(item => {
      if (secondsSeen.has(item.seconds)) {
        duplicateSeconds.add(item.seconds);
      }
      secondsSeen.add(item.seconds);
    });

    if (duplicateSeconds.size > 0) {
      errors.push("Duplicate timestamps detected (seconds match)! YouTube only maps the first instance.");
    }

    const firstItem = validItems[0];
    if (firstItem && firstItem.seconds !== 0) {
      errors.push("YouTube requirement: The first timestamp must start at 00:00 or 0:00.");
    }

    if (validItems.length < 3) {
      errors.push("YouTube requirement: List at least 3 timestamps to enable active player chapters.");
    }

    const padTime = (secs: number): string => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;

      const hPad = h > 0 ? `${h}:` : "";
      const mPad = autoZeroPad ? String(m).padStart(2, "0") : String(m);
      const sPad = String(s).padStart(2, "0");

      return `${hPad}${mPad}:${sPad}`;
    };

    const cleanOutputList = validItems.map(item => {
      const cleanTime = padTime(item.seconds);
      return `${cleanTime} ${item.label}`;
    });

    const finalOutput = cleanOutputList.join("\n");
    setFormattedText(finalOutput);
    setValidationErrors(errors);
    setParsedItems(parsed);

    onAddToast(
      errors.length > 0 
        ? "Timestamps formatted, but has validation flags."
        : "Timestamps structured and sorted perfectly!",
      errors.length > 0 ? "warning" : "success"
    );
  };

  const handleCopyFormatted = () => {
    if (!formattedText) {
      onAddToast("Please format the list first.", "warning");
      return;
    }
    onCopy(formattedText);
  };

  const loadExample = () => {
    setInputText(EXAMPLE_UNFORMATTED);
    setFormattedText("");
    setParsedItems([]);
    setValidationErrors([]);
    onAddToast("Loaded sloppy raw timestamp example. Click 'Format & Sort' to fix!", "info");
  };

  const handleReset = () => {
    setInputText("");
    setFormattedText("");
    setParsedItems([]);
    setValidationErrors([]);
    onAddToast("Cleared timeline editor.", "info");
  };

  const handleExportTxt = () => {
    if (!formattedText) {
      onAddToast("No formatted text to export.", "warning");
      return;
    }
    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "youtube_chapters_metadata.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    onAddToast("Exported plain text chapter list!", "success");
  };

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Input */}
      <div className="lg:col-span-6 space-y-5">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="input-heading">
          <div className="flex justify-between items-center">
            <h3 id="input-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              Raw Draft Timestamps
            </h3>
            <button
              onClick={loadExample}
              className="text-xs text-brand-primary font-sans font-bold hover:underline"
            >
              Load Example
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary leading-relaxed resize-none focus:ring-1 focus:ring-brand-primary"
            placeholder="Paste raw timestamps, e.g.:&#10;1:22 Setup&#10;00:00 Intro&#10;4:51 Final Review"
            aria-describedby="format-hint"
          />
          <p id="format-hint" className="text-xs text-text-muted">Each line: timestamp + label. Mixed formats accepted (1:22, 01:22, 1:22:30).</p>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted/60 border border-border-light/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold text-text-main">Auto Padding</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoZeroPad}
                onChange={(e) => setAutoZeroPad(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
              <span className="ml-2 text-xs font-mono text-text-sub">01:02 instead of 1:02</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleFormat}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowDownAZ className="w-4 h-4" />
              Format & Sort Chronologically
            </button>
            <button
              onClick={handleReset}
              className="bg-surface-muted hover:bg-border-light text-text-sub hover:text-text-main p-3 rounded-lg text-xs font-sans font-bold border border-border-light/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Editor"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Right Output & Validation */}
      <div className="lg:col-span-6 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="output-heading">
          <h3 id="output-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            Clean YouTube Chapters Copy-Paste
          </h3>

          <div className="relative">
            <textarea
              value={formattedText}
              readOnly
              rows={8}
              className="w-full font-mono text-base sm:text-xs md:text-sm p-4 rounded-xl border border-border-light bg-surface-muted/40 text-text-main focus:outline-none leading-relaxed resize-none"
              placeholder="Click format on the left to output sanitized chapters..."
            />
            {formattedText && (
              <div className="absolute top-2.5 right-2.5 flex gap-2">
                <button
                  onClick={handleExportTxt}
                  className="p-1.5 rounded-lg bg-surface-base border border-border-light text-text-sub hover:text-brand-primary shadow-sm transition-colors"
                  title="Export as TXT file"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyFormatted}
                  className="p-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm transition-colors flex items-center gap-1 text-xs px-2.5 font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="validation-heading">
          <h3 id="validation-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-brand-primary" />
            YouTube Verification Logs
          </h3>

          {validationErrors.length > 0 ? (
            <div className="space-y-2.5">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          ) : formattedText ? (
            <div className="p-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <div>
                <p className="font-bold">Perfect Chapters Meta!</p>
                <p className="text-[11px] opacity-90 mt-0.5">Complies fully with starting at 00:00, sorting timeline, and zero duplicates guidelines.</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-disabled font-mono italic">No validation triggered yet. Please format some timestamps above.</p>
          )}
        </section>
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Paste your raw timestamp list into the left textarea — one per line, any format (1:22, 01:22, 1:22:30).</li>
      <li>Optionally enable Auto Padding to zero-pad minutes (01:02 vs 1:02).</li>
      <li>Click "Format & Sort Chronologically" — the tool parses, sorts, pads, and validates.</li>
      <li>Review the verification logs on the right for any YouTube compliance issues.</li>
      <li>Copy the clean output or download as a .txt file for your video description.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Chronologically sorted timestamps (ascending order)</li>
      <li>Consistent zero-padded format (MM:SS or HH:MM:SS)</li>
      <li>Duplicate timestamp detection and warning</li>
      <li>YouTube compliance validation (00:00 start, minimum 3 chapters)</li>
      <li>One-click copy to clipboard</li>
      <li>Download as .txt file</li>
      <li>Example loader for quick testing</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Only the first timestamp on each line is parsed; additional timestamps on the same line are ignored.</li>
      <li>Lines without detectable timestamps are dropped from the output.</li>
      <li>Validation checks YouTube's public requirements but cannot guarantee chapters will activate — final behavior depends on YouTube's processing.</li>
      <li>No connection to your YouTube account — this tool only processes the text you provide.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-timestamp-formatter"
      toolName="YouTube Timestamp Formatter"
      toolDescription="Convert raw, out-of-order timeline notes into chronologically sorted, zero-padded timestamps that trigger native YouTube player chapters automatically."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No timestamps are sent to any server."
      trustNote="Validation checks public YouTube requirements; final chapter activation depends on YouTube's processing."
    >
      {toolContent}
    </ToolPageLayout>
  );
};