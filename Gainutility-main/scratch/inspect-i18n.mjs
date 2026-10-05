import fs from 'fs';

const pagesContent = fs.readFileSync('src/i18n/pages.ts', 'utf8');
const lines = pagesContent.split('\n');
const keys = [];
for (const line of lines) {
  const m = line.match(/^\s*"([a-zA-Z0-9_.-]+)":\s*\{/);
  if (m) keys.push(m[1]);
}
console.log('Total keys in pages.ts:', keys.length);
console.log('Areas:', [...new Set(keys.map(k => k.split('.')[0]))]);
console.log('Keys list:\n' + keys.join('\n'));
