/* GainUtility service worker — minimal, safe update behavior.
 *
 * Constraints:
 *  - HTML (navigations) is NETWORK-FIRST so a new deployment is never hidden
 *    behind a stale cached shell. The cached copy is only served while the
 *    network is genuinely unavailable (offline).
 *  - Content-hashed build assets (/assets/*) are immutable and cached, which
 *    makes the installed app feel fast and gives partial offline support for
 *    pages the user has actually visited.
 *  - No mutable HTML is ever cached "forever" and served while online.
 *  - Old cache versions are dropped on activate.
 */

const CACHE_VERSION = "gainutility-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

// Best-effort shell precache at install time so an installed app can open
// offline after its very first load.
const PRECACHE_PATHS = ["/", "/site.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.resolve()
      .then(() => caches.open(SHELL_CACHE))
      .then((cache) => cache.addAll(PRECACHE_PATHS))
      .catch(() => {}) // Precaching is best-effort; never block activation.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isAssetRequest = (url) => url.pathname.startsWith("/assets/");

// Stable public files that rarely change and never gate a deployment.
const STABLE_PUBLIC_FILE = /^\/(icon|apple-touch-icon|favicon|og-image|logo|site\.webmanifest)/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first. Only fall back to a cached shell when offline,
  // so a fresh deployment is always served while connected.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const atUrl = response.clone();
            const atRoot = response.clone();
            caches
              .open(SHELL_CACHE)
              .then((cache) =>
                Promise.all([cache.put("/", atRoot), cache.put(url.pathname, atUrl)])
              )
              .catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const atPath = await caches.match(url.pathname);
          if (atPath) return atPath;
          return caches.match("/");
        })
    );
    return;
  }

  // Content-hashed build assets are immutable — cache-first.
  if (isAssetRequest(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const fetched = await fetch(request);
        if (fetched && fetched.ok) {
          cache.put(request, fetched.clone()).catch(() => {});
        }
        return fetched;
      })
    );
    return;
  }

  // Stable public files: serve from cache instantly, refresh in the background.
  if (STABLE_PUBLIC_FILE.test(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }
});