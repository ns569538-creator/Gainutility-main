import fs from 'fs';

const pages = [
  'out/world-hindu-temples/usa.html',
  'out/richest-temples-in-india.html',
  'out/mysterious-temples-in-india.html'
];

pages.forEach(p => {
  const full = 'C:/Users/nav/Downloads/testing/sacred-places-india/' + p;
  if (!fs.existsSync(full)) {
    console.error('Missing:', full);
    return;
  }
  const html = fs.readFileSync(full, 'utf8');
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const canonMatch = html.match(/<link rel="canonical" href="([^"]+)"/);

  console.log('=== ' + p + ' ===');
  console.log('Title:    ', titleMatch ? titleMatch[1] : 'N/A');
  console.log('Desc:     ', descMatch ? descMatch[1] : 'N/A');
  console.log('H1:       ', h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'N/A');
  console.log('Canonical:', canonMatch ? canonMatch[1] : 'N/A');
  console.log('');
});
