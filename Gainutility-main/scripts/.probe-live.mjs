const H = { "user-agent": "Mozilla/5.0 (compatible; index-audit)" };
const checks = [
  ["apex /", "https://gainutility.com/"],
  ["apex (no slash)", "https://gainutility.com"],
  ["www /", "https://www.gainutility.com/"],
  ["http /", "http://gainutility.com/"],
  ["trailing slash tool", "https://gainutility.com/tools/merge-pdf/"],
  ["image-to-code", "https://gainutility.com/image-to-code"],
  ["unknown", "https://gainutility.com/this-route-does-not-exist-xyz"],
  ["JPG-to-PDF upper", "https://gainutility.com/JPG-to-PDF"],
  ["tools/", "https://gainutility.com/tools/"],
];
for (const [name, u] of checks) {
  try {
    const r = await fetch(u, { headers: H, redirect: "manual" });
    const loc = r.headers.get("location") || "-";
    const body = await r.text();
    const canon = body.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "-";
    const robots = body.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "-";
    console.log(String(r.status).padEnd(4), name.padEnd(22), "loc=" + loc.padEnd(42), "canon=" + canon, "| robots=" + robots);
  } catch (e) {
    console.log("ERR ", name, e.message);
  }
}

const s = await fetch("https://gainutility.com/sitemap.xml", { headers: H });
const xml = await s.text();
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log("\nsitemap status:", s.status, "entries:", locs.length, "unique:", new Set(locs).size);
console.log("homepage loc:", locs[0]);
console.log("has trailing-slash entries:", locs.filter((u) => u.endsWith("/") && u !== "https://gainutility.com/").length);
console.log("non-apex-host entries:", locs.filter((u) => !u.startsWith("https://gainutility.com")).length);

const r2 = await fetch("https://gainutility.com/robots.txt", { headers: H });
console.log("\nrobots.txt", r2.status);
console.log(await r2.text());
