import { spawn } from 'child_process';

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new', '--remote-debugging-port=9288', '--disable-gpu', 'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await (await fetch('http://127.0.0.1:9288/json/list')).json();
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(method, params = {}) {
      return new Promise(res => {
        const cur = id++;
        const h = e => {
          const d = JSON.parse(e.data);
          if (d.id === cur) { ws.removeEventListener('message', h); res(d.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method, params }));
      });
    }
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000/tools/split-pdf' });
    await new Promise(r => setTimeout(r, 2000));
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 500));
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const docW = document.documentElement.clientWidth;
        const bad = [];
        for (const el of document.querySelectorAll('*')) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docW + 1) {
            bad.push({
              tag: el.tagName,
              id: el.id,
              cls: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
          }
        }
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: docW,
          badCount: bad.length,
          bad: bad.slice(0, 15)
        };
      })()`,
      returnByValue: true
    });
    console.log('Result at 768px:', JSON.stringify(res.result.value, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}, 1000);
