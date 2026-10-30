import type React from "react";
import { ToolId } from "./types";
import { toolsRegistry } from "./toolsRegistry";

/**
 * Single searchable index for EVERY live tool in the platform.
 * Derived entirely from toolsRegistry (metadata), so header search and the
 * ⌘K command palette can never drift out of sync.
 */

export interface SearchEntry {
  id: ToolId;
  name: string;
  category: string;
  desc: string;
  keywords: string[];
  /** Literal alias phrases ("compress pdf", "image to pdf") matched as a unit. */
  phrases: string[];
  icon: React.ReactNode;
}

/**
 * Query words that carry no intent on their own. Dropping them stops a phrase
 * like "pdf to word" from having a third of its coverage wasted on "to".
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "to", "of", "for", "in", "on", "at", "by", "from", "with",
  "and", "or", "my", "is", "it", "its", "this", "that", "be", "do", "i", "we",
  "you", "your", "how", "can", "free", "online",
  // Filler verbs in natural queries ("make my pdf smaller", "turn a photo
  // into a pdf") carry no intent of their own — the noun and adjective do.
  "make", "get", "turn", "into", "create", "need", "want", "use", "using",
  "please", "just", "now", "some", "all", "me",
]);

/** Very small English normaliser: plurals and -ing/-ed collapse together. */
const stem = (w: string): string => {
  if (w.length <= 3) return w;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("ches") || w.endsWith("shes") || w.endsWith("xes") || w.endsWith("zes")) {
    return w.slice(0, -2);
  }
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -1);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
    return w.slice(0, -1);
  }
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  return w;
};

/**
 * Intention vocabulary. Lets people search the way they think
 * ("photo to pdf", "shrink a pdf", "make a slug") instead of having to know
 * the exact tool title. Applied in both directions: query words are expanded
 * before matching, and indexed words are expanded before the index is built.
 */
const SYNONYMS: Record<string, string[]> = {
  photo: ["image"],
  picture: ["image"],
  pic: ["image"],
  img: ["image"],
  vid: ["video"],
  // A file format stands in for the thing users call it: "photo" and "image"
  // must reach the JPG/PNG tools, which is where that intent actually lands.
  jpg: ["jpeg", "image", "photo"],
  jpeg: ["image", "photo"],
  png: ["image", "photo"],
  jpe: ["jpeg"],
  smaller: ["reduce", "compress", "shrink"],
  smallerpdf: ["reduce", "compress", "shrink"],
  doc: ["word", "document"],
  docx: ["word", "document"],
  document: ["word"],
  txt: ["text"],
  xls: ["excel", "spreadsheet"],
  sheet: ["spreadsheet"],
  spreadsheet: ["excel"],
  ppt: ["powerpoint", "presentation"],
  slide: ["powerpoint", "presentation"],
  presentation: ["powerpoint"],
  link: ["url"],
  shorten: ["shortener"],
  shortenurl: ["shortener"],
  resize: ["resizer"],
  convert: ["converter"],
  convertor: ["converter"],
  compress: ["compressor"],
  shrink: ["compressor", "compress"],
  minify: ["minifier"],
  format: ["formatter", "beautifier"],
  prettify: ["formatter", "beautifier"],
  beautify: ["beautifier"],
  clean: ["sanitizer", "cleaner"],
  delete: ["remove", "remover"],
  remove: ["remover", "delete"],
  extract: ["extractor"],
  extracter: ["extractor"],
  merge: ["combine", "join"],
  combine: ["merge"],
  reorder: ["rearrange"],
  collate: ["rearrange"],
  sort: ["rearrange"],
  rotate: ["rotation"],
  rotatepages: ["rotate"],
  translate: ["translator"],
  translation: ["translator"],
  protect: ["encrypt", "lock"],
  encrypt: ["protect", "lock"],
  unlock: ["decrypt", "password"],
  decrypt: ["unlock"],
  calc: ["calculator"],
  calculator: ["calc"],
  yt: ["youtube"],
  ytdl: ["youtube"],
  qr: ["qrcode", "qr code"],
  check: ["checker", "validator"],
  validate: ["validator", "check"],
  verify: ["validator", "check"],
  hash: ["checksum", "digest"],
  password: ["passphrase"],
  signature: ["sign"],
  thumbnail: ["thumb"],
  thumb: ["thumbnail"],
  gif: ["animation"],
  audio: ["sound"],
  mute: ["silent"],
  colour: ["color"],
  centre: ["center"],
  catalogue: ["catalog"],
  optimise: ["optimize"],
  optimisation: ["optimize"],
  analyse: ["analyze"],
  customise: ["customize"],
};

const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

/** Expand a bag of words with their synonyms and normalise each to a stem. */
const expand = (words: Iterable<string>): string[] => {
  const out = new Set<string>();
  for (const w of words) {
    const s = stem(w);
    out.add(s);
    for (const syn of SYNONYMS[w] ?? []) out.add(stem(syn));
    for (const syn of SYNONYMS[s] ?? []) out.add(syn);
  }
  return [...out];
};
export const SEARCH_INDEX: SearchEntry[] = (Object.keys(toolsRegistry) as ToolId[])
  .map((id) => {
    const meta = toolsRegistry[id];
    const words = new Set<string>();
    const aliasPhrases: string[] = [];
    tokenize(meta.name).forEach((w) => words.add(w));
    tokenize(meta.desc).forEach((w) => words.add(w));
    tokenize(meta.category).forEach((w) => words.add(w));
    id.split("-").forEach((w) => w.length > 1 && words.add(w));
    for (const alias of meta.aliases ?? []) {
      const phrase = alias.trim().toLowerCase();
      if (phrase) {
        aliasPhrases.push(phrase);
        tokenize(phrase).forEach((w) => words.add(w));
      }
    }
    return {
      id,
      name: meta.name,
      category: meta.category,
      desc: meta.desc,
      // Stemmed/synonymed word bag (name + desc + category + id + alias words).
      keywords: expand(words),
      phrases: aliasPhrases,
      icon: meta.icon,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

interface Scored {
  entry: SearchEntry;
  score: number;
}

/** Bounded edit distance — bails out as soon as it exceeds `max`. */
const withinEdits = (a: string, b: string, max: number): boolean => {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = new Array<number>(b.length + 1);
  let cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return false;
    const t = prev;
    prev = cur;
    cur = t;
  }
  return prev[b.length] <= max;
};

/**
 * How strongly a single query token matches a bag of indexed tokens.
 * 3 = exact, 2 = prefix, 1 = substring or a near-miss (typo) hit.
 * This lets "pdf split" match "Split PDF" and "imag" match "Image".
 */
const tokenHit = (tokens: string[], word: string): number => {
  let best = 0;
  // 3-letter words are usually a dropped/added letter when mistyped
  // ("mrg" → "merge"), so they get the wide budget; mid-length words stay
  // strict; long words can afford to be further off ("minify" ~ "minifier").
  const allowFuzzy = word.length >= 3;
  const fuzzyBudget = word.length >= 6 || word.length <= 3 ? 2 : 1;
  for (const tok of tokens) {
    if (tok === word) return 3;
    if (best === 3) continue;
    if (tok.startsWith(word) || (word.length >= 4 && word.startsWith(tok) && tok.length >= 3)) {
      if (best < 2) best = 2;
      continue;
    }
    if (best >= 1) continue;
    if (tok.includes(word) || (word.length >= 4 && word.includes(tok))) {
      best = 1;
      continue;
    }
    if (allowFuzzy && Math.abs(tok.length - word.length) <= fuzzyBudget && withinEdits(tok, word, fuzzyBudget)) {
      best = 1;
    }
  }
  return best;
};

/**
 * Word-coverage score for a whole query against a token bag: the more query
 * words that hit (exact/prefix/substring), the higher the returned bucket.
 */
const wordCoverage = (
  tokens: string[],
  queryTokens: string[],
  all: number,
  strong: number,
  partial: number,
  weak: number
): number => {
  if (queryTokens.length === 0 || tokens.length === 0) return 0;
  let sum = 0;
  for (const word of queryTokens) sum += tokenHit(tokens, word);
  const ratio = sum / (queryTokens.length * 3);
  if (ratio >= 0.99) return all;
  if (ratio >= 0.66) return strong;
  if (ratio >= 0.4) return partial;
  if (sum > 0) return weak;
  return 0;
};

/**
 * True when `phrase` appears in `text` only at word boundaries, so "compress
 * image" no longer false-matches "Compress Images Inside PDF" (the "image"
 * part would sit in the middle of the word "images").
 */
const phraseAtWordBoundary = (text: string, phrase: string): boolean => {
  if (!text || !phrase) return false;
  let idx = -1;
  while ((idx = text.indexOf(phrase, idx + 1)) !== -1) {
    const before = idx === 0 ? " " : text[idx - 1];
    const after = text[idx + phrase.length] ?? " ";
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
  }
  return false;
};

/** Hard cap so a broad query never floods the result list. */
export const SEARCH_RESULT_LIMIT = 60;

/**
 * Rank tools against a query. Priority order:
 * 1. exact tool name   2. name prefix   3. name word match
 * 4. alias/keyword match   5. description (use-case) match   6. category match.
 */
export const searchTools = (query: string): SearchEntry[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Raw tokens keep the literal phrase rules honest; expanded tokens do the
  // synonym/typo/singular-plural matching.
  const qTokens = expand(tokenize(q));
  if (qTokens.length === 0) return [];
  /** Expanded query words (synonyms/typos allowed) for phrase coverage. */
  const qSet = new Set(qTokens);
  /** Literal query words, stemmed only — keeps alias matching honest. */
  const qLiteral = new Set(tokenize(q).map(stem));
  const scored: Scored[] = [];
  for (const entry of SEARCH_INDEX) {
    const name = entry.name.toLowerCase();
    const nameTokens = expand(tokenize(entry.name));
    const descTokens = expand(tokenize(entry.desc));
    let score = 0;

    // 1–2. Exact name and prefix matches (must end on a word boundary so a
    //      prefix isn't matched from inside a longer word).
    if (name === q) score += 120;
    else if (name.startsWith(q) && !/[a-z0-9]/.test(name[q.length] ?? "")) score += 75;
    else if (phraseAtWordBoundary(name, q)) score += 50;

    // 3. Name word coverage.
    score += wordCoverage(nameTokens, qTokens, 48, 32, 16, 7);

    // 3b. Precision tie-break. When two tools cover a query equally well, the
    //     one named with fewer words is usually the sharper answer
    //     ("Image Resizer" over "Exam Photo Resizer").
    score += Math.round(24 / Math.max(2, tokenize(entry.name).length));

    // 4. Alias phrases. An alias is the user's own words for this tool, so it
    //    outranks incidental name/description overlap. Matched as a unit:
    //    exact ("compress pdf"), word-boundary containment either way, or full
    //    word-set coverage ("how to make a pdf smaller" ⊇ "make pdf smaller").
    let phraseBonus = 0;
    for (const p of entry.phrases) {
      if (p === q) {
        // A curated alias is the user's own words for this tool, so an exact
        // hit outranks incidental name/description overlap.
        phraseBonus = 42;
        break;
      }
      if (phraseAtWordBoundary(p, q)) phraseBonus = Math.max(phraseBonus, 18);
      else if (p.includes(q)) phraseBonus = Math.max(phraseBonus, 8);
      else {
        const pSet = new Set(tokenize(p).map(stem));
        if (pSet.size >= 2 && [...pSet].every((t) => qSet.has(t))) {
          phraseBonus = Math.max(phraseBonus, 22);
        } else if (qLiteral.size >= 2 && [...qLiteral].every((t) => pSet.has(t))) {
          phraseBonus = Math.max(phraseBonus, 16);
        }
      }
      if (phraseBonus >= 42) break;
    }

    // 4b. Word-level keyword match (name+desc+id+alias words). Phrases and
    //     words express the same intent, so take the stronger of the two
    //     rather than stacking them.
    let keywordBonus = 0;
    for (const kw of entry.keywords) {
      if (kw === q) {
        keywordBonus = 34;
        break;
      }
      if (kw.startsWith(q)) keywordBonus = Math.max(keywordBonus, 18);
      else if (kw.includes(q)) keywordBonus = Math.max(keywordBonus, 8);
    }
    score += Math.max(phraseBonus, keywordBonus);

    // 5. Description / use-case word coverage.
    score += wordCoverage(descTokens, qTokens, 14, 8, 4, 2);

    // 6. Category phrase.
    if (entry.category.toLowerCase().includes(q)) score += 5;

    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
  return scored.slice(0, SEARCH_RESULT_LIMIT).map((s) => s.entry);
};
