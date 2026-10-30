import fs from 'fs';
const content = fs.readFileSync('src/i18n/pages.ts', 'utf8');
const lines = content.split('\n');
const topLevelKeys = [];
for (const line of lines) {
  const m = line.match(/^\s{2}"([a-zA-Z0-9_.-]+)":\s*\{/);
  if (m) topLevelKeys.push(m[1]);
}
console.log('Total PAGE keys:', topLevelKeys.length);
const prefixes = new Set(topLevelKeys.map(k => k.split('.')[0]));
console.log('Prefixes:', Array.from(prefixes));
console.log('Keys:', topLevelKeys);
