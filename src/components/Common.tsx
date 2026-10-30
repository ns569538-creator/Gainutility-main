/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Copy, 
  RotateCcw, 
  ChevronDown, 
  X, 
  AlertCircle, 
  Info, 
  FileUp,
  Download,
  Trash2
} from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { t, tf } from "../i18n/ui";
import { preparePushNavigation } from "../lib/navigationHistory";
import { pathToView, publicPathForView } from "../router";
import type { ViewState } from "../types";

/// --- BUTTON SYSTEM ---
interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onDragStart"
    | "onDragEnd"
    | "onDrag"
    | "onDragLeave"
    | "onDragOver"
    | "onDrop"
  > {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  isLoading,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const isButtonLoading = loading || isLoading || false;
  const baseStyle = "inline-flex items-center justify-center gap-2 font-sans font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer max-w-full align-middle";
  
  // Use CSS variables for consistent sizing across the design system
  const radiusMap = {
    sm: "var(--tool-btn-radius-sm)",
    md: "var(--tool-btn-radius-md)",
    lg: "var(--tool-btn-radius-lg)"
  };
  
  const heightMap = {
    sm: "var(--tool-btn-height-sm)",
    md: "var(--tool-btn-height-md)",
    lg: "var(--tool-btn-height-lg)"
  };
  
  const paddingXMap = {
    sm: "var(--tool-btn-padding-sm-x)",
    md: "var(--tool-btn-padding-md-x)",
    lg: "var(--tool-btn-padding-lg-x)"
  };
  
  const paddingYMap = {
    sm: "var(--tool-btn-padding-y-sm)",
    md: "var(--tool-btn-padding-y-md)",
    lg: "var(--tool-btn-padding-y-lg)"
  };
  
  const gapMap = {
    sm: "var(--tool-btn-gap-sm)",
    md: "var(--tool-btn-gap-md)",
    lg: "var(--tool-btn-gap-lg)"
  };

  const variants = {
    primary: "bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] dark:text-[#FAF8F1] shadow-premium-sm font-semibold",
    secondary: "bg-surface-muted hover:bg-surface-hover border border-border-subtle hover:border-border-default text-text-sub dark:text-text-main font-semibold",
    outline: "border border-border-default hover:border-border-hover bg-surface-base hover:bg-surface-muted text-text-main hover:text-brand-primary font-medium",
    ghost: "text-text-main hover:bg-surface-muted hover:text-brand-primary font-medium",
    danger: "bg-status-error hover:opacity-90 text-[#FAF8F1] shadow-premium-sm font-semibold",
    success: "bg-status-success hover:opacity-90 text-[#FAF8F1] shadow-premium-sm font-semibold"
  };

  const sizes = {
    sm: `px-[var(--tool-btn-padding-sm-x)] py-[var(--tool-btn-padding-y-sm)] text-sm min-h-[var(--tool-btn-height-sm)] rounded-[var(--tool-btn-radius-sm)] gap-[var(--tool-btn-gap-sm)]`,
    md: `px-[var(--tool-btn-padding-md-x)] py-[var(--tool-btn-padding-y-md)] text-[14px] sm:text-base min-h-[var(--tool-btn-height-md)] sm:min-h-[48px] lg:min-h-[50px] rounded-[var(--tool-btn-radius-md)] gap-[var(--tool-btn-gap-md)]`,
    lg: `px-[var(--tool-btn-padding-lg-x)] py-[var(--tool-btn-padding-y-lg)] text-[15px] sm:text-[16px] min-h-[var(--tool-btn-height-lg)] sm:min-h-[52px] lg:min-h-[56px] rounded-[var(--tool-btn-radius-lg)] gap-[var(--tool-btn-gap-lg)]`
  };

  // Standardize icon sizing - icons should be 18x18 for sm, 20x20 for md, 22x22 for lg
  const iconSizes = {
    sm: "w-4 h-4 sm:w-[18px] sm:h-[18px]",
    md: "w-5 h-5",
    lg: "w-5 h-5 sm:w-[22px] sm:h-[22px]"
  };

  const IconWrapper = ({ icon, className = "" }: { icon: React.ReactNode; className?: string }) => {
    const sizeValue = iconSizes[size];
    // Clone the icon element to enforce consistent sizing, overriding any hardcoded classes
    let enforcedIcon = icon;
    if (React.isValidElement(icon)) {
      const element = icon as React.ReactElement<{ className?: string }>;
      enforcedIcon = React.cloneElement(element, {
        className: `${sizeValue} ${element.props.className || ""}`,
      });
    }
    return (
      <span className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        {enforcedIcon}
      </span>
    );
  };

  return (
    <motion.button
      whileTap={disabled || isButtonLoading ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${
        variant === "success" && !isButtonLoading ? "animate-pulse-once" : ""
      } ${className}`}
      disabled={disabled || isButtonLoading}
      style={{
        borderRadius: radiusMap[size],
        height: heightMap[size],
        paddingLeft: paddingXMap[size],
        paddingRight: paddingXMap[size],
        paddingTop: paddingYMap[size],
        paddingBottom: paddingYMap[size],
        gap: gapMap[size]
      }}
      {...props}
    >
      {isButtonLoading && (
        <svg className="animate-spin flex-shrink-0 w-5 h-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isButtonLoading && leftIcon && <IconWrapper icon={leftIcon} />}
      <span className="truncate leading-normal flex-shrink min-w-0">{children}</span>
      {!isButtonLoading && rightIcon && <IconWrapper icon={rightIcon} />}
    </motion.button>
  );
};

// --- FORM INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  disabled,
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-[15px] sm:text-base font-semibold text-text-main font-sans">
          {label}
        </label>
      )}
      <input
        id={id}
        disabled={disabled}
        className={`w-full px-4 sm:px-5 text-base rounded-[14px] bg-surface-base border text-text-main placeholder-text-muted/60 placeholder:text-[15px] sm:placeholder:text-base transition-all duration-200 outline-none h-[48px] md:h-[52px] lg:h-[56px]
          ${error ? 'border-status-error focus:ring-2 focus:ring-status-error/20 animate-error-shake' : 'border-border-input hover:border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'}
          disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-status-error flex items-center gap-1 font-mono mt-0.5">
          <AlertCircle className="w-4 h-4" /> {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-text-muted mt-0.5">{helperText}</span>
      )}
    </div>
  );
};

// --- TEXTAREA ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  className = "",
  disabled,
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-[15px] sm:text-base font-semibold text-text-main font-sans">
          {label}
        </label>
      )}
      <textarea
        id={id}
        disabled={disabled}
        className={`w-full px-4 sm:px-5 py-4 text-base rounded-[14px] bg-surface-base border text-text-main placeholder-text-muted/60 placeholder:text-[15px] sm:placeholder:text-base transition-all duration-200 outline-none font-mono resize-y min-h-[200px] sm:min-h-[220px] leading-relaxed
          ${error ? 'border-status-error focus:ring-2 focus:ring-status-error/20 animate-error-shake' : 'border-border-input hover:border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'}
          disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-status-error flex items-center gap-1 font-mono mt-0.5">
          <AlertCircle className="w-4 h-4" /> {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-text-muted mt-0.5">{helperText}</span>
      )}
    </div>
  );
};

// --- SELECT DROPDOWN ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full relative">
      {label && (
        <label htmlFor={id} className="text-[15px] sm:text-base font-semibold text-text-main font-sans">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full appearance-none px-4 sm:px-5 pr-12 text-base rounded-[14px] bg-surface-base border text-text-main transition-all duration-200 outline-none cursor-pointer h-[48px] md:h-[52px] lg:h-[56px]
            ${error ? 'border-status-error focus:ring-2 focus:ring-status-error/20' : 'border-border-input hover:border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'}
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-muted">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
      {error && (
        <span className="text-sm text-status-error flex items-center gap-1 font-mono mt-0.5">
          <AlertCircle className="w-4 h-4" /> {error}
        </span>
      )}
    </div>
  );
};

// --- TOGGLE SWITCH ---
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  id
}) => {
  const locale = useLocale();
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label || t("toggle", locale)}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer select-none bg-transparent border-none p-0 min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
    >
      <span
        className={`w-12 h-6 rounded-full transition-colors duration-200 relative inline-block shrink-0 ${checked ? 'bg-brand-primary' : 'bg-border-medium'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 inline-block ${checked ? 'transform translate-x-6' : ''}`}
        />
      </span>
      {label && <span className="text-[15px] sm:text-base font-semibold text-text-main font-sans text-left">{label}</span>}
    </button>
  );
};

// --- TOAST CONTAINER & ACTIONS ---
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export const ToastNotification: React.FC<{
  toasts: Toast[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  const locale = useLocale();
  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 sm:max-w-sm"
      role="status"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            // Errors are announced assertively and persist until dismissed.
            {...(toast.type === "error" ? { role: "alert" as const } : {})}
            className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-md border shadow-premium-lg bg-surface-base ${
              toast.type === "success" ? "border-status-success/30 text-text-main" :
              toast.type === "error" ? "border-status-error/30 text-text-main" :
              toast.type === "warning" ? "border-status-warning/40 text-text-main" :
              "border-border-light text-text-main"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && <Check className="w-4 h-4 text-status-success" aria-hidden="true" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-status-error" aria-hidden="true" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-status-info" aria-hidden="true" />}
              {toast.type === "warning" && <AlertCircle className="w-4 h-4 text-status-warning" aria-hidden="true" />}
            </div>
            <div className="flex-1 text-[15px] sm:text-sm text-text-main font-medium leading-snug break-words min-w-0">
              {toast.message}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              aria-label={t("dismissNotification", locale)}
              className="-m-1.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-muted rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- CARD SYSTEM ---
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** When true the card body can be collapsed/expanded via a toggle in the header. */
  collapsible?: boolean;
  /** Controlled collapsed state (only used when `collapsible` is true). */
  collapsed?: boolean;
  /** Callback fired when the collapse toggle is clicked. */
  onToggleCollapse?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  extra,
  children,
  className = "",
  id,
  collapsible = false,
  collapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsible ? (collapsed ?? internalCollapsed) : false;
  const toggleCollapse = collapsible
    ? () => {
        if (onToggleCollapse) onToggleCollapse();
        else setInternalCollapsed(prev => !prev);
      }
    : undefined;

  const cardActions = actions || extra;
  return (
    <div
      id={id}
      className={`bg-surface-base border border-border-subtle rounded-[var(--tool-card-radius,20px)] shadow-premium-sm overflow-hidden flex flex-col transition-all duration-200 ${className}`}
    >
      {(title || subtitle || cardActions) && (
        <div
          className={`px-5 md:px-7 lg:px-9 py-4 md:py-6 flex flex-wrap justify-between items-center gap-4 bg-surface-base ${collapsible ? "select-none" : ""}`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {collapsible && (
              <button
                type="button"
                onClick={toggleCollapse}
                className="shrink-0 p-1.5 -ml-1 rounded-lg hover:bg-surface-muted text-text-muted hover:text-text-main transition-colors cursor-pointer"
                aria-label={isCollapsed ? "Expand settings" : "Collapse settings"}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}
                />
              </button>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-sans font-bold text-text-main text-lg md:text-[22px] leading-snug">{title}</h3>}
              {subtitle && <p className="text-[15px] md:text-[16px] text-text-muted mt-1.5 leading-relaxed">{subtitle}</p>}
            </div>
          </div>
          {cardActions && <div className="flex items-center gap-2">{cardActions}</div>}
        </div>
      )}
      {!isCollapsed && (
        <div className="p-5 md:p-7 lg:p-9 flex-1 flex flex-col gap-4">{children}</div>
      )}
    </div>
  );
};

// --- DRAG & DROP FILE CONTAINER ---
interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
  accept: string;
  label?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  accept,
  label,
  className = ""
}) => {
  const locale = useLocale();
  const uploadLabel = label || t("uploadFile", locale);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputId = useId();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileLoaded(event.target.result as string, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    e.target.value = "";
  };

return (
    <label
      htmlFor={inputId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`block border border-dashed border-border-subtle rounded-[20px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 text-center transition-all cursor-pointer min-h-[160px] ${
        isDragOver
          ? "border-brand-primary bg-brand-primary-light/40"
          : "hover:border-brand-primary hover:bg-surface-muted/30"
      } ${className}`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="sr-only"
        id={inputId}
        aria-label={uploadLabel}
      />
      <div className="pointer-events-none flex flex-col items-center gap-2">
        <FileUp className="w-8 h-8 text-text-muted hover:text-brand-primary transition-colors" />
        <div>
          <span className="text-base font-bold text-brand-primary font-sans">{uploadLabel}</span>
          <span className="text-xs text-text-muted block mt-1.5">{t("dropFileTapBrowse", locale)}</span>
        </div>
      </div>
    </label>
  );
};

// --- EMPTY STATE ---
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-5 md:p-9 lg:p-12 text-center border border-border-subtle rounded-[20px] bg-surface-base shadow-premium-sm gap-5">
      {icon && <div className="text-text-muted p-4 bg-background rounded-full">{icon}</div>}
      <div>
        <h4 className="font-sans font-semibold text-text-main text-lg sm:text-xl md:text-2xl">{title}</h4>
        <p className="text-[15px] sm:text-base text-text-muted mt-2 max-w-sm leading-relaxed">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// --- ACCORDION FOR FAQS ---
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export const Accordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="border border-border-subtle rounded-[20px] overflow-hidden bg-surface-base shadow-premium-sm">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-5 sm:px-7 py-4 sm:py-6 text-left flex justify-between items-center gap-4 font-sans font-bold text-base sm:text-lg md:text-[20px] text-text-main hover:text-brand-primary transition-colors cursor-pointer"
            >
              <span className="min-w-0 break-words">{item.title}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 text-text-muted transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-3 text-[15px] sm:text-base md:text-[17px] text-text-sub leading-relaxed bg-surface-muted/10">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// --- BREADCRUMBS ---
interface CrumbItem {
  name?: string;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  /** Root-relative SPA path (e.g. "/tools/merge-pdf"). Rendered as a real link. */
  href?: string;
  /**
   * Router view for this crumb. Preferred over a hand-written `href`: the URL
   * is resolved through `publicPathForView`, so the crumb link is localized
   * only when that view really exists in the reader's language.
   */
  view?: ViewState;
}

/** Navigate an SPA path using the History API and notify the router. */
const navigateHref = (href: string) => {
  try {
    const nextEntryId = preparePushNavigation();
    const route = pathToView(href);
    window.history.pushState({ view: route.view, guEntryId: nextEntryId }, "", href);
    window.dispatchEvent(new PopStateEvent("popstate", { state: { view: route.view, guEntryId: nextEntryId } }));
  } catch {
    window.location.href = href;
  }
};

export const Breadcrumbs: React.FC<{ paths?: CrumbItem[]; items?: CrumbItem[] }> = ({ paths, items }) => {
  const locale = useLocale();
  const list = paths || items || [];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  if (list.length === 0) return null;

  const crumbClass =
    "hover:text-brand-primary hover:underline transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded px-0.5";

  /**
   * One crumb, one markup rule: if it has an `href` it is ALWAYS a real
   * <a href>, with any caller `onClick` layered on top of it. Only crumbs with
   * no URL fall back to a <button>, and only the active page is a <span>.
   * This is what keeps breadcrumbs crawlable sitewide.
   */
  const renderCrumb = (p: CrumbItem, isLast: boolean) => {
    const text = p.name || p.label || "";
    const href =
      p.href ??
      (p.view && p.view.type !== "notFound" ? publicPathForView(p.view, locale) : undefined);
    if (!isLast && href) {
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            if (typeof p.onClick === "function") p.onClick();
            else navigateHref(href);
          }}
          className={crumbClass}
        >
          {text}
        </a>
      );
    }
    if (!isLast && typeof p.onClick === "function") {
      return (
        <button onClick={p.onClick} className={crumbClass}>
          {text}
        </button>
      );
    }
    return (
      <span
        className={`${isLast ? "text-brand-primary font-bold select-all" : "text-text-muted"} cursor-default`}
        {...(isLast ? { "aria-current": "page" } : {})}
      >
        {text}
      </span>
    );
  };

  // Determine items to render based on mobile collapse state
  const shouldCollapse = isMobile && list.length > 3 && !isExpanded;

  // NOTE: No BreadcrumbList JSON-LD here — structured data is emitted once
  // per route by Layout (see src/seo/shared.ts buildBreadcrumbJsonLd).

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-1.5 md:space-x-2 text-xs font-mono text-text-muted flex-wrap">
        <li className="flex items-center">
          <span className="text-text-disabled uppercase select-none text-[10px]">toolkit</span>
        </li>

        {shouldCollapse ? (
          <>
            {/* First Item (Home) */}
            <li className="flex items-center space-x-1.5 md:space-x-2">
              <span className="text-text-disabled select-none" aria-hidden="true">/</span>
              {renderCrumb(list[0], false)}
            </li>

            {/* Ellipsis Button */}
            <li className="flex items-center space-x-1.5 md:space-x-2">
              <span className="text-text-disabled select-none" aria-hidden="true">/</span>
              <button
                onClick={() => setIsExpanded(true)}
                title={t("expandBreadcrumbs", locale)}
                aria-label={t("expandCollapsedBreadcrumbs", locale)}
                className="hover:text-brand-primary bg-surface-muted hover:bg-brand-primary-light/10 text-text-sub hover:text-brand-primary transition-all cursor-pointer rounded px-1.5 py-0.5 text-xs font-bold font-mono focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
              >
                ...
              </button>
            </li>

            {/* Last Item (Active Page) */}
            <li className="flex items-center space-x-1.5 md:space-x-2">
              <span className="text-text-disabled select-none" aria-hidden="true">/</span>
              <span 
                className="text-brand-primary font-bold cursor-default select-all"
                aria-current="page"
              >
                {list[list.length - 1].name || list[list.length - 1].label}
              </span>
            </li>
          </>
        ) : (
          list.map((p, idx) => {
            const isLast = idx === list.length - 1;
            return (
              <li key={idx} className="flex items-center space-x-1.5 md:space-x-2">
                <span className="text-text-disabled select-none" aria-hidden="true">/</span>
                {renderCrumb(p, isLast)}
              </li>
            );
          })
        )}
      </ol>
    </nav>
  );
};

// --- SCROLL REVEAL SECTION ---
export const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; className?: string }> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- STAGGER CONTAINER & ITEMS FOR SECTIONS ---
export const StaggerContainer: React.FC<{ children: React.ReactNode; staggerChildren?: number; className?: string }> = ({
  children,
  staggerChildren = 0.04,
  className = ""
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = "",
  style
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// --- STATISTICS COUNTER-UP ENGINE ---
export const CounterUp: React.FC<{ value: number; duration?: number; suffix?: string; prefix?: string }> = ({
  value,
  duration = 1.2,
  suffix = "",
  prefix = ""
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <span className="font-mono font-bold">
      {prefix}{count}{suffix}
    </span>
  );
};

// --- PROCESSING STATE ---
interface ProcessingStateProps {
  message?: string;
  progress?: number; // 0-100, undefined for indeterminate
  className?: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  message,
  progress,
  className = ""
}) => {
  const locale = useLocale();
  const label = message || t("processing", locale);
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center gap-4 ${className}`} role="status" aria-live="polite">
      {progress !== undefined ? (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden border border-border-subtle/50">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-xs font-mono text-text-muted mt-2">{Math.round(progress)}%</p>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full border-[3px] border-border-subtle border-t-brand-primary animate-spin" />
      )}
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  );
};

// --- DOWNLOAD PANEL ---
interface DownloadItem {
  label: string;
  filename: string;
  blob: Blob;
  variant?: "primary" | "secondary";
}

interface DownloadPanelProps {
  items: DownloadItem[];
  onDownload?: (item: DownloadItem) => void;
  className?: string;
  fileSize?: string;
  successMessage?: string;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  items,
  onDownload,
  className = "",
  fileSize,
  successMessage
}) => {
  const locale = useLocale();
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});

  const handleDownload = (item: DownloadItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(prev => ({ ...prev, [item.filename]: true }));
    onDownload?.(item);
    setTimeout(() => {
      setDownloaded(prev => ({ ...prev, [item.filename]: false }));
    }, 3000);
  };

  if (items.length === 0) return null;

  return (
    <div className={`bg-surface-base border border-border-subtle rounded-[18px] p-5 md:p-6 shadow-premium-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans font-bold text-sm text-text-main">{t("fileIsReady", locale)}</h3>
        {fileSize && (
          <span className="text-xs font-mono text-text-muted">{tf("fileSizeLabel", locale, { size: fileSize })}</span>
        )}
      </div>
<div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={item.filename}
            onClick={() => handleDownload(item)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans font-bold text-sm transition-all duration-200 cursor-pointer min-h-[44px] w-full sm:w-auto whitespace-nowrap ${
              item.variant === "secondary"
                ? "bg-surface-muted hover:bg-surface-hover border border-border-card text-text-main hover:text-brand-primary"
                : "bg-brand-primary hover:bg-brand-primary-hover text-[#FAF8F1] shadow-premium-sm hover:shadow-premium-md"
          } ${downloaded[item.filename] ? "animate-pulse-once" : ""}`}
          >
            {downloaded[item.filename] ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t("downloaded", locale)}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
      {successMessage && (
        <p className="text-xs text-status-success mt-3 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          {successMessage}
        </p>
      )}
    </div>
  );
};

// --- TOOL ACTION PANEL ---
export interface ToolActionProps {
  status?: string;
  statusType?: "ready" | "processing" | "error" | "empty";
  metadata?: { label: string; value: string }[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "secondary" | "outline" | "ghost";
    disabled?: boolean;
  }[];
  tertiaryActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  className?: string;
  sticky?: boolean;
}

export const ToolActionPanel: React.FC<ToolActionProps> = ({
  status,
  statusType = "ready",
  metadata,
  primaryAction,
  secondaryActions,
  tertiaryActions,
  className = "",
  sticky = true
}) => {
  const statusColors = {
    ready: "text-status-success",
    processing: "text-brand-primary",
    error: "text-status-error",
    empty: "text-text-muted"
  };
  const statusDots = {
    ready: "bg-status-success",
    processing: "bg-brand-primary animate-pulse",
    error: "bg-status-error",
    empty: "bg-text-muted"
  };

  return (
    <div className={`bg-surface-base border border-border-subtle rounded-[18px] shadow-premium-sm overflow-hidden ${sticky ? "lg:sticky lg:top-24" : ""} ${className}`}>
      <div className="p-4 md:p-5 flex flex-col gap-3">
        {status && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDots[statusType]}`} />
            <span className={`text-sm font-sans font-bold ${statusColors[statusType]}`}>{status}</span>
          </div>
        )}
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metadata.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md bg-background cursor-default select-none">
                <span className="text-text-muted">{item.label}</span>
                <span className="font-bold text-text-main select-all">{item.value}</span>
              </span>
            ))}
          </div>
        )}
        {primaryAction && (
          <Button
            variant="primary"
            size="lg"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
            loading={primaryAction.loading}
            leftIcon={primaryAction.icon}
            className="w-full justify-center"
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryActions && secondaryActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {secondaryActions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant === "ghost" ? "ghost" : action.variant === "secondary" ? "secondary" : "outline"}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                leftIcon={action.icon}
                className="min-h-[44px]"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        {tertiaryActions && tertiaryActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {tertiaryActions.map((action, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                leftIcon={action.icon}
                className="min-h-[40px]"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- ERROR STATE ---
interface ErrorStateProps {
  title?: string;
  message: string;
  suggestion?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  suggestion,
  action,
  icon,
  className = ""
}) => {
  const locale = useLocale();
  const heading = title || t("somethingWentWrong", locale);
  return (
    <div className={`flex flex-col items-center justify-center p-6 md:p-12 text-center gap-4 border border-status-error/20 rounded-[18px] bg-status-error/[0.03] ${className}`}>
      {icon || (
        <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-status-error" />
        </div>
      )}
      <div className="space-y-1.5">
        <h4 className="font-sans font-bold text-base text-text-main">{heading}</h4>
        <p className="text-sm text-text-muted max-w-md leading-relaxed">{message}</p>
        {suggestion && (
          <p className="text-xs text-text-sub max-w-md leading-relaxed">{suggestion}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

// ─── RESPONSIVE PRIMITIVES ───────────────────────────────────────────────────

// --- INLINE COPY BUTTON ---
interface InlineCopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  showToast?: (msg: string) => void;
}

export const InlineCopyButton: React.FC<InlineCopyButtonProps> = ({
  text,
  label,
  className = "",
  showToast
}) => {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = (): string => (label ? tf("copySuccess", locale, { label }) : t("copied", locale));
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast?.(success());
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      showToast?.(success());
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={label || t("copy", locale)}
      className={`inline-flex items-center gap-1.5 text-xs font-mono transition-all duration-200 cursor-pointer px-2 py-1 rounded-md min-h-[44px] ${copied ? "text-status-success bg-status-success/10" : "text-text-muted hover:text-brand-primary hover:bg-surface-muted"} ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span className="line-clamp-1">{copied ? t("copied", locale) : label}</span>}
    </button>
  );
};

// --- COPYABLE VALUE ---
interface CopyableValueProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
  showToast?: (msg: string) => void;
}

export const CopyableValue: React.FC<CopyableValueProps> = ({
  label,
  value,
  mono = true,
  className = "",
  showToast
}) => {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    showToast?.(tf("copySuccess", locale, { label }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-muted border border-border-light/50 min-h-[44px] group ${className}`}>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-muted">{label}</p>
        <p className={`text-sm text-text-main font-medium line-clamp-1 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={handleCopy}
        title={tf("copyLabel", locale, { label })}
        className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] ${copied ? "text-status-success bg-status-success/10" : "text-text-muted hover:text-brand-primary hover:bg-surface-hover"}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

// --- NEXT STEPS BAR ---
interface NextStep {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface NextStepsBarProps {
  title?: string;
  steps: NextStep[];
  className?: string;
}

export const NextStepsBar: React.FC<NextStepsBarProps> = ({
  title,
  steps,
  className = ""
}) => {
  const locale = useLocale();
  const heading = title || t("whatNext", locale);
  if (steps.length === 0) return null;

  return (
    <div className={`bg-surface-muted/50 border border-border-subtle rounded-[18px] p-4 md:p-5 ${className}`}>
      <p className="text-sm font-sans font-bold text-text-muted mb-3">{heading}</p>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={step.onClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light bg-surface-base hover:border-brand-primary hover:bg-surface-hover text-sm font-semibold text-text-main hover:text-brand-primary transition-all duration-200 cursor-pointer min-h-[40px] whitespace-nowrap"
          >
            {step.icon && <span className="shrink-0 text-brand-primary">{step.icon}</span>}
            <span>{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- STICKY MOBILE ACTION BAR ---
interface StickyMobileActionProps {
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
}

export const StickyMobileAction: React.FC<StickyMobileActionProps> = ({
  children,
  visible = true,
  className = ""
}) => {
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      document.body.classList.remove("has-sticky-bar");
      return;
    }
    const checkWidth = () => setShow(window.innerWidth < 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [visible]);

  useEffect(() => {
    if (show) {
      document.body.classList.add("has-sticky-bar");
    } else {
      document.body.classList.remove("has-sticky-bar");
    }
    return () => document.body.classList.remove("has-sticky-bar");
  }, [show]);

  if (!show) return null;

  return (
    <div className={`sticky-mobile-bar ${className}`} role="toolbar" aria-label={t("quickActions", locale)}>
      {children}
    </div>
  );
};

// --- TOOL SECTION (consistent section wrapper) ---
interface ToolSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const ToolSection: React.FC<ToolSectionProps> = ({
  title,
  description,
  children,
  className = "",
  compact = false
}) => {
  return (
    <div className={`flex flex-col ${compact ? "gap-3 md:gap-4" : "gap-4 md:gap-5"} ${className}`}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="font-sans font-bold text-base md:text-lg text-text-main">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-text-muted mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// --- HORIZONTAL SCROLLABLE SWATCHES ---
interface SwatchRowProps {
  children: React.ReactNode;
  className?: string;
}

export const SwatchRow: React.FC<SwatchRowProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 snap-x snap-mandatory ${className}`} style={{ scrollbarWidth: "thin" }}>
      {children}
    </div>
  );
};

// --- RESPONSIVE TABLE (wraps table in scrollable container) ---
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`table-scroll-container rounded-[14px] border border-border-subtle ${className}`}>
      {children}
    </div>
  );
};
