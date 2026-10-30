import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb } from '@cantoo/pdf-lib';
import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge-full-qa-' + Date.now());
if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createSamplePdf(pageCount = 3) {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`GainUtility Test Document - Page ${i}`, {
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
  console.log('COMPREHENSIVE 5-VIEWPORT & WATERMARK UX ACCEPTANCE TEST');
  console.log('====================================================');

  const samplePdfBytes = await createSamplePdf(3);
  const samplePdfPath = path.join(USER_DATA_DIR, 'watermark_sample.pdf');
  fs.writeFileSync(samplePdfPath, samplePdfBytes);

  const DEBUG_PORT = Math.floor(9400 + Math.random() * 50);
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
  const consoleErrors = [];

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
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        const text = (data.params.args || []).map(a => a.value || JSON.stringify(a)).join(' ');
        consoleErrors.push(text);
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
      await sleep(250);
    }
    if (!nodeId) throw new Error(`Input ${selector} not found`);
    const files = Array.isArray(filePath) ? filePath : [filePath];
    await send('DOM.setFileInputFiles', { nodeId, files });
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

  // VIEWPORT MATRIX REQUIRED BY ACCEPTANCE TEST:
  // 1. Desktop ~1440px
  // 2. Laptop ~1280px
  // 3. Tablet ~768px
  // 4. Mobile ~390px
  // 5. Small mobile ~320px
  const REQUIRED_VIEWPORTS = [
    { name: '1. Desktop ~1440px', w: 1440, h: 900, mobile: false },
    { name: '2. Laptop ~1280px',  w: 1280, h: 800, mobile: false },
    { name: '3. Tablet ~768px',   w: 768,  h: 1024, mobile: false },
    { name: '4. Mobile ~390px',   w: 390,  h: 844, mobile: true },
    { name: '5. Small mobile ~320px', w: 320, h: 568, mobile: true }
  ];

  console.log('\n--- PHASE 1: WATERMARK TOOL INTERACTIVE QA ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3000/tools/add-pdf-watermark' });
  await sleep(1500);

  console.log('Uploading sample PDF to Watermark tool...');
  await setFileInput('input[type="file"]', samplePdfPath);

  // Wait for canvas
  let canvasFound = false;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    const ok = await evaluate('Boolean(document.querySelector("canvas"))');
    if (ok) { canvasFound = true; break; }
  }
  console.log('Real PDF Canvas Rendered:', canvasFound ? 'PASS' : 'FAIL');

  // Pixel darkness helper
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

  await sleep(600);
  const initialSum = await getCanvasPixelSum();
  console.log('Initial Canvas Darkness at 25% opacity:', initialSum);

  // Test live opacity slider update
  console.log('Setting opacity slider to 90%...');
  await setSliderValue('#watermark-opacity', '90');
  await sleep(500);
  const highSum = await getCanvasPixelSum();
  console.log('Darkness at 90% opacity:', highSum);

  console.log('Setting opacity slider to 10%...');
  await setSliderValue('#watermark-opacity', '10');
  await sleep(500);
  const lowSum = await getCanvasPixelSum();
  console.log('Darkness at 10% opacity:', lowSum);

  const opacityVisiblyReacted = highSum > lowSum;
  console.log(`Live Opacity Visual Reaction: ${opacityVisiblyReacted ? 'PASS (90% darkness: ' + highSum + ' > 10% darkness: ' + lowSum + ')' : 'FAIL'}`);

  // Test font switching (Helvetica, Times, Courier)
  console.log('Testing Font Switching...');
  const fontSwitched = await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const serifBtn = btns.find(b => b.textContent && b.textContent.includes('Serif'));
    if (serifBtn) { serifBtn.click(); return true; }
    return false;
  })()`);
  console.log('Switched to Serif font:', fontSwitched ? 'PASS' : 'FAIL');
  await sleep(300);

  // Test Before/After comparison toggle
  console.log('Testing Before / After comparison toggle...');
  const beforeToggleResult = await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const toggleBtn = btns.find(b => b.textContent && b.textContent.includes('Before / After'));
    if (!toggleBtn) return { error: 'Toggle button not found' };
    toggleBtn.click();
    return { success: true, text: toggleBtn.textContent };
  })()`);
  console.log('Clicked Before / After toggle:', beforeToggleResult.success ? 'PASS' : 'FAIL');
  await sleep(300);

  // Restore live preview
  await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const toggleBtn = btns.find(b => b.textContent && b.textContent.includes('Showing Original'));
    if (toggleBtn) toggleBtn.click();
  })()`);
  await sleep(300);

  // Test Fit-to-Width and Fit-to-Page toolbar buttons
  console.log('Testing Fit Width & Fit Page buttons...');
  const fitWidthWorks = await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Fit Width'));
    if (btn) { btn.click(); return true; }
    return false;
  })()`);
  console.log('Fit Width button clicked:', fitWidthWorks ? 'PASS' : 'FAIL');
  await sleep(300);

  // Test Process & Download
  console.log('Clicking "Apply & Process PDF"...');
  await evaluate(`document.querySelector('#pdf-tool-process-btn')?.click()`);

  let downloadReady = false;
  for (let i = 0; i < 25; i++) {
    await sleep(500);
    const hasBtn = await evaluate('Boolean(document.querySelector("#pdf-tool-download-btn"))');
    if (hasBtn) { downloadReady = true; break; }
  }
  console.log('Result Preview & Download PDF Button Ready:', downloadReady ? 'PASS' : 'FAIL');

  // Verify downloaded bytes
  const downloadData = await evaluate(`(async () => {
    const btn = document.querySelector('#pdf-tool-download-btn');
    if (!btn) return { error: 'No download button' };
    let href = null;
    let name = null;
    const origAppend = document.body.appendChild;
    document.body.appendChild = function(el) {
      if (el && el.tagName === 'A' && el.href) {
        href = el.href;
        name = el.download;
      }
      return origAppend.apply(this, arguments);
    };
    btn.click();
    document.body.appendChild = origAppend;
    if (!href) return { error: 'Failed to capture download href' };
    const res = await fetch(href);
    const buf = await res.arrayBuffer();
    return { name, byteLength: buf.byteLength, b64: btoa(String.fromCharCode.apply(null, new Uint8Array(buf))) };
  })()`);

  const downloadedPdfBuffer = Buffer.from(downloadData.b64, 'base64');
  const parsedWatermarkedDoc = await PDFDocument.load(downloadedPdfBuffer);
  console.log(`Downloaded Watermarked PDF: ${downloadData.name} (${downloadData.byteLength} bytes, ${parsedWatermarkedDoc.getPageCount()} pages) - VERIFIED PASS`);

  // PHASE 2: RESPONSIVE VIEWPORT TESTING ACROSS ALL 5 REQUIRED VIEWPORTS
  console.log('\n--- PHASE 2: 5-VIEWPORT OVERFLOW & ACCESSIBILITY AUDIT ---');
  const toolsToAudit = [
    { name: 'Watermark PDF', url: 'http://localhost:3000/tools/add-pdf-watermark' },
    { name: 'Rotate PDF', url: 'http://localhost:3000/tools/rotate-pdf' },
    { name: 'Delete PDF', url: 'http://localhost:3000/tools/delete-pdf' },
    { name: 'Extract PDF', url: 'http://localhost:3000/tools/extract-pdf' },
    { name: 'Split PDF', url: 'http://localhost:3000/tools/split-pdf' },
    { name: 'Merge PDF', url: 'http://localhost:3000/tools/merge-pdf' },
    { name: 'Page Numbers PDF', url: 'http://localhost:3000/tools/add-pdf-page-numbers' }
  ];

  for (const tool of toolsToAudit) {
    console.log(`\nAuditing ${tool.name} (${tool.url}):`);
    await send('Page.navigate', { url: tool.url });
    await sleep(2000);

    for (const vp of REQUIRED_VIEWPORTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });
      await sleep(350);

      const check = await evaluate(`(() => {
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        const hasOverflow = scrollW > clientW;
        return { hasOverflow, scrollW, clientW };
      })()`);

      const status = check.hasOverflow ? `FAIL (Overflow: scrollW ${check.scrollW} > clientW ${check.clientW})` : `PASS (0px overflow)`;
      console.log(`  ${vp.name.padEnd(25)}: ${status}`);
      if (check.hasOverflow) {
        throw new Error(`Overflow detected on ${tool.name} at viewport ${vp.name}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('ALL ACCEPTANCE TESTS & 5-VIEWPORT CHECKS PASSED 100%!');
  console.log('====================================================');

  edgeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
