import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const distDir = path.resolve('dist/client');
const PORT = 4567;

// Lightweight static file server for dist/client (Windows safe)
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = 'index.html';
  else {
    reqPath = reqPath.replace(/^\/+/, '');
    if (!reqPath.includes('.')) reqPath += '.html';
  }

  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + reqPath);
  }
});

server.listen(PORT, async () => {
  console.log(`Static server running at http://localhost:${PORT}`);

  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const DEBUG_PORT = 9333;
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    'about:blank'
  ]);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  let ws = null;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const pageTarget = list.find(t => t.type === 'page');
      if (pageTarget) {
        ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        break;
      }
    } catch (e) {}
  }

  if (!ws) {
    console.error('Failed to connect to Edge');
    edge.kill();
    server.close();
    process.exit(1);
  }

  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const cur = id++;
      const handler = e => {
        const d = JSON.parse(e.data);
        if (d.id === cur) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });
  }

  await send('Page.enable');
  await send('Page.navigate', { url: `http://localhost:${PORT}/blog` });
  await sleep(1500);

  const viewports = [
    { name: 'Ultra-compact Mobile', w: 320, h: 568 },
    { name: 'iPhone SE/8', w: 375, h: 667 },
    { name: 'Modern iPhone 13/14', w: 390, h: 844 },
    { name: 'iPhone Plus/Max', w: 414, h: 896 },
    { name: 'Tablet Portrait iPad', w: 768, h: 1024 },
    { name: 'Tablet Landscape / Laptop', w: 1024, h: 768 },
    { name: 'Desktop Standard', w: 1280, h: 800 },
    { name: 'Wide Desktop', w: 1440, h: 900 }
  ];

  console.log('\n--- TESTING REDESIGNED BLOG RESPONSIVENESS ACROSS VIEWPORTS ---');
  let overflowFails = 0;

  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: false // Emulate exact browser window width
    });
    await sleep(250);

    const evalResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return {
          scrollW,
          clientW,
          hasOverflow: scrollW > clientW
        };
      })()`,
      returnByValue: true
    });

    const res = evalResult.result.value;
    const status = res.hasOverflow ? `FAIL (Overflow +${res.scrollW - res.clientW}px)` : 'PASS (0px overflow)';
    if (res.hasOverflow) overflowFails++;
    console.log(`  [${vp.w}px] ${vp.name.padEnd(28)}: ${status} (scrollW: ${res.scrollW}, clientW: ${res.clientW})`);
  }

  // Test interactive search and filter
  console.log('\n--- TESTING BLOG INTERACTIVE SEARCH & CATEGORY FILTERING ---');
  // Comprehensive interactive tests
  const interactiveTests = await send('Runtime.evaluate', {
    expression: `(async () => {
      const results = {};
      const searchInput = document.getElementById('blog-search-input');
      
      // 1. Initial State
      const initialCards = document.querySelectorAll('article').length;
      results.initialCardCount = initialCards;

      // 2. Type "watermark" into search input (using native value setter + dispatchEvent for React)
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(searchInput, 'watermark');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      const afterSearchCount = document.querySelectorAll('article').length;
      const searchMatchesWatermark = Array.from(document.querySelectorAll('article h2, article h3')).some(h => h.textContent.toLowerCase().includes('watermark'));
      results.search = {
        query: 'watermark',
        cardsRendered: afterSearchCount,
        hasWatermarkArticle: searchMatchesWatermark
      };

      // 3. Clear search input
      nativeInputValueSetter.call(searchInput, '');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      results.afterClearCount = document.querySelectorAll('article').length;

      // 4. Test Category Filter Buttons
      const pdfBtn = Array.from(document.querySelectorAll('nav[aria-label="Browse by topic"] button')).find(b => b.textContent.includes('PDF'));
      if (pdfBtn) {
        pdfBtn.click();
        await new Promise(r => setTimeout(r, 250));
        const pdfCards = document.querySelectorAll('article').length;
        const pdfBadgeText = document.querySelectorAll('nav[aria-label="Browse by topic"] button[aria-pressed="true"]')[0]?.textContent;
        results.pdfCategoryFilter = {
          clicked: true,
          activeButtonText: pdfBadgeText,
          cardsRendered: pdfCards
        };
      }

      // 5. Reset back to "All" category
      const allBtn = Array.from(document.querySelectorAll('nav[aria-label="Browse by topic"] button')).find(b => b.textContent.includes('All'));
      if (allBtn) {
        allBtn.click();
        await new Promise(r => setTimeout(r, 250));
        results.allCategoryCards = document.querySelectorAll('article').length;
      }

      // 6. Test "Load More" pagination button
      const loadMoreBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Load More') || b.textContent.includes('Load more'));
      if (loadMoreBtn) {
        loadMoreBtn.click();
        await new Promise(r => setTimeout(r, 250));
        results.afterLoadMoreCards = document.querySelectorAll('article').length;
      }

      return results;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Interactive Features Verification:', JSON.stringify(interactiveTests.result.value, null, 2));

  edge.kill();
  server.close();
  console.log(`\nViewport QA complete. Total overflow failures: ${overflowFails}`);
  process.exit(overflowFails > 0 ? 1 : 0);
});
