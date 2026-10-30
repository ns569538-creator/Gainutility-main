/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SINGLE SOURCE OF TRUTH for the GainUtility Blog.
 * Every article lives here. Index/section views are all derived
 * from this registry — there are no separate per-category arrays.
 *
 * Only PUBLISHED articles appear here. Nothing placeholder, no fake
 * authors, no fabricated dates.
 */

import { LocaleCode } from "../i18n/slugs";
import { DEFAULT_LOCALE } from "../i18n/locales";
import { ALL_LOCALIZED_ARTICLES } from "../i18n/blogArticles";

export type BlogCategory =
  | "PDF"
  | "Images"
  | "SEO"
  | "Developer"
  | "Productivity";

export interface BlogBlock {
  heading?: string;
  paragraphs?: string[];
  /** Ordered how-to steps, rendered as a numbered list. */
  steps?: string[];
  /** A labelled tool CTA rendered as a quiet inline link block. */
  tool?: { label: string; toolId: string };
  /** Internal link to a non-tool page (SEO guide or blog path), quiet inline block. */
  pageLink?: { label: string; path: string; /** Anchor text; defaults to path. */ text?: string };
  /** Real-data table rendered inline, keyed by header + raw rows. */
  table?: { caption?: string; columns: string[]; rows: string[][] };
  /** Inline figure key, looked up in the blogFigures registry. */
  figure?: string;
  list?: string[];
  /**
   * Outbound citation links to sources outside gainutility.com. Used only
   * where a claim in the same block needs a reader-checkable reference.
   */
  externalLinks?: { href: string; text?: string }[];
  /** Copyable code block; `content` is the exact text written to the clipboard. */
  code?: { label?: string; content: string };
  /**
   * Live shadow preview paired with its declaration. The preview applies
   * `${property}: ${value}` and the copy button writes the same string, so
   * what you see is byte-for-byte what you paste.
   */
  shadowDemo?: {
    label: string;
    property: "box-shadow" | "text-shadow" | "filter";
    value: string;
    /** Corner radius of the preview card. */
    radius?: number;
    stageBg?: string;
    /** Fill color of the preview card (defaults to white; match stageBg for neumorphism). */
    boxBg?: string;
    /** Sample text for text-shadow demos. */
    text?: string;
    /** Render a transparent star shape (shows box-shadow vs drop-shadow shapes). */
    star?: boolean;
  };
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: string;
  date: string; // ISO date, e.g. "2026-08-14"
  readingTime: string; // human label, e.g. "6 min read"
  tags: string[];
  /** Rendered as bytes-lite blocks on the article page. */
  content: BlogBlock[];
  /**
   * Direct, honest answer to the article's question, shown in a quiet box
   * right after the intro. Falls back to `keyTakeaway` when absent.
   */
  quickAnswer?: string;
  /** One-sentence takeaway rendered in a quiet box at the end of the body. */
  keyTakeaway: string;
  /** Tool CTA shown after the main body (contextual). */
  toolCta?: { label: string; toolId: string };
  /** Related article slugs — must exclude self. */
  relatedArticles: string[];
  seoTitle: string;
  seoDescription: string;
  /** Localized category label (only present on locale-resolved overlays). */
  categoryLabel?: string;
  /**
   * Per-locale localized variant of the article (meta, copy, body blocks and
   * CTA labels). English is the article's source; every other locale that has
   * a real translation lives here. The category label, author, date and slug
   * are shared across locales.
   */
  localized?: Partial<Record<LocaleCode, LocalizedBlogArticle>>;
}

/** The localizable surface of a blog article (subset of BlogArticle). */
export interface LocalizedBlogArticle {
  title: string;
  description: string;
  readingTime: string;
  tags?: string[];
  content: BlogBlock[];
  quickAnswer?: string;
  keyTakeaway?: string;
  toolCta?: { label: string; toolId: string };
  seoTitle: string;
  seoDescription: string;
  /** Category label in the target language (falls back to English). */
  categoryLabel?: string;
}

/* ----------------------------------------------------------------------
 * Articles
 * -------------------------------------------------------------------- */

export const BLOG_ARTICLES: BlogArticle[] = [
  /* ------------------------------- Images --------------------------- */
  {
    id: "remove-background-from-image",
    slug: "how-to-remove-background-from-an-image",
    title: "How to Remove a Background From an Image",
    description:
      "A plain background is the easy case: sample the colour, remove it, check the edges, and download a transparent PNG. All in your browser.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-11",
    readingTime: "5 min read",
    tags: ["background remover", "images", "transparent background", "privacy"],
    quickAnswer:
      "Open the GainUtility background remover, load an image with a plain background, sample the background colour, and remove it. The result is a transparent PNG that downloads straight to your device.",
    content: [
      {
        paragraphs: [
          "Most of the time when people say \u201cremove the background\u201d, the background is one plain colour: a white photo backdrop, a blue screen, a light paper sweep. For that very common case you don't need an image editor or a service that emails you a result. You need colour detection, a tolerance control, and a little care with the edges.",
          "The manual route — lasso, feather, zoom in and chase stray pixels — takes minutes and still looks rough. The commercial route uploads your photo to a server and usually charges after the first image. There's a middle path, and it runs entirely in your browser.",
        ],
      },
      {
        heading: "When colour-based removal works best",
        paragraphs: [
          "Colour-based (chroma-key) removal deletes every pixel close to the sampled background colour. It shines on a specific, very common set of images:",
        ],
        list: [
          "Product photos shot on white or plain backdrops, for catalogs and marketplaces.",
          "Scanned documents, receipts, and ID photos with plain backgrounds.",
          "Logos and graphics sitting on a solid block of colour.",
          "Screenshots or renders where the environment behind the subject is uniform.",
        ],
      },
      {
        heading: "Where it gets harder",
        paragraphs: [
          "If the subject has hair strands, glass, or a shadow that's the same colour as the background, a quick removal leaves a colour halo or punches a hole in the object. That's expected behaviour, not a broken tool — and it's why the preview step matters. Sample a middle tone of the background instead of the darkest corner, raise tolerance a little, and zoom in on the edges before you accept the result.",
        ],
        tool: {
          label: "The GainUtility background remover runs entirely in your browser.",
          toolId: "background-remover",
        },
      },
      {
        heading: "Step by step: remove a background in your browser",
        paragraphs: [
          "For a uniform background, the whole task takes about a minute and needs nothing installed.",
        ],
        steps: [
          "Open the GainUtility background remover and drop in your image (or click to browse, or paste from the clipboard).",
          "Sample the background colour by clicking it. If the image has plain corners, the tool usually detects the right colour for you automatically.",
          "Adjust the tolerance: higher values remove a broader range of similar shades, lower values keep only the exact colour you clicked.",
          "Apply a little edge feathering so the cutout blends instead of showing a hard rim.",
          "Remove the background, inspect the before/after result — transparency shows as a checkerboard pattern — then download the PNG.",
        ],
      },
      {
        heading: "Why browser-local processing matters",
        paragraphs: [
          "Nothing is uploaded, so there's no waiting for a transfer, no per-image free-tier cap, and no copy of your photo left on a third-party server. The trade-off is honesty about the method: colour removal is not AI subject detection. Use it on the right images and the edges are just as clean.",
        ],
      },
    ],
    toolCta: {
      label: "Remove a background now — no upload, no account, nothing leaves your device.",
      toolId: "background-remover",
    },
    relatedArticles: [
      "how-to-make-a-transparent-png",
      "background-remover-for-product-photos",
      "how-to-compress-an-image",
    ],
    keyTakeaway:
      "Colour-based removal cleans solid-background images in your browser — sample the colour, check the edges, and the file never leaves your device.",
    seoTitle: "How to Remove a Background From an Image | GainUtility",
    seoDescription:
      "Remove a plain background in your browser: sample the colour, tune the tolerance, check the edges, and download a transparent PNG. No upload.",
  },
  {
    id: "make-a-transparent-png",
    slug: "how-to-make-a-transparent-png",
    title: "How to Make a Transparent PNG",
    description:
      "A transparent background lets an image sit on any page colour without a box around it. Here's how to produce one in your browser.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-11",
    readingTime: "4 min read",
    tags: ["transparent png", "transparent background", "png", "images"],
    quickAnswer:
      "Open the background remover, load an image with a plain background, remove the background colour, and download as PNG. The alpha channel is real, so the transparency works in every editor.",
    content: [
      {
        paragraphs: [
          "A PNG with a transparent background lets an image sit on any page colour, slide background, or printed surface without a white or black rectangle around it. It's the difference between a logo that looks like a sticker and one that looks like it belongs.",
        ],
      },
      {
        heading: "Why transparency requires PNG",
        paragraphs: [
          "JPG is great at photos and terrible at transparency — every JPG is a full rectangle. PNG supports an alpha channel, which stores per-pixel transparency. That makes PNG the standard format for anything that gets layered: website icons, presentation graphics, product shots on coloured store pages, and print layouts.",
        ],
      },
      {
        heading: "\u201cWhite background\u201d is not \u201cno background\u201d",
        paragraphs: [
          "A photo with a white background is still a rectangle. Put it on a dark slide and the white border becomes part of the design whether you wanted it or not.",
          "A transparent PNG is the subject floating on nothing. The background is gone, so the image inherits whatever surface it's placed on. For product photos and logos that is usually exactly what you need.",
        ],
      },
      {
        heading: "How to make a transparent PNG in your browser",
        paragraphs: [
          "When the background is a solid or near-solid colour, you can produce a transparent PNG in about a minute:",
        ],
        steps: [
          "Open the GainUtility background remover and load your image.",
          "Make sure the background type is set to transparent (the default).",
          "Sample the background colour by clicking it, or keep the automatically detected corner colour.",
          "Adjust tolerance so the subject stays intact while the background disappears.",
          "Check the before/after view — the cutout preview shows a checkerboard pattern, which is how editors mark transparency.",
          "Download the result as PNG. The file has a real alpha channel, readable by every image viewer and editor.",
        ],
      },
      {
        heading: "When not to bother",
        paragraphs: [
          "Some marketplaces re-add a white backdrop themselves, so a transparent upload can look different than intended — check the listing format first. And colour removal only shines on uniform backgrounds; for hair against a busy backdrop, a dedicated editor is the honest tool for the job.",
        ],
        tool: {
          label: "Make your own transparent PNG with the GainUtility background remover.",
          toolId: "background-remover",
        },
      },
    ],
    toolCta: {
      label: "Turn an image into a transparent PNG in your browser.",
      toolId: "background-remover",
    },
    relatedArticles: [
      "how-to-remove-background-from-an-image",
      "background-remover-for-product-photos",
      "how-to-resize-an-image",
      "make-a-favicon-from-any-image",
    ],
    keyTakeaway:
      "Transparency means no background at all: colour removal gives you a true alpha channel PNG right in the browser.",
    seoTitle: "How to Make a Transparent PNG | GainUtility",
    seoDescription:
      "Make a transparent PNG in your browser. Sample the background colour, remove it, and download a file with a true alpha channel — no upload.",
  },
  {
    id: "compress-image-guide",
    slug: "how-to-compress-an-image",
    title: "How to Compress Images Without Losing Too Much Quality",
    description:
      "Image size has two dials — dimensions and quality. Change them in the right order and the picture still looks good.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "4 min read",
    tags: ["image compression", "jpg", "quality", "web performance"],
    quickAnswer:
      "Resize first — cutting dimensions is the big win and costs almost nothing visually. Then lower quality in steps and check the preview. A 4000-px photo can drop from 4.8 MB to around 1.2 MB without looking damaged.",
    content: [
      {
        paragraphs: [
          "A phone photo these days is 4,000 pixels wide and several megabytes. If its only job is a web page, an email, or an upload form, that's a lot of wasted bytes — and wasted bytes mean slow pages and rejected uploads.",
          "The good news is that file size has only two dials, and you control both.",
        ],
      },
      {
        heading: "Dial one: dimensions",
        paragraphs: [
          "Halving the width and height of an image cuts its pixel count to a quarter. Resize first because it's the largest, least harmful lever. A 4000 × 3000 photo scaled to 2000 px wide is a fraction of the file, and at typical viewing sizes nobody can tell the difference.",
        ],
      },
      {
        heading: "Dial two: quality",
        paragraphs: [
          "JPG quality is a percentage that trades file size for detail. High values (90+) preserve fine detail at a large cost; values around 60–70 usually look fine for photos on screen.",
          "The trap is turning quality down before resizing, or both at once — you end up blurry with no size benefit. Do it in order, then check.",
        ],
        tool: {
          label: "The Image Converter lets you resize and dial quality in one preview.",
          toolId: "image-converter",
        },
      },
      {
        heading: "A realistic before and after",
        paragraphs: [
          "Here's what the two dials do to a real phone photo:",
        ],
        list: [
          "Original: 4000 × 3000 px, quality 92 — about 4.8 MB.",
          "After resize to 2000 px wide and quality 62: about 1.2 MB.",
          "You lose visible sharpness only if you print it. For screens, uploads, and listings, it's the same picture.",
        ],
      },
      {
        heading: "When to stop compressing",
        paragraphs: [
          "Stop when the file does its job and the preview still looks right. If you can see banding in skies or mush in fine lines, back the quality up by 10 and re-check. The right size is the smallest one you can't tell from the original at its actual display size.",
        ],
      },
    ],
    toolCta: {
      label: "Shrink an image — resize and convert to WebP in one preview.",
      toolId: "image-converter",
    },
    relatedArticles: [
      "how-to-resize-an-image",
      "background-remover-for-product-photos",
      "fix-pdf-too-big-to-upload",
    ],
    keyTakeaway:
      "Change dimensions first, quality second, and only compress until the preview stops looking right.",
    seoTitle: "How to Compress Images Without Losing Quality | GainUtility",
    seoDescription:
      "Image size has two dials — dimensions and quality. Change them in the right order and keep the picture looking good in your browser.",
  },
  {
    id: "resize-image-guide",
    slug: "how-to-resize-an-image",
    title: "How to Resize an Image to an Exact Pixel Size",
    description:
      "Upload forms ask for exact pixel sizes and KB limits. Here's how to hit the numbers without opening a photo editor.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "5 min read",
    tags: ["resize", "images", "pixels", "forms"],
    quickAnswer:
      "Open the image resizer, upload, switch to exact dimensions, type the required width and height (e.g. 1200 × 900), and export. Match the requested orientation — forcing a portrait crop into landscape is what causes the distortion that gets forms rejected.",
    content: [
      {
        paragraphs: [
          "A form asks for \u201cphoto, 1200 × 900 or less, under 1 MB\u201d. Most people react by guessing: upload the photo, get rejected, open a random editor, fiddle. There's a calmer order for this, and it starts with reading the requirement as two separate numbers.",
        ],
      },
      {
        heading: "Dimensions first, then size",
        paragraphs: [
          "The pixel requirement is the strict one — a form checks it directly. So hit exact pixels first: set the width and height to the allowed maximum, or smaller than it. Then, if the file is still over a KB limit, reduce quality. Resizing to size and resizing to quality are different jobs.",
        ],
      },
      {
        heading: "The distortion trap",
        paragraphs: [
          "If you stretch a portrait photo to landscape dimensions, the picture gets squashed and the form (or a reviewer) notices. When the photo doesn't match the requested orientation, crop toward the subject rather than stretching. A 1200 × 900 crop of a 4000 × 3000 photo keeps the important part and the right proportions.",
        ],
      },
      {
        heading: "A realistic before and after",
        paragraphs: [
          "The same camera shot, resized for a listing form:",
        ],
list: [
          "Original: 4032 × 3024 px wide, about 4.6 MB.",
          "Resized to 1200 × 900 px: about 780 KB — well under a 1 MB limit.",
          "One step, one preview, done.",
        ],
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Open the GainUtility image resizer and load your image.",
          "Switch the mode to exact dimensions.",
          "Enter the required size. Keep the required orientation — crop instead of stretch if they don't match.",
          "Check the preview; adjust the crop if a useful part of the photo is being cut off.",
          "Export and upload. If the file is still too large for a KB limit, follow it with the compressor.",
        ],
        tool: {
          label: "The Image Resizer sets exact pixel dimensions with a live preview.",
          toolId: "image-resizer",
        },
      },
    ],
    toolCta: {
      label: "Resize an image to exact pixels in your browser.",
      toolId: "image-resizer",
    },
    relatedArticles: [
      "how-to-compress-an-image",
      "background-remover-for-product-photos",
      "fix-pdf-too-big-to-upload",
    ],
    keyTakeaway:
      "Read the requirement as two numbers: hit exact pixels with resize and crop, then shrink to a KB limit with quality.",
    seoTitle: "How to Resize an Image to an Exact Pixel Size | GainUtility",
    seoDescription:
      "Resize an image to an exact pixel size in your browser — width, height, and KB limits handled in the right order, with a live preview.",
  },
  {
    id: "background-remover-for-product-photos",
    slug: "background-remover-for-product-photos",
    title: "How to Prepare Product Photos for Your Online Store",
    description:
      "Consistent, clean product photos come from plain backdrops and careful edges. Here's the workflow for a catalog that looks intentional.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-11",
    readingTime: "4 min read",
    tags: ["product photos", "e-commerce", "background remover", "store listings"],
    quickAnswer:
      "Shoot on a plain, evenly lit backdrop, then remove the background, check the edges, and export a transparent PNG at a consistent size. Listings read well in search grids, and you can reuse one clean shot anywhere.",
    content: [
      {
        paragraphs: [
          "Marketplaces and independent stores both reward consistent product photos. Listings with a clean, uniform background photograph well, read clearly in search grids, and convert better than shots with cluttered rooms or harsh shadows behind the item.",
          "The useful part: most e-commerce photography is already shot on plain backdrops — white, light gray, or neutral paper. That setup is exactly what a colour-based background remover handles best.",
        ],
      },
      {
        heading: "What makes a product photo easy to clean",
        paragraphs: [
          "The most reliable shots use a consistent surface behind the item — a solid-colour sweep, a light tent, or a plain wall. That uniformity is what lets you separate the product from the background automatically.",
          "Remove the background from such a shot and you get a transparent file you can place on any store page colour, keep on white, or composite onto a styled backdrop. One source photo goes from a single listing to usable anywhere.",
        ],
      },
      {
        heading: "Practical notes for a catalog",
        paragraphs: [
          "Before you batch through your photos:",
        ],
        list: [
          "Avoid a background close to the product's colour — a white mug on white paper needs a delicate tolerance so the mug doesn't get eaten by the removal.",
          "Watch the edges. Light feathering reduces the hard outline, but edges that rely on soft shadows may need a light touch-up pass.",
          "Export PNG for transparency, or JPG if your marketplace flattens images back onto white anyway.",
          "Keep dimensions consistent across the catalog so the grid looks tidy.",
        ],
      },
      {
        heading: "The workflow",
        paragraphs: [
          "For a plain-background product shot, the whole job is: upload, sample the background, tune tolerance and feathering, remove, check the cutout, and export. Because processing happens in your browser, there's no upload queue and no per-image cost — useful when you're cleaning a whole batch of listings.",
          "This is not a replacement for professional retouching on intricate subjects. For the standard store product shot, it's faster than masking by hand in an editor.",
        ],
        tool: {
          label: "Clean up product photos with the background remover — runs locally.",
          toolId: "background-remover",
        },
      },
    ],
    toolCta: {
      label: "Prepare product photos for your store — free and in your browser.",
      toolId: "background-remover",
    },
    relatedArticles: [
      "how-to-resize-an-image",
      "how-to-compress-an-image",
      "how-to-make-a-transparent-png",
    ],
    keyTakeaway:
      "Plain-backdrop product shots are the fast lane for browser-based removal — clean, consistent listings without opening an editor.",
    seoTitle: "How to Prepare Product Photos for Your Store | GainUtility",
    seoDescription:
      "Clean product photography for e-commerce: plain backgrounds, consistent framing, and transparent exports that sit on any store colour. Free, in your browser.",
  },

  /* ------------------------------- PDF ------------------------------ */
  {
    id: "merge-pdf-guide",
    slug: "how-to-merge-pdf-files",
    title: "How to Merge Multiple PDFs Into One File",
    description:
      "Combining PDFs is mostly about order and naming. Do both deliberately and one merged file is easier to share, submit, and find later.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "5 min read",
    tags: ["pdf", "merge", "combine"],
    quickAnswer:
      "Upload the PDFs in reading order, arrange them the way the final document should read, then merge. Name the result with the subject first (e.g. scan-all.pdf), not \u201cfinal\u201d or \u201cnew\u201d.",
    content: [
      {
        paragraphs: [
          "Merging PDFs sounds trivial until the filename problem catches up with you. The files combine fine — but if the pages are jumbled or the result is named \u201cfinal-final.pdf\u201d, you've traded several files for one you can't find.",
        ],
      },
      {
        heading: "Order is the whole job",
        paragraphs: [
          "The merged document reads in exactly the order the files sit in the list. That's the one decision that matters, and it's easy to get wrong on page 3 of a 20-page merge.",
          "A practical habit: number the source files before merging — scan-1.pdf, scan-2.pdf, scan-3.pdf — so the list order matches the reading order and is obvious at a glance.",
        ],
        tool: {
          label: "The PDF Merger joins files in the order you lay them out.",
          toolId: "merge-pdf",
        },
      },
      {
        heading: "When merging is the right move",
        paragraphs: [
          "Merging is the right move when the combined file has one job: a single submission, a single share link, one attachment an examiner or a client actually opens. Three related documents with three names is three chances for one of them to be missed.",
        ],
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Open the GainUtility PDF merger.",
          "Add the source files in reading order — if it matters, rename them with numbers first so there's no guesswork.",
          "Drag to reorder in the list if anything lands wrong.",
          "Merge and download, then rename the result with the subject first: scan-all.pdf instead of final.pdf.",
          "Open the merged file once and flip through it before sending it anywhere.",
        ],
      },
    ],
    toolCta: {
      label: "Merge PDFs in the order you want — in your browser.",
      toolId: "merge-pdf",
    },
    relatedArticles: [
      "how-to-split-a-pdf",
      "how-to-compress-a-pdf",
      "how-to-convert-jpg-to-pdf",
      "how-to-convert-word-to-pdf",
    ],
    keyTakeaway:
      "Merge in reading order and name the result with the subject first — the two habits that keep a combined document tidy.",
    seoTitle: "How to Merge Multiple PDFs Into One File | GainUtility",
    seoDescription:
      "Merge PDFs in reading order and keep the result findable — combine files in your browser, reorder them, and download one document.",
  },
  {
    id: "split-pdf-guide",
    slug: "how-to-split-a-pdf",
    title: "How to Split a PDF and Keep Only the Pages You Need",
    description:
      "Most splits are range extraction, not division in half. Pick the pages, keep only those, and cut a 20-page scan down to the two you wanted.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "4 min read",
    tags: ["pdf", "split", "extract pages"],
    quickAnswer:
      "Open the PDF splitter, upload the document, enter the page range you want to keep, and export. You get a new PDF with just those pages — the original stays untouched.",
    content: [
      {
        paragraphs: [
          "People say \u201csplit a PDF\u201d but they usually mean one of two different things: take one section out of a long document, or break it into many smaller files. Extracting a range is the version that comes up most, and it's the easier one.",
        ],
      },
      {
        heading: "The usual case: extract a range",
        paragraphs: [
          "A 20-page scan, and you need pages 7–9 for a submission. Or a syllabus PDF, and you want just the section you're studying. A range extraction gives you a new file with only those pages, exactly as numbered.",
        ],
      },
      {
        heading: "The other case: break into pieces",
        paragraphs: [
          "When a document truly needs to be several files — one chapter at a time, or every N pages — you're dividing, not extracting. Choose the pattern carefully: extraction keeps what you pick; splitting by page counts machines through the whole document.",
        ],
        tool: {
          label: "The PDF Splitter extracts a page range or splits by page count.",
          toolId: "split-pdf",
        },
      },
      {
        heading: "Step by step",
        paragraphs: [
          "For a range extraction:",
        ],
        steps: [
          "Open the GainUtility PDF splitter and upload the document.",
          "Choose extract mode (range) rather than divide mode, unless you really want the whole file chopped.",
          "Enter the start and end pages. Count pages in the original — the numbering is 1-based.",
          "Export. The original file is unchanged; you get a new, smaller PDF.",
          "Name the extract for what it is — report-pages-1-3.pdf — so it's findable later.",
        ],
      },
    ],
    toolCta: {
      label: "Extract only the pages you need from a PDF.",
      toolId: "split-pdf",
    },
    relatedArticles: [
      "how-to-merge-pdf-files",
      "fix-pdf-too-big-to-upload",
      "how-to-convert-pdf-to-jpg",
    ],
    keyTakeaway:
      "Most splits are extractions: pick the range, keep only those pages, and leave the original untouched.",
    seoTitle: "How to Split a PDF & Keep Only the Pages | GainUtility",
    seoDescription:
      "Split a PDF by extracting the page range you need in your browser. Keep only the pages you want, unchanged original, ready to submit.",
  },
  {
    id: "pdf-to-jpg-guide",
    slug: "how-to-convert-pdf-to-jpg",
    title: "How to Convert PDF Pages to JPG",
    description:
      "When a PDF needs to be an image, each page becomes one JPG. Pick the pages and the resolution, then export them as images.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "4 min read",
    tags: ["pdf", "jpg", "convert"],
    quickAnswer:
      "Upload the PDF, choose the pages to convert, pick a resolution, and export. Each page becomes a JPG — the result inherits the page count and any text becomes pixels.",
    content: [
      {
        paragraphs: [
          "A PDF is a document. A JPG is an image. Converting a PDF page to JPG is how you get something that image-only systems will accept — a photo submission portal, a social post, a preview thumbnail, a presentation slide.",
        ],
      },
      {
        heading: "One page, one JPG",
        paragraphs: [
          "Conversion is per page. A 3-page PDF produces three JPGs, named after the source with the page number. If a form accepts only one image, you're choosing the page that matters, not the whole document.",
        ],
      },
      {
        heading: "Resolution is the quality of pixelation",
        paragraphs: [
          "A PDF page is resolution-free until it's rasterized. Exporting at a low resolution makes a small, blurry image; higher resolution costs file size. For text you'll read on screen, medium is usually enough. For something that might be printed or zoomed, go higher.",
        ],
        tool: {
          label: "The PDF to JPG tool converts a page range at your chosen resolution.",
          toolId: "pdf-to-jpg",
        },
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Open the GainUtility PDF to JPG converter and upload the document.",
          "Choose the pages to convert — a range, or just the one page you need.",
          "Pick a resolution. Medium for screen, higher for print or review.",
          "Export. Collect the JPGs as they download.",
          "Check one image before you submit it — at actual size, not zoomed to 100% in an editor you trust.",
        ],
      },
    ],
    toolCta: {
      label: "Convert PDF pages to individual JPGs.",
      toolId: "pdf-to-jpg",
    },
    relatedArticles: [
      "how-to-convert-jpg-to-pdf",
      "how-to-split-a-pdf",
      "fix-pdf-too-big-to-upload",
    ],
    keyTakeaway:
      "Each PDF page becomes one JPG — choose the pages and resolution before exporting, and check one image before you submit.",
    seoTitle: "How to Convert PDF Pages to JPG | GainUtility",
    seoDescription:
      "Convert PDF pages to JPG in your browser. Pick the pages and resolution, and export each page as a clean image — no upload, no signup.",
  },
  {
    id: "jpg-to-pdf-guide",
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to Convert JPG Images to a PDF",
    description:
      "Turn a set of images into one PDF in reading order, so everything lands in a single file you can submit, email, or keep together.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-12",
    readingTime: "4 min read",
    tags: ["pdf", "jpg", "convert", "scans"],
    quickAnswer:
      "Upload the JPGs in reading order, reorder them in the list if needed, and export as one PDF. Number the images first if you don't trust the upload order.",
    content: [
      {
        paragraphs: [
          "Every phone makes image sequences easy: photos of a document, a scanned chapter, a stack of pages shot with the camera. The hard part is that ten images stay ten files, and submissions want one. Converting them into a single PDF is the fix.",
        ],
      },
      {
        heading: "Reading order is the one decision",
        paragraphs: [
          "A JPG-to-PDF converter places images in the order they appear in the list. If you shoot ten pages, the order of the result depends on the order you select them — not the order your phone happened to save them.",
          "Easiest habit: rename before converting (page-01.jpg, page-02.jpg…). Then any upload order sorts itself, and the PDF lands in reading order.",
        ],
        tool: {
          label: "The JPG to PDF tool keeps the order you lay out.",
          toolId: "jpg-to-pdf",
        },
      },
      {
        heading: "When this is the right move",
        paragraphs: [
          "It's right whenever several images have one job: a single form upload, one email attachment, one file to keep on your phone. It's also the last step in a scanner workflow — grab the images, merge them, done.",
        ],
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Name your images in reading order first, to remove the guesswork.",
          "Open the GainUtility JPG to PDF tool and add the images.",
          "Drag to reorder the list so it matches how the document should read.",
          "Export the PDF and open it once to confirm the page order.",
          "Combine the result with other PDFs using the merger if you need one larger document.",
        ],
      },
    ],
    toolCta: {
      label: "Turn a sequence of images into one readable PDF.",
      toolId: "jpg-to-pdf",
    },
    relatedArticles: [
      "how-to-merge-pdf-files",
      "background-remover-for-product-photos",
      "how-to-make-a-transparent-png",
    ],
    keyTakeaway:
      "Set reading order first — number the images, lay them out, then convert. One PDF, in the order you intend.",
    seoTitle: "How to Convert JPG Images to a PDF | GainUtility",
    seoDescription:
      "Convert JPG images to a single PDF in your browser, in the order you choose. Perfect for photo sequences, scans, and submissions.",
  },
  {
    id: "compress-pdf-guide",
    slug: "how-to-compress-a-pdf",
    title: "How to Compress a PDF Without Losing What You Need",
    description:
      "A smaller PDF is only useful if it stays readable. See where the size comes from, then compress in steps you can check.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-06-15",
    readingTime: "4 min read",
    tags: ["pdf", "compress", "quality"],
    quickAnswer:
      "Scans are the heavy part — their images are the file. Compress in one controlled step, then check a page with fine detail. A 12 MB scan typically drops to around 4–5 MB while staying readable.",
    content: [
      {
        paragraphs: [
          "Everyone wants a smaller PDF, but a file that's tiny and unreadable isn't a win. The trick is to compress only as much as the file actually needs, and to check what you get.",
        ],
      },
      {
        heading: "Where the size comes from",
        paragraphs: [
          "Scanned PDFs are large because they're collections of images. File size tracks how big and detailed those images are. Reduce image quality or resolution and the file shrinks — that's the whole lever.",
        ],
      },
      {
        heading: "Not every page needs the same treatment",
        paragraphs: [
          "A text-heavy document survives moderate compression easily because there isn't much pixel detail to lose. A scanned page with a photo, diagram, or signature needs more care — push too far and fine lines blur.",
        ],
      },
      {
        heading: "Compress in controlled steps",
        paragraphs: [
          "Rather than crushing to the smallest possible size in one attempt, compress to a level you can still read, then check a page with fine detail. Adjust only if the file is still too large.",
          "A realistic example: a scanned report at 12.4 MB compressed on the medium setting comes out around 4.5 MB — under most submission limits while keeping the text legible.",
        ],
        tool: {
          label: "The Compress Images Inside PDF tool lets you pick a level and see the result.",
          toolId: "compress-images-inside-pdf",
        },
      },
      {
        heading: "When to accept the trade-off",
        paragraphs: [
          "If the document's only job is a quick skim or an upload with a hard size limit, some quality loss is fine. If you'll read it closely or need to preserve it, keep quality higher and accept the larger file.",
        ],
      },
    ],
    toolCta: {
      label: "Need a PDF under a size limit but still readable?",
      toolId: "compress-images-inside-pdf",
    },
    relatedArticles: [
      "fix-pdf-too-big-to-upload",
      "pdf-file-size-limits",
      "how-to-merge-pdf-files",
      "how-to-split-a-pdf",
      "are-online-pdf-tools-safe",
    ],
    keyTakeaway:
      "Only compress as much as a file needs: keep it readable first, then reduce size in controlled steps until it fits.",
    seoTitle: "How to Compress a PDF Without Losing Anything | GainUtility",
    seoDescription:
      "Compress a PDF in your browser while keeping it readable. Understand where size comes from and reduce it in steps you can check.",
  },
  {
    id: "watermark-pdf-guide",
    slug: "how-to-add-a-watermark-to-a-pdf",
    title: "How to Add a Watermark to a PDF",
    description:
      "A watermark marks a document as draft, owned, or shared — without getting in the way of the content. Here's how to place one sensibly.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-13",
    readingTime: "4 min read",
    tags: ["pdf", "watermark", "draft"],
    quickAnswer:
      "Open the PDF watermark tool, upload the document, type the watermark text (or add your image), pick placement and opacity, and export. Put it diagonally at low opacity so content stays readable.",
    content: [
      {
        paragraphs: [
          "The point of a watermark is to be noticed without being disruptive: this is a draft, this belongs to a client, this was shared on a certain date. A watermark that blocks the text underneath has failed at the one job it has.",
        ],
      },
      {
        heading: "Text or image watermark",
        paragraphs: [
          "Text watermarks cover the common cases — \u201cDRAFT\u201d, \u201cCONFIDENTIAL\u201d, a date, your name. Image watermarks matter when the look is the point: a logo across a sales deck, a signature over a scan. Both apply the same way: fixed to every page, positioned once.",
        ],
      },
      {
        heading: "Placement and opacity",
        paragraphs: [
          "Two settings decide whether a watermark looks intentional or like a mistake. A diagonal center watermark at moderate-to-low opacity can't be cropped away with a quick screenshot and still leaves content readable. Edge placement is subtler but easier to crop off in a screen grab — choose based on how protective you need to be.",
        ],
        tool: {
          label: "The PDF Watermark tool sets text or image, position, and opacity.",
          toolId: "add-pdf-watermark",
        },
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Open the GainUtility PDF watermark tool and upload the document.",
          "Add the text (or your image) and set the size and rotation.",
          "Pick placement — diagonal center is the sensible default for drafts.",
          "Set opacity low enough that a page of text still reads clearly underneath.",
          "Export and open one text-heavy page to confirm it's legible.",
        ],
      },
    ],
    toolCta: {
      label: "Add a watermark to a PDF without hiding the content.",
      toolId: "add-pdf-watermark",
    },
    relatedArticles: [
      "how-to-merge-pdf-files",
      "how-to-split-a-pdf",
      "how-to-convert-jpg-to-pdf",
    ],
    keyTakeaway:
      "A watermark should be seen but ignored — diagonal placement at low opacity marks the file without hiding the content.",
    seoTitle: "How to Add a Watermark to a PDF | GainUtility",
    seoDescription:
      "Add a text or image watermark to a PDF in your browser. Choose placement and opacity so it marks the file without hiding the content.",
  },
  {
    id: "pdf-too-big-guide",
    slug: "fix-pdf-too-big-to-upload",
    title: "How to Fix a PDF That's Too Big to Upload",
    description:
      "When a form rejects a PDF for size, work backwards: check the limit, find the heavy pages, then shrink in steps until it fits.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-09-13",
    readingTime: "5 min read",
    tags: ["pdf", "upload", "submissions", "size limit"],
    quickAnswer:
      "Check the form's size limit first, then compress the PDF in one controlled step and measure the result. If it's still too big, split out the irrelevant pages before you compress — not after.",
    content: [
      {
        paragraphs: [
          "Upload forms are blunt: a file is under the limit or it isn't. When your PDF is over, the fix is a short loop — measure, reduce, check — and it starts with reading the form correctly.",
        ],
      },
      {
        heading: "Read the limit before you touch the file",
        paragraphs: [
          "Every form states its limit somewhere — commonly 1 MB, 5 MB, or 10 MB. Writing it down before you start prevents the usual mistake: compressing to something arbitrary, checking the wrong file, and submitting a copy that's still too big.",
        ],
      },
      {
        heading: "Find what's heavy",
        paragraphs: [
          "A scanned PDF is heavy because each page is a full-size image. That's the file's weight, and it's where compression earns its keep. A 40-page scan of 9 MB can usually drop under 5 MB with the text staying clear.",
        ],
      },
      {
        heading: "Reduce in steps, check between each",
        paragraphs: [
          "Compress at one level, download, and check the new size against the limit. If it still misses, decide whether to compress harder or cut pages. Trying to hit the limit in one maximal pass is how files end up unreadable — yet another rejected submission.",
        ],
        tool: {
          label: "The Compress Images Inside PDF tool gives you a level to pick and shows the result.",
          toolId: "compress-images-inside-pdf",
        },
      },
      {
        heading: "Cut pages before compressing harder",
        paragraphs: [
          "If the PDF mostly needs one section — the declaration, a single form page — extract just that range. A smaller document needs far less compression to fit, so the text you keep stays sharper. Removing pages and compressing are different fixes; use the cheap one first.",
        ],
        tool: {
          label: "Extract only the pages you need with the PDF Splitter.",
          toolId: "split-pdf",
        },
      },
    ],
    toolCta: {
      label: "Bring a PDF under a submission limit — readable, not crushed.",
      toolId: "compress-images-inside-pdf",
    },
    relatedArticles: [
      "how-to-compress-a-pdf",
      "pdf-file-size-limits",
      "how-to-resize-an-image",
      "how-to-compress-an-image",
    ],
    keyTakeaway:
      "Work backwards from the form: write the limit down, find the heavy pages, compress in steps, and cut pages before crushing quality.",
    seoTitle: "How to Fix a PDF That's Too Big to Upload | GainUtility",
    seoDescription:
      "A PDF rejected for size fits in a few steps: check the limit, find the heavy pages, compress in steps, and cut pages before quality.",
  },

  /* ----------------------------- Developer -------------------------- */
  {
    id: "box-shadow-values-guide",
    slug: "box-shadow-values-real-websites",
    title: "What Box-Shadow Values Real Websites Actually Use",
    description:
      "We downloaded the homepages of the top 1,000 sites and counted every box-shadow in their CSS: 33,438 declarations across 533 reachable sites. Measured offsets, blur, spread, color, and layering — with the dataset to download.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-09-16",
    readingTime: "9 min read",
    tags: ["css", "box-shadow", "research", "design-systems"],
    quickAnswer:
      "Real production box-shadows are small and neutral. The median vertical offset is under a pixel, blur stays single-digit for three quarters of layers, nearly half of all layers sit at y=0, and about three quarters of colors are achromatic at an alpha of 0.3 or less. Single-layer shadows outnumber stacked ones, and focus rings ship as hard literal values while most softer effects go through custom properties.",
    content: [
      {
        paragraphs: [
          "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
          "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point.",
        ],
        figure: "box-shadow-headline-stats",
      },
      {
        heading: "How the measurement works",
        paragraphs: [
          "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
          "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
          "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
          "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics.",
        ],
      },
      {
        heading: "Almost every top site ships a real shadow",
        paragraphs: [
          "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
          "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties).",
        ],
      },
      {
        heading: "Where the shadow sits",
        paragraphs: [
          "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
          "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down.",
        ],
        figure: "box-shadow-y-offset",
      },
      {
        heading: "The blur is a lot smaller than the demos",
        paragraphs: [
          "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
          "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail.",
        ],
        figure: "box-shadow-blur",
      },
      {
        heading: "Spread, inset, and the focus ring pattern",
        paragraphs: [
          "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
          "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border.",
        ],
        figure: "box-shadow-spread-inset",
      },
      {
        heading: "Color: neutral, almost never opaque",
        paragraphs: [
          "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
          "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default.",
        ],
        figure: "box-shadow-alpha",
      },
      {
        heading: "One shadow, not a stack",
        paragraphs: [
          "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
          "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings.",
        ],
        figure: "box-shadow-layers",
      },
      {
        heading: "The most-shipped values",
        paragraphs: [
          "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
          "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution.",
        ],
        figure: "box-shadow-top-values",
      },
      {
        heading: "A third of sites route shadows through custom properties",
        paragraphs: [
          "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
          "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value.",
        ],
      },
      {
        heading: "The verdict table",
        paragraphs: [
          "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check.",
        ],
        table: {
          caption: "Six claims about box-shadow, graded against 21,887 measured layers.",
          columns: ["Claim", "What sites do (measured)", "Verdict"],
          rows: [
            [
              "Blur heavily for a soft modern look",
              "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
              "Only for big glows",
            ],
            [
              "Stack two–three layers like Material",
              "73.5% of declarations are a single layer; 3+ layers are 12.2%",
              "Only for design tokens",
            ],
            [
              "Offset down-and-right for depth",
              "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
              "Offset down — or not at all",
            ],
            [
              "Neutral color, low opacity",
              "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
              "Correct",
            ],
            [
              "Inset shadows are the depth staple",
              "Inset: 12.7% of layers, mostly pressed-button systems",
              "A deliberate choice, not the default",
            ],
            [
              "Upward (negative-Y) glow is common",
              "Negative Y offset: 1.3% of layers",
              "Rare",
            ],
          ],
        },
      },
      {
        heading: "Limits you should know before quoting this",
        list: [
          "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
          "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
          "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
          "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
          "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice.",
        ],
        figure: "box-shadow-dataset",
      },
      {
        heading: "How to use this in a design",
        paragraphs: [
          "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
          "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults.",
        ],
        tool: {
          label: "The Box Shadow Generator is preset so you can stack the measured bands directly.",
          toolId: "box-shadow-generator",
        },
      },
      {
        pageLink: {
          label: "For the value-by-value syntax reference and live copy-ready examples built on these bands, see the",
          path: "/css/box-shadow",
          text: "box-shadow guide",
        },
      },
    ],
    toolCta: {
      label: "Copy a measured production value with the Box Shadow Generator.",
      toolId: "box-shadow-generator",
    },
    relatedArticles: [
      "box-shadow-vs-drop-shadow-filter",
      "soft-shadow-css-recipes",
      "neumorphism-box-shadow-guide",
      "clean-up-css-gradients-and-borders-in-design-work",
    ],
    keyTakeaway:
      "Production box-shadows are small and neutral: keep the vertical offset at 1–4 px, blur single-digit, X at 0, and color as an achromatic low-alpha black — exactly what the top 1,000 actually ship.",
    seoTitle: "What Box-Shadow Values Real Websites Use | GainUtility",
    seoDescription:
      "We measured box-shadow in the shipped CSS of the top 1,000 websites: 33,438 declarations across 533 sites. Offsets, blur, spread, color, and layering, with the dataset to download.",
  },

  {
    id: "box-shadow-vs-drop-shadow",
    slug: "box-shadow-vs-drop-shadow-filter",
    title: "box-shadow vs filter: drop-shadow() — Which CSS Shadow to Use",
    description:
      "box-shadow draws the element's border box; filter: drop-shadow() follows the alpha shape of an image. Same-looking values are not interchangeable — the blur number even means something different.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-09-24",
    readingTime: "6 min read",
    tags: ["css", "box-shadow", "drop-shadow", "filter", "frontend"],
    quickAnswer:
      "Use box-shadow for UI surfaces: it follows the border box (rounded by border-radius), supports spread, inset, and comma-separated layers. Use filter: drop-shadow() for transparent shapes — PNG cut-outs, SVG icons — because it follows the alpha channel instead of the rectangle. The blur numbers are not equivalent: box-shadow's blur radius is twice the Gaussian standard deviation that drop-shadow's third length takes, so the same number in drop-shadow renders about twice as blurry.",
    content: [
      {
        paragraphs: [
          "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
          "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from.",
        ],
      },
      {
        heading: "Same element, different silhouette",
      },
      {
        shadowDemo: {
          label: "box-shadow on a transparent image — a rectangle behind the whole box",
          property: "box-shadow",
          value: "0 8px 16px rgba(16, 24, 40, 0.25)",
          star: true,
        },
      },
      {
        shadowDemo: {
          label: "filter: drop-shadow() on the same image — the shadow follows the star",
          property: "filter",
          value: "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
          star: true,
        },
      },
      {
        paragraphs: [
          "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects.",
        ],
      },
      {
        heading: "What each one accepts",
      },
      {
        table: {
          caption: "box-shadow, text-shadow, and drop-shadow() side by side.",
          columns: ["", "box-shadow", "text-shadow", "filter: drop-shadow()"],
          rows: [
            ["Silhouette", "Border box (border-radius applies)", "Every glyph's outline", "Element's alpha shape (pixels)"],
            ["Offsets", "X and Y", "X and Y", "X and Y"],
            ["Blur", "Blur radius (2× the Gaussian σ)", "Blur radius (2× the Gaussian σ)", "Gaussian standard deviation (σ)"],
            ["Spread", "Yes — 4th length", "No", "No"],
            ["inset", "Yes", "No", "No"],
            ["Multiple layers", "Comma-separated, first paints on top", "Comma-separated, first paints on top", "Chain functions: drop-shadow() drop-shadow()"],
            ["Where it applies", "Any box-level element", "Text content", "Any element, via the filter property"],
          ],
        },
      },
      {
        heading: "The blur number does not transfer",
      },
      {
        paragraphs: [
          "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
          "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves.",
        ],
        code: {
          label: "Equivalent pair — same visual blur",
          content:
            "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));",
        },
      },
      {
        heading: "Layers behave differently too",
      },
      {
        paragraphs: [
          "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
          "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory.",
        ],
      },
      {
        heading: "A practical rule",
      },
      {
        list: [
          "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
          "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
          "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
          "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites.",
        ],
      },
      {
        pageLink: {
          label: "For the full value-by-value reference and copy-ready starting points, see the",
          path: "/css/box-shadow",
          text: "box-shadow guide",
        },
      },
      {
        heading: "What about cost?",
      },
      {
        paragraphs: [
          "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise.",
        ],
      },
    ],
    toolCta: {
      label: "Build the box-shadow side visually — layers, inset, and rings with live preview.",
      toolId: "box-shadow-generator",
    },
    relatedArticles: [
      "soft-shadow-css-recipes",
      "neumorphism-box-shadow-guide",
      "box-shadow-values-real-websites",
      "clean-up-css-gradients-and-borders-in-design-work",
    ],
    keyTakeaway:
      "Choose by silhouette: box-shadow for the border box (with spread, inset, and comma layers), drop-shadow() for transparent artwork — and remember drop-shadow's third length is a standard deviation, so halve the blur when you port.",
    seoTitle: "box-shadow vs drop-shadow: Which CSS Shadow? | GainUtility",
    seoDescription:
      "box-shadow follows the border box; drop-shadow() follows the image's alpha shape. Plus: why the same blur number renders twice as blurry in a filter.",
  },

  {
    id: "soft-shadow-css-guide",
    slug: "soft-shadow-css-recipes",
    title: "Soft Shadow CSS Recipes That Don't Turn Out Muddy",
    description:
      "Copy-ready soft box-shadow values for cards, floating panels, and hover states — plus why stacked shadows go muddy, and the alpha-first method that keeps them clean.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-09-22",
    readingTime: "7 min read",
    tags: ["css", "box-shadow", "design-systems", "frontend"],
    quickAnswer:
      "Soft does not mean big and dark. Production shadows stay small and neutral: in our measurement of the top 1,000 sites the median blur is 3px, 93.1% of layers keep X at zero, and about three quarters sit at alpha ≤ 0.3. Build softness from low alpha and a second, wider layer — not from a 40px blur at 0.4 black.",
    content: [
      {
        paragraphs: [
          "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
          "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses.",
        ],
        pageLink: {
          label: "Every number cited here comes from that dataset — full methodology in the",
          path: "/blog/box-shadow-values-real-websites",
          text: "measured box-shadow values article",
        },
      },
      {
        heading: "Why soft shadows go muddy",
      },
      {
        list: [
          "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
          "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
          "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
          "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card.",
        ],
      },
      {
        heading: "Recipe 1 — the one-layer raise",
      },
      {
        paragraphs: [
          "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%.",
        ],
        shadowDemo: {
          label: "One-layer raise — production-verified",
          property: "box-shadow",
          value: "0 1px 2px rgba(0, 0, 0, 0.1)",
          radius: 14,
        },
      },
      {
        heading: "Recipe 2 — contact + ambient",
      },
      {
        paragraphs: [
          "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card.",
        ],
        shadowDemo: {
          label: "Contact + ambient card",
          property: "box-shadow",
          value: "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
          radius: 16,
        },
      },
      {
        heading: "Recipe 3 — floating panel",
      },
      {
        paragraphs: [
          "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness.",
        ],
        shadowDemo: {
          label: "Floating panel",
          property: "box-shadow",
          value: "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
          radius: 20,
        },
      },
      {
        heading: "Recipe 4 — soft headline",
      },
      {
        paragraphs: [
          "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would.",
        ],
        shadowDemo: {
          label: "Soft text shadow",
          property: "text-shadow",
          value: "0 2px 8px rgba(0, 0, 0, 0.45)",
          text: "Soft headline",
        },
      },
      {
        heading: "The alpha-first method",
      },
      {
        paragraphs: [
          "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains.",
        ],
        steps: [
          "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
          "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
          "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
          "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
          "If it still looks flat, add a second wider rung with negative spread instead of darkening the first.",
        ],
        code: {
          label: "Tokenized soft shadow — paste into a stylesheet",
          content:
            ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}",
        },
      },
      {
        pageLink: {
          label: "Nine more declarations with live previews live in the",
          path: "/css/box-shadow/examples",
          text: "box-shadow examples gallery",
        },
      },
    ],
    toolCta: {
      label: "Tune any of these recipes layer by layer with a live preview.",
      toolId: "box-shadow-generator",
    },
    relatedArticles: [
      "box-shadow-values-real-websites",
      "box-shadow-vs-drop-shadow-filter",
      "neumorphism-box-shadow-guide",
    ],
    keyTakeaway:
      "Softness comes from low alpha and spacing, not blur volume: X at 0, Y at 1–4px, single-digit blur, neutral black at 0.08–0.12 — then add a second rung rather than a darker one.",
    seoTitle: "Soft Shadow CSS Recipes That Don't Turn Muddy | GainUtility",
    seoDescription:
      "Copy-ready soft box-shadow values for cards, panels, and text — grounded in measured production data, with the alpha-first method for tuning them.",
  },

  {
    id: "neumorphism-box-shadow-guide",
    slug: "neumorphism-box-shadow-guide",
    title: "Neumorphism Box Shadow: The Two-Layer Formula and Its Limits",
    description:
      "How soft-UI neumorphism works: one light layer, one dark layer, background matched to surface. Copy the formula, the inset variant, and where the style still makes sense.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-09-19",
    readingTime: "6 min read",
    tags: ["css", "box-shadow", "neumorphism", "soft-ui", "frontend"],
    quickAnswer:
      "Neumorphism is two outer box-shadows on an element whose background exactly matches its container: a light layer toward the top-left and a dark layer toward the bottom-right, so the surface appears extruded rather than floating. It works for decorative controls on a single flat background; it struggles wherever interactive elements need clear boundaries — the element and the page share one color, so only faint shading separates them.",
    content: [
      {
        paragraphs: [
          "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect.",
        ],
      },
      {
        heading: "The formula",
      },
      {
        paragraphs: [
          "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt.",
        ],
        code: {
          label: "The core declaration",
          content:
            "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);",
        },
      },
      {
        paragraphs: [
          "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:",
        ],
        shadowDemo: {
          label: "Extruded — light up-left, dark down-right",
          property: "box-shadow",
          value: "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
          radius: 24,
          stageBg: "#E4E8E2",
          boxBg: "#E4E8E2",
        },
      },
      {
        heading: "Why the background must match",
      },
      {
        paragraphs: [
          "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
          "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips.",
        ],
      },
      {
        heading: "The inset (pressed) variant",
      },
      {
        paragraphs: [
          "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim.",
        ],
        shadowDemo: {
          label: "Pressed — both layers inset",
          property: "box-shadow",
          value:
            "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
          radius: 24,
          stageBg: "#E4E8E2",
          boxBg: "#E4E8E2",
        },
      },
      {
        heading: "Where it works — and where it doesn't",
      },
      {
        paragraphs: [
          "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable.",
        ],
        list: [
          "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
          "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
          "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
          "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge.",
        ],
      },
      {
        heading: "A working checklist",
      },
      {
        steps: [
          "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
          "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
          "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
          "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
          "Pair the pressed state with the inset variant so the control has a clear down position.",
        ],
        pageLink: {
          label: "For inset syntax, focus rings, and more component examples, see the",
          path: "/css/box-shadow",
          text: "box-shadow guide",
        },
      },
    ],
    toolCta: {
      label: "Start from the Neumorphism preset and tune both layers against a matching stage.",
      toolId: "box-shadow-generator",
    },
    relatedArticles: [
      "soft-shadow-css-recipes",
      "box-shadow-values-real-websites",
      "box-shadow-vs-drop-shadow-filter",
    ],
    keyTakeaway:
      "Neumorphism = matching background + light layer up-left + dark layer down-right (+ inset flip for pressed). Reserve it for decorative surfaces, and give real controls an explicit focus ring.",
    seoTitle: "Neumorphism Box Shadow: Formula & Limits | GainUtility",
    seoDescription:
      "Copy the neumorphism box-shadow formula (outer and inset), why the background must match the surface, and where soft UI works vs fails.",
  },

  {
    id: "json-format-debug-guide",
    slug: "format-and-debug-json-when-api-responses-are-unreadable",
    title: "How to Read and Fix Unreadable JSON From an API",
    description:
      "Minified API responses are one long line until you adopt the three-habit routine: format first, validate second, diff after a change.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-05-18",
    readingTime: "4 min read",
    tags: ["json", "developer", "debugging"],
    quickAnswer:
      "Format the response first, validate it if anything fails to parse, and diff against a known-good copy after a change. Format → validate → diff, in that order, is the whole habit.",
    content: [
      {
        paragraphs: [
          "Open a raw API response and you'll often see one long line of JSON with no spaces. It's technically correct and completely unreadable — and the fix is a habit, not a skill.",
        ],
      },
      {
        heading: "Why it looks like that",
        paragraphs: [
          "APIs usually return minified JSON to save bandwidth. Whitespace and line breaks are stripped because they add bytes. Great for the server, terrible for the person trying to read it.",
        ],
      },
      {
        heading: "Format first",
        paragraphs: [
          "Before you try to parse a response in your head, format it. A formatter rebuilds the indentation and line breaks, turning one dense line into a structure you can scan. One line becomes a small tree:",
        ],
        tool: {
          label: "The JSON Beautifier makes a minified response readable in one step.",
          toolId: "json-beautifier",
        },
      },
      {
        heading: "Validate before you trust",
        paragraphs: [
          "If something isn't parsing, check whether the JSON is even valid before hunting for logic bugs. A trailing comma or an unescaped quote breaks an entire object — faster to confirm that than to debug a phantom.",
        ],
        tool: {
          label: "The JSON Validator points at the exact problem in an invalid payload.",
          toolId: "json-validator",
        },
      },
      {
        heading: "Diff after you change things",
        paragraphs: [
          "When you're checking whether a fix worked, a side-by-side diff beats eyeballing two long strings. See exactly which keys moved — and which you didn't mean to touch.",
        ],
        tool: {
          label: "The JSON Diff tool highlights exactly what changed between two responses.",
          toolId: "json-compare-diff",
        },
      },
    ],
    toolCta: {
      label: "Got a minified or broken JSON response? Start with the Beautifier.",
      toolId: "json-beautifier",
    },
    relatedArticles: [
      "how-to-make-a-qr-code",
      "clean-up-css-gradients-and-borders-in-design-work",
      "write-seo-title-and-meta-description-in-twenty-minutes",
      "compare-two-json-files-without-losing-your-place",
    ],
    keyTakeaway:
      "Format → validate → diff: three small habits turn any unreadable JSON response into something you can actually reason about.",
    seoTitle: "How to Fix Unreadable JSON From an API | GainUtility",
    seoDescription:
      "Minified or broken API responses, fixed with three habits: format the JSON, validate it, and diff it after a change. Free browser tools.",
  },
  {
    id: "qr-code-guide",
    slug: "how-to-make-a-qr-code",
    title: "How to Make a QR Code That Actually Scans",
    description:
      "The URL and the error-correction level decide whether a QR code scans the first time. Get those right and the rest is easy.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-09-13",
    readingTime: "5 min read",
    tags: ["qr code", "developer", "tools"],
    quickAnswer:
      "Decide what the code should contain, keep a URL short and final, choose a higher error-correction level, then generate, download, and scan it once with your own phone before printing.",
    content: [
      {
        paragraphs: [
          "A QR code fails in two ways: nobody scans it because it's buried or too small, or somebody scans it and it points somewhere wrong. The second one is the expensive failure — it's on you, not the scanner.",
        ],
      },
      {
        heading: "Decide what the code contains",
        paragraphs: [
          "Most codes hold a URL, which is the right default. Text or contact info have their uses, but a short URL gives you full control later — point it at a page that resolves, and the code can outlive the campaign.",
          "Make the URL the final destination and keep it short. Long URLs inflate the code's density, and dense codes are harder to scan from a poster or a bumper.",
        ],
      },
      {
        heading: "Error correction is a real setting",
        paragraphs: [
          "QR codes carry a redundancy level — low, medium, high. Higher redundancy means the code still scans when part of it is printed poorly, creased, or covered by a logo. For anything printed, choose a higher level: a few extra modules of pattern are a fair trade for a code that always works.",
        ],
        tool: {
          label: "The QR Code Generator sets the level, size, and format for you.",
          toolId: "qr-code-generator",
        },
      },
      {
        heading: "The step most people skip: test it",
        paragraphs: [
          "Generate, download, then scan the file with your own phone before you print or ship it. That one scan catches the dead URL, the wrong URL, and the code that's too small to read from the distance people will actually be at.",
        ],
      },
      {
        heading: "Step by step",
        paragraphs: [
          "The whole job, in order:",
        ],
        steps: [
          "Make the link you'll encode final — after it's live, not before.",
          "Open the GainUtility QR code generator and paste the URL.",
          "Choose a higher error-correction level for anything that will be printed.",
          "Pick a size that fits the usage — poster codes want more modules, not just more pixels.",
          "Download the high-resolution image.",
          "Scan it once with a phone before printing. That's the whole test.",
        ],
      },
    ],
    toolCta: {
      label: "Generate a QR code that scans the first time.",
      toolId: "qr-code-generator",
    },
    relatedArticles: [
      "write-seo-title-and-meta-description-in-twenty-minutes",
      "format-and-debug-json-when-api-responses-are-unreadable",
      "clean-up-css-gradients-and-borders-in-design-work",
    ],
    keyTakeaway:
      "Short, final URLs and a higher error-correction level beat clever designs — and a self-test scan beats all of it.",
    seoTitle: "How to Make a QR Code That Actually Scans | GainUtility",
    seoDescription:
      "Make a QR code in your browser that scans the first time. Keep the URL short and final, raise error correction, and test before printing.",
  },
  {
    id: "cleanup-css-gradients-design-work",
    slug: "clean-up-css-gradients-and-borders-in-design-work",
    title: "How to Tune CSS Gradients, Shadows, and Contrast Without Guessing",
    description:
      "The last ten percent of a UI is gradients, shadows, and contrast — the fiddly details that eat time until you preview them instead of guessing.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-05-04",
    readingTime: "4 min read",
    tags: ["css", "design", "gradients", "contrast"],
    quickAnswer:
      "Adjust gradients, shadows, and radii in a live preview tool and copy the finished CSS. Check foreground/background contrast against WCAG before shipping — one number beats eyeballing a colour.",
    content: [
      {
        paragraphs: [
          "The last ten percent of a UI is often the fiddliest. Getting a gradient to feel right, a shadow to sit naturally, or a border radius to look intentional takes almost as long as the whole design before it. The pattern that ends the guessing is simple: preview, don't type.",
        ],
      },
      {
        heading: "Gradients are forgiving until they aren't",
        paragraphs: [
          "A simple two-colour gradient is easy by hand. Add more stops, change the angle, or match a brand colour and the CSS gets harder to reason about. A visual preview shows the result while you adjust the stops.",
        ],
        tool: {
          label: "The Gradient Generator lets you tune stops and angles and copy the CSS.",
          toolId: "gradient-generator",
        },
      },
      {
        heading: "Shadows rarely work first try",
        paragraphs: [
          "A natural shadow needs the right offset, blur, spread, and a colour that isn't pure black. Nudging numbers in code to find that combination is slow — a live preview halves it.",
        ],
        tool: {
          label: "The Box Shadow Generator previews layers as you adjust them.",
          toolId: "box-shadow-generator",
        },
      },
      {
        heading: "Contrast is a number, not a feeling",
        paragraphs: [
          "A colour that looks fine can still fail WCAG contrast, which matters if anyone with a visual impairment reads that text. It's cheaper to check the pair early than to redo a button style late.",
        ],
        tool: {
          label: "The Contrast Checker tests a foreground and background pair against WCAG.",
          toolId: "contrast-checker",
        },
      },
      {
        heading: "Copy-paste beats retyping",
        paragraphs: [
          "The point of these tools is that you adjust visually and copy finished CSS instead of re-typing it from memory. That's the entire advantage — the fiddly part becomes a preview and a paste.",
        ],
      },
    ],
    toolCta: {
      label: "Tuning a gradient by hand? Preview it instead.",
      toolId: "gradient-generator",
    },
    relatedArticles: [
      "write-seo-title-and-meta-description-in-twenty-minutes",
      "format-and-debug-json-when-api-responses-are-unreadable",
      "how-to-make-a-qr-code",
    ],
    keyTakeaway:
      "Preview instead of guessing: gradients, shadows, and contrast all stop eating time the moment you see the result live.",
    seoTitle: "How to Tune CSS Gradients, Shadows & Contrast | GainUtility",
    seoDescription:
      "Tune CSS gradients, shadows, radii, and contrast with live preview tools and copy the finished CSS — no more guessing the numbers.",
  },

  /* -------------------------------- SEO ----------------------------- */
  {
    id: "seo-meta-tags-in-twenty-minutes",
    slug: "write-seo-title-and-meta-description-in-twenty-minutes",
    title: "How to Write a Page Title and Meta Description",
    description:
      "The title and meta description are the ad your page shows in search results. Write them like real sentences people read.",
    category: "SEO",
    author: "GainUtility",
    date: "2026-04-22",
    readingTime: "5 min read",
    tags: ["seo", "meta", "snippet", "search results"],
    quickAnswer:
      "Answer what the page does in one sentence. Make that the title, keep it under the display length, put the important words early, and render the pair in a search preview before you finish.",
    content: [
      {
        paragraphs: [
          "A page's title and meta description are what a search engine shows — and what a person actually reads before deciding to click. They don't require an SEO course. They require an honest answer to one question.",
        ],
      },
      {
        heading: "Start with what the page is for",
        paragraphs: [
          "Before writing anything, answer in a sentence: what does this page let someone do? Your title and description should reflect that answer, not a stacked list of keywords.",
        ],
      },
      {
        heading: "Write the title for reading, not ranking",
        paragraphs: [
          "A title should read like a clear headline. Keep it close to the length search engines display, put the most important words early, and accept that cramming more in makes it cut off or confusing.",
        ],
      },
      {
        heading: "Describe, don't hype",
        paragraphs: [
          "The description tells what the page offers, in a sentence someone would want to read. It's the thing that shows in search results, so make it useful rather than promotional.",
        ],
      },
      {
        heading: "Check the preview before you finish",
        paragraphs: [
          "The surest way to know if a title or description gets cut off is to render it. A search-results preview catches the truncation, the duplicate, and the bland phrasing in one look.",
        ],
        tool: {
          label: "The SEO Meta Generator builds the title and description tags and previews the snippet.",
          toolId: "seo-meta-generator",
        },
      },
      {
        heading: "Repeat the routine",
        paragraphs: [
          "Twenty minutes per page, done as a routine when you publish, is more effective than an occasional all-day cleanup. Consistency beats intensity when the goal is pages that stay honest and useful.",
        ],
      },
    ],
    toolCta: {
      label: "See how your title and description will render in search results.",
      toolId: "seo-meta-generator",
    },
    relatedArticles: [
      "how-to-make-a-qr-code",
      "format-and-debug-json-when-api-responses-are-unreadable",
      "clean-up-css-gradients-and-borders-in-design-work",
      "check-your-robots-txt-and-sitemap-before-submitting",
      "preview-a-link-before-you-share-it",
    ],
    keyTakeaway:
      "Purpose → readable title → honest description → render preview: a short routine that keeps search snippets useful.",
    seoTitle: "How to Write a Page Title and Meta Description | GainUtility",
    seoDescription:
      "Write a page title and meta description that read well in search results — a short, repeatable routine with a snippet preview.",
  },

  /* ---------------------------- Productivity ------------------------ */
  {
    id: "why-built-small-browser-tools",
    slug: "why-i-started-building-small-browser-tools",
    title: "Why I Started Building Small Browser Tools for Everyday Problems",
    description:
      "A short, honest note on why the site exists: not to be a giant platform, but to remove small daily friction with focused browser utilities.",
    category: "Productivity",
    author: "GainUtility",
    date: "2026-05-30",
    readingTime: "3 min read",
    tags: ["about", "tools", "craft"],
    content: [
      {
        paragraphs: [
          "Most of the problems I build tools for aren't impressive. They're the small, recurring annoyances that eat a few minutes each and never feel worth fixing properly.",
        ],
      },
      {
        heading: "The small-problem mindset",
        paragraphs: [
          "A file that's 10 KB too big. An image that needs to be a specific size. A JSON blob that needs formatting to be readable. Individually, each is a two-minute chore. But these chores add up, and they reuse the same three or four shapes.",
        ],
      },
      {
        heading: "Focused over sprawling",
        paragraphs: [
          "Instead of one giant \u201cdo everything\u201d portal, I prefer small tools that do one thing and do it clearly. You land on a page, you complete the task, you leave. No account, no onboarding, no clutter.",
        ],
      },
      {
        heading: "Processing close to the work",
        paragraphs: [
          "Wherever a task can run entirely in the browser, it should. Your file stays on your device, which means fewer decisions about privacy and no waiting on a server for something that didn't need one.",
        ],
      },
      {
        heading: "Why this blog",
        paragraphs: [
          "This blog is where I write down the real problems behind each tool — the thing I was trying to do, the manual work, and the tool that helped. If a tool helps you too, great. If not, the explanation might still be useful.",
        ],
      },
    ],
    toolCta: {
      label: "Browse the tools that came out of problems like these.",
      toolId: "image-resizer",
    },
    relatedArticles: [
      "how-to-remove-background-from-an-image",
      "format-and-debug-json-when-api-responses-are-unreadable",
      "how-to-compress-an-image",
    ],
    keyTakeaway:
      "Small, focused browser tools that run locally remove daily friction better than a sprawling platform ever could.",
    seoTitle: "Why I Build Small Browser Tools | GainUtility",
    seoDescription:
      "A short, honest note on why the site exists: not to be a giant platform, but to remove small daily friction with focused browser utilities.",
    localized: {
      "pt-br": {
        title: "Por que comecei a criar pequenas ferramentas de navegador para problemas do dia a dia",
        description:
          "Uma nota curta e honesta sobre por que o site existe: não para ser uma plataforma gigante, mas para remover atritos diários com utilitários de navegador bem focados.",
        readingTime: "3 min de leitura",
        tags: ["sobre", "ferramentas", "artesanato"],
        categoryLabel: "Produtividade",
        keyTakeaway:
          "Ferramentas de navegador pequenas e focadas, que rodam localmente, removem o atrito diário melhor do que qualquer plataforma gigante.",
        content: [
          {
            paragraphs: [
              "A maioria dos problemas para os quais eu crio ferramentas não são impressionantes. São aquelas pequenas e recorrentes irritações que roubam alguns minutos de cada vez e que nunca parecem valer a pena resolver direito.",
            ],
          },
          {
            heading: "A mentalidade dos pequenos problemas",
            paragraphs: [
              "Um arquivo 10 KB maior do que deveria. Uma imagem que precisa de um tamanho específico. Um bloco de JSON que precisa de formatação para ficar legível. Individualmente, cada um é uma tarefa de dois minutos. Mas essas tarefas se acumulam, e todas repetem as mesmas três ou quatro formas.",
            ],
          },
          {
            heading: "Focado em vez de gigante",
            paragraphs: [
              "Em vez de um portal gigante que “faz tudo”, prefiro ferramentas pequenas que fazem uma coisa e fazem bem. Você chega à página, conclui a tarefa e vai embora. Sem conta, sem etapas de integração, sem bagunça.",
            ],
          },
          {
            heading: "Processamento perto do trabalho",
            paragraphs: [
              "Sempre que uma tarefa pode ser executada inteiramente no navegador, ela deve ser. Seu arquivo permanece no seu dispositivo, o que significa menos decisões sobre privacidade e nenhuma espera por um servidor para algo que não precisava de um.",
            ],
          },
          {
            heading: "Por que este blog",
            paragraphs: [
              "Este blog é onde eu registro os problemas reais por trás de cada ferramenta — o que eu estava tentando fazer, o trabalho manual e a ferramenta que ajudou. Se uma ferramenta ajudar você também, ótimo. Se não, a explicação ainda pode ser útil.",
            ],
          },
        ],
        toolCta: {
label: "Explore as ferramentas que surgiram de problemas como estes.",
      toolId: "image-resizer",
        },
        seoTitle: "Por que crio pequenas ferramentas de navegador para problemas do dia a dia | GainUtility",
        seoDescription:
          "Uma nota curta e honesta sobre por que o site existe: não para ser uma plataforma gigante, mas para remover atritos diários com utilitários de navegador bem focados.",
      },
      id: {
        title: "Mengapa Saya Mulai Membuat Alat Browser Kecil untuk Masalah Sehari-hari",
        description:
          "Catatan singkat dan jujur tentang mengapa situs ini ada: bukan untuk menjadi platform raksasa, melainkan untuk menghilangkan gesekan harian yang kecil dengan utilitas browser yang fokus.",
        readingTime: "Baca 3 menit",
        tags: ["tentang", "alat", "kerajinan"],
        categoryLabel: "Produktivitas",
        keyTakeaway:
          "Alat browser kecil yang fokus dan berjalan lokal menghilangkan gesekan harian lebih baik daripada platform yang melebar.",
        content: [
          {
            paragraphs: [
              "Sebagian besar masalah yang saya buatkan alatnya tidaklah mengesankan. Masalah-masalah itu adalah gangguan kecil yang berulang, memakan beberapa menit setiap kali, dan tidak pernah terasa layak untuk diperbaiki dengan benar.",
            ],
          },
          {
            heading: "Pola pikir masalah kecil",
            paragraphs: [
              "File yang 10 KB lebih besar dari seharusnya. Gambar yang perlu ukuran tertentu. Blob JSON yang perlu diformat agar mudah dibaca. Satu per satu, masing-masing hanya pekerjaan dua menit. Tapi pekerjaan-pekerjaan ini menumpuk, dan semuanya memakai tiga atau empat pola yang sama.",
            ],
          },
          {
            heading: "Fokus daripada melebar",
            paragraphs: [
              "Daripada satu portal raksasa yang “melakukan segalanya”, saya lebih suka alat kecil yang mengerjakan satu hal dengan jelas. Anda membuka halaman, menyelesaikan tugas, lalu pergi. Tanpa akun, tanpa onboarding, tanpa berantakan.",
            ],
          },
          {
            heading: "Pemrosesan yang dekat dengan pekerjaan",
            paragraphs: [
              "Di mana pun sebuah tugas bisa berjalan sepenuhnya di browser, sebaiknya ia berjalan di sana. File Anda tetap di perangkat Anda, yang berarti lebih sedikit keputusan soal privasi dan tidak perlu menunggu server untuk hal yang memang tidak membutuhkannya.",
            ],
          },
          {
            heading: "Mengapa blog ini",
            paragraphs: [
              "Blog ini adalah tempat saya menuliskan masalah nyata di balik setiap alat — hal yang saya coba lakukan, pekerjaan manualnya, dan alat yang membantu. Jika sebuah alat membantu Anda juga, bagus. Jika tidak, penjelasannya mungkin tetap berguna.",
            ],
          },
        ],
        toolCta: {
label: "Jelajahi alat yang lahir dari masalah seperti ini.",
      toolId: "image-resizer",
        },
        seoTitle: "Mengapa Saya Membuat Alat Browser Kecil untuk Masalah Sehari-hari | GainUtility",
        seoDescription:
          "Catatan singkat dan jujur tentang mengapa situs ini ada: bukan untuk menjadi platform raksasa, melainkan untuk menghilangkan gesekan harian yang kecil dengan utilitas browser yang fokus.",
      },
      "es-mx": {
        title: "Por qué empecé a crear pequeñas herramientas de navegador para los problemas de cada día",
        description:
          "Una nota breve y honesta sobre por qué existe el sitio: no para ser una plataforma gigante, sino para eliminar la fricción diaria con utilidades de navegador bien enfocadas.",
        readingTime: "3 min de lectura",
        tags: ["sobre", "herramientas", "oficio"],
        categoryLabel: "Productividad",
        keyTakeaway:
          "Las herramientas de navegador pequeñas y enfocadas que funcionan localmente eliminan la fricción diaria mejor que cualquier plataforma gigante.",
        content: [
          {
            paragraphs: [
              "La mayoría de los problemas para los que creo herramientas no son impresionantes. Son esos pequeños fastidios recurrentes que se llevan unos minutos cada vez y que nunca parecen merecer la pena arreglar bien.",
            ],
          },
          {
            heading: "La mentalidad de los pequeños problemas",
            paragraphs: [
              "Un archivo que pesa 10 KB de más. Una imagen que necesita un tamaño concreto. Un bloque JSON que necesita formateo para ser legible. Cada uno, por separado, es una tarea de dos minutos. Pero estas tareas se acumulan y repiten los mismos tres o cuatro patrones.",
            ],
          },
          {
            heading: "Enfocado en vez de disperso",
            paragraphs: [
              "En lugar de un portal gigante que “lo hace todo”, prefiero herramientas pequeñas que hacen una cosa y la hacen bien. Llegas a la página, completas la tarea y te vas. Sin cuenta, sin proceso de bienvenida, sin ruido.",
            ],
          },
          {
            heading: "El procesamiento, cerca del trabajo",
            paragraphs: [
              "Siempre que una tarea pueda ejecutarse por completo en el navegador, debería hacerlo. Tu archivo permanece en tu dispositivo, lo que significa menos decisiones sobre privacidad y ninguna espera de un servidor para algo que no lo necesitaba.",
            ],
          },
          {
            heading: "Por qué este blog",
            paragraphs: [
              "Este blog es donde escribo los problemas reales detrás de cada herramienta: lo que estaba intentando hacer, el trabajo manual y la herramienta que ayudó. Si una herramienta también te sirve a ti, genial. Si no, la explicación puede seguir siendo útil.",
            ],
          },
        ],
        toolCta: {
label: "Explora las herramientas que surgieron de problemas como estos.",
      toolId: "image-resizer",
        },
        seoTitle: "Por qué creo pequeñas herramientas de navegador para los problemas de cada día | GainUtility",
        seoDescription:
          "Una nota breve y honesta sobre por qué existe el sitio: no para ser una plataforma gigante, sino para eliminar la fricción diaria con utilidades de navegador bien enfocadas.",
      },
      "es-co": {
        title: "Por qué empecé a crear pequeñas herramientas de navegador para los problemas de cada día",
        description:
          "Una nota breve y honesta sobre por qué existe el sitio: no para ser una plataforma gigante, sino para eliminar la fricción diaria con utilidades de navegador bien enfocadas.",
        readingTime: "3 min de lectura",
        tags: ["sobre", "herramientas", "oficio"],
        categoryLabel: "Productividad",
        keyTakeaway:
          "Las herramientas de navegador pequeñas y enfocadas que funcionan localmente eliminan la fricción diaria mejor que cualquier plataforma gigante.",
        content: [
          {
            paragraphs: [
              "La mayoría de los problemas para los que creo herramientas no son impresionantes. Son esos pequeños fastidios recurrentes que se llevan unos minutos cada vez y que nunca parecen merecer la pena arreglar bien.",
            ],
          },
          {
            heading: "La mentalidad de los pequeños problemas",
            paragraphs: [
              "Un archivo que pesa 10 KB de más. Una imagen que necesita un tamaño concreto. Un bloque JSON que necesita formateo para ser legible. Cada uno, por separado, es una tarea de dos minutos. Pero estas tareas se acumulan y repiten los mismos tres o cuatro patrones.",
            ],
          },
          {
            heading: "Enfocado en vez de disperso",
            paragraphs: [
              "En lugar de un portal gigante que “lo hace todo”, prefiero herramientas pequeñas que hacen una cosa y la hacen bien. Llegas a la página, completas la tarea y te vas. Sin cuenta, sin proceso de bienvenida, sin ruido.",
            ],
          },
          {
            heading: "El procesamiento, cerca del trabajo",
            paragraphs: [
              "Siempre que una tarea pueda ejecutarse por completo en el navegador, debería hacerlo. Tu archivo permanece en tu dispositivo, lo que significa menos decisiones sobre privacidad y ninguna espera de un servidor para algo que no lo necesitaba.",
            ],
          },
          {
            heading: "Por qué este blog",
            paragraphs: [
              "Este blog es donde escribo los problemas reales detrás de cada herramienta: lo que estaba intentando hacer, el trabajo manual y la herramienta que ayudó. Si una herramienta también te sirve a ti, genial. Si no, la explicación puede seguir siendo útil.",
            ],
          },
        ],
        toolCta: {
label: "Explora las herramientas que surgieron de problemas como estos.",
      toolId: "image-resizer",
        },
        seoTitle: "Por qué creo pequeñas herramientas de navegador para los problemas de cada día | GainUtility",
        seoDescription:
          "Una nota breve y honesta sobre por qué existe el sitio: no para ser una plataforma gigante, sino para eliminar la fricción diaria con utilidades de navegador bien enfocadas.",
      },
      de: {
        title: "Warum ich damit angefangen habe, kleine Browser-Tools für alltägliche Probleme zu bauen",
        description:
          "Eine kurze, ehrliche Notiz darüber, warum die Website existiert: nicht um eine große Plattform zu sein, sondern um kleine alltägliche Reibungen mit fokussierten Browser-Tools zu beseitigen.",
        readingTime: "3 Min. Lesezeit",
        tags: ["über", "tools", "handwerk"],
        categoryLabel: "Produktivität",
        keyTakeaway:
          "Kleine, fokussierte Browser-Tools, die lokal laufen, beseitigen alltägliche Reibung besser als jede ausufernde Plattform.",
        content: [
          {
            paragraphs: [
              "Die meisten Probleme, für die ich Tools baue, sind nicht beeindruckend. Es sind die kleinen, wiederkehrenden Ärgernisse, die jedes Mal ein paar Minuten kosten und sich nie richtig zu beheben lohnen.",
            ],
          },
          {
            heading: "Die Kleines-Problem-Denkweise",
            paragraphs: [
              "Eine Datei, die 10 KB zu groß ist. Ein Bild, das eine bestimmte Größe braucht. Ein JSON-Block, der formatiert werden muss, um lesbar zu sein. Jede einzelne davon ist eine Zwei-Minuten-Aufgabe. Aber diese Aufgaben summieren sich, und sie nutzen dieselben drei oder vier Muster.",
            ],
          },
          {
            heading: "Fokussiert statt ausufernd",
            paragraphs: [
              "Statt eines riesigen Portals, das „alles kann“, bevorzuge ich kleine Tools, die eine Sache tun und das klar tun. Sie landen auf der Seite, erledigen die Aufgabe und gehen. Kein Konto, kein Onboarding, kein Ballast.",
            ],
          },
          {
            heading: "Verarbeitung nah am Geschehen",
            paragraphs: [
              "Wo immer eine Aufgabe vollständig im Browser laufen kann, sollte sie das auch. Ihre Datei bleibt auf Ihrem Gerät — das bedeutet weniger Entscheidungen zum Datenschutz und kein Warten auf einen Server für etwas, das keinen braucht.",
            ],
          },
          {
            heading: "Warum dieser Blog",
            paragraphs: [
              "In diesem Blog schreibe ich die echten Probleme hinter jedem Tool auf — was ich erreichen wollte, die manuelle Arbeit und das Tool, das geholfen hat. Wenn ein Tool auch Ihnen hilft, großartig. Wenn nicht, kann die Erklärung trotzdem nützlich sein.",
            ],
          },
        ],
        toolCta: {
label: "Entdecken Sie die Tools, die aus genau solchen Problemen entstanden sind.",
      toolId: "image-resizer",
        },
        seoTitle: "Warum ich kleine Browser-Tools für alltägliche Probleme baue | GainUtility",
        seoDescription:
          "Eine kurze, ehrliche Notiz darüber, warum die Website existiert: nicht um eine große Plattform zu sein, sondern um kleine alltägliche Reibungen mit fokussierten Browser-Tools zu beseitigen.",
      },
      fr: {
        title: "Pourquoi j'ai commencé à créer de petits outils de navigateur pour les problèmes du quotidien",
        description:
          "Un court mot honnête sur pourquoi ce site existe : non pas pour être une vaste plateforme, mais pour ôter de petites frictions quotidiennes avec des utilitaires de navigateur bien ciblés.",
        readingTime: "3 min de lecture",
        tags: ["à propos", "outils", "métier"],
        categoryLabel: "Productivité",
        keyTakeaway:
          "Les petits outils de navigateur ciblés qui tournent localement ôtent plus de friction quotidienne qu'une vaste plateforme ne le pourrait.",
        content: [
          {
            paragraphs: [
              "La plupart des problèmes pour lesquels je crée des outils ne sont pas impressionnants. Ce sont les petits tracas récurrents qui grignotent quelques minutes à chaque fois et qui ne semblent jamais valoir la peine d'être réglés proprement.",
            ],
          },
          {
            heading: "L'état d'esprit des petits problèmes",
            paragraphs: [
              "Un fichier de 10 Ko trop lourd. Une image qui doit faire une taille précise. Un bloc JSON qui a besoin d'être formaté pour être lisible. Pris individuellement, chacun est une corvée de deux minutes. Mais ces corvées s'additionnent, et elles reprennent les trois ou quatre mêmes formes.",
            ],
          },
          {
            heading: "Ciblé plutôt que tentaculaire",
            paragraphs: [
              "Plutôt qu'un portail géant qui « fait tout », je préfère des petits outils qui font une chose et la font clairement. Vous arrivez sur la page, vous accomplissez la tâche, vous repartez. Pas de compte, pas d'onboarding, pas de bruit.",
            ],
          },
          {
            heading: "Un traitement au plus près du travail",
            paragraphs: [
              "Chaque fois qu'une tâche peut s'exécuter entièrement dans le navigateur, elle le devrait. Votre fichier reste sur votre appareil, ce qui signifie moins de décisions à prendre sur la confidentialité et aucune attente d'un serveur pour quelque chose qui n'en avait pas besoin.",
            ],
          },
          {
            heading: "Pourquoi ce blog",
            paragraphs: [
              "Ce blog est l'endroit où je note les vrais problèmes derrière chaque outil — ce que j'essayais de faire, le travail manuel et l'outil qui a aidé. Si un outil vous aide aussi, tant mieux. Sinon, l'explication peut quand même être utile.",
            ],
          },
        ],
        toolCta: {
label: "Parcourez les outils nés de problèmes comme ceux-ci.",
      toolId: "image-resizer",
        },
        seoTitle: "Pourquoi je crée de petits outils de navigateur pour les problèmes du quotidien | GainUtility",
        seoDescription:
          "Un court mot honnête sur pourquoi ce site existe : non pas pour être une vaste plateforme, mais pour ôter de petites frictions quotidiennes avec des utilitaires de navigateur bien ciblés.",
      },
      it: {
        title: "Perché ho iniziato a costruire piccoli strumenti da browser per i problemi di tutti i giorni",
        description:
          "Una breve nota onesta sul perché esiste il sito: non per essere una grande piattaforma, ma per eliminare piccole frizioni quotidiane con utilità browser mirate.",
        readingTime: "Lettura di 3 min",
        tags: ["chi siamo", "strumenti", "mestiere"],
        categoryLabel: "Produttività",
        keyTakeaway:
          "Piccoli strumenti del browser, mirati e che girano in locale, eliminano le frizioni quotidiane meglio di qualsiasi piattaforma dispersiva.",
        content: [
          {
            paragraphs: [
              "La maggior parte dei problemi per cui costruisco strumenti non sono impressionanti. Sono le piccole, ricorrenti seccature che portano via qualche minuto alla volta e che non sembrano mai valere la pena di essere sistemate per bene.",
            ],
          },
          {
            heading: "La mentalità dei piccoli problemi",
            paragraphs: [
              "Un file di 10 KB troppo pesante. Un'immagine che deve avere una dimensione specifica. Un blocco JSON che va formattato per essere leggibile. Presi singolarmente, sono compiti da due minuti. Ma questi compiti si accumulano, e riutilizzano gli stessi tre o quattro schemi.",
            ],
          },
          {
            heading: "Concentrato invece che disperso",
            paragraphs: [
              "Invece di un portale gigante che “fa tutto”, preferisco strumenti piccoli che fanno una cosa e la fanno bene. Arrivi sulla pagina, completi l'attività e te ne vai. Niente account, niente onboarding, niente confusione.",
            ],
          },
          {
            heading: "Elaborazione vicina al lavoro",
            paragraphs: [
              "Ogni volta che un'attività può essere eseguita interamente nel browser, dovrebbe esserlo. Il tuo file resta sul tuo dispositivo, il che significa meno decisioni sulla privacy e nessuna attesa di un server per qualcosa che non ne aveva bisogno.",
            ],
          },
          {
            heading: "Perché questo blog",
            paragraphs: [
              "Questo blog è dove annoto i problemi reali dietro ogni strumento — ciò che stavo cercando di fare, il lavoro manuale e lo strumento che ha aiutato. Se uno strumento aiuta anche te, ottimo. Se no, la spiegazione può comunque essere utile.",
            ],
          },
        ],
        toolCta: {
label: "Sfoglia gli strumenti nati da problemi come questi.",
      toolId: "image-resizer",
        },
        seoTitle: "Perché costruisco piccoli strumenti da browser per i problemi di tutti i giorni | GainUtility",
        seoDescription:
          "Una breve nota onesta sul perché esiste il sito: non per essere una grande piattaforma, ma per eliminare piccole frizioni quotidiane con utilità browser mirate.",
      },
    },
  },
  {
    id: "convert-pdf-to-word-guide",
    slug: "how-to-convert-pdf-to-word",
    title: "How to Convert a PDF to Word Without Losing the Text",
    description:
      "PDF to Word means pulling text out of a fixed-layout file and putting it into a flowing document. What converts cleanly, what has to be rebuilt, and when OCR has to come first.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-10-01",
    readingTime: "5 min read",
    tags: ["pdf", "word", "docx", "convert", "ocr"],
    quickAnswer:
      "If the PDF has a text layer, open the PDF to Word tool, add the file, and download the .docx. If it is a scan, there is no text to extract - run OCR first, then move the recognised text into Word. Body paragraphs come across editable; tables, headers, and columns are the parts you rebuild.",
    content: [
      {
        paragraphs: [
          "A PDF is built to look identical everywhere: every line sits at a fixed position on the page. Word does the opposite - text flows, and everything reflows when the font, margin, or window changes. Converting between them is not a copy operation but a translation between two ways of describing a document, and that single fact explains almost every surprise you get in the output.",
        ],
      },
      {
        heading: "First check: does your PDF contain text?",
        paragraphs: [
          "Open the file in any PDF reader and try to select a line of text. If you can highlight and copy it, the PDF has a text layer and converts directly. If nothing selects, or the whole page selects as one block, it is a scan or an image-only export - the words are pixels, and there is nothing for a converter to read.",
          "This check decides the whole workflow, so it is worth the ten seconds.",
        ],
        tool: {
          label: "For a scan, run the OCR tool first - it reads each page with Tesseract in your browser and gives you the text back.",
          toolId: "ocr-pdf",
        },
      },
      {
        heading: "Step by step",
        paragraphs: ["For a born-digital PDF, the job is short:"],
        steps: [
          "Open the GainUtility PDF to Word tool and add the PDF.",
          "Let it extract the paragraphs into a .docx structure, then download the file.",
          "Open the result in Word or Google Docs and read it once end to end.",
          "Fix the parts that moved: headings, lists, and any table are the usual rework.",
          "For a scanned PDF, run OCR, copy the recognised text into Word, and rebuild the layout there.",
        ],
      },
      {
        heading: "What comes across, and what you rebuild",
        paragraphs: [
          "The converter extracts paragraphs - that is deliberately its scope. Knowing the boundary before you start saves a round of disappointment:",
        ],
        table: {
          caption: "First-pass expectations when converting a text-based PDF to .docx",
          columns: ["Element in the PDF", "What to expect"],
          rows: [
            ["Body paragraphs", "Come across as editable text in reading order - the part that works."],
            ["Headings", "Usually arrive as plain paragraphs; re-apply heading styles so navigation works."],
            ["Lists", "Often survive; nested or auto-numbered lists sometimes lose their numbering."],
            ["Tables", "Not reconstructed. Rebuild the grid in Word from the text."],
            ["Images and charts", "Not carried across as editable content; re-insert them from the source."],
            ["Headers, footers, page numbers", "Usually dropped - which is often what you wanted anyway."],
            ["Columns and text boxes", "The least reliable part: reading order can interleave. Check it line by line."],
          ],
        },
      },
      {
        heading: "Common failure modes",
        list: [
          "The output is empty or one long paragraph: the PDF is a scan. Run OCR, then move the text into Word.",
          "The text is garbled: the scan is too blurry or skewed for recognition. Fix the source image before re-running OCR - no converter recovers characters that were never read.",
          "The formatting is gone: expected. The PDF recorded coordinates, not structure, so structure has to be re-applied.",
          "The result is larger than the original: embedded images or fonts came along uncompressed. Compress the file if it has to be emailed.",
        ],
      },
      {
        heading: "When going back to the source is the better move",
        paragraphs: [
          "If a Word file exists somewhere - the version the PDF was exported from - edit that instead. Rebuilding is always lossier than re-exporting. Conversion earns its place when the source is gone, the file came from someone else, or the only change you need is a paragraph of text.",
          "Either way, the conversion itself does not have to upload anything: the PDF to Word tool runs in the browser, so confidential documents stay on your machine while you work.",
        ],
        tool: {
          label: "The PDF to Word tool extracts the text locally, without uploading the file.",
          toolId: "pdf-to-word",
        },
      },
    ],
    toolCta: {
      label: "Turn a text-based PDF into an editable Word file.",
      toolId: "pdf-to-word",
    },
    relatedArticles: [
      "how-to-convert-word-to-pdf",
      "how-to-convert-pdf-to-jpg",
      "fix-pdf-too-big-to-upload",
    ],
    keyTakeaway:
      "Convert the text, not the layout: a PDF to Word conversion gives the content back, and the page design is the part you re-apply yourself.",
    seoTitle: "How to Convert a PDF to Word | GainUtility",
    seoDescription:
      "Convert a PDF into an editable .docx in your browser. See what converts cleanly, what you have to rebuild, and when to run OCR first.",
  },
  {
    id: "convert-word-to-pdf-guide",
    slug: "how-to-convert-word-to-pdf",
    title: "How to Convert a Word Document to PDF",
    description:
      "PDF is the format that renders the same on every machine. Convert a .docx by reading its structure, laying it into pages, and checking the three things that move.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-10-01",
    readingTime: "4 min read",
    tags: ["pdf", "word", "docx", "convert", "print"],
    quickAnswer:
      "Open the Word to PDF tool, drop in the .docx, and download the result. Headings, paragraphs, lists, and tables carry over. Macros and tracked changes do not - accept or remove them before converting, then check page breaks and fonts.",
    content: [
      {
        paragraphs: [
          "PDF exists because a Word document does not render the same everywhere. Change a font, change a margin, change the version of Word, and the pages move. Sending a PDF ends that argument: the recipient sees the pages you approved, on screen and in print.",
        ],
      },
      {
        heading: "What the conversion actually does",
        paragraphs: [
          "It reads the .docx structure - headings, body text, lists, tables - and lays those elements out onto standard pages with margins and automatic page breaks. It is a rendering step, not a re-design: your document's order and hierarchy survive, and anything Word treated as an application feature rather than content does not.",
        ],
        tool: {
          label: "The Word to PDF tool parses the .docx and renders it locally in the browser.",
          toolId: "word-to-pdf",
        },
      },
      {
        heading: "Before you convert: three things to settle",
        list: [
          "Tracked changes and comments: PDF has no equivalent. Accept, reject, or delete them first, or decide deliberately that they are going out with the document.",
          "Macros: they are not part of the output. A macro-driven document should be checked page by page, because what you saw on screen may have been produced by code the PDF cannot run.",
          "Legacy .doc files: save as .docx first. The modern format parses reliably; the old binary format does not.",
        ],
      },
      {
        heading: "Step by step",
        steps: [
          "Accept or clear tracked changes, and save the document as .docx.",
          "Open the GainUtility Word to PDF tool and add the file.",
          "Wait for the local parse and render - no upload queue, no file-size cap.",
          "Review the result: first page, last page, and any page with a wide table.",
          "Download the PDF and check it in a second viewer before sending.",
        ],
      },
      {
        heading: "The checks that catch 90% of the problems",
        paragraphs: [
          "Three passes catch nearly everything: a wide table that overflowed its page, a heading that landed alone at the bottom of a column, and a font substitution that changed line breaks. Read the first page for the font, a table page for width, and the last page for a stranded heading.",
          "For print shops and official submissions, also confirm the page size. Letter and A4 differ by 6 mm in width, and a document converted with one margin can clip under the other.",
        ],
        tool: {
          label: "The PDF to Word tool runs the other way when you need the file editable again.",
          toolId: "pdf-to-word",
        },
      },
    ],
    toolCta: {
      label: "Convert a .docx into a PDF that renders the same everywhere.",
      toolId: "word-to-pdf",
    },
    relatedArticles: [
      "how-to-convert-pdf-to-word",
      "how-to-convert-jpg-to-pdf",
      "how-to-merge-pdf-files",
    ],
    keyTakeaway:
      "Converting Word to PDF locks the layout you approved - settle tracked changes first, then check fonts, tables, and page breaks.",
    seoTitle: "How to Convert a Word Document to PDF | GainUtility",
    seoDescription:
      "Convert .docx to PDF in your browser, with no upload. What carries over, what does not, and the three checks worth making before you send the file.",
  },
  {
    id: "are-online-pdf-tools-safe",
    slug: "are-online-pdf-tools-safe",
    title: "Are Online PDF Tools Safe? How to Check What Happens to Your File",
    description:
      "Some online PDF tools upload your document; others never send it anywhere. How to tell which one you are using, what the major tools' own terms say about deletion, and the checks worth running.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-10-01",
    readingTime: "6 min read",
    tags: ["pdf", "privacy", "security", "online tools", "confidential"],
    quickAnswer:
      "It depends on the tool. An upload-based tool sends your file to a server and deletes it on whatever schedule its policy states - two hours for iLovePDF, about an hour for PDF24, immediately after processing for Sejda, per Smallpdf's policy a reasonable period that resets when you reopen the file. A browser-based tool never transmits the file. Check the policy, then verify the behaviour yourself.",
    content: [
      {
        paragraphs: [
          "The question usually arrives after the fact: someone has merged a contract, or compressed a scan of an ID, and then wondered what is sitting on someone else's server. It is a fair question to ask before the next upload, and it has a concrete answer rather than a reassuring one.",
          "Online PDF tools are not one category. Some read your file over the network; others run their code on your machine and never send it. Which one you used is a property you can check, not something you have to take on trust.",
        ],
      },
      {
        heading: "Two different kinds of tool",
        paragraphs: [
          "An upload-based tool transfers your document to a server, processes it there, and hands back a result. The file exists somewhere you do not control, for a period its terms define. A browser-based tool downloads its code once and runs it locally: the file stays on your device, and the only network traffic is the page itself.",
          "The interface is almost identical in both cases - a drop zone, a button, a download link. The difference is invisible unless you look for it.",
        ],
        tool: {
          label: "The metadata removal tool is one example of the local model - the file never leaves the device.",
          toolId: "remove-pdf-metadata",
        },
      },
      {
        heading: "How to check in one minute",
        steps: [
          "Open the tool page and load your file, then open the browser's developer tools (F12) on the Network tab.",
          "Watch what happens when you press the action button. A POST request carrying your document means it was uploaded.",
          "Read the tool's privacy or terms page for how long files are kept, and when the clock starts.",
          "For anything genuinely sensitive - legal, medical, financial, identity documents - prefer a tool that transmits nothing, so the question is settled by design.",
        ],
      },
      {
        heading: "What the major tools' own terms say",
        paragraphs: [
          "Policies change, so read them yourself before relying on a summary. These are direct quotations from each provider's published policy, checked on 1 October 2026:",
        ],
        table: {
          caption: "Retention statements quoted from each provider's own policy (checked 1 October 2026)",
          columns: ["Tool", "What its policy says about your files"],
          rows: [
            [
              "iLovePDF",
              "\"ILOVEPDF will delete the files of your Content ... within TWO (2) HOURS of being processed on ILOVEPDF's servers.\"",
            ],
            [
              "PDF24",
              "\"All files uploaded by the user and the results created are usually deleted one hour after uploading or creating the results.\"",
            ],
            [
              "Sejda",
              "\"All user-uploaded files as well as the processed output files will be permanently deleted after upload or processing respectively.\"",
            ],
            [
              "Smallpdf",
              "\"We will generally aim to delete User Files within a reasonable period of time after the last time they were opened\" - and the policy notes that \"this retention period is extended every time you reopen the respective User File.\"",
            ],
          ],
        },
        externalLinks: [
          { href: "https://www.ilovepdf.com/help/privacy", text: "iLovePDF privacy policy" },
          { href: "https://www.pdf24.org/en/privacy-policy", text: "PDF24 privacy policy" },
          { href: "https://www.sejda.com/privacy", text: "Sejda privacy policy" },
          { href: "https://smallpdf.com/privacy", text: "Smallpdf privacy policy (last updated 29 July 2025)" },
        ],
      },
      {
        heading: "What the answers mean in practice",
        paragraphs: [
          "Two hours and one hour are ordinary, well-documented practices - the file exists on a server for a defined window and then is deleted. The Smallpdf wording is the one worth reading twice: the clock starts when you last opened the file, and reopening it resets the period. Neither is a scandal; it is simply a different risk model from a tool that never receives the file at all.",
          "Deletion promises also cover the copy you uploaded, not necessarily metadata about the upload - timestamps, file names, IP addresses - which policies usually retain longer for abuse prevention.",
        ],
      },
      {
        heading: "Where browser-based tools are genuinely better",
        list: [
          "Confidential or client documents: no third party ever holds the file, so there is no retention period to evaluate.",
          "Managed machines at work or school: nothing is transmitted, so there is nothing for a network filter to log.",
          "Files you would not upload anyway: passports, contracts, medical records, unreleased material.",
          "Offline work: a tool that runs locally keeps working when the network does not.",
        ],
      },
      {
        heading: "Where they are genuinely worse",
        paragraphs: [
          "Honesty cuts both ways. Local processing is bounded by your device: a browser will struggle with a multi-gigabyte scan that a server would swallow. It also cannot do work that requires a service - and any tool that quietly does should say so on its page.",
          "GainUtility's own position, stated plainly: PDF merging, splitting, compression, conversion, OCR, and metadata removal run in your browser with the file never uploaded. The PDF Translator is the exception - it keeps the PDF local but sends the extracted text to a third-party translation service, and its page says so. Check any tool's disclosure the same way you would check anyone else's.",
        ],
        tool: {
          label: "Every tool page carries a privacy note stating where processing happens.",
          toolId: "merge-pdf",
        },
      },
      {
        heading: "A short checklist for any tool",
        list: [
          "Does the page state where processing happens? Silence is a reason to check the network tab.",
          "If it uploads, what does the policy say about deletion - and does the clock start at upload or at last access?",
          "Is there a free tier with a daily task limit? Limits are not a safety problem, but they tell you the business model.",
          "Does the tool ask for an account before you can try it? More data collected than the task needs is a signal.",
        ],
      },
    ],
    toolCta: {
      label: "Merge a sensitive document without uploading it anywhere.",
      toolId: "merge-pdf",
    },
    relatedArticles: [
      "how-to-merge-pdf-files",
      "how-to-compress-a-pdf",
      "fix-pdf-too-big-to-upload",
      "protect-a-pdf-with-a-password",
    ],
    keyTakeaway:
      "The safety of an online PDF tool is a checkable fact: read the retention terms, watch the network tab, and for sensitive files prefer a tool that transmits nothing.",
    seoTitle: "Are Online PDF Tools Safe? How to Check Your File",
    seoDescription:
      "What happens to a PDF you upload to an online tool: quoted retention terms from iLovePDF, PDF24, Sejda, and Smallpdf, plus how to verify any tool yourself.",
  },
  {
    id: "pdf-file-size-limits",
    slug: "pdf-file-size-limits",
    title: "PDF File Size Limits: How Big Can Your PDF Be?",
    description:
      "There is no single PDF size limit - each destination publishes its own. The documented limits for email, messaging, website uploads and application portals, and how to get under the one you are facing.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-10-01",
    readingTime: "6 min read",
    tags: ["pdf", "file size", "upload limits", "email attachments", "compression"],
    quickAnswer:
      "The limit belongs to the destination, not to the PDF. Gmail and Outlook.com both document 25 MB per message, and desktop Outlook defaults to 20 MB for internet mail accounts. WhatsApp accepts documents up to 2 GB. Website uploads are stricter and often silent: a default nginx server refuses bodies over 1 MB, and Cloudflare's Free and Pro plans reject anything over 100 MB. Application portals set their own cap and print it next to the upload field - read that number first, then compress or split until the file sits under it.",
    content: [
      {
        paragraphs: [
          "\"How big can my PDF be?\" has no answer on its own. File size is a property of the file; the limit belongs to whatever receives it, and every receiver draws its own line. The same document can be four times too big for an application form, comfortably under a chat app's ceiling, and rejected by an email server that never states its limit out loud.",
          "So the useful question is narrower: where is this file going? Below are the limits the destinations themselves publish, the ones that are usually stated but rarely noticed, and the order to try fixes in when you are already over.",
        ],
      },
      {
        heading: "The limits that are actually published",
        paragraphs: [
          "Every number in this table comes from the provider's own documentation rather than a forum answer, and each source is linked underneath. These are the published limits - a workplace mail server or a university portal can still be configured lower. Work and school Google accounts, for instance, follow an administrator's configured sending limit rather than the personal 25 MB figure.",
        ],
        table: {
          caption: "Documented limits, quoted from each provider's own documentation",
          columns: ["Destination", "Documented limit", "What it means for you"],
          rows: [
            ["Gmail (personal)", "25 MB per message", "Past the limit, Gmail replaces the attachment with a Drive link."],
            ["Outlook.com", "25 MB, message included", "Body text and attachments share one budget."],
            ["Outlook desktop, internet mail", "20 MB by default", "Exchange mailboxes default to 10 MB, set by the mail admin."],
            ["WhatsApp (documents)", "2 GB", "Messaging is rarely the constraint."],
            ["Cloudflare (Free and Pro)", "100 MB per request body", "Applies to uploads on sites served through Cloudflare."],
            ["nginx (default config)", "1 MB per request body", "A 413 error until an administrator raises client_max_body_size."],
          ],
        },
        externalLinks: [
          { href: "https://support.google.com/mail/answer/6584", text: "Gmail attachment limits (Google support)" },
          { href: "https://support.microsoft.com/en-us/outlook/sending-limits-in-outlook-com", text: "Sending limits in Outlook.com (Microsoft support)" },
          { href: "https://learn.microsoft.com/en-us/troubleshoot/outlook/message-body/attachment-size-exceeds-the-allowable-limit-error", text: "Default attachment size in Outlook (Microsoft learn)" },
          { href: "https://faq.whatsapp.com/453914586839706", text: "WhatsApp document size limit (WhatsApp help centre)" },
          { href: "https://developers.cloudflare.com/workers/platform/limits/", text: "Cloudflare request body limits by plan" },
          { href: "https://nginx.org/en/docs/http/ngx_http_core_module.html", text: "nginx client_max_body_size, default 1m" },
        ],
      },
      {
        heading: "Website uploads: the limit you never see",
        paragraphs: [
          "Upload forms usually print their cap beside the field - 2 MB, 5 MB and 10 MB are the common round numbers - and then enforce it twice: once in the browser, once on the server. The server-side check is the one that decides the outcome, and it is frequently a default rather than a decision made about your file.",
          "A default nginx installation refuses any request body over 1 MB with a 413 error. Cloudflare, in front of a large share of the web, rejects request bodies over 100 MB on its Free and Pro plans. Neither has anything to do with your document, and both will refuse it regardless of how well written it is.",
          "If the form states no limit anywhere, treat 5 MB as a working assumption until you find the real one. Then read the rejection carefully: \"file too large\" from the page is a stated cap you can aim at, while a 413 or a timeout that never returns a message is a server default you can only get under.",
        ],
      },
      {
        heading: "Application and government portals",
        paragraphs: [
          "Portals that accept applications publish their own numbers, and those numbers are exact rather than approximate: a submission is accepted or it is not. Photographs and signatures are usually capped in kilobytes - the recruitment notifications tracked in GainUtility's own requirement database range from 4 KB to 300 KB - while the document itself, a certificate, a declaration, the PDF you are attaching, is typically capped at a few megabytes.",
          "Those caps are not general advice. They are quoted in the official notification, enforced by the portal, and changed between cycles without warning. The notification, the portal's own message, or the form's helper text is the only authority here - not a blog post, and not this one.",
        ],
        tool: {
          label: "Each requirement in the database records the notification it came from and the date it was last checked:",
          toolId: "exam-file-requirements",
        },
      },
      {
        heading: "Why a PDF gets big in the first place",
        paragraphs: [
          "A PDF built from text is small. Pages are stored as characters and vector shapes, so a long document can still land well under a megabyte. A PDF that came out of a scanner stores every page as an image, and from there size tracks page count, resolution and colour depth. Almost every size limit is hit by the second kind of file.",
        ],
        pageLink: {
          label: "Where the size actually comes from, and what each compression level discards:",
          path: "/blog/how-to-compress-a-pdf",
          text: "how to compress a PDF without losing what you need",
        },
      },
      {
        heading: "The conversions that catch people out",
        paragraphs: [
          "Two counting systems are in use for the same unit, and they disagree by just under 5%. That gap is invisible right up until the moment a file sits exactly on the limit.",
        ],
        table: {
          caption: "Bytes behind the labels, and the overhead an email adds",
          columns: ["What the message says", "What the number actually is"],
          rows: [
            ["1 MB on an upload form", "1,000,000 bytes - decimal units, the usual convention for limits."],
            ["1.00 MB in your file manager", "1,048,576 bytes - binary units, what Windows and macOS display."],
            ["The gap between them", "Just under 5%. A file showing exactly 1.00 MB is already over a 1,000,000-byte cap."],
            ["A 200 KB cap", "200,000 bytes if the form counts in decimal; a file at 200 KiB is 204,800 bytes, over by 4,800."],
            ["An email attachment", "Base64-encoded for transmission, which adds about a third to the bytes actually sent."],
          ],
        },
      },
      {
        paragraphs: [
          "The practical version: aim for 90% of whatever cap you are given. The headroom absorbs encoding overhead, the difference between the two counting systems, and the page you forgot to delete.",
        ],
      },
      {
        heading: "Getting under the limit, cheapest fix first",
        paragraphs: [
          "Work backwards from the destination rather than forwards from the file. The order below is the one that keeps the document readable for longest.",
        ],
        steps: [
          "Write down the number the destination states. If none is stated, assume 5 MB until you find one.",
          "Check the file's actual size in bytes before changing anything.",
          "Compress the embedded images one level, then re-measure. For a scan, this is usually the whole fix.",
          "If it is still over, drop the pages that are not being submitted and compress again - a shorter document needs far less compression to fit.",
          "If the cap is a hard target rather than a ceiling, keep re-measuring until the output lands under it with room to spare.",
        ],
        pageLink: {
          label: "The hub page for it shows the projected size while you move the level:",
          path: "/pdf/compress",
          text: "Compress PDF",
        },
      },
      {
        heading: "Split when the cap is small",
        paragraphs: [
          "A 5 MB cap on a 40-page scan is a compression problem only up to a point. Extracting the pages that are actually being submitted shrinks the file before any quality is touched: two pages need far less compression to fit than forty, so the text you keep stays sharp instead of crushed.",
        ],
        tool: {
          label: "The PDF Splitter extracts a page range and returns a new file - the original is untouched:",
          toolId: "split-pdf",
        },
        pageLink: {
          label: "When the upload box has already rejected the file:",
          path: "/blog/fix-pdf-too-big-to-upload",
          text: "how to fix a PDF that is too big to upload",
        },
      },
      {
        heading: "When the limit is a target, not a ceiling",
        paragraphs: [
          "Some forms do not reject large files; they reject the wrong ones - a scan below the readable resolution, a document that overshoots a stated maximum by a few kilobytes. An exact target needs a tool aimed at the number rather than simply downwards.",
        ],
        tool: {
          label: "Set the cap the form gives you and the PDF is brought under it without crushing the pages:",
          toolId: "pdf-exact-size",
        },
      },
      {
        paragraphs: [
          "Every tool used above, plus merging, rotating, protecting and converting, sits in one directory. The compress and split pages there carry their own longer guides if you want the detail.",
        ],
        pageLink: {
          label: "Browse the full directory:",
          path: "/pdf",
          text: "PDF tools hub",
        },
      },
    ],
    toolCta: {
      label: "Get a PDF under the limit you are facing - the projected size updates as you choose the level.",
      toolId: "compress-images-inside-pdf",
    },
    relatedArticles: [
      "fix-pdf-too-big-to-upload",
      "how-to-compress-a-pdf",
      "how-to-split-a-pdf",
      "are-online-pdf-tools-safe",
    ],
    keyTakeaway:
      "There is no universal PDF size limit - read the number the destination publishes, leave 10% headroom, and compress or split until the file sits under it.",
    seoTitle: "PDF File Size Limits: Email, Uploads, Portals | GainUtility",
    seoDescription:
      "Published PDF size limits for Gmail, Outlook, WhatsApp, web uploads and application portals - plus how to get a file under the cap you are facing.",
  },

  /* ---------------------------- New guides ------------------------ */
  {
    id: "robots-and-sitemap-check",
    slug: "check-your-robots-txt-and-sitemap-before-submitting",
    title: "How to Check Your Robots.txt and Sitemap Before You Submit Them",
    description:
      "Two small files decide what a crawler may read and what it should be pointed at. Reading both for a minute catches the mistakes that quietly hide pages.",
    category: "SEO",
    author: "GainUtility",
    date: "2026-09-03",
    readingTime: "5 min read",
    tags: ["seo", "robots.txt", "sitemap", "crawling", "indexing"],
    quickAnswer:
      "Open robots.txt and confirm the paths you want read are not disallowed, then open your sitemap and confirm every URL in it loads and points at its own canonical address.",
    content: [
      {
        paragraphs: [
          "A sitemap is an invitation and robots.txt is a rulebook. Neither one is complicated, and both are plain text you can read in a browser tab. The trouble is that they are usually written once and never looked at again, which is how a site ends up asking to be indexed while robots.txt quietly blocks the way.",
        ],
      },
      {
        heading: "Read robots.txt the way a crawler does",
        paragraphs: [
          "A crawler fetches robots.txt first and treats every rule as applying to a path prefix. The two rules that matter most are Disallow, which removes a path from consideration, and Allow, which puts it back. A single broad Disallow line at the top of the file is the most common way a whole section of a site disappears from search.",
          "The Sitemap line at the bottom is separate from the rules above it. It is a pointer, not a permission, so a page can be allowed by robots.txt and still never be discovered if nothing links to it.",
        ],
        list: [
          "Confirm no Disallow line covers a path you want read.",
          "Confirm Allow lines still match the URLs they were written for.",
          "Confirm the Sitemap line points at the same domain the crawler is on, including or excluding the trailing slash consistently.",
        ],
      },
      {
        heading: "Read the sitemap like a list of promises",
        paragraphs: [
          "Every URL in a sitemap is a claim: this page exists, it loads, and it is the address you want shown. Claims that are false cost more than a missing entry, because a crawler has to spend a request finding out.",
        ],
        tool: {
          label: "The XML Sitemap Generator builds the file from your routes and shows the entries it writes.",
          toolId: "xml-sitemap-generator",
        },
      },
      {
        heading: "The five checks worth doing before a submit",
        steps: [
          "Fetch robots.txt in the browser and read every Disallow line out loud against your real paths.",
          "Open the sitemap and pick three URLs at random; load each one and confirm it returns the page, not a redirect to somewhere else.",
          "Confirm every URL in the sitemap is self-canonical, meaning it points at its own address rather than a variant.",
          "Check that no URL in the sitemap carries a noindex instruction in the page head.",
          "Submit the sitemap only after the first four checks pass, because a submit speeds up a discovery that would otherwise happen on a crawl.",
        ],
      },
      {
        heading: "Why a submit is not a fix",
        paragraphs: [
          "Pointing a search console at a sitemap does not repair a blocked path or a redirect chain. It only shortens the wait for a crawler to notice pages it was already allowed to reach. The fixes happen in the two files and in the markup, not in the submit form.",
        ],
        tool: {
          label: "The Site Check tool fetches a URL and reports what it finds in the head, the status and the links.",
          toolId: "check-my-website",
        },
      },
    ],
    toolCta: {
      label: "Scan a URL for the head tags, status and links a crawler would see.",
      toolId: "check-my-website",
    },
    relatedArticles: [
      "preview-a-link-before-you-share-it",
      "write-seo-title-and-meta-description-in-twenty-minutes",
      "how-to-make-a-qr-code",
    ],
    keyTakeaway:
      "robots.txt decides what may be read and the sitemap says what to look at; check both in a browser tab before you submit anything.",
    seoTitle: "How to Check Robots.txt and XML Sitemap | GainUtility",
    seoDescription:
      "Read your robots.txt and XML sitemap the way a crawler does - a short checklist that catches disallowed paths, unreachable URLs and mixed canonicals.",
  },

  {
    id: "link-preview-check",
    slug: "preview-a-link-before-you-share-it",
    title: "How to Preview a Link Before You Share It",
    description:
      "A shared link is read as a title, a line of text and a picture. Render that card first and you catch the broken image and the cut-off headline before anyone else does.",
    category: "SEO",
    author: "GainUtility",
    date: "2026-09-17",
    readingTime: "4 min read",
    tags: ["seo", "open graph", "social", "meta", "sharing"],
    quickAnswer:
      "Fill in the title, description and image the page will publish, render the card, and check that the headline is not cut mid-word and the image is not cropped past recognition.",
    content: [
      {
        paragraphs: [
          "When a link lands in a post, a message or a document, most people read the card and decide from there. The page behind it may be perfect; the card is what gets judged.",
        ],
      },
      {
        heading: "The four fields that build the card",
        paragraphs: [
          "A title and a description carry the words. An image carries the shape. A card type decides whether the picture appears large or small. Miss any one of them and a platform either guesses or falls back to a screenshot of the top of the page.",
        ],
        list: [
          "Title: what the page is, in the words you would say out loud.",
          "Description: one sentence a person would want to read, not a keyword list.",
          "Image: an asset with a predictable centre, because platforms crop differently.",
          "Card type: large or summary, chosen to match the image you picked.",
        ],
      },
      {
        heading: "Render it before you share",
        paragraphs: [
          "The only reliable way to know how a card looks is to build it. Paste the values in, look at the result at the size the platform will use, and adjust the words until nothing important sits in the crop.",
        ],
        tool: {
          label: "The Open Graph Generator writes the tags and previews the card as you type.",
          toolId: "og-meta-generator",
        },
      },
      {
        heading: "Check the platform that will actually show it",
        paragraphs: [
          "Cards are not identical everywhere. A summary card that reads well in a messenger can look thin in a feed, so check the layout the destination uses before you call the copy finished.",
        ],
        tool: {
          label: "The Twitter Card Generator previews the summary card layout used by that platform.",
          toolId: "twitter-card-generator",
        },
      },
      {
        heading: "Common failures worth a second look",
        list: [
          "A title long enough that the platform truncates it in the middle of a word.",
          "An image that is square in your file and centre-cropped to something else everywhere else.",
          "A description that repeats the title instead of adding a reason to click.",
          "A canonical address that does not match the link you are sharing.",
        ],
        paragraphs: [
          "None of these need a redesign. They need one pass through a preview while the link is still in a draft.",
        ],
      },
    ],
    toolCta: {
      label: "Build the Open Graph tags and see the card before the link goes out.",
      toolId: "og-meta-generator",
    },
    relatedArticles: [
      "write-seo-title-and-meta-description-in-twenty-minutes",
      "check-your-robots-txt-and-sitemap-before-submitting",
      "how-to-make-a-qr-code",
    ],
    keyTakeaway:
      "Build the card, look at it, then share: title, description, image and card type are four decisions you can make in a minute.",
    seoTitle: "How to Preview a Link Before You Share It | GainUtility",
    seoDescription:
      "Check how a link will look when it is pasted into a post - title, description, image and card type, rendered before you share.",
  },

  {
    id: "make-favicon-from-image",
    slug: "make-a-favicon-from-any-image",
    title: "How to Make a Favicon From Any Image",
    description:
      "A logo that looks sharp at 400px usually turns to mud at 16px. Starting from the right crop and the right sizes is what keeps a tab icon recognisable.",
    category: "Images",
    author: "GainUtility",
    date: "2026-09-24",
    readingTime: "5 min read",
    tags: ["images", "favicon", "icons", "branding", "browser"],
    quickAnswer:
      "Crop to a square with the mark centred and padding around it, export at 16, 32 and 48 pixels plus a 180-pixel touch icon, then link them from the head of the page.",
    content: [
      {
        paragraphs: [
          "A favicon is the smallest image on your site and the one people see most often. It lives in a tab, in a bookmark list, and in a history entry, always at a size where a single stray pixel changes the shape.",
        ],
      },
      {
        heading: "Start from a crop, not from the whole picture",
        paragraphs: [
          "Most logos are wider than they are tall. A browser wants a square, so the useful work is choosing which part of the mark survives being made square: the symbol, the initial, or the letterform on its own. Give it a little padding, because the browser rounds the corners on some platforms and clips the edges on others.",
        ],
      },
      {
        heading: "The sizes to export",
        paragraphs: [
          "Browsers ask for the icon that fits the surface they are drawing on. Exporting one file and hoping it scales is how icons end up blurry in the places they are seen most.",
        ],
        table: {
          caption: "Sizes a typical site ships",
          columns: ["Size", "Where it shows up"],
          rows: [
            ["16 x 16", "Browser tab, bookmark list"],
            ["32 x 32", "Tab on a high-density screen"],
            ["48 x 48", "Windows shortcut and legacy surfaces"],
            ["180 x 180", "Home screen icon on iOS"],
          ],
        },
        tool: {
          label: "The Favicon Generator takes one source image and exports the set with the tags to paste.",
          toolId: "favicon-generator",
        },
      },
      {
        heading: "Link them in the head",
        paragraphs: [
          "The files only work once the page tells the browser where they are. Each size gets its own link tag with the size declared, so the browser picks the right one instead of guessing from the file name.",
        ],
        code: {
          label: "Head tags for the generated set",
          content:
            '<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">\n<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">',
        },
      },
      {
        heading: "Check it at the size people see",
        steps: [
          "Open the page and look at the tab, not the preview.",
          "Bookmark the page and check the icon in the bookmark list.",
          "Refresh a few seconds later so the old icon is not cached in the tab.",
          "Squint: if the mark does not read at that size, simplify the crop rather than adding detail.",
        ],
      },
    ],
    toolCta: {
      label: "Turn one source image into the favicon sizes and head tags.",
      toolId: "favicon-generator",
    },
    relatedArticles: [
      "how-to-make-a-transparent-png",
      "how-to-resize-an-image",
      "how-to-compress-an-image",
    ],
    keyTakeaway:
      "Crop square, export 16/32/48 plus a 180 touch icon, link each size in the head, and judge the result in a real tab.",
    seoTitle: "How to Make a Favicon From Any Image | GainUtility",
    seoDescription:
      "Turn any photo, logo or emoji into a 16px-legible favicon, with the sizes, formats and link tags a browser actually asks for.",
  },

  {
    id: "compare-two-json-files",
    slug: "compare-two-json-files-without-losing-your-place",
    title: "How to Compare Two JSON Files Without Losing Your Place",
    description:
      "Two JSON documents can differ in one number and still look identical line by line. Comparing by path instead of by eye turns the difference into a short list.",
    category: "Developer",
    author: "GainUtility",
    date: "2026-10-01",
    readingTime: "6 min read",
    tags: ["json", "developer", "diff", "debugging", "api"],
    quickAnswer:
      "Parse both documents, walk them together and report the paths that differ - added keys, removed keys and changed values - instead of comparing formatted text.",
    content: [
      {
        paragraphs: [
          "A JSON diff is rarely about the whole file. It is about the one field that moved, the key that disappeared, or the value that changed type between two responses that were supposed to be the same.",
        ],
      },
      {
        heading: "Format first, then compare",
        paragraphs: [
          "Two files written by different tools can be identical as data and completely different as text: different indentation, different key order, different line breaks. Pretty-printing both sides before comparing removes the noise so the real difference is the only thing left.",
        ],
        tool: {
          label: "The JSON Beautifier indents both documents so the comparison starts from matching text.",
          toolId: "json-beautifier",
        },
      },
      {
        heading: "Compare paths, not lines",
        paragraphs: [
          "Once both sides are parsed, the useful comparison walks them in parallel and reports the address of each difference: a path such as user.address.city rather than a line number. A path survives reordering and reformatting, so the same check stays meaningful the next time the payload changes.",
        ],
        list: [
          "Added: a key exists on the right and not on the left.",
          "Removed: a key exists on the left and not on the right.",
          "Changed: the value at the same path is different.",
          "Type change: a value that was a number is now a string - the difference that breaks code quietly.",
        ],
      },
      {
        heading: "Keep only the difference you care about",
        paragraphs: [
          "Large payloads produce long reports. Filtering by a path prefix, or expanding only the branches that changed, keeps the answer on one screen where it can be read rather than scrolled.",
        ],
        tool: {
          label: "The Compare JSON tool walks both documents and lists the differences by path.",
          toolId: "json-compare-diff",
        },
      },
      {
        heading: "Check the document parses before blaming the diff",
        paragraphs: [
          "A trailing comma, a single-quoted string or a duplicated key will fail before any comparison starts. Validating the document first separates a syntax problem from a data problem, which is usually the faster half of the debugging.",
        ],
        tool: {
          label: "The JSON Validator reports the exact position of a syntax error.",
          toolId: "json-validator",
        },
      },
    ],
    toolCta: {
      label: "Paste two documents and read the differences as a list of paths.",
      toolId: "json-compare-diff",
    },
    relatedArticles: [
      "format-and-debug-json-when-api-responses-are-unreadable",
      "how-to-make-a-qr-code",
      "preview-a-link-before-you-share-it",
    ],
    keyTakeaway:
      "Format both sides, compare by path rather than by line, and validate first so a syntax error never masquerades as a data difference.",
    seoTitle: "How to Compare Two JSON Files | GainUtility",
    seoDescription:
      "Paste two JSON documents, read the differences by path instead of by eye, and tell an added field from a reordered one in one pass.",
  },

  {
    id: "protect-pdf-with-password",
    slug: "protect-a-pdf-with-a-password",
    title: "How to Protect a PDF With a Password",
    description:
      "A password stops the wrong person opening a file; the printing and copying permissions are a separate setting. Knowing which is which decides whether you set the right one.",
    category: "PDF",
    author: "GainUtility",
    date: "2026-10-04",
    readingTime: "5 min read",
    tags: ["pdf", "password", "security", "privacy", "documents"],
    quickAnswer:
      "Set an open password if the file must not be readable without a secret, set permissions if you only want to guide what a reader may do, and expect permissions to be honoured rather than enforced.",
    content: [
      {
        paragraphs: [
          "Two different settings both get called password protection, and they answer different questions. One decides whether a file opens at all. The other decides what a reader may do with it once it is open.",
        ],
      },
      {
        heading: "Open password versus permissions",
        paragraphs: [
          "An open password is required before the file can be read. Share it only with people who should see the contents, because anyone who has it can read everything inside.",
          "Permissions cover actions such as printing, copying text, and changing the document. They are instructions to the reader's software. Well-behaved applications follow them; they are a policy signal rather than a guarantee, so treat them as a way to state intent rather than as a barrier.",
        ],
      },
      {
        heading: "Setting the password",
        steps: [
          "Open the Protect PDF tool and drop the document in.",
          "Choose whether the file should require a password to open, or only restrict what a reader may do.",
          "Set a password that is not the same one you use anywhere else, and write it down somewhere you will find it.",
          "Apply the change and keep the original until the protected copy has been opened and checked.",
        ],
        tool: {
          label: "The Protect PDF tool applies the password and the permission flags to your document.",
          toolId: "protect-pdf",
        },
      },
      {
        heading: "Check it before you send it",
        paragraphs: [
          "Close the document, reopen the protected copy, and confirm it asks for the password and behaves the way you intended. A file you cannot open yourself is a support ticket you have just created.",
        ],
      },
      {
        heading: "If you are on the other side",
        paragraphs: [
          "If a colleague sends you a document you own the rights to and the permissions are getting in the way of legitimate work, an owner password can be removed from a file you are permitted to change. The same tool that removes it exists on this site, and the responsibility to hold the rights sits with you.",
        ],
        tool: {
          label: "The Unlock PDF tool removes owner-level restrictions from a document you own.",
          toolId: "unlock-pdf",
        },
      },
    ],
    toolCta: {
      label: "Add an open password or set what readers may do with the file.",
      toolId: "protect-pdf",
    },
    relatedArticles: [
      "are-online-pdf-tools-safe",
      "how-to-add-a-watermark-to-a-pdf",
      "fix-pdf-too-big-to-upload",
    ],
    keyTakeaway:
      "An open password decides who can read the file; permissions state what readers may do. Set the one you mean, then open the result to prove it works.",
    seoTitle: "How to Protect a PDF With a Password | GainUtility",
    seoDescription:
      "What a PDF password does and does not stop, how to add one, and what to do when a colleague needs the file without yours.",
  },
];

// Merge modular localized article records into the core registry
for (const article of BLOG_ARTICLES) {
  const overlay = ALL_LOCALIZED_ARTICLES[article.slug];
  if (overlay) {
    article.localized = { ...(article.localized || {}), ...overlay };
  }
}

/* ----------------------------------------------------------------------
 * Derived helpers — everything below is built from the one registry.
 * -------------------------------------------------------------------- */

export const BLOG_SLUG_TO_ARTICLE: Record<string, BlogArticle> = Object.fromEntries(
  BLOG_ARTICLES.map((a) => [a.slug, a])
);

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  PDF: "PDF",
  Images: "Images",
  SEO: "SEO",
  Developer: "Developer",
  Productivity: "Productivity",
};

/** All categories that currently have at least one published article. */
export const ACTIVE_BLOG_CATEGORIES: BlogCategory[] = [
  "PDF",
  "Images",
  "SEO",
  "Developer",
  "Productivity",
].filter((c) => BLOG_ARTICLES.some((a) => a.category === c)) as BlogCategory[];

export const articlesByCategory = (category: BlogCategory): BlogArticle[] =>
  BLOG_ARTICLES.filter((a) => a.category === category);

export const articleBySlug = (slug: string): BlogArticle | undefined =>
  BLOG_SLUG_TO_ARTICLE[slug];

export const relatedArticlesFor = (article: BlogArticle): BlogArticle[] =>
  article.relatedArticles
    .map((slug) => BLOG_SLUG_TO_ARTICLE[slug])
    .filter((a): a is BlogArticle => Boolean(a))
    .filter((a) => a.slug !== article.slug);

/**
 * Resolve the article as it should be shown for a locale: the English source
 * merged with the localized overlay when one exists (English for everything
 * that has no localized variant yet). Category metadata is localized via the
 * page-content model when a category label is provided.
 */
export const articleLocalized = (
  article: BlogArticle,
  locale: string = DEFAULT_LOCALE
): BlogArticle => {
  if (locale === DEFAULT_LOCALE) return article;
  const localized = article.localized?.[locale as LocaleCode];
  return localized ? { ...article, ...localized } : article;
};

export const hasLocalizedArticle = (article: BlogArticle, locale: string = DEFAULT_LOCALE): boolean =>
  locale === DEFAULT_LOCALE || Boolean(article.localized?.[locale as LocaleCode]);