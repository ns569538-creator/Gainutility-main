/**
 * Bounded website-scan fetch proxy for Website Studio (Check My Website /
 * Launch Checklist).
 *
 * POST /api/analyze { "url": "https://example.com" }
 *   → RawSignals-shaped JSON: main page (headers + capped HTML), redirect
 *     chain, robots.txt, sitemap (discovered via robots Sitemap: directives
 *     or /sitemap.xml), and a small same-origin sample of links/assets.
 *
 * Security: SSRF guards (scheme/host/port/IP-literal checks on every redirect
 * hop), manual redirect following with a hop cap, overall timeout, per-response
 * size caps, and a per-IP in-memory rate limiter. This is not an open proxy:
 * it only ever returns scan-shaped summaries, never streams arbitrary bodies
 * back to the client beyond the capped page HTML used for on-page checks.
 */

const USER_AGENT = "GainUtility-WebsiteCheck/1.0 (+https://www.gainutility.com)";
const MAX_REDIRECTS = 5;
const OVERALL_TIMEOUT_MS = 15_000;
const PAGE_HTML_CAP = 1_500_000; // 1.5 MB
const ROBOTS_CAP = 128 * 1024;
const SITEMAP_CAP = 512 * 1024;
const MAX_LINK_SAMPLES = 8;
const MAX_ASSET_SAMPLES = 6;

interface FunctionContext {
  request: Request;
  env: unknown;
  params: Record<string, string | string[]>;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const fail = (code: string, message: string, status = 400): Response =>
  json({ error: { code, message } }, status);

/* ── Rate limiting (same pattern as functions/api/ratings.ts) ─────────── */
const rateBuckets = new Map<string, number[]>();

function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket) {
    rateBuckets.set(key, [now]);
    return true;
  }
  const fresh = bucket.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    rateBuckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  rateBuckets.set(key, fresh);
  if (rateBuckets.size > 10_000) rateBuckets.clear();
  return true;
}

/* ── SSRF guards ──────────────────────────────────────────────────────── */

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".localdomain",
  ".home.arpa",
  ".corp",
  ".lan",
];

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

function isPrivateIPv4(parts: number[]): boolean {
  const [a, b, c] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

/** Detect IPv4 literals in dotted, decimal, hex or octal form. */
function parseIPv4Host(host: string): number[] | null {
  if (/^\d+$/.test(host)) {
    // Pure-decimal IPv4 (e.g. 2130706433 → 127.0.0.1)
    const n = Number(host);
    if (!Number.isFinite(n) || n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }
  if (!/^(?:0x[0-9a-f]+|\d+)(?:\.(?:0x[0-9a-f]+|\d+)){3}$/i.test(host)) {
    return null;
  }
  const segs = host.split(".").map((s) =>
    s.toLowerCase().startsWith("0x") ? parseInt(s, 16) : parseInt(s, 10)
  );
  if (segs.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) return null;
  return segs;
}

function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ScanError("invalid-url", "That does not look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ScanError("blocked", "Only http:// and https:// URLs can be scanned.");
  }
  if (url.username || url.password) {
    throw new ScanError("blocked", "URLs with embedded credentials are not allowed.");
  }
  const port = url.port;
  if (port && port !== "80" && port !== "443") {
    throw new ScanError("blocked", "Only standard ports (80/443) can be scanned.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host)) {
    throw new ScanError("blocked", "That host cannot be scanned.");
  }
  for (const suffix of BLOCKED_HOST_SUFFIXES) {
    if (host.endsWith(suffix)) {
      throw new ScanError("blocked", "That host cannot be scanned.");
    }
  }
  if (host.startsWith("[") || host.includes(":")) {
    // IPv6 literal — reject loopback/link-local/ULA/IPv4-mapped private.
    const h = host.replace(/^\[|\]$/g, "");
    if (
      h === "::1" ||
      h === "::" ||
      h.startsWith("fe80") ||
      h.startsWith("fc") ||
      h.startsWith("fd") ||
      h.startsWith("::ffff:127.") ||
      h.startsWith("::ffff:10.") ||
      h.startsWith("::ffff:192.168.") ||
      h.startsWith("::ffff:169.254.") ||
      h.startsWith("::ffff:172.")
    ) {
      throw new ScanError("blocked", "That host cannot be scanned.");
    }
    throw new ScanError("blocked", "IPv6 targets are not supported.");
  }
  const v4 = parseIPv4Host(host);
  if (v4 && isPrivateIPv4(v4)) {
    throw new ScanError("blocked", "Private or loopback addresses cannot be scanned.");
  }
  return url;
}

class ScanError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/* ── Capped body reads ────────────────────────────────────────────────── */

async function readCapped(res: Response, cap: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (total + value.byteLength > cap) {
        chunks.push(value.subarray(0, Math.max(0, cap - total)));
        try {
          await reader.cancel();
        } catch {
          /* already closed */
        }
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } catch {
    /* stream interrupted — return what we have */
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

function headersToObject(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

/* ── Fetch with manual, guarded redirects ─────────────────────────────── */

interface Fetched {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  hops: { url: string; status: number }[];
}

async function safeFetch(
  rawUrl: string,
  opts: { cap: number; method?: string; acceptHtml?: boolean }
): Promise<Fetched> {
  const method = (opts.method ?? "GET").toUpperCase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERALL_TIMEOUT_MS);
  const hops: { url: string; status: number }[] = [];
  try {
    let current = assertSafeUrl(rawUrl);
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const res = await fetch(current.toString(), {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": USER_AGENT,
          accept: opts.acceptHtml
            ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            : "*/*",
          "accept-language": "en,*;q=0.5",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) {
          hops.push({ url: current.toString(), status: res.status });
          try {
            res.body?.cancel();
          } catch {
            /* ignore */
          }
          return {
            url: current.toString(),
            status: res.status,
            headers: headersToObject(res.headers),
            body: "",
            hops,
          };
        }
        hops.push({ url: current.toString(), status: res.status });
        // Drain and follow (resolve relative Location against current URL).
        try {
          res.body?.cancel();
        } catch {
          /* ignore */
        }
        current = assertSafeUrl(new URL(loc, current).toString());
        continue;
      }
      const body = method === "GET" ? await readCapped(res, opts.cap) : "";
      if (method !== "GET") {
        try {
          res.body?.cancel();
        } catch {
          /* ignore */
        }
      }
      return {
        url: current.toString(),
        status: res.status,
        headers: headersToObject(res.headers),
        body,
        hops,
      };
    }
    throw new ScanError("blocked", "Too many redirects while following that URL.", 400);
  } catch (err) {
    if (err instanceof ScanError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ScanError("timeout", "The site took too long to respond.", 504);
    }
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();
    if (lower.includes("ssl") || lower.includes("tls") || lower.includes("certificate")) {
      throw new ScanError("tls", "The site's TLS certificate could not be verified.", 502);
    }
    if (
      lower.includes("dns") ||
      lower.includes("getaddrinfo") ||
      lower.includes("name not resolved") ||
      lower.includes("enotfound")
    ) {
      throw new ScanError("dns", "That hostname could not be resolved.", 502);
    }
    if (lower.includes("refused") || lower.includes("network") || lower.includes("fetch failed")) {
      throw new ScanError("unreachable", "The site could not be reached from our servers.", 502);
    }
    throw new ScanError("unreachable", "The site could not be reached from our servers.", 502);
  } finally {
    clearTimeout(timer);
  }
}

/* ── robots.txt parsing helpers ──────────────────────────────────────── */

interface RobotsGroup {
  agents: string[];
  rules: { allow: boolean; path: string }[];
}

function parseRobotsGroups(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let sawAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === "user-agent") {
      if (!current || sawAgent && current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      if (!current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      sawAgent = true;
    } else if (field === "allow" || field === "disallow") {
      if (!current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      if (value !== "" || field === "disallow") {
        current.rules.push({ allow: field === "allow", path: value });
      }
    }
    // sitemap / crawl-delay handled elsewhere
  }
  return groups;
}

function robotsSitemapUrls(text: string): string[] {
  const out: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const m = /^sitemap\s*:\s*(.+)$/i.exec(line);
    if (m) out.push(m[1].trim());
  }
  return out;
}

function robotsAllows(robotsText: string, path: string, agent = "gainutility-websitecheck"): boolean {
  const groups = parseRobotsGroups(robotsText);
  const agentL = agent.toLowerCase();
  let matched: RobotsGroup | null = null;
  for (const g of groups) {
    if (g.agents.some((a) => a === "*" || agentL.includes(a) || a.includes(agentL))) {
      matched = g;
      if (g.agents.some((a) => a !== "*")) break;
    }
  }
  if (!matched || matched.rules.length === 0) return true;
  let best = { allow: true, len: -1 };
  for (const rule of matched.rules) {
    if (rule.path === "") {
      if (!rule.allow && best.len < 0) best = { allow: false, len: 0 };
      continue;
    }
    const pattern = rule.path
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const re = new RegExp(`^${pattern}`);
    if (re.test(path)) {
      const len = rule.path.length;
      if (len > best.len || (len === best.len && rule.allow)) {
        best = { allow: rule.allow, len };
      }
    }
  }
  return best.allow;
}

/* ── Sample extraction (regex-based, same-origin only) ───────────────── */

const ASSET_EXT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|css|js|mjs)(?:[?#]|$)/i;

function extractSamples(html: string, baseUrl: string): { links: string[]; assets: string[] } {
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return { links: [], assets: [] };
  }
  const re = /(?:href|src)\s*=\s*["']([^"'#]+)["']/gi;
  const links: string[] = [];
  const assets: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let abs: string;
    try {
      abs = new URL(raw, base).toString();
    } catch {
      continue;
    }
    let u: URL;
    try {
      u = new URL(abs);
    } catch {
      continue;
    }
    if (u.origin !== base.origin) continue; // same-origin scope
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    const clean = `${u.origin}${u.pathname}${u.search}`;
    if (seen.has(clean)) continue;
    seen.add(clean);
    if (ASSET_EXT.test(u.pathname)) {
      if (assets.length < MAX_ASSET_SAMPLES) assets.push(clean);
    } else if (!/robots\.txt$/i.test(u.pathname)) {
      if (links.length < MAX_LINK_SAMPLES) links.push(clean);
    }
    if (links.length >= MAX_LINK_SAMPLES && assets.length >= MAX_ASSET_SAMPLES) break;
  }
  return { links, assets };
}

function countLoc(xml: string): number {
  let count = 0;
  const re = /<loc[\s>]/gi;
  while (re.exec(xml) !== null) count++;
  return count;
}

/* ── Handler ─────────────────────────────────────────────────────────── */

export async function onRequestPost(context: FunctionContext): Promise<Response> {
  const { request } = context;

  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (origin !== new URL(request.url).origin) {
        return fail("cross-origin", "Cross-origin scans are not allowed.", 403);
      }
    } catch {
      /* unparseable origin — fall through */
    }
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown-ip";
  if (!allowRequest(`analyze:all:${ip}`, 10, 60 * 1000)) {
    return fail("rate-limited", "Too many scans from this network. Please wait a minute and try again.", 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("invalid-request", "Request body must be valid JSON.");
  }
  const rawUrl = (payload as { url?: unknown } | null)?.url;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return fail("invalid-url", "A url field is required.");
  }
  if (rawUrl.length > 2048) {
    return fail("invalid-url", "That URL is too long.");
  }

  try {
    const start = Date.now();
    const requested = assertSafeUrl(rawUrl.trim());

    // 1) Main page.
    let page: Fetched;
    try {
      page = await safeFetch(requested.toString(), { cap: PAGE_HTML_CAP, acceptHtml: true });
    } catch (err) {
      if (err instanceof ScanError) return fail(err.code, err.message, err.status);
      throw err;
    }
    const finalUrl = page.url;
    const isHtml = (page.headers["content-type"] ?? "").includes("html");

    // 2) robots.txt (404 is a valid "not present" answer, not a failure).
    let robots: {
      url: string;
      status: number | null;
      text: string | null;
      error?: string;
    };
    const robotsUrl = `${new URL(finalUrl).origin}/robots.txt`;
    try {
      const r = await safeFetch(robotsUrl, { cap: ROBOTS_CAP });
      if (r.status >= 200 && r.status < 300) {
        robots = { url: r.url, status: r.status, text: r.body };
      } else if (r.status === 404 || r.status === 410) {
        robots = { url: r.url, status: r.status, text: null };
      } else {
        robots = { url: r.url, status: r.status, text: null, error: "server-error" };
      }
    } catch (err) {
      robots = {
        url: robotsUrl,
        status: null,
        text: null,
        error: err instanceof ScanError ? err.code : "unreachable",
      };
    }

    // 3) Sitemap — robots Sitemap: directives first, else /sitemap.xml.
    const declared = robots.text ? robotsSitemapUrls(robots.text) : [];
    const candidates = declared.length
      ? declared
      : [`${new URL(finalUrl).origin}/sitemap.xml`];
    let sitemap: {
      url: string | null;
      status: number | null;
      urlCount: number | null;
      declaredBy: "robots" | "default" | null;
      error?: string;
    } = { url: null, status: null, urlCount: null, declaredBy: null };
    for (const candidate of candidates.slice(0, 3)) {
      const declaredBy: "robots" | "default" = declared.length ? "robots" : "default";
      try {
        const s = await safeFetch(candidate, { cap: SITEMAP_CAP });
        sitemap = {
          url: s.url,
          status: s.status,
          urlCount:
            s.status >= 200 && s.status < 300 ? countLoc(s.body) : null,
          declaredBy,
        };
        if (sitemap.status !== null && sitemap.status < 400) break;
        if (sitemap.status === 404 || sitemap.status === 410) break;
      } catch (err) {
        sitemap = {
          url: candidate,
          status: null,
          urlCount: null,
          declaredBy,
          error: err instanceof ScanError ? err.code : "unreachable",
        };
      }
    }

    // 4) Bounded same-origin sample (robots respected for page links).
    const samples: {
      url: string;
      kind: "link" | "asset";
      status: number | null;
      bytes: number | null;
      error?: string;
    }[] = [];
    if (isHtml) {
      const { links, assets } = extractSamples(page.body, finalUrl);
      for (const link of links.slice(0, MAX_LINK_SAMPLES)) {
        const path = new URL(link).pathname + new URL(link).search;
        if (robots.text && !robotsAllows(robots.text, path)) {
          samples.push({ url: link, kind: "link", status: null, bytes: null, error: "robots-disallowed" });
          continue;
        }
        try {
          let res: Fetched;
          try {
            res = await safeFetch(link, { cap: 4096, method: "HEAD" });
          } catch {
            res = await safeFetch(link, { cap: 4096 });
          }
          // Some servers reject HEAD (405/501) or gate it behind bot checks —
          // fall back to a capped GET before declaring the link broken.
          if (res.status >= 400) {
            try {
              res = await safeFetch(link, { cap: 4096 });
            } catch {
              /* keep the HEAD outcome */
            }
          }
          const len = res.headers["content-length"];
          samples.push({
            url: link,
            kind: "link",
            status: res.status,
            bytes: len ? Number(len) : null,
            ...(res.status >= 400 ? { error: "http-error" } : {}),
          });
        } catch (err) {
          samples.push({
            url: link,
            kind: "link",
            status: null,
            bytes: null,
            error: err instanceof ScanError ? err.code : "unreachable",
          });
        }
      }
      for (const asset of assets.slice(0, MAX_ASSET_SAMPLES)) {
        try {
          let res = await safeFetch(asset, { cap: 1024, method: "HEAD" });
          if (res.status >= 400) {
            try {
              res = await safeFetch(asset, { cap: 1024 });
            } catch {
              /* keep the HEAD outcome */
            }
          }
          const len = res.headers["content-length"];
          samples.push({
            url: asset,
            kind: "asset",
            status: res.status,
            bytes: len ? Number(len) : null,
            ...(res.status >= 400 ? { error: "http-error" } : {}),
          });
        } catch (err) {
          samples.push({
            url: asset,
            kind: "asset",
            status: null,
            bytes: null,
            error: err instanceof ScanError ? err.code : "unreachable",
          });
        }
      }
    }

    return json({
      requestedUrl: requested.toString(),
      finalUrl,
      hops: page.hops,
      page: {
        status: page.status,
        headers: page.headers,
        html: isHtml ? page.body : "",
        bytes: page.body.length,
        contentType: page.headers["content-type"] ?? "",
      },
      robots,
      sitemap,
      samples,
      durationMs: Date.now() - start,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof ScanError) return fail(err.code, err.message, err.status);
    console.error("analyze:unexpected", err);
    return fail("server-error", "The scan failed unexpectedly. Please try again.", 500);
  }
}
