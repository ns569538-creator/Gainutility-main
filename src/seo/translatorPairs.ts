/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Data-driven language pair pages for the PDF Translator tool. Each pair has
 * its own unique title, meta description, steps and FAQs so every route is a
 * distinct, crawlable page instead of a near-duplicate.
 *
 * The PDF Translator really works like this:
 *   - Native-text pages are read with pdf.js and translated with a
 *     third-party translation service (Google's free public endpoint).
 *   - Scanned/image-only pages are OCR'd locally with Tesseract first.
 *   - The result is rebuilt page-by-page and rendered into a new PDF, so
 *     layout is reconstructed rather than preserved perfectly.
 * Copy below matches that behavior; nothing claims "perfect" or "flawless".
 */

export interface TranslatorLanguage {
  /** Google Translate API language code. */
  code: string;
  /** English label, e.g. "French". */
  label: string;
  /** Native label, e.g. "Français". */
  native: string;
  /** Tesseract.js language pack used when OCR is needed. */
  tesseract: string;
  /** Text direction for rendering the translated page. */
  direction: "ltr" | "rtl";
}

export const TRANSLATOR_LANGUAGES: Record<string, TranslatorLanguage> = {
  en: { code: "en", label: "English", native: "English", tesseract: "eng", direction: "ltr" },
  fr: { code: "fr", label: "French", native: "Français", tesseract: "fra", direction: "ltr" },
  es: { code: "es", label: "Spanish", native: "Español", tesseract: "spa", direction: "ltr" },
  de: { code: "de", label: "German", native: "Deutsch", tesseract: "deu", direction: "ltr" },
  hi: { code: "hi", label: "Hindi", native: "हिन्दी", tesseract: "hin", direction: "ltr" },
  ar: { code: "ar", label: "Arabic", native: "العربية", tesseract: "ara", direction: "rtl" },
};

export type TranslatorLangCode = keyof typeof TRANSLATOR_LANGUAGES;

export interface TranslatorPairEntry {
  slug: string;
  source: TranslatorLangCode;
  target: TranslatorLangCode;
  /** Unique <title> tag text (without brand suffix). */
  title: string;
  /** Unique meta description (~150-160 chars). */
  description: string;
  /** Visible H1 for the pair page. */
  h1: string;
  /** Lead paragraph under the H1. */
  intro: string;
  /** Typical use cases shown on the pair page. */
  useCases: string[];
  /** Ordered usage steps for this specific pair. */
  steps: string[];
  /** Genuine FAQs rendered visibly and mirrored into FAQPage JSON-LD. */
  faqs: Array<{ question: string; answer: string }>;
  /** Other pair slugs for internal linking. */
  related: string[];
}

const SHARED_PRIVACY =
  "The PDF itself stays on your device. Only the extracted text is sent to a paid-free third-party translation service and comes back as translated text, which is then rebuilt locally. Don't translate documents that must never leave your computer.";

export const TRANSLATOR_PAIRS: Record<string, TranslatorPairEntry> = {
  "english-to-french": {
    slug: "english-to-french",
    source: "en",
    target: "fr",
    title: "Translate English PDF to French — Free Online PDF Translator",
    description:
      "Translate an English PDF into French right in your browser. Native-text files convert directly; scanned pages are OCR'd first, then rebuilt into a French PDF.",
    h1: "Translate English PDFs to French",
    intro:
      "Upload an English PDF and download a French version of it. Documents with selectable text are translated directly; if your file is a scan, built-in OCR reads it before the text is converted, so image-only pages still make it through.",
    useCases: [
      "Reviewing English contracts, manuals, or product guides with a French-speaking team",
      "Turning English research papers and reports into material a French audience can read",
      "Localizing brochures, presentations, and training content into French",
    ],
    steps: [
      "Upload the English PDF — up to 20 MB and 60 pages.",
      "Confirm French as the output language (source is detected automatically).",
      "Let the tool read the document, translate each page, and rebuild the file.",
      "Preview the translated pages and download the French PDF.",
    ],
    faqs: [
      {
        question: "Will French accents and characters be preserved in the output?",
        answer:
          "Yes. The rebuilt PDF renders each translated page as an image, so accented characters like é, è, and ç display correctly in any browser. Text layout is reconstructed, so complex documents can differ slightly from the original rather than matching it exactly.",
      },
      {
        question: "Does it work with scanned English PDFs?",
        answer:
          "Yes. Image-only pages are detected and run through OCR before translation. Poor-quality scans and handwriting produce imperfect text, and that carries into the translation, so expect errors on heavy scans.",
      },
      {
        question: "Is my English PDF uploaded when I translate it?",
        answer:
          "No. The PDF is opened locally and never uploaded. Only the extracted text travels to a third-party translation service and returns as French text, which is then rebuilt into a new PDF on your device. Avoid confidential files that must never leave your computer.",
      },
    ],
    related: ["french-to-english", "english-to-spanish", "english-to-german"],
  },

  "french-to-english": {
    slug: "french-to-english",
    source: "fr",
    target: "en",
    title: "Translate French PDF to English — Free Online PDF Translator",
    description:
      "Translate a French PDF into English in your browser. Direct translation for native-text files and OCR for scans, with a downloadable English PDF result.",
    h1: "Translate French PDFs to English",
    intro:
      "Upload a French PDF and get an English version back. Text-based pages are read and translated directly; scanned pages are recognized first, so even non-searchable French documents can be converted.",
    useCases: [
      "Understanding French legal or administrative documents you receive from abroad",
      "Sharing French-language articles, reports, or manuals with an English-speaking team",
      "Converting French product documentation for broader distribution",
    ],
    steps: [
      "Upload the French PDF — up to 20 MB and 60 pages.",
      "Confirm English as the output language (French is detected automatically).",
      "Wait for detection, translation, and local rebuilding of each page.",
      "Preview the result and download the English PDF.",
    ],
    faqs: [
      {
        question: "Can it translate a scanned French document?",
        answer:
          "Yes, within limits. The tool detects image-only pages and runs them through the French OCR model first. Clean printed scans translate reasonably well; handwriting and creased or low-resolution scans produce errors.",
      },
      {
        question: "Does the rebuilt English PDF stay readable?",
        answer:
          "Each page is re-rendered with the translated English text, so letters, figures, and headings remain legible. Multi-column layouts, tables, and images are repositioned rather than preserved pixel-for-pixel, so formatting can shift.",
      },
      {
        question: "What happens to my French PDF's data?",
        answer:
          "The file itself is processed locally. The read text is sent to a third-party translation service and returns as English text. If the document is confidential, don't use an online translation step at all.",
      },
    ],
    related: ["english-to-french", "french-to-spanish", "french-to-german"],
  },

  "english-to-spanish": {
    slug: "english-to-spanish",
    source: "en",
    target: "es",
    title: "Translate English PDF to Spanish — Free Translator",
    description:
      "Translate an English PDF into Spanish in your browser. Direct conversion for text PDFs, OCR for scans, and a downloadable Spanish result — no sign-up.",
    h1: "Translate English PDFs to Spanish",
    intro:
      "Turn an English PDF into a Spanish version you can share or archive. Selectable-text documents are translated directly; scanned pages are recognized with OCR first so they can be converted too.",
    useCases: [
      "Converting English product manuals and guides into Spanish for wider reach",
      "Preparing English business proposals or contracts for Spanish-speaking clients",
      "Translating English course material and handouts into Spanish",
    ],
    steps: [
      "Upload the English PDF — up to 20 MB and 60 pages.",
      "Pick Spanish as the output language.",
      "Watch the tool detect structure, translate each page, and rebuild the document.",
      "Check the preview and download the Spanish PDF.",
    ],
    faqs: [
      {
        question: "Which Spanish does the translation use?",
        answer:
          "The translation service produces general Spanish that is understandable across regions, but it isn't tuned for a specific dialect such as European or Latin American Spanish. Wording may favor one form over another.",
      },
      {
        question: "Will Spanish accents and the ñ character display correctly?",
        answer:
          "Yes. Translated pages are rendered with the browser's font engine, so accented letters and ñ appear normally. Because the page is rebuilt rather than patched in place, spacing and line breaks can shift.",
      },
      {
        question: "What about scanned English PDFs?",
        answer:
          "Scanned pages are OCR'd before translation. Clean print works well; handwriting, watermarks, and low-resolution scans lose accuracy, which then affects the translated text.",
      },
    ],
    related: ["spanish-to-english", "english-to-french", "english-to-german"],
  },

  "spanish-to-english": {
    slug: "spanish-to-english",
    source: "es",
    target: "en",
    title: "Translate Spanish PDF to English — Free Translator",
    description:
      "Translate a Spanish PDF into English in your browser. Fast direct translation for text PDFs and OCR support for scans, delivered as a downloadable PDF.",
    h1: "Translate Spanish PDFs to English",
    intro:
      "Upload a Spanish PDF and download an English translation of it. Reflexive, conversational Spanish is handled by the translation service; scans are run through the Spanish OCR model so image-only pages still convert.",
    useCases: [
      "Understanding Spanish reports, invoices, or notices you've received",
      "Turning Spanish-language research into material for an English audience",
      "Translating Spanish marketing copy or support documentation into English",
    ],
    steps: [
      "Upload the Spanish PDF — up to 20 MB and 60 pages.",
      "Confirm English as the output language.",
      "Let the tool translate every page and rebuild the file locally.",
      "Preview and download the English PDF.",
    ],
    faqs: [
      {
        question: "Can this translate formal and informal Spanish correctly?",
        answer:
          "The service handles tú/vosotros and usted forms reasonably in context, but tone choices aren't guaranteed. For legal or regulatory text, have a native reviewer check the result.",
      },
      {
        question: "Is OCR available for scanned Spanish documents?",
        answer:
          "Yes. Image-only pages run through the Spanish OCR model before translation. Crisp print is handled well; handwritten annotations and poor scans degrade accuracy in both OCR and translation.",
      },
      {
        question: "Do I need to create an account to translate a PDF?",
        answer: "No. Everything runs from the page — no sign-up, file uploads, or watermarks. Only the extracted text goes to the translation service and comes back in English.",
      },
    ],
    related: ["english-to-spanish", "spanish-to-french", "spanish-to-german"],
  },

  "english-to-german": {
    slug: "english-to-german",
    source: "en",
    target: "de",
    title: "Translate English PDF to German — Free Online PDF Translator",
    description:
      "Translate an English PDF into German in your browser. Direct conversion for text PDFs, OCR for scans, and a downloadable German result. No uploads.",
    h1: "Translate English PDFs to German",
    intro:
      "Convert an English PDF into German for colleagues, clients, or your own files. Text PDFs translate directly; scanned pages are OCR'd first, and the result is rebuilt as a new German PDF.",
    useCases: [
      "Translating English technical manuals and spec sheets into German",
      "Preparing contracts, invoices, and compliance documents for German-speaking contacts",
      "Converting English training material and slides into German",
    ],
    steps: [
      "Upload the English PDF — up to 20 MB and 60 pages.",
      "Confirm German as the output language.",
      "Watch the detection, translation, and rebuilding stages run.",
      "Preview the German pages and download the result.",
    ],
    faqs: [
      {
        question: "How are German umlauts and compound words handled?",
        answer:
          "ä, ö, ü, and ß are rendered by the browser font engine, so they display cleanly. German compounds also make translated phrases longer, which is exactly why the page is rebuilt — long words wrap and reflow rather than being cut off.",
      },
      {
        question: "Does it preserve formal German (Sie) vs informal (du)?",
        answer:
          "The translation service defaults to a generally formal register but does not guarantee Sie/du consistency throughout a long document. Review the output for business or legal use.",
      },
      {
        question: "Does the German PDF keep my images and logos?",
        answer:
          "Images are carried into the rebuilt document, and translated text is placed back on each page. Positioning is reconstructed, so graphics may sit slightly differently than in the original.",
      },
    ],
    related: ["german-to-english", "english-to-french", "english-to-spanish"],
  },

  "german-to-english": {
    slug: "german-to-english",
    source: "de",
    target: "en",
    title: "Translate German PDF to English — Free Online PDF Translator",
    description:
      "Translate a German PDF into English right in your browser. Text PDFs convert directly, scans use OCR, and you download a readable English result.",
    h1: "Translate German PDFs to English",
    intro:
      "Upload a German PDF — a contract, manual, or a letter — and download an English version. The tool reads text pages directly and OCRs scanned ones, then rebuilds each page with the English translation.",
    useCases: [
      "Understanding German contracts, invoices, and official letters",
      "Converting German technical documentation for an English-speaking team",
      "Translating German research papers into English for wider sharing",
    ],
    steps: [
      "Upload the German PDF — up to 20 MB and 60 pages.",
      "Pick English as the output language.",
      "Let the tool detect the document type and translate each page.",
      "Preview the translated PDF and download it.",
    ],
    faqs: [
      {
        question: "Can long German compound words translate cleanly?",
        answer:
          "The translation service splits compounds into natural English equivalents. Because English is shorter, the rebuilt page reflows text into the same area rather than padding with empty space.",
      },
      {
        question: "Does OCR work for scanned German documents?",
        answer:
          "Yes, the German OCR model is used on image-only pages. Clean Fraktur or printed text may still confuse older-era documents; modern typed German scans convert reliably.",
      },
      {
        question: "What exactly is sent to the translation service?",
        answer:
          "Only the extracted text of each page. The PDF file never leaves your browser. Translated text comes back and is rendered into a new document on your device.",
      },
    ],
    related: ["english-to-german", "german-to-french", "german-to-spanish"],
  },

  "english-to-hindi": {
    slug: "english-to-hindi",
    source: "en",
    target: "hi",
    title: "Translate English PDF to Hindi — Free Online PDF Translator",
    description:
      "Translate an English PDF into Hindi in your browser. Direct translation for text PDFs, OCR for scans, and correct Devanagari rendering in the output.",
    h1: "Translate English PDFs to Hindi",
    intro:
      "Convert an English PDF into Hindi for personal use, study, or sharing. Native-text pages translate directly and Hindi OCR helps with scans; the rebuilt page renders Devanagari correctly using your browser's fonts.",
    useCases: [
      "Reading English government schemes, forms, or notices in Hindi",
      "Converting English educational material into Hindi for students",
      "Translating English company communications into Hindi for employees",
    ],
    steps: [
      "Upload the English PDF — up to 20 MB and 60 pages.",
      "Choose Hindi as the output language.",
      "Wait for the pages to be read, translated, and rebuilt with Devanagari text.",
      "Preview the Hindi PDF and download it.",
    ],
    faqs: [
      {
        question: "Will Devanagari script render correctly in the PDF?",
        answer:
          "Yes. Translated pages are drawn with the browser's text engine, which handles Devanagari conjuncts and vowel signs properly — something basic PDF text fonts can't do. The output is a rendered page, not searchable text.",
      },
      {
        question: "Does it translate scanned English PDFs into Hindi?",
        answer:
          "Scanned pages are OCR'd before translation. English OCR is solid for clean print, so such scans convert; handwriting and poor-quality pages still produce errors in both the OCR and the translation.",
      },
      {
        question: "Is my English PDF uploaded to a server?",
        answer:
          "No. The file is processed locally. Text extracted from it is sent to a third-party translation service for conversion to Hindi and then rendered back into a new PDF on your device. Keep confidential documents local.",
      },
    ],
    related: ["hindi-to-english", "english-to-arabic", "english-to-french"],
  },

  "hindi-to-english": {
    slug: "hindi-to-english",
    source: "hi",
    target: "en",
    title: "Translate Hindi PDF to English — Free Online PDF Translator",
    description:
      "Translate a Hindi PDF into English in your browser. Direct translation for Devanagari text PDFs, OCR for scans, with a clean English result to download.",
    h1: "Translate Hindi PDFs to English",
    intro:
      "Upload a Hindi PDF and download an English translation. Native-text Hindi pages are read with pdf.js and translated directly; scanned pages — common with older Hindi documents — are OCR'd first.",
    useCases: [
      "Understanding Hindi job notifications, forms, or official notices",
      "Translating Hindi religious or literary texts into English for study",
      "Converting Hindi educational or government documents into English",
    ],
    steps: [
      "Upload the Hindi PDF — up to 20 MB and 60 pages.",
      "Confirm English as the output language.",
      "Let the tool read, translate, and rebuild every page locally.",
      "Preview the English result and download the PDF.",
    ],
    faqs: [
      {
        question: "Can it read native Devanagari text PDFs?",
        answer:
          "Yes. PDFs created from Hindi text extraction layer are read with pdf.js. Fonts embedded in the original are irrelevant because the output is re-drawn, and the translated English pages render with standard browser fonts.",
      },
      {
        question: "How are scanned Hindi documents handled?",
        answer:
          "They're processed through the Hindi OCR model. Hindi OCR is less forgiving than Latin scripts, so crisp, upright print converts acceptably while decorative or low-resolution scans degrade the text before it's even translated.",
      },
      {
        question: "What happens to the PDF file?",
        answer:
          "It is opened and processed in your browser and never uploaded. Only page text is sent to the translation service and comes back as English — so treat the service like any external translator for sensitive files.",
      },
    ],
    related: ["hindi-to-english", "english-to-hindi", "hindi-to-arabic"],
  },

  "english-to-arabic": {
    slug: "english-to-arabic",
    source: "en",
    target: "ar",
    title: "Translate English PDF to Arabic — Free Online PDF Translator",
    description:
      "Translate an English PDF into Arabic in your browser with correct right-to-left rendering. Direct translation for text PDFs and OCR for scans.",
    h1: "Translate English PDFs to Arabic",
    intro:
      "Convert an English PDF into Arabic. The translated page is rendered right-to-left with standard Arabic script, which matters because most PDF text engines can't do that properly. Scanned pages are OCR'd first.",
    useCases: [
      "Translating English contracts and agreements for Arabic-speaking parties",
      "Converting English product and training documentation into Arabic",
      "Preparing English announcements or forms for an Arabic audience",
    ],
    steps: [
      "Upload the English PDF — up to 20 MB and 60 pages.",
      "Choose Arabic (right-to-left) as the output language.",
      "Let the pages be detected, translated, and redrawn with Arabic script.",
      "Preview the Arabic PDF and download it.",
    ],
    faqs: [
      {
        question: "How is right-to-left reading order handled?",
        answer:
          "Each translated page is drawn with the text direction set to RTL, so Arabic reads from right to left as it should. Mixed numbers remain left-to-right in line with the script conventions.",
      },
      {
        question: "Why can't this just edit the original PDF's text?",
        answer:
          "Replacing Latin text inside an existing PDF would need an embedded Arabic font and full font substitution — exactly what most in-browser tools can't do. Rendering the translated page is the reliable way to keep Arabic correct.",
      },
      {
        question: "Can it translate scanned English PDFs into Arabic?",
        answer:
          "Yes. Image-only pages go through English OCR before translation. Clean, printed scans convert well; scanned handwriting or noisy pages reduce accuracy in both the OCR and the Arabic out-turn.",
      },
    ],
    related: ["arabic-to-english", "english-to-hindi", "english-to-french"],
  },

  "arabic-to-english": {
    slug: "arabic-to-english",
    source: "ar",
    target: "en",
    title: "Translate Arabic PDF to English — Free Online PDF Translator",
    description:
      "Translate an Arabic PDF into English in your browser. Direct translation for right-to-left text PDFs, OCR for scans, and a clean English result to download.",
    h1: "Translate Arabic PDFs to English",
    intro:
      "Upload an Arabic PDF and download an English translation. RTL text pages are read directly; scanned Arabic pages — very common for older documents — are OCR'd first, then everything is rebuilt as a readable English PDF.",
    useCases: [
      "Understanding Arabic certificates, approvals, or official correspondence",
      "Translating Arabic religious, legal, or historical texts into English",
      "Converting Arabic-language notices and forms for English readers",
    ],
    steps: [
      "Upload the Arabic PDF — up to 20 MB and 60 pages.",
      "Confirm English as the output language.",
      "Watch the tool detect the page type, translate, and rebuild the document.",
      "Preview the English PDF and download it.",
    ],
    faqs: [
      {
        question: "Can it handle native Arabic text PDFs?",
        answer:
          "Yes. Arabic text in the PDF's text layer is read with pdf.js and translated page by page. Because the output is redrawn with browser fonts, Arabic glyph shaping doesn't leak into the English result.",
      },
      {
        question: "How accurate is OCR for scanned Arabic?",
        answer:
          "Less forgiving than Latin scripts. Arabic OCR needs proper diacritic handling and fails more on handwriting and low-quality scans. For such files, accept that some passages may need manual correction.",
      },
      {
        question: "Is the file uploaded during translation?",
        answer:
          "The PDF itself is never uploaded — it's opened and processed locally. The extracted Arabic text is sent to a third-party translation service, and the English translation returns to be rebuilt into a new PDF on your device.",
      },
    ],
    related: ["english-to-arabic", "arabic-to-french", "arabic-to-spanish"],
  },
};

export const TRANSLATOR_PAIR_SLUGS: string[] = Object.keys(TRANSLATOR_PAIRS);

/** Canonical (relative) path for a pair page, e.g. /tools/pdf-translator/english-to-french */
export const translatorPairPath = (slug: string): string =>
  `/tools/pdf-translator/${slug}`;

export const getTranslatorPair = (slug: string): TranslatorPairEntry | undefined =>
  TRANSLATOR_PAIRS[slug];

/** Pair label like "English → French" for links and breadcrumb names. */
export const pairLabel = (entry: TranslatorPairEntry): string => {
  const s = TRANSLATOR_LANGUAGES[entry.source];
  const t = TRANSLATOR_LANGUAGES[entry.target];
  return `${s?.label ?? entry.source} to ${t?.label ?? entry.target}`;
};

export const pairLabelArrow = (entry: TranslatorPairEntry): string => {
  const s = TRANSLATOR_LANGUAGES[entry.source];
  const t = TRANSLATOR_LANGUAGES[entry.target];
  return `${s?.label ?? entry.source} → ${t?.label ?? entry.target}`;
};