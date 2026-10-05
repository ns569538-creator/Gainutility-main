/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CSS Shadow Studio — content sections rendered below the generator.
 *
 * Ready-to-use examples that load straight back into the workspace, practical
 * recipes grouped by UI job, the text-shadow explainer, a box-shadow
 * reference, a box vs text comparison, and troubleshooting for the seven
 * problems people actually hit. Copy stays English (educational prose);
 * interactive labels resolve through the tool's i18n dictionary.
 *
 * Every example and recipe is a real layer configuration from
 * src/lib/shadowStudio.ts — the same data the presets and share links use —
 * so "Edit this shadow" always lands on an exact, working configuration.
 */

import React from "react";
import { Copy, Check, ArrowRight, Pencil } from "lucide-react";
import { tt, ttf } from "../i18n/toolUi";
import { useLocale } from "../i18n/LocaleContext";
import "../i18n/tools/boxShadowGenerator";
import type { ViewState } from "../types";
import { publicPathForView } from "../router";
import { absoluteUrl } from "../site";
import { blogArticleView } from "../blog/blogUi";
import {
  type ApplyRequest,
  type ShadowExample,
  type ShadowRecipe,
  SHADOW_EXAMPLES,
  SHADOW_RECIPE_GROUPS,
  TEXT_PRESETS,
  DEFAULT_TEXT_SETTINGS,
  shadowDeclaration,
  shadowValueSingleLine,
} from "../lib/shadowStudio";
import { trackToolEvent } from "../lib/analytics";

interface ShadowStudioContentProps {
  onApplyConfig: (req: ApplyRequest) => void;
  copyText: (text: string, key: string) => void;
  copiedKey: string | null;
  onChangeView?: (view: ViewState) => void;
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const presetLayers = (nameKey: string) =>
  TEXT_PRESETS.find((p) => p.nameKey === nameKey)?.layers ?? [];

const TEXT_DOC_SNIPPETS = {
  single: shadowDeclaration(presetLayers("presetSoft"), "text"),
  glow: shadowDeclaration(presetLayers("presetGlow"), "text"),
  outline: `text-shadow:
  0 1px 0 rgba(0, 0, 0, 0.35),
  0 2px 0 rgba(0, 0, 0, 0.25),
  0 4px 8px rgba(0, 0, 0, 0.25);`,
};

const BOX_DOC_SNIPPETS = {
  single: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`,
  layered: `box-shadow:
  0 1px 2px rgba(0, 0, 0, 0.06),
  0 4px 8px rgba(0, 0, 0, 0.08),
  0 16px 32px rgba(0, 0, 0, 0.10);`,
  inset: `box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);`,
  soft: `box-shadow:
  0 2px 6px -1px rgba(0, 0, 0, 0.08),
  0 12px 28px -8px rgba(0, 0, 0, 0.12);`,
};

const recipeSummary = (r: ShadowRecipe): string => {
  const l = r.layers[0];
  const base =
    r.mode === "box"
      ? `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px`
      : `${l.x}px ${l.y}px ${l.blur}px`;
  return r.layers.length > 1 ? `${base} +${r.layers.length - 1} more` : base;
};

const exampleShapeClass = (ex: ShadowExample): string => {
  const shape = ex.preview?.previewShape;
  if (shape === "button") return "w-40 h-12";
  if (shape === "input") return "w-44 h-14";
  if (shape === "panel") return "w-44 h-28";
  if (shape === "floating") return "w-20 h-20";
  return "w-28 h-28";
};

const TROUBLESHOOTING: { problem: string; solution: string }[] = [
  {
    problem: "Why does my shadow look too dark?",
    solution:
      "The alpha is doing too much work. Start at rgba(0,0,0,0.08–0.12) for a card on white, then raise it only until the edge reads. Blur spreads the color but not the opacity — a 40px blur at 0.4 alpha is still a heavy shadow. Halve the opacity before you touch the blur.",
  },
  {
    problem: "Why does my shadow look like a border?",
    solution:
      "Blur is 0 with a visible spread, so the shadow keeps a crisp silhouette against the element. That technique is intentional when you want a hairline ring (0 0 0 1px). When you want depth instead, add blur — 8–16px is usually enough — and drop the spread to 0 or negative.",
  },
  {
    problem: "Why does my card look flat?",
    solution:
      "One layer at low opacity flattens depth. Stack two: a tight contact shadow (0 2px 6px -1px, alpha ~0.08) directly under the card, plus a wide ambient layer (0 12px 28px -8px, alpha ~0.12) below it. The pair mimics how real objects occlude light, which a single layer cannot do.",
  },
  {
    problem: "Why is my box-shadow not showing?",
    solution:
      "Three usual suspects: a parent with overflow: hidden clips it, the shadow's color has no visible alpha, or another element paints over it. Set a visible offset like 0 8px with blur 16 and raise opacity first — if the shadow appears, the problem was the values, not the layout.",
  },
  {
    problem: "Why does my shadow disappear when I add border-radius?",
    solution:
      "The shadow silhouette is drawn from the element's own rounded border box, so border-radius and box-shadow belong on the same element. A radius on a child does not round the parent's shadow, and very large radii can swallow short, tight shadows entirely.",
  },
  {
    problem: "Why does text look blurry with text-shadow?",
    solution:
      "The blur is wider than the letterforms. Keep the blur small relative to the font size — 2–4px is usually right for body-size text — and prefer whole-pixel offsets. Large blur radii on small text smear the strokes; that is the shadow, not a font rendering bug.",
  },
  {
    problem: "Why is my shadow invisible on a dark background?",
    solution:
      "Black-on-black has no contrast. Switch the shadow to a lighter or tinted color and raise its opacity; on dark surfaces shadows often need two to three times the alpha they need on white. The Dark UI and Glow examples above show values that work on #191D18.",
  },
  {
    problem: "Which shadow should I use first — one dark layer or two soft ones?",
    solution:
      "Two soft ones. A single dark layer reads as a sticker; real depth is a tight contact shadow near the surface plus a wide, faint ambient layer below it. The Soft Card preset and the Card shadow recipe both load that pair — then dial the alpha to taste.",
  },
  {
    problem: "Why did my Tailwind arbitrary shadow class fail?",
    solution:
      "Tailwind arbitrary values cannot contain raw spaces, so every space becomes an underscore — the generator already converts them for you. Copy the class into your markup as-is; if you pasted it into a plain CSS file instead, switch to the CSS tab for a normal declaration.",
  },
  {
    problem: "Does text-shadow support spread?",
    solution:
      "No. text-shadow takes X, Y, blur and color only — there is no spread radius and no inset keyword. To fake a spread, stack short zero-blur offsets (the Outline preset uses eight 1px layers), or reach for -webkit-text-stroke, which is a real stroke rather than a shadow.",
  },
];

const COMPARISON_ROWS: { label: string; box: string; text: string }[] = [
  {
    label: "Applies to",
    box: "The element's border box — a rectangle that follows border-radius",
    text: "The glyphs themselves — each letter's outline",
  },
  {
    label: "Spread radius",
    box: "Yes: positive grows the shadow, negative shrinks it",
    text: "Not part of the syntax",
  },
  {
    label: "Inset keyword",
    box: "Yes — draws the shadow inside the element",
    text: "No — shadows always fall behind the text",
  },
  {
    label: "Layer stacking",
    box: "Comma-separated layers; the first one paints on top",
    text: "Comma-separated layers; the first one paints on top",
  },
  {
    label: "Typical use",
    box: "Cards, buttons, dropdowns, panels, pressed states",
    text: "Headings over images, labels, glows, embossed type",
  },
];

/* ------------------------------------------------------------------ */
/* The content sections                                                */
/* ------------------------------------------------------------------ */

export const ShadowStudioContent: React.FC<ShadowStudioContentProps> = ({
  onApplyConfig,
  copyText,
  copiedKey,
  onChangeView,
}) => {
  const locale = useLocale();

  const SiteLink: React.FC<{ to: ViewState; children: React.ReactNode }> = ({
    to,
    children,
  }) => {
    const href = absoluteUrl(publicPathForView(to, locale));
    const cls =
      "text-brand-primary hover:text-brand-primary-dark underline underline-offset-4 decoration-border-strong transition-colors gu-focus";
    if (onChangeView) {
      return (
        <a
          href={href}
          className={cls}
          onClick={(e) => {
            e.preventDefault();
            onChangeView(to);
          }}
        >
          {children}
        </a>
      );
    }
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  };

  const CopyButton: React.FC<{ text: string; copyKey: string; label?: string }> = ({
    text,
    copyKey,
    label,
  }) => {
    const isCopied = copiedKey === copyKey;
    return (
      <button
        type="button"
        onClick={() => void copyText(text, copyKey)}
        className={`gu-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
          isCopied
            ? "bg-status-success text-white"
            : "border border-border-medium bg-surface-base text-text-main hover:bg-surface-muted"
        }`}
      >
        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {isCopied
          ? tt("box-shadow-generator", "copied", locale, "Copied")
          : label ?? tt("box-shadow-generator", "copyLabel", locale, "Copy")}
      </button>
    );
  };

  const CodeCard: React.FC<{ label: string; code: string; copyKey: string }> = ({
    label,
    code,
    copyKey,
  }) => (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-light bg-surface-base p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-text-main">{label}</span>
        <CopyButton text={code} copyKey={copyKey} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11.5px] leading-relaxed text-text-main select-all">
        <code>{code}</code>
      </pre>
    </div>
  );

  const applyExample = (ex: ShadowExample) => {
    onApplyConfig({ mode: ex.mode, layers: ex.layers, preview: ex.preview });
    trackToolEvent("box-shadow-generator", "example_loaded", ex.mode);
  };

  const applyRecipe = (r: ShadowRecipe) => {
    onApplyConfig({ mode: r.mode, layers: r.layers });
    trackToolEvent("box-shadow-generator", "recipe_loaded", r.mode);
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-14 lg:gap-16 mt-10 sm:mt-14">
      {/* ---------------- Ready-to-use examples ---------------- */}
      <section aria-labelledby="ss-examples-title">
        <p className="section-eyebrow">Shadow library</p>
        <h2 id="ss-examples-title" className="text-h2 mt-3">
          Ready-to-use CSS shadow examples
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">
          Each example is a real layer configuration, not a screenshot. Copy the CSS as-is, or load
          it into the generator above and adjust it. Rounded corners change how a shadow reads —
          pair these with the <SiteLink to={{ type: "tool", id: "border-radius-generator" }}>Border Radius Generator</SiteLink> when you are shaping the surface itself.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SHADOW_EXAMPLES.map((ex) => {
            const declaration = shadowDeclaration(ex.layers, ex.mode);
            return (
              <article
                key={ex.id}
                className="flex flex-col gap-3 rounded-2xl border border-border-light bg-surface-base p-4"
              >
                <div
                  className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border-light"
                  style={{ background: ex.preview?.previewBg ?? "#F4F6F2" }}
                >
                  {ex.mode === "box" ? (
                    <div
                      className={exampleShapeClass(ex)}
                      style={{
                        background: ex.preview?.boxBg ?? "#FFFFFF",
                        borderRadius: `${ex.preview?.boxRadius ?? 16}px`,
                        boxShadow: shadowValueSingleLine(ex.layers, "box"),
                      }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: ex.preview?.text?.fontFamily ?? DEFAULT_TEXT_SETTINGS.fontFamily,
                        fontSize: "30px",
                        fontWeight: ex.preview?.text?.fontWeight ?? 700,
                        color: ex.preview?.text?.textColor ?? "#20262E",
                        textShadow: shadowValueSingleLine(ex.layers, "text"),
                      }}
                      aria-hidden="true"
                    >
                      {DEFAULT_TEXT_SETTINGS.text}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="heading-h3 text-base font-semibold text-text-main">{ex.name}</h3>
                  <span className="shrink-0 rounded-full bg-brand-primary-light px-2 py-0.5 font-mono text-[11px] font-bold text-brand-primary">
                    {ex.mode === "box" ? "box-shadow" : "text-shadow"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{ex.desc}</p>
                <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11px] leading-relaxed text-text-main select-all">
                  <code>{declaration}</code>
                </pre>
                <div className="mt-auto flex flex-wrap gap-2">
                  <CopyButton text={declaration} copyKey={`ex-${ex.id}`} />
                  <button
                    type="button"
                    onClick={() => applyExample(ex)}
                    className="gu-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border-medium bg-surface-base px-2.5 text-[12px] font-semibold text-text-main transition-colors hover:bg-surface-muted cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {tt("box-shadow-generator", "editShadowBtn", locale, "Edit this shadow")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------------- Shadow recipes ---------------- */}
      <section aria-labelledby="ss-recipes-title">
        <p className="section-eyebrow">Practical recipes</p>
        <h2 id="ss-recipes-title" className="text-h2 mt-3">
          Shadow recipes
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">
          Grouped by the problem they solve. Load one and it lands in the generator above with its
          full layer stack, ready to tune.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SHADOW_RECIPE_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="heading-h3 text-lg font-semibold text-text-main">{group.title}</h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-surface-base p-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-main">{r.name}</span>
                      <span className="block truncate font-mono text-[11px] text-text-muted">
                        {recipeSummary(r)} · {r.mode === "box" ? "box-shadow" : "text-shadow"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => applyRecipe(r)}
                      className="gu-focus shrink-0 inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-border-medium bg-surface-base px-2.5 text-[12px] font-semibold text-text-main transition-colors hover:border-brand-primary/50 hover:text-brand-primary cursor-pointer"
                    >
                      {tt("box-shadow-generator", "loadBtn", locale, "Load")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Create text shadows ---------------- */}
      <section aria-labelledby="ss-text-title">
        <p className="section-eyebrow">Text mode</p>
        <h2 id="ss-text-title" className="text-h2 mt-3">
          Create text shadows
        </h2>
        <div className="mt-3 max-w-3xl flex flex-col gap-3 text-text-muted leading-relaxed">
          <p>
            Switch the studio to text-shadow and the same controls drive the shadow behind the
            glyphs instead of behind a box. Text shadows take X and Y offsets, a blur radius, a
            color, and opacity via alpha — and, like box shadows, they accept multiple
            comma-separated layers with the first layer painted on top.
          </p>
          <p>
            Two things do not exist on this property: spread radius and the inset keyword. The
            generator hides both in text mode rather than emitting CSS that would silently do
            nothing. Typography controls in the preview panel — font, size, weight, line height,
            color, alignment — are preview-only and never appear in the copied CSS.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <CodeCard label="Single text shadow" code={TEXT_DOC_SNIPPETS.single} copyKey="tc-single" />
          <CodeCard label="Text glow" code={TEXT_DOC_SNIPPETS.glow} copyKey="tc-glow" />
          <CodeCard label="Layered offset (3D)" code={TEXT_DOC_SNIPPETS.outline} copyKey="tc-3d" />
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              onApplyConfig({ mode: "text", layers: [] });
              trackToolEvent("box-shadow-generator", "docs_mode_switched", "text");
            }}
            className="gu-focus inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-[#FAF8F1] transition-colors hover:bg-brand-primary-hover cursor-pointer"
          >
            {tt("box-shadow-generator", "tryTextModeBtn", locale, "Try text shadow mode")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ---------------- How CSS box-shadow works ---------------- */}
      <section aria-labelledby="ss-how-title">
        <p className="section-eyebrow">Reference</p>
        <h2 id="ss-how-title" className="text-h2 mt-3">
          How CSS box-shadow works
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">
          Each layer is{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[13px] text-text-main">
            offset-x offset-y blur-radius spread-radius color
          </code>{" "}
          — blur and spread optional, color last so it is not confused with a length. The value
          ranges below are informed by a survey of shadows on production sites:{" "}
          <SiteLink to={blogArticleView("box-shadow-values-real-websites")}>
            box-shadow values real websites actually use
          </SiteLink>
          .
        </p>

        <div className="mt-8 flex flex-col gap-6 max-w-3xl">
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">X and Y offset</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              The first two lengths move the shadow away from the border box: positive X goes
              right, positive Y goes down. <code className="font-mono text-[13px] text-text-main">0 0</code>{" "}
              centers it behind the element so only blur and spread remain visible. Even a 1–4px Y
              offset is enough to suggest a light source above the surface.
            </p>
          </div>
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">Blur radius</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              The third length feathers the edge — <code className="font-mono text-[13px] text-text-main">0</code>{" "}
              keeps a crisp silhouette, while larger values spread the color out and fade it.
              Blurs feather in every direction, so a big radius with a strong color still ends up
              soft at the edges. For UI cards, 8–24px paired with low alpha is the reliable range.
            </p>
          </div>
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">Spread radius</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              The fourth length, box-shadow only. Positive values push the shadow outward beyond
              the border box; negative values pull it inward — with enough negative spread the
              shadow tucks completely under the element. Use negative spread to keep wide blurs
              from looking bulky beneath cards, or a full{" "}
              <code className="font-mono text-[13px] text-text-main">1px</code> with zero blur to
              draw a hairline ring instead of a border.
            </p>
          </div>
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">Color and opacity</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              Any CSS color works — hex, <code className="font-mono text-[13px] text-text-main">rgb()</code>,{" "}
              <code className="font-mono text-[13px] text-text-main">hsl()</code>, or a keyword.
              With alpha it composites over whatever sits behind it, which is why low-alpha black
              (<code className="font-mono text-[13px] text-text-main">rgba(0,0,0,0.08–0.25)</code>)
              reads as ambient occlusion on light UI, while a saturated color reads as glow or
              brand light. The generator separates color and opacity into two controls and emits
              the combined <code className="font-mono text-[13px] text-text-main">rgba()</code> for you.
            </p>
          </div>
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">Inset</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              The <code className="font-mono text-[13px] text-text-main">inset</code> keyword goes
              before the lengths and flips the shadow inside the border box — recessed input wells,
              pressed buttons, and the dark half of a neumorphic surface. Inset shadows paint over
              the background but under the element's content.
            </p>
          </div>
          <div>
            <h3 className="heading-h3 text-lg font-semibold text-text-main">Multiple layers</h3>
            <p className="mt-1.5 text-text-muted leading-relaxed">
              Layers are comma-separated and the first one paints on top. The combination real
              shadows have — a tight contact shadow plus a wide ambient one — is simply two layers
              with different offsets, blurs, and alphas. Layers can freely mix inset and outer in
              the same declaration.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <CodeCard label="Single shadow" code={BOX_DOC_SNIPPETS.single} copyKey="bc-single" />
          <CodeCard label="Layered ambient shadow" code={BOX_DOC_SNIPPETS.layered} copyKey="bc-layered" />
          <CodeCard label="Inset well" code={BOX_DOC_SNIPPETS.inset} copyKey="bc-inset" />
          <CodeCard label="Soft UI card" code={BOX_DOC_SNIPPETS.soft} copyKey="bc-soft" />
        </div>
      </section>

      {/* ---------------- Box shadow vs text shadow ---------------- */}
      <section aria-labelledby="ss-compare-title">
        <p className="section-eyebrow">Comparison</p>
        <h2 id="ss-compare-title" className="text-h2 mt-3">
          Box shadow vs text shadow
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">
          Both properties drop a blurred copy of a shape behind the element, and both accept
          offset, blur, color, and stacked layers. The difference is the shape: box-shadow traces
          the rectangle (or rounded rectangle) of the element's border box, text-shadow traces the
          outline of every glyph.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-border-light bg-surface-base p-4">
            <div className="flex h-36 items-center justify-center rounded-xl border border-border-light bg-[#F4F6F2]">
              <div
                className="h-24 w-40 bg-white"
                style={{ borderRadius: "14px", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)" }}
                aria-hidden="true"
              />
            </div>
            <span className="rounded-full self-start bg-brand-primary-light px-2 py-0.5 font-mono text-[11px] font-bold text-brand-primary">
              box-shadow
            </span>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11.5px] leading-relaxed text-text-main select-all">
              <code>{`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);`}</code>
            </pre>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border-light bg-surface-base p-4">
            <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-border-light bg-[#F4F6F2] px-4">
              <span
                className="text-3xl font-bold text-[#20262E]"
                style={{ textShadow: "2px 3px 8px rgba(0, 0, 0, 0.35)" }}
                aria-hidden="true"
              >
                {DEFAULT_TEXT_SETTINGS.text}
              </span>
            </div>
            <span className="rounded-full self-start bg-brand-primary-light px-2 py-0.5 font-mono text-[11px] font-bold text-brand-primary">
              text-shadow
            </span>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-light bg-background p-3 font-mono text-[11.5px] leading-relaxed text-text-main select-all">
              <code>{`text-shadow: 2px 3px 8px rgba(0, 0, 0, 0.35);`}</code>
            </pre>
          </div>
        </div>

        <dl className="mt-6 overflow-hidden rounded-2xl border border-border-light">
          <div className="hidden sm:grid grid-cols-[180px_1fr_1fr] gap-4 border-b border-border-light bg-surface-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            <span />
            <span>Box shadow</span>
            <span>Text shadow</span>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr] gap-1 sm:gap-4 border-b border-border-light last:border-b-0 px-4 py-3"
            >
              <dt className="text-[13px] font-semibold text-text-main">{row.label}</dt>
              <dd className="text-sm leading-relaxed text-text-muted">{row.box}</dd>
              <dd className="text-sm leading-relaxed text-text-muted">{row.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- Guides and further reading ---------------- */}
      <section aria-labelledby="ss-guides-title">
        <p className="section-eyebrow">Guides</p>
        <h2 id="ss-guides-title" className="text-h2 mt-3">
          Box-shadow guides and examples
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">
          The reference material behind the controls above — syntax, copy-ready examples, and how
          layered shadows actually combine.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              to: { type: "seo-page", id: "box-shadow" } as ViewState,
              title: "box-shadow syntax & values",
              desc: "What each value does, with practical starting ranges.",
            },
            {
              to: { type: "seo-page", id: "box-shadow-examples" } as ViewState,
              title: "Examples gallery",
              desc: "Cards, buttons, inputs, rings, and glows — preview and copy each one.",
            },
            {
              to: { type: "seo-page", id: "box-shadow-multiple" } as ViewState,
              title: "Multiple box-shadows",
              desc: "Comma-separated layers, paint order, and the contact + ambient recipe.",
            },
            {
              to: blogArticleView("box-shadow-vs-drop-shadow-filter"),
              title: "box-shadow vs drop-shadow",
              desc: "Border-box rectangle versus alpha-shape shadow, side by side.",
            },
            {
              to: blogArticleView("soft-shadow-css-recipes"),
              title: "Soft shadow recipes",
              desc: "Why soft shadows go muddy, and the alpha-first values that fix it.",
            },
            {
              to: blogArticleView("box-shadow-values-real-websites"),
              title: "Values real websites ship",
              desc: "33,438 measured declarations from the top 1,000 sites.",
            },
          ].map((item) => {
            const href = absoluteUrl(publicPathForView(item.to, locale));
            return (
              <a
                key={item.title}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onChangeView?.(item.to);
                }}
                className="gu-focus flex flex-col gap-1 rounded-2xl border border-border-light bg-surface-base p-4 h-full transition-colors hover:border-brand-primary/30 cursor-pointer"
              >
                <span className="text-sm font-semibold text-text-main">{item.title}</span>
                <span className="text-xs leading-relaxed text-text-muted">{item.desc}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ---------------- Troubleshooting ---------------- */}
      <section aria-labelledby="ss-trouble-title">
        <p className="section-eyebrow">Troubleshooting</p>
        <h2 id="ss-trouble-title" className="text-h2 mt-3">
          Common CSS shadow problems
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {TROUBLESHOOTING.map((item) => (
            <div
              key={item.problem}
              className="flex flex-col gap-1.5 rounded-2xl border border-border-light bg-surface-base p-4"
            >
              <h3 className="heading-h3 text-base font-semibold text-text-main">{item.problem}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{item.solution}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
