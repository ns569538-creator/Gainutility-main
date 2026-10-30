/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Curated Unicode symbol collections for the /symbols library pages.
 * Self-contained (no imports) so the Node validator can import it directly.
 */

export interface SymbolCollection {
  id: string;
  name: string;
  desc: string;
  items: string[];
}

export const SYMBOL_COLLECTIONS: SymbolCollection[] = [
  {
    id: "hearts",
    name: "Heart Symbols",
    desc: "Text hearts that copy cleanly into bios, nicknames and captions.",
    items: [
      "♥", "♡", "❤", "❥", "❦", "❧", "❣", "💕", "💖", "💗",
      "💘", "💝", "💞", "💟", "🩷", "🩵", "🩶", "🤍", "🖤", "💜",
      "💙", "💚", "💛", "🧡", "💌", "💑", "💓", "💔", "❤️‍🔥", "❤️‍🩹",
      "🫀", "😍", "😘", "🥰", "💋", "🫶",
    ],
  },
  {
    id: "cute",
    name: "Cute Symbols",
    desc: "Flowers, sparkles and soft marks for adorable profile names.",
    items: [
      "✿", "❀", "✾", "❁", "❃", "❄", "❅", "❆", "✧", "✦",
      "⋆", "☆", "★", "♡", "๑", "༄", "༈", "ଓ", "༼", "꒱",
      "꒰", "⊹", "˖", "ꕤ", "𖦹", "ෆ", "🌸", "🎀", "∘", "•",
      "◦", "∙", "˗", "༶", "◍", "◌", "❊", "✽", "⟢", "⟣",
    ],
  },
  {
    id: "aesthetic",
    name: "Aesthetic Symbols",
    desc: "Minimal geometry, lines and ornaments for clean mood-board names.",
    items: [
      "─", "━", "═", "║", "░", "▒", "▓", "▪", "▫", "∙",
      "•", "◦", "◇", "◆", "◈", "❖", "✦", "⊘", "∞", "∾",
      "～", "≋", "≈", "∘", "°", "·", "┆", "┇", "┊", "︴",
      "༄", "༆", "༒", "࿏", "࿐", "༑", "ᚠ", "ᚢ", "᛭", "৲",
      "︶", "ㄣ", "ㄘ", "╭", "╮", "╰", "╯", "࿚", "꜀", "Ͱ",
    ],
  },
  {
    id: "gaming",
    name: "Gaming Symbols",
    desc: "Sharp marks for tags, clan tags and loadout names.",
    items: [
      "✪", "✱", "✲", "✳", "✴", "❖", "⌘", "⚔", "⚑", "⚓",
      "✸", "✹", "✺", "❂", "⧫", "⬟", "▰", "▱", "◢", "◣",
      "◤", "◥", "⬡", "⬢", "≪", "≫", "⚡", "☠", "♜", "♞",
      "▶", "▷", "◂", "▸", "๊", "ℜ", "·", "×", "∴", "∵",
      "⟦", "⟧", "⟨", "⟩", "⌁", "⚔︎", "彡", "꙰", "Ꙩ", "✤",
    ],
  },
];

export const SYMBOL_COLLECTION_BY_ID: Record<string, SymbolCollection> = Object.freeze(
  Object.fromEntries(SYMBOL_COLLECTIONS.map((c) => [c.id, c]))
);
