# REMAINING-ISSUES

Everything below is known, measured and deliberately left open. Nothing here is
a guess.

## 1. Non-English titles and descriptions are still over the length limits

Counts are for sitemap + indexable pages only (586 total; English is clean).

| Locale | titles > 60 chars |
|---|---:|
| fr | 22 |
| es-mx | 18 |
| pt-br | 18 |
| it | 17 |
| de | 16 |
| id | 15 |

| Page type | pages affected | titles > 60 | descs > 160 |
|---|---:|---:|---:|
| Blog article | 38 | 38 | 0 |
| Hub | 36 | 36 | 19 |
| Utility page | 19 | 10 | 17 |
| Tool | 10 | 10 | 5 |
| Homepage | 6 | 6 | 0 |
| Blog index | 6 | 6 | 0 |
| FAQ | 4 | 0 | 4 |
| **Total** | **119** | **106** | **45** |

Why it was not done here: these need native-quality rewrites in six languages,
not truncation. Cutting a translated title to fit an English character budget
degrades the translation. Reproduce with `node scripts/url-inventory.mjs`.

Full English reference table: `META-TABLE.md`.

## 2. Colour pages — title template still long (owner decision pending)

`src/seo/shared.ts` builds colour-page titles from a template that reaches 72
characters (`<Colour> Color Codes — Hex, RGB, OKLCH | GainUtility`-style). Those
151 pages are indexable but **not** in the sitemap (deliberate; see
`scripts/generate-sitemap.mjs`). Trimming the template affects all 151 at once,
so it needs a decision on whether they are meant to be indexed at all.

## 3. Live-site findings that need a zone / deploy step

| Finding | Action needed |
|---|---|
| `www.gainutility.com` returns **200** (duplicate host) | add a zone-level 301 to the apex |
| `/image-to-code` returns **404** in production while the repo intends **410** | publish the `_redirects` change |
| `/tools/image-to-code` is **200 + indexable** in production while the repo intends 410 | same deploy |
| `public/_redirects` contains **410 rules**, which Cloudflare Pages does not support (only 200/301/302/303/307/308) | rewrite those as 410-equivalent handling or drop them |
| `wrangler.jsonc` `main: ./src/index.ts` never runs — `npm run deploy` uploads static assets only | remove or document the Worker entry |

## 4. Prefetch / prerender groups still flagged

`node scripts/index-audit.mjs`:

- **16 pages** — `default — review`: rendered by the generic prerender branch
  (breadcrumbs + `<h1>` + description). `/site-audit` was moved out of this group
  this pass (29 → 242 visible words); the rest are still thin.
- **10 pages** — `translator pair — thin prerender`: PDF translator pair pages.

## 5. Manual follow-ups

- **Search Console**: submit the updated sitemap (586 URLs, from 582) and watch
  coverage. No claim of an indexing improvement is made anywhere in these
  documents — the work only removed inconsistencies that block discovery.
- **Browser check**: confirm the Image Upscaler and Image Converter download
  buttons now appear on desktop (the panel previously rendered `null` without a
  `files` array).
- **Deploy**: `npm run deploy` has not been run from this pass.

## 6. Repo hygiene

- No git repository, so nothing can be diffed or reverted. Every change is
  listed by file in `FILES-CHANGED.md`.
- Helper scripts named `scripts/.<name>.mjs` were used for one-off measurements
  (PowerShell mangles inline `node -e` with regexes). They are inert; delete them
  if the measurements are no longer needed.
