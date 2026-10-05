/**
 * Sitemap lastmod bridge for scripts/generate-sitemap.mjs.
 * Bundled via esbuild so every <lastmod> comes from a REAL documented date —
 * per-tool git history (src/changelogData.ts) or the article publish date
 * (src/blog/blogData.ts) — never from the build date. Paths without a real
 * date get no <lastmod> at all, which keeps search-engine "last changed"
 * signals honest instead of bumping every URL on every rebuild.
 */
import { toolLastUpdated } from "../src/changelogData";
import { BLOG_ARTICLES } from "../src/blog/blogData";

const lastmodByTool = new Map<string, string | undefined>();
const lastmodByBlog = new Map<string, string>();

for (const a of BLOG_ARTICLES) lastmodByBlog.set(a.slug, a.date);

const resolveTool = (id: string): string | undefined => {
  if (!lastmodByTool.has(id)) {
    lastmodByTool.set(id, toolLastUpdated(id)?.iso);
  }
  return lastmodByTool.get(id);
};

/**
 * Returns a real ISO last-changed date for a canonical English path, or
 * undefined when no genuine date is on record. Only tool and blog-article
 * pages have documented dates; everything else intentionally omits lastmod.
 */
export const getLastmod = (path: string): string | undefined => {
  const toolMatch = path.match(/^\/tools\/([\w-]+)$/);
  if (toolMatch) return resolveTool(toolMatch[1]);
  const blogMatch = path.match(/^\/blog\/([\w-]+)$/);
  if (blogMatch) return lastmodByBlog.get(blogMatch[1]);
  return undefined;
};