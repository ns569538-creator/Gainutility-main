/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Social / sharing checks: Open Graph tags, og:image dimensions and
 * Twitter card metadata.
 */

import type { Finding, RawSignals } from "../types";

function metaContent(doc: Document, attr: "property" | "name", key: string): string {
  return (doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content") ?? "").trim();
}

export function runSocialChecks(raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];

  const ogTitle = metaContent(doc, "property", "og:title");
  const ogDesc = metaContent(doc, "property", "og:description");
  const ogImage = metaContent(doc, "property", "og:image");
  const ogUrl = metaContent(doc, "property", "og:url");
  const ogType = metaContent(doc, "property", "og:type");
  const ogSiteName = metaContent(doc, "property", "og:site_name");
  const missing = [
    !ogTitle && "og:title",
    !ogDesc && "og:description",
    !ogImage && "og:image",
    !ogType && "og:type",
  ].filter(Boolean) as string[];

  if (missing.length === 4) {
    out.push({
      id: "social-og",
      category: "social",
      status: "ERROR",
      title: "No Open Graph tags found",
      what: "The page has none of og:title, og:description, og:image or og:type.",
      why: "Without Open Graph tags, shared links fall back to scraped page text — often poorly formatted.",
      how: "Add the core og:* tags to the page head so shares on LinkedIn, Facebook, Slack and iMessage render richly.",
      evidence: "missing: og:title, og:description, og:image, og:type",
      fixTool: "og-meta-generator",
    });
  } else if (missing.length > 0) {
    out.push({
      id: "social-og",
      category: "social",
      status: "WARNING",
      title: `Open Graph tags incomplete (${missing.length} missing)`,
      what: `Missing: ${missing.join(", ")}.`,
      why: "Each missing field degrades the quality of shared-link previews on social platforms.",
      how: "Fill in the missing og:* tags; validate with each platform's share debugger.",
      evidence: `present: og:title=${Boolean(ogTitle)}, og:description=${Boolean(ogDesc)}, og:image=${Boolean(ogImage)}, og:type=${Boolean(ogType)}`,
      fixTool: "og-meta-generator",
    });
  } else {
    out.push({
      id: "social-og",
      category: "social",
      status: "PASS",
      title: "Core Open Graph tags present",
      what: "og:title, og:description, og:image and og:type are all set.",
      why: "Complete OG tags produce consistent rich previews across social platforms.",
      how: "Keep og:title/description aligned with (but not identical to) the SEO title/description.",
      evidence: `og:title: ${ogTitle.slice(0, 80)} | og:type: ${ogType}${ogSiteName ? ` | og:site_name: ${ogSiteName}` : ""}`,
      fixTool: "og-meta-generator",
    });
  }

  // og:image dimensions
  if (ogImage) {
    const w = metaContent(doc, "property", "og:image:width");
    const h = metaContent(doc, "property", "og:image:height");
    if (!w || !h) {
      out.push({
        id: "social-og-image",
        category: "social",
        status: "WARNING",
        title: "og:image has no declared dimensions",
        what: `og:image is set (${ogImage.slice(0, 120)}) but og:image:width / og:image:height are missing.`,
        why: "Declared dimensions let platforms size the preview correctly on first scrape, before downloading the image.",
        how: "Add og:image:width and og:image:height matching the actual pixel size (recommended ≥ 1200×630).",
        evidence: ogImage,
        fixTool: "og-meta-generator",
      });
    } else {
      const width = Number(w);
      let aspectNote = "";
      if (width && width < 600) {
        aspectNote = ` Width ${width}px is below the recommended 600px minimum.`;
      }
      out.push({
        id: "social-og-image",
        category: "social",
        status: width && width < 600 ? "WARNING" : "PASS",
        title: width && width < 600 ? "og:image is small" : "og:image declared with dimensions",
        what: `og:image is ${w}×${h}.${aspectNote}`,
        why: "Correct dimensions (ideally 1200×630) guarantee a crisp full-width card on every platform.",
        how: "If resizing is needed, regenerate the share image at the recommended size.",
        evidence: `${ogImage} (${w}×${h})`,
        fixTool: "social-resizer",
      });
    }
  } else {
    out.push({
      id: "social-og-image",
      category: "social",
      status: "WARNING",
      title: "No og:image set",
      what: "The page does not define an Open Graph image.",
      why: "Shared links without an image get far less engagement and look unfinished in feeds.",
      how: "Add <meta property=\"og:image\" content=\"https://…/share.png\"> with a 1200×630 image.",
      fixTool: "og-meta-generator",
    });
  }

  // og:url
  if (ogUrl) {
    let aligned = false;
    try {
      aligned = new URL(ogUrl, raw.finalUrl).toString().replace(/\/$/, "") === raw.finalUrl.replace(/\/$/, "");
    } catch {
      aligned = false;
    }
    if (!aligned) {
      out.push({
        id: "social-og-url",
        category: "social",
        status: "WARNING",
        title: "og:url does not match this page",
        what: `og:url is ${ogUrl} but the scanned final URL is ${raw.finalUrl}.`,
        why: "og:url tells platforms which URL the card represents; mismatches can attach shares to the wrong page.",
        how: "Set og:url to the canonical URL of the page being shared.",
        evidence: `og:url: ${ogUrl}`,
        fixTool: "og-meta-generator",
      });
    } else {
      out.push({
        id: "social-og-url",
        category: "social",
        status: "PASS",
        title: "og:url matches this page",
        what: `og:url points at ${ogUrl}.`,
        why: "An aligned og:url keeps share analytics and previews attached to the right page.",
        how: "Update og:url whenever the canonical changes.",
        evidence: ogUrl,
      });
    }
  } else {
    out.push({
      id: "social-og-url",
      category: "social",
      status: "WARNING",
      title: "No og:url set",
      what: "The page omits og:url.",
      why: "Platforms fall back to the scraped URL, which can differ after redirects or with query params.",
      how: "Set og:url to the page's canonical absolute URL.",
      evidence: `suggested: ${raw.finalUrl}`,
      fixTool: "og-meta-generator",
    });
  }

  // Twitter card
  const twitterCard = metaContent(doc, "name", "twitter:card");
  const twitterTitle = metaContent(doc, "name", "twitter:title");
  const twitterImage = metaContent(doc, "name", "twitter:image");
  if (!twitterCard) {
    if (ogTitle || ogImage) {
      out.push({
        id: "social-twitter-card",
        category: "social",
        status: "WARNING",
        title: "No twitter:card tag (relying on Open Graph fallback)",
        what: "twitter:card is missing; X will fall back to OG tags when it can.",
        why: "An explicit twitter:card gives predictable card types (summary vs summary_large_image) on X.",
        how: "Add <meta name=\"twitter:card\" content=\"summary_large_image\"> (or summary) plus twitter:image.",
        fixTool: "twitter-card-generator",
      });
    } else {
      out.push({
        id: "social-twitter-card",
        category: "social",
        status: "ERROR",
        title: "No Twitter/X card metadata",
        what: "Neither twitter:* tags nor usable OG fallback tags were found.",
        why: "Shared links on X will render as plain URLs.",
        how: "Add twitter:card, twitter:title, twitter:description and twitter:image (or rely on complete OG tags).",
        fixTool: "twitter-card-generator",
      });
    }
  } else {
    const valid = ["summary", "summary_large_image", "app", "player"].includes(twitterCard.toLowerCase());
    if (!valid) {
      out.push({
        id: "social-twitter-card",
        category: "social",
        status: "WARNING",
        title: `Unrecognized twitter:card value "${twitterCard}"`,
        what: `twitter:card is set to "${twitterCard}", which is not one of summary, summary_large_image, app or player.`,
        why: "Invalid card types fall back to the default summary card.",
        how: "Use summary or summary_large_image for standard web pages.",
        evidence: twitterCard,
        fixTool: "twitter-card-generator",
      });
    } else if (!twitterImage && !ogImage) {
      out.push({
        id: "social-twitter-card",
        category: "social",
        status: "WARNING",
        title: `twitter:card set (${twitterCard}) but no image`,
        what: `twitter:card is "${twitterCard}" but neither twitter:image nor og:image is present.`,
        why: "Image-led cards perform better; large-image cards need an image source.",
        how: "Add twitter:image (or og:image as fallback) at ≥ 600×314.",
        evidence: twitterCard,
        fixTool: "twitter-card-generator",
      });
    } else {
      out.push({
        id: "social-twitter-card",
        category: "social",
        status: "PASS",
        title: `Twitter/X card configured (${twitterCard})`,
        what: `twitter:card is "${twitterCard}"${twitterTitle ? ` with twitter:title "${twitterTitle.slice(0, 60)}"` : ""}.`,
        why: "Explicit card tags produce reliable previews when the link is posted on X.",
        how: "Preview the URL in X's compose box after changes to confirm rendering.",
        evidence: twitterCard,
        fixTool: "twitter-card-generator",
      });
    }
  }

  return out;
}
