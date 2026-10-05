/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Accessibility checks that are honestly derivable from static HTML:
 * landmarks/headings, link and button names, form labels, iframe titles.
 * Contrast and full WCAG conformance are reported as NOT DETECTABLE —
 * this tool never claims compliance it cannot measure.
 */

import type { Finding, RawSignals } from "../types";

const visibleText = (el: Element): string =>
  (el.textContent ?? "").replace(/\s+/g, " ").trim();

const hasAccessibleName = (el: Element): boolean => {
  if (visibleText(el)) return true;
  if (el.getAttribute("aria-label")?.trim()) return true;
  if (el.getAttribute("aria-labelledby")?.trim()) return true;
  if (el.getAttribute("title")?.trim()) return true;
  const img = el.querySelector("img[alt]");
  if (img && (img.getAttribute("alt") ?? "").trim()) return true;
  const svgTitle = el.querySelector("svg > title");
  if (svgTitle && visibleText(svgTitle)) return true;
  return false;
};

export function runAccessibilityChecks(_raw: RawSignals, doc: Document): Finding[] {
  const out: Finding[] = [];

  // Landmarks / main
  const hasMain = doc.querySelector("main, [role='main']") !== null;
  if (hasMain) {
    out.push({
      id: "a11y-main-landmark",
      category: "accessibility",
      status: "PASS",
      title: "Main landmark present",
      what: "The page exposes a <main> (or role=\"main\") landmark.",
      why: "Landmarks let screen-reader users jump straight to the primary content.",
      how: "Keep exactly one main landmark per page.",
    });
  } else {
    out.push({
      id: "a11y-main-landmark",
      category: "accessibility",
      status: "WARNING",
      title: "No main landmark",
      what: "Neither <main> nor role=\"main\" was found.",
      why: "Without a main landmark, assistive-tech users must traverse the whole page to reach content.",
      how: "Wrap the primary content in a single <main> element.",
    });
  }

  // Heading order
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  if (headings.length === 0) {
    out.push({
      id: "a11y-headings",
      category: "accessibility",
      status: "WARNING",
      title: "No headings found",
      what: "The document contains no h1–h6 elements.",
      why: "Headings are the outline screen-reader users navigate by.",
      how: "Structure the page with a single H1 and nested H2–H3 sections.",
    });
  } else {
    let skips = 0;
    let prev = 0;
    const seen: string[] = [];
    for (const h of headings) {
      const level = Number(h.tagName.substring(1));
      if (prev && level > prev + 1) skips++;
      prev = level;
      seen.push(`${level}:${visibleText(h).slice(0, 40)}`);
    }
    if (skips > 0) {
      out.push({
        id: "a11y-headings",
        category: "accessibility",
        status: "WARNING",
        title: `Heading levels skip (${skips} jump${skips === 1 ? "" : "s"})`,
        what: `${headings.length} headings found, but ${skips} place(s) jump more than one level (e.g. H2 → H4).`,
        why: "Skipped levels break the document outline for screen-reader users.",
        how: "Progress one level at a time (H2 → H3); style visually with CSS instead of skipping.",
        evidence: seen.slice(0, 6).join(" | "),
      });
    } else {
      out.push({
        id: "a11y-headings",
        category: "accessibility",
        status: "PASS",
        title: `Heading structure is sequential (${headings.length} headings)`,
        what: "No level skips detected across h1–h6.",
        why: "A continuous heading tree gives assistive tech a reliable map of the page.",
        how: "Maintain one H1 and logical nesting as content changes.",
        evidence: seen.slice(0, 5).join(" | "),
      });
    }
  }

  // Links without accessible names
  const links = Array.from(doc.querySelectorAll("a[href]"));
  const namelessLinks = links.filter((a) => !hasAccessibleName(a));
  if (links.length > 0) {
    if (namelessLinks.length > 0) {
      out.push({
        id: "a11y-links",
        category: "accessibility",
        status: "ERROR",
        title: `${namelessLinks.length} link${namelessLinks.length === 1 ? "" : "s"} without an accessible name`,
        what: `${namelessLinks.length} of ${links.length} links have no text, aria-label, title or alt.`,
        why: "Screen readers announce link names; nameless links read only the URL (or nothing).",
        how: "Add visible text or aria-label describing the destination (e.g. aria-label=\"Open pricing\").",
        evidence: namelessLinks.slice(0, 4).map((a) => a.getAttribute("href") ?? "(no href)").join(" | "),
      });
    } else {
      out.push({
        id: "a11y-links",
        category: "accessibility",
        status: "PASS",
        title: `All ${links.length} links have accessible names`,
        what: "Every anchor exposes text or an ARIA label.",
        why: "Named links are navigable by screen-reader link lists.",
        how: "Avoid bare-icon links without aria-label in future edits.",
        evidence: `${links.length} links checked`,
      });
    }
  }

  // Buttons without accessible names
  const buttons = Array.from(doc.querySelectorAll("button, [role='button']"));
  const namelessButtons = buttons.filter((b) => !hasAccessibleName(b));
  if (buttons.length > 0 && namelessButtons.length > 0) {
    out.push({
      id: "a11y-buttons",
      category: "accessibility",
      status: "ERROR",
      title: `${namelessButtons.length} button${namelessButtons.length === 1 ? "" : "s"} without an accessible name`,
      what: `${namelessButtons.length} of ${buttons.length} buttons expose no text or aria-label.`,
      why: "Unnamed buttons are invisible to screen-reader users and to voice control.",
      how: "Add visible text or aria-label (e.g. aria-label=\"Close menu\") to each control.",
    });
  } else if (buttons.length > 0) {
    out.push({
      id: "a11y-buttons",
      category: "accessibility",
      status: "PASS",
      title: `All ${buttons.length} buttons have accessible names`,
      what: "Every button/role=button exposes a name.",
      why: "Named controls work with assistive tech and voice input.",
      how: "Keep icon-only buttons labelled when you add new UI.",
      evidence: `${buttons.length} buttons checked`,
    });
  }

  // Form labels
  const fields = Array.from(doc.querySelectorAll("input:not([type='hidden']), select, textarea"));
  const unlabeled = fields.filter((f) => {
    if (f.getAttribute("aria-label")?.trim()) return false;
    if (f.getAttribute("aria-labelledby")?.trim()) return false;
    if (f.getAttribute("title")?.trim()) return false;
    const id = f.getAttribute("id");
    if (id) {
      const lab = doc.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lab && visibleText(lab)) return false;
    }
    if (f.closest("label") && visibleText(f.closest("label")!)) return false;
    return true;
  });
  if (fields.length > 0 && unlabeled.length > 0) {
    out.push({
      id: "a11y-form-labels",
      category: "accessibility",
      status: "ERROR",
      title: `${unlabeled.length} form field${unlabeled.length === 1 ? "" : "s"} without a label`,
      what: `${unlabeled.length} of ${fields.length} inputs/selects/textareas have no associated <label>, aria-label or title.`,
      why: "Unlabeled fields are announced as \"edit text blank\" — users cannot tell what to type.",
      how: "Associate a <label for=\"…\"> with each field, or add aria-label describing the field.",
      evidence: unlabeled.slice(0, 4).map((f) => `${f.tagName.toLowerCase()}${f.getAttribute("name") ? `[name=${f.getAttribute("name")}]` : ""}`).join(" | "),
    });
  } else if (fields.length > 0) {
    out.push({
      id: "a11y-form-labels",
      category: "accessibility",
      status: "PASS",
      title: `All ${fields.length} form fields are labelled`,
      what: "Every input, select and textarea has a label association.",
      why: "Labels make forms usable with screen readers and autofill tools.",
      how: "Keep labels tied to field ids when refactoring forms.",
      evidence: `${fields.length} fields checked`,
    });
  }

  // iframe titles
  const iframes = Array.from(doc.querySelectorAll("iframe"));
  const untitled = iframes.filter((f) => !(f.getAttribute("title") ?? "").trim());
  if (iframes.length > 0 && untitled.length > 0) {
    out.push({
      id: "a11y-iframe-title",
      category: "accessibility",
      status: "WARNING",
      title: `${untitled.length} iframe${untitled.length === 1 ? "" : "s"} without a title`,
      what: `${untitled.length} of ${iframes.length} iframes lack a title attribute.`,
      why: "Screen readers announce iframe titles so users know what embedded content to expect.",
      how: "Add a descriptive title to every iframe (e.g. title=\"Map of office locations\").",
    });
  } else if (iframes.length > 0) {
    out.push({
      id: "a11y-iframe-title",
      category: "accessibility",
      status: "PASS",
      title: `All ${iframes.length} iframes titled`,
      what: "Every iframe exposes a title attribute.",
      why: "Titled embeds are announced clearly by assistive technology.",
      how: "Update titles when the embedded content changes.",
    });
  }

  // Contrast — NOT DETECTABLE (computed styles unavailable from static HTML)
  out.push({
    id: "a11y-contrast",
    category: "accessibility",
    status: "NOT DETECTABLE",
    title: "Colour contrast not measured",
    what: "This scan fetches raw HTML only — it does not render the page, so computed text/background colours are unavailable.",
    why: "WCAG contrast ratios (4.5:1 normal text, 3:1 large text) require rendered styles, not markup.",
    how: "Test key text/background pairs manually with the Contrast Checker, or run a rendered-page audit.",
    fixTool: "contrast-checker",
  });

  // Full WCAG — NOT DETECTABLE
  out.push({
    id: "a11y-wcag",
    category: "accessibility",
    status: "NOT DETECTABLE",
    title: "WCAG 2.1 conformance not verified",
    what: "Conformance requires keyboard, focus-order, reflow and cognitive testing across pages — far beyond a single static HTML fetch.",
    why: "Claiming \"WCAG compliant\" from markup alone would be dishonest; this tool reports only what it can observe.",
    how: "Treat the structural findings above as a partial checklist, then complete a full accessibility audit (automated + manual) before making any compliance claim.",
    fixTool: "contrast-checker",
  });

  return out;
}
