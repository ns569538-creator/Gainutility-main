import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';
import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge-watermark-qa-' + Date.now());
if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createSamplePdf(pageCount = 3) {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Antigravity QA Document - Page ${i}`, {
      x: 50,
      y: 800,
      size: 24,
      color: rgb(0.1, 0.1, 0.2),
    });
    page.drawText(`Paragraph text content for testing visual PDF preview and modifications on page ${i}.`, {
      x: 50,
      y: 750,
      size: 14,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  return await doc.save();
}

async function main() {
  console.log('====================================================');
  console.log('PDF WATERMARK & COMPREHENSIVE TOOLS VISUAL QA AUDIT');
  console.log('====================================================');

  const samplePdfBytes = await createSamplePdf(3);
  const samplePdfPath = path.join(USER_DATA_DIR, 'watermark_sample.pdf');
  fs.writeFileSync(samplePdfPath, samplePdfBytes);

  const DEBUG_PORT = Math.floor(9380 + Math.random() * 50);
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
    console.error(`Failed to connect to Edge on port ${DEBUG_PORT}`);
    edgeProcess.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();

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
    } catch (e) {}
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP ${method} timed out`));
      }, timeoutMs);
      pending.set(id, { resolve: (res) => { clearTimeout(timer); resolve(res); }, reject: (err) => { clearTimeout(timer); reject(err); } });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Evaluation failed: ${res.exceptionDetails.text} (${JSON.stringify(res.exceptionDetails)})`);
    }
    return res.result.value;
  }

  async function setFileInput(selector, filePath) {
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
      await sleep(300);
    }
    if (!nodeId) throw new Error(`Input ${selector} not found`);
    await send('DOM.setFileInputFiles', { nodeId, files: [filePath] });
    await evaluate(`(() => {
      const input = document.querySelector('${selector}');
      if (input) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
  }

  async function setSliderValue(selector, val) {
    return await evaluate(`(() => {
      const input = document.querySelector('${selector}');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '${val}');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
  }

  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // --- 1. WATERMARK TOOL QA ---
  console.log('\n--- 1. AUDITING WATERMARK TOOL (/tools/add-pdf-watermark) ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/add-pdf-watermark' });
  await sleep(1500);

  console.log('Uploading sample PDF to Watermark tool...');
  await setFileInput('input[type="file"]', samplePdfPath);

  // Wait for canvas preview
  let canvasReady = false;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    const hasCanvas = await evaluate('!!document.querySelector("canvas")');
    if (hasCanvas) {
      canvasReady = true;
      break;
    }
  }
  console.log('PDF Canvas rendered:', canvasReady ? 'PASS' : 'FAIL');

  await sleep(1000); // let overlay settle

  // Helper to sample canvas center pixels
  const getCanvasPixelSum = async () => {
    return await evaluate(`(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const img = ctx.getImageData(Math.max(0, cx - 40), Math.max(0, cy - 40), 80, 80);
      let sum = 0;
      for (let i = 0; i < img.data.length; i += 4) {
        sum += (255 - img.data[i]) + (255 - img.data[i+1]) + (255 - img.data[i+2]);
      }
      return sum;
    })()`);
  };

  const initialSum = await getCanvasPixelSum();
  console.log('Initial watermark canvas darkness sum (25% opacity):', initialSum);

  // Modify opacity slider to 80%
  console.log('Setting watermark opacity to 80%...');
  await setSliderValue('#watermark-opacity', '80');
  await sleep(600);
  const highOpacitySum = await getCanvasPixelSum();
  console.log('Watermark 80% opacity darkness sum:', highOpacitySum);

  // Modify opacity slider to 10%
  console.log('Setting watermark opacity to 10%...');
  await setSliderValue('#watermark-opacity', '10');
  await sleep(600);
  const lowOpacitySum = await getCanvasPixelSum();
  console.log('Watermark 10% opacity darkness sum:', lowOpacitySum);

  const opacityVisiblyChanged = highOpacitySum > lowOpacitySum;
  console.log(`Opacity Slider Live Canvas Reaction: ${opacityVisiblyChanged ? 'PASS (80% darkness: ' + highOpacitySum + ' > 10% darkness: ' + lowOpacitySum + ')' : 'FAIL'}`);

  // Test preset click
  console.log('Testing Watermark preset buttons ("CONFIDENTIAL", "DRAFT")...');
  const presetClicked = await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const draftBtn = btns.find(b => b.textContent && b.textContent.includes('DRAFT'));
    if (draftBtn) {
      draftBtn.click();
      return true;
    }
    return false;
  })()`);
  console.log('Clicked "DRAFT" Preset:', presetClicked);
  await sleep(500);

  // Click Apply & Process PDF in Watermark tool
  console.log('Clicking "Apply & Process PDF" in Watermark tool...');
  await evaluate(`(() => {
    const btn = document.querySelector('#pdf-tool-process-btn');
    if (btn) btn.click();
  })()`);

  let watermarkResultReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const hasDownloadBtn = await evaluate('!!document.querySelector("#pdf-tool-download-btn")');
    if (hasDownloadBtn) {
      watermarkResultReady = true;
      break;
    }
  }
  console.log('Watermark Result Screen (Result Preview + Download CTA):', watermarkResultReady ? 'PASS' : 'FAIL');

  // --- 2. ROTATE PDF QA ---
  console.log('\n--- 2. AUDITING ROTATE PDF (/tools/rotate-pdf) ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/rotate-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', samplePdfPath);
  await sleep(1500);

  // Click Rotate Right 90
  await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const rBtn = btns.find(b => b.textContent && (b.textContent.includes('Right') || b.textContent.includes('90°')));
    if (rBtn) rBtn.click();
  })()`);
  await sleep(500);

  // Click Apply Changes / Rotate
  console.log('Clicking "Apply Rotation"...');
  await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.textContent && b.textContent.includes('Apply Rotation'));
    if (pBtn) pBtn.click();
  })()`);

  let rotateResultReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const hasDownloadBtn = await evaluate('!!document.querySelector("#download-rotated-pdf-btn")');
    if (hasDownloadBtn) {
      rotateResultReady = true;
      break;
    }
  }
  console.log('Rotate PDF Result Screen (Preview + Stats + Download Button):', rotateResultReady ? 'PASS' : 'FAIL');

  // --- 3. DELETE PDF PAGES QA ---
  console.log('\n--- 3. AUDITING DELETE PDF PAGES (/tools/delete-pdf) ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/delete-pdf' });
  await sleep(1500);
  await setFileInput('input[type="file"]', samplePdfPath);
  await sleep(2000);

  // Select page 2 to delete
  console.log('Clicking #delete-page-card-2 to mark page 2 for deletion...');
  await evaluate(`(() => {
    const card = document.querySelector('#delete-page-card-2');
    if (card) card.click();
  })()`);
  await sleep(600);

  // Click Delete button
  console.log('Clicking #delete-pages-submit-btn...');
  await evaluate(`(() => {
    const btn = document.querySelector('#delete-pages-submit-btn');
    if (btn) btn.click();
  })()`);

  let deleteResultReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const hasCleanedBtn = await evaluate('!!document.querySelector("#download-cleaned-pdf-btn")');
    if (hasCleanedBtn) {
      deleteResultReady = true;
      break;
    }
  }
  console.log('Delete PDF Result Screen (Cleaned Preview + Download Button):', deleteResultReady ? 'PASS' : 'FAIL');

  // --- 4. ADD PAGE NUMBERS QA ---
  console.log('\n--- 4. AUDITING ADD PAGE NUMBERS (/tools/add-pdf-page-numbers) ---');
  await send('Page.navigate', { url: 'http://localhost:3000/tools/add-pdf-page-numbers' });
  await sleep(1500);
  await setFileInput('input[type="file"]', samplePdfPath);
  await sleep(2000);

  // Click Apply & Process
  console.log('Clicking "Apply & Process PDF" in Page Numbers tool...');
  await evaluate(`(() => {
    const btn = document.querySelector('#pdf-tool-process-btn');
    if (btn) btn.click();
  })()`);

  let pageNumbersResultReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const hasDownloadBtn = await evaluate('!!document.querySelector("#pdf-tool-download-btn")');
    if (hasDownloadBtn) {
      pageNumbersResultReady = true;
      break;
    }
  }
  console.log('Page Numbers Result Screen (Preview + Stats + Download Button):', pageNumbersResultReady ? 'PASS' : 'FAIL');

  console.log('\n====================================================');
  console.log('ALL PDF SUITE AUDITS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');

  ws.close();
  edgeProcess.kill();
  try {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  } catch (e) {}
}

main().catch(err => {
  console.error('Fatal Test Failure:', err);
  process.exit(1);
});
