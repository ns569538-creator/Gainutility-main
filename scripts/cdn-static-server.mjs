import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] ?? ".";
const port = Number(process.env.PORT || 8788);
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".webmanifest":"application/manifest+json", ".txt":"text/plain", ".woff2":"font/woff2" };

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    let file = normalize(join(root, urlPath));
    if (!file.startsWith(normalize(root))) { res.writeHead(403); res.end("forbidden"); return; }
    let content;
    try {
      // If path resolves to a directory, serve its index.html
      try {
        const st = await stat(file);
        if (st.isDirectory()) file = normalize(join(file, "index.html"));
      } catch {}
      content = await readFile(file);
    } catch {
      // SPA fallback: serve index.html for unknown routes (simulates Cloudflare Pages SPA behavior)
      const idx = normalize(join(root, "index.html"));
      content = await readFile(idx);
    }
    const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(content);
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
