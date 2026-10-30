/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Validation engine: compares an uploaded / processed file against a document
 * requirement and produces plain-language issues and structured compliance checks.
 * Distinguishes official requirements from quality suggestions, and separates
 * "Target Requirements" from "Your Result" with strict PASS/FAIL evaluation.
 */

import {
  DocumentRequirement,
  ValidationIssue,
  ValidationResult,
  CheckStatus,
} from "./examTypes";

export interface FileFacts {
  size: number;
  width?: number;
  height?: number;
  format?: string;
  sharpness?: number;
  hasTransparency?: boolean;
}

export type FixKind = "size" | "dimensions" | "format" | "background" | "contrast" | "crop";

export interface FixPlan {
  kinds: FixKind[];
  /** True when the fix may seriously degrade visual quality. */
  risky: boolean;
  /** Optional suggestion shown when the target is very hard to hit. */
  warning?: string;
}

export interface RequirementCheck {
  id: "size" | "dimensions" | "format" | "aspectRatio";
  label: string;
  actual: string;
  required: string;
  passed: boolean;
  message?: string;
}

export interface DetailedValidation {
  status: "ready" | "not_ready";
  checks: RequirementCheck[];
  allPassed: boolean;
  issues: ValidationIssue[];
}

function approxFormat(f?: string): string | undefined {
  if (!f) return undefined;
  const f2 = f.split("/").pop()?.split(";")[0].toUpperCase().replace("JPG", "JPEG");
  return f2;
}

function sizeMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}
function sizeKB(bytes: number) {
  return (bytes / 1024).toFixed(1);
}

/**
 * Validate `facts` against `req`.
 * `facts.format` may be a full mime like "image/jpeg" or a short ext.
 */
export function validateFacts(req: DocumentRequirement, facts: FileFacts): ValidationResult {
  if (!facts || facts.size === undefined) {
    return { status: "error", issues: [] };
  }

  const issues: ValidationIssue[] = [];

  // ---- File size ----
  if (req.maxKb !== undefined) {
    const maxBytes = req.maxKb * 1024;
    if (facts.size > maxBytes) {
      if (facts.size >= 1024 * 1024) {
        issues.push({
          level: "official",
          code: "max_kb",
          message: `This file is ${sizeMB(facts.size)} MB, but this application allows up to ${req.maxKb} KB.`,
          fix: `Compress it to ${req.maxKb} KB or less.`,
          fixType: "size",
        });
      } else {
        issues.push({
          level: "official",
          code: "max_kb",
          message: `This file is ${sizeKB(facts.size)} KB, but this application allows up to ${req.maxKb} KB.`,
          fix: `Compress it to ${req.maxKb} KB or less.`,
          fixType: "size",
        });
      }
    }
  }
  if (req.minKb !== undefined) {
    const minBytes = req.minKb * 1024;
    if (facts.size < minBytes) {
      issues.push({
        level: "official",
        code: "min_kb",
        message: `This file is only ${sizeKB(facts.size)} KB, but this application requires at least ${req.minKb} KB.`,
        fix: `Increase its size to at least ${req.minKb} KB.`,
        fixType: "size",
      });
    }
  }

  // ---- Dimensions ----
  if (facts.width && facts.height) {
    if (req.widthPx && facts.width !== req.widthPx) {
      issues.push({
        level: "official",
        code: "width_px",
        message: `Your image is ${facts.width} px wide, but the required width is ${req.widthPx} px.`,
        fix: `Resize it to ${req.widthPx} × ${req.heightPx ?? "?"} px.`,
        fixType: "dimensions",
      });
    }
    if (req.heightPx && facts.height !== req.heightPx) {
      issues.push({
        level: "official",
        code: "height_px",
        message: `Your image is ${facts.height} px tall, but the required height is ${req.heightPx} px.`,
        fix: `Resize it to ${req.widthPx ?? "?"} × ${req.heightPx} px.`,
        fixType: "dimensions",
      });
    }
  }

  // ---- Format ----
  if (req.formats && req.formats.length > 0) {
    const current = approxFormat(facts.format);
    const allowed = req.formats.map((f) => {
      if (f.toUpperCase() === "JPG") return "JPEG";
      return f.toUpperCase();
    });
    if (current && !allowed.includes(current)) {
      issues.push({
        level: "official",
        code: "format",
        message: `${current} is not accepted by this preset. Required: ${req.formats.join("/")}.`,
        fix: `Convert it to ${req.formats.join("/")}.`,
        fixType: "format",
      });
    }
  }

  // ---- Quality suggestions (never mandatory) ----
  if (facts.sharpness !== undefined && facts.sharpness < 0.28) {
    issues.push({
      level: "suggestion",
      code: "blur",
      message: "The image appears blurry. A sharper photo is more likely to be accepted.",
      fixType: "contrast",
    });
  }
  if (facts.hasTransparency) {
    issues.push({
      level: "suggestion",
      code: "transparency",
      message: "This image has a transparent background. Most application portals expect a plain white background.",
      fixType: "background",
    });
  }

  return { status: issues.length === 0 ? "ready" : "needs_fixing", issues };
}

/**
 * Assesses compliance across all criteria (File Size, Dimensions, Format, Aspect Ratio)
 * and returns structured per-rule checks and an overall PASS/FAIL readiness status.
 */
export function assessCompliance(req: DocumentRequirement, facts: FileFacts): DetailedValidation {
  const validation = validateFacts(req, facts);
  const issues = validation.issues;
  const officialIssues = issues.filter((i) => i.level === "official");
  const checks: RequirementCheck[] = [];

  // 1. File Size
  const actualKb = (facts.size / 1024).toFixed(1);
  let sizeRequired = "";
  let sizePassed = true;
  if (req.maxKb !== undefined && req.minKb !== undefined) {
    sizeRequired = `${req.minKb}–${req.maxKb} KB`;
    const actualBytes = facts.size;
    if (actualBytes < req.minKb * 1024 || actualBytes > req.maxKb * 1024) {
      sizePassed = false;
    }
  } else if (req.maxKb !== undefined) {
    sizeRequired = `≤ ${req.maxKb} KB`;
    if (facts.size > req.maxKb * 1024) {
      sizePassed = false;
    }
  } else if (req.minKb !== undefined) {
    sizeRequired = `≥ ${req.minKb} KB`;
    if (facts.size < req.minKb * 1024) {
      sizePassed = false;
    }
  } else {
    sizeRequired = "Any size";
  }

  checks.push({
    id: "size",
    label: "File Size",
    actual: `${actualKb} KB`,
    required: sizeRequired,
    passed: sizePassed,
    message: !sizePassed
      ? Number(actualKb) < (req.minKb ?? 0)
        ? `Below required minimum (${actualKb} KB < ${req.minKb} KB)`
        : `Exceeds allowed maximum (${actualKb} KB > ${req.maxKb} KB)`
      : undefined,
  });

  // 2. Dimensions
  if (req.widthPx && req.heightPx) {
    const dimPassed = facts.width === req.widthPx && facts.height === req.heightPx;
    checks.push({
      id: "dimensions",
      label: "Dimensions",
      actual: facts.width && facts.height ? `${facts.width} × ${facts.height} px` : "Unknown",
      required: `${req.widthPx} × ${req.heightPx} px`,
      passed: Boolean(dimPassed),
    });
  } else if (req.widthPx || req.heightPx) {
    const wPass = !req.widthPx || facts.width === req.widthPx;
    const hPass = !req.heightPx || facts.height === req.heightPx;
    checks.push({
      id: "dimensions",
      label: "Dimensions",
      actual: `${facts.width ?? "?"} × ${facts.height ?? "?"} px`,
      required: `${req.widthPx ?? "auto"} × ${req.heightPx ?? "auto"} px`,
      passed: Boolean(wPass && hPass),
    });
  }

  // 3. Format
  const actualFormat = approxFormat(facts.format) || "JPEG";
  const reqFormats = req.formats && req.formats.length > 0 ? req.formats : ["JPG", "JPEG"];
  const normalizedAllowed = reqFormats.map((f) => (f.toUpperCase() === "JPG" ? "JPEG" : f.toUpperCase()));
  const formatPassed = normalizedAllowed.includes(actualFormat);

  checks.push({
    id: "format",
    label: "Format",
    actual: actualFormat === "JPEG" ? "JPG / JPEG" : actualFormat,
    required: reqFormats.join(" / "),
    passed: formatPassed,
  });

  // 4. Aspect Ratio
  if (req.widthPx && req.heightPx && facts.width && facts.height) {
    const reqRatio = (req.widthPx / req.heightPx).toFixed(3);
    const actualRatio = (facts.width / facts.height).toFixed(3);
    const ratioPassed = Math.abs(Number(reqRatio) - Number(actualRatio)) < 0.015;
    checks.push({
      id: "aspectRatio",
      label: "Aspect Ratio",
      actual: actualRatio,
      required: reqRatio,
      passed: ratioPassed,
    });
  }

  const allPassed = checks.every((c) => c.passed) && officialIssues.length === 0;

  return {
    status: allPassed ? "ready" : "not_ready",
    checks,
    allPassed,
    issues,
  };
}

/** Derive the automatic fix plan from issues. */
export function planFix(issues: ValidationIssue[]): FixPlan {
  const kinds = issues.map((i) => i.fixType).filter((k): k is FixKind => Boolean(k));
  const unique = Array.from(new Set(kinds));
  const risky = unique.length >= 2;
  return {
    kinds: unique,
    risky,
    warning: risky
      ? "This file needs several changes (size, dimensions and/or format). The result should still be clear, but please check the preview."
      : undefined,
  };
}

/** Human readable "status" from result. */
export function statusText(status: CheckStatus): string {
  switch (status) {
    case "idle":
      return "Not uploaded";
    case "checking":
      return "Checking…";
    case "ready":
      return "Ready to upload";
    case "needs_fixing":
      return "Needs fixing";
    case "fixed":
      return "Fixed";
    case "error":
      return "Could not process";
  }
}

/** Summarize a preset's size/dim target as a short string for the UI. */
export function targetSummary(req: DocumentRequirement): string {
  const bits: string[] = [];
  if (req.maxKb !== undefined) {
    bits.push(req.minKb !== undefined ? `${req.minKb}–${req.maxKb} KB` : `≤ ${req.maxKb} KB`);
  }
  if (req.widthPx && req.heightPx) {
    bits.push(`${req.widthPx} × ${req.heightPx} px`);
  }
  if (req.formats?.length) {
    bits.push(req.formats.join("/"));
  }
  return bits.join(" · ") || "Your requirements";
}
