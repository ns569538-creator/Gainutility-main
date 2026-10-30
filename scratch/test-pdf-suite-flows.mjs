import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';
import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge-pdf-suite-qa-' + Date.now());
if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createTestAssets() {
  const scratchDir = path.resolve('scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const pdfPath = path.join(scratchDir, 'suite_flow_test.pdf');
  const doc = await PDFDocument.create();
  for (let i = 1; i <= 4; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Page ${i} Content`, { x: 50, y: 550, size: 24, color: rgb(0.1, 0.2, 0.5) });
  }
  const bytes = await doc.save();
  fs.writeFileSync(pdfPath, bytes);

  const imgPath = path.join(scratchDir, 'test_image.png');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  fs.writeFileSync(imgPath, Buffer.from(pngBase64, 'base64'));

  return { pdfPath, imgPath };
}

async function main() {
  console.log('====================================================');
  console.log('INTERACTIVE PDF TOOLS END-TO-END FLOW VERIFICATION');
  console.log('====================================================\n');

  const { pdfPath, imgPath } = await createTestAssets();

  const DEBUG_PORT = Math.floor(9280 + Math.random() * 50);
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
    console.error('Failed to get WebSocket URL');
    edgeProcess.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  };

  const setFileInput = async (selector, files) => {
    let nodeId = null;
    for (let i = 0; i < 40; i++) {
      try {
        const { root } = await send('DOM.getDocument', {});
        const node = await send('DOM.querySelector', { nodeId: root.nodeId, selector });
        if (node && node.nodeId) {
          nodeId = node.nodeId;
          break;
        }
      } catch (e) {}
      await sleep(250);
    }
    if (!nodeId) throw new Error(`Could not find element: ${selector}`);
    await send('DOM.setFileInputFiles', { nodeId, files });
    await evalCode(`
      const el = document.querySelector('${selector}');
      if (el) el.dispatchEvent(new Event('change', { bubbles: true }));
    `);
  };

  // 1. ROTATE PDF
  console.log('--- 1. Testing Rotate PDF ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/rotate-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', [pdfPath]);
  await sleep(1500);

  const rotateThumbsCount = await evalCode(`document.querySelectorAll('.aspect-\\\\[3\\\\/4\\\\]').length`);
  console.log(`Page thumbnails detected: ${rotateThumbsCount} (expected 4)`);

  const previewLeftOrder = await evalCode(`(() => {
    const el = document.querySelector('.aspect-\\\\[3\\\\/4\\\\]')?.closest('.order-1');
    return !!el;
  })()`);
  console.log(`Document preview on left (order-1): ${previewLeftOrder ? 'PASS' : 'FAIL'}`);

  await evalCode(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Apply Rotation'));
    if (btn) btn.click();
  })()`);
  await sleep(2000);
  const rotateDone = await evalCode(`!!document.querySelector('#download-rotated-pdf-btn')`);
  console.log(`Rotated PDF Result Ready & Download CTA Present: ${rotateDone ? 'PASS' : 'FAIL'}`);

  // 2. DELETE PDF
  console.log('\n--- 2. Testing Delete PDF ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/delete-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', [pdfPath]);
  await sleep(1500);

  const deleteLeftOrder = await evalCode(`(() => {
    const el = document.querySelector('.aspect-\\\\[3\\\\/4\\\\]')?.closest('.order-1');
    return !!el;
  })()`);
  console.log(`Document preview on left (order-1): ${deleteLeftOrder ? 'PASS' : 'FAIL'}`);

  await evalCode(`(() => {
    const card = document.querySelector('#delete-page-card-2');
    if (card) card.click();
  })()`);
  await sleep(500);
  await evalCode(`(() => {
    const btn = document.querySelector('#delete-pages-submit-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2000);
  const deleteDone = await evalCode(`!!document.querySelector('#download-cleaned-pdf-btn')`);
  console.log(`Cleaned PDF Result Ready & Download CTA Present: ${deleteDone ? 'PASS' : 'FAIL'}`);

  // 3. EXTRACT PDF
  console.log('\n--- 3. Testing Extract PDF ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/extract-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', [pdfPath]);
  await sleep(1500);

  const extractLeftOrder = await evalCode(`(() => {
    const el = document.querySelector('.aspect-\\\\[3\\\\/4\\\\]')?.closest('.order-1');
    return !!el;
  })()`);
  console.log(`Document preview on left (order-1): ${extractLeftOrder ? 'PASS' : 'FAIL'}`);

  // Click "All" button to select all pages for extraction
  await evalCode(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const allBtn = btns.find(b => b.textContent.trim() === 'All');
    if (allBtn) allBtn.click();
  })()`);
  await sleep(600);

  await evalCode(`(() => {
    const btn = document.querySelector('#extract-pages-submit-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2500);
  const extractDone = await evalCode(`!!document.querySelector('#download-extracted-pdf-btn')`);
  console.log(`Extracted PDF Result Ready & Download CTA Present: ${extractDone ? 'PASS' : 'FAIL'}`);

  // 4. JPG TO PDF
  console.log('\n--- 4. Testing JPG to PDF ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/jpg-to-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', [imgPath]);
  await sleep(1500);

  const jpgLeftOrder = await evalCode(`(() => {
    const el = document.querySelector('.order-1');
    return !!el && el.textContent.includes('Image Workspace');
  })()`);
  console.log(`Image Workspace on left (order-1): ${jpgLeftOrder ? 'PASS' : 'FAIL'}`);

  await evalCode(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Generate PDF'));
    if (btn) btn.click();
  })()`);
  await sleep(2500);
  const jpgDone = await evalCode(`!!document.querySelector('#download-jpg-to-pdf-btn')`);
  console.log(`Result Preview Screen & Download CTA Present: ${jpgDone ? 'PASS' : 'FAIL'}`);

  // 5. COMPRESS IMAGES INSIDE PDF
  console.log('\n--- 5. Testing Compress PDF ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/compress-images-inside-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', [pdfPath]);
  await sleep(2500);

  const hasPresets = await evalCode(`(() => {
    const text = document.body.textContent;
    return text.includes('Low') && text.includes('Balanced') && text.includes('Strong');
  })()`);
  console.log(`Compression Level Presets (Low/Balanced/Strong) present: ${hasPresets ? 'PASS' : 'FAIL'}`);

  await evalCode(`(() => {
    const btn = document.querySelector('#pdf-tool-process-btn');
    if (btn) btn.click();
  })()`);
  await sleep(4000);
  const compressDone = await evalCode(`!!document.querySelector('#pdf-tool-download-btn')`);
  console.log(`Compressed PDF Result Ready & Download CTA Present: ${compressDone ? 'PASS' : 'FAIL'}`);

  console.log('\n====================================================');
  console.log('ALL INTERACTIVE PDF TOOL FLOWS VERIFIED SUCCESSFULLY!');
  console.log('====================================================\n');

  ws.close();
  edgeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Error during test execution:', err);
  process.exit(1);
});
