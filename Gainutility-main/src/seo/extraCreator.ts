/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SEO entries for Creator Studio (YouTube) tools not covered by
 * src/data.ts.
 */

import { ToolId } from "../types";
import { ToolSeoEntry } from "./toolSeoExtra";

const LOCAL =
  "Everything runs locally in your browser. Your input and files are never uploaded to a server.";

export const CREATOR_SEO: Partial<Record<ToolId, ToolSeoEntry>> = {
  "youtube-thumbnail-preview": {
    title: "YouTube Thumbnail Preview — Test Before You Publish",
    description:
      "Preview YouTube thumbnails across desktop, mobile, TV, and search feeds before publishing. Catch unreadable designs instantly — free.",
    intro:
      "Your thumbnail looks great full-size — but how does it read in a crowded sidebar on a phone? Preview every real placement before you commit.",
    steps: [
      "Upload your thumbnail image (1280×720 recommended).",
      "Toggle between search results, home feed, sidebar, and TV placements.",
      "Check readability at each size.",
      "Iterate until it pops everywhere."
    ],
    whatText:
      "Renders your uploaded image inside faithful simulations of YouTube's actual UI surfaces — search grid, home feed, watch-page sidebar, and living-room TV — at their true relative scales.",
    whyText:
      "Most views arrive through small placements. Designs that only work at full resolution waste impressions; testing at realistic sizes is how top channels iterate thumbnails.",
    features: [
      "Search, home, sidebar, and TV preview modes",
      "True-to-scale rendering of each surface",
      "Instant swap between test images",
      "Zero uploads — previewed locally",
      "Completely free"
    ],
    faqs: [
      {
        question: "How do I preview my YouTube thumbnail?",
        answer:
          "Upload the image here and click through each placement simulation to see exactly how viewers will encounter it."
      },
      {
        question: "What size should YouTube thumbnails be?",
        answer:
          "1280×720 pixels, under 2MB, in JPG/PNG — the standard 16:9 that renders across all surfaces."
      },
      {
        question: "Why does my thumbnail look different on mobile?",
        answer:
          "Mobile crops tighter and displays smaller; text under ~24pt equivalent becomes illegible — preview to verify."
      },
      {
        question: "Is my thumbnail uploaded anywhere?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["thumbnail-safe-zone", "youtube-title-analyzer", "image-resizer", "social-resizer"],
    privacyExplanation: LOCAL
  },
  "youtube-title-analyzer": {
    title: "YouTube Title Analyzer — Optimize Video Titles",
    description:
      "Analyze video titles for length, power words, emoji use, and mobile truncation risk. Score titles before publishing — free tool.",
    intro:
      "Titles decide clicks. Get instant feedback on character limits, truncation points, emotional triggers, and formatting best practices.",
    steps: [
      "Type or paste your draft title.",
      "Review length meter against desktop/mobile truncation bounds.",
      "Check power-word and capitalization analysis.",
      "Refine until every signal is green."
    ],
    whatText:
      "Evaluates structural qualities: pixel-length versus known truncation thresholds, front-loaded keyword position, ALL-CAPS ratio, number usage, and recognized emotional trigger vocabulary.",
    whyText:
      "YouTube cuts titles around 70 characters on desktop and far less on mobile feeds. Titles that survive truncation with hooks intact win measurably more impressions-to-clicks.",
    features: [
      "Desktop and mobile truncation meters",
      "Power word detection",
      "Capitalization balance scoring",
      "Front-loading guidance for keywords",
      "Emoji impact assessment"
    ],
    faqs: [
      {
        question: "How long can YouTube titles be?",
        answer:
          "Technically 100 characters, but visible space ends near 60–70 on most screens — aim for hooks inside 50."
      },
      {
        question: "Do emojis help YouTube titles?",
        answer:
          "Sparingly — one relevant emoji draws the eye; stacks look spammy and may hurt perceived credibility."
      },
      {
        question: "Is ALL CAPS bad for titles?",
        answer:
          "Full caps reads as shouting; strategic single-word caps emphasize without triggering viewer fatigue."
      },
      {
        question: "Does this analyze my published videos?",
        answer:
          "It analyzes any title text you paste — no channel connection needed, fully private."
      }
    ],
    related: ["youtube-thumbnail-preview", "youtube-description-formatter", "youtube-keyword-explorer", "pdf-to-text"],
    privacyExplanation: LOCAL
  },
  "youtube-timestamp-formatter": {
    title: "YouTube Timestamp Formatter — Clean Chapter Timestamps",
    description:
      "Sort, pad, and validate video timestamps into YouTube-compliant formatting automatically. Paste-ready output, free and instant.",
    intro:
      "Turn messy timestamp notes into perfectly formatted chapter lists YouTube recognizes — sorted, zero-padded, and validated.",
    steps: [
      "Paste your raw timestamps.",
      "The formatter sorts them chronologically and normalizes format.",
      "Fix any flagged issues like duplicates or out-of-range times.",
      "Copy the clean list into your description."
    ],
    whatText:
      "Parses mixed formats (1:23, 01:23:45), enforces chronological ordering, pads segments consistently, and validates YouTube's chapter requirements.",
    whyText:
      "Chapters only activate when timestamps follow strict rules — first must be 00:00, ascending order, valid ranges. Manual fixing invites silent failures.",
    features: [
      "Auto-sorting of out-of-order entries",
      "Consistent segment padding (m:ss / h:mm:ss)",
      "Duplicate and gap validation",
      "Bulk paste processing",
      "One-click copy output"
    ],
    faqs: [
      {
        question: "What format do YouTube chapters require?",
        answer:
          "Each line starts with a timestamp (first line must be 00:00), ascending order, minimum three chapters total."
      },
      {
        question: "Why aren't my chapters showing up?",
        answer:
          "Commonly: missing 00:00 start, timestamps out of order, fewer than three entries, or timestamps placed after non-timestamp text lines."
      },
      {
        question: "Can I add labels to timestamps?",
        answer:
          "Yes — text following each timestamp becomes the clickable chapter name shown in the player."
      },
      {
        question: "Does this need my video link?",
        answer: "No — pure text processing happens locally with nothing uploaded."
      }
    ],
    related: ["youtube-chapter-generator", "youtube-description-formatter", "youtube-title-analyzer", "unix-timestamp-converter"],
    privacyExplanation: LOCAL
  },
  "youtube-chapter-generator": {
    title: "YouTube Chapter Generator — Build Video Chapters Visually",
    description:
      "Create YouTube chapters with visual timeline previews showing proportional segments. Interactive builder, export-ready lists.",
    intro:
      "See your video's structure as you build it. Drag-free interface maps chapters onto a visual track so pacing gaps jump out immediately.",
    steps: [
      "Enter your video's total duration.",
      "Add chapters with names and start times.",
      "Watch segments render proportionally on the visual track.",
      "Export the formatted chapter list for your description."
    ],
    whatText:
      "Each chapter occupies its proportional slice of an interactive timeline bar, giving immediate feedback on balance — plus generated description-ready output meeting YouTube specs.",
    whyText:
      "Well-paced chapters boost watch time by letting viewers navigate confidently; unbalanced or sparse chaptering frustrates navigation and hurts retention signals.",
    features: [
      "Proportional visual timeline track",
      "Live segment recoloring as you edit",
      "Duration-gap warnings",
      "YouTube-spec compliant export",
      "Fully interactive local builder"
    ],
    faqs: [
      {
        question: "How many chapters should a YouTube video have?",
        answer:
          "Rule of thumb: one per major topic shift — typically 5–12 for standard tutorials; long podcasts benefit from more granular splits."
      },
      {
        question: "Do YouTube chapters help SEO?",
        answer:
          "Yes — chapter titles become searchable key moments in Google video results, multiplying entry points to your content."
      },
      {
        question: "Can I generate chapters automatically?",
        answer:
          "You supply the topic breaks and times; the generator handles formatting, ordering, and visual validation."
      },
      {
        question: "Where do I paste generated chapters?",
        answer: "Into the first comment or top of your video description, starting with the required 00:00 entry."
      }
    ],
    related: ["youtube-timestamp-formatter", "youtube-description-formatter", "youtube-keyword-explorer", "youtube-title-analyzer"],
    privacyExplanation: LOCAL
  },
  "youtube-embed-generator": {
    title: "YouTube Embed Code Generator — Responsive Iframes",
    description:
      "Generate custom responsive YouTube embed code with loop, mute, autoplay, and privacy mode toggles. Copy-paste iframe snippets free.",
    intro:
      "Build the exact embed behavior you want — responsive sizing, looping, muted autoplay, privacy-enhanced mode — without touching raw parameters.",
    steps: [
      "Paste any YouTube URL or video ID.",
      "Toggle options: loop, mute, autoplay, controls, privacy mode.",
      "Preview the embedded result live.",
      "Copy the generated iframe code."
    ],
    whatText:
      "Assembles youtube-nocookie.com iframes with correctly encoded parameter strings for each selected behavior, wrapped in responsive container markup.",
    whyText:
      "Hand-written embeds break easily — wrong parameter syntax silently disables features. Generated code works first try and loads GDPR-friendlier nocookie variants by default.",
    features: [
      "Accepts full URLs or bare IDs",
      "Loop, mute, autoplay, controls toggles",
      "Privacy-enhanced nocookie domain",
      "Responsive wrapper included",
      "Live preview pane"
    ],
    faqs: [
      {
        question: "How do I embed a YouTube video responsively?",
        answer:
          "Use the generated snippet — it wraps the iframe in aspect-ratio CSS keeping 16:9 proportions at any width."
      },
      {
        question: "What is youtube-nocookie.com?",
        answer:
          "Privacy-enhanced embedding that sets cookies only when the visitor actually plays the video — recommended for GDPR-conscious sites."
      },
      {
        question: "Why won't my embedded video autoplay?",
        answer:
          "Browsers block unmuted autoplay; enable both mute AND autoplay together for reliable auto-start behavior."
      },
      {
        question: "Can I loop embedded videos?",
        answer: "Yes — toggle loop here and the proper playlist parameter gets appended to make looping actually function."
      }
    ],
    related: ["youtube-url-toolkit", "youtube-thumbnail-preview", "qr-code-generator", "html-entity-encoder"],
    privacyExplanation: LOCAL
  },
  "youtube-url-toolkit": {
    title: "YouTube URL Cleaner & Toolkit — Strip Tracking Params",
    description:
      "Clean YouTube URLs by removing tracking parameters. Extract video, playlist and channel IDs, then get share, embed and Shorts links plus a QR code. All local.",
    intro:
      "Paste any YouTube link — watch, youtu.be, shorts, embed, playlist, channel — and instantly see the video ID, playlist ID, channel ID, timestamp, and a clean canonical URL with tracking stripped. Every detected parameter is shown with an explanation of what it does and whether it was removed or kept.",
    steps: [
      "Paste any format of YouTube URL into the input field.",
      "Review the URL Analysis: tracking parameters (si, feature, UTM) are flagged for removal; functional parameters (list, t, start) are preserved.",
      "Copy the clean canonical URL — the primary result with tracking stripped.",
      "Browse all converted formats: share link, Shorts link, embed link, playlist link, channel link.",
      "Generate and download a QR code for the clean URL.",
    ],
    whatText:
      "Parses all common YouTube URL structures, isolates the underlying identifiers (video ID, playlist ID, channel ID, timestamp), categorizes every query parameter as tracking/functional/unknown with explanations, removes tracking baggage, and reconstructs a minimal canonical form.",
    whyText:
      "Shared YouTube links carry tracking baggage that clutters messages and leaks referral context. Cleaned links are shorter, prettier, privacy-respectful, and preserve functional context like playlists and timestamps.",
    features: [
      "Handles watch, shorts, live, embed, playlist, channel, youtu.be, and bare ID formats",
      "Video ID, playlist ID, channel ID, and timestamp extraction",
      "Tracking parameter detection with explanations (si, feature, UTM, etc.)",
      "Functional parameter preservation (playlist, timestamp, embed options)",
      "Clean canonical URL reconstruction",
      "All converted formats: share, shorts, embed, playlist, channel",
      "QR code generation for clean canonical URL",
      "Instant local parsing — no network requests"
    ],
    faqs: [
      {
        question: "How do I remove tracking from YouTube links?",
        answer:
          "Paste the link here; tracking parameters (si, feature, UTM) are automatically identified and stripped, returning a clean canonical URL."
      },
      {
        question: "What is the ?si= parameter on YouTube links?",
        answer:
          "A share-tracking token identifying where you copied the link from — harmless but unnecessary clutter. The tool removes it automatically."
      },
      {
        question: "What tracking parameters does this remove?",
        answer:
          "Common tracking params: si (share tracking), feature (referral source), utm_source/medium/campaign/term/content (UTM campaign tracking). Functional params like list (playlist), t/start (timestamp), rel, autoplay are preserved."
      },
      {
        question: "Can I extract just the video ID?",
        answer: "Yes — the tool surfaces the bare 11-character video ID separately for API calls or custom embeds."
      },
      {
        question: "Does link parsing happen online?",
        answer: "No — pure string processing in your browser. " + LOCAL
      }
    ],
    related: ["url-encoder-decoder", "youtube-embed-generator", "qr-code-generator", "youtube-keyword-explorer"],
    privacyExplanation: LOCAL
  },
  "thumbnail-safe-zone": {
    title: "Thumbnail Safe Zone Checker — Protect Key Elements",
    description:
      "Overlay safe-area grids on YouTube thumbnails to keep text and logos clear of duration badges and corner overlays. Design with confidence.",
    intro:
      "YouTube covers corners with duration stamps and UI chrome. Verify your branding survives every overlay before uploading.",
    steps: [
      "Upload your thumbnail design.",
      "Toggle overlay guides: duration badge, progress bar, corner elements.",
      "Reposition critical text/logos outside blocked zones.",
      "Download the adjusted design."
    ],
    whatText:
      "Renders known YouTube overlay positions — bottom-right duration badge, hover progress bars, mobile UI elements — atop your image so collisions become obvious pre-upload.",
    whyText:
      "A brilliant callout hidden behind the duration stamp wastes prime thumbnail real estate. Safe-zone checking is standard practice for professional channels.",
    features: [
      "Duration badge zone visualization",
      "Progress-bar overlay guide",
      "Grid divider overlays for composition",
      "Multiple device context toggles",
      "Local-only image handling"
    ],
    faqs: [
      {
        question: "Where is the YouTube duration badge positioned?",
        answer:
          "Bottom-right corner of thumbnails — roughly the lower-right 15% should avoid critical content."
      },
      {
        question: "Do overlays hide parts of my thumbnail permanently?",
        answer:
          "Overlays are viewer-side UI; your file stays intact — but anything beneath them stays invisible while they show."
      },
      {
        question: "Should faces go in specific areas?",
        answer:
          "Center-left bias performs well generally since right side hosts badges; the grid helps you compose deliberately."
      },
      {
        question: "Is my uploaded design stored anywhere?",
        answer: "No. " + LOCAL
      }
    ],
    related: ["youtube-thumbnail-preview", "collage-maker", "image-cropper", "youtube-title-analyzer"],
    privacyExplanation: LOCAL
  },
  "youtube-description-formatter": {
    title: "YouTube Description Formatter — Professional Layouts",
    description:
      "Build structured YouTube descriptions with section headers, credits, CTAs, and links. Template-driven blocks ready to paste.",
    intro:
      "Stop writing walls of text. Compose descriptions with clear sections — about, chapters, links, credits, disclaimers — using proven templates.",
    steps: [
      "Start from a template or blank structure.",
      "Fill each section: intro hook, chapters, social links, gear list.",
      "Preview rendered spacing and dividers.",
      "Copy the complete formatted block."
    ],
    whatText:
      "Assembles your content into consistently structured sections using Unicode-safe dividers, emoji headers where wanted, and logical ordering that scans well collapsed or expanded.",
    whyText:
      "Only the first ~150 characters show before 'more' — structured openings with hooks followed by scannable sections measurably improve link clicks and subscriber conversion.",
    features: [
      "Reusable section templates",
      "Unicode divider library",
      "First-line hook optimization hints",
      "Link block formatting",
      "Character count awareness"
    ],
    limitations: ["Descriptions cap at 5000 characters; very long sections need trimming."],
    faqs: [
      {
        question: "How do I write a good YouTube description?",
        answer:
          "Hook in the first two lines, then structure remaining content into scannable labeled sections with links grouped together."
      },
      {
        question: "How many links should a description contain?",
        answer:
          "Keep primary CTAs to 3–5 above the fold; exhaustive link dumps below the fold work fine for reference material."
      },
      {
        question: "Do keywords in descriptions matter?",
        answer:
          "Moderately — natural keyword inclusion helps topical understanding, but stuffing harms readability and adds little."
      },
      {
        question: "Can I save my template?",
        answer:
          "Templates persist during your session via local storage; nothing transmits to servers."
      }
    ],
    related: ["youtube-chapter-generator", "youtube-title-analyzer", "youtube-keyword-explorer", "slug-generator"],
    privacyExplanation: LOCAL + " Session templates stay in browser storage."
  },
  "youtube-keyword-explorer": {
    title: "YouTube Keyword Explorer — Real Autocomplete Keywords",
    description:
      "Find the actual phrases viewers type into YouTube search. Live autocomplete keywords you can filter, select, and copy for titles, descriptions, and tags.",
    intro:
      "Instead of inventing searches, this tool asks YouTube's autocomplete what viewers really type — in the market you pick — then helps you filter, compare, and turn those real phrases into titles, descriptions, and tag lists.",
    steps: [
      "Enter a seed term for your video topic.",
      "Pick a market (the language/region whose search suggestions you want).",
      "Optionally expand A–Z to surface more keywords and see which ones appear most.",
      "Filter by pattern, compare relative signal, and select the keywords you want.",
      "Copy them as a list, download a CSV, or build a 500-character tag list."
    ],
    whatText:
      "For each search, a Cloudflare proxy asks YouTube's autocomplete for live suggestions using the selected language and region, then folds the seed results and optional A–Z expansions together. Keywords are grouped by textual pattern, ranked by a relative signal based on how early and how often each one surfaced, and output to clipboard or CSV.",
    whyText:
      "YouTube autocomplete reflects phrases people are actually searching. Anchoring your title, description, and tags to those observed phrases keeps you close to real viewer language — without relying on estimated volumes that no tool can honestly report.",
    features: [
      "Live YouTube autocomplete suggestions — real, not estimated",
      "Market selector with language/region targeting",
      "A–Z expansion that shows how often keywords surface",
      "Pattern filters and a transparent relative-signal ranking",
      "Selection, copy, CSV export, and 500-character tag builder"
    ],
    limitations: [
      "Suggests phrases only — no search volumes, difficulty, or ranking estimates are shown",
      "Suggestions are a snapshot at fetch time and can change",
      "Tags are a minor ranking input — titles and thumbnails matter more"
    ],
    faqs: [
      {
        question: "Where does the keyword data come from?",
        answer:
          "Live YouTube autocomplete: for every search the tool asks YouTube's suggest endpoint, through GainUtility's API proxy, using the language and region you selected. The responses are real suggestions seen in YouTube search."
      },
      {
        question: "Do you show the exact search volume for a keyword?",
        answer:
          "No — and that is deliberate. Public search volumes are estimates, and made-up numbers would mislead you. The Relative signal column compares each keyword within your result set using position and how many lists it surfaced in."
      },
      {
        question: "Is my search stored or sent anywhere unexpected?",
        answer:
          "Only the seed term you typed is sent to GainUtility's proxy so it can fetch suggestions from YouTube. Searches and results are not stored, and no account is involved."
      },
      {
        question: "Are tags still important for YouTube?",
        answer:
          "Modestly. Tags help disambiguation and misspellings but carry far less weight than titles, thumbnails, and watch time. The tag builder stays within YouTube's 500-character field."
      }
    ],
    related: ["youtube-title-analyzer", "youtube-description-formatter", "youtube-chapter-generator", "youtube-thumbnail-preview"],
    privacyExplanation:
      "Seeds are sent to GainUtility's API proxy to fetch live YouTube autocomplete suggestions. Searches and results are not stored, and no account or API key is needed."
  }
};
