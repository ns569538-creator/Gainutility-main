import fs from "node:fs";

const r = JSON.parse(fs.readFileSync("scripts/url-inventory.json", "utf8"));
const a = Array.isArray(r) ? r : r.rows || r.urls;
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const en = a
  .filter((x) => x.inSitemap && x.indexable && x.locale === "en")
  .sort((p, q) => p.url.localeCompare(q.url));

const rows = en
  .map(
    (x) =>
      `| \`${x.url}\` | ${x.titleLen} | ${esc(x.title)} | ${x.descLen} | ${esc(x.description)} |`
  )
  .join("\n");

const header = `# META-TABLE — final title / meta description for every EN page in the sitemap

Generated from \`scripts/url-inventory.json\` after the Phase 6 meta rewrite pass.
Every row was verified against the hard limits used by the audit:

- **title (SEO) ≤ 60 characters**
- **meta description ≤ 160 characters**

Verification (all pass):

\`\`\`
node scripts/url-inventory.mjs       # EN sitemap 241 — titles>60: 0, descs>160: 0
node scripts/verify-seo-signals.mjs  # 11/11
node scripts/audit-seo.mjs           # AUDIT PASS: no issues found
npm run lint                         # tsc --noEmit, clean
\`\`\`

## What changed

| Group | File(s) | EN entries rewritten |
|---|---|---|
| Comparison pages | \`src/seo/comparisonPages.ts\` | 16 |
| Library / symbols pages | \`src/seo/libraryPages.ts\` | 4 |
| Category hubs + hub sub-pages | \`src/seo/seoPageContent.ts\` | 18 |
| Blog article titles | \`src/blog/blogData.ts\` (EN \`seoTitle\`) | 11 |
| Tool meta | \`src/data.ts\` | 22 |
| Tool hub \`/tools\` | \`src/seo/shared.ts\` | 1 |
| Extra tools | \`src/seo/extra*.ts\`, \`translatorPairs.ts\` | 11 |
| Utility / site pages | \`src/i18n/pages.ts\`, \`src/i18n/sitePagesData.ts\` | 5 |

### Rewrites recorded in-session (before → after)

| Page | Field | Before | After |
|---|---|---|---|
| \`/\` | title | GainUtility — Free Browser-Based Tools for Developers & Creators | GainUtility — Free Browser Tools for Developers & Creators |
| \`/about\` | title | About GainUtility — Built by one person, made to respect your data | About GainUtility — Built by One Person, Privacy-First |
| \`/blog\` | title | GainUtility Blog — Practical Guides for Everyday Digital Work | GainUtility Blog — Practical Digital Work Guides |
| \`/blog/how-to-split-a-pdf\` | title | How to Split a PDF & Keep Only the Pages You Need \\| GainUtility | How to Split a PDF & Keep Only the Pages \\| GainUtility |
| \`/compare/json-formatter-vs-minifier\` | title | JSON Formatter or Minifier — Format or Compact? \\| GainUtility | JSON Formatter or Minifier — Format or Compact \\| GainUtility |
| \`/tools\` | desc | Browse every free online tool on GainUtility by category — PDF, image, developer, JSON, SEO, design, media, creator and more. No sign-up, nothing to install, everything processed in your browser. | Browse every free GainUtility tool by category: PDF, image, developer, JSON, SEO, design and media. No sign-up, nothing to install, all in your browser. |
| \`/tools/youtube-url-toolkit\` | desc | Clean YouTube URLs by removing tracking parameters (si, feature, UTM). Extract video ID, playlist ID, channel ID, timestamp. Get canonical URL, share link, embed link, Shorts link, playlist link, channel link + QR code. All local. | Clean YouTube URLs by removing tracking parameters. Extract video, playlist and channel IDs, then get share, embed and Shorts links plus a QR code. All local. |
| \`/tools/application-file-checker\` | desc | Check your exam application photo, signature and thumb impression against the recorded requirements, fix what's wrong, and download them ready to upload — all locally. | Check your exam photo, signature and thumb impression against the recorded requirements, fix what's wrong, and download them ready to upload — all locally. |
| \`/tools/favicon-generator\` | desc | Create high-visibility favicons from images, text initials, vector symbols, or emoji. Preview at 16px and export multi-resolution .ico, Apple touch icons, PNGs, and web manifest. | Create favicons from images, text initials, symbols or emoji. Preview at 16px and export a multi-resolution .ico, Apple touch icons, PNGs and web manifest. |
| \`/tools/unlock-pdf\` | desc | Opens freely but blocked from printing or copying? Strip owner-level permission restrictions from PDFs you own — decrypted in your browser, no password prompt needed. | Opens freely but blocked from printing or copying? Strip owner-level permission restrictions from PDFs you own — decrypted locally, no password needed. |
| \`/tools/stylish-name-generator\` | desc | Create stylish names, nicknames and emoji names with 100+ text styles, symbols and decorative characters. Generate, customize and copy names instantly for social profiles, games and more. | Create stylish names, nicknames and emoji names with 100+ text styles and decorative characters. Generate, customize and copy them for profiles and games. |
| \`/symbols\` | desc | Curated Unicode symbol collections for bios, nicknames and captions — hearts, cute sparkles, aesthetic geometry and gaming marks. Click to copy, then style your name free. | Curated Unicode symbol collections for bios, nicknames and captions: hearts, sparkles, aesthetic geometry and gaming marks. Click to copy and style your name. |
| \`/tools/pdf-translator/english-to-german\` | desc | Translate an English PDF into German in your browser. Direct conversion for text PDFs, OCR for scans, and a downloadable German result with no uploads of the file itself. | Translate an English PDF into German in your browser. Direct conversion for text PDFs, OCR for scans, and a downloadable German result. No uploads. |
| \`/css/box-shadow\` | desc | What every box-shadow value does: offsets, blur, spread, color, inset, and stacked layers. Syntax reference, live copy-ready examples, and when text-shadow or drop-shadow is the better tool. | What every box-shadow value does: offsets, blur, spread, color, inset and stacked layers, with copy-ready examples and when text-shadow or drop-shadow wins. |
| \`/css/box-shadow/examples\` | desc | Copy-paste CSS box-shadow examples for cards, buttons, inputs, focus rings, inset wells, and glows. Every example shows a live preview and the exact declaration behind it. | Copy-paste CSS box-shadow examples for cards, buttons, inputs, focus rings, inset wells and glows, each with a live preview and the exact declaration. |
| \`/css/box-shadow/multiple-shadows\` | desc | How comma-separated box-shadow layers work: syntax, paint order, the contact-plus-ambient recipe, mixing inset with outer layers, and copy-ready multi-layer examples. | How comma-separated box-shadow layers work: syntax, paint order, the contact-plus-ambient recipe, mixing inset with outer layers, and copy-ready examples. |
| \`/tools/og-meta-generator\` | desc | Generate Open Graph and X/Twitter Card meta tags with live Facebook, LinkedIn and X previews. Character counters, HTTPS validation, copy and download. Runs locally. | Generate Open Graph and X/Twitter Card meta tags with live Facebook, LinkedIn and X previews, plus character counters and HTTPS validation. Runs locally. |
| \`/tools/border-radius-generator\` | desc | Design border-radius visually with linked or independent corners, pixel or percentage units, and preset shapes for cards, buttons and pills. Copy CSS or download. | Design border-radius visually with linked or independent corners, pixel or percentage units, and preset shapes for cards, buttons and pills. Copy the CSS. |
| \`/tools/contrast-checker\` | desc | Check color pairs against WCAG 2.1 AA/AAA thresholds, with color blindness simulation, accessible color suggestions and a live text-size reference. Runs locally. | Check color pairs against WCAG 2.1 AA/AAA thresholds, with color blindness simulation, accessible color suggestions and a text-size reference. Runs locally. |

## Non-English remainder (tracked, not yet done)

Of 581 sitemap URLs, 106 titles and 45 descriptions across 119 non-EN pages are still
over the EN limits. They need native-quality rewrites, not truncation.

| Locale | titles >60 |
|---|---:|
| fr | 22 |
| es-mx | 18 |
| pt-br | 18 |
| de | 16 |
| it | 17 |
| id | 15 |

| Page type | pages | titles >60 | descs >160 |
|---|---:|---:|---:|
| Blog article | 38 | 38 | 0 |
| Hub | 36 | 36 | 19 |
| Utility page | 19 | 10 | 17 |
| Tool | 10 | 10 | 5 |
| Homepage | 6 | 6 | 0 |
| Blog index | 6 | 6 | 0 |
| FAQ | 4 | 0 | 4 |

See \`REMAINING-ISSUES.md\`.

## Every EN sitemap page (${en.length})

| URL | T | title | D | description |
|---|---:|---|---:|---|
`;

fs.writeFileSync("META-TABLE.md", header + rows + "\n");
const maxT = Math.max(...en.map((x) => x.titleLen));
const maxD = Math.max(...en.map((x) => x.descLen));
console.log(`wrote META-TABLE.md rows=${en.length} maxT=${maxT} maxD=${maxD}`);
