# Non-homepage first-paint / startup audit — ROOT CAUSE & MINIMAL SAFE FIX

Audit performed against the production build output (`dist/client`, 2929 HTML files) and validated
with **live headless-Chrome reproduction** (raw CDP over WebSocket) on the running app served from
`dist/client` with a Cloudflare-Pages-equivalent static server + SPA fallback.

At audit time no production source code was changed; only non-shipped audit scripts were added
(`scripts/audit-classify.mjs`, `scripts/cdp-route-audit.mjs`, `scripts/cdn-static-server.mjs`).
The fix below was then **implemented and verified** (see §6), including the proven homepage
`hydrateRoot` fix in `src/main.tsx`, which is preserved.

---

## 1. Build-output classification (authoritative)

Classifier over all 2929 files in `dist/client`:

| Class | Count | Marker (`data-gu-ssr="1"`) | Body |
|---|---|---|---|
| `ssr-home` | **1** (`dist/client/index.html`, 305 KB) | present | full real React home tree (`#root` → `min-h-screen` `DIV`) |
| `static-header-shell` | **2928** (all other routes) | absent | static `HEADER` + breadcrumb + `h1` + description + "Related tools" + "This interactive tool requires JavaScript." |

Every non-homepage route ships a **hand-written static preview shell**, not the React tree.

---

## 2. Live-browser reproduction (the user-visible symptom, confirmed)

Sampled `#root` DOM at t = 0/100/250/500/1000/2000 ms + after-settle, desktop & mobile, fast & 3G.

### Tool route: `/tools/json-validator` (real prerendered shell)
- **fast, first paint (t=0–100 ms):** `#root > HEADER`, **7 children**, `htmlLen=7798`, text =
  **"Home / JSON Studio / JSON Validator JSON Validator Validate JSON instantly … Related tools …"**
  → this is the WRONG/partial text shell.
- **t=250 ms:** React `createRoot().render()` runs → `kidCount` 7→**1**, `firstTag` `HEADER`→`DIV.min-h-screen`,
  `htmlLen` 7798→**51258**, real tool UI (`tool-panel`, `role=status`) appears.
- **3G (desktop & mobile):** the wrong text shell persists the **entire 2 s+ window and past after-settle**
  (`kids=7 first=HEADER len=7798`), because the tool JS chunk is still downloading. This is the explicit
  reported flash under slow networks.

### Real Shell → Real UI (all classes tested), fast & 3G
- `/studios/color/generator`: shell shows "Home / Color Studio / Color Palette Generator Color Studio
  Generate harmonious …", then React swaps to the Color Studio workspace; shell persists >2 s on 3G.
- `/about`: shell shows "Home / About About GainUtility — Our Mission …", swap at ~100 ms (fast), shell
  persists >2 s on 3G.
- `/json/best` (category page): shell "Home / JSON Tools / Best JSON Tools Best Free JSON Tools 2026 …",
  swap at ~100–250 ms; on 3G shell persists through 2 s (and briefly shows a footer-only intermediate
  `DIV` at ~100 ms — a second partial frame).

### Legacy bare routes without a prerender file (`/json-validator`, `/image-compressor`)
Served by Cloudflare Pages SPA fallback → `dist/client/index.html` = the **full 305 KB homepage SSR
document** (verified at HTTP/deploy level). First paint = the **whole homepage**, then the router/React
replaces it with the tool. Even more jarring than the tool-shell case.

---

## 3. ROOT CAUSE (by route class)

`src/main.tsx:30` gates hydration by **path AND marker**:
`shouldHydrate = isHomePath && rootEl?.dataset.guSsr === '1'`.

Only the homepage ever carries `data-gu-ssr="1"` (`scripts/prerender-entry.ts:70,88`). Every other route
is an un-marked static shell, so `main.tsx:45` calls `createRoot(rootEl).render(<App/>)`. Because the
shell HTML does **not** match the React tree's first render (tool/SEO views are `React.lazy` + Suspense —
explicitly "**NOT server-rendered**", `prerender-entry.ts:85`), `createRoot` **destroys the served shell
DOM and rebuilds from scratch**:

| Route class | First paint (visible) | At React mount | Result |
|---|---|---|---|
| 2928 shell routes (`/tools/*`, categories, `/about`, seo, blog, locale) | static header + wrong/partial text shell | `createRoot` tears down shell (7→1 kids, header jump) | visible text+DOM flash; persists >2 s on 3G |
| Legacy bare routes (`/json-validator`, `/image-compressor`) | full homepage SSR doc (SPA fallback) | router/`createRoot` swap to tool | whole-homepage flash |

The flash is a **DOM rebuild**, the same mechanism the homepage fix eliminated — now generalized to every
non-home route. The static shell was intended to be a lightweight first paint, but because it is a
*different tree* than what React renders, React can't adopt it; it destroys it.

---

## 4. MINIMAL SAFE FIX (no loaders, no masking, no delays, no hydration mismatches)

Constraint: the shell HTML does not match the React `App` tree (tools are lazy/Suspense), so
`hydrateRoot` cannot be applied as-is without mismatch errors.

The only architecture that removes the flash without a forbidden technique is: **serve the real React
tree for every route and hydrate it in place**, reusing the already-proven `data-gu-ssr` hydrate gate.

**Both conditions from the homepage fix must be extended to non-home routes:**
1. The prerender must emit the **real route tree** (what React renders first for that URL) with
   `data-gu-ssr="1"` — not the hand-written shell.
2. `main.tsx` must hydrate whenever `data-gu-ssr="1"` is present (drop the `isHomePath &&` restriction).

Because tool/SEO views are code-split behind `React.lazy` + `Suspense`, their first React render is a
**Suspense fallback**, not the tool body. Two viable sub-approaches:

- **A. Full per-route SSR (heaviest, most faithful):** have the prerender server-render the real route
  tree (eager resolve the current view instead of `React.lazy` suspense for the prerender pass) and place
  the real tool markup + `data-gu-ssr="1"` in the doc. Browser hydrates it → first paint == real UI,
  no swap. This exactly mirrors the homepage already working and is the same correctness contract.
- **B. Hybrid mount (smaller HTML, still no flash):** keep the shell for SEO, but **hydrate the
  always-matching page chrome** (header/breadcrumb/footer — already identical between shell and layout)
  and mount only the tool body into a dedicated container with `createRoot`. Requires separating the
  shell into a chrome part that matches React and a tool slot.

Both eliminate the wrong-text frame without any forbidden loader/spinner/opacity/delay. **A is the most
faithful to the existing homepage fix; B is the smallest HTML but a larger refactor of Layout/prerender.**

### Files that would change
- `scripts/prerender-entry.ts` — emit real route tree (or match chrome) + `data-gu-ssr="1"` on all routes.
- `src/main.tsx` — hydrate gate: `shouldHydrate = rootEl?.dataset.guSsr === '1'` (remove `isHomePath &&`).
- `src/App.tsx` — ensure the route's first render is eager/deterministic on the hydrate path (no
  client-only state divergence), or provide a `firstClientRender`-style flag (already exists in `Layout`).
- (For A) the prerender runner `scripts/prerender.mjs` if it needs to wait for the lazy view.

### Explicitly rejected (per project rules)
Loading screens, fake/decoration spinners, opacity/white overlays, `setTimeout`/artificial delay, CSS
hiding, `scrollTo`, and decoration-only skeletons — none are needed; the real UI can be first paint via
hydrate-able per-route SSR.

---

## 5. Associated audit artifacts (non-shipping)
- `scripts/audit-classify.mjs` — 1 ssr-home / 2928 shell classification.
- `scripts/cdp-route-audit.mjs` — live headless-Chrome flash sampler (output in
  `C:\Users\nav\AppData\Local\Temp\opencode\route-audit\*.json`).
- `scripts/cdn-static-server.mjs` — Cloudflare-Pages-equivalent local server (SPA fallback incl.
  dir→`index.html`).

---

## 6. IMPLEMENTED FIX + VERIFIED OUTCOME (post-audit)

Approach **A (full per-route SSR, hydrate in place)** — the minimal safe fix, matching the user-confirmed
contract: *"real chrome + correct breadcrumb, native tool loading state."*

### What changed (production code)
1. **`scripts/prerender-entry.ts`** — added `SSR_VIEW_TYPES` (tool, seo-page, translator-pair,
   comparison-page, category-best, color-studio, color-page) + `renderRouteSSR(view, locale)`, which
   `renderToString`-renders the real `App` tree seeded with `initialView`/`initialLocale`. `document()`
   now emits `data-gu-ssr="1"` + the real tree for every lazy-bodied route (across all 8 locales). Static
   content pages and localized home keep their lightweight preview shell (`createRoot`).
2. **`src/main.tsx`** — hydrate gate changed to `shouldHydrate = rootEl?.dataset.guSsr === '1' &&
   isCanonical` (drops the `isHomePath &&` restriction; `pathToView` + legacy-redirect guard).
3. **`src/App.tsx`** — accepts optional `AppProps { initialView?, initialLocale? }` used as
   `useState`/locale seeds so server markup matches the client derivation. Added a `bodyReady` gate
   (`useState(false)` + `useEffect(() => setBodyReady(true), [])`) around all seven `React.lazy` bodies:
   `<Suspense fallback={fb}>{bodyReady ? realChild : fb}</Suspense>`.

### Why the `bodyReady` gate (hydration mismatch #419)
`renderToString` renders a suspended `React.lazy` under `Suspense` as plain fallback markup with **no**
`<!--$-->` boundary. On fast/cached loads the tool chunk resolves (via `use()`) before hydration, so the
client's first render shows the real tool while the server sent the fallback → React `hydrateRoot` throws
error **#419** (a timing race). The gate keeps `bodyReady=false` on the server **and** on hydration's first
render, so the client renders the same fallback → **no mismatch**; the native `Suspense` fallback then
loads the tool in place. On pure client-side navigation `bodyReady` is already `true`, so in-SPA tool
switches are unaffected.

### Verified (headless Chrome, real build output, fast + 3G, desktop + mobile)
Post-fix classification: **2769** SSR-marked pages vs **160** shells (static content + localized home).
- `/tools/json-validator`: **correct** breadcrumb "Home / Developer Tools / JSON Validator" + real tool
  title at first paint; `#root` stays `kidCount=1 firstTag=DIV.min-h-screen` at **every** sample — **no DOM
  tear-down**; `len` grows smoothly 38937→51315 as the native fallback is replaced by the tool in place.
- `/studios/color/generator`, `/json/best`: same stable `kidCount=1`, correct chrome/breadcrumb first
  paint, native fallback → content in place. No teardown.
- **Console probe**: `/tools/json-validator`, `/studios/color/generator`, `/json/best`, `/about` — **zero
  hydration/console errors** (no #419) after the gate.
- `/about` (shell/`createRoot`) and localized home remain unchanged (no marker, `createRoot`).
- `npm run lint` (tsc --noEmit): clean.

Constraints honored: no loaders, no fake spinners, no opacity/white overlays, no `setTimeout`/delays, no
CSS hiding, no `scrollTo`, no decoration skeletons, no arbitrary DOM trickery. The wrong-text/partial shell
is gone; the tool body shows its pre-existing native `Suspense` fallback and loads in place.
