/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * box-shadow value parser used by the GainUtility research pipeline
 * (scripts/collect-box-shadow.mjs + scripts/analyze-box-shadow.mjs).
 *
 * The parsing rules mirror the CSS Box Shadow Generator's import parser
 * (src/components/BoxShadowGenerator.tsx), extended to keep the original
 * length units and to record how each value was resolved. Parsing decision
 * rules (none of them "fixed" silently):
 *
 *  - `none`                               → kind "none"
 *  - `inherit`/`initial`/`unset`/`revert`→ kind "global"
 *  - value made of var() functions only   → kind "varOnly"
 *  - value mixing var() with literals     → kind "varPartial" (literal layers kept)
 *  - value that does not parse            → kind "malformed" (reason recorded)
 *  - parseable literal value              → kind "ok", with layers[]
 *
 * Length units are preserved per length. A layer is usable in px-space
 * analysis only when every length is px, or when every length is rem and a
 * 16px root is assumed. Everything else is counted separately and excluded
 * from px-space distributions rather than guessed.
 */

const NAMED_COLORS = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  silver: "#c0c0c0",
  maroon: "#800000",
  navy: "#000080",
  teal: "#008080",
  lime: "#00ff00",
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const clamp255 = (n) => Math.min(255, Math.max(0, Math.round(n)));

const rgbToHex = (r, g, b) =>
  `#${[clamp255(r), clamp255(g), clamp255(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

const LENGTH_RE = /^-?(?:\d+(?:\.\d+)?|\.\d+)(px|rem|em|ex|ch|vw|vh|vmin|vmax|q|cm|mm|in|pt|pc|%)?$/i;
const FUNC_RE = /^(rgba?|hsla?)\(/i;
const HEX_RE = /^#[0-9a-f]{3,8}$/i;

/** Split a box-shadow value into top-level comma-separated shadows. */
function splitTopLevel(input) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "," && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseChannel(t) {
  const v = parseFloat(t);
  if (!Number.isFinite(v)) return null;
  return t.trim().endsWith("%") ? (v / 100) * 255 : v;
}

function parseAlpha(t) {
  const trimmed = t.trim();
  if (!trimmed) return null;
  const a = trimmed.endsWith("%") ? parseFloat(trimmed) / 100 : parseFloat(trimmed);
  if (!Number.isFinite(a)) return null;
  return clamp(a, 0, 1);
}

function parseFunctionChannels(inner) {
  const cleaned = inner.replace(/\s*,\s*/g, ",").trim();
  if (cleaned.includes(",")) return cleaned.split(",").map((s) => s.trim());
  return cleaned.split(/\s+/).filter(Boolean);
}

function parseColorToken(token) {
  const t = token.trim();
  if (HEX_RE.test(t)) {
    const hex = t.slice(1);
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const aHex = expanded.length === 8 ? expanded.slice(6) : "";
    const alpha = aHex ? parseInt(aHex, 16) / 255 : 1;
    return { hex: `#${expanded.slice(0, 6).toUpperCase()}`, alpha, syntax: "hex", omitted: false };
  }
  if (/^currentcolor$/i.test(t)) {
    return { hex: null, alpha: null, syntax: "currentcolor", omitted: false };
  }
  const func = FUNC_RE.exec(t);
  if (func) {
    const kind = func[1].toLowerCase();
    const inner = t.slice(t.indexOf("(") + 1, t.lastIndexOf(")"));
    const channels = parseFunctionChannels(inner);
    if (channels.length < 3) return null;
    const alphaIdx = kind === "rgba" || kind === "hsla" ? 3 : -1;
    const base = channels.slice(0, 3);
    let alpha = 1;
    if (alphaIdx !== -1 && channels[alphaIdx]) {
      const a = parseAlpha(channels[alphaIdx]);
      if (a === null) return null;
      alpha = a;
    }
    if (kind.startsWith("hsl")) {
      const h = parseFloat(base[0]);
      const s = parseChannel(base[1]);
      const l = parseChannel(base[2]);
      if (!Number.isFinite(h) || s === null || l === null) return null;
      const [r, g, b] = hslToRgb(h, clamp(s, 0, 100) / 100, clamp(l, 0, 100) / 100);
      return { hex: rgbToHex(r, g, b), alpha, syntax: "hsl", omitted: false };
    }
    const r = parseChannel(base[0]);
    const g = parseChannel(base[1]);
    const b = parseChannel(base[2]);
    if (r === null || g === null || b === null) return null;
    const useA = alphaIdx !== -1;
    const syntax = useA ? "rgba" : "rgb";
    return { hex: rgbToHex(r, g, b), alpha, syntax, omitted: false };
  }
  const named = NAMED_COLORS[t.toLowerCase()];
  if (named) return { hex: named.toUpperCase(), alpha: 1, syntax: "named", omitted: false };
  return null;
}

function parseLengthToken(token) {
  const t = token.trim();
  const m = LENGTH_RE.exec(t);
  if (!m) return null;
  const unit = m[1] || "px";
  return { value: parseFloat(t), unit };
}

function tokenizeLayer(s) {
  const tokens = [];
  const re = /(?:[a-zA-Z]+\([^)]*\))|(?:\S+)/g;
  let m;
  while ((m = re.exec(s))) tokens.push(m[0]);
  return tokens;
}

function parseLayer(raw) {
  let inset = false;
  const lengths = [];
  let color = null;
  let anyHidden = false;
  for (const tok of tokenizeLayer(raw)) {
    const t = tok.trim();
    if (/^inset$/i.test(t)) {
      inset = true;
      continue;
    }
    const len = parseLengthToken(t);
    if (len) {
      lengths.push(len);
      continue;
    }
    const c = parseColorToken(t);
    if (c) {
      color = c;
      continue;
    }
    // Unrecognised token in a literal (non-var) layer → value is exotic.
    anyHidden = true;
  }
  if (lengths.length < 2 || lengths.length > 4) return null;
  const [x, y, blur = { value: 0, unit: "px" }, spread = { value: 0, unit: "px" }] = lengths;
  if (blur.value < 0) return null;
  return {
    inset,
    x,
    y,
    blur,
    spread,
    color,
    exotic: anyHidden,
  };
}

/** Is the value string composed only of var() references? */
function hasVar(raw) {
  return /var\(/i.test(raw);
}

function onlyVars(raw) {
  return splitTopLevel(raw).every((part) => /^var\([^;{}]*\)$/i.test(part.trim()));
}

function layersToPx(layers, remRoot) {
  return layers
    .filter((l) => !l.exotic)
    .map((l) => {
      const units = [l.x.unit, l.y.unit, l.blur.unit, l.spread.unit];
      if (units.every((u) => u === "px")) {
        return {
          inset: l.inset,
          x: l.x.value,
          y: l.y.value,
          blur: l.blur.value,
          spread: l.spread.value,
          color: l.color,
          unitSpace: "px",
        };
      }
      if (units.every((u) => u === "rem")) {
        return {
          inset: l.inset,
          x: l.x.value * remRoot,
          y: l.y.value * remRoot,
          blur: l.blur.value * remRoot,
          spread: l.spread.value * remRoot,
          color: l.color,
          unitSpace: "rem@16",
        };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Parse one raw box-shadow value.
 * Returns { kind, layers, pxLayers, note, hasVar }.
 */
export function parseShadowValue(raw, { remRoot = 16 } = {}) {
  const trimmed = (raw || "").trim().replace(/!important$/i, "").trim();
  if (!trimmed) return { kind: "empty", layers: [], pxLayers: [], note: "empty value", hasVar: false };
  const lowered = trimmed.toLowerCase();
  if (lowered === "none") return { kind: "none", layers: [], pxLayers: [], note: "none", hasVar: false };
  if (["inherit", "initial", "unset", "revert", "revert-layer"].includes(lowered))
    return { kind: "global", layers: [], pxLayers: [], note: lowered, hasVar: false };

  const hasVarFlag = hasVar(trimmed);
  if (hasVarFlag) {
    if (onlyVars(trimmed))
      return { kind: "varOnly", layers: [], pxLayers: [], note: "unresolved var() references", hasVar: true };
    // varPartial — try to parse literal segments for what we can.
    const layers = splitTopLevel(trimmed)
      .filter((p) => !/^var\(/.test(p.trim()))
      .map(parseLayer)
      .filter(Boolean);
    const pxLayers = layersToPx(layers, remRoot);
    return {
      kind: layers.length ? "varPartial" : "varOnly",
      layers,
      pxLayers,
      note: layers.length ? "mixed var() + literal" : "unresolved var() references",
      hasVar: true,
    };
  }

  const layers = splitTopLevel(trimmed).map(parseLayer);
  if (layers.some((l) => l === null))
    return {
      kind: "malformed",
      layers: [],
      pxLayers: [],
      note: "unrecognised token or bad length count",
      hasVar: false,
    };
  if (layers.length === 0)
    return { kind: "malformed", layers: [], pxLayers: [], note: "no shadows after split", hasVar: false };
  return { kind: "ok", layers, pxLayers: layersToPx(layers, remRoot), note: "ok", hasVar: false };
}

export { splitTopLevel };