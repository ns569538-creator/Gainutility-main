/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for the Website Studio tools (Check My Website and Launch
 * Checklist). Titles/descriptions are exactly the approved metadata; both
 * tools disclose the server-side fetch in privacyExplanation.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const FETCH_PRIVACY =
  "When you run a scan, the URL you enter is sent to GainUtility's server, which fetches the public page, robots.txt, sitemap and a bounded sample of same-origin links (up to 8 links and 6 assets) to build the report. Your URL and the fetched public content are processed for the request and not stored. Private, loopback and non-standard-port addresses are blocked server-side, and scans are rate-limited per network.";

const SCAN_LIMITATIONS = [
  "Core Web Vitals (LCP, INP, CLS), colour contrast and full WCAG conformance require a rendered page or lab audit — they are reported as Not detectable, never as scores.",
  "Link and asset checks cover a bounded same-origin sample (up to 8 links, 6 assets), not a full crawl.",
  "The engine reads static HTML only; client-rendered content injected after load is not visible to the scan.",
  "Fetches run from GainUtility's servers — results can differ from a visitor's country or network (geo-blocking, bot protection).",
];

export const WEBSITE_STUDIO_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "check-my-website": {
    title: "Check My Website — Free Website Health Checker | GainUtility",
    description:
      "Check your website for SEO, technical, accessibility, security, social and performance signals. Get clear findings, explanations and practical fixes.",
    intro:
      "Paste any public URL and get a single, honest report: what passed, what needs attention, and what simply cannot be measured from a static fetch — with a plain-English fix for every finding.",
    steps: [
      "Enter the full URL you want to check (https:// is added automatically if missing).",
      "Click “Check my website” — the server fetches the page, robots.txt and sitemap, then samples a bounded set of same-origin links.",
      "Review the summary, then expand any finding for the evidence, why it matters and how to fix it.",
      "Jump to a related GainUtility tool from findings that have one, fix the issue, and re-scan.",
    ],
    whatText:
      "Check My Website fetches your page through GainUtility's server and runs one shared analysis engine across seven categories: SEO (title, description, H1, canonical, robots meta, sitemap, hreflang, structured data), technical (HTTP status, HTTPS, redirect chain, robots.txt, broken sampled links, URL-signal alignment), social (Open Graph and Twitter card tags), images (alt text, dimensions, size, formats, lazy loading), accessibility (landmarks, headings, link/button names, form labels), performance (document size, compression, caching, render-blocking scripts) and security (HSTS, CSP, nosniff, referrer and permissions policies, mixed content, cookie flags).",
    whyText:
      "A broken title, a stray noindex, or a blocked robots.txt can silently keep your site out of search — and you rarely find out until traffic drops. Running one scan before you ship (or after a deploy) surfaces these issues with evidence attached, instead of guessing which of a dozen checklists applies to your stack.",
    features: [
      "One fetch, seven categories — SEO, technical, social, images, accessibility, performance and security",
      "Every finding shows status, what was found, why it matters, how to fix it and the technical evidence",
      "Honest Not detectable labels for Core Web Vitals, contrast and WCAG instead of invented scores",
      "Redirect chain, robots.txt, sitemap and bounded link sample shown as raw details",
      "Server-side SSRF guards: private, loopback and non-standard-port targets are blocked",
    ],
    limitations: SCAN_LIMITATIONS,
    privacyExplanation: FETCH_PRIVACY,
    mistakes: [
      "Treating “Not detectable” as a pass — it means the check needs a rendered-page or lab audit, not that the site is fine.",
      "Ignoring the sample size — 8 links is a smoke test, not a full-site crawl.",
      "Scanning a staging URL behind auth or IP allowlists and assuming the errors are real production issues.",
      "Fixing a warning without re-scanning — fixes only count once the scan sees them.",
    ],
    troubleshooting: [
      "The scan says the address was blocked? Private, loopback and non-standard-port targets are rejected on purpose — try the public URL.",
      "DNS or TLS errors? The hostname or certificate is unreachable from our servers; verify it resolves publicly first.",
      "Rate-limited? Scans are limited per network — wait a minute and run it again.",
    ],
    faqs: [
      {
        question: "Is Check My Website free to use?",
        answer:
          "Yes. Enter a public URL and run the scan — no account or sign-up is required for the checks shown here.",
      },
      {
        question: "Does this tool give my site an SEO score?",
        answer:
          "No. It reports each check as Pass, Warning, Error or Not detectable with the evidence behind it. Aggregate scores hide which specific fix matters most, so this tool does not invent one.",
      },
      {
        question: "Can it check Core Web Vitals or colour contrast?",
        answer:
          "Not from a static fetch. LCP, INP, CLS and contrast ratios need a rendered page or lab audit, so those checks are labelled Not detectable rather than estimated.",
      },
      {
        question: "Is my scanned URL stored?",
        answer:
          "The URL and the fetched public content are processed to build the report and are not stored. The scan runs on GainUtility's server with rate limiting, and private or loopback addresses are blocked.",
      },
      {
        question: "Why does only a sample of links get checked?",
        answer:
          "To stay fast and respectful of other sites, the engine samples up to 8 same-origin page links and 6 assets after honoring robots.txt. It is a smoke test for broken links, not a full crawl.",
      },
      {
        question: "How is this different from the Launch Checklist?",
        answer:
          "Both tools run the exact same scan and engine. Check My Website presents findings as an explorer-style report by severity; Launch Checklist regroups the same findings into critical, important and optional pre-launch gates.",
      },
    ],
    related: ["launch-checklist", "seo-meta-generator", "robots-txt-generator", "xml-sitemap-generator", "contrast-checker"],
  },
  "launch-checklist": {
    title: "Website Launch Checklist — Check Before Launch | GainUtility",
    description:
      "Run a practical website launch checklist before going live. Check SEO, metadata, robots.txt, sitemap, links, accessibility signals and technical setup.",
    intro:
      "Ship with confidence: one scan of your live (or staging) URL becomes a pre-launch gate — critical blockers first, then important fixes, then optional polish. Same engine as Check My Website, grouped for launch day.",
    steps: [
      "Enter the URL you are about to launch (or the staging URL you want to sign off).",
      "Click “Run checklist” — the shared engine fetches the page, robots.txt, sitemap and a bounded link sample.",
      "Clear every 🔴 Critical item: unreachable pages, non-200 statuses, noindex, robots.txt blocking crawlers, missing HTTPS, mixed active content and broken interactive labels.",
      "Work through 🟡 Important items (metadata, social cards, sampled links, security headers, performance basics), then ⚪ Optional polish.",
      "Re-run the checklist after your fixes — ready means the scan no longer reports blockers.",
    ],
    whatText:
      "Launch Checklist runs the same server-side scan as Check My Website and maps every finding to a launch priority. Critical covers hard blockers: the page is unreachable or returns a non-200 status, the page is set to noindex, robots.txt disallows all crawlers, the site is not on HTTPS, active mixed content is present, or links/buttons/form fields lack accessible names. Important covers metadata, sitemap, redirect chains, sampled broken links, social tags, security headers and performance basics. Optional covers polish such as lazy loading, modern image formats, cache policy and permissions policy. Pass and Not detectable items are shown separately and never counted as blockers.",
    whyText:
      "Launch-day mistakes — a leftover staging noindex, a robots.txt that blocks everything, an HTTP-only domain — are the kind that quietly cost weeks of indexing. A three-tier gate keeps the team focused: fix what blocks launch first, schedule what matters next, and leave polish for later without pretending it is done.",
    features: [
      "🔴 Critical / 🟡 Important / ⚪ Optional gate built from real observed signals",
      "Cleared (passed) and Not detectable sections shown separately — no fake passes",
      "Banner states plainly whether critical blockers remain before you ship",
      "Every item links to its evidence and, where one exists, the right GainUtility tool to fix it",
      "Same fetch safety as Check My Website: SSRF guards, robots.txt respect, rate limits",
    ],
    limitations: SCAN_LIMITATIONS,
    privacyExplanation: FETCH_PRIVACY,
    mistakes: [
      "Shipping while critical items are still open because the banner “looks mostly green”.",
      "Counting Not detectable items as passed — they are unknowns, not successes.",
      "Running the checklist only on the homepage — deep pages can carry their own noindex or broken links.",
      "Fixing issues without re-running the scan to confirm the gate actually cleared.",
    ],
    troubleshooting: [
      "Critical robots.txt item on a staging domain? Confirm you are scanning the domain you intend to launch, not an internal host that is unreachable publicly.",
      "Scanned too many times in a row? Scans are rate-limited per network — wait a minute and re-run.",
      "Items you fixed still appear? Allow a minute for CDN caches, then re-run the checklist.",
    ],
    faqs: [
      {
        question: "What makes an item critical vs important?",
        answer:
          "Critical items prevent indexing or basic usability: unreachable or non-200 pages, noindex, robots.txt blocking all crawlers, missing HTTPS, active mixed content, and interactive elements without accessible names. Important items degrade quality — metadata, social cards, sampled links, security headers and performance basics. Optional covers polish.",
      },
      {
        question: "Does a green banner mean my site is perfect?",
        answer:
          "No. It means no critical blockers were detected on the scanned URL. Important and optional items may remain, and several checks (Core Web Vitals, contrast, full WCAG) are labelled Not detectable because they need a rendered-page audit.",
      },
      {
        question: "Is this checklist different from Check My Website?",
        answer:
          "The scan and findings are identical — one shared engine. Launch Checklist simply regroups them into a pre-launch gate with a readiness banner, while Check My Website shows an explorer-style report.",
      },
      {
        question: "Should I run this on staging or production?",
        answer:
          "Either, as long as the URL is publicly reachable. Staging behind a password or IP allowlist will show fetch errors rather than real findings — scan a public URL for accurate results.",
      },
      {
        question: "Do I need to create an account?",
        answer:
          "No. Enter a URL and run the checklist. The scan is rate-limited per network to keep the service healthy, but there is no sign-up gate.",
      },
      {
        question: "Can it guarantee my launch will succeed?",
        answer:
          "No tool can. The checklist reports what a single bounded fetch can observe. Treat it as a fast pre-flight, then complete your own full crawl, rendered-performance audit and accessibility review before calling the launch done.",
      },
    ],
    related: ["check-my-website", "robots-txt-generator", "xml-sitemap-generator", "seo-meta-generator", "schema-markup-generator"],
  },
};
