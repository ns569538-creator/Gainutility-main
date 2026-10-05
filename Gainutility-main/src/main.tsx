import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import {pathToView} from './router';
import './index.css';

/**
 * Deliberate mount strategy (fixes the first-paint "flash" at its root).
 *
 * The prerender pipeline server-renders the REAL React tree and marks the
 * mount element with an explicit build-generated attribute (`data-gu-ssr="1"`)
 * whenever the served document carries a tree that exactly matches what React
 * will render during hydration. This is true for:
 *   - the default-locale homepage, AND
 *   - every route whose interactive body is code-split behind React.lazy +
 *     Suspense (tool, seo-page, translator-pair, comparison-page, category-best,
 *     color-studio, color-page): the eager Layout chrome (header, footer,
 *     correct tool breadcrumb) is server-rendered as the real tree, while the
 *     lazy body renders its Suspense fallback on both sides.
 *
 * When BOTH the marker is present AND the current URL is a canonical prerendered
 * route, we HYDRATE — React attaches to the existing DOM instead of destroying
 * it, producing one coherent UI from first paint through hydration with no
 * visible swap and no wrong/partial text shell.
 *
 * We createRoot().render() (rebuild) when:
 *   - the marker is absent: the document is a lightweight static preview shell
 *     (static content pages: about/blog/services/privacy/... and localized home)
 *     which does not match the React tree, so it is rebuilt; or
 *   - the URL is a legacy bare / redirect route (e.g. "/json-validator" falling
 *     back to the home SSR document on Cloudflare Pages). Hydrating the home
 *     tree against a non-home view would mismatch, so we rebuild instead — the
 *     router then renders the correct view.
 */
const rootEl = document.getElementById('root');
// Only hydrate a marked document when this path is its true canonical route.
const route = pathToView(window.location.pathname);
const isCanonical = !route.redirectTo && route.view.type !== 'notFound';
const shouldHydrate = !!rootEl && rootEl.dataset.guSsr === '1' && isCanonical;

function AppTree() {
  return (
    <StrictMode>
      <ErrorBoundary label="app">
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

if (shouldHydrate) {
  hydrateRoot(rootEl!, <AppTree />);
} else if (rootEl) {
  createRoot(rootEl).render(<AppTree />);
}

// Register the PWA service worker in production only (dev/HMR is unaffected).
// Registration is optional and never blocks rendering or hydration.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* The site works fine without a service worker. */
    });
  });
}
