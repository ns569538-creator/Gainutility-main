import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist/client');

console.log('--- GAINUTILITY REDESIGNED BLOG VERIFICATION ---');

const blogPages = [
  'blog.html',
  'pt-br/blog.html',
  'de/blog.html',
  'fr/blog.html',
  'es-mx/blog.html',
  'id/blog.html',
  'it/blog.html',
];

let errors = 0;

for (const rel of blogPages) {
  const filePath = path.join(distDir, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING FILE: ${rel}`);
    errors++;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');

  // Verify H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

  // Verify canonical
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : '';

  // Verify search presence
  const hasSearch = html.includes('id="blog-search-input"');

  // Verify featured presence
  const hasFeatured = html.includes('id="featured-article-title"') || html.includes('FEATURED');

  // Verify category filter presence
  const hasCategory = html.includes('PDF') && html.includes('Images');

  console.log(`\nPage: ${rel}`);
  console.log(`  H1: ${h1}`);
  console.log(`  Canonical: ${canonical}`);
  console.log(`  Search input: ${hasSearch}`);
  console.log(`  Featured guide: ${hasFeatured}`);
  console.log(`  Categories: ${hasCategory}`);

  if (!canonical || canonical.endsWith('.html')) {
    console.error(`  ERROR: Bad canonical: ${canonical}`);
    errors++;
  }
  if (!hasSearch) {
    console.error(`  ERROR: Missing search input`);
    errors++;
  }
}

console.log(`\nVerification finished with ${errors} errors.`);
