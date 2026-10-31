/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entry for the Stylish Name Generator (Creator Studio).
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const LOCAL =
  "Everything runs locally in your browser. Your input is never uploaded to a server.";

export const STYLISH_NAME_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "stylish-name-generator": {
    title: "Stylish Name Maker & Generator (Copy & Paste) — 100+ Cool Fonts & Nicknames | GainUtility",
    description:
      "Generate stylish names and fancy nicknames in 100+ cool Unicode fonts and aesthetic symbols. Instant 1-click copy & paste for Free Fire, PUBG, Instagram, Discord, and gaming profiles.",
    intro:
      "Type any name, pick a mood, and copy a look you love — bold, script, bubble, small-caps and more, finished with symbols and emojis. Everything runs in your browser.",
    steps: [
      "Type or paste the name you want to restyle.",
      "Pick a mode — Stylish, Nickname, Emoji, Aesthetic, Gaming, Cute or Bio.",
      "Click a result to copy it; a checkmark confirms the copy landed.",
      "Save favorites to your local list, or hit Generate for a fresh batch.",
    ],
    whatText:
      "Turns plain text into decorated variations using Unicode fonts, wrapper symbols and emoji. Each mode curates a different slice of the style library so every batch fits the context you are styling for — a killfeed tag, a soft bio, an emoji-forward handle.",
    whyText:
      "Default profile names look like everyone else's. A styled name reads as more personal instantly — and building these variations by hand with Unicode character maps is tedious. This does it in one click, and it tells you honestly when a platform will not accept decorative characters.",
    features: [
      "Curated Unicode styles — fonts, spacing, wrappers and composed presets",
      "Seven purpose-built modes: Stylish, Nickname, Emoji, Aesthetic, Gaming, Cute, Bio",
      "One-click copy with inline confirmation",
      "Local favorites list saved in your browser",
      "No sign-up, no uploads, completely free",
    ],
    limitations: [
      "Platform support varies — display names and bios accept most styles, but many usernames allow only plain letters, numbers and underscores.",
      "Glyph rendering depends on the viewer's device; a style can look slightly different across phones and desktops.",
    ],
    mistakes: [
      "Pasting styled text into a username field that only accepts plain characters — when discoverability matters, keep a plain-text version too.",
      "Stacking several wrappers and emoji on one name; it hurts readability more than it adds flair.",
      "Expecting decorative Unicode to be searchable — search engines and in-app search match plain text far more reliably.",
    ],
    troubleshooting: [
      "A style shows empty boxes or blanks? Your device is missing that glyph — pick another style.",
      "Copy did not work? Your browser blocked clipboard access — select the text and copy it manually.",
    ],
    faqs: [
      {
        question: "What does this stylish name generator do?",
        answer:
          "It takes any plain name and produces decorated variations — Unicode fonts, symbol wrappers, emoji looks — that you can copy in one click and paste into profiles, bios and tags.",
      },
      {
        question: "Do I need to install anything or create an account?",
        answer:
          "No. It runs entirely in your browser, is free, and has no sign-up — type a name and start generating.",
      },
      {
        question: "Is my input uploaded anywhere?",
        answer: "No. " + LOCAL,
      },
      {
        question: "Will a stylish name work as my username?",
        answer:
          "Sometimes — but not always. Display names and bios usually accept Unicode styles; many usernames restrict you to plain letters, numbers and underscores. Test your platform before committing to a look.",
      },
      {
        question: "What is the difference between the modes?",
        answer:
          "Each mode curates a different set of styles: Nickname favors readable decorated looks, Emoji adds emoji around your text, Aesthetic, Gaming and Cute match those vibes, and Bio sticks to styles that survive strict profile fields.",
      },
      {
        question: "Why does a style look different on my phone?",
        answer:
          "Devices ship different font sets, so the same Unicode characters can render slightly differently — or as empty boxes if the glyph is missing. If that happens, pick another style.",
      },
      {
        question: "How do I copy a generated name?",
        answer:
          "Click the result and a checkmark appears when the copy succeeds. If your browser blocks the clipboard, select the text and copy it manually.",
      },
      {
        question: "Can I save my favorite names?",
        answer:
          "Yes — save any result to your local favorites list. It is stored in your browser only, never synced to a server, and you can remove entries at any time.",
      },
      {
        question: "Do styled names affect search or SEO?",
        answer:
          "Decorative Unicode generally is not indexed or matched the way plain text is. Use a plain name where you want to be found, and styled versions where you want flair.",
      },
      {
        question: "Are the styles safe for Instagram, TikTok and Discord?",
        answer:
          "Display names and bios on most platforms accept them. Handles and usernames are usually plain-text-only — check each platform's rules, since they change over time.",
      },
    ],
    related: ["font-detector", "html-entity-encoder", "signature-maker"],
    privacyExplanation:
      LOCAL + " Saved favorites stay in your browser's local storage and can be removed at any time.",
  },
};
