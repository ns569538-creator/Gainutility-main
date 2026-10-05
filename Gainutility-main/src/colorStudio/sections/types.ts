/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ViewState } from "../../types";

export interface SectionProps {
  onChangeView: (view: ViewState) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onCopy: (text: string) => void;
}