/**
 * Search quality suite (zero-dependency).
 *
 * Bundles src/searchIndex.ts with esbuild (already a vite dependency) and
 * asserts that the queries real people type return the tool they mean.
 *
 *   node scripts/search-suite.mjs          run suite, non-zero exit on failure
 *   node scripts/search-suite.mjs --show   also print top 5 for every query
 */
import { build } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// The bundle must live inside the repo so node can resolve react/lucide-react.
const work = mkdtempSync(join(root, ".search-suite-"));
const entry = join(work, "entry.ts");
writeFileSync(
  entry,
  `export { searchTools, SEARCH_INDEX } from ${JSON.stringify(join(root, "src", "searchIndex.ts"))};\n`
);

const out = await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  jsx: "automatic",
  outfile: join(dirname(entry), "out.mjs"),
  logLevel: "silent",
});
if (out.errors.length) {
  console.error(out.errors);
  process.exit(2);
}
const { searchTools } = await import(pathToFileURL(join(dirname(entry), "out.mjs")).href);

/** query -> tool id that must appear in the top `top` results */
const SUITE = [
  ["image to pdf", "jpg-to-pdf", 1],
  ["jpg to pdf", "jpg-to-pdf", 1],
  ["png to pdf", "jpg-to-pdf", 2],
  ["photo to pdf", "jpg-to-pdf", 2],
  ["pictures into pdf", "jpg-to-pdf", 3],
  ["merge pdf", "merge-pdf", 1],
  ["combine pdfs", "merge-pdf", 2],
  ["join two pdf", "merge-pdf", 3],
  ["split pdf", "split-pdf", 1],
  ["pdf to word", "pdf-to-word", 1],
  ["word to pdf", "word-to-pdf", 1],
  ["pdf to jpg", "pdf-to-jpg", 1],
  ["rotate pdf", "rotate-pdf", 1],
  ["delete pages from pdf", "delete-pdf", 2],
  ["extract pdf pages", "extract-pdf", 1],
  ["compress pdf", "compress-images-inside-pdf", 3],
  ["make pdf smaller", "reduce-pdf-image-quality", 3],
  ["pdf compressor", "reduce-pdf-image-quality", 3],
  ["compress image", "image-converter", 3],
  ["resize image", "image-resizer", 1],
  ["crop image", "image-cropper", 1],
  ["json formatter", "json-formatter", 1],
  ["format json", "json-formatter", 2],
  ["qr code", "qr-code-generator", 1],
  ["url encoder", "url-encoder-decoder", 1],
  ["remove background", "background-remover", 1],
  ["youtube keywords", "youtube-keyword-explorer", 1],
  ["password generator", "password-generator", 1],
  ["hash generator", "hash-generator", 1],
  ["color picker", "color-picker", 1],
  ["slug generator", "slug-generator", 1],
  ["heic to jpg", "heic-jpg-converter", 1],
  ["webp converter", "webp-converter", 1],
  ["base64", "base64-tool", 1],
  ["regex tester", "regex-tester", 1],
  ["uuid", "uuid-generator", 1],
  ["jwt", "jwt-decoder", 1],
  ["timestamp", "unix-timestamp-converter", 3],
  ["cron expression", "cron-expression-builder", 1],
  ["yaml formatter", "yaml-formatter", 1],
  ["sql formatter", "sql-formatter", 1],
  ["csv to json", "csv-json-converter", 1],
  ["watermark pdf", "add-pdf-watermark", 2],
  ["protect pdf", "protect-pdf", 1],
  ["unlock pdf", "unlock-pdf", 1],
  ["repair pdf", "repair-pdf", 1],
  ["ocr pdf", "ocr-pdf", 1],
  ["pdf to excel", "pdf-to-excel", 1],
  ["video compressor", "video-compressor", 1],
  ["video to gif", "video-to-gif", 1],
  ["image upscaler", "image-upscaler", 1],
  ["passport photo", "passport-photo-maker", 1],
  ["favicon", "favicon-generator", 1],
  ["meta tags", "seo-meta-generator", 2],
  ["robots txt", "robots-txt-generator", 1],
  ["sitemap", "xml-sitemap-generator", 1],
  ["schema markup", "schema-markup-generator", 1],
  ["utm", "utm-builder", 2],
  // typo tolerance
  ["resze image", "image-resizer", 2],
  ["combin pdf", "merge-pdf", 2],
  ["mrg pdf", "merge-pdf", 3],
  // natural language
  ["how to make a pdf smaller", "reduce-pdf-image-quality", 3],
  ["turn my photo into a pdf", "jpg-to-pdf", 3],
];

const show = process.argv.includes("--show");
let failed = 0;
const seen = new Set();
try {
  for (const [query, want, top] of SUITE) {
    const results = searchTools(query);
    const ids = results.map((r) => r.id);
    const at = ids.indexOf(want);
    const ok = at !== -1 && at < top;
    if (!ok) failed++;
    const head = results.slice(0, 5).map((r) => r.id).join(" > ");
    const mark = ok ? "PASS" : "FAIL";
    if (!ok || show) {
      console.log(`${mark}  "${query}"  want ${want} in top ${top}  (got ${at === -1 ? "absent" : at + 1})\n      ${head}`);
    }
    ids.slice(0, 5).forEach((id) => seen.add(id));
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(`\n${SUITE.length - failed}/${SUITE.length} passed`);
process.exit(failed ? 1 : 0);
