import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Builds the GainUtility Chrome extension popup as a small, self-contained
 * React bundle. Output goes to dist/ where it sits alongside the static
 * manifest.json, icons, and popup.html ready to be packaged for the Chrome
 * Web Store.
 *
 * The separate `extension/` project deliberately keeps the extension tiny:
 * the popup loads neither the website's router nor its tool bundles — only a
 * generated JSON catalogue of tool names/ids plus a lightweight search.
 */
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Keep the popup lean — no source maps in the shipped package.
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
      output: {
        // Inline everything into a single JS file so manifest routes resolve.
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
