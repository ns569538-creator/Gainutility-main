/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Library page definitions for the /names and /symbols content hubs and
 * their curated children. Self-contained (no imports) so the sitemap
 * generator can import it directly under Node's native type stripping.
 *
 * Every page is hand-written: unique title, description, H1, intro and FAQ.
 * Child pages point at curated source collections in src/stylishNames/
 * (NAME_LIST_BY_ID / SYMBOL_COLLECTION_BY_ID) by id.
 */

export type LibraryPageKind = "hub" | "list" | "symbols";

export interface LibraryPageEntry {
  /** URL slug (children are prefixed by their hub, e.g. "cute-nicknames"). */
  slug: string;
  /** Canonical path (e.g. "/names/cute-nicknames"). */
  path: string;
  kind: LibraryPageKind;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Which source family the items come from (hubs use it for their CTA copy). */
  sourceType: "names" | "symbols";
  /** Source collection id — absent on hubs (they render children instead). */
  sourceId?: string;
  faq: { question: string; answer: string }[];
  /** Trail ending at this page's own path. */
  breadcrumbs: { name: string; url: string }[];
  related: { label: string; path: string; desc: string }[];
  keywords: string[];
  /** Child cards for hub pages only. */
  children?: { label: string; path: string; desc: string }[];
}

const HOME_CRUMB = { name: "Home", url: "/" };

const TOOL_LINK = {
  label: "Stylish Name Generator",
  path: "/tools/stylish-name-generator",
  desc: "Turn any name into bold, script, bubble and 100+ other Unicode styles — free in your browser.",
};

export const ALL_LIBRARY_PAGES: LibraryPageEntry[] = [
  /* ---------------------------------------------------------------- */
  /* Hubs                                                             */
  /* ---------------------------------------------------------------- */

  {
    slug: "names",
    path: "/names",
    kind: "hub",
    title: "Stylish Names & Nicknames — Curated Lists | GainUtility",
    description:
      "Browse curated lists of stylish girl names, cute nicknames, gaming tags and pet names. Copy any name free, then restyle it in the browser-based generator.",
    h1: "Stylish Names & Nickname Ideas",
    intro:
      "Hand-picked name ideas organized by mood — stylish, cute, aesthetic, gaming-ready — plus pet names for cats and dogs. Every list is curated by hand, not scraped or padded. Found a name you like? Open the free generator to restyle it in bold, script, bubble and other Unicode styles, or wrap it in symbols and emojis.",
    sourceType: "names",
    faq: [
      {
        question: "Are these name lists free to use?",
        answer:
          "Yes. Copy any name you like and use it wherever you want — no sign-up, no fees, and everything runs in your browser.",
      },
      {
        question: "Can I restyle a name from these lists?",
        answer:
          "Open the free Stylish Name Generator, type the name, and try bold, script, small-caps and other Unicode styles — or add symbols and emojis around it.",
      },
      {
        question: "How are these lists put together?",
        answer:
          "Every name is picked by hand and grouped by mood. We don't scrape lists, invent popularity stats, or pad entries with filler.",
      },
    ],
    breadcrumbs: [HOME_CRUMB, { name: "Names", url: "/names" }],
    related: [
      TOOL_LINK,
      { label: "Symbols", path: "/symbols", desc: "Hearts, sparkles and sharp marks you can paste into any name." },
      { label: "Creator Tools", path: "/creator", desc: "Every free browser-based tool for creators on GainUtility." },
    ],
    keywords: ["stylish names", "nickname ideas", "cool name lists", "cute nicknames"],
    children: [
      { label: "Stylish Girl Names", path: "/names/stylish-girl-names", desc: "Names with a confident, put-together feel — strong vowels, clean silhouettes, easy to style." },
      { label: "Cute Girl Names", path: "/names/cute-girl-names", desc: "Short, soft, smile-out-loud names — the kind that look sweet on a profile or a playground." },
      { label: "Aesthetic Girl Names", path: "/names/aesthetic-girl-names", desc: "Atmospheric names that read like a mood board — sky, stone, light and quiet colour." },
      { label: "Cute Nicknames", path: "/names/cute-nicknames", desc: "Sweet nickname ideas people actually use for partners, friends and group chats." },
      { label: "Gaming Nicknames", path: "/names/gaming-nicknames", desc: "Tag ideas that hold up in a killfeed — short, pronounceable, no keyboard gymnastics." },
      { label: "Cat Names", path: "/names/cat-names", desc: "Tried-and-true cat names — the ones that roll off the tongue at 3am." },
      { label: "Cute Cat Names", path: "/names/cute-cat-names", desc: "Tiny food names, soft sounds and little nicknames made for small cats with big opinions." },
      { label: "Dog Names", path: "/names/dog-names", desc: "Dependable dog names that sound good shouted across a park." },
      { label: "Cute Dog Names", path: "/names/cute-dog-names", desc: "Short, cheerful names for puppies — easy to say, easy for a dog to learn." },
    ],
  },

  {
    slug: "symbols",
    path: "/symbols",
    kind: "hub",
    title: "Unicode Symbols for Names — Hearts & Sparkles | GainUtility",
    description:
      "Curated Unicode symbol collections for bios, nicknames and captions: hearts, sparkles, aesthetic geometry and gaming marks. Click to copy and style your name.",
    h1: "Unicode Symbols for Names & Bios",
    intro:
      "Decorative Unicode symbols that copy cleanly into profile names, bios and captions — grouped into hearts, cute florals and sparkles, minimal aesthetic geometry, and sharp gaming marks. Each collection is curated by hand and checked to paste without mangling. Click any symbol to copy it, then open the free generator to build a full styled name around it.",
    sourceType: "symbols",
    faq: [
      {
        question: "Will these symbols work in my profile name?",
        answer:
          "Most do — hearts, stars and sparkles are widely supported in display names and bios. Some apps restrict usernames to letters and numbers, so test in your app before relying on a symbol.",
      },
      {
        question: "How do I copy a symbol?",
        answer:
          "Click any symbol on this page and it copies instantly — then paste it wherever you need it. Nothing is uploaded; copying happens in your browser.",
      },
    ],
    breadcrumbs: [HOME_CRUMB, { name: "Symbols", url: "/symbols" }],
    related: [
      TOOL_LINK,
      { label: "Names", path: "/names", desc: "Curated name lists ready to copy, restyle and decorate." },
      { label: "Creator Tools", path: "/creator", desc: "Every free browser-based tool for creators on GainUtility." },
    ],
    keywords: ["unicode symbols", "symbols for names", "copy paste symbols", "decorative symbols"],
    children: [
      { label: "Heart Symbols", path: "/symbols/hearts", desc: "Text hearts that copy cleanly into bios, nicknames and captions." },
      { label: "Cute Symbols", path: "/symbols/cute", desc: "Flowers, sparkles and soft marks for adorable profile names." },
      { label: "Aesthetic Symbols", path: "/symbols/aesthetic", desc: "Minimal geometry, lines and ornaments for clean mood-board names." },
      { label: "Gaming Symbols", path: "/symbols/gaming", desc: "Sharp marks for tags, clan tags and loadout names." },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Name lists                                                       */
  /* ---------------------------------------------------------------- */

  {
    slug: "stylish-girl-names",
    path: "/names/stylish-girl-names",
    kind: "list",
    title: "Stylish Girl Names — Confident, Polished Picks | GainUtility",
    description:
      "A curated list of stylish girl names — Ava, Maeve, Sloane and more with strong vowels and clean silhouettes. Copy free or restyle any name in the generator.",
    h1: "Stylish Girl Names",
    intro:
      "Names with a confident, put-together feel — strong vowels, clean silhouettes, easy to style. This hand-picked list leans modern-classic: Sloane, Maeve and Valentina rather than trend-chasing inventions. Copy one as-is, or open the generator to try it in bold, script or small-caps styles.",
    sourceType: "names",
    sourceId: "stylish-girl-names",
    faq: [
      {
        question: "What makes a girl name feel stylish?",
        answer:
          "Confident sounds and clean spelling — strong vowels, few nicknames required, and a silhouette that looks balanced written down. Names like Sloane and Valentina carry that put-together energy.",
      },
      {
        question: "How do I make a stylish name stand out online?",
        answer:
          "Pair it with a Unicode style — small-caps, bold or script — and a heart or sparkle symbol. The free generator applies styles and symbols in one step.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Stylish Girl Names", url: "/names/stylish-girl-names" },
    ],
    related: [
      { label: "Cute Girl Names", path: "/names/cute-girl-names", desc: "Short, soft names with a sweeter energy." },
      { label: "Aesthetic Girl Names", path: "/names/aesthetic-girl-names", desc: "Atmospheric, mood-board names in the same spirit." },
      TOOL_LINK,
    ],
    keywords: ["stylish girl names", "cool girl names", "modern girl names", "chic names for girls"],
  },

  {
    slug: "cute-girl-names",
    path: "/names/cute-girl-names",
    kind: "list",
    title: "Cute Girl Names — Short & Sweet Picks | GainUtility",
    description:
      "Curated cute girl names — Mia, Rosie, Poppy, Lulu and more short, soft names. Copy any name free or restyle it in the browser-based generator.",
    h1: "Cute Girl Names",
    intro:
      "Short, soft, smile-out-loud names — the kind that look sweet on a profile or a playground. The list favors easy spellings and warm sounds: Rosie, Poppy, Maisie, Gigi. Copy one straight away, or run it through the generator for a bubbly or sparkly version.",
    sourceType: "names",
    sourceId: "cute-girl-names",
    faq: [
      {
        question: "What makes a girl name feel cute?",
        answer:
          "Usually short length, soft sounds and familiar spellings — think double letters and friendly endings like -ie or -y. Mia, Rosie and Poppy hit those notes.",
      },
      {
        question: "Can I style these names with symbols?",
        answer:
          "Yes. Wrap a name in hearts or sparkles in the free generator, or try bubble and rounded script Unicode styles for an even softer look.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Cute Girl Names", url: "/names/cute-girl-names" },
    ],
    related: [
      { label: "Stylish Girl Names", path: "/names/stylish-girl-names", desc: "A more polished, confident take on girl names." },
      { label: "Cute Nicknames", path: "/names/cute-nicknames", desc: "Sweet nickname ideas for friends and partners." },
      TOOL_LINK,
    ],
    keywords: ["cute girl names", "sweet names for girls", "short cute names", "adorable girl names"],
  },

  {
    slug: "aesthetic-girl-names",
    path: "/names/aesthetic-girl-names",
    kind: "list",
    title: "Aesthetic Girl Names — Atmospheric Mood Picks | GainUtility",
    description:
      "Curated aesthetic girl names — Iris, Luna, Wren, Vesper and more nature- and sky-toned names. Copy free or restyle any name in the generator.",
    h1: "Aesthetic Girl Names",
    intro:
      "Atmospheric names that read like a mood board — sky, stone, light and quiet colour. Iris, Luna, Wren, Vesper: names with a soft visual mood that pair well with minimal styling. Copy as-is, or try small-caps and spaced-out styles in the generator.",
    sourceType: "names",
    sourceId: "aesthetic-girl-names",
    faq: [
      {
        question: "What counts as an aesthetic name?",
        answer:
          "Names with a strong visual mood — nature words, celestial references and quiet colours that feel like they belong on a mood board.",
      },
      {
        question: "Which style suits aesthetic names best?",
        answer:
          "Light, minimal treatments work well — small-caps, thin spaced styles, or a single symbol. The free generator has all of them.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Aesthetic Girl Names", url: "/names/aesthetic-girl-names" },
    ],
    related: [
      { label: "Stylish Girl Names", path: "/names/stylish-girl-names", desc: "Confident, polished names with clean silhouettes." },
      { label: "Aesthetic Symbols", path: "/symbols/aesthetic", desc: "Minimal lines and geometry to pair with these names." },
      TOOL_LINK,
    ],
    keywords: ["aesthetic girl names", "atmospheric names", "mood board names", "soft aesthetic names"],
  },

  {
    slug: "cute-nicknames",
    path: "/names/cute-nicknames",
    kind: "list",
    title: "Cute Nicknames for Friends, Partners & Chats | GainUtility",
    description:
      "Curated cute nicknames people actually use — Bubbles, Sunshine, Peanut, Pookie and more. Copy free or restyle any nickname in the generator.",
    h1: "Cute Nicknames",
    intro:
      "Sweet nickname ideas people actually use for partners, friends and group chats. The list stays playful but usable — Bubbles, Sunshine, Pickles, Pookie — nothing forced. Copy one, or open the generator to wrap it in hearts or a bubbly font.",
    sourceType: "names",
    sourceId: "cute-nicknames",
    faq: [
      {
        question: "Are these nicknames only for couples?",
        answer:
          "No — plenty work for friends, group chats and usernames too. Pick the ones that fit your dynamic and leave the rest.",
      },
      {
        question: "Can I make a nickname look cuter?",
        answer:
          "Yes — add a heart symbol or a soft Unicode style like bubble or rounded script. The free generator does it in one click.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Cute Nicknames", url: "/names/cute-nicknames" },
    ],
    related: [
      { label: "Cute Girl Names", path: "/names/cute-girl-names", desc: "Short, sweet names that double as nicknames." },
      { label: "Gaming Nicknames", path: "/names/gaming-nicknames", desc: "A sharper take on online handles." },
      TOOL_LINK,
    ],
    keywords: ["cute nicknames", "sweet nicknames", "nickname ideas", "cute names for her"],
  },

  {
    slug: "gaming-nicknames",
    path: "/names/gaming-nicknames",
    kind: "list",
    title: "Gaming Nicknames — Sharp Tags for Killfeeds | GainUtility",
    description:
      "Curated gaming nicknames — Shadow, Viper, Blitz, Wraith and more short, pronounceable tags. Copy free or restyle any tag in the generator.",
    h1: "Gaming Nicknames",
    intro:
      "Tag ideas that hold up in a killfeed — short, pronounceable, no keyboard gymnastics. Shadow, Viper, Blitz, Wraith: names you can call out loud and type fast. Copy one, or dress it up with gaming symbols and bold styles in the generator.",
    sourceType: "names",
    sourceId: "gaming-nicknames",
    faq: [
      {
        question: "How do I check if a gaming name is taken?",
        answer:
          "Each game has its own namespace — try the name in-game or on the platform's change-name screen. Copying here is free; availability isn't something we can check for you.",
      },
      {
        question: "Can I add symbols to a gaming name?",
        answer:
          "Some games allow them. Pick a symbol from the gaming collection and test it in your game — support varies by title.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Gaming Nicknames", url: "/names/gaming-nicknames" },
    ],
    related: [
      { label: "Gaming Symbols", path: "/symbols/gaming", desc: "Sharp marks built for tags and clan tags." },
      { label: "Cute Nicknames", path: "/names/cute-nicknames", desc: "A softer alternative for casual handles." },
      TOOL_LINK,
    ],
    keywords: ["gaming nicknames", "cool gamer names", "gaming tags", "username ideas for games"],
  },

  {
    slug: "cat-names",
    path: "/names/cat-names",
    kind: "list",
    title: "Cat Names — Tried-and-True Picks for Cats | GainUtility",
    description:
      "Curated cat names — Whiskers, Luna, Oliver, Binx and more names that roll off the tongue. Copy free or style any name in the generator.",
    h1: "Cat Names",
    intro:
      "Tried-and-true cat names — the ones that roll off the tongue at 3am. Classics like Luna, Oliver and Binx sit next to everyday favorites. Copy one, or style it with a few sparkle symbols in the generator for your cat's profile.",
    sourceType: "names",
    sourceId: "cat-names",
    faq: [
      {
        question: "How do I pick a name my cat will respond to?",
        answer:
          "Cats pick up on short names with crisp sounds — one or two syllables work best. Say the shortlist out loud a few times before committing.",
      },
      {
        question: "Can I make a styled name for my cat's social account?",
        answer:
          "Yes — many cats have their own profiles. Restyle any name with emoji, symbols and Unicode fonts in the free generator.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Cat Names", url: "/names/cat-names" },
    ],
    related: [
      { label: "Cute Cat Names", path: "/names/cute-cat-names", desc: "Tiny food names and soft sounds for small cats." },
      { label: "Dog Names", path: "/names/dog-names", desc: "Dependable names for the other end of the leash." },
      TOOL_LINK,
    ],
    keywords: ["cat names", "kitten names", "names for cats", "cute cat name ideas"],
  },

  {
    slug: "cute-cat-names",
    path: "/names/cute-cat-names",
    kind: "list",
    title: "Cute Cat Names — Tiny Food & Soft-Sound Picks | GainUtility",
    description:
      "Curated cute cat names — Bean, Mochi, Waffles, Boba and more tiny food and soft-sound names. Copy free or style any name in the generator.",
    h1: "Cute Cat Names",
    intro:
      "Tiny food names, soft sounds and little nicknames made for small cats with big opinions. Mochi, Waffles, Boba, Tofu — names as small and sweet as the cat. Copy one, or wrap it in hearts in the generator.",
    sourceType: "names",
    sourceId: "cute-cat-names",
    faq: [
      {
        question: "Do food names work well for cats?",
        answer:
          "They're popular for a reason — short, easy to say and usually unique at the vet's office. Mochi, Waffles and Boba are easy wins.",
      },
      {
        question: "Can I copy these names directly?",
        answer:
          "Yes — click any name on this page to copy it. For styled versions with symbols or fonts, open the free generator.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Cute Cat Names", url: "/names/cute-cat-names" },
    ],
    related: [
      { label: "Cat Names", path: "/names/cat-names", desc: "Classic cat names that have stood the test of time." },
      { label: "Cute Dog Names", path: "/names/cute-dog-names", desc: "The puppy-side equivalent." },
      TOOL_LINK,
    ],
    keywords: ["cute cat names", "food names for cats", "kitten names cute", "adorable cat names"],
  },

  {
    slug: "dog-names",
    path: "/names/dog-names",
    kind: "list",
    title: "Dog Names — Dependable Names That Carry | GainUtility",
    description:
      "Curated dog names — Buddy, Max, Cooper, Rocky and more names that sound good shouted across a park. Copy free or style any name in the generator.",
    h1: "Dog Names",
    intro:
      "Dependable dog names that sound good shouted across a park. Buddy, Max, Cooper, Rocky — clear consonants that carry at distance. Copy one, or try a styled version for your dog's profile in the generator.",
    sourceType: "names",
    sourceId: "dog-names",
    faq: [
      {
        question: "What makes a good dog name for training?",
        answer:
          "Two syllables or fewer with a hard consonant cuts through noise — dogs respond to crisp sounds more cleanly than flowing ones.",
      },
      {
        question: "Can I use these names for a new puppy?",
        answer:
          "Absolutely. Say the shortlist out loud and see which one your household actually uses — that's usually the winner.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Dog Names", url: "/names/dog-names" },
    ],
    related: [
      { label: "Cute Dog Names", path: "/names/cute-dog-names", desc: "Short, cheerful picks made for puppies." },
      { label: "Cat Names", path: "/names/cat-names", desc: "Tried-and-true names for cats." },
      TOOL_LINK,
    ],
    keywords: ["dog names", "puppy names", "names for dogs", "classic dog names"],
  },

  {
    slug: "cute-dog-names",
    path: "/names/cute-dog-names",
    kind: "list",
    title: "Cute Dog Names — Short Puppy Picks | GainUtility",
    description:
      "Curated cute dog names — Bean, Biscuit, Waffles, Nugget and more short, cheerful puppy names. Copy free or style any name in the generator.",
    h1: "Cute Dog Names",
    intro:
      "Short, cheerful names for puppies — easy to say, easy for a dog to learn. Bean, Biscuit, Waffles, Nugget: playful but practical. Copy one, or decorate it with symbols in the generator.",
    sourceType: "names",
    sourceId: "cute-dog-names",
    faq: [
      {
        question: "How short should a puppy name be?",
        answer:
          "One or two syllables is the sweet spot — short names are faster to say and easier for puppies to learn while training.",
      },
      {
        question: "Can I use these for my puppy's profile?",
        answer:
          "Yes — click any name to copy it. The generator can add emoji and fonts if you want a styled handle for social accounts.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Names", url: "/names" },
      { name: "Cute Dog Names", url: "/names/cute-dog-names" },
    ],
    related: [
      { label: "Dog Names", path: "/names/dog-names", desc: "Classic names that carry across a park." },
      { label: "Cute Cat Names", path: "/names/cute-cat-names", desc: "Tiny food names for feline friends." },
      TOOL_LINK,
    ],
    keywords: ["cute dog names", "puppy names", "short dog names", "adorable puppy names"],
  },

  /* ---------------------------------------------------------------- */
  /* Symbol collections                                               */
  /* ---------------------------------------------------------------- */

  {
    slug: "hearts",
    path: "/symbols/hearts",
    kind: "symbols",
    title: "Heart Symbols — Copy-Paste Hearts for Bios | GainUtility",
    description:
      "Curated heart symbols — ♥ ♡ ❤ ❥ 💕 and more text-safe hearts for bios, nicknames and captions. Click to copy, then style your name free.",
    h1: "Heart Symbols",
    intro:
      "Text hearts that copy cleanly into bios, nicknames and captions — from the classic ♥ and ♡ to colorful emoji hearts like 🩷 and 💜. Click any heart to copy it, then paste it into your name or caption. Want a full name built around a heart? The free generator wraps your text in hearts and fonts.",
    sourceType: "symbols",
    sourceId: "hearts",
    faq: [
      {
        question: "What's the difference between ♥ and ❤?",
        answer:
          "♥ is a plain text heart that pastes almost anywhere; ❤ (and ❤️ with color) is an emoji-style heart that renders differently across apps.",
      },
      {
        question: "Can I put a heart in my username?",
        answer:
          "It depends on the platform — some allow symbols in display names but not handles. Test in your app; copying here is instant either way.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Symbols", url: "/symbols" },
      { name: "Heart Symbols", url: "/symbols/hearts" },
    ],
    related: [
      { label: "Cute Symbols", path: "/symbols/cute", desc: "Flowers and sparkles for a softer look." },
      { label: "Cute Nicknames", path: "/names/cute-nicknames", desc: "Nickname ideas that pair well with a heart." },
      TOOL_LINK,
    ],
    keywords: ["heart symbols", "copy paste hearts", "heart text symbols", "love symbols for bios"],
  },

  {
    slug: "cute",
    path: "/symbols/cute",
    kind: "symbols",
    title: "Cute Symbols — Sparkles, Flowers & Soft Marks | GainUtility",
    description:
      "Curated cute symbols — ✿ ❀ ✧ 🌸 🎀 and more sparkles and florals for adorable profile names. Click to copy, then style your name free.",
    h1: "Cute Symbols",
    intro:
      "Flowers, sparkles and soft marks for adorable profile names — ✿ ❀ ✧ ✦ plus 🌸 and 🎀 emoji. Every mark is picked to paste cleanly into bios and nicknames. Click to copy, then build a full cute name in the generator.",
    sourceType: "symbols",
    sourceId: "cute",
    faq: [
      {
        question: "Do these symbols work in Instagram or TikTok bios?",
        answer:
          "Most do — bios generally accept Unicode symbols. Usernames are stricter and often limited to letters and numbers.",
      },
      {
        question: "How many symbols should I add to a name?",
        answer:
          "One or two is usually plenty — it keeps the name readable while still showing personality. The generator lets you preview before committing.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Symbols", url: "/symbols" },
      { name: "Cute Symbols", url: "/symbols/cute" },
    ],
    related: [
      { label: "Heart Symbols", path: "/symbols/hearts", desc: "Classic hearts for bios and captions." },
      { label: "Cute Girl Names", path: "/names/cute-girl-names", desc: "Sweet names to pair with these marks." },
      TOOL_LINK,
    ],
    keywords: ["cute symbols", "sparkle symbols", "flower symbols", "kawaii symbols for names"],
  },

  {
    slug: "aesthetic",
    path: "/symbols/aesthetic",
    kind: "symbols",
    title: "Aesthetic Symbols — Minimal Lines & Geometry | GainUtility",
    description:
      "Curated aesthetic symbols — ─ ◇ ✦ ∞ and minimal lines, geometry and ornaments for clean mood-board names. Click to copy, then style free.",
    h1: "Aesthetic Symbols",
    intro:
      "Minimal geometry, lines and ornaments for clean mood-board names — ─ ═ ░ ◇ ✦ ∞ and quiet marks from other scripts. Designed for restrained styling: one or two symbols, plenty of space. Click to copy, then pair with a light font style in the generator.",
    sourceType: "symbols",
    sourceId: "aesthetic",
    faq: [
      {
        question: "How do I use line symbols in a name?",
        answer:
          "Place a short line or divider between words — for example first name ─ last name. Restraint keeps it readable, so one divider is usually enough.",
      },
      {
        question: "Will these symbols paste into my bio?",
        answer:
          "Yes — they're standard Unicode, so they paste into bios, captions and notes. Some apps restrict symbols in actual usernames only.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Symbols", url: "/symbols" },
      { name: "Aesthetic Symbols", url: "/symbols/aesthetic" },
    ],
    related: [
      { label: "Aesthetic Girl Names", path: "/names/aesthetic-girl-names", desc: "Atmospheric names that match this restrained style." },
      { label: "Gaming Symbols", path: "/symbols/gaming", desc: "A sharper, high-contrast alternative." },
      TOOL_LINK,
    ],
    keywords: ["aesthetic symbols", "minimal symbols", "unicode lines for names", "decorative text symbols"],
  },

  {
    slug: "gaming",
    path: "/symbols/gaming",
    kind: "symbols",
    title: "Gaming Symbols — Sharp Marks for Tags & Clans | GainUtility",
    description:
      "Curated gaming symbols — ✪ ⚔ ☠ ⚡ and sharp marks for tags, clan tags and loadout names. Click to copy, then style your tag free.",
    h1: "Gaming Symbols",
    intro:
      "Sharp marks for tags, clan tags and loadout names — ✪ ⚔ ⚑ ☠ ⚡ and angular geometry that reads well at small sizes. Click any symbol to copy it for your in-game tag. Pair it with a bold style in the generator to finish the look — and remember, symbol support varies by game.",
    sourceType: "symbols",
    sourceId: "gaming",
    faq: [
      {
        question: "Do games allow symbols in usernames?",
        answer:
          "Some do, many don't — and the allowed set varies per title. Copy a symbol and test it in your game's name-change screen before building a tag around it.",
      },
      {
        question: "Can I combine symbols with a styled name?",
        answer:
          "Yes — the generator wraps your tag in bold or spaced styles and adds symbols in one step, so you can preview the whole thing first.",
      },
    ],
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Symbols", url: "/symbols" },
      { name: "Gaming Symbols", url: "/symbols/gaming" },
    ],
    related: [
      { label: "Gaming Nicknames", path: "/names/gaming-nicknames", desc: "Short, pronounceable tag ideas." },
      { label: "Aesthetic Symbols", path: "/symbols/aesthetic", desc: "Minimal lines for a cleaner look." },
      TOOL_LINK,
    ],
    keywords: ["gaming symbols", "symbols for gamertags", "clan tag symbols", "unicode gaming symbols"],
  },
];

/** Lookup by slug or path (both keys point at the same entry). */
export const LIBRARY_PAGE_MAP: Record<string, LibraryPageEntry> = {};
for (const page of ALL_LIBRARY_PAGES) {
  LIBRARY_PAGE_MAP[page.slug] = page;
  LIBRARY_PAGE_MAP[page.path] = page;
}

/** Every library page path, for the sitemap and prerenderer. */
export const ALL_LIBRARY_PATHS: string[] = ALL_LIBRARY_PAGES.map((p) => p.path);
