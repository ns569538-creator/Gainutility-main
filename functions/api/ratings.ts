/**
 * Anonymous 1â€“5 rating API for the flagship Popular Tools.
 *
 * Endpoints:
 *   GET  /api/ratings?tool_slug=<slug> â†’ { tool_slug, count, average }
 *   POST /api/ratings                  â†’ { tool_slug, rating, count, average }
 *
 * Storage: the existing D1 `ratings` table via the `DB` binding, which is
 * configured to the `gainutility-db` database (dashboard binding in Cloudflare
 * Pages == wrangler d1_databases entry for local dev).
 *
 * Security: the allowlist below is the ONLY set of slugs that may receive
 * ratings â€” arbitrary tool_slug values are rejected server-side. Anonymous
 * submissions are expected; a lightweight in-memory rate limiter plus a
 * same-origin check keep obvious spam cheap to reject without any auth system.
 *
 * KEEP IN SYNC with src/ratingsConfig.ts (client render gate).
 */

const RATABLE_TOOL_SLUGS = new Set([
  "background-remover",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "qr-code-generator",
  "image-converter",
  "json-validator",
  "json-beautifier",
  "merge-pdf",
  "split-pdf",
]);

const SAFE_SLUG = /^[a-z0-9-]{1,64}$/;

/** Minimal Pages Function typing (no dependency on generated types). */
interface Env {
  DB?: D1Database;
}

interface FunctionContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

const json = (body: unknown, status = 200): Response => {
  const payload = JSON.stringify(body);
  return new Response(payload, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Ratings change often; never serve a stale aggregate.
      "cache-control": "no-store",
    },
  });
};

const isAllowedSlug = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 64 &&
  SAFE_SLUG.test(value) &&
  RATABLE_TOOL_SLUGS.has(value);

/**
 * Best-effort per-visitor rate limiting. Functions run in per-colo isolates,
 * so this is not a hard global quota â€” it stops single-visitor spam bursts,
 * which is the failure mode an anonymous rating form actually sees.
 */
const rateBuckets = new Map<string, number[]>();

function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket) {
    rateBuckets.set(key, [now]);
    return true;
  }
  const fresh = bucket.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    rateBuckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  rateBuckets.set(key, fresh);
  // Crude guard against unbounded growth.
  if (rateBuckets.size > 10_000) rateBuckets.clear();
  return true;
}

const clientIp = (request: Request): string =>
  request.headers.get("CF-Connecting-IP") ?? "unknown-ip";

async function aggregate(
  db: D1Database,
  toolSlug: string
): Promise<{ count: number; average: number }> {
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM ratings WHERE tool_slug = ?"
    )
    .bind(toolSlug)
    .first<{ count: number; average: number }>();
  return {
    count: Number(row?.count ?? 0),
    average: Number(row?.average ?? 0),
  };
}

export async function onRequestGet(context: FunctionContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const toolSlug = url.searchParams.get("tool_slug");

  if (!isAllowedSlug(toolSlug)) {
    return json({ error: "Invalid or unsupported tool slug." }, 400);
  }

  const db = env.DB;
  if (!db) {
    return json({ error: "Ratings are temporarily unavailable." }, 503);
  }

  try {
    const agg = await aggregate(db, toolSlug);
    return json({ tool_slug: toolSlug, count: agg.count, average: agg.average });
  } catch (error) {
    console.error("ratings:get:db-error", error);
    return json({ error: "Ratings are temporarily unavailable." }, 503);
  }
}

export async function onRequestPost(context: FunctionContext): Promise<Response> {
  const { request, env } = context;

  // Only accept same-origin submissions (this also rejects naive cross-site
  // form-posting). Same-origin fetches send an Origin header equal to this host
  // or none at all.
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      const requestOrigin = new URL(request.url).origin;
      if (origin !== requestOrigin) {
        return json({ error: "Cross-origin submissions are not allowed." }, 403);
      }
    } catch {
      /* unparseable origin â€” fall through to body validation */
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const body = (payload ?? {}) as { tool_slug?: unknown; rating?: unknown };
  const toolSlug = body?.tool_slug;
  const rating = body?.rating;

  if (!isAllowedSlug(toolSlug)) {
    // Distinguish "not eligible" (403) from "malformed request" (400).
    if (typeof toolSlug !== "string" || !SAFE_SLUG.test(toolSlug)) {
      return json({ error: "A valid tool_slug is required." }, 400);
    }
    return json({ error: "This tool does not accept ratings." }, 403);
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: "rating must be an integer between 1 and 5." }, 400);
  }

  const ip = clientIp(request);
  if (!allowRequest(`ratings:all:${ip}`, 30, 10 * 60 * 1000)) {
    return json({ error: "Too many submissions. Please try again later." }, 429);
  }
  if (!allowRequest(`ratings:${toolSlug}:${ip}`, 5, 60 * 1000)) {
    return json({ error: "You've already submitted a rating recently. Please try again later." }, 429);
  }

  const db = env.DB;
  if (!db) {
    return json({ error: "Ratings are temporarily unavailable." }, 503);
  }

  try {
    await db
      .prepare("INSERT INTO ratings (tool_slug, rating) VALUES (?, ?)")
      .bind(toolSlug, rating)
      .run();
  } catch (error) {
    console.error("ratings:post:db-error", error);
    return json({ error: "Ratings are temporarily unavailable." }, 503);
  }

  // Return the fresh aggregate so the client can update in place.
  try {
    const agg = await aggregate(db, toolSlug);
    return json({
      success: true,
      tool_slug: toolSlug,
      rating,
      count: agg.count,
      average: agg.average,
    });
  } catch (error) {
    console.error("ratings:post:aggregate-error", error);
    return json({ success: true, tool_slug: toolSlug, rating });
  }
}