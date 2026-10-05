import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist/client');

console.log('--- GAINUTILITY I18N VERIFICATION AUDIT ---');

const samplePages = [
  'blog/how-to-remove-background-from-an-image.html',
  'pt-br/blog/how-to-remove-background-from-an-image.html',
  'de/blog/how-to-remove-background-from-an-image.html',
  'fr/blog/how-to-remove-background-from-an-image.html',
  'es-mx/blog/how-to-remove-background-from-an-image.html',
  'id/blog/how-to-remove-background-from-an-image.html',
  'it/blog/how-to-remove-background-from-an-image.html',
];

let errors = 0;

for (const rel of samplePages) {
  const filePath = path.join(distDir, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING FILE: ${rel}`);
    errors++;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => ({
    lang: m[1],
    href: m[2]
  }));

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';

  const jsonLdMatch = html.match(/<script id="seo-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const hasJsonLd = Boolean(jsonLdMatch);

  console.log(`\nPage: ${rel}`);
  console.log(`  Title: ${title}`);
  console.log(`  Canonical: ${canonical}`);
  console.log(`  Hreflang count: ${hreflangs.length}`);
  console.log(`  JSON-LD present: ${hasJsonLd}`);

  if (rel.startsWith('pt-br/') && !canonical.includes('/pt-br/')) {
    console.error(`  ERROR: pt-br page has incorrect canonical: ${canonical}`);
    errors++;
  }
}

console.log(`\nBlog audit completed with ${errors} errors.`);
