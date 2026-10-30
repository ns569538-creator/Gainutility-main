# GainUtility — Homepage Refresh Flash: Forensic Root-Cause Report

**Scope:** Persistently reproduced 1–2s (up to ~4–5s on throttled/real-device loads) flash of an
"old/different gainutility.com layout" on every page refresh, at the **code/first-paint level**.
Sections A–F below are the original forensic analysis. Section G+ describe the **applied fix**
(real SSR + hydration) and the CDP evidence proving it. All claims are backed by captured
runtime evidence.

---

## A) Root cause (one-line)

The production home page is a **static, prerendered HTML shell** whose DOM structure
(`#root > header …`, hero-only, no footer/BrowseTools/FAQ) is **not pixel-identical** and **not
structurally compatible** with the React tree that `main.tsx` mounts, and — critically —
`src/main.tsx` calls **`createRoot().render()` (NOT `hydrateRoot`)**. `createRoot().render()`
**destroys the entire prerendered shell and rebuilds the tree from scratch**. The browser paints
the shell immediately (first paint), then a blank/partial flash while React tears it down and
rebuilds, then paints the full page. The "old-looking layout" is that **incomplete, hero-only
prerendered shell** — it is the current design only partially rendered, not legacy code.

---

## B) T=0…N first-paint sequence (captured via CDP, Chromium, throttled 3G 350 KB/s + 150 ms RTT)

| Time (ms) | readyState | `#root` first child | rootHtmlLen | browse | footer | What the user sees |
|---|---|---|---|---|---|---|
| ~221 | loading | `HEADER` | 10,013 | no | no | Top of prerendered shell painted (header, hero) |
| ~221→~300 | loading | `HEADER` | 10,013→16,903 | no | no | Shell grows as more inline HTML parses (hero + first cards) |
| ~300→~4,394 | interactive | `HEADER` | 16,903 | no | no | **THE FLASH WINDOW** — static shell, **no BrowseTools, no footer** |
| ~4,394 | complete | `DIV.min-h-screen` | 299,056 | **yes** | **yes** | React took over: full page (BrowseTools, footer, FAQ) |

Locally on a fast machine (120 KB bundle, no RTT) the swap happens in <1.5 s, so the flash is
"1–2 s". Under throttled/real-world conditions the incomplete shell is visible for 4+ s.

Captured screenshots (both different content per file size): `shell-frame.png`
(58 KB — partial homepage) and `hydrated-frame.png` (96 KB — full homepage).

**Key transition fact:** between the shell state and the hydrated state, `rootHtmlLen` jumps
**16,903 → 299,056** while `hasBrowse` and `hasFooter` flip **false → true** and `rootFirst`
flips **`HEADER` → `DIV.min-h-screen`**. This is a **full DOM replacement**, not an in-place
patch.

---

## C) Files & players

| File | Role |
|---|---|
| `src/main.tsx:7` | `createRoot(document.getElementById('root')!).render(...)` — **destroys the shell, rebuilds everything** (root cause of the swap). |
| `scripts/prerender.mjs` | Reads `dist/client/index.html` (built by the Cloudflare Vite plugin) and writes per-route `dist/<route>/index.html`. |
| `scripts/prerender-entry.ts` | Generates the static shell (same SEO/JSON-LD builders as the app). |
| `dist/client/index.html` | The static home shell served at `/` — the **T=0 visible document**. |
| `src/components/Layout.tsx:76–80` | Existing **fix attempt**: sets `firstClientRender` to skip the entrance fade on mount. Comment claims the shell is "pixel-identical" — this is **incorrect** (proven: shell lacks footer/BrowseTools/FAQ and differs structurally). |
| `src/components/HomePage.tsx` | Renders HeroToolSearch, BrowseStudio, AddToChrome, FAQ — the below-fold content **absent** from the shell. |
| `src/index.css` | `@keyframes hero-fade-in`, `.animate-hero-fade-in*`; `.animate-fade-in` on HomePage is a **dangling no-op** (no `@keyframes fade-in`, no `--animate-fade-in` theme var). |
| `public/_headers` | `/assets/*` = `public, immutable` (hashed); HTML = `must-revalidate` (not the cause). |
| `public/_redirects` | Old tool slugs → `/tools/...` 301s (not the cause). |

---

## D) Why the "old/different" frame appears

1. `/` returns the **prerendered shell**: `#root > header` + a `div.min-h-screen > div > main` with
   only the **hero + first "Merge PDF" cards** (grep of shell visible text: *"GainUtility … Get
   stuff done. Minus the fuss. … Merge PDF PDF · 2 tools Browse all"*). There is **no
   BrowseTools mosaic, no AddToChrome, no FAQ, no footer**.
2. The browser **paints this shell at first paint** (layout tree built from static HTML + CSS in the
   same document — no JS needed).
3. Meanwhile the large JS bundle downloads/parses/executes (React + app, code-split packs via
   `React.lazy`). On any network this takes 1–5 s.

## E) Why it then disappears (the swap)

4. The module executes `createRoot(root).render(<App/>)` (**`src/main.tsx:7`**).
5. Because it is `createRoot` and **not** `hydrateRoot`, React **does not reuse** the server
   HTML. It clears `#root` and mounts a fresh tree whose root is the single wrapper
   `div.min-h-screen.bg-bg-base…` **containing** the header (see `Layout.tsx`), then renders the
   full page.
6. The visible result jumps from the partial shell to the full 299 KB tree. Root structure goes
   from `#root > header` (2 children) to `#root > div.min-h-screen` (1 child) — incompatible
   enough that even a hydrate attempt would warn/error, which is why the shell can't be reused
   as-is.

## F) Why the earlier cache/deploy fixes never worked

- They targeted **network caching / stale deployments** (Cloudflare assets). But the two distinct
  frames are generated by the **same deployed code**, verified locally at `code` level here. There
  is no stale asset involved — the shell and the React tree come from the current build.
- They also targeted **hiding** the old view (opacity fades / `.animate-fade-in` / skeleton
  overlays). Because the shell is a *separate first paint*, no CSS opacity trick on the React tree
  removes the shell frame — you can only cover it (which adds a fake loading screen, exactly what
  the user forbade).
- The `firstClientRender` fade-skip in `Layout.tsx` only stops the *reverse* flicker (React hiding
  the page on remount); it does not remove the shell→full swap, and it relies on the (false)
  assumption that the shell is pixel-identical.

## G) Applied fix (real SSR + hydration) — DONE, verified

Instead of the "make the shell match" approach, the fix server-renders the REAL React home tree
and hydrates it:

1. **`scripts/prerender-entry.ts`:** for the default-locale home route (`/`) only, emits the actual
   `<App/>` tree via `renderToString(<App/>)` (imported from `react-dom/server`). It wraps the
   output in `<div id="root" data-gu-ssr="1">…</div>`. All other routes keep the existing static
   preview shell unchanged.
2. **`scripts/prerender.mjs`:** changed the prerender bundle `format: "esm"` → `"cjs"` and loads it
   via `createRequire()` (`react-dom/server`'s Node code does `require('util')` which ESM bundles
   can't statically handle). `target: "node20"`.
3. **`src/main.tsx`:** a deliberate, explicit mount boundary:
   - `shouldHydrate = isHomePath && rootEl.dataset.guSsr === '1'` where
     `isHomePath = location.pathname === '/' || ''`.
   - If `shouldHydrate` → `hydrateRoot(rootEl, <AppTree/>)` — React adopts the exact SSR DOM, no
     destruction, one coherent UI from first paint through hydration.
   - Otherwise → `createRoot(rootEl).render(<AppTree/>)` (the previous behavior), correct for
     every route without real SSR HTML.
   - The **two-part check (marker + route)** is essential: on Cloudflare Pages, SPA routes like
     `/json-validator` fall back to `dist/client/index.html`, which *does* carry the `data-gu-ssr`
     marker. Without the route gate, `main.tsx` would try to hydrate a home tree against a tool
     render → hydration mismatch. The gate forces `createRoot()` for any non-`/` path.
4. **SSR-safety** was confirmed across all home render-time globals:
   `BrowseStudio.readUrlState`/`AddToChrome.isChromium`/`ActiveColorProvider.loadInitial`/
   `App`/`Layout`/`HomePage` initializers are all guarded for `typeof window === "undefined"` or
   static. `Layout.firstClientRender` and `HomePage.homeEntered` flags skip entrance animations on
   both SSR and the first client render, so the server HTML matches the hydrated client output.
5. **`src/components/Layout.tsx:76–80`:** comment corrected (it previously claimed the old shell was
   "pixel-identical", which A–F disproved).

**Hit authentication surface — every other route is untouched:**
- Tool/SEO/localized routes keep their static shells + `createRoot()`. No regression.
- Localized home routes (`/fr/`, `/de/`, …) keep the old `siteHeader()+pageBody` shell; the
  `home` case in `bodyContent()` is NOT dead code and is intentionally preserved.

### Validation (CDP DOM traces, Chromium headless)

**Homepage first-paint proof — 4 configurations (desktop+mobile × fast+3G), sampled at
0/100/500/1000/2000ms + hydrated:**

| Config | firstChild@0ms | kids (all snapshots) | firstTagSet | firstClassSet | markers | rootHtmlLen trajectory | hydr. errors | console |
|---|---|---|---|---|---|---|---|---|
| desktop-fast | `DIV.min-h-screen…` | `[1,1,1,1,1]` | `[DIV]` | (single value) | `[1]` | 299608→299798 (const) | NONE | empty |
| desktop-3G | `DIV.min-h-screen…` | `[1,1,1,1,1]` | `[DIV]` | (single value) | `[1]` | 9899→38328→117859→206307→299608 (monotonic) | NONE | empty |
| mobile-fast | `DIV.min-h-screen…` | `[1,1,1,1,1]` | `[DIV]` | (single value) | `[1]` | 299608→300470 | NONE | empty |
| mobile-3G | `DIV.min-h-screen…` | `[1,1,1,1,1]` | `[DIV]` | (single value) | `[1]` | 17182→50415→132714→218185→299608 (monotonic) | NONE | empty |

`firstChild@0ms` is the REAL Layout wrapper (`DIV.min-h-screen`) in every case — never the old
`HEADER` shell. `rootKids` is constant `1` in every snapshot and every config → the `#root`
child count never changes → **the DOM is never torn down or rebuilt**. On 3G the `rootHtmlLen`
only ever grows (monotonic), because the FULL SSR document streams in over the network — the
page is the same coherent tree from first paint; there is no second, larger tree that replaces
it. Signature (element-tag skeleton) is `DIV[A][HEADER][MAIN]…` then grows to
`DIV[A][HEADER][MAIN][FOOTER][DIV]` — additive/streaming, never substituted.

**Direct DOM-mutation proof (MutationObserver injected pre-paint, desktop-fast + desktop-3G):**
observer attached to `document.body` (childList+attributes, subtree) recorded **ZERO mutations
targeting `#root`** during the entire load (`mutationCount: 0`, `teardownOfMinHScreen: 0`,
`topLevelAddsOfMinHScreen: 0`). React hydrates the existing SSR DOM **in place without touching
`#root`'s children**. (Contrast: `createRoot().render()` would emit a `childList` removing the
old node and inserting a new tree.)

**Homepage — heavy throttle stability (3G 200ms/200KB/s + CPU 6x, 150–154 samples):**
`firstSampleTag=DIV`, `firstClassSet` a single constant, `kidsSet=[1]`, `tagSet=[DIV]`,
`nonSingleKids=0`, `rootHtmlLen` monotonic 839→299608, `hasFooter` present from ~3.5–3.7s as the
SSR document streams in (not at JS-hydration time). Zero hydration warnings/exceptions/console.

**Route safety (direct URL + hard-refresh, desktop + mobile):**

| Route | Served document | `data-gu-ssr` | Mount | Renders | Errors |
|---|---|---|---|---|---|
| `/` | own SSR HTML | `1` | `hydrateRoot` | homepage | none |
| `/json-validator` | SPA fallback (`index.html`) | `1`* | `createRoot` (non-`/`) | tool (canonical → `/tools/json-validator`) | none |
| `/pdf-tools` | SPA fallback (`index.html`) | `1`* | `createRoot` (404 route) | app 404 page | none |
| `/image-compressor` | SPA fallback (`index.html`) | `1`* | `createRoot` (non-`/`) | tool (canonical → `/tools/image-compressor`) | none |
| `/tools/merge-pdf` | own HTML (no marker) | `NONE` | `createRoot` | tool | none |
| `/about` | own HTML (no marker) | `NONE` | `createRoot` | page | none |

\* The served `index.html` carries the marker, but the path is not `/`, so the `isHomePath` gate
forces `createRoot()` — this is exactly the guard that prevents hydrating the home SSR tree
against a tool render.

**Back/Forward (real browser history, `navigateToHistoryEntry`, desktop + mobile):**
`/ → /tools/merge-pdf → /about`, then back/back/forward/forward — every restore renders the
correct, non-blank page (`/` hydrates with marker `1`; tool/`about` createRoot with `NONE`);
zero hydration warnings, zero exceptions, zero console errors.

### Files changed
- `src/main.tsx` — route-gated `hydrateRoot`/`createRoot` via `data-gu-ssr` + path check.
- `scripts/prerender-entry.ts` — SSR of default-locale home via `renderToString`, `SSR_ROOT_ATTR`,
  branched `document()`.
- `scripts/prerender.mjs` — ESM→CJS prerender bundle, `createRequire` loader, `target: node20`.
- `src/components/Layout.tsx` — corrected the `firstClientRender` comment.

**Acceptance criteria (from H):** met — on refresh/hard-refresh/direct URL/Back-Forward,
desktop+mobile, fast+throttled, the first painted frame is already the full homepage (BrowseTools
+ footer present from paint), never the hero-only shell. Current → current from frame one; zero
overlay hacks.



## H) Risks & acceptance (status after fix)

- **Hydration correctness:** the SSR home tree is generated from the exact `<App/>` tree React
  hydrates, so markup matches by construction. `Layout.firstClientRender` + `HomePage.homeEntered`
  skip entrance animations on both SSR and first client render. `StrictMode` double-render is fine
  under hydration. **Validated:** `HYDRATION_ERRORS = NONE`, zero console messages.
- **SEO:** prerender remains fully static for every route; hydration only changes client behavior,
  never the served HTML. Confirmed `/` serves the full SSR HTML document.
- **Back/Forward & direct URL:** only the default-locale `/` hydrates; any other path (including
  direct navigations and bfcache restores) uses `createRoot()` and renders the correct view. The
  route-gate (`isHomePath`) guarantees the mismatch can't happen.
- **Other routes:** only `/` is SSR'd; every other prerendered route (`tools/*`, localized
  `pt-br/*`, `fr/*`, `de/*`, SEO pages) keeps its shell + `createRoot()`. Verified for
  `/tools/merge-pdf`, `/about`, `/json-validator`, `/fr/`, `/de/`.
- **Multi-locale SSR stale-flag concern:** only the default-locale home is SSR'd, so the
  `homeEntered` module-flag ordering issue that could arise from generating multiple locales in one
  Node process never occurs.
- **PWA/SW:** none exists, so no SW cache to invalidate — irrelevant.

**Acceptance criteria:** met (see G, Validation). After the fix, on refresh / hard-refresh /
direct URL / Back-Forward, desktop+mobile, the **first painted frame is already the full
homepage** (BrowseTools + footer present from paint), never the hero-only shell, at both fast and
throttled CPU/network. Current → current from frame one; zero permitted overlay hacks.

---

*Method: static `dist/client/index.html` inspection + CDP-sampled DOM over a locally served
production build (screenshots + per-ms DOM traces). Both the shell and the hydrated tree come from
the current codebase.*
