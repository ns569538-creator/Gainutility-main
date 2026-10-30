/**
 * qa-cdp.mjs — zero-dependency browser QA over the prerendered build.
 *
 * Serves dist/client the way Cloudflare Pages does (extensionless URL -> flat
 * `route.html`), drives installed Chrome over the DevTools protocol using
 * Node's built-in WebSocket (Node >= 22), and runs deterministic checks that
 * a DOM-less audit cannot make:
 *
 *   FAIL  horizontal overflow at any checked viewport (320 / 375 / 768 / 1280)
 *   FAIL  <header> wider than the viewport (nav clipping on small phones)
 *   FAIL  console errors / uncaught exceptions
 *   FAIL  <img> without alt, form control without an accessible name
 *   FAIL  keyboard focus with no visible indicator (outline or ring)
 *   WARN  touch targets under 40px on mobile viewports (--strict-touch to fail)
 *
 * Usage:
 *   node scripts/qa-cdp.mjs
 *   node scripts/qa-cdp.mjs --routes /,/tools/merge-pdf --viewports 320,1280
 *   node scripts/qa-cdp.mjs --json qa-report.json --strict-touch
 *
 * Requires a build first (`npm run build`); no npm packages are imported.
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { resolve, join, extname, normalize } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(import.meta.dirname, "..");
const clientDir = resolve(root, "dist", "client");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const ROUTES = argOf("--routes", "/,/tools/merge-pdf,/tools/box-shadow-generator,/pdf,/blog,/pt-br")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const VIEWPORTS = argOf("--viewports", "320,375,768,1280")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));
const STRICT_TOUCH = has("--strict-touch");
const DEBUG_EXPR = argOf("--eval", "");
const BASE_OVERRIDE = argOf("--base", "");
const JSON_OUT = argOf("--json", "");
const SETTLE_MS = Number(argOf("--settle", "1200"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Assets that 404 during the run (a silent CSS/JS miss would otherwise make
   every layout check pass against an unstyled page). */
const MISSING = new Set();

/* ── static server (Cloudflare Pages extensionless semantics) ─────────── */
function startServer() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const candidates = [];
    if (safe === "/") candidates.push("index.html");
    else {
      const rel = safe.replace(/^[/\\]+/, "");
      // Extensionless URL -> flat `route.html` (Pages behaviour), then a real
      // file with an extension (assets), then a directory index.
      candidates.push(`${rel}.html`, rel, join(rel, "index.html"));
    }
    if (safe.endsWith("/404.html") || safe === "/404") candidates.unshift("404.html");
    for (const c of candidates) {
      const file = join(clientDir, c);
      if (!file.startsWith(clientDir)) continue;
      try {
        if (!statSync(file).isFile()) continue;
      } catch {
        continue;
      }
      res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
      res.end(readFileSync(file));
      return;
    }
    if (extname(safe) || safe.includes("/assets/")) MISSING.add(safe);
    const notFound = join(clientDir, "404.html");
    if (existsSync(notFound)) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(readFileSync(notFound));
      return;
    }
    res.writeHead(404).end("not found");
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res(server)));
}

/* ── chrome + a tiny CDP client on the built-in WebSocket ─────────────── */
async function launchChrome(port) {
  const profile = mkdtempSync(join(tmpdir(), "qa-cdp-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
      "--disable-background-networking",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      /* chrome not up yet */
    }
    if (!target) await sleep(200);
  }
  return { chrome, profile, target };
}

function cdpClient(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  const ready = new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", () => rej(new Error("websocket error")), { once: true });
  });
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: r, reject: j } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? j(new Error(`${msg.error.message ?? ""} ${msg.error.data ?? ""}`.trim())) : r(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolveP, rejectP) => {
      const msgId = ++id;
      pending.set(msgId, { resolve: resolveP, reject: rejectP });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  return {
    ready,
    send,
    on: (fn) => listeners.add(fn),
    close: () => ws.close(),
  };
}

/* ── page probes (evaluated in the page) ──────────────────────────────── */
const PROBE = `(() => {
  // The stylesheet sets overflow-x: hidden on html/body, which clips (and
  // hides from scrollWidth) anything that is too wide. Measure with it lifted
  // so a 320px header that would otherwise be silently cut off is reported.
  const html = document.documentElement;
  const body = document.body;
  const prevH = html.style.overflowX;
  const prevB = body.style.overflowX;
  html.style.overflowX = "visible";
  body.style.overflowX = "visible";

  const vw = html.clientWidth;
  const describe = (el) => {
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".")
      : "";
    return (el.tagName || "").toLowerCase() + id + cls;
  };
  const overflowEls = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const style = getComputedStyle(el);
      if (style.position === "fixed") continue;
      overflowEls.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right) });
    }
    if (overflowEls.length >= 8) break;
  }
  const scrollWidth = html.scrollWidth;
  const header = document.querySelector("header");
  const headerReport = header
    ? {
        clientW: header.clientWidth,
        scrollW: header.scrollWidth,
        right: Math.round(header.getBoundingClientRect().right),
        kids: [...header.querySelectorAll("a, button, nav, span, div")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && el.children.length === 0;
          })
          .slice(0, 14)
          .map((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              el: describe(el),
              w: Math.round(r.width),
              h: Math.round(r.height),
              right: Math.round(r.right),
              display: cs.display,
              cssH: cs.height,
            };
          }),
        // Everything inside the header that reaches past the viewport,
        // containers included (a leaf-only scan misses the row that clips).
        wide: [...header.querySelectorAll("*")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.right > vw + 1;
          })
          .slice(0, 8)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return describe(el) + " " + Math.round(r.left) + ".." + Math.round(r.right) + " w=" + Math.round(r.width);
          }),
      }
    : null;

  html.style.overflowX = prevH;
  body.style.overflowX = prevB;

  const media = {
    innerW: window.innerWidth,
    clientW: html.clientWidth,
    mq767: matchMedia("(max-width: 767px)").matches,
    mq768: matchMedia("(min-width: 768px)").matches,
    dpr: window.devicePixelRatio,
  };

  // A local stylesheet with zero rules means the CSS never arrived (missing
  // asset, 404, MIME) — every layout number above would be measuring an
  // unstyled document, so give it its own check.
  let cssRules = 0;
  for (const s of document.styleSheets) {
    if (s.href && !s.href.startsWith(location.origin)) continue;
    try {
      cssRules += s.cssRules.length;
    } catch {
      /* cross-origin sheet: unreadable by design */
    }
  }

  const named = (el) => {
    if ((el.getAttribute("aria-label") || "").trim()) return true;
    const by = el.getAttribute("aria-labelledby");
    if (by && by.split(/\\s+/).some((id) => document.getElementById(id)?.textContent?.trim())) return true;
    if ((el.innerText || "").trim()) return true;
    if ((el.getAttribute("title") || "").trim()) return true;
    if (el.querySelector("img[alt]:not([alt=''])")) return true;
    if ((el.textContent || "").trim()) return true;
    return false;
  };

  const imgNoAlt = [...document.querySelectorAll("img")].filter(
    (i) => !i.hasAttribute("alt") && i.getAttribute("role") !== "presentation" && i.getAttribute("aria-hidden") !== "true"
  ).length;

  const controlsNoName = [];
  for (const el of document.querySelectorAll("button, a[href], [role='button'], [role='link'], summary")) {
    if (el.closest("[aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (!named(el)) controlsNoName.push(describe(el));
  }
  const inputsNoLabel = [];
  for (const el of document.querySelectorAll("input, select, textarea")) {
    if (el.type === "hidden" || el.closest("[aria-hidden='true']")) continue;
    // Only rendered controls are in scope: hidden inputs, ".hidden" dropzone
    // pickers and zero-size nodes are not perceivable, so WCAG 1.3.1/3.3.2
    // does not apply to them.
    if (el.hasAttribute("hidden")) continue;
    const r0 = el.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0) continue;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    const id = el.id && document.querySelector("label[for='" + CSS.escape(el.id) + "']");
    const wrapped = el.closest("label");
    const ok =
      id || wrapped || (el.getAttribute("aria-label") || "").trim() ||
      (el.getAttribute("aria-labelledby") || "").trim() ||
      (el.getAttribute("placeholder") || "").trim() || (el.getAttribute("title") || "").trim();
    if (!ok) inputsNoLabel.push(describe(el));
  }

  const smallTargets = [];
  if (window.innerWidth < 800) {
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role='button']")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      // Exempt per WCAG 2.5.8: inline text links, visually-hidden inputs
      // (file pickers styled with sr-only), and sub-pixel targets.
      if (style.display === "inline") continue;
      if (el.classList.contains("sr-only")) continue;
      if (el.type === "range") continue;
      if (r.width < 4 && r.height < 4) continue;
      if (r.width < 40 || r.height < 40) {
        smallTargets.push({
          el: describe(el),
          w: Math.round(r.width),
          h: Math.round(r.height),
          // WCAG 2.5.8 (AA) needs 24x24; 40x40 is the AAA/best-practice bar.
          aa: r.width >= 24 && r.height >= 24,
        });
      }
      if (smallTargets.length >= 60) break;
    }
  }

  return {
    vw,
    scrollWidth,
    overflowEls,
    header: headerReport,
    media,
    cssRules,
    imgNoAlt,
    controlsNoName: controlsNoName.slice(0, 8),
    inputsNoLabel: inputsNoLabel.slice(0, 8),
    smallTargets,
    title: document.title,
    h1: (document.querySelector("h1")?.innerText || "").trim().slice(0, 120),
  };
})()`;

const FOCUS_PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { none: true };
  const s = getComputedStyle(el);
  const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth || "0") > 0;
  const ring = !!s.boxShadow && s.boxShadow !== "none";
  const id = el.id ? "#" + el.id : "";
  const cls = typeof el.className === "string" && el.className.trim()
    ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".")
    : "";
  return {
    none: false,
    tag: (el.tagName || "").toLowerCase() + id + cls,
    outline,
    ring,
    ok: outline || ring,
    label: (el.getAttribute("aria-label") || el.innerText || "").trim().slice(0, 40),
  };
})()`;

async function waitForLoad(cdp, timeoutMs = 15000) {
  const start = Date.now();
  for (;;) {
    try {
      const r = await cdp.send("Runtime.evaluate", {
        expression: "document.readyState === 'complete' && !!document.body",
        returnByValue: true,
      });
      if (r.result.value) break;
    } catch {
      /* frame not ready */
    }
    if (Date.now() - start > timeoutMs) break;
    await sleep(150);
  }
  await sleep(SETTLE_MS);
}

/* ── checks ───────────────────────────────────────────────────────────── */
const results = [];
const record = (check, ok, detail, level = "FAIL") =>
  results.push({ check, ok, level: ok ? "PASS" : level, detail });

async function runViewport(cdp, route, width) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: width < 800 ? 780 : 900,
    deviceScaleFactor: 1,
    mobile: width < 600,
    screenWidth: width,
  });
  await cdp.send("Page.navigate", { url: `${BASE_URL}${route}` });
  await waitForLoad(cdp);

  if (DEBUG_EXPR) {
    const dbg = await cdp.send("Runtime.evaluate", {
      expression: DEBUG_EXPR,
      returnByValue: true,
      awaitPromise: true,
    });
    console.log(`\n[eval ${route} @${width}px]`, JSON.stringify(dbg.result.value ?? dbg.result, null, 2));
  }

  const probe = (await cdp.send("Runtime.evaluate", { expression: PROBE, returnByValue: true })).result.value;
  const where = `${route} @${width}px`;

  record(`stylesheet applied: ${where}`, probe.cssRules > 0, `local cssRules=${probe.cssRules}`);

  const overflow = probe.scrollWidth > probe.vw + 1;
  record(
    `no horizontal overflow: ${where}`,
    !overflow,
    overflow
      ? `scrollWidth=${probe.scrollWidth} > vw=${probe.vw}; ${probe.overflowEls
          .map((o) => `${o.el}(${o.left}..${o.right})`)
          .join(", ")}`
      : `vw=${probe.vw} scrollWidth=${probe.scrollWidth}`
  );

  if (probe.header) {
    const h = probe.header;
    const headerOverflow = h.scrollW > probe.vw + 1 || h.right > probe.vw + 1;
    const sorted = [...h.kids].sort((a, b) => b.right - a.right);
    const top = sorted[0];
    const edge = top
      ? `rightmost ${top.el} ${top.w}x${top.h}@${top.right} display=${top.display} cssH=${top.cssH}`
      : "";
    record(
      `header fits viewport: ${where}`,
      !headerOverflow,
      headerOverflow
        ? `header scrollW=${h.scrollW} right=${h.right} vw=${probe.vw}; ${edge} | past viewport: ${
            h.wide.length ? h.wide.join(" ; ") : "none (check scrollWidth)"
          }`
        : `scrollW=${h.scrollW} vw=${probe.vw} mq768=${probe.media.mq768} ${edge}`
    );
  }

  record(
    `images carry alt text: ${where}`,
    probe.imgNoAlt === 0,
    `${probe.imgNoAlt} <img> without alt`
  );
  record(
    `controls have accessible names: ${where}`,
    probe.controlsNoName.length === 0,
    probe.controlsNoName.join(", ") || "all named"
  );
  record(
    `form fields labelled: ${where}`,
    probe.inputsNoLabel.length === 0,
    probe.inputsNoLabel.join(", ") || "all labelled"
  );

  if (probe.smallTargets.length) {
    const belowAA = probe.smallTargets.filter((t) => !t.aa);
    const detail =
      (belowAA.length
        ? `AA(<24px): ${belowAA.map((t) => `${t.el} ${t.w}x${t.h}`).join(", ")} | `
        : "") +
      probe.smallTargets
        .filter((t) => t.aa)
        .map((t) => `${t.el} ${t.w}x${t.h}`)
        .join(", ");
    record(
      `touch targets >= 40px: ${where}`,
      false,
      detail,
      belowAA.length || STRICT_TOUCH ? "FAIL" : "WARN"
    );
  } else {
    record(`touch targets >= 40px: ${where}`, true, "no sub-40px targets");
  }

  return { probe };
}

async function checkKeyboardFocus(cdp, route, width) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
  });
  await cdp.send("Page.navigate", { url: `${BASE_URL}${route}` });
  await waitForLoad(cdp);
  await cdp.send("Runtime.evaluate", { expression: "document.body && document.body.focus && window.scrollTo(0,0)" });

  const seen = [];
  let ok = false;
  for (let i = 0; i < 6; i++) {
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await sleep(120);
    const r = (await cdp.send("Runtime.evaluate", { expression: FOCUS_PROBE, returnByValue: true })).result.value;
    if (r.none) continue;
    seen.push(`${r.tag}${r.ok ? " ok" : " NO-RING"}`);
    if (r.ok) ok = true;
  }
  record(
    `keyboard focus indicator: ${route} @${width}px`,
    seen.length > 0 && ok,
    seen.length ? seen.join(" | ") : "no focusable element reached"
  );
}

async function main() {
  if (!BASE_OVERRIDE && !existsSync(join(clientDir, "index.html"))) {
    console.error("dist/client/index.html missing — run `npm run build` first.");
    process.exit(1);
  }
  if (!existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME} (set CHROME=... to override).`);
    process.exit(1);
  }

  const server = BASE_OVERRIDE ? null : await startServer();
  BASE_URL = BASE_OVERRIDE ? BASE_OVERRIDE.replace(/\/+$/, "") : `http://127.0.0.1:${server.address().port}`;

  // A dedicated debug port; probe a small range so a stale instance never
  // hijacks the run.
  let launched = null;
  for (let port = 9335; port <= 9355 && !launched; port++) {
    try {
      const attempt = await launchChrome(port);
      if (attempt.target) launched = attempt;
      else attempt.chrome.kill();
    } catch {
      /* port busy or chrome failed to start */
    }
  }
  if (!launched) {
    console.error("could not start headless Chrome");
    server.close();
    process.exit(1);
  }
  const { chrome, profile, target } = launched;
  const cdp = cdpClient(target.webSocketDebuggerUrl);
  await cdp.ready;

  const pageErrors = [];
  cdp.on((msg) => {
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params?.exceptionDetails || {};
      pageErrors.push(d.exception?.description || d.text || "exception");
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
      pageErrors.push(
        (msg.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ").trim() || "console.error"
      );
    }
    if (msg.method === "Log.entryAdded" && msg.params?.entry?.level === "error") {
      const entry = msg.params.entry;
      // Chrome logs favicon/network noise from the local static server; keep
      // only entries that originate from the page itself.
      if (entry.source === "javascript" || entry.url?.endsWith(".html")) {
        pageErrors.push(`${entry.text} (${entry.url || ""})`);
      }
    }
  });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Network.enable");

  console.log(`qa-cdp: ${ROUTES.length} routes x ${VIEWPORTS.length} viewports against ${BASE_URL}`);
  for (const route of ROUTES) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      record(`route responds 200: ${route}`, res.status === 200, `status=${res.status}`);
    } catch (e) {
      record(`route responds 200: ${route}`, false, e.message);
    }
  }
  for (const route of ROUTES) {
    for (const width of VIEWPORTS) {
      try {
        await runViewport(cdp, route, width);
      } catch (e) {
        record(`route reachable: ${route} @${width}px`, false, e.message);
      }
    }
  }
  const focusRoute = ROUTES[0];
  for (const width of VIEWPORTS.filter((w) => w <= 375).concat(VIEWPORTS[VIEWPORTS.length - 1])) {
    try {
      await checkKeyboardFocus(cdp, focusRoute, width);
    } catch (e) {
      record(`keyboard focus indicator: ${focusRoute} @${width}px`, false, e.message);
    }
  }

  const uniqueErrors = [
    ...new Set(pageErrors.map((e) => e.split("\n").slice(0, 4).join(" ¶ ")).filter(Boolean)),
  ];
  record(
    "no console errors / uncaught exceptions",
    uniqueErrors.length === 0,
    uniqueErrors.slice(0, 4).join("  ||  ") || "clean"
  );
  if (!BASE_OVERRIDE) {
    record(
      "no missing subresources (css/js/fonts/images)",
      MISSING.size === 0,
      [...MISSING].slice(0, 8).join(", ") || "all served"
    );
  }

  cdp.close();
  server?.close();
  chrome.kill();

  const fails = results.filter((r) => r.level === "FAIL" && !r.ok);
  const warns = results.filter((r) => r.level === "WARN" && !r.ok);
  for (const r of results) {
    const mark = r.ok ? "  ok  " : r.level === "WARN" ? " warn " : " FAIL ";
    console.log(`${mark} ${r.check}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  console.log(`\nqa-cdp: ${results.filter((r) => r.ok).length} passed, ${warns.length} warnings, ${fails.length} failed`);
  if (JSON_OUT) writeFileSync(resolve(JSON_OUT), JSON.stringify({ results, fails: fails.length, warns: warns.length }, null, 2));

  // Chrome can still hold the temp profile for a beat after SIGTERM; a failed
  // cleanup must never mask a real QA result.
  for (let i = 0; i < 5; i++) {
    try {
      rmSync(profile, { recursive: true, force: true });
      break;
    } catch {
      await sleep(300);
    }
  }

  process.exit(fails.length ? 1 : 0);
}

let BASE_URL = "";

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
