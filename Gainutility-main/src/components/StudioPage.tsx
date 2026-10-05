/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ViewState, ToolId } from "../types";
import { toolCanonicalUrl } from "../site";
import { STUDIOS } from "../studiosData";
import { Breadcrumbs } from "./Common";
import { toolsRegistry } from "../toolsRegistry";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";
import {
  ToolIcon,
  StudioIcon,
  normalizeBadge,
  isStatusBadge,
  LinkedInGlyph,
} from "../studioIcons";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  Star,
  ArrowLeft,
  ShieldCheck,
  History,
  XCircle,
  X,
  Youtube,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface ToolCardProps {
  tool: { name: string; desc: string; category: string; icon: React.ReactNode; badge?: string };
  toolId: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, toolId, onClick, onKeyDown }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="group gu-utility-card bg-surface-base border border-border-light hover:border-brand-primary p-5 rounded-xl cursor-pointer flex flex-col justify-between shadow-premium-sm"
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="gu-icon-tile w-10 h-10 rounded-lg bg-brand-primary-light/40 border border-brand-primary/10">
            <ToolIcon slug={toolId} size={21} />
          </div>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base md:text-lg font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            {tool.desc}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-sans font-bold text-brand-primary mt-4">
        <span>Open tool</span>
        <ArrowRight className="gu-arrow w-3.5 h-3.5" />
      </div>
    </div>
  );
};

interface StudioPageProps {
  studioId: string;
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}


export const StudioPage: React.FC<StudioPageProps> = ({ studioId, onChangeView, onAddToast }) => {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Advanced PDF Studio states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [favorites, setFavorites] = useState<ToolId[]>(() => {
    try {
      const stored = localStorage.getItem("pdf-studio-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [recentlyUsed, setRecentlyUsed] = useState<ToolId[]>(() => {
    try {
      const stored = localStorage.getItem("pdf-studio-recently-used");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Trigger loading state briefly on category or search changes for polished feel
  React.useEffect(() => {
    setIsSkeletonLoading(true);
    const timer = setTimeout(() => setIsSkeletonLoading(false), 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Ctrl + K key shortcut to focus search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFavorite = (toolId: ToolId, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let updated: ToolId[];
    if (favorites.includes(toolId)) {
      updated = favorites.filter(id => id !== toolId);
      onAddToast(t("removedFromFavoritesToast", locale), "info");
    } else {
      updated = [...favorites, toolId];
      onAddToast(t("addedToFavoritesToast", locale), "success");
    }
    setFavorites(updated);
    localStorage.setItem("pdf-studio-favorites", JSON.stringify(updated));
  };

  const recordRecentUse = (toolId: ToolId) => {
    setRecentlyUsed(prev => {
      const updated = [toolId, ...prev.filter(id => id !== toolId)].slice(0, 4);
      localStorage.setItem("pdf-studio-recently-used", JSON.stringify(updated));
      return updated;
    });
  };

  const launchTool = (toolId: ToolId) => {
    recordRecentUse(toolId);
    onChangeView({ type: "tool", id: toolId });
    const tool = toolsRegistry[toolId];
    if (tool) onAddToast(tf("launchToast", locale, { name: tool.name }), "success");
  };

  const handleCardKeyDown = (toolId: ToolId, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      launchTool(toolId);
    }
  };

  // Retrieve current Studio info
  const studio = useMemo(() => {
    return STUDIOS.find(s => s.id === studioId);
  }, [studioId]);

  if (!studio) {
    return (
      <div className="p-8 text-center space-y-4 bg-surface-base border border-border-light rounded-xl max-w-lg mx-auto">
        <Info className="w-12 h-12 text-status-warning mx-auto" />
        <h2 className="text-xl font-bold text-text-main">{t("studioNotFoundTitle", locale)}</h2>
        <p className="text-sm text-text-muted">{t("studioNotFoundBody", locale)}</p>
        <button
          onClick={() => onChangeView({ type: "home" })}
          className="px-4 py-2 bg-brand-primary text-[#FAF8F1] rounded-lg font-bold hover:bg-brand-primary-hover cursor-pointer whitespace-nowrap"
        >
          {t("goBackHome", locale)}
        </button>
      </div>
    );
  }

  // Filter tools of this studio based on search query, category, and favorites
  const filteredTools = useMemo(() => {
    let toolsList = studio.tools;
    if (studio.id === "pdf") {
      if (selectedCategory === "Favorites") {
        toolsList = studio.tools.filter(toolId => favorites.includes(toolId));
      } else if (selectedCategory !== "All") {
        toolsList = studio.tools.filter(toolId => {
          const tool = toolsRegistry[toolId];
          return tool && tool.category === selectedCategory;
        });
      }
    }

    return toolsList.filter(toolId => {
      const tool = toolsRegistry[toolId];
      if (!tool) return false;
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.desc.toLowerCase().includes(query)
      );
    });
  }, [studio.id, studio.tools, searchQuery, selectedCategory, favorites]);

  // Featured tools of this studio (first 2 popular tools) - disabled for Creator Studio to avoid duplicate display
  const featuredTools = useMemo(() => {
    if (studio.id === "creator") return [];
    return studio.tools.filter(toolId => {
      const tool = toolsRegistry[toolId];
      return tool && tool.badge;
    }).slice(0, 2);
  }, [studio.id, studio.tools]);

  // Localized label for the PDF studio category filter ids.
  const studioCategoryLabel = (cat: string): string => {
    const map: Record<string, string> = {
      "All": t("allToolsTab", locale),
      "Document Security": t("studioCategorySecurity", locale),
      "Organize PDF": t("studioCategoryOrganize", locale),
      "Convert PDF": t("studioCategoryConvert", locale),
      "Optimize": t("studioCategoryOptimize", locale),
      "Advanced": t("studioCategoryAdvanced", locale),
      "Favorites": t("studioCategoryFavorites", locale),
    };
    return map[cat] || cat;
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">

      {/* 1. BREADCRUMBS PATH */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm md:text-[16px] text-text-muted font-medium">
        <Breadcrumbs paths={[
          { name: t("crumbsHome", locale), active: false, onClick: () => onChangeView({ type: "home" }) },
          { name: t("crumbsStudios", locale), active: false, onClick: () => onChangeView({ type: "home" }) },
          { name: studio.name, active: true }
        ]} />
        <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono text-text-disabled uppercase">
          <Calendar className="w-4 h-4" /> {t("lastUpdatedDate", locale)}
        </div>
      </div>

      {/* 2. STUDIO HERO BOARD */}
      <section className="bg-surface-base border border-border-light rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 md:p-8 lg:p-10 shadow-premium-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-brand-primary-light flex items-center justify-center border border-brand-primary/10 shrink-0">
            <StudioIcon studioId={studio.id} size={32} />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="heading-h1 text-text-main text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">{studio.name}</h1>
              <span className="bg-brand-primary-light text-brand-primary text-[11px] sm:text-xs font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold border border-brand-primary/10 uppercase tracking-wider">
                {tf("activeUtilities", locale, { count: String(studio.tools.length) })}
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-text-sub leading-relaxed max-w-[76ch]">
              {studio.longDesc}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onChangeView({ type: "home" })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] h-11 sm:h-12 px-5 sm:px-6 rounded-xl border border-border-light bg-background hover:bg-surface-muted text-text-sub hover:text-brand-primary transition-all cursor-pointer text-xs sm:text-sm font-sans font-bold whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("returnHome", locale)}</span>
          </button>
        </div>
      </section>

      {/* 3. FEATURED TOOLS HIGHLIGHTS (If present) */}
      {featuredTools.length > 0 && searchQuery.trim() === "" && (
        <section className="space-y-4">
          <h2 className="heading-h3 text-text-main font-semibold text-lg md:text-xl">{t("featuredUtilities", locale)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTools.map(toolId => {
              const tool = toolsRegistry[toolId];
              if (!tool) return null;
              const normalizedBadge = normalizeBadge(tool.badge);
              return (
                <a
                  key={toolId}
                  href={toolCanonicalUrl(toolId)}
                  onClick={(e) => {
                    e.preventDefault();
                    launchTool(toolId);
                  }}
                  onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                  className="group gu-utility-card bg-surface-base border border-border-light hover:border-brand-primary/50 p-5 sm:p-6 rounded-lg cursor-pointer flex flex-col justify-between shadow-premium-sm"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="gu-icon-tile w-9 h-9 rounded-md">
                        <ToolIcon slug={toolId} size={21} />
                      </div>
                      {isStatusBadge(tool.badge) && normalizedBadge && (
                      <span className={`text-[9px] font-mono px-1.5 py-px rounded font-semibold uppercase tracking-wider border ${
                        normalizedBadge === "COMING SOON"
                          ? "text-text-muted border-border-light"
                          : "text-brand-primary border-brand-primary/30"
                      }`}>
                        {normalizedBadge}
                      </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base md:text-lg font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-[13px] text-text-muted leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-sans font-bold text-brand-primary mt-4">
                    <span>{t("openInteractiveWorkspace", locale)}</span>
                    <ChevronRight className="gu-arrow w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. ALL TOOLS GRID AND STUDIO SEARCH */}
      <section className="space-y-6">
        {/* PDF Studio Category Filter & Shortcuts Tip */}
        {studio.id === "pdf" && (
          <div className="space-y-4 bg-surface-muted/30 p-4 rounded-2xl border border-border-light/50">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1.5 bg-brand-primary-light/40 border border-brand-primary/10 px-3 py-1 rounded-md text-brand-primary font-mono font-semibold">
                <span>{t("keyboardShortcutPress", locale)}</span>
                <kbd className="px-1.5 py-0.5 bg-background border border-border-light rounded text-[10px] font-bold shadow-sm font-sans">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-background border border-border-light rounded text-[10px] font-bold shadow-sm font-sans">K</kbd>
                <span>{t("toSearchTools", locale)}</span>
              </div>
              {favorites.length > 0 && (
                <div className="text-text-sub font-medium flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {t("youHaveStarredPrefix", locale)}{" "}
                  <span className="text-brand-primary font-bold">{favorites.length}</span>{" "}
                  {favorites.length === 1 ? t("starredTool", locale) : t("starredTools", locale)}
                </div>
              )}
            </div>

            {/* Horizontal tab scroll bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "All", name: t("allToolsTab", locale), count: studio.tools.length },
                { id: "Document Security", name: t("catSecurity", locale), count: studio.tools.filter(t => toolsRegistry[t]?.category === "Document Security").length },
                { id: "Organize PDF", name: t("organizeTab", locale), count: studio.tools.filter(t => toolsRegistry[t]?.category === "Organize PDF").length },
                { id: "Convert PDF", name: t("convertTab", locale), count: studio.tools.filter(t => toolsRegistry[t]?.category === "Convert PDF").length },
                { id: "Optimize", name: t("optimizeTab", locale), count: studio.tools.filter(t => toolsRegistry[t]?.category === "Optimize").length },
                { id: "Advanced", name: t("advancedTab", locale), count: studio.tools.filter(t => toolsRegistry[t]?.category === "Advanced").length },
                { id: "Favorites", name: t("favoritesTab", locale), count: favorites.length }
              ].map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans font-bold transition-all whitespace-nowrap border cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-[3px] ${
                      isActive
                        ? "bg-brand-primary text-[#FAF8F1] border-brand-primary shadow-premium-sm"
                        : "bg-background border-border-light text-text-sub hover:bg-surface-muted hover:text-brand-primary"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-surface-muted text-text-muted"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PDF Studio Recently Used Section */}
        {studio.id === "pdf" && recentlyUsed.length > 0 && selectedCategory === "All" && searchQuery.trim() === "" && (
          <section className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-bold text-text-disabled uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-primary" /> {t("recentlyUsedTools", locale)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUsed.map(toolId => {
                const tool = toolsRegistry[toolId];
                if (!tool) return null;
                return (
                  <div
                    key={`recent-${toolId}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => launchTool(toolId)}
                    onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                    className="group gu-utility-card bg-surface-base border border-border-light/60 hover:border-brand-primary/50 p-4 rounded-xl cursor-pointer flex items-center justify-between shadow-premium-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="gu-icon-tile w-8 h-8 rounded-lg bg-brand-primary-light/40 flex items-center justify-center shrink-0">
                        <ToolIcon slug={toolId} size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors block leading-snug">
                          {tool.name}
                        </span>
                        <span className="text-[10px] text-text-muted block leading-snug">{tool.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="gu-arrow w-3.5 h-3.5 text-text-disabled group-hover:text-brand-primary shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-light pb-4">
          <h2 className="heading-h3 text-text-main font-semibold text-lg md:text-xl">
            {studio.id === "creator"
              ? searchQuery ? tf("matchingUtilities", locale, { count: String(filteredTools.length) }) : t("creatorStudioToolkit", locale)
              : studio.id === "pdf"
                ? selectedCategory === "All"
                  ? tf("allUtilities", locale, { count: String(filteredTools.length) })
                  : selectedCategory === "Favorites"
                    ? tf("starredUtilities", locale, { count: String(filteredTools.length) })
                    : tf("categoryUtilities", locale, { category: studioCategoryLabel(selectedCategory), count: String(filteredTools.length) })
                : searchQuery
                  ? tf("matchingSearchResults", locale, { count: String(filteredTools.length) })
                  : tf("allUtilities", locale, { count: String(filteredTools.length) })
          }
          </h2>
          <div className="relative w-full sm:w-72">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={tf("searchInside", locale, { studio: studio.name })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-base sm:text-xs rounded-lg bg-surface-base border border-border-light text-text-main outline-none h-10 focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label={t("clearSearch", locale)}
                className="absolute right-2.5 top-2.5 p-1 hover:bg-surface-hover rounded text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {studio.id === "creator" ? (
          <div className="space-y-12">

            {/* Studio Intro - no redundant heading, hero already has H1 */}
            <p className="text-sm md:text-base text-text-muted max-w-3xl leading-relaxed">
              Research, plan, package and publish better content.
            </p>

            {/* RESEARCH */}
            <section className="space-y-5" aria-labelledby="research-heading">
              <h2 id="research-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded p-1">
                  <Search className="w-5 h-5" />
                </span>
                RESEARCH
              </h2>

              {(() => {
                const researchTools = filteredTools.filter(id => 
                  ["youtube-keyword-explorer"].includes(id)
                );
                return researchTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {researchTools.map(toolId => {
                      const tool = toolsRegistry[toolId];
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={toolId}
                          tool={tool}
                          toolId={toolId}
                          onClick={() => launchTool(toolId)}
                          onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                        />
                      );
                    })}
                  </div>
                ) : null;
              })()}
            </section>

            {/* PLAN */}
            <section className="space-y-5" aria-labelledby="plan-heading">
              <h2 id="plan-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded p-1">
                  <Layers className="w-5 h-5" />
                </span>
                PLAN
              </h2>

              {(() => {
                const planTools = filteredTools.filter(id => 
                  ["youtube-title-analyzer", "youtube-description-formatter", "youtube-chapter-generator", "youtube-timestamp-formatter"].includes(id)
                );
                return planTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {planTools.map(toolId => {
                      const tool = toolsRegistry[toolId];
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={toolId}
                          tool={tool}
                          toolId={toolId}
                          onClick={() => launchTool(toolId)}
                          onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                        />
                      );
                    })}
                  </div>
                ) : null;
              })()}
            </section>

            {/* PACKAGE */}
            <section className="space-y-5" aria-labelledby="package-heading">
              <h2 id="package-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded p-1">
                  <Youtube className="w-5 h-5" />
                </span>
                PACKAGE
              </h2>

              {(() => {
                const packageTools = filteredTools.filter(id => 
                  ["youtube-thumbnail-preview", "thumbnail-safe-zone"].includes(id)
                );
                return packageTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {packageTools.map(toolId => {
                      const tool = toolsRegistry[toolId];
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={toolId}
                          tool={tool}
                          toolId={toolId}
                          onClick={() => launchTool(toolId)}
                          onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                        />
                      );
                    })}
                  </div>
                ) : null;
              })()}
            </section>

            {/* PUBLISH / SHARE */}
            <section className="space-y-5" aria-labelledby="publish-heading">
              <h2 id="publish-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded p-1">
                  <ExternalLink className="w-5 h-5" />
                </span>
                PUBLISH / SHARE
              </h2>

              {(() => {
                const publishTools = filteredTools.filter(id => 
                  ["youtube-embed-generator", "youtube-url-toolkit"].includes(id)
                );
                return publishTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {publishTools.map(toolId => {
                      const tool = toolsRegistry[toolId];
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={toolId}
                          tool={tool}
                          toolId={toolId}
                          onClick={() => launchTool(toolId)}
                          onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                        />
                      );
                    })}
                  </div>
                ) : null;
              })()}
            </section>

            {/* OTHER CREATOR */}
            <section className="space-y-5" aria-labelledby="other-creator-heading">
              <h2 id="other-creator-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400 rounded p-1">
                  <LinkedInGlyph className="w-5 h-5" />
                </span>
                OTHER CREATOR
              </h2>

              {(() => {
                const otherTools = filteredTools.filter(id => 
                  ["linkedin-carousel-maker", "slug-generator", "signature-maker"].includes(id)
                );
                return otherTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {otherTools.map(toolId => {
                      const tool = toolsRegistry[toolId];
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={toolId}
                          tool={tool}
                          toolId={toolId}
                          onClick={() => launchTool(toolId)}
                          onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                        />
                      );
                    })}
                  </div>
                ) : null;
              })()}
            </section>

            {/* Related tools in other studios - contextual cross-reference */}
            <section className="space-y-4" aria-labelledby="related-media-heading">
              <h2 id="related-media-heading" className="text-sm font-sans font-semibold text-text-main uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded p-1">
                  <Layers className="w-5 h-5" />
                </span>
                Image & Video Tools
              </h2>
              <p className="text-xs text-text-muted max-w-2xl">
                For photo/video workflows, these tools in other studios complement the Creator toolkit:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: "add-music-to-photo" as ToolId, studio: "media" },
                  { id: "photos-to-video" as ToolId, studio: "media" },
                  { id: "video-resizer" as ToolId, studio: "media" },
                  { id: "social-resizer" as ToolId, studio: "image" },
                  { id: "collage-maker" as ToolId, studio: "image" },
                  { id: "favicon-generator" as ToolId, studio: "image" },
                ].map(({ id, studio }) => {
                  const tool = toolsRegistry[id];
                  if (!tool) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onChangeView({ type: "studio", id: studio });
                        onAddToast(`Switched to ${studio === "media" ? "Media Studio" : "Image Studio"}`, "info");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onChangeView({ type: "studio", id: studio });
                        }
                      }}
                      className="group p-3 rounded-xl border border-border-light bg-surface-base hover:border-brand-primary hover:bg-brand-primary-light/5 transition-all text-left cursor-pointer flex items-center gap-3 shadow-premium-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-[3px]"
                    >
                      <div className="gu-icon-tile w-8 h-8 rounded-lg bg-brand-primary-light/40 border border-brand-primary/10 flex items-center justify-center shrink-0">
                        <ToolIcon slug={id} size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors block leading-snug truncate">
                          {tool.name}
                        </span>
                        <span className="text-[10px] text-text-muted block leading-snug truncate">
                          {tool.category}
                        </span>
                      </div>
                      <span className="text-xs font-sans font-bold text-brand-primary">Open</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Integrity & Transparency */}
            <div className="bg-surface-base border border-border-light rounded-[24px] p-6 md:p-8 shadow-premium-sm space-y-6">
              <div className="space-y-1.5 border-b border-border-light/40 pb-4">
                <h3 className="text-md font-sans font-semibold text-text-main uppercase tracking-wider">{t("integrityPolicy", locale)}</h3>
                <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                  {t("integrityPolicyBody", locale)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-surface-muted/30 rounded-xl border border-border-light/50 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {t("clientSide100", locale)}
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed font-medium">
                    {t("clientSide100Body", locale)}
                  </p>
                </div>
                <div className="p-4 bg-surface-muted/30 rounded-xl border border-border-light/50 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-500 uppercase">
                    {t("zeroUploads", locale)}
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed font-medium">
                    {t("zeroUploadsBody", locale)}
                  </p>
                </div>
                <div className="p-4 bg-surface-muted/30 rounded-xl border border-border-light/50 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-primary uppercase">
                    {t("honestLabels", locale)}
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed font-medium">
                    {t("honestLabelsBody", locale)}
                  </p>
                </div>
              </div>

              {/* Transparency Stamp */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-primary-light/30 border border-brand-primary/15 text-xs text-text-sub leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-text-main">{t("transparencyGuarantee", locale)}</p>
                  <p>
                    {t("transparencyGuaranteeBody", locale)}
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : isSkeletonLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-surface-base border border-border-light/40 p-6 rounded-xl space-y-4 min-h-[170px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted/60" />
                    <div className="w-16 h-4 bg-surface-muted/60 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-2/3 h-5 bg-surface-muted/80 rounded" />
                    <div className="w-full h-3 bg-surface-muted/60 rounded" />
                  </div>
                </div>
                <div className="w-24 h-4 bg-surface-muted/80 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(toolId => {
              const tool = toolsRegistry[toolId];
              if (!tool) return null;
              const isFav = favorites.includes(toolId);
              const normalizedBadge = normalizeBadge(tool.badge);
              return (
                <a
                  key={toolId}
                  href={toolCanonicalUrl(toolId)}
                  onClick={(e) => {
                    e.preventDefault();
                    launchTool(toolId);
                  }}
                  onKeyDown={(e) => handleCardKeyDown(toolId, e)}
                  className="group gu-utility-card bg-surface-base border border-border-light hover:border-brand-primary/50 p-4 sm:p-5 rounded-lg cursor-pointer flex flex-col justify-between shadow-premium-sm h-full min-h-[168px]"
                >
                  <div className="space-y-3.5 w-full">
                    <div className="flex items-start justify-between">
                      <div className="gu-icon-tile w-9 h-9 rounded-md">
                        <ToolIcon slug={toolId} size={19} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isStatusBadge(tool.badge) && (
                          <span className={`text-[9px] font-mono px-1.5 py-px rounded font-semibold uppercase tracking-wider border ${
                            normalizedBadge === "COMING SOON"
                              ? "text-text-muted border-border-light"
                              : "text-brand-primary border-brand-primary/30"
                          }`}>
                            {normalizedBadge}
                          </span>
                        )}
                        {studio.id === "pdf" && (
                          <button
                            onClick={(e) => toggleFavorite(toolId, e)}
                            className="p-1.5 rounded-lg hover:bg-surface-muted text-text-disabled hover:text-amber-500 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-[3px] cursor-pointer"
                            title={isFav ? t("removeFromFavorites", locale) : t("addToFavorites", locale)}
                            aria-pressed={isFav}
                            aria-label={tf(isFav ? "removeFromFavoritesName" : "addToFavoritesName", locale, { name: tool.name })}
                          >
                            <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-500" : ""}`} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[15px] md:text-base font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-[13px] text-text-muted leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-sans font-bold text-brand-primary mt-4">
                    <span>{tool.badge === "Coming Soon" ? t("moreInfo", locale) : t("launchUtility", locale)}</span>
                    <ChevronRight className="gu-arrow w-3.5 h-3.5" />
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-base border border-border-light rounded-xl space-y-2">
            <XCircle className="w-8 h-8 text-status-error/60 mx-auto" />
            <div className="font-sans font-bold text-sm text-text-main">{t("noMatchingTools", locale)}</div>
            <p className="text-xs text-text-muted max-w-sm mx-auto">{tf("noToolsInStudio", locale, { query: searchQuery })}</p>
          </div>
        )}
      </section>

      {/* 4.5 STUDIO BENEFITS & CORPORATE USE CASES */}
      {(studio.benefits || studio.useCases) && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-b border-border-light/50 py-10 my-2" aria-labelledby="benefits-title">
          {studio.benefits && (
            <div className="space-y-4">
              <h2 id="benefits-title" className="text-lg md:text-xl font-sans font-bold text-text-main">
                {t("keyBenefits", locale)}
              </h2>
              <ul className="space-y-4">
                {studio.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-text-sub leading-relaxed">
                    <span className="text-brand-primary font-bold font-mono text-base select-none mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {studio.useCases && (
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg md:text-xl font-sans font-bold text-text-main">
                {t("recommendedUseCases", locale)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {studio.useCases.map((uc, idx) => (
                  <div key={idx} className="p-6 bg-surface-muted/30 border border-border-light/60 rounded-2xl space-y-2">
                    <h3 className="font-sans font-bold text-sm md:text-base text-text-main">
                      {uc.title}
                    </h3>
                    <p className="text-xs md:text-sm text-text-sub leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. DOMAIN FAQ ACCORDIONS */}
      {studio.faqs.length > 0 && (
        <section className="bg-surface-base border border-border-light rounded-[24px] p-6 md:p-8 shadow-premium-sm space-y-6">
          <div className="space-y-1 border-b border-border-light/50 pb-3">
            <h2 className="heading-h3 text-text-main font-semibold text-lg md:text-xl">
              {tf("studioFaqs", locale, { studio: studio.name })}
            </h2>
            <p className="text-xs md:text-sm text-text-sub">
              {t("faqSubtitle", locale)}
            </p>
          </div>

          <div className="space-y-1">
            {studio.faqs.map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div key={idx} className="border-b border-border-light/50 last:border-b-0">
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                    id={`faq-button-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    className="w-full flex items-center justify-between gap-4 py-3 text-left text-sm md:text-base font-sans font-bold text-text-main hover:text-brand-primary transition-colors cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-[3px] rounded-md"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`gu-expanded w-4 h-4 text-text-muted shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-primary" : ""}`} />
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-button-${idx}`}
                    className={`gu-faq-panel ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs md:text-sm text-text-sub mt-2 mb-4 leading-relaxed bg-background p-4 rounded-lg border border-border-light border-l-4 border-l-brand-primary">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. RELATED WORKSPACES GRID */}
      <section className="space-y-4">
        <h2 className="heading-h3 text-text-main font-semibold text-lg md:text-xl">{t("relatedWorkspaces", locale)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {studio.relatedStudios.map(relId => {
            const relStudio = STUDIOS.find(s => s.id === relId);
            if (!relStudio) return null;
            return (
              <div
                key={relId}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onChangeView({ type: "studio", id: relId });
                  onAddToast(tf("switchedTo", locale, { studio: relStudio.name }), "info");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChangeView({ type: "studio", id: relId });
                    onAddToast(tf("switchedTo", locale, { studio: relStudio.name }), "info");
                  }
                }}
                className="p-5 rounded-xl border border-border-light hover:border-brand-primary bg-surface-base hover:bg-brand-primary-light/5 transition-all text-left cursor-pointer group flex items-center justify-between shadow-premium-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-[3px]"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-sans font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                    {relStudio.name}
                  </h3>
                  <p className="text-[11px] text-text-muted leading-tight">
                    {t("exploreNeighboring", locale)}
                  </p>
                </div>
                <ChevronRight className="gu-arrow w-4 h-4 text-text-muted" />
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};