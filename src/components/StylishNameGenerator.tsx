/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, Check, Bookmark, BookmarkCheck, Trash2, Copy } from "lucide-react";
import { Card, Button, Input } from "./Common";
import { copyText } from "../lib/clipboard";
import { generateNames, MODES, type Mode } from "../stylishNames";

interface StylishNameGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const STORAGE_KEY = "gainutility:saved-names";
const MAX_INPUT = 60;
const SAMPLES = ["Luna", "Shadow", "Mochi"];

const loadSaved = (): string[] => {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
};

export const StylishNameGenerator: React.FC<StylishNameGeneratorProps> = ({ onAddToast }) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("stylish");
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>(loadSaved);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  }, [saved]);

  const results = useMemo(
    () => generateNames(input, mode, { seed, limit: 24 }),
    [input, mode, seed]
  );

  const trimmed = input.trim();

  const handleCopy = async (text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(text);
      window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600);
    } else {
      onAddToast("Copy blocked — select the text and copy it manually.", "error");
    }
  };

  const toggleSave = (text: string) => {
    setSaved((prev) => {
      if (prev.includes(text)) return prev.filter((s) => s !== text);
      onAddToast("Saved to your favorites.", "success");
      return [text, ...prev].slice(0, 60);
    });
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Input + mode + generate */}
      <Card
        title="Create a stylish name"
        subtitle="Type any name, pick a mood, then click a result to copy it."
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Name or nickname"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            placeholder="e.g. Luna, Shadow, Mochi…"
            maxLength={MAX_INPUT}
            id="stylish-name-input"
            autoComplete="off"
          />
          <div className="flex items-center justify-between -mt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono uppercase text-text-muted font-bold">Try:</span>
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-[8px] bg-surface-muted hover:bg-brand-primary-light/40 text-text-main hover:text-brand-primary transition-colors border border-border-light cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-text-muted">
              {input.length}/{MAX_INPUT}
            </span>
          </div>

          {/* Mode chips — horizontally scrollable on mobile */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-muted">
              Style mode
            </span>
            <div
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
              role="group"
              aria-label="Style mode"
              style={{ scrollbarWidth: "thin" }}
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] ${
                    mode === m.id
                      ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm"
                      : "bg-surface-base text-text-sub border-border-light hover:border-brand-primary/40 hover:text-brand-primary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => setSeed((s) => s + 1)}
              disabled={!trimmed}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Generate
            </Button>
            {seed > 0 && (
              <Button variant="outline" size="md" onClick={() => setSeed(0)} className="w-full sm:w-auto">
                Reset batch
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card
        title="Results"
        subtitle={
          trimmed
            ? "Curated Unicode styles — click any result to copy it."
            : "Your styled variations will appear here."
        }
      >
        <div aria-live="polite" className="sr-only">
          {copied ? "Copied" : ""}
        </div>
        {!trimmed ? (
          <div className="p-8 text-center text-text-muted font-sans border-2 border-dashed border-border-medium rounded-[16px] bg-background">
            Type a name above to see styled variations — bold, script, bubble, small-caps and more.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {results.map((r, idx) => {
              const isCopied = copied === r.text;
              const isSaved = saved.includes(r.text);
              const focal = idx === 0;
              return (
                <div
                  key={`${r.styleId}-${r.text}`}
                  className={`flex items-center gap-2 ${focal ? "sm:col-span-2 p-4" : "p-3.5"} bg-surface-muted/30 border rounded-xl transition-colors ${
                    isCopied
                      ? "border-status-success/40 bg-status-success/5"
                      : "border-border-light"
                  }`}
                >
                  <button
                    onClick={() => handleCopy(r.text)}
                    aria-label={`Copy ${r.text}`}
                    className="flex-1 min-w-0 text-left cursor-pointer group/copy"
                  >
                    <span className="text-[10px] font-mono uppercase text-text-muted block mb-0.5">
                      {r.styleName}
                    </span>
                    <span
                      className={`${focal ? "text-lg sm:text-xl" : "text-sm"} font-medium break-all transition-colors ${
                        isCopied ? "text-status-success" : "text-text-main group-hover/copy:text-brand-primary"
                      }`}
                    >
                      {r.text}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(r.text)}
                      aria-label={`Copy ${r.text}`}
                      className={`inline-flex items-center justify-center gap-1 min-h-[32px] px-2.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        isCopied
                          ? "text-status-success bg-status-success/10"
                          : "text-text-sub bg-surface-muted border border-border-light hover:text-brand-primary"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => toggleSave(r.text)}
                      aria-label={isSaved ? `Remove ${r.text} from favorites` : `Save ${r.text}`}
                      aria-pressed={isSaved}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
                        isSaved
                          ? "text-brand-primary bg-brand-primary-light/20"
                          : "text-text-muted hover:text-brand-primary hover:bg-surface-muted"
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Saved names */}
      <Card
        title="Saved names"
        subtitle={
          saved.length
            ? "Stored in this browser only — never uploaded."
            : "Save results you like and come back to them."
        }
      >
        {saved.length === 0 ? (
          <p className="text-sm text-text-muted">
            No saved names yet — click the bookmark icon on any result to keep it here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {saved.map((text) => (
              <span
                key={text}
                className={`inline-flex items-center gap-1 pl-3.5 pr-1.5 py-1.5 rounded-full border text-sm bg-surface-base transition-colors ${
                  copied === text
                    ? "border-status-success/40 text-status-success"
                    : "border-border-light text-text-main"
                }`}
              >
                <button
                  onClick={() => handleCopy(text)}
                  aria-label={`Copy ${text}`}
                  className="cursor-pointer break-all max-w-[220px] truncate text-left"
                >
                  {text}
                </button>
                <button
                  onClick={() => toggleSave(text)}
                  aria-label={`Remove ${text} from favorites`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-text-muted hover:text-status-error hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
