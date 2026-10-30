import fs from 'fs';

const uiContent = fs.readFileSync('src/i18n/ui.ts', 'utf8');
const lines = uiContent.split('\n');
const keys = [];
for (const line of lines) {
  const m = line.match(/^\s*([a-zA-Z0-9_]+):\s*\{/);
  if (m) keys.push(m[1]);
}
console.log('Total keys in ui.ts:', keys.length);
console.log('Sample keys:', keys.slice(0, 40));
