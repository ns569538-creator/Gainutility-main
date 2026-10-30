# GainUtility

80+ fast, practical tools for developers, designers, creators, marketers, and everyday work — PDF tools, office converters, image utilities, JSON/CSS/SEO studios, and business calculators. **Everything runs 100% client-side** — files never leave your device.

Production site: https://gainutility.com

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- `pdf-lib` / `@cantoo/pdf-lib` (PDF manipulation & encryption)
- `pdf.js` (rendering/text extraction), `tesseract.js` (OCR), `jszip`, `xlsx`

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command                      | What it does                                               |
| ---------------------------- | ---------------------------------------------------------- |
| `npm run dev`                | Start the dev server                                       |
| `npm run build`              | Regenerate sitemap + production build to `dist/client` (Pages-ready output, includes prerendered HTML for every route) |
| `npm run deploy`             | Build + deploy `dist/client` to Cloudflare Pages project `gainutility` (production, `main` branch) |
| `npm run deploy:pages:preview` | Build + deploy `dist/client` to Cloudflare Pages as a preview deployment |
| `npm run sitemap`            | Regenerate `public/sitemap.xml` from the tool registry     |
| `npm run lint`               | TypeScript typecheck (`tsc --noEmit`)                      |

## Deployment (Cloudflare Pages)

The production deployment path builds and ships the static site to a Cloudflare
Pages project named `gainutility` (verified at `https://gainutility.pages.dev`):

```bash
npm run deploy
```

`npm run build` produces `dist/client` which is the deployable Pages output
directory. Prerendered HTML is emitted to `dist/client/<route>/index.html` for
the root, every tool route, localized routes (`/fr/...`, `/es-mx/...`, ...), and
static pages, so Pages serves real SEO-complete HTML without SPA fallback.
`_redirects` and `_headers` in `public/` are copied into the output and honored
by Pages.

The old `gainutility` Cloudflare Worker was a thin static-asset pass-through
hosting the same build; it is no longer the application host.

## Architecture notes

- **Routing**: history-based clean URLs (`src/router.ts`). Every tool lives at `/tools/<tool-id>`, studios at `/studios/<id>`, static pages at their own paths. Unknown routes render a 404 page; legacy bare tool paths (`/<tool-id>`) redirect to `/tools/<tool-id>` via `history.replaceState`. A SPA deployment still needs host rewrites serving `index.html` for unknown paths.
- **Tool registry**: `src/toolsRegistry.tsx` holds canonical metadata for every tool; `src/searchIndex.ts` derives header search and the ⌘K command palette from it.
- **SEO**: `src/site.ts` is the single source of brand truth (`SITE_URL`, canonical helpers). Per-route titles, meta tags, canonicals, Open Graph/Twitter cards, and JSON-LD (WebSite, Organization, SoftwareApplication, BreadcrumbList, FAQPage) are applied in `src/components/Layout.tsx`; per-tool metadata comes from `src/data.ts`.
- **Static assets**: `public/` holds robots.txt, sitemap.xml, favicon.svg/.ico, apple-touch-icon.png, PWA icons, manifest.webmanifest, logo.svg, og-image.png.
- **Canonical URLs**: override origin with `VITE_SITE_URL` (defaults to `https://gainutility.com`).
- **Code-splitting**: every tool is `React.lazy`-loaded; heavy libs (pdf-lib, xlsx, jszip) land in shared async chunks.
- Adding a new tool: implement it, register an id in `src/types.ts`, add a case in `App.tsx`, add metadata to `toolsRegistry.tsx`, add SEO entry in `data.ts`, add studio listing in `studiosData.ts`, add the id to `TOOL_IDS` in `src/router.ts`, then rerun `npm run sitemap`.
