/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for SEO-studio generators and image-studio tools not
 * covered by src/data.ts.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const LOCAL =
  "Everything runs locally in your browser. Your input and files are never uploaded to a server.";

export const GENERATOR_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  // ---------------- SEO Studio ----------------
  "twitter-card-generator": {
    title: "Twitter Card Generator — Build X Card Meta Tags",
    description:
      "Generate twitter:card meta tags with live preview of summary and summary_large_image layouts. Copy-paste ready — free, in-browser.",
    intro:
      "Make shared links look professional on X (Twitter). Pick a card type, fill in title, description, and image, then copy the generated meta tags.",
    steps: [
      "Choose a card type: summary or large image.",
      "Enter your page URL, title, description, and image URL.",
      "Check the visual preview of how the card will render.",
      "Copy the generated meta tags into your page's <head>."
    ],
    whatText:
      "The generator produces the complete set of twitter:* meta tags — card type, site handle, creator, title, description, and image — following X's publishing documentation.",
    whyText:
      "Without card tags, shared links collapse into bare URLs. Proper cards show imagery and formatted text, measurably improving click-through from social shares.",
    features: [
      "Summary and summary_large_image card types",
      "Live preview simulating feed rendering",
      "Character guidance for title and description",
      "One-click copy of the full tag block",
      "Runs entirely in your browser"
    ],
    faqs: [
      {
        question: "How do I create a Twitter card for my website?",
        answer:
          "Fill in your page details here, copy the generated twitter:* meta tags, and paste them into your HTML head before deployment."
      },
      {
        question: "Which card type should I choose?",
        answer:
          "Use summary_large_image when you have strong visuals — it dominates more screen space; use summary for text-first links."
      },
      {
        question: "Do I need Open Graph tags too?",
        answer:
          "X falls back to Open Graph tags when specific twitter tags are missing, but explicit twitter:card tags give you precise control."
      },
      {
        question: "How do I verify my card works?",
        answer: "After deploying, share the link in a post draft — the compose preview renders your card without posting."
      }
    ],
    related: ["seo-meta-generator", "og-meta-generator", "google-serp-preview", "schema-markup-generator"],
    privacyExplanation: LOCAL,
    limitations: ["Card rendering is simulated; final appearance depends on X's crawler fetching valid image URLs."]
  },
  "robots-txt-generator": {
    title: "Robots.txt Generator — Create Crawler Rules Free",
    description:
      "Generate a correct robots.txt with allow/disallow rules, sitemap references, and crawl-delay settings. Instant download, no sign-up.",
    intro:
      "Tell search engines exactly which parts of your site to crawl. Build clean robots.txt syntax visually instead of hand-editing directives.",
    steps: [
      "Pick a preset or start blank.",
      "Add user-agent groups with allow/disallow paths.",
      "Set crawl-delay if needed and reference your sitemap URL.",
      "Preview, validate, and download robots.txt."
    ],
    whatText:
      "The builder assembles standard robots.txt directives — User-agent, Disallow, Allow, Sitemap, and Crawl-delay — into syntactically correct output you can drop at your domain root.",
    whyText:
      "One wrong line can deindex your whole site or waste crawl budget on admin pages. A visual builder prevents syntax slips that hand-editing invites.",
    features: [
      "Common presets for WordPress, Shopify-style structures",
      "Multiple user-agent groups supported",
      "Sitemap directive included automatically",
      "Syntax validation before download",
      "Free and browser-based"
    ],
    faqs: [
      {
        question: "Where do I put my robots.txt file?",
        answer:
          "At your domain root so it resolves at https://example.com/robots.txt — crawlers never look anywhere else."
      },
      {
        question: "Should I block AI crawlers?",
        answer:
          "That's your editorial choice; add their user-agents to a disallow group if you don't want bot training on your content."
      },
      {
        question: "Does robots.txt remove pages from Google?",
        answer:
          "No — it prevents crawling, not indexing. For true removal use noindex meta tags or removal tools."
      },
      {
        question: "Is this generator free?",
        answer: "Yes, completely free and private since generation happens in your browser."
      }
    ],
    related: ["xml-sitemap-generator", "canonical-url-generator", "hreflang-tag-generator", "seo-meta-generator"],
    privacyExplanation: LOCAL
  },
  "xml-sitemap-generator": {
    title: "XML Sitemap Generator — Build Search Engine Sitemaps",
    description:
      "Create prioritized XML sitemaps with changefreq and lastmod attributes, ready for Search Console submission. Generated in your browser.",
    intro:
      "Help search engines discover every important URL. Add your pages, set priorities and update frequency, and export standards-compliant XML.",
    steps: [
      "Paste your URLs or add them one by one.",
      "Optionally set priority and changefreq per entry.",
      "Review the generated XML preview.",
      "Download sitemap.xml and upload it to your site root."
    ],
    whatText:
      "The tool wraps your URL list in the standard <urlset> schema with optional <priority>, <changefreq>, and <lastmod> children per URL, producing valid XML search engines parse natively.",
    whyText:
      "Sitemaps remain the most reliable discovery channel for new or deep pages, especially on sites with weak internal linking or recent launches.",
    features: [
      "Bulk URL import (one per line)",
      "Per-URL priority and change frequency",
      "Valid namespace-compliant output",
      "Instant preview and .xml download",
      "No upload — built locally"
    ],
    limitations: ["Keep each sitemap under 50,000 URLs / 50MB per the sitemap protocol; split larger sites."],
    faqs: [
      {
        question: "How do I create an XML sitemap?",
        answer:
          "List your URLs here, adjust priorities if desired, and download the finished sitemap.xml for your site root."
      },
      {
        question: "Do priority and changefreq matter anymore?",
        answer:
          "Search engines largely ignore them today, but they remain part of the protocol and are harmless metadata for other consumers."
      },
      {
        question: "How do I submit my sitemap to Google?",
        answer:
          "In Search Console, open Sitemaps and enter your sitemap URL — Google fetches and reports coverage there."
      },
      {
        question: "Is my URL list sent to a server?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["robots-txt-generator", "canonical-url-generator", "google-serp-preview", "schema-markup-generator"],
    privacyExplanation: LOCAL
  },
  "schema-markup-generator": {
    title: "Schema Markup Generator — JSON-LD Structured Data",
    description:
      "Build JSON-LD schema markup for articles, products, FAQs, local business, and more. Validate-ready structured data, generated free.",
    intro:
      "Qualify for rich results by giving search engines unambiguous entity data. Choose a schema type, fill fields, copy production-ready JSON-LD.",
    steps: [
      "Select a schema type (Article, Product, FAQ, LocalBusiness…).",
      "Fill in the required and recommended properties.",
      "Review the generated JSON-LD preview.",
      "Copy the script tag into your page head or body."
    ],
    whatText:
      "The builder emits schema.org-conformant JSON-LD wrapped in a <script type=\"application/ld+json\"> tag, including @context and @type plus the properties your chosen type expects.",
    whyText:
      "Structured data powers rich snippets — stars, FAQs, breadcrumbs, prices — that lift click-through rates well beyond plain blue links.",
    features: [
      "Common schema types covered",
      "Required-property hints while filling",
      "Formatted JSON output with validation-friendly structure",
      "Single script tag ready to paste",
      "Generated locally, instantly"
    ],
    faqs: [
      {
        question: "What is JSON-LD schema markup?",
        answer:
          "A machine-readable data block describing your page's entities — Google's preferred structured-data format."
      },
      {
        question: "Does schema markup improve rankings?",
        answer:
          "It's not a direct ranking factor, but rich results from valid markup consistently raise visibility and clicks."
      },
      {
        question: "How do I test my schema?",
        answer:
          "Use Google's Rich Results Test on your deployed URL after pasting the generated script tag."
      },
      {
        question: "Can I combine multiple schema types?",
        answer: "Yes — wrap them in an @graph array; each type describes a distinct entity on the page."
      }
    ],
    related: ["json-beautifier", "seo-meta-generator", "og-meta-generator", "google-serp-preview"],
    privacyExplanation: LOCAL
  },
  "utm-builder": {
    title: "UTM Link Builder — Tag Campaign URLs Correctly",
    description:
      "Build UTM-tracked campaign links with source, medium, and campaign parameters. Consistent naming, instant QR code export.",
    intro:
      "Know exactly which channel drives traffic. Construct standardized utm_* URLs for every campaign and export QR codes for offline placement.",
    steps: [
      "Enter your destination URL.",
      "Fill in utm_source, utm_medium, and utm_campaign.",
      "Add term/content parameters if relevant.",
      "Copy the tagged link or export its QR code."
    ],
    whatText:
      "Appends properly encoded utm_source, utm_medium, utm_campaign, utm_term, and utm_content parameters to your base URL using consistent lowercase naming.",
    whyText:
      "Analytics platforms attribute sessions via these parameters; sloppy naming ('Facebook', 'facebook', 'FB') fragments your reporting into unusable slices.",
    features: [
      "All five standard UTM parameters",
      "URL-safe encoding handled automatically",
      "Naming-consistency reminders built in",
      "QR code export for print and packaging",
      "History of recently built links"
    ],
    faqs: [
      {
        question: "What does UTM mean?",
        answer:
          "Urchin Tracking Module — legacy naming from Urchin Analytics, now the universal parameter convention GA4 and all major analytics understand."
      },
      {
        question: "Which UTM parameters are required?",
        answer:
          "utm_source and utm_medium are essential; utm_campaign strongly recommended for campaign-level reporting."
      },
      {
        question: "Do UTMs affect SEO?",
        answer:
          "Tagged links are external-tracking only; they don't harm rankings, though canonicalize internally-linked variants properly."
      },
      {
        question: "Can I make a QR code of my tagged link?",
        answer: "Yes — one click exports a scannable QR encoding the full tracked URL."
      }
    ],
    related: ["qr-code-generator", "url-encoder-decoder", "canonical-url-generator", "google-serp-preview"],
    privacyExplanation: LOCAL
  },
  "canonical-url-generator": {
    title: "Canonical Tag Generator — Prevent Duplicate Content",
    description:
      "Generate self-referencing rel=canonical link tags to consolidate duplicate URLs. Clean syntax, instant copy, completely free.",
    intro:
      "Stop duplicate-content dilution before it starts. Produce correct <link rel=\"canonical\"> tags for any URL pattern in seconds.",
    steps: [
      "Enter your preferred absolute URL.",
      "Choose http/https and trailing-slash conventions.",
      "Review the generated canonical snippet.",
      "Copy it into your page's <head>."
    ],
    whatText:
      "Outputs an HTML <link rel=\"canonical\" href=\"...\"> element pointing at the exact absolute URL you designate as the master version.",
    whyText:
      "UTMs, sort orders, and session IDs spawn countless near-duplicate URLs. Canonicals tell search engines which single version deserves ranking credit.",
    features: [
      "Self-referencing and cross-page canonical support",
      "Protocol and trailing-slash normalization",
      "Absolute-URL enforcement (required by spec)",
      "Instant copy-paste snippet",
      "Private in-browser generation"
    ],
    faqs: [
      {
        question: "What is a canonical URL?",
        answer:
          "The version of a page you declare authoritative when duplicates exist — search engines consolidate signals toward it."
      },
      {
        question: "Should every page have a canonical tag?",
        answer:
          "Best practice is yes, self-referencing by default — it protects against parameter-based duplication proactively."
      },
      {
        question: "Relative or absolute href?",
        answer: "Always absolute (with protocol and domain); relative canonicals are frequently misprocessed."
      },
      {
        question: "Do canonicals pass full ranking value?",
        answer:
          "They act as strong hints, generally consolidated — but aren't guarantees like redirects, which should be preferred for permanent consolidation."
      }
    ],
    related: ["robots-txt-generator", "xml-sitemap-generator", "hreflang-tag-generator",
          "seo-meta-generator"],
    privacyExplanation: LOCAL
  },
  "hreflang-tag-generator": {
    title: "Hreflang Tag Generator — Multi-Language SEO Signals",
    description:
      "Generate hreflang alternate tags for international sites with proper language-region codes and x-default handling. Free and instant.",
    intro:
      "Serve the right language to the right visitor. Build bidirectional hreflang clusters that search engines honor without confusion.",
    steps: [
      "Enter each language/region variant URL.",
      "Assign ISO codes (e.g., en-us, es-mx, de-de).",
      "Designate x-default where applicable.",
      "Copy the complete reciprocal tag set."
    ],
    whatText:
      "Produces <link rel=\"alternate\" hreflang=\"...\" href=\"...\"> elements for every listed variant, ensuring each page references all siblings reciprocally as required.",
    whyText:
      "Without hreflang, English-speaking users in Germany may see German pages ranked first — or worse, duplicate-language versions compete against each other internationally.",
    features: [
      "Unlimited language/region pairs",
      "Automatic reciprocity across all entries",
      "x-default designation support",
      "ISO 639-1 + ISO 3166-1 formatting validation",
      "Copy-ready head snippet"
    ],
    limitations: ["Every variant must also be referenced from its own page — one-sided clusters get ignored."],
    faqs: [
      {
        question: "What are hreflang tags for?",
        answer:
          "They tell search engines which language/region version of a page to serve users searching in matching locales."
      },
      {
        question: "Do hreflang tags need to be reciprocal?",
        answer:
          "Yes — every page in the cluster must list all others including itself; broken reciprocity voids the signal cluster-wide."
      },
      {
        question: "What is x-default?",
        answer:
          "A catch-all designation for users whose language matches none of your variants — typically a homepage or language selector."
      },
      {
        question: "Language only or language-region codes?",
        answer:
          "Both work; use region only when you genuinely differentiate content per market, otherwise plain 'en', 'es' suffices."
      }
    ],
    related: ["canonical-url-generator", "xml-sitemap-generator", "robots-txt-generator", "seo-meta-generator"],
    privacyExplanation: LOCAL
  },
  "google-serp-preview": {
    title: "Google SERP Preview — Test Title & Meta Description",
    description:
      "See how your page appears in desktop and mobile Google results before publishing. Pixel-accurate truncation warnings included.",
    intro:
      "Write titles and descriptions that survive truncation. Preview pixel widths exactly as Google renders them on both device classes.",
    steps: [
      "Type your proposed title tag.",
      "Type your meta description.",
      "Toggle between desktop and mobile rendering.",
      "Adjust until nothing critical gets cut off."
    ],
    whatText:
      "Simulates the Google search result layout — favicon, breadcrumb, blue-link title, description — measuring character and pixel lengths against truncation thresholds.",
    whyText:
      "Google cuts titles around 580px desktop / 920px mobile and descriptions around 158–160 characters. Testing pre-publish beats discovering ellipses after indexing.",
    features: [
      "Desktop and mobile result layouts",
      "Pixel-based truncation measurement",
      "Title and description length meters",
      "Brand-name suffix preview",
      "Instant feedback loop"
    ],
    limitations: ["Simulation approximates current rendering; Google occasionally tests layout variations."],
    faqs: [
      {
        question: "How long should a title tag be for SEO?",
        answer:
          "Aim under ~60 characters (about 580 pixels) — long enough to describe, short enough to avoid truncation."
      },
      {
        question: "What is the ideal meta description length?",
        answer:
          "Roughly 150–160 characters; Google rewrites descriptions often, but a strong original still wins most displays."
      },
      {
        question: "Why does Google rewrite my titles?",
        answer:
          "Overly long, keyword-stuffed, or boilerplate titles trigger rewriting; concise unique titles usually survive intact."
      },
      {
        question: "Is this preview accurate for mobile?",
        answer: "Yes — mobile uses wider pixel allowances than desktop; toggle views to check both."
      }
    ],
    related: ["twitter-card-generator", "og-meta-generator", "seo-meta-generator", "schema-markup-generator"],
    privacyExplanation: LOCAL
  },

  // ---------------- Image Studio ----------------
  "favicon-generator": {
    title: "Favicon Generator & App Icon Studio — Export Icon Kits",
    description:
      "Create favicons from images, text initials, symbols or emoji. Preview at 16px and export a multi-resolution .ico, Apple touch icons, PNGs and web manifest.",
    intro:
      "Design and compile complete website icon packages: classic multi-resolution .ico, 16px/32px PNGs, Apple touch icons, and Android PWA manifest sizes with copy-paste head markup. 100% browser-based and private.",
    steps: [
      "Start from an uploaded image, text initials, curated vector symbol, or emoji.",
      "Customize shape (squircle, circle, square), colors, scale, padding, and inspect live contrast.",
      "Check 16×16 and 32×32 readability in simulated browser tabs and mobile home-screens.",
      "Download the complete favicon package ZIP, individual .ico/PNGs, and copy ready-to-use HTML head tags."
    ],
    whatText:
      "Generates every standard website icon dimension — 16, 32, 48, 180, 192, 512px plus a genuine multi-resolution ICO file — with site.webmanifest JSON and HTML link snippets.",
    whyText:
      "A missing or blurry favicon hurts user trust in bookmarks, browser tabs, and search results. Creating dedicated 16px and 32px assets prevents browser scaling artifacts and covers iOS and Android devices.",
    features: [
      "Image, text initials, vector symbol, and emoji modes",
      "Dedicated 16×16 and 32×32 small-size readability loupe",
      "Real-world context simulation (browser tab, bookmark, mobile, search)",
      "Genuine multi-resolution .ico container (16/32/48px frames embedded)",
      "Apple touch icon (180×180) and Android PWA manifest generation",
      "Client-side processing with zero server uploads"
    ],
    faqs: [
      {
        question: "Can I create a favicon without an existing logo?",
        answer:
          "Yes. You can create clean, recognizable favicons using the Text/Initials mode, choose from curated vector symbols, or select an emoji, complete with customizable shapes and colors."
      },
      {
        question: "Why does my favicon look sharp at 512px but blurry at 16px?",
        answer:
          "Small sizes only have 256 total pixels. Detailed illustrations and long words lose definition when downscaled. Favicons must use simple marks, bold weights, and high contrast."
      },
      {
        question: "Is the favicon.ico file a genuine ICO?",
        answer:
          "Yes. It is a genuine binary .ico container embedding 16×16, 32×32, and 48×48 PNG frames for compatibility with desktop shortcuts and legacy browsers."
      },
      {
        question: "How long does Google take to update my favicon in search results?",
        answer:
          "Search engines maintain separate crawling schedules for favicons. Even after correct deployment, Google can take anywhere from a few days to several weeks to recrawl and update its search cache."
      },
      {
        question: "Are my uploaded images or designs sent to any server?",
        answer: "No. " + LOCAL + " All rasterization, ICO encoding, and ZIP compilation execute locally in memory."
      }
    ],
    related: ["social-resizer", "image-resizer", "collage-maker", "image-converter"],
    privacyExplanation: LOCAL
  },
  "collage-maker": {
    title: "Collage Maker — Photo Grid & Bento Layouts Online",
    description:
      "Combine photos into premium grid and bento collages with adjustable corners, borders, and spacing. Export high-quality results locally.",
    intro:
      "Arrange multiple photos into polished layouts — classic grids or modern bento styles — with fine control over gaps, radii, and frames.",
    steps: [
      "Upload two or more photos.",
      "Choose a grid or bento layout template.",
      "Tune corner radius, border width, and spacing.",
      "Export your finished collage."
    ],
    whatText:
      "Photos are arranged into template-driven cells rendered to a single canvas; styling controls affect spacing, rounding, and borders globally or per-layout.",
    whyText:
      "Social posts, mood boards, and product showcases benefit from composed layouts rather than loose photo dumps — collages read as intentional design.",
    features: [
      "Grid and bento template families",
      "Global corner-radius control",
      "Border and gutter adjustments",
      "High-resolution canvas export",
      "Fully offline composition"
    ],
    faqs: [
      {
        question: "How do I make a photo collage online free?",
        answer:
          "Upload your photos, pick a layout, adjust spacing and corners, then export — no watermark, no account needed."
      },
      {
        question: "What resolution is the exported collage?",
        answer:
          "Output scales to your largest source image dimensions, keeping prints and zoom-ins sharp."
      },
      {
        question: "Can I rearrange photos after placing them?",
        answer: "Yes — swap positions between cells until the composition balances."
      },
      {
        question: "Do my photos leave my device?",
        answer: "Never. " + LOCAL
      }
    ],
    related: ["image-cropper", "social-resizer", "image-resizer", "image-converter", "linkedin-carousel-maker"],
    privacyExplanation: LOCAL
  },
  "social-resizer": {
    title: "Social Media Image Resizer — Sizes for Every Platform",
    description:
      "Crop, pad, and resize images to Instagram, Facebook, X, LinkedIn specs instantly. Every platform preset in one free tool.",
    intro:
      "Stop memorizing dimension tables. Pick a platform preset, frame your image, and export pixel-perfect assets for every feed.",
    steps: [
      "Upload your source image.",
      "Select target platforms (Instagram post, Story, LinkedIn banner…).",
      "Adjust crop position and padding per preset.",
      "Export individual sizes or the full set."
    ],
    whatText:
      "Platform presets define exact pixel dimensions and aspect ratios; smart crop positioning keeps subjects centered while padding fills letterboxed edges cleanly.",
    whyText:
      "Each network crops uploads differently — a perfect Instagram square becomes an awkward LinkedIn banner. Batch-generating per-platform assets ends stretched and cropped-off branding.",
    features: [
      "Instagram, Facebook, X, LinkedIn, YouTube presets",
      "Feed, story, banner, and avatar dimensions",
      "Manual crop repositioning per output",
      "Batch export of all selected sizes",
      "Local processing, zero uploads"
    ],
    faqs: [
      {
        question: "What size should Instagram posts be?",
        answer:
          "1080×1080 for feed squares, 1080×1920 for stories/reels — presets apply these automatically."
      },
      {
        question: "Which dimensions work for LinkedIn banners?",
        answer: "1584×396 is the company-page banner standard; personal profile banners differ slightly and are covered too."
      },
      {
        question: "Can I export several platform sizes at once?",
        answer: "Yes — select multiple presets and batch-export every variation in one pass."
      },
      {
        question: "Will resizing reduce quality?",
        answer:
          "High-quality resampling preserves detail; starting from larger sources yields sharper downscales."
      }
    ],
    related: ["image-resizer", "image-cropper", "favicon-generator", "youtube-thumbnail-preview", "linkedin-carousel-maker"],
    privacyExplanation: LOCAL
  },

  "logo-maker": {
    title: "Free Logo Maker — Create & Download Logos | GainUtility",
    description:
      "Create a free logo online with GainUtility. Customize text, symbols, colors, layouts and typography, then download your logo in useful web-ready formats.",
    intro:
      "Create and customize a logo for your website, business, brand, or project. Choose typography, symbols, colors, and layouts, then export web-ready files.",
    steps: [
      "Select your preferred logo style archetype or start from scratch with brand name and tagline text.",
      "Choose a layout: horizontal icon-left, stacked icon-top, monogram badge, or clean typography wordmark.",
      "Pick from curated typefaces, adjust letter-spacing, and select or search vector symbols.",
      "Fine-tune colors, container shapes, and inspect small-size visibility in browser header and icon mockups.",
      "Download standalone vector SVG, transparent high-DPI PNGs, or export a complete Brand Asset ZIP package."
    ],
    whatText:
      "An in-browser online logo maker and brand asset studio. It pairs vector geometric marks with curated Google Fonts and color harmonies, generating web-ready SVG code and multi-scale transparent PNGs with zero server dependencies.",
    whyText:
      "Professional logos require versatile formats: lightweight SVGs for responsive website navigation, high-DPI transparent PNGs for documents, and compact icon marks for browser tabs and mobile home screens. GainUtility gives you complete design control and instant file downloads without paywalls or account creation.",
    features: [
      "Vector SVG and high-resolution transparent PNG exports (1x, 2x Retina, 4x Print)",
      "Horizontal, stacked, monogram badge, and wordmark layout modes",
      "Curated Google Fonts library spanning modern sans-serif, geometric, editorial serif, and tech monospace",
      "Extensive vector symbol catalog across tech, abstract geometry, commerce, creative, and security themes",
      "Real-world context simulation: live website header, business card, mobile app, and social avatar mockups",
      "Dedicated small-size readability loupe (16px, 24px, 32px, 64px) with automated contrast score",
      "Multi-surface variations preview: dark mode, light mode, and monochrome print versions",
      "Client-side processing with zero server uploads — entirely private on-device"
    ],
    faqs: [
      {
        question: "What is a logo maker?",
        answer:
          "A logo maker is an online design utility that lets you create, customize, and export brand logos using tailored typography, curated vector symbols, color schemes, and layout templates without needing complex graphic software."
      },
      {
        question: "Can I create a logo without design software?",
        answer:
          "Yes. GainUtility Free Logo Maker runs completely in your web browser. You can select curated fonts, geometric marks, layouts, and color palettes with live interactive previews and download production-ready SVG and PNG files instantly."
      },
      {
        question: "Can I make a logo from initials?",
        answer:
          "Yes. Switch to the Monogram Badge layout, type your 1 to 3 initials into the Monogram field, and pick your preferred font and badge shape to build a crisp lettermark."
      },
      {
        question: "Can I download an SVG logo?",
        answer:
          "Yes. You can download a standalone vector SVG file or copy the raw SVG markup directly to your clipboard. The SVG contains clean vector coordinates and embedded web font declarations ready for your website."
      },
      {
        question: "Can I download a transparent PNG?",
        answer:
          "Yes. By choosing the Transparent container shape, your downloaded PNG files (1x, 2x Retina, and 4x High-Res) will have an alpha channel background that blends seamlessly into any web or print background."
      },
      {
        question: "What size should a website logo be?",
        answer:
          "Most modern website headers render logos between 32px and 48px in height. When using vector SVG, height adjusts automatically without loss of clarity. When using raster PNGs, deploy a 2x asset (e.g., 600×240 or 1200×480) to ensure crisp rendering on high-density Retina screens."
      },
      {
        question: "Should I use SVG or PNG for my website logo?",
        answer:
          "Use SVG for website headers and landing pages whenever possible. It provides the sharpest rendering, smallest network payload, and responsive scaling. Use high-resolution PNG for email newsletters, PDFs, and social media avatars."
      },
      {
        question: "Can I use my logo as a favicon?",
        answer:
          "Yes. For favicons, use the standalone icon mark or monogram variant from your brand kit. You can drop the generated square PNG into the GainUtility Favicon Generator to produce multi-resolution .ico and Apple touch files."
      },
      {
        question: "Can I create a logo on my phone?",
        answer:
          "Yes. The editor is built mobile-first. You can adjust text, fonts, colors, and layout on iOS and Android devices, inspect real-size previews, and download your logo package directly to your mobile device."
      },
      {
        question: "Does GainUtility upload my design?",
        answer:
          "No. All SVG rendering, canvas rasterization, and ZIP archiving take place entirely on your device inside your web browser. None of your brand names, text, or exported files are ever uploaded or stored remotely."
      },
      {
        question: "Can I edit the colors and fonts?",
        answer:
          "Yes. You can choose from pre-curated color schemes and Google Fonts, or specify custom hex codes for the icon, brand text, tagline, and background surfaces."
      }
    ],
    related: ["favicon-generator", "color-palette-generator", "qr-code-generator", "og-meta-generator", "image-resizer"],
    privacyExplanation: LOCAL
  }
};
