import { build } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(root, ".probe-"));
const entry = join(work, "entry.ts");
writeFileSync(
  entry,
  `import { isLocalizedView } from ${JSON.stringify(join(root, "src", "i18n", "pages.ts"))};\n` +
    `export const probe = (id: string, locale: string) =>\n` +
    `  isLocalizedView({ type: "tool", id } as any, locale);\n`
);
const out = join(work, "out.mjs");
const res = await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  jsx: "automatic",
  outfile: out,
  logLevel: "silent",
});
if (res.errors.length) {
  console.error(res.errors);
  process.exit(2);
}
const mod = await import(pathToFileURL(out).href);
const locales = ["en", "pt-br", "id", "es-mx", "de", "fr", "it"];
const ids = [
  "youtube-keyword-explorer",
  "box-shadow-generator",
  "merge-pdf",
  "split-pdf",
  "json-beautifier",
  "base64-tool",
  "image-converter",
  "password-generator",
  "youtube-thumbnail-preview",
];
for (const id of ids) {
  console.log(
    id.padEnd(28) +
      locales.map((l) => `${l}=${String(mod.probe(id, l))}`).join(" ")
  );
}
rmSync(work, { recursive: true, force: true });
