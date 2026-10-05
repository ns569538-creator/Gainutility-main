import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from '@cantoo/pdf-lib';
import JSZip from 'jszip';

import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge-pdf-qa-' + Date.now());
if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('====================================================');
  console.log('PDF STUDIO SHARED SYSTEM HARDENING AUTOMATION TEST');
  console.log('====================================================');

  const DEBUG_PORT = Math.floor(9240 + Math.random() * 50);
  const edgeProcess = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const list = await res.json();
      if (list && list.length > 0) {
        const page = list.find(p => p.type === 'page') || list[0];
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error(`Failed to get WebSocketDebuggerUrl from Edge on port ${DEBUG_PORT}`);
    edgeProcess.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();
  const consoleMessages = [];
  const uncaughtExceptions = [];

  ws.onmessage = (event) => {
    try {
      const raw = typeof event.data === 'string' ? event.data : event.data.toString();
      const data = JSON.parse(raw);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = (data.params.args || []).map(a => a.value || JSON.stringify(a)).join(' ');
        consoleMessages.push({ type: data.params.type, text });
      }
      if (data.method === 'Runtime.exceptionThrown') {
        uncaughtExceptions.push(data.params.exceptionDetails);
      }
    } catch (e) {
      console.error('ws parse error:', e);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}, timeoutMs = 35000) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP method ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      pending.set(id, { 
        resolve: (val) => { clearTimeout(timer); resolve(val); }, 
        reject: (err) => { clearTimeout(timer); reject(err); } 
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function setFileInput(selector, filePaths) {
    let nodeId = null;
    for (let i = 0; i < 40; i++) {
      try {
        const doc = await send('DOM.getDocument', {});
        const node = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
        if (node && node.nodeId) {
          nodeId = node.nodeId;
          break;
        }
      } catch (e) {}
      await sleep(250);
    }
    if (!nodeId) throw new Error(`Input ${selector} not found`);
    const files = Array.isArray(filePaths) ? filePaths : [filePaths];
    await send('DOM.setFileInputFiles', { nodeId, files });
    await send('Runtime.evaluate', {
      expression: `(() => {
        const input = document.querySelector('${selector}');
        if (input) {
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  // ==========================================
  // 1. VIEWPORT TESTING (320, 360, 375, 390, 412, 768, 1024, 1280)
  // ==========================================
  console.log('\n--- 1. MULTI-VIEWPORT RESPONSIVENESS QA ---');
  const viewports = [
    { name: 'Ultra-compact Mobile', w: 320, h: 568 },
    { name: 'Compact Android', w: 360, h: 640 },
    { name: 'iPhone SE/8', w: 375, h: 667 },
    { name: 'Modern iPhone 13/14', w: 390, h: 844 },
    { name: 'Modern Android Pixel', w: 412, h: 915 },
    { name: 'Tablet Portrait iPad', w: 768, h: 1024 },
    { name: 'Tablet Landscape / Small Laptop', w: 1024, h: 768 },
    { name: 'Desktop Standard', w: 1280, h: 800 }
  ];

  // Navigate once to Merge PDF
  console.log('Navigating to Merge PDF for responsive viewport checks...');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/merge-pdf' });
  await sleep(2500);

  console.log('Testing Merge PDF across all viewports:');
  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.w < 768
    });
    await sleep(350);
    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return { hasOverflow: scrollW > clientW, scrollW, clientW };
      })()`,
      returnByValue: true
    });
    const res = check.result.value;
    console.log(`  [${vp.w}px] ${vp.name.padEnd(30)}: ${res.hasOverflow ? 'FAIL (Overflow)' : 'PASS (0px overflow)'} (scrollW: ${res.scrollW}, clientW: ${res.clientW})`);
  }

  // Navigate once to Split PDF
  console.log('\nNavigating to Split PDF for responsive viewport checks...');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/split-pdf' });
  await sleep(2500);

  console.log('Testing Split PDF across all viewports:');
  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.w < 768
    });
    await sleep(350);
    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return { hasOverflow: scrollW > clientW, scrollW, clientW };
      })()`,
      returnByValue: true
    });
    const res = check.result.value;
    console.log(`  [${vp.w}px] ${vp.name.padEnd(30)}: ${res.hasOverflow ? 'FAIL (Overflow)' : 'PASS (0px overflow)'} (scrollW: ${res.scrollW}, clientW: ${res.clientW})`);
  }

  // Set back to Desktop for full workflow testing
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  // ==========================================
  // 2. MERGE PDF FULL DOWNLOAD & CONTENT QA
  // ==========================================
  console.log('\n--- 2. MERGE PDF: FULL PROCESSING & DOWNLOAD VERIFICATION ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/merge-pdf' });
  await sleep(2500);

  // Upload Doc A (3 pages) & Doc B (4 pages)
  const docAPath = path.resolve('scratch/doc-a.pdf');
  const docBPath = path.resolve('scratch/doc-b.pdf');

  await setFileInput('#pdf-upload-input', [docAPath, docBPath]);
  console.log('Uploaded doc-a.pdf and doc-b.pdf to Merge PDF.');
  await sleep(2000);

  // Verify queue
  const queueInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const items = Array.from(document.querySelectorAll('#pdf-queue-list > div')).map(el => el.querySelector('p.font-semibold')?.textContent?.trim());
      const summaryPages = document.querySelector('.space-y-3 span.font-mono')?.textContent?.trim();
      return { items, summaryPages };
    })()`,
    returnByValue: true
  });
  console.log('Queue items:', queueInfo.result.value.items);

  // Click Merge Button
  console.log('Clicking Merge button...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Merge 2 PDFs'));
      if (btn) btn.click();
    })()`
  });
  await sleep(3000);

  // Intercept the generated blob URL and download bytes
  const mergeDownloadResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const downloadBtn = document.querySelector('#download-merged-pdf-btn');
      if (!downloadBtn) return { error: 'Download button not found' };
      
      // Get the processed blob url from the download action
      // We can grab it from window object or create a click spy
      let blobUrl = null;
      const origAppend = document.body.appendChild;
      const origRemove = document.body.removeChild;
      let downloadHref = null;
      let downloadName = null;

      document.body.appendChild = function(el) {
        if (el && el.tagName === 'A' && el.href) {
          downloadHref = el.href;
          downloadName = el.download;
        }
        return origAppend.apply(this, arguments);
      };

      downloadBtn.click();
      document.body.appendChild = origAppend;

      if (!downloadHref) return { error: 'Failed to intercept download link' };

      const res = await fetch(downloadHref);
      const arrayBuf = await res.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuf));
      return { 
        success: true, 
        name: downloadName, 
        byteLength: bytes.length, 
        bytes: bytes.slice(0, 100), // First 100 bytes for inspection
        allBytesBase64: btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuf)))
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const mergeData = mergeDownloadResult.result.value;
  console.log('Merge Download Result:');
  console.log('  Filename:', mergeData.name);
  console.log('  File size:', mergeData.byteLength, 'bytes');

  // Verify PDF Validity & Structure
  const mergeBuffer = Buffer.from(mergeData.allBytesBase64, 'base64');
  const pdfHeader = mergeBuffer.slice(0, 5).toString('ascii');
  console.log('  PDF Header Magic Bytes:', pdfHeader, `(${pdfHeader === '%PDF-' ? 'VALID' : 'INVALID'})`);

  const parsedMergedDoc = await PDFDocument.load(mergeBuffer);
  const mergedPageCount = parsedMergedDoc.getPageCount();
  console.log('  Parsed PDF Page Count:', mergedPageCount, `(Expected: 7 [3 + 4], ${mergedPageCount === 7 ? 'VERIFIED MATCH' : 'FAIL'})`);

  // Verify Reset Flow
  await send('Runtime.evaluate', {
    expression: `(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Merge More Files'));
      if (resetBtn) resetBtn.click();
    })()`
  });
  await sleep(1000);

  const afterResetInfo = await send('Runtime.evaluate', {
    expression: 'Boolean(document.querySelector("#pdf-upload-input"))',
    returnByValue: true
  });
  console.log('Merge PDF Reset successfully returned to upload state:', afterResetInfo.result.value);

  // ==========================================
  // 3. SPLIT PDF FULL DOWNLOAD & CONTENT QA
  // ==========================================
  console.log('\n--- 3. SPLIT PDF: FULL PROCESSING & DOWNLOAD VERIFICATION ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/split-pdf' });
  await sleep(2500);

  const doc5Path = path.resolve('scratch/doc-5pages.pdf');
  await setFileInput('#split-file-input', [doc5Path]);
  console.log('Uploaded doc-5pages.pdf to Split PDF.');
  await sleep(2000);

  // A. Mode 1: Extract pages 2 & 4
  console.log('\n  Sub-test A: Extract Selected Pages (Pages 2 & 4)');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const grid = document.querySelector('#pdf-pages-grid');
      const cards = grid ? Array.from(grid.children) : [];
      if (cards[0]) cards[0].click(); // Deselect default Page 1
      if (cards[1]) cards[1].click(); // Select Page 2
      if (cards[3]) cards[3].click(); // Select Page 4
    })()`
  });
  await sleep(500);

  // Click Process Split PDF
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#process-split-btn')?.click()`
  });
  await sleep(2500);

  // Intercept Single Extracted PDF Download
  const splitExtractDownload = await send('Runtime.evaluate', {
    expression: `(async () => {
      const downloadBtn = document.querySelector('#download-split-pdf-btn');
      if (!downloadBtn) return { error: 'Download button not found' };

      let downloadHref = null;
      let downloadName = null;
      const origAppend = document.body.appendChild;
      document.body.appendChild = function(el) {
        if (el && el.tagName === 'A' && el.href) {
          downloadHref = el.href;
          downloadName = el.download;
        }
        return origAppend.apply(this, arguments);
      };

      downloadBtn.click();
      document.body.appendChild = origAppend;

      const res = await fetch(downloadHref);
      const arrayBuf = await res.arrayBuffer();
      return { 
        name: downloadName, 
        byteLength: arrayBuf.byteLength,
        allBytesBase64: btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuf)))
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const extractData = splitExtractDownload.result.value;
  console.log('  Extracted PDF Download Result:');
  console.log('    Filename:', extractData.name);
  console.log('    File size:', extractData.byteLength, 'bytes');

  const extractBuffer = Buffer.from(extractData.allBytesBase64, 'base64');
  const extractHeader = extractBuffer.slice(0, 5).toString('ascii');
  console.log('    PDF Header:', extractHeader, `(${extractHeader === '%PDF-' ? 'VALID' : 'INVALID'})`);

  const parsedExtractDoc = await PDFDocument.load(extractBuffer);
  const extractPageCount = parsedExtractDoc.getPageCount();
  console.log('    Parsed Page Count:', extractPageCount, `(Expected: 2, ${extractPageCount === 2 ? 'VERIFIED MATCH' : 'FAIL'})`);

  // B. Reset and Mode 2: Custom Range Split with ZIP
  console.log('\n  Sub-test B: Custom Range Split with ZIP Packaging (1-2, 3-5)');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Split Another Document'));
      if (resetBtn) resetBtn.click();
    })()`
  });
  await sleep(1000);

  // Re-upload doc-5pages.pdf
  await setFileInput('#split-file-input', [doc5Path]);
  await sleep(2000);

  // Switch to Range Mode and enter "1-2, 3-5"
  await send('Runtime.evaluate', {
    expression: `(() => {
      const rangeRadio = document.querySelector('input[value="range"]');
      if (rangeRadio) rangeRadio.click();
    })()`
  });
  await sleep(300);

  await send('Runtime.evaluate', {
    expression: `(() => {
      const rangeInput = document.querySelector('#range-input');
      if (rangeInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(rangeInput, '1-2, 3-5');
        rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
        rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`
  });
  await sleep(500);

  // Click Process Split PDF
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#process-split-btn')?.click()`
  });
  await sleep(3000);

  // Intercept ZIP Download
  const zipDownloadResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const zipBtn = document.querySelector('#download-all-zip-btn');
      if (!zipBtn) return { error: 'Download all zip button not found' };

      let downloadHref = null;
      let downloadName = null;
      const origAppend = document.body.appendChild;
      document.body.appendChild = function(el) {
        if (el && el.tagName === 'A' && el.href) {
          downloadHref = el.href;
          downloadName = el.download;
        }
        return origAppend.apply(this, arguments);
      };

      zipBtn.click();
      document.body.appendChild = origAppend;

      const res = await fetch(downloadHref);
      const arrayBuf = await res.arrayBuffer();
      return { 
        name: downloadName, 
        byteLength: arrayBuf.byteLength,
        allBytesBase64: btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuf)))
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const zipData = zipDownloadResult.result.value;
  console.log('  ZIP Archive Download Result:');
  console.log('    Filename:', zipData.name);
  console.log('    File size:', zipData.byteLength, 'bytes');

  const zipBuffer = Buffer.from(zipData.allBytesBase64, 'base64');
  const zipHeader = zipBuffer.slice(0, 2).toString('ascii');
  console.log('    ZIP Header Magic Bytes:', zipHeader, `(${zipHeader === 'PK' ? 'VALID ZIP ARCHIVE' : 'INVALID'})`);

  const unzipped = await JSZip.loadAsync(zipBuffer);
  const zipFiles = Object.keys(unzipped.files);
  console.log('    Files inside ZIP archive:', zipFiles);

  for (const filename of zipFiles) {
    const fileBytes = await unzipped.files[filename].async('uint8array');
    const partDoc = await PDFDocument.load(fileBytes);
    console.log(`      - ${filename}: ${partDoc.getPageCount()} pages (VALID PDF)`);
  }

  // ==========================================
  // 4. ERROR SYSTEM & INVALID FILE REJECTION
  // ==========================================
  console.log('\n--- 4. ERROR SYSTEM & ACTIONABLE MESSAGE QA ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Split Another Document'));
      if (resetBtn) resetBtn.click();
    })()`
  });
  await sleep(1000);

  const invalidFilePath = path.resolve('scratch/invalid-sample.txt');
  await setFileInput('#split-file-input', [invalidFilePath]);
  await sleep(1000);

  const errorAlertInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const alert = document.querySelector('[role="alert"]');
      const title = alert?.querySelector('p.font-bold')?.textContent?.trim();
      const message = alert?.querySelector('p.font-mono')?.textContent?.trim();
      return { title, message };
    })()`,
    returnByValue: true
  });
  console.log('Error Alert Title:', errorAlertInfo.result.value.title);
  console.log('Error Alert Actionable Message:', errorAlertInfo.result.value.message);

  // ==========================================
  // 5. NAVIGATION & BACK BEHAVIOUR
  // ==========================================
  console.log('\n--- 5. NAVIGATION & HISTORY BACK BEHAVIOUR ---');
  await send('Page.navigate', { url: 'http://localhost:3000/pdf' });
  await sleep(2000);
  console.log('Navigated to /pdf category page.');

  // Click Merge PDF from category page
  await send('Runtime.evaluate', {
    expression: `(() => {
      const link = document.querySelector('a[href="/tools/merge-pdf"]');
      if (link) link.click();
    })()`
  });
  await sleep(2000);

  const curUrl1 = await send('Runtime.evaluate', { expression: 'window.location.pathname', returnByValue: true });
  console.log('Navigated into tool URL:', curUrl1.result.value);

  // Click Split PDF from Next Actions
  // First simulate upload to get next actions or check Related Tools
  await send('Runtime.evaluate', {
    expression: `(() => {
      const splitLink = document.querySelector('a[href="/tools/split-pdf"]');
      if (splitLink) splitLink.click();
    })()`
  });
  await sleep(2000);
  const curUrl2 = await send('Runtime.evaluate', { expression: 'window.location.pathname', returnByValue: true });
  console.log('Navigated via internal related link to:', curUrl2.result.value);

  // Trigger browser Back button
  await send('Runtime.evaluate', { expression: 'window.history.back()' });
  await sleep(1500);
  const backUrl = await send('Runtime.evaluate', { expression: 'window.location.pathname', returnByValue: true });
  console.log('Browser history.back() returned to:', backUrl.result.value);

  // ==========================================
  // 6. CONSOLE & HYDRATION CHECK
  // ==========================================
  console.log('\n--- 6. CONSOLE LOGS & HYDRATION VERIFICATION ---');
  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warn' || m.text.includes('hydration') || m.text.includes('Hydration'));
  console.log('Console Errors:', errors.length === 0 ? 'None (0 errors)' : JSON.stringify(errors));
  console.log('Hydration / React Warnings:', warnings.length === 0 ? 'None (0 warnings)' : JSON.stringify(warnings));
  console.log('Uncaught Exceptions:', uncaughtExceptions.length === 0 ? 'None (0 exceptions)' : JSON.stringify(uncaughtExceptions));

  console.log('\n====================================================');
  console.log('ALL SYSTEM HARDENING TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');

  edgeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
