/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shape of a localized page-body overlay for a single tool.
 *
 * Every field mirrors a field rendered by src/components/Layout.tsx (or
 * src/data.ts's seoEntryToMetadata), so an overlay entry is a full
 * translation of that tool's visible page body for one locale:
 *   - desc           → currentInfo.desc card under the H1
 *   - whatText/whyText/features → "About this tool" section
 *   - steps          → "How to use" ordered list
 *   - examples       → Examples accordion (omit if the EN entry has none)
 *   - mistakes       → Troubleshooting accordion
 *   - privacyExplanation → privacy block (replaces the EN fallback string)
 *   - limitations    → Privacy & limitations list (omit if EN has none)
 *   - faqs           → visible FAQ accordion AND FAQPage JSON-LD
 *
 * Content rules (same as EXTRA_FAQS / priority SEO records):
 *   - genuine translations of the English source, no machine filler
 *   - only verified behavior described in this codebase; no invented stats
 *   - example `code` values stay literal (never translated)
 *   - FAQ count must equal the boosted English count for that tool
 */

export interface ToolBodyOverlay {
  desc: string;
  whatText: string;
  whyText: string;
  features: string[];
  steps: string[];
  examples?: { title: string; desc: string; code: string }[];
  mistakes: string[];
  privacyExplanation: string;
  limitations?: string[];
  faqs: { question: string; answer: string }[];
}
