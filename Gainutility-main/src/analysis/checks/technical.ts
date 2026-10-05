/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Technical checks: HTTP status, HTTPS, redirect chain, broken sampled
 * links, robots.txt health and duplicate/canonical URL signals.
 */

import type { Finding, RawSignals } from "../types";

const HTTP_4XX_5XX = (s: number) => s >= 400;

export function runTechnicalChecks(raw: RawSignals): Finding[] {
  const out: Finding[] = [];
  const status = raw.page.status;

  // HTTP status
  if (HTTP_4XX_5XX(status)) {
    out.push({
      id: "tech-http-status",
      category: "technical",
      status: "ERROR",
      title: `Page returned HTTP ${status}`,
      what: `The final response status for ${raw.finalUrl} is ${status}.`,
      why: status === 404
        ? "A 404 means the URL does not exist — search engines will drop it."
        : "Non-200 statuses block indexing and break the user journey.",
      how: status === 404
        ? "Fix the internal links pointing here, or restore the page / add a redirect."
        : `Investigate the server or CDN configuration so this URL returns 200 (got ${status}).`,
      evidence: `GET ${raw.finalUrl} → ${status}`,
    });
  } else if (status >= 300 && status < 400) {
    out.push({
      id: "tech-http-status",
      category: "technical",
      status: "WARNING",
      title: `Page settled on a redirect (${status})`,
      what: `The final response status is ${status} with no further Location.`,
      why: "A redirect loop or missing target leaves users and crawlers on an intermediate hop.",
      how: "Ensure every redirect points at a final 200 URL.",
      evidence: `final status ${status}`,
    });
  } else {
    out.push({
      id: "tech-http-status",
      category: "technical",
      status: "PASS",
      title: "Page returns HTTP 200",
      what: `Final status for ${raw.finalUrl} is ${status}.`,
      why: "A 200 response means the URL is live and indexable.",
      how: "Keep monitoring after deploys — a regression here silently deindexes pages.",
      evidence: `GET ${raw.finalUrl} → ${status}`,
    });
  }

  // HTTPS
  const requestedSecure = raw.requestedUrl.startsWith("https://");
  const finalSecure = raw.finalUrl.startsWith("https://");
  if (finalSecure) {
    out.push({
      id: "tech-https",
      category: "technical",
      status: "PASS",
      title: "Page is served over HTTPS",
      what: requestedSecure
        ? "Both the requested and final URLs use https://."
        : `The http:// request redirected to ${raw.finalUrl} (https).`,
      why: "HTTPS encrypts traffic in transit and is a baseline expectation for modern browsers and crawlers.",
      how: "HSTS (checked under Security) locks browsers into HTTPS after the first visit.",
      evidence: raw.finalUrl,
    });
  } else {
    out.push({
      id: "tech-https",
      category: "technical",
      status: "ERROR",
      title: "Page is not served over HTTPS",
      what: `Final URL is ${raw.finalUrl} (plain http).`,
      why: "Plain HTTP is flagged by browsers, breaks modern APIs, and is treated as untrustworthy.",
      how: "Install a TLS certificate and redirect all http:// traffic to https:// at the server or CDN.",
      evidence: raw.finalUrl,
    });
  }

  // Redirect chain
  if (raw.hops.length > 0) {
    const chain = raw.hops.map((h) => `${h.url} (${h.status})`).join(" → ") + ` → ${raw.finalUrl}`;
    if (raw.hops.length > 3) {
      out.push({
        id: "tech-redirect-chain",
        category: "technical",
        status: "WARNING",
        title: `Long redirect chain (${raw.hops.length} hops)`,
        what: `The URL chain has ${raw.hops.length} redirect(s) before reaching the final page.`,
        why: "Every hop adds latency and dilutes link equity; long chains are sometimes crawled only partially.",
        how: "Update internal links and canonicals to point directly at the final URL, and collapse chains to a single 301.",
        evidence: chain,
      });
    } else {
      out.push({
        id: "tech-redirect-chain",
        category: "technical",
        status: "PASS",
        title: `Redirect chain is short (${raw.hops.length} hop${raw.hops.length === 1 ? "" : "s"})`,
        what: `Chain: ${chain}.`,
        why: "Short, intentional redirects keep load times low and signals clean.",
        how: "Point internal links straight at the final destination.",
        evidence: chain,
      });
    }
  } else {
    out.push({
      id: "tech-redirect-chain",
      category: "technical",
      status: "PASS",
      title: "No redirects on the requested URL",
      what: `${raw.requestedUrl} resolved directly (no redirect hops).`,
      why: "A direct 200 is the ideal outcome — no extra round trips.",
      how: "Keep one canonical form (scheme + host + trailing slash) and link to it consistently.",
      evidence: raw.finalUrl,
    });
  }

  // robots.txt
  const r = raw.robots;
  if (r.error && r.status === null) {
    out.push({
      id: "tech-robots-txt",
      category: "technical",
      status: "ERROR",
      title: "robots.txt could not be fetched",
      what: `Fetching ${r.url} failed (${r.error}).`,
      why: "Crawlers treat an unreachable robots.txt as a soft failure and may back off crawling.",
      how: "Ensure https://yourdomain/robots.txt responds quickly with 200 (or a correct 404).",
      evidence: `error: ${r.error}`,
      fixTool: "robots-txt-generator",
    });
  } else if (r.status !== null && r.status >= 500) {
    out.push({
      id: "tech-robots-txt",
      category: "technical",
      status: "ERROR",
      title: `robots.txt returned HTTP ${r.status}`,
      what: `${r.url} → ${r.status}.`,
      why: "Server errors on robots.txt can halt crawling entirely on some engines.",
      how: "Fix the origin so robots.txt returns 200; a missing file should 404, not 5xx.",
      evidence: `${r.url} → ${r.status}`,
      fixTool: "robots-txt-generator",
    });
  } else if (r.status === 404 || r.status === 410) {
    out.push({
      id: "tech-robots-txt",
      category: "technical",
      status: "WARNING",
      title: "No robots.txt at the site root",
      what: `${r.url} returned ${r.status}.`,
      why: "A 404 robots.txt is valid (crawl everything), but you lose the ability to guide crawlers or publish a sitemap reference.",
      how: "Publish a robots.txt even if mostly permissive, and include your Sitemap: directive.",
      evidence: `${r.url} → ${r.status}`,
      fixTool: "robots-txt-generator",
    });
  } else if (r.status !== null && r.status < 400 && r.text !== null) {
    // Evaluate each user-agent group; the last matching group wins per the
    // robots.txt spec (a later `User-agent: *` overrides an earlier one).
    let disallowAll = false;
    let currentMatchesAll = false;
    let currentRules: string[] = [];
    const flush = () => {
      if (!currentMatchesAll && currentRules.length === 0) return;
      if (currentMatchesAll) {
        const hasDisallowRoot = currentRules.some((line) => /^disallow:\s*\/\s*$/i.test(line));
        const hasAllowPath = currentRules.some((line) => /^allow:\s*\//i.test(line));
        disallowAll = hasDisallowRoot && !hasAllowPath;
      }
    };
    for (const rawLine of r.text.split(/\r?\n/)) {
      const line = rawLine.replace(/#.*$/, "").trim();
      if (!line) continue;
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const field = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (field === "user-agent") {
        flush();
        currentMatchesAll = value === "*";
        currentRules = [];
      } else if (field === "allow" || field === "disallow") {
        currentRules.push(line);
      }
    }
    flush();
    if (disallowAll) {
      out.push({
        id: "tech-robots-txt",
        category: "technical",
        status: "ERROR",
        title: "robots.txt blocks all crawlers",
        what: "The * user-agent group contains `Disallow: /` with no Allow rule.",
        why: "This instructs every compliant crawler to skip the entire site — a critical pre-launch mistake.",
        how: "Remove the blanket Disallow (or scope it to private paths) before launching.",
        evidence: "User-agent: * → Disallow: /",
        fixTool: "robots-txt-generator",
      });
    } else {
      const sitemapLines = r.text.split(/\r?\n/).filter((l) => /^sitemap\s*:/i.test(l.trim()));
      out.push({
        id: "tech-robots-txt",
        category: "technical",
        status: "PASS",
        title: "robots.txt is reachable and permissive",
        what: `${r.url} → ${r.status}${sitemapLines.length ? `, ${sitemapLines.length} Sitemap directive(s)` : ""}.`,
        why: "A healthy robots.txt lets crawlers work efficiently without hitting private paths.",
        how: "Re-check after any deploy that touches rewrite rules at the domain root.",
        evidence: sitemapLines.slice(0, 3).join(" | ") || `${r.url} → ${r.status}`,
        fixTool: "robots-txt-generator",
      });
    }
  } else {
    out.push({
      id: "tech-robots-txt",
      category: "technical",
      status: "ERROR",
      title: "robots.txt returned an unexpected status",
      what: `${r.url} → ${r.status ?? r.error ?? "unknown"}.`,
      why: "Anomalous responses make crawler behavior unpredictable.",
      how: "Return 200 with valid directives, or a correct 404 when intentionally absent.",
      evidence: `${r.url} → ${r.status ?? r.error ?? "unknown"}`,
      fixTool: "robots-txt-generator",
    });
  }

  // Broken sampled links
  const linkSamples = raw.samples.filter((s) => s.kind === "link");
  const broken = linkSamples.filter(
    (s) => (s.status !== null && HTTP_4XX_5XX(s.status)) || (s.error && s.error !== "robots-disallowed")
  );
  const skipped = linkSamples.filter((s) => s.error === "robots-disallowed");
  if (linkSamples.length === 0) {
    out.push({
      id: "tech-broken-links",
      category: "technical",
      status: "NOT DETECTABLE",
      title: "No same-origin links available to sample",
      what: "The page HTML exposed no additional same-origin page links to check (or the page body was unavailable).",
      why: "Broken internal links are usually found by sampling outgoing links; with none present there is nothing to verify here.",
      how: "Ensure the page links to other pages on your site, then run the scan again.",
    });
  } else if (broken.length > 0) {
    out.push({
      id: "tech-broken-links",
      category: "technical",
      status: "ERROR",
      title: `${broken.length} broken sampled link${broken.length === 1 ? "" : "s"}`,
      what: `${broken.length} of ${linkSamples.length} sampled same-origin links failed (HTTP ≥ 400 or fetch error).`,
      why: "Broken internal links waste crawl budget, frustrate users, and weaken site quality signals.",
      how: "Fix the destinations, point them at live URLs, or remove/redirect the links.",
      evidence: broken
        .slice(0, 6)
        .map((s) => `${s.url} → ${s.status ?? s.error}`)
        .join(" | "),
    });
  } else {
    out.push({
      id: "tech-broken-links",
      category: "technical",
      status: "PASS",
      title: `Sampled links are healthy (${linkSamples.length} checked)`,
      what: `All ${linkSamples.length} sampled same-origin links returned non-4xx/5xx responses${skipped.length ? ` (${skipped.length} skipped by robots.txt)` : ""}.`,
      why: "Healthy internal links keep crawlers and users moving through the site.",
      how: "This is a bounded sample (up to 8 links) — run a full crawler for exhaustive coverage.",
      evidence: linkSamples.map((s) => `${s.url} → ${s.status ?? s.error ?? "?"}`).join(" | "),
    });
  }

  // Duplicate URL signals (canonical vs final vs og:url consistency handled in social;
  // here we flag obvious non-standard hosts / trailing-slash drift from the canonical)
  const canonicalEl = raw.page.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogUrlMatch = raw.page.html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  const finalNoSlash = raw.finalUrl.replace(/\/$/, "");
  const signals: string[] = [];
  if (canonicalEl?.[1]) {
    try {
      const c = new URL(canonicalEl[1], raw.finalUrl).toString().replace(/\/$/, "");
      if (c !== finalNoSlash) signals.push(`canonical: ${canonicalEl[1]}`);
    } catch {
      signals.push(`canonical unparseable: ${canonicalEl[1]}`);
    }
  }
  if (ogUrlMatch?.[1]) {
    try {
      const o = new URL(ogUrlMatch[1], raw.finalUrl).toString().replace(/\/$/, "");
      if (o !== finalNoSlash) signals.push(`og:url: ${ogUrlMatch[1]}`);
    } catch {
      /* ignore */
    }
  }
  if (raw.requestedUrl.replace(/\/$/, "") !== finalNoSlash && raw.hops.some((h) => h.status >= 300)) {
    signals.push(`requested: ${raw.requestedUrl}`);
  }
  if (signals.length > 0) {
    out.push({
      id: "tech-duplicate-urls",
      category: "technical",
      status: "WARNING",
      title: "URL signals are not fully aligned",
      what: "One or more URL signals (canonical, og:url, requested vs final) point at different addresses.",
      why: "Misaligned URL signals create near-duplicate entries and split ranking signals across variants.",
      how: "Pick one preferred URL form and align canonical, og:url, sitemap entries and internal links to it.",
      evidence: signals.join(" | "),
      fixTool: "canonical-url-generator",
    });
  } else {
    out.push({
      id: "tech-duplicate-urls",
      category: "technical",
      status: "PASS",
      title: "URL signals are aligned",
      what: "Requested URL, final URL, canonical (when present) and og:url (when present) agree.",
      why: "Consistent URLs avoid duplicate-content splitting.",
      how: "Maintain a single preferred host and trailing-slash policy site-wide.",
      evidence: `final: ${raw.finalUrl}`,
    });
  }

  return out;
}
