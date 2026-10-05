/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * In-memory font cache storing base64 font payloads: key is "${cleanFontFamily}-${fontWeight}"
 */
const fontBase64Cache = new Map<string, string>();

/**
 * In-flight fetch promises to prevent duplicate simultaneous network requests
 */
const inFlightRequests = new Map<string, Promise<string | null>>();

/**
 * Cleans a CSS font-family string (e.g. "'Plus Jakarta Sans', sans-serif" -> "Plus Jakarta Sans")
 */
export function getCleanFontFamily(fontFamily: string): string {
  if (!fontFamily) return "Inter";
  return fontFamily.split(",")[0].replace(/['"]/g, "").trim();
}

/**
 * Extracts the Latin subset URL from a Google Fonts CSS stylesheet response.
 * Google Fonts separates fonts into multiple unicode-range blocks (e.g., devanagari, cyrillic, latin).
 * We MUST extract the Latin subset so English/Western characters render with the actual web font
 * rather than falling back to system fonts.
 */
export function extractLatinFontUrl(cssText: string): string | null {
  if (!cssText) return null;

  // 1. Look for block explicitly marked /* latin */
  const latinBlockMatch = cssText.match(/\/\*\s*latin\s*\*\/[\s\S]*?src:\s*url\((https:\/\/[^)]+)\)/i);
  if (latinBlockMatch && latinBlockMatch[1]) {
    return latinBlockMatch[1];
  }

  // 2. Look for block whose unicode-range contains U+0000 (basic Latin)
  const u0000Match = cssText.match(/src:\s*url\((https:\/\/[^)]+)\)[\s\S]*?unicode-range:[^;]*?U\+0000/i);
  if (u0000Match && u0000Match[1]) {
    return u0000Match[1];
  }

  // 3. Fallback: match all src: url(...) instances and take the LAST one
  // Google Fonts CSS convention orders regional subsets first and Latin last
  const allUrls = [...cssText.matchAll(/src:\s*url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
  if (allUrls.length > 0) {
    return allUrls[allUrls.length - 1];
  }

  return null;
}

/**
 * Loads the web font into document.fonts so Canvas 2D and live preview have instant access.
 */
export async function ensureDocumentFont(fontFamily: string, weight: number = 700): Promise<boolean> {
  const cleanFamily = getCleanFontFamily(fontFamily);
  if (typeof document === "undefined" || !("fonts" in document)) {
    return true;
  }

  try {
    const fontSpec = `${weight} 48px "${cleanFamily}"`;
    if (document.fonts.check(fontSpec)) {
      return true;
    }

    // Ensure stylesheet is in document head
    const linkId = `gu-font-${cleanFamily.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${weight}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily)}:wght@${weight}&display=swap`;
      document.head.appendChild(link);
    }

    await document.fonts.load(fontSpec);
    await document.fonts.ready;
    return document.fonts.check(fontSpec);
  } catch (err) {
    console.warn(`[fontManager] Document font load failed for ${cleanFamily} (${weight}):`, err);
    return false;
  }
}

/**
 * Fetches the Google Font binary for the given font family and weight,
 * specifically extracting the Latin subset, and converts it to a base64 data URI string.
 */
export async function getFontBase64(fontFamily: string, weight: number = 700): Promise<string | null> {
  const cleanFamily = getCleanFontFamily(fontFamily);
  const cacheKey = `${cleanFamily}-${weight}`;

  if (fontBase64Cache.has(cacheKey)) {
    return fontBase64Cache.get(cacheKey)!;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<string | null> => {
    try {
      const encodedFamily = encodeURIComponent(cleanFamily);
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weight}&display=swap`;

      const headers: Record<string, string> = {
        Accept: "text/css,*/*;q=0.1",
      };

      const cssRes = await fetch(cssUrl, { headers });
      if (!cssRes.ok) {
        return null;
      }

      const cssText = await cssRes.text();

      // Extract the Latin binary URL specifically
      const binaryUrl = extractLatinFontUrl(cssText);
      if (!binaryUrl) {
        return null;
      }

      const fontRes = await fetch(binaryUrl);
      if (!fontRes.ok) {
        return null;
      }

      const arrayBuffer = await fontRes.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Convert to base64 safely in chunks to avoid call stack limits
      let binaryStr = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i += 8192) {
        binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
      }
      const base64 = btoa(binaryStr);

      const mimeType = binaryUrl.endsWith(".woff2")
        ? "font/woff2"
        : binaryUrl.endsWith(".woff")
        ? "font/woff"
        : "font/truetype";

      const dataUri = `data:${mimeType};base64,${base64}`;
      fontBase64Cache.set(cacheKey, dataUri);
      return dataUri;
    } catch (err) {
      console.warn(`[fontManager] Unable to fetch base64 font for ${cleanFamily} (${weight}):`, err);
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Embeds a self-contained, standalone @font-face rule into the SVG markup.
 * Guarantees that desktop software (Figma, Illustrator, Inkscape) and sandboxed SVG Canvas
 * render the exact selected web font without fallback or network failure.
 */
export async function embedFontInSvg(
  svgString: string,
  fontFamily: string,
  weight: number = 700
): Promise<string> {
  const cleanFamily = getCleanFontFamily(fontFamily);

  // Trigger document font load in parallel
  ensureDocumentFont(fontFamily, weight).catch(() => {});

  let fontFaceRule = "";
  try {
    const dataUri = await getFontBase64(fontFamily, weight);
    if (dataUri) {
      const format = dataUri.startsWith("data:font/woff2")
        ? "woff2"
        : dataUri.startsWith("data:font/woff")
        ? "woff"
        : "truetype";

      fontFaceRule = `
    @font-face {
      font-family: '${cleanFamily}';
      font-style: normal;
      font-weight: ${weight};
      src: url('${dataUri}') format('${format}'),
           local('${cleanFamily}'),
           local('${cleanFamily} Bold');
    }
      `;
    } else {
      // Fallback to local and single-family Google Font import if base64 fetch is blocked
      fontFaceRule = `
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily)}:wght@${weight}&display=swap');
    @font-face {
      font-family: '${cleanFamily}';
      font-style: normal;
      font-weight: ${weight};
      src: local('${cleanFamily}'), local('${cleanFamily} Bold');
    }
      `;
    }
  } catch {
    fontFaceRule = `
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily)}:wght@${weight}&display=swap');
    `;
  }

  // Strip any old giant multi-font @import statements to keep SVG lightweight and valid
  let cleanedSvg = svgString.replace(/@import\s+url\([^)]+\);?/g, "");

  // Inject font-face rule into existing <style> tag or create a new <defs><style> block
  if (cleanedSvg.includes("<style>")) {
    return cleanedSvg.replace("<style>", `<style>${fontFaceRule}\n    text { user-select: none; }`);
  } else if (cleanedSvg.includes("<style ")) {
    return cleanedSvg.replace(/<style[^>]*>/, `$&${fontFaceRule}\n    text { user-select: none; }`);
  } else {
    return cleanedSvg.replace(/<svg[^>]*>/, `$&<defs><style>${fontFaceRule}\n    text { user-select: none; }\n  </style></defs>`);
  }
}
