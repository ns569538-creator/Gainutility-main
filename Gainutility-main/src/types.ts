/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolId = 
  | "json-formatter" 
  | "json-viewer"
  | "json-compare"
  | "json-validator"
  | "json-minifier"
  | "json-beautifier"
  | "json-tree-viewer"
  | "json-compare-diff"
  | "json-to-csv"
  | "gradient-generator" 
  | "contrast-checker" 
  | "base64-tool" 
  | "box-shadow-generator"
  | "border-radius-generator"
  | "qr-code-generator"
  | "url-encoder-decoder"
  | "html-entity-encoder"
  | "youtube-thumbnail-preview"
  | "youtube-title-analyzer"
  | "youtube-timestamp-formatter"
  | "youtube-chapter-generator"
  | "youtube-embed-generator"
  | "youtube-url-toolkit"
  | "thumbnail-safe-zone"
  | "youtube-description-formatter"
  | "youtube-keyword-explorer"
  | "slug-generator"
  | "check-my-website"
  | "launch-checklist"
  | "image-resizer"
  | "image-cropper"
  | "image-converter"
  | "webp-converter"
  | "png-jpg-converter"
  | "heic-jpg-converter"
  | "svg-converter"
  | "image-watermark"
  | "image-blur-pixelate"
  | "social-resizer"
  | "favicon-generator"
  | "logo-maker"
  | "collage-maker"
  | "seo-meta-generator"
  | "og-meta-generator"
  | "twitter-card-generator"
  | "robots-txt-generator"
  | "xml-sitemap-generator"
  | "schema-markup-generator"
  | "utm-builder"
  | "canonical-url-generator"
  | "hreflang-tag-generator"
  | "google-serp-preview"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "jpg-to-pdf"
  | "pdf-to-jpg"
  | "extract-pdf"
  | "delete-pdf"
  | "rearrange-pdf"
  | "protect-pdf"
  | "unlock-pdf"
  | "remove-pdf-password"
  | "add-pdf-watermark"
  | "flatten-pdf"
  | "add-pdf-page-numbers"
  | "add-pdf-header-footer"
  | "crop-pdf"
  | "duplicate-page-finder-pdf"
  | "remove-blank-pages-pdf"
  | "reverse-page-order-pdf"
  | "extract-odd-pages-pdf"
  | "extract-even-pages-pdf"
  | "word-to-pdf"
  | "pdf-to-word"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "powerpoint-to-pdf"
  | "pdf-to-powerpoint"
  | "html-to-pdf"
  | "pdf-to-text"
  | "text-to-pdf"
  | "remove-pdf-metadata"
  | "repair-pdf"
  | "validate-pdf"
  | "optimize-pdf-web"
  | "reduce-pdf-image-quality"
  | "compress-images-inside-pdf"
  | "ocr-pdf"
  | "compare-two-pdfs"
  | "merge-selected-page-ranges"
  | "split-by-file-size"
  | "split-every-n-pages"
  | "pdf-to-html"
  | "pdf-translator"
  | "uuid-generator"
  | "jwt-decoder"
  | "password-generator"
  | "password-strength-checker"
  | "hash-generator"
  | "regex-tester"
  | "unix-timestamp-converter"
  | "cron-expression-builder"
  | "text-diff-checker"
  | "json-schema-validator"
  | "jsonpath-tester"
  | "csv-json-converter"
  | "xml-json-converter"
  | "sql-formatter"
  | "yaml-formatter"
  | "http-status-code-lookup"
  | "mime-type-lookup"
  | "url-parser"
  | "image-metadata-remover"
  | "background-remover"
  | "passport-photo-maker"
  | "image-upscaler"
  | "signature-maker"
  | "application-file-checker"
  | "exam-photo-fixer"
  | "exam-signature-fixer"
  | "exam-thumb-fixer"
  | "declaration-fixer"
  | "pdf-exact-size"
  | "exam-file-requirements"
  | "csv-reconciliation"
  | "excel-formula-generator"
  | "billable-hours-calculator"
  | "pdf-difference-checker"
  | "business-pdf-extractor"
  | "invoice-follow-up-tracker"
  | "font-detector"
  | "linkedin-carousel-maker"
  | "color-palette-generator"
  | "color-picker"
  | "color-explorer"
  | "color-visualizer"
  | "image-to-palette"
  | "video-audio-extractor"
  | "video-compressor"
  | "video-resizer"
  | "video-trimmer"
  | "video-converter"
  | "video-to-gif"
  | "photos-to-video"
  | "video-downloader"
  | "add-music-to-photo"
  | "stylish-name-generator";

export type ColorStudioSectionId =
  | "home"
  | "generator"
  | "picker"
  | "explore"
  | "scales"
  | "colors"
  | "ui-colors"
  | "visualizer"
  | "contrast"
  | "image"
  | "gradients";

export type ViewState =
  | { type: "home" }
  | { type: "studio"; id: string }
  | { type: "tool"; id: ToolId }
  | { type: "seo-page"; id: string }
  | { type: "translator-pair"; pair: string }
  | { type: "comparison-page"; id: string }
  | { type: "category-best"; id: string }
  | { type: "library-page"; id: string }
  | { type: "about" }
  | { type: "privacy" }
  | { type: "terms" }
  | { type: "security" }
  | { type: "cookies" }
  | { type: "contact" }
  | { type: "faq" }
  | { type: "audit" }
  | { type: "color-studio"; section: ColorStudioSectionId }
  | { type: "color-page"; kind: "color" | "palette" | "ui-color"; id: string }
  | { type: "blog" }
  | { type: "blog-article"; slug: string }
  | { type: "changelog" }
  | { type: "tools-directory" }
  | { type: "notFound" };

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RelatedTool {
  name: string;
  id: ToolId;
  description: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  breadcrumb: { name: string; url: string }[];
  faqs: FAQItem[];
  related: RelatedTool[];
  indexable?: boolean;
  primaryIntent?: string;
  whoIsItFor?: string;
  limitations?: string[];
  privacyExplanation?: string;
  troubleshooting?: { problem: string; solution: string }[];
  useCases?: { title: string; desc: string }[];
  detailedContent: {
    whatText: string;
    whyText: string;
    features: string[];
    steps: string[];
    examples: { title: string; code: string; desc: string }[];
    mistakes: string[];
  };
}

export interface ColorToken {
  name: string;
  value: string;
  description: string;
}

export interface TypographyToken {
  name: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  usage: string;
}

export interface SpacingToken {
  token: string;
  value: string;
  usage: string;
}

export interface RadiusToken {
  token: string;
  value: string;
  usage: string;
}

export interface ShadowToken {
  token: string;
  value: string;
  usage: string;
}
