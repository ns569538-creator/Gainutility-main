/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GainUtility Color Studio — UI Visualizer.
 * Preview a palette on realistic UI: buttons, cards, forms, navbar, badges,
 * links, tables, and alerts. Colors are role-mapped live to CSS variables.
 */
import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Layers,
  Layout,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard,
  Table as TableIcon,
  BarChart3,
  Sliders,
  Bell,
  Search,
  Check,
  ChevronRight,
} from "lucide-react";
import { CURATED_PALETTES } from "../colorData";
import { SectionProps } from "./types";
import {
  SectionHeading,
  ColorToken,
  ColorPickerField,
  ContrastBadge,
  ExportBar,
  SelectedColorState,
  CopyValueButton,
} from "../colorUI";
import { contrastRatio, textColorOn, normalizeHex } from "../color";
import { useActiveColor } from "../ActiveColorContext";

export interface UiRoles {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

type UiMockId = "components" | "card" | "navbar" | "dashboard" | "table";

const MOCKS: { id: UiMockId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "components", label: "Buttons & Forms", icon: Sliders },
  { id: "card", label: "Sign-in Card", icon: CreditCard },
  { id: "navbar", label: "App Header & Nav", icon: Layout },
  { id: "dashboard", label: "Metrics Dashboard", icon: BarChart3 },
  { id: "table", label: "Data Table", icon: TableIcon },
];

const PRESETS = [
  {
    name: "Modern SaaS",
    roles: {
      primary: "#4F46E5",
      secondary: "#6366F1",
      accent: "#06B6D4",
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#334155",
    },
  },
  {
    name: "Clean Light",
    roles: {
      primary: "#2563EB",
      secondary: "#3B82F6",
      accent: "#F59E0B",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
    },
  },
  {
    name: "Emerald Studio",
    roles: {
      primary: "#059669",
      secondary: "#10B981",
      accent: "#F97316",
      background: "#064E3B",
      surface: "#065F46",
      text: "#ECFDF5",
      muted: "#A7F3D0",
      border: "#047857",
    },
  },
  {
    name: "Warm Editorial",
    roles: {
      primary: "#9A3412",
      secondary: "#C2410C",
      accent: "#D97706",
      background: "#FFFBEB",
      surface: "#FEF3C7",
      text: "#451A03",
      muted: "#78350F",
      border: "#FDE68A",
    },
  },
  {
    name: "Cyber Violet",
    roles: {
      primary: "#7C3AED",
      secondary: "#8B5CF6",
      accent: "#EC4899",
      background: "#09090B",
      surface: "#18181B",
      text: "#FAFAFA",
      muted: "#A1A1AA",
      border: "#27272A",
    },
  },
];

export const VisualizerSection: React.FC<SectionProps> = ({ onCopy }) => {
  const { activeColor } = useActiveColor();
  const [mock, setMock] = useState<UiMockId>("components");
  const [activeRoleKey, setActiveRoleKey] = useState<keyof UiRoles>("primary");

  // Initial role configuration derived from the active studio color
  const [roles, setRoles] = useState<UiRoles>(() => {
    const p = normalizeHex(activeColor) ?? "#4F46E5";
    return {
      primary: p,
      secondary: "#6366F1",
      accent: "#06B6D4",
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#334155",
    };
  });

  const updateRole = (key: keyof UiRoles, value: string) => {
    const norm = normalizeHex(value) ?? value;
    setRoles((prev) => ({ ...prev, [key]: norm }));
  };

  const primaryInk = textColorOn(roles.primary);
  const accentInk = textColorOn(roles.accent);
  const secondaryInk = textColorOn(roles.secondary);

  // Key contrast metrics
  const textBgContrast = contrastRatio(roles.text, roles.background);
  const textSurfaceContrast = contrastRatio(roles.text, roles.surface);
  const primaryBgContrast = contrastRatio(roles.primary, roles.background);
  const primaryInkContrast = contrastRatio(primaryInk, roles.primary);

  const cssStyle = {
    "--v-primary": roles.primary,
    "--v-secondary": roles.secondary,
    "--v-accent": roles.accent,
    "--v-bg": roles.background,
    "--v-surface": roles.surface,
    "--v-text": roles.text,
    "--v-muted": roles.muted,
    "--v-border": roles.border,
    "--v-p-ink": primaryInk,
    "--v-a-ink": accentInk,
    "--v-s-ink": secondaryInk,
  } as React.CSSProperties;

  const roleList: Array<{ key: keyof UiRoles; label: string; desc: string }> = [
    { key: "primary", label: "Primary", desc: "Buttons, links, brand focus" },
    { key: "secondary", label: "Secondary", desc: "Supporting actions, highlights" },
    { key: "accent", label: "Accent", desc: "Badges, notification pips, warnings" },
    { key: "background", label: "Background", desc: "Page backdrop surface" },
    { key: "surface", label: "Surface", desc: "Cards, panels, modal windows" },
    { key: "text", label: "Text", desc: "Main headings & readable body" },
    { key: "muted", label: "Muted", desc: "Subtitles, placeholder text" },
    { key: "border", label: "Border", desc: "Dividers, boundaries, outlines" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Color Studio • Visualizer"
        title="Live UI Component Visualizer"
        subtitle="Test your palette live on real buttons, cards, navigation, badges, tables, and alerts. Change any semantic role below and watch the interface adapt instantaneously."
        right={<SelectedColorState label="Live Theme Engine" />}
      />

      {/* Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="text-xs font-sans font-bold text-text-main">Quick Theme Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setRoles(preset.roles)}
              className="px-3 py-1.5 rounded-xl border border-border-light hover:border-brand-primary/40 bg-surface-muted/30 hover:bg-surface-muted text-xs font-semibold text-text-sub transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Roles Interactive Control Strip */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-sans font-bold text-text-main">Semantic Role Assignment</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Click any token below to open its dedicated color control and fine-tune its value.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-primary">
            Active: {roleList.find((r) => r.key === activeRoleKey)?.label}
          </span>
        </div>

        {/* Tokens Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {roleList.map((item) => {
            const isSelected = activeRoleKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveRoleKey(item.key)}
                className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary-light/40 ring-2 ring-brand-primary/30 shadow-xs"
                    : "border-border-light bg-surface-muted/20 hover:border-border-medium hover:bg-surface-muted/50"
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span
                    className="w-3.5 h-3.5 rounded-md border border-black/15 shadow-inner shrink-0"
                    style={{ backgroundColor: roles[item.key] }}
                  />
                  <span className="text-xs font-sans font-bold text-text-main truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-text-muted truncate">
                  {roles[item.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Role Dedicated Color Picker Field */}
        <div className="pt-3 border-t border-border-light/60">
          <ColorPickerField
            value={roles[activeRoleKey]}
            onChange={(hex) => updateRole(activeRoleKey, hex)}
            label={`Edit ${roleList.find((r) => r.key === activeRoleKey)?.label} Color`}
            roleBadge={roleList.find((r) => r.key === activeRoleKey)?.desc}
            onCopy={onCopy}
            showRgbHslSliders={true}
          />
        </div>
      </div>

      {/* UI Mock Navigation Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-muted/60 border border-border-light/80" role="tablist">
            {MOCKS.map((m) => {
              const Icon = m.icon;
              const isActive = mock === m.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setMock(m.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-surface-base text-brand-primary shadow-sm border border-black/5"
                      : "text-text-muted hover:text-text-main hover:bg-surface-base/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Text on Background:</span>
            <ContrastBadge color={roles.text} background={roles.background} ratio={textBgContrast} size="sm" />
          </div>
        </div>

        {/* Live UI Preview Frame */}
        <div
          className="rounded-3xl border border-border-light overflow-hidden shadow-premium-lg transition-colors duration-200 min-h-[460px]"
          style={{ ...cssStyle, backgroundColor: "var(--v-bg)" }}
        >
          {mock === "components" && (
            <div className="p-6 sm:p-10 flex flex-col gap-8">
              {/* Header inside frame */}
              <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: "var(--v-border)" }}>
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: "var(--v-text)" }}>
                  Component Gallery
                </h3>
                <p className="text-sm" style={{ color: "var(--v-muted)" }}>
                  Buttons, form controls, badges, alerts, and interactive elements.
                </p>
              </div>

              {/* 1. BUTTONS SUITE */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider block" style={{ color: "var(--v-muted)" }}>
                  Button Styles
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: "var(--v-secondary)", color: "var(--v-s-ink)" }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    Secondary
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: "var(--v-accent)", color: "var(--v-a-ink)" }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    Accent
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: "var(--v-surface)",
                      color: "var(--v-text)",
                      border: "1px solid var(--v-border)",
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Outline
                  </button>
                  <button
                    type="button"
                    style={{ color: "var(--v-text)" }}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm hover:underline cursor-pointer"
                  >
                    Ghost Link
                  </button>
                </div>
              </div>

              {/* 2. BADGES & STATUS PILLS */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider block" style={{ color: "var(--v-muted)" }}>
                  Badges & Notifications
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                    style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}
                  >
                    <Check className="w-3 h-3" /> Active Badge
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "var(--v-surface)",
                      color: "var(--v-accent)",
                      border: "1px solid var(--v-border)",
                    }}
                  >
                    New Feature
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-bold"
                    style={{
                      backgroundColor: "var(--v-surface)",
                      color: "var(--v-text)",
                      border: "1px solid var(--v-border)",
                    }}
                  >
                    v2.4.0
                  </span>
                </div>
              </div>

              {/* 3. ALERTS & CALLOUTS */}
              <div
                className="p-4 rounded-2xl flex items-start gap-3 border shadow-sm"
                style={{
                  backgroundColor: "var(--v-surface)",
                  borderColor: "var(--v-border)",
                }}
              >
                <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--v-primary)" }} />
                <div className="space-y-1">
                  <p className="text-sm font-bold" style={{ color: "var(--v-text)" }}>
                    Theme preview active
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--v-muted)" }}>
                    All colors are calculated in real time. Click any chip to copy its exact CSS variable.
                  </p>
                </div>
              </div>

              {/* 4. FORM INPUTS */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--v-text)" }} htmlFor="visualizer-section-workspace-name">
                    Workspace Name
                  </label>
                  <input
                    defaultValue="GainUtility Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-shadow"
                    style={{
                      backgroundColor: "var(--v-surface)",
                      border: "1px solid var(--v-border)",
                      color: "var(--v-text)",
                    }}
                  id="visualizer-section-workspace-name"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--v-text)" }} htmlFor="visualizer-section-accent-tagline">
                    Accent Tagline
                  </label>
                  <input
                    defaultValue="Production Color Suite"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-shadow"
                    style={{
                      backgroundColor: "var(--v-surface)",
                      border: "1px solid var(--v-border)",
                      color: "var(--v-text)",
                    }}
                  id="visualizer-section-accent-tagline"/>
                </div>
              </div>
            </div>
          )}

          {mock === "card" && (
            <div className="p-6 sm:p-12 flex items-center justify-center min-h-[460px]">
              <div
                className="w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col gap-5 border shadow-premium-md"
                style={{
                  backgroundColor: "var(--v-surface)",
                  borderColor: "var(--v-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--v-bg)", color: "var(--v-muted)", border: "1px solid var(--v-border)" }}
                  >
                    Secure
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-sans tracking-tight" style={{ color: "var(--v-text)" }}>
                    Welcome to GainUtility
                  </h3>
                  <p className="text-xs" style={{ color: "var(--v-muted)" }}>
                    Sign in to your design system account.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--v-text)" }} htmlFor="visualizer-section-work-email">
                      Work Email
                    </label>
                    <input
                      type="email"
                      defaultValue="designer@gainutility.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--v-bg)",
                        border: "1px solid var(--v-border)",
                        color: "var(--v-text)",
                      }}
                    id="visualizer-section-work-email"/>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold" style={{ color: "var(--v-text)" }} htmlFor="visualizer-section-password">
                        Password
                      </label>
                      <span className="font-bold cursor-pointer" style={{ color: "var(--v-accent)" }}>
                        Forgot?
                      </span>
                    </div>
                    <input
                      type="password"
                      defaultValue="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--v-bg)",
                        border: "1px solid var(--v-border)",
                        color: "var(--v-text)",
                      }}
                    id="visualizer-section-password"/>
                  </div>
                </div>

                <button
                  type="button"
                  style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}
                  className="w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-98 cursor-pointer mt-1"
                >
                  Sign In to Workspace
                </button>

                <p className="text-center text-[11px]" style={{ color: "var(--v-muted)" }}>
                  Need an enterprise license? <span className="font-bold underline cursor-pointer" style={{ color: "var(--v-secondary)" }}>Talk to sales</span>
                </p>
              </div>
            </div>
          )}

          {mock === "navbar" && (
            <div className="p-6 sm:p-10 flex flex-col gap-6">
              {/* App Navbar */}
              <div
                className="w-full rounded-2xl border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm"
                style={{
                  backgroundColor: "var(--v-surface)",
                  borderColor: "var(--v-border)",
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm" style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}>
                      G
                    </span>
                    <span className="font-bold font-sans text-sm" style={{ color: "var(--v-text)" }}>
                      GainUtility
                    </span>
                  </div>

                  <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
                    <span className="px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: "var(--v-bg)", color: "var(--v-primary)" }}>
                      Studio
                    </span>
                    <span className="px-3 py-1.5 rounded-lg cursor-pointer" style={{ color: "var(--v-muted)" }}>
                      Palettes
                    </span>
                    <span className="px-3 py-1.5 rounded-lg cursor-pointer" style={{ color: "var(--v-muted)" }}>
                      Tokens
                    </span>
                  </nav>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                    style={{ backgroundColor: "var(--v-bg)", borderColor: "var(--v-border)", color: "var(--v-muted)" }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search tokens...</span>
                  </div>

                  <button
                    type="button"
                    style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Deploy
                  </button>
                </div>
              </div>

              {/* Sub-hero content */}
              <div
                className="rounded-3xl p-6 sm:p-8 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)" }}
              >
                <div className="space-y-1 max-w-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--v-bg)", color: "var(--v-accent)", border: "1px solid var(--v-border)" }}>
                    Color System Live
                  </span>
                  <h4 className="text-xl font-bold font-sans" style={{ color: "var(--v-text)" }}>
                    Theme synced with React context
                  </h4>
                  <p className="text-xs" style={{ color: "var(--v-muted)" }}>
                    Components automatically react to background contrast changes and adjust font ink tokens.
                  </p>
                </div>

                <button
                  type="button"
                  style={{ backgroundColor: "var(--v-accent)", color: "var(--v-a-ink)" }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Generate Tokens
                </button>
              </div>
            </div>
          )}

          {mock === "dashboard" && (
            <div className="p-6 sm:p-10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--v-text)" }}>
                    System Metrics
                  </h3>
                  <p className="text-xs" style={{ color: "var(--v-muted)" }}>
                    Performance overview for current color configuration.
                  </p>
                </div>
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg border"
                  style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)", color: "var(--v-text)" }}
                >
                  Last 24 Hours
                </span>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="p-4 rounded-2xl border flex flex-col gap-1.5"
                  style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)" }}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--v-muted)" }}>
                    Contrast Score
                  </span>
                  <span className="text-2xl font-bold font-mono" style={{ color: "var(--v-text)" }}>
                    {textBgContrast.toFixed(2)}:1
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--v-primary)" }}>
                    +0.4 vs baseline
                  </span>
                </div>

                <div
                  className="p-4 rounded-2xl border flex flex-col gap-1.5"
                  style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)" }}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--v-muted)" }}>
                    Accessible Pairs
                  </span>
                  <span className="text-2xl font-bold font-mono" style={{ color: "var(--v-text)" }}>
                    94.2%
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--v-accent)" }}>
                    WCAG AA Passing
                  </span>
                </div>

                <div
                  className="p-4 rounded-2xl border flex flex-col gap-1.5"
                  style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)" }}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--v-muted)" }}>
                    Color Tokens
                  </span>
                  <span className="text-2xl font-bold font-mono" style={{ color: "var(--v-text)" }}>
                    32 Defined
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--v-secondary)" }}>
                    Zero conflicts
                  </span>
                </div>
              </div>

              {/* Bar progress preview */}
              <div
                className="p-5 rounded-2xl border flex flex-col gap-3"
                style={{ backgroundColor: "var(--v-surface)", borderColor: "var(--v-border)" }}
              >
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--v-text)" }}>
                  <span>Color Distribution</span>
                  <span style={{ color: "var(--v-muted)" }}>100% Normalized</span>
                </div>
                <div className="flex h-4 rounded-xl overflow-hidden gap-1">
                  <div className="w-[45%] rounded-md" style={{ backgroundColor: "var(--v-primary)" }} />
                  <div className="w-[25%] rounded-md" style={{ backgroundColor: "var(--v-secondary)" }} />
                  <div className="w-[15%] rounded-md" style={{ backgroundColor: "var(--v-accent)" }} />
                  <div className="w-[15%] rounded-md" style={{ backgroundColor: "var(--v-border)" }} />
                </div>
              </div>
            </div>
          )}

          {mock === "table" && (
            <div className="p-6 sm:p-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--v-text)" }}>
                    Active Design Tokens
                  </h3>
                  <p className="text-xs" style={{ color: "var(--v-muted)" }}>
                    Table rows with zebra striping and status badges.
                  </p>
                </div>
                <button
                  type="button"
                  style={{ backgroundColor: "var(--v-primary)", color: "var(--v-p-ink)" }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Export Table
                </button>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--v-border)" }}>
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--v-surface)", borderBottom: "1px solid var(--v-border)" }}>
                      <th className="py-3 px-4 font-bold" style={{ color: "var(--v-text)" }}>Token Name</th>
                      <th className="py-3 px-4 font-bold" style={{ color: "var(--v-text)" }}>Hex Value</th>
                      <th className="py-3 px-4 font-bold" style={{ color: "var(--v-text)" }}>Role</th>
                      <th className="py-3 px-4 font-bold text-right" style={{ color: "var(--v-text)" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleList.slice(0, 5).map((r, i) => (
                      <tr
                        key={r.key}
                        style={{
                          backgroundColor: i % 2 === 0 ? "transparent" : "var(--v-surface)",
                          borderBottom: "1px solid var(--v-border)",
                        }}
                      >
                        <td className="py-3 px-4 font-bold flex items-center gap-2" style={{ color: "var(--v-text)" }}>
                          <span className="w-3.5 h-3.5 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: roles[r.key] }} />
                          <span>--color-{r.key}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold" style={{ color: "var(--v-text)" }}>
                          {roles[r.key]}
                        </td>
                        <td className="py-3 px-4 text-xs" style={{ color: "var(--v-muted)" }}>
                          {r.desc}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: i === 0 ? "var(--v-primary)" : "var(--v-surface)",
                              color: i === 0 ? "var(--v-p-ink)" : "var(--v-text)",
                              border: "1px solid var(--v-border)",
                            }}
                          >
                            {i === 0 ? "Primary" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live WCAG Compliance Table */}
      <div className="p-5 rounded-2xl border border-border-light bg-surface-base shadow-premium-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-sans font-bold text-text-main">Theme WCAG Accessibility Scorecard</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Live checks of crucial UI color pairings against standard WCAG AA (≥4.5:1) and AAA (≥7.0:1) requirements.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-text-muted">4 Core Pairs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Body Text on Background</span>
              <p className="text-xs text-text-sub font-semibold mt-1">Readability of main content</p>
            </div>
            <ContrastBadge color={roles.text} background={roles.background} ratio={textBgContrast} />
          </div>

          <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Body Text on Surface</span>
              <p className="text-xs text-text-sub font-semibold mt-1">Readability inside cards & modals</p>
            </div>
            <ContrastBadge color={roles.text} background={roles.surface} ratio={textSurfaceContrast} />
          </div>

          <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Primary on Background</span>
              <p className="text-xs text-text-sub font-semibold mt-1">Visibility of primary elements</p>
            </div>
            <ContrastBadge color={roles.primary} background={roles.background} ratio={primaryBgContrast} />
          </div>

          <div className="p-3.5 rounded-xl border border-border-light bg-surface-muted/20 flex flex-col justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">Button Ink on Primary</span>
              <p className="text-xs text-text-sub font-semibold mt-1">Legibility of primary button text</p>
            </div>
            <ContrastBadge color={primaryInk} background={roles.primary} ratio={primaryInkContrast} />
          </div>
        </div>
      </div>

      {/* Export Bar for Complete UI Theme */}
      <ExportBar
        colors={[
          roles.primary,
          roles.secondary,
          roles.accent,
          roles.background,
          roles.surface,
          roles.text,
          roles.muted,
          roles.border,
        ]}
        name="UI Theme Palette"
        onCopy={onCopy}
      />
    </div>
  );
};