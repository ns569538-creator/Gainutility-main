/**
 * YouTube autocomplete proxy for the YouTube Keyword Explorer.
 *
 * Endpoint:
 *   GET /api/youtube-autocomplete?q=<seed>&hl=<hl>&gl=<gl>[&expand=1]
 *
 * The browser tool page calls this same-origin function instead of talking to
 * Google's suggest endpoint directly (CORS blocks browser-to-google calls).
 *
 * Data model (honest by design):
 *   - `main`    — the suggestion list for the seed term itself.
 *   - `expanded`— when expand=1, one list per A–Z seed (e.g. "seed a",
 *                 "seed b", ...). This is the source of the "how often a
 *                 keyword surfaced" signal.
 *   - Every item records its 1-based POSITION in its list. No volume, no
 *     difficulty, no invented numbers are ever returned.
 *
 * The term ("query") is forwarded to Google so autocomplete reflects the
 * requested market (hl/gl) — e.g. hl=es-419 + gl=MX for the es-mx locale.
 */

interface FunctionContext {
  request: Request;
}

const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";

const HOST = "suggestqueries" as const;

const EXPANSION_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

/** Strip any JSONP/wrapper/padding a suggest client may add, then JSON.parse. */
const parseSuggestions = (raw: string): string[] => {
  let body = raw.trim().replace(/^while\(1\);/, "").trim();
  // Google's suggest host returns `window.google.ac.h([...])` for browser
  // clients; peel the wrapper to reach the JSON array.
  if (body.startsWith("window.google.ac.h(")) {
    body = body.slice("window.google.ac.h(".length);
    if (body.endsWith(")")) body = body.slice(0, -1);
  }
  try {
    const data = JSON.parse(body);
    if (!Array.isArray(data) || data.length < 2) return [];
    const items = data[1];
    if (!Array.isArray(items)) return [];
    const out: string[] = [];
    for (const it of items) {
      let term: unknown = null;
      if (typeof it === "string") term = it;
      else if (Array.isArray(it) && typeof it[0] === "string") term = it[0];
      if (typeof term === "string" && term.trim()) {
        const t = term.trim();
        if (!out.includes(t)) out.push(t);
      }
    }
    return out;
  } catch {
    return [];
  }
};

const buildUrl = (q: string, hl: string, gl: string): string =>
  `${SUGGEST_URL}?client=youtube&ds=yt&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&q=${encodeURIComponent(q)}`;

const fetchList = async (q: string, hl: string, gl: string): Promise<{ text: string; position: number }[] | null> => {
  const url = buildUrl(q, hl, gl);
  const res = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "accept-language": `${hl.toLowerCase()},en;q=0.8`,
    },
  });
  if (!res.ok) {
    // 429 / 5xx from the suggest host — distinguish rate-limit-ish from dead.
    if (res.status === 429 || res.status >= 500) return null;
    return [];
  }
  const suggestions = parseSuggestions(await res.text());
  return suggestions.map((text, i) => ({ text, position: i + 1 }));
};

interface SuggestItem {
  text: string;
  position: number;
}

interface ExpandedList {
  seed: string;
  items: SuggestItem[];
  skipped?: boolean;
}

export const onRequestGet: (ctx: FunctionContext) => Promise<Response> = async ({ request }) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const hl = (url.searchParams.get("hl") || "en").slice(0, 10);
  const gl = (url.searchParams.get("gl") || "US").slice(0, 10);
  const expand = url.searchParams.get("expand") === "1";

  if (!q) {
    return Response.json({ error: "missing_query" }, { status: 400 });
  }

  const main = await fetchList(q, hl, gl);
  if (main === null) {
    return Response.json({ error: "unavailable", hint: "external_suggest_unreachable" }, { status: 503 });
  }

  const response: {
    query: string;
    hl: string;
    gl: string;
    fetchedAt: string;
    main: SuggestItem[];
    expanded: Array<{ seed: string; items: SuggestItem[]; skipped?: boolean }>;
    expandedCount: number;
    error?: string;
  } = {
    query: q,
    hl,
    gl,
    fetchedAt: new Date().toISOString(),
    main,
    expanded: [],
    expandedCount: 0,
  };

  if (expand) {
    // Fire A–Z fetches in small concurrent batches to stay polite to the
    // host; each batch resolves before the next starts.
    const BATCH = 6;
    const expanded: ExpandedList[] = [];
    let skipped = 0;
    for (let i = 0; i < EXPANSION_LETTERS.length; i += BATCH) {
      const batch = EXPANSION_LETTERS.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(async (letter) => {
          const items = await fetchList(`${q} ${letter}`, hl, gl);
          if (items === null) {
            skipped++;
            return { seed: letter, items: [], skipped: true } satisfies ExpandedList;
          }
          return { seed: letter, items } satisfies ExpandedList;
        })
      );
      expanded.push(...results);
      if (skipped > 2) break; // host is throttling; stop early
    }
    response.expanded = expanded;
    response.expandedCount = expanded.reduce((n, e) => n + e.items.length, 0);
    if (skipped > 0) response.error = "expansion_incomplete";
    // signal any partially-skipped batches so the UI can say
    // "A–Z expansion partially skipped".
  }

  return Response.json(response, {
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
};