import fs from 'fs';

const pages = [
  'dist/client/tools/stylish-name-generator.html',
  'dist/client/fr/tools/generateur-de-noms-styles.html',
  'dist/client/pt-br/tools/gerador-de-nomes-estilosos.html',
  'dist/client/id/tools/generator-nama-keren.html',
  'dist/client/de/tools/stylischer-namen-generator.html',
  'dist/client/tools/youtube-title-analyzer.html',
  'dist/client/tools/youtube-thumbnail-preview.html',
  'dist/client/tools/background-remover.html',
  'dist/client/tools/rotate-pdf.html',
  'dist/client/tools/pdf-difference-checker.html',
  'dist/client/tools/font-detector.html',
  'dist/client/fr/tools/detecteur-de-polices.html',
  'dist/client/pt-br/tools/juntar-pdf.html'
];

for (const p of pages) {
  if (fs.existsSync(p)) {
    const html = fs.readFileSync(p, 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    const desc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/) || [])[1];
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim();
    const faqs = [...html.matchAll(/<details/g)].length;
    const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["']/g)].length;
    console.log('===', p, '===');
    console.log('Title:', title);
    console.log('Desc:', desc?.substring(0, 85) + '...');
    console.log('H1:', h1);
    console.log('FAQ count:', faqs, '| JSON-LD count:', jsonLd);
    console.log('English leaks?:', html.includes('Pick a mode — Stylish'));
  } else {
    console.log('MISSING:', p);
  }
}
