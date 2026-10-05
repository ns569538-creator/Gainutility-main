/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Honest clipboard helpers. Every copy action in the product must only report
 * success after the text has actually been written to the clipboard, so the
 * "Copied" confirmation is never a lie when the browser blocks the API.
 */

export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Write `text` to the clipboard, falling back to a legacy execCommand copy.
 * Returns `true` only when the write actually succeeded.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

/**
 * Copy `text` and report the outcome through `toast`. Success ("Copied") is
 * only announced when the copy actually succeeded; otherwise an actionable
 * error is shown instead of a false confirmation.
 */
export const copyWithToast = (
  text: string,
  toast: (msg: string, type: ToastType) => void,
  successMsg = "Copied!"
): void => {
  copyText(text).then((ok) => {
    if (ok) {
      toast(successMsg, "success");
    } else {
      toast(
        "Copy failed — your browser blocked clipboard access. Select the text and copy it manually.",
        "error"
      );
    }
  });
};