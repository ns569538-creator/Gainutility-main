import fs from "node:fs";

const src = fs.readFileSync("src/data.ts", "utf8");
const graph = {
  "image-resizer": ["favicon-generator", "image-cropper", "image-converter", "social-resizer"],
  "image-cropper": ["image-resizer", "social-resizer", "image-watermark", "image-blur-pixelate"],
  "image-converter": ["image-watermark", "image-resizer", "jpg-to-pdf", "favicon-generator"],
  "png-jpg-converter": ["image-converter", "image-resizer", "social-resizer"],
  "webp-converter": ["image-converter", "image-to-palette", "favicon-generator"],
  "image-watermark": ["image-converter", "image-resizer", "social-resizer"],
  "image-blur-pixelate": ["image-converter", "image-watermark", "social-resizer"],
  "image-upscaler": ["image-converter", "image-cropper", "image-resizer"],
  "background-remover": ["image-converter", "image-resizer", "collage-maker", "image-watermark"],
  "image-metadata-remover": ["image-converter", "image-cropper", "image-resizer"],
  "social-resizer": ["image-resizer", "image-cropper", "collage-maker"],
  "favicon-generator": ["logo-maker", "image-converter", "image-resizer"],
  "logo-maker": ["favicon-generator", "image-resizer", "image-converter"],
  "collage-maker": ["image-resizer", "image-cropper", "image-converter"],
  "passport-photo-maker": ["image-resizer", "image-cropper", "image-watermark"],
  "jpg-to-pdf": ["merge-pdf", "compress-images-inside-pdf", "pdf-to-jpg"],
  "pdf-to-jpg": ["merge-pdf", "compress-images-inside-pdf", "split-pdf", "image-resizer"],
  "merge-pdf": ["split-pdf", "compress-images-inside-pdf", "protect-pdf", "pdf-to-word"],
  "split-pdf": ["compress-images-inside-pdf", "merge-pdf", "extract-pdf", "pdf-to-jpg"],
  "json-beautifier": ["json-validator", "json-minifier", "json-compare-diff"],
  "json-compare-diff": ["json-validator", "json-minifier", "json-to-csv"],
  "json-validator": ["json-beautifier", "json-minifier", "json-to-csv"],
  "json-minifier": ["json-beautifier", "json-validator", "json-compare-diff"],
  "json-to-csv": ["csv-json-converter", "json-beautifier", "json-validator"],
  "csv-json-converter": ["json-to-csv", "json-beautifier", "json-validator"],
  "seo-meta-generator": ["og-meta-generator", "twitter-card-generator", "google-serp-preview", "schema-markup-generator"],
  "og-meta-generator": ["twitter-card-generator", "google-serp-preview", "seo-meta-generator"],
  "twitter-card-generator": ["og-meta-generator", "google-serp-preview", "seo-meta-generator"],
  "google-serp-preview": ["seo-meta-generator", "schema-markup-generator", "og-meta-generator"],
  "schema-markup-generator": ["google-serp-preview", "seo-meta-generator", "og-meta-generator"],
  "utm-builder": ["canonical-url-generator", "hreflang-tag-generator", "qr-code-generator", "google-serp-preview"],
  "canonical-url-generator": ["hreflang-tag-generator", "google-serp-preview", "seo-meta-generator"],
  "hreflang-tag-generator": ["canonical-url-generator", "google-serp-preview", "seo-meta-generator"],
  "robots-txt-generator": ["xml-sitemap-generator", "check-my-website", "launch-checklist"],
  "xml-sitemap-generator": ["robots-txt-generator", "check-my-website", "launch-checklist"],
  "check-my-website": ["launch-checklist", "seo-meta-generator", "robots-txt-generator", "xml-sitemap-generator"],
  "launch-checklist": ["check-my-website", "seo-meta-generator", "og-meta-generator", "schema-markup-generator"],
};

let total = 0;
let tools = 0;
for (const [id, next] of Object.entries(graph)) {
  const at = src.indexOf(`"${id}": {`);
  if (at < 0) {
    console.log(`${id}: no SEO block`);
    continue;
  }
  const relStart = src.indexOf("related:", at);
  if (relStart < 0 || relStart - at > 4000) {
    console.log(`${id}: no related list`);
    continue;
  }
  const open = src.indexOf("[", relStart);
  const close = src.indexOf("]", open);
  const ids = [...src.slice(open, close).matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x) => next.includes(x));
  if (dup.length) tools++;
  total += dup.length;
  console.log(`${id}: related=[${ids.join(",")}] overlap=[${dup.join(",")}]`);
}
console.log(`\ntools with duplicates: ${tools}, duplicate links removed by the filter: ${total}`);
