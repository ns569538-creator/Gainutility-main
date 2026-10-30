/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Core domain types for the Application File Checker & Fixer.
 * These mirror the "source of truth" requirement model described in the product
 * spec: every requirement is tied to an official source and a verification
 * date, and can be flagged as verified / needs-review / outdated.
 */

/** What kind of document a requirement describes. */
export type DocumentType =
  | "photo"
  | "signature"
  | "thumb"
  | "declaration"
  | "certificate"
  | "document"
  | "pdf";

/** Level of confidence behind a requirement rule. */
export type RequirementStatus = "verified" | "needs_review" | "outdated";

/** A single technical rule inside a document requirement. */
export interface RequirementRule {
  /** Machine key, e.g. "max_kb", "width_px". */
  key: string;
  /** Plain-language human label, e.g. "Maximum file size". */
  label: string;
  /** The value the user sees, e.g. "50 KB". */
  display: string;
  /** Status of this specific rule. Defaults to the document status. */
  status?: RequirementStatus;
  /** True when this is a quality suggestion rather than an official requirement. */
  suggestion?: boolean;
}

/** One document type for one exam/year. */
export interface DocumentRequirement {
  document: DocumentType;
  /** Please use arrays for formats: ["JPG", "JPEG", "PNG"]. */
  formats: string[];
  minKb?: number;
  maxKb?: number;
  widthPx?: number;
  heightPx?: number;
  widthCm?: number;
  heightCm?: number;
  dpi?: number;
  aspectRatio?: string;
  /** Simple human text for background / colour notes, e.g. "White background". */
  background?: string;
  colorRequirement?: string;
  specialInstructions?: string[];
  status: RequirementStatus;
  /** Plain-language additional notes for the user. */
  notes?: string[];
}

/** A full exam / application entry in the requirement database. */
export interface ExamPreset {
  id: string;
  examName: string;
  authority: string;
  year: number;
  country: string;
  /** Short plain description shown in the selector. */
  tagline: string;
  /** Official source attributes, kept truthful and minimal. */
  officialSource: string;
  sourceTitle: string;
  sourceDate: string;
  lastVerified: string;
  requirements: DocumentRequirement[];
  /** SEO data used by landing/exam pages. */
  slug?: string;
  seo?: {
    title: string;
    description: string;
    intro: string;
    faqs: { question: string; answer: string }[];
  };
}

/** Result of validation for one uploaded file. */
export type CheckStatus = "idle" | "checking" | "ready" | "needs_fixing" | "fixed" | "error";

export interface ValidationIssue {
  level: "official" | "suggestion";
  /** Short machine key, e.g. "max_kb". */
  code: string;
  /** Plain-language explanation, e.g. "Your signature is 42 KB, but this application allows 10-20 KB." */
  message: string;
  /** Optional plain-language hint for automatic fixing. */
  fix?: string;
  /**
   * The property/rule this refers to so an automated fixer can act on it.
   * e.g. { type: "size" } or { type: "dimensions" } or { type: "format" }.
   */
  fixType?: "size" | "dimensions" | "format" | "background" | "contrast" | "crop";
}

export interface ValidationResult {
  status: CheckStatus;
  issues: ValidationIssue[];
}

export interface ExamFileItem {
  id: string;
  document: DocumentType;
  fileName: string;
  /** Original byte size. */
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  originalFormat?: string;
  originalDataUrl?: string;
  /** Processed output. */
  processedDataUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  processedFormat?: string;
  validation: ValidationResult;
}

export const EXAM_DISCLAIMER =
  "This is an independent utility and is not affiliated with or endorsed by any government organization, examination authority, university or recruitment board.";

export const EXAM_ACCEPTANCE_NOTE =
  "These files match the technical requirements recorded from the selected official source. Final acceptance is determined by the application portal, which you should verify before final submission.";
