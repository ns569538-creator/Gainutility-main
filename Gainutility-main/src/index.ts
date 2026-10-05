import {
  onRequestGet as ratingsGet,
  onRequestPost as ratingsPost,
} from "../functions/api/ratings";
import { onRequestPost as analyzePost } from "../functions/api/analyze";

export interface Env {
  ASSETS: Fetcher;
  /** D1 `gainutility-db` — wired in dev via d1_databases in wrangler.jsonc,
   *  configured on the Pages project (dashboard) in production. */
  DB?: D1Database;
}

/** Minimal Cloudflare-assets fetcher type (workers-types isn't referenced). */
export interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 410 Gone: Image to Code has been permanently removed.
    if (
      url.pathname === "/tools/image-to-code" ||
      url.pathname === "/image-to-code" ||
      url.pathname === "/api/image-to-code" ||
      url.pathname.endsWith("/tools/image-to-code") ||
      url.pathname.endsWith("/image-to-code") ||
      url.pathname.endsWith("/imagem-para-codigo") ||
      url.pathname.endsWith("/gambar-ke-kode") ||
      url.pathname.endsWith("/imagen-a-codigo") ||
      url.pathname.endsWith("/bild-zu-code") ||
      url.pathname.endsWith("/image-en-code") ||
      url.pathname.endsWith("/immagine-a-codice")
    ) {
      return new Response("Gone: The Image to Code tool has been permanently removed.", {
        status: 410,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=604800",
        },
      });
    }

    // Ratings are served by the Pages Function in production (same handler).
    // Routing here too means `npm run dev` exercises the identical code path.
    if (url.pathname === "/api/ratings") {
      const context = { request, env, params: {} };
      if (request.method === "GET") return ratingsGet(context);
      if (request.method === "POST") return ratingsPost(context);
    }
    // Website Studio scan proxy (same handler in dev and production).
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      const context = { request, env, params: {} };
      return analyzePost(context);
    }
    return env.ASSETS.fetch(request);
  },
};