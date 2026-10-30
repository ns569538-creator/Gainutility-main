/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Supplemental FAQs for registry tools whose base entries carry fewer than
 * three questions. Merged inside getSEOMetadata (src/data.ts) so the visible
 * FAQ accordion and the FAQPage JSON-LD always stay identical — both read
 * the same merged list.
 *
 * Content rules honored here:
 *   - every answer describes verified behavior of this codebase
 *   - no invented statistics, limits, or third-party claims
 *   - questions target real search intent (how-to, privacy, formats,
 *     troubleshooting) without repeating the base entries
 */

type Faq = { question: string; answer: string };

export const EXTRA_FAQS: Partial<Record<string, Faq[]>> = {
  /* ---------------- JSON studio ---------------- */
  "json-beautifier": [
    {
      question: "How do I beautify a .json file without copy-pasting?",
      answer:
        "Use the upload control to load your .json file directly, pick an indentation size, and format it. The beautified result can then be downloaded as a new file."
    },
    {
      question: "Will beautifying change any of my values?",
      answer:
        "No. Formatting only adds whitespace and line breaks between tokens. Strings, numbers, and key order are left exactly as they were parsed."
    }
  ],
  "json-minifier": [
    {
      question: "How do I minify JSON for production deployment?",
      answer:
        "Paste or upload your JSON and run the minifier. All removable whitespace between tokens is stripped, producing a single-line payload ready for config files, API responses, or embedding in HTML."
    },
    {
      question: "Does minification shrink string contents too?",
      answer:
        "No. Characters inside quoted strings are preserved byte-for-byte; only structural whitespace outside strings is removed, so data integrity is never affected."
    },
    {
      question: "How much smaller will my JSON get?",
      answer:
        "Savings depend on how much indentation the source had. Hand-formatted files typically shrink significantly, while already-compact payloads may barely change."
    }
  ],
  "json-tree-viewer": [
    {
      question: "How do I inspect a deeply nested value quickly?",
      answer:
        "Type a key name into the search filter and matching nodes are highlighted through every nesting level, so you can jump straight to the branch you need instead of expanding manually."
    },
    {
      question: "Can I collapse large arrays to keep the view readable?",
      answer:
        "Yes. Any object or array node can be collapsed individually, or use the expand/collapse-all controls to manage the whole tree at once."
    },
    {
      question: "Does the viewer show array indexes and value types?",
      answer:
        "Arrays render as indexed lists and each leaf shows its parsed value, making it easy to distinguish numbers, booleans, nulls, and strings at a glance."
    }
  ],
  "json-compare-diff": [
    {
      question: "What change types does the diff highlight?",
      answer:
        "Values that changed, keys added on one side, and keys removed on the other are each marked distinctly so you can see exactly what moved between two versions of a config or API response."
    },
    {
      question: "Can I compare API responses from two environments?",
      answer:
        "Yes. Paste the staging response into one panel and the production response into the other — differences in shared keys surface immediately."
    },
    {
      question: "Does the comparison happen on my device?",
      answer:
        "Yes. Both inputs are parsed and compared locally in browser memory; neither payload is transmitted anywhere."
    }
  ],
  "json-to-csv": [
    {
      question: "How do I convert a JSON array to a CSV file?",
      answer:
        "Paste a JSON array of objects, let the converter detect the columns, preview the table, then download or copy RFC-compatible CSV that opens cleanly in Excel and Google Sheets."
    },
    {
      question: "What happens to nested objects inside items?",
      answer:
        "Nested properties are flattened into dotted column headers (for example address.city), keeping every value reachable in flat spreadsheet columns."
    },
    {
      question: "Are commas and quotes inside my data handled safely?",
      answer:
        "Yes. Fields containing commas, quotes, or line breaks are wrapped and escaped according to CSV rules so column boundaries stay correct."
    }
  ],
  "json-validator": [
    {
      question: "Is there a quick way to find where my JSON broke?",
      answer:
        "Yes. When validation fails, the error message includes the line and character position of the offending token, so you can jump directly to the problem instead of hunting through the payload."
    },
    {
      question: "Can I validate JSON pulled straight from a log file?",
      answer:
        "Yes — paste the raw text or load the file. The parser reads the entire input and reports either valid syntax or the first error encountered, whichever comes first."
    },
    {
      question: "Does validation modify or normalize my data?",
      answer:
        "No. Validation is read-only; your input stays untouched. Pair it with the formatter if you also want cleaned-up output."
    }
  ],

  /* ---------------- CSS / design ---------------- */
  "box-shadow-generator": [
    {
      question: "How do I create layered soft shadows like modern UI kits?",
      answer:
        "Add more than one shadow layer and give each a low opacity with increasing blur and vertical offset. The generator combines them into a single comma-separated box-shadow rule you can paste straight into CSS."
    },
    {
      question: "Can I make inset shadows for pressed-in effects?",
      answer:
        "Yes. Toggle a layer to inset to build recessed input wells, pressed buttons, or neumorphic surfaces, and the generated CSS updates live."
    },
    {
      question: "Does the output include vendor prefixes?",
      answer:
        "Modern browsers support unprefixed box-shadow universally, so the generator emits clean standard CSS without legacy prefixes."
    },
    {
      question: "How do I copy the generated CSS?",
      answer:
        "Use the copy control in the output panel — it writes the current shadow to the clipboard exactly as shown. The same result is available as a full declaration, a CSS variable, a bare value, or a Tailwind class."
    }
  ],
  "border-radius-generator": [
    {
      question: "How do I create organic blob shapes?",
      answer:
        "Set different horizontal and vertical radii per corner — the generator composes them using CSS slash syntax (for example 30% 70% / 40% 60%), which produces fluid, asymmetric blob outlines."
    },
    {
      question: "Can I control just one corner, like only the top-left?",
      answer:
        "Yes. Each corner has its own controls, so you can round a single corner for card accents or speech-bubble tails while leaving the others square."
    },
    {
      question: "Should I use px or % values?",
      answer:
        "Pixels give fixed rounding that never changes with element size; percentages scale with the box, which is what creates elliptical and blob effects. The generator supports both."
    }
  ],

  /* ---------------- developer ---------------- */
  "qr-code-generator": [
    {
      question: "What error correction level should I choose?",
      answer:
        "Higher levels (Q or H) let a scanner recover the code even when up to roughly 25–30% is damaged or covered — useful for print. Level L packs in more data but scans less forgivingly."
    }
  ],
  "url-encoder-decoder": [
    {
      question: "How do I encode a URL query parameter safely?",
      answer:
        "Paste the value into the encoder and it percent-encodes reserved characters like &, =, spaces, and non-ASCII bytes, producing a value that survives being embedded in a query string."
    },
    {
      question: "Why does my decoded text still contain %20 fragments?",
      answer:
        "Double-encoded input is the usual culprit — a literal '%2520' decodes once to '%20'. Decode the string repeatedly until no percent-escapes remain."
    },
    {
      question: "Does encoding preserve emoji and accented characters?",
      answer:
        "Yes. Text is converted to UTF-8 bytes first, so multi-byte characters round-trip correctly through both encode and decode."
    }
  ],
  "html-entity-encoder": [
    {
      question: "Which characters get encoded?",
      answer:
        "Characters with special meaning in HTML — angle brackets, ampersands, quotes, and similar — become named or numeric entities (&lt;, &amp;, &quot;) so they display literally instead of being parsed as markup."
    },
    {
      question: "When should I HTML-encode user-generated content?",
      answer:
        "Before inserting it into any HTML context: page bodies, attribute values rendered as HTML, or comment systems. Encoding neutralizes injected script tags, which is the core defense against reflected XSS."
    },
    {
      question: "Can I decode entities back to plain characters?",
      answer:
        "Yes — the tool works both directions, converting entity-laden text back to readable characters for auditing emails, CMS exports, or scraped content."
    }
  ],
  "slug-generator": [
    {
      question: "How do I turn a title into an SEO-friendly slug?",
      answer:
        "Type or paste your headline and the generator lowercases it, strips punctuation, replaces spaces with hyphens, and trims stray separators — ready to paste into a CMS URL field."
    },
    {
      question: "Does it handle accented and non-Latin characters?",
      answer:
        "Accented Latin letters are transliterated to their base forms (é becomes e). Other scripts are handled according to the selected separator and cleanup rules so the result stays URL-safe."
    },
    {
      question: "How long should a URL slug be?",
      answer:
        "Shorter is generally better for readability in search results — aim for a few descriptive words rather than the full headline, dropping filler words when they add nothing."
    }
  ],
  "seo-meta-generator": [
    {
      question: "Which meta tags does this generate?",
      answer:
        "A complete head snippet: title, description, keywords, canonical, robots, author, language, viewport, charset, and theme color — produced as copyable HTML with a live SERP snippet preview."
    },
    {
      question: "How does the SERP preview help me?",
      answer:
        "It renders your title and description the way search results typically display them, on desktop or mobile proportions, so you can spot truncation before publishing."
    },
    {
      question: "Can I edit the tags after generating them?",
      answer:
        "Yes — tweak any field and the markup plus preview regenerate instantly. Copy the final block into your page's <head> when you're satisfied."
    }
  ],
  "og-meta-generator": [
    {
      question: "What Open Graph properties are produced?",
      answer:
        "og:title, og:description, og:type, og:url, and og:image along with image dimensions, giving social platforms and chat apps everything needed to build a rich link preview card."
    },
    {
      question: "Why isn't my og:image showing when I share a link?",
      answer:
        "The image URL must be absolute, publicly reachable, and reasonably sized. Also note platforms cache previews aggressively — after fixing tags, request a refresh from the platform's debugger."
    },
    {
      question: "Do I still need Twitter Card tags if I have Open Graph?",
      answer:
        "Twitter/X falls back to Open Graph tags in many cases, but adding twitter:card gives you explicit control over the summary layout. Generate those with the Twitter Card tool next door."
    }
  ],

  /* ---------------- security pack ---------------- */
  "uuid-generator": [
    {
      question: "Which UUID versions can I generate?",
      answer:
        "Version 1 (timestamp-based), version 4 (random), and version 7 (time-ordered) following RFC 4122/9562, selectable before generation."
    },
    {
      question: "Where are UUIDs suitable as primary keys?",
      answer:
        "Random v4 IDs avoid coordination between services and v7's time ordering makes them friendlier for database index locality — both are generated locally with your browser's cryptographic random source."
    },
    {
      question: "Could someone guess a UUID I generated here?",
      answer:
        "For v4 the random portion spans 122 bits sourced from crypto-grade randomness, so predicting a specific value is not practically feasible."
    }
  ],
  "jwt-decoder": [
    {
      question: "How do I decode a JWT without verifying it?",
      answer:
        "Paste the token and the header and payload segments are Base64Url-decoded instantly, showing algorithm, issued times, and claims in readable form — all locally, nothing sent anywhere."
    },
    {
      question: "Why is my JWT signature called 'invalid'?",
      answer:
        "Signature checking requires the secret or public key that signed the token. Without it, you can still read the claims — validity simply can't be confirmed."
    },
    {
      question: "What do the standard claims mean?",
      answer:
        "exp is the expiry time, iat the issue time, iss the issuer, sub the subject, and aud the intended audience — decoded as readable timestamps where applicable so expired tokens are obvious."
    }
  ],
  "password-generator": [
    {
      question: "How do I generate a strong random password?",
      answer:
        "Set a length of 16 or more and include upper case, lower case, numbers, and symbols. Generation uses your browser's cryptographic random source, and nothing is transmitted or stored."
    },
    {
      question: "What do the 'exclude similar' and 'exclude ambiguous' options do?",
      answer:
        "They remove look-alike characters (like l, 1, I, O, 0) and hard-to-type symbol clusters from the pool, producing passwords that survive manual transcription."
    },
    {
      question: "Are generated passwords stored anywhere?",
      answer:
        "No. Passwords exist only in the page until you copy them; refreshing loses them by design because nothing is logged or uploaded."
    }
  ],
  "password-strength-checker": [
    {
      question: "How is password strength calculated?",
      answer:
        "The checker estimates entropy from length and character variety and flags common patterns such as dictionary words or sequences, expressing the result as estimated bits and time-to-crack context."
    },
    {
      question: "Is my tested password safe to type here?",
      answer:
        "Yes — analysis runs entirely in your browser. The value is never sent to a server or written to storage, though the usual advice applies: don't reuse production passwords anywhere for testing."
    },
    {
      question: "Why does 'P@ssw0rd!' score poorly despite symbols?",
      answer:
        "Substitutions like @ for a are well-known patterns attackers try first. Entropy comes from genuine unpredictability and length, not just symbol presence."
    }
  ],
  "hash-generator": [
    {
      question: "Which hash algorithms are supported?",
      answer:
        "SHA-1, SHA-256, SHA-384, and SHA-512 via your browser's native WebCrypto engine — no libraries, no network calls, and digests appear as soon as you type or drop a file."
    },
    {
      question: "Can I hash a file instead of text?",
      answer:
        "Yes. Load a file and its digest is computed locally, which is handy for verifying downloads match a published checksum before trusting them."
    },
    {
      question: "Which algorithm should I pick for integrity checks?",
      answer:
        "SHA-256 is the current general-purpose default. SHA-1 remains available for legacy verification only and shouldn't be used where collision resistance matters."
    }
  ],
  "regex-tester": [
    {
      question: "How do I test a regular expression against sample text?",
      answer:
        "Enter your pattern with flags, paste sample text below it, and matches highlight in place with capture groups broken out so you can confirm behavior before shipping the pattern."
    },
    {
      question: "Which flags are supported?",
      answer:
        "The common JavaScript flags including global, ignore-case, multiline, dotall, and unicode — toggle them alongside the pattern just as you would in code."
    },
    {
      question: "Why do I only see the first match?",
      answer:
        "Without the global flag JavaScript matching stops after one hit. Enable the g flag to walk every occurrence in the sample text."
    }
  ],
  "unix-timestamp-converter": [
    {
      question: "How do I convert a Unix timestamp to a readable date?",
      answer:
        "Enter the number — seconds or milliseconds are auto-detected — and the equivalent local and UTC date-times render immediately, updating live as you type."
    },
    {
      question: "Does the converter handle milliseconds?",
      answer:
        "Yes. Values long enough to be millisecond-based are treated accordingly, avoiding the classic 10-vs-13-digit mistake that shifts dates by millennia."
    },
    {
      question: "What is the Y2K38 problem I see mentioned with timestamps?",
      answer:
        "Signed 32-bit second counters overflow in January 2038. Modern 64-bit systems avoid it, but it matters for legacy formats — worth knowing when storing timestamps."
    }
  ],
  "cron-expression-builder": [
    {
      question: "How do I build a cron expression visually?",
      answer:
        "Pick minute, hour, day-of-month, month, and day-of-week values and the five-field expression assembles itself, shown alongside a plain-language description of the resulting schedule."
    },
    {
      question: "Can I check what an existing cron string means?",
      answer:
        "Yes — paste the expression and it renders back as a human-readable sentence, which is the fastest way to audit unfamiliar schedules in crontabs or CI configs."
    },
    {
      question: "Do special strings like @daily work here?",
      answer:
        "Standard five-field expressions are the core format; aliases such as @daily map to 0 0 * * *, which you can enter and expand explicitly."
    }
  ],
  "text-diff-checker": [
    {
      question: "How do I compare two blocks of text?",
      answer:
        "Paste the original on one side and the changed version on the other. Added, removed, and modified lines are highlighted inline so edits pop out immediately."
    },
    {
      question: "Can I diff configuration files or code snippets?",
      answer:
        "Yes — anything pasted as lines of text works: env files, YAML, JSON, source excerpts, or prose drafts."
    },
    {
      question: "Is either text uploaded during comparison?",
      answer:
        "No. Both panels are compared in local memory only, so contract text, credentials in configs, or unpublished drafts stay on your machine."
    }
  ],
  "json-schema-validator": [
    {
      question: "How do I validate data against a JSON Schema?",
      answer:
        "Provide the schema in one input and the instance document in the other. Validation errors list the failing property paths so you can fix data or tighten the schema precisely."
    },
    {
      question: "Which schema keywords are supported?",
      answer:
        "Core validation keywords such as type, required, properties, enum, minimum/maximum, minLength/maxLength, pattern, and nested object/array composition are enforced during checking."
    },
    {
      question: "Why validate schemas at all when JSON parses fine?",
      answer:
        "Parsing confirms syntax; schema validation confirms structure and constraints — catching missing fields or wrong types before they reach production consumers."
    }
  ],
  "jsonpath-tester": [
    {
      question: "How do I write a JSONPath query?",
      answer:
        "Use dot notation for child members ($.store.book[0].title) or bracket notation with wildcards and filters for deeper selections, then run it against your pasted document."
    },
    {
      question: "What queries is this useful for?",
      answer:
        "Pulling specific fields out of large API responses, smoke-testing selectors before wiring them into code, and teaching JSONPath syntax with instant feedback."
    },
    {
      question: "Does the tester support recursive descent?",
      answer:
        "Yes — the .. operator searches every nesting level for a member name, which is the quickest way to collect all occurrences of a repeated key."
    }
  ],
  "csv-json-converter": [
    {
      question: "How do I convert CSV to JSON?",
      answer:
        "Paste CSV text or upload a file, confirm header detection, and receive a JSON array of objects keyed by your column names — downloadable or copyable in place."
    },
    {
      question: "How are numbers and booleans typed in the output?",
      answer:
        "Recognized numeric and boolean values are emitted as native JSON types rather than strings, so downstream parsing behaves predictably."
    },
    {
      question: "Will quoted fields containing commas survive conversion?",
      answer:
        "Yes. Standard CSV quoting rules are respected, so fields like \"Smith, John\" remain single values through both directions of conversion."
    }
  ],
  "xml-json-converter": [
    {
      question: "How do I convert XML to JSON?",
      answer:
        "Paste your XML and it parses into a JSON structure preserving element nesting and attributes, ready to copy or download for APIs that expect JSON payloads."
    },
    {
      question: "What happens to XML attributes?",
      answer:
        "Attributes are carried into the JSON representation under dedicated keys so they remain distinguishable from child-element content after conversion."
    },
    {
      question: "Is malformed XML handled gracefully?",
      answer:
        "Yes — parse errors are reported with location context instead of crashing, so you can fix the document and retry."
    }
  ],
  "sql-formatter": [
    {
      question: "How do I format a minified SQL query?",
      answer:
        "Paste the compressed statement and the formatter lays out clauses, joins, and conditions with consistent indentation and keyword casing so the logic becomes scannable."
    },
    {
      question: "Are complex queries with JOINs and subqueries supported?",
      answer:
        "Yes — multi-line joins, nested selects, and CASE expressions are indented hierarchically, which is exactly where formatting helps most when debugging slow queries."
    },
    {
      question: "Is my SQL with table names sent anywhere?",
      answer:
        "No. Formatting runs locally, so internal schema names, column conventions, or embedded literals never leave the browser tab."
    }
  ],
  "yaml-formatter": [
    {
      question: "How do I clean up inconsistent YAML indentation?",
      answer:
        "Paste the YAML and the formatter re-emits it with uniform indentation and normalized spacing, catching the tab/space mixups that break most parsers."
    },
    {
      question: "Can it validate YAML before I deploy a config?",
      answer:
        "Yes — syntax errors report with position context, letting you fix Kubernetes manifests, CI pipelines, or compose files before they fail at runtime."
    },
    {
      question: "Does it handle anchors and multi-line strings?",
      answer:
        "Common constructs including block scalars, quoted strings, comments, and anchors are parsed and preserved in the formatted output."
    }
  ],
  "http-status-code-lookup": [
    {
      question: "How do I look up what a status code means?",
      answer:
        "Enter the code (or browse by class) to see its official meaning, typical causes, and what usually needs to change on the client or server to resolve it."
    },
    {
      question: "What is the difference between a 401 and a 403?",
      answer:
        "401 means unauthenticated — credentials are missing or invalid; 403 means authenticated but forbidden — the server refuses the action even with valid identity."
    },
    {
      question: "Are 4xx errors always the client's fault?",
      answer:
        "Not always — they indicate the request failed as sent, but misconfigured servers, wrong CORS setups, or outdated clients commonly cause them too."
    }
  ],
  "mime-type-lookup": [
    {
      question: "How do I find the MIME type for a file extension?",
      answer:
        "Type the extension (.pdf, .webp, .docx …) to get the correct Content-Type header value, or search the other direction from a MIME type to common extensions."
    },
    {
      question: "Why do servers need correct MIME types?",
      answer:
        "Browsers decide how to process a response largely from its Content-Type. Wrong types break font loading, block stylesheets under nosniff policies, and trigger download-instead-of-display behavior."
    },
    {
      question: "What MIME type should JSON responses use?",
      answer:
        "application/json — the lookup covers it plus hundreds of others including web fonts, media containers, and office document formats."
    }
  ],
  "url-parser": [
    {
      question: "How do I break a URL into its parts?",
      answer:
        "Paste any absolute URL and the parser splits protocol, host, port, path segments, query parameters, and fragment, listing each query parameter decoded for easy reading."
    },
    {
      question: "Can I debug tracking parameters with this?",
      answer:
        "Yes — UTM parameters and other query values appear name-by-name with decoded values, making campaign-tag audits quick before sharing links."
    },
    {
      question: "Does it handle unusual ports or encoded characters?",
      answer:
        "Yes. Non-standard ports are reported explicitly and percent-encoded segments are shown both raw and decoded so nothing hides in the string."
    }
  ],

/* ---------------- image studio ---------------- */
  "image-metadata-remover": [
    {
      question: "How does EXIF stripping work?",
      answer:
        "The image is redrawn to a fresh canvas and re-exported, which drops EXIF blocks — GPS coordinates, camera model, timestamps — while keeping the visible pixels intact."
    },
    {
      question: "Will removing metadata reduce image quality?",
      answer:
        "Pixel data is preserved; depending on the chosen output format the file may be re-encoded, so check the quality setting if fidelity matters."
    },
    {
      question: "Why should I strip metadata before posting photos?",
      answer:
        "EXIF often embeds precise GPS location and device details. Removing it prevents viewers of the published file from harvesting that history."
    }
  ],
  "image-resizer": [
    {
      question: "How do I resize an image to exact pixel dimensions?",
      answer:
        "Upload the image, enter the target width and height (or a percentage), optionally lock the aspect ratio, and download the resampled result."
    },
    {
      question: "Will resizing make my photo look stretched?",
      answer:
        "Not if aspect-ratio locking stays enabled — changing one dimension scales the other proportionally, preventing distortion."
    },
    {
      question: "What's the best way to shrink photos for a website?",
      answer:
        "Resize to the largest display size actually needed, then convert the result to an efficient format like WebP with the WebP Converter — the combination yields far smaller files than resizing alone."
    }
  ],
  "image-cropper": [
    {
      question: "How do I crop an image to a specific region?",
      answer:
        "Drag the crop handles over the preview to frame the region you want, optionally constrain to a preset ratio, then apply and download the cropped image."
    },
    {
      question: "Can I crop to fixed ratios like 1:1 or 16:9?",
      answer:
        "Yes — preset aspect constraints keep the selection locked to squares, widescreen frames, or portrait ratios, which suits avatars and social posts."
    },
    {
      question: "Does cropping lose the part of the image outside the selection?",
      answer:
        "The exported file contains only the selection, but your original upload remains untouched in the editor until you replace it."
    }
  ],
  "image-converter": [
    {
      question: "Which formats can I convert between?",
      answer:
        "JPEG, PNG, WebP, and related browser-supported formats via the converter variants: dedicated WebP, PNG/JPG, HEIC, and SVG tools share this engine."
    },
    {
      question: "How does batch conversion work?",
      answer:
        "Queue multiple files, choose one output format, and convert them in a single pass — each file downloads separately with its new extension."
    },
    {
      question: "Does converting PNG to JPG lose transparency?",
      answer:
        "Yes — JPEG has no alpha channel, so transparent areas are flattened onto the background color you configure before export."
    }
  ],
  "webp-converter": [
    {
      question: "How do I convert images to WebP?",
      answer:
        "Add JPG or PNG files, pick WebP output with your preferred quality level, and convert — the smaller WebP files download immediately, processed entirely in-browser."
    },
    {
      question: "Can I convert WebP back to JPG or PNG?",
      answer:
        "Yes, the same tool handles the reverse direction, which helps with older software that doesn't accept WebP uploads."
    },
    {
      question: "How much smaller is WebP than JPEG?",
      answer:
        "For comparable visual quality WebP commonly lands noticeably smaller than JPEG — exact savings vary per image, so compare the output sizes yourself after converting."
    }
  ],
  "png-jpg-converter": [
    {
      question: "How do I turn a PNG into a JPG?",
      answer:
        "Drop the PNG in, choose JPG output and quality, then convert and download. Transparent regions are flattened onto your chosen background color."
    },
    {
      question: "When should I keep PNG instead of converting?",
      answer:
        "Keep PNG when transparency or razor-sharp flat graphics matter — screenshots, logos, UI elements — since JPG compression smears sharp edges and discards alpha."
    },
    {
      question: "Is conversion done on a server?",
      answer:
        "No. Files are decoded and re-encoded by your own browser; nothing is uploaded."
    }
  ],
  "heic-jpg-converter": [
    {
      question: "Why can't I open HEIC photos directly in my browser?",
      answer:
        "HEIC is Apple's default iPhone camera format and many platforms lack native decode support — this tool decodes the file locally and hands you a universal JPG."
    },
    {
      question: "How do I convert iPhone HEIC photos to JPG?",
      answer:
        "Transfer or pick the .heic files, convert, and download standards-friendly JPGs that upload anywhere — email, web forms, Windows, and Android included."
    },
    {
      question: "Do my original iPhone photos change?",
      answer:
        "No. Conversion produces new JPG copies; the originals stay untouched on your device."
    }
  ],
  "svg-converter": [
    {
      question: "How do I convert SVG to PNG or JPG?",
      answer:
        "Load the SVG file, choose raster output and resolution, and render — vectors are rasterized locally at the scale you pick, so output stays crisp at larger sizes."
    },
    {
      question: "Why would I rasterize an SVG at all?",
      answer:
        "Some platforms (certain email clients, thumbnailers, marketplaces) reject SVG uploads; exporting PNG/JPG sidesteps their restrictions."
    },
    {
      question: "Are animations or external references inside SVG supported?",
      answer:
        "Static shapes, paths, fills, and inline styles render reliably; SMIL animations and externally referenced assets fall outside static rasterization."
    }
  ],
  "image-watermark": [
    {
      question: "How do I watermark several photos at once?",
      answer:
        "Queue your images, set the watermark text with its opacity, position, and styling once, then apply across the whole batch and download the stamped copies."
    },
    {
      question: "How transparent should a watermark be?",
      answer:
        "For protection without ruining viewing, semi-transparent placement near a corner or center works well — dial opacity until the mark reads clearly but content stays dominant."
    },
    {
      question: "Is watermarking lossless?",
      answer:
        "Watermarked output is re-encoded, so pick PNG for maximum fidelity or adjust the JPEG/WebP quality slider to balance size and clarity."
    }
  ],
  "image-blur-pixelate": [
    {
      question: "How do I blur part of a screenshot?",
      answer:
        "Upload the screenshot, brush over the sensitive area, and the region is blurred or pixelated on the canvas — adjust brush size and intensity until nothing is legible, then export."
    },
    {
      question: "Blur or pixelate — which hides information better?",
      answer:
        "Strong pixelation destroys detail deterministically; heavy blur applied repeatedly does too. For faces, plates, and credentials, verify the result at full zoom before sharing."
    },
    {
      question: "Is the censoring permanent in the exported file?",
      answer:
        "Yes — pixels are rewritten on the canvas before download, so the exported image carries no recoverable original underneath."
    }
  ],
  "passport-photo-maker": [
    {
      question: "How do I make a passport-style photo sheet?",
      answer:
        "Upload a portrait, align it to the face guides for your chosen country preset, then generate a printable sheet with multiple copies laid out at the official dimensions."
    },
    {
      question: "Which country photo sizes are included?",
      answer:
        "Common presets such as US 2×2 inch, European 35×45 mm, and other frequent document sizes ship built-in — pick yours before aligning so the guides match the requirement."
    },
    {
      question: "Will an agency accept a printed sheet from this tool?",
      answer:
        "The sheet matches the dimensional specs of the chosen preset, but acceptance always depends on the agency's own rules about lighting, background, and recency — check their guidance and print at actual size on quality photo paper."
    }
  ],
  "image-upscaler": [
    {
      question: "How does upscaling work without AI?",
      answer:
        "The tool resamples your image to 2× or 4× dimensions using smooth interpolation, with optional sharpening and noise reduction passes to keep enlarged output looking clean."
    },
    {
      question: "Can upscaling add real detail to a tiny image?",
      answer:
        "No resampler can invent true detail that was never captured — expect smoother, cleaner enlargement, not recovered fine texture. Sharpening helps perceived crispness."
    },
    {
      question: "Which source images upscale best?",
      answer:
        "Sharp, well-lit originals at modest enlargement factors give the cleanest results; very small or heavily compressed sources magnify their artifacts."
    }
  ],
  "signature-maker": [
    {
      question: "How do I create a digital signature image?",
      answer:
        "Draw your signature with a finger, stylus, or mouse on the canvas, adjust stroke width and color, then download a transparent PNG ready to place into documents."
    },
    {
      question: "Is my drawn signature uploaded or saved?",
      answer:
        "No. Strokes stay in page memory; closing or refreshing clears the canvas because nothing is transmitted or persisted."
    },
    {
      question: "Can I use this signature as a legal e-signature?",
      answer:
        "The exported image is a picture of your signature — whether that satisfies a given transaction depends on the recipient and jurisdiction's e-signature rules, so confirm requirements before relying on it."
    }
  ],

  /* ---------------- Media studio (video tools) ---------------- */
  "video-audio-extractor": [
    {
      question: "Can I extract audio from any video format?",
      answer:
        "Any container your browser can decode — typically MP4, WebM, and similar formats — works. The audio track is decoded locally by your browser's audio pipeline and written to a WAV file."
    }
  ],
  "video-compressor": [
    {
      question: "How small can my video get?",
      answer:
        "That depends on the source bitrate and where you set the slider: the estimated output size updates as you drop the bitrate, and the verified result shows the real savings before you download."
    }
  ],
  "video-resizer": [
    {
      question: "Can I control height instead of width?",
      answer:
        "The resizer is width-first — you pick a width and the height follows from the source's aspect ratio so the frame is never distorted. Picking a custom width is effectively setting a custom size."
    },
    {
      question: "What format is the resized video?",
      answer:
        "Output is WebM by default, and MP4 when the browser's MediaRecorder reports support for it. The frames are re-encoded on a canvas at the chosen dimensions."
    }
  ],
  "video-trimmer": [
    {
      question: "Can I trim to an exact frame?",
      answer:
        "Ranges are set in whole-second ticks, so trimming is second-accurate rather than frame-exact. For frame-perfect cuts you'd need a full desktop editor."
    },
    {
      question: "Does trimming reduce quality?",
      answer:
        "The segment is re-encoded by the browser's recorder, so it's a new file at the recorded quality — it's a re-encode, not a lossless stream copy."
    }
  ],
  "video-converter": [
    {
      question: "Which formats can I convert to?",
      answer:
        "WebM (always available) and MP4 only when your browser's MediaRecorder reports MP4 support. The list is deliberately limited to containers your device can actually encode."
    },
    {
      question: "Is converting lossless?",
      answer:
        "No. The converter re-encodes the frames and audio rather than remuxing, so quality and file size follow the encoder the browser uses."
    }
  ],
  "video-to-gif": [
    {
      question: "How large can my GIF be?",
      answer:
        "There's no hard cap, but size grows with frame rate × range × width, and GIF's 256-color palette makes long film-like clips heavy — short, lower-FPS segments give the best results."
    },
    {
      question: "Will my GIF loop?",
      answer:
        "Yes — animated GIFs loop by default, so the exported file plays in a loop wherever it's embedded."
    }
  ],
  "photos-to-video": [
    {
      question: "Which image formats are supported?",
      answer:
        "Any image your browser can render — PNG, JPG, WebP, GIF and similar. Each photo is drawn to a canvas at the output size in sequence."
    },
    {
      question: "Can each photo stay on screen for a different duration?",
      answer:
        "Not per-photo yet — a single 'seconds per image' setting applies to every photo for an even rhythm. Per-image timing is a possible future addition."
    }
  ],
  "video-downloader": [
    {
      question: "Should I paste the file link or the page link?",
      answer:
        "Paste the direct file URL — the one that starts a download when opened in a new tab. A page link is HTML, which can't be saved as media; the tool reports this honestly rather than pretending."
    }
  ],

  /* ---------------- Exam studio ---------------- */
  "exam-file-requirements": [
    {
      question: "Can I handle an exam that isn't listed?",
      answer:
        "Yes. Use the custom option in the fixer to enter the width, height, and file size your portal requires — the tool sizes your file to fit those values."
    }
  ],

  /* ---------------- Media studio ---------------- */
  "add-music-to-photo": [
    {
      question: "What image formats can I upload?",
      answer:
        "JPG, JPEG, PNG, and WebP. Any format your browser can render works."
    },
    {
      question: "What audio formats are supported?",
      answer:
        "MP3, WAV, M4A, AAC, OGG, and FLAC — any format the browser's audio element can decode."
    },
    {
      question: "Can I add multiple photos?",
      answer:
        "This tool combines one image with one audio track. For multiple photos, use the Photos to Video tool first."
    },
    {
      question: "Is the output a real video file?",
      answer:
        "Yes. The tool records a real video stream using MediaRecorder. The container is WebM (always) or MP4 (where the browser supports it)."
    },
    {
      question: "Does the tool work on mobile?",
      answer:
        "Yes. The tool works on mobile browsers. Large files may take longer to encode on phones."
    }
  ]
};
