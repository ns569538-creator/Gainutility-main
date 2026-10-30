/**
 * RSS data bridge for generate-sitemap.mjs.
 * Bundled via esbuild so the feed is generated from the REAL blog registry
 * (src/blog/blogData.ts) rather than a hand-kept copy.
 */
import { BLOG_ARTICLES } from "../src/blog/blogData";

export const buildRssData = () =>
  BLOG_ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    date: a.date,
    category: a.category,
    author: a.author,
  }));