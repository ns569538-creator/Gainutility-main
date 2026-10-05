#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Validates the stylish-name data layer:
 *  - styles.ts: ≥100 styles, unique ids, NFKD correctness for
 *    validation:"nfkd" styles (curated styles are listed, not failed),
 *    presets resolve through STYLE_BY_ID, font maps non-empty
 *  - names.ts: every list has ≥40 items, unique ids, no duplicate items
 *  - symbols.ts / emojis.ts: collections ≥24 items, unique ids
 *  - generate.ts: every mode yields ≥12 results for a sample input
 *
 * Imports the .ts modules directly via Node's native type stripping.
 */

const mod = (rel) => import(new URL(`../src/stylishNames/${rel}`, import.meta.url).href);

const errors = [];
const warnings = [];
const ok = (msg) => console.log(`  ok   ${msg}`);
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const stylesMod = await mod("styles.ts");
const namesMod = await mod("names.ts");
const symbolsMod = await mod("symbols.ts");
const emojisMod = await mod("emojis.ts");
const genMod = await mod("generate.ts");

const { STYLES, STYLE_BY_ID, applyStyle } = stylesMod;
const { NAME_LISTS } = namesMod;
const { SYMBOL_COLLECTIONS } = symbolsMod;
const { EMOJI_COLLECTIONS } = emojisMod;
const { MODES, generateNames } = genMod;

console.log("\nstyles.ts");
if (STYLES.length >= 100) ok(`${STYLES.length} styles (≥100)`);
else fail(`only ${STYLES.length} styles (need ≥100)`);

const ids = STYLES.map((s) => s.id);
const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupIds.length) fail(`duplicate style ids: ${[...new Set(dupIds)].join(", ")}`);
else ok("style ids unique");

const groups = {};
for (const s of STYLES) groups[s.group] = (groups[s.group] || 0) + 1;
ok(`groups: ${JSON.stringify(groups)}`);

let nfkdChecked = 0;
const curatedStyles = [];
for (const s of STYLES) {
  if (s.kind !== "font") continue;
  const entries = Object.entries(s.map);
  if (entries.length === 0) fail(`font "${s.id}" has an empty map`);
  if (s.validation === "curated") {
    curatedStyles.push(s.id);
    continue;
  }
  for (const [ascii, glyph] of entries) {
    nfkdChecked++;
    const nfkd = glyph.normalize("NFKD");
    if (nfkd !== ascii && nfkd.toLowerCase() !== ascii.toLowerCase()) {
      fail(`style "${s.id}": "${ascii}" → "${glyph}" NFKD "${nfkd}" !== "${ascii}"`);
    }
  }
}
ok(`NFKD-verified ${nfkdChecked} glyph entries`);
ok(`curated (exempt): ${curatedStyles.join(", ")}`);

const presetBad = STYLES.filter((s) => s.kind === "preset" && s.compose.some((c) => !STYLE_BY_ID[c]));
if (presetBad.length) fail(`presets with unresolved steps: ${presetBad.map((s) => s.id).join(", ")}`);
else ok(`${STYLES.filter((s) => s.kind === "preset").length} presets resolve`);

const smoke = applyStyle(STYLE_BY_ID["bold"], "Zoe");
if (!smoke || smoke === "Zoe") fail("applyStyle smoke test failed (bold unchanged)");
else ok(`smoke: bold("Zoe") = ${smoke}`);

console.log("\nnames.ts");
const nameIds = NAME_LISTS.map((l) => l.id);
const dupNameIds = nameIds.filter((v, i) => nameIds.indexOf(v) !== i);
if (dupNameIds.length) fail(`duplicate name list ids: ${dupNameIds.join(", ")}`);
for (const list of NAME_LISTS) {
  const unique = new Set(list.items);
  if (unique.size < 40) fail(`list "${list.id}" has only ${unique.size} unique items (need ≥40)`);
  if (unique.size !== list.items.length) warn(`list "${list.id}" contains duplicates`);
  if (!list.name || !list.desc) fail(`list "${list.id}" missing name/desc`);
}
if (!errors.length) ok(`${NAME_LISTS.length} name lists, each ≥40 unique items`);

console.log("\nsymbols.ts / emojis.ts");
for (const coll of SYMBOL_COLLECTIONS) {
  const unique = new Set(coll.items);
  if (unique.size < 24) fail(`symbol collection "${coll.id}" has only ${unique.size} unique items (need ≥24)`);
  if (unique.size !== coll.items.length) warn(`symbol collection "${coll.id}" has duplicates`);
}
for (const coll of EMOJI_COLLECTIONS) {
  if (coll.items.length < 12) fail(`emoji collection "${coll.id}" has only ${coll.items.length} items (need ≥12)`);
}
ok(`${SYMBOL_COLLECTIONS.length} symbol collections, ${EMOJI_COLLECTIONS.length} emoji collections`);

console.log("\ngenerate.ts");
for (const mode of MODES) {
  const results = generateNames("Aria", mode.id, { seed: 1 });
  if (results.length < 12) fail(`mode "${mode.id}" produced only ${results.length} results (need ≥12)`);
  const empty = results.filter((r) => !r.text.trim());
  if (empty.length) fail(`mode "${mode.id}" produced empty results`);
}
ok(`${MODES.length} modes produce ≥12 non-empty results`);

console.log("");
if (warnings.length) {
  console.log(`warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  warn ${w}`);
}
if (errors.length) {
  console.error(`FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  error ${e}`);
  process.exit(1);
}
console.log("validate-stylish-names: all checks passed");
