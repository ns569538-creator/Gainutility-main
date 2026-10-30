/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ToolId, SEOMetadata, ViewState, RelatedTool } from "../types";
import { RatingSection } from "./RatingSection";
import { isRatableTool } from "../ratingsConfig";
import { onToolCompletionChange, isToolCompleted } from "../toolCompletion";
import { HomePage } from "./HomePage";
import { BlogPage } from "./BlogPage";
import { BlogArticlePage } from "./BlogArticlePage";
import { AboutPage } from "./AboutPage";
import { PrivacyPage } from "./PrivacyPage";
import { TermsPage } from "./TermsPage";
import { SecurityPage } from "./SecurityPage";
import { CookiePolicyPage } from "./CookiePolicyPage";
import { ContactPage } from "./ContactPage";
import { FaqPage } from "./FaqPage";
import { ChangelogPage } from "./ChangelogPage";
import { SiteAuditPage } from "./SiteAuditPage";
import { NotFoundPage } from "./NotFoundPage";
import { ToolsDirectory } from "./ToolsDirectory";
import { CommandPalette } from "./CommandPalette";
import { InstallGainUtility } from "./InstallGainUtility";
import { useInstallable } from "../hooks/useInstallable";
import { articleBySlug, hasLocalizedArticle } from "../blog/blogData";
import { toolsRegistry } from "../toolsRegistry";
import { 
  ToastNotification, 
  Toast, 
  Breadcrumbs,
  Card
} from "./Common";
import { getMergedSEO, buildPageMeta, buildWebSiteJsonLd, buildOrganizationJsonLd, buildAboutPageJsonLd, buildPageBreadcrumbJsonLd, buildFAQJsonLd, buildImageHubJsonLd, buildToolJsonLd, buildBlogPostingJsonLd, buildBlogCollectionJsonLd, buildHowToJsonLd, seoHubForTool, localizedCrumbPath } from "../seo/shared";
import { SEO_PAGE_MAP, localizedSeoEntry } from "../seo/seoPageContent";
import { TOOL_GUIDES } from "../seo/toolGuides";
import { COMPARISON_PAGE_MAP, CATEGORY_BEST_MAP } from "../seo/comparisonPages";
import { LIBRARY_PAGE_MAP } from "../seo/libraryPages";
import { getTranslatorPair, translatorPairPath } from "../seo/translatorPairs";
import { BRAND_NAME, OG_IMAGE_PATH, absoluteUrl, toolCanonicalUrl, SITE_URL } from "../site";
import { viewToPath, publicPathForView } from "../router";
import { buildHreflangForView, localizedToolSlug, applyLocale } from "../i18n";
import { DEFAULT_LOCALE, LOCALES, localeByCode } from "../i18n/locales";
import { localizedToolName } from "../i18n/slugs";
import { isLocalizedView } from "../i18n/pages";
import { toolLastUpdated } from "../changelogData";
import { getToolExternalNotice } from "../studioIcons";
import { CONTINUE_EDITING_TOOLS, WORKFLOW_GRAPH } from "./ContinueEditing";
import { pdfRelatedIdsFor } from "./pdf/PdfComponents";
import { t, tf } from "../i18n/ui";
import { getLocalizedSeo } from "../i18n/seo";
import { toolBodyOverlay } from "../i18n/toolBodies";
import { 
  Braces, 
  Type, 
  Palette, 
  Eye, 
  Binary, 
  Layers, 
  Sun, 
  Moon, 
  X, 
  HelpCircle,
  Code,
  ChevronDown,
  Check,
  Info,
  ChevronRight,
  PlayCircle,
  ArrowLeftRight,
  FileJson,
  QrCode,
  Maximize2,
  FileText,
  Shield,
  Lock,
  Table,
  DollarSign,
  Split,
  Receipt,
  BellRing,
  Globe,
  Calendar,
  Download,
  BookOpen,
  Search
} from "lucide-react";

// True on the very first client render (a.k.a. hydration): the server-rendered
// React tree (real Layout/Header/HomePage/BrowseStudio/FAQ/Footer from
// renderToString) is ALREADY present and matches what the client renders, so we
// skip the entrance fade on mount that would otherwise re-animate the homepage
// on a fresh load. Subsequent navigations still animate normally. This flag is
// true during BOTH the server render and the client hydration first render,
// which keeps the DOM identical across the hydration boundary.
let firstClientRender = true;

// Page-specific header copy overrides (H1 + the description under it). The
// tools registry stays the source of truth for nav/cards/search — this map
// only customizes the on-page tool header where required.
const TOOL_HEADER_COPY: Partial<Record<ToolId, { h1: string; desc: string }>> = {
  "background-remover": {
    h1: "Free AI Background Remover",
    desc: "Remove the background from an image directly in your browser. No account or upload required.",
  },
  "check-my-website": {
    h1: "Check My Website",
    desc: "Fetch any public URL and see SEO, technical, social, image, accessibility, performance and security findings with plain-English fixes.",
  },
  "launch-checklist": {
    h1: "Website Launch Checklist",
    desc: "Turn a live URL scan into a pre-launch gate: critical, important and optional items to clear before you go live.",
  },
  "stylish-name-generator": {
    h1: "Stylish Name & Nickname Generator",
    desc: "Create stylish versions of your name with curated Unicode styles, symbols and emojis. Choose a look, generate variations and copy the one you like.",
  },
  "favicon-generator": {
    h1: "Favicon Generator & App Icon Studio",
    desc: "Create crisp, recognizable favicons from images, initials, symbols, or emoji. Preview at 16px and export complete packages with .ico, Apple touch icons, and web manifest.",
  },
  "logo-maker": {
    h1: "Free Logo Maker",
    desc: "Create and customize a logo for your website, business, brand, or project. Choose typography, symbols, colors, and layouts, then export web-ready files.",
  },
  "exam-file-requirements": {
    h1: "Exam File Requirements",
    desc: "Check exam photo, signature and thumb impression requirements, then prepare and download application files to the correct size, dimensions and format.",
  },
  "merge-pdf": {
    h1: "Merge PDF Files Online Free",
    desc: "Combine multiple PDF documents into one single file right in your browser. Fast, processed on your device, zero server uploads, and no watermarks.",
  },
  "split-pdf": {
    h1: "Split PDF Files Online Free",
    desc: "Separate PDF pages or extract custom page ranges into new documents in your browser. Processed on your device, zero file uploads, and no watermarks.",
  },
};

interface LayoutProps {
  view: ViewState;
  locale: string;
  onChangeView: (view: ViewState, options?: { clickedElementId?: string }) => void;
  onChangeLocale: (locale: string, targetView: ViewState) => void;
  children: React.ReactNode;
  toasts: Toast[];
  onCloseToast: (id: string) => void;
  onAddToast: (msg: string, type: Toast["type"]) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  view,
  locale,
  onChangeView,
  onChangeLocale,
  children,
  toasts,
  onCloseToast,
  onAddToast
}) => {
  // The pre-paint script in index.html applies `.dark` before React boots, but
  // the server-rendered markup is always light, so the first render must start
  // at "light" to hydrate without a mismatch (React #418). The effect below
  // re-syncs to the stored / OS preference right after mount; only the toggle
  // icon is affected in the meantime.
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const externalNotice =
    view.type === "tool" ? getToolExternalNotice(view.id) : undefined;

  // Tracks whether the current tool has produced a result so the rating widget
  // stays out of the user's way until their task is complete.
  const [toolCompleted, setToolCompleted] = useState(
    view.type === "tool" && isToolCompleted(view.id)
  );

  // Re-sync completion state when navigating between tools.
  useEffect(() => {
    setToolCompleted(view.type === "tool" && isToolCompleted(view.id));
  }, [view]);

  // Live-update when a tool marks itself complete (module-level store).
  useEffect(() => {
    return onToolCompletionChange(() => {
      if (view.type === "tool") {
        setToolCompleted(isToolCompleted(view.id));
      }
    });
  }, [view]);

  // Watch the tool workspace for result surfaces (download buttons, success
  // chips, result cards). When one appears, the task is effectively done so
  // the bottom-of-page rating may be revealed. This is a fallback for tools
  // that don't go through usePostDownload (e.g. json-validator).
  useEffect(() => {
    if (view.type !== "tool") return;
    const workspace = document.getElementById(`tool-panel-${view.id}`)
      ?? document.getElementById("gainutility-live-workspace");
    if (!workspace) return;

    const RESULT_SELS = [
      "a[download]",
      "[data-tool-result]",
      '[class*="ready-to-download"]',
      '[aria-label*="result"]',
      '[role="status"]:has(> svg.text-status-success)',
    ];

    const hasResult = () => RESULT_SELS.some((s) => {
      try { return workspace.querySelector(s) !== null; } catch { return false; }
    });

    const check = () => { if (hasResult()) setToolCompleted(true); };

    const observer = new MutationObserver(check);
    observer.observe(workspace, { subtree: true, childList: true, attributes: true });
    check();
    return () => observer.disconnect();
  }, [view]);

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const langMenuRef = useRef<HTMLUListElement>(null);
  const langTriggerRef = useRef<HTMLButtonElement>(null);

  const { state: installState, requestInstall } = useInstallable();

  const switchLocale = (code: string) => {
    setLangOpen(false);
    setSidebarOpen(false);
    onChangeLocale(code, view);
  };

  // Header scroll state — hide on scroll down, show on scroll up
  const [headerHidden, setHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prevScrollY = useRef(0);
  const ticking = useRef(false);
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  useEffect(() => {
    prevScrollY.current = window.scrollY;
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const diff = currentY - prevScrollY.current;
          const atTop = currentY <= 0;
          const nearBottom = currentY + window.innerHeight >= document.documentElement.scrollHeight - 100;

          setIsScrolled(currentY > 12);

          // Keep the navbar visible while the mobile drawer is open so the
          // close button / navigation stays accessible.
          if (sidebarOpenRef.current) {
            setHeaderHidden(false);
          } else if (atTop || nearBottom) {
            setHeaderHidden(false);
          } else if (diff > 8) {
            setHeaderHidden(true);
          } else if (diff < -4) {
            setHeaderHidden(false);
          }

          prevScrollY.current = currentY;
          ticking.current = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show header when drawer opens so close button / nav stays accessible
  useEffect(() => {
    if (sidebarOpen) {
      setHeaderHidden(false);
    }
  }, [sidebarOpen]);
  
  const [language, setLanguage] = useState(locale.toUpperCase());
  useEffect(() => {
    setLanguage(locale.toUpperCase());
  }, [locale]);

  // Accordions open/close state — FAQ starts collapsed by default; its
  // content still lives in the DOM (hidden via class) so it matches the
  // FAQPage structured data.
  const [accordionOpen, setAccordionOpen] = useState({
    howToUse: false,
    examples: false,
    faq: false,
    privacy: false,
    troubleshooting: false
  });

  // Sync scroll and close menus on navigation
  const activeTool = view.type === "tool" ? (view.id as ToolId) : "json-validator";
  const onChangeTool = (id: ToolId, clickedElementId?: string) => onChangeView({ type: "tool", id }, { clickedElementId });

  const isLegacyTool = (id: ToolId) => {
    return id === "json-formatter" || id === "json-viewer" || id === "json-compare";
  };

  // Re-assert the DOM root class list after hydration (the pre-paint script
  // already applied it) and sync the toggle state, which hydrates as "light";
  // fall back to the OS preference when no explicit choice has ever been
  // stored.
  useEffect(() => {
    const savedTheme = localStorage.getItem("premium-suite-theme");
    const prefersDark =
      savedTheme === null &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || prefersDark;
    setTheme(shouldBeDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  // Close the mobile drawer / language menu on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setLangOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      const prevPad = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = prev;
        document.body.style.paddingRight = prevPad;
      };
    }
  }, [sidebarOpen]);

  // Focus management: move focus into the drawer on open, return to the
  // hamburger when it closes. Guarded by `drawerWasOpen` so focus is never
  // stolen on the first page load (which used to yank the viewport to the
  // header and drop the user's start position).
  const drawerWasOpen = useRef(false);
  useEffect(() => {
    if (sidebarOpen) {
      drawerWasOpen.current = true;
      // Small delay to let the drawer mount and animate
      const id = requestAnimationFrame(() => {
        drawerCloseRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    if (drawerWasOpen.current) {
      drawerWasOpen.current = false;
      hamburgerRef.current?.focus();
    }
  }, [sidebarOpen]);

  // Move focus into the language menu when it opens (Escape closes it via the
  // global handler above), so it is operable without a pointer. On close the
  // focused item is unmounted and focus falls back to <body>, so hand it back
  // to the trigger instead of losing the user's place in the header.
  useEffect(() => {
    if (!langOpen) return;
    const menu = langMenuRef.current;
    const target =
      menu?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]') ??
      menu?.querySelector<HTMLElement>('[role="menuitemradio"]');
    target?.focus();
    return () => {
      const active = document.activeElement;
      const trigger = langTriggerRef.current;
      if ((!active || active === document.body) && trigger?.isConnected) {
        trigger.focus();
      }
    };
  }, [langOpen]);

  // Keep Tab inside the open drawer. It declares aria-modal, so focus must not
  // escape into the page it covers.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const drawer = document.getElementById("mobile-nav-drawer");
      if (!drawer) return;
      const focusables = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? drawer.contains(active) : false;
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
  }, [sidebarOpen]);

  // Global keydown listeners for search focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === "INPUT" || 
                      activeElement?.tagName === "TEXTAREA" || 
                      activeElement?.getAttribute("contenteditable") === "true";
      
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === "/") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("premium-suite-theme", "dark");
      onAddToast("Switched to dark mode", "success");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("premium-suite-theme", "light");
      onAddToast("Switched to light mode", "success");
    }
  };

  const toolMetadata = {
    "json-validator": { category: "Developer Tools", update: "July 2026", icon: <Braces className="w-6 h-6 text-brand-primary" />, desc: "Validate JSON instantly with detailed error messages, line numbers, syntax highlighting, and local browser processing." },
    "json-beautifier": { category: "Developer Tools", update: "July 2026", icon: <FileJson className="w-6 h-6 text-brand-primary" />, desc: "Beautify and format JSON with customizable indentation. Features real-time syntax highlighting and offline processing." },
    "json-minifier": { category: "Developer Tools", update: "July 2026", icon: <Layers className="w-6 h-6 text-brand-primary" />, desc: "Remove unnecessary whitespace and compress JSON while preserving its structure. Fast, free and entirely offline." },
    "json-tree-viewer": { category: "Developer Tools", update: "July 2026", icon: <Eye className="w-6 h-6 text-brand-primary" />, desc: "Visualize JSON as an expandable tree structure. Expand, collapse, search parameters and copy JSON paths instantly." },
    "json-compare-diff": { category: "Developer Tools", update: "July 2026", icon: <ArrowLeftRight className="w-6 h-6 text-brand-primary" />, desc: "Compare two JSON files and highlight differences. Find added, removed, and modified values side-by-side with full confidentiality." },
    "json-to-csv": { category: "Developer Tools", update: "July 2026", icon: <Code className="w-6 h-6 text-brand-primary" />, desc: "Convert JSON data into downloadable CSV files. Supports flattening nested objects, column preview and custom delimiters." },
    "json-formatter": { category: "Developer Tools", update: "July 2026", icon: <Braces className="w-6 h-6 text-brand-primary" />, desc: "Beautify, format, minify, and validate JSON data instantly in your browser with high-contrast syntax highlighting and deep error tracing." },
    "json-viewer": { category: "Developer Tools", update: "July 2026", icon: <FileJson className="w-6 h-6 text-brand-primary" />, desc: "Explore, collapse, and traverse complex nested JSON structures. Search keys instantly, trace syntax hierarchies, and copy JSON paths directly." },
    "json-compare": { category: "Developer Tools", update: "July 2026", icon: <ArrowLeftRight className="w-6 h-6 text-brand-primary" />, desc: "Compare two JSON files recursively. Highlight differences, added keys, removed elements, or value updates side-by-side with full confidentiality." },
    "gradient-generator": { category: "Design Utilities", update: "July 2026", icon: <Palette className="w-6 h-6 text-brand-primary" />, desc: "Design multi-stop linear and radial gradients. Copy standard CSS or approximate Tailwind classes, randomize palettes, and export PNGs." },
    "contrast-checker": { category: "Design Utilities", update: "July 2026", icon: <Eye className="w-6 h-6 text-brand-primary" />, desc: "Evaluate background and foreground hex colors against WCAG AA & AAA standards. View simulated color blindness spectrums and apply automatic contrast fixes." },
    "base64-tool": { category: "Binary Utilities", update: "May 2026", icon: <Binary className="w-6 h-6 text-brand-primary" />, desc: "Convert text strings into clean binary-safe Base64 values. Features live auto-detection of encoded inputs and character counters." },
    "box-shadow-generator": { category: "Design Utilities", update: "September 2026", icon: <Layers className="w-6 h-6 text-brand-primary" />, desc: "Design box shadows and text shadows visually — layered presets, live preview, and copy-ready CSS." },
    "border-radius-generator": { category: "Design Utilities", update: "July 2026", icon: <Maximize2 className="w-6 h-6 text-brand-primary" />, desc: "Generate asymmetrical rounded corners and organic blobs using simple or elliptical border radius configurations." },
    "qr-code-generator": { category: "Developer Tools", update: "July 2026", icon: <QrCode className="w-6 h-6 text-brand-primary" />, desc: "Instantly create styled QR codes for URLs, WiFi, emails, and WhatsApp. Customize margins, robustness levels, and overlay logos." },
    "url-encoder-decoder": { category: "Developer Tools", update: "July 2026", icon: <ArrowLeftRight className="w-6 h-6 text-brand-primary" />, desc: "Encode or decode strings using RFC-compliant percent encoding. Features instant auto-detection of encoded sequences and full Unicode safety." },
    "html-entity-encoder": { category: "Developer Tools", update: "July 2026", icon: <Code className="w-6 h-6 text-brand-primary" />, desc: "Convert special characters or full Unicode text into secure HTML entity representations to prevent cross-site scripting vulnerabilities." },
    "merge-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Merge multiple PDF files into one. Drag and drop file orders visually and compile completely client-side in seconds." },
    "split-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Split continuous PDF pages by precise range, extract individual pages, or separate every page entirely." },
    "compress-images-inside-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Reduce PDF file size by compressing the images inside it — fully client-side, nothing uploaded." },
    "rotate-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Rotate specific or all pages of a PDF document instantly with real-time browser preview canvases." },
    "jpg-to-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Convert sequential JPG, JPEG, and PNG images into a clean, uniform PDF file with customizable layout margins." },
    "pdf-to-jpg": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Rasterize and convert individual pages of a PDF document into high-resolution downloadable JPG pictures." },
    "extract-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Isolate, extract, and compile specific sheets of a PDF document into a lightweight new file instantly." },
    "delete-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Discard unnecessary, duplicate, or blank sheets from your PDF documents securely in your local browser sandbox." },
    "rearrange-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Reorder page slots and organize continuous sheets with responsive visual move controls." },
    "protect-pdf": { category: "PDF Tools", update: "July 2026", icon: <FileText className="w-6 h-6 text-brand-primary" />, desc: "Add secure owner and opening passwords to safeguard confidential agreements and financial statements offline." },
    "csv-reconciliation": { category: "Productivity & Data", update: "August 2026", icon: <Table className="w-6 h-6 text-brand-primary" />, desc: "Reconcile two CSV/Excel spreadsheets locally, detect header keys, match changes, additions, and deletions." },
    "excel-formula-generator": { category: "Productivity & Data", update: "August 2026", icon: <Code className="w-6 h-6 text-brand-primary" />, desc: "Generate validated Excel & Google Sheets formulas from plain English descriptions with real-time syntax checking." },
    "billable-hours-calculator": { category: "Productivity & Data", update: "August 2026", icon: <DollarSign className="w-6 h-6 text-brand-primary" />, desc: "Calculate billable hours, rates, expenses, taxes, and generate clean professional invoice statements." },
    "pdf-difference-checker": { category: "PDF Tools", update: "August 2026", icon: <Split className="w-6 h-6 text-brand-primary" />, desc: "Compare two PDF documents, contracts, or quotations side-by-side and highlight critical changes and clauses." },
    "business-pdf-extractor": { category: "PDF Tools", update: "August 2026", icon: <Receipt className="w-6 h-6 text-brand-primary" />, desc: "Extract line items, financial totals, and metadata from PDF invoices and POs with arithmetic integrity checks." },
    "invoice-follow-up-tracker": { category: "Productivity & Data", update: "August 2026", icon: <BellRing className="w-6 h-6 text-brand-primary" />, desc: "Track accounts receivable aging, calculate overdue days, and generate 1-click tailored email reminders." },
    "font-detector": { category: "Design Utilities", update: "August 2026", icon: <Type className="w-6 h-6 text-brand-primary" />, desc: "Identify fonts from images using OCR, browse a curated Google Fonts catalog, preview fonts live, compare pairings, and copy ready-to-use CSS." },
    "linkedin-carousel-maker": { category: "Creator Studio", update: "August 2026", icon: <Layers className="w-6 h-6 text-brand-primary" />, desc: "Create, reorder, style and export multi-slide LinkedIn carousels in ZIP or PDF format." }
  };

  const getToolDisplayName = () => {
    const name = toolsRegistry[activeTool]?.name ?? "GainUtility";
    return localizedToolName(activeTool, locale, name) || name;
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          onAddToast("Direct link copied to clipboard!", "success");
        })
        .catch(() => {
          onAddToast("Failed to copy link.", "error");
        });
    }
  };

  const canonicalPath = publicPathForView(view, locale);
  const pageUrl = absoluteUrl(canonicalPath);
  const baseMetadata: SEOMetadata = getMergedSEO(activeTool);
  const bodyOverlay = view.type === "tool" ? toolBodyOverlay(activeTool, locale) : undefined;
  const metadata: SEOMetadata = React.useMemo(() => {
    if (!bodyOverlay) return baseMetadata;
    return {
      ...baseMetadata,
      privacyExplanation: bodyOverlay.privacyExplanation || baseMetadata.privacyExplanation,
      limitations: bodyOverlay.limitations || baseMetadata.limitations,
      faqs: bodyOverlay.faqs || baseMetadata.faqs,
      detailedContent: {
        ...baseMetadata.detailedContent,
        whatText: bodyOverlay.whatText || baseMetadata.detailedContent?.whatText,
        whyText: bodyOverlay.whyText || baseMetadata.detailedContent?.whyText,
        features: bodyOverlay.features || baseMetadata.detailedContent?.features,
        steps: bodyOverlay.steps || baseMetadata.detailedContent?.steps,
        examples: bodyOverlay.examples || baseMetadata.detailedContent?.examples,
        mistakes: bodyOverlay.mistakes || baseMetadata.detailedContent?.mistakes,
      },
    };
  }, [baseMetadata, bodyOverlay]);
  // Tools already offered by the embedded "Next step" handoff cards
  // (ContinueEditing). The related-tools grid below must not repeat them —
  // but ONLY on pages that actually render that handoff section. Gating on
  // WORKFLOW_GRAPH alone hid cards from the ~100 tools that never show a
  // handoff at all, shrinking the internal-link graph for nothing.
  const showsHandoff = view.type === "tool" && CONTINUE_EDITING_TOOLS.has(view.id);
  const workflowNextIds: ToolId[] = showsHandoff ? WORKFLOW_GRAPH[view.id] ?? [] : [];
  // Tools already listed by the PDF "Next Actions" section on merge/split PDF.
  const pdfNextIds = view.type === "tool" ? pdfRelatedIdsFor(view.id) : [];
  const relatedTools = (() => {
    const seen = new Set<string>();
    const out: RelatedTool[] = [];
    for (const tool of metadata?.related || []) {
      if (seen.has(tool.id)) continue;
      if (view.type === "tool" && tool.id === view.id) continue;
      if (workflowNextIds.includes(tool.id)) continue;
      if (pdfNextIds.includes(tool.id)) continue;
      seen.add(tool.id);
      out.push(tool);
    }
    return out;
  })();
  const locSeo = locale !== DEFAULT_LOCALE && view.type === "tool"
    ? getLocalizedSeo(activeTool, locale, toolsRegistry[activeTool]?.name ?? activeTool)
    : null;
  const registryMeta = toolsRegistry[activeTool];
  const currentInfo = {
    category:
      toolMetadata[activeTool]?.category ??
      registryMeta?.category ??
      "Tools",
    update: toolMetadata[activeTool]?.update,
    icon: toolMetadata[activeTool]?.icon ?? registryMeta?.icon,
    desc: bodyOverlay?.desc ?? registryMeta?.desc ?? toolMetadata[activeTool]?.desc ?? "",
  };

  // Optional per-tool H1/description override for the on-page header.
  const headerCopy = view.type === "tool" ? TOOL_HEADER_COPY[view.id] : undefined;

  // Crawlable SEO hub for the current tool, if one exists. Used so the
  // visible breadcrumb middle crumb points at the hub page instead of the
  // homepage (and never at a legacy /studios/* route that redirects).
  const hubLink = view.type === "tool" ? seoHubForTool(view.id) : null;

  // Contextual how-to guides for the active tool (campaign item B-01). Gated
  // to locales that actually carry the article, so the link never lands on an
  // untranslated URL.
  const toolGuides =
    view.type === "tool"
      ? (TOOL_GUIDES[view.id as ToolId] ?? []).filter((g) => {
          const article = articleBySlug(g.slug);
          return Boolean(article && hasLocalizedArticle(article, locale));
        })
      : [];

  // Sync scroll on change — always reveal the header on navigation so a
  // user landing on a new route is never greeted by a hidden navbar.
  useEffect(() => {
    setHeaderHidden(false);
    setAccordionOpen({
      howToUse: false,
      examples: false,
      faq: false,
      privacy: false,
      troubleshooting: false
    });
  }, [view]);

  // After the first (hydration) mount, entrance transitions are re-enabled.
  useEffect(() => {
    firstClientRender = false;
  }, []);

  // Handle SEO metadata, document titles and structured data per route.
  useEffect(() => {
    const htmlLang = localeByCode(locale)?.htmlLang ?? "en";
    document.documentElement.setAttribute("lang", htmlLang);

    // buildPageMeta is already locale-aware (localized slugs, canonicals,
    // localized SEO titles/descriptions/faqs for tools, locale-prefixed
    // canonicals for every other view).
    const meta = buildPageMeta(view, locale);
    let title = meta.title;
    let desc = meta.description;
    let canonicalUrl = meta.canonical;

    // Overrides for content hubs whose landing pages are English-authored but
    // whose canonical must self-reference this locale's URL — only when the view
    // is genuinely localized for this locale. Otherwise buildPageMeta's gated
    // canonical (an English path) survives, so a page never self-canonicals a
    // non-emitted localized URL.
    if (view.type === "seo-page") {
      const seoEntry = SEO_PAGE_MAP[view.id];
      if (seoEntry && isLocalizedView(view, locale)) {
        const locEntry = localizedSeoEntry(seoEntry, locale);
        title = locEntry.title;
        desc = locEntry.description;
        canonicalUrl = absoluteUrl(applyLocale(seoEntry.path, locale));
      }
    } else if (view.type === "translator-pair") {
      const pairEntry = getTranslatorPair(view.pair);
      if (pairEntry && isLocalizedView(view, locale)) {
        title = pairEntry.title;
        desc = pairEntry.description;
        canonicalUrl = absoluteUrl(applyLocale(translatorPairPath(pairEntry.slug), locale));
      }
    } else if (view.type === "comparison-page") {
      const compEntry = COMPARISON_PAGE_MAP[view.id];
      if (compEntry && isLocalizedView(view, locale)) {
        title = compEntry.title;
        desc = compEntry.description;
        canonicalUrl = absoluteUrl(applyLocale(compEntry.path, locale));
      }
    } else if (view.type === "category-best") {
      const bestEntry = CATEGORY_BEST_MAP[view.id];
      if (bestEntry && isLocalizedView(view, locale)) {
        title = bestEntry.title;
        desc = bestEntry.description;
        canonicalUrl = absoluteUrl(applyLocale(bestEntry.path, locale));
      }
    }

    document.title = title;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      let el = isProperty 
        ? document.querySelector(`meta[property="${name}"]`)
        : document.querySelector(`meta[name="${name}"]`);
        
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", name);
        } else {
          el.setAttribute("name", name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", desc);
    updateMeta("og:title", title, true);
    updateMeta("og:description", desc, true);
    updateMeta("og:type", meta.ogType, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:site_name", BRAND_NAME, true);
    updateMeta("og:locale", localeByCode(locale)?.ogLocale ?? "en_US", true);
    updateMeta("og:image", absoluteUrl(OG_IMAGE_PATH), true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", desc);
    updateMeta("twitter:image", absoluteUrl(OG_IMAGE_PATH));
    updateMeta("robots", meta.noindex ? "noindex, follow" : "index, follow");

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Reciprocal hreflang alternates for the genuinely-localized variants of
    // this view + x-default. Views without a real translation for a locale
    // (English-only legal pages, etc.) emit en + x-default only.
    // A noindex page never emits them — a cluster whose member is noindex can
    // be dropped for every other locale too.
    const contentForLocale = (code: string): string => viewToPath(view, code);
    const existingLinks = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
    existingLinks.forEach((l) => l.remove());
    if (!meta.noindex) {
      const hreflangs = buildHreflangForView(view, SITE_URL, contentForLocale);
      for (const h of hreflangs) {
        const link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", h.hreflang);
        link.setAttribute("href", h.href);
        document.head.appendChild(link);
      }
    }

    // Structured data per route — always derived from the route itself,
    // never from stored metadata breadcrumbs.
    let schemaJson: any[] | null = null;

    if (view.type === "home") {
      schemaJson = [
        buildWebSiteJsonLd(),
        buildOrganizationJsonLd(),
        buildFAQJsonLd(meta.faqs),
      ].filter(Boolean);
    } else if (view.type === "tool") {
      schemaJson = [
        buildToolJsonLd(view.id, locale),
        buildPageBreadcrumbJsonLd(meta),
        buildFAQJsonLd(locSeo ? locSeo.faqs : (metadata?.faqs ?? [])),
      ].filter(Boolean);
    } else if (view.type === "seo-page") {
      const seoEntry = SEO_PAGE_MAP[view.id];
      if (seoEntry) {
        const locEntry = localizedSeoEntry(seoEntry, locale);
        schemaJson = [
          buildPageBreadcrumbJsonLd(meta),
          buildFAQJsonLd(locEntry.faq),
          // The image hub renders its own curated inventory (ImageCategoryHub),
          // so it carries an extra CollectionPage/ItemList beyond breadcrumb+FAQ.
          view.id === "image" ? buildImageHubJsonLd(meta) : null,
        ].filter(Boolean);
      }
    } else if (view.type === "translator-pair") {
      const pairEntry = getTranslatorPair(view.pair);
      if (pairEntry) {
        schemaJson = [
          buildPageBreadcrumbJsonLd(meta),
          buildFAQJsonLd(pairEntry.faqs),
        ].filter(Boolean);
      }
    } else if (view.type === "comparison-page") {
      const compEntry = COMPARISON_PAGE_MAP[view.id];
      if (compEntry) {
        schemaJson = [
          buildPageBreadcrumbJsonLd(meta),
          buildFAQJsonLd(compEntry.faq),
        ].filter(Boolean);
      }
    } else if (view.type === "category-best") {
      const bestEntry = CATEGORY_BEST_MAP[view.id];
      if (bestEntry) {
        schemaJson = [
          buildPageBreadcrumbJsonLd(meta),
          buildFAQJsonLd(bestEntry.faq),
        ].filter(Boolean);
      }
    } else if (view.type === "blog-article") {
      const article = articleBySlug(view.slug);
      if (article) {
        const posting = buildBlogPostingJsonLd(view.slug, locale);
        schemaJson = [
          posting,
          buildHowToJsonLd(view.slug, locale),
          buildPageBreadcrumbJsonLd(meta),
        ].filter(Boolean);
      }
    } else if (view.type === "blog") {
      const collection = buildBlogCollectionJsonLd(locale);
      schemaJson = [
        collection,
        buildPageBreadcrumbJsonLd(meta),
      ].filter(Boolean);
    } else if (view.type === "about") {
      schemaJson = [
        buildAboutPageJsonLd(meta),
        buildPageBreadcrumbJsonLd(meta),
      ].filter(Boolean);
    } else if (view.type === "library-page") {
      const libEntry = LIBRARY_PAGE_MAP[view.id];
      if (libEntry) {
        schemaJson = [
          buildPageBreadcrumbJsonLd(meta),
          buildFAQJsonLd(meta.faqs),
        ].filter(Boolean);
      }
    } else if (!meta.noindex && meta.breadcrumb.length > 1) {
      schemaJson = [buildPageBreadcrumbJsonLd(meta)];
    }

    if (schemaJson) {
      let script = document.getElementById("seo-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("id", "seo-jsonld");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaJson, null, 2);
    } else {
      const script = document.getElementById("seo-jsonld");
      if (script) {
        script.remove();
      }
    }
  }, [view, metadata, locale, locSeo]);

  const viewKey = view.type + ("id" in view ? view.id : "") + ("slug" in view ? (view as { slug: string }).slug : "") + ("section" in view ? (view as { section: string }).section : "") + ("kind" in view ? (view as { kind: string }).kind : "");

  // Active secondary nav item (secondary destinations only — the homepage is
  // the tools hub).
  const activeNav =
    view.type === "blog" || view.type === "blog-article"
      ? "blog"
      : view.type === "about"
      ? "about"
      : view.type === "tools-directory"
      ? "tools"
      : view.type === "faq"
      ? "faq"
      : view.type === "home"
      ? "home"
      : null;

  const navItems: Array<{ key: string; label: string; href: string; onClick: () => void }> = [
    { key: "tools", label: t("allToolsTab", locale), href: publicPathForView({ type: "tools-directory" }, locale), onClick: () => onChangeView({ type: "tools-directory" }) },
    { key: "blog", label: t("navBlog", locale), href: publicPathForView({ type: "blog" }, locale), onClick: () => onChangeView({ type: "blog" }) },
    { key: "faq", label: t("navFaq", locale), href: publicPathForView({ type: "faq" }, locale), onClick: () => onChangeView({ type: "faq" }) },
    { key: "about", label: t("navAbout", locale), href: publicPathForView({ type: "about" }, locale), onClick: () => onChangeView({ type: "about" }) },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col transition-colors duration-200">
      
      {/* Skip link for keyboard & screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* 1. FIXED HEADER — Clean, integrated, premium GainUtility navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full box-border bg-bg-base/95 backdrop-blur-sm border-b transition-[transform,background-color,border-color] duration-200 ease-out ${
          isScrolled
            ? "border-border-subtle/80 bg-bg-base/90 backdrop-blur-md"
            : "border-divider"
        } ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        {/* gap-2 + the 16px container floor keep logo + all four controls
            (search, language, theme, menu) on screen at 320px; sm: restores
            the roomier desktop spacing. */}
        <div className="site-container h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Side Logo — aligned to the left edge of .site-container */}
          <div className="flex items-center shrink-0 min-w-0">
            <a
              className="flex min-w-10 items-center gap-2 sm:gap-2.5 cursor-pointer group select-none no-underline py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
              href={publicPathForView({ type: "home" }, locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "home" });
              }}
              aria-label="GainUtility home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" fill="none" role="img" aria-label="GainUtility logo" className="w-8 h-8 sm:w-8.5 sm:h-8.5 shrink-0 transition-opacity group-hover:opacity-90">
                <defs>
                  <linearGradient id="bg-grad" x1="110" y1="110" x2="1135" y2="1140" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#082B70"/>
                    <stop offset="0.55" stopColor="#06245F"/>
                    <stop offset="1" stopColor="#041C4D"/>
                  </linearGradient>
                  <linearGradient id="yellow-grad" x1="620" y1="450" x2="1040" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#FFC400"/>
                    <stop offset="1" stopColor="#FFB300"/>
                  </linearGradient>
                </defs>
                <rect x="86" y="99" width="1081" height="1042" rx="210" fill="url(#bg-grad)"/>
                <g fill="#FFFFFF">
                  <path d="M 633.0,407.0 L 579.0,385.0 L 532.0,375.0 L 470.0,373.0 L 428.0,379.0 L 376.0,395.0 L 344.0,410.0 L 317.0,426.0 L 275.0,459.0 L 243.0,493.0 L 213.0,538.0 L 192.0,589.0 L 182.0,638.0 L 181.0,688.0 L 189.0,736.0 L 208.0,784.0 L 235.0,824.0 L 270.0,858.0 L 295.0,875.0 L 319.0,887.0 L 353.0,899.0 L 403.0,907.0 L 448.0,906.0 L 489.0,898.0 L 519.0,887.0 L 565.0,860.0 L 600.0,830.0 L 598.0,816.0 L 599.0,713.0 L 539.0,761.0 L 485.0,792.0 L 465.0,799.0 L 437.0,804.0 L 399.0,802.0 L 373.0,794.0 L 351.0,782.0 L 338.0,772.0 L 315.0,746.0 L 305.0,727.0 L 298.0,706.0 L 294.0,675.0 L 295.0,649.0 L 300.0,623.0 L 308.0,600.0 L 332.0,559.0 L 368.0,522.0 L 393.0,505.0 L 415.0,494.0 L 444.0,485.0 L 470.0,481.0 L 527.0,483.0 L 570.0,496.0 L 590.0,507.0 L 615.0,527.0 L 695.0,454.0 L 674.0,434.0 Z"/>
                  <path d="M 385.0,685.0 L 388.0,691.0 L 617.0,691.0 L 621.0,695.0 L 633.0,734.0 L 656.0,769.0 L 685.0,794.0 L 705.0,804.0 L 722.0,809.0 L 722.0,616.0 L 719.0,610.0 L 712.0,605.0 L 462.0,605.0 L 450.0,615.0 Z"/>
                </g>
                <g fill="url(#yellow-grad)">
                  <path d="M 945.0,434.0 L 934.0,432.0 L 926.0,436.0 L 818.0,543.0 L 819.0,553.0 L 826.0,558.0 L 874.0,559.0 L 874.0,714.0 L 871.0,743.0 L 865.0,764.0 L 856.0,781.0 L 833.0,806.0 L 804.0,822.0 L 769.0,830.0 L 727.0,829.0 L 689.0,818.0 L 660.0,801.0 L 639.0,782.0 L 618.0,753.0 L 606.0,727.0 L 602.0,712.0 L 600.0,712.0 L 599.0,806.0 L 603.0,837.0 L 610.0,854.0 L 622.0,871.0 L 653.0,896.0 L 690.0,912.0 L 730.0,920.0 L 777.0,921.0 L 829.0,914.0 L 869.0,901.0 L 910.0,878.0 L 943.0,849.0 L 964.0,821.0 L 983.0,780.0 L 991.0,738.0 L 992.0,559.0 L 1043.0,558.0 L 1050.0,553.0 L 1051.0,543.0 Z"/>
                </g>
              </svg>
              <span className="hidden min-[360px]:inline font-sans font-bold text-[17px] sm:text-[18px] tracking-tight text-text-primary group-hover:text-primary transition-colors leading-none whitespace-nowrap">
                GainUtility
              </span>
            </a>
          </div>

          {/* Right Side: Nav links + Controls (stay together toward the right) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
            {/* Desktop & Tablet nav links — [All Tools] [Blog] [FAQ] [About] */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0"
              aria-label={t("navPrimary", locale)}
            >
              {navItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      item.onClick();
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-10 px-3.5 flex items-center justify-center rounded-lg text-[13.5px] lg:text-[14.5px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60 no-underline whitespace-nowrap ${
                      isActive
                        ? "text-text-primary font-semibold bg-surface-muted/75 dark:bg-surface-elevated"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-muted/35"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Controls: [Search] [🌐 EN ▾] [Dark Mode] [Mobile Hamburger] */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Visible search trigger — ⌘K alone hides the single most useful
                  entry point from anyone without a keyboard. */}
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex h-10 min-w-10 pl-3 pr-2 rounded-lg items-center gap-2 text-[13.5px] font-medium text-text-muted hover:text-text-primary hover:bg-surface-muted/50 border border-border-subtle/70 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={t("navSearch", locale)}
                title={t("navSearch", locale)}
              >
                <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline">{t("navSearch", locale)}</span>
                <kbd className="hidden lg:inline font-mono text-[10px] font-semibold text-text-muted border border-border-subtle/80 rounded px-1.5 py-0.5 leading-none">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-text-primary hover:bg-surface-muted/60 border border-border-subtle/70 cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={t("navSearch", locale)}
                title={t("navSearch", locale)}
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Language switcher */}
              <div className="relative">
                <button
                  type="button"
                  ref={langTriggerRef}
                  onClick={() => setLangOpen(!langOpen)}
                  className="h-10 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-muted/50 border border-border-subtle/70 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={t("switchLanguage", locale)}
                  title={t("switchLanguage", locale)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                >
                  <Globe className="w-4 h-4 shrink-0 text-text-muted" aria-hidden="true" />
                  {/* The locale code is the first thing to go on a phone —
                      globe + chevron keep the control 40px wide instead of 77,
                      which is what keeps the menu button on screen at 320px.
                      The label stays for assistive tech via aria-label. */}
                  <span className="hidden sm:inline font-mono text-[11px] font-semibold">
                    {locale.toUpperCase()}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {langOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setLangOpen(false)}
                      aria-hidden="true"
                    />
                    <ul
                      role="menu"
                      aria-label={t("language", locale)}
                      ref={langMenuRef}
                      className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[195px] bg-surface-base border border-border-default rounded-xl shadow-md py-1 max-h-[70vh] overflow-y-auto"
                    >
                      {LOCALES.map((l) => (
                        <li key={l.code} role="none">
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={locale === l.code}
                            onClick={() => {
                              switchLocale(l.code);
                              setLangOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 min-h-[44px] text-xs font-medium hover:bg-surface-muted/70 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              locale === l.code ? "text-brand-primary font-semibold" : "text-text-primary"
                            }`}
                          >
                            <span>{l.nativeLabel}</span>
                            {locale === l.code && <Check className="w-3.5 h-3.5 shrink-0 text-brand-primary" aria-hidden="true" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Dark Mode toggle — always accessible */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={theme === "dark"}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-muted/50 border border-border-subtle/70 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={theme === "light" ? t("switchDarkTheme", locale) : t("switchLightTheme", locale)}
                title={theme === "light" ? t("switchDarkTheme", locale) : t("switchLightTheme", locale)}
              >
                {theme === "light" ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Sun className="w-4 h-4" aria-hidden="true" />}
              </button>

              {/* Mobile menu button (< 768px) */}
              <button
                ref={hamburgerRef}
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-text-primary hover:bg-surface-muted/60 border border-border-subtle/70 md:hidden cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={sidebarOpen ? t("closeMenu", locale) : t("openMenu", locale)}
                aria-haspopup="dialog"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-nav-drawer"
              >
                {sidebarOpen ? <X className="w-5 h-5" aria-hidden="true" /> : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="flex flex-1 relative items-stretch pt-[72px]">
        
        {/* MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs md:hidden"
                aria-hidden="true"
              />

              {/* Mobile navigation panel */}
              <motion.aside
                id="mobile-nav-drawer"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-0 right-0 bottom-0 z-50 max-h-[90vh] bg-surface-base text-text-primary md:hidden flex flex-col rounded-t-2xl border-t border-border-subtle shadow-xl overflow-hidden"
                style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                aria-label={t("mobileNav", locale)}
                role="dialog"
                aria-modal="true"
              >
                {/* Grip handle */}
                <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                  <span className="w-10 h-1 rounded-full bg-border-default/60" aria-hidden="true" />
                </div>

                {/* Top header row */}
                <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b border-divider">
                  <span className="font-sans font-bold text-sm tracking-tight text-text-primary">GainUtility</span>
                  <button
                    ref={drawerCloseRef}
                    onClick={() => setSidebarOpen(false)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    aria-label={t("closeMenu", locale)}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Scrollable navigation contents */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-4">
                  {/* Primary navigation */}
                  <nav aria-label={t("navPrimary", locale)} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        setIsCommandPaletteOpen(true);
                      }}
                      className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 text-left text-text-secondary hover:bg-surface-muted/50 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Search className="w-4 h-4 shrink-0 text-brand-primary" aria-hidden="true" />
                      <span className="text-[15px] font-sans">{t("navSearch", locale)}</span>
                    </button>
                    {[
                      {
                        key: "tools",
                        label: t("allToolsTab", locale),
                        active: view.type === "tools-directory",
                        path: publicPathForView({ type: "tools-directory" }, locale),
                        action: () => onChangeView({ type: "tools-directory" }),
                      },
                      {
                        key: "blog",
                        label: t("navBlog", locale),
                        active: view.type === "blog" || view.type === "blog-article",
                        path: publicPathForView({ type: "blog" }, locale),
                        action: () => onChangeView({ type: "blog" }),
                      },
                      {
                        key: "faq",
                        label: t("navFaq", locale),
                        active: view.type === "faq",
                        path: publicPathForView({ type: "faq" }, locale),
                        action: () => onChangeView({ type: "faq" }),
                      },
                      {
                        key: "about",
                        label: t("navAbout", locale),
                        active: view.type === "about",
                        path: publicPathForView({ type: "about" }, locale),
                        action: () => onChangeView({ type: "about" }),
                      },
                    ].map((item) => (
                      <a
                        key={item.key}
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          item.action();
                          setSidebarOpen(false);
                        }}
                        aria-current={item.active ? "page" : undefined}
                        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer no-underline ${
                          item.active
                            ? "bg-surface-muted font-semibold text-text-primary"
                            : "text-text-secondary hover:bg-surface-muted/50 hover:text-text-primary"
                        }`}
                      >
                        <span className="text-[15px] font-sans">{item.label}</span>
                        {item.active && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />}
                      </a>
                    ))}
                  </nav>

                  {/* Appearance / Theme control row */}
                  <div className="pt-3 border-t border-divider">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-pressed={theme === "dark"}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg flex items-center justify-between text-left text-sm text-text-secondary hover:bg-surface-muted/50 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        {theme === "light" ? <Moon className="w-4 h-4 text-brand-primary" aria-hidden="true" /> : <Sun className="w-4 h-4 text-brand-primary" aria-hidden="true" />}
                        <span>{theme === "light" ? t("switchDarkTheme", locale) : t("switchLightTheme", locale)}</span>
                      </span>
                      <Check className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Trust & Legal Links */}
                  <div className="pt-3 border-t border-divider pb-4">
                    <div className="px-3.5 mb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                      {t("trustPrivacy", locale)}
                    </div>
                    <div className="flex flex-wrap gap-x-1 gap-y-1 text-[13px] text-text-secondary">
                      <a href={publicPathForView({ type: "privacy" }, locale)} onClick={(e) => { e.preventDefault(); setSidebarOpen(false); onChangeView({ type: "privacy" }); }} className="min-h-[44px] px-2.5 flex items-center hover:text-text-primary hover:underline underline-offset-4 cursor-pointer">{t("footerPrivacy", locale)}</a>
                      <a href={publicPathForView({ type: "terms" }, locale)} onClick={(e) => { e.preventDefault(); setSidebarOpen(false); onChangeView({ type: "terms" }); }} className="min-h-[44px] px-2.5 flex items-center hover:text-text-primary hover:underline underline-offset-4 cursor-pointer">{t("footerTerms", locale)}</a>
                      <a href={publicPathForView({ type: "security" }, locale)} onClick={(e) => { e.preventDefault(); setSidebarOpen(false); onChangeView({ type: "security" }); }} className="min-h-[44px] px-2.5 flex items-center hover:text-text-primary hover:underline underline-offset-4 cursor-pointer">{t("navSecurity", locale)}</a>
                      <a href={publicPathForView({ type: "contact" }, locale)} onClick={(e) => { e.preventDefault(); setSidebarOpen(false); onChangeView({ type: "contact" }); }} className="min-h-[44px] px-2.5 flex items-center hover:text-text-primary hover:underline underline-offset-4 cursor-pointer">{t("footerContact", locale)}</a>
                      <a href={publicPathForView({ type: "changelog" }, locale)} onClick={(e) => { e.preventDefault(); setSidebarOpen(false); onChangeView({ type: "changelog" }); }} className="min-h-[44px] px-2.5 flex items-center hover:text-text-primary hover:underline underline-offset-4 cursor-pointer">{t("footerChangelog", locale)}</a>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN WORKSPACE WRAPPER */}
        <main id="main-content" tabIndex={-1} className="site-container flex-1 py-6 sm:py-8 md:py-10 flex flex-col gap-6 sm:gap-8 md:gap-10 overflow-x-hidden focus:outline-none">
          <AnimatePresence>
            <motion.div
              key={viewKey}
              initial={firstClientRender ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-6 sm:gap-8 md:gap-10"
            >
            
            {view.type === "home" ? (
              <HomePage 
                onChangeView={onChangeView} 
                onAddToast={onAddToast} 
              />
            ) : view.type === "about" ? (
              <AboutPage onChangeView={onChangeView} />
            ) : view.type === "privacy" ? (
              <PrivacyPage onChangeView={onChangeView} />
            ) : view.type === "terms" ? (
              <TermsPage onChangeView={onChangeView} />
            ) : view.type === "security" ? (
              <SecurityPage onChangeView={onChangeView} />
            ) : view.type === "cookies" ? (
              <CookiePolicyPage onChangeView={onChangeView} />
            ) : view.type === "contact" ? (
              <ContactPage onChangeView={onChangeView} onAddToast={onAddToast} />
            ) : view.type === "faq" ? (
              <FaqPage onChangeView={onChangeView} />
            ) : view.type === "changelog" ? (
              <ChangelogPage onChangeView={onChangeView} />
            ) : view.type === "audit" ? (
              <SiteAuditPage onChangeView={onChangeView} onAddToast={onAddToast} />
            ) : view.type === "blog" ? (
              <BlogPage onChangeView={onChangeView} />
            ) : view.type === "blog-article" ? (
              (() => {
                const article = articleBySlug(view.slug);
                return article ? (
                  <BlogArticlePage article={article} onChangeView={onChangeView} />
                ) : (
                  <NotFoundPage onChangeView={onChangeView} />
                );
              })()
            ) : view.type === "notFound" ? (
              <NotFoundPage onChangeView={onChangeView} />
            ) : view.type === "tools-directory" ? (
              <ToolsDirectory onChangeView={onChangeView} />
            ) : view.type === "seo-page" || view.type === "translator-pair" || view.type === "comparison-page" || view.type === "category-best" || view.type === "color-studio" || view.type === "color-page" || view.type === "library-page" ? (
              // SEO content pages and the Color Studio render their own layouts (provided as children)
              <div className="flex-1 flex flex-col">{children}</div>
            ) : (
              <>
                {/* 2. COMPACT TOOL HEADER (Breadcrumb · Title · Description · Privacy) */}
                <header className="flex flex-col gap-2.5 sm:gap-3">
                  <Breadcrumbs paths={[
                    { name: t("crumbsHome", locale), active: false, href: publicPathForView({ type: "home" }, locale) },
                    ...(hubLink
                      ? [{
                          name: hubLink.label,
                          active: false,
                          href: absoluteUrl(localizedCrumbPath(locale, hubLink.path))
                        }]
                      : []),
                    { name: getToolDisplayName(), active: true }
                  ]} />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div 
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-primary-light flex items-center justify-center border border-brand-primary/10 shrink-0 text-brand-primary [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-[22px] sm:[&_svg]:h-[22px]"
                        style={{ viewTransitionName: `tool-icon-${activeTool}` }}
                      >
                        {currentInfo?.icon}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {/* H1 Semantic Title */}
                          <h1 
                            className="text-h1"
                            style={{ viewTransitionName: `tool-title-${activeTool}` }}
                          >
                            {locSeo?.h1 ?? (locale === DEFAULT_LOCALE ? headerCopy?.h1 : undefined) ?? getToolDisplayName()}
                          </h1>

                          {isLegacyTool(activeTool) && (
                            <span className="bg-status-error/10 text-status-error text-[9px] font-bold px-2 py-0.5 rounded-full border border-status-error/15 uppercase tracking-wider">
                              Legacy
                            </span>
                          )}
                        </div>

                        {/* Concise single-line description */}
                        <p className="text-sm sm:text-base text-text-sub max-w-[65ch] leading-relaxed">
                          {(locale === DEFAULT_LOCALE ? headerCopy?.desc : undefined) ?? currentInfo?.desc}
                        </p>
                      </div>
                    </div>

                    {/* Compact privacy/status indicator — stated once, quietly */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-[52px] sm:pl-[60px]">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <Shield className="w-3.5 h-3.5 shrink-0 text-brand-primary" />
                        {externalNotice ?? t("toolRunsLocally", locale)}
                      </span>
                      {view.type === "tool" &&
                        toolLastUpdated(view.id) && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-brand-primary" />
                            <span>
                              {t("lastUpdatedLabel", locale)}: {toolLastUpdated(view.id)!.label}
                            </span>
                            <a
                              href={publicPathForView({ type: "changelog" }, locale)}
                              onClick={(e) => {
                                e.preventDefault();
                                onChangeView({ type: "changelog" });
                              }}
                              className="gu-tap text-brand-primary hover:underline cursor-pointer gu-focus rounded-sm"
                            >
                              {t("lastUpdatedLink", locale)}
                            </a>
                          </span>
                        )}
                    </div>
                  </div>
                </header>

                {/* 4. MAIN TOOL INTERACTIVE WORKSPACE (Maximum Width!) */}
                <div className="flex flex-col gap-6" id="gainutility-live-workspace">
                  {children}
                </div>

                {/* 4b. ABOUT THIS TOOL — supporting explanatory copy kept below
                    the functional interface so the tool stays task-first. */}
                {(() => {
                  const dc = metadata?.detailedContent;
                  const hasAbout = Boolean(
                    dc?.whatText || dc?.whyText || (dc?.features || []).length > 0
                  );
                  if (!hasAbout) return null;
                  return (
                    <section
                      className="bg-surface-base border border-border-light rounded-[16px] sm:rounded-[18px] p-4 sm:p-5 md:p-6 shadow-premium-sm space-y-3 sm:space-y-4"
                      id="about-tool"
                      aria-labelledby="about-tool-heading"
                    >
                      <h2
                        id="about-tool-heading"
                        className="flex items-center gap-2.5 sm:gap-3 text-lg sm:text-xl md:text-2xl font-sans font-bold text-text-main tracking-tight"
                      >
                        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                        <span>{t("aboutTool", locale)}</span>
                      </h2>
                      <div className="space-y-3 max-w-[85ch]">
                        {dc?.whatText && (
                          <p className="text-xs sm:text-sm md:text-[15px] text-text-sub leading-relaxed">
                            {dc.whatText}
                          </p>
                        )}
                        {dc?.whyText && (
                          <p className="text-xs sm:text-sm md:text-[15px] text-text-sub leading-relaxed">
                            {dc.whyText}
                          </p>
                        )}
                      </div>
                      {(dc?.features || []).length > 0 && (
                        <div className="space-y-2.5 sm:space-y-3">
                          <h3 className="font-sans font-bold text-xs sm:text-sm text-text-main uppercase tracking-wider">
                            {t("keyCapabilities", locale)}
                          </h3>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            {(dc?.features || []).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-sub">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  );
                })()}

                {/* 5. COLLAPSIBLE ACCORDIONS BLOCK */}
                  <section className="space-y-3 sm:space-y-4" id="tool-documentation-accordions">
                  
                  {/* Accordion 1: How to Use */}
                  {(metadata?.detailedContent?.steps || []).length > 0 && (
                  <div className="bg-surface-base border border-border-light rounded-[18px] sm:rounded-[20px] overflow-hidden transition-all duration-200 shadow-premium-sm">
                    <button
                      onClick={() => setAccordionOpen(prev => ({ ...prev, howToUse: !prev.howToUse }))}
                      aria-expanded={accordionOpen.howToUse}
                      className="w-full flex items-center justify-between p-3.5 sm:p-5 md:p-6 text-left font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                        <span className="truncate">{t("howToUse", locale)}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted shrink-0 transition-transform duration-200 ${accordionOpen.howToUse ? "rotate-180 text-brand-primary" : ""}`} />
                    </button>
                    <div className={`p-3.5 sm:p-5 md:p-6 border-t border-border-light bg-background/20 ${accordionOpen.howToUse ? "animate-fade-in" : "hidden"}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
                          {(metadata?.detailedContent?.steps || []).map((step, idx) => (
                            <div key={idx} className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-[16px] bg-surface-base border border-border-light/60">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-primary-light text-brand-primary font-mono text-xs sm:text-sm font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>
                              <div className="space-y-1 sm:space-y-1.5">
                                <div className="font-sans font-black text-[10px] sm:text-[11px] text-text-main uppercase tracking-wider">
                                  {t("stepLabel", locale)} {idx + 1}
                                </div>
                                <p className="text-xs sm:text-sm md:text-[15px] text-text-sub leading-relaxed">{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accordion 2: Code & Usage Examples */}
                  {(metadata?.detailedContent?.examples || []).length > 0 && (
                    <div className="bg-surface-base border border-border-light rounded-[18px] sm:rounded-[20px] overflow-hidden transition-all duration-200 shadow-premium-sm">
                      <button
                        onClick={() => setAccordionOpen(prev => ({ ...prev, examples: !prev.examples }))}
                        aria-expanded={accordionOpen.examples}
                        className="w-full flex items-center justify-between p-3.5 sm:p-5 md:p-6 text-left font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <Code className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                          <span>{t("examples", locale)}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted shrink-0 transition-transform duration-200 ${accordionOpen.examples ? "rotate-180 text-brand-primary" : ""}`} />
                      </button>
                      <div className={`p-3.5 sm:p-5 md:p-6 border-t border-border-light bg-background/20 ${accordionOpen.examples ? "animate-fade-in" : "hidden"}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            {(metadata?.detailedContent?.examples || []).map((ex, idx) => (
                              <Card key={idx} title={ex.title} subtitle={ex.desc} className="bg-background">
                                <div className="relative group">
                                  <pre className="bg-[#1C2311]/95 dark:bg-[#0A0D05]/95 text-[#FAF8F1] p-4 sm:p-5 rounded-[12px] text-xs sm:text-sm font-mono overflow-x-auto select-all max-h-56 leading-relaxed">
                                    <code>{ex.code}</code>
                                  </pre>
                                  <button
                                    onClick={() => {
                                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                                        navigator.clipboard.writeText(ex.code);
                                        onAddToast("Example copied!", "success");
                                      }
                                    }}
                                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-surface-base hover:bg-surface-muted text-text-sub hover:text-text-main text-xs font-bold px-3 py-1.5 rounded-lg border border-border-light transition-opacity duration-150 cursor-pointer shadow-sm"
                                  >
                                    {t("copyExample", locale)}
                                  </button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                    </div>
                  )}

                  {/* Accordion 3: Privacy Sandbox & Technical Limitations */}
                  <div className="bg-surface-base border border-border-light rounded-[18px] sm:rounded-[20px] overflow-hidden transition-all duration-200 shadow-premium-sm">
                    <button
                      onClick={() => setAccordionOpen(prev => ({ ...prev, privacy: !prev.privacy }))}
                      aria-expanded={accordionOpen.privacy}
                      className="w-full flex items-center justify-between p-3.5 sm:p-5 md:p-6 text-left font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                        <span className="truncate">{t("privacyLimitations", locale)}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted shrink-0 transition-transform duration-200 ${accordionOpen.privacy ? "rotate-180 text-brand-primary" : ""}`} />
                    </button>
                    <div className={`p-3.5 sm:p-5 md:p-6 border-t border-border-light bg-background/20 space-y-4 sm:space-y-5 ${accordionOpen.privacy ? "animate-fade-in" : "hidden"}`}>
                        <div className="p-4 sm:p-5 rounded-[16px] bg-brand-primary-light/30 border border-brand-primary/15 flex items-start gap-3 sm:gap-4">
                          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h3 className="font-sans font-bold text-sm sm:text-base text-text-main">
                              {t("localProcessing", locale)}
                            </h3>
                            <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
                              {metadata?.privacyExplanation || "All parsing, conversions, and rendering run in your local browser memory. This tool does not send your files to GainUtility's servers; any external processing is disclosed in the tool itself."}
                            </p>
                          </div>
                        </div>

                        {(metadata?.limitations || []).length > 0 && (
                          <div className="space-y-2.5 sm:space-y-3">
                            <h3 className="font-sans font-bold text-xs sm:text-sm text-text-main uppercase tracking-wider">
                              {t("technicalConstraints", locale)}
                            </h3>
                            <ul className="space-y-2">
                              {(metadata?.limitations || []).map((lim, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-sub">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" />
                                  <span>{lim}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                  {/* Accordion 4: Troubleshooting Guide & Common Mistakes */}
                  {((metadata?.troubleshooting || []).length > 0 || (metadata?.detailedContent?.mistakes || []).length > 0) && (
                    <div className="bg-surface-base border border-border-light rounded-[18px] sm:rounded-[20px] overflow-hidden transition-all duration-200 shadow-premium-sm">
                      <button
                        onClick={() => setAccordionOpen(prev => ({ ...prev, troubleshooting: !prev.troubleshooting }))}
                        aria-expanded={accordionOpen.troubleshooting}
                      className="w-full flex items-center justify-between p-3.5 sm:p-5 md:p-6 text-left font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                        <span className="truncate">{t("troubleshooting", locale)}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted shrink-0 transition-transform duration-200 ${accordionOpen.troubleshooting ? "rotate-180 text-brand-primary" : ""}`} />
                    </button>
                    <div className={`p-3.5 sm:p-5 md:p-6 border-t border-border-light bg-background/20 space-y-4 sm:space-y-5 ${accordionOpen.troubleshooting ? "animate-fade-in" : "hidden"}`}>
                          {(metadata?.troubleshooting || []).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                              {(metadata?.troubleshooting || []).map((item, idx) => (
                                <div key={idx} className="p-4 sm:p-5 rounded-[16px] bg-surface-base border border-border-light space-y-2">
                                  <div className="font-sans font-bold text-xs sm:text-sm text-status-error flex items-center gap-2">
                                    <span>{t("problem", locale)}</span> {item.problem}
                                  </div>
                                  <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
                                    <strong className="text-text-main">{t("solution", locale)}</strong> {item.solution}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {(metadata?.detailedContent?.mistakes || []).length > 0 && (
                            <div className="space-y-2.5 sm:space-y-3">
                              <h3 className="font-sans font-bold text-xs sm:text-sm text-text-main uppercase tracking-wider">
                                {t("mistakesToAvoid", locale)}
                              </h3>
                              <ul className="space-y-2">
                                {(metadata?.detailedContent?.mistakes || []).map((mistake, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-sub">
                                    <span className="w-1.5 h-1.5 rounded-full bg-status-error shrink-0 mt-1.5" />
                                    <span>{mistake}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                    </div>
                  )}

                  {/* Accordion 5: Frequently Asked Questions */}
                  <div className="bg-surface-base border border-border-light rounded-[18px] sm:rounded-[20px] overflow-hidden transition-all duration-200 shadow-premium-sm">
                    <button
                      onClick={() => setAccordionOpen(prev => ({ ...prev, faq: !prev.faq }))}
                      aria-expanded={accordionOpen.faq}
                      className="w-full flex items-center justify-between p-3.5 sm:p-5 md:p-6 text-left font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                        <span className="truncate">{t("faqTitle", locale)} ({(locSeo ? locSeo.faqs : (metadata?.faqs || [])).length})</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted shrink-0 transition-transform duration-200 ${accordionOpen.faq ? "rotate-180 text-brand-primary" : ""}`} />
                    </button>
                    <div className={`p-3.5 sm:p-5 md:p-6 border-t border-border-light bg-background/20 ${accordionOpen.faq ? "animate-fade-in" : "hidden"}`}>
                        <div className="divide-y divide-border-light/60 flex flex-col gap-3 sm:gap-4">
                          {(locSeo ? locSeo.faqs : (metadata?.faqs || [])).map((faq, idx) => (
                            <div key={idx} className="pt-3 sm:pt-4 first:pt-0">
                              <details className="group cursor-pointer">
                                <summary className="flex items-center justify-between text-sm sm:text-base md:text-[18px] font-sans font-bold text-text-main hover:text-brand-primary transition-colors py-2 list-none">
                                  <span>{faq.question}</span>
                                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" />
                                </summary>
                                <p className="text-xs sm:text-sm md:text-[16px] text-text-sub mt-2 sm:mt-3 leading-relaxed bg-surface-base p-4 sm:p-5 md:p-6 rounded-[14px] sm:rounded-[16px] border border-border-light animate-fade-in pl-4 border-l-4 border-l-brand-primary">
                                  {faq.answer}
                                </p>
                              </details>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </section>

                {/* 6. RELATED TOOLS GRID — hidden entirely when every entry is
                    already offered by the embedded ContinueEditing handoff cards,
                    so a tool page never lists the same next step twice. */}
                {relatedTools.length > 0 && (
                <section className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 md:p-8 shadow-premium-sm flex flex-col gap-5 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4 text-text-main border-b border-divider pb-3 sm:pb-4">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-sans font-bold text-text-main tracking-tight">{t("relatedTools", locale)}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {relatedTools.map((tool, idx) => (
                      <a
                        key={idx}
                        id={`related-tool-${tool.id}`}
                        href={absoluteUrl(publicPathForView({ type: "tool", id: tool.id }, locale))}
                        onClick={(e) => {
                          e.preventDefault();
                          onChangeTool(tool.id, `related-tool-${tool.id}`);
                        }}
                        className="text-left p-4 sm:p-5 rounded-xl border border-border-subtle hover:border-border-hover hover:shadow-premium-md hover:-translate-y-0.5 bg-surface-base transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full min-h-[120px] gap-2"
                      >
                        <div className="flex items-start justify-between w-full gap-2">
                          <h3 className="text-base sm:text-lg lg:text-xl font-sans font-bold text-text-main group-hover:text-brand-primary transition-colors leading-snug">
                            {localizedToolName(tool.id, locale, tool.name) || tool.name}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                          {tool.description}
                        </p>
                      </a>
                    ))}
                  </div>
                  {view.type === "tool" && hubLink && (
                    <a
                      href={absoluteUrl(localizedCrumbPath(locale, hubLink.path))}
                      onClick={(e) => {
                        e.preventDefault();
                        onChangeView({ type: "seo-page", id: hubLink.path.replace(/^\//, "") });
                      }}
                      className="gu-tap mt-1 inline-flex items-center gap-2 text-sm font-sans font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors cursor-pointer"
                    >
                      {tf("browseAll", locale, { label: hubLink.label })}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </section>
                )}

                {/* 6b. GUIDES — contextual how-to articles for this tool.
                    `toolGuides` is already locale-gated, so every href points at
                    an article that exists in the reader's language. */}
                {view.type === "tool" && toolGuides.length > 0 && (
                  <section className="bg-surface-base border border-border-subtle rounded-2xl p-5 sm:p-6 md:p-8 shadow-premium-sm flex flex-col gap-5 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-text-main border-b border-divider pb-3 sm:pb-4">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                      <h2 className="text-lg sm:text-xl md:text-2xl font-sans font-bold text-text-main tracking-tight">{t("relatedGuides", locale)}</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted -mt-1">{t("relatedGuidesHint", locale)}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {toolGuides.map((g) => (
                        <a
                          key={g.slug}
                          id={`tool-guide-${g.slug}`}
                          href={absoluteUrl(publicPathForView({ type: "blog-article", slug: g.slug }, locale))}
                          onClick={(e) => {
                            e.preventDefault();
                            onChangeView({ type: "blog-article", slug: g.slug });
                          }}
                          className="text-left p-4 sm:p-5 rounded-xl border border-border-subtle hover:border-border-hover hover:shadow-premium-md hover:-translate-y-0.5 bg-surface-base transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full min-h-[120px] gap-2"
                        >
                          <div className="flex items-start justify-between w-full gap-2">
                            <h3 className="text-base sm:text-lg lg:text-xl font-sans font-bold text-text-main group-hover:text-brand-primary transition-colors leading-snug">
                              {g.title}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                            {g.desc}
                          </p>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* 7. FEEDBACK — optional, bottom-of-page, shown only after the
                    user has completed their task (one widget per tool page). */}
                {view.type === "tool" && isRatableTool(view.id) && toolCompleted && (
                  <div className="mt-2">
                    <RatingSection key={view.id} toolSlug={view.id} />
                  </div>
                )}

              </>
            )}
            
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* 8. FOOTER — GAINUTILITY */}
      <footer className="bg-surface-base border-t border-divider text-text-sub w-full">
        <div className="site-container py-10 sm:py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

            {/* Zone A — Product Identity */}
            <div className="md:col-span-5 space-y-4 max-w-xs">
              <a
                href={publicPathForView({ type: "home" }, locale)}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView({ type: "home" });
                }}
                className="flex min-h-10 items-center gap-2.5 cursor-pointer group no-underline"
                aria-label={t("guHome", locale)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" fill="none" aria-hidden="true" className="w-8 h-8 shrink-0">
                  <defs>
                    <linearGradient id="bg-grad-footer" x1="110" y1="110" x2="1135" y2="1140" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#082B70"/>
                      <stop offset="0.55" stopColor="#06245F"/>
                      <stop offset="1" stopColor="#041C4D"/>
                    </linearGradient>
                    <linearGradient id="yellow-grad-footer" x1="620" y1="450" x2="1040" y2="900" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#FFC400"/>
                      <stop offset="1" stopColor="#FFB300"/>
                    </linearGradient>
                  </defs>
                  <rect x="86" y="99" width="1081" height="1042" rx="210" fill="url(#bg-grad-footer)"/>
                  <g fill="#FFFFFF">
                    <path d="M 633.0,407.0 L 579.0,385.0 L 532.0,375.0 L 470.0,373.0 L 428.0,379.0 L 376.0,395.0 L 344.0,410.0 L 317.0,426.0 L 275.0,459.0 L 243.0,493.0 L 213.0,538.0 L 192.0,589.0 L 182.0,638.0 L 181.0,688.0 L 189.0,736.0 L 208.0,784.0 L 235.0,824.0 L 270.0,858.0 L 295.0,875.0 L 319.0,887.0 L 353.0,899.0 L 403.0,907.0 L 448.0,906.0 L 489.0,898.0 L 519.0,887.0 L 565.0,860.0 L 600.0,830.0 L 598.0,816.0 L 599.0,713.0 L 539.0,761.0 L 485.0,792.0 L 465.0,799.0 L 437.0,804.0 L 399.0,802.0 L 373.0,794.0 L 351.0,782.0 L 338.0,772.0 L 315.0,746.0 L 305.0,727.0 L 298.0,706.0 L 294.0,675.0 L 295.0,649.0 L 300.0,623.0 L 308.0,600.0 L 332.0,559.0 L 368.0,522.0 L 393.0,505.0 L 415.0,494.0 L 444.0,485.0 L 470.0,481.0 L 527.0,483.0 L 570.0,496.0 L 590.0,507.0 L 615.0,527.0 L 695.0,454.0 L 674.0,434.0 Z"/>
                    <path d="M 385.0,685.0 L 388.0,691.0 L 617.0,691.0 L 621.0,695.0 L 633.0,734.0 L 656.0,769.0 L 685.0,794.0 L 705.0,804.0 L 722.0,809.0 L 722.0,616.0 L 719.0,610.0 L 712.0,605.0 L 462.0,605.0 L 450.0,615.0 Z"/>
                  </g>
                  <g fill="url(#yellow-grad-footer)">
                    <path d="M 945.0,434.0 L 934.0,432.0 L 926.0,436.0 L 818.0,543.0 L 819.0,553.0 L 826.0,558.0 L 874.0,559.0 L 874.0,714.0 L 871.0,743.0 L 865.0,764.0 L 856.0,781.0 L 833.0,806.0 L 804.0,822.0 L 769.0,830.0 L 727.0,829.0 L 689.0,818.0 L 660.0,801.0 L 639.0,782.0 L 618.0,753.0 L 606.0,727.0 L 602.0,712.0 L 600.0,712.0 L 599.0,806.0 L 603.0,837.0 L 610.0,854.0 L 622.0,871.0 L 653.0,896.0 L 690.0,912.0 L 730.0,920.0 L 777.0,921.0 L 829.0,914.0 L 869.0,901.0 L 910.0,878.0 L 943.0,849.0 L 964.0,821.0 L 983.0,780.0 L 991.0,738.0 L 992.0,559.0 L 1043.0,558.0 L 1050.0,553.0 L 1051.0,543.0 Z"/>
                  </g>
                </svg>
                <span className="font-sans font-black text-base tracking-tight uppercase text-text-main group-hover:text-brand-primary transition-colors">
                  GainUtility
                </span>
              </a>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {t("footerBlurb", locale)}
              </p>
              <InstallGainUtility />
            </div>

            {/* Zone B — Explore */}
            <div className="md:col-span-3">
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold text-text-main uppercase tracking-wider font-mono">{t("explore", locale)}</h2>
                <ul className="space-y-2 text-xs sm:text-sm font-medium text-text-sub">
                  <li><a href={publicPathForView({ type: "about" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "about" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerAbout", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "faq" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "faq" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerFaq", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "home" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "home" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("browseTools", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "tools-directory" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "tools-directory" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("allToolsTab", locale)}</a></li>
                  <li><a href="/colors/red" onClick={(e) => { e.preventDefault(); onChangeView({ type: "color-page", kind: "color", id: "red" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">Named Colors</a></li>
                  <li><a href="/color-palettes/ocean-depths" onClick={(e) => { e.preventDefault(); onChangeView({ type: "color-page", kind: "palette", id: "ocean-depths" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">Color Palettes</a></li>
                  <li><a href={publicPathForView({ type: "blog" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "blog" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("navBlog", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "changelog" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "changelog" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerChangelog", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "security" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "security" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerSecurity", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "audit" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "audit" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerSiteAudit", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "privacy" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "privacy" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerPrivacy", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "terms" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "terms" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerTerms", locale)}</a></li>
                  <li><a href={publicPathForView({ type: "cookies" }, locale)} onClick={(e) => { e.preventDefault(); onChangeView({ type: "cookies" }); }} className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus">{t("footerCookies", locale)}</a></li>
                </ul>
              </div>
            </div>

            {/* Zone C — Support */}
            <div className="md:col-span-2">
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold text-text-main uppercase tracking-wider font-mono">{t("support", locale)}</h2>
                <ul className="space-y-2 text-xs sm:text-sm font-medium text-text-sub">
                  <li>
                    <a
                      href={publicPathForView({ type: "contact" }, locale)}
                      onClick={(e) => {
                        e.preventDefault();
                        onChangeView({ type: "contact" });
                      }}
                      className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus"
                    >
                      {t("footerContact", locale)}
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:support@gainutility.com?subject=Issue%20report%20-%20GainUtility"
                      className="text-text-sub hover:text-text-main hover:underline underline-offset-4 decoration-border-strong transition-colors cursor-pointer py-0.5 gu-focus"
                    >
                      {t("reportBug", locale)}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Zone D — Processing */}
            <div className="md:col-span-2">
              <div className="space-y-3">
                <h2 className="text-[11px] font-semibold text-text-main uppercase tracking-wider font-mono">{t("clientSide", locale)}</h2>
                <div className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-text-muted uppercase tracking-wide space-y-1">
                  <p>{t("runsInBrowser", locale)}</p>
                  <p>{t("noAccount", locale)}</p>
                  <p>{t("externalDisclosed", locale)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Copyright / Version bar */}
        <div className="max-w-[1400px] mx-auto border-t border-divider py-5 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] sm:text-xs text-text-disabled font-mono text-center sm:text-left">
          <span>GAINUTILITY / v4.5</span>
          <span>&copy; 2026 GainUtility</span>
        </div>
      </footer>

      <ToastNotification toasts={toasts} onClose={onCloseToast} />

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onChangeView={onChangeView} 
        locale={locale}
      />

    </div>
  );
};
