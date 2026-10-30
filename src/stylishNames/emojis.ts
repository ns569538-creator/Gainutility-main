/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Curated emoji sets for decorating names. Self-contained (no imports)
 * so the Node validator can import it directly.
 */

export interface EmojiCollection {
  id: string;
  name: string;
  desc: string;
  items: string[];
}

export const EMOJI_COLLECTIONS: EmojiCollection[] = [
  {
    id: "emoji-hearts",
    name: "Heart Emoji",
    desc: "Hearts and love marks for sweet profile names.",
    items: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💕",
      "💖", "💗", "💘", "💝", "💞", "💟", "♥️", "💌", "🫶", "🥰",
    ],
  },
  {
    id: "emoji-sparkles",
    name: "Sparkle Emoji",
    desc: "Stars, sparkles and shine for names that should twinkle.",
    items: [
      "✨", "⭐", "🌟", "💫", "⚡", "🔥", "❄️", "🌈", "☀️", "🌙",
      "🎇", "🎆", "💎", "🌠", "🪩", "🔆", "🍀", "🫧", "🌊", "❇️",
    ],
  },
  {
    id: "emoji-cute",
    name: "Cute Emoji",
    desc: "Soft, friendly faces and critters for adorable names.",
    items: [
      "🌸", "🍓", "🐱", "🐶", "🐰", "🐻", "🐼", "🦊", "🦄", "🦋",
      "🐝", "🐞", "🍑", "🍰", "🧁", "🍭", "🌈", "☁️", "🫧", "🎀",
    ],
  },
  {
    id: "emoji-gaming",
    name: "Gaming Emoji",
    desc: "Controller-and-glory marks for tags and clan names.",
    items: [
      "🎮", "🕹️", "🏆", "🎯", "🎲", "🃏", "⚔️", "🛡️", "👑", "💀",
      "🔥", "⚡", "🚀", "🤖", "👾", "🥇", "💣", "🧨", "🗺️", "🏁",
    ],
  },
  {
    id: "emoji-food",
    name: "Food Emoji",
    desc: "Snacks and sweets for names that are pure comfort.",
    items: [
      "🍩", "🍪", "🍦", "🍬", "🍫", "🍿", "🥑", "🍕", "🍔", "🍣",
      "🌮", "🍜", "🧁", "🍰", "🧇", "🥞", "🍑", "🍒", "🍇", "🍉",
    ],
  },
  {
    id: "emoji-nature",
    name: "Nature Emoji",
    desc: "Plants, weather and wildlife for calm, outdoorsy names.",
    items: [
      "🌿", "🍂", "🍁", "🌻", "🌹", "🌺", "🌵", "🌲", "🌙", "⭐",
      "🌊", "🏔️", "🌋", "⛅", "🌦️", "🌪️", "🍄", "🌾", "🪷", "🦋",
    ],
  },
];

export const EMOJI_COLLECTION_BY_ID: Record<string, EmojiCollection> = Object.freeze(
  Object.fromEntries(EMOJI_COLLECTIONS.map((c) => [c.id, c]))
);

/** Flat list used by emoji-mode generation. */
export const EMOJI_FLAT: string[] = EMOJI_COLLECTIONS.flatMap((c) => c.items);
