/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * On-demand loader for pdf.js. Replaces the render-blocking CDN <script>
 * that used to sit in index.html — the library is now fetched only when a
 * component that actually needs it mounts.
 */

const PDFJS_VERSION = "3.11.174";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

let loadPromise: Promise<any> | null = null;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-pdfjs="${src}"]`
    );
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      // A previously-failed attempt leaves a dead tag whose load/error
      // events have already fired — remove it so this retry can start fresh.
      existing.remove();
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.pdfjs = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

/**
 * Resolve to the global pdfjsLib, downloading the library + worker config
 * on first call and caching the promise for subsequent callers.
 */
export function loadPdfJs(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const w = window as any;
    if (w.pdfjsLib) return w.pdfjsLib;

    // Some builds expose the library under the module name.
    if (!w.pdfjsLib && w["pdfjs-dist/build/pdf"]) {
      w.pdfjsLib = w["pdfjs-dist/build/pdf"];
    }

    await injectScript(`${PDFJS_BASE}/pdf.min.js`);

    const lib = w.pdfjsLib || w["pdfjs-dist/build/pdf"];
    if (!lib) throw new Error("pdf.js failed to initialize");

    lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
    return lib;
  })().catch((err) => {
    loadPromise = null; // allow retry on next call
    throw err;
  });

  return loadPromise;
}
