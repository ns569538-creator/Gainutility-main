import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  History, 
  ArrowRight, 
  Smile, 
  Hash, 
  Zap, 
  Heart, 
  Laptop,
  Smartphone,
  RotateCcw,
  Youtube,
  Info,
  Type,
} from "lucide-react";
import { ToolPageLayout } from "./ToolPageLayout";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";

interface YoutubeTitleAnalyzerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView: (view: any) => void;
  initialKeyword?: string;
}

interface AnalyzedTitle {
  title: string;
  score: number;
  date: string;
}

const POWER_WORDS = [
  "secret", "insane", "shocking", "ultimate", "unbelievable", "proven", "struggling", 
  "hack", "mastery", "fast", "easy", "warning", "guaranteed", "stop", "never", 
  "reveal", "essential", "mistake", "mind-blowing", "viral", "surprised", "hacks",
  "perfect", "absolute", "powerful", "growth", "boost", "maximize", "fail", "success"
];

export const YoutubeTitleAnalyzer: React.FC<YoutubeTitleAnalyzerProps> = ({ onCopy, onAddToast, onChangeView, initialKeyword }) => {
  const locale = useLocale();
  const [title, setTitle] = useState<string>(initialKeyword || "");
  const [history, setHistory] = useState<AnalyzedTitle[]>([]);

  useEffect(() => {
    if (initialKeyword && !title) {
      setTitle(initialKeyword);
    }
  }, [initialKeyword]);

  useEffect(() => {
    const saved = localStorage.getItem("gainutility_title_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveToHistory = (newTitle: string, score: number) => {
    if (!newTitle.trim()) return;
    const exists = history.some(item => item.title.toLowerCase() === newTitle.toLowerCase());
    if (exists) return;

    const updated = [
      { title: newTitle, score, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...history.slice(0, 7)
    ];
    setHistory(updated);
    localStorage.setItem("gainutility_title_history", JSON.stringify(updated));
  };

  const charCount = title.length;
  const words = title.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const hasEmoji = /\p{Emoji}/u.test(title);
  const hasNumber = /\d+/.test(title);
  const hasBrackets = /[()[\]{}]/.test(title);
  
  const titleWordsLower = words.map(w => w.toLowerCase().replace(/[^a-z-]/g, ""));
  const foundPowerWords = POWER_WORDS.filter(pw => titleWordsLower.includes(pw));
  const hasPowerWord = foundPowerWords.length > 0;

  const uppercaseWords = words.filter(w => /^[A-Z0-9]+$/.test(w.replace(/[^A-Z0-9]/g, "")));
  const allCapsWordsCount = uppercaseWords.filter(w => w.length > 2).length;

  let score = 50;
  let lengthFeedback = { text: "Optimal length is 45-70 characters.", status: "info" as "info" | "success" | "warning" | "error" };
  
  if (charCount >= 45 && charCount <= 70) {
    score += 15;
    lengthFeedback = { text: "Perfect length! Fully visible across standard desktop and mobile layouts.", status: "success" };
  } else if (charCount > 0 && charCount < 45) {
    score += 5;
    lengthFeedback = { text: "A bit short. Add 1-2 search intent keywords or a power suffix.", status: "warning" };
  } else if (charCount > 70 && charCount <= 100) {
    score -= 5;
    lengthFeedback = { text: "Longer than average. The title will likely get truncated on some mobile devices.", status: "warning" };
  } else if (charCount > 100) {
    lengthFeedback = { text: "Warning: Exceeds YouTube's 100-character display maximum limit.", status: "error" };
  }

  if (hasPowerWord) score += 12;
  if (hasBrackets) score += 10;
  if (hasNumber) score += 8;
  if (hasEmoji) score += 5;
  if (allCapsWordsCount > 0 && allCapsWordsCount <= 2) score += 5;
  else if (allCapsWordsCount > 2) score -= 10;

  score = Math.min(100, Math.max(0, score));

  let rating = "Needs Review";
  let ratingColor = "text-red-500 bg-red-500/10";
  if (score >= 85) {
    rating = "Strong";
    ratingColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  } else if (score >= 65) {
    rating = "Good Potential";
    ratingColor = "text-brand-primary bg-brand-primary-light/50 border-brand-primary/15";
  }

  const handleCopyTitle = () => onCopy(title);
  const handleSelectHistory = (historyTitle: string) => {
    setTitle(historyTitle);
    onAddToast("Selected title from history log.", "info");
  };
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("gainutility_title_history");
    onAddToast("History log cleared.", "success");
  };
  const triggerAnalyzeSave = () => {
    saveToHistory(title, score);
    onAddToast("Analysis synced and logged!", "success");
  };

  const mobileTruncatedTitle = charCount > 52 ? title.slice(0, 52) + "..." : title;
  const desktopTruncatedTitle = charCount > 68 ? title.slice(0, 68) + "..." : title;

  const toolContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Input & Live Preview */}
      <div className="lg:col-span-7 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-6" aria-labelledby="input-heading">
          <div className="space-y-1">
            <h3 id="input-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-primary" />
              Enter your video title
            </h3>
            <p className="text-xs text-text-muted">Paste a title or type one. If you came from Keyword Explorer, your keyword is prefilled.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="title-input" className="text-xs font-mono font-bold text-text-sub uppercase tracking-wider">
                Video Title
              </label>
              <span className={`text-xs font-mono font-bold ${charCount > 100 ? "text-red-500" : "text-text-muted"}`}>
                {charCount}/100 characters
              </span>
            </div>
            <textarea
              id="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              rows={3}
              className="w-full font-sans text-sm md:text-base p-4 rounded-xl border border-border-light bg-background text-text-main focus:outline-none focus:border-brand-primary leading-relaxed resize-none focus:ring-1 focus:ring-brand-primary"
              placeholder="Type or paste your video title here..."
              aria-describedby="title-hint"
            />
            <p id="title-hint" className="text-xs text-text-muted">{wordCount} words · {charCount}/100 chars</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-light/40">
            <div className="flex items-center gap-2">
              <button
                onClick={triggerAnalyzeSave}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze & Log
              </button>
              <button
                onClick={handleCopyTitle}
                className="bg-surface-muted hover:bg-border-light text-text-sub hover:text-text-main px-4 py-2 rounded-lg text-xs font-sans font-bold border border-border-light/60 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Title
              </button>
            </div>
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-5" aria-labelledby="truncation-heading">
          <h3 id="truncation-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            Device Truncation Previews
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-surface-muted/50 rounded-xl border border-border-light/40 space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-disabled font-mono">
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop Feed Limit (~68 characters visible)</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text-main leading-snug line-clamp-1">
                  {desktopTruncatedTitle}
                </h4>
                <p className="text-[11px] font-mono text-text-disabled">Channel Name • 12K views</p>
              </div>
            </div>

            <div className="p-4 bg-surface-muted/50 rounded-xl border border-border-light/40 space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-disabled font-mono">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Feed Limit (~52 characters visible)</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-main leading-snug line-clamp-2">
                  {mobileTruncatedTitle}
                </h4>
                <p className="text-[10px] font-mono text-text-disabled">Channel Name • 4.8K views</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right: Checks & Suggestions */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-6" aria-labelledby="checks-heading">
          <h3 id="checks-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider">
            Quick Checks
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {charCount >= 45 && charCount <= 70 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Title Length</p>
                <p className="text-xs text-text-muted leading-relaxed">{lengthFeedback.text}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {hasPowerWord ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Power / Curiosity Words</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {hasPowerWord 
                    ? `Detected: "${foundPowerWords.join(", ")}".` 
                    : "Add curiosity triggers (e.g. 'Secret', 'Insane', 'Proven', 'Mistakes', 'Fast', 'Easy') to boost emotional drive."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {hasBrackets ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Brackets or Parentheses</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {hasBrackets 
                    ? "Good — brackets help frame context and intent." 
                    : "Try framing context with brackets like (Step-by-Step), [PDF Included], or (Must Watch!)."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {hasNumber ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Numbers</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {hasNumber 
                    ? "Number detected — good for listicles and specific promises." 
                    : "Consider adding a number (e.g. '5 Tips', '2024 Guide', '10 Minutes')."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {allCapsWordsCount > 0 && allCapsWordsCount <= 2 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : allCapsWordsCount > 2 ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-text-disabled shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Capitalization</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {allCapsWordsCount > 2
                    ? "Too many ALL CAPS words — may look spammy."
                    : allCapsWordsCount > 0
                    ? "Good — limited ALL CAPS for emphasis."
                    : "Consider 1-2 ALL CAPS words for emphasis (e.g. 'ULTIMATE', 'FREE')."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border-light bg-surface-muted/30">
              {hasEmoji ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-text-disabled shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-text-main">Emoji</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {hasEmoji 
                    ? "Emoji detected — can increase visibility in feed." 
                    : "Optional: add 1 emoji at the end for visual pop."
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm text-center space-y-4" aria-labelledby="score-heading">
          <h3 id="score-heading" className="text-xs font-mono font-bold uppercase tracking-widest text-text-disabled">
            Optimization Score
          </h3>
          <div className="space-y-1">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-sans font-black text-brand-primary tracking-tight">
                {score}
              </span>
              <span className="text-sm font-mono font-bold text-text-disabled">/100</span>
            </div>
            <span className={`inline-block text-[11px] font-mono font-extrabold px-3 py-1 rounded-full border ${ratingColor} mt-2`}>
              {rating}
            </span>
          </div>
          <p className="text-xs text-text-muted">Heuristic based on common best practices — not a prediction of performance.</p>
        </section>

        {history.length > 0 && (
          <section className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4" aria-labelledby="history-heading">
            <div className="flex justify-between items-center">
              <h3 id="history-heading" className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand-primary" />
                Recent Titles
              </h3>
              <button
                onClick={handleClearHistory}
                className="text-[10px] font-mono font-bold text-red-500 hover:underline flex items-center gap-0.5"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectHistory(item.title)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border-light bg-surface-muted/30 hover:border-brand-primary hover:bg-brand-primary-light/5 cursor-pointer transition-all duration-100 group"
                >
                  <p className="text-xs text-text-sub font-medium truncate flex-1 pr-4 line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary-light/40 px-1.5 py-0.5 rounded">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const howItWorks = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Paste your draft video title or use a keyword from Keyword Explorer.</li>
      <li>The analyzer instantly checks character count, word count, and formatting signals.</li>
      <li>Desktop and mobile truncation previews show exactly where your title will be cut off.</li>
      <li>Quick checks flag issues with length, power words, brackets, numbers, caps, and emoji.</li>
      <li>Use the checklist to fix any issues, then copy the final title.</li>
    </ul>
  );

  const whatYouGet = (
    <ul className="space-y-2 list-disc list-inside">
      <li>Real-time character count with 100-character YouTube limit indicator</li>
      <li>Desktop (~68 chars) and mobile (~52 chars) truncation previews</li>
      <li>Quick checks: length, power words, brackets, numbers, capitalization, emoji</li>
      <li>Optimization score (0-100) with clear rating — heuristic, not a guarantee</li>
      <li>Actionable checklist with specific suggestions</li>
      <li>History log of analyzed titles (stored locally in your browser)</li>
      <li>Copy button for the final title</li>
    </ul>
  );

  const limitations = (
    <ul className="space-y-2 list-disc list-inside">
      <li>The score is a heuristic based on common YouTube best practices — it does not guarantee clicks or rankings.</li>
      <li>Truncation points vary by device, browser, and YouTube UI updates; previews are approximate.</li>
      <li>Power word list is a curated set of common triggers, not an exhaustive dictionary.</li>
      <li>No connection to your YouTube account — this tool only analyzes the text you provide.</li>
    </ul>
  );

  return (
    <ToolPageLayout
      toolId="youtube-title-analyzer"
      toolName="YouTube Title Analyzer"
      toolDescription="Check how your title reads before you publish. See mobile/desktop truncation and get quick checks with an optimization score."
      onChangeView={onChangeView}
      howItWorks={howItWorks}
      whatYouGet={whatYouGet}
      limitations={limitations}
      privacyNote="Runs entirely in your browser. No titles are sent to any server."
      trustNote="Score is a heuristic based on common best practices, not a prediction of performance."
    >
      {toolContent}
    </ToolPageLayout>
  );
};