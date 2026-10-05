/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SINGLE SOURCE OF TRUTH for the GainUtility changelog.
 *
 * Every entry here reflects a REAL change — tracked in git history or the
 * deployed product. Nothing is invented, back-dated, or padded. The page
 * simply renders this list newest-first.
 *
 * When you ship something, add one line here. That is what keeps this honest.
 */

/**
 * The date GainUtility first went public, used for the launch entry in the
 * changelog (not as a per-tool baseline — only documented dates are shown).
 */
export const RELEASE_DATE = "2026-08-27";

/**
 * Documented "last updated" date per tool, keyed by tool id. Each date is the
 * most recent real change to the tool's implementing file, taken from git
 * history (grouped by date below). Dates must stay consistent with entries in
 * the CHANGELOG above. The video downloader is deliberately ABSENT: its
 * feature gap is still being repaired, so no "last updated" is claimed for it.
 */
const TOOL_LAST_UPDATED: Record<string, string> = {
  // 2026-09-26
  "logo-maker": "2026-09-26", // Free Logo Maker studio launch
  // 2026-09-23
  "box-shadow-generator": "2026-09-23", // CSS Shadow Studio: text-shadow mode, share links, below-tool content
  "stylish-name-generator": "2026-09-23", // new tool + /names and /symbols library pages
  // 2026-09-11
  "background-remover": "2026-09-11", // product redesign + privacy-first landing content
  // 2026-09-10
  "linkedin-carousel-maker": "2026-09-10", // layout/preview fixes (see changelog 2026-09-10)
  // 2026-09-09
  "cron-expression-builder": "2026-09-09",
  "csv-json-converter": "2026-09-09",
  "delete-pdf": "2026-09-09",
  "extract-pdf": "2026-09-09",
  "hash-generator": "2026-09-09",
  "http-status-code-lookup": "2026-09-09",
  "image-metadata-remover": "2026-09-09",
  "jpg-to-pdf": "2026-09-09",
  "json-compare-diff": "2026-09-09",
  "json-schema-validator": "2026-09-09",
  "jsonpath-tester": "2026-09-09",
  "jwt-decoder": "2026-09-09",
  "mime-type-lookup": "2026-09-09",
  "password-generator": "2026-09-09",
  "password-strength-checker": "2026-09-09",
  "photos-to-video": "2026-09-09", // media tools section launch
  "regex-tester": "2026-09-09",
  "rotate-pdf": "2026-09-09",
  "schema-markup-generator": "2026-09-09",
  "split-pdf": "2026-09-09",
  "sql-formatter": "2026-09-09",
  "text-diff-checker": "2026-09-09",
  "unix-timestamp-converter": "2026-09-09",
  "url-parser": "2026-09-09",
  "utm-builder": "2026-09-09",
  "uuid-generator": "2026-09-09",
  "video-audio-extractor": "2026-09-09", // media tools section launch
  "video-compressor": "2026-09-09",
  "video-converter": "2026-09-09",
  "video-resizer": "2026-09-09",
  "video-to-gif": "2026-09-09",
  "video-trimmer": "2026-09-09",
  "xml-json-converter": "2026-09-09",
  "yaml-formatter": "2026-09-09",
  "youtube-description-formatter": "2026-09-09",
  // 2026-09-08
  "collage-maker": "2026-09-08",
  "favicon-generator": "2026-09-08",
  "heic-jpg-converter": "2026-09-08",
  "image-blur-pixelate": "2026-09-08",
  "image-converter": "2026-09-08",
  "image-cropper": "2026-09-08",
  "image-resizer": "2026-09-08",
  "image-upscaler": "2026-09-08",
  "image-watermark": "2026-09-08",
  "passport-photo-maker": "2026-09-08",
  "png-jpg-converter": "2026-09-08",
  "signature-maker": "2026-09-08",
  "social-resizer": "2026-09-08",
  "svg-converter": "2026-09-08",
  "webp-converter": "2026-09-08",
  // 2026-09-07
  "color-explorer": "2026-09-07",
  "color-palette-generator": "2026-09-07",
  "color-picker": "2026-09-07",
  "design-system-spec": "2026-09-07",
  "gradient-generator": "2026-09-07",
  // 2026-09-06
  "pdf-translator": "2026-09-06",
  // 2026-09-05
  "merge-pdf": "2026-09-05",
  "youtube-thumbnail-preview": "2026-09-05",
  // 2026-09-03
  "base64-tool": "2026-09-03",
  "contrast-checker": "2026-09-03",
  "json-beautifier": "2026-09-03",
  "pdf-to-jpg": "2026-09-03",
  "protect-pdf": "2026-09-03",
  "rearrange-pdf": "2026-09-03",
  "slug-generator": "2026-09-03",
  // 2026-09-01
  "billable-hours-calculator": "2026-09-01",
  "business-pdf-extractor": "2026-09-01",
  "canonical-url-generator": "2026-09-01",
  "csv-reconciliation": "2026-09-01",
  "excel-formula-generator": "2026-09-01",
  "font-detector": "2026-09-01",
  "google-serp-preview": "2026-09-01",
  "hreflang-tag-generator": "2026-09-01",
  "html-entity-encoder": "2026-09-01",
  "html-to-pdf": "2026-09-01",
  "invoice-follow-up-tracker": "2026-09-01",
  "json-formatter": "2026-09-01",
  "json-minifier": "2026-09-01",
  "json-to-csv": "2026-09-01",
  "json-tree-viewer": "2026-09-01",
  "json-validator": "2026-09-01",
  "json-viewer": "2026-09-01",
  "og-meta-generator": "2026-09-01",
  "pdf-difference-checker": "2026-09-01",
  "pdf-to-html": "2026-09-01",
  "pdf-to-powerpoint": "2026-09-01",
  "pdf-to-text": "2026-09-01",
  "powerpoint-to-pdf": "2026-09-01",
  "robots-txt-generator": "2026-09-01",
  "seo-meta-generator": "2026-09-01",
  "text-to-pdf": "2026-09-01",
  "twitter-card-generator": "2026-09-01",
  "url-encoder-decoder": "2026-09-01",
  "xml-sitemap-generator": "2026-09-01",
  // 2026-08-31
  "color-visualizer": "2026-08-31",
  "exam-photo-fixer": "2026-08-31",
  "exam-signature-fixer": "2026-08-31",
  "exam-thumb-fixer": "2026-08-31",
  "json-compare": "2026-08-31",
  "qr-code-generator": "2026-08-31",
  "youtube-chapter-generator": "2026-08-31",
  "youtube-timestamp-formatter": "2026-08-31",
  // 2026-08-30
  "add-pdf-header-footer": "2026-08-30",
  "add-pdf-page-numbers": "2026-08-30",
  "add-pdf-watermark": "2026-08-30",
  "application-file-checker": "2026-08-30",
  "compare-two-pdfs": "2026-08-30",
  "compress-images-inside-pdf": "2026-08-30",
  "crop-pdf": "2026-08-30",
  "declaration-fixer": "2026-08-30",
  "duplicate-page-finder-pdf": "2026-08-30",
  "excel-to-pdf": "2026-08-30",
  "extract-even-pages-pdf": "2026-08-30",
  "extract-odd-pages-pdf": "2026-08-30",
  "flatten-pdf": "2026-08-30",
  "merge-selected-page-ranges": "2026-08-30",
  "optimize-pdf-web": "2026-08-30",
  "pdf-exact-size": "2026-08-30",
  "pdf-to-excel": "2026-08-30",
  "pdf-to-word": "2026-08-30",
  "reduce-pdf-image-quality": "2026-08-30",
  "remove-blank-pages-pdf": "2026-08-30",
  "remove-pdf-metadata": "2026-08-30",
  "repair-pdf": "2026-08-30",
  "reverse-page-order-pdf": "2026-08-30",
  "split-by-file-size": "2026-08-30",
  "split-every-n-pages": "2026-08-30",
  "validate-pdf": "2026-08-30",
  "word-to-pdf": "2026-08-30",
  // 2026-08-29
  "exam-file-requirements": "2026-08-29",
  "image-to-palette": "2026-08-29",
  // 2026-08-27
  "border-radius-generator": "2026-08-27",
  "ocr-pdf": "2026-08-27",
  "remove-pdf-password": "2026-08-27",
  "thumbnail-safe-zone": "2026-08-27",
  "unlock-pdf": "2026-08-27",
  "youtube-embed-generator": "2026-08-27",
  "youtube-keyword-explorer": "2026-09-16",
  "youtube-title-analyzer": "2026-08-27",
  "youtube-url-toolkit": "2026-08-27",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The documented "last updated" fact for a tool, or `null` when none is on record. */
export const toolLastUpdated = (toolId: string): { iso: string; label: string } | null => {
  const iso = TOOL_LAST_UPDATED[toolId];
  if (!iso) return null;
  const [year, month] = iso.split("-");
  const label = `${MONTHS[Number(month) - 1] ?? "?"} ${year}`;
  return { iso, label };
};

export interface ChangelogItem {
  /** The area of the product that changed, e.g. "Image Compressor". */
  area: string;
  /** Concrete, user-visible bullets. One sentence each. No marketing. */
  changes: string[];
}

export interface ChangelogEntry {
  /** ISO date the work shipped. */
  date: string;
  /** Human label shown on the page, e.g. "September 2026". */
  label: string;
  items: ChangelogItem[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-09-23",
    label: "September 2026",
    items: [
      {
        area: "Box Shadow Generator",
        changes: [
          "Upgraded into CSS Shadow Studio: switch between box-shadow and text-shadow with independent layer stacks.",
          "Added nine text-shadow presets, preview-only typography controls, randomize, and share links encoded in the URL fragment.",
          "Added copy actions for CSS, CSS variable, Tailwind, and bare value output, plus a .css download.",
          "Added ready-to-use examples, recipes, a box-shadow reference, box vs text comparison, and troubleshooting below the tool.",
        ],
      },
    ],
  },
  {
    date: "2026-09-11",
    label: "September 2026",
    items: [
      {
        area: "Background Remover",
        changes: [
          "Complete product redesign with three-phase workflow: upload, color sampling, result comparison.",
          "Added before/after comparison slider.",
          "Added PNG and JPG download options with real processing-time and file-size stats.",
          "Removed the Beta badge.",
          "Fixed inaccurate SEO claims — no longer references AI or nonexistent capabilities.",
          "Added crawlable landing content: how-to, privacy explanation, use cases, and FAQ.",
          "Added three supporting blog articles as a topical content cluster.",
        ],
      },
      {
        area: "Contact",
        changes: [
          "Replaced the contact form with a real submission path — your message opens in your own mail app, pre-filled. No more 'thanks, we got it' that went nowhere.",
          "Removed the made-up 'average response time' claim.",
        ],
      },
      {
        area: "About",
        changes: [
          "Rewrote the page to tell the actual story of the product instead of a generic mission statement.",
        ],
      },
      {
        area: "New",
        changes: [
          "Added this public changelog so every change is traceable.",
          "Tool pages now show a real 'Last updated' date from actual change history.",
          "Added a blog RSS feed at /feed.xml.",
        ],
      },
      {
        area: "Site architecture",
        changes: ["Removed the retired 'services' section; its URLs now redirect to the tools hub."],
      },
    ],
  },
  {
    date: "2026-09-10",
    label: "September 2026 (early)",
    items: [
      {
        area: "LinkedIn Carousel Maker",
        changes: ["Fixed layout and preview behavior inside the tool workspace."],
      },
      {
        area: "Install",
        changes: ["Added the optional 'Install GainUtility' action for browsers that support it."],
      },
      {
        area: "SEO",
        changes: ["Regenerated the sitemap so every genuinely localized route is listed."],
      },
    ],
  },
  {
    date: "2026-09-09",
    label: "September 2026",
    items: [
      {
        area: "Media tools",
        changes: ["Added the video and media tools section."],
      },
      {
        area: "Developer hub",
        changes: ["Added a dedicated developer tools hub page."],
      },
    ],
  },
  {
    date: "2026-09-08",
    label: "September 2026",
    items: [
      {
        area: "Image tools",
        changes: ["Fixes to the image section layout and thumbnails across devices."],
      },
    ],
  },
  {
    date: "2026-09-07",
    label: "September 2026",
    items: [
      {
        area: "LinkedIn Carousel Maker",
        changes: ["Initial release of the LinkedIn carousel tool."],
      },
      {
        area: "Design",
        changes: ["Design polish across tool workspaces and page headers."],
      },
    ],
  },
  {
    date: "2026-09-05",
    label: "Internationalization",
    items: [
      {
        area: "Languages",
        changes: ["Broader localized coverage for home, about, and blog content across supported languages."],
      },
    ],
  },
  {
    date: "2026-09-03",
    label: "September 2026",
    items: [
      {
        area: "Navigation",
        changes: ["Fixed the hamburger menu and active-state behavior across devices."],
      },
      {
        area: "Tool state",
        changes: ["Fixed the page refresh behavior so a tool restores its working state from its URL."],
      },
      {
        area: "Analytics",
        changes: ["Added privacy-respecting analytics."],
      },
    ],
  },
  {
    date: "2026-09-01",
    label: "September 2026",
    items: [
      {
        area: "Home",
        changes: ["New homepage hero and browse experience."],
      },
      {
        area: "Hosting",
        changes: ["Moved to Cloudflare Pages with prerendered HTML for every route."],
      },
    ],
  },
  {
    date: "2026-08-31",
    label: "August 2026",
    items: [
      {
        area: "Blog",
        changes: ["Launched the blog with practical, problem-first guides."],
      },
    ],
  },
  {
    date: RELEASE_DATE,
    label: "August 2026",
    items: [
      {
        area: "Launch",
        changes: ["First public version of GainUtility and its initial set of browser-based tools."],
      },
    ],
  },
];