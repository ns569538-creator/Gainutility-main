import type React from "react";
import type { ToolId } from "./types";
import { ToolIcon } from "./studioIcons";

/**
 * Canonical metadata for every live tool in the platform.
 * Consumed by StudioPage rendering and the shared search index.
 *
 * Icons come from the centralized toolIcons map (see studioIcons.tsx),
 * keyed by tool slug, so every Studio renders a tool-specific SVG.
 */
export const toolsRegistry: Record<ToolId, { name: string; desc: string; category: string; icon: React.ReactNode; badge?: string; aliases?: string[] }> = {
    "json-validator": { 
      name: "JSON Validator", 
      desc: "Check whether your JSON is valid and see the exact line where a problem appears.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-validator" />,
    },
    "json-beautifier": { 
      name: "JSON Beautifier", 
      desc: "Reformat minified JSON with clean indentation and syntax highlighting.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-beautifier" />,
    },
    "json-minifier": { 
      name: "JSON Minifier", 
      desc: "Strip whitespace and line breaks from JSON to shrink it for APIs and storage.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-minifier" />
    },
    "json-tree-viewer": { 
      name: "JSON Tree Viewer", 
      desc: "Explore nested JSON as an expandable tree and copy any value's path.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-tree-viewer" />
    },
    "json-compare-diff": { 
      name: "Compare JSON", 
      desc: "See what changed between two JSON documents, with each added or removed key marked.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-compare-diff" />,
    },
    "json-to-csv": { 
      name: "JSON to CSV", 
      desc: "Flatten nested JSON into a CSV table you can open in Excel or Google Sheets.", 
      category: "JSON Utilities",
      icon: <ToolIcon slug="json-to-csv" />
    },
    "gradient-generator": { 
      name: "CSS Gradients", 
      desc: "Build multi-stop linear and radial gradients, then copy the CSS or export a PNG.", 
      category: "Design Utilities",
      icon: <ToolIcon slug="gradient-generator" />,
    },
    "contrast-checker": { 
      name: "Contrast Checker", 
      desc: "Measure text and background colors against WCAG AA and AAA ratios, with color-blindness previews.", 
      category: "Design Utilities",
      icon: <ToolIcon slug="contrast-checker" />
    },
    "base64-tool": { 
      name: "Base64 Encoder & Decoder", 
      desc: "Encode text to Base64 or decode it back, with full UTF-8 and Unicode support.", 
      category: "Developer Utilities",
      icon: <ToolIcon slug="base64-tool" />
    },
    "box-shadow-generator": { 
      name: "CSS Box Shadow Generator", 
      desc: "Design box shadows and text shadows visually — layered presets, live preview, and copy-ready CSS.", 
      category: "Design Utilities",
      icon: <ToolIcon slug="box-shadow-generator" />
    },
    "border-radius-generator": { 
      name: "Border Radius Generator", 
      desc: "Design asymmetric corner curves and organic blobs, then copy the border-radius CSS.", 
      category: "Design Utilities",
      icon: <ToolIcon slug="border-radius-generator" />
    },
    "slug-generator": {
      name: "SEO Slug Generator",
      desc: "Turn a page title into a clean, lowercase, URL-friendly slug.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="slug-generator" />,
    },
    "seo-meta-generator": {
      name: "SEO Meta Generator",
      desc: "Write title and description tags with live length checks.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="seo-meta-generator" />,
    },
    "og-meta-generator": {
      name: "Open Graph Generator",
      desc: "Create Open Graph tags so links preview well when shared.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="og-meta-generator" />,
    },
    "twitter-card-generator": {
      name: "Twitter Card Generator",
      desc: "Build Twitter card meta tags for summary and large-image posts.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="twitter-card-generator" />,
    },
    "robots-txt-generator": {
      name: "Robots.txt Generator",
      desc: "Compose a robots.txt file that tells crawlers where they can and cannot go.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="robots-txt-generator" />,
    },
    "xml-sitemap-generator": {
      name: "XML Sitemap Generator",
      desc: "Generate an XML sitemap with priorities and change frequencies.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="xml-sitemap-generator" />,
    },
    "schema-markup-generator": {
      name: "Schema Markup Generator",
      desc: "Create JSON-LD structured data for rich search results.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="schema-markup-generator" />,
    },
    "utm-builder": {
      name: "UTM Campaign Builder",
      desc: "Build campaign URLs with consistent UTM parameters and copy them in one click.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="utm-builder" />,
    },
    "canonical-url-generator": {
      name: "Canonical URL Generator",
      desc: "Generate canonical tags that point search engines to the correct page URL.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="canonical-url-generator" />,
    },
    "hreflang-tag-generator": {
      name: "hreflang Tag Generator",
      desc: "Create hreflang tags for pages that exist in multiple languages or regions.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="hreflang-tag-generator" />,
    },
    "google-serp-preview": {
      name: "Google SERP Snippet Preview",
      desc: "See how your title and description might look on Google, on desktop and mobile.",
      category: "SEO Utilities",
      icon: <ToolIcon slug="google-serp-preview" />,
    },
    "check-my-website": {
      name: "Check My Website",
      desc: "Fetch a URL and surface SEO, technical, social, image, accessibility, performance and security findings with clear fixes.",
      category: "Website Studio",
      icon: <ToolIcon slug="check-my-website" />,
      aliases: ["website health check", "site checker", "url inspector"],
    },
    "launch-checklist": {
      name: "Launch Checklist",
      desc: "Turn the same scan into a pre-launch gate: critical, important and optional items before you go live.",
      category: "Website Studio",
      icon: <ToolIcon slug="launch-checklist" />,
      aliases: ["pre launch checklist", "site launch review", "go live checklist"],
    },
    "qr-code-generator": { 
      name: "QR Code Generator", 
      desc: "Create QR codes for URLs, text, emails, and more, then download them as PNG or SVG.", 
      category: "Developer Utilities",
      icon: <ToolIcon slug="qr-code-generator" />
    },
    "url-encoder-decoder": { 
      name: "URL Encoder Decoder", 
      desc: "Percent-encode text for safe use in URLs, or decode encoded strings back to readable text.", 
      category: "Developer Utilities",
      icon: <ToolIcon slug="url-encoder-decoder" />
    },
    "html-entity-encoder": { 
      name: "HTML Entity Encoder", 
      desc: "Escape text into HTML entities so it renders as plain text, never as markup.", 
      category: "Developer Utilities",
      icon: <ToolIcon slug="html-entity-encoder" />
    },
    "youtube-thumbnail-preview": {
      name: "YouTube Thumbnail Preview",
      desc: "Preview a thumbnail across YouTube's desktop, mobile, and TV layouts.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-thumbnail-preview" />,
      aliases: [
        "youtube thumbnail preview", "thumbnail preview", "youtube thumbnail tester",
        "youtube thumbnail checker", "preview youtube thumbnail", "thumbnail test",
      ],
    },
    "youtube-title-analyzer": {
      name: "YouTube Title Analyzer",
      desc: "Check a video title's length and see where mobile feeds would cut it off.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-title-analyzer" />,
      aliases: [
        "youtube title analyzer", "youtube title score", "headline analyzer",
        "video title optimizer", "youtube title tester", "youtube title checker",
      ],
    },
    "youtube-timestamp-formatter": {
      name: "YouTube Timestamp Formatter",
      desc: "Clean up timestamps so chapters paste neatly into a video description.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-timestamp-formatter" />
    },
    "youtube-chapter-generator": {
      name: "YouTube Chapter Generator",
      desc: "Build chapter lists from your timestamps with segment previews.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-chapter-generator" />,
    },
    "youtube-embed-generator": {
      name: "YouTube Embed Generator",
      desc: "Generate iframe embed code with sizing, loop, mute, and privacy options.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-embed-generator" />
    },
    "youtube-url-toolkit": {
      name: "YouTube URL Toolkit",
      desc: "Clean tracking junk out of YouTube links and pull out the video ID.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-url-toolkit" />
    },
    "thumbnail-safe-zone": {
      name: "Thumbnail Safe Zone Checker",
      desc: "Overlay safe-zone guides so YouTube's badges never cover your design.",
      category: "Creator Studio",
      icon: <ToolIcon slug="thumbnail-safe-zone" />
    },
    "youtube-description-formatter": {
      name: "YouTube Description Formatter",
      desc: "Structure a description with sections, links, and chapters.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-description-formatter" />
    },
    "youtube-keyword-explorer": {
      name: "YouTube Keyword Explorer",
      desc: "Find real search phrases for your topic using live YouTube autocomplete.",
      category: "Creator Studio",
      icon: <ToolIcon slug="youtube-keyword-explorer" />,
    },
    "stylish-name-generator": {
      name: "Stylish Name Generator",
      desc: "Turn any name into bold, script, bubble and other Unicode styles — finished with symbols and emoji.",
      category: "Creator Studio",
      icon: <ToolIcon slug="stylish-name-generator" />,
      aliases: [
        "stylish name maker", "stylish name", "stylish name generator",
        "nickname generator", "fancy name generator", "cool name generator",
        "stylish nickname generator", "fancy text", "unicode name generator",
        "name style engine", "emoji name generator", "aesthetic name generator",
        "cute name generator", "stylish names", "cool nicknames", "fancy nicknames",
        "discord names", "gaming names", "instagram names", "tiktok names",
        "free fire names", "pubg names",
      ],
    },
    // Classic-layout tools (fully functional; also surfaced in search)
    "json-formatter": { name: "JSON Formatter (Classic)", desc: "Classic JSON formatter & syntax validator workspace.", category: "JSON Utilities", icon: <ToolIcon slug="json-formatter" /> },
    "json-viewer": { name: "JSON Viewer (Classic)", desc: "Classic expandable JSON tree viewer layout.", category: "JSON Utilities", icon: <ToolIcon slug="json-viewer" /> },
    "json-compare": { name: "JSON Compare (Classic)", desc: "Classic side-by-side JSON difference viewer.", category: "JSON Utilities", icon: <ToolIcon slug="json-compare" /> },

    // PDF Utilities - Security Category
    "protect-pdf": {
      name: "Protect PDF with Password",
      desc: "Lock a PDF with a password and set what others may do with it.",
      category: "Document Security",
      icon: <ToolIcon slug="protect-pdf" />,
    },
    "unlock-pdf": {
      name: "Unlock PDF",
      desc: "Strip printing/copying limits from a PDF that opens without a password.",
      category: "Document Security",
      icon: <ToolIcon slug="unlock-pdf" />,
    },
    "remove-pdf-password": {
      name: "Remove PDF Password",
      desc: "Remove password protection from a PDF you are allowed to open.",
      category: "Document Security",
      icon: <ToolIcon slug="remove-pdf-password" />
    },
    "add-pdf-watermark": {
      name: "Add Watermark to PDF",
      desc: "Overlay text or image watermarks across every page of a PDF.",
      category: "Document Security",
      icon: <ToolIcon slug="add-pdf-watermark" />,
    },
    "flatten-pdf": {
      name: "Flatten PDF",
      desc: "Turn form fields and comments into plain, permanent page content.",
      category: "Document Security",
      icon: <ToolIcon slug="flatten-pdf" />
    },

    // PDF Utilities - Organize PDF Category
    "merge-pdf": {
      name: "Merge PDF",
      desc: "Combine several PDFs into one file and reorder the pages before saving.",
      category: "Organize PDF",
      icon: <ToolIcon slug="merge-pdf" />,
    },
    "split-pdf": {
      name: "Split PDF",
      desc: "Split a PDF into single pages or extract a custom page range.",
      category: "Organize PDF",
      icon: <ToolIcon slug="split-pdf" />,
    },
    "rotate-pdf": {
      name: "Rotate PDF",
      desc: "Rotate any page in a PDF in 90-degree steps.",
      category: "Organize PDF",
      icon: <ToolIcon slug="rotate-pdf" />
    },
    "extract-pdf": {
      name: "Extract PDF Pages",
      desc: "Pull the specific pages you need out of a larger file.",
      category: "Organize PDF",
      icon: <ToolIcon slug="extract-pdf" />,
    },
    "delete-pdf": {
      name: "Remove Pages from PDF",
      desc: "Remove unwanted or blank pages from a PDF.",
      category: "Organize PDF",
      icon: <ToolIcon slug="delete-pdf" />
    },
    "rearrange-pdf": {
      name: "Rearrange PDF Pages",
      desc: "Drag pages into a new order and save the result.",
      category: "Organize PDF",
      icon: <ToolIcon slug="rearrange-pdf" />
    },
    "add-pdf-page-numbers": {
      name: "Add Page Numbers",
      desc: "Add page numbers to a PDF at the position and size you choose.",
      category: "Organize PDF",
      icon: <ToolIcon slug="add-pdf-page-numbers" />,
    },
    "add-pdf-header-footer": {
      name: "Add Header & Footer",
      desc: "Add repeating header and footer text to every page.",
      category: "Organize PDF",
      icon: <ToolIcon slug="add-pdf-header-footer" />
    },
    "crop-pdf": {
      name: "Crop PDF Pages",
      desc: "Trim the margins of PDF pages down to a new size.",
      category: "Organize PDF",
      icon: <ToolIcon slug="crop-pdf" />,
    },
    "duplicate-page-finder-pdf": {
      name: "Duplicate Page Finder",
      desc: "Find pages in a PDF that appear more than once.",
      category: "Organize PDF",
      icon: <ToolIcon slug="duplicate-page-finder-pdf" />
    },
    "remove-blank-pages-pdf": {
      name: "Remove Blank Pages",
      desc: "Automatically find and remove empty pages from a PDF.",
      category: "Organize PDF",
      icon: <ToolIcon slug="remove-blank-pages-pdf" />,
    },
    "reverse-page-order-pdf": {
      name: "Reverse Page Order",
      desc: "Flip a whole document so it reads back to front.",
      category: "Organize PDF",
      icon: <ToolIcon slug="reverse-page-order-pdf" />
    },
    "extract-odd-pages-pdf": {
      name: "Extract Odd Pages",
      desc: "Pull the odd-numbered pages into a new PDF.",
      category: "Organize PDF",
      icon: <ToolIcon slug="extract-odd-pages-pdf" />
    },
    "extract-even-pages-pdf": {
      name: "Extract Even Pages",
      desc: "Pull the even-numbered pages into a new PDF.",
      category: "Organize PDF",
      icon: <ToolIcon slug="extract-even-pages-pdf" />
    },

    // PDF Utilities - Convert PDF Category
    "jpg-to-pdf": {
      name: "Image to PDF",
      desc: "Turn JPG, JPEG or PNG images into a single PDF.",
      aliases: [
        "jpg to pdf",
        "png to pdf",
        "jpeg to pdf",
        "image to pdf",
        "images to pdf",
        "jpg pdf",
        "jpeg pdf",
        "image pdf",
        "convert jpg to pdf",
        "convert jpeg to pdf",
        "convert image to pdf"
      ],
      category: "Convert PDF",
      icon: <ToolIcon slug="jpg-to-pdf" />
    },
    "pdf-to-jpg": {
      name: "PDF to JPG Converter",
      desc: "Export individual PDF pages as JPG images.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-jpg" />
    },
    "word-to-pdf": {
      name: "Word to PDF",
      desc: "Convert a Word .docx file into a consistent PDF.",
      category: "Convert PDF",
      icon: <ToolIcon slug="word-to-pdf" />,
    },
    "pdf-to-word": {
      name: "PDF to Word",
      desc: "Convert a PDF back into an editable .docx file.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-word" />,
    },
    "excel-to-pdf": {
      name: "Excel to PDF",
      desc: "Turn spreadsheet sheets into print-ready PDF pages.",
      category: "Convert PDF",
      icon: <ToolIcon slug="excel-to-pdf" />
    },
    "pdf-to-excel": {
      name: "PDF to Excel",
      desc: "Extract tables from a PDF into CSV or Excel columns.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-excel" />
    },
    "powerpoint-to-pdf": {
      name: "PowerPoint to PDF",
      desc: "Convert slide decks into fixed-layout PDFs.",
      category: "Convert PDF",
      icon: <ToolIcon slug="powerpoint-to-pdf" />
    },
    "pdf-to-powerpoint": {
      name: "PDF to PowerPoint",
      desc: "Turn PDF pages into editable slide layouts.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-powerpoint" />
    },
    "html-to-pdf": {
      name: "HTML to PDF",
      desc: "Render HTML into a clean, printable PDF.",
      category: "Convert PDF",
      icon: <ToolIcon slug="html-to-pdf" />
    },
    "pdf-to-text": {
      name: "PDF to Text",
      desc: "Extract the readable text from a PDF.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-text" />,
    },
    "text-to-pdf": {
      name: "Text to PDF",
      desc: "Turn plain text or markdown into a formatted PDF.",
      category: "Convert PDF",
      icon: <ToolIcon slug="text-to-pdf" />
    },
    "pdf-to-html": {
      name: "PDF to HTML",
      desc: "Convert PDF pages into HTML you can edit and style.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-to-html" />,
    },
    "pdf-translator": {
      name: "PDF Translator",
      desc: "Translate a PDF page by page into another language.",
      category: "Convert PDF",
      icon: <ToolIcon slug="pdf-translator" />,
    },

    // PDF Utilities - Optimize Category
    "remove-pdf-metadata": {
      name: "Remove PDF Metadata",
      desc: "Delete author, date, and editing history from a PDF before sharing it.",
      category: "Optimize",
      icon: <ToolIcon slug="remove-pdf-metadata" />,
    },
    "repair-pdf": {
      name: "Repair PDF File",
      desc: "Rebuild a PDF that shows as damaged or won't open.",
      category: "Optimize",
      icon: <ToolIcon slug="repair-pdf" />
    },
    "validate-pdf": {
      name: "Validate PDF",
      desc: "Check a PDF against ISO rules, including PDF/A compliance.",
      category: "Optimize",
      icon: <ToolIcon slug="validate-pdf" />
    },
    "optimize-pdf-web": {
      name: "Optimize PDF for Web",
      desc: "Linearize a PDF so it streams faster in browsers.",
      category: "Optimize",
      icon: <ToolIcon slug="optimize-pdf-web" />,
    },
    "reduce-pdf-image-quality": {
      name: "Compress PDF",
      desc: "Down-sample the images inside a PDF to cut its size.",
      aliases: [
        "compress pdf",
        "compress a pdf",
        "pdf compressor",
        "pdf compression",
        "make pdf smaller",
        "shrink pdf",
        "reduce pdf size",
        "smaller pdf"
      ],
      category: "Optimize",
      icon: <ToolIcon slug="reduce-pdf-image-quality" />
    },
    "compress-images-inside-pdf": {
      name: "Compress Images Inside PDF",
      desc: "Compress embedded images while keeping text sharp.",
      category: "Optimize",
      icon: <ToolIcon slug="compress-images-inside-pdf" />
    },

    // PDF Utilities - Advanced Category
    "ocr-pdf": {
      name: "OCR PDF",
      desc: "Run OCR on scanned pages and export the extracted text to a .txt file.",
      category: "Advanced",
      icon: <ToolIcon slug="ocr-pdf" />
    },
    "compare-two-pdfs": {
      name: "Compare Two PDFs",
      desc: "Highlight the differences between two PDF files.",
      category: "Advanced",
      icon: <ToolIcon slug="compare-two-pdfs" />,
    },
    "merge-selected-page-ranges": {
      name: "Merge Selected Ranges",
      desc: "Merge chosen page ranges from several PDFs into one file.",
      category: "Advanced",
      icon: <ToolIcon slug="merge-selected-page-ranges" />
    },
    "split-by-file-size": {
      name: "Split by File Size",
      desc: "Split a big PDF into smaller files that fit a target size limit.",
      category: "Advanced",
      icon: <ToolIcon slug="split-by-file-size" />
    },
    "split-every-n-pages": {
      name: "Split Every N Pages",
      desc: "Split a PDF into equal chunks of N pages each.",
      category: "Advanced",
      icon: <ToolIcon slug="split-every-n-pages" />
    },
    "image-resizer": {
      name: "Image Resizer",
      desc: "Resize images by exact pixels or by percentage, one at a time or in a batch.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-resizer" />
    },
    "image-cropper": {
      name: "Image Cropper",
      desc: "Crop and rotate images with preset aspect-ratio overlays.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-cropper" />
    },
    "image-converter": {
      name: "Image Converter",
      desc: "Convert images between JPG, PNG, WEBP, BMP, and TIFF formats.",
      aliases: [
        "compress image",
        "compress images",
        "image compressor",
        "compress jpg",
        "reduce image size",
        "make image smaller",
        "shrink image"
      ],
      category: "Image Studio",
      icon: <ToolIcon slug="image-converter" />
    },
    "webp-converter": {
      name: "WebP Converter",
      desc: "Convert images to WebP, or WebP back to PNG or JPG.",
      category: "Image Studio",
      icon: <ToolIcon slug="webp-converter" />,
    },
    "png-jpg-converter": {
      name: "PNG & JPG Converter",
      desc: "Switch images between PNG and JPEG while keeping the best quality.",
      category: "Image Studio",
      icon: <ToolIcon slug="png-jpg-converter" />
    },
    "heic-jpg-converter": {
      name: "HEIC to JPG Converter",
      desc: "Convert Apple HEIC photos to JPG files that work anywhere.",
      category: "Image Studio",
      icon: <ToolIcon slug="heic-jpg-converter" />
    },
    "svg-converter": {
      name: "SVG Converter",
      desc: "Render SVG files out to PNG or WebP at the size you need.",
      category: "Image Studio",
      icon: <ToolIcon slug="svg-converter" />
    },
    "image-watermark": {
      name: "Image Watermark",
      desc: "Add a text or logo watermark across a batch of images.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-watermark" />,
    },
    "image-blur-pixelate": {
      name: "Image Blur & Pixelate",
      desc: "Blur or pixelate faces and details in a photo before sharing it.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-blur-pixelate" />
    },
    "social-resizer": { 
      name: "Social Media Resizer", 
      desc: "Crop and pad images to the exact sizes social platforms expect.", 
      category: "Image Studio",
      icon: <ToolIcon slug="social-resizer" />,
    },
    "favicon-generator": { 
      name: "Favicon Generator", 
      desc: "Generate a full favicon set, from .ico to Apple touch icons and PWA images.", 
      category: "Image Studio",
      icon: <ToolIcon slug="favicon-generator" />,
    },
    "logo-maker": { 
      name: "Logo Maker", 
      desc: "Create and customize logos online with custom typography, symbols, colors, and layout presets.", 
      category: "Image Studio",
      icon: <ToolIcon slug="logo-maker" />,
    },
    "collage-maker": { 
      name: "Image Collage Maker", 
      desc: "Arrange photos into a styled collage with live spacing and corner controls.", 
      category: "Image Studio",
      icon: <ToolIcon slug="collage-maker" />,
    },
    "uuid-generator": {
      name: "UUID Generator",
      desc: "Generate UUIDs in bulk without sending them to a server.",
      category: "Developer Studio",
      icon: <ToolIcon slug="uuid-generator" />,
    },
    "jwt-decoder": {
      name: "JWT Decoder & Generator",
      desc: "Decode JWT headers and payloads in your browser, or generate a token from custom claims.",
      category: "Developer Studio",
      icon: <ToolIcon slug="jwt-decoder" />,
    },
    "password-generator": {
      name: "Password Generator",
      desc: "Create random passwords using the length and character rules you choose.",
      category: "Developer Studio",
      icon: <ToolIcon slug="password-generator" />,
    },
    "password-strength-checker": {
      name: "Password Strength Analyzer",
      desc: "Score a password's strength and see what makes it easy or hard to guess.",
      category: "Developer Studio",
      icon: <ToolIcon slug="password-strength-checker" />
    },
    "hash-generator": {
      name: "Cryptographic Hash Generator",
      desc: "Compute SHA-1, SHA-256, and SHA-512 hashes of text or files in your browser.",
      category: "Developer Studio",
      icon: <ToolIcon slug="hash-generator" />
    },
    "regex-tester": {
      name: "Visual Regex Tester",
      desc: "Write and test regular expressions with live match highlighting and capture groups.",
      category: "Developer Studio",
      icon: <ToolIcon slug="regex-tester" />
    },
    "unix-timestamp-converter": {
      name: "Unix Timestamp Converter",
      desc: "Convert Unix timestamps to readable dates and back, in your local timezone.",
      category: "Developer Studio",
      icon: <ToolIcon slug="unix-timestamp-converter" />
    },
    "cron-expression-builder": {
      name: "Cron Expression Builder",
      desc: "Turn cron schedules into plain English and copy the finished expression.",
      category: "Developer Studio",
      icon: <ToolIcon slug="cron-expression-builder" />
    },
    "text-diff-checker": {
      name: "Visual Text Diff Checker",
      desc: "Compare two blocks of text and see added or removed lines highlighted.",
      category: "Developer Studio",
      icon: <ToolIcon slug="text-diff-checker" />
    },
    "json-schema-validator": {
      name: "JSON Schema Validator",
      desc: "Validate JSON data against a JSON Schema draft-07 definition.",
      category: "Developer Studio",
      icon: <ToolIcon slug="json-schema-validator" />
    },
    "jsonpath-tester": {
      name: "JSONPath Query Tester",
      desc: "Test JSONPath queries against your JSON and see which values match.",
      category: "Developer Studio",
      icon: <ToolIcon slug="jsonpath-tester" />
    },
    "csv-json-converter": {
      name: "CSV to JSON Converter",
      desc: "Convert CSV tables to JSON arrays, and JSON arrays back to CSV.",
      category: "Developer Studio",
      icon: <ToolIcon slug="csv-json-converter" />
    },
    "xml-json-converter": {
      name: "XML to JSON Converter",
      desc: "Translate XML documents to JSON, and JSON back to XML.",
      category: "Developer Studio",
      icon: <ToolIcon slug="xml-json-converter" />
    },
    "sql-formatter": {
      name: "SQL Query Formatter",
      desc: "Indent and align SQL queries so they are easier to read.",
      category: "Developer Studio",
      icon: <ToolIcon slug="sql-formatter" />
    },
    "yaml-formatter": {
      name: "YAML Document Formatter",
      desc: "Validate and reformat YAML with consistent indentation.",
      category: "Developer Studio",
      icon: <ToolIcon slug="yaml-formatter" />
    },
    "http-status-code-lookup": {
      name: "HTTP Status Code Guide",
      desc: "Look up what any HTTP status code means in a compact reference.",
      category: "Developer Studio",
      icon: <ToolIcon slug="http-status-code-lookup" />
    },
    "mime-type-lookup": {
      name: "MIME Type & Header Lookup",
      desc: "Find the MIME type and common Content-Type header for a file format.",
      category: "Developer Studio",
      icon: <ToolIcon slug="mime-type-lookup" />
    },
    "url-parser": {
      name: "URL Parser & Breakdown",
      desc: "Break a URL into protocol, host, path, and query parts and inspect each.",
      category: "Developer Studio",
      icon: <ToolIcon slug="url-parser" />
    },
    "image-metadata-remover": {
      name: "Image Metadata Remover",
      desc: "Strip EXIF and GPS data from photos so camera and location details stay private.",
      category: "Developer Studio",
      icon: <ToolIcon slug="image-metadata-remover" />,
    },
    "background-remover": {
      name: "Background Remover",
      desc: "Remove the background from an image in your browser.",
      category: "Image Studio",
      icon: <ToolIcon slug="background-remover" />,
      aliases: [
        "transparent png", "make transparent png", "remove background",
        "image background remover", "transparent background maker", "png cutout",
      ],
    },
    "passport-photo-maker": {
      name: "Passport Photo Maker",
      desc: "Prepare passport and ID photos to common country dimension requirements.",
      category: "Image Studio",
      icon: <ToolIcon slug="passport-photo-maker" />,
    },
    "image-upscaler": {
      name: "Image Upscaler",
      desc: "Enlarge images and smooth out the resulting edges and noise.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-upscaler" />,
    },
    "signature-maker": {
      name: "Signature Maker",
      desc: "Draw or type a signature and export it as a transparent image.",
      category: "Image Studio",
      icon: <ToolIcon slug="signature-maker" />,
    },
    "csv-reconciliation": {
      name: "CSV / Excel Reconciliation",
      desc: "Compare two spreadsheets locally and see which rows were added, changed, or removed.",
      category: "Developer Studio",
      icon: <ToolIcon slug="csv-reconciliation" />,
    },
    "excel-formula-generator": {
      name: "Plain English → Excel Formula",
      desc: "Describe a calculation in plain English and get a working Excel or Sheets formula.",
      category: "Developer Studio",
      icon: <ToolIcon slug="excel-formula-generator" />,
    },
    "billable-hours-calculator": {
      name: "Billable Hours Calculator",
      desc: "Work out billable hours, rates, and taxes, and generate a formatted invoice.",
      category: "Developer Studio",
      icon: <ToolIcon slug="billable-hours-calculator" />,
    },
    "pdf-difference-checker": {
      name: "PDF Difference Checker",
      desc: "Compare two documents side by side and spot changed clauses and sections.",
      category: "PDF Studio",
      icon: <ToolIcon slug="pdf-difference-checker" />,
    },
    "business-pdf-extractor": {
      name: "Business PDF Data Extractor",
      desc: "Pull line items, totals, and metadata out of PDF invoices and purchase orders.",
      category: "PDF Studio",
      icon: <ToolIcon slug="business-pdf-extractor" />,
    },
    "invoice-follow-up-tracker": {
      name: "Invoice Follow-Up Tracker",
      desc: "Track overdue invoices, see payment aging, and draft follow-up reminders.",
      category: "Developer Studio",
      icon: <ToolIcon slug="invoice-follow-up-tracker" />,
    },
    "font-detector": {
      name: "Font Detector",
      desc: "Browse the Google Fonts catalog, preview typefaces with your own text, and copy ready-to-use CSS.",
      category: "Design Utilities",
      icon: <ToolIcon slug="font-detector" />,
    },
    "linkedin-carousel-maker": {
      name: "LinkedIn Carousel Maker",
      desc: "Build multi-slide LinkedIn carousels and export them as PDF or ZIP.",
      category: "Creator Studio",
      icon: <ToolIcon slug="linkedin-carousel-maker" />,
    },
    "color-palette-generator": {
      name: "Color Palette Builder",
      desc: "Generate harmonious palettes, lock what you love, check contrast, and export HEX or CSS.",
      category: "Design Utilities",
      icon: <ToolIcon slug="color-palette-generator" />,
    },
    "color-picker": {
      name: "Color Picker",
      desc: "Pick any color, see its scale and harmonies, and copy the HEX, RGB, or HSL values.",
      category: "Design Utilities",
      icon: <ToolIcon slug="color-picker" />,
    },
    "color-explorer": {
      name: "Color Explorer",
      desc: "Browse every named CSS color grouped by family, search by name, and open full profiles.",
      category: "Design Utilities",
      icon: <ToolIcon slug="color-explorer" />,
    },
    "color-visualizer": {
      name: "UI Color Visualizer",
      desc: "Apply any palette to buttons, cards, and tables with live CSS previews and contrast checks.",
      category: "Design Utilities",
      icon: <ToolIcon slug="color-visualizer" />,
    },
    "image-to-palette": {
      name: "Image to Palette",
      desc: "Drop a photo and extract its dominant colors into a copyable palette.",
      category: "Image Studio",
      icon: <ToolIcon slug="image-to-palette" />,
    },
    "application-file-checker": {
      name: "Application File Checker",
      desc: "Check your application files against the recorded requirements and fix what isn't right.",
      category: "Exam & Application",
      icon: <ToolIcon slug="application-file-checker" />,
    },
    "exam-photo-fixer": {
      name: "Exam Photo Resizer",
      desc: "Resize and compress a photo to the exact KB and pixel size your application needs.",
      category: "Exam & Application",
      icon: <ToolIcon slug="exam-photo-fixer" />
    },
    "exam-signature-fixer": {
      name: "Exam Signature Resizer",
      desc: "Clean up and resize a handwritten signature without losing legibility.",
      category: "Exam & Application",
      icon: <ToolIcon slug="exam-signature-fixer" />
    },
    "exam-thumb-fixer": {
      name: "Thumb Impression Resizer",
      desc: "Clean and compress a thumb-impression scan to the required size.",
      category: "Exam & Application",
      icon: <ToolIcon slug="exam-thumb-fixer" />
    },
    "declaration-fixer": {
      name: "Declaration Photo Compressor",
      desc: "Compress a declaration photo or scan to fit the application's size limit.",
      category: "Exam & Application",
      icon: <ToolIcon slug="declaration-fixer" />
    },
    "pdf-exact-size": {
      name: "PDF Size Reducer for Applications",
      desc: "Bring a PDF under your application's maximum size while keeping it readable.",
      category: "Exam & Application",
      icon: <ToolIcon slug="pdf-exact-size" />
    },
    "exam-file-requirements": {
      name: "Exam File Requirements",
      desc: "Check exam photo, signature and thumb impression requirements, then prepare and download application files to the correct size, dimensions and format.",
      category: "Exam & Application",
      icon: <ToolIcon slug="exam-file-requirements" />
    },
    /* Media Studio — local, browser-processed video & audio tools */
    "video-audio-extractor": {
      name: "Video Audio Extractor",
      desc: "Pull the audio track out of a video as a WAV file, right in your browser.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-audio-extractor" />,
      badge: "Local Only",
      aliases: ["extract audio", "remove audio", "get audio from video", "mp4 to mp3", "video to mp3", "audio extractor", "video to wav", "mp4 to wav"]
    },
    "video-compressor": {
      name: "Video Compressor",
      desc: "Re-encode a video with a lower bitrate to shrink its file size locally.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-compressor" />,
      badge: "Local Only",
      aliases: ["compress video", "reduce video size", "shrink video", "file too large", "make video smaller", "video compressor"]
    },
    "video-resizer": {
      name: "Video Resizer",
      desc: "Resize a video and fit it to social formats like 9:16, 1:1, and 16:9.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-resizer" />,
      badge: "Local Only",
      aliases: ["resize video", "video aspect ratio", "make video vertical", "social video", "reframe video"]
    },
    "video-trimmer": {
      name: "Video Trimmer",
      desc: "Cut a video down to just the part you want, entirely on your device.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-trimmer" />,
      badge: "Local Only",
      aliases: ["trim video", "cut video", "crop video", "chop video", "video cutter", "crop video length"]
    },
    "video-converter": {
      name: "Video Converter",
      desc: "Convert a video to a different container this browser can actually write.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-converter" />,
      badge: "Local Only",
      aliases: ["convert video", "change video format", "webm to mp4", "mp4 to webm", "video converter"]
    },
    "video-to-gif": {
      name: "Video to GIF",
      desc: "Turn a short clip into an animated GIF with customizable FPS and width.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-to-gif" />,
      badge: "Local Only",
      aliases: ["video to gif", "make a gif", "make gif", "gif maker", "animated gif from video", "animated gif"]
    },
    "photos-to-video": {
      name: "Photos to Video",
      desc: "Turn several photos into a short slideshow video, generated on your device.",
      category: "Media Studio",
      icon: <ToolIcon slug="photos-to-video" />,
      badge: "Local Only",
      aliases: ["images to video", "photo slideshow", "make slideshow", "pictures to video", "slideshow"]
    },
    "video-downloader": {
      name: "Video Downloader",
      desc: "Paste a link or drop a file, then save the original or get it into the exact form you need — all locally.",
      category: "Media Studio",
      icon: <ToolIcon slug="video-downloader" />,
      badge: "Local Only",
      aliases: [
        "video downloader",
        "download video",
        "download video from link",
        "video download",
        "online video downloader",
        "save video",
        "download video file",
        "video link"
      ]
    },
    "add-music-to-photo": {
      name: "Add Music to Photo",
      desc: "Turn a photo and an audio file into a share-ready video. Choose social presets, trim audio, adjust volume — all in your browser.",
      category: "Media Studio",
      icon: <ToolIcon slug="add-music-to-photo" />,
      badge: "Local Only",
      aliases: [
        "add music to photo",
        "photo video maker",
        "image to video with music",
        "add audio to image",
        "photo with music",
        "whatsapp status maker",
        "instagram story maker",
        "social status video maker"
      ]
    }
  };