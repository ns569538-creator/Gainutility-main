const urls = [
  "https://www.gainutility.com/tools/jpg-to-pdf",
  "https://www.gainutility.com/",
  "http://www.gainutility.com/",
  "https://gainutility.com/tools/jpg-to-pdf",
];
for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" } });
    const h = await r.text();
    const c = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    console.log(u, "->", r.status, "canon=", c);
  } catch (e) {
    console.log(u, "ERR", e.message);
  }
}
const dns = await import("node:dns").then((m) => m.promises);
for (const host of ["www.gainutility.com", "gainutility.com"]) {
  try {
    console.log(host, "A", await dns.resolve4(host));
  } catch (e) {
    console.log(host, "A ERR", e.code);
  }
}
