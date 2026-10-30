# INDEXING-REPORT — gainutility.com

Date: 2026-10-05 · Scope: indexing architecture, canonical/hreflang integrity, crawl depth, on-page meta quality.
Status: **Phase 1 of the SEO pass.** Read-only classification — no URL, slug or route was changed by this phase.

**Data sources**

| Source | What it gives |
|---|---|
| `scripts/url-inventory.mjs` → `scripts/url-inventory.json` / `.csv` | one row per prerendered route (808): locale, type, status, robots, canonical, hreflang, title/description length, H1, word count, internal in/out links, sitemap membership |
| `scripts/route-inventory.mjs` → `scripts/.route-inventory.json` | authoritative route list emitted by `scripts/prerender-entry.ts` |
| `scripts/sitemap-before.xml` | baseline snapshot of `public/sitemap.xml` before this pass |
| `scripts/sitemap-live-before.xml` | live `https://gainutility.com/sitemap.xml` as deployed |
| live probes (`scripts/.probe-live.mjs`, `.probe-www.mjs`) | production status codes, canonicals, robots, redirect targets |

---

## 1. Executive summary

| Metric | Value |
|---|---:|
| Prerendered routes | 808 (807 + `/404`) |
| Locales | 8 — en 411, es-co 57, es-mx 57, fr 57, id 57, it 57, pt-br 57, de 55 |
| Indexable (`index, follow`) | 750 |
| Noindex | 58 — 57 `es-co` + `/404` |
| In sitemap | 581 |
| Not in sitemap | 227 |
| Self-canonical | 808 / 808 (0 mismatches) |
| Duplicate titles within a locale | 0 |
| Duplicate descriptions within a locale | 0 |
| Missing H1 / multiple H1 | 0 / 0 |
| Broken internal links | 0 |
| hreflang reciprocity across clusters | passes |
| Indexable sitemap URLs with ≥1 on-page issue | **225 of 581 (38.7 %)** |

---

## 2. A. KEEP INDEXED — healthy, no action

**356 of 581** sitemap URLs pass all four checks used here (title ≤60, description ≤160, ≥1 crawlable inbound link, self-canonical).

| Type | Clean |
|---|---:|
| Tool | 217 |
| Blog article | 96 |
| Utility page | 21 |
| Library | 11 |
| Hub sub-page | 6 |
| FAQ | 3 |
| Changelog | 1 |
| Hub | 1 |
| **Total** | **356** |

Every other indexable URL also stays indexable — section B lists only *what has to change on the page*, never the index/noindex decision.

---

## 3. B. FIX, THEN KEEP INDEXED

Issue frequency (pages can carry more than one issue; 55 carry ≥2):

| Issue | Pages | Rule applied |
|---|---:|---|
| Title > 60 chars | 184 (118 > 65) | desktop SERP truncates around 58–62 characters |
| Description > 160 chars | 71 (42 > 170) | snippet truncation |
| Orphaned — zero crawlable inbound `<a href>` | 30 | in-sitemap, indexable, no inbound internal link |
| Thin content | see B4 | |

English slice (241 EN sitemap URLs): 78 titles > 60, 41 > 65; 26 descriptions > 160, 17 > 170. Median EN title 57 chars, median EN description 138 chars — the corpus is near the limit, not wildly off.

### B1 — 30 orphaned pages (crawl dead-ends, in sitemap, indexable)

They resolve 200, are self-canonical and are in the sitemap, but no other rendered page links to them, so the sitemap or hreflang is their only discovery path.

| Locale | Orphaned pages |
|---|---|
| en (1) | `/blog/why-i-started-building-small-browser-tools` |
| de (4) | `/de/blog/how-to-add-a-watermark-to-a-pdf`, `/de/blog/why-i-started-building-small-browser-tools`, `/de/tools/linkedin-karussell-ersteller`, `/de/tools/slug-generator` |
| es-mx (5) | same 2 articles + `creador-de-carrusel-linkedin`, `slug-generator`, `youtube-keyword-explorer` |
| fr (5) | same 2 articles + `createur-de-carrousel-linkedin`, `slug-generator`, `youtube-keyword-explorer` |
| id (5) | same 2 articles + `pembuat-carousel-linkedin`, `slug-generator`, `youtube-keyword-explorer` |
| it (5) | same 2 articles + `creatore-di-carousel-linkedin`, `slug-generator`, `youtube-keyword-explorer` |
| pt-br (5) | same 2 articles + `criador-de-carrossel-linkedin`, `slug-generator`, `youtube-keyword-explorer` |

The pattern is structural: these are exactly the **localised variants of English-only or late-added pages** — their locale hub and blog index do not list them, and no sibling article cross-links them.

Also orphaned but *correctly* so:

- `/404` (noindex)
- 5 `es-co` pages (noindex)
- 8 English alias tools that 301 in production: `/tools/heic-jpg-converter`, `/tools/json-compare`, `/tools/json-formatter`, `/tools/json-viewer`, `/tools/merge-selected-page-ranges`, `/tools/png-jpg-converter`, `/tools/svg-converter`, `/tools/webp-converter`

### B2 — Titles over 60 characters (184 pages)

Worst offenders (>70 chars), all indexable and in the sitemap:

| Len | URL | Title |
|---:|---|---|
| 100 | `/de/pdf` | Kostenlose Online-PDF-Tools – PDFs zusammenführen, teilen, komprimieren & konvertieren · GainUtility |
| 96 | `/de/json` | Kostenlose Online-JSON-Tools – Formatieren, Validieren, Vergleichen & Konvertieren · GainUtility |
| 96 | `/es-mx/image` | Herramientas de imagen en línea gratis – Comprime, redimensiona, convierte y edita · GainUtility |
| 96 | `/fr/pdf` | Outils PDF en ligne gratuits – Fusionner, diviser, compresser et convertir des PDF · GainUtility |
| 95 | `/es-mx/dev` | Herramientas gratis en línea para desarrolladores – QR, Base64, UUID, regex y más · GainUtility |
| 95 | `/fr/image` | Outils d'image en ligne gratuits – Comprimer, redimensionner, convertir et éditer · GainUtility |
| 94 | `/de/image` | Kostenlose Online-Bildtools – Komprimieren, Skalieren, Konvertieren & Bearbeiten · GainUtility |
| 94 | `/it/image` | Strumenti immagine online gratuiti – Comprimi, ridimensiona, converti e modifica · GainUtility |
| 93 | `/fr/blog/why-i-started-building-small-browser-tools` | Pourquoi je crée de petits outils de navigateur pour les problèmes du quotidien · GainUtility |
| 93 | `/it/blog/why-i-started-building-small-browser-tools` | Perché costruisco piccoli strumenti da browser per i problemi di tutti i giorni · GainUtility |
| 93 | `/pt-br/dev` | Ferramentas Online Grátis para Desenvolvedores – QR, Base64, UUID, Regex e Mais · GainUtility |
| 92 | `/es-mx/blog/why-i-started-building-small-browser-tools` | Por qué creo pequeñas herramientas de navegador para los problemas de cada día · GainUtility |
| 92 | `/es-mx/pdf` | Herramientas de PDF en línea gratis – Unir, dividir, comprimir y convertir PDF · GainUtility |
| 92 | `/pt-br/css` | Ferramentas de CSS Online Grátis – Gradientes, Sombras e Utilitários de Design · GainUtility |
| 91 | `/es-mx/css` | Herramientas CSS en línea gratis – Gradientes, sombras y utilidades de diseño · GainUtility |
| 90 | `/es-mx/json` | Herramientas de JSON en línea gratis – Formatea, valida, compara y convierte · GainUtility |
| 90 | `/pt-br/dev` | Ferramentas Online Grátis para Desenvolvedores – QR, Base64, UUID, Regex e Mais · GainUtility |
| 88 | `/pt-br/blog/why-i-started-building-small-browser-tools` | Por que crio pequenas ferramentas de navegador para problemas do dia a dia · GainUtility |
| 87 | `/pt-br/pdf` | Ferramentas de PDF Online Grátis – Juntar, Dividir, Comprimir e Converter · GainUtility |
| 86 | `/fr/css` | Outils CSS en ligne gratuits – Dégradés, ombres et utilitaires de design · GainUtility |
| 85 | `/fr/about` | À propos de GainUtility — Construit par une personne, fait pour respecter vos données |

Pattern: **localised hub titles carry the longest "– feature list" tails**, and the `| GainUtility` suffix pushes already-long English titles past the limit. Full sortable list: `scripts/url-inventory.csv` (`titleLen`).

### B3 — Descriptions over 160 characters (71 pages)

| Len | URL | Description (first 90 chars) |
|---:|---|---|
| 250 | `/fr/pdf` | Utilisez plus de 40 outils PDF gratuits dans votre navigateur. Fusionnez, divisez, compres… |
| 239 | `/tools/border-radius-generator` | Design border-radius visually with linked/unlinked corners, pixel or percentage units, and… |
| 235 | `/de/pdf` | Nutzen Sie über 40 kostenlose PDF-Tools im Browser. PDFs zusammenführen, teilen, komprimie… |
| 230 | `/tools/youtube-url-toolkit` | Clean YouTube URLs by removing tracking parameters (si, feature, UTM). Extract video ID, p… |
| 229 | `/it/pdf` | Usa oltre 40 strumenti PDF gratuiti nel tuo browser. Unisci, dividi, comprimi, ruota, conv… |
| 227 | `/tools/contrast-checker` | Check foreground/background color pairs against WCAG 2.1 AA/AAA thresholds. Includes color… |
| 225 | `/es-mx/pdf` | Usa más de 40 herramientas de PDF gratis en tu navegador. Une, divide, comprime, rota, conv… |
| 218 | `/fr/tools/youtube-keyword-explorer` | Découvrez les phrases que les spectateurs saisissent réellement dans la recherche YouTube … |
| 217 | `/pt-br/pdf` | Use ferramentas de PDF grátis no seu navegador. Junte, divida, comprima, gire, converta e s… |
| 214 | `/es-mx/tools/youtube-keyword-explorer` | Descubre las frases que la gente escribe realmente en la búsqueda de YouTube con sugerenci… |
| 214 | `/it/tools/youtube-keyword-explorer` | Scopri le frasi che gli spettatori digitano realmente nella ricerca di YouTube con i sugge… |
| 213 | `/tools/og-meta-generator` | Generate Open Graph (og:title, og:description, og:image, og:url, og:type) and X/Twitter Ca… |
| 210 | `/pt-br/tools/youtube-keyword-explorer` | Descubra as frases que os espectadores realmente digitam na busca do YouTube com sugestões… |
| 201 | `/pdf/best` | Discover the best free PDF tools for 2026. Merge, split, compress, rotate, convert, and ed… |
| 195 | `/tools` | Browse every free online tool on GainUtility by category — PDF, image, developer, JSON, SE… |
| 194 | `/pdf` | Use 40+ free PDF tools in your browser. Merge, split, compress, rotate, convert, and edit … |

`/tools/border-radius-generator` (239), `/tools/youtube-url-toolkit` (230), `/tools/contrast-checker` (227) and `/tools/og-meta-generator` (213) each pack three sentences plus a feature inventory into the description — they read as feature sheets, not snippets.

### B4 — Thin content among indexable sitemap URLs (English)

| Words | URL | Type |
|---:|---|---|
| 28 | `/site-audit` | Utility page |
| 124 | `/contact` | Utility page |
| 191 | `/dev/base64` | Hub sub-page |
| 192 | `/cookies` | Utility page |
| 194 | `/terms` | Utility page |
| 197 | `/dev/password` | Hub sub-page |
| 197 | `/image/resize` | Hub sub-page |
| 207 | `/pdf/rotate` | Hub sub-page |
| 210 | `/json/viewer` | Hub sub-page |
| 212 | `/json/validator` | Hub sub-page |

`/site-audit` promises "a transparent technical audit of gainutility.com covering performance, accessibility, structured data, and crawlability" but renders **28 words** — the description over-promises what the page delivers.

Median rendered words per type (sitemap + indexable): Utility page 224 · Library 236 · FAQ 254 · Comparison 278 · Hub sub-page 285 · Collection 290 · Hub 358 · Tool 376 · Blog article 416 · Blog index 532 · Changelog 552 · Tool hub 761 · Homepage 1 024.

### B5 — Blog index exposes only 7 of 25 English articles

`src/components/BlogPage.tsx:39` sets `INITIAL_PAGE_SIZE = 6`. The prerendered `/blog` page carries **31 internal links, only 7 of which point at `/blog/*`** (6 paginated + 1 featured). The other 18 English articles are reachable only through cross-links on other articles or through the sitemap.

Not an orphan problem — 17 of the 18 do have inbound links — but it is a **crawl-depth problem**: a crawler that stops at the index sees 7 posts instead of 25.

---

## 4. C. KEEP NOINDEX — deliberate, leave as-is

| URL group | Count | robots | In sitemap | Notes |
|---|---:|---|---|---|
| `es-co/*` | 57 | `noindex, follow` | no | exact `es-mx` duplicates, excluded by `scripts/sitemap-excludes.mjs` |
| `/404` | 1 | `noindex, follow` | no | canonical → `https://gainutility.com/404` |

**C1 — defect inside the noindex set.** All 57 `es-co` pages emit a full 8-entry hreflang cluster (`en`, `pt-BR`, `id`, `es-MX`, `de`, `fr`, `it`, `x-default`) that

1. **omits `es-CO` itself** — there is no self-referencing hreflang, which every hreflang cluster requires, and
2. is emitted from a `noindex` document.

No other locale's cluster references `es-CO` either, so es-CO is half-wired into the international set: it advertises the cluster but is neither a valid member of it nor a valid target of it. Because Google drops a cluster when a member is `noindex`, this is not confined to es-CO — it can affect the cluster for *every* locale.

Fix: stop emitting hreflang on noindex pages.

> **FIXED in Phase 3.** `scripts/prerender-entry.ts` now gates the hreflang tag on `!meta.noindex`, and `src/components/Layout.tsx` does the same client-side (still removing any pre-existing tags). Verified on the rebuilt output: `dist/client/es-co.html` → `hreflang=0, robots=noindex`; `dist/client/de.html` → `hreflang=8, robots=index`; `dist/client/404.html` → `hreflang=0, robots=noindex`. Guarded by check 4 of `node scripts/verify-seo-signals.mjs`.

---

## 5. D. REDIRECT — already live, verified

`public/_redirects` is generated by `scripts/generate-sitemap.mjs`: **194 rules — 191 × 301, 2 × 410, 1 × 200.**

| Request | Live response |
|---|---|
| `http://gainutility.com/` | 301 → `https://gainutility.com/` |
| `/tools/merge-pdf/` (trailing slash) | 308 → `/tools/merge-pdf` |
| `/tools/` | 308 → `/tools` |
| `/services` | 301 → `/` |
| `/tools/json-formatter` | 301 → `/tools/json-beautifier` |
| `/tools/merge-selected-page-ranges` | 301 → `/tools/merge-pdf` |
| `/tools/image-compressor` | 301 → `/image` |
| `/tools/color-scale-generator`, `/image-color-palette-extractor` (+ `/tools/…` forms) | 301 → `/studios/color/generator`, `/studios/color/image` |
| `/JPG-to-PDF` (uppercase) | 404 — no case-insensitive rule |

The 8 alias tools listed in B1 are the *sources* of these 301s and are correctly absent from the sitemap. Trailing-slash and http→https normalisation are handled (308/301), so no duplicate-host or duplicate-slash variants are indexable.

---

## 6. E. REMOVE — 404 / 410

| URL | Intended | Live | Verdict |
|---|---|---|---|
| `/image-to-code` | 410 (`_redirects` + `src/index.ts`) | **404** | acceptable — drops out of the index; 410 never takes effect |
| `/tools/image-to-code` | 410 (`_redirects` + `src/index.ts`) | **200** | **problem** — 66 KB page, title "Image to Code — Convert Screenshots to HTML & CSS", self-canonical, `index, follow` |
| unknown route (e.g. `/this-route-does-not-exist-xyz`) | 404 | 404, prerendered `404.html`, canonical → `/404`, `noindex` | correct |

`/tools/image-to-code` is the only URL the repo declares *permanently removed* that production still serves as an indexable page. See F4/F5 for why both removal mechanisms are inert.

---

## 7. F. MANUAL REVIEW — owner or infrastructure decision

### F1 — `www.gainutility.com` returns 200 (no zone-level redirect)

`https://www.gainutility.com/` answers **200** on the same Cloudflare IPs, with `<link rel="canonical" href="https://gainutility.com">`. Canonical is a *hint*, not a control; apex and www can both be crawled and indexed.

**Action:** zone-level Redirect Rule `www.gainutility.com/*` → `https://gainutility.com/$1`, 301. Cannot be fixed from the repo.

### F2 — Homepage canonical vs sitemap loc disagree — **FIXED (Phase 2)**

- page canonical (before): `https://gainutility.com` (no trailing slash)
- sitemap `<loc>`: `https://gainutility.com/` (trailing slash)

Both return 200, and `/` is the only trailing-slash entry among the 581 sitemap URLs.

**Fixed by moving the canonical, not the sitemap.** Five signals already said `https://gainutility.com/` — the sitemap, the `hreflang="en"` and `x-default` alternates, JSON-LD `WebSite.url` / `Organization.url`, and every internal `href="/"` — while only the canonical said otherwise. Changing one HTML attribute aligns all six; re-pointing the other five would have been a wider edit.

`src/seo/shared.ts:205` was returning the bare `SITE_URL` constant for the default-locale homepage instead of calling `absoluteUrl()`, bypassing the trailing-slash rule every other URL builder applies:

```ts
- canonical: L === DEFAULT_LOCALE ? SITE_URL : absoluteUrl(localizedHomePath(L)),
+ canonical: absoluteUrl(localizedHomePath(L)),
```

`og:url` is derived from `meta.canonical`, so it corrected with it. Verified after rebuild: canonical, `og:url`, sitemap `<loc>`, hreflang, and JSON-LD all read `https://gainutility.com/`.

### F3 — Deployed build is not the repo state

| Signal | Live | Repo |
|---|---|---|
| sitemap entries | **582** | **581** |
| `https://gainutility.com/studios/color` | in sitemap | deliberately excluded (`scripts/generate-sitemap.mjs:84-87`) |
| `/tools/image-to-code` | 200, indexable page | no route, no asset, intended 410 |
| unknown route behaviour | prerendered `404.html` with 404 | matches repo |

Production is running an older build. Every finding in this report describes the **repo**; none of it is live until `npm run deploy` runs. Do not read a sitemap change as an indexing change until it is deployed **and** verified in Search Console.

### F4 — `src/index.ts` never runs in production

`wrangler.jsonc` declares `"main": "./src/index.ts"`, which holds the 410 block for `image-to-code` plus the `/api/ratings` and `/api/analyze` handlers. But `npm run deploy` is:

```
npm run build && wrangler pages deploy dist/client --project-name=gainutility --branch=main --commit-dirty=true
```

`wrangler pages deploy <dir>` is a **direct static upload** — it does not bundle `main`. Proof: `/tools/image-to-code` would be 410 if the Worker ran, and it returns 200.

Related evidence that production is plain static Pages: `not_found_handling: "single-page-application"` would return the SPA shell with 200 for unknown routes, yet unknown routes return the prerendered `404.html` with 404.

**Action (owner decision):** either switch to `wrangler deploy` (Workers with Assets) so `src/index.ts` runs, or delete the dead 410 block and rely on 404. `/api/ratings` and `/api/analyze` must be probed before they are treated as live.

### F5 — The 2 × 410 rules in `_redirects` are unsupported

`public/_redirects` lines 192–193 request status **410** for `/image-to-code` and `/tools/image-to-code`. Cloudflare Pages `_redirects` accepts only 200, 301, 302, 303, 307 and 308 — 410 is not a supported status, so the rule cannot take effect even if it reached production. `/image-to-code` proves the fall-through is 404, not 410.

### F6 — 151 color pages + 10 color studio pages are indexable but unsitemapped

`scripts/generate-sitemap.mjs:84-94` documents this as deliberate: color pages are thin programmatic pages kept live for Color Studio UX and internal linking; studio sections are app surfaces. **Decision needed:** keep the status quo (indexable, not in sitemap — still discoverable through internal links), or add noindex. Do not add them to the sitemap without first raising their word count.

### F7 — Search Console verification is a manual follow-up

Nothing here demonstrates that Google has indexed anything. After deploy: submit `https://gainutility.com/sitemap.xml`, request indexing for the hub pages, monitor coverage. Only GSC data can confirm an indexing change.

---

## 8. Canonical report

- **808 / 808 routes emit a self-canonical.** Zero pages point at a different URL.
- The one cross-signal mismatch (F2, homepage canonical vs sitemap `<loc>`) is **fixed** — see §7/F2.
- `www` (F1) is canonicalised to the apex by tag only, not by redirect.

## 9. Hreflang report

- Clusters are reciprocal: every hreflang target resolves to a prerendered route. **0 broken hreflang targets.**
- C1 is **fixed (Phase 3)**: the 57 `es-co` pages are `noindex`, and a noindex document now emits **no hreflang at all** — in `src/components/Layout.tsx` (client head manager) and `scripts/prerender-entry.ts` (SSR). Before the fix they emitted a cluster with no `es-CO` self-reference.
- Cluster shape is otherwise consistent: `en` is the `x-default` target and `x-default` points at `/`.

## 10. Broken-link report

**0 broken internal links.** The 169 "missing" targets reduce to 2 non-HTML assets, both verified live:

| Target | Inbound links | Live check |
|---|---:|---|
| `/studios/color` | 161 | 200 (SPA rewrite in `_redirects`) |
| `/research/box-shadow-values.csv` | 8 | 200, `text/csv`, 677 607 bytes, present in `public/` and `dist/client/` |

Per-page link lists: `internalTargets` column in `scripts/url-inventory.csv`.

## 11. Sitemap diff (live → repo)

Live sitemap has **582** entries; `public/sitemap.xml` has **581**.

| Change | URL | Reason |
|---|---|---|
| −1 | `https://gainutility.com/studios/color` | deliberately excluded — comment at `scripts/generate-sitemap.mjs:84-87` |
| +0 | — | no other difference |

All 581 repo entries have a matching HTML file and return 200; none are noindex; all are self-canonical. Baselines: `scripts/sitemap-live-before.xml`, `scripts/sitemap-before.xml`. **Full before/after diff: `SITEMAP-DIFF.md`** — the sitemap is byte-identical to the baseline; F2 was resolved on the canonical instead.

---

## 12. Changes made during Phases 1–5

**1. OKLCH roundtrip broken — wrong colors published on 161 indexable pages** (found in Phase 1; 151 `/colors/*` + 10 `/studios/color/*`). `oklchToHex` / `oklchToRgb` in `src/colorStudio/color.ts` both applied an extra, incorrect matrix stage — the forward path ran an XYZ→LMS matrix on values that were already LMS, and the inverse ran an XYZ→linear-sRGB matrix on values that were already linear sRGB. The tonal scale published on every color page was therefore wrong.

| Input | Before | After | Reference |
|---|---|---|---|
| `#3B82F6` | `#00E4CC` | `#3B82F6` | `#3B82F6` |
| `#FF0000` | `#FF0065` (L .6278, C .2499, h 17.6) | `#FF0000` (L .6280, C .2577, h 29.2) | L .62796, C .25768, h 29.23 |
| `#00FF00` | `#BDF54D` | `#00FF00` | L .8664 |
| `#0000FF` | `#00D5D0` (L .381) | `#0000FF` (L .4520, C .3132, h 264.05) | L .45201, C .31320, h 264.05 |
| `#FFFFFF` | `#FFD3EC` (L 1.0032) | `#FFFFFF` (L 1.0000, C 0) | L 1, C 0 |

`generateScale("#3B82F6")[500]` now returns `#3B82F6` instead of `#00E4CC`, and the old broken hex no longer appears in `dist/client/colors/blue.html`. `npm run lint` and `npm run build` (808 routes) both pass.

**2. Homepage canonical brought in line with every other URL signal (Phase 2, finding F2).** `src/seo/shared.ts:205` returned the bare `SITE_URL` constant for the default-locale homepage instead of calling `absoluteUrl()`, so the canonical read `https://gainutility.com` while the sitemap `<loc>`, `hreflang="en"`/`x-default`, JSON-LD `WebSite.url` and `Organization.url`, the breadcrumb, and internal `href="/"` all read `https://gainutility.com/`. One line now routes through `absoluteUrl()`; `og:url` (derived from `meta.canonical`) followed. The sitemap needed no edit — see `SITEMAP-DIFF.md`.

**3. hreflang suppressed on noindex documents (Phase 3, finding C1).** All 57 `es-co` pages were advertising an 8-entry hreflang cluster with no self-reference while `noindex`. Both the prerenderer and the client head-manager now skip hreflang whenever `meta.noindex` is set. Verified output above in section 4.

**4. `scripts/verify-seo-signals.mjs` (new).** Eleven assertions run against `dist/client` after every build: sitemap↔HTML parity, self-canonical, sitemap indexability, noindex⇒no-hreflang, hreflang self-reference, hreflang target existence, per-locale title/description uniqueness, exactly one H1, es-CO sitemap exclusion, sitemap loc ↔ homepage canonical, and homepage-only trailing slash. Exits non-zero on any failure.

**5. Homepage search inputs made self-explanatory (Phase 4).** The page carries a hero global search, a BrowseStudio filter, and a header command palette — all three previously read as "search". Nothing was removed; only wording changed so scope is obvious:

| Surface | Before | After | Behaviour |
|---|---|---|---|
| Hero (`HeroToolSearch`) | "Search tools" | **"Search all tools"** | navigates to a tool |
| Browse (`BrowseStudio`) | "Find a tool" / "Search image tools…" | **"Filter {category} tools…"** / **"Filter Images tools (e.g. compress, webp, crop)…"** | narrows the on-screen grid only |
| Header (`CommandPalette`) | "Search tools" | unchanged | global |

New keys `searchAllTools`, `filterCategoryTools`, `filterImagesTools` in `src/i18n/ui.ts`, translated across all 8 locales. The Browse `aria-label` and its `sr-only` label now carry the same "Filter" wording, so assistive tech hears the scope too.

**6. Browse grid rows levelled (Phase 5).** Tool names wrap to one or two lines, and that alone changed row height — `items-stretch` equalises cards *within* a row, not *between* rows. `ToolCard`'s `<h3>` now carries `min-h-[2.75em]` (`leading-snug` 1.375 × 2 lines), so a one-line and a two-line name cost identical space. The reserved box is a `min-height`, so an unexpectedly long name still wraps rather than clipping. Verified present in `dist/client/index.html` and compiled into the CSS bundle.

---

## 13. Recommended order of work

| Phase | Action | Effort | Risk |
|---|---|---|---|
| 2 | ~~Sitemap before/after diff; resolve homepage canonical vs `<loc>` mismatch (F2)~~ **done** — `SITEMAP-DIFF.md` | — | — |
| 3 | ~~Stop emitting hreflang on `noindex` pages (C1)~~ **done** | — | — |
| 4–5 | ~~Homepage / browse search wording + card-title height reservation~~ **done** | — | — |
| 6 | Tool naming + title/description rewrite for the 184/71 over-limit pages | medium | visual, no URL change |
| 7–9 | Image quality tool rework (upscale 1× factor, desktop download bug) | medium | functional |
| 10–11 | Related-tools hover icon bug + duplicate related sections | small | visual |
| 12–14 | Render all 25 articles on `/blog` (B5), close the 30 orphans (B1), then exactly 5 new articles | medium | crawl graph only |
| 15–16 | Thin `/site-audit` copy (B4) | small | copy only |
| 17–21 | Tests, remaining-issues doc, files/routes changed | — | — |
| owner | F1 www redirect, F4 deploy method, F6 color-page policy | — | infrastructure |

