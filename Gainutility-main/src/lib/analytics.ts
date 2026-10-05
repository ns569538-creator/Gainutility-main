/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Privacy-safe tool interaction events.
 *
 * Emits a `gu:tool-event` CustomEvent on `document` so the app (or a future
 * analytics layer) can observe tool usage without this helper ever making a
 * network request or writing to storage. Event detail contains the tool id,
 * event name and mode — never user input, CSS content or share tokens.
 */

export type ShadowStudioEvent =
  | "shadow_type_selected"
  | "preset_selected"
  | "layer_added"
  | "layer_deleted"
  | "layer_duplicated"
  | "layer_reordered"
  | "randomized"
  | "import_used"
  | "import_failed"
  | "copy_css"
  | "copy_variable"
  | "copy_tailwind"
  | "copy_value"
  | "share_created"
  | "download_used"
  | "example_loaded"
  | "recipe_loaded"
  | "docs_mode_switched";

export interface ToolEventDetail {
  tool: string;
  event: ShadowStudioEvent | string;
  mode?: string;
}

export const trackToolEvent = (
  tool: string,
  event: ShadowStudioEvent | string,
  mode?: string
): void => {
  if (typeof document === "undefined") return;
  try {
    const detail: ToolEventDetail = { tool, event, ...(mode ? { mode } : {}) };
    document.dispatchEvent(new CustomEvent("gu:tool-event", { detail }));
  } catch {
    /* analytics must never break the tool */
  }
};
