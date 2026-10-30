import http from 'http';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/nav/Downloads/testing/sacred-places-india/out';
const port = 3456;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

function getRedirects() {
  const redirectsFile = path.join(outDir, '_redirects');
  const rules = [];
  if (fs.existsSync(redirectsFile)) {
    const lines = fs.readFileSync(redirectsFile, 'utf8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        rules.push({
          from: parts[0],
          to: parts[1],
          status: parseInt(parts[2] || '301', 10)
        });
      }
    }
  }
  return rules;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  const rules = getRedirects();
  for (const rule of rules) {
    if (rule.from.endsWith('/*')) {
      const base = rule.from.slice(0, -2);
      if (urlPath === base || urlPath.startsWith(base + '/')) {
        res.writeHead(rule.status, { Location: rule.to });
        res.end();
        return;
      }
    } else if (urlPath === rule.from) {
      res.writeHead(rule.status, { Location: rule.to });
      res.end();
      return;
    }
  }

  const cleanPath = urlPath.replace(/^\//, '');
  let filePath = path.join(outDir, cleanPath);

  if (urlPath === '/' || cleanPath === '') {
    filePath = path.join(outDir, 'index.html');
  } else {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
