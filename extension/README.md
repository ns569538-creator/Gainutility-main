# GainUtility Chrome Extension

A real, installable **Manifest V3** browser extension that puts GainUtility's tools one click away in the browser toolbar. It ships as a tiny React popup with its own lightweight search — it does **not** bundle the website's React app or router.

## What it does

- **Global tool search** across every tool in the registry (PDF, images, developer, SEO, text, …).
- **Quick tools** — the most-used tools surfaced instantly.
- **Recently used** — remembers your last few tools via `chrome.storage.local` (no sensitive permissions).
- **Browse by category** — tap through the same categories the website uses.
- Every result opens the matching tool at `https://gainutility.com/tools/<id>` in a new tab.

## Permissions

Only `storage` (to persist "recently used"). No tab/history/cookie/site-access permissions are requested.

## Source of truth

Tool data is **generated**, not hand-duplicated. `npm run generate:tools` reads the website's single registry (`src/toolsRegistry.tsx`) plus its search index and emits `src/generated/tools.json`, which the popup consumes. If a tool is added or renamed on the website, running `npm run package` rebuilds the catalogue automatically.

```
extension/
├── manifest.json            # MV3 manifest (storage permission only)
├── popup.html
├── vite.config.ts
├── scripts/
│   ├── generate-tools.mjs   # website registry -> tools.json
│   ├── generate-icons.mjs   # brand G mark -> PNG icons (16/32/48/128)
│   └── package.mjs          # assemble dist/ for loading / submitting
├── src/
│   ├── App.tsx              # popup UI (search, quick, recent, categories)
│   ├── data.ts              # search + helpers over generated tools.json
│   ├── storage.ts           # recently-used via chrome.storage.local
│   └── popup.css            # brand-styled popup (green #2F5233 / cream)
└── dist/                    # output: load this folder in Chrome
```

## Build & package

```bash
cd extension
npm install
npm run package      # generates tools.json + icons, builds, copies manifest into dist/
```

The loadable extension is everything inside `extension/dist/`.

## Load locally (unpacked)

1. Run `npm run package` inside `extension/`.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the `extension/dist/` folder.
5. Pin the GainUtility icon to the toolbar and click it to open the popup.

### Verify

- The toolbar icon renders the brand "G" tile at all sizes.
- Typing in the popup search filters the catalogue live.
- Clicking a tool opens a new tab to `/tools/<id>` and moves it to "Recently used".

## Publish to the Chrome Web Store

1. Zip the **contents** of `extension/dist/` (the `manifest.json` must be at the zip root).
2. Go to the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole).
3. Create a new item, upload the zip, and fill in the listing (store icon, screenshots, description, categories, privacy/`single purpose`).
4. Submit for review. The listed URL is the `VITE_CHROME_EXTENSION_STORE_URL` the website's **Add to Chrome** CTA links to.

### After publishing

Set the store URL at build time so the website renders the "Add to Chrome" call-to-action:

```
VITE_CHROME_EXTENSION_STORE_URL=https://chromewebstore.google.com/detail/<your-id>
```

Until that env var is set, the website deliberately hides the CTA (never links to a dead placeholder).
