/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Central registry of all localized blog article variants.
 * Merged into BLOG_ARTICLES at runtime and prerender.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";
import { IMAGES_ARTICLES_LOCALIZED } from "./images";
import { PDF_ARTICLES_LOCALIZED } from "./pdf";
import { DESIGN_DEV_ARTICLES_LOCALIZED } from "./designDev";
import { DEV_SEO_ARTICLES_LOCALIZED } from "./devSeo";

export const ALL_LOCALIZED_ARTICLES: Record<
  string,
  Partial<Record<LocaleCode, LocalizedBlogArticle>>
> = {
  ...IMAGES_ARTICLES_LOCALIZED,
  ...PDF_ARTICLES_LOCALIZED,
  ...DESIGN_DEV_ARTICLES_LOCALIZED,
  ...DEV_SEO_ARTICLES_LOCALIZED,
};
