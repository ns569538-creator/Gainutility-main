/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Security header checks: HTTPS, HSTS, CSP, X-Content-Type-Options,
 * Referrer-Policy, Permissions-Policy, mixed content and cookie flags.
 * Cookies are reported by name and flags only — never values.
 */

import type { Finding, RawSignals } from "../types";

const STARTER_CSP = [
  "default-src 'self';",
  "script-src 'self' 'unsafe-inline' https:;",
  "style-src 'self' 'unsafe-inline';",
  "img-src 'self' data: https:;",
  "font-src 'self' data:;",
  "connect-src 'self' https:;",
  "frame-ancestors 'self';",
  "base-uri 'self';",
  "form-action 'self';",
].join(" ");

function parseSetCookieNamesFlags(rawHeader: string | undefined): { name: string; flags: string[] }[] {
  if (!rawHeader) return [];
  // Multiple Set-Cookie headers may be joined — split conservatively.
  const parts = rawHeader.split(/\n|,(?=[^;,]+=)/);
  const out: { name: string; flags: string[] }[] = [];
  for (const part of parts) {
    const segs = part.split(";");
    const first = segs[0]?.trim() ?? "";
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    if (!name) continue;
    const flags = segs
      .slice(1)
      .map((s) => s.trim())
      .filter((s) => /^(secure|httponly|samesite=.+)$/i.test(s))
      .map((s) => s.toLowerCase());
    out.push({ name, flags });
  }
  return out;
}

export function runSecurityChecks(raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];
  const h = raw.page.headers;
  const secure = raw.finalUrl.startsWith("https://");

  // HTTPS
  if (secure) {
    out.push({
      id: "sec-https",
      category: "security",
      status: "PASS",
      title: "Served over HTTPS",
      what: `Final URL is ${raw.finalUrl}.`,
      why: "HTTPS prevents eavesdropping and tampering in transit.",
      how: "Redirect all HTTP traffic to HTTPS and keep certificates auto-renewed.",
      evidence: raw.finalUrl,
    });
  } else {
    out.push({
      id: "sec-https",
      category: "security",
      status: "ERROR",
      title: "Not served over HTTPS",
      what: `Final URL is ${raw.finalUrl} (http).`,
      why: "Plain HTTP exposes users to interception and is blocked by modern browser features.",
      how: "Install TLS and 301-redirect http:// → https:// site-wide.",
      evidence: raw.finalUrl,
    });
  }

  // HSTS
  const hsts = h["strict-transport-security"];
  if (secure) {
    if (hsts) {
      const maxAge = /max-age=(\d+)/i.exec(hsts);
      const days = maxAge ? Math.floor(Number(maxAge[1]) / 86400) : null;
      if (days !== null && days < 180) {
        out.push({
          id: "sec-hsts",
          category: "security",
          status: "WARNING",
          title: `HSTS max-age is short (${days} day${days === 1 ? "" : "s"})`,
          what: `strict-transport-security: ${hsts}.`,
          why: "A short max-age means browsers quickly forget to force HTTPS, reopening downgrade windows.",
          how: "Raise max-age to at least 31536000 (1 year); add includeSubDomains once all subdomains are HTTPS.",
          evidence: hsts,
        });
      } else {
        out.push({
          id: "sec-hsts",
          category: "security",
          status: "PASS",
          title: "HSTS enabled",
          what: `strict-transport-security: ${hsts}.`,
          why: "HSTS tells browsers to only use HTTPS for this host, defeating protocol-downgrade attacks.",
          how: "Consider preload registration after confirming subdomain coverage.",
          evidence: hsts,
        });
      }
    } else {
      out.push({
        id: "sec-hsts",
        category: "security",
        status: "WARNING",
        title: "No Strict-Transport-Security header",
        what: "The HTTPS response omits strict-transport-security.",
        why: "Without HSTS, the first visit (and any user typing http://) can still be downgraded before the redirect.",
        how: 'Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` at the server/CDN.',
        evidence: "strict-transport-security: (absent)",
      });
    }
  }

  // CSP
  const csp = h["content-security-policy"];
  if (csp) {
    const hasFrameAncestors = /frame-ancestors/i.test(csp);
    if (!hasFrameAncestors) {
      out.push({
        id: "sec-csp",
        category: "security",
        status: "WARNING",
        title: "CSP present but missing frame-ancestors",
        what: `content-security-policy: ${csp.slice(0, 160)}… (no frame-ancestors directive).`,
        why: "frame-ancestors replaces X-Frame-Options and prevents clickjacking by untrusted embeds.",
        how: "Add `frame-ancestors 'self'` (or a specific allowlist) to the policy.",
        evidence: csp.slice(0, 200),
      });
    } else {
      out.push({
        id: "sec-csp",
        category: "security",
        status: "PASS",
        title: "Content-Security-Policy present",
        what: `content-security-policy: ${csp.slice(0, 160)}${csp.length > 160 ? "…" : ""}.`,
        why: "A CSP limits where scripts, styles and frames can load from, mitigating XSS and data injection.",
        how: "Tighten directives over time (drop 'unsafe-inline' for scripts via nonces/hashes).",
        evidence: csp.slice(0, 200),
      });
    }
  } else {
    out.push({
      id: "sec-csp",
      category: "security",
      status: "WARNING",
      title: "No Content-Security-Policy header",
      what: "The response omits content-security-policy.",
      why: "Without a CSP, injected scripts can load and execute from anywhere — a key XSS mitigation is missing.",
      how: "Start with a report-only policy, then enforce. Starter snippet below (adjust origins to your needs).",
      copyText: `Content-Security-Policy: ${STARTER_CSP}`,
      evidence: "content-security-policy: (absent)",
    });
  }

  // X-Content-Type-Options
  const xcto = h["x-content-type-options"];
  if (xcto && /nosniff/i.test(xcto)) {
    out.push({
      id: "sec-nosniff",
      category: "security",
      status: "PASS",
      title: "X-Content-Type-Options: nosniff",
      what: `x-content-type-options: ${xcto}.`,
      why: "nosniff stops browsers from MIME-sniffing responses, preventing style/script type confusion attacks.",
      how: "Keep the header on every response type.",
      evidence: xcto,
    });
  } else {
    out.push({
      id: "sec-nosniff",
      category: "security",
      status: "WARNING",
      title: "Missing X-Content-Type-Options: nosniff",
      what: `x-content-type-options: ${xcto ?? "(absent)"}.`,
      why: "Browsers may guess response types, which can upgrade a download into executable content.",
      how: "Add `X-Content-Type-Options: nosniff` to all responses.",
      evidence: `x-content-type-options: ${xcto ?? "(absent)"}`,
    });
  }

  // Referrer-Policy
  const referrer = h["referrer-policy"];
  if (referrer) {
    out.push({
      id: "sec-referrer",
      category: "security",
      status: "PASS",
      title: "Referrer-Policy set",
      what: `referrer-policy: ${referrer}.`,
      why: "Referrer policy controls how much URL information leaks to third-party origins.",
      how: "strict-origin-when-cross-origin is the modern default; tighten further for sensitive paths.",
      evidence: referrer,
    });
  } else {
    out.push({
      id: "sec-referrer",
      category: "security",
      status: "WARNING",
      title: "No Referrer-Policy header",
      what: "The response omits referrer-policy.",
      why: "Full URLs (with tokens/ids) may leak to every linked third party.",
      how: "Add `Referrer-Policy: strict-origin-when-cross-origin`.",
      evidence: "referrer-policy: (absent)",
    });
  }

  // Permissions-Policy
  const permissions = h["permissions-policy"];
  if (permissions) {
    out.push({
      id: "sec-permissions",
      category: "security",
      status: "PASS",
      title: "Permissions-Policy set",
      what: `permissions-policy: ${permissions.slice(0, 160)}${permissions.length > 160 ? "…" : ""}.`,
      why: "Permissions-Policy disables powerful browser features (camera, mic, geolocation) the page does not need.",
      how: "Audit the allowlist whenever you add features that need a new capability.",
      evidence: permissions.slice(0, 200),
    });
  } else {
    out.push({
      id: "sec-permissions",
      category: "security",
      status: "WARNING",
      title: "No Permissions-Policy header",
      what: "The response omits permissions-policy.",
      why: "Powerful APIs (camera, microphone, payment) remain available to any script that asks.",
      how: "Add a Permissions-Policy that denies features you never use (e.g. `camera=(), microphone=()`).",
      evidence: "permissions-policy: (absent)",
    });
  }

  // Mixed content
  if (secure) {
    const mixedActive: string[] = [];
    const mixedPassive: string[] = [];
    for (const el of Array.from(doc.querySelectorAll("[src]"))) {
      const src = el.getAttribute("src") ?? "";
      if (!/^http:\/\//i.test(src)) continue;
      const tag = el.tagName.toLowerCase();
      const isScript = tag === "script";
      const isLinkStyle =
        tag === "link" && /stylesheet/i.test(el.getAttribute("rel") ?? "");
      const isImg = tag === "img" || tag === "iframe" || tag === "source" || tag === "video" || tag === "audio";
      if (isScript || isLinkStyle) mixedActive.push(src);
      else if (isImg) mixedPassive.push(src);
      else mixedActive.push(src);
    }
    for (const a of Array.from(doc.querySelectorAll("a[href]"))) {
      const href = a.getAttribute("href") ?? "";
      // Navigational http links are not mixed content (browser upgrades/downgrades fine) — skip.
      void href;
    }
    if (mixedActive.length > 0) {
      out.push({
        id: "sec-mixed-content",
        category: "security",
        status: "ERROR",
        title: `Active mixed content (${mixedActive.length} resource${mixedActive.length === 1 ? "" : "s"})`,
        what: `The HTTPS page loads scripts/styles over plain http: — e.g. ${mixedActive.slice(0, 3).join(", ")}.`,
        why: "Browsers block active mixed content outright, breaking features; it also exposes users to tampering.",
        how: "Change these URLs to https:// (or protocol-relative //host/…) and redeploy.",
        evidence: mixedActive.slice(0, 6).join(" | "),
        fixTool: "canonical-url-generator",
      });
    } else if (mixedPassive.length > 0) {
      out.push({
        id: "sec-mixed-content",
        category: "security",
        status: "WARNING",
        title: `Passive mixed content (${mixedPassive.length} resource${mixedPassive.length === 1 ? "" : "s"})`,
        what: `Images/media load over plain http: — e.g. ${mixedPassive.slice(0, 3).join(", ")}.`,
        why: "Browsers downgrade or block insecure images on HTTPS pages, leaving broken visuals.",
        how: "Serve all images and media over https://.",
        evidence: mixedPassive.slice(0, 6).join(" | "),
      });
    } else {
      out.push({
        id: "sec-mixed-content",
        category: "security",
        status: "PASS",
        title: "No mixed content detected",
        what: "No http:// subresources were found in the fetched HTML of this HTTPS page.",
        why: "Consistent HTTPS subresources avoid browser blocks and mixed-content warnings.",
        how: "Re-check after adding third-party embeds or CDN assets.",
        evidence: raw.finalUrl,
      });
    }
  } else {
    out.push({
      id: "sec-mixed-content",
      category: "security",
      status: "NOT DETECTABLE",
      title: "Mixed content not applicable (page is HTTP)",
      what: "The final page is served over plain HTTP, so mixed-content rules do not apply.",
      why: "Mixed content only exists when a secure page loads insecure resources.",
      how: "Move the site to HTTPS first, then re-run this check.",
    });
  }

  // Cookie flags (names + flags only, never values)
  const setCookie = h["set-cookie"];
  const cookies = parseSetCookieNamesFlags(setCookie);
  if (cookies.length === 0) {
    out.push({
      id: "sec-cookies",
      category: "security",
      status: "NOT DETECTABLE",
      title: "No Set-Cookie header observed",
      what: "The fetched response did not include Set-Cookie (cookies may be set by JS or on other routes).",
      why: "Session and auth cookies should carry Secure, HttpOnly and SameSite — but none were visible here.",
      how: "If this app sets cookies client-side, verify flags in browser DevTools → Application → Cookies.",
    });
  } else {
    const flagged = cookies.filter((c) => {
      const lower = c.flags.join(" ");
      return /secure/.test(lower) && /httponly/.test(lower) && /samesite/.test(lower);
    });
    const risky = cookies.filter((c) => !flagged.includes(c));
    if (risky.length > 0) {
      out.push({
        id: "sec-cookies",
        category: "security",
        status: "WARNING",
        title: `${risky.length} cookie${risky.length === 1 ? "" : "s"} missing security flags`,
        what: `Cookies without full Secure+HttpOnly+SameSite flags: ${risky.map((c) => `${c.name} [${c.flags.join(", ") || "no flags"}]`).join(", ")}. (Values are never shown.)`,
        why: "Cookies without Secure can travel over HTTP; without HttpOnly they are readable by scripts (XSS); without SameSite they are sent cross-site (CSRF).",
        how: "Set Secure; HttpOnly; SameSite=Lax (or Strict) on every non-essential cookie. (Flag names only — values are not displayed.)",
        evidence: risky.slice(0, 5).map((c) => `${c.name}: ${c.flags.join(", ") || "(none)"}`).join(" | "),
      });
    } else {
      out.push({
        id: "sec-cookies",
        category: "security",
        status: "PASS",
        title: `All ${cookies.length} observed cookie${cookies.length === 1 ? "" : "s"} carry Secure, HttpOnly and SameSite`,
        what: `Flags verified for: ${cookies.map((c) => c.name).join(", ")}. (Values are never shown.)`,
        why: "Proper flags protect cookies from interception, script access and cross-site sending.",
        how: "Keep the same flags when renaming or adding cookies.",
        evidence: cookies.slice(0, 5).map((c) => `${c.name}: ${c.flags.join(", ")}`).join(" | "),
      });
    }
  }

  return out;
}
