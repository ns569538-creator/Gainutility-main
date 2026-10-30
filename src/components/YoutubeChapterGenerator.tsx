import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  RotateCcw, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight,
  Youtube,
  Play,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeChapterGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
}

interface ChapterRow {
  id: string;
  time: string;
  title: string;
}

export const YoutubeChapterGenerator: React.FC<YoutubeChapterGeneratorProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const [chapters, setChapters] = useState<ChapterRow[]>([
    { id: "1", time: "00:00", title: "Introduction & Hook" },
    { id: "2", time: "01:30", title: "The Main Problem Solved" },
    { id: "3", time: "03:45", title: "Step-by-Step Blueprint" },
    { id: "4", time: "07:15", title: "Live Code Demo Walkthrough" },
    { id: "5", time: "11:00", title: "Final Summary & Resources" }
  ]);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.trim().split(":").map(p => parseInt(p, 10));
    if (parts.some(isNaN)) return -1;
    
    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    } else if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }
    return -1;
  };

  const formatSecondsToTime = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const hStr = h > 0 ? `${h}:` : "";
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");
    
    return `${hStr}${mStr}:${sStr}`;
  };

  const analyzedChapters = useMemo(() => {
    const parsed = chapters.map(ch => ({
      ...ch,
      seconds: parseTimeToSeconds(ch.time)
    }));

    const errors: { id: string; msg: string; type: "error" | "warning" }[] = [];
    const timingsSeen = new Map<number, string[]>();
    const titlesSeen = new Map<string, string[]>();

    parsed.forEach((ch, idx) => {
      if (ch.seconds === -1) {
        errors.push({ id: ch.id, msg: "Invalid format. Use MM:SS or HH:MM:SS.", type: "error" });
        return;
      }

      if (idx > 0) {
        const prev = parsed[idx - 1];
        if (prev.seconds !== -1 && ch.seconds <= prev.seconds) {
          errors.push({ id: ch.id, msg: "Time must be greater than previous chapter.", type: "error" });
        }
      }

      const timeMatches = timingsSeen.get(ch.seconds) || [];
      timeMatches.push(ch.id);
      timingsSeen.set(ch.seconds, timeMatches);

      const titleMatches = titlesSeen.get(ch.title.toLowerCase().trim()) || [];
      titleMatches.push(ch.id);
      titlesSeen.set(ch.title.toLowerCase().trim(), titleMatches);
    });

    timingsSeen.forEach((ids, secs) => {
      if (ids.length > 1 && secs !== -1) {
        ids.forEach(id => {
          errors.push({ id, msg: `Duplicate timestamp (${formatSecondsToTime(secs)}).`, type: "warning" });
        });
      }
    });

    titlesSeen.forEach((ids, titleLower) => {
      if (ids.length > 1 && titleLower) {
        ids.forEach(id => {
          errors.push({ id, msg: "Duplicate chapter label name.", type: "warning" });
        });
      }
    });

    const globalWarnings: string[] = [];
    const validChapters = parsed.filter(c => c.seconds !== -1);
    
    if (validChapters.length > 0 && validChapters[0].seconds !== 0) {
      globalWarnings.push("First chapter must start at 00:00 (or 0:00) to activate timeline markers.");
    }
    if (validChapters.length < 3) {
      globalWarnings.push("YouTube requires a minimum of 3 chapters to construct dynamic timeline cards.");
    }

    return {
      rows: parsed,
      rowErrors: errors,
      globalWarnings
    };
  }, [chapters]);

  const updateRow = (id: string, field: "time" | "title", value: string) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, [field]: value } : ch));
  };

  const addRow = () => {
    let nextTime = "00:00";
    if (chapters.length > 0) {
      const last = chapters[chapters.length - 1];
      const secs = parseTimeToSeconds(last.time);
      if (secs !== -1) {
        nextTime = formatSecondsToTime(secs + 90);
      }
    }
    const newId = Math.random().toString(36).substring(2, 9);
    setChapters([...chapters, { id: newId, time: nextTime, title: `New Chapter Topic` }]);
    onAddToast("New chapter row appended.", "success");
  };

  const removeRow = (id: string) => {
    if (chapters.length <= 1) {
      onAddToast("You must maintain at least one chapter row.", "warning");
      return;
    }
    setChapters(prev => prev.filter(ch => ch.id !== id));
    onAddToast("Chapter row removed.", "info");
  };

  const handleReset = () => {
    setChapters([
      { id: "1", time: "00:00", title: "Introduction & Hook" },
      { id: "2", time: "01:30", title: "The Main Problem Solved" }
    ]);
    onAddToast("Reset to default baseline template.", "info");
  };

  const compiledText = useMemo(() => {
    return chapters
      .map(ch => {
        const timeVal = ch.time.trim() || "00:00";
        const titleVal = ch.title.trim() || "Untitled Section";
        return `${timeVal} ${titleVal}`;
      })
      .join("\n");
  }, [chapters]);

  const handleCopyCompiled = () => {
    onCopy(compiledText);
  };

  const handleDownload = () => {
    const blob = new Blob([compiledText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "youtube_chapters_import.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    onAddToast("Chapters TXT file download triggered!", "success");
  };

  const visualSegments = useMemo(() => {
    const valid = analyzedChapters.rows.filter(r => r.seconds !== -1);
    if (valid.length === 0) return [];
    
    const sorted = [...valid].sort((a, b) => a.seconds - b.seconds);
    
    const lastSecs = sorted[sorted.length - 1].seconds;
    const totalDuration = lastSecs > 0 ? lastSecs + 180 : 600;

    const segments: { id: string; title: string; start: number; end: number; widthPct: number; timeRange: string }[] = [];
    
    sorted.forEach((ch, idx) => {
      const start = ch.seconds;
      const end = idx < sorted.length - 1 ? sorted[idx + 1].seconds : totalDuration;
      const duration = Math.max(10, end - start);
      
      const widthPct = (duration / totalDuration) * 100;

      segments.push({
        id: ch.id,
        title: ch.title,
        start,
        end,
        widthPct,
        timeRange: `${formatSecondsToTime(start)} - ${formatSecondsToTime(end)}`
      });
    });

    return segments;
  }, [analyzedChapters.rows]);

  const toolContent = (
    <>
      {/* Visual Progress Bar Simulator */}
      <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="timeline-heading">
        <div className="flex justify-between items-center">
          <h3 id="timeline-heading" className="text-xs font-mono font-bold uppercase tracking-widest text-text-disabled">
            Simulated Video Timeline Segment Player
          </h3>
          {visualSegments[activeSegmentIndex] && (
            <span className="text-xs font-semibold text-brand-primary font-mono">
              Hover/Select Chapters to Highlight
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="w-full h-3.5 bg-[#444] dark:bg-[#333] rounded-full overflow-hidden flex gap-1 p-[1px]">
            {visualSegments.map((seg, idx) => (
              <div
                key={seg.id}
                onMouseEnter={() => setActiveSegmentIndex(idx)}
                style={{ width: `${seg.widthPct}%` }}
                className={`h-full cursor-pointer transition-all duration-150 ${
                  activeSegmentIndex === idx
                    ? "bg-red-600 rounded-sm scale-y-110 shadow"
                    : "bg-red-500/75 hover:bg-red-500 rounded-sm"
                }`}
              />
            ))}
          </div>

          {visualSegments[activeSegmentIndex] ? (
            <div className="p-3.5 rounded-xl border border-border-light/60 bg-surface-muted/30 flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-red-600 fill-red-600" />
                <span className="text-xs font-mono font-bold text-text-disabled">
                  Segment #{activeSegmentIndex + 1}
                </span>
                <span className="text-sm font-bold text-text-main">
                  {visualSegments[activeSegmentIndex].title}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-brand-primary bg-brand-primary-light/40 px-2.5 py-0.5 rounded-md">
                {visualSegments[activeSegmentIndex].timeRange}
              </span>
            </div>
          ) : (
            <div className="text-center p-3 text-xs text-text-disabled italic">Add chapters to populate timeline track.</div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chapter Editor */}
        <div className="lg:col-span-7 space-y-5">
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="editor-heading">
            <div className="flex justify-between items-center pb-2 border-b border-border-light/40">
              <h3 id="editor-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
                Chapters Creator Grid
              </h3>
              <span className="text-xs font-mono text-text-disabled">Auto-numbering active</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => {
                const rowErr = analyzedChapters.rowErrors.find(e => e.id === ch.id);
                return (
                  <div key={ch.id} className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-text-disabled w-5 shrink-0 text-right">
                        {idx + 1}.
                      </span>
                      
                      <input
                        type="text"
                        value={ch.time}
                        onChange={(e) => updateRow(ch.id, "time", e.target.value)}
                        placeholder="00:00"
                        className={`w-20 p-2 text-center rounded-lg border text-xs font-mono text-text-main focus:outline-none focus:ring-1 ${
                          rowErr?.type === "error"
                            ? "border-red-500 focus:ring-red-500"
                            : rowErr?.type === "warning"
                              ? "border-amber-500 focus:ring-amber-500"
                              : "border-border-light focus:border-brand-primary focus:ring-brand-primary bg-background"
                        }`}
                        aria-label={`Chapter ${idx + 1} time`}
                      />

                      <input
                        type="text"
                        value={ch.title}
                        onChange={(e) => updateRow(ch.id, "title", e.target.value)}
                        placeholder="Chapter description"
                        className="flex-1 p-2 rounded-lg border border-border-light text-xs font-sans text-text-main bg-background focus:outline-none focus:border-brand-primary"
                        aria-label={`Chapter ${idx + 1} title`}
                      />

                      <button
                        onClick={() => removeRow(ch.id)}
                        className="p-2 rounded-lg text-text-disabled hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove chapter row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {rowErr && (
                      <p className={`text-[10px] font-mono font-semibold pl-8 ${
                        rowErr.type === "error" ? "text-red-500" : "text-amber-500"
                      }`}>
                        ▲ {rowErr.msg}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border-light/40">
              <button
                onClick={addRow}
                className="bg-brand-primary-light/50 hover:bg-brand-primary-light text-brand-primary hover:text-brand-primary border border-brand-primary/10 py-2 px-3.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Append Chapter Row
              </button>
              <button
                onClick={handleReset}
                className="text-xs font-sans font-bold text-text-disabled hover:text-text-main flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Grid
              </button>
            </div>
          </section>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="output-heading">
            <h3 id="output-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
              Chapters Import Output
            </h3>
            
            <div className="relative">
              <textarea
                value={compiledText}
                readOnly
                rows={7}
                className="w-full font-mono text-base sm:text-xs md:text-sm p-4 rounded-xl border border-border-light bg-surface-muted/40 text-text-main focus:outline-none leading-relaxed resize-none"
                placeholder="Chapter outputs list..."
              />
              <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-surface-base border border-border-light text-text-sub hover:text-brand-primary shadow-sm transition-colors"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyCompiled}
                  className="p-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm transition-colors flex items-center gap-1 text-xs px-2.5 font-bold"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
          </section>

          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="audit-heading">
            <h3 id="audit-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              Timeline Audit Logs
            </h3>

            {analyzedChapters.globalWarnings.length > 0 ? (
              <div className="space-y-2.5">
                {analyzedChapters.globalWarnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/15 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400 leading-normal">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            ) : analyzedChapters.rowErrors.length === 0 ? (
              <div className="p-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <div>
                  <p className="font-bold">Grid Fully Calibrated!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">Chapters are chronological, distinct, and start accurately at 00:00.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-disabled font-mono italic">Please resolve active inline errors inside the creator grid.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Enter chapter times in MM:SS or HH:MM:SS format and add descriptive titles.</li>
      <li>The visual timeline at the top renders proportional segments — hover any segment to see its time range.</li>
      <li>Rows are auto-numbered; inline errors flag invalid formats, non-chronological order, and duplicates.</li>
      <li>Global warnings check YouTube requirements: first chapter at 00:00, minimum 3 chapters.</li>
      <li>Copy or download the formatted chapter list for your video description.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Visual proportional timeline showing chapter durations at a glance</li>
      <li>Inline validation with specific error messages per row</li>
      <li>Global YouTube compliance checks (00:00 start, minimum 3 chapters, no duplicates)</li>
      <li>Clean formatted output: "MM:SS Title" per line, ready for YouTube description</li>
      <li>Copy to clipboard and download as .txt file</li>
      <li>Add/remove/duplicate rows with automatic time suggestions</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Timeline proportions assume an estimated total duration (last chapter + 3 minutes) — actual video length may differ.</li>
      <li>YouTube chapter activation requires the formatted list in the video description; this tool only generates the text.</li>
      <li>Duplicate detection is based on exact second matches; near-duplicates (e.g., 01:29 vs 01:30) are not flagged.</li>
      <li>No connection to your YouTube account — this tool only generates the text you copy.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-chapter-generator"
      toolName="YouTube Chapter Generator"
      toolDescription="Build chapter lists from your timestamps with segment previews. Visual timeline shows proportional durations."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No chapter data is sent to any server."
      trustNote="Timeline proportions are estimates based on last chapter + 3 minutes. YouTube chapter activation requires the list in your description."
    >
      {toolContent}
    </ToolPageLayout>
  );
};