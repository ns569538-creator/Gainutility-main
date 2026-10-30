/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Stylish-name style engine. Self-contained (no imports) so the Node
 * validator (scripts/validate-stylish-names.mjs) can import it directly
 * with native type stripping.
 *
 * Font maps are built at module load. For `validation: "nfkd"` styles each
 * candidate glyph is included only when its NFKD normalization equals the
 * source ASCII character (case-insensitively for case-folded styles), so a
 * normalizing platform can only ever reduce the text back to readable
 * letters — never to garbage. Known Unicode hole positions are patched with
 * probe-verified satellite codepoints (e.g. italic "h" → U+210E).
 * `validation: "curated"` styles use hand-picked tables that do not satisfy
 * that invariant and are listed explicitly for the validator.
 */

export type StyleGroup = "font" | "spacing" | "wrapper" | "preset";

export type StyleVibe = "gaming" | "luxury" | "aesthetic" | "cute" | "dark" | "funny";

export type StyleCompat = "good" | "limited" | "varies";

export type StyleValidation = "nfkd" | "curated";

interface StyleBase {
  id: string;
  name: string;
  group: StyleGroup;
  vibes: StyleVibe[];
  compat: StyleCompat;
  validation?: StyleValidation;
}

export interface FontStyle extends StyleBase {
  kind: "font";
  group: "font";
  map: Record<string, string>;
}

export interface WrapperStyle extends StyleBase {
  kind: "wrapper";
  group: "wrapper";
  wrap: [string, string];
}

export interface TransformStyle extends StyleBase {
  kind: "transform";
  group: "spacing";
  fn: (s: string) => string;
}

export interface PresetStyle extends StyleBase {
  kind: "preset";
  group: "preset";
  compose: string[];
}

export type NameStyle = FontStyle | WrapperStyle | TransformStyle | PresetStyle;

/* ── helpers ─────────────────────────────────────────────────────────── */

const fromCp = (n: number): string => String.fromCodePoint(n);

interface FontSpec {
  upper?: number;
  lower?: number;
  /** Explicit [asciiChar, codepoint] digit pairs (base offset not always value-aligned). */
  digitPairs?: Array<[string, number]>;
  /** Candidate codepoint (decimal string) → replacement glyph for Unicode holes. */
  satellites?: Record<string, string>;
  /** Explicit [asciiChar, codepoint] pairs (used by superscript/subscript). */
  explicit?: Array<[string, number]>;
  /** Map a–z to the same glyph as A–Z (uppercase-only alphabets). */
  foldCase?: boolean;
}

/** Build an NFKD-validated font map (holes patched via satellites, then filtered). */
const nfkdMap = (spec: FontSpec): Record<string, string> => {
  const out: Record<string, string> = {};
  const put = (ascii: string, glyph: string): void => {
    const nfkd = glyph.normalize("NFKD");
    if (nfkd === ascii || nfkd.toLowerCase() === ascii.toLowerCase()) out[ascii] = glyph;
  };
  if (spec.upper !== undefined) {
    for (let i = 0; i < 26; i++) {
      const ascii = String.fromCharCode(65 + i);
      const cp = spec.upper + i;
      put(ascii, spec.satellites?.[String(cp)] ?? fromCp(cp));
      if (spec.foldCase && out[ascii] !== undefined) out[String.fromCharCode(97 + i)] = out[ascii];
    }
  }
  if (spec.lower !== undefined) {
    for (let i = 0; i < 26; i++) {
      const ascii = String.fromCharCode(97 + i);
      const cp = spec.lower + i;
      put(ascii, spec.satellites?.[String(cp)] ?? fromCp(cp));
    }
  }
  for (const [ascii, cp] of spec.digitPairs ?? []) {
    put(ascii, fromCp(cp));
  }
  for (const [ascii, cp] of spec.explicit ?? []) {
    put(ascii, fromCp(cp));
  }
  return out;
};

/** Build a curated (NFKD-exempt) font map from [ascii, glyph] pairs. */
const curatedMap = (pairs: Array<[string, string]>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [ascii, glyph] of pairs) out[ascii] = glyph;
  return out;
};

const upperLowerPairs = (
  glyphFor: (asciiLower: string, i: number) => string,
  foldCase: boolean
): Array<[string, string]> => {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < 26; i++) {
    const lower = String.fromCharCode(97 + i);
    const glyph = glyphFor(lower, i);
    pairs.push([lower, glyph]);
    if (foldCase) pairs.push([String.fromCharCode(65 + i), glyph]);
  }
  return pairs;
};

/* ── curated tables (probe-verified codepoints) ─────────────────────── */

/** Small caps: a–z (q and x have no small-cap form and pass through). */
const SMALL_CAPS: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
  i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
  r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", y: "ʏ", z: "ᴢ",
};

/** Superscript letters (hand-picked; q, x use no distinct form beyond ˢ/ˣ for x). */
const SUPERSCRIPT: Array<[string, string]> = [
  ["A", "ᴬ"], ["B", "ᴮ"], ["C", "ᶜ"], ["D", "ᴰ"], ["E", "ᴱ"], ["F", "ꜰ"],
  ["G", "ᴳ"], ["H", "ᴴ"], ["I", "ᴵ"], ["J", "ᴶ"], ["K", "ᴷ"], ["L", "ᴸ"],
  ["M", "ᴹ"], ["N", "ᴺ"], ["O", "ᴼ"], ["P", "ᴾ"], ["R", "ᴿ"], ["S", "ˢ"],
  ["T", "ᵀ"], ["U", "ᵁ"], ["V", "ⱽ"], ["W", "ᵂ"], ["X", "ˣ"], ["Y", "ʸ"],
  ["Z", "ᶻ"],
  ["a", "ᵃ"], ["b", "ᵇ"], ["c", "ᶜ"], ["d", "ᵈ"], ["e", "ᵉ"], ["f", "ᶠ"],
  ["g", "ᵍ"], ["h", "ʰ"], ["i", "ⁱ"], ["j", "ʲ"], ["k", "ᵏ"], ["l", "ˡ"],
  ["m", "ᵐ"], ["n", "ⁿ"], ["o", "ᵒ"], ["p", "ᵖ"], ["r", "ʳ"], ["s", "ˢ"],
  ["t", "ᵗ"], ["u", "ᵘ"], ["v", "ᵛ"], ["w", "ʷ"], ["x", "ˣ"], ["y", "ʸ"],
  ["z", "ᶻ"],
  ["0", "⁰"], ["1", "¹"], ["2", "²"], ["3", "³"], ["4", "⁴"],
  ["5", "⁵"], ["6", "⁶"], ["7", "⁷"], ["8", "⁸"], ["9", "⁹"],
];

/** Subscript letters (sparse set — missing letters pass through). */
const SUBSCRIPT: Array<[string, string]> = [
  ["a", "ₐ"], ["e", "ₑ"], ["o", "ₒ"], ["x", "ₓ"], ["h", "ₕ"], ["k", "ₖ"],
  ["l", "ₗ"], ["m", "ₘ"], ["n", "ₙ"], ["p", "ₚ"], ["s", "ₛ"], ["t", "ₜ"],
  ["0", "₀"], ["1", "₁"], ["2", "₂"], ["3", "₃"], ["4", "₄"],
  ["5", "₅"], ["6", "₆"], ["7", "₇"], ["8", "₈"], ["9", "₉"],
];

/** Upside-down map (curated; some glyphs are plain letters). */
const UPSIDE_DOWN: Array<[string, string]> = [
  ["a", "ɐ"], ["b", "q"], ["c", "ɔ"], ["d", "p"], ["e", "ǝ"], ["f", "ɟ"],
  ["g", "ƃ"], ["h", "ɥ"], ["i", "ᴉ"], ["j", "ɾ"], ["k", "ʞ"], ["l", "l"],
  ["m", "ɯ"], ["n", "n"], ["o", "o"], ["p", "d"], ["q", "b"], ["r", "ɹ"],
  ["s", "ʇ"], ["t", "ʇ"], ["u", "n"], ["v", "ʌ"], ["w", "ʍ"], ["x", "x"],
  ["y", "ʎ"], ["z", "z"],
  ["A", "∀"], ["1", "Ɩ"],
];

/** Upside-down entries with uppercase folded onto the lowercase glyph. */
const upsideDownMap = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [ascii, glyph] of UPSIDE_DOWN) out[ascii] = glyph;
  for (let i = 0; i < 26; i++) {
    const lower = String.fromCharCode(97 + i);
    const upper = String.fromCharCode(65 + i);
    if (out[lower] !== undefined && out[upper] === undefined) out[upper] = out[lower];
  }
  return out;
};

/** Uppercase-only alphabets (negative squared / circled) as curated pairs. */
const negativeMap = (base: number): Record<string, string> =>
  curatedMap(
    Array.from({ length: 26 }, (_, i) => {
      const glyph = fromCp(base + i);
      return [String.fromCharCode(65 + i), glyph] as [string, string];
    }).concat(
      Array.from({ length: 26 }, (_, i) => {
        const glyph = fromCp(base + i);
        return [String.fromCharCode(97 + i), glyph] as [string, string];
      })
    )
  );

/* ── font styles ─────────────────────────────────────────────────────── */

const font = (
  id: string,
  name: string,
  map: Record<string, string>,
  vibes: StyleVibe[],
  compat: StyleCompat = "good",
  validation: StyleValidation = "nfkd"
): FontStyle => ({ id, name, group: "font", kind: "font", vibes, compat, validation, map });

const FONT_STYLES: FontStyle[] = [
  font("bold", "Bold", nfkdMap({ upper: 0x1d400, lower: 0x1d41a, digitPairs: digitsFrom(0x1d7ce) }), ["gaming", "luxury"]),
  font("italic", "Italic", nfkdMap({ upper: 0x1d434, lower: 0x1d44e, satellites: { [String(0x1d455)]: "ℎ" } }), ["aesthetic", "cute"]),
  font("bold-italic", "Bold Italic", nfkdMap({ upper: 0x1d468, lower: 0x1d482 }), ["gaming"]),
  font("script", "Script", nfkdMap({
    upper: 0x1d49c,
    lower: 0x1d4b6,
    satellites: {
      [String(0x1d49d)]: "ℬ", [String(0x1d4a0)]: "ℰ", [String(0x1d4a1)]: "ℱ",
      [String(0x1d4a3)]: "ℋ", [String(0x1d4a4)]: "ℐ", [String(0x1d4a7)]: "ℒ",
      [String(0x1d4a8)]: "ℳ", [String(0x1d4ad)]: "ℛ",
      [String(0x1d4ba)]: "ℯ", [String(0x1d4bc)]: "ℊ", [String(0x1d4c4)]: "ℴ",
    },
  }), ["cute", "aesthetic", "luxury"]),
  font("script-bold", "Bold Script", nfkdMap({ upper: 0x1d4d0, lower: 0x1d4ea }), ["luxury"]),
  font("fraktur", "Gothic", nfkdMap({
    upper: 0x1d504,
    lower: 0x1d51e,
    satellites: {
      [String(0x1d506)]: "ℭ", [String(0x1d50b)]: "ℌ", [String(0x1d50c)]: "ℑ",
      [String(0x1d515)]: "ℜ", [String(0x1d51d)]: "ℨ",
    },
  }), ["dark"]),
  font("bold-fraktur", "Bold Gothic", nfkdMap({ upper: 0x1d56c, lower: 0x1d586 }), ["dark", "gaming"]),
  font("double-struck", "Double Struck", nfkdMap({
    upper: 0x1d538,
    lower: 0x1d552,
    digitPairs: digitsFrom(0x1d7d8),
    satellites: {
      [String(0x1d53a)]: "ℂ", [String(0x1d53f)]: "ℍ", [String(0x1d545)]: "ℕ",
      [String(0x1d547)]: "ℙ", [String(0x1d548)]: "ℚ", [String(0x1d549)]: "ℝ",
      [String(0x1d551)]: "ℤ",
    },
  }), ["aesthetic"]),
  font("sans", "Sans", nfkdMap({ upper: 0x1d5a0, lower: 0x1d5ba, digitPairs: digitsFrom(0x1d7e2) }), ["aesthetic"]),
  font("sans-bold", "Sans Bold", nfkdMap({ upper: 0x1d5d4, lower: 0x1d5ee, digitPairs: digitsFrom(0x1d7ec) }), ["gaming"]),
  font("sans-italic", "Sans Italic", nfkdMap({ upper: 0x1d608, lower: 0x1d622 }), ["aesthetic"]),
  font("sans-bold-italic", "Sans Bold Italic", nfkdMap({ upper: 0x1d63c, lower: 0x1d656 }), ["gaming"]),
  font("monospace", "Monospace", nfkdMap({ upper: 0x1d670, lower: 0x1d68a, digitPairs: digitsFrom(0x1d7f6) }), ["gaming"]),
  font("fullwidth", "Fullwidth", nfkdMap({ upper: 0xff21, lower: 0xff41, digitPairs: digitsFrom(0xff10) }), ["aesthetic", "funny"]),
  font("circled", "Circled", nfkdMap({
    upper: 0x24b6,
    lower: 0x24d0,
    digitPairs: [["1", 0x2460], ["2", 0x2461], ["3", 0x2462], ["4", 0x2463], ["5", 0x2464],
      ["6", 0x2465], ["7", 0x2466], ["8", 0x2467], ["9", 0x2468], ["0", 0x24ea]],
  }), ["cute"]),
  font("squared", "Squared", nfkdMap({ upper: 0x1f130, foldCase: true }), ["gaming"]),
  font("superscript", "Superscript", curatedMap(SUPERSCRIPT), ["aesthetic"], "limited", "curated"),
  font("subscript", "Subscript", curatedMap(SUBSCRIPT), ["aesthetic"], "limited", "curated"),
  font("small-caps", "Small Caps", curatedMap(upperLowerPairs((_, i) => SMALL_CAPS[String.fromCharCode(97 + i)] ?? "", true).filter(([, g]) => g !== "")), ["luxury", "aesthetic"], "good", "curated"),
  font("negative-squared", "Negative Squared", negativeMap(0x1f170), ["gaming"], "varies", "curated"),
  font("negative-circled", "Negative Circled", negativeMap(0x1f150), ["gaming"], "varies", "curated"),
  font("parenthesized", "Parenthesized", curatedMap(upperLowerPairs((_, i) => fromCp(0x249c + i), true)), ["cute"], "good", "curated"),
  font("upside-down", "Upside Down", upsideDownMap(), ["funny"], "varies", "curated"),
  font("dingbat-numbers", "Dingbat Numbers", curatedMap(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [String(n), fromCp(0x2775 + n)] as [string, string])
  ), ["cute"], "varies", "curated"),
];

function digitsFrom(base: number): Array<[string, number]> {
  const pairs: Array<[string, number]> = [];
  for (let i = 0; i < 10; i++) pairs.push([String(i), base + i]);
  return pairs;
}

/* ── transform styles ────────────────────────────────────────────────── */

const transform = (
  id: string,
  name: string,
  fn: (s: string) => string,
  vibes: StyleVibe[],
  compat: StyleCompat = "good"
): TransformStyle => ({ id, name, group: "spacing", kind: "transform", vibes, compat, fn });

const combineEach = (mark: string) => (s: string): string =>
  Array.from(s).map((ch) => (ch === " " ? ch : ch + mark)).join("");

const TRANSFORM_STYLES: TransformStyle[] = [
  transform("spaced", "Spaced", (s) => Array.from(s).join(" "), ["aesthetic", "cute"]),
  transform("spaced-wide", "Wide Spaced", (s) => Array.from(s).join("\u2003"), ["aesthetic", "luxury"]),
  transform("lowercase", "Lowercase", (s) => s.toLowerCase(), ["cute"]),
  transform("uppercase", "UPPERCASE", (s) => s.toUpperCase(), ["gaming"]),
  transform("reversed", "Reversed", (s) => Array.from(s).reverse().join(""), ["funny", "dark"]),
  transform("strikethrough", "Strikethrough", combineEach("\u0336"), ["funny", "dark"]),
  transform("underline", "Underlined", combineEach("\u0332"), ["aesthetic"]),
  transform("dotted", "Dotted", (s) => Array.from(s).join("\u00b7"), ["aesthetic"]),
  transform("hyphen", "Hyphenated", (s) => Array.from(s).join("-"), ["gaming"]),
  transform("alt-caps", "Alt Caps", (s) =>
    Array.from(s).map((ch, i) => (/[a-z]/i.test(ch) ? (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()) : ch)).join(""),
  ["funny", "cute"]),
];

/* ── wrapper styles ──────────────────────────────────────────────────── */

const wrapper = (
  id: string,
  name: string,
  prefix: string,
  suffix: string,
  vibes: StyleVibe[],
  compat: StyleCompat = "good"
): WrapperStyle => ({ id, name, group: "wrapper", kind: "wrapper", vibes, compat, wrap: [prefix, suffix] });

const WRAPPER_STYLES: WrapperStyle[] = [
  wrapper("cjk", "CJK Brackets", "【", "】", ["gaming"]),
  wrapper("lenticular", "Lenticular", "「", "」", ["aesthetic", "cute"]),
  wrapper("double-lenticular", "Double Lenticular", "『", "』", ["aesthetic"]),
  wrapper("angle", "Angle", "⟨", "⟩", ["luxury"]),
  wrapper("double-angle", "Double Angle", "⟪", "⟫", ["luxury"]),
  wrapper("tortoise", "Tortoise", "〔", "〕", ["aesthetic"]),
  wrapper("white-tortoise", "White Tortoise", "〖", "〗", ["aesthetic"]),
  wrapper("parens", "Parentheses", "(", ")", ["funny"]),
  wrapper("fullwidth-parens", "Fullwidth Parentheses", "（", "）", ["aesthetic"]),
  wrapper("square", "Square Brackets", "[", "]", ["gaming"]),
  wrapper("curly", "Curly Braces", "{", "}", ["gaming"]),
  wrapper("guillemets", "Guillemets", "«", "»", ["luxury"]),
  wrapper("single-guillemets", "Single Guillemets", "‹", "›", ["luxury"]),
  wrapper("chevrons", "Chevrons", "❮", "❯", ["dark"]),
  wrapper("corner", "Corners", "⌜", "⌝", ["aesthetic"]),
  wrapper("re-corner", "Reverse Corners", "⌞", "⌟", ["aesthetic"]),
  wrapper("brace-alt", "Alt Braces", "⦃", "⦄", ["gaming"]),
  wrapper("shell", "Shell", "⦅", "⦆", ["aesthetic"]),
  wrapper("white-square", "White Square", "〚", "〛", ["aesthetic"]),
  wrapper("white-lenticular", "White Lenticular", "〘", "〙", ["aesthetic"]),
  wrapper("star", "Star", "★", "★", ["gaming", "cute"]),
  wrapper("star-outline", "Star Outline", "☆", "☆", ["cute", "aesthetic"]),
  wrapper("sparkle", "Sparkle", "✦", "✦", ["aesthetic", "luxury"]),
  wrapper("sparkle-sm", "Small Sparkle", "✧", "✧", ["cute"]),
  wrapper("star-op", "Operator Star", "⋆", "⋆", ["aesthetic"]),
  wrapper("heart-outline", "Heart Outline", "♡", "♡", ["cute"]),
  wrapper("heart", "Heart", "♥", "♥", ["cute", "dark"]),
  wrapper("heart-spark", "Sparkling Heart", "❤", "❤", ["cute"], "varies"),
  wrapper("flower", "Flower", "✿", "✿", ["cute"]),
  wrapper("flower2", "Flower 2", "❀", "❀", ["cute", "aesthetic"]),
  wrapper("flower-paren", "Flower Parentheses", "꒰", "꒱", ["cute"]),
  wrapper("divider", "Divider", "⊹", "⊹", ["aesthetic"]),
  wrapper("paren-arch", "Arch", "⸃", "⸄", ["aesthetic"]),
  wrapper("wave", "Wave", "〜", "〜", ["cute", "aesthetic"]),
  wrapper("burst", "Burst", "✰", "✰", ["gaming"]),
  wrapper("moon", "Moon", "☾", "☽", ["aesthetic", "dark"]),
  wrapper("sun", "Sun", "☀", "☀", ["cute"]),
  wrapper("floral", "Floral", "❁", "❁", ["cute"]),
  wrapper("dundee", "Dundee", "๑", "๑", ["cute"]),
  wrapper("snow", "Snowflake", "❄", "❄", ["aesthetic"]),
  wrapper("diamond", "Diamond", "❖", "❖", ["luxury"]),
  wrapper("bullet-fill", "Filled Bullet", "●", "●", ["gaming"]),
  wrapper("bullet", "Bullet", "○", "○", ["aesthetic"]),
  wrapper("asterisk-flower", "Asterisk Flower", "✱", "✱", ["aesthetic"]),
  wrapper("snowflake2", "Snowflake 2", "❋", "❋", ["aesthetic"]),
  wrapper("asterism", "Asterism", "⁂", "⁂", ["dark"]),
  wrapper("reference", "Reference Mark", "※", "※", ["aesthetic"]),
  wrapper("florette", "Florette", "⚘", "⚘", ["cute"]),
  wrapper("circled-star", "Circled Star", "✪", "✪", ["gaming"]),
  wrapper("mystic-open", "Mystic Brackets", "༺", "༻", ["dark", "gaming"]),
  wrapper("quote-right", "Quote Right", "»", "", ["luxury"]),
  wrapper("pointer", "Pointer", "☛", "", ["gaming"]),
  wrapper("furigana", "Furigana", "", "彡", ["aesthetic"]),
  wrapper("tibetan", "Tibetan Mark", "", "༏", ["gaming"], "varies"),
];

/* ── preset styles (compose other styles in order) ───────────────────── */

const preset = (
  id: string,
  name: string,
  compose: string[],
  vibes: StyleVibe[],
  compat: StyleCompat = "good"
): PresetStyle => ({ id, name, group: "preset", kind: "preset", vibes, compat, compose });

const PRESET_STYLES: PresetStyle[] = [
  preset("gaming-preset", "Gaming", ["small-caps", "cjk"], ["gaming"]),
  preset("gaming-esports", "Esports", ["uppercase", "negative-squared"], ["gaming"], "varies"),
  preset("luxury-preset", "Luxury", ["small-caps", "diamond"], ["luxury"]),
  preset("luxury-script", "Luxury Script", ["script", "star"], ["luxury"]),
  preset("aesthetic-preset", "Aesthetic", ["spaced-wide", "moon"], ["aesthetic"]),
  preset("aesthetic-dot", "Aesthetic Dotted", ["dotted"], ["aesthetic"]),
  preset("cute-preset", "Cute", ["circled", "heart-outline"], ["cute"]),
  preset("cute-paren", "Cute Paren", ["parenthesized", "flower"], ["cute"]),
  preset("dark-preset", "Dark", ["fraktur", "cjk"], ["dark"]),
  preset("funny-preset", "Funny", ["upside-down", "parens"], ["funny"], "varies"),
  preset("royal", "Royal", ["double-struck", "sparkle"], ["luxury"]),
  preset("gothic", "Gothic", ["fraktur", "chevrons"], ["dark"]),
  preset("dreamy", "Dreamy", ["script", "star-outline"], ["cute", "aesthetic"]),
  preset("night", "Night", ["bold", "moon"], ["dark", "aesthetic"]),
  preset("retro", "Retro", ["fullwidth", "flower"], ["funny", "aesthetic"]),
  preset("code-tag", "Code Tag", ["monospace", "square"], ["gaming"]),
  preset("winter", "Winter", ["sans-bold", "snow"], ["aesthetic"]),
  preset("mystic", "Mystic", ["script-bold", "asterism"], ["dark"]),
];

/* ── registry ────────────────────────────────────────────────────────── */

export const STYLES: NameStyle[] = [
  ...FONT_STYLES,
  ...TRANSFORM_STYLES,
  ...WRAPPER_STYLES,
  ...PRESET_STYLES,
];

export const STYLE_BY_ID: Record<string, NameStyle> = Object.freeze(
  Object.fromEntries(STYLES.map((s) => [s.id, s]))
);

const PRESET_DEPTH_LIMIT = 8;

/** Apply one style to text. Presets resolve recursively through STYLE_BY_ID. */
export const applyStyle = (style: NameStyle, input: string): string => {
  switch (style.kind) {
    case "font": {
      let out = "";
      for (const ch of input) out += style.map[ch] ?? ch;
      return out;
    }
    case "wrapper":
      return style.wrap[0] + input + style.wrap[1];
    case "transform":
      return style.fn(input);
    case "preset": {
      let out = input;
      for (let depth = 0; depth < PRESET_DEPTH_LIMIT && depth < style.compose.length; depth++) {
        const step = STYLE_BY_ID[style.compose[depth]];
        if (!step) break;
        out = applyStyle(step, out);
      }
      return out;
    }
  }
};

export const applyStyleById = (styleId: string, input: string): string => {
  const style = STYLE_BY_ID[styleId];
  return style ? applyStyle(style, input) : input;
};
