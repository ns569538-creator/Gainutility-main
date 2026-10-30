/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * OCR layer for the Font Finder: a cached singleton tesseract.js worker
 * (v7) with per-character confidences for uncertain-character highlighting.
 * The worker is only created on first use so the library/PDF-metadata modes
 * never pay for it.
 */

export interface OcrChar {
  ch: string;
  /** 0..100 confidence from the recognizer. */
  conf: number;
}

export interface OcrLine {
  text: string;
  chars: OcrChar[];
  conf: number;
}

export interface OcrResult {
  text: string;
  lines: OcrLine[];
  overall: number;
  /**
   * True when symbol-level blocks were unavailable and confidences fall back
   * to the page-level score (character highlighting is approximate then).
   */
  degraded: boolean;
}

type ProgressFn = (fraction: number, label: string) => void;

let workerPromise: Promise<any> | null = null;
let cachedEngineVersion: string | null = null;

async function getWorker(onProgress?: ProgressFn): Promise<any> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const T = await import("tesseract.js");
      cachedEngineVersion =
        (T as any).versions?.tesseract ?? "tesseract.js";
      const worker = await T.createWorker("eng", 1, {
        logger: (m: any) => {
          if (!onProgress) return;
          if (typeof m.progress === "number") {
            const frac = Math.max(0, Math.min(1, m.progress));
            if (m.status === "recognizing text") {
              onProgress(frac, "Detecting visible text…");
            } else if (String(m.status ?? "").includes("load")) {
              onProgress(frac * 0.5, "Loading text recognizer…");
            }
          }
        },
      });
      return worker;
    })();
    workerPromise.catch(() => {
      // Allow a retry after a transient failure (e.g. offline first hit).
      workerPromise = null;
    });
  }
  return workerPromise;
}

/** Drop the cached worker (used by tests / hard resets). */
export function resetOcrWorker(): void {
  const p = workerPromise;
  workerPromise = null;
  if (p) p.then((w) => w?.terminate?.()).catch(() => {});
}

export function ocrEngineLabel(): string {
  return cachedEngineVersion ?? "tesseract.js";
}

/**
 * Recognize text in a data URL. Never throws for low-quality input — an
 * empty result with `degraded: true` is returned instead.
 */
export async function recognizeText(
  src: string,
  onProgress?: ProgressFn,
): Promise<OcrResult> {
  const worker = await getWorker(onProgress);

  let data: any;
  try {
    const out = await worker.recognize(src, {}, { blocks: true, text: true });
    data = out.data;
  } catch {
    const out = await worker.recognize(src);
    data = out.data;
  }

  const lines = extractLines(data);
  const text = (data?.text ?? lines.map((l) => l.text).join("\n"))
    .replace(/\r/g, "")
    .trim();
  const overall =
    typeof data?.confidence === "number" ? Math.round(data.confidence) : 0;

  return {
    text,
    lines: lines.length ? lines : text ? [{ text, chars: [], conf: overall }] : [],
    overall,
    degraded: lines.every((l) => l.chars.length === 0) && lines.length > 0,
  };
}

/** Walk tesseract blocks → lines with per-symbol confidences. */
function extractLines(data: any): OcrLine[] {
  const blocksRaw = data?.blocks;
  const blocks: any[] = Array.isArray(blocksRaw)
    ? blocksRaw
    : blocksRaw && Array.isArray(blocksRaw.blocks)
      ? blocksRaw.blocks
      : [];
  if (!blocks.length) return [];

  const lines: OcrLine[] = [];
  for (const block of blocks) {
    for (const para of block?.paragraphs ?? []) {
      for (const line of para?.lines ?? []) {
        const words: any[] = line?.words ?? [];
        const chars: OcrChar[] = [];
        const parts: string[] = [];
        words.forEach((word, wi) => {
          if (wi > 0) {
            chars.push({ ch: " ", conf: 100 });
            parts.push(" ");
          }
          const symbols: any[] = word?.symbols ?? [];
          if (symbols.length) {
            for (const sym of symbols) {
              const ch = String(sym?.text ?? "");
              chars.push({
                ch,
                conf: Math.round(Number(sym?.confidence ?? 0)),
              });
              parts.push(ch);
            }
          } else {
            const t = String(word?.text ?? "");
            chars.push({
              ch: t,
              conf: Math.round(Number(word?.confidence ?? 0)),
            });
            parts.push(t);
          }
        });
        const text = parts.join("").replace(/\s+/g, " ").trim();
        if (text) {
          lines.push({
            text,
            chars,
            conf: Math.round(Number(line?.confidence ?? 0)),
          });
        }
      }
    }
  }
  return lines;
}
