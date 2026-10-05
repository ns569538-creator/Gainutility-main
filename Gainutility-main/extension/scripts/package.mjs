#!/usr/bin/env node
/**
 * package.mjs
 *
 * Assembles a ready-to-submit Chrome extension folder by copying manifest.json
 * (and any other top-level static files the manifest references) into dist/.
 * The result is what you load via chrome://extensions (Load unpacked) or zip
 * for the Chrome Web Store.
 *
 * Run: `npm run package`
 */

import { copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(__dirname, "..");
const dist = resolve(extRoot, "dist");

mkdirSync(dist, { recursive: true });

// Copy the manifest — everything else (popup.html, icons) is already in dist/
// via vite's public/ handling.
const manifest = resolve(extRoot, "manifest.json");
copyFileSync(manifest, resolve(dist, "manifest.json"));
console.log("Copied manifest.json → dist/");

// Report what ships in the package so it's easy to audit permissions/size.
const manifestJson = JSON.parse(readFileSync(manifest, "utf8"));
console.log(
  `package ready: name="${manifestJson.name}" v${manifestJson.version} ` +
    `permissions=[${manifestJson.permissions.join(", ")}]`
);
