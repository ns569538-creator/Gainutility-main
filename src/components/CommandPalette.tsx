import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  Layers, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Star, 
  X, 
  Palette,
  Shield,
  HelpCircle,
  Lock,
  GitCommitHorizontal
} from "lucide-react";
import { ToolId, ViewState } from "../types";
import { STUDIOS, COLLECTIONS } from "../studiosData";
import { SEARCH_INDEX, searchTools } from "../searchIndex";
import { getPopularToolIds } from "../data/popularTools";
import { SEO_PAGE_MAP } from "../seo/seoPageContent";
import { t as translate, tf } from "../i18n/ui";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeView: (view: ViewState) => void;
  locale?: string;
}

// Complete registry of ALL live tools, derived from the shared search index
const PALETTE_TOOLS: { id: ToolId; name: string; category: string; icon: React.ReactNode; desc: string; keywords: string[] }[] = SEARCH_INDEX.map(e => ({
  id: e.id,
  name: e.name,
  category: e.category,
  icon: e.icon,
  desc: e.desc,
  keywords: e.keywords,
}));

// Curated platform Guides and Trust Pages for command utility
const PALETTE_GUIDES = [
  { id: "site-audit", name: "Platform Quality Audit", category: "Platform Trust", icon: <Shield className="w-4 h-4" />, desc: "Inspect indexability, privacy benchmarks, and tool health audits across GainUtility.", target: "audit" },
  { id: "privacy-policy", name: "Privacy Policy", category: "Legal & Trust", icon: <Shield className="w-4 h-4" />, desc: "Read how files are processed in your browser and which tools call external services.", target: "privacy" },
  { id: "security-arch", name: "Client-Side Security Architecture", category: "Platform Trust", icon: <Lock className="w-4 h-4" />, desc: "How WebAssembly sandboxing keeps documents and keys isolated on your device.", target: "security" },
  { id: "cookie-policy", name: "Cookie & Local Storage Policy", category: "Legal & Trust", icon: <BookOpen className="w-4 h-4" />, desc: "Understand local storage keys used strictly for your preferences and state.", target: "cookies" },
  { id: "contact-support", name: "Contact & Bug Reports", category: "Platform Trust", icon: <HelpCircle className="w-4 h-4" />, desc: "Submit tool feedback or bug reports — your message opens pre-filled in your own mail app.", target: "contact" },
  { id: "changelog", name: "Product Changelog", category: "Platform Trust", icon: <GitCommitHorizontal className="w-4 h-4" />, desc: "Every real change that shipped to GainUtility, with honest dates.", target: "changelog" },
  { id: "guide-json", name: "What is JSON Compliance?", category: "Guides", icon: <BookOpen className="w-4 h-4" />, desc: "Understanding RFC-8259, single quotes restrictions and syntax trees.", target: "about" },
  { id: "guide-wcag", name: "WCAG Contrast Requirements Explained", category: "Guides", icon: <BookOpen className="w-4 h-4" />, desc: "Contrast ratio standards of 4.5:1 (AA) and 7:1 (AAA) for digital safety.", target: "about" }
];

// Popular quick action commands at the bottom
const QUICK_ACTIONS = [
  { id: "image-converter", name: "Convert to WebP" },
  { id: "merge-pdf", name: "Merge PDF" },
  { id: "json-beautifier", name: "Format JSON" },
  { id: "qr-code-generator", name: "Generate QR" },
  { id: "image-resizer", name: "Resize Image" }
];

// Collections → the crawlable category hub they belong to, so choosing one
// lands on a real page instead of silently returning to the homepage.
const COLLECTION_TO_CATEGORY: Record<string, string> = {
  "developer-kit": "dev",
  "design-kit": "css",
  "file-kit": "pdf",
  "utility-kit": "dev",
  "recently-added": "dev",
  "beginner-friendly": "json",
  "frontend-toolkit": "dev",
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onChangeView,
  locale = "en"
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Element that had focus before the dialog opened, restored on close so a
  // keyboard user is not dropped back at the top of the page.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Load recents & favorites from local storage when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      try {
        const recents = localStorage.getItem("gainutility-recent-searches");
        if (recents) setRecentSearches(JSON.parse(recents).slice(0, 4));
        
        const favs = localStorage.getItem("gainutility-favorites");
        if (favs) setFavorites(JSON.parse(favs));
      } catch (e) {
        // Ignore
      }
      // Apple Spotlight scale down back layer
      document.body.classList.add("command-palette-active");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.classList.remove("command-palette-active");
    }
    return () => {
      document.body.classList.remove("command-palette-active");
    };
  }, [isOpen]);

  // Focus memory: while the dialog is closed, remember whatever last received
  // focus; on close, hand focus back to it. Capturing at open time would be
  // too late — the input's autoFocus has already taken over by then.
  useEffect(() => {
    if (isOpen) {
      return () => {
        const target = returnFocusRef.current;
        if (target?.isConnected && target !== document.activeElement) {
          target.focus();
        }
      };
    }
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      // The input's autoFocus lands while the palette is opening, before this
      // effect has detached the listener — recording it would leave us trying
      // to restore focus to an element that is removed on close.
      if (target.closest('[role="dialog"]')) return;
      returnFocusRef.current = target;
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [isOpen]);

  // Keep Tab inside the open dialog (it declares aria-modal) while still
  // letting it move from the search field to the footer quick actions.
  // Result options are tabIndex={-1} per the ARIA combobox pattern, so the
  // trap only cycles through the input, the clear button and the footer.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? container.contains(active) : false;
      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Handle keyboard interaction
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Unified list of filtered and grouped results
  const filteredGroups = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Matched Tools (ranked via shared search index)
    const tools = searchTools(query).slice(0, 12).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      icon: e.icon,
      desc: e.desc,
      keywords: e.keywords
    }));

    // 2. Matched Studios
    const studios = STUDIOS.filter(s =>
      s.name.toLowerCase().includes(cleanQuery) ||
      s.desc.toLowerCase().includes(cleanQuery) ||
      s.longDesc.toLowerCase().includes(cleanQuery)
    ).map(s => ({
      id: s.id,
      name: s.name,
      category: "Studios",
      icon: <Sparkles className="w-4 h-4 text-brand-primary" />,
      desc: s.desc,
      type: "studio" as const
    }));

    // 3. Matched Collections
    const collections = COLLECTIONS.filter(c =>
      c.name.toLowerCase().includes(cleanQuery) ||
      c.tagline.toLowerCase().includes(cleanQuery) ||
      c.desc.toLowerCase().includes(cleanQuery)
    ).map(c => ({
      id: c.id,
      name: c.name,
      category: "Collections",
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      desc: c.tagline,
      type: "collection" as const
    }));

    // 4. Matched Guides
    const guides = PALETTE_GUIDES.filter(g =>
      g.name.toLowerCase().includes(cleanQuery) ||
      g.desc.toLowerCase().includes(cleanQuery)
    );

    const result = [];
    if (tools.length > 0) result.push({ title: "Tools", items: tools });
    if (studios.length > 0) result.push({ title: "Studios", items: studios });
    if (collections.length > 0) result.push({ title: "Collections", items: collections });
    if (guides.length > 0) result.push({ title: "Guides", items: guides });

    return result;
  }, [query]);

  // Flattened items for easy index-based arrow key navigation
  const flatItems = useMemo(() => {
    if (query) {
      return filteredGroups.flatMap(g => g.items);
    }

    // Default view: Pinned, Recents, and Popular actions
    const items: any[] = [];
    
    // Add pinned favorites if available
    const favoritedTools = PALETTE_TOOLS.filter(t => favorites.includes(t.id));
    if (favoritedTools.length > 0) {
      items.push(...favoritedTools.map(t => ({ ...t, displayGroup: "Favorites" })));
    }

    // Add recent searches mapped to actual tools if possible
    const recentTools = PALETTE_TOOLS.filter(t => 
      recentSearches.some(term => t.name.toLowerCase() === term.toLowerCase() || t.id === term)
    );
    if (recentTools.length > 0) {
      items.push(...recentTools.map(t => ({ ...t, displayGroup: "Recent Activity" })));
    } else if (recentSearches.length > 0) {
      // Plain text searches
      items.push(...recentSearches.map((term, index) => ({
        id: `recent-text-${index}`,
        name: term,
        category: "Recent Search",
        icon: <Clock className="w-4 h-4 text-text-muted" />,
        desc: "Search term query logs",
        displayGroup: "Recent Activity",
        isQueryText: true
      })));
    }

    // Curated popular tools as defaults (the index itself is alphabetical,
    // so slicing it would surface four random "A" tools, not popular ones).
    const defaults = getPopularToolIds()
      .map((id) => PALETTE_TOOLS.find(tool => tool.id === id))
      .filter((tool): tool is (typeof PALETTE_TOOLS)[number] => Boolean(tool))
      .slice(0, 4);
    items.push(...defaults.map(t => ({ ...t, displayGroup: "Popular Utilities" })));

    // Ensure they are unique by ID
    const seen = new Set();
    return items.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }, [query, filteredGroups, favorites, recentSearches]);

  // Arrow navigation & index limits
  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatItems.length);
      scrollSelectedIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
      scrollSelectedIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelectItem(flatItems[selectedIndex]);
      }
    }
    // Tab is deliberately NOT handled here: it is routed by the dialog-level
    // focus trap (above), which cycles input → footer quick actions → input.
  };

  const scrollSelectedIntoView = () => {
    setTimeout(() => {
      const activeEl = listRef.current?.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 10);
  };

  // Map a guide's `target` to a real view state.
const PALETTE_TARGETS: Record<string, ViewState> = {
  audit: { type: "audit" },
  privacy: { type: "privacy" },
  security: { type: "security" },
  cookies: { type: "cookies" },
  contact: { type: "contact" },
  changelog: { type: "changelog" },
};

// Navigating or launching action
  const handleSelectItem = (item: any) => {
    // Save to recents
    if (!item.isQueryText) {
      const updatedRecents = [item.name, ...recentSearches.filter(s => s !== item.name)].slice(0, 10);
      localStorage.setItem("gainutility-recent-searches", JSON.stringify(updatedRecents));
    }

    onClose();

    if (item.type === "studio") {
      // Studios are not routable views; land on the tools hub instead of
      // silently doing nothing.
      onChangeView({ type: "tools-directory" });
    } else if (item.type === "collection") {
      const hub = COLLECTION_TO_CATEGORY[item.id];
      if (hub && SEO_PAGE_MAP[hub]) {
        onChangeView({ type: "seo-page", id: hub });
      } else {
        onChangeView({ type: "tools-directory" });
      }
    } else if (item.category === "Guides") {
      onChangeView({ type: "about" });
      setTimeout(() => {
        const guideEl = document.getElementById("about-platforms-guidelines");
        if (guideEl) guideEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (item.target && PALETTE_TARGETS[item.target]) {
      onChangeView(PALETTE_TARGETS[item.target]);
    } else {
      // It's a standard tool!
      onChangeView({ type: "tool", id: item.id as ToolId });
    }
  };

  // Quick Action Buttons
  const triggerQuickAction = (id: string) => {
    onClose();
    onChangeView({ type: "tool", id: id as ToolId });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-10 lg:p-20 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={translate("navSearch", locale)}
    >
      {/* Backdrop glass blur overlay */}
      <div 
        className="fixed inset-0 bg-black/35 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Main command palette frame */}
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-[740px] bg-surface-base/90 dark:bg-surface-base/95 border border-border-light/80 dark:border-border-light/40 rounded-[20px] shadow-premium-lg flex flex-col max-h-[580px] overflow-hidden backdrop-blur-xl animate-scale-in outline-none transform-gpu"
        tabIndex={-1}
      >
        {/* Search header bar */}
        <div className="flex items-center gap-4 px-6 py-4.5 border-b border-border-light/60 dark:border-border-light/30 shrink-0">
          <Search className="w-5 h-5 text-brand-primary animate-pulse shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="flex-1 bg-transparent border-none text-text-main text-base font-medium outline-none placeholder:text-text-muted/60"
            placeholder={translate("searchTools", locale)}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-label={translate("searchTools", locale)}
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-autocomplete="list"
            aria-activedescendant={flatItems[selectedIndex] ? `cp-option-${selectedIndex}` : undefined}
            autoFocus
          />
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label={translate("clearSearch", locale)}
                title={translate("clearSearch", locale)}
                className="p-2 rounded-md hover:bg-surface-muted text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 border border-border-light bg-surface-muted px-1.5 rounded text-[10px] font-mono text-text-muted">
              <span>ESC</span>
            </kbd>
          </div>
        </div>

        {/* Dynamic results scroll viewport */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          aria-label={translate("searchTools", locale)}
          className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-border"
        >
          {query ? (
            /* Filtering Search Results */
            filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[11px] font-mono font-bold tracking-wider text-text-muted uppercase px-3 py-1 flex items-center justify-between">
                    <span>{group.title}</span>
                    <span className="text-[10px] lowercase font-normal">({group.items.length})</span>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const absoluteIndex = flatItems.indexOf(item);
                      const isSelected = selectedIndex === absoluteIndex;
                      return (
                        <button
                          key={item.id}
                          id={`cp-option-${absoluteIndex}`}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={-1}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                          data-active={isSelected}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group transition-all duration-150 relative cursor-pointer ${
                        isSelected 
                          ? "bg-brand-primary/[0.08] dark:bg-brand-primary/[0.12] border border-brand-primary/25 dark:border-brand-primary/20 shadow-sm" 
                          : "border border-transparent hover:bg-surface-muted/50"
                      }`}
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md transition-all duration-150 ${
                        isSelected ? "bg-brand-primary scale-y-100" : "bg-transparent scale-y-0"
                      }`} />

                      <div className={`p-2 rounded-lg transition-transform duration-150 shrink-0 ${
                        isSelected ? "bg-brand-primary/15 text-brand-primary scale-[1.05]" : "bg-surface-muted text-text-muted group-hover:scale-[1.03]"
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className={`font-sans font-semibold text-sm leading-snug ${
                          isSelected ? "text-text-main" : "text-text-main"
                        }`}>
                          {item.name}
                        </div>
                        <div className={`text-xs leading-snug mt-0.5 ${
                          isSelected ? "text-text-secondary" : "text-text-muted"
                        }`}>
                          {item.desc}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-1">
                        <span className={`hidden sm:inline text-[9px] font-mono font-bold px-2 py-0.5 border rounded uppercase max-w-[100px] truncate ${
                          isSelected 
                            ? "bg-brand-primary text-white border-brand-primary" 
                            : "bg-surface-muted text-text-muted border-border-light/60"
                        }`}>
                          {item.category.replace(" Studio", "")}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-all duration-150 ${
                          isSelected ? "text-brand-primary opacity-100 translate-x-0" : "text-text-disabled opacity-0 -translate-x-1"
                        }`} />
                      </div>
                    </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              /* Completely Empty Search View (with elegant suggestions) */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center border border-border-light animate-bounce-slow">
                  <Search className="w-7 h-7 text-text-disabled" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-base text-text-main">{translate("searchTools", locale)}</h3>
                  <p className="text-xs text-text-sub max-w-sm">{tf("noToolsMatch", locale, { query })}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center pt-2">
                  <span className="text-[11px] font-mono text-text-muted uppercase font-bold pr-2">Suggestions:</span>
                  {["Image", "PDF", "JSON", "Developer", "SEO"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs px-3 py-1 rounded-full border border-border-light bg-surface-base hover:bg-brand-primary-light/10 hover:text-brand-primary hover:border-brand-primary/20 transition-all cursor-pointer font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* Idle View: Recents, Favorites, and Categories */
            <div className="space-y-5">
              {flatItems.map((item, index) => {
                const groupTitle = item.displayGroup || "All Channels";
                const showGroupHeader = index === 0 || flatItems[index - 1].displayGroup !== groupTitle;
                const isSelected = selectedIndex === index;

                return (
                  <div key={item.id} className="space-y-1">
                    {showGroupHeader && (
                      <div className="text-[11px] font-mono font-bold tracking-wider text-text-muted uppercase px-3 py-1 flex items-center gap-1.5">
                        {groupTitle === "Favorites" ? <Star className="w-3.5 h-3.5 fill-brand-accent text-brand-accent shrink-0" /> : <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
                        <span>{groupTitle}</span>
                      </div>
                    )}
                    <button
                      id={`cp-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      data-active={isSelected}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group transition-all duration-150 relative cursor-pointer ${
                        isSelected 
                          ? "bg-brand-primary/[0.08] dark:bg-brand-primary/[0.12] border border-brand-primary/25 dark:border-brand-primary/20 shadow-sm" 
                          : "border border-transparent hover:bg-surface-muted/50"
                      }`}
                    >
                      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md transition-all duration-150 ${
                        isSelected ? "bg-brand-primary scale-y-100" : "bg-transparent scale-y-0"
                      }`} />

                      <div className={`p-2 rounded-lg transition-transform duration-150 shrink-0 ${
                        isSelected ? "bg-brand-primary/15 text-brand-primary scale-[1.05]" : "bg-surface-muted text-text-muted group-hover:scale-[1.03]"
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className={`font-sans font-semibold text-sm leading-snug ${
                          isSelected ? "text-text-main" : "text-text-main"
                        }`}>
                          {item.name}
                        </div>
                        <div className={`text-xs leading-snug mt-0.5 ${
                          isSelected ? "text-text-secondary" : "text-text-muted"
                        }`}>
                          {item.desc}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-1">
                        <span className={`hidden sm:inline text-[9px] font-mono font-bold px-2 py-0.5 border rounded uppercase max-w-[100px] truncate ${
                          isSelected 
                            ? "bg-brand-primary text-white border-brand-primary" 
                            : "bg-surface-muted text-text-muted border-border-light/60"
                        }`}>
                          {item.category.replace(" Studio", "")}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-all duration-150 ${
                          isSelected ? "text-brand-primary opacity-100 translate-x-0" : "text-text-disabled opacity-0 -translate-x-1"
                        }`} />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer command bar / Popular shortcuts */}
        <div className="bg-surface-muted/40 px-6 py-3 border-t border-border-light/60 dark:border-border-light/30 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">Quick Actions:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => triggerQuickAction(action.id)}
                  className="min-h-[36px] text-[12px] font-medium text-text-sub hover:text-brand-primary bg-surface-base border border-border-light/60 hover:border-brand-primary/40 px-3 py-1.5 rounded-md cursor-pointer transition-all"
                >
                  {action.name}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-text-muted">
            <span className="flex items-center gap-1">↑↓ <span className="lowercase">navigate</span></span>
            <span className="flex items-center gap-1">ENTER <span className="lowercase">open</span></span>
            <span className="flex items-center gap-1">ESC <span className="lowercase">close</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
