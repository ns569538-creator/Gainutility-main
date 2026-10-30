/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Side-effect barrel for every per-tool UI dictionary.
 *
 * Importing this module registers all tool dicts in `TOOL_UI` at module load.
 * `isLocalizedView` (src/i18n/pages.ts) needs that coverage to decide whether a
 * tool page is genuinely localized for a locale, and tool components are
 * `React.lazy` — so without this barrel the gate would depend on whether a
 * chunk happened to load yet, and the sitemap bundle (which never imports
 * components) would see an empty registry.
 *
 * Each module also stays importable on its own from its component, so lazy
 * chunks keep working unchanged.
 */

import "./base64Tool";
import "./boxShadowGenerator";
import "./contrastChecker";
import "./imageConverter";
import "./jsonBeautifier";
import "./mergePdf";
import "./passwordGenerator";
import "./slugGenerator";
import "./splitPdf";
import "./youtubeKeywordExplorer";
import "./youtubeThumbnailPreview";
