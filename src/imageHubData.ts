/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Curated inventory of the tools surfaced on the /image category hub.
 *
 * Lives outside the (code-split) ImageCategoryHub component so the shared
 * SEO layer — Layout's JSON-LD effect and the Node prerender script — can
 * emit an identical CollectionPage/ItemList without pulling the whole hub
 * bundle into the main chunk. Keep this module free of DOM/browser APIs.
 */

import type { ToolId } from "./types";

export type ImageJobFilter = "all" | "compress" | "resize" | "convert" | "edit" | "improve";

export interface ImageToolItem {
  id: ToolId;
  name: string;
  desktopDesc: string;
  mobileDesc: string;
  jobs: Exclude<ImageJobFilter, "all">[];
  keywords: string[];
  batchSupported: boolean;
  privacy: "Runs in your browser";
}

/**
 * Every tool here genuinely exists in GainUtility and runs client-side.
 */
export const IMAGE_HUB_TOOLS: ImageToolItem[] = [
  // --- Compress & Optimize ---
  {
    id: "image-converter",
    name: "Image Compressor & Converter",
    desktopDesc: "Reduce JPG, PNG, WebP or HEIC file size with custom quality control and batch conversion.",
    mobileDesc: "Reduce image file size with quality control.",
    jobs: ["compress", "convert"],
    keywords: ["compress", "compressor", "convert", "converter", "jpg", "png", "webp", "heic", "tiff", "bmp", "shrink", "quality"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "exam-photo-fixer",
    name: "Compress Image to Target Size",
    desktopDesc: "Reduce image file size to exact limits (20 KB, 50 KB, 100 KB, 200 KB) for application uploads.",
    mobileDesc: "Reduce image to exact KB limits for forms.",
    jobs: ["compress", "resize"],
    keywords: ["target size", "kb", "compress to size", "200kb", "100kb", "50kb", "application photo", "exam photo"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "webp-converter",
    name: "WebP Converter",
    desktopDesc: "Convert photos to modern WebP for smaller web file sizes, or convert WebP back to JPG and PNG.",
    mobileDesc: "Convert images to WebP or back to JPG and PNG.",
    jobs: ["compress", "convert"],
    keywords: ["webp", "webp to jpg", "webp to png", "jpg to webp", "png to webp", "modern format"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },

  // --- Resize & Crop ---
  {
    id: "image-resizer",
    name: "Image Resizer",
    desktopDesc: "Scale image dimensions by exact pixels or percentage with aspect ratio lock and batch support.",
    mobileDesc: "Scale photo dimensions by pixels or percentage.",
    jobs: ["resize", "compress"],
    keywords: ["resize", "dimensions", "scale", "width", "height", "pixels", "batch resize"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    desktopDesc: "Crop and rotate photos using 1:1, 16:9, 4:3, and freeform aspect ratio overlays.",
    mobileDesc: "Crop and rotate photos to standard aspect ratios.",
    jobs: ["resize"],
    keywords: ["crop", "rotate", "trim", "aspect ratio", "square crop", "16:9", "framing"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "social-resizer",
    name: "Social Media Image Resizer",
    desktopDesc: "Resize and crop visuals for Instagram, YouTube, LinkedIn, X, and Facebook in one click.",
    mobileDesc: "Resize images for Instagram, YouTube, and LinkedIn.",
    jobs: ["resize"],
    keywords: ["social media", "instagram", "youtube thumbnail", "linkedin header", "twitter", "facebook"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "passport-photo-maker",
    name: "Passport / ID Photo Resizer",
    desktopDesc: "Prepare official passport and ID photos matching country dimension and background specifications.",
    mobileDesc: "Format photos to passport and ID requirements.",
    jobs: ["resize"],
    keywords: ["passport photo", "id photo", "visa photo", "2x2", "35x45", "official photo"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },

  // --- Convert ---
  {
    id: "png-jpg-converter",
    name: "PNG & JPG Converter",
    desktopDesc: "Switch between transparent PNG and compressed JPG without opening a desktop editor.",
    mobileDesc: "Convert PNG to JPG or JPG to PNG instantly.",
    jobs: ["convert"],
    keywords: ["png to jpg", "jpg to png", "jpeg", "transparency", "convert photo"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "heic-jpg-converter",
    name: "HEIC to JPG Converter",
    desktopDesc: "Convert Apple iPhone HEIC photos into universal JPG images that open on any operating system.",
    mobileDesc: "Convert iPhone HEIC photos to compatible JPG files.",
    jobs: ["convert"],
    keywords: ["heic", "heif", "apple", "iphone photo", "heic to jpg", "heic to png"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "svg-converter",
    name: "SVG Converter",
    desktopDesc: "Render vector SVG graphics into high-resolution PNG or WebP bitmap files at any scale.",
    mobileDesc: "Render vector SVG files to high-res PNG or WebP.",
    jobs: ["convert"],
    keywords: ["svg", "svg to png", "vector", "rasterize", "svg export"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "jpg-to-pdf",
    name: "Image to PDF",
    desktopDesc: "Combine multiple photos into a single PDF document with custom margins and orientation.",
    mobileDesc: "Combine photos into a clean PDF document.",
    jobs: ["convert"],
    keywords: ["jpg to pdf", "image to pdf", "photo to pdf", "png to pdf", "make pdf"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    desktopDesc: "Extract pages from PDF documents as separate high-resolution JPG image files.",
    mobileDesc: "Save PDF pages as separate JPG image files.",
    jobs: ["convert"],
    keywords: ["pdf to jpg", "pdf to image", "pdf to png", "extract pages as photos"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },

  // --- Edit ---
  {
    id: "background-remover",
    name: "Background Remover",
    desktopDesc: "Isolate foreground subjects and create transparent cutouts locally in your browser using AI.",
    mobileDesc: "Remove backgrounds to make transparent cutouts.",
    jobs: ["edit"],
    keywords: ["background remover", "remove bg", "transparent background", "cutout", "isolate subject"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "image-blur-pixelate",
    name: "Image Blur & Pixelate",
    desktopDesc: "Censor faces, license plates, addresses, and sensitive details before sharing photos online.",
    mobileDesc: "Blur or pixelate sensitive information in photos.",
    jobs: ["edit"],
    keywords: ["blur", "pixelate", "censor", "hide face", "redact photo", "license plate"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "image-watermark",
    name: "Image Watermark",
    desktopDesc: "Stamp custom text or logo watermarks across single photos or batches with opacity control.",
    mobileDesc: "Add text or logo watermarks to protect photos.",
    jobs: ["edit"],
    keywords: ["watermark", "stamp logo", "copyright photo", "batch watermark"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "image-metadata-remover",
    name: "Remove Image Metadata",
    desktopDesc: "Strip camera EXIF, device info, and GPS location coordinates from photos to safeguard privacy.",
    mobileDesc: "Strip camera EXIF and GPS location data.",
    jobs: ["edit", "compress"],
    keywords: ["exif", "metadata", "gps", "camera data", "strip exif", "photo privacy"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "signature-maker",
    name: "Signature Maker",
    desktopDesc: "Draw or type an electronic signature and download it as a transparent PNG for documents.",
    mobileDesc: "Draw or type a signature as transparent PNG.",
    jobs: ["edit"],
    keywords: ["signature", "draw signature", "transparent signature", "digital sign"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "collage-maker",
    name: "Image Collage Maker",
    desktopDesc: "Arrange multiple photos into clean grid collages with customizable borders and spacing.",
    mobileDesc: "Combine photos into styled grid collages.",
    jobs: ["edit"],
    keywords: ["collage", "photo grid", "combine photos", "side by side", "mosaic"],
    batchSupported: true,
    privacy: "Runs in your browser",
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    desktopDesc: "Generate standard .ico files, Apple touch icons, and web manifest assets from any image.",
    mobileDesc: "Create standard favicon packs from any image.",
    jobs: ["edit"],
    keywords: ["favicon", "ico", "apple touch icon", "website icon", "pwa icon"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "logo-maker",
    name: "Logo Maker",
    desktopDesc: "Design clean typographic logos and badges, then export high-resolution transparent PNG and SVG.",
    mobileDesc: "Create logos and export transparent PNGs.",
    jobs: ["edit"],
    keywords: ["logo", "brand mark", "icon maker", "transparent logo"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "image-to-palette",
    name: "Image to Palette",
    desktopDesc: "Extract dominant color palettes from any photograph with copyable HEX and RGB values.",
    mobileDesc: "Extract dominant color palettes from any photo.",
    jobs: ["edit"],
    keywords: ["palette", "color extraction", "colors from photo", "hex codes", "dominant colors"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "exam-signature-fixer",
    name: "Signature Photo Resizer",
    desktopDesc: "Clean up contrast and resize photo scans of handwritten signatures to match form limits.",
    mobileDesc: "Resize signature scans to match form requirements.",
    jobs: ["resize", "compress"],
    keywords: ["signature resize", "signature scanner", "clean signature"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
  {
    id: "exam-thumb-fixer",
    name: "Thumb Impression Resizer",
    desktopDesc: "Crop, invert contrast, and compress thumb impression scans to strict application limits.",
    mobileDesc: "Resize and clean thumb impression scans for uploads.",
    jobs: ["resize", "compress"],
    keywords: ["thumb impression", "fingerprint photo", "biometric scan"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },

  // --- Improve ---
  {
    id: "image-upscaler",
    name: "Image Upscaler",
    desktopDesc: "Enlarge images 2x or 4x with client-side edge smoothing and noise reduction.",
    mobileDesc: "Enlarge images 2x or 4x with edge smoothing.",
    jobs: ["improve", "resize"],
    keywords: ["upscale", "enlarge", "super resolution", "sharpen", "denoise", "higher resolution"],
    batchSupported: false,
    privacy: "Runs in your browser",
  },
];
