import WebSocket from "ws";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9334;
const BASE = process.env.BASE || "http://localhost:8788";
const OUT = resolve("C:\\Users\\nav\\AppData\\Local\\Temp\\opencode\\route-audit");

let msgId = 0;
const pending = new Map();
let ws;

function connect() {
  return new Promise((res) => ws.on("open", res));
}
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function bind() {
  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    }
  });
}

const snapshotExpr = `(() => {
  const root = document.getElementById('root');
  if (!root) return { hasRoot: false };
  const kids = Array.from(root.children);
  const first = kids[0];
  const firstTag = first ? first.tagName : null;
  const firstClass = first ? (first.getAttribute('class')||'').slice(0,40) : null;
  const text = (root.innerText||'').replace(/\\s+/g,' ').trim().slice(0,220);
  return {
    hasRoot: true, kidCount: kids.length, firstTag, firstClass,
    htmlLen: root.innerHTML.length, text,
    hasToast: !!document.querySelector('[class*="toast"]'),
    readyState: document.readyState,
    url: location.pathname,
  };
})()`;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

const ROUTES = process.env.ROUTES
  ? process.env.ROUTES.split(",")
  : ["/tools/json-validator", "/tools/merge-pdf", "/image-converter", "/studios/color/generator", "/json/best"];

async function runRoute(file, viewport, throttle) {
  const vp = viewport === "mobile"
    ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
    : { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false };
  await send("Emulation.setDeviceMetricsOverride", vp);
  if (throttle === "3g") {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 43750, uploadThroughput: 12500 });
  } else {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  }

  await send("Page.navigate", { url: BASE + file });

  // Wait for navigation to actually commit (poll until a document is present)
  let committed = false;
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    try {
      const r = await send("Runtime.evaluate", { expression: "!!document.body && location.href !== 'about:blank'", returnByValue: true });
      if (r.result.value) { committed = true; break; }
    } catch {}
  }
  if (!committed) {
    // fall back to sampling anyway
  }

  const samples = {};
  const times = [0, 100, 250, 500, 1000, 2000];
  for (const ms of times) {
    const prev = times[times.indexOf(ms) - 1];
    const wait = ms === 0 ? 80 : ms - (prev ?? 0);
    await sleep(wait);
    const snap = await send("Runtime.evaluate", { expression: snapshotExpr, returnByValue: true });
    samples[`t=${ms}`] = snap.result.value;
  }
  let interactive = null;
  for (let i = 0; i < 80; i++) {
    await sleep(150);
    const snap = await send("Runtime.evaluate", { expression: snapshotExpr, returnByValue: true });
    interactive = snap.result.value;
    const t = interactive && (interactive.text || "");
    if (t.includes("Validate JSON") || t.includes("Drop") || t.includes("Upload") || t.includes("Paste") || (interactive && interactive.kidCount !== 1)) break;
  }
  samples["after-settle"] = interactive || {};

  mkdirSync(OUT, { recursive: true });
  const safe = file.replace(/[\\/]/g, "_").replace(/^_/, "") || "root";
  writeFileSync(resolve(OUT, `${safe}__${viewport}__${throttle}.json`), JSON.stringify(samples, null, 2));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(resolve(OUT, `${safe}__${viewport}__${throttle}.png`), Buffer.from(shot.data, "base64"));

  console.log(`\n=== ${file} | ${viewport} | ${throttle} ===`);
  for (const k of Object.keys(samples)) {
    const s = samples[k] || {};
    console.log(`  ${k}: kids=${s.kidCount} first=${s.firstTag} len=${s.htmlLen} :: "${s.text}"`);
  }
  console.log("  afterSettle hasRoot/isTool:", !!(samples["after-settle"] && samples["after-settle"].hasRoot));
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${DEBUG_PORT}`, "--disable-gpu",
    "--no-first-run", "--disable-extensions",
    "--user-data-dir=C:\\Users\\nav\\AppData\\Local\\Temp\\opencode\\chrome-profile-audit2",
    "--disable-background-networking", "about:blank",
  ], { stdio: "ignore" });

  let target = null;
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://localhost:${DEBUG_PORT}/json`);
      const list = await r.json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch {}
    await sleep(200);
  }
  if (!target) { console.error("no chrome"); chrome.kill(); process.exit(1); }

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await connect();
  bind();
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("DOM.enable");

  for (const route of ROUTES) {
    for (const viewport of ["desktop", "mobile"]) {
      for (const throttle of ["fast", "3g"]) {
        try { await runRoute(route, viewport, throttle); }
        catch (e) { console.log(`  !! ${route} ${viewport} ${throttle}: ${e.message}`); }
      }
    }
  }
  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
