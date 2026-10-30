/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for the Exam & Application tools. These are factual and modest:
 * they describe what each tool does, who it is for, supported inputs, and the
 * honest limitation that final acceptance is decided by each application portal.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";
import { EXAMS } from "../exams/requirements";

const LOCAL =
  "Everything is processed locally in your browser. Your photo, signature and documents are never uploaded to a server.";

const ACCEPTANCE =
  "These files match the technical requirements recorded from the selected official source. Final acceptance is determined by the application portal, so confirm the current official instructions before submitting.";

export const EXAM_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "application-file-checker": {
    title: "Application File Checker — Check, Fix & Download Exam Files",
    description:
      "Check your exam photo, signature and thumb impression against the recorded requirements, fix what's wrong, and download them ready to upload — all locally.",
    intro:
      "Most application rejections come down to a single file being over the size limit or the wrong dimensions. Work through the checklist for your exam, upload each file, and we check it against the recorded requirement and fix it automatically.",
    whatText:
      "Presents the full document checklist for your selected exam. For each file you upload (photo, signature, thumb impression), it compares the real file size, dimensions and format against the recorded requirement, applies an automatic fix, and lets you download every fixed file as a ZIP.",
    whyText:
      "Prepares files before you open the portal, reducing the chance of a rejected upload and the frustration of fixing files under a deadline.",
    features: [
      "Full per-exam document checklist",
      "Per-file validation against the recorded requirement",
      "One-click automatic fix for size, dimensions and format",
      "Download all fixed files as a single ZIP",
      "Every result is processed locally — nothing is uploaded"
    ],
    steps: [
      "Choose your exam or application.",
      "Upload each document on the checklist.",
      "Review what needs fixing and apply the automatic fix.",
      "Download the fixed files as a ZIP."
    ],
    faqs: [
      {
        question: "Which files does the checker cover?",
        answer:
          "It covers the documents your selected exam records: typically a photo, signature and thumb impression. Any document type with a recorded requirement appears on the checklist."
      },
      {
        question: "Are my application files uploaded anywhere?",
        answer: "No. " + LOCAL
      },
      {
        question: "Will my files definitely be accepted?",
        answer: ACCEPTANCE
      },
      {
        question: "My exam isn't listed — can I still use this?",
        answer:
          "Yes — use the Custom option inside a fixer to enter your own size, dimensions and format, then confirm those values against your own official instructions."
      }
    ],
    related: ["exam-photo-fixer", "exam-signature-fixer", "exam-thumb-fixer", "exam-file-requirements"],
    privacyExplanation: LOCAL
  },
  "exam-photo-fixer": {
    title: "Exam Photo Resizer — Resize Photo to Exact KB & Dimensions",
    description:
      "Resize your exam photo to the exact KB and pixel dimensions your application requires. Automatic resize, crop and compression — processed locally.",
    intro:
      "Portals reject photos that are too large, too small, or the wrong pixel size. Pick your exam, upload your photo, and we resize, crop and compress it to the recorded requirement.",
    whatText:
      "Loads an exam preset and its recorded photo requirement, then resizes, optionally cleans the background, and iteratively compresses the photo to the largest file that still fits the size limit while keeping the best quality. Produces a ready-to-upload file.",
    whyText:
      "You don't need to remember pixel counts or learn compression settings — the tool targets the requirement for you and flags any unverified requirement clearly.",
    features: [
      "Exam presets with recorded requirements",
      "Custom requirements for any portal",
      "Iterative compression — largest file that fits, not worst quality",
      "Optional background cleanup",
      "Live before / after preview",
      "100% local processing"
    ],
    steps: [
      "Choose your exam or enter custom requirements.",
      "Upload your photo (JPG, PNG or WebP).",
      "Let the tool resize and compress it automatically.",
      "Check the preview and download."
    ],
    limitations: [
      "Requirements change each year — always confirm against the current official instructions.",
      "A poor-quality source photo cannot be fully repaired."
    ],
    faqs: [
      {
        question: "How do I reduce my exam photo to the right KB?",
        answer:
          "Upload it, choose the preset (or enter your sizes), and the tool iteratively compresses it to fit the recorded limit while keeping the best quality."
      },
      {
        question: "Is my photo uploaded to a server?",
        answer: "No. " + LOCAL
      },
      {
        question: "What photo formats are accepted?",
        answer: "JPG, JPEG, PNG and WebP can be loaded; the output format matches what your selected preset allows (usually JPG)."
      }
    ],
    related: ["application-file-checker", "exam-signature-fixer", "passport-photo-maker", "image-resizer"],
    privacyExplanation: LOCAL
  },
  "exam-signature-fixer": {
    title: "Exam Signature Resizer — Clean, Resize & Compress",
    description:
      "Clean the background, remove excess whitespace, sharpen and size your handwritten signature to the exact requirement — without making it unreadable.",
    intro:
      "A faint or oversized signature gets an application rejected. Upload your signature and we crop it tight, clean the background, sharpen the strokes and compress it to the required size.",
    whatText:
      "Detects the ink, crops excess whitespace, flattens the background to white, adjusts contrast and brightness, then resizes and iteratively compresses. Warns when the signature is faint so thin strokes aren't silently destroyed.",
    whyText:
      "Signatures must stay readable — the tool protects faint strokes rather than over-compressing them, and lets you tune contrast manually with a live preview.",
    features: [
      "Auto-crop of excess whitespace",
      "Background cleanup to white",
      "Manual contrast and brightness controls",
      "Faint-signature warning",
      "Iterative compression to the recorded size",
      "Local processing only"
    ],
    steps: [
      "Choose your exam preset or use the photo tool's custom option.",
      "Upload a clear photo of your signature in black ink.",
      "Adjust contrast if needed and apply the fix.",
      "Review the preview and download."
    ],
    limitations: [
      "Very faint signatures may not reproduce cleanly even after enhancement.",
      "Signature size limits vary by portal — confirm yours."
    ],
    faqs: [
      {
        question: "My signature is faint — will it be lost?",
        answer:
          "The tool warns you if the signature is faint and lets you raise contrast manually, so thin strokes are generally preserved rather than accidentally erased."
      },
      {
        question: "Does background cleanup crop my signature?",
        answer:
          "No — cleanup flattens the background to white; a separate crop step trims only empty whitespace around the ink."
      },
      {
        question: "Is this processed on my device?",
        answer: "Yes. " + LOCAL
      }
    ],
    related: ["exam-photo-fixer", "application-file-checker", "signature-maker", "exam-thumb-fixer"],
    privacyExplanation: LOCAL
  },
  "exam-thumb-fixer": {
    title: "Thumb Impression Resizer — Clean & Compress Thumb Impression",
    description:
      "Clean the background, sharpen the ridges and compress your thumb impression scan to the exact size your application requires.",
    intro:
      "Fingerprint scans are easy to get wrong — too dark, too faint, or too large a file. Upload your thumb impression and we clean it, sharpen it and size it correctly.",
    whatText:
      "Crops whitespace, removes background noise, sharpens ridge contrast and iteratively compresses the scan to the recorded requirement. Flags low-quality scans so you can retry with better ink pressure.",
    whyText:
      "A clear, correctly sized thumb print uploads first time, avoiding a rejected application that forces a fresh scan.",
    features: [
      "Auto-crop and background cleanup",
      "Ridge contrast sharpening",
      "Low-quality scan warning",
      "Iterative compression to the recorded size",
      "Local processing only"
    ],
    steps: [
      "Choose your exam preset.",
      "Upload a clear scan of your thumb impression on white paper.",
      "Apply the fix automatically.",
      "Download the sized file."
    ],
    limitations: [
      "A dark, smudged or faint impression can't be fully corrected — a clean scan works best.",
      "Confirm your portal's thumb size limit."
    ],
    faqs: [
      {
        question: "Why does my thumb impression need fixing?",
        answer:
          "Scans are often too large in file size for upload, or have a grey background and weak ridges that portals reject or process poorly."
      },
      {
        question: "Is my thumb impression uploaded?",
        answer: "No. " + LOCAL
      },
      {
        question: "What does 'low-quality scan' mean?",
        answer:
          "The tool detects weak ridge detail and suggests using a scan with stronger, even ink pressure for a reliable impression."
      }
    ],
    related: ["application-file-checker", "exam-photo-fixer", "exam-file-requirements", "image-upscaler"],
    privacyExplanation: LOCAL
  },
  "declaration-fixer": {
    title: "Declaration Photo Compressor — Prepare Your Declaration",
    description:
      "Compress your handwritten declaration photo to fit your application's file size limit — while keeping it readable.",
    intro:
      "Application portals often limit the size of a scanned declaration. Upload your declaration photo, set your portal's size limit, and we compress it to fit without making it unreadable.",
    whatText:
      "Loads a declaration image, keeps a sensible maximum resolution, and iteratively compresses it to the largest file that fits your target KB. Because declaration limits are set per portal, you enter your own target here.",
    whyText:
      "Handwritten declarations are hard to read at very low quality; the tool finds the best compression that still fits your portal's limit.",
    features: [
      "Custom size-limit input for any portal",
      "Readability-preserving compression",
      "JPG or PNG output",
      "Live before / after preview",
      "Local processing only"
    ],
    steps: [
      "Enter your portal's max size in KB.",
      "Upload a clear photo or scan of your declaration.",
      "Apply the fix.",
      "Download the sized declaration."
    ],
    limitations: [
      "Declaration size limits are set by each portal — enter your own and confirm it.",
      "For a PDF declaration, use the PDF Size Reducer for Applications tool instead."
    ],
    faqs: [
      {
        question: "What size should my declaration be?",
        answer:
          "It depends on your portal's instructions — enter that limit here. There is no single universal figure, and we don't invent one."
      },
      {
        question: "I uploaded a PDF — will this work?",
        answer:
          "This tool compresses an image-based declaration. For a PDF, use the PDF Size Reducer for Applications tool."
      },
      {
        question: "Is my declaration uploaded anywhere?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["pdf-exact-size", "exam-photo-fixer", "application-file-checker", "image-resizer"],
    privacyExplanation: LOCAL
  },
  "pdf-exact-size": {
    title: "PDF Size Reducer — Fit Any Application Limit",
    description:
      "Reduce a PDF so it fits your application's maximum file size. Structural cleanup and image re-encoding, all in your browser.",
    intro:
      "Many portals reject PDFs over a size limit. Enter your limit, upload your PDF, and we compress it to fit — without ever shipping a file bigger than the original.",
    whatText:
      "First tries a lossless-style structural cleanup (rewriting the document with tighter object streams). If that isn't small enough, it re-encodes pages at progressively lower JPEG quality to find the largest result that fits your limit. It never returns a larger file than you started with.",
    whyText:
      "Application PDFs — scanned certificates, mark sheets, declarations — are often several MB when the portal allows only a few hundred KB. This targets your exact limit while keeping quality as high as possible.",
    features: [
      "Target any max KB from your portal",
      "Structural cleanup first, then image re-encoding",
      "Keeps best quality that fits",
      "Never ships a file bigger than the original",
      "Entirely local processing"
    ],
    steps: [
      "Enter your portal's max PDF size in KB.",
      "Upload your PDF.",
      "Reduce it automatically.",
      "Download the fitted PDF."
    ],
    limitations: [
      "Encrypted or password-protected PDFs may not reduce until unlocked.",
      "Heavily text-based PDFs re-encode as images, which trades off selectable text for size — use structural cleanup first when possible.",
      "A very small target may not be reachable even at low quality."
    ],
    faqs: [
      {
        question: "What's the difference from a normal PDF compressor?",
        answer:
          "This tool targets your exact size limit and only returns a file if it is genuinely smaller — it won't replace your PDF with a worse, bigger version."
      },
      {
        question: "Will re-encoding make my text unreadable?",
        answer:
          "It re-encodes pages as JPEGs, so choose the highest quality that fits and always verify readability after download."
      },
      {
        question: "Is my PDF uploaded to a server?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["declaration-fixer", "compress-images-inside-pdf", "optimize-pdf-web", "application-file-checker"],
    privacyExplanation: LOCAL
  },
  "exam-file-requirements": {
    title: "Exam File Requirements – Photo, Signature & Thumb Size",
    description:
      "Check exam photo, signature and thumb impression requirements, then prepare and download application files to the correct size, dimensions and format.",
    intro:
      "A plain-language reference of the recorded file requirements — size, dimensions, format — for each covered exam, each tied to an official source and clearly marked as verified or needing review.",
    whatText:
      "Documents each exam's recorded photo, signature and thumb impression requirements, the official source they came from, and the verification status. It never presents unverified figures as fact and always tells you to confirm against the current official instructions.",
    whyText:
      "Portal requirements change every year and differ by exam. A single, honest reference beats searching forum posts for outdated numbers.",
    features: [
      "Recorded requirements tied to official sources",
      "Clear verified / needs-review / outdated status",
      "Plain-language technical values",
      "Links to the matching fixer tools"
    ],
    steps: [
      "Choose the exam or application you want to check.",
      "Read the recorded photo, signature, and thumb impression requirements, each tied to an official source with a verification status.",
      "Confirm anything marked unverified or outdated against the current official notification for your cycle.",
      "Open the listed fixer tool to prepare each file to the exact required values."
    ],
    limitations: [
      "Requirements change yearly — always confirm against the current official instructions for your application.",
      "Only exams with recorded entries are listed.",
      "This is an independent utility, not affiliated with any exam body."
    ],
    faqs: [
      {
        question: "Are these requirements official?",
        answer:
          "Each is tied to an official notification or guideline and flagged with a verification status. Anything unverified is clearly marked — we never present unverified data as fact."
      },
      {
        question: "Why do the values change?",
        answer:
          "Size and dimension requirements are set again each year by exam bodies and differ by portal, so always confirm against the current official instructions."
      },
      {
        question: "How many exams are covered?",
        answer:
          "" + EXAMS.length + " exams are currently recorded here, each with its own requirements page content. Portals not listed can be handled with custom requirements."
      }
    ],
    related: ["application-file-checker", "exam-photo-fixer", "pdf-exact-size"],
    privacyExplanation: LOCAL
  }
};
