# SITEMAP-DIFF — gainutility.com

Date: 2026-10-05 · Phases 1–3 of the SEO pass.

Baselines:

| File | Origin | Entries |
|---|---|---:|
| `scripts/sitemap-live-before.xml` | live `https://gainutility.com/sitemap.xml` at the start of this pass | 582 |
| `scripts/sitemap-before.xml` | `public/sitemap.xml` at the start of this pass (repo state) | 581 |
| `public/sitemap.xml` | `public/sitemap.xml` after Phases 1–3 | 581 |

Regenerate and re-diff with:

```
npm run sitemap
node scripts/.diff.mjs
node scripts/verify-seo-signals.mjs
```

---

## 1. Deployed → repo baseline (production is stale)

```
582 -> 581
- https://gainutility.com/studios/color
```

`/studios/color` is intentionally excluded by the comment at
`scripts/generate-sitemap.mjs:84-87` — the Color Studio home is a valid in-app
view but not a content landing page; it stays reachable through the
`/studios/color → /index.html 200` rewrite in `_redirects`.

This single difference is also the evidence that **production is running an
older build than the repo** (see `INDEXING-REPORT.md` F3). It is the only
difference; every other entry is byte-identical.

## 2. Repo baseline → after Phases 1–3

```
581 -> 581
+ (none)
- (none)
order unchanged
```

**The sitemap itself is byte-identical to the baseline.** The F2 mismatch was
resolved on the *canonical* side instead, because the sitemap was already the
majority view and the canonical was the lone outlier:

| Signal | Before | After |
|---|---|---|
| sitemap `<loc>` | `https://gainutility.com/` | `https://gainutility.com/` (unchanged) |
| hreflang `en` + `x-default` | `https://gainutility.com/` | unchanged |
| JSON-LD `WebSite.url` / `Organization.url` | `https://gainutility.com/` | unchanged |
| internal `href="/"` | `/` | unchanged |
| breadcrumb home entry | `https://gainutility.com/` | unchanged |
| **`<link rel="canonical">`** | **`https://gainutility.com`** | **`https://gainutility.com/`** |
| **`og:url`** | **`https://gainutility.com`** | **`https://gainutility.com/`** |

Root cause: `src/seo/shared.ts:205` returned the bare `SITE_URL` constant for
the default-locale homepage instead of going through `absoluteUrl()`, so it
skipped the trailing-slash rule every other URL builder applies. One line
changed:

```ts
- canonical: L === DEFAULT_LOCALE ? SITE_URL : absoluteUrl(localizedHomePath(L)),
+ canonical: absoluteUrl(localizedHomePath(L)),
```

(`localizedHomePath(DEFAULT_LOCALE)` returns `"/"` and `absoluteUrl("/")`
returns `${SITE_URL}/`.)

Rationale for choosing the trailing slash: it is what the live sitemap, the
live hreflang cluster, the JSON-LD, and every internal `href="/"` already use,
and it is the convention `absoluteUrl` was already written for
(`TOOL-AUDIT.md` row 7). Aligning one HTML attribute to those five signals is
a smaller change than re-pointing all of them.

## 3. Unchanged-by-design

The following stay out of the sitemap, deliberately, and are documented in
`scripts/generate-sitemap.mjs:84-94` and `INDEXING-REPORT.md` F6:

- 57 `es-co/*` URLs — noindex duplicates of `es-mx`
- `/404` — noindex
- 151 `/colors/*`, `/color-palettes/*`, `/ui-colors/*` — thin programmatic
  pages, indexable but unsitemapped
- 10 `/studios/color/*` — app surfaces
- 8 alias tools that 301 to their canonical (`json-formatter`, `json-viewer`,
  `json-compare`, `heic-jpg-converter`, `png-jpg-converter`,
  `svg-converter`, `webp-converter`, `merge-selected-page-ranges`)

## 4. Post-change verification

`node scripts/verify-seo-signals.mjs` — 11/11 pass:

```
seo-signal verification — 581 sitemap URLs
  ok   sitemap has HTML — 581/581
  ok   self-canonical — 581/581
  ok   sitemap indexable — no noindex entries
  ok   noindex emits no hreflang — 58 noindex pages checked
  ok   hreflang self-reference — 581 clusters
  ok   hreflang targets exist — 0 broken
  ok   unique title+description per locale — 7 locales
  ok   exactly one H1 — 581/581
  ok   es-CO excluded from sitemap — 0 entries
  ok   sitemap loc matches homepage canonical — https://gainutility.com/
  ok   only the homepage has a trailing slash — 580 inner URLs
```

**Not yet verified in production.** These numbers describe the repo build.
Search Console must be re-checked after `npm run deploy`; a sitemap change on
its own says nothing about indexing.
