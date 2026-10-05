/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for the Color Studio tools that are also reachable as
 * public /tools/<id> routes (Color Palette Builder, Color Picker,
 * Color Explorer, UI Color Visualizer, Image to Palette).
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const LOCAL =
  "Everything runs locally in your browser. Your input and files are never uploaded to a server.";

export const COLOR_TOOLS_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "color-palette-generator": {
    title: "Color Palette Builder — Harmonious Palettes + Contrast",
    description:
      "Build harmonious color palettes: shuffle, lock what you love, edit each color by HEX, RGB or HSL, check WCAG contrast and export HEX or CSS variables.",
    intro:
      "The palette comes first here. Shuffle colors, lock the ones that work, edit any stop in HEX, RGB or HSL, and keep an eye on contrast — then export clean CSS variables for your project.",
    steps: [
      "Press Space or hit Generate palette to roll a new set of colors.",
      "Lock colors you love so a new generate keeps them, drag cards to reorder.",
      "Click any color to edit it in HEX, RGB, or HSL.",
      "Check WCAG contrast and the live UI preview, then export HEX, CSS variables, or JSON.",
    ],
    whatText:
      "A palette-first color builder that generates harmonious sets of 2–6 colors, keeps your locks on regenerate, and readies them for production with contrast checks, a UI preview, and clean exports.",
    whyText:
      "Great palettes are iterative. Locking colors and re-rolling the rest lets you converge on something that works without hand-matching hex codes by eye.",
    features: [
      "Random, monochromatic, complementary, analogous, and triadic modes",
      "Lock colors across regenerations, shuffle, and drag to reorder",
      "Edit any color in HEX, RGB, or HSL with a live preview",
      "WCAG AA/AAA contrast ratings for body text and button labels",
      "Live UI preview applying your palette to a real mock interface",
      "Export as HEX list, CSS variables, JSON, or share link",
      "Zero uploads — runs entirely locally"
    ],
    faqs: [
      {
        question: "How do I generate a color palette?",
        answer:
          "Press Space or click Generate palette. Pick a mode first — Random, Monochromatic, Complementary, Analogous, or Triadic — and lock the colors you like so the next generate keeps them."
      },
      {
        question: "Can I edit a single color?",
        answer:
          "Click any color card to open an editor where you can change it by HEX, RGB, or HSL. The palette updates live as you type."
      },
      {
        question: "How does the contrast check work?",
        answer:
          "The tool picks roles from your palette automatically — the lightest color as background, the darkest as body text, and the most chromatic as the accent — then reports WCAG AA/AAA ratios for body text and button labels."
      },
      {
        question: "Does this tool upload my colors anywhere?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["gradient-generator", "contrast-checker", "color-picker", "color-visualizer"],
    limitations: ["Auto-assigned roles are a starting point — always confirm the text-to-background contrast for the final pairing before shipping."],
    privacyExplanation: LOCAL,
  },
  "color-picker": {
    title: "Color Picker — HEX, RGB & HSL with Scales and Harmonies",
    description:
      "Pick any color, see its scale, harmonies and HEX/RGB/HSL values, and copy tokens with one click. Free and private — runs entirely in your browser.",
    intro:
      "A no-nonsense color picker that shows you the whole picture — exact values, a matching scale, and complementary harmonies for every color you choose.",
    steps: [
      "Pick a color with the picker or paste a HEX value.",
      "Read its HEX, RGB and HSL values instantly.",
      "Explore its scale and useful harmonies.",
      "Copy any token with one click.",
    ],
    whatText:
      "A browser color picker with live HEX/RGB/HSL readouts, automatic scale and harmony suggestions, and instant copy-to-clipboard for design tokens.",
    whyText:
      "When you need one color, a full design studio is overkill. This picker gives designers the exact values and a couple of curated companions in a single screen.",
    features: [
      "HEX, RGB, and HSL readouts",
      "Automatic scale and harmony suggestions",
      "One-click token copy",
      "Runs offline in your browser",
      "Completely free"
    ],
    faqs: [
      {
        question: "What color formats can I copy?",
        answer:
          "HEX, RGB and HSL are all shown and copyable with a single click."
      },
      {
        question: "Can I enter a color instead of picking it?",
        answer: "Yes — paste any HEX value and the picker, scale and harmonies update to match it."
      },
      {
        question: "Does the color picker need an internet connection?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["color-palette-generator", "contrast-checker", "color-visualizer", "color-explorer"],
    limitations: ["Color display depends on your monitor profile; calibrate before making final brand decisions."],
    privacyExplanation: LOCAL,
  },
  "color-explorer": {
    title: "Color Explorer — Every Named CSS Color, All in One Place",
    description:
      "Browse every named CSS color grouped by family, search by name or taste, open full color profiles, and copy hex values instantly — free and private.",
    intro:
      "Over 140 named CSS colors organized by family. Search by name, compare neighboring shades, and open any color's full profile: scale, harmonies and contrast.",
    steps: [
      "Search by color name or browse by family.",
      "Open a color to see its full profile.",
      "Check its scale, harmonies and contrast.",
      "Copy the hex value in one click.",
    ],
    whatText:
      "A searchable, family-grouped reference for every named CSS color, with per-color profiles showing scales, harmonies, and WCAG contrast against common backgrounds.",
    whyText:
      "Named CSS colors are useful for prototyping and education, but their precise values are easy to forget — this explorer makes every one of them findable in seconds.",
    features: [
      "All named CSS colors, grouped by family",
      "Instant name and taste search",
      "Full color profiles with harmonies",
      "One-click hex copy",
      "Runs entirely in your browser"
    ],
    faqs: [
      {
        question: "How many named CSS colors are included?",
        answer:
          "All of them — every named CSS color, organized into warm, cool, neutral and accent families."
      },
      {
        question: "Can I search by something other than the exact name?",
        answer:
          "Yes — the search matches color names and descriptive tastes (like “ocean” or “blush”) against the family grouping."
      },
      {
        question: "Is the Color Explorer available offline?",
        answer: "Once loaded, yes. " + LOCAL
      }
    ],
    related: ["color-palette-generator", "color-picker", "contrast-checker", "image-to-palette"],
    limitations: ["Named colors are fixed browser values — for fine-grained brand color design, use the palette generator or scale generator."],
    privacyExplanation: LOCAL,
  },
  "color-visualizer": {
    title: "UI Color Visualizer — Preview Palettes on Real Interfaces",
    description:
      "Role-map any palette onto buttons, sign-in cards, tables and dashboards with literal CSS previews and WCAG contrast checks. Free, private, in-browser.",
    intro:
      "Stop guessing how a palette feels in context. Map your colors to real UI roles and preview them on buttons, a sign-in card, a data table and a dashboard.",
    steps: [
      "Add your colors and assign each a UI role.",
      "Preview them on realistic interface components.",
      "Check WCAG contrast for text pairings.",
      "Export literal CSS to mirror the preview.",
    ],
    whatText:
      "A UI-focused color visualizer that role-maps your palette onto buttons, cards, tables and dashboards, generating literal CSS previews with WCAG contrast checks.",
    whyText:
      "Swatch-only previews hide readability problems. Seeing your palette applied to real interface roles is how you catch contrast and hierarchy issues early.",
    features: [
      "Buttons, sign-in card, table and dashboard previews",
      "Literal CSS output for each component",
      "WCAG contrast checks built in",
      "100% client-side, nothing uploaded",
      "Completely free"
    ],
    faqs: [
      {
        question: "What kind of interface previews does this provide?",
        answer:
          "Buttons, a sign-in card, a data table and a dashboard — each rendered with your exact color roles."
      },
      {
        question: "Can I see the CSS behind the previews?",
        answer:
          "Yes — every preview component exposes the literal CSS that produced it, ready to copy."
      },
      {
        question: "Are my colors uploaded anywhere?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["contrast-checker", "color-palette-generator", "image-to-palette", "color-picker"],
    limitations: ["Previews are approximate renders of common components — always test final UI in your actual app."],
    privacyExplanation: LOCAL,
  },
  "image-to-palette": {
    title: "Image to Palette — Extract Dominant Colors from Photos",
    description:
      "Drop a photo and extract its dominant colors into an editable, copyable palette. Processing runs on your device — nothing is ever uploaded.",
    intro:
      "Pull the real colors out of any photo. Drop an image and get its dominant shades back as a clean, copyable palette ready for your design work.",
    steps: [
      "Drop or choose an image.",
      "Review the extracted dominant colors.",
      "Adjust or remove individual shades.",
      "Copy the palette or export it.",
    ],
    whatText:
      "An image-to-palette extractor that samples an uploaded photo and returns its dominant colors as an editable palette, with one-click copy and export.",
    whyText:
      "Brands and moodboards are built from real-world color references. Extracting the actual palette from a photo beats eyeballing hex values every time.",
    features: [
      "Dominant color extraction from any image",
      "Editable, removable palette entries",
      "One-click copy and export",
      "Processed entirely on your device",
      "Completely free"
    ],
    faqs: [
      {
        question: "How many colors does it extract?",
        answer: "It detects the dominant shades in your image and returns a clean palette you can trim and edit."
      },
      {
        question: "What image formats are supported?",
        answer: "Common image formats such as PNG, JPG and WebP work directly in your browser."
      },
      {
        question: "Is my image uploaded to a server?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["color-palette-generator", "color-visualizer", "image-resizer", "social-resizer"],
    limitations: ["Very large photos are downscaled locally before sampling; extraction accuracy depends on image exposure and color distribution."],
    privacyExplanation: LOCAL,
  },
};