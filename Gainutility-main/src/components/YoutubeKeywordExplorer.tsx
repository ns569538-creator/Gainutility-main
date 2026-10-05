import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Copy,
  Check,
  RotateCcw,
  Youtube,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Download,
  X,
  ListFilter,
  ArrowUpDown,
  Loader2,
  Layers,
  Braces,
  Lightbulb,
  Globe,
  Zap,
  Type,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/youtubeKeywordExplorer";
import { tt, ttf } from "../i18n/toolUi";

const TOOL_ID = "youtube-keyword-explorer";
const HISTORY_KEY = "gainutility_keyword_history";
const HISTORY_LIMIT = 8;

const MARKET_OPTIONS: { id: string; hl: string; gl: string; country: string; language: string }[] = [
  { id: "en", hl: "en", gl: "US", country: "United States", language: "English" },
  { id: "pt-br", hl: "pt-BR", gl: "BR", country: "Brazil", language: "Português" },
  { id: "id", hl: "id", gl: "ID", country: "Indonesia", language: "Bahasa Indonesia" },
  { id: "es-mx", hl: "es-419", gl: "MX", country: "Mexico", language: "Español" },
  { id: "es-co", hl: "es-419", gl: "CO", country: "Colombia", language: "Español" },
  { id: "fr", hl: "fr", gl: "FR", country: "France", language: "Français" },
  { id: "it", hl: "it", gl: "IT", country: "Italy", language: "Italiano" },
];

const DEFAULT_MARKET_BY_LOCALE: Record<string, string> = {
  en: "en",
  "pt-br": "pt-br",
  id: "id",
  "es-mx": "es-mx",
  "es-co": "es-co",
  fr: "fr",
  it: "it",
};

type Pattern = "question" | "comparison" | "bestFor" | "preposition" | "number" | "generic";
type SortKey = "signal" | "surfaces" | "alpha";
type ViewState = "idle" | "loading" | "error" | "ready";
type TabKey = "all" | "questions" | "longtail" | "atoz" | "titles";

interface SuggestItem {
  text: string;
  position: number;
}

interface ExpandedList {
  seed: string;
  items: SuggestItem[];
  skipped?: boolean;
}

interface AutocompleteResponse {
  query: string;
  hl: string;
  gl: string;
  fetchedAt: string;
  main: SuggestItem[];
  expanded?: ExpandedList[];
  expandedCount?: number;
  error?: string;
}

interface KeywordSource {
  label: string;
  position: number;
}

interface Keyword {
  text: string;
  pattern: Pattern;
  surfaces: number;
  minPosition: number;
  sources: KeywordSource[];
  signal: number;
  signalLevel: "high" | "medium" | "low";
}

interface Cluster {
  pattern: Pattern;
  count: number;
  samples: string[];
}

const QUESTION_STARTERS = [
  "how", "what", "why", "when", "where", "who", "which", "can",
  "does", "is", "are", "do", "should", "will", "did", "would",
];
const COMPARISON_RE = /\b(vs\.?|versus|or)\b/i;
const BEST_TOKENS = new Set(["best", "top", "cheap"]);
const PREPOSITION_TOKENS = new Set([
  "with", "without", "in", "at", "to", "for", "on", "of", "about", "into",
]);

const QUESTION_STARTER_RE = new RegExp(`^(${QUESTION_STARTERS.join("|")})\\b`, "i");
const HOW_TO_RE = /^how to\b/i;

const classifyPattern = (text: string): Pattern => {
  const lower = text.toLowerCase();
  if (text.includes("?") || QUESTION_STARTER_RE.test(text)) return "question";
  if (COMPARISON_RE.test(lower)) return "comparison";
  if (/\d/.test(lower)) return "number";
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.some((t) => BEST_TOKENS.has(t))) return "bestFor";
  if (tokens.some((t) => PREPOSITION_TOKENS.has(t))) return "preposition";
  return "generic";
};

const getClassification = (text: string): { label: string; key: string } => {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { label: "Broad", key: "classificationBroad" };
  if (words.length >= 4) return { label: "Long-tail", key: "classificationLongTail" };
  if (QUESTION_STARTER_RE.test(text)) return { label: "Question", key: "classificationQuestion" };
  return { label: "Specific", key: "classificationSpecific" };
};

interface YoutubeKeywordExplorerProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: any) => void;
}

export const YoutubeKeywordExplorer: React.FC<YoutubeKeywordExplorerProps> = ({ onCopy, onAddToast, onChangeView }) => {
  const locale = useLocale();
  const defaultMarket = DEFAULT_MARKET_BY_LOCALE[locale] ?? "en";

  const [searchInput, setSearchInput] = useState("");
  const [marketId, setMarketId] = useState(defaultMarket);
  const [showAdvancedMarket, setShowAdvancedMarket] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [view, setView] = useState<ViewState>("idle");
  const [response, setResponse] = useState<AutocompleteResponse | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("signal");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(50);
  const [flash, setFlash] = useState<string | null>(null);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [showAtoZProgress, setShowAtoZProgress] = useState(false);
  const [atoZProgress, setAtoZProgress] = useState(0);

  // Computed to avoid TypeScript narrowing issues in conditional rendering
  const isLoading = view === "loading";

  const flashTimer = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let saved: string[] = [];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) saved = parsed.map(String).slice(0, HISTORY_LIMIT);
      }
    } catch {
      saved = [];
    }
    setHistory(saved);
  }, []);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const flashCopy = (label: string) => {
    setFlash(label);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1600);
  };

  const saveQueryToHistory = useCallback((query: string) => {
    const cleaned = query.trim().toLowerCase();
    if (!cleaned) return;
    setHistory((prev) => {
      const next = [cleaned, ...prev.filter((h) => h.toLowerCase() !== cleaned)].slice(0, HISTORY_LIMIT);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearHistoryLog = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    onAddToast(tt(TOOL_ID, "historyCleared", locale, "Recent searches cleared."), "success");
  };

  const market = MARKET_OPTIONS.find((m) => m.id === marketId) ?? MARKET_OPTIONS[0];

  const runSearch = useCallback(
    async (query: string, mktId: string, expand: boolean) => {
      const q = query.trim();
      if (!q) return;
      const mkt = MARKET_OPTIONS.find((m) => m.id === mktId) ?? MARKET_OPTIONS[0];
      setView("loading");
      setErrorMsg("");
      setExpandedKeyword(null);
      setAtoZProgress(0);
      setShowAtoZProgress(expand);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const params = new URLSearchParams({ q, hl: mkt.hl, gl: mkt.gl });
        if (expand) params.set("expand", "1");
        const res = await fetch(`/api/youtube-autocomplete?${params.toString()}`, { signal });
        
        if (!res.ok) {
          let detail = "";
          try {
            const body = (await res.json()) as { error?: string } | null;
            detail = body?.error ?? "";
          } catch {}
          setErrorMsg(detail);
          throw new Error(`request failed: ${res.status}`);
        }
        const json = (await res.json()) as AutocompleteResponse;
        if (!json || !Array.isArray(json.main)) {
          setErrorMsg("");
          throw new Error("bad payload");
        }
        setResponse(json);
        setActiveQuery(json.query);
        setSelected(new Set());
        setVisibleCount(50);
        setView("ready");
        saveQueryToHistory(json.query);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setView("error");
      } finally {
        setShowAtoZProgress(false);
      }
    },
    [saveQueryToHistory]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchInput, marketId, true);
  };

  const onRetry = () => {
    runSearch(activeQuery || searchInput, marketId, true);
  };

  const onHistoryClick = (query: string) => {
    setSearchInput(query);
    runSearch(query, marketId, true);
  };

  const keywords = useMemo<Keyword[]>(() => {
    if (!response || !Array.isArray(response.main)) return [];
    const byText = new Map<string, Keyword>();

    const addItems = (items: SuggestItem[], sourceLabel: string) => {
      for (const item of items) {
        const text = item.text.trim();
        if (!text) continue;
        const key = text.toLowerCase();
        const existing = byText.get(key);
        const source = { label: sourceLabel, position: item.position };
        if (existing) {
          const seenLabel = existing.sources.some((s) => s.label === sourceLabel);
          if (!seenLabel) existing.sources.push(source);
          existing.surfaces = existing.sources.length;
          existing.minPosition = Math.min(existing.minPosition, item.position);
        } else {
          byText.set(key, {
            text,
            pattern: classifyPattern(text),
            surfaces: 1,
            minPosition: item.position,
            sources: [source],
            signal: 0,
            signalLevel: "low",
          });
        }
      }
    };

    const seed = response.query;
    addItems(response.main, ttf(TOOL_ID, "sourceMainLine", locale, { query: seed }));
    for (const list of response.expanded ?? []) {
      addItems(list.items, ttf(TOOL_ID, "sourceExpansionLine", locale, { query: seed, letter: list.seed }));
    }

    const list = Array.from(byText.values());

    for (const kw of list) {
      kw.signal = kw.surfaces * 10 + (11 - kw.minPosition);
    }
    list.sort((a, b) => b.signal - a.signal);
    const third = Math.max(1, Math.ceil(list.length / 3));
    list.forEach((kw, i) => {
      kw.signalLevel = i < third ? "high" : i < third * 2 ? "medium" : "low";
    });
    return list;
  }, [response, locale]);

  const filteredByTab = useMemo(() => {
    let out = keywords;
    if (activeTab === "questions") out = keywords.filter((k) => k.pattern === "question");
    else if (activeTab === "longtail") out = keywords.filter((k) => {
      const classification = getClassification(k.text);
      return classification.key === "classificationLongTail";
    });
    else if (activeTab === "atoz") out = keywords.filter((k) => k.surfaces > 1);
    return out;
  }, [keywords, activeTab]);

  const filtered = useMemo(() => {
    let out = filteredByTab;
    const sorted = [...out];
    if (sortKey === "signal") sorted.sort((a, b) => b.signal - a.signal);
    else if (sortKey === "surfaces") sorted.sort((a, b) => b.surfaces - a.surfaces || a.minPosition - b.minPosition);
    else sorted.sort((a, b) => a.text.localeCompare(b.text));
    return sorted;
  }, [filteredByTab, sortKey]);

  const selectedKeywords = useMemo(() => {
    if (selected.size === 0) return [];
    return keywords.filter((k) => selected.has(k.text));
  }, [keywords, selected]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((k) => selected.has(k.text));

  const toggleSelected = (text: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const k of filtered) next.delete(k.text);
      } else {
        for (const k of filtered) next.add(k.text);
      }
      return next;
    });
  };

  const copyText = (text: string, labelKey: string) => {
    onCopy(text);
    flashCopy(labelKey);
    onAddToast(tt(TOOL_ID, "copied", locale, "Copied!"), "success");
  };

  const copySelected = () => {
    if (selectedKeywords.length === 0) return;
    copyText(selectedKeywords.map((k) => k.text).join("\n"), "copySelected");
  };

  const copyTags = () => {
    const tagText = selectedKeywords.map((k) => k.text).join(", ");
    if (!tagText.trim()) return;
    copyText(tagText, "copyTags");
  };

  const selectedTagString = selectedKeywords.map((k) => k.text).join(", ");

  const downloadCsv = () => {
    if (keywords.length === 0) return;
    const header = "keyword,pattern,surfaced_in_count,first_position,classification";
    const rows = keywords.map((k) => {
      const classification = getClassification(k.text);
      return [JSON.stringify(k.text), k.pattern, String(k.surfaces), String(k.minPosition), classification.label].join(",");
    });
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = activeQuery.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "keywords";
    a.href = url;
    a.download = `youtube-keywords-${slug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const visible = filtered.slice(0, visibleCount);
  const hiddenCount = filtered.length - visible.length;

  const marketLabel = `${market.country} • ${market.language}`;

  // Title ideas generation
  const generateTitleIdeas = (keyword: string): string[] => {
    const kw = keyword.trim();
    return [
      `${kw.charAt(0).toUpperCase() + kw.slice(1)}: Start Here`,
      `${kw.charAt(0).toUpperCase() + kw.slice(1)} — Complete Guide`,
      `How to ${kw}`,
      `${kw.charAt(0).toUpperCase() + kw.slice(1)} for Beginners`,
      `10-Minute ${kw.charAt(0).toUpperCase() + kw.slice(1)}`,
    ];
  };

  return (
    <div className="flex flex-col gap-8" id="youtube-keyword-explorer-tool">
      {/* FIRST SCREEN - Idle state */}
      {view === "idle" && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5" />
              {tt(TOOL_ID, "eyebrow", locale, "Creator Studio")}
            </span>
            <h1 className="text-3xl md:text-4xl font-sans font-black text-text-main leading-tight">
              {tt(TOOL_ID, "heading", locale, "YouTube Keyword Explorer")}
            </h1>
            <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {tt(TOOL_ID, "sub", locale, "Find real phrases YouTube suggests for your video topic.")}
            </p>
          </div>

          <div className="bg-surface-base border border-border-light p-6 md:p-8 rounded-2xl shadow-premium-sm space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic-input" className="block text-sm font-semibold text-text-main">
                {tt(TOOL_ID, "firstScreenQuestion", locale, "What are you making a video about?")}
              </label>
              <p className="text-xs text-text-muted">{tt(TOOL_ID, "videoTopicLabel", locale, "Video topic")}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <input
                  id="topic-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={tt(TOOL_ID, "placeholder", locale, "e.g. how to make sourdough bread")}
                  disabled={isLoading}
                  className="w-full text-base md:text-lg p-4 pr-14 rounded-xl border border-border-light bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary font-medium"
                  aria-label={tt(TOOL_ID, "videoTopicLabel", locale, "Video topic")}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchInput.trim()}
                  aria-label={tt(TOOL_ID, "searchKeywords", locale, "Search keywords")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {tt(TOOL_ID, "exampleChips", locale).split("|").map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchInput(ex);
                      runSearch(ex, marketId, true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border-light bg-surface-muted/50 text-xs font-medium text-text-sub hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchInput.trim()}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-base font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto sm:mx-0"
              >
                <Search className="w-5 h-5" />
                {tt(TOOL_ID, "findKeywordsBtn", locale, "Find YouTube Keywords")}
              </button>
            </form>

            {/* Market settings - compact */}
            <div className="border-t border-border-light/40 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="market-select" className="text-xs font-mono font-bold text-text-disabled uppercase tracking-wider">
                  {tt(TOOL_ID, "marketLabel", locale, "Market")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedMarket(!showAdvancedMarket)}
                  className="text-xs font-medium text-brand-primary hover:underline cursor-pointer"
                >
                  {showAdvancedMarket ? tt(TOOL_ID, "marketAdvanced", locale, "Advanced market settings") : tt(TOOL_ID, "marketAdvanced", locale, "Advanced market settings")}
                </button>
              </div>
              <div className="relative">
                <select
                  id="market-select"
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none w-full px-3.5 py-2.5 pr-9 rounded-xl border border-border-light bg-surface-base text-text-main text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer disabled:opacity-60"
                >
                  {MARKET_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.country} • {m.language}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
              
              {showAdvancedMarket && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-light/40">
                  <div className="space-y-1">
                    <label htmlFor="market-language" className="text-[11px] font-mono font-bold text-text-disabled uppercase tracking-wider">{tt(TOOL_ID, "marketLanguage", locale)}</label>
                    <select
                      id="market-language"
                      value={market.hl}
                      onChange={(e) => {
                        const opt = MARKET_OPTIONS.find(m => m.hl === e.target.value);
                        if (opt) setMarketId(opt.id);
                      }}
                      disabled={isLoading}
                      className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface-base text-text-main text-sm outline-none focus:border-brand-primary"
                    >
                      {MARKET_OPTIONS.map((m) => (
                        <option key={m.id} value={m.hl}>{m.language}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="market-region" className="text-[11px] font-mono font-bold text-text-disabled uppercase tracking-wider">{tt(TOOL_ID, "marketRegion", locale)}</label>
                    <select
                      id="market-region"
                      value={market.gl}
                      onChange={(e) => {
                        const opt = MARKET_OPTIONS.find(m => m.gl === e.target.value);
                        if (opt) setMarketId(opt.id);
                      }}
                      disabled={isLoading}
                      className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface-base text-text-main text-sm outline-none focus:border-brand-primary"
                    >
                      {MARKET_OPTIONS.map((m) => (
                        <option key={m.id} value={m.gl}>{m.country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Output explanation */}
            <div className="bg-surface-muted/50 border border-border-light/40 p-4 rounded-xl space-y-2">
              <p className="text-xs text-text-muted">{tt(TOOL_ID, "outputExplanation", locale)}</p>
              <p className="text-xs text-text-muted flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {tt(TOOL_ID, "trustNote", locale)}
              </p>
            </div>
          </div>

          {/* Trust strip */}
          <div className="bg-surface-base border border-border-light p-4 rounded-2xl shadow-premium-sm flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{tt(TOOL_ID, "trustSourceLine", locale, "Source: YouTube autocomplete")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <Globe className="w-4 h-4 text-brand-primary shrink-0" />
              <span>{ttf(TOOL_ID, "trustMarket", locale, { market: marketLabel })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-sub">
              <Info className="w-4 h-4 text-brand-primary shrink-0" />
              <span>{tt(TOOL_ID, "trustProxyNote", locale)}</span>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {view === "loading" && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-base border border-border-light p-8 rounded-2xl shadow-premium-sm space-y-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <span className="text-base font-bold text-text-main">{tt(TOOL_ID, "searching", locale)}</span>
            </div>
            {showAtoZProgress && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted">{tt(TOOL_ID, "expandDescription", locale)}</p>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${atoZProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs font-mono text-text-disabled">{atoZProgress}%</p>
              </div>
            )}
            <div className="space-y-3">
              {[2, 3, 2].map((w, i) => (
                <div key={i} className="h-12 rounded-xl bg-surface-muted/50 animate-pulse" style={{ width: `${w * 30}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {view === "error" && (
        <div className="max-w-md mx-auto">
          <div className="bg-surface-base border border-border-light p-8 rounded-2xl shadow-premium-sm space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center">
              <X className="w-6 h-6 text-status-error" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-text-main">{tt(TOOL_ID, "errorTitle", locale)}</p>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">{tt(TOOL_ID, "errorBody", locale)}</p>
              {errorMsg && (
                <p className="text-[11px] font-mono text-status-error max-w-md mx-auto leading-relaxed break-words">{errorMsg}</p>
              )}
            </div>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 bg-brand-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {tt(TOOL_ID, "retryBtn", locale, "Try again")}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {view === "ready" && response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Results header */}
          <div className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-primary" />
                  {tt(TOOL_ID, "resultsHeader", locale, "Results for:")}
                </h2>
                <p className="text-base font-semibold text-text-main">"{activeQuery}"</p>
                <p className="text-xs text-text-muted">{ttf(TOOL_ID, "suggestionsCount", locale, { n: String(keywords.length) })}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-text-disabled border border-border-light/60 rounded-full px-3 py-1">
                  {tt(TOOL_ID, "trustSourceLine", locale)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {tt(TOOL_ID, "trustLive", locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-surface-base border border-border-light p-4 rounded-2xl shadow-premium-sm">
            <div className="flex flex-wrap gap-2" role="tablist">
              {(tt(TOOL_ID, "tabs", locale).split("|")).map((tab, i) => {
                const tabKeys: TabKey[] = ["all", "questions", "longtail", "atoz", "titles"];
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tabKeys[i]}
                    onClick={() => setActiveTab(tabKeys[i])}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold transition-colors cursor-pointer ${
                      activeTab === tabKeys[i]
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "text-text-sub bg-surface-muted/30 border-border-light/60 hover:border-brand-primary/40"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-surface-base border border-border-light p-4 rounded-2xl shadow-premium-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-border-light/70 bg-surface-muted/30 text-text-main text-xs font-bold outline-none cursor-pointer focus:border-brand-primary"
                  aria-label={tt(TOOL_ID, "sortRelative", locale, "Relative signal")}
                >
                  <option value="signal">{tt(TOOL_ID, "sortRelative", locale, "Relative signal")}</option>
                  <option value="surfaces">{tt(TOOL_ID, "sortSurfaces", locale, "Surfaced most")}</option>
                  <option value="alpha">{tt(TOOL_ID, "sortAlpha", locale, "A–Z")}</option>
                </select>
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-disabled pointer-events-none" />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-disabled pointer-events-none" />
              </div>

              <button
                onClick={toggleSelectAllFiltered}
                disabled={filtered.length === 0}
                className="px-3 py-2 rounded-lg border border-border-light/70 bg-surface-muted/30 text-text-sub font-bold hover:border-brand-primary/40 hover:text-brand-primary transition-colors disabled:opacity-50 cursor-pointer"
              >
                {allFilteredSelected ? tt(TOOL_ID, "clearSelection", locale) : tt(TOOL_ID, "selectAll", locale)}
              </button>

              {selectedKeywords.length > 0 && (
                <>
                  <span className="font-mono text-text-muted">{ttf(TOOL_ID, "selectedCount", locale, { n: String(selectedKeywords.length) })}</span>
                  <button
                    onClick={copySelected}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                  >
                    {flash === "copySelected" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {tt(TOOL_ID, "copySelected", locale, "Copy selected")}
                  </button>
                  <button
                    onClick={downloadCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light/70 bg-surface-muted/30 text-text-sub font-bold hover:border-brand-primary/40 hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Keyword list */}
          <div className="bg-surface-base border border-border-light rounded-2xl shadow-premium-sm overflow-hidden">
            {visible.length === 0 ? (
              <div className="p-10 text-center text-xs text-text-muted">{tt(TOOL_ID, "noKeywordsForFilter", locale)}</div>
            ) : (
              <ul className="divide-y divide-border-light/50">
                {visible.map((kw) => {
                  const isOpen = expandedKeyword === kw.text;
                  const isSelected = selected.has(kw.text);
                  const classification = getClassification(kw.text);
                  const isQuestion = kw.pattern === "question";
                  const isFromAutocomplete = kw.sources.some(s => s.label.includes("Suggested for") || s.label.includes("From"));
                  return (
                    <li key={kw.text} className="flex flex-col">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedKeyword(isOpen ? null : kw.text)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedKeyword(isOpen ? null : kw.text);
                          }
                        }}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-surface-muted/20 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(kw.text)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-brand-primary w-4 h-4 shrink-0 rounded cursor-pointer"
                          aria-label={`${tt(TOOL_ID, "selectAll", locale)} ${kw.text}`}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-text-main leading-snug break-words">{kw.text}</span>
                          <span className="block text-[11px] text-text-muted mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-brand-primary bg-brand-primary/10 border border-brand-primary/15 rounded-full px-2.5 py-0.5">
                              <Braces className="w-3 h-3" />
                              {tt(TOOL_ID, classification.key, locale)}
                            </span>
                            <span>{ttf(TOOL_ID, "resultsSourceMarker", locale, { n: String(kw.surfaces) })} · {ttf(TOOL_ID, "firstSeen", locale, { n: String(kw.minPosition) })}</span>
                          </span>
                        </span>
                        <span className={`hidden sm:inline-block text-[10px] font-mono font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border shrink-0 ${
                          kw.signalLevel === "high"
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                            : kw.signalLevel === "medium"
                            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                            : "text-text-disabled bg-surface-muted/40 border-border-light/40"
                        }`}>
                          {kw.signalLevel === "high"
                            ? tt(TOOL_ID, "signalHigh", locale, "High")
                            : kw.signalLevel === "medium"
                            ? tt(TOOL_ID, "signalMedium", locale, "Medium")
                            : tt(TOOL_ID, "signalLow", locale, "Low")}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-text-disabled shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>

                      {isOpen && (
                        <div className="px-4 sm:px-12 pb-4 -mt-1 space-y-3 bg-surface-muted/20">
                          <div className="flex flex-wrap gap-2 pt-2">
                            <span className={`inline-block text-[11px] font-mono font-bold uppercase tracking-wider rounded-full px-3 py-1 border ${
                              kw.signalLevel === "high"
                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                : kw.signalLevel === "medium"
                                ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                                : "text-text-disabled bg-surface-muted/40 border-border-light/40"
                            }`}>
                              {tt(TOOL_ID, "resultSignalLabel", locale)}: {kw.signalLevel === "high" ? tt(TOOL_ID, "signalHigh", locale, "High") : kw.signalLevel === "medium" ? tt(TOOL_ID, "signalMedium", locale, "Medium") : tt(TOOL_ID, "signalLow", locale, "Low")}
                            </span>
                            {isQuestion && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                                <Info className="w-3 h-3" />
                                {tt(TOOL_ID, "questionFromAutocomplete", locale)}
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-mono font-bold text-text-disabled uppercase tracking-wider mb-1.5">
                              {tt(TOOL_ID, "detailSources", locale, "Where it appeared")}
                            </p>
                            <ul className="space-y-1">
                              {kw.sources.map((s, i) => (
                                <li key={i} className="text-xs text-text-sub break-words">
                                  <span className="font-mono text-text-disabled">pos. {s.position}</span> — {s.label}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1 border-t border-border-light/40">
                            <button
                              onClick={() => toggleSelected(kw.text)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-border-light/70 bg-surface-muted/30 text-text-sub hover:border-brand-primary/40 hover:text-brand-primary transition-colors cursor-pointer"
                            >
                              {isSelected ? <X className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {isSelected ? tt(TOOL_ID, "clearSelection", locale) : tt(TOOL_ID, "detailAdd", locale, "Add to selection")}
                            </button>
                            <button
                              onClick={() => copyText(kw.text, "copyKeyword")}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors cursor-pointer"
                            >
                              {flash === "copyKeyword" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {tt(TOOL_ID, "copyKeyword", locale, "Copy")}
                            </button>
                            <button
                              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(kw.text)}`, "_blank", "noopener,noreferrer")}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-border-light/70 bg-surface-muted/30 text-text-sub hover:border-brand-primary/40 hover:text-brand-primary transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {tt(TOOL_ID, "resultYouTube", locale, "YouTube")}
                            </button>
                            <button
                              onClick={() => {
                                setSearchInput(kw.text);
                                runSearch(kw.text, marketId, true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-brand-primary/30 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 transition-colors cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              {tt(TOOL_ID, "resultExplore", locale, "Explore")}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {hiddenCount > 0 && (
              <div className="p-4 border-t border-border-light/50 text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 50)}
                  className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  {ttf(TOOL_ID, "showMore", locale, { n: String(hiddenCount) })}
                </button>
              </div>
            )}
          </div>

          {/* Title Ideas Tab Content */}
          {activeTab === "titles" && selectedKeywords.length > 0 && (
            <div className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h3 className="text-sm font-sans font-black uppercase text-text-main tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-brand-primary" />
                {tt(TOOL_ID, "titleIdeasLabel", locale)}
              </h3>
              <p className="text-xs text-text-muted">{tt(TOOL_ID, "titleIdeasNote", locale)}</p>
              <div className="space-y-3">
                {selectedKeywords.slice(0, 3).map((kw) => {
                  const ideas = generateTitleIdeas(kw.text);
                  return (
                    <div key={kw.text} className="p-4 rounded-xl border border-border-light bg-surface-muted/30 space-y-3">
                      <p className="text-sm font-semibold text-text-main">"{kw.text}"</p>
                      <div className="space-y-2">
                        {ideas.map((idea, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-base border border-border-light/50">
                            <span className="text-xs text-text-main break-words flex-1">{idea}</span>
                            <button
                              onClick={() => copyText(idea, "copyKeyword")}
                              className="p-1.5 rounded-lg border border-border-light/60 bg-surface-muted text-text-sub hover:text-brand-primary hover:border-brand-primary transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {onChangeView && (
                        <button
                          onClick={() => onChangeView({ type: "tool", id: "youtube-title-analyzer" })}
                          className="text-xs font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          {tt(TOOL_ID, "titleIdeasUseInAnalyzer", locale)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag builder */}
          <div className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-4">
            <h3 className="text-xs font-mono font-bold text-text-disabled uppercase tracking-wider flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-brand-primary" />
              {tt(TOOL_ID, "tagBuilderTitle", locale)}
            </h3>
            <p className="text-xs text-text-muted">{tt(TOOL_ID, "tagBuilderNote", locale)}</p>
            {selectedKeywords.length === 0 ? (
              <p className="text-xs text-text-muted">{tt(TOOL_ID, "noSelection", locale)}</p>
            ) : (
              <>
                <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/45 text-xs text-text-sub leading-relaxed break-words">{selectedTagString}</div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`font-mono text-xs ${selectedTagString.length > 500 ? "text-status-error font-bold" : "text-text-muted"}`}>
                    {ttf(TOOL_ID, "tagCharCount", locale, { count: String(selectedTagString.length) })}
                    {selectedTagString.length > 500 && <> · {tt(TOOL_ID, "tagOverLimit", locale)}</>}
                  </span>
                  <button
                    onClick={copyTags}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors cursor-pointer"
                  >
                    {flash === "copyTags" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {tt(TOOL_ID, "copyTags", locale, "Copy tags")}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tool chain - contextual next actions */}
          {(selectedKeywords.length > 0 || activeTab === "titles") && (
            <div className="bg-surface-base border border-brand-primary/20 p-6 rounded-2xl shadow-premium-sm space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Next steps
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onChangeView?.({ type: "tool", id: "youtube-title-analyzer" })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5" />
                  {tt(TOOL_ID, "useInTitleAnalyzer", locale)}
                </button>
                <button
                  onClick={() => onChangeView?.({ type: "tool", id: "youtube-description-formatter" })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light bg-surface-muted text-text-sub font-bold hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {tt(TOOL_ID, "useInDescriptionFormatter", locale)}
                </button>
                <button
                  onClick={() => onChangeView?.({ type: "tool", id: "youtube-thumbnail-preview" })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light bg-surface-muted text-text-sub font-bold hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  {tt(TOOL_ID, "previewThumbnail", locale)}
                </button>
              </div>
            </div>
          )}

          {/* Trust + privacy */}
          <div className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-3">
            <h3 className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {tt(TOOL_ID, "trustTitle", locale)}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">{tt(TOOL_ID, "trustBody", locale)}</p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-text-disabled">
              <span className="inline-flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5" />
                {tt(TOOL_ID, "trustSourceLine", locale)}
              </span>
              <span>·</span>
              <span>{ttf(TOOL_ID, "trustMarket", locale, { market: marketLabel })}</span>
              <span>·</span>
              <span>{tt(TOOL_ID, "trustProxyNote", locale)}</span>
            </div>
          </div>

          <div className="bg-surface-base border border-border-light p-6 rounded-2xl shadow-premium-sm space-y-3">
            <h3 className="text-xs font-mono font-bold text-text-disabled uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-primary" />
              {tt(TOOL_ID, "privacyTitle", locale)}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">{tt(TOOL_ID, "privacyBody", locale)}</p>
          </div>
        </motion.div>
      )}

      {/* History sidebar - only show when not idle */}
      {view !== "idle" && history.length > 0 && (
        <div className="fixed bottom-6 right-6 z-10 lg:static lg:relative lg:bottom-auto lg:right-auto lg:z-auto">
          <div className="bg-surface-base border border-border-light p-4 rounded-2xl shadow-premium-sm space-y-3 w-72 lg:w-auto">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-mono font-bold text-text-disabled uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-brand-primary" />
                {tt(TOOL_ID, "historyTitle", locale, "Recent searches")}
              </h4>
              <button
                onClick={clearHistoryLog}
                className="text-[10px] font-mono font-bold text-brand-primary hover:underline cursor-pointer"
              >
                {tt(TOOL_ID, "clearHistory", locale, "Clear")}
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[190px] overflow-y-auto pr-1">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onHistoryClick(item)}
                  className="w-full text-left text-xs py-2 px-3 rounded-lg border text-text-sub hover:border-brand-primary hover:bg-brand-primary-light/5 hover:text-brand-primary transition-all duration-100 flex items-center justify-between gap-2 cursor-pointer bg-surface-muted/50 border-border-light/60"
                >
                  <span className="truncate flex-1">{item}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};