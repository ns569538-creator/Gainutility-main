/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Font loading for the Font Finder: batched Google Fonts CSS2 <link>
 * injection plus awaited document.fonts readiness for glyph rendering.
 * Families installed on the user's system (common for commercial fonts) are
 * detected without any network request.
 */

const linked = new Set<string>();
const readyPromises = new Map<string, Promise<boolean>>();
const pendingQueue = new Map<string, Set<number>>(); // family → weights
let flushTimer: number | null = null;

const FAMILY_PER_LINK = 12;
const LOAD_TIMEOUT_MS = 6000;

function css2Url(entries: Array<{ family: string; weights: number[] }>): string {
  const params = entries
    .map((e) => {
      const fam = e.family.replace(/ /g, "+");
      const weights = [...new Set(e.weights)].sort((a, b) => a - b);
      return weights.length
        ? `family=${fam}:wght@${weights.join(";")}`
        : `family=${fam}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function injectLink(href: string, id: string): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.getElementById(id) as HTMLLinkElement | null;
    if (existing) {
      // Already present — assume loaded (or already failed) and re-check.
      resolve(true);
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    const done = (ok: boolean) => resolve(ok);
    link.onload = () => done(true);
    link.onerror = () => done(false);
    document.head.appendChild(link);
    window.setTimeout(() => done(!!document.getElementById(id)), LOAD_TIMEOUT_MS);
  });
}

function linkIdFor(family: string, weights: number[]): string {
  return `gu-font-${family.replace(/[^a-zA-Z0-9]/g, "-")}-${weights.join("_") || "auto"}`;
}

/**
 * Queue a family+weights for batched stylesheet injection (fire-and-forget;
 * CSS `display=swap` handles the visual upgrade). Multiple requests within
 * a short window share one <link>.
 */
export function requestFamilyStyles(family: string, weights: number[]): void {
  if (typeof document === "undefined") return;
  const key = family;
  if (linked.has(key)) return;
  if (!pendingQueue.has(key)) pendingQueue.set(key, new Set());
  const set = pendingQueue.get(key)!;
  for (const w of weights.length ? weights : [400]) set.add(w);

  if (flushTimer != null) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(flushPending, 40);
}

function flushPending(): void {
  flushTimer = null;
  const entries: Array<{ family: string; weights: number[] }> = [];
  for (const [family, weights] of pendingQueue) {
    entries.push({ family, weights: [...weights].sort((a, b) => a - b) });
    linked.add(family);
  }
  pendingQueue.clear();
  for (let i = 0; i < entries.length; i += FAMILY_PER_LINK) {
    const chunk = entries.slice(i, i + FAMILY_PER_LINK);
    const href = css2Url(chunk);
    void injectLink(href, `gu-font-batch-${i}-${chunk[0].family.replace(/\W/g, "")}`);
  }
}

/** True when the browser can already render with this family (system or loaded). */
export function hasFontFamily(family: string): boolean {
  if (typeof document === "undefined" || !document.fonts?.check) return false;
  try {
    return document.fonts.check(`400 16px "${family}"`);
  } catch {
    return false;
  }
}

/**
 * Await actual glyph availability at a specific weight — used before canvas
 * glyph rendering so we never compare against a fallback face. Resolves
 * false when the family can't be loaded (offline, unknown family).
 */
export async function ensureFontReady(
  family: string,
  weights: number[],
): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const key = `${family}#${[...new Set(weights)].sort((a, b) => a - b).join(",")}`;
  const cached = readyPromises.get(key);
  if (cached) return cached;

  const promise = (async () => {
    if (hasFontFamily(family)) return true;
    const href = css2Url([{ family, weights }]);
    const ok = await injectLink(href, linkIdFor(family, weights));
    if (!ok && !hasFontFamily(family)) return false;
    try {
      const probe = `${weights.includes(400) ? 400 : weights[0] ?? 400} 96px "${family}"`;
      await Promise.race([
        (document as any).fonts.load(probe, "AaBbGg123"),
        new Promise((r) => window.setTimeout(r, LOAD_TIMEOUT_MS)),
      ]);
    } catch {
      // fall through to the check below
    }
    return hasFontFamily(family);
  })();

  readyPromises.set(key, promise);
  promise.then((ok) => {
    if (!ok) readyPromises.delete(key); // allow retry after reconnect
  });
  return promise;
}

/** Test hook: forget every cached readiness/link state. */
export function resetFontLoaderForTests(): void {
  linked.clear();
  readyPromises.clear();
  pendingQueue.clear();
}
