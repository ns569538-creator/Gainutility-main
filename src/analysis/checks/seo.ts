/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * On-page SEO checks: title, description, H1, canonical, robots meta,
 * sitemap presence, hreflang and structured data.
 */

import type { Finding, RawSignals } from "../types";

const TITLE_MAX = 60;
const DESC_MAX = 160;

export function runSeoChecks(raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];

  // Title
  const title = (doc.querySelector("title")?.textContent ?? "").trim();
  if (!title) {
    out.push({
      id: "seo-title",
      category: "seo",
      status: "ERROR",
      title: "Missing page title",
      what: "The HTML has no <title> element (or it is empty).",
      why: "The title is the primary snippet search engines show and a strong relevance signal.",
      how: "Add a unique, descriptive <title> (roughly 50–60 characters) inside <head>.",
      fixTool: "seo-meta-generator",
    });
  } else if (title.length > TITLE_MAX + 15) {
    out.push({
      id: "seo-title",
      category: "seo",
      status: "WARNING",
      title: "Title is longer than typical SERP display",
      what: `Title is ${title.length} characters: "${title}".`,
      why: "Search engines truncate long titles in results, which can cut off key words.",
      how: `Aim for about ${TITLE_MAX} characters and put the most important words first.`,
      evidence: title,
      fixTool: "google-serp-preview",
    });
  } else {
    out.push({
      id: "seo-title",
      category: "seo",
      status: "PASS",
      title: "Page title present",
      what: `Title found (${title.length} characters).`,
      why: "A clear title helps search engines and social platforms label the page.",
      how: "Keep each page's title unique across your site.",
      evidence: title,
    });
  }

  // Meta description
  const desc = (doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "").trim();
  if (!desc) {
    out.push({
      id: "seo-description",
      category: "seo",
      status: "WARNING",
      title: "Missing meta description",
      what: "No <meta name=\"description\"> tag was found.",
      why: "Without one, search engines invent a snippet from page text, which is often less compelling.",
      how: "Write a unique 140–160 character summary of the page's promise.",
      fixTool: "seo-meta-generator",
    });
  } else if (desc.length > DESC_MAX + 20) {
    out.push({
      id: "seo-description",
      category: "seo",
      status: "WARNING",
      title: "Meta description is very long",
      what: `Description is ${desc.length} characters.`,
      why: "Long descriptions get truncated in search results.",
      how: `Trim to roughly ${DESC_MAX} characters and keep the call to action early.`,
      evidence: desc.slice(0, 200),
      fixTool: "google-serp-preview",
    });
  } else {
    out.push({
      id: "seo-description",
      category: "seo",
      status: "PASS",
      title: "Meta description present",
      what: `Description found (${desc.length} characters).`,
      why: "A written description controls how the page is summarized in search results.",
      how: "Keep it unique per page.",
      evidence: desc,
    });
  }

  // H1
  const h1s = Array.from(doc.querySelectorAll("h1"));
  if (h1s.length === 0) {
    out.push({
      id: "seo-h1",
      category: "seo",
      status: "WARNING",
      title: "No H1 heading",
      what: "The page has no <h1> element.",
      why: "The H1 states the page's main topic for users and assistive technology.",
      how: "Add one clear H1 that matches the page's intent.",
    });
  } else if (h1s.length > 1) {
    out.push({
      id: "seo-h1",
      category: "seo",
      status: "WARNING",
      title: `Multiple H1 headings (${h1s.length})`,
      what: `The page has ${h1s.length} <h1> elements.`,
      why: "Multiple H1s dilute the main topic and can confuse screen-reader navigation.",
      how: "Keep one H1 for the page headline and demote the others to H2.",
      evidence: h1s.slice(0, 3).map((h) => (h.textContent ?? "").trim().slice(0, 80)).join(" | "),
    });
  } else {
    out.push({
      id: "seo-h1",
      category: "seo",
      status: "PASS",
      title: "Single H1 heading present",
      what: "Exactly one H1 was found.",
      why: "One clear top-level heading makes the page structure unambiguous.",
      how: "Keep the H1 aligned with the title and the page's search intent.",
      evidence: (h1s[0].textContent ?? "").trim().slice(0, 120),
    });
  }

  // Canonical
  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const canonical = (canonicalEl?.getAttribute("href") ?? "").trim();
  if (!canonical) {
    out.push({
      id: "seo-canonical",
      category: "seo",
      status: "WARNING",
      title: "Missing canonical tag",
      what: "No <link rel=\"canonical\"> was found.",
      why: "Without a canonical, near-duplicate URLs (trailing slash, query params) can split signals.",
      how: "Point a self-referencing canonical at the preferred URL of this page.",
      fixTool: "canonical-url-generator",
    });
  } else {
    let canonicalAbs = canonical;
    try {
      canonicalAbs = new URL(canonical, raw.finalUrl).toString();
    } catch {
      /* keep raw */
    }
    const norm = (u: string): string => {
      try {
        const parsed = new URL(u);
        parsed.hash = "";
        const path = parsed.pathname.length > 1 && parsed.pathname.endsWith("/")
          ? parsed.pathname.slice(0, -1)
          : parsed.pathname;
        return `${parsed.origin}${path}${parsed.search}`;
      } catch {
        return u;
      }
    };
    if (norm(canonicalAbs) !== norm(raw.finalUrl)) {
      out.push({
        id: "seo-canonical",
        category: "seo",
        status: "WARNING",
        title: "Canonical points to a different URL",
        what: `Canonical is ${canonicalAbs} but this scan finished at ${raw.finalUrl}.`,
        why: "A cross canonical consolidates signals elsewhere — fine only if intentional (e.g. pagination or a preferred www/non-www host).",
        how: "Confirm this is the preferred URL. If the scanned URL is the preferred one, make the canonical self-referencing.",
        evidence: `canonical: ${canonicalAbs}`,
        fixTool: "canonical-url-generator",
      });
    } else {
      out.push({
        id: "seo-canonical",
        category: "seo",
        status: "PASS",
        title: "Self-referencing canonical present",
        what: `Canonical matches the final URL (${canonicalAbs}).`,
        why: "A self-canonical guards against duplicate-URL indexing.",
        how: "Keep the canonical in sync whenever the URL structure changes.",
        evidence: canonicalAbs,
      });
    }
  }

  // Robots meta
  const robotsMeta = (doc.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "").toLowerCase();
  const googleBotMeta = (doc.querySelector('meta[name="googlebot"]')?.getAttribute("content") ?? "").toLowerCase();
  const robotsContent = `${robotsMeta} ${googleBotMeta}`;
  if (/\bnoindex\b/.test(robotsContent)) {
    out.push({
      id: "seo-robots-noindex",
      category: "seo",
      status: "ERROR",
      title: "Page is set to noindex",
      what: `Meta robots content: "${(robotsMeta || googleBotMeta).trim()}".`,
      why: "noindex tells search engines not to include this page — a launch blocker if unintentional.",
      how: "Remove the noindex directive when you want the page indexed, or keep it for staging/private pages.",
      evidence: (robotsMeta || googleBotMeta).trim(),
    });
  } else if (/\bnofollow\b/.test(robotsContent)) {
    out.push({
      id: "seo-robots-noindex",
      category: "seo",
      status: "WARNING",
      title: "Page links are marked nofollow",
      what: `Meta robots content: "${(robotsMeta || googleBotMeta).trim()}".`,
      why: "nofollow on the whole page tells engines not to trust any outbound links on it.",
      how: "Remove the page-level nofollow unless you have a specific reason to suppress all links.",
      evidence: (robotsMeta || googleBotMeta).trim(),
    });
  } else if (robotsMeta || googleBotMeta) {
    out.push({
      id: "seo-robots-noindex",
      category: "seo",
      status: "PASS",
      title: "Robots meta allows indexing",
      what: `Meta robots content: "${(robotsMeta || googleBotMeta).trim()}".`,
      why: "An indexable directive lets search engines include the page.",
      how: "Review staging pages too — make sure they carry noindex until launch.",
      evidence: (robotsMeta || googleBotMeta).trim(),
    });
  } else {
    out.push({
      id: "seo-robots-noindex",
      category: "seo",
      status: "PASS",
      title: "No restrictive robots meta (indexing allowed)",
      what: "No meta robots/googlebot tag was found, so default indexing applies.",
      why: "Default behavior lets search engines crawl and index the page.",
      how: "Add <meta name=\"robots\" content=\"noindex\"> temporarily while a page is in staging.",
    });
  }

  // Sitemap
  const sm = raw.sitemap;
  if (sm.error && sm.status === null) {
    out.push({
      id: "seo-sitemap",
      category: "seo",
      status: "ERROR",
      title: "Sitemap could not be fetched",
      what: `Fetching ${sm.url ?? "/sitemap.xml"} failed (${sm.error}).`,
      why: "Search engines rely on the sitemap to discover pages.",
      how: "Verify the sitemap URL responds with 200 and valid XML.",
      evidence: `error: ${sm.error}`,
      fixTool: "xml-sitemap-generator",
    });
  } else if (sm.status === 404 || sm.status === 410) {
    out.push({
      id: "seo-sitemap",
      category: "seo",
      status: "WARNING",
      title: "No sitemap at the default location",
      what: `${sm.url ?? "/sitemap.xml"} returned ${sm.status}${sm.declaredBy === "robots" ? " (declared in robots.txt)" : ""}.`,
      why: "A sitemap is the most reliable discovery channel for new or deep pages.",
      how: "Publish an XML sitemap at your site root and reference it from robots.txt.",
      evidence: `${sm.url ?? "/sitemap.xml"} → ${sm.status}`,
      fixTool: "xml-sitemap-generator",
    });
  } else if (sm.status !== null && sm.status < 400) {
    if ((sm.urlCount ?? 0) === 0) {
      out.push({
        id: "seo-sitemap",
        category: "seo",
        status: "WARNING",
        title: "Sitemap fetched but contains no URLs",
        what: `${sm.url} returned ${sm.status} with 0 <loc> entries.`,
        why: "An empty sitemap gives crawlers nothing to discover.",
        how: "Regenerate the sitemap with your real page URLs and resubmit it.",
        evidence: `${sm.url} → ${sm.status}, 0 <loc>`,
        fixTool: "xml-sitemap-generator",
      });
    } else {
      out.push({
        id: "seo-sitemap",
        category: "seo",
        status: "PASS",
        title: "XML sitemap found",
        what: `${sm.url} returned ${sm.status} with ${sm.urlCount} URL entry/entries${sm.declaredBy === "robots" ? " (declared in robots.txt)" : ""}.`,
        why: "A working sitemap helps engines find and recrawl pages.",
        how: "Keep it updated on every publish and resubmit major changes in Search Console.",
        evidence: `${sm.url} → ${sm.status}, ${sm.urlCount} <loc>`,
      });
    }
  } else {
    out.push({
      id: "seo-sitemap",
      category: "seo",
      status: "ERROR",
      title: "Sitemap returned an error status",
      what: `${sm.url ?? "/sitemap.xml"} returned ${sm.status ?? "no status"}${sm.error ? ` (${sm.error})` : ""}.`,
      why: "A broken sitemap blocks automated discovery of your pages.",
      how: "Fix the sitemap route so it returns 200 with valid XML.",
      evidence: `${sm.url ?? "/sitemap.xml"} → ${sm.status ?? sm.error ?? "unknown"}`,
      fixTool: "xml-sitemap-generator",
    });
  }

  // robots.txt Sitemap directive (when robots.txt exists)
  if (raw.robots.status !== null && raw.robots.status < 400 && raw.robots.text !== null) {
    const hasSitemapDirective = /^sitemap\s*:/im.test(raw.robots.text);
    if (hasSitemapDirective) {
      out.push({
        id: "seo-robots-sitemap-directive",
        category: "seo",
        status: "PASS",
        title: "robots.txt references a sitemap",
        what: "At least one Sitemap: directive is present in robots.txt.",
        why: "The directive gives crawlers a canonical discovery path even if /sitemap.xml guessing fails.",
        how: "Keep the directive pointing at your current sitemap URL.",
      });
    } else {
      out.push({
        id: "seo-robots-sitemap-directive",
        category: "seo",
        status: "WARNING",
        title: "robots.txt has no Sitemap directive",
        what: "robots.txt exists but does not list any Sitemap: URL.",
        why: "Engines may still guess /sitemap.xml, but the explicit directive removes ambiguity.",
        how: "Add a line like `Sitemap: https://example.com/sitemap.xml` to robots.txt.",
        fixTool: "robots-txt-generator",
      });
    }
  }

  // Hreflang
  const hreflangs = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'));
  if (hreflangs.length > 0) {
    const missingHref = hreflangs.filter((l) => !(l.getAttribute("href") ?? "").trim());
    const selfRef = hreflangs.some((l) => {
      const lang = (l.getAttribute("hreflang") ?? "").toLowerCase();
      if (lang === "x-default") return false;
      try {
        return new URL(l.getAttribute("href") ?? "", raw.finalUrl).toString() === raw.finalUrl;
      } catch {
        return false;
      }
    });
    if (missingHref.length > 0) {
      out.push({
        id: "seo-hreflang",
        category: "seo",
        status: "ERROR",
        title: "hreflang tag without an href",
        what: `${missingHref.length} hreflang link tag(s) are missing an href attribute.`,
        why: "Incomplete alternates are ignored by engines and can waste crawl signals.",
        how: "Give every hreflang tag a full absolute URL, or remove the incomplete tags.",
        fixTool: "hreflang-tag-generator",
      });
    } else if (!selfRef) {
      out.push({
        id: "seo-hreflang",
        category: "seo",
        status: "WARNING",
        title: "hreflang set lacks a self-reference",
        what: `${hreflangs.length} hreflang alternate(s) found, but none points back at this exact URL.`,
        why: "Google's guidance requires each language variant to reference itself in the cluster.",
        how: "Add a self-referencing hreflang entry for this page's own URL and language.",
        evidence: hreflangs.slice(0, 5).map((l) => `${l.getAttribute("hreflang")}: ${l.getAttribute("href")}`).join(" | "),
        fixTool: "hreflang-tag-generator",
      });
    } else {
      out.push({
        id: "seo-hreflang",
        category: "seo",
        status: "PASS",
        title: "hreflang alternates look complete",
        what: `${hreflangs.length} hreflang alternate(s) found with hrefs, including a self-reference.`,
        why: "A complete reciprocal cluster routes regional visitors to the right language version.",
        how: "Verify each listed variant links back to this page.",
        evidence: hreflangs.slice(0, 5).map((l) => `${l.getAttribute("hreflang")}: ${l.getAttribute("href")}`).join(" | "),
      });
    }
  } else {
    out.push({
      id: "seo-hreflang",
      category: "seo",
      status: "NOT DETECTABLE",
      title: "hreflang cluster not verified",
      what: "No hreflang alternate tags were found on this page.",
      why: "If the site publishes multiple languages or regions, engines need a reciprocal hreflang cluster to route them — a single-page fetch cannot confirm cluster health across variants.",
      how: "If you ship localized versions, add hreflang alternates with a self-reference on every variant; run this check again on each language URL.",
      fixTool: "hreflang-tag-generator",
    });
  }

  // Structured data
  const ldJson = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  if (ldJson.length === 0) {
    out.push({
      id: "seo-structured-data",
      category: "seo",
      status: "WARNING",
      title: "No JSON-LD structured data found",
      what: "The page has no <script type=\"application/ld+json\"> blocks.",
      why: "Structured data powers rich results (breadcrumbs, FAQs, products) and clearer entity understanding.",
      how: "Add relevant JSON-LD (Organization, WebSite, Article, Product, or FAQPage) for this page type.",
      fixTool: "schema-markup-generator",
    });
  } else {
    let parsed = 0;
    let failed = 0;
    let types: string[] = [];
    for (const block of ldJson) {
      try {
        const data = JSON.parse(block.textContent ?? "");
        const arr = Array.isArray(data) ? data : [data];
        for (const item of arr) {
          if (item && typeof item === "object" && item["@type"]) {
            parsed++;
            const t = Array.isArray(item["@type"]) ? item["@type"].join(",") : String(item["@type"]);
            types.push(t);
          }
        }
      } catch {
        failed++;
      }
    }
    if (failed > 0 && parsed === 0) {
      out.push({
        id: "seo-structured-data",
        category: "seo",
        status: "ERROR",
        title: "JSON-LD blocks failed to parse",
        what: `${failed} JSON-LD script block(s) contain invalid JSON.`,
        why: "Invalid JSON-LD is dropped by search engines — the markup has no effect.",
        how: "Fix the JSON syntax (trailing commas, unquoted keys, smart quotes) in the script block.",
        fixTool: "schema-markup-generator",
      });
    } else {
      out.push({
        id: "seo-structured-data",
        category: "seo",
        status: "PASS",
        title: "JSON-LD structured data present",
        what: `${parsed} structured object(s) parsed successfully${failed ? `, ${failed} invalid block(s) ignored` : ""}.`,
        why: "Valid JSON-LD helps engines understand the page and can enable rich results.",
        how: "Validate new schema types in a rich-results tester before launch.",
        evidence: types.slice(0, 6).join(", "),
        fixTool: "schema-markup-generator",
      });
    }
  }

  return out;
}
